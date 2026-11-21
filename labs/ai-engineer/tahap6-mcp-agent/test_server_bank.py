"""Test MCP server lewat Client in-memory: protokol asli, tanpa proses terpisah dan tanpa jaringan."""
import anyio
import pytest
from mcp import Client

import server_bank as sb


def jalankan(fungsi):
    return anyio.run(fungsi)


@pytest.fixture(autouse=True)
def reset_kartu():
    asli = {k: dict(v) for k, v in sb.KARTU.items()}
    yield
    sb.KARTU.clear()
    sb.KARTU.update(asli)


def test_daftar_tool_dan_anotasi():
    async def uji():
        async with Client(sb.mcp) as c:
            return {t.name: t for t in (await c.list_tools()).tools}

    tools = jalankan(uji)
    assert set(tools) == {"cek_status_transfer", "cek_status_kartu", "blokir_kartu"}
    assert tools["cek_status_transfer"].annotations.read_only_hint is True
    assert tools["blokir_kartu"].annotations.destructive_hint is True
    assert tools["blokir_kartu"].input_schema["properties"]["alasan"]["enum"][0] == "hilang"
    assert tools["cek_status_transfer"].output_schema is not None        # structured output dari model Pydantic


def test_cek_transfer_terstruktur_dan_tersamarkan():
    async def uji():
        async with Client(sb.mcp) as c:
            return await c.call_tool("cek_status_transfer", {"nomor_referensi": "ft2611150042"})

    hasil = jalankan(uji)
    assert not hasil.is_error
    data = hasil.structured_content
    assert data["status"] == "gagal" and data["nominal_rupiah"] == 1_750_000
    assert data["rekening_tujuan"] == "BCA ****8812"


@pytest.mark.parametrize("argumen", [{"nomor_referensi": "x'; DROP TABLE--"}, {"nomor_referensi": "FT0000000000"}])
def test_input_buruk_menjadi_error_tool_bukan_crash(argumen):
    async def uji():
        async with Client(sb.mcp) as c:
            return await c.call_tool("cek_status_transfer", argumen)

    assert jalankan(uji).is_error is True                              # model melihat pesan error dan bisa memperbaiki


def test_blokir_kartu_idempoten_dan_menolak_nomor_lengkap():
    async def uji():
        async with Client(sb.mcp) as c:
            a = await c.call_tool("blokir_kartu", {"empat_digit_terakhir": "4421", "alasan": "hilang"})
            b = await c.call_tool("blokir_kartu", {"empat_digit_terakhir": "4421", "alasan": "hilang"})
            lengkap = await c.call_tool("blokir_kartu", {"empat_digit_terakhir": "4111111111114421", "alasan": "hilang"})
            alasan_aneh = await c.call_tool("blokir_kartu", {"empat_digit_terakhir": "9034", "alasan": "iseng"})
            return a, b, lengkap, alasan_aneh

    a, b, lengkap, alasan_aneh = jalankan(uji)
    assert a.structured_content["status"] == b.structured_content["status"] == "diblokir"
    assert lengkap.is_error and alasan_aneh.is_error
    assert sb.KARTU["9034"]["status"] == "aktif"


def test_resource_sop_dan_path_traversal():
    async def uji():
        async with Client(sb.mcp) as c:
            templat = [t.uri_template for t in (await c.list_resource_templates()).resource_templates]
            isi = await c.read_resource("sop://transfer-gagal")
            try:
                await c.read_resource("sop://..%2F..%2Fserver_bank")
                bocor = True
            except Exception:
                bocor = False
            return templat, isi, bocor

    templat, isi, bocor = jalankan(uji)
    assert templat == ["sop://{nama}"]
    assert "BI-FAST" in isi.contents[0].text
    assert bocor is False


def test_prompt_menyisipkan_keluhan():
    async def uji():
        async with Client(sb.mcp) as c:
            return await c.get_prompt("tanggapi_keluhan", {"keluhan": "kartu saya hilang"})

    hasil = jalankan(uji)
    assert "kartu saya hilang" in hasil.messages[0].content.text
