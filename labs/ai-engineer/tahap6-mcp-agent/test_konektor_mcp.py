import json

import anthropic
import httpx2

import konektor_mcp as km


def test_request_konektor_hanya_mengizinkan_tool_baca():
    tercatat = []

    def handler(req):
        tercatat.append(req)
        return httpx2.Response(200, json={
            "id": "m", "type": "message", "role": "assistant", "model": "claude-opus-5-5",
            "content": [{"type": "text", "text": "Transfer FT2611150042 berstatus gagal."}],
            "stop_reason": "end_turn", "stop_sequence": None, "usage": {"input_tokens": 1, "output_tokens": 1}})

    client = anthropic.Anthropic(api_key="uji", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    jawaban = km.tanya_lewat_konektor(client, "cek FT2611150042", "https://mcp.contoh.test/mcp", "tok-nasabah")
    assert jawaban.startswith("Transfer")
    req = tercatat[0]
    assert "mcp-client-2025-11-20" in req.headers["anthropic-beta"]
    body = json.loads(req.content)
    assert body["mcp_servers"][0]["authorization_token"] == "tok-nasabah"
    toolset = body["tools"][0]
    assert toolset["default_config"] == {"enabled": False}
    assert set(toolset["configs"]) == {"cek_status_transfer", "cek_status_kartu"}
