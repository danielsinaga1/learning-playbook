import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'PHP Dasar';
const LV_DASAR = 'Laravel Dasar';
const LV_LANJUTAN = 'Laravel Lanjutan';
const PROYEK = 'Proyek';

export const phpSource = 'PHP & Laravel: materi tulisan tangan dari dokumentasi resmi PHP (php.net), Laravel, Pest, dan PHP-FIG (2 November 2026)';

const phpTracks: Track[] = [
  { title: DASAR, summary: 'Setup PHP, sintaks & tipe, array dan fungsi, OOP modern, error handling, Composer & PSR, fitur PHP 8.x, dan PDO.' },
  { title: LV_DASAR, summary: 'Struktur proyek Laravel, routing, controller, Blade, Eloquent & migration, validasi, API Resource, autentikasi Sanctum, Gate & Policy.' },
  { title: LV_LANJUTAN, summary: 'Queue, job, event, scheduler, Horizon; testing dengan Pest; cache, Octane, Docker, dan keamanan produksi.' },
  { title: PROYEK, summary: 'Financial Tracker REST API dengan Laravel, mengikuti kontrak yang sama dengan versi Go, Python, dan Node.js.' },
];

const phpModules: Omit<Module, 'code'>[] = [
  {
    id: 'php-setup-sintaks',
    title: 'PHP: Setup & Sintaks Dasar',
    summary: 'Instal PHP CLI (Herd, php.new, XAMPP, Docker), built-in server, variabel, tipe data, perbandingan == vs ===, string, interpolasi, dan alur kontrol.',
    track: DASAR, source: phpSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('PHP adalah bahasa server-side yang menjalankan sebagian besar web: WordPress, Laravel, Symfony, dan banyak sistem internal perusahaan di Indonesia. PHP modern (8.x) jauh dari citra "PHP lama": ada type declaration, enum, readonly, JIT, dan ekosistem paket lewat **Composer**. Model eksekusinya sederhana: setiap request memulai skrip dari nol (*shared-nothing*), sehingga kebocoran state antar-request hampir mustahil, dan deploy cukup menyalin file.'),
      paragraph('Materi ini memakai **PHP 8.4** (rilis November 2024) sebagai baseline karena didukung luas oleh hosting dan Laravel; fitur **PHP 8.5** (rilis November 2025) diberi tanda khusus. PHP 8.1 sudah berakhir dukungan keamanannya; gunakan minimal 8.3 untuk proyek baru dan cek jadwal di [php.net/supported-versions](https://www.php.net/supported-versions.php).'),
      code('Instal dan jalankan PHP', `# Windows / macOS: Laravel Herd (herd.laravel.com) membawa PHP, Composer, Laravel installer, dan Nginx
# Satu perintah (macOS/Linux) dari php.new: memasang PHP + Composer + Laravel installer
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)"

php -v                              # versi PHP
php -m                              # ekstensi yang aktif (pdo_mysql, mbstring, intl, ...)
php --ini                           # lokasi php.ini yang dipakai
php -r 'echo PHP_VERSION, PHP_EOL;' # jalankan kode satu baris
php -a                              # REPL interaktif

php halo.php                        # jalankan skrip CLI
php -S localhost:8000 -t public     # built-in web server, HANYA untuk development

# Tanpa instal apa pun: Docker image resmi
docker run --rm -it -v "$PWD":/app -w /app php:8.4-cli php halo.php`, 'bash'),
      code('halo.php: variabel, tipe, string, alur kontrol', `<?php

declare(strict_types=1);              // wajib di baris pertama setelah <?php; dibahas di modul PHP modern

$nama = 'Budi';                       // variabel diawali $, tipe ditentukan oleh nilai
$saldo = 150_000;                     // int (underscore sebagai pemisah digit)
$bunga = 0.035;                       // float
$aktif = true;                        // bool
$tag = null;                          // null

echo "Halo, $nama!" . PHP_EOL;                     // interpolasi hanya di string kutip ganda
echo 'Halo, $nama!' . PHP_EOL;                     // kutip tunggal: literal, tanpa interpolasi
echo "Saldo: {$saldo} (" . gettype($saldo) . ")" . PHP_EOL;
echo 'Rp' . number_format($saldo, 0, ',', '.') . PHP_EOL;   // Rp150.000
printf("Bunga %.1f%% = Rp%d%s", $bunga * 100, (int) ($saldo * $bunga), PHP_EOL);

$status = $saldo > 100_000 ? 'aman' : 'menipis';  // ternary
$label = $tag ?? 'tanpa tag';                     // null coalescing: pakai kanan bila kiri null/tidak ada

if ($saldo >= 1_000_000) {
    $kategori = 'besar';
} elseif ($saldo >= 100_000) {
    $kategori = 'sedang';
} else {
    $kategori = 'kecil';
}

for ($i = 1; $i <= 3; $i++) {
    echo $i, ' ';
}
foreach (['Senin', 'Selasa'] as $indeks => $hari) {
    echo "\\n$indeks: $hari";
}

$teks = <<<TXT
    Nasabah : $nama
    Status  : $status / $kategori ($label)
    TXT;                                           // heredoc: multi-baris dengan interpolasi
echo PHP_EOL . $teks . PHP_EOL;`, 'php'),
      code('Fungsi string yang sering dipakai', `<?php

$judul = '  Makan Siang di Warung  ';

var_dump(trim($judul));                         // "Makan Siang di Warung"
var_dump(strtolower('KOPI'), ucfirst('kopi'));  // "kopi", "Kopi"
var_dump(str_contains($judul, 'Warung'));       // true  (PHP 8.0+)
var_dump(str_starts_with('INV-001', 'INV-'));   // true
var_dump(str_replace(' ', '-', trim($judul)));  // "Makan-Siang-di-Warung"
var_dump(explode(',', 'a,b,c'));                // ['a', 'b', 'c']
var_dump(implode(' | ', ['a', 'b']));           // "a | b"
var_dump(sprintf('INV-%05d', 42));              // "INV-00042"

// strlen menghitung BYTE; untuk teks UTF-8 pakai fungsi mb_*
var_dump(strlen('héllo'), mb_strlen('héllo'));  // 6, 5
var_dump(mb_substr('Selamat pagi', 0, 7));      // "Selamat"

// Perbandingan: == melakukan type juggling, === membandingkan nilai DAN tipe
var_dump('1' == 1, '1' === 1);                  // true, false
var_dump(0 == 'abc');                           // false sejak PHP 8 (dulu true!)
var_dump(null == false, null === false);        // true, false`, 'php'),
      table(['Cara menjalankan PHP', 'Cocok untuk', 'Catatan'], [
        ['**Laravel Herd**', 'Windows & macOS, development Laravel', 'Satu installer: PHP, Composer, Nginx, domain `.test` otomatis'],
        ['**php.new**', 'Instal cepat PHP + Composer + Laravel installer', 'Satu perintah; direkomendasikan di dokumentasi Laravel'],
        ['**XAMPP**', 'Belajar PHP + MySQL di Windows', 'Apache + MariaDB + PHP; versi PHP sering tertinggal'],
        ['**Docker** (`php:8.4-cli`, `php:8.4-fpm`)', 'Lingkungan sama persis dengan produksi', 'Tidak mengotori sistem; lihat modul deployment'],
        ['Paket distro (`apt`, `brew`)', 'Server Linux, macOS', 'Ubuntu sering butuh PPA untuk versi terbaru'],
        ['`php -S`', 'Mencoba skrip/web kecil', 'Satu proses, satu request sekaligus; jangan di produksi'],
      ]),
      callout('warn', 'Selalu pakai === kecuali punya alasan', 'Operator `==` mengonversi tipe sebelum membandingkan, misalnya `"1e3" == "1000"` bernilai true. Biasakan `===`/`!==`, aktifkan `declare(strict_types=1)`, dan untuk output HTML selalu escape dengan `htmlspecialchars($teks, ENT_QUOTES)` (Blade melakukannya otomatis, lihat modul Laravel).'),
      ...quiz([
        ['PHP-01', 'Apa beda string kutip tunggal dan kutip ganda di PHP?', 'Kutip ganda memproses interpolasi variabel (`"Halo $nama"`, `"{$obj->prop}"`) dan escape sequence seperti `\\n`. Kutip tunggal bersifat literal: hanya `\\\'` dan `\\\\` yang diproses. Kutip tunggal sedikit lebih jelas maksudnya untuk teks statis.'],
        ['PHP-02', 'Mengapa `strlen("héllo")` menghasilkan 6, bukan 5?', 'Fungsi string bawaan bekerja per byte, dan huruf `é` di UTF-8 memakai 2 byte. Untuk menghitung karakter gunakan `mb_strlen`, `mb_substr`, dan fungsi `mb_*` lain (ekstensi mbstring).'],
        ['PHP-03', 'Kapan `$a ?? $b` berbeda dari `$a ?: $b`?', '`??` memilih `$b` hanya bila `$a` null atau tidak terdefinisi (tanpa warning). `?:` memilih `$b` bila `$a` *falsy*, termasuk `0`, `""`, `"0"`, dan `[]`. Untuk nilai default dari input, `??` biasanya yang benar karena `0` tetap dianggap nilai sah.'],
      ]),
      ...practice('php-setup', [
        'Instal PHP 8.4 (Herd, php.new, atau Docker) lalu jalankan `php -v` dan `php -m`; pastikan ekstensi `mbstring`, `pdo_sqlite`, dan `intl` aktif.',
        'Tulis `halo.php` yang mencetak saldo dalam format Rupiah dan kategori saldo dengan if/elseif.',
        'Buat folder `public/index.php` yang menampilkan `$_GET[\'nama\'] ?? \'tamu\'` (sudah di-escape) dan jalankan dengan `php -S localhost:8000 -t public`.',
        'Buat tabel kecil hasil `var_dump` untuk 6 perbandingan `==` vs `===` yang mengejutkan Anda.',
      ]),
      references(
        ['PHP Manual: Getting Started', 'https://www.php.net/manual/en/getting-started.php'],
        ['PHP Manual: Types', 'https://www.php.net/manual/en/language.types.php'],
        ['PHP Manual: Strings', 'https://www.php.net/manual/en/language.types.string.php'],
        ['PHP Manual: Built-in web server', 'https://www.php.net/manual/en/features.commandline.webserver.php'],
        ['PHP: Supported versions', 'https://www.php.net/supported-versions.php'],
      ),
    ],
  },
  {
    id: 'php-array-fungsi',
    title: 'PHP: Array & Fungsi',
    summary: 'Array terindeks & asosiatif, destructuring, spread, fungsi array (map/filter/reduce/usort/column), type declaration, named argument, closure, dan arrow function.',
    track: DASAR, source: phpSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Array di PHP adalah satu struktur serbaguna: *ordered map* yang bisa dipakai sebagai list, dictionary, stack, maupun queue. Hampir semua data dari database, JSON, dan form datang sebagai array, jadi menguasai fungsi `array_*` adalah keterampilan harian. Fungsi PHP mendukung tipe parameter dan return, nilai default, **named argument** (8.0), serta closure dan **arrow function** `fn` untuk callback ringkas.'),
      code('Array terindeks, asosiatif, destructuring, spread', `<?php

declare(strict_types=1);

$hari = ['Senin', 'Selasa', 'Rabu'];             // list: kunci 0, 1, 2
$hari[] = 'Kamis';                               // push di akhir

$transaksi = [                                   // array asosiatif (seperti object/dict)
    'id' => 1,
    'jenis' => 'pengeluaran',
    'deskripsi' => 'Makan siang',
    'jumlah' => 35_000,
];
echo $transaksi['deskripsi'], PHP_EOL;
echo $transaksi['catatan'] ?? '-', PHP_EOL;     // aman bila kunci tidak ada

[$pertama, $kedua] = $hari;                      // destructuring list
['id' => $id, 'jumlah' => $jumlah] = $transaksi; // destructuring berdasarkan kunci

$default = ['mata_uang' => 'IDR', 'jumlah' => 0];
$gabung = [...$default, ...$transaksi];          // spread; kunci string ditimpa yang terakhir (8.1+)

var_dump(isset($transaksi['catatan']));          // false (isset juga false bila nilainya null)
var_dump(array_key_exists('jenis', $transaksi)); // true
var_dump(in_array('35000', [35000], true));      // false: parameter ketiga = perbandingan strict
var_dump(count($hari), array_is_list($hari));    // 4, true`, 'php'),
      code('Fungsi array untuk data transaksi', `<?php

declare(strict_types=1);

$data = [
    ['id' => 1, 'jenis' => 'pengeluaran', 'kategori' => 'makan', 'jumlah' => 45_000],
    ['id' => 2, 'jenis' => 'pemasukan', 'kategori' => 'gaji', 'jumlah' => 8_000_000],
    ['id' => 3, 'jenis' => 'pengeluaran', 'kategori' => 'transport', 'jumlah' => 20_000],
    ['id' => 4, 'jenis' => 'pengeluaran', 'kategori' => 'makan', 'jumlah' => 30_000],
];

$keluar = array_filter($data, fn (array $t): bool => $t['jenis'] === 'pengeluaran');
$keluar = array_values($keluar);                 // array_filter MEMPERTAHANKAN kunci: 0, 2, 3 → reindex

$judul = array_map(fn (array $t): string => strtoupper($t['kategori']), $data);
$total = array_sum(array_column($keluar, 'jumlah'));          // 95000
$byId = array_column($data, null, 'id');                      // [1 => [...], 2 => [...], ...]

$perKategori = array_reduce($keluar, function (array $acc, array $t): array {
    $acc[$t['kategori']] = ($acc[$t['kategori']] ?? 0) + $t['jumlah'];
    return $acc;
}, []);                                                       // ['makan' => 75000, 'transport' => 20000]

usort($data, fn (array $a, array $b): int => $b['jumlah'] <=> $a['jumlah']);   // urut menurun, spaceship
$terbesar = $data[0]['kategori'];                             // gaji

// PHP 8.4: array_find, array_find_key, array_any, array_all
$pertamaMakan = array_find($data, fn (array $t): bool => $t['kategori'] === 'makan');
$adaGaji = array_any($data, fn (array $t): bool => $t['kategori'] === 'gaji');

print_r(compact('total', 'perKategori', 'terbesar', 'adaGaji'));`, 'php'),
      code('Fungsi: tipe, default, named argument, variadic, closure, arrow fn', `<?php

declare(strict_types=1);

function formatRupiah(int $jumlah, string $simbol = 'Rp', string $pemisah = '.'): string
{
    return $simbol . number_format($jumlah, 0, ',', $pemisah);
}

echo formatRupiah(1_500_000), PHP_EOL;                    // Rp1.500.000
echo formatRupiah(1_500_000, pemisah: ','), PHP_EOL;      // named argument: lewati parameter tengah
echo str_pad('7', 3, '0', pad_type: STR_PAD_LEFT), PHP_EOL; // fungsi bawaan juga mendukung named arg

function total(int ...$angka): int                         // variadic → array $angka
{
    return array_sum($angka);
}
echo total(10, 20, 30), PHP_EOL;
echo total(...[1, 2, 3]), PHP_EOL;                         // unpack array ke argumen

function cariKategori(array $data, string $id): ?string     // ?string = string|null
{
    return $data[$id] ?? null;
}

$persen = 10;
$diskonA = function (int $harga) use ($persen): int {      // closure: tangkap variabel dengan use (by value)
    return intdiv($harga * (100 - $persen), 100);
};
$diskonB = fn (int $harga): int => intdiv($harga * (100 - $persen), 100);  // arrow fn: tangkap otomatis

$hitung = 0;
$tambah = function () use (&$hitung): void { $hitung++; }; // by reference bila memang perlu mengubah
$tambah();
$tambah();

echo $diskonA(200_000), ' ', $diskonB(200_000), ' ', $hitung, PHP_EOL;   // 180000 180000 2`, 'php'),
      table(['Kebutuhan', 'Fungsi PHP', 'Padanan JS/Python'], [
        ['Transformasi tiap elemen', '`array_map(fn, $arr)`', '`arr.map` / list comprehension'],
        ['Saring', '`array_filter($arr, fn)` lalu `array_values`', '`arr.filter` / `filter()`'],
        ['Akumulasi', '`array_reduce($arr, fn, $awal)`', '`arr.reduce` / `functools.reduce`'],
        ['Ambil satu kolom', '`array_column($rows, \'kolom\')`', '`rows.map(r => r.kolom)`'],
        ['Urutkan dengan pembanding', '`usort($arr, fn ($a, $b) => $a <=> $b)`', '`arr.sort((a, b) => ...)`'],
        ['Cari elemen pertama (8.4)', '`array_find($arr, fn)`', '`arr.find` / `next(...)`'],
        ['Gabung', '`[...$a, ...$b]` atau `array_merge`', 'spread `[...a, ...b]`'],
      ]),
      callout('tip', 'Urutan argumen yang tidak konsisten', '`array_map` menerima callback lebih dulu, sedangkan `array_filter` dan `array_reduce` menerima array lebih dulu. Ini warisan sejarah PHP. Named argument (`array_filter(array: $data, callback: $fn)`) atau bantuan IDE (PhpStorm, VS Code + Intelephense) membantu menghindari salah urut. Di Laravel, `collect($data)->filter()->map()` memberi API berantai yang konsisten.'),
      ...quiz([
        ['PHP-04', 'Mengapa hasil `array_filter` sering perlu dibungkus `array_values`?', 'Karena `array_filter` mempertahankan kunci asli, sehingga hasilnya bisa berkunci 0, 2, 3. Saat di-`json_encode`, array dengan kunci tidak berurutan menjadi object JSON (`{"0":...,"2":...}`), bukan array. `array_values` mengindeks ulang menjadi list 0..n-1.'],
        ['PHP-05', 'Apa beda closure `function () use ($x)` dan arrow function `fn () => $x`?', 'Closure biasa hanya melihat variabel luar yang disebut di `use` (by value, atau by reference dengan `&`) dan bisa berisi banyak pernyataan. Arrow function menangkap semua variabel luar yang dipakai secara otomatis by value dan hanya berisi satu ekspresi. Keduanya tidak bisa mengubah variabel luar kecuali closure dengan `use (&$x)`.'],
      ]),
      ...practice('php-array', [
        'Dari array transaksi, hitung total pemasukan, total pengeluaran, dan saldo memakai `array_filter` + `array_column` + `array_sum`.',
        'Kelompokkan pengeluaran per kategori dengan `array_reduce`, lalu urutkan hasilnya menurun dengan `arsort`.',
        'Tulis `formatRupiah` dengan default argument dan panggil dengan kombinasi named argument.',
        'Buktikan perbedaan `json_encode` sebelum dan sesudah `array_values` pada hasil `array_filter`.',
      ]),
      references(
        ['PHP Manual: Arrays', 'https://www.php.net/manual/en/language.types.array.php'],
        ['PHP Manual: Array functions', 'https://www.php.net/manual/en/ref.array.php'],
        ['PHP Manual: Function arguments (named arguments)', 'https://www.php.net/manual/en/functions.arguments.php'],
        ['PHP Manual: Arrow functions', 'https://www.php.net/manual/en/functions.arrow.php'],
      ),
    ],
  },
  {
    id: 'php-oop',
    title: 'PHP: OOP — Class, Interface, Trait & Enum',
    summary: 'Class, visibility, constructor promotion, readonly, static & late static binding, interface, abstract class, trait, enum (pure & backed), dan final.',
    track: DASAR, source: phpSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Laravel, Symfony, dan hampir semua library modern ditulis berorientasi objek, jadi membaca kode framework menuntut pemahaman OOP PHP. Model OOP PHP mirip Java/C#: single inheritance, interface, abstract class, ditambah **trait** untuk berbagi implementasi horizontal. Sejak PHP 8 banyak boilerplate hilang: **constructor property promotion** (8.0), **readonly property** (8.1), **enum** (8.1), dan **readonly class** (8.2).'),
      code('Class, constructor promotion, readonly, static', `<?php

declare(strict_types=1);

final class Uang
{
    public function __construct(
        public readonly int $jumlah,                 // promotion: deklarasi + assign dalam satu baris
        public readonly string $mataUang = 'IDR',
    ) {
        if ($jumlah < 0) {
            throw new InvalidArgumentException('jumlah tidak boleh negatif');
        }
    }

    public static function rupiah(int $jumlah): self  // named constructor
    {
        return new self($jumlah);
    }

    public function tambah(Uang $lain): self          // immutable: kembalikan objek baru
    {
        if ($lain->mataUang !== $this->mataUang) {
            throw new LogicException('mata uang berbeda');
        }
        return new self($this->jumlah + $lain->jumlah, $this->mataUang);
    }

    public function __toString(): string
    {
        return $this->mataUang . ' ' . number_format($this->jumlah, 0, ',', '.');
    }
}

class Rekening
{
    private static int $jumlahDibuat = 0;              // milik class, bukan objek
    private Uang $saldo;

    public function __construct(private string $nomor)
    {
        $this->saldo = Uang::rupiah(0);
        self::$jumlahDibuat++;
    }

    public function setor(Uang $uang): void
    {
        $this->saldo = $this->saldo->tambah($uang);
    }

    public function saldo(): Uang
    {
        return $this->saldo;
    }

    public static function jumlahDibuat(): int
    {
        return self::$jumlahDibuat;
    }
}

$r = new Rekening('1234567890');
$r->setor(Uang::rupiah(50_000));
echo $r->saldo(), PHP_EOL;                             // IDR 50.000
// $r->saldo()->jumlah = 1;                            // Error: Cannot modify readonly property`, 'php'),
      code('Interface, abstract class, trait', `<?php

declare(strict_types=1);

interface Notifier
{
    public function kirim(string $tujuan, string $pesan): bool;
}

trait PunyaLog                                      // berbagi implementasi tanpa pewarisan
{
    private array $log = [];

    protected function catat(string $baris): void
    {
        $this->log[] = date('H:i:s') . ' ' . $baris;
    }

    public function riwayat(): array
    {
        return $this->log;
    }
}

abstract class NotifierDasar implements Notifier    // tidak bisa di-new; boleh berisi implementasi
{
    use PunyaLog;

    public function kirim(string $tujuan, string $pesan): bool
    {
        $this->catat("kirim ke $tujuan");
        return $this->kirimSebenarnya($tujuan, $pesan);
    }

    abstract protected function kirimSebenarnya(string $tujuan, string $pesan): bool;  // template method
}

final class EmailNotifier extends NotifierDasar
{
    protected function kirimSebenarnya(string $tujuan, string $pesan): bool
    {
        return filter_var($tujuan, FILTER_VALIDATE_EMAIL) !== false;   // pura-pura mengirim
    }
}

function beriTahu(Notifier $n, string $tujuan): void   // bergantung pada interface, bukan class konkret
{
    $n->kirim($tujuan, 'Saldo Anda di bawah Rp100.000');
}

$email = new EmailNotifier();
beriTahu($email, 'budi@contoh.id');
print_r($email->riwayat());
var_dump($email instanceof Notifier);                  // true`, 'php'),
      code('Enum: pure & backed, method, interface', `<?php

declare(strict_types=1);

enum JenisTransaksi: string                          // backed enum: setiap case punya nilai string/int
{
    case Pemasukan = 'pemasukan';
    case Pengeluaran = 'pengeluaran';

    public function label(): string
    {
        return match ($this) {
            self::Pemasukan => 'Uang masuk',
            self::Pengeluaran => 'Uang keluar',
        };
    }

    public function tanda(): int
    {
        return $this === self::Pemasukan ? 1 : -1;
    }
}

enum Status                                          // pure enum: tanpa nilai
{
    case Aktif;
    case Dibekukan;
}

$jenis = JenisTransaksi::from('pengeluaran');        // ValueError bila nilai tidak dikenal
$mungkin = JenisTransaksi::tryFrom('hadiah');        // null bila tidak dikenal (cocok untuk input)

echo $jenis->value, ' ', $jenis->name, ' ', $jenis->label(), PHP_EOL;   // pengeluaran Pengeluaran Uang keluar
var_dump($mungkin);                                                     // NULL
var_dump(array_map(fn (JenisTransaksi $j) => $j->value, JenisTransaksi::cases()));
var_dump(Status::Aktif === Status::Aktif);                              // true: setiap case adalah singleton
echo json_encode(['jenis' => JenisTransaksi::Pemasukan]), PHP_EOL;      // {"jenis":"pemasukan"}`, 'php'),
      table(['Konsep', 'PHP', 'Java / C#'], [
        ['Constructor ringkas', 'Constructor promotion `public function __construct(private int $x)`', 'Record / primary constructor'],
        ['Immutable', '`readonly` property / `readonly class`', '`final` field / `init`, record'],
        ['Berbagi implementasi', '`trait` + `use`', 'Default method interface / tidak ada padanan langsung'],
        ['Static vs instance', '`self::$x`, `static::method()` (late static binding)', '`static`'],
        ['Mencegah pewarisan', '`final class` / `final public function`', '`final` / `sealed`'],
        ['Enumerasi', '`enum` pure/backed, boleh punya method & implement interface', '`enum`'],
        ['Cek tipe', '`$x instanceof Foo`', '`instanceof` / `is`'],
      ]),
      callout('tip', 'self vs static', '`self::` selalu merujuk class tempat kode ditulis, sedangkan `static::` merujuk class yang benar-benar dipanggil saat runtime (*late static binding*). Itulah sebabnya Eloquent memakai `static::query()` dan `new static`: `Transaksi::create()` membuat objek `Transaksi`, bukan `Model`. Untuk class domain sendiri, utamakan `final` dan komposisi daripada pewarisan berlapis.'),
      ...quiz([
        ['PHP-06', 'Kapan memakai trait dibanding abstract class?', 'Abstract class cocok untuk hubungan "adalah" dengan kerangka bersama dan method abstrak (template method); satu class hanya bisa mewarisi satu parent. Trait cocok untuk kemampuan kecil yang dipakai di class yang tidak berhubungan (logging, timestamp, `HasFactory` di Laravel), karena satu class bisa memakai banyak trait.'],
        ['PHP-07', 'Apa beda `JenisTransaksi::from()` dan `tryFrom()`?', '`from()` melempar `ValueError` bila nilai tidak cocok dengan case mana pun, cocok saat nilai dijamin valid (data dari database). `tryFrom()` mengembalikan `null`, cocok untuk input pengguna yang perlu divalidasi dengan pesan sendiri.'],
        ['PHP-08', 'Mengapa method `tambah()` pada `Uang` mengembalikan objek baru, bukan mengubah `$this->jumlah`?', 'Karena propertinya `readonly`: hanya bisa diisi sekali di dalam class. Objek nilai (*value object*) yang immutable aman dibagi ke banyak tempat tanpa efek samping, mudah diuji, dan tidak bisa berubah diam-diam oleh kode lain.'],
      ]),
      ...practice('php-oop', [
        'Buat value object `Email` (readonly, validasi `filter_var` di constructor) dan `Uang` dengan method `tambah` dan `kurang`.',
        'Definisikan interface `RepositoriTransaksi` dengan `simpan`, `cari`, `semua`, lalu implementasikan `RepositoriMemori`.',
        'Buat enum `JenisTransaksi` dengan method `label()` dan `tanda()`, lalu hitung saldo dari daftar transaksi memakai `tanda()`.',
        'Tulis trait `PunyaLog` dan pakai di dua class yang tidak berhubungan.',
      ]),
      references(
        ['PHP Manual: Classes and Objects', 'https://www.php.net/manual/en/language.oop5.php'],
        ['PHP Manual: Constructor promotion', 'https://www.php.net/manual/en/language.oop5.decon.php#language.oop5.decon.constructor.promotion'],
        ['PHP Manual: Traits', 'https://www.php.net/manual/en/language.oop5.traits.php'],
        ['PHP Manual: Enumerations', 'https://www.php.net/manual/en/language.enumerations.php'],
        ['PHP Manual: Late Static Bindings', 'https://www.php.net/manual/en/language.oop5.late-static-bindings.php'],
      ),
    ],
  },
  {
    id: 'php-error-composer',
    title: 'PHP: Error Handling, Composer & Standar PSR',
    summary: 'Hierarki Throwable, try/catch/finally, custom exception, namespace, Composer, autoload PSR-4, PSR-12/PER Coding Style, Pint, dan PHPStan.',
    track: DASAR, source: phpSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Sejak PHP 7 hampir semua kesalahan fatal dilempar sebagai objek `Throwable` yang bisa ditangkap, terbagi dua cabang: `Exception` (kesalahan yang wajar diantisipasi aplikasi) dan `Error` (bug atau kesalahan engine seperti `TypeError`). Di sisi ekosistem, **Composer** adalah package manager standar sekaligus pembuat autoloader, dan **PHP-FIG** menerbitkan standar PSR agar library dari vendor berbeda bisa saling dipakai.'),
      code('Throwable, custom exception, finally', `<?php

declare(strict_types=1);

namespace Dompet\\Domain;

use InvalidArgumentException;
use RuntimeException;

class SaldoTidakCukup extends RuntimeException       // custom exception membawa konteks domain
{
    public function __construct(public readonly int $saldo, public readonly int $diminta)
    {
        parent::__construct("saldo $saldo tidak cukup untuk penarikan $diminta");
    }
}

final class Dompet
{
    public function __construct(private int $saldo) {}

    public function tarik(int $jumlah): int
    {
        if ($jumlah <= 0) {
            throw new InvalidArgumentException('jumlah harus lebih dari 0');
        }
        if ($jumlah > $this->saldo) {
            throw new SaldoTidakCukup($this->saldo, $jumlah);
        }
        return $this->saldo -= $jumlah;
    }
}

// --- pemakaian ---
$dompet = new Dompet(100_000);

try {
    $dompet->tarik(250_000);
} catch (SaldoTidakCukup $e) {                       // tangkap yang paling spesifik dulu
    echo "Ditolak: {$e->getMessage()} (kurang " . ($e->diminta - $e->saldo) . ")\\n";
} catch (InvalidArgumentException | \\TypeError $e) { // multi-catch
    echo "Input salah: {$e->getMessage()}\\n";
} finally {
    echo "selalu dijalankan (tutup file/koneksi di sini)\\n";
}

try {
    intdiv(10, 0);
} catch (\\DivisionByZeroError) {                    // PHP 8: variabel exception boleh dihilangkan
    echo "pembagian dengan nol\\n";
}

$nama = $_GET['nama'] ?? throw new InvalidArgumentException('nama wajib');  // throw sebagai ekspresi (8.0)`, 'php'),
      code('Composer: inisialisasi, dependency, autoload PSR-4', `composer init                               # buat composer.json secara interaktif
composer require monolog/monolog            # dependency produksi → composer.json + composer.lock + vendor/
composer require --dev pestphp/pest phpstan/phpstan laravel/pint
composer install                            # pasang versi persis dari composer.lock (CI, server)
composer update monolog/monolog             # naikkan versi sesuai constraint, perbarui lock
composer dump-autoload                      # bangun ulang autoloader setelah mengubah "autoload"
composer audit                              # cek paket yang punya advisory keamanan
composer outdated --direct                  # dependency langsung yang tertinggal versinya`, 'bash'),
      code('composer.json + struktur PSR-4', `{
    "name": "budi/dompet",
    "type": "project",
    "require": {
        "php": ">=8.3",
        "monolog/monolog": "^3.0"
    },
    "autoload": {
        "psr-4": { "Dompet\\\\": "src/" }
    },
    "autoload-dev": {
        "psr-4": { "Tests\\\\": "tests/" }
    },
    "scripts": {
        "test": "pest",
        "lint": "pint --test",
        "analyse": "phpstan analyse src --level=8"
    }
}`, 'json'),
      code('bin/app.php: satu require untuk semua class', `<?php

declare(strict_types=1);

// PSR-4: prefix Dompet\\ → folder src/, sisa namespace = subfolder, nama class = nama file
//   Dompet\\Domain\\Dompet           → src/Domain/Dompet.php
//   Dompet\\Domain\\SaldoTidakCukup  → src/Domain/SaldoTidakCukup.php
require __DIR__ . '/../vendor/autoload.php';

use Dompet\\Domain\\Dompet;
use Dompet\\Domain\\SaldoTidakCukup;

$dompet = new Dompet(100_000);              // file src/Domain/Dompet.php dimuat otomatis saat dibutuhkan

try {
    echo $dompet->tarik(30_000), PHP_EOL;   // 70000
    $dompet->tarik(500_000);
} catch (SaldoTidakCukup $e) {
    fwrite(STDERR, $e->getMessage() . PHP_EOL);
    exit(1);
}`, 'php'),
      table(['Standar / alat', 'Isi', 'Dipakai di'], [
        ['PSR-1, **PSR-12**', 'Gaya kode dasar & lanjutan (indentasi 4 spasi, kurung kurawal, `declare`)', 'Semua proyek; PSR-12 kini diteruskan oleh **PER Coding Style** yang mengikuti sintaks PHP terbaru'],
        ['**PSR-4**', 'Pemetaan namespace → folder untuk autoload', '`composer.json`, semua framework'],
        ['PSR-3 / PSR-11', 'Interface logger / container DI', 'Monolog, container Laravel & Symfony'],
        ['PSR-7 / 15 / 17 / 18', 'HTTP message, middleware, factory, client', 'Slim, Guzzle, Mezzio'],
        ['**Laravel Pint**', 'Formatter berbasis PHP-CS-Fixer (preset `laravel`, `per`, `psr12`)', '`./vendor/bin/pint`, `--test` di CI'],
        ['**PHPStan** / Larastan', 'Analisis statis: tipe, null, method tidak ada', '`phpstan analyse --level=8`'],
      ]),
      callout('warn', 'Commit composer.lock, jangan commit vendor/', 'Untuk aplikasi, `composer.lock` wajib di-commit agar semua developer dan server memakai versi yang sama; di server jalankan `composer install --no-dev --optimize-autoloader`, bukan `composer update`. Folder `vendor/` masuk `.gitignore`. Jangan menampilkan pesan exception mentah ke pengguna di produksi: set `display_errors=Off` dan `log_errors=On` di php.ini.'),
      ...quiz([
        ['PHP-09', 'Apa beda `Exception` dan `Error` di PHP, dan kapan menangkap `Throwable`?', '`Exception` mewakili kondisi yang bisa diantisipasi aplikasi (input salah, saldo kurang, koneksi gagal). `Error` mewakili bug atau kegagalan engine (`TypeError`, `ValueError`, memanggil method yang tidak ada). Menangkap `Throwable` hanya pantas di batas terluar (global handler, worker queue) untuk mencatat log dan memberi respons 500, bukan di logika bisnis.'],
        ['PHP-10', 'Class `Dompet\\Infra\\RepositoriPdo` dengan autoload `"Dompet\\\\": "src/"` harus disimpan di mana?', 'Di `src/Infra/RepositoriPdo.php`. Prefix `Dompet\\` dipetakan ke `src/`, segmen namespace sisanya (`Infra`) menjadi subfolder, dan nama class menjadi nama file. Huruf besar-kecil harus sama persis karena server Linux case-sensitive.'],
        ['PHP-11', 'Mengapa `composer install` dipakai di CI/server, bukan `composer update`?', '`install` memasang versi persis yang tercatat di `composer.lock`, sehingga hasilnya dapat direproduksi. `update` mencari versi terbaru yang memenuhi constraint dan bisa membawa perubahan yang belum diuji ke produksi.'],
      ]),
      ...practice('php-composer', [
        'Buat proyek Composer dengan namespace `Dompet\\` → `src/`, pindahkan class `Dompet` dan `SaldoTidakCukup` ke file masing-masing, lalu jalankan lewat `bin/app.php`.',
        'Tambahkan Pint dan PHPStan sebagai dev dependency, buat script `lint` dan `analyse`, lalu perbaiki semua temuan di level 8.',
        'Tulis global handler dengan `set_exception_handler` yang mencetak pesan ramah dan mencatat detail ke file log.',
        'Jalankan `composer audit` dan `composer outdated --direct` lalu catat hasilnya.',
      ]),
      references(
        ['PHP Manual: Exceptions', 'https://www.php.net/manual/en/language.exceptions.php'],
        ['PHP Manual: Errors in PHP 7+', 'https://www.php.net/manual/en/language.errors.php7.php'],
        ['Composer: Basic usage', 'https://getcomposer.org/doc/01-basic-usage.md'],
        ['PHP-FIG: PSR-4 Autoloader', 'https://www.php-fig.org/psr/psr-4/'],
        ['PHP-FIG: PER Coding Style', 'https://www.php-fig.org/per/coding-style/'],
        ['Laravel Pint', 'https://laravel.com/docs/pint'],
        ['PHPStan: Getting started', 'https://phpstan.org/user-guide/getting-started'],
      ),
    ],
  },
  {
    id: 'php-modern',
    title: 'PHP Modern 8.x: match, Enum, Property Hooks & Lainnya',
    summary: 'strict_types, match, nullsafe, readonly class, first-class callable, #[\\Override], property hooks & asymmetric visibility (8.4), serta pipe operator (8.5).',
    track: DASAR, source: phpSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Setiap rilis PHP 8.x (satu per tahun, setiap November) menambah fitur yang membuat kode lebih ringkas dan lebih aman tipe. Kode Laravel 12 dan library modern memakai fitur ini secara luas, jadi mengenalinya penting walau proyek lama Anda masih di versi sebelumnya. Modul ini merangkum fitur yang paling sering muncul, dikelompokkan dari yang paling umum sampai yang terbaru.'),
      code('strict_types, match, nullsafe', `<?php

declare(strict_types=1);   // berlaku untuk PEMANGGILAN fungsi dari file ini

function kuadrat(int $x): int
{
    return $x * $x;
}

// kuadrat('5');           // TypeError dengan strict_types=1; tanpa itu '5' diam-diam dikonversi jadi 5

function deskripsiStatus(int $kode): string
{
    return match (true) {                    // match: ekspresi, perbandingan ===, tanpa fallthrough
        $kode >= 500 => 'kesalahan server',
        $kode >= 400 => 'kesalahan klien',
        $kode >= 200 && $kode < 300 => 'sukses',
        default => 'lainnya',
    };
}

$tanda = match ('pengeluaran') {
    'pemasukan' => '+',
    'pengeluaran', 'transfer' => '-',        // beberapa nilai dalam satu cabang
};                                           // nilai lain → UnhandledMatchError (tidak diam-diam null)

final class Alamat { public function __construct(public ?string $kota = null) {} }
final class Pengguna { public function __construct(public ?Alamat $alamat = null) {} }

$p = new Pengguna();
$kota = $p?->alamat?->kota ?? 'tidak diketahui';   // nullsafe: berhenti dan menghasilkan null di rantai mana pun

echo deskripsiStatus(404), " $tanda $kota", PHP_EOL;`, 'php'),
      code('readonly class, new in initializer, first-class callable, #[\\Override]', `<?php

declare(strict_types=1);

enum JenisTransaksi: string { case Pemasukan = 'pemasukan'; case Pengeluaran = 'pengeluaran'; }

final readonly class TransaksiDto                       // 8.2: semua properti otomatis readonly
{
    public const string VERSI_SKEMA = 'v1';             // 8.3: typed class constant

    public function __construct(
        public int $id,
        public JenisTransaksi $jenis,
        public string $deskripsi,
        public int $jumlah,
        public DateTimeImmutable $tanggal = new DateTimeImmutable(),   // 8.1: new di nilai default
    ) {}

    public function denganJumlah(int $jumlah): self     // "wither": salinan dengan satu perubahan
    {
        return new self($this->id, $this->jenis, $this->deskripsi, $jumlah, $this->tanggal);
    }
}

abstract class Formatter
{
    abstract public function format(int $jumlah): string;
}

final class RupiahFormatter extends Formatter
{
    #[\\Override]                                        // 8.3: error bila parent tidak punya method ini
    public function format(int $jumlah): string
    {
        return 'Rp' . number_format($jumlah, 0, ',', '.');
    }
}

$dto = new TransaksiDto(1, JenisTransaksi::Pengeluaran, 'Kopi', 18_000);
$naik = $dto->denganJumlah(20_000);

$fmt = new RupiahFormatter();
$keRupiah = $fmt->format(...);                          // 8.1: first-class callable → Closure
$besar = strtoupper(...);

print_r(array_map($keRupiah, [$dto->jumlah, $naik->jumlah]));  // [Rp18.000, Rp20.000]
echo $besar($dto->jenis->value), ' ', TransaksiDto::VERSI_SKEMA, PHP_EOL;`, 'php'),
      code('PHP 8.4: property hooks & asymmetric visibility', `<?php

declare(strict_types=1);

final class Akun
{
    public private(set) string $email;                  // dibaca publik, ditulis hanya dari dalam class

    public string $nama {
        set (string $value) {                           // set hook: validasi/normalisasi saat di-assign
            $value = trim($value);
            if ($value === '') {
                throw new InvalidArgumentException('nama wajib diisi');
            }
            $this->nama = $value;                       // menulis ke nilai asli (backing value)
        }
    }

    public string $inisial {                            // virtual property: dihitung, tanpa penyimpanan
        get => mb_strtoupper(mb_substr($this->nama, 0, 1));
    }

    public function __construct(string $nama, string $email)
    {
        $this->nama = $nama;                            // melewati set hook juga
        $this->gantiEmail($email);
    }

    public function gantiEmail(string $email): void
    {
        $this->email = strtolower(trim($email));
    }
}

$a = new Akun('  sari  ', 'Sari@Contoh.ID');
echo $a->nama, ' ', $a->inisial, ' ', $a->email, PHP_EOL;  // sari S sari@contoh.id
$a->nama = 'Sari Dewi';                                    // lewat set hook
// $a->email = 'x@y.z';                                    // Error: visibility set adalah private
// $a->nama = '   ';                                       // InvalidArgumentException

echo new Akun('Budi', 'b@contoh.id')->inisial, PHP_EOL;    // 8.4: new tanpa kurung pembungkus`, 'php'),
      code('PHP 8.5: pipe operator dan array_first/array_last', `<?php

declare(strict_types=1);

// |> mengirim nilai di kiri sebagai satu-satunya argumen callable di kanan
$slug = '  Laporan Bulanan Oktober  '
    |> trim(...)
    |> strtolower(...)
    |> (fn (string $s): string => str_replace(' ', '-', $s));   // arrow fn wajib diberi kurung

echo $slug, PHP_EOL;                                  // laporan-bulanan-oktober

$jumlah = [30_000, 10_000, 20_000];
var_dump(array_first($jumlah), array_last($jumlah));  // 30000, 20000 (null bila array kosong)

// Padanan sebelum 8.5:
$slugLama = str_replace(' ', '-', strtolower(trim('  Laporan Bulanan Oktober  ')));
$pertama = $jumlah[array_key_first($jumlah)] ?? null;`, 'php'),
      table(['Versi', 'Fitur yang paling sering dipakai'], [
        ['8.0 (2020)', '`match`, nullsafe `?->`, named argument, constructor promotion, union type, attribute `#[...]`, `str_contains`, `throw` sebagai ekspresi'],
        ['8.1 (2021)', '`enum`, `readonly` property, first-class callable `f(...)`, `new` di initializer, tipe `never`, Fibers, `array_is_list`'],
        ['8.2 (2022)', '`readonly class`, DNF type `(A&B)|null`, tipe `true`/`false`/`null`, dynamic property deprecated'],
        ['8.3 (2023)', 'Typed class constant, `#[\\Override]`, `json_validate()`, readonly bisa diinisialisasi ulang di `__clone`'],
        ['8.4 (2024)', '**Property hooks**, **asymmetric visibility** `public private(set)`, `new Foo()->bar()`, `array_find`/`array_any`/`array_all`, `#[\\Deprecated]`, lazy objects, subclass PDO per driver'],
        ['8.5 (2025)', 'Pipe operator `|>`, `array_first`/`array_last`, `clone($obj, [...])` (clone with), `#[\\NoDiscard]`, ekstensi URI'],
      ]),
      callout('info', 'Kapan boleh memakai fitur terbaru', 'Fitur hanya bisa dipakai bila versi PHP di **semua** lingkungan (laptop, CI, server, image Docker) sudah mendukung. Kunci versi minimum di `composer.json` (`"php": ">=8.4"`) agar Composer menolak instalasi di versi lebih lama, dan jalankan PHPStan atau Rector untuk memodernisasi kode lama secara bertahap.'),
      ...quiz([
        ['PHP-12', 'Apa tiga perbedaan utama `match` dibanding `switch`?', '`match` adalah ekspresi yang mengembalikan nilai, memakai perbandingan strict `===` (switch memakai `==`), dan tidak ada fallthrough sehingga tidak perlu `break`. Bila tidak ada cabang yang cocok dan tidak ada `default`, `match` melempar `UnhandledMatchError`.'],
        ['PHP-13', 'Kapan memakai property hook dibanding getter/setter biasa?', 'Saat ingin mempertahankan sintaks properti (`$akun->nama = ...`) tetapi tetap memvalidasi atau menormalisasi nilai, atau menyediakan properti terhitung (virtual). Hook membuat API class tetap sederhana dan bisa ditambahkan belakangan tanpa mengubah pemanggil. Getter/setter tetap wajar bila operasinya punya efek samping besar atau butuh parameter tambahan.'],
        ['PHP-14', 'Apa beda `readonly` dan `public private(set)`?', '`readonly` hanya boleh diisi sekali (biasanya di constructor) dan tidak bisa diubah lagi, bahkan dari dalam class. `public private(set)` boleh diubah berkali-kali, tetapi hanya dari dalam class; dari luar hanya bisa dibaca. Pilih readonly untuk value object, asymmetric visibility untuk entity yang statusnya berubah lewat method.'],
      ]),
      ...practice('php-modern', [
        'Ubah fungsi `switch` lama (status HTTP atau kategori saldo) menjadi `match` dan uji cabang yang tidak tercakup sampai muncul `UnhandledMatchError`.',
        'Buat `final readonly class TransaksiDto` dengan method `denganJumlah()` dan buktikan objek aslinya tidak berubah.',
        'Tulis class `Akun` dengan property hook untuk `nama`, virtual property `inisial`, dan `public private(set)` untuk `email` (butuh PHP 8.4).',
        'Bila PHP 8.5 tersedia, tulis ulang satu rantai pemanggilan fungsi bersarang memakai pipe operator.',
      ]),
      references(
        ['PHP Manual: match', 'https://www.php.net/manual/en/control-structures.match.php'],
        ['PHP Manual: Property hooks', 'https://www.php.net/manual/en/language.oop5.property-hooks.php'],
        ['PHP Manual: Asymmetric property visibility', 'https://www.php.net/manual/en/language.oop5.visibility.php#language.oop5.visibility-members-aviz'],
        ['PHP 8.4 Release Announcement', 'https://www.php.net/releases/8.4/en.php'],
        ['PHP 8.5 Release Announcement', 'https://www.php.net/releases/8.5/en.php'],
      ),
    ],
  },
  {
    id: 'php-pdo-database',
    title: 'PHP & Database: PDO, Prepared Statement & Transaksi',
    summary: 'Koneksi PDO ke SQLite/MySQL/PostgreSQL, opsi aman, prepared statement, fetch mode, transaksi, dan cara mencegah SQL injection termasuk untuk ORDER BY dan IN.',
    track: DASAR, source: phpSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('**PDO** (PHP Data Objects) adalah lapisan akses database bawaan PHP dengan API yang sama untuk SQLite, MySQL/MariaDB, PostgreSQL, dan lainnya. Eloquent dan Query Builder Laravel dibangun di atas PDO, jadi memahami PDO membuat Anda paham apa yang terjadi di balik ORM: koneksi, *prepared statement*, binding parameter, dan transaksi. Ini juga cara standar menulis query aman di proyek PHP tanpa framework.'),
      code('Koneksi dengan opsi yang aman', `<?php

declare(strict_types=1);

function koneksi(): PDO
{
    // MySQL    : 'mysql:host=127.0.0.1;port=3306;dbname=dompet;charset=utf8mb4'
    // PostgreSQL: 'pgsql:host=127.0.0.1;port=5432;dbname=dompet'
    $dsn = getenv('DB_DSN') ?: 'sqlite:' . __DIR__ . '/dompet.sqlite';

    return new PDO($dsn, getenv('DB_USER') ?: null, getenv('DB_PASS') ?: null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,      // default sejak PHP 8; tulis eksplisit
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // baris sebagai array asosiatif
        PDO::ATTR_EMULATE_PREPARES => false,              // pakai prepared statement asli di server
    ]);
}

$pdo = koneksi();
$pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS transaksi (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        jenis     TEXT    NOT NULL CHECK (jenis IN ('pemasukan', 'pengeluaran')),
        deskripsi TEXT    NOT NULL,
        jumlah    INTEGER NOT NULL CHECK (jumlah > 0),
        tanggal   TEXT    NOT NULL
    )
    SQL);`, 'php'),
      code('Repositori dengan prepared statement', `<?php

declare(strict_types=1);

final class RepositoriTransaksiPdo
{
    private const KOLOM_URUT = ['tanggal', 'jumlah', 'id'];   // whitelist untuk ORDER BY

    public function __construct(private PDO $pdo) {}

    public function simpan(string $jenis, string $deskripsi, int $jumlah): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO transaksi (jenis, deskripsi, jumlah, tanggal)
             VALUES (:jenis, :deskripsi, :jumlah, :tanggal)'
        );
        $stmt->execute([
            'jenis' => $jenis,
            'deskripsi' => $deskripsi,
            'jumlah' => $jumlah,
            'tanggal' => gmdate('Y-m-d\\TH:i:s\\Z'),
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function cari(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM transaksi WHERE id = ?');   // placeholder posisi
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;                        // fetch() → false bila tidak ada baris
    }

    /** @return list<array<string, mixed>> */
    public function daftar(?string $jenis = null, string $urut = 'tanggal', int $limit = 50): array
    {
        $kolom = in_array($urut, self::KOLOM_URUT, true) ? $urut : 'tanggal';  // nama kolom TIDAK bisa di-bind
        $sql = 'SELECT * FROM transaksi';
        if ($jenis !== null) {
            $sql .= ' WHERE jenis = :jenis';
        }
        $stmt = $this->pdo->prepare("$sql ORDER BY $kolom DESC LIMIT :limit");
        if ($jenis !== null) {
            $stmt->bindValue(':jenis', $jenis);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);   // LIMIT harus bertipe integer
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /** @param list<int> $ids */
    public function hapusBanyak(array $ids): int
    {
        if ($ids === []) {
            return 0;
        }
        $tanda = implode(', ', array_fill(0, count($ids), '?'));   // "?, ?, ?"
        $stmt = $this->pdo->prepare("DELETE FROM transaksi WHERE id IN ($tanda)");
        $stmt->execute(array_values($ids));
        return $stmt->rowCount();
    }
}`, 'php'),
      code('Transaksi database: semua atau tidak sama sekali', `<?php

declare(strict_types=1);

/** @param list<array{0: string, 1: string, 2: int}> $baris */
function imporMutasi(PDO $pdo, array $baris): int
{
    $stmt = $pdo->prepare('INSERT INTO transaksi (jenis, deskripsi, jumlah, tanggal) VALUES (?, ?, ?, ?)');

    $pdo->beginTransaction();
    try {
        foreach ($baris as [$jenis, $deskripsi, $jumlah]) {
            $stmt->execute([$jenis, $deskripsi, $jumlah, gmdate(DATE_ATOM)]);
        }
        $pdo->commit();                       // semua baris tersimpan bersamaan
        return count($baris);
    } catch (Throwable $e) {
        $pdo->rollBack();                     // satu gagal (mis. jumlah 0 melanggar CHECK) → batalkan semua
        throw $e;
    }
}

imporMutasi(koneksi(), [
    ['pemasukan', 'Gaji Oktober', 8_000_000],
    ['pengeluaran', 'Sewa kos', 1_500_000],
]);`, 'php'),
      code('SQL injection: salah vs benar', `<?php

// SALAH: input pengguna digabung langsung ke string SQL
$id = $_GET['id'];                                   // penyerang mengirim: 0 OR 1=1
$rows = $pdo->query("SELECT * FROM transaksi WHERE id = $id")->fetchAll();   // semua baris bocor

$cari = $_GET['q'];                                  // penyerang mengirim: x' OR '1'='1
$pdo->query("SELECT * FROM transaksi WHERE deskripsi LIKE '%$cari%'");

// BENAR: data dikirim terpisah dari SQL lewat placeholder
$stmt = $pdo->prepare('SELECT * FROM transaksi WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);

$stmt = $pdo->prepare('SELECT * FROM transaksi WHERE deskripsi LIKE ?');
$stmt->execute(['%' . ($_GET['q'] ?? '') . '%']);   // wildcard ditempel di nilai, bukan di SQL`, 'php'),
      table(['Kebutuhan', 'Cara aman di PDO', 'Catatan'], [
        ['Nilai di WHERE/INSERT/UPDATE', '`prepare` + `execute([...])` dengan `?` atau `:nama`', 'Jangan pernah interpolasi `$_GET`/`$_POST` ke SQL'],
        ['`LIMIT`/`OFFSET`', '`bindValue(\':limit\', $n, PDO::PARAM_INT)`', 'Dengan emulasi aktif di MySQL, nilai string membuat query error'],
        ['Nama kolom/tabel, arah `ASC/DESC`', 'Whitelist (`in_array(..., true)`) atau `match`', 'Identifier tidak bisa di-bind'],
        ['Daftar `IN (...)`', 'Bangun `?, ?, ?` sesuai jumlah elemen', 'Tetap kirim nilai lewat `execute`'],
        ['Beberapa query atomik', '`beginTransaction` / `commit` / `rollBack`', 'Lihat juga [Transaksi & Konkurensi](#sql.transaksi-konkurensi)'],
        ['Password pengguna', '`password_hash()` / `password_verify()`', 'Jangan simpan plaintext atau MD5/SHA1'],
      ]),
      callout('warn', 'Prepared statement bukan obat untuk segalanya', 'Placeholder melindungi **nilai**, bukan struktur query. Nama kolom untuk sorting, nama tabel, dan kata kunci SQL harus divalidasi dengan whitelist. Akun database aplikasi juga sebaiknya hanya punya hak yang diperlukan. Pembahasan lengkap jenis injection dan pencegahannya ada di [Injection: SQL, Command & Path Traversal](#web.sec-injection).'),
      ...quiz([
        ['PHP-15', 'Mengapa prepared statement mencegah SQL injection?', 'Karena struktur SQL dikirim dan diparse oleh database lebih dulu, lalu nilai parameter dikirim terpisah dan selalu diperlakukan sebagai data. Input seperti `0 OR 1=1` hanya menjadi nilai literal yang dibandingkan, tidak pernah dieksekusi sebagai bagian dari query.'],
        ['PHP-16', 'Bagaimana menerima parameter `?urut=jumlah` untuk ORDER BY dengan aman?', 'Identifier tidak bisa di-bind, jadi cocokkan nilai dengan whitelist kolom yang diizinkan (`in_array($urut, [\'tanggal\', \'jumlah\'], true)`) atau `match`, dan pakai nilai default bila tidak cocok. Arah urutan juga dibatasi hanya `ASC` atau `DESC`.'],
        ['PHP-17', 'Apa yang terjadi bila exception terjadi setelah `beginTransaction()` tetapi Anda lupa `rollBack()`?', 'Transaksi tetap terbuka sampai koneksi ditutup; pada akhir skrip PDO akan me-rollback otomatis, tetapi selama itu lock bisa tertahan dan pada koneksi persisten state bisa bocor ke request berikutnya. Selalu bungkus dengan try/catch yang memanggil `rollBack()` lalu melempar ulang exception.'],
      ]),
      ...practice('php-pdo', [
        'Buat tabel `transaksi` di SQLite lewat PDO dan implementasikan `RepositoriTransaksiPdo` (simpan, cari, daftar, hapusBanyak).',
        'Tambahkan method `ringkasan()` yang menghitung pemasukan, pengeluaran, dan saldo dengan satu query `SUM(CASE WHEN ...)`.',
        'Coba serangan `0 OR 1=1` pada versi query yang digabung string, lalu buktikan versi prepared statement menolaknya.',
        'Jalankan `imporMutasi` dengan satu baris berjumlah 0 dan pastikan tidak ada baris lain yang tersimpan.',
      ]),
      references(
        ['PHP Manual: PDO', 'https://www.php.net/manual/en/book.pdo.php'],
        ['PHP Manual: Prepared statements', 'https://www.php.net/manual/en/pdo.prepared-statements.php'],
        ['PHP Manual: Transactions and auto-commit', 'https://www.php.net/manual/en/pdo.transactions.php'],
        ['PHP Manual: password_hash', 'https://www.php.net/manual/en/function.password-hash.php'],
        ['OWASP: SQL Injection Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'],
      ),
    ],
  },
  {
    id: 'lv-dasar-routing',
    title: 'Laravel: Instalasi, Struktur, Routing, Controller & Blade',
    summary: 'laravel new dan starter kit, struktur folder Laravel 12, Artisan, routing dengan parameter & nama, controller, route model binding, dan template Blade.',
    track: LV_DASAR, source: phpSource, duration: '2,5 jam', level: 'Easy',
    blocks: [
      paragraph('Laravel adalah framework PHP paling populer: routing, ORM (Eloquent), validasi, queue, autentikasi, dan testing tersedia dalam satu paket dengan dokumentasi yang sangat rapi. Filosofinya *convention over configuration*: bila Anda mengikuti penamaan standar (model `Transaksi`, controller `TransaksiController`, policy `TransaksiPolicy`), framework menyambungkan bagian-bagiannya sendiri. Perintah **Artisan** (`php artisan ...`) membuat file, menjalankan migrasi, dan banyak lagi.'),
      paragraph('Materi ini ditulis untuk **Laravel 12** (rilis 24 Februari 2025, butuh PHP 8.2+). Laravel merilis versi mayor setiap tahun dan menjadwalkan Laravel 13 pada kuartal pertama 2026; konsep di modul ini tetap sama, tetapi cek [Release Notes](https://laravel.com/docs/releases) dan panduan upgrade untuk versi terbaru sebelum memulai proyek baru.'),
      code('Membuat dan menjalankan proyek', `composer global require laravel/installer    # sekali saja (Herd dan php.new sudah menyertakannya)
laravel new dompet                           # pilih starter kit (None/React/Vue/Livewire), Pest/PHPUnit, database
# alternatif tanpa installer:
composer create-project laravel/laravel dompet

cd dompet
php artisan serve                            # http://127.0.0.1:8000
composer run dev                             # server + queue worker + log (Pail) + Vite sekaligus

php artisan about                            # versi, driver, environment
php artisan route:list                       # semua route terdaftar
php artisan make:controller TransaksiController
php artisan tinker                           # REPL dengan seluruh aplikasi termuat`, 'bash'),
      code('routes/web.php: route, parameter, nama, grup', `<?php

use App\\Http\\Controllers\\TransaksiController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/', fn () => view('welcome'));

Route::get('/halo/{nama?}', function (?string $nama = null) {   // parameter opsional
    return 'Halo, ' . e($nama ?? 'tamu');                          // e() = htmlspecialchars
});

Route::get('/kurs', fn () => ['USD' => 16_250, 'SGD' => 12_100]);  // array → respons JSON otomatis

Route::controller(TransaksiController::class)
    ->prefix('transaksi')
    ->name('transaksi.')
    ->group(function () {
        Route::get('/', 'index')->name('index');                     // GET  /transaksi
        Route::get('/buat', 'create')->name('create');               // GET  /transaksi/buat
        Route::post('/', 'store')->name('store');                    // POST /transaksi
        Route::get('/{transaksi}', 'show')->whereNumber('transaksi')->name('show');
    });

// Satu baris untuk 7 route CRUD (index, create, store, show, edit, update, destroy):
// Route::resource('transaksi', TransaksiController::class);
// Di kode: route('transaksi.show', $t) → /transaksi/5`, 'php'),
      code('app/Http/Controllers/TransaksiController.php', `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Transaksi;                      // model dibuat di modul Eloquent berikutnya
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;
use Illuminate\\View\\View;

class TransaksiController extends Controller
{
    public function index(Request $request): View
    {
        $jenis = $request->query('jenis');      // ?jenis=pengeluaran

        $items = Transaksi::query()
            ->when($jenis, fn ($q) => $q->where('jenis', $jenis))   // filter hanya bila ada
            ->latest('tanggal')
            ->paginate(20);

        return view('transaksi.index', ['items' => $items, 'jenis' => $jenis]);
    }

    public function create(): View
    {
        return view('transaksi.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([            // gagal → redirect balik + pesan error + input lama
            'jenis' => ['required', 'in:pemasukan,pengeluaran'],
            'deskripsi' => ['required', 'string', 'max:255'],
            'jumlah' => ['required', 'integer', 'min:1'],
        ]);

        Transaksi::create([...$data, 'tanggal' => now()]);

        return redirect()->route('transaksi.index')->with('status', 'Transaksi tersimpan');
    }

    public function show(Transaksi $transaksi): View   // route model binding: 404 otomatis bila tidak ada
    {
        return view('transaksi.show', ['transaksi' => $transaksi]);
    }
}`, 'php'),
      code('Blade: layout component, daftar, dan form', `{{-- resources/views/components/layout.blade.php --}}
@props(['judul' => 'Dompet'])
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $judul }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    @session('status')
        <p class="notice">{{ $value }}</p>
    @endsession
    {{ $slot }}
</body>
</html>

{{-- resources/views/transaksi/index.blade.php --}}
<x-layout judul="Transaksi">
    <a href="{{ route('transaksi.create') }}">Tambah transaksi</a>
    <table>
        @forelse ($items as $t)
            <tr>
                <td>{{ $t->tanggal->format('d M Y') }}</td>
                <td>{{ $t->deskripsi }}</td>  {{-- {{ }} meng-escape HTML: aman dari XSS --}}
                <td @class(['merah' => $t->jenis === 'pengeluaran'])>Rp{{ number_format($t->jumlah, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr><td colspan="3">Belum ada transaksi.</td></tr>
        @endforelse
    </table>
    {{ $items->withQueryString()->links() }}
</x-layout>

{{-- resources/views/transaksi/create.blade.php --}}
<x-layout judul="Tambah transaksi">
    <form method="POST" action="{{ route('transaksi.store') }}">
        @csrf  {{-- token CSRF wajib untuk POST/PUT/DELETE dari form web --}}
        <select name="jenis">
            <option value="pengeluaran" @selected(old('jenis') === 'pengeluaran')>Pengeluaran</option>
            <option value="pemasukan" @selected(old('jenis') === 'pemasukan')>Pemasukan</option>
        </select>
        <input name="deskripsi" value="{{ old('deskripsi') }}">
        @error('deskripsi') <small>{{ $message }}</small> @enderror
        <input name="jumlah" type="number" value="{{ old('jumlah') }}">
        @error('jumlah') <small>{{ $message }}</small> @enderror
        <button type="submit">Simpan</button>
    </form>
</x-layout>`, 'html'),
      table(['Lokasi', 'Isi'], [
        ['`app/Http/Controllers`, `app/Models`', 'Controller dan model Eloquent'],
        ['`app/Providers/AppServiceProvider.php`', 'Tempat konfigurasi saat boot: binding container, Gate, rate limiter, pengaturan model'],
        ['`bootstrap/app.php`', 'Konfigurasi routing, middleware, dan penanganan exception (pengganti `Kernel.php` sejak Laravel 11)'],
        ['`routes/web.php`, `routes/console.php`', 'Route web (session, CSRF) dan command/scheduler; `routes/api.php` dibuat oleh `php artisan install:api`'],
        ['`config/`, `.env`', 'Konfigurasi; nilai rahasia dan per-lingkungan di `.env` (jangan di-commit)'],
        ['`database/migrations`, `factories`, `seeders`', 'Skema database, data palsu untuk test, data awal'],
        ['`resources/views`', 'Template Blade'],
        ['`public/index.php`', 'Satu-satunya pintu masuk HTTP; document root server harus `public/`'],
        ['`storage/`, `tests/`', 'Log, cache, file upload; test Pest/PHPUnit'],
      ]),
      callout('tip', 'Facade, helper, dan container', '`Route::get`, `Cache::get`, `DB::table` adalah *facade*: akses statis ke objek yang sebenarnya diambil dari **service container**. Helper seperti `view()`, `route()`, `now()`, dan `config()` melakukan hal serupa. Di controller, Anda juga bisa meminta dependency lewat type hint di constructor atau parameter method, dan container akan mengisinya otomatis (dependency injection).'),
      ...quiz([
        ['PHP-18', 'Apa yang terjadi bila `GET /transaksi/999` dipanggil dan transaksi 999 tidak ada, pada method `show(Transaksi $transaksi)`?', 'Route model binding mencari `Transaksi::findOrFail(999)`. Karena tidak ada, Laravel melempar `ModelNotFoundException` yang diubah menjadi respons 404, tanpa kode tambahan di controller.'],
        ['PHP-19', 'Mengapa `{{ $t->deskripsi }}` aman, sedangkan `{!! $t->deskripsi !!}` berbahaya?', '`{{ }}` melewatkan nilai ke `htmlspecialchars`, sehingga `<script>` tampil sebagai teks. `{!! !!}` mencetak HTML mentah; bila isinya berasal dari pengguna, penyerang bisa menyisipkan script (stored XSS). Pakai `{!! !!}` hanya untuk HTML yang sudah Anda sanitasi. Lihat [XSS & CSRF](#web.sec-xss-csrf).'],
        ['PHP-20', 'Mengapa form POST di `routes/web.php` wajib punya `@csrf`?', 'Route web memakai middleware verifikasi CSRF. Token di form membuktikan request berasal dari halaman aplikasi sendiri, bukan dari situs lain yang memanfaatkan cookie session pengguna. Tanpa token, Laravel menolak dengan status 419.'],
      ]),
      ...practice('lv-dasar', [
        'Buat proyek dengan `laravel new dompet` (tanpa starter kit, Pest, SQLite) dan jalankan `composer run dev`.',
        'Tambahkan route `/halo/{nama?}` dan `/kurs`, lalu lihat hasilnya di `php artisan route:list`.',
        'Buat layout component `<x-layout>` dan halaman daftar transaksi dari array statis di controller sebelum memakai database.',
        'Buat form tambah transaksi dengan `@csrf`, `old()`, dan `@error`; coba kirim jumlah kosong dan amati pesan validasinya.',
      ]),
      references(
        ['Laravel: Installation', 'https://laravel.com/docs/installation'],
        ['Laravel: Directory Structure', 'https://laravel.com/docs/structure'],
        ['Laravel: Routing', 'https://laravel.com/docs/routing'],
        ['Laravel: Controllers', 'https://laravel.com/docs/controllers'],
        ['Laravel: Blade Templates', 'https://laravel.com/docs/blade'],
        ['Laravel: Release Notes', 'https://laravel.com/docs/releases'],
      ),
    ],
  },
  {
    id: 'lv-eloquent',
    title: 'Laravel: Eloquent, Migration, Relasi & Factory',
    summary: 'Migration dan foreign key, model Eloquent dengan casts & enum, mass assignment, relasi, scope, eager loading untuk mencegah N+1, agregat relasi, factory, dan seeder.',
    track: LV_DASAR, source: phpSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('**Eloquent** adalah ORM Active Record milik Laravel: satu class model mewakili satu tabel, dan satu objek mewakili satu baris. **Migration** menyimpan skema database sebagai kode yang di-versioning bersama aplikasi, sehingga semua developer dan server bisa membangun skema yang sama dengan `php artisan migrate`. **Factory** dan **seeder** mengisi data palsu untuk development dan test.'),
      code('Artisan untuk model dan migration', `php artisan make:enum Enums/JenisTransaksi      # enum PHP di app/Enums
php artisan make:model Kategori -mf            # model + migration + factory
php artisan make:model Transaksi -mfs          # + seeder
php artisan migrate                            # jalankan migration yang belum dijalankan
php artisan migrate:status
php artisan migrate:rollback                   # batalkan batch terakhir
php artisan migrate:fresh --seed               # HANYA development: drop semua tabel, migrate, lalu seed
php artisan make:migration add_catatan_to_transaksi_table`, 'bash'),
      code('Migration dengan foreign key dan index', `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();   // → users.id
            $table->string('nama', 50);
            $table->timestamps();
            $table->unique(['user_id', 'nama']);
        });

        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('kategori_id')->nullable()->constrained('kategori')->nullOnDelete();
            $table->string('jenis', 20);
            $table->string('deskripsi');
            $table->unsignedBigInteger('jumlah');          // rupiah sebagai integer, bukan float
            $table->timestamp('tanggal');
            $table->timestamps();                          // created_at, updated_at
            $table->index(['user_id', 'tanggal']);         // untuk query "transaksi saya, urut tanggal"
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
        Schema::dropIfExists('kategori');
    }
};`, 'php'),
      code('Model: casts, enum, relasi, scope', `<?php

// app/Enums/JenisTransaksi.php
namespace App\\Enums;

enum JenisTransaksi: string
{
    case Pemasukan = 'pemasukan';
    case Pengeluaran = 'pengeluaran';
}

// app/Models/Transaksi.php
namespace App\\Models;

use App\\Enums\\JenisTransaksi;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';                 // default Laravel menebak "transaksis" (bahasa Inggris)

    protected $fillable = ['kategori_id', 'jenis', 'deskripsi', 'jumlah', 'tanggal'];   // user_id sengaja tidak

    protected function casts(): array
    {
        return [
            'jenis' => JenisTransaksi::class,       // string di DB ↔ enum di PHP
            'jumlah' => 'integer',
            'tanggal' => 'immutable_datetime',      // CarbonImmutable
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function scopeJenis(Builder $query, JenisTransaksi $jenis): void   // dipakai: ->jenis(...)
    {
        $query->where('jenis', $jenis->value);
    }
}

// app/Models/User.php (tambahkan)
//     public function transaksi(): HasMany { return $this->hasMany(Transaksi::class); }
// app/Models/Kategori.php: protected $table = 'kategori'; + hasMany(Transaksi::class)`, 'php'),
      code('Query, relasi, dan N+1', `<?php

use App\\Enums\\JenisTransaksi;
use App\\Models\\Transaksi;
use App\\Models\\User;

$user = User::findOrFail(1);

// Membuat lewat relasi: user_id diisi otomatis dari relasi, aman walau tidak ada di $fillable
$t = $user->transaksi()->create([
    'jenis' => JenisTransaksi::Pengeluaran,
    'deskripsi' => 'Makan siang',
    'jumlah' => 35_000,
    'tanggal' => now(),
]);

$bulanIni = $user->transaksi()
    ->jenis(JenisTransaksi::Pengeluaran)
    ->whereBetween('tanggal', [now()->startOfMonth(), now()->endOfMonth()])
    ->orderByDesc('tanggal')
    ->get();
$totalKeluar = (int) $user->transaksi()->jenis(JenisTransaksi::Pengeluaran)->sum('jumlah');

// N+1: 1 query transaksi + 1 query kategori UNTUK SETIAP baris (51 query untuk 50 baris)
foreach (Transaksi::latest('tanggal')->take(50)->get() as $trx) {
    echo $trx->kategori?->nama;
}

// Eager loading: 2 query berapa pun jumlah barisnya
$daftar = Transaksi::with(['kategori:id,nama', 'user:id,name'])
    ->latest('tanggal')
    ->paginate(20);

// Agregat relasi tanpa memuat semua baris anak
$pengguna = User::withCount('transaksi')
    ->withSum(['transaksi as total_keluar' => fn ($q) => $q->where('jenis', 'pengeluaran')], 'jumlah')
    ->get();                                       // $u->transaksi_count, $u->total_keluar

// app/Providers/AppServiceProvider.php → boot():
//     Model::preventLazyLoading(! $this->app->isProduction());   // N+1 jadi exception di dev & test`, 'php'),
      code('Factory dan seeder', `<?php

// database/factories/TransaksiFactory.php
namespace Database\\Factories;

use App\\Enums\\JenisTransaksi;
use App\\Models\\User;
use Illuminate\\Database\\Eloquent\\Factories\\Factory;

/** @extends Factory<\\App\\Models\\Transaksi> */
class TransaksiFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),               // buat user baru bila tidak ditentukan
            'jenis' => fake()->randomElement(JenisTransaksi::cases()),
            'deskripsi' => fake()->words(3, true),
            'jumlah' => fake()->numberBetween(5_000, 2_000_000),
            'tanggal' => fake()->dateTimeBetween('-3 months'),
        ];
    }

    public function pemasukan(): static                 // state: Transaksi::factory()->pemasukan()
    {
        return $this->state(fn () => ['jenis' => JenisTransaksi::Pemasukan]);
    }
}

// database/seeders/DatabaseSeeder.php → run():
//     $demo = User::factory()->create(['email' => 'demo@contoh.id']);
//     Transaksi::factory()->count(30)->for($demo)->create();
//     Transaksi::factory()->count(3)->pemasukan()->for($demo)->create();
//     User::factory(5)->has(Transaksi::factory()->count(10), 'transaksi')->create();   // nama relasi eksplisit`, 'php'),
      table(['Relasi', 'Method', 'Contoh'], [
        ['Satu ke satu', '`hasOne` / `belongsTo`', 'User → Profil'],
        ['Satu ke banyak', '`hasMany` / `belongsTo`', 'User → Transaksi, Transaksi → Kategori'],
        ['Banyak ke banyak', '`belongsToMany` (tabel pivot)', 'Transaksi ↔ Tag'],
        ['Lewat perantara', '`hasManyThrough`', 'User → Transaksi lewat Rekening'],
        ['Polimorfik', '`morphMany` / `morphTo`', 'Lampiran milik Transaksi atau Anggaran'],
      ]),
      callout('warn', 'Mass assignment dan nama tabel', 'Jangan memanggil `Transaksi::create($request->all())`: penyerang bisa mengirim field tambahan seperti `user_id`. Batasi dengan `$fillable` dan isi dari data tervalidasi saja. Untuk nama model berbahasa Indonesia, tetapkan `$table` secara eksplisit, dan beri nama relasi saat memakai `has()` di factory, karena Laravel memakai aturan jamak bahasa Inggris.'),
      ...quiz([
        ['PHP-21', 'Apa itu masalah N+1 dan bagaimana Eloquent mengatasinya?', 'N+1 terjadi saat mengambil N baris lalu mengakses relasi di dalam loop, sehingga terjadi 1 query awal + N query relasi. Solusinya eager loading dengan `with(\'kategori\')` (2 query total) atau `load()` setelah data diambil. `Model::preventLazyLoading()` membuat lazy loading melempar exception di development agar N+1 ketahuan lebih awal.'],
        ['PHP-22', 'Mengapa `user_id` tidak dimasukkan ke `$fillable`, dan bagaimana mengisinya?', 'Agar tidak bisa diisi dari input pengguna (mencegah membuat transaksi atas nama orang lain). Isi lewat relasi `$request->user()->transaksi()->create($data)`, yang otomatis mengisi foreign key dari user yang sedang login.'],
        ['PHP-23', 'Apa beda `migrate:fresh` dan `migrate:rollback`?', '`migrate:rollback` menjalankan method `down()` untuk batch migration terakhir. `migrate:fresh` men-drop semua tabel tanpa memanggil `down()`, lalu menjalankan semua migration dari awal. `migrate:fresh` menghapus seluruh data, jadi hanya untuk development dan test.'],
      ]),
      ...practice('lv-eloquent', [
        'Buat migration `kategori` dan `transaksi`, model dengan casts enum, lalu jalankan `php artisan migrate`.',
        'Tulis factory dan seeder: 1 user demo dengan 30 transaksi dan 5 user lain; jalankan `migrate:fresh --seed`.',
        'Pasang Laravel Debugbar atau aktifkan `DB::listen`, tampilkan 50 transaksi beserta kategori, lalu turunkan jumlah query dari 51 menjadi 2 dengan `with()`.',
        'Tambahkan `Model::preventLazyLoading()` dan pastikan N+1 yang tersisa memunculkan exception.',
      ]),
      references(
        ['Laravel: Migrations', 'https://laravel.com/docs/migrations'],
        ['Laravel: Eloquent ORM', 'https://laravel.com/docs/eloquent'],
        ['Laravel: Eloquent Relationships', 'https://laravel.com/docs/eloquent-relationships'],
        ['Laravel: Eloquent Mutators & Casting', 'https://laravel.com/docs/eloquent-mutators'],
        ['Laravel: Eloquent Factories', 'https://laravel.com/docs/eloquent-factories'],
        ['Laravel: Seeding', 'https://laravel.com/docs/seeding'],
      ),
    ],
  },
  {
    id: 'lv-validasi-resource',
    title: 'Laravel: Validasi, Form Request, API Resource & Error Handling',
    summary: 'Aturan validasi, Form Request dengan pesan sendiri, respons 422 bawaan, JsonResource dan koleksi berpaginasi, serta penanganan exception terpusat di bootstrap/app.php.',
    track: LV_DASAR, source: phpSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('API yang baik menolak input salah dengan pesan jelas, mengembalikan bentuk JSON yang konsisten, dan tidak membocorkan detail internal saat error. Di Laravel tiga hal ini ditangani oleh **Form Request** (validasi + otorisasi di luar controller), **API Resource** (transformasi model menjadi JSON, terpisah dari struktur tabel), dan konfigurasi **exception** terpusat di `bootstrap/app.php`. Prinsip desain respons yang konsisten dibahas di [Desain REST API yang Konsisten](#web.web-desain-rest-api).'),
      code('Form Request', `<?php

// php artisan make:request SimpanTransaksiRequest
namespace App\\Http\\Requests;

use App\\Enums\\JenisTransaksi;
use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Validation\\Rule;

class SimpanTransaksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;            // false → 403; cek kepemilikan lewat Policy (modul berikutnya)
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('jenis')) {                // normalisasi sebelum divalidasi
            $this->merge(['jenis' => strtolower((string) $this->input('jenis'))]);
        }
    }

    public function rules(): array
    {
        return [
            'jenis' => ['required', Rule::enum(JenisTransaksi::class)],
            'deskripsi' => ['required', 'string', 'max:255'],
            'jumlah' => ['required', 'integer', 'min:1', 'max:1000000000'],
            'tanggal' => ['nullable', 'date', 'before_or_equal:now'],
            'kategori_id' => [
                'nullable',
                Rule::exists('kategori', 'id')->where('user_id', $this->user()?->id),   // hanya kategori milik sendiri
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'deskripsi.required' => 'deskripsi wajib diisi',
            'jumlah.min' => 'jumlah harus lebih dari 0',
            'kategori_id.exists' => 'kategori tidak ditemukan',
        ];
    }
}`, 'php'),
      code('API Resource dan controller', `<?php

// php artisan make:resource TransaksiResource
namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

/** @mixin \\App\\Models\\Transaksi */
class TransaksiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'jenis' => $this->jenis->value,
            'deskripsi' => $this->deskripsi,
            'jumlah' => $this->jumlah,
            'tanggal' => $this->tanggal->toIso8601ZuluString(),           // 2026-06-04T10:00:00Z
            'kategori' => $this->whenLoaded('kategori', fn () => $this->kategori?->nama),   // hanya bila di-eager load
        ];
    }
}

// app/Http/Controllers/Api/TransaksiController.php (potongan)
namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\SimpanTransaksiRequest;
use App\\Http\\Resources\\TransaksiResource;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;

class TransaksiController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = $request->user()->transaksi()
            ->with('kategori')
            ->latest('tanggal')
            ->paginate(min($request->integer('per_page', 20), 100));   // batasi ukuran halaman

        return TransaksiResource::collection($items);   // {"data": [...], "links": {...}, "meta": {...}}
    }

    public function store(SimpanTransaksiRequest $request): JsonResponse
    {
        $data = $request->validated();                  // hanya field yang lolos rules()
        $data['tanggal'] ??= now();

        $transaksi = $request->user()->transaksi()->create($data);

        return TransaksiResource::make($transaksi->load('kategori'))
            ->response()
            ->setStatusCode(201);
    }
}`, 'php'),
      code('Respons validasi bawaan (422)', `{
  "message": "jumlah harus lebih dari 0 (and 1 more error)",
  "errors": {
    "jumlah": ["jumlah harus lebih dari 0"],
    "deskripsi": ["deskripsi wajib diisi"]
  }
}`, 'json'),
      code('bootstrap/app.php: error handling terpusat & custom exception', `<?php

use App\\Exceptions\\SaldoTidakCukup;
use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;
use Illuminate\\Http\\Request;
use Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Selalu JSON untuk /api/*, walau klien lupa header Accept: application/json
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*') || $request->expectsJson());

        // ModelNotFoundException sudah diubah menjadi NotFoundHttpException saat sampai di sini
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Data tidak ditemukan'], 404);
            }
        });

        $exceptions->dontReport([SaldoTidakCukup::class]);   // kesalahan bisnis yang wajar, tidak perlu dilog
    })->create();

// app/Exceptions/SaldoTidakCukup.php: exception yang tahu cara merender dirinya sendiri
// class SaldoTidakCukup extends \\Exception
// {
//     public function __construct(public readonly int $kurang) { parent::__construct('saldo tidak cukup'); }
//     public function render(): \\Illuminate\\Http\\JsonResponse
//     {
//         return response()->json(['message' => $this->getMessage(), 'kurang' => $this->kurang], 422);
//     }
// }`, 'php'),
      table(['Alat', 'Kapan dipakai'], [
        ['`$request->validate([...])`', 'Validasi singkat di controller kecil'],
        ['Form Request', 'Aturan panjang, pesan sendiri, `authorize()`, dipakai ulang di store/update'],
        ['`Rule::enum`, `Rule::exists(...)->where()`, `Rule::unique(...)->ignore($id)`', 'Aturan yang bergantung pada enum atau isi database'],
        ['`sometimes` / `nullable` / `bail`', 'PATCH parsial / boleh null / berhenti di error pertama untuk field itu'],
        ['`$request->validated()`, `$request->safe()->only([...])`', 'Ambil hanya data yang sudah lolos validasi'],
        ['`JsonResource` / `::collection()`', 'Bentuk JSON stabil; `whenLoaded`, `when`, `whenNotNull` untuk field kondisional'],
        ['`abort(404)`, `abort_if()`, exception dengan `render()`', 'Menghentikan request dengan status tertentu'],
      ]),
      callout('tip', 'Bungkus "data" dan kontrak API', 'Secara default `JsonResource` membungkus hasil dalam `{"data": ...}`, dan validasi gagal menghasilkan **422** dengan `message` + `errors`. Itu konvensi yang baik bila Anda bebas menentukan kontrak. Bila kontrak sudah ditetapkan (misalnya `{"error": "pesan"}` dengan status 400 seperti proyek Financial Tracker), panggil `JsonResource::withoutWrapping()` di `AppServiceProvider` dan ubah render `ValidationException` di `bootstrap/app.php`, seperti di modul proyek.'),
      ...quiz([
        ['PHP-24', 'Mengapa memakai `$request->validated()` dan bukan `$request->all()` saat membuat model?', '`validated()` hanya berisi field yang didefinisikan di `rules()` dan sudah lolos validasi. `all()` berisi semua input, termasuk field yang tidak diharapkan seperti `user_id` atau `is_admin`, sehingga membuka celah mass assignment.'],
        ['PHP-25', 'Apa manfaat API Resource dibanding langsung `return $transaksi;`?', 'Model yang dikembalikan langsung mengekspos semua kolom (termasuk yang seharusnya internal) dan bentuk JSON-nya berubah setiap kali skema tabel berubah. Resource menjadi lapisan kontrak: Anda memilih field, format tanggal, dan nama key secara eksplisit, serta bisa menyertakan relasi hanya bila sudah dimuat.'],
        ['PHP-26', 'Mengapa render callback untuk data yang tidak ditemukan menangkap `NotFoundHttpException`, bukan `ModelNotFoundException`?', 'Karena handler Laravel mengubah `ModelNotFoundException` menjadi `NotFoundHttpException` (dengan exception asli sebagai `previous`) sebelum menjalankan render callback. Untuk membedakan route tidak ada dan model tidak ada, periksa `$e->getPrevious() instanceof ModelNotFoundException`.'],
      ]),
      ...practice('lv-validasi', [
        'Buat `SimpanTransaksiRequest` dengan pesan berbahasa Indonesia dan uji lewat curl: jumlah 0, jenis "hadiah", deskripsi kosong.',
        'Buat `TransaksiResource` dan pastikan field `kategori` hanya muncul saat relasi di-eager load.',
        'Kembalikan daftar transaksi berpaginasi dan periksa isi `links` serta `meta`.',
        'Buat exception `SaldoTidakCukup` dengan method `render()` dan picu dari endpoint tarik saldo.',
      ]),
      references(
        ['Laravel: Validation', 'https://laravel.com/docs/validation'],
        ['Laravel: Form Request Validation', 'https://laravel.com/docs/validation#form-request-validation'],
        ['Laravel: Eloquent API Resources', 'https://laravel.com/docs/eloquent-resources'],
        ['Laravel: Error Handling', 'https://laravel.com/docs/errors'],
      ),
    ],
  },
  {
    id: 'lv-auth-sanctum',
    title: 'Laravel: Autentikasi, Sanctum, Gate & Policy',
    summary: 'Starter kit untuk aplikasi web, Sanctum untuk API token (mobile) dan SPA (cookie), token abilities, rate limit login, serta otorisasi dengan Gate dan Policy.',
    track: LV_DASAR, source: phpSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('**Autentikasi** menjawab "siapa Anda", **otorisasi** menjawab "boleh melakukan apa". Laravel menyediakan keduanya: *starter kit* (React, Vue, atau Livewire) memberi halaman login, registrasi, reset password, dan verifikasi email yang siap pakai untuk aplikasi web, sedangkan **Sanctum** mengamankan API dengan dua mode: token pribadi untuk aplikasi mobile/CLI dan cookie session untuk SPA di domain yang sama. Otorisasi ditulis di **Gate** (aturan umum) dan **Policy** (aturan per model).'),
      code('Instalasi', `# Aplikasi web lengkap dengan UI auth: pilih starter kit saat membuat proyek
laravel new dompet               # React / Vue / Livewire

# API untuk mobile atau SPA: pasang Sanctum, buat routes/api.php dan migration token
php artisan install:api
php artisan migrate              # tabel personal_access_tokens

# Model User perlu trait HasApiTokens:
#   use Laravel\\Sanctum\\HasApiTokens;
#   class User extends Authenticatable { use HasApiTokens, HasFactory, Notifiable; ... }`, 'bash'),
      code('routes/api.php: menerbitkan dan mencabut token', `<?php

use App\\Models\\User;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\Route;
use Illuminate\\Validation\\ValidationException;

Route::post('/token', function (Request $request) {
    $data = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
        'device_name' => ['required', 'string', 'max:100'],
    ]);

    $user = User::where('email', $data['email'])->first();

    if (! $user || ! Hash::check($data['password'], $user->password)) {
        throw ValidationException::withMessages(['email' => ['Email atau password salah.']]);  // pesan sama untuk dua kasus
    }

    $token = $user->createToken($data['device_name'], ['transaksi:read', 'transaksi:write']);

    return response()->json(['token' => $token->plainTextToken], 201);   // ditampilkan sekali, DB hanya simpan hash
})->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', fn (Request $request) => $request->user());

    Route::delete('/token', function (Request $request) {
        $request->user()->currentAccessToken()->delete();          // logout perangkat ini saja
        return response()->noContent();
    });

    Route::get('/laporan', fn (Request $request) => ['ok' => true])
        ->middleware('abilities:transaksi:read');                 // token wajib punya ability ini
});

// Klien: curl -H "Authorization: Bearer 1|AbCd..." -H "Accept: application/json" http://localhost:8000/api/me`, 'php'),
      code('bootstrap/app.php & AppServiceProvider: middleware alias dan rate limit', `<?php

// bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'abilities' => \\Laravel\\Sanctum\\Http\\Middleware\\CheckAbilities::class,
        'ability' => \\Laravel\\Sanctum\\Http\\Middleware\\CheckForAnyAbility::class,
    ]);
    // $middleware->statefulApi();   // aktifkan HANYA bila SPA first-party memakai cookie session
})

// app/Providers/AppServiceProvider.php → boot()
use Illuminate\\Cache\\RateLimiting\\Limit;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\RateLimiter;
use Illuminate\\Support\\Str;

RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by(Str::lower((string) $request->input('email')) . '|' . $request->ip());
});

// SPA (mis. app.dompet.id memanggil api.dompet.id), .env:
//   SANCTUM_STATEFUL_DOMAINS=app.dompet.id
//   SESSION_DOMAIN=.dompet.id
// Frontend: GET /sanctum/csrf-cookie lebih dulu, lalu POST /login dengan withCredentials: true`, 'php'),
      code('Policy dan Gate', `<?php

// php artisan make:policy TransaksiPolicy --model=Transaksi
// Laravel menemukan policy otomatis dari nama: App\\Models\\Transaksi → App\\Policies\\TransaksiPolicy
namespace App\\Policies;

use App\\Models\\Transaksi;
use App\\Models\\User;
use Illuminate\\Auth\\Access\\Response;

class TransaksiPolicy
{
    public function view(User $user, Transaksi $transaksi): bool
    {
        return $transaksi->user()->is($user);              // bandingkan foreign key tanpa query tambahan
    }

    public function update(User $user, Transaksi $transaksi): Response
    {
        return $transaksi->user()->is($user)
            ? Response::allow()
            : Response::denyAsNotFound();                   // 404: jangan bocorkan bahwa data orang lain ada
    }

    public function delete(User $user, Transaksi $transaksi): bool
    {
        return $this->view($user, $transaksi) && $transaksi->created_at->gt(now()->subDays(30));
    }
}

// Pemakaian di controller:
//     Gate::authorize('update', $transaksi);              // gagal → 403 (atau 404 dari denyAsNotFound)
// Di route:   Route::put('/transaksi/{transaksi}', ...)->can('update', 'transaksi');
// Di Form Request: return $this->user()->can('update', $this->route('transaksi'));
// Di Blade:   @can('delete', $transaksi) <button>Hapus</button> @endcan

// Gate untuk aturan yang tidak terkait satu model (AppServiceProvider → boot):
//     Gate::define('ekspor-laporan', fn (User $user) => $user->email_verified_at !== null);`, 'php'),
      table(['Kebutuhan', 'Pilihan di ekosistem Laravel'], [
        ['Web app dengan halaman login', 'Starter kit (React/Vue/Livewire) dengan session'],
        ['API untuk aplikasi mobile/CLI', '**Sanctum** personal access token (`Authorization: Bearer`)'],
        ['SPA first-party di domain yang sama', '**Sanctum** mode SPA: cookie session + CSRF'],
        ['Menjadi OAuth2 server untuk aplikasi pihak ketiga', '**Passport**'],
        ['Login dengan Google/GitHub', '**Socialite**'],
        ['Backend auth tanpa UI (headless)', '**Fortify**'],
      ]),
      callout('warn', 'Otorisasi wajib di server, untuk setiap objek', 'Login saja tidak cukup: tanpa Policy, user A bisa mengubah transaksi user B hanya dengan mengganti ID di URL (IDOR). Selalu batasi query ke milik user (`$request->user()->transaksi()`) atau cek dengan `Gate::authorize`. Beri token ability seminimal mungkin dan atur `expiration` di `config/sanctum.php`. Teori lengkap ada di [Autentikasi](#web.sec-autentikasi) dan [Otorisasi: IDOR, RBAC/ABAC & Multi-Tenant](#web.sec-otorisasi).'),
      ...quiz([
        ['PHP-27', 'Kapan memakai Sanctum mode token dan kapan mode SPA (cookie)?', 'Mode token untuk klien yang bukan browser di domain yang sama: aplikasi mobile, CLI, integrasi server. Mode SPA untuk frontend JavaScript first-party di domain/subdomain yang sama, karena cookie session `HttpOnly` lebih aman dari pencurian lewat XSS dibanding token yang disimpan di `localStorage`, dan CSRF ditangani lewat `/sanctum/csrf-cookie`.'],
        ['PHP-28', 'Mengapa endpoint login memberi pesan yang sama untuk email tidak terdaftar dan password salah?', 'Agar penyerang tidak bisa mengetahui email mana yang terdaftar (user enumeration). Ditambah rate limit per email + IP, serangan tebak password menjadi jauh lebih lambat.'],
        ['PHP-29', 'Apa beda Gate dan Policy?', 'Gate adalah closure untuk aturan umum yang tidak terkait satu model (misalnya boleh mengekspor laporan). Policy adalah class yang mengelompokkan aturan untuk satu model (`view`, `update`, `delete` untuk `Transaksi`) dan ditemukan otomatis dari nama class. Keduanya dipanggil dengan API yang sama: `Gate::authorize`, `can()`, `@can`.'],
      ]),
      ...practice('lv-auth', [
        'Jalankan `php artisan install:api`, tambahkan `HasApiTokens` ke User, dan buat endpoint `POST /api/token` serta `DELETE /api/token`.',
        'Lindungi endpoint transaksi dengan `auth:sanctum` dan batasi semua query ke `$request->user()->transaksi()`.',
        'Buat `TransaksiPolicy` dan buktikan user B mendapat 404 saat mengubah transaksi user A.',
        'Tambahkan rate limiter `login` (5 per menit per email + IP) dan uji dengan 6 request berturut-turut sampai mendapat 429.',
      ]),
      references(
        ['Laravel: Starter Kits', 'https://laravel.com/docs/starter-kits'],
        ['Laravel: Sanctum', 'https://laravel.com/docs/sanctum'],
        ['Laravel: Authorization (Gates & Policies)', 'https://laravel.com/docs/authorization'],
        ['Laravel: Rate Limiting', 'https://laravel.com/docs/routing#rate-limiting'],
      ),
    ],
  },
  {
    id: 'lv-queue-event',
    title: 'Laravel: Queue, Job, Event & Scheduler',
    summary: 'Driver queue (database, Redis), job dengan retry/backoff/timeout, worker dan Supervisor, event & listener ter-queue, scheduler di routes/console.php, serta Horizon.',
    track: LV_LANJUTAN, source: phpSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Request HTTP seharusnya selesai dalam ratusan milidetik. Pekerjaan lambat atau rawan gagal, seperti mengirim email, membuat PDF laporan, memanggil API pihak ketiga, atau memproses impor CSV, dipindahkan ke **queue**: controller hanya mencatat pekerjaan, lalu proses **worker** terpisah mengerjakannya dengan retry otomatis. **Event** memisahkan "apa yang terjadi" dari "siapa yang bereaksi", dan **scheduler** menjalankan tugas berkala hanya dengan satu entri cron.'),
      code('Konfigurasi dan perintah queue', `# .env
QUEUE_CONNECTION=database        # default Laravel 11+; produksi dengan beban tinggi: redis
REDIS_CLIENT=phpredis            # ekstensi phpredis (atau predis/predis via Composer)

php artisan make:job KirimLaporanBulanan
php artisan queue:work                                   # worker untuk development
php artisan queue:work redis --queue=penting,default --tries=3 --max-time=3600
php artisan queue:failed                                 # job yang gagal permanen (tabel failed_jobs)
php artisan queue:retry all                              # coba ulang setelah bug diperbaiki
php artisan queue:restart                                # minta worker selesai dengan rapi (wajib setelah deploy)`, 'bash'),
      code('Job dengan retry, backoff, timeout', `<?php

namespace App\\Jobs;

use App\\Mail\\LaporanBulanan;                       // php artisan make:mail LaporanBulanan
use App\\Models\\User;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Queue\\Queueable;
use Illuminate\\Support\\Carbon;
use Illuminate\\Support\\Facades\\Log;
use Illuminate\\Support\\Facades\\Mail;
use Throwable;

class KirimLaporanBulanan implements ShouldQueue
{
    use Queueable;

    public $tries = 3;                               // total percobaan
    public $backoff = [60, 300];                     // jeda sebelum percobaan ke-2 dan ke-3 (detik)
    public $timeout = 120;                           // worker membunuh job yang lebih lama dari ini

    public function __construct(public User $user, public string $bulan) {}   // model diserialisasi sebagai ID

    public function handle(): void
    {
        $awal = Carbon::parse($this->bulan . '-01')->startOfMonth();
        $total = $this->user->transaksi()
            ->whereBetween('tanggal', [$awal, $awal->copy()->endOfMonth()])
            ->sum('jumlah');

        Mail::to($this->user)->send(new LaporanBulanan($this->user, $this->bulan, (int) $total));
    }

    public function failed(?Throwable $e): void      // dipanggil setelah semua percobaan habis
    {
        Log::error('laporan gagal', ['user' => $this->user->id, 'error' => $e?->getMessage()]);
    }
}

// Mengirim ke queue dari controller / command:
// KirimLaporanBulanan::dispatch($user, '2026-10');
// KirimLaporanBulanan::dispatch($user, '2026-10')->onQueue('laporan')->delay(now()->addMinutes(5));
// KirimLaporanBulanan::dispatch($user, '2026-10')->afterCommit();   // tunggu transaksi DB selesai
// KirimLaporanBulanan::dispatchSync($user, '2026-10');             // jalankan langsung (debug)`, 'php'),
      code('Event dan listener ter-queue', `<?php

// php artisan make:event TransaksiDibuat
namespace App\\Events;

use App\\Models\\Transaksi;
use Illuminate\\Foundation\\Events\\Dispatchable;
use Illuminate\\Queue\\SerializesModels;

class TransaksiDibuat
{
    use Dispatchable, SerializesModels;

    public function __construct(public Transaksi $transaksi) {}
}

// php artisan make:listener PeriksaAnggaran --event=TransaksiDibuat
namespace App\\Listeners;

use App\\Events\\TransaksiDibuat;
use App\\Notifications\\AnggaranTerlampaui;
use Illuminate\\Contracts\\Queue\\ShouldQueue;

class PeriksaAnggaran implements ShouldQueue        // listener dijalankan worker, bukan di dalam request
{
    public function handle(TransaksiDibuat $event): void
    {
        $user = $event->transaksi->user;
        $keluarBulanIni = $user->transaksi()
            ->where('jenis', 'pengeluaran')
            ->where('tanggal', '>=', now()->startOfMonth())
            ->sum('jumlah');

        if ($keluarBulanIni > 5_000_000) {
            $user->notify(new AnggaranTerlampaui((int) $keluarBulanIni));
        }
    }
}

// Listener di app/Listeners ditemukan otomatis dari type hint handle() (event discovery).
// Memicu event setelah menyimpan: TransaksiDibuat::dispatch($transaksi);`, 'php'),
      code('routes/console.php: scheduler', `<?php

use App\\Jobs\\KirimLaporanBulanan;
use App\\Models\\User;
use Illuminate\\Support\\Facades\\Schedule;

Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('queue:prune-failed --hours=168')->weekly();

Schedule::call(function () {
    User::whereNotNull('email_verified_at')->each(
        fn (User $user) => KirimLaporanBulanan::dispatch($user, now()->subMonth()->format('Y-m'))
    );
})
    ->name('laporan-bulanan')
    ->monthlyOn(1, '07:00')
    ->timezone('Asia/Jakarta')
    ->onOneServer()              // butuh cache yang mendukung lock (redis/database) bila server > 1
    ->withoutOverlapping();

// Server: satu entri cron menjalankan semua jadwal
//   * * * * * cd /var/www/dompet && php artisan schedule:run >> /dev/null 2>&1
// Development: php artisan schedule:work   |   Cek: php artisan schedule:list`, 'php'),
      code('Supervisor untuk worker & konfigurasi Horizon', `; /etc/supervisor/conf.d/dompet-worker.conf (VPS tanpa Horizon)
[program:dompet-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/dompet/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/dompet/storage/logs/worker.log
stopwaitsecs=3600

; Dengan Redis, Horizon menggantikan queue:work dan memberi dashboard /horizon:
;   composer require laravel/horizon && php artisan horizon:install
;   command=php /var/www/dompet/artisan horizon
;   Setelah deploy: php artisan horizon:terminate (Supervisor menyalakan ulang)
; config/horizon.php → 'environments' => ['production' => ['supervisor-1' => ['maxProcesses' => 10]]]
; Akses dashboard di produksi dibatasi gate viewHorizon di HorizonServiceProvider.`, 'text'),
      table(['Kebutuhan', 'Alat Laravel', 'Catatan'], [
        ['Kerja lambat di luar request', 'Job + `ShouldQueue`', 'Retry, backoff, timeout per job'],
        ['Beberapa job berurutan / paralel', '`Bus::chain([...])`, `Bus::batch([...])`', 'Batch butuh tabel `job_batches`'],
        ['Satu kejadian, banyak reaksi', 'Event + listener (`ShouldQueue` untuk yang lambat)', 'Listener ditemukan otomatis'],
        ['Tugas berkala', '`Schedule` di `routes/console.php`', 'Satu cron `schedule:run` per menit'],
        ['Monitoring queue Redis', '**Horizon**', 'Dashboard, metrik, auto-balancing worker'],
        ['Mencegah job ganda', '`ShouldBeUnique`, middleware `WithoutOverlapping`', 'Butuh cache dengan dukungan lock'],
      ]),
      callout('warn', 'Worker adalah proses yang berumur panjang', '`queue:work` memuat aplikasi sekali lalu memproses ribuan job, jadi perubahan kode tidak terlihat sampai worker di-restart: selalu jalankan `php artisan queue:restart` (atau `horizon:terminate`) di skrip deploy. Buat job **idempoten** (aman dijalankan dua kali), karena retry bisa terjadi setelah job sebenarnya sudah setengah berhasil. Gunakan `afterCommit()` agar job tidak membaca data yang belum di-commit.'),
      ...quiz([
        ['PHP-30', 'Mengapa job menerima `User $user` dan bukan array data user lengkap?', 'Trait `SerializesModels` (bagian dari `Queueable`) hanya menyimpan class dan ID model ke payload queue, lalu mengambil ulang model segar dari database saat job dijalankan. Payload tetap kecil dan job melihat data terbaru, bukan salinan basi dari saat dispatch.'],
        ['PHP-31', 'Apa yang terjadi bila job dispatch di dalam transaksi DB yang kemudian di-rollback, tanpa `afterCommit()`?', 'Worker bisa mengambil job sebelum transaksi selesai, lalu tidak menemukan data (ModelNotFoundException) atau memproses data yang akhirnya dibatalkan. Dengan `afterCommit()` (atau opsi `after_commit` di konfigurasi queue), job baru dikirim setelah transaksi berhasil di-commit dan dibuang bila rollback.'],
        ['PHP-32', 'Mengapa `onOneServer()` penting pada jadwal yang dijalankan di beberapa server?', 'Setiap server menjalankan cron `schedule:run` sendiri, sehingga tanpa koordinasi laporan bulanan terkirim sekali per server. `onOneServer()` memakai lock atomik di cache bersama (Redis/database) agar hanya satu server yang menjalankan tugas itu.'],
      ]),
      ...practice('lv-queue', [
        'Set `QUEUE_CONNECTION=database`, buat job `KirimLaporanBulanan` dengan `Mail::fake` atau driver mail `log`, dispatch dari route, dan proses dengan `php artisan queue:work`.',
        'Buat job yang sengaja melempar exception; amati retry dengan backoff lalu masuk `queue:failed`, perbaiki, dan jalankan `queue:retry all`.',
        'Buat event `TransaksiDibuat` dan listener ter-queue `PeriksaAnggaran`, lalu pastikan respons POST tidak menunggu listener.',
        'Daftarkan jadwal bulanan di `routes/console.php` dan periksa dengan `php artisan schedule:list`; pasang Horizon bila Redis tersedia.',
      ]),
      references(
        ['Laravel: Queues', 'https://laravel.com/docs/queues'],
        ['Laravel: Events', 'https://laravel.com/docs/events'],
        ['Laravel: Task Scheduling', 'https://laravel.com/docs/scheduling'],
        ['Laravel: Horizon', 'https://laravel.com/docs/horizon'],
        ['Laravel: Redis', 'https://laravel.com/docs/redis'],
      ),
    ],
  },
  {
    id: 'lv-testing',
    title: 'Laravel: Testing dengan Pest & PHPUnit',
    summary: 'Setup Pest, database test (SQLite in-memory, RefreshDatabase), feature test HTTP JSON, Sanctum::actingAs, factory, fakes (Queue, Event, Mail, Http), waktu, dataset, dan arch test.',
    track: LV_LANJUTAN, source: phpSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Laravel dirancang agar mudah diuji: setiap aplikasi baru sudah membawa folder `tests/Feature` dan `tests/Unit`, helper HTTP seperti `postJson()`, dan *fake* untuk queue, event, mail, storage, serta HTTP client. **Pest** adalah framework test yang dibangun di atas PHPUnit dengan sintaks fungsi yang ringkas (`it()`, `expect()`); installer Laravel menawarkannya sebagai pilihan default. Test PHPUnit berbasis class tetap berjalan berdampingan karena mesinnya sama.'),
      code('Setup dan menjalankan test', `# Proyek baru: pilih Pest saat "laravel new". Proyek lama yang masih PHPUnit:
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --with-all-dependencies
./vendor/bin/pest --init

php artisan test                         # atau ./vendor/bin/pest
php artisan test --filter=transaksi      # hanya test yang namanya cocok
php artisan test --parallel              # butuh brianium/paratest
php artisan test --coverage --min=80     # butuh Xdebug atau PCOV

# phpunit.xml: database test terpisah dari database development
#   <env name="DB_CONNECTION" value="sqlite"/>
#   <env name="DB_DATABASE" value=":memory:"/>`, 'bash'),
      code('tests/Pest.php dan feature test API', `<?php

// tests/Pest.php
pest()->extend(Tests\\TestCase::class)
    ->use(Illuminate\\Foundation\\Testing\\RefreshDatabase::class)   // migrate sekali, rollback tiap test
    ->in('Feature');

// tests/Feature/TransaksiApiTest.php
use App\\Models\\Transaksi;
use App\\Models\\User;
use Laravel\\Sanctum\\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user, ['transaksi:read', 'transaksi:write']);
});

it('menampilkan hanya transaksi milik user', function () {
    Transaksi::factory()->count(3)->for($this->user)->create();
    Transaksi::factory()->count(2)->create();                    // milik user lain

    $this->getJson('/api/transaksi')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

it('membuat transaksi', function () {
    $this->postJson('/api/transaksi', ['jenis' => 'pengeluaran', 'deskripsi' => 'Kopi', 'jumlah' => 18_000])
        ->assertCreated()
        ->assertJsonPath('data.deskripsi', 'Kopi');

    $this->assertDatabaseHas('transaksi', ['user_id' => $this->user->id, 'jumlah' => 18_000]);
});

it('menolak input tidak valid', function (array $input, string $field) {
    $this->postJson('/api/transaksi', $input)->assertUnprocessable()->assertJsonValidationErrors($field);
})->with([
    'jumlah nol' => [['jenis' => 'pengeluaran', 'deskripsi' => 'Kopi', 'jumlah' => 0], 'jumlah'],
    'jenis asing' => [['jenis' => 'hadiah', 'deskripsi' => 'Kopi', 'jumlah' => 1], 'jenis'],
    'deskripsi kosong' => [['jenis' => 'pemasukan', 'deskripsi' => '', 'jumlah' => 1], 'deskripsi'],
]);

it('tidak bisa mengubah transaksi user lain', function () {
    $milikOrangLain = Transaksi::factory()->create();

    $this->putJson("/api/transaksi/{$milikOrangLain->id}", ['jenis' => 'pemasukan', 'deskripsi' => 'X', 'jumlah' => 1])
        ->assertNotFound();
});`, 'php'),
      code('Fakes: queue, event, mail, HTTP, dan waktu', `<?php

use App\\Events\\TransaksiDibuat;
use App\\Jobs\\KirimLaporanBulanan;
use App\\Models\\Transaksi;
use App\\Models\\User;
use Illuminate\\Http\\Client\\Request;
use Illuminate\\Support\\Facades\\Event;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Queue;
use Laravel\\Sanctum\\Sanctum;

it('memicu event saat transaksi dibuat', function () {   // asumsi: controller memanggil TransaksiDibuat::dispatch()
    Event::fake([TransaksiDibuat::class]);         // listener tidak dijalankan
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/transaksi', ['jenis' => 'pengeluaran', 'deskripsi' => 'Bensin', 'jumlah' => 50_000]);

    Event::assertDispatched(TransaksiDibuat::class, fn ($e) => $e->transaksi->jumlah === 50_000);
});

it('mengirim job laporan ke queue', function () {
    Queue::fake();
    $user = User::factory()->create();

    KirimLaporanBulanan::dispatch($user, '2026-10');

    Queue::assertPushed(KirimLaporanBulanan::class, fn ($job) => $job->user->is($user));
});

it('memanggil API kurs dengan benar', function () {
    Http::fake(['api.kurs.test/*' => Http::response(['IDR' => 16_250], 200)]);
    Http::preventStrayRequests();                  // request lain yang tidak di-fake → exception

    $kurs = Http::get('https://api.kurs.test/latest?base=USD')->json('IDR');

    expect($kurs)->toBe(16_250);
    Http::assertSent(fn (Request $r) => str_contains($r->url(), 'base=USD'));
});

it('menolak menghapus transaksi yang lebih tua dari 30 hari', function () {
    $user = User::factory()->create();
    $trx = Transaksi::factory()->for($user)->create();
    Sanctum::actingAs($user);

    $this->travel(31)->days();                     // now() maju 31 hari; policy delete menolak

    $this->deleteJson("/api/transaksi/{$trx->id}")->assertForbidden();
});

arch('tidak ada debug tertinggal')->expect(['dd', 'dump', 'ray'])->not->toBeUsed();`, 'php'),
      code('Padanan PHPUnit (class)', `<?php

namespace Tests\\Feature;

use App\\Models\\User;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;
use Laravel\\Sanctum\\Sanctum;
use Tests\\TestCase;

class RingkasanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ringkasan_menghitung_saldo(): void
    {
        $user = User::factory()->create();
        $user->transaksi()->createMany([
            ['jenis' => 'pemasukan', 'deskripsi' => 'Gaji', 'jumlah' => 100_000, 'tanggal' => now()],
            ['jenis' => 'pengeluaran', 'deskripsi' => 'Makan', 'jumlah' => 30_000, 'tanggal' => now()],
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/ringkasan')
            ->assertOk()
            ->assertExactJson(['pemasukan' => 100_000, 'pengeluaran' => 30_000, 'saldo' => 70_000]);
    }
}`, 'php'),
      table(['Fake / helper', 'Menggantikan', 'Assertion umum'], [
        ['`Queue::fake()` / `Bus::fake()`', 'Pengiriman job', '`assertPushed`, `assertNothingPushed`'],
        ['`Event::fake([...])`', 'Dispatch event & listener', '`assertDispatched`, `assertListening`'],
        ['`Mail::fake()` / `Notification::fake()`', 'Email / notifikasi', '`assertSent`, `assertSentTo`'],
        ['`Http::fake()`', 'Panggilan HTTP keluar', '`assertSent`, `preventStrayRequests()`'],
        ['`Storage::fake(\'s3\')`', 'Disk file', '`assertExists`'],
        ['`freezeTime()`, `travel()`', 'Waktu sekarang', '`now()` terkendali'],
        ['`RefreshDatabase`', 'Database bersih per test', '`assertDatabaseHas`, `assertModelMissing`'],
      ]),
      callout('tip', 'Apa yang diuji di level mana', 'Mayoritas test Laravel paling bernilai sebagai **feature test** HTTP: request masuk lewat route, middleware, validasi, policy, dan database sungguhan (SQLite in-memory atau database test PostgreSQL), lalu respons JSON diperiksa. Unit test murni cocok untuk logika domain tanpa framework (perhitungan, value object). Untuk perilaku spesifik database seperti JSON column atau full-text search, jalankan test di engine yang sama dengan produksi.'),
      ...quiz([
        ['PHP-33', 'Apa yang dilakukan trait `RefreshDatabase`?', 'Menjalankan migration sekali di awal proses test (atau memakai skema in-memory), lalu membungkus setiap test dalam transaksi database yang di-rollback setelah test selesai. Setiap test mulai dari database kosong tanpa perlu migrate ulang, sehingga cepat dan terisolasi.'],
        ['PHP-34', 'Mengapa memakai `Http::fake()` dan `Http::preventStrayRequests()` di test?', 'Agar test tidak bergantung pada jaringan dan API pihak ketiga (lambat, kuota, data berubah), bisa mensimulasikan respons error, dan memastikan request yang dikirim benar lewat `assertSent`. `preventStrayRequests()` menggagalkan test bila ada request HTTP yang belum di-fake, sehingga panggilan tak sengaja ke layanan sungguhan ketahuan.'],
      ]),
      ...practice('lv-testing', [
        'Konfigurasikan `phpunit.xml` dengan SQLite in-memory dan `tests/Pest.php` dengan `RefreshDatabase`, lalu jalankan `php artisan test`.',
        'Tulis feature test untuk list, create, update, delete transaksi termasuk kasus 401 (tanpa token) dan 404 (milik user lain).',
        'Gunakan dataset Pest untuk minimal 5 kasus input tidak valid.',
        'Uji bahwa membuat transaksi memicu event `TransaksiDibuat` dan job laporan masuk queue, memakai `Event::fake` dan `Queue::fake`.',
      ]),
      references(
        ['Laravel: Testing', 'https://laravel.com/docs/testing'],
        ['Laravel: HTTP Tests', 'https://laravel.com/docs/http-tests'],
        ['Laravel: Database Testing', 'https://laravel.com/docs/database-testing'],
        ['Laravel: Mocking (fakes)', 'https://laravel.com/docs/mocking'],
        ['Pest: Documentation', 'https://pestphp.com/docs/installation'],
      ),
    ],
  },
  {
    id: 'lv-performa-deploy',
    title: 'Laravel: Performa, Deployment & Keamanan Produksi',
    summary: 'Cache data dan invalidasi, optimize (config/route/view cache), OPcache, Octane, Docker dengan FrankenPHP, Nginx + PHP-FPM di VPS, Forge/Cloud, dan checklist keamanan produksi.',
    track: LV_LANJUTAN, source: phpSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Aplikasi Laravel yang lambat biasanya bukan karena PHP-nya, melainkan karena query N+1, query tanpa index, pekerjaan berat di dalam request, atau konfigurasi produksi yang belum dioptimasi. Urutan perbaikannya: ukur dulu (Telescope/Debugbar di lokal, APM di produksi), perbaiki query dan pindahkan kerja lambat ke queue, lalu tambahkan **cache** dan optimasi bootstrap. Setelah itu baru pertimbangkan **Octane** untuk throughput lebih tinggi.'),
      code('Cache data dan invalidasi', `<?php

use App\\Models\\Transaksi;
use Illuminate\\Support\\Facades\\Cache;

// Cache-aside: hitung sekali, simpan 10 menit
function ringkasan(int $userId): array
{
    return Cache::remember("ringkasan:$userId", now()->addMinutes(10), function () use ($userId) {
        $q = Transaksi::where('user_id', $userId);
        $masuk = (int) (clone $q)->where('jenis', 'pemasukan')->sum('jumlah');
        $keluar = (int) (clone $q)->where('jenis', 'pengeluaran')->sum('jumlah');
        return ['pemasukan' => $masuk, 'pengeluaran' => $keluar, 'saldo' => $masuk - $keluar];
    });
}

// Stale-while-revalidate: segar 5 menit; menit 5–15 nilai lama dikirim sambil dihitung ulang di latar
$kurs = Cache::flexible('kurs:usd', [300, 900], fn () => ambilKursDariApi());

// Invalidasi saat data berubah (mis. di model event atau setelah create/update/delete)
Transaksi::saved(fn (Transaksi $t) => Cache::forget("ringkasan:{$t->user_id}"));
Transaksi::deleted(fn (Transaksi $t) => Cache::forget("ringkasan:{$t->user_id}"));

// .env produksi: CACHE_STORE=redis (bersama untuk semua server), SESSION_DRIVER=redis`, 'php'),
      code('Skrip deploy dan optimasi', `# Di server (atau langkah deploy di Forge / CI), dari direktori aplikasi
php artisan down --retry=60                          # opsional: mode maintenance
git pull origin main
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force                          # --force wajib di production
php artisan optimize                                 # config, event, route, dan view cache sekaligus
php artisan queue:restart                            # worker memuat kode baru
php artisan up

# Bila konfigurasi aneh setelah deploy:
php artisan optimize:clear

# php.ini produksi (OPcache menyimpan bytecode di memori)
#   opcache.enable=1
#   opcache.validate_timestamps=0     # tidak cek file berubah → wajib reload PHP-FPM setelah deploy
#   opcache.memory_consumption=256`, 'bash'),
      code('Octane dengan FrankenPHP', `composer require laravel/octane
php artisan octane:install --server=frankenphp       # pilihan lain: swoole, roadrunner
php artisan octane:start --workers=4 --max-requests=500
php artisan octane:reload                            # setelah deploy, muat ulang worker dengan rapi

# Octane mem-boot aplikasi SEKALI lalu melayani banyak request di proses yang sama:
# - jangan simpan data request di property static atau singleton
# - jangan inject Request/config ke constructor singleton (nilainya basi di request berikutnya)
# - --max-requests me-restart worker berkala untuk menahan memory leak`, 'bash'),
      code('Dockerfile (FrankenPHP, satu container)', `# syntax=docker/dockerfile:1
FROM dunglas/frankenphp:1-php8.4

RUN install-php-extensions pdo_pgsql redis opcache intl zip pcntl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev \\
 && chown -R www-data:www-data storage bootstrap/cache

ENV SERVER_NAME=:8080
EXPOSE 8080
# optimize dijalankan saat start agar config cache memakai environment variable runtime, bukan saat build
CMD ["sh", "-c", "php artisan optimize && exec frankenphp run --config /etc/caddy/Caddyfile"]`, 'docker'),
      code('Nginx + PHP-FPM di VPS (berdasarkan dokumentasi Laravel)', `server {
    listen 80;
    server_name dompet.contoh.id;
    root /var/www/dompet/public;              # document root WAJIB public/, bukan root proyek

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    error_page 404 /index.php;

    location ~ ^/index\\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\\.(?!well-known).* {
        deny all;                             # blokir .env, .git, dan file tersembunyi lain
    }
}`, 'text'),
      table(['Area', 'Checklist produksi'], [
        ['Environment', '`APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` terisi dan dirahasiakan, `.env` tidak di-commit'],
        ['HTTP', 'HTTPS (TLS), document root `public/`, `trustProxies` bila di belakang load balancer, header keamanan'],
        ['Input & data', 'Validasi semua input, `$fillable`, Policy di setiap endpoint, rate limit login & API'],
        ['Dependency', '`composer audit` di CI, update rutin Laravel & PHP (patch keamanan)'],
        ['Proses', 'Worker queue di Supervisor/Horizon, cron `schedule:run`, `queue:restart` saat deploy'],
        ['Observabilitas', 'Log ke stdout/aggregator, health check `/up`, error tracking, metrik queue'],
        ['Hosting', '**Forge** (provisioning VPS + deploy), **Laravel Cloud** (platform terkelola), Vapor (serverless), atau Docker di Kubernetes'],
      ]),
      callout('warn', 'env() hanya di dalam folder config', 'Setelah `php artisan config:cache`, file `.env` tidak dibaca lagi dan `env()` di luar `config/*.php` mengembalikan `null`. Selalu baca nilai lewat `config(\'services.kurs.key\')`. `APP_DEBUG=true` di produksi menampilkan stack trace beserta variabel environment kepada siapa pun yang memicu error. Checklist umum ada di [Checklist Keamanan Produksi & Threat Modeling](#web.sec-checklist-produksi), dan dasar container di [Docker Compose](#devops.docker-compose).'),
      ...quiz([
        ['PHP-35', 'Mengapa `php artisan optimize` dijalankan saat container start, bukan saat `docker build`?', 'Config cache membekukan semua nilai konfigurasi, termasuk yang berasal dari environment variable. Saat build, variabel produksi (database, Redis, APP_KEY) belum tersedia, sehingga cache akan berisi nilai salah. Menjalankannya saat start memakai environment runtime yang sebenarnya.'],
        ['PHP-36', 'Apa risiko utama memindahkan aplikasi ke Octane, dan bagaimana menanganinya?', 'Aplikasi tidak lagi di-boot ulang setiap request, sehingga state yang disimpan di property static, singleton, atau array global bocor ke request berikutnya dan memori bisa terus naik. Tangani dengan tidak menyimpan state request di singleton, menginjeksi dependency yang bergantung request lewat method atau closure, menguji di bawah Octane, dan memakai `--max-requests` untuk me-restart worker secara berkala.'],
        ['PHP-37', 'Mengapa key cache ringkasan menyertakan `user_id`, dan kapan cache-nya dihapus?', 'Setiap user punya ringkasan berbeda; tanpa user_id di key, user B bisa melihat angka user A. Cache dihapus setiap kali transaksi user itu dibuat, diubah, atau dihapus (lewat model event atau setelah operasi di service), sehingga data tidak basi lebih lama dari yang diizinkan.'],
      ]),
      ...practice('lv-deploy', [
        'Ukur endpoint ringkasan sebelum dan sesudah `Cache::remember`, lalu tambahkan invalidasi lewat model event dan buktikan angka selalu terbaru.',
        'Bangun image Docker dengan Dockerfile FrankenPHP, jalankan bersama PostgreSQL dan Redis memakai docker compose, dan akses `/up`.',
        'Tulis skrip deploy untuk VPS (Nginx + PHP-FPM + Supervisor) dan jalankan dua kali untuk memastikan aman diulang.',
        'Audit konfigurasi produksi dengan tabel checklist di atas; perbaiki minimal tiga temuan (mis. `APP_DEBUG`, rate limit, `composer audit`).',
      ]),
      references(
        ['Laravel: Cache', 'https://laravel.com/docs/cache'],
        ['Laravel: Deployment', 'https://laravel.com/docs/deployment'],
        ['Laravel: Octane', 'https://laravel.com/docs/octane'],
        ['Laravel: Configuration (configuration caching)', 'https://laravel.com/docs/configuration#configuration-caching'],
        ['FrankenPHP: Laravel', 'https://frankenphp.dev/docs/laravel/'],
        ['Laravel Forge', 'https://forge.laravel.com'],
      ),
    ],
  },
  {
    id: 'lv-proyek-financial-tracker',
    title: 'Proyek: Financial Tracker REST API dengan Laravel',
    summary: 'Membangun API Pencatat Keuangan sesuai kontrak lintas bahasa: migration, enum, Form Request dengan error { error } berstatus 400, resource tanpa pembungkus, ringkasan, /health, dan test Pest.',
    track: PROYEK, source: phpSource, duration: '5 jam', level: 'Hard',
    blocks: [
      paragraph('Proyek ini menyatukan semua modul Laravel: Anda membangun API Financial Tracker (Pencatat Keuangan) dengan **kontrak yang sama persis** seperti versi FastAPI/Django di [Kontrak API Financial Tracker](#python.kontrak-api-financial-tracker) dan versi Express/Nest di [Kontrak API yang Akan Dibangun](#js.kontrak-api-yang-akan-dibangun). Karena kontraknya identik, frontend React Native atau React dari kurikulum lain bisa langsung diarahkan ke backend Laravel ini. Tantangan utamanya justru menyesuaikan konvensi Laravel (pembungkus `data`, validasi 422) dengan kontrak yang sudah ditetapkan.'),
      table(['Method & Path', 'Fungsi', 'Sukses', 'Error'], [
        ['`GET /api/transaksi`', 'Daftar transaksi (terbaru dulu)', '200, array JSON', '-'],
        ['`POST /api/transaksi`', 'Tambah transaksi', '201, objek transaksi', '400 `{"error": "..."}`'],
        ['`PUT /api/transaksi/{id}`', 'Ubah transaksi', '200, objek transaksi', '400, 404'],
        ['`DELETE /api/transaksi/{id}`', 'Hapus transaksi', '204 tanpa body', '404'],
        ['`GET /api/ringkasan`', 'Pemasukan, pengeluaran, saldo', '200', '-'],
        ['`GET /health`', 'Kesehatan server', '200 `{"status": "ok"}`', '-'],
      ]),
      code('Bentuk data transaksi dan error', `{ "id": 1, "jenis": "pengeluaran", "deskripsi": "Makan siang", "jumlah": 35000, "tanggal": "2026-06-04T10:00:00Z" }

{ "error": "jumlah harus lebih dari 0" }`, 'json'),
      code('Langkah 1: proyek, enum, model, migration', `laravel new financial-tracker      # tanpa starter kit, Pest, SQLite
cd financial-tracker
php artisan install:api            # membuat routes/api.php (prefix /api) dan memasang Sanctum
php artisan make:enum Enums/JenisTransaksi
php artisan make:model Transaksi -mf
php artisan make:request SimpanTransaksiRequest
php artisan make:resource TransaksiResource
php artisan make:controller Api/TransaksiController`, 'bash'),
      code('Enum, migration, dan model', `<?php

// app/Enums/JenisTransaksi.php
namespace App\\Enums;

enum JenisTransaksi: string
{
    case Pemasukan = 'pemasukan';
    case Pengeluaran = 'pengeluaran';
}

// database/migrations/xxxx_create_transaksis_table.php → up()
Schema::create('transaksi', function (Blueprint $table) {
    $table->id();
    $table->string('jenis', 20);
    $table->string('deskripsi');
    $table->unsignedBigInteger('jumlah');
    $table->timestamp('tanggal');
    $table->timestamps();
    $table->index('tanggal');
});
// down(): Schema::dropIfExists('transaksi');

// app/Models/Transaksi.php
namespace App\\Models;

use App\\Enums\\JenisTransaksi;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    protected $fillable = ['jenis', 'deskripsi', 'jumlah', 'tanggal'];

    protected function casts(): array
    {
        return [
            'jenis' => JenisTransaksi::class,
            'jumlah' => 'integer',
            'tanggal' => 'immutable_datetime',
        ];
    }
}`, 'php'),
      code('Langkah 2: validasi dengan pesan sesuai kontrak', `<?php

// app/Http/Requests/SimpanTransaksiRequest.php — dipakai POST dan PUT (PUT = ganti penuh)
namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class SimpanTransaksiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;                                   // kontrak dasar tanpa autentikasi
    }

    public function rules(): array
    {
        return [
            'jenis' => ['required', 'in:pemasukan,pengeluaran'],
            'deskripsi' => ['required', 'string', 'max:255'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'tanggal' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'jenis.required' => 'jenis wajib diisi',
            'jenis.in' => 'jenis harus pemasukan atau pengeluaran',
            'deskripsi.required' => 'deskripsi wajib diisi',
            'deskripsi.max' => 'deskripsi maksimal 255 karakter',
            'jumlah.required' => 'jumlah wajib diisi',
            'jumlah.integer' => 'jumlah harus bilangan bulat',
            'jumlah.min' => 'jumlah harus lebih dari 0',
            'tanggal.date' => 'tanggal tidak valid',
        ];
    }
}`, 'php'),
      code('Langkah 3: resource tanpa pembungkus dan controller', `<?php

// app/Http/Resources/TransaksiResource.php
namespace App\\Http\\Resources;

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

/** @mixin \\App\\Models\\Transaksi */
class TransaksiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'jenis' => $this->jenis->value,
            'deskripsi' => $this->deskripsi,
            'jumlah' => $this->jumlah,
            'tanggal' => $this->tanggal->toIso8601ZuluString(),   // "2026-06-04T10:00:00Z"
        ];
    }
}

// app/Providers/AppServiceProvider.php → boot():
//     JsonResource::withoutWrapping();                         // kontrak: array/objek langsung, tanpa {"data": ...}
//     Model::preventLazyLoading(! $this->app->isProduction());

// app/Http/Controllers/Api/TransaksiController.php
namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\SimpanTransaksiRequest;
use App\\Http\\Resources\\TransaksiResource;
use App\\Models\\Transaksi;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Resources\\Json\\AnonymousResourceCollection;
use Illuminate\\Http\\Response;
use Illuminate\\Support\\Facades\\DB;

class TransaksiController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TransaksiResource::collection(Transaksi::orderByDesc('tanggal')->orderByDesc('id')->get());
    }

    public function store(SimpanTransaksiRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tanggal'] ??= now();

        return TransaksiResource::make(Transaksi::create($data))->response()->setStatusCode(201);
    }

    public function update(SimpanTransaksiRequest $request, Transaksi $transaksi): TransaksiResource
    {
        $data = $request->validated();
        $data['tanggal'] ??= $transaksi->tanggal;       // PUT tanpa tanggal: pertahankan tanggal lama

        $transaksi->update($data);

        return TransaksiResource::make($transaksi);
    }

    public function destroy(Transaksi $transaksi): Response
    {
        $transaksi->delete();

        return response()->noContent();                 // 204
    }

    public function ringkasan(): JsonResponse
    {
        $hasil = DB::table('transaksi')                 // satu query dengan agregasi bersyarat
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE 0 END), 0) AS pemasukan")
            ->selectRaw("COALESCE(SUM(CASE WHEN jenis = 'pengeluaran' THEN jumlah ELSE 0 END), 0) AS pengeluaran")
            ->first();

        $masuk = (int) $hasil->pemasukan;
        $keluar = (int) $hasil->pengeluaran;

        return response()->json(['pemasukan' => $masuk, 'pengeluaran' => $keluar, 'saldo' => $masuk - $keluar]);
    }
}`, 'php'),
      code('Langkah 4: route dan error { error } terpusat', `<?php

// routes/api.php (otomatis diberi prefix /api)
use App\\Http\\Controllers\\Api\\TransaksiController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/transaksi', [TransaksiController::class, 'index']);
Route::post('/transaksi', [TransaksiController::class, 'store']);
Route::put('/transaksi/{transaksi}', [TransaksiController::class, 'update'])->whereNumber('transaksi');
Route::delete('/transaksi/{transaksi}', [TransaksiController::class, 'destroy'])->whereNumber('transaksi');
Route::get('/ringkasan', [TransaksiController::class, 'ringkasan']);

// routes/web.php (tanpa prefix /api)
Route::get('/health', fn () => ['status' => 'ok']);

// bootstrap/app.php
use Illuminate\\Database\\Eloquent\\ModelNotFoundException;
use Illuminate\\Http\\Request;
use Illuminate\\Validation\\ValidationException;
use Symfony\\Component\\HttpKernel\\Exception\\HttpExceptionInterface;
use Symfony\\Component\\HttpKernel\\Exception\\NotFoundHttpException;

->withExceptions(function (Exceptions $exceptions): void {
    // 1) Validasi: 400 + pesan pertama (bawaan Laravel: 422 + {message, errors})
    $exceptions->render(function (ValidationException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json(['error' => $e->validator->errors()->first()], 400);
        }
    });

    // 2) Tidak ditemukan: bedakan model tidak ada vs route tidak ada
    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            $pesan = $e->getPrevious() instanceof ModelNotFoundException
                ? 'transaksi tidak ditemukan'
                : 'endpoint tidak ditemukan';
            return response()->json(['error' => $pesan], 404);
        }
    });

    // 3) HTTP error lain (405, 429, ...) tetap berbentuk { error }
    $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json(['error' => $e->getMessage() ?: 'permintaan tidak dapat diproses'], $e->getStatusCode());
        }
    });
})`, 'php'),
      code('Langkah 5: test kontrak dengan Pest', `<?php

// tests/Feature/KontrakApiTest.php
use App\\Models\\Transaksi;

it('GET /health', function () {
    $this->getJson('/health')->assertOk()->assertExactJson(['status' => 'ok']);
});

it('membuat transaksi → 201 dengan bentuk kontrak', function () {
    $this->postJson('/api/transaksi', ['jenis' => 'pengeluaran', 'deskripsi' => 'Kopi', 'jumlah' => 18000])
        ->assertCreated()
        ->assertJsonStructure(['id', 'jenis', 'deskripsi', 'jumlah', 'tanggal'])
        ->assertJsonPath('jumlah', 18000)
        ->assertJsonPath('tanggal', fn (string $t) => preg_match('/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/', $t) === 1);
});

it('menolak input tidak valid → 400 { error }', function (array $input, string $pesan) {
    $this->postJson('/api/transaksi', $input)->assertStatus(400)->assertExactJson(['error' => $pesan]);
})->with([
    [['jenis' => 'pengeluaran', 'deskripsi' => 'Kopi', 'jumlah' => 0], 'jumlah harus lebih dari 0'],
    [['jenis' => 'pengeluaran', 'deskripsi' => '', 'jumlah' => 5000], 'deskripsi wajib diisi'],
    [['jenis' => 'hadiah', 'deskripsi' => 'Kopi', 'jumlah' => 5000], 'jenis harus pemasukan atau pengeluaran'],
]);

it('daftar berupa array tanpa pembungkus data', function () {
    Transaksi::factory()->count(2)->create();
    $this->getJson('/api/transaksi')->assertOk()->assertJsonCount(2)->assertJsonStructure([['id', 'jenis']]);
});

it('ubah, hapus, dan 404', function () {
    $t = Transaksi::factory()->create(['jenis' => 'pengeluaran']);

    $this->putJson("/api/transaksi/{$t->id}", ['jenis' => 'pemasukan', 'deskripsi' => 'Bonus', 'jumlah' => 50000])
        ->assertOk()->assertJsonPath('deskripsi', 'Bonus');
    $this->deleteJson("/api/transaksi/{$t->id}")->assertNoContent();
    $this->deleteJson("/api/transaksi/{$t->id}")->assertNotFound()->assertExactJson(['error' => 'transaksi tidak ditemukan']);
});

it('ringkasan menghitung saldo', function () {
    Transaksi::factory()->create(['jenis' => 'pemasukan', 'jumlah' => 100000]);
    Transaksi::factory()->create(['jenis' => 'pengeluaran', 'jumlah' => 35000]);

    $this->getJson('/api/ringkasan')->assertExactJson(['pemasukan' => 100000, 'pengeluaran' => 35000, 'saldo' => 65000]);
});

// TransaksiFactory::definition(): jenis acak, deskripsi fake()->words(3, true),
// jumlah fake()->numberBetween(1000, 500000), tanggal fake()->dateTimeBetween('-30 days')`, 'php'),
      code('Langkah 6: uji manual dengan curl', `php artisan migrate && php artisan serve --port=8080

curl -s localhost:8080/health                                              # {"status":"ok"}
curl -s -X POST localhost:8080/api/transaksi -H "Content-Type: application/json" -H "Accept: application/json" \\
  -d '{"jenis":"pemasukan","deskripsi":"Gaji","jumlah":8000000}'           # 201
curl -s -X POST localhost:8080/api/transaksi -H "Content-Type: application/json" \\
  -d '{"jenis":"pengeluaran","deskripsi":"Kopi","jumlah":0}'               # 400 {"error":"jumlah harus lebih dari 0"}
curl -s localhost:8080/api/transaksi
curl -s localhost:8080/api/ringkasan
curl -s -X DELETE localhost:8080/api/transaksi/1 -i                       # 204
curl -s -X DELETE localhost:8080/api/transaksi/1                          # 404 {"error":"transaksi tidak ditemukan"}`, 'bash'),
      table(['Kebutuhan kontrak', 'FastAPI', 'Express', 'Laravel'], [
        ['Validasi body', 'Pydantic model', 'Zod schema', 'Form Request `rules()`'],
        ['Bentuk error `{ error }`', '`exception_handler`', 'Error middleware', '`$exceptions->render(...)` di `bootstrap/app.php`'],
        ['Status 400 untuk validasi', 'Handler `RequestValidationError`', '`AppError(pesan, 400)`', 'Render `ValidationException` → 400'],
        ['Serialisasi respons', '`response_model`', 'Objek JS langsung', '`JsonResource` + `withoutWrapping()`'],
        ['404 untuk id tidak ada', '`HTTPException(404)`', 'Cek manual di service', 'Route model binding + render `NotFoundHttpException`'],
        ['Test HTTP', 'pytest + TestClient', 'Jest + Supertest', 'Pest + `postJson()`'],
      ]),
      callout('tip', 'Langkah lanjut setelah kontrak dasar lulus', 'Tambahkan autentikasi Sanctum dan kolom `user_id` agar setiap user hanya melihat transaksinya (Policy dari modul autentikasi), filter `?jenis=` dan `?bulan=2026-10`, cache ringkasan per user dengan invalidasi, lalu deploy dengan Dockerfile FrankenPHP dari modul deployment. Simpan perubahan kontrak (misalnya pagination) sebagai versi baru agar klien lama tidak rusak.'),
      ...quiz([
        ['PHP-38', 'Dua penyesuaian apa yang dibutuhkan agar Laravel mengikuti kontrak Financial Tracker, dan mengapa?', 'Pertama, `JsonResource::withoutWrapping()` karena resource Laravel default membungkus hasil dalam `{"data": ...}`, sedangkan kontrak mengembalikan objek/array langsung. Kedua, render `ValidationException` menjadi status 400 dengan `{"error": pesan}`, karena bawaan Laravel adalah 422 dengan `message` dan `errors`. Tanpa keduanya, klien yang ditulis untuk backend Go/Python/Node akan gagal membaca respons.'],
        ['PHP-39', 'Mengapa route `{transaksi}` diberi `whereNumber()`?', 'Agar id non-angka (`/api/transaksi/abc`) tidak pernah sampai ke query. Di PostgreSQL, membandingkan kolom bigint dengan teks memicu error database (500). Dengan constraint, route tidak cocok dan klien mendapat 404 `endpoint tidak ditemukan` yang rapi.'],
      ]),
      ...practice('lv-proyek', [
        'Implementasikan semua langkah dan jalankan `php artisan test` sampai semua test kontrak lulus.',
        'Jalankan skrip curl di atas dan bandingkan respons dengan backend Go/Python/Node; arahkan frontend React Native dari kurikulum JS ke backend Laravel ini.',
        'Tambahkan Sanctum (`auth:sanctum`), kolom `user_id`, dan `TransaksiPolicy`; tulis test bahwa user lain mendapat 404.',
        'Tambahkan handler 500 berbentuk `{ "error": "kesalahan server" }` hanya saat `APP_DEBUG=false` tanpa menelan respons 401/403, lalu deploy dengan Docker.',
      ]),
      references(
        ['Laravel: Eloquent API Resources (data wrapping)', 'https://laravel.com/docs/eloquent-resources#data-wrapping'],
        ['Laravel: Error Handling (rendering exceptions)', 'https://laravel.com/docs/errors#rendering-exceptions'],
        ['Laravel: Validation (custom messages)', 'https://laravel.com/docs/validation#customizing-the-error-messages'],
        ['Laravel: HTTP Tests', 'https://laravel.com/docs/http-tests'],
        ['Laravel: Routing (regular expression constraints)', 'https://laravel.com/docs/routing#parameters-regular-expression-constraints'],
      ),
    ],
  },
];

