import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const C_DASAR = 'C Dasar';
const MODERN = 'C++ Modern';
const CP = 'C++ untuk Competitive Programming';

export const cppSource = 'C & C++: materi tulisan tangan dari cppreference.com, C++ Core Guidelines, dokumentasi GCC/Clang, CMake, dan GoogleTest (2 November 2026)';

const cppTracks: Track[] = [
  { title: C_DASAR, summary: 'Toolchain gcc/clang, tahap build, tipe & operator, fungsi, array & string, pointer, memori dinamis, file I/O, dan proyek multi-file dengan Makefile.' },
  { title: MODERN, summary: 'C++20/23: reference, class & RAII, STL, smart pointer & move semantics, template & concepts, lambda & ranges, concurrency, serta tooling CMake, test, sanitizer, dan clang-tidy.' },
  { title: CP, summary: 'Template kontes, fast I/O, trik STL, jebakan overflow, lalu pola soal klasik (prefix sum, two pointers, BFS/DFS, DP) lengkap dengan solusi.' },
];

const cppModules: Omit<Module, 'code'>[] = [
  {
    id: 'c-setup-dasar',
    title: 'C: Setup, Tahap Build, Tipe & I/O',
    summary: 'Memasang gcc/clang (Linux, macOS, Windows via MSYS2/WSL), empat tahap build, tipe integer & operator, undefined behavior, serta printf/scanf/fgets yang aman.',
    track: C_DASAR, source: cppSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('C adalah bahasa di bawah hampir semua hal yang Anda pakai: kernel Linux, runtime Python dan PHP, SQLite, Redis, firmware mikrokontroler. Belajar C berarti belajar **apa yang sebenarnya dilakukan komputer**: memori adalah deretan byte beralamat, tipe hanyalah cara membaca byte tersebut, dan tidak ada garbage collector yang membereskan kesalahan Anda. Standar yang relevan saat ini adalah **C17** (ISO/IEC 9899:2018) dan **C23** (ISO/IEC 9899:2024). Sejak GCC 15, mode bawaan kompilasi C adalah `-std=gnu23`; di kurikulum ini kita menulis C17 yang juga valid di C23 dan menandai fitur khusus C23 bila dipakai.'),
      paragraph('Program C tidak dijalankan langsung dari sumbernya. Compiler driver (`gcc` atau `clang`) menjalankan empat tahap: **preprocess** (mengekspansi `#include` dan `#define`), **compile** (C menjadi assembly), **assemble** (assembly menjadi object file `.o`), dan **link** (menggabungkan object file dengan pustaka seperti libc menjadi executable). Memahami tahap ini membuat pesan error terbaca: error sintaks muncul saat compile, sedangkan `undefined reference to ...` muncul saat link.'),
      code('Pasang toolchain dan kompilasi program pertama', `# Linux (Debian/Ubuntu) atau WSL di Windows
sudo apt update && sudo apt install build-essential gdb clang valgrind

# macOS: Command Line Tools berisi clang + make (perintah "gcc" di macOS adalah alias clang)
xcode-select --install

# Windows native: pasang MSYS2 dari https://www.msys2.org lalu buka terminal "MSYS2 UCRT64"
pacman -S --needed mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-gdb make

gcc --version
clang --version

# Kompilasi dengan peringatan lengkap dan simbol debug
gcc -std=c17 -Wall -Wextra -Wpedantic -g halo.c -o halo
./halo                 # PowerShell: .\\halo.exe`, 'bash'),
      code('halo.c dan empat tahap build', `// halo.c
#include <stdio.h>

int main(void) {
    printf("Halo, C!\\n");
    return 0;
}

/*
 * gcc -E halo.c -o halo.i     1. preprocess: isi stdio.h ditempel, makro diekspansi
 * gcc -S halo.i -o halo.s     2. compile: C → assembly
 * gcc -c halo.s -o halo.o     3. assemble: assembly → object file (kode mesin, belum bisa dijalankan)
 * gcc halo.o -o halo          4. link: object + libc → executable
 * gcc -save-temps -c halo.c   simpan semua file antara sekaligus
 * nm halo.o                   simbol: "T main" (didefinisikan di sini), "U puts" (dicari saat link;
 *                             GCC sering mengganti printf tanpa format menjadi puts)
 */`, 'c'),
      code('Tipe integer, operator, dan jebakan konversi', `#include <inttypes.h>
#include <limits.h>
#include <stdbool.h>   // C23: bool/true/false sudah keyword, header ini tidak diperlukan lagi
#include <stdint.h>
#include <stdio.h>

int main(void) {
    printf("char=%zu short=%zu int=%zu long=%zu long long=%zu\\n",
           sizeof(char), sizeof(short), sizeof(int), sizeof(long), sizeof(long long));
    // long: 8 byte di Linux/macOS 64-bit, tetapi 4 byte di Windows (model LLP64)

    int32_t pas = INT32_MAX;
    int64_t besar = (int64_t)pas + 1;      // cast dulu baru tambah → tidak overflow
    printf("%" PRId32 " %" PRId64 "\\n", pas, besar);

    int a = 7, b = 2;
    printf("7/2=%d 7%%2=%d 7.0/2=%.1f\\n", a / b, a % b, (double)a / b);   // 3 1 3.5
    printf("-7/2=%d -7%%2=%d\\n", -a / b, -a % b);                         // -3 -1 (dibulatkan ke nol)

    unsigned int u = 0;
    u = u - 1;                              // unsigned: wrap-around terdefinisi → UINT_MAX
    printf("%u %d\\n", u, u == UINT_MAX);

    bool genap = (a & 1) == 0;              // bitwise: & | ^ ~ << >>
    printf("genap? %s, 1<<4=%d\\n", genap ? "ya" : "tidak", 1 << 4);
    return 0;
}`, 'c'),
      code('Input yang aman: fgets + cek nilai kembali scanf', `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char nama[64];
    printf("Nama: ");
    if (fgets(nama, sizeof nama, stdin) == NULL) return EXIT_FAILURE;   // maksimal 63 char + '\\0'
    nama[strcspn(nama, "\\n")] = '\\0';                                    // buang newline di akhir

    int umur;
    printf("Umur: ");
    if (scanf("%d", &umur) != 1) {          // scanf mengembalikan jumlah field yang berhasil dibaca
        fprintf(stderr, "input umur tidak valid\\n");
        return EXIT_FAILURE;
    }
    printf("Halo %s, tahun depan umurmu %d\\n", nama, umur + 1);
    return EXIT_SUCCESS;
}`, 'c'),
      table(['Tipe', 'printf', 'scanf', 'Catatan'], [
        ['`int`', '`%d`', '`%d`', 'Minimal 16 bit; praktis 32 bit di semua platform desktop'],
        ['`long` / `long long`', '`%ld` / `%lld`', '`%ld` / `%lld`', '`long` tidak portabel (4 atau 8 byte); pakai `int64_t` bila butuh 64 bit'],
        ['`unsigned`', '`%u`', '`%u`', 'Aritmetika modulo 2^N, tidak pernah negatif'],
        ['`size_t`', '`%zu`', '`%zu`', 'Hasil `sizeof` dan panjang array'],
        ['`double`', '`%f` / `%g`', '`%lf`', 'Di printf, `float` dipromosikan ke `double`, jadi `%f` untuk keduanya'],
        ['`char` / string', '`%c` / `%s`', '`%c` / `%63s`', 'Selalu batasi lebar `%s` di scanf agar tidak overflow'],
        ['pointer', '`%p`', '-', 'Cast ke `(void *)` terlebih dahulu'],
      ]),
      callout('warn', 'Undefined behavior (UB)', 'Signed overflow (`INT_MAX + 1`), membaca variabel yang belum diinisialisasi, dan akses di luar batas array adalah **undefined behavior**: standar tidak menjamin apa pun, dan optimizer boleh berasumsi hal itu tidak pernah terjadi sehingga hasilnya bisa berubah antara `-O0` dan `-O2`. Selalu kompilasi dengan `-Wall -Wextra`, dan selama pengembangan tambahkan `-fsanitize=undefined` (Linux/macOS/WSL) untuk menangkap UB saat runtime.'),
      ...quiz([
        ['CPP-01', 'Program gagal dibangun dengan pesan `undefined reference to hitung_pajak`. Di tahap build mana error ini terjadi, dan apa penyebab umumnya?', 'Di tahap **link**. Compiler sudah menerima deklarasi (prototipe) fungsinya, tetapi linker tidak menemukan definisinya di object file atau pustaka mana pun. Penyebab umum: file `.c` yang berisi definisi tidak ikut dikompilasi/di-link, salah ketik nama, atau pustaka lupa ditambahkan (`-lm` untuk fungsi matematika di Linux).'],
        ['CPP-02', 'Mengapa `-7 / 2` bernilai -3 dan `-7 % 2` bernilai -1 di C?', 'Sejak C99, pembagian integer dibulatkan ke arah nol, sehingga -3,5 menjadi -3. Sisa bagi didefinisikan agar `(a / b) * b + a % b == a` selalu benar, sehingga tandanya mengikuti pembilang: -7 - (-3 × 2) = -1.'],
        ['CPP-03', 'Kenapa `fgets` lebih disukai daripada `scanf("%s", buf)` untuk membaca teks?', '`fgets` menerima ukuran buffer dan tidak pernah menulis melebihinya, serta membaca satu baris utuh termasuk spasi. `scanf("%s")` tanpa lebar bisa menulis melewati buffer (buffer overflow) dan berhenti di spasi pertama. Bila tetap memakai scanf, batasi lebarnya (`%63s`) dan cek nilai kembaliannya.'],
      ]),
      ...practice('cpp-c-setup', [
        'Pasang gcc dan clang (WSL atau MSYS2 UCRT64 di Windows), lalu kompilasi `halo.c` dengan `-std=c17 -Wall -Wextra -Wpedantic`.',
        'Jalankan keempat tahap build secara manual, buka `halo.i` dan `halo.s`, lalu catat simbol yang ditampilkan `nm halo.o`.',
        'Tulis program yang mencetak `sizeof` semua tipe integer serta `INT_MAX`, `LLONG_MAX`, dan `UINT_MAX`; bandingkan hasilnya di Linux/WSL dan Windows native.',
        'Buat kalkulator BMI yang membaca nama dengan `fgets` serta berat dan tinggi dengan `scanf`, menolak input tidak valid, dan menampilkan hasil dengan dua desimal.',
      ]),
      references(
        ['cppreference: C language', 'https://en.cppreference.com/w/c/language'],
        ['cppreference: printf family', 'https://en.cppreference.com/w/c/io/fprintf'],
        ['GCC: Overall Options (tahap kompilasi)', 'https://gcc.gnu.org/onlinedocs/gcc/Overall-Options.html'],
        ['GCC: Warning Options', 'https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html'],
        ['MSYS2', 'https://www.msys2.org/'],
      ),
    ],
  },
  {
    id: 'c-kontrol-fungsi-array',
    title: 'C: Kontrol Alur, Fungsi, Array & String',
    summary: 'if/switch/loop, prototipe fungsi dan pass-by-value, array & array decay, array 2D, string null-terminated, fungsi string.h yang aman, serta argumen baris perintah.',
    track: C_DASAR, source: cppSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Kontrol alur C mirip Java atau JavaScript (`if`, `switch`, `for`, `while`, `do-while`), tetapi ada dua perbedaan besar. Pertama, semua argumen fungsi **dikirim berdasarkan nilai** (pass-by-value): fungsi menerima salinan, sehingga untuk mengubah variabel pemanggil Anda butuh pointer (modul berikutnya). Kedua, array tidak tahu panjangnya sendiri: saat dikirim ke fungsi, array "decay" menjadi pointer ke elemen pertama, jadi panjangnya wajib dikirim sebagai parameter terpisah.'),
      paragraph('String di C hanyalah array `char` yang diakhiri byte nol `\'\\0\'`. Tidak ada tipe string, tidak ada pengecekan batas, dan `==` membandingkan alamat, bukan isi. Mayoritas celah keamanan klasik (buffer overflow) lahir dari string C yang ditulis melebihi kapasitas buffer, jadi kebiasaan yang benar sejak awal sangat penting.'),
      code('Fungsi, array, dan array 2D', `#include <stddef.h>
#include <stdio.h>

// Prototipe: compiler perlu tahu signature sebelum fungsi dipanggil
double rata_rata(const int nilai[], size_t n);
int indeks_maks(const int *nilai, size_t n);   // di parameter, 'int nilai[]' dan 'int *nilai' identik

int main(void) {
    int skor[] = {78, 92, 65, 88, 92};
    size_t n = sizeof skor / sizeof skor[0];       // hanya benar untuk array asli, bukan pointer
    printf("rata-rata = %.2f\\n", rata_rata(skor, n));   // 83.00
    printf("maks di indeks %d\\n", indeks_maks(skor, n)); // 1

    int matriks[2][3] = {{1, 2, 3}, {4, 5, 6}};   // disimpan baris demi baris (row-major)
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) printf("%d ", matriks[i][j]);
        putchar('\\n');
    }
    return 0;
}

double rata_rata(const int nilai[], size_t n) {
    if (n == 0) return 0.0;
    long long total = 0;
    for (size_t i = 0; i < n; i++) total += nilai[i];
    return (double)total / n;
}

int indeks_maks(const int *nilai, size_t n) {
    int terbaik = 0;
    for (size_t i = 1; i < n; i++)
        if (nilai[i] > nilai[terbaik]) terbaik = (int)i;
    return terbaik;
}`, 'c'),
      code('String: null terminator, strlen manual, snprintf, strcmp', `#include <ctype.h>
#include <stdio.h>
#include <string.h>

size_t panjang(const char *s) {          // implementasi manual strlen
    size_t n = 0;
    while (s[n] != '\\0') n++;
    return n;
}

void balik(char *s) {                     // membalik string di tempat (in-place)
    size_t n = strlen(s);
    for (size_t i = 0; i < n / 2; i++) {
        char tmp = s[i];
        s[i] = s[n - 1 - i];
        s[n - 1 - i] = tmp;
    }
}

int main(void) {
    char nama[] = "budi";                 // array 5 byte: b u d i \\0 → boleh diubah
    const char *literal = "konstan";      // string literal: read-only, mengubahnya adalah UB
    printf("%zu %zu %zu\\n", panjang(nama), sizeof nama, strlen(literal));   // 4 5 7

    nama[0] = (char)toupper((unsigned char)nama[0]);   // cast ke unsigned char: aturan ctype.h
    balik(nama);
    printf("%s\\n", nama);                // iduB

    char sapaan[32];
    int perlu = snprintf(sapaan, sizeof sapaan, "Halo, %s dari %s!", "Budi", "Medan");
    if (perlu >= (int)sizeof sapaan) puts("terpotong");   // snprintf mengembalikan panjang yang DIBUTUHKAN
    printf("%s (%d char)\\n", sapaan, perlu);

    if (strcmp("abc", "abd") < 0) puts("abc < abd");      // bandingkan isi, bukan dengan ==
    return 0;
}`, 'c'),
      code('switch, argumen baris perintah, dan strtol', `#include <errno.h>
#include <stdio.h>
#include <stdlib.h>

// Mengembalikan 1 bila teks adalah angka utuh yang valid
static int baca_angka(const char *teks, long *hasil) {
    char *akhir;
    errno = 0;
    long v = strtol(teks, &akhir, 10);
    if (errno != 0 || akhir == teks || *akhir != '\\0') return 0;   // overflow, kosong, atau ada sisa huruf
    *hasil = v;
    return 1;
}

int main(int argc, char *argv[]) {        // argv[0] = nama program
    if (argc != 4) {
        fprintf(stderr, "pakai: %s <a> <+|-|x|/> <b>\\n", argv[0]);
        return EXIT_FAILURE;
    }
    long a, b;
    if (!baca_angka(argv[1], &a) || !baca_angka(argv[3], &b)) {
        fprintf(stderr, "angka tidak valid\\n");
        return EXIT_FAILURE;
    }
    switch (argv[2][0]) {
    case '+': printf("%ld\\n", a + b); break;
    case '-': printf("%ld\\n", a - b); break;
    case 'x': printf("%ld\\n", a * b); break;   // bukan '*': shell mengekspansinya menjadi nama file
    case '/':
        if (b == 0) { fprintf(stderr, "pembagian dengan nol\\n"); return EXIT_FAILURE; }
        printf("%ld\\n", a / b);
        break;
    default:
        fprintf(stderr, "operasi '%s' tidak dikenal\\n", argv[2]);
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}

// gcc -std=c17 -Wall -Wextra kalk.c -o kalk && ./kalk 12 x 4   → 48`, 'c'),
      table(['Kebutuhan', 'Hindari', 'Gunakan', 'Alasan'], [
        ['Membaca baris', '`gets` (dihapus sejak C11)', '`fgets(buf, sizeof buf, stdin)`', 'Ada batas ukuran buffer'],
        ['Menyalin string', '`strcpy(dst, src)`', '`snprintf(dst, sizeof dst, "%s", src)`', '`strcpy` tidak tahu ukuran `dst`'],
        ['Menyalin terbatas', '`strncpy` tanpa penutup', '`snprintf`, atau `strncpy` lalu set `\\0` manual', '`strncpy` tidak menjamin `\\0` bila sumber terlalu panjang'],
        ['Menggabung string', '`strcat` berulang', '`snprintf` dengan offset', '`strcat` memindai ulang dari awal dan tanpa batas'],
        ['String ke angka', '`atoi`', '`strtol` / `strtod` + cek `errno` dan `endptr`', '`atoi` tidak bisa melaporkan error'],
        ['Membandingkan', '`a == b`', '`strcmp(a, b) == 0`', '`==` membandingkan alamat'],
      ]),
      callout('tip', 'Array decay dan `sizeof`', 'Di dalam `main`, `sizeof skor` bernilai 20 (5 × 4 byte). Di dalam fungsi yang menerima `const int nilai[]`, `sizeof nilai` hanya ukuran pointer (8 byte di sistem 64-bit), dan GCC memperingatkannya dengan `-Wsizeof-array-argument`. Karena itu pola C yang baku selalu mengirim pasangan (pointer, panjang).'),
      ...quiz([
        ['CPP-04', 'Mengapa `char nama[] = "budi";` boleh diubah, sedangkan `char *p = "budi"; p[0] = \'B\';` berbahaya?', 'Bentuk pertama membuat array 5 byte milik variabel tersebut lalu menyalin isi literal ke dalamnya, sehingga bisa diubah. Bentuk kedua membuat pointer ke string literal yang biasanya disimpan di memori read-only; mengubahnya adalah undefined behavior dan sering berakhir segfault. Deklarasikan sebagai `const char *` agar compiler mencegahnya.'],
        ['CPP-05', 'Fungsi `void reset(int x) { x = 0; }` dipanggil dengan `reset(skor);`. Mengapa `skor` tidak berubah?', 'C selalu pass-by-value: parameter `x` adalah salinan nilai `skor`, dan yang di-nol-kan hanya salinan itu. Untuk mengubah variabel pemanggil, kirim alamatnya (`reset(&skor)`) dengan parameter `int *x` lalu tulis `*x = 0`.'],
      ]),
      ...practice('cpp-c-fungsi', [
        'Tulis `int cari(const int *xs, size_t n, int target)` yang mengembalikan indeks pertama atau -1, lalu uji dengan array kosong, elemen di awal, dan elemen di akhir.',
        'Implementasikan `is_palindrom(const char *s)` yang mengabaikan huruf besar/kecil dan karakter non-alfanumerik ("Kasur ini rusak" harus bernilai benar).',
        'Kembangkan `kalk` agar mendukung `%` dan `^` (pangkat bilangan bulat) serta menolak hasil yang overflow `long`.',
        'Tulis fungsi transpose matriks 3×3 dan cetak hasilnya; jelaskan mengapa C membutuhkan ukuran kolom pada parameter `int m[][3]`.',
      ]),
      references(
        ['cppreference: Null-terminated byte strings', 'https://en.cppreference.com/w/c/string/byte'],
        ['cppreference: Array declaration', 'https://en.cppreference.com/w/c/language/array'],
        ['cppreference: strtol', 'https://en.cppreference.com/w/c/string/byte/strtol'],
        ['SEI CERT C: Strings (STR)', 'https://wiki.sei.cmu.edu/confluence/display/c/Rule+07.+Characters+and+Strings+(STR)'],
      ),
    ],
  },
  {
    id: 'c-pointer',
    title: 'C: Pointer, Alamat Memori & Pointer ke Fungsi',
    summary: 'Operator & dan *, NULL, out-parameter, pointer ke pointer, pointer arithmetic, hubungan array-pointer, const pada pointer, serta pointer ke fungsi untuk qsort dan tabel dispatch.',
    track: C_DASAR, source: cppSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Pointer adalah variabel yang isinya **alamat memori**. Operator `&x` mengambil alamat `x`, sedangkan `*p` (dereference) membaca atau menulis nilai di alamat yang disimpan `p`. Pointer adalah satu-satunya cara C untuk mengubah variabel milik pemanggil, mengembalikan lebih dari satu hasil, mengelola memori dinamis, dan membangun struktur data seperti linked list dan tree. Bahasa lain menyembunyikannya di balik reference, tetapi mekanismenya tetap sama.'),
      paragraph('Pointer juga punya tipe: `p + 1` pada pointer bertipe `int *` maju sebesar `sizeof(int)` byte, bukan satu byte. Inilah **pointer arithmetic**, dan karena itu `a[i]` didefinisikan sebagai `*(a + i)`. Selain menunjuk data, pointer bisa menunjuk fungsi, sehingga perilaku bisa dikirim sebagai argumen (callback), cikal bakal lambda dan interface di bahasa yang lebih tinggi.'),
      code('Dasar pointer, swap, out-parameter, pointer ke pointer', `#include <stdio.h>

void tukar(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

// Out-parameter: dua hasil lewat pointer, status sukses/gagal lewat return
int bagi(int pembilang, int penyebut, int *hasil, int *sisa) {
    if (penyebut == 0) return -1;
    *hasil = pembilang / penyebut;
    *sisa = pembilang % penyebut;
    return 0;
}

int main(void) {
    int x = 10, y = 20;
    int *p = &x;                         // p menyimpan ALAMAT x
    printf("x=%d alamat=%p via p=%d\\n", x, (void *)p, *p);
    *p = 15;                             // dereference: ubah x lewat p
    tukar(&x, &y);
    printf("x=%d y=%d\\n", x, y);        // x=20 y=15

    int h, s;
    if (bagi(17, 5, &h, &s) == 0) printf("17/5 = %d sisa %d\\n", h, s);

    int **pp = &p;                       // pointer ke pointer: alamat dari variabel p
    **pp = 99;                           // p menunjuk x, jadi x menjadi 99
    printf("x=%d\\n", x);

    int *kosong = NULL;                  // NULL: tidak menunjuk apa pun; dereference = UB (biasanya segfault)
    if (kosong == NULL) puts("selalu cek NULL sebelum dereference");
    return 0;
}`, 'c'),
      code('Pointer arithmetic dan rentang setengah terbuka', `#include <stddef.h>
#include <stdio.h>

int jumlah(const int *awal, const int *akhir) {   // rentang [awal, akhir): akhir tidak ikut
    int total = 0;
    for (const int *p = awal; p != akhir; p++) total += *p;
    return total;
}

int main(void) {
    int data[5] = {10, 20, 30, 40, 50};
    int *p = data;                       // array decay: &data[0]
    printf("%d %d %d\\n", *p, *(p + 2), p[2]);           // 10 30 30 — a[i] == *(a + i)

    ptrdiff_t elemen = &data[4] - &data[0];              // selisih dalam satuan elemen
    ptrdiff_t byte = (char *)&data[4] - (char *)&data[0];
    printf("%td elemen, %td byte\\n", elemen, byte);     // 4 elemen, 16 byte (bila int 4 byte)

    printf("tengah = %d\\n", jumlah(data + 1, data + 4)); // 20 + 30 + 40 = 90
    int *akhir = data + 5;               // boleh menunjuk satu-lewat-akhir, TIDAK boleh di-dereference
    printf("total = %d\\n", jumlah(data, akhir));         // 150
    return 0;
}`, 'c'),
      code('Pointer ke fungsi: qsort dan tabel dispatch', `#include <stdio.h>
#include <stdlib.h>

static int naik(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);            // hindari 'x - y': overflow untuk nilai ekstrem
}
static int turun(const void *a, const void *b) { return naik(b, a); }

static int tambah(int a, int b) { return a + b; }
static int kurang(int a, int b) { return a - b; }
static int kali(int a, int b) { return a * b; }

typedef int (*OperasiBiner)(int, int);   // alias: pointer ke fungsi (int, int) → int

static void cetak(const int *xs, size_t n) {
    for (size_t i = 0; i < n; i++) printf("%d ", xs[i]);
    putchar('\\n');
}

int main(void) {
    int data[] = {42, -7, 19, 0, 88};
    size_t n = sizeof data / sizeof data[0];
    qsort(data, n, sizeof data[0], naik);   // nama fungsi otomatis menjadi pointer ke fungsi
    cetak(data, n);                         // -7 0 19 42 88
    qsort(data, n, sizeof data[0], turun);
    cetak(data, n);                         // 88 42 19 0 -7

    struct { const char *simbol; OperasiBiner f; } tabel[] = {
        {"+", tambah}, {"-", kurang}, {"x", kali},
    };
    for (size_t i = 0; i < sizeof tabel / sizeof tabel[0]; i++)
        printf("6 %s 3 = %d\\n", tabel[i].simbol, tabel[i].f(6, 3));

    int (*pilih)(int, int) = &kali;         // '&' opsional; memanggil (*pilih)(7, 6) juga sah
    printf("%d\\n", pilih(7, 6));           // 42
    return 0;
}`, 'c'),
      table(['Deklarasi', 'Arti', 'Yang tidak boleh'], [
        ['`const int *p` (= `int const *p`)', 'Pointer ke int yang read-only lewat `p`', 'Menulis `*p = 1`; memindah `p` boleh'],
        ['`int *const p`', 'Pointer tetap ke int yang bisa diubah', 'Memindah `p = &y`; menulis `*p` boleh'],
        ['`const int *const p`', 'Pointer tetap ke data read-only', 'Keduanya'],
        ['`int **pp`', 'Pointer ke pointer ke int', 'Dipakai untuk mengubah pointer milik pemanggil'],
        ['`int *a[3]`', 'Array berisi 3 pointer ke int', '-'],
        ['`int (*a)[3]`', 'Pointer ke array berisi 3 int', 'Tipe parameter untuk array 2D `int m[][3]`'],
        ['`int (*f)(int)`', 'Pointer ke fungsi yang menerima dan mengembalikan int', '-'],
      ]),
      callout('warn', 'Dangling pointer', 'Jangan pernah mengembalikan alamat variabel lokal (`return &lokal;`): memori stack-nya hilang saat fungsi selesai, dan pointer yang tersisa menunjuk sampah. Hal yang sama berlaku setelah `free(p)`. Pointer arithmetic di luar array (kecuali tepat satu-lewat-akhir) juga undefined behavior meskipun tidak di-dereference.'),
      ...quiz([
        ['CPP-06', 'Bila `int *p` berisi alamat 1000 dan `sizeof(int)` adalah 4, berapa nilai `p + 3`, dan mengapa?', '1012. Pointer arithmetic bekerja dalam satuan elemen, bukan byte: `p + 3` berarti tiga `int` setelah `p`, yaitu 1000 + 3 × 4. Karena itu `p[3]` dan `*(p + 3)` mengakses elemen keempat.'],
        ['CPP-07', 'Mengapa comparator qsort sebaiknya tidak ditulis `return x - y;`?', 'Pengurangan dua `int` bisa overflow, misalnya `INT_MIN - 1` atau `2000000000 - (-2000000000)`. Signed overflow adalah undefined behavior dan dalam praktik menghasilkan tanda yang salah sehingga urutan rusak. Pola `(x > y) - (x < y)` selalu menghasilkan -1, 0, atau 1 tanpa overflow.'],
        ['CPP-08', 'Kapan sebuah fungsi butuh parameter `Node **head` alih-alih `Node *head`?', 'Saat fungsi perlu mengubah pointer milik pemanggil itu sendiri, misalnya menyisipkan di depan linked list atau menghapus node pertama. Dengan `Node *head` fungsi hanya menerima salinan pointer, sehingga perubahan `head = ...` tidak terlihat oleh pemanggil.'],
      ]),
      ...practice('cpp-c-pointer', [
        'Tulis `void min_max(const int *xs, size_t n, int *min, int *max)` dan tangani `n == 0` dengan mengembalikan kode error.',
        'Tulis ulang `jumlah`, `cari`, dan `balik` hanya dengan pointer arithmetic, tanpa operator `[]`.',
        'Urutkan array struct `{nama, umur}` dengan qsort: berdasarkan umur naik, lalu nama secara alfabetis bila umurnya sama.',
        'Buat kalkulator yang memetakan karakter operator ke pointer fungsi lewat tabel dispatch, lalu tambahkan operasi baru tanpa mengubah `main`.',
      ]),
      references(
        ['cppreference: Pointer declaration (C)', 'https://en.cppreference.com/w/c/language/pointer'],
        ['cppreference: qsort', 'https://en.cppreference.com/w/c/algorithm/qsort'],
        ['cppreference: Undefined behavior (C)', 'https://en.cppreference.com/w/c/language/behavior'],
        ['SEI CERT C: Arrays (ARR)', 'https://wiki.sei.cmu.edu/confluence/display/c/Rule+06.+Arrays+(ARR)'],
      ),
    ],
  },
  {
    id: 'c-memori-dinamis',
    title: 'C: Memori Dinamis, Struct & Linked List',
    summary: 'Stack vs heap, malloc/calloc/realloc/free, pola realloc yang aman, struct & typedef, dynamic array, linked list (sisip, balik, hapus, bebaskan), serta mendeteksi bug memori dengan AddressSanitizer dan Valgrind.',
    track: C_DASAR, source: cppSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Variabel lokal hidup di **stack**: dialokasikan otomatis saat fungsi dipanggil dan hilang saat fungsi selesai. Ukurannya harus diketahui dan relatif kecil (biasanya 1–8 MB per thread). Data yang ukurannya baru diketahui saat runtime, atau yang harus hidup lebih lama dari fungsi pembuatnya, disimpan di **heap** lewat `malloc`. Imbalannya: setiap `malloc` wajib dipasangkan dengan tepat satu `free`, dan tidak ada yang mengingatkan Anda bila lupa.'),
      paragraph('`struct` mengelompokkan beberapa field menjadi satu tipe, dan digabung dengan pointer menghasilkan struktur data dinamis. Dua bentuk yang paling sering ditemui adalah **dynamic array** (blok kontinu yang diperbesar dengan `realloc`, inilah cara kerja `std::vector`, `ArrayList`, dan slice Go) dan **linked list** (node yang saling menunjuk). Bandingkan dengan versi Java di [Linked List](#java.linked-list).'),
      code('Dynamic array dengan realloc yang aman', `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len;
    size_t cap;
} VecInt;

int vec_push(VecInt *v, int nilai) {
    if (v->len == v->cap) {
        size_t cap_baru = v->cap ? v->cap * 2 : 4;   // tumbuh 2x → push amortized O(1)
        int *baru = realloc(v->data, cap_baru * sizeof *baru);
        if (baru == NULL) return -1;                  // blok lama masih valid: tidak bocor
        v->data = baru;
        v->cap = cap_baru;
    }
    v->data[v->len++] = nilai;
    return 0;
}

void vec_free(VecInt *v) {
    free(v->data);                                   // free(NULL) aman
    v->data = NULL;                                  // cegah double free dan use-after-free
    v->len = v->cap = 0;
}

int main(void) {
    VecInt v = {0};                                  // semua field nol / NULL
    for (int i = 1; i <= 10; i++) {
        if (vec_push(&v, i * i) != 0) {
            vec_free(&v);
            return EXIT_FAILURE;
        }
    }
    printf("len=%zu cap=%zu terakhir=%d\\n", v.len, v.cap, v.data[v.len - 1]);   // len=10 cap=16 terakhir=100

    int *nol = calloc(5, sizeof *nol);               // calloc: dialokasikan sekaligus di-nol-kan
    if (nol == NULL) {
        vec_free(&v);
        return EXIT_FAILURE;
    }
    printf("%d\\n", nol[3]);                         // 0
    free(nol);
    vec_free(&v);
    return 0;
}`, 'c'),
      code('Linked list: sisip, balik, hapus, bebaskan', `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int nilai;
    struct Node *next;          // di dalam definisi, typedef 'Node' belum ada: pakai 'struct Node'
} Node;

int push_depan(Node **head, int nilai) {   // Node** agar head milik pemanggil bisa diubah
    Node *n = malloc(sizeof *n);
    if (n == NULL) return -1;
    n->nilai = nilai;                       // n->nilai sama dengan (*n).nilai
    n->next = *head;
    *head = n;
    return 0;
}

void balik(Node **head) {
    Node *sebelum = NULL, *kini = *head;
    while (kini != NULL) {
        Node *berikut = kini->next;
        kini->next = sebelum;
        sebelum = kini;
        kini = berikut;
    }
    *head = sebelum;
}

int hapus_nilai(Node **head, int nilai) {  // pointer ke "tautan": tidak perlu kasus khusus untuk head
    for (Node **p = head; *p != NULL; p = &(*p)->next) {
        if ((*p)->nilai == nilai) {
            Node *buang = *p;
            *p = buang->next;
            free(buang);
            return 1;
        }
    }
    return 0;
}

void cetak(const Node *head) {
    for (const Node *n = head; n != NULL; n = n->next) printf("%d -> ", n->nilai);
    puts("NULL");
}

void bebaskan(Node **head) {
    Node *n = *head;
    while (n != NULL) {
        Node *berikut = n->next;            // simpan dulu: setelah free, n->next tidak boleh dibaca
        free(n);
        n = berikut;
    }
    *head = NULL;
}

int main(void) {
    Node *head = NULL;
    for (int i = 1; i <= 4; i++) {
        if (push_depan(&head, i) != 0) {
            bebaskan(&head);
            return EXIT_FAILURE;
        }
    }
    cetak(head);            // 4 -> 3 -> 2 -> 1 -> NULL
    balik(&head);
    cetak(head);            // 1 -> 2 -> 3 -> 4 -> NULL
    hapus_nilai(&head, 3);
    cetak(head);            // 1 -> 2 -> 4 -> NULL
    bebaskan(&head);
    return 0;
}`, 'c'),
      code('bocor.c: tiga bug memori yang disengaja', `// bocor.c
#include <stdlib.h>
#include <string.h>

int main(void) {
    int *a = malloc(5 * sizeof *a);
    a[5] = 1;                   // heap-buffer-overflow: indeks valid hanya 0..4
    char *s = malloc(16);
    strcpy(s, "halo");
    free(s);
    s[0] = 'H';                 // heap-use-after-free
    return 0;                   // 'a' tidak pernah di-free → memory leak
}`, 'c'),
      code('Menangkap bug dengan AddressSanitizer dan Valgrind', `# AddressSanitizer + UBSan: paling mulus di Linux, macOS, dan WSL.
# GCC MinGW (MSYS2 UCRT64) tidak mendukung ASan; di Windows pakai WSL, clang-cl/MSVC (/fsanitize=address), atau CLANG64.
gcc -g -O1 -fsanitize=address,undefined -fno-omit-frame-pointer bocor.c -o bocor
./bocor
# ==4242==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x...
# WRITE of size 4 at 0x... thread T0
#     #0 0x... in main bocor.c:7
# ASan berhenti di error pertama: perbaiki, kompilasi ulang, ulangi.
# Setelah semua error akses diperbaiki, LeakSanitizer melaporkan leak saat program selesai.

# Valgrind (Linux/WSL): tanpa instrumentasi saat kompilasi, sekitar 10–50x lebih lambat
gcc -g -O0 bocor.c -o bocor
valgrind --leak-check=full --show-leak-kinds=all ./bocor
# Invalid write of size 4 ... 0 bytes after a block of size 20 alloc'd
# Invalid write of size 1 ... 0 bytes inside a block of size 16 free'd
# definitely lost: 20 bytes in 1 blocks`, 'bash'),
      table(['Bug', 'Gejala umum', 'Alat pendeteksi'], [
        ['Memory leak (lupa `free`)', 'Memori proses terus naik', 'LeakSanitizer (bagian dari ASan), Valgrind'],
        ['Buffer overflow', 'Data lain rusak, crash di tempat yang tidak terkait', 'ASan (heap, stack, global), Valgrind (heap saja)'],
        ['Use-after-free', 'Nilai acak, crash sporadis, celah keamanan', 'ASan, Valgrind'],
        ['Double free', 'Abort dari allocator (`free(): double free detected`)', 'ASan, Valgrind'],
        ['Membaca memori belum diinisialisasi', 'Hasil berbeda tiap kali jalan', 'Valgrind, MemorySanitizer (clang); ASan **tidak** mendeteksinya'],
        ['Signed overflow, shift tidak valid', 'Hasil aneh setelah optimasi', 'UBSan (`-fsanitize=undefined`)'],
      ]),
      callout('tip', 'Aturan kepemilikan', 'Tentukan untuk setiap pointer: siapa **pemilik** yang wajib memanggil `free`. Pasangkan setiap fungsi pembuat dengan fungsi penghancur (`vec_push`/`vec_free`, `stack_baru`/`stack_hapus`), set pointer ke `NULL` setelah `free`, dan jalankan test di bawah ASan atau Valgrind di CI. Di C++ disiplin ini diotomatisasi oleh RAII dan smart pointer (lihat [Smart Pointer & Move Semantics](#cpp.cpp-smart-pointer-move)).'),
      ...quiz([
        ['CPP-09', 'Mengapa `v->data = realloc(v->data, n);` adalah pola yang salah?', 'Bila `realloc` gagal, ia mengembalikan `NULL` tetapi blok lama tetap teralokasi. Menimpa `v->data` langsung dengan `NULL` membuat alamat blok lama hilang sehingga memorinya bocor dan datanya tidak bisa diakses. Simpan hasilnya di variabel sementara, cek `NULL`, baru assign.'],
        ['CPP-10', 'Apa beda `malloc(n * sizeof *p)` dan `calloc(n, sizeof *p)`?', '`malloc` mengembalikan memori yang isinya tidak ditentukan (sampah). `calloc` mengisinya dengan nol dan, di implementasi yang baik, juga memeriksa overflow pada perkalian `n × ukuran`. Menulis `sizeof *p` alih-alih `sizeof(int)` membuat kode tetap benar bila tipe `p` diubah.'],
        ['CPP-11', 'Mengapa di `bebaskan`, `n->next` harus disimpan sebelum `free(n)`?', 'Setelah `free(n)`, memori node sudah dikembalikan ke allocator dan bisa dipakai ulang atau ditimpa. Membaca `n->next` setelahnya adalah use-after-free (undefined behavior), yang sering terlihat "berhasil" di mesin sendiri tetapi crash di tempat lain.'],
      ]),
      ...practice('cpp-c-memori', [
        'Lengkapi `VecInt` dengan `vec_get` (cek batas), `vec_pop`, dan `vec_insert(v, idx, nilai)`, lalu jalankan dengan `-fsanitize=address,undefined` tanpa error.',
        'Tambahkan `push_belakang` O(1) pada linked list dengan menyimpan pointer `tail` di struct `List { Node *head, *tail; size_t len; }`.',
        'Kompilasi `bocor.c`, perbaiki ketiga bug satu per satu berdasarkan laporan ASan, lalu konfirmasi Valgrind melaporkan "All heap blocks were freed".',
        'Implementasikan stack berbasis linked list dan queue berbasis dynamic array melingkar (ring buffer), masing-masing dengan fungsi buat/hapus.',
      ]),
      references(
        ['cppreference: Dynamic memory management (C)', 'https://en.cppreference.com/w/c/memory'],
        ['cppreference: realloc', 'https://en.cppreference.com/w/c/memory/realloc'],
        ['Clang: AddressSanitizer', 'https://clang.llvm.org/docs/AddressSanitizer.html'],
        ['GCC: Instrumentation Options (sanitizer)', 'https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html'],
        ['Valgrind: Quick Start', 'https://valgrind.org/docs/manual/quick-start.html'],
      ),
    ],
  },
  {
    id: 'c-file-multi-file',
    title: 'C: File I/O, Header, Proyek Multi-file & Makefile',
    summary: 'fopen/fgets/fprintf dan penanganan error, header guard, deklarasi vs definisi, static & extern, opaque type, struktur proyek multi-file, serta Makefile dengan dependensi header otomatis.',
    track: C_DASAR, source: cppSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Program nyata jarang muat dalam satu file. C memisahkan **deklarasi** (apa yang ada: prototipe fungsi, tipe) di file header `.h` dari **definisi** (implementasinya) di file `.c`. Setiap `.c` dikompilasi terpisah menjadi object file (satu *translation unit*), lalu linker menyatukannya. Header di-`#include` oleh siapa pun yang memakai modul tersebut, jadi header hanya boleh berisi deklarasi; definisi variabel atau fungsi non-inline di header menghasilkan error `multiple definition` saat link.'),
      paragraph('Untuk file, C menyediakan `FILE *` dari `stdio.h`. Setiap operasi I/O bisa gagal (file tidak ada, izin ditolak, disk penuh), jadi selalu cek nilai kembalinya dan laporkan penyebabnya dengan `perror` atau `strerror(errno)`. Untuk membangun proyek, **Makefile** mencatat dependensi antar file sehingga `make` hanya mengompilasi ulang file yang berubah.'),
      code('Membaca CSV dan menulis ringkasan', `#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Baca baris "nama,jumlah" lalu tulis ringkasan rata kanan ke ringkasan.txt
int main(int argc, char *argv[]) {
    const char *masuk = argc > 1 ? argv[1] : "transaksi.csv";
    FILE *in = fopen(masuk, "r");
    if (in == NULL) {
        fprintf(stderr, "gagal membuka %s: %s\\n", masuk, strerror(errno));
        return EXIT_FAILURE;
    }
    FILE *out = fopen("ringkasan.txt", "w");
    if (out == NULL) {
        perror("ringkasan.txt");
        fclose(in);
        return EXIT_FAILURE;
    }

    char baris[256];
    long total = 0;
    int nomor = 0;
    while (fgets(baris, sizeof baris, in) != NULL) {
        nomor++;
        char nama[64];
        long jumlah;
        if (sscanf(baris, "%63[^,],%ld", nama, &jumlah) != 2) {   // %63[^,] = sampai koma, maks 63 char
            fprintf(stderr, "baris %d dilewati: format salah\\n", nomor);
            continue;
        }
        total += jumlah;
        fprintf(out, "%-20s %10ld\\n", nama, jumlah);
    }
    if (ferror(in)) perror("membaca input");
    fprintf(out, "%-20s %10ld\\n", "TOTAL", total);

    fclose(in);
    if (fclose(out) != 0) {             // fclose mem-flush buffer; bisa gagal bila disk penuh
        perror("menutup ringkasan.txt");
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}`, 'c'),
      code('include/stack.h: header dengan opaque type', `#ifndef STACK_H
#define STACK_H

#include <stdbool.h>
#include <stddef.h>

// Opaque type: pemakai hanya tahu "ada struct Stack", isinya disembunyikan di stack.c
typedef struct Stack Stack;

Stack *stack_baru(size_t kapasitas);
void stack_hapus(Stack *s);
bool stack_push(Stack *s, int nilai);
bool stack_pop(Stack *s, int *keluar);
size_t stack_ukuran(const Stack *s);

#endif // STACK_H`, 'c'),
      code('src/stack.c dan src/main.c', `// ===== src/stack.c =====
#include "stack.h"
#include <stdlib.h>

struct Stack {
    int *data;
    size_t len, cap;
};

// static di file scope: internal linkage, tidak terlihat dari file lain
static bool penuh(const Stack *s) { return s->len == s->cap; }

Stack *stack_baru(size_t kapasitas) {
    Stack *s = malloc(sizeof *s);
    if (s == NULL) return NULL;
    s->data = malloc(kapasitas * sizeof *s->data);
    if (s->data == NULL) {
        free(s);
        return NULL;
    }
    s->len = 0;
    s->cap = kapasitas;
    return s;
}

void stack_hapus(Stack *s) {
    if (s == NULL) return;
    free(s->data);
    free(s);
}

bool stack_push(Stack *s, int nilai) {
    if (penuh(s)) return false;
    s->data[s->len++] = nilai;
    return true;
}

bool stack_pop(Stack *s, int *keluar) {
    if (s->len == 0) return false;
    *keluar = s->data[--s->len];
    return true;
}

size_t stack_ukuran(const Stack *s) { return s->len; }

// ===== src/main.c =====
#include <stdio.h>
#include "stack.h"

int main(void) {
    Stack *s = stack_baru(8);
    if (s == NULL) return 1;
    for (int i = 1; i <= 3; i++) stack_push(s, i * 10);
    int x;
    while (stack_pop(s, &x)) printf("%d ", x);   // 30 20 10
    putchar('\\n');
    stack_hapus(s);
    return 0;
}

// Tanpa Makefile: gcc -std=c17 -Wall -Wextra -Iinclude src/stack.c src/main.c -o app`, 'c'),
      code('Makefile dengan dependensi header otomatis', `# Makefile: baris resep WAJIB diawali karakter TAB, bukan spasi
CC      := gcc
CFLAGS  := -std=c17 -Wall -Wextra -Wpedantic -g -Iinclude
# -MMD -MP: hasilkan file .d berisi daftar header yang di-include setiap .c
CFLAGS  += -MMD -MP
LDFLAGS :=

SRC := $(wildcard src/*.c)
OBJ := $(patsubst src/%.c,build/%.o,$(SRC))
BIN := build/app

.PHONY: all run asan clean

all: $(BIN)

$(BIN): $(OBJ)
\t$(CC) $(LDFLAGS) $^ -o $@

build/%.o: src/%.c | build
\t$(CC) $(CFLAGS) -c $< -o $@

build:
\tmkdir -p build

run: $(BIN)
\t./$(BIN)

# Pakai: make clean && make asan
asan: CFLAGS += -fsanitize=address,undefined -fno-omit-frame-pointer
asan: LDFLAGS += -fsanitize=address,undefined
asan: all

clean:
\trm -rf build

-include $(OBJ:.o=.d)`, 'text'),
      table(['Konstruksi', 'Letak', 'Efek'], [
        ['Prototipe fungsi', 'Header `.h`', 'Deklarasi: memberi tahu compiler signature-nya'],
        ['Definisi fungsi', 'File `.c`', 'Implementasi; hanya boleh ada satu di seluruh program'],
        ['`static` fungsi/variabel global', 'File `.c`', 'Internal linkage: hanya terlihat di file itu (helper privat)'],
        ['`extern int hitungan;`', 'Header', 'Deklarasi variabel global yang didefinisikan di satu `.c`'],
        ['`static` variabel lokal', 'Di dalam fungsi', 'Nilainya bertahan antar pemanggilan'],
        ['Header guard / `#pragma once`', 'Header', 'Mencegah isi header diproses dua kali dalam satu translation unit'],
        ['`static inline` fungsi kecil', 'Header', 'Boleh didefinisikan di header tanpa error multiple definition'],
      ]),
      callout('warn', 'Variabel global di header', 'Menulis `int hitungan = 0;` (atau bahkan `int hitungan;`) di header lalu meng-include-nya dari dua file `.c` menghasilkan `multiple definition of hitungan` saat link. Sejak GCC 10 dan Clang 11, mode bawaan adalah `-fno-common`, sehingga kode lama yang dulu lolos kini gagal. Solusinya: `extern int hitungan;` di header dan `int hitungan = 0;` di tepat satu file `.c`.'),
      ...quiz([
        ['CPP-12', 'Apa manfaat opaque type `typedef struct Stack Stack;` di header?', 'Pemakai tidak bisa mengakses atau bergantung pada field internal, karena ukuran dan isi struct hanya diketahui di `stack.c`. Implementasi bisa diubah (misalnya dari array ke linked list) tanpa mengompilasi ulang atau merusak kode pemakai, mirip enkapsulasi `private` di bahasa berorientasi objek. Konsekuensinya, objek hanya bisa dibuat lewat fungsi seperti `stack_baru`.'],
        ['CPP-13', 'Tanpa `-MMD -MP`, apa yang terjadi bila `stack.h` diubah lalu `make` dijalankan?', 'Aturan `build/%.o: src/%.c` hanya bergantung pada file `.c`, sehingga make menganggap object file masih baru dan tidak mengompilasi ulang. Program bisa di-link dengan object yang memakai layout struct lama: bug yang sangat membingungkan. `-MMD` membuat file `.d` berisi dependensi header dan `-include` memasukkannya ke Makefile.'],
      ]),
      ...practice('cpp-c-file', [
        'Jalankan program CSV dengan file berisi baris valid, baris rusak, dan file yang tidak ada; pastikan semua pesan error jelas dan exit code tepat.',
        'Susun proyek `stack` dengan struktur `include/`, `src/`, `Makefile`; ubah `stack.h` dan buktikan `make` mengompilasi ulang file yang terdampak saja.',
        'Tambahkan target `make test` yang membangun `tests/test_stack.c` (memakai `assert`) dan menjalankannya, lalu jalankan juga di bawah `make asan`.',
        'Tulis program yang menyimpan array struct ke file biner dengan `fwrite` dan membacanya kembali dengan `fread`; catat mengapa format ini tidak portabel antar arsitektur.',
      ]),
      references(
        ['cppreference: File input/output (C)', 'https://en.cppreference.com/w/c/io'],
        ['cppreference: Storage-class specifiers (C)', 'https://en.cppreference.com/w/c/language/storage_duration'],
        ['GNU make manual', 'https://www.gnu.org/software/make/manual/make.html'],
        ['GCC: Preprocessor Options (-MMD, -MP)', 'https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html'],
      ),
    ],
  },
  {
    id: 'cpp-dari-c-ke-cpp',
    title: 'Dari C ke C++: Reference, Class, RAII & Const',
    summary: 'Reference vs pointer, std::string, class dengan invariant, constructor & member initializer list, destructor, RAII untuk resource C, explicit, dan const-correctness.',
    track: MODERN, source: cppSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('C++ dimulai sebagai "C dengan class", tetapi C++ modern (C++11 sampai C++23) adalah bahasa yang cara berpikirnya berbeda. Ide terpentingnya adalah **RAII** (Resource Acquisition Is Initialization): setiap resource (memori, file, socket, mutex) dimiliki sebuah objek, diambil di constructor, dan dilepas di destructor. Destructor dipanggil **otomatis dan deterministik** saat objek keluar scope, termasuk saat exception dilempar. Hasilnya: tidak ada `free` yang terlupa, tanpa garbage collector.'),
      paragraph('Perubahan kedua adalah **reference** (`T&`): alias untuk objek yang sudah ada, tidak bisa null, dan tidak bisa dipindah ke objek lain. Bersama `const`, reference membuat signature fungsi menjelaskan niatnya: `const std::string&` berarti "saya hanya membaca, tanpa menyalin", `std::string&` berarti "saya akan mengubah argumen Anda". Konsep ini menjadi dasar desain class di jalur [Low Level Design](#lld). Kompilasi semua contoh dengan `g++ -std=c++20 -Wall -Wextra -Wpedantic -g file.cpp -o app`.'),
      code('Reference, const&, dan std::string', `#include <iostream>
#include <string>
#include <vector>

void tukar(int& a, int& b) {          // reference: alias, tidak bisa null, tidak bisa dipindah
    int tmp = a;
    a = b;
    b = tmp;
}

// const& untuk input besar: tanpa salinan dan tanpa izin mengubah
std::size_t total_panjang(const std::vector<std::string>& kata) {
    std::size_t total = 0;
    for (const auto& k : kata) total += k.size();   // range-based for tanpa menyalin string
    return total;
}

int main() {
    int x = 1, y = 2;
    tukar(x, y);                      // tidak perlu &x seperti di C
    int& alias = x;
    alias = 42;                       // mengubah x
    std::cout << x << ' ' << y << '\\n';           // 42 1

    std::vector<std::string> kata{"satu", "dua", "tiga"};
    std::cout << total_panjang(kata) << '\\n';     // 11

    std::string nama = "Budi";
    nama += " Santoso";               // std::string mengelola memorinya sendiri
    std::cout << nama << " (" << nama.size() << ")\\n";   // Budi Santoso (12)
}`, 'cpp'),
      code('Class dengan invariant, constructor, dan fungsi const', `#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>

class Rekening {
public:
    // explicit: cegah konversi implisit dari std::string ke Rekening
    explicit Rekening(std::string pemilik, long long saldo_awal = 0)
        : pemilik_(std::move(pemilik)), saldo_(saldo_awal) {        // member initializer list
        if (saldo_awal < 0) throw std::invalid_argument("saldo awal negatif");
    }

    void setor(long long jumlah) {
        if (jumlah <= 0) throw std::invalid_argument("jumlah harus positif");
        saldo_ += jumlah;
    }

    bool tarik(long long jumlah) {
        if (jumlah <= 0 || jumlah > saldo_) return false;          // invariant: saldo tidak pernah negatif
        saldo_ -= jumlah;
        return true;
    }

    long long saldo() const { return saldo_; }                     // const: tidak mengubah objek
    const std::string& pemilik() const { return pemilik_; }

private:
    std::string pemilik_;
    long long saldo_;
};

int main() {
    Rekening r{"Ani", 100'000};       // digit separator ' (C++14)
    r.setor(50'000);
    if (!r.tarik(500'000)) std::cout << "saldo tidak cukup\\n";

    const Rekening& lihat = r;        // lewat referensi const hanya fungsi const yang bisa dipanggil
    std::cout << lihat.pemilik() << ": " << lihat.saldo() << '\\n';   // Ani: 150000
    // lihat.setor(1);                // error kompilasi: setor bukan fungsi const
}`, 'cpp'),
      code('RAII: membungkus FILE* dari C', `#include <cstdio>
#include <stdexcept>
#include <string>

// Resource diambil di constructor, dilepas di destructor
class FileC {
public:
    FileC(const std::string& path, const char* mode) : f_(std::fopen(path.c_str(), mode)) {
        if (!f_) throw std::runtime_error("gagal membuka " + path);
    }
    ~FileC() { std::fclose(f_); }             // otomatis saat keluar scope, termasuk saat exception

    FileC(const FileC&) = delete;             // larang salin: dua objek menutup FILE* yang sama = double close
    FileC& operator=(const FileC&) = delete;

    void tulis(const std::string& teks) {
        if (std::fputs(teks.c_str(), f_) == EOF) throw std::runtime_error("gagal menulis");
    }

private:
    std::FILE* f_;
};

void ekspor(bool gagal_di_tengah) {
    FileC f{"laporan.txt", "w"};
    f.tulis("baris 1\\n");
    if (gagal_di_tengah) throw std::runtime_error("validasi gagal");   // file tetap ditutup
    f.tulis("baris 2\\n");
}   // ~FileC() berjalan di sini

int main() {
    try {
        ekspor(true);
    } catch (const std::exception& e) {
        std::puts(e.what());                  // validasi gagal
    }
}`, 'cpp'),
      table(['Kebutuhan', 'Gaya C', 'C++ modern'], [
        ['Mengubah argumen', '`void f(int *x)` + `f(&a)`', '`void f(int& x)` + `f(a)`'],
        ['Input besar read-only', '`const T *p`', '`const T&`'],
        ['String', '`char buf[64]` + `snprintf`', '`std::string` (+ `std::format`, C++20)'],
        ['Array dinamis', '`malloc` / `realloc` / `free`', '`std::vector<T>`'],
        ['Konstanta', '`#define N 10`', '`constexpr int N = 10;` (bertipe dan ber-scope)'],
        ['Pointer kosong', '`NULL`', '`nullptr`'],
        ['Membersihkan resource', '`goto cleanup` / `free` manual', 'Destructor (RAII), otomatis'],
        ['Error', 'Kode kembali + `errno`', 'Exception, atau `std::optional` / `std::expected` (C++23)'],
        ['Cetak', '`printf`', '`std::cout`, `std::format` (C++20), `std::print` (C++23)'],
      ]),
      callout('tip', 'Aturan praktis const-correctness', 'Tandai setiap member function yang tidak mengubah objek dengan `const`. Terima parameter tipe besar sebagai `const T&`, tipe kecil (int, double, pointer, `std::string_view`) sebagai nilai, dan tipe yang akan disimpan sebagai nilai lalu `std::move` ke field. Deklarasikan variabel lokal `const` bila tidak akan diubah. Compiler lalu menolak perubahan tak sengaja, dan pembaca langsung tahu fungsi mana yang aman (Core Guidelines bagian Con).'),
      ...quiz([
        ['CPP-14', 'Apa yang menjamin `laporan.txt` tetap ditutup walaupun `ekspor(true)` melempar exception?', 'Stack unwinding: saat exception keluar dari scope, destructor semua objek lokal yang sudah selesai dikonstruksi dipanggil dalam urutan terbalik. `~FileC()` memanggil `fclose`. Inilah inti RAII: pembersihan terikat pada umur objek, bukan pada jalur kode yang harus diingat programmer.'],
        ['CPP-15', 'Mengapa constructor `Rekening` memakai member initializer list alih-alih assignment di badan constructor?', 'Member diinisialisasi sebelum badan constructor berjalan. Tanpa initializer list, `pemilik_` dibuat kosong lalu di-assign ulang (kerja dua kali), dan member `const` atau reference tidak bisa di-assign sama sekali. Initializer list langsung mengonstruksi member dengan nilai akhir; urutannya mengikuti urutan deklarasi di class, bukan urutan di daftar.'],
        ['CPP-16', 'Mengapa copy constructor `FileC` di-`delete`?', 'Copy bawaan akan menyalin pointer `f_` sehingga dua objek memegang `FILE*` yang sama, dan keduanya memanggil `fclose` di destructor (double close, undefined behavior). Dengan `= delete`, compiler menolak penyalinan. Bila kepemilikan perlu dipindahkan, tambahkan move constructor (modul smart pointer).'],
      ]),
      ...practice('cpp-dari-c', [
        'Port program CSV dari modul C ke C++ memakai `std::ifstream`, `std::getline`, dan `std::string`, tanpa `malloc` atau `FILE*` sama sekali.',
        'Tambahkan `transfer(Rekening& ke, long long jumlah)` yang atomik secara logika: bila penarikan gagal, saldo kedua rekening tidak berubah.',
        'Tulis class RAII `Timer` yang mencetak durasi scope di destructor memakai `std::chrono::steady_clock`, lalu pakai untuk mengukur sebuah loop.',
        'Tandai semua fungsi yang bisa `const` di sebuah class milik Anda dan perbaiki error kompilasi yang muncul; catat bug yang ikut tertangkap.',
      ]),
      references(
        ['cppreference: Reference declaration', 'https://en.cppreference.com/w/cpp/language/reference'],
        ['cppreference: RAII', 'https://en.cppreference.com/w/cpp/language/raii'],
        ['cppreference: Constructors and member initializer lists', 'https://en.cppreference.com/w/cpp/language/constructor'],
        ['C++ Core Guidelines: Classes and class hierarchies', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-class'],
        ['C++ Core Guidelines: Constants and immutability', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-const'],
      ),
    ],
  },
  {
    id: 'cpp-stl',
    title: 'C++: STL — Container, Algorithm & Iterator',
    summary: 'vector, map vs unordered_map, set, string, iterator dan rentang [begin, end), algorithm (sort, find_if, count_if, accumulate, unique), erase_if, kompleksitas setiap operasi, dan iterator invalidation.',
    track: MODERN, source: cppSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Standard Template Library (STL) memisahkan tiga hal: **container** yang menyimpan data (`vector`, `map`, `unordered_map`, `set`, `deque`), **algorithm** yang bekerja pada data (`sort`, `find_if`, `accumulate`), dan **iterator** yang menghubungkan keduanya. Algorithm tidak tahu container apa yang dipakai; ia hanya menerima rentang setengah terbuka `[begin, end)`, persis seperti pointer arithmetic di C. Karena semuanya template, hasil kompilasinya secepat kode yang ditulis tangan.'),
      paragraph('Memilih container berarti memilih kompleksitas. Default yang benar hampir selalu `std::vector`: memorinya kontinu sehingga ramah cache CPU, bahkan sering mengalahkan `std::list` untuk penyisipan di tengah pada ukuran kecil sampai menengah. Pakai `unordered_map` untuk lookup kunci O(1) rata-rata, dan `map` atau `set` bila butuh urutan atau query rentang (`lower_bound`). Contoh dikompilasi dengan `g++ -std=c++20 -O2 -Wall -Wextra`.'),
      code('Frekuensi kata: unordered_map, sort dengan lambda, structured binding', `#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

int main() {
    std::unordered_map<std::string, int> frek;
    std::string kata;
    while (std::cin >> kata) {
        std::string bersih;
        for (unsigned char c : kata)
            if (std::isalnum(c)) bersih += static_cast<char>(std::tolower(c));
        if (!bersih.empty()) ++frek[bersih];      // operator[] menyisipkan 0 bila kunci belum ada
    }

    std::vector<std::pair<std::string, int>> urut(frek.begin(), frek.end());
    std::sort(urut.begin(), urut.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;   // frekuensi menurun
        return a.first < b.first;                               // seri: alfabetis
    });

    for (std::size_t i = 0; i < std::min<std::size_t>(5, urut.size()); ++i) {
        const auto& [k, n] = urut[i];             // structured binding (C++17)
        std::cout << k << ": " << n << '\\n';
    }
}

// echo "the cat and the hat, the end" | ./frek   →  the: 3, and: 1, cat: 1, end: 1, hat: 1`, 'cpp'),
      code('vector dan algorithm', `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

void cetak(const std::vector<int>& v) {
    for (int x : v) std::cout << x << ' ';
    std::cout << '\\n';
}

int main() {
    std::vector<int> v{5, 3, 8, 3, 1, 8, 9, 2};
    v.reserve(16);                                       // alokasi di depan bila ukuran bisa ditebak
    v.push_back(7);

    std::sort(v.begin(), v.end());                       // 1 2 3 3 5 7 8 8 9
    v.erase(std::unique(v.begin(), v.end()), v.end());   // idiom erase-unique → 1 2 3 5 7 8 9
    cetak(v);

    int total = std::accumulate(v.begin(), v.end(), 0);                         // 35
    auto genap = std::count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });   // 2
    auto it = std::find_if(v.begin(), v.end(), [](int x) { return x > 4; });
    if (it != v.end())
        std::cout << "pertama > 4: " << *it << " di indeks " << (it - v.begin()) << '\\n';   // 5 di indeks 3
    std::cout << "total=" << total << " genap=" << genap << '\\n';

    bool ada = std::binary_search(v.begin(), v.end(), 7);   // butuh data terurut: O(log n)
    std::erase_if(v, [](int x) { return x % 3 == 0; });     // C++20: menghapus 3 dan 9
    cetak(v);                                               // 1 2 5 7 8
    std::cout << std::boolalpha << ada << '\\n';            // true
}`, 'cpp'),
      code('map dan set terurut: lower_bound, contains, if dengan initializer', `#include <iostream>
#include <map>
#include <set>
#include <string>

int main() {
    // map terurut berdasarkan kunci (biasanya red-black tree): cocok untuk query rentang
    std::map<int, std::string> jadwal{{900, "standup"}, {1300, "review"}, {1600, "deploy"}};
    jadwal.emplace(1100, "pairing");
    jadwal.insert_or_assign(1300, "code review");      // timpa bila kunci sudah ada (C++17)

    auto berikut = jadwal.lower_bound(1200);           // kunci pertama >= 1200
    if (berikut != jadwal.end())
        std::cout << "setelah 12:00: " << berikut->first << ' ' << berikut->second << '\\n';   // 1300 code review

    for (const auto& [jam, acara] : jadwal) std::cout << jam << ' ' << acara << '\\n';   // terurut naik

    if (auto it = jadwal.find(1600); it != jadwal.end()) jadwal.erase(it);   // if dengan initializer (C++17)
    std::cout << std::boolalpha << jadwal.contains(1600) << '\\n';           // false — contains() sejak C++20

    std::set<std::string> tag{"cpp", "stl", "cpp", "algo"};   // duplikat dibuang, otomatis terurut
    for (const auto& t : tag) std::cout << t << ' ';           // algo cpp stl
    std::cout << '\\n';
}`, 'cpp'),
      table(['Container', 'Akses / cari', 'Sisip / hapus', 'Kapan dipakai'], [
        ['`vector`', 'Indeks O(1); cari O(n), O(log n) bila terurut', 'Belakang amortized O(1); tengah O(n)', 'Default untuk hampir semua kasus'],
        ['`deque`', 'Indeks O(1)', 'Depan dan belakang O(1)', 'Antrian dua arah, sliding window'],
        ['`list`', 'Tanpa indeks; cari O(n)', 'O(1) bila iterator posisi sudah ada', 'Jarang; butuh iterator yang stabil saat sisip/hapus'],
        ['`map` / `set`', 'O(log n)', 'O(log n)', 'Butuh urutan, `lower_bound`, min/max dinamis'],
        ['`unordered_map` / `unordered_set`', 'Rata-rata O(1), terburuk O(n)', 'Rata-rata O(1)', 'Lookup cepat tanpa butuh urutan'],
        ['`priority_queue`', '`top` O(1)', '`push` / `pop` O(log n)', 'Ambil elemen terbesar/terkecil berulang (heap)'],
        ['`string`', 'Indeks O(1); `find` O(n·m) terburuk', '`+=` amortized O(1)', 'Teks; `string_view` untuk parameter read-only'],
      ]),
      callout('warn', 'Iterator invalidation dan `operator[]`', '`push_back` pada `vector` bisa memindahkan seluruh isi ke blok memori baru, sehingga semua iterator, pointer, dan reference ke elemennya menjadi dangling. Jangan menyimpan `&v[0]` lalu menambah elemen, dan jangan menghapus elemen di dalam range-based for; pakai `std::erase_if` atau `it = v.erase(it)`. Ingat juga bahwa `m[k]` pada `map`/`unordered_map` **menyisipkan** kunci baru bila belum ada; untuk sekadar mengecek, pakai `find` atau `contains`.'),
      ...quiz([
        ['CPP-17', 'Apa beda `v.reserve(100)` dan `v.resize(100)`?', '`reserve` hanya menyiapkan kapasitas: `size()` tetap sama dan belum ada elemen baru, sehingga `push_back` berikutnya tidak perlu realokasi. `resize` benar-benar mengubah jumlah elemen menjadi 100 (elemen baru di-value-initialize, misalnya 0 untuk int). Mengakses `v[50]` setelah `reserve(100)` saja adalah undefined behavior.'],
        ['CPP-18', 'Kapan `std::map` lebih tepat daripada `std::unordered_map`, walaupun lebih lambat per operasi?', 'Saat Anda butuh kunci terurut: iterasi berurutan, `lower_bound`/`upper_bound` untuk query rentang (misalnya jadwal berikutnya setelah jam tertentu), atau min/max dinamis. Juga saat perilaku kasus terburuk penting, karena `map` dijamin O(log n) sedangkan hash table bisa merosot ke O(n) akibat banyak collision.'],
        ['CPP-19', 'Mengapa `std::sort(lst.begin(), lst.end())` tidak terkompilasi untuk `std::list`?', '`std::sort` membutuhkan random-access iterator (melompat `it + n` dalam O(1)), sedangkan iterator `list` hanya bidirectional. Gunakan member function `lst.sort()`, yang memakai merge sort khusus linked list.'],
      ]),
      ...practice('cpp-stl', [
        'Kembangkan program frekuensi kata agar membaca file lewat argumen dan menampilkan N kata teratas dengan `std::partial_sort`.',
        'Implementasikan "two sum" dengan `unordered_map` dalam O(n), lalu versi O(n log n) dengan `sort` + two pointers; bandingkan waktunya untuk n = 10^6.',
        'Buat sistem booking ruang: `std::map<int, int>` dari jam mulai ke jam selesai, tolak booking yang tumpang tindih memakai `lower_bound`.',
        'Tulis contoh yang sengaja menyimpan iterator `vector` lalu memanggil `push_back`, jalankan dengan `-fsanitize=address -D_GLIBCXX_DEBUG`, dan catat pesan yang muncul.',
      ]),
      references(
        ['cppreference: Containers library', 'https://en.cppreference.com/w/cpp/container'],
        ['cppreference: Algorithms library', 'https://en.cppreference.com/w/cpp/algorithm'],
        ['cppreference: Iterator library', 'https://en.cppreference.com/w/cpp/iterator'],
        ['C++ Core Guidelines: SL.con (containers)', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#SS-con'],
      ),
    ],
  },
  {
    id: 'cpp-smart-pointer-move',
    title: 'C++: Smart Pointer & Move Semantics',
    summary: 'unique_ptr dan make_unique, shared_ptr & weak_ptr (siklus referensi), custom deleter, lvalue vs rvalue, std::move, move constructor noexcept, rule of zero, rule of five, dan copy-and-swap.',
    track: MODERN, source: cppSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Smart pointer adalah RAII untuk memori heap. `std::unique_ptr<T>` adalah **pemilik tunggal**: tidak bisa disalin, hanya dipindahkan, dan tanpa overhead dibanding raw pointer. `std::shared_ptr<T>` memakai **reference counting**: objek dihapus saat pemilik terakhir hilang, dengan biaya counter atomik. `std::weak_ptr<T>` mengamati objek milik `shared_ptr` tanpa ikut memiliki, dipakai untuk memutus siklus. Di C++ modern, `new` dan `delete` hampir tidak pernah ditulis langsung.'),
      paragraph('**Move semantics** (C++11) memungkinkan "mencuri" isi objek sementara alih-alih menyalinnya. Ekspresi bernama adalah lvalue; objek sementara atau hasil `std::move(x)` adalah rvalue. Bila tipe punya move constructor, mengembalikan `std::vector` berisi sejuta elemen atau memasukkannya ke container cukup memindahkan tiga pointer. Perlu dicatat, `std::move` sendiri **tidak memindahkan apa pun**: ia hanya cast ke rvalue reference agar overload move yang terpilih.'),
      code('unique_ptr: factory, polimorfisme, dan transfer kepemilikan', `#include <iostream>
#include <memory>
#include <string>
#include <utility>
#include <vector>

struct Notifikasi {
    virtual ~Notifikasi() = default;          // destructor virtual: wajib bila dihapus lewat pointer base
    virtual void kirim(const std::string& pesan) const = 0;
};

struct Email : Notifikasi {
    void kirim(const std::string& pesan) const override { std::cout << "[email] " << pesan << '\\n'; }
};

struct Sms : Notifikasi {
    void kirim(const std::string& pesan) const override { std::cout << "[sms] " << pesan << '\\n'; }
};

std::unique_ptr<Notifikasi> buat(const std::string& jenis) {   // factory: pemanggil menjadi pemilik
    if (jenis == "email") return std::make_unique<Email>();
    if (jenis == "sms") return std::make_unique<Sms>();
    return nullptr;
}

void pakai(const Notifikasi& n) { n.kirim("halo"); }          // hanya meminjam: terima reference

int main() {
    std::vector<std::unique_ptr<Notifikasi>> kanal;
    kanal.push_back(buat("email"));            // objek sementara: otomatis di-move
    kanal.push_back(buat("sms"));

    auto satu = buat("email");
    // auto salinan = satu;                    // error: unique_ptr tidak bisa disalin
    kanal.push_back(std::move(satu));          // pindahkan kepemilikan; 'satu' kini nullptr
    std::cout << std::boolalpha << (satu == nullptr) << '\\n';   // true

    for (const auto& k : kanal) pakai(*k);
}   // semua objek dihapus otomatis saat vector dihancurkan`, 'cpp'),
      code('shared_ptr dan weak_ptr: memutus siklus referensi', `#include <iostream>
#include <memory>
#include <string>
#include <vector>

struct Karyawan;

struct Tim {
    std::string nama;
    std::vector<std::shared_ptr<Karyawan>> anggota;   // tim MEMILIKI anggota
    ~Tim() { std::cout << "Tim " << nama << " dihapus\\n"; }
};

struct Karyawan {
    std::string nama;
    std::weak_ptr<Tim> tim;           // hanya MENGAMATI tim: tidak menambah reference count
    ~Karyawan() { std::cout << "Karyawan " << nama << " dihapus\\n"; }
};

int main() {
    auto tim = std::make_shared<Tim>();     // satu alokasi untuk objek + control block
    tim->nama = "Backend";
    auto budi = std::make_shared<Karyawan>();
    budi->nama = "Budi";
    budi->tim = tim;
    tim->anggota.push_back(budi);

    std::cout << "use_count budi = " << budi.use_count() << '\\n';   // 2: variabel budi + vector
    if (auto t = budi->tim.lock())          // lock(): shared_ptr sementara, kosong bila tim sudah dihapus
        std::cout << budi->nama << " di tim " << t->nama << '\\n';
}   // Kedua destructor tercetak. Bila Karyawan::tim berupa shared_ptr, terbentuk siklus
    // dan tidak ada destructor yang terpanggil: memory leak walaupun memakai smart pointer.`, 'cpp'),
      code('Rule of five: Buffer dengan copy dan move', `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <utility>

class Buffer {
public:
    explicit Buffer(std::size_t n) : size_(n), data_(new int[n]{}) {}
    ~Buffer() { delete[] data_; }

    Buffer(const Buffer& lain) : size_(lain.size_), data_(new int[lain.size_]) {   // copy: deep copy
        std::copy(lain.data_, lain.data_ + size_, data_);
    }
    Buffer& operator=(const Buffer& lain) {          // copy assignment: copy-and-swap, aman dari self-assign
        Buffer salinan(lain);
        swap(salinan);
        return *this;
    }
    Buffer(Buffer&& lain) noexcept                   // move: ambil pointer, O(1)
        : size_(std::exchange(lain.size_, 0)), data_(std::exchange(lain.data_, nullptr)) {}
    Buffer& operator=(Buffer&& lain) noexcept {
        Buffer sementara(std::move(lain));
        swap(sementara);
        return *this;
    }

    void swap(Buffer& lain) noexcept {
        std::swap(size_, lain.size_);
        std::swap(data_, lain.data_);
    }
    std::size_t size() const { return size_; }
    int& operator[](std::size_t i) { return data_[i]; }

private:
    std::size_t size_;      // urutan deklarasi = urutan inisialisasi
    int* data_;
};

int main() {
    Buffer a(1'000'000);
    a[0] = 7;
    Buffer b = a;               // copy: alokasi baru + salin 1 juta int
    Buffer c = std::move(a);    // move: hanya memindahkan pointer; a kini kosong (size 0)
    std::cout << b[0] << ' ' << c[0] << ' ' << a.size() << '\\n';   // 7 7 0
}`, 'cpp'),
      code('Rule of zero dan unique_ptr dengan custom deleter', `#include <cstdio>
#include <memory>
#include <string>
#include <utility>
#include <vector>

// Rule of zero: semua member sudah mengelola dirinya sendiri, jadi tidak perlu menulis
// destructor, copy, atau move. Versi buatan compiler sudah benar.
struct Pesanan {
    std::string id;
    std::vector<std::string> item;
};

// Untuk resource C, beri unique_ptr deleter khusus alih-alih menulis class RAII manual
struct TutupFile {
    void operator()(std::FILE* f) const noexcept { std::fclose(f); }   // hanya dipanggil bila f != nullptr
};
using FilePtr = std::unique_ptr<std::FILE, TutupFile>;

int main() {
    Pesanan p{"INV-1", {"kopi", "roti"}};
    Pesanan q = p;                  // copy otomatis (deep copy string dan vector)
    Pesanan r = std::move(p);       // move otomatis
    FilePtr f{std::fopen("log.txt", "w")};
    if (f) std::fputs("ok\\n", f.get());
    return q.item.size() == r.item.size() ? 0 : 1;
}`, 'cpp'),
      table(['Kebutuhan', 'Pilihan', 'Catatan'], [
        ['Objek cukup hidup di scope atau sebagai member', 'Nilai biasa (`T x;`)', 'Paling sederhana dan tercepat; pilih ini dulu'],
        ['Satu pemilik, objek di heap (polimorfisme, ukuran besar, pimpl)', '`std::unique_ptr<T>` + `std::make_unique`', 'Tanpa overhead; hanya bisa di-move'],
        ['Kepemilikan benar-benar bersama, umur tidak bisa ditentukan satu pihak', '`std::shared_ptr<T>` + `std::make_shared`', 'Counter atomik; jangan jadikan default'],
        ['Mengamati objek milik `shared_ptr` / memutus siklus / cache', '`std::weak_ptr<T>`', 'Akses lewat `lock()`'],
        ['Meminjam tanpa memiliki', '`T&`, `const T&`, atau `T*` (boleh null)', 'Raw pointer = non-owning, tidak pernah di-`delete`'],
        ['Resource C (`FILE*`, handle)', '`std::unique_ptr<T, Deleter>`', 'Deleter dipanggil saat pointer keluar scope'],
      ]),
      callout('warn', 'Jebakan move', 'Setelah `std::move(x)`, objek standar seperti `std::string` dan `std::vector` berada dalam keadaan **valid tetapi tidak ditentukan**: hanya boleh di-assign ulang atau dihancurkan. Jangan menulis `return std::move(lokal);` karena justru menghalangi copy elision (NRVO). Tandai move constructor dan move assignment dengan `noexcept`; bila tidak, `std::vector` akan **menyalin** elemen saat realokasi demi strong exception guarantee.'),
      ...quiz([
        ['CPP-20', 'Mengapa `noexcept` pada move constructor memengaruhi performa `std::vector`?', 'Saat kapasitas penuh, `vector` memindahkan elemen ke blok baru. Agar tetap memberi strong exception guarantee, ia memakai `std::move_if_noexcept`: bila move constructor tidak `noexcept` (dan tipe bisa disalin), elemen **disalin**, karena move yang gagal di tengah jalan tidak bisa dibatalkan. Dengan `noexcept`, realokasi cukup memindahkan pointer.'],
        ['CPP-21', 'Bagaimana dua `shared_ptr` yang saling menunjuk bisa membuat memory leak?', 'Masing-masing menahan reference count objek lain minimal 1. Saat semua variabel luar hilang, count keduanya tidak pernah mencapai 0, sehingga destructor tidak dipanggil. Putus siklus dengan menjadikan salah satu arah (biasanya anak ke induk atau pengamat) `weak_ptr`.'],
        ['CPP-22', 'Apa itu rule of zero dan kapan rule of five diperlukan?', 'Rule of zero: bila semua member adalah tipe yang mengelola resource-nya sendiri (`string`, `vector`, `unique_ptr`), jangan tulis destructor, copy, atau move; versi bawaan sudah benar. Rule of five berlaku saat class mengelola resource mentah secara langsung: bila Anda menulis salah satu dari destructor, copy constructor, copy assignment, move constructor, atau move assignment, Anda hampir pasti perlu mendefinisikan (atau `= delete`) kelimanya.'],
      ]),
      ...practice('cpp-smart-ptr', [
        'Ganti semua `new`/`delete` di sebuah program C++ lama (atau linked list dari modul C) dengan `std::unique_ptr`; pastikan ASan bersih.',
        'Tambahkan pencetakan di setiap special member `Buffer`, lalu amati kapan copy dan move terjadi saat `push_back` ke `std::vector<Buffer>`, dengan dan tanpa `noexcept`.',
        'Implementasikan tree dengan `std::unique_ptr<Node>` untuk anak dan raw pointer non-owning `Node*` untuk induk, lalu tulis traversal dari daun ke akar.',
        'Buat siklus `shared_ptr` yang sengaja bocor, buktikan dengan LeakSanitizer, kemudian perbaiki memakai `weak_ptr`.',
      ]),
      references(
        ['cppreference: std::unique_ptr', 'https://en.cppreference.com/w/cpp/memory/unique_ptr'],
        ['cppreference: std::shared_ptr', 'https://en.cppreference.com/w/cpp/memory/shared_ptr'],
        ['cppreference: The rule of three/five/zero', 'https://en.cppreference.com/w/cpp/language/rule_of_three'],
        ['cppreference: Move constructors', 'https://en.cppreference.com/w/cpp/language/move_constructor'],
        ['C++ Core Guidelines: Resource management', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-resource'],
      ),
    ],
  },
  {
    id: 'cpp-template-concepts',
    title: 'C++: Template, Concepts, Lambda & Ranges',
    summary: 'Function & class template, non-type template parameter, concepts dan requires-expression (C++20), abbreviated function template, lambda (capture, mutable, generic), serta pipeline ranges/views yang lazy.',
    track: MODERN, source: cppSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Template adalah cara C++ menulis kode generik: compiler membuat salinan khusus untuk setiap tipe yang dipakai (*instantiation*), sehingga `std::vector<int>` dan `std::vector<std::string>` sama cepatnya dengan kode yang ditulis tangan untuk masing-masing tipe. Kelemahan historisnya adalah pesan error: memanggil template dengan tipe yang salah dulu menghasilkan ratusan baris error dari dalam pustaka. **Concepts** (C++20) memperbaikinya dengan menyatakan syarat tipe secara eksplisit di signature, sehingga error muncul di titik pemanggilan dan menyebut syarat yang gagal.'),
      paragraph('**Lambda** adalah fungsi anonim yang bisa menangkap (capture) variabel di sekitarnya; compiler mengubahnya menjadi objek class dengan `operator()`. Lambda adalah bahan bakar algorithm STL dan **ranges** (C++20), yang memungkinkan pipeline gaya `filter | transform | take` seperti Stream API di Java, tetapi lazy dan tanpa alokasi sementara. Kompilasi dengan `g++ -std=c++20 -Wall -Wextra` (GCC 12+ atau Clang 16+ untuk ranges yang lengkap).'),
      code('Function template, concept, dan requires-expression', `#include <concepts>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

// Template klasik: T dideduksi dari argumen
template <typename T>
T terbesar(const std::vector<T>& xs) {
    T hasil = xs.at(0);                       // at(): lempar std::out_of_range bila kosong
    for (const auto& x : xs)
        if (hasil < x) hasil = x;
    return hasil;
}

// Concept (C++20): syarat tipe yang dicek di titik pemanggilan
template <typename T>
concept Angka = std::integral<T> || std::floating_point<T>;

template <Angka T>
T rata(const std::vector<T>& xs) {
    T total{};
    for (T x : xs) total += x;
    return xs.empty() ? T{} : total / static_cast<T>(xs.size());
}

// requires-expression: "punya size(), begin(), end()"
template <typename C>
concept Koleksi = requires(const C& c) {
    { c.size() } -> std::convertible_to<std::size_t>;
    c.begin();
    c.end();
};

void cetak(const Koleksi auto& c) {           // abbreviated function template (C++20)
    std::cout << '[' << c.size() << "] ";
    for (const auto& x : c) std::cout << x << ' ';
    std::cout << '\\n';
}

int main() {
    std::vector<int> v{3, 9, 4};
    std::vector<std::string> s{"apel", "zebra", "mangga"};
    std::cout << terbesar(v) << ' ' << terbesar(s) << '\\n';          // 9 zebra
    std::cout << rata(std::vector<double>{1.0, 2.0, 4.0}) << '\\n';   // 2.33333
    cetak(s);                                                         // [3] apel zebra mangga
    // rata(s);   // error: std::string tidak memenuhi concept 'Angka' — pesan menyebut concept yang gagal
}`, 'cpp'),
      code('Class template dengan non-type parameter: RingBuffer', `#include <array>
#include <cstddef>
#include <iostream>
#include <optional>

template <typename T, std::size_t N>          // N diketahui saat kompilasi
class RingBuffer {
    static_assert(N > 0, "kapasitas harus > 0");

public:
    void push(const T& x) {
        data_[(awal_ + ukuran_) % N] = x;
        if (ukuran_ < N) ++ukuran_;
        else awal_ = (awal_ + 1) % N;          // penuh: timpa elemen tertua
    }
    std::optional<T> pop() {
        if (ukuran_ == 0) return std::nullopt;
        T x = data_[awal_];
        awal_ = (awal_ + 1) % N;
        --ukuran_;
        return x;
    }
    std::size_t size() const { return ukuran_; }

private:
    std::array<T, N> data_{};                 // tanpa alokasi heap
    std::size_t awal_ = 0, ukuran_ = 0;
};

int main() {
    RingBuffer<int, 3> rb;
    for (int i = 1; i <= 5; ++i) rb.push(i);  // 1 dan 2 tertimpa
    while (auto x = rb.pop()) std::cout << *x << ' ';   // 3 4 5
    std::cout << '\\n';
}`, 'cpp'),
      code('Lambda: capture, mutable, generic, rekursif', `#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>

int main() {
    int ambang = 50;
    std::vector<int> nilai{70, 45, 90, 30, 55};

    auto lulus = [ambang](int n) { return n >= ambang; };   // by value: salinan saat lambda dibuat
    std::cout << std::count_if(nilai.begin(), nilai.end(), lulus) << '\\n';   // 3

    int total = 0;
    std::for_each(nilai.begin(), nilai.end(), [&total](int n) { total += n; });   // by reference
    std::cout << total << '\\n';                            // 290

    auto penghitung = [n = 0]() mutable { return ++n; };    // init capture + mutable: state milik lambda
    penghitung();
    std::cout << penghitung() << '\\n';                     // 2

    auto tambah = [](auto a, auto b) { return a + b; };     // generic lambda (C++14)
    std::cout << tambah(1, 2) << ' ' << tambah(std::string("a"), std::string("b")) << '\\n';   // 3 ab

    // Rekursi lewat std::function (C++23 juga punya "deducing this" untuk lambda rekursif)
    std::function<int(int)> fib = [&fib](int k) { return k < 2 ? k : fib(k - 1) + fib(k - 2); };
    std::cout << fib(10) << '\\n';                          // 55
}`, 'cpp'),
      code('Ranges: projection dan pipeline lazy', `#include <algorithm>
#include <iostream>
#include <ranges>
#include <string>
#include <vector>

struct Produk {
    std::string nama;
    int harga;
    int stok;
};

int main() {
    std::vector<Produk> katalog{
        {"kopi", 25'000, 10}, {"teh", 15'000, 0}, {"roti", 20'000, 5}, {"susu", 18'000, 3},
    };

    std::ranges::sort(katalog, {}, &Produk::harga);   // projection: urutkan berdasarkan harga

    // Lazy: tidak ada vector sementara; elemen diproses satu per satu saat di-iterate
    auto tersedia = katalog
        | std::views::filter([](const Produk& p) { return p.stok > 0; })
        | std::views::transform([](const Produk& p) { return p.nama; })
        | std::views::take(2);

    for (const auto& nama : tersedia) std::cout << nama << ' ';   // susu roti
    std::cout << '\\n';

    auto termahal = std::ranges::max_element(katalog, {}, &Produk::harga);
    std::cout << termahal->nama << '\\n';              // kopi

    for (int i : std::views::iota(1, 6) | std::views::reverse) std::cout << i << ' ';   // 5 4 3 2 1
    std::cout << '\\n';
}`, 'cpp'),
      table(['Capture', 'Arti', 'Catatan'], [
        ['`[]`', 'Tidak menangkap apa pun', 'Bisa dikonversi ke pointer fungsi biasa'],
        ['`[x]` / `[=]`', 'Salin `x` / salin semua yang dipakai', 'Salinan dibuat saat lambda dibuat, read-only kecuali `mutable`'],
        ['`[&x]` / `[&]`', 'Reference ke `x` / ke semua yang dipakai', 'Dangling bila lambda hidup lebih lama dari variabelnya'],
        ['`[this]`', 'Menangkap pointer objek', 'Akses member; dangling bila objek dihancurkan lebih dulu'],
        ['`[*this]` (C++17)', 'Menyalin seluruh objek', 'Aman untuk callback asinkron'],
        ['`[n = expr]`, `[p = std::move(p)]`', 'Init capture (C++14)', 'Cara memindahkan `unique_ptr` ke dalam lambda'],
      ]),
      callout('warn', 'Dangling di lambda dan views', 'Lambda dengan `[&]` yang disimpan (dikirim ke thread, callback, atau dikembalikan dari fungsi) menyimpan reference ke variabel lokal yang mungkin sudah hilang. Begitu pula views: `views` tidak memiliki data, jadi pipeline yang dibangun di atas vector sementara (`buatVector() | std::views::filter(...)`) bisa menunjuk memori yang sudah dibebaskan. Simpan datanya di variabel bernama dulu, atau materialisasi hasilnya dengan `std::ranges::to<std::vector>()` (C++23).'),
      ...quiz([
        ['CPP-23', 'Apa keuntungan `template <Angka T>` dibanding `template <typename T>` biasa untuk fungsi `rata`?', 'Syarat tipe menjadi bagian dari antarmuka: pembaca tahu tipe apa yang diterima, dan memanggil `rata` dengan `std::string` langsung gagal di titik pemanggilan dengan pesan "constraints not satisfied ... Angka", bukan error panjang dari dalam badan fungsi. Concept juga bisa dipakai untuk overloading: compiler memilih overload dengan constraint yang lebih spesifik.'],
        ['CPP-24', 'Pada pipeline `filter | transform | take(2)`, berapa kali lambda `transform` dipanggil untuk katalog di atas?', 'Dua kali. Views bersifat lazy: elemen ditarik satu per satu saat loop berjalan, dan `take(2)` berhenti setelah dua elemen lolos. Lambda `filter` dipanggil sampai dua elemen ditemukan (teh ditolak, susu dan roti lolos), sedangkan kopi tidak pernah diproses sama sekali.'],
      ]),
      ...practice('cpp-template', [
        'Tulis concept `Hashable` (punya `std::hash<T>` yang valid) dan fungsi `hitung_unik(const std::vector<T>&)` memakai `unordered_set`; uji dengan tipe yang tidak memenuhi concept dan baca pesan error-nya.',
        'Tambahkan iterator (`begin`/`end`) pada `RingBuffer` agar bisa dipakai di range-based for dan `std::ranges::count_if`.',
        'Tulis ulang tiga loop dari program Anda sebelumnya menjadi pipeline ranges, lalu bandingkan keterbacaan dan hasil `-O2` di Compiler Explorer (godbolt.org).',
        'Buat `debounce` sederhana: fungsi yang menerima lambda dan mengembalikan lambda baru yang mengabaikan panggilan bila belum lewat 100 ms sejak panggilan terakhir.',
      ]),
      references(
        ['cppreference: Templates', 'https://en.cppreference.com/w/cpp/language/templates'],
        ['cppreference: Constraints and concepts', 'https://en.cppreference.com/w/cpp/language/constraints'],
        ['cppreference: Lambda expressions', 'https://en.cppreference.com/w/cpp/language/lambda'],
        ['cppreference: Ranges library', 'https://en.cppreference.com/w/cpp/ranges'],
        ['C++ Core Guidelines: Templates and generic programming', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-templates'],
      ),
    ],
  },
  {
    id: 'cpp-concurrency',
    title: 'C++: Concurrency — thread, mutex, atomic, jthread & async',
    summary: 'std::thread dan join, data race sebagai undefined behavior, mutex dengan lock_guard/scoped_lock, condition_variable untuk antrian producer-consumer, std::atomic, jthread & stop_token (C++20), serta std::async dan future.',
    track: MODERN, source: cppSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Sejak C++11, standar memiliki **memory model** dan pustaka thread sendiri, sehingga kode concurrent portabel tanpa `pthread` atau WinAPI langsung. Aturan terpentingnya: bila dua thread mengakses lokasi memori yang sama, setidaknya satu menulis, dan tidak ada sinkronisasi (mutex atau atomic), itu adalah **data race** dan hasilnya undefined behavior, bukan sekadar "angkanya kadang meleset". Compiler dan CPU bebas mengatur ulang operasi selama hasilnya sama untuk satu thread.'),
      paragraph('Alat yang tersedia berlapis: `std::mutex` untuk melindungi data bersama, `std::condition_variable` untuk menunggu kondisi, `std::atomic` untuk counter dan flag tanpa lock, `std::jthread` (C++20) yang otomatis di-join dan bisa dihentikan secara kooperatif, serta `std::async` untuk menjalankan tugas dan mengambil hasilnya lewat `std::future`. Teori di baliknya dibahas di [Concurrency & Memory Model](#lld.fase-2-concurrency-memory-model). Kompilasi dengan `g++ -std=c++20 -O2 -pthread file.cpp`.'),
      code('Data race vs mutex', `#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    long long tanpa_kunci = 0;
    long long dengan_kunci = 0;
    std::mutex m;

    std::vector<std::thread> pekerja;
    for (int t = 0; t < 4; ++t) {
        pekerja.emplace_back([&] {
            for (int i = 0; i < 100'000; ++i) {
                ++tanpa_kunci;                          // DATA RACE: undefined behavior
                std::lock_guard<std::mutex> kunci(m);   // lock di sini, unlock otomatis di akhir iterasi
                ++dengan_kunci;
            }
        });
    }
    for (auto& th : pekerja) th.join();   // wajib join/detach sebelum std::thread dihancurkan, atau std::terminate

    std::cout << "tanpa kunci : " << tanpa_kunci << " (sering < 400000)\\n";
    std::cout << "dengan kunci: " << dengan_kunci << '\\n';   // selalu 400000
}

// g++ -std=c++20 -g -O1 -fsanitize=thread -pthread race.cpp -o race && ./race
// → "WARNING: ThreadSanitizer: data race" menunjuk baris ++tanpa_kunci`, 'cpp'),
      code('atomic dan jthread dengan stop_token', `#include <atomic>
#include <chrono>
#include <iostream>
#include <stop_token>
#include <thread>

int main() {
    std::atomic<int> detak{0};
    {
        std::jthread pemantau([&detak](std::stop_token st) {   // C++20
            while (!st.stop_requested()) {
                detak.fetch_add(1, std::memory_order_relaxed);    // sekadar hitungan: relaxed cukup
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
        });
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }   // destructor jthread: request_stop() lalu join() otomatis
    std::cout << "detak sekitar 10: " << detak.load() << '\\n';
}`, 'cpp'),
      code('std::async dan future', `#include <cstddef>
#include <functional>
#include <future>
#include <iostream>
#include <numeric>
#include <vector>

long long jumlah(const std::vector<int>& v, std::size_t dari, std::size_t sampai) {
    return std::accumulate(v.begin() + dari, v.begin() + sampai, 0LL);
}

int main() {
    std::vector<int> data(10'000'000, 1);
    std::size_t tengah = data.size() / 2;

    // launch::async memaksa thread baru; tanpa itu implementasi boleh menunda (deferred)
    auto kiri = std::async(std::launch::async, jumlah, std::cref(data), std::size_t{0}, tengah);
    long long kanan = jumlah(data, tengah, data.size());
    std::cout << kiri.get() + kanan << '\\n';   // get() menunggu; exception di thread lain dilempar ulang di sini
}`, 'cpp'),
      code('Antrian thread-safe dengan condition_variable', `#include <condition_variable>
#include <iostream>
#include <mutex>
#include <optional>
#include <queue>
#include <thread>
#include <utility>

template <typename T>
class AntrianAman {
public:
    void push(T x) {
        {
            std::lock_guard kunci(m_);            // CTAD: std::lock_guard<std::mutex>
            q_.push(std::move(x));
        }
        cv_.notify_one();                         // notify setelah unlock: thread yang bangun tidak langsung menunggu lock
    }
    void tutup() {
        {
            std::lock_guard kunci(m_);
            tertutup_ = true;
        }
        cv_.notify_all();
    }
    std::optional<T> pop() {                      // blok sampai ada data atau antrian ditutup
        std::unique_lock kunci(m_);
        cv_.wait(kunci, [this] { return !q_.empty() || tertutup_; });   // predikat: aman dari spurious wakeup
        if (q_.empty()) return std::nullopt;
        T x = std::move(q_.front());
        q_.pop();
        return x;
    }

private:
    std::mutex m_;
    std::condition_variable cv_;
    std::queue<T> q_;
    bool tertutup_ = false;
};

int main() {
    AntrianAman<int> antrian;
    std::jthread konsumen([&antrian] {
        long long total = 0;
        while (auto x = antrian.pop()) total += *x;
        std::cout << "total = " << total << '\\n';   // 5050
    });
    for (int i = 1; i <= 100; ++i) antrian.push(i);
    antrian.tutup();
}   // konsumen dihancurkan (dan di-join) sebelum antrian, karena dideklarasikan sesudahnya`, 'cpp'),
      table(['Primitif', 'Kegunaan', 'Catatan'], [
        ['`std::thread`', 'Menjalankan fungsi di thread baru', 'Harus `join()` atau `detach()`; bila tidak, destructor memanggil `std::terminate`'],
        ['`std::jthread` (C++20)', 'Thread yang otomatis join + `stop_token`', 'Pilihan default untuk kode baru'],
        ['`std::mutex` + `lock_guard` / `unique_lock`', 'Melindungi critical section', '`unique_lock` bisa di-unlock manual dan dipakai `condition_variable`'],
        ['`std::scoped_lock` (C++17)', 'Mengunci beberapa mutex sekaligus', 'Memakai algoritma penghindar deadlock'],
        ['`std::condition_variable`', 'Menunggu kondisi tertentu', 'Selalu `wait` dengan predikat'],
        ['`std::atomic<T>`', 'Counter, flag, pointer tanpa lock', 'Default `memory_order_seq_cst`; relaxed hanya untuk hitungan murni'],
        ['`std::async` / `std::future`', 'Tugas dengan nilai kembali', 'Future dari `async` memblokir di destructor sampai tugas selesai'],
        ['`std::latch`, `std::barrier`, `std::counting_semaphore` (C++20)', 'Koordinasi sekelompok thread', 'Mengganti banyak pola manual dengan cv'],
      ]),
      callout('tip', 'Sanitizer dan deadlock', 'Jalankan test concurrent di bawah **ThreadSanitizer** (`-fsanitize=thread`, Linux/macOS; tidak bisa digabung dengan ASan dalam satu build). Hindari deadlock dengan mengunci beberapa mutex lewat `std::scoped_lock lk(m1, m2);`, jangan memanggil kode asing (callback) sambil memegang lock, dan buat critical section sekecil mungkin. Core Guidelines CP.20: pakai RAII, jangan pernah `lock()`/`unlock()` manual.'),
      ...quiz([
        ['CPP-25', 'Mengapa `cv_.wait(kunci, predikat)` lebih benar daripada `cv_.wait(kunci)` lalu langsung mengambil data?', 'Thread bisa bangun tanpa notifikasi (spurious wakeup), atau notifikasinya sudah "dikonsumsi" thread lain yang lebih dulu mengambil data. Versi dengan predikat setara dengan `while (!predikat()) wait(kunci);`, sehingga kondisi selalu dicek ulang sambil memegang lock sebelum melanjutkan.'],
        ['CPP-26', 'Apakah `++tanpa_kunci` aman bila variabelnya `volatile long long`?', 'Tidak. `volatile` hanya mencegah compiler menghapus atau menggabungkan akses (untuk memory-mapped I/O), tetapi tidak membuat operasi baca-ubah-tulis menjadi atomik dan tidak memberi jaminan urutan antar thread. Tetap data race. Gunakan `std::atomic<long long>` atau mutex.'],
        ['CPP-27', 'Apa keunggulan `std::jthread` dibanding `std::thread`?', 'Destructor `jthread` meminta berhenti (`request_stop`) lalu `join` otomatis, sehingga lupa join tidak lagi berakhir `std::terminate` dan exception di tengah fungsi tidak meninggalkan thread liar. Ia juga mengirim `std::stop_token` ke fungsi thread untuk pembatalan kooperatif tanpa flag atomik buatan sendiri.'],
      ]),
      ...practice('cpp-concurrency', [
        'Jalankan contoh data race dengan `-fsanitize=thread`, baca laporannya, lalu perbaiki dengan `std::atomic` dan bandingkan waktunya dengan versi mutex.',
        'Kembangkan `AntrianAman` menjadi bounded queue (kapasitas maksimum) dengan dua condition variable: `tidak_penuh` dan `tidak_kosong`.',
        'Buat thread pool sederhana: N `jthread` mengambil `std::function<void()>` dari `AntrianAman`, dan `submit()` mengembalikan `std::future` lewat `std::packaged_task`.',
        'Hitung jumlah bilangan prima di bawah 10^7 dengan 1, 2, 4, dan 8 tugas `std::async`; catat speedup dan jelaskan mengapa tidak linear.',
      ]),
      references(
        ['cppreference: Concurrency support library', 'https://en.cppreference.com/w/cpp/thread'],
        ['cppreference: std::jthread', 'https://en.cppreference.com/w/cpp/thread/jthread'],
        ['cppreference: std::atomic', 'https://en.cppreference.com/w/cpp/atomic/atomic'],
        ['cppreference: Memory model', 'https://en.cppreference.com/w/cpp/language/memory_model'],
        ['C++ Core Guidelines: Concurrency and parallelism', 'https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-concurrency'],
        ['Clang: ThreadSanitizer', 'https://clang.llvm.org/docs/ThreadSanitizer.html'],
      ),
    ],
  },
  {
    id: 'cpp-tooling',
    title: 'C++: Tooling — CMake, Package Manager, Test, Sanitizer & clang-tidy',
    summary: 'CMake modern berbasis target, FetchContent, vcpkg dan Conan secara singkat, unit test dengan GoogleTest (dan Catch2), build sanitizer terpisah, compile_commands.json, clang-tidy, dan clang-format.',
    track: MODERN, source: cppSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Makefile tulisan tangan cepat menjadi rumit begitu proyek harus dibangun di Linux, macOS, dan Windows (MSVC), memakai pustaka pihak ketiga, dan menjalankan test di CI. **CMake** adalah standar de facto: ia bukan build system, melainkan *generator* yang menulis file Ninja, Makefile, atau solusi Visual Studio. CMake modern berpusat pada **target** (`add_library`, `add_executable`) dengan properti yang menular lewat `target_link_libraries`, bukan variabel global.'),
      paragraph('C++ tidak punya package manager resmi; dua yang paling umum adalah **vcpkg** (Microsoft) dan **Conan**. Untuk test, **GoogleTest** dan **Catch2** paling populer. Lengkapi dengan sanitizer di build Debug dan **clang-tidy** untuk analisis statis. Semua alat ini membaca `compile_commands.json`, yang juga dipakai editor (clangd, VS Code) untuk autocomplete yang akurat.'),
      code('CMakeLists.txt: library, executable, sanitizer, GoogleTest', `cmake_minimum_required(VERSION 3.24)
project(inventori VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)             # -std=c++20, bukan gnu++20
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)     # compile_commands.json untuk clangd & clang-tidy

option(INVENTORI_SANITIZE "Build dengan ASan + UBSan" OFF)
if(INVENTORI_SANITIZE AND NOT MSVC)
  # add_compile_options hanya berlaku untuk target yang dibuat SETELAH baris ini
  add_compile_options(-fsanitize=address,undefined -fno-omit-frame-pointer)
  add_link_options(-fsanitize=address,undefined)
endif()

add_library(inventori_core src/stok.cpp)
target_include_directories(inventori_core PUBLIC include)   # PUBLIC: ikut menular ke pemakai
if(MSVC)
  target_compile_options(inventori_core PRIVATE /W4 /permissive-)
else()
  target_compile_options(inventori_core PRIVATE -Wall -Wextra -Wpedantic)
endif()

add_executable(inventori src/main.cpp)
target_link_libraries(inventori PRIVATE inventori_core)

# Test: GoogleTest diunduh saat configure
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.17.0.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)   # Windows/MSVC: samakan runtime CRT
FetchContent_MakeAvailable(googletest)

enable_testing()
add_executable(inventori_test tests/stok_test.cpp)
target_link_libraries(inventori_test PRIVATE inventori_core GTest::gtest_main)
include(GoogleTest)
gtest_discover_tests(inventori_test)`, 'text'),
      code('include/stok.h, src/stok.cpp, dan tests/stok_test.cpp', `// ===== include/stok.h =====
#pragma once
#include <map>
#include <string>

class Stok {
public:
    void tambah(const std::string& sku, int n);
    bool ambil(const std::string& sku, int n);   // false bila stok kurang
    int jumlah(const std::string& sku) const;

private:
    std::map<std::string, int> data_;
};

// ===== src/stok.cpp =====
#include "stok.h"
#include <stdexcept>

void Stok::tambah(const std::string& sku, int n) {
    if (n <= 0) throw std::invalid_argument("jumlah harus positif");
    data_[sku] += n;
}

bool Stok::ambil(const std::string& sku, int n) {
    auto it = data_.find(sku);
    if (it == data_.end() || it->second < n) return false;
    it->second -= n;
    return true;
}

int Stok::jumlah(const std::string& sku) const {
    auto it = data_.find(sku);
    return it == data_.end() ? 0 : it->second;
}

// ===== tests/stok_test.cpp =====
#include <gtest/gtest.h>
#include <stdexcept>
#include "stok.h"

TEST(StokTest, TambahLaluAmbil) {
    Stok s;
    s.tambah("KOPI-250", 10);
    EXPECT_TRUE(s.ambil("KOPI-250", 4));
    EXPECT_EQ(s.jumlah("KOPI-250"), 6);
}

TEST(StokTest, AmbilMelebihiStokGagal) {
    Stok s;
    s.tambah("TEH", 2);
    EXPECT_FALSE(s.ambil("TEH", 3));
    EXPECT_EQ(s.jumlah("TEH"), 2);              // stok tidak berubah
}

TEST(StokTest, JumlahNolDitolak) {
    Stok s;
    EXPECT_THROW(s.tambah("X", 0), std::invalid_argument);
}`, 'cpp'),
      code('Build, test, sanitizer, clang-tidy, dan package manager', `# Configure + build + test (Ninja bila terpasang: tambahkan -G Ninja)
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
ctest --test-dir build --output-on-failure

# Build terpisah dengan sanitizer (folder build berbeda, tidak saling menimpa)
cmake -S . -B build-asan -DCMAKE_BUILD_TYPE=Debug -DINVENTORI_SANITIZE=ON
cmake --build build-asan -j && ctest --test-dir build-asan --output-on-failure

# Analisis statis memakai compile_commands.json dari folder build
clang-tidy -p build src/*.cpp
clang-format -i src/*.cpp include/*.h tests/*.cpp

# vcpkg (manifest mode): dependensi ditulis di vcpkg.json, mis. {"dependencies": ["fmt"]}
git clone https://github.com/microsoft/vcpkg && ./vcpkg/bootstrap-vcpkg.sh
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=./vcpkg/scripts/buildsystems/vcpkg.cmake
#   lalu di CMakeLists: find_package(fmt CONFIG REQUIRED) + target_link_libraries(... fmt::fmt)

# Conan 2: dependensi di conanfile.txt, lalu
conan install . --output-folder=build --build=missing
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake`, 'bash'),
      code('.clang-tidy', `Checks: >
  -*,
  bugprone-*,
  performance-*,
  modernize-*,
  cppcoreguidelines-*,
  readability-identifier-naming,
  -modernize-use-trailing-return-type,
  -cppcoreguidelines-avoid-magic-numbers
WarningsAsErrors: 'bugprone-*'
HeaderFilterRegex: 'include/.*'`, 'yaml'),
      table(['Kebutuhan', 'Alat utama', 'Alternatif'], [
        ['Generator build', 'CMake (+ Ninja)', 'Meson, Bazel, xmake'],
        ['Package manager', 'vcpkg (integrasi CMake & Visual Studio)', 'Conan 2 (binary cache, profil lintas platform)'],
        ['Unit test', 'GoogleTest (+ GoogleMock)', 'Catch2 v3 (`TEST_CASE` + `REQUIRE`), doctest'],
        ['Bug memori & UB', 'ASan + UBSan', 'Valgrind, MSVC `/fsanitize=address`'],
        ['Data race', 'ThreadSanitizer', 'Helgrind (Valgrind)'],
        ['Analisis statis', 'clang-tidy', 'cppcheck, MSVC Code Analysis, `-fanalyzer` (GCC)'],
        ['Format kode', 'clang-format', '-'],
        ['Editor / autocomplete', 'clangd + `compile_commands.json`', 'IntelliSense (VS / VS Code C++ extension), CLion'],
      ]),
      callout('tip', 'Pola CMake modern', 'Jangan memakai `include_directories()`, `link_libraries()`, atau mengubah `CMAKE_CXX_FLAGS` secara global; pakai `target_include_directories`, `target_link_libraries`, dan `target_compile_options` dengan `PRIVATE`/`PUBLIC`/`INTERFACE`. Selalu build di luar sumber (`-B build`), jangan commit folder build, dan simpan konfigurasi bersama di `CMakePresets.json` agar tim dan CI memakai flag yang sama.'),
      ...quiz([
        ['CPP-28', 'Apa beda `PRIVATE` dan `PUBLIC` pada `target_include_directories(inventori_core PUBLIC include)`?', '`PRIVATE` hanya berlaku saat mengompilasi target itu sendiri. `PUBLIC` berlaku untuk target itu **dan** menular ke setiap target yang me-link-nya, sehingga `inventori` dan `inventori_test` otomatis mendapat `-Iinclude` tanpa menulisnya ulang. `INTERFACE` hanya untuk pemakai, cocok untuk library header-only.'],
        ['CPP-29', 'Mengapa build sanitizer sebaiknya memakai folder build terpisah?', 'Flag sanitizer mengubah cara semua object file dikompilasi dan di-link. Mencampur object dengan dan tanpa instrumentasi bisa memicu error link atau laporan palsu, dan cache CMake menyimpan nilai opsi. Folder terpisah (`build`, `build-asan`, `build-tsan`) membuat setiap konfigurasi bersih, cepat di-rebuild, dan bisa dijalankan paralel di CI. ASan dan TSan juga tidak bisa digabung dalam satu build.'],
      ]),
      ...practice('cpp-tooling', [
        'Susun proyek `inventori` dengan CMake seperti contoh, jalankan ketiga test, lalu tambahkan test untuk SKU yang tidak ada.',
        'Tulis ulang satu test dengan Catch2 v3 lewat FetchContent (`Catch2::Catch2WithMain`) dan bandingkan keluarannya dengan GoogleTest.',
        'Tambahkan `CMakePresets.json` berisi preset `debug`, `release`, dan `asan`, lalu jalankan `cmake --preset asan` dan `ctest --preset asan`.',
        'Jalankan clang-tidy dengan konfigurasi di atas pada kode modul sebelumnya, perbaiki minimal lima temuan, dan catat check mana yang paling berguna.',
      ]),
      references(
        ['CMake Tutorial', 'https://cmake.org/cmake/help/latest/guide/tutorial/index.html'],
        ['CMake: FetchContent', 'https://cmake.org/cmake/help/latest/module/FetchContent.html'],
        ['GoogleTest: Quickstart CMake', 'https://google.github.io/googletest/quickstart-cmake.html'],
        ['Catch2', 'https://github.com/catchorg/Catch2'],
        ['vcpkg: Get started', 'https://learn.microsoft.com/vcpkg/get_started/get-started'],
        ['Conan 2 documentation', 'https://docs.conan.io/2/'],
        ['clang-tidy', 'https://clang.llvm.org/extra/clang-tidy/'],
      ),
    ],
  },
  {
    id: 'cpp-cp-template',
    title: 'Template CP, Fast I/O & Trik STL',
    summary: 'Template kontes dan multi test case, fast I/O (sync_with_stdio, cin.tie), memilih kompleksitas dari batasan n, overflow dan long long, modulo, priority_queue min-heap, lower_bound/upper_bound, bitset, dan builtin bit.',
    track: CP, source: cppSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Di competitive programming (Codeforces, AtCoder, ICPC, OSN/TOKI), C++ dominan karena tiga hal: eksekusinya cepat, STL menyediakan struktur data siap pakai, dan time limit soal biasanya dikalibrasi untuk solusi C++. Kodenya memang tidak mengikuti gaya produksi (`using namespace std;`, makro, nama variabel pendek), karena tujuannya adalah menulis solusi yang benar secepat mungkin dalam batas 1–2 detik.'),
      paragraph('Sebelum menulis kode, baca **batasan** soal untuk menebak kompleksitas yang diizinkan: dengan sekitar 10^8 operasi sederhana per detik, n = 2 × 10^5 menuntut O(n log n) atau lebih baik. Dua sumber Wrong Answer paling umum bagi pemula bukan algoritma, melainkan **overflow `int`** dan **I/O lambat** yang berujung Time Limit Exceeded. Kumpulan latihan soal versi Java tersedia di [Soal Searching](#java.soal-searching) dan [Graph](#java.graph).'),
      code('Template kontes', `#include <bits/stdc++.h>     // semua header STL sekaligus: khusus GCC/libstdc++, jangan dipakai di proyek
using namespace std;
using ll = long long;
using pii = pair<int, int>;
#define all(x) (x).begin(), (x).end()

void solve() {
    int n;
    cin >> n;
    vector<ll> a(n);
    for (auto& x : a) cin >> x;
    ll total = accumulate(all(a), 0LL);      // 0LL, bukan 0: tipe akumulator mengikuti nilai awal
    cout << total << '\\n';                  // '\\n', bukan endl: endl memaksa flush setiap baris
}

int main() {
    ios::sync_with_stdio(false);   // lepas sinkronisasi dengan stdio C: cin/cout jauh lebih cepat
    cin.tie(nullptr);              // jangan flush cout setiap kali cin membaca
    int t = 1;
    cin >> t;                      // hapus baris ini bila soal hanya satu test case
    while (t--) solve();
}

// Kompilasi lokal dengan pengaman ekstra:
// g++ -std=c++20 -O2 -Wall -Wextra -fsanitize=address,undefined -D_GLIBCXX_DEBUG sol.cpp -o sol
// ./sol < input.txt`, 'cpp'),
      code('Overflow, long long, dan modulo', `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 100'000;
    long long salah = n * n;          // int × int dihitung di int → overflow (UB) SEBELUM disimpan ke long long
    long long benar = 1LL * n * n;    // 10000000000
    cout << salah << ' ' << benar << '\\n';

    // int ≈ 2.1e9, long long ≈ 9.2e18
    // Jumlah 2e5 elemen bernilai 1e9 = 2e14 → wajib long long
    const long long MOD = 1'000'000'007;
    long long a = 999'999'999, b = 999'999'999;
    cout << (a % MOD) * (b % MOD) % MOD << '\\n';   // hasil kali < 1e18, masih muat di long long

    long long x = -7;
    cout << x % 3 << ' ' << ((x % 3) + 3) % 3 << '\\n';   // -1 2: modulo negatif mengikuti tanda pembilang

    int lo = 1'500'000'000, hi = 2'000'000'000;
    int mid = lo + (hi - lo) / 2;     // (lo + hi) / 2 akan overflow di sini
    cout << mid << '\\n';             // 1750000000
}`, 'cpp'),
      code('Trik STL: priority_queue, lower_bound, bitset, builtin bit', `#include <bits/stdc++.h>
using namespace std;

int main() {
    // priority_queue default adalah MAX-heap; greater<> membaliknya menjadi min-heap
    priority_queue<int, vector<int>, greater<int>> minh;
    for (int x : {5, 1, 8, 3}) minh.push(x);
    cout << minh.top() << '\\n';                          // 1

    // (jarak, simpul) untuk Dijkstra: pair dibandingkan berdasarkan first, lalu second
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
    pq.push({7, 2});
    pq.push({3, 5});
    cout << pq.top().first << ' ' << pq.top().second << '\\n';   // 3 5

    // lower_bound / upper_bound pada data terurut: O(log n)
    vector<int> v{1, 3, 3, 3, 7, 9};
    auto lo = lower_bound(v.begin(), v.end(), 3);        // elemen pertama >= 3
    auto hi = upper_bound(v.begin(), v.end(), 3);        // elemen pertama > 3
    cout << "banyak 3 = " << (hi - lo) << ", indeks pertama = " << (lo - v.begin()) << '\\n';   // 3, 1
    cout << "kurang dari 8: " << (lower_bound(v.begin(), v.end(), 8) - v.begin()) << '\\n';   // 5

    // bitset: ukuran tetap saat kompilasi, operasi diproses per word (64 bit sekaligus)
    bitset<16> b("1011");
    cout << b.count() << ' ' << b.test(1) << ' ' << (b << 2) << '\\n';   // 3 1 0000000000101100

    // Subset sum: bisakah memilih sebagian elemen yang jumlahnya tepat S?  O(n · S / 64)
    vector<int> w{3, 5, 7};
    bitset<100'001> bisa;
    bisa[0] = 1;
    for (int x : w) bisa |= bisa << x;
    cout << bisa.test(12) << bisa.test(11) << '\\n';     // 10 (5 + 7 = 12; 11 tidak bisa)

    // Builtin GCC/Clang; versi portabel C++20 ada di <bit>: std::popcount, std::countr_zero
    cout << __builtin_popcount(13) << ' ' << __builtin_ctz(8) << ' ' << popcount(13u) << '\\n';   // 3 3 3
}`, 'cpp'),
      table(['Batas n', 'Kompleksitas yang lolos (~1 detik)', 'Contoh algoritma'], [
        ['n ≤ 10–11', 'O(n!)', 'Semua permutasi'],
        ['n ≤ 20–25', 'O(2^n) atau O(2^n · n)', 'Subset brute force, bitmask DP'],
        ['n ≤ 500', 'O(n³)', 'Floyd–Warshall, DP interval'],
        ['n ≤ 5.000', 'O(n²)', 'DP dua dimensi, semua pasangan'],
        ['n ≤ 2 × 10^5 – 10^6', 'O(n log n)', 'Sorting, binary search, heap, segment tree'],
        ['n ≤ 10^7 – 10^8', 'O(n)', 'Prefix sum, two pointers, sieve'],
        ['n ≤ 10^18', 'O(log n) atau O(√n)', 'Fast exponentiation, binary search jawaban'],
      ]),
      callout('warn', 'Jebakan yang sering membuat WA/TLE', 'Setelah `sync_with_stdio(false)`, jangan mencampur `printf`/`scanf` dengan `cin`/`cout`. `bits/stdc++.h` tidak tersedia di MSVC maupun Apple clang (libc++), jadi di macOS pasang GCC via Homebrew atau tulis include satu per satu. Hati-hati dengan `v.size() - 1` saat vector kosong: `size()` bertipe unsigned sehingga hasilnya angka raksasa, bukan -1. Array global besar (misalnya `int a[1000000]`) aman, tetapi array lokal sebesar itu bisa memicu stack overflow.'),
      ...quiz([
        ['CPP-30', 'Mengapa `long long salah = n * n;` tetap overflow walaupun disimpan ke `long long`?', 'Tipe hasil ekspresi ditentukan oleh operannya, bukan oleh variabel tujuan. `n * n` adalah `int × int`, jadi dihitung dalam `int` dan overflow (undefined behavior) sebelum dikonversi. Jadikan salah satu operan `long long` lebih dulu: `1LL * n * n` atau `(long long)n * n`.'],
        ['CPP-31', 'Bagaimana menghitung banyaknya elemen bernilai x di vector terurut dalam O(log n)?', '`upper_bound(all(v), x) - lower_bound(all(v), x)`. `lower_bound` menunjuk elemen pertama yang ≥ x dan `upper_bound` menunjuk elemen pertama yang > x, sehingga selisih kedua iterator adalah jumlah kemunculan x. Bisa juga memakai `equal_range` yang mengembalikan keduanya sekaligus.'],
      ]),
      ...practice('cpp-cp-template', [
        'Simpan template di atas sebagai snippet editor, lalu selesaikan lima soal Codeforces Div. 2/3 problem A–B memakainya.',
        'Ukur perbedaan waktu membaca 10^6 bilangan dengan `cin` biasa, `cin` + `sync_with_stdio(false)`, dan `scanf`; catat hasilnya.',
        'Selesaikan soal "k elemen terbesar dari stream" dengan min-heap berukuran k, dan "jumlah pasangan dengan a_i + a_j ≤ X" dengan sort + `upper_bound`.',
        'Buat daftar pribadi jebakan overflow dari tiga soal yang pernah mendapat WA, lengkap dengan perbaikannya.',
      ]),
      references(
        ['cppreference: std::priority_queue', 'https://en.cppreference.com/w/cpp/container/priority_queue'],
        ['cppreference: std::lower_bound', 'https://en.cppreference.com/w/cpp/algorithm/lower_bound'],
        ['cppreference: std::bitset', 'https://en.cppreference.com/w/cpp/utility/bitset'],
        ['USACO Guide', 'https://usaco.guide/'],
        ['Codeforces', 'https://codeforces.com/'],
      ),
    ],
  },
  {
    id: 'cpp-cp-pola-klasik',
    title: 'Pola Soal Klasik di C++: Prefix Sum, Two Pointers, BFS/DFS, DP',
    summary: 'Lima solusi lengkap: range sum dengan prefix sum, subarray terpanjang dengan two pointers, jarak terpendek di grid dengan BFS, komponen terhubung dengan DFS iteratif, serta DP 0/1 knapsack dan LIS O(n log n).',
    track: CP, source: cppSource, duration: '3,5 jam', level: 'Hard',
    blocks: [
      paragraph('Sebagian besar soal kontes dan interview adalah variasi dari segelintir pola. Kemampuan yang membedakan bukan menghafal kode, melainkan **mengenali sinyal** di deskripsi soal: "banyak query jumlah rentang" berarti prefix sum, "subarray dengan syarat monoton" berarti two pointers, "langkah minimum di grid tanpa bobot" berarti BFS, dan "pilih atau tidak pilih dengan kapasitas" berarti DP knapsack. Setiap solusi di bawah ditulis lengkap: format input, kode yang bisa dikumpulkan, dan kompleksitasnya.'),
      paragraph('Tulis ulang setiap solusi tanpa melihat, lalu uji dengan kasus kecil yang bisa dihitung tangan dan kasus batas (n = 1, semua elemen sama, grid tanpa jalan). Pembahasan konsep yang lebih panjang ada di [Dynamic Programming](#java.dynamic-programming), [DP Klasik: Kadane sampai String DP](#java.dp-klasik-kadane-sampai-string-dp), [Graph](#java.graph), dan [Stack, Greedy & Two Pointer](#java.coding-interview-stack-greedy-two-pointer-49-62).'),
      code('Prefix sum: q query jumlah rentang — O(n + q)', `// Input: n q, lalu n bilangan a_1..a_n (|a_i| ≤ 1e9), lalu q baris "l r" (1-indexed)
// Output: jumlah a_l + ... + a_r untuk setiap query. n, q ≤ 2e5
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> pre(n + 1, 0);          // pre[i] = a_1 + ... + a_i, pre[0] = 0
    for (int i = 1; i <= n; ++i) {
        long long x;
        cin >> x;
        pre[i] = pre[i - 1] + x;
    }
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << pre[r] - pre[l - 1] << '\\n';   // O(1) per query, bukan O(n)
    }
}`, 'cpp'),
      code('Two pointers: subarray terpanjang dengan jumlah ≤ K — O(n)', `// Input: n K, lalu n bilangan NON-NEGATIF. Output: panjang subarray kontigu terpanjang dengan jumlah ≤ K
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long k;
    cin >> n >> k;
    vector<long long> a(n);
    for (auto& x : a) cin >> x;

    long long jumlah = 0;
    int terbaik = 0;
    for (int kiri = 0, kanan = 0; kanan < n; ++kanan) {
        jumlah += a[kanan];                       // perluas jendela ke kanan
        while (jumlah > k) jumlah -= a[kiri++];   // persempit dari kiri sampai valid lagi
        terbaik = max(terbaik, kanan - kiri + 1);
    }
    cout << terbaik << '\\n';
}
// Mengapa O(n): kiri dan kanan masing-masing hanya bergerak maju, total paling banyak 2n langkah.
// Syarat non-negatif penting: menambah elemen tidak pernah mengurangi jumlah (monoton).`, 'cpp'),
      code('BFS: langkah minimum di grid — O(n·m)', `// Input: n m, lalu n baris berisi '.', '#', 'S', 'T'. Output: langkah minimum S → T (4 arah), -1 bila mustahil
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (auto& baris : g) cin >> baris;

    pair<int, int> s{0, 0}, t{0, 0};
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < m; ++j) {
            if (g[i][j] == 'S') s = {i, j};
            if (g[i][j] == 'T') t = {i, j};
        }

    vector<vector<int>> jarak(n, vector<int>(m, -1));   // -1 = belum dikunjungi
    queue<pair<int, int>> q;
    jarak[s.first][s.second] = 0;
    q.push(s);
    const int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        for (int d = 0; d < 4; ++d) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (g[nr][nc] == '#' || jarak[nr][nc] != -1) continue;
            jarak[nr][nc] = jarak[r][c] + 1;   // tandai saat MASUK antrian agar tidak dimasukkan dua kali
            q.push({nr, nc});
        }
    }
    cout << jarak[t.first][t.second] << '\\n';
}`, 'cpp'),
      code('DFS iteratif: komponen terhubung — O(n + m)', `// Input: n m, lalu m baris "u v" (graf tak berarah, simpul 1..n)
// Output: banyak komponen terhubung dan ukuran komponen terbesar
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);           // adjacency list
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<char> dikunjungi(n + 1, 0);        // vector<char>: akses byte langsung, tanpa proxy bit seperti vector<bool>
    int komponen = 0, terbesar = 0;
    for (int awal = 1; awal <= n; ++awal) {
        if (dikunjungi[awal]) continue;
        ++komponen;
        int ukuran = 0;
        vector<int> st{awal};                 // stack eksplisit: rekursi sedalam 1e5 bisa stack overflow
        dikunjungi[awal] = 1;
        while (!st.empty()) {
            int u = st.back();
            st.pop_back();
            ++ukuran;
            for (int v : adj[u])
                if (!dikunjungi[v]) {
                    dikunjungi[v] = 1;
                    st.push_back(v);
                }
        }
        terbesar = max(terbesar, ukuran);
    }
    cout << komponen << ' ' << terbesar << '\\n';
}`, 'cpp'),
      code('DP: 0/1 knapsack O(n·W) dan LIS O(n log n)', `// Knapsack: n barang (berat w_i, nilai v_i), kapasitas W ≤ 1e5. Nilai total maksimum?
// LIS: panjang subsequence naik tegas terpanjang, n ≤ 2e5
#include <bits/stdc++.h>
using namespace std;

long long knapsack(const vector<int>& w, const vector<long long>& v, int W) {
    vector<long long> dp(W + 1, 0);           // dp[c] = nilai terbaik dengan kapasitas c
    for (size_t i = 0; i < w.size(); ++i)
        for (int c = W; c >= w[i]; --c)       // MUNDUR: setiap barang dipakai paling banyak sekali
            dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
    return dp[W];
}

int lis(const vector<int>& a) {
    vector<int> ekor;                         // ekor[k] = nilai akhir terkecil dari subsequence naik sepanjang k+1
    for (int x : a) {
        auto it = lower_bound(ekor.begin(), ekor.end(), x);   // upper_bound → versi tidak turun (non-decreasing)
        if (it == ekor.end()) ekor.push_back(x);
        else *it = x;
    }
    return static_cast<int>(ekor.size());
}

int main() {
    cout << knapsack({1, 3, 4, 5}, {1, 4, 5, 7}, 7) << '\\n';   // 9 (barang berat 3 + 4)
    cout << lis({10, 9, 2, 5, 3, 7, 101, 18}) << '\\n';         // 4 (mis. 2 3 7 18)
}`, 'cpp'),
      table(['Pola', 'Sinyal di soal', 'Kompleksitas', 'Jebakan'], [
        ['Prefix sum', 'Banyak query jumlah/rentang pada array statis', 'O(n) bangun, O(1) per query', 'Overflow: pakai `long long`; off-by-one pada indeks 0/1'],
        ['Two pointers / sliding window', 'Subarray kontigu, syarat monoton (elemen non-negatif, data terurut)', 'O(n)', 'Tidak berlaku bila ada elemen negatif; pakai prefix sum + map'],
        ['BFS', 'Langkah minimum, graf/grid tanpa bobot', 'O(V + E)', 'Tandai dikunjungi saat push, bukan saat pop'],
        ['DFS', 'Komponen, siklus, flood fill, topological sort', 'O(V + E)', 'Rekursi dalam → stack overflow; pakai stack eksplisit'],
        ['DP knapsack', 'Pilih/tidak pilih dengan batas kapasitas', 'O(n·W)', '0/1: loop kapasitas mundur; unbounded: maju'],
        ['LIS', 'Subsequence naik terpanjang, chain/nesting', 'O(n log n)', '`lower_bound` (tegas) vs `upper_bound` (tidak turun)'],
      ]),
      callout('tip', 'Cara berlatih yang efektif', 'Untuk setiap pola, selesaikan 5–10 soal secara berurutan dari mudah ke sulit (misalnya CSES Problem Set bagian Sorting and Searching, Graph Algorithms, dan Dynamic Programming). Batasi waktu 30–45 menit per soal; bila buntu, baca editorial, tutup, lalu tulis ulang solusinya keesokan hari. Simpan solusi di repositori dengan catatan singkat "sinyal → pola" agar mudah diulang sebelum kontes atau interview.'),
      ...quiz([
        ['CPP-32', 'Mengapa loop kapasitas pada 0/1 knapsack berjalan mundur (`c = W` turun ke `w[i]`)?', 'Dengan dp satu dimensi, `dp[c - w[i]]` harus berupa nilai **sebelum** barang i dipertimbangkan. Bila loop maju, `dp[c - w[i]]` mungkin sudah diperbarui pada iterasi barang yang sama, sehingga barang i bisa terpakai berkali-kali; itu justru solusi unbounded knapsack.'],
        ['CPP-33', 'Apakah isi vector `ekor` pada akhir algoritma LIS adalah salah satu LIS yang valid?', 'Belum tentu. Panjangnya selalu sama dengan panjang LIS, tetapi isinya adalah nilai akhir terkecil untuk setiap panjang, yang bisa berasal dari subsequence berbeda. Untuk merekonstruksi LIS, simpan indeks elemen di setiap posisi beserta array `parent`, lalu telusuri mundur dari elemen terakhir.'],
        ['CPP-34', 'Pada BFS grid, apa akibatnya bila sel ditandai dikunjungi saat di-pop, bukan saat di-push?', 'Sel yang sama bisa dimasukkan ke antrian berkali-kali dari beberapa tetangga sebelum ia diproses. Jarak yang dihasilkan tetap benar, tetapi ukuran antrian dan waktu proses bisa membengkak jauh melampaui O(n·m), sehingga soal dengan grid 1000 × 1000 bisa TLE atau kehabisan memori.'],
      ]),
      ...practice('cpp-cp-pola', [
        'Kembangkan prefix sum menjadi versi 2D untuk query jumlah submatriks, lalu uji dengan matriks 3×3 yang dihitung tangan.',
        'Ubah soal two pointers agar elemen boleh negatif (cari banyaknya subarray dengan jumlah tepat K) memakai prefix sum + `unordered_map`.',
        'Modifikasi BFS agar mencetak jalurnya (simpan sel asal setiap sel), lalu ganti menjadi Dijkstra bila tiap sel punya biaya masuk 1–9.',
        'Selesaikan CSES "Counting Rooms", "Labyrinth", "Book Shop", dan "Increasing Subsequence" dengan solusi di modul ini sebagai titik awal.',
      ]),
      references(
        ['CSES Problem Set', 'https://cses.fi/problemset/'],
        ['cp-algorithms: Breadth-first search', 'https://cp-algorithms.com/graph/breadth-first-search.html'],
        ['cp-algorithms: Longest increasing subsequence', 'https://cp-algorithms.com/sequences/longest_increasing_subsequence.html'],
        ['USACO Guide: Prefix Sums', 'https://usaco.guide/silver/prefix-sums'],
        ['cppreference: std::queue', 'https://en.cppreference.com/w/cpp/container/queue'],
      ),
    ],
  },
];

