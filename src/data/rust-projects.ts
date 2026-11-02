import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const CORE = 'Rust Inti';
const ADVANCED = 'Rust Lanjutan';
const BACKEND = 'Rust untuk Backend';
const PROJECTS = 'Rust Proyek & Ekosistem';

/** Track baru; disisipkan setelah 'Rust untuk Backend'. Modul lain masuk ke track yang sudah ada. */
export const rustProjectsTracks: Track[] = [
  { title: PROJECTS, summary: 'Proyek CLI dengan clap, benchmark & profiling performa, dan Rust ke WebAssembly untuk dipanggil dari JavaScript.' },
];

export const rustProjectsSource = 'Rust Proyek & Ekosistem: materi tambahan dari The Rust Programming Language, The Cargo Book, The Rustonomicon, dokumentasi Tokio, Axum, clap, criterion, dan wasm-bindgen (2 November 2026)';

const src = { source: rustProjectsSource };

export const rustProjectsModules: Omit<Module, 'code'>[] = [
  {
    ...src,
    id: 'rsp-string-module-system',
    title: 'Rust: String, &str & UTF-8, plus Module System & Cargo Features',
    summary: 'String vs &str, slice byte vs char, jebakan UTF-8, Cow, lalu mod/pub/use, crate vs package, visibilitas, dan feature flag yang aditif.',
    track: CORE, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Dua hal yang paling sering membingungkan setelah ownership: **teks** dan **susunan kode**. Rust menyimpan teks sebagai byte UTF-8 yang valid, sehingga `len()` menghitung byte, bukan huruf, dan memotong string di tengah karakter akan panic. Bagian kedua modul ini menjelaskan bagaimana kode dipecah menjadi modul, crate, dan package, serta bagaimana Cargo feature mengaktifkan kode opsional. Dasar `&str` sebagai parameter sudah dibahas di [Ownership, Borrowing & Lifetime](#rust.rust-ownership-borrowing).'),
      heading('String, &str, dan UTF-8'),
      code('Byte, char, dan slice yang aman', `fn main() {
    let menu = String::from("Kopi Susu ☕");    // String: milik sendiri, di heap, bisa tumbuh
    let kata: &str = &menu[0..4];               // &str: pinjaman ke byte UTF-8 milik orang lain
    let kota: &'static str = "Jakarta";         // literal: tertanam di binary
    println!("{kata} {kota}");

    println!("{} byte, {} char", menu.len(), menu.chars().count()); // 13 byte, 11 char
    // ☕ memakai 3 byte (indeks 10..13). &menu[0..12] akan PANIC:
    // "byte index 12 is not a char boundary"
    println!("{:?}", menu.get(0..12));          // None: versi aman, tidak panic
    println!("{:?}", menu.get(0..13));          // Some("Kopi Susu ☕")

    // Iterasi: chars() per Unicode scalar, char_indices() beserta posisi byte, bytes() mentah
    for (i, c) in "Rp1.500".char_indices().filter(|(_, c)| c.is_ascii_digit()) {
        print!("{c}@{i} ");                     // 1@2 5@4 0@5 0@6
    }
    println!();

    // Satu "huruf" di layar bisa terdiri dari beberapa char (e + aksen gabungan)
    let cafe = "Cafe\\u{301}";                  // ditampilkan "Café"
    println!("{} char, {} byte", cafe.chars().count(), cafe.len()); // 5 char, 6 byte
    // Untuk menghitung huruf seperti yang dilihat manusia (grapheme), pakai crate unicode-segmentation.

    // Membangun string tanpa alokasi berulang
    use std::fmt::Write;
    let mut s = String::with_capacity(64);
    for (i, item) in ["kopi", "roti"].iter().enumerate() {
        write!(s, "{}. {item}; ", i + 1).unwrap();   // menulis ke String yang sama
    }
    println!("{}", s.trim_end());
}`, 'rust'),
      code('API yang ramah pemanggil: &str, impl Into<String>, dan Cow', `use std::borrow::Cow;

struct Pelanggan {
    nama: String,
}

impl Pelanggan {
    // Konstruktor yang MENYIMPAN teks: terima apa pun yang bisa menjadi String
    fn new(nama: impl Into<String>) -> Self {
        Self { nama: nama.into() }
    }
}

// Fungsi yang hanya MEMBACA: cukup &str
fn inisial(nama: &str) -> String {
    nama.split_whitespace()
        .filter_map(|k| k.chars().next())
        .flat_map(char::to_uppercase)
        .collect()
}

// Cow: kembalikan pinjaman bila tidak ada perubahan, alokasi hanya bila perlu
fn normalisasi_hp(no: &str) -> Cow<'_, str> {
    match no.trim().strip_prefix("08") {
        Some(sisa) => Cow::Owned(format!("+628{sisa}")),
        None => Cow::Borrowed(no.trim()),
    }
}

fn main() {
    let a = Pelanggan::new("ani wijaya");               // &str
    let b = Pelanggan::new(String::from("budi santoso")); // String, tanpa salinan ekstra
    println!("{} {}", inisial(&a.nama), inisial(&b.nama)); // AW BS
    println!("{} {}", normalisasi_hp("081234"), normalisasi_hp("+62811")); // +6281234 +62811
}`, 'rust'),
      table(['Tipe', 'Pemilik?', 'Pakai untuk'], [
        ['`String`', 'Ya, bisa diubah dan tumbuh', 'Field struct, hasil yang dibangun, data dari I/O'],
        ['`&str`', 'Pinjaman', 'Parameter fungsi yang hanya membaca, potongan teks'],
        ['`&\'static str`', 'Pinjaman ke data sepanjang program', 'Literal, pesan konstan'],
        ['`Cow<\'a, str>`', 'Pinjaman ATAU milik', 'Fungsi yang kadang mengubah, kadang tidak'],
        ['`Box<str>` / `Arc<str>`', 'Ya, ukuran tetap', 'Teks yang tidak berubah lagi; `Arc<str>` untuk dibagi antar thread'],
        ['`OsString` / `PathBuf`', 'Ya', 'Nama file dan argumen OS yang belum tentu UTF-8 valid'],
        ['`Vec<u8>` / `&[u8]`', 'Ya / pinjaman', 'Byte mentah; ubah dengan `String::from_utf8` (bisa gagal)'],
      ]),
      callout('warn', 'Indeks byte bukan indeks huruf', 'Hindari `&s[a..b]` dengan angka hasil hitungan huruf. Ambil posisi dari `find`, `char_indices`, atau `split_once`, karena posisi itu pasti berada di batas karakter. Bila indeks berasal dari input pengguna, pakai `s.get(a..b)` yang mengembalikan `Option`.'),
      heading('Module system: package, crate, module'),
      paragraph('**Package** adalah folder dengan `Cargo.toml`. Package berisi paling banyak satu **crate library** (`src/lib.rs`) dan sejumlah **crate binary** (`src/main.rs`, `src/bin/*.rs`). **Crate** adalah unit kompilasi. Di dalam crate, kode dibagi menjadi **module** dengan `mod`. Semua item privat secara default; `pub` membukanya ke modul induk dan seterusnya.'),
      code('Struktur folder', `kas/                        <- package (punya Cargo.toml, name = "kas")
├── Cargo.toml
└── src/
    ├── lib.rs              <- akar crate library "kas"
    ├── main.rs             <- akar crate binary "kas"
    ├── domain.rs           <- mod domain
    ├── domain/
    │   └── uang.rs         <- mod domain::uang
    ├── db.rs               <- mod db (privat)
    └── bin/
        └── impor.rs        <- crate binary tambahan "impor"`, 'text'),
      code('mod, pub, use, super, crate, dan re-export', `// src/lib.rs
pub mod domain;                     // isi diambil dari src/domain.rs
mod db;                             // privat: hanya untuk crate ini
pub use domain::uang::Rupiah;       // re-export: pengguna cukup menulis use kas::Rupiah

// src/domain.rs
pub mod uang;
pub(crate) fn kode_valid(kode: &str) -> bool {   // terlihat di seluruh crate, tidak di luar
    kode.len() == 3 && kode.chars().all(|c| c.is_ascii_uppercase())
}

// src/domain/uang.rs
use super::kode_valid;              // super = modul induk (domain)

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct Rupiah(i64);             // tipe publik, field privat: hanya dibuat lewat new()

impl Rupiah {
    pub fn new(n: i64) -> Option<Self> {
        (n >= 0).then_some(Self(n))
    }
    pub fn nilai(self) -> i64 {
        self.0
    }
    pub fn mata_uang_didukung(kode: &str) -> bool {
        kode_valid(kode) && kode == "IDR"
    }
}

// src/db.rs
pub fn simpan(r: crate::Rupiah) {   // crate = akar crate ini; jalur absolut
    let _ = r.nilai();
}

// src/main.rs: crate binary memakai library lewat nama package
use kas::Rupiah;

fn main() {
    println!("{:?}", Rupiah::new(5_000));
    // kas::db::simpan(...)         // error: module db privat
}`, 'rust'),
      table(['Visibilitas', 'Terlihat dari'], [
        ['(tanpa kata kunci)', 'Modul itu sendiri dan anak-anaknya'],
        ['`pub(super)`', 'Modul induk'],
        ['`pub(crate)`', 'Seluruh crate, tidak oleh crate lain'],
        ['`pub(in crate::domain)`', 'Hanya di dalam jalur yang disebut'],
        ['`pub`', 'Siapa pun yang bisa menjangkau modul induknya'],
      ]),
      heading('Cargo features: kode opsional yang aditif'),
      code('Cargo.toml dan #[cfg(feature)]', `# Cargo.toml
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = { version = "1", optional = true }
tracing = { version = "0.1", optional = true }

[features]
default = ["json"]          # aktif kecuali pemakai menulis default-features = false
json = ["dep:serde_json"]
log = ["dep:tracing"]
full = ["json", "log"]      # feature boleh mengaktifkan feature lain

// src/lib.rs
#[cfg(feature = "json")]
pub fn ke_json<T: serde::Serialize>(nilai: &T) -> serde_json::Result<String> {
    serde_json::to_string(nilai)
}

pub fn catat(pesan: &str) {
    #[cfg(feature = "log")]
    tracing::info!("{pesan}");
    #[cfg(not(feature = "log"))]
    eprintln!("{pesan}");
}`, 'rust'),
      code('Memeriksa kombinasi feature', `cargo build --no-default-features              # tanpa json
cargo build --no-default-features --features log
cargo test --all-features
cargo tree -e features -i serde_json             # siapa yang mengaktifkan serde_json?
cargo install cargo-hack
cargo hack check --feature-powerset              # cek semua kombinasi feature`, 'bash'),
      callout('tip', 'Feature harus aditif', 'Bila dua crate di pohon dependensi mengaktifkan feature berbeda dari crate yang sama, Cargo mengompilasi **gabungan** keduanya (feature unification). Karena itu feature hanya boleh *menambah* kemampuan. Jangan membuat feature yang mematikan sesuatu (misalnya `no-tls`), dan jangan membuat dua feature yang saling bertentangan.'),
      ...quiz([
        ['RSP-01', 'Mengapa `"Café".len()` bisa bernilai 5 atau 6 padahal di layar sama-sama terlihat 4 huruf?', '`len()` menghitung byte UTF-8. Bila é ditulis sebagai satu code point U+00E9, ia memakan 2 byte sehingga total 5. Bila ditulis sebagai `e` + aksen gabungan U+0301, ada 5 char dan 6 byte. Untuk menghitung huruf seperti yang dilihat pengguna, pakai segmentasi grapheme (crate unicode-segmentation).'],
        ['RSP-02', 'Apa beda package dan crate, dan mengapa `main.rs` memakai `use kas::Rupiah` alih-alih `use crate::Rupiah`?', 'Package adalah unit Cargo (Cargo.toml) yang bisa berisi satu crate library dan beberapa crate binary. `main.rs` adalah akar crate binary yang terpisah dari crate library, sehingga `crate::` di sana menunjuk ke binary itu sendiri. Library diakses seperti dependensi biasa, lewat nama package (tanda hubung diganti garis bawah).'],
        ['RSP-03', 'Library Anda punya feature `no-std-io` yang menghapus fungsi I/O. Apa masalahnya?', 'Feature digabung (unified) di seluruh pohon dependensi. Bila satu crate mengaktifkan `no-std-io` dan crate lain memakai fungsi I/O, build crate lain itu rusak walau ia tidak meminta feature tersebut. Balik logikanya: buat feature `std-io` yang menambah fungsi, dan aktifkan lewat default.'],
      ]),
      ...practice('rsp-string-module', [
        'Tulis `potong_aman(s: &str, maks_char: usize) -> &str` yang tidak pernah panic untuk teks berisi emoji, beserta unit test.',
        'Ubah fungsi yang selalu mengembalikan `String` hasil normalisasi menjadi `Cow<str>` dan buktikan dengan tes bahwa input yang sudah normal tidak dialokasi ulang (`matches!(hasil, Cow::Borrowed(_))`).',
        'Susun proyek `kas` dengan `lib.rs` + `main.rs` + `src/bin/impor.rs`, modul `domain` dan `db`, dan pastikan `db` tidak bisa dipakai dari binary.',
        'Tambahkan feature `json` dan `log`, lalu jalankan `cargo hack check --feature-powerset` sampai semua kombinasi lolos.',
      ]),
      references(
        ['The Book: Storing UTF-8 text with Strings', 'https://doc.rust-lang.org/book/ch08-02-strings.html'],
        ['The Book: Packages, Crates, and Modules', 'https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html'],
        ['std::string::String', 'https://doc.rust-lang.org/std/string/struct.String.html'],
        ['std::borrow::Cow', 'https://doc.rust-lang.org/std/borrow/enum.Cow.html'],
        ['The Rust Reference: Visibility and privacy', 'https://doc.rust-lang.org/reference/visibility-and-privacy.html'],
        ['The Cargo Book: Features', 'https://doc.rust-lang.org/cargo/reference/features.html'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-async-mendalam',
    title: 'Rust: Async Mendalam — Future, Pin, Runtime Tokio & Cancellation',
    summary: 'Cara kerja Future dan poll, Pin secukupnya, runtime Tokio, spawn vs join! vs JoinSet, select!, cancellation safety, dan menangani kode blocking.',
    track: ADVANCED, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Di [REST API dengan Tokio, Axum & SQLx](#rust.rust-axum-tokio) kita menulis `async fn` dan `.await` tanpa memikirkan apa yang terjadi. Modul ini membuka mesinnya. `async fn` dikompilasi menjadi **state machine** yang mengimplementasikan trait `Future`. Future bersifat **lazy**: tidak berjalan sampai di-*poll* oleh executor (runtime Tokio). Memahami ini menjelaskan banyak bug async: task yang tidak pernah jalan, server yang macet karena satu fungsi blocking, dan data hilang karena future dibatalkan di tengah jalan.'),
      heading('Future dan poll'),
      code('Future buatan sendiri: Ready atau Pending', `use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

/// Future yang butuh beberapa kali poll sebelum selesai.
struct Hitung {
    sisa: u32,
}

impl Future for Hitung {
    type Output = &'static str;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.sisa == 0 {
            return Poll::Ready("selesai");
        }
        println!("poll, sisa {}", self.sisa);
        self.sisa -= 1;
        // Pending WAJIB disertai cara membangunkan task lagi. Biasanya waker didaftarkan
        // ke sumber event (socket, timer). Di sini kita langsung minta di-poll ulang.
        cx.waker().wake_by_ref();
        Poll::Pending
    }
}

async fn dua_langkah() -> u32 {
    // Compiler mengubah fungsi ini menjadi enum state: Mulai -> MenungguHitung -> Selesai
    let pesan = Hitung { sisa: 2 }.await;
    println!("{pesan}");
    42
}

#[tokio::main]
async fn main() {
    let fut = dua_langkah();          // belum ada yang dicetak: future itu lazy
    println!("future dibuat");
    let n = fut.await;                // baru sekarang di-poll
    println!("hasil {n}");
}`, 'rust'),
      paragraph('**Pin secukupnya.** State machine hasil `async fn` bisa menyimpan referensi ke variabel lokalnya sendiri (self-referential). Bila future itu dipindah di memori setelah mulai di-poll, referensi tersebut menjadi dangling. `Pin<&mut T>` menjamin nilai tidak akan dipindah lagi. Dalam praktik Anda jarang menyentuhnya langsung: cukup tahu bahwa `Box::pin(fut)` atau `tokio::pin!(fut)` dibutuhkan saat ingin mem-poll future yang sama berkali-kali lewat `&mut fut`, misalnya di dalam `select!` pada loop. Tipe yang tidak self-referential (hampir semua struct biasa) adalah `Unpin` dan bebas dipindah.'),
      heading('Runtime, spawn, join!, dan JoinSet'),
      code('Tiga cara menjalankan banyak future', `use std::time::Duration;
use tokio::task::JoinSet;
use tokio::time::sleep;

async fn ambil(id: u64) -> Result<String, String> {
    sleep(Duration::from_millis(100 * id)).await;
    if id == 4 { Err(format!("id {id} gagal")) } else { Ok(format!("data-{id}")) }
}

#[tokio::main] // = runtime multi-thread; worker thread default = jumlah core
async fn main() -> Result<(), String> {
    // 1. join!: konkuren di dalam task yang SAMA, boleh meminjam variabel lokal
    let (a, b) = tokio::join!(ambil(1), ambil(2));          // total ~200 ms, bukan 300 ms
    println!("{a:?} {b:?}");

    // try_join!: berhenti dan mengembalikan Err pertama
    let (c, d) = tokio::try_join!(ambil(1), ambil(3))?;
    println!("{c} {d}");

    // 2. spawn: task terpisah yang bisa berjalan paralel di thread lain.
    //    Syarat: future 'static + Send (tidak boleh meminjam data lokal).
    let handle = tokio::spawn(ambil(2));
    match handle.await {
        Ok(hasil) => println!("task: {hasil:?}"),
        Err(e) => println!("task panic atau dibatalkan: {e}"), // JoinError
    }

    // 3. JoinSet: jumlah task dinamis, hasil diambil sesuai urutan selesai
    let mut set = JoinSet::new();
    for id in 1..=5 {
        set.spawn(ambil(id));
    }
    while let Some(res) = set.join_next().await {
        match res {
            Ok(Ok(data)) => println!("ok {data}"),
            Ok(Err(e)) => println!("gagal {e}"),
            Err(join_err) => println!("panic {join_err}"),
        }
    }   // JoinSet yang di-drop meng-abort semua task yang tersisa
    Ok(())
}`, 'rust'),
      code('Memilih runtime secara eksplisit', `// Satu thread: cocok untuk CLI, tes, atau aplikasi I/O kecil
#[tokio::main(flavor = "current_thread")]
async fn main() { /* ... */ }

// Multi-thread dengan jumlah worker tertentu
// #[tokio::main(flavor = "multi_thread", worker_threads = 4)]

// Tanpa macro: berguna bila main harus sinkron (misalnya di dalam library atau tes khusus)
fn jalankan() -> std::io::Result<()> {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .enable_all()                 // aktifkan driver I/O dan timer
        .build()?;
    rt.block_on(async { /* ... */ });
    Ok(())
}`, 'rust'),
      heading('select!, cancellation, dan cancellation safety'),
      paragraph('`tokio::select!` menunggu beberapa future sekaligus dan menjalankan cabang pertama yang selesai. Cabang lain **di-drop**, artinya dibatalkan di titik `.await` terakhirnya. Inilah model cancellation di Rust: membatalkan future = berhenti mem-poll lalu men-drop-nya. Sebuah operasi disebut **cancellation safe** bila di-drop sebelum selesai tidak membuat data hilang. `mpsc::Receiver::recv`, `TcpListener::accept`, dan `sleep` aman; `AsyncReadExt::read_exact` dan `read_to_end` **tidak** (byte yang sudah terbaca ikut hilang). Dokumentasi Tokio mencantumkan status ini di setiap method.'),
      code('Worker dengan shutdown, heartbeat, dan deadline', `use std::time::Duration;
use tokio::sync::mpsc;
use tokio::time::{interval, sleep};
use tokio_util::sync::CancellationToken;   // cargo add tokio-util

async fn proses(job: String) {
    sleep(Duration::from_millis(50)).await;
    println!("selesai {job}");
}

async fn worker(mut rx: mpsc::Receiver<String>, token: CancellationToken) {
    let mut detak = interval(Duration::from_secs(5));
    // Deadline yang berlaku lintas iterasi: buat SEKALI di luar loop lalu pin,
    // supaya tidak di-reset setiap kali select! berputar.
    let batas = sleep(Duration::from_secs(60));
    tokio::pin!(batas);

    loop {
        tokio::select! {
            biased;                                  // cek cabang sesuai urutan, bukan acak
            _ = token.cancelled() => { println!("shutdown diminta"); break; }
            _ = &mut batas => { println!("batas waktu worker habis"); break; }
            pesan = rx.recv() => match pesan {       // recv() cancellation safe
                Some(job) => proses(job).await,      // dijalankan di dalam cabang, tidak ikut balapan
                None => break,                       // semua Sender sudah di-drop
            },
            _ = detak.tick() => println!("heartbeat"),
        }
    }
}

#[tokio::main]
async fn main() {
    let (tx, rx) = mpsc::channel(100);
    let token = CancellationToken::new();
    let h = tokio::spawn(worker(rx, token.clone()));

    for i in 0..3 {
        tx.send(format!("job-{i}")).await.unwrap();
    }
    tokio::signal::ctrl_c().await.unwrap();          // tunggu Ctrl+C
    token.cancel();
    h.await.unwrap();
}`, 'rust'),
      code('Timeout dan kode blocking', `use std::time::Duration;
use tokio::time::timeout;

fn hitung_berat(data: Vec<u8>) -> u64 {
    // CPU-bound: hashing, kompresi, parsing besar, bcrypt/argon2
    data.iter().map(|&b| u64::from(b)).sum()
}

async fn handler(data: Vec<u8>) -> anyhow::Result<u64> {
    // SALAH: std::thread::sleep atau loop CPU panjang di sini memblok worker thread,
    //        sehingga task lain di thread itu ikut berhenti.
    // BENAR: pindahkan ke thread pool khusus blocking
    let total = tokio::task::spawn_blocking(move || hitung_berat(data)).await?;

    // Batasi waktu operasi I/O; Err(Elapsed) bila lewat batas, future di dalamnya di-drop
    let _ = timeout(Duration::from_secs(2), tokio::time::sleep(Duration::from_millis(10))).await?;
    Ok(total)
}

// Lock yang ditahan melewati .await:
//   std::sync::Mutex -> guard bukan Send, tokio::spawn menolak future-nya (error kompilasi).
//   Solusi: lepas guard sebelum .await (blok terpisah), atau pakai tokio::sync::Mutex.`, 'rust'),
      table(['Alat', 'Paralel antar thread?', 'Butuh \'static + Send?', 'Pakai untuk'], [
        ['`.await` berurutan', 'Tidak', 'Tidak', 'Langkah yang saling bergantung'],
        ['`join!` / `try_join!`', 'Tidak (konkuren dalam satu task)', 'Tidak', 'Sedikit operasi I/O independen yang jumlahnya tetap'],
        ['`tokio::spawn`', 'Ya', 'Ya', 'Kerja latar belakang, satu task per koneksi'],
        ['`JoinSet`', 'Ya', 'Ya', 'Banyak task dinamis, ambil hasil saat selesai, abort semua saat drop'],
        ['`select!`', 'Tidak', 'Tidak', 'Balapan: timeout, shutdown, banyak sumber event'],
        ['`spawn_blocking`', 'Ya (pool terpisah)', 'Ya', 'Kode sinkron/CPU-bound di dalam aplikasi async'],
      ]),
      callout('warn', 'Tiga bug async yang paling sering', '1) Future dibuat tetapi tidak di-`.await` atau di-spawn: tidak ada yang terjadi (compiler memberi warning `unused_must_use`). 2) Kode blocking (`std::thread::sleep`, I/O file sinkron yang besar, komputasi berat) di dalam task: seluruh worker thread macet. 3) Operasi yang tidak cancellation safe di dalam `select!` pada loop: data terbaca sebagian lalu hilang. Untuk kasus 3, pin future di luar loop atau gunakan API yang memang aman dibatalkan.'),
      ...quiz([
        ['RSP-04', 'Mengapa `tokio::join!(a(), b())` bisa memakai variabel lokal yang dipinjam, sedangkan `tokio::spawn(a())` tidak?', 'join! mem-poll kedua future di dalam task saat ini dan selesai sebelum fungsi berlanjut, jadi pinjaman lokal tetap valid. spawn menyerahkan future ke runtime yang bisa menjalankannya di thread lain dan lebih lama dari fungsi pemanggil, sehingga future harus `\'static` (tidak meminjam data lokal) dan `Send`.'],
        ['RSP-05', 'Dalam loop, `select! { r = stream.read_exact(&mut buf) => ..., _ = sleep(1s) => ... }` kadang membuat protokol rusak. Mengapa?', 'Bila sleep menang, future read_exact di-drop. Byte yang sudah dibaca ke buffer internalnya hilang karena read_exact tidak cancellation safe, sehingga pembacaan berikutnya mulai di tengah frame. Solusinya memakai API yang aman dibatalkan (misalnya framing dengan tokio_util::codec), atau membuat future sekali di luar loop, mem-pin-nya, lalu mem-poll `&mut fut`.'],
        ['RSP-06', 'Apa arti `Poll::Pending` dan apa yang terjadi bila sebuah Future mengembalikan Pending tanpa mendaftarkan waker?', 'Pending berarti belum selesai dan executor harus mem-poll lagi nanti. Executor hanya mem-poll ulang setelah waker dipanggil. Tanpa waker yang didaftarkan ke sumber event, task tidak pernah dibangunkan dan menggantung selamanya.'],
      ]),
      ...practice('rsp-async', [
        'Tulis future `Tunda` yang selesai setelah N kali poll, lalu tunjukkan bahwa membuat future tanpa `.await` tidak mencetak apa pun.',
        'Ambil data dari 20 URL tiruan dengan `JoinSet`, batasi 5 task sekaligus dengan `tokio::sync::Semaphore`, dan kumpulkan error tanpa menghentikan yang lain.',
        'Implementasikan worker dengan `CancellationToken`: Ctrl+C menghentikan penerimaan job baru tetapi job yang sedang berjalan diselesaikan.',
        'Sengaja panggil `std::thread::sleep` di handler dengan runtime `current_thread`, ukur dampaknya ke request lain, lalu perbaiki dengan `spawn_blocking` atau `tokio::time::sleep`.',
      ]),
      references(
        ['Asynchronous Programming in Rust (async book)', 'https://rust-lang.github.io/async-book/'],
        ['The Book: Async and Await', 'https://doc.rust-lang.org/book/ch17-00-async-await.html'],
        ['Tokio tutorial: Async in depth', 'https://tokio.rs/tokio/tutorial/async'],
        ['Tokio tutorial: Select', 'https://tokio.rs/tokio/tutorial/select'],
        ['tokio::select! (cancellation safety)', 'https://docs.rs/tokio/latest/tokio/macro.select.html'],
        ['std::pin', 'https://doc.rust-lang.org/std/pin/index.html'],
        ['tokio_util::sync::CancellationToken', 'https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-unsafe-ffi',
    title: 'Rust: Unsafe Rust & FFI',
    summary: 'Lima kemampuan unsafe, raw pointer, invariant dan komentar SAFETY, memanggil C dan dipanggil dari C, bindgen/cbindgen, perubahan edition 2024, serta Miri.',
    track: ADVANCED, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('`unsafe` tidak mematikan borrow checker. Ia hanya membuka **lima kemampuan tambahan** yang tidak bisa diverifikasi compiler, dan memindahkan tanggung jawab kebenarannya ke programmer. Hampir semua kode backend tidak membutuhkannya. Anda akan menemuinya saat memanggil library C (SQLite, zlib, OpenSSL), menulis struktur data tingkat rendah, atau membaca kode crate populer. Tujuan utamanya adalah membungkus bagian unsafe yang kecil di balik **API aman** yang tidak bisa disalahgunakan.'),
      table(['Kemampuan unsafe', 'Contoh', 'Risiko bila salah'], [
        ['Dereference raw pointer `*const T` / `*mut T`', '`unsafe { *ptr }`', 'Null, dangling, tidak aligned, aliasing `&mut`'],
        ['Memanggil `unsafe fn` (termasuk fungsi C)', '`slice::from_raw_parts`, `CStr::from_ptr`', 'Melanggar prasyarat fungsi'],
        ['Mengakses atau mengubah `static mut`', 'Counter global', 'Data race'],
        ['Mengimplementasikan `unsafe trait`', '`unsafe impl Send for T {}`', 'Tipe yang tidak aman ikut dikirim antar thread'],
        ['Membaca field `union`', 'Interop dengan struct C', 'Membaca byte sebagai tipe yang salah'],
      ]),
      code('Raw pointer di balik API aman', `use std::slice;

/// Versi sederhana dari split_at_mut di std.
/// Borrow checker tidak tahu dua potongan ini tidak tumpang tindih, jadi kita buktikan sendiri.
pub fn bagi_dua(v: &mut [i32], tengah: usize) -> (&mut [i32], &mut [i32]) {
    let len = v.len();
    let ptr = v.as_mut_ptr();
    assert!(tengah <= len, "tengah {tengah} melebihi panjang {len}"); // prasyarat dicek di jalur aman

    // SAFETY:
    // - ptr berasal dari slice valid sepanjang len, sehingga kedua rentang ada di dalam alokasinya.
    // - [0, tengah) dan [tengah, len) tidak tumpang tindih, jadi tidak ada dua &mut ke elemen yang sama.
    // - lifetime hasil terikat ke v, sehingga tidak bisa hidup lebih lama dari datanya.
    unsafe {
        (
            slice::from_raw_parts_mut(ptr, tengah),
            slice::from_raw_parts_mut(ptr.add(tengah), len - tengah),
        )
    }
}

fn main() {
    let mut data = [1, 2, 3, 4, 5];
    let (kiri, kanan) = bagi_dua(&mut data, 2);
    kiri[0] = 10;
    kanan[0] = 30;
    println!("{data:?}"); // [10, 2, 30, 4, 5]

    // Membuat raw pointer itu aman; yang unsafe hanya dereference-nya
    let x = 7;
    let p = &raw const x;             // sintaks &raw (Rust 1.82+), tanpa membuat referensi perantara
    println!("{}", unsafe { *p });
}`, 'rust'),
      heading('Memanggil C dari Rust'),
      code('extern "C", CStr/CString, dan pembungkus aman', `use std::ffi::{c_char, c_int, CStr, CString};

// Edition 2024: blok extern WAJIB ditandai unsafe extern.
// Item yang memang aman dipanggil boleh ditandai "safe" (Rust 1.82+).
unsafe extern "C" {
    pub safe fn abs(x: c_int) -> c_int;            // dari libc; tanpa prasyarat
    fn strlen(s: *const c_char) -> usize;          // prasyarat: s menunjuk string C valid, diakhiri \\0
    fn atoi(s: *const c_char) -> c_int;
}

/// Pembungkus aman: tipe CStr menjamin null-terminated dan valid, jadi pemanggil tidak perlu unsafe.
pub fn panjang_c(s: &CStr) -> usize {
    // SAFETY: CStr selalu menunjuk byte valid yang diakhiri \\0 selama s hidup.
    unsafe { strlen(s.as_ptr()) }
}

pub fn parse_c(teks: &str) -> Result<i32, std::ffi::NulError> {
    let c = CString::new(teks)?;                   // gagal bila teks memuat byte \\0 di tengah
    // SAFETY: c hidup sampai akhir pernyataan ini dan null-terminated.
    Ok(unsafe { atoi(c.as_ptr()) })
}

fn main() {
    println!("{}", abs(-5));                       // tidak perlu unsafe karena ditandai safe
    println!("{}", panjang_c(c"halo"));            // literal C string c"..." (Rust 1.77+)
    println!("{:?}", parse_c("1250"));

    // JEBAKAN klasik: CString sementara di-drop di akhir pernyataan, pointer menjadi dangling
    // let p = CString::new("x").unwrap().as_ptr();   // jangan: p menunjuk memori yang sudah dibebaskan
}`, 'rust'),
      code('Library C yang lebih besar: bindgen di build.rs', `// Cargo.toml
// [build-dependencies]
// bindgen = "<versi terbaru>"

// wrapper.h
// #include <zlib.h>

// build.rs: dijalankan Cargo sebelum mengompilasi crate
fn main() {
    println!("cargo:rerun-if-changed=wrapper.h");
    println!("cargo:rustc-link-lib=z");            // tautkan libz
    let bindings = bindgen::Builder::default()
        .header("wrapper.h")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .generate()
        .expect("gagal membuat bindings");
    let out = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());
    bindings.write_to_file(out.join("bindings.rs")).expect("gagal menulis bindings");
}

// src/ffi.rs: deklarasi hasil generate dimasukkan, lalu dibungkus API aman di modul lain
#![allow(non_upper_case_globals, non_camel_case_types, non_snake_case)]
include!(concat!(env!("OUT_DIR"), "/bindings.rs"));`, 'rust'),
      heading('Dipanggil dari C (atau Go, Python, Node)'),
      code('Mengekspor fungsi Rust dengan ABI C', `// Cargo.toml
// [lib]
// crate-type = ["cdylib", "staticlib"]   // .so/.dll/.dylib dan .a/.lib

use std::ffi::{c_char, CStr};

// Edition 2024: atribut yang bisa merusak keamanan ditulis #[unsafe(...)]
#[unsafe(no_mangle)]
pub extern "C" fn kas_tambah(a: i64, b: i64) -> i64 {
    a.saturating_add(b)
}

/// # Safety
/// \`s\` harus null atau menunjuk string C valid yang diakhiri \\0 dan hidup selama pemanggilan.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn kas_panjang(s: *const c_char) -> usize {
    if s.is_null() {
        return 0;
    }
    // Edition 2024: badan unsafe fn tetap butuh blok unsafe (lint unsafe_op_in_unsafe_fn)
    // SAFETY: dijamin pemanggil sesuai dokumentasi di atas.
    unsafe { CStr::from_ptr(s) }.to_bytes().len()
}

// Header C dibuat otomatis dengan cbindgen:
//   cargo install cbindgen
//   cbindgen --crate kas --output include/kas.h
// Hasilnya kira-kira:  int64_t kas_tambah(int64_t a, int64_t b);`, 'rust'),
      table(['Invariant yang harus Anda jaga', 'Artinya'], [
        ['Validitas pointer', 'Tidak null, menunjuk alokasi yang masih hidup, aligned untuk tipe T'],
        ['Aturan aliasing', 'Tidak boleh ada `&mut T` bersamaan dengan referensi lain ke data yang sama, walau dibuat dari raw pointer'],
        ['Nilai valid', '`bool` hanya 0/1, `char` harus scalar Unicode, `&T` tidak pernah null, enum hanya diskriminan yang ada'],
        ['Inisialisasi', 'Jangan membaca memori yang belum diinisialisasi; pakai `MaybeUninit<T>`'],
        ['Kepemilikan lintas FFI', 'Memori yang dialokasi Rust dibebaskan oleh Rust (sediakan fungsi `kas_free`), begitu pula sebaliknya'],
        ['Panic di batas FFI', 'Sejak Rust 1.81 panic yang keluar dari `extern "C"` membuat proses abort; tangkap dengan `std::panic::catch_unwind` bila perlu mengembalikan kode error'],
      ]),
      callout('tip', 'Disiplin menulis unsafe', 'Tulis komentar `// SAFETY:` di setiap blok `unsafe` yang menjelaskan mengapa prasyarat terpenuhi, dan bagian `# Safety` di dokumentasi setiap `unsafe fn`. Aktifkan lint `clippy::undocumented_unsafe_blocks`. Jalankan tes di bawah **Miri** (`rustup +nightly component add miri`, lalu `cargo +nightly miri test`) untuk mendeteksi undefined behavior seperti akses di luar batas, use-after-free, dan pelanggaran aliasing.'),
      callout('warn', 'static mut di edition 2024', 'Membuat referensi `&STATIC_MUT` atau `&mut STATIC_MUT` ditolak oleh lint `static_mut_refs` yang default deny di edition 2024. Hampir selalu ada pengganti aman: `AtomicU64` untuk counter, `OnceLock`/`LazyLock` untuk inisialisasi sekali, dan `Mutex` untuk data yang lebih besar. Edition 2024 juga menjadikan `std::env::set_var` sebagai fungsi unsafe karena tidak aman dipanggil saat ada thread lain.'),
      ...quiz([
        ['RSP-07', 'Apakah blok `unsafe` mematikan pengecekan borrow checker di dalamnya?', 'Tidak. Aturan ownership dan borrowing untuk referensi biasa tetap dicek. unsafe hanya membuka lima kemampuan: dereference raw pointer, memanggil unsafe fn, mengakses static mut, mengimplementasikan unsafe trait, dan membaca field union.'],
        ['RSP-08', 'Mengapa `let p = CString::new("x").unwrap().as_ptr();` lalu memberikan `p` ke fungsi C adalah bug?', 'CString sementara di-drop di akhir pernyataan sehingga buffer-nya dibebaskan, sementara p masih menunjuk ke sana (dangling pointer). Simpan CString di variabel yang hidup selama fungsi C memakai pointer tersebut.'],
        ['RSP-09', 'Apa bedanya bindgen dan cbindgen?', 'bindgen membaca header C/C++ dan menghasilkan deklarasi Rust (`extern` dan struct `repr(C)`) agar Rust bisa memanggil library C. cbindgen kebalikannya: membaca crate Rust dan menghasilkan header C untuk fungsi `extern "C"` yang diekspor, sehingga program C atau bahasa lain bisa memanggil Rust.'],
      ]),
      ...practice('rsp-unsafe-ffi', [
        'Implementasikan `tukar_ujung(v: &mut [i32])` dengan raw pointer, beri komentar SAFETY, lalu jalankan tes di bawah `cargo +nightly miri test`.',
        'Panggil `strlen` dan `atoi` dari libc lewat `unsafe extern "C"`, bungkus dengan fungsi aman yang menerima `&CStr` dan `&str`.',
        'Buat crate `cdylib` yang mengekspor `kas_tambah`, hasilkan header dengan cbindgen, dan panggil dari program C kecil (atau dari Go dengan cgo).',
        'Ganti satu `static mut` di kode contoh dengan `AtomicU64` atau `OnceLock` dan pastikan tidak ada blok unsafe tersisa.',
      ]),
      references(
        ['The Book: Unsafe Rust', 'https://doc.rust-lang.org/book/ch20-01-unsafe-rust.html'],
        ['The Rustonomicon', 'https://doc.rust-lang.org/nomicon/'],
        ['Edition Guide: Unsafe extern blocks', 'https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-extern.html'],
        ['Edition Guide: Unsafe attributes', 'https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-attributes.html'],
        ['std::ffi', 'https://doc.rust-lang.org/std/ffi/index.html'],
        ['bindgen User Guide', 'https://rust-lang.github.io/rust-bindgen/'],
        ['cbindgen', 'https://github.com/mozilla/cbindgen'],
        ['Miri', 'https://github.com/rust-lang/miri'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-axum-produksi',
    title: 'Rust: Axum Siap Produksi — JWT Middleware, Error, Tracing, Test & Docker',
    summary: 'Middleware auth JWT dengan from_fn_with_state, tower layer, tipe error yang konsisten, tracing terstruktur, integration test dengan oneshot, graceful shutdown, dan image Docker multi-stage.',
    track: BACKEND, duration: '3–4 jam', level: 'Hard',
    blocks: [
      paragraph('Modul [REST API dengan Tokio, Axum & SQLx](#rust.rust-axum-tokio) menghasilkan API yang berjalan. Modul ini melengkapinya dengan hal yang dibutuhkan sebelum dipasang di server: **autentikasi** yang tidak tersebar di setiap handler, **error** yang konsisten dan tidak membocorkan detail internal, **log terstruktur** yang bisa dicari, **tes** yang tidak butuh port terbuka, dan **image** kecil yang aman. Contoh memakai Axum 0.8, tower-http 0.6, dan crate jsonwebtoken.'),
      code('Terminal', `cargo add axum tokio --features tokio/full
cargo add tower-http --features trace,cors,catch-panic
cargo add tracing tracing-subscriber --features tracing-subscriber/env-filter,tracing-subscriber/json
cargo add serde --features derive
cargo add serde_json thiserror anyhow jsonwebtoken
# jsonwebtoken versi terbaru meminta memilih backend kripto lewat feature; cek README-nya.
cargo add --dev tower --features util
cargo add --dev http-body-util`, 'bash'),
      code('src/error.rs — satu tipe error untuk seluruh API', `use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("token tidak ada atau tidak valid")]
    Unauthorized,
    #[error("akses ditolak")]
    Forbidden,
    #[error("{0} tidak ditemukan")]
    NotFound(&'static str),
    #[error("input tidak valid: {0}")]
    Validation(String),
    #[error(transparent)]
    Internal(#[from] anyhow::Error),     // apa pun yang tidak terduga
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, kode) = match &self {
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED"),
            ApiError::Forbidden => (StatusCode::FORBIDDEN, "FORBIDDEN"),
            ApiError::NotFound(_) => (StatusCode::NOT_FOUND, "NOT_FOUND"),
            ApiError::Validation(_) => (StatusCode::UNPROCESSABLE_ENTITY, "VALIDATION"),
            ApiError::Internal(e) => {
                // detail lengkap (beserta rantai penyebab) hanya ke log, bukan ke klien
                tracing::error!(error = ?e, "kesalahan internal");
                return (StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "kode": "INTERNAL", "pesan": "terjadi kesalahan" }))).into_response();
            }
        };
        (status, Json(json!({ "kode": kode, "pesan": self.to_string() }))).into_response()
    }
}`, 'rust'),
      code('src/auth.rs — JWT dan middleware', `use axum::{extract::{Request, State}, http::header, middleware::Next, response::Response};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::{error::ApiError, AppState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // id pengguna
    pub role: String,
    pub exp: usize,       // detik sejak epoch; divalidasi otomatis oleh jsonwebtoken
}

pub fn buat_token(secret: &[u8], sub: &str, role: &str, berlaku_detik: u64) -> anyhow::Result<String> {
    let exp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH)?.as_secs() + berlaku_detik;
    let claims = Claims { sub: sub.into(), role: role.into(), exp: exp as usize };
    Ok(encode(&Header::new(Algorithm::HS256), &claims, &EncodingKey::from_secret(secret))?)
}

/// Middleware: validasi Bearer token lalu simpan Claims di extensions request.
pub async fn wajib_login(State(st): State<AppState>, mut req: Request, next: Next) -> Result<Response, ApiError> {
    let token = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(ApiError::Unauthorized)?;

    let data = decode::<Claims>(token, &DecodingKey::from_secret(&st.jwt_secret), &Validation::new(Algorithm::HS256))
        .map_err(|e| {
            tracing::debug!(error = %e, "token ditolak");
            ApiError::Unauthorized
        })?;

    req.extensions_mut().insert(data.claims);
    Ok(next.run(req).await)
}`, 'rust'),
      code('src/lib.rs — router, layer, dan handler', `pub mod auth;
pub mod error;

use std::sync::Arc;
use axum::{middleware, routing::{get, post}, Extension, Json, Router};
use tower_http::{catch_panic::CatchPanicLayer, trace::TraceLayer};

use auth::Claims;
use error::ApiError;

#[derive(Clone)]
pub struct AppState {
    pub jwt_secret: Arc<[u8]>,
}

pub fn app(state: AppState) -> Router {
    let privat = Router::new()
        .route("/me", get(me))
        .route("/admin/laporan", get(laporan))
        // route_layer: hanya berlaku untuk route yang cocok, sehingga 404 tetap 404 (bukan 401)
        .route_layer(middleware::from_fn_with_state(state.clone(), auth::wajib_login));

    Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/login", post(login))
        .merge(privat)
        .layer(TraceLayer::new_for_http())     // span per request: method, path, status, latensi
        .layer(CatchPanicLayer::new())         // panic di handler -> 500, server tetap hidup
        .with_state(state)
}

#[tracing::instrument(skip_all)]
async fn me(Extension(claims): Extension<Claims>) -> Json<Claims> {
    tracing::info!(user = %claims.sub, "profil dibaca");
    Json(claims)
}

async fn laporan(Extension(claims): Extension<Claims>) -> Result<&'static str, ApiError> {
    if claims.role != "admin" {
        return Err(ApiError::Forbidden);
    }
    Ok("laporan rahasia")
}

#[derive(serde::Deserialize)]
struct Login { email: String, password: String }

async fn login(axum::extract::State(st): axum::extract::State<AppState>, Json(b): Json<Login>)
    -> Result<Json<serde_json::Value>, ApiError> {
    // Contoh saja: verifikasi password sungguhan memakai argon2 di spawn_blocking
    if b.password.len() < 8 {
        return Err(ApiError::Validation("password minimal 8 karakter".into()));
    }
    let token = auth::buat_token(&st.jwt_secret, &b.email, "user", 3600)?;
    Ok(Json(serde_json::json!({ "token": token })))
}`, 'rust'),
      code('src/main.rs — tracing JSON dan graceful shutdown', `use std::sync::Arc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        // RUST_LOG=kas_api=debug,tower_http=info ; default bila tidak diset
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info,tower_http=info".into()))
        .with(tracing_subscriber::fmt::layer().json())   // satu baris JSON per event
        .init();

    let secret = std::env::var("JWT_SECRET")?;
    anyhow::ensure!(secret.len() >= 32, "JWT_SECRET minimal 32 byte");
    let state = kas_api::AppState { jwt_secret: Arc::from(secret.into_bytes()) };

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    tracing::info!(addr = %listener.local_addr()?, "server berjalan");
    axum::serve(listener, kas_api::app(state))
        .with_graceful_shutdown(sinyal_berhenti())       // selesaikan request yang sedang berjalan
        .await?;
    Ok(())
}

async fn sinyal_berhenti() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.expect("pasang handler Ctrl+C") };
    #[cfg(unix)]
    let term = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("pasang handler SIGTERM")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let term = std::future::pending::<()>();
    tokio::select! { _ = ctrl_c => {}, _ = term => {} }
    tracing::info!("sinyal berhenti diterima");
}`, 'rust'),
      code('tests/api.rs — integration test tanpa membuka port', `use std::sync::Arc;
use axum::{body::Body, http::{header, Request, StatusCode}};
use http_body_util::BodyExt;          // .collect() untuk membaca body
use tower::ServiceExt;                // .oneshot()

const SECRET: &[u8] = b"rahasia-tes-yang-panjangnya-32-byte!!";

fn app() -> axum::Router {
    kas_api::app(kas_api::AppState { jwt_secret: Arc::from(SECRET) })
}

#[tokio::test]
async fn tanpa_token_401() {
    let res = app().oneshot(Request::get("/me").body(Body::empty()).unwrap()).await.unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn token_valid_200_dan_user_bukan_admin_403() {
    let token = kas_api::auth::buat_token(SECRET, "ani@contoh.id", "user", 60).unwrap();
    let req = |uri: &str| Request::get(uri)
        .header(header::AUTHORIZATION, format!("Bearer {token}"))
        .body(Body::empty())
        .unwrap();

    let res = app().oneshot(req("/me")).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = res.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["sub"], "ani@contoh.id");

    let res = app().oneshot(req("/admin/laporan")).await.unwrap();
    assert_eq!(res.status(), StatusCode::FORBIDDEN);
}`, 'rust'),
      code('Dockerfile — multi-stage dengan cache BuildKit', `# syntax=docker/dockerfile:1
FROM rust:1-bookworm AS build
WORKDIR /app
COPY . .
# Cache registry dan target antar build; salin binary keluar karena /app/target adalah mount cache
RUN --mount=type=cache,target=/usr/local/cargo/registry \\
    --mount=type=cache,target=/app/target \\
    cargo build --release --locked && cp target/release/kas-api /kas-api

# Runtime: hanya glibc + libgcc, tanpa shell dan package manager
FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=build /kas-api /kas-api
ENV RUST_LOG=info
EXPOSE 3000
USER nonroot
ENTRYPOINT ["/kas-api"]`, 'docker'),
      table(['Kebutuhan', 'Alat di ekosistem Axum', 'Catatan'], [
        ['Auth per kelompok route', '`middleware::from_fn_with_state` + `route_layer`', 'Claims dioper lewat `Extension`'],
        ['Auth sebagai parameter handler', '`impl FromRequestParts for AuthUser`', 'Axum 0.8 tidak butuh `#[async_trait]` lagi'],
        ['Log per request', '`tower_http::trace::TraceLayer`', 'Gabungkan dengan `#[tracing::instrument]` di handler'],
        ['Panic tidak menjatuhkan server', '`CatchPanicLayer`', 'Tetap perbaiki sumber panic-nya'],
        ['CORS, kompresi, batas body', '`CorsLayer`, `CompressionLayer`, `DefaultBodyLimit`', 'Feature tower-http terpisah per layer'],
        ['Tes tanpa jaringan', '`tower::ServiceExt::oneshot`', 'Router adalah `Service`; cepat dan deterministik'],
      ]),
      callout('warn', 'Docker: samakan versi Debian builder dan runtime', 'Binary Rust biasa ditautkan dinamis ke glibc. Bila builder memakai Debian yang lebih baru dari image runtime, binary gagal start dengan error `GLIBC_x.yy not found`. Pasangkan tag yang sama (`rust:1-bookworm` dengan `distroless/cc-debian12`), atau build statis dengan target `x86_64-unknown-linux-musl`. Bila memakai makro `sqlx::query!`, jalankan `cargo sqlx prepare` dan set `SQLX_OFFLINE=true` agar build tidak butuh database.'),
      callout('tip', 'JWT yang aman', 'Tetapkan algoritma secara eksplisit di `Validation::new(Algorithm::HS256)` agar token dengan algoritma lain ditolak, simpan secret minimal 32 byte dari environment atau secret manager, beri masa berlaku pendek (`exp`), dan jangan pernah menaruh data rahasia di claims karena payload JWT hanya di-encode base64, bukan dienkripsi.'),
      ...quiz([
        ['RSP-10', 'Apa beda `.layer(...)` dan `.route_layer(...)` untuk middleware auth?', '`layer` membungkus seluruh router termasuk fallback, sehingga request ke path yang tidak ada pun melewati auth dan mendapat 401 alih-alih 404. `route_layer` hanya berjalan bila ada route yang cocok, jadi path yang tidak dikenal tetap 404 dan route publik di router lain tidak terpengaruh.'],
        ['RSP-11', 'Mengapa varian `Internal` mengembalikan pesan generik ke klien padahal error aslinya tersedia?', 'Error internal bisa memuat detail sensitif: query SQL, nama tabel, path file, atau isi konfigurasi. Detail lengkap dicatat di log (dengan request id dari TraceLayer) untuk developer, sementara klien hanya menerima kode stabil yang bisa ditangani tanpa membocorkan struktur sistem.'],
        ['RSP-12', 'Mengapa integration test dengan `oneshot` lebih disukai dibanding menjalankan server di port lalu memanggil dengan reqwest?', 'Router Axum adalah tower Service, sehingga request bisa dikirim langsung tanpa jaringan. Tes lebih cepat, tidak berebut port saat dijalankan paralel, tidak butuh menunggu server siap, dan tetap melewati semua layer serta middleware yang sama seperti produksi.'],
      ]),
      ...practice('rsp-axum-produksi', [
        'Endpoint `/me` mengembalikan 401 tanpa token, 401 untuk token kedaluwarsa atau ditandatangani secret lain, dan 200 untuk token valid; semuanya dibuktikan dengan integration test.',
        'Ubah middleware menjadi extractor `AuthUser` (`impl FromRequestParts`) dan bandingkan keterbacaan handler.',
        'Log JSON setiap request memuat method, path, status, latensi, dan id pengguna; error internal tercatat dengan rantai penyebab.',
        'Image Docker akhir di bawah 40 MB, berjalan sebagai non-root, dan berhenti bersih (graceful) saat `docker stop`.',
      ]),
      references(
        ['axum::middleware', 'https://docs.rs/axum/latest/axum/middleware/index.html'],
        ['axum: error handling', 'https://docs.rs/axum/latest/axum/error_handling/index.html'],
        ['tower-http', 'https://docs.rs/tower-http/latest/tower_http/'],
        ['jsonwebtoken', 'https://docs.rs/jsonwebtoken/latest/jsonwebtoken/'],
        ['tracing-subscriber', 'https://docs.rs/tracing-subscriber/latest/tracing_subscriber/'],
        ['axum examples (testing, jwt, graceful-shutdown)', 'https://github.com/tokio-rs/axum/tree/main/examples'],
        ['Distroless images', 'https://github.com/GoogleContainerTools/distroless'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-cli-clap',
    title: 'Proyek: CLI Todo & Minigrep dengan clap',
    summary: 'Parsing argumen dengan clap derive, subcommand, pemisahan lib/main, error dan exit code, penyimpanan JSON yang atomik, tes binary, dan rilis binary lintas platform.',
    track: PROJECTS, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('CLI adalah proyek pertama yang paling cocok untuk Rust: satu binary tanpa runtime, start dalam milidetik, dan mudah dibagikan. Proyek ini membangun `todo`, pencatat tugas dengan subcommand `add`, `list`, dan `done`, ditambah fungsi pencarian ala `grep` dari The Book. Polanya sama untuk alat internal tim: logika di **library** yang mudah dites, **binary** tipis yang hanya mem-parse argumen dan mencetak hasil.'),
      code('Terminal', `cargo new todo
cd todo
cargo add clap --features derive,env
cargo add serde --features derive
cargo add serde_json anyhow
cargo add --dev tempfile`, 'bash'),
      code('src/lib.rs — logika yang bisa dites', `use std::{fs, io, path::Path};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Tugas {
    pub id: u32,
    pub teks: String,
    pub prioritas: u8,
    pub selesai: bool,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Daftar {
    pub tugas: Vec<Tugas>,
}

impl Daftar {
    pub fn muat(path: &Path) -> anyhow::Result<Self> {
        match fs::read_to_string(path) {
            Ok(isi) => Ok(serde_json::from_str(&isi)?),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(Self::default()), // file belum ada
            Err(e) => Err(e.into()),
        }
    }

    /// Tulis ke file sementara lalu rename: file lama tidak rusak bila proses mati di tengah.
    pub fn simpan(&self, path: &Path) -> anyhow::Result<()> {
        let tmp = path.with_extension("json.tmp");
        fs::write(&tmp, serde_json::to_string_pretty(self)?)?;
        fs::rename(&tmp, path)?;
        Ok(())
    }

    pub fn tambah(&mut self, teks: &str, prioritas: u8) -> u32 {
        let id = self.tugas.iter().map(|t| t.id).max().unwrap_or(0) + 1;
        self.tugas.push(Tugas { id, teks: teks.trim().to_string(), prioritas, selesai: false });
        id
    }

    pub fn tandai_selesai(&mut self, id: u32) -> Option<&Tugas> {
        let t = self.tugas.iter_mut().find(|t| t.id == id)?;
        t.selesai = true;
        Some(t)
    }
}

/// Pencarian ala minigrep: mengembalikan potongan dari \`isi\`, tanpa alokasi per baris.
pub fn cari<'a>(kueri: &str, isi: &'a str, abaikan_kapital: bool) -> Vec<(usize, &'a str)> {
    let kueri_kecil = kueri.to_lowercase();
    isi.lines()
        .enumerate()
        .filter(|(_, baris)| if abaikan_kapital { baris.to_lowercase().contains(&kueri_kecil) } else { baris.contains(kueri) })
        .map(|(i, baris)| (i + 1, baris))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn id_bertambah_dan_selesai() {
        let mut d = Daftar::default();
        assert_eq!(d.tambah("beli kopi", 2), 1);
        assert_eq!(d.tambah("bayar listrik", 1), 2);
        assert!(d.tandai_selesai(2).unwrap().selesai);
        assert!(d.tandai_selesai(99).is_none());
    }

    #[test]
    fn cari_tanpa_peduli_kapital() {
        let isi = "Rust cepat\\naman\\nRUST produktif";
        assert_eq!(cari("rust", isi, true), vec![(1, "Rust cepat"), (3, "RUST produktif")]);
        assert!(cari("rust", isi, false).is_empty());
    }
}`, 'rust'),
      code('src/main.rs — clap derive dan exit code', `use std::{path::PathBuf, process::ExitCode};
use clap::{Parser, Subcommand};
use todo::{cari, Daftar};

/// Pencatat tugas di terminal.
#[derive(Parser)]
#[command(name = "todo", version, about)]          // --version dan --help otomatis
struct Cli {
    /// Lokasi file data
    #[arg(short, long, env = "TODO_FILE", default_value = "todo.json", global = true)]
    file: PathBuf,

    #[command(subcommand)]
    perintah: Perintah,
}

#[derive(Subcommand)]
enum Perintah {
    /// Tambah tugas baru
    Add {
        teks: String,
        #[arg(short, long, default_value_t = 2, value_parser = clap::value_parser!(u8).range(1..=3))]
        prioritas: u8,
    },
    /// Tampilkan tugas
    List {
        /// Tampilkan juga yang sudah selesai
        #[arg(short, long)]
        semua: bool,
    },
    /// Tandai tugas selesai
    Done { id: u32 },
    /// Cari teks di file (ala grep)
    Grep {
        kueri: String,
        berkas: PathBuf,
        #[arg(short = 'i', long)]
        abaikan_kapital: bool,
    },
}

fn jalankan(cli: Cli) -> anyhow::Result<()> {
    match cli.perintah {
        Perintah::Add { teks, prioritas } => {
            let mut d = Daftar::muat(&cli.file)?;
            let id = d.tambah(&teks, prioritas);
            d.simpan(&cli.file)?;
            println!("ditambahkan #{id}");
        }
        Perintah::List { semua } => {
            let d = Daftar::muat(&cli.file)?;
            for t in d.tugas.iter().filter(|t| semua || !t.selesai) {
                println!("{:>3} [{}] P{} {}", t.id, if t.selesai { "x" } else { " " }, t.prioritas, t.teks);
            }
        }
        Perintah::Done { id } => {
            let mut d = Daftar::muat(&cli.file)?;
            d.tandai_selesai(id).ok_or_else(|| anyhow::anyhow!("tugas #{id} tidak ditemukan"))?;
            d.simpan(&cli.file)?;
        }
        Perintah::Grep { kueri, berkas, abaikan_kapital } => {
            let isi = std::fs::read_to_string(&berkas)
                .map_err(|e| anyhow::anyhow!("gagal membaca {}: {e}", berkas.display()))?;
            for (no, baris) in cari(&kueri, &isi, abaikan_kapital) {
                println!("{no}: {baris}");
            }
        }
    }
    Ok(())
}

fn main() -> ExitCode {
    match jalankan(Cli::parse()) {          // argumen salah: clap mencetak bantuan dan exit 2
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e:#}");      // {:#} mencetak rantai konteks anyhow
            ExitCode::FAILURE
        }
    }
}`, 'rust'),
      code('tests/cli.rs — menguji binary sungguhan', `use std::process::Command;

// Cargo menyediakan path binary hasil build untuk integration test
fn todo() -> Command {
    Command::new(env!("CARGO_BIN_EXE_todo"))
}

#[test]
fn add_lalu_list() {
    let dir = tempfile::tempdir().unwrap();
    let file = dir.path().join("t.json");

    let out = todo().args(["add", "beli kopi", "-p", "1"]).arg("--file").arg(&file).output().unwrap();
    assert!(out.status.success(), "stderr: {}", String::from_utf8_lossy(&out.stderr));

    let out = todo().arg("list").env("TODO_FILE", &file).output().unwrap();   // lewat env var
    assert!(String::from_utf8_lossy(&out.stdout).contains("beli kopi"));
}

#[test]
fn done_id_tidak_ada_gagal() {
    let dir = tempfile::tempdir().unwrap();
    let out = todo().args(["done", "99"]).env("TODO_FILE", dir.path().join("t.json")).output().unwrap();
    assert_eq!(out.status.code(), Some(1));
    assert!(String::from_utf8_lossy(&out.stderr).contains("tidak ditemukan"));
}

#[test]
fn prioritas_di_luar_rentang_ditolak_clap() {
    let out = todo().args(["add", "x", "-p", "9"]).output().unwrap();
    assert_eq!(out.status.code(), Some(2));           // kode exit error penggunaan dari clap
}`, 'rust'),
      code('Cargo.toml dan rilis binary', `# Cargo.toml: binary rilis lebih kecil
[profile.release]
lto = true
codegen-units = 1
strip = true          # buang simbol debug
panic = "abort"       # tanpa unwinding; cocok untuk CLI

# Terminal
cargo build --release                       # target/release/todo
cargo install --path .                      # pasang ke ~/.cargo/bin
rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl   # binary statis Linux

# Rilis multi-platform otomatis (GitHub Releases, installer shell/PowerShell):
# alat seperti cargo-dist ("dist") membuat workflow CI; cek dokumentasinya untuk versi terbaru.`, 'bash'),
      table(['Kebutuhan', 'Solusi'], [
        ['Argumen dan subcommand', '`clap` derive: `#[derive(Parser)]`, `#[derive(Subcommand)]`, doc comment menjadi teks `--help`'],
        ['Nilai dari env var', '`#[arg(env = "TODO_FILE")]` (feature `env`)'],
        ['Validasi rentang', '`value_parser!(u8).range(1..=3)`'],
        ['Error yang ramah', '`anyhow` + `{e:#}` di `main`, `ExitCode::FAILURE`'],
        ['Tes end-to-end', '`env!("CARGO_BIN_EXE_<nama>")` + `tempfile`, atau crate `assert_cmd`'],
        ['Output berwarna, progress bar', 'Crate `anstream`/`owo-colors`, `indicatif`; matikan warna bila output bukan terminal'],
      ]),
      callout('tip', 'Ikuti konvensi CLI Unix', 'Data hasil ke **stdout**, pesan error dan log ke **stderr**, exit code 0 untuk sukses dan bukan 0 untuk gagal. Dengan begitu `todo list | grep kopi` dan skrip shell yang memeriksa `$?` bekerja seperti yang diharapkan.'),
      ...quiz([
        ['RSP-13', 'Mengapa logika `Daftar` dan `cari` ditaruh di `lib.rs`, bukan langsung di `main.rs`?', 'Kode di library bisa diuji dengan unit test dan integration test tanpa menjalankan proses, dan bisa dipakai ulang oleh binary lain atau antarmuka web. main.rs cukup mem-parse argumen, memanggil library, dan menerjemahkan hasil menjadi output serta exit code.'],
        ['RSP-14', 'Mengapa `simpan` menulis ke file `.tmp` lalu `rename`, bukan langsung `fs::write` ke file tujuan?', 'fs::write memotong file lalu menulis ulang. Bila proses mati atau disk penuh di tengah, file data menjadi kosong atau rusak. Rename di filesystem yang sama bersifat atomik, sehingga pembaca selalu melihat versi lama yang utuh atau versi baru yang utuh.'],
      ]),
      ...practice('rsp-cli-clap', [
        'Subcommand `add`, `list`, `done`, dan `grep` berjalan; `todo --help` dan `todo add --help` menampilkan deskripsi dari doc comment.',
        'Tambahkan subcommand `rm <id>` dan opsi `list --urut prioritas`, lengkap dengan unit test.',
        'Minimal tiga integration test di `tests/cli.rs` memeriksa stdout, stderr, dan exit code.',
        'Bangun binary release untuk Linux (musl) dan platform Anda sendiri; catat ukuran sebelum dan sesudah `strip` + `lto`.',
      ]),
      references(
        ['The Book: An I/O Project (minigrep)', 'https://doc.rust-lang.org/book/ch12-00-an-io-project.html'],
        ['clap derive tutorial', 'https://docs.rs/clap/latest/clap/_derive/_tutorial/index.html'],
        ['Command Line Applications in Rust', 'https://rust-cli.github.io/book/'],
        ['The Cargo Book: Environment variables (CARGO_BIN_EXE)', 'https://doc.rust-lang.org/cargo/reference/environment-variables.html#environment-variables-cargo-sets-for-crates'],
        ['The Cargo Book: Profiles', 'https://doc.rust-lang.org/cargo/reference/profiles.html'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-performa',
    title: 'Rust: Performa — Benchmark criterion, Profiling & Alokasi',
    summary: 'Mengukur dengan criterion dan baseline, mencari hot path dengan flamegraph/samply, menghitung alokasi dengan dhat, teknik mengurangi alokasi, dan menyetel release profile.',
    track: PROJECTS, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Rust sudah cepat secara default, tetapi kode yang cepat tetap bisa lambat karena alokasi berlebihan, algoritma yang salah, atau build yang tidak dioptimasi. Urutan kerja yang benar selalu sama: **ukur** (benchmark yang bisa diulang), **temukan** penyebabnya (profiler), **perbaiki** satu hal, lalu **ukur lagi**. [Testing, Workspace & Tooling Cargo](#rust.rust-testing-cargo) sudah memperkenalkan criterion; modul ini memakainya secara serius.'),
      heading('Benchmark dengan criterion'),
      code('benches/parse.rs', `// Cargo.toml
// [dev-dependencies]
// criterion = "<versi terbaru>"
// [[bench]]
// name = "parse"
// harness = false          # pakai main dari criterion, bukan harness bawaan

use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use std::hint::black_box;  // cegah compiler membuang komputasi yang hasilnya tidak dipakai

// Dua implementasi yang dibandingkan (biasanya diimpor dari crate Anda)
fn parse_v1(s: &str) -> Option<u64> {
    s.trim().trim_start_matches("Rp").trim().replace('.', "").parse().ok()   // alokasi String
}

fn parse_v2(s: &str) -> Option<u64> {
    let s = s.trim().trim_start_matches("Rp").trim();
    let mut n: u64 = 0;
    for b in s.bytes() {
        match b {
            b'0'..=b'9' => n = n.checked_mul(10)?.checked_add(u64::from(b - b'0'))?,
            b'.' => {}
            _ => return None,
        }
    }
    (!s.is_empty()).then_some(n)                                             // tanpa alokasi
}

fn bench_parse(c: &mut Criterion) {
    let mut group = c.benchmark_group("parse_rupiah");
    for input in ["500", "Rp 1.250.000", "Rp 9.876.543.210.000"] {
        group.throughput(Throughput::Bytes(input.len() as u64));
        group.bench_with_input(BenchmarkId::new("v1_replace", input), input, |b, s| b.iter(|| parse_v1(black_box(s))));
        group.bench_with_input(BenchmarkId::new("v2_bytes", input), input, |b, s| b.iter(|| parse_v2(black_box(s))));
    }
    group.finish();
}

criterion_group!(benches, bench_parse);
criterion_main!(benches);`, 'rust'),
      code('Menjalankan dan membandingkan dengan baseline', `cargo bench                                   # laporan HTML di target/criterion/report/index.html
cargo bench -- parse_rupiah/v2                # filter nama
cargo bench -- --save-baseline sebelum        # simpan hasil sebelum optimasi
# ... ubah kode ...
cargo bench -- --baseline sebelum             # bandingkan: "change: -42% (p = 0.00 < 0.05)"`, 'bash'),
      heading('Profiling: di mana waktunya habis?'),
      code('flamegraph dan samply', `# Simbol debug di build release agar nama fungsi terbaca di profiler
# (Cargo.toml) [profile.release] debug = "line-tables-only"
# atau sementara: CARGO_PROFILE_RELEASE_DEBUG=true

# cargo-flamegraph: memakai perf (Linux) atau dtrace (macOS)
cargo install flamegraph
cargo flamegraph --bin kas-api            # hasil: flamegraph.svg
cargo flamegraph --bench parse -- --bench # memprofil benchmark

# samply: profiler sampling lintas platform, hasil dibuka di Firefox Profiler
cargo install samply
cargo build --release
samply record ./target/release/kas-api

# Membaca flamegraph: lebar kotak = porsi waktu CPU. Cari kotak lebar milik kode Anda,
# bukan yang paling tinggi. Kotak lebar alloc/memcpy/drop = tanda alokasi berlebihan.`, 'bash'),
      code('Menghitung alokasi dengan dhat', `// Cargo.toml: [dependencies] dhat = { version = "<versi terbaru>", optional = true }
//             [features] dhat-heap = ["dep:dhat"]
#[cfg(feature = "dhat-heap")]
#[global_allocator]
static ALLOC: dhat::Alloc = dhat::Alloc;

fn main() {
    #[cfg(feature = "dhat-heap")]
    let _profiler = dhat::Profiler::new_heap();   // ringkasan dicetak dan dhat-heap.json ditulis saat di-drop

    jalankan_beban();
}

fn jalankan_beban() {
    let data: Vec<String> = (0..100_000).map(|i| format!("Rp {i}.000")).collect();
    let total: u64 = data.iter().filter_map(|s| s.trim_start_matches("Rp ").replace('.', "").parse::<u64>().ok()).sum();
    println!("{total}");
}

// cargo run --release --features dhat-heap
// -> "Total: ... bytes in N blocks" ; buka dhat-heap.json di DHAT viewer untuk melihat baris penyebab`, 'rust'),
      code('Pola mengurangi alokasi', `use std::fmt::Write;

// 1. Praalokasi bila ukuran diketahui
fn kuadrat(xs: &[u64]) -> Vec<u64> {
    let mut out = Vec::with_capacity(xs.len());
    out.extend(xs.iter().map(|x| x * x));
    out
}

// 2. Pakai ulang buffer di dalam loop: clear() mempertahankan kapasitas
fn tulis_laporan(baris: &[(u32, u64)], keluar: &mut impl std::io::Write) -> std::io::Result<()> {
    let mut buf = String::with_capacity(128);
    for (id, jumlah) in baris {
        buf.clear();
        write!(buf, "{id};{jumlah}").unwrap();    // menulis ke buffer yang sama, bukan format! baru
        writeln!(keluar, "{buf}")?;
    }
    Ok(())
}

// 3. Kembalikan &str dari input daripada String baru (lihat Parser zero-copy di modul macro & lifetime)
fn kategori(baris: &str) -> Option<&str> {
    baris.split(';').nth(1)
}

// 4. Hindari clone di jalur panas; pinjam, atau bagi data besar dengan Arc
// 5. Bila profil menunjukkan malloc dominan di banyak thread, coba allocator lain:
//    #[global_allocator] static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;`, 'rust'),
      heading('Release profile'),
      code('Cargo.toml', `[profile.release]
opt-level = 3            # default release
lto = "thin"             # optimasi lintas crate; "fat" lebih lambat dikompilasi, kadang lebih cepat
codegen-units = 1        # optimasi lebih baik, kompilasi lebih lama
panic = "abort"          # binary lebih kecil; tidak bisa catch_unwind
debug = "line-tables-only"

# Profil khusus untuk profiling, mewarisi release
[profile.profiling]
inherits = "release"
debug = true
strip = false
# cargo build --profile profiling  -> target/profiling/

# Optimasi untuk CPU mesin ini saja (binary mungkin tidak jalan di CPU lain):
# RUSTFLAGS="-C target-cpu=native" cargo build --release`, 'text'),
      table(['Gejala di profil', 'Kemungkinan penyebab', 'Perbaikan'], [
        ['`malloc`/`free`/`drop` lebar', 'Alokasi per item di loop', '`with_capacity`, pakai ulang buffer, `&str`, `Cow`'],
        ['`memcpy` lebar', 'Clone atau move struct besar', 'Pinjam, `Box` data besar, `Arc` untuk dibagi'],
        ['`HashMap` hashing dominan', 'SipHash default (tahan DoS) di jalur panas', 'Hasher lebih cepat (mis. crate `rustc-hash`/`ahash`) bila input tidak dari pengguna'],
        ['Banyak waktu di lock', 'Contention `Mutex`', 'Perkecil critical section, sharding, atomic, channel'],
        ['Debug build lambat 10–50x', 'Lupa `--release`', 'Selalu ukur dengan `--release` atau profil turunannya'],
      ]),
      callout('warn', 'Jebakan benchmark', 'Mengukur build debug, input yang dihitung habis oleh compiler karena tidak dibungkus `black_box`, menjalankan benchmark di laptop dengan mode hemat daya atau banyak aplikasi lain terbuka, dan menyimpulkan dari satu angka tanpa melihat variansi. Criterion membantu dengan statistik dan perbandingan baseline, tetapi lingkungan tetap harus stabil.'),
      ...quiz([
        ['RSP-15', 'Mengapa input benchmark dibungkus `std::hint::black_box`?', 'Tanpa black_box, compiler bisa melihat bahwa input konstan dan menghitung hasilnya saat kompilasi, atau membuang pemanggilan yang hasilnya tidak dipakai. Benchmark lalu mengukur hampir nol. black_box membuat compiler memperlakukan nilai sebagai tidak diketahui.'],
        ['RSP-16', 'Flamegraph menunjukkan kotak `alloc::raw_vec::finish_grow` dan `memcpy` yang lebar di bawah fungsi Anda. Apa artinya dan apa langkah pertama?', 'Vec atau String sering tumbuh melewati kapasitas sehingga dialokasi ulang dan isinya disalin. Langkah pertama: praalokasi dengan with_capacity bila ukuran bisa diperkirakan, atau pakai ulang buffer dengan clear() di dalam loop, lalu ukur ulang dengan benchmark atau dhat.'],
      ]),
      ...practice('rsp-performa', [
        'Benchmark criterion membandingkan dua implementasi parser dengan tiga ukuran input; simpan baseline dan tunjukkan perubahan persentase setelah optimasi.',
        'Buat flamegraph (atau rekaman samply) dari API atau CLI Anda di bawah beban, dan identifikasi tiga fungsi terlebar milik kode sendiri.',
        'Hitung total alokasi satu alur dengan dhat, kurangi minimal 50%, dan buktikan hasil tes tidak berubah.',
        'Bandingkan waktu kompilasi, ukuran binary, dan hasil benchmark antara `lto = false`, `"thin"`, dan `"fat"`.',
      ]),
      references(
        ['Criterion.rs User Guide', 'https://bheisler.github.io/criterion.rs/book/'],
        ['The Rust Performance Book', 'https://nnethercote.github.io/perf-book/'],
        ['cargo-flamegraph', 'https://github.com/flamegraph-rs/flamegraph'],
        ['samply', 'https://github.com/mstange/samply'],
        ['dhat-rs', 'https://docs.rs/dhat/latest/dhat/'],
        ['The Cargo Book: Profiles', 'https://doc.rust-lang.org/cargo/reference/profiles.html'],
        ['std::hint::black_box', 'https://doc.rust-lang.org/std/hint/fn.black_box.html'],
      ),
    ],
  },
  {
    ...src,
    id: 'rsp-wasm',
    title: 'Rust → WebAssembly: wasm-bindgen, wasm-pack & Vite',
    summary: 'Mengompilasi Rust ke wasm32, mengekspor fungsi dan struct dengan wasm-bindgen, membangun paket dengan wasm-pack, memanggilnya dari TypeScript di Vite, serta error, panic, dan ukuran binary.',
    track: PROJECTS, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('WebAssembly (Wasm) memungkinkan kode Rust berjalan di browser dengan kecepatan mendekati native. Kasus yang cocok: komputasi berat di sisi klien (kalkulasi finansial, kompresi, parsing file besar, pemrosesan gambar) dan **berbagi logika** yang sama antara backend Rust dan frontend, misalnya aturan validasi atau rumus cicilan. Yang tidak cocok: manipulasi DOM sederhana, karena setiap lompatan JS ↔ Wasm ada biayanya dan JavaScript sudah cepat untuk itu.'),
      code('Terminal', `rustup target add wasm32-unknown-unknown
cargo install wasm-pack          # atau ikuti installer di situs wasm-pack
cargo new --lib kas-wasm
cd kas-wasm
cargo add wasm-bindgen
cargo add serde --features derive
cargo add serde-wasm-bindgen console_error_panic_hook`, 'bash'),
      code('Cargo.toml', `[package]
name = "kas-wasm"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib", "rlib"]   # cdylib untuk .wasm, rlib agar tetap bisa dites dengan cargo test

[profile.release]
opt-level = "s"                   # optimasi ukuran; coba juga "z"
lto = true`, 'text'),
      code('src/lib.rs', `use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn mulai() {
    // Panic Rust tampil sebagai pesan jelas di console browser, bukan "unreachable executed"
    console_error_panic_hook::set_once();
}

// Mengimpor fungsi dari JavaScript
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Cicilan per bulan (anuitas). Angka f64 dipetakan ke number di JS.
#[wasm_bindgen]
pub fn cicilan_bulanan(pokok: f64, bunga_tahunan_persen: f64, bulan: u32) -> Result<f64, JsError> {
    if pokok <= 0.0 || bulan == 0 {
        return Err(JsError::new("pokok harus > 0 dan bulan minimal 1"));   // menjadi exception di JS
    }
    let r = bunga_tahunan_persen / 100.0 / 12.0;
    if r == 0.0 {
        return Ok(pokok / f64::from(bulan));
    }
    let n = f64::from(bulan);
    Ok(pokok * r * (1.0 + r).powf(n) / ((1.0 + r).powf(n) - 1.0))
}

#[derive(Serialize)]
pub struct Baris {
    pub bulan: u32,
    pub pokok: f64,
    pub bunga: f64,
    pub sisa: f64,
}

/// Mengembalikan struktur kompleks sebagai objek/array JS biasa lewat serde.
#[wasm_bindgen]
pub fn jadwal(pokok: f64, bunga_tahunan_persen: f64, bulan: u32) -> Result<JsValue, JsError> {
    let bayar = cicilan_bulanan(pokok, bunga_tahunan_persen, bulan)?;
    let r = bunga_tahunan_persen / 100.0 / 12.0;
    let mut sisa = pokok;
    let baris: Vec<Baris> = (1..=bulan)
        .map(|b| {
            let bunga = sisa * r;
            let pokok_dibayar = bayar - bunga;
            sisa = (sisa - pokok_dibayar).max(0.0);
            Baris { bulan: b, pokok: pokok_dibayar, bunga, sisa }
        })
        .collect();
    log(&format!("jadwal {bulan} bulan dihitung"));
    Ok(serde_wasm_bindgen::to_value(&baris)?)
}

/// Struct yang dipakai sebagai class di JS.
#[wasm_bindgen]
pub struct Dompet {
    saldo: f64,
}

#[wasm_bindgen]
impl Dompet {
    #[wasm_bindgen(constructor)]
    pub fn new(awal: f64) -> Dompet {
        Dompet { saldo: awal }
    }

    pub fn tarik(&mut self, n: f64) -> Result<(), JsError> {
        if n > self.saldo {
            return Err(JsError::new("saldo tidak cukup"));
        }
        self.saldo -= n;
        Ok(())
    }

    #[wasm_bindgen(getter)]
    pub fn saldo(&self) -> f64 {
        self.saldo
    }
}`, 'rust'),
      code('Build dengan wasm-pack', `wasm-pack build --target web --release
# Hasil di pkg/:
#   kas_wasm_bg.wasm   modul WebAssembly
#   kas_wasm.js        glue code + fungsi init()
#   kas_wasm.d.ts      tipe TypeScript otomatis dari signature Rust
#   package.json       bisa dipasang sebagai dependensi npm

# Di proyek Vite (folder bersebelahan):
npm install ../kas-wasm/pkg`, 'bash'),
      code('src/cicilan.ts — dipanggil dari aplikasi Vite', `import init, { cicilan_bulanan, jadwal, Dompet } from 'kas-wasm';

let siap: Promise<unknown> | null = null;
// init() mengunduh dan meng-instansiasi .wasm sekali; Vite melayani file .wasm lewat new URL(..., import.meta.url)
export const muatWasm = () => (siap ??= init());

export async function hitung(pokok: number, bunga: number, bulan: number) {
  await muatWasm();
  try {
    const perBulan = cicilan_bulanan(pokok, bunga, bulan);
    const rincian = jadwal(pokok, bunga, bulan) as { bulan: number; pokok: number; bunga: number; sisa: number }[];
    return { perBulan, rincian };
  } catch (e) {
    // JsError dari Rust diterima sebagai Error biasa
    throw new Error(\`perhitungan gagal: \${(e as Error).message}\`);
  }
}

export async function demoDompet() {
  await muatWasm();
  const d = new Dompet(100_000);
  d.tarik(25_000);
  console.log(d.saldo);   // 75000 (getter)
  d.free();               // lepaskan memori Wasm milik objek ini (atau andalkan FinalizationRegistry)
}`, 'ts'),
      table(['Tipe Rust', 'Tipe di JS/TS', 'Catatan'], [
        ['`f64`, `i32`, `u32`', '`number`', 'Paling murah melewati batas JS ↔ Wasm'],
        ['`i64`, `u64`', '`bigint`', 'Pemanggil JS harus menulis `1250000n`; sering mengejutkan'],
        ['`&str` / `String`', '`string`', 'Disalin dan dikonversi UTF-16 ↔ UTF-8 setiap lewat'],
        ['`Vec<u8>` / `&[u8]`', '`Uint8Array`', 'Cocok untuk data biner besar (file, gambar)'],
        ['Struct `#[wasm_bindgen]`', 'Class', 'Data tetap di memori Wasm; panggil `free()` bila objek banyak'],
        ['Struct serde + `serde_wasm_bindgen`', 'Objek/array biasa', 'Fleksibel, ada biaya konversi'],
        ['`Result<T, JsError>`', 'Nilai T atau exception', 'Tangkap dengan try/catch di JS'],
      ]),
      callout('tip', 'Jaga batas JS ↔ Wasm tetap tipis', 'Kirim data dalam potongan besar dan lakukan banyak kerja per panggilan. Memanggil fungsi Wasm sejuta kali untuk satu angka per panggilan bisa lebih lambat dari JavaScript murni. Untuk ukuran file, gunakan `opt-level = "s"`, `lto`, dan `wasm-opt` dari Binaryen (wasm-pack menjalankannya otomatis bila tersedia); periksa hasilnya dengan `twiggy` bila masih besar.'),
      callout('info', 'Status tooling', 'Pada 2025 organisasi GitHub `rustwasm` diarsipkan: wasm-bindgen dipindah ke organisasi baru, dan alat pendukung seperti wasm-pack dipelihara oleh pengelola baru. Sebelum memulai proyek baru, cek repositori dan versi terbaru masing-masing alat. Alternatif tanpa wasm-pack: `cargo build --target wasm32-unknown-unknown --release` lalu jalankan CLI `wasm-bindgen` dengan versi yang sama persis dengan crate wasm-bindgen di Cargo.lock.'),
      ...quiz([
        ['RSP-17', 'Fungsi Rust `fn total(n: u64) -> u64` diekspor dengan wasm-bindgen, tetapi `total(5)` dari JS melempar TypeError. Mengapa?', 'wasm-bindgen memetakan i64/u64 ke BigInt di JavaScript. Pemanggil harus mengirim `5n` dan menerima bigint. Bila nilainya tidak melebihi 2^53, lebih praktis memakai f64 atau u32 agar menjadi number biasa.'],
        ['RSP-18', 'Mengapa `crate-type` diisi `["cdylib", "rlib"]` dan bukan hanya `cdylib`?', 'cdylib menghasilkan modul .wasm untuk dipakai JavaScript. rlib membuat crate tetap bisa dipakai sebagai dependensi Rust biasa dan diuji dengan `cargo test` di target native, sehingga logika seperti rumus cicilan bisa dites tanpa browser dan dibagi dengan backend.'],
      ]),
      ...practice('rsp-wasm', [
        'Fungsi `cicilan_bulanan` punya unit test native (`cargo test`) dan memberikan hasil yang sama saat dipanggil dari browser.',
        'Halaman Vite berisi form pokok, bunga, dan tenor yang menampilkan tabel jadwal cicilan dari Wasm, dengan pesan error dari `JsError` saat input tidak valid.',
        'Bandingkan waktu menghitung 1 juta baris jadwal di Wasm dan di TypeScript murni, lalu jelaskan hasilnya.',
        'Catat ukuran `.wasm` sebelum dan sesudah `opt-level = "s"`, `lto`, dan `wasm-opt`.',
      ]),
      references(
        ['wasm-bindgen (docs.rs)', 'https://docs.rs/wasm-bindgen/latest/wasm_bindgen/'],
        ['wasm-bindgen repository & guide', 'https://github.com/wasm-bindgen/wasm-bindgen'],
        ['wasm-pack (crates.io)', 'https://crates.io/crates/wasm-pack'],
        ['serde-wasm-bindgen', 'https://docs.rs/serde-wasm-bindgen/latest/serde_wasm_bindgen/'],
        ['MDN: Compiling from Rust to WebAssembly', 'https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_Wasm'],
        ['Vite: WebAssembly', 'https://vite.dev/guide/features.html#webassembly'],
      ),
    ],
  },
];
