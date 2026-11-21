"""Tahap 4 · Context engineering untuk asisten nasabah dengan percakapan panjang.

Empat gerakan: SELECT (pilih riwayat yang muat anggaran), COMPRESS (ringkas giliran lama),
REMEMBER (simpan fakta penting nasabah di luar riwayat), dan susunan yang ramah prompt caching
(bagian tetap di depan, bagian yang berubah di belakang).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import anthropic
from pydantic import BaseModel, Field

MODEL = "claude-opus-5-5"
MODEL_MURAH = "claude-haiku-5-5"     # ringkasan dan ekstraksi fakta: tugas kecil, model murah

# Hitung token untuk (system, messages). Implementasi asli memakai count_tokens; test memakai tiruan.
HitungToken = Callable[[list[dict], list[dict]], int]


def penghitung_claude(client: anthropic.Anthropic, model: str = MODEL) -> HitungToken:
    def hitung(system: list[dict], messages: list[dict]) -> int:
        return client.messages.count_tokens(model=model, system=system, messages=messages).input_tokens
    return hitung


class Fakta(BaseModel):
    kunci: str = Field(description="snake_case singkat, mis. bahasa_jawaban, rekening_utama")
    nilai: str


class DaftarFakta(BaseModel):
    fakta: list[Fakta] = Field(description="Hanya preferensi/fakta yang berlaku lama; kosong jika tidak ada")


@dataclass
class Memori:
    """REMEMBER: fakta nasabah disimpan terpisah dari riwayat, jadi tidak ikut terpotong."""
    fakta: dict[str, str] = field(default_factory=dict)

    def perbarui(self, baru: list[Fakta]) -> None:
        for f in baru:
            self.fakta[f.kunci] = f.nilai              # fakta terbaru menimpa yang lama

    def sebagai_teks(self) -> str:
        return "\n".join(f"- {k}: {v}" for k, v in sorted(self.fakta.items())) or "- (belum ada)"


def ekstrak_fakta(client: anthropic.Anthropic, pesan_nasabah: str) -> list[Fakta]:
    resp = client.messages.parse(
        model=MODEL_MURAH, max_tokens=1024, output_format=DaftarFakta,
        system="Ambil preferensi atau fakta tentang nasabah yang perlu diingat di giliran berikutnya. "
               "JANGAN simpan PIN, OTP, password, CVV, atau nomor kartu lengkap.",
        messages=[{"role": "user", "content": pesan_nasabah}])
    return resp.parsed_output.fakta


def ringkas(client: anthropic.Anthropic, ringkasan_lama: str, pesan_lama: list[dict]) -> str:
    """COMPRESS: giliran yang keluar dari jendela diringkas, bukan dibuang begitu saja."""
    transkrip = "\n".join(f"{p['role']}: {p['content']}" for p in pesan_lama)
    resp = client.messages.create(
        model=MODEL_MURAH, max_tokens=1024,
        system="Perbarui ringkasan percakapan layanan nasabah. Pertahankan: masalah yang dilaporkan, angka, "
               "nomor tiket, janji petugas, dan keputusan. Buang basa-basi. Maksimal 120 kata.",
        messages=[{"role": "user", "content": f"<ringkasan_lama>{ringkasan_lama}</ringkasan_lama>\n"
                                              f"<giliran_baru>{transkrip}</giliran_baru>"}])
    return "".join(b.text for b in resp.content if b.type == "text")


def susun_system(sistem_tetap: str, memori: Memori, ringkasan: str) -> list[dict]:
    """Bagian tetap di depan dengan cache_control; bagian yang sering berubah di belakang."""
    return [
        {"type": "text", "text": sistem_tetap, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": f"<memori_nasabah>\n{memori.sebagai_teks()}\n</memori_nasabah>\n"
                                 f"<ringkasan_percakapan>{ringkasan or '(belum ada)'}</ringkasan_percakapan>"},
    ]


def pilih_riwayat(system: list[dict], riwayat: list[dict], anggaran: int,
                  hitung: HitungToken) -> tuple[list[dict], list[dict]]:
    """SELECT: ambil giliran terbaru yang masih muat anggaran. Mengembalikan (terpilih, terbuang).

    Riwayat terpilih selalu diawali pesan user (syarat API). Di produksi, simpan hasil hitung
    per pesan agar tidak memanggil count_tokens berulang untuk pesan yang sama.
    """
    mulai = len(riwayat)
    while mulai > 0 and hitung(system, riwayat[mulai - 1:]) <= anggaran:
        mulai -= 1
    while mulai < len(riwayat) and riwayat[mulai]["role"] != "user":
        mulai += 1
    return riwayat[mulai:], riwayat[:mulai]


def potong_naif(sistem_tetap: str, riwayat: list[dict], anggaran: int, hitung: HitungToken) -> list[dict]:
    """Pembanding: buang pesan tertua sampai muat. Fakta di awal percakapan ikut hilang."""
    system = [{"type": "text", "text": sistem_tetap}]
    terpilih, _ = pilih_riwayat(system, riwayat, anggaran, hitung)
    return terpilih


@dataclass
class Percakapan:
    client: anthropic.Anthropic
    sistem_tetap: str
    anggaran_input: int = 8_000
    memori: Memori = field(default_factory=Memori)
    ringkasan: str = ""
    riwayat: list[dict] = field(default_factory=list)

    def kirim(self, pesan: str, hitung: HitungToken | None = None) -> str:
        hitung = hitung or penghitung_claude(self.client)
        self.memori.perbarui(ekstrak_fakta(self.client, pesan))
        self.riwayat.append({"role": "user", "content": pesan})
        system = susun_system(self.sistem_tetap, self.memori, self.ringkasan)
        terpilih, terbuang = pilih_riwayat(system, self.riwayat, self.anggaran_input, hitung)
        if terbuang:
            self.ringkasan = ringkas(self.client, self.ringkasan, terbuang)
            self.riwayat = terpilih                      # yang terbuang kini hidup di ringkasan
            system = susun_system(self.sistem_tetap, self.memori, self.ringkasan)
        resp = self.client.messages.create(model=MODEL, max_tokens=4096, system=system, messages=self.riwayat)
        jawaban = "".join(b.text for b in resp.content if b.type == "text")
        self.riwayat.append({"role": "assistant", "content": jawaban})
        u = resp.usage
        print(f"[token] input={u.input_tokens} cache_baca={u.cache_read_input_tokens} "
              f"cache_tulis={u.cache_creation_input_tokens} output={u.output_tokens}")
        return jawaban
