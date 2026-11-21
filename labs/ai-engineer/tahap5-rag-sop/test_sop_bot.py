"""Test pemotongan, retrieval, dan sitasi. Retrieval memakai Chroma lokal; Claude diganti transport palsu."""
import json

import anthropic
import httpx2
import pytest

import sop_bot as s


@pytest.fixture(scope="module")
def indeks():
    return s.Indeks(s.potong_sop())


@pytest.fixture(scope="module")
def data_uji():
    return [json.loads(b) for b in s.DATA_UJI.read_text(encoding="utf-8").splitlines() if b.strip()]


def test_potongan_per_heading_dengan_judul_dokumen():
    potongan = s.potong_sop()
    assert len(potongan) == 15
    p = next(p for p in potongan if p.id == "transfer-gagal#status-gagal-tetapi-saldo-terdebit")
    assert p.judul.startswith("SOP Penanganan Transfer") and "1 hari kerja" in p.teks
    assert len({p.id for p in potongan}) == 15                          # id unik = sitasi tidak ambigu


def test_setiap_label_uji_menunjuk_potongan_yang_ada(data_uji):
    ids = {p.id for p in s.potong_sop()}
    assert all(d["sumber"] in ids for d in data_uji)


def test_bm25_menangkap_istilah_persis():
    bm = s.BM25(["transfer lewat BI-FAST masuk dalam detik", "kartu tertelan mesin ATM", "biaya ganti kartu"])
    skor = bm.skor("status BI-FAST pending")
    assert skor.index(max(skor)) == 0


def test_gerbang_kualitas_retrieval(indeks, data_uji):
    # gerbang regresi: ubah chunking/embedding boleh, asal hit@3 hibrida tidak turun di bawah 90%
    assert s.hit_at_k(indeks.hibrida, data_uji, 3) >= 0.9


def test_blok_search_result_dan_render_sitasi(indeks):
    potongan = indeks.ambil(["transfer-gagal#status-gagal-tetapi-saldo-terdebit"])
    blok = s.blok_search_result(potongan)[0]
    assert blok["type"] == "search_result" and blok["citations"] == {"enabled": True}
    assert set(blok) <= set(anthropic.types.SearchResultBlockParam.__annotations__)

    tercatat = []

    def handler(req):
        tercatat.append(json.loads(req.content))
        lokasi = {"type": "search_result_location", "cited_text": "Dana dikembalikan otomatis ...",
                  "search_result_index": 0, "source": potongan[0].id, "title": potongan[0].judul,
                  "start_block_index": 0, "end_block_index": 0}
        return httpx2.Response(200, json={
            "id": "m", "type": "message", "role": "assistant", "model": s.MODEL,
            "content": [{"type": "text", "text": "Dana kembali otomatis paling lambat 1 hari kerja", "citations": [lokasi]},
                        {"type": "text", "text": ". Jika belum, buat tiket investigasi prioritas tinggi.", "citations": None}],
            "stop_reason": "end_turn", "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1}})

    client = anthropic.Anthropic(api_key="uji", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    teks = s.render(s.jawab(client, indeks, "transfer gagal tapi saldo terpotong"))
    assert teks.startswith("Dana kembali otomatis paling lambat 1 hari kerja[1]. Jika belum")
    assert teks.endswith("Sumber:\n[1] transfer-gagal#status-gagal-tetapi-saldo-terdebit")
    isi = tercatat[0]["messages"][0]["content"]
    assert [b["type"] for b in isi] == ["search_result"] * 3 + ["text"]   # sumber dulu, pertanyaan terakhir
    assert all("citations" not in b for b in isi if b["type"] == "text")   # 2026-10-21: teks user tanpa citations


def test_render_tanpa_sitasi_memberi_peringatan():
    pesan = anthropic.types.Message.model_validate({
        "id": "m", "type": "message", "role": "assistant", "model": s.MODEL,
        "content": [{"type": "text", "text": "Tidak ditemukan di SOP."}],
        "stop_reason": "end_turn", "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1}})
    assert "periksa manual" in s.render(pesan)
