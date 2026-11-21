"""Test tanpa API key dan tanpa biaya: SDK asli, tetapi jaringan diganti httpx.MockTransport.

Yang diuji: SDK menerima argumen kita, request yang terkirim berbentuk benar, dan kode kita
membaca respons dengan benar. Yang TIDAK diuji: kualitas jawaban model (itu urusan eval, Tahap 7).
"""
import json

import anthropic
import httpx2 as httpx   # SDK Anthropic/OpenAI/Gemini terbaru memakai httpx2 (API sama dengan httpx)
import openai
import pytest
from google import genai

import tiga_provider as tp

TIKET = {"kategori": "transfer", "prioritas": "tinggi", "nominal_rupiah": 2500000,
         "ringkasan": "Transfer Rp2,5 juta terdebit tetapi belum diterima penerima."}


def perekam(respons):
    """Transport palsu yang mencatat setiap request lalu mengembalikan respons tetap."""
    tercatat = []

    def handler(req: httpx.Request) -> httpx.Response:
        tercatat.append(req)
        return respons(req) if callable(respons) else respons

    return tercatat, httpx.Client(transport=httpx.MockTransport(handler))


def pesan_claude(teks, stop_reason="end_turn"):
    return httpx.Response(200, json={
        "id": "msg_1", "type": "message", "role": "assistant", "model": tp.MODEL_CLAUDE,
        "content": [{"type": "thinking", "thinking": "", "signature": "x"}, {"type": "text", "text": teks}],
        "stop_reason": stop_reason, "stop_sequence": None, "usage": {"input_tokens": 50, "output_tokens": 20}})


def test_claude_dasar_dan_terstruktur():
    log, http = perekam(lambda req: pesan_claude(json.dumps(TIKET) if "output_config" in json.loads(req.content)
                                                 and "format" in json.loads(req.content)["output_config"]
                                                 else "Mohon maaf atas kendalanya."))
    c = anthropic.Anthropic(api_key="uji", http_client=http)
    assert tp.claude_dasar(c) == "Mohon maaf atas kendalanya."           # blok thinking diabaikan
    body = json.loads(log[0].content)
    assert body["system"] == tp.SISTEM and body["output_config"] == {"effort": "low"}
    assert "temperature" not in body
    tiket = tp.claude_terstruktur(c)
    assert tiket.kategori == "transfer" and tiket.nominal_rupiah == 2_500_000
    assert json.loads(log[1].content)["output_config"]["format"]["type"] == "json_schema"


def test_claude_produksi_fallback_dan_refusal():
    log, http = perekam(pesan_claude("", stop_reason="refusal"))
    c = anthropic.Anthropic(api_key="uji", http_client=http)
    assert "call center" in tp.claude_produksi(c, "...")
    assert log[0].headers["anthropic-beta"] == "server-side-fallback-2026-07-01"
    assert json.loads(log[0].content)["fallbacks"] == "default"


def test_claude_stream():
    kejadian = [
        ("message_start", {"type": "message_start", "message": {
            "id": "msg_1", "type": "message", "role": "assistant", "model": tp.MODEL_CLAUDE, "content": [],
            "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 50, "output_tokens": 1}}}),
        ("content_block_start", {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}),
        ("content_block_delta", {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Mohon "}}),
        ("content_block_delta", {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "maaf."}}),
        ("content_block_stop", {"type": "content_block_stop", "index": 0}),
        ("message_delta", {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None},
                           "usage": {"output_tokens": 3}}),
        ("message_stop", {"type": "message_stop"}),
    ]
    sse = "".join(f"event: {e}\ndata: {json.dumps(d)}\n\n" for e, d in kejadian)
    _, http = perekam(httpx.Response(200, text=sse, headers={"content-type": "text/event-stream"}))
    assert tp.claude_stream(anthropic.Anthropic(api_key="uji", http_client=http)) == "Mohon maaf."


def respons_openai(teks):
    return httpx.Response(200, json={
        "id": "resp_1", "object": "response", "created_at": 0, "model": tp.MODEL_OPENAI, "status": "completed",
        "output": [{"type": "message", "id": "m1", "status": "completed", "role": "assistant",
                    "content": [{"type": "output_text", "text": teks, "annotations": []}]}],
        "parallel_tool_calls": True, "tool_choice": "auto", "tools": []})


def test_openai_dasar_dan_terstruktur():
    log, http = perekam(lambda req: respons_openai(json.dumps(TIKET) if "text" in json.loads(req.content)
                                                   else "Mohon maaf atas kendalanya."))
    c = openai.OpenAI(api_key="uji", http_client=http)
    assert tp.openai_dasar(c) == "Mohon maaf atas kendalanya."
    body = json.loads(log[0].content)
    assert body["instructions"] == tp.SISTEM and body["reasoning"] == {"effort": "low"}
    assert tp.openai_terstruktur(c).prioritas == "tinggi"
    assert json.loads(log[1].content)["text"]["format"]["type"] == "json_schema"


def respons_gemini(teks):
    return httpx.Response(200, json={"id": "int_1", "status": "completed",
                                     "steps": [{"type": "model_output", "content": [{"type": "text", "text": teks}]}]})


def test_gemini_dasar_dan_terstruktur():
    log, http = perekam(lambda req: respons_gemini(json.dumps(TIKET) if "response_format" in json.loads(req.content)
                                                   else "Mohon maaf atas kendalanya."))
    c = genai.Client(api_key="uji", http_options={"httpx_client": http})
    assert tp.gemini_dasar(c) == "Mohon maaf atas kendalanya."
    body = json.loads(log[0].content)
    assert body["system_instruction"] == tp.SISTEM and body["model"] == tp.MODEL_GEMINI
    assert tp.gemini_terstruktur(c).kategori == "transfer"
    fmt = json.loads(log[1].content)["response_format"]
    assert fmt["mime_type"] == "application/json" and fmt["schema"]["title"] == "Tiket"


def test_cadangan_pindah_saat_gangguan():
    def utama():
        raise anthropic.APIConnectionError(request=httpx.Request("POST", "https://api.anthropic.com"))

    nama, tiket = tp.triase_dengan_cadangan([("claude", utama), ("openai", lambda: tp.Tiket(**TIKET))])
    assert nama == "openai" and tiket.kategori == "transfer"


def test_cadangan_tidak_menelan_bug():
    def rusak():
        raise anthropic.BadRequestError("400", response=httpx.Response(400, request=httpx.Request("POST", "https://x")),
                                        body=None)

    with pytest.raises(anthropic.BadRequestError):            # 400 = bug kita, jangan disembunyikan
        tp.triase_dengan_cadangan([("claude", rusak), ("openai", lambda: tp.Tiket(**TIKET))])
