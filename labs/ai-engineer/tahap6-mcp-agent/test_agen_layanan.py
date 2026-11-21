"""Test loop agen: Claude diganti transport palsu yang memutar skenario; MCP server asli in-memory."""
import json

import anthropic
import anyio
import httpx2
import pytest

import agen_layanan as ag
import server_bank as sb


@pytest.fixture(autouse=True)
def reset_kartu():
    asli = {k: dict(v) for k, v in sb.KARTU.items()}
    yield
    sb.KARTU.clear()
    sb.KARTU.update(asli)


def pesan(content, stop_reason):
    return {"id": "m", "type": "message", "role": "assistant", "model": ag.MODEL, "content": content,
            "stop_reason": stop_reason, "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1}}


def skenario(*langkah):
    """Setiap request ke Claude mendapat respons berikutnya dari daftar; request dicatat."""
    tercatat = []

    def handler(req):
        tercatat.append(json.loads(req.content))
        return httpx2.Response(200, json=langkah[len(tercatat) - 1])

    client = anthropic.Anthropic(api_key="uji", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    return client, tercatat


def pakai_tool(nama, argumen, id_="tu_1"):
    return pesan([{"type": "tool_use", "id": id_, "name": nama, "input": argumen}], "tool_use")


def test_tool_baca_dijalankan_tanpa_persetujuan():
    client, log = skenario(pakai_tool("cek_status_transfer", {"nomor_referensi": "FT2611150042"}),
                           pesan([{"type": "text", "text": "Transfer gagal, dana kembali maks. 1 hari kerja."}], "end_turn"))
    ditanya = []
    jawaban = anyio.run(ag.jalankan_agen, client, "cek transfer", lambda n, a: ditanya.append(n) or True)
    assert jawaban.startswith("Transfer gagal") and ditanya == []
    assert {t["name"] for t in log[0]["tools"]} == {"cek_status_transfer", "cek_status_kartu", "blokir_kartu"}
    hasil_tool = log[1]["messages"][2]["content"][0]
    assert hasil_tool["type"] == "tool_result" and json.loads(hasil_tool["content"])["status"] == "gagal"


def test_tool_destruktif_ditolak_petugas():
    client, log = skenario(pakai_tool("blokir_kartu", {"empat_digit_terakhir": "4421", "alasan": "hilang"}),
                           pesan([{"type": "text", "text": "Baik, kartu tidak diblokir."}], "end_turn"))
    anyio.run(ag.jalankan_agen, client, "blokir kartu", lambda n, a: False)
    assert sb.KARTU["4421"]["status"] == "aktif"                      # tidak terjadi apa-apa di sistem
    assert log[1]["messages"][2]["content"][0]["is_error"] is True


def test_tool_destruktif_disetujui():
    client, _ = skenario(pakai_tool("blokir_kartu", {"empat_digit_terakhir": "4421", "alasan": "hilang"}),
                         pesan([{"type": "text", "text": "Kartu ****4421 sudah diblokir."}], "end_turn"))
    anyio.run(ag.jalankan_agen, client, "blokir kartu", lambda n, a: True)
    assert sb.KARTU["4421"]["status"] == "diblokir"


def test_error_tool_dikembalikan_ke_model():
    client, log = skenario(pakai_tool("cek_status_transfer", {"nomor_referensi": "salah format!"}),
                           pesan([{"type": "text", "text": "Mohon nomor referensi yang benar."}], "end_turn"))
    anyio.run(ag.jalankan_agen, client, "cek", lambda n, a: True)
    assert log[1]["messages"][2]["content"][0]["is_error"] is True


def test_batas_langkah_mencegah_loop_tanpa_akhir():
    langkah = [pakai_tool("cek_status_kartu", {"empat_digit_terakhir": "4421"}, f"tu_{i}") for i in range(ag.BATAS_LANGKAH)]
    client, log = skenario(*langkah)
    assert "Batas langkah" in anyio.run(ag.jalankan_agen, client, "cek", lambda n, a: True)
    assert len(log) == ag.BATAS_LANGKAH
