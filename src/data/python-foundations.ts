import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'Python Dasar';
const MAHIR = 'Python Mahir';
const DATA = 'Python untuk Data';

export const pythonFoundationTracks: Track[] = [
  { title: DASAR, summary: 'Jalur pemula sejati: setup, variabel, kontrol alur, fungsi, koleksi, file, exception, module, dan tur standard library sebelum masuk Python Inti.' },
  { title: MAHIR, summary: 'Python tingkat lanjut: data model & metaprogramming, performa & paralelisme (GIL, free-threaded CPython, profiling), dan Python untuk soal algoritma.' },
  { title: DATA, summary: 'Ekosistem data: NumPy dan vektorisasi, pandas mendalam (plus Polars), serta SQLAlchemy 2.0 dan Alembic di luar web framework.' },
];

export const pythonFoundationSource = 'Python Dasar, Mahir & Data: materi tambahan dari dokumentasi resmi Python, NumPy, pandas, Polars, SQLAlchemy, dan Alembic (2 November 2026)';

const dasar = { track: DASAR, source: pythonFoundationSource };
const mahir = { track: MAHIR, source: pythonFoundationSource };
const data = { track: DATA, source: pythonFoundationSource };

/** Python Dasar mengantar ke Python Inti; Python Mahir dan Python untuk Data melanjutkan setelah Python Praktik. */
export const pythonFoundationModules: Omit<Module, 'code'>[] = [
  /* ──────────────────────── Python Dasar ──────────────────────── */
  {
    ...dasar,
    id: 'pyf-setup-variabel-string',
    title: 'Python Dasar: Setup, REPL, Variabel, Angka & String',
    summary: 'Memasang Python, mencoba REPL, variabel dan tipe dasar, operasi angka, string, f-string, serta program pertama dengan input() dan print().',
    duration: '90 menit', level: 'Easy',
    blocks: [
      paragraph('Belum pernah menulis Python? Mulai di sini. Track **Python Dasar** berjalan pelan: satu konsep, satu contoh kecil, lalu latihan. Setelah lima modul ini, lanjutkan ke [Python: Fondasi Bahasa & Koleksi](#python.py-fondasi-bahasa) di track Python Inti yang lebih padat.'),
      paragraph('Python populer karena kodenya mudah dibaca: tidak ada kurung kurawal atau titik koma, blok kode ditandai **indentasi** (4 spasi). Python juga *dinamis*: variabel tidak perlu dideklarasikan tipenya, tipe melekat pada **nilai**, bukan pada nama variabel.'),
      code('Terminal — memasang dan menjalankan Python', `# Windows: unduh dari python.org (atau: winget install Python.Python.3.13).
# Mulai 3.14, python.org juga menawarkan "Python install manager" (perintah py install ...);
# ikuti petunjuk di halaman unduhan.
py --version            # launcher "py" di Windows
py -3.13                # buka REPL versi tertentu

# macOS / Linux
python3 --version

# Alternatif lintas OS: uv mengelola versi Python tanpa installer
uv python install 3.13
uv run --python 3.13 python     # buka REPL
uv run halo.py                  # jalankan file`, 'bash'),
      code('REPL — coba langsung, ketik baris demi baris', `>>> 2 + 3
5
>>> nama = "Sari"           # variabel: nama yang menunjuk ke sebuah nilai
>>> umur = 21
>>> type(nama), type(umur)
(<class 'str'>, <class 'int'>)
>>> umur = "dua puluh satu" # boleh: nama yang sama kini menunjuk nilai bertipe str
>>> help(len)               # dokumentasi fungsi; tekan q untuk keluar
>>> exit                    # Python 3.13+: cukup "exit", tanpa kurung`, 'python'),
      paragraph('REPL (*Read–Eval–Print Loop*) mengevaluasi setiap baris dan langsung mencetak hasilnya. Sejak Python 3.13, REPL bawaan mendukung warna, edit multi-baris, dan riwayat. Untuk program yang lebih dari beberapa baris, tulis di file `.py` lalu jalankan dengan `python nama_file.py`.'),
      code('Angka: int, float, dan jebakan pembagian', `harga = 15_000            # garis bawah hanya untuk keterbacaan: 15000
jumlah = 3
print(harga * jumlah)     # 45000
print(7 / 2)              # 3.5  -> "/" SELALU menghasilkan float
print(7 // 2)             # 3    -> pembagian bulat ke bawah (floor)
print(-7 // 2)            # -4   -> ke bawah, bukan ke arah nol!
print(7 % 3)              # 1    -> sisa bagi; n % 2 == 0 berarti genap
print(2 ** 100)           # int Python tidak punya batas ukuran

print(0.1 + 0.2)          # 0.30000000000000004 -> float adalah biner, tidak tepat
print(round(2.5), round(3.5))   # 2 4 -> pembulatan ke genap terdekat (banker's rounding)

from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 0.3 -> pakai Decimal (dari str!) untuk uang

print(int("42") + 1, float("3.14"), int(3.99))   # 43 3.14 3 -> int() memotong, bukan membulatkan
print(str(2026) + " tahun")                      # angka harus diubah ke str sebelum digabung`, 'python'),
      table(['Tipe', 'Contoh', 'Catatan untuk pemula'], [
        ['`int`', '`42`, `-7`, `1_000_000`', 'Bilangan bulat tanpa batas ukuran'],
        ['`float`', '`3.14`, `1e6`', 'Desimal biner; jangan untuk uang, jangan dibandingkan dengan `==`'],
        ['`str`', '`"halo"`, `\'halo\'`', 'Teks; immutable (tidak bisa diubah per karakter)'],
        ['`bool`', '`True`, `False`', 'Hasil perbandingan; huruf besar di awal'],
        ['`NoneType`', '`None`', 'Penanda "tidak ada nilai"; cek dengan `is None`'],
      ]),
      code('String: indeks, slicing, method, dan f-string', `nama = "Budi Santoso"
print(nama[0], nama[-1])        # B o      -> indeks mulai 0; negatif dihitung dari belakang
print(nama[0:4], nama[5:])      # Budi Santoso -> slicing [awal:akhir), akhir tidak ikut
print(nama[::-1])               # osotnaS iduB -> dibalik
print(len(nama), "Budi" in nama)          # 12 True
print(nama.upper(), nama.lower(), nama.count("o"))
print("  spasi  ".strip(), "a,b,c".split(","), "-".join(["2026", "11", "02"]))
print(nama.replace("Budi", "Ani"), nama.startswith("Bu"))
# nama[0] = "b"                 # TypeError: string tidak bisa diubah; buat string baru

# f-string: tulis f di depan, ekspresi di dalam {}
harga = 1_250_000
pi = 3.14159265
print(f"Total: Rp{harga:,}")               # Total: Rp1,250,000
print(f"Total: Rp{harga:,}".replace(",", "."))   # gaya Indonesia: Rp1.250.000
print(f"{pi:.2f}", f"{0.256:.1%}")         # 3.14 25.6%
print(f"[{nama:<15}]", f"[{nama:>15}]")    # rata kiri / kanan selebar 15
print(f"{7:03d}")                          # 007
print(f"{harga=}")                         # harga=1250000 -> praktis untuk debug`, 'python'),
      code('bagi_tagihan.py — program pertama dengan input() dan print()', `# Jalankan: python bagi_tagihan.py
total = int(input("Total tagihan (Rp): "))      # input() SELALU mengembalikan str
orang = int(input("Jumlah orang: "))
tip_persen = float(input("Tip % (Enter = 0): ") or 0)   # string kosong bernilai False -> 0

tip = total * tip_persen / 100
per_orang = (total + tip) / orang

print("-" * 30)
print(f"Tip       : Rp{tip:>12,.0f}")
print(f"Per orang : Rp{per_orang:>12,.0f}")
print("Selesai", "terima kasih", sep=" | ", end="!\\n")   # sep = pemisah, end = akhiran`, 'python'),
      callout('warn', 'input() selalu str', '`"5" + 3` menghasilkan `TypeError`, sedangkan `"5" * 3` menghasilkan `"555"`. Ubah dulu dengan `int()` atau `float()`. Bila pengguna mengetik huruf, `int("abc")` melempar `ValueError`; cara menanganinya dibahas di modul File & Exception.'),
      callout('tip', 'Gaya penamaan (PEP 8)', 'Variabel dan fungsi memakai `snake_case` (`total_harga`), konstanta `HURUF_BESAR` (`PAJAK = 0.11`), kelas `PascalCase`. Pilih nama yang menjelaskan isi: `jumlah_orang` lebih baik daripada `n` atau `x2`.'),
      ...quiz([
        ['PYF-01', 'Mengapa `0.1 + 0.2 == 0.3` bernilai False, dan apa yang dipakai untuk menghitung uang?', 'float disimpan dalam biner, dan 0.1 tidak bisa direpresentasikan tepat dalam biner, sehingga hasilnya 0.30000000000000004. Untuk uang pakai `Decimal` yang dibuat dari string (`Decimal("0.1")`), atau simpan dalam satuan terkecil sebagai int (rupiah utuh, sen). Untuk membandingkan float pakai `math.isclose`.'],
        ['PYF-02', 'Apa hasil `-7 // 2` dan `int(-3.5)`, dan mengapa berbeda?', '`-7 // 2` menghasilkan -4 karena `//` membulatkan ke bawah (floor) menuju minus tak hingga. `int(-3.5)` menghasilkan -3 karena `int()` memotong bagian desimal (menuju nol). Perbedaan ini sering memicu bug pada perhitungan dengan bilangan negatif.'],
      ]),
      ...practice('pyf-setup', [
        'Python terpasang; `python --version` (atau `py --version`) mencetak versi 3.12 atau lebih baru, dan REPL bisa dibuka serta ditutup.',
        'Tulis `kenalan.py` yang menanyakan nama dan tahun lahir, lalu mencetak "Halo, <nama>! Umurmu sekitar <n> tahun." dengan f-string.',
        'Kembangkan `bagi_tagihan.py`: tampilkan nominal dengan format Rp1.250.000 dan bulatkan per orang ke atas ke kelipatan 1.000 (petunjuk: `math.ceil`).',
        'Di REPL, buktikan sendiri: slicing `[::-1]`, `round(2.5)`, `0.1 + 0.2`, dan error saat mengubah `nama[0]`.',
      ]),
      references(
        ['Python downloads', 'https://www.python.org/downloads/'],
        ['Using Python on Windows', 'https://docs.python.org/3/using/windows.html'],
        ['Tutorial: An Informal Introduction to Python', 'https://docs.python.org/3/tutorial/introduction.html'],
        ['Format Specification Mini-Language', 'https://docs.python.org/3/library/string.html#formatspec'],
        ['PEP 8 — Style Guide', 'https://peps.python.org/pep-0008/'],
      ),
    ],
  },
  {
    ...dasar,
    id: 'pyf-kontrol-alur-fungsi',
    title: 'Python Dasar: Kontrol Alur & Fungsi',
    summary: 'if/elif/else, for/while, range, break/continue, match dasar, fungsi dengan parameter default, *args/**kwargs, nilai kembali ganda, dan scope (LEGB).',
    duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Program berguna karena bisa **memilih** (if), **mengulang** (for/while), dan **dipecah** menjadi bagian kecil yang diberi nama (fungsi). Di Python, blok di bawah `if`, `for`, dan `def` ditandai titik dua `:` lalu indentasi 4 spasi. Indentasi bukan hiasan: salah indentasi berarti logika berbeda atau `IndentationError`.'),
      code('if / elif / else dan ekspresi kondisional', `suhu = 31

if suhu >= 35:
    status = "panas sekali"
elif 28 <= suhu < 35:            # perbandingan berantai: sama dengan 28 <= suhu and suhu < 35
    status = "panas"
elif suhu >= 20:
    status = "nyaman"
else:
    status = "dingin"
print(status)                    # panas

label = "genap" if suhu % 2 == 0 else "ganjil"   # ekspresi kondisional (ternary)

punya_tiket, umur = True, 15
if punya_tiket and not umur < 13:     # and, or, not
    print("boleh masuk")

keranjang = []
if not keranjang:                # list/str/dict kosong, 0, dan None bernilai False
    print("keranjang kosong")`, 'python'),
      code('for, range, enumerate, while, break & continue', `for i in range(5):               # 0, 1, 2, 3, 4 (5 tidak ikut)
    print(i, end=" ")
print()
print(list(range(2, 11, 2)))     # [2, 4, 6, 8, 10] -> range(awal, akhir, langkah)
print(list(range(5, 0, -1)))     # [5, 4, 3, 2, 1]  -> hitung mundur

belanja = ["beras", "telur", "minyak"]
for item in belanja:             # iterasi langsung atas isi, bukan indeks
    print(item.title())
for nomor, item in enumerate(belanja, start=1):   # butuh nomor urut? pakai enumerate
    print(f"{nomor}. {item}")

# while: ulangi selama kondisi benar, cocok bila jumlah putaran belum diketahui
saldo, bulan = 1_000_000, 0
while saldo < 2_000_000:
    saldo *= 1.05                # bunga 5% per bulan
    bulan += 1
print(f"saldo dua kali lipat setelah {bulan} bulan")   # 15

for angka in [3, 8, 5, -1, 7]:
    if angka < 0:
        print("data negatif, berhenti")
        break                    # keluar dari loop sepenuhnya
    if angka % 2 == 0:
        continue                 # lompat ke putaran berikutnya
    print("ganjil:", angka)      # 3, 5`, 'python'),
      code('match: memilih berdasarkan bentuk data (Python 3.10+)', `def http_status(kode: int) -> str:
    match kode:
        case 200 | 201:                      # | = salah satu dari beberapa pola
            return "sukses"
        case 404:
            return "tidak ditemukan"
        case n if 500 <= n < 600:            # guard: pola + syarat tambahan
            return "error server"
        case _:                              # _ = selain semua di atas
            return "lainnya"


def proses(perintah: str) -> str:
    match perintah.split():                  # cocokkan bentuk list hasil split
        case ["keluar"]:
            return "sampai jumpa"
        case ["tambah", nama]:               # menangkap kata kedua ke variabel nama
            return f"menambah {nama}"
        case ["hapus", *daftar] if daftar:   # *daftar menangkap sisa kata
            return f"menghapus {len(daftar)} item"
        case _:
            return f"perintah tidak dikenal: {perintah!r}"


print(http_status(503), proses("tambah kopi"), proses("hapus teh gula"))`, 'python'),
      callout('warn', 'Jebakan match: nama polos selalu menangkap', '`case BATAS:` **tidak** membandingkan dengan variabel `BATAS`; ia menangkap nilai apa pun ke nama baru `BATAS` (seperti `_`). Untuk membandingkan dengan konstanta, pakai nama bertitik seperti `case Status.OK:` (enum) atau literal `case 404:`. Untuk percabangan sederhana, `if/elif` sering lebih jelas daripada `match`.'),
      code('Fungsi: parameter default, argumen bernama, *args, **kwargs', `def hitung_diskon(harga: int, persen: float = 10) -> int:
    """Kembalikan harga setelah diskon. persen opsional, default 10."""
    return round(harga * (1 - persen / 100))


print(hitung_diskon(100_000))                 # 90000 -> pakai default
print(hitung_diskon(100_000, 25))             # 75000
print(hitung_diskon(persen=50, harga=80_000)) # 40000 -> argumen bernama, urutan bebas


def statistik(*angka: float) -> tuple[float, float, float]:
    """*angka mengumpulkan semua argumen posisi menjadi tuple."""
    return min(angka), max(angka), sum(angka) / len(angka)


terkecil, terbesar, rata = statistik(4, 9, 1, 7)   # nilai kembali ganda = tuple yang di-unpack
nilai = [70, 85, 90]
print(statistik(*nilai))                      # * saat MEMANGGIL membongkar list jadi argumen


def buat_profil(nama: str, **info: str) -> dict[str, str]:
    """**info mengumpulkan argumen bernama sisanya menjadi dict."""
    return {"nama": nama, **info}


print(buat_profil("Sari", kota="Medan", hobi="lari"))
# {'nama': 'Sari', 'kota': 'Medan', 'hobi': 'lari'}


def sapa(nama):
    print(f"Halo, {nama}")                    # tanpa return -> fungsi mengembalikan None

hasil = sapa("Ani")
print(hasil)                                  # None`, 'python'),
      code('Scope: LEGB, global, nonlocal', `KURS = 16_000                     # Global: level modul


def ke_rupiah(usd: float) -> float:
    hasil = usd * KURS            # membaca global: boleh
    return hasil                  # hasil = Local: hilang setelah fungsi selesai


total = 0
def tambah_salah(n):
    total += n                    # UnboundLocalError: assignment membuat total dianggap lokal
# Perbaikan terbaik: kembalikan nilai, bukan mengubah global -> total = total + n di pemanggil


def buat_penghitung():
    hitung = 0                    # Enclosing: milik fungsi luar
    def klik():
        nonlocal hitung           # izin mengubah variabel milik fungsi luar
        hitung += 1
        return hitung
    return klik


klik = buat_penghitung()
klik(); klik()
print(klik())                     # 3 -> klik "mengingat" hitung (closure)
print(len("abc"))                 # len = Built-in: urutan pencarian terakhir`, 'python'),
      table(['Urutan pencarian nama (LEGB)', 'Artinya', 'Contoh'], [
        ['**L**ocal', 'Variabel di dalam fungsi yang sedang berjalan', '`hasil` di `ke_rupiah`'],
        ['**E**nclosing', 'Variabel fungsi luar (fungsi bersarang)', '`hitung` di `buat_penghitung`'],
        ['**G**lobal', 'Variabel level modul (file)', '`KURS`'],
        ['**B**uilt-in', 'Nama bawaan Python', '`len`, `print`, `sum`'],
      ]),
      callout('tip', 'Fungsi kecil, satu tugas', 'Fungsi yang baik menerima input lewat parameter dan mengembalikan output dengan `return`, bukan membaca/mengubah variabel global. Fungsi seperti itu mudah dites dan dipakai ulang. Hindari juga default yang mutable (`def f(x, wadah=[])`); alasannya dibahas di [Fondasi Bahasa & Koleksi](#python.py-fondasi-bahasa).'),
      ...quiz([
        ['PYF-03', 'Apa beda `print()` dan `return` di dalam fungsi?', '`print` hanya menampilkan teks ke layar; nilai itu tidak bisa dipakai lagi oleh kode pemanggil. `return` mengirim nilai kembali ke pemanggil sehingga bisa disimpan ke variabel, dihitung, atau dites. Fungsi tanpa `return` mengembalikan `None`.'],
        ['PYF-04', 'Mengapa `def tambah_salah(n): total += n` gagal dengan UnboundLocalError padahal `total` ada di global?', 'Python menentukan scope saat fungsi dikompilasi: karena ada assignment ke `total` di dalam fungsi, `total` dianggap variabel lokal di seluruh fungsi. Saat `total += n` membaca nilainya, variabel lokal itu belum punya nilai. Solusi terbaik: kembalikan hasil (`return total + n`); `global total` memperbaikinya tetapi membuat kode sulit dites.'],
      ]),
      ...practice('pyf-kontrol', [
        'Program tebak angka: komputer memilih `random.randint(1, 100)`, pengguna menebak dalam loop `while` dengan petunjuk "terlalu besar/kecil", berhenti dengan `break` saat benar dan mencetak jumlah tebakan.',
        'Fungsi `kategori_bmi(berat, tinggi)` mengembalikan "kurus/normal/gemuk/obesitas" dengan if/elif; uji dengan 4 nilai berbeda.',
        'Fungsi `rata_rata(*nilai, bulatkan=2)` yang menerima jumlah argumen bebas dan mengembalikan `None` bila tidak ada argumen.',
        'Ubah `proses()` pada contoh match agar mendukung perintah `daftar` yang mencetak semua item yang sudah ditambahkan (simpan di list yang dikembalikan, bukan variabel global).',
      ]),
      references(
        ['Tutorial: More Control Flow Tools', 'https://docs.python.org/3/tutorial/controlflow.html'],
        ['PEP 636 — Structural Pattern Matching: Tutorial', 'https://peps.python.org/pep-0636/'],
        ['Python Scopes and Namespaces', 'https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces'],
      ),
    ],
  },
  {
    ...dasar,
    id: 'pyf-koleksi-pemula',
    title: 'Python Dasar: List, Dict, Set, Tuple & Comprehension',
    summary: 'Empat koleksi bawaan untuk pemula: operasi umum, aliasing, kapan memakai yang mana, lalu mengubah loop menjadi comprehension lewat latihan kecil.',
    duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Hampir setiap program mengolah *kumpulan* data: daftar belanja, nilai siswa, data JSON dari API. Python punya empat koleksi bawaan. Memilih yang tepat membuat kode lebih singkat **dan** lebih cepat: mengecek apakah sebuah nama ada di set jutaan item tetap instan, sedangkan di list harus diperiksa satu per satu.'),
      code('list: daftar berurutan yang bisa diubah', `belanja = ["beras", "telur"]
belanja.append("minyak")           # tambah di akhir
belanja.insert(0, "gula")          # sisip di indeks 0
belanja.extend(["kopi", "teh"])    # tambah banyak sekaligus
terakhir = belanja.pop()           # ambil & hapus elemen terakhir -> "teh"
belanja.remove("telur")            # hapus berdasarkan NILAI (ValueError bila tidak ada)
print(belanja)                     # ['gula', 'beras', 'minyak', 'kopi']
print(belanja[1:3], belanja[-1], len(belanja), "kopi" in belanja)

nilai = [70, 85, 60, 90]
print(sorted(nilai))               # [60, 70, 85, 90] -> list BARU, nilai tidak berubah
nilai.sort(reverse=True)           # mengurutkan list itu sendiri, mengembalikan None
print(nilai, sum(nilai) / len(nilai), max(nilai))

# Jebakan aliasing: "=" tidak menyalin, hanya menambah nama untuk objek yang sama
a = [1, 2, 3]
b = a
b.append(4)
print(a)                           # [1, 2, 3, 4] -> a ikut berubah!
c = a.copy()                       # salinan (dangkal); juga: list(a) atau a[:]
c.append(5)
print(a, c)                        # [1, 2, 3, 4] [1, 2, 3, 4, 5]`, 'python'),
      code('tuple: berurutan, tidak bisa diubah', `titik = (3, 4)
x, y = titik                       # unpacking
x, y = y, x                        # tukar nilai tanpa variabel sementara
satu = (5,)                        # koma yang membuat tuple; (5) hanyalah angka 5
# titik[0] = 10                    # TypeError: tuple immutable

lokasi = {(0, 0): "asal", (3, 4): "toko"}   # tuple boleh jadi kunci dict, list tidak
for nama, harga in [("kopi", 25_000), ("teh", 15_000)]:   # unpacking di loop
    print(nama, harga)`, 'python'),
      code('dict: pasangan kunci → nilai', `harga = {"beras": 14_000, "telur": 28_000}
harga["minyak"] = 18_000           # tambah atau ubah
print(harga["beras"])              # 14000
# print(harga["gula"])             # KeyError: kunci tidak ada
print(harga.get("gula"))           # None -> aman
print(harga.get("gula", 0))        # 0 sebagai nilai default
del harga["telur"]
print("beras" in harga)            # True -> "in" memeriksa KUNCI, bukan nilai

for nama, h in harga.items():      # .keys(), .values(), .items()
    print(f"{nama:<8} Rp{h:,}")

# Pola paling umum: menghitung frekuensi
kata = "saya suka kopi dan saya suka teh".split()
frekuensi = {}
for k in kata:
    frekuensi[k] = frekuensi.get(k, 0) + 1
print(frekuensi)                   # {'saya': 2, 'suka': 2, 'kopi': 1, 'dan': 1, 'teh': 1}

# Data bersarang, bentuknya sama dengan JSON
pengguna = {"nama": "Ani", "alamat": {"kota": "Bandung"}, "hobi": ["baca", "lari"]}
print(pengguna["alamat"]["kota"], pengguna["hobi"][0])   # Bandung baca`, 'python'),
      code('set: kumpulan unik tanpa urutan', `kelas_a = {"ani", "budi", "citra"}
kelas_b = {"budi", "dodi"}
print(kelas_a | kelas_b)           # gabungan: ikut salah satu kelas
print(kelas_a & kelas_b)           # irisan: {'budi'}
print(kelas_a - kelas_b)           # selisih: hanya di kelas A
kelas_a.add("eka")

email = ["a@x.id", "b@x.id", "a@x.id"]
print(len(set(email)))             # 2 -> deduplikasi
kosong = set()                     # {} adalah dict kosong, BUKAN set!`, 'python'),
      table(['Kebutuhan', 'Pilih', 'Alasan'], [
        ['Urutan penting, isi bertambah/berkurang', 'list', 'Indeks, append, sort'],
        ['Record kecil yang tetap, kunci dict', 'tuple', 'Immutable dan hashable'],
        ['Cari data berdasarkan kunci (id, nama)', 'dict', 'Lookup rata-rata O(1)'],
        ['Hilangkan duplikat, cek keanggotaan cepat', 'set', '`x in s` rata-rata O(1); di list O(n)'],
      ]),
      heading('Dari loop ke comprehension'),
      paragraph('Comprehension adalah cara singkat membangun koleksi baru dari koleksi lain. Polanya: `[ekspresi for item in iterable if syarat]`. Tulis versi loop dulu bila bingung, lalu ringkas.'),
      code('Comprehension langkah demi langkah', `angka = [1, 2, 3, 4, 5, 6]

# Versi loop
kuadrat_genap = []
for n in angka:
    if n % 2 == 0:
        kuadrat_genap.append(n * n)

# Versi comprehension: hasil sama
kuadrat_genap = [n * n for n in angka if n % 2 == 0]          # [4, 16, 36]

label = ["genap" if n % 2 == 0 else "ganjil" for n in angka]  # if-else di DEPAN for
harga = {"beras": 14_000, "minyak": 18_000}
harga_diskon = {nama: h * 0.9 for nama, h in harga.items()}   # dict comprehension
huruf_unik = {c for c in "banana"}                             # set: {'b', 'a', 'n'}

matriks = [[1, 2, 3], [4, 5, 6]]
datar = [x for baris in matriks for x in baris]                # [1, 2, 3, 4, 5, 6]
# urutan for sama seperti loop bersarang: baris dulu, lalu x`, 'python'),
      callout('tip', 'Kapan berhenti memakai comprehension', 'Bila comprehension butuh lebih dari satu `for` plus `if`, atau tidak muat dalam satu-dua baris, kembali ke loop biasa. Kode dibaca jauh lebih sering daripada ditulis. Jangan pula memakai comprehension hanya untuk efek samping seperti `[print(x) for x in data]`.'),
      ...quiz([
        ['PYF-05', 'Latihan mini: dari `nilai = {"ani": 80, "budi": 55, "citra": 92}`, buat list nama yang lulus (nilai >= 60) secara terurut dalam satu baris.', '`sorted(nama for nama, n in nilai.items() if n >= 60)` menghasilkan `["ani", "citra"]`. `.items()` memberi pasangan kunci-nilai yang langsung di-unpack, dan `sorted` menerima generator sehingga tidak perlu kurung siku tambahan.'],
        ['PYF-06', 'Latihan mini: balik dict `{"a": 1, "b": 2}` menjadi `{1: "a", 2: "b"}`. Apa yang terjadi bila ada dua kunci dengan nilai sama?', '`{v: k for k, v in d.items()}`. Bila dua kunci punya nilai sama, kunci yang muncul belakangan menimpa yang lebih dulu karena kunci dict harus unik; data diam-diam hilang. Bila nilai bisa duplikat, kumpulkan ke list: `balik.setdefault(v, []).append(k)` di dalam loop.'],
        ['PYF-07', 'Fungsi `def tambah_nilai(daftar): daftar.append(100)` dipanggil dengan list `skor`. Apakah `skor` berubah di luar fungsi? Bagaimana dengan `def ganti(daftar): daftar = [100]`?', 'Pada `tambah_nilai`, ya: parameter menunjuk objek list yang sama, dan `append` mengubah objek itu. Pada `ganti`, tidak: assignment hanya membuat nama lokal `daftar` menunjuk list baru, list asli tidak tersentuh. Python meneruskan referensi objek; yang menentukan adalah apakah objek diubah (mutasi) atau nama diarahkan ulang.'],
      ]),
      ...practice('pyf-koleksi', [
        'Tanpa `Counter`, hitung frekuensi huruf (abaikan spasi dan huruf besar/kecil) dari sebuah kalimat, lalu cetak 3 huruf terbanyak dengan `sorted(..., key=..., reverse=True)`.',
        'Diberi dua list email pendaftar hari ini dan kemarin, cetak email yang baru mendaftar hari ini memakai operasi set.',
        'Simpan 5 produk sebagai list of dict (`nama`, `harga`, `stok`); dengan comprehension buat: daftar nama yang stoknya habis, dan dict `nama -> harga` untuk produk di atas Rp20.000.',
        'Tunjukkan bug aliasing dengan list bersarang: `a = [[0] * 3] * 3; a[0][0] = 1` lalu jelaskan hasilnya dan perbaiki dengan comprehension.',
      ]),
      references(
        ['Tutorial: Data Structures', 'https://docs.python.org/3/tutorial/datastructures.html'],
        ['Built-in Types: list, tuple, dict, set', 'https://docs.python.org/3/library/stdtypes.html'],
        ['Sorting Techniques', 'https://docs.python.org/3/howto/sorting.html'],
      ),
    ],
  },
  {
    ...dasar,
    id: 'pyf-file-exception',
    title: 'Python Dasar: File & Exception',
    summary: 'open dan with, mode file, encoding, pathlib, csv dan json, lalu try/except/else/finally, raise, raise from, dan custom exception.',
    duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Program nyata membaca dan menulis file, dan di sanalah banyak hal bisa gagal: file tidak ada, isinya rusak, izin ditolak. Python memakai **exception** untuk melaporkan kegagalan. Daripada mengecek setiap kemungkinan sebelum bertindak, gaya Python biasanya *mencoba dulu, tangani bila gagal* (EAFP: *Easier to Ask Forgiveness than Permission*).'),
      code('Membaca dan menulis teks dengan with dan pathlib', `from pathlib import Path

folder = Path("data")
folder.mkdir(exist_ok=True)                    # tidak error bila folder sudah ada
catatan = folder / "catatan.txt"               # operator / menggabungkan path, aman lintas OS

# Mode: "w" tulis (menimpa!), "a" tambah di akhir, "x" buat baru (gagal bila sudah ada), "r" baca
with open(catatan, "w", encoding="utf-8") as f:
    f.write("Belanja hari ini\\n")
    f.write("- beras\\n- telur\\n")
# Keluar dari blok with -> file otomatis ditutup, walaupun terjadi error di dalam blok

with open(catatan, encoding="utf-8") as f:     # mode default "r"
    for nomor, baris in enumerate(f, start=1): # baca baris per baris, hemat memori
        print(nomor, baris.rstrip("\\n"))

# Jalan pintas pathlib untuk file kecil
isi = catatan.read_text(encoding="utf-8")
catatan.with_suffix(".bak").write_text(isi, encoding="utf-8")
print(catatan.name, catatan.stem, catatan.suffix, catatan.exists())   # catatan.txt catatan .txt True
for p in sorted(folder.glob("*.txt")):         # rglob("*.txt") untuk semua subfolder
    print(p, p.stat().st_size, "byte")
print(Path.home(), Path.cwd())`, 'python'),
      callout('warn', 'Selalu tulis encoding="utf-8"', 'Tanpa `encoding`, Python memakai encoding bawaan sistem. Di Windows ini sering bukan UTF-8, sehingga huruf seperti "é" atau emoji menjadi `UnicodeDecodeError` atau karakter rusak. PEP 686 menjadwalkan UTF-8 sebagai default mulai Python 3.15, tetapi menulis `encoding="utf-8"` secara eksplisit tetap aman di semua versi.'),
      code('CSV dan JSON', `import csv
import json
from pathlib import Path

nilai = [
    {"nama": "Ani", "mapel": "Matematika", "skor": 88},
    {"nama": "Budi", "mapel": "Matematika", "skor": 72},
]

# newline="" wajib untuk modul csv agar tidak muncul baris kosong di Windows
with open("nilai.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["nama", "mapel", "skor"])
    writer.writeheader()
    writer.writerows(nilai)

with open("nilai.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):              # setiap baris menjadi dict
        print(row["nama"], int(row["skor"]))   # SEMUA nilai dari CSV bertipe str

# JSON: dumps/loads untuk string, dump/load untuk objek file
teks = json.dumps(nilai, indent=2, ensure_ascii=False)   # ensure_ascii=False: huruf non-ASCII tetap terbaca
Path("nilai.json").write_text(teks, encoding="utf-8")
data = json.loads(Path("nilai.json").read_text(encoding="utf-8"))
print(type(data), data[0]["skor"] + 1)          # <class 'list'> 89 -> tipe angka terjaga`, 'python'),
      code('try / except / else / finally', `def baca_angka(teks: str) -> int:
    try:
        angka = int(teks)                       # baris yang mungkin gagal saja
    except ValueError:
        print(f"{teks!r} bukan angka bulat")
        return 0
    else:
        print("berhasil")                       # hanya jalan bila TIDAK ada exception
        return angka
    finally:
        print("selesai mencoba")                # SELALU jalan: sukses, gagal, bahkan setelah return


baca_angka("42")     # berhasil, selesai mencoba -> 42
baca_angka("4x")     # '4x' bukan angka bulat, selesai mencoba -> 0


import json
from pathlib import Path

try:
    config = json.loads(Path("config.json").read_text(encoding="utf-8"))
except FileNotFoundError:
    config = {}                                 # wajar: pakai default
except json.JSONDecodeError as e:
    print(f"config.json rusak di baris {e.lineno}: {e.msg}")
    raise                                       # tidak bisa ditangani di sini: lempar ulang


# Meminta input sampai valid
while True:
    try:
        umur = int(input("Umur: "))
        break
    except ValueError:
        print("Masukkan angka, contoh: 21")`, 'python'),
      code('raise, raise from, dan custom exception', `class KasError(Exception):
    """Induk semua error aplikasi kas: memudahkan menangkap semuanya sekaligus."""


class SaldoKurang(KasError):
    def __init__(self, saldo: int, diminta: int) -> None:
        super().__init__(f"saldo Rp{saldo:,} tidak cukup untuk Rp{diminta:,}")
        self.saldo = saldo
        self.diminta = diminta


def tarik(saldo: int, jumlah: int) -> int:
    if jumlah <= 0:
        raise ValueError("jumlah harus positif")      # argumen salah: exception bawaan
    if jumlah > saldo:
        raise SaldoKurang(saldo, jumlah)              # aturan bisnis: exception sendiri
    return saldo - jumlah


def muat_saldo(teks: str) -> int:
    try:
        return int(teks)
    except ValueError as e:
        raise KasError(f"saldo tersimpan rusak: {teks!r}") from e   # simpan penyebab asli


try:
    tarik(50_000, 80_000)
except SaldoKurang as e:
    print(e, "| kurang:", e.diminta - e.saldo)
except KasError as e:                                  # urutan: yang spesifik lebih dulu
    print("error kas lain:", e)`, 'python'),
      table(['Exception', 'Kapan muncul', 'Contoh'], [
        ['`ValueError`', 'Tipe benar, nilai tidak valid', '`int("abc")`'],
        ['`TypeError`', 'Tipe salah untuk operasi', '`"5" + 3`'],
        ['`KeyError` / `IndexError`', 'Kunci dict / indeks list tidak ada', '`d["x"]`, `lst[99]`'],
        ['`FileNotFoundError`', 'File tidak ada (turunan `OSError`)', '`open("tidak-ada.txt")`'],
        ['`ZeroDivisionError`', 'Pembagian dengan nol', '`10 / 0`'],
        ['`AttributeError`', 'Atribut/method tidak ada', '`None.upper()`'],
      ]),
      callout('warn', 'Jangan menelan semua error', '`except:` polos atau `except Exception: pass` menyembunyikan bug (termasuk salah ketik nama variabel) dan membuat program diam-diam salah. Tangkap exception yang **spesifik** dan yang memang bisa Anda tangani. Bila tidak bisa ditangani, biarkan naik atau `raise` lagi setelah mencatat log.'),
      ...quiz([
        ['PYF-08', 'Apa beda blok `else` dan `finally` pada try?', '`else` hanya berjalan bila blok `try` selesai tanpa exception; gunanya agar kode lanjutan tidak ikut terlindungi `except` secara tidak sengaja. `finally` selalu berjalan (sukses, gagal, atau setelah `return`) dan dipakai untuk pembersihan seperti menutup resource. Untuk file, `with` sudah melakukan pembersihan itu.'],
        ['PYF-09', 'Mengapa `raise KasError(...) from e` lebih baik daripada `raise KasError(...)` saja di dalam except?', '`from e` menyimpan exception asli sebagai `__cause__`, sehingga traceback menampilkan "The above exception was the direct cause of..." dan penyebab aslinya tidak hilang. Tanpa `from`, Python tetap menautkan konteks secara implisit, tetapi `from` menyatakan hubungan sebab-akibat secara sengaja; `from None` dipakai bila penyebab asli memang ingin disembunyikan.'],
      ]),
      ...practice('pyf-file', [
        'Program buku tamu: setiap dijalankan, menambahkan nama dan waktu (mode "a") ke `tamu.txt`, lalu mencetak semua tamu bernomor.',
        'Konversi `nilai.csv` menjadi `nilai.json` berisi rata-rata per mapel; baris dengan skor bukan angka dilewati dengan pesan peringatan, bukan menghentikan program.',
        'Fungsi `muat_config(path)` yang mengembalikan dict default bila file tidak ada, tetapi melempar `ConfigError` (custom, dengan `from e`) bila JSON rusak.',
        'Buat hierarki `KasError -> SaldoKurang, AkunTidakDitemukan` dan tunjukkan satu `except KasError` menangkap keduanya.',
      ]),
      references(
        ['Tutorial: Input and Output', 'https://docs.python.org/3/tutorial/inputoutput.html'],
        ['Tutorial: Errors and Exceptions', 'https://docs.python.org/3/tutorial/errors.html'],
        ['pathlib', 'https://docs.python.org/3/library/pathlib.html'],
        ['csv', 'https://docs.python.org/3/library/csv.html'],
        ['json', 'https://docs.python.org/3/library/json.html'],
        ['Built-in Exceptions', 'https://docs.python.org/3/library/exceptions.html'],
      ),
    ],
  },
  {
    ...dasar,
    id: 'pyf-modul-stdlib',
    title: 'Python Dasar: Module, Package & Tur Standard Library',
    summary: 'import, package, if __name__ == "__main__", lalu tur modul bawaan yang paling sering dipakai: datetime, collections, itertools, functools, re, logging, dan argparse.',
    duration: '2–3 jam', level: 'Easy',
    blocks: [
      paragraph('Satu file `.py` adalah satu **module**; folder berisi module (biasanya dengan `__init__.py`) adalah **package**. Python juga datang dengan *standard library* yang besar ("batteries included"): tanggal, regex, logging, CLI, dan struktur data siap pakai. Sebelum memasang library pihak ketiga, cek dulu apakah stdlib sudah menyediakannya.'),
      code('Struktur proyek kecil', `toko/
├── main.py
└── toko/                  # package
    ├── __init__.py        # menandai folder sebagai package (boleh kosong)
    ├── harga.py
    └── laporan.py`, 'text'),
      code('toko/harga.py dan main.py — import dan __name__', `# ===== toko/harga.py =====
"""Perhitungan harga untuk aplikasi toko."""

PAJAK = 0.11


def dengan_pajak(harga: int) -> int:
    return round(harga * (1 + PAJAK))


def _bulatkan(n: int) -> int:     # awalan _ = internal, jangan dipakai dari luar
    return round(n, -2)


if __name__ == "__main__":
    # __name__ bernilai "__main__" hanya saat file DIJALANKAN langsung:
    #   python -m toko.harga
    # Saat di-import, __name__ bernilai "toko.harga" dan blok ini dilewati.
    print(dengan_pajak(100_000))


# ===== main.py =====
import math                          # seluruh module: math.sqrt(...)
import datetime as dt                # alias
from toko.harga import dengan_pajak  # nama tertentu dari module
from toko import harga               # module dari package: harga.PAJAK

print(dengan_pajak(50_000), harga.PAJAK, math.sqrt(16), dt.date.today())`, 'python'),
      callout('warn', 'Jangan menamai file seperti module bawaan', 'File bernama `random.py`, `csv.py`, atau `json.py` di folder proyek akan **menutupi** module standar dengan nama sama, sehingga `import random` memuat file Anda dan muncul error aneh seperti "module has no attribute randint". Hindari juga `from x import *` karena nama-nama bisa saling menimpa tanpa terlihat.'),
      code('datetime dan zoneinfo', `from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo        # Windows: pasang data zona waktu dulu -> uv add tzdata

hari_ini = date.today()
jatuh_tempo = hari_ini + timedelta(days=30)
sisa_hari = (date(2026, 12, 31) - hari_ini).days

sekarang = datetime.now(ZoneInfo("Asia/Jakarta"))      # waktu nyata: selalu dengan zona waktu
print(sekarang.isoformat(timespec="seconds"))          # 2026-11-02T09:30:00+07:00
print(sekarang.strftime("%d/%m/%Y %H:%M"))             # format untuk ditampilkan
print(sekarang.astimezone(ZoneInfo("UTC")))            # konversi zona

tgl = datetime.strptime("02-11-2026", "%d-%m-%Y").date()   # parse dari format tertentu
iso = date.fromisoformat("2026-11-02")                     # parse format ISO (paling aman)
print(tgl == iso, iso.weekday())                           # True 0 -> Senin = 0`, 'python'),
      code('collections, itertools, functools', `from collections import Counter, defaultdict, deque, namedtuple
from functools import lru_cache, partial, reduce
from itertools import batched, chain, groupby, islice, pairwise
import operator

kata = "kopi teh kopi susu kopi teh".split()
print(Counter(kata).most_common(2))        # [('kopi', 3), ('teh', 2)]

per_huruf = defaultdict(list)              # kunci baru otomatis berisi []
for k in kata:
    per_huruf[k[0]].append(k)              # tanpa cek "if k[0] not in ..."

terakhir = deque(maxlen=3)                 # hanya simpan 3 item terakhir
for i in range(5):
    terakhir.append(i)
print(terakhir)                            # deque([2, 3, 4], maxlen=3)

Titik = namedtuple("Titik", "x y")         # tuple dengan nama field
p = Titik(3, 4)
print(p.x, p._asdict())

print(list(chain([1, 2], [3])))            # [1, 2, 3]  -> sambung beberapa iterable
print(list(islice(range(100), 5)))         # [0, 1, 2, 3, 4] -> ambil n pertama dari iterable apa pun
print(list(batched(range(7), 3)))          # [(0, 1, 2), (3, 4, 5), (6,)] -> Python 3.12+
print(list(pairwise([10, 12, 15])))        # [(10, 12), (12, 15)] -> selisih berurutan

transaksi = sorted([("makan", 20), ("transport", 5), ("makan", 15)])   # groupby butuh data TERURUT
for kategori, grup in groupby(transaksi, key=lambda t: t[0]):
    print(kategori, sum(jumlah for _, jumlah in grup))   # makan 35, transport 5

print(reduce(operator.mul, [1, 2, 3, 4]))  # 24
dari_biner = partial(int, base=2)          # fungsi baru dengan argumen yang sudah diisi
print(dari_biner("1010"))                  # 10


@lru_cache(maxsize=None)                   # simpan hasil: pemanggilan berulang jadi instan
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(80))`, 'python'),
      code('re: regular expression', `import re

teks = "Transfer Rp1.250.000 ke 0812-3456-7890 tgl 02/11/2026, ref INV-2026-0042"

POLA_HP = re.compile(r"08\\d{2}-\\d{4}-\\d{4}")   # r"..." = raw string: backslash tidak di-escape
cocok = POLA_HP.search(teks)                     # cari kecocokan pertama; None bila tidak ada
if cocok:
    print(cocok.group())                         # 0812-3456-7890

m = re.search(r"(?P<hari>\\d{2})/(?P<bulan>\\d{2})/(?P<tahun>\\d{4})", teks)   # named group
if m:
    print(m["tahun"], m.group("bulan"))          # 2026 11

print(re.findall(r"INV-\\d{4}-\\d+", teks))       # ['INV-2026-0042'] -> semua kecocokan
print(int(re.sub(r"\\D", "", "Rp1.250.000")))     # 1250000 -> buang semua non-digit
print(bool(re.fullmatch(r"[a-z0-9_]{3,16}", "user_01")))   # validasi SELURUH string: True`, 'python'),
      code('logging dan argparse', `import argparse
import logging

log = logging.getLogger(__name__)      # satu logger per module


def main() -> None:
    parser = argparse.ArgumentParser(description="Hitung total belanja dari file CSV")
    parser.add_argument("file", help="path file CSV")                       # posisional, wajib
    parser.add_argument("--pajak", type=float, default=0.11,
                        help="tarif pajak (default: %(default)s)")         # opsional
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    )
    log.debug("argumen: %s", args)                 # hanya tampil dengan -v
    log.info("memproses %s, pajak %.0f%%", args.file, args.pajak * 100)
    try:
        open(args.file, encoding="utf-8").close()
    except FileNotFoundError:
        log.exception("file tidak bisa dibuka")   # level ERROR + traceback lengkap


if __name__ == "__main__":
    main()

# python total.py belanja.csv --pajak 0.1 -v
# python total.py --help      -> pesan bantuan dibuat otomatis`, 'python'),
      table(['Module', 'Pakai untuk', 'Yang paling sering dipakai'], [
        ['`pathlib`, `shutil`', 'Path, salin/pindah file', '`Path`, `glob`, `shutil.copy2`'],
        ['`datetime`, `zoneinfo`', 'Tanggal, durasi, zona waktu', '`date`, `datetime.now(tz)`, `timedelta`'],
        ['`collections`', 'Struktur data tambahan', '`Counter`, `defaultdict`, `deque`'],
        ['`itertools`', 'Iterasi efisien dan lazy', '`chain`, `islice`, `groupby`, `batched`'],
        ['`functools`', 'Fungsi tingkat tinggi', '`lru_cache`, `partial`, `reduce`, `wraps`'],
        ['`re`', 'Pola teks', '`search`, `findall`, `sub`, `fullmatch`'],
        ['`logging`', 'Log berlevel, bukan `print`', '`getLogger(__name__)`, `basicConfig`'],
        ['`argparse`', 'Argumen command line', '`ArgumentParser`, `add_argument`'],
        ['`json`, `csv`', 'Format data', '`loads`/`dumps`, `DictReader`'],
        ['`random`, `statistics`, `math`', 'Angka', '`randint`, `mean`, `isclose`'],
      ]),
      callout('tip', 'Langkah berikutnya', 'Anda sudah siap untuk track **Python Inti**, mulai dari [Fondasi Bahasa & Koleksi](#python.py-fondasi-bahasa) (unpacking, keyword-only, comprehension lebih jauh) lalu OOP, generator, decorator, typing, dan asyncio. Proyek CLI lengkap dengan argparse, logging, dan tes ada di [Proyek CLI Otomasi](#python.py-proyek-cli-otomasi).'),
      ...quiz([
        ['PYF-10', 'Apa fungsi `if __name__ == "__main__":` dan apa yang terjadi bila tidak dipakai?', 'Blok itu hanya berjalan saat file dijalankan langsung, bukan saat di-import. Tanpa penjaga ini, kode level atas (misalnya `print` atau memanggil `main()`) ikut berjalan setiap kali module di-import oleh file lain atau oleh pytest. Penjaga ini juga wajib untuk `multiprocessing` di Windows dan macOS.'],
        ['PYF-11', 'Mengapa `logging` lebih baik daripada `print` untuk pesan diagnostik?', 'logging punya level (DEBUG sampai CRITICAL) yang bisa dinyalakan/dimatikan tanpa mengubah kode, menyertakan waktu dan nama module, bisa diarahkan ke file atau layanan log, dan `log.exception` menyertakan traceback. print bercampur dengan output data di stdout dan harus dihapus manual.'],
      ]),
      ...practice('pyf-stdlib', [
        'Pecah program dari modul sebelumnya menjadi package `toko/` dengan minimal dua module; jalankan dengan `python -m` dan pastikan blok `__main__` tidak jalan saat di-import.',
        'Dari file log teks, gunakan `re` dan `Counter` untuk mencetak 5 alamat IP terbanyak.',
        'Skrip `ulang_tahun.py` yang menerima tanggal lahir lewat argparse dan mencetak sisa hari menuju ulang tahun berikutnya di zona Asia/Jakarta.',
        'Ganti semua `print` diagnostik di satu skrip dengan `logging`; opsi `-v` menampilkan level DEBUG.',
      ]),
      references(
        ['Tutorial: Modules', 'https://docs.python.org/3/tutorial/modules.html'],
        ['Brief Tour of the Standard Library', 'https://docs.python.org/3/tutorial/stdlib.html'],
        ['Brief Tour — Part II', 'https://docs.python.org/3/tutorial/stdlib2.html'],
        ['itertools', 'https://docs.python.org/3/library/itertools.html'],
        ['Regular Expression HOWTO', 'https://docs.python.org/3/howto/regex.html'],
        ['Logging HOWTO', 'https://docs.python.org/3/howto/logging.html'],
        ['zoneinfo', 'https://docs.python.org/3/library/zoneinfo.html'],
      ),
    ],
  },

  /* ──────────────────────── Python Mahir ──────────────────────── */
  {
    ...mahir,
    id: 'pyf-data-model-metaprogramming',
    title: 'Python Mahir: Data Model & Metaprogramming',
    summary: 'Dunder method dan NotImplemented, urutan pencarian atribut, descriptor dan cara kerja property, __slots__, __init_subclass__ vs metaclass, dan class decorator.',
    duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('`len(x)`, `a + b`, `for x in obj`, `with obj:`, dan `obj.attr` semuanya diterjemahkan Python menjadi pemanggilan **dunder method** (`__len__`, `__add__`, `__iter__`, `__enter__`, `__getattribute__`). Inilah *data model*. Library besar memanfaatkannya habis-habisan: kolom SQLAlchemy dan field Django adalah **descriptor**, Pydantic dan Enum memakai metaclass, dataclass adalah class decorator. Modul ini membuka mesinnya, lanjutan dari [OOP, dataclass & Protocol](#python.py-oop-dataclass).'),
      code('Dunder method: operator, protokol, dan NotImplemented', `from __future__ import annotations

import math
from collections.abc import Iterator


class Vektor:
    __slots__ = ("_x", "_y")

    def __init__(self, x: float, y: float) -> None:
        self._x, self._y = float(x), float(y)     # disimpan privat: objek dianggap immutable

    @property
    def x(self) -> float:
        return self._x

    @property
    def y(self) -> float:
        return self._y

    def __repr__(self) -> str:                    # untuk developer: REPL, log, debugger
        return f"Vektor({self._x!r}, {self._y!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vektor):
            return NotImplemented                 # BUKAN False: beri kesempatan other.__eq__
        return (self._x, self._y) == (other._x, other._y)

    def __hash__(self) -> int:                    # mendefinisikan __eq__ membuat __hash__ = None
        return hash((self._x, self._y))           # aman hanya karena field tidak diubah

    def __add__(self, other: object) -> Vektor:
        if not isinstance(other, Vektor):
            return NotImplemented                 # Python lalu mencoba other.__radd__
        return Vektor(self._x + other._x, self._y + other._y)

    def __mul__(self, k: object) -> Vektor:
        if not isinstance(k, (int, float)):
            return NotImplemented
        return Vektor(self._x * k, self._y * k)

    __rmul__ = __mul__                            # 3 * v: int.__mul__(Vektor) -> NotImplemented -> v.__rmul__(3)

    def __abs__(self) -> float:
        return math.hypot(self._x, self._y)

    def __bool__(self) -> bool:                   # if v: ...
        return bool(self._x or self._y)

    def __iter__(self) -> Iterator[float]:        # x, y = v ; list(v)
        yield self._x
        yield self._y


v = Vektor(3, 4)
print(v + Vektor(1, 1), 2 * v, abs(v), bool(Vektor(0, 0)))   # Vektor(4.0, 5.0) Vektor(6.0, 8.0) 5.0 False
x, y = v
print({v: "titik A"}[Vektor(3, 4)])               # hashable: bisa jadi kunci dict
# v + 1 -> TypeError: unsupported operand type(s) — pesan jelas berkat NotImplemented`, 'python'),
      table(['Perilaku', 'Dunder method', 'Catatan'], [
        ['`repr(x)` / `str(x)` / `format(x, spec)`', '`__repr__`, `__str__`, `__format__`', '`__str__` jatuh ke `__repr__` bila tidak ada'],
        ['`==`, `<`, `hash(x)`', '`__eq__`, `__lt__`, `__hash__`', '`functools.total_ordering` melengkapi perbandingan'],
        ['`len(x)`, `x[i]`, `in`, `for`', '`__len__`, `__getitem__`, `__contains__`, `__iter__`', 'Tanpa `__iter__`, `for` mencoba `__getitem__(0, 1, ...)`'],
        ['`a + b`, `b + a`, `a += b`', '`__add__`, `__radd__`, `__iadd__`', 'Kembalikan `NotImplemented` untuk tipe asing'],
        ['`x(...)`', '`__call__`', 'Objek bisa dipanggil seperti fungsi'],
        ['`with x:`', '`__enter__`, `__exit__`', 'Dibahas di modul Context Manager'],
        ['`obj.attr`', '`__getattribute__`, `__getattr__`', '`__getattr__` hanya dipanggil bila pencarian normal gagal'],
      ]),
      heading('Descriptor: mesin di balik property, method, dan field ORM'),
      paragraph('Descriptor adalah objek yang disimpan sebagai **atribut kelas** dan punya `__get__`, `__set__`, atau `__delete__`. Bila punya `__set__` atau `__delete__` disebut *data descriptor*; bila hanya `__get__` disebut *non-data descriptor*. Urutan pencarian `obj.attr`: (1) data descriptor di kelas (menelusuri MRO), (2) `obj.__dict__`, (3) non-data descriptor atau atribut kelas biasa, (4) `__getattr__` bila ada. Fungsi biasa adalah non-data descriptor: `__get__`-nya yang mengubah fungsi menjadi *bound method*.'),
      code('Descriptor validasi yang dipakai ulang, dengan __set_name__', `class Positif:
    """Data descriptor: satu definisi validasi untuk banyak atribut dan kelas."""

    def __set_name__(self, owner: type, name: str) -> None:   # dipanggil saat kelas dibuat
        self.publik = name
        self.privat = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:                       # diakses dari kelas: Produk.harga
            return self
        return getattr(obj, self.privat)

    def __set__(self, obj, nilai) -> None:
        if not isinstance(nilai, (int, float)) or nilai <= 0:
            raise ValueError(f"{self.publik} harus angka positif, dapat {nilai!r}")
        setattr(obj, self.privat, nilai)      # simpan di INSTANCE, bukan di descriptor


class Produk:
    harga = Positif()                         # __set_name__(Produk, "harga")
    stok = Positif()

    def __init__(self, nama: str, harga: float, stok: int) -> None:
        self.nama = nama
        self.harga = harga                    # -> Positif.__set__(self, harga)
        self.stok = stok


p = Produk("kopi", 25_000, 10)
print(vars(p))                                # {'nama': 'kopi', '_harga': 25000, '_stok': 10}
# Produk("teh", -1, 5) -> ValueError: harga harus angka positif, dapat -1


# property adalah data descriptor; versi Python murni yang disederhanakan:
class Properti:
    def __init__(self, fget=None, fset=None) -> None:
        self.fget, self.fset = fget, fset

    def __set_name__(self, owner, name) -> None:
        self.name = name

    def __get__(self, obj, objtype=None):
        return self if obj is None else self.fget(obj)

    def __set__(self, obj, value) -> None:   # selalu ada -> property SELALU data descriptor
        if self.fset is None:
            raise AttributeError(f"property {self.name!r} tidak punya setter")
        self.fset(obj, value)

    def setter(self, fset):
        return type(self)(self.fget, fset)   # @x.setter membuat objek property BARU`, 'python'),
      code('Data vs non-data descriptor dalam praktik', `from functools import cached_property


class Laporan:
    def __init__(self, rows: list[int]) -> None:
        self.rows = rows

    @property
    def jumlah(self) -> int:                  # data descriptor
        return len(self.rows)

    @cached_property
    def total(self) -> int:                   # non-data descriptor (hanya __get__)
        print("menghitung total...")
        return sum(self.rows)


r = Laporan([1, 2, 3])
r.__dict__["jumlah"] = 99
print(r.jumlah)                               # 3 -> data descriptor menang atas __dict__ instance
print(r.total, r.total)                       # "menghitung total..." SEKALI, lalu 6 6
print(r.__dict__["total"])                    # 6 -> hasil disimpan di __dict__ instance,
                                              # akses berikutnya tidak lagi memanggil descriptor
del r.total                                   # buang cache; akses berikutnya menghitung ulang`, 'python'),
      heading('__slots__'),
      code('__slots__: memori lebih kecil, atribut tetap', `import tracemalloc


class TitikDict:
    def __init__(self, x: int, y: int) -> None:
        self.x, self.y = x, y


class TitikSlot:
    __slots__ = ("x", "y")                    # tidak ada __dict__ per instance

    def __init__(self, x: int, y: int) -> None:
        self.x, self.y = x, y


def byte_per_objek(cls: type, n: int = 200_000) -> float:
    tracemalloc.start()
    objek = [cls(i, i) for i in range(n)]
    terpakai, _ = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    del objek
    return terpakai / n


print(byte_per_objek(TitikDict), byte_per_objek(TitikSlot))   # angka pasti tergantung versi: ukur sendiri

t = TitikSlot(1, 2)
# t.z = 3              -> AttributeError: tidak bisa menambah atribut baru


class Titik3D(TitikSlot):                     # subclass TANPA __slots__ mendapat __dict__ lagi
    pass

print(hasattr(Titik3D(1, 2), "__dict__"))     # True -> penghematan hilang diam-diam
# Alternatif modern: @dataclass(slots=True) membuat __slots__ otomatis`, 'python'),
      table(['Jebakan __slots__', 'Penjelasan'], [
        ['Subclass tanpa `__slots__`', 'Instance subclass kembali punya `__dict__`; deklarasikan `__slots__ = ()` atau field tambahan di setiap subclass'],
        ['Nilai default sebagai atribut kelas', '`x = 0` di kelas yang juga punya slot `x` menghasilkan `ValueError` saat kelas dibuat'],
        ['`cached_property`', 'Butuh `__dict__` instance; tidak bekerja dengan slot murni'],
        ['`weakref`', 'Tambahkan `"__weakref__"` ke `__slots__` bila objek perlu weak reference'],
        ['Multiple inheritance', 'Dua kelas dasar dengan slot tidak kosong menghasilkan *layout conflict*'],
      ]),
      paragraph('Sejak Python 3.11 objek biasa sudah lebih hemat (atribut instance disimpan *inline*), sehingga selisih dengan `__slots__` mengecil. `__slots__` tetap berguna untuk jutaan objek kecil dan untuk mencegah salah ketik nama atribut. Ukur dengan `tracemalloc` sebelum mengorbankan fleksibilitas.'),
      heading('__init_subclass__, metaclass, dan class decorator'),
      code('Registri plugin: tiga cara', `import json


# 1) __init_subclass__ (PEP 487): hook saat kelas turunan dibuat. Pilihan pertama.
class Eksportir:
    registri: dict[str, type["Eksportir"]] = {}
    fmt: str

    def __init_subclass__(cls, /, fmt: str, **kwargs) -> None:
        super().__init_subclass__(**kwargs)           # jaga kerja sama dengan kelas lain di MRO
        if fmt in Eksportir.registri:
            raise TypeError(f"format {fmt!r} sudah terdaftar oleh {Eksportir.registri[fmt].__name__}")
        cls.fmt = fmt
        Eksportir.registri[fmt] = cls

    def ekspor(self, data: list[dict]) -> str:
        raise NotImplementedError


class EksporJSON(Eksportir, fmt="json"):              # argumen kelas diteruskan ke __init_subclass__
    def ekspor(self, data: list[dict]) -> str:
        return json.dumps(data)


print(Eksportir.registri)                             # {'json': <class 'EksporJSON'>}


# 2) Metaclass: mengendalikan PEMBUATAN kelas itu sendiri. Hanya bila 1) tidak cukup.
class MetaRegistri(type):
    registri: dict[str, type] = {}

    @classmethod
    def __prepare__(mcls, nama, bases, **kwargs):
        return {}                                     # namespace kelas; Enum memakai dict khusus di sini

    def __new__(mcls, nama, bases, namespace, **kwargs):
        if bases and "proses" not in namespace:       # validasi saat definisi kelas, bukan saat dipakai
            raise TypeError(f"{nama} wajib mendefinisikan proses()")
        cls = super().__new__(mcls, nama, bases, namespace)
        if bases:
            MetaRegistri.registri[nama.lower()] = cls
        return cls


class Plugin(metaclass=MetaRegistri):
    pass


class PluginXML(Plugin):
    def proses(self) -> str:
        return "<ok/>"


# 3) Class decorator: fungsi yang menerima kelas dan mengembalikan kelas (seperti @dataclass).
TUGAS: dict[str, type] = {}


def tugas(nama: str):
    def daftarkan(cls: type) -> type:
        TUGAS[nama] = cls
        return cls
    return daftarkan


@tugas("backup-harian")
class Backup:
    pass`, 'python'),
      table(['Kebutuhan', 'Alat paling sederhana', 'Contoh di ekosistem'], [
        ['Validasi/transformasi satu atribut', 'property atau descriptor', 'Field Django, kolom SQLAlchemy'],
        ['Hook saat kelas turunan didefinisikan (registri, validasi)', '`__init_subclass__`', 'Registri plugin, serializer'],
        ['Menambah method ke satu kelas tertentu', 'Class decorator', '`@dataclass`, `@total_ordering`'],
        ['Mengubah namespace sebelum kelas dibuat, `isinstance` kustom, mengubah `type(cls)`', 'Metaclass', '`Enum` (`EnumType`), `ABCMeta`, Pydantic'],
      ]),
      callout('warn', 'Metaprogramming punya biaya', 'Kode yang terlalu "ajaib" sulit dibaca, sulit di-debug, dan sering tidak bisa diikuti mypy/pyright. Urutan pilihan: fungsi biasa → decorator → `__init_subclass__` → descriptor → metaclass. Metaclass juga bisa bentrok: kelas yang mewarisi dua kelas dengan metaclass berbeda yang tidak saling turunan gagal dengan *metaclass conflict*.'),
      ...quiz([
        ['PYF-12', 'Setelah menambahkan `__eq__` ke sebuah kelas, objeknya tidak bisa lagi dipakai di set (`TypeError: unhashable type`). Mengapa, dan apa perbaikannya?', 'Aturan Python: objek yang sama menurut `__eq__` harus punya hash yang sama. Karena hash bawaan berbasis identitas tidak lagi konsisten dengan `__eq__` yang baru, Python otomatis mengisi `__hash__ = None`. Perbaikannya: definisikan `__hash__` dari field yang sama dengan `__eq__`, dan pastikan field itu tidak berubah (atau pakai `@dataclass(frozen=True)`). Objek mutable yang hash-nya berubah setelah masuk dict akan "hilang" dari dict.'],
        ['PYF-13', 'Mengapa nilai di `obj.__dict__["x"]` tidak bisa menutupi property `x`, tetapi bisa menutupi `cached_property`?', 'property adalah data descriptor (selalu punya `__set__`), dan data descriptor di kelas dicari sebelum `__dict__` instance. `cached_property` hanya punya `__get__` (non-data), sehingga `__dict__` instance didahulukan; justru itu mekanisme cache-nya: setelah perhitungan pertama nilai disimpan di `__dict__` dan descriptor tidak dipanggil lagi.'],
        ['PYF-14', 'Kapan metaclass benar-benar diperlukan dibanding `__init_subclass__`?', '`__init_subclass__` cukup untuk bereaksi setelah kelas turunan dibuat (registri, validasi atribut, menambah atribut). Metaclass diperlukan bila harus mengubah proses pembuatan itu sendiri: namespace kustom lewat `__prepare__` (Enum), mengubah perilaku pada kelas sebagai objek (`__instancecheck__`, `__getitem__` pada kelas, `__call__`), atau memengaruhi kelas dasar itu sendiri, bukan hanya turunannya.'],
      ]),
      ...practice('pyf-datamodel', [
        'Kelas `Uang(jumlah, mata_uang)` immutable dengan `__eq__`, `__hash__`, `__add__` (menolak beda mata uang dengan ValueError), `__lt__` + `total_ordering`, `__format__` mendukung `f"{u:rp}"`, dan `__repr__`; lengkap dengan pytest.',
        'Descriptor `Tipe(int)` dan `Panjang(maks=50)` yang dipakai ulang di dua kelas berbeda; tes membuktikan nilai tidak bocor antar instance.',
        'Ukur memori 1 juta objek dengan dan tanpa `__slots__` memakai `tracemalloc`, lalu tulis kesimpulan beserta versi Python yang dipakai.',
        'Registri eksportir CSV/JSON/Markdown memakai `__init_subclass__`; kelas yang lupa mengimplementasikan `ekspor` gagal saat didefinisikan, bukan saat dipanggil.',
      ]),
      references(
        ['Data model (Language Reference)', 'https://docs.python.org/3/reference/datamodel.html'],
        ['Descriptor HowTo Guide', 'https://docs.python.org/3/howto/descriptor.html'],
        ['__slots__', 'https://docs.python.org/3/reference/datamodel.html#slots'],
        ['PEP 487 — Simpler customisation of class creation', 'https://peps.python.org/pep-0487/'],
        ['Metaclasses', 'https://docs.python.org/3/reference/datamodel.html#metaclasses'],
      ),
    ],
  },
  {
    ...mahir,
    id: 'pyf-performa-paralelisme',
    title: 'Python Mahir: Performa & Paralelisme',
    summary: 'GIL, threading vs multiprocessing vs asyncio, concurrent.futures, status free-threaded CPython (3.13 eksperimental, 3.14 didukung resmi namun opsional), profiling cProfile/py-spy, dan memoization.',
    duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('"Python lambat" biasanya berarti salah satu dari tiga hal: algoritma yang buruk, pekerjaan I/O yang dikerjakan berurutan, atau komputasi CPU berat di Python murni. Masing-masing punya obat berbeda, dan memilih obat yang salah tidak membantu sama sekali. Aturan pertama: **ukur dulu** dengan profiler, jangan menebak. Modul ini melengkapi [asyncio & Konkurensi](#python.py-asyncio).'),
      heading('GIL dan tiga model konkurensi'),
      paragraph('Di build CPython standar, **GIL** (*Global Interpreter Lock*) memastikan hanya satu thread yang mengeksekusi bytecode Python pada satu waktu. GIL dilepas saat thread menunggu I/O (socket, file, `time.sleep`) dan oleh banyak ekstensi C saat menghitung (NumPy, `hashlib` untuk data besar, `zlib`). Akibatnya: thread efektif untuk I/O, tetapi tidak mempercepat komputasi Python murni. Untuk CPU, pakai banyak **proses** (masing-masing punya interpreter dan GIL sendiri).'),
      code('bench.py — thread vs proses untuk pekerjaan CPU', `import math
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def hitung_prima(batas: int) -> int:
    """Sengaja Python murni dan berat di CPU."""
    return sum(1 for n in range(2, batas) if all(n % p for p in range(2, math.isqrt(n) + 1)))


def ukur(label: str, fn) -> None:
    mulai = time.perf_counter()
    fn()
    print(f"{label:<10} {time.perf_counter() - mulai:6.2f}s")


if __name__ == "__main__":                  # WAJIB: proses anak meng-import ulang module ini
    tugas = [200_000] * 4
    ukur("berurutan", lambda: [hitung_prima(t) for t in tugas])
    with ThreadPoolExecutor(max_workers=4) as ex:
        ukur("thread", lambda: list(ex.map(hitung_prima, tugas)))    # build ber-GIL: ~sama dengan berurutan
    with ProcessPoolExecutor(max_workers=4) as ex:
        ukur("proses", lambda: list(ex.map(hitung_prima, tugas)))    # mendekati 4x lebih cepat di >= 4 core`, 'python'),
      code('Pekerjaan I/O: ThreadPoolExecutor dan as_completed', `import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

URLS = [f"https://httpbin.org/delay/1?i={i}" for i in range(8)]


def unduh(url: str) -> int:
    with urllib.request.urlopen(url, timeout=10) as r:   # GIL dilepas selama menunggu jaringan
        return len(r.read())


mulai = time.perf_counter()
with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(unduh, u): u for u in URLS}
    for fut in as_completed(futures):                    # urut selesai, bukan urut kirim
        url = futures[fut]
        try:
            print(url, fut.result())                     # exception dari thread dilempar ulang DI SINI
        except OSError as e:
            print(url, "gagal:", e)
print(f"{time.perf_counter() - mulai:.1f}s")             # ~1-2 detik, bukan ~8 detik`, 'python'),
      table(['Model', 'Cocok untuk', 'Biaya & jebakan'], [
        ['`threading` / `ThreadPoolExecutor`', 'I/O blocking (HTTP sinkron, file, DB driver sinkron); ekstensi C yang melepas GIL', 'Race condition tetap mungkin; tidak mempercepat Python murni di build ber-GIL'],
        ['`multiprocessing` / `ProcessPoolExecutor`', 'CPU berat di Python murni', 'Argumen dan hasil di-*pickle* antar proses; start-up lambat; lambda/closure tidak bisa dikirim'],
        ['`asyncio`', 'Ribuan koneksi I/O bersamaan dengan library async', 'Satu panggilan blocking menghentikan seluruh event loop'],
        ['Build free-threaded + `threading`', 'CPU paralel dengan memori bersama', 'Overhead single-thread; ekstensi C harus mendukung; perlu sinkronisasi sendiri'],
        ['`InterpreterPoolExecutor` (3.14+)', 'Isolasi seperti proses dalam satu proses', 'Baru; banyak ekstensi C belum mendukung multiple interpreters'],
      ]),
      callout('info', 'Start method multiprocessing', 'Windows dan macOS memakai *spawn*: proses anak meng-import ulang module utama, sehingga kode tanpa penjaga `if __name__ == "__main__":` membuat proses beranak tanpa henti atau error. Di Linux, default lama adalah *fork*; mulai Python 3.14 default di Linux berubah menjadi *forkserver*. Jangan bergantung pada state global yang "terwarisi" lewat fork.'),
      heading('Free-threaded CPython: status yang tepat'),
      paragraph('**PEP 703** menghadirkan build CPython tanpa GIL. Di **Python 3.13** build ini berstatus **eksperimental**: tersedia sebagai executable terpisah (`python3.13t`, opsi di installer resmi Windows/macOS) dengan overhead single-thread yang cukup besar karena sebagian optimasi interpreter dimatikan. Di **Python 3.14**, lewat **PEP 779**, build free-threaded menjadi **didukung resmi** (tidak lagi eksperimental) dan overhead-nya jauh berkurang, tetapi tetap **opsional**: build default masih memakai GIL. Menjadikannya default adalah tahap berikutnya yang belum diputuskan; cek dokumentasi untuk status versi terbaru (termasuk 3.15).'),
      code('Mencoba build free-threaded', `# Pasang dan jalankan (uv mengenali akhiran "t" untuk varian free-threaded)
uv python install 3.14t
uv run --python 3.14t python bench.py      # kini baris "thread" ikut mendekati 4x

# Di dalam Python:
#   import sys, sysconfig
#   sysconfig.get_config_var("Py_GIL_DISABLED")   # 1 = build free-threaded
#   sys._is_gil_enabled()                          # 3.13+: apakah GIL aktif SAAT INI
#
# Ekstensi C yang belum menyatakan dukungan membuat GIL aktif kembali saat di-import
# (disertai RuntimeWarning). PYTHON_GIL=0 atau -X gil=0 memaksa GIL tetap mati,
# dengan risiko crash/data rusak bila ekstensi itu tidak thread-safe.`, 'bash'),
      callout('warn', 'Tanpa GIL bukan berarti tanpa race condition', 'GIL tidak pernah membuat kode Anda thread-safe: `counter += 1` terdiri dari beberapa langkah dan bisa saling menimpa di kedua build. Di build free-threaded, CPython menjaga struktur internal (list, dict) agar tidak rusak, tetapi invarian aplikasi tetap butuh `threading.Lock`, `queue.Queue`, atau desain tanpa state bersama. Wheel ekstensi juga perlu dibangun khusus (tag ABI seperti `cp314t`).'),
      heading('Profiling: ukur sebelum mengoptimasi'),
      code('timeit, cProfile, py-spy', `# Micro-benchmark satu ekspresi
python -m timeit -s "data = list(range(10_000))" "sum(data)"
python -m timeit -s "data = list(range(10_000))" "total = 0" "for x in data: total += x"

# cProfile: tracing profiler bawaan, menghitung SETIAP pemanggilan fungsi
python -m cProfile -s cumulative laporan.py | head -n 30
python -m cProfile -o profil.out laporan.py
python -m pstats profil.out          # interaktif: sort cumtime  lalu  stats 15
uvx snakeviz profil.out              # visualisasi di browser (opsional)

# py-spy: sampling profiler, menempel ke proses yang SEDANG berjalan tanpa ubah kode
uv tool install py-spy
py-spy top --pid 12345                             # seperti "top" untuk fungsi Python
py-spy record -o profil.svg --pid 12345 --duration 30   # flame graph
py-spy record -o profil.svg -- python laporan.py
py-spy dump --pid 12345                            # stack semua thread: diagnosis proses "hang"
# Linux/macOS biasanya butuh sudo untuk menempel ke PID. Cek dukungan py-spy untuk
# versi Python terbaru di halaman rilisnya sebelum memakai di produksi.`, 'bash'),
      code('Profiling di dalam kode dan memoization', `import cProfile
import pstats
from functools import cache, cached_property, lru_cache


@cache                                    # = lru_cache(maxsize=None): tanpa batas
def jumlah_cara(n: int) -> int:           # naik tangga 1 atau 2 langkah: O(2^n) -> O(n)
    return 1 if n <= 1 else jumlah_cara(n - 1) + jumlah_cara(n - 2)


@lru_cache(maxsize=1024)                  # batasi memori: buang entri yang paling lama tak dipakai
def kurs(mata_uang: str, tanggal: str) -> float:
    return 16_250.0                       # bayangkan panggilan API yang mahal


with cProfile.Profile() as prof:          # context manager sejak Python 3.8
    jumlah_cara(300)
    for _ in range(10_000):
        kurs("USD", "2026-11-02")
pstats.Stats(prof).sort_stats("cumulative").print_stats(5)
print(kurs.cache_info())                  # CacheInfo(hits=9999, misses=1, maxsize=1024, currsize=1)
# kurs(["USD"], ...) -> TypeError: unhashable type: 'list' (argumen harus hashable)


class Laporan:
    def __init__(self, rows: list[int]) -> None:
        self.rows = rows

    @cached_property                      # cache per INSTANCE, ikut hilang bersama objeknya
    def total(self) -> int:
        return sum(self.rows)

    # @lru_cache pada method: cache global menyimpan referensi ke self -> objek tidak
    # pernah dibebaskan (memory leak). Ruff memperingatkannya sebagai B019.`, 'python'),
      table(['Urutan optimasi', 'Contoh'], [
        ['1. Algoritma & struktur data', 'Ganti `x in list` di dalam loop dengan set; hindari O(n²)'],
        ['2. Kurangi pekerjaan berulang', 'Memoization, pindahkan perhitungan invarian keluar loop'],
        ['3. Pakai built-in & stdlib (ditulis di C)', '`sum`, `sorted`, `"".join(...)`, `collections`, `itertools`'],
        ['4. Vektorisasi', 'NumPy/pandas/Polars untuk data numerik besar'],
        ['5. Paralel', 'Proses untuk CPU, thread/asyncio untuk I/O'],
        ['6. Kompilasi', 'mypyc, Cython, atau ekstensi Rust (PyO3) untuk hot path yang tersisa'],
      ]),
      ...quiz([
        ['PYF-15', 'Tim menjalankan parsing JSON Python murni di `ThreadPoolExecutor(max_workers=8)` pada CPython standar, tetapi waktu total hampir tidak berubah. Mengapa, dan apa pilihannya?', 'Di build ber-GIL hanya satu thread yang menjalankan bytecode pada satu waktu, jadi pekerjaan CPU Python murni tidak paralel; thread malah menambah overhead pergantian. Pilihan: `ProcessPoolExecutor` (perhatikan biaya pickle data besar), library parsing berbasis C/Rust yang melepas GIL, atau build free-threaded bila semua dependensinya mendukung. Ukur dulu: bisa jadi bottleneck sebenarnya I/O.'],
        ['PYF-16', 'Apa yang berubah dan tidak berubah bila memakai build free-threaded Python 3.14?', 'Berubah: thread bisa menjalankan bytecode Python secara paralel di beberapa core, sehingga pekerjaan CPU dengan thread bisa diskalakan tanpa biaya pickle. Tidak berubah: build ini tetap opsional (default masih ber-GIL), race condition logika aplikasi tetap harus dicegah dengan lock, ada overhead single-thread, dan ekstensi C yang belum mendukung akan mengaktifkan GIL kembali saat di-import.'],
        ['PYF-17', 'Mengapa `@lru_cache` pada method instance dianggap berbahaya?', 'Cache disimpan di fungsi level kelas dan kuncinya menyertakan `self`, sehingga setiap instance yang pernah dipanggil tetap direferensikan cache dan tidak pernah dibebaskan garbage collector (memory leak), serta cache dibagi semua instance. Alternatif: `cached_property` untuk nilai tanpa argumen, cache dict per instance, atau fungsi level module yang menerima data hashable.'],
      ]),
      ...practice('pyf-performa', [
        'Jalankan `bench.py` di build standar dan (bila memungkinkan) build free-threaded; tabelkan waktu berurutan/thread/proses beserta jumlah core dan versi Python.',
        'Profil skrip nyata dengan `cProfile` dan `py-spy record`; temukan 3 fungsi teratas berdasarkan cumulative time dan jelaskan perbaikannya.',
        'Unduh 50 URL dengan `ThreadPoolExecutor` + `as_completed`, satu URL sengaja gagal, dan pastikan error dilaporkan tanpa menghentikan unduhan lain.',
        'Percepat fungsi rekursif yang lambat dengan `@cache`, tunjukkan `cache_info()`, lalu jelaskan kapan cache tak terbatas menjadi masalah memori.',
      ]),
      references(
        ['Python support for free threading (HOWTO)', 'https://docs.python.org/3/howto/free-threading-python.html'],
        ['PEP 703 — Making the GIL Optional', 'https://peps.python.org/pep-0703/'],
        ['PEP 779 — Criteria for supported status for free-threaded Python', 'https://peps.python.org/pep-0779/'],
        ['concurrent.futures', 'https://docs.python.org/3/library/concurrent.futures.html'],
        ['multiprocessing: contexts and start methods', 'https://docs.python.org/3/library/multiprocessing.html#contexts-and-start-methods'],
        ['The Python Profilers', 'https://docs.python.org/3/library/profile.html'],
        ['py-spy', 'https://github.com/benfred/py-spy'],
        ['functools: cache, lru_cache, cached_property', 'https://docs.python.org/3/library/functools.html'],
      ),
    ],
  },
  {
    ...mahir,
    id: 'pyf-python-algoritma',
    title: 'Python Mahir: Python untuk Soal Algoritma',
    summary: 'heapq, bisect, deque, Counter, defaultdict, sort key, batas rekursi, dan input cepat, diterapkan pada lima soal klasik: top-K, sliding window maximum, Dijkstra, LIS, dan menghitung pulau.',
    duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Di interview dan competitive programming, Python unggul karena kodenya pendek, asalkan Anda tahu struktur data mana yang tersedia dan berapa kompleksitasnya. Kesalahan paling umum bukan logika, melainkan memakai operasi O(n) di dalam loop (misalnya `list.pop(0)` atau `x in list`) sehingga solusi O(n log n) diam-diam menjadi O(n²). Konsep strateginya dibahas di [Dynamic Programming](#java.dynamic-programming) (kurikulum Java); di sini fokus pada alat Python.'),
      table(['Struktur', 'Operasi', 'Kompleksitas'], [
        ['`list`', '`append`, `pop()`, `lst[i]` / `insert(0, x)`, `pop(0)`, `x in lst`', 'O(1) amortized / O(n)'],
        ['`collections.deque`', '`append`, `appendleft`, `pop`, `popleft`', 'O(1); akses tengah `dq[i]` O(n)'],
        ['`dict`, `set`', 'get/set/`in`/delete', 'O(1) rata-rata'],
        ['`heapq` (di atas list)', '`heappush`, `heappop` / `heapify` / `h[0]`', 'O(log n) / O(n) / O(1)'],
        ['`bisect`', '`bisect_left/right` / `insort`', 'O(log n) cari / O(n) karena menggeser elemen'],
        ['`sorted`, `list.sort`', 'Timsort, stabil', 'O(n log n)'],
      ]),
      code('Toolkit: heapq, bisect, deque, Counter, defaultdict, sort key', `import heapq
from bisect import bisect_left, bisect_right, insort
from collections import Counter, defaultdict, deque
from functools import cmp_to_key
from itertools import count
from operator import itemgetter

# heapq: MIN-heap di atas list biasa
h = []
for x in [5, 1, 8, 3]:
    heapq.heappush(h, x)
print(heapq.heappop(h), h[0])            # 1 3 -> h[0] selalu terkecil
maks = [-x for x in [5, 1, 8]]           # max-heap: simpan negatif (3.14+ juga punya heappush_max dkk.)
heapq.heapify(maks)
print(-heapq.heappop(maks))              # 8
print(heapq.nlargest(2, [5, 1, 8, 3]))   # [8, 5]

urutan = count()                         # pemecah seri: data (dict) tidak pernah dibandingkan
antrian = []
heapq.heappush(antrian, (2, next(urutan), {"tugas": "backup"}))
heapq.heappush(antrian, (1, next(urutan), {"tugas": "deploy"}))
heapq.heappush(antrian, (1, next(urutan), {"tugas": "notifikasi"}))
print(heapq.heappop(antrian)[2])         # {'tugas': 'deploy'}

# bisect: pencarian biner pada list TERURUT
nilai = [10, 20, 20, 30]
print(bisect_left(nilai, 20), bisect_right(nilai, 20))   # 1 3
print(bisect_right(nilai, 20) - bisect_left(nilai, 20))  # 2 kemunculan, O(log n)
insort(nilai, 25)                                        # [10, 20, 20, 25, 30]
batas, huruf = [60, 70, 80, 90], "EDCBA"
print(huruf[bisect_right(batas, 85)])                    # B
produk = [("teh", 15), ("kopi", 25), ("susu", 30)]       # terurut berdasarkan harga
print(bisect_left(produk, 20, key=itemgetter(1)))        # 1 -> parameter key: Python 3.10+

# deque, Counter, defaultdict
dq = deque([1, 2, 3]); dq.appendleft(0); dq.rotate(1)    # deque([3, 0, 1, 2])
c = Counter("abracadabra")
print(c.most_common(2), c["z"])                          # [('a', 5), ('b', 2)] 0 -> kunci hilang = 0
graf = defaultdict(list)
for u, v in [("A", "B"), ("A", "C")]:
    graf[u].append(v)

# sort key: kunci tuple; negasi untuk urutan menurun pada angka
siswa = [("citra", 88), ("ani", 92), ("budi", 88)]
print(sorted(siswa, key=lambda s: (-s[1], s[0])))        # nilai turun, lalu nama naik
# cmp_to_key bila urutan tidak bisa dinyatakan sebagai kunci: "largest number"
angka = [3, 30, 34, 5, 9]
urut = sorted(map(str, angka), key=cmp_to_key(lambda a, b: (b + a > a + b) - (b + a < a + b)))
print("".join(urut))                                     # 9534330`, 'python'),
      heading('Lima soal klasik'),
      code('1) Top-K kata terbanyak — Counter + kunci tuple / heap', `import heapq
from collections import Counter


def top_k(kata: list[str], k: int) -> list[str]:
    hitung = Counter(kata)
    # urut frekuensi menurun, seri dipecah alfabetis: O(n log n)
    return [w for w, _ in sorted(hitung.items(), key=lambda kv: (-kv[1], kv[0]))[:k]]


def top_k_heap(kata: list[str], k: int) -> list[str]:
    hitung = Counter(kata)
    # O(n log k): hanya menjaga k kandidat; cocok bila k jauh lebih kecil dari n
    return [w for w, _ in heapq.nsmallest(k, hitung.items(), key=lambda kv: (-kv[1], kv[0]))]


data = "a b c a b a d e e e".split()
assert top_k(data, 2) == top_k_heap(data, 2) == ["a", "e"]`, 'python'),
      code('2) Sliding window maximum — deque monoton, O(n)', `from collections import deque


def max_jendela(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()        # menyimpan INDEKS, nilainya menurun dari depan ke belakang
    hasil = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                # elemen lebih kecil di belakang tidak akan pernah jadi maksimum
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()            # buang indeks yang sudah keluar jendela
        if i >= k - 1:
            hasil.append(nums[dq[0]])
    return hasil


assert max_jendela([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]`, 'python'),
      code('3) Jalur terpendek berbobot — Dijkstra dengan heapq + defaultdict', `import heapq
import math
from collections import defaultdict


def dijkstra(sisi: list[tuple[str, str, int]], awal: str) -> dict[str, int]:
    graf: defaultdict[str, list[tuple[str, int]]] = defaultdict(list)
    for u, v, w in sisi:
        graf[u].append((v, w))
        graf[v].append((u, w))                   # graf tak berarah

    jarak = {awal: 0}
    heap = [(0, awal)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > jarak.get(u, math.inf):
            continue                             # entri basi: sudah ada jalur lebih pendek
        for v, w in graf[u]:
            nd = d + w
            if nd < jarak.get(v, math.inf):
                jarak[v] = nd
                heapq.heappush(heap, (nd, v))    # O((V + E) log V); tanpa decrease-key
    return jarak


kota = [("A", "B", 4), ("A", "C", 1), ("C", "B", 2), ("B", "D", 5)]
assert dijkstra(kota, "A") == {"A": 0, "B": 3, "C": 1, "D": 8}`, 'python'),
      code('4) Longest Increasing Subsequence — bisect, O(n log n)', `from bisect import bisect_left


def lis(nums: list[int]) -> int:
    ekor: list[int] = []          # ekor[i] = nilai akhir terkecil dari subsequence naik sepanjang i+1
    for x in nums:
        i = bisect_left(ekor, x)  # bisect_left: naik ketat; bisect_right: boleh sama (non-decreasing)
        if i == len(ekor):
            ekor.append(x)
        else:
            ekor[i] = x           # ganti dengan ekor yang lebih kecil: membuka peluang lebih panjang
    return len(ekor)              # catatan: isi "ekor" BUKAN subsequence-nya, hanya panjangnya benar


assert lis([10, 9, 2, 5, 3, 7, 101, 18]) == 4      # contoh: 2, 3, 7, 18`, 'python'),
      code('5) Menghitung pulau — batas rekursi dan DFS iteratif', `import sys

print(sys.getrecursionlimit())    # biasanya 1000


def pulau_rekursif(grid: list[list[str]]) -> int:
    # Grid 1000x1000 berisi satu pulau besar -> RecursionError: maximum recursion depth exceeded
    ...


def pulau(grid: list[list[str]]) -> int:
    baris, kolom = len(grid), len(grid[0])
    dilihat: set[tuple[int, int]] = set()
    jumlah = 0
    for r in range(baris):
        for c in range(kolom):
            if grid[r][c] != "1" or (r, c) in dilihat:
                continue
            jumlah += 1
            stack = [(r, c)]                         # stack eksplisit menggantikan call stack
            dilihat.add((r, c))
            while stack:
                y, x = stack.pop()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < baris and 0 <= nx < kolom and grid[ny][nx] == "1" and (ny, nx) not in dilihat:
                        dilihat.add((ny, nx))       # tandai saat MASUK stack, bukan saat keluar
                        stack.append((ny, nx))
    return jumlah


peta = [list("11000"), list("11011"), list("00100")]
assert pulau(peta) == 3

# Input cepat untuk online judge: input() lambat untuk ratusan ribu baris
# input = sys.stdin.readline
# n = int(input()); arr = list(map(int, input().split()))`, 'python'),
      callout('warn', 'sys.setrecursionlimit bukan solusi universal', 'Menaikkan limit (`sys.setrecursionlimit(10**6)`) memang umum di online judge. Sejak 3.11 pemanggilan fungsi Python-ke-Python tidak lagi memakan stack C, sehingga lebih aman dari dulu, tetapi rekursi yang melewati kode C (misalnya lewat `__eq__`, `sorted` dengan key, atau ekstensi) tetap bisa menghabiskan stack C dan membuat proses crash tanpa traceback. Versi iteratif dengan stack eksplisit selalu paling aman. Untuk DP rekursif, `@cache` membuat memoization satu baris.'),
      callout('tip', 'Pola yang perlu dihafal', '`deque` untuk BFS dan jendela geser; `heapq` dengan tuple `(prioritas, counter, data)` untuk antrian prioritas; `bisect` untuk "cari posisi di data terurut"; `Counter`/`defaultdict(int)` untuk frekuensi; `sorted(key=lambda x: (-a, b))` untuk urutan campuran. Sebutkan kompleksitas setiap operasi saat menjelaskan solusi di interview.'),
      ...quiz([
        ['PYF-18', 'Kode `heapq.heappush(h, (prioritas, tugas_dict))` sesekali gagal dengan `TypeError: "<" not supported between instances of dict and dict`. Mengapa, dan bagaimana memperbaikinya?', 'Tuple dibandingkan elemen demi elemen. Bila dua prioritas sama, Python membandingkan elemen kedua, yaitu dict, yang tidak mendukung `<`. Sisipkan pemecah seri yang selalu unik dan bisa dibandingkan di tengah: `(prioritas, next(counter), tugas_dict)`. Ini juga membuat urutan tugas berprioritas sama menjadi FIFO dan stabil.'],
        ['PYF-19', 'BFS memakai `antrian = [awal]` dan `node = antrian.pop(0)`. Benar secara logika, tetapi time limit exceeded pada graf 10⁵ node. Mengapa?', '`list.pop(0)` menggeser semua elemen sisa sehingga O(n) per operasi, membuat BFS menjadi O(V²) dalam kasus terburuk. Ganti dengan `collections.deque` dan `popleft()` yang O(1). Masalah serupa: `x in list` di dalam loop (pakai set) dan `insort` berulang pada list besar (O(n) per sisipan).'],
      ]),
      ...practice('pyf-algo', [
        'Selesaikan kelima soal di atas tanpa melihat kode, lalu tulis tes `assert` untuk kasus kosong, satu elemen, dan semua elemen sama.',
        'Implementasikan BFS jalur terpendek di grid dengan `deque` dan kembalikan jalurnya (bukan hanya panjangnya) memakai dict parent.',
        'Ubah `lis` agar juga merekonstruksi subsequence-nya (simpan indeks dan predecessor).',
        'Ukur dengan `timeit`: BFS dengan `list.pop(0)` vs `deque.popleft()` pada 100.000 node, dan Dijkstra pada graf acak 10⁵ sisi.',
      ]),
      references(
        ['heapq', 'https://docs.python.org/3/library/heapq.html'],
        ['bisect', 'https://docs.python.org/3/library/bisect.html'],
        ['collections', 'https://docs.python.org/3/library/collections.html'],
        ['Sorting Techniques', 'https://docs.python.org/3/howto/sorting.html'],
        ['TimeComplexity (Python Wiki)', 'https://wiki.python.org/moin/TimeComplexity'],
        ['sys.setrecursionlimit', 'https://docs.python.org/3/library/sys.html#sys.setrecursionlimit'],
      ),
    ],
  },

  /* ──────────────────────── Python untuk Data ──────────────────────── */
  {
    ...data,
    id: 'pyf-numpy',
    title: 'Python untuk Data: NumPy & Vektorisasi',
    summary: 'ndarray, dtype dan shape, vektorisasi, aturan broadcasting, indexing (slicing, boolean, fancy), view vs copy, dan alasan NumPy jauh lebih cepat dari loop Python.',
    duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('NumPy adalah fondasi hampir seluruh ekosistem data Python: pandas, scikit-learn, PyTorch, dan matplotlib berbicara dalam bahasa `ndarray`. Kecepatannya berasal dari tiga hal: elemen disimpan **berdempetan di memori dengan satu tipe** (bukan list berisi pointer ke objek Python), operasi dijalankan **di loop C** yang sudah dikompilasi (sering memakai instruksi SIMD), dan tidak ada interpretasi bytecode serta pemeriksaan tipe per elemen.'),
      code('Loop vs vektorisasi', `# uv add numpy
import timeit

import numpy as np

rng = np.random.default_rng(42)                     # generator acak modern (bukan np.random.seed)
harga = rng.uniform(1_000, 100_000, size=1_000_000)
jumlah = rng.integers(1, 10, size=1_000_000)


def total_loop() -> float:
    total = 0.0
    for h, j in zip(harga, jumlah):                 # setiap elemen dibungkus jadi objek Python
        total += h * j
    return total


def total_vektor() -> float:
    return float((harga * jumlah).sum())            # satu operasi; loop terjadi di C


print(timeit.timeit(total_loop, number=1))
print(timeit.timeit(total_vektor, number=1))
# Hasil tipikal: loop ratusan milidetik, vektor beberapa milidetik.
# Iterasi Python atas ndarray bahkan lebih lambat daripada atas list biasa.
print(np.isclose(total_loop(), total_vektor()))     # bandingkan float dengan toleransi`, 'python'),
      code('ndarray: membuat, dtype, shape, axis', `import numpy as np

a = np.array([1, 2, 3])                   # dtype int64 (NumPy 2.x juga di Windows)
b = np.arange(12).reshape(3, 4)           # 3 baris x 4 kolom
print(b.shape, b.ndim, b.dtype, b.size)   # (3, 4) 2 int64 12

print(np.zeros((2, 3)), np.ones(5, dtype=np.int32), np.linspace(0, 1, 5), np.full(3, 7))
print(b.sum(), b.sum(axis=0), b.sum(axis=1))   # 66 [12 15 18 21] [ 6 22 38]
# axis=0 "menyusuri baris" -> hasil per kolom; axis=1 -> hasil per baris
print(b.mean(axis=0), b.max(), b.argmax(), b.T.shape)   # transpose: (4, 3)

f = b.astype(np.float32)                  # konversi dtype: membuat array baru
piksel = np.array([200, 250], dtype=np.uint8)
print(piksel + 100)                       # [ 44  94] -> overflow DIAM-DIAM (wrap-around)!
print(piksel.astype(np.int16) + 100)      # [300 350] -> naikkan dtype dulu

nilai = np.array([1.0, np.nan, 3.0])
print(nilai.mean(), np.nanmean(nilai))    # nan 2.0 -> NaN menular; pakai fungsi nan*`, 'python'),
      code('Indexing: slicing (view), boolean & fancy (copy)', `import numpy as np

data = np.arange(10)                      # [0 1 2 3 4 5 6 7 8 9]
irisan = data[2:5]                        # VIEW: berbagi memori dengan data
irisan[0] = 99
print(data[2])                            # 99 -> data asli ikut berubah!
aman = data[2:5].copy()                   # salinan eksplisit

genap = data % 2 == 0                     # array boolean: [ True False  True ...]
print(data[genap])                        # boolean indexing -> COPY
data[data > 50] = 0                       # assignment lewat mask mengubah data asli
print(data[[0, 3, 3]])                    # fancy indexing dengan daftar indeks -> COPY

m = np.arange(12).reshape(3, 4)
print(m[1, 2], m[:, 0], m[-1])            # 6, kolom pertama [0 4 8], baris terakhir
print(m[m[:, 0] > 0])                     # baris yang kolom pertamanya > 0
print(np.where(m > 5, m, -1))             # if-else per elemen
kategori = np.select([m < 4, m < 8], ["kecil", "sedang"], default="besar")
print(np.shares_memory(data, irisan), np.shares_memory(data, aman))   # True False`, 'python'),
      heading('Broadcasting'),
      paragraph('Broadcasting membuat operasi antar array dengan shape berbeda tanpa menyalin data. Aturannya: bandingkan shape **dari kanan**; dua dimensi kompatibel bila sama atau salah satunya 1; dimensi yang kurang dianggap 1. Contoh: `(3, 4)` dengan `(4,)` → `(3, 4)`; `(3, 1)` dengan `(1, 4)` → `(3, 4)`; `(3,)` dengan `(4,)` → error.'),
      code('Broadcasting dalam praktik', `import numpy as np

nilai = np.array([[80, 90, 70],
                  [60, 75, 85],
                  [95, 65, 80]], dtype=float)      # 3 siswa x 3 mapel

rata_mapel = nilai.mean(axis=0)                     # shape (3,)
z = (nilai - rata_mapel) / nilai.std(axis=0)        # (3,3) op (3,) -> standardisasi per kolom

bobot = np.array([0.5, 0.3, 0.2])                   # bobot per mapel
akhir = (nilai * bobot).sum(axis=1)                 # nilai akhir per siswa; sama dengan nilai @ bobot
print(akhir)                                        # [81.  71.5 83. ]

rata_siswa = nilai.mean(axis=1, keepdims=True)      # shape (3, 1): menempel per BARIS
print(nilai - rata_siswa)                           # tanpa keepdims -> (3,3) - (3,) salah arah!

# Jarak semua pasangan titik tanpa loop: (n,1,2) - (1,n,2) -> (n,n,2)
rng = np.random.default_rng(0)
titik = rng.random((5, 2))
selisih = titik[:, None, :] - titik[None, :, :]
jarak = np.sqrt((selisih ** 2).sum(axis=-1))
print(jarak.shape, np.allclose(jarak, jarak.T))     # (5, 5) True
# Hati-hati: n = 100_000 berarti array perantara 100_000 x 100_000 x 2 -> memori habis`, 'python'),
      table(['Tugas', 'Loop Python', 'NumPy'], [
        ['Jumlah perkalian elemen', '`sum(h * j for h, j in zip(H, J))`', '`H @ J` atau `(H * J).sum()`'],
        ['Filter', '`[x for x in a if x > 0]`', '`a[a > 0]`'],
        ['If-else per elemen', 'Comprehension dengan ternary', '`np.where(kond, a, b)` / `np.select`'],
        ['Normalisasi kolom', 'Loop bersarang', '`(X - X.mean(0)) / X.std(0)`'],
        ['Hitung per kategori', 'dict + loop', '`np.bincount(kode, weights=nilai)`'],
      ]),
      callout('warn', 'View vs copy, dan perubahan NumPy 2', 'Slicing dasar menghasilkan *view*; mengubahnya mengubah array asli. Boolean dan fancy indexing menghasilkan *copy*. Bila ragu, cek `np.shares_memory` atau panggil `.copy()`. NumPy 2.0 juga mengubah aturan promosi tipe (NEP 50): `np.float32(3) + 3.0` kini tetap `float32`, dan repr skalar menjadi `np.float64(3.0)`. Kode lama yang bergantung pada promosi ke float64 bisa berubah presisinya; lihat migration guide.'),
      ...quiz([
        ['PYF-20', 'Apa shape hasil `a + b` untuk: (1) a `(3, 1)` dan b `(4,)`, (2) a `(3,)` dan b `(4,)`, (3) a `(2, 3)` dan b `(2,)`?', '(1) `(3, 4)`: b dianggap `(1, 4)`, lalu kedua dimensi 1 diregangkan. (2) Error: dimensi terakhir 3 dan 4 berbeda dan tidak ada yang 1. (3) Error: dibandingkan dari kanan, 3 vs 2 tidak cocok; untuk menambahkan per baris, ubah b menjadi `b[:, None]` dengan shape `(2, 1)`.'],
        ['PYF-21', 'Mengapa `data[data > 5] = 0` mengubah `data`, tetapi `sub = data[data > 5]; sub[:] = 0` tidak?', 'Ekspresi `data[mask] = 0` adalah assignment yang memanggil `__setitem__` pada `data` sehingga data asli diubah di tempat. Sedangkan `data[mask]` di sisi kanan memanggil `__getitem__` dengan boolean indexing yang selalu menghasilkan array baru (copy); mengubah `sub` hanya mengubah salinan itu.'],
      ]),
      ...practice('pyf-numpy', [
        'Ulangi benchmark loop vs vektor untuk ukuran 10³, 10⁵, dan 10⁷ elemen; catat di ukuran berapa NumPy mulai menang telak dan jelaskan biaya konversi list → array.',
        'Tanpa loop Python: dari matriks nilai 100 siswa x 5 mapel, hitung z-score per mapel, nilai akhir berbobot, dan indeks 10 siswa teratas (`argsort`).',
        'Tunjukkan bug view: fungsi yang menerima slice lalu mengubahnya, merusak array pemanggil; perbaiki dan tulis tes dengan `np.shares_memory`.',
        'Hitung total pengeluaran per kategori dengan `np.unique(..., return_inverse=True)` + `np.bincount`, lalu bandingkan hasilnya dengan dict + loop.',
      ]),
      references(
        ['NumPy: the absolute basics for beginners', 'https://numpy.org/doc/stable/user/absolute_beginners.html'],
        ['Broadcasting', 'https://numpy.org/doc/stable/user/basics.broadcasting.html'],
        ['Indexing on ndarrays', 'https://numpy.org/doc/stable/user/basics.indexing.html'],
        ['Copies and views', 'https://numpy.org/doc/stable/user/basics.copies.html'],
        ['NumPy 2.0 migration guide', 'https://numpy.org/doc/stable/numpy_2_0_migration_guide.html'],
      ),
    ],
  },
  {
    ...data,
    id: 'pyf-pandas-mendalam',
    title: 'Python untuk Data: pandas Mendalam (+ Polars)',
    summary: 'Series/DataFrame, loc/iloc, missing data dan nullable dtype, groupby (agg, transform, filter), merge dengan validate, pivot/melt, time series (resample, rolling, zona waktu), performa, Copy-on-Write, dan perbandingan dengan Polars.',
    duration: '3–4 jam', level: 'Med',
    blocks: [
      paragraph('Modul [Python & pandas untuk Pipeline Data](#llm.python-pandas-untuk-pipeline-data) di kurikulum LLM menunjukkan kebiasaan pipeline: vektorisasi dengan `np.select`, Parquet antar tahap, dan validasi schema dengan pandera. Modul ini menggali operasinya: cara pandas menyimpan data, operasi yang paling sering salah (merge, groupby, chained assignment), time series, dan kapan beralih ke Polars. Contoh memakai pandas 2.2+; pandas 3.0 menjadikan **Copy-on-Write** perilaku default, jadi tulis kode yang benar di keduanya. Cek versi Anda dengan `pd.__version__`.'),
      code('Data contoh dan seleksi dasar', `# uv add pandas pyarrow
import numpy as np
import pandas as pd

transaksi = pd.DataFrame({
    "id": range(1, 9),
    "user_id": [1, 1, 2, 2, 3, 3, 3, 4],
    "tanggal": pd.to_datetime(["2026-09-03", "2026-09-15", "2026-09-20", "2026-10-02",
                               "2026-10-05", "2026-10-18", "2026-10-30", "2026-10-31"]),
    "kategori": ["makan", "transport", "makan", "belanja", "makan", "makan", "transport", "belanja"],
    "jumlah": [45_000, 20_000, 60_000, 350_000, 30_000, 55_000, 15_000, 120_000],
})
user = pd.DataFrame({"user_id": [1, 2, 3, 5], "kota": ["Jakarta", "Bandung", "Jakarta", "Medan"]})

transaksi.info()                                   # dtype tiap kolom + memori
print(transaksi.describe())                        # statistik kolom numerik
s = transaksi["jumlah"]                            # Series: array 1D + index
print(type(s), s.dtype, s.index[:3].tolist())

# loc = berdasarkan LABEL / boolean, iloc = berdasarkan POSISI
besar = transaksi.loc[transaksi["jumlah"] >= 100_000, ["tanggal", "kategori", "jumlah"]]
print(transaksi.iloc[0:3, -1])                     # 3 baris pertama, kolom terakhir
makan_okt = transaksi.query("kategori == 'makan' and tanggal >= '2026-10-01'")
transaksi = transaksi.assign(
    bulan=transaksi["tanggal"].dt.to_period("M"),
    pajak=lambda d: (d["jumlah"] * 0.11).round().astype("int64"),
)`, 'python'),
      code('Missing data dan nullable dtype', `mentah = pd.DataFrame({
    "jumlah": ["45000", "abc", None, "30000"],
    "tanggal": ["2026-10-01", "2026-13-01", "2026-10-03", None],
    "kategori": ["makan", None, "transport", "makan"],
})
bersih = mentah.assign(
    jumlah=pd.to_numeric(mentah["jumlah"], errors="coerce").astype("Int64"),  # gagal -> <NA>, tetap integer
    tanggal=pd.to_datetime(mentah["tanggal"], errors="coerce", format="%Y-%m-%d"),  # bulan 13 -> NaT
    kategori=mentah["kategori"].fillna("lainnya"),
)
print(bersih.dtypes)                 # Int64 (huruf I besar = nullable), datetime64[ns], object/str
print(bersih.isna().sum())           # jumlah nilai hilang per kolom
lengkap = bersih.dropna(subset=["jumlah", "tanggal"])
# Tanpa nullable dtype, satu NaN mengubah kolom int menjadi float64 (45000 -> 45000.0)`, 'python'),
      code('groupby, merge, pivot', `# Named aggregation: nama kolom hasil eksplisit
ringkas = (
    transaksi.groupby("kategori")
    .agg(total=("jumlah", "sum"), rata=("jumlah", "mean"), n=("id", "count"))
    .sort_values("total", ascending=False)
)

# transform: hasil sepanjang DataFrame asli -> porsi tiap transaksi dari total user-nya
transaksi["porsi_user"] = transaksi["jumlah"] / transaksi.groupby("user_id")["jumlah"].transform("sum")
# filter: buang grup utuh -> hanya user dengan >= 3 transaksi
aktif = transaksi.groupby("user_id").filter(lambda g: len(g) >= 3)
# Peringkat dalam grup
transaksi["rank_user"] = transaksi.groupby("user_id")["jumlah"].rank(ascending=False, method="dense")

# merge: validate menangkap duplikat kunci yang meledakkan jumlah baris
gabung = transaksi.merge(user, on="user_id", how="left", validate="many_to_one", indicator=True)
print(gabung["_merge"].value_counts())   # left_only = user_id 4 tidak ada di tabel user
assert len(gabung) == len(transaksi)     # left join many_to_one tidak boleh menambah baris

pivot = gabung.pivot_table(index="kota", columns="kategori", values="jumlah",
                           aggfunc="sum", fill_value=0, margins=True)   # baris/kolom "All"
panjang = pivot.reset_index().melt(id_vars="kota", var_name="kategori", value_name="total")  # lebar -> panjang`, 'python'),
      code('Time series: resample, rolling, Grouper, zona waktu', `ts = transaksi.set_index("tanggal").sort_index()

bulanan = ts["jumlah"].resample("ME").sum()            # "ME" = akhir bulan (pandas 2.2+, "M" deprecated)
mingguan = ts["jumlah"].resample("W-MON").agg(["sum", "count"])
rolling_7h = ts["jumlah"].rolling("7D").sum()          # jendela WAKTU 7 hari, butuh index datetime terurut
pertumbuhan = bulanan.pct_change()                      # perubahan bulan ke bulan
kemarin = ts["jumlah"].shift(1)                         # nilai baris sebelumnya

# groupby + waktu sekaligus: total per user per bulan
per_user_bulan = transaksi.groupby(["user_id", pd.Grouper(key="tanggal", freq="ME")])["jumlah"].sum()

# Zona waktu: localize = MENEMPELKAN zona pada waktu naif; convert = MEMINDAHKAN ke zona lain
wib = ts.tz_localize("Asia/Jakarta")
utc = wib.tz_convert("UTC")
print(transaksi["tanggal"].dt.day_name().value_counts())   # aksesor .dt untuk komponen tanggal`, 'python'),
      code('Performa: dtype, vektorisasi, Copy-on-Write', `print(transaksi.memory_usage(deep=True).sum(), "byte")
transaksi["kategori"] = transaksi["kategori"].astype("category")   # string berulang -> kode integer kecil
transaksi["jumlah"] = pd.to_numeric(transaksi["jumlah"], downcast="integer")
# Kolom category: tulis observed=True agar kategori kosong tidak ikut (default berubah di pandas 3)
per_kat = transaksi.groupby("kategori", observed=True)["jumlah"].sum()

# LAMBAT: apply(axis=1) memanggil fungsi Python untuk setiap baris
transaksi["diskon"] = transaksi.apply(lambda r: r["jumlah"] * 0.1 if r["kategori"] == "belanja" else 0, axis=1)
# CEPAT: operasi kolom
transaksi["diskon"] = np.where(transaksi["kategori"] == "belanja", transaksi["jumlah"] * 0.1, 0)

# SALAH: chained assignment menulis ke objek sementara; dengan Copy-on-Write tidak pernah berhasil
transaksi[transaksi["jumlah"] < 20_000]["jumlah"] = 20_000
# BENAR: satu langkah .loc
transaksi.loc[transaksi["jumlah"] < 20_000, "jumlah"] = 20_000
sub = transaksi[transaksi["user_id"] == 3].copy()       # turunan yang akan diubah: .copy() eksplisit

# CSV besar: baca kolom yang perlu saja, dtype eksplisit, engine pyarrow
# df = pd.read_csv("besar.csv", usecols=["tanggal", "kategori", "jumlah"],
#                  engine="pyarrow", dtype_backend="pyarrow", parse_dates=["tanggal"])
# Simpan antar tahap sebagai Parquet: df.to_parquet("transaksi.parquet")`, 'python'),
      heading('Polars: kapan dan bagaimana'),
      code('Pipeline yang sama di Polars (lazy)', `# uv add polars
import polars as pl

hasil = (
    pl.scan_csv("transaksi.csv", try_parse_dates=True)   # lazy: belum membaca apa pun
    .filter(pl.col("jumlah") > 0)
    .with_columns(pl.col("tanggal").dt.truncate("1mo").alias("bulan"))
    .group_by("bulan", "kategori")
    .agg(
        pl.col("jumlah").sum().alias("total"),
        pl.len().alias("n"),
    )
    .sort("bulan", "total", descending=[False, True])
    .collect()                                           # optimizer (projection/predicate pushdown) + eksekusi paralel
)
df_pandas = hasil.to_pandas()                            # interop dengan library yang butuh pandas`, 'python'),
      table(['Aspek', 'pandas', 'Polars'], [
        ['Model eksekusi', 'Eager, sebagian besar single-thread', 'Eager atau lazy dengan query optimizer, multi-thread'],
        ['Index', 'Index/MultiIndex sebagai konsep inti', 'Tanpa index; semua kolom setara'],
        ['API', 'Banyak cara untuk satu hal, mutasi di tempat umum', 'Ekspresi `pl.col(...)` yang komposabel, immutable'],
        ['Ekosistem', 'Didukung hampir semua library (scikit-learn, statsmodels, plotting)', 'Berkembang cepat; konversi lewat Arrow murah'],
        ['Pilih bila', 'Analisis interaktif, data muat di memori, butuh ekosistem', 'Data jutaan sampai ratusan juta baris, pipeline ETL, butuh kecepatan'],
      ]),
      callout('tip', 'Kebiasaan yang menyelamatkan', 'Selalu `validate=` pada merge dan bandingkan jumlah baris sebelum/sesudah. Tulis transformasi sebagai rantai method (`.assign().query().groupby()`) di dalam fungsi yang menerima dan mengembalikan DataFrame, sehingga mudah dites. Hindari `inplace=True` (tidak lebih cepat, sedang diarahkan untuk dihentikan) dan `apply(axis=1)` untuk data besar.'),
      ...quiz([
        ['PYF-22', 'Mengapa `df[df["jumlah"] < 0]["jumlah"] = 0` tidak mengubah `df`, dan apa bentuk yang benar?', 'Ekspresi itu dua langkah: `df[mask]` menghasilkan DataFrame baru (copy), lalu assignment kolom dilakukan pada objek sementara itu yang langsung dibuang. Di pandas 2.x muncul SettingWithCopyWarning dan hasilnya tidak bisa diandalkan; dengan Copy-on-Write (default pandas 3.0) chained assignment tidak pernah mengubah df asli. Bentuk benar: `df.loc[df["jumlah"] < 0, "jumlah"] = 0`.'],
        ['PYF-23', 'Setelah `transaksi.merge(user, on="user_id")`, jumlah baris naik dari 1 juta menjadi 1,3 juta. Apa penyebabnya dan bagaimana mencegahnya?', 'Tabel `user` punya `user_id` duplikat, sehingga setiap transaksi dicocokkan dengan beberapa baris user (perkalian baris) dan total penjualan ikut terhitung ganda. Cegah dengan `validate="many_to_one"` yang melempar `MergeError` bila kunci kanan tidak unik, periksa `user["user_id"].duplicated().sum()`, dan pakai `indicator=True` untuk melihat baris yang tidak cocok.'],
        ['PYF-24', 'Apa beda `groupby(...).agg(...)` dan `groupby(...).transform(...)`?', '`agg` meringkas: satu baris per grup (misalnya total per kategori). `transform` mengembalikan hasil dengan panjang dan index sama seperti DataFrame asli, sehingga bisa langsung dijadikan kolom baru (misalnya porsi transaksi terhadap total user-nya, atau mengisi missing value dengan rata-rata grup).'],
      ]),
      ...practice('pyf-pandas', [
        'Dari CSV transaksi minimal 100.000 baris (buat dengan NumPy): bersihkan tipe dengan `to_numeric`/`to_datetime(errors="coerce")`, laporkan jumlah baris yang dibuang, dan simpan hasil sebagai Parquet.',
        'Buat laporan per kota per bulan dengan merge (`validate`), `pd.Grouper`, dan `pivot_table`; tambahkan kolom pertumbuhan bulanan dengan `pct_change`.',
        'Ukur memori dan waktu sebelum/sesudah: dtype `category`, `downcast`, dan mengganti `apply(axis=1)` dengan `np.where`/`np.select`.',
        'Tulis ulang pipeline yang sama di Polars lazy, bandingkan waktu eksekusi, dan pastikan hasilnya identik (`assert_frame_equal` setelah konversi).',
      ]),
      references(
        ['pandas User Guide', 'https://pandas.pydata.org/docs/user_guide/index.html'],
        ['Group by: split-apply-combine', 'https://pandas.pydata.org/docs/user_guide/groupby.html'],
        ['Merge, join, concatenate', 'https://pandas.pydata.org/docs/user_guide/merging.html'],
        ['Time series / date functionality', 'https://pandas.pydata.org/docs/user_guide/timeseries.html'],
        ['Copy-on-Write', 'https://pandas.pydata.org/docs/user_guide/copy_on_write.html'],
        ['Scaling to large datasets', 'https://pandas.pydata.org/docs/user_guide/scale.html'],
        ['Polars User Guide', 'https://docs.pola.rs/'],
      ),
    ],
  },
  {
    ...data,
    id: 'pyf-sqlalchemy-alembic',
    title: 'Python untuk Data: SQLAlchemy 2.0 & Alembic di Luar Web Framework',
    summary: 'Engine, Core vs ORM, model bertipe dengan Mapped/mapped_column, relationship, Session dan unit of work, query select(), eager loading, bulk insert, lalu migrasi skema dengan Alembic (autogenerate, batch mode SQLite, review).',
    duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Database tidak hanya dipakai di web app. Skrip ETL, CLI, job terjadwal, dan worker juga butuh akses database yang aman dan skema yang terkelola. **SQLAlchemy 2.0** menyediakan dua lapis: **Core** (SQL sebagai ekspresi Python, dekat dengan SQL) dan **ORM** (objek Python dipetakan ke tabel, dengan unit of work). **Alembic** dari pembuat yang sama mengelola migrasi skema. Versi async di dalam FastAPI dibahas di [Database Async (SQLAlchemy 2.0)](#python.database-async-sqlalchemy-2-0); di sini sinkron dan berdiri sendiri.'),
      table(['Lapis', 'Bentuk', 'Pakai untuk'], [
        ['Core', '`insert(tabel)`, `select(...)`, `conn.execute()`', 'Bulk load, ETL, query laporan, kontrol SQL penuh'],
        ['ORM', 'Kelas model, `Session`, `relationship`', 'Logika domain, CRUD, objek yang saling terhubung'],
        ['`text()`', 'SQL mentah dengan bind parameter', 'Query khusus database; tetap aman dari injeksi'],
      ]),
      code('models.py — model bertipe (gaya 2.0)', `# uv add sqlalchemy alembic
from datetime import datetime

from sqlalchemy import ForeignKey, MetaData, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# Konvensi nama constraint: wajib agar Alembic bisa menghapus/mengubah constraint dengan nama stabil
KONVENSI = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=KONVENSI)


class Akun(Base):
    __tablename__ = "akun"

    id: Mapped[int] = mapped_column(primary_key=True)
    nama: Mapped[str] = mapped_column(String(50), unique=True)
    transaksi: Mapped[list["Transaksi"]] = relationship(
        back_populates="akun", cascade="all, delete-orphan"   # hapus akun -> transaksinya ikut
    )

    def __repr__(self) -> str:
        return f"Akun(id={self.id}, nama={self.nama!r})"


class Transaksi(Base):
    __tablename__ = "transaksi"

    id: Mapped[int] = mapped_column(primary_key=True)
    akun_id: Mapped[int] = mapped_column(ForeignKey("akun.id"), index=True)
    jumlah: Mapped[int]                                  # rupiah utuh; tipe & NOT NULL dari anotasi
    kategori: Mapped[str] = mapped_column(String(30), index=True)
    catatan: Mapped[str | None] = mapped_column(String(200))   # Optional -> kolom nullable
    dibuat: Mapped[datetime] = mapped_column(server_default=func.now())
    akun: Mapped[Akun] = relationship(back_populates="transaksi")`, 'python'),
      code('app.py — Session, unit of work, dan query select()', `from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, selectinload, sessionmaker

from models import Akun, Base, Transaksi

engine = create_engine("sqlite:///kas.db", echo=True)   # echo=True: cetak SQL yang dikirim (belajar/debug)
Base.metadata.create_all(engine)                         # HANYA untuk eksperimen; skema nyata via Alembic
SessionLocal = sessionmaker(engine)

# Tulis: session.begin() commit otomatis di akhir blok, rollback bila exception
with SessionLocal() as session, session.begin():
    dompet = Akun(nama="dompet", transaksi=[
        Transaksi(jumlah=45_000, kategori="makan"),
        Transaksi(jumlah=20_000, kategori="transport", catatan="ojek"),
    ])
    session.add(dompet)                                  # cascade: transaksi ikut tersimpan

# Baca & ubah
with SessionLocal() as session, session.begin():
    akun = session.scalars(select(Akun).where(Akun.nama == "dompet")).one()   # one(): error bila 0 atau >1
    t = session.get(Transaksi, 1)                         # berdasarkan primary key; None bila tidak ada
    if t is not None:
        t.kategori = "kuliner"                            # cukup ubah atribut: UPDATE dibuat saat flush
    akun.transaksi.append(Transaksi(jumlah=15_000, kategori="kopi"))

# Query laporan: hindari N+1 dengan eager loading
with SessionLocal() as session:
    semua = session.scalars(select(Akun).options(selectinload(Akun.transaksi)).order_by(Akun.nama)).all()
    for a in semua:
        print(a.nama, [t.jumlah for t in a.transaksi])   # tanpa query tambahan per akun

    stmt = (
        select(Transaksi.kategori, func.count().label("n"), func.sum(Transaksi.jumlah).label("total"))
        .join(Transaksi.akun)
        .where(Akun.nama == "dompet")
        .group_by(Transaksi.kategori)
        .order_by(func.sum(Transaksi.jumlah).desc())
    )
    for kategori, n, total in session.execute(stmt):    # execute -> baris (tuple); scalars -> objek
        print(f"{kategori:<10} {n:>3} {total:>10,}")`, 'python'),
      code('Core: bulk insert, update, dan SQL mentah yang aman', `from sqlalchemy import insert, text, update

from models import Transaksi

baris = [{"akun_id": 1, "jumlah": 10_000 + i, "kategori": "impor"} for i in range(10_000)]

with engine.begin() as conn:                              # transaksi: commit di akhir, rollback bila error
    conn.execute(insert(Transaksi), baris)                # list of dict -> executemany, jauh lebih cepat dari add() satu per satu
    conn.execute(
        update(Transaksi).where(Transaksi.kategori == "impor").values(kategori="lainnya")
    )
    n = conn.execute(
        text("SELECT count(*) FROM transaksi WHERE jumlah > :minimum"),   # bind parameter, BUKAN f-string
        {"minimum": 15_000},
    ).scalar_one()
    print(n)`, 'python'),
      table(['Jebakan', 'Gejala', 'Perbaikan'], [
        ['Lazy load setelah session ditutup', '`DetachedInstanceError` saat mengakses `akun.transaksi`', 'Muat yang diperlukan selagi session terbuka (`selectinload`), atau kembalikan DTO/dict'],
        ['N+1 query', 'Satu query akun + satu query per akun (terlihat dengan `echo=True`)', '`selectinload` untuk koleksi, `joinedload` untuk many-to-one'],
        ['Lupa commit', 'Data hilang setelah skrip selesai', 'Pola `with Session() as s, s.begin():` atau `engine.begin()`'],
        ['Session hidup terlalu lama', 'Memori membengkak, data basi, lock lama', 'Satu session per unit kerja (per job/per batch)'],
        ['`expire_on_commit` (default True)', 'Atribut dimuat ulang (query baru) setelah commit', 'Biarkan default; set `expire_on_commit=False` hanya bila objek dipakai setelah session ditutup'],
        ['`create_all` di produksi', 'Kolom baru tidak pernah ditambahkan ke tabel lama', 'Alembic untuk semua perubahan skema'],
      ]),
      heading('Migrasi skema dengan Alembic'),
      code('Terminal — alur kerja Alembic', `uv run alembic init migrations          # membuat alembic.ini + folder migrations/
# (versi Alembic terbaru juga punya template yang menaruh konfigurasi di pyproject.toml:
#  alembic init --template pyproject migrations — cek "alembic list_templates")
# alembic.ini:  sqlalchemy.url = sqlite:///kas.db

uv run alembic revision --autogenerate -m "buat tabel akun dan transaksi"
# BACA dan perbaiki file di migrations/versions/ sebelum dijalankan!
uv run alembic upgrade head              # terapkan semua migrasi
uv run alembic current                   # revisi yang terpasang di database
uv run alembic history --verbose
uv run alembic downgrade -1              # mundur satu revisi
uv run alembic upgrade head --sql        # mode offline: cetak SQL untuk direview DBA, tanpa eksekusi
uv run alembic check                     # gagal bila model berubah tapi belum ada migrasinya (berguna di CI)`, 'bash'),
      code('migrations/env.py (potongan) dan contoh file migrasi', `# ===== migrations/env.py =====
from models import Base           # alembic.ini default berisi prepend_sys_path = . sehingga import ini jalan

target_metadata = Base.metadata    # sumber kebenaran untuk --autogenerate

# di dalam run_migrations_online():
#     context.configure(
#         connection=connection,
#         target_metadata=target_metadata,
#         render_as_batch=True,    # SQLite tidak mendukung sebagian besar ALTER TABLE:
#     )                            # batch mode membuat tabel baru, salin data, lalu ganti nama


# ===== migrations/versions/3f2a1c9d8e7b_tambah_kolom_lokasi.py =====
"""tambah kolom lokasi

Revision ID: 3f2a1c9d8e7b
Revises: 1a2b3c4d5e6f
"""
import sqlalchemy as sa
from alembic import op

revision = "3f2a1c9d8e7b"
down_revision = "1a2b3c4d5e6f"


def upgrade() -> None:
    with op.batch_alter_table("transaksi") as batch_op:
        batch_op.add_column(sa.Column("lokasi", sa.String(100), nullable=True))   # nullable dulu
    # Migrasi data terpisah dari perubahan skema, ditulis eksplisit:
    op.execute("UPDATE transaksi SET lokasi = 'tidak diketahui' WHERE lokasi IS NULL")


def downgrade() -> None:
    with op.batch_alter_table("transaksi") as batch_op:
        batch_op.drop_column("lokasi")`, 'python'),
      callout('warn', 'Autogenerate adalah draf, bukan kebenaran', 'Alembic membandingkan `Base.metadata` dengan skema database, tetapi tidak bisa membaca niat. **Rename kolom/tabel** terdeteksi sebagai drop + add (data hilang); ubah manual menjadi `alter_column(..., new_column_name=...)`. Perubahan tipe, server default, dan nilai Enum tidak selalu terdeteksi. Tambah kolom `NOT NULL` ke tabel berisi data butuh tiga langkah: tambah nullable, isi data, lalu ubah menjadi NOT NULL. Selalu review, uji `upgrade` dan `downgrade` di salinan database, dan commit file migrasi bersama perubahan model.'),
      ...quiz([
        ['PYF-25', 'Fungsi `ambil_akun()` mengembalikan objek Akun dari dalam `with Session() as s:`. Di luar fungsi, `akun.transaksi` melempar DetachedInstanceError. Mengapa, dan apa solusinya?', 'Relasi `transaksi` default-nya lazy: baru dimuat saat diakses, dan itu butuh session. Setelah blok with selesai, session ditutup dan objek menjadi detached sehingga tidak bisa memuat apa pun. Solusi: muat relasi selagi session terbuka dengan `options(selectinload(Akun.transaksi))`, perluas cakupan session agar mencakup seluruh unit kerja, atau ubah hasil menjadi DTO/dict sebelum session ditutup. Opsi `lazy="raise"` pada relationship membantu menemukan akses tak sengaja seperti ini lebih awal.'],
        ['PYF-26', 'Developer mengganti nama atribut `catatan` menjadi `keterangan` di model lalu menjalankan `alembic revision --autogenerate`. Apa risikonya?', 'Autogenerate tidak tahu bahwa ini rename; ia menghasilkan `drop_column("catatan")` dan `add_column("keterangan")`. Bila dijalankan apa adanya, seluruh isi kolom catatan hilang. Edit migrasi menjadi `batch_op.alter_column("catatan", new_column_name="keterangan")` (dan sebaliknya di downgrade), lalu uji di salinan database.'],
        ['PYF-27', 'Apa beda `session.flush()` dan `session.commit()`?', '`flush` mengirim perubahan yang tertunda (INSERT/UPDATE/DELETE) ke database di dalam transaksi yang sedang berjalan, misalnya agar id hasil autoincrement tersedia, tetapi belum permanen dan masih bisa di-rollback. `commit` melakukan flush lalu mengakhiri transaksi sehingga perubahan permanen dan terlihat oleh koneksi lain. Session melakukan autoflush sebelum query secara default.'],
      ]),
      ...practice('pyf-sqlalchemy', [
        'Proyek `kas-db` dengan model Akun/Transaksi, migrasi awal dari Alembic (bukan `create_all`), dan `alembic upgrade head` berjalan di database kosong.',
        'Skrip impor yang membaca CSV 100.000 baris dan menyisipkan dengan `insert()` per batch 5.000 baris dalam transaksi; bandingkan waktunya dengan `session.add()` satu per satu.',
        'Laporan total per kategori per bulan dengan `select()` + `group_by`; nyalakan `echo=True` dan buktikan tidak ada N+1 pada laporan per akun.',
        'Tulis migrasi kedua yang menambah kolom NOT NULL ke tabel berisi data (tiga langkah), lalu uji `upgrade head`, `downgrade -1`, dan `upgrade head` lagi; tambahkan `alembic check` di CI.',
      ]),
      references(
        ['SQLAlchemy Unified Tutorial', 'https://docs.sqlalchemy.org/en/20/tutorial/index.html'],
        ['ORM Quick Start', 'https://docs.sqlalchemy.org/en/20/orm/quickstart.html'],
        ['Session Basics', 'https://docs.sqlalchemy.org/en/20/orm/session_basics.html'],
        ['Relationship Loading Techniques', 'https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html'],
        ['Alembic Tutorial', 'https://alembic.sqlalchemy.org/en/latest/tutorial.html'],
        ['Alembic: Auto Generating Migrations', 'https://alembic.sqlalchemy.org/en/latest/autogenerate.html'],
        ['Alembic: Running Batch Migrations for SQLite', 'https://alembic.sqlalchemy.org/en/latest/batch.html'],
      ),
    ],
  },
];
