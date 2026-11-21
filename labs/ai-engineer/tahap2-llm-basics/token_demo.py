"""Tahap 2 · Melihat token: teks dipotong menjadi potongan, dan bahasa memengaruhi jumlahnya.

tiktoken adalah tokenizer OpenAI (o200k_base). Tokenizer tiap penyedia berbeda: untuk Claude,
hitung dengan count_tokens (fungsi hitung_token_claude) yang memakai tokenizer model itu sendiri.
"""
import tiktoken

KALIMAT = {
    "English": "The order will be delivered within three business days.",
    "Indonesia": "Pesanan akan dikirim dalam waktu tiga hari kerja.",
    "Indonesia+": "Mohon konfirmasikan ketersediaannya sebelum pembayarannya diproses.",
    "Kode": "def total(harga: int, qty: int) -> int: return harga * qty",
}


def potong(teks: str, enc: tiktoken.Encoding) -> list[str]:
    return [enc.decode([t]) for t in enc.encode(teks)]


def hitung_token_claude(teks: str, model: str = "claude-opus-5-5") -> int:
    """Jumlah token input menurut tokenizer Claude (butuh API key; endpoint ini tidak berbayar)."""
    import anthropic

    client = anthropic.Anthropic()
    return client.messages.count_tokens(model=model, messages=[{"role": "user", "content": teks}]).input_tokens


def main() -> None:
    enc = tiktoken.get_encoding("o200k_base")
    for nama, teks in KALIMAT.items():
        bagian = potong(teks, enc)
        print(f"{nama:<11} {len(teks):>3} karakter -> {len(bagian):>2} token: {bagian}")


if __name__ == "__main__":
    main()
