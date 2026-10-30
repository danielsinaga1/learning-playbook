import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const ADVANCED = 'Rust Lanjutan';

export const rustAdvancedTracks: Track[] = [
  { title: ADVANCED, summary: 'Closure & iterator mendalam, smart pointer, konkurensi dengan thread, testing & Cargo, macro, dan lifetime lanjutan.' },
];

export const rustAdvancedSource = 'Rust Lanjutan: materi tambahan dari The Rust Programming Language, Rust by Example, dan dokumentasi std (30 Oktober 2026)';

const base = { track: ADVANCED, source: rustAdvancedSource };

/** Lanjutan dari track Rust Inti: topik yang tidak dibahas di rust-core.ts. */
export const rustAdvancedModules: Omit<Module, 'code'>[] = [
  {
    ...base,
    id: 'rust-closure-iterator',
    title: 'Rust: Closure & Iterator Mendalam',
    summary: 'Fn/FnMut/FnOnce, closure move, adaptor iterator, collect ke berbagai tipe, iterator buatan sendiri, dan zero-cost abstraction.',
    duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Di [Trait, Generic, Collections & Iterator](#rust.rust-trait-generic) kita sudah memakai `filter`, `map`, dan `collect`. Modul ini membongkar mesinnya: bagaimana closure menangkap variabel, mengapa ada tiga trait closure, adaptor yang jarang dipakai tetapi sangat berguna, dan cara membuat iterator sendiri. Semua ini dikompilasi menjadi loop biasa tanpa biaya tambahan.'),
      heading('Closure: Fn, FnMut, FnOnce'),
      paragraph('Compiler memilih trait closure berdasarkan **apa yang dilakukan closure terhadap variabel yang ditangkap**: hanya membaca (`Fn`), mengubah (`FnMut`), atau memindahkan keluar (`FnOnce`). Kata kunci `move` hanya mengatur *cara menangkap* (memindahkan kepemilikan ke dalam closure), bukan trait-nya.'),
      code('Tiga jenis closure dan cara menerimanya', `fn ulangi<F: FnMut()>(n: usize, mut f: F) {
    for _ in 0..n {
        f();
    }
}

fn pengali(k: i64) -> impl Fn(i64) -> i64 {
    move |x| x * k                 // move: k disalin ke closure, aman dikembalikan
}

fn pilih_filter(ketat: bool) -> Box<dyn Fn(i64) -> bool> {
    // dua closure berbeda tipe, jadi perlu dyn untuk mengembalikan salah satunya
    if ketat { Box::new(|x: i64| x > 1_000_000) } else { Box::new(|x: i64| x > 0) }
}

fn main() {
    let ambang = 100;
    let di_atas = |x: i64| x > ambang;          // Fn: hanya membaca ambang
    println!("{}", di_atas(150));

    let mut hitung = 0;
    ulangi(3, || hitung += 1);                  // FnMut: mengubah hitung
    println!("{hitung}");                       // 3

    let nama = String::from("kas");
    let ambil = move || nama;                   // FnOnce: nama dipindah keluar saat dipanggil
    let n = ambil();
    // ambil();                                 // error: closure sudah dikonsumsi
    println!("{n}");

    let kali3 = pengali(3);
    let positif = pilih_filter(false);
    println!("{} {}", kali3(7), positif(-1));   // 21 false
}`, 'rust'),
      table(['Trait', 'Bisa dipanggil', 'Contoh pemakaian di std'], [
        ['`FnOnce`', 'Sekali (boleh memindahkan tangkapan keluar)', '`Option::unwrap_or_else`, `thread::spawn`'],
        ['`FnMut`', 'Berkali-kali, boleh mengubah tangkapan', '`Iterator::for_each`, `retain`, `sort_by_key`'],
        ['`Fn`', 'Berkali-kali, hanya membaca', 'Callback bersama, handler yang dipanggil paralel'],
      ]),
      callout('info', 'Hierarki trait closure', 'Setiap `Fn` juga `FnMut`, dan setiap `FnMut` juga `FnOnce`. Saat menulis fungsi yang menerima closure, minta trait **paling longgar** yang cukup (`FnOnce` bila hanya dipanggil sekali, `FnMut` bila berulang) agar pemanggil punya pilihan paling banyak.'),
      heading('Adaptor iterator dan collect'),
      paragraph('Iterator Rust bersifat **lazy**: `map` dan `filter` tidak melakukan apa-apa sampai ada *consumer* seperti `sum`, `collect`, `for`, atau `count`. Ingat juga tiga cara mengambil iterator: `iter()` menghasilkan `&T`, `iter_mut()` menghasilkan `&mut T`, dan `into_iter()` menghasilkan `T` (mengonsumsi koleksi).'),
      code('Adaptor yang sering dibutuhkan', `use std::collections::HashMap;

#[derive(Debug)]
struct Tx {
    kategori: String,
    jumlah: i64,
}

fn main() {
    let txs = vec![
        Tx { kategori: "makan".into(), jumlah: 25_000 },
        Tx { kategori: "transport".into(), jumlah: 150_000 },
        Tx { kategori: "makan".into(), jumlah: 40_000 },
    ];

    // partition: pisah dua kelompok sekaligus
    let (besar, kecil): (Vec<&Tx>, Vec<&Tx>) = txs.iter().partition(|t| t.jumlah >= 100_000);

    // fold: akumulasi ke struktur apa pun
    let per_kategori = txs.iter().fold(HashMap::new(), |mut m, t| {
        *m.entry(t.kategori.as_str()).or_insert(0) += t.jumlah;
        m
    });

    // collect ke String, ke HashMap, dan ke Result (berhenti di error pertama)
    let label: String = txs.iter().map(|t| t.kategori.as_str()).collect::<Vec<_>>().join(", ");
    let indeks: HashMap<usize, &str> = txs.iter().map(|t| t.kategori.as_str()).enumerate().collect();
    let angka: Result<Vec<i64>, _> = ["10", "20", "x"].iter().map(|s| s.parse::<i64>()).collect();

    // windows, zip, any, position
    let saldo = [100, 80, 120, 90];
    let selisih: Vec<i64> = saldo.windows(2).map(|w| w[1] - w[0]).collect();   // [-20, 40, -30]
    let pasangan: Vec<(&str, i64)> = ["a", "b"].into_iter().zip([1, 2]).collect();
    let ada_besar = txs.iter().any(|t| t.jumlah > 1_000_000);
    let pertama_makan = txs.iter().position(|t| t.kategori == "makan");

    // flat_map dan take_while
    let kata: Vec<&str> = ["halo dunia", "rust cepat"].iter().flat_map(|s| s.split(' ')).collect();
    let awal_naik: Vec<i64> = [1, 3, 5, 2, 8].into_iter().take_while(|&x| x < 5).collect();

    println!("{} {} {per_kategori:?} {label} {indeks:?}", besar.len(), kecil.len());
    println!("{angka:?} {selisih:?} {pasangan:?} {ada_besar} {pertama_makan:?} {kata:?} {awal_naik:?}");
}`, 'rust'),
      heading('Iterator buatan sendiri'),
      code('Cukup implementasi next()', `/// Jadwal cicilan: menghasilkan (bulan_ke, jumlah_bayar) sampai utang lunas.
struct Cicilan {
    sisa: u64,
    per_bulan: u64,
    bulan: u32,
}

impl Cicilan {
    fn new(pokok: u64, per_bulan: u64) -> Self {
        assert!(per_bulan > 0, "cicilan per bulan harus > 0");
        Self { sisa: pokok, per_bulan, bulan: 0 }
    }
}

impl Iterator for Cicilan {
    type Item = (u32, u64);

    fn next(&mut self) -> Option<Self::Item> {
        if self.sisa == 0 {
            return None;                       // None = iterator selesai
        }
        let bayar = self.per_bulan.min(self.sisa);
        self.sisa -= bayar;
        self.bulan += 1;
        Some((self.bulan, bayar))
    }
}

fn main() {
    // Semua adaptor otomatis tersedia: take, filter, sum, last, ...
    let total: u64 = Cicilan::new(1_000_000, 300_000).map(|(_, b)| b).sum();
    let terakhir = Cicilan::new(1_000_000, 300_000).last();     // Some((4, 100000))
    println!("{total} {terakhir:?}");

    // Untuk kasus kecil, iter::successors / iter::from_fn tanpa struct baru
    let pangkat_dua: Vec<u32> = std::iter::successors(Some(1u32), |&x| x.checked_mul(2)).take(5).collect();
    println!("{pangkat_dua:?}");                 // [1, 2, 4, 8, 16]
}`, 'rust'),
      callout('tip', 'Zero-cost abstraction', 'Rantai `iter().filter().map().sum()` dikompilasi (mode release) menjadi loop yang setara dengan loop `for` tulisan tangan, sering kali tanpa pengecekan batas indeks karena compiler tahu iterator tidak keluar dari slice. Jadi pilih gaya yang paling mudah dibaca; jangan menulis ulang iterator menjadi indeks manual demi "performa" tanpa mengukur.'),
      ...quiz([
        ['RSL-01', 'Mengapa `thread::spawn` meminta closure `FnOnce + Send + \'static`, dan apa hubungannya dengan `move`?', 'Closure thread hanya dijalankan sekali (FnOnce), dipindah ke thread lain (Send), dan bisa hidup lebih lama dari fungsi pemanggil (\'static), sehingga tidak boleh meminjam variabel lokal. `move` memindahkan kepemilikan variabel yang ditangkap ke dalam closure sehingga syarat \'static terpenuhi.'],
        ['RSL-02', 'Kode `v.iter().map(|x| x * 2);` tanpa consumer tidak mencetak apa pun dan memunculkan warning. Mengapa?', 'Iterator bersifat lazy: map hanya membungkus iterator dan baru menghitung saat `next()` dipanggil oleh consumer seperti collect, sum, atau for. Compiler memberi warning `unused_must_use` karena iterator yang tidak dikonsumsi hampir pasti bug.'],
        ['RSL-03', 'Apa beda `collect::<Vec<Result<i64, _>>>()` dan `collect::<Result<Vec<i64>, _>>()`?', 'Yang pertama menyimpan semua hasil, sukses maupun gagal. Yang kedua berhenti di error pertama dan mengembalikan Err tersebut, atau Ok berisi Vec bila semuanya sukses. Ini bisa karena Result mengimplementasikan FromIterator.'],
      ]),
      ...practice('rsl-closure-iterator', [
        'Tulis fungsi `terapkan<F: Fn(i64) -> i64>(xs: &[i64], f: F) -> Vec<i64>`, lalu ubah bound menjadi FnMut dan tunjukkan closure penghitung yang hanya diterima versi FnMut.',
        'Implementasikan iterator `Fibonacci` yang berhenti sebelum overflow memakai `checked_add`.',
        'Ganti tiga loop `for` di proyek sebelumnya dengan `fold`, `partition`, atau `windows`, dan pastikan hasil tes tidak berubah.',
        'Parse daftar string menjadi `Result<Vec<u32>, _>` dengan satu `collect` dan tampilkan pesan error yang jelas.',
      ]),
      references(
        ['The Book: Closures', 'https://doc.rust-lang.org/book/ch13-01-closures.html'],
        ['The Book: Iterators', 'https://doc.rust-lang.org/book/ch13-02-iterators.html'],
        ['The Book: Performance (loops vs iterators)', 'https://doc.rust-lang.org/book/ch13-04-performance.html'],
        ['std::iter::Iterator', 'https://doc.rust-lang.org/std/iter/trait.Iterator.html'],
      ),
    ],
  },
  {
    ...base,
    id: 'rust-smart-pointer',
    title: 'Rust: Smart Pointer — Box, Rc, RefCell & Weak',
    summary: 'Data di heap dengan Box, banyak pemilik dengan Rc, interior mutability dengan RefCell, memutus siklus dengan Weak, serta trait Deref dan Drop.',
    duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Aturan ownership di [Ownership, Borrowing & Lifetime](#rust.rust-ownership-borrowing) mengasumsikan satu pemilik dan pinjaman yang dicek saat kompilasi. Smart pointer adalah struct yang mengimplementasikan `Deref` dan `Drop` untuk melonggarkan aturan itu secara terkendali: menaruh data di heap, berbagi kepemilikan, atau memindahkan pengecekan pinjaman ke runtime.'),
      code('Box: tipe rekursif dan trait object', `/// Pohon ekspresi: ukuran Expr harus diketahui saat kompilasi,
/// jadi anak rekursif disimpan di heap lewat Box.
enum Expr {
    Angka(i64),
    Tambah(Box<Expr>, Box<Expr>),
    Kali(Box<Expr>, Box<Expr>),
}

fn eval(e: &Expr) -> i64 {
    match e {
        Expr::Angka(n) => *n,
        Expr::Tambah(a, b) => eval(a) + eval(b),   // &Box<Expr> otomatis menjadi &Expr (deref coercion)
        Expr::Kali(a, b) => eval(a) * eval(b),
    }
}

fn main() {
    // (2 + 3) * 4
    let e = Expr::Kali(
        Box::new(Expr::Tambah(Box::new(Expr::Angka(2)), Box::new(Expr::Angka(3)))),
        Box::new(Expr::Angka(4)),
    );
    println!("{}", eval(&e));                      // 20
}`, 'rust'),
      code('Rc + RefCell: banyak pemilik yang bisa mengubah data', `use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug, Default)]
struct Keranjang {
    item: Vec<String>,
}

fn main() {
    let bersama = Rc::new(RefCell::new(Keranjang::default()));

    let ani = Rc::clone(&bersama);                 // menambah hitungan referensi, bukan menyalin data
    let budi = Rc::clone(&bersama);

    ani.borrow_mut().item.push("kopi".into());     // pinjaman mutable dicek saat RUNTIME
    budi.borrow_mut().item.push("roti".into());

    println!("{:?}", bersama.borrow().item);       // ["kopi", "roti"]
    println!("pemilik: {}", Rc::strong_count(&bersama)); // 3

    let baca = bersama.borrow();
    // let tulis = bersama.borrow_mut();           // panic: already borrowed (aturan pinjaman dilanggar)
    // Gunakan try_borrow_mut() bila ingin mendapat Err alih-alih panic.
    drop(baca);
}`, 'rust'),
      code('Weak: memutus reference cycle (pohon dengan pointer ke induk)', `use std::cell::RefCell;
use std::rc::{Rc, Weak};

struct Node {
    nilai: i32,
    induk: RefCell<Weak<Node>>,        // ke atas: Weak, tidak menahan induk tetap hidup
    anak: RefCell<Vec<Rc<Node>>>,      // ke bawah: Rc, induk memiliki anak
}

fn main() {
    let daun = Rc::new(Node { nilai: 3, induk: RefCell::new(Weak::new()), anak: RefCell::new(vec![]) });
    let cabang = Rc::new(Node {
        nilai: 5,
        induk: RefCell::new(Weak::new()),
        anak: RefCell::new(vec![Rc::clone(&daun)]),
    });
    *daun.induk.borrow_mut() = Rc::downgrade(&cabang);

    // upgrade() mengembalikan Option<Rc<Node>>: None bila induk sudah di-drop
    let nilai_induk = daun.induk.borrow().upgrade().map(|n| n.nilai);
    println!("induk daun = {nilai_induk:?}, anak cabang = {}", cabang.anak.borrow().len());
    println!("strong = {}, weak = {}", Rc::strong_count(&cabang), Rc::weak_count(&cabang)); // 1, 1
}`, 'rust'),
      code('Deref dan Drop pada tipe sendiri', `use std::ops::Deref;

/// Newtype yang tetap bisa dipakai seperti &str.
struct Email(String);

impl Deref for Email {
    type Target = str;
    fn deref(&self) -> &str {
        &self.0
    }
}

struct Koneksi {
    nama: String,
}

impl Drop for Koneksi {
    fn drop(&mut self) {                         // dipanggil otomatis saat keluar scope (RAII)
        println!("tutup koneksi {}", self.nama);
    }
}

fn main() {
    let e = Email("ani@contoh.id".into());
    println!("{} {}", e.len(), e.contains('@'));   // method str tersedia lewat Deref

    let _a = Koneksi { nama: "a".into() };
    let b = Koneksi { nama: "b".into() };
    drop(b);                                       // std::mem::drop: tutup lebih awal
    println!("selesai main");
}                                                  // "tutup koneksi a" dicetak di sini`, 'rust'),
      heading('Kapan memakai yang mana'),
      table(['Tipe', 'Pemilik', 'Mutasi', 'Thread', 'Pakai untuk'], [
        ['`Box<T>`', 'Satu', 'Lewat `&mut`, dicek compile time', 'Send bila T Send', 'Tipe rekursif, `Box<dyn Trait>`, memindahkan data besar ke heap'],
        ['`Rc<T>`', 'Banyak', 'Tidak (hanya baca)', 'Tidak', 'Graf/pohon bersama dalam satu thread'],
        ['`RefCell<T>`', 'Satu', 'Ya, dicek runtime (panic bila dilanggar)', 'Tidak', 'Interior mutability: mengubah data di balik `&T`'],
        ['`Cell<T>`', 'Satu', 'Ya, dengan get/set nilai Copy', 'Tidak', 'Penghitung atau flag kecil di balik `&T`'],
        ['`Weak<T>`', 'Bukan pemilik', 'Lewat `upgrade()`', 'Ikut Rc/Arc', 'Referensi balik (child → parent), cache'],
        ['`Arc<T>` + `Mutex`/`RwLock`', 'Banyak', 'Ya, dengan lock', 'Ya', 'Data bersama antar thread (lihat modul konkurensi)'],
      ]),
      callout('warn', 'Rc<RefCell<T>> bukan jalan pintas default', 'Bila setiap struct dibungkus `Rc<RefCell<...>>`, pengecekan pinjaman pindah ke runtime dan bug menjadi panic. Coba dulu desain ulang kepemilikan: simpan data di `Vec` dan rujuk dengan indeks (pola *arena*), kembalikan nilai milik, atau pisahkan data baca dan tulis. Siklus `Rc` yang kuat membuat memori **bocor** (tidak pernah di-drop); pakai `Weak` untuk salah satu arah.'),
      ...quiz([
        ['RSL-04', 'Mengapa `enum List { Cons(i32, List), Nil }` tidak bisa dikompilasi, dan bagaimana Box memperbaikinya?', 'Ukuran List tidak terhingga karena List memuat List secara langsung, sehingga compiler tidak bisa menghitung ukurannya. `Cons(i32, Box<List>)` menyimpan pointer berukuran tetap ke heap, sehingga ukuran enum menjadi pasti.'],
        ['RSL-05', 'Kode dengan RefCell lolos kompilasi tetapi panic "already mutably borrowed". Apa artinya?', 'RefCell menegakkan aturan pinjaman (banyak baca atau satu tulis) saat runtime. Ada `borrow_mut()` yang masih aktif ketika `borrow()` atau `borrow_mut()` lain dipanggil, misalnya guard yang disimpan di variabel terlalu lama. Perkecil umur guard (blok atau drop), atau gunakan `try_borrow_mut` untuk menangani konflik tanpa panic.'],
      ]),
      ...practice('rsl-smart-pointer', [
        'Lengkapi evaluator `Expr` dengan varian `Kurang` dan `Bagi` yang mengembalikan `Result` saat dibagi nol.',
        'Buat siklus `Rc` dua node, cetak `strong_count` untuk membuktikan kebocoran, lalu perbaiki dengan `Weak`.',
        'Implementasikan `Drop` pada guard sederhana yang mencetak durasi blok (pola timer RAII).',
        'Tulis ulang pohon kategori memakai `Vec<Node>` + indeks (arena) tanpa Rc, dan bandingkan kerumitannya.',
      ]),
      references(
        ['The Book: Smart Pointers', 'https://doc.rust-lang.org/book/ch15-00-smart-pointers.html'],
        ['The Book: RefCell & interior mutability', 'https://doc.rust-lang.org/book/ch15-05-interior-mutability.html'],
        ['The Book: Reference cycles', 'https://doc.rust-lang.org/book/ch15-06-reference-cycles.html'],
        ['std::cell', 'https://doc.rust-lang.org/std/cell/index.html'],
        ['std::rc', 'https://doc.rust-lang.org/std/rc/index.html'],
      ),
    ],
  },
  {
    ...base,
    id: 'rust-concurrency',
    title: 'Rust: Konkurensi dengan Thread, Channel & Arc<Mutex>',
    summary: 'std::thread, closure move, channel mpsc, Arc<Mutex<T>> dan RwLock, Send/Sync, scoped thread, rayon, dan kapan memilih async Tokio.',
    duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Rust menjanjikan *fearless concurrency*: data race dicegah saat kompilasi lewat ownership dan dua marker trait, `Send` dan `Sync`. Modul ini memakai thread OS dari `std`. Untuk server I/O dengan ribuan koneksi, model yang dipakai adalah async, dibahas di [REST API dengan Tokio, Axum & SQLx](#rust.rust-axum-tokio).'),
      code('Channel mpsc: banyak producer, satu consumer', `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel::<String>();

    for id in 0..3 {
        let tx = tx.clone();                        // tiap worker punya Sender sendiri
        thread::spawn(move || {
            for i in 0..2 {
                tx.send(format!("worker {id}: item {i}")).unwrap();
            }
        });                                         // Sender di-drop saat thread selesai
    }
    drop(tx);                                       // drop Sender asli, kalau tidak loop di bawah tidak pernah selesai

    for pesan in rx {                               // berhenti saat semua Sender sudah di-drop
        println!("{pesan}");
    }
}`, 'rust'),
      code('Arc<Mutex<T>> dan RwLock: state bersama', `use std::collections::HashMap;
use std::sync::{Arc, Mutex, RwLock};
use std::thread;

fn main() {
    // Mutex: satu thread pada satu waktu
    let saldo = Arc::new(Mutex::new(0_i64));
    let handles: Vec<_> = (0..8)
        .map(|_| {
            let saldo = Arc::clone(&saldo);
            thread::spawn(move || {
                for _ in 0..1_000 {
                    *saldo.lock().unwrap() += 1;    // guard dilepas di akhir pernyataan
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();                          // join mengembalikan Err bila thread panic
    }
    println!("saldo = {}", *saldo.lock().unwrap()); // 8000

    // RwLock: banyak pembaca ATAU satu penulis, cocok untuk data yang jarang berubah
    let kurs = Arc::new(RwLock::new(HashMap::from([("USD", 16_250)])));
    {
        let k = kurs.read().unwrap();
        println!("USD = {}", k["USD"]);
    }                                               // lepas read lock sebelum menulis
    kurs.write().unwrap().insert("SGD", 12_100);
}`, 'rust'),
      code('Scoped thread: meminjam data lokal tanpa Arc', `use std::thread;

fn jumlah_paralel(data: &[u64]) -> u64 {
    let n = thread::available_parallelism().map(|n| n.get()).unwrap_or(4);
    let ukuran = data.len().div_ceil(n).max(1);

    // Semua thread di dalam scope dijamin selesai sebelum scope berakhir,
    // jadi boleh meminjam \`data\` meskipun bukan 'static.
    thread::scope(|s| {
        let handles: Vec<_> = data
            .chunks(ukuran)
            .map(|bagian| s.spawn(move || bagian.iter().sum::<u64>()))
            .collect();                             // collect dulu agar semua thread berjalan bersamaan
        handles.into_iter().map(|h| h.join().unwrap()).sum()
    })
}

fn main() {
    let data: Vec<u64> = (1..=1_000_000).collect();
    println!("{}", jumlah_paralel(&data));          // 500000500000
}`, 'rust'),
      table(['Konsep', 'Arti', 'Contoh'], [
        ['`Send`', 'Kepemilikan aman dipindah ke thread lain', 'Hampir semua tipe; **bukan** `Rc<T>`'],
        ['`Sync`', '`&T` aman dibagi antar thread', '`Mutex<T>`, `AtomicU64`; **bukan** `RefCell<T>`, `Cell<T>`'],
        ['`Arc<T>`', 'Rc versi atomik, boleh lintas thread', 'Berbagi konfigurasi, pool, cache'],
        ['`Mutex<T>` / `RwLock<T>`', 'Mutasi lewat lock; lock *poisoned* bila pemegangnya panic', 'Counter, map bersama'],
        ['Atomic (`AtomicUsize`, dst.)', 'Operasi lock-free untuk angka/flag', 'Statistik request, flag shutdown'],
        ['`thread::scope`', 'Thread yang boleh meminjam data lokal', 'Paralelisasi potongan slice'],
      ]),
      callout('tip', 'rayon untuk paralelisme data', 'Untuk komputasi CPU pada koleksi, crate **rayon** biasanya lebih sederhana daripada thread manual: ganti `iter()` menjadi `par_iter()` (setelah `use rayon::prelude::*;`), dan rayon membagi kerja ke thread pool secara otomatis, misalnya `data.par_iter().map(|x| x * x).sum::<u64>()`.'),
      heading('Thread vs async Tokio'),
      table(['Kebutuhan', 'Pilihan', 'Alasan'], [
        ['Komputasi CPU berat (kompresi, parsing besar, hashing)', 'std::thread / scoped thread / rayon', 'Memakai semua core; tidak ada event loop yang terblok'],
        ['Ribuan koneksi I/O (HTTP, DB, WebSocket)', 'async Tokio', 'Task jauh lebih ringan dari thread OS'],
        ['Kerja blocking di dalam aplikasi async', '`tokio::task::spawn_blocking`', 'Jangan memblok worker thread runtime'],
        ['Lock di dalam kode async yang melewati `.await`', '`tokio::sync::Mutex`', 'Guard std Mutex tidak boleh ditahan melewati await'],
      ]),
      ...quiz([
        ['RSL-06', 'Mengapa `thread::spawn(move || rc.clone())` dengan `Rc` ditolak compiler, padahal dengan `Arc` diterima?', 'Rc memperbarui hitungan referensi tanpa operasi atomik, sehingga dua thread yang meng-clone bersamaan bisa merusak hitungan. Karena itu Rc tidak mengimplementasikan Send. Arc memakai operasi atomik dan Send + Sync (bila T juga), sehingga aman lintas thread.'],
        ['RSL-07', 'Program dengan channel tidak pernah selesai: `for msg in rx` terus menunggu. Penyebab paling umum?', 'Masih ada Sender yang hidup, biasanya Sender asli di thread utama yang hanya di-clone ke worker dan tidak di-drop. Iterasi atas Receiver berakhir hanya ketika semua Sender sudah di-drop. Panggil `drop(tx)` setelah membagikan clone-nya.'],
      ]),
      ...practice('rsl-concurrency', [
        'Buat pipeline tiga tahap (baca → parse → agregasi) yang dihubungkan dengan dua channel, dan pastikan program berhenti sendiri.',
        'Bandingkan waktu penjumlahan 100 juta angka secara serial, dengan `thread::scope`, dan dengan rayon (mode `--release`).',
        'Ganti `Mutex<u64>` pada contoh counter dengan `AtomicU64` dan jelaskan kapan atomic cukup.',
        'Coba kirim `Rc` ke thread lain, baca pesan error `Send`, lalu perbaiki dengan `Arc`.',
      ]),
      references(
        ['The Book: Fearless Concurrency', 'https://doc.rust-lang.org/book/ch16-00-concurrency.html'],
        ['std::thread::scope', 'https://doc.rust-lang.org/std/thread/fn.scope.html'],
        ['std::sync', 'https://doc.rust-lang.org/std/sync/index.html'],
        ['The Rustonomicon: Send and Sync', 'https://doc.rust-lang.org/nomicon/send-and-sync.html'],
      ),
    ],
  },
  {
    ...base,
    id: 'rust-testing-cargo',
    title: 'Rust: Testing, Workspace & Tooling Cargo',
    summary: 'Unit test, integration test, doc test, workspace multi-crate, features, clippy, rustfmt, cargo doc, dan benchmark.',
    duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Cargo bukan hanya build tool: ia juga test runner, dokumentasi, linter (lewat clippy), formatter, dan pengelola workspace. Rust membedakan tiga jenis tes: **unit test** di file yang sama dengan kode (boleh menguji fungsi privat), **integration test** di folder `tests/` (hanya API publik), dan **doc test** di komentar dokumentasi (contoh yang selalu benar).'),
      code('src/lib.rs — unit test dan doc test', `/// Menghitung harga setelah diskon persen.
///
/// # Contoh
///
/// \`\`\`
/// assert_eq!(kas::diskon(100_000, 10), 90_000);
/// \`\`\`
///
/// # Panics
///
/// Panic bila \`persen\` lebih dari 100.
pub fn diskon(harga: u64, persen: u8) -> u64 {
    assert!(persen <= 100, "persen harus 0..=100, dapat {persen}");
    harga - harga * u64::from(persen) / 100
}

pub fn parse_jumlah(s: &str) -> Result<u64, String> {
    s.trim().replace('.', "").parse().map_err(|e| format!("jumlah tidak valid {s:?}: {e}"))
}

#[cfg(test)]                    // hanya dikompilasi saat cargo test
mod tests {
    use super::*;               // akses ke item privat juga

    #[test]
    fn diskon_sepuluh_persen() {
        assert_eq!(diskon(100_000, 10), 90_000);
    }

    #[test]
    #[should_panic(expected = "persen harus")]
    fn diskon_lebih_dari_seratus_panic() {
        diskon(1, 101);
    }

    #[test]
    fn parse_dengan_titik_ribuan() -> Result<(), String> {   // tes boleh mengembalikan Result
        assert_eq!(parse_jumlah(" 1.250.000 ")?, 1_250_000);
        Ok(())
    }

    #[test]
    #[ignore = "lambat, jalankan dengan cargo test -- --ignored"]
    fn uji_beban() {}
}`, 'rust'),
      code('tests/api.rs — integration test', `// Setiap file di tests/ adalah crate terpisah yang memakai library seperti pengguna luar.
use kas::{diskon, parse_jumlah};

#[test]
fn alur_checkout() {
    let harga = parse_jumlah("200.000").expect("input valid");
    assert_eq!(diskon(harga, 25), 150_000);
}

#[test]
fn input_salah_menghasilkan_err() {
    let err = parse_jumlah("dua ratus").unwrap_err();
    assert!(err.contains("tidak valid"), "pesan: {err}");
}`, 'rust'),
      code('Cargo.toml — workspace dan features', `# Cargo.toml di root (virtual workspace)
[workspace]
resolver = "3"
members = ["crates/kas", "crates/kas-cli"]

[workspace.package]
edition = "2024"
version = "0.1.0"

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# crates/kas/Cargo.toml
[package]
name = "kas"
edition.workspace = true
version.workspace = true

[dependencies]
serde = { workspace = true }
serde_json = { workspace = true, optional = true }

[features]
default = []
json = ["dep:serde_json"]   # di kode: #[cfg(feature = "json")]`, 'text'),
      code('Perintah sehari-hari', `cargo test                         # semua tes: unit, integration, doc
cargo test diskon                  # filter berdasarkan nama tes
cargo test -- --nocapture          # tampilkan println! dari tes yang lulus
cargo test -- --ignored            # jalankan tes #[ignore]
cargo test --doc                   # hanya doc test
cargo test -p kas --features json  # satu crate workspace, dengan feature
cargo test --workspace --all-features

cargo fmt --all                    # rustfmt
cargo fmt --all -- --check         # gagal bila belum terformat (untuk CI)
cargo clippy --all-targets --all-features -- -D warnings
cargo doc --no-deps --open         # dokumentasi HTML dari komentar ///

cargo add --dev criterion          # benchmark statistik di stable Rust
cargo bench`, 'bash'),
      table(['Alat', 'Fungsi', 'Tips'], [
        ['`cargo test`', 'Menjalankan tes paralel di banyak thread', 'Tes yang berbagi resource (file, port) perlu nama unik atau `--test-threads=1`'],
        ['`cargo clippy`', 'Ratusan lint idiom dan bug umum', '`-D warnings` di CI; atur level per lint di `[lints.clippy]` Cargo.toml'],
        ['`cargo fmt`', 'Format standar komunitas', 'Konfigurasi di `rustfmt.toml`, sebaiknya minimal'],
        ['`cargo doc`', 'Dokumentasi + doc test', 'Doc test memastikan contoh di README/API tidak basi'],
        ['criterion', 'Benchmark dengan statistik', 'Daftarkan di `[[bench]]` dengan `harness = false`; bungkus input dengan `std::hint::black_box`'],
      ]),
      callout('info', 'Workspace', 'Workspace berbagi satu `Cargo.lock` dan satu folder `target/`, sehingga dependensi dikompilasi sekali. Pola umum backend: crate `domain` (logika murni, mudah dites), crate `infra` (database, HTTP client), dan crate binary `api`/`cli` yang tipis.'),
      ...quiz([
        ['RSL-08', 'Mengapa integration test di `tests/` tidak bisa memanggil fungsi privat, dan apa manfaatnya?', 'Setiap file di tests/ dikompilasi sebagai crate terpisah yang memakai library seperti pengguna eksternal, sehingga hanya item `pub` yang terlihat. Ini memaksa tes memverifikasi API publik dan mendeteksi bila API sulit dipakai dari luar. Fungsi privat diuji lewat unit test di modul `tests` yang sama.'],
        ['RSL-09', 'Apa keuntungan feature `json = ["dep:serde_json"]` dibanding selalu menyertakan serde_json?', 'Dependensi opsional hanya dikompilasi bila feature diaktifkan, sehingga pengguna yang tidak butuh JSON mendapat build lebih cepat dan binary lebih kecil. Sintaks `dep:` juga mencegah Cargo membuat feature implisit bernama sama dengan dependensi.'],
      ]),
      ...practice('rsl-testing-cargo', [
        'Library `kas` punya minimal 5 unit test, 2 integration test, dan 1 doc test; `cargo test` hijau.',
        'Pecah proyek menjadi workspace `kas` (library) dan `kas-cli` (binary) yang berbagi versi serde lewat `workspace.dependencies`.',
        '`cargo clippy --all-targets -- -D warnings` dan `cargo fmt --check` lolos; catat dua lint clippy yang diperbaiki.',
        'Tambahkan benchmark criterion untuk `parse_jumlah` dan bandingkan dua implementasi.',
      ]),
      references(
        ['The Book: Writing automated tests', 'https://doc.rust-lang.org/book/ch11-00-testing.html'],
        ['The Book: Cargo workspaces', 'https://doc.rust-lang.org/book/ch14-03-cargo-workspaces.html'],
        ['The Cargo Book: Features', 'https://doc.rust-lang.org/cargo/reference/features.html'],
        ['The Cargo Book: Workspaces', 'https://doc.rust-lang.org/cargo/reference/workspaces.html'],
        ['rustdoc: Documentation tests', 'https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html'],
        ['Clippy', 'https://doc.rust-lang.org/clippy/'],
      ),
    ],
  },
  {
    ...base,
    id: 'rust-macro-lifetime-lanjutan',
    title: 'Rust: Macro & Lifetime Lanjutan',
    summary: 'macro_rules! untuk menghapus boilerplate, gambaran derive & procedural macro, aturan elision, \'static, lifetime di struct/impl, dan pola umum menghadapi borrow checker.',
    duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Macro menulis kode untuk Anda saat kompilasi: `println!`, `vec!`, dan `#[derive(Serialize)]` semuanya macro. Bagian kedua modul ini melanjutkan lifetime dari [Ownership, Borrowing & Lifetime](#rust.rust-ownership-borrowing): kapan anotasi bisa dihilangkan, arti sebenarnya `\'static`, dan cara keluar dari error borrow checker yang paling sering muncul.'),
      heading('Declarative macro: macro_rules!'),
      code('Pencocokan pola dan pengulangan', `use std::collections::HashMap;

// $( ... ),* = ulangi pola dipisah koma; $(,)? = koma terakhir opsional
macro_rules! peta {
    ($($k:expr => $v:expr),* $(,)?) => {{
        let mut m = HashMap::new();
        $( m.insert($k, $v); )*
        m
    }};
}

// Membuat newtype ID beserta impl Display tanpa menyalin kode berulang
macro_rules! newtype_id {
    ($($nama:ident),+ $(,)?) => {
        $(
            #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
            pub struct $nama(pub u64);

            impl std::fmt::Display for $nama {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    write!(f, "{}#{}", stringify!($nama), self.0)
                }
            }
        )+
    };
}

newtype_id!(UserId, OrderId);

fn main() {
    let stok = peta! { "kopi" => 10, "roti" => 4, };
    let u = UserId(7);
    let o = OrderId(7);
    // u == o;  // error: tipe berbeda, ID tidak bisa tertukar
    println!("{stok:?} {u} {o}");   // ... UserId#7 OrderId#7
}`, 'rust'),
      table(['Fragment', 'Mencocokkan'], [
        ['`$x:expr`', 'Ekspresi: `1 + 2`, `f(x)`'],
        ['`$x:ident`', 'Nama: variabel, fungsi, tipe'],
        ['`$x:ty`', 'Tipe: `Vec<u8>`, `&str`'],
        ['`$x:tt`', 'Satu token tree; paling fleksibel'],
        ['`$x:literal`', 'Literal: `"teks"`, `42`'],
        ['`$( ... ),*` / `$( ... );+`', 'Pengulangan 0+ / 1+ dengan pemisah'],
      ]),
      heading('Derive & procedural macro'),
      paragraph('Procedural macro adalah program Rust (crate khusus `proc-macro = true`) yang menerima token dan mengembalikan token baru. Ada tiga jenis: **derive** (`#[derive(Serialize)]`), **attribute** (`#[tokio::main]`, `#[test]`), dan **function-like** (`sqlx::query!(...)`). Kebanyakan developer hanya *memakai*-nya; menulisnya sendiri biasanya dengan crate `syn` dan `quote`.'),
      code('serde derive: kode serialisasi dibuat otomatis', `// Cargo.toml: serde = { version = "1", features = ["derive"] }, serde_json = "1"
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]          // id_pesanan <-> "idPesanan" di JSON
struct Pesanan {
    id_pesanan: u64,
    total_bayar: u64,
    #[serde(default)]                       // boleh tidak ada di JSON -> None
    catatan: Option<String>,
    #[serde(skip_serializing)]              // tidak pernah dikirim ke klien
    token_internal: String,
}

fn main() -> Result<(), serde_json::Error> {
    let p: Pesanan = serde_json::from_str(r#"{"idPesanan": 1, "totalBayar": 50000, "tokenInternal": "x"}"#)?;
    println!("{p:?}");
    println!("{}", serde_json::to_string(&p)?);   // {"idPesanan":1,"totalBayar":50000,"catatan":null}
    Ok(())
}`, 'rust'),
      heading('Lifetime lanjutan'),
      table(['Aturan elision', 'Contoh signature', 'Hasil yang disimpulkan compiler'], [
        ['1. Tiap parameter referensi mendapat lifetime sendiri', '`fn f(a: &str, b: &str)`', '`fn f<\'a, \'b>(a: &\'a str, b: &\'b str)`'],
        ['2. Bila hanya ada satu lifetime input, output memakainya', '`fn pertama(s: &str) -> &str`', '`fn pertama<\'a>(s: &\'a str) -> &\'a str`'],
        ['3. Bila ada `&self`/`&mut self`, output memakai lifetime self', '`fn nama(&self, x: &str) -> &str`', 'Output terikat ke `self`, bukan ke `x`'],
        ['Tidak ada yang cocok', '`fn pilih(a: &str, b: &str) -> &str`', 'Error: anotasi wajib ditulis'],
      ]),
      code('Lifetime di struct dan impl: hasil terikat ke data, bukan ke parser', `/// Parser zero-copy: menghasilkan potongan &str dari input tanpa alokasi.
struct Parser<'a> {
    input: &'a str,
    pos: usize,
}

impl<'a> Parser<'a> {
    fn new(input: &'a str) -> Self {
        Self { input, pos: 0 }
    }

    // Output ditulis &'a str, BUKAN &str. Dengan elision (aturan 3) hasil akan terikat
    // ke &mut self, sehingga kata pertama mengunci parser dan panggilan kedua ditolak.
    fn kata_berikut(&mut self) -> Option<&'a str> {
        let input = self.input;                     // salin &'a str keluar dari self
        let sisa = input[self.pos..].trim_start();
        if sisa.is_empty() {
            return None;
        }
        let mulai = input.len() - sisa.len();
        let akhir = sisa.find(char::is_whitespace).map_or(input.len(), |i| mulai + i);
        self.pos = akhir;
        Some(&input[mulai..akhir])
    }
}

fn main() {
    let teks = String::from("bayar listrik  oktober");
    let mut p = Parser::new(&teks);
    let a = p.kata_berikut();
    let b = p.kata_berikut();                       // boleh: a hanya meminjam teks, bukan p
    println!("{a:?} {b:?} {:?}", p.kata_berikut()); // Some("bayar") Some("listrik") Some("oktober")
}`, 'rust'),
      code('Pola umum menghadapi borrow checker', `use std::collections::HashMap;

struct Laporan {
    item: Vec<i64>,
    log: Vec<String>,
}

impl Laporan {
    fn catat(&mut self, pesan: String) {
        self.log.push(pesan);
    }

    fn proses(&mut self) {
        // ERROR: self.catat() meminjam SELURUH self (mutable) saat self.item sedang dipinjam
        // for x in &self.item { self.catat(format!("{x}")); }

        // OK: akses field secara langsung; compiler tahu item dan log field berbeda
        for x in &self.item {
            self.log.push(format!("{x}"));
        }
        // OK juga: kumpulkan dulu, lalu ubah
        let pesan: Vec<String> = self.item.iter().map(|x| format!("{x}")).collect();
        for p in pesan {
            self.catat(p);
        }
    }
}

// Cek-lalu-sisip pada HashMap: pakai entry API, bukan get lalu insert
fn tambah_stok(stok: &mut HashMap<String, u32>, barang: &str, n: u32) {
    *stok.entry(barang.to_string()).or_insert(0) += n;
}

// Dua &mut ke bagian slice yang berbeda: split_at_mut
fn tukar_ujung(v: &mut [i32]) {
    let tengah = v.len() / 2;
    let (kiri, kanan) = v.split_at_mut(tengah);
    if let (Some(a), Some(b)) = (kiri.first_mut(), kanan.last_mut()) {
        std::mem::swap(a, b);
    }
}

// Menghapus sambil iterasi: retain, bukan remove di dalam for
fn buang_negatif(v: &mut Vec<i64>) {
    v.retain(|&x| x >= 0);
}`, 'rust'),
      table(['Bentuk', 'Arti sebenarnya'], [
        ['`&\'static str`', 'Referensi ke data yang hidup sepanjang program, misalnya literal string di binary'],
        ['`T: \'static`', 'T **tidak memuat referensi pendek**. `String`, `Vec<u8>`, `Arc<T>` memenuhinya walau bisa di-drop kapan saja'],
        ['`Box::leak`', 'Membuat `&\'static mut T` dengan sengaja membocorkan memori; hanya untuk data global yang dibuat sekali'],
      ]),
      callout('info', 'Rust 2024: impl Trait di posisi return', 'Di edition 2024, `fn f(x: &str) -> impl Iterator<Item = char>` otomatis **menangkap semua lifetime** parameter, sehingga iterator boleh meminjam `x`. Bila ingin membatasi apa yang ditangkap, gunakan sintaks *precise capturing* `impl Iterator<Item = char> + use<>`.'),
      ...quiz([
        ['RSL-10', 'Pada Parser di atas, apa yang terjadi bila `kata_berikut` ditulis `-> Option<&str>` tanpa `\'a`?', 'Aturan elision ketiga mengikat output ke lifetime `&mut self`. Akibatnya `a` dianggap masih meminjam parser secara mutable, sehingga panggilan `p.kata_berikut()` kedua ditolak selama `a` masih dipakai. Menulis `&\'a str` menyatakan hasil meminjam teks asli, bukan parser.'],
        ['RSL-11', 'Mengapa `thread::spawn` meminta `\'static` padahal kita bisa mengirim `String` yang jelas akan di-drop?', 'Bound `T: \'static` berarti tipe tidak mengandung referensi yang bisa kedaluwarsa, bukan berarti nilai hidup selamanya. String dimiliki penuh oleh closure, jadi memenuhi \'static. Yang ditolak adalah `&String` milik fungsi pemanggil, karena thread bisa hidup lebih lama dari fungsi itu.'],
        ['RSL-12', 'Kapan sebaiknya memilih macro_rules! dibanding fungsi generic?', 'Gunakan fungsi atau generic bila bisa: lebih mudah dibaca, error lebih jelas, dan didukung IDE. Pilih macro bila butuh hal yang tidak bisa dilakukan fungsi: jumlah argumen variabel, membuat item baru (struct/impl), menerima sintaks khusus, atau memakai `stringify!` atas nama identifier.'],
      ]),
      ...practice('rsl-macro-lifetime', [
        'Tulis `macro_rules! assert_approx` yang membandingkan dua f64 dengan toleransi dan pesan error berisi kedua nilai.',
        'Buat struct DTO dengan `#[serde(rename_all, default, skip_serializing_if)]` dan uji round-trip JSON di unit test.',
        'Perluas Parser zero-copy agar bisa mengembalikan angka (`Option<u64>`) dan pastikan tidak ada `String` yang dialokasikan.',
        'Kumpulkan tiga error borrow checker dari proyek sendiri dan catat pola mana (split field, entry, split_at_mut, retain, kembalikan nilai milik) yang menyelesaikannya.',
      ]),
      references(
        ['The Book: Macros', 'https://doc.rust-lang.org/book/ch20-05-macros.html'],
        ['Rust by Example: macro_rules!', 'https://doc.rust-lang.org/rust-by-example/macros.html'],
        ['The Rust Reference: Macros by example', 'https://doc.rust-lang.org/reference/macros-by-example.html'],
        ['The Rust Reference: Lifetime elision', 'https://doc.rust-lang.org/reference/lifetime-elision.html'],
        ['Edition Guide: RPIT lifetime capture rules', 'https://doc.rust-lang.org/edition-guide/rust-2024/rpit-lifetime-capture.html'],
      ),
    ],
  },
];