export const phpCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'php',
  title: 'PHP & Laravel',
  short: 'PHP',
  monogram: 'PHP',
  hue: 'violet',
  description: 'PHP modern (8.4, dengan catatan 8.5) dari setup sampai OOP, Composer, dan PDO, lalu Laravel 12: routing, Blade, Eloquent, validasi, API Resource, Sanctum, Policy, queue, scheduler, testing dengan Pest, performa, dan deployment. Ditutup proyek Financial Tracker REST API dengan kontrak yang sama seperti versi Go, Python, dan Node.js.',
  tracks: phpTracks,
  sources: [phpSource],
  intro: [
    callout('tip', 'Jalur belajar', 'Mulai dari **PHP Dasar** bila belum pernah menulis PHP modern; developer yang sudah familiar bisa langsung ke [PHP Modern 8.x](#php.php-modern) lalu [Laravel: Instalasi & Routing](#php.lv-dasar-routing). Urutan yang disarankan: PHP Dasar → Laravel Dasar (Eloquent, validasi, Sanctum) → Laravel Lanjutan (queue, testing, deployment) → proyek. Proyek akhir [Financial Tracker REST API](#php.lv-proyek-financial-tracker) mengikuti **kontrak API yang sama** dengan versi Python ([Kontrak API Financial Tracker](#python.kontrak-api-financial-tracker)) dan Node.js ([Kontrak API yang Akan Dibangun](#js.kontrak-api-yang-akan-dibangun)), jadi Anda bisa membandingkan solusi tiap ekosistem dan memakai frontend yang sama.'),
    callout('info', 'Versi yang dipakai', 'Contoh kode memakai **PHP 8.4** dan **Laravel 12**; fitur PHP 8.5 diberi tanda. Laravel merilis versi mayor setiap tahun, jadi periksa [Release Notes Laravel](https://laravel.com/docs/releases) sebelum memulai proyek baru. Konsep inti (routing, Eloquent, validasi, queue, testing) stabil antarversi.'),
  ],
  modules: phpModules,
};
