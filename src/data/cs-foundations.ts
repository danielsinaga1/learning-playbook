import type { Block, Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const FOUNDATION = 'Fondasi Pemrograman & Ilmu Komputer';

export const csFoundationTracks: Track[] = [
  { title: FOUNDATION, summary: 'Konsep lintas bahasa yang dipakai setiap hari: logika & algoritma, cara komputer menjalankan program, sistem operasi, jaringan, clean code, dan prinsip desain SOLID.' },
];

export const csFoundationSource = 'Fondasi Pemrograman & Ilmu Komputer: materi tulisan tangan dari dokumentasi resmi Python, Java, MDN, RFC, man-pages Linux, dan katalog refactoring (2 November 2026)';

/** Satu blok kode per tab, untuk contoh yang sama dalam beberapa bahasa. */
const tabs = (...items: [label: string, block: Block][]): Block => ({
  type: 'tabs', tabs: items.map(([label, block]) => ({ label, blocks: [block] })),
});
const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });

export const csFoundationModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── 1. Logika Pemrograman ─────────────────────────────
  {
    id: 'cs-logika-pemrograman',
    title: 'Logika Pemrograman: Algoritma, Pseudocode & Tracing',
    summary: 'Memecah masalah sebelum menulis kode: algoritma, pseudocode, flowchart, dekomposisi, dan tracing variabel dengan contoh FizzBuzz, cari maksimum, dan validasi input.',
    track: FOUNDATION, source: csFoundationSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('Pemula sering langsung membuka editor lalu bingung harus mengetik apa. Masalahnya jarang di sintaks; masalahnya belum ada **algoritma**: urutan langkah yang jelas, terbatas, dan pasti berakhir untuk mengubah input menjadi output. Bahasa pemrograman hanyalah cara menuliskan algoritma itu agar bisa dijalankan komputer. Kalau langkahnya sudah benar di kertas, menerjemahkannya ke Python, Java, atau Go tinggal soal sintaks.'),
      paragraph('Alur kerja yang disarankan untuk setiap soal: (1) tulis contoh **input dan output** yang diharapkan, termasuk kasus aneh; (2) **dekomposisi** masalah menjadi sub-masalah kecil; (3) tulis **pseudocode**; (4) **tracing** dengan tangan memakai contoh tadi; (5) baru tulis kode dan ujikan contoh yang sama.'),
      heading('Dekomposisi: memecah masalah besar'),
      list([
        '**Masalah**: "Hitung total belanja dengan diskon member 10% dan potongan Rp20.000 bila belanja di atas Rp500.000."',
        '**Sub-masalah 1**: hitung subtotal = jumlah (harga × qty) semua item.',
        '**Sub-masalah 2**: bila pelanggan member, kurangi 10% dari subtotal.',
        '**Sub-masalah 3**: bila hasilnya di atas 500.000, kurangi 20.000.',
        '**Sub-masalah 4**: tangani kasus tepi: keranjang kosong, qty negatif, harga nol.',
        'Setiap sub-masalah biasanya menjadi **satu fungsi** yang bisa dites sendiri.',
      ]),
      code('Pseudocode: cari nilai maksimum', `FUNGSI cariMaksimum(daftar)
    JIKA daftar kosong MAKA
        KEMBALIKAN error "daftar kosong"
    maks <- daftar[0]                 // anggap elemen pertama terbesar dulu
    UNTUK i DARI 1 SAMPAI panjang(daftar) - 1
        JIKA daftar[i] > maks MAKA
            maks <- daftar[i]
    KEMBALIKAN maks`, 'text'),
      code('Flowchart dalam bentuk teks', `        ( Mulai )
            |
     [/ baca daftar /]
            |
     < daftar kosong? > --ya--> [/ tampilkan error /] --> ( Selesai )
            | tidak
  [ maks <- daftar[0] ; i <- 1 ]
            |
  +--> < i < panjang? > --tidak--> [/ tampilkan maks /] --> ( Selesai )
  |         | ya
  |  < daftar[i] > maks? > --ya--> [ maks <- daftar[i] ]
  |         | tidak                        |
  |         v                              |
  +--- [ i <- i + 1 ] <--------------------+`, 'text'),
      table(['Simbol', 'Bentuk di teks', 'Arti'], [
        ['Terminator', '`( Mulai )`', 'Awal atau akhir algoritma'],
        ['Proses', '`[ maks <- x ]`', 'Perhitungan atau assignment'],
        ['Input/Output', '`[/ baca /]`', 'Membaca input atau menampilkan hasil'],
        ['Keputusan', '`< x > maks? >`', 'Percabangan ya/tidak (`if`)'],
        ['Panah balik', '`+--->`', 'Perulangan (`for`/`while`)'],
      ]),
      heading('Tracing: jalankan algoritma di kepala'),
      paragraph('Tracing berarti mencatat nilai setiap variabel di setiap langkah, seperti debugger manual. Ini cara paling ampuh menemukan bug logika *sebelum* kode ditulis, dan kemampuan yang diuji di interview whiteboard. Contoh: `cariMaksimum([3, 8, 2, 8, 5])`, dimulai dengan `maks = 3`.'),
      table(['i', 'daftar[i]', 'daftar[i] > maks?', 'maks setelahnya'], [
        ['1', '8', 'ya (8 > 3)', '8'],
        ['2', '2', 'tidak', '8'],
        ['3', '8', 'tidak (8 > 8 salah)', '8'],
        ['4', '5', 'tidak', '8'],
        ['selesai', '-', '-', '**8**'],
      ]),
      tabs(
        ['Python', code('FizzBuzz & cari maksimum', `def fizzbuzz(n: int) -> list[str]:
    hasil = []
    for i in range(1, n + 1):
        if i % 15 == 0:          # cek kelipatan 3 DAN 5 lebih dulu
            hasil.append("FizzBuzz")
        elif i % 3 == 0:
            hasil.append("Fizz")
        elif i % 5 == 0:
            hasil.append("Buzz")
        else:
            hasil.append(str(i))
    return hasil


def cari_maksimum(daftar: list[int]) -> int:
    if not daftar:
        raise ValueError("daftar kosong")
    maks = daftar[0]
    for x in daftar[1:]:
        if x > maks:
            maks = x
    return maks


print(fizzbuzz(15))                    # [..., '13', '14', 'FizzBuzz']
print(cari_maksimum([3, 8, 2, 8, 5]))  # 8  (di produksi cukup pakai max())`, 'python')],
        ['Java', code('FizzBuzz & cari maksimum', `import java.util.ArrayList;
import java.util.List;

public class Logika {
    static List<String> fizzbuzz(int n) {
        List<String> hasil = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) hasil.add("FizzBuzz");     // urutan cabang penting
            else if (i % 3 == 0) hasil.add("Fizz");
            else if (i % 5 == 0) hasil.add("Buzz");
            else hasil.add(String.valueOf(i));
        }
        return hasil;
    }

    static int cariMaksimum(int[] daftar) {
        if (daftar.length == 0) throw new IllegalArgumentException("daftar kosong");
        int maks = daftar[0];
        for (int i = 1; i < daftar.length; i++) {
            if (daftar[i] > maks) maks = daftar[i];
        }
        return maks;
    }

    public static void main(String[] args) {
        System.out.println(fizzbuzz(15));
        System.out.println(cariMaksimum(new int[] {3, 8, 2, 8, 5}));   // 8
    }
}`, 'java')],
      ),
      tabs(
        ['Python', code('Validasi input: ulangi sampai valid', `def baca_umur() -> int:
    while True:
        teks = input("Umur: ").strip()
        try:
            umur = int(teks)             # "abc" atau "" -> ValueError
        except ValueError:
            print("Masukkan angka bulat.")
            continue
        if not 1 <= umur <= 120:         # "-5" dan "999" lolos int(), tapi tidak masuk akal
            print("Umur harus 1 sampai 120.")
            continue
        return umur`, 'python')],
        ['Java', code('Validasi input: ulangi sampai valid', `import java.util.Scanner;

public class BacaUmur {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (true) {
            System.out.print("Umur: ");
            String teks = in.nextLine().trim();
            int umur;
            try {
                umur = Integer.parseInt(teks);          // "abc" -> NumberFormatException
            } catch (NumberFormatException e) {
                System.out.println("Masukkan angka bulat.");
                continue;
            }
            if (umur < 1 || umur > 120) {
                System.out.println("Umur harus 1 sampai 120.");
                continue;
            }
            System.out.println("Umur valid: " + umur);
            break;
        }
    }
}`, 'java')],
      ),
      callout('tip', 'Selalu pikirkan kasus tepi', 'Sebelum menulis kode, tanyakan: bagaimana kalau input **kosong**, **satu elemen**, **semua sama**, **negatif**, **sangat besar**, atau **bukan angka**? Sebagian besar bug pemula ada di sini, bukan di kasus normal. Tuliskan kasus-kasus itu sebagai contoh input/output dan jadikan unit test (lihat [Unit Testing](#testing.unit-testing)).'),
      ...quiz([
        ['CS-01', 'Pada FizzBuzz, apa yang salah bila pengecekan `i % 3 == 0` ditulis sebelum `i % 15 == 0`?', 'Angka 15, 30, 45 juga habis dibagi 3, sehingga cabang "Fizz" terpenuhi lebih dulu dan cabang "FizzBuzz" tidak pernah tercapai karena `elif`/`else if` berhenti di cabang pertama yang benar. Kondisi yang lebih spesifik harus dicek lebih dulu. Tracing dengan i = 15 langsung memperlihatkan bug ini.'],
        ['CS-02', 'Mengapa `maks` diinisialisasi dengan `daftar[0]`, bukan `0`?', 'Bila semua elemen negatif, misalnya `[-7, -3, -9]`, inisialisasi `0` menghasilkan 0 yang bahkan tidak ada di daftar. Memakai elemen pertama menjamin jawaban selalu salah satu elemen. Konsekuensinya, daftar kosong harus ditangani terpisah sebelum mengakses `daftar[0]`.'],
        ['CS-03', 'Apa bedanya validasi "format" dan validasi "aturan bisnis" pada contoh umur?', 'Validasi format memastikan teks bisa diubah menjadi tipe yang benar (`int(teks)` berhasil). Validasi aturan bisnis memastikan nilainya masuk akal untuk domain (1 sampai 120). Input `"-5"` lolos validasi format tetapi gagal aturan bisnis, jadi keduanya diperlukan.'],
      ]),
      ...practice('cs-fondasi-logika', [
        'Tulis pseudocode dan flowchart teks untuk "cari nilai minimum dan posisinya", lalu tracing dengan input `[4, 1, 7, 1]` dan tentukan posisi mana yang dikembalikan.',
        'Implementasikan FizzBuzz di Python dan Java, lalu ubah aturannya (kelipatan 7 = "Bazz") tanpa merusak aturan lama.',
        'Dekomposisi soal "hitung nilai akhir mahasiswa (tugas 30%, UTS 30%, UAS 40%) lalu konversi ke huruf A sampai E" menjadi minimal tiga fungsi, masing-masing dengan tiga contoh input/output.',
        'Buat program validasi nomor HP Indonesia (diawali 08 atau +628, 10 sampai 13 digit) yang meminta ulang sampai input valid.',
      ]),
      references(
        ['CS50x: Introduction to Computer Science (Harvard)', 'https://cs50.harvard.edu/x/'],
        ['The Python Tutorial', 'https://docs.python.org/3/tutorial/'],
        ['Think Python, 3rd edition (gratis)', 'https://allendowney.github.io/ThinkPython/'],
        ['dev.java: Learn Java', 'https://dev.java/learn/'],
      ),
    ],
  },

  // ───────────────────────────── 2. Cara Komputer Menjalankan Program ─────────────────────────────
  {
    id: 'cs-cara-komputer-bekerja',
    title: 'Cara Komputer Menjalankan Program',
    summary: 'Biner dan representasi data (integer overflow, 0.1 + 0.2, UTF-8), compiler vs interpreter vs JIT, stack vs heap, dan apa yang dimaksud dengan runtime.',
    track: FOUNDATION, source: csFoundationSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Komputer hanya mengenal **bit** (0 dan 1). Angka, teks, gambar, dan instruksi program semuanya disimpan sebagai deretan bit dengan *aturan penafsiran* tertentu. Kebanyakan waktu kamu tidak perlu memikirkannya, sampai muncul bug aneh: saldo tiba-tiba negatif, `0.1 + 0.2` tidak sama dengan `0.3`, nama pelanggan berubah menjadi `Ã©`, atau aplikasi mati karena `StackOverflowError`. Modul ini menjelaskan asal-usul bug semacam itu.'),
      table(['Konsep', 'Penjelasan singkat', 'Contoh'], [
        ['Bit & byte', '1 byte = 8 bit, bisa menyimpan 256 nilai berbeda (0 sampai 255)', '`0100 0001` = 65 = huruf `A` di ASCII'],
        ['Biner', 'Basis 2: tiap posisi bernilai pangkat 2', '`1101` = 8 + 4 + 0 + 1 = 13'],
        ['Heksadesimal', 'Basis 16, 1 digit = 4 bit; ringkas untuk menulis byte', '`0xFF` = 255, warna `#1E90FF`'],
        ['Integer bertanda', 'Ukuran tetap, two\'s complement', 'Java `int` 32-bit: -2.147.483.648 sampai 2.147.483.647'],
        ['Floating point', 'IEEE 754: tanda, eksponen, mantissa (pecahan biner)', '`double` 64-bit: ~15 sampai 17 digit desimal signifikan'],
      ]),
      heading('Integer overflow'),
      paragraph('Integer berukuran tetap punya batas. Saat melewati batas, Java (dan C, Go, Rust mode release) **membungkus** nilainya ke sisi negatif tanpa error. Python memakai integer berpresisi tak terbatas sehingga tidak overflow, sedangkan JavaScript menyimpan semua angka sebagai `double` sehingga integer di atas 2^53 kehilangan presisi.'),
      tabs(
        ['Java', code('Overflow diam-diam dan cara mendeteksinya', `int saldo = Integer.MAX_VALUE;           // 2147483647 (2^31 - 1)
saldo = saldo + 1;
System.out.println(saldo);               // -2147483648  <- wrap around, tanpa exception

long aman = Integer.MAX_VALUE + 1L;      // 2147483648: operan long -> aritmetika 64-bit
long salah = Integer.MAX_VALUE + 1;      // -2147483648: dihitung sebagai int DULU, baru dilebarkan

Math.addExact(Integer.MAX_VALUE, 1);     // ArithmeticException: integer overflow`, 'java')],
        ['Python', code('int tak terbatas, tapi library numerik tidak', `saldo = 2**31 - 1
print(saldo + 1)        # 2147483648  -> int Python tumbuh sesuai kebutuhan
print(2**100)           # 1267650600228229401496703205376

import numpy as np      # NumPy/Pandas memakai integer berukuran tetap seperti Java
a = np.array([2**31 - 1], dtype=np.int32)
print(a + 1)            # [-2147483648]  -> overflow diam-diam`, 'python')],
        ['JavaScript', code('Number adalah double: aman sampai 2^53 - 1', `console.log(Number.MAX_SAFE_INTEGER);          // 9007199254740991
console.log(9007199254740992 + 1);             // 9007199254740992  <- presisi hilang, tanpa error
console.log(9007199254740992n + 1n);           // 9007199254740993n -> BigInt

// Jebakan nyata: ID 64-bit dari backend rusak saat di-parse sebagai Number
JSON.parse('{"id": 1234567890123456789}').id;  // 1234567890123456800
// Solusi: kirim ID besar sebagai string di JSON`, 'js')],
      ),
      heading('Floating point: kenapa 0.1 + 0.2 ≠ 0.3'),
      paragraph('`0.1` dalam biner adalah pecahan berulang tak berhingga (seperti 1/3 = 0,333... dalam desimal). `double` hanya menyimpan 53 bit mantissa, jadi yang tersimpan adalah angka **terdekat** dengan 0.1, bukan 0.1 persis. Ini bukan bug bahasa; Python, Java, JavaScript, Go, dan C# memberi hasil yang sama karena semuanya memakai standar IEEE 754.'),
      tabs(
        ['Python', code('Bandingkan dengan toleransi; uang pakai Decimal', `print(0.1 + 0.2)                 # 0.30000000000000004
print(0.1 + 0.2 == 0.3)          # False

import math
print(math.isclose(0.1 + 0.2, 0.3))      # True -> bandingkan dengan toleransi

from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))   # 0.3  -> buat dari STRING
print(Decimal(0.1))   # 0.1000000000000000055511151231257827021181583404541015625`, 'python')],
        ['Java', code('BigDecimal atau satuan terkecil', `System.out.println(0.1 + 0.2);    // 0.30000000000000004

BigDecimal a = new BigDecimal("0.1");          // dari String: tepat 0.1
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));                   // 0.3
System.out.println(new BigDecimal(0.1));        // 0.1000000000000000055511151231257827021181583404541015625

long hargaSen = 1_999;      // alternatif umum: simpan uang sebagai integer satuan terkecil (sen/rupiah)`, 'java')],
      ),
      heading('Teks dan encoding UTF-8'),
      paragraph('Teks disimpan sebagai **code point** Unicode (misalnya `U+00E9` untuk é), lalu di-*encode* menjadi byte. **UTF-8** adalah encoding standar web: 1 byte untuk ASCII, 2 sampai 4 byte untuk karakter lain. Bug klasik *mojibake* (`é` tampil sebagai `Ã©`) terjadi saat byte UTF-8 dibaca dengan encoding lain seperti Latin-1. Perhatikan juga bahwa "panjang string" berbeda arti di tiap bahasa.'),
      tabs(
        ['Python', code('Karakter vs byte', `for s in ["A", "é", "€", "😀"]:
    b = s.encode("utf-8")
    print(s, len(s), len(b), b.hex(" "))
# A  1 1 41
# é  1 2 c3 a9
# €  1 3 e2 82 ac
# 😀 1 4 f0 9f 98 80

print("é".encode("utf-8").decode("latin-1"))   # Ã©  <- mojibake
open("data.csv", encoding="utf-8")             # selalu sebutkan encoding saat membuka file`, 'python')],
        ['Java', code('String Java = UTF-16', `String s = "😀";
System.out.println(s.length());                                 // 2  -> jumlah char UTF-16
System.out.println(s.codePointCount(0, s.length()));            // 1  -> jumlah karakter Unicode
System.out.println(s.getBytes(StandardCharsets.UTF_8).length);  // 4  -> jumlah byte UTF-8

// Selalu sebutkan charset saat konversi byte <-> String
String teks = new String(bytes, StandardCharsets.UTF_8);
// Sejak JDK 18 (JEP 400) charset default adalah UTF-8, tetapi eksplisit tetap lebih aman`, 'java')],
      ),
      heading('Compiler, interpreter, dan JIT'),
      code('Perjalanan kode sampai dieksekusi CPU', `C / Go / Rust    : source --compiler--> machine code native ------------------------> CPU
Java / Kotlin    : source --javac-----> bytecode .class --> JVM: interpreter + JIT (C1/C2) --> CPU
C#               : source --Roslyn----> IL --------------> CLR: JIT (opsi Native AOT)  --> CPU
Python (CPython) : source --otomatis--> bytecode .pyc ---> interpreter CPython        --> CPU
JavaScript (V8)  : source --parser----> bytecode --------> interpreter + JIT bertingkat --> CPU`, 'text'),
      table(['Model', 'Kelebihan', 'Kekurangan', 'Contoh'], [
        ['Ahead-of-time (AOT) compiler', 'Start cepat, binary mandiri, error tipe ketahuan saat build', 'Build per OS/arsitektur', 'C, Go, Rust, GraalVM Native Image'],
        ['Interpreter', 'Langsung jalan, interaktif (REPL)', 'Eksekusi lebih lambat', 'CPython, Ruby (MRI), shell'],
        ['Bytecode + JIT', 'Portabel; kode "panas" dikompilasi ke native saat runtime dengan info profil nyata', 'Butuh *warm-up*, memori lebih besar', 'JVM, .NET CLR, V8 (Node.js)'],
      ]),
      callout('info', 'Bahasa tidak sama dengan implementasi', '"Python itu interpreted" sebenarnya tentang **CPython**: kode dikompilasi otomatis ke bytecode lalu diinterpretasi. PyPy memakai JIT, dan CPython 3.13+ punya JIT eksperimental. Begitu juga Java bisa dikompilasi AOT dengan GraalVM. Detail JVM ada di [JDK, JRE, JVM & JIT](#java.jdk-jre-jvm-jit-60-days-of-java-day-2).'),
      heading('Stack vs heap'),
      paragraph('Memori program dibagi menjadi beberapa area. **Stack** menyimpan *frame* untuk setiap pemanggilan fungsi (parameter, variabel lokal, alamat kembali); cepat, otomatis dibuang saat fungsi selesai, tetapi ukurannya kecil. **Heap** menyimpan objek yang umurnya tidak terikat satu fungsi; ukurannya besar dan dibersihkan oleh *garbage collector* (Java, Python, Go, JS) atau manual (C) atau lewat ownership (Rust).'),
      tabs(
        ['Java', code('Variabel lokal di stack, objek di heap', `public class Demo {
    static int kuadrat(int n) {        // pemanggilan -> frame baru di stack berisi n
        int hasil = n * n;             // primitif lokal: di frame stack
        return hasil;                  // frame dibuang saat method selesai
    }

    public static void main(String[] args) {
        int x = 4;                                    // stack
        int[] data = new int[1_000];                  // referensi di stack, array di heap
        StringBuilder sb = new StringBuilder("hai");  // objek di heap, dibersihkan GC bila tak dirujuk
        System.out.println(kuadrat(x));
    }

    static int tanpaBaseCase(int n) { return tanpaBaseCase(n + 1); }  // frame menumpuk -> StackOverflowError
}`, 'java')],
        ['Python', code('Nama hanyalah referensi ke objek di heap', `a = [1, 2, 3]     # objek list di heap; nama a menunjuk ke sana
b = a             # b menunjuk objek yang SAMA, bukan salinan
b.append(4)
print(a)          # [1, 2, 3, 4]
c = a.copy()      # salinan baru (shallow copy)

def hitung(n):
    return hitung(n + 1)     # tanpa base case

hitung(0)   # RecursionError: maximum recursion depth exceeded (batas default 1000 frame)`, 'python')],
      ),
      table(['Runtime', 'Yang disediakan', 'Dampak bagi developer'], [
        ['JVM', 'Class loading, JIT, GC, thread, keamanan memori', 'Atur heap (`-Xmx`), pilih GC, waktu warm-up'],
        ['CPython', 'Interpreter bytecode, reference counting + GC siklus, GIL', 'Thread tidak mempercepat kode CPU-bound (kecuali build free-threaded)'],
        ['Node.js', 'V8 + event loop libuv + API I/O', 'Jangan blokir event loop dengan komputasi berat'],
        ['Go runtime', 'Scheduler goroutine, GC; dibundel ke dalam binary', 'Binary mandiri, tanpa install runtime terpisah'],
      ]),
      paragraph('**Runtime** adalah lapisan perangkat lunak yang menemani program saat berjalan: memuat kode, mengelola memori, menjadwalkan thread atau event, dan menyediakan pustaka standar. Saat orang bilang "butuh Java 21" atau "Node 22", yang dimaksud adalah versi runtime yang harus terpasang di server atau image Docker.'),
      ...quiz([
        ['CS-04', 'Sistem kasir menjumlahkan harga `double` dan laporan akhir hari selisih Rp0,01 dari perhitungan manual. Apa penyebab dan perbaikannya?', 'Nilai desimal seperti 0.1 tidak bisa direpresentasikan tepat dalam floating point biner, sehingga penjumlahan berulang menumpuk galat kecil. Untuk uang gunakan `BigDecimal` (Java, dibuat dari String), `Decimal` (Python, dibuat dari string), atau simpan sebagai integer satuan terkecil, lalu tentukan aturan pembulatan secara eksplisit.'],
        ['CS-05', 'Validasi "nama maksimal 10 karakter" di Java memakai `nama.length()`, tetapi nama berisi emoji ditolak padahal terlihat pendek. Mengapa?', '`String.length()` di Java menghitung *char* UTF-16, bukan karakter. Emoji di luar Basic Multilingual Plane memakai dua char (surrogate pair), jadi satu emoji dihitung 2. Gunakan `codePointCount` bila yang dimaksud jumlah karakter Unicode. Kolom database juga perlu dicek: batasnya dalam karakter atau byte.'],
        ['CS-06', 'Mengapa rekursi yang terlalu dalam menyebabkan `StackOverflowError` walau heap masih lega?', 'Setiap pemanggilan fungsi menambah satu frame di stack thread, dan ukuran stack jauh lebih kecil daripada heap (di JVM umumnya sekitar 512 KB sampai 1 MB per thread, diatur dengan `-Xss`). Rekursi tanpa base case atau terlalu dalam menghabiskan stack sebelum heap terpakai. Solusinya perbaiki base case atau ubah menjadi iterasi.'],
      ]),
      ...practice('cs-fondasi-komputer', [
        'Konversi manual 45, 255, dan 1024 ke biner dan heksadesimal, lalu cek dengan `bin()`/`hex()` di Python atau `Integer.toBinaryString` di Java.',
        'Tulis fungsi penjumlahan saldo di Java yang melempar exception saat overflow memakai `Math.addExact`, beserta test untuk kasus batas.',
        'Jumlahkan 0.1 sebanyak 10 kali dengan `double`/`float` dan dengan `BigDecimal`/`Decimal`; tampilkan dan jelaskan perbedaannya.',
        'Cetak jumlah karakter dan jumlah byte UTF-8 untuk "Bandung", "Café", dan "Halo 👋" di Python dan Java, lalu jelaskan selisihnya.',
      ]),
      references(
        ['Python Tutorial: Floating-Point Arithmetic', 'https://docs.python.org/3/tutorial/floatingpoint.html'],
        ['The Floating-Point Guide', 'https://floating-point-gui.de/'],
        ['JLS §4.2: Primitive Types and Values', 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.2'],
        ['MDN: Number.MAX_SAFE_INTEGER', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER'],
        ['RFC 3629: UTF-8', 'https://www.rfc-editor.org/rfc/rfc3629'],
        ['JEP 400: UTF-8 by Default', 'https://openjdk.org/jeps/400'],
      ),
    ],
  },

  // ───────────────────────────── 3. Sistem Operasi ─────────────────────────────
  {
    id: 'cs-sistem-operasi',
    title: 'Sistem Operasi untuk Developer',
    summary: 'Proses vs thread, scheduling, virtual memory, file descriptor, sinyal, dan environment variable, plus cara memakainya saat debugging server dan container.',
    track: FOUNDATION, source: csFoundationSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Banyak insiden produksi sebenarnya adalah pesan dari sistem operasi: `Too many open files`, container mati dengan exit code 137, deploy yang memutus request di tengah jalan, atau aplikasi yang "tidak membaca" environment variable baru. Kamu tidak perlu menulis kernel, tetapi perlu tahu konsep yang ada di balik pesan-pesan itu. Perintah dasar (`ps`, `kill`, `lsof`) dibahas di [Shell: Proses, Port, curl & SSH](#tools.sh-proses-jaringan-ssh); modul ini menjelaskan *mengapa*-nya.'),
      heading('Proses vs thread'),
      paragraph('**Proses** adalah program yang sedang berjalan dengan ruang memori, file descriptor, dan environment sendiri. **Thread** adalah alur eksekusi di dalam proses; semua thread dalam satu proses berbagi memori yang sama. Satu JVM atau satu proses Node.js adalah satu proses dengan banyak thread.'),
      table(['Aspek', 'Proses', 'Thread'], [
        ['Memori', 'Terpisah (diisolasi OS)', 'Berbagi heap dengan thread lain di proses yang sama'],
        ['Bila crash', 'Proses lain aman', 'Bisa menjatuhkan seluruh proses'],
        ['Biaya membuat', 'Lebih mahal', 'Lebih murah (virtual thread/goroutine jauh lebih murah lagi)'],
        ['Komunikasi', 'IPC: pipe, socket, shared memory, file', 'Variabel bersama, perlu lock agar tidak *race condition*'],
        ['Contoh', 'Worker Gunicorn, PHP-FPM, `multiprocessing`', 'Thread pool Tomcat, `ExecutorService`, `threading`'],
      ]),
      callout('info', 'Python dan GIL', 'Di CPython standar, **Global Interpreter Lock** membuat hanya satu thread yang mengeksekusi bytecode Python pada satu waktu. Thread tetap berguna untuk pekerjaan I/O-bound (menunggu HTTP atau database), tetapi pekerjaan CPU-bound perlu `multiprocessing`/`ProcessPoolExecutor`, atau build *free-threaded* yang tersedia secara opsional sejak Python 3.13.'),
      heading('Scheduling dan status proses'),
      paragraph('CPU dengan 4 core hanya bisa menjalankan 4 thread secara bersamaan. Scheduler OS bergantian memberi jatah waktu (*time slice*) ke ribuan thread dan melakukan *context switch* di antaranya. Thread yang menunggu I/O tidak memakai CPU; thread yang menghitung terus-menerus (CPU-bound) bersaing memperebutkan core.'),
      table(['STAT di `ps`', 'Arti', 'Yang biasanya terjadi'], [
        ['`R`', 'Running/runnable', 'Sedang memakai CPU atau antre core'],
        ['`S`', 'Sleeping (interruptible)', 'Menunggu I/O, timer, atau lock; normal untuk server idle'],
        ['`D`', 'Uninterruptible sleep', 'Menunggu disk/NFS; banyak `D` = masalah storage'],
        ['`Z`', 'Zombie', 'Sudah selesai, tetapi parent belum membaca exit status-nya'],
        ['`T`', 'Stopped', 'Dijeda (Ctrl+Z atau debugger)'],
      ]),
      code('Melihat beban CPU dan thread', `nproc                                  # jumlah core
uptime                                 # load average 1, 5, 15 menit; bandingkan dengan nproc
ps -o pid,stat,nlwp,pcpu,rss,cmd -p 12345   # nlwp = jumlah thread, rss = memori fisik (KB)
top -H -p 12345                        # tampilkan per thread: thread mana yang memakan CPU?
jstack 12345 | less                    # Java: stack trace semua thread (cari BLOCKED/deadlock)
py-spy dump --pid 12345                # Python: stack trace proses yang sedang berjalan (pip install py-spy)`, 'bash'),
      heading('Virtual memory'),
      paragraph('Setiap proses melihat ruang alamat virtualnya sendiri seolah-olah memiliki seluruh memori. OS memetakan halaman (*page*, biasanya 4 KB) virtual ke RAM fisik sesuai kebutuhan. Karena itu ada dua angka: **VSZ** (ruang alamat yang dipesan, sering sangat besar dan tidak berbahaya) dan **RSS** (memori fisik yang benar-benar dipakai). Bila RAM habis, Linux memakai swap atau menjalankan **OOM killer** yang membunuh proses dengan SIGKILL. Di container, batas memori diatur cgroup; melewatinya berarti dibunuh dengan exit code 137.'),
      code('Investigasi memori dan OOM', `free -h                                         # RAM total/terpakai/available
grep -E 'VmRSS|VmSize|Threads' /proc/12345/status
sudo dmesg -T | grep -i -E 'killed process|out of memory'   # jejak OOM killer
docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' api   # true 137
kubectl describe pod api-7d9f | grep -A3 'Last State'       # Reason: OOMKilled

# JVM sadar batas container; default heap maksimum umumnya hanya 25% memori container.
# Naikkan secara eksplisit dan sisakan ruang untuk metaspace, thread stack, dan buffer native:
java -XX:MaxRAMPercentage=75 -jar app.jar`, 'bash'),
      heading('File descriptor'),
      paragraph('Di Unix, hampir semua yang bisa dibaca/ditulis adalah **file descriptor** (fd): file, socket TCP, pipe, bahkan koneksi database. fd 0, 1, 2 adalah stdin, stdout, stderr. Setiap proses punya batas jumlah fd (`ulimit -n`, sering 1024 secara default di shell). Bila kode lupa menutup file atau koneksi, fd bocor sampai muncul `Too many open files` (EMFILE) dan server tidak bisa menerima koneksi baru.'),
      tabs(
        ['Java', code('try-with-resources mencegah kebocoran', `// Bocor: bila executeQuery melempar exception, koneksi tidak pernah kembali ke pool
Connection c = dataSource.getConnection();
PreparedStatement ps = c.prepareStatement(sql);
ResultSet rs = ps.executeQuery();
c.close();

// Aman: ditutup otomatis dalam urutan terbalik, walau terjadi exception
try (Connection c = dataSource.getConnection();
     PreparedStatement ps = c.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {
    while (rs.next()) { /* ... */ }
}`, 'java')],
        ['Python', code('with menutup resource secara deterministik', `# CPython sering menutup file saat objek dibuang, tetapi jangan bergantung pada itu
with open("laporan.csv", encoding="utf-8") as f:     # fd dilepas saat keluar blok
    baris = f.readlines()

import requests
with requests.Session() as s:                        # socket di pool ikut ditutup
    r = s.get("https://api.example.com/health", timeout=5)`, 'python')],
        ['Shell', code('Mengecek fd sebuah proses', `ulimit -n                                  # batas fd untuk shell ini
grep 'open files' /proc/12345/limits       # batas fd proses yang sedang berjalan
ls /proc/12345/fd | wc -l                  # jumlah fd yang sedang dibuka
lsof -p 12345 | awk '{print $5}' | sort | uniq -c | sort -rn   # per tipe: REG, IPv4, sock, FIFO`, 'bash')],
      ),
      heading('Sinyal dan graceful shutdown'),
      paragraph('Sinyal adalah notifikasi asinkron dari OS ke proses. Saat `docker stop`, `kubectl delete pod`, atau deploy baru, orkestrator mengirim **SIGTERM**, menunggu masa tenggang (default 10 detik di Docker, 30 detik di Kubernetes), lalu mengirim **SIGKILL**. Aplikasi yang baik menangkap SIGTERM untuk berhenti menerima request baru, menyelesaikan yang sedang berjalan, lalu menutup koneksi.'),
      tabs(
        ['Python', code('Menangkap SIGTERM', `import signal
import time

berjalan = True

def hentikan(signum, frame):
    global berjalan
    print(f"terima {signal.Signals(signum).name}, menyelesaikan job...", flush=True)
    berjalan = False

signal.signal(signal.SIGTERM, hentikan)   # docker stop / kubectl delete pod
signal.signal(signal.SIGINT, hentikan)    # Ctrl+C

while berjalan:
    proses_satu_job()                     # job yang sedang berjalan dibiarkan selesai
    time.sleep(1)

tutup_koneksi_db()`, 'python')],
        ['Java', code('Shutdown hook', `public class Worker {
    private static volatile boolean berjalan = true;

    public static void main(String[] args) throws InterruptedException {
        Thread utama = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {   // dijalankan saat SIGTERM/SIGINT
            berjalan = false;
            try { utama.join(10_000); } catch (InterruptedException ignored) { }  // tunggu loop selesai
        }));

        while (berjalan) {
            prosesSatuJob();
            Thread.sleep(1_000);
        }
        tutupKoneksiDb();
    }
}
// Spring Boot sudah menangani ini: graceful shutdown aktif secara default sejak Boot 3.4`, 'java')],
        ['Dockerfile', code('Pastikan aplikasi menerima sinyal', `# SALAH (shell form): PID 1 adalah /bin/sh -c, SIGTERM tidak diteruskan ke node
CMD node server.js

# BENAR (exec form): proses aplikasi menjadi PID 1 dan menerima SIGTERM langsung
CMD ["node", "server.js"]

# Catatan: PID 1 tidak punya perilaku default untuk SIGTERM. Bila aplikasi tidak memasang
# handler, ia tidak berhenti dan baru mati oleh SIGKILL. Pasang handler, atau jalankan
# container dengan init kecil: docker run --init ...  (tini)`, 'docker')],
      ),
      table(['Exit code', 'Arti umum'], [
        ['`0`', 'Sukses'],
        ['`1`', 'Error umum dari aplikasi (exception tidak tertangkap)'],
        ['`128 + n`', 'Dimatikan oleh sinyal nomor n'],
        ['`130`', 'SIGINT (Ctrl+C)'],
        ['`137`', 'SIGKILL: OOM killer atau masa tenggang shutdown habis'],
        ['`143`', 'SIGTERM yang tidak ditangani secara khusus'],
      ]),
      heading('Environment variable'),
      paragraph('Setiap proses membawa salinan environment yang **diwarisi dari parent saat proses dimulai**. Mengubah `.bashrc` atau file `.env` tidak memengaruhi proses yang sudah berjalan; proses harus di-restart. Konfigurasi yang berbeda per lingkungan (URL database, API key, level log) sebaiknya dibaca dari environment, bukan di-hardcode (prinsip [Twelve-Factor: Config](https://12factor.net/config)).'),
      tabs(
        ['Python', code('Membaca env: gagal cepat bila wajib', `import os

db_url = os.environ["DATABASE_URL"]            # KeyError saat start bila tidak di-set: gagal cepat
port = int(os.environ.get("PORT", "8080"))     # opsional dengan default untuk dev`, 'python')],
        ['Java', code('Membaca env', `String dbUrl = System.getenv("DATABASE_URL");  // null bila tidak ada
if (dbUrl == null) throw new IllegalStateException("DATABASE_URL wajib di-set");
int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));`, 'java')],
        ['Shell', code('Env per perintah dan env proses yang berjalan', `export APP_ENV=staging          # diwariskan ke proses anak yang dimulai SETELAH ini
APP_ENV=test ./run.sh           # hanya untuk satu perintah
tr '\\0' '\\n' < /proc/12345/environ   # env proses yang sedang berjalan (nilai saat start)
docker exec api env | sort      # env di dalam container`, 'bash')],
      ),
      callout('warn', 'Jangan cetak seluruh environment ke log', 'Environment sering berisi secret (password database, API key). Saat debugging, cetak hanya nama variabel atau nilai yang sudah disamarkan. Lihat juga [Rahasia & Supply Chain](#web.sec-secret-supply-chain).'),
      ...quiz([
        ['CS-07', 'Pod Kubernetes berulang kali restart dengan status `OOMKilled` dan exit code 137, padahal heap JVM dibatasi `-Xmx` sama dengan limit memori container. Apa yang salah?', 'Memori proses JVM bukan hanya heap: ada metaspace, code cache, stack setiap thread, buffer native, dan overhead GC. Bila `-Xmx` sama dengan limit container, total RSS pasti melebihi limit dan cgroup membunuh proses dengan SIGKILL (128 + 9 = 137). Sisakan ruang, misalnya `-XX:MaxRAMPercentage=75`, lalu pantau RSS sebenarnya.'],
        ['CS-08', 'Setelah berjalan beberapa jam, server mulai menolak koneksi dengan `Too many open files`. Bagaimana menyelidikinya?', 'Hitung fd proses dengan `ls /proc/PID/fd | wc -l` beberapa kali untuk melihat apakah terus naik, lalu lihat jenisnya dengan `lsof -p PID` (file, socket ke host tertentu). Biasanya ada kebocoran: file, response HTTP, atau koneksi database yang tidak ditutup. Perbaiki dengan try-with-resources/`with`. Menaikkan `ulimit -n` hanya menunda masalah bila memang bocor.'],
        ['CS-09', 'Mengapa deploy baru memutus request yang sedang berjalan, padahal aplikasi punya handler shutdown?', 'Kemungkinan besar sinyal tidak pernah sampai ke aplikasi. Dengan `CMD` shell form, PID 1 adalah `/bin/sh` yang tidak meneruskan SIGTERM, sehingga setelah masa tenggang container dibunuh SIGKILL. Gunakan exec form atau `--init`. Penyebab lain: masa tenggang lebih pendek daripada waktu menyelesaikan request, atau load balancer masih mengirim trafik ke pod yang sedang berhenti.'],
      ]),
      ...practice('cs-fondasi-os', [
        'Jalankan sebuah aplikasi Java atau Python, lalu temukan jumlah thread, RSS, dan jumlah fd-nya lewat `/proc/PID/` atau `ps`.',
        'Buat program kecil yang sengaja membuka file tanpa menutupnya dalam loop sampai muncul `Too many open files`, lalu perbaiki dengan try-with-resources/`with`.',
        'Tambahkan handler SIGTERM ke worker sederhana, jalankan di Docker, dan buktikan dengan `docker stop` bahwa job terakhir selesai sebelum proses keluar (bandingkan shell form vs exec form).',
        'Ubah satu konfigurasi hardcode di proyekmu menjadi environment variable yang wajib, dan pastikan aplikasi gagal start dengan pesan jelas bila variabel itu tidak ada.',
      ]),
      references(
        ['Operating Systems: Three Easy Pieces (gratis)', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'],
        ['signal(7): Linux manual page', 'https://man7.org/linux/man-pages/man7/signal.7.html'],
        ['proc(5): Linux manual page', 'https://man7.org/linux/man-pages/man5/proc.5.html'],
        ['Dockerfile reference: CMD', 'https://docs.docker.com/reference/dockerfile/#cmd'],
        ['Kubernetes: Pod termination', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination'],
        ['Python Glossary: global interpreter lock', 'https://docs.python.org/3/glossary.html#term-global-interpreter-lock'],
      ),
    ],
  },

  // ───────────────────────────── 4. Jaringan ─────────────────────────────
  {
    id: 'cs-jaringan-developer',
    title: 'Jaringan untuk Developer',
    summary: 'Model TCP/IP, TCP vs UDP, port & socket, ringkasan DNS dan TLS, latency vs bandwidth, membaca pesan error jaringan, serta alat debug ping, dig, nc, ss, dan curl -v.',
    track: FOUNDATION, source: csFoundationSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Setiap aplikasi backend adalah program jaringan: menerima request, memanggil database, cache, dan API lain. Saat sesuatu gagal, pesan error seperti `connection refused`, `timed out`, atau `name not resolved` masing-masing menunjuk ke lapisan yang berbeda. Modul ini memberi peta lapisannya dan cara menguji tiap lapisan. Alur lengkap dari URL sampai respons (DNS, TCP, TLS, `curl -w`) dibahas di [Cara Kerja Internet](#web.web-cara-kerja-internet), dan semantik HTTP di [HTTP Mendalam](#web.web-http-mendalam).'),
      table(['Lapisan TCP/IP', 'Tugas', 'Protokol/contoh', 'Alamat'], [
        ['Application', 'Format pesan aplikasi', 'HTTP, DNS, gRPC, SMTP, protokol PostgreSQL', 'URL, nama host'],
        ['Transport', 'Mengantar data antar-*proses*', 'TCP, UDP (QUIC berjalan di atas UDP)', 'Port'],
        ['Internet', 'Mengantar paket antar-*host* lintas jaringan', 'IPv4, IPv6, ICMP (ping)', 'Alamat IP'],
        ['Link', 'Mengirim frame di satu jaringan lokal', 'Ethernet, Wi-Fi', 'MAC address'],
      ]),
      table(['', 'TCP', 'UDP'], [
        ['Koneksi', 'Ada (three-way handshake)', 'Tidak ada, langsung kirim datagram'],
        ['Keandalan', 'Retransmisi otomatis, urutan dijamin', 'Paket bisa hilang, dobel, atau tidak berurutan'],
        ['Bentuk data', 'Aliran byte (*stream*), tanpa batas pesan', 'Datagram dengan batas pesan'],
        ['Kontrol aliran', 'Flow & congestion control', 'Tidak ada; aplikasi yang mengatur'],
        ['Dipakai untuk', 'HTTP/1.1, HTTP/2, database, SSH, SMTP', 'DNS, video call, game, metrik StatsD, QUIC/HTTP/3'],
      ]),
      callout('info', 'TCP adalah stream, bukan pesan', 'Satu `send()` 1.000 byte bisa diterima sebagai beberapa `recv()` kecil, dan dua `send()` bisa tiba dalam satu `recv()`. Protokol di atas TCP harus menandai batas pesan sendiri: baris baru, header `Content-Length`, atau prefiks panjang. Inilah alasan HTTP punya `Content-Length` dan chunked encoding.'),
      heading('Port dan socket'),
      paragraph('IP menunjuk host, **port** (0 sampai 65535) menunjuk proses di host itu. Sebuah koneksi TCP diidentifikasi oleh lima nilai: protokol, IP & port sumber, IP & port tujuan. Server memanggil `bind` + `listen` pada port tetap (misalnya 8080); klien mendapat **port ephemeral** acak dari OS (di Linux default 32768 sampai 60999). Setiap `accept()` menghasilkan socket baru untuk satu klien, sementara socket listening tetap menunggu klien berikutnya.'),
      tabs(
        ['Python', code('TCP echo server', `import socket

with socket.create_server(("0.0.0.0", 9000)) as srv:     # socket + bind + listen
    print("listen di :9000")
    while True:
        conn, addr = srv.accept()        # blok sampai ada klien; socket BARU per koneksi
        with conn:
            print("koneksi dari", addr)  # (IP klien, port ephemeral klien)
            while data := conn.recv(1024):     # b"" berarti klien menutup koneksi
                conn.sendall(data.upper())`, 'python')],
        ['Java', code('TCP echo server', `import java.io.*;
import java.net.*;

public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket server = new ServerSocket(9000)) {          // bind + listen di semua interface
            while (true) {
                try (Socket conn = server.accept();                 // socket baru per koneksi
                     var in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                     var out = new PrintWriter(conn.getOutputStream(), true)) {
                    System.out.println("koneksi dari " + conn.getRemoteSocketAddress());
                    String line;
                    while ((line = in.readLine()) != null) out.println(line.toUpperCase());
                }
            }
        }
    }
}`, 'java')],
      ),
      code('Mengamati socket dengan nc dan ss (Linux)', `$ nc localhost 9000                  # terminal 2: ketik teks, server membalas huruf besar
$ ss -tanp | grep 9000               # terminal 3
State   Recv-Q Send-Q  Local Address:Port   Peer Address:Port   Process
LISTEN  0      128           0.0.0.0:9000        0.0.0.0:*       users:(("python3",pid=4321,fd=3))
ESTAB   0      0           127.0.0.1:9000      127.0.0.1:51234   users:(("python3",pid=4321,fd=4))
ESTAB   0      0           127.0.0.1:51234     127.0.0.1:9000    users:(("nc",pid=4400,fd=3))

# Windows: netstat -ano | findstr :9000   atau   Get-NetTCPConnection -LocalPort 9000`, 'text'),
      table(['State `ss`', 'Arti', 'Tanda masalah bila jumlahnya besar'], [
        ['`LISTEN`', 'Menunggu koneksi masuk', 'Tidak ada = server belum jalan atau bind ke alamat lain'],
        ['`ESTAB`', 'Koneksi aktif', 'Ribuan ke satu host = pool tidak dibatasi atau koneksi tidak dipakai ulang'],
        ['`TIME_WAIT`', 'Sisi yang menutup duluan menunggu paket terlambat', 'Banyak = membuka koneksi baru per request; pakai keep-alive/pool'],
        ['`CLOSE_WAIT`', 'Peer sudah menutup, aplikasi kita belum `close()`', 'Hampir selalu bug kebocoran socket di kode kita'],
      ]),
      heading('DNS dan TLS dalam satu menit'),
      list([
        '**DNS** menerjemahkan nama ke IP. Urutan di server Linux: `/etc/hosts`, lalu resolver di `/etc/resolv.conf`. Di Docker Compose dan Kubernetes, nama service (`db`, `redis`) di-resolve oleh DNS internal. Jawaban di-cache selama TTL, jadi perubahan record tidak langsung terlihat.',
        '**TLS 1.3**: klien mengirim ClientHello (versi, cipher, key share, nama host via SNI, ALPN); server membalas ServerHello + key share, lalu sertifikat dan Finished yang sudah terenkripsi; klien memverifikasi rantai sertifikat ke CA tepercaya **dan** kecocokan nama host. Total 1 RTT sebelum data aplikasi.',
        'Rincian, contoh `dig +trace`, dan pembacaan output `curl -v` ada di [Cara Kerja Internet](#web.web-cara-kerja-internet).',
      ]),
      heading('Latency vs bandwidth'),
      table(['', 'Latency', 'Bandwidth'], [
        ['Arti', 'Waktu satu perjalanan bolak-balik (RTT)', 'Banyaknya data per detik'],
        ['Analogi', 'Panjang jalan tol', 'Jumlah lajur jalan tol'],
        ['Dominan saat', 'Banyak request kecil berurutan (API chatty, query N+1)', 'Transfer besar (backup, video, file upload)'],
        ['Cara memperbaiki', 'Kurangi jumlah round trip: batch, pool koneksi, cache, server dekat pengguna', 'Kompresi, ukuran payload lebih kecil, link lebih besar'],
      ]),
      paragraph('Contoh hitungan: 100 panggilan API **berurutan** ke region lain dengan RTT 80 ms butuh minimal 100 × 80 ms = **8 detik**, berapa pun bandwidth-nya. Satu panggilan batch hanya butuh sekitar 80 ms ditambah waktu transfer. Sebaliknya, file 100 MB lewat link 100 Mbps butuh sekitar 100 × 8 / 100 = **8 detik** walau latency-nya rendah.'),
      heading('Membaca error dan alat debug'),
      table(['Pesan error', 'Artinya', 'Cek'], [
        ['`Connection refused`', 'Host terjangkau, tetapi tidak ada proses yang listen di port itu (dibalas RST)', 'Service jalan? Port benar? Bind `127.0.0.1` vs `0.0.0.0`?'],
        ['`Connection timed out`', 'Paket tidak dibalas sama sekali', 'Firewall/security group, IP salah, routing, host mati'],
        ['`Name or service not known` / `ENOTFOUND`', 'DNS gagal me-resolve nama', '`dig`, typo nama host, DNS internal container'],
        ['`Connection reset by peer`', 'Sisi lain menutup paksa koneksi yang sedang berjalan', 'Crash di server, proxy timeout, batas ukuran request'],
        ['`certificate verify failed`', 'Sertifikat tidak tepercaya, kedaluwarsa, atau nama host tidak cocok', '`openssl s_client`, rantai intermediate, jam sistem'],
      ]),
      code('Urutan troubleshooting dari bawah ke atas', `dig +short api.internal                       # 1. DNS: nama -> IP? (kosong = masalah DNS)
ping -c 3 10.0.3.7                            # 2. Host terjangkau? (ICMP sering diblokir: gagal != pasti mati)
traceroute 10.0.3.7                           #    di mana paket berhenti? (Windows: tracert)
nc -vz 10.0.3.7 8080                          # 3. Port terbuka? refused vs timeout (PowerShell: Test-NetConnection)
ss -tlnp | grep 8080                          # 4. Di server: ada yang listen? di alamat mana?
openssl s_client -connect api.internal:443 -servername api.internal </dev/null   # 5. TLS valid?
curl -v https://api.internal/health           # 6. HTTP: status, header, redirect
sudo tcpdump -i any -nn port 8080             # 7. Masih aneh? lihat paket sebenarnya`, 'bash'),
      callout('tip', 'Uji dari tempat yang sama dengan aplikasimu', 'Bila aplikasi berjalan di container atau pod, jalankan perintah debug **dari dalam** container itu (`docker exec -it api sh`, `kubectl exec`, atau container debug sementara). Laptopmu bisa me-resolve dan menjangkau host yang tidak bisa dijangkau dari jaringan container, dan sebaliknya.'),
      ...quiz([
        ['CS-10', 'Aplikasi mendapat `Connection refused` saat menghubungi PostgreSQL, sedangkan aplikasi lain mendapat `Connection timed out`. Apa bedanya secara diagnosis?', '`Refused` berarti paket sampai ke host dan host membalas RST: tidak ada proses listen di port itu, atau database hanya bind ke `127.0.0.1`. Fokus di sisi server. `Timed out` berarti tidak ada balasan sama sekali: biasanya firewall/security group membuang paket, IP salah, atau host tidak terjangkau. Fokus di jalur jaringan.'],
        ['CS-11', 'Di server API, `ss -tan` menunjukkan ribuan koneksi `CLOSE_WAIT` ke layanan pembayaran. Apa artinya?', 'Layanan pembayaran sudah menutup koneksinya, tetapi aplikasi kita belum memanggil `close()` pada socket tersebut. Ini tanda kebocoran: response body HTTP yang tidak dibaca/ditutup atau klien yang dibuat per request tanpa ditutup. Lama-lama fd habis. Perbaiki penanganan resource di kode, bukan di konfigurasi kernel.'],
        ['CS-12', 'Mengapa DNS dan HTTP/3 memakai UDP, padahal UDP tidak andal?', 'DNS umumnya satu pertanyaan kecil dan satu jawaban; handshake TCP akan melipatgandakan latency, dan klien cukup mengulang bila tidak dijawab (DNS tetap memakai TCP untuk respons besar). HTTP/3 memakai QUIC di atas UDP agar keandalan, enkripsi, dan multiplexing diimplementasikan sendiri tanpa head-of-line blocking TCP, dan bisa diperbarui tanpa menunggu kernel.'],
      ]),
      ...practice('cs-fondasi-jaringan', [
        'Jalankan echo server di atas, hubungkan dua klien `nc` sekaligus, dan identifikasi port ephemeral masing-masing klien dari output `ss -tanp` atau `netstat`.',
        'Ubah server agar bind ke `127.0.0.1`, lalu coba hubungi dari container atau mesin lain; catat pesan error yang muncul dan jelaskan.',
        'Ukur RTT ke tiga host dengan `ping`, lalu hitung perkiraan waktu minimum untuk 50 request berurutan ke host terjauh.',
        'Buat catatan troubleshooting satu halaman untuk timmu: untuk setiap pesan error di tabel, tulis satu perintah pertama yang dijalankan.',
      ]),
      references(
        ['RFC 9293: Transmission Control Protocol', 'https://www.rfc-editor.org/rfc/rfc9293.html'],
        ['RFC 768: User Datagram Protocol', 'https://www.rfc-editor.org/rfc/rfc768.html'],
        ['RFC 9000: QUIC', 'https://www.rfc-editor.org/rfc/rfc9000.html'],
        ['Python: Socket Programming HOWTO', 'https://docs.python.org/3/howto/sockets.html'],
        ["Beej's Guide to Network Programming", 'https://beej.us/guide/bgnet/'],
        ['High Performance Browser Networking (Ilya Grigorik)', 'https://hpbn.co/'],
        ['ss(8): Linux manual page', 'https://man7.org/linux/man-pages/man8/ss.8.html'],
      ),
    ],
  },

  // ───────────────────────────── 5. Clean Code & Refactoring ─────────────────────────────
  {
    id: 'cs-clean-code-refactoring',
    title: 'Clean Code & Refactoring',
    summary: 'Penamaan, fungsi kecil, side effect, code smell, teknik refactoring (extract function, guard clause, replace conditional with polymorphism), contoh before/after, dan kapan tidak refactor.',
    track: FOUNDATION, source: csFoundationSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Kode dibaca jauh lebih sering daripada ditulis: oleh rekan tim saat review, oleh dirimu sendiri enam bulan lagi, dan oleh orang yang dibangunkan tengah malam karena insiden. **Clean code** berarti kode yang maksudnya mudah dipahami dan aman diubah. **Refactoring** adalah mengubah struktur kode **tanpa mengubah perilakunya**, dalam langkah-langkah kecil yang masing-masing dijaga oleh test. Tanpa test, itu bukan refactoring, melainkan menulis ulang sambil berharap.'),
      table(['Kurang jelas', 'Lebih jelas', 'Alasan'], [
        ['`d`, `tmp`, `data2`', '`pesanan`, `totalSetelahDiskon`', 'Nama menjelaskan isi, bukan tipe atau urutan'],
        ['`proses()`, `handle()`', '`hitungOngkir()`, `kirimEmailKonfirmasi()`', 'Fungsi = kata kerja + objek yang spesifik'],
        ['`flag`, `status = 2`', '`isMember`, `Status.DIBAYAR`', 'Boolean berawalan is/has/can; enum menggantikan angka ajaib'],
        ['`if (t > 500000)`', '`if (total > MIN_BELANJA_POTONGAN)`', 'Konstanta bernama menggantikan magic number'],
        ['`getUserData()` yang juga menulis log & cache', '`loadUser()` + efek samping dipisah', 'Nama tidak boleh menyembunyikan efek samping'],
      ]),
      heading('Before/after: fungsi yang melakukan segalanya'),
      code('Sebelum: validasi, hitung, simpan, dan kirim email dalam satu fungsi', `def proses(d):
    if d is not None:
        if len(d["items"]) > 0:
            t = 0
            for i in d["items"]:
                t += i["harga"] * i["qty"]
            if d["member"]:
                t = t - t * 0.1
            if t > 500000:
                t = t - 20000
            db.simpan(d["id"], t)
            email.kirim(d["email"], "Total belanja: " + str(t))
            return t
    return None`, 'python'),
      code('Sesudah: extract function, konstanta bernama, dependensi eksplisit', `PERSEN_DISKON_MEMBER = 10
MIN_BELANJA_POTONGAN = 500_000
POTONGAN = 20_000


def hitung_subtotal(items: list[Item]) -> int:
    return sum(item.harga * item.qty for item in items)


def hitung_total(subtotal: int, is_member: bool) -> int:      # fungsi murni: mudah dites
    total = subtotal
    if is_member:
        total -= total * PERSEN_DISKON_MEMBER // 100
    if total > MIN_BELANJA_POTONGAN:
        total -= POTONGAN
    return total


def checkout(pesanan: Pesanan, repo: PesananRepo, notifier: Notifier) -> int:
    if not pesanan.items:                                    # guard clause, bukan if bersarang
        raise ValueError("pesanan kosong")
    total = hitung_total(hitung_subtotal(pesanan.items), pesanan.is_member)
    repo.simpan_total(pesanan.id, total)                     # efek samping dikumpulkan di tepi
    notifier.kirim(pesanan.email, f"Total belanja: Rp{total:,}")
    return total`, 'python'),
      callout('warn', 'Pisahkan refactoring dari perubahan perilaku', 'Versi "sesudah" di atas sengaja mengandung **dua perubahan perilaku**: pesanan kosong kini melempar exception (dulu mengembalikan `None`), dan diskon dihitung dengan integer (dulu float). Di proyek nyata, lakukan refactor murni lebih dulu dengan test yang tetap hijau, lalu ubah perilaku di commit atau PR terpisah beserta test barunya. Reviewer jadi tahu persis apa yang berubah.'),
      heading('Side effect dan fungsi murni'),
      paragraph('**Fungsi murni** hanya bergantung pada argumennya dan hanya menghasilkan nilai kembali: tanpa membaca jam, tanpa I/O, tanpa mengubah argumen. Fungsi seperti itu mudah dites dan dipahami. Efek samping tetap diperlukan (menyimpan ke database, mengirim email), tetapi kumpulkan di lapisan luar. Pola ini sering disebut *functional core, imperative shell*.'),
      code('Memisahkan keputusan dari efek samping', `# Sulit dites: membaca jam sekarang dan mengubah objek argumen
def tandai_telat(tagihan_list):
    for t in tagihan_list:
        if t.jatuh_tempo < date.today():
            t.status = "TELAT"


# Lebih baik: keputusan murni, waktu dimasukkan sebagai argumen
def is_telat(jatuh_tempo: date, hari_ini: date) -> bool:
    return jatuh_tempo < hari_ini

def cari_telat(tagihan_list: list[Tagihan], hari_ini: date) -> list[Tagihan]:
    return [t for t in tagihan_list if is_telat(t.jatuh_tempo, hari_ini)]

# Di lapisan luar (service/job): telat = cari_telat(repo.semua(), date.today()); repo.tandai(telat)`, 'python'),
      heading('Code smell dan obatnya'),
      table(['Code smell', 'Gejala', 'Refactoring yang umum'], [
        ['Long Function', 'Fungsi puluhan baris dengan komentar penanda bagian', 'Extract Function untuk setiap bagian'],
        ['Duplicated Code', 'Logika sama di beberapa tempat, bug harus diperbaiki berkali-kali', 'Extract Function, Pull Up Method'],
        ['Long Parameter List', '`buat(a, b, c, d, e, f, true, false)`', 'Introduce Parameter Object, builder'],
        ['Primitive Obsession', 'Uang, email, nomor HP sebagai `String`/`double` mentah', 'Replace Primitive with Object (value object)'],
        ['Feature Envy', 'Method sibuk mengakses data objek lain', 'Move Function ke class pemilik data'],
        ['Switch berulang', '`switch` pada tipe yang sama muncul di banyak fungsi', 'Replace Conditional with Polymorphism'],
        ['Shotgun Surgery', 'Satu perubahan kecil memaksa edit di banyak file', 'Move Function/Field, satukan tanggung jawab'],
        ['Nested Conditional', '`if` bersarang 4 tingkat', 'Replace Nested Conditional with Guard Clauses'],
      ]),
      heading('Replace Conditional with Polymorphism'),
      code('Sebelum: switch yang sama tersebar di banyak method', `public long hitungOngkir(String metode, int beratGram, boolean jarakJauh) {
    switch (metode) {
        case "REGULER":       return 10_000 + (beratGram / 1000) * 5_000L;
        case "EKSPRES":       return 20_000 + (beratGram / 1000) * 8_000L + (jarakJauh ? 15_000 : 0);
        case "AMBIL_SENDIRI": return 0;
        default: throw new IllegalArgumentException("metode tidak dikenal: " + metode);
    }
}
// switch (metode) yang sama juga ada di estimasiHari(), labelMetode(), validasiAlamat() ...`, 'java'),
      code('Sesudah: setiap varian membawa perilakunya sendiri', `public interface MetodeKirim {
    long ongkir(int beratGram, boolean jarakJauh);
    int estimasiHari();
}

public final class Reguler implements MetodeKirim {
    public long ongkir(int beratGram, boolean jarakJauh) { return 10_000 + (beratGram / 1000) * 5_000L; }
    public int estimasiHari() { return 3; }
}

public final class Ekspres implements MetodeKirim {
    public long ongkir(int beratGram, boolean jarakJauh) {
        return 20_000 + (beratGram / 1000) * 8_000L + (jarakJauh ? 15_000 : 0);
    }
    public int estimasiHari() { return 1; }
}

public final class AmbilSendiri implements MetodeKirim {
    public long ongkir(int beratGram, boolean jarakJauh) { return 0; }
    public int estimasiHari() { return 0; }
}

// Pemanggil tidak lagi peduli jenisnya; metode baru = class baru, tanpa mengedit switch di mana-mana
long biaya = metode.ongkir(pesanan.beratGram(), pesanan.jarakJauh());`, 'java'),
      callout('info', 'Polymorphism atau sealed + switch?', 'Bila **varian** sering bertambah (metode kirim baru), polymorphism lebih cocok karena varian baru tidak menyentuh kode lama. Bila variannya tetap tetapi **operasi** sering bertambah (laporan, label, validasi baru), `sealed interface` + switch pattern yang dicek compiler bisa lebih jelas. Lihat [Records, Sealed Class & Pattern Matching](#java.java-records-sealed-pattern).'),
      heading('Cara refactor dengan aman, dan kapan tidak'),
      list([
        '**Pasang jaring pengaman dulu**: bila belum ada test, tulis *characterization test* yang merekam perilaku saat ini, termasuk yang aneh. Lihat [TDD: Red, Green, Refactor](#testing.tdd-untuk-vibe-coding-red-green-refactor).',
        '**Langkah kecil**: satu refactoring, jalankan test, commit. Gunakan fitur refactor otomatis IDE (Rename, Extract Method, Inline) yang jauh lebih aman daripada edit manual.',
        '**Boy scout rule**: rapikan sedikit area yang sedang kamu sentuh untuk fitur, bukan seluruh modul sekaligus.',
        '**Jangan refactor** kode yang akan segera dihapus atau diganti, kode stabil yang hampir tidak pernah disentuh, atau saat hotfix produksi; catat sebagai utang teknis dan jadwalkan.',
        '**Hati-hati menulis ulang total** (*big rewrite*): biasanya lebih lama dari perkiraan dan kehilangan perbaikan bug yang tersembunyi di kode lama. Lebih aman mengganti bertahap.',
      ]),
      ...quiz([
        ['CS-13', 'Apa syarat utama sebelum melakukan refactoring, dan mengapa?', 'Ada test yang cukup untuk memverifikasi perilaku tidak berubah. Refactoring menurut definisinya tidak mengubah perilaku; tanpa test, tidak ada cara cepat untuk membuktikannya, sehingga setiap langkah berisiko memasukkan bug diam-diam. Bila belum ada test, tulis characterization test dulu.'],
        ['CS-14', 'Mengapa fungsi `is_telat(jatuh_tempo, hari_ini)` lebih mudah dites dibanding versi yang memanggil `date.today()` di dalamnya?', 'Hasilnya hanya bergantung pada argumen, sehingga test cukup memberikan dua tanggal dan memeriksa hasil, kapan pun test dijalankan. Versi dengan `date.today()` memberi hasil berbeda tergantung hari test dijalankan dan membutuhkan mocking jam. Menyuntikkan waktu (atau `Clock` di Java) adalah teknik umum untuk kode yang bergantung pada waktu.'],
        ['CS-15', 'Rekan tim mengirim PR berisi fitur baru sekaligus rename dan pemindahan 40 file. Apa masalahnya dan sarannya?', 'Perubahan perilaku tenggelam di antara ratusan baris perubahan struktur, sehingga reviewer sulit menemukan bug dan revert menjadi sulit. Sarankan memecahnya: PR refactor murni lebih dulu (cepat direview karena test tidak berubah), lalu PR fitur yang kecil dan fokus.'],
      ]),
      ...practice('cs-fondasi-clean-code', [
        'Ambil satu fungsi terpanjang di proyekmu, tulis characterization test-nya, lalu pecah menjadi fungsi-fungsi kecil dengan test tetap hijau di setiap commit.',
        'Temukan tiga magic number atau string di kodemu dan ganti dengan konstanta atau enum bernama.',
        'Refactor `hitungOngkir` versi switch menjadi polymorphism, lalu tambahkan metode kirim "Same Day" dan hitung berapa file lama yang harus diedit.',
        'Pisahkan satu fungsi yang membaca jam atau database menjadi inti murni + lapisan luar, dan tulis unit test untuk inti murninya.',
      ]),
      references(
        ['Refactoring catalog (Martin Fowler)', 'https://refactoring.com/catalog/'],
        ['Refactoring, 2nd edition', 'https://martinfowler.com/books/refactoring.html'],
        ['Refactoring.Guru: Code Smells', 'https://refactoring.guru/refactoring/smells'],
        ['Google Engineering Practices: Code Review', 'https://google.github.io/eng-practices/review/'],
        ['PEP 8: Naming Conventions', 'https://peps.python.org/pep-0008/#naming-conventions'],
      ),
    ],
  },

  // ───────────────────────────── 6. SOLID & Prinsip Desain ─────────────────────────────
  {
    id: 'cs-solid-prinsip-desain',
    title: 'SOLID & Prinsip Desain Lintas Bahasa',
    summary: 'SRP, OCP, LSP, ISP, DIP, plus DRY, KISS, YAGNI, dan composition over inheritance dengan contoh di Java, TypeScript, Python, dan Go.',
    track: FOUNDATION, source: csFoundationSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('SOLID adalah lima prinsip desain berorientasi objek yang dipopulerkan Robert C. Martin. Tujuannya satu: **membuat perubahan murah**. Prinsip ini bukan hukum yang harus diterapkan di setiap class; ia adalah alat untuk mengenali mengapa sebuah kode sulit diubah atau dites. Polanya berlaku lintas bahasa, termasuk bahasa tanpa pewarisan class seperti Go. Modul ini melanjutkan [Clean Code & Refactoring](#jalur.cs-clean-code-refactoring) dan menjadi dasar untuk [Design Pattern](#java.apa-itu-design-pattern).'),
      table(['Prinsip', 'Inti', 'Pertanyaan untuk dirimu', 'Gejala bila dilanggar'], [
        ['**S**ingle Responsibility', 'Satu modul punya satu alasan untuk berubah (satu aktor/pemangku kepentingan)', 'Siapa saja yang bisa meminta class ini diubah?', 'Class "Manager"/"Utils" ribuan baris, konflik merge terus-menerus'],
        ['**O**pen/Closed', 'Terbuka untuk ekstensi, tertutup untuk modifikasi', 'Menambah varian baru perlu mengedit kode lama?', 'Switch/if-else yang terus memanjang'],
        ['**L**iskov Substitution', 'Subtipe harus bisa menggantikan tipe induknya tanpa mengejutkan pemanggil', 'Apakah pemanggil perlu `instanceof` untuk subclass tertentu?', '`UnsupportedOperationException`, override yang melemahkan janji'],
        ['**I**nterface Segregation', 'Klien tidak dipaksa bergantung pada method yang tidak dipakainya', 'Berapa method interface ini yang benar-benar dipakai pemanggil?', 'Implementasi berisi method kosong; mock test raksasa'],
        ['**D**ependency Inversion', 'Logika bisnis bergantung pada abstraksi, bukan detail (DB, HTTP, vendor)', 'Bisakah logika ini dites tanpa database atau internet?', '`new` client konkret di dalam service, test lambat dan rapuh'],
      ]),
      heading('S: Single Responsibility (Java)'),
      code('Satu class, tiga alasan berubah, lalu dipisah', `// Sebelum: tim keuangan (rumus), tim data (format CSV), dan tim ops (SMTP) sama-sama mengubah class ini
class LaporanPenjualan {
    BigDecimal hitungTotal(List<Transaksi> trx) { /* aturan bisnis */ }
    String keCsv(List<Transaksi> trx) { /* format */ }
    void kirimEmail(String csv, String ke) { /* SMTP */ }
}

// Sesudah: setiap class punya satu alasan untuk berubah
class KalkulatorPenjualan { BigDecimal hitungTotal(List<Transaksi> trx) { /* ... */ } }
class LaporanCsvWriter     { String tulis(List<Transaksi> trx) { /* ... */ } }
class PengirimLaporan {
    private final EmailSender email;            // detail SMTP disembunyikan di balik interface
    PengirimLaporan(EmailSender email) { this.email = email; }
    void kirim(String csv, String ke) { email.send(ke, "Laporan harian", csv); }
}`, 'java'),
      heading('O: Open/Closed (TypeScript)'),
      code('Aturan diskon baru tanpa mengedit fungsi lama', `interface AturanDiskon {
  berlaku(order: Order): boolean;
  potongan(order: Order): number;          // dalam rupiah (integer)
}

const diskonMember: AturanDiskon = {
  berlaku: (o) => o.customer.isMember,
  potongan: (o) => Math.floor(o.subtotal / 10),
};

const diskonGajian: AturanDiskon = {
  berlaku: (o) => o.tanggal.getDate() >= 25,
  potongan: () => 15_000,
};

function totalPotongan(order: Order, aturan: readonly AturanDiskon[]): number {
  return aturan
    .filter((a) => a.berlaku(order))
    .reduce((sum, a) => sum + a.potongan(order), 0);
}

// Promo baru = objek baru di daftar; totalPotongan tidak disentuh dan test lamanya tetap berlaku
const semuaAturan = [diskonMember, diskonGajian];`, 'ts'),
      heading('L: Liskov Substitution (Python)'),
      code('Persegi bukan pengganti PersegiPanjang yang bisa diubah', `class PersegiPanjang:
    def __init__(self, lebar: int, tinggi: int) -> None:
        self.lebar, self.tinggi = lebar, tinggi

    def set_lebar(self, v: int) -> None:
        self.lebar = v

    def set_tinggi(self, v: int) -> None:
        self.tinggi = v

    def luas(self) -> int:
        return self.lebar * self.tinggi


class Persegi(PersegiPanjang):               # "persegi adalah persegi panjang" secara matematika...
    def __init__(self, sisi: int) -> None:
        super().__init__(sisi, sisi)

    def set_lebar(self, v: int) -> None:
        self.lebar = self.tinggi = v         # ...tetapi perilakunya mengejutkan pemanggil

    def set_tinggi(self, v: int) -> None:
        self.lebar = self.tinggi = v


def perbesar(p: PersegiPanjang) -> None:
    p.set_lebar(5)
    p.set_tinggi(4)
    assert p.luas() == 20                    # gagal untuk Persegi: luasnya 16

# Perbaikan: jangan jadikan pewarisan. Buat keduanya immutable dan
# implementasikan protokol bersama Bentuk dengan method luas().`, 'python'),
      paragraph('LSP bukan soal "is-a" di dunia nyata, melainkan soal **janji perilaku**: subtipe tidak boleh meminta prasyarat lebih ketat, tidak boleh memberi jaminan lebih lemah, dan tidak boleh melempar exception yang tidak diharapkan. Contoh di pustaka standar: `List.of(...)` di Java mengembalikan `List` yang melempar `UnsupportedOperationException` saat `add()`, sehingga kode yang menerima `List` tidak bisa berasumsi semuanya bisa diubah.'),
      heading('I: Interface Segregation (Go)'),
      code('Interface kecil, didefinisikan di sisi pemakai', `// Terlalu gemuk untuk kebanyakan pemakai
type PenyimpananFile interface {
    Upload(ctx context.Context, key string, r io.Reader) error
    Download(ctx context.Context, key string) (io.ReadCloser, error)
    Delete(ctx context.Context, key string) error
    SetACL(ctx context.Context, key, acl string) error
}

// Pembuat thumbnail hanya perlu mengunduh
type Pengunduh interface {
    Download(ctx context.Context, key string) (io.ReadCloser, error)
}

func BuatThumbnail(ctx context.Context, src Pengunduh, key string) ([]byte, error) {
    rc, err := src.Download(ctx, key)
    if err != nil {
        return nil, fmt.Errorf("download %s: %w", key, err)
    }
    defer rc.Close()
    return resize(rc)
}

// Client S3 dengan empat method di atas otomatis memenuhi Pengunduh (interface Go implisit).
// Di test, fake cukup punya satu method. Pustaka standar mencontohkannya: io.Reader dan io.Writer
// masing-masing hanya punya satu method.`, 'go'),
      heading('D: Dependency Inversion (Java & Python)'),
      tabs(
        ['Java', code('Constructor injection ke abstraksi', `public interface PaymentGateway {
    ChargeResult charge(String orderId, long amount);
}

public class CheckoutService {
    private final PaymentGateway gateway;                       // bergantung pada abstraksi

    public CheckoutService(PaymentGateway gateway) {            // constructor injection
        this.gateway = gateway;
    }

    public ChargeResult bayar(Order order) {
        if (order.total() <= 0) throw new IllegalArgumentException("total harus positif");
        return gateway.charge(order.id(), order.total());
    }
}

// Produksi (atau lewat Spring @Service + @Bean): new CheckoutService(new HttpPaymentGateway(client, apiKey))
// Test unit tanpa jaringan:                     new CheckoutService((id, amount) -> ChargeResult.sukses("TEST-1"))`, 'java')],
        ['Python', code('Protocol: structural typing', `from typing import Protocol


class PaymentGateway(Protocol):
    def charge(self, order_id: str, amount: int) -> str: ...


class CheckoutService:
    def __init__(self, gateway: PaymentGateway) -> None:
        self._gateway = gateway

    def bayar(self, order_id: str, amount: int) -> str:
        if amount <= 0:
            raise ValueError("total harus positif")
        return self._gateway.charge(order_id, amount)


class FakeGateway:                      # tidak perlu mewarisi PaymentGateway
    def charge(self, order_id: str, amount: int) -> str:
        return f"OK-{order_id}"


assert CheckoutService(FakeGateway()).bayar("A1", 50_000) == "OK-A1"`, 'python')],
      ),
      callout('info', 'DIP bukan sama dengan framework DI', '*Dependency Inversion* adalah prinsip desain: logika bisnis mendefinisikan abstraksi yang dibutuhkannya, detail teknis mengimplementasikannya. *Dependency Injection* (Spring, constructor biasa) hanyalah cara memasok implementasinya. Kamu bisa menerapkan DIP tanpa framework apa pun, cukup dengan parameter konstruktor.'),
      heading('Composition over inheritance (TypeScript)'),
      code('Merakit perilaku, bukan menumpuk subclass', `// Pewarisan: kombinasi fitur meledak -> EmailNotifier, SmsNotifier, RetryEmailNotifier,
// RetrySmsLoggingNotifier, ... setiap kombinasi butuh subclass baru.

interface Channel {
  send(to: string, msg: string): Promise<void>;
}

class SmsChannel implements Channel {
  async send(to: string, msg: string): Promise<void> { /* panggil API SMS */ }
}

class RetryChannel implements Channel {
  constructor(private readonly inner: Channel, private readonly attempts = 3) {}

  async send(to: string, msg: string): Promise<void> {
    for (let i = 1; ; i++) {
      try {
        return await this.inner.send(to, msg);
      } catch (err) {
        if (i >= this.attempts) throw err;
      }
    }
  }
}

class LoggingChannel implements Channel {
  constructor(private readonly inner: Channel) {}
  async send(to: string, msg: string): Promise<void> {
    console.info("kirim notifikasi", { to });
    await this.inner.send(to, msg);
  }
}

// Perilaku dirakit saat runtime (pola Decorator); tidak ada subclass baru
const notifier: Channel = new LoggingChannel(new RetryChannel(new SmsChannel(), 5));`, 'ts'),
      heading('DRY, KISS, YAGNI'),
      table(['Prinsip', 'Arti', 'Salah kaprah yang sering terjadi'], [
        ['**DRY** (Don\'t Repeat Yourself)', 'Setiap *pengetahuan* (aturan bisnis) punya satu sumber kebenaran', 'Menyatukan dua kode yang kebetulan mirip tetapi berubah karena alasan berbeda. Tunggu pola muncul tiga kali (*rule of three*)'],
        ['**KISS** (Keep It Simple)', 'Pilih solusi paling sederhana yang memenuhi kebutuhan', 'Sederhana bukan berarti asal; kode sederhana tetap punya test dan error handling'],
        ['**YAGNI** (You Aren\'t Gonna Need It)', 'Jangan bangun fitur atau abstraksi untuk kebutuhan yang belum ada', 'Dipakai sebagai alasan melewatkan keamanan, logging, atau test, yang selalu dibutuhkan'],
      ]),
      callout('warn', 'Over-engineering juga melanggar prinsip', 'Interface dengan satu implementasi yang tidak pernah diganti, factory untuk objek yang dibuat sekali, dan lima lapisan abstraksi untuk CRUD sederhana membuat kode **lebih sulit** diubah. Terapkan SOLID saat perubahan nyata datang atau saat kode sulit dites, bukan sebagai ritual. Pola seperti Strategy dan Observer di [Behavioral Patterns](#java.behavioral-patterns) adalah penerapan konkret prinsip-prinsip ini.'),
      ...quiz([
        ['CS-16', 'Class `Penguin extends Burung` meng-override `terbang()` dengan melempar `UnsupportedOperationException`. Prinsip apa yang dilanggar dan bagaimana memperbaikinya?', 'Liskov Substitution: kode yang menerima `Burung` dan memanggil `terbang()` akan gagal saat diberi `Penguin`. Perbaikannya adalah memperbaiki abstraksi, misalnya memisahkan kemampuan menjadi interface `BisaTerbang` yang hanya diimplementasikan burung yang bisa terbang, sehingga pemanggil hanya meminta kemampuan yang memang dibutuhkan (sekaligus menerapkan ISP).'],
        ['CS-17', 'Mengapa `CheckoutService` yang membuat `new HttpPaymentGateway()` di dalam konstruktornya sulit dites, dan prinsip apa yang membantu?', 'Service terikat ke implementasi konkret yang melakukan panggilan jaringan, sehingga unit test lambat, rapuh, dan bisa menagih uang sungguhan. Dependency Inversion: service bergantung pada interface `PaymentGateway` yang dipasok dari luar (constructor injection), sehingga test bisa memberikan fake atau lambda.'],
        ['CS-18', 'Dua fungsi validasi (untuk alamat pengiriman dan alamat penagihan) saat ini identik. Apakah wajib disatukan demi DRY?', 'Belum tentu. DRY berlaku untuk pengetahuan yang sama, bukan teks yang kebetulan sama. Bila aturan kedua alamat bisa berubah karena alasan berbeda (misalnya penagihan butuh NPWP), menyatukannya menciptakan coupling yang nanti dipecah lagi. Satukan bila memang satu aturan bisnis yang sama; bila ragu, tunggu sampai polanya jelas.'],
      ]),
      ...practice('cs-fondasi-solid', [
        'Pilih satu class terbesar di proyekmu, daftar semua "alasan berubah"-nya, lalu pecah menjadi class dengan satu tanggung jawab.',
        'Implementasikan contoh `AturanDiskon` di bahasamu sendiri dan tambahkan aturan "gratis ongkir di atas Rp300.000" tanpa mengubah fungsi `totalPotongan`.',
        'Ubah satu service yang membuat client HTTP atau repository di dalamnya menjadi constructor injection, lalu tulis unit test dengan fake.',
        'Di Go (atau TypeScript), definisikan interface satu method di sisi pemakai untuk sebuah dependensi besar dan buktikan test-nya hanya butuh fake satu method.',
      ]),
      references(
        ['Robert C. Martin: The Principles of OOD', 'http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod'],
        ['Liskov & Wing: A Behavioral Notion of Subtyping', 'https://dl.acm.org/doi/10.1145/197320.197383'],
        ['Effective Go: Interfaces', 'https://go.dev/doc/effective_go#interfaces'],
        ['Go Code Review Comments: Interfaces', 'https://go.dev/wiki/CodeReviewComments#interfaces'],
        ['Python typing: Protocols', 'https://typing.python.org/en/latest/spec/protocol.html'],
        ['Martin Fowler: YAGNI', 'https://martinfowler.com/bliki/Yagni.html'],
      ),
    ],
  },
];
