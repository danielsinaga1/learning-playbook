"""Tahap 3 · Satu tugas, tiga penyedia: panggilan dasar, streaming, dan structured output.

Tugas: triase keluhan nasabah bank menjadi tiket. Kunci API dibaca SDK dari environment
(ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY), jangan pernah ditulis di kode.
Jalankan: python tiga_provider.py claude|openai|gemini
"""
from __future__ import annotations

import sys
from typing import Literal, Protocol

import anthropic
import openai
from google import genai
from pydantic import BaseModel, Field

SISTEM = (
    "Kamu petugas triase pengaduan nasabah Bank Nusantara. Jawab dalam bahasa Indonesia, singkat dan sopan. "
    "Jangan pernah meminta PIN, OTP, password, atau nomor kartu lengkap."
)
KELUHAN = (
    "Saya transfer Rp2.500.000 ke rekening adik via mobile banking jam 10 tadi, saldo sudah terpotong "
    "tapi adik saya belum terima. Status di aplikasi 'sedang diproses'. Tolong dibantu."
)

MODEL_CLAUDE = "claude-opus-5-5"
MODEL_OPENAI = "gpt-6-luna"
MODEL_GEMINI = "gemini-4-hydrogen"


class Tiket(BaseModel):
    kategori: Literal["transfer", "kartu", "kredit", "akun", "penipuan", "lainnya"]
    prioritas: Literal["rendah", "sedang", "tinggi"]
    nominal_rupiah: int | None = Field(description="Nominal yang disebut nasabah, tanpa titik; null jika tidak ada")
    ringkasan: str = Field(description="Satu kalimat untuk petugas back office")


# ---------------- Claude (Anthropic) ----------------
def claude_dasar(client: anthropic.Anthropic) -> str:
    resp = client.messages.create(
        model=MODEL_CLAUDE, max_tokens=2048, system=SISTEM,
        output_config={"effort": "low"},          # tugas ringan: hemat waktu dan token berpikir
        messages=[{"role": "user", "content": KELUHAN}],
    )
    return "".join(b.text for b in resp.content if b.type == "text")


def claude_stream(client: anthropic.Anthropic) -> str:
    with client.messages.stream(model=MODEL_CLAUDE, max_tokens=2048, system=SISTEM,
                                messages=[{"role": "user", "content": KELUHAN}]) as stream:
        for potongan in stream.text_stream:
            print(potongan, end="", flush=True)
        pesan = stream.get_final_message()
    print()
    return "".join(b.text for b in pesan.content if b.type == "text")


def claude_terstruktur(client: anthropic.Anthropic) -> Tiket:
    resp = client.messages.parse(model=MODEL_CLAUDE, max_tokens=2048, system=SISTEM,
                                 messages=[{"role": "user", "content": KELUHAN}], output_format=Tiket)
    return resp.parsed_output


def claude_produksi(client: anthropic.Anthropic, pesan: str) -> str:
    """Versi produksi: fallback sisi server bila model menolak, dan stop_reason selalu dicek."""
    resp = client.beta.messages.create(
        model=MODEL_CLAUDE, max_tokens=2048, system=SISTEM,
        betas=["server-side-fallback-2026-07-01"], fallbacks="default",
        messages=[{"role": "user", "content": pesan}],
    )
    if resp.stop_reason == "refusal":
        return "Maaf, permintaan ini tidak bisa kami proses. Silakan hubungi call center."
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("jawaban terpotong: naikkan max_tokens atau persingkat permintaan")
    return "".join(b.text for b in resp.content if b.type == "text")


# ---------------- OpenAI (Responses API) ----------------
def openai_dasar(client: openai.OpenAI) -> str:
    resp = client.responses.create(model=MODEL_OPENAI, instructions=SISTEM, input=KELUHAN,
                                   reasoning={"effort": "low"})
    return resp.output_text


def openai_stream(client: openai.OpenAI) -> str:
    teks = []
    for event in client.responses.create(model=MODEL_OPENAI, instructions=SISTEM, input=KELUHAN, stream=True):
        if event.type == "response.output_text.delta":
            print(event.delta, end="", flush=True)
            teks.append(event.delta)
    print()
    return "".join(teks)


def openai_terstruktur(client: openai.OpenAI) -> Tiket:
    resp = client.responses.parse(model=MODEL_OPENAI, instructions=SISTEM, input=KELUHAN, text_format=Tiket)
    return resp.output_parsed


# ---------------- Gemini (Interactions API) ----------------
def gemini_dasar(client: genai.Client) -> str:
    interaction = client.interactions.create(model=MODEL_GEMINI, system_instruction=SISTEM, input=KELUHAN)
    return interaction.output_text


def gemini_stream(client: genai.Client) -> str:
    teks = []
    for event in client.interactions.create(model=MODEL_GEMINI, system_instruction=SISTEM, input=KELUHAN,
                                            stream=True):
        if event.event_type == "step.delta" and event.delta.type == "text":
            print(event.delta.text, end="", flush=True)
            teks.append(event.delta.text)
    print()
    return "".join(teks)


def gemini_terstruktur(client: genai.Client) -> Tiket:
    interaction = client.interactions.create(
        model=MODEL_GEMINI, system_instruction=SISTEM, input=KELUHAN,
        response_format={"type": "text", "mime_type": "application/json", "schema": Tiket.model_json_schema()},
    )
    return Tiket.model_validate_json(interaction.output_text)     # tetap validasi di sisi kita


# ---------------- Satu antarmuka untuk aplikasi ----------------
class Triase(Protocol):
    def __call__(self) -> Tiket: ...


def triase_dengan_cadangan(urutan: list[tuple[str, Triase]]) -> tuple[str, Tiket]:
    """Coba penyedia utama; jika gangguan (timeout, 5xx, rate limit) pindah ke cadangan."""
    sementara = (anthropic.APIConnectionError, anthropic.RateLimitError, anthropic.InternalServerError,
                 openai.APIConnectionError, openai.RateLimitError, openai.InternalServerError,
                 genai.errors.ServerError)
    galat: list[str] = []
    for nama, fungsi in urutan:
        try:
            return nama, fungsi()
        except sementara as exc:
            galat.append(f"{nama}: {type(exc).__name__}")
    raise RuntimeError("semua penyedia gagal: " + "; ".join(galat))


def main() -> None:
    jalur = {
        "claude": (anthropic.Anthropic, claude_dasar, claude_stream, claude_terstruktur),
        "openai": (openai.OpenAI, openai_dasar, openai_stream, openai_terstruktur),
        "gemini": (genai.Client, gemini_dasar, gemini_stream, gemini_terstruktur),
    }
    buat_client, dasar, stream, terstruktur = jalur[sys.argv[1] if len(sys.argv) > 1 else "claude"]
    client = buat_client()
    print(dasar(client))
    stream(client)
    print(terstruktur(client))


if __name__ == "__main__":
    main()
