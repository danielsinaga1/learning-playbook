"""Tahap 7 · Perbanyak kasus eval dari 12 menuju 50 dengan bantuan model, TETAP direview manusia.

Model mengusulkan kandidat ke data/kandidat.jsonl. Manusia membaca, memperbaiki label, lalu
memindahkan yang layak ke data/kasus_eval.jsonl. Kandidat tidak pernah masuk test set otomatis.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

import anthropic
from pydantic import BaseModel, Field

FOLDER = Path(__file__).parent
FOLDER_SOP = FOLDER.parent / "tahap5-rag-sop" / "sop"


class KasusBaru(BaseModel):
    kategori: Literal["normal", "di_luar_sop", "jebakan"]
    pertanyaan: str = Field(description="Gaya bahasa petugas sungguhan: singkat, kadang tidak baku")
    wajib_ada: list[str] = Field(description="Frasa pendek yang WAJIB ada di jawaban benar, disalin dari SOP")
    sumber_harap: str | None = Field(description="id potongan 'nama-file#slug-heading'; null untuk di_luar_sop")


class Usulan(BaseModel):
    kasus: list[KasusBaru]


def normal(teks: str) -> str:
    return " ".join(teks.lower().split())


def usulkan(client: anthropic.Anthropic, kasus_lama: list[dict], n: int = 10) -> list[KasusBaru]:
    sop = "\n\n".join(f"<sop file='{p.stem}'>\n{p.read_text(encoding='utf-8')}\n</sop>" for p in sorted(FOLDER_SOP.glob("*.md")))
    contoh = "\n".join(json.dumps(k, ensure_ascii=False) for k in kasus_lama[:4])
    resp = client.messages.parse(
        model="claude-opus-5-5", max_tokens=8000, output_format=Usulan,
        system="Kamu menyusun kasus uji untuk bot SOP bank. Utamakan kasus yang sulit: dua SOP mirip, "
               "angka yang mudah tertukar, pertanyaan di luar SOP, dan permintaan yang melanggar aturan.",
        messages=[{"role": "user", "content": f"{sop}\n\nContoh format:\n{contoh}\n\n"
                   f"Buat {n} kasus BARU yang tidak sama dengan contoh. Slug heading: huruf kecil, spasi jadi '-'."}])
    return saring(resp.parsed_output.kasus, kasus_lama)


def saring(kandidat: list[KasusBaru], kasus_lama: list[dict]) -> list[KasusBaru]:
    """Buang duplikat (sudah ada di test set atau berulang di kandidat)."""
    sudah = {normal(k["pertanyaan"]) for k in kasus_lama}
    hasil = []
    for k in kandidat:
        kunci = normal(k.pertanyaan)
        if kunci not in sudah:
            sudah.add(kunci)
            hasil.append(k)
    return hasil


def main() -> None:
    kasus_lama = [json.loads(b) for b in (FOLDER / "data" / "kasus_eval.jsonl").read_text(encoding="utf-8").splitlines() if b.strip()]
    baru = usulkan(anthropic.Anthropic(), kasus_lama)
    with open(FOLDER / "data" / "kandidat.jsonl", "a", encoding="utf-8") as f:
        for k in baru:
            f.write(json.dumps({"id": "", **k.model_dump()}, ensure_ascii=False) + "\n")
    print(f"{len(baru)} kandidat ditulis ke data/kandidat.jsonl. Review dan beri id sebelum dipindah ke kasus_eval.jsonl.")


if __name__ == "__main__":
    main()