export const cppCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'cpp',
  title: 'C & C++',
  short: 'C/C++',
  monogram: 'C++',
  hue: 'slate',
  description: 'C dan C++ modern dari nol: toolchain gcc/clang, pointer dan memori dinamis, proyek multi-file dengan Makefile, lalu C++20/23 (RAII, STL, smart pointer, move semantics, template & concepts, ranges, concurrency) beserta tooling CMake, GoogleTest, sanitizer, dan clang-tidy, ditutup dengan C++ untuk competitive programming.',
  tracks: cppTracks,
  sources: [cppSource],
  intro: [
    {
      type: 'callout',
      tone: 'tip',
      title: 'Untuk siapa kurikulum ini',
      text: 'Untuk developer yang sudah bisa satu bahasa lain (Java, Go, Python, JavaScript) dan ingin memahami lapisan di bawahnya. Tiga tujuan umum: (1) **fondasi systems programming**, sebagai bekal jalur [Low Level Design](#lld) khususnya [Fondasi Bahasa Sistem (Rust/C++ Modern)](#lld.fase-1-fondasi-bahasa-sistem-rust-c-modern) dan [Concurrency & Memory Model](#lld.fase-2-concurrency-memory-model); (2) **competitive programming** dan interview algoritma, karena C++ dengan STL adalah bahasa paling umum di kontes; (3) **game, embedded, dan aplikasi performa tinggi** seperti engine, database, dan firmware.',
    },
    paragraph('Jalur yang disarankan: kerjakan track **C Dasar** lebih dulu agar pointer dan memori benar-benar dipahami, lalu **C++ Modern** yang menunjukkan bagaimana RAII, smart pointer, dan STL menghilangkan sebagian besar bug memori C. Pembaca yang hanya mengejar kontes boleh langsung ke [Template CP & Trik STL](#cpp.cpp-cp-template) setelah [STL](#cpp.cpp-stl). Contoh kode memakai **C17** dan **C++20** (beberapa fitur C++23 ditandai), cukup didukung oleh GCC 13+, Clang 17+, atau MSVC 2022. C++26 sudah rampung secara teknis di komite ISO dan sedang menuju publikasi resmi; dukungan compiler-nya masih bertahap, sehingga belum dipakai di sini. Untuk perbandingan ownership tanpa garbage collector, lihat juga [Ownership & Borrowing di Rust](#rust.rust-ownership-borrowing).'),
  ],
  modules: cppModules,
};
