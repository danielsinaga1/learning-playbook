import type { Block, Module, Track } from '../types';

const FOUNDATION = 'AI Engineer: Fondasi';
const GRAPH = 'AI Engineer: LangChain & LangGraph';
const PRODUCTION = 'AI Engineer: Observability & Produksi';

export const aiEngineerTracks: Track[] = [
  { title: FOUNDATION, summary: 'Peta stack, Python modern untuk AI, dan Claude API langsung: streaming, structured output, tool calling.' },
  { title: GRAPH, summary: 'LangChain v1 create_agent, LangGraph StateGraph, memory, human-in-the-loop, multi-agent, dan streaming.' },
  { title: PRODUCTION, summary: 'Tracing & prompt management Langfuse, eval dataset, full stack FastAPI + Next.js, dan proyek akhir.' },
];

export const aiEngineerSource = 'Jalur AI Engineer: materi praktik dari dokumentasi resmi Anthropic, LangChain, LangGraph, dan Langfuse (29 Oktober 2026)';

const heading = (text: string): Block => ({ type: 'h', text });
const paragraph = (text: string): Block => ({ type: 'p', text });
const code = (title: string, content: string, lang: 'python' | 'ts' | 'bash' | 'text' | 'yaml' = 'python'): Block => ({
  type: 'code', lang, title, code: content,
});
const practice = (id: string, items: string[]): Block[] => [
  heading('Latihan & kriteria selesai'),
  { type: 'checklist', id: `aie-${id}`, items },
];
const references = (...links: [string, string][]): Block => ({
  type: 'list', items: links.map(([label, url]) => `[${label}](${url})`),
});

