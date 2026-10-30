import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const PRACTICE = 'Python Praktik';

export const pythonPracticeTracks: Track[] = [
  { title: PRACTICE, summary: 'Keterampilan proyek nyata: pytest mendalam, packaging dengan pyproject.toml dan uv, serta proyek CLI otomasi yang siap dipasang sebagai perintah.' },
];

export const pythonPracticeSource = 'Python Praktik: materi tambahan dari dokumentasi resmi pytest, Python Packaging User Guide, dan uv (30 Oktober 2026)';

const base = { track: PRACTICE, source: pythonPracticeSource };

/** Lanjutan Python Inti: fokus pada tes, distribusi paket, dan alat CLI. */
export const pythonPracticeModules: Omit<Module, 'code'>[] = [
  {
    ...base,
    id: 'py-pytest-mendalam',
    title: 'Python: pytest Mendalam',
    summary: 'Fixture (scope, yield, conftest, factory), parametrize, monkeypatch, tmp_path, unittest.mock, tes exception, coverage, dan tes kode async.',
    duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Di [Type Hints, uv, Ruff, mypy & pytest](#python.py-typing-tooling) kita baru memakai fixture sederhana dan `parametrize`. Modul ini membahas alat yang membuat test suite tetap cepat dan mudah dirawat saat proyek membesar: fixture bertingkat dengan teardown, mengganti dependensi luar (env, HTTP, waktu) tanpa jaringan, mengukur coverage, dan menguji kode `async`.'),
      heading('Fixture: scope, yield, conftest, factory'),
      paragraph('Fixture di `tests/conftest.py` otomatis tersedia untuk semua tes di folder itu tanpa perlu di-import. Kode sebelum `yield` adalah *setup*, sesudahnya *teardown*. `scope` menentukan seberapa sering fixture dibuat ulang: `function` (default), `class`, `module`, `package`, atau `session`.'),
      code('tests/conftest.py', `import sqlite3
from collections.abc import Callable, Iterator

import pytest


@pytest.fixture(scope="session")
def skema() -> str:
    # dibuat sekali untuk seluruh sesi tes
    return "CREATE TABLE transaksi (id INTEGER PRIMARY KEY, jumlah INTEGER, kategori TEXT)"


@pytest.fixture
def db(skema: str) -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(":memory:")  # database baru untuk SETIAP tes (scope function)
    conn.execute(skema)
    yield conn  # tes berjalan di sini
    conn.close()  # teardown: tetap jalan walau tes gagal


@pytest.fixture
def buat_transaksi(db: sqlite3.Connection) -> Callable[..., int]:
    """Factory fixture: tes bisa membuat data sebanyak yang dibutuhkan."""

    def _buat(jumlah: int, kategori: str = "makan") -> int:
        cur = db.execute(
            "INSERT INTO transaksi (jumlah, kategori) VALUES (?, ?)", (jumlah, kategori)
        )
        assert cur.lastrowid is not None
        return cur.lastrowid

    return _buat`, 'python'),
      code('src/kas/kurs.py — kode yang akan diuji', `import asyncio
import os
from typing import Protocol

import httpx


def ambil_kurs(mata_uang: str) -> float:
    base = os.environ.get("KURS_API", "https://kurs.contoh.id")
    r = httpx.get(f"{base}/kurs/{mata_uang}", timeout=5)
    r.raise_for_status()
    return float(r.json()["rate"])


def konversi(jumlah: float, mata_uang: str) -> int:
    if jumlah < 0:
        raise ValueError("jumlah tidak boleh negatif")
    if mata_uang == "IDR":
        return round(jumlah)
    return round(jumlah * ambil_kurs(mata_uang))


class Pengirim(Protocol):
    async def kirim(self, pesan: str) -> None: ...


async def kirim_semua(pengirim: Pengirim, daftar: list[str]) -> int:
    async with asyncio.TaskGroup() as tg:
        for pesan in daftar:
            tg.create_task(pengirim.kirim(pesan))
    return len(daftar)`, 'python'),
      code('tests/test_kurs.py — parametrize, raises, mock, monkeypatch, tmp_path', `import sqlite3
from collections.abc import Callable
from pathlib import Path
from unittest.mock import Mock, patch

import httpx
import pytest

from kas import kurs


def test_total_per_kategori(db: sqlite3.Connection, buat_transaksi: Callable[..., int]) -> None:
    buat_transaksi(10_000)
    buat_transaksi(5_000)
    buat_transaksi(7_000, kategori="transport")
    (total,) = db.execute("SELECT SUM(jumlah) FROM transaksi WHERE kategori = 'makan'").fetchone()
    assert total == 15_000


@pytest.mark.parametrize(
    ("jumlah", "expected"),
    [
        (0, 0),
        (1_500.4, 1_500),
        pytest.param(1_500.5, 1_500, id="banker-rounding"),  # round() Python: ke genap terdekat
        pytest.param(-1, None, marks=pytest.mark.xfail(raises=ValueError, strict=True)),
    ],
)
def test_konversi_idr(jumlah: float, expected: int) -> None:
    assert kurs.konversi(jumlah, "IDR") == expected


def test_jumlah_negatif_ditolak() -> None:
    with pytest.raises(ValueError, match="tidak boleh negatif"):
        kurs.konversi(-5, "USD")


def test_konversi_usd_memakai_kurs() -> None:
    # patch di tempat nama DIPAKAI (kas.kurs), bukan tempat didefinisikan
    with patch("kas.kurs.ambil_kurs", return_value=16_000.0) as palsu:
        assert kurs.konversi(2, "USD") == 32_000
    palsu.assert_called_once_with("USD")


def test_ambil_kurs_tanpa_jaringan(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("KURS_API", "https://uji.lokal")
    respons = Mock()
    respons.json.return_value = {"rate": "16250.5"}
    get_palsu = Mock(return_value=respons)
    monkeypatch.setattr(httpx, "get", get_palsu)  # dikembalikan otomatis setelah tes

    assert kurs.ambil_kurs("USD") == 16_250.5
    get_palsu.assert_called_once_with("https://uji.lokal/kurs/USD", timeout=5)


def test_tulis_laporan(tmp_path: Path) -> None:
    berkas = tmp_path / "laporan.txt"  # folder unik per tes, dibersihkan pytest
    berkas.write_text("total=15000", encoding="utf-8")
    assert berkas.read_text(encoding="utf-8").endswith("15000")`, 'python'),
      heading('Menguji kode async'),
      paragraph('pytest tidak menjalankan `async def` sendiri; butuh plugin. **pytest-asyncio** (`uv add --dev pytest-asyncio`) memakai mode *strict* secara default: hanya tes bertanda `@pytest.mark.asyncio` yang dijalankan di event loop. Mode *auto* (`asyncio_mode = "auto"`) menandai semua tes async otomatis, cocok untuk proyek yang hanya memakai asyncio. Alternatifnya, plugin bawaan **AnyIO** (ikut terpasang bersama httpx) menyediakan `@pytest.mark.anyio`.'),
      code('tests/test_async.py — AsyncMock, timeout, ExceptionGroup', `import asyncio
from unittest.mock import AsyncMock

import pytest

from kas.kurs import kirim_semua


@pytest.mark.asyncio
async def test_kirim_semua_memanggil_pengirim() -> None:
    pengirim = AsyncMock()
    assert await kirim_semua(pengirim, ["a", "b", "c"]) == 3
    assert pengirim.kirim.await_count == 3
    pengirim.kirim.assert_any_await("b")


@pytest.mark.asyncio
async def test_pengirim_lambat_kena_timeout() -> None:
    async def lambat(pesan: str) -> None:
        await asyncio.sleep(10)

    pengirim = AsyncMock()
    pengirim.kirim.side_effect = lambat
    with pytest.raises(TimeoutError):
        async with asyncio.timeout(0.1):
            await kirim_semua(pengirim, ["a"])


@pytest.mark.asyncio
async def test_satu_gagal_semua_dibatalkan() -> None:
    pengirim = AsyncMock()
    pengirim.kirim.side_effect = ConnectionError("smtp mati")
    with pytest.raises(ExceptionGroup) as info:  # TaskGroup membungkus error dalam ExceptionGroup
        await kirim_semua(pengirim, ["a", "b"])
    assert info.group_contains(ConnectionError)`, 'python'),
      heading('Konfigurasi, coverage, dan perintah harian'),
      code('pyproject.toml — pytest & coverage', `[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = ["-ra", "--strict-markers"]      # ringkasan skip/xfail; marker salah ketik = error
markers = ["slow: tes lambat, lewati dengan -m 'not slow'"]
asyncio_mode = "strict"                      # default pytest-asyncio; "auto" untuk proyek asyncio murni

[tool.coverage.run]
branch = true                                # hitung cabang if/else, bukan hanya baris
source = ["kas"]

[tool.coverage.report]
show_missing = true
fail_under = 80                              # CI gagal bila coverage turun di bawah 80%`, 'text'),
      code('Terminal', `uv add --dev pytest pytest-cov pytest-asyncio
uv run pytest                          # semua tes
uv run pytest tests/test_kurs.py -k konversi   # satu file, filter nama
uv run pytest -x --lf                  # berhenti di gagal pertama; ulangi yang gagal terakhir
uv run pytest -m "not slow"            # lewati tes bertanda slow
uv run pytest --durations=5            # 5 tes paling lambat
uv run pytest --cov                    # coverage memakai [tool.coverage]
uv run pytest --cov --cov-report=html  # laporan HTML di htmlcov/`, 'bash'),
      table(['Alat', 'Pakai untuk', 'Catatan'], [
        ['`monkeypatch`', 'Env var, atribut modul, `sys.path`, direktori kerja', 'Dikembalikan otomatis setelah tes'],
        ['`unittest.mock.patch`', 'Mengganti fungsi/kelas dan memeriksa pemanggilan', 'Patch nama di modul yang **memakai**, bukan modul asal'],
        ['`Mock(spec=...)` / `create_autospec`', 'Mock yang menolak atribut/method yang tidak ada', 'Mencegah tes lulus karena salah ketik nama method'],
        ['`AsyncMock`', 'Dependensi `async`', 'Cek dengan `assert_awaited_once_with`'],
        ['`tmp_path`', 'File dan folder sementara', 'Unik per tes; gunakan `tmp_path_factory` untuk scope session'],
        ['`capsys` / `caplog`', 'Memeriksa output `print` dan logging', '`caplog.at_level(logging.INFO)` untuk level rendah'],
      ]),
      callout('tip', 'Struktur tes yang tahan lama', 'Cerminkan struktur paket: `tests/unit/` untuk logika murni (cepat, tanpa I/O) dan `tests/integration/` untuk database atau HTTP sungguhan. Satu tes menguji satu perilaku dengan pola **Arrange–Act–Assert**. Lebih baik mendesain kode agar dependensi bisa disuntikkan (parameter atau Protocol) daripada mem-*patch* banyak hal; banyak `patch` biasanya tanda kode terlalu terikat.'),
      ...quiz([
        ['PYP-01', 'Fungsi `laporan()` di `kas/laporan.py` memanggil `ambil_kurs` yang di-import dengan `from kas.kurs import ambil_kurs`. Mengapa `patch("kas.kurs.ambil_kurs")` tidak berpengaruh?', '`from ... import` membuat nama `ambil_kurs` baru di namespace `kas.laporan` yang menunjuk fungsi asli. Patch pada `kas.kurs` hanya mengganti nama di modul asal, sedangkan `laporan()` mencari nama di modulnya sendiri. Patch yang benar: `patch("kas.laporan.ambil_kurs")`.'],
        ['PYP-02', 'Fixture `db` ber-scope `session` dipakai semua tes dan tiap tes menyisipkan data. Masalah apa yang muncul dan bagaimana mengatasinya?', 'Data dari satu tes bocor ke tes lain sehingga hasil bergantung urutan eksekusi (tes saling memengaruhi). Pertahankan resource mahal (engine/koneksi) di scope session, tetapi bungkus setiap tes dalam transaksi yang di-rollback di fixture ber-scope function, atau buat database baru per tes bila cukup murah.'],
        ['PYP-03', 'Proyek memakai pytest-asyncio mode strict, tetapi tes `async def` tanpa marker gagal dengan pesan "async def functions are not natively supported". Mengapa?', 'pytest sendiri tidak punya event loop, jadi tidak bisa menjalankan coroutine. Di mode strict, pytest-asyncio hanya mengambil alih tes bertanda `@pytest.mark.asyncio`, sehingga tes tanpa marker jatuh ke pytest biasa (versi pytest lama hanya memberi warning dan skip, sehingga tes seolah aman). Tambahkan marker, atau aktifkan `asyncio_mode = "auto"` bila proyek hanya memakai asyncio.'],
      ]),
      ...practice('pyp-pytest', [
        'Pindahkan semua fixture bersama ke `tests/conftest.py`; satu fixture memakai `yield` untuk teardown dan satu berupa factory.',
        'Uji fungsi yang memanggil HTTP tanpa jaringan: sekali dengan `monkeypatch`, sekali dengan `patch`, dan pastikan argumen panggilan diperiksa.',
        'Tulis tabel `parametrize` minimal 6 kasus termasuk kasus batas dengan `id` yang deskriptif.',
        'Coverage cabang (`branch = true`) minimal 85% dan CI gagal bila turun; tes async berjalan dengan pytest-asyncio.',
      ]),
      references(
        ['pytest: How to use fixtures', 'https://docs.pytest.org/en/stable/how-to/fixtures.html'],
        ['pytest: Parametrizing tests', 'https://docs.pytest.org/en/stable/how-to/parametrize.html'],
        ['pytest: monkeypatch', 'https://docs.pytest.org/en/stable/how-to/monkeypatch.html'],
        ['pytest: Assertions about expected exceptions', 'https://docs.pytest.org/en/stable/how-to/assert.html'],
        ['unittest.mock', 'https://docs.python.org/3/library/unittest.mock.html'],
        ['pytest-asyncio: concepts', 'https://pytest-asyncio.readthedocs.io/en/stable/concepts.html'],
      ),
    ],
  },
  {
    ...base,
    id: 'py-packaging-pyproject',
    title: 'Python: Packaging dengan pyproject.toml & uv',
    summary: 'Anatomi pyproject.toml, src layout, build backend, entry point, versi, lock file, virtual env, serta build & publish ke TestPyPI.',
    duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Packaging adalah cara mengubah folder kode menjadi **distribusi** yang bisa dipasang orang lain: *wheel* (`.whl`, siap pasang) dan *sdist* (`.tar.gz`, kode sumber). Sejak PEP 517/518/621, semua metadata cukup ditulis di `pyproject.toml`; `setup.py` tidak lagi diperlukan untuk proyek Python murni. uv mengurus virtual env, lock file, build, dan publish dalam satu alat.'),
      code('Struktur src layout', `kas-ringkas/
├── pyproject.toml          # metadata, dependensi, build-system, konfigurasi alat
├── uv.lock                 # versi persis semua dependensi (di-commit)
├── README.md
├── LICENSE
├── src/
│   └── kas_ringkas/        # nama import (underscore); nama distribusi boleh pakai "-"
│       ├── __init__.py
│       ├── __main__.py     # python -m kas_ringkas
│       └── cli.py
└── tests/
    └── test_cli.py`, 'text'),
      callout('info', 'Mengapa src layout', 'Dengan kode di `src/`, Python tidak bisa meng-import paket langsung dari folder kerja. Tes dipaksa memakai paket yang **terpasang** (uv memasangnya dalam mode editable), sehingga kesalahan packaging seperti file yang lupa ikut terbawa terdeteksi sebelum publish.'),
      code('pyproject.toml — anatomi lengkap', `[project]
name = "kas-ringkas"                        # nama distribusi di PyPI
version = "0.1.0"                           # format PEP 440: 1.2.3, 1.3.0b1, 2.0.0rc1
description = "Ringkas pengeluaran dari file CSV"
readme = "README.md"
requires-python = ">=3.12"
license = "MIT"                             # ekspresi SPDX (PEP 639)
license-files = ["LICENSE"]
authors = [{ name = "Ani", email = "ani@contoh.id" }]
classifiers = [
    "Programming Language :: Python :: 3",
    "Operating System :: OS Independent",
]
dependencies = []                           # dependensi runtime: rentang longgar, mis. "httpx>=0.27"

[project.optional-dependencies]
excel = ["openpyxl>=3.1"]                   # dipasang dengan: kas-ringkas[excel]

[project.scripts]
kas = "kas_ringkas.cli:main"                # membuat perintah \`kas\` saat paket dipasang

[project.urls]
Homepage = "https://github.com/contoh/kas-ringkas"

[dependency-groups]                         # PEP 735: hanya untuk pengembangan, tidak ikut terpublish
dev = ["pytest>=8", "pytest-cov", "ruff", "mypy"]

[build-system]                              # alat yang membangun wheel/sdist
requires = ["uv_build>=0.11,<0.12"]         # salin persis dari hasil uv init versi Anda
build-backend = "uv_build"

[[tool.uv.index]]                           # target publish uji coba
name = "testpypi"
url = "https://test.pypi.org/simple/"
publish-url = "https://test.pypi.org/legacy/"
explicit = true                             # jangan dipakai untuk mencari dependensi biasa`, 'text'),
      table(['Build backend', 'Cocok untuk', 'Catatan'], [
        ['`uv_build`', 'Paket Python murni dengan src layout', 'Default `uv init --package`; cepat, konfigurasi minimal'],
        ['`hatchling`', 'Python murni dengan kebutuhan kustom', 'Plugin `hatch-vcs` untuk versi dari tag git'],
        ['`setuptools`', 'Proyek lama, ekstensi C', 'Masih paling luas dipakai; tidak perlu `setup.py` lagi'],
        ['`flit-core`', 'Library kecil yang sederhana', 'Hampir tanpa konfigurasi'],
        ['`maturin`', 'Ekstensi Rust (PyO3)', 'Menggabungkan kurikulum Rust dan Python dalam satu paket'],
      ]),
      code('Alur kerja dengan uv', `uv init --package kas-ringkas           # src layout + [build-system] + [project.scripts]
uv add httpx                            # dependensi runtime -> [project] dependencies + uv.lock
uv add --dev pytest ruff                # masuk [dependency-groups] dev
uv lock --upgrade-package httpx         # naikkan satu dependensi saja
uv sync --locked                        # CI: gagal bila uv.lock tidak sesuai pyproject.toml
uv run kas --version                    # jalankan entry point dari .venv proyek

uv version --bump minor                 # 0.1.0 -> 0.2.0 (juga: patch, major, beta, stable)
uv build                                # dist/kas_ringkas-0.2.0.tar.gz + dist/kas_ringkas-0.2.0-py3-none-any.whl
UV_PUBLISH_TOKEN=pypi-... uv publish --index testpypi   # token dari akun TestPyPI

# Uji pasang dari TestPyPI di lingkungan terpisah (bukan dari folder proyek)
uv run --with kas-ringkas --no-project --index https://test.pypi.org/simple/ -- kas --version
uv tool install .                       # pasang perintah kas secara global dari kode lokal`, 'bash'),
      table(['Topik', 'Praktik yang disarankan'], [
        ['Lock file', '`uv.lock` di-commit, untuk aplikasi maupun library. Lock menentukan versi persis di lingkungan Anda; pengguna library tetap mengikuti rentang di `dependencies`'],
        ['Virtual env', '`uv run`/`uv sync` membuat `.venv` otomatis. Jangan commit `.venv`; tanpa uv: `python -m venv .venv` lalu `pip install -e .`'],
        ['Versi', 'Ikuti PEP 440 (gaya SemVer). Baca versi saat runtime dengan `importlib.metadata.version("kas-ringkas")`, bukan menyalin string'],
        ['Publish', 'Uji di TestPyPI dulu. Di GitHub Actions, gunakan *trusted publishing* (OIDC) agar tidak menyimpan token'],
        ['Isi paket', 'Buka wheel (file zip) dan periksa isinya sebelum publish pertama'],
      ]),
      callout('warn', 'Versi tidak bisa ditimpa', 'PyPI dan TestPyPI menolak upload ulang dengan nomor versi yang sama, bahkan setelah file dihapus. Naikkan versi untuk setiap rilis, dan gunakan nama paket yang unik saat berlatih di TestPyPI.'),
      ...quiz([
        ['PYP-04', 'Apa beda `[project] dependencies` dan `[dependency-groups] dev`?', '`dependencies` adalah kebutuhan runtime yang ikut tertulis di metadata wheel, sehingga terpasang otomatis bersama paket. `dependency-groups` (PEP 735) hanya untuk pengembangan lokal seperti pytest dan ruff, dan tidak ikut terpublish.'],
        ['PYP-05', 'Mengapa library sebaiknya menulis `httpx>=0.27` dan tidak `httpx==0.28.1` di dependencies?', 'Library dipasang bersama paket lain. Pin persis memaksa satu versi dan mudah bentrok dengan library lain yang butuh versi berbeda, sehingga resolver gagal. Versi persis disimpan di lock file aplikasi, sedangkan metadata library cukup menyatakan rentang yang kompatibel.'],
      ]),
      ...practice('pyp-packaging', [
        'Ubah proyek lama (flat layout) menjadi src layout dan pastikan `uv run pytest` tetap hijau.',
        'Tambahkan `[project.scripts]` sehingga `uv run <nama-perintah> --version` mencetak versi dari `importlib.metadata`.',
        '`uv build` menghasilkan wheel dan sdist; buka wheel dan pastikan hanya berisi paket dan metadata.',
        'Publish versi `0.1.0` ke TestPyPI, lalu pasang dari TestPyPI di lingkungan terpisah dan jalankan perintahnya.',
      ]),
      references(
        ['Packaging Python Projects (tutorial)', 'https://packaging.python.org/en/latest/tutorials/packaging-projects/'],
        ['Writing your pyproject.toml', 'https://packaging.python.org/en/latest/guides/writing-pyproject-toml/'],
        ['src layout vs flat layout', 'https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/'],
        ['uv: Building and publishing a package', 'https://docs.astral.sh/uv/guides/package/'],
        ['uv: Working on projects', 'https://docs.astral.sh/uv/guides/projects/'],
        ['importlib.metadata', 'https://docs.python.org/3/library/importlib.metadata.html'],
      ),
    ],
  },
  {
    ...base,
    id: 'py-proyek-cli-otomasi',
    title: 'Python: Proyek CLI Otomasi — Ringkasan Pengeluaran CSV',
    summary: 'Membangun perintah `kas` dengan argparse yang meringkas CSV pengeluaran: pathlib, logging, csv/json, subprocess, penanganan error, tes, dan packaging.',
    duration: '3–4 jam', level: 'Hard',
    blocks: [
      paragraph('Proyek ini menggabungkan dua modul sebelumnya. Kita membangun perintah `kas ringkas <folder>` yang membaca semua CSV mutasi/pengeluaran di satu folder, melewati baris rusak dengan peringatan, lalu mencetak ringkasan per kategori atau menulis laporan `.csv`/`.json`. Laporan JSON mencatat commit git folder data sebagai jejak audit. Hasil akhirnya terpasang sebagai perintah lewat `[project.scripts]`, seperti di [Packaging dengan pyproject.toml & uv](#python.py-packaging-pyproject).'),
      table(['Pilihan', 'Kelebihan', 'Kekurangan'], [
        ['**argparse** (dipilih)', 'Pustaka standar, tanpa dependensi; subcommand, help, dan validasi tipe sudah cukup', 'Lebih verbose; tidak membaca type hint'],
        ['Typer', 'Argumen diturunkan dari type hint, help berwarna', 'Menambah dependensi (Typer, Click, Rich) untuk alat sekecil ini'],
        ['Click', 'Matang, banyak dipakai, komposisi perintah baik', 'Dependensi tambahan, gaya decorator'],
      ]),
      paragraph('Alasan memilih argparse: alat otomasi sering dijalankan di server atau CI yang minimal, dan paket tanpa dependensi runtime dipasang paling cepat dan paling jarang rusak. Bila CLI tumbuh menjadi banyak subcommand dengan output kaya, migrasi ke Typer masuk akal.'),
      code('Contoh data dan pemakaian', `data/oktober.csv
tanggal,keterangan,kategori,jumlah
2026-10-01,Nasi padang,Makan,25000
2026-10-02,Ojek,transport,15000
2026-10-03,Baris rusak,makan,abc
2026-11-01,Kopi,makan,18000

$ kas -v ringkas data
WARNING kas_ringkas.ringkas: oktober.csv:4 dilewati: jumlah tidak valid: 'abc'
makan                43,000.00
transport            15,000.00
TOTAL                58,000.00
INFO kas_ringkas: 1 file, 3 baris, 1 dilewati

$ kas ringkas data -o laporan.json`, 'text'),
      code('src/kas_ringkas/ringkas.py — logika murni (mudah dites)', `import csv
import logging
from collections import defaultdict
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path

log = logging.getLogger(__name__)

KOLOM_WAJIB = {"tanggal", "kategori", "jumlah"}


class FormatCsvSalah(Exception):
    """Header CSV tidak memuat kolom wajib."""


@dataclass(frozen=True, slots=True)
class Baris:
    tanggal: date
    kategori: str
    jumlah: Decimal


@dataclass
class Ringkasan:
    per_kategori: dict[str, Decimal] = field(default_factory=dict)
    per_bulan: dict[str, Decimal] = field(default_factory=dict)
    jumlah_baris: int = 0
    dilewati: int = 0

    @property
    def total(self) -> Decimal:
        return sum(self.per_kategori.values(), Decimal(0))


def parse_baris(row: Mapping[str, str | None]) -> Baris:
    """Ubah satu baris CSV menjadi Baris; ValueError bila datanya rusak."""

    def ambil(kolom: str) -> str:
        return (row.get(kolom) or "").strip()

    try:
        jumlah = Decimal(ambil("jumlah"))  # Decimal, bukan float, untuk uang
    except InvalidOperation:
        raise ValueError(f"jumlah tidak valid: {ambil('jumlah')!r}") from None
    return Baris(
        tanggal=date.fromisoformat(ambil("tanggal")),  # ValueError bila format salah
        kategori=ambil("kategori").lower() or "lainnya",
        jumlah=jumlah,
    )


def ringkas(paths: Iterable[Path]) -> Ringkasan:
    hasil = Ringkasan()
    per_kategori: defaultdict[str, Decimal] = defaultdict(Decimal)
    per_bulan: defaultdict[str, Decimal] = defaultdict(Decimal)

    for path in paths:
        # utf-8-sig: aman untuk CSV ekspor Excel yang diawali BOM
        with path.open(newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            kurang = KOLOM_WAJIB - set(reader.fieldnames or [])
            if kurang:
                raise FormatCsvSalah(f"{path.name}: kolom hilang {sorted(kurang)}")
            for row in reader:
                try:
                    b = parse_baris(row)
                except ValueError as e:
                    log.warning("%s:%d dilewati: %s", path.name, reader.line_num, e)
                    hasil.dilewati += 1
                    continue
                per_kategori[b.kategori] += b.jumlah
                per_bulan[f"{b.tanggal:%Y-%m}"] += b.jumlah
                hasil.jumlah_baris += 1

    hasil.per_kategori = dict(sorted(per_kategori.items(), key=lambda kv: kv[1], reverse=True))
    hasil.per_bulan = dict(sorted(per_bulan.items()))
    return hasil`, 'python'),
      code('src/kas_ringkas/laporan.py — output CSV/JSON dan subprocess', `import csv
import json
import logging
import subprocess
from decimal import Decimal
from pathlib import Path

from kas_ringkas.ringkas import Ringkasan

log = logging.getLogger(__name__)


def versi_data(folder: Path) -> str | None:
    """Commit git terakhir folder data (jejak audit). None bila git/repo tidak ada."""
    try:
        hasil = subprocess.run(
            ["git", "-C", str(folder), "rev-parse", "--short", "HEAD"],  # list, bukan shell=True
            capture_output=True,
            text=True,
            check=True,  # exit code != 0 -> CalledProcessError
            timeout=5,
        )
    except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        log.debug("info git tidak tersedia: %s", e)
        return None
    return hasil.stdout.strip()


def tulis_json(r: Ringkasan, tujuan: Path, versi: str | None) -> None:
    data = {
        "total": str(r.total),  # Decimal -> str agar presisi tidak hilang
        "per_kategori": {k: str(v) for k, v in r.per_kategori.items()},
        "per_bulan": {k: str(v) for k, v in r.per_bulan.items()},
        "baris": r.jumlah_baris,
        "dilewati": r.dilewati,
        "versi_data": versi,
    }
    tujuan.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\\n", encoding="utf-8")


def tulis_csv(r: Ringkasan, tujuan: Path) -> None:
    with tujuan.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["kategori", "jumlah", "persen"])
        for kategori, jumlah in r.per_kategori.items():
            persen = (jumlah / r.total * 100).quantize(Decimal("0.1")) if r.total else Decimal(0)
            w.writerow([kategori, jumlah, persen])
        w.writerow(["TOTAL", r.total, "100.0"])`, 'python'),
      code('src/kas_ringkas/cli.py — argparse, logging, exit code', `import argparse
import logging
import sys
from importlib.metadata import version
from pathlib import Path

from kas_ringkas.laporan import tulis_csv, tulis_json, versi_data
from kas_ringkas.ringkas import FormatCsvSalah, ringkas

log = logging.getLogger("kas_ringkas")


def buat_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="kas", description="Ringkas pengeluaran dari file CSV.")
    p.add_argument("--version", action="version", version=f"%(prog)s {version('kas-ringkas')}")
    p.add_argument("-v", "--verbose", action="count", default=0, help="-v info, -vv debug")
    sub = p.add_subparsers(dest="perintah", required=True)

    r = sub.add_parser("ringkas", help="ringkas semua CSV di satu folder")
    r.add_argument("folder", type=Path)
    r.add_argument("-o", "--output", type=Path, help="laporan .csv atau .json (default: layar)")
    r.add_argument("--pola", default="*.csv", help="pola glob file (default: %(default)s)")
    r.set_defaults(func=jalankan_ringkas)
    return p


def jalankan_ringkas(args: argparse.Namespace) -> int:
    folder: Path = args.folder
    output: Path | None = args.output
    if not folder.is_dir():
        log.error("folder tidak ditemukan: %s", folder)
        return 2
    if output is not None and output.suffix not in {".csv", ".json"}:
        log.error("output harus berakhiran .csv atau .json: %s", output)
        return 2
    files = sorted(folder.glob(args.pola))
    if not files:
        log.error("tidak ada file %s di %s", args.pola, folder)
        return 1

    hasil = ringkas(files)
    if output is None:
        for kategori, jumlah in hasil.per_kategori.items():
            print(f"{kategori:<15}{jumlah:>15,.2f}")
        print(f"{'TOTAL':<15}{hasil.total:>15,.2f}")
    elif output.suffix == ".json":
        tulis_json(hasil, output, versi_data(folder))
    else:
        tulis_csv(hasil, output)
    log.info("%d file, %d baris, %d dilewati", len(files), hasil.jumlah_baris, hasil.dilewati)
    return 0


def main(argv: list[str] | None = None) -> int:
    args = buat_parser().parse_args(argv)  # argumen salah -> SystemExit(2) + pesan usage
    level = [logging.WARNING, logging.INFO, logging.DEBUG][min(args.verbose, 2)]
    fmt = "%(levelname)s %(name)s: %(message)s"
    logging.basicConfig(level=level, format=fmt, stream=sys.stderr)  # log ke stderr, data ke stdout
    try:
        code: int = args.func(args)
        return code
    except FormatCsvSalah as e:
        log.error("%s", e)
        return 1
    except OSError as e:  # izin ditolak, disk penuh, file terkunci
        log.error("gagal membaca/menulis file: %s", e)
        return 1


# src/kas_ringkas/__main__.py berisi:
#     from kas_ringkas.cli import main
#     raise SystemExit(main())`, 'python'),
      code('tests/test_cli.py — memanggil main(argv) langsung', `import json
import logging
from pathlib import Path

import pytest

from kas_ringkas.cli import main
from kas_ringkas.ringkas import parse_baris

CSV = """tanggal,keterangan,kategori,jumlah
2026-10-01,Nasi padang,Makan,25000
2026-10-02,Ojek,transport,15000
2026-10-03,Baris rusak,makan,abc
2026-11-01,Kopi,makan,18000
"""


@pytest.fixture
def folder_data(tmp_path: Path) -> Path:
    data = tmp_path / "data"
    data.mkdir()
    (data / "oktober.csv").write_text(CSV, encoding="utf-8")
    return data


def test_parse_baris_jumlah_rusak() -> None:
    with pytest.raises(ValueError, match="jumlah tidak valid"):
        parse_baris({"tanggal": "2026-10-01", "kategori": "makan", "jumlah": "abc"})


def test_ringkas_ke_json(
    folder_data: Path, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr("kas_ringkas.cli.versi_data", lambda folder: "abc1234")  # tanpa git
    out = tmp_path / "laporan.json"

    assert main(["ringkas", str(folder_data), "-o", str(out)]) == 0

    data = json.loads(out.read_text(encoding="utf-8"))
    assert data["per_kategori"] == {"makan": "43000", "transport": "15000"}
    assert data["per_bulan"] == {"2026-10": "40000", "2026-11": "18000"}
    assert data["dilewati"] == 1
    assert data["versi_data"] == "abc1234"


def test_cetak_ke_layar(folder_data: Path, capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["ringkas", str(folder_data)]) == 0
    assert "TOTAL" in capsys.readouterr().out


def test_folder_tidak_ada(tmp_path: Path, caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.ERROR):
        assert main(["ringkas", str(tmp_path / "tidak-ada")]) == 2
    assert "folder tidak ditemukan" in caplog.text


def test_header_salah(tmp_path: Path) -> None:
    (tmp_path / "x.csv").write_text("tgl,nominal\\n2026-10-01,5\\n", encoding="utf-8")
    assert main(["ringkas", str(tmp_path)]) == 1


def test_tanpa_subcommand_keluar_dengan_kode_2() -> None:
    with pytest.raises(SystemExit) as exc:
        main([])
    assert exc.value.code == 2`, 'python'),
      code('Setup, jalankan, dan pasang sebagai perintah', `uv init --package kas-ringkas --python 3.13
cd kas-ringkas
# di pyproject.toml: [project.scripts] kas = "kas_ringkas.cli:main"
uv add --dev pytest pytest-cov ruff mypy
uv run pytest --cov=kas_ringkas --cov-report=term-missing
uv run ruff check . && uv run mypy --strict src tests

uv run kas -v ringkas data                    # dari .venv proyek
uv run python -m kas_ringkas ringkas data     # lewat __main__.py
uv tool install .                             # perintah kas tersedia di PATH, di luar proyek
kas ringkas ~/Documents/mutasi -o ~/laporan-oktober.json`, 'bash'),
      table(['Keputusan desain', 'Alasan'], [
        ['`main(argv)` mengembalikan exit code', 'Mudah dites tanpa subprocess; console script membungkusnya dengan `sys.exit(main())`'],
        ['Logika di `ringkas.py`, I/O di `laporan.py`, argumen di `cli.py`', 'Logika murni dites cepat; CLI hanya lapisan tipis'],
        ['Log ke stderr, data ke stdout', 'Output bisa di-pipe (`kas ringkas data | sort`) tanpa tercampur pesan log'],
        ['Baris rusak dilewati dengan warning, header salah menghentikan proses', 'Satu baris kotor tidak menggagalkan laporan, tetapi file yang salah format tidak diam-diam menghasilkan angka nol'],
        ['`Decimal` untuk jumlah', 'Float tidak bisa merepresentasikan nilai uang desimal secara tepat'],
        ['`subprocess.run([...], check=True, timeout=5)`', 'Argumen berupa list (tanpa shell, aman dari injeksi), error eksplisit, tidak menggantung selamanya'],
      ]),
      callout('warn', 'Exit code yang konsisten', 'Skrip otomasi dan CI hanya membaca exit code: `0` sukses, `1` gagal saat memproses data, `2` pemakaian salah (konvensi argparse). Jangan biarkan traceback mentah sampai ke pengguna untuk error yang sudah diperkirakan; tangkap di `main`, catat dengan `log.error`, lalu kembalikan kode yang sesuai.'),
      ...quiz([
        ['PYP-06', 'Mengapa tes memanggil `main(["ringkas", ...])` dan bukan menjalankan `subprocess.run(["kas", ...])`?', 'Memanggil fungsi langsung jauh lebih cepat, bisa memakai fixture seperti monkeypatch, capsys, dan caplog, serta coverage terhitung. Cukup satu atau dua smoke test lewat subprocess untuk memastikan entry point terpasang dengan benar.'],
        ['PYP-07', 'Apa risiko `subprocess.run(f"git -C {folder} rev-parse HEAD", shell=True)`?', 'Nama folder dari pengguna disisipkan ke perintah shell. Folder bernama `x; rm -rf ~` akan mengeksekusi perintah tambahan (command injection), dan spasi di path membuat perintah rusak. Memberikan argumen sebagai list tanpa shell meneruskan setiap argumen apa adanya ke program.'],
      ]),
      ...practice('pyp-cli', [
        'Proyek `kas-ringkas` berjalan: `uv run kas ringkas data` mencetak ringkasan, `-o laporan.json` dan `-o laporan.csv` menulis file.',
        'Tambahkan subcommand `bulanan` yang mencetak total per bulan, lengkap dengan tes dan help yang jelas.',
        'Tes mencakup baris rusak, header salah, folder tidak ada, dan argumen salah; coverage minimal 85% dan `mypy --strict` bersih.',
        'Pasang dengan `uv tool install .`, jalankan dari folder lain, lalu jadwalkan sekali seminggu (cron atau Task Scheduler) dan simpan lognya.',
      ]),
      references(
        ['argparse', 'https://docs.python.org/3/library/argparse.html'],
        ['Argparse Tutorial', 'https://docs.python.org/3/howto/argparse.html'],
        ['pathlib', 'https://docs.python.org/3/library/pathlib.html'],
        ['Logging HOWTO', 'https://docs.python.org/3/howto/logging.html'],
        ['subprocess', 'https://docs.python.org/3/library/subprocess.html'],
        ['Creating and packaging command-line tools', 'https://packaging.python.org/en/latest/guides/creating-command-line-tools/'],
      ),
    ],
  },
];
