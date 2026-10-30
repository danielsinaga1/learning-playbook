import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'Kotlin Dasar';
const LANJUTAN = 'Kotlin Lanjutan';
const BACKEND = 'Kotlin untuk Backend';
const ANDROID = 'Android: Jetpack Compose';

export const kotlinSource = 'Kotlin: materi tulisan tangan dari dokumentasi resmi Kotlin, kotlinx.coroutines, Spring, dan Android Developers (30 Oktober 2026)';

const kotlinTracks: Track[] = [
  { title: DASAR, summary: 'Setup, sintaks, null safety, fungsi & lambda, class/data/sealed, koleksi, dan scope function.' },
  { title: LANJUTAN, summary: 'Coroutines, Flow, generic & variance, DSL, dan interop dengan Java.' },
  { title: BACKEND, summary: 'REST API Spring Boot dengan Kotlin, lalu testing dengan JUnit 5, MockK, Kotest, dan runTest.' },
  { title: ANDROID, summary: 'UI deklaratif dengan Jetpack Compose: state, recomposition, ViewModel + StateFlow.' },
];

const kotlinModules: Omit<Module, 'code'>[] = [
  {
    id: 'kt-setup-dasar',
    title: 'Kotlin: Setup & Sintaks Dasar',
    summary: 'IntelliJ, kotlinc, proyek Gradle Kotlin DSL, val/var, inferensi tipe, string template, if/when sebagai ekspresi, range, dan loop.',
    track: DASAR, source: kotlinSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Kotlin adalah bahasa statically typed dari JetBrains yang berjalan di JVM dan 100% interoperable dengan Java: library Java bisa dipakai langsung, dan class Kotlin bisa dipanggil dari Java. Bagi developer Java, Kotlin terasa seperti Java tanpa boilerplate: titik koma opsional, tipe diinferensi, `if` dan `when` mengembalikan nilai, dan null dicek oleh compiler. Sejak Kotlin 2.0 compiler bawaannya adalah **K2**, yang lebih cepat dan smart cast-nya lebih pintar.'),
      code('Install dan jalankan', `# Cara termudah: IntelliJ IDEA (Kotlin sudah terpasang) → New Project → Kotlin, build system Gradle
# Compiler baris perintah (opsional):
sdk install kotlin              # SDKMAN (Linux/macOS/WSL)
brew install kotlin             # Homebrew
scoop install kotlin            # Windows (Scoop)

kotlinc -version
kotlinc halo.kt -include-runtime -d halo.jar
java -jar halo.jar

# Proyek Gradle dengan Kotlin DSL (build.gradle.kts)
gradle init --type kotlin-application --dsl kotlin
./gradlew run`, 'bash'),
      code('build.gradle.kts minimal (aplikasi JVM)', `plugins {
    kotlin("jvm") version "2.3.21"     // versi yang dipakai start.spring.io per 30 Oktober 2026
    application
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))  // kotlin-test + JUnit 5
}

kotlin {
    jvmToolchain(21)                    // kompilasi dan jalankan dengan JDK 21
}

application {
    mainClass = "id.contoh.MainKt"      // fungsi main di Main.kt → class MainKt
}

tasks.test {
    useJUnitPlatform()
}`, 'kotlin'),
      code('val/var, string template, if/when, range, loop', `package id.contoh

fun main() {
    val nama = "Budi"                  // val = tidak bisa di-assign ulang (seperti final)
    var saldo = 150_000L               // var = bisa diubah; tipe Long diinferensi
    saldo += 25_000
    println("Halo, $nama! Saldo: \${saldo / 1000} ribu")

    val status = if (saldo > 100_000) "aman" else "menipis"   // if adalah ekspresi
    val kategori = when {                                     // when tanpa subjek = rantai if-else
        saldo >= 1_000_000 -> "besar"
        saldo >= 100_000 -> "sedang"
        else -> "kecil"
    }
    println("$status, $kategori")

    for (i in 1..3) print("$i ")           // 1 2 3 (inklusif)
    for (i in 0..<3) print("$i ")          // 0 1 2 (eksklusif di ujung)
    for (i in 10 downTo 0 step 5) print("$i ")   // 10 5 0
    println()

    val hari = listOf("Senin", "Selasa", "Rabu")
    for ((indeks, h) in hari.withIndex()) println("$indeks: $h")

    var percobaan = 0
    while (percobaan < 3) percobaan++
}

fun deskripsi(kode: Int): String = when (kode) {   // fungsi satu ekspresi
    200, 201 -> "sukses"
    in 400..499 -> "kesalahan klien"
    in 500..599 -> "kesalahan server"
    else -> "lainnya"
}`, 'kotlin'),
      table(['Java', 'Kotlin', 'Catatan'], [
        ['`final String nama = "Budi";`', '`val nama = "Budi"`', 'Tipe diinferensi; utamakan `val`'],
        ['`int x = 0;` / `long`', '`var x = 0` / `0L`', 'Tidak ada tipe primitif terpisah; compiler memilih primitif bila bisa'],
        ['`"Halo " + nama`', '`"Halo $nama"`', 'Ekspresi: `"${a + b}"`'],
        ['`cond ? a : b`', '`if (cond) a else b`', 'Kotlin tidak punya operator ternary'],
        ['`switch`', '`when`', 'Bisa dengan subjek, range (`in`), tipe (`is`), atau tanpa subjek'],
        ['`for (int i = 0; i < n; i++)`', '`for (i in 0..<n)`', 'Juga `until`, `downTo`, `step`'],
        ['`public static void main`', '`fun main()`', 'Fungsi top-level, tanpa class pembungkus'],
      ]),
      callout('tip', 'Konversi otomatis dari Java', 'IntelliJ bisa mengonversi file Java ke Kotlin (Code → Convert Java File to Kotlin File) atau menempel kode Java ke file .kt. Hasilnya benar tetapi belum idiomatis: banyak `!!` dan `var`. Pakai sebagai titik awal, lalu rapikan dengan materi modul-modul berikutnya.'),
      ...quiz([
        ['KT-01', 'Apa beda `val` dan `var`, dan apakah `val` berarti objeknya immutable?', '`val` hanya melarang assign ulang referensi (setara `final` di Java); `var` boleh di-assign ulang. Objek yang dirujuk `val` tetap bisa berubah bila tipenya mutable, misalnya `val xs = mutableListOf(1)` lalu `xs.add(2)` tetap valid.'],
        ['KT-02', 'Mengapa Kotlin tidak butuh operator ternary `?:` seperti Java?', 'Karena `if` dan `when` adalah ekspresi yang menghasilkan nilai, jadi `val x = if (c) a else b` sudah menggantikan ternary. Simbol `?:` di Kotlin justru dipakai sebagai operator Elvis untuk nilai null.'],
        ['KT-03', 'Apa beda `1..5`, `1..<5`, dan `5 downTo 1`?', '`1..5` berisi 1 sampai 5 (inklusif). `1..<5` (sama dengan `1 until 5`) berisi 1 sampai 4. `5 downTo 1` menghitung mundur 5, 4, 3, 2, 1; tambahkan `step` untuk lompatan.'],
      ]),
      ...practice('kt-setup', [
        'Buat proyek dengan `gradle init --type kotlin-application --dsl kotlin` dan jalankan `./gradlew run` serta `./gradlew test`.',
        'Tulis fungsi `deskripsi(kode)` dengan `when` dan uji untuk 200, 404, 503, dan 302.',
        'Cetak tabel perkalian 1–5 memakai range dan string template, tanpa variabel `var`.',
        'Konversi satu class Java kecil ke Kotlin dengan IntelliJ, lalu catat bagian yang perlu dirapikan.',
      ]),
      references(
        ['Kotlin: Get started', 'https://kotlinlang.org/docs/getting-started.html'],
        ['Kotlin: Basic syntax', 'https://kotlinlang.org/docs/basic-syntax.html'],
        ['Kotlin: Conditions and loops', 'https://kotlinlang.org/docs/control-flow.html'],
        ['Kotlin: Gradle', 'https://kotlinlang.org/docs/gradle.html'],
      ),
    ],
  },
  {
    id: 'kt-null-safety',
    title: 'Kotlin: Null Safety',
    summary: 'Tipe nullable, safe call ?., Elvis ?:, !!, let, smart cast, dan platform type dari kode Java.',
    track: DASAR, source: kotlinSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('Di Kotlin, `String` tidak pernah null; yang boleh null ditulis `String?`. Compiler menolak pemanggilan `nama.length` bila `nama` bertipe `String?` sampai Anda membuktikan nilainya tidak null. Hasilnya: `NullPointerException` hanya muncul di tempat yang eksplisit (`!!`, interop Java, atau inisialisasi yang salah).'),
      code('Nullable, ?., ?:, !!, let', `data class Alamat(val kota: String?)
data class Pengguna(val nama: String, val alamat: Alamat?)

fun kotaPengguna(p: Pengguna?): String {
    val kota: String? = p?.alamat?.kota          // safe call berantai: null bila salah satu null
    return kota ?: "tidak diketahui"             // Elvis: nilai cadangan
}

fun panjangNama(input: String?): Int = input?.trim()?.length ?: 0

fun wajibAda(id: Long, cari: (Long) -> Pengguna?): Pengguna {
    val p = cari(id) ?: throw NoSuchElementException("pengguna $id tidak ada")   // Elvis + throw
    return p
}

fun kirimEmail(email: String?) {
    email?.let { alamat ->                       // blok hanya jalan bila tidak null
        println("kirim ke $alamat")
    }
    val pasti: String = requireNotNull(email) { "email wajib diisi" }   // IllegalArgumentException
    val paksa: Int = email!!.length              // !! = NPE bila null; hindari di kode produksi
    println("$pasti $paksa")
}`, 'kotlin'),
      code('Smart cast', `fun ukuran(x: Any?): Int = when (x) {
    null -> 0
    is String -> x.length          // x otomatis bertipe String di cabang ini
    is Collection<*> -> x.size
    else -> 1
}

fun sapa(nama: String?) {
    if (nama.isNullOrBlank()) {
        println("Halo, tamu")
        return
    }
    println("Halo, \${nama.uppercase()}")   // smart cast ke String setelah early return
}

class Sesi {
    var token: String? = null

    fun header(): String {
        val t = token ?: return ""          // var milik class bisa berubah; salin ke val lokal dulu
        return "Bearer $t"
    }
}`, 'kotlin'),
      code('Platform type dari Java', `// Java: public String getNama() { ... }  → tanpa anotasi, Kotlin melihatnya sebagai String! (platform type)
val nama = penggunaJava.nama              // tipe String!: compiler tidak memaksa pengecekan null
val aman: String? = penggunaJava.nama     // pilih eksplisit: perlakukan sebagai nullable
val yakin: String = penggunaJava.nama     // bila ternyata null → NPE langsung di baris ini

// Java dengan anotasi (@Nullable/@NonNull dari JSpecify, JetBrains, Jakarta, dsb.)
// dipetakan ke String? / String sehingga compiler kembali menjaga null.`, 'kotlin'),
      table(['Operator / fungsi', 'Arti', 'Padanan Java'], [
        ['`T?`', 'Tipe yang boleh null', 'Semua referensi Java (implisit)'],
        ['`a?.b`', 'Akses bila `a` tidak null, selain itu null', '`a != null ? a.getB() : null`'],
        ['`a ?: b`', 'Pakai `b` bila `a` null', '`Optional.ofNullable(a).orElse(b)`'],
        ['`a!!`', 'Paksa tidak null, NPE bila null', 'Akses langsung tanpa cek'],
        ['`a?.let { }`', 'Jalankan blok bila tidak null', '`Optional.ifPresent`'],
        ['`requireNotNull` / `checkNotNull`', 'Validasi argumen / state dengan pesan jelas', '`Objects.requireNonNull`'],
      ]),
      callout('warn', 'Hindari `!!` dan `lateinit` berlebihan', 'Setiap `!!` adalah janji yang tidak dicek compiler. Ganti dengan `?:` + `return`/`throw`, `requireNotNull`, atau desain ulang tipe agar nilai memang wajib ada. `lateinit var` hanya untuk properti yang diisi framework (dependency injection, setup test).'),
      ...quiz([
        ['KT-04', 'Mengapa `if (token != null) token.length` bisa gagal smart cast bila `token` adalah `var` milik class?', 'Karena `var` properti class bisa diubah thread lain atau dari getter kustom di antara pengecekan dan pemakaian, compiler tidak bisa menjamin nilainya tetap tidak null. Salin dulu ke `val` lokal (`val t = token ?: return`) atau pakai `token?.let { }`.'],
        ['KT-05', 'Apa itu platform type `String!` dan bagaimana menyikapinya?', 'Tipe dari kode Java tanpa anotasi nullability. Kotlin tidak tahu apakah bisa null, jadi tidak memaksa pengecekan. Tentukan sikap di batas interop: deklarasikan sebagai `String?` bila ragu, atau tambahkan anotasi nullability di kode Java.'],
      ]),
      ...practice('kt-null', [
        'Tulis fungsi `kotaPengguna` dengan rantai `?.` dan `?:` lalu uji dengan pengguna null, alamat null, dan kota null.',
        'Cari semua `!!` di hasil konversi Java → Kotlin dan ganti dengan `?:`, `requireNotNull`, atau `let`.',
        'Panggil satu method Java tanpa anotasi dari Kotlin dan amati platform type di IntelliJ (Ctrl+Shift+P / Show expression type).',
      ]),
      references(
        ['Kotlin: Null safety', 'https://kotlinlang.org/docs/null-safety.html'],
        ['Kotlin: Calling Java from Kotlin (null safety & platform types)', 'https://kotlinlang.org/docs/java-interop.html'],
        ['Kotlin: Type checks and casts', 'https://kotlinlang.org/docs/typecasts.html'],
      ),
    ],
  },
  {
    id: 'kt-fungsi-lambda',
    title: 'Kotlin: Fungsi, Extension & Lambda',
    summary: 'Default & named argument, extension function, higher-order function, lambda, function reference, inline, dan infix.',
    track: DASAR, source: kotlinSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Fungsi adalah warga kelas satu di Kotlin: bisa berdiri di top-level, menerima dan mengembalikan fungsi lain, serta "menempel" ke tipe yang sudah ada lewat **extension function**. Banyak pola Java (overload berlapis, builder, util class statis) hilang karena fitur ini.'),
      code('Default, named argument, dan extension function', `fun formatRupiah(jumlah: Long, simbol: String = "Rp", pemisah: Char = '.'): String {
    val angka = jumlah.toString().reversed().chunked(3).joinToString(pemisah.toString()).reversed()
    return "$simbol$angka"
}

val a = formatRupiah(1_500_000)                    // Rp1.500.000
val b = formatRupiah(1_500_000, pemisah = ',')     // named argument: lewati parameter tengah

// Extension: menambah fungsi ke String tanpa mewarisi/mengubah class-nya
fun String.inisial(): String =
    split(" ").filter { it.isNotBlank() }.joinToString("") { it.first().uppercase() }

val Long.ribu: Long get() = this * 1_000           // extension property

fun main() {
    println("budi santoso".inisial())              // BS
    println(formatRupiah(250L.ribu))                // Rp250.000
}`, 'kotlin'),
      code('Higher-order function, lambda, dan function reference', `data class Transaksi(val judul: String, val jumlah: Long)

// Parameter bertipe fungsi: (Transaksi) -> Boolean
fun saring(data: List<Transaksi>, syarat: (Transaksi) -> Boolean): List<Transaksi> =
    data.filter(syarat)

fun pembuatDiskon(persen: Int): (Long) -> Long = { harga -> harga * (100 - persen) / 100 }

fun besar(t: Transaksi) = t.jumlah >= 100_000

fun main() {
    val data = listOf(Transaksi("Kopi", 25_000), Transaksi("Sepatu", 450_000))

    val mahal = saring(data) { it.jumlah > 100_000 }      // trailing lambda, parameter tunggal = it
    val juga = saring(data, ::besar)                       // function reference
    val judul = data.map(Transaksi::judul)                 // property reference

    val diskon10 = pembuatDiskon(10)
    println(diskon10(200_000))                             // 180000
    println("$mahal $juga $judul")
}`, 'kotlin'),
      code('inline dan infix', `// inline: lambda disalin ke pemanggil, tanpa objek fungsi; return di lambda keluar dari fungsi pemanggil
inline fun <T> ukurWaktu(label: String, blok: () -> T): T {
    val mulai = System.nanoTime()
    try {
        return blok()
    } finally {
        println("$label: \${(System.nanoTime() - mulai) / 1_000_000} ms")
    }
}

data class Uang(val jumlah: Long, val mataUang: String)

infix fun Long.dalam(mataUang: String) = Uang(this, mataUang)   // dipanggil tanpa titik dan kurung

fun cariPertamaGenap(xs: List<Int>): Int? {
    xs.forEach { if (it % 2 == 0) return it }   // non-local return: sah karena forEach inline
    return null
}

fun main() {
    val total = ukurWaktu("hitung") { (1..1_000_000).sumOf { it.toLong() } }
    val harga = 50_000L dalam "IDR"
    val pasangan = "id" to 42                    // to juga fungsi infix dari stdlib → Pair
    println("$total $harga $pasangan \${cariPertamaGenap(listOf(3, 5, 8))}")
}`, 'kotlin'),
      table(['Java', 'Kotlin'], [
        ['Overload `f(a)`, `f(a, b)`, `f(a, b, c)`', 'Satu fungsi dengan default argument'],
        ['`StringUtils.capitalize(s)`', 'Extension: `s.replaceFirstChar { it.uppercase() }`'],
        ['`Function<T, R>`, `Predicate<T>`, `Supplier<T>`', 'Tipe fungsi `(T) -> R`, `(T) -> Boolean`, `() -> T`'],
        ['`x -> x * 2`', '`{ x -> x * 2 }` atau `{ it * 2 }`'],
        ['`String::length`', '`String::length` (sama)'],
      ]),
      callout('info', 'Extension itu statis', 'Extension tidak benar-benar mengubah class; di bytecode ia menjadi method statis dengan parameter pertama = receiver. Akibatnya extension tidak bisa mengakses member `private` dan dipilih berdasarkan tipe deklarasi, bukan tipe runtime. Bila class punya member dengan signature sama, member yang menang.'),
      ...quiz([
        ['KT-06', 'Kapan sebaiknya fungsi higher-order ditandai `inline`?', 'Saat fungsi kecil menerima lambda dan sering dipanggil (seperti `map`, `filter`, utilitas logging/timing). Inline menghindari alokasi objek lambda, memungkinkan non-local return, dan wajib untuk `reified`. Jangan inline fungsi besar karena kodenya disalin ke setiap pemanggil.'],
        ['KT-07', 'Apa yang terjadi bila extension `fun String.trim()` didefinisikan, padahal String sudah punya `trim()`?', 'Member function selalu menang atas extension dengan signature yang sama, sehingga extension itu tidak pernah terpanggil (IntelliJ memberi peringatan "extension is shadowed by a member").'],
      ]),
      ...practice('kt-fungsi', [
        'Tulis `formatRupiah` dengan default argument dan panggil dengan kombinasi named argument.',
        'Buat tiga extension: `String.inisial()`, `List<Long>.rataRata()`, dan `Long.ribu` lalu tulis test-nya.',
        'Tulis fungsi `retry(kali: Int, blok: () -> T): T` yang mencoba ulang saat exception, lalu jadikan `inline`.',
        'Refaktor util class Java statis (mis. `DateUtils`) menjadi extension function top-level.',
      ]),
      references(
        ['Kotlin: Functions', 'https://kotlinlang.org/docs/functions.html'],
        ['Kotlin: Higher-order functions and lambdas', 'https://kotlinlang.org/docs/lambdas.html'],
        ['Kotlin: Extensions', 'https://kotlinlang.org/docs/extensions.html'],
        ['Kotlin: Inline functions', 'https://kotlinlang.org/docs/inline-functions.html'],
      ),
    ],
  },
  {
    id: 'kt-class-data-sealed',
    title: 'Kotlin: Class, Data Class, Sealed & Delegation',
    summary: 'Constructor & init, properti, data class, object/companion, sealed + when exhaustive, enum, value class, interface, dan delegasi by.',
    track: DASAR, source: kotlinSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Kotlin memodelkan domain dengan sedikit kode: properti menggantikan field + getter/setter, **data class** menggantikan POJO/Lombok, **sealed** membatasi hierarki sehingga `when` dicek kelengkapannya, dan **object** menggantikan singleton. Perbedaan penting dari Java: class dan method **final secara default**; tulis `open` bila memang ingin diwarisi.'),
      code('Class, constructor, init, properti', `class Rekening(val nomor: String, saldoAwal: Long = 0) {   // primary constructor
    var saldo: Long = saldoAwal
        private set                                            // dibaca publik, diubah hanya di dalam

    val kosong: Boolean
        get() = saldo == 0L                                    // properti terhitung

    init {
        require(nomor.length == 10) { "nomor rekening harus 10 digit" }
    }

    fun setor(jumlah: Long) {
        require(jumlah > 0) { "jumlah harus positif" }
        saldo += jumlah
    }
}

data class Transaksi(val id: Long, val jumlah: Long, val catatan: String = "")

fun main() {
    val r = Rekening("1234567890")
    r.setor(50_000)

    val t1 = Transaksi(1, 50_000)
    val t2 = t1.copy(catatan = "makan siang")      // salinan dengan perubahan
    val (id, jumlah) = t2                         // destructuring dari componentN()
    println(t1 == t2.copy(catatan = ""))          // true: equals berbasis properti
    println("$t2 $id $jumlah \${r.saldo}")         // toString otomatis
}`, 'kotlin'),
      code('Sealed interface, enum, value class, object & companion', `sealed interface HasilPembayaran {
    data class Sukses(val referensi: String) : HasilPembayaran
    data class Gagal(val alasan: String, val bisaDiulang: Boolean) : HasilPembayaran
    data object Menunggu : HasilPembayaran
}

fun pesan(h: HasilPembayaran): String = when (h) {             // tanpa else: dicek lengkap
    is HasilPembayaran.Sukses -> "Berhasil (\${h.referensi})"
    is HasilPembayaran.Gagal -> if (h.bisaDiulang) "Coba lagi: \${h.alasan}" else "Ditolak: \${h.alasan}"
    HasilPembayaran.Menunggu -> "Menunggu konfirmasi"
}

enum class Status(val label: String) {
    AKTIF("Aktif"),
    DIBEKUKAN("Dibekukan");

    fun bisaTransaksi() = this == AKTIF
}

@JvmInline
value class Email(val nilai: String) {                         // tanpa alokasi objek di runtime
    init {
        require("@" in nilai) { "email tidak valid: $nilai" }
    }
}

object Batas {                                                 // singleton
    const val HARIAN = 10_000_000L
}

class Pengguna private constructor(val email: Email) {
    companion object {                                         // pengganti static factory
        fun dari(raw: String) = Pengguna(Email(raw.trim().lowercase()))
    }
}`, 'kotlin'),
      code('Interface dan delegasi by', `interface Repositori {
    fun cari(id: Long): String?
    fun simpan(id: Long, nilai: String)
}

class RepositoriMemori : Repositori {
    private val data = mutableMapOf<Long, String>()
    override fun cari(id: Long) = data[id]
    override fun simpan(id: Long, nilai: String) {
        data[id] = nilai
    }
}

// Semua method diteruskan ke 'asli'; hanya simpan() yang di-override (pola decorator tanpa boilerplate)
class RepositoriBerlog(private val asli: Repositori) : Repositori by asli {
    override fun simpan(id: Long, nilai: String) {
        println("simpan $id")
        asli.simpan(id, nilai)
    }
}

class Konfigurasi {
    val koneksi: String by lazy {                              // delegasi properti: dihitung sekali saat pertama dipakai
        println("membuka koneksi...")
        "jdbc:postgresql://localhost/dompet"
    }
}`, 'kotlin'),
      table(['Java', 'Kotlin', 'Catatan'], [
        ['POJO + getter/setter / Lombok `@Data`', '`class` dengan `val`/`var` di constructor', 'Properti, bukan field'],
        ['`record`', '`data class`', 'Plus `copy()` dan destructuring'],
        ['`sealed interface ... permits`', '`sealed interface`', 'Subtipe harus di package & modul yang sama'],
        ['Singleton (`getInstance()`)', '`object`', 'Thread-safe, dibuat saat pertama diakses'],
        ['`static` method / field', '`companion object` atau fungsi top-level', '`const val` untuk konstanta'],
        ['Class terbuka secara default', 'Final secara default', 'Butuh `open` (penting untuk Spring, lihat modul Spring Boot)'],
        ['Decorator manual', '`: Interface by delegate`', 'Delegasi dibuat compiler'],
      ]),
      callout('tip', 'Bandingkan dengan Java modern', 'Konsepnya sama dengan record + sealed + pattern matching di [Java Modern: Records, Sealed Class & Pattern Matching](#java.java-records-sealed-pattern). Bedanya, `when` Kotlin sudah memakai smart cast sejak lama, dan data class boleh punya `var` (tetapi utamakan `val`).'),
      ...quiz([
        ['KT-08', 'Apa keuntungan `sealed interface` dibanding `enum` untuk hasil operasi seperti `HasilPembayaran`?', 'Setiap varian sealed bisa membawa data berbeda (referensi untuk Sukses, alasan untuk Gagal) dan bisa berupa data class atau object. Enum hanya punya satu instance per konstanta dengan properti yang sama. Keduanya sama-sama dicek kelengkapannya oleh `when`.'],
        ['KT-09', 'Mengapa `data class` cocok untuk DTO, tetapi `value class` dipakai untuk `Email`?', 'Data class memberi `equals`, `hashCode`, `toString`, `copy` untuk objek dengan banyak properti. Value class membungkus satu nilai agar bertipe kuat (Email bukan sembarang String) dan bisa memvalidasi di `init`, sementara di runtime biasanya dikompilasi menjadi nilai mentahnya tanpa alokasi objek tambahan.'],
        ['KT-10', 'Apa hasil `Repositori by asli` bila interface mendapat method baru?', 'Compiler otomatis membuat method penerus ke `asli` untuk method baru tersebut, sehingga class dekorator tetap terkompilasi tanpa perubahan. Hanya method yang di-override yang perilakunya berbeda.'],
      ]),
      ...practice('kt-class', [
        'Modelkan status pesanan (Dibuat, Dibayar(tanggal), Dikirim(resi), Batal(alasan)) sebagai sealed interface dan tulis `when` tanpa `else`.',
        'Tambahkan varian baru dan perbaiki semua error kompilasi yang muncul.',
        'Buat value class `NomorRekening` dengan validasi 10 digit dan pakai di `Rekening`.',
        'Bungkus repositori memori dengan dekorator `by` yang mengukur waktu setiap `simpan`.',
      ]),
      references(
        ['Kotlin: Classes', 'https://kotlinlang.org/docs/classes.html'],
        ['Kotlin: Data classes', 'https://kotlinlang.org/docs/data-classes.html'],
        ['Kotlin: Sealed classes and interfaces', 'https://kotlinlang.org/docs/sealed-classes.html'],
        ['Kotlin: Object declarations', 'https://kotlinlang.org/docs/object-declarations.html'],
        ['Kotlin: Inline value classes', 'https://kotlinlang.org/docs/inline-classes.html'],
        ['Kotlin: Delegation', 'https://kotlinlang.org/docs/delegation.html'],
      ),
    ],
  },
  {
    id: 'kt-koleksi-scope',
    title: 'Kotlin: Koleksi, Sequence & Scope Function',
    summary: 'List/Set/Map read-only vs mutable, operasi map/filter/groupBy/associate, sequence lazy, dan kapan memakai let/run/with/apply/also.',
    track: DASAR, source: kotlinSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Koleksi Kotlin memakai class koleksi Java di bawahnya, tetapi antarmukanya dipisah: `List`, `Set`, `Map` hanya bisa dibaca, sedangkan `MutableList`, `MutableSet`, `MutableMap` bisa diubah. Operasi seperti `map` dan `filter` tersedia langsung tanpa `.stream()` dan `collect()`.'),
      code('Read-only vs mutable', `val hari: List<String> = listOf("Senin", "Selasa")
// hari.add("Rabu")                          // error kompilasi: List tidak punya add

val keranjang = mutableListOf("apel")
keranjang += "jeruk"                         // operator plusAssign
keranjang.removeAt(0)

val stok = mutableMapOf("apel" to 10, "jeruk" to 5)
stok["mangga"] = 7
val jumlahApel = stok.getOrDefault("apel", 0)

val tag = setOf("kotlin", "jvm", "kotlin")   // [kotlin, jvm]
val gabungan = hari + "Rabu"                 // List baru; 'hari' tidak berubah

val angka = buildList {                      // isi secara mutable, hasilnya List read-only
    add(1)
    addAll(listOf(2, 3))
}`, 'kotlin'),
      code('Operasi koleksi dan sequence', `data class Transaksi(val id: Long, val kategori: String, val jumlah: Long, val keluar: Boolean)

val data = listOf(
    Transaksi(1, "makan", 45_000, keluar = true),
    Transaksi(2, "gaji", 8_000_000, keluar = false),
    Transaksi(3, "transport", 20_000, keluar = true),
    Transaksi(4, "makan", 30_000, keluar = true),
)

fun main() {
    val totalKeluar = data.filter { it.keluar }.sumOf { it.jumlah }        // 95000
    val perKategori: Map<String, Long> = data.filter { it.keluar }
        .groupBy { it.kategori }
        .mapValues { (_, xs) -> xs.sumOf { it.jumlah } }                   // {makan=75000, transport=20000}
    val byId: Map<Long, Transaksi> = data.associateBy { it.id }
    val (keluar, masuk) = data.partition { it.keluar }                     // Pair<List, List> → destructuring
    val terbesar = data.maxByOrNull { it.jumlah }
    val kategori = data.map { it.kategori }.distinct().sorted()

    // Sequence: lazy, diproses per elemen; cocok untuk rantai panjang atau data tak terbatas
    val kuadratKelipatan3 = generateSequence(1) { it + 1 }
        .map { it * it }
        .filter { it % 3 == 0 }
        .take(5)
        .toList()                                                           // [9, 36, 81, 144, 225]

    println("$totalKeluar $perKategori \${byId.keys} \${keluar.size}/\${masuk.size} $terbesar $kategori $kuadratKelipatan3")
}`, 'kotlin'),
      code('Scope function: let, run, with, apply, also', `class PermintaanHttp {
    var url: String = ""
    var metode: String = "GET"
    val header = mutableMapOf<String, String>()
}

fun cariNama(id: Long): String? = if (id == 1L) "  Sari " else null
fun kirim(req: PermintaanHttp): Int = 201

fun main() {
    val req = PermintaanHttp().apply {             // apply: konfigurasi objek, kembalikan objek itu
        url = "https://api.contoh.id/transaksi"
        metode = "POST"
        header["Content-Type"] = "application/json"
    }

    val panjang = cariNama(1)?.let { it.trim().length } ?: 0   // let: transformasi nilai nullable

    val ringkasan = with(req) { "$metode $url (\${header.size} header)" }   // with: banyak akses ke satu objek

    val status = req.run {                          // run: seperti with, tapi dipanggil sebagai extension
        check(url.startsWith("https")) { "wajib https" }
        kirim(this)
    }

    val kode = kirim(req).also { println("status: $it") }       // also: efek samping, nilai diteruskan
    println("$panjang $ringkasan $status $kode")
}`, 'kotlin'),
      table(['Fungsi', 'Objek di dalam blok', 'Mengembalikan', 'Pakai untuk'], [
        ['`let`', '`it`', 'Hasil lambda', '`x?.let { }` untuk nilai nullable, transformasi'],
        ['`run`', '`this`', 'Hasil lambda', 'Konfigurasi lalu hitung hasil; blok berisi beberapa pernyataan'],
        ['`with(x)`', '`this`', 'Hasil lambda', 'Mengelompokkan banyak panggilan pada satu objek'],
        ['`apply`', '`this`', 'Objek itu sendiri', 'Inisialisasi/konfigurasi objek (pengganti builder)'],
        ['`also`', '`it`', 'Objek itu sendiri', 'Efek samping: log, validasi, debug di tengah rantai'],
      ]),
      callout('tip', 'Collection vs Sequence vs Java Stream', 'Operasi koleksi Kotlin bersifat *eager*: setiap langkah membuat List baru. Untuk 3–4 langkah pada data kecil ini paling sederhana dan cepat. Pakai `asSequence()` bila datanya besar, rantainya panjang, atau ada `first`/`take` yang bisa berhenti lebih awal. Sequence mirip Java Stream tetapi bisa diulang dan tidak paralel.'),
      ...quiz([
        ['KT-11', 'Apakah `listOf(...)` menjamin daftar itu immutable?', 'Tidak sepenuhnya. Tipe `List` hanya read-only: kode Anda tidak bisa memanggil `add`. Objek di bawahnya tetap class koleksi Java dan bisa diubah lewat cast ke `MutableList` atau dari kode Java. Untuk jaminan penuh, salin defensif atau gunakan library koleksi immutable.'],
        ['KT-12', 'Pilih scope function: membuat objek konfigurasi lalu langsung mengembalikannya; dan mencetak log hasil di tengah rantai.', 'Konfigurasi objek: `apply` (blok memakai `this`, mengembalikan objek). Log di tengah rantai: `also` (blok memakai `it`, nilai diteruskan tanpa diubah).'],
      ]),
      ...practice('kt-koleksi', [
        'Dari daftar transaksi, hitung total per kategori, tiga transaksi terbesar, dan rata-rata pengeluaran harian.',
        'Ubah rantai yang memakai `first { }` pada daftar besar menjadi sequence dan bandingkan jumlah elemen yang diproses (cetak di `onEach`).',
        'Tulis ulang satu builder Java memakai `apply` dan satu pengecekan null memakai `?.let`.',
      ]),
      references(
        ['Kotlin: Collections overview', 'https://kotlinlang.org/docs/collections-overview.html'],
        ['Kotlin: Sequences', 'https://kotlinlang.org/docs/sequences.html'],
        ['Kotlin: Scope functions', 'https://kotlinlang.org/docs/scope-functions.html'],
      ),
    ],
  },
  {
    id: 'kt-coroutines',
    title: 'Kotlin: Coroutines & Structured Concurrency',
    summary: 'suspend, launch/async, coroutineScope, Dispatchers, pembatalan, penanganan exception, dan perbandingan dengan virtual threads Java.',
    track: LANJUTAN, source: kotlinSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Coroutine adalah komputasi yang bisa **ditangguhkan** (suspend) tanpa memblokir thread. Fungsi `suspend` ditulis seperti kode sinkron biasa, tetapi saat menunggu I/O atau `delay`, thread-nya dilepas untuk pekerjaan lain. **Structured concurrency** menjamin setiap coroutine hidup di dalam sebuah scope: scope tidak selesai sebelum semua anaknya selesai, dan kegagalan/pembatalan menjalar dengan rapi. Library-nya `kotlinx-coroutines-core` (rilis terbaru di Maven Central per 30 Oktober 2026: 1.11.0).'),
      code('suspend, launch, async, coroutineScope', `// build.gradle.kts: implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
import kotlinx.coroutines.*

suspend fun ambilProfil(id: Long): String {
    delay(300)                                   // menangguhkan, bukan Thread.sleep
    return "Profil#$id"
}

suspend fun ambilSaldo(id: Long): Long {
    delay(500)
    return 1_250_000
}

// coroutineScope: menunggu semua anak; bila satu gagal, yang lain dibatalkan
suspend fun dashboard(id: Long): String = coroutineScope {
    val profil = async { ambilProfil(id) }       // async → Deferred<T>, berjalan bersamaan
    val saldo = async { ambilSaldo(id) }
    "\${profil.await()} - saldo \${saldo.await()}"  // total ±500 ms, bukan 800 ms
}

fun main() = runBlocking {                       // jembatan dari dunia blocking (main, test)
    val job = launch {                           // launch → Job, untuk kerja tanpa hasil
        repeat(3) { i ->
            println("notifikasi $i")
            delay(100)
        }
    }
    println(dashboard(7))
    job.join()
}`, 'kotlin'),
      code('Dispatchers, pembatalan, timeout', `import kotlinx.coroutines.*
import java.io.File

suspend fun bacaFile(path: String): String = withContext(Dispatchers.IO) {
    File(path).readText()                        // I/O blocking dipindah ke pool IO
}

suspend fun hitungBerat(data: List<Int>): Long = withContext(Dispatchers.Default) {
    data.sumOf { it.toLong() * it }              // kerja CPU di pool sebesar jumlah core
}

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var putaran = 0L
        while (isActive) {                       // loop CPU wajib memeriksa pembatalan
            putaran++
        }
        println("berhenti setelah $putaran putaran")
    }
    delay(50)
    job.cancelAndJoin()                          // pembatalan kooperatif

    val hasil = withTimeoutOrNull(200) {
        delay(1_000)
        "selesai"
    }
    println(hasil)                               // null: melewati batas waktu
    println(hitungBerat(listOf(1, 2, 3)))        // 14
}`, 'kotlin'),
      code('Penanganan exception: coroutineScope vs supervisorScope', `import kotlinx.coroutines.*

val handler = CoroutineExceptionHandler { _, e -> println("ditangkap handler: \${e.message}") }

fun main() = runBlocking {
    // supervisorScope: kegagalan satu anak tidak membatalkan saudaranya
    supervisorScope {
        val a = async { error("gagal A") }
        val b = async { delay(100); "B ok" }
        try {
            a.await()                            // exception async muncul saat await
        } catch (e: IllegalStateException) {
            println("A gagal: \${e.message}")
        }
        println(b.await())                       // tetap selesai
    }

    // Scope milik komponen (mis. service) dengan SupervisorJob + handler untuk launch
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default + handler)
    scope.launch { error("gagal di launch") }.join()
    scope.cancel()                               // batalkan semua saat komponen ditutup
}`, 'kotlin'),
      table(['Aspek', 'Kotlin coroutines', 'Java virtual threads'], [
        ['Model', 'Fungsi `suspend`, ditangguhkan oleh compiler (state machine)', 'Thread murah yang dijadwalkan JVM; kode blocking biasa'],
        ['Penanda di kode', '`suspend` menular ke pemanggil', 'Tidak ada; semua method bisa blocking'],
        ['Konkurensi terstruktur', 'Bawaan (`coroutineScope`, `supervisorScope`)', '`StructuredTaskScope` (masih preview)'],
        ['Pembatalan', 'Kooperatif, menjalar ke anak, `withTimeout`', 'Interrupt thread'],
        ['Stream nilai', '`Flow`, `StateFlow`', 'Tidak ada bawaan (Reactor/RxJava terpisah)'],
        ['Platform', 'JVM, Android, JS, Native', 'Hanya JVM 21+'],
      ]),
      callout('warn', 'Aturan praktis', 'Jangan memakai `GlobalScope`; gunakan scope yang terikat umur komponen (`viewModelScope`, scope milik service, atau `coroutineScope`). Jangan menelan `CancellationException` di `catch (e: Exception)` tanpa melempar ulang, karena pembatalan jadi tidak berfungsi. Kode blocking (JDBC, `File`) harus dibungkus `withContext(Dispatchers.IO)`. Bandingkan dengan [Java Modern: Virtual Threads & Structured Concurrency](#java.java-virtual-threads).'),
      ...quiz([
        ['KT-13', 'Apa beda `launch` dan `async`?', '`launch` mengembalikan `Job` untuk kerja tanpa nilai hasil; exception-nya langsung menjalar ke parent. `async` mengembalikan `Deferred<T>` yang hasilnya diambil dengan `await()`; exception disimpan dan dilempar saat `await`, sekaligus tetap menggagalkan parent dalam `coroutineScope` biasa.'],
        ['KT-14', 'Dalam `coroutineScope`, satu `async` gagal. Apa yang terjadi pada `async` lain dan pemanggil?', 'Scope dibatalkan: semua anak lain ikut dibatalkan, lalu exception dilempar ke pemanggil `coroutineScope`. Bila ingin anak lain tetap berjalan, gunakan `supervisorScope` dan tangani exception di `await`.'],
        ['KT-15', 'Mengapa loop `while (true) { hitung() }` di coroutine tidak berhenti saat `job.cancel()`?', 'Pembatalan bersifat kooperatif: coroutine hanya berhenti di titik suspend atau saat memeriksa status. Gunakan `while (isActive)`, `ensureActive()`, atau `yield()` di dalam loop CPU.'],
      ]),
      ...practice('kt-coroutines', [
        'Panggil tiga "API" palsu (`delay` 300/500/700 ms) secara bersamaan dengan `async` dan buktikan total waktu ±700 ms dengan `measureTimeMillis`.',
        'Buat salah satu API melempar exception; bandingkan perilaku `coroutineScope` dan `supervisorScope`.',
        'Bungkus pembacaan file dengan `withContext(Dispatchers.IO)` dan batasi waktunya dengan `withTimeout`.',
        'Tulis loop CPU yang bisa dibatalkan dan buktikan dengan `cancelAndJoin`.',
      ]),
      references(
        ['Kotlin: Coroutines basics', 'https://kotlinlang.org/docs/coroutines-basics.html'],
        ['Kotlin: Coroutine context and dispatchers', 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html'],
        ['Kotlin: Cancellation and timeouts', 'https://kotlinlang.org/docs/cancellation-and-timeouts.html'],
        ['Kotlin: Coroutine exceptions handling', 'https://kotlinlang.org/docs/exception-handling.html'],
      ),
    ],
  },
  {
    id: 'kt-flow',
    title: 'Kotlin: Flow, StateFlow & SharedFlow',
    summary: 'Cold stream dengan Flow, operator, StateFlow/SharedFlow untuk state dan event, collect sesuai lifecycle, dan dasar backpressure.',
    track: LANJUTAN, source: kotlinSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('`suspend fun` mengembalikan satu nilai; `Flow<T>` mengembalikan **banyak nilai secara asinkron**. Flow bersifat *cold*: blok `flow { }` baru berjalan saat ada yang memanggil `collect`, dan berjalan ulang untuk setiap collector. Untuk state yang dibagi ke banyak pengamat (UI, beberapa service) dipakai **StateFlow** dan **SharedFlow** yang bersifat *hot*.'),
      code('Flow dan operator', `import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.runBlocking

fun angka(): Flow<Int> = flow {
    println("flow dimulai")                      // dicetak ulang untuk setiap collector (cold)
    for (i in 1..5) {
        delay(100)
        emit(i)
    }
}

fun main() = runBlocking {
    angka()
        .filter { it % 2 == 1 }
        .map { "angka ganjil $it" }
        .onEach { println(it) }
        .catch { e -> println("error: \${e.message}") }   // tangkap error dari hulu
        .onCompletion { println("selesai") }
        .collect()                                         // operator terminal memicu eksekusi

    val total = angka().take(3).fold(0) { acc, x -> acc + x }
    println(total)                                         // 6

    flowOf(1, 2, 3).zip(flowOf("a", "b")) { n, s -> "$n$s" }
        .collect { println(it) }                           // 1a, 2b
}`, 'kotlin'),
      code('StateFlow untuk state, SharedFlow untuk event', `import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class KeranjangStore(private val scope: CoroutineScope) {
    private val _items = MutableStateFlow<List<String>>(emptyList())
    val items: StateFlow<List<String>> = _items.asStateFlow()       // selalu punya nilai terkini

    private val _event = MutableSharedFlow<String>()
    val event: SharedFlow<String> = _event.asSharedFlow()          // event sekali jalan (toast, navigasi)

    val jumlah: StateFlow<Int> = items
        .map { it.size }
        .stateIn(scope, SharingStarted.WhileSubscribed(5_000), 0)   // Flow → StateFlow

    fun tambah(item: String) {
        _items.update { it + item }                                // update atomik
        scope.launch { _event.emit("$item ditambahkan") }
    }
}

// Android (Activity/Fragment): collect hanya saat UI terlihat
// lifecycleScope.launch {
//     repeatOnLifecycle(Lifecycle.State.STARTED) {
//         store.items.collect { render(it) }
//     }
// }
// Jetpack Compose: val items by store.items.collectAsStateWithLifecycle()`, 'kotlin'),
      code('Backpressure: buffer, conflate, collectLatest', `import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    val cepat = flow {
        repeat(10) {
            emit(it)
            delay(10)                    // produsen: 1 nilai / 10 ms
        }
    }

    // Default: produsen menunggu collector selesai memproses tiap nilai (suspend = backpressure alami)
    cepat.buffer(capacity = 4).collect { delay(50); println("buffer $it") }   // produsen jalan di depan sampai 4 item
    cepat.conflate().collect { delay(50); println("conflate $it") }          // lewati nilai lama, ambil terbaru
    cepat.collectLatest { delay(50); println("latest $it") }                 // batalkan proses lama saat nilai baru datang
}`, 'kotlin'),
      table(['Tipe', 'Cold/Hot', 'Nilai awal', 'Pakai untuk', 'Padanan Java'], [
        ['`Flow<T>`', 'Cold', 'Tidak', 'Query DB/HTTP bertahap, transformasi data', '`Stream` (sinkron) / Reactor `Flux`'],
        ['`StateFlow<T>`', 'Hot', 'Wajib, selalu ada nilai terkini', 'State UI, konfigurasi, status koneksi', 'Mirip `BehaviorSubject` / `Sinks.many().replay().latest()`'],
        ['`SharedFlow<T>`', 'Hot', 'Opsional (`replay`)', 'Event: notifikasi, navigasi, pesan broadcast', 'Mirip `PublishSubject` / `Sinks.many().multicast()`'],
      ]),
      callout('info', 'StateFlow menggabungkan nilai sama', 'StateFlow hanya memancarkan nilai bila berbeda (`equals`) dari nilai sebelumnya, dan collector yang lambat hanya melihat nilai terbaru. Jadi StateFlow cocok untuk state, bukan untuk event yang tidak boleh hilang; untuk event pakai SharedFlow atau `Channel`.'),
      ...quiz([
        ['KT-16', 'Mengapa `flow { }` yang memanggil API dijalankan dua kali bila di-collect oleh dua collector?', 'Karena Flow bersifat cold: setiap `collect` menjalankan ulang blok produsennya. Bila hasilnya ingin dibagi, ubah menjadi hot flow dengan `stateIn` atau `shareIn` pada sebuah scope.'],
        ['KT-17', 'Kapan memakai `collectLatest` dibanding `conflate`?', '`conflate` tetap menyelesaikan pemrosesan nilai yang sedang berjalan lalu melompat ke nilai terbaru. `collectLatest` membatalkan pemrosesan yang sedang berjalan begitu nilai baru tiba, cocok untuk pencarian saat mengetik atau render ulang yang mahal.'],
      ]),
      ...practice('kt-flow', [
        'Tulis `Flow<Long>` harga saham palsu (emit tiap 200 ms) dan tampilkan rata-rata bergerak 3 nilai dengan `runningFold` atau `scan`.',
        'Buat `KeranjangStore` dengan StateFlow + SharedFlow lalu collect dari dua coroutine berbeda.',
        'Bandingkan output `buffer`, `conflate`, dan `collectLatest` pada produsen cepat dan collector lambat; catat jumlah nilai yang diproses.',
      ]),
      references(
        ['Kotlin: Asynchronous Flow', 'https://kotlinlang.org/docs/flow.html'],
        ['Android Developers: StateFlow and SharedFlow', 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow'],
        ['Android Developers: Kotlin flows on Android', 'https://developer.android.com/kotlin/flow'],
      ),
    ],
  },
  {
    id: 'kt-generic-dsl-java-interop',
    title: 'Kotlin: Generic, DSL & Interop Java',
    summary: 'Variance in/out, reified type parameter, type-safe builder (DSL), anotasi @JvmStatic/@JvmOverloads, dan memanggil Java dari Kotlin.',
    track: LANJUTAN, source: kotlinSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Generic Kotlin mirip Java, tetapi wildcard `? extends`/`? super` diganti `out`/`in` yang bisa ditulis sekali di deklarasi. Lambda dengan receiver (`T.() -> Unit`) memungkinkan **DSL** yang aman tipe, mekanisme yang sama yang membuat `build.gradle.kts` terbaca seperti konfigurasi. Modul ini ditutup dengan interop: cara agar kode Kotlin nyaman dipanggil dari Java dan sebaliknya.'),
      code('Variance dan reified', `interface Sumber<out T> {                       // produsen: hanya mengeluarkan T (kovarian)
    fun ambil(): T
}

interface Pembanding<in T> {                     // konsumen: hanya menerima T (kontravarian)
    fun banding(a: T, b: T): Int
}

fun cetakSemua(sumber: Sumber<Any>) = println(sumber.ambil())

// Use-site variance (setara ? extends / ? super di Java)
fun salin(dari: MutableList<out Number>, ke: MutableList<in Number>) {
    for (x in dari) ke.add(x)
}

fun <T : Comparable<T>> terbesar(xs: List<T>): T? = xs.maxOrNull()   // batas atas

// reified: tipe generik tersedia di runtime (hanya pada fungsi inline)
inline fun <reified T> List<Any>.saring(): List<T> = filterIsInstance<T>()
inline fun <reified T : Any> namaTipe(): String = T::class.simpleName ?: "anonim"

fun main() {
    val teks: Sumber<String> = object : Sumber<String> { override fun ambil() = "halo" }
    cetakSemua(teks)                             // boleh: Sumber<String> adalah Sumber<Any> karena out

    val target = mutableListOf<Any>()
    salin(mutableListOf(1, 2, 3), target)

    val campur: List<Any> = listOf(1, "dua", 3.0, "empat")
    println(campur.saring<String>())             // [dua, empat]
    println(namaTipe<StringBuilder>())           // StringBuilder
    println(terbesar(listOf(3, 9, 4)))           // 9
}`, 'kotlin'),
      code('Type-safe builder (DSL)', `@DslMarker
annotation class LaporanDsl

@LaporanDsl
class Bagian(val judul: String) {
    val baris = mutableListOf<String>()
    fun item(teks: String) {
        baris += teks
    }
}

@LaporanDsl
class Laporan {
    var judul: String = ""
    val daftarBagian = mutableListOf<Bagian>()

    fun bagian(judul: String, isi: Bagian.() -> Unit) {     // lambda dengan receiver Bagian
        daftarBagian += Bagian(judul).apply(isi)
    }
}

fun laporan(isi: Laporan.() -> Unit): Laporan = Laporan().apply(isi)

val bulanan = laporan {
    judul = "Ringkasan Oktober"
    bagian("Pengeluaran") {
        item("Makan: Rp1.200.000")
        item("Transport: Rp450.000")
        // bagian("x") { }   ← ditolak compiler berkat @DslMarker (receiver luar tidak bocor)
    }
    bagian("Tabungan") {
        item("Dana darurat: Rp2.000.000")
    }
}`, 'kotlin'),
      code('Kotlin yang ramah Java', `class Konversi {
    companion object {
        @JvmStatic
        fun keRupiah(sen: Long): String = "Rp" + (sen / 100)  // Java: Konversi.keRupiah(...)

        const val MATA_UANG = "IDR"                           // Java: Konversi.MATA_UANG
    }
}

class Notifikasi @JvmOverloads constructor(                   // Java mendapat 3 constructor overload
    val judul: String,
    val isi: String = "",
    val penting: Boolean = false,
)

class Penyimpanan {
    @Throws(java.io.IOException::class)                       // agar Java wajib/bisa menangkap checked exception
    fun simpan(path: String, data: ByteArray) {
        java.io.File(path).writeBytes(data)
    }
}

// Memanggil Java dari Kotlin
fun contohInterop() {
    val hariIni = java.time.LocalDate.now()
    println(hariIni.dayOfWeek)                                // getDayOfWeek() dibaca sebagai properti
    val opsional = java.util.Optional.of("ada")
    val nilai: String? = opsional.orElse(null)                // Optional → nullable
    java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor().use { ex ->   // AutoCloseable.use
        ex.execute { println("jalan di virtual thread: $nilai") }                 // SAM conversion
    }
}`, 'kotlin'),
      code('Pemakaian dari Java', `String rp = Konversi.keRupiah(1_500_000);      // tanpa .Companion berkat @JvmStatic
Notifikasi a = new Notifikasi("Halo");            // overload dari @JvmOverloads
Notifikasi b = new Notifikasi("Halo", "Isi pesan");
String kode = Konversi.MATA_UANG;
// Fungsi top-level di Util.kt dipanggil sebagai UtilKt.namaFungsi(...);
// ubah nama class dengan @file:JvmName("Util") di baris pertama file Kotlin.`, 'java'),
      table(['Java', 'Kotlin', 'Arti'], [
        ['`List<? extends Number>`', '`List<out Number>`', 'Hanya dibaca (produsen)'],
        ['`Comparator<? super T>`', '`Comparator<in T>`', 'Hanya diberi nilai (konsumen)'],
        ['`List<?>`', '`List<*>`', 'Star projection: tipe tidak diketahui'],
        ['`Class<T> clazz` sebagai parameter', '`inline fun <reified T>`', 'Tipe tersedia di runtime tanpa parameter tambahan'],
      ]),
      callout('tip', 'Migrasi bertahap', 'Proyek Java bisa menambah file Kotlin satu per satu di modul yang sama (plugin `kotlin("jvm")` di Gradle). Mulailah dari test atau class baru, bukan konversi massal. Tambahkan anotasi nullability di sisi Java agar tipe di Kotlin tidak menjadi platform type.'),
      ...quiz([
        ['KT-18', 'Mengapa `Sumber<String>` boleh dipakai sebagai `Sumber<Any>` tetapi `MutableList<String>` tidak boleh sebagai `MutableList<Any>`?', '`Sumber<out T>` hanya mengeluarkan T, jadi String aman dianggap Any. `MutableList<T>` invariant karena bisa menerima T: bila diizinkan, seseorang bisa menambahkan Int ke list yang seharusnya hanya berisi String.'],
        ['KT-19', 'Mengapa `reified` hanya bisa dipakai di fungsi `inline`?', 'Pada JVM, tipe generik dihapus saat runtime (type erasure). Fungsi inline disalin ke setiap pemanggil, sehingga compiler bisa mengganti T dengan tipe konkret di lokasi pemanggilan; itulah yang membuat `T::class` dan `is T` bisa dipakai.'],
        ['KT-20', 'Apa fungsi `@DslMarker` pada builder?', 'Mencegah pemanggilan member receiver luar secara implisit dari dalam blok receiver yang lebih dalam (mis. memanggil `bagian()` di dalam blok `bagian`). Tanpa itu DSL mudah disalahgunakan dan menghasilkan struktur yang salah.'],
      ]),
      ...practice('kt-generic', [
        'Tulis `fun <T : Comparable<T>> klem(nilai: T, min: T, max: T): T` dan uji dengan Int, Double, dan LocalDate.',
        'Buat extension `inline fun <reified T> String.dariJson(): T` di atas Jackson (`jacksonObjectMapper().readValue<T>(this)`).',
        'Bangun DSL kecil untuk membuat request HTTP (`request { url = ...; header("A", "B") }`) dengan `@DslMarker`.',
        'Panggil class Kotlin dari class Java di proyek yang sama; tambahkan `@JvmStatic` dan `@JvmOverloads` sampai pemanggilan dari Java terasa wajar.',
      ]),
      references(
        ['Kotlin: Generics (in, out, where)', 'https://kotlinlang.org/docs/generics.html'],
        ['Kotlin: Type-safe builders', 'https://kotlinlang.org/docs/type-safe-builders.html'],
        ['Kotlin: Calling Java from Kotlin', 'https://kotlinlang.org/docs/java-interop.html'],
        ['Kotlin: Calling Kotlin from Java', 'https://kotlinlang.org/docs/java-to-kotlin-interop.html'],
      ),
    ],
  },
  {
    id: 'kt-spring-boot-api',
    title: 'Kotlin: REST API dengan Spring Boot',
    summary: 'Proyek dari start.spring.io, plugin kotlin-spring dan kotlin-jpa, entity, data class DTO, validasi, repository Spring Data, dan controller REST.',
    track: BACKEND, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Spring Boot mendukung Kotlin sebagai bahasa kelas satu: pilih Language = Kotlin dan Project = Gradle - Kotlin di [start.spring.io](https://start.spring.io). Konsep Spring tetap sama seperti di [Java & Spring Boot](#java); yang berubah adalah kodenya lebih ringkas dan null safety ikut menjaga API. Dua plugin compiler wajib dipahami: **kotlin-spring** (all-open) dan **kotlin-jpa** (no-arg).'),
      code('build.gradle.kts hasil start.spring.io (Web, JPA, Validation, PostgreSQL)', `// Dibuat start.spring.io pada 30 Oktober 2026 (Kotlin 2.3.21, Spring Boot 4.1.2)
plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.spring") version "2.3.21"   // all-open: class @Component/@Service/@Transactional dibuat open
    id("org.springframework.boot") version "4.1.2"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.jpa") version "2.3.21"      // no-arg: constructor tanpa argumen untuk @Entity
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("tools.jackson.module:jackson-module-kotlin")   // Jackson memahami data class & default value
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
    }
}

allOpen {                                      // entity juga dibuat open agar lazy loading (proxy) berfungsi
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}`, 'kotlin'),
      code('Entity, repository, dan DTO', `package id.contoh.dompet.transaksi

import jakarta.persistence.*
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import org.springframework.data.jpa.repository.JpaRepository

@Entity
@Table(name = "transaksi")
class TransaksiEntity(                         // class biasa, BUKAN data class
    @Column(nullable = false) var judul: String,
    @Column(nullable = false) var jumlah: Long,
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
)

interface TransaksiRepository : JpaRepository<TransaksiEntity, Long> {
    fun findByJudulContainingIgnoreCase(kata: String): List<TransaksiEntity>
}

data class BuatTransaksiRequest(
    @field:NotBlank @field:Size(max = 100) val judul: String,   // @field: = pasang di field (aman di semua konfigurasi)
    @field:Positive val jumlah: Long,
)

data class TransaksiResponse(val id: Long, val judul: String, val jumlah: Long)

fun TransaksiEntity.keResponse() = TransaksiResponse(id = requireNotNull(id), judul = judul, jumlah = jumlah)`, 'kotlin'),
      code('Service dan controller', `package id.contoh.dompet.transaksi

import jakarta.validation.Valid
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@Service
class TransaksiService(private val repo: TransaksiRepository) {   // constructor injection tanpa @Autowired

    @Transactional(readOnly = true)
    fun semua(kata: String?): List<TransaksiResponse> =
        (if (kata.isNullOrBlank()) repo.findAll() else repo.findByJudulContainingIgnoreCase(kata))
            .map { it.keResponse() }

    @Transactional(readOnly = true)
    fun cari(id: Long): TransaksiResponse =
        repo.findByIdOrNull(id)?.keResponse()                      // extension Spring Data: null, bukan Optional
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "transaksi $id tidak ditemukan")

    @Transactional
    fun buat(req: BuatTransaksiRequest): TransaksiResponse =
        repo.save(TransaksiEntity(judul = req.judul.trim(), jumlah = req.jumlah)).keResponse()
}

@RestController
@RequestMapping("/api/transaksi")
class TransaksiController(private val service: TransaksiService) {

    @GetMapping
    fun semua(@RequestParam(required = false) q: String?) = service.semua(q)   // q opsional karena String?

    @GetMapping("/{id}")
    fun satu(@PathVariable id: Long) = service.cari(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun buat(@Valid @RequestBody req: BuatTransaksiRequest) = service.buat(req)
}`, 'kotlin'),
      table(['Java + Spring', 'Kotlin + Spring'], [
        ['Lombok `@Data`/`@Value` untuk DTO', '`data class` (atau record di Java)'],
        ['`@Autowired` / `@RequiredArgsConstructor`', 'Primary constructor `class X(private val repo: Repo)`'],
        ['`Optional<T> findById`', '`findByIdOrNull(id)` → `T?`'],
        ['Class terbuka secara default', 'Plugin `kotlin-spring` membuka class beranotasi Spring'],
        ['Constructor kosong untuk JPA', 'Plugin `kotlin-jpa` (no-arg) membuatnya'],
        ['`@RequestParam(required = false)`', 'Tipe `String?` sudah menyatakan opsional'],
        ['`SpringApplication.run(App.class)`', '`runApplication<App>(*args)`'],
      ]),
      callout('warn', 'Jangan memakai data class untuk entity JPA', '`equals`/`hashCode` data class memakai semua properti, termasuk `id` yang berubah setelah `save` dan relasi lazy yang bisa memicu query atau `LazyInitializationException` saat `toString`. Gunakan class biasa untuk entity dan data class untuk DTO. Konsep repository dan validasi sama dengan [Spring Data JPA](#java.spring-data-jpa) dan [Spring Validation](#java.spring-validation).'),
      callout('info', 'Coroutines di Spring', 'Dengan Spring WebFlux (dan `kotlinx-coroutines-reactor`), handler bisa berupa `suspend fun` dan mengembalikan `Flow<T>`, sehingga kode non-blocking ditulis gaya sekuensial tanpa `Mono`/`Flux`. Untuk API CRUD dengan JPA (blocking), Spring MVC biasa seperti contoh di atas tetap pilihan paling sederhana.'),
      ...quiz([
        ['KT-21', 'Apa yang terjadi bila proyek Spring Kotlin tidak memakai plugin `kotlin-spring`?', 'Class Kotlin final secara default, sehingga Spring tidak bisa membuat proxy CGLIB untuk `@Configuration`, `@Transactional`, `@Async`, atau `@Cacheable`. Aplikasi gagal start atau anotasi itu diam-diam tidak berlaku. Plugin all-open membuat class beranotasi Spring menjadi `open` otomatis.'],
        ['KT-22', 'Mengapa anotasi validasi di DTO ditulis `@field:NotBlank` dan bukan sekadar `@NotBlank`?', 'Pada parameter constructor, anotasi tanpa target bisa terpasang di parameter saja, sementara Bean Validation memeriksa field/getter. `@field:` memastikan anotasi berada di field. Flag `-Xannotation-default-target=param-property` dari start.spring.io juga memasang anotasi ke field, tetapi `@field:` tetap benar di semua konfigurasi.'],
      ]),
      ...practice('kt-spring', [
        'Generate proyek di start.spring.io (Kotlin, Gradle - Kotlin, Web, JPA, Validation, PostgreSQL) dan jalankan dengan PostgreSQL di Docker.',
        'Implementasikan CRUD transaksi lengkap (GET list + filter, GET by id, POST, PUT, DELETE) dengan DTO data class.',
        'Tambahkan `@RestControllerAdvice` yang mengubah error validasi menjadi JSON `{ field: pesan }` dengan status 400.',
        'Uji API dengan curl/HTTP client: body tidak valid, id tidak ada (404), dan query `?q=`.',
      ]),
      references(
        ['Spring Guide: Building web applications with Spring Boot and Kotlin', 'https://spring.io/guides/tutorials/spring-boot-kotlin'],
        ['Spring Boot: Kotlin support', 'https://docs.spring.io/spring-boot/reference/features/kotlin.html'],
        ['Spring Framework: Kotlin', 'https://docs.spring.io/spring-framework/reference/languages/kotlin.html'],
        ['Kotlin: All-open compiler plugin', 'https://kotlinlang.org/docs/all-open-plugin.html'],
        ['Kotlin: No-arg compiler plugin', 'https://kotlinlang.org/docs/no-arg-plugin.html'],
      ),
    ],
  },
  {
    id: 'kt-testing',
    title: 'Kotlin: Testing dengan JUnit 5, MockK & Kotest',
    summary: 'kotlin-test + JUnit 5, mocking dengan MockK (termasuk suspend), gaya Kotest, dan menguji coroutine dengan runTest serta waktu virtual.',
    track: BACKEND, source: kotlinSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('JUnit 5 berjalan langsung untuk Kotlin; `kotlin-test` menambahkan assertion idiomatis (`assertEquals`, `assertFailsWith`). Mockito bisa dipakai, tetapi **MockK** dirancang untuk Kotlin: memahami class final, `object`, extension, dan fungsi `suspend`. Untuk coroutine, `kotlinx-coroutines-test` menyediakan `runTest` dengan **waktu virtual** sehingga `delay(1 jam)` selesai seketika.'),
      code('Dependency test (versi per 30 Oktober 2026 dari Maven Central)', `dependencies {
    testImplementation(kotlin("test"))                                          // kotlin-test + JUnit 5
    testImplementation("io.mockk:mockk:1.14.11")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.11.0")
    testImplementation("io.kotest:kotest-assertions-core:6.2.6")                 // opsional: matcher Kotest
}

tasks.test {
    useJUnitPlatform()
}`, 'kotlin'),
      code('Unit test dengan MockK dan runTest', `import io.mockk.*
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

data class Rekening(val nomor: String, val saldo: Long)

interface RekeningRepository {
    suspend fun cari(nomor: String): Rekening?
    suspend fun simpan(r: Rekening)
}

interface Notifier {
    fun kirim(nomor: String, pesan: String)
}

class TransferService(private val repo: RekeningRepository, private val notifier: Notifier) {
    suspend fun transfer(dari: String, ke: String, jumlah: Long) {
        require(jumlah > 0) { "jumlah harus positif" }
        val asal = repo.cari(dari) ?: throw NoSuchElementException("rekening $dari tidak ada")
        check(asal.saldo >= jumlah) { "saldo tidak cukup" }
        val tujuan = repo.cari(ke) ?: throw NoSuchElementException("rekening $ke tidak ada")
        repo.simpan(asal.copy(saldo = asal.saldo - jumlah))
        repo.simpan(tujuan.copy(saldo = tujuan.saldo + jumlah))
        notifier.kirim(ke, "Dana masuk $jumlah")
    }
}

class TransferServiceTest {
    private val repo = mockk<RekeningRepository>()
    private val notifier = mockk<Notifier>(relaxed = true)     // relaxed: method tanpa stub tidak error
    private val service = TransferService(repo, notifier)

    @Test
    fun \`transfer memindahkan saldo dan mengirim notifikasi\`() = runTest {
        coEvery { repo.cari("A") } returns Rekening("A", 100_000)   // coEvery untuk fungsi suspend
        coEvery { repo.cari("B") } returns Rekening("B", 0)
        val tersimpan = mutableListOf<Rekening>()
        coEvery { repo.simpan(capture(tersimpan)) } just Runs

        service.transfer("A", "B", 40_000)

        assertEquals(listOf(Rekening("A", 60_000), Rekening("B", 40_000)), tersimpan)
        verify(exactly = 1) { notifier.kirim("B", any()) }
    }

    @Test
    fun \`saldo kurang ditolak tanpa menyimpan apa pun\`() = runTest {
        coEvery { repo.cari("A") } returns Rekening("A", 10_000)

        assertFailsWith<IllegalStateException> { service.transfer("A", "B", 40_000) }
        coVerify(exactly = 0) { repo.simpan(any()) }
    }
}`, 'kotlin'),
      code('Waktu virtual dan gaya Kotest', `import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.currentTime
import kotlinx.coroutines.test.runTest
import kotlin.test.Test

class Pengingat(private val scope: CoroutineScope) {
    val terkirim = mutableListOf<String>()

    fun jadwalkan(pesan: String, tundaMs: Long) {
        scope.launch {
            delay(tundaMs)
            terkirim += pesan
        }
    }
}

class PengingatTest {
    @Test
    fun \`pengingat terkirim setelah satu jam virtual\`() = runTest {
        val pengingat = Pengingat(this)                 // pakai scheduler milik runTest
        pengingat.jadwalkan("Bayar tagihan", tundaMs = 3_600_000)

        advanceTimeBy(3_599_999)
        pengingat.terkirim.shouldBeEmpty()

        advanceUntilIdle()                              // jalankan semua yang tertunda
        pengingat.terkirim shouldBe listOf("Bayar tagihan")
        currentTime shouldBe 3_600_000L                 // selesai dalam milidetik waktu nyata
    }
}

// Kotest sebagai framework (butuh kotest-runner-junit5): gaya spesifikasi
// class DiskonSpec : FunSpec({
//     test("member dapat diskon 10%") { hitungDiskon(200_000, member = true) shouldBe 20_000 }
//     test("jumlah negatif ditolak") { shouldThrow<IllegalArgumentException> { hitungDiskon(-1, false) } }
// })`, 'kotlin'),
      table(['Kebutuhan', 'Java', 'Kotlin'], [
        ['Framework test', 'JUnit 5', 'JUnit 5 (+ `kotlin-test`) atau Kotest'],
        ['Mock', 'Mockito (`when(...).thenReturn`)', 'MockK (`every { } returns`, `coEvery` untuk suspend)'],
        ['Mock bean Spring', '`@MockitoBean`', 'SpringMockK (`@MockkBean`) atau `@MockitoBean`'],
        ['Assertion', 'AssertJ', '`kotlin.test`, matcher Kotest (`shouldBe`), atau AssertJ'],
        ['Kode asinkron', '`Awaitility`, `CompletableFuture.get`', '`runTest` + waktu virtual; Turbine untuk Flow'],
        ['Nama test', '`@DisplayName("...")`', 'Nama fungsi dengan backtick'],
      ]),
      callout('tip', 'Dispatcher di test', 'Jangan menulis `Dispatchers.IO` secara langsung di class yang diuji; terima `CoroutineDispatcher` lewat constructor agar test bisa memasukkan `StandardTestDispatcher(testScheduler)`. Untuk ViewModel Android yang memakai `Dispatchers.Main`, panggil `Dispatchers.setMain(...)` di setup dan `Dispatchers.resetMain()` di teardown.'),
      ...quiz([
        ['KT-23', 'Mengapa test coroutine memakai `runTest` dan bukan `runBlocking`?', '`runTest` memakai scheduler virtual: `delay` dilewati tanpa menunggu waktu nyata, waktu bisa dimajukan dengan `advanceTimeBy`, dan coroutine yang bocor (belum selesai) dilaporkan sebagai kegagalan. `runBlocking` benar-benar menunggu sehingga test lambat dan tidak deterministik.'],
        ['KT-24', 'Apa beda `every` dan `coEvery` di MockK?', '`every` untuk stub fungsi biasa; `coEvery` untuk fungsi `suspend` (blok stub-nya berjalan di konteks coroutine). Pasangannya untuk verifikasi adalah `verify` dan `coVerify`.'],
      ]),
      ...practice('kt-testing', [
        'Tulis test MockK untuk `TransferService`: sukses, saldo kurang, rekening tujuan tidak ada, dan jumlah nol.',
        'Uji fungsi yang melakukan retry dengan `delay` eksponensial memakai `runTest` dan pastikan `currentTime` sesuai total backoff.',
        'Ubah satu test menjadi gaya Kotest `FunSpec` dan bandingkan keterbacaannya.',
        'Tambahkan test `@SpringBootTest` untuk controller transaksi dari modul sebelumnya dengan database Testcontainers.',
      ]),
      references(
        ['Kotlin: Test code using JUnit in JVM', 'https://kotlinlang.org/docs/jvm-test-using-junit.html'],
        ['kotlinx-coroutines-test API', 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/'],
        ['Android Developers: Testing Kotlin coroutines', 'https://developer.android.com/kotlin/coroutines/test'],
        ['MockK', 'https://mockk.io/'],
        ['Kotest', 'https://kotest.io/'],
      ),
    ],
  },
  {
    id: 'kt-compose-dasar',
    title: 'Android: Dasar Jetpack Compose',
    summary: 'Fungsi @Composable, state & remember, recomposition, state hoisting, ViewModel + StateFlow, dan layar daftar dengan LazyColumn.',
    track: ANDROID, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Jetpack Compose adalah toolkit UI deklaratif resmi Android: UI ditulis sebagai fungsi Kotlin `@Composable` yang menerima state dan menggambarkan tampilan. Saat state berubah, Compose memanggil ulang (**recomposition**) hanya fungsi yang membaca state tersebut. Buat proyek di Android Studio dengan template **Empty Activity**; template ini sudah memasang plugin Compose compiler dan Compose BOM. Ingin satu kode untuk Android dan iOS dengan Dart? Lihat kurikulum [Mobile: Flutter & Cross-Platform](#flutter).'),
      code('Composable, state, remember, dan state hoisting', `import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

// Stateful: memegang state. rememberSaveable bertahan saat rotasi layar (remember tidak)
@Composable
fun PenghitungLayar(modifier: Modifier = Modifier) {
    var jumlah by rememberSaveable { mutableIntStateOf(0) }
    Penghitung(jumlah = jumlah, onTambah = { jumlah++ }, onReset = { jumlah = 0 }, modifier = modifier)
}

// Stateless: menerima state dan event (state hoisting) → mudah di-preview dan diuji
@Composable
fun Penghitung(jumlah: Int, onTambah: () -> Unit, onReset: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.padding(16.dp)) {
        Text("Diklik $jumlah kali", style = MaterialTheme.typography.headlineSmall)
        Row {
            Button(onClick = onTambah) { Text("Tambah") }
            Button(onClick = onReset, enabled = jumlah > 0) { Text("Reset") }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PenghitungPreview() {
    MaterialTheme { Penghitung(jumlah = 3, onTambah = {}, onReset = {}) }
}`, 'kotlin'),
      code('ViewModel + StateFlow', `import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.IOException

data class TransaksiItem(val id: Long, val judul: String, val jumlah: Long)

data class TransaksiUiState(
    val memuat: Boolean = true,
    val items: List<TransaksiItem> = emptyList(),
    val error: String? = null,
)

interface TransaksiRepository {
    suspend fun semua(): List<TransaksiItem>
}

class TransaksiViewModel(private val repo: TransaksiRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(TransaksiUiState())
    val uiState: StateFlow<TransaksiUiState> = _uiState.asStateFlow()

    init {
        muat()
    }

    fun muat() {
        viewModelScope.launch {                          // dibatalkan otomatis saat ViewModel dibersihkan
            _uiState.update { it.copy(memuat = true, error = null) }
            try {
                val items = repo.semua()
                _uiState.update { it.copy(memuat = false, items = items) }
            } catch (e: IOException) {
                _uiState.update { it.copy(memuat = false, error = e.message ?: "Gagal memuat") }
            }
        }
    }
}`, 'kotlin'),
      code('Layar daftar dengan LazyColumn', `// build.gradle.kts (modul app), versi per 30 Oktober 2026:
//   implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
//   implementation("androidx.lifecycle:lifecycle-runtime-compose:2.11.0")
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

class RepositoriContoh : TransaksiRepository {
    override suspend fun semua() = listOf(TransaksiItem(1, "Kopi", 25_000), TransaksiItem(2, "Bensin", 50_000))
}

@Composable
fun TransaksiScreen(viewModel: TransaksiViewModel = viewModel { TransaksiViewModel(RepositoriContoh()) }) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()   // berhenti collect saat app di background
    TransaksiContent(state = state, onMuatUlang = viewModel::muat)
}

@Composable
fun TransaksiContent(state: TransaksiUiState, onMuatUlang: () -> Unit, modifier: Modifier = Modifier) {
    val error = state.error
    when {
        state.memuat -> Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        error != null -> Column(
            modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(error)
            Button(onClick = onMuatUlang) { Text("Coba lagi") }
        }
        else -> LazyColumn(modifier.fillMaxSize()) {
            items(state.items, key = { it.id }) { item ->          // key stabil: animasi & state per baris benar
                ListItem(
                    headlineContent = { Text(item.judul) },
                    trailingContent = { Text("Rp\${item.jumlah}") },
                )
                HorizontalDivider()
            }
        }
    }
}`, 'kotlin'),
      table(['Konsep', 'View/XML lama', 'Jetpack Compose', 'Flutter'], [
        ['Bahasa UI', 'XML + Kotlin/Java', 'Kotlin (`@Composable`)', 'Dart (widget)'],
        ['Update tampilan', 'Ubah view manual (`setText`)', 'Recomposition otomatis dari state', 'Rebuild widget dari `setState`/state management'],
        ['State lokal', 'Field Activity/Fragment', '`remember` / `rememberSaveable`', '`StatefulWidget`'],
        ['Daftar', '`RecyclerView` + Adapter', '`LazyColumn` + `items`', '`ListView.builder`'],
        ['State layar', 'ViewModel + LiveData', 'ViewModel + StateFlow', 'Provider/Riverpod/Bloc'],
        ['Platform', 'Android', 'Android (Compose Multiplatform untuk lainnya)', 'Android, iOS, web, desktop'],
      ]),
      callout('tip', 'Aturan recomposition', 'Composable harus bebas efek samping dan murah dipanggil berulang: jangan memanggil API atau menulis database langsung di dalamnya. Jalankan efek di ViewModel atau `LaunchedEffect`. Turunkan state ke bawah sebagai parameter dan naikkan event ke atas sebagai lambda (unidirectional data flow), serta gunakan data class immutable untuk UI state.'),
      ...quiz([
        ['KT-25', 'Apa beda `remember` dan `rememberSaveable`?', '`remember` menyimpan nilai selama composable tetap berada di komposisi, tetapi hilang saat Activity dibuat ulang (rotasi layar, ganti tema). `rememberSaveable` juga menyimpannya ke saved instance state sehingga bertahan dari pembuatan ulang Activity dan process death untuk tipe yang bisa disimpan.'],
        ['KT-26', 'Mengapa memakai `collectAsStateWithLifecycle()` dibanding `collectAsState()` di Android?', '`collectAsStateWithLifecycle` berhenti mengumpulkan Flow saat lifecycle di bawah STARTED (app di background) dan melanjutkan saat kembali terlihat, sehingga tidak membuang baterai atau sumber daya. `collectAsState` terus mengumpulkan selama composable ada di komposisi.'],
        ['KT-27', 'Apa manfaat state hoisting seperti memisahkan `PenghitungLayar` dan `Penghitung`?', 'Composable stateless lebih mudah dipakai ulang, di-preview dengan data apa pun, dan diuji karena perilakunya hanya ditentukan parameter. Sumber kebenaran state tetap satu (di pemanggil atau ViewModel).'],
      ]),
      ...practice('kt-compose', [
        'Buat proyek Empty Activity di Android Studio dan tampilkan `PenghitungLayar`; pastikan nilai bertahan saat layar diputar.',
        'Implementasikan `TransaksiViewModel` dengan repositori palsu yang kadang melempar `IOException`, dan tampilkan tiga state: memuat, error, daftar.',
        'Tambahkan form tambah transaksi (TextField judul & jumlah) dengan validasi di ViewModel.',
        'Tulis unit test ViewModel memakai `runTest` dan `Dispatchers.setMain(StandardTestDispatcher())`.',
      ]),
      references(
        ['Android Developers: Thinking in Compose', 'https://developer.android.com/develop/ui/compose/mental-model'],
        ['Android Developers: State and Jetpack Compose', 'https://developer.android.com/develop/ui/compose/state'],
        ['Android Developers: Lists and grids', 'https://developer.android.com/develop/ui/compose/lists'],
        ['Android Developers: ViewModel overview', 'https://developer.android.com/topic/libraries/architecture/viewmodel'],
        ['Android Developers: Compose BOM', 'https://developer.android.com/develop/ui/compose/bom'],
      ),
    ],
  },
];

export const kotlinCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'kotlin',
  title: 'Kotlin: Bahasa, Coroutines & Spring Boot',
  short: 'Kotlin',
  monogram: 'Kt',
  hue: 'pink',
  description: 'Kotlin modern untuk developer Java: sintaks, null safety, data & sealed class, koleksi, coroutines dan Flow, generic & DSL, interop Java, REST API Spring Boot, testing dengan MockK dan runTest, serta dasar Jetpack Compose untuk Android.',
  tracks: kotlinTracks,
  sources: [kotlinSource],
  intro: [
    {
      type: 'callout',
      tone: 'tip',
      title: 'Untuk siapa kurikulum ini',
      text: 'Ditulis untuk developer yang sudah memahami Java (lihat [Java & Spring Boot](#java)). Setiap modul membandingkan pola Java dengan padanan Kotlin-nya. Jalur yang disarankan: Kotlin Dasar → [Coroutines](#kotlin.kt-coroutines) → [REST API dengan Spring Boot](#kotlin.kt-spring-boot-api). Untuk mobile, lanjutkan ke [Dasar Jetpack Compose](#kotlin.kt-compose-dasar) atau pilih jalur lintas platform di [Flutter](#flutter).',
    },
  ],
  modules: kotlinModules,
};