/** Materi manual dipisahkan dari gen/*.json agar aman saat dokumen sumber dikonversi ulang. */
export const aiEngineerModules: Omit<Module, 'code'>[] = [
  {
    id: 'aie-roadmap-stack',
    title: 'AI Engineer: Peta Stack & Jalur Belajar',
    summary: 'Bahasa, framework, dan urutan belajar: dari API mentah ke LangGraph dan Langfuse.',
    track: FOUNDATION, source: aiEngineerSource, duration: '45 menit', level: 'Easy',
    blocks: [
      paragraph('LangChain, LangGraph, dan Langfuse adalah **framework dan tools**, bukan bahasa pemrograman. Bahasa utamanya **Python**: ekosistem AI paling lengkap dan contoh resmi selalu tersedia lebih dulu. **TypeScript** menjadi pilihan kedua (LangChain.js, LangGraph.js, Vercel AI SDK) dan cocok bila frontend memakai [Next.js](#js.nextjs-fondasi-setup).'),
      { type: 'callout', tone: 'info', title: 'Acuan versi', text: 'Materi memakai **LangChain/LangGraph v1**, **Langfuse Python SDK v3** (berbasis OpenTelemetry), dan **Anthropic Python SDK**. Dokumentasi resmi diperiksa pada 29 Oktober 2026. Contoh memakai model `claude-opus-5-5`; ganti lewat variabel `MODEL` bila perlu.' },
      { type: 'table', head: ['Lapisan', 'Tool', 'Peran'], rows: [
        ['Bahasa', 'Python 3.12+ (uv, Pydantic, asyncio)', 'Fondasi semua kode agent dan API'],
        ['Model', 'Claude API / Anthropic SDK', 'Panggilan LLM, tool calling, streaming'],
        ['Integrasi', 'LangChain v1', 'Abstraksi model, tool, loader, retriever, `create_agent`'],
        ['Orkestrasi', 'LangGraph', 'Graf state, memory, human-in-the-loop, multi-agent'],
        ['Observability', 'Langfuse (alternatif: LangSmith)', 'Trace, biaya, prompt management, eval dataset'],
        ['Serving', 'FastAPI + Next.js', 'Endpoint streaming dan UI'],
      ] },
      heading('Urutan belajar yang disarankan'),
      { type: 'steps', items: [
        { title: '1. Python modern', text: 'Type hints, Pydantic, async, uv. Lihat juga [FastAPI: Pintu Masuk Aplikasi AI](#llm.fastapi-pintu-masuk-aplikasi-ai).' },
        { title: '2. LLM API tanpa framework', text: 'Pahami tool calling dan structured output langsung dari SDK, supaya framework tidak terasa seperti sihir.' },
        { title: '3. RAG', text: 'Gunakan track [Fase 1 · LLM Engineering](#llm.prompt-engineering-sistematis) dan [RAG: Panduan Lengkap](#llm.apa-itu-rag-manfaatnya) yang sudah ada.' },
        { title: '4. LangChain v1 → LangGraph', text: 'LangChain untuk integrasi; LangGraph untuk alur agent yang bisa dikendalikan.' },
        { title: '5. Langfuse & eval', text: 'Trace setiap request, versikan prompt, dan ukur kualitas dengan dataset.' },
        { title: '6. Full stack & produksi', text: 'Streaming ke Next.js, guardrails, deploy, lalu proyek akhir.' },
      ] },
      { type: 'cards', items: [
        { label: 'Pakai LangChain', title: 'Butuh integrasi cepat', text: 'Banyak provider model, loader dokumen, vector store, dan agent standar.' },
        { label: 'Pakai LangGraph', title: 'Butuh kontrol alur', text: 'Percabangan, retry, approval manusia, memory per thread, beberapa agent.' },
        { label: 'Pakai SDK langsung', title: 'Alur sederhana', text: 'Satu panggilan atau loop tool kecil; dependensi paling sedikit dan paling mudah di-debug.' },
      ] },
      ...practice('roadmap', ['Tulis tujuan belajar 3 bulan dan proyek portfolio yang ingin dibangun.', 'Jelaskan dengan kata sendiri beda LangChain, LangGraph, dan Langfuse.', 'Siapkan akun/API key Anthropic dan simpan di .env, bukan di kode.']),
      references(['LangChain overview', 'https://docs.langchain.com/oss/python/langchain/overview'], ['LangGraph overview', 'https://docs.langchain.com/oss/python/langgraph/overview'], ['Langfuse docs', 'https://langfuse.com/docs'], ['LangChain Academy (kursus gratis)', 'https://academy.langchain.com/']),
    ],
  },
  {
    id: 'aie-python-modern',
    title: 'AI Engineer: Python Modern untuk Aplikasi AI',
    summary: 'uv, struktur proyek, Pydantic, async/await, dan konfigurasi rahasia.',
    track: FOUNDATION, source: aiEngineerSource, duration: '90 menit', level: 'Easy',
    blocks: [
      paragraph('Kode agent penuh dengan data terstruktur (input tool, output model) dan operasi I/O (panggilan API, database). Tiga keterampilan Python paling penting: **type hints + Pydantic** untuk validasi, **async** untuk konkurensi, dan **uv** untuk mengelola dependensi yang bisa direproduksi.'),
      code('Terminal — buat proyek latihan di folder terpisah', `# Install uv: https://docs.astral.sh/uv/getting-started/installation/
uv init ai-lab --python 3.12
cd ai-lab
uv add anthropic pydantic python-dotenv
uv add langchain langchain-anthropic langgraph langfuse
uv add fastapi "uvicorn[standard]"
uv run python main.py`, 'bash'),
      code('Struktur proyek', `ai-lab/
  .env                # ANTHROPIC_API_KEY, LANGFUSE_* (masukkan ke .gitignore)
  .env.example        # nama variabel tanpa nilai rahasia
  pyproject.toml      # dependensi dikelola uv
  uv.lock             # versi terkunci, commit ke Git
  src/ai_lab/
    config.py         # baca environment
    tools.py          # fungsi tool
    graph.py          # graf LangGraph
    api.py            # endpoint FastAPI
  evals/              # dataset dan skrip eval`, 'text'),
      code('src/ai_lab/config.py — Pydantic untuk konfigurasi dan skema data', `import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

MODEL = os.getenv("MODEL", "claude-opus-5-5")


class Ticket(BaseModel):
    """Skema yang sama dipakai untuk validasi input tool dan structured output."""
    title: str = Field(min_length=5)
    priority: int = Field(ge=1, le=3, description="1 = paling mendesak")
    tags: list[str] = []


ticket = Ticket.model_validate({"title": "Login gagal", "priority": 1})
print(ticket.model_dump_json())
print(Ticket.model_json_schema())  # JSON Schema siap dipakai sebagai input_schema tool`),
      code('Async: jalankan beberapa panggilan LLM bersamaan', `import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()


async def summarize(text: str) -> str:
    response = await client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": f"Ringkas dalam 1 kalimat: {text}"}],
    )
    return next(b.text for b in response.content if b.type == "text")


async def main() -> None:
    docs = ["Dokumen A ...", "Dokumen B ...", "Dokumen C ..."]
    summaries = await asyncio.gather(*(summarize(d) for d in docs))
    print(summaries)

asyncio.run(main())`),
      { type: 'callout', tone: 'warn', title: 'Rahasia', text: 'Jangan commit `.env`. Klien Anthropic membaca `ANTHROPIC_API_KEY` dari environment secara otomatis, jadi kunci tidak perlu ditulis di kode.' },
      ...practice('python', ['Proyek uv berjalan dan uv.lock ter-commit.', 'Satu model Pydantic menolak input tidak valid dengan pesan error yang jelas.', 'Tiga panggilan async selesai lebih cepat daripada versi berurutan; catat waktunya.']),
      references(['uv', 'https://docs.astral.sh/uv/'], ['Pydantic', 'https://docs.pydantic.dev/latest/'], ['asyncio', 'https://docs.python.org/3/library/asyncio.html']),
    ],
  },
  {
    id: 'aie-llm-api-tool-calling',
    title: 'AI Engineer: Claude API, Streaming & Tool Calling',
    summary: 'Panggil model tanpa framework: pesan, streaming, structured output, dan loop tool.',
    track: FOUNDATION, source: aiEngineerSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Semua framework agent pada akhirnya memanggil endpoint yang sama: kirim riwayat pesan + daftar tool, model membalas teks atau permintaan memanggil tool, aplikasimu menjalankan tool lalu mengirim hasilnya kembali. Kuasai siklus ini sekali, maka LangChain dan LangGraph mudah dipahami.'),
      code('Panggilan dasar dan streaming', `import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    system="Kamu tutor backend yang menjawab singkat dalam bahasa Indonesia.",
    messages=[{"role": "user", "content": "Apa itu idempotency key?"}],
)
print(next(b.text for b in response.content if b.type == "text"))

# Streaming: tampilkan token begitu datang (wajib untuk UI chat)
with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Jelaskan CAP theorem."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)`),
      code('Structured output dengan Pydantic', `from pydantic import BaseModel


class Ticket(BaseModel):
    title: str
    priority: int
    tags: list[str]


response = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Buat tiket: checkout error 500 sejak deploy tadi pagi"}],
    output_format=Ticket,
)
ticket = response.parsed_output  # instance Ticket yang sudah tervalidasi
print(ticket.priority, ticket.tags)`),
      heading('Loop tool calling manual'),
      paragraph('Model tidak menjalankan fungsi. Model hanya meminta (`stop_reason == "tool_use"`); kode kamu yang mengeksekusi lalu mengembalikan `tool_result` dengan `tool_use_id` yang sama. Semua hasil tool dari satu giliran dikirim dalam **satu** pesan user.'),
      code('agent_manual.py', `import json
import anthropic

client = anthropic.Anthropic()

ORDERS = {"A-100": {"status": "dikirim", "eta": "2 hari"}}

TOOLS = [{
    "name": "get_order_status",
    "description": "Ambil status dan estimasi tiba pesanan berdasarkan ID pesanan.",
    "input_schema": {
        "type": "object",
        "properties": {"order_id": {"type": "string", "description": "Contoh: A-100"}},
        "required": ["order_id"],
        "additionalProperties": False,
    },
    "strict": True,
}]


def run_tool(name: str, args: dict) -> str:
    if name == "get_order_status":
        order = ORDERS.get(args["order_id"])
        return json.dumps(order or {"error": "pesanan tidak ditemukan"})
    raise ValueError(f"tool tidak dikenal: {name}")


messages = [{"role": "user", "content": "Pesanan A-100 saya sampai kapan?"}]

for _ in range(6):  # batas iterasi supaya loop tidak berputar liar
    response = client.messages.create(
        model="claude-opus-5-5", max_tokens=4096, tools=TOOLS, messages=messages,
    )
    if response.stop_reason != "tool_use":
        break
    messages.append({"role": "assistant", "content": response.content})
    results = [
        {"type": "tool_result", "tool_use_id": block.id, "content": run_tool(block.name, block.input)}
        for block in response.content if block.type == "tool_use"
    ]
    messages.append({"role": "user", "content": results})

print(next(b.text for b in response.content if b.type == "text"))`),
      { type: 'callout', tone: 'tip', title: 'Setelah paham, pakai helper', text: 'SDK Python juga menyediakan Tool Runner (`client.beta.messages.tool_runner` + dekorator `@beta_tool`) yang menjalankan loop ini untukmu. Tulis versi manual sekali agar paham, lalu pakai helper atau LangGraph.' },
      ...practice('api', ['Streaming tampil token demi token di terminal.', 'Structured output menghasilkan objek Pydantic yang valid.', 'Agent manual memanggil tool, mengembalikan tool_result, lalu menjawab dengan data dari tool.', 'Tambahkan tool kedua dan amati model memanggil keduanya dalam satu giliran.']),
      references(['Messages API', 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages'], ['Tool use', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview'], ['Structured outputs', 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs'], ['Streaming', 'https://platform.claude.com/docs/en/build-with-claude/streaming']),
    ],
  },
  {
    id: 'aie-langchain-v1',
    title: 'AI Engineer: LangChain v1 & create_agent',
    summary: 'Model string provider:model, @tool, agent siap pakai, structured response, dan middleware.',
    track: GRAPH, source: aiEngineerSource, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('LangChain v1 menyederhanakan API: agent dibuat dengan `create_agent`, yang di dalamnya sudah berupa graf LangGraph. Pakai LangChain sebagai **toolbox integrasi** (model, tool, loader, retriever). Contoh LCEL lama ada di [Orkestrasi dengan LangChain](#llm.orkestrasi-dengan-langchain); di sini fokus pada API v1.'),
      code('agent_langchain.py', `from langchain.agents import create_agent
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

ORDERS = {"A-100": "dikirim, tiba 2 hari lagi"}


@tool
def get_order_status(order_id: str) -> str:
    """Ambil status pesanan berdasarkan ID, contoh A-100."""
    return ORDERS.get(order_id, "pesanan tidak ditemukan")


agent = create_agent(
    model="anthropic:claude-opus-5-5",
    tools=[get_order_status],
    system_prompt="Kamu CS toko online. Jawab singkat dan sopan dalam bahasa Indonesia.",
    checkpointer=InMemorySaver(),  # memory percakapan per thread_id
)

config = {"configurable": {"thread_id": "user-42"}}
result = agent.invoke({"messages": [{"role": "user", "content": "Cek pesanan A-100"}]}, config)
print(result["messages"][-1].content)

# Giliran berikutnya di thread yang sama mengingat konteks sebelumnya
result = agent.invoke({"messages": [{"role": "user", "content": "Kapan sampainya tadi?"}]}, config)
print(result["messages"][-1].content)`),
      paragraph('Docstring dan type hint pada fungsi `@tool` otomatis menjadi deskripsi dan skema tool. Tulis docstring sejelas deskripsi tool di modul sebelumnya, karena model memilih tool berdasarkan teks itu.'),
      code('Structured response', `from pydantic import BaseModel


class Triage(BaseModel):
    category: str
    urgent: bool
    reply: str


triage_agent = create_agent(
    model="anthropic:claude-opus-5-5",
    tools=[get_order_status],
    response_format=Triage,
)
out = triage_agent.invoke({"messages": [{"role": "user", "content": "Paket A-100 belum datang, saya butuh besok!"}]})
print(out["structured_response"])  # Triage(category=..., urgent=True, reply=...)`),
      { type: 'table', head: ['Kebutuhan', 'Komponen LangChain'], rows: [
        ['Ganti provider model', '`"anthropic:..."`, `"openai:..."`, `"ollama:..."` atau `init_chat_model`'],
        ['Memuat PDF / web', 'Document loaders (`langchain-community`)'],
        ['RAG', 'Text splitter + embeddings + vector store + retriever sebagai tool'],
        ['Kontrol sebelum/sesudah model', 'Middleware agent (mis. ringkas riwayat, batasi panggilan, approval)'],
        ['Alur custom penuh', 'Turun ke LangGraph (modul berikutnya)'],
      ] },
      ...practice('langchain', ['Agent create_agent menjawab pertanyaan memakai tool.', 'Dua giliran di thread_id sama saling terhubung; thread_id baru mulai dari nol.', 'response_format menghasilkan objek Pydantic.', 'Ganti retriever dari modul RAG menjadi tool dan uji satu pertanyaan dokumen.']),
      references(['Agents (create_agent)', 'https://docs.langchain.com/oss/python/langchain/agents'], ['Tools', 'https://docs.langchain.com/oss/python/langchain/tools'], ['Middleware', 'https://docs.langchain.com/oss/python/langchain/middleware'], ['Anthropic integration', 'https://docs.langchain.com/oss/python/integrations/chat/anthropic']),
    ],
  },
  {
    id: 'aie-langgraph-dasar',
    title: 'AI Engineer: LangGraph — State, Node & Edge',
    summary: 'Bangun graf agent sendiri: state bertipe, node fungsi, edge kondisional, dan ToolNode.',
    track: GRAPH, source: aiEngineerSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('LangGraph memodelkan agent sebagai **graf**: *state* adalah data bersama, *node* adalah fungsi yang membaca state dan mengembalikan perubahan, *edge* menentukan node berikutnya. Edge kondisional membuat percabangan, dan siklus model → tool → model menghasilkan loop agent yang sama dengan modul API, tetapi eksplisit dan bisa diperluas.'),
      { type: 'table', head: ['Konsep', 'Arti', 'Contoh'], rows: [
        ['State', 'TypedDict / Pydantic yang dibagi semua node', '`MessagesState` berisi `messages`'],
        ['Reducer', 'Cara menggabungkan update ke state', '`add_messages` menambah, bukan menimpa'],
        ['Node', 'Fungsi `state -> dict update`', '`call_model`, `ToolNode`'],
        ['Edge', 'Transisi tetap', '`START -> classify`'],
        ['Conditional edge', 'Fungsi memilih node berikutnya', '`tools_condition` atau router buatan sendiri'],
      ] },
      code('graph.py — agent ReAct dengan graf eksplisit', `from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition


@tool
def get_order_status(order_id: str) -> str:
    """Ambil status pesanan berdasarkan ID, contoh A-100."""
    return {"A-100": "dikirim, tiba 2 hari lagi"}.get(order_id, "tidak ditemukan")


tools = [get_order_status]
model = init_chat_model("anthropic:claude-opus-5-5").bind_tools(tools)


def call_model(state: MessagesState) -> dict:
    return {"messages": [model.invoke(state["messages"])]}


builder = StateGraph(MessagesState)
builder.add_node("model", call_model)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "model")
builder.add_conditional_edges("model", tools_condition)  # ada tool call -> "tools", selain itu -> END
builder.add_edge("tools", "model")
graph = builder.compile()

result = graph.invoke({"messages": [{"role": "user", "content": "Status A-100?"}]})
for m in result["messages"]:
    m.pretty_print()`),
      heading('State custom dan router'),
      code('Klasifikasi dulu, baru pilih jalur', `from typing import Literal
from typing_extensions import TypedDict
from pydantic import BaseModel


class SupportState(TypedDict):
    question: str
    category: str
    answer: str


class Route(BaseModel):
    category: Literal["billing", "teknis", "lainnya"]


llm = init_chat_model("anthropic:claude-opus-5-5")
router = llm.with_structured_output(Route)


def classify(state: SupportState) -> dict:
    return {"category": router.invoke(state["question"]).category}


def billing(state: SupportState) -> dict:
    return {"answer": llm.invoke(f"Jawab sebagai tim billing: {state['question']}").text}


def teknis(state: SupportState) -> dict:
    return {"answer": llm.invoke(f"Jawab sebagai engineer support: {state['question']}").text}


def lainnya(state: SupportState) -> dict:
    return {"answer": "Pertanyaan diteruskan ke CS manusia."}


g = StateGraph(SupportState)
for name, fn in [("classify", classify), ("billing", billing), ("teknis", teknis), ("lainnya", lainnya)]:
    g.add_node(name, fn)
g.add_edge(START, "classify")
g.add_conditional_edges("classify", lambda s: s["category"], ["billing", "teknis", "lainnya"])
for name in ["billing", "teknis", "lainnya"]:
    g.add_edge(name, END)
support = g.compile()

print(support.invoke({"question": "Kenapa saya ditagih dua kali?"})["answer"])`),
      { type: 'callout', tone: 'tip', title: 'Visualisasikan graf', text: '`print(graph.get_graph().draw_mermaid())` menghasilkan diagram Mermaid. Tempel di README untuk dokumentasi alur agent.' },
      ...practice('langgraph-basic', ['Graf ReAct memanggil tool lalu kembali ke model sampai selesai.', 'Router mengarahkan tiga contoh pertanyaan ke tiga node berbeda.', 'Diagram Mermaid graf tersimpan di README.', 'Jelaskan kapan memakai graf eksplisit dibanding create_agent.']),
      references(['LangGraph quickstart', 'https://docs.langchain.com/oss/python/langgraph/quickstart'], ['Graph API', 'https://docs.langchain.com/oss/python/langgraph/graph-api'], ['Workflows & agents', 'https://docs.langchain.com/oss/python/langgraph/workflows-agents']),
    ],
  },
  {
    id: 'aie-langgraph-memory-hitl',
    title: 'AI Engineer: LangGraph — Memory & Human-in-the-Loop',
    summary: 'Checkpointer, thread_id, Postgres untuk produksi, interrupt() dan Command(resume=...).',
    track: GRAPH, source: aiEngineerSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Checkpointer menyimpan state graf setelah setiap langkah, dikelompokkan per `thread_id`. Ini memberi tiga kemampuan sekaligus: **memory percakapan**, **lanjut setelah error**, dan **jeda menunggu manusia**. Tanpa checkpointer, `interrupt()` tidak bisa dipakai.'),
      code('Approval sebelum aksi berisiko', `from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import START, END, StateGraph
from langgraph.types import Command, interrupt
from typing_extensions import TypedDict


class RefundState(TypedDict):
    order_id: str
    amount: int
    status: str


def request_approval(state: RefundState) -> dict:
    decision = interrupt({
        "question": "Setujui refund?",
        "order_id": state["order_id"],
        "amount": state["amount"],
    })
    return {"status": "approved" if decision == "ya" else "rejected"}


def execute_refund(state: RefundState) -> dict:
    if state["status"] == "approved":
        # panggil payment gateway di sini
        return {"status": "refunded"}
    return {}


graph = (
    StateGraph(RefundState)
    .add_node("approval", request_approval)
    .add_node("refund", execute_refund)
    .add_edge(START, "approval")
    .add_edge("approval", "refund")
    .add_edge("refund", END)
    .compile(checkpointer=InMemorySaver())
)

config = {"configurable": {"thread_id": "refund-A-100"}}
first = graph.invoke({"order_id": "A-100", "amount": 250000, "status": "pending"}, config)
print(first["__interrupt__"])  # payload yang ditampilkan ke admin

# ... admin menekan tombol di UI, request baru datang dengan thread_id sama
final = graph.invoke(Command(resume="ya"), config)
print(final["status"])  # refunded`),
      { type: 'callout', tone: 'warn', title: 'Node diulang dari awal saat resume', text: 'Saat dilanjutkan, node yang berisi `interrupt()` dijalankan ulang dari baris pertama. Letakkan efek samping (charge, kirim email) **setelah** interrupt atau di node terpisah, dan buat idempotent.' },
      heading('Checkpointer untuk produksi'),
      code('Postgres sebagai penyimpanan state', `# uv add langgraph-checkpoint-postgres "psycopg[binary,pool]"
from langgraph.checkpoint.postgres import PostgresSaver

DB_URI = "postgresql://app:secret@localhost:5432/agent"

with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup()  # buat tabel sekali saat migrasi
    graph = builder.compile(checkpointer=checkpointer)
    graph.invoke({"messages": [{"role": "user", "content": "Halo"}]},
                 {"configurable": {"thread_id": "user-42"}})`),
      { type: 'table', head: ['Jenis memory', 'Cakupan', 'Implementasi'], rows: [
        ['Short-term', 'Satu percakapan (thread)', 'Checkpointer + `thread_id`'],
        ['Long-term', 'Lintas percakapan per user', 'Store (`InMemoryStore`, Postgres store) dengan namespace user'],
        ['Riwayat panjang', 'Thread yang melebihi konteks', 'Ringkas atau potong pesan lama di node/middleware'],
      ] },
      ...practice('memory', ['Thread yang sama mengingat nama user; thread baru tidak.', 'Graf refund berhenti di interrupt dan lanjut dengan Command(resume=...).', 'State tetap ada setelah proses Python di-restart memakai PostgresSaver.', 'Efek samping tidak terjadi dua kali saat resume.']),
      references(['Persistence', 'https://docs.langchain.com/oss/python/langgraph/persistence'], ['Interrupts', 'https://docs.langchain.com/oss/python/langgraph/interrupts'], ['Memory', 'https://docs.langchain.com/oss/python/langgraph/add-memory']),
    ],
  },
  {
    id: 'aie-langgraph-multi-agent',
    title: 'AI Engineer: LangGraph — Multi-Agent & Streaming',
    summary: 'Supervisor dengan Command(goto=...), subgraph, dan mode streaming untuk UI.',
    track: GRAPH, source: aiEngineerSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Multi-agent berguna ketika satu prompt terlalu banyak tanggung jawab atau tool. Pola paling mudah dikendalikan adalah **supervisor**: satu node memutuskan agent spesialis mana yang bekerja berikutnya. Mulai dari satu agent; pecah hanya bila eval menunjukkan kualitas turun karena konteks terlalu ramai.'),
      code('Supervisor sederhana', `from typing import Literal
from pydantic import BaseModel
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.types import Command

llm = init_chat_model("anthropic:claude-opus-5-5")

researcher = create_agent(model=llm, tools=[], system_prompt="Kamu riset fakta teknis. Beri poin singkat.")
writer = create_agent(model=llm, tools=[], system_prompt="Kamu penulis. Ubah poin riset menjadi jawaban rapi.")


class Next(BaseModel):
    next: Literal["researcher", "writer", "FINISH"]


def supervisor(state: MessagesState) -> Command[Literal["researcher", "writer", "__end__"]]:
    decision = llm.with_structured_output(Next).invoke([
        {"role": "system", "content": "Pilih researcher bila fakta belum ada, writer bila fakta sudah ada, FINISH bila jawaban final sudah ditulis."},
        *state["messages"],
    ])
    return Command(goto=END if decision.next == "FINISH" else decision.next)


def run(agent, name: str):
    def node(state: MessagesState) -> Command[Literal["supervisor"]]:
        out = agent.invoke(state)
        return Command(goto="supervisor", update={"messages": [
            {"role": "assistant", "content": out["messages"][-1].text, "name": name}
        ]})
    return node


builder = StateGraph(MessagesState)
builder.add_node("supervisor", supervisor)
builder.add_node("researcher", run(researcher, "researcher"))
builder.add_node("writer", run(writer, "writer"))
builder.add_edge(START, "supervisor")
team = builder.compile()`),
      paragraph('`Command` menggabungkan **update state** dan **tujuan berikutnya** dalam satu nilai kembali, sehingga edge tidak perlu didaftarkan manual. Batasi jumlah langkah dengan `config={"recursion_limit": 20}` agar supervisor tidak berputar tanpa akhir.'),
      heading('Streaming'),
      code('Mode stream yang sering dipakai', `inputs = {"messages": [{"role": "user", "content": "Jelaskan event sourcing"}]}

# updates: perubahan state per node (bagus untuk progress "researcher selesai")
for chunk in team.stream(inputs, stream_mode="updates"):
    print(list(chunk.keys()))

# messages: token LLM satu per satu + metadata node asalnya (untuk UI chat)
for token, meta in team.stream(inputs, stream_mode="messages"):
    if token.text:
        print(token.text, end="", flush=True)`),
      { type: 'table', head: ['stream_mode', 'Isi', 'Kegunaan'], rows: [
        ['values', 'State lengkap setelah tiap langkah', 'Debug'],
        ['updates', 'Delta state per node', 'Indikator progres'],
        ['messages', 'Token LLM + metadata', 'Chat UI'],
        ['custom', 'Data dari `get_stream_writer()` di node', 'Progres tool panjang'],
      ] },
      ...practice('multi-agent', ['Supervisor memanggil researcher lalu writer lalu selesai.', 'recursion_limit mencegah loop tak berujung; uji dengan prompt supervisor yang sengaja salah.', 'Stream mode messages menampilkan token dan nama node asal.', 'Bandingkan kualitas dan biaya single agent vs supervisor pada 5 pertanyaan.']),
      references(['Multi-agent', 'https://docs.langchain.com/oss/python/langchain/multi-agent'], ['Command & goto', 'https://docs.langchain.com/oss/python/langgraph/graph-api'], ['Streaming', 'https://docs.langchain.com/oss/python/langgraph/streaming']),
    ],
  },
  {
    id: 'aie-langfuse-tracing',
    title: 'AI Engineer: Langfuse — Tracing & Prompt Management',
    summary: 'Self-host atau cloud, CallbackHandler untuk LangChain/LangGraph, @observe, metadata, dan prompt berversi.',
    track: PRODUCTION, source: aiEngineerSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Langfuse adalah platform observability LLM open source. Setiap request menjadi **trace** berisi pohon langkah: panggilan model, tool, retrieval, token, biaya, dan latensi. Konsepnya sama dengan [Observability LLM: LangSmith](#llm.observability-llm-langsmith); Langfuse bisa di-*self-host* sehingga data tetap di server sendiri.'),
      code('Terminal — jalankan Langfuse lokal dengan Docker', `git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up
# Buka http://localhost:3000, buat project, salin public & secret key`, 'bash'),
      code('.env', `LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=http://localhost:3000   # atau https://cloud.langfuse.com
ANTHROPIC_API_KEY=sk-ant-...`, 'bash'),
      code('Trace graf LangGraph / agent LangChain', `from langfuse import get_client
from langfuse.langchain import CallbackHandler

langfuse = get_client()
handler = CallbackHandler()

result = graph.invoke(
    {"messages": [{"role": "user", "content": "Status A-100?"}]},
    config={
        "callbacks": [handler],
        "configurable": {"thread_id": "user-42"},
        "metadata": {
            "langfuse_user_id": "user-42",
            "langfuse_session_id": "chat-2026-10-29",
            "langfuse_tags": ["support", "staging"],
        },
    },
)

langfuse.flush()  # wajib di skrip pendek agar event terkirim sebelum proses selesai`),
      code('Trace kode biasa dengan @observe', `from langfuse import observe


@observe()
def retrieve(query: str) -> list[str]:
    return ["chunk 1", "chunk 2"]  # query vector DB


@observe()
def answer(question: str) -> str:
    context = retrieve(question)       # menjadi span anak
    return call_llm(question, context)  # panggilan Anthropic juga bisa di-trace`),
      heading('Prompt management'),
      paragraph('Simpan prompt di Langfuse dengan versi dan label (`production`, `staging`). Aplikasi mengambil prompt saat runtime, sehingga perubahan prompt bisa di-rollback tanpa deploy, dan setiap trace tercatat memakai versi prompt yang mana.'),
      code('Ambil dan isi prompt', `prompt = langfuse.get_prompt("support-system", label="production")
system_text = prompt.compile(product="Learning Tracker", tone="ramah")

agent = create_agent(
    model="anthropic:claude-opus-5-5",
    tools=tools,
    system_prompt=system_text,
)`),
      { type: 'callout', tone: 'warn', title: 'Data sensitif', text: 'Trace menyimpan input dan output lengkap. Samarkan data pribadi (email, nomor telepon, token) sebelum dikirim, atau gunakan fitur masking Langfuse. Jangan mencatat API key.' },
      ...practice('langfuse', ['Langfuse berjalan lokal dan satu trace graf muncul lengkap dengan tool call.', 'Trace terfilter berdasarkan user_id dan session_id.', 'Prompt sistem diambil dari Langfuse dengan label production; ganti versi tanpa mengubah kode.', 'Catat token dan biaya rata-rata per request dari dashboard.']),
      references(['Langfuse self-hosting', 'https://langfuse.com/self-hosting'], ['LangChain & LangGraph integration', 'https://langfuse.com/integrations/frameworks/langchain'], ['Python SDK (observe)', 'https://langfuse.com/docs/observability/sdk/overview'], ['Prompt management', 'https://langfuse.com/docs/prompt-management/overview']),
    ],
  },
  {
    id: 'aie-evaluasi-langfuse',
    title: 'AI Engineer: Evaluasi dengan Dataset & Experiment',
    summary: 'Dataset uji, evaluator kode dan LLM-as-judge, experiment Langfuse, dan gate kualitas di CI.',
    track: PRODUCTION, source: aiEngineerSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Tanpa eval, setiap perubahan prompt atau model hanyalah tebakan. Alurnya: kumpulkan kasus (termasuk trace gagal dari produksi) menjadi **dataset**, jalankan aplikasi pada dataset sebagai **experiment**, nilai hasilnya dengan **evaluator**, lalu bandingkan antar versi. Evaluasi RAG khusus (Ragas, DeepEval) dibahas di [Evaluasi RAG](#llm.evaluasi-rag-ragas-deepeval).'),
      code('Buat dataset', `from langfuse import get_client

langfuse = get_client()
langfuse.create_dataset(name="support-v1")

cases = [
    ({"question": "Status pesanan A-100?"}, "dikirim"),
    ({"question": "Pesanan Z-999 di mana?"}, "tidak ditemukan"),
    ({"question": "Saya mau refund A-100"}, "approval"),
]
for inp, expected in cases:
    langfuse.create_dataset_item(dataset_name="support-v1", input=inp, expected_output=expected)`),
      code('Jalankan experiment dengan evaluator', `from langfuse import Evaluation, get_client
from pydantic import BaseModel
from langchain.chat_models import init_chat_model

langfuse = get_client()
judge = init_chat_model("anthropic:claude-opus-5-5")


def task(*, item, **kwargs):
    out = graph.invoke({"messages": [{"role": "user", "content": item.input["question"]}]})
    return out["messages"][-1].text


def contains_expected(*, input, output, expected_output, **kwargs):
    ok = expected_output.lower() in output.lower()
    return Evaluation(name="contains_expected", value=1.0 if ok else 0.0)


class Verdict(BaseModel):
    score: float  # 0..1
    reason: str


def helpfulness(*, input, output, **kwargs):
    v = judge.with_structured_output(Verdict).invoke(
        f"Nilai 0-1 seberapa membantu dan sopan jawaban CS ini.\\nPertanyaan: {input}\\nJawaban: {output}"
    )
    return Evaluation(name="helpfulness", value=v.score, comment=v.reason)


scores: dict[str, float] = {}


def average(*, item_results, **kwargs):
    vals = [e.value for r in item_results for e in r.evaluations if e.name == "contains_expected"]
    scores["pass_rate"] = sum(vals) / len(vals) if vals else 0.0
    return Evaluation(name="pass_rate", value=scores["pass_rate"])


dataset = langfuse.get_dataset("support-v1")
result = dataset.run_experiment(
    name="prompt-v2",
    task=task,
    evaluators=[contains_expected, helpfulness],
    run_evaluators=[average],
    max_concurrency=3,
)
print(result.format())`),
      { type: 'table', head: ['Jenis evaluator', 'Kapan dipakai', 'Catatan'], rows: [
        ['Kode (exact/contains/regex/JSON valid)', 'Jawaban punya kebenaran objektif', 'Murah, deterministik; mulai dari sini'],
        ['LLM-as-judge', 'Nada, kelengkapan, relevansi', 'Kalibrasi dengan 20–30 penilaian manusia dulu'],
        ['Penilaian manusia', 'Kasus ambigu, rilis besar', 'Annotation queue di Langfuse'],
        ['Metrik operasional', 'Latensi, biaya, jumlah langkah', 'Ambil dari trace experiment'],
      ] },
      code('Gate kualitas di CI (ide)', `# evals/run.py dijalankan di pipeline sebelum merge
# Gagal bila pass_rate di bawah ambang supaya regresi prompt tidak lolos
pass_rate = scores["pass_rate"]  # diisi run evaluator average() di atas
if pass_rate < 0.9:
    raise SystemExit(f"pass_rate {pass_rate:.2f} < 0.90")`),
      ...practice('eval', ['Dataset berisi minimal 20 kasus, termasuk 5 kasus gagal dari trace.', 'Experiment dua versi prompt terlihat berdampingan di Langfuse.', 'LLM-as-judge setuju dengan penilaianmu pada minimal 80% dari 20 sampel.', 'Skrip eval gagal (exit code bukan 0) saat pass rate turun.']),
      references(['Experiments via SDK', 'https://langfuse.com/docs/evaluation/experiments/experiments-via-sdk'], ['Datasets', 'https://langfuse.com/docs/evaluation/experiments/datasets'], ['LLM-as-a-judge', 'https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge']),
    ],
  },
  {
    id: 'aie-fullstack-deploy',
    title: 'AI Engineer: Full Stack FastAPI + Next.js & Produksi',
    summary: 'Endpoint SSE untuk graf LangGraph, UI streaming di Next.js, Docker, dan checklist keamanan.',
    track: PRODUCTION, source: aiEngineerSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Arsitektur yang umum untuk freelance: **Next.js** sebagai UI dan BFF (autentikasi, sesi), **FastAPI** menjalankan graf LangGraph dan mengirim token lewat Server-Sent Events. Next.js meneruskan stream ke browser, sehingga API key model dan Langfuse hanya ada di server Python.'),
      code('src/ai_lab/api.py — FastAPI SSE', `import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langfuse.langchain import CallbackHandler
from .graph import graph  # dikompilasi dengan PostgresSaver di produksi

app = FastAPI()


class ChatIn(BaseModel):
    thread_id: str
    message: str


@app.post("/chat")
async def chat(body: ChatIn):
    config = {
        "configurable": {"thread_id": body.thread_id},
        "callbacks": [CallbackHandler()],
        "metadata": {"langfuse_session_id": body.thread_id},
    }

    async def events():
        inputs = {"messages": [{"role": "user", "content": body.message}]}
        async for token, meta in graph.astream(inputs, config, stream_mode="messages"):
            if token.text and meta.get("langgraph_node") == "model":
                yield f"data: {json.dumps({'text': token.text})}\\n\\n"
        yield "data: [DONE]\\n\\n"

    return StreamingResponse(events(), media_type="text/event-stream")`),
      code('Next.js — app/api/chat/route.ts (proxy dengan sesi)', `export async function POST(request: Request) {
  // Validasi sesi di sini; thread_id diturunkan dari user id, bukan dari input klien.
  const { message } = await request.json();
  const upstream = await fetch(process.env.AGENT_URL + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thread_id: 'user-42', message }),
  });
  return new Response(upstream.body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}`, 'ts'),
      code('Client Component — baca stream', `'use client';
import { useState } from 'react';

export default function Chat() {
  const [answer, setAnswer] = useState('');

  async function send(message: string) {
    setAnswer('');
    const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message }) });
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const events = buffer.split('\\n\\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        const data = event.replace(/^data: /, '');
        if (data === '[DONE]') return;
        setAnswer((prev) => prev + JSON.parse(data).text);
      }
    }
  }

  return (
    <form action={(form) => send(String(form.get('q')))}>
      <input name="q" placeholder="Tanya sesuatu" />
      <button>Kirim</button>
      <p>{answer}</p>
    </form>
  );
}`, 'ts'),
      code('Dockerfile — layanan agent', `FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY src ./src
CMD ["uv", "run", "uvicorn", "ai_lab.api:app", "--host", "0.0.0.0", "--port", "8000"]`, 'text'),
      heading('Checklist produksi'),
      { type: 'steps', items: [
        { title: 'Keamanan', text: 'Tool tulis/hapus memakai approval (interrupt) dan otorisasi per user. Perlakukan isi dokumen dan hasil web sebagai data, bukan instruksi, untuk mengurangi prompt injection. Batasi tool hanya pada aksi yang dibutuhkan.' },
        { title: 'Keandalan', text: 'Set recursion_limit, timeout, dan retry dengan backoff untuk 429/5xx. Checkpointer Postgres agar percakapan selamat dari restart.' },
        { title: 'Biaya', text: 'Pantau token per request di Langfuse, aktifkan prompt caching untuk system prompt panjang, dan rate limit per user.' },
        { title: 'Kualitas', text: 'Eval dataset dijalankan di CI; trace gagal dari produksi dimasukkan ke dataset setiap minggu.' },
        { title: 'Ekosistem', text: 'Pelajari [MCP](#llm.mcp-model-context-protocol) untuk menghubungkan tool lintas aplikasi; LangChain menyediakan adapter MCP.' },
      ] },
      ...practice('fullstack', ['Token muncul bertahap di UI Next.js.', 'API key model tidak pernah dikirim ke browser.', 'Setiap request chat menjadi trace Langfuse dengan session_id thread.', 'Container agent berjalan dengan docker run dan terhubung ke Postgres.']),
      references(['FastAPI StreamingResponse', 'https://fastapi.tiangolo.com/advanced/custom-response/'], ['LangGraph streaming', 'https://docs.langchain.com/oss/python/langgraph/streaming'], ['Next.js Route Handlers', 'https://nextjs.org/docs/app/getting-started/route-handlers'], ['MCP adapters LangChain', 'https://docs.langchain.com/oss/python/langchain/mcp']),
    ],
  },
  {
    id: 'aie-proyek-akhir',
    title: 'AI Engineer: Proyek Akhir Support Agent',
    summary: 'Satukan RAG, LangGraph, approval, Langfuse, eval, dan UI Next.js dalam satu produk portfolio.',
    track: PRODUCTION, source: aiEngineerSource, duration: '7–10 hari', level: 'Hard',
    blocks: [
      paragraph('Bangun **Support Agent** untuk aplikasi Learning Tracker (proyek akhir [Next.js](#js.nextjs-proyek-learning-tracker)). Agent menjawab pertanyaan dari dokumentasi (RAG), mengecek progres user lewat tool, dan meminta approval admin sebelum mereset progres. Proyek ini menunjukkan seluruh skill AI Engineer dalam satu repo.'),
      { type: 'table', head: ['Fitur', 'Kriteria penerimaan'], rows: [
        ['Tanya dokumentasi', 'Jawaban mengutip sumber chunk; menolak menjawab bila konteks tidak ada'],
        ['Tool data user', 'Hanya data milik user yang login; thread_id dari sesi'],
        ['Reset progres', 'interrupt() menunggu admin; tidak ada reset ganda saat resume'],
        ['Observability', 'Trace per request dengan user/session, prompt dari Langfuse'],
        ['Eval', 'Dataset ≥ 30 kasus, pass rate & helpfulness tercatat untuk tiap versi'],
        ['UI', 'Chat streaming di Next.js, status "menunggu approval" terlihat'],
      ] },
      { type: 'steps', items: [
        { title: 'Hari 1–2: RAG', text: 'Indeks dokumentasi ke pgvector, buat retriever sebagai tool, uji 10 pertanyaan.' },
        { title: 'Hari 3–4: Graf', text: 'StateGraph dengan router (dokumentasi / data user / aksi), ToolNode, PostgresSaver, dan interrupt approval.' },
        { title: 'Hari 5: Langfuse', text: 'Pasang CallbackHandler, pindahkan system prompt ke prompt management, samarkan data pribadi.' },
        { title: 'Hari 6–7: Eval', text: 'Susun dataset, evaluator kode + LLM-as-judge, jalankan experiment untuk dua versi prompt, pasang gate di CI.' },
        { title: 'Hari 8–10: Full stack & rilis', text: 'Endpoint SSE, UI Next.js, Docker Compose (agent, Postgres, Langfuse), README dengan diagram graf dan hasil eval.' },
      ] },
      heading('Latihan evaluasi — jawab sebelum membuka solusi'),
      { type: 'qa', items: [
        { id: 'AIE-01', q: 'Kapan cukup memakai create_agent dan kapan perlu StateGraph sendiri?', a: [paragraph('create_agent cukup untuk loop model ↔ tool standar, termasuk memory dan middleware. Pakai StateGraph sendiri ketika alur punya langkah tetap (klasifikasi, validasi), percabangan bisnis, beberapa agent, atau titik approval yang harus eksplisit dan dapat diuji per node.')] },
        { id: 'AIE-02', q: 'Setelah resume interrupt, email notifikasi terkirim dua kali. Apa penyebab dan perbaikannya?', a: [paragraph('Node yang berisi interrupt() dijalankan ulang dari awal saat resume, sehingga kode sebelum interrupt ikut terulang. Pindahkan pengiriman email ke node setelah approval, atau buat operasi idempotent dengan kunci unik per thread/aksi.')] },
        { id: 'AIE-03', q: 'Jawaban agent memburuk setelah prompt diubah, tetapi tidak ada error. Bagaimana mendeteksinya lebih awal?', a: [paragraph('Jalankan experiment dataset di CI untuk setiap perubahan prompt/model dan gagalkan pipeline bila skor turun di bawah ambang. Versikan prompt di Langfuse agar trace menunjukkan versi yang dipakai dan rollback bisa dilakukan lewat label.')] },
        { id: 'AIE-04', q: 'Mengapa thread_id tidak boleh diambil langsung dari body request klien?', a: [paragraph('thread_id menentukan state percakapan yang dimuat checkpointer. Bila klien bebas mengirimnya, user A bisa membaca atau melanjutkan percakapan user B. Turunkan thread_id dari sesi yang sudah divalidasi di server (BFF Next.js), lalu teruskan ke layanan agent.')] },
      ] },
      ...practice('project', ['Semua kriteria penerimaan terpenuhi dan diuji dengan dua akun.', 'Hasil eval dua versi prompt didokumentasikan di README.', 'docker compose up menjalankan seluruh stack dari nol.', 'Demo video 3 menit siap untuk portfolio freelance.']),
      paragraph('Perbaiki bagian yang belum lolos dengan kembali ke [LangGraph Memory & HITL](#llm.aie-langgraph-memory-hitl), [Langfuse](#llm.aie-langfuse-tracing), atau [Evaluasi](#llm.aie-evaluasi-langfuse).'),
      references(['LangGraph docs', 'https://docs.langchain.com/oss/python/langgraph/overview'], ['Langfuse docs', 'https://langfuse.com/docs'], ['Claude API docs', 'https://platform.claude.com/docs']),
    ],
  },
];
