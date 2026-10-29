import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const CORE = 'Rust Inti';
const BACKEND = 'Rust untuk Backend';

export const rustCoreTracks: Track[] = [
  { title: CORE, summary: 'Ownership, borrowing, lifetime, enum & pattern matching, error handling, trait, dan generic.' },
  { title: BACKEND, summary: 'Async dengan Tokio dan REST API Axum + SQLx.' },
];

export const rustCoreSource = 'Rust Inti: materi tambahan dari The Rust Programming Language dan dokumentasi resmi (29 Oktober 2026)';

export const rustCoreModules: Omit<Module, 'code'>[] = [
  {
    id: 'rust-ownership-borrowing',
    title: 'Rust: Ownership, Borrowing & Lifetime',
    summary: 'Aturan memori tanpa garbage collector: move, clone, &T, &mut T, dan anotasi lifetime.',
    track: CORE, source: rustCoreSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Ownership adalah fitur yang membuat Rust berbeda: memori dibebaskan otomatis tanpa garbage collector, dan data race dicegah saat kompilasi. Tiga aturan: setiap nilai punya **satu pemilik**; saat pemilik keluar scope, nilai di-*drop*; kepemilikan bisa **dipindah (move)** atau **dipinjam (borrow)**.'),
      code('Move vs clone vs Copy', `fn main() {
    let a = String::from("halo");   // String di heap, a pemiliknya
    let b = a;                      // move: kepemilikan pindah ke b
    // println!("{a}");             // error: value borrowed after move
    let c = b.clone();              // salinan eksplisit di heap
    println!("{b} {c}");

    let x = 5;                      // i32 mengimplementasikan Copy
    let y = x;                      // disalin, x masih valid
    println!("{x} {y}");
}`, 'rust'),
      code('Borrowing: & dan &mut', `fn panjang(s: &str) -> usize {        // meminjam, tidak mengambil kepemilikan
    s.len()
}

fn tambah_seru(s: &mut String) {       // pinjaman mutable
    s.push('!');
}

fn main() {
    let mut pesan = String::from("halo");
    println!("{}", panjang(&pesan));
    tambah_seru(&mut pesan);
    println!("{pesan}");

    let r1 = &pesan;
    let r2 = &pesan;                   // banyak pinjaman baca boleh
    println!("{r1} {r2}");
    let r3 = &mut pesan;               // boleh: r1 & r2 sudah tidak dipakai lagi
    r3.push('?');
}`, 'rust'),
      table(['Aturan pinjaman', 'Artinya'], [
        ['Banyak `&T` ATAU satu `&mut T`', 'Tidak ada yang membaca saat data sedang diubah (mencegah data race)'],
        ['Referensi tidak boleh hidup lebih lama dari pemilik', 'Tidak ada dangling pointer'],
        ['Pinjaman berakhir pada pemakaian terakhir (NLL)', 'Scope pinjaman lebih pendek dari blok kurung kurawal'],
      ]),
      code('Lifetime: hubungan umur referensi', `// Hasil hidup selama input yang paling pendek umurnya
fn terpanjang<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

struct Token<'a> {
    teks: &'a str,                     // struct meminjam data, tidak boleh hidup lebih lama darinya
}`, 'rust'),
      callout('tip', 'Saat compiler menolak', 'Baca pesan error borrow checker sampai habis; biasanya menyertakan saran. Solusi umum: kembalikan nilai milik (`String`) daripada referensi, persempit scope pinjaman, atau `clone()` bila datanya kecil. Pakai `Rc`/`Arc` hanya bila memang butuh banyak pemilik.'),
      ...quiz([
        ['RSI-01', 'Mengapa `let b = a;` membuat `a` tidak bisa dipakai bila `a` bertipe String, tetapi tidak bila i32?', 'String memegang buffer di heap. Bila keduanya tetap valid, keduanya akan membebaskan buffer yang sama (double free). Maka Rust memindahkan kepemilikan. i32 kecil dan mengimplementasikan Copy, sehingga cukup disalin bit per bit dan keduanya tetap valid.'],
        ['RSI-02', 'Kapan fungsi sebaiknya menerima `&str` dibanding `String`?', 'Bila fungsi hanya membaca teks. `&str` menerima String (lewat deref), literal, dan potongan string tanpa memaksa pemanggil menyerahkan kepemilikan atau mengalokasi ulang. Terima `String` hanya bila fungsi perlu menyimpan atau memiliki datanya.'],
      ]),
      ...practice('rust-ownership', ['Tulis tiga program yang sengaja memicu error move, borrow mutable ganda, dan dangling reference; catat pesan compiler.', 'Ubah fungsi yang menerima String menjadi &str dan pastikan pemanggil lebih sederhana.', 'Jelaskan lifetime pada fungsi terpanjang dengan kata sendiri.']),
      references(['The Book: Ownership', 'https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html'], ['The Book: Lifetimes', 'https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html']),
    ],
  },
  {
    id: 'rust-struct-enum-match',
    title: 'Rust: Struct, Enum & Pattern Matching',
    summary: 'Memodelkan domain dengan tipe: struct + impl, enum berdata, match exhaustive, if let, dan let-else.',
    track: CORE, source: rustCoreSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Enum Rust bisa membawa data di tiap varian, dan `match` wajib menangani semua varian. Kombinasi ini membuat status yang tidak mungkin terjadi tidak bisa direpresentasikan, sehingga banyak bug tertangkap saat kompilasi.'),
      code('Struct dan impl', `#[derive(Debug, Clone, PartialEq)]
struct Transaksi {
    id: u64,
    jumlah: i64,
    jenis: Jenis,
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum Jenis {
    Pemasukan,
    Pengeluaran,
}

impl Transaksi {
    fn baru(id: u64, jumlah: i64, jenis: Jenis) -> Self {
        Self { id, jumlah, jenis }
    }

    fn nilai_bertanda(&self) -> i64 {
        match self.jenis {
            Jenis::Pemasukan => self.jumlah,
            Jenis::Pengeluaran => -self.jumlah,
        }
    }
}`, 'rust'),
      code('Enum berdata dan match', `enum Pembayaran {
    Tunai,
    Kartu { nomor_akhir: String },
    Transfer(String),             // nama bank
}

fn label(p: &Pembayaran) -> String {
    match p {
        Pembayaran::Tunai => "tunai".to_string(),
        Pembayaran::Kartu { nomor_akhir } => format!("kartu ****{nomor_akhir}"),
        Pembayaran::Transfer(bank) if bank == "BCA" => "transfer BCA".to_string(),
        Pembayaran::Transfer(bank) => format!("transfer {bank}"),
    }                              // lupa satu varian = error kompilasi
}

fn bonus(skor: u32) -> &'static str {
    match skor {
        0 => "tidak ada",
        1..=50 => "kecil",
        _ => "besar",
    }
}

fn parse_id(input: &str) -> Option<u64> {
    let Ok(id) = input.parse::<u64>() else {   // let-else: keluar lebih awal bila pola gagal
        return None;
    };
    Some(id)
}`, 'rust'),
      ...practice('rust-enum', ['Modelkan status pesanan (Dibuat, Dibayar{tanggal}, Dikirim{resi}, Batal{alasan}) sebagai enum.', 'Tulis fungsi transisi status yang menolak transisi tidak valid dengan match.', 'Tambahkan varian baru dan amati compiler menunjukkan semua match yang perlu diperbarui.']),
      references(['The Book: Structs', 'https://doc.rust-lang.org/book/ch05-00-structs.html'], ['The Book: Enums & match', 'https://doc.rust-lang.org/book/ch06-00-enums.html'], ['The Book: Patterns', 'https://doc.rust-lang.org/book/ch19-00-patterns.html']),
    ],
  },
  {
    id: 'rust-error-handling',
    title: 'Rust: Option, Result & Error Handling',
    summary: 'Tanpa null dan exception: Option, Result, operator ?, error kustom dengan thiserror, dan anyhow di aplikasi.',
    track: CORE, source: rustCoreSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Rust tidak punya null dan exception. Nilai yang mungkin kosong bertipe `Option<T>`; operasi yang bisa gagal mengembalikan `Result<T, E>`. Operator `?` meneruskan error ke pemanggil sehingga jalur sukses tetap mudah dibaca.'),
      code('Result dan operator ?', `use std::fs;
use std::num::ParseIntError;

fn total_dari_file(path: &str) -> Result<i64, Box<dyn std::error::Error>> {
    let isi = fs::read_to_string(path)?;          // io::Error diteruskan
    let mut total = 0;
    for baris in isi.lines() {
        total += baris.trim().parse::<i64>()?;    // ParseIntError diteruskan
    }
    Ok(total)
}

fn parse_semua(xs: &[&str]) -> Result<Vec<i64>, ParseIntError> {
    xs.iter().map(|s| s.parse::<i64>()).collect() // berhenti di error pertama
}`, 'rust'),
      code('Error kustom dengan thiserror (library) dan anyhow (aplikasi)', `// Cargo.toml: thiserror = "2", anyhow = "1"
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TransaksiError {
    #[error("jumlah harus positif, dapat {0}")]
    JumlahTidakValid(i64),
    #[error("transaksi {id} tidak ditemukan")]
    TidakDitemukan { id: u64 },
    #[error(transparent)]
    Io(#[from] std::io::Error),   // ? otomatis mengubah io::Error menjadi varian ini
}

fn validasi(jumlah: i64) -> Result<i64, TransaksiError> {
    if jumlah <= 0 {
        return Err(TransaksiError::JumlahTidakValid(jumlah));
    }
    Ok(jumlah)
}

// Di main/aplikasi: anyhow menambah konteks tanpa mendefinisikan enum baru
fn main() -> anyhow::Result<()> {
    use anyhow::Context;
    let isi = std::fs::read_to_string("config.toml").context("gagal membaca config.toml")?;
    println!("{}", isi.len());
    Ok(())
}`, 'rust'),
      table(['Alat', 'Kapan'], [
        ['`Option<T>`', 'Nilai boleh tidak ada (bukan error)'],
        ['`Result<T, E>`', 'Operasi bisa gagal dan pemanggil perlu tahu alasannya'],
        ['`thiserror`', 'Library/domain: error bertipe yang bisa di-match pemanggil'],
        ['`anyhow`', 'Binary/aplikasi: kumpulkan error apa pun + konteks untuk log'],
        ['`unwrap`/`expect`', 'Tes, prototipe, atau invariant yang benar-benar mustahil gagal'],
      ]),
      callout('warn', 'Hindari unwrap di kode produksi', '`unwrap()` membuat program panic saat nilai None/Err. Di server, satu input buruk bisa mematikan task. Gunakan `?`, `unwrap_or`, atau `ok_or(...)` untuk mengubah Option menjadi Result.'),
      ...practice('rust-error', ['Ubah program yang penuh unwrap menjadi memakai ? dan Result.', 'Buat enum error domain dengan thiserror dan match di pemanggil untuk menampilkan pesan berbeda.', 'Tambahkan .context() pada setiap error I/O di main.']),
      references(['The Book: Error handling', 'https://doc.rust-lang.org/book/ch09-00-error-handling.html'], ['thiserror', 'https://docs.rs/thiserror'], ['anyhow', 'https://docs.rs/anyhow']),
    ],
  },
  {
    id: 'rust-trait-generic',
    title: 'Rust: Trait, Generic, Collections & Iterator',
    summary: 'Abstraksi tanpa biaya runtime: trait, generic dengan bound, dyn Trait, Vec/HashMap, dan rantai iterator.',
    track: CORE, source: rustCoreSource, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Trait mendefinisikan perilaku bersama (mirip interface). Generic dengan trait bound dikompilasi menjadi kode khusus per tipe (*monomorphization*), sehingga abstraksi tidak menambah biaya runtime. `dyn Trait` dipakai ketika tipe konkret baru diketahui saat runtime.'),
      code('Trait, generic, dan dyn', `use std::collections::HashMap;
use std::fmt::Display;

trait Repo {
    fn simpan(&mut self, jumlah: i64) -> u64;
    fn total(&self) -> i64;
}

#[derive(Default)]
struct RepoMemori {
    data: HashMap<u64, i64>,
    next_id: u64,
}

impl Repo for RepoMemori {
    fn simpan(&mut self, jumlah: i64) -> u64 {
        self.next_id += 1;
        self.data.insert(self.next_id, jumlah);
        self.next_id
    }
    fn total(&self) -> i64 {
        self.data.values().sum()
    }
}

fn laporan<R: Repo>(repo: &R) -> String {          // static dispatch
    format!("total: {}", repo.total())
}

fn cetak_semua(items: &[Box<dyn Display>]) {        // dynamic dispatch: tipe campuran
    for i in items {
        println!("{i}");
    }
}`, 'rust'),
      code('Iterator dan closure', `use std::collections::HashMap;

#[derive(Debug)]
struct Tx { kategori: String, jumlah: i64 }

fn per_kategori(txs: &[Tx]) -> HashMap<&str, i64> {
    let mut hasil = HashMap::new();
    for t in txs.iter().filter(|t| t.jumlah > 0) {
        *hasil.entry(t.kategori.as_str()).or_insert(0) += t.jumlah;
    }
    hasil
}

fn top3(txs: &[Tx]) -> Vec<&Tx> {
    let mut v: Vec<&Tx> = txs.iter().collect();
    v.sort_by_key(|t| std::cmp::Reverse(t.jumlah));
    v.into_iter().take(3).collect()
}`, 'rust'),
      table(['Trait umum', 'Fungsi'], [
        ['`Debug` / `Display`', 'Format `{:?}` untuk debug / `{}` untuk pengguna'],
        ['`Clone` / `Copy`', 'Salinan eksplisit / salinan implisit untuk tipe kecil'],
        ['`From` / `Into`', 'Konversi antar tipe; dipakai `?` untuk mengubah error'],
        ['`Iterator`', 'Cukup implementasi `next()` untuk mendapat map/filter/sum dll.'],
        ['`Send` / `Sync`', 'Aman dipindah / dibagi antar thread (dicek compiler)'],
      ]),
      ...practice('rust-trait', ['Buat trait Repo dengan dua implementasi (memori dan file) dan fungsi generic yang menerima keduanya.', 'Tulis ulang loop for menjadi rantai iterator dan pastikan hasilnya sama.', 'Implementasikan Display untuk struct Transaksi.']),
      references(['The Book: Traits & generics', 'https://doc.rust-lang.org/book/ch10-00-generics.html'], ['The Book: Iterators & closures', 'https://doc.rust-lang.org/book/ch13-00-functional-features.html'], ['std::collections', 'https://doc.rust-lang.org/std/collections/']),
    ],
  },
  {
    id: 'rust-axum-tokio',
    title: 'Rust: REST API dengan Tokio, Axum & SQLx',
    summary: 'Async runtime Tokio, router Axum, state bersama, JSON dengan serde, error ke HTTP, dan query SQLx.',
    track: BACKEND, source: rustCoreSource, duration: '3–4 jam', level: 'Hard',
    blocks: [
      paragraph('Untuk backend, kombinasi yang paling banyak dipakai adalah **Tokio** (runtime async), **Axum** (web framework dari tim Tokio), **serde** (JSON), dan **SQLx** (query SQL async yang dicek saat kompilasi). Proyek ini membangun API transaksi yang sama dengan kurikulum Go dan Python.'),
      code('Terminal', `cargo new kas-api
cd kas-api
cargo add tokio --features full
cargo add axum serde --features serde/derive
cargo add serde_json thiserror anyhow
cargo add sqlx --features runtime-tokio,postgres
cargo add tracing tracing-subscriber
cargo run`, 'bash'),
      code('src/main.rs', `use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Clone)]
struct AppState {
    db: PgPool,
}

#[derive(Serialize, sqlx::FromRow)]
struct Transaksi { id: i64, jumlah: i64, kategori: String }

#[derive(Deserialize)]
struct TransaksiBaru { jumlah: i64, kategori: String }

#[derive(Debug, thiserror::Error)]
enum ApiError {
    #[error("tidak ditemukan")]
    NotFound,
    #[error("input tidak valid: {0}")]
    BadRequest(String),
    #[error(transparent)]
    Db(#[from] sqlx::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = match &self {
            ApiError::NotFound => StatusCode::NOT_FOUND,
            ApiError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ApiError::Db(e) => {
                tracing::error!(error = %e, "database error");
                StatusCode::INTERNAL_SERVER_ERROR
            }
        };
        (status, Json(serde_json::json!({ "error": self.to_string() }))).into_response()
    }
}

async fn list(State(s): State<AppState>) -> Result<Json<Vec<Transaksi>>, ApiError> {
    let rows = sqlx::query_as::<_, Transaksi>("SELECT id, jumlah, kategori FROM transaksi ORDER BY id")
        .fetch_all(&s.db).await?;
    Ok(Json(rows))
}

async fn detail(State(s): State<AppState>, Path(id): Path<i64>) -> Result<Json<Transaksi>, ApiError> {
    sqlx::query_as::<_, Transaksi>("SELECT id, jumlah, kategori FROM transaksi WHERE id = $1")
        .bind(id)
        .fetch_optional(&s.db).await?
        .map(Json)
        .ok_or(ApiError::NotFound)
}

async fn create(State(s): State<AppState>, Json(body): Json<TransaksiBaru>) -> Result<(StatusCode, Json<Transaksi>), ApiError> {
    if body.jumlah <= 0 {
        return Err(ApiError::BadRequest("jumlah harus positif".into()));
    }
    let row = sqlx::query_as::<_, Transaksi>(
        "INSERT INTO transaksi (jumlah, kategori) VALUES ($1, $2) RETURNING id, jumlah, kategori",
    )
    .bind(body.jumlah).bind(&body.kategori)
    .fetch_one(&s.db).await?;
    Ok((StatusCode::CREATED, Json(row)))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    let db = PgPool::connect(&std::env::var("DATABASE_URL")?).await?;
    let app = Router::new()
        .route("/transaksi", get(list).post(create))
        .route("/transaksi/{id}", get(detail))
        .with_state(AppState { db });
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}`, 'rust'),
      callout('info', 'Catatan versi', 'Contoh memakai sintaks path Axum 0.8 (`/{id}`); versi 0.7 memakai `/:id`. Makro `sqlx::query_as!` memeriksa SQL terhadap database saat kompilasi; versi fungsi di atas tidak butuh database saat build.'),
      heading('Langkah lanjut'),
      { type: 'list', items: ['Migrasi dengan `sqlx migrate add` dan `sqlx migrate run`.', 'Middleware `tower-http` untuk trace, CORS, timeout, dan kompresi.', 'Graceful shutdown dengan `axum::serve(...).with_graceful_shutdown(signal)`.', 'Tes integrasi memakai `tower::ServiceExt::oneshot` tanpa membuka port.'] },
      ...practice('rust-axum', ['GET, GET by id, dan POST berjalan terhadap Postgres lokal.', 'Error database tidak membocorkan detail ke klien, tetapi tercatat di log.', 'Input jumlah negatif mendapat 400 dengan body JSON yang konsisten.', 'Bandingkan ukuran binary release dan memori dengan versi Go/Python API yang sama.']),
      references(['Tokio tutorial', 'https://tokio.rs/tokio/tutorial'], ['Axum docs', 'https://docs.rs/axum/latest/axum/'], ['SQLx', 'https://github.com/launchbadge/sqlx'], ['serde', 'https://serde.rs/']),
    ],
  },
];
