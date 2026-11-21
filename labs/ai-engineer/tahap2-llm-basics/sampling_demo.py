"""Tahap 2 · Simulasi: bagaimana temperature dan top-p mengubah pilihan token berikutnya.

Angka logit di bawah hanya ilustrasi, bukan keluaran model sungguhan.
"""
import numpy as np

KANDIDAT = ["kerupuk", "telur", "sambal", "acar", "bawang goreng", "keju"]
LOGIT = np.array([3.0, 1.9, 1.1, 0.6, 0.4, -1.5])      # skor mentah tiap kandidat token
SUHU = (0.2, 0.7, 1.0, 1.5)


def softmax(logit: np.ndarray, suhu: float) -> np.ndarray:
    """Temperature membagi logit sebelum softmax: kecil = makin yakin, besar = makin rata."""
    z = logit / suhu
    z = z - z.max()                                     # stabil secara numerik
    p = np.exp(z)
    return p / p.sum()


def top_p(prob: np.ndarray, p: float) -> np.ndarray:
    """Nucleus sampling: simpan token terkecil yang total peluangnya >= p, lalu normalisasi ulang."""
    urut = np.argsort(prob)[::-1]
    batas = int(np.searchsorted(np.cumsum(prob[urut]), p)) + 1
    hasil = np.zeros_like(prob)
    pilih = urut[:batas]
    hasil[pilih] = prob[pilih] / prob[pilih].sum()
    return hasil


def main() -> None:
    print('Konteks: "Nasi goreng paling enak pakai ..."\n')
    tabel = {t: softmax(LOGIT, t) for t in SUHU}
    print(f"{'token':<15}" + "".join(f"{'T=' + str(t):>9}" for t in SUHU))
    for i, token in enumerate(KANDIDAT):
        print(f"{token:<15}" + "".join(f"{tabel[t][i]:>9.1%}" for t in SUHU))

    sisa = top_p(softmax(LOGIT, 1.0), 0.9)
    print("\nTop-p 0.9 pada T=1.0, token yang masih mungkin:", [KANDIDAT[i] for i in np.flatnonzero(sisa)])

    rng = np.random.default_rng(42)
    for t in (0.2, 1.5):
        pilihan = rng.choice(len(KANDIDAT), size=8, p=softmax(LOGIT, t))
        print(f"8 sampel pada T={t}: " + ", ".join(KANDIDAT[i] for i in pilihan))


if __name__ == "__main__":
    main()
