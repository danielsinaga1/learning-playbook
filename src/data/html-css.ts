import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const HTML_CSS = 'HTML & CSS Dasar';

export const htmlCssTracks: Track[] = [
  { title: HTML_CSS, summary: 'HTML semantik, form & aksesibilitas, selector & cascade, box model, Flexbox & Grid, desain responsif modern, dan mini proyek halaman landing.' },
];

export const htmlCssSource = 'HTML & CSS Dasar: materi tambahan dari MDN Web Docs dan web.dev (30 Oktober 2026)';

/** Ditaruh paling awal di kurikulum JS: fondasi halaman web sebelum JavaScript Dasar, TypeScript, dan React. */
export const htmlCssModules: Omit<Module, 'code'>[] = [
  {
    id: 'html-struktur-semantik',
    title: 'HTML: Struktur Dokumen & Elemen Semantik',
    summary: 'Kerangka dokumen, meta viewport, landmark semantik, hierarki heading, tautan, gambar, daftar, tabel, dan validasi.',
    track: HTML_CSS, source: htmlCssSource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('HTML memberi **makna** pada konten: ini judul, ini navigasi, ini artikel, ini tabel data. Browser, mesin pencari, dan pembaca layar (*screen reader*) membaca makna itu, bukan tampilannya. Halaman yang seluruhnya `<div>` mungkin terlihat sama, tetapi tidak bisa dinavigasi per bagian oleh pengguna pembaca layar dan lebih sulit dipahami mesin pencari. Aturannya sederhana: pilih elemen berdasarkan **arti** konten, lalu atur tampilannya dengan CSS.'),
      code('Kerangka dokumen dan landmark semantik', `<!doctype html>
<html lang="id">                                  <!-- bahasa utama: dipakai pembaca layar & penerjemah -->
  <head>
    <meta charset="utf-8" />
    <!-- Tanpa baris ini, ponsel merender halaman selebar ±980px lalu mengecilkannya -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Catatan Belajar Web — Blog Sari</title>   <!-- tampil di tab & hasil pencarian -->
    <meta name="description" content="Catatan belajar HTML, CSS, dan JavaScript dari nol." />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header>                                      <!-- kepala situs: logo, navigasi -->
      <a href="/">Blog Sari</a>
      <nav aria-label="Utama">
        <ul>
          <li><a href="/" aria-current="page">Beranda</a></li>
          <li><a href="/arsip">Arsip</a></li>
          <li><a href="/tentang">Tentang</a></li>
        </ul>
      </nav>
    </header>

    <main>                                        <!-- konten utama: satu per halaman -->
      <article>                                   <!-- konten yang utuh berdiri sendiri -->
        <h1>Belajar Flexbox dalam Satu Sore</h1>
        <p>Ditulis <time datetime="2026-10-30">30 Oktober 2026</time></p>

        <section>                                 <!-- bagian bertema, selalu dengan heading -->
          <h2>Sumbu utama dan sumbu silang</h2>
          <p>...</p>
          <h3>Mengubah arah dengan flex-direction</h3>
          <p>...</p>
        </section>
        <section>
          <h2>Latihan</h2>
          <p>...</p>
        </section>
      </article>

      <aside>                                     <!-- konten pendamping: artikel terkait -->
        <h2>Artikel terkait</h2>
        <ul>
          <li><a href="/grid">CSS Grid untuk pemula</a></li>
        </ul>
      </aside>
    </main>

    <footer>
      <p>&copy; 2026 Sari. Konten berlisensi CC BY 4.0.</p>
    </footer>
  </body>
</html>`, 'html'),
      table(['Elemen', 'Makna', 'Catatan'], [
        ['`<header>` / `<footer>`', 'Kepala & kaki situs atau kaki sebuah artikel', 'Di level `body` menjadi landmark *banner* dan *contentinfo*'],
        ['`<nav>`', 'Kumpulan tautan navigasi utama', 'Beri `aria-label` bila ada lebih dari satu `<nav>`'],
        ['`<main>`', 'Konten utama halaman', 'Hanya satu yang terlihat per halaman'],
        ['`<article>`', 'Konten utuh yang bisa berdiri sendiri', 'Posting blog, kartu produk, komentar'],
        ['`<section>`', 'Bagian bertema dari dokumen', 'Selalu punya heading; kalau tidak, mungkin cukup `<div>`'],
        ['`<aside>`', 'Konten pendamping', 'Sidebar, kotak info, iklan'],
        ['`<div>` / `<span>`', 'Tidak bermakna apa pun', 'Murni pembungkus untuk keperluan styling/layout'],
      ]),
      code('Tautan, gambar, daftar, dan tabel', `<!-- Tautan: teks menjelaskan tujuan, bukan "klik di sini" -->
<p>Baca <a href="/panduan/flexbox">panduan Flexbox</a> sebelum lanjut.</p>
<a href="https://developer.mozilla.org/" target="_blank" rel="noopener">MDN Web Docs (tab baru)</a>
<a href="mailto:sari@example.com">sari@example.com</a>
<a href="/cv-sari.pdf" download>Unduh CV (PDF, 120 KB)</a>

<!-- Gambar: alt mendeskripsikan INFORMASI gambar; width/height mencegah layout bergeser saat dimuat -->
<figure>
  <img src="grafik-pengeluaran.png"
       alt="Grafik batang: pengeluaran makan naik 20% dari Agustus ke September"
       width="800" height="450" loading="lazy" />
  <figcaption>Pengeluaran per kategori, Agustus–September 2026.</figcaption>
</figure>
<img src="ornamen-daun.svg" alt="" width="40" height="40" />  <!-- dekoratif: alt kosong, dilewati pembaca layar -->

<!-- Daftar: ul (urutan tidak penting), ol (urutan penting), dl (istilah-definisi) -->
<ol>
  <li>Pasang meta viewport</li>
  <li>Tulis struktur semantik</li>
</ol>
<dl>
  <dt>rem</dt>
  <dd>Satuan relatif terhadap font-size elemen root.</dd>
</dl>

<!-- Tabel: hanya untuk DATA tabular, bukan untuk layout -->
<table>
  <caption>Ringkasan pengeluaran September 2026</caption>
  <thead>
    <tr><th scope="col">Kategori</th><th scope="col">Jumlah</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Makan</th><td>Rp 890.000</td></tr>
    <tr><th scope="row">Transport</th><td>Rp 320.000</td></tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Total</th><td>Rp 1.210.000</td></tr>
  </tfoot>
</table>`, 'html'),
      callout('tip', 'Heading adalah daftar isi, bukan ukuran huruf', 'Pakai satu `<h1>` per halaman, lalu turun berurutan `h2` → `h3` tanpa melompat (jangan `h2` langsung ke `h4`). Banyak pengguna pembaca layar melompat antar-heading untuk memindai halaman. Butuh teks besar yang bukan judul? Atur dengan CSS, jangan pakai `<h3>` hanya karena ukurannya pas.'),
      callout('info', 'Validasi markup', 'Tempel HTML atau URL halaman ke validator resmi W3C (Nu HTML Checker di `validator.w3.org/nu`) untuk menemukan tag yang tidak ditutup, atribut salah, atau `id` ganda. Browser sangat pemaaf terhadap HTML rusak, sehingga kesalahan sering tidak terlihat sampai CSS atau JavaScript berperilaku aneh. Tab *Elements* di DevTools menampilkan DOM hasil perbaikan browser, berguna untuk membandingkan.'),
      ...quiz([
        ['HC-01', 'Halaman dibangun seluruhnya dari `<div class="header">`, `<div class="nav">`, dan `<div class="content">`. Tampilannya sudah benar. Apa kerugiannya?', 'Tidak ada makna yang bisa dibaca mesin. Pembaca layar tidak bisa melompat ke navigasi atau konten utama lewat daftar landmark, mesin pencari kehilangan petunjuk struktur, dan fitur seperti mode baca browser bekerja lebih buruk. Ganti dengan `<header>`, `<nav>`, `<main>`; tampilan tetap diatur CSS dan tidak berubah.'],
        ['HC-02', 'Mengapa `<img>` sebaiknya diberi atribut `width` dan `height` walaupun ukurannya diatur ulang dengan CSS?', 'Browser memakai rasio `width`/`height` untuk memesan ruang sebelum gambar selesai diunduh. Tanpanya, ruang gambar bernilai nol lalu konten di bawahnya melompat turun saat gambar muncul (layout shift, diukur sebagai CLS). Dengan CSS `max-width: 100%; height: auto;` gambar tetap responsif dan rasionya terjaga.'],
        ['HC-03', 'Apa beda `alt=""` dengan tidak menulis atribut `alt` sama sekali?', '`alt=""` menyatakan gambar dekoratif sehingga pembaca layar melewatinya. Tanpa atribut `alt`, banyak pembaca layar membacakan nama file (mis. "IMG underscore 2041 dot jpg") dan validator melaporkan error. Gambar yang membawa informasi butuh `alt` deskriptif; gambar dekoratif butuh `alt` kosong.'],
      ]),
      ...practice('hc-struktur-semantik', [
        'Tulis ulang satu halaman artikel blog dengan `header`, `nav`, `main`, `article`, `section`, `aside`, dan `footer`; tidak ada `<div>` yang punya padanan semantik.',
        'Periksa outline heading halaman itu (DevTools Accessibility tree atau ekstensi HeadingsMap): satu `h1`, tidak ada level yang dilompati.',
        'Tambahkan satu `figure` dengan `figcaption`, satu gambar dekoratif ber-`alt=""`, dan satu tabel data dengan `caption`, `thead`, serta `th scope`.',
        'Validasi halaman di Nu HTML Checker sampai tidak ada error.',
      ]),
      references(
        ['MDN: Structuring content with HTML', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content'],
        ['MDN: Semantics (glossary)', 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics'],
        ['MDN: HTML elements reference', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements'],
        ['MDN: <img> element', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img'],
        ['web.dev Learn HTML: Semantic HTML', 'https://web.dev/learn/html/semantic-html'],
      ),
    ],
  },
  {
    id: 'html-form-aksesibilitas',
    title: 'HTML: Form & Dasar Aksesibilitas',
    summary: 'Form dengan label, tipe input, validasi bawaan, button vs link, landmark, fokus keyboard, kontras, ARIA seperlunya, serta audit dengan Lighthouse dan axe.',
    track: HTML_CSS, source: htmlCssSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Form adalah tempat pengguna benar-benar *melakukan* sesuatu: mendaftar, membayar, mencari. HTML sudah menyediakan banyak hal gratis: keyboard ponsel yang sesuai, isi otomatis, validasi dasar, dan pengumuman ke pembaca layar, asalkan elemen yang dipakai tepat. **Aksesibilitas** berarti halaman bisa dipakai semua orang, termasuk pengguna keyboard saja, pembaca layar, dan penglihatan rendah. Sebagian besar dicapai dengan HTML semantik, bukan kode tambahan.'),
      code('Form pendaftaran dengan label dan validasi bawaan', `<form action="/daftar" method="post">
  <fieldset>
    <legend>Data akun</legend>

    <!-- label for = id input: klik label memfokuskan input, pembaca layar membacakan labelnya -->
    <label for="nama">Nama lengkap</label>
    <input id="nama" name="nama" autocomplete="name" required />

    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required
           aria-describedby="email-bantuan" />
    <p id="email-bantuan">Dipakai untuk masuk; tidak ditampilkan publik.</p>

    <label for="hp">Nomor HP</label>
    <input id="hp" name="hp" type="tel" inputmode="numeric" autocomplete="tel"
           pattern="08[0-9]{8,11}" aria-describedby="hp-format" />
    <p id="hp-format">Format: 08xxxxxxxxxx (10–13 digit).</p>

    <label for="sandi">Kata sandi</label>
    <input id="sandi" name="sandi" type="password" minlength="8"
           autocomplete="new-password" required />
  </fieldset>

  <fieldset>
    <legend>Paket</legend>              <!-- radio sekelompok: legend = pertanyaannya -->
    <label><input type="radio" name="paket" value="gratis" checked /> Gratis</label>
    <label><input type="radio" name="paket" value="pro" /> Pro</label>
  </fieldset>

  <label for="kota">Kota</label>
  <select id="kota" name="kota" required>
    <option value="">Pilih kota</option>
    <option>Bandung</option>
    <option>Jakarta</option>
    <option>Medan</option>
  </select>

  <label for="lahir">Tanggal lahir</label>
  <input id="lahir" name="lahir" type="date" min="1900-01-01" />

  <label><input type="checkbox" name="setuju" required /> Saya menyetujui syarat layanan</label>

  <button type="submit">Daftar</button>
</form>`, 'html'),
      table(['Atribut / tipe', 'Efek'], [
        ['`type="email"`, `"url"`, `"tel"`, `"number"`, `"date"`', 'Keyboard ponsel yang sesuai, validasi format (email/url), dan pemilih tanggal bawaan'],
        ['`required`, `minlength`, `maxlength`, `min`, `max`', 'Validasi bawaan: form tidak terkirim dan browser menampilkan pesan'],
        ['`pattern="..."`', 'Regex yang harus cocok dengan **seluruh** nilai; jelaskan formatnya di teks bantuan'],
        ['`autocomplete="email"`, `"name"`, `"new-password"`', 'Isi otomatis dan pengelola kata sandi bekerja; wajib untuk aksesibilitas (WCAG 1.3.5)'],
        ['`inputmode="numeric"`', 'Hanya mengganti keyboard virtual, tanpa validasi'],
        ['`aria-describedby="id"`', 'Teks bantuan ikut dibacakan saat input difokus'],
      ]),
      callout('warn', 'Validasi browser bukan keamanan', 'Validasi bawaan HTML hanya membantu pengguna. Siapa pun bisa mengirim request tanpa browser (curl, DevTools), jadi server **wajib** memvalidasi ulang semua input. Jangan pula memakai `placeholder` sebagai pengganti label: teksnya hilang saat mengetik, kontrasnya biasanya rendah, dan tidak selalu dibacakan.'),
      code('Button vs link, fokus keyboard, dan ARIA seperlunya', `<!-- Link (a href) = PINDAH ke URL lain. Button = MELAKUKAN aksi di halaman ini. -->
<a href="/produk/42">Lihat detail produk</a>
<button type="button">Tambah ke keranjang</button>

<!-- Buruk: tidak bisa di-Tab, tidak diumumkan sebagai tombol, Enter/Spasi tidak bekerja -->
<div class="tombol" onclick="simpan()">Simpan</div>
<!-- Baik: semua perilaku itu gratis -->
<button type="button" onclick="simpan()">Simpan</button>

<!-- Tombol berisi ikon saja butuh nama yang bisa dibacakan -->
<button type="button" aria-label="Tutup dialog">
  <svg aria-hidden="true" width="16" height="16"><!-- ikon X --></svg>
</button>

<!-- ARIA untuk STATE yang tidak punya padanan HTML: menu yang dibuka-tutup dengan JS -->
<button type="button" aria-expanded="false" aria-controls="menu-utama">Menu</button>
<ul id="menu-utama" hidden>
  <li><a href="/">Beranda</a></li>
</ul>

<!-- Pesan dinamis yang diumumkan tanpa memindahkan fokus -->
<p role="status">Data berhasil disimpan.</p>

<!-- Skip link: elemen pertama di body, membantu pengguna keyboard melewati navigasi -->
<a class="skip-link" href="#konten">Lewati ke konten utama</a>
<main id="konten">...</main>`, 'html'),
      table(['Prinsip', 'Praktik minimum'], [
        ['Landmark', '`header`, `nav`, `main`, `footer` di setiap halaman; satu `main`'],
        ['Alternatif teks', '`alt` deskriptif untuk gambar informatif, `alt=""` untuk dekoratif, `aria-label` untuk tombol ikon'],
        ['Keyboard', 'Semua aksi bisa dicapai dengan Tab, Enter, Spasi; urutan fokus mengikuti urutan visual; indikator fokus selalu terlihat'],
        ['Kontras', 'Rasio minimal **4.5:1** untuk teks normal dan **3:1** untuk teks besar & komponen UI (WCAG 2.2 AA)'],
        ['ARIA', 'Aturan pertama ARIA: pakai elemen HTML bawaan bila ada. ARIA yang salah lebih buruk daripada tanpa ARIA'],
        ['Warna', 'Jangan menyampaikan informasi hanya lewat warna; tambahkan teks atau ikon (mis. "Error: ...")'],
      ]),
      callout('tip', 'Audit: alat otomatis + tes manual', 'Jalankan **Lighthouse** (tab Lighthouse di Chrome DevTools, kategori Accessibility) dan ekstensi **axe DevTools** untuk menemukan label hilang, kontras kurang, dan `alt` kosong yang keliru. Alat otomatis hanya menangkap sebagian masalah, jadi tambahkan tes manual: cabut mouse dan selesaikan form hanya dengan keyboard, lalu perbesar zoom ke 200%.'),
      ...quiz([
        ['HC-04', 'Mengapa `<div onclick="...">` tidak setara dengan `<button>` walaupun bisa diberi gaya yang sama?', '`<div>` tidak masuk urutan Tab, tidak merespons Enter/Spasi, dan tidak diumumkan sebagai tombol oleh pembaca layar. Menirunya butuh `role="button"`, `tabindex="0"`, dan handler keyboard sendiri, padahal `<button>` sudah memberi semuanya. Di dalam form, ingat `<button>` default-nya `type="submit"`, jadi tulis `type="button"` untuk aksi non-submit.'],
        ['HC-05', 'Kapan sebuah navigasi harus memakai `<a href>` dan kapan `<button>`?', 'Pakai `<a href>` bila hasilnya berpindah ke URL lain (bisa dibuka di tab baru, di-bookmark, dibagikan). Pakai `<button>` bila aksinya mengubah sesuatu di halaman ini atau mengirim data: membuka menu, menambah ke keranjang, submit form. Memilih yang salah merusak ekspektasi pengguna keyboard dan pembaca layar.'],
        ['HC-06', 'Desainer meminta outline fokus dihapus karena "jelek". Apa jawaban yang tepat?', 'Jangan menghapusnya tanpa pengganti: pengguna keyboard tidak akan tahu posisinya. Ganti tampilan dengan `:focus-visible` (hanya muncul saat navigasi keyboard, tidak saat klik mouse), mis. `outline: 3px solid var(--aksen); outline-offset: 2px;`, dengan kontras minimal 3:1 terhadap latar.'],
      ]),
      ...practice('hc-form-aksesibilitas', [
        'Bangun form pendaftaran di atas; pastikan setiap input punya `label` yang terhubung (klik label memfokuskan input).',
        'Kirim form dalam keadaan kosong dan dengan data salah; catat pesan validasi bawaan untuk `required`, `type="email"`, `minlength`, dan `pattern`.',
        'Selesaikan seluruh form hanya dengan keyboard (Tab, Shift+Tab, Spasi, panah untuk radio) tanpa menyentuh mouse.',
        'Jalankan Lighthouse Accessibility dan axe DevTools, perbaiki semua temuan sampai skor Accessibility 100.',
      ]),
      references(
        ['web.dev: Learn Forms', 'https://web.dev/learn/forms'],
        ['MDN: Client-side form validation', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation'],
        ['MDN: <input> element', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input'],
        ['MDN: HTML — a good basis for accessibility', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML'],
        ['web.dev: Learn Accessibility', 'https://web.dev/learn/accessibility'],
      ),
    ],
  },
  {
    id: 'css-selector-cascade-box',
    title: 'CSS: Selector, Cascade & Box Model',
    summary: 'Cara memasang CSS, selector, specificity & cascade, inheritance, box model dan border-box, unit, warna, tipografi, serta custom properties.',
    track: HTML_CSS, source: htmlCssSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('CSS terdiri dari aturan `selector { properti: nilai; }`. Bagian yang sering membuat frustrasi bukan sintaksnya, tetapi pertanyaan "mengapa gaya saya tidak dipakai?". Jawabannya ada di **cascade**: algoritma yang memilih satu nilai ketika beberapa aturan menarget elemen yang sama. Setelah cascade, pahami **box model**, karena setiap elemen adalah kotak dengan content, padding, border, dan margin.'),
      code('Memasang CSS, selector, dan specificity', `/* Tiga cara memasang CSS:
   1. File eksternal (disarankan): <link rel="stylesheet" href="styles.css" /> di <head>
   2. Blok <style> di <head>: untuk satu halaman saja
   3. Atribut style="..." di elemen: hindari, sulit dirawat dan specificity-nya mengalahkan semua selector */

/* Selector dasar dan kombinator */
p { }                        /* type: semua <p> */
.kartu { }                   /* class */
#promo { }                   /* id: unik per halaman, sebaiknya untuk anchor/JS, bukan styling */
.kartu p { }                 /* descendant: <p> di mana pun di dalam .kartu */
.menu > li { }               /* child: anak langsung saja */
h2 + p { }                   /* adjacent sibling: <p> tepat setelah <h2> */
input[type="email"] { }      /* attribute */
a:hover, a:focus-visible { } /* pseudo-class: keadaan */
li:nth-child(odd) { }        /* pola posisi */
.tombol:not(.tombol--garis) { }
p::first-line { }            /* pseudo-element: bagian dari elemen */

/* Specificity dibandingkan sebagai tiga angka (ID, CLASS, TYPE), dari kiri ke kanan */
p              { color: black; }   /* (0,0,1) */
.kartu p       { color: gray; }    /* (0,1,1) */
.kartu .judul  { color: navy; }    /* (0,2,0) — dua class menang atas berapa pun type */
#promo .judul  { color: crimson; } /* (1,1,0) — satu id menang atas berapa pun class */
:is(#promo, .kartu) p { }          /* (1,0,1) — :is() memakai argumen paling spesifik */
:where(.kartu) p { }               /* (0,0,1) — :where() selalu bernilai nol, cocok untuk gaya dasar */
* { }                              /* (0,0,0) */`, 'css'),
      table(['Urutan cascade (yang lebih atas menang)', 'Contoh'], [
        ['1. Origin & `!important`', 'Deklarasi `!important` mengalahkan yang normal; gaya penulis mengalahkan gaya bawaan browser'],
        ['2. Cascade layer (`@layer`)', 'Gaya di luar layer menang atas gaya di dalam layer'],
        ['3. Specificity', '`(1,1,0)` menang atas `(0,2,0)`; atribut `style` inline menang atas semua selector'],
        ['4. Urutan kemunculan', 'Specificity sama → aturan yang ditulis **terakhir** menang'],
      ]),
      code('Inheritance dan box model', `/* Inheritance: properti teks (color, font-*, line-height) diwarisi anak;
   properti kotak (margin, padding, border, width, background) tidak */
.artikel { color: #333; font-family: Georgia, serif; border: 1px solid #ddd; }
.artikel a { color: inherit; }          /* paksa mewarisi warna induk */
button, input, textarea { font: inherit; } /* form control tidak mewarisi font secara default */

/* Box model: content → padding → border → margin */
.kotak {
  width: 300px;
  padding: 16px;
  border: 2px solid;
  margin: 24px auto;     /* atas-bawah 24px, kiri-kanan auto = di tengah */
}
/* box-sizing: content-box (bawaan): lebar tampil = 300 + 16*2 + 2*2 = 336px
   box-sizing: border-box: lebar tampil tetap 300px, content menyusut menjadi 264px */

/* Reset yang hampir selalu dipasang di awal stylesheet */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Margin vertikal antar-blok bertetangga "collapse": 24px + 16px menjadi 24px, bukan 40px */
h2 { margin-block: 24px; }
p  { margin-block: 16px; }

/* Logical properties: mengikuti arah tulisan (inline = horizontal untuk bahasa Indonesia) */
.konten { padding-inline: 1rem; margin-block-end: 2rem; }`, 'css'),
      table(['Unit', 'Relatif terhadap', 'Pakai untuk'], [
        ['`px`', 'Absolut (1/96 inci CSS)', 'Border, bayangan, detail kecil'],
        ['`rem`', '`font-size` elemen root (`html`), default 16px', 'Ukuran font, spasi, breakpoint: ikut pengaturan font pengguna'],
        ['`em`', '`font-size` elemen itu sendiri', 'Padding tombol yang ikut membesar bersama teksnya'],
        ['`%`', 'Ukuran elemen induk (untuk width)', 'Lebar fleksibel di dalam wadah'],
        ['`vw` / `vh` / `dvh`', '1% lebar / tinggi viewport; `dvh` mengikuti bilah alamat ponsel', 'Hero setinggi layar: `min-height: 100dvh`'],
        ['`ch`', 'Lebar karakter "0" pada font aktif', 'Panjang baris teks nyaman: `max-width: 65ch`'],
      ]),
      code('Warna, tipografi, dan custom properties', `:root {
  /* Custom properties (variabel CSS): didefinisikan sekali, diwarisi seluruh dokumen */
  --warna-aksen: #0b57d0;
  --warna-teks: #1f2328;
  --warna-latar: #ffffff;
  --radius: 0.5rem;
  --font-dasar: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

body {
  font-family: var(--font-dasar);
  font-size: 1rem;              /* jangan set html { font-size: 62.5% } atau px: hormati setelan pengguna */
  line-height: 1.6;             /* tanpa satuan: dihitung ulang dari font-size tiap elemen */
  color: var(--warna-teks);
  background: var(--warna-latar);
}

h1 { font-size: 2.25rem; line-height: 1.2; font-weight: 700; }
.isi-artikel { max-width: 65ch; }

.tombol {
  background: var(--warna-aksen);
  color: #fff;
  padding: 0.5em 1em;           /* em: padding membesar bila font-size tombol membesar */
  border-radius: var(--radius);
}
.tombol--besar { font-size: 1.25rem; }

/* Format warna modern: semua didukung browser utama */
.contoh {
  color: rgb(11 87 208);                    /* tanpa koma */
  background: hsl(220 90% 96%);             /* hue, saturation, lightness */
  border-color: rgb(0 0 0 / 0.15);          /* / alpha untuk transparansi */
  outline-color: oklch(55% 0.2 260);        /* kecerahan yang konsisten antar-hue */
}

/* Override variabel di sub-pohon: semua turunan .panel-gelap ikut berubah */
.panel-gelap {
  --warna-teks: #e6edf3;
  --warna-latar: #0d1117;
  color: var(--warna-teks);
  background: var(--warna-latar);
}
.label-harga { color: var(--warna-harga, crimson); }  /* nilai cadangan bila variabel tidak ada */`, 'css'),
      callout('tip', 'Debug cascade dengan DevTools', 'Klik kanan elemen → *Inspect*. Panel **Styles** menampilkan semua aturan yang cocok, diurutkan dari specificity tertinggi; deklarasi yang kalah dicoret. Panel **Computed** menunjukkan nilai akhir beserta diagram box model (margin, border, padding, content). Hampir semua kasus "CSS saya tidak jalan" terjawab di dua panel ini.'),
      ...quiz([
        ['HC-07', 'Elemen `<p class="judul">` di dalam `<div id="promo" class="kartu">` terkena `.kartu .judul { color: navy }` dan `#promo p { color: crimson }`. Warna apa yang tampil dan mengapa?', 'Crimson. Specificity `#promo p` adalah (1,0,1), sedangkan `.kartu .judul` (0,2,0). Perbandingan dimulai dari kolom ID: 1 lebih besar dari 0, sehingga kolom berikutnya tidak lagi diperhitungkan. Itulah alasan banyak tim menghindari selector id untuk styling.'],
        ['HC-08', 'Dua kolom `width: 50%` dengan `padding: 1rem` tidak muat dalam satu baris. Apa penyebabnya dan perbaikannya?', 'Dengan `box-sizing: content-box` (bawaan), padding ditambahkan di luar lebar 50%, sehingga total lebih dari 100%. Pasang `*, *::before, *::after { box-sizing: border-box; }` agar padding dan border dihitung di dalam lebar yang ditentukan.'],
        ['HC-09', 'Kapan memakai `rem` dan kapan `em`?', '`rem` selalu relatif terhadap root, sehingga konsisten di mana pun elemen berada: cocok untuk ukuran font, spasi tata letak, dan breakpoint. `em` relatif terhadap font-size elemen itu sendiri: cocok untuk padding/ikon yang harus ikut membesar bersama teks komponennya. Hindari `em` untuk font-size bersarang karena efeknya berlipat.'],
      ]),
      ...practice('hc-selector-cascade', [
        'Buat tiga aturan yang saling bertabrakan pada satu elemen, tebak pemenangnya, lalu buktikan di panel Styles DevTools.',
        'Hitung specificity lima selector dari proyek Anda dalam format (ID, CLASS, TYPE) dan cek dengan tooltip specificity di DevTools.',
        'Bandingkan lebar tampil satu kotak dengan `content-box` dan `border-box` menggunakan diagram box model di panel Computed.',
        'Pindahkan semua warna, radius, dan font proyek Anda ke custom properties di `:root`, lalu buat varian `.panel-gelap` hanya dengan mengganti variabel.',
      ]),
      references(
        ['MDN: Box model', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model'],
        ['MDN: Specificity', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity'],
        ['MDN: Using CSS custom properties', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties'],
        ['web.dev Learn CSS: The cascade', 'https://web.dev/learn/css/the-cascade'],
        ['web.dev Learn CSS: Box model', 'https://web.dev/learn/css/box-model'],
      ),
    ],
  },
  {
    id: 'css-flexbox-grid',
    title: 'CSS: Layout dengan Flexbox & Grid',
    summary: 'Flexbox (axis, justify/align, gap, wrap, shorthand flex) dan Grid (template columns/areas, fr, minmax, auto-fit), kapan memakai yang mana, serta pola navbar, card grid, dan holy-grail.',
    track: HTML_CSS, source: htmlCssSource, duration: '2,5 jam', level: 'Easy',
    blocks: [
      paragraph('Dua sistem layout modern menggantikan trik lama berbasis `float` dan tabel. **Flexbox** menata item dalam **satu dimensi**: sebaris atau sekolom, dengan ukuran yang mengikuti konten. **Grid** menata dalam **dua dimensi**: baris dan kolom sekaligus, dengan ukuran yang ditentukan wadah. Keduanya dipasang di elemen induk (`display: flex` / `display: grid`) dan mengatur anak langsungnya.'),
      code('Flexbox: navbar dan media object', `/* <header class="navbar"><a class="logo">..</a><nav><ul>..</ul></nav><a class="tombol">..</a></header> */
.navbar {
  display: flex;                    /* flex-direction: row (bawaan) → sumbu utama horizontal */
  align-items: center;              /* sumbu SILANG: rata tengah vertikal */
  justify-content: space-between;   /* sumbu UTAMA: sisa ruang dibagi di antara item */
  flex-wrap: wrap;                  /* boleh turun baris di layar sempit */
  gap: 0.5rem 1.5rem;               /* jarak antar-baris, antar-kolom: lebih rapi daripada margin */
  padding: 1rem;
}
.navbar ul {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.navbar .tombol { margin-inline-start: auto; } /* margin auto mendorong item ke ujung */

/* Media object: gambar tetap, teks mengisi sisa ruang */
.media {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.media img { flex: none; width: 4rem; }      /* tidak membesar, tidak menyusut */
.media .isi { flex: 1; min-width: 0; }       /* isi sisa ruang; min-width: 0 agar teks panjang bisa menyusut */

/* Kolom dengan footer menempel di bawah */
.kartu {
  display: flex;
  flex-direction: column;           /* sumbu utama sekarang VERTIKAL */
}
.kartu .aksi { margin-block-start: auto; }

/* Item yang tumbuh dari ukuran dasar: tiga kotak 200px yang melebar mengisi baris */
.fitur-list { display: flex; flex-wrap: wrap; gap: 1rem; }
.fitur-list > * { flex: 1 1 200px; } /* grow 1, shrink 1, basis 200px */`, 'css'),
      table(['Shorthand `flex`', 'Setara dengan', 'Artinya'], [
        ['`flex: 1`', '`1 1 0%`', 'Bagi ruang sama rata, abaikan ukuran konten'],
        ['`flex: auto`', '`1 1 auto`', 'Mulai dari ukuran konten, lalu bagi sisa ruang'],
        ['`flex: none`', '`0 0 auto`', 'Kaku: tidak tumbuh, tidak menyusut'],
        ['`flex: initial`', '`0 1 auto`', 'Nilai bawaan: ukuran konten, boleh menyusut, tidak tumbuh'],
      ]),
      code('Grid: card grid responsif tanpa media query', `.grid-kartu {
  display: grid;
  /* Kolom sebanyak yang muat, masing-masing minimal 16rem dan maksimal 1fr.
     min(100%, 16rem) mencegah overflow saat wadah lebih sempit dari 16rem */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1.5rem;
}

/* fr = pecahan ruang SISA setelah kolom berukuran tetap dihitung */
.tiga-kolom { display: grid; grid-template-columns: 200px 1fr 2fr; gap: 1rem; }

/* Menempatkan item berdasarkan garis grid */
.galeri {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 10rem;           /* tinggi baris yang dibuat otomatis */
  gap: 0.5rem;
}
.galeri .unggulan {
  grid-column: 1 / 3;              /* dari garis 1 sampai garis 3 = 2 kolom */
  grid-row: span 2;                /* membentang 2 baris */
}

/* Menengahkan apa pun, dua baris saja */
.tengah { display: grid; place-items: center; min-height: 100dvh; }`, 'css'),
      code('Holy-grail layout dengan grid-template-areas', `/* HTML: <body class="halaman"><header/><nav/><main/><aside/><footer/></body> */
.halaman {
  display: grid;
  min-height: 100dvh;
  grid-template-rows: auto 1fr auto;          /* footer tetap di bawah walau konten pendek */
  grid-template-areas:
    "header"
    "main"
    "nav"
    "aside"
    "footer";                                  /* mobile: satu kolom, konten utama lebih dulu */
  gap: 1rem;
}
.halaman > header { grid-area: header; }
.halaman > nav    { grid-area: nav; }
.halaman > main   { grid-area: main; }
.halaman > aside  { grid-area: aside; }
.halaman > footer { grid-area: footer; }

@media (min-width: 60rem) {
  .halaman {
    grid-template-columns: 14rem 1fr 16rem;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "header header header"
      "nav    main   aside"
      "footer footer footer";
  }
}`, 'css'),
      table(['Kebutuhan', 'Pilih', 'Alasan'], [
        ['Item sebaris yang lebarnya mengikuti konten (navbar, deretan tombol, tag)', 'Flexbox', 'Satu dimensi, ukuran dari konten'],
        ['Menyelaraskan satu item ke ujung (`margin-inline-start: auto`)', 'Flexbox', 'Distribusi ruang di satu sumbu'],
        ['Kartu dengan kolom sejajar di semua baris', 'Grid', 'Baris dan kolom dikontrol bersamaan'],
        ['Kerangka halaman (header, sidebar, main, footer)', 'Grid', '`grid-template-areas` terbaca seperti peta'],
        ['Komponen di dalam sel grid (isi kartu)', 'Flexbox di dalam Grid', 'Keduanya bisa bersarang bebas'],
      ]),
      callout('warn', 'Urutan visual vs urutan DOM', 'Properti `order`, `flex-direction: row-reverse`, dan penempatan grid hanya mengubah posisi **visual**. Pembaca layar dan tombol Tab tetap mengikuti urutan HTML. Bila urutan bacaan penting, ubah urutan di HTML, jangan hanya di CSS. Firefox DevTools dan Chrome DevTools punya overlay Flexbox/Grid (klik badge `flex`/`grid` di panel Elements) untuk melihat garis dan area.'),
      ...quiz([
        ['HC-10', 'Pada `display: flex; flex-direction: column`, properti mana yang menengahkan item secara horizontal: `justify-content` atau `align-items`?', '`align-items: center`. `justify-content` selalu bekerja di sumbu utama, dan pada `column` sumbu utama adalah vertikal. `align-items` bekerja di sumbu silang, yang kini horizontal. Ingat sumbunya, bukan arah layarnya.'],
        ['HC-11', 'Apa beda `repeat(auto-fit, minmax(16rem, 1fr))` dengan `auto-fill`?', 'Keduanya membuat kolom sebanyak yang muat. Bila item lebih sedikit dari kolom yang muat, `auto-fill` mempertahankan kolom kosong (item tetap selebar satu kolom), sedangkan `auto-fit` meruntuhkan kolom kosong sehingga item yang ada melebar mengisi baris. Untuk card grid biasanya `auto-fit`.'],
        ['HC-12', 'Teks URL panjang di dalam item `flex: 1` membuat layout melebar keluar layar. Mengapa dan bagaimana memperbaikinya?', 'Item flex punya `min-width: auto` secara default, artinya tidak mau menyusut lebih kecil dari konten terpanjangnya. Tambahkan `min-width: 0` pada item (dan `overflow-wrap: anywhere` pada teksnya) agar boleh menyusut. Di Grid, masalah serupa diatasi dengan `minmax(0, 1fr)`.'],
      ]),
      ...practice('hc-flexbox-grid', [
        'Bangun navbar dengan logo di kiri, menu di tengah, tombol di kanan memakai Flexbox; pastikan turun baris dengan rapi di lebar 320px.',
        'Buat card grid `auto-fit` + `minmax` berisi 7 kartu dan amati jumlah kolom saat jendela diubah ukurannya, tanpa satu pun media query.',
        'Implementasikan holy-grail layout dengan `grid-template-areas`, footer tetap di bawah walau konten hanya satu paragraf.',
        'Selesaikan level Flexbox Froggy dan Grid Garden, lalu periksa satu layout Anda dengan overlay Grid/Flexbox di DevTools.',
      ]),
      references(
        ['MDN: Flexbox', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox'],
        ['MDN: Grids', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids'],
        ['web.dev Learn CSS: Flexbox', 'https://web.dev/learn/css/flexbox'],
        ['web.dev Learn CSS: Grid', 'https://web.dev/learn/css/grid'],
      ),
    ],
  },
  {
    id: 'css-responsif-modern',
    title: 'CSS: Desain Responsif & Fitur Modern',
    summary: 'Mobile-first, media & container queries, clamp() untuk tipografi fluid, gambar responsif, dark mode, :has(), nesting CSS bawaan, transisi, dan prefers-reduced-motion.',
    track: HTML_CSS, source: htmlCssSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Halaman responsif menyesuaikan diri dengan lebar layar, preferensi pengguna (tema gelap, gerakan dikurangi), dan kini juga lebar **wadahnya**. Pendekatan yang dianjurkan adalah **mobile-first**: tulis gaya dasar untuk layar kecil tanpa media query, lalu tambahkan aturan untuk layar yang lebih lebar. Banyak fitur yang dulu butuh Sass atau JavaScript (nesting, parent selector, ukuran fluid) kini tersedia langsung di CSS.'),
      code('Mobile-first, container query, dan clamp()', `/* 1) Mobile-first: gaya dasar = satu kolom */
.layout {
  display: grid;
  gap: 1.5rem;
  padding-inline: 1rem;
}
/* Breakpoint dalam rem agar ikut ukuran font pengguna */
@media (min-width: 48rem) {
  .layout { grid-template-columns: 2fr 1fr; }
}
@media (width >= 75rem) {               /* range syntax: setara (min-width: 75rem) */
  .layout { max-width: 72rem; margin-inline: auto; }
}

/* 2) Tipografi fluid: clamp(MIN, IDEAL, MAKS) */
h1 {
  font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem);
  /* bagian rem menjaga teks tetap membesar saat pengguna zoom; vw saja tidak ikut zoom */
}
.bagian { padding-block: clamp(2rem, 6vw, 5rem); }

/* 3) Container query: komponen menyesuaikan lebar WADAHNYA, bukan viewport */
.slot-kartu {
  container-type: inline-size;          /* jadikan elemen ini container */
  container-name: kartu;
}
.kartu { display: grid; gap: 0.75rem; }
@container kartu (min-width: 30rem) {
  .kartu { grid-template-columns: 10rem 1fr; }  /* gambar di samping teks bila wadah lebar */
}
/* Kartu yang sama: bertumpuk di sidebar sempit, menyamping di area utama yang lebar */`, 'css'),
      code('Gambar responsif: srcset, sizes, dan picture', `<!-- Browser memilih file terkecil yang cukup tajam berdasarkan sizes × kepadatan piksel layar -->
<img
  src="hero-800.jpg"
  srcset="hero-480.jpg 480w, hero-800.jpg 800w, hero-1200.jpg 1200w, hero-1600.jpg 1600w"
  sizes="(min-width: 75rem) 72rem, 100vw"
  width="1600" height="900"
  alt="Tim sedang berdiskusi di depan papan tulis"
  fetchpriority="high" />
<!-- sizes = lebar TAMPIL gambar: 72rem di layar lebar, selebar viewport di bawahnya.
     Gambar hero (di atas lipatan) jangan diberi loading="lazy";
     fetchpriority="high" mempercepat LCP dan diabaikan browser yang belum mendukung -->

<!-- picture: format modern dengan fallback; browser memakai source pertama yang didukung -->
<picture>
  <source srcset="foto-tim.avif" type="image/avif" />
  <source srcset="foto-tim.webp" type="image/webp" />
  <img src="foto-tim.jpg" alt="Foto tim pada acara tahunan 2026"
       width="800" height="600" loading="lazy" />
</picture>`, 'html'),
      code('Dark mode, :has(), nesting, dan gerakan yang menghormati pengguna', `:root {
  color-scheme: light dark;   /* form control, scrollbar, dan warna bawaan ikut tema */
  --latar: #ffffff;
  --teks: #1f2328;
  --aksen: #0b57d0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --latar: #0d1117;
    --teks: #e6edf3;
    --aksen: #8ab4f8;         /* warna aksen disesuaikan agar kontras tetap ≥ 4.5:1 */
  }
}
body { background: var(--latar); color: var(--teks); }

/* :has() — memilih elemen berdasarkan ISI atau saudara setelahnya */
.kartu:has(img) { padding-block-start: 0; }                  /* kartu yang punya gambar */
.field:has(input:user-invalid) label { color: crimson; }     /* label ikut merah setelah pengguna berinteraksi */
.form:has(input[type="checkbox"]:checked) .info-member { display: block; }

/* Nesting CSS bawaan: tanpa Sass */
.kartu {
  border: 1px solid #d0d7de;
  border-radius: 0.75rem;
  padding: 1rem;

  & h3 { margin-block: 0 0.5rem; }          /* = .kartu h3 */
  &:focus-within { outline: 2px solid var(--aksen); }  /* = .kartu:focus-within */
  .tema-gelap & { border-color: #30363d; }   /* = .tema-gelap .kartu */

  @media (min-width: 48rem) {               /* media query boleh bersarang */
    padding: 1.5rem;
  }
}

/* Gerakan hanya untuk pengguna yang TIDAK meminta gerakan dikurangi */
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
  .kartu { transition: translate 200ms ease, box-shadow 200ms ease; }
  .kartu:hover { translate: 0 -4px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
}`, 'css'),
      table(['Fitur', 'Status dukungan (Baseline, per Oktober 2026)'], [
        ['Media queries, range syntax `(width >= 48rem)`', 'Widely available (range syntax sejak 2023)'],
        ['`clamp()`, `min()`, `max()`', 'Widely available'],
        ['Container size queries (`@container`, `container-type`)', 'Widely available (sejak Februari 2023 di semua browser utama)'],
        ['Container **style** queries (`@container style(...)`)', 'Newly available (Mei 2026): uji dulu sebelum diandalkan'],
        ['`:has()`', 'Widely available (Baseline sejak Desember 2023)'],
        ['CSS nesting bawaan', 'Widely available (Baseline sejak Desember 2023)'],
        ['`:user-invalid`, `:focus-visible`', 'Widely available'],
        ['`prefers-color-scheme`, `prefers-reduced-motion`', 'Widely available'],
      ]),
      callout('warn', 'Nesting CSS bukan Sass', 'Nesting bawaan tidak menggabungkan string selector. Pola Sass `&__judul` (untuk `.kartu__judul`) **tidak** bekerja: tulis `.kartu__judul` sebagai aturan terpisah. Selector bersarang juga dihitung seperti dibungkus `:is()`, sehingga specificity-nya bisa berbeda dari hasil kompilasi Sass.'),
      callout('info', 'Kapan media query, kapan container query', 'Pakai **media query** untuk keputusan tingkat halaman (jumlah kolom layout, ukuran font global) dan preferensi pengguna (tema, gerakan). Pakai **container query** untuk komponen yang dipakai ulang di tempat berbeda lebarnya: kartu, widget, form di modal.'),
      ...quiz([
        ['HC-13', 'Kartu produk dipakai di grid utama (lebar) dan di sidebar (sempit). Dengan media query, kartu di sidebar ikut berubah ke tampilan "menyamping" di layar desktop. Apa solusinya?', 'Pakai container query. Jadikan pembungkus kartu container (`container-type: inline-size`), lalu tulis `@container (min-width: 30rem) { ... }`. Kartu kini merespons lebar wadahnya sendiri, sehingga di sidebar tetap bertumpuk walau layar lebar.'],
        ['HC-14', 'Mengapa `font-size: 5vw` buruk untuk aksesibilitas, dan apa penggantinya?', 'Nilai yang hanya `vw` tidak ikut membesar saat pengguna melakukan zoom teks dan bisa terlalu kecil di ponsel atau raksasa di monitor lebar. Gunakan `clamp(1.75rem, 1.2rem + 2.5vw, 3rem)`: ada batas bawah dan atas, dan komponen `rem` membuat teks tetap merespons zoom.'],
        ['HC-15', 'Pada `<img srcset="a-480.jpg 480w, a-1200.jpg 1200w" sizes="100vw">`, file mana yang diunduh ponsel selebar 400px dengan layar 2x?', 'Browser butuh 400 × 2 = 800 piksel fisik, sehingga memilih kandidat terkecil yang cukup, yaitu `a-1200.jpg` (480w tidak cukup). Tanpa `sizes` yang akurat browser menganggap gambar selebar viewport; bila gambar sebenarnya tampil lebih kecil, isi `sizes` dengan lebar tampil nyata agar file yang diunduh lebih kecil.'],
      ]),
      ...practice('hc-responsif-modern', [
        'Ubah satu stylesheet desktop-first (`max-width`) menjadi mobile-first (`min-width`) dan pastikan tidak ada scroll horizontal di lebar 320px.',
        'Buat komponen kartu dengan container query lalu tampilkan di dua wadah berbeda lebar pada halaman yang sama.',
        'Tambahkan dark mode dengan `prefers-color-scheme` memakai custom properties; uji dengan emulasi tema di DevTools (Rendering → Emulate CSS media feature).',
        'Bungkus semua transisi dan `scroll-behavior` di `@media (prefers-reduced-motion: no-preference)` dan uji dengan emulasi reduced motion.',
      ]),
      references(
        ['MDN: Using media queries', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using'],
        ['MDN: Container size and style queries', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries'],
        ['MDN: clamp()', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp'],
        ['MDN: :has()', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has'],
        ['MDN: Using CSS nesting', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using'],
        ['MDN: prefers-color-scheme', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme'],
        ['MDN: prefers-reduced-motion', 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion'],
        ['web.dev Learn Responsive Design: Responsive images', 'https://web.dev/learn/design/responsive-images'],
      ),
    ],
  },
  {
    id: 'css-proyek-landing',
    title: 'Proyek: Halaman Profil Responsif',
    summary: 'Mini proyek halaman profil/landing dengan HTML semantik, Flexbox & Grid, container query, dark mode, form kontak, serta checklist aksesibilitas dan performa.',
    track: HTML_CSS, source: htmlCssSource, duration: '3 jam', level: 'Easy',
    blocks: [
      paragraph('Proyek ini menggabungkan seluruh track menjadi satu halaman profil (portofolio) yang siap dipublikasikan: struktur semantik, skip link, hero dengan gambar responsif, grid kartu proyek yang memakai container query, form kontak dengan validasi bawaan, dark mode otomatis, dan gerakan yang menghormati preferensi pengguna. Tanpa framework dan tanpa JavaScript: cukup dua file, `index.html` dan `styles.css`.'),
      code('index.html', `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sari Wulandari — Frontend Developer</title>
    <meta name="description" content="Portofolio Sari Wulandari, frontend developer di Bandung yang membangun web cepat dan aksesibel." />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#konten">Lewati ke konten utama</a>

    <header class="site-header">
      <div class="wadah header-isi">
        <a class="logo" href="/">Sari.dev</a>
        <nav aria-label="Utama">
          <ul class="nav-list" role="list">
            <li><a href="#proyek">Proyek</a></li>
            <li><a href="#keahlian">Keahlian</a></li>
            <li><a href="#kontak">Kontak</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="konten">
      <section class="wadah hero" aria-labelledby="judul-hero">
        <div>
          <p class="eyebrow">Frontend Developer · Bandung</p>
          <h1 id="judul-hero">Saya membangun web yang cepat, rapi, dan bisa dipakai semua orang.</h1>
          <p>Tiga tahun mengerjakan dashboard, toko online, dan company profile dengan HTML, CSS, dan JavaScript.</p>
          <div class="aksi">
            <a class="tombol" href="#proyek">Lihat proyek</a>
            <a class="tombol tombol--garis" href="cv-sari.pdf" download>Unduh CV (PDF)</a>
          </div>
        </div>
        <img class="hero-foto"
             src="img/sari-640.jpg"
             srcset="img/sari-320.jpg 320w, img/sari-640.jpg 640w, img/sari-960.jpg 960w"
             sizes="(min-width: 48rem) 22rem, 70vw"
             width="640" height="640" fetchpriority="high"
             alt="Sari tersenyum di depan laptop di ruang kerjanya" />
      </section>

      <section id="proyek" class="wadah" aria-labelledby="judul-proyek">
        <h2 id="judul-proyek">Proyek pilihan</h2>
        <!-- role="list": Safari menghapus semantik daftar bila list-style: none -->
        <ul class="grid-kartu" role="list">
          <li class="slot-kartu">
            <article class="kartu">
              <img src="img/kasir.webp" alt="" width="640" height="400" loading="lazy" />
              <div class="kartu-isi">
                <h3><a href="proyek/kasir.html">Aplikasi Kasir UMKM</a></h3>
                <p>PWA kasir yang tetap jalan offline, lengkap dengan laporan harian.</p>
              </div>
            </article>
          </li>
          <li class="slot-kartu">
            <article class="kartu">
              <img src="img/katalog.webp" alt="" width="640" height="400" loading="lazy" />
              <div class="kartu-isi">
                <h3><a href="proyek/katalog.html">Katalog Batik Online</a></h3>
                <p>Katalog responsif dengan filter kategori dan skor Lighthouse 98.</p>
              </div>
            </article>
          </li>
          <li class="slot-kartu">
            <article class="kartu">
              <img src="img/dashboard.webp" alt="" width="640" height="400" loading="lazy" />
              <div class="kartu-isi">
                <h3><a href="proyek/dashboard.html">Dashboard Keuangan Koperasi</a></h3>
                <p>Grafik arus kas bulanan yang bisa dibaca pembaca layar.</p>
              </div>
            </article>
          </li>
        </ul>
      </section>

      <section id="keahlian" class="wadah" aria-labelledby="judul-keahlian">
        <h2 id="judul-keahlian">Keahlian</h2>
        <ul class="tag-list" role="list">
          <li>HTML semantik</li>
          <li>CSS Grid &amp; Flexbox</li>
          <li>Aksesibilitas (WCAG 2.2)</li>
          <li>JavaScript</li>
          <li>Performa web</li>
        </ul>
      </section>

      <section id="kontak" class="wadah" aria-labelledby="judul-kontak">
        <h2 id="judul-kontak">Kontak</h2>
        <form class="form-kontak" action="/kontak" method="post">
          <div class="field">
            <label for="nama">Nama</label>
            <input id="nama" name="nama" autocomplete="name" required />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="pesan">Pesan</label>
            <textarea id="pesan" name="pesan" rows="5" minlength="10" required
                      aria-describedby="pesan-bantuan"></textarea>
            <p id="pesan-bantuan" class="bantuan">Minimal 10 karakter.</p>
          </div>
          <button class="tombol" type="submit">Kirim pesan</button>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <div class="wadah">
        <p>&copy; 2026 Sari Wulandari. Dibuat dengan HTML &amp; CSS.</p>
      </div>
    </footer>
  </body>
</html>`, 'html'),
      code('styles.css', `/* ===== 1. Reset ringan & design token ===== */
*, *::before, *::after { box-sizing: border-box; }

:root {
  color-scheme: light dark;
  --latar: #ffffff;
  --permukaan: #f4f6fa;
  --teks: #1f2328;
  --teks-redup: #57606a;
  --aksen: #0b57d0;
  --aksen-teks: #ffffff;
  --bahaya: #c62828;
  --garis: #d0d7de;
  --radius: 0.75rem;
  --ruang: clamp(1rem, 0.75rem + 1vw, 1.5rem);
  --lebar: 72rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --latar: #0d1117;
    --permukaan: #161b22;
    --teks: #e6edf3;
    --teks-redup: #9198a1;
    --aksen: #8ab4f8;
    --aksen-teks: #0d1117;
    --bahaya: #ff8a80;
    --garis: #30363d;
  }
}

/* ===== 2. Dasar ===== */
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: var(--teks);
  background: var(--latar);
}
img { display: block; max-width: 100%; height: auto; }
h1, h2, h3 { line-height: 1.2; text-wrap: balance; }  /* balance: diabaikan browser lama, aman */
h1 { font-size: clamp(2rem, 1.4rem + 3vw, 3.25rem); margin-block: 0 1rem; }
h2 { font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem); margin-block: 0 1.5rem; }
a { color: var(--aksen); }
:focus-visible { outline: 3px solid var(--aksen); outline-offset: 3px; }

.wadah { width: min(100% - 2 * var(--ruang), var(--lebar)); margin-inline: auto; }
main > section { padding-block: clamp(2.5rem, 6vw, 5rem); }
section[id] { scroll-margin-top: 5rem; }   /* anchor tidak tertutup header sticky */

/* ===== 3. Skip link & header ===== */
.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  background: var(--aksen);
  color: var(--aksen-teks);
  translate: 0 -150%;
}
.skip-link:focus { translate: 0; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--latar);
  border-block-end: 1px solid var(--garis);
}
.header-isi {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem 1.5rem;
  padding-block: 0.5rem;
}
.logo { font-size: 1.25rem; font-weight: 700; color: var(--teks); text-decoration: none; }
.nav-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.nav-list a {
  display: inline-block;
  padding: 0.5rem 0.25rem;               /* target sentuh cukup besar */
  color: var(--teks);
  text-decoration: none;
}
.nav-list a:hover { color: var(--aksen); text-decoration: underline; }

/* ===== 4. Hero ===== */
.hero { display: grid; gap: 2rem; align-items: center; }
.eyebrow { margin: 0 0 0.5rem; color: var(--teks-redup); font-weight: 600; }
.hero-foto {
  justify-self: center;
  width: min(70vw, 22rem);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}
.aksi { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-block-start: 1.5rem; }
.tombol {
  display: inline-block;
  padding: 0.75em 1.25em;
  border: 2px solid var(--aksen);
  border-radius: var(--radius);
  background: var(--aksen);
  color: var(--aksen-teks);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
.tombol--garis { background: transparent; color: var(--aksen); }

@media (min-width: 48rem) {
  .hero { grid-template-columns: 1fr auto; }
}

/* ===== 5. Kartu proyek: Grid + container query + nesting + :has() ===== */
.grid-kartu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.slot-kartu { container-type: inline-size; }

.kartu {
  position: relative;
  display: grid;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--garis);
  border-radius: var(--radius);
  background: var(--permukaan);

  & img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
  & h3 { margin-block: 0 0.5rem; font-size: 1.125rem; }
  & p { margin: 0; color: var(--teks-redup); }
  /* Seluruh kartu bisa diklik, tetapi hanya ada SATU tautan untuk pembaca layar */
  & h3 a::after { content: ""; position: absolute; inset: 0; }
  &:has(a:focus-visible) { outline: 3px solid var(--aksen); outline-offset: 3px; }
}
.kartu-isi { padding: 1rem 1.25rem 1.25rem; }

@container (min-width: 32rem) {
  .kartu { grid-template-columns: 40% 1fr; align-items: center; }
  .kartu img { height: 100%; aspect-ratio: auto; }
}

/* ===== 6. Keahlian ===== */
.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.tag-list li {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--garis);
  border-radius: 999px;
  background: var(--permukaan);
}

/* ===== 7. Form kontak ===== */
.form-kontak { display: grid; gap: 1rem; max-width: 36rem; }
.field { display: grid; gap: 0.25rem; }
.field label { font-weight: 600; }
input, textarea {
  font: inherit;
  color: inherit;
  background: var(--latar);
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--teks-redup);   /* border input butuh kontras ≥ 3:1 (WCAG 1.4.11) */
  border-radius: 0.5rem;
}
input:user-invalid, textarea:user-invalid { border-color: var(--bahaya); }
.field:has(:user-invalid) label { color: var(--bahaya); }
.bantuan { margin: 0; font-size: 0.875rem; color: var(--teks-redup); }
.form-kontak .tombol { justify-self: start; }

/* ===== 8. Footer & gerakan ===== */
.site-footer {
  padding-block: 2rem;
  border-block-start: 1px solid var(--garis);
  color: var(--teks-redup);
}

@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
  .kartu { transition: translate 200ms ease, box-shadow 200ms ease; }
  .kartu:hover { translate: 0 -4px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
}`, 'css'),
      table(['Checklist', 'Cara cek', 'Target'], [
        ['Struktur heading & landmark', 'Panel Accessibility di DevTools / axe', 'Satu `h1`, level berurutan, ada `header`/`nav`/`main`/`footer`'],
        ['Teks alternatif', 'Lighthouse / axe', 'Foto profil ber-`alt` deskriptif; gambar kartu ber-`alt=""` karena judul tautan sudah menjelaskan'],
        ['Keyboard', 'Tab dari awal halaman', 'Skip link muncul pertama, fokus selalu terlihat, urutan sesuai tampilan'],
        ['Kontras warna', 'Color picker DevTools / axe, di tema terang **dan** gelap', '≥ 4.5:1 teks normal, ≥ 3:1 teks besar & border input (`--garis` dekoratif boleh lebih pudar)'],
        ['Reflow & zoom', 'Device mode 320px dan zoom 200%', 'Tanpa scroll horizontal, tidak ada teks terpotong'],
        ['Gambar', 'Lighthouse Performance', 'Semua `img` punya `width`/`height`; `loading="lazy"` hanya di bawah lipatan; `srcset` untuk foto besar'],
        ['Core Web Vitals', 'Lighthouse / PageSpeed Insights', 'LCP ≤ 2,5 detik, CLS ≤ 0,1, INP ≤ 200 ms'],
        ['Validitas', 'Nu HTML Checker', 'Tanpa error'],
      ]),
      callout('tip', 'Publikasikan gratis', 'Halaman statis dua file bisa langsung dipublikasikan ke GitHub Pages, Netlify, atau Cloudflare Pages. Setelah online, jalankan Lighthouse di jendela Incognito (agar ekstensi browser tidak memengaruhi skor) dan simpan laporannya sebagai bukti di README proyek.'),
      callout('info', 'Langkah berikutnya', 'Halaman ini sengaja tanpa JavaScript. Interaktivitas seperti menu ponsel, tombol ganti tema manual, dan validasi kustom dibangun di track JavaScript Dasar, mulai dari [JavaScript: Variabel, Tipe Data & Operator](#js.js-variabel-tipe).'),
      ...quiz([
        ['HC-16', 'Mengapa gambar di kartu proyek memakai `alt=""` padahal bukan sekadar ornamen?', 'Judul tautan di kartu ("Aplikasi Kasir UMKM") sudah menyampaikan informasi yang sama. Bila gambar diberi `alt` "Tangkapan layar aplikasi kasir", pembaca layar mengulang informasi untuk setiap kartu. Bila gambar memuat informasi yang tidak ada di teks, barulah beri `alt` deskriptif.'],
        ['HC-17', 'Teknik `h3 a::after { position: absolute; inset: 0; }` membuat seluruh kartu bisa diklik. Mengapa lebih baik daripada membungkus seluruh `<article>` dengan `<a>`?', 'Membungkus seluruh kartu dengan `<a>` membuat pembaca layar membacakan semua isi kartu sebagai satu nama tautan yang panjang, dan tidak bisa memuat tautan atau tombol lain di dalamnya. Dengan pseudo-element, hanya ada satu tautan bernama singkat (judulnya), sementara area kliknya mencakup seluruh kartu karena `.kartu` diberi `position: relative`.'],
      ]),
      ...practice('hc-proyek-landing', [
        'Bangun halaman profil di atas dengan data dan foto Anda sendiri; tidak ada scroll horizontal dari lebar 320px sampai 1920px.',
        'Lulus seluruh checklist aksesibilitas dan performa di tabel, termasuk kontras di tema terang dan gelap.',
        'Raih skor Lighthouse minimal 90 untuk Performance, Accessibility, Best Practices, dan SEO; simpan laporannya.',
        'Publikasikan ke GitHub Pages atau Netlify dan validasi URL publiknya di Nu HTML Checker.',
      ]),
      references(
        ['web.dev: Learn Responsive Design', 'https://web.dev/learn/design'],
        ['web.dev: Web Vitals', 'https://web.dev/articles/vitals'],
        ['MDN: Accessibility', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility'],
        ['web.dev Learn HTML: Semantic HTML', 'https://web.dev/learn/html/semantic-html'],
      ),
    ],
  },
];
