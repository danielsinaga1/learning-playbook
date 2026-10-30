import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'C# Dasar';
const MODERN = 'C# Modern';
const ASPNET = 'ASP.NET Core';
const PRODUKSI = 'Produksi';

const tracks: Track[] = [
  { title: DASAR, summary: 'Instal .NET SDK, struktur proyek, tipe & alur kontrol, OOP dengan class dan record, koleksi dan LINQ.' },
  { title: MODERN, summary: 'Nullable reference types, pattern matching, async/await, generic, delegate, exception, dan dependency injection.' },
  { title: ASPNET, summary: 'Minimal API, EF Core dengan PostgreSQL, middleware, JWT, authorization policy, ProblemDetails, dan rate limiting.' },
  { title: PRODUKSI, summary: 'Testing dengan xUnit, NSubstitute, WebApplicationFactory; publish, Docker, health check, dan OpenTelemetry.' },
];

export const csharpSource = 'C# & .NET: materi tulisan tangan dari dokumentasi resmi Microsoft Learn (30 Oktober 2026)';

export const csharpCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'csharp',
  title: 'C# & .NET: Bahasa, ASP.NET Core & EF Core',
  short: 'C# & .NET',
  monogram: 'C#',
  hue: 'purple',
  description: 'C# modern di .NET 10 (LTS): dasar bahasa, LINQ, async/await, Minimal API, EF Core dengan PostgreSQL, keamanan JWT, testing, dan deploy dengan Docker. Disertai perbandingan dengan Java dan Spring Boot.',
  tracks,
  sources: [csharpSource],
  intro: [
    callout('info', 'Untuk siapa materi ini', 'Untuk backend developer yang sudah paham Java/Spring Boot dan ingin produktif di C#. Banyak konsep terasa familiar: class, interface, generic, DI, ORM. Di Indonesia, .NET banyak dipakai di **perbankan, asuransi, BUMN, dan instansi pemerintah**, sehingga C# adalah nilai tambah nyata di pasar kerja enterprise. Materi memakai **.NET 10 (LTS, didukung sampai November 2028)** dan **C# 14**; fitur khusus C# 14 selalu diberi tanda.'),
  ],
  modules: [
    {
      id: 'cs-setup-dasar',
      title: 'C#: Setup .NET & Dasar Bahasa',
      summary: 'Instal .NET SDK, dotnet new console, struktur proyek, top-level statements, tipe, var, interpolasi string, dan switch expression.',
      track: DASAR, source: csharpSource, duration: '1,5 jam', level: 'Easy',
      blocks: [
        paragraph('.NET adalah runtime dan pustaka standar; C# adalah bahasa utamanya. Satu perintah `dotnet` (CLI) dipakai untuk membuat proyek, restore paket NuGet, build, test, dan publish, mirip gabungan `mvn`/`gradle` dan `java`. Rilis genap (8, 10, ...) adalah **LTS** dengan dukungan tiga tahun; .NET 10 dirilis November 2025 dan .NET 8/9 berakhir dukungannya 10 November 2026.'),
        code('Membuat dan menjalankan proyek', `dotnet --list-sdks                 # pastikan SDK 10.0.x terpasang
dotnet new console -n HaloKasir     # proyek konsol baru
cd HaloKasir
dotnet run                          # build + jalankan
dotnet add package Humanizer        # tambah paket NuGet (seperti dependency Maven)
dotnet build -c Release

# Solusi berisi banyak proyek (mirip multi-module Maven)
dotnet new sln -n Toko
dotnet new classlib -n Toko.Domain
dotnet sln add HaloKasir Toko.Domain
dotnet add HaloKasir reference Toko.Domain`, 'bash'),
        code('HaloKasir.csproj: setara pom.xml yang jauh lebih ringkas', `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>   <!-- using System, System.Linq, dll. otomatis -->
    <Nullable>enable</Nullable>               <!-- nullable reference types aktif -->
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Humanizer" Version="2.14.1" />
  </ItemGroup>
</Project>`, 'xml'),
        code('Program.cs: top-level statements, tipe, interpolasi, switch expression', `// Tanpa class Program dan static void Main: compiler membuatkannya.
const decimal Ppn = 0.11m;                  // decimal untuk uang (akhiran m)
var nama = args.Length > 0 ? args[0] : "Budi";
int jumlah = 3;                             // var dan tipe eksplisit sama-sama statis
decimal harga = 25_000m;
var total = jumlah * harga * (1 + Ppn);

Console.WriteLine($"Halo {nama}, total: {total:N2}");   // interpolasi + format

string kategori = total switch              // switch expression menghasilkan nilai
{
    < 50_000m => "kecil",
    < 500_000m => "sedang",
    _ => "besar",
};

for (var i = 1; i <= jumlah; i++)
{
    Console.WriteLine($"Item ke-{i}");
}

foreach (var hari in new[] { "Senin", "Selasa" })
{
    if (hari == "Senin") continue;
    Console.WriteLine(hari);
}

var struk = $"""
    Nama     : {nama}
    Kategori : {kategori}
    Total    : {total:N0}
    """;                                    // raw string literal, setara text block Java
Console.WriteLine(struk);`, 'csharp'),
        table(['C#', 'Java', 'Catatan'], [
          ['`int`, `long`, `double`, `bool`, `char`', '`int`, `long`, `double`, `boolean`, `char`', 'Alias dari `System.Int32` dst.; tanpa autoboxing ke wrapper terpisah'],
          ['`decimal`', '`BigDecimal`', 'Tipe nilai 128-bit dengan operator biasa (`+`, `*`); pakai untuk uang'],
          ['`string` (immutable)', '`String`', '`==` membandingkan **isi**, bukan referensi'],
          ['`DateOnly`, `DateTime`, `DateTimeOffset`', '`LocalDate`, `LocalDateTime`, `OffsetDateTime`', 'Simpan waktu transaksi sebagai `DateTimeOffset` atau UTC'],
          ['`var`', '`var`', 'Inferensi tipe lokal, sama-sama statis'],
          ['Namespace + `using`', 'Package + `import`', 'Nama namespace tidak harus sama dengan folder'],
        ]),
        callout('tip', 'File-based app (.NET 10)', 'Untuk skrip cepat, .NET 10 bisa menjalankan satu file tanpa .csproj: `dotnet run halo.cs`. Cocok untuk eksperimen sintaks; untuk aplikasi tetap gunakan proyek.'),
        ...quiz([
          ['CS-01', 'Mengapa uang sebaiknya bertipe `decimal`, bukan `double`?', '`double` adalah floating point biner sehingga 0.1 tidak bisa direpresentasikan tepat dan penjumlahan berulang menimbulkan selisih. `decimal` berbasis desimal dengan presisi 28–29 digit, sehingga nilai seperti 0.1 dan 25000.50 tersimpan tepat. Bedanya dengan Java: `decimal` adalah tipe bawaan dengan operator aritmetika biasa, bukan objek seperti `BigDecimal`.'],
          ['CS-02', 'Apa yang dilakukan compiler terhadap top-level statements?', 'Compiler membungkus pernyataan di Program.cs ke dalam method entry point pada class yang dibuat otomatis. `args` tersedia sebagai parameter implisit, dan `await` boleh dipakai langsung. Hanya satu file per proyek yang boleh berisi top-level statements.'],
        ]),
        ...practice('cs-setup', [
          'Instal .NET 10 SDK, jalankan `dotnet --info`, lalu buat proyek konsol HaloKasir dan jalankan.',
          'Tulis program yang membaca jumlah dan harga dari `args`, menghitung PPN 11% dengan `decimal`, dan mencetak struk dengan raw string literal.',
          'Buat solusi berisi proyek konsol dan class library, lalu panggil method dari library.',
          'Ubah rantai if-else kategori belanja menjadi switch expression dengan relational pattern.',
        ]),
        references(
          ['Install .NET', 'https://learn.microsoft.com/en-us/dotnet/core/install/'],
          ['Tour of C#', 'https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/'],
          ['Top-level statements', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements'],
          ['switch expression', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression'],
          ['.NET CLI overview', 'https://learn.microsoft.com/en-us/dotnet/core/tools/'],
        ),
      ],
    },
    {
      id: 'cs-oop-class-record',
      title: 'C#: OOP dengan Class, Interface & Record',
      summary: 'Property, constructor dan primary constructor, interface, pewarisan, record dan record struct, struct vs class, access modifier, static.',
      track: DASAR, source: csharpSource, duration: '2 jam', level: 'Easy',
      blocks: [
        paragraph('OOP di C# sangat mirip Java, dengan beberapa perbedaan penting: **property** menggantikan getter/setter manual, method **tidak virtual secara default** (harus ditandai `virtual` agar bisa di-override), ada **struct** (tipe nilai), dan **record** untuk data dengan kesetaraan berdasarkan nilai.'),
        code('Interface, class abstrak, primary constructor, pewarisan', `public interface IRekening
{
    string Nomor { get; }
    decimal Saldo { get; }
    void Setor(decimal jumlah);
}

// Primary constructor (C# 12): parameter langsung tersedia di seluruh class
public abstract class RekeningDasar(string nomor) : IRekening
{
    public string Nomor { get; } = nomor;
    public decimal Saldo { get; protected set; }          // set hanya dari class turunan

    public virtual void Setor(decimal jumlah)             // virtual = boleh di-override
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(jumlah);
        Saldo += jumlah;
    }
}

public sealed class Tabungan(string nomor, decimal bungaTahunan) : RekeningDasar(nomor)
{
    public decimal BungaTahunan { get; } = bungaTahunan;
    public int JumlahSetoran { get; private set; }

    public override void Setor(decimal jumlah)
    {
        base.Setor(jumlah);                               // base = super di Java
        JumlahSetoran++;
    }

    public decimal BungaBulanan() => Saldo * BungaTahunan / 12;   // expression-bodied member

    public static Tabungan Baru(string nomor) => new(nomor, 0.03m);   // target-typed new
}`, 'csharp'),
        code('Constructor klasik, koleksi read-only, dan object initializer', `var budi = new Nasabah("Budi", "3171234567890001") { Telepon = "0812..." };
budi.Buka(Tabungan.Baru("001-123"));
budi.Rekening[0].Setor(500_000m);

public class Nasabah
{
    private readonly List<IRekening> _rekening = [];

    public Nasabah(string nama, string nik)
    {
        if (nik.Length != 16) throw new ArgumentException("NIK harus 16 digit", nameof(nik));
        Nama = nama;
        Nik = nik;
    }

    public string Nama { get; }                         // read-only: hanya diisi di constructor
    public string Nik { get; }
    public string? Telepon { get; set; }                 // auto-property biasa
    public IReadOnlyList<IRekening> Rekening => _rekening;

    public void Buka(IRekening rekening) => _rekening.Add(rekening);
}`, 'csharp'),
        code('record, with-expression, dan record struct', `var a = new Uang(50_000m, "IDR");
var b = a with { Jumlah = 75_000m };                 // salinan dengan perubahan
Console.WriteLine(a == new Uang(50_000m, "IDR"));   // True: kesetaraan berdasarkan nilai
Console.WriteLine(b);                                // Uang { Jumlah = 75000, MataUang = IDR }
var (jumlah, mataUang) = b;                          // deconstruct otomatis

public record Uang(decimal Jumlah, string MataUang)
{
    public Uang Tambah(Uang lain) => MataUang == lain.MataUang
        ? this with { Jumlah = Jumlah + lain.Jumlah }
        : throw new InvalidOperationException("beda mata uang");
}

// Tipe nilai kecil yang immutable
public readonly record struct Koordinat(double Lat, double Lng);`, 'csharp'),
        table(['Konsep', 'C#', 'Java'], [
          ['Getter/setter', 'Property `{ get; set; }`, `init`, `private set`', 'Method `getX()`/`setX()` atau Lombok'],
          ['Override', 'Wajib `virtual` + `override`', 'Semua method non-final bisa di-override'],
          ['Mencegah turunan', '`sealed`', '`final`'],
          ['Akses', '`public`, `private` (default member), `protected`, `internal` (satu assembly), `private protected`, `protected internal`', '`public`, `private`, `protected`, package-private (default)'],
          ['Record', 'Bisa class atau struct, bisa diwarisi, punya `with`', 'Selalu final dan immutable'],
          ['Tipe nilai', '`struct`: disalin saat di-assign, tanpa alokasi heap terpisah', 'Hanya primitif (Valhalla masih berjalan)'],
          ['Anggota statis', '`static` member dan `static class` (tidak bisa diinstansiasi)', '`static` member; class utilitas dengan constructor private'],
        ]),
        callout('warn', 'struct bukan class kecil', 'Gunakan `struct` hanya untuk nilai kecil yang immutable (koordinat, ID bertipe kuat). Struct besar mahal disalin, dan struct mutable membingungkan karena perubahan terjadi pada salinan. Untuk entitas dan service, tetap pakai `class`.'),
        paragraph('Perbandingan dengan record Java ada di [Java Modern: Records, Sealed Class & Pattern Matching](#java.java-records-sealed-pattern).'),
        ...quiz([
          ['CS-03', 'Kelas turunan menulis method `Setor` dengan nama yang sama, tetapi method di class induk tidak `virtual`. Apa yang terjadi?', 'Method turunan **menyembunyikan** (hiding) method induk, dan compiler memberi warning agar memakai `new` secara eksplisit. Bila objek diakses lewat variabel bertipe induk, method induk yang dipanggil, bukan milik turunan. Ini berbeda dengan Java, tempat semua method non-final otomatis polimorfik.'],
          ['CS-04', 'Kapan memilih record dibanding class?', 'Record cocok untuk data yang identitasnya ditentukan oleh nilai: DTO, value object, pesan, hasil query. Record memberi Equals/GetHashCode berbasis nilai, ToString yang terbaca, deconstruct, dan `with`. Class lebih cocok untuk entitas dengan identitas dan perilaku yang berubah sepanjang waktu, misalnya entitas EF Core atau service.'],
          ['CS-05', 'Apa arti `internal` dan kapan berguna?', '`internal` berarti hanya terlihat di dalam assembly (proyek) yang sama. Berguna untuk menyembunyikan implementasi di class library: interface publik, implementasi internal. Java tidak punya padanan persis; package-private lebih sempit, sedangkan module system Java mendekati.'],
        ]),
        ...practice('cs-oop', [
          'Modelkan Rekening dengan interface, class abstrak, dan dua turunan (Tabungan, Giro) memakai primary constructor.',
          'Buat record `Uang` yang menolak penjumlahan beda mata uang, dan buktikan kesetaraan nilai dengan `==`.',
          'Buat `readonly record struct NomorRekening(string Nilai)` dan pakai sebagai pengganti string mentah di method publik.',
          'Pindahkan model ke class library; jadikan implementasi `internal` dan hanya interface yang `public`.',
        ]),
        references(
          ['Classes', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes'],
          ['Records', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records'],
          ['Primary constructors', 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/primary-constructors'],
          ['Access modifiers', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers'],
          ['Structure types', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct'],
        ),
      ],
    },
    {
      id: 'cs-koleksi-linq',
      title: 'C#: Koleksi & LINQ',
      summary: 'List, Dictionary, HashSet, IEnumerable, LINQ method syntax dan query syntax, jebakan deferred execution, dan operator penting.',
      track: DASAR, source: csharpSource, duration: '2 jam', level: 'Med',
      blocks: [
        paragraph('Koleksi di .NET berada di `System.Collections.Generic`, dan semuanya mengimplementasikan `IEnumerable<T>`. **LINQ** (Language Integrated Query) adalah sekumpulan method extension di atas `IEnumerable<T>`, setara Stream API Java, tetapi tanpa `.stream()` dan `.collect()`, dan bisa diterjemahkan ke SQL oleh EF Core lewat `IQueryable<T>`.'),
        code('List, Dictionary, HashSet', `var produk = new List<Produk>
{
    new("Kopi Gayo", "Minuman", 45_000m, 10),
    new("Teh Melati", "Minuman", 15_000m, 0),
    new("Rendang", "Makanan", 60_000m, 4),
    new("Keripik", "Makanan", 12_000m, 25),
};

var stok = new Dictionary<string, int> { ["KOPI-01"] = 10, ["TEH-01"] = 0 };
stok["ROTI-01"] = 7;                                  // tambah atau timpa
if (stok.TryGetValue("KOPI-01", out var jumlah))      // aman, tanpa exception
{
    Console.WriteLine($"Stok kopi: {jumlah}");
}
// stok["TIDAK-ADA"] melempar KeyNotFoundException

var kota = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Jakarta", "medan" };
Console.WriteLine(kota.Contains("MEDAN"));             // True
Console.WriteLine(kota.Add("jakarta"));                // False: sudah ada

public record Produk(string Nama, string Kategori, decimal Harga, int Stok);`, 'csharp'),
        code('LINQ: method syntax dan query syntax', `// Method syntax (paling umum dipakai)
List<string> mahal = produk
    .Where(p => p.Harga > 20_000m)
    .OrderByDescending(p => p.Harga)
    .Select(p => p.Nama)
    .ToList();

var nilaiPerKategori = produk
    .GroupBy(p => p.Kategori)
    .Select(g => new { Kategori = g.Key, Nilai = g.Sum(p => p.Harga * p.Stok) })
    .ToDictionary(x => x.Kategori, x => x.Nilai);

bool adaKosong = produk.Any(p => p.Stok == 0);
Produk? termurah = produk.MinBy(p => p.Harga);
var termahal3 = produk.OrderByDescending(p => p.Harga).Take(3);

// Query syntax: diterjemahkan compiler ke method yang sama
var mahalQuery =
    from p in produk
    where p.Harga > 20_000m
    orderby p.Harga descending
    select p.Nama;`, 'csharp'),
        code('Jebakan deferred execution', `var tersedia = produk.Where(p => p.Stok > 0);   // BELUM dieksekusi, hanya resep query

produk.Add(new("Roti", "Makanan", 18_000m, 5));
Console.WriteLine(tersedia.Count());           // 4: Roti ikut terhitung karena dievaluasi sekarang

// Setiap enumerasi menjalankan ulang seluruh pipeline
IEnumerable<Produk> berat = produk.Where(p => HitungMahal(p));
if (berat.Any())                               // eksekusi ke-1
{
    foreach (var p in berat) { }               // eksekusi ke-2: HitungMahal dipanggil lagi
}

// Materialisasi sekali bila hasilnya dipakai berulang
List<Produk> snapshot = produk.Where(p => p.Stok > 0).ToList();

static bool HitungMahal(Produk p) => p.Harga > 40_000m;`, 'csharp'),
        table(['LINQ', 'Java Stream', 'Keterangan'], [
          ['`Where`', '`filter`', 'Menyaring elemen'],
          ['`Select` / `SelectMany`', '`map` / `flatMap`', 'Proyeksi; `Select` juga punya overload dengan indeks'],
          ['`OrderBy` / `ThenBy`', '`sorted(Comparator...)`', 'Pengurutan stabil, bisa bertingkat'],
          ['`GroupBy`, `CountBy`', '`Collectors.groupingBy`', 'Hasil `GroupBy` adalah `IGrouping<TKey, T>`'],
          ['`Any` / `All`', '`anyMatch` / `allMatch`', 'Berhenti segera saat jawaban diketahui'],
          ['`First` / `FirstOrDefault` / `Single`', '`findFirst()` + `get`/`orElse`', '`First` melempar bila kosong; `Single` melempar bila lebih dari satu'],
          ['`Take` / `Skip` / `Chunk`', '`limit` / `skip`', '`Chunk(100)` memecah jadi batch'],
          ['`Aggregate`, `Sum`, `Max`, `MinBy`', '`reduce`, `sum`, `max`', '`MaxBy`/`MinBy` mengembalikan elemennya'],
          ['`ToList` / `ToDictionary` / `ToHashSet`', '`toList()` / `Collectors.toMap`', 'Mengeksekusi query (materialisasi)'],
        ]),
        callout('tip', 'Tipe parameter', 'Terima `IEnumerable<T>` atau `IReadOnlyList<T>` di parameter method agar pemanggil fleksibel, dan kembalikan tipe konkret yang sudah dimaterialisasi (`List<T>`, `IReadOnlyList<T>`) agar pemanggil tidak tanpa sadar mengeksekusi query berulang kali.'),
        ...quiz([
          ['CS-06', 'Kode memanggil `Count()` lalu `foreach` pada hasil `Where` yang memanggil API eksternal di lambda. Apa masalahnya?', 'Hasil `Where` adalah query lazy. `Count()` dan `foreach` masing-masing mengenumerasi ulang dan memanggil lambda lagi, sehingga API eksternal dipanggil dua kali per elemen. Materialisasi sekali dengan `ToList()` lalu pakai list itu.'],
          ['CS-07', 'Apa beda `First`, `FirstOrDefault`, dan `Single`?', '`First` mengambil elemen pertama dan melempar InvalidOperationException bila kosong. `FirstOrDefault` mengembalikan default (null untuk reference type) bila kosong. `Single` menegaskan tepat satu elemen dan melempar bila kosong atau lebih dari satu; cocok untuk mencari berdasarkan kunci unik.'],
        ]),
        ...practice('cs-linq', [
          'Dari daftar 20 transaksi (record), hitung total per kategori, 3 transaksi terbesar, dan rata-rata per hari dengan LINQ.',
          'Tulis query yang sama dalam method syntax dan query syntax, lalu bandingkan keterbacaannya.',
          'Buktikan deferred execution: buat query, ubah sumber data, lalu cetak hasil sebelum dan sesudah `ToList()`.',
          'Ganti pencarian di List dengan Dictionary atau HashSet dan jelaskan perubahan kompleksitasnya.',
        ]),
        references(
          ['Collections and data structures', 'https://learn.microsoft.com/en-us/dotnet/standard/collections/'],
          ['LINQ overview', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/'],
          ['Standard query operators', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/'],
        ),
      ],
    },
    {
      id: 'cs-null-pattern-modern',
      title: 'C# Modern: Nullable, Pattern Matching & Sintaks Baru',
      summary: 'Nullable reference types, operator ?. ?? ??=, type/property/list pattern, switch expression, required/init, dan collection expression.',
      track: MODERN, source: csharpSource, duration: '2 jam', level: 'Med',
      blocks: [
        paragraph('Dengan `<Nullable>enable</Nullable>` (default di template baru), `string` berarti **tidak boleh null** dan `string?` berarti **boleh null**. Compiler memberi warning saat nilai yang mungkin null dipakai tanpa dicek. Ini analisis statis, bukan pengecekan runtime, tetapi efektif mencegah NullReferenceException bila warning diperlakukan sebagai error.'),
        code('Nullable reference types, required, init, dan operator null', `var p = new Pelanggan { Nama = "Sari" };             // tanpa Nama = error kompilasi

string kota = p.Alamat?.Kota ?? "tidak diketahui";   // ?. berhenti bila null, ?? memberi default
int panjangEmail = p.Email?.Length ?? 0;

Dictionary<string, int>? cache = null;
cache ??= new Dictionary<string, int>();             // assign hanya bila masih null

if (p.Email is not null)
{
    Console.WriteLine(p.Email.ToLower());            // compiler tahu Email tidak null di sini
}

p.Alamat?.Kota = "Bandung";                          // C# 14: null-conditional assignment
string paksa = p.Email!;                             // ! = "saya jamin tidak null"; hindari bila bisa

public sealed class Pelanggan
{
    public required string Nama { get; init; }       // wajib diisi saat dibuat, lalu tidak bisa diubah
    public string? Email { get; init; }               // boleh null
    public Alamat? Alamat { get; set; }
}

public sealed class Alamat
{
    public required string Kota { get; set; }
}`, 'csharp'),
        code('Pattern matching: type, property, positional, relational', `public abstract record Pembayaran(decimal Jumlah);
public sealed record Tunai(decimal Jumlah) : Pembayaran(Jumlah);
public sealed record Kartu(decimal Jumlah, string NomorAkhir, bool Kredit) : Pembayaran(Jumlah);
public sealed record Transfer(decimal Jumlah, string Bank) : Pembayaran(Jumlah);

public static class LabelPembayaran
{
    public static string Dari(Pembayaran p) => p switch
    {
        Tunai { Jumlah: > 100_000_000m } => "Tunai besar: wajib dilaporkan",
        Tunai t => $"Tunai {t.Jumlah:N0}",
        Kartu { Kredit: true, NomorAkhir: var akhir } => $"Kartu kredit ****{akhir}",
        Kartu k => $"Kartu debit ****{k.NomorAkhir}",
        Transfer(_, "BCA") => "Transfer BCA",                 // positional pattern
        Transfer(var jumlah, var bank) => $"Transfer {bank} {jumlah:N0}",
        _ => throw new ArgumentOutOfRangeException(nameof(p)),
    };

    public static bool PerluVerifikasi(Pembayaran p) =>
        p is Kartu { Kredit: true } or Transfer { Jumlah: >= 50_000_000m };
}`, 'csharp'),
        code('List pattern dan collection expression', `static string Jelaskan(int[] angka) => angka switch
{
    [] => "kosong",
    [var satu] => $"satu elemen: {satu}",
    [var awal, .., var akhir] => $"awal {awal}, akhir {akhir}",
};

static bool PerintahValid(string[] args) => args is ["deploy", "prod" or "staging", ..];

// Collection expression (C# 12): satu sintaks untuk array, List, Span, dll.
int[] dasar = [1, 2, 3];
List<string> kota = ["Jakarta", "Medan", "Makassar"];
int[] gabungan = [..dasar, 4, 5];                    // spread
IReadOnlyList<string> kosong = [];`, 'csharp'),
        table(['C#', 'Java', 'Catatan'], [
          ['`string?` + analisis compiler', '`Optional<T>`, anotasi `@Nullable`', 'C# memeriksa di level bahasa, tanpa objek pembungkus'],
          ['`a?.b ?? c`', '`Optional.ofNullable(a).map(...).orElse(c)`', 'Jauh lebih ringkas'],
          ['`switch` expression + property pattern', '`switch` + record pattern (Java 21)', 'C# bisa mencocokkan property tanpa positional record'],
          ['Hierarki record abstrak', '`sealed interface` + `permits`', 'Sampai C# 14 belum ada hierarki tertutup; arm `_` tetap diperlukan agar exhaustive'],
          ['`required` / `init`', 'Constructor wajib, record immutable', '`init` hanya bisa diisi saat inisialisasi objek'],
        ]),
        callout('warn', 'Nullable bukan jaminan runtime', 'Data dari JSON, database, atau library lama tetap bisa null walau tipenya `string`. Validasi input di batas sistem, dan aktifkan `<WarningsAsErrors>nullable</WarningsAsErrors>` di .csproj agar warning null tidak diabaikan.'),
        ...quiz([
          ['CS-08', 'Apa beda `x ?? y` dan `x ??= y`?', '`x ?? y` adalah ekspresi yang menghasilkan x bila tidak null, selain itu y; x tidak berubah. `x ??= y` mengubah x menjadi y hanya bila x null, dan sering dipakai untuk inisialisasi malas (lazy).'],
          ['CS-09', 'Mengapa switch expression atas record `Pembayaran` di atas tetap membutuhkan arm `_`, padahal semua turunan sudah ditangani?', 'C# (sampai versi 14) tidak mengenal hierarki tertutup seperti sealed interface Java. Compiler tidak bisa memastikan tidak ada turunan lain di assembly lain, sehingga tanpa arm `_` muncul warning CS8509 dan runtime bisa melempar SwitchExpressionException. Arm `_` yang melempar exception membuat maksudnya eksplisit.'],
          ['CS-10', 'Kapan operator `!` (null-forgiving) wajar dipakai?', 'Hanya bila Anda tahu pasti nilai tidak null tetapi compiler tidak bisa membuktikannya, misalnya properti navigasi EF Core yang diisi framework (`= null!`). Di kode bisnis, lebih baik cek null eksplisit atau ubah desain agar tipe tidak nullable.'],
        ]),
        ...practice('cs-modern', [
          'Aktifkan nullable dan WarningsAsErrors untuk nullable di satu proyek, lalu perbaiki semua warning tanpa memakai `!`.',
          'Modelkan status pesanan sebagai hierarki record dan tulis switch expression dengan property pattern untuk biaya kirim.',
          'Tulis parser argumen CLI sederhana memakai list pattern (`["tambah", var nama, ..]`).',
          'Ganti inisialisasi koleksi lama (`new List<T> { ... }`, `Array.Empty<T>()`) dengan collection expression.',
        ]),
        references(
          ['Nullable reference types', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types'],
          ['Pattern matching overview', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/patterns/pattern-matching'],
          ['Patterns (language reference)', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns'],
          ['Collection expressions', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions'],
          ['What is new in C# 14', 'https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14'],
        ),
      ],
    },
    {
      id: 'cs-async-await',
      title: 'C# Modern: Async/Await, Task & Cancellation',
      summary: 'Task, async/await, ConfigureAwait, CancellationToken, Task.WhenAll, IAsyncEnumerable, dan jebakan deadlock.',
      track: MODERN, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('C# memperkenalkan `async`/`await` sejak 2012, dan seluruh ekosistem .NET (HttpClient, EF Core, ASP.NET Core) dibangun di atasnya. `Task<T>` mirip `CompletableFuture<T>`, tetapi `await` membuat kode asinkron terbaca seperti kode sinkron. Saat menunggu I/O, thread dikembalikan ke thread pool sehingga server bisa melayani request lain. Java mencapai efek serupa dengan pendekatan berbeda: [virtual threads](#java.java-virtual-threads).'),
        code('async/await dan CancellationToken', `using System.Net.Http.Json;

public record KursResponse(string MataUang, decimal Nilai);

public sealed class KursService(HttpClient http)
{
    public async Task<decimal> AmbilKursAsync(string mataUang, CancellationToken ct = default)
    {
        var resp = await http.GetFromJsonAsync<KursResponse>($"kurs/{mataUang}", ct);
        return resp?.Nilai ?? throw new InvalidOperationException($"Kurs {mataUang} kosong");
    }
}

public static class KursHelper
{
    // Batas waktu: gabungkan token pemanggil dengan timeout sendiri
    public static async Task<decimal> KursDenganTimeoutAsync(KursService svc, CancellationToken ct)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(3));
        try
        {
            return await svc.AmbilKursAsync("USD", cts.Token);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new TimeoutException("Layanan kurs tidak merespons dalam 3 detik");
        }
    }
}`, 'csharp'),
        code('Paralel dengan Task.WhenAll dan stream dengan IAsyncEnumerable', `using System.Runtime.CompilerServices;

public static class Contoh
{
    // Jalankan bersamaan, tunggu semuanya: total waktu = yang paling lama, bukan jumlahnya
    public static async Task<Dictionary<string, decimal>> SemuaKursAsync(KursService svc, CancellationToken ct)
    {
        string[] mataUang = ["USD", "SGD", "JPY"];
        decimal[] hasil = await Task.WhenAll(mataUang.Select(m => svc.AmbilKursAsync(m, ct)));
        return mataUang.Zip(hasil).ToDictionary(x => x.First, x => x.Second);
    }

    // Menghasilkan data sedikit demi sedikit (mis. membaca halaman API)
    public static async IAsyncEnumerable<int> BacaHalamanAsync(
        int total, [EnumeratorCancellation] CancellationToken ct = default)
    {
        for (var halaman = 1; halaman <= total; halaman++)
        {
            await Task.Delay(100, ct);          // simulasi I/O
            yield return halaman;
        }
    }

    public static async Task CetakAsync(CancellationToken ct)
    {
        await foreach (var h in BacaHalamanAsync(5, ct))
        {
            Console.WriteLine($"Halaman {h} selesai");
        }
    }
}`, 'csharp'),
        table(['Jebakan', 'Akibat', 'Perbaikan'], [
          ['`.Result` / `.Wait()` pada Task', 'Deadlock di UI atau ASP.NET lama (ada SynchronizationContext); thread pool starvation di ASP.NET Core', 'Async sampai ke atas: `await` di seluruh rantai'],
          ['`async void`', 'Exception tidak bisa ditangkap pemanggil dan bisa menjatuhkan proses', 'Kembalikan `Task`; `async void` hanya untuk event handler'],
          ['Lupa `await`', 'Pekerjaan berjalan tanpa diawasi, exception hilang', 'Perhatikan warning CS4014; selalu await atau simpan Task-nya'],
          ['Tidak meneruskan `CancellationToken`', 'Request yang dibatalkan klien tetap memakan DB dan CPU', 'Terima `CancellationToken ct` dan teruskan ke setiap pemanggilan I/O'],
          ['`Task.Run` di ASP.NET Core untuk I/O', 'Memindah kerja ke thread lain tanpa manfaat', 'Panggil API async langsung; `Task.Run` untuk kerja CPU berat saja'],
        ]),
        callout('info', 'ConfigureAwait(false)', 'Di ASP.NET Core tidak ada SynchronizationContext, sehingga `ConfigureAwait(false)` tidak diperlukan di kode aplikasi. Di **library** yang mungkin dipakai aplikasi desktop (WPF/WinForms), `await task.ConfigureAwait(false)` tetap dianjurkan agar kelanjutan tidak kembali ke thread UI.'),
        ...quiz([
          ['CS-11', 'Mengapa `await a; await b;` bisa lebih lambat daripada `await Task.WhenAll(a, b)`?', 'Bila Task dibuat dan langsung di-await satu per satu, pekerjaan kedua baru dimulai setelah yang pertama selesai, sehingga waktunya dijumlahkan. Dengan memulai semua Task dulu lalu `Task.WhenAll`, I/O berjalan bersamaan dan total waktunya sekitar waktu yang paling lama. Batasi jumlah paralel bila targetnya API eksternal atau database.'],
          ['CS-12', 'Endpoint ASP.NET Core memanggil `service.GetAsync().Result`. Mengapa tetap berbahaya walau tidak deadlock?', 'Thread request diblokir menunggu I/O. Di bawah beban, thread pool kehabisan thread (starvation), latency naik drastis, dan throughput turun. Selain itu exception dibungkus AggregateException. Solusinya jadikan endpoint async dan await sepanjang rantai.'],
        ]),
        ...practice('cs-async', [
          'Panggil tiga endpoint HTTP (mis. httpbin.org/delay/1) secara berurutan lalu dengan Task.WhenAll; catat perbedaan waktu dengan Stopwatch.',
          'Tambahkan timeout 2 detik memakai CancellationTokenSource.CreateLinkedTokenSource dan bedakan timeout dari pembatalan pemanggil.',
          'Tulis IAsyncEnumerable yang membaca data berhalaman dan konsumsi dengan await foreach.',
          'Cari semua `.Result`, `.Wait()`, dan `async void` di sebuah proyek lalu perbaiki.',
        ]),
        references(
          ['Asynchronous programming', 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/'],
          ['Cancellation in managed threads', 'https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads'],
          ['Async streams', 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream'],
          ['Task-based asynchronous pattern', 'https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap'],
        ),
      ],
    },
    {
      id: 'cs-generic-di-exception',
      title: 'C# Modern: Generic, Delegate, Exception & Dependency Injection',
      summary: 'Generic dan constraint, delegate/Func/Action/lambda, event, exception dan using/IDisposable, serta konsep DI bawaan .NET.',
      track: MODERN, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('Generic di C# **tidak di-erase**: `List<int>` dan `List<string>` adalah tipe berbeda saat runtime, sehingga `typeof(T)` dan `new T()` bisa dipakai, dan `List<int>` menyimpan int tanpa boxing. Fungsi adalah nilai kelas satu lewat **delegate**, dan DI sudah menjadi bagian platform (`Microsoft.Extensions.DependencyInjection`), dipakai oleh ASP.NET Core, worker service, maupun aplikasi konsol.'),
        code('Generic dengan constraint', `public interface IEntitas
{
    int Id { get; }
}

public interface IRepository<T> where T : class, IEntitas
{
    Task<T?> CariAsync(int id, CancellationToken ct = default);
    Task SimpanAsync(T entitas, CancellationToken ct = default);
}

public sealed class RepositoryMemori<T> : IRepository<T> where T : class, IEntitas
{
    private readonly Dictionary<int, T> _data = new();

    public Task<T?> CariAsync(int id, CancellationToken ct = default) =>
        Task.FromResult(_data.GetValueOrDefault(id));

    public Task SimpanAsync(T entitas, CancellationToken ct = default)
    {
        _data[entitas.Id] = entitas;
        return Task.CompletedTask;
    }
}

public static class Util
{
    // Constraint: T harus bisa dibandingkan
    public static T Terbesar<T>(IReadOnlyList<T> items) where T : IComparable<T>
    {
        if (items.Count == 0) throw new ArgumentException("daftar kosong", nameof(items));
        var maks = items[0];
        foreach (var item in items)
        {
            if (item.CompareTo(maks) > 0) maks = item;
        }
        return maks;
    }
}`, 'csharp'),
        code('Delegate, Func/Action, lambda, dan event', `Func<decimal, decimal> denganPpn = harga => harga * 1.11m;   // input decimal, output decimal
Action<string> log = pesan => Console.WriteLine($"[log] {pesan}");
Predicate<int> genap = n => n % 2 == 0;

log($"Harga + PPN: {denganPpn(100_000m):N0}");

public sealed class ItemDitambahkanEventArgs(string sku) : EventArgs
{
    public string Sku { get; } = sku;
}

public sealed class Keranjang
{
    private readonly List<string> _item = [];
    public event EventHandler<ItemDitambahkanEventArgs>? ItemDitambahkan;   // pola observer bawaan

    public void Tambah(string sku)
    {
        _item.Add(sku);
        ItemDitambahkan?.Invoke(this, new ItemDitambahkanEventArgs(sku));
    }
}

// Pemakaian:
// var k = new Keranjang();
// k.ItemDitambahkan += (_, e) => Console.WriteLine($"Ditambah {e.Sku}");`, 'csharp'),
        code('Exception, filter when, dan using/IDisposable', `public sealed class SaldoTidakCukupException(string nomor, decimal kurang)
    : Exception($"Saldo rekening {nomor} kurang {kurang:N0}")
{
    public string Nomor { get; } = nomor;
    public decimal Kurang { get; } = kurang;
}

public static class Konfig
{
    public static async Task<string> BacaAsync(string path, CancellationToken ct)
    {
        try
        {
            using var reader = new StreamReader(path);   // Dispose otomatis di akhir scope
            return await reader.ReadToEndAsync(ct);
        }
        catch (FileNotFoundException) when (path.EndsWith(".local.json"))
        {
            return "{}";                                 // filter: hanya tangkap kasus ini
        }
        catch (IOException ex)
        {
            // Bungkus dengan konteks; exception asli tetap ada di InnerException.
            // Bila tidak menambah konteks, cukup "throw;" agar stack trace utuh.
            throw new InvalidOperationException($"Gagal membaca konfigurasi {path}", ex);
        }
    }
}

public sealed class KoneksiPrinter : IDisposable
{
    private bool _disposed;

    public void Cetak(string teks)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        Console.WriteLine(teks);
    }

    public void Dispose() => _disposed = true;           // lepas resource di sini
}`, 'csharp'),
        table(['DI .NET', 'Spring', 'Kapan dipakai'], [
          ['`AddSingleton<I, Impl>()`', '`@Component` (singleton default)', 'Tanpa state per request dan thread-safe: konfigurasi, cache, `HttpClient` factory'],
          ['`AddScoped<I, Impl>()`', '`@RequestScope`', 'Satu instance per request: `DbContext`, unit of work'],
          ['`AddTransient<I, Impl>()`', '`@Scope("prototype")`', 'Objek ringan tanpa state, dibuat setiap kali diminta'],
          ['Constructor injection (primary constructor)', 'Constructor injection', 'Cara utama; tidak ada field injection'],
          ['`AddKeyedSingleton` + `[FromKeyedServices("x")]`', '`@Qualifier("x")`', 'Beberapa implementasi untuk interface yang sama'],
          ['`IOptions<T>`', '`@ConfigurationProperties`', 'Konfigurasi bertipe kuat dari appsettings'],
        ]),
        callout('warn', 'Captive dependency', 'Jangan menyuntikkan service **scoped** (mis. `DbContext`) ke service **singleton**: instance scoped akan tertahan selamanya dan dipakai bersama oleh banyak request. Di Development, ASP.NET Core memvalidasi scope dan melempar exception saat startup bila ini terjadi. Bila singleton butuh DbContext, suntikkan `IServiceScopeFactory` dan buat scope sendiri.'),
        ...quiz([
          ['CS-13', 'Apa beda `throw;` dan `throw ex;` di blok catch?', '`throw;` melempar ulang exception yang sama dengan stack trace asli. `throw ex;` mereset stack trace ke baris catch, sehingga lokasi asal error hilang. Bila ingin menambah konteks, bungkus dengan exception baru dan isi inner exception.'],
          ['CS-14', 'Mengapa generic C# yang tidak di-erase menguntungkan dibanding Java?', 'Informasi tipe tersedia saat runtime: `typeof(T)`, constraint `new()`, dan pemeriksaan `is T` berfungsi. `List<int>` menyimpan int langsung tanpa boxing ke Integer, sehingga hemat memori dan cepat. Overload berdasarkan argumen generic juga mungkin.'],
          ['CS-15', 'Kapan `using var` dipakai?', 'Untuk objek yang mengimplementasikan IDisposable atau IAsyncDisposable (koneksi, stream, transaksi). `Dispose` dipanggil otomatis di akhir scope, termasuk saat exception, setara try-with-resources di Java. Untuk IAsyncDisposable pakai `await using`.'],
        ]),
        ...practice('cs-generic-di', [
          'Implementasikan `IRepository<T>` generik dengan constraint dan dua entitas berbeda, tanpa duplikasi kode.',
          'Buat pipeline diskon sebagai `List<Func<decimal, decimal>>` lalu terapkan berurutan ke harga.',
          'Buat exception domain dan tangkap dengan filter `when` hanya untuk kode error tertentu.',
          'Susun aplikasi konsol dengan `Host.CreateApplicationBuilder`, daftarkan service singleton/scoped/transient, dan buktikan perbedaan lifetime dengan mencetak `GetHashCode()`.',
        ]),
        references(
          ['Generic types and methods', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics'],
          ['Constraints on type parameters', 'https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters'],
          ['Lambda expressions', 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions'],
          ['Exceptions and exception handling', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/'],
          ['Implement a Dispose method', 'https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose'],
          ['Dependency injection in .NET', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview'],
        ),
      ],
    },
    {
      id: 'cs-aspnet-minimal-api',
      title: 'ASP.NET Core: Minimal API, DTO, Validasi & OpenAPI',
      summary: 'CRUD dengan Minimal API, routing dan route group, DI service, DTO + validasi bawaan .NET 10, OpenAPI, appsettings, dan environment.',
      track: ASPNET, source: csharpSource, duration: '3 jam', level: 'Med',
      blocks: [
        paragraph('ASP.NET Core adalah framework web .NET, setara Spring Boot: server bawaan (Kestrel), DI, konfigurasi, logging, dan middleware dalam satu paket. **Minimal API** memetakan endpoint langsung ke lambda tanpa controller. Untuk API baru, Microsoft merekomendasikan Minimal API; controller (`[ApiController]`) tetap didukung dan mirip `@RestController`.'),
        code('Program.cs: CRUD produk', `using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();                       // dokumen OpenAPI (Microsoft.AspNetCore.OpenApi)
builder.Services.AddValidation();                    // .NET 10: validasi DataAnnotations untuk Minimal API
builder.Services.AddSingleton<IProdukRepository, ProdukRepositoryMemori>();
builder.Services.Configure<KatalogOptions>(builder.Configuration.GetSection("Katalog"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                                // GET /openapi/v1.json
}

var produk = app.MapGroup("/api/produk").WithTags("Produk");

produk.MapGet("/", (IProdukRepository repo, IOptions<KatalogOptions> opsi) =>
    TypedResults.Ok(repo.Semua().Take(opsi.Value.MaksItemPerHalaman)));

produk.MapGet("/{id:int}", Results<Ok<ProdukDto>, NotFound> (int id, IProdukRepository repo) =>
    repo.Cari(id) is { } p ? TypedResults.Ok(p) : TypedResults.NotFound());

produk.MapPost("/", (BuatProdukRequest req, IProdukRepository repo) =>
{
    var dibuat = repo.Tambah(req);
    return TypedResults.Created($"/api/produk/{dibuat.Id}", dibuat);
});

produk.MapPut("/{id:int}", Results<NoContent, NotFound> (int id, BuatProdukRequest req, IProdukRepository repo) =>
    repo.Ubah(id, req) ? TypedResults.NoContent() : TypedResults.NotFound());

produk.MapDelete("/{id:int}", Results<NoContent, NotFound> (int id, IProdukRepository repo) =>
    repo.Hapus(id) ? TypedResults.NoContent() : TypedResults.NotFound());

app.Run();

// DTO: record dengan atribut validasi; gagal validasi = 400 dengan detail error
public record BuatProdukRequest(
    [Required, StringLength(100, MinimumLength = 3)] string Nama,
    [Range(1.0, 1_000_000_000.0)] decimal Harga,
    [Range(0, 100_000)] int Stok);

public record ProdukDto(int Id, string Nama, decimal Harga, int Stok);

public sealed class KatalogOptions
{
    public int MaksItemPerHalaman { get; set; } = 20;
    public string MataUang { get; set; } = "IDR";
}

public interface IProdukRepository
{
    IEnumerable<ProdukDto> Semua();
    ProdukDto? Cari(int id);
    ProdukDto Tambah(BuatProdukRequest req);
    bool Ubah(int id, BuatProdukRequest req);
    bool Hapus(int id);
}

public sealed class ProdukRepositoryMemori : IProdukRepository
{
    private readonly ConcurrentDictionary<int, ProdukDto> _data = new();
    private int _idTerakhir;

    public IEnumerable<ProdukDto> Semua() => _data.Values.OrderBy(p => p.Id);
    public ProdukDto? Cari(int id) => _data.GetValueOrDefault(id);

    public ProdukDto Tambah(BuatProdukRequest req)
    {
        var dto = new ProdukDto(Interlocked.Increment(ref _idTerakhir), req.Nama, req.Harga, req.Stok);
        _data[dto.Id] = dto;
        return dto;
    }

    public bool Ubah(int id, BuatProdukRequest req)
    {
        if (!_data.ContainsKey(id)) return false;
        _data[id] = new ProdukDto(id, req.Nama, req.Harga, req.Stok);
        return true;
    }

    public bool Hapus(int id) => _data.TryRemove(id, out _);
}`, 'csharp'),
        code('appsettings.json (ditimpa appsettings.Development.json dan environment variable)', `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "Katalog": "Host=localhost;Database=katalog;Username=app;Password=ganti-di-secret"
  },
  "Katalog": {
    "MaksItemPerHalaman": 50,
    "MataUang": "IDR"
  }
}`, 'json'),
        code('Menjalankan dengan environment dan menimpa konfigurasi', `dotnet new web -n Katalog.Api
cd Katalog.Api
dotnet add package Microsoft.AspNetCore.OpenApi

# Environment menentukan file appsettings.{Environment}.json yang dibaca
ASPNETCORE_ENVIRONMENT=Development dotnet run

# Environment variable menimpa appsettings; ":" pada key diganti "__"
Katalog__MaksItemPerHalaman=10 dotnet run

# Secret lokal di luar repo (setara .env yang tidak di-commit)
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Katalog" "Host=localhost;Database=katalog;Username=app;Password=rahasia"`, 'bash'),
        table(['ASP.NET Core', 'Spring Boot'], [
          ['`WebApplication.CreateBuilder` + `app.Run()`', '`SpringApplication.run`'],
          ['`app.MapGet/MapPost` atau `[ApiController]`', '`@RestController` + `@GetMapping`'],
          ['`MapGroup("/api/produk")`', '`@RequestMapping("/api/produk")` di class'],
          ['`builder.Services.AddScoped<...>()`', '`@Service`, `@Bean`'],
          ['`appsettings.json` + `appsettings.{Env}.json`', '`application.yml` + `application-{profile}.yml`'],
          ['`ASPNETCORE_ENVIRONMENT`', '`SPRING_PROFILES_ACTIVE`'],
          ['`IOptions<T>` + `Configure<T>(section)`', '`@ConfigurationProperties`'],
          ['DataAnnotations (`[Required]`, `[Range]`)', 'Bean Validation (`@NotNull`, `@Min`)'],
          ['`AddOpenApi` + `MapOpenApi`', 'springdoc-openapi'],
          ['`TypedResults.Created(...)`', '`ResponseEntity.created(...)`'],
        ]),
        callout('tip', 'TypedResults dan Results<...>', 'Gunakan `TypedResults` (bukan `Results`) dan deklarasikan tipe kembalian `Results<Ok<T>, NotFound>`. Compiler memastikan hanya respons itu yang mungkin, dan generator OpenAPI otomatis mendokumentasikan semua status code tanpa anotasi tambahan.'),
        ...quiz([
          ['CS-16', 'Bagaimana `IProdukRepository` sampai ke parameter lambda endpoint?', 'Minimal API memeriksa setiap parameter: tipe sederhana dari route/query, tipe kompleks dari body JSON, dan tipe yang terdaftar di container DI disuntikkan sebagai service. Karena `IProdukRepository` didaftarkan dengan `AddSingleton`, nilainya diambil dari DI. Atribut `[FromServices]`, `[FromBody]`, atau `[FromQuery]` bisa dipakai untuk memperjelas.'],
          ['CS-17', 'Mengapa password di appsettings.json berbahaya dan apa alternatifnya?', 'File itu di-commit ke repository dan ikut di image. Di lokal gunakan user-secrets; di server gunakan environment variable (`ConnectionStrings__Katalog`), Kubernetes Secret, atau secret manager (Azure Key Vault, AWS Secrets Manager) sebagai configuration provider tambahan.'],
        ]),
        ...practice('cs-minimal-api', [
          'Bangun API CRUD produk di atas dan uji semua endpoint dengan file .http atau curl.',
          'Kirim body tidak valid (nama 1 huruf, harga 0) dan pastikan respons 400 berisi detail error per field.',
          'Tambahkan endpoint pencarian `GET /api/produk/cari?nama=&min=&max=` dengan parameter query opsional (`string?`, `decimal?`).',
          'Buka `/openapi/v1.json`, periksa status code yang terdokumentasi, lalu pindahkan batas halaman ke appsettings dan timpa lewat environment variable.',
        ]),
        references(
          ['Minimal APIs overview', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis'],
          ['Tutorial: Minimal API', 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api'],
          ['OpenAPI in ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi'],
          ['Configuration', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/'],
          ['Use multiple environments', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments'],
          ['What is new in ASP.NET Core 10', 'https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0'],
        ),
      ],
    },
    {
      id: 'cs-ef-core',
      title: 'ASP.NET Core: EF Core & PostgreSQL',
      summary: 'DbContext, konfigurasi entitas, migrasi dengan dotnet ef, query LINQ, tracking vs AsNoTracking, N+1 dan Include, PostgreSQL via Npgsql.',
      track: ASPNET, source: csharpSource, duration: '3 jam', level: 'Med',
      blocks: [
        paragraph('Entity Framework Core adalah ORM resmi .NET, setara JPA/Hibernate. `DbContext` adalah unit of work (mirip `EntityManager`), `DbSet<T>` adalah tabel, dan query ditulis dengan **LINQ** lalu diterjemahkan ke SQL. Provider PostgreSQL resmi komunitas adalah **Npgsql**.'),
        code('Paket dan migrasi', `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design     # dibutuhkan tool migrasi
dotnet tool install --global dotnet-ef

dotnet ef migrations add Awal              # buat file migrasi dari model
dotnet ef database update                  # terapkan ke database
dotnet ef migrations add TambahSku
dotnet ef migrations script --idempotent -o migrasi.sql   # skrip untuk DBA / pipeline produksi`, 'bash'),
        code('DbContext, entitas, dan registrasi', `using Microsoft.EntityFrameworkCore;

public class Kategori
{
    public int Id { get; set; }
    public required string Nama { get; set; }
    public List<Produk> Produk { get; } = [];
}

public class Produk
{
    public int Id { get; set; }
    public required string Nama { get; set; }
    public required string Sku { get; set; }
    public decimal Harga { get; set; }
    public int KategoriId { get; set; }
    public Kategori Kategori { get; set; } = null!;     // diisi EF saat di-load
}

public class KatalogDb(DbContextOptions<KatalogDb> options) : DbContext(options)
{
    public DbSet<Produk> Produk => Set<Produk>();
    public DbSet<Kategori> Kategori => Set<Kategori>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Produk>(e =>
        {
            e.ToTable("produk");
            e.Property(p => p.Nama).HasMaxLength(100);
            e.Property(p => p.Harga).HasPrecision(18, 2);
            e.HasIndex(p => p.Sku).IsUnique();
            e.HasOne(p => p.Kategori).WithMany(k => k.Produk).HasForeignKey(p => p.KategoriId);
        });
        model.Entity<Kategori>().ToTable("kategori");
    }
}

// Program.cs: DbContext otomatis scoped (satu per request)
// builder.Services.AddDbContext<KatalogDb>(o =>
//     o.UseNpgsql(builder.Configuration.GetConnectionString("Katalog")));`, 'csharp'),
        code('Query: proyeksi, AsNoTracking, Include, N+1, update massal', `public sealed class ProdukService(KatalogDb db)
{
    // Baca saja: AsNoTracking + proyeksi ke DTO = SELECT kolom yang perlu saja
    public Task<List<ProdukDto>> DaftarAsync(string? cari, CancellationToken ct) =>
        db.Produk.AsNoTracking()
            .Where(p => cari == null || p.Nama.Contains(cari))
            .OrderBy(p => p.Nama)
            .Select(p => new ProdukDto(p.Id, p.Nama, p.Harga, p.Kategori.Nama))
            .ToListAsync(ct);

    // Ubah: entity di-track, perubahan property dideteksi saat SaveChanges
    public async Task<bool> NaikkanHargaAsync(int id, decimal persen, CancellationToken ct)
    {
        var produk = await db.Produk.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (produk is null) return false;
        produk.Harga *= 1 + persen / 100;
        await db.SaveChangesAsync(ct);                  // UPDATE hanya kolom Harga
        return true;
    }

    // N+1: satu query kategori + satu query per kategori
    public async Task<List<(string, int)>> RingkasanLambatAsync(CancellationToken ct)
    {
        var hasil = new List<(string, int)>();
        foreach (var k in await db.Kategori.AsNoTracking().ToListAsync(ct))
        {
            hasil.Add((k.Nama, await db.Produk.CountAsync(p => p.KategoriId == k.Id, ct)));
        }
        return hasil;
    }

    // Satu query dengan proyeksi agregat
    public async Task<List<(string, int)>> RingkasanAsync(CancellationToken ct) =>
        (await db.Kategori.AsNoTracking()
            .Select(k => new { k.Nama, Jumlah = k.Produk.Count })
            .ToListAsync(ct))
        .Select(x => (x.Nama, x.Jumlah))
        .ToList();

    // Butuh entitas lengkap beserta relasinya: Include (+ AsSplitQuery untuk koleksi besar)
    public Task<List<Kategori>> KategoriLengkapAsync(CancellationToken ct) =>
        db.Kategori.AsNoTracking().Include(k => k.Produk).AsSplitQuery().ToListAsync(ct);

    // Update massal tanpa memuat entitas: satu perintah UPDATE
    public Task<int> DiskonKategoriAsync(int kategoriId, CancellationToken ct) =>
        db.Produk.Where(p => p.KategoriId == kategoriId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.Harga, p => p.Harga * 0.9m), ct);
}

public record ProdukDto(int Id, string Nama, decimal Harga, string Kategori);`, 'csharp'),
        table(['EF Core', 'JPA / Hibernate', 'Catatan'], [
          ['`DbContext`', '`EntityManager` / Session', 'Scoped per request; tidak thread-safe'],
          ['`DbSet<T>` + LINQ', 'Repository / JPQL / Criteria', 'Query bertipe kuat, dicek compiler'],
          ['Change tracking + `SaveChangesAsync`', 'Dirty checking + flush/commit', '`SaveChanges` membungkus semua perubahan dalam satu transaksi'],
          ['`AsNoTracking()`', '`@Transactional(readOnly = true)` / read-only hint', 'Lebih cepat dan hemat memori untuk query baca'],
          ['`Include` / `ThenInclude`', '`JOIN FETCH` / `@EntityGraph`', 'Lazy loading EF **tidak aktif** secara default'],
          ['`dotnet ef migrations`', 'Flyway / Liquibase', 'Migrasi dibuat dari perbedaan model, berupa kode C#'],
          ['`ExecuteUpdateAsync` / `ExecuteDeleteAsync`', 'JPQL bulk update', 'Melewati change tracker'],
        ]),
        callout('warn', 'Jangan migrasi otomatis saat startup produksi', 'Memanggil `db.Database.Migrate()` di Program.cs nyaman untuk lokal, tetapi berisiko di produksi: beberapa replika bisa migrasi bersamaan dan aplikasi butuh hak DDL. Hasilkan skrip `--idempotent` atau migration bundle (`dotnet ef migrations bundle`) dan jalankan sebagai langkah terpisah di pipeline.'),
        ...quiz([
          ['CS-18', 'Kapan memakai `AsNoTracking()`?', 'Untuk query yang hanya membaca dan tidak akan memanggil SaveChanges pada entitas hasilnya, misalnya endpoint GET dan laporan. Tanpa tracking, EF tidak menyimpan snapshot entitas sehingga lebih cepat dan hemat memori. Proyeksi `Select` ke DTO juga tidak di-track.'],
          ['CS-19', 'Mengapa `p.Nama.Contains(cari)` di dalam `Where` tidak memuat semua produk ke memori?', 'Karena `db.Produk` adalah `IQueryable<T>`: lambda disimpan sebagai expression tree lalu diterjemahkan provider ke SQL (`WHERE nama LIKE ...` atau `strpos` di PostgreSQL). Data baru diambil saat `ToListAsync`. Bila memanggil method C# yang tidak bisa diterjemahkan, EF melempar exception alih-alih diam-diam memfilter di memori.'],
          ['CS-20', 'Bagaimana mendeteksi N+1 di EF Core?', 'Aktifkan logging SQL (kategori `Microsoft.EntityFrameworkCore.Database.Command` level Information) atau lihat span database di tracing. Bila jumlah query naik seiring jumlah baris, itu N+1. Perbaiki dengan proyeksi agregat dalam satu query, `Include`, atau mengambil data relasi sekaligus dengan `Where(x => ids.Contains(x.Id))`.'],
        ]),
        ...practice('cs-ef-core', [
          'Jalankan PostgreSQL di Docker, buat KatalogDb, tambahkan migrasi Awal, dan terapkan dengan `dotnet ef database update`.',
          'Sambungkan endpoint Minimal API ke ProdukService dan pastikan semua query baca memakai AsNoTracking atau proyeksi.',
          'Aktifkan log SQL, tulis versi N+1 dan versi satu query, lalu bandingkan jumlah query yang tercatat.',
          'Buat skrip migrasi idempotent dan jelaskan cara menjalankannya di pipeline CI/CD.',
        ]),
        references(
          ['EF Core overview', 'https://learn.microsoft.com/en-us/ef/core/'],
          ['Migrations overview', 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/'],
          ['Tracking vs. no-tracking queries', 'https://learn.microsoft.com/en-us/ef/core/querying/tracking'],
          ['Eager loading of related data', 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager'],
          ['ExecuteUpdate and ExecuteDelete', 'https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete'],
          ['Npgsql EF Core provider', 'https://www.npgsql.org/efcore/'],
        ),
      ],
    },
    {
      id: 'cs-auth-middleware',
      title: 'ASP.NET Core: Middleware, JWT, Authorization & Error Handling',
      summary: 'Pipeline middleware, autentikasi JWT bearer, authorization policy, ProblemDetails, logging terstruktur, dan rate limiting.',
      track: ASPNET, source: csharpSource, duration: '3 jam', level: 'Hard',
      blocks: [
        paragraph('Setiap request melewati **pipeline middleware** berurutan, mirip rantai `Filter` di Spring Security/Servlet. Urutan pendaftaran menentukan urutan eksekusi: penanganan error paling luar, lalu autentikasi, otorisasi, rate limiting, dan akhirnya endpoint. Paket yang dibutuhkan untuk JWT: `Microsoft.AspNetCore.Authentication.JwtBearer`.'),
        code('Program.cs: pipeline lengkap', `using System.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();                         // format error RFC 9457
builder.Services.AddExceptionHandler<DomainExceptionHandler>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Jwt:Authority"];  // mis. Keycloak realm / Entra ID
        o.Audience = builder.Configuration["Jwt:Audience"];
        o.MapInboundClaims = false;                           // pakai nama claim asli: sub, role, scope
        o.TokenValidationParameters.NameClaimType = "sub";
        o.TokenValidationParameters.RoleClaimType = "role";
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", p => p.RequireRole("admin"))
    .AddPolicy("TulisProduk", p => p.RequireAssertion(ctx =>
        ctx.User.FindFirst("scope")?.Value.Split(' ').Contains("produk.write") == true));

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("publik", w =>
    {
        w.PermitLimit = 100;
        w.Window = TimeSpan.FromMinutes(1);
        w.QueueLimit = 0;
    });
});

var app = builder.Build();

app.UseExceptionHandler();                                    // 1. tangkap exception -> ProblemDetails
app.UseStatusCodePages();                                     //    404/401 kosong -> ProblemDetails

app.Use(async (ctx, next) =>                                  // 2. middleware kustom: durasi request
{
    var sw = Stopwatch.StartNew();
    await next(ctx);
    app.Logger.LogInformation("{Method} {Path} -> {Status} dalam {Ms} ms",
        ctx.Request.Method, ctx.Request.Path, ctx.Response.StatusCode, sw.ElapsedMilliseconds);
});

app.UseAuthentication();                                      // 3. siapa Anda (baca JWT)
app.UseAuthorization();                                       // 4. boleh atau tidak
app.UseRateLimiter();                                         // 5. batasi laju

app.MapGet("/api/produk", () => TypedResults.Ok(Array.Empty<string>()))
    .RequireRateLimiting("publik");                           // publik
app.MapPost("/api/produk", () => TypedResults.Created("/api/produk/1"))
    .RequireAuthorization("TulisProduk");
app.MapDelete("/api/produk/{id:int}", (int id) => TypedResults.NoContent())
    .RequireAuthorization("Admin");
app.MapGet("/api/saya", (HttpContext ctx) => TypedResults.Ok(new { Sub = ctx.User.Identity?.Name }))
    .RequireAuthorization();                                  // cukup terautentikasi

app.Run();`, 'csharp'),
        code('IExceptionHandler: exception domain menjadi ProblemDetails', `using Microsoft.AspNetCore.Diagnostics;

public sealed class StokTidakCukupException(string sku, int diminta, int tersedia)
    : Exception($"Stok {sku} tidak cukup: diminta {diminta}, tersedia {tersedia}")
{
    public string Sku { get; } = sku;
}

public sealed class DomainExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<DomainExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is not StokTidakCukupException stok) return false;   // biarkan handler default (500)

        logger.LogWarning("Stok tidak cukup untuk {Sku}", stok.Sku);  // log terstruktur, bukan interpolasi
        ctx.Response.StatusCode = StatusCodes.Status409Conflict;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            Exception = ex,
            ProblemDetails =
            {
                Title = "Stok tidak cukup",
                Detail = ex.Message,
                Status = StatusCodes.Status409Conflict,
            },
        });
    }
}`, 'csharp'),
        code('appsettings.json: konfigurasi JWT', `{
  "Jwt": {
    "Authority": "https://sso.contoh.co.id/realms/toko",
    "Audience": "katalog-api"
  }
}`, 'json'),
        table(['ASP.NET Core', 'Spring Boot / Spring Security'], [
          ['Middleware `app.Use(...)`', '`Filter` / `OncePerRequestFilter`'],
          ['`AddJwtBearer` + `Authority`', '`spring.security.oauth2.resourceserver.jwt.issuer-uri`'],
          ['`AddAuthorizationBuilder().AddPolicy(...)`', '`authorizeHttpRequests` + `@PreAuthorize`'],
          ['`.RequireAuthorization("Admin")`', '`.requestMatchers(...).hasRole("ADMIN")`'],
          ['`IExceptionHandler` + `AddProblemDetails`', '`@ControllerAdvice` + `ProblemDetail`'],
          ['`ILogger<T>` (structured logging)', 'SLF4J + Logback'],
          ['`AddRateLimiter` (bawaan)', 'Bucket4j / Resilience4j RateLimiter'],
        ]),
        callout('warn', 'Log terstruktur, bukan interpolasi', 'Tulis `logger.LogInformation("Order {OrderId} dibuat", id)`, bukan `$"Order {id} dibuat"`. Template dengan placeholder menghasilkan field terpisah di Seq/Elastic/Loki sehingga bisa difilter, dan formatting dilewati bila level log tidak aktif. Jangan pernah mencatat token, password, atau NIK lengkap.'),
        ...quiz([
          ['CS-21', 'Mengapa `UseAuthentication` harus sebelum `UseAuthorization`?', 'Authorization membutuhkan `HttpContext.User` yang diisi oleh middleware autentikasi dari JWT. Bila urutannya terbalik, user selalu dianggap anonim dan semua endpoint yang dilindungi menolak dengan 401. Penanganan exception harus paling awal agar bisa menangkap error dari semua middleware sesudahnya.'],
          ['CS-22', 'Apa beda respons 401 dan 403 pada endpoint yang dilindungi?', '401 Unauthorized berarti tidak terautentikasi: token tidak ada, kedaluwarsa, atau tanda tangannya tidak valid. 403 Forbidden berarti token valid tetapi user tidak memenuhi policy (role atau scope kurang). ASP.NET Core memisahkan keduanya lewat challenge dan forbid pada skema autentikasi.'],
        ]),
        ...practice('cs-auth', [
          'Jalankan Keycloak di Docker, buat realm dan client, lalu lindungi API dengan JWT bearer dan uji 401 vs 403.',
          'Buat policy berbasis role dan scope, terapkan ke route group admin.',
          'Lempar exception domain dari service dan pastikan respons berupa ProblemDetails 409 dengan `application/problem+json`.',
          'Pasang fixed window rate limiter pada endpoint publik dan buktikan respons 429 dengan skrip loop curl.',
        ]),
        references(
          ['ASP.NET Core middleware', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/'],
          ['Configure JWT bearer authentication', 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication'],
          ['Policy-based authorization', 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies'],
          ['Handle errors in ASP.NET Core APIs', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api'],
          ['Logging in .NET and ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/'],
          ['Rate limiting middleware', 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit'],
        ),
      ],
    },
    {
      id: 'cs-testing-xunit',
      title: 'Produksi: Testing dengan xUnit, NSubstitute & WebApplicationFactory',
      summary: 'Unit test xUnit, assertion, mock dengan NSubstitute, integration test WebApplicationFactory, dan Testcontainers.',
      track: PRODUKSI, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('**xUnit** adalah framework test paling umum di .NET (dipakai repositori .NET sendiri), setara JUnit 5. Untuk mock, materi ini memakai **NSubstitute** karena sintaksnya ringkas; Moq bekerja serupa. Integration test API memakai **WebApplicationFactory**, yang menyalakan aplikasi di memori seperti `@SpringBootTest` dengan `MockMvc`/`WebTestClient`.'),
        code('Membuat proyek test', `dotnet new xunit -n Katalog.Tests
cd Katalog.Tests
dotnet add reference ../Katalog.Api
dotnet add package NSubstitute
dotnet add package Microsoft.AspNetCore.Mvc.Testing

dotnet test                                  # jalankan semua test
dotnet test --filter "FullyQualifiedName~Konverter"`, 'bash'),
        code('Unit test: Fact, Theory, dan mock NSubstitute', `using NSubstitute;
using Xunit;

public interface IKursProvider
{
    Task<decimal> KursAsync(string mataUang, CancellationToken ct);
}

public sealed class Konverter(IKursProvider kurs)
{
    public async Task<decimal> KeRupiahAsync(decimal jumlah, string mataUang, CancellationToken ct)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(jumlah);
        return jumlah * await kurs.KursAsync(mataUang, ct);
    }
}

public sealed class KonverterTests
{
    private readonly IKursProvider _kurs = Substitute.For<IKursProvider>();

    [Fact]
    public async Task Konversi_memakai_kurs_dari_provider()
    {
        _kurs.KursAsync("USD", Arg.Any<CancellationToken>()).Returns(16_000m);
        var konverter = new Konverter(_kurs);

        var hasil = await konverter.KeRupiahAsync(10m, "USD", CancellationToken.None);

        Assert.Equal(160_000m, hasil);
        await _kurs.Received(1).KursAsync("USD", Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public async Task Jumlah_tidak_positif_ditolak(int jumlah)
    {
        var konverter = new Konverter(_kurs);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            () => konverter.KeRupiahAsync(jumlah, "USD", CancellationToken.None));
        await _kurs.DidNotReceive().KursAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}`, 'csharp'),
        code('Integration test dengan WebApplicationFactory', `using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;
using Xunit;

// .NET 10: class Program otomatis public, tidak perlu "public partial class Program"
public sealed class ProdukApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Post_lalu_get_mengembalikan_produk()
    {
        var client = factory.CreateClient();

        var post = await client.PostAsJsonAsync("/api/produk",
            new { Nama = "Kopi Gayo", Harga = 45_000m, Stok = 10 });
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var dibuat = await post.Content.ReadFromJsonAsync<ProdukDto>();
        var get = await client.GetFromJsonAsync<ProdukDto>($"/api/produk/{dibuat!.Id}");
        Assert.Equal("Kopi Gayo", get!.Nama);
    }

    [Fact]
    public async Task Body_tidak_valid_mengembalikan_400()
    {
        var resp = await factory.CreateClient().PostAsJsonAsync("/api/produk",
            new { Nama = "K", Harga = 0m, Stok = 1 });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Service_bisa_diganti_untuk_test()
    {
        var palsu = Substitute.For<IProdukRepository>();
        palsu.Cari(99).Returns(new ProdukDto(99, "Palsu", 1m, 1));

        var client = factory.WithWebHostBuilder(b => b.ConfigureTestServices(s =>
        {
            s.RemoveAll<IProdukRepository>();
            s.AddSingleton(palsu);
        })).CreateClient();

        var p = await client.GetFromJsonAsync<ProdukDto>("/api/produk/99");
        Assert.Equal("Palsu", p!.Nama);
    }
}`, 'csharp'),
        table(['xUnit', 'JUnit 5'], [
          ['`[Fact]`', '`@Test`'],
          ['`[Theory]` + `[InlineData]` / `[MemberData]`', '`@ParameterizedTest` + `@ValueSource` / `@MethodSource`'],
          ['Constructor / `IDisposable`', '`@BeforeEach` / `@AfterEach` (instance baru per test di keduanya)'],
          ['`IClassFixture<T>`', '`@BeforeAll` / extension dengan state bersama'],
          ['`Assert.Equal(expected, actual)`', '`assertEquals(expected, actual)`'],
          ['`Assert.ThrowsAsync<T>`', '`assertThrows`'],
          ['NSubstitute `Substitute.For<T>()`', 'Mockito `mock(T.class)`'],
          ['`WebApplicationFactory<Program>`', '`@SpringBootTest` + `MockMvc`'],
        ]),
        callout('tip', 'Database asli dengan Testcontainers', 'Repository EF Core sebaiknya diuji terhadap PostgreSQL asli, bukan provider InMemory yang perilakunya berbeda (tanpa constraint, tanpa SQL). Paket `Testcontainers.PostgreSql` menyalakan container per test class; arahkan connection string WebApplicationFactory ke container itu. Pola yang sama di Java ada di [Testcontainers & Resilience4j](#java.spring-testcontainers-resilience).'),
        ...quiz([
          ['CS-23', 'Mengapa xUnit tidak punya `[SetUp]` seperti NUnit?', 'xUnit membuat instance class test baru untuk setiap test, sehingga constructor berfungsi sebagai setup dan `Dispose` sebagai teardown. Ini mendorong isolasi: tidak ada state yang tersisa antar test. State bersama yang mahal (mis. WebApplicationFactory, container) dibagi lewat `IClassFixture` atau collection fixture.'],
          ['CS-24', 'Apa keuntungan `ConfigureTestServices` dibanding membuat Program terpisah untuk test?', 'Aplikasi yang diuji adalah aplikasi asli: routing, middleware, validasi, serialisasi, dan DI sama persis dengan produksi. Hanya dependensi eksternal tertentu yang diganti (mis. gateway pembayaran), sehingga test menangkap bug konfigurasi yang tidak terlihat di unit test.'],
        ]),
        ...practice('cs-testing', [
          'Tulis unit test untuk aturan diskon dengan Theory minimal 5 kasus, termasuk batas nilai.',
          'Mock dependency eksternal dengan NSubstitute dan verifikasi pemanggilan dengan `Received` dan `DidNotReceive`.',
          'Tulis integration test WebApplicationFactory untuk alur create, get, update, delete, dan validasi 400.',
          'Ganti repository memori dengan EF Core + PostgreSQL di Testcontainers, lalu jalankan semua test di CI.',
        ]),
        references(
          ['Unit testing C# with xUnit', 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-csharp-with-xunit'],
          ['Integration tests in ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests'],
          ['Unit testing best practices', 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices'],
          ['NSubstitute documentation', 'https://nsubstitute.github.io/help/getting-started/'],
          ['Testcontainers for .NET', 'https://dotnet.testcontainers.org/'],
        ),
      ],
    },
    {
      id: 'cs-deploy-docker',
      title: 'Produksi: Publish, Docker, Health Check & OpenTelemetry',
      summary: 'dotnet publish, Dockerfile multi-stage, health check liveness/readiness, OpenTelemetry, dan checklist deploy.',
      track: PRODUKSI, source: csharpSource, duration: '2 jam', level: 'Med',
      blocks: [
        paragraph('`dotnet publish` menghasilkan folder siap jalan berisi DLL aplikasi dan dependensinya, setara fat JAR. Image resmi Microsoft dipisah menjadi `sdk` (untuk build) dan `aspnet` (runtime saja), sehingga Dockerfile multi-stage menghasilkan image kecil. Sejak .NET 8, image resmi mendengarkan port **8080** dan menyediakan user non-root `app`.'),
        code('Publish', `dotnet publish -c Release -o ./publish
dotnet ./publish/Katalog.Api.dll

# Alternatif tanpa Dockerfile: SDK membangun image container langsung
dotnet publish -c Release --os linux --arch x64 /t:PublishContainer`, 'bash'),
        code('Dockerfile multi-stage', `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Salin file proyek dulu agar layer restore di-cache
COPY Katalog.Api/Katalog.Api.csproj Katalog.Api/
RUN dotnet restore Katalog.Api/Katalog.Api.csproj
COPY . .
RUN dotnet publish Katalog.Api/Katalog.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "Katalog.Api.dll"]`, 'docker'),
        code('Health check dan OpenTelemetry', `// Paket: Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore,
// OpenTelemetry.Extensions.Hosting, OpenTelemetry.Instrumentation.AspNetCore,
// OpenTelemetry.Instrumentation.Http, OpenTelemetry.Exporter.OpenTelemetryProtocol
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);
// ... AddDbContext<KatalogDb> seperti di modul EF Core

builder.Services.AddHealthChecks()
    .AddDbContextCheck<KatalogDb>(tags: ["ready"]);          // cek koneksi database

builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("katalog-api"))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation())
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation())
    .UseOtlpExporter();                                        // endpoint dari OTEL_EXPORTER_OTLP_ENDPOINT

var app = builder.Build();

// Liveness: proses hidup, tanpa cek dependensi
app.MapHealthChecks("/healthz/live", new HealthCheckOptions { Predicate = _ => false });
// Readiness: siap menerima trafik (database bisa diakses)
app.MapHealthChecks("/healthz/ready", new HealthCheckOptions { Predicate = c => c.Tags.Contains("ready") });

app.Run();`, 'csharp'),
        table(['Checklist deploy', 'Detail'], [
          ['Konfigurasi', 'Secret dari environment variable / secret manager; `ASPNETCORE_ENVIRONMENT=Production`'],
          ['Migrasi', 'Skrip idempotent atau migration bundle sebagai langkah pipeline terpisah'],
          ['Health check', '`/healthz/live` untuk liveness, `/healthz/ready` untuk readiness probe Kubernetes'],
          ['Observability', 'Traces dan metrics via OTLP; log terstruktur JSON ke stdout'],
          ['Keamanan', 'User non-root (`$APP_UID`), HTTPS di load balancer, header forwarded (`UseForwardedHeaders`) bila di belakang proxy'],
          ['Shutdown', 'Hormati SIGTERM; teruskan `CancellationToken` agar request berjalan selesai dengan rapi'],
          ['Versi', '.NET 10 LTS didukung sampai November 2028; perbarui patch bulanan (image `10.0` selalu patch terbaru)'],
        ]),
        callout('info', 'Kubernetes dan Spring Actuator', 'Health check ASP.NET Core setara `/actuator/health/liveness` dan `/actuator/health/readiness`. Jangan masukkan dependensi eksternal ke liveness: bila database mati, pod tidak perlu di-restart, cukup dikeluarkan dari load balancer lewat readiness. Tambahkan `.dockerignore` berisi `bin/` dan `obj/` agar hasil build lokal tidak ikut tersalin.'),
        ...quiz([
          ['CS-25', 'Mengapa memakai dua stage (`sdk` lalu `aspnet`) di Dockerfile?', 'Image SDK berisi compiler, NuGet, dan tool build sehingga besar dan memperluas permukaan serangan. Stage runtime hanya berisi ASP.NET Core runtime dan hasil publish, sehingga image jauh lebih kecil, cepat ditarik, dan lebih aman.'],
          ['CS-26', 'Apa akibatnya bila readiness dan liveness sama-sama mengecek database?', 'Saat database lambat atau mati sebentar, liveness gagal dan Kubernetes me-restart semua pod sekaligus. Restart tidak memperbaiki database, justru menambah beban saat pulih (thundering herd). Liveness cukup memastikan proses hidup; readiness yang mengecek dependensi.'],
        ]),
        ...practice('cs-deploy', [
          'Tulis Dockerfile multi-stage untuk Katalog.Api, bangun image, dan bandingkan ukurannya dengan image SDK.',
          'Jalankan API + PostgreSQL dengan docker compose, lalu uji `/healthz/live` dan `/healthz/ready` saat database dimatikan.',
          'Kirim traces ke Jaeger atau .NET Aspire dashboard lewat OTLP dan temukan span query EF Core.',
          'Susun checklist deploy tim Anda berdasarkan tabel di atas dan otomatisasi minimal tiga poin di pipeline CI/CD.',
        ]),
        references(
          ['dotnet publish', 'https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-publish'],
          ['Containerize a .NET app', 'https://learn.microsoft.com/en-us/dotnet/core/docker/build-container'],
          ['Health checks in ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks'],
          ['.NET observability with OpenTelemetry', 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel'],
          ['.NET support policy', 'https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core'],
        ),
      ],
    },
  ],
};
