"""Proyek Tahap 4: preferensi nasabah di giliran pertama harus tetap dipakai setelah 40 giliran.

Penghitung token tiruan (1 token per 4 karakter) dan client palsu, jadi test tidak memanggil API.
"""
import json

import anthropic
import httpx2

import konteks as k

SISTEM = "Kamu asisten layanan nasabah Bank Nusantara. " * 20


def hitung_tiruan(system, messages):
    return (sum(len(b["text"]) for b in system) + sum(len(m["content"]) for m in messages)) // 4


def percakapan_panjang(n=40):
    riwayat = [{"role": "user", "content": "Mulai sekarang jawab dalam bahasa Inggris ya, rekening utama saya yang berakhiran 4421."},
               {"role": "assistant", "content": "Sure, noted."}]
    for i in range(n):
        riwayat += [{"role": "user", "content": f"Pertanyaan ke-{i} tentang mutasi rekening bulan lalu, tolong rinci."},
                    {"role": "assistant", "content": f"Here are the details for question {i}: " + "lorem " * 30}]
    return riwayat


def test_potong_naif_kehilangan_preferensi():
    terpilih = k.potong_naif(SISTEM, percakapan_panjang(), 1_500, hitung_tiruan)
    teks = " ".join(m["content"] for m in terpilih)
    assert "4421" not in teks and "Inggris" not in teks             # fakta penting ikut terbuang


def test_memori_mempertahankan_preferensi_dalam_anggaran():
    memori = k.Memori()
    memori.perbarui([k.Fakta(kunci="bahasa_jawaban", nilai="Inggris"),
                     k.Fakta(kunci="rekening_utama", nilai="berakhiran 4421")])
    system = k.susun_system(SISTEM, memori, ringkasan="Nasabah menanyakan mutasi bulan lalu.")
    terpilih, terbuang = k.pilih_riwayat(system, percakapan_panjang(), 1_500, hitung_tiruan)
    assert hitung_tiruan(system, terpilih) <= 1_500
    assert terpilih[0]["role"] == "user" and terbuang
    assert "4421" in system[1]["text"] and "Inggris" in system[1]["text"]


def test_bagian_tetap_di_depan_dan_dicache():
    system = k.susun_system(SISTEM, k.Memori(), "")
    assert system[0]["text"] == SISTEM and system[0]["cache_control"] == {"type": "ephemeral"}
    assert "cache_control" not in system[1]                         # bagian yang berubah tidak ditandai


def test_fakta_terbaru_menimpa_yang_lama():
    m = k.Memori()
    m.perbarui([k.Fakta(kunci="bahasa_jawaban", nilai="Inggris")])
    m.perbarui([k.Fakta(kunci="bahasa_jawaban", nilai="Indonesia")])
    assert m.fakta == {"bahasa_jawaban": "Indonesia"}


def test_alur_kirim_meringkas_giliran_terbuang():
    """Client SDK asli dengan transport palsu: jawab sesuai jenis request (ekstraksi, ringkasan, jawaban)."""
    tercatat = []

    def handler(req):
        body = json.loads(req.content)
        tercatat.append(body)
        if body.get("output_config", {}).get("format"):
            teks = json.dumps({"fakta": [{"kunci": "bahasa_jawaban", "nilai": "Inggris"}]}) if "Inggris" in req.content.decode() else '{"fakta": []}'
        elif body["model"] == k.MODEL_MURAH:
            teks = "Nasabah menanyakan mutasi rekening berulang kali."
        else:
            teks = "Here are the details."
        return httpx2.Response(200, json={
            "id": "m", "type": "message", "role": "assistant", "model": body["model"],
            "content": [{"type": "text", "text": teks}], "stop_reason": "end_turn", "stop_sequence": None,
            "usage": {"input_tokens": 10, "output_tokens": 5, "cache_read_input_tokens": 0,
                      "cache_creation_input_tokens": 0}})

    client = anthropic.Anthropic(api_key="uji", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    p = k.Percakapan(client, SISTEM, anggaran_input=450)
    p.kirim("Tolong jawab dalam bahasa Inggris.", hitung=hitung_tiruan)
    for i in range(12):
        p.kirim(f"Pertanyaan ke-{i} tentang mutasi rekening bulan lalu, tolong rinci ya.", hitung=hitung_tiruan)
    assert p.memori.fakta == {"bahasa_jawaban": "Inggris"}
    assert p.ringkasan.startswith("Nasabah menanyakan")
    jawaban_utama = [b for b in tercatat if b["model"] == k.MODEL]
    terakhir = jawaban_utama[-1]
    assert "Inggris" in terakhir["system"][1]["text"]               # preferensi tetap sampai ke model
    assert hitung_tiruan(terakhir["system"], terakhir["messages"]) <= 450
    assert terakhir["messages"][0]["role"] == "user"
