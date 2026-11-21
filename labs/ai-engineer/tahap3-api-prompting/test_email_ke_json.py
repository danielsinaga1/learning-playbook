"""Test logika evaluasi dan data tanpa memanggil model."""
import pytest

import email_ke_json as e


def test_data_berlabel_valid_terhadap_skema():
    data = e.muat_data()
    assert len(data) == 12
    for d in data:
        e.Ekstraksi.model_validate(d["label"])                  # label sendiri harus lolos skema
    assert {d["label"]["jenis"] for d in data} == set(e.Ekstraksi.model_fields["jenis"].annotation.__args__)


def test_contoh_few_shot_tidak_bocor_ke_data_uji():
    data = e.muat_data()
    e.cek_kebocoran(data)
    with pytest.raises(ValueError):
        e.cek_kebocoran(data + [{"email": e.CONTOH[0][0]}])
    for _, j in e.CONTOH:
        e.Ekstraksi.model_validate(j)


def test_alasan_ditulis_sebelum_jawaban():
    # urutan field = urutan model menulis; alasan harus lebih dulu agar benar-benar menjadi "berpikir dulu"
    assert list(e.EkstraksiDenganAlasan.model_fields) == ["alasan", "hasil"]


def test_akurasi_per_field():
    data = e.muat_data()
    label = {d["email"]: d["label"] for d in data}

    def hampir_benar(email):                                    # salah di 2 email, masing-masing 1 field
        hasil = dict(label[email])
        if email.startswith("Kemarin") or email.startswith("Selamat siang"):
            hasil["tanggal_kejadian"] = "2026-11-16"            # lupa mengubah "kemarin"
        if "OTP" in email:
            hasil["mendesak"] = False
        return e.Ekstraksi(**hasil)

    hasil = e.evaluasi(hampir_benar, data)
    assert hasil["per_field"]["jenis"] == 1.0
    assert hasil["per_field"]["tanggal_kejadian"] == pytest.approx(11 / 12)
    assert hasil["per_field"]["mendesak"] == pytest.approx(11 / 12)
    assert hasil["semua_field"] == pytest.approx(10 / 12)
    assert ("e01", "tanggal_kejadian", "2026-11-15", "2026-11-16") in hasil["salah"]
