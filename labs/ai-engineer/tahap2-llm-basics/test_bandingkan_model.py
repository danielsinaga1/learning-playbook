"""Test tanpa API: peserta palsu menggantikan Claude dan Ollama."""
import csv
import re

import bandingkan_model as b

KODE = {"claude-opus-5-5": "X1", "claude-haiku-5-5": "X2", "qwen3.5:4b": "X3"}


def palsu(model: str, detik: float):
    def tanya(q: str) -> b.Jawaban:
        return b.Jawaban(model, q, f"teks {KODE[model]}", detik, 100, 200)
    return tanya


def test_angka_dan_lembar_nilai_buta(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    hasil = b.jalankan({m: palsu(m, d) for m, d in [("claude-opus-5-5", 3.0), ("claude-haiku-5-5", 0.8), ("qwen3.5:4b", 5.0)]})
    assert len(hasil) == 30
    b.tulis_hasil(hasil)

    with open("hasil_banding.csv", encoding="utf-8") as f:
        baris = list(csv.DictReader(f))
    opus = next(r for r in baris if r["model"] == "claude-opus-5-5")
    assert float(opus["biaya_usd"]) == round((100 * 4.00 + 200 * 20.00) / 1_000_000, 6)
    assert all(float(r["biaya_usd"]) == 0 for r in baris if r["model"] == "qwen3.5:4b")

    lembar = (tmp_path / "lembar_nilai.md").read_text(encoding="utf-8")
    assert not any(model in lembar for model in KODE)                   # penilai tidak melihat nama model
    with open("kunci_label.csv", encoding="utf-8") as f:
        kunci = {r["label"]: r["model"] for r in csv.DictReader(f)}
    assert len(kunci) == 30
    terlihat =re.findall(r"\*\*Jawaban ([ABC])\*\*\n\nteks (X\d)", lembar)
    assert len(terlihat) == 30
    for i in range(10):
        for label, kode in terlihat[i * 3:(i + 1) * 3]:
            assert KODE[kunci[f"{i + 1}{label}"]] == kode                 # kunci cocok dengan jawaban di lembar
    urutan = {tuple(k for _, k in terlihat[i * 3:(i + 1) * 3]) for i in range(10)}
    assert len(urutan) > 1                                              # posisi model benar-benar diacak
