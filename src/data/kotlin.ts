import type { Curriculum, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const DASAR = 'Kotlin Dasar';
const LANJUTAN = 'Kotlin Lanjutan';
const BACKEND = 'Kotlin untuk Backend';
const ANDROID = 'Android: Jetpack Compose';
const KMP = 'Kotlin Multiplatform';

export const kotlinSource = 'Kotlin: materi tulisan tangan dari dokumentasi resmi Kotlin, kotlinx.coroutines, Spring, dan Android Developers (30 Oktober 2026); ditambah Ktor, Exposed & Flyway, arsitektur & data layer Android, Hilt, dan Kotlin Multiplatform (2 November 2026)';

const kotlinTracks: Track[] = [
  { title: DASAR, summary: 'Setup, sintaks, null safety, fungsi & lambda, class/data/sealed, koleksi, dan scope function.' },
  { title: LANJUTAN, summary: 'Coroutines, Flow, generic & variance, DSL, dan interop dengan Java.' },
  { title: BACKEND, summary: 'REST API Spring Boot dan Ktor dengan Kotlin, database dengan Exposed + Flyway, lalu testing dengan JUnit 5, MockK, Kotest, runTest, dan testApplication.' },
  { title: ANDROID, summary: 'UI deklaratif dengan Jetpack Compose, arsitektur (ViewModel, UiState, Navigation type-safe), data layer offline-first (Retrofit/Ktor, Room), Hilt, dan testing UI.' },
  { title: KMP, summary: 'Berbagi logika Kotlin antara Android, iOS, desktop, dan server: expect/actual, shared module, dan Compose Multiplatform.' },
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
    id: 'kt-ktor-server',
    title: 'Kotlin: Ktor Server — Routing, Plugin & JWT',
    summary: 'REST API dengan Ktor 3: routing, plugin ContentNegotiation, RequestValidation, StatusPages, autentikasi JWT, konfigurasi YAML, dan testing dengan testApplication.',
    track: BACKEND, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('**Ktor** adalah framework web asinkron buatan JetBrains yang ditulis penuh dengan Kotlin dan coroutines. Berbeda dengan Spring Boot yang menyiapkan banyak hal lewat auto-configuration, aplikasi Ktor dimulai kosong: setiap kemampuan (JSON, autentikasi, logging, CORS) dipasang eksplisit sebagai **plugin** dengan `install(...)`. Hasilnya aplikasi kecil, start cepat, alur request mudah dilacak, dan setiap handler adalah lambda `suspend`.'),
      paragraph('Ktor cocok untuk microservice ringan, BFF (backend-for-frontend) aplikasi mobile, atau saat ingin berbagi model dengan [Kotlin Multiplatform](#kotlin.kt-kmp). Pilih [Spring Boot](#kotlin.kt-spring-boot-api) bila tim butuh ekosistem enterprise lengkap (Spring Data, Security, Batch). Proyek baru bisa dibuat di [start.ktor.io](https://start.ktor.io) atau plugin Ktor di IntelliJ IDEA; contoh di bawah memakai Ktor 3.x (cek versi terbaru di situs Ktor).'),
      code('build.gradle.kts', `// gradle.properties: ktor_version=3.x.y dan logback_version=1.5.x → isi dengan versi terbaru
plugins {
    kotlin("jvm") version "2.3.21"
    kotlin("plugin.serialization") version "2.3.21"   // @Serializable untuk kotlinx.serialization
    application
}

val ktor_version: String by project
val logback_version: String by project

application {
    mainClass = "id.contoh.dompet.ApplicationKt"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-server-config-yaml:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-request-validation:$ktor_version")
    implementation("io.ktor:ktor-server-status-pages:$ktor_version")
    implementation("io.ktor:ktor-server-call-logging:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-auth-jwt:$ktor_version")
    runtimeOnly("ch.qos.logback:logback-classic:$logback_version")

    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("io.ktor:ktor-client-content-negotiation:$ktor_version")
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(21)
}`, 'kotlin'),
      code('Application.kt — plugin, error handling, dan JWT', `package id.contoh.dompet

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.config.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.requestvalidation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.util.Date

fun main(args: Array<String>) = io.ktor.server.netty.EngineMain.main(args)   // membaca application.yaml

@Serializable
data class ErrorResponse(val kode: String, val pesan: String)

data class JwtConfig(val secret: String, val issuer: String, val audience: String, val realm: String) {
    fun buatToken(username: String): String = JWT.create()
        .withAudience(audience)
        .withIssuer(issuer)
        .withClaim("username", username)
        .withExpiresAt(Date(System.currentTimeMillis() + 60 * 60 * 1000))    // 1 jam
        .sign(Algorithm.HMAC256(secret))

    companion object {
        fun dari(c: ApplicationConfig) = JwtConfig(
            secret = c.property("jwt.secret").getString(),
            issuer = c.property("jwt.issuer").getString(),
            audience = c.property("jwt.audience").getString(),
            realm = c.propertyOrNull("jwt.realm")?.getString() ?: "dompet",
        )
    }
}

// Modul produksi: dirakit dari konfigurasi
fun Application.module() = configure(JwtConfig.dari(environment.config), TransaksiRepoMemori())

// Dipisah agar test bisa memasukkan konfigurasi dan repository palsu
fun Application.configure(jwt: JwtConfig, repo: TransaksiRepo) {
    install(CallLogging)
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
    install(RequestValidation) {
        validate<BuatTransaksi> { req ->
            when {
                req.judul.isBlank() -> ValidationResult.Invalid("judul wajib diisi")
                req.jumlah <= 0 -> ValidationResult.Invalid("jumlah harus positif")
                else -> ValidationResult.Valid
            }
        }
    }
    install(StatusPages) {                     // handler dengan tipe paling spesifik yang dipilih
        exception<RequestValidationException> { call, e ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("VALIDASI", e.reasons.joinToString()))
        }
        exception<BadRequestException> { call, _ ->      // JSON rusak / tipe salah
            call.respond(HttpStatusCode.BadRequest, ErrorResponse("BODY_TIDAK_VALID", "format body salah"))
        }
        exception<NoSuchElementException> { call, e ->
            call.respond(HttpStatusCode.NotFound, ErrorResponse("TIDAK_DITEMUKAN", e.message ?: "tidak ditemukan"))
        }
        exception<Throwable> { call, e ->
            call.application.log.error("error tak terduga", e)
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("INTERNAL", "terjadi kesalahan"))
        }
    }
    install(Authentication) {
        jwt("auth-jwt") {
            realm = jwt.realm
            verifier(
                JWT.require(Algorithm.HMAC256(jwt.secret))
                    .withAudience(jwt.audience)
                    .withIssuer(jwt.issuer)
                    .build()
            )
            validate { cred ->
                if (cred.payload.getClaim("username").asString().isNullOrBlank()) null else JWTPrincipal(cred.payload)
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("UNAUTHORIZED", "token tidak valid atau kedaluwarsa"))
            }
        }
    }
    ruteAuth(jwt)
    ruteTransaksi(repo)
}`, 'kotlin'),
      code('Routes.kt — routing dan rute terproteksi', `package id.contoh.dompet

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

@Serializable data class LoginRequest(val username: String, val password: String)
@Serializable data class TokenResponse(val token: String)
@Serializable data class BuatTransaksi(val judul: String, val jumlah: Long)
@Serializable data class Transaksi(val id: Long, val pemilik: String, val judul: String, val jumlah: Long)

interface TransaksiRepo {
    suspend fun milik(pemilik: String): List<Transaksi>
    suspend fun cari(id: Long, pemilik: String): Transaksi?
    suspend fun buat(pemilik: String, req: BuatTransaksi): Transaksi
}

class TransaksiRepoMemori : TransaksiRepo {
    private val data = ConcurrentHashMap<Long, Transaksi>()
    private val seq = AtomicLong()
    override suspend fun milik(pemilik: String) = data.values.filter { it.pemilik == pemilik }.sortedBy { it.id }
    override suspend fun cari(id: Long, pemilik: String) = data[id]?.takeIf { it.pemilik == pemilik }
    override suspend fun buat(pemilik: String, req: BuatTransaksi) =
        Transaksi(seq.incrementAndGet(), pemilik, req.judul.trim(), req.jumlah).also { data[it.id] = it }
}

fun Application.ruteAuth(jwt: JwtConfig) = routing {
    get("/health") { call.respondText("OK") }
    post("/auth/login") {
        val req = call.receive<LoginRequest>()
        // DEMO saja: di produksi cocokkan hash password (bcrypt/argon2) dari database
        if (req.password != "rahasia") {
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse("LOGIN_GAGAL", "username atau password salah"))
            return@post
        }
        call.respond(TokenResponse(jwt.buatToken(req.username)))
    }
}

fun Application.ruteTransaksi(repo: TransaksiRepo) = routing {
    authenticate("auth-jwt") {
        route("/api/transaksi") {
            get {
                call.respond(repo.milik(call.pemilik()))
            }
            get("/{id}") {
                val id = call.parameters["id"]?.toLongOrNull()
                    ?: throw BadRequestException("id harus angka")
                val t = repo.cari(id, call.pemilik()) ?: throw NoSuchElementException("transaksi $id tidak ditemukan")
                call.respond(t)
            }
            post {
                val req = call.receive<BuatTransaksi>()        // divalidasi plugin RequestValidation
                call.respond(HttpStatusCode.Created, repo.buat(call.pemilik(), req))
            }
        }
    }
}

private fun ApplicationCall.pemilik(): String =
    requireNotNull(principal<JWTPrincipal>()?.payload?.getClaim("username")?.asString())`, 'kotlin'),
      code('src/main/resources/application.yaml', `ktor:
  deployment:
    port: "$PORT:8080"            # env PORT bila ada, selain itu 8080
  application:
    modules:
      - id.contoh.dompet.ApplicationKt.module

jwt:
  secret: "$JWT_SECRET"           # wajib dari environment, jangan ditulis di repo
  issuer: "https://dompet.contoh.id"
  audience: "dompet-api"
  realm: "dompet"`, 'yaml'),
      code('TransaksiApiTest.kt — testApplication', `package id.contoh.dompet

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class TransaksiApiTest {
    private val jwt = JwtConfig(secret = "rahasia-test", issuer = "test", audience = "test", realm = "test")

    // Server in-memory tanpa port jaringan; client JSON siap pakai
    private fun ujiApi(blok: suspend ApplicationTestBuilder.(HttpClient) -> Unit) = testApplication {
        environment { config = MapApplicationConfig() }      // jangan muat modul dari application.yaml
        application { configure(jwt, TransaksiRepoMemori()) }
        blok(createClient { install(ContentNegotiation) { json() } })
    }

    @Test
    fun \`tanpa token ditolak 401\`() = ujiApi { client ->
        assertEquals(HttpStatusCode.Unauthorized, client.get("/api/transaksi").status)
    }

    @Test
    fun \`buat lalu baca transaksi milik sendiri\`() = ujiApi { client ->
        val token = jwt.buatToken("budi")
        val res = client.post("/api/transaksi") {
            bearerAuth(token)
            contentType(ContentType.Application.Json)
            setBody(BuatTransaksi("Kopi", 25_000))
        }
        assertEquals(HttpStatusCode.Created, res.status)
        val dibuat = res.body<Transaksi>()

        val daftar = client.get("/api/transaksi") { bearerAuth(token) }.body<List<Transaksi>>()
        assertEquals(listOf(dibuat), daftar)

        val olehOrangLain = client.get("/api/transaksi/\${dibuat.id}") { bearerAuth(jwt.buatToken("sari")) }
        assertEquals(HttpStatusCode.NotFound, olehOrangLain.status)   // tidak membocorkan data pengguna lain
    }

    @Test
    fun \`jumlah negatif menghasilkan 400\`() = ujiApi { client ->
        val res = client.post("/api/transaksi") {
            bearerAuth(jwt.buatToken("budi"))
            contentType(ContentType.Application.Json)
            setBody(BuatTransaksi("Kopi", -5))
        }
        assertEquals(HttpStatusCode.BadRequest, res.status)
    }
}`, 'kotlin'),
      table(['Kebutuhan', 'Spring Boot', 'Ktor'], [
        ['Menambah fitur', 'Starter + auto-configuration', '`install(Plugin) { ... }` eksplisit'],
        ['Routing', '`@RestController` + `@GetMapping`', 'DSL `routing { route { get { } } }`'],
        ['JSON', 'Jackson otomatis', '`ContentNegotiation` + `json()` (kotlinx.serialization)'],
        ['Validasi', 'Bean Validation `@Valid`', 'Plugin `RequestValidation` atau validasi manual'],
        ['Error global', '`@RestControllerAdvice`', 'Plugin `StatusPages`'],
        ['Autentikasi', 'Spring Security', 'Plugin `Authentication` (`jwt`, `basic`, `session`, `oauth`)'],
        ['Dependency injection', 'Container Spring', 'Manual (parameter fungsi) atau library (Koin, Ktor DI)'],
        ['Test HTTP', '`MockMvc` / `@SpringBootTest`', '`testApplication` (in-memory, tanpa port)'],
      ]),
      callout('warn', 'JWT di produksi', 'Secret HMAC minimal 256 bit dan diambil dari environment atau secret manager, bukan dari repo. Selalu verifikasi `issuer`, `audience`, dan waktu kedaluwarsa (sudah dilakukan `JWT.require(...).build()`). Untuk banyak service, pertimbangkan RS256 dengan endpoint JWKS (`jwt { verifier(jwkProvider, issuer) }`) agar service lain tidak perlu memegang secret penandatangan.'),
      callout('tip', 'Urutan plugin dan struktur kode', 'Pasang plugin sebelum routing yang memakainya. Pecah rute per fitur sebagai extension `fun Application.ruteX()` atau `fun Route.ruteX()`, dan rakit dependency di satu tempat (`configure`) sehingga test cukup memanggil fungsi yang sama dengan objek palsu.'),
      ...quiz([
        ['KT-28', 'Apa beda cara Ktor dan Spring Boot menambahkan fitur seperti JSON atau autentikasi?', 'Spring Boot mengaktifkan fitur secara otomatis begitu starter ada di classpath (auto-configuration). Ktor tidak melakukan apa pun sampai plugin dipasang eksplisit dengan `install(...)` beserta konfigurasinya, sehingga semua perilaku terlihat di kode, dengan konsekuensi lebih banyak wiring manual.'],
        ['KT-29', 'Mengapa `exception<BadRequestException>` perlu ditulis terpisah padahal sudah ada `exception<Throwable>`?', 'StatusPages memilih handler dengan tipe paling spesifik. Tanpa handler khusus, body JSON yang rusak (dilempar sebagai `BadRequestException`) akan ditangkap handler `Throwable` dan dijawab 500, padahal itu kesalahan klien yang seharusnya 400.'],
        ['KT-30', 'Mengapa test memanggil `application { configure(...) }` dan memasang `MapApplicationConfig()` kosong?', 'Agar test tidak memuat modul produksi dari `application.yaml` (yang membutuhkan env `JWT_SECRET` dan bisa memasang plugin dua kali), dan agar test memakai secret serta repository palsu yang dikendalikan sendiri. Server berjalan in-memory sehingga test cepat dan deterministik.'],
      ]),
      ...practice('kt-ktor', [
        'Buat proyek Ktor (start.ktor.io atau Gradle manual), jalankan `./gradlew run`, dan cek `GET /health`.',
        'Tambahkan `PUT` dan `DELETE /api/transaksi/{id}` yang hanya boleh dilakukan pemilik transaksi.',
        'Lengkapi test: token kedaluwarsa (buat token dengan `withExpiresAt` di masa lalu) → 401, id bukan angka → 400.',
        'Pasang plugin `CORS` dan `CallId`, lalu pastikan header `X-Request-Id` muncul di log setiap request.',
      ]),
      references(
        ['Ktor: Create a new project', 'https://ktor.io/docs/server-create-a-new-project.html'],
        ['Ktor: Content negotiation and serialization', 'https://ktor.io/docs/server-serialization.html'],
        ['Ktor: Status pages', 'https://ktor.io/docs/server-status-pages.html'],
        ['Ktor: JSON Web Tokens', 'https://ktor.io/docs/server-jwt.html'],
        ['Ktor: Request validation', 'https://ktor.io/docs/server-request-validation.html'],
        ['Ktor: Testing', 'https://ktor.io/docs/server-testing.html'],
      ),
    ],
  },
  {
    id: 'kt-ktor-exposed',
    title: 'Kotlin: Database dengan Exposed & Flyway di Ktor',
    summary: 'Exposed DSL vs DAO, koneksi HikariCP, migrasi skema dengan Flyway, transaksi dan row lock, serta memanggil JDBC dari handler suspend dengan aman.',
    track: BACKEND, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('**Exposed** adalah library SQL dari JetBrains dengan dua gaya: **DSL** yang mirip SQL bertipe (`selectAll().where { ... }`) dan **DAO** yang mirip ORM ringan (entity dengan properti). Keduanya berjalan di atas JDBC, sehingga bersifat *blocking*. Skema database tidak dibuat dari kode, melainkan dikelola **Flyway**: file SQL bernomor yang dijalankan berurutan dan dicatat di tabel riwayat, sehingga setiap lingkungan (lokal, staging, produksi) punya skema yang sama.'),
      paragraph('Modul ini melanjutkan [Ktor Server](#kotlin.kt-ktor-server): `TransaksiRepoMemori` diganti implementasi PostgreSQL tanpa mengubah rute. Catatan versi: sejak **Exposed 1.0** nama package berubah menjadi `org.jetbrains.exposed.v1.core` / `.jdbc` / `.dao` (contoh lama memakai `org.jetbrains.exposed.sql`), dan beberapa signature ikut bergeser. Import sengaja tidak ditulis di contoh; biarkan IDE melengkapinya dan cocokkan dengan dokumentasi versi yang Anda pakai.'),
      code('Dependency dan migrasi pertama', `// build.gradle.kts (tambahan) — isi versi terbaru di gradle.properties
dependencies {
    implementation("org.jetbrains.exposed:exposed-core:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-dao:$exposed_version")       // hanya bila memakai gaya DAO
    implementation("com.zaxxer:HikariCP:$hikari_version")                      // connection pool
    implementation("org.flywaydb:flyway-core:$flyway_version")
    implementation("org.flywaydb:flyway-database-postgresql:$flyway_version")  // modul database terpisah sejak Flyway 10
    runtimeOnly("org.postgresql:postgresql:$postgres_version")
}

// src/main/resources/db/migration/V1__buat_rekening_transaksi.sql
// CREATE TABLE rekening (
//     id      BIGSERIAL PRIMARY KEY,
//     pemilik VARCHAR(50) NOT NULL UNIQUE,
//     saldo   BIGINT      NOT NULL DEFAULT 0 CHECK (saldo >= 0)
// );
// CREATE TABLE transaksi (
//     id          BIGSERIAL PRIMARY KEY,
//     rekening_id BIGINT       NOT NULL REFERENCES rekening(id),
//     judul       VARCHAR(100) NOT NULL,
//     jumlah      BIGINT       NOT NULL,
//     dibuat      TIMESTAMPTZ  NOT NULL DEFAULT now()
// );
// CREATE INDEX idx_transaksi_rekening ON transaksi (rekening_id, id DESC);`, 'kotlin'),
      code('Tabel dan repository gaya DSL', `object RekeningTable : LongIdTable("rekening") {
    val pemilik = varchar("pemilik", 50).uniqueIndex()
    val saldo = long("saldo")
}

object TransaksiTable : LongIdTable("transaksi") {
    val rekening = reference("rekening_id", RekeningTable)     // foreign key → bisa innerJoin
    val judul = varchar("judul", 100)
    val jumlah = long("jumlah")
    // kolom 'dibuat' diisi DEFAULT database; tidak wajib dideklarasikan bila tidak dibaca
}

// JDBC blocking → jalankan di Dispatchers.IO agar thread event loop Ktor tidak tertahan
suspend fun <T> dbQuery(db: Database, blok: () -> T): T =
    withContext(Dispatchers.IO) { transaction(db) { blok() } }

class TransaksiRepoExposed(private val db: Database) : TransaksiRepo {

    override suspend fun milik(pemilik: String): List<Transaksi> = dbQuery(db) {
        (TransaksiTable innerJoin RekeningTable)
            .selectAll()
            .where { RekeningTable.pemilik eq pemilik }
            .orderBy(TransaksiTable.id to SortOrder.DESC)
            .limit(100)
            .map { it.keTransaksi() }
    }

    override suspend fun cari(id: Long, pemilik: String): Transaksi? = dbQuery(db) {
        (TransaksiTable innerJoin RekeningTable)
            .selectAll()
            .where { (TransaksiTable.id eq id) and (RekeningTable.pemilik eq pemilik) }
            .singleOrNull()
            ?.keTransaksi()
    }

    override suspend fun buat(pemilik: String, req: BuatTransaksi): Transaksi = dbQuery(db) {
        val rekeningId = RekeningTable.selectAll().where { RekeningTable.pemilik eq pemilik }
            .singleOrNull()?.get(RekeningTable.id)
            ?: RekeningTable.insertAndGetId { it[RekeningTable.pemilik] = pemilik; it[saldo] = 0 }
        val id = TransaksiTable.insertAndGetId {
            it[rekening] = rekeningId
            it[judul] = req.judul.trim()
            it[jumlah] = req.jumlah
        }
        Transaksi(id.value, pemilik, req.judul.trim(), req.jumlah)
    }

    // Satu transaksi database: semua berhasil atau semua di-rollback saat exception
    suspend fun transfer(dari: String, ke: String, jumlah: Long): Unit = dbQuery(db) {
        require(jumlah > 0) { "jumlah harus positif" }
        fun kunci(p: String) = RekeningTable.selectAll().where { RekeningTable.pemilik eq p }
            .forUpdate()                                            // SELECT ... FOR UPDATE: cegah lost update
            .singleOrNull() ?: throw NoSuchElementException("rekening $p tidak ada")
        val asal = kunci(dari)
        val tujuan = kunci(ke)
        check(asal[RekeningTable.saldo] >= jumlah) { "saldo tidak cukup" }
        RekeningTable.update({ RekeningTable.id eq asal[RekeningTable.id] }) { it[saldo] = asal[saldo] - jumlah }
        RekeningTable.update({ RekeningTable.id eq tujuan[RekeningTable.id] }) { it[saldo] = tujuan[saldo] + jumlah }
    }
}

private fun ResultRow.keTransaksi() = Transaksi(
    id = this[TransaksiTable.id].value,
    pemilik = this[RekeningTable.pemilik],
    judul = this[TransaksiTable.judul],
    jumlah = this[TransaksiTable.jumlah],
)`, 'kotlin'),
      code('Gaya DAO untuk perbandingan', `class RekeningEntity(id: EntityID<Long>) : LongEntity(id) {
    companion object : LongEntityClass<RekeningEntity>(RekeningTable)
    var pemilik by RekeningTable.pemilik
    var saldo by RekeningTable.saldo
    val transaksi by TransaksiEntity referrersOn TransaksiTable.rekening   // relasi satu-ke-banyak
}

class TransaksiEntity(id: EntityID<Long>) : LongEntity(id) {
    companion object : LongEntityClass<TransaksiEntity>(TransaksiTable)
    var rekening by RekeningEntity referencedOn TransaksiTable.rekening
    var judul by TransaksiTable.judul
    var jumlah by TransaksiTable.jumlah
}

fun contohDao(db: Database) = transaction(db) {
    val budi = RekeningEntity.find { RekeningTable.pemilik eq "budi" }.single()
    TransaksiEntity.new {
        rekening = budi
        judul = "Kopi"
        jumlah = 25_000
    }
    budi.saldo -= 25_000                              // perubahan properti di-flush saat commit
    // Waspada N+1: memuat relasi untuk banyak rekening → pakai eager loading
    RekeningEntity.all().with(RekeningEntity::transaksi).forEach { r -> println("\${r.pemilik}: \${r.transaksi.count()}") }
}`, 'kotlin'),
      code('Merakit di Ktor: pool, migrasi, lalu koneksi', `fun Application.module() {
    val cfg = environment.config
    val ds = HikariDataSource(HikariConfig().apply {
        jdbcUrl = cfg.property("db.url").getString()          // mis. jdbc:postgresql://localhost:5432/dompet
        username = cfg.property("db.user").getString()
        password = cfg.property("db.password").getString()
        maximumPoolSize = 10
    })
    Flyway.configure().dataSource(ds).load().migrate()       // migrasi selesai sebelum menerima request
    val db = Database.connect(ds)
    monitor.subscribe(ApplicationStopped) { ds.close() }     // tutup pool saat server berhenti

    configure(JwtConfig.dari(cfg), TransaksiRepoExposed(db))
}`, 'kotlin'),
      table(['Aspek', 'DSL', 'DAO'], [
        ['Bentuk kode', 'Query bertipe mirip SQL', 'Entity dengan properti, mirip ORM'],
        ['Kontrol SQL', 'Tinggi: join, agregasi, `forUpdate`, batch', 'Lebih abstrak; query kompleks tetap turun ke DSL'],
        ['Hasil', '`ResultRow` → dipetakan manual ke data class', 'Objek entity yang hidup di dalam transaksi'],
        ['Risiko umum', 'Mapping berulang', 'N+1 query, akses entity di luar `transaction`'],
        ['Cocok untuk', 'API dengan query beragam, laporan', 'CRUD sederhana dengan relasi'],
      ]),
      callout('warn', 'Transaksi pendek dan tanpa I/O lain', 'Selama blok `transaction` berjalan, satu koneksi pool dan lock baris tertahan. Jangan memanggil HTTP, mengirim email, atau `delay` di dalamnya; lakukan setelah commit (atau pakai pola outbox). Ingat juga bahwa transaksi Exposed terikat ke thread: jangan berpindah dispatcher di tengah blok. Exposed menyediakan API transaksi suspend dan (sejak 1.0) modul R2DBC; cek nama API yang tepat di dokumentasi versi Anda.'),
      callout('info', 'SchemaUtils vs Flyway', '`SchemaUtils.create(TransaksiTable)` praktis untuk prototipe atau test, tetapi tidak menyimpan riwayat dan tidak bisa mengubah kolom dengan aman. Untuk aplikasi nyata gunakan migrasi bernomor (`V2__tambah_kategori.sql`) yang tidak pernah diedit setelah dijalankan. Konsep migrasi sama dengan Flyway di ekosistem Spring/Java.'),
      ...quiz([
        ['KT-31', 'Kapan memilih DSL dan kapan DAO di Exposed?', 'DSL saat butuh kendali SQL: join, agregasi, filter dinamis, `FOR UPDATE`, atau batch insert, dengan hasil dipetakan ke data class yang aman dibawa keluar transaksi. DAO nyaman untuk CRUD sederhana berbasis entity dan relasi, dengan catatan entity hanya valid di dalam `transaction` dan rawan N+1 bila relasi tidak di-eager load.'],
        ['KT-32', 'Mengapa `transaction { }` dibungkus `withContext(Dispatchers.IO)` di handler Ktor?', 'JDBC memblokir thread selama menunggu database. Handler Ktor berjalan di thread event loop/dispatcher terbatas; bila diblokir, request lain ikut tertahan. `Dispatchers.IO` menyediakan pool thread yang memang untuk operasi blocking.'],
        ['KT-33', 'Pada `transfer`, apa fungsi `forUpdate()` dan mengapa pengecekan saldo saja tidak cukup?', 'Tanpa lock, dua transfer bersamaan bisa membaca saldo yang sama lalu sama-sama menulis hasilnya (lost update), sehingga saldo akhir salah. `SELECT ... FOR UPDATE` mengunci baris rekening sampai commit, sehingga transfer kedua menunggu dan membaca saldo terbaru. Constraint `CHECK (saldo >= 0)` menjadi pengaman terakhir di database.'],
      ]),
      ...practice('kt-exposed', [
        'Jalankan PostgreSQL di Docker, buat migrasi `V1`, dan pastikan tabel `flyway_schema_history` terisi saat aplikasi start.',
        'Ganti `TransaksiRepoMemori` dengan `TransaksiRepoExposed` tanpa mengubah kode rute; semua test API tetap lulus (jalankan dengan database Testcontainers).',
        'Tambahkan migrasi `V2__tambah_kategori.sql` (kolom `kategori` dengan default) dan endpoint ringkasan total per kategori memakai `groupBy` + `sum` di DSL.',
        'Uji `transfer` dengan dua coroutine bersamaan dari rekening yang sama dan buktikan saldo akhir benar.',
      ]),
      references(
        ['Exposed documentation', 'https://www.jetbrains.com/help/exposed/home.html'],
        ['Exposed (GitHub)', 'https://github.com/JetBrains/Exposed'],
        ['Ktor: Integrate a database with Exposed', 'https://ktor.io/docs/server-integrate-database.html'],
        ['Flyway documentation', 'https://documentation.red-gate.com/flyway'],
        ['HikariCP', 'https://github.com/brettwooldridge/HikariCP'],
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
  {
    id: 'kt-android-arsitektur',
    title: 'Android: Arsitektur — ViewModel, UiState & Navigation Type-Safe',
    summary: 'Lapisan UI/domain/data, UiState dengan sealed interface, event sebagai state, SavedStateHandle, Navigation Compose dengan route @Serializable, dan efek lifecycle di Compose.',
    track: ANDROID, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Panduan arsitektur resmi Android membagi aplikasi menjadi **UI layer** (composable + ViewModel), **data layer** (repository + sumber data), dan opsional **domain layer** (use case). Aturannya: data mengalir turun sebagai state, event mengalir naik sebagai pemanggilan fungsi (*unidirectional data flow*), dan setiap data punya satu sumber kebenaran. Modul ini melanjutkan [Dasar Jetpack Compose](#kotlin.kt-compose-dasar) dengan beberapa layar yang saling bernavigasi.'),
      paragraph('Sejak Navigation Compose 2.8.0, route tidak lagi ditulis sebagai string `"detail/{id}"` melainkan sebagai tipe Kotlin `@Serializable`. Compiler memeriksa argumen, dan ViewModel bisa membaca argumen yang sama dari `SavedStateHandle`. Google juga merilis **Navigation 3** (`androidx.navigation3`) dengan model back stack yang dikelola sendiri; konsep route bertipe di bawah tetap relevan, tetapi cek dokumentasi bila memulai proyek baru.'),
      code('Gradle dan definisi route', `// app/build.gradle.kts (tambahan) — versi dari Compose BOM / version catalog proyek Anda
plugins {
    kotlin("plugin.serialization") version "2.3.21"      // samakan dengan versi Kotlin proyek
}
dependencies {
    implementation("androidx.navigation:navigation-compose:$navVersion")   // route type-safe butuh 2.8.0+
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$serializationVersion")
}

// Navigation.kt
import kotlinx.serialization.Serializable

@Serializable data object DaftarRoute
@Serializable data class DetailRoute(val id: Long)        // argumen wajib, bertipe
@Serializable data class TambahRoute(val kategoriAwal: String? = null)   // argumen opsional`, 'kotlin'),
      code('NavHost dengan route bertipe', `import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute

@Composable
fun DompetNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = DaftarRoute) {
        composable<DaftarRoute> {
            DaftarScreen(
                onBukaDetail = { id -> navController.navigate(DetailRoute(id)) },
                onTambah = { navController.navigate(TambahRoute()) },
            )
        }
        composable<DetailRoute> { entry ->
            val route: DetailRoute = entry.toRoute()          // argumen dibaca bertipe, tanpa parsing string
            DetailScreen(judulBar = "Transaksi #\${route.id}", onKembali = { navController.popBackStack() })
        }
        composable<TambahRoute> {
            TambahScreen(onSelesai = {
                // Kembali ke daftar dan buang layar tambah dari back stack
                navController.navigate(DaftarRoute) { popUpTo<DaftarRoute> { inclusive = true } }
            })
        }
    }
}`, 'kotlin'),
      code('UiState sealed, SavedStateHandle, dan event sebagai state', `import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.IOException

sealed interface DetailUiState {
    data object Memuat : DetailUiState
    data class Tampil(val item: TransaksiItem, val menghapus: Boolean = false) : DetailUiState
    data class Error(val pesan: String) : DetailUiState
    data object Terhapus : DetailUiState                   // "event" navigasi dimodelkan sebagai state
}

interface DetailRepository {
    suspend fun cari(id: Long): TransaksiItem?              // TransaksiItem dari modul Dasar Compose
    suspend fun hapus(id: Long)
}

class DetailViewModel(savedStateHandle: SavedStateHandle, private val repo: DetailRepository) : ViewModel() {
    private val id = savedStateHandle.toRoute<DetailRoute>().id   // bertahan saat process death

    private val _uiState = MutableStateFlow<DetailUiState>(DetailUiState.Memuat)
    val uiState: StateFlow<DetailUiState> = _uiState.asStateFlow()

    init { muat() }

    fun muat() {
        viewModelScope.launch {
            _uiState.value = try {
                repo.cari(id)?.let { DetailUiState.Tampil(it) } ?: DetailUiState.Error("Transaksi tidak ditemukan")
            } catch (e: IOException) {
                DetailUiState.Error(e.message ?: "Gagal memuat")
            }
        }
    }

    fun hapus() {
        val sekarang = _uiState.value as? DetailUiState.Tampil ?: return
        _uiState.value = sekarang.copy(menghapus = true)
        viewModelScope.launch {
            _uiState.value = try {
                repo.hapus(id)
                DetailUiState.Terhapus
            } catch (e: IOException) {
                DetailUiState.Error(e.message ?: "Gagal menghapus")
            }
        }
    }
}`, 'kotlin'),
      code('Layar: collect state, reaksi navigasi, dan efek lifecycle', `import androidx.compose.runtime.*
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun DetailScreen(
    judulBar: String,
    onKembali: () -> Unit,
    // Tanpa DI: factory membaca SavedStateHandle milik back stack entry (Hilt menggantikannya di modul berikutnya)
    viewModel: DetailViewModel = viewModel { DetailViewModel(createSavedStateHandle(), RepositoriDetailContoh()) },
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(state) {                                   // jalan ulang setiap state berubah
        if (state is DetailUiState.Terhapus) onKembali()
    }
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {        // muat ulang saat kembali dari background
        viewModel.muat()
    }

    DetailContent(judulBar = judulBar, state = state, onHapus = viewModel::hapus, onCobaLagi = viewModel::muat)
}`, 'kotlin'),
      table(['Tempat menyimpan', 'Rotasi / ganti tema', 'Process death', 'Pakai untuk'], [
        ['`remember`', 'Hilang', 'Hilang', 'State UI sementara (animasi, popup terbuka)'],
        ['`rememberSaveable`', 'Bertahan', 'Bertahan', 'Input teks, tab terpilih, posisi scroll'],
        ['`ViewModel` (field / StateFlow)', 'Bertahan', 'Hilang', 'UiState, data yang sudah dimuat'],
        ['`SavedStateHandle`', 'Bertahan', 'Bertahan', 'Argumen route, query pencarian, filter kecil'],
        ['Room / DataStore', 'Bertahan', 'Bertahan', 'Data persisten, preferensi pengguna'],
      ]),
      callout('tip', 'Event sekali jalan', 'Panduan Android menyarankan event dari ViewModel (navigasi setelah hapus, snackbar) dimodelkan sebagai **state** yang dikonsumsi UI, bukan `SharedFlow`/`Channel` yang bisa hilang saat UI tidak sedang collect (misalnya saat rotasi). Setelah UI bereaksi, ViewModel bisa mereset state-nya (`pesanDitampilkan()`).'),
      callout('warn', 'Kirim ID, bukan objek', 'Route sebaiknya berisi ID atau nilai kecil, bukan objek domain lengkap. Objek besar membengkakkan saved state (batas Bundle) dan cepat basi; layar tujuan memuat ulang data dari repository berdasarkan ID, yang juga membuat deep link bekerja.'),
      ...quiz([
        ['KT-34', 'Mengapa route `DetailRoute(val id: Long)` lebih baik daripada string `"detail/{id}"`?', 'Route bertipe dicek compiler: argumen yang salah tipe atau terlupa menjadi error kompilasi, bukan crash saat runtime. Tidak ada parsing string manual, dan argumen yang sama dibaca dengan `toRoute()` baik di composable maupun di ViewModel lewat `SavedStateHandle`.'],
        ['KT-35', 'Mengapa navigasi setelah hapus dimodelkan sebagai `DetailUiState.Terhapus`, bukan event di `SharedFlow`?', 'SharedFlow tanpa replay membuang event bila tidak ada collector aktif, misalnya saat Activity sedang dibuat ulang, sehingga navigasi bisa hilang. State selalu memiliki nilai terkini yang akan dibaca UI begitu kembali aktif, sehingga reaksinya terjamin dan mudah diuji.'],
        ['KT-36', 'Data apa yang hilang saat process death dan bagaimana menjaganya?', 'Semua isi memori proses: field ViewModel dan `remember`. Yang bertahan adalah `rememberSaveable`, `SavedStateHandle` (termasuk argumen route), serta data persisten di Room/DataStore. Simpan state kecil yang penting untuk memulihkan layar di saved state, lalu muat ulang data besar dari repository.'],
      ]),
      ...practice('kt-android-arch', [
        'Bangun tiga layar (Daftar, Detail, Tambah) dengan route `@Serializable` dan `NavHost`; tidak ada route berupa string.',
        'Implementasikan `DetailViewModel` dengan `SavedStateHandle.toRoute()` dan uji dengan `SavedStateHandle(mapOf("id" to 7L))` di unit test.',
        'Simulasikan process death (Developer options → Don\'t keep activities) dan pastikan layar Detail pulih dengan ID yang benar.',
        'Tampilkan snackbar "Transaksi dihapus" di layar Daftar memakai state, bukan SharedFlow.',
      ]),
      references(
        ['Android Developers: Guide to app architecture', 'https://developer.android.com/topic/architecture'],
        ['Android Developers: UI layer', 'https://developer.android.com/topic/architecture/ui-layer'],
        ['Android Developers: UI events', 'https://developer.android.com/topic/architecture/ui-layer/events'],
        ['Android Developers: Type safety in Kotlin DSL and Navigation Compose', 'https://developer.android.com/guide/navigation/design/type-safety'],
        ['Android Developers: Saved state module for ViewModel', 'https://developer.android.com/topic/libraries/architecture/viewmodel/viewmodel-savedstate'],
      ),
    ],
  },
  {
    id: 'kt-android-data-layer',
    title: 'Android: Data Layer Offline-First — Retrofit/Ktor, Room & Repository',
    summary: 'DTO dengan kotlinx.serialization, Retrofit atau Ktor client, Room dengan Flow, repository sebagai satu sumber kebenaran, antrean tulis offline, dan sinkronisasi dengan WorkManager.',
    track: ANDROID, source: kotlinSource, duration: '4 jam', level: 'Hard',
    blocks: [
      paragraph('Aplikasi mobile hidup di jaringan yang tidak bisa diandalkan: lift, kereta bawah tanah, sinyal lemah. Pola **offline-first** membuat database lokal (Room) menjadi **satu sumber kebenaran**: UI selalu membaca dari Room lewat `Flow`, sedangkan jaringan hanya dipakai untuk menyinkronkan isi database. Hasilnya layar langsung tampil dengan data terakhir, dan perubahan pengguna tidak hilang saat offline.'),
      paragraph('Data layer terdiri dari tiga jenis model: **DTO** (bentuk JSON dari API), **entity** (bentuk tabel Room), dan **model domain** (yang dipakai UI). Pemisahan ini mencegah perubahan API atau skema database merembet ke seluruh UI. Repository adalah satu-satunya kelas yang tahu ketiganya.'),
      code('API: DTO, Retrofit, dan alternatif Ktor client', `// app/build.gradle.kts (tambahan) — ambil versi terbaru dari dokumentasi masing-masing
// implementation("com.squareup.retrofit2:retrofit:$retrofitVersion")
// implementation("com.squareup.retrofit2:converter-kotlinx-serialization:$retrofitVersion")
// implementation("com.squareup.okhttp3:logging-interceptor:$okhttpVersion")
// implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$serializationVersion")
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.create
import retrofit2.http.*

@Serializable
data class TransaksiDto(
    val id: Long,
    val judul: String,
    val jumlah: Long,
    @SerialName("updated_at") val diperbaruiPada: Long,      // nama JSON berbeda dari nama properti
)

@Serializable
data class BuatTransaksiDto(@SerialName("client_id") val idKlien: String, val judul: String, val jumlah: Long)

interface DompetApi {
    @GET("transaksi")
    suspend fun semua(@Query("sejak") sejak: Long? = null): List<TransaksiDto>   // null → parameter tidak dikirim

    @POST("transaksi")
    suspend fun buat(@Body body: BuatTransaksiDto): TransaksiDto
}

val jsonApi = Json { ignoreUnknownKeys = true }              // field baru di API tidak membuat app crash

fun buatApi(baseUrl: String): DompetApi = Retrofit.Builder()
    .baseUrl(baseUrl)                                        // wajib diakhiri "/"
    .client(OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
        .build())
    .addConverterFactory(jsonApi.asConverterFactory("application/json".toMediaType()))
    .build()
    .create()

// Alternatif Ktor client (juga bisa dipakai ulang di Kotlin Multiplatform):
// val client = HttpClient(OkHttp) {
//     expectSuccess = true                                  // 4xx/5xx → exception
//     install(ContentNegotiation) { json(jsonApi) }
//     install(HttpTimeout) { requestTimeoutMillis = 15_000 }
//     defaultRequest { url("https://api.contoh.id/") }
// }
// suspend fun semua(): List<TransaksiDto> = client.get("transaksi").body()`, 'kotlin'),
      code('Room: entity, DAO dengan Flow, dan antrean tertunda', `// plugins { id("com.google.devtools.ksp") }   dependencies: room-runtime, room-ktx, ksp(room-compiler)
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "transaksi")
data class TransaksiEntity(
    @PrimaryKey val id: Long,
    val judul: String,
    val jumlah: Long,
    val diperbaruiPada: Long,
)

@Entity(tableName = "transaksi_tertunda")
data class TransaksiTertunda(
    @PrimaryKey val idKlien: String,                         // UUID dibuat di perangkat → idempoten di server
    val judul: String,
    val jumlah: Long,
)

@Dao
interface TransaksiDao {
    @Query("SELECT * FROM transaksi ORDER BY diperbaruiPada DESC")
    fun amatiSemua(): Flow<List<TransaksiEntity>>           // emit ulang setiap tabel berubah

    @Query("SELECT * FROM transaksi_tertunda")
    fun amatiTertunda(): Flow<List<TransaksiTertunda>>

    @Query("SELECT MAX(diperbaruiPada) FROM transaksi")
    suspend fun terakhirDiperbarui(): Long?

    @Upsert
    suspend fun upsert(items: List<TransaksiEntity>)

    @Insert
    suspend fun antre(item: TransaksiTertunda)

    @Query("SELECT * FROM transaksi_tertunda")
    suspend fun tertunda(): List<TransaksiTertunda>

    @Delete
    suspend fun hapusTertunda(item: TransaksiTertunda)
}

@Database(entities = [TransaksiEntity::class, TransaksiTertunda::class], version = 1)
abstract class DompetDatabase : RoomDatabase() {            // ekspor skema (room.schemaLocation) untuk test migrasi
    abstract fun transaksiDao(): TransaksiDao
}`, 'kotlin'),
      code('Repository offline-first', `import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import retrofit2.HttpException
import java.io.IOException
import java.util.UUID

data class Transaksi(val kunci: String, val judul: String, val jumlah: Long, val tertunda: Boolean)

class TransaksiRepositoryOffline(private val api: DompetApi, private val dao: TransaksiDao) {

    // UI hanya membaca database: data server + perubahan lokal yang belum terkirim
    val transaksi: Flow<List<Transaksi>> = combine(dao.amatiSemua(), dao.amatiTertunda()) { server, lokal ->
        lokal.map { Transaksi("lokal-\${it.idKlien}", it.judul, it.jumlah, tertunda = true) } +
            server.map { Transaksi("srv-\${it.id}", it.judul, it.jumlah, tertunda = false) }
    }

    suspend fun tambah(judul: String, jumlah: Long) {
        dao.antre(TransaksiTertunda(UUID.randomUUID().toString(), judul, jumlah))   // tulis lokal dulu
        sinkron()                                                                // gagal = dicoba lagi nanti
    }

    /** Retrofit suspend dan DAO suspend sudah main-safe; tidak perlu withContext di sini. */
    suspend fun sinkron(): Boolean = try {
        for (t in dao.tertunda()) {                          // 1. dorong perubahan lokal
            val hasil = api.buat(BuatTransaksiDto(t.idKlien, t.judul, t.jumlah))
            dao.upsert(listOf(hasil.keEntity()))
            dao.hapusTertunda(t)
        }
        val sejak = dao.terakhirDiperbarui()                 // 2. tarik perubahan server secara inkremental
        dao.upsert(api.semua(sejak).map { it.keEntity() })
        true
    } catch (e: IOException) {                               // offline / timeout
        false
    } catch (e: HttpException) {                             // 4xx/5xx
        false
    }
}

private fun TransaksiDto.keEntity() = TransaksiEntity(id, judul, jumlah, diperbaruiPada)

// Sinkron berkala hanya saat ada jaringan (WorkManager bertahan walau app ditutup):
// val req = PeriodicWorkRequestBuilder<SinkronWorker>(15, TimeUnit.MINUTES)
//     .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
//     .build()
// WorkManager.getInstance(context).enqueueUniquePeriodicWork("sinkron", ExistingPeriodicWorkPolicy.KEEP, req)
// SinkronWorker : CoroutineWorker → doWork() { if (repo.sinkron()) Result.success() else Result.retry() }`, 'kotlin'),
      table(['Komponen', 'Pilihan umum', 'Catatan'], [
        ['HTTP client', 'Retrofit + OkHttp', 'Standar de facto Android; interface beranotasi'],
        ['', 'Ktor client', 'API Kotlin murni, bisa dipakai di Kotlin Multiplatform'],
        ['JSON', 'kotlinx.serialization', 'Tanpa refleksi, aman untuk R8; `ignoreUnknownKeys` untuk API yang berkembang'],
        ['Database lokal', 'Room', 'SQLite dengan query dicek saat kompilasi, `Flow` reaktif, migrasi teruji'],
        ['Preferensi kecil', 'DataStore', 'Pengganti SharedPreferences, asinkron dan aman dari ANR'],
        ['Sinkronisasi latar', 'WorkManager', 'Constraint jaringan/baterai, retry dengan backoff, bertahan setelah restart'],
      ]),
      callout('warn', 'Jebakan `runCatching` di coroutine', '`runCatching { }` dan `catch (e: Exception)` ikut menangkap `CancellationException`, sehingga coroutine yang seharusnya dibatalkan (layar ditutup) tetap berjalan. Tangkap exception spesifik seperti contoh di atas (`IOException`, `HttpException`) atau lempar ulang `CancellationException`.'),
      callout('info', 'Konflik dan idempotensi', '`idKlien` UUID dikirim ke server agar permintaan yang terulang (misalnya respons hilang lalu dicoba lagi) tidak membuat transaksi ganda. Untuk data yang bisa diedit di beberapa perangkat, tentukan strategi konflik sejak awal: *last write wins* berdasarkan `diperbaruiPada`, atau tolak di server dengan nomor versi.'),
      ...quiz([
        ['KT-37', 'Mengapa UI membaca dari Room, bukan langsung dari hasil API?', 'Dengan Room sebagai satu sumber kebenaran, layar langsung tampil dari data terakhir walau offline, perubahan dari sinkronisasi otomatis mengalir lewat `Flow`, dan tidak ada dua versi data (cache vs respons API) yang bisa saling bertentangan. Jaringan hanya bertugas memperbarui database.'],
        ['KT-38', 'Apa risiko tanpa `ignoreUnknownKeys = true` pada kotlinx.serialization?', 'Secara default kotlinx.serialization melempar exception saat JSON berisi field yang tidak ada di DTO. Begitu backend menambah field baru, versi aplikasi lama yang sudah terpasang di ponsel pengguna akan gagal mem-parse respons. Dengan opsi ini field tak dikenal diabaikan.'],
        ['KT-39', 'Mengapa antrean tertunda memakai UUID buatan perangkat, bukan menunggu ID dari server?', 'Item harus punya identitas sejak dibuat offline agar bisa ditampilkan, dihapus dari antrean, dan dikirim ulang. Bila respons `POST` hilang lalu dikirim ulang, server bisa mengenali UUID yang sama dan tidak membuat duplikat (idempoten).'],
      ]),
      ...practice('kt-android-data', [
        'Buat `DompetApi` (Retrofit) terhadap API Ktor dari modul [Ktor Server](#kotlin.kt-ktor-server) atau mock server, dengan DTO `@Serializable`.',
        'Implementasikan Room + `TransaksiRepositoryOffline`; matikan jaringan emulator, tambah transaksi, lalu nyalakan dan pastikan item tertunda terkirim sekali saja.',
        'Tulis test DAO dengan `Room.inMemoryDatabaseBuilder` dan test repository dengan API palsu yang melempar `IOException`.',
        'Jadwalkan `SinkronWorker` dengan WorkManager dan constraint jaringan; amati statusnya di App Inspection → Background Task Inspector.',
      ]),
      references(
        ['Android Developers: Data layer', 'https://developer.android.com/topic/architecture/data-layer'],
        ['Android Developers: Build an offline-first app', 'https://developer.android.com/topic/architecture/data-layer/offline-first'],
        ['Android Developers: Room', 'https://developer.android.com/training/data-storage/room'],
        ['Retrofit', 'https://square.github.io/retrofit/'],
        ['Ktor client', 'https://ktor.io/docs/client-create-new-application.html'],
        ['kotlinx.serialization guide', 'https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md'],
        ['Android Developers: WorkManager', 'https://developer.android.com/topic/libraries/architecture/workmanager'],
      ),
    ],
  },
  {
    id: 'kt-android-hilt-testing',
    title: 'Android: Dependency Injection dengan Hilt & Testing Compose UI',
    summary: 'Setup Hilt dengan KSP, @HiltAndroidApp, @Module/@Provides/@Binds, @HiltViewModel + hiltViewModel(), lalu test Compose UI dan mengganti modul dengan @TestInstallIn.',
    track: ANDROID, source: kotlinSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Pada modul sebelumnya ViewModel dibuat manual dengan factory (`viewModel { DetailViewModel(...) }`). Saat dependency bertambah (API, database, dispatcher, repository), wiring manual menjadi berantakan. **Hilt** adalah library dependency injection resmi Android di atas Dagger: dependency dideklarasikan dengan anotasi, graph-nya diperiksa saat kompilasi, dan umurnya terikat ke komponen Android (aplikasi, Activity, ViewModel).'),
      paragraph('Manfaat terbesar DI justru terasa di test: implementasi asli (Retrofit, Room) bisa ditukar dengan versi palsu tanpa mengubah kode produksi. Modul ini menutup dengan **test Compose UI**: memeriksa tampilan lewat *semantics tree* (teks, peran, tag) dan mensimulasikan klik, seperti pengguna sungguhan.'),
      code('Setup Gradle (tambahkan ke konfigurasi yang sudah ada)', `// build.gradle.kts (root): daftarkan plugin
plugins {
    id("com.google.devtools.ksp") version "$kspVersion" apply false
    id("com.google.dagger.hilt.android") version "$hiltVersion" apply false   // versi terbaru: dagger.dev/hilt
}

// app/build.gradle.kts
plugins {
    id("com.google.devtools.ksp")
    id("com.google.dagger.hilt.android")
}

android {
    defaultConfig {
        testInstrumentationRunner = "id.contoh.dompet.HiltTestRunner"
    }
}

dependencies {
    implementation("com.google.dagger:hilt-android:$hiltVersion")
    ksp("com.google.dagger:hilt-android-compiler:$hiltVersion")
    // hiltViewModel() untuk Compose. Rilis androidx.hilt terbaru memindahkannya ke artefak
    // androidx.hilt:hilt-lifecycle-viewmodel-compose; ikuti dokumentasi versi yang Anda pakai.
    implementation("androidx.hilt:hilt-navigation-compose:$androidxHiltVersion")

    androidTestImplementation("com.google.dagger:hilt-android-testing:$hiltVersion")
    kspAndroidTest("com.google.dagger:hilt-android-compiler:$hiltVersion")
    androidTestImplementation(platform("androidx.compose:compose-bom:$composeBomVersion"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`, 'kotlin'),
      code('Application, modul, dan ViewModel', `import android.app.Application
import android.content.Context
import androidx.room.Room
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

@HiltAndroidApp                                          // daftarkan di AndroidManifest: android:name=".DompetApp"
class DompetApp : Application()

// MainActivity: @AndroidEntryPoint class MainActivity : ComponentActivity() { ... }

@Module
@InstallIn(SingletonComponent::class)
object DataModule {                                      // @Provides: untuk objek yang dibuat lewat builder/library
    @Provides @Singleton
    fun database(@ApplicationContext context: Context): DompetDatabase =
        Room.databaseBuilder(context, DompetDatabase::class.java, "dompet.db").build()

    @Provides
    fun transaksiDao(db: DompetDatabase): TransaksiDao = db.transaksiDao()

    @Provides @Singleton
    fun api(): DompetApi = buatApi("https://api.contoh.id/")
}

class TransaksiRepositoryImpl @Inject constructor(       // @Inject constructor: Hilt tahu cara membuatnya
    private val api: DompetApi,
    private val dao: TransaksiDao,
) : TransaksiRepository {                                 // interface dari modul Dasar Compose
    override suspend fun semua(): List<TransaksiItem> =
        api.semua().map { TransaksiItem(it.id, it.judul, it.jumlah) }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {                        // @Binds: memetakan interface → implementasi
    @Binds @Singleton
    abstract fun transaksiRepository(impl: TransaksiRepositoryImpl): TransaksiRepository
}

@HiltViewModel
class TransaksiViewModelHilt @Inject constructor(private val repo: TransaksiRepository) : ViewModel() {
    // isi sama dengan TransaksiViewModel di modul Dasar Compose (uiState + muat())
}

// Di composable: argumen route & SavedStateHandle tetap tersedia untuk ViewModel
// @Composable fun TransaksiScreen(viewModel: TransaksiViewModelHilt = hiltViewModel()) { ... }`, 'kotlin'),
      code('Test Compose UI untuk composable stateless (androidTest)', `import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class TransaksiContentTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun errorMenampilkanPesanDanTombolCobaLagi() {
        var dimuatUlang = 0
        composeRule.setContent {
            TransaksiContent(state = TransaksiUiState(memuat = false, error = "Tidak ada koneksi"), onMuatUlang = { dimuatUlang++ })
        }

        composeRule.onNodeWithText("Tidak ada koneksi").assertIsDisplayed()
        composeRule.onNodeWithText("Coba lagi").assertHasClickAction().performClick()
        assertEquals(1, dimuatUlang)
    }

    @Test
    fun daftarMenampilkanSetiapTransaksi() {
        val items = listOf(TransaksiItem(1, "Kopi", 25_000), TransaksiItem(2, "Bensin", 50_000))
        composeRule.setContent { TransaksiContent(state = TransaksiUiState(memuat = false, items = items), onMuatUlang = {}) }

        composeRule.onNodeWithText("Kopi").assertIsDisplayed()
        composeRule.onNodeWithText("Rp50000").assertIsDisplayed()
        // Untuk elemen tanpa teks unik, beri Modifier.testTag("daftar-transaksi") lalu onNodeWithTag(...)
    }
}`, 'kotlin'),
      code('Test end-to-end dengan Hilt: ganti repository asli', `import android.app.Application
import android.content.Context
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.test.runner.AndroidJUnitRunner
import dagger.Binds
import dagger.Module
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn
import javax.inject.Inject
import javax.inject.Singleton
import org.junit.Rule
import org.junit.Test

class HiltTestRunner : AndroidJUnitRunner() {            // pakai Application khusus test dari Hilt
    override fun newApplication(cl: ClassLoader?, name: String?, context: Context?): Application =
        super.newApplication(cl, HiltTestApplication::class.java.name, context)
}

class FakeTransaksiRepository @Inject constructor() : TransaksiRepository {
    override suspend fun semua() = listOf(TransaksiItem(1, "Kopi", 25_000))
}

@Module
@TestInstallIn(components = [SingletonComponent::class], replaces = [RepositoryModule::class])
abstract class FakeRepositoryModule {                    // berlaku untuk SEMUA test di androidTest
    @Binds @Singleton
    abstract fun transaksiRepository(fake: FakeTransaksiRepository): TransaksiRepository
}

@HiltAndroidTest
class TransaksiScreenTest {
    @get:Rule(order = 0) val hiltRule = HiltAndroidRule(this)                       // graph dibuat lebih dulu
    @get:Rule(order = 1) val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun layarMemuatDataDariRepository() {
        composeRule.waitUntil(timeoutMillis = 5_000) {
            composeRule.onAllNodesWithText("Kopi").fetchSemanticsNodes().isNotEmpty()
        }
    }
}`, 'kotlin'),
      table(['Anotasi', 'Fungsi'], [
        ['`@HiltAndroidApp`', 'Membuat komponen tingkat aplikasi; wajib di class `Application`'],
        ['`@AndroidEntryPoint`', 'Mengizinkan injeksi ke Activity/Fragment (dan `hiltViewModel()` di dalamnya)'],
        ['`@Inject constructor`', 'Cara termudah: Hilt membuat class dari constructor-nya'],
        ['`@Module` + `@InstallIn`', 'Kumpulan cara membuat dependency, terpasang di komponen tertentu'],
        ['`@Provides`', 'Fungsi pembuat untuk class library/builder (Retrofit, Room)'],
        ['`@Binds`', 'Memetakan interface ke implementasi; lebih efisien dari `@Provides`'],
        ['`@Singleton` / `@ViewModelScoped`', 'Scope: satu instance per aplikasi / per ViewModel'],
        ['`@HiltViewModel`', 'ViewModel yang dependency-nya disuntik Hilt'],
        ['`@TestInstallIn`', 'Mengganti modul produksi di seluruh test instrumentasi'],
      ]),
      callout('tip', 'Uji di tingkat yang tepat', 'Sebagian besar logika diuji dengan unit test ViewModel + repository palsu (cepat, di JVM). Test Compose UI paling murah untuk composable stateless seperti `TransaksiContent`; test end-to-end dengan Hilt dan Activity cukup untuk beberapa alur utama. Test Compose juga bisa dijalankan di JVM dengan Robolectric. Unit test ViewModel tanpa Hilt: cukup panggil constructor-nya dengan objek palsu (lihat [Testing Kotlin](#kotlin.kt-testing)).'),
      ...quiz([
        ['KT-40', 'Apa beda `@Binds` dan `@Provides`?', '`@Binds` adalah fungsi abstrak yang hanya memberi tahu Hilt "bila diminta interface X, berikan implementasi Y" (Y harus punya `@Inject constructor`); tidak ada kode pembuat sehingga lebih efisien. `@Provides` adalah fungsi konkret yang membangun objek sendiri, dipakai untuk class library atau objek yang dibuat lewat builder seperti Retrofit dan Room.'],
        ['KT-41', 'Mengapa test UI lebih disukai menguji `TransaksiContent` daripada `TransaksiScreen`?', '`TransaksiContent` stateless: hasilnya hanya bergantung pada parameter, sehingga setiap state (memuat, error, daftar) bisa diuji langsung tanpa ViewModel, jaringan, atau DI, dan test-nya cepat serta stabil. `TransaksiScreen` cukup diuji di beberapa test end-to-end.'],
        ['KT-42', 'Mengapa `HiltAndroidRule` diberi `order = 0`?', 'Rule Hilt harus membuat graph dependency sebelum Activity diluncurkan oleh compose rule; bila urutannya terbalik, Activity mencoba menyuntik dependency dari komponen yang belum siap dan test gagal.'],
      ]),
      ...practice('kt-hilt', [
        'Migrasikan aplikasi dari modul sebelumnya ke Hilt: `@HiltAndroidApp`, `@AndroidEntryPoint`, `DataModule`, `RepositoryModule`, dan `hiltViewModel()`.',
        'Tambahkan qualifier `@IoDispatcher` untuk `CoroutineDispatcher` dan suntikkan ke repository.',
        'Tulis test Compose untuk tiga state `TransaksiContent` dan satu test form tambah (`performTextInput`, tombol nonaktif saat input kosong).',
        'Buat test end-to-end dengan `@TestInstallIn` yang memakai repository palsu dan jalankan `./gradlew connectedAndroidTest`.',
      ]),
      references(
        ['Android Developers: Dependency injection with Hilt', 'https://developer.android.com/training/dependency-injection/hilt-android'],
        ['Android Developers: Hilt testing guide', 'https://developer.android.com/training/dependency-injection/hilt-testing'],
        ['Android Developers: Hilt and Jetpack integrations', 'https://developer.android.com/training/dependency-injection/hilt-jetpack'],
        ['Android Developers: Test your Compose layout', 'https://developer.android.com/develop/ui/compose/testing'],
        ['Dagger Hilt', 'https://dagger.dev/hilt/'],
      ),
    ],
  },
  {
    id: 'kt-kmp',
    title: 'Kotlin Multiplatform: expect/actual, Shared Module & Compose Multiplatform',
    summary: 'Struktur proyek KMP, source set commonMain/androidMain/iosMain, expect/actual, shared module dengan Ktor client, memanggil Kotlin dari Swift, gambaran Compose Multiplatform, dan kapan memakainya.',
    track: KMP, source: kotlinSource, duration: '4 jam', level: 'Hard',
    blocks: [
      paragraph('**Kotlin Multiplatform (KMP)** memungkinkan satu kode Kotlin dikompilasi ke beberapa target: JVM/Android, iOS (Kotlin/Native), desktop, web (JS/Wasm), dan server. Berbeda dengan Flutter yang juga menggambar UI sendiri, KMP awalnya fokus pada **berbagi logika** (model, validasi, networking, repository) sementara UI tetap native: Jetpack Compose di Android, SwiftUI di iOS. Tim bisa mulai kecil, misalnya hanya modul validasi, lalu memperluasnya.'),
      paragraph('Untuk berbagi UI juga, JetBrains menyediakan **Compose Multiplatform**: API Compose yang sama di Android, iOS, desktop, dan web. Dukungan iOS-nya dinyatakan Stable sejak Compose Multiplatform 1.8 (2025). Proyek baru paling mudah dibuat dengan wizard di [kmp.jetbrains.com](https://kmp.jetbrains.com) atau Android Studio/IntelliJ IDEA dengan plugin Kotlin Multiplatform; struktur Gradle terus berkembang, jadi jadikan template terbaru sebagai acuan.'),
      code('Struktur proyek dan shared/build.gradle.kts', `// dompet/
// ├── androidApp/          ← aplikasi Android (Compose), bergantung pada :shared
// ├── iosApp/              ← proyek Xcode (SwiftUI), mengimpor framework "Shared"
// └── shared/src/
//     ├── commonMain/kotlin   ← kode bersama: model, repository, use case
//     ├── commonTest/kotlin   ← test yang dijalankan di semua target
//     ├── androidMain/kotlin  ← actual untuk Android (boleh memakai API Android/Java)
//     └── iosMain/kotlin      ← actual untuk iOS (boleh memakai framework Apple: platform.UIKit, platform.Foundation)

plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")    // template baru bisa memakai plugin com.android.kotlin.multiplatform.library
}

val ktor_version: String by project

kotlin {
    androidTarget()
    listOf(iosArm64(), iosSimulatorArm64()).forEach { target ->
        target.binaries.framework {
            baseName = "Shared"                              // nama modul yang di-import di Swift
            isStatic = true
        }
    }
    jvm()                                                     // opsional: dipakai server Ktor atau desktop

    sourceSets {
        commonMain.dependencies {
            implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
            implementation("io.ktor:ktor-client-core:$ktor_version")
            implementation("io.ktor:ktor-client-content-negotiation:$ktor_version")
            implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
        }
        androidMain.dependencies {
            implementation("io.ktor:ktor-client-okhttp:$ktor_version")   // engine HTTP Android
        }
        iosMain.dependencies {
            implementation("io.ktor:ktor-client-darwin:$ktor_version")   // engine NSURLSession
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}

android {
    namespace = "id.contoh.dompet.shared"
    compileSdk = 36
    defaultConfig { minSdk = 24 }
}`, 'kotlin'),
      code('expect/actual', `// commonMain/kotlin/Platform.kt — deklarasi tanpa implementasi
expect fun namaPlatform(): String
expect fun idUnik(): String

class Sapaan {
    fun teks(): String = "Halo dari \${namaPlatform()}"
}

// androidMain/kotlin/Platform.android.kt
actual fun namaPlatform(): String = "Android \${android.os.Build.VERSION.SDK_INT}"
actual fun idUnik(): String = java.util.UUID.randomUUID().toString()

// iosMain/kotlin/Platform.ios.kt
import platform.Foundation.NSUUID
import platform.UIKit.UIDevice

actual fun namaPlatform(): String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion
actual fun idUnik(): String = NSUUID().UUIDString()

// Catatan: untuk UUID, stdlib Kotlin kini punya kotlin.uuid.Uuid (cek status stabilitas API-nya).
// Untuk dependency yang lebih besar (penyimpanan aman, sensor), lebih fleksibel memakai
// interface di commonMain + implementasi per platform yang disuntikkan (DI), bukan expect class.`, 'kotlin'),
      code('Shared repository dengan Ktor client', `// commonMain/kotlin/KursRepository.kt
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Kurs(val mataUang: String, val nilai: Double)

// Tanpa argumen engine: Ktor memilih engine dari dependency platform (OkHttp di Android, Darwin di iOS)
fun buatClient(): HttpClient = HttpClient {
    install(ContentNegotiation) { json(Json { ignoreUnknownKeys = true }) }
}

class KursRepository(private val client: HttpClient) {
    @Throws(Exception::class)                // tanpa ini, exception selain pembatalan membuat app iOS crash
    suspend fun ambil(): List<Kurs> = client.get("https://api.contoh.id/kurs").body()
}

// commonTest/kotlin/SapaanTest.kt — dijalankan di JVM, Android, dan simulator iOS
// class SapaanTest {
//     @Test fun teksMenyebutPlatform() = assertTrue(Sapaan().teks().startsWith("Halo dari"))
// }`, 'kotlin'),
      code('Memakai shared module dari SwiftUI', `import SwiftUI
import Shared

struct KursView: View {
    @State private var daftar: [Kurs] = []
    @State private var pesanError: String?
    private let repo = KursRepository(client: KursRepositoryKt.buatClient())   // fungsi top-level → <NamaFile>Kt

    var body: some View {
        List(daftar, id: \\.mataUang) { kurs in
            Text("\\(kurs.mataUang): \\(kurs.nilai)")
        }
        .overlay { if let pesanError { Text(pesanError) } }
        .task {
            do {
                daftar = try await repo.ambil()          // fungsi suspend tampil sebagai async throws di Swift
            } catch {
                pesanError = error.localizedDescription
            }
        }
    }
}`, 'swift'),
      code('Compose Multiplatform: satu UI untuk Android, iOS, dan desktop', `// composeApp/src/commonMain/kotlin/App.kt
@Composable
fun App(repo: KursRepository) {
    var daftar by remember { mutableStateOf<List<Kurs>>(emptyList()) }
    LaunchedEffect(Unit) {
        daftar = try { repo.ambil() } catch (e: Exception) { emptyList() }   // contoh ringkas; pakai ViewModel di aplikasi nyata
    }
    MaterialTheme {
        LazyColumn {
            items(daftar) { Text("\${it.mataUang}: \${it.nilai}") }
        }
    }
}

// androidMain — MainActivity:  setContent { App(KursRepository(buatClient())) }

// iosMain — dipanggil dari Swift lewat UIViewControllerRepresentable
fun MainViewController() = ComposeUIViewController { App(KursRepository(buatClient())) }

// jvmMain — aplikasi desktop
fun main() = application {
    Window(onCloseRequest = ::exitApplication, title = "Kurs") { App(KursRepository(buatClient())) }
}`, 'kotlin'),
      table(['Pendekatan', 'Yang dibagi', 'UI', 'Cocok bila'], [
        ['Native penuh (Kotlin + Swift)', 'Tidak ada', 'Compose + SwiftUI', 'Tim per platform besar, butuh fitur OS paling baru'],
        ['KMP (shared logic)', 'Model, networking, validasi, repository', 'Tetap native', 'Ingin UI native tetapi logika bisnis satu sumber; adopsi bertahap di app yang sudah ada'],
        ['Compose Multiplatform', 'Logika + UI', 'Compose di semua platform', 'Tim sudah mahir Compose/Kotlin dan ingin satu basis kode UI'],
        ['Flutter', 'Logika + UI (Dart)', 'Engine render sendiri', 'Tim baru tanpa basis Kotlin/Swift, ekosistem paket matang, satu bahasa'],
      ]),
      callout('tip', 'Kapan memakai KMP', 'Pilih KMP bila sudah ada aplikasi Android Kotlin dan ingin menghadirkan iOS tanpa menulis ulang logika bisnis, bila aturan bisnis (perhitungan, validasi, sinkronisasi) harus identik di semua platform, atau bila backend juga Kotlin sehingga model bisa dibagi. Mulai dari satu modul kecil yang murni logika, ukur dampaknya pada build iOS dan alur kerja tim iOS, baru perluas. Perbandingan dengan pendekatan Dart ada di kurikulum [Flutter](#flutter).'),
      callout('warn', 'Hal yang perlu diantisipasi', 'Build iOS membutuhkan macOS + Xcode dan kompilasi Kotlin/Native lebih lambat dari JVM. Interop ke Swift melewati Objective-C: generic, sealed class, default argument, dan `Flow` terasa kurang alami di Swift (library komunitas seperti SKIE atau KMP-NativeCoroutines membantu; Swift export langsung masih berkembang). Library yang dipakai di `commonMain` harus mendukung multiplatform, jadi cek dukungan target sebelum memilih dependency.'),
      ...quiz([
        ['KT-43', 'Kapan memakai `expect/actual` dan kapan interface + implementasi per platform?', '`expect/actual` cocok untuk fungsi atau nilai kecil yang tidak perlu diganti saat test (nama platform, pembuat ID). Untuk dependency besar yang ingin di-mock atau dikonfigurasi (penyimpanan aman, lokasi, database), interface di `commonMain` dengan implementasi per platform yang disuntikkan lebih fleksibel dan mudah diuji. `expect class` sendiri masih berstatus Beta.'],
        ['KT-44', 'Apa yang terjadi bila fungsi `suspend` tanpa `@Throws` melempar `IOException` saat dipanggil dari Swift?', 'Hanya `CancellationException` yang otomatis diterjemahkan menjadi error Swift; exception lain yang tidak dideklarasikan dengan `@Throws` dianggap tak terduga dan menghentikan aplikasi (crash). Dengan `@Throws(Exception::class)` (atau tipe yang lebih spesifik), exception tampil sebagai error yang bisa ditangkap dengan `do/try/catch`.'],
        ['KT-45', 'Sebuah tim punya aplikasi Android Kotlin yang matang dan tim iOS kecil yang mahir SwiftUI. Pendekatan mana yang paling masuk akal?', 'KMP dengan shared logic: modul bersama untuk model, networking, dan aturan bisnis dipakai Android dan iOS, sementara tim iOS tetap menulis UI dengan SwiftUI. Risikonya kecil karena bisa diadopsi bertahap; Compose Multiplatform bisa dipertimbangkan kemudian untuk layar yang tidak membutuhkan nuansa native.'],
      ]),
      ...practice('kt-multiplatform', [
        'Buat proyek dari wizard KMP (Android + iOS + shared), jalankan di emulator Android dan simulator iOS.',
        'Pindahkan logika validasi transaksi (jumlah positif, judul tidak kosong) ke `commonMain` dan tulis test di `commonTest`; jalankan `./gradlew allTests`.',
        'Implementasikan `KursRepository` dengan Ktor client, panggil dari Compose di Android dan dari SwiftUI di iOS, termasuk penanganan error tanpa crash.',
        'Tambahkan target desktop (`jvm()`) dengan Compose Multiplatform dan tampilkan layar `App` yang sama.',
      ]),
      references(
        ['Kotlin Multiplatform overview', 'https://www.jetbrains.com/kotlin-multiplatform/'],
        ['Kotlin: Multiplatform documentation', 'https://kotlinlang.org/docs/multiplatform.html'],
        ['Kotlin: Expected and actual declarations', 'https://kotlinlang.org/docs/multiplatform-expect-actual.html'],
        ['Kotlin: Interoperability with Swift/Objective-C', 'https://kotlinlang.org/docs/native-objc-interop.html'],
        ['Compose Multiplatform', 'https://www.jetbrains.com/compose-multiplatform/'],
        ['Ktor: Multiplatform client', 'https://ktor.io/docs/client-create-multiplatform-application.html'],
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
  description: 'Kotlin modern untuk developer Java: sintaks, null safety, data & sealed class, koleksi, coroutines dan Flow, generic & DSL, interop Java, REST API Spring Boot dan Ktor, database dengan Exposed + Flyway, testing dengan MockK dan runTest, Jetpack Compose untuk Android (arsitektur, Navigation type-safe, data layer offline-first dengan Retrofit/Room, Hilt, testing UI), serta Kotlin Multiplatform dan Compose Multiplatform.',
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
