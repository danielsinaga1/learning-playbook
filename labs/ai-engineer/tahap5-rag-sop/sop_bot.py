"""Tahap 5 · Proyek: bot SOP layanan bank dengan RAG, sitasi, dan pengukuran retrieval.

Alur: potong SOP per heading -> indeks Chroma (vektor) + BM25 (kata kunci) -> gabung dengan RRF
-> kirim potongan sebagai blok search_result -> Claude menjawab dengan sitasi ke sumber.
Jalankan: python sop_bot.py ukur                      (hit@k, tanpa API key)
          python sop_bot.py "kartu saya tertelan ATM"  (butuh ANTHROPIC_API_KEY)
"""
from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

import anthropic
import chromadb

FOLDER_SOP = Path(__file__).parent / "sop"
DATA_UJI = Path(__file__).parent / "data" / "pertanyaan_uji.jsonl"
MODEL = "claude-opus-5-5"
SISTEM = (
    "Kamu asisten internal petugas layanan Bank Nusantara. Jawab HANYA dari hasil pencarian SOP yang diberikan. "
    "Jika SOP tidak memuat jawabannya, katakan tidak ditemukan di SOP dan sarankan eskalasi ke supervisor. "
    "Jangan mengarang angka, biaya, atau tenggat."
)


@dataclass(frozen=True)
class Potongan:
    id: str          # "transfer-gagal#status-gagal-tetapi-saldo-terdebit"
    judul: str       # "SOP Penanganan Transfer ... > Status gagal tetapi saldo terdebit"
    teks: str


def slug(teks: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", teks.lower()).strip("-")


def potong_sop(folder: Path = FOLDER_SOP) -> list[Potongan]:
    """Satu potongan = satu bagian '## '. Judul dokumen ikut di tiap potongan sebagai konteks."""
    hasil = []
    for path in sorted(folder.glob("*.md")):
        dokumen = path.read_text(encoding="utf-8")
        judul_dok = dokumen.splitlines()[0].lstrip("# ").strip()
        for bagian in re.split(r"^## ", dokumen, flags=re.M)[1:]:
            heading, _, isi = bagian.partition("\n")
            hasil.append(Potongan(f"{path.stem}#{slug(heading)}", f"{judul_dok} > {heading.strip()}", isi.strip()))
    return hasil


def token(teks: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", teks.lower())


class BM25:
    """Pencarian kata kunci klasik. Unggul untuk istilah persis: 'BI-FAST', 'CVV', angka hari."""

    def __init__(self, dokumen: list[str], k1: float = 1.5, b: float = 0.75):
        self.dok = [Counter(token(d)) for d in dokumen]
        self.panjang = [sum(c.values()) for c in self.dok]
        self.rata = sum(self.panjang) / len(self.panjang)
        df = Counter(t for c in self.dok for t in c)
        n = len(dokumen)
        self.idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}
        self.k1, self.b = k1, b

    def skor(self, kueri: str) -> list[float]:
        hasil = []
        for c, pjg in zip(self.dok, self.panjang):
            s = 0.0
            for t in token(kueri):
                if t in c:
                    tf = c[t]
                    s += self.idf[t] * tf * (self.k1 + 1) / (tf + self.k1 * (1 - self.b + self.b * pjg / self.rata))
            hasil.append(s)
        return hasil


class Indeks:
    def __init__(self, potongan: list[Potongan]):
        self.potongan = potongan
        self.koleksi = chromadb.EphemeralClient().get_or_create_collection("sop")   # embedding bawaan Chroma
        self.koleksi.add(ids=[p.id for p in potongan], documents=[f"{p.judul}\n{p.teks}" for p in potongan])
        self.bm25 = BM25([f"{p.judul}\n{p.teks}" for p in potongan])

    def vektor(self, kueri: str, k: int) -> list[str]:
        return self.koleksi.query(query_texts=[kueri], n_results=k)["ids"][0]

    def kata_kunci(self, kueri: str, k: int) -> list[str]:
        skor = self.bm25.skor(kueri)
        urut = sorted(range(len(skor)), key=lambda i: skor[i], reverse=True)
        return [self.potongan[i].id for i in urut[:k]]

    def hibrida(self, kueri: str, k: int, kandidat: int = 10, c: int = 60) -> list[str]:
        """Reciprocal Rank Fusion: gabungkan peringkat tanpa perlu menyamakan skala skor."""
        skor: Counter[str] = Counter()
        for daftar in (self.vektor(kueri, kandidat), self.kata_kunci(kueri, kandidat)):
            for peringkat, id_ in enumerate(daftar):
                skor[id_] += 1 / (c + peringkat + 1)
        return [id_ for id_, _ in skor.most_common(k)]

    def ambil(self, ids: list[str]) -> list[Potongan]:
        peta = {p.id: p for p in self.potongan}
        return [peta[i] for i in ids]


def hit_at_k(cari, data: list[dict], k: int) -> float:
    """Proporsi pertanyaan yang potongan benarnya muncul di k hasil teratas."""
    return sum(d["sumber"] in cari(d["pertanyaan"], k) for d in data) / len(data)


def blok_search_result(potongan: list[Potongan]) -> list[dict]:
    return [{"type": "search_result", "source": p.id, "title": p.judul,
             "content": [{"type": "text", "text": p.teks}], "citations": {"enabled": True}} for p in potongan]


def jawab(client: anthropic.Anthropic, indeks: Indeks, pertanyaan: str, k: int = 3) -> anthropic.types.Message:
    potongan = indeks.ambil(indeks.hibrida(pertanyaan, k))
    return client.messages.create(
        model=MODEL, max_tokens=4096, system=SISTEM,
        messages=[{"role": "user", "content": [*blok_search_result(potongan), {"type": "text", "text": pertanyaan}]}])


def render(pesan: anthropic.types.Message) -> str:
    """Teks jawaban dengan penanda [n] dan daftar sumber di bawahnya."""
    sumber: dict[str, int] = {}
    bagian = []
    for blok in pesan.content:
        if blok.type != "text":
            continue
        bagian.append(blok.text)
        for c in blok.citations or []:
            if c.type == "search_result_location":
                nomor = sumber.setdefault(c.source, len(sumber) + 1)
                bagian.append(f"[{nomor}]")
    daftar = "\n".join(f"[{n}] {s}" for s, n in sumber.items())
    return "".join(bagian) + (f"\n\nSumber:\n{daftar}" if daftar else "\n\n(tanpa sitasi: periksa manual)")


def main() -> None:
    indeks = Indeks(potong_sop())
    if sys.argv[1:] == ["ukur"]:
        data = [json.loads(b) for b in DATA_UJI.read_text(encoding="utf-8").splitlines() if b.strip()]
        for nama, cari in (("vektor", indeks.vektor), ("bm25", indeks.kata_kunci), ("hibrida", indeks.hibrida)):
            print(f"{nama:<8} " + "  ".join(f"hit@{k}={hit_at_k(cari, data, k):.0%}" for k in (1, 3, 5)))
        return
    print(render(jawab(anthropic.Anthropic(), indeks, " ".join(sys.argv[1:]))))


if __name__ == "__main__":
    main()
