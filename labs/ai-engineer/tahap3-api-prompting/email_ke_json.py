"""Tahap 3 · Proyek: ekstraksi email keluhan nasabah -> JSON, dan bandingkan 3 teknik prompting.

Varian: zero-shot, few-shot (3 contoh), dan few-shot + field `alasan` (chain-of-thought tertulis).
Ukurannya akurasi per field terhadap data berlabel, bukan "kelihatannya bagus".
Jalankan: python email_ke_json.py            (butuh ANTHROPIC_API_KEY; memanggil API = berbayar)
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Callable, Literal

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-haiku-5-5"          # tugas ekstraksi sederhana: mulai dari model termurah, naik bila akurasi kurang
HARI_INI = "2026-11-16"             # tanggal relatif ("kemarin") butuh titik acuan; di produksi pakai tanggal email
DATA = Path(__file__).parent / "data" / "email_berlabel.jsonl"
FIELD = ("jenis", "nominal_rupiah", "tanggal_kejadian", "nomor_referensi", "mendesak")


class Ekstraksi(BaseModel):
    jenis: Literal["transfer_gagal", "kartu_hilang", "tagihan_kartu_kredit", "penipuan", "blokir_akun", "lainnya"]
    nominal_rupiah: int | None = Field(description="Angka bulat tanpa titik; 'Rp1,5 juta' -> 1500000; null jika tidak ada")
    tanggal_kejadian: str | None = Field(description="Format YYYY-MM-DD; null jika tidak disebut")
    nomor_referensi: str | None = Field(description="Salin persis seperti di email; null jika tidak ada")
    mendesak: bool = Field(description="true jika dana sedang/akan hilang atau nasabah punya tenggat dekat")


class EkstraksiDenganAlasan(BaseModel):
    alasan: str = Field(description="Tulis singkat langkah menentukan setiap field SEBELUM mengisi jawabannya")
    hasil: Ekstraksi


SISTEM = f"""Kamu mengekstrak data dari email nasabah Bank Nusantara untuk sistem tiket.
Hari ini {HARI_INI}. Ubah tanggal relatif ("kemarin", "Jumat lalu") menjadi tanggal absolut.
Aturan jenis:
- penipuan: ada pihak lain yang mengambil dana/data nasabah (OTP diminta, transaksi yang tidak dikenali saat kartu di tangan)
- tagihan_kartu_kredit: keberatan atas isi tagihan kartu kredit (transaksi, bunga, denda)
- kartu_hilang: kartu hilang, dicuri, atau tertelan ATM
- blokir_akun: tidak bisa masuk mobile/internet banking karena akun terblokir/nonaktif
- transfer_gagal: dana terdebit tetapi tidak sampai, atau transfer gagal tanpa refund
- lainnya: pertanyaan umum"""

CONTOH = [   # contoh few-shot SENGAJA berbeda dari data uji: jangan pernah mengambil contoh dari test set
    ("Top up e-wallet 200rb tgl 14 Nov gagal tapi saldo rekening kepotong, ref TU991. Kapan kembali?",
     {"jenis": "transfer_gagal", "nominal_rupiah": 200000, "tanggal_kejadian": "2026-11-14",
      "nomor_referensi": "TU991", "mendesak": False}),
    ("Ada yang WA mengaku CS dan minta foto kartu kredit saya, saya belum kirim apa-apa. Ini resmi?",
     {"jenis": "penipuan", "nominal_rupiah": None, "tanggal_kejadian": None,
      "nomor_referensi": None, "mendesak": False}),
    ("Kartu kredit saya hilang di bandara tadi malam, tolong diblokir sekarang juga.",
     {"jenis": "kartu_hilang", "nominal_rupiah": None, "tanggal_kejadian": "2026-11-15",
      "nomor_referensi": None, "mendesak": True}),
]


def sistem_few_shot() -> str:
    blok = "\n".join(f"<contoh>\n<email>{e}</email>\n<json>{json.dumps(j)}</json>\n</contoh>" for e, j in CONTOH)
    return f"{SISTEM}\n\nContoh:\n{blok}"


def muat_data(path: Path = DATA) -> list[dict]:
    return [json.loads(baris) for baris in path.read_text(encoding="utf-8").splitlines() if baris.strip()]


def cek_kebocoran(data: list[dict]) -> None:
    """Contoh few-shot yang ikut ada di data uji membuat akurasi palsu tinggi."""
    uji = {d["email"].strip().lower() for d in data}
    bocor = [e for e, _ in CONTOH if e.strip().lower() in uji]
    if bocor:
        raise ValueError(f"contoh few-shot ada di data uji: {bocor}")


def pengekstrak_claude(client: anthropic.Anthropic, varian: str) -> Callable[[str], Ekstraksi]:
    sistem = SISTEM if varian == "zero-shot" else sistem_few_shot()
    skema = EkstraksiDenganAlasan if varian == "few-shot+alasan" else Ekstraksi

    def ekstrak(email: str) -> Ekstraksi:
        resp = client.messages.parse(model=MODEL, max_tokens=2048, system=sistem, output_format=skema,
                                     messages=[{"role": "user", "content": f"<email>{email}</email>"}])
        hasil = resp.parsed_output
        return hasil.hasil if isinstance(hasil, EkstraksiDenganAlasan) else hasil
    return ekstrak


def evaluasi(ekstrak: Callable[[str], Ekstraksi], data: list[dict]) -> dict:
    benar = dict.fromkeys(FIELD, 0)
    semua_benar, salah = 0, []
    for d in data:
        tebakan = ekstrak(d["email"]).model_dump()
        cocok = {f: tebakan[f] == d["label"][f] for f in FIELD}
        for f, ok in cocok.items():
            benar[f] += ok
        semua_benar += all(cocok.values())
        salah += [(d["id"], f, d["label"][f], tebakan[f]) for f, ok in cocok.items() if not ok]
    n = len(data)
    return {"per_field": {f: benar[f] / n for f in FIELD}, "semua_field": semua_benar / n, "salah": salah}


def cetak(nama: str, hasil: dict) -> None:
    kolom = "  ".join(f"{f}={v:.0%}" for f, v in hasil["per_field"].items())
    print(f"{nama:<16} semua_field={hasil['semua_field']:.0%}  {kolom}")
    for id_, field, harap, dapat in hasil["salah"]:
        print(f"    {id_} {field}: harap {harap!r}, dapat {dapat!r}")


def main() -> None:
    data = muat_data()
    cek_kebocoran(data)
    client = anthropic.Anthropic()
    for varian in ("zero-shot", "few-shot", "few-shot+alasan"):
        cetak(varian, evaluasi(pengekstrak_claude(client, varian), data))


if __name__ == "__main__":
    main()
