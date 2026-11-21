"""Tahap 1 · Ambil kurs referensi dari API publik lalu simpan ke SQLite.

Sumber: Frankfurter (https://frankfurter.dev), kurs referensi harian European Central Bank.
Ini kurs REFERENSI, bukan kurs transaksi bank; untuk rupiah, acuan resminya JISDOR Bank Indonesia.
Jalankan: python kurs_ke_db.py               (kurs terbaru)
          python kurs_ke_db.py 2026-11-02    (kurs tanggal tertentu, untuk mengisi data lama)
"""
from __future__ import annotations

import logging
import sqlite3
import sys
import time
from datetime import date
from decimal import ROUND_HALF_EVEN, Decimal
from typing import Literal

import httpx
from pydantic import BaseModel

BASE_URL = "https://api.frankfurter.dev/v1"
KUOTE = ("IDR", "EUR", "SGD", "JPY")
DB_PATH = "kurs.db"
log = logging.getLogger("kurs")


class ResponsKurs(BaseModel):
    """Bentuk respons API. Nilai kurs memakai Decimal: uang tidak boleh lewat float."""

    amount: Literal[1]              # kita tidak mengirim ?amount=, jadi rates = kurs untuk 1 unit base
    base: str
    date: date                      # tanggal kurs berlaku (hari kerja), BUKAN tanggal yang diminta
    rates: dict[str, Decimal]


def ambil_kurs(client: httpx.Client, base: str = "USD", tanggal: str = "latest",
               percobaan: int = 3) -> ResponsKurs:
    """GET dengan timeout dan retry + backoff untuk error sementara (timeout, 5xx)."""
    params = {"base": base, "symbols": ",".join(k for k in KUOTE if k != base)}
    for ke in range(1, percobaan + 1):
        try:
            resp = client.get(f"{BASE_URL}/{tanggal}", params=params)
            resp.raise_for_status()
            # parse_float=Decimal: 0.90481 dibaca persis, tidak menjadi 0.9048099999...
            return ResponsKurs.model_validate(resp.json(parse_float=Decimal))
        except httpx.TransportError as exc:          # termasuk timeout
            alasan = repr(exc)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code < 500:
                raise                                # 4xx: request kita yang salah, jangan diulang
            alasan = f"HTTP {exc.response.status_code}"
        if ke == percobaan:
            raise RuntimeError(f"Gagal mengambil kurs setelah {percobaan} percobaan: {alasan}")
        jeda = 2 ** ke
        log.warning("percobaan %d gagal (%s), coba lagi dalam %d detik", ke, alasan, jeda)
        time.sleep(jeda)
    raise AssertionError("tidak terjangkau")


def siapkan_db(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS kurs (
            tanggal      TEXT NOT NULL,
            base         TEXT NOT NULL,
            kuote        TEXT NOT NULL,
            nilai        TEXT NOT NULL,              -- Decimal disimpan sebagai teks agar tetap persis
            sumber       TEXT NOT NULL DEFAULT 'ECB via Frankfurter',
            diambil_pada TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE (tanggal, base, kuote)            -- satu kurs per pasangan mata uang per hari
        )""")


def simpan(conn: sqlite3.Connection, data: ResponsKurs) -> int:
    """Upsert: aman dijalankan berulang (idempoten). Mengembalikan jumlah baris baru."""
    sebelum = conn.execute("SELECT count(*) FROM kurs").fetchone()[0]
    with conn:
        conn.executemany("""
            INSERT INTO kurs (tanggal, base, kuote, nilai) VALUES (?, ?, ?, ?)
            ON CONFLICT (tanggal, base, kuote) DO UPDATE SET
                nilai = excluded.nilai,                  -- sumber bisa mengoreksi angka
                diambil_pada = datetime('now')""",
            [(data.date.isoformat(), data.base, kuote, str(nilai)) for kuote, nilai in data.rates.items()])
    return conn.execute("SELECT count(*) FROM kurs").fetchone()[0] - sebelum


def konversi(nominal: Decimal, kurs: Decimal) -> Decimal:
    """Nominal x kurs, dibulatkan ke 2 desimal dengan banker's rounding (ROUND_HALF_EVEN)."""
    return (nominal * kurs).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    tanggal = sys.argv[1] if len(sys.argv) > 1 else "latest"
    with httpx.Client(timeout=10.0, headers={"User-Agent": "belajar-ai-engineer/1.0"}) as client:
        data = ambil_kurs(client, tanggal=tanggal)
    conn = sqlite3.connect(DB_PATH)
    siapkan_db(conn)
    baru = simpan(conn, data)
    total = conn.execute("SELECT count(*) FROM kurs").fetchone()[0]
    idr = data.rates["IDR"]
    log.info("kurs %s: 1 %s = %s IDR | baris baru %d, total %d | 1.250 USD = Rp %s",
             data.date, data.base, idr, baru, total, konversi(Decimal("1250"), idr))


if __name__ == "__main__":
    main()
