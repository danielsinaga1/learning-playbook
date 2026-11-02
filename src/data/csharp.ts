import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'C# Dasar';
const MODERN = 'C# Modern';
const ASPNET = 'ASP.NET Core';
const ARSITEKTUR = 'Arsitektur & Performa';
const PRODUKSI = 'Produksi';

const tracks: Track[] = [
  { title: DASAR, summary: 'Instal .NET SDK, struktur proyek, tipe & alur kontrol, OOP dengan class dan record, koleksi dan LINQ.' },
  { title: MODERN, summary: 'Nullable reference types, pattern matching, async/await, generic, delegate, exception, dan dependency injection.' },
  { title: ASPNET, summary: 'Minimal API, EF Core dengan PostgreSQL, middleware, JWT, authorization policy, background service dan Channels, SignalR, caching, rate limiting, serta Dapper.' },
  { title: ARSITEKTUR, summary: 'Clean Architecture dan Vertical Slice, CQRS tanpa library, result pattern, Span dan alokasi memori, BenchmarkDotNet, serta gRPC dan interop dengan Go.' },
  { title: PRODUKSI, summary: 'Testing dengan xUnit, NSubstitute, WebApplicationFactory; publish, Docker, health check, OpenTelemetry, dan proyek akhir Financial Tracker API.' },
];

export const csharpSource = 'C# & .NET: materi tulisan tangan dari dokumentasi resmi Microsoft Learn (30 Oktober 2026)';

