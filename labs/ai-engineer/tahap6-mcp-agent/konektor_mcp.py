"""Tahap 6 · MCP connector: Claude API sendiri yang memanggil MCP server remote (tanpa loop di kode kita).

Syarat: server dapat dijangkau dari internet lewat HTTPS (streamable HTTP), dengan token per pengguna.
Cocok untuk tool baca. Untuk tool destruktif, pakai loop sendiri (agen_layanan.py) agar ada persetujuan.
"""
from __future__ import annotations

import anthropic


def tanya_lewat_konektor(client: anthropic.Anthropic, pertanyaan: str, url: str, token: str) -> str:
    resp = client.beta.messages.create(
        model="claude-opus-5-5", max_tokens=4096, betas=["mcp-client-2025-11-20"],
        mcp_servers=[{"type": "url", "url": url, "name": "bank", "authorization_token": token}],
        tools=[{"type": "mcp_toolset", "mcp_server_name": "bank",
                # izinkan hanya tool baca; blokir_kartu tidak pernah terlihat oleh model lewat jalur ini
                "default_config": {"enabled": False},
                "configs": {"cek_status_transfer": {"enabled": True}, "cek_status_kartu": {"enabled": True}}}],
        messages=[{"role": "user", "content": pertanyaan}],
    )
    return "".join(b.text for b in resp.content if b.type == "text")
