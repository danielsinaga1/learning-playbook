"""Tahap 6 · MCP server untuk petugas layanan Bank Nusantara (data tiruan di memori).

Isi: 2 tool baca, 1 tool tulis (blokir kartu), 1 resource template (SOP), 1 prompt.
Jalankan: uv run mcp dev server_bank.py          (MCP Inspector, untuk mencoba manual)
          python server_bank.py                   (stdio, untuk Claude Code / Claude Desktop)
          python server_bank.py --http            (streamable HTTP di http://localhost:8000/mcp)
"""
from __future__ import annotations

import logging
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ResourceError, ToolError
from mcp.types import ToolAnnotations
from pydantic import BaseModel, Field

FOLDER_SOP = Path(__file__).parent.parent / "tahap5-rag-sop" / "sop"
log = logging.getLogger("audit")          # stdio: log ke stderr, JANGAN print ke stdout (itu jalur protokol)

mcp = MCPServer("bank-nusantara-layanan", instructions=(
    "Alat untuk petugas layanan. Gunakan cek_status_transfer sebelum menyimpulkan transfer gagal. "
    "blokir_kartu tidak bisa dibatalkan lewat server ini; konfirmasi dulu dengan petugas."))

# --- data tiruan; di sistem nyata ini panggilan ke core banking dengan identitas dari token OAuth ---
TRANSFER = {
    "FT2611150042": {"status": "gagal", "nominal": 1_750_000, "tujuan": "BCA ****8812", "dana_kembali": False},
    "FT2611160007": {"status": "berhasil", "nominal": 500_000, "tujuan": "BRI ****0931", "dana_kembali": None},
}
KARTU = {"4421": {"jenis": "debit", "status": "aktif"}, "9034": {"jenis": "kredit", "status": "aktif"}}
POLA_REFERENSI = re.compile(r"^[A-Z0-9-]{5,20}$")


class StatusTransfer(BaseModel):
    nomor_referensi: str
    status: Literal["berhasil", "gagal", "tertunda"]
    nominal_rupiah: int
    rekening_tujuan: str = Field(description="Selalu tersamarkan, mis. BCA ****8812")
    dana_sudah_kembali: bool | None
    langkah_sop: str


class StatusKartu(BaseModel):
    empat_digit_terakhir: str
    jenis: Literal["debit", "kredit"]
    status: Literal["aktif", "diblokir"]


def audit(aksi: str, **detail: object) -> None:
    log.info("%s %s %s", datetime.now(timezone.utc).isoformat(timespec="seconds"), aksi, detail)


@mcp.tool(annotations=ToolAnnotations(read_only_hint=True, open_world_hint=False))
def cek_status_transfer(nomor_referensi: str) -> StatusTransfer:
    """Cek status transfer berdasarkan nomor referensi (huruf besar/angka, mis. FT2611150042)."""
    ref = nomor_referensi.strip().upper()
    if not POLA_REFERENSI.fullmatch(ref):
        raise ToolError("format nomor referensi tidak valid")          # pesan ini sampai ke model
    data = TRANSFER.get(ref)
    if data is None:
        raise ToolError(f"transfer {ref} tidak ditemukan")
    audit("cek_status_transfer", ref=ref)
    langkah = {"gagal": "Dana kembali otomatis maks. 1 hari kerja; jika lewat, tiket investigasi prioritas tinggi.",
               "berhasil": "Terbitkan surat keterangan transfer berhasil; tiket antarbank target 5 hari kerja.",
               "tertunda": "Pending > 1 jam: telusuri."}[data["status"]]
    return StatusTransfer(nomor_referensi=ref, status=data["status"], nominal_rupiah=data["nominal"],
                          rekening_tujuan=data["tujuan"], dana_sudah_kembali=data["dana_kembali"], langkah_sop=langkah)


@mcp.tool(annotations=ToolAnnotations(read_only_hint=True, open_world_hint=False))
def cek_status_kartu(empat_digit_terakhir: str) -> StatusKartu:
    """Cek status kartu nasabah yang sedang dilayani berdasarkan 4 digit terakhir."""
    kartu = _kartu(empat_digit_terakhir)
    return StatusKartu(empat_digit_terakhir=empat_digit_terakhir, **kartu)


@mcp.tool(annotations=ToolAnnotations(destructive_hint=True, idempotent_hint=True, open_world_hint=False))
def blokir_kartu(empat_digit_terakhir: str,
                 alasan: Literal["hilang", "dicuri", "tertelan_atm", "transaksi_tidak_dikenal"]) -> StatusKartu:
    """Blokir kartu nasabah. Tidak dapat dibuka kembali lewat server ini. Panggil hanya setelah
    petugas mengonfirmasi. Memblokir kartu yang sudah diblokir aman (idempoten)."""
    kartu = _kartu(empat_digit_terakhir)
    if kartu["status"] != "diblokir":
        kartu["status"] = "diblokir"
        audit("blokir_kartu", kartu=f"****{empat_digit_terakhir}", alasan=alasan)
    return StatusKartu(empat_digit_terakhir=empat_digit_terakhir, **kartu)


def _kartu(empat_digit: str) -> dict:
    if not re.fullmatch(r"\d{4}", empat_digit):
        raise ToolError("isi tepat 4 digit terakhir; jangan pernah kirim nomor kartu lengkap")
    if empat_digit not in KARTU:
        raise ToolError("kartu tidak ditemukan untuk nasabah ini")
    return KARTU[empat_digit]


@mcp.resource("sop://{nama}", mime_type="text/markdown")
def baca_sop(nama: str) -> str:
    """Isi lengkap satu dokumen SOP, mis. sop://transfer-gagal."""
    if not re.fullmatch(r"[a-z0-9-]+", nama):                       # cegah path traversal (../../etc)
        raise ResourceError("nama SOP tidak valid")
    path = FOLDER_SOP / f"{nama}.md"
    if not path.is_file():
        raise ResourceError(f"SOP {nama} tidak ada")
    return path.read_text(encoding="utf-8")


@mcp.prompt(title="Tanggapi keluhan nasabah")
def tanggapi_keluhan(keluhan: str) -> str:
    """Templat: klasifikasikan keluhan, cek data dengan tool, lalu susun jawaban sesuai SOP."""
    return (f"Keluhan nasabah:\n<keluhan>{keluhan}</keluhan>\n\n"
            "1. Tentukan jenis masalah. 2. Cek data dengan tool yang relevan; jangan menebak status. "
            "3. Baca SOP terkait (resource sop://...). 4. Susun jawaban sopan dengan langkah dan tenggat dari SOP. "
            "Jangan pernah meminta PIN, OTP, CVV, atau nomor kartu lengkap.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    if "--http" in sys.argv:
        mcp.run(transport="streamable-http")
    else:
        mcp.run()