export const csharpCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'csharp',
  title: 'C# & .NET: Bahasa, ASP.NET Core & EF Core',
  short: 'C# & .NET',
  monogram: 'C#',
  hue: 'purple',
  description: 'C# modern di .NET 10 (LTS): dasar bahasa, LINQ, async/await, Minimal API, EF Core dan Dapper dengan PostgreSQL, keamanan JWT, background service, SignalR, caching, arsitektur, performa, gRPC, testing, deploy dengan Docker, dan proyek akhir Financial Tracker API. Disertai perbandingan dengan Java dan Spring Boot.',
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
      id: 'cs-background-service',
      title: 'ASP.NET Core: Background Processing dengan BackgroundService & Channels',
      summary: 'IHostedService dan BackgroundService, antrean in-process dengan System.Threading.Channels, job terjadwal dengan PeriodicTimer, scope DI, dan graceful shutdown.',
      track: ASPNET, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('Tidak semua pekerjaan harus selesai di dalam request: mengirim email notifikasi, membuat laporan PDF, sinkronisasi kurs, atau membersihkan data kedaluwarsa. **Generic Host** .NET menjalankan `IHostedService` berdampingan dengan web server, sehingga pekerjaan latar hidup di proses yang sama tanpa framework tambahan. `BackgroundService` adalah class dasar yang paling sering dipakai: cukup override `ExecuteAsync`. Padanannya di Spring adalah `@Scheduled` dan `@Async`, tetapi di .NET Anda memegang langsung loop dan pembatalannya.'),
        paragraph('Pola yang paling berguna adalah **antrean in-process**: endpoint menaruh pekerjaan ke `Channel<T>` lalu langsung membalas `202 Accepted`, dan satu `BackgroundService` mengonsumsinya. `System.Threading.Channels` adalah antrean producer/consumer yang thread-safe, setara `BlockingQueue` Java, tetapi menunggu dengan `await` alih-alih memblokir thread.'),
        code('Antrean email: bounded Channel + worker', `using System.Threading.Channels;

public record EmailKeluar(string Ke, string Subjek, string Isi);

public sealed class AntreanEmail
{
    // Bounded: bila penuh, producer menunggu (backpressure) alih-alih memori terus membengkak
    private readonly Channel<EmailKeluar> _channel = Channel.CreateBounded<EmailKeluar>(
        new BoundedChannelOptions(capacity: 500)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,                     // hanya satu worker: optimasi internal
        });

    public ChannelReader<EmailKeluar> Reader => _channel.Reader;

    public ValueTask MasukkanAsync(EmailKeluar email, CancellationToken ct) =>
        _channel.Writer.WriteAsync(email, ct);
}

public interface IPengirimEmail
{
    Task KirimAsync(EmailKeluar email, CancellationToken ct);
}

public sealed class PengirimEmailWorker(
    AntreanEmail antrean,
    IServiceScopeFactory scopeFactory,
    ILogger<PengirimEmailWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var email in antrean.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                // Hosted service adalah singleton: service scoped dibuat per item lewat scope baru
                await using var scope = scopeFactory.CreateAsyncScope();
                var pengirim = scope.ServiceProvider.GetRequiredService<IPengirimEmail>();
                await pengirim.KirimAsync(email, stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Satu email gagal tidak boleh mematikan worker (dan host)
                logger.LogError(ex, "Gagal mengirim email ke {Ke}", email.Ke);
            }
        }
    }
}`, 'csharp'),
        code('Program.cs: registrasi dan endpoint 202 Accepted', `builder.Services.AddSingleton<AntreanEmail>();
builder.Services.AddScoped<IPengirimEmail, PengirimEmailSmtp>();
builder.Services.AddHostedService<PengirimEmailWorker>();
builder.Services.AddHostedService<SinkronKursJob>();

app.MapPost("/api/laporan/{bulan}/kirim", async (string bulan, string email, AntreanEmail antrean, CancellationToken ct) =>
{
    await antrean.MasukkanAsync(new EmailKeluar(email, $"Laporan {bulan}", "..."), ct);
    return TypedResults.Accepted($"/api/laporan/{bulan}");   // diproses di latar, bukan di request
});`, 'csharp'),
        code('Job terjadwal dengan PeriodicTimer dan pengaturan shutdown', `public sealed class SinkronKursJob(IServiceScopeFactory scopeFactory, ILogger<SinkronKursJob> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));
        do
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var sinkron = scope.ServiceProvider.GetRequiredService<SinkronKurs>();
                await sinkron.JalankanAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Sinkron kurs gagal; dicoba lagi pada tick berikutnya");
            }
        }
        // Tidak menumpuk: tick yang terlewat saat job lama berjalan tidak dijalankan beruntun
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}

// Program.cs: batas waktu graceful shutdown untuk SEMUA hosted service
builder.Services.Configure<HostOptions>(o =>
{
    o.ShutdownTimeout = TimeSpan.FromSeconds(25);        // default 30 detik; jaga < terminationGracePeriodSeconds K8s
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.StopHost;   // default sejak .NET 6
});`, 'csharp'),
        table(['Kebutuhan', 'Pilihan di .NET', 'Catatan'], [
          ['Interval sederhana (tiap 15 menit)', '`BackgroundService` + `PeriodicTimer`', 'Berjalan di setiap replika; pakai lock terdistribusi bila hanya boleh satu'],
          ['Ekspresi cron, cluster, persistensi', 'Quartz.NET (job store di database)', 'Mirip Quartz di Java; mendukung clustering'],
          ['Job tahan crash dengan dashboard dan retry', 'Hangfire', 'Inti open source, sebagian fitur lanjutan berbayar; job disimpan di database'],
          ['Antrean in-process', '`Channel<T>` + `BackgroundService`', 'Isi antrean **hilang** bila proses mati; cocok untuk pekerjaan yang boleh diulang'],
          ['Antrean tahan lama antar service', 'RabbitMQ, Kafka, Azure Service Bus + outbox', 'Untuk pekerjaan yang tidak boleh hilang'],
          ['Job harian terpisah dari API', 'Kubernetes CronJob menjalankan aplikasi konsol', 'Tidak membebani pod API dan mudah diamati'],
        ]),
        callout('warn', 'Exception dan shutdown', 'Sejak .NET 6, exception tak tertangani di `ExecuteAsync` **menghentikan seluruh host** (API ikut mati), sehingga setiap iterasi perlu try/catch sendiri. Saat SIGTERM, host membatalkan `stoppingToken` lalu menunggu paling lama `ShutdownTimeout`; teruskan token itu ke semua I/O agar worker berhenti rapi. Di .NET 10, seluruh `ExecuteAsync` dijalankan sebagai Task di latar, sehingga kode sinkron sebelum `await` pertama tidak lagi menahan startup aplikasi.'),
        ...quiz([
          ['CS-27', 'Mengapa `DbContext` tidak boleh disuntikkan langsung ke constructor `BackgroundService`?', 'Hosted service didaftarkan sebagai singleton dan hidup sepanjang umur aplikasi. DbContext yang di-scope per request akan menjadi captive dependency: satu instance dipakai terus, change tracker membengkak, dan tidak thread-safe. Suntikkan `IServiceScopeFactory`, lalu buat scope baru per unit kerja (per pesan atau per tick) dan ambil DbContext dari scope itu.'],
          ['CS-28', 'Apa beda `Channel.CreateBounded` dan `Channel.CreateUnbounded`, dan kapan memilih `FullMode.Wait`?', 'Unbounded tidak punya batas, sehingga producer yang lebih cepat dari consumer membuat memori terus naik sampai proses mati. Bounded membatasi kapasitas dan menentukan perilaku saat penuh: `Wait` membuat producer menunggu (backpressure), sedangkan `DropOldest`/`DropNewest`/`DropWrite` membuang item. Pilih `Wait` bila setiap item penting; pilih drop untuk data yang cepat basi seperti metrik atau posisi terkini.'],
          ['CS-29', 'Tiga replika API masing-masing menjalankan `SinkronKursJob`. Apa risikonya dan bagaimana mengatasinya?', 'Job berjalan tiga kali setiap interval, sehingga API eksternal dipanggil tiga kali dan data bisa ditulis bersamaan. Solusinya: jadikan job idempoten, pakai lock terdistribusi (mis. advisory lock PostgreSQL `pg_try_advisory_lock`), pindahkan ke Quartz.NET dengan clustering, atau jalankan sebagai Kubernetes CronJob terpisah.'],
        ]),
        ...practice('cs-background', [
          'Buat endpoint yang memasukkan email ke `AntreanEmail` dan membalas 202; worker mencatat log tiap email dengan jeda 1 detik.',
          'Uji backpressure: kapasitas 5, kirim 20 request bersamaan, dan amati endpoint menunggu ketika antrean penuh.',
          'Tulis `SinkronKursJob` dengan PeriodicTimer, lempar exception di satu tick, dan pastikan job tetap berjalan di tick berikutnya.',
          'Jalankan aplikasi, kirim SIGTERM (Ctrl+C), dan pastikan log menunjukkan worker berhenti sebelum `ShutdownTimeout` habis.',
        ]),
        references(
          ['Background tasks with hosted services', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services'],
          ['Worker services in .NET', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/workers'],
          ['System.Threading.Channels', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/channels'],
          ['.NET Generic Host', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host'],
          ['PeriodicTimer', 'https://learn.microsoft.com/en-us/dotnet/api/system.threading.periodictimer'],
        ),
      ],
    },
    {
      id: 'cs-signalr-realtime',
      title: 'ASP.NET Core: Realtime dengan SignalR',
      summary: 'Hub dan strongly-typed client, group, kirim dari luar hub dengan IHubContext, autentikasi JWT, klien JavaScript, dan scale-out dengan Redis backplane.',
      track: ASPNET, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('**SignalR** adalah pustaka realtime bawaan ASP.NET Core: server bisa mendorong pesan ke browser atau aplikasi mobile tanpa polling. SignalR memilih transport terbaik secara otomatis (WebSocket, lalu Server-Sent Events, lalu long polling), menangani reconnect, dan menyediakan model RPC dua arah: klien memanggil method di **hub**, server memanggil method di klien. Padanannya di Spring adalah WebSocket + STOMP dengan `SimpMessagingTemplate`.'),
        code('Hub dengan strongly-typed client dan group', `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

// Method yang dipanggil server di klien: salah ketik nama method menjadi error kompilasi
public interface INotifikasiKlien
{
    Task TransaksiBaru(TransaksiNotifikasi data);
    Task SaldoBerubah(long saldo);
}

public record TransaksiNotifikasi(long Id, string Jenis, string Deskripsi, long Jumlah);

[Authorize]
public sealed class NotifikasiHub(IDompetAkses akses, ILogger<NotifikasiHub> logger) : Hub<INotifikasiKlien>
{
    public override async Task OnConnectedAsync()
    {
        logger.LogInformation("User {User} tersambung, koneksi {Conn}", Context.UserIdentifier, Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    // Dipanggil klien: connection.invoke("GabungDompet", "keluarga")
    public async Task GabungDompet(string dompetId)
    {
        // Periksa hak akses SEBELUM memasukkan ke group, jangan percaya input klien
        if (!await akses.BolehAsync(Context.UserIdentifier!, dompetId))
            throw new HubException("Tidak punya akses ke dompet ini");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"dompet:{dompetId}");
    }

    public Task KeluarDompet(string dompetId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dompet:{dompetId}");
}

public interface IDompetAkses
{
    Task<bool> BolehAsync(string userId, string dompetId);
}`, 'csharp'),
        code('Program.cs: JWT lewat query string, user id dari claim sub, dan IHubContext', `using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, SubUserIdProvider>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Jwt:Authority"];
        o.Audience = builder.Configuration["Jwt:Audience"];
        o.MapInboundClaims = false;
        o.Events = new JwtBearerEvents
        {
            // API WebSocket dan EventSource di browser tidak bisa mengirim header Authorization,
            // jadi klien SignalR mengirim token lewat query string ?access_token=...
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    ctx.Token = token;
                }
                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<NotifikasiHub>("/hubs/notifikasi");

// Mengirim dari luar hub (endpoint, BackgroundService) lewat IHubContext
app.MapPost("/api/transaksi", async (BuatTransaksiRequest req, ClaimsPrincipal user,
    IHubContext<NotifikasiHub, INotifikasiKlien> hub) =>
{
    var t = new TransaksiNotifikasi(1, req.Jenis, req.Deskripsi, req.Jumlah);    // simpan ke DB di sini
    await hub.Clients.User(user.FindFirst("sub")!.Value).TransaksiBaru(t);       // semua tab/perangkat user ini
    await hub.Clients.Group($"dompet:{req.DompetId}").TransaksiBaru(t);           // anggota dompet bersama
    return TypedResults.Created($"/api/transaksi/{t.Id}", t);
}).RequireAuthorization();

app.Run();

// Default IUserIdProvider membaca ClaimTypes.NameIdentifier; dengan MapInboundClaims = false namanya "sub"
public sealed class SubUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection) => connection.User?.FindFirst("sub")?.Value;
}

public record BuatTransaksiRequest(string DompetId, string Jenis, string Deskripsi, long Jumlah);`, 'csharp'),
        code('Klien JavaScript (npm install @microsoft/signalr)', `import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/notifikasi", { accessTokenFactory: () => ambilTokenAkses() })
  .withAutomaticReconnect()               // coba ulang setelah 0, 2, 10, 30 detik lalu berhenti
  .configureLogging(signalR.LogLevel.Warning)
  .build();

// Nama properti JSON otomatis camelCase
connection.on("TransaksiBaru", (data) => {
  tampilkanToast(data.deskripsi + ": Rp" + data.jumlah.toLocaleString("id-ID"));
});

connection.onreconnected(async () => {
  // Reconnect = ConnectionId baru, keanggotaan group TIDAK dipulihkan: gabung ulang
  await connection.invoke("GabungDompet", "keluarga");
});

async function mulai() {
  try {
    await connection.start();
    await connection.invoke("GabungDompet", "keluarga");
  } catch (err) {
    console.error(err);
    setTimeout(mulai, 5000);              // start awal yang gagal tidak di-retry otomatis
  }
}

mulai();`, 'js'),
        code('Scale-out: Redis backplane', `// dotnet add package Microsoft.AspNetCore.SignalR.StackExchangeRedis
using StackExchange.Redis;

builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!, o =>
    {
        // Prefix memisahkan kanal bila satu Redis dipakai beberapa aplikasi/environment
        o.Configuration.ChannelPrefix = RedisChannel.Literal("keuangan-prod");
    });`, 'csharp'),
        table(['Aspek', 'SignalR', 'Alternatif'], [
          ['Transport', 'WebSocket, fallback SSE dan long polling otomatis', 'WebSocket mentah (`app.UseWebSockets()`): kontrol penuh, semua ditulis sendiri'],
          ['Arah', 'Dua arah, model RPC (`invoke` / `on`)', 'Server-Sent Events: satu arah server ke klien, cukup untuk notifikasi'],
          ['Pengelompokan', '`Groups`, `Clients.User`, `Clients.All`', 'Spring: STOMP destination + `convertAndSendToUser`'],
          ['Scale-out', 'Redis backplane atau Azure SignalR Service', 'Spring: external broker relay (RabbitMQ)'],
          ['Klien', 'JavaScript/TypeScript, .NET, Java, Swift (komunitas)', 'Klien WebSocket mana pun untuk WebSocket mentah'],
        ]),
        callout('warn', 'Scale-out butuh lebih dari backplane', 'Backplane meneruskan pesan antar instance lewat pub/sub, tetapi tidak menyimpannya: klien yang sedang terputus kehilangan pesan, jadi data penting tetap diambil ulang lewat REST setelah reconnect. Load balancer juga harus memakai **sticky session**, karena negosiasi dan transport fallback harus kembali ke instance yang sama; satu-satunya pengecualian adalah bila semua klien memakai WebSocket dengan `skipNegotiation: true`. Token di query string bisa tercatat di access log, jadi pakai token berumur pendek dan saring log proxy.'),
        ...quiz([
          ['CS-30', 'Dua instance API di belakang load balancer tanpa backplane. User A di instance 1 mengirim ke group "dompet:keluarga", user B tersambung ke instance 2. Apa yang terjadi?', 'B tidak menerima pesan. Daftar koneksi dan group SignalR disimpan di memori masing-masing instance, sehingga instance 1 hanya mengirim ke koneksi miliknya. Redis backplane menyiarkan setiap pesan ke semua instance lewat pub/sub, lalu tiap instance meneruskan ke koneksi lokalnya. Alternatif terkelola: Azure SignalR Service.'],
          ['CS-31', 'Mengapa tidak boleh menyimpan state di field class Hub?', 'Instance hub bersifat transient: dibuat untuk setiap pemanggilan method lalu dibuang. Nilai field hilang di panggilan berikutnya, dan Anda juga tidak boleh menyimpan `this` untuk dipakai belakangan. Simpan state di service singleton (thread-safe), database, atau Redis, dan kirim dari luar hub lewat `IHubContext<THub>`.'],
          ['CS-32', 'Mengapa `Clients.User(id)` tidak mengirim apa pun padahal user tersambung dengan JWT valid?', 'User id diambil dari `IUserIdProvider`, yang secara default membaca claim `ClaimTypes.NameIdentifier`. Dengan `MapInboundClaims = false`, claim `sub` tidak dipetakan ke NameIdentifier sehingga `Context.UserIdentifier` bernilai null. Daftarkan `IUserIdProvider` kustom yang membaca `sub`.'],
        ]),
        ...practice('cs-signalr', [
          'Buat `NotifikasiHub` dengan strongly-typed client dan halaman HTML sederhana yang menampilkan transaksi baru tanpa reload.',
          'Lindungi hub dengan JWT lewat query string, lalu buktikan koneksi tanpa token ditolak dengan 401.',
          'Implementasikan group per dompet dengan pemeriksaan akses, dan uji dua browser dengan user berbeda.',
          'Jalankan dua instance API dan Redis dengan docker compose; tanpa backplane pesan antar instance hilang, dengan backplane pesan sampai.',
        ]),
        references(
          ['Overview of ASP.NET Core SignalR', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction'],
          ['Use hubs in SignalR', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs'],
          ['Authentication and authorization in SignalR', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz'],
          ['SignalR JavaScript client', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client'],
          ['Send messages from outside a hub', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/hubcontext'],
          ['Redis backplane for SignalR scale-out', 'https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane'],
        ),
      ],
    },
    {
      id: 'cs-caching-rate-limit',
      title: 'ASP.NET Core: Caching & Rate Limiting',
      summary: 'IMemoryCache, HybridCache dengan Redis sebagai L2, output caching dengan tag, invalidasi, dan rate limiter bawaan per user (token bucket, concurrency).',
      track: ASPNET, source: csharpSource, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('Cache mengurangi beban database dan latency, tetapi menambah masalah baru: data basi, invalidasi, dan **cache stampede** (ratusan request bersamaan melihat cache kosong lalu semuanya memukul database). ASP.NET Core punya beberapa lapis: `IMemoryCache` (memori satu proses), `IDistributedCache` (Redis, dibagi semua instance), **HybridCache** yang menggabungkan keduanya dengan perlindungan stampede, dan **output caching** yang menyimpan seluruh respons HTTP. Konsep umumnya (cache-aside, TTL, eviction) dibahas di [Caching](#distributed.caching).'),
        code('Registrasi: memory cache, Redis, dan HybridCache', `// dotnet add package Microsoft.Extensions.Caching.Hybrid
// dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
using Microsoft.Extensions.Caching.Hybrid;

builder.Services.AddMemoryCache();

// Bila IDistributedCache terdaftar, HybridCache otomatis memakainya sebagai L2
builder.Services.AddStackExchangeRedisCache(o =>
{
    o.Configuration = builder.Configuration.GetConnectionString("Redis");
    o.InstanceName = "katalog:";                      // prefix key
});

builder.Services.AddHybridCache(o =>
{
    o.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10),            // umur di L2 (Redis)
        LocalCacheExpiration = TimeSpan.FromMinutes(1),   // umur di L1 (memori tiap instance)
    };
});`, 'csharp'),
        code('Memakai IMemoryCache dan HybridCache', `using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Caching.Memory;

public sealed class KursCache(IMemoryCache memori, IKursProvider provider)
{
    // Cukup untuk data kecil per instance; TIDAK mencegah stampede
    public Task<decimal> KursAsync(string mataUang, CancellationToken ct) =>
        memori.GetOrCreateAsync($"kurs:{mataUang}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return provider.KursAsync(mataUang, ct);
        });
}

public sealed class ProdukQuery(HybridCache cache, KatalogDb db)
{
    // Request bersamaan untuk key yang sama menunggu SATU eksekusi factory (anti-stampede)
    public ValueTask<ProdukDto?> CariAsync(int id, CancellationToken ct) =>
        cache.GetOrCreateAsync<ProdukDto?>(
            $"produk:{id}",
            async token => await db.Produk.AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new ProdukDto(p.Id, p.Nama, p.Harga, p.Kategori.Nama))
                .FirstOrDefaultAsync(token),
            tags: ["produk"],
            cancellationToken: ct);

    public async Task UbahHargaAsync(int id, decimal harga, CancellationToken ct)
    {
        await db.Produk.Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.Harga, harga), ct);
        await cache.RemoveAsync($"produk:{id}", ct);      // invalidasi setelah tulis berhasil
    }
}`, 'csharp'),
        code('Output caching dan rate limiter per user', `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;

builder.Services.AddOutputCache(o =>
{
    o.AddPolicy("Katalog", b => b
        .Expire(TimeSpan.FromMinutes(5))
        .SetVaryByQuery("halaman", "kategori")       // entri terpisah per kombinasi query
        .Tag("katalog"));
});
// Opsional, dibagi semua instance: paket Microsoft.AspNetCore.OutputCaching.StackExchangeRedis
// builder.Services.AddStackExchangeRedisOutputCache(o => o.Configuration = "...");

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Partisi per user (atau per IP untuk anonim); token bucket memberi ruang burst singkat
    o.AddPolicy("per-user", ctx =>
    {
        var kunci = ctx.User.FindFirst("sub")?.Value
            ?? ctx.Connection.RemoteIpAddress?.ToString()
            ?? "anonim";
        return RateLimitPartition.GetTokenBucketLimiter(kunci, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 20,                              // burst maksimum
            TokensPerPeriod = 10,                         // isi ulang 10 token per detik
            ReplenishmentPeriod = TimeSpan.FromSeconds(1),
            QueueLimit = 0,
            AutoReplenishment = true,
        });
    });

    // Endpoint mahal: batasi jumlah yang berjalan BERSAMAAN, bukan per waktu
    o.AddConcurrencyLimiter("ekspor", c => { c.PermitLimit = 4; c.QueueLimit = 10; });

    o.OnRejected = (ctx, ct) =>
    {
        if (ctx.Lease.TryGetMetadata(MetadataName.RetryAfter, out var tunggu))
        {
            ctx.HttpContext.Response.Headers.RetryAfter = ((int)tunggu.TotalSeconds).ToString();
        }
        return ValueTask.CompletedTask;
    };
});

var app = builder.Build();
app.UseRateLimiter();
app.UseOutputCache();

var api = app.MapGroup("/api").RequireRateLimiting("per-user");

api.MapGet("/katalog", (int? halaman, string? kategori, KatalogDb db) =>
    TypedResults.Ok(/* query katalog */ Array.Empty<ProdukDto>()))
    .CacheOutput("Katalog");

api.MapPost("/katalog", async (IOutputCacheStore store, CancellationToken ct) =>
{
    // ... simpan perubahan ...
    await store.EvictByTagAsync("katalog", ct);           // buang semua respons bertag katalog
    return TypedResults.NoContent();
});

app.MapGet("/laporan/ekspor", () => TypedResults.Ok()).RequireRateLimiting("ekspor");`, 'csharp'),
        table(['Lapisan', 'Disimpan di', 'Cocok untuk', 'Catatan'], [
          ['`IMemoryCache`', 'Memori satu proses', 'Data kecil, jarang berubah, per instance', 'Tiap replika punya salinan sendiri; tanpa anti-stampede'],
          ['`IDistributedCache` (Redis)', 'Redis, dibagi semua instance', 'Sesi, data bersama antar replika', 'API berbasis `byte[]`, serialisasi manual'],
          ['`HybridCache`', 'L1 memori + L2 `IDistributedCache`', 'Default baru untuk cache data aplikasi', 'Anti-stampede, serialisasi otomatis, invalidasi per key dan tag'],
          ['Output caching', 'Memori atau Redis', 'Respons GET publik yang sama untuk semua user', 'Default hanya GET/HEAD 200, tidak meng-cache request terautentikasi'],
          ['HTTP caching (`Cache-Control`)', 'Browser / CDN', 'Aset statis dan respons publik', 'Paling murah: request tidak sampai ke server'],
        ]),
        callout('warn', 'Rate limiter bawaan bersifat lokal', 'Counter `AddRateLimiter` disimpan di memori tiap instance. Dengan tiga replika, batas 100/menit per user efektif menjadi sampai 300/menit. Untuk batas global, pasang di API gateway/NGINX atau gunakan store bersama seperti Redis; desainnya dibahas di [Rate Limiter](#interview.sd-rate-limiter). Di belakang reverse proxy, `RemoteIpAddress` berisi IP proxy, jadi aktifkan `UseForwardedHeaders` dengan daftar proxy tepercaya sebelum mempartisi per IP.'),
        ...quiz([
          ['CS-33', 'Apa itu cache stampede dan bagaimana HybridCache mencegahnya?', 'Saat entri populer kedaluwarsa, banyak request bersamaan melihat cache kosong dan semuanya menjalankan query mahal ke database. HybridCache mengelompokkan pemanggil `GetOrCreateAsync` dengan key yang sama dalam satu instance: hanya satu yang menjalankan factory, sisanya menunggu hasil yang sama. `IMemoryCache.GetOrCreateAsync` tidak memberi jaminan ini.'],
          ['CS-34', 'Kapan memilih output caching dibanding HybridCache?', 'Output caching menyimpan respons HTTP utuh dan melewati eksekusi endpoint sama sekali, cocok untuk GET publik yang identik bagi semua pengguna (katalog, halaman berita). HybridCache menyimpan data di level service, cocok bila respons dipersonalisasi, data dipakai di beberapa endpoint, atau perlu logika tambahan setelah membaca cache.'],
          ['CS-35', 'Mengapa partisi rate limit per user lebih baik daripada satu limiter global untuk seluruh API?', 'Limiter global membuat satu klien yang boros menghabiskan kuota semua orang. Partisi per user atau per API key mengisolasi dampaknya: klien nakal mendapat 429, klien lain tetap dilayani. Untuk endpoint mahal, tambahkan concurrency limiter agar jumlah pekerjaan berat yang berjalan bersamaan tetap terkendali.'],
        ]),
        ...practice('cs-caching', [
          'Bungkus query detail produk dengan HybridCache, aktifkan log SQL, dan buktikan 50 request paralel hanya memicu satu query.',
          'Tambahkan Redis sebagai L2, jalankan dua instance, lalu pastikan invalidasi `RemoveAsync` setelah update terlihat di kedua instance.',
          'Pasang output cache bertag pada endpoint katalog dan buang entrinya dengan `EvictByTagAsync` saat produk diubah.',
          'Terapkan token bucket per user dan concurrency limiter untuk ekspor; uji 429 beserta header `Retry-After` dengan skrip loop.',
        ]),
        references(
          ['Caching overview', 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/overview'],
          ['HybridCache library', 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid'],
          ['Output caching middleware', 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output'],
          ['Distributed caching', 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed'],
          ['Cache in-memory', 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory'],
          ['Rate limiting middleware', 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit'],
        ),
      ],
    },
    {
      id: 'cs-dapper-sql',
      title: 'ASP.NET Core: Dapper & SQL Mentah',
      summary: 'Kapan Dapper dibanding EF Core, NpgsqlDataSource, query dan multi-mapping, transaksi, SQL khas PostgreSQL, dan menggabungkan Dapper dengan EF Core dalam satu transaksi.',
      track: ASPNET, source: csharpSource, duration: '2 jam', level: 'Med',
      blocks: [
        paragraph('**Dapper** adalah micro-ORM yang dibuat tim Stack Overflow: Anda menulis SQL sendiri, Dapper hanya memetakan parameter dan hasil ke objek. Tidak ada change tracking, migrasi, atau terjemahan LINQ, sehingga overhead-nya sangat kecil dan SQL yang dijalankan persis yang Anda tulis. Padanannya di Java adalah `JdbcTemplate` atau jOOQ dalam mode SQL mentah.'),
        paragraph('Pola yang umum di proyek .NET: **EF Core untuk sisi tulis** (entitas, validasi, migrasi) dan **Dapper untuk laporan dan query baca yang rumit** (CTE, window function, `jsonb`, `LATERAL`). Keduanya bisa berbagi koneksi dan transaksi yang sama. Dasar EF Core ada di [EF Core & PostgreSQL](#csharp.cs-ef-core).'),
        code('Setup dan query dasar', `// dotnet add package Dapper
// dotnet add package Npgsql.DependencyInjection
using Dapper;
using Npgsql;

// Program.cs: satu NpgsqlDataSource (berisi pool koneksi) untuk seluruh aplikasi
builder.Services.AddNpgsqlDataSource(builder.Configuration.GetConnectionString("Keuangan")!);
builder.Services.AddScoped<LaporanRepository>();
DefaultTypeMap.MatchNamesWithUnderscores = true;     // kolom user_id -> property UserId

public sealed class TransaksiBaris
{
    public long Id { get; set; }
    public string Jenis { get; set; } = "";
    public string Deskripsi { get; set; } = "";
    public long Jumlah { get; set; }
    public DateTime Tanggal { get; set; }
}

public sealed class RingkasanBulan
{
    public DateTime Bulan { get; set; }
    public long Pemasukan { get; set; }
    public long Pengeluaran { get; set; }
    public long SaldoBerjalan { get; set; }
}

public sealed partial class LaporanRepository(NpgsqlDataSource dataSource)
{
    public async Task<IReadOnlyList<TransaksiBaris>> TerbaruAsync(long userId, int batas, CancellationToken ct)
    {
        const string sql = """
            SELECT id, jenis, deskripsi, jumlah, tanggal
            FROM transaksi
            WHERE user_id = @UserId
            ORDER BY tanggal DESC
            LIMIT @Batas
            """;
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        // CommandDefinition dipakai agar CancellationToken ikut diteruskan
        var hasil = await conn.QueryAsync<TransaksiBaris>(
            new CommandDefinition(sql, new { UserId = userId, Batas = batas }, cancellationToken: ct));
        return hasil.AsList();
    }

    // SQL khas PostgreSQL: FILTER + window function; SUM(bigint) menghasilkan numeric, jadi di-cast
    public async Task<IReadOnlyList<RingkasanBulan>> RingkasanBulananAsync(long userId, CancellationToken ct)
    {
        const string sql = """
            SELECT date_trunc('month', tanggal) AS bulan,
                   COALESCE(SUM(jumlah) FILTER (WHERE jenis = 'pemasukan'), 0)::bigint   AS pemasukan,
                   COALESCE(SUM(jumlah) FILTER (WHERE jenis = 'pengeluaran'), 0)::bigint AS pengeluaran,
                   SUM(SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE -jumlah END))
                       OVER (ORDER BY date_trunc('month', tanggal))::bigint             AS saldo_berjalan
            FROM transaksi
            WHERE user_id = @UserId
            GROUP BY 1
            ORDER BY 1
            """;
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        return (await conn.QueryAsync<RingkasanBulan>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct))).AsList();
    }
}`, 'csharp'),
        code('Multi-mapping dan transaksi', `public sealed class Kategori
{
    public long Id { get; set; }
    public string Nama { get; set; } = "";
}

public sealed class TransaksiDenganKategori
{
    public long Id { get; set; }
    public string Deskripsi { get; set; } = "";
    public long Jumlah { get; set; }
    public Kategori Kategori { get; set; } = null!;
}

public sealed partial class LaporanRepository
{
    public async Task<IReadOnlyList<TransaksiDenganKategori>> DenganKategoriAsync(long userId, CancellationToken ct)
    {
        const string sql = """
            SELECT t.id, t.deskripsi, t.jumlah,
                   k.id, k.nama
            FROM transaksi t
            JOIN kategori k ON k.id = t.kategori_id
            WHERE t.user_id = @UserId
            """;
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        var hasil = await conn.QueryAsync<TransaksiDenganKategori, Kategori, TransaksiDenganKategori>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct),
            (t, k) => { t.Kategori = k; return t; },
            splitOn: "id");                       // kolom "id" KEDUA menandai awal objek Kategori
        return hasil.AsList();
    }

    public async Task TransferAsync(long dariDompet, long keDompet, long jumlah, CancellationToken ct)
    {
        await using var conn = await dataSource.OpenConnectionAsync(ct);
        await using var tx = await conn.BeginTransactionAsync(ct);

        // Kondisi saldo >= jumlah di WHERE: cek dan ubah dalam satu pernyataan atomik
        var berkurang = await conn.ExecuteAsync(new CommandDefinition(
            "UPDATE dompet SET saldo = saldo - @Jumlah WHERE id = @Id AND saldo >= @Jumlah",
            new { Id = dariDompet, Jumlah = jumlah }, tx, cancellationToken: ct));
        if (berkurang == 0) throw new InvalidOperationException("Saldo tidak cukup atau dompet tidak ada");

        await conn.ExecuteAsync(new CommandDefinition(
            "UPDATE dompet SET saldo = saldo + @Jumlah WHERE id = @Id",
            new { Id = keDompet, Jumlah = jumlah }, tx, cancellationToken: ct));

        await tx.CommitAsync(ct);                 // tanpa Commit, Dispose melakukan rollback
    }
}`, 'csharp'),
        code('Dapper di dalam transaksi EF Core', `using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;     // GetDbTransaction()

public sealed class TutupBukuService(KeuanganDb db)
{
    public async Task TutupBulanAsync(DateTime awalBulan, DateTime awalBulanBerikutnya, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var conn = db.Database.GetDbConnection();         // koneksi yang sama dengan EF, sudah terbuka

        // Bagian berat: satu INSERT ... SELECT dengan SQL mentah
        await conn.ExecuteAsync(new CommandDefinition("""
            INSERT INTO saldo_bulanan (user_id, bulan, saldo)
            SELECT user_id, @Bulan, SUM(CASE WHEN jenis = 'pemasukan' THEN jumlah ELSE -jumlah END)
            FROM transaksi
            WHERE tanggal < @Batas
            GROUP BY user_id
            """, new { Bulan = awalBulan, Batas = awalBulanBerikutnya }, tx.GetDbTransaction(), cancellationToken: ct));

        // Bagian biasa: entitas EF dalam transaksi yang sama
        db.LogAudit.Add(new LogAudit { Aksi = $"tutup-buku {awalBulan:yyyy-MM}" });
        await db.SaveChangesAsync(ct);

        await tx.CommitAsync(ct);                         // keduanya commit atau keduanya batal
    }
}

// Tanpa Dapper: EF Core 8+ bisa memetakan SQL ke tipe non-entitas.
// FormattableString diubah menjadi parameter, BUKAN digabung sebagai teks.
// var data = await db.Database
//     .SqlQuery<RingkasanBulan>($"SELECT ... FROM transaksi WHERE user_id = {userId}")
//     .ToListAsync(ct);`, 'csharp'),
        table(['Aspek', 'EF Core', 'Dapper', 'ADO.NET (Npgsql) langsung'], [
          ['Menulis SQL', 'Tidak perlu (LINQ); bisa `FromSql`/`SqlQuery`', 'Wajib', 'Wajib'],
          ['Pemetaan hasil', 'Otomatis ke entitas atau proyeksi', 'Otomatis ke class/record', 'Manual dengan `DbDataReader`'],
          ['Change tracking dan migrasi', 'Ada', 'Tidak ada', 'Tidak ada'],
          ['Fitur khas database', 'Terbatas pada yang diterjemahkan provider', 'Penuh', 'Penuh, termasuk `COPY` untuk bulk insert'],
          ['Cocok untuk', 'CRUD, aturan domain, sisi tulis', 'Laporan, query rumit, jalur panas', 'Bulk load, streaming jutaan baris'],
        ]),
        callout('warn', 'Interpolasi string di Dapper = SQL injection', 'EF Core `SqlQuery($"... {x}")` dan `FromSql` menerima `FormattableString` dan mengubah `{x}` menjadi parameter. Dapper **tidak**: `conn.QueryAsync($"... WHERE nama = \'{nama}\'")` menempelkan teks mentah ke SQL. Di Dapper, selalu pakai `@Parameter` dengan objek anonim. Untuk daftar ID di PostgreSQL, tulis `WHERE id = ANY(@Ids)` dan kirim array.'),
        ...quiz([
          ['CS-36', 'Mengapa `$"..."` aman di `db.Database.SqlQuery` tetapi berbahaya di Dapper?', 'Overload `SqlQuery`/`FromSql` di EF Core bertipe `FormattableString`, sehingga compiler memberikan format dan argumen secara terpisah, lalu EF membuat `DbParameter` untuk setiap argumen. Method Dapper menerima `string` biasa, jadi interpolasi sudah dievaluasi menjadi teks sebelum Dapper menerimanya, dan input pengguna menjadi bagian dari perintah SQL.'],
          ['CS-37', 'Apa fungsi `splitOn` pada multi-mapping Dapper?', 'Dapper membaca satu baris hasil JOIN berisi kolom dari beberapa tabel. `splitOn` menyebut nama kolom tempat objek berikutnya dimulai; default-nya `Id`. Dengan `splitOn: "id"`, kolom sebelum `id` kedua dipetakan ke objek pertama dan sisanya ke Kategori, lalu fungsi map menggabungkan keduanya.'],
          ['CS-38', 'Tim memakai EF Core untuk semuanya, tetapi satu laporan bulanan butuh 4 detik. Bagaimana memutuskan pindah ke Dapper?', 'Ukur dulu: lihat SQL yang dihasilkan EF (log atau `ToQueryString()`) dan rencana eksekusinya dengan `EXPLAIN ANALYZE`. Bila masalahnya index atau N+1, perbaiki itu di EF. Bila SQL optimal membutuhkan fitur yang tidak bisa diekspresikan LINQ (window function, CTE rekursif, `LATERAL`), tulis query itu dengan Dapper atau `SqlQuery`, dan biarkan sisa aplikasi tetap memakai EF Core.'],
        ]),
        ...practice('cs-dapper', [
          'Buat `LaporanRepository` dengan Dapper dan NpgsqlDataSource untuk transaksi terbaru dan ringkasan bulanan dengan window function.',
          'Tulis query multi-mapping transaksi dan kategori, lalu bandingkan jumlah query dengan versi EF Core `Include`.',
          'Implementasikan transfer antar dompet dengan transaksi Dapper; uji bahwa saldo tidak berubah bila langkah kedua gagal.',
          'Gabungkan INSERT ... SELECT via Dapper dan `SaveChangesAsync` EF Core dalam satu transaksi, lalu buktikan rollback bekerja untuk keduanya.',
        ]),
        references(
          ['Dapper (GitHub)', 'https://github.com/DapperLib/Dapper'],
          ['SQL queries in EF Core', 'https://learn.microsoft.com/en-us/ef/core/querying/sql-queries'],
          ['Using transactions in EF Core', 'https://learn.microsoft.com/en-us/ef/core/saving/transactions'],
          ['Npgsql basic usage', 'https://www.npgsql.org/doc/basic-usage.html'],
        ),
      ],
    },
    {
      id: 'cs-clean-architecture',
      title: 'Arsitektur: Clean Architecture & Vertical Slice',
      summary: 'Struktur solusi berlapis, aturan arah dependensi, vertical slice per fitur, CQRS sederhana tanpa library, validasi di domain, dan result pattern yang dipetakan ke HTTP.',
      track: ARSITEKTUR, source: csharpSource, duration: '3 jam', level: 'Hard',
      blocks: [
        paragraph('Ada dua cara populer menyusun aplikasi .NET menengah ke besar. **Clean Architecture** membagi kode menjadi lapisan teknis (Domain, Application, Infrastructure, Api) dengan satu aturan: dependensi hanya boleh mengarah ke dalam, sehingga Domain tidak mengenal EF Core, HTTP, atau JSON. **Vertical Slice** membagi kode per fitur: satu folder atau file berisi request, validasi, handler, dan endpoint untuk satu kasus penggunaan, sehingga menambah fitur jarang menyentuh banyak proyek.'),
        paragraph('Keduanya bisa digabung: aturan bisnis tetap tinggal di proyek Domain, sedangkan sisi aplikasi disusun per slice. **CQRS** di sini berarti pemisahan sederhana: *command* mengubah state lewat entitas domain, *query* langsung memproyeksikan data ke DTO (EF Core `AsNoTracking` atau Dapper) tanpa melewati repository. Tidak perlu library khusus; class handler biasa yang didaftarkan ke DI sudah cukup. Versi Go dari pola berlapis ada di [Clean Architecture di Go](#go.clean-architecture-di-go).'),
        code('Struktur solusi', `Keuangan.sln
src/
  Keuangan.Domain/           entitas, value object, aturan bisnis, Result & Kesalahan
                             TANPA referensi paket EF Core / ASP.NET Core
  Keuangan.Infrastructure/   KeuanganDb (EF Core), konfigurasi entitas, migrasi, email, Dapper
  Keuangan.Api/              Program.cs (composition root)
    Fitur/
      BuatTransaksi.cs       command: request + handler + endpoint dalam satu file
      UbahTransaksi.cs
      AmbilRingkasan.cs      query: proyeksi langsung ke DTO
    Bersama/KesalahanHttp.cs pemetaan Kesalahan -> respons HTTP
tests/
  Keuangan.Domain.Tests/     unit test aturan bisnis, tanpa database
  Keuangan.Api.Tests/        WebApplicationFactory + Testcontainers

Arah referensi:  Api -> Infrastructure -> Domain,  Api -> Domain
# dotnet add src/Keuangan.Api reference src/Keuangan.Infrastructure src/Keuangan.Domain`, 'text'),
        code('Domain: Result, Kesalahan, dan entitas dengan validasi', `namespace Keuangan.Domain;

public enum JenisKesalahan { Validasi, TidakDitemukan, Konflik }

public sealed record Kesalahan(JenisKesalahan Jenis, string Pesan)
{
    public static Kesalahan Validasi(string pesan) => new(JenisKesalahan.Validasi, pesan);
    public static Kesalahan TidakDitemukan(string pesan) => new(JenisKesalahan.TidakDitemukan, pesan);
}

// Kegagalan yang DIHARAPKAN (input salah, data tidak ada) dikembalikan sebagai nilai, bukan exception
public sealed class Result<T>
{
    private Result(T? nilai, Kesalahan? kesalahan) => (Nilai, Kesalahan) = (nilai, kesalahan);

    public T? Nilai { get; }
    public Kesalahan? Kesalahan { get; }
    public bool Sukses => Kesalahan is null;

    public static implicit operator Result<T>(T nilai) => new(nilai, null);
    public static implicit operator Result<T>(Kesalahan kesalahan) => new(default, kesalahan);

    public TOut Cocokkan<TOut>(Func<T, TOut> sukses, Func<Kesalahan, TOut> gagal) =>
        Kesalahan is null ? sukses(Nilai!) : gagal(Kesalahan);
}

public sealed class Transaksi
{
    private Transaksi() { }                              // dipakai EF Core saat materialisasi

    public long Id { get; private set; }
    public string Jenis { get; private set; } = "";
    public string Deskripsi { get; private set; } = "";
    public long Jumlah { get; private set; }
    public DateTime Tanggal { get; private set; }

    // Satu-satunya jalan membuat Transaksi: objek tidak pernah ada dalam keadaan tidak valid
    public static Result<Transaksi> Buat(string? jenis, string? deskripsi, long jumlah, DateTime sekarangUtc)
    {
        if (string.IsNullOrWhiteSpace(deskripsi)) return Kesalahan.Validasi("deskripsi wajib diisi");
        if (jumlah <= 0) return Kesalahan.Validasi("jumlah harus lebih dari 0");
        if (jenis is not ("pemasukan" or "pengeluaran")) return Kesalahan.Validasi("jenis tidak dikenal");

        return new Transaksi { Jenis = jenis, Deskripsi = deskripsi.Trim(), Jumlah = jumlah, Tanggal = sekarangUtc };
    }
}`, 'csharp'),
        code('Vertical slice: command, query, dan pemetaan ke HTTP', `using Keuangan.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keuangan.Api.Fitur;

public static class BuatTransaksi
{
    public sealed record Perintah(string? Jenis, string? Deskripsi, long Jumlah);
    public sealed record Hasil(long Id, string Jenis, string Deskripsi, long Jumlah, DateTime Tanggal);

    public sealed class Handler(KeuanganDb db, TimeProvider waktu)
    {
        public async Task<Result<Hasil>> JalankanAsync(Perintah p, CancellationToken ct)
        {
            var dibuat = Transaksi.Buat(p.Jenis, p.Deskripsi, p.Jumlah, waktu.GetUtcNow().UtcDateTime);
            if (dibuat.Kesalahan is { } salah) return salah;

            var t = dibuat.Nilai!;
            db.Transaksi.Add(t);
            await db.SaveChangesAsync(ct);
            return new Hasil(t.Id, t.Jenis, t.Deskripsi, t.Jumlah, t.Tanggal);
        }
    }

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapPost("/api/transaksi", async (Perintah p, Handler handler, CancellationToken ct) =>
            (await handler.JalankanAsync(p, ct)).Cocokkan<IResult>(
                hasil => TypedResults.Created($"/api/transaksi/{hasil.Id}", hasil),
                kesalahan => kesalahan.KeHttp()));
}

public static class AmbilRingkasan
{
    public sealed record Hasil(long Pemasukan, long Pengeluaran, long Saldo);

    // Query: tanpa entitas dan repository, langsung agregasi di database
    public sealed class Handler(KeuanganDb db)
    {
        public async Task<Hasil> JalankanAsync(CancellationToken ct)
        {
            var per = await db.Transaksi.AsNoTracking()
                .GroupBy(t => t.Jenis)
                .Select(g => new { Jenis = g.Key, Total = g.Sum(t => t.Jumlah) })
                .ToDictionaryAsync(x => x.Jenis, x => x.Total, ct);
            var masuk = per.GetValueOrDefault("pemasukan");
            var keluar = per.GetValueOrDefault("pengeluaran");
            return new Hasil(masuk, keluar, masuk - keluar);
        }
    }

    public static void Map(IEndpointRouteBuilder app) =>
        app.MapGet("/api/ringkasan", async (Handler handler, CancellationToken ct) =>
            TypedResults.Ok(await handler.JalankanAsync(ct)));
}

// Bersama/KesalahanHttp.cs: SATU tempat yang menerjemahkan kesalahan domain ke status HTTP
public static class KesalahanHttp
{
    public static IResult KeHttp(this Kesalahan k) => k.Jenis switch
    {
        JenisKesalahan.Validasi => TypedResults.Problem(k.Pesan, statusCode: StatusCodes.Status400BadRequest),
        JenisKesalahan.TidakDitemukan => TypedResults.Problem(k.Pesan, statusCode: StatusCodes.Status404NotFound),
        JenisKesalahan.Konflik => TypedResults.Problem(k.Pesan, statusCode: StatusCodes.Status409Conflict),
        _ => TypedResults.Problem(statusCode: StatusCodes.Status500InternalServerError),
    };
}

// Program.cs:
// builder.Services.AddSingleton(TimeProvider.System);
// builder.Services.AddScoped<BuatTransaksi.Handler>();
// builder.Services.AddScoped<AmbilRingkasan.Handler>();
// BuatTransaksi.Map(app);
// AmbilRingkasan.Map(app);`, 'csharp'),
        table(['Aspek', 'Clean Architecture (lapisan)', 'Vertical Slice (fitur)'], [
          ['Unit organisasi', 'Proyek per lapisan teknis', 'Folder/file per kasus penggunaan'],
          ['Menambah satu fitur', 'Menyentuh 3–4 proyek (DTO, service, repository, controller)', 'Biasanya satu file baru + satu baris registrasi'],
          ['Kekuatan', 'Aturan dependensi dicek compiler; domain mudah diuji', 'Perubahan lokal, sedikit abstraksi, mudah dihapus'],
          ['Risiko', 'Banyak boilerplate dan interface yang hanya punya satu implementasi', 'Logika bisnis terduplikasi bila tidak ditarik ke domain'],
          ['Cocok untuk', 'Domain kompleks yang hidup bertahun-tahun', 'API CRUD-berat, tim yang ingin cepat menambah fitur'],
          ['Pipeline lintas fitur', 'Decorator pada interface service', 'Endpoint filter pada route group (`AddEndpointFilter`)'],
        ]),
        callout('tip', 'Mulai sederhana', 'Untuk proyek baru, mulai dengan satu proyek Api berisi folder `Fitur/` dan satu proyek Domain. Pisahkan Infrastructure hanya bila memang ada lebih dari satu host (API dan worker) yang memakainya. Hindari repository generik di atas EF Core: `DbContext` sudah merupakan unit of work dan `DbSet` sudah merupakan repository.'),
        callout('warn', 'Library mediator dan mapper', 'Banyak template Clean Architecture memakai MediatR dan AutoMapper. Sejak 2025 kedua library ini beralih ke model lisensi komersial untuk versi barunya (ada edisi gratis dengan syarat tertentu), jadi periksa lisensinya sebelum dipakai di proyek perusahaan. Handler biasa seperti contoh di atas plus pemetaan manual (method `Dari` atau constructor DTO) memberi hasil yang sama, lebih mudah ditelusuri dengan *Go to Definition*, dan tanpa dependensi tambahan.'),
        ...quiz([
          ['CS-39', 'Mengapa proyek Domain sebaiknya tidak mereferensikan paket EF Core?', 'Aturan bisnis menjadi bergantung pada detail persistensi: atribut mapping, `DbContext`, dan perilaku lazy loading ikut masuk ke domain. Domain yang bersih bisa diuji dengan unit test murni tanpa database dan tetap stabil saat infrastruktur berganti. Mapping EF Core diletakkan di Infrastructure lewat `IEntityTypeConfiguration<T>`, termasuk constructor private dan property dengan `private set`.'],
          ['CS-40', 'Kapan memakai result pattern dan kapan exception?', 'Result untuk kegagalan yang diharapkan dan merupakan bagian alur bisnis: input tidak valid, data tidak ditemukan, saldo tidak cukup. Pemanggil dipaksa menangani kedua kemungkinan dan tidak ada biaya stack trace. Exception untuk kondisi yang benar-benar tidak terduga atau di luar kendali: database mati, bug, konfigurasi hilang; biarkan naik ke `IExceptionHandler` yang membalas 500.'],
          ['CS-41', 'Dua slice punya kode yang mirip. Apakah harus langsung diekstrak ke service bersama?', 'Tidak harus. Kemiripan kebetulan antar slice lebih murah dibiarkan daripada membuat abstraksi yang salah dan mengikat dua fitur yang berevolusi berbeda. Ekstrak bila yang sama adalah **aturan bisnis** (pindahkan ke entitas atau domain service) atau bila pola yang sama muncul tiga kali atau lebih. Kode infrastruktur seperti pemetaan error cukup diletakkan di folder bersama.'],
        ]),
        ...practice('cs-arsitektur', [
          'Susun solusi Keuangan dengan proyek Domain, Infrastructure, Api, dan dua proyek test; pastikan Domain tidak punya PackageReference ke EF Core.',
          'Pindahkan aturan validasi transaksi ke `Transaksi.Buat` yang mengembalikan `Result<Transaksi>`, lalu tulis unit test domainnya.',
          'Implementasikan slice BuatTransaksi, UbahTransaksi, HapusTransaksi, dan AmbilRingkasan tanpa MediatR.',
          'Tambahkan endpoint filter pada route group yang mencatat nama endpoint dan durasinya untuk semua slice.',
        ]),
        references(
          ['Common web application architectures', 'https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures'],
          ['Simplified CQRS and DDD patterns', 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/apply-simplified-microservice-cqrs-ddd-patterns'],
          ['Filters in Minimal API apps', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters'],
          ['What is TimeProvider?', 'https://learn.microsoft.com/en-us/dotnet/standard/datetime/timeprovider-overview'],
        ),
      ],
    },
    {
      id: 'cs-performa',
      title: 'Performa .NET: Span, Alokasi, BenchmarkDotNet & Jebakan Async',
      summary: 'Span<T> dan Memory<T>, stackalloc, ArrayPool, mengurangi alokasi, mengukur dengan BenchmarkDotNet dan dotnet-counters, serta sync-over-async, async void, ValueTask, dan ConfigureAwait.',
      track: ARSITEKTUR, source: csharpSource, duration: '3 jam', level: 'Hard',
      blocks: [
        paragraph('Di .NET, banyak masalah performa backend bermula dari **alokasi**: setiap `string`, array, atau closure baru menambah kerja garbage collector, dan GC yang sering memicu jeda serta latency p99 yang tinggi. `Span<T>` adalah "jendela" ke memori yang sudah ada (array, string, stack) sehingga data bisa dipotong dan diproses tanpa menyalin. Aturan pertama tetap sama seperti di Java: **ukur dulu**, optimalkan jalur panas yang terbukti lambat, dan biarkan sisa kode tetap sederhana.'),
        code('Span<T>: parsing tanpa alokasi', `using System.Globalization;

public readonly record struct Mutasi(DateOnly Tanggal, bool Kredit, long Jumlah);

public static class ParserMutasi
{
    // Naif: Split membuat satu array + tiga string baru untuk setiap baris
    public static Mutasi ParseNaif(string baris)
    {
        var bagian = baris.Split(';');
        return new Mutasi(
            DateOnly.ParseExact(bagian[0], "yyyy-MM-dd", CultureInfo.InvariantCulture),
            bagian[1] == "CR",
            long.Parse(bagian[2], CultureInfo.InvariantCulture));
    }

    // Span: hanya memotong jendela ke string asli; nol alokasi heap
    public static Mutasi ParseSpan(ReadOnlySpan<char> baris)
    {
        var i = baris.IndexOf(';');
        var tanggal = DateOnly.ParseExact(baris[..i], "yyyy-MM-dd", CultureInfo.InvariantCulture);
        baris = baris[(i + 1)..];

        i = baris.IndexOf(';');
        var kredit = baris[..i] is "CR";                 // pattern matching span dengan konstanta string
        var jumlah = long.Parse(baris[(i + 1)..], CultureInfo.InvariantCulture);
        return new Mutasi(tanggal, kredit, jumlah);
    }

    // stackalloc: buffer kecil berumur pendek di stack, bukan heap
    public static string FormatRekening(long nomor)
    {
        Span<char> buf = stackalloc char[20];
        nomor.TryFormat(buf, out var n, "D10", CultureInfo.InvariantCulture);
        return string.Concat(buf[..3], "-", buf[3..n]);   // 0012345678 -> 001-2345678
    }
}`, 'csharp'),
        code('ArrayPool dan Memory<T> di kode async', `using System.Buffers;
using System.Security.Cryptography;

public static class Checksum
{
    public static async Task<string> Sha256FileAsync(string path, CancellationToken ct)
    {
        const int Ukuran = 81_920;
        byte[] buffer = ArrayPool<byte>.Shared.Rent(Ukuran);   // bisa LEBIH BESAR dari yang diminta
        try
        {
            using var sha = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            await using var file = File.OpenRead(path);
            int dibaca;
            // Memory<T> boleh melewati await; Span<T> tidak (ref struct, hanya hidup di stack)
            while ((dibaca = await file.ReadAsync(buffer.AsMemory(0, Ukuran), ct)) > 0)
            {
                sha.AppendData(buffer.AsSpan(0, dibaca));
            }
            return Convert.ToHexString(sha.GetHashAndReset());
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);              // wajib dikembalikan; jangan dipakai lagi setelahnya
        }
    }
}`, 'csharp'),
        code('BenchmarkDotNet: mengukur waktu dan alokasi', `// dotnet new console -n Bench && cd Bench && dotnet add package BenchmarkDotNet
// Jalankan dengan: dotnet run -c Release   (build Debug memberi angka yang menyesatkan)
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

BenchmarkRunner.Run<ParserBenchmark>();

[MemoryDiagnoser]                         // tambah kolom Gen0 dan Allocated per operasi
public class ParserBenchmark
{
    private const string Baris = "2026-11-02;CR;1500000";

    [Benchmark(Baseline = true)]
    public Mutasi Naif() => ParserMutasi.ParseNaif(Baris);

    [Benchmark]
    public Mutasi DenganSpan() => ParserMutasi.ParseSpan(Baris);
}
// Yang dicari di hasil: rasio waktu terhadap baseline dan kolom Allocated.
// Versi Span seharusnya menunjukkan Allocated "-" (nol byte).`, 'csharp'),
        code('Jebakan async: sync-over-async, async void, ValueTask, ConfigureAwait', `using System.Collections.Concurrent;

public sealed class NotifikasiService(HttpClient http)
{
    // SALAH: sync-over-async memblokir thread pool selama I/O; di bawah beban = starvation
    public string StatusSinkron() => http.GetStringAsync("status").Result;

    // SALAH: List.ForEach menerima Action, jadi lambda async menjadi async void.
    // Method kembali sebelum request selesai dan exception tidak bisa ditangkap.
    public void KirimSemua(List<string> ids) =>
        ids.ForEach(async id => await http.PostAsync($"kirim/{id}", null));

    // BENAR: paralel terbatas; exception dan pembatalan terlihat oleh pemanggil
    public Task KirimSemuaAsync(IEnumerable<string> ids, CancellationToken ct) =>
        Parallel.ForEachAsync(ids, new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
            async (id, token) => (await http.PostAsync($"kirim/{id}", null, token)).EnsureSuccessStatusCode());

    // ValueTask: hemat alokasi bila hasil sering tersedia sinkron (cache hit). Hanya boleh di-await SEKALI.
    private readonly ConcurrentDictionary<string, string> _cache = new();
    public ValueTask<string> TemplateAsync(string nama, CancellationToken ct) =>
        _cache.TryGetValue(nama, out var isi)
            ? ValueTask.FromResult(isi)
            : new ValueTask<string>(AmbilTemplateAsync(nama, ct));

    private async Task<string> AmbilTemplateAsync(string nama, CancellationToken ct)
    {
        var isi = await http.GetStringAsync($"template/{nama}", ct);
        _cache[nama] = isi;
        return isi;
    }
}

// Di LIBRARY yang mungkin dipakai aplikasi WPF/WinForms: jangan kembali ke thread UI
public static class Unduhan
{
    public static async Task<byte[]> AmbilAsync(HttpClient http, Uri uri, CancellationToken ct)
    {
        using var resp = await http.GetAsync(uri, ct).ConfigureAwait(false);
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadAsByteArrayAsync(ct).ConfigureAwait(false);
    }
}`, 'csharp'),
        table(['Alat', 'Kapan dipakai', 'Jebakan'], [
          ['`Span<T>` / `ReadOnlySpan<T>`', 'Parsing dan slicing sinkron di jalur panas', 'Tidak bisa jadi field class, di-capture lambda, atau melewati `await`'],
          ['`Memory<T>`', 'Buffer yang perlu dibawa melewati `await` atau disimpan', 'Ambil `.Span` hanya di bagian sinkron'],
          ['`stackalloc`', 'Buffer kecil (ratusan byte) berumur pendek', 'Ukuran besar atau dari input pengguna bisa memicu stack overflow'],
          ['`ArrayPool<T>.Shared`', 'Buffer besar yang dipakai berulang', 'Array bisa lebih besar dari diminta; lupa `Return` = kebocoran pool; data sensitif perlu `clearArray: true`'],
          ['`ValueTask<T>`', 'Method panas yang sering selesai sinkron', 'Jangan di-await dua kali atau disimpan; default tetap `Task`'],
          ['`dotnet-counters`, `dotnet-trace`', 'Melihat GC, thread pool, dan profil CPU di proses berjalan', 'Ukur di Release dengan beban realistis, bukan di laptop debug'],
        ]),
        callout('tip', 'Diagnosis thread pool starvation', 'Gejalanya: CPU rendah tetapi latency naik terus. Jalankan `dotnet-counters monitor -n Katalog.Api` dan perhatikan counter **ThreadPool Queue Length** yang terus naik serta **ThreadPool Thread Count** yang bertambah perlahan. Penyebab hampir selalu pemblokiran: `.Result`, `.Wait()`, `GetAwaiter().GetResult()`, atau `Thread.Sleep` di jalur request. Dasar async/await ada di [Async/Await, Task & Cancellation](#csharp.cs-async-await).'),
        ...quiz([
          ['CS-42', 'Mengapa `Span<T>` tidak bisa disimpan di field class atau dipakai melewati `await`?', '`Span<T>` adalah `ref struct` yang bisa menunjuk ke memori stack (`stackalloc`). Bila disimpan di heap atau hidup melewati `await` (state machine async disimpan di heap), span bisa menunjuk ke stack frame yang sudah tidak ada. Compiler mencegahnya. Gunakan `Memory<T>` untuk dibawa melewati `await`, lalu ambil `.Span` di bagian sinkron.'],
          ['CS-43', 'Apa saja aturan aman memakai `ArrayPool<T>.Shared`?', 'Selalu `Return` di blok `finally`; jangan memakai array setelah dikembalikan karena bisa sedang dipakai kode lain; jangan bergantung pada `array.Length` karena array sewaan bisa lebih besar, simpan sendiri panjang data yang valid; dan pakai `Return(buffer, clearArray: true)` bila berisi data sensitif seperti token atau PIN.'],
          ['CS-44', 'Mengapa `ValueTask` bukan pengganti default untuk `Task`?', '`ValueTask` hanya menghemat alokasi bila method sering selesai sinkron. Ia punya batasan: hanya boleh di-await sekali, tidak boleh di-await bersamaan, dan tidak aman dipakai dengan `.Result` sebelum selesai. Bila perlu menggabungkan dengan `Task.WhenAll` atau menyimpannya, panggil `.AsTask()`. Untuk kode aplikasi biasa, `Task` lebih sederhana dan aman.'],
        ]),
        ...practice('cs-performa', [
          'Jalankan benchmark ParseNaif vs ParseSpan dengan `[MemoryDiagnoser]` dan catat perbedaan waktu serta alokasinya.',
          'Tulis parser file CSV mutasi 1 juta baris dengan `File.ReadLines` + `ParseSpan`, lalu bandingkan jumlah GC Gen0 dengan versi `Split` memakai `dotnet-counters`.',
          'Buat endpoint yang memanggil `.Result`, uji dengan alat load test (k6 atau bombardier), dan amati ThreadPool Queue Length; perbaiki dengan async penuh.',
          'Cari `List.ForEach(async ...)`, `async void`, dan `.Result` di sebuah proyek lalu perbaiki semuanya.',
        ]),
        references(
          ['Memory- and span-related types', 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/'],
          ['Memory<T> and Span<T> usage guidelines', 'https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines'],
          ['ASP.NET Core best practices', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices'],
          ['dotnet-counters', 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters'],
          ['BenchmarkDotNet', 'https://benchmarkdotnet.org/articles/overview.html'],
          ['ConfigureAwait FAQ', 'https://devblogs.microsoft.com/dotnet/configureawait-faq/'],
        ),
      ],
    },
    {
      id: 'cs-grpc',
      title: 'gRPC di .NET: Proto, Streaming & Interop dengan Go',
      summary: 'Kontrak .proto, server Grpc.AspNetCore, klien dengan client factory, deadline dan error, server/client streaming, serta memanggil dan dipanggil service Go.',
      track: ARSITEKTUR, source: csharpSource, duration: '3 jam', level: 'Hard',
      blocks: [
        paragraph('gRPC memakai **Protocol Buffers** sebagai kontrak dan HTTP/2 sebagai transport: payload biner yang kecil, kode klien dan server digenerate dari satu file `.proto`, dan dukungan streaming dua arah. Di .NET, gRPC adalah bagian resmi ASP.NET Core (`Grpc.AspNetCore`); kode C# digenerate otomatis saat build oleh paket `Grpc.Tools`, tanpa memanggil `protoc` manual. Karena kontraknya netral bahasa, service .NET dan Go bisa saling memanggil dengan file proto yang sama. Latar belakang gRPC dibahas di [Kenapa gRPC Ada](#go.kenapa-grpc-ada-masalah-yang-dipecahkannya).'),
        code('Protos/kurs.proto', `syntax = "proto3";

package valas.v1;

import "google/protobuf/timestamp.proto";

option csharp_namespace = "Toko.Valas.V1";
option go_package = "github.com/namamu/toko/gen/valas/v1;valasv1";

service LayananKurs {
  rpc AmbilKurs(AmbilKursRequest) returns (Kurs);                       // unary
  rpc PantauKurs(PantauKursRequest) returns (stream Kurs);              // server streaming
  rpc UnggahTransaksi(stream TransaksiValas) returns (RingkasanUnggah); // client streaming
}

message AmbilKursRequest { string mata_uang = 1; }
message PantauKursRequest { repeated string mata_uang = 1; }

message Kurs {
  string mata_uang = 1;
  int64 rupiah_per_unit_sen = 2;     // protobuf tidak punya decimal: simpan satuan terkecil
  google.protobuf.Timestamp diperbarui = 3;
}

message TransaksiValas { string mata_uang = 1; int64 jumlah_sen = 2; }
message RingkasanUnggah { int32 jumlah_baris = 1; int64 total_sen = 2; }`, 'proto'),
        code('Server: csproj, implementasi service, dan Program.cs', `// dotnet new grpc -n Valas.Grpc   (template sudah berisi Grpc.AspNetCore)
// csproj: <Protobuf Include="Protos\\kurs.proto" GrpcServices="Server" />
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Toko.Valas.V1;

public sealed class LayananKursService(IKursStore store) : LayananKurs.LayananKursBase
{
    public override async Task<Kurs> AmbilKurs(AmbilKursRequest request, ServerCallContext context)
    {
        var nilai = await store.CariAsync(request.MataUang, context.CancellationToken)
            ?? throw new RpcException(new Status(StatusCode.NotFound, $"Kurs {request.MataUang} tidak ada"));
        return KeProto(request.MataUang, nilai);
    }

    public override async Task PantauKurs(PantauKursRequest request,
        IServerStreamWriter<Kurs> responseStream, ServerCallContext context)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
        // CancellationToken batal saat klien memutus koneksi atau deadline lewat
        while (await timer.WaitForNextTickAsync(context.CancellationToken))
        {
            foreach (var mu in request.MataUang)
            {
                if (await store.CariAsync(mu, context.CancellationToken) is { } nilai)
                    await responseStream.WriteAsync(KeProto(mu, nilai));
            }
        }
    }

    public override async Task<RingkasanUnggah> UnggahTransaksi(
        IAsyncStreamReader<TransaksiValas> requestStream, ServerCallContext context)
    {
        var ringkasan = new RingkasanUnggah();
        await foreach (var t in requestStream.ReadAllAsync(context.CancellationToken))
        {
            ringkasan.JumlahBaris++;
            ringkasan.TotalSen += t.JumlahSen;
        }
        return ringkasan;
    }

    private static Kurs KeProto(string mataUang, KursNilai nilai) => new()
    {
        MataUang = mataUang,
        RupiahPerUnitSen = nilai.RupiahPerUnitSen,
        Diperbarui = Timestamp.FromDateTimeOffset(nilai.Diperbarui),
    };
}

public record KursNilai(long RupiahPerUnitSen, DateTimeOffset Diperbarui);

public interface IKursStore
{
    Task<KursNilai?> CariAsync(string mataUang, CancellationToken ct);
}

// Program.cs
// builder.Services.AddGrpc(o => o.EnableDetailedErrors = builder.Environment.IsDevelopment());
// builder.Services.AddGrpcReflection();          // paket Grpc.AspNetCore.Server.Reflection, untuk grpcurl
// builder.Services.AddSingleton<IKursStore, KursStoreMemori>();
// app.MapGrpcService<LayananKursService>();
// if (app.Environment.IsDevelopment()) app.MapGrpcReflectionService();`, 'csharp'),
        code('Klien .NET: client factory, deadline, error, dan membaca stream', `// Paket: Grpc.Net.ClientFactory, Google.Protobuf, Grpc.Tools
// csproj: <Protobuf Include="Protos\\kurs.proto" GrpcServices="Client" />
using Grpc.Core;
using Toko.Valas.V1;

// Program.cs: klien dikelola seperti HttpClient (pooling koneksi HTTP/2)
// builder.Services.AddGrpcClient<LayananKurs.LayananKursClient>(o =>
//     o.Address = new Uri(builder.Configuration["Layanan:KursUrl"]!));   // mis. http://valas:8080

public sealed class KonversiService(LayananKurs.LayananKursClient kurs, ILogger<KonversiService> logger)
{
    public async Task<long?> KeRupiahSenAsync(string mataUang, long jumlahUnit, CancellationToken ct)
    {
        try
        {
            // Deadline dikirim ke server (header grpc-timeout): server ikut berhenti bila lewat
            var k = await kurs.AmbilKursAsync(new AmbilKursRequest { MataUang = mataUang },
                deadline: DateTime.UtcNow.AddSeconds(2), cancellationToken: ct);
            return jumlahUnit * k.RupiahPerUnitSen;
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
        {
            return null;
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.DeadlineExceeded)
        {
            logger.LogWarning("Layanan kurs lambat untuk {MataUang}", mataUang);
            throw;
        }
    }

    public async Task PantauAsync(CancellationToken ct)
    {
        using var call = kurs.PantauKurs(new PantauKursRequest { MataUang = { "USD", "SGD" } }, cancellationToken: ct);
        await foreach (var k in call.ResponseStream.ReadAllAsync(ct))
        {
            logger.LogInformation("{MataUang} = {Rupiah:N2}", k.MataUang, k.RupiahPerUnitSen / 100m);
        }
    }
}`, 'csharp'),
        code('Interop: klien C# memanggil LayananKeuangan milik service Go', `// Salin proto/keuangan.proto dari repo Go, tambahkan satu baris (diabaikan protoc-gen-go):
//   option csharp_namespace = "Keuangan.Grpc";
// csproj: <Protobuf Include="Protos\\keuangan.proto" GrpcServices="Client" />
using Grpc.Core;
using Grpc.Net.Client;
using Keuangan.Grpc;

var token = Environment.GetEnvironmentVariable("TOKEN_JWT") ?? "";

// Server grpc-go tanpa TLS: alamat http:// = HTTP/2 cleartext (h2c)
using var channel = GrpcChannel.ForAddress("http://localhost:9090");
var klien = new LayananKeuangan.LayananKeuanganClient(channel);

// Metadata gRPC = header HTTP; dibaca AuthInterceptor Go dengan md.Get("authorization")
var headers = new Metadata { { "authorization", token } };

try
{
    var t = await klien.TambahAsync(
        new PermintaanTambah { Jenis = "pengeluaran", Deskripsi = "Makan siang", Jumlah = 35000 },
        headers, deadline: DateTime.UtcNow.AddSeconds(3));
    Console.WriteLine($"Dibuat id {t.Id} pada {t.Tanggal}");
}
catch (RpcException ex) when (ex.StatusCode == StatusCode.InvalidArgument)
{
    // Go: status.Error(codes.InvalidArgument, ...) -> pesan validasi di Status.Detail
    Console.WriteLine($"Validasi ditolak: {ex.Status.Detail}");
}
catch (RpcException ex) when (ex.StatusCode == StatusCode.Unauthenticated)
{
    Console.WriteLine("Token ditolak interceptor Go");
}`, 'csharp'),
        code('Arah sebaliknya: klien Go memanggil service .NET', `conn, err := grpc.NewClient("localhost:5001",
    grpc.WithTransportCredentials(insecure.NewCredentials())) // h2c, hanya di jaringan internal
if err != nil {
    log.Fatal(err)
}
defer conn.Close()

c := valasv1.NewLayananKursClient(conn)
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second) // = deadline di C#
defer cancel()

k, err := c.AmbilKurs(ctx, &valasv1.AmbilKursRequest{MataUang: "USD"})
if status.Code(err) == codes.NotFound { // RpcException(StatusCode.NotFound) dari .NET
    log.Println("kurs tidak ada")
    return
}
log.Printf("USD = %d sen, diperbarui %s", k.GetRupiahPerUnitSen(), k.GetDiperbarui().AsTime())`, 'go'),
        table(['Aspek', '.NET', 'Go'], [
          ['Generate kode', '`Grpc.Tools` saat `dotnet build` dari item `<Protobuf>`', '`protoc` + `protoc-gen-go` + `protoc-gen-go-grpc` (atau `buf generate`)'],
          ['Implementasi server', 'Override method di `LayananKurs.LayananKursBase`', 'Struct yang meng-embed `UnimplementedLayananKursServer`'],
          ['Batas waktu', '`deadline:` dan `context.CancellationToken`', '`context.WithTimeout` dan `ctx.Done()`'],
          ['Error', '`throw new RpcException(new Status(...))`', '`status.Error(codes.X, "...")`'],
          ['Metadata', '`Metadata` / `context.RequestHeaders`', '`metadata.MD` / `metadata.FromIncomingContext`'],
          ['HTTP/2 tanpa TLS', 'Kestrel endpoint dengan `Protocols: Http2` (template gRPC sudah mengatur)', '`insecure.NewCredentials()`'],
          ['Akses dari browser / REST', 'gRPC-Web atau JSON transcoding (`Microsoft.AspNetCore.Grpc.JsonTranscoding`)', '[gRPC-Gateway](#go.grpc-gateway-satu-definisi-dua-protokol)'],
        ]),
        callout('warn', 'Jebakan interop dan deploy', 'Proto Go di kurikulum ini memakai `double jumlah`; untuk uang, kontrak baru sebaiknya `int64` dalam satuan terkecil agar tidak ada selisih pembulatan di bahasa mana pun. Kestrel dengan `Http1AndHttp2` di port tanpa TLS **tidak** menerima HTTP/2 prior-knowledge dari klien Go, jadi endpoint gRPC cleartext harus `Http2` saja. Koneksi HTTP/2 berumur panjang, sehingga load balancer L4 menempelkan semua request ke satu pod; pakai load balancer L7 (Envoy, service mesh) atau load balancing sisi klien.'),
        ...quiz([
          ['CS-45', 'Klien Go gagal tersambung ke service .NET di `http://valas:8080` dengan error protokol, padahal service bisa dipanggil grpcurl lewat TLS. Apa penyebab yang paling mungkin?', 'Endpoint Kestrel dikonfigurasi `Http1AndHttp2` tanpa TLS. Tanpa TLS tidak ada negosiasi ALPN, sehingga Kestrel melayani HTTP/1.1 dan menolak HTTP/2 prior-knowledge dari grpc-go. Solusinya: buat endpoint khusus gRPC dengan `Protocols = Http2` (mis. lewat `Kestrel:Endpoints` di appsettings), atau aktifkan TLS.'],
          ['CS-46', 'Apa beda deadline dan CancellationToken di klien gRPC .NET?', 'CancellationToken membatalkan panggilan dari sisi klien saja. Deadline juga membatalkan di klien, tetapi dikirim ke server lewat header `grpc-timeout`, sehingga `context.CancellationToken` di server ikut batal dan server bisa meneruskan sisa waktunya ke panggilan berikutnya. Selalu pasang deadline pada panggilan antar service agar kegagalan tidak menjalar menjadi request menggantung.'],
          ['CS-47', 'Mengapa nomor field di `.proto` tidak boleh diubah atau dipakai ulang, padahal nama field boleh diganti?', 'Format biner protobuf hanya membawa nomor field dan tipe, bukan nama. Mengganti nama aman bagi klien lama, tetapi mengubah atau memakai ulang nomor membuat klien lama membaca data ke field yang salah. Field yang dihapus sebaiknya ditandai `reserved` agar nomornya tidak terpakai lagi.'],
        ]),
        ...practice('cs-grpc', [
          'Buat service LayananKurs dengan `dotnet new grpc`, implementasikan ketiga RPC, dan uji dengan grpcurl lewat reflection.',
          'Tulis klien .NET dengan `AddGrpcClient`, deadline 2 detik, dan penanganan `NotFound` serta `DeadlineExceeded`.',
          'Panggil `LayananKeuangan` milik service Go dari kurikulum Go menggunakan proto yang sama dan metadata authorization.',
          'Tulis klien Go untuk service .NET; pastikan endpoint Kestrel memakai `Http2` dan error `NotFound` terbaca sebagai `codes.NotFound`.',
        ]),
        references(
          ['gRPC on .NET overview', 'https://learn.microsoft.com/en-us/aspnet/core/grpc/'],
          ['Tutorial: gRPC client and server', 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/grpc/grpc-start'],
          ['Call gRPC services with the .NET client', 'https://learn.microsoft.com/en-us/aspnet/core/grpc/client'],
          ['Reliable gRPC services with deadlines and cancellation', 'https://learn.microsoft.com/en-us/aspnet/core/grpc/deadlines-cancellation'],
          ['gRPC JSON transcoding', 'https://learn.microsoft.com/en-us/aspnet/core/grpc/json-transcoding'],
          ['gRPC Go quick start', 'https://grpc.io/docs/languages/go/quickstart/'],
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
    {
      id: 'cs-proyek-financial-tracker',
      title: 'Proyek Akhir: Financial Tracker API dengan ASP.NET Core',
      summary: 'Membangun ulang API Pencatat Keuangan dengan kontrak yang sama seperti versi Go, FastAPI, dan Express: Minimal API, EF Core + PostgreSQL, kontrak error, integration test dengan Testcontainers, dan Docker.',
      track: PRODUKSI, source: csharpSource, duration: '6 jam', level: 'Hard',
      blocks: [
        paragraph('Proyek ini menggabungkan seluruh kurikulum C#: Minimal API, EF Core dengan PostgreSQL, penanganan error, testing, dan deploy. Kontraknya **identik** dengan [Kontrak API Financial Tracker](#python.kontrak-api-financial-tracker) dan [API Pencatat Keuangan versi Go](#go.apa-yang-akan-kita-bangun): path, status code, nama field JSON, bahkan pesan error validasinya sama. Klien mobile yang sama harus bisa berpindah backend tanpa perubahan apa pun. Itulah kriteria selesai utamanya.'),
        table(['Method & Path', 'Fungsi', 'Status sukses', 'Error'], [
          ['`GET /api/transaksi`', 'Daftar transaksi, terbaru dulu', '200', '-'],
          ['`POST /api/transaksi`', 'Tambah transaksi', '201', '400 `{ "error": "..." }`'],
          ['`PUT /api/transaksi/{id}`', 'Ubah transaksi', '200', '400, 404'],
          ['`DELETE /api/transaksi/{id}`', 'Hapus transaksi', '204', '404'],
          ['`GET /api/ringkasan`', 'Pemasukan, pengeluaran, saldo', '200', '-'],
          ['`GET /health`', 'Kesehatan server: `{ "status": "ok" }`', '200', '-'],
        ]),
        code('Bentuk JSON yang harus dipenuhi', `// Transaksi
{ "id": 1, "jenis": "pengeluaran", "deskripsi": "Makan siang", "jumlah": 35000, "tanggal": "2026-06-04T10:00:00Z" }

// GET /api/ringkasan
{ "pemasukan": 10000000, "pengeluaran": 35000, "saldo": 9965000 }

// Error validasi (400) dan tidak ditemukan (404): BUKAN ProblemDetails
{ "error": "deskripsi wajib diisi" }
{ "error": "jumlah harus lebih dari 0" }
{ "error": "jenis tidak dikenal" }
{ "error": "transaksi tidak ditemukan" }`, 'json'),
        { type: 'steps', items: [
          { title: 'Langkah 1: Solusi dan dependensi', text: 'Buat solusi dengan proyek API dan proyek test, lalu jalankan PostgreSQL lokal.', blocks: [
            code('Setup', `dotnet new sln -n Keuangan
dotnet new web -n Keuangan.Api
dotnet new xunit -n Keuangan.Tests
dotnet sln add Keuangan.Api Keuangan.Tests
dotnet add Keuangan.Tests reference Keuangan.Api

cd Keuangan.Api
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore
cd ../Keuangan.Tests
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package Testcontainers.PostgreSql
cd ..

docker run -d --name pg-keuangan -p 5432:5432 \\
  -e POSTGRES_DB=keuangan -e POSTGRES_USER=app -e POSTGRES_PASSWORD=rahasia postgres:17-alpine
dotnet user-secrets init --project Keuangan.Api
dotnet user-secrets set "ConnectionStrings:Keuangan" \\
  "Host=localhost;Database=keuangan;Username=app;Password=rahasia" --project Keuangan.Api`, 'bash'),
          ] },
          { title: 'Langkah 2: Model, validasi, dan DbContext', text: 'Satu file Model.cs berisi entitas, DTO kontrak, aturan validasi, dan DbContext. Lalu buat migrasi pertama.', blocks: [
            code('Keuangan.Api/Model.cs', `using Microsoft.EntityFrameworkCore;

namespace Keuangan.Api;

public class Transaksi
{
    public long Id { get; set; }
    public required string Jenis { get; set; }          // "pemasukan" | "pengeluaran"
    public required string Deskripsi { get; set; }
    public long Jumlah { get; set; }                    // rupiah bulat, sama seperti kontrak
    public DateTime Tanggal { get; set; }               // UTC -> JSON "2026-06-04T10:00:00Z"
}

// DTO kontrak: System.Text.Json web default menghasilkan camelCase (jenis, deskripsi, ...)
public record TransaksiInput(string? Jenis, string? Deskripsi, long Jumlah);

public record TransaksiDto(long Id, string Jenis, string Deskripsi, long Jumlah, DateTime Tanggal)
{
    public static TransaksiDto Dari(Transaksi t) => new(t.Id, t.Jenis, t.Deskripsi, t.Jumlah, t.Tanggal);
}

public record RingkasanDto(long Pemasukan, long Pengeluaran, long Saldo);
public record ErrorResponse(string Error);

public static class Validasi
{
    // Urutan dan teks pesan SAMA dengan validasi() Go dan validator Pydantic
    public static string? Periksa(TransaksiInput i) =>
        string.IsNullOrWhiteSpace(i.Deskripsi) ? "deskripsi wajib diisi"
        : i.Jumlah <= 0 ? "jumlah harus lebih dari 0"
        : i.Jenis is not ("pemasukan" or "pengeluaran") ? "jenis tidak dikenal"
        : null;
}

public class KeuanganDb(DbContextOptions<KeuanganDb> options) : DbContext(options)
{
    public DbSet<Transaksi> Transaksi => Set<Transaksi>();

    protected override void OnModelCreating(ModelBuilder model) => model.Entity<Transaksi>(e =>
    {
        // Nama kolom default = nama property, dikutip di PostgreSQL ("Jumlah")
        e.ToTable("transaksi", t => t.HasCheckConstraint("ck_transaksi_jumlah_positif", @"""Jumlah"" > 0"));
        e.Property(x => x.Jenis).HasMaxLength(20);
        e.Property(x => x.Deskripsi).HasMaxLength(200);
        e.HasIndex(x => x.Tanggal);
    });
}

// Terminal:
// dotnet ef migrations add Awal --project Keuangan.Api
// dotnet ef database update --project Keuangan.Api`, 'csharp'),
          ] },
          { title: 'Langkah 3: Endpoint dan kontrak error', text: 'Validasi dilakukan manual agar respons berbentuk { error }, bukan ProblemDetails dari AddValidation. Body JSON yang rusak juga diseragamkan lewat exception handler.', blocks: [
            code('Keuangan.Api/Program.cs', `using Keuangan.Api;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<KeuanganDb>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Keuangan")));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddHealthChecks().AddDbContextCheck<KeuanganDb>(tags: ["ready"]);
// Body JSON tidak valid -> lempar BadHttpRequestException juga di Production (default hanya di Development)
builder.Services.Configure<RouteHandlerOptions>(o => o.ThrowOnBadRequest = true);

var app = builder.Build();

// Semua kegagalan tak terduga tetap berbentuk { "error": "..." }
app.UseExceptionHandler(e => e.Run(async ctx =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    var (status, pesan) = ex is BadHttpRequestException bad
        ? (bad.StatusCode, "body JSON tidak valid")
        : (StatusCodes.Status500InternalServerError, "terjadi kesalahan pada server");
    ctx.Response.StatusCode = status;
    await ctx.Response.WriteAsJsonAsync(new ErrorResponse(pesan));
}));

var tidakDitemukan = new ErrorResponse("transaksi tidak ditemukan");
var api = app.MapGroup("/api");

api.MapGet("/transaksi", async (KeuanganDb db, CancellationToken ct) =>
    TypedResults.Ok(await db.Transaksi.AsNoTracking()
        .OrderByDescending(t => t.Tanggal)
        .Select(t => new TransaksiDto(t.Id, t.Jenis, t.Deskripsi, t.Jumlah, t.Tanggal))
        .ToListAsync(ct)));

api.MapPost("/transaksi", async Task<Results<Created<TransaksiDto>, BadRequest<ErrorResponse>>> (
    TransaksiInput input, KeuanganDb db, TimeProvider waktu, CancellationToken ct) =>
{
    if (Validasi.Periksa(input) is { } pesan) return TypedResults.BadRequest(new ErrorResponse(pesan));

    var t = new Transaksi
    {
        Jenis = input.Jenis!,
        Deskripsi = input.Deskripsi!.Trim(),
        Jumlah = input.Jumlah,
        Tanggal = waktu.GetUtcNow().UtcDateTime,
    };
    db.Transaksi.Add(t);
    await db.SaveChangesAsync(ct);
    return TypedResults.Created($"/api/transaksi/{t.Id}", TransaksiDto.Dari(t));
});

api.MapPut("/transaksi/{id:long}", async Task<Results<Ok<TransaksiDto>, BadRequest<ErrorResponse>, NotFound<ErrorResponse>>> (
    long id, TransaksiInput input, KeuanganDb db, CancellationToken ct) =>
{
    if (Validasi.Periksa(input) is { } pesan) return TypedResults.BadRequest(new ErrorResponse(pesan));

    var t = await db.Transaksi.FirstOrDefaultAsync(x => x.Id == id, ct);
    if (t is null) return TypedResults.NotFound(tidakDitemukan);

    t.Jenis = input.Jenis!;
    t.Deskripsi = input.Deskripsi!.Trim();
    t.Jumlah = input.Jumlah;
    await db.SaveChangesAsync(ct);
    return TypedResults.Ok(TransaksiDto.Dari(t));
});

api.MapDelete("/transaksi/{id:long}", async Task<Results<NoContent, NotFound<ErrorResponse>>> (
    long id, KeuanganDb db, CancellationToken ct) =>
    await db.Transaksi.Where(t => t.Id == id).ExecuteDeleteAsync(ct) > 0
        ? TypedResults.NoContent()
        : TypedResults.NotFound(tidakDitemukan));

api.MapGet("/ringkasan", async (KeuanganDb db, CancellationToken ct) =>
{
    var pemasukan = await db.Transaksi.Where(t => t.Jenis == "pemasukan").SumAsync(t => t.Jumlah, ct);
    var pengeluaran = await db.Transaksi.Where(t => t.Jenis == "pengeluaran").SumAsync(t => t.Jumlah, ct);
    return TypedResults.Ok(new RingkasanDto(pemasukan, pengeluaran, pemasukan - pengeluaran));
});

app.MapGet("/health", () => TypedResults.Ok(new { status = "ok" }));     // kontrak: tanpa cek DB
app.MapHealthChecks("/health/ready", new() { Predicate = c => c.Tags.Contains("ready") });

app.Run();`, 'csharp'),
          ] },
          { title: 'Langkah 4: Integration test terhadap PostgreSQL asli', text: 'WebApplicationFactory menyalakan aplikasi asli; Testcontainers menyediakan database bersih per test class. Test memeriksa kontrak, bukan detail implementasi.', blocks: [
            code('Keuangan.Tests/TransaksiApiTests.cs', `using System.Net;
using System.Net.Http.Json;
using Keuangan.Api;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Xunit;

public sealed class KeuanganApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _pg = new PostgreSqlBuilder().WithImage("postgres:17-alpine").Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("ConnectionStrings:Keuangan", _pg.GetConnectionString());

    public async Task InitializeAsync()
    {
        await _pg.StartAsync();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<KeuanganDb>().Database.MigrateAsync();
    }

    // xUnit v2: IAsyncLifetime.DisposeAsync mengembalikan Task (di xUnit v3 memakai ValueTask)
    Task IAsyncLifetime.DisposeAsync() => _pg.DisposeAsync().AsTask();
}

public sealed class TransaksiApiTests(KeuanganApiFactory factory) : IClassFixture<KeuanganApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Alur_lengkap_sesuai_kontrak()
    {
        var post = await _client.PostAsJsonAsync("/api/transaksi",
            new { jenis = "pemasukan", deskripsi = "Gaji", jumlah = 10_000_000 });
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);
        var gaji = await post.Content.ReadFromJsonAsync<TransaksiDto>();

        await _client.PostAsJsonAsync("/api/transaksi",
            new { jenis = "pengeluaran", deskripsi = "Makan siang", jumlah = 35_000 });

        var ringkasan = await _client.GetFromJsonAsync<RingkasanDto>("/api/ringkasan");
        Assert.Equal(10_000_000L - 35_000L, ringkasan!.Saldo);

        var hapus = await _client.DeleteAsync($"/api/transaksi/{gaji!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, hapus.StatusCode);

        var lagi = await _client.DeleteAsync($"/api/transaksi/{gaji.Id}");
        Assert.Equal(HttpStatusCode.NotFound, lagi.StatusCode);
    }

    [Theory]
    [InlineData("pengeluaran", "", 1000L, "deskripsi wajib diisi")]
    [InlineData("pengeluaran", "Kopi", 0L, "jumlah harus lebih dari 0")]
    [InlineData("hadiah", "Kopi", 1000L, "jenis tidak dikenal")]
    public async Task Validasi_mengembalikan_400_dengan_pesan_kontrak(string jenis, string deskripsi, long jumlah, string pesan)
    {
        var resp = await _client.PostAsJsonAsync("/api/transaksi", new { jenis, deskripsi, jumlah });

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
        var error = await resp.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.Equal(pesan, error!.Error);
    }
}`, 'csharp'),
          ] },
          { title: 'Langkah 5: Container dan migrasi', text: 'Pakai Dockerfile multi-stage dari modul Publish & Docker (ganti nama proyek menjadi Keuangan.Api). Migrasi dijalankan sebagai langkah terpisah dengan migration bundle, bukan saat startup.', blocks: [
            code('docker-compose.yml', `services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: keuangan
      POSTGRES_USER: app
      POSTGRES_PASSWORD: rahasia
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d keuangan"]
      interval: 5s
      retries: 10

  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      ConnectionStrings__Keuangan: "Host=db;Database=keuangan;Username=app;Password=rahasia"
    depends_on:
      db:
        condition: service_healthy

# Migrasi (sekali per rilis):
#   dotnet ef migrations bundle --project Keuangan.Api -o efbundle
#   ./efbundle --connection "Host=localhost;Database=keuangan;Username=app;Password=rahasia"`, 'yaml'),
          ] },
        ] },
        table(['Keputusan', 'Pilihan di proyek ini', 'Alasan'], [
          ['Tipe `jumlah`', '`long`', 'Kontrak memakai rupiah bulat; tanpa pecahan, sama dengan `int` di Pydantic'],
          ['Tipe `tanggal`', '`DateTime` UTC', '`DateTimeOffset` diserialisasi sebagai `+00:00`; `DateTime` ber-Kind UTC menghasilkan akhiran `Z` seperti kontrak'],
          ['Validasi', 'Fungsi `Validasi.Periksa` manual', '`AddValidation` .NET 10 membalas ProblemDetails, sedangkan kontrak meminta `{ "error": ... }`'],
          ['Body rusak', '`ThrowOnBadRequest` + exception handler', 'Tanpa itu, Production membalas 400 dengan body kosong'],
          ['`/health`', 'Selalu `{ "status": "ok" }`', 'Cek database dipisah ke `/health/ready` untuk readiness probe'],
        ]),
        callout('tip', 'Uji silang dengan klien dari bahasa lain', 'Jalankan skrip curl atau koleksi test yang sama yang dipakai untuk versi FastAPI dan Go terhadap API .NET ini di `localhost:8080`. Bila semua lolos tanpa perubahan, kontrak terjaga. Selisih yang paling sering muncul: nama field PascalCase karena opsi JSON diubah, `tanggal` berakhiran `+00:00`, dan error validasi berbentuk ProblemDetails.'),
        ...quiz([
          ['CS-48', 'Mengapa `tanggal` memakai `DateTime` UTC, bukan `DateTimeOffset`, walau modul lain menganjurkan `DateTimeOffset`?', 'Karena kontrak JSON meminta format `2026-06-04T10:00:00Z`. System.Text.Json menulis `DateTimeOffset` dengan offset eksplisit (`+00:00`), sedangkan `DateTime` dengan `Kind = Utc` ditulis dengan akhiran `Z`. Npgsql memetakan kolom `timestamp with time zone` ke `DateTime` UTC, dan menolak `DateTime` dengan Kind Local/Unspecified, sehingga konsistensi UTC terjaga dari database sampai JSON.'],
          ['CS-49', 'Apa yang terjadi di Production bila klien mengirim body `{"jumlah": "abc"}` tanpa `ThrowOnBadRequest = true`?', 'Binding body gagal dan Minimal API membalas 400 dengan body kosong, karena secara default exception binding hanya dilempar di Development. Klien yang mengharapkan `{ "error": ... }` gagal mem-parse respons. Dengan `ThrowOnBadRequest = true`, `BadHttpRequestException` dilempar dan exception handler menulis respons sesuai kontrak.'],
          ['CS-50', 'Mengapa DELETE memakai `ExecuteDeleteAsync`, sedangkan PUT memuat entitas dulu?', 'DELETE tidak butuh data lama: satu perintah `DELETE ... WHERE id = @id` sudah cukup, dan jumlah baris terhapus langsung menunjukkan 204 atau 404. PUT harus mengembalikan objek lengkap yang sudah diubah, termasuk `tanggal` yang tidak dikirim klien, sehingga lebih sederhana memuat entitas, mengubahnya, dan menyimpan lewat change tracker.'],
        ]),
        ...practice('cs-proyek-akhir', [
          'Langkah 1–2: solusi, paket, PostgreSQL lokal, entitas dan DbContext, migrasi `Awal` diterapkan.',
          'Langkah 3: keenam endpoint berjalan; status code dan nama field JSON sama persis dengan tabel kontrak.',
          'Ketiga pesan validasi dan pesan 404 identik dengan versi Go/FastAPI; body JSON rusak juga membalas `{ "error": ... }`.',
          '`tanggal` di respons berakhiran `Z` dan `GET /api/ringkasan` benar untuk database kosong (semua 0).',
          'Langkah 4: integration test alur lengkap dan Theory validasi lolos terhadap PostgreSQL di Testcontainers.',
          'Langkah 5: `docker compose up` menjalankan API dan database; migrasi diterapkan dengan migration bundle.',
          'Klien mobile atau skrip test dari kurikulum lain berjalan terhadap API ini tanpa perubahan.',
          'Bonus: tambahkan JWT dan kolom `user_id` sehingga setiap user hanya melihat transaksinya sendiri.',
        ]),
        references(
          ['Tutorial: Minimal API', 'https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api'],
          ['Handle errors in Minimal API apps', 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors'],
          ['DateTime and DateTimeOffset support in System.Text.Json', 'https://learn.microsoft.com/en-us/dotnet/standard/datetime/system-text-json-support'],
          ['Applying migrations: bundles', 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying#bundles'],
          ['Integration tests in ASP.NET Core', 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests'],
          ['Testcontainers for .NET: PostgreSQL', 'https://dotnet.testcontainers.org/modules/postgres/'],
        ),
      ],
    },
  ],
};
