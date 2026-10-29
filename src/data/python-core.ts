import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const CORE = 'Python Inti';

export const pythonCoreTracks: Track[] = [
  { title: CORE, summary: 'Bahasa Python sebelum framework: koleksi, fungsi, OOP, generator, decorator, typing, tooling, dan asyncio.' },
];

export const pythonCoreSource = 'Python Inti: materi tambahan dari dokumentasi resmi Python 3.13 (29 Oktober 2026)';

const base = { track: CORE, source: pythonCoreSource };

/** Fondasi bahasa ditaruh sebelum FastAPI/Django agar framework tidak dipelajari tanpa dasar. */
export const pythonCoreModules: Omit<Module, 'code'>[] = [
  {
    ...base,
    id: 'py-fondasi-bahasa',
    title: 'Python: Fondasi Bahasa & Koleksi',
    summary: 'Tipe dasar, list/dict/set/tuple, comprehension, unpacking, dan fungsi dengan argumen fleksibel.',
    duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Kode FastAPI dan Django adalah Python biasa. Modul ini menutup fondasi yang dipakai di semua framework: koleksi bawaan, comprehension, unpacking, dan cara fungsi menerima argumen. Jalankan contoh di REPL (`python`) atau file `.py`.'),
      table(['Koleksi', 'Sifat', 'Pakai untuk'], [
        ['list `[1, 2]`', 'Berurutan, bisa diubah', 'Daftar item yang bertambah/berkurang'],
        ['tuple `(1, 2)`', 'Berurutan, tidak bisa diubah', 'Record kecil, kunci dict, nilai kembali ganda'],
        ['dict `{"a": 1}`', 'Kunci → nilai, urutan sisipan dipertahankan', 'Lookup cepat, JSON'],
        ['set `{1, 2}`', 'Unik, tanpa urutan', 'Deduplikasi, cek keanggotaan O(1)'],
      ]),
      code('Koleksi dan comprehension', `transaksi = [
    {"id": 1, "jenis": "pengeluaran", "jumlah": 50_000, "kategori": "makan"},
    {"id": 2, "jenis": "pemasukan", "jumlah": 2_000_000, "kategori": "gaji"},
    {"id": 3, "jenis": "pengeluaran", "jumlah": 120_000, "kategori": "transport"},
]

pengeluaran = [t["jumlah"] for t in transaksi if t["jenis"] == "pengeluaran"]
print(sum(pengeluaran))                                 # 170000

per_id = {t["id"]: t for t in transaksi}                 # dict comprehension
kategori = {t["kategori"] for t in transaksi}            # set comprehension
total = sum(t["jumlah"] for t in transaksi)              # generator expression, tanpa list sementara

pertama, *sisanya = transaksi                            # unpacking
for i, t in enumerate(transaksi, start=1):
    print(i, t["kategori"])

for nama, jumlah in zip(["a", "b"], [10, 20]):
    print(nama, jumlah)`, 'python'),
      code('Fungsi: default, keyword-only, *args, **kwargs', `def format_rupiah(jumlah: int, *, simbol: str = "Rp") -> str:
    """Argumen setelah * wajib ditulis dengan nama: format_rupiah(5000, simbol="IDR")."""
    return f"{simbol} {jumlah:,}".replace(",", ".")


def log(pesan: str, *args, **kwargs) -> None:
    print(pesan, args, kwargs)


log("buat transaksi", 1, 2, user="ani", level="info")

# Jebakan klasik: default mutable dibagi semua pemanggilan
def tambah(item, wadah=None):
    wadah = [] if wadah is None else wadah
    wadah.append(item)
    return wadah`, 'python'),
      callout('warn', 'Truthiness & perbandingan', 'List/dict/string kosong, `0`, dan `None` bernilai False di `if`. Gunakan `is None` untuk mengecek None, dan `==` untuk membandingkan nilai. `is` membandingkan identitas objek, bukan isinya.'),
      ...practice('py-fondasi', ['Hitung total pengeluaran per kategori memakai dict comprehension atau `collections.Counter`.', 'Tulis fungsi dengan argumen keyword-only lalu panggil dengan dan tanpa nama argumen; amati errornya.', 'Jelaskan mengapa default mutable menyebabkan bug.']),
      references(['Tutorial resmi Python', 'https://docs.python.org/3/tutorial/'], ['Data structures', 'https://docs.python.org/3/tutorial/datastructures.html']),
    ],
  },
  {
    ...base,
    id: 'py-oop-dataclass',
    title: 'Python: OOP, dataclass & Protocol',
    summary: 'Class, property, dunder method, dataclass, enum, ABC vs Protocol, dan komposisi.',
    duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Python mendukung OOP tanpa seremoni berlebihan. Untuk objek pembawa data, pakai `dataclass`; untuk kontrak perilaku, pakai `Protocol` (duck typing yang dicek type checker). Konsep ini muncul lagi di Pydantic, SQLAlchemy, dan service layer.'),
      code('Class, property, dan dunder method', `class Dompet:
    def __init__(self, pemilik: str, saldo: int = 0) -> None:
        self.pemilik = pemilik
        self._saldo = saldo              # konvensi: _ berarti internal

    @property
    def saldo(self) -> int:
        return self._saldo

    def setor(self, jumlah: int) -> None:
        if jumlah <= 0:
            raise ValueError("jumlah harus positif")
        self._saldo += jumlah

    def __repr__(self) -> str:
        return f"Dompet({self.pemilik!r}, saldo={self._saldo})"


d = Dompet("ani")
d.setor(10_000)
print(d, d.saldo)`, 'python'),
      code('dataclass dan enum', `from dataclasses import dataclass, field
from datetime import date
from enum import StrEnum


class Jenis(StrEnum):
    PEMASUKAN = "pemasukan"
    PENGELUARAN = "pengeluaran"


@dataclass(frozen=True, slots=True)
class Transaksi:
    jumlah: int
    jenis: Jenis
    tanggal: date = field(default_factory=date.today)
    tag: tuple[str, ...] = ()


t = Transaksi(50_000, Jenis.PENGELUARAN)
print(t)                      # __repr__, __eq__ dibuat otomatis
# t.jumlah = 1                # FrozenInstanceError: objek immutable`, 'python'),
      code('Protocol: kontrak tanpa pewarisan', `from typing import Protocol


class RepoTransaksi(Protocol):
    def simpan(self, t: Transaksi) -> None: ...
    def semua(self) -> list[Transaksi]: ...


class RepoMemori:                   # tidak mewarisi apa pun
    def __init__(self) -> None:
        self._data: list[Transaksi] = []

    def simpan(self, t: Transaksi) -> None:
        self._data.append(t)

    def semua(self) -> list[Transaksi]:
        return list(self._data)


def total(repo: RepoTransaksi) -> int:   # mypy menerima RepoMemori karena bentuknya cocok
    return sum(t.jumlah for t in repo.semua())`, 'python'),
      table(['Pilihan', 'Kapan'], [
        ['dataclass', 'Data internal, tanpa validasi input eksternal'],
        ['Pydantic BaseModel', 'Data dari luar (request, env, JSON) yang perlu divalidasi'],
        ['Protocol', 'Kontrak dependensi (repository, client) untuk testing dan DI'],
        ['ABC', 'Butuh implementasi bersama di kelas induk atau pengecekan saat runtime'],
      ]),
      ...practice('py-oop', ['Ubah dict transaksi dari modul sebelumnya menjadi dataclass frozen.', 'Buat dua implementasi RepoTransaksi (memori dan file JSON) dan uji fungsi total dengan keduanya.', 'Tambahkan validasi di method, lalu tulis satu tes yang mengharapkan ValueError.']),
      references(['Classes', 'https://docs.python.org/3/tutorial/classes.html'], ['dataclasses', 'https://docs.python.org/3/library/dataclasses.html'], ['typing.Protocol', 'https://typing.python.org/en/latest/spec/protocol.html']),
    ],
  },
  {
    ...base,
    id: 'py-generator-decorator',
    title: 'Python: Iterator, Generator, Decorator & Context Manager',
    summary: 'yield untuk data besar, decorator untuk lintas-fungsi, with untuk resource yang wajib ditutup.',
    duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Tiga fitur ini ada di balik banyak API framework: dependency `yield` di FastAPI, decorator `@app.get`, dan `with session:` di SQLAlchemy. Memahaminya membuat kode framework tidak lagi terasa ajaib.'),
      code('Generator: proses file besar tanpa memuat semuanya', `import csv
from collections.abc import Iterator


def baca_transaksi(path: str) -> Iterator[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        for baris in csv.DictReader(f):
            yield baris                        # satu baris per iterasi, memori tetap kecil


def hanya_pengeluaran(rows: Iterator[dict]) -> Iterator[dict]:
    return (r for r in rows if r["jenis"] == "pengeluaran")


total = sum(int(r["jumlah"]) for r in hanya_pengeluaran(baca_transaksi("transaksi.csv")))`, 'python'),
      code('Decorator dengan functools.wraps', `import functools
import time
from collections.abc import Callable
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def timed(fn: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(fn)                    # pertahankan nama & docstring asli
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        mulai = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__} {time.perf_counter() - mulai:.3f}s")
    return wrapper


def retry(times: int):                      # decorator berparameter = fungsi yang mengembalikan decorator
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError:
                    if attempt == times:
                        raise
        return wrapper
    return deco


@retry(times=3)
@timed
def ambil_kurs() -> float:
    return 16_250.0`, 'python'),
      code('Context manager', `from contextlib import contextmanager


@contextmanager
def transaksi_db(conn):
    try:
        yield conn
        conn.commit()          # hanya bila blok with selesai tanpa error
    except Exception:
        conn.rollback()
        raise


# with transaksi_db(conn) as c:
#     c.execute("INSERT ...")`, 'python'),
      ...quiz([
        ['PYI-01', 'Mengapa `sum(x for x in data)` lebih hemat memori daripada `sum([x for x in data])`?', 'Generator expression menghasilkan nilai satu per satu, sedangkan list comprehension membangun seluruh list di memori terlebih dahulu. Hasilnya sama, tetapi untuk data besar generator tidak menyimpan semua elemen sekaligus.'],
        ['PYI-02', 'Apa akibatnya bila decorator tidak memakai functools.wraps?', 'Fungsi hasil dekorasi kehilangan `__name__`, docstring, dan signature aslinya. Log menjadi menyesatkan, dan framework yang membaca signature (misalnya FastAPI untuk parameter) atau dokumentasi otomatis bisa berperilaku salah.'],
      ]),
      ...practice('py-generator', ['Proses CSV 1 juta baris dengan generator dan catat pemakaian memori.', 'Tulis decorator `@timed` lalu pasang pada dua fungsi.', 'Buat context manager yang mencetak "buka" dan "tutup" bahkan saat terjadi exception.']),
      references(['Generators (HOWTO)', 'https://docs.python.org/3/howto/functional.html#generators'], ['contextlib', 'https://docs.python.org/3/library/contextlib.html'], ['functools.wraps', 'https://docs.python.org/3/library/functools.html#functools.wraps']),
    ],
  },
  {
    ...base,
    id: 'py-typing-tooling',
    title: 'Python: Type Hints, uv, Ruff, mypy & pytest',
    summary: 'Proyek Python profesional: dependensi terkunci, lint + format otomatis, type check, dan tes.',
    duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('Python dinamis, tetapi proyek tim butuh pagar. Setup standar saat ini: **uv** untuk Python dan dependensi, **Ruff** untuk lint dan format, **mypy** (atau pyright) untuk type check, dan **pytest** untuk tes. Semuanya dikonfigurasi di `pyproject.toml`.'),
      code('Terminal', `uv init kas --package --python 3.13
cd kas
uv add httpx pydantic
uv add --dev ruff mypy pytest pytest-cov
uv run ruff check --fix .
uv run ruff format .
uv run mypy src
uv run pytest --cov=kas`, 'bash'),
      code('pyproject.toml — bagian konfigurasi', `[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]   # pycodestyle, pyflakes, isort, bugbear, pyupgrade, simplify

[tool.mypy]
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]`, 'text'),
      code('Type hints modern', `from typing import Literal, TypedDict

type Kategori = Literal["makan", "transport", "gaji"]   # alias tipe (Python 3.12+)


class Ringkasan(TypedDict):
    total: int
    per_kategori: dict[str, int]


def ringkas(items: list[tuple[Kategori, int]]) -> Ringkasan:
    per: dict[str, int] = {}
    for kategori, jumlah in items:
        per[kategori] = per.get(kategori, 0) + jumlah
    return {"total": sum(per.values()), "per_kategori": per}


def first[T](xs: list[T]) -> T | None:                   # generic function (Python 3.12+)
    return xs[0] if xs else None`, 'python'),
      code('tests/test_ringkas.py — fixture & parametrize', `import pytest
from kas.ringkas import ringkas


@pytest.fixture
def data():
    return [("makan", 10), ("makan", 5), ("transport", 7)]


def test_total(data):
    assert ringkas(data)["total"] == 22


@pytest.mark.parametrize(("items", "expected"), [([], 0), ([("gaji", 100)], 100)])
def test_total_variasi(items, expected):
    assert ringkas(items)["total"] == expected`, 'python'),
      callout('tip', 'Pasang di CI', 'Jalankan `ruff check`, `ruff format --check`, `mypy`, dan `pytest` di GitHub Actions. Tambahkan pre-commit hook agar format dan lint terjadi sebelum commit.'),
      ...practice('py-tooling', ['Proyek uv dengan Ruff, mypy strict, dan pytest berjalan tanpa error.', 'Perbaiki minimal 3 temuan Ruff dan 2 error mypy pada kode lama.', 'Coverage minimal 80% untuk modul ringkas.']),
      references(['uv', 'https://docs.astral.sh/uv/'], ['Ruff', 'https://docs.astral.sh/ruff/'], ['mypy', 'https://mypy.readthedocs.io/en/stable/'], ['pytest', 'https://docs.pytest.org/en/stable/']),
    ],
  },
  {
    ...base,
    id: 'py-asyncio',
    title: 'Python: asyncio & Konkurensi',
    summary: 'Event loop, async/await, TaskGroup, timeout, semaphore, dan kapan memakai thread atau proses.',
    duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('`async` membuat satu thread melayani banyak operasi I/O yang sedang menunggu (HTTP, database). Ini alasan FastAPI cepat untuk I/O. asyncio **tidak** mempercepat komputasi CPU; untuk itu pakai proses terpisah.'),
      code('TaskGroup, timeout, dan semaphore', `import asyncio
import httpx

URLS = [f"https://httpbin.org/delay/1?i={i}" for i in range(10)]


async def ambil(client: httpx.AsyncClient, sem: asyncio.Semaphore, url: str) -> int:
    async with sem:                                   # batasi 3 request bersamaan
        r = await client.get(url)
        return r.status_code


async def main() -> None:
    sem = asyncio.Semaphore(3)
    async with httpx.AsyncClient(timeout=10) as client:
        async with asyncio.timeout(30):               # batalkan semua bila lewat 30 detik
            async with asyncio.TaskGroup() as tg:     # satu task gagal -> task lain dibatalkan
                tasks = [tg.create_task(ambil(client, sem, u)) for u in URLS]
    print([t.result() for t in tasks])


asyncio.run(main())`, 'python'),
      table(['Beban kerja', 'Alat', 'Alasan'], [
        ['Banyak I/O (HTTP, DB)', 'asyncio', 'Ribuan koneksi dalam satu thread'],
        ['Library I/O yang blocking', '`asyncio.to_thread` / ThreadPoolExecutor', 'Jangan blok event loop'],
        ['Komputasi berat (CPU)', 'ProcessPoolExecutor / multiprocessing', 'Melewati batas GIL dengan proses terpisah'],
      ]),
      callout('warn', 'Jangan memblok event loop', 'Memanggil `time.sleep`, `requests.get`, atau driver database sinkron di dalam fungsi `async` menghentikan semua request lain. Gunakan versi async (`asyncio.sleep`, httpx, asyncpg) atau bungkus dengan `await asyncio.to_thread(fn)`.'),
      ...quiz([
        ['PYI-03', 'Endpoint FastAPI `async def` memanggil `requests.get` yang butuh 2 detik. Apa efeknya saat ada 50 request bersamaan?', 'requests bersifat blocking, sehingga event loop berhenti selama 2 detik setiap panggilan dan request lain mengantre. Throughput turun drastis. Ganti dengan httpx.AsyncClient, atau jadikan endpoint `def` biasa agar FastAPI menjalankannya di threadpool.'],
      ]),
      ...practice('py-asyncio', ['Bandingkan waktu 10 request berurutan vs TaskGroup.', 'Semaphore membatasi jumlah request bersamaan; buktikan dengan log waktu mulai.', 'Timeout membatalkan task yang terlalu lama tanpa meninggalkan task menggantung.']),
      references(['asyncio', 'https://docs.python.org/3/library/asyncio.html'], ['TaskGroup', 'https://docs.python.org/3/library/asyncio-task.html#task-groups'], ['FastAPI: async', 'https://fastapi.tiangolo.com/async/']),
    ],
  },
];
