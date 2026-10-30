import type { Block, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const JS_BASIC = 'JavaScript Dasar';
const TS_BASIC = 'TypeScript Dasar';

export const jsCoreTracks: Track[] = [
  { title: JS_BASIC, summary: 'Variabel & tipe, fungsi & closure, objek & class, array & koleksi, async/await, modul, npm, dan DOM.' },
  { title: TS_BASIC, summary: 'Setup tsc & tsconfig strict, tipe dasar, union & narrowing, fungsi & generic, utility types, dan migrasi dari JS.' },
];

export const jsCoreSource = 'JavaScript & TypeScript Dasar: materi tambahan dari MDN dan TypeScript Handbook (30 Oktober 2026)';

const orderedList = (items: string[]): Block => ({ type: 'list', ordered: true, items });

/** Ditaruh sebelum React: fondasi bahasa yang diasumsikan oleh track React, Node.js, dan TypeScript Lanjutan. */
export const jsCoreModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── JavaScript Dasar ─────────────────────────────
  {
    id: 'js-variabel-tipe',
    title: 'JavaScript: Variabel, Tipe Data & Operator',
    summary: 'let vs const, tujuh tipe primitif, coercion, == vs ===, nilai falsy, ?? vs ||, dan template literal.',
    track: JS_BASIC, source: jsCoreSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('JavaScript bertipe **dinamis**: variabel tidak punya tipe, nilainya yang punya. Fleksibilitas ini nyaman, tetapi juga sumber bug klasik: penjumlahan yang menjadi penggabungan string, perbandingan `==` yang "terlalu ramah", dan angka desimal yang tidak presisi. Pelajaran ini membangun kebiasaan aman sejak awal: `const` secara default, `===` selalu, dan `??` untuk nilai bawaan.'),
      code('let, const, dan tipe primitif', `const nama = 'Sari';               // string — variabel const tidak bisa di-assign ulang
let saldo = 150_000;               // number (floating point 64-bit); _ hanya pemisah ribuan
saldo += 25_000;                   // let boleh di-assign ulang

const aktif = true;                // boolean
let catatan;                       // undefined: dideklarasikan tanpa nilai
const kosong = null;               // null: "sengaja dikosongkan"
const idBesar = 9007199254740993n; // bigint: bilangan bulat di atas 2^53 tanpa kehilangan presisi
const kunci = Symbol('id');        // symbol: kunci properti yang dijamin unik

console.log(typeof nama, typeof saldo, typeof aktif); // string number boolean
console.log(typeof catatan, typeof kosong);           // undefined object  (bug historis, null bukan objek)
console.log(typeof idBesar, typeof kunci);            // bigint symbol

const user = { nama };
user.nama = 'Budi';                // boleh: const mengunci variabel, bukan isi objek
// user = {};                      // TypeError: Assignment to constant variable.`, 'js'),
      table(['Tipe', 'Contoh', 'Catatan'], [
        ['string', "`'teks'`, `\"teks\"`, template literal", 'Immutable; method seperti `toUpperCase()` mengembalikan string baru'],
        ['number', '`42`, `3.14`, `NaN`, `Infinity`', 'Satu tipe untuk integer & desimal; aman sampai `Number.MAX_SAFE_INTEGER`'],
        ['bigint', '`10n`', 'Tidak bisa dicampur langsung dengan number (`1n + 1` error)'],
        ['boolean', '`true`, `false`', ''],
        ['undefined', '`undefined`', 'Nilai bawaan variabel/properti yang belum diisi'],
        ['null', '`null`', 'Kosong yang disengaja'],
        ['symbol', "`Symbol('id')`", 'Kunci unik, jarang dipakai di kode aplikasi'],
        ['object', '`{}`, `[]`, fungsi, `Date`, `Map`', 'Semua yang bukan primitif; disalin **sebagai referensi**'],
      ]),
      code('Coercion, perbandingan, dan nilai bawaan', `console.log('5' + 1);           // '51' — + dengan string = penggabungan
console.log('5' - 1);           // 4    — - memaksa string menjadi number
console.log(0.1 + 0.2);         // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false — simpan uang sebagai integer (rupiah/sen), bukan desimal

console.log(0 == '');           // true  — == melakukan coercion sebelum membandingkan
console.log(null == undefined); // true
console.log(0 === '');          // false — === membandingkan tipe DAN nilai
console.log(NaN === NaN);      // false — gunakan Number.isNaN(x)
console.log(Object.is(NaN, NaN)); // true

// Nilai falsy: false, 0, -0, 0n, '', null, undefined, NaN. Selain itu truthy (termasuk [] dan {}).
const diskon = 0;
console.log(diskon || 10);      // 10 — 0 dianggap falsy, nilai sah ikut tertimpa!
console.log(diskon ?? 10);      // 0  — ?? hanya mengganti null/undefined

console.log(Number('12.5abc'));          // NaN — konversi ketat
console.log(Number.parseFloat('12.5abc')); // 12.5 — membaca sampai karakter tidak valid
console.log(String(42), Boolean(''), Number(''));  // '42' false 0`, 'js'),
      code('Template literal', `const item = 'Kopi';
const qty = 3;
const hargaSatuan = 18_000;
const total = qty * hargaSatuan;
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

// Interpolasi ekspresi apa pun dengan \${...}
console.log(\`\${qty} x \${item} = \${rupiah.format(total)}\`); // 3 x Kopi = Rp 54.000

// Multi-baris tanpa \\n
const html = \`
<li class="\${total > 50_000 ? 'mahal' : 'murah'}">
  \${item.toUpperCase()}
</li>\`;
console.log(html.trim());`, 'js'),
      callout('warn', 'Aturan praktis', 'Pakai `const` secara default, `let` hanya bila nilainya memang berubah, dan jangan pakai `var`. Selalu `===`/`!==`; satu-satunya pengecualian yang lazim adalah `x == null` untuk mengecek `null` **atau** `undefined` sekaligus. Untuk nilai bawaan pakai `??`, bukan `||`, agar `0` dan `\'\'` tidak ikut tertimpa.'),
      ...quiz([
        ['JSD-01', 'Mengapa `const daftar = []; daftar.push(1);` tidak error?', '`const` hanya mencegah variabel diarahkan ke nilai lain (`daftar = [...]`). Isi array/objek yang ditunjuk tetap bisa diubah. Untuk membekukan isi, pakai `Object.freeze` (dangkal) atau perlakukan data sebagai immutable dengan membuat salinan baru.'],
        ['JSD-02', 'Form diskon memakai `const persen = input || 10`. Pengguna mengisi 0, tetapi hasilnya 10. Apa yang salah dan bagaimana memperbaikinya?', '`||` mengganti semua nilai falsy, termasuk `0`. Ganti dengan `input ?? 10`, yang hanya mengganti `null` atau `undefined`. Pastikan juga input sudah dikonversi dengan `Number(...)` karena nilai dari form selalu string.'],
        ['JSD-03', 'Mengapa `0.1 + 0.2 === 0.3` bernilai false, dan bagaimana menyimpan nominal uang?', 'number adalah floating point biner (IEEE 754), sehingga 0.1 dan 0.2 tidak bisa direpresentasikan persis. Simpan uang dalam satuan terkecil sebagai integer (mis. rupiah utuh atau sen), lalu format saat ditampilkan dengan `Intl.NumberFormat`.'],
      ]),
      ...practice('jsd-variabel-tipe', [
        'Jalankan semua contoh di konsol browser atau `node` dan cocokkan hasilnya dengan komentar.',
        'Tulis tabel kecil hasil `==` dan `===` untuk pasangan: `0` vs `\'\'`, `null` vs `undefined`, `\'1\'` vs `1`, `NaN` vs `NaN`.',
        'Buat fungsi `formatRupiah(angka)` dengan template literal dan `Intl.NumberFormat` yang mengembalikan string seperti `Rp 54.000`.',
        'Ganti semua `||` untuk nilai bawaan di satu file kode lama Anda dengan `??` bila nilai 0 atau string kosong sah.',
      ]),
      references(
        ['MDN: Grammar and types', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types'],
        ['MDN: Equality comparisons and sameness', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness'],
        ['MDN: Nullish coalescing operator (??)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'],
        ['MDN: Template literals', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals'],
      ),
    ],
  },
  {
    id: 'js-fungsi-closure',
    title: 'JavaScript: Fungsi, Scope & Closure',
    summary: 'Deklarasi vs ekspresi vs arrow function, block scope, hoisting & TDZ, closure, parameter default, rest, dan spread.',
    track: JS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Di JavaScript, fungsi adalah **nilai**: bisa disimpan di variabel, dikirim sebagai argumen (callback), dan dikembalikan dari fungsi lain. Ditambah aturan scope leksikal, ini melahirkan **closure**: fungsi yang "mengingat" variabel di sekitar tempat ia dibuat. Closure adalah dasar dari event handler, debounce, React hooks, dan middleware Express.'),
      code('Tiga cara menulis fungsi, default, rest, dan spread', `// Deklarasi fungsi: di-hoist utuh, bisa dipanggil sebelum baris definisinya
console.log(luas(3, 4)); // 12
function luas(p, l) {
  return p * l;
}

// Ekspresi fungsi & arrow function: ikut aturan const (belum bisa dipakai sebelum baris ini)
const keliling = function (p, l) {
  return 2 * (p + l);
};
const kuadrat = (x) => x * x;            // satu ekspresi: return implisit
const buatUser = (nama) => ({ nama });   // mengembalikan objek: bungkus dengan ()
console.log(keliling(3, 4), kuadrat(5), buatUser('Sari'));

// Parameter default, rest, dan spread
function sapa(nama = 'tamu', salam = 'Halo') {
  return \`\${salam}, \${nama}!\`;
}
function jumlah(...angka) {               // rest: sisa argumen dikumpulkan jadi array
  return angka.reduce((a, b) => a + b, 0);
}
const nilai = [4, 8, 15];
console.log(sapa());                      // Halo, tamu!
console.log(sapa(undefined, 'Hai'));      // Hai, tamu! — default dipakai saat argumen undefined
console.log(jumlah(...nilai, 16));        // spread array jadi argumen: 43
console.log(Math.max(...nilai));          // 15`, 'js'),
      code('Scope, hoisting, dan TDZ', `console.log(typeof a);  // 'undefined' — var di-hoist dengan nilai awal undefined
var a = 1;

// console.log(b);      // ReferenceError: Cannot access 'b' before initialization (TDZ)
let b = 2;              // let/const di-hoist tetapi belum diinisialisasi sampai baris ini

if (b > 0) {
  var bocor = 'var hanya mengenal function scope';
  const aman = 'const/let hidup di dalam blok { } saja';
  console.log(aman);
}
console.log(bocor);     // terbaca di luar blok
// console.log(aman);   // ReferenceError: aman is not defined

// Bug klasik: var di loop + callback asinkron
for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i)); // var 3, var 3, var 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j)); // let 0, let 1, let 2
// let membuat binding baru di setiap iterasi; var hanya punya satu i untuk seluruh loop`, 'js'),
      code('Closure: state privat, factory, dan debounce', `function buatPenghitung(awal = 0) {
  let hitung = awal;                    // hanya terlihat oleh fungsi di dalam
  return {
    tambah: () => ++hitung,
    reset: () => { hitung = awal; },
    nilai: () => hitung,
  };
}

const klik = buatPenghitung();
klik.tambah();
klik.tambah();
console.log(klik.nilai());   // 2
console.log(klik.hitung);    // undefined — state tidak bisa diakses langsung
const lain = buatPenghitung(10);
console.log(lain.nilai());   // 10 — tiap pemanggilan punya closure sendiri

// Fungsi yang mengembalikan fungsi (partial application)
const formatter = (kode) => {
  const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: kode });
  return (angka) => fmt.format(angka);   // fmt dibuat sekali, diingat oleh closure
};
const idr = formatter('IDR');
console.log(idr(25_000));

// Debounce: closure menyimpan timer di antara pemanggilan
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
const cari = debounce((q) => console.log('cari', q), 300);
cari('ko');
cari('kop');
cari('kopi');                // hanya "cari kopi" yang dijalankan`, 'js'),
      table(['Aspek', 'Deklarasi `function f() {}`', 'Ekspresi `const f = function () {}`', 'Arrow `const f = () => {}`'], [
        ['Hoisting', 'Ya, bisa dipanggil sebelum definisi', 'Tidak (TDZ)', 'Tidak (TDZ)'],
        ['`this`', 'Ditentukan cara pemanggilan', 'Ditentukan cara pemanggilan', 'Diwarisi dari scope luar (leksikal)'],
        ['`arguments`', 'Ada', 'Ada', 'Tidak ada; pakai `...rest`'],
        ['Bisa `new`', 'Ya', 'Ya', 'Tidak'],
        ['Cocok untuk', 'Fungsi utama di level modul', 'Jarang dibutuhkan', 'Callback, fungsi kecil, handler di dalam method'],
      ]),
      callout('tip', 'Fungsi murni lebih mudah diuji', 'Usahakan fungsi menerima semua yang dibutuhkan lewat parameter dan mengembalikan hasil tanpa mengubah variabel di luar (tanpa *side effect*). Fungsi seperti ini mudah diuji, aman dipakai ulang, dan menjadi fondasi pola React (`useMemo`, reducer).'),
      ...quiz([
        ['JSD-04', 'Mengapa `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` mencetak 3, 3, 3?', '`var` hanya punya satu binding `i` untuk seluruh loop (function scope). Callback dijalankan setelah loop selesai, saat `i` sudah 3, dan ketiganya membaca variabel yang sama. Dengan `let`, setiap iterasi mendapat binding baru sehingga closure tiap callback menangkap nilai 0, 1, 2.'],
        ['JSD-05', 'Apa itu closure dan sebutkan satu kegunaannya.', 'Closure adalah fungsi beserta referensi ke variabel di scope tempat ia dibuat; variabel itu tetap hidup selama fungsi masih bisa dipanggil. Kegunaan: state privat (penghitung), factory/konfigurasi (`formatter(\'IDR\')`), debounce/throttle, serta event handler yang membaca data dari luar.'],
        ['JSD-06', 'Kapan arrow function **tidak** cocok?', 'Sebagai method objek yang perlu `this` milik objek itu (arrow mewarisi `this` dari luar), sebagai constructor (tidak bisa `new`), dan bila butuh `arguments`. Untuk callback di dalam method, arrow justru tepat karena mempertahankan `this` method.'],
      ]),
      ...practice('jsd-fungsi-closure', [
        'Tulis ulang tiga fungsi dari kode lama Anda menjadi arrow function bila cocok, dan jelaskan mengapa sisanya tetap deklarasi.',
        'Buat `buatPenghitung` dengan method `kurang` dan batas minimum 0; pastikan dua instance tidak saling memengaruhi.',
        'Implementasikan `throttle(fn, ms)` (paling banyak satu kali per `ms`) dan uji dengan event `scroll` atau loop `setInterval`.',
        'Buat fungsi `gabungTag(...tags)` yang membuang duplikat dan string kosong, lalu panggil dengan spread dari dua array.',
      ]),
      references(
        ['MDN: Functions', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions'],
        ['MDN: Closures', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures'],
        ['MDN: Arrow function expressions', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'],
        ['MDN: Hoisting', 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting'],
      ),
    ],
  },
  {
    id: 'js-objek-prototype-class',
    title: 'JavaScript: Objek, this, Prototype & Class',
    summary: 'Object literal, destructuring, optional chaining, aturan this, prototype chain, class, getter, dan private #field.',
    track: JS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Hampir semua data di JavaScript berbentuk objek: respons API, props React, konfigurasi. Pelajaran ini membahas cara membuat dan membongkar objek dengan ringkas, lalu dua konsep yang sering membingungkan: nilai `this` yang bergantung pada **cara fungsi dipanggil**, dan pewarisan lewat **prototype** yang menjadi dasar sintaks `class`.'),
      code('Object literal, destructuring, dan optional chaining', `const kategori = 'makanan';
const transaksi = {
  id: 1,
  jumlah: 54_000,
  [kategori]: true,                          // computed key → makanan: true
  meta: { toko: 'Warung Sari', kota: 'Bandung' },
  ringkas() {                                // method shorthand
    return \`#\${this.id}: \${this.jumlah}\`;
  },
};

// Destructuring: ambil properti, ganti nama, beri default, dan bongkar objek bersarang
const { id, jumlah: nominal, catatan = '-', meta: { kota } } = transaksi;
console.log(id, nominal, catatan, kota);       // 1 54000 - Bandung

// Optional chaining (?.) berhenti dengan undefined alih-alih TypeError
console.log(transaksi.pembeli?.nama ?? 'anonim'); // anonim
console.log(transaksi.ringkas?.());               // #1: 54000

// Spread: salinan dangkal + override, objek asli tidak berubah
const diubah = { ...transaksi, jumlah: 60_000 };
console.log(transaksi.jumlah, diubah.jumlah);     // 54000 60000
console.log(Object.keys(transaksi.meta), Object.entries(transaksi.meta));

// Destructuring di parameter: urutan argumen tidak penting, default per properti
function tampil({ id, jumlah = 0, mataUang = 'IDR' }) {
  return \`\${id}: \${jumlah} \${mataUang}\`;
}
console.log(tampil({ jumlah: 5_000, id: 9 }));    // 9: 5000 IDR`, 'js'),
      code('Aturan this', `const dompet = {
  pemilik: 'Sari',
  saldo: 100,
  info() {
    return \`\${this.pemilik}: \${this.saldo}\`;
  },
  tundaInfo() {
    // Arrow function tidak punya this sendiri → memakai this milik tundaInfo (dompet)
    setTimeout(() => console.log('arrow:', this.info()), 10);
    // Fungsi biasa sebagai callback kehilangan this:
    // setTimeout(function () { this.info(); }, 10); // TypeError
  },
};

console.log(dompet.info());        // Sari: 100 — this = objek di kiri titik

const lepas = dompet.info;         // method dilepas dari objeknya
// lepas();                        // TypeError di ES module/strict mode: this undefined
const terikat = dompet.info.bind(dompet);
console.log(terikat());            // Sari: 100

dompet.tundaInfo();                // arrow: Sari: 100`, 'js'),
      table(['Cara pemanggilan', 'Nilai `this`'], [
        ['`obj.method()`', '`obj`'],
        ['`fn()` biasa (ES module / strict mode)', '`undefined`'],
        ['`fn.call(x)`, `fn.apply(x)`, `fn.bind(x)()`', '`x`'],
        ['`new Kelas()`', 'Objek baru yang sedang dibuat'],
        ['Arrow function', 'Tidak punya sendiri: memakai `this` scope luar'],
        ['Event listener fungsi biasa', 'Elemen yang dipasangi listener (`event.currentTarget`)'],
      ]),
      code('Prototype chain dan class', `// Prototype chain: properti yang tidak ditemukan dicari ke prototype-nya
const dasar = { sapa() { return \`Halo, \${this.nama}\`; } };
const anak = Object.create(dasar);
anak.nama = 'Budi';
console.log(anak.sapa());                            // Halo, Budi
console.log(Object.getPrototypeOf(anak) === dasar);  // true
console.log(Object.hasOwn(anak, 'sapa'));            // false — diwarisi, bukan milik sendiri

// class = sintaks yang lebih rapi di atas prototype yang sama
class Akun {
  #saldo = 0;                      // private field: hanya bisa diakses di dalam class
  static jumlahAkun = 0;           // milik class, bukan instance

  constructor(pemilik) {
    this.pemilik = pemilik;
    Akun.jumlahAkun++;
  }

  setor(nominal) {
    if (nominal <= 0) throw new RangeError('Nominal harus positif');
    this.#saldo += nominal;
    return this;                   // memungkinkan chaining
  }

  get saldo() {                    // getter: dibaca seperti properti, tanpa ()
    return this.#saldo;
  }
}

class AkunTabungan extends Akun {
  constructor(pemilik, bunga) {
    super(pemilik);                // wajib dipanggil sebelum memakai this
    this.bunga = bunga;
  }

  tambahBunga() {
    return this.setor(this.saldo * this.bunga);
  }
}

const tab = new AkunTabungan('Sari', 0.01).setor(1_000_000);
tab.tambahBunga();
console.log(tab.saldo);                     // 1010000
console.log(tab instanceof Akun);           // true
console.log(Akun.jumlahAkun);               // 1
console.log(typeof AkunTabungan);           // 'function' — class tetap fungsi constructor
console.log(Object.getPrototypeOf(AkunTabungan.prototype) === Akun.prototype); // true
// tab.#saldo;                              // SyntaxError: private field di luar class`, 'js'),
      callout('warn', 'Method kehilangan this saat dijadikan callback', '`tombol.addEventListener(\'click\', akun.setor)` atau `[1, 2].forEach(akun.setor)` memanggil method tanpa objek di kiri titik, sehingga `this` bukan `akun`. Bungkus dengan arrow: `(n) => akun.setor(n)`, atau ikat dengan `akun.setor.bind(akun)`.'),
      ...quiz([
        ['JSD-07', 'Kode `const { nama, alamat: { kota } } = user;` error saat `user.alamat` tidak ada. Mengapa dan bagaimana memperbaikinya?', 'Destructuring bersarang mencoba membaca `kota` dari `undefined`, sehingga TypeError. Beri default untuk objek luarnya: `const { nama, alamat: { kota } = {} } = user;`, atau baca dengan optional chaining: `const kota = user.alamat?.kota;`.'],
        ['JSD-08', 'Apa beda `#saldo` dengan konvensi `_saldo`?', '`_saldo` hanya kesepakatan nama; tetap bisa dibaca dan diubah dari luar. `#saldo` adalah private field yang ditegakkan oleh bahasa: akses dari luar class adalah SyntaxError, dan field tidak muncul di `Object.keys` maupun `JSON.stringify`.'],
      ]),
      ...practice('jsd-objek-class', [
        'Bongkar respons JSON contoh (user dengan alamat bersarang) memakai destructuring dengan default, tanpa satu pun akses `a.b.c` manual.',
        'Buat class `Keranjang` dengan private field `#items`, method `tambah`, `hapus`, getter `total`, dan pastikan `#items` tidak bisa diubah dari luar.',
        'Buat subclass `KeranjangMember extends Keranjang` yang meng-override getter `total` dengan diskon 10% memakai `super.total`.',
        'Reproduksi bug `this` hilang dengan `setTimeout(obj.method, 0)`, lalu perbaiki dengan dua cara (arrow dan `bind`).',
      ]),
      references(
        ['MDN: Working with objects', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects'],
        ['MDN: Destructuring', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring'],
        ['MDN: this', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'],
        ['MDN: Inheritance and the prototype chain', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'],
        ['MDN: Classes', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'],
      ),
    ],
  },
  {
    id: 'js-array-iterasi',
    title: 'JavaScript: Array, Iterasi & Koleksi',
    summary: 'map/filter/reduce/find, for...of, Map & Set, method yang mengubah vs tidak, dan salinan dalam dengan structuredClone.',
    track: JS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Sebagian besar logika aplikasi adalah mengolah daftar: memfilter transaksi, menjumlahkan total, mengelompokkan per kategori. Method array deklaratif (`map`, `filter`, `reduce`) membuat maksud kode terbaca jelas. Yang perlu diwaspadai: sebagian method **mengubah array asli** (mutasi), dan salinan dengan spread hanya sedalam satu tingkat.'),
      code('map, filter, reduce, find', `const transaksi = [
  { id: 1, jenis: 'keluar', kategori: 'makan', jumlah: 54_000 },
  { id: 2, jenis: 'masuk', kategori: 'gaji', jumlah: 8_000_000 },
  { id: 3, jenis: 'keluar', kategori: 'transport', jumlah: 20_000 },
  { id: 4, jenis: 'keluar', kategori: 'makan', jumlah: 35_000 },
];

const pengeluaran = transaksi.filter((t) => t.jenis === 'keluar');  // array baru, isi sebagian
const nominal = pengeluaran.map((t) => t.jumlah);                   // array baru, bentuk lain
const total = nominal.reduce((acc, n) => acc + n, 0);               // satu nilai; selalu beri nilai awal
console.log(total);                                                  // 109000

const pertama = transaksi.find((t) => t.kategori === 'makan');      // objek pertama atau undefined
const idx = transaksi.findIndex((t) => t.id === 3);                 // 2 (atau -1)
const adaBesar = transaksi.some((t) => t.jumlah > 1_000_000);       // true
const semuaPositif = transaksi.every((t) => t.jumlah > 0);          // true
console.log(pertama.id, idx, adaBesar, semuaPositif, transaksi.at(-1).id); // 1 2 true true 4

// Kelompokkan & jumlahkan per kategori
const perKategori = pengeluaran.reduce((acc, t) => {
  acc[t.kategori] = (acc[t.kategori] ?? 0) + t.jumlah;
  return acc;
}, {});
console.log(perKategori);                     // { makan: 89000, transport: 20000 }

// Rantai: dua pengeluaran terbesar, tanpa mengubah array asli
const top = pengeluaran.toSorted((a, b) => b.jumlah - a.jumlah).slice(0, 2);
console.log(top.map((t) => t.id));            // [ 1, 4 ]`, 'js'),
      code('for...of, Map, dan Set', `const nama = ['sari', 'budi', 'sari', 'ani'];

for (const n of nama) console.log(n);                    // nilai
for (const [i, n] of nama.entries()) console.log(i, n);  // indeks + nilai
// for...in mengiterasi KUNCI (string) dan ikut properti warisan: jangan untuk array

// Butuh berhenti di tengah atau await di dalam loop? Pakai for...of, bukan forEach.
for (const n of nama) {
  if (n === 'ani') break;
}

// Set: kumpulan nilai unik, cek keanggotaan cepat
const unik = [...new Set(nama)];                          // urutan kemunculan pertama dipertahankan
console.log(unik, new Set(nama).has('ani'));              // [ 'sari', 'budi', 'ani' ] true

// Map: pasangan kunci-nilai dengan kunci tipe apa pun, urutan sisip terjaga
const stok = new Map([['kopi', 10], ['teh', 4]]);
stok.set('susu', 7);
stok.set('kopi', stok.get('kopi') - 1);
for (const [barang, jumlah] of stok) console.log(barang, jumlah);
console.log(stok.size, Object.fromEntries(stok));        // 3 { kopi: 9, teh: 4, susu: 7 }

const cache = new Map();
const user = { id: 7 };
cache.set(user, 'data profil');                          // objek sebagai kunci
console.log(cache.get(user));                            // data profil`, 'js'),
      code('Mutasi, immutability, dan structuredClone', `const asli = [3, 1, 2];
const urut = asli.toSorted();      // [1, 2, 3]; asli tetap [3, 1, 2]
console.log(asli, urut);
asli.sort();                       // sort() MENGUBAH array asli → [1, 2, 3]

// Default sort membandingkan sebagai string!
console.log([10, 1, 2].toSorted());                  // [ 1, 10, 2 ]
console.log([10, 1, 2].toSorted((a, b) => a - b));   // [ 1, 2, 10 ]

// Alternatif tanpa mutasi
const daftar = ['a', 'b', 'c'];
const ditambah = [...daftar, 'd'];          // bukan push
const diganti = daftar.with(1, 'B');        // [ 'a', 'B', 'c' ]
const tanpaB = daftar.filter((x) => x !== 'b');
const dibalik = daftar.toReversed();
console.log(daftar, ditambah, diganti, tanpaB, dibalik);

// Spread hanya menyalin satu tingkat (shallow copy)
const profil = { nama: 'Sari', alamat: { kota: 'Bandung' }, dibuat: new Date() };
const dangkal = { ...profil };
dangkal.alamat.kota = 'Medan';
console.log(profil.alamat.kota);           // 'Medan' — objek di dalam ikut berubah!

const dalam = structuredClone(profil);      // deep copy; Date, Map, Set ikut tersalin
dalam.alamat.kota = 'Surabaya';
console.log(profil.alamat.kota, dalam.dibuat instanceof Date); // Medan true
// structuredClone menolak fungsi (DataCloneError) dan instance class kehilangan prototype-nya`, 'js'),
      table(['Mengubah array asli (mutating)', 'Versi yang mengembalikan array baru'], [
        ['`push`, `unshift`', '`[...a, x]`, `[x, ...a]`'],
        ['`pop`, `shift`, `splice`', '`slice`, `filter`, `toSpliced`'],
        ['`sort`, `reverse`', '`toSorted`, `toReversed`'],
        ['`a[i] = x`', '`a.with(i, x)`, `map`'],
        ['`fill`, `copyWithin`', '`Array.from({ length: n }, fn)`'],
      ]),
      callout('tip', 'Mengapa immutability penting', 'React dan banyak state manager mendeteksi perubahan dengan membandingkan **referensi** (`lama !== baru`). Bila Anda `push` ke array state, referensinya sama dan UI tidak diperbarui. Biasakan membuat array/objek baru setiap kali data berubah.'),
      ...quiz([
        ['JSD-09', 'Mengapa `[10, 1, 2].sort()` menghasilkan `[1, 10, 2]`?', 'Tanpa fungsi pembanding, `sort` mengubah elemen menjadi string lalu membandingkan urutan karakter, sehingga "10" berada sebelum "2". Untuk angka gunakan `(a, b) => a - b`. Ingat juga `sort` mengubah array asli; pakai `toSorted` bila array asli harus tetap.'],
        ['JSD-10', 'Apa yang terjadi pada `[].reduce((a, b) => a + b)` dan bagaimana mencegahnya?', 'TypeError: Reduce of empty array with no initial value. Tanpa nilai awal, `reduce` memakai elemen pertama sebagai akumulator, dan array kosong tidak punya elemen pertama. Selalu beri nilai awal: `reduce((a, b) => a + b, 0)`.'],
        ['JSD-11', 'Kapan memakai Map dibanding objek biasa?', 'Map cocok untuk kamus dinamis: kunci bisa tipe apa pun (termasuk objek), ada `size`, urutan sisip terjaga, bisa langsung di-iterasi, dan tidak ada risiko bentrok dengan properti warisan seperti `constructor`. Objek biasa tetap tepat untuk data berstruktur tetap dan JSON.'],
      ]),
      ...practice('jsd-array-koleksi', [
        'Dari array transaksi contoh, hitung total pemasukan, total pengeluaran, dan saldo memakai satu `reduce`.',
        'Buat fungsi `kelompokkan(array, fnKunci)` yang mengembalikan Map berisi array per kunci, lalu bandingkan hasilnya dengan `Map.groupBy`.',
        'Tulis ulang fungsi yang memakai `push`/`splice`/`sort` pada data state menjadi versi tanpa mutasi.',
        'Tunjukkan bug salinan dangkal dengan objek bersarang, lalu perbaiki dengan `structuredClone`.',
      ]),
      references(
        ['MDN: Array', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'],
        ['MDN: Indexed collections', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections'],
        ['MDN: Keyed collections (Map & Set)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections'],
        ['MDN: structuredClone()', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone'],
      ),
    ],
  },
  {
    id: 'js-async-promise',
    title: 'JavaScript: Asynchronous, Promise & async/await',
    summary: 'Dari callback ke Promise ke async/await, Promise.all/allSettled/race/any, error handling, fetch, dan pembatalan dengan AbortController.',
    track: JS_BASIC, source: jsCoreSource, duration: '2,5 jam', level: 'Easy',
    blocks: [
      paragraph('JavaScript menjalankan kode di satu thread. Operasi yang lama (jaringan, timer, file) tidak ditunggu dengan memblok; hasilnya dikirim belakangan. Cara mengekspresikan "belakangan" berevolusi dari **callback**, ke **Promise** (objek yang mewakili hasil masa depan), lalu **async/await** yang membuat kode asinkron terbaca seperti kode biasa.'),
      code('Callback → Promise → async/await', `// 1) Callback: hasil dikirim lewat fungsi; error dicek manual di setiap level
function ambilUserCb(id, cb) {
  setTimeout(() => (id > 0 ? cb(null, { id, nama: 'Sari' }) : cb(new Error('id tidak valid'))), 100);
}
ambilUserCb(1, (err, user) => {
  if (err) return console.error(err.message);
  console.log('callback:', user.nama);
});

// 2) Promise: pending → fulfilled (resolve) atau rejected (reject)
const tunggu = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function ambilUser(id) {
  return new Promise((resolve, reject) => {
    ambilUserCb(id, (err, user) => (err ? reject(err) : resolve(user)));
  });
}
ambilUser(1)
  .then((user) => user.nama.toUpperCase())        // nilai return diteruskan ke then berikutnya
  .then((nama) => console.log('promise:', nama))
  .catch((err) => console.error(err.message))     // menangkap error dari mana pun di rantai
  .finally(() => console.log('rantai selesai'));

// 3) async/await: fungsi async selalu mengembalikan Promise
async function main() {
  try {
    await tunggu(200);
    const user = await ambilUser(1);
    console.log('await:', user.nama);
    await ambilUser(-1);                           // ditolak → lompat ke catch
  } catch (err) {
    console.error('gagal:', err.message);
  }
}
main();`, 'js'),
      code('Berurutan vs paralel: Promise.all, allSettled, race, any', `// Top-level await: jalankan sebagai ES module (file .mjs atau "type": "module")
const tunda = (ms, nilai, gagal = false) =>
  new Promise((resolve, reject) => setTimeout(() => (gagal ? reject(new Error(nilai)) : resolve(nilai)), ms));

// Berurutan: total ±300 ms — pakai hanya bila langkah kedua butuh hasil langkah pertama
const a = await tunda(100, 'a');
const b = await tunda(200, 'b');

// Paralel: total ±200 ms; satu gagal → seluruhnya ditolak
const [x, y] = await Promise.all([tunda(100, 'x'), tunda(200, 'y')]);

// allSettled: tunggu semua, apa pun hasilnya
const hasil = await Promise.allSettled([tunda(50, 'ok'), tunda(80, 'rusak', true)]);
for (const h of hasil) {
  console.log(h.status, h.status === 'fulfilled' ? h.value : h.reason.message);
}

// race: yang pertama SELESAI (berhasil atau gagal); any: yang pertama BERHASIL
const tercepat = await Promise.race([tunda(300, 'lambat'), tunda(100, 'cepat')]);
const cadangan = await Promise.any([tunda(50, 'server-1 mati', true), tunda(120, 'server-2')]);
console.log(a, b, x, y, tercepat, cadangan);       // a b x y cepat server-2`, 'js'),
      table(['Kombinator', 'Selesai saat', 'Ditolak saat', 'Contoh pemakaian'], [
        ['`Promise.all`', 'Semua berhasil', 'Satu saja gagal (langsung)', 'Data dashboard yang semuanya wajib ada'],
        ['`Promise.allSettled`', 'Semua selesai', 'Tidak pernah', 'Kirim notifikasi massal, laporkan yang gagal'],
        ['`Promise.race`', 'Yang pertama selesai', 'Yang pertama selesai gagal', 'Batas waktu manual'],
        ['`Promise.any`', 'Yang pertama berhasil', 'Semua gagal (AggregateError)', 'Mirror/cadangan server'],
      ]),
      code('fetch, cek status, dan pembatalan', `async function ambilJson(url, signal) {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  // fetch hanya menolak saat gagal jaringan/dibatalkan; 404 dan 500 tetap "berhasil"
  if (!res.ok) throw new Error(\`HTTP \${res.status} untuk \${url}\`);
  return res.json();
}

// Batal manual, mis. pengguna mengetik kata kunci baru atau menutup halaman
const controller = new AbortController();
const janji = ambilJson('https://jsonplaceholder.typicode.com/todos/1', controller.signal);
// controller.abort();             // → janji ditolak dengan error bernama 'AbortError'

try {
  console.log(await janji);
  // Batas waktu otomatis 3 detik
  const todo = await ambilJson('https://jsonplaceholder.typicode.com/todos/2', AbortSignal.timeout(3000));
  console.log(todo.title);
} catch (err) {
  if (err.name === 'AbortError') console.log('dibatalkan pengguna');
  else if (err.name === 'TimeoutError') console.log('server terlalu lama');
  else console.error('gagal:', err.message);
}`, 'js'),
      callout('warn', 'Floating promise dan async di forEach', 'Promise yang tidak di-`await` dan tidak diberi `.catch` membuat error hilang atau menjadi `unhandledRejection` (Node menghentikan proses). `array.forEach(async (x) => await simpan(x))` **tidak menunggu** apa pun: pakai `for...of` + `await` untuk berurutan, atau `await Promise.all(array.map(simpan))` untuk paralel.'),
      callout('info', 'Lebih dalam: event loop', 'Urutan microtask (Promise) vs macrotask (setTimeout), serta mengapa kode sinkron yang berat memblok semua request, dibahas di [Node.js: Event Loop, Promise & Async Mendalam](#js.node-event-loop).'),
      ...quiz([
        ['JSD-12', 'Mengapa `try { await fetch(url) } catch {}` tidak menangkap respons 404?', '`fetch` hanya menolak Promise saat permintaan gagal di tingkat jaringan (DNS, koneksi putus, CORS) atau dibatalkan. Respons 404/500 tetap respons yang valid. Periksa `res.ok` atau `res.status` lalu `throw` sendiri.'],
        ['JSD-13', 'Tiga request independen masing-masing 1 detik ditulis `await a(); await b(); await c();`. Berapa lama dan bagaimana mempercepatnya?', 'Sekitar 3 detik karena dijalankan berurutan. Karena tidak saling bergantung, jalankan paralel: `const [ra, rb, rc] = await Promise.all([a(), b(), c()]);` sehingga total sekitar 1 detik. Pakai `allSettled` bila sebagian boleh gagal.'],
        ['JSD-14', 'Apa yang salah dengan `ids.forEach(async (id) => await hapus(id)); console.log(\'selesai\')`?', '`forEach` mengabaikan Promise yang dikembalikan callback, sehingga "selesai" tercetak sebelum penghapusan terjadi dan error tidak tertangkap. Ganti dengan `for (const id of ids) await hapus(id);` atau `await Promise.all(ids.map(hapus));`.'],
      ]),
      ...practice('jsd-async-promise', [
        'Bungkus `setTimeout` dan satu API berbasis callback menjadi fungsi yang mengembalikan Promise, lalu panggil dengan async/await.',
        'Ambil `/users/1` dan `/posts?userId=1` dari jsonplaceholder secara paralel dan ukur selisih waktunya dibanding versi berurutan.',
        'Buat kotak pencarian yang membatalkan request sebelumnya dengan AbortController setiap kali pengguna mengetik.',
        'Tambahkan pengecekan `res.ok` dan batas waktu `AbortSignal.timeout` pada setiap `fetch` di proyek Anda.',
      ]),
      references(
        ['MDN: Using promises', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises'],
        ['MDN: async function', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'],
        ['MDN: Using the Fetch API', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'],
        ['MDN: AbortController', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController'],
      ),
    ],
  },
  {
    id: 'js-modul-runtime',
    title: 'JavaScript: Modul, npm, Browser vs Node & DOM',
    summary: 'ES modules (import/export), npm dan package.json, perbedaan runtime browser dan Node, DOM & event, serta mini proyek pencatat pengeluaran.',
    track: JS_BASIC, source: jsCoreSource, duration: '3 jam', level: 'Easy',
    blocks: [
      paragraph('Program nyata terdiri dari banyak file dan memakai paket orang lain. **ES modules** memecah kode menjadi file dengan `import`/`export`, **npm** mengelola dependensi lewat `package.json`, dan kode yang sama bisa berjalan di dua *runtime*: browser (punya DOM) dan Node.js (punya file system dan jaringan server). Pelajaran ini ditutup dengan mini proyek yang menggabungkan semua materi JavaScript Dasar.'),
      code('ES modules: export dan import', `// file: src/uang.js
export const MATA_UANG = 'IDR';                       // named export
export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: MATA_UANG, maximumFractionDigits: 0 }).format(angka);
}
export default function total(daftar) {              // default export: maksimal satu per file
  return daftar.reduce((a, t) => a + t.jumlah, 0);
}

// file: src/main.js
import total, { formatRupiah, MATA_UANG as kode } from './uang.js'; // ekstensi .js wajib (browser & Node ESM)
import * as uang from './uang.js';                                   // semua export sebagai satu objek
console.log(formatRupiah(total([{ jumlah: 5_000 }, { jumlah: 7_500 }])), kode, uang.MATA_UANG);

// Dynamic import: muat modul hanya saat dibutuhkan (code splitting)
document.querySelector('#ekspor')?.addEventListener('click', async () => {
  const { eksporCsv } = await import('./ekspor.js');
  eksporCsv();
});`, 'js'),
      code('npm: membuat proyek dan memasang paket', `mkdir pencatat && cd pencatat
npm init -y                  # membuat package.json
npm pkg set type=module      # file .js diperlakukan sebagai ES module
npm install date-fns         # dependensi runtime → "dependencies"
npm install -D vite          # alat development → "devDependencies"
npx vite                     # jalankan binary lokal dari node_modules/.bin
npm run dev                  # jalankan script "dev" dari package.json
npm ci                       # instal persis sesuai package-lock.json (untuk CI/produksi)`, 'bash'),
      code('package.json hasil perintah di atas (diringkas)', `{
  "name": "pencatat",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "node --test"
  },
  "dependencies": {
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "vite": "^8.3.0"
  }
}`, 'json'),
      paragraph('Nomor versi diisi otomatis oleh `npm install`. Awalan `^` berarti boleh memasang versi minor/patch yang lebih baru dalam versi mayor yang sama; versi persis yang terpasang dikunci di `package-lock.json`, yang **wajib di-commit**. Folder `node_modules` tidak di-commit.'),
      table(['Aspek', 'Browser', 'Node.js'], [
        ['Objek global', '`window` (juga `globalThis`)', '`globalThis` (juga `global`)'],
        ['DOM & UI', '`document`, event klik, `localStorage`', 'Tidak ada'],
        ['File & proses', 'Tidak ada akses langsung', '`node:fs`, `node:path`, `process.env`'],
        ['Mengaktifkan ES module', '`<script type="module">`', '`"type": "module"` di package.json atau file `.mjs`'],
        ['API bersama', '`fetch`, `URL`, `AbortController`, `structuredClone`, `setTimeout`, `console`, `crypto.randomUUID`', 'Sama'],
      ]),
      code('Mini proyek: index.html', `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Catatan Pengeluaran</title>
    <!-- type="module": otomatis ditunda sampai HTML selesai di-parse -->
    <script type="module" src="./app.js"></script>
  </head>
  <body>
    <form id="form">
      <input name="ket" placeholder="Keterangan" required />
      <input name="jumlah" type="number" min="1" placeholder="Jumlah" required />
      <button>Tambah</button>
    </form>
    <ul id="daftar"></ul>
    <p>Total: <strong id="total">Rp 0</strong></p>
  </body>
</html>`, 'html'),
      code('Mini proyek: app.js (DOM, event, localStorage)', `const form = document.querySelector('#form');
const daftar = document.querySelector('#daftar');
const totalEl = document.querySelector('#total');
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

let items = JSON.parse(localStorage.getItem('items') ?? '[]');

function render() {
  daftar.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement('li');
      li.textContent = \`\${item.ket} — \${rupiah.format(item.jumlah)} \`; // textContent aman dari XSS
      const hapus = document.createElement('button');
      hapus.textContent = 'Hapus';
      hapus.dataset.id = item.id;                                        // → data-id="..."
      li.append(hapus);
      return li;
    }),
  );
  totalEl.textContent = rupiah.format(items.reduce((a, i) => a + i.jumlah, 0));
  localStorage.setItem('items', JSON.stringify(items));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();                        // cegah reload halaman
  const data = new FormData(form);
  const baru = { id: crypto.randomUUID(), ket: data.get('ket').trim(), jumlah: Number(data.get('jumlah')) };
  items = [...items, baru];                      // array baru, bukan push
  form.reset();
  render();
});

// Event delegation: satu listener di <ul> untuk semua tombol hapus, termasuk yang dibuat nanti
daftar.addEventListener('click', (event) => {
  const tombol = event.target.closest('button[data-id]');
  if (!tombol) return;
  items = items.filter((i) => i.id !== tombol.dataset.id);
  render();
});

render();`, 'js'),
      callout('warn', 'Jalankan lewat server lokal, bukan dobel-klik file', 'Browser memblokir `<script type="module">` yang dibuka lewat `file://`. Jalankan `npx vite` (atau server statis lain) di folder proyek lalu buka alamat `http://localhost` yang ditampilkan. Untuk menampilkan teks dari pengguna, pakai `textContent`; `innerHTML` dengan input pengguna membuka celah XSS.'),
      callout('tip', 'Langkah berikutnya', 'Tambahkan tipe pada proyek ini di track TypeScript Dasar, mulai dari [TypeScript: Setup, tsc & Tipe Dasar](#js.ts-setup-tipe-dasar). Setelah itu, versi React dari aplikasi yang sama dibangun di track Proyek React.'),
      ...quiz([
        ['JSD-15', 'Apa beda `dependencies` dan `devDependencies`?', '`dependencies` dibutuhkan saat aplikasi berjalan (mis. date-fns, express). `devDependencies` hanya untuk development dan build (vite, typescript, linter, test runner). Saat deploy server, `npm ci --omit=dev` tidak memasang devDependencies sehingga image lebih kecil.'],
        ['JSD-16', 'Mengapa mini proyek memakai satu listener di `<ul>` (event delegation) alih-alih satu listener per tombol?', 'Tombol dibuat ulang setiap `render()`, jadi listener per tombol harus dipasang ulang setiap kali. Event klik *bubble* naik ke `<ul>`, sehingga satu listener cukup; `event.target.closest(\'button[data-id]\')` menemukan tombol yang diklik, termasuk tombol yang ditambahkan belakangan.'],
      ]),
      ...practice('jsd-modul-runtime', [
        'Pecah mini proyek menjadi modul `uang.js` (format), `penyimpanan.js` (localStorage), dan `app.js` (DOM).',
        'Inisialisasi proyek dengan `npm init -y`, pasang Vite sebagai devDependency, dan jalankan dengan `npm run dev`.',
        'Tambahkan filter kategori dan total per kategori memakai `reduce`; daftar tetap tersimpan setelah halaman di-reload.',
        'Jalankan `uang.js` yang sama di Node (`node -e "import(\'./src/uang.js\').then(m => console.log(m.formatRupiah(5000)))"`) untuk membuktikan modul tanpa DOM bisa dipakai di dua runtime.',
      ]),
      references(
        ['MDN: JavaScript modules', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'],
        ['Node.js: Modules — Packages (package.json)', 'https://nodejs.org/api/packages.html'],
        ['npm Docs: package.json', 'https://docs.npmjs.com/cli/configuring-npm/package-json'],
        ['MDN: Document Object Model (DOM)', 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model'],
        ['MDN: addEventListener', 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener'],
      ),
    ],
  },

  // ───────────────────────────── TypeScript Dasar ─────────────────────────────
  {
    id: 'ts-setup-tipe-dasar',
    title: 'TypeScript: Setup, tsc & Tipe Dasar',
    summary: 'Memasang TypeScript, menjalankan tsc, tsconfig strict, tipe primitif, inference, serta any vs unknown vs never.',
    track: TS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('TypeScript adalah JavaScript **ditambah anotasi tipe** yang diperiksa sebelum kode dijalankan. Compiler `tsc` menolak kode seperti memanggil method pada nilai yang mungkin `null` atau mengirim string ke parameter number. Setelah lolos, tipe **dihapus** dan yang berjalan tetap JavaScript biasa, jadi semua materi JavaScript Dasar tetap berlaku.'),
      code('Memasang dan menjalankan tsc', `mkdir belajar-ts && cd belajar-ts
npm init -y
npm pkg set type=module
npm install -D typescript @types/node   # compiler + definisi tipe API Node
npx tsc --init                          # membuat tsconfig.json (lalu sesuaikan seperti di bawah)

npx tsc --noEmit        # hanya cek tipe (dipakai di CI / sebelum commit)
npx tsc                 # cek tipe + tulis JavaScript ke outDir
npx tsc --watch         # kompilasi ulang setiap file berubah
node dist/index.js`, 'bash'),
      code('tsconfig.json untuk proyek Node', `{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src"]
}`, 'json'),
      table(['Opsi', 'Fungsinya'], [
        ['`strict`', 'Menyalakan sekumpulan pemeriksaan ketat, termasuk `strictNullChecks` dan `noImplicitAny`. Wajib untuk proyek baru.'],
        ['`noUncheckedIndexedAccess`', '`arr[0]` dan `obj[kunci]` bertipe `T | undefined`, memaksa Anda menangani indeks yang tidak ada.'],
        ['`module: nodenext`', 'Mengikuti aturan modul Node (ESM/CommonJS dari `"type"` package.json, ekstensi `.js` di import).'],
        ['`verbatimModuleSyntax`', 'Import yang hanya berisi tipe wajib ditulis `import type`, sehingga hasil kompilasi bisa ditebak.'],
        ['`rootDir` / `outDir`', 'Sumber `.ts` di `src`, hasil `.js` di `dist`.'],
        ['`skipLibCheck`', 'Tidak memeriksa ulang file `.d.ts` di node_modules; kompilasi lebih cepat.'],
      ]),
      code('Tipe dasar, inference, dan null', `// Anotasi eksplisit
const nama: string = 'Sari';
const saldo: number = 150_000;
const aktif: boolean = true;
const idBesar: bigint = 10n;

// Inference: tipe ditebak dari nilai awal, anotasi tidak perlu
let kota = 'Bandung';            // string
const statusAkun = 'aktif';      // tipe literal 'aktif' — const tidak bisa berubah
const angka = [1, 2, 3];         // number[]
// kota = 42;                    // error: Type 'number' is not assignable to type 'string'.
kota = 'Medan';

// Parameter wajib diberi tipe; tipe return di-infer (number)
function pajak(harga: number, tarif = 0.11) {
  return Math.round(harga * tarif);
}
console.log(pajak(100_000));
// pajak('100000');              // error: Argument of type 'string' is not assignable to parameter of type 'number'.

// strictNullChecks: kemungkinan null harus ditangani
function panjang(teks: string | null): number {
  // return teks.length;         // error: 'teks' is possibly 'null'.
  return teks?.length ?? 0;
}
console.log(nama, saldo, aktif, idBesar, kota, statusAkun, angka, panjang(null));`, 'ts'),
      code('any vs unknown vs never vs void', `// unknown: "belum tahu" — harus dipersempit sebelum dipakai
const dariJson: unknown = JSON.parse('{"id": 1, "nama": "Sari"}');
// dariJson.nama;               // error: 'dariJson' is of type 'unknown'.
if (typeof dariJson === 'object' && dariJson !== null && 'nama' in dariJson && typeof dariJson.nama === 'string') {
  console.log(dariJson.nama.toUpperCase());   // aman setelah narrowing
}

// any: mematikan pemeriksaan — error baru muncul saat runtime
const bebas: any = JSON.parse('{"id": 1}');
try {
  bebas.nama.toUpperCase();     // lolos compile, crash: Cannot read properties of undefined
} catch (err) {
  console.error((err as Error).message);
}

// void: fungsi yang tidak mengembalikan nilai bermakna
function log(pesan: string): void {
  console.log(pesan);
}

// never: tidak pernah menghasilkan nilai (selalu throw atau loop tanpa akhir)
function gagal(pesan: string): never {
  throw new Error(pesan);
}
log('selesai');
if (Math.random() > 2) gagal('tidak akan terjadi');`, 'ts'),
      callout('info', 'Tipe hanya ada saat kompilasi', 'TypeScript tidak memeriksa data saat program berjalan. JSON dari API, isi form, dan `process.env` bisa saja tidak sesuai tipe yang Anda tulis, jadi data dari luar perlu divalidasi (dibahas di pelajaran terakhir track ini). Node.js versi terbaru juga bisa menjalankan file `.ts` langsung dengan [type stripping](https://nodejs.org/api/typescript.html): anotasi dihapus **tanpa** diperiksa, jadi `tsc --noEmit` tetap diperlukan.'),
      ...quiz([
        ['TSD-01', 'Apa beda `any` dan `unknown`, dan mana yang dipakai untuk hasil `JSON.parse`?', '`any` mematikan pemeriksaan: semua operasi diizinkan dan kesalahan baru muncul saat runtime. `unknown` menerima nilai apa pun tetapi melarang operasi sampai tipenya dipersempit (typeof, in, type guard, atau validasi skema). Untuk data dari luar seperti `JSON.parse`, pakai `unknown` lalu validasi.'],
        ['TSD-02', 'Kode lolos `tsc` tanpa error. Apakah berarti tidak akan ada TypeError saat runtime?', 'Tidak. Tipe dihapus saat kompilasi, sehingga data dari luar (API, localStorage, input) tidak diperiksa. Selain itu `any`, `as`, dan `!` bisa membohongi compiler. TypeScript mengurangi kelas bug secara drastis, tetapi batas sistem tetap perlu validasi runtime.'],
      ]),
      ...practice('tsd-setup-tipe', [
        'Buat proyek dengan tsconfig di atas; `npx tsc` menghasilkan `dist/index.js` yang bisa dijalankan dengan `node`.',
        'Aktifkan satu per satu baris yang dikomentari "error" pada contoh dan catat pesan compiler-nya.',
        'Tambahkan script `"typecheck": "tsc --noEmit"` ke package.json dan jalankan dengan `npm run typecheck`.',
        'Tulis fungsi `bacaAngka(input: unknown): number` yang menerima number atau string angka dan melempar error untuk selain itu.',
      ]),
      references(
        ['TypeScript Handbook: The Basics', 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html'],
        ['TypeScript Handbook: Everyday Types', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'],
        ['TSConfig Reference', 'https://www.typescriptlang.org/tsconfig/'],
        ['Node.js: Modules — TypeScript', 'https://nodejs.org/api/typescript.html'],
      ),
    ],
  },
  {
    id: 'ts-object-union-narrowing',
    title: 'TypeScript: Object Type, Union & Narrowing',
    summary: 'type vs interface, properti opsional & readonly, union dan literal type, narrowing dengan typeof/in/instanceof, dan discriminated union.',
    track: TS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Kekuatan utama TypeScript ada pada cara memodelkan **bentuk data**. Object type mendeskripsikan properti yang wajib dan opsional, sedangkan union type menyatakan "nilai ini salah satu dari beberapa kemungkinan". Compiler lalu **mempersempit** (narrowing) tipe di setiap cabang `if`/`switch`, sehingga Anda hanya bisa mengakses properti yang pasti ada.'),
      code('type, interface, opsional, dan readonly', `type Id = number;                       // alias: nama untuk tipe apa pun

interface Transaksi {
  readonly id: Id;                      // tidak bisa diubah setelah dibuat
  keterangan: string;
  jumlah: number;
  catatan?: string;                     // opsional: boleh tidak ada
  tags: readonly string[];              // array yang tidak bisa di-push
}

// interface memakai extends; type memakai intersection (&)
interface TransaksiKartu extends Transaksi {
  nomorAkhir: string;
}
type TransaksiTransfer = Transaksi & { bank: string };

const t: Transaksi = { id: 1, keterangan: 'Kopi', jumlah: 18_000, tags: ['makan'] };
// t.id = 2;                            // error: Cannot assign to 'id' because it is a read-only property.
// t.tags.push('pagi');                 // error: Property 'push' does not exist on type 'readonly string[]'.
// const salah: Transaksi = { id: 2, keterangan: 'Teh', jumlah: 5_000, tags: [], diskon: 1 };
//                                      // error: Object literal may only specify known properties
console.log(t.catatan?.toUpperCase() ?? 'tanpa catatan');

const kartu: TransaksiKartu = { ...t, id: 2, nomorAkhir: '4321' };
const transfer: TransaksiTransfer = { ...t, id: 3, bank: 'BCA' };

// Index signature: objek sebagai kamus dengan kunci bebas
const anggaran: { [kategori: string]: number } = { makan: 1_500_000, transport: 400_000 };
console.log(kartu.nomorAkhir, transfer.bank, anggaran['makan']); // number | undefined (noUncheckedIndexedAccess)`, 'ts'),
      table(['', '`interface`', '`type`'], [
        ['Bentuk objek', 'Ya', 'Ya'],
        ['Union, tuple, primitif, fungsi', 'Tidak', 'Ya (`type Jenis = \'a\' | \'b\'`)'],
        ['Pewarisan', '`extends` (pesan error lebih jelas)', 'Intersection `&`'],
        ['Declaration merging', 'Ya (dua deklarasi bernama sama digabung)', 'Tidak (nama ganda = error)'],
        ['Saran', 'Bentuk objek & kontrak publik', 'Union, alias, tipe turunan'],
      ]),
      code('Union, literal type, dan narrowing', `type Jenis = 'masuk' | 'keluar';         // literal union: hanya dua string ini
type IdFleksibel = number | string;

function label(jenis: Jenis): string {
  return jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran';
}
console.log(label('masuk'));
// label('transfer');                    // error: Argument of type '"transfer"' is not assignable to parameter of type 'Jenis'.

function normalisasiId(id: IdFleksibel): string {
  if (typeof id === 'number') return id.toString().padStart(6, '0'); // di sini id: number
  return id.trim();                                                    // di sini id: string
}

interface Kucing { nama: string; meong(): string }
interface Anjing { nama: string; gonggong(): string }

function bersuara(hewan: Kucing | Anjing): string {
  if ('meong' in hewan) return hewan.meong();  // narrowing dengan in
  return hewan.gonggong();
}

function pesanError(e: unknown): string {
  if (e instanceof Error) return e.message;     // narrowing dengan instanceof
  if (Array.isArray(e)) return e.join(', ');    // any[]
  return String(e);
}

console.log(normalisasiId(42), normalisasiId(' A-7 '), bersuara({ nama: 'Mochi', meong: () => 'meong' }));
console.log(pesanError(new Error('gagal')), pesanError(['a', 'b']));`, 'ts'),
      code('Discriminated union dan pemeriksaan exhaustive', `type Pembayaran =
  | { metode: 'tunai' }
  | { metode: 'kartu'; nomorAkhir: string }
  | { metode: 'transfer'; bank: string; rekening: string };

function deskripsi(p: Pembayaran): string {
  switch (p.metode) {                      // metode = properti diskriminan
    case 'tunai':
      return 'Tunai';
    case 'kartu':
      return \`Kartu ****\${p.nomorAkhir}\`;  // p dipersempit ke varian kartu
    case 'transfer':
      return \`Transfer \${p.bank} (\${p.rekening})\`;
    default: {
      // Bila varian baru ditambahkan dan lupa ditangani, baris ini error saat kompilasi
      const tidakMungkin: never = p;
      return tidakMungkin;
    }
  }
}

// Status async tanpa kombinasi mustahil (mis. loading sekaligus error)
type StatusMuat =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'sukses'; data: string[] }
  | { status: 'gagal'; error: string };

function tampilkan(s: StatusMuat): string {
  if (s.status === 'sukses') return s.data.join(', ');
  if (s.status === 'gagal') return 'Error: ' + s.error;
  return s.status === 'loading' ? 'Memuat...' : '';
}

console.log(deskripsi({ metode: 'kartu', nomorAkhir: '4321' }));
console.log(tampilkan({ status: 'sukses', data: ['a', 'b'] }));`, 'ts'),
      callout('tip', 'Buat status mustahil tidak bisa ditulis', 'Daripada `{ loading: boolean; error?: string; data?: T }` yang mengizinkan `loading: true` sekaligus `error`, pakai discriminated union seperti `StatusMuat`. Pembahasan lebih dalam beserta custom type guard ada di [Discriminated Union & Type Guard](#js.discriminated-union-type-guard).'),
      ...quiz([
        ['TSD-03', 'Kapan memakai `interface` dan kapan `type`?', 'Keduanya bisa mendeskripsikan objek. `interface` cocok untuk bentuk objek dan kontrak yang mungkin di-extend; pesan error-nya rapi dan mendukung declaration merging. `type` wajib untuk union, tuple, literal, dan tipe turunan (utility/mapped). Konsisten dalam satu proyek lebih penting daripada pilihannya.'],
        ['TSD-04', 'Apa fungsi `const tidakMungkin: never = p` di cabang `default`?', 'Bila semua varian sudah ditangani, `p` di cabang default bertipe `never` dan assignment valid. Bila seseorang menambah varian baru (mis. `{ metode: \'qris\' }`) tanpa menambah `case`, `p` tidak lagi `never` sehingga compiler error. Ini mengubah lupa menangani kasus menjadi error kompilasi.'],
        ['TSD-05', 'Mengapa `if (typeof x === \'object\')` saja tidak cukup untuk memastikan x adalah objek?', 'Karena `typeof null === \'object\'`. TypeScript tahu ini, sehingga setelah cek tersebut tipe x masih bisa `null`. Tambahkan `&& x !== null`.'],
      ]),
      ...practice('tsd-object-union', [
        'Modelkan `Transaksi` pada mini proyek JavaScript dengan interface: `id` readonly, `catatan` opsional, `jenis` literal union.',
        'Tulis discriminated union `Notifikasi` (email, sms, push) beserta fungsi `kirim` yang memakai `switch` + pemeriksaan `never`.',
        'Tambahkan varian baru ke union dan pastikan compiler menunjuk tepat ke `switch` yang belum menanganinya.',
        'Ganti satu objek state `{ loading, error, data }` di kode Anda dengan union seperti `StatusMuat`.',
      ]),
      references(
        ['TypeScript Handbook: Object Types', 'https://www.typescriptlang.org/docs/handbook/2/objects.html'],
        ['TypeScript Handbook: Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'],
        ['TypeScript Handbook: Everyday Types (union, alias, interface)', 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html'],
      ),
    ],
  },
  {
    id: 'ts-fungsi-generic-dasar',
    title: 'TypeScript: Fungsi, Array, Tuple & Generic Dasar',
    summary: 'Memberi tipe pada fungsi dan callback, overload seperlunya, array readonly & tuple, generic function, constraint, dan keyof.',
    track: TS_BASIC, source: jsCoreSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Fungsi adalah batas antarbagian kode, jadi di sinilah anotasi tipe paling bernilai. **Generic** memungkinkan satu fungsi bekerja untuk banyak tipe tanpa kehilangan informasi tipe, misalnya `pertama(daftar)` yang mengembalikan `number` untuk array angka dan `User` untuk array user, bukan `any`.'),
      code('Tipe pada fungsi dan callback', `// Parameter wajib, default, opsional, dan tipe return eksplisit
function formatHarga(angka: number, mataUang = 'IDR', desimal?: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: mataUang,
    maximumFractionDigits: desimal ?? 0,
  }).format(angka);
}

const jumlahkan = (...angka: number[]): number => angka.reduce((a, b) => a + b, 0);

// Tipe fungsi sebagai nilai (callback)
type Validator = (nilai: string) => string | null;   // pesan error atau null
const wajib: Validator = (v) => (v.trim() === '' ? 'Wajib diisi' : null); // v otomatis string
const minimal = (n: number): Validator => (v) => (v.length < n ? \`Minimal \${n} karakter\` : null);

function validasi(nilai: string, aturan: readonly Validator[]): string[] {
  // filter dengan pengecekan !== null dipahami compiler: hasilnya string[]
  return aturan.map((cek) => cek(nilai)).filter((pesan) => pesan !== null);
}
console.log(formatHarga(18_000), jumlahkan(1, 2, 3), validasi('ab', [wajib, minimal(3)]));

// Overload: beberapa signature, satu implementasi. Pakai hanya bila tipe return
// bergantung pada argumen; selebihnya union parameter sudah cukup.
function parse(input: string, sebagai: 'angka'): number;
function parse(input: string, sebagai: 'tanggal'): Date;
function parse(input: string, sebagai: 'angka' | 'tanggal'): number | Date {
  return sebagai === 'angka' ? Number(input) : new Date(input);
}
const n = parse('42', 'angka');             // number
const tgl = parse('2026-10-30', 'tanggal'); // Date
console.log(n + 1, tgl.getFullYear());`, 'ts'),
      code('Array, readonly array, dan tuple', `const angka: number[] = [1, 2, 3];
const nama: Array<string> = ['sari', 'budi'];
const tetap: readonly number[] = [1, 2];
// tetap.push(3);                   // error: Property 'push' does not exist on type 'readonly number[]'.

// Tuple: panjang dan tipe per posisi tetap; label hanya untuk dokumentasi
type Koordinat = [lat: number, lng: number];
const kantor: Koordinat = [-6.9175, 107.6191];
const [lat, lng] = kantor;

// Tuple sebagai nilai kembali (pola yang sama dengan useState di React)
function bagi(a: number, b: number): [hasil: number, sisa: number] {
  return [Math.floor(a / b), a % b];
}
const [hasil, sisa] = bagi(17, 5);  // 3, 2

// Dengan noUncheckedIndexedAccess, akses indeks bisa undefined
const pertama = angka[0];           // number | undefined
console.log((pertama ?? 0) + 1, nama, tetap, lat, lng, hasil, sisa);`, 'ts'),
      code('Generic function, constraint, dan keyof', `// T diisi otomatis dari argumen
function pertama<T>(daftar: readonly T[]): T | undefined {
  return daftar[0];
}
const a = pertama([10, 20]);        // number | undefined
const b = pertama(['x', 'y']);      // string | undefined

// Constraint: T boleh tipe apa pun asalkan punya id: number
function cariById<T extends { id: number }>(daftar: readonly T[], id: number): T | undefined {
  return daftar.find((item) => item.id === id);
}
const user = cariById([{ id: 1, nama: 'Sari' }, { id: 2, nama: 'Budi' }], 2);
console.log(user?.nama);            // tipe lengkap ikut terbawa: { id: number; nama: string }
// cariById(['a', 'b'], 1);         // error: Type 'string' is not assignable to type '{ id: number; }'.

// keyof: K harus salah satu kunci T, dan T[K] adalah tipe nilainya
function ambilProp<T, K extends keyof T>(obj: T, kunci: K): T[K] {
  return obj[kunci];
}
const trx = { id: 1, jumlah: 18_000, keterangan: 'Kopi' };
const jumlah = ambilProp(trx, 'jumlah');   // number
// ambilProp(trx, 'harga');                // error: Argument of type '"harga"' is not assignable to parameter of type '"id" | "jumlah" | "keterangan"'.

// Generic pada tipe: hasil operasi tanpa throw
type Hasil<T> = { ok: true; data: T } | { ok: false; error: string };

function parseAngka(teks: string): Hasil<number> {
  const angka = Number(teks);
  return Number.isNaN(angka) ? { ok: false, error: \`"\${teks}" bukan angka\` } : { ok: true, data: angka };
}
const r = parseAngka('42');
if (r.ok) console.log(r.data * 2);  // r.data hanya bisa diakses setelah cek ok
else console.error(r.error);
console.log(a, b, jumlah);`, 'ts'),
      table(['Gejala', 'Solusi'], [
        ['Fungsi menerima/mengembalikan `any` agar "bisa semua tipe"', 'Generic `<T>`: tipe input mengalir ke output'],
        ['Generic butuh akses properti tertentu', 'Constraint `T extends { id: number }`'],
        ['Parameter berupa nama properti objek', '`K extends keyof T` dan tipe nilai `T[K]`'],
        ['`<T>` hanya muncul sekali di signature', 'Biasanya tidak perlu generic; pakai tipe biasa atau `unknown`'],
      ]),
      callout('warn', 'Jangan memaksa dengan as', '`data as User` tidak mengubah atau memeriksa apa pun saat runtime; ia hanya menyuruh compiler percaya. Pakai narrowing atau validasi, dan simpan `as` untuk kasus yang benar-benar Anda ketahui lebih baik dari compiler (mis. `as const`).'),
      ...quiz([
        ['TSD-06', 'Apa kelebihan `function pertama<T>(d: readonly T[]): T | undefined` dibanding `function pertama(d: any[]): any`?', 'Dengan generic, tipe elemen mengalir ke hasil: `pertama([1, 2])` bertipe `number | undefined`, sehingga salah pakai (mis. `.toUpperCase()`) langsung error. Versi `any` menghapus informasi tipe dan semua kesalahan baru terlihat saat runtime.'],
        ['TSD-07', 'Mengapa `ambilProp(trx, \'harga\')` error, padahal JavaScript akan mengembalikan undefined?', 'Constraint `K extends keyof T` membatasi K ke union kunci yang benar-benar ada di `trx` (`"id" | "jumlah" | "keterangan"`). Salah ketik nama properti tertangkap saat kompilasi alih-alih menjadi `undefined` diam-diam di runtime.'],
      ]),
      ...practice('tsd-fungsi-generic', [
        'Beri tipe pada semua fungsi di `uang.js` dan `app.js` mini proyek (ubah ke `.ts`) tanpa satu pun `any`.',
        'Tulis `kelompokkan<T, K extends PropertyKey>(daftar: readonly T[], kunci: (item: T) => K): Map<K, T[]>` dan uji dengan data transaksi.',
        'Buat `urutkanBerdasarkan<T>(daftar, kunci: keyof T)` yang mengembalikan array baru dan menolak kunci yang tidak ada.',
        'Ganti satu fungsi yang melempar error dengan versi yang mengembalikan `Hasil<T>`, lalu tangani kedua cabangnya di pemanggil.',
      ]),
      references(
        ['TypeScript Handbook: More on Functions', 'https://www.typescriptlang.org/docs/handbook/2/functions.html'],
        ['TypeScript Handbook: Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html'],
        ['TypeScript Handbook: Keyof Type Operator', 'https://www.typescriptlang.org/docs/handbook/2/keyof-types.html'],
      ),
    ],
  },
  {
    id: 'ts-utility-proyek',
    title: 'TypeScript: Utility Types, satisfies & Migrasi Proyek',
    summary: 'Partial/Pick/Omit/Record/ReturnType, satisfies dan as const, tipe respons fetch dengan validasi runtime, lalu migrasi proyek JavaScript kecil ke TypeScript.',
    track: TS_BASIC, source: jsCoreSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Di proyek nyata Anda jarang menulis tipe dari nol untuk setiap variasi data. **Utility types** menurunkan tipe baru dari tipe yang sudah ada (input form dari entitas, payload PATCH dari input), sehingga satu perubahan pada tipe sumber otomatis menjalar. Pelajaran ini juga membahas `satisfies` dan `as const`, cara aman memberi tipe pada respons API, dan langkah migrasi proyek JavaScript.'),
      code('Utility types: menurunkan tipe dari satu sumber', `interface Transaksi {
  id: number;
  keterangan: string;
  jumlah: number;
  jenis: 'masuk' | 'keluar';
  dibuatPada: string;
}

type TransaksiBaru = Omit<Transaksi, 'id' | 'dibuatPada'>;   // input form: id dibuat server
type UbahTransaksi = Partial<TransaksiBaru>;                 // PATCH: semua properti opsional
type BarisRingkas = Pick<Transaksi, 'id' | 'jumlah'>;
type TotalPerJenis = Record<Transaksi['jenis'], number>;     // { masuk: number; keluar: number }
type TransaksiBeku = Readonly<Transaksi>;

function buat(input: TransaksiBaru): Transaksi {
  return { ...input, id: Date.now(), dibuatPada: new Date().toISOString() };
}
function ubah(lama: Transaksi, perubahan: UbahTransaksi): Transaksi {
  return { ...lama, ...perubahan };
}

type HasilBuat = ReturnType<typeof buat>;            // Transaksi
type ArgUbah = Parameters<typeof ubah>[1];          // UbahTransaksi
type DataUser = Awaited<ReturnType<typeof ambilUser>>; // { id: number; nama: string }
async function ambilUser() {
  return { id: 1, nama: 'Sari' };
}

const t: TransaksiBeku = buat({ keterangan: 'Kopi', jumlah: 18_000, jenis: 'keluar' });
const total: TotalPerJenis = { masuk: 0, keluar: t.jumlah };   // lupa salah satu kunci = error
const baris: BarisRingkas = { id: t.id, jumlah: t.jumlah };
const patch: ArgUbah = { jumlah: 20_000 };
const hasil: HasilBuat = ubah(t, patch);
const u: DataUser = { id: 2, nama: 'Budi' };
console.log(total, baris, hasil.jumlah, u.nama);`, 'ts'),
      table(['Utility', 'Hasil', 'Contoh pemakaian'], [
        ['`Partial<T>`', 'Semua properti opsional', 'Payload PATCH, nilai awal form'],
        ['`Required<T>`', 'Semua properti wajib', 'Konfigurasi setelah default diisi'],
        ['`Pick<T, K>` / `Omit<T, K>`', 'Ambil / buang sebagian properti', 'DTO input, data tampilan ringkas'],
        ['`Record<K, V>`', 'Objek dengan kunci K bernilai V', 'Peta label, total per kategori'],
        ['`Readonly<T>`', 'Semua properti readonly', 'State yang tidak boleh dimutasi'],
        ['`ReturnType<F>` / `Parameters<F>`', 'Tipe hasil / argumen fungsi', 'Tipe dari fungsi pihak ketiga'],
        ['`Awaited<T>`', 'Isi Promise', '`Awaited<ReturnType<typeof fetchUser>>`'],
        ['`NonNullable<T>`', 'Buang `null` dan `undefined`', 'Setelah validasi keberadaan'],
      ]),
      code('satisfies dan as const', `type Rute = { path: string; auth: boolean };

// Anotasi biasa: kunci spesifik hilang, semua kunci string dianggap mungkin ada
const ruteLebar: Record<string, Rute> = { beranda: { path: '/', auth: false } };
console.log(ruteLebar['profil']?.path);   // tidak error saat kompilasi, hanya undefined

// satisfies: dicek terhadap Rute, tetapi tipe asli (kunci spesifik) dipertahankan
const rute = {
  beranda: { path: '/', auth: false },
  dasbor: { path: '/dasbor', auth: true },
} satisfies Record<string, Rute>;
console.log(rute.dasbor.path);            // OK, autocomplete beranda | dasbor
// rute.profil;                           // error: Property 'profil' does not exist
// Menambah laporan: { path: '/laporan' } ke objek di atas juga error karena auth hilang

// as const: literal paling sempit + readonly
const JENIS = ['masuk', 'keluar'] as const;     // readonly ["masuk", "keluar"]
type Jenis = (typeof JENIS)[number];            // "masuk" | "keluar"

const WARNA = { masuk: 'green', keluar: 'red' } as const satisfies Record<Jenis, string>;
function warnaUntuk(j: Jenis) {
  return WARNA[j];                              // "green" | "red"
}
console.log(JENIS.includes('masuk'), warnaUntuk('keluar'));`, 'ts'),
      code('Respons fetch: unknown + validasi runtime', `interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// res.json() bertipe Promise<any>; anotasi Todo saja hanya "janji" yang tidak dicek.
// Terima sebagai unknown lalu buktikan bentuknya dengan type guard.
function isTodo(data: unknown): data is Todo {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.userId === 'number' && typeof d.id === 'number'
    && typeof d.title === 'string' && typeof d.completed === 'boolean';
}

async function ambilTodo(id: number): Promise<Todo> {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/todos/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const data: unknown = await res.json();
  if (!isTodo(data)) throw new Error('Bentuk respons tidak sesuai kontrak');
  return data;                                   // di sini data: Todo
}

const todo = await ambilTodo(1);
console.log(todo.title.toUpperCase());`, 'ts'),
      code('Versi Zod: skema = validasi + tipe', `// npm install zod
import * as z from 'zod';

const TodoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});
type Todo = z.infer<typeof TodoSchema>;          // tipe diturunkan dari skema: satu sumber kebenaran

export async function ambilTodo(id: number): Promise<Todo> {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/todos/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return TodoSchema.parse(await res.json());     // melempar ZodError bila tidak cocok
}`, 'ts'),
      paragraph('**Migrasi proyek JavaScript kecil** (mis. mini proyek pencatat pengeluaran) sebaiknya bertahap, dari modul paling bawah ke atas, agar proyek selalu bisa berjalan:'),
      orderedList([
        'Pasang `typescript` (dan `@types/node` bila perlu), buat tsconfig dengan `"allowJs": true` dan `"checkJs": false` agar file `.js` lama tetap ikut dikompilasi.',
        'Opsional: tambahkan komentar `// @ts-check` di atas file `.js` untuk mulai mendapat pemeriksaan tanpa mengganti nama file.',
        'Ganti nama satu file utilitas tanpa dependensi (`uang.js` → `uang.ts`), beri tipe pada parameter dan return, jalankan `npx tsc --noEmit`, perbaiki semua error.',
        'Definisikan tipe domain (`Transaksi`, `Jenis`) di satu file `types.ts` dan impor dengan `import type`.',
        'Ulangi ke modul di atasnya (penyimpanan, lalu UI). Data dari `localStorage`/API diterima sebagai `unknown` lalu divalidasi.',
        'Setelah semua file `.ts`, matikan `allowJs`, pastikan `"strict": true`, dan tambahkan `tsc --noEmit` ke CI.',
      ]),
      callout('tip', 'Lanjut dari sini', 'Fondasi JavaScript & TypeScript selesai. Perdalam generics, utility types, dan kontrak API di [TypeScript Lanjutan: Kenapa TypeScript, dan Kenapa Sekarang](#js.kenapa-typescript-dan-kenapa-sekarang) (lihat juga [Kontrak API Lintas Sisi: Zod](#js.kontrak-api-lintas-sisi-zod)), atau mulai membangun UI di [React: Peta Jalan React + TypeScript](#js.peta-jalan-react-typescript).'),
      ...quiz([
        ['TSD-08', 'Apa beda `const x: Tipe = {...}` dengan `const x = {...} satisfies Tipe`?', 'Keduanya memeriksa bahwa nilai cocok dengan `Tipe`. Anotasi mengganti tipe variabel menjadi `Tipe` (informasi spesifik seperti kunci atau literal hilang), sedangkan `satisfies` hanya memeriksa dan mempertahankan tipe hasil inference yang lebih sempit, sehingga autocomplete dan pengecekan kunci tetap akurat.'],
        ['TSD-09', 'Mengapa `const data: Todo = await res.json()` belum aman?', '`res.json()` mengembalikan `any`, sehingga anotasi `Todo` diterima tanpa pemeriksaan. Bila server mengirim bentuk lain, error muncul jauh dari sumbernya. Terima sebagai `unknown`, lalu validasi dengan type guard atau skema Zod di batas sistem.'],
        ['TSD-10', 'Mengapa migrasi dilakukan dari modul paling bawah (utilitas) dulu?', 'Modul bawah tidak bergantung pada modul lain, jadi bisa diberi tipe lengkap tanpa menunggu bagian lain. Setelah itu modul di atasnya langsung mendapat tipe yang benar saat mengimpor, dan proyek tetap bisa dijalankan di setiap langkah.'],
      ]),
      ...practice('tsd-utility-proyek', [
        'Turunkan `TransaksiBaru`, `UbahTransaksi`, dan `TotalPerJenis` dari satu interface `Transaksi` tanpa menulis ulang properti.',
        'Ubah konstanta konfigurasi (rute, warna kategori) ke `as const satisfies ...` dan buktikan salah ketik kunci menjadi error.',
        'Ganti `await res.json()` yang diberi anotasi langsung dengan `unknown` + validasi (type guard atau Zod).',
        'Migrasikan mini proyek pencatat pengeluaran ke TypeScript strict mengikuti enam langkah di atas; `npx tsc --noEmit` bersih tanpa `any`.',
      ]),
      references(
        ['TypeScript Handbook: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'],
        ['TypeScript 4.9 release notes: satisfies', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html'],
        ['TypeScript Handbook: Migrating from JavaScript', 'https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html'],
        ['Zod', 'https://zod.dev/'],
      ),
    ],
  },
];
