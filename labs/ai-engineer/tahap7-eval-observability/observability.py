"""Tahap 7 · Catat setiap panggilan LLM sebagai satu baris JSON: cukup untuk dashboard biaya,
latensi, dan investigasi insiden. Kirim ke stack log yang sudah ada (Loki, ELK, CloudWatch).

Yang dicatat: id permintaan, model, token (termasuk cache), latensi, stop_reason, biaya.
Yang TIDAK dicatat secara default: isi prompt dan jawaban (bisa memuat data nasabah).
"""
from __future__ import annotations

import json
import logging
import time
import uuid

import anthropic

log = logging.getLogger("llm")

# USD per 1 juta token: (input, output). Baca cache = 0,1x input; tulis cache 5 menit = 1,25x input.
HARGA = {"claude-opus-5-5": (4.00, 20.00), "claude-sonnet-5-5": (2.00, 10.00), "claude-haiku-5-5": (0.10, 0.50)}


def biaya_usd(model: str, usage) -> float:
    masuk, keluar = HARGA[model]
    baca = usage.cache_read_input_tokens or 0
    tulis = usage.cache_creation_input_tokens or 0
    return (usage.input_tokens * masuk + baca * masuk * 0.1 + tulis * masuk * 1.25
            + usage.output_tokens * keluar) / 1_000_000


def panggil_tercatat(client: anthropic.Anthropic, fitur: str, **kwargs) -> anthropic.types.Message:
    """Bungkus messages.create. `fitur` = nama fitur produk, untuk memecah biaya per fitur."""
    id_jejak = str(uuid.uuid4())
    mulai = time.perf_counter()
    try:
        resp = client.messages.create(**kwargs)
    except anthropic.APIStatusError as exc:
        log.error(json.dumps({"jejak": id_jejak, "fitur": fitur, "model": kwargs.get("model"),
                              "status": exc.status_code, "request_id": exc.request_id,
                              "ms": round((time.perf_counter() - mulai) * 1000)}))
        raise
    u = resp.usage
    log.info(json.dumps({
        "jejak": id_jejak, "fitur": fitur, "model": resp.model, "request_id": resp._request_id,
        "ms": round((time.perf_counter() - mulai) * 1000), "stop_reason": resp.stop_reason,
        "token_masuk": u.input_tokens, "token_keluar": u.output_tokens,
        "cache_baca": u.cache_read_input_tokens or 0, "cache_tulis": u.cache_creation_input_tokens or 0,
        "biaya_usd": round(biaya_usd(kwargs["model"], u), 6)}))
    return resp
