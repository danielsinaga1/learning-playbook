# Lab AI Engineer: 8 Tahap (tema perbankan)

Kode pendamping track **AI Engineer: Roadmap 8 Tahap** di playbook. Setiap tahap punya proyek kecil
yang bisa dijalankan dan test yang **tidak butuh API key**: jaringan diganti `httpx.MockTransport`
(Tahap 1) atau `httpx2.MockTransport` (SDK Anthropic/OpenAI/Gemini terbaru memakai `httpx2`).

Bank Nusantara, SOP, nasabah, dan nomor rekening di lab ini **fiktif**.

## Persiapan

```bash
uv venv --python 3.12 && source .venv/bin/activate    # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
pytest -q tahap1-fondasi                               # ulangi per folder tahap
```

Kunci API dibaca SDK dari environment: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`.
Script yang memanggil API **berbayar**; test tidak memanggil API apa pun.

| Tahap | Folder | Proyek | Butuh API key? |
|---|---|---|---|
| 1 Fondasi | `tahap1-fondasi` | Kurs referensi ECB (Frankfurter) -> SQLite, Decimal, upsert idempoten, retry | Tidak |
| 2 LLM Basics | `tahap2-llm-basics` | Simulasi temperature/top-p, melihat token, bandingkan 3 model + lembar nilai buta | Hanya `bandingkan_model.py` |
| 3 API & Prompting | `tahap3-api-prompting` | Claude/OpenAI/Gemini (dasar, streaming, structured), ekstraksi email keluhan -> JSON | Ya |
| 4 Context Engineering | `tahap4-context-engineering` | Memori fakta nasabah, ringkasan, seleksi riwayat sesuai anggaran token, caching | Ya |
| 5 Embeddings & RAG | `tahap5-rag-sop` | Bot SOP: Chroma + BM25 + RRF, sitasi `search_result`, hit@k | `ukur`: tidak |
| 6 MCP & Agents | `tahap6-mcp-agent` | MCP server layanan bank + agen dengan persetujuan manusia | Server: tidak |
| 7 Evals & Observability | `tahap7-eval-observability` | Eval bot SOP, LLM judge, kappa, gerbang regresi, dashboard HTML, log biaya | Ya |
| 8 Security & Production | `tahap8-keamanan` | 20 serangan OWASP LLM, pertahanan berlapis, ASR sebelum/sesudah | Ya |

Hasil terukur saat pengujian (bukan klaim umum):

- Tahap 5, 15 pertanyaan uji: vektor hit@1 80% / hit@3 93%; BM25 93% / 100%; hibrida 87% / 100%.
  Embedding bawaan Chroma (all-MiniLM-L6-v2) dilatih untuk bahasa Inggris.
- Tahap 8 dengan model tiruan yang menuruti apa pun: lapisan di luar model menahan semua serangan
  kebocoran, tautan, HTML, dan biaya, tetapi tidak menahan 7 serangan jailbreak konten.
