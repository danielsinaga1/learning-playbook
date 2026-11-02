import type { Block, Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const JS_ADV = 'JavaScript Lanjutan';
const TS_PRO = 'TypeScript Tingkat Mahir';

export const jsAdvancedTracks: Track[] = [
  { title: JS_ADV, summary: 'Error handling & debugging, regex & Intl, iterator/generator/Proxy, Web API DOM, tooling modern (pnpm, Vite, ESLint, monorepo), dan proyek vanilla JS lengkap.' },
  { title: TS_PRO, summary: 'Conditional types & infer, mapped & template literal types, declaration files & publikasi library, decorators, NoInfer, dan API client type-safe.' },
];

export const jsAdvancedSource = 'JavaScript Lanjutan & TypeScript Tingkat Mahir: materi tambahan dari MDN, TC39, dan TypeScript Handbook (2 November 2026)';

const orderedList = (items: string[]): Block => ({ type: 'list', ordered: true, items });

/**
 * Track 'JavaScript Lanjutan' disisipkan setelah 'JavaScript Dasar';
 * track 'TypeScript Tingkat Mahir' disisipkan setelah 'TypeScript Lanjutan'.
 */
export const jsAdvancedModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── JavaScript Lanjutan ─────────────────────────────
  {
    id: 'jsa-error-debugging',
    title: 'JavaScript: Error Handling & Debugging',
    summary: 'Subclass Error, opsi cause, error di kode async dan unhandled rejection, breakpoint DevTools, serta trik console yang mempercepat investigasi.',
    track: JS_ADV, source: jsAdvancedSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Program yang baik bukan program yang tidak pernah error, melainkan program yang errornya **jelas**: tahu jenisnya, tahu konteksnya, dan tidak hilang diam-diam. Pelajaran ini membedakan dua jenis kegagalan: *error yang diharapkan* (input tidak valid, server 503) yang harus ditangani dengan rapi, dan *bug* yang harus dibiarkan terlihat agar cepat diperbaiki. Setelah itu kita membahas alat untuk menemukan bug: breakpoint DevTools dan console yang dipakai dengan benar.'),
      code('Subclass Error dan opsi cause', `class AppError extends Error {
  constructor(message, options) {
    super(message, options);          // options.cause diteruskan ke Error (ES2022)
    this.name = new.target.name;      // 'ValidasiError', 'HttpError', ... tanpa menulis ulang di tiap subclass
  }
}

class ValidasiError extends AppError {
  constructor(field, message) {
    super(message);
    this.field = field;
  }
}

class HttpError extends AppError {
  constructor(status, url, options) {
    super(\`HTTP \${status} saat memanggil \${url}\`, options);
    this.status = status;
    this.url = url;
  }

  get bisaDiulang() {
    return this.status >= 500 || this.status === 429;
  }
}

function parseNominal(input) {
  const angka = Number(input);
  if (!Number.isInteger(angka) || angka <= 0) {
    throw new ValidasiError('jumlah', \`"\${input}" bukan nominal yang valid\`);
  }
  return angka;
}

function bacaKonfigurasi(teks) {
  try {
    return JSON.parse(teks);
  } catch (err) {
    // Tambahkan konteks, tetapi jangan buang error aslinya
    throw new AppError('Konfigurasi rusak', { cause: err });
  }
}

try {
  parseNominal('12abc');
} catch (err) {
  if (err instanceof ValidasiError) console.log(err.name, err.field, err.message);
  else throw err;                     // bukan error yang kita kenal: lempar ulang
}

try {
  bacaKonfigurasi('{ "mode": ');
} catch (err) {
  console.log(err.message);                           // Konfigurasi rusak
  console.log(err.cause.name);                        // SyntaxError
  console.log(err instanceof AppError, err instanceof Error); // true true
}

const e503 = new HttpError(503, '/api/kurs');
console.log(e503.name, e503.message, e503.bisaDiulang); // HttpError HTTP 503 saat memanggil /api/kurs true`, 'js'),
      code('Error di kode asynchronous dan unhandled rejection', `// Jalankan sebagai ES module (file .mjs atau "type": "module") karena memakai top-level await
async function simpan() {
  throw new Error('DB mati');
}

// 1) try/catch hanya menangkap Promise yang di-await DI DALAM blok try
async function salah() {
  try {
    simpan();                         // tanpa await: rejection terjadi setelah try selesai
  } catch {
    console.log('tidak pernah tercetak');
  }
}

async function benar() {
  try {
    await simpan();
  } catch (err) {
    console.log('tertangkap:', err.message);
  }
}

// 2) "return await" di dalam try: tanpa await, catch di bawah tidak pernah jalan
async function denganKonteks(fn) {
  try {
    return await fn();
  } catch (err) {
    throw new Error('denganKonteks gagal', { cause: err });
  }
}

// 3) Jaring pengaman global: untuk logging & monitoring, BUKAN pengganti try/catch
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise tanpa catch:', event.reason);
  });
  window.addEventListener('error', (event) => console.error('Error tak tertangani:', event.error));
} else {
  process.on('unhandledRejection', (reason) => {
    console.error('Promise tanpa catch:', reason.message);
    process.exitCode = 1;             // tanpa handler ini, Node (sejak v15) menghentikan proses
  });
}

await benar();                                         // tertangkap: DB mati
await denganKonteks(simpan).catch((err) => console.log(err.message, '←', err.cause.message));
await salah();                                         // memicu unhandledRejection`, 'js'),
      code('Console yang dipakai dengan benar, plus debugger', `const transaksi = [
  { id: 1, kategori: 'makan', jumlah: 54_000 },
  { id: 2, kategori: 'transport', jumlah: 20_000 },
  { id: 3, kategori: 'makan', jumlah: 35_000 },
];

console.table(transaksi);                       // tabel rapi; console.table(transaksi, ['id', 'jumlah']) untuk kolom tertentu
console.log({ transaksi });                     // shorthand objek: nama variabel ikut tercetak

console.group('Hitung total');                  // log berikutnya menjorok sampai groupEnd
console.time('total');
const total = transaksi.reduce((a, t) => a + t.jumlah, 0);
console.timeEnd('total');                       // total: 0.02ms
console.log('total =', total);
console.groupEnd();

for (const t of transaksi) console.count(t.kategori); // makan: 1, transport: 1, makan: 2
console.assert(total > 0, 'total harus positif');    // hanya mencetak bila kondisi FALSE
console.warn('peringatan: bisa difilter terpisah di panel Console');
console.trace('dari mana fungsi ini dipanggil?');      // cetak stack trace saat ini

// Browser saja: gaya CSS pada log
console.log('%cPENTING', 'color: white; background: crimson; padding: 2px 6px');

function hitungDiskon(harga, persen) {
  if (persen > 100) debugger;                   // berhenti di sini HANYA bila DevTools terbuka
  return harga - (harga * persen) / 100;
}
console.log(hitungDiskon(100_000, 10));         // 90000`, 'js'),
      code('Debugging Node.js dengan DevTools yang sama', `node --inspect-brk src/server.js        # berhenti di baris pertama; buka chrome://inspect → "inspect"
node --inspect src/server.js            # tanpa berhenti; pasang breakpoint lalu picu request
node --enable-source-maps dist/index.js # stack trace menunjuk ke baris .ts asli, bukan hasil kompilasi
# VS Code: Command Palette → "JavaScript Debug Terminal", lalu jalankan npm run dev seperti biasa`, 'bash'),
      table(['Jenis breakpoint (Chrome DevTools)', 'Cara memasang', 'Kapan dipakai'], [
        ['Line-of-code', 'Panel Sources → klik nomor baris', 'Menelusuri alur langkah demi langkah (Step over/into/out)'],
        ['Conditional', 'Klik kanan nomor baris → *Add conditional breakpoint*, mis. `t.jumlah < 0`', 'Bug hanya muncul di satu dari ribuan iterasi'],
        ['Logpoint', 'Klik kanan → *Add logpoint*, mis. `\'t =\', t`', '`console.log` tanpa mengubah dan me-reload kode'],
        ['DOM change', 'Elements → klik kanan elemen → *Break on* → subtree/attribute modifications', '"Siapa yang mengubah atau menghapus elemen ini?"'],
        ['XHR/fetch', 'Sources → *XHR/fetch Breakpoints* → URL mengandung `/api/`', 'Mencari kode yang mengirim request tertentu'],
        ['Event listener', 'Sources → *Event Listener Breakpoints* → Mouse → click', 'Tidak tahu handler mana yang berjalan saat klik'],
        ['Exception', 'Panel Breakpoints → centang *Pause on uncaught* / *caught exceptions*', 'Error yang ditelan `catch` kosong di suatu tempat'],
      ]),
      callout('warn', 'Jangan menelan error', '`catch {}` kosong atau `catch (e) { console.log(e) }` lalu lanjut seolah berhasil membuat bug tidak terlihat dan data rusak menjalar. Tangkap hanya error yang benar-benar bisa Anda tangani (mis. `ValidasiError` → tampilkan pesan form), **lempar ulang** sisanya, dan bila membungkus, sertakan `{ cause: err }` agar stack trace asli tidak hilang.'),
      callout('tip', 'Nilai yang di-throw tidak selalu Error', 'JavaScript mengizinkan `throw \'teks\'` atau `throw { kode: 1 }`, sehingga di TypeScript variabel `catch (err)` bertipe `unknown`. Normalisasi di satu tempat: `const e = err instanceof Error ? err : new Error(String(err));`. Untuk error dari iframe/realm lain, `instanceof` bisa gagal; `Error.isError(err)` (ES2026) memeriksanya dengan benar di engine yang sudah mendukung.'),
      ...quiz([
        ['JSA-01', 'Mengapa `try { simpan(); } catch {}` di dalam fungsi async tidak menangkap error dari `simpan()` yang async?', '`simpan()` langsung mengembalikan Promise dan baris itu selesai tanpa melempar apa pun. Rejection terjadi belakangan, setelah blok `try` ditinggalkan, sehingga menjadi unhandled rejection. Tambahkan `await` (atau `return await` bila hasilnya dikembalikan) agar rejection berubah menjadi exception di dalam blok `try`.'],
        ['JSA-02', 'Apa keuntungan `throw new AppError(\'Konfigurasi rusak\', { cause: err })` dibanding `throw new Error(\'Konfigurasi rusak: \' + err.message)`?', 'Error asli tetap utuh sebagai objek di `err.cause`: jenisnya (`SyntaxError`), stack trace aslinya, dan properti tambahannya. Kode pemanggil bisa memeriksa `err.cause instanceof ...`, dan DevTools/Node/layanan monitoring menampilkan rantai cause. Menggabungkan string hanya menyisakan teks dan membuang stack trace asli.'],
        ['JSA-03', 'Total di laporan salah hanya untuk satu transaksi di antara 10.000. Breakpoint apa yang paling efisien?', 'Conditional breakpoint di dalam loop dengan kondisi yang mencirikan data bermasalah (mis. `t.id === 8123` atau `Number.isNaN(t.jumlah)`), sehingga eksekusi hanya berhenti saat kasus itu terjadi. Alternatifnya logpoint untuk mencetak nilai tanpa berhenti, lalu persempit dari outputnya.'],
      ]),
      ...practice('jsa-error-debugging', [
        'Buat hierarki `AppError` → `ValidasiError`, `HttpError`, `KursError` di satu modul `errors.js`, lalu tulis fungsi `pesanUntukPengguna(err)` yang memetakan tiap jenis ke pesan bahasa Indonesia dan melempar ulang error yang tidak dikenal.',
        'Bungkus `fetch` dalam `ambilJson(url)` yang melempar `HttpError` untuk status non-2xx dan `AppError` dengan `cause` untuk JSON rusak; uji dengan URL 404 dan endpoint yang mengembalikan HTML.',
        'Pasang handler `unhandledrejection` (browser) atau `unhandledRejection` (Node), lalu sengaja buat satu Promise tanpa `await` dan pastikan handler-nya mencatat error.',
        'Di DevTools, praktikkan masing-masing: conditional breakpoint, logpoint, DOM change breakpoint, dan *Pause on caught exceptions*, pada proyek pencatat pengeluaran Anda.',
      ]),
      references(
        ['MDN: Error', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error'],
        ['MDN: Error: cause', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause'],
        ['MDN: unhandledrejection event', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event'],
        ['Chrome DevTools: Pause your code with breakpoints', 'https://developer.chrome.com/docs/devtools/javascript/breakpoints'],
        ['Node.js: Debugging', 'https://nodejs.org/en/learn/getting-started/debugging'],
      ),
    ],
  },
  {
    id: 'jsa-regex-intl-tanggal',
    title: 'JavaScript: Regex, String, Intl & Tanggal',
    summary: 'RegExp dengan flag, named group, dan lookaround; format Rupiah dan tanggal id-ID dengan Intl; jebakan Date; dan status Temporal.',
    track: JS_ADV, source: jsAdvancedSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Aplikasi untuk pengguna Indonesia selalu bertemu teks yang "berantakan": nomor HP `0812-...` atau `+62...`, mutasi rekening, nominal `Rp150.000`, dan tanggal `02/11/2026`. **Regular expression** dipakai untuk memvalidasi dan mengekstrak bagian teks, **Intl** untuk menampilkan angka, uang, dan tanggal sesuai lokal tanpa library tambahan, sedangkan objek `Date` punya beberapa jebakan yang perlu dihafal sampai **Temporal** tersedia di semua runtime.'),
      code('RegExp: flag, named group, dan lookaround', `// Flag: g (semua), i (abaikan besar/kecil), m (^ $ per baris), s (. cocok \\n), u (Unicode), y (sticky), d (indeks), v (unicodeSets)
const reHp = /^(?:\\+62|62|0)(8\\d{8,11})$/;
console.log(reHp.test('081234567890'), reHp.test('+6281234567890'), reHp.test('0212345678')); // true true false

// Normalisasi nomor HP ke format +62 (E.164)
const normalHp = (s) => s.replace(/[\\s-]/g, '').replace(reHp, '+62$1');
console.log(normalHp('0812-3456-7890'));               // +6281234567890

// Named capture group: hasil dibaca lewat nama, bukan indeks
const reTanggal = /(?<hari>\\d{2})\\/(?<bulan>\\d{2})\\/(?<tahun>\\d{4})/;
const { hari, bulan, tahun } = '02/11/2026'.match(reTanggal).groups;
console.log(\`\${tahun}-\${bulan}-\${hari}\`);              // 2026-11-02
console.log('02/11/2026'.replace(reTanggal, '$<tahun>-$<bulan>-$<hari>')); // 2026-11-02

// matchAll + flag g: semua kecocokan beserta group-nya
const mutasi = 'TRF 150.000 ke Sari; TRF 75.500 ke Budi; TARIK 500.000';
for (const m of mutasi.matchAll(/TRF (?<nominal>[\\d.]+) ke (?<nama>\\w+)/g)) {
  console.log(m.groups.nama, Number(m.groups.nominal.replaceAll('.', ''))); // Sari 150000, lalu Budi 75500
}

// Lookahead (?=...) dan lookbehind (?<=...): syarat yang tidak ikut "dimakan"
const kuat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;   // ada huruf kecil, besar, angka; minimal 8
console.log(kuat.test('Rahasia123'), kuat.test('rahasia123')); // true false
console.log('Total Rp150.000, ongkir Rp12.000'.match(/(?<=Rp)[\\d.]+/g)); // [ '150.000', '12.000' ]

// Input pengguna sebagai pola WAJIB di-escape: RegExp.escape (ES2026) atau fallback manual
const escape = RegExp.escape ?? ((s) => s.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'));
const kata = 'Rp. 5.000 (promo)';
console.log(new RegExp(escape(kata), 'i').test('harga rp. 5.000 (promo) hari ini')); // true`, 'js'),
      code('Intl: format Rupiah, angka, dan tanggal id-ID', `// Buat formatter SEKALI lalu pakai ulang: pembuatan Intl.* relatif mahal
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
console.log(rupiah.format(1_250_000));                                      // Rp 1.250.000
console.log(new Intl.NumberFormat('id-ID').format(1234567.891));            // 1.234.567,891
console.log(new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(1_500_000)); // 1,5 jt
console.log(new Intl.NumberFormat('id-ID', { style: 'percent', maximumFractionDigits: 1 }).format(0.115)); // 11,5%
console.log(new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD' }).format(12.5));        // US$12,50

// formatToParts: kendalikan tampilan per bagian (mis. simbol mata uang diberi gaya lain)
console.log(rupiah.formatToParts(54_000).map((p) => \`\${p.type}:\${p.value}\`).join(' | '));
// currency:Rp | literal:  | integer:54 | group:. | integer:000   ← literal adalah U+00A0 (non-breaking space)

const waktu = new Date('2026-11-02T10:30:00+07:00');
const tgl = (opsi) => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...opsi }).format(waktu);
console.log(tgl({ dateStyle: 'full' }));                        // Senin, 02 November 2026
console.log(tgl({ dateStyle: 'medium', timeStyle: 'short' }));  // 2 Nov 2026, 10.30
console.log(tgl({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));
// Senin, 2 November 2026 pukul 10.30 WIB
console.log(new Intl.DateTimeFormat('id-ID', { timeStyle: 'short', timeZone: 'Asia/Makassar' }).format(waktu)); // 11.30 (WITA)

const relatif = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
console.log(relatif.format(-1, 'day'), '|', relatif.format(2, 'day'), '|', relatif.format(-3, 'hour')); // kemarin | lusa | 3 jam yang lalu
console.log(new Intl.ListFormat('id', { type: 'conjunction' }).format(['kopi', 'teh', 'susu']));       // kopi, teh, dan susu

// Mengurutkan teks sesuai aturan bahasa, bukan urutan kode Unicode
const nama = ['bayu', 'Budi', 'ani', 'Citra'];
console.log(nama.toSorted());                                   // [ 'Budi', 'Citra', 'ani', 'bayu' ] ← huruf besar duluan
console.log(nama.toSorted(new Intl.Collator('id').compare));    // [ 'ani', 'bayu', 'Budi', 'Citra' ]`, 'js'),
      code('Jebakan Date yang paling sering memakan korban', `// 1) Bulan dimulai dari 0, hari dalam minggu dari Minggu = 0
const d1 = new Date(2026, 10, 2);                    // 2 NOVEMBER 2026 (10 = November)
console.log(d1.getMonth(), d1.getDay());             // 10 1 (Senin)

// 2) "YYYY-MM-DD" saja diparse sebagai UTC; dengan jam tanpa offset → waktu LOKAL perangkat
const a = new Date('2026-11-02');                    // 2026-11-02T00:00Z = 07.00 WIB
const b = new Date('2026-11-02T00:00');              // tengah malam waktu lokal
console.log(a.getTime() === b.getTime());            // false di zona waktu selain UTC

// 3) toISOString selalu UTC: tanggal bisa mundur sehari untuk pengguna di Indonesia
const dini = new Date('2026-11-02T03:00:00+07:00');  // jam 3 pagi WIB
console.log(dini.toISOString().slice(0, 10));        // 2026-11-01  ← bukan tanggal lokal!
console.log(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(dini)); // 2026-11-02 (en-CA = YYYY-MM-DD)

// 4) Date bisa dimutasi dan "meluap" diam-diam
const tagihan = new Date(2026, 0, 31);               // 31 Januari
tagihan.setMonth(1);                                 // "31 Februari" → meluap ke 3 Maret
console.log(tagihan.toDateString());                 // Tue Mar 03 2026

// 5) Tanggal tidak valid TIDAK melempar error
const rusak = new Date('31/12/2026');
console.log(Number.isNaN(rusak.getTime()));          // true — selalu cek sebelum dipakai

// 6) Selisih hari kalender: bandingkan tengah malam UTC agar jam dan DST tidak mengacaukan
const hariAntara = (x, y) =>
  Math.round((Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()) - Date.UTC(x.getFullYear(), x.getMonth(), x.getDate())) / 86_400_000);
console.log(hariAntara(new Date(2026, 0, 1), new Date(2026, 10, 2))); // 305`, 'js'),
      code('Temporal: API tanggal modern (ES2027)', `// Temporal sudah Stage 4 dan dijadwalkan masuk ES2027, tetapi belum tersedia di semua browser/runtime.
// Deteksi fitur, lalu fallback ke polyfill:  npm install temporal-polyfill
const Temporal = globalThis.Temporal ?? (await import('temporal-polyfill')).Temporal;

const hariIni = Temporal.Now.plainDateISO('Asia/Jakarta');          // tanggal saja, tanpa jam & zona
const jatuhTempo = Temporal.PlainDate.from('2026-01-31').add({ months: 1 });
console.log(jatuhTempo.toString());                                  // 2026-02-28 — dijepit ke akhir bulan, tidak meluap

const rapat = Temporal.ZonedDateTime.from('2026-11-02T10:30[Asia/Jakarta]');
console.log(rapat.withTimeZone('Asia/Jayapura').toString());         // 2026-11-02T12:30:00+09:00[Asia/Jayapura]
console.log(rapat.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }));

const sisa = hariIni.until(Temporal.PlainDate.from('2026-12-25'), { largestUnit: 'day' });
console.log(sisa.days, 'hari menuju 25 Desember');
// Semua objek Temporal immutable: add/with/withTimeZone selalu mengembalikan objek baru`, 'js'),
      table(['Kebutuhan', 'Gunakan', 'Catatan'], [
        ['Validasi format (HP, kode pos, NIK)', 'RegExp dengan jangkar `^...$`', 'Tanpa `^ $`, `/\\d{5}/` juga cocok dengan `abc123456`'],
        ['Ekstraksi bagian teks', 'Named group + `matchAll`', '`matchAll` mewajibkan flag `g`'],
        ['Format uang & angka', '`Intl.NumberFormat` (dibuat sekali)', 'Simpan uang sebagai integer, format saat tampil'],
        ['Format tanggal untuk tampilan', '`Intl.DateTimeFormat` + `timeZone` eksplisit', 'Tanpa `timeZone`, hasil bergantung zona perangkat'],
        ['"3 jam yang lalu", "kemarin"', '`Intl.RelativeTimeFormat`', '`numeric: \'auto\'` menghasilkan kata seperti "kemarin"'],
        ['Mengurutkan nama', '`Intl.Collator` / `localeCompare`', '`sort()` default membandingkan kode Unicode'],
        ['Aritmetika tanggal & zona waktu', 'Temporal (native atau polyfill), atau date-fns', 'Hindari `setMonth`/`setDate` manual untuk logika bisnis'],
        ['Simpan & kirim ke API', 'String ISO 8601 (`toISOString()`) atau epoch ms', 'Konversi ke zona pengguna hanya saat ditampilkan'],
      ]),
      callout('warn', 'Jangan uji string Intl dengan spasi biasa', 'Output `Intl` memakai karakter khusus seperti non-breaking space (U+00A0) dan detailnya bisa berubah mengikuti versi data CLDR di browser/Node (mis. `Rp 54.000` vs `Rp 54.000,00` pada engine lama bila `maximumFractionDigits` tidak diset). Di unit test, bandingkan dengan output formatter yang sama atau normalisasi `\\u00a0` menjadi spasi biasa.'),
      callout('tip', 'Regex yang aman dan bisa dirawat', 'Hindari pola bersarang seperti `/(a+)+$/` pada input pengguna: kombinasi tertentu memicu *catastrophic backtracking* (ReDoS) yang membekukan thread. Untuk email, cukup `<input type="email">` + verifikasi lewat link konfirmasi; regex "sempurna" untuk email tidak ada. Pola panjang lebih mudah dibaca bila dipecah ke beberapa langkah atau diberi komentar.'),
      ...quiz([
        ['JSA-04', 'Pengguna di Jakarta memilih tanggal `2026-11-02` dan Anda membuat `new Date(\'2026-11-02\')`. Saat ditampilkan, jamnya 07.00. Mengapa?', 'String berformat tanggal saja (tanpa jam) diparse sebagai tengah malam **UTC**, yaitu pukul 07.00 WIB. Sebaliknya `new Date(\'2026-11-02T00:00\')` diparse sebagai waktu lokal. Untuk tanggal kalender tanpa jam, simpan sebagai string `YYYY-MM-DD` atau pakai `Temporal.PlainDate`, dan hanya ubah ke `Date` bila memang butuh momen waktu.'],
        ['JSA-05', 'Test `expect(rupiah(54000)).toBe(\'Rp 54.000\')` gagal padahal teksnya terlihat sama. Apa penyebabnya?', 'Spasi antara `Rp` dan angka adalah non-breaking space (U+00A0), bukan spasi biasa (U+0020). Bandingkan dengan `\'Rp\\u00a054.000\'`, normalisasi dengan `.replace(/\\u00a0/g, \' \')`, atau lebih baik uji logika perhitungannya dan biarkan format diuji dengan formatter yang sama.'],
        ['JSA-06', 'Mengapa aturan password "ada huruf kecil, besar, dan angka" ditulis dengan beberapa lookahead `(?=...)`?', 'Lookahead memeriksa syarat dari posisi yang sama tanpa mengonsumsi karakter, sehingga setiap syarat dicek terhadap seluruh string dalam urutan apa pun. Tanpa lookahead Anda harus menulis semua permutasi urutan (kecil-besar-angka, besar-angka-kecil, ...). Sering kali lebih terbaca lagi bila dipecah menjadi beberapa `test()` terpisah dengan pesan error masing-masing.'],
      ]),
      ...practice('jsa-regex-intl', [
        'Tulis `normalisasiHp(input)` yang menerima `0812 3456 7890`, `+62-812-3456-7890`, dan `6281234567890`, mengembalikan format `+62...`, dan melempar `ValidasiError` untuk nomor tidak valid; uji minimal 8 kasus.',
        'Parse 5 baris mutasi rekening contoh dengan named group (tanggal, jenis, nominal, keterangan) menjadi array objek, nominal sebagai integer.',
        'Buat modul `format.js` berisi `rupiah`, `ringkas` (compact), `tanggalPanjang`, dan `relatif(date)` ("kemarin", "3 jam yang lalu") yang semuanya memakai formatter yang dibuat sekali.',
        'Tunjukkan bug `toISOString().slice(0, 10)` pada jam 03.00 WIB, lalu perbaiki dengan `Intl.DateTimeFormat(\'en-CA\', { timeZone })` dan dengan `Temporal.PlainDate` (polyfill).',
      ]),
      references(
        ['MDN: Regular expressions', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions'],
        ['MDN: Intl', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl'],
        ['MDN: Date', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'],
        ['MDN: Temporal', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal'],
        ['TC39: Temporal documentation', 'https://tc39.es/proposal-temporal/docs/'],
      ),
    ],
  },
  {
    id: 'jsa-iterator-generator-proxy',
    title: 'JavaScript: Iterator, Generator, Symbol, Proxy & Reflect',
    summary: 'Protokol iterasi, generator dan async generator, iterator helpers, well-known Symbol, Proxy & Reflect untuk metaprogramming, serta WeakMap dan WeakRef.',
    track: JS_ADV, source: jsAdvancedSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Fitur di pelajaran ini jarang ditulis langsung di kode aplikasi sehari-hari, tetapi menjadi **mesin** di balik hal yang Anda pakai setiap hari: `for...of` dan spread berjalan di atas protokol iterasi, reaktivitas Vue 3 dan Immer dibangun dengan `Proxy`, stream Node.js bisa dibaca dengan `for await`, dan cache tanpa kebocoran memori memakai `WeakMap`. Memahaminya membuat Anda bisa membaca kode library dan menulis abstraksi yang terasa "bawaan bahasa".'),
      code('Protokol iterasi dan Symbol.iterator', `// Iterable = objek dengan method [Symbol.iterator]() yang mengembalikan iterator { next() }
class Rentang {
  constructor(awal, akhir, langkah = 1) {
    Object.assign(this, { awal, akhir, langkah });
  }

  [Symbol.iterator]() {
    let nilai = this.awal;
    const { akhir, langkah } = this;
    return {
      next() {
        if (nilai > akhir) return { value: undefined, done: true };
        const sekarang = nilai;
        nilai += langkah;
        return { value: sekarang, done: false };
      },
    };
  }
}

for (const n of new Rentang(1, 3)) console.log(n);      // 1 2 3
console.log([...new Rentang(0, 10, 5)]);                // [ 0, 5, 10 ]
console.log(Math.max(...new Rentang(1, 4)));            // 4
console.log(Array.from(new Rentang(1, 3), (n) => n * n)); // [ 1, 4, 9 ]
const [pertama, kedua] = new Rentang(10, 100, 10);       // destructuring juga memakai iterator
console.log(pertama, kedua);                             // 10 20

// Di balik layar: for...of memanggil next() sampai done: true
const it = ['a', 'b'][Symbol.iterator]();
console.log(it.next(), it.next(), it.next());
// { value: 'a', done: false } { value: 'b', done: false } { value: undefined, done: true }`, 'js'),
      code('Generator, deret lazy, dan iterator helpers', `// function*: fungsi yang bisa berhenti sejenak di setiap yield dan dilanjutkan nanti
function* idGenerator(prefix) {
  let n = 1;
  while (true) yield \`\${prefix}-\${String(n++).padStart(4, '0')}\`; // tak terbatas, tetapi lazy
}
const idInvoice = idGenerator('INV');
console.log(idInvoice.next().value, idInvoice.next().value); // INV-0001 INV-0002

// Generator membuat class iterable jauh lebih ringkas
class Keranjang {
  #items = [];
  tambah(item) {
    this.#items.push(item);
    return this;
  }
  *[Symbol.iterator]() {
    yield* this.#items;                                   // yield* mendelegasikan ke iterable lain
  }
}
const k = new Keranjang().tambah({ nama: 'kopi', harga: 18_000 }).tambah({ nama: 'roti', harga: 12_000 });
console.log([...k].map((i) => i.nama));                   // [ 'kopi', 'roti' ]

// Iterator helpers (ES2025): map/filter/take/drop/toArray langsung pada iterator, tetap lazy
function* bilanganAsli() {
  let n = 1;
  while (true) yield n++;
}
const limaKuadratGenap = bilanganAsli()
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(5)                                                // tanpa take, deret tak terbatas ini tidak akan selesai
  .toArray();
console.log(limaKuadratGenap);                            // [ 4, 16, 36, 64, 100 ]
console.log(Iterator.from(new Map([['a', 1], ['b', 2]]).keys()).map((key) => key.toUpperCase()).toArray()); // [ 'A', 'B' ]

// Komunikasi dua arah: argumen next(x) menjadi hasil ekspresi yield
function* akumulator() {
  let total = 0;
  while (true) total += yield total;
}
const acc = akumulator();
acc.next();                                               // jalankan sampai yield pertama
console.log(acc.next(5).value, acc.next(10).value);       // 5 15`, 'js'),
      code('Async generator: paginasi API dengan for await', `async function* semuaPost(batas = 10) {
  for (let halaman = 1; ; halaman++) {
    const res = await fetch(\`https://jsonplaceholder.typicode.com/posts?_page=\${halaman}&_limit=\${batas}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();
    if (data.length === 0) return;                        // tidak ada halaman lagi
    yield* data;                                          // keluarkan item satu per satu
  }
}

// Pemanggil tidak perlu tahu soal halaman; break menutup generator sehingga fetch berikutnya tidak dikirim
let ditemukan = 0;
for await (const post of semuaPost()) {
  if (post.userId !== 3) continue;
  console.log(post.id, post.title.slice(0, 30));
  if (++ditemukan === 3) break;
}
// Pola yang sama: for await (const chunk of fs.createReadStream('besar.csv')) di Node.js`, 'js'),
      code('Well-known Symbol, Proxy & Reflect', `// Well-known Symbol: kait ke perilaku bawaan bahasa
class Uang {
  constructor(nominal) {
    this.nominal = nominal;
  }
  [Symbol.toPrimitive](hint) {                            // dipanggil saat dikonversi ke primitif
    return hint === 'number' ? this.nominal : \`Rp\${this.nominal.toLocaleString('id-ID')}\`;
  }
  get [Symbol.toStringTag]() {
    return 'Uang';
  }
}
const harga = new Uang(25_000);
console.log(+harga, \`\${harga}\`, Object.prototype.toString.call(harga)); // 25000 Rp25.000 [object Uang]

// Proxy: mencegat operasi pada objek (get, set, has, deleteProperty, ...)
function denganSkema(target, skema) {
  return new Proxy(target, {
    set(obj, prop, nilai, receiver) {
      const cek = skema[prop];
      if (!cek) throw new TypeError(\`Properti "\${String(prop)}" tidak dikenal\`);
      if (!cek(nilai)) throw new TypeError(\`Nilai \${JSON.stringify(nilai)} tidak valid untuk "\${String(prop)}"\`);
      return Reflect.set(obj, prop, nilai, receiver);    // Reflect: jalankan perilaku default
    },
  });
}
const produk = denganSkema({}, { nama: (v) => typeof v === 'string', stok: Number.isInteger });
produk.nama = 'Kopi';
produk.stok = 10;
try { produk.stok = 2.5; } catch (e) { console.log(e.message); }  // Nilai 2.5 tidak valid untuk "stok"
try { produk.harga = 1; } catch (e) { console.log(e.message); }   // Properti "harga" tidak dikenal

// Reaktivitas mini ala Vue: jalankan efek setiap kali properti berubah
function reaktif(obj, onUbah) {
  return new Proxy(obj, {
    set(target, prop, nilai, receiver) {
      const lama = target[prop];
      const ok = Reflect.set(target, prop, nilai, receiver);
      if (ok && !Object.is(lama, nilai)) onUbah(prop, lama, nilai);
      return ok;
    },
  });
}
const state = reaktif({ jumlah: 0 }, (p, lama, baru) => console.log(\`\${String(p)}: \${lama} → \${baru}\`));
state.jumlah++;                                           // jumlah: 0 → 1
state.jumlah = 1;                                         // tidak memicu efek (nilai sama)`, 'js'),
      code('WeakMap, WeakRef & FinalizationRegistry', `// WeakMap: kunci berupa objek dan TIDAK menahan objek itu dari garbage collector
const cacheTotal = new WeakMap();
function totalKeranjang(keranjang) {
  if (!cacheTotal.has(keranjang)) {
    console.log('menghitung...');
    cacheTotal.set(keranjang, keranjang.items.reduce((a, i) => a + i.harga * i.qty, 0));
  }
  return cacheTotal.get(keranjang);
}
const kr = Object.freeze({ items: [{ harga: 18_000, qty: 2 }] }); // cache aman karena data immutable
console.log(totalKeranjang(kr), totalKeranjang(kr));      // menghitung... (sekali) lalu 36000 36000
// Saat kr tidak direferensikan lagi, entri cache ikut bisa dibersihkan: tidak ada kebocoran memori.
// Dengan Map biasa, kr akan hidup selamanya selama cache masih ada.

// WeakRef: referensi yang boleh "hilang" — hanya untuk cache opsional
let gambarBesar = { piksel: new Uint8Array(10_000_000) };
const ref = new WeakRef(gambarBesar);
gambarBesar = null;                                       // kini hanya WeakRef yang menunjuk
const masihAda = ref.deref();                             // objeknya, atau undefined bila sudah dikoleksi GC
console.log(masihAda ? 'masih di memori' : 'sudah dibersihkan GC');

// FinalizationRegistry: callback MUNGKIN dipanggil setelah objek dikoleksi — kapan pun, atau tidak sama sekali
const registry = new FinalizationRegistry((label) => console.log('dibersihkan:', label));
registry.register({ data: 'sementara' }, 'objek-sementara');`, 'js'),
      table(['Fitur', 'Dipakai di dunia nyata', 'Hati-hati'], [
        ['Protokol iterasi', '`for...of`, spread, `Array.from`, destructuring, `Map`/`Set`', 'Iterator sekali pakai: setelah habis harus dibuat ulang'],
        ['Generator', 'ID sequence, class iterable, deret lazy, Redux-Saga', '`return`/`break` menutup generator; blok `finally` di dalamnya tetap dijalankan'],
        ['Async generator', 'Paginasi API, stream Node.js (`for await`)', 'Item diproses berurutan; untuk paralel tetap pakai `Promise.all`'],
        ['Iterator helpers (ES2025)', 'Transformasi lazy pada `Map.keys()`, generator, `Iterator.from`', 'Tersedia di browser modern & Node 22+; cek target lama'],
        ['Proxy + Reflect', 'Vue 3 reactivity, Immer, MobX, validasi, mock di test', '`proxy !== target`; ada overhead; method dengan `#private` gagal lewat proxy'],
        ['WeakMap / WeakSet', 'Metadata per elemen DOM, cache per objek, data privat', 'Tidak bisa di-iterasi dan tidak punya `size`'],
        ['WeakRef / FinalizationRegistry', 'Cache opsional untuk objek besar', 'Non-deterministik; jangan untuk logika penting (tutup koneksi, simpan data)'],
      ]),
      callout('warn', 'Proxy dan private field tidak akur', 'Bila objek punya `#field`, memanggil method lewat proxy membuat `this` menunjuk ke proxy, bukan objek asli, sehingga akses `this.#field` melempar `TypeError`. Solusinya trap `get` yang mengikat method ke target (`Reflect.get(...).bind(target)`), atau hindari Proxy untuk class dengan private field. Ini juga alasan Vue menyarankan `markRaw` untuk instance class tertentu.'),
      callout('tip', 'Kapan menulis iterator sendiri', 'Tulis `*[Symbol.iterator]()` ketika struktur data Anda (keranjang, pohon kategori, daftar berhalaman) perlu di-loop oleh pemakainya tanpa membocorkan array internal. Untuk data yang datang bertahap dari jaringan, async generator memberi pemanggil kendali penuh: berhenti kapan saja dengan `break`.'),
      ...quiz([
        ['JSA-07', 'Mengapa `bilanganAsli().filter(...).map(...).take(5).toArray()` selesai, padahal `bilanganAsli` tak terbatas?', 'Iterator helpers bersifat lazy: tidak ada yang dihitung sampai `toArray()` meminta nilai. `take(5)` berhenti meminta setelah lima nilai lolos filter, lalu menutup iterator sumber. Bandingkan dengan method array yang eager: `Array.from(bilanganAsli())` akan berjalan selamanya.'],
        ['JSA-08', 'Di trap `set`, mengapa memakai `Reflect.set(obj, prop, nilai, receiver)` alih-alih `obj[prop] = nilai; return true`?', '`Reflect.set` menjalankan perilaku default secara persis: menghormati setter dan pewarisan (dengan `receiver` yang benar), serta mengembalikan `false` bila properti read-only atau objek dibekukan. Mengembalikan `true` begitu saja bisa menyembunyikan kegagalan; di strict mode, trap yang mengembalikan `false` membuat assignment melempar `TypeError` sesuai harapan.'],
        ['JSA-09', 'Anda menyimpan data tambahan per elemen DOM di `new Map()`. Elemen sering dihapus dan dibuat ulang. Apa risikonya?', 'Map menyimpan referensi kuat ke elemen sebagai kunci, sehingga elemen yang sudah dihapus dari DOM tidak pernah dibersihkan garbage collector: memory leak yang terus tumbuh. Gunakan `WeakMap`, yang entrinya otomatis bisa dibersihkan saat elemen tidak lagi direferensikan di tempat lain.'],
      ]),
      ...practice('jsa-iterator-proxy', [
        'Buat class `PohonKategori` (kategori bersarang) dengan `*[Symbol.iterator]()` yang menelusuri semua node secara depth-first memakai `yield*` rekursif.',
        'Tulis async generator `semuaHalaman(urlDasar)` yang mengikuti paginasi sampai habis, lalu ambil 15 item pertama dengan `for await` + `break` dan pastikan tidak ada request berlebih di tab Network.',
        'Buat `reaktif(obj, efek)` yang juga menangani objek bersarang (proxy dibuat saat properti dibaca) dan trap `deleteProperty`.',
        'Implementasikan `memoPerObjek(fn)` berbasis WeakMap dan buktikan dengan DevTools Memory (heap snapshot) bahwa objek yang dilepas tidak tertahan.',
      ]),
      references(
        ['MDN: Iteration protocols', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols'],
        ['MDN: function*', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*'],
        ['MDN: Iterator (helpers)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator'],
        ['MDN: Proxy', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy'],
        ['MDN: Reflect', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect'],
        ['MDN: WeakRef', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef'],
      ),
    ],
  },
  {
    id: 'jsa-dom-web-api',
    title: 'JavaScript: DOM & Web API Lanjutan',
    summary: 'Fase event dan delegation, listener yang bisa dibersihkan, fetch tanpa race condition dengan AbortController, FormData, IntersectionObserver, serta localStorage vs IndexedDB.',
    track: JS_ADV, source: jsAdvancedSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Di JavaScript Dasar Anda sudah memasang listener, memakai event delegation sederhana, dan memanggil `fetch`. Aplikasi nyata menuntut lebih: listener yang **dibersihkan** saat modal ditutup, hasil pencarian lama yang tidak menimpa hasil baru (*race condition*), form dengan file, daftar panjang yang dimuat saat di-scroll, dan data offline yang lebih besar dari kemampuan `localStorage`. Semua bisa dilakukan dengan Web API bawaan browser, tanpa framework.'),
      code('Fase event dan opsi listener', `// HTML: <div id="kartu"><button id="beli">Beli</button></div>
const kartu = document.querySelector('#kartu');
const beli = document.querySelector('#beli');

kartu.addEventListener('click', () => console.log('1. kartu (capture, turun)'), { capture: true });
beli.addEventListener('click', () => console.log('2. tombol (target)'));
kartu.addEventListener('click', (e) => {
  console.log('3. kartu (bubble, naik)', e.target.id, e.currentTarget.id); // beli kartu
});
document.addEventListener('click', () => console.log('4. document (bubble)'));
// Klik tombol → 1, 2, 3, 4. e.stopPropagation() di langkah 2 menghentikan 3 dan 4.

// Opsi: once, passive, dan signal untuk melepas banyak listener sekaligus
const kontrolModal = new AbortController();
const tutupModal = () => {
  console.log('modal ditutup');
  kontrolModal.abort();                                   // SEMUA listener bertanda signal ini dilepas
};
window.addEventListener('keydown', (e) => e.key === 'Escape' && tutupModal(), { signal: kontrolModal.signal });
window.addEventListener('scroll', () => console.log(scrollY), { passive: true, signal: kontrolModal.signal });
beli.addEventListener('click', () => console.log('hanya sekali'), { once: true });
// Tanpa signal, removeEventListener butuh referensi fungsi yang SAMA persis dengan saat dipasang.`, 'js'),
      code('Event delegation untuk tabel dinamis dan custom event', `// Satu listener untuk ribuan baris, termasuk baris yang dirender belakangan
// <tr data-id="trx-1"><td>Kopi</td><td><button data-aksi="edit">Edit</button><button data-aksi="hapus">Hapus</button></td></tr>
const tabel = document.querySelector('#tabel-transaksi');

const aksi = {
  edit: (id) => console.log('edit', id),
  hapus: (id) => console.log('hapus', id),
};

tabel.addEventListener('click', (event) => {
  const tombol = event.target.closest('[data-aksi]');
  if (!tombol || !tabel.contains(tombol)) return;         // klik di luar tombol, atau di luar tabel
  const id = tombol.closest('tr[data-id]')?.dataset.id;
  aksi[tombol.dataset.aksi]?.(id);
});

// focus/blur tidak bubble; pasangannya yang bubble: focusin/focusout (juga mouseover vs mouseenter)
tabel.addEventListener('focusin', (e) => e.target.closest('tr')?.classList.add('aktif'));
tabel.addEventListener('focusout', (e) => e.target.closest('tr')?.classList.remove('aktif'));

// Custom event: bagian UI saling memberi kabar tanpa saling import
document.addEventListener('transaksi:berubah', (e) => console.log('total baru', e.detail.total));
tabel.dispatchEvent(new CustomEvent('transaksi:berubah', { detail: { total: 3 }, bubbles: true }));`, 'js'),
      code('Fetch + AbortController: pencarian tanpa race condition', `const input = document.querySelector('#cari');
const hasil = document.querySelector('#hasil');
let kontrolSebelumnya;

input.addEventListener('input', async () => {
  kontrolSebelumnya?.abort();                             // batalkan request lama: respons lambat tidak menimpa yang baru
  const kontrol = new AbortController();
  kontrolSebelumnya = kontrol;

  const q = input.value.trim();
  if (q.length < 2) return hasil.replaceChildren();

  // Batal bila pengguna mengetik lagi ATAU server lebih lama dari 5 detik
  const signal = AbortSignal.any([kontrol.signal, AbortSignal.timeout(5000)]);
  try {
    const url = new URL('https://jsonplaceholder.typicode.com/users');
    url.searchParams.set('q', q);                         // encoding karakter khusus otomatis
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const users = await res.json();
    hasil.replaceChildren(...users.map((u) => Object.assign(document.createElement('li'), { textContent: u.name })));
  } catch (err) {
    if (err.name === 'AbortError') return;                // dibatalkan sengaja: abaikan
    hasil.textContent = err.name === 'TimeoutError' ? 'Server terlalu lama merespons' : \`Gagal: \${err.message}\`;
  }
});`, 'js'),
      code('FormData: baca form, validasi, dan unggah file', `// Form berisi input name="ket", "jumlah", "kategori", checkbox "tags" (bisa lebih dari satu), dan file "foto"
const form = document.querySelector('#form-struk');
const inputJumlah = form.elements.jumlah;
inputJumlah.addEventListener('input', () => inputJumlah.setCustomValidity('')); // reset pesan saat diperbaiki

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fd = new FormData(form);

  const data = Object.fromEntries(fd);                    // { ket, jumlah, kategori, tags, foto } — hanya nilai TERAKHIR per nama
  const tags = fd.getAll('tags');                         // semua checkbox bernama "tags" yang dicentang
  const jumlah = Number(fd.get('jumlah'));                // nilai form selalu string (atau File)
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    inputJumlah.setCustomValidity('Jumlah harus bilangan bulat positif');
    form.reportValidity();                                // tampilkan pesan dengan UI bawaan browser
    return;
  }

  // multipart/form-data: JANGAN set header Content-Type manual — browser mengisi boundary
  fd.set('dibuatPada', new Date().toISOString());
  const res = await fetch('/api/struk', { method: 'POST', body: fd });
  console.log(res.status, data.ket, tags, data.foto instanceof File);

  // Untuk API JSON tanpa file:
  // await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, jumlah, tags }) });
});`, 'js'),
      code('IntersectionObserver: lazy load dan infinite scroll', `// 1) Lazy load: <img data-src="foto.jpg" alt="..."> (untuk gambar biasa, atribut loading="lazy" sudah cukup)
const lazy = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.src = entry.target.dataset.src;
    observer.unobserve(entry.target);                     // cukup sekali per gambar
  }
}, { rootMargin: '200px' });                              // mulai memuat 200px sebelum terlihat
document.querySelectorAll('img[data-src]').forEach((img) => lazy.observe(img));

// 2) Infinite scroll: amati elemen "sentinel" kosong di akhir daftar
const daftar = document.querySelector('#daftar');
const sentinel = document.querySelector('#sentinel');
let halaman = 1;
let memuat = false;

const infinite = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting || memuat) return;
  memuat = true;
  try {
    const res = await fetch(\`https://jsonplaceholder.typicode.com/posts?_page=\${halaman}&_limit=20\`);
    const posts = await res.json();
    if (posts.length === 0) return infinite.disconnect();  // data habis: berhenti mengamati
    halaman++;
    daftar.append(...posts.map((p) => Object.assign(document.createElement('li'), { textContent: p.title })));
  } finally {
    memuat = false;
  }
});
infinite.observe(sentinel);`, 'js'),
      code('localStorage vs IndexedDB', `// localStorage: sinkron, hanya string, kecil — cocok untuk preferensi
localStorage.setItem('tema', 'gelap');
const prefs = JSON.parse(localStorage.getItem('prefs') ?? '{}');   // objek wajib di-JSON-kan

// IndexedDB: asinkron, menyimpan objek (structured clone) termasuk Blob/File, punya indeks & transaksi
function bukaDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('pencatat', 1);
    req.onupgradeneeded = () => {                         // hanya saat database baru dibuat atau versi naik
      const store = req.result.createObjectStore('transaksi', { keyPath: 'id' });
      store.createIndex('perTanggal', 'tanggal');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function jalankan(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('transaksi', mode);
    const req = fn(tx.objectStore('transaksi'));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

const db = await bukaDb();
await jalankan(db, 'readwrite', (s) =>
  s.put({ id: crypto.randomUUID(), ket: 'Kopi', jumlah: 18_000, tanggal: '2026-11-02', struk: new Blob(['...']) }));
const bulanIni = await jalankan(db, 'readonly', (s) =>
  s.index('perTanggal').getAll(IDBKeyRange.bound('2026-11-01', '2026-11-30')));
console.log(prefs, bulanIni.length);
// Di proyek nyata, wrapper kecil seperti library "idb" membuat API ini jauh lebih nyaman.`, 'js'),
      table(['Aspek', 'localStorage', 'sessionStorage', 'IndexedDB', 'Cookie'], [
        ['API', 'Sinkron (memblok main thread)', 'Sinkron', 'Asinkron, berbasis transaksi', '`document.cookie` / header `Set-Cookie`'],
        ['Tipe data', 'String', 'String', 'Objek, array, Date, Blob, File, ArrayBuffer', 'String'],
        ['Kapasitas', 'Sekitar 5 MB per origin', 'Sekitar 5 MB per origin', 'Besar, mengikuti kuota disk browser', 'Sekitar 4 KB per cookie'],
        ['Umur data', 'Sampai dihapus', 'Sampai tab ditutup', 'Sampai dihapus (bisa dibersihkan saat disk penuh)', 'Sesuai `Expires`/`Max-Age`'],
        ['Dikirim ke server', 'Tidak', 'Tidak', 'Tidak', 'Ya, di setiap request ke domain itu'],
        ['Cocok untuk', 'Preferensi, draft kecil', 'State wizard per tab', 'Data offline, cache besar, file', 'Session ID (`HttpOnly`, `Secure`)'],
      ]),
      callout('warn', 'Jangan simpan token sensitif di localStorage', 'Semua skrip di halaman, termasuk skrip pihak ketiga atau hasil serangan XSS, bisa membaca `localStorage`. Untuk sesi login, cookie `HttpOnly; Secure; SameSite` lebih aman karena tidak bisa dibaca JavaScript. Pembahasan lengkap ada di [Web Security: XSS & CSRF](#web.sec-xss-csrf).'),
      callout('tip', 'Satu AbortController untuk satu siklus hidup', 'Pola yang rapi: buat satu `AbortController` saat komponen/modal dibuka, kirim `signal`-nya ke semua `addEventListener` dan `fetch`, lalu panggil `abort()` sekali saat ditutup. Listener terlepas dan request yang masih berjalan dibatalkan sekaligus, sama seperti fungsi cleanup di `useEffect` React.'),
      ...quiz([
        ['JSA-10', 'Dalam handler delegation di `<table>`, apa beda `event.target` dan `event.currentTarget`?', '`event.target` adalah elemen terdalam yang benar-benar diklik (bisa `<svg>` atau `<span>` di dalam tombol), sedangkan `event.currentTarget` adalah elemen tempat listener dipasang (tabel). Karena itu delegation memakai `event.target.closest(\'[data-aksi]\')` untuk naik dari target ke tombol yang dimaksud.'],
        ['JSA-11', 'Pengguna mengetik "ko" lalu "kopi". Respons "ko" datang belakangan dan menimpa hasil "kopi". Bagaimana mencegahnya?', 'Setiap kali input berubah, batalkan request sebelumnya dengan `AbortController.abort()` sebelum mengirim yang baru, dan abaikan `AbortError` di `catch`. Alternatif tanpa pembatalan: simpan nomor urut request dan hanya render respons dari request terakhir. Debounce mengurangi jumlah request tetapi tidak menghilangkan race condition.'],
        ['JSA-12', 'Mengapa unggahan file gagal di server saat Anda menulis `headers: { \'Content-Type\': \'multipart/form-data\' }` bersama `body: formData`?', 'Format multipart membutuhkan parameter `boundary` yang memisahkan setiap bagian, misalnya `multipart/form-data; boundary=----abc`. Browser membuat boundary dan header lengkap secara otomatis bila body berupa `FormData`. Menulis header manual menghapus boundary sehingga server tidak bisa mem-parse body. Jangan set Content-Type untuk FormData.'],
      ]),
      ...practice('jsa-dom-web-api', [
        'Buat modal yang memasang listener `keydown`, `click` di luar modal, dan `scroll` dengan satu `AbortController`; pastikan lewat DevTools (*Event Listeners* di panel Elements) bahwa semuanya hilang setelah modal ditutup.',
        'Buat kotak pencarian ke jsonplaceholder dengan debounce 300 ms, pembatalan request lama, `AbortSignal.timeout`, dan pesan berbeda untuk timeout vs gagal jaringan (uji dengan *Network throttling*).',
        'Buat daftar infinite scroll dengan IntersectionObserver, indikator "memuat...", dan berhenti otomatis saat data habis.',
        'Simpan transaksi beserta foto struk (`File` dari input) di IndexedDB, tampilkan kembali dengan `URL.createObjectURL`, lalu bandingkan dengan batasan bila memakai localStorage.',
      ]),
      references(
        ['MDN: Event bubbling', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling'],
        ['MDN: AbortSignal', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal'],
        ['MDN: FormData', 'https://developer.mozilla.org/en-US/docs/Web/API/FormData'],
        ['MDN: Intersection Observer API', 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API'],
        ['MDN: Using IndexedDB', 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB'],
        ['MDN: Storage quotas and eviction criteria', 'https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria'],
      ),
    ],
  },
  {
    id: 'jsa-tooling-modern',
    title: 'JavaScript: Tooling Modern — pnpm, Vite, ESLint & Monorepo',
    summary: 'npm vs pnpm, script package.json dan semver, Vite sebagai dev server & bundler, ESLint flat config + Prettier, serta monorepo dengan pnpm workspaces.',
    track: JS_ADV, source: jsAdvancedSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Kode yang sama bisa terasa menyenangkan atau menyiksa tergantung *tooling*-nya: instalasi yang lambat dan memakan disk, versi dependensi yang berubah diam-diam, format kode yang diperdebatkan di setiap review, dan build yang butuh konfigurasi ratusan baris. Pelajaran ini menyusun toolchain JavaScript modern yang umum dipakai di 2026: **pnpm** untuk dependensi, **Vite** untuk dev server dan build, **ESLint** (flat config) untuk menangkap bug, **Prettier** untuk format, dan **workspaces** untuk monorepo.'),
      table(['Aspek / tugas', 'npm', 'pnpm'], [
        ['Struktur `node_modules`', 'Datar (hoisted): paket yang tidak dideklarasikan pun bisa ter-import (*phantom dependency*)', 'Store global + symlink; hanya dependensi yang dideklarasikan yang bisa di-import'],
        ['Pemakaian disk', 'Salinan penuh per proyek', 'Satu salinan per versi di store global, di-hard-link ke proyek'],
        ['Lockfile', '`package-lock.json`', '`pnpm-lock.yaml`'],
        ['Skrip install dependensi (`postinstall`)', 'Dijalankan otomatis', 'Sejak pnpm 10 diblok secara default; izinkan per paket dengan `pnpm approve-builds`'],
        ['Pasang semua / tambah paket', '`npm install` / `npm install zod`', '`pnpm install` / `pnpm add zod`'],
        ['Dev dependency / hapus', '`npm install -D vitest` / `npm uninstall zod`', '`pnpm add -D vitest` / `pnpm remove zod`'],
        ['Jalankan script', '`npm run dev`', '`pnpm dev` (kata `run` boleh dihilangkan)'],
        ['Jalankan paket tanpa install', '`npx create-vite@latest`', '`pnpm dlx create-vite@latest` atau `pnpm create vite`'],
        ['Install persis sesuai lockfile (CI)', '`npm ci`', '`pnpm install --frozen-lockfile` (default di lingkungan CI)'],
        ['Kenapa paket X terpasang?', '`npm explain X`', '`pnpm why X`'],
      ]),
      code('Memasang pnpm dan memulai proyek Vite', `npm install -g pnpm              # atau "corepack enable pnpm" bila Corepack tersedia (tidak lagi dibundel sejak Node.js 25)
pnpm create vite pencatat --template vanilla-ts
cd pencatat
pnpm install
pnpm dev                         # dev server dengan hot module replacement di http://localhost:5173
pnpm build                       # bundel produksi ke dist/ (Vite 8 memakai bundler Rolldown)
pnpm preview                     # sajikan dist/ secara lokal untuk dicek sebelum deploy`, 'bash'),
      code('package.json: scripts dan rentang versi', `{
  "name": "@pencatat/web",
  "version": "1.4.2",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "check": "pnpm lint && pnpm format:check && pnpm test",
    "prebuild": "node scripts/cek-env.js"
  },
  "dependencies": {
    "zod": "^4.6.0",
    "date-fns": "~4.4.0",
    "chart.js": "4.6.1"
  },
  "devDependencies": {
    "eslint": "^10.14.0",
    "prettier": "^3.9.0",
    "typescript": "~6.0.2",
    "vite": "^8.3.0",
    "vitest": "^5.0.0"
  }
}`, 'json'),
      table(['Rentang', 'Artinya', 'Contoh yang boleh terpasang'], [
        ['`^4.6.0`', '`>=4.6.0 <5.0.0`: minor & patch baru boleh', '4.6.7, 4.9.0 — tidak 5.0.0'],
        ['`~4.4.0`', '`>=4.4.0 <4.5.0`: hanya patch', '4.4.3 — tidak 4.5.0'],
        ['`4.6.1`', 'Persis versi itu', 'Hanya 4.6.1'],
        ['`^0.4.2`', '`>=0.4.2 <0.5.0`: di versi 0.x, minor dianggap *breaking*', '0.4.9 — tidak 0.5.0'],
        ['`>=22` (di `engines`)', 'Batas bawah saja', 'Dipakai untuk versi Node, bukan dependensi'],
        ['`*` atau `latest`', 'Apa saja', 'Hindari: build bisa rusak tanpa perubahan kode'],
      ]),
      paragraph('Script dengan awalan `pre`/`post` (seperti `prebuild`) dijalankan otomatis oleh npm sebelum/sesudah script bernama sama; pnpm hanya menjalankannya bila opsi `enable-pre-post-scripts` diaktifkan, jadi lebih jelas menuliskan rangkaian eksplisit seperti `"build": "node scripts/cek-env.js && tsc --noEmit && vite build"`. Rentang versi hanya berlaku saat lockfile dibuat ulang; yang benar-benar terpasang selalu dikunci lockfile yang **wajib di-commit**.'),
      code('vite.config.js: proxy API, alias, dan env', `import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }, // import { x } from '@/lib/x'
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },  // dev: /api/* diteruskan ke backend, tanpa masalah CORS
  },
  build: { sourcemap: true },
});

// .env.local (jangan di-commit):   VITE_API_URL=https://api.contoh.id
// Di kode browser:                 import.meta.env.VITE_API_URL
// Hanya variabel berawalan VITE_ yang dikirim ke browser — jangan pernah menaruh secret di sana.`, 'js'),
      code('eslint.config.js (flat config) + Prettier', `// pnpm add -D eslint @eslint/js typescript-eslint globals prettier eslint-config-prettier
import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/']),
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },  // file yang berjalan di Node, bukan browser
  },
  prettier,                                       // TERAKHIR: matikan aturan gaya yang bentrok dengan Prettier
]);`, 'js'),
      code('.prettierrc.json', `{
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}`, 'json'),
      code('Monorepo: struktur dan pnpm-workspace.yaml', `pencatat/
├─ pnpm-workspace.yaml
├─ package.json            ← "private": true, script lintas paket
├─ pnpm-lock.yaml          ← SATU lockfile untuk seluruh repo
├─ apps/
│  ├─ web/                 ← Vite; bergantung pada @pencatat/shared
│  └─ api/                 ← Node.js/Express; juga bergantung pada @pencatat/shared
└─ packages/
   └─ shared/              ← tipe & skema Zod yang dipakai bersama`, 'text'),
      code('pnpm-workspace.yaml', `packages:
  - 'apps/*'
  - 'packages/*'

# Catalog: satu sumber versi untuk dependensi yang dipakai banyak paket
catalog:
  zod: ^4.6.0
  typescript: ~6.0.2`, 'yaml'),
      code('apps/web/package.json (sebagian) dan perintah workspace', `{
  "name": "@pencatat/web",
  "dependencies": {
    "@pencatat/shared": "workspace:*",
    "zod": "catalog:"
  }
}

# --- Perintah dari root repo ---
pnpm install                                   # sekali di root: paket workspace saling di-link otomatis
pnpm --filter @pencatat/web dev                # jalankan script di satu paket
pnpm --filter @pencatat/api add express        # tambah dependensi ke paket tertentu
pnpm -r build                                  # build semua paket, urut sesuai graf dependensi
pnpm -r --parallel dev                         # dev server web + api bersamaan
pnpm --filter "...[origin/main]" test          # hanya paket yang berubah sejak main beserta dependennya`, 'text'),
      callout('tip', 'Satu package manager per repo', 'Campuran `package-lock.json` dan `pnpm-lock.yaml` menghasilkan dependency tree yang berbeda di tiap mesin. Pilih satu, commit lockfile-nya, isi field `"packageManager"` di package.json, dan pakai mode frozen lockfile di CI. Banyak proyek masih memasang `typescript@~6.0` karena typescript-eslint dan tool lain menunggu API programatik TypeScript 7 yang dijadwalkan di 7.1. Untuk monorepo besar, Turborepo atau Nx menambahkan cache build di atas pnpm workspaces.'),
      callout('warn', 'Rantai pasok dependensi', '`pnpm dlx`/`npx` dan skrip `postinstall` menjalankan kode dari registry di mesin Anda. Periksa nama paket (typosquatting), jangan mengizinkan build script tanpa alasan, dan aktifkan `pnpm audit` atau Dependabot. Lihat [Secret & Supply Chain Security](#web.sec-secret-supply-chain).'),
      ...quiz([
        ['JSA-13', 'Kode `import debounce from \'lodash.debounce\'` jalan dengan npm tetapi error "Cannot find module" setelah pindah ke pnpm, padahal tidak ada di package.json. Mengapa?', 'Itu *phantom dependency*: paket terpasang sebagai dependensi dari dependensi lain, dan layout datar npm membuatnya kebetulan bisa di-import. pnpm hanya mengekspos dependensi yang dideklarasikan langsung, sehingga kesalahan ini terlihat. Perbaikannya: `pnpm add lodash.debounce` agar dependensi tercatat eksplisit.'],
        ['JSA-14', 'Apa beda `"^1.4.2"` dan `"^0.4.2"`?', '`^1.4.2` mengizinkan semua versi `<2.0.0` karena di versi 1.x ke atas hanya major yang boleh breaking. `^0.4.2` hanya mengizinkan `<0.5.0`, karena di versi 0.x perubahan minor dianggap breaking. Versi yang benar-benar terpasang tetap dikunci lockfile.'],
        ['JSA-15', 'Mengapa `eslint-config-prettier` diletakkan paling akhir di array flat config?', 'Flat config diterapkan berurutan dan objek belakang menimpa yang di depan. `eslint-config-prettier` mematikan aturan gaya (indentasi, kutip, koma) yang bisa bentrok dengan output Prettier. Bila diletakkan di awal, konfigurasi setelahnya bisa menyalakan kembali aturan itu dan ESLint serta Prettier saling "memperbaiki" bolak-balik.'],
      ]),
      ...practice('jsa-tooling-modern', [
        'Buat proyek `pnpm create vite` (vanilla atau vanilla-ts), tambahkan script `lint`, `format`, `test`, dan `check`, lalu pastikan `pnpm check` lulus.',
        'Pasang ESLint flat config + Prettier seperti contoh; sengaja tulis variabel tak terpakai dan kutip ganda, lalu lihat siapa yang melapor (ESLint) dan siapa yang memperbaiki format (Prettier).',
        'Ubah satu proyek npm menjadi pnpm: hapus `node_modules` dan `package-lock.json`, jalankan `pnpm import` lalu `pnpm install`, dan perbaiki phantom dependency yang muncul.',
        'Bangun monorepo `apps/web` + `apps/api` + `packages/shared` dengan pnpm workspaces; tipe `Transaksi` dari shared dipakai di kedua aplikasi dan `pnpm -r build` berhasil dari root.',
      ]),
      references(
        ['pnpm: Motivation & features', 'https://pnpm.io/motivation'],
        ['pnpm: Workspaces', 'https://pnpm.io/workspaces'],
        ['npm Docs: About semantic versioning', 'https://docs.npmjs.com/about-semantic-versioning'],
        ['Vite: Guide', 'https://vite.dev/guide/'],
        ['ESLint: Configuration files (flat config)', 'https://eslint.org/docs/latest/use/configure/configuration-files'],
        ['Prettier: Integrating with linters', 'https://prettier.io/docs/integrating-with-linters'],
      ),
    ],
  },
  {
    id: 'jsa-proyek-vanilla',
    title: 'Proyek Vanilla JS: Pencatat Pengeluaran Multi-Mata Uang',
    summary: 'Aplikasi lengkap tanpa framework: ES modules, store dengan pub/sub, DOM dan event delegation, localStorage yang divalidasi, sinkron antar-tab, dan kurs dari API publik dengan cache offline.',
    track: JS_ADV, source: jsAdvancedSource, duration: '4 jam', level: 'Med',
    blocks: [
      paragraph('Proyek penutup track ini menggabungkan semua materi JavaScript Lanjutan menjadi satu aplikasi utuh: pencatat pengeluaran yang menerima transaksi dalam berbagai mata uang (IDR, USD, SGD, EUR, JPY), mengonversinya ke Rupiah memakai kurs referensi ECB dari API publik [Frankfurter](https://frankfurter.dev/) (gratis, tanpa API key), menyimpan data di `localStorage`, dan tetap bisa dipakai saat offline. Berbeda dari mini proyek di [JavaScript: Modul, npm, Browser vs Node & DOM](#js.js-modul-runtime), kode dipecah per tanggung jawab dan setiap batas (storage, jaringan, input) diperlakukan sebagai sumber error.'),
      orderedList([
        'Siapkan proyek dan dev server Vite (langkah 1).',
        'Tulis `index.html` dan `style.css` (langkah 2).',
        'Buat modul tanpa DOM lebih dulu: `format.js`, `kurs.js`, `store.js` (langkah 3–5), sehingga bisa diuji di Node.',
        'Buat `ui.js` untuk render dan `main.js` untuk merangkai event (langkah 6–7).',
        'Uji skenario sulit: offline, dua tab, data localStorage rusak, lalu build produksi (langkah 8).',
      ]),
      code('Langkah 1 — setup proyek', `mkdir pencatat-vanilla && cd pencatat-vanilla
npm init -y
npm pkg set type=module
npm pkg set scripts.dev=vite scripts.build="vite build" scripts.preview="vite preview"
npm install -D vite
mkdir src
# Struktur akhir:
# index.html
# src/style.css  src/format.js  src/kurs.js  src/store.js  src/ui.js  src/main.js`, 'bash'),
      code('Langkah 2a — index.html', `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pencatat Pengeluaran</title>
    <link rel="stylesheet" href="/src/style.css" />
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <main class="app">
      <h1>Pencatat Pengeluaran</h1>

      <form id="form-transaksi">
        <label>Keterangan <input name="ket" required maxlength="60" /></label>
        <label>Jumlah <input name="jumlah" type="number" min="0.01" step="0.01" required /></label>
        <label>Mata uang
          <select name="mataUang">
            <option>IDR</option><option>USD</option><option>SGD</option><option>EUR</option><option>JPY</option>
          </select>
        </label>
        <label>Kategori
          <select name="kategori">
            <option value="makan">Makan</option>
            <option value="transport">Transport</option>
            <option value="belanja">Belanja</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </label>
        <button type="submit">Tambah</button>
        <p id="pesan-error" role="alert"></p>
      </form>

      <div class="filter">
        <input id="cari" type="search" placeholder="Cari keterangan…" aria-label="Cari keterangan" />
        <select id="filter-kategori" aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          <option value="makan">Makan</option>
          <option value="transport">Transport</option>
          <option value="belanja">Belanja</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>
      <p>Total: <strong id="total">Rp 0</strong> <small id="info-kurs"></small></p>
      <ul id="daftar"></ul>
    </main>
  </body>
</html>`, 'html'),
      code('Langkah 2b — src/style.css', `body { margin: 0; font-family: system-ui, sans-serif; background: #f6f7f9; color: #1f2933; }
.app { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
form { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); align-items: end; }
label { display: grid; gap: 0.25rem; font-size: 0.875rem; }
#pesan-error { grid-column: 1 / -1; margin: 0; color: #b42318; }
.filter { display: flex; gap: 0.5rem; margin-top: 1.5rem; }
#daftar { list-style: none; padding: 0; }
#daftar li { display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; align-items: center;
  padding: 0.75rem; margin-bottom: 0.5rem; background: #fff; border-radius: 0.5rem; }
#daftar li.kosong { display: block; color: #52606d; text-align: center; }
#daftar small { display: block; color: #52606d; }`, 'css'),
      code('Langkah 3 — src/format.js (Intl, dibuat sekali)', `const rupiahFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const tanggalFmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
const asingFmt = new Map();

export const rupiah = (angka) => rupiahFmt.format(angka);
export const tanggal = (iso) => tanggalFmt.format(new Date(iso));

export function uang(angka, mataUang) {
  if (!asingFmt.has(mataUang)) {
    asingFmt.set(mataUang, new Intl.NumberFormat('id-ID', { style: 'currency', currency: mataUang }));
  }
  return asingFmt.get(mataUang).format(angka);
}`, 'js'),
      code('Langkah 4 — src/kurs.js (fetch, timeout, cache, error dengan cause)', `const URL_KURS = 'https://api.frankfurter.dev/v1/latest?symbols=IDR,USD,SGD,JPY'; // basis EUR
const KUNCI_CACHE = 'pencatat:kurs';
const SEHARI = 24 * 60 * 60 * 1000;

export class KursError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'KursError';
  }
}

/** Mengembalikan { tanggal, idrPer: { IDR: 1, EUR: ..., USD: ... }, diambil, basi? } */
export async function ambilKurs({ paksa = false } = {}) {
  const cache = bacaCache();
  if (!paksa && cache && Date.now() - cache.diambil < SEHARI) return cache;

  try {
    const res = await fetch(URL_KURS, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new KursError(\`HTTP \${res.status}\`);
    const data = await res.json();                     // { base: 'EUR', date: '2026-10-30', rates: { IDR, USD, SGD, JPY } }
    const idrPerEur = data.rates?.IDR;
    if (!Number.isFinite(idrPerEur)) throw new KursError('Format respons kurs tidak dikenal');

    const idrPer = { IDR: 1, EUR: idrPerEur };
    for (const [kode, perEur] of Object.entries(data.rates)) {
      if (kode !== 'IDR') idrPer[kode] = idrPerEur / perEur;   // kurs silang lewat EUR
    }
    const hasil = { tanggal: data.date, idrPer, diambil: Date.now() };
    localStorage.setItem(KUNCI_CACHE, JSON.stringify(hasil));
    return hasil;
  } catch (err) {
    if (cache) return { ...cache, basi: true };        // offline: pakai kurs lama, beri tanda
    throw new KursError('Kurs tidak tersedia dan belum ada cache', { cause: err });
  }
}

function bacaCache() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_CACHE) ?? 'null');
    return data && typeof data.idrPer === 'object' && Number.isFinite(data.diambil) ? data : null;
  } catch {
    return null;                                       // JSON rusak: anggap belum ada cache
  }
}`, 'js'),
      code('Langkah 5 — src/store.js (state, validasi, pub/sub, sinkron antar-tab)', `const KUNCI = 'pencatat:transaksi';
const pendengar = new Set();
let items = muat();

function valid(t) {
  return typeof t?.id === 'string' && typeof t.ket === 'string' && typeof t.mataUang === 'string'
    && Number.isFinite(t.jumlah) && Number.isFinite(t.jumlahIdr) && typeof t.dibuatPada === 'string';
}

function muat() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI) ?? '[]');
    return Array.isArray(data) ? data.filter(valid) : [];   // buang entri rusak, jangan crash
  } catch {
    return [];
  }
}

function kabari() {
  for (const fn of pendengar) fn(items);
}

function simpan() {
  localStorage.setItem(KUNCI, JSON.stringify(items));
  kabari();
}

/** Daftarkan fungsi yang dipanggil setiap data berubah; mengembalikan fungsi untuk berhenti. */
export function langganan(fn) {
  pendengar.add(fn);
  fn(items);
  return () => pendengar.delete(fn);
}

export function tambah(data) {
  items = [{ id: crypto.randomUUID(), dibuatPada: new Date().toISOString(), ...data }, ...items];
  simpan();
}

export function hapus(id) {
  items = items.filter((t) => t.id !== id);
  simpan();
}

// Event storage hanya terpicu di tab LAIN dengan origin yang sama: tab ini ikut diperbarui
window.addEventListener('storage', (event) => {
  if (event.key !== KUNCI) return;
  items = muat();
  kabari();
});`, 'js'),
      code('Langkah 6 — src/ui.js (render aman dengan createElement + textContent)', `import { rupiah, tanggal, uang } from './format.js';

const LABEL = { makan: 'Makan', transport: 'Transport', belanja: 'Belanja', lainnya: 'Lainnya' };

export function renderDaftar(ul, items) {
  if (items.length === 0) {
    ul.replaceChildren(Object.assign(document.createElement('li'), { className: 'kosong', textContent: 'Belum ada transaksi.' }));
    return;
  }
  ul.replaceChildren(...items.map((t) => barisTransaksi(t)));
}

export function renderTotal(el, items) {
  el.textContent = rupiah(items.reduce((total, t) => total + t.jumlahIdr, 0));
}

function barisTransaksi(t) {
  const li = document.createElement('li');
  li.dataset.id = t.id;

  const info = document.createElement('div');
  const judul = document.createElement('strong');
  judul.textContent = t.ket;                           // input pengguna tidak pernah jadi HTML (aman dari XSS)
  const meta = document.createElement('small');
  meta.textContent = \`\${LABEL[t.kategori] ?? t.kategori} · \${tanggal(t.dibuatPada)}\`;
  info.append(judul, meta);

  const nominal = document.createElement('span');
  nominal.textContent = t.mataUang === 'IDR'
    ? rupiah(t.jumlah)
    : \`\${uang(t.jumlah, t.mataUang)} ≈ \${rupiah(t.jumlahIdr)}\`;

  const tombol = document.createElement('button');
  tombol.type = 'button';
  tombol.dataset.aksi = 'hapus';
  tombol.textContent = 'Hapus';
  tombol.setAttribute('aria-label', \`Hapus \${t.ket}\`);

  li.append(info, nominal, tombol);
  return li;
}`, 'js'),
      code('Langkah 7 — src/main.js (merangkai event)', `import { ambilKurs } from './kurs.js';
import { hapus, langganan, tambah } from './store.js';
import { renderDaftar, renderTotal } from './ui.js';

const form = document.querySelector('#form-transaksi');
const pesanError = document.querySelector('#pesan-error');
const daftar = document.querySelector('#daftar');
const totalEl = document.querySelector('#total');
const infoKurs = document.querySelector('#info-kurs');
const cari = document.querySelector('#cari');
const filterKategori = document.querySelector('#filter-kategori');

let semua = [];

function terapkanFilter() {
  const q = cari.value.trim().toLowerCase();
  const kategori = filterKategori.value;
  const terlihat = semua.filter((t) => (!kategori || t.kategori === kategori) && t.ket.toLowerCase().includes(q));
  renderDaftar(daftar, terlihat);
  renderTotal(totalEl, terlihat);
}

function tampilkanInfoKurs(kurs) {
  infoKurs.textContent = \`kurs ECB \${kurs.tanggal}\${kurs.basi ? ' (offline, mungkin usang)' : ''}\`;
}

langganan((items) => {
  semua = items;
  terapkanFilter();
});
cari.addEventListener('input', terapkanFilter);
filterKategori.addEventListener('change', terapkanFilter);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  pesanError.textContent = '';
  const fd = new FormData(form);
  const ket = String(fd.get('ket')).trim();
  const jumlah = Number(fd.get('jumlah'));
  const mataUang = String(fd.get('mataUang'));
  const kategori = String(fd.get('kategori'));

  if (!ket || !Number.isFinite(jumlah) || jumlah <= 0) {
    pesanError.textContent = 'Isi keterangan dan jumlah yang valid.';
    return;
  }

  const tombol = form.querySelector('button[type="submit"]');
  tombol.disabled = true;                              // cegah submit ganda saat menunggu kurs
  try {
    let jumlahIdr = jumlah;
    if (mataUang !== 'IDR') {
      const kurs = await ambilKurs();
      const idrPer = kurs.idrPer[mataUang];
      if (!idrPer) throw new Error(\`Kurs \${mataUang} tidak tersedia\`);
      jumlahIdr = Math.round(jumlah * idrPer);         // dibekukan saat transaksi dibuat
      tampilkanInfoKurs(kurs);
    }
    tambah({ ket, jumlah, mataUang, kategori, jumlahIdr });
    form.reset();
    form.elements.ket.focus();
  } catch (err) {
    console.error(err);
    pesanError.textContent = \`Gagal menyimpan: \${err.message}\`;
  } finally {
    tombol.disabled = false;
  }
});

// Event delegation: satu listener untuk semua tombol hapus
daftar.addEventListener('click', (event) => {
  const tombol = event.target.closest('button[data-aksi="hapus"]');
  if (!tombol) return;
  const id = tombol.closest('li[data-id]').dataset.id;
  if (confirm('Hapus transaksi ini?')) hapus(id);
});

// Muat kurs di awal; gagal pun tidak apa-apa karena transaksi IDR tetap bisa dicatat
ambilKurs().then(tampilkanInfoKurs).catch(() => {
  infoKurs.textContent = 'kurs belum tersedia';
});`, 'js'),
      code('Langkah 8 — jalankan dan uji skenario sulit', `npm run dev            # buka http://localhost:5173
# 1. Tambah transaksi IDR dan USD; total dalam Rupiah, baris USD menampilkan "US$… ≈ Rp…"
# 2. DevTools → Network → Offline, tambah transaksi SGD: memakai kurs cache + label "(offline, mungkin usang)"
# 3. Hapus kunci pencatat:kurs di Application → Local Storage, tetap Offline: muncul "Gagal menyimpan: Kurs tidak tersedia…"
# 4. Buka dua tab, tambah transaksi di tab A: tab B ikut diperbarui (event storage)
# 5. Ubah pencatat:transaksi menjadi teks acak di Local Storage lalu reload: aplikasi tetap jalan dengan daftar kosong
npm run build && npm run preview   # cek bundel produksi di dist/`, 'bash'),
      table(['Keputusan desain', 'Alasan'], [
        ['Simpan `jumlahIdr` saat transaksi dibuat', 'Kurs berubah setiap hari kerja; total historis tidak boleh ikut berubah saat kurs baru dimuat'],
        ['Cache kurs 24 jam di localStorage', 'ECB memperbarui kurs referensi sekali sehari; hemat request dan aplikasi tetap jalan offline'],
        ['Store dengan `langganan` (pub/sub)', 'UI tidak perlu tahu dari mana perubahan berasal (form, tombol hapus, atau tab lain)'],
        ['Validasi data saat membaca localStorage', 'Data bisa rusak, diubah manual, atau berasal dari versi aplikasi lama'],
        ['`createElement` + `textContent`', 'Teks dari pengguna tidak pernah ditafsirkan sebagai HTML, sehingga tertutup dari XSS'],
        ['Modul tanpa DOM (`format`, `kurs`) terpisah dari `ui`/`main`', 'Bisa diuji dengan `node --test` dan dipakai ulang saat migrasi ke TypeScript atau React'],
      ]),
      callout('warn', 'Kurs referensi bukan kurs transaksi', 'Kurs ECB adalah kurs referensi harian, bukan kurs jual-beli bank atau kartu. Untuk pencatatan pribadi ini cukup, tetapi aplikasi keuangan sungguhan harus menyimpan kurs yang benar-benar dipakai saat transaksi, mencatat sumbernya, dan tidak bergantung pada API gratis tanpa SLA.'),
      callout('tip', 'Langkah berikutnya', 'Migrasikan proyek ini ke TypeScript strict dengan panduan di [TypeScript: Utility Types, satisfies & Migrasi Proyek](#js.ts-utility-proyek): mulai dari `format.js` dan `kurs.js`, lalu ganti validasi manual di `store.js` dengan skema Zod. Struktur modul yang sama juga mudah dipindahkan ke React.'),
      ...quiz([
        ['JSA-16', 'Anda menambah transaksi di tab A, tetapi listener `storage` di tab A sendiri tidak terpicu. Bug?', 'Bukan bug. Event `storage` sengaja hanya dikirim ke dokumen **lain** dengan origin yang sama, karena tab yang mengubah data sudah tahu perubahannya. Itulah sebabnya `simpan()` memanggil `kabari()` secara langsung untuk tab sendiri, sedangkan listener `storage` menangani tab lain.'],
        ['JSA-17', 'Mengapa aplikasi menyimpan `jumlahIdr` alih-alih menghitung ulang dari kurs setiap kali render?', 'Agar riwayat stabil: pengeluaran USD bulan lalu harus tetap bernilai sesuai kurs saat itu. Menghitung ulang dengan kurs terbaru membuat total bulan lalu berubah setiap hari. Selain itu render tidak perlu menunggu jaringan atau gagal saat offline.'],
        ['JSA-18', 'Apa yang terjadi bila API kurs mati, belum ada cache, dan pengguna menambah transaksi USD?', '`ambilKurs` melempar `KursError(\'Kurs tidak tersedia dan belum ada cache\', { cause })`; `main.js` menangkapnya, menampilkan pesan di `#pesan-error`, dan tombol diaktifkan kembali di `finally`. Transaksi IDR tetap bisa dicatat karena tidak memerlukan kurs. Penyebab teknis asli tersedia di `err.cause` untuk debugging.'],
      ]),
      ...practice('jsa-proyek-vanilla', [
        'Bangun aplikasi sampai kelima skenario uji di langkah 8 berjalan sesuai deskripsi.',
        'Tambahkan fitur edit transaksi (form yang sama, mode edit lewat `data-aksi="edit"` dan delegation) dan ekspor CSV memakai `Blob` + `URL.createObjectURL`.',
        'Tambahkan ringkasan total per kategori bulan berjalan dengan `Intl.DateTimeFormat` untuk nama bulan dan `notation: \'compact\'` untuk angka besar.',
        'Tulis unit test dengan `node --test` untuk `format.js` dan logika kurs silang (pisahkan fungsi `hitungIdrPer(rates)` dari `ambilKurs` agar bisa diuji tanpa jaringan).',
      ]),
      references(
        ['Frankfurter API (kurs referensi ECB)', 'https://frankfurter.dev/'],
        ['MDN: JavaScript modules', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'],
        ['MDN: Window: storage event', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event'],
        ['MDN: AbortSignal.timeout()', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static'],
        ['Vite: Getting Started', 'https://vite.dev/guide/'],
      ),
    ],
  },
  // ───────────────────────────── TypeScript Tingkat Mahir ─────────────────────────────
  {
    id: 'jsa-ts-conditional-infer',
    title: 'TypeScript: Conditional Types, infer & Utility Type Sendiri',
    summary: 'Logika if-else di level tipe, menangkap bagian tipe dengan infer, perilaku distributif pada union, jebakan never, dan membangun serta menguji utility type sendiri.',
    track: TS_PRO, source: jsAdvancedSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Utility bawaan seperti `ReturnType`, `Awaited`, dan `Exclude` bukan sihir compiler: semuanya ditulis dengan **conditional types**, fitur yang membuat sistem tipe TypeScript bisa "menghitung". Menguasainya membuat Anda bisa membaca definisi tipe library (`.d.ts` React Query, Zod, Prisma) dan menulis tipe turunan sendiri saat utility bawaan tidak cukup. Prasyaratnya generic dan `keyof` dari [TypeScript: Fungsi, Array, Tuple & Generic Dasar](#js.ts-fungsi-generic-dasar).'),
      code('Conditional type dan infer', `// T extends U ? X : Y — "if" di level tipe
type IsString<T> = T extends string ? true : false;
type A = IsString<'halo'>;                                // true
type B = IsString<42>;                                    // false

// infer: tangkap bagian dari tipe ke variabel tipe baru (hanya boleh di klausa extends)
type ElemenArray<T> = T extends readonly (infer E)[] ? E : never;
type HasilFungsi<F> = F extends (...args: never[]) => infer R ? R : never;
type IsiPromise<T> = T extends PromiseLike<infer V> ? IsiPromise<V> : T;   // rekursif, mirip Awaited
type Pertama<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : undefined;

type C = ElemenArray<string[]>;                           // string
type D = HasilFungsi<() => Promise<number>>;              // Promise<number>
type E = IsiPromise<Promise<Promise<boolean>>>;           // boolean
type F = Pertama<['a', 'b']>;                             // 'a'

// infer dengan constraint (TS 4.7+): ubah string literal angka menjadi number literal
type KeAngka<S> = S extends \`\${infer N extends number}\` ? N : never;
type G = KeAngka<'404'>;                                  // 404
type H = KeAngka<'abc'>;                                  // never

// Contoh nyata: ambil tipe argumen dari fungsi library yang tidak mengekspor tipenya
declare function kirimEmail(ke: string, opsi: { cc?: string[]; prioritas: 'tinggi' | 'normal' }): Promise<void>;
type OpsiEmail = Parameters<typeof kirimEmail>[1];        // { cc?: string[]; prioritas: 'tinggi' | 'normal' }
const opsi: OpsiEmail = { prioritas: 'tinggi' };

export type { A, B, C, D, E, F, G, H };
console.log(opsi);`, 'ts'),
      code('Distributive conditional types dan jebakan never', `// Conditional pada parameter tipe "telanjang" didistribusikan ke SETIAP anggota union
type KeArray<T> = T extends unknown ? T[] : never;
type X1 = KeArray<string | number>;                       // string[] | number[]

// Bungkus kedua sisi dengan [ ] untuk mematikan distribusi
type KeArrayUtuh<T> = [T] extends [unknown] ? T[] : never;
type X2 = KeArrayUtuh<string | number>;                   // (string | number)[]

// Utility bawaan memanfaatkan distribusi untuk menyaring union
type Status = 'draft' | 'terbit' | 'arsip' | null | undefined;
type TanpaNull = NonNullable<Status>;                     // 'draft' | 'terbit' | 'arsip'
type Publik = Exclude<Status, 'draft' | null | undefined>; // 'terbit' | 'arsip'

// Menyaring varian discriminated union berdasarkan diskriminan
type AppEvent =
  | { type: 'klik'; x: number; y: number }
  | { type: 'ketik'; tombol: string }
  | { type: 'scroll'; posisi: number };
type AmbilEvent<T extends AppEvent['type']> = Extract<AppEvent, { type: T }>;
type EventKetik = AmbilEvent<'ketik'>;                    // { type: 'ketik'; tombol: string }

function tangani<T extends AppEvent['type']>(type: T, handler: (e: AmbilEvent<T>) => void) {
  console.log('daftar handler', type, handler.length);
}
tangani('klik', (e) => console.log(e.x, e.y));            // e otomatis bertipe varian klik

// Jebakan: never adalah union KOSONG, sehingga distribusi atas never menghasilkan never
type IsNeverSalah<T> = T extends never ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;
type N1 = IsNeverSalah<never>;                            // never (bukan true!)
type N2 = IsNever<never>;                                 // true

export type { X1, X2, TanpaNull, Publik, EventKetik, N1, N2 };`, 'ts'),
      code('Membangun dan menguji utility type sendiri', `// 1) DeepPartial: Partial yang masuk sampai ke objek bersarang (untuk override konfigurasi)
type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer E)[]
    ? readonly DeepPartial<E>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }            // mapped type: dibahas di pelajaran berikutnya
      : T;

interface Konfigurasi {
  server: { port: number; host: string };
  db: { url: string; pool: { min: number; max: number } };
  fitur: string[];
}
const override: DeepPartial<Konfigurasi> = { db: { pool: { max: 20 } } };   // OK
// const salah: DeepPartial<Konfigurasi> = { db: { pool: { max: '20' } } }; // error: string bukan number

// 2) Kunci yang nilainya bertipe tertentu
type KunciBertipe<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
interface Produk { id: number; nama: string; harga: number; deskripsi?: string; aktif: boolean }
type KunciAngka = KunciBertipe<Produk, number>;           // 'id' | 'harga'

function urutkan<T>(data: readonly T[], kunci: KunciBertipe<T, number>): T[] {
  return data.toSorted((a, b) => (a[kunci] as number) - (b[kunci] as number));
}
// urutkan(produkList, 'nama');                           // error: 'nama' bukan kunci bernilai number

// 3) Union → intersection (memanfaatkan posisi parameter yang kontravarian)
type UnionKeIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type Gabung = UnionKeIntersection<{ a: 1 } | { b: 2 }>;    // { a: 1 } & { b: 2 }

// 4) Uji tipe: file gagal dikompilasi bila hasil tidak sesuai harapan
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
type UjiUtility = [
  Expect<Equal<KunciAngka, 'id' | 'harga'>>,
  Expect<Equal<Gabung, { a: 1 } & { b: 2 }>>,
  Expect<Equal<DeepPartial<{ a: { b: number } }>, { a?: { b?: number } }>>,
];

console.log(override, urutkan([{ id: 2, nama: 'b', harga: 5, aktif: true }], 'harga'));
export type { UjiUtility };`, 'ts'),
      table(['Utility bawaan', 'Definisi (disederhanakan)'], [
        ['`Exclude<T, U>`', '`T extends U ? never : T` (distributif)'],
        ['`Extract<T, U>`', '`T extends U ? T : never` (distributif)'],
        ['`NonNullable<T>`', '`T & {}` (sejak TS 4.8)'],
        ['`ReturnType<F>`', '`F extends (...args: any) => infer R ? R : any`'],
        ['`Parameters<F>`', '`F extends (...args: infer P) => any ? P : never`'],
        ['`InstanceType<C>`', '`C extends abstract new (...args: any) => infer R ? R : any`'],
        ['`Awaited<T>`', 'Rekursif membuka objek yang punya method `then`'],
      ]),
      callout('warn', 'Kecerdasan tipe ada harganya', 'Tipe rekursif yang dalam memperlambat editor dan bisa memicu error "Type instantiation is excessively deep and possibly infinite". Simpan tipe tingkat lanjut di satu file utilitas yang teruji, beri nama yang menjelaskan maksud, dan untuk kode aplikasi sehari-hari utamakan tipe eksplisit yang mudah dibaca rekan tim.'),
      callout('tip', 'Uji tipe seperti menguji fungsi', 'Pola `Expect<Equal<...>>` di atas gagal dikompilasi bila utility berubah perilaku. Untuk kasus negatif, pakai `// @ts-expect-error` di atas baris yang **harus** error: bila suatu saat baris itu tidak lagi error, compiler yang melapor. Vitest juga menyediakan `expectTypeOf` untuk pengujian tipe di dalam suite test.'),
      ...quiz([
        ['JSA-19', 'Mengapa `KeArray<string | number>` menghasilkan `string[] | number[]`, bukan `(string | number)[]`?', 'Conditional type yang memeriksa parameter tipe telanjang (`T extends ...`) bersifat distributif: TypeScript menjalankannya untuk setiap anggota union secara terpisah lalu menggabungkan hasilnya. Untuk memperlakukan union sebagai satu kesatuan, bungkus kedua sisi: `[T] extends [unknown] ? T[] : never`.'],
        ['JSA-20', 'Mengapa `IsNeverSalah<never>` menghasilkan `never`, bukan `true`?', '`never` diperlakukan sebagai union tanpa anggota. Distribusi atas union kosong tidak menjalankan cabang mana pun, sehingga hasilnya union kosong lagi, yaitu `never`. Membungkus dengan tuple (`[T] extends [never]`) mematikan distribusi sehingga pemeriksaannya benar.'],
        ['JSA-21', 'Di mana `infer` boleh dipakai dan apa fungsinya?', '`infer X` hanya boleh muncul di sisi kanan `extends` pada conditional type. Ia mendeklarasikan variabel tipe yang diisi TypeScript dengan bagian tipe yang cocok di posisi itu, misalnya tipe elemen array, tipe return fungsi, isi Promise, atau potongan string literal, lalu bisa dipakai di cabang true.'],
      ]),
      ...practice('jsa-ts-conditional', [
        'Tulis ulang `ReturnType`, `Parameters`, `Awaited`, dan `NonNullable` dengan nama sendiri, lalu buktikan sama persis dengan versi bawaan memakai `Expect<Equal<...>>`.',
        'Buat `DeepReadonly<T>` yang menangani objek bersarang, array (menjadi `readonly T[]`), dan membiarkan fungsi apa adanya; uji dengan tipe `Konfigurasi`.',
        'Buat `KunciOpsional<T>` dan `KunciWajib<T>` yang mengembalikan union nama properti opsional/wajib dari sebuah interface.',
        'Gunakan `Extract` untuk membuat fungsi `on(type, handler)` pada discriminated union event Anda sendiri sehingga handler mendapat tipe varian yang tepat.',
      ]),
      references(
        ['TypeScript Handbook: Conditional Types', 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html'],
        ['TypeScript Handbook: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'],
        ['TypeScript 4.7: extends constraints on infer', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html'],
        ['Vitest: Testing types', 'https://vitest.dev/guide/testing-types'],
      ),
    ],
  },
  {
    id: 'jsa-ts-mapped-template',
    title: 'TypeScript: Mapped Types, Template Literal Types & Parsing di Level Tipe',
    summary: 'Mapped type dan modifier, key remapping dengan as, template literal types dan intrinsic string types, lalu mem-parse parameter rute dan path bertitik di level tipe.',
    track: TS_PRO, source: jsAdvancedSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Bila conditional types adalah "if" di level tipe, **mapped types** adalah "loop": mengubah setiap properti sebuah tipe menjadi bentuk lain. Digabung dengan **template literal types**, TypeScript bisa membangun dan membongkar string di level tipe, misalnya membuat nama handler `onKlik` dari event `klik`, atau mengetahui bahwa rute `/toko/:tokoId/produk/:produkId` membutuhkan parameter `tokoId` dan `produkId`. Teknik ini dipakai oleh router type-safe seperti Hono dan definisi tipe Express.'),
      code('Mapped type dan modifier', `interface Pengguna {
  readonly id: number;
  nama: string;
  email?: string;
  peran: 'admin' | 'staf';
}

// Bentuk dasar: iterasi setiap kunci T
type SemuaString<T> = { [K in keyof T]: string };
type Mutable<T> = { -readonly [K in keyof T]: T[K] };    // buang readonly
type Wajib<T> = { [K in keyof T]-?: T[K] };              // buang ? (sama dengan Required)
type Nullable<T> = { [K in keyof T]: T[K] | null };

type FormPengguna = SemuaString<Omit<Pengguna, 'id'>>;   // nilai input form selalu string
const draft: FormPengguna = { nama: 'Sari', peran: 'staf' };   // email tetap opsional
type PenggunaEdit = Mutable<Pengguna>;                    // id tidak lagi readonly

// Mapped type atas union literal (bukan keyof)
type Izin = 'baca' | 'tulis' | 'hapus';
type MatriksIzin = { [P in Pengguna['peran']]: { [I in Izin]: boolean } };
const izin: MatriksIzin = {
  admin: { baca: true, tulis: true, hapus: true },
  staf: { baca: true, tulis: true, hapus: false },
};                                                        // lupa satu peran/izin = error

// Mapped type "homomorphic" ({ [K in keyof T]: ... }) mempertahankan readonly dan ? dari tipe asal
type Salinan<T> = { [K in keyof T]: T[K] };
type S = Salinan<Pengguna>;                               // id tetap readonly, email tetap opsional

console.log(draft, izin);
export type { Wajib, Nullable, PenggunaEdit, S };`, 'ts'),
      code('Template literal types dan key remapping dengan as', `// Template literal type: menyusun literal string di level tipe
type Ukuran = 'sm' | 'md' | 'lg';
type Warna = 'merah' | 'biru';
type KelasTombol = \`btn-\${Warna}-\${Ukuran}\`;              // 6 kombinasi: 'btn-merah-sm' | 'btn-merah-md' | ...
type Piksel = \`\${number}px\`;
const lebar: Piksel = '320px';
// const salah: Piksel = '320';                           // error: tidak cocok dengan pola

// Intrinsic string types: Uppercase, Lowercase, Capitalize, Uncapitalize
type Getter<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
interface Akun { saldo: number; pemilik: string }
type AkunGetter = Getter<Akun>;                           // { getSaldo: () => number; getPemilik: () => string }

// as + never = buang kunci
type BuangPrivat<T> = { [K in keyof T as K extends \`_\${string}\` ? never : K]: T[K] };
type Publik = BuangPrivat<{ id: number; _cache: string; nama: string }>;   // { id: number; nama: string }
type HanyaMethod<T> = { [K in keyof T as T[K] extends (...args: never[]) => unknown ? K : never]: T[K] };
type MethodArray = keyof HanyaMethod<{ panjang: number; tambah(x: number): void }>;  // 'tambah'

// Peta event → props handler: { onKlik?, onKetik? }
type EventMap = { klik: { x: number; y: number }; ketik: { tombol: string } };
type Handler<E> = { [K in keyof E & string as \`on\${Capitalize<K>}\`]?: (payload: E[K]) => void };
const props: Handler<EventMap> = {
  onKlik: ({ x, y }) => console.log(x, y),                // payload otomatis bertipe { x; y }
  onKetik: ({ tombol }) => console.log(tombol),
};

// Emitter type-safe dari peta yang sama
class Emitter<E> {
  #listener: { [K in keyof E]?: ((p: E[K]) => void)[] } = {};
  on<K extends keyof E>(nama: K, fn: (payload: E[K]) => void) {
    (this.#listener[nama] ??= []).push(fn);
  }
  emit<K extends keyof E>(nama: K, payload: E[K]) {
    this.#listener[nama]?.forEach((fn) => fn(payload));
  }
}
const bus = new Emitter<EventMap>();
bus.on('ketik', (p) => console.log('tombol', p.tombol));
bus.emit('ketik', { tombol: 'Enter' });
// bus.emit('ketik', { x: 1 });                           // error: payload salah bentuk

console.log(lebar, props);
export type { KelasTombol, AkunGetter, Publik, MethodArray };`, 'ts'),
      code('Parsing di level tipe: parameter rute', `// '/toko/:tokoId/produk/:produkId' → 'tokoId' | 'produkId'
type NamaParam<S extends string> =
  S extends \`\${string}:\${infer P}/\${infer Sisa}\` ? P | NamaParam<Sisa>
  : S extends \`\${string}:\${infer P}\` ? P
  : never;
type ParamRute<S extends string> = { [K in NamaParam<S>]: string };

type P1 = NamaParam<'/toko/:tokoId/produk/:produkId'>;   // 'tokoId' | 'produkId'
type P2 = ParamRute<'/toko/:tokoId/produk/:produkId'>;   // { tokoId: string; produkId: string }
type P3 = ParamRute<'/tentang'>;                          // {} — tidak ada parameter

function buatUrl<S extends string>(pola: S, params: ParamRute<S>): string {
  const nilai: Record<string, string> = params;
  return pola.replace(/:(\\w+)/g, (_, nama: string) => encodeURIComponent(nilai[nama] ?? ''));
}

console.log(buatUrl('/toko/:tokoId/produk/:produkId', { tokoId: 't-1', produkId: '42' })); // /toko/t-1/produk/42
// buatUrl('/toko/:tokoId', {});                          // error: Property 'tokoId' is missing
// buatUrl('/toko/:tokoId', { tokoID: 'x' });             // error: salah ketik nama parameter
export type { P1, P2, P3 };`, 'ts'),
      code('Path bertitik untuk objek konfigurasi', `interface Konfigurasi {
  server: { port: number; host: string };
  db: { url: string; pool: { min: number; max: number } };
}

// Semua path valid: 'server' | 'server.port' | 'server.host' | 'db' | 'db.url' | 'db.pool' | 'db.pool.min' | ...
type Path<T> = {
  [K in keyof T & string]: T[K] extends object ? K | \`\${K}.\${Path<T[K]>}\` : K;
}[keyof T & string];

// Tipe nilai di sebuah path
type NilaiPath<T, P extends string> = P extends \`\${infer K}.\${infer Sisa}\`
  ? K extends keyof T ? NilaiPath<T[K], Sisa> : never
  : P extends keyof T ? T[P] : never;

function ambil<T, P extends Path<T>>(obj: T, path: P): NilaiPath<T, P> {
  let hasil: unknown = obj;
  for (const kunci of String(path).split('.')) hasil = (hasil as Record<string, unknown>)[kunci];
  return hasil as NilaiPath<T, P>;
}

const konfig: Konfigurasi = { server: { port: 3000, host: 'localhost' }, db: { url: 'postgres://...', pool: { min: 1, max: 10 } } };
const maks = ambil(konfig, 'db.pool.max');                // number
const host = ambil(konfig, 'server.host');                // string
// ambil(konfig, 'db.pool.maks');                         // error: bukan path yang valid
console.log(maks + 1, host.toUpperCase());`, 'ts'),
      table(['Teknik', 'Sintaks', 'Contoh hasil'], [
        ['Mapped dasar', '`{ [K in keyof T]: X }`', 'Semua properti bertipe X'],
        ['Modifier', '`-readonly`, `-?`, `+?`', '`Mutable<T>`, `Required<T>`, `Partial<T>`'],
        ['Iterasi union', '`{ [P in \'a\' | \'b\']: X }`', 'Sama dengan `Record<\'a\' | \'b\', X>`'],
        ['Key remapping', '`as` + template literal', '`saldo` menjadi `getSaldo`'],
        ['Filter kunci', '`as` + conditional yang menghasilkan `never`', 'Buang kunci `_privat` atau non-method'],
        ['Template literal type', 'Backtick + placeholder tipe', '`btn-merah-sm`, pola `${number}px`'],
        ['Parsing string', '`infer` di dalam template literal + rekursi', 'Nama parameter rute, path bertitik'],
      ]),
      callout('warn', 'Ledakan kombinasi', 'Template literal dengan beberapa union besar dikalikan: tiga union berisi 50 anggota menghasilkan 125.000 kombinasi, dan TypeScript menolak union yang terlalu kompleks ("Expression produces a union type that is too complex to represent"). Gunakan pola seperti `${number}px` untuk validasi bentuk, bukan daftar semua kemungkinan.'),
      callout('tip', 'Pakai di batas modul, bukan di mana-mana', 'Parsing di level tipe paling bernilai pada API yang dipanggil di banyak tempat: helper `buatUrl`, router, emitter, atau akses konfigurasi. Satu tipe yang rumit melindungi ratusan pemanggil dari salah ketik. Untuk logika domain biasa, interface eksplisit tetap lebih mudah dirawat.'),
      ...quiz([
        ['JSA-22', 'Apa beda `{ [K in keyof T]: T[K] }` dan `{ [K in \'a\' | \'b\']: string }` dalam hal modifier?', 'Bentuk pertama adalah mapped type homomorphic (iterasi `keyof T`), sehingga `readonly` dan `?` dari properti asal ikut dipertahankan kecuali diubah dengan `-readonly`/`-?`. Bentuk kedua iterasi atas union literal biasa yang tidak berhubungan dengan tipe mana pun, sehingga semua properti wajib dan dapat diubah.'],
        ['JSA-23', 'Mengapa key remapping memakai `Capitalize<string & K>` dan bukan `Capitalize<K>`?', '`keyof T` bisa berisi `string | number | symbol`, sedangkan `Capitalize` (dan template literal type) hanya menerima tipe string. Intersection `string & K` menyaring K menjadi kunci string saja; kunci number/symbol menjadi `never` dan otomatis terbuang dari hasil.'],
        ['JSA-24', 'Bagaimana `NamaParam<\'/toko/:tokoId/produk/:produkId\'>` menghasilkan `\'tokoId\' | \'produkId\'`?', 'Pola pertama mencocokkan teks sampai `:` pertama, menangkap `P = \'tokoId\'` sampai `/` berikutnya, dan sisanya `\'produk/:produkId\'`. Hasilnya `\'tokoId\' | NamaParam<\'produk/:produkId\'>`. Pada rekursi berikutnya tidak ada `/` setelah parameter, jadi pola kedua menangkap `\'produkId\'`. Rute tanpa `:` jatuh ke `never`.'],
      ]),
      ...practice('jsa-ts-mapped', [
        'Buat `Setter<T>` (`setSaldo(nilai)`) dan gabungkan dengan `Getter<T>` menjadi tipe `Store<T>`; implementasikan fungsi `buatStore(awal)` yang lolos tipe tanpa `any`.',
        'Kembangkan `NamaParam` agar mendukung parameter opsional `:id?` sehingga `ParamRute` menghasilkan `{ id?: string }` untuk parameter itu.',
        'Tambahkan dukungan query string: `buatUrl(\'/cari\', {}, { q: \'kopi\' })` dengan parameter ketiga bertipe `Record<string, string | number>`.',
        'Buat tipe `NamaEnvVar<T>` yang mengubah konfigurasi bersarang menjadi nama env seperti `DB_POOL_MAX` memakai `Uppercase` dan rekursi.',
      ]),
      references(
        ['TypeScript Handbook: Mapped Types', 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html'],
        ['TypeScript Handbook: Template Literal Types', 'https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html'],
        ['TypeScript Handbook: Indexed Access Types', 'https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html'],
        ['TypeScript 4.1: Key remapping & template literal types', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html'],
      ),
    ],
  },
  {
    id: 'jsa-ts-declaration-library',
    title: 'TypeScript: Declaration Files, Module Augmentation & Publikasi Library',
    summary: 'Menulis .d.ts dan declare module, global & module augmentation, field exports/types di package.json, flag strict tsconfig, serta memilih moduleResolution bundler atau nodenext.',
    track: TS_PRO, source: jsAdvancedSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Semua tipe library yang Anda pakai berasal dari **declaration file** (`.d.ts`): file yang hanya berisi tipe, tanpa implementasi. Pelajaran ini membahas tiga situasi yang pasti Anda temui: memakai library JavaScript tanpa tipe, **menambah** tipe ke library yang sudah ada (properti `req.user` di Express, env Vite), dan **menerbitkan** library sendiri sehingga tipenya terbaca benar oleh proyek ESM, CommonJS, maupun bundler. Di akhir ada peta flag tsconfig yang menentukan seberapa ketat dan bagaimana modul diresolusi.'),
      code('.d.ts untuk library JavaScript tanpa tipe', `// types/terbilang-lama.d.ts — library CommonJS lama: module.exports = function terbilang(n, opsi) { ... }
declare module 'terbilang-lama' {
  interface OpsiTerbilang {
    /** Tambahkan kata "rupiah" di akhir. Default: false */
    mataUang?: boolean;
    kapital?: 'awal' | 'semua' | 'tidak';
  }
  function terbilang(angka: number, opsi?: OpsiTerbilang): string;
  export = terbilang;                         // padanan module.exports = fn
}

// Wildcard: impor aset non-JS (proyek Vite sudah mendapatkannya dari "vite/client")
declare module '*.svg' {
  const url: string;
  export default url;
}

// Jalan pintas darurat: semua import dari paket ini bertipe any. Ganti secepatnya.
declare module 'paket-tanpa-tipe';

// Pemakaian di file lain:
// import terbilang from 'terbilang-lama';     // dengan esModuleInterop (selalu aktif sejak TS 6)
// terbilang(1500, { mataUang: true });       // 'seribu lima ratus rupiah'
// terbilang('1500');                         // error: string bukan number`, 'ts'),
      code('Global augmentation, module augmentation, dan env Vite', `// src/types/global.d.ts — file ini harus berupa MODUL (punya import/export) agar declare global berlaku
export {};

declare global {
  interface Window {
    dataLayer: unknown[];                      // diisi skrip analytics pihak ketiga
  }
  const __VERSI_APP__: string;                 // disuntikkan oleh define di vite.config

  // Express mendeklarasikan namespace global Express.Request khusus untuk diperluas seperti ini
  namespace Express {
    interface Request {
      user?: { id: string; peran: 'admin' | 'staf' };
    }
  }
}

// src/types/vue.d.ts — module augmentation: memperluas interface milik library (declaration merging)
// import 'vue';
// declare module 'vue' {
//   interface ComponentCustomProperties {
//     $rupiah: (angka: number) => string;     // app.config.globalProperties.$rupiah
//   }
// }

// src/vite-env.d.ts — file skrip (tanpa import/export): interface global langsung digabung
// /// <reference types="vite/client" />
// interface ImportMetaEnv {
//   readonly VITE_API_URL: string;
// }
// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }`, 'ts'),
      code('Library: tsconfig.build.json', `{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "isolatedDeclarations": true,
    "verbatimModuleSyntax": true,
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}`, 'json'),
      code('Library: package.json dengan exports dan types', `{
  "name": "@pencatat/uang",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./format": {
      "types": "./dist/format.d.ts",
      "default": "./dist/format.js"
    },
    "./package.json": "./package.json"
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "check:package": "publint && attw --pack .",
    "prepublishOnly": "npm run build && npm run check:package"
  }
}`, 'json'),
      paragraph('`exports` menentukan *entry point* mana yang boleh di-import (`@pencatat/uang` dan `@pencatat/uang/format`; path lain ditolak). Kondisi dicocokkan **berurutan**, jadi `types` diletakkan pertama dan `default` terakhir. Field `types` di level atas hanya untuk tool lama yang belum membaca `exports`. Paket ini ESM-only; sejak Node 20.19/22.12, `require()` atas modul ESM sinkron sudah didukung, sehingga build ganda ESM+CJS tidak lagi wajib untuk banyak library. Periksa hasilnya dengan [publint](https://publint.dev/) dan [Are the types wrong?](https://arethetypeswrong.github.io/) sebelum `npm publish`.'),
      table(['`moduleResolution`', 'Untuk', 'Perilaku penting'], [
        ['`bundler`', 'Aplikasi yang dibundel Vite, Next.js, webpack, atau dijalankan Bun', 'Import tanpa ekstensi diizinkan; membaca `exports`; tidak cocok untuk kode yang dijalankan Node apa adanya'],
        ['`nodenext` (dengan `module: nodenext`)', 'Kode yang dijalankan Node langsung, dan library yang diterbitkan', 'Mengikuti aturan Node persis: ekstensi wajib (`./util.js`), ESM/CJS dari `"type"`, kondisi `import`/`require`'],
        ['`node10` / `node` (lama)', 'Era CommonJS', 'Tidak membaca `exports`; deprecated di TypeScript 6 dan dihapus di TypeScript 7'],
      ]),
      table(['Flag', 'Bagian dari `strict`?', 'Yang ditangkap'], [
        ['`strictNullChecks`', 'Ya', '`null`/`undefined` harus ditangani sebelum dipakai'],
        ['`noImplicitAny`', 'Ya', 'Parameter tanpa tipe yang diam-diam menjadi `any`'],
        ['`strictFunctionTypes`', 'Ya', 'Callback dengan parameter yang tidak kompatibel (dicek kontravarian)'],
        ['`strictPropertyInitialization`', 'Ya', 'Properti class yang tidak diisi di constructor'],
        ['`useUnknownInCatchVariables`', 'Ya', '`catch (err)` bertipe `unknown`, bukan `any`'],
        ['`noUncheckedIndexedAccess`', 'Tidak', '`arr[i]` dan `obj[key]` bertipe `T | undefined`'],
        ['`exactOptionalPropertyTypes`', 'Tidak', '`{ a?: string }` menolak `{ a: undefined }` yang ditulis eksplisit'],
        ['`noImplicitOverride`', 'Tidak', 'Method yang menimpa parent wajib ditandai `override`'],
        ['`verbatimModuleSyntax` / `isolatedDeclarations`', 'Tidak', 'Import tipe wajib `import type`; tipe ekspor harus bisa dibaca tanpa inference lintas file (build `.d.ts` paralel)'],
      ]),
      callout('info', 'TypeScript 6 dan 7', 'TypeScript 6.0 adalah rilis transisi: `strict` kini default `true`, `types` default `[]` (tulis `"types": ["node"]` bila butuh), dan opsi lama seperti `moduleResolution: node10`, `baseUrl`, serta `target: es5` di-deprecate. TypeScript 7.0 (Agustus 2026) adalah compiler native hasil port ke Go yang jauh lebih cepat dan menghapus semua opsi yang deprecated di 6.0, jadi bereskan peringatan deprecation di 6.0 sebelum pindah.'),
      callout('warn', 'skipLibCheck dan declare module shorthand', '`skipLibCheck: true` mempercepat build dengan tidak memeriksa `.d.ts`, termasuk `.d.ts` milik Anda sendiri: error di file deklarasi bisa lolos. `declare module \'x\';` tanpa isi membuat semua import bertipe `any` dan diam-diam mematikan pemeriksaan. Cari dulu paket `@types/x` di DefinitelyTyped, atau tulis deklarasi minimal untuk fungsi yang benar-benar dipakai.'),
      ...quiz([
        ['JSA-25', 'Mengapa kondisi `types` harus ditulis paling awal di dalam objek `exports`?', 'Resolusi `exports` memilih kondisi pertama yang cocok sesuai urutan penulisan. Bila `default` atau `import` ditulis lebih dulu, TypeScript berhenti di file `.js` dan harus menebak file deklarasi di sebelahnya; hal ini rusak begitu nama atau ekstensinya berbeda (mis. `.d.mts`). Dengan `types` di urutan pertama, TypeScript langsung mendapat file deklarasi yang benar.'],
        ['JSA-26', 'File `global.d.ts` berisi `declare global { interface Window { ... } }` menghasilkan error "Augmentations for the global scope can only be directly nested in external modules". Apa perbaikannya?', '`declare global` hanya boleh muncul di file yang merupakan modul. Tambahkan `export {};` (atau import apa pun) di file itu. Alternatifnya, di file skrip tanpa import/export, tulis `interface Window { ... }` langsung di top level karena di sana interface sudah global.'],
        ['JSA-27', 'Library yang akan diterbitkan ke npm sebaiknya dikompilasi dengan `moduleResolution: bundler` atau `nodenext`?', '`nodenext`. Pemakai library bisa menjalankannya langsung di Node tanpa bundler. `bundler` mengizinkan import tanpa ekstensi (`./format`) yang lolos kompilasi tetapi gagal di Node ESM. `nodenext` memaksa kode mengikuti aturan yang juga berlaku di bundler, sehingga hasilnya aman untuk keduanya.'],
      ]),
      ...practice('jsa-ts-declaration', [
        'Tulis `.d.ts` untuk satu library JavaScript kecil (atau modul `.js` lama di proyek Anda) lengkap dengan JSDoc, lalu pastikan salah pakai argumen tertangkap compiler.',
        'Tambahkan `req.user` ke Express lewat `declare global { namespace Express { ... } }` dan gunakan di middleware autentikasi tanpa cast.',
        'Buat paket `@pencatat/uang` dengan dua entry point (`.` dan `./format`), build dengan `tsconfig.build.json`, lalu jalankan `publint` dan `attw --pack .` sampai bersih.',
        'Aktifkan `noUncheckedIndexedAccess` dan `exactOptionalPropertyTypes` di proyek yang sudah `strict`, catat jumlah error baru, dan perbaiki dengan narrowing, bukan dengan `!`.',
      ]),
      references(
        ['TypeScript Handbook: Declaration Files', 'https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html'],
        ['TypeScript Handbook: Declaration Merging', 'https://www.typescriptlang.org/docs/handbook/declaration-merging.html'],
        ['TypeScript: Modules — Reference', 'https://www.typescriptlang.org/docs/handbook/modules/reference.html'],
        ['TypeScript: Publishing', 'https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html'],
        ['Node.js: Package entry points (exports)', 'https://nodejs.org/api/packages.html#package-entry-points'],
        ['TypeScript 6.0 release notes', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html'],
      ),
    ],
  },
  {
    id: 'jsa-ts-decorators-api-client',
    title: 'TypeScript: Decorators, const Type Parameter, NoInfer & API Client Type-Safe',
    summary: 'Decorator standar TC39 vs experimentalDecorators, satisfies, const type parameter, NoInfer, dan merangkai semuanya menjadi API client yang tipe request/respons-nya diturunkan dari satu kontrak.',
    track: TS_PRO, source: jsAdvancedSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Pelajaran penutup membahas fitur yang sering muncul di codebase produksi tetapi jarang dijelaskan dengan benar. **Decorators** kini punya dua versi yang tidak kompatibel: versi standar TC39 (didukung TypeScript sejak 5.0) dan versi lama `experimentalDecorators` yang masih menjadi fondasi NestJS dan TypeORM. Lalu tiga alat untuk mengendalikan inference: `satisfies`, **const type parameter**, dan `NoInfer`. Terakhir, semua teknik di track ini digabung menjadi API client yang menolak rute, parameter, dan body yang salah saat kompilasi.'),
      code('Decorator standar TC39 (TypeScript 5.0+, tanpa flag)', `// Signature standar: (nilai, context) — context berisi name, kind, addInitializer, metadata, ...
function log<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  const nama = String(context.name);
  return function (this: This, ...args: Args): R {
    console.log(\`→ \${nama}(\${args.map((a) => JSON.stringify(a)).join(', ')})\`);
    const hasil = target.call(this, ...args);
    console.log(\`← \${nama}:\`, hasil);
    return hasil;
  };
}

function bound<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  context.addInitializer(function (this: This) {
    // Dijalankan untuk setiap instance baru: ikat method ke instance itu
    (this as Record<string | symbol, unknown>)[context.name] = target.bind(this);
  });
}

// Decorator factory untuk auto-accessor (kata kunci accessor berasal dari proposal yang sama)
function minimal(batas: number) {
  return function <This>(
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> {
    return {
      set(nilai) {
        if (nilai < batas) throw new RangeError(\`\${String(context.name)} minimal \${batas}\`);
        target.set.call(this, nilai);
      },
    };
  };
}

class Keranjang {
  @minimal(0) accessor jumlah = 1;

  @log
  total(harga: number) {
    return harga * this.jumlah;
  }

  @bound
  tambah() {
    this.jumlah++;
  }
}

const k = new Keranjang();
k.total(18_000);                                          // → total(18000)   ← total: 18000
const { tambah } = k;
tambah();                                                 // tetap bekerja berkat @bound
console.log(k.jumlah);                                    // 2
try {
  k.jumlah = -1;
} catch (e) {
  console.log((e as Error).message);                      // jumlah minimal 0
}`, 'ts'),
      code('Decorator legacy (experimentalDecorators) di NestJS', `// tsconfig.json: { "experimentalDecorators": true, "emitDecoratorMetadata": true }
// Signature lama: (target, propertyKey, descriptor) — dan ada PARAMETER decorator
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransaksiDto } from './dto';
import { TransaksiService } from './transaksi.service';

@Controller('transaksi')
export class TransaksiController {
  // emitDecoratorMetadata menyimpan tipe parameter constructor → DI tahu harus menyuntikkan TransaksiService
  constructor(private readonly service: TransaksiService) {}

  @Get(':id')
  ambil(@Param('id') id: string) {                        // parameter decorator: tidak ada di versi standar
    return this.service.cari(id);
  }

  @Post()
  buat(@Body() dto: CreateTransaksiDto) {
    return this.service.buat(dto);
  }
}`, 'ts'),
      table(['Aspek', 'Decorator standar (TC39)', '`experimentalDecorators` (legacy)'], [
        ['Cara mengaktifkan', 'Default sejak TypeScript 5.0, tanpa flag', '`"experimentalDecorators": true`'],
        ['Signature', '`(value, context)` dengan `context.kind`, `name`, `addInitializer`', '`(target, propertyKey, descriptor)`'],
        ['Parameter decorator', 'Tidak ada', 'Ada (`@Param()`, `@Inject()`, `@Body()`)'],
        ['Metadata tipe runtime', '`context.metadata` + `Symbol.metadata` (TS 5.2, butuh polyfill); tanpa info tipe', '`emitDecoratorMetadata` + `reflect-metadata` (dipakai DI NestJS)'],
        ['Auto-accessor', '`accessor jumlah = 1`', 'Tidak ada'],
        ['Status', 'Proposal TC39 Stage 3; engine belum menjalankan secara native, sehingga di-transpile', 'Khusus TypeScript, tidak akan distandarkan'],
        ['Node type stripping / `erasableSyntaxOnly`', 'Ditolak (bukan sintaks yang bisa dihapus)', 'Ditolak'],
      ]),
      code('satisfies, const type parameter, dan NoInfer', `// const type parameter (TS 5.0): inference literal tanpa pemanggil menulis "as const"
function buatEnum<const T extends readonly string[]>(nilai: T) {
  return Object.fromEntries(nilai.map((v) => [v, v])) as { [K in T[number]]: K };
}
const Status = buatEnum(['draft', 'terbit', 'arsip']);
type Status = keyof typeof Status;                        // 'draft' | 'terbit' | 'arsip'
// Tanpa "const", T di-infer sebagai string[] dan kuncinya hanya string.

// NoInfer (TS 5.4): parameter ini dicek terhadap T, tetapi tidak ikut menentukan T
function pilihAwal<T extends string>(opsi: readonly T[], awal: NoInfer<T>): T {
  return opsi.includes(awal) ? awal : opsi[0]!;
}
pilihAwal(['id', 'en'], 'id');
// pilihAwal(['id', 'en'], 'jp');                         // error: '"jp"' is not assignable to '"id" | "en"'
// Tanpa NoInfer, T di-infer menjadi 'id' | 'en' | 'jp' dan salah ketik lolos.

// satisfies + as const: bentuk dicek, literal dipertahankan
type Tema = Record<'primer' | 'latar', \`#\${string}\`>;
const tema = { primer: '#0f766e', latar: '#ffffff' } as const satisfies Tema;
const warnaPrimer: '#0f766e' = tema.primer;               // literal tetap utuh
// const rusak = { primer: 'teal', latar: '#fff' } satisfies Tema;  // error: 'teal' tidak cocok dengan #\${string}

const s: Status = Status.terbit;
console.log(s, warnaPrimer);`, 'ts'),
      code('Pola API client type-safe dari satu kontrak', `interface Transaksi { id: string; ket: string; jumlah: number }
type TransaksiBaru = Omit<Transaksi, 'id'>;

// 1) Kontrak tunggal: "METHOD /path" → bentuk query, body, dan respons
interface ApiSpec {
  'GET /transaksi': { query: { kategori?: string; halaman?: number }; response: Transaksi[] };
  'GET /transaksi/:id': { response: Transaksi };
  'POST /transaksi': { body: TransaksiBaru; response: Transaksi };
  'DELETE /transaksi/:id': { response: { ok: true } };
}

// 2) Tipe turunan: parameter rute dari string (pelajaran Mapped & Template Literal Types)
type NamaParam<S extends string> =
  S extends \`\${string}:\${infer P}/\${infer Sisa}\` ? P | NamaParam<Sisa>
  : S extends \`\${string}:\${infer P}\` ? P
  : never;
type PathDari<K> = K extends \`\${string} \${infer P}\` ? P : never;

type OpsiRequest<K extends keyof ApiSpec> =
  & ([NamaParam<PathDari<K>>] extends [never] ? unknown : { params: Record<NamaParam<PathDari<K>>, string> })
  & (ApiSpec[K] extends { body: infer B } ? { body: B } : unknown)
  & (ApiSpec[K] extends { query: infer Q } ? { query?: Q } : unknown)
  & { signal?: AbortSignal };

type Respons<K extends keyof ApiSpec> = ApiSpec[K]['response'];
// Argumen opsi boleh dihilangkan hanya bila tidak ada isian wajib
type ArgOpsi<K extends keyof ApiSpec> = {} extends OpsiRequest<K> ? [opsi?: OpsiRequest<K>] : [opsi: OpsiRequest<K>];

class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function buatClient(baseUrl: string) {
  return async function api<K extends keyof ApiSpec>(rute: K, ...[opsi]: ArgOpsi<K>): Promise<Respons<K>> {
    const [method, pola] = rute.split(' ') as [string, string];
    const o = (opsi ?? {}) as { params?: Record<string, string>; body?: unknown; query?: Record<string, unknown>; signal?: AbortSignal };
    const url = new URL(pola.replace(/:(\\w+)/g, (_, nama: string) => encodeURIComponent(o.params?.[nama] ?? '')), baseUrl);
    for (const [kunci, nilai] of Object.entries(o.query ?? {})) {
      if (nilai !== undefined) url.searchParams.set(kunci, String(nilai));
    }
    const res = await fetch(url, {
      method,
      signal: o.signal,
      headers: o.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: o.body === undefined ? undefined : JSON.stringify(o.body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return (await res.json()) as Respons<K>;              // kepercayaan pada server: validasi di batas bila perlu
  };
}

// 3) Pemakaian: setiap salah ketik tertangkap saat kompilasi
const api = buatClient('https://api.contoh.id');
export async function contoh() {
  const daftar = await api('GET /transaksi', { query: { kategori: 'makan' } }); // Transaksi[]
  const semua = await api('GET /transaksi');                                     // opsi boleh dihilangkan
  const satu = await api('GET /transaksi/:id', { params: { id: 'trx-1' } });     // Transaksi
  const baru = await api('POST /transaksi', { body: { ket: 'Kopi', jumlah: 18_000 } });
  // await api('GET /transaksi/:id');                         // error: params wajib
  // await api('POST /transaksi', { body: { ket: 'Kopi' } }); // error: jumlah hilang
  // await api('PUT /transaksi', {});                         // error: rute tidak ada di ApiSpec
  return [daftar.length, semua.length, satu.ket, baru.id];
}`, 'ts'),
      callout('warn', 'Jangan mencampur dua versi decorator', 'Decorator ditulis untuk salah satu versi dan tidak bisa dipakai di versi lain. Proyek NestJS/TypeORM harus tetap `experimentalDecorators: true` karena bergantung pada parameter decorator dan `emitDecoratorMetadata`. Decorator dari kedua versi juga tidak bisa dijalankan lewat type stripping Node.js karena membutuhkan transformasi kode; pakai `tsc` atau bundler. Sebelum memindahkan proyek berbasis decorator ke TypeScript 7, cek catatan rilisnya untuk dukungan emit decorator.'),
      callout('tip', 'Kontrak dari sumber yang sama dengan server', 'Daripada menulis `ApiSpec` dengan tangan, turunkan dari sumber kebenaran: generate dari OpenAPI dengan [openapi-typescript](https://openapi-ts.dev/) (pasangannya `openapi-fetch` memakai pola yang sama), atau bagikan skema Zod lewat paket monorepo seperti di [Kontrak API Lintas Sisi: Zod](#js.kontrak-api-lintas-sisi-zod). Tipe di client tetap hanya janji, jadi validasi respons di batas sistem bila datanya kritis.'),
      ...quiz([
        ['JSA-28', 'Tim ingin mematikan `experimentalDecorators` di proyek NestJS agar "memakai standar". Apa akibatnya?', 'Aplikasi tidak lagi bisa dikompilasi atau DI-nya rusak. NestJS memakai parameter decorator (`@Param`, `@Body`, `@Inject`) yang tidak ada di decorator standar, dan bergantung pada `emitDecoratorMetadata` untuk mengetahui tipe parameter constructor saat runtime. Decorator standar hanya tepat untuk kode yang ditulis untuknya, misalnya utilitas `@log`/`@bound` di proyek tanpa framework legacy.'],
        ['JSA-29', 'Apa yang dicegah `NoInfer<T>` di `pilihAwal(opsi, awal)`?', 'Tanpa `NoInfer`, TypeScript memakai kedua argumen sebagai kandidat inference sehingga `pilihAwal([\'id\', \'en\'], \'jp\')` menghasilkan `T = \'id\' | \'en\' | \'jp\'` dan salah ketik lolos. `NoInfer` membuat `T` hanya ditentukan dari `opsi`, lalu `awal` sekadar diperiksa terhadap `T` tersebut.'],
        ['JSA-30', 'Mengapa signature `api` memakai rest parameter `...[opsi]: ArgOpsi<K>` alih-alih `opsi?: OpsiRequest<K>`?', 'Agar wajib-tidaknya argumen ikut bergantung pada rute. `ArgOpsi<K>` menghasilkan tuple `[opsi?: ...]` bila tidak ada isian wajib (mis. `GET /transaksi`) dan `[opsi: ...]` bila ada `params` atau `body` wajib. Dengan `opsi?` biasa, `api(\'GET /transaksi/:id\')` tanpa params akan lolos kompilasi.'],
      ]),
      ...practice('jsa-ts-decorators-api', [
        'Tulis decorator standar `@retry(n)` untuk method async yang mengulang saat melempar `HttpError` dengan `bisaDiulang`, lalu uji dengan fungsi yang gagal dua kali.',
        'Buat `buatEnum` versi tanpa `const` dan bandingkan tipe hasilnya di editor; lalu buat fungsi `defineRoutes<const T>()` yang mempertahankan path literal.',
        'Lengkapi API client dengan `PATCH /transaksi/:id` (body `Partial<TransaksiBaru>`), timeout default lewat `AbortSignal.any`, dan uji compile-time bahwa salah rute/params/body ditolak dengan `// @ts-expect-error`.',
        'Ganti `ApiSpec` tulisan tangan dengan tipe yang di-generate dari file OpenAPI (openapi-typescript) atau dari skema Zod bersama, lalu validasi respons `GET /transaksi/:id` sebelum dikembalikan.',
      ]),
      references(
        ['TypeScript 5.0: Decorators & const type parameters', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html'],
        ['TypeScript 5.4: NoInfer', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html'],
        ['TC39: Decorators proposal', 'https://github.com/tc39/proposal-decorators'],
        ['TypeScript Handbook: Decorators (experimentalDecorators)', 'https://www.typescriptlang.org/docs/handbook/decorators.html'],
        ['NestJS: Custom decorators', 'https://docs.nestjs.com/custom-decorators'],
        ['openapi-typescript', 'https://openapi-ts.dev/'],
      ),
    ],
  },
];
