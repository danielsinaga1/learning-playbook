import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'Swift Dasar';
const CONCURRENCY = 'Swift Concurrency';
const SWIFTUI = 'SwiftUI';

export const swiftSource = 'Swift & iOS: materi tulisan tangan dari The Swift Programming Language, dokumentasi swift.org, dan Apple Developer Documentation (2 November 2026)';

const swiftTracks: Track[] = [
  { title: DASAR, summary: 'Setup Xcode & toolchain, sintaks, optional, koleksi, fungsi & closure, struct/class/enum, protocol & generic, error handling, dan ARC.' },
  { title: CONCURRENCY, summary: 'async/await, Task, TaskGroup, pembatalan, actor, Sendable, @MainActor, dan migrasi ke strict concurrency Swift 6.' },
  { title: SWIFTUI, summary: 'UI deklaratif dengan SwiftUI: view & layout, state dan data flow, networking + SwiftData, testing, MVVM, dan rilis lewat TestFlight.' },
];

const swiftModules: Omit<Module, 'code'>[] = [
  {
    id: 'sw-setup-dasar',
    title: 'Swift: Setup & Sintaks Dasar',
    summary: 'Xcode, Swift Playgrounds, toolchain swift CLI (juga di Linux/Windows), let/var, tipe & inferensi, String, dan optional.',
    track: DASAR, source: swiftSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Swift adalah bahasa open source dari Apple yang statically typed, aman terhadap memori, dan dikompilasi ke kode native lewat LLVM. Swift dipakai untuk semua platform Apple (iOS, iPadOS, macOS, watchOS, tvOS, visionOS), tetapi bahasanya sendiri juga berjalan di Linux dan Windows untuk CLI maupun server. Sintaksnya terasa dekat dengan Kotlin: `let` mirip `val`, tipe diinferensi, dan nilai yang boleh kosong ditandai dengan **optional** (`String?`) yang dicek compiler.'),
      paragraph('Untuk membuat aplikasi iOS Anda **wajib memakai Mac dengan Xcode**, karena SDK iOS, Simulator, dan proses signing hanya tersedia di macOS. Namun modul Swift Dasar dan Swift Concurrency bisa dipelajari di Linux atau Windows memakai toolchain resmi dari swift.org. Versi utama terakhir yang dibahas di sini adalah Swift 6 (September 2024, strict concurrency) dan Swift 6.2 (2025). Swift 6.3 (Maret 2026) dan 6.4 (September 2026) sudah rilis tanpa mengubah konsep di materi ini; cek [swift.org/install](https://www.swift.org/install/) untuk rilis terbaru.'),
      code('Install toolchain dan proyek pertama', `# macOS: pasang Xcode dari Mac App Store (berisi compiler Swift, SDK iOS, dan Simulator)
xcode-select --install          # hanya Command Line Tools: cukup untuk CLI, tanpa Simulator/SDK iOS
swift --version

# Linux/macOS: pakai swiftly, installer toolchain resmi (ikuti langkah di swift.org/install)
swiftly install latest
swiftly list

# Windows: installer resmi via winget (butuh komponen Visual Studio, lihat swift.org/install/windows)
winget install --id Swift.Toolchain -e

# Proyek Swift Package Manager (sama di semua OS)
mkdir Halo && cd Halo
swift package init --type executable
swift run                       # build + jalankan Sources/Halo/main.swift
swift test                      # jalankan test di Tests/
swift repl                      # REPL interaktif untuk mencoba sintaks`, 'bash'),
      code('let/var, tipe, String, dan string interpolation', `let nama = "Budi"                  // let = konstanta, utamakan ini
var saldo = 150_000                // var = bisa diubah; tipe Int diinferensi
saldo += 25_000

let pajak: Double = 0.11           // anotasi tipe eksplisit
let total = Double(saldo) * (1 + pajak)   // tidak ada konversi implisit Int → Double
print("Halo, \\(nama)! Saldo \\(saldo), setelah pajak \\(total)")

let surat = """
    Yth. \\(nama),
    Tagihan Anda bulan ini sudah terbit.
    """                            // multiline: indentasi dihitung dari posisi penutup """

let sapa = "café 👋🏽"
print(sapa.count)                  // 6: jumlah Character (grapheme cluster), bukan byte
print(sapa.utf8.count)             // jumlah byte UTF-8, lebih besar dari 6
print(sapa.hasPrefix("caf"), sapa.uppercased())
let awal = sapa.prefix(3)          // Substring "caf"; String tidak bisa diindeks dengan Int
let kata = "kopi,teh,susu".split(separator: ",").map(String.init)   // ["kopi", "teh", "susu"]

let (kode, pesan) = (404, "Not Found")    // tuple + destructuring
let bulat = Int("42")              // Int? karena "abc" tidak bisa dikonversi`, 'swift'),
      code('Optional: if let, guard let, ??, optional chaining', `struct Pengguna {
    let nama: String
    let email: String?             // boleh nil
}

func cariPengguna(id: Int) -> Pengguna? {
    id == 1 ? Pengguna(nama: "Budi", email: nil) : nil
}

if let p = cariPengguna(id: 1) {
    print("ketemu \\(p.nama)")
}

let email = cariPengguna(id: 1)?.email      // optional chaining: String?
if let email {                              // shorthand Swift 5.7 untuk: if let email = email
    print("kirim ke \\(email)")
}

func kirimSambutan(ke id: Int) {
    guard let p = cariPengguna(id: id), let email = p.email else {
        print("tidak bisa mengirim")        // guard wajib keluar scope: return/throw/break/continue
        return
    }
    print("Halo \\(p.nama), cek \\(email)") // p dan email bertipe non-optional di sini
}

let panjang = cariPengguna(id: 1)?.email?.count ?? 0   // ?? = nilai cadangan bila nil
let paksa = Int("7")!                       // force unwrap: crash bila nil, hindari di produksi`, 'swift'),
      table(['Kotlin', 'Swift', 'Catatan'], [
        ['`val x = 1` / `var y = 2`', '`let x = 1` / `var y = 2`', 'Utamakan `let`; compiler memberi peringatan bila `var` tidak pernah diubah'],
        ['`"Halo $nama"`', '`"Halo \\(nama)"`', 'Interpolasi menerima ekspresi apa pun'],
        ['`String?`', '`String?` (= `Optional<String>`)', 'Optional di Swift adalah enum `.some` / `.none`'],
        ['`a?.b`', '`a?.b`', 'Optional chaining, hasilnya tetap optional'],
        ['`a ?: b`', '`a ?? b`', 'Nil-coalescing'],
        ['`a!!`', '`a!`', 'Force unwrap, crash bila nil'],
        ['Smart cast / `?.let { }`', '`if let`, `guard let`', '`guard let` membuat nilai tersedia sampai akhir scope'],
      ]),
      callout('tip', 'Tiga cara mencoba Swift', '**Swift Playgrounds** (iPad/Mac) cocok untuk belajar tanpa setup proyek. **Xcode** dipakai untuk aplikasi iOS sungguhan. **`swift` CLI** (macOS/Linux/Windows) cocok untuk latihan bahasa, script, dan package; semua contoh di track Swift Dasar bisa dijalankan dengan `swift run`.'),
      ...quiz([
        ['SW-01', 'Mengapa `sapa.count` untuk `"café 👋🏽"` bernilai 6, bukan jumlah byte?', '`String.count` menghitung `Character`, yaitu extended grapheme cluster yang terlihat sebagai satu karakter oleh manusia. Emoji dengan modifier warna kulit terdiri dari beberapa scalar Unicode tetapi tetap satu `Character`. Jumlah byte bisa dilihat lewat `sapa.utf8.count`. Itu juga alasan String tidak bisa diindeks dengan `Int`: mencari karakter ke-n butuh penelusuran O(n).'],
        ['SW-02', 'Apa beda `if let` dan `guard let`?', '`if let` membuka optional hanya di dalam blok `if`. `guard let` membuka optional untuk sisa scope setelahnya, dan cabang `else` wajib keluar (return, throw, break, continue). `guard` cocok untuk validasi di awal fungsi agar alur utama tidak menjorok ke dalam.'],
        ['SW-03', 'Mengapa `let total = saldo * 0.11` error bila `saldo` bertipe `Int`?', 'Swift tidak melakukan konversi numerik implisit. `Int` dikali `Double` tidak valid; konversi eksplisit dengan `Double(saldo) * 0.11`. Ini mencegah kehilangan presisi yang tidak disadari.'],
      ]),
      ...practice('sw-setup', [
        'Pasang toolchain (Xcode di Mac, atau swiftly/winget di Linux/Windows), lalu jalankan `swift --version`, `swift package init --type executable`, dan `swift run`.',
        'Tulis fungsi `cariPengguna(id:)` yang mengembalikan optional dan panggil dengan `if let`, `guard let`, dan `??`; uji untuk id yang ada dan tidak ada.',
        'Baca input angka dari `readLine()` (hasilnya `String?`), konversi dengan `Int(_:)`, dan tampilkan pesan error yang jelas tanpa satu pun `!`.',
        'Bandingkan `count`, `utf8.count`, dan `unicodeScalars.count` untuk tiga string berisi emoji dan huruf beraksen.',
      ]),
      references(
        ['Swift.org: Install Swift', 'https://www.swift.org/install/'],
        ['The Swift Programming Language: The Basics', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/'],
        ['The Swift Programming Language: Strings and Characters', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/stringsandcharacters/'],
        ['Apple Developer: Xcode', 'https://developer.apple.com/xcode/'],
        ['Apple Developer: Swift Playgrounds', 'https://developer.apple.com/swift-playgrounds/'],
      ),
    ],
  },
  {
    id: 'sw-koleksi-kontrol',
    title: 'Swift: Koleksi & Kontrol Alur',
    summary: 'Array, Dictionary, Set, map/filter/reduce, for-in, stride, if/switch sebagai ekspresi, dan pattern matching di switch.',
    track: DASAR, source: swiftSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Tiga koleksi utama Swift adalah `Array`, `Dictionary`, dan `Set`. Ketiganya **value type**: menyalin array ke variabel lain menghasilkan salinan independen (dengan optimasi copy-on-write sehingga tetap murah). Mutabilitas ditentukan oleh `let` vs `var`, bukan oleh tipe koleksi yang berbeda seperti `List` vs `MutableList` di Kotlin.'),
      paragraph('`switch` di Swift jauh lebih kuat daripada di Java: harus **exhaustive**, tidak ada fallthrough implisit, dan bisa mencocokkan range, tuple, enum dengan associated value, serta kondisi `where`. Sejak Swift 5.9, `if` dan `switch` juga bisa dipakai sebagai ekspresi yang menghasilkan nilai.'),
      code('Array, Dictionary, Set, dan fungsi koleksi', `var belanja = ["kopi", "gula", "teh"]       // [String]
belanja.append("susu")
belanja += ["roti"]
print(belanja.first ?? "-", belanja.count, belanja.contains("teh"))

var stok: [String: Int] = ["kopi": 10, "teh": 0]
stok["gula"] = 5                             // tambah atau ubah
stok["teh"] = nil                            // hapus key
let kopi = stok["kopi"] ?? 0                 // akses dictionary selalu menghasilkan optional

var frekuensi: [Character: Int] = [:]
for huruf in "banana" {
    frekuensi[huruf, default: 0] += 1        // ["b": 1, "a": 3, "n": 2]
}

let tagA: Set = ["swift", "ios", "mobile"]
let tagB: Set = ["kotlin", "mobile"]
print(tagA.intersection(tagB), tagA.union(tagB).count)   // ["mobile"] 4

let harga = [25_000, 450_000, 12_000]
let mahalRibu = harga.filter { $0 > 20_000 }.map { $0 / 1_000 }   // [25, 450]
let total = harga.reduce(0, +)                                    // 487000
let valid = ["1", "x", "3"].compactMap { Int($0) }                // [1, 3]
let urut = harga.sorted(by: >)                                    // menurun
let perAwalan = Dictionary(grouping: belanja, by: { $0.first! })  // [Character: [String]]`, 'swift'),
      code('Loop: for-in, enumerated, stride, where, label', `let belanja = ["kopi", "gula", "teh"]
for (i, item) in belanja.enumerated() {
    print("\\(i + 1). \\(item)")
}

let stok = ["kopi": 10, "gula": 5]
for (nama, jumlah) in stok.sorted(by: { $0.key < $1.key }) {   // urutan Dictionary tidak dijamin
    print(nama, jumlah)
}

for i in 0..<3 { print(i) }                  // 0 1 2 (half-open)
for i in 1...3 { print(i) }                  // 1 2 3 (closed)
for i in stride(from: 10, through: 0, by: -5) { print(i) }   // 10 5 0
for n in 1...30 where n.isMultiple(of: 7) { print(n) }       // 7 14 21 28

let matriks = [[1, 2], [3, -4], [5, 6]]
cari: for baris in matriks {
    for x in baris where x < 0 {
        print("negatif pertama: \\(x)")
        break cari                           // keluar dari loop luar
    }
}

var percobaan = 0
repeat {                                     // setara do-while
    percobaan += 1
} while percobaan < 3`, 'swift'),
      code('switch dan if sebagai ekspresi, pattern matching', `func deskripsi(kode: Int) -> String {
    switch kode {                            // Swift 5.9: switch sebagai ekspresi, tanpa return
    case 200, 201: "sukses"
    case 400..<500: "kesalahan klien"
    case 500...599: "kesalahan server"
    default: "lainnya"
    }
}

let skor = 87
let nilai = if skor >= 85 { "A" } else if skor >= 70 { "B" } else { "C" }

let titik = (x: 3, y: -3)
switch titik {
case (0, 0):
    print("pusat")
case (let x, 0):
    print("di sumbu x, x = \\(x)")
case let (x, y) where x == -y:
    print("di diagonal turun")               // cabang ini yang cocok
case (-5...5, -5...5):
    print("dekat pusat")
default:
    print("jauh")
}

let input: [String?] = ["a", nil, "c"]
for case let teks? in input {                // hanya elemen non-nil
    print(teks)
}
if case 1...9 = skor / 10 { print("dua digit") }`, 'swift'),
      table(['Kotlin', 'Swift', 'Catatan'], [
        ['`listOf(1, 2)` / `mutableListOf()`', '`let a = [1, 2]` / `var a: [Int] = []`', 'Satu tipe `Array`; mutabilitas dari `let`/`var`'],
        ['`mapOf("a" to 1)`', '`["a": 1]`', 'Subscript Dictionary mengembalikan optional'],
        ['`when (x) { in 1..9 -> }`', '`switch x { case 1...9: }`', 'Wajib exhaustive; pakai `default` bila perlu'],
        ['Cabang `when` tidak fallthrough', 'Tidak fallthrough implisit', 'Gunakan kata kunci `fallthrough` bila benar-benar perlu'],
        ['`0 until n` / `0..<n`', '`0..<n`', '`1...n` untuk inklusif'],
        ['`forEachIndexed`', '`for (i, x) in xs.enumerated()`', '`enumerated()` memberi offset mulai dari 0'],
        ['`mapNotNull`', '`compactMap`', 'Buang hasil nil'],
      ]),
      callout('warn', 'Index out of range = crash', '`belanja[10]` pada array berisi 3 elemen langsung menghentikan program (runtime trap), bukan melempar exception yang bisa ditangkap. Gunakan `first`, `last`, `indices.contains(i)`, atau buat extension `subscript(aman i: Int) -> Element?` untuk akses yang mungkin di luar batas.'),
      ...quiz([
        ['SW-04', 'Mengapa `let xs = [1, 2]; xs.append(3)` error, padahal `let` objek class tetap bisa diubah propertinya?', 'Array adalah value type (struct). `let` pada value type membuat seluruh nilai immutable, termasuk isinya. Pada class (reference type), `let` hanya mengunci referensinya, sementara properti `var` di objeknya tetap bisa diubah.'],
        ['SW-05', 'Apa arti `case let (x, y) where x == -y` di switch?', 'Pola tuple yang mengikat kedua elemen ke konstanta `x` dan `y`, lalu cabang hanya cocok bila kondisi `where` bernilai true. Cabang dievaluasi berurutan, jadi pola yang lebih spesifik harus ditulis lebih dulu.'],
      ]),
      ...practice('sw-koleksi', [
        'Hitung frekuensi kata dalam satu paragraf dengan `[String: Int]` dan `default:`, lalu tampilkan 5 kata teratas.',
        'Tulis `deskripsi(kode:)` sebagai switch expression dan uji untuk 200, 302, 404, dan 503.',
        'Dari array transaksi `(judul: String, jumlah: Int)`, hitung total, rata-rata, dan transaksi terbesar memakai `reduce`, `max(by:)`, dan `filter`.',
        'Buat extension `subscript(aman i: Int) -> Element?` untuk `Array` dan pakai untuk mengganti akses index yang berisiko.',
      ]),
      references(
        ['The Swift Programming Language: Collection Types', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/collectiontypes/'],
        ['The Swift Programming Language: Control Flow', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/'],
        ['Apple Developer: Array', 'https://developer.apple.com/documentation/swift/array'],
      ),
    ],
  },
  {
    id: 'sw-fungsi-closure',
    title: 'Swift: Fungsi & Closure',
    summary: 'Argument label, default & variadic parameter, inout, tipe fungsi, closure dan sintaks singkatnya, trailing closure, @escaping, serta capture list.',
    track: DASAR, source: swiftSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Fungsi Swift punya ciri khas **argument label**: nama yang dipakai pemanggil bisa berbeda dari nama parameter di dalam fungsi, sehingga pemanggilan terbaca seperti kalimat (`kirim(pesan:ke:)`). Fungsi juga warga kelas satu: bisa disimpan di variabel, dikirim sebagai argumen, dan dikembalikan dari fungsi lain.'),
      paragraph('**Closure** adalah blok kode yang bisa membawa (capture) variabel dari lingkungan tempat ia dibuat. Closure dipakai di mana-mana: `map`/`filter`, callback, hingga hampir seluruh API SwiftUI (`Button { } label: { }`). Memahami kapan closure **escaping** dan apa yang ia capture adalah kunci menghindari bug dan memory leak.'),
      code('Argument label, default, variadic, inout, tuple', `func kirim(pesan: String, ke penerima: String, ulang kali: Int = 1) {
    for _ in 0..<kali {
        print("→ \\(penerima): \\(pesan)")       // di dalam fungsi pakai nama parameter
    }
}
kirim(pesan: "Halo", ke: "Budi")              // label luar: pesan, ke, ulang
kirim(pesan: "Pengingat", ke: "Siti", ulang: 2)

func jumlah(_ angka: Int...) -> Int {         // _ = tanpa label; Int... = variadic
    angka.reduce(0, +)                        // fungsi satu ekspresi: return implisit
}
print(jumlah(1, 2, 3))

func tukar(_ a: inout Int, _ b: inout Int) {  // inout: perubahan terlihat oleh pemanggil
    (a, b) = (b, a)
}
var x = 1, y = 2
tukar(&x, &y)

func minMax(_ xs: [Int]) -> (min: Int, max: Int)? {   // tuple bernama sebagai hasil
    guard let mn = xs.min(), let mx = xs.max() else { return nil }
    return (mn, mx)
}
if let r = minMax([4, 9, 1]) { print(r.min, r.max) }

let operasi: (Int, Int) -> Int = (+)          // tipe fungsi
print(operasi(2, 3))`, 'swift'),
      code('Closure dari bentuk lengkap ke trailing closure', `let nama = ["Siti", "budi", "Andi"]

// 1. Bentuk lengkap
let a = nama.sorted(by: { (x: String, y: String) -> Bool in
    return x.lowercased() < y.lowercased()
})
// 2. Tipe diinferensi, return implisit
let b = nama.sorted(by: { x, y in x.lowercased() < y.lowercased() })
// 3. Trailing closure + shorthand argument $0, $1
let c = nama.sorted { $0.lowercased() < $1.lowercased() }

// Closure yang mengembalikan closure dan menangkap state
func pembuatPenghitung(langkah: Int) -> () -> Int {
    var total = 0
    return {
        total += langkah                      // total ditangkap by reference
        return total
    }
}
let hitung = pembuatPenghitung(langkah: 5)
print(hitung(), hitung())                     // 5 10

// Multiple trailing closures (gaya yang juga dipakai SwiftUI)
func ambil(url: String, sukses: (String) -> Void, gagal: (String) -> Void) {
    url.hasPrefix("https") ? sukses("isi \\(url)") : gagal("URL harus https")
}
ambil(url: "https://contoh.id") { isi in
    print(isi)
} gagal: { pesan in
    print("error: \\(pesan)")
}`, 'swift'),
      code('Capture list, @escaping, dan [weak self]', `var diskon = 10
let tanpaCapture = { print("diskon \\(diskon)") }
let denganCapture = { [diskon] in print("diskon \\(diskon)") }   // salin nilai saat closure dibuat
diskon = 50
tanpaCapture()                                // diskon 50
denganCapture()                               // diskon 10

final class Pengunduh {
    private var callbacks: [(String) -> Void] = []

    // @escaping: closure disimpan dan dipanggil setelah fungsi selesai
    func saatSelesai(_ callback: @escaping (String) -> Void) {
        callbacks.append(callback)
    }

    func selesai() { callbacks.forEach { $0("berkas.zip") } }
}

final class LayarUnduhan {
    let pengunduh = Pengunduh()
    var status = "menunggu"

    func mulai() {
        pengunduh.saatSelesai { [weak self] nama in   // tanpa weak: self ↔ closure saling menahan
            guard let self else { return }            // objek sudah dibebaskan → abaikan
            self.status = "selesai: \\(nama)"
        }
    }
    deinit { print("LayarUnduhan dibebaskan") }
}`, 'swift'),
      table(['Konsep', 'Kotlin', 'Swift'], [
        ['Lambda singkat', '`xs.map { it * 2 }`', '`xs.map { $0 * 2 }`'],
        ['Trailing lambda/closure', '`saring(data) { ... }`', '`saring(data) { ... }`, plus multiple trailing closures dengan label'],
        ['Nama argumen di pemanggil', 'Named argument opsional', 'Argument label wajib (kecuali `_`)'],
        ['Tipe fungsi', '`(Int) -> Boolean`', '`(Int) -> Bool`'],
        ['Callback disimpan', 'Biasa saja', 'Wajib ditandai `@escaping`'],
        ['Capture nilai saat dibuat', 'Salin manual ke `val`', 'Capture list `[nilai]`'],
        ['Hindari retain cycle', 'Jarang perlu (GC)', '`[weak self]` atau `[unowned self]` (ARC)'],
      ]),
      callout('tip', 'Kapan closure perlu @escaping', 'Closure parameter default-nya non-escaping: dijamin selesai dipakai sebelum fungsi return, sehingga compiler bisa mengoptimasi dan Anda tidak perlu menulis `self.` eksplisit. Tandai `@escaping` hanya bila closure disimpan ke properti, dikirim ke antrian lain, atau dipanggil setelah fungsi selesai. Di kode modern, banyak callback escaping lebih baik diganti `async` function (modul Swift Concurrency).'),
      ...quiz([
        ['SW-06', 'Apa hasil `tanpaCapture()` dan `denganCapture()` setelah `diskon = 50`, dan mengapa berbeda?', '`tanpaCapture` mencetak 50 karena closure menangkap variabel `diskon` itu sendiri (by reference), sehingga melihat nilai terbaru. `denganCapture` mencetak 10 karena capture list `[diskon]` menyalin nilai saat closure dibuat.'],
        ['SW-07', 'Mengapa closure yang disimpan di objek dan memakai `self` bisa menyebabkan memory leak?', 'Objek menahan closure (strong reference lewat properti), dan closure menahan objek lewat capture `self`. Keduanya tidak pernah turun ke retain count nol, sehingga `deinit` tidak pernah dipanggil. Putus siklusnya dengan `[weak self]` (lalu `guard let self`) atau `[unowned self]` bila objek dijamin hidup lebih lama dari closure.'],
        ['SW-08', 'Apa fungsi argument label `ke` pada `func kirim(pesan: String, ke penerima: String)`?', 'Label luar `ke` dipakai pemanggil (`kirim(pesan: "Halo", ke: "Budi")`) agar terbaca alami, sedangkan nama dalam `penerima` dipakai di badan fungsi. Label `_` menghilangkan label di pemanggil.'],
      ]),
      ...practice('sw-closure', [
        'Tulis fungsi `ulangi(_ n: Int, aksi: (Int) -> Void)` dan panggil dengan trailing closure.',
        'Implementasikan `pembuatDiskon(persen:) -> (Int) -> Int` dan pakai hasilnya di `map` untuk daftar harga.',
        'Buat `LayarUnduhan` seperti contoh, hapus `[weak self]`, set referensi layar ke nil, dan buktikan `deinit` tidak terpanggil; lalu perbaiki.',
        'Tulis ulang satu callback `@escaping (Result<String, Error>) -> Void` dan catat apa yang berubah setelah Anda mempelajari async/await nanti.',
      ]),
      references(
        ['The Swift Programming Language: Functions', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/functions/'],
        ['The Swift Programming Language: Closures', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures/'],
        ['The Swift Programming Language: ARC (strong reference cycles for closures)', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/'],
      ),
    ],
  },
  {
    id: 'sw-struct-class-enum',
    title: 'Swift: Struct, Class & Enum',
    summary: 'Value vs reference semantics, mutating, property observer & computed property, inheritance, enum dengan raw value dan associated value, serta indirect enum.',
    track: DASAR, source: swiftSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Di Swift, **struct** dan **enum** adalah value type: setiap assignment atau pengiriman ke fungsi menghasilkan salinan independen. **Class** adalah reference type: beberapa variabel bisa menunjuk ke objek yang sama, dan perubahan lewat satu variabel terlihat dari semua. Library standar Swift sendiri (String, Array, Dictionary, Int) dibangun sebagai struct, dan Apple menganjurkan struct sebagai pilihan default.'),
      paragraph('Enum Swift jauh melampaui enum Java: setiap case bisa membawa **associated value** dengan tipe berbeda, enum bisa punya method dan computed property, serta bisa conform ke protocol. Kombinasi enum + switch exhaustive adalah padanan `sealed class` + `when` di Kotlin.'),
      code('Struct: value semantics, mutating, computed property, observer', `struct Rekening {
    let pemilik: String
    private(set) var saldo = 0 {                  // hanya bisa diubah dari dalam tipe ini
        didSet { print("saldo \\(oldValue) → \\(saldo)") }
    }
    var saldoRibu: Int { saldo / 1_000 }          // computed property

    init(pemilik: String) {
        self.pemilik = pemilik
    }

    mutating func setor(_ jumlah: Int) {          // mutating: method yang mengubah struct
        precondition(jumlah > 0, "jumlah harus positif")
        saldo += jumlah
    }
}

var a = Rekening(pemilik: "Budi")
var b = a                                         // salinan, bukan referensi
b.setor(50_000)
print(a.saldo, b.saldo)                           // 0 50000

let tetap = Rekening(pemilik: "Siti")
// tetap.setor(10)                                // error: let pada struct = seluruh nilai immutable

// Equatable, Hashable, Codable bisa disintesis otomatis untuk struct
struct Koordinat: Hashable, Codable {
    var lat: Double
    var lon: Double                               // memberwise init: Koordinat(lat:lon:)
}
print(Koordinat(lat: 1, lon: 2) == Koordinat(lat: 1, lon: 2))   // true`, 'swift'),
      code('Class: reference semantics, identitas, inheritance, deinit', `final class Sesi {                                // final: tidak bisa diwarisi (lebih cepat, lebih jelas)
    var token: String?
    init(token: String? = nil) { self.token = token }
    deinit { print("sesi dibebaskan") }
}

let s1 = Sesi()
let s2 = s1                                       // referensi ke objek yang sama
s2.token = "abc"                                  // boleh walau let: yang dikunci hanya referensinya
print(s1.token ?? "-", s1 === s2)                 // abc true (=== membandingkan identitas)

class Bentuk {
    let nama: String
    init(nama: String) { self.nama = nama }
    func luas() -> Double { 0 }
}

final class Lingkaran: Bentuk {
    let r: Double
    init(r: Double) {
        self.r = r                                // isi properti sendiri dulu (two-phase init)
        super.init(nama: "lingkaran")
    }
    override func luas() -> Double { .pi * r * r }
}

let bentuk: [Bentuk] = [Lingkaran(r: 1), Bentuk(nama: "kosong")]
for x in bentuk { print(x.nama, x.luas()) }       // dynamic dispatch ke override`, 'swift'),
      code('Enum: raw value, associated value, indirect', `import Foundation

enum StatusPesanan: String, CaseIterable, Codable {
    case menunggu, dibayar, dikirim, selesai      // raw value otomatis "menunggu", dst.
}
print(StatusPesanan.allCases.count)               // 4
let dariServer = StatusPesanan(rawValue: "batal")   // nil: init?(rawValue:) bisa gagal

enum HasilPembayaran {
    case sukses(idTransaksi: String)
    case gagal(kode: Int, pesan: String)
    case butuhVerifikasi(url: URL)

    var bolehLanjut: Bool {
        if case .sukses = self { return true }
        return false
    }
}

func tampilkan(_ hasil: HasilPembayaran) -> String {
    switch hasil {                                // exhaustive: compiler menolak bila ada case terlewat
    case .sukses(let id):
        "Berhasil (\\(id))"
    case .gagal(let kode, _) where kode >= 500:
        "Server bermasalah, coba lagi"
    case let .gagal(_, pesan):
        "Gagal: \\(pesan)"
    case .butuhVerifikasi(let url):
        "Buka \\(url.absoluteString)"
    }
}

indirect enum Ekspresi {                          // indirect: case boleh berisi enum itu sendiri
    case angka(Int)
    case tambah(Ekspresi, Ekspresi)
    case kali(Ekspresi, Ekspresi)
}

func hitung(_ e: Ekspresi) -> Int {
    switch e {
    case .angka(let n): n
    case let .tambah(a, b): hitung(a) + hitung(b)
    case let .kali(a, b): hitung(a) * hitung(b)
    }
}
print(hitung(.tambah(.angka(2), .kali(.angka(3), .angka(4)))))   // 14`, 'swift'),
      table(['Aspek', 'struct', 'class', 'enum'], [
        ['Semantik', 'Value (disalin)', 'Reference (dibagi)', 'Value (disalin)'],
        ['Inheritance', 'Tidak (pakai protocol)', 'Ya, tunggal', 'Tidak'],
        ['Mengubah diri sendiri', 'Method `mutating`', 'Bebas', 'Method `mutating`'],
        ['Init otomatis', 'Memberwise init', 'Tidak (kecuali semua properti punya default)', 'Lewat case'],
        ['deinit & identitas (`===`)', 'Tidak', 'Ya', 'Tidak'],
        ['Padanan Kotlin', '`data class` (tetapi disalin, bukan dibagi)', '`class` / `open class`', '`enum class` + `sealed class`'],
      ]),
      callout('tip', 'Kapan memilih class', 'Mulai dengan struct. Pilih class bila butuh **identitas** bersama (satu objek dipakai banyak bagian, misalnya cache atau koneksi), **inheritance**, `deinit` untuk membersihkan resource, atau interop dengan Objective-C/UIKit. Beberapa API modern juga mewajibkan class: `@Observable` dan `@Model` (SwiftData) hanya untuk class.'),
      ...quiz([
        ['SW-09', 'Setelah `var b = a; b.setor(50_000)`, mengapa `a.saldo` tetap 0? Apa yang terjadi bila `Rekening` diubah menjadi class?', 'Struct disalin saat assignment, jadi `a` dan `b` adalah dua nilai independen. Bila `Rekening` class, `a` dan `b` menunjuk ke objek yang sama sehingga `a.saldo` ikut menjadi 50000, dan method tidak perlu `mutating`.'],
        ['SW-10', 'Apa beda raw value dan associated value pada enum?', 'Raw value adalah nilai konstan yang sama untuk setiap case (misalnya `String` atau `Int`), ditentukan saat deklarasi, dan bisa dibuat balik lewat `init?(rawValue:)`. Associated value adalah data yang dilampirkan saat case dibuat dan bisa berbeda tiap instance, misalnya `.gagal(kode: 404, pesan: "...")`.'],
      ]),
      ...practice('sw-struct', [
        'Buat struct `Keranjang` berisi array item dengan method `mutating tambah(_:)` dan computed property `total`; buktikan salinan keranjang tidak saling memengaruhi.',
        'Ubah `Keranjang` menjadi class, ulangi percobaan yang sama, dan catat perbedaannya.',
        'Modelkan status request jaringan dengan enum `Muat<T>`: `idle`, `memuat`, `sukses(T)`, `gagal(String)`, lalu tulis fungsi tampilan dengan switch exhaustive.',
        'Tambahkan case baru ke `HasilPembayaran` dan amati compiler menunjuk setiap switch yang perlu diperbarui.',
      ]),
      references(
        ['The Swift Programming Language: Structures and Classes', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/'],
        ['The Swift Programming Language: Enumerations', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/enumerations/'],
        ['The Swift Programming Language: Properties', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/'],
        ['Apple Developer: Choosing Between Structures and Classes', 'https://developer.apple.com/documentation/swift/choosing-between-structures-and-classes'],
      ),
    ],
  },
  {
    id: 'sw-protocol-generic',
    title: 'Swift: Protocol, Extension & Generic',
    summary: 'Protocol dengan default implementation, extension, associated type, generic function & type, conditional conformance, serta some vs any.',
    track: DASAR, source: swiftSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('**Protocol** adalah kontrak (mirip interface) yang bisa diadopsi struct, enum, maupun class. Dengan **extension**, protocol bisa diberi implementasi default, dan tipe yang sudah ada (bahkan `Int` atau `String`) bisa ditambahi method atau dibuat conform ke protocol baru. Gaya merancang lewat protocol + extension + value type ini disebut **protocol-oriented programming**, dan menjadi alternatif inheritance class.'),
      paragraph('**Generic** membuat kode bekerja untuk banyak tipe dengan tetap type-safe: `Array<Element>`, `Dictionary<Key, Value>`, dan `Optional<Wrapped>` semuanya generic. Kata kunci `some` (opaque type) dan `any` (existential) menentukan apakah tipe konkret tetap satu dan diketahui compiler, atau dibungkus dalam kotak dinamis.'),
      code('Protocol, default implementation, dan extension', `protocol Bentuk {
    var nama: String { get }
    func luas() -> Double
}

extension Bentuk {                                // implementasi default untuk semua yang conform
    func deskripsi() -> String { "\\(nama) dengan luas \\(luas())" }
}

struct Persegi: Bentuk {
    let sisi: Double
    var nama: String { "persegi" }
    func luas() -> Double { sisi * sisi }
}

struct Lingkaran: Bentuk {
    let r: Double
    let nama = "lingkaran"
    func luas() -> Double { .pi * r * r }
}

extension Int {                                   // menambah API ke tipe yang sudah ada
    var ribu: Int { self * 1_000 }
}

extension Persegi: CustomStringConvertible {      // conformance di extension terpisah
    var description: String { "Persegi(\\(sisi))" }
}

print(Persegi(sisi: 3).deskripsi(), 250.ribu)
print(Persegi(sisi: 2))                           // memakai description: Persegi(2.0)`, 'swift'),
      code('Generic function, generic type, associated type, conditional conformance', `func terbesar<T: Comparable>(_ xs: [T]) -> T? {  // T harus bisa dibandingkan
    guard var hasil = xs.first else { return nil }
    for x in xs where x > hasil { hasil = x }
    return hasil
}
print(terbesar([3, 9, 2]) ?? 0, terbesar(["kopi", "teh"]) ?? "")

struct Tumpukan<Elemen> {
    private var isi: [Elemen] = []
    mutating func push(_ e: Elemen) { isi.append(e) }
    mutating func pop() -> Elemen? { isi.popLast() }
    var puncak: Elemen? { isi.last }
}
extension Tumpukan: Equatable where Elemen: Equatable {}   // hanya bila Elemen Equatable

protocol Repositori {
    associatedtype Entitas: Identifiable           // tipe ditentukan oleh yang mengadopsi
    func semua() -> [Entitas]
    mutating func simpan(_ e: Entitas)
}

struct Produk: Identifiable { let id: Int; var nama: String }

struct ProdukMemori: Repositori {                  // Entitas diinferensi = Produk
    private var data: [Int: Produk] = [:]
    func semua() -> [Produk] { data.values.sorted { $0.id < $1.id } }
    mutating func simpan(_ e: Produk) { data[e.id] = e }
}

func jumlahProduk<R: Repositori>(_ repo: R) -> Int where R.Entitas == Produk {
    repo.semua().count
}`, 'swift'),
      code('some vs any', `// some: opaque type. Pemanggil tidak tahu tipe konkretnya, tetapi compiler tahu dan tipenya tetap satu.
func bentukDefault() -> some Bentuk { Persegi(sisi: 1) }

// Parameter "some" = generic tersembunyi: func cetak<B: Bentuk>(_ b: B)
func cetak(_ b: some Bentuk) { print(b.deskripsi()) }

// any: existential. Kotak dinamis yang bisa berisi tipe apa pun yang conform.
let campuran: [any Bentuk] = [Persegi(sisi: 2), Lingkaran(r: 1)]
let totalLuas = campuran.reduce(0) { $0 + $1.luas() }

for b in campuran {
    cetak(b)                                       // Swift 5.7+: existential "dibuka" otomatis ke some
}

// Primary associated type (Swift 5.7+): batasi elemen tanpa menulis generic penuh
func jumlahkan(_ xs: some Collection<Int>) -> Int { xs.reduce(0, +) }
print(jumlahkan([1, 2, 3]), jumlahkan(Set([4, 5])))

// SwiftUI memakai some di mana-mana: var body: some View { ... }`, 'swift'),
      table(['Bentuk', 'Arti', 'Kapan dipakai'], [
        ['`func f<T: P>(_ x: T)`', 'Generic eksplisit; tipe dipilih pemanggil', 'Butuh nama tipe `T` di beberapa tempat atau constraint `where`'],
        ['`func f(_ x: some P)`', 'Generic tersembunyi (sama cepatnya)', 'Parameter tunggal; sintaks lebih ringkas'],
        ['`-> some P`', 'Opaque result: satu tipe konkret yang disembunyikan', '`body` SwiftUI, API yang tidak ingin membocorkan tipe'],
        ['`any P`', 'Existential box; tipe bisa berbeda saat runtime', 'Koleksi heterogen, properti yang isinya bisa berganti tipe'],
        ['Kotlin', '`<T : P>` / interface sebagai tipe', '`any P` ≈ memakai interface sebagai tipe variabel'],
      ]),
      callout('warn', 'Jangan jadikan semuanya protocol', 'Protocol dengan satu implementasi biasanya hanya menambah lapisan. Buat protocol saat memang ada lebih dari satu implementasi, misalnya repositori asli vs palsu untuk test (lihat modul Testing & MVVM). Utamakan `some` atau generic daripada `any` bila tipe konkretnya memang satu, karena `any` menambah biaya dynamic dispatch dan alokasi box.'),
      ...quiz([
        ['SW-11', 'Mengapa `func f() -> some Bentuk` tidak boleh mengembalikan `Persegi` di satu cabang dan `Lingkaran` di cabang lain?', 'Opaque type menjanjikan satu tipe konkret yang tetap (hanya disembunyikan dari pemanggil). Dua cabang dengan tipe berbeda melanggar janji itu. Bila memang harus berbeda, kembalikan `any Bentuk`, atau bungkus keduanya dalam enum.'],
        ['SW-12', 'Apa fungsi `extension Tumpukan: Equatable where Elemen: Equatable {}`?', 'Conditional conformance: `Tumpukan<Int>` menjadi Equatable karena `Int` Equatable, sedangkan `Tumpukan` berisi tipe yang tidak Equatable tidak. Implementasi `==` disintesis otomatis oleh compiler.'],
      ]),
      ...practice('sw-protocol', [
        'Tambahkan `Segitiga` yang conform ke `Bentuk`, lalu hitung total luas array `[any Bentuk]`.',
        'Tulis protocol `Cache` dengan associated type `Key: Hashable` dan `Value`, lalu implementasikan `CacheMemori` dengan batas jumlah item.',
        'Buat extension pada `Array where Element: Numeric` yang menambahkan computed property `jumlahTotal`.',
        'Ubah satu fungsi yang menerima `[any Bentuk]` menjadi generic, lalu jelaskan kapan versi `any` tetap dibutuhkan.',
      ]),
      references(
        ['The Swift Programming Language: Protocols', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/'],
        ['The Swift Programming Language: Extensions', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/extensions/'],
        ['The Swift Programming Language: Generics', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics/'],
        ['The Swift Programming Language: Opaque and Boxed Protocol Types', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/opaquetypes/'],
      ),
    ],
  },
  {
    id: 'sw-error-arc',
    title: 'Swift: Error Handling & Memory Management (ARC)',
    summary: 'throws/try/catch, try? dan try!, Result, typed throws Swift 6, defer, lalu ARC: strong reference cycle, weak, unowned, dan delegate.',
    track: DASAR, source: swiftSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Swift memisahkan dua jenis kegagalan. Kesalahan yang bisa dipulihkan (jaringan putus, input tidak valid) memakai `throw` dan wajib ditandai `try` di pemanggil, sehingga setiap titik yang bisa gagal terlihat jelas di kode. Kesalahan programmer (index di luar batas, force unwrap nil, `precondition` gagal) menghentikan program dan tidak bisa ditangkap. Sejak Swift 6, fungsi juga bisa menyatakan **typed throws** `throws(MyError)` sehingga pemanggil tahu persis tipe error-nya.'),
      paragraph('Untuk memori, Swift memakai **ARC** (Automatic Reference Counting), bukan garbage collector seperti JVM. Setiap objek class punya hitungan referensi; begitu turun ke nol, objek langsung dibebaskan dan `deinit` dipanggil. Konsekuensinya: dua objek yang saling menahan dengan referensi strong tidak akan pernah dibebaskan (**retain cycle**), dan Anda yang harus memutusnya dengan `weak` atau `unowned`.'),
      code('throws, do/catch, try?, Result, defer', `enum JaringanError: Error {
    case statusTidakValid(Int)
    case tidakAdaKoneksi
}

func muatProfil(id: Int) throws -> String {      // throws = bisa melempar any Error
    guard id > 0 else { throw JaringanError.statusTidakValid(400) }
    return "profil \\(id)"
}

do {
    let p = try muatProfil(id: -1)
    print(p)
} catch JaringanError.statusTidakValid(let kode) where kode >= 500 {
    print("server error \\(kode)")
} catch let e as JaringanError {
    print("jaringan: \\(e)")                      // cabang ini yang jalan
} catch {
    print("lainnya: \\(error)")                   // error tersedia otomatis di catch umum
}

let mungkin = try? muatProfil(id: -1)             // nil bila gagal (detail error hilang)
let hasil = Result { try muatProfil(id: 7) }     // Result<String, any Error>
switch hasil {
case .success(let teks): print(teks)
case .failure(let e): print("gagal: \\(e)")
}
let panjang = hasil.map(\\.count)                 // transformasi tanpa membuka Result

func proses(berkas: String) throws {
    print("buka \\(berkas)")
    defer { print("tutup \\(berkas)") }           // selalu jalan saat keluar scope, termasuk saat throw
    try validasi(berkas)
    print("proses \\(berkas)")
}
func validasi(_ s: String) throws { if s.isEmpty { throw JaringanError.tidakAdaKoneksi } }`, 'swift'),
      code('Typed throws (Swift 6)', `enum ValidasiError: Error, Equatable {
    case kosong(field: String)
    case terlaluPendek(field: String, minimal: Int)
}

// Pemanggil tahu error yang mungkin hanya ValidasiError
func validasiPassword(_ p: String) throws(ValidasiError) -> String {
    guard !p.isEmpty else { throw .kosong(field: "password") }   // tipe sudah diketahui: cukup .kosong
    guard p.count >= 8 else { throw .terlaluPendek(field: "password", minimal: 8) }
    return p
}

do throws(ValidasiError) {
    _ = try validasiPassword("abc")
} catch {
    switch error {                                // error bertipe ValidasiError, switch bisa exhaustive
    case .kosong(let f): print("\\(f) wajib diisi")
    case .terlaluPendek(let f, let n): print("\\(f) minimal \\(n) karakter")
    }
}

// throws(Never) = tidak pernah melempar; throws biasa = throws(any Error)`, 'swift'),
      code('ARC: retain cycle, weak, unowned, delegate', `final class Pemilik {
    let nama: String
    var hewan: Hewan?                             // strong
    init(nama: String) { self.nama = nama }
    deinit { print("\\(nama) dibebaskan") }
}

final class Hewan {
    let nama: String
    weak var pemilik: Pemilik?                    // weak: tidak menambah hitungan, otomatis nil
    init(nama: String) { self.nama = nama }
    deinit { print("\\(nama) dibebaskan") }
}

do {
    let budi = Pemilik(nama: "Budi")
    let kiki = Hewan(nama: "Kiki")
    budi.hewan = kiki
    kiki.pemilik = budi
}   // keduanya dibebaskan di sini; tanpa weak → retain cycle, deinit tidak pernah jalan

final class Pelanggan {
    let nama: String
    var kartu: Kartu?
    init(nama: String) { self.nama = nama }
}
final class Kartu {
    unowned let pemilik: Pelanggan                // unowned: non-optional, pemilik dijamin hidup lebih lama
    init(pemilik: Pelanggan) { self.pemilik = pemilik }
}

protocol PengunggahDelegate: AnyObject {          // AnyObject: hanya class, agar bisa weak
    func selesai(url: String)
}
final class Pengunggah {
    weak var delegate: PengunggahDelegate?        // delegate hampir selalu weak
    func unggah() { delegate?.selesai(url: "https://cdn.contoh.id/a.jpg") }
}`, 'swift'),
      table(['Referensi', 'Menambah hitungan?', 'Tipe', 'Bila objek dibebaskan', 'Pakai untuk'], [
        ['strong (default)', 'Ya', 'Apa saja', 'Tidak bisa terjadi selama masih dirujuk', 'Kepemilikan normal'],
        ['`weak`', 'Tidak', 'Optional `var`', 'Otomatis menjadi nil', 'Delegate, parent pointer, `[weak self]`'],
        ['`unowned`', 'Tidak', 'Non-optional', 'Crash bila diakses', 'Hubungan yang dijamin tidak mendahului pemiliknya'],
      ]),
      callout('tip', 'Mencari memory leak', 'Pasang `print` di `deinit` saat belajar. Di Xcode, gunakan **Debug Memory Graph** (tombol di debug bar) untuk melihat siapa menahan siapa, dan Instruments **Leaks** untuk sesi yang lebih panjang. Sumber leak paling umum: closure yang disimpan dan memakai `self`, delegate yang tidak `weak`, dan Timer/NotificationCenter observer yang tidak dilepas.'),
      ...quiz([
        ['SW-13', 'Apa keuntungan typed throws `throws(ValidasiError)` dibanding `throws` biasa, dan kapan sebaiknya tidak dipakai?', 'Pemanggil mendapat `error` bertipe konkret sehingga bisa switch exhaustive tanpa cast, dan cocok untuk kode embedded atau generic yang meneruskan error. Untuk API umum yang errornya bisa bertambah atau berasal dari banyak lapisan, `throws` biasa (any Error) tetap dianjurkan agar API tidak kaku saat berevolusi.'],
        ['SW-14', 'Apa beda `weak` dan `unowned`, dan risikonya masing-masing?', 'Keduanya tidak menambah hitungan referensi. `weak` selalu optional dan otomatis menjadi nil saat objek dibebaskan, jadi aman tetapi perlu dibuka. `unowned` non-optional; bila objek sudah dibebaskan lalu diakses, program crash. Pakai `unowned` hanya bila umur objek yang dirujuk dijamin sama atau lebih panjang.'],
        ['SW-15', 'Mengapa `try?` bisa menyembunyikan bug?', 'Karena semua error diubah menjadi nil tanpa jejak, sehingga penyebab kegagalan (jaringan, dekode, validasi) tidak terlihat dan tidak tercatat. Pakai `try?` hanya bila memang tidak peduli alasan gagal; selebihnya tangani dengan `do/catch` atau teruskan dengan `throws`.'],
      ]),
      ...practice('sw-error', [
        'Tulis `validasiPassword` dengan typed throws dan tambahkan aturan wajib angka; tangani semua case di switch exhaustive.',
        'Ubah satu fungsi `throws` menjadi versi yang mengembalikan `Result`, lalu bandingkan keterbacaan di sisi pemanggil.',
        'Reproduksi retain cycle `Pemilik` ↔ `Hewan` tanpa `weak` dan buktikan `deinit` tidak terpanggil; perbaiki lalu cek ulang.',
        'Implementasikan pola delegate `Pengunggah` dan pastikan objek delegate bisa dibebaskan saat layar ditutup.',
      ]),
      references(
        ['The Swift Programming Language: Error Handling', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/'],
        ['The Swift Programming Language: Automatic Reference Counting', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/'],
        ['Apple Developer: Result', 'https://developer.apple.com/documentation/swift/result'],
        ['Swift Evolution SE-0413: Typed throws', 'https://github.com/swiftlang/swift-evolution/blob/main/proposals/0413-typed-throws.md'],
      ),
    ],
  },
  {
    id: 'sw-async-await',
    title: 'Swift: async/await, Task & TaskGroup',
    summary: 'Fungsi async, async let untuk kerja paralel, Task dan Task.detached, TaskGroup, pembatalan kooperatif, continuation untuk API callback, dan AsyncSequence.',
    track: CONCURRENCY, source: swiftSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Sejak Swift 5.5, concurrency ditulis dengan `async`/`await` sebagai bagian dari bahasa, bukan library. Fungsi `async` bisa **suspend** di setiap `await`: thread-nya dilepas untuk pekerjaan lain, lalu fungsi dilanjutkan saat hasilnya siap. Kode yang dulu berupa callback bersarang dan `DispatchQueue` menjadi alur lurus yang bisa memakai `try`, `defer`, dan loop biasa.'),
      paragraph('Model ini **structured**: task anak yang dibuat lewat `async let` atau `TaskGroup` terikat ke scope pembuatnya. Scope tidak selesai sebelum semua anak selesai, error dari anak menjalar ke atas, dan pembatalan induk menjalar ke semua anak. Konsepnya sangat mirip `coroutineScope` di Kotlin (lihat [Kotlin Coroutines](#kotlin.kt-coroutines)).'),
      code('async, await, dan async let', `import Foundation

struct Profil: Sendable { let id: Int; let nama: String }

func muatProfil(id: Int) async throws -> Profil {
    try await Task.sleep(for: .milliseconds(300))   // simulasi jaringan; melempar CancellationError bila dibatalkan
    return Profil(id: id, nama: "Pengguna \\(id)")
}

func muatPesanan(idPengguna: Int) async throws -> [String] {
    try await Task.sleep(for: .milliseconds(500))
    return ["INV-001", "INV-002"]
}

// Berurutan: ±800 ms
func dasborLambat(id: Int) async throws -> (Profil, [String]) {
    let profil = try await muatProfil(id: id)
    let pesanan = try await muatPesanan(idPengguna: id)
    return (profil, pesanan)
}

// Paralel dengan async let: ±500 ms
func dasbor(id: Int) async throws -> (Profil, [String]) {
    async let profil = muatProfil(id: id)           // mulai berjalan sekarang
    async let pesanan = muatPesanan(idPengguna: id)
    return try await (profil, pesanan)              // tunggu keduanya; error salah satu membatalkan yang lain
}

@main
struct Program {
    static func main() async throws {               // entry point async
        let mulai = ContinuousClock.now
        let (p, inv) = try await dasbor(id: 7)
        print(p.nama, inv, ContinuousClock.now - mulai)
    }
}`, 'swift'),
      code('Task, TaskGroup, dan membatasi jumlah kerja paralel', `// Task: unit kerja asinkron dari konteks sinkron; mewarisi actor & prioritas pemanggil
let tugas = Task {
    try await muatProfil(id: 1)
}
let profil = try await tugas.value                  // tunggu hasil (atau error)

// Task.detached: tidak mewarisi actor/prioritas. Jarang dibutuhkan; utamakan Task biasa.
Task.detached(priority: .background) {
    print("bersih-bersih cache")
}

// TaskGroup: jumlah anak dinamis
func muatSemua(ids: [Int]) async throws -> [Profil] {
    try await withThrowingTaskGroup(of: Profil.self) { group in
        for id in ids {
            group.addTask { try await muatProfil(id: id) }
        }
        var hasil: [Profil] = []
        for try await p in group {                  // urutan selesai, bukan urutan id
            hasil.append(p)
        }
        return hasil.sorted { $0.id < $1.id }
    }
}

// Maksimal N request bersamaan (sliding window)
func muatBertahap(ids: [Int], maksimal: Int = 4) async throws -> [Profil] {
    try await withThrowingTaskGroup(of: Profil.self) { group in
        var sisa = ids.makeIterator()
        for _ in 0..<maksimal {
            guard let id = sisa.next() else { break }
            group.addTask { try await muatProfil(id: id) }
        }
        var hasil: [Profil] = []
        while let p = try await group.next() {
            hasil.append(p)
            if let id = sisa.next() {
                group.addTask { try await muatProfil(id: id) }
            }
        }
        return hasil
    }
}`, 'swift'),
      code('Pembatalan kooperatif dan continuation', `func prosesBerkas(_ berkas: [String]) async throws -> Int {
    var selesai = 0
    for _ in berkas {
        try Task.checkCancellation()                // lempar CancellationError bila sudah dibatalkan
        try await Task.sleep(for: .milliseconds(100))
        selesai += 1
    }
    return selesai
}

let t = Task { try await prosesBerkas(Array(repeating: "a.txt", count: 50)) }
try await Task.sleep(for: .milliseconds(250))
t.cancel()                                          // hanya menandai; kode di dalam harus mengecek
do {
    _ = try await t.value
} catch is CancellationError {
    print("dibatalkan")
}

// Menjembatani API lama berbasis callback ke async
func ambilLokasiLama(_ selesai: @escaping @Sendable (Result<String, Error>) -> Void) {
    selesai(.success("-6.2, 106.8"))
}

func lokasiSekarang() async throws -> String {
    try await withCheckedThrowingContinuation { lanjutan in
        ambilLokasiLama { hasil in
            lanjutan.resume(with: hasil)            // wajib resume tepat sekali
        }
    }
}

// AsyncSequence: nilai yang datang bertahap
func hitungMundur(dari n: Int) -> AsyncStream<Int> {
    AsyncStream { lanjutan in
        for i in stride(from: n, through: 0, by: -1) { lanjutan.yield(i) }
        lanjutan.finish()
    }
}
for await angka in hitungMundur(dari: 3) { print(angka) }   // 3 2 1 0`, 'swift'),
      table(['Kotlin Coroutines', 'Swift Concurrency', 'Catatan'], [
        ['`suspend fun`', '`func f() async`', 'Dipanggil dengan `await`'],
        ['`launch { }`', '`Task { }`', 'Unstructured; simpan referensinya bila perlu dibatalkan'],
        ['`async { }.await()`', '`async let x = ...` lalu `await x`', 'Structured, jumlah anak tetap'],
        ['`coroutineScope { }`', '`withTaskGroup` / `withThrowingTaskGroup`', 'Jumlah anak dinamis'],
        ['`job.cancel()` / `ensureActive()`', '`task.cancel()` / `Task.checkCancellation()`', 'Sama-sama kooperatif'],
        ['`delay(300)`', '`try await Task.sleep(for: .milliseconds(300))`', 'Tidak memblokir thread'],
        ['`Flow`', '`AsyncSequence` / `AsyncStream`', 'Dikonsumsi dengan `for await`'],
        ['`suspendCancellableCoroutine`', '`withCheckedThrowingContinuation`', 'Jembatan dari callback'],
      ]),
      callout('warn', 'Pembatalan tidak menghentikan kode secara paksa', '`cancel()` hanya memasang flag. Fungsi async dari sistem (`Task.sleep`, `URLSession.data`) akan melempar `CancellationError`, tetapi loop CPU milik Anda harus mengecek `Task.isCancelled` atau `Task.checkCancellation()` sendiri. Di SwiftUI, utamakan modifier `.task { }` yang otomatis membatalkan pekerjaan saat view menghilang, daripada `Task { }` di `onAppear`.'),
      ...quiz([
        ['SW-16', 'Apa beda `async let` dan `TaskGroup`?', 'Keduanya structured concurrency. `async let` cocok untuk jumlah pekerjaan yang tetap dan diketahui saat menulis kode (misalnya profil + pesanan), dengan tipe hasil berbeda-beda. `TaskGroup` untuk jumlah anak dinamis (misalnya satu task per id) dengan tipe hasil yang sama, dan memungkinkan pola seperti membatasi jumlah task bersamaan.'],
        ['SW-17', 'Mengapa `Task.detached` jarang dibutuhkan?', '`Task { }` sudah berjalan secara asinkron dan mewarisi actor, prioritas, dan task-local value dari konteks pembuatnya, yang biasanya justru diinginkan. `Task.detached` memutus semua warisan itu, sehingga lebih mudah menimbulkan bug isolasi. Pakai hanya bila memang harus lepas dari actor saat ini dan tidak bisa memakai fungsi `nonisolated` atau `@concurrent`.'],
        ['SW-18', 'Apa yang terjadi bila continuation tidak pernah di-resume, atau di-resume dua kali?', 'Tidak di-resume: task yang menunggu tergantung selamanya (leak); `withChecked...Continuation` mencetak peringatan runtime. Di-resume dua kali: crash dengan pesan error di versi checked. Pastikan setiap jalur callback (sukses, gagal, batal) memanggil `resume` tepat sekali.'],
      ]),
      ...practice('sw-async', [
        'Ukur perbedaan waktu `dasborLambat` vs `dasbor` memakai `ContinuousClock` dan jelaskan hasilnya.',
        'Implementasikan `muatBertahap` dan buktikan dengan log bahwa tidak pernah lebih dari 4 request berjalan bersamaan.',
        'Tambahkan timeout: jalankan `muatProfil` dan `Task.sleep(for: .seconds(2))` dalam TaskGroup, ambil yang pertama selesai, lalu `cancelAll()`.',
        'Bungkus satu API callback (misalnya `URLSession.dataTask` atau fungsi buatan sendiri) dengan `withCheckedThrowingContinuation`.',
      ]),
      references(
        ['The Swift Programming Language: Concurrency', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/'],
        ['Apple Developer: Task', 'https://developer.apple.com/documentation/swift/task'],
        ['Apple Developer: TaskGroup', 'https://developer.apple.com/documentation/swift/taskgroup'],
        ['Apple Developer: AsyncStream', 'https://developer.apple.com/documentation/swift/asyncstream'],
      ),
    ],
  },
  {
    id: 'sw-actor-sendable',
    title: 'Swift: Actor, Sendable & Strict Concurrency Swift 6',
    summary: 'Actor dan reentrancy, Sendable, @MainActor, nonisolated, Swift 6 language mode dengan data-race safety, perubahan Swift 6.2, dan strategi migrasi bertahap.',
    track: CONCURRENCY, source: swiftSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Data race terjadi saat dua thread mengakses memori yang sama bersamaan dan salah satunya menulis. **Swift 6 language mode** (rilis September 2024) mengubah pengecekan data race menjadi **error compile**, bukan crash acak di produksi. Alat utamanya: **actor** (objek yang state-nya hanya bisa disentuh satu task pada satu waktu), **Sendable** (penanda tipe yang aman dikirim antar-domain isolasi), dan **@MainActor** (isolasi ke main thread untuk UI).'),
      paragraph('Swift 6.2 (2025) menambahkan fitur "approachable concurrency": modul bisa diatur agar **default-nya diisolasi ke MainActor** (cocok untuk app yang mayoritas kodenya UI), dan fungsi async `nonisolated` bisa diatur agar berjalan di actor pemanggilnya, dengan atribut `@concurrent` untuk memindahkan kerja berat ke background secara eksplisit. Proyek baru di Xcode versi terbaru umumnya sudah mengaktifkan setelan ini; cek build settings proyek Anda.'),
      code('Actor dan reentrancy', `import Foundation

actor Rekening {
    private(set) var saldo = 0

    func setor(_ jumlah: Int) { saldo += jumlah }   // di dalam actor: akses sinkron

    func tarik(_ jumlah: Int) throws -> Int {
        guard saldo >= jumlah else { throw SaldoError.kurang }
        saldo -= jumlah
        return saldo
    }
}
enum SaldoError: Error { case kurang }

let rekening = Rekening()
await withTaskGroup(of: Void.self) { group in
    for _ in 0..<1_000 {
        group.addTask { await rekening.setor(1) }  // dari luar: wajib await
    }
}
print(await rekening.saldo)                         // selalu 1000, tanpa lock manual

func unduh(_ url: URL) async throws -> Data {
    try await URLSession.shared.data(from: url).0
}

actor CacheGambar {
    private var cache: [URL: Data] = [:]
    private var sedangMuat: [URL: Task<Data, Error>] = [:]

    func gambar(dari url: URL) async throws -> Data {
        if let data = cache[url] { return data }
        if let tugas = sedangMuat[url] { return try await tugas.value }   // gabung ke unduhan yang sama
        let tugas = Task { try await unduh(url) }
        sedangMuat[url] = tugas
        defer { sedangMuat[url] = nil }
        let data = try await tugas.value            // titik suspend: actor bisa melayani panggilan lain di sini
        cache[url] = data                           // jangan berasumsi state sama seperti sebelum await
        return data
    }
}`, 'swift'),
      code('Sendable, @MainActor, dan nonisolated', `import Foundation
import Synchronization                              // Mutex: iOS 18 / macOS 15 ke atas

struct Pesanan: Sendable {                          // struct berisi field Sendable → aman dikirim
    let id: UUID
    let total: Int
}

final class Konfigurasi: Sendable {                 // class Sendable: final + hanya let bertipe Sendable
    let baseURL: URL
    init(baseURL: URL) { self.baseURL = baseURL }
}

final class Penghitung: Sendable {                  // state mutable dilindungi Mutex
    private let nilai = Mutex(0)
    func naik() -> Int { nilai.withLock { $0 += 1; return $0 } }
}

final class TokenLama: @unchecked Sendable {        // janji manual: Anda sendiri yang menjamin aman
    private let kunci = NSLock()
    private var token: String?
    func set(_ t: String) { kunci.withLock { token = t } }
}

@MainActor
final class PengaturanStore {                       // seluruh state & method di main thread
    var tema = "terang"
    nonisolated let versi = "1.0"                   // let Sendable boleh dibaca dari mana saja

    func ganti(tema baru: String) { tema = baru }

    nonisolated func hitungHash(_ s: String) -> Int {   // tidak menyentuh state actor
        s.hashValue
    }
}

func dariBackground(store: PengaturanStore) async {
    await store.ganti(tema: "gelap")                // lompat ke MainActor: perlu await
    print(store.versi, store.hitungHash("x"))       // nonisolated: tanpa await
}`, 'swift'),
      code('Error khas Swift 6 language mode', `// 1. Global mutable state
var jumlahPanggilan = 0          // error Swift 6: var global tidak concurrency-safe
// Perbaikan: let, @MainActor var, bungkus dalam actor/Mutex,
// atau nonisolated(unsafe) var (hanya bila Anda benar-benar menjamin aksesnya aman)

// 2. Mengirim objek non-Sendable ke task lain lalu memakainya lagi
final class Keranjang { var item: [String] = [] }
func contoh() async {
    let k = Keranjang()
    Task { k.item.append("kopi") }   // k dikirim ke task baru ...
    print(k.item)                    // error: k dipakai lagi setelah dikirim (risiko data race)
}
// Tanpa baris print, kode di atas lolos: region-based isolation (Swift 6) tahu k tidak dipakai bersama.`, 'swift'),
      code('Migrasi per target di Package.swift', `// swift-tools-version: 6.0
// Tools 6.x: semua target memakai Swift 6 language mode secara default.
import PackageDescription

let package = Package(
    name: "Toko",
    platforms: [.iOS(.v17), .macOS(.v14)],
    targets: [
        .target(name: "TokoCore"),                                    // sudah bersih di mode 6
        .target(
            name: "FiturLama",
            swiftSettings: [.swiftLanguageMode(.v5)]                  // belum siap: tetap mode 5 dulu
        ),
        .testTarget(name: "TokoCoreTests", dependencies: ["TokoCore"]),
    ]
)
// Swift 6.2 (tools 6.2): target app/UI bisa menambah swiftSettings: [.defaultIsolation(MainActor.self)]`, 'swift'),
      table(['Pesan / situasi', 'Arti', 'Perbaikan umum'], [
        ['Global/static `var` tidak concurrency-safe', 'State bersama tanpa isolasi', 'Jadikan `let`, isolasi `@MainActor`, atau pindahkan ke actor'],
        ['Mengirim nilai non-Sendable melewati batas isolasi', 'Objek bisa diakses dua domain bersamaan', 'Jadikan struct/`Sendable`, salin data yang diperlukan, atau jangan pakai lagi setelah dikirim'],
        ['Memanggil method `@MainActor` dari konteks sinkron non-isolated', 'Perlu lompat ke main actor', 'Tandai pemanggil `@MainActor`, atau `await` dari konteks async'],
        ['Library lama belum beranotasi Sendable', 'Peringatan dari modul pihak ketiga', '`@preconcurrency import NamaModul` sementara, sambil menunggu update'],
        ['Subclass/delegate UIKit memicu error isolasi', 'API UI memang `@MainActor`', 'Tandai class Anda `@MainActor`'],
      ]),
      callout('tip', 'Strategi migrasi bertahap', '1) Perbarui ke Xcode/toolchain terbaru. 2) Dalam Swift 5 mode, set **Strict Concurrency Checking** (build setting `SWIFT_STRICT_CONCURRENCY`) ke `Complete` per modul dan bereskan peringatannya. 3) Mulai dari modul paling bawah (model, utilitas) lalu naik ke UI. 4) Ganti ke **Swift Language Version 6** per target setelah peringatan habis. 5) Hindari menambal dengan `@unchecked Sendable` dan `nonisolated(unsafe)` kecuali Anda bisa menjelaskan mengapa aman. Panduan resmi: [Swift 6 Migration Guide](https://www.swift.org/migration/documentation/migrationguide/).'),
      ...quiz([
        ['SW-19', 'Mengapa state actor bisa berubah di antara dua baris yang dipisah `await` di dalam method actor yang sama?', 'Actor bersifat **reentrant**: saat method suspend di `await`, actor boleh menjalankan panggilan lain yang antre. Jadi asumsi yang dicek sebelum `await` (misalnya "cache belum berisi url ini") bisa sudah tidak berlaku setelahnya. Cek ulang state setelah `await`, atau simpan `Task` yang sedang berjalan seperti pada `CacheGambar` agar pekerjaan tidak ganda.'],
        ['SW-20', 'Kapan sebuah struct otomatis Sendable, dan kapan perlu ditulis eksplisit?', 'Struct dan enum non-public yang semua properti/associated value-nya Sendable dianggap Sendable secara implisit di dalam modulnya. Untuk tipe `public` yang dipakai modul lain, tulis `: Sendable` secara eksplisit karena conformance implisit tidak diekspor. Class hanya Sendable bila `final`, propertinya `let` bertipe Sendable, atau dilindungi isolasi actor.'],
        ['SW-21', 'Apa beda `@MainActor` pada class dan `nonisolated` pada salah satu method-nya?', '`@MainActor` pada class mengisolasi semua properti dan method ke main actor, sehingga pemanggil dari luar main actor wajib `await`. `nonisolated` mengecualikan satu anggota dari isolasi itu: boleh dipanggil dari mana saja tanpa `await`, tetapi tidak boleh menyentuh state yang diisolasi.'],
      ]),
      ...practice('sw-actor', [
        'Tulis `Rekening` sebagai class biasa dengan 1.000 task yang menyetor bersamaan, jalankan dengan Thread Sanitizer, lalu ubah menjadi actor dan bandingkan.',
        'Implementasikan `CacheGambar` dan buktikan dengan log bahwa 10 permintaan url yang sama hanya memicu satu unduhan.',
        'Aktifkan Swift 6 language mode di satu package kecil, catat setiap error concurrency, dan perbaiki tanpa `@unchecked Sendable`.',
        'Di proyek Xcode, coba setelan Default Actor Isolation = MainActor (Swift 6.2+), lalu tandai satu fungsi berat dengan `@concurrent` dan ukur dampaknya ke UI.',
      ]),
      references(
        ['Swift.org: Swift 6 Migration Guide', 'https://www.swift.org/migration/documentation/migrationguide/'],
        ['The Swift Programming Language: Concurrency (actors, Sendable)', 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/'],
        ['Apple Developer: Sendable', 'https://developer.apple.com/documentation/swift/sendable'],
        ['Apple Developer: MainActor', 'https://developer.apple.com/documentation/swift/mainactor'],
        ['Swift.org blog: Swift 6.2 Released', 'https://www.swift.org/blog/swift-6.2-released/'],
      ),
    ],
  },
  {
    id: 'sw-swiftui-dasar',
    title: 'SwiftUI: View, Modifier, Layout & List',
    summary: 'Struktur App dan View, body sebagai some View, modifier dan urutannya, VStack/HStack/ZStack, Spacer, ViewModifier kustom, List, Section, dan #Preview.',
    track: SWIFTUI, source: swiftSource, duration: '2,5 jam', level: 'Easy',
    blocks: [
      paragraph('SwiftUI adalah framework UI **deklaratif** dari Apple (sejak iOS 13): Anda mendeskripsikan tampilan sebagai fungsi dari state, dan SwiftUI yang memperbarui layar saat state berubah. Setiap komponen adalah struct yang conform ke protocol `View` dengan satu properti `body`. View di SwiftUI ringan dan sering dibuat ulang, jadi jangan menyimpan pekerjaan berat di `body`.'),
      paragraph('Tampilan dibentuk dengan menyusun view kecil (`Text`, `Image`, `Button`) di dalam container layout (`VStack`, `HStack`, `ZStack`, `List`) lalu menghiasnya dengan **modifier** seperti `.padding()` dan `.font()`. Setiap modifier membungkus view sebelumnya menjadi view baru, sehingga **urutan modifier berpengaruh** ke hasil. Bagi yang pernah memakai Flutter atau Compose, polanya sangat mirip (lihat [Jetpack Compose](#kotlin.kt-compose-dasar) dan [Widget & Layout Flutter](#flutter.widget-layout-rendering)).'),
      code('App, View, stack, dan #Preview', `import SwiftUI

@main
struct TokoApp: App {
    var body: some Scene {
        WindowGroup {
            BerandaView()
        }
    }
}

struct BerandaView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Halo, SwiftUI")
                .font(.largeTitle.bold())
            Text("Belanja kebutuhan harian dengan cepat.")
                .foregroundStyle(.secondary)

            HStack {
                Image(systemName: "cart.fill")       // ikon SF Symbols bawaan
                    .foregroundStyle(.orange)
                Text("3 item di keranjang")
                Spacer()                             // dorong elemen berikutnya ke kanan
                Text("Rp75.000")
                    .monospacedDigit()
                    .bold()
            }
            .padding()
            .background(.orange.opacity(0.1), in: .rect(cornerRadius: 12))

            ZStack(alignment: .topTrailing) {        // tumpuk di sumbu z
                Image(systemName: "bell")
                    .font(.title)
                Circle().fill(.red).frame(width: 10, height: 10)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {                                           // pratinjau langsung di canvas Xcode
    BerandaView()
}`, 'swift'),
      code('Urutan modifier, komposisi, dan ViewModifier kustom', `struct ContohModifier: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("A").padding().background(.yellow)  // latar mencakup area padding
            Text("B").background(.yellow).padding()  // latar hanya di belakang teks
            KartuProduk(nama: "Kopi Susu", harga: 25_000)
        }
    }
}

struct KartuProduk: View {                           // pecah UI menjadi view kecil yang dipakai ulang
    let nama: String
    let harga: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(nama).font(.headline)
            Text("Rp\\(harga)").foregroundStyle(.secondary)
        }
        .kartu()
    }
}

struct GayaKartu: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.background, in: .rect(cornerRadius: 16))
            .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
    }
}

extension View {
    func kartu() -> some View { modifier(GayaKartu()) }
}`, 'swift'),
      code('List, Section, ForEach, dan swipe action', `struct Produk: Identifiable {
    let id = UUID()
    let nama: String
    let harga: Int
    let minuman: Bool
}

struct DaftarProdukView: View {
    let produk: [Produk] = [
        Produk(nama: "Kopi Susu", harga: 25_000, minuman: true),
        Produk(nama: "Teh Tarik", harga: 18_000, minuman: true),
        Produk(nama: "Roti Bakar", harga: 22_000, minuman: false),
    ]

    var body: some View {
        List {
            Section("Minuman") {
                ForEach(produk.filter(\\.minuman)) { p in   // Identifiable → tidak perlu id:
                    BarisProduk(produk: p)
                }
            }
            Section("Makanan") {
                ForEach(produk.filter { !$0.minuman }) { p in
                    BarisProduk(produk: p)
                        .swipeActions {
                            Button("Favorit", systemImage: "star") { print("favorit \\(p.nama)") }
                                .tint(.orange)
                        }
                }
            }
        }
        .listStyle(.insetGrouped)
    }
}

struct BarisProduk: View {
    let produk: Produk
    var body: some View {
        LabeledContent(produk.nama, value: "Rp\\(produk.harga)")
    }
}`, 'swift'),
      table(['SwiftUI', 'Jetpack Compose', 'Flutter'], [
        ['`struct X: View { var body }`', '`@Composable fun X()`', '`class X extends StatelessWidget`'],
        ['`VStack` / `HStack` / `ZStack`', '`Column` / `Row` / `Box`', '`Column` / `Row` / `Stack`'],
        ['`Spacer()`', '`Spacer(Modifier.weight(1f))`', '`Spacer()` / `Expanded`'],
        ['Modifier berantai `.padding()`', '`Modifier.padding()`', 'Widget pembungkus `Padding(...)`'],
        ['`List` + `ForEach`', '`LazyColumn` + `items`', '`ListView.builder`'],
        ['`#Preview { }`', '`@Preview`', 'Hot reload'],
      ]),
      callout('tip', 'Menjaga body tetap ringan', '`body` bisa dipanggil berkali-kali setiap state berubah. Jangan memformat data besar, memanggil jaringan, atau membuat objek mahal di dalamnya. Pecah view besar menjadi struct kecil agar SwiftUI hanya menghitung ulang bagian yang datanya berubah, dan pakai `LazyVStack` di dalam `ScrollView` atau `List` untuk daftar panjang.'),
      ...quiz([
        ['SW-22', 'Mengapa `Text("A").padding().background(.yellow)` dan `Text("B").background(.yellow).padding()` berbeda tampilannya?', 'Setiap modifier membungkus view sebelumnya. Pada A, padding diterapkan dulu sehingga view hasilnya lebih besar, lalu latar mewarnai seluruh area itu. Pada B, latar hanya mewarnai teks, lalu padding menambah ruang kosong transparan di luar latar.'],
        ['SW-23', 'Mengapa tipe `body` ditulis `some View`, bukan tipe konkret?', 'Tipe konkret hasil komposisi modifier sangat panjang (misalnya `ModifiedContent<ModifiedContent<Text, _PaddingLayout>, _BackgroundStyleModifier<...>>`). `some View` adalah opaque type: compiler tetap tahu tipe konkretnya untuk optimasi, tetapi Anda tidak perlu menuliskannya.'],
      ]),
      ...practice('sw-swiftui-dasar', [
        'Buat proyek iOS App di Xcode (interface SwiftUI) dan tampilkan `BerandaView` di Simulator serta canvas `#Preview`.',
        'Buat layar profil: foto bulat (`Image` + `.clipShape(.circle)`), nama, bio, dan tiga statistik dalam `HStack` yang rata.',
        'Tampilkan daftar produk dengan dua `Section`, swipe action, dan pencarian sederhana memakai `.searchable(text:)`.',
        'Buat `ViewModifier` gaya tombol utama dan pakai di tiga tempat berbeda.',
      ]),
      references(
        ['Apple Developer: SwiftUI', 'https://developer.apple.com/documentation/swiftui'],
        ['Apple Developer: SwiftUI Tutorials', 'https://developer.apple.com/tutorials/swiftui'],
        ['Apple Developer: Building layouts with stack views', 'https://developer.apple.com/documentation/swiftui/building-layouts-with-stack-views'],
        ['Apple Developer: List', 'https://developer.apple.com/documentation/swiftui/list'],
      ),
    ],
  },
  {
    id: 'sw-swiftui-state',
    title: 'SwiftUI: State, Data Flow & Navigasi',
    summary: '@State, @Binding, @Observable, @Bindable, @Environment, perbandingan dengan ObservableObject lama, dan navigasi berbasis data dengan NavigationStack.',
    track: SWIFTUI, source: swiftSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Di SwiftUI, UI adalah fungsi dari state: ubah datanya, dan SwiftUI menggambar ulang bagian yang terdampak. Kuncinya adalah memiliki **satu sumber kebenaran** (source of truth) untuk setiap data. State lokal dan sederhana disimpan dengan `@State`; view anak yang perlu mengubahnya menerima `@Binding`. Model yang lebih besar ditulis sebagai class dengan macro **`@Observable`** (Observation framework, iOS 17+), yang membuat SwiftUI hanya memperbarui view yang benar-benar membaca properti yang berubah.'),
      paragraph('Navigasi modern memakai **`NavigationStack`** (iOS 16+) yang berbasis data: Anda menumpuk nilai (rute) ke sebuah array `path`, dan `navigationDestination(for:)` menentukan layar untuk tiap tipe nilai. Pola ini memudahkan deep link, kembali ke root, dan pengujian.'),
      code('@State dan @Binding', `import SwiftUI

struct PenghitungView: View {
    @State private var jumlah = 0                // milik view ini; selalu private

    var body: some View {
        VStack(spacing: 16) {
            Text("\\(jumlah)")
                .font(.system(size: 48, weight: .bold))
            Stepper("Jumlah", value: $jumlah, in: 0...10)   // $jumlah = Binding<Int>
            TombolReset(jumlah: $jumlah)
        }
        .padding()
    }
}

struct TombolReset: View {
    @Binding var jumlah: Int                     // bukan pemilik; membaca & menulis milik induk

    var body: some View {
        Button("Reset", role: .destructive) { jumlah = 0 }
            .disabled(jumlah == 0)
    }
}

#Preview { PenghitungView() }`, 'swift'),
      code('@Observable, @Environment, dan @Bindable', `import SwiftUI
import Observation

struct ItemKeranjang: Identifiable {
    let id = UUID()
    let nama: String
    let harga: Int
    var jumlah: Int
}

@Observable
final class Keranjang {
    var item: [ItemKeranjang] = []
    var catatan = ""
    var total: Int { item.reduce(0) { $0 + $1.harga * $1.jumlah } }

    func tambah(nama: String, harga: Int) {
        if let i = item.firstIndex(where: { $0.nama == nama }) {
            item[i].jumlah += 1
        } else {
            item.append(ItemKeranjang(nama: nama, harga: harga, jumlah: 1))
        }
    }
}

struct TokoRootView: View {
    @State private var keranjang = Keranjang()   // pemilik objek: simpan dengan @State

    var body: some View {
        KatalogView()                            // KatalogView sudah punya NavigationStack sendiri
            .environment(keranjang)              // sediakan untuk seluruh subtree
    }
}

struct RingkasanKeranjang: View {
    @Environment(Keranjang.self) private var keranjang   // ambil dari environment

    var body: some View {
        Text("Total: Rp\\(keranjang.total)")      // hanya diperbarui bila item berubah
    }
}

struct CatatanKeranjangView: View {
    @Bindable var keranjang: Keranjang           // butuh $ binding ke properti objek @Observable
    @Environment(\\.dismiss) private var tutup   // nilai environment bawaan

    var body: some View {
        Form {
            TextField("Catatan untuk penjual", text: $keranjang.catatan)
            Button("Simpan") { tutup() }
        }
    }
}`, 'swift'),
      code('NavigationStack berbasis data', `enum Rute: Hashable {
    case produk(nama: String)
    case keranjang
    case catatan
}

struct KatalogView: View {
    @Environment(Keranjang.self) private var keranjang
    @State private var path: [Rute] = []
    private let katalog = ["Kopi Susu", "Teh Tarik", "Roti Bakar"]

    var body: some View {
        NavigationStack(path: $path) {
            List(katalog, id: \\.self) { nama in
                NavigationLink(nama, value: Rute.produk(nama: nama))   // push dengan nilai
            }
            .navigationTitle("Katalog")
            .toolbar {
                Button("Keranjang", systemImage: "cart") { path.append(.keranjang) }
            }
            .navigationDestination(for: Rute.self) { rute in
                switch rute {
                case .produk(let nama):
                    Button("Tambah \\(nama)") { keranjang.tambah(nama: nama, harga: 20_000) }
                case .keranjang:
                    VStack {
                        RingkasanKeranjang()
                        Button("Tulis catatan") { path.append(.catatan) }
                        Button("Kembali ke katalog") { path.removeAll() }   // pop ke root
                    }
                case .catatan:
                    CatatanKeranjangView(keranjang: keranjang)
                }
            }
        }
    }
}`, 'swift'),
      table(['Kebutuhan', 'API modern (iOS 17+)', 'API lama (iOS 13–16)'], [
        ['State nilai sederhana milik view', '`@State private var`', '`@State`'],
        ['Anak mengubah state induk', '`@Binding`', '`@Binding`'],
        ['Model class yang diamati', '`@Observable final class`', '`ObservableObject` + `@Published`'],
        ['View memiliki objek model', '`@State private var model = Model()`', '`@StateObject`'],
        ['View menerima objek model', 'Properti biasa (`let model`), atau `@Bindable` bila butuh `$`', '`@ObservedObject`'],
        ['Objek bersama di subtree', '`.environment(model)` + `@Environment(Model.self)`', '`.environmentObject` + `@EnvironmentObject`'],
        ['Navigasi', '`NavigationStack` + `navigationDestination(for:)`', '`NavigationView` (deprecated)'],
      ]),
      callout('warn', 'Jangan membuat objek model di init view tanpa @State', 'Menulis `let keranjang = Keranjang()` sebagai properti view membuat objek baru setiap kali view induk dihitung ulang, sehingga state hilang. View yang **membuat** objek harus menyimpannya dengan `@State`; view yang hanya **menerima** objek cukup memakai properti biasa atau `@Bindable`. Untuk proyek yang masih mendukung iOS 16 ke bawah, pakai pola `ObservableObject` lama.'),
      ...quiz([
        ['SW-24', 'Apa keunggulan `@Observable` dibanding `ObservableObject` + `@Published`?', 'Dengan `@Observable`, SwiftUI melacak properti mana yang benar-benar dibaca oleh setiap `body`, sehingga view hanya dihitung ulang bila properti itu berubah. Pada `ObservableObject`, perubahan satu `@Published` memicu semua view yang mengamati objek itu. Sintaksnya juga lebih sederhana: tidak perlu `@Published`, `@StateObject`, atau `@ObservedObject`.'],
        ['SW-25', 'Kapan memakai `@Binding` dan kapan `@Bindable`?', '`@Binding` adalah referensi baca-tulis ke sebuah nilai milik view lain (misalnya `Int` dari `@State` induk). `@Bindable` dipakai pada objek `@Observable` untuk membuat binding ke propertinya, misalnya `$keranjang.catatan` untuk `TextField`.'],
        ['SW-26', 'Mengapa navigasi berbasis `path` lebih mudah diuji dan dipakai untuk deep link?', 'Karena tumpukan layar direpresentasikan sebagai data biasa (`[Rute]`). Deep link cukup mengisi array, kembali ke root cukup `removeAll()`, dan logika navigasi bisa dipindah ke model lalu diuji tanpa UI.'],
      ]),
      ...practice('sw-swiftui-state', [
        'Buat `PenghitungView` dengan `TombolReset` dan pastikan tombol nonaktif saat nilainya 0.',
        'Implementasikan `Keranjang` dengan `@Observable`, sediakan lewat `.environment`, dan tampilkan badge jumlah item di toolbar.',
        'Tambahkan layar detail produk lewat `NavigationStack(path:)` dan tombol yang langsung membuka keranjang dari detail.',
        'Simpan `path` di model `@Observable` terpisah dan tulis fungsi `bukaDeepLink(_ url: URL)` yang mengisi rute.',
      ]),
      references(
        ['Apple Developer: Managing model data in your app', 'https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app'],
        ['Apple Developer: Migrating from ObservableObject to the Observable macro', 'https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro'],
        ['Apple Developer: NavigationStack', 'https://developer.apple.com/documentation/swiftui/navigationstack'],
        ['Apple Developer: Observation', 'https://developer.apple.com/documentation/observation'],
      ),
    ],
  },
  {
    id: 'sw-networking-swiftdata',
    title: 'SwiftUI: Networking (URLSession + Codable) & SwiftData',
    summary: 'Model Codable dengan CodingKeys, klien API berbasis URLSession async, memuat data dengan .task, lalu persistence lokal dengan SwiftData: @Model, modelContainer, @Query, dan FetchDescriptor.',
    track: SWIFTUI, source: swiftSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Hampir setiap aplikasi mengambil data dari API. Di Swift modern, cukup kombinasi **URLSession** dengan async/await dan **Codable** untuk mengubah JSON menjadi struct, tanpa library pihak ketiga. Untuk data yang perlu tersimpan di perangkat (cache, catatan, draft), Apple menyediakan **SwiftData** (iOS 17+): model ditulis sebagai class biasa dengan macro `@Model`, dan view membacanya dengan `@Query` yang otomatis memperbarui UI.'),
      code('Model Codable dan klien API', `import Foundation

struct Artikel: Codable, Identifiable, Hashable, Sendable {
    let id: Int
    let judul: String
    let isi: String
    let diterbitkanPada: Date

    enum CodingKeys: String, CodingKey {         // petakan nama JSON ke nama properti
        case id, isi
        case judul = "title"
        case diterbitkanPada = "published_at"
    }
}

struct ArtikelBaru: Encodable, Sendable { let title: String; let isi: String }

enum APIError: Error {
    case statusTidakValid(Int)
}

struct ArtikelAPI: Sendable {
    let baseURL: URL
    var session: URLSession = .shared

    func daftar(halaman: Int = 1) async throws -> [Artikel] {
        let url = baseURL
            .appending(path: "artikel")
            .appending(queryItems: [URLQueryItem(name: "page", value: String(halaman))])
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 15

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw APIError.statusTidakValid((response as? HTTPURLResponse)?.statusCode ?? -1)
        }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([Artikel].self, from: data)
    }

    func buat(_ baru: ArtikelBaru, token: String) async throws {
        var request = URLRequest(url: baseURL.appending(path: "artikel"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \\(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONEncoder().encode(baru)
        let (_, response) = try await session.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 201 else {
            throw APIError.statusTidakValid((response as? HTTPURLResponse)?.statusCode ?? -1)
        }
    }
}`, 'swift'),
      code('Memuat data di view dengan .task dan .refreshable', `import SwiftUI

struct ArtikelListView: View {
    let api: ArtikelAPI
    @State private var artikel: [Artikel] = []
    @State private var pesanError: String?

    var body: some View {
        List(artikel) { a in
            VStack(alignment: .leading) {
                Text(a.judul).font(.headline)
                Text(a.diterbitkanPada, style: .date).font(.caption)
            }
        }
        .overlay {
            if let pesanError {
                ContentUnavailableView("Gagal memuat", systemImage: "wifi.slash",
                                       description: Text(pesanError))
            }
        }
        .task { await muat() }                   // jalan saat view muncul, dibatalkan saat hilang
        .refreshable { await muat() }            // tarik untuk memuat ulang
    }

    private func muat() async {
        do {
            artikel = try await api.daftar()
            pesanError = nil
        } catch is CancellationError {
            // view ditutup: abaikan
        } catch {
            pesanError = error.localizedDescription
        }
    }
}`, 'swift'),
      code('SwiftData: @Model, modelContainer, @Query, insert/delete, FetchDescriptor', `import SwiftUI
import SwiftData

@Model
final class Catatan {
    var judul: String
    var isi: String
    var dibuatPada: Date
    var selesai: Bool
    @Relationship(deleteRule: .cascade) var lampiran: [Lampiran] = []   // hapus catatan → hapus lampiran

    init(judul: String, isi: String = "", dibuatPada: Date = .now, selesai: Bool = false) {
        self.judul = judul
        self.isi = isi
        self.dibuatPada = dibuatPada
        self.selesai = selesai
    }
}

@Model
final class Lampiran {
    var nama: String
    var catatan: Catatan?                        // inverse relationship diinferensi
    init(nama: String) { self.nama = nama }
}

@main
struct CatatanApp: App {
    var body: some Scene {
        WindowGroup { CatatanListView() }
            .modelContainer(for: Catatan.self)   // buat store SQLite & sediakan ModelContext
    }
}

struct CatatanListView: View {
    @Environment(\\.modelContext) private var context
    @Query(filter: #Predicate<Catatan> { !$0.selesai },
           sort: \\Catatan.dibuatPada, order: .reverse)
    private var catatan: [Catatan]               // otomatis diperbarui saat data berubah

    var body: some View {
        NavigationStack {
            List {
                ForEach(catatan) { c in
                    Toggle(c.judul, isOn: Bindable(c).selesai)   // @Model juga Observable
                }
                .onDelete { indeks in
                    for i in indeks { context.delete(catatan[i]) }
                }
            }
            .navigationTitle("Catatan")
            .toolbar {
                Button("Tambah", systemImage: "plus") {
                    context.insert(Catatan(judul: "Catatan baru"))   // autosave aktif secara default
                }
            }
        }
    }
}

// Di luar view (misalnya service): FetchDescriptor
func cari(_ kata: String, di context: ModelContext) throws -> [Catatan] {
    let descriptor = FetchDescriptor<Catatan>(
        predicate: #Predicate { $0.judul.localizedStandardContains(kata) },
        sortBy: [SortDescriptor(\\.dibuatPada, order: .reverse)]
    )
    return try context.fetch(descriptor)
}

#Preview {
    CatatanListView()
        .modelContainer(for: Catatan.self, inMemory: true)   // data preview tidak menyentuh disk
}`, 'swift'),
      table(['Penyimpanan', 'Cocok untuk', 'Catatan'], [
        ['`UserDefaults` / `@AppStorage`', 'Preferensi kecil (tema, flag onboarding)', 'Bukan untuk data besar atau rahasia'],
        ['Keychain', 'Token, password, kunci API', 'Terenkripsi; pakai `Security` framework atau wrapper'],
        ['File (`FileManager`, `Codable` → JSON)', 'Cache respons, dokumen, gambar', 'Simpan di Caches bila boleh dihapus sistem'],
        ['SwiftData', 'Data terstruktur dengan relasi & query (iOS 17+)', 'Integrasi langsung dengan SwiftUI lewat `@Query`'],
        ['Core Data', 'Proyek lama atau butuh fitur yang belum ada di SwiftData', 'SwiftData dibangun di atas teknologi yang sama'],
        ['Padanan Flutter / Android', '`shared_preferences`, Drift/Isar · DataStore, Room', 'Lihat [Penyimpanan Lokal Flutter](#flutter.penyimpanan-lokal-database)'],
      ]),
      callout('warn', 'Keamanan jaringan & data', 'App Transport Security memblokir HTTP polos secara default; gunakan HTTPS. Jangan simpan token di `UserDefaults` karena tidak terenkripsi; gunakan Keychain. Tangani status HTTP selain 2xx secara eksplisit, karena `URLSession` tidak melempar error untuk 404 atau 500, hanya untuk kegagalan transport.'),
      ...quiz([
        ['SW-27', 'Mengapa `try await session.data(for:)` tidak melempar error untuk respons 404?', 'Dari sisi transport, request berhasil: server menjawab dengan status 404. `URLSession` hanya melempar error untuk kegagalan seperti tidak ada koneksi, timeout, atau pembatalan. Status HTTP harus dicek manual lewat `HTTPURLResponse.statusCode`.'],
        ['SW-28', 'Apa peran `@Query` dan `ModelContext` di SwiftData?', '`@Query` adalah property wrapper untuk view yang mengambil model sesuai filter dan urutan, lalu otomatis memperbarui view saat data berubah. `ModelContext` (diambil dari `@Environment(\\.modelContext)`) adalah tempat melakukan perubahan: `insert`, `delete`, `fetch`, dan `save`. Autosave aktif secara default pada context utama.'],
      ]),
      ...practice('sw-network-data', [
        'Pakai API publik (misalnya JSONPlaceholder) untuk menampilkan daftar post dengan `ArtikelAPI`, state memuat, error, dan pull-to-refresh.',
        'Tambahkan dekode tanggal ISO 8601 dan properti opsional, lalu uji dengan JSON yang field-nya hilang.',
        'Buat aplikasi catatan dengan SwiftData: tambah, tandai selesai, hapus, dan filter yang sudah selesai.',
        'Simpan hasil API ke SwiftData sebagai cache offline dan tampilkan data cache saat tidak ada koneksi.',
      ]),
      references(
        ['Apple Developer: URLSession', 'https://developer.apple.com/documentation/foundation/urlsession'],
        ['Apple Developer: Encoding and Decoding Custom Types', 'https://developer.apple.com/documentation/foundation/encoding-and-decoding-custom-types'],
        ['Apple Developer: SwiftData', 'https://developer.apple.com/documentation/swiftdata'],
        ['Apple Developer: Preserving your app’s model data across launches', 'https://developer.apple.com/documentation/swiftdata/preserving-your-apps-model-data-across-launches'],
      ),
    ],
  },
  {
    id: 'sw-testing-mvvm-rilis',
    title: 'SwiftUI: Testing, Arsitektur MVVM & Rilis ke App Store',
    summary: 'MVVM dengan @Observable dan dependency injection lewat protocol, Swift Testing (@Test, #expect, parameterized test) dan XCTest, CI dengan xcodebuild, lalu TestFlight dan App Store.',
    track: SWIFTUI, source: swiftSource, duration: '3,5 jam', level: 'Hard',
    blocks: [
      paragraph('Agar aplikasi bisa diuji, pisahkan logika dari view. Pola yang paling umum di SwiftUI adalah **MVVM**: view hanya menampilkan state dan meneruskan aksi, **ViewModel** (class `@Observable` yang diisolasi ke `@MainActor`) memegang state layar dan logika, dan akses data disembunyikan di balik **protocol** agar bisa diganti versi palsu saat test. Jangan berlebihan: view kecil yang hanya menampilkan data tidak butuh ViewModel.'),
      paragraph('Untuk pengujian, Apple memperkenalkan **Swift Testing** (Xcode 16 / Swift 6, 2024) dengan `@Test`, `#expect`, dan `#require` yang lebih ringkas dari XCTest dan mendukung parameterized test serta eksekusi paralel. XCTest tetap didukung dan masih dipakai untuk UI test (`XCUIApplication`) dan performance test. Setelah teruji, aplikasi didistribusikan ke penguji lewat **TestFlight** lalu dikirim ke **App Review** sebelum tayang di App Store.'),
      code('MVVM dengan @Observable dan dependency injection', `import SwiftUI

protocol ArtikelRepository: Sendable {
    func daftar(halaman: Int) async throws -> [Artikel]
}

extension ArtikelAPI: ArtikelRepository {}      // implementasi asli dari modul networking

@MainActor
@Observable
final class ArtikelViewModel {
    enum Status: Equatable { case idle, memuat, sukses, gagal(String) }

    private(set) var artikel: [Artikel] = []
    private(set) var status: Status = .idle
    private let repo: any ArtikelRepository

    init(repo: any ArtikelRepository) { self.repo = repo }

    func muat() async {
        status = .memuat
        do {
            artikel = try await repo.daftar(halaman: 1)
            status = .sukses
        } catch {
            status = .gagal("Tidak bisa memuat artikel")
        }
    }
}

struct ArtikelScreen: View {
    @State private var vm: ArtikelViewModel

    init(repo: any ArtikelRepository) {
        _vm = State(initialValue: ArtikelViewModel(repo: repo))
    }

    var body: some View {
        Group {
            switch vm.status {
            case .idle, .memuat: ProgressView()
            case .gagal(let pesan): ContentUnavailableView(pesan, systemImage: "exclamationmark.triangle")
            case .sukses: List(vm.artikel) { Text($0.judul) }
            }
        }
        .task { await vm.muat() }
    }
}`, 'swift'),
      code('Swift Testing: @Test, #expect, #require, parameterized', `import Testing
import Foundation
@testable import Toko

struct RepoPalsu: ArtikelRepository {
    var hasil: Result<[Artikel], any Error>
    func daftar(halaman: Int) async throws -> [Artikel] { try hasil.get() }
}

extension Artikel {
    static let contoh = Artikel(id: 1, judul: "Halo", isi: "Isi", diterbitkanPada: .now)
}

@MainActor
@Suite("ArtikelViewModel")
struct ArtikelViewModelTests {
    @Test func muatSukses() async {
        let vm = ArtikelViewModel(repo: RepoPalsu(hasil: .success([.contoh])))
        await vm.muat()
        #expect(vm.status == .sukses)
        #expect(vm.artikel.count == 1)
    }

    @Test func muatGagal() async {
        let vm = ArtikelViewModel(repo: RepoPalsu(hasil: .failure(URLError(.notConnectedToInternet))))
        await vm.muat()
        #expect(vm.status == .gagal("Tidak bisa memuat artikel"))
        #expect(vm.artikel.isEmpty)
    }
}

@Test("dekode JSON artikel")
func dekodeArtikel() throws {
    let json = """
    [{"id": 1, "title": "Halo", "isi": "Isi", "published_at": "2026-11-02T08:00:00Z"}]
    """
    let decoder = JSONDecoder()
    decoder.dateDecodingStrategy = .iso8601
    let hasil = try decoder.decode([Artikel].self, from: Data(json.utf8))
    let pertama = try #require(hasil.first)      // gagal & hentikan test bila nil
    #expect(pertama.judul == "Halo")
}

@Test("validasi password", arguments: ["", "abc", "1234567"])
func passwordTidakValid(_ password: String) {
    #expect(throws: ValidasiError.self) {        // modul error handling
        try validasiPassword(password)
    }
}`, 'swift'),
      code('XCTest (masih dipakai untuk UI test) dan perintah CI', `import XCTest
@testable import Toko

final class FormatTests: XCTestCase {
    func testTotalKeranjang() {
        let k = Keranjang()
        k.tambah(nama: "Kopi", harga: 25_000)
        k.tambah(nama: "Kopi", harga: 25_000)
        XCTAssertEqual(k.total, 50_000)
    }
}

final class TokoUITests: XCTestCase {
    @MainActor
    func testTambahKeKeranjang() {
        let app = XCUIApplication()
        app.launch()
        app.buttons["Keranjang"].tap()
        XCTAssertTrue(app.navigationBars["Keranjang"].waitForExistence(timeout: 2))
    }
}

/*
Baris perintah (CI):
  xcrun simctl list devices available            # lihat nama simulator yang terpasang
  xcodebuild test -scheme Toko -destination 'platform=iOS Simulator,name=iPhone 16'
  xcodebuild archive -scheme Toko -configuration Release -archivePath build/Toko.xcarchive
  xcodebuild -exportArchive -archivePath build/Toko.xcarchive \\
             -exportOptionsPlist ExportOptions.plist -exportPath build/
  swift test                                     # untuk Swift package (XCTest + Swift Testing)
*/`, 'swift'),
      table(['Langkah rilis', 'Di mana', 'Catatan'], [
        ['1. Daftar Apple Developer Program', 'developer.apple.com', 'Berbayar tahunan (USD 99 untuk individu/organisasi); wajib untuk TestFlight & App Store'],
        ['2. Bundle ID & record aplikasi', 'Xcode (Signing & Capabilities) + App Store Connect', 'Bundle ID harus sama persis; aktifkan Automatically manage signing'],
        ['3. Versi & build number', 'Target → General', 'Version (mis. 1.2.0) untuk pengguna; Build harus naik di setiap upload'],
        ['4. Archive & upload', 'Xcode → Product → Archive → Distribute App', 'Atau `xcodebuild` + Transporter / Xcode Cloud / fastlane di CI'],
        ['5. TestFlight', 'App Store Connect → TestFlight', 'Internal tester (anggota tim, hingga 100) tanpa review; external tester (hingga 10.000) butuh Beta App Review; build berlaku 90 hari'],
        ['6. Submit for Review', 'App Store Connect → Distribution', 'Lengkapi screenshot, deskripsi, privacy nutrition label, dan privacy manifest bila memakai API yang wajib dideklarasikan'],
      ]),
      callout('warn', 'Persyaratan App Store berubah tiap tahun', 'Apple rutin menaikkan versi SDK/Xcode minimum untuk upload, menambah aturan privasi, dan memperbarui App Review Guidelines. Sebelum rilis, cek halaman [Upcoming Requirements](https://developer.apple.com/news/upcoming-requirements/) dan [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). Penyebab penolakan yang sering: crash saat review, fitur login tanpa akun demo, link atau tombol yang tidak berfungsi, dan deskripsi privasi yang tidak sesuai perilaku aplikasi. Bandingkan juga dengan proses rilis di [Flutter: Menuju Produksi](#flutter.menuju-produksi).'),
      ...quiz([
        ['SW-29', 'Mengapa ViewModel menerima `any ArtikelRepository`, bukan langsung `ArtikelAPI`?', 'Agar dependensi bisa diganti. Di aplikasi, yang disuntikkan adalah `ArtikelAPI` (jaringan asli); di test, `RepoPalsu` yang mengembalikan data atau error yang ditentukan. Test jadi cepat, deterministik, dan bisa menguji jalur error tanpa server.'],
        ['SW-30', 'Apa beda `#expect` dan `#require` di Swift Testing?', '`#expect` mencatat kegagalan lalu test tetap berlanjut, sehingga satu test bisa melaporkan beberapa masalah sekaligus. `#require` melempar error dan menghentikan test bila kondisinya gagal; juga dipakai untuk membuka optional (`try #require(x)`) sebelum langkah berikutnya yang bergantung padanya.'],
        ['SW-31', 'Apa beda internal tester dan external tester di TestFlight?', 'Internal tester adalah anggota tim di App Store Connect (hingga 100 orang) dan bisa langsung menguji build tanpa review. External tester (hingga 10.000, lewat email atau link publik) hanya bisa menguji setelah build lolos Beta App Review.'],
      ]),
      ...practice('sw-testing-rilis', [
        'Refactor satu layar menjadi View + `@Observable` ViewModel + protocol repository, lalu suntikkan repositori palsu di `#Preview`.',
        'Tulis test Swift Testing untuk jalur sukses, gagal, dan kosong; tambahkan satu parameterized test untuk validasi input.',
        'Jalankan test lewat `xcodebuild test` di terminal dan siapkan workflow CI (GitHub Actions dengan runner macOS atau Xcode Cloud).',
        'Bila punya akun Apple Developer: archive aplikasi, upload ke App Store Connect, dan undang satu internal tester lewat TestFlight.',
      ]),
      references(
        ['Apple Developer: Swift Testing', 'https://developer.apple.com/documentation/testing'],
        ['Apple Developer: XCTest', 'https://developer.apple.com/documentation/xctest'],
        ['Apple Developer: TestFlight', 'https://developer.apple.com/testflight/'],
        ['Apple Developer: App Store Connect Help', 'https://developer.apple.com/help/app-store-connect/'],
        ['Apple Developer: App Review Guidelines', 'https://developer.apple.com/app-store/review/guidelines/'],
      ),
    ],
  },
];

export const swiftCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'swift',
  title: 'Swift & iOS',
  short: 'Swift',
  monogram: 'Sw',
  hue: 'orange',
  description: 'Swift modern untuk aplikasi iOS: sintaks, optional, struct/enum, protocol & generic, error handling dan ARC, Swift Concurrency (async/await, actor, Sendable, strict concurrency Swift 6), lalu SwiftUI dengan @Observable, NavigationStack, URLSession + Codable, SwiftData, Swift Testing, MVVM, dan rilis lewat TestFlight.',
  tracks: swiftTracks,
  sources: [swiftSource],
  intro: [
    {
      type: 'callout',
      tone: 'tip',
      title: 'Untuk siapa kurikulum ini',
      text: 'Untuk developer yang ingin membangun aplikasi native Apple. Bila Anda sudah mengenal [Kotlin](#kotlin), banyak konsep terasa familier: optional mirip null safety, `async`/`await` mirip [coroutines](#kotlin.kt-coroutines), dan SwiftUI mirip [Jetpack Compose](#kotlin.kt-compose-dasar). Jalur yang disarankan: Swift Dasar → Swift Concurrency → SwiftUI. Bila target Anda Android dan iOS sekaligus dengan satu codebase, bandingkan dengan jalur [Flutter](#flutter).',
    },
    table(['', 'Swift + SwiftUI', 'Kotlin + Jetpack Compose', 'Flutter (Dart)'], [
      ['Platform utama', 'iOS, iPadOS, macOS, watchOS, tvOS, visionOS', 'Android (Compose Multiplatform untuk lainnya)', 'Android, iOS, web, desktop'],
      ['UI', 'Native Apple, deklaratif', 'Native Android, deklaratif', 'Engine render sendiri, deklaratif'],
      ['Akses API platform terbaru', 'Langsung saat rilis', 'Langsung saat rilis (Android)', 'Lewat plugin / platform channel'],
      ['Perangkat wajib', 'Mac + Xcode untuk iOS', 'Windows/Linux/macOS + Android Studio', 'OS apa pun; build iOS tetap butuh Mac'],
    ]),
    callout('warn', 'Persyaratan perangkat', 'Membuat, menjalankan di Simulator, dan merilis aplikasi iOS **wajib memakai Mac dengan Xcode**. Track Swift Dasar dan Swift Concurrency bisa dipelajari di Linux atau Windows memakai toolchain resmi dari [swift.org](https://www.swift.org/install/); track SwiftUI butuh Mac.'),
  ],
  modules: swiftModules,
};
