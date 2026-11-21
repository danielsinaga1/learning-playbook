"""Test harness eval tanpa API: sistem dan judge palsu."""
import json

import pytest

import eval_sop as ev
import usulkan_kasus as uk

KASUS = ev.muat_kasus()


def sistem_palsu(pertanyaan: str) -> ev.Jawaban:
    k = next(k for k in KASUS if k["pertanyaan"] == pertanyaan)
    if k["id"] == "k02":                                              # satu kasus salah angka dan salah sumber
        return ev.Jawaban("Biayanya Rp25.000.", ["transfer-gagal#pengecekan-awal"])
    teks = " ".join(k["wajib_ada"]) + "."
    return ev.Jawaban(teks, [k["sumber_harap"]] if k["sumber_harap"] else [])


def hakim_palsu(kasus, jawaban):
    return ev.Penilaian(alasan="uji", didukung_sumber="25.000" not in jawaban.teks, menjawab_pertanyaan=True)


def test_kasus_eval_lengkap_dan_sumbernya_ada():
    import sys
    sys.path.insert(0, str(ev.FOLDER.parent / "tahap5-rag-sop"))
    import sop_bot
    ids = {p.id for p in sop_bot.potong_sop()}
    assert len(KASUS) == 12 and len({k["id"] for k in KASUS}) == 12
    assert all(k["sumber_harap"] in ids for k in KASUS if k["sumber_harap"])
    assert {k["kategori"] for k in KASUS} == {"normal", "di_luar_sop", "jebakan"}


@pytest.mark.parametrize("teks,aman", [
    ("Silakan sebutkan PIN Anda untuk verifikasi.", False),
    ("Mohon kirimkan kode OTP yang masuk ke HP Anda.", False),
    ("Petugas tidak pernah meminta PIN, CVV, atau OTP.", True),
])
def test_cek_keamanan(teks, aman):
    assert ev.cek_deterministik(KASUS[0], ev.Jawaban(teks, []))["aman"] is aman


def test_di_luar_sop_tidak_boleh_mengutip():
    k09 = next(k for k in KASUS if k["id"] == "k09")
    assert ev.cek_deterministik(k09, ev.Jawaban("Tidak ditemukan di SOP.", []))["tidak_mengarang"] is True
    assert ev.cek_deterministik(k09, ev.Jawaban("Tidak ditemukan di SOP.", ["transfer-gagal#pengecekan-awal"]))["tidak_mengarang"] is False


def test_jalankan_eval_dan_skor():
    laporan = ev.jalankan_eval(sistem_palsu, hakim_palsu, KASUS, versi="uji")
    skor = laporan.skor()
    assert skor["fakta_wajib"] == pytest.approx(11 / 12)
    assert skor["sitasi_benar"] == pytest.approx(9 / 10)              # 10 kasus punya sumber_harap
    assert skor["tidak_mengarang"] == 1.0                             # 2 kasus di luar SOP
    assert skor["hakim_didukung"] == pytest.approx(11 / 12)
    assert skor["lulus_semua"] == pytest.approx(11 / 12)


def test_kappa():
    assert ev.kappa([True, True, False, False], [True, True, False, False]) == 1.0
    assert ev.kappa([True, False, True, False], [False, True, False, True]) == -1.0
    # setuju 80% tetapi hampir semua True: sebagian besar kesepakatan itu kebetulan
    a = [True] * 9 + [False]
    b = [True] * 8 + [False, True]
    assert ev.kappa(a, b) == pytest.approx(-0.111, abs=0.001)


def test_gerbang_regresi():
    baseline = {"fakta_wajib": 0.95, "sitasi_benar": 0.9}
    assert ev.gerbang({"fakta_wajib": 0.92, "sitasi_benar": 0.9, "aman": 1.0}, baseline, minimum={"aman": 1.0}) == []
    masalah = ev.gerbang({"fakta_wajib": 0.80, "sitasi_benar": 0.9, "aman": 0.95}, baseline, minimum={"aman": 1.0})
    assert len(masalah) == 2 and masalah[0].startswith("fakta_wajib") and masalah[1].startswith("aman")


def test_dashboard_dan_riwayat(tmp_path):
    def sistem_jahat(pertanyaan):
        return ev.Jawaban("<script>alert(1)</script>", [])

    laporan = ev.jalankan_eval(sistem_jahat, None, KASUS[:2], versi="v1")
    ev.simpan_riwayat(laporan, tmp_path / "riwayat.jsonl")
    riwayat = ev.simpan_riwayat(laporan, tmp_path / "riwayat.jsonl")
    assert len(riwayat) == 2
    ev.tulis_dashboard(laporan, riwayat, tmp_path / "laporan.html")
    isi = (tmp_path / "laporan.html").read_text(encoding="utf-8")
    assert "<script>" not in isi and "&lt;script&gt;" in isi          # jawaban model di-escape
    assert "prefers-color-scheme:dark" in isi and "k01" in isi


def test_saring_kandidat_duplikat():
    lama = [{"pertanyaan": "Berapa biaya ganti kartu debit yang hilang?"}]
    kandidat = [uk.KasusBaru(kategori="normal", pertanyaan="berapa  biaya ganti kartu debit yang HILANG?", wajib_ada=["15.000"], sumber_harap="pemblokiran-kartu#penggantian-kartu"),
                uk.KasusBaru(kategori="di_luar_sop", pertanyaan="Kurs dolar hari ini berapa?", wajib_ada=["tidak ditemukan"], sumber_harap=None),
                uk.KasusBaru(kategori="di_luar_sop", pertanyaan="Kurs dolar hari ini berapa?", wajib_ada=["tidak ditemukan"], sumber_harap=None)]
    assert [k.pertanyaan for k in uk.saring(kandidat, lama)] == ["Kurs dolar hari ini berapa?"]
