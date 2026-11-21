import json
import logging

import anthropic
import httpx2
import pytest

import observability as ob


def client_dengan(respons):
    return anthropic.Anthropic(api_key="uji", max_retries=0,
                               http_client=httpx2.Client(transport=httpx2.MockTransport(lambda req: respons)))


def test_log_satu_baris_json_tanpa_isi_prompt(caplog):
    respons = httpx2.Response(200, headers={"request-id": "req_123"}, json={
        "id": "m", "type": "message", "role": "assistant", "model": "claude-haiku-5-5",
        "content": [{"type": "text", "text": "rahasia nasabah"}], "stop_reason": "end_turn", "stop_sequence": None,
        "usage": {"input_tokens": 1000, "output_tokens": 200, "cache_read_input_tokens": 10000,
                  "cache_creation_input_tokens": 0}})
    with caplog.at_level(logging.INFO, logger="llm"):
        ob.panggil_tercatat(client_dengan(respons), "triase", model="claude-haiku-5-5", max_tokens=100,
                            messages=[{"role": "user", "content": "nomor rekening 1234567890"}])
    baris = json.loads(caplog.records[0].getMessage())
    assert baris["fitur"] == "triase" and baris["request_id"] == "req_123" and baris["stop_reason"] == "end_turn"
    # 1000 x 0,10 + 10000 x 0,01 + 200 x 0,50 = 300 per juta
    assert baris["biaya_usd"] == pytest.approx(0.0003)
    assert "1234567890" not in caplog.text and "rahasia" not in caplog.text


def test_error_api_dicatat_lalu_dilempar_ulang(caplog):
    respons = httpx2.Response(429, headers={"request-id": "req_429"},
                              json={"type": "error", "error": {"type": "rate_limit_error", "message": "slow down"}})
    with caplog.at_level(logging.INFO, logger="llm"), pytest.raises(anthropic.RateLimitError):
        ob.panggil_tercatat(client_dengan(respons), "triase", model="claude-haiku-5-5", max_tokens=100,
                            messages=[{"role": "user", "content": "x"}])
    baris = json.loads(caplog.records[0].getMessage())
    assert baris["status"] == 429 and baris["request_id"] == "req_429"
