import type { Block, Module, QAItem, Track } from '../types';
import { callout, code, heading, paragraph, practice, references, table } from './lesson-kit';

const TRACK = 'System Design Interview';

export const systemDesignTracks: Track[] = [
  {
    title: TRACK,
    summary:
      'Latihan system design gaya interview 45 menit: kerangka 4 langkah & estimasi kapasitas, lima studi kasus (URL shortener, rate limiter, chat, news feed, pembayaran), dan 15 soal trade-off cepat.',
  },
];

export const systemDesignSource = 'System Design Interview: materi tulisan tangan (30 Oktober 2026)';

const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });
const subheading = (text: string): Block => ({ type: 'h', text, level: 4 });

/** Pertanyaan lanjutan interviewer: jawaban berupa satu atau beberapa paragraf/blok. */
const followUps = (items: [id: string, q: string, a: string | Block[]][]): Block[] => [
  heading('Pertanyaan lanjutan dari interviewer'),
  {
    type: 'qa',
    items: items.map(([id, q, a]): QAItem => ({ id, q, a: typeof a === 'string' ? [paragraph(a)] : a })),
  },
];

const qa = (id: string, q: string, a: Block[]): QAItem => ({ id, q, a });

export const systemDesignModules: Omit<Module, 'code'>[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'sd-kerangka-estimasi',
    title: 'System Design: Kerangka 45 Menit & Estimasi Kapasitas',
    summary:
      'Kerangka 4 langkah (requirement → estimasi → high-level → deep dive), angka latency yang wajib hafal, hitungan QPS & storage, building blocks, dan red flags yang menggagalkan interview.',
    track: TRACK, source: systemDesignSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Interview system design tidak menilai apakah kamu menemukan "jawaban benar", karena memang tidak ada. Yang dinilai: kemampuan **memperjelas masalah yang ambigu**, **menalar dengan angka**, **memilih komponen dengan alasan**, dan **menyebut trade-off secara eksplisit**. Kandidat senior diharapkan memimpin diskusi, bukan menunggu dipandu.'),
      callout('tip', 'Materi pendukung', 'Konsep dasarnya ada di [System Design](#distributed.system-design), [Caching](#distributed.caching), [Message Queue](#distributed.message-queue-message-broker), dan [Distributed Data Management](#distributed.distributed-data-management). Modul ini fokus pada cara *membawakannya* dalam 45 menit.'),

      heading('Kerangka 4 langkah dalam 45 menit'),
      {
        type: 'steps',
        items: [
          {
            title: '1. Klarifikasi requirement (5–8 menit)',
            blocks: [
              paragraph('Ubah soal satu kalimat menjadi lingkup yang bisa didesain. Tulis hasilnya di papan agar interviewer bisa mengoreksi.'),
              list([
                '**Fungsional**: 3–5 fitur inti saja. Tanyakan apa yang *di luar* lingkup (mis. "Apakah perlu analytics? Custom alias? Edit pesan?").',
                '**Non-fungsional**: skala (DAU, rasio baca:tulis), latency target (p99), availability (99,9% = ±43 menit downtime/bulan; 99,99% = ±4,3 menit), konsistensi yang dibutuhkan, durabilitas, region/regulasi (mis. data harus di Indonesia).',
                '**Prioritas**: bila harus memilih, mana yang dikorbankan: konsistensi atau availability? Biaya atau latency?',
              ]),
            ],
          },
          {
            title: '2. Estimasi kapasitas (3–5 menit)',
            blocks: [
              paragraph('Hitung QPS rata-rata dan puncak, storage per tahun, bandwidth, dan ukuran cache. Tujuannya **memutuskan arsitektur** (apakah satu database cukup? perlu sharding? perlu CDN?), bukan akurasi desimal. Bulatkan agresif dan sebut asumsi.'),
            ],
          },
          {
            title: '3. Desain high-level (10–15 menit)',
            blocks: [
              paragraph('Definisikan API, skema data inti, lalu gambar diagram kotak-panah yang memenuhi semua requirement fungsional. Telusuri satu request dari client sampai storage dan kembali. Jangan optimasi dulu.'),
            ],
          },
          {
            title: '4. Deep dive & trade-off (15–20 menit)',
            blocks: [
              paragraph('Pilih 2–3 bagian tersulit (biasanya yang dipancing interviewer): bottleneck, hot key, konsistensi, kegagalan komponen. Untuk tiap keputusan sebut alternatifnya dan mengapa ditolak. Tutup dengan 2–3 menit ringkasan: apa yang akan dimonitor dan apa yang dikerjakan bila skala naik 10x.'),
            ],
          },
        ],
      },
      code('Template papan tulis', `REQUIREMENT
  Fungsional    : 1) ...  2) ...  3) ...        Di luar lingkup: ...
  Non-fungsional: DAU ..., baca:tulis ..., p99 < ... ms, availability ..., konsistensi ...

ESTIMASI (asumsi ditulis!)
  QPS tulis ~ ... | QPS baca ~ ... | puncak ~ 3x
  Storage/tahun ~ ... | Cache ~ ... | Bandwidth ~ ...

API
  POST /...   GET /...

DATA
  tabel/kunci utama, partition key, index

DIAGRAM
  client -> LB -> service -> cache -> DB
                         +-> queue -> worker

DEEP DIVE: 1) ...  2) ...  3) ...       TRADE-OFF: ... vs ...`, 'text'),

      heading('Back-of-the-envelope: angka yang perlu dihafal'),
      paragraph('Angka di bawah adalah **orde besaran** (dibulatkan dari tabel "latency numbers every programmer should know" yang dipopulerkan Jeff Dean dan versi interaktif Colin Scott). Yang penting perbandingannya: memori ~100x lebih cepat dari SSD acak, jaringan antarbenua ~1.000x lebih lambat dari jaringan dalam data center.'),
      table(['Operasi', 'Perkiraan', 'Implikasi desain'], [
        ['Referensi L1 cache', '~1 ns', 'Struktur data rapat (array) jauh lebih cepat dari pointer chasing'],
        ['Lock/unlock mutex tanpa kontensi', '~20 ns', 'Murah; yang mahal adalah kontensi'],
        ['Referensi memori utama (RAM)', '~100 ns', 'Cache in-process: lookup ratusan ns'],
        ['Kirim 1 KB lewat jaringan 1 Gbps', '~10 µs', 'Payload kecil itu murah; payload MB tidak'],
        ['Baca 4 KB acak dari SSD NVMe', '~20–100 µs', 'Index B-tree yang muat di RAM menghindari ini'],
        ['Baca 1 MB berurutan dari RAM / SSD', '~5 µs / ~50 µs', 'Scan berurutan jauh lebih murah dari akses acak'],
        ['Round trip dalam satu data center/AZ', '~0,5 ms', 'Satu panggilan Redis/DB minimal ±0,5–1 ms; 50 panggilan berurutan = 50 ms'],
        ['Seek disk HDD', '~5–10 ms', 'Alasan HDD hanya untuk arsip/berurutan'],
        ['Round trip Jakarta–Singapura', '~10–20 ms', 'Region `ap-southeast-1` vs `ap-southeast-3` (Jakarta)'],
        ['Round trip Jakarta–AS Barat', '~170–200 ms', 'Replikasi sinkron lintas benua hampir selalu tidak bisa diterima'],
      ]),
      table(['Konversi cepat', 'Nilai'], [
        ['1 hari', '86.400 detik ≈ **10⁵ detik** (bulatkan ke 100 ribu)'],
        ['1 juta request/hari', '≈ 12 QPS'],
        ['100 juta request/hari', '≈ 1.200 QPS'],
        ['1 miliar request/hari', '≈ 12.000 QPS'],
        ['Puncak (peak)', '2–3x rata-rata harian; 5–10x saat flash sale/Harbolnas/tanggal gajian'],
        ['2¹⁰ / 2²⁰ / 2³⁰ / 2⁴⁰', '≈ 1 ribu (KB) / 1 juta (MB) / 1 miliar (GB) / 1 triliun (TB)'],
        ['1 tahun', '≈ 3,15 × 10⁷ detik; untuk storage cukup "×365 ≈ ×400"'],
      ]),
      subheading('Contoh perhitungan: aplikasi berbagi foto'),
      code('Estimasi dengan asumsi eksplisit', `ASUMSI
  DAU                  = 10 juta
  Upload per user/hari = 0,2 foto   -> 2 juta foto/hari
  Lihat per user/hari  = 50 foto    -> 500 juta view/hari
  Ukuran foto (sudah dikompres, beberapa resolusi) = 500 KB
  Metadata per foto    = 1 KB

QPS
  Tulis : 2.000.000 / 100.000 detik      ~ 20 QPS     (puncak x3 ~ 60)
  Baca  : 500.000.000 / 100.000 detik    ~ 5.000 QPS  (puncak x3 ~ 15.000)
  -> read-heavy 250:1 -> cache + CDN untuk gambar, replika baca untuk metadata

STORAGE PER TAHUN
  Foto     : 2 juta x 500 KB = 1 TB/hari  -> ~365 TB/tahun (object storage, bukan DB)
  Metadata : 2 juta x 1 KB   = 2 GB/hari  -> ~730 GB/tahun (muat di satu cluster SQL + replika)
  Replikasi x3 di object storage biasanya sudah termasuk harga layanan (mis. S3)

BANDWIDTH KELUAR
  5.000 view/detik x 500 KB = 2,5 GB/detik = ~20 Gbps -> wajib CDN

CACHE METADATA
  20% foto "panas" dari upload 30 hari: 0,2 x 60 juta x 1 KB = 12 GB -> satu node Redis cukup`, 'text'),
      callout('info', 'Cara membulatkan', 'Pakai satu angka signifikan. 86.400 jadi 100.000, 365 jadi 400 bila perlu. Interviewer menilai apakah kesimpulanmu (perlu CDN, perlu sharding, cukup satu DB) masuk akal, bukan ketepatan angka.'),

      heading('Building blocks dan kapan memakainya'),
      table(['Komponen', 'Fungsi', 'Pakai saat', 'Trade-off / angka kasar'], [
        ['Load balancer (L4/L7)', 'Membagi trafik ke instance stateless; health check', 'Selalu, begitu ada >1 instance', 'L7 bisa routing per path & terminasi TLS, tapi lebih mahal dari L4. Butuh sticky session untuk koneksi stateful (WebSocket)'],
        ['Cache (Redis/Memcached)', 'Simpan hasil baca panas di RAM', 'Rasio baca:tulis tinggi, data boleh sedikit basi', 'Invalidation & stampede. Redis satu node ±100 ribu ops/detik untuk perintah sederhana'],
        ['CDN', 'Cache konten statis/semi-statis di edge dekat user', 'Gambar, video, JS/CSS, respons publik yang bisa di-cache', 'Purge butuh waktu; konten personal sulit di-cache'],
        ['Message queue / log (SQS, RabbitMQ, Kafka)', 'Memisahkan produsen & konsumen; meratakan lonjakan', 'Pekerjaan async, fan-out event, integrasi antar-service', 'At-least-once → konsumen wajib idempoten; menambah latency & kompleksitas operasional'],
        ['SQL (PostgreSQL, MySQL)', 'Relasi, transaksi ACID, query fleksibel', 'Data relasional, uang, invarian kuat', 'Scale tulis vertikal dulu; sharding manual itu mahal'],
        ['NoSQL (DynamoDB, Cassandra, MongoDB)', 'Skala horizontal dengan pola akses yang sudah diketahui', 'Throughput tulis sangat tinggi, akses by key, skema fleksibel', 'Join & transaksi terbatas; desain tabel mengikuti query'],
        ['Replication', 'Salinan data di beberapa node', 'Availability & scale baca', 'Async → replica lag (baca basi); sync → latency tulis naik'],
        ['Sharding (partitioning)', 'Membagi data ke banyak node berdasarkan kunci', 'Data/tulis melebihi kapasitas satu node', 'Query lintas shard mahal; pemilihan shard key menentukan hot partition'],
        ['Consistent hashing', 'Memetakan kunci ke node sehingga penambahan node hanya memindahkan ±1/N data', 'Cache terdistribusi, KV store, sharding dinamis', 'Perlu virtual node agar beban merata'],
        ['Object storage (S3)', 'Blob murah, sangat awet', 'File, gambar, backup, arsip', 'Latency puluhan ms; bukan untuk data transaksional'],
      ]),

      heading('Red flags yang membuat gagal interview'),
      list([
        '**Langsung menggambar** tanpa bertanya requirement, atau menyebut teknologi ("pakai Kafka dan Kubernetes") sebelum masalahnya jelas.',
        '**Tidak ada angka** sama sekali, sehingga tidak bisa membenarkan sharding, cache, atau CDN.',
        '**Over-engineering**: microservices, multi-region active-active, dan event sourcing untuk sistem 50 QPS.',
        '**Single point of failure** yang tidak disadari (satu DB tanpa replika, satu instance stateful).',
        '**Tidak menyebut trade-off**: setiap pilihan disajikan seolah tanpa kekurangan.',
        '**Mengabaikan kegagalan**: apa yang terjadi bila cache mati, queue penuh, pihak ketiga timeout, atau pesan terkirim dua kali.',
        '**Defensif saat dikoreksi**. Petunjuk interviewer adalah bantuan; akui, sesuaikan, lanjutkan.',
        '**Menghabiskan waktu di detail kecil** (nama kolom, framework) sementara alur end-to-end belum selesai.',
      ]),
      callout('warn', 'Kalimat yang membantu', 'Biasakan pola: "Saya pilih **X** karena **requirement Y**; kekurangannya **Z**, yang saya mitigasi dengan **W**. Bila requirement berubah menjadi **V**, saya akan pindah ke **U**." Pola ini otomatis menunjukkan trade-off.'),
      ...practice('sd-kerangka', [
        'Hafalkan tabel latency di atas, lalu tulis ulang dari ingatan dengan selisih orde besaran paling banyak satu.',
        'Lakukan estimasi lengkap (QPS rata-rata & puncak, storage/tahun, bandwidth, cache) untuk aplikasi ojek online dengan 5 juta perjalanan/hari dalam 5 menit.',
        'Rekam diri sendiri menjawab "Design Instagram" 45 menit memakai template papan tulis; periksa pembagian waktu tiap langkah.',
        'Untuk setiap baris tabel building blocks, sebutkan satu sistem yang pernah kamu kerjakan yang memakainya dan alasannya.',
      ]),
      references(
        ['Google SRE Book: Service Level Objectives', 'https://sre.google/sre-book/service-level-objectives/'],
        ['Colin Scott: Latency Numbers Every Programmer Should Know (interaktif)', 'https://colin-scott.github.io/personal_website/research/interactive_latency.html'],
        ['Jonas Bonér: Latency numbers (gist asal tabel Jeff Dean)', 'https://gist.github.com/jboner/2841832'],
        ['Amazon Dynamo paper (consistent hashing, replikasi)', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'],
        ['System Design Primer (GitHub)', 'https://github.com/donnemartin/system-design-primer'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-url-shortener',
    title: 'Studi Kasus: Design URL Shortener',
    summary:
      'Membuat & me-redirect short link: estimasi 100 juta URL/bulan, pembuatan ID (hash vs counter vs range), 301 vs 302, cache, sharding, dan analytics klik.',
    track: TRACK, source: systemDesignSource, duration: '1,5 jam', level: 'Med',
    blocks: [
      paragraph('Soal pembuka klasik karena kecil tetapi menyentuh banyak hal: pembuatan ID unik terdistribusi, sistem read-heavy, caching, dan pemisahan jalur baca (redirect) dari jalur analytics.'),
      callout('tip', 'Materi pendukung', 'Pola cache-aside dan TTL di [Caching](#distributed.caching); index & primary key di [Index & Optimasi Query](#sql.index-optimasi-query); pemilihan store di [Perbandingan SQL vs NoSQL](#sql.perbandingan-sql-vs-nosql).'),

      heading('1. Requirement'),
      table(['Fungsional', 'Non-fungsional'], [
        ['Membuat short URL dari long URL (opsional custom alias)', 'Redirect cepat: p99 < 50 ms di sisi server'],
        ['Redirect short URL ke long URL', 'Availability tinggi untuk redirect (99,99%); pembuatan boleh 99,9%'],
        ['Masa berlaku (expiry) opsional', 'Short code tidak mudah ditebak berurutan'],
        ['Statistik klik dasar (opsional, async)', 'Data awet: link yang sudah dibagikan tidak boleh hilang'],
      ]),
      callout('info', 'Di luar lingkup (sebut eksplisit)', 'Edit tujuan link, dashboard analytics real-time yang kompleks, akun & billing. Sebutkan bahwa analytics tidak boleh memperlambat redirect.'),

      heading('2. Estimasi'),
      code('Asumsi & hitungan', `ASUMSI
  URL baru          = 100 juta/bulan
  Rasio baca:tulis  = 100:1
  Simpan            = 5 tahun
  Ukuran record     = ~500 byte (long URL rata-rata ~100-200 byte + metadata + overhead index)

QPS
  Tulis : 100 juta / (30 x 86.400) ~ 40/detik       puncak ~ 100/detik
  Baca  : 40 x 100                 ~ 4.000/detik    puncak ~ 10.000-20.000/detik

STORAGE
  Record : 100 juta x 12 x 5       = 6 miliar record
  Ukuran : 6 miliar x 500 B        ~ 3 TB (sebelum replikasi)

RUANG KUNCI
  Base62, 7 karakter: 62^7 ~ 3,5 triliun  >> 6 miliar  -> cukup, sisa ruang besar

CACHE
  Baca harian: 4.000 x 86.400 ~ 350 juta. 20% terpanas x 500 B ~ 35 GB (batas atas,
  karena banyak baca mengenai URL yang sama) -> satu cluster Redis kecil`, 'text'),

      heading('3. API'),
      code('REST API', `POST /api/v1/urls
Authorization: Bearer <token>
{ "longUrl": "https://toko.example.co.id/promo/12-12?utm_source=ig",
  "customAlias": "promo1212",          // opsional
  "expiresAt": "2026-12-31T23:59:59+07:00" }

201 Created
{ "shortCode": "promo1212", "shortUrl": "https://sho.rt/promo1212" }
409 Conflict  -> alias sudah dipakai

GET /{shortCode}
302 Found
Location: https://toko.example.co.id/promo/12-12?utm_source=ig
404 Not Found / 410 Gone (sudah kedaluwarsa)`, 'text'),

      heading('4. Skema data'),
      code('Tabel utama (akses hampir selalu by key)', `CREATE TABLE short_url (
    short_code  VARCHAR(16)  PRIMARY KEY,      -- juga partition/shard key
    long_url    TEXT         NOT NULL,
    owner_id    BIGINT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ,
    is_custom   BOOLEAN      NOT NULL DEFAULT false
);

-- Opsional: dedupe "URL yang sama dari user yang sama -> kode yang sama"
CREATE UNIQUE INDEX ux_owner_url ON short_url (owner_id, md5(long_url));`, 'sql'),
      paragraph('Pola aksesnya murni key-value, sehingga **DynamoDB/Cassandra** dengan `short_code` sebagai partition key sangat cocok. PostgreSQL juga sah: 3 TB masih bisa ditangani satu primary besar plus replika baca, lalu dipartisi berdasarkan hash `short_code` bila tumbuh. Sebut keduanya dan alasanmu memilih.'),

      heading('5. Diagram high-level'),
      code('Arsitektur', `  Browser
     |  GET /aB3xK9p                         POST /api/v1/urls
     v                                              |
 +-------+  hit: 302 langsung dari edge             |
 |  CDN  |-------------------------> Browser        |
 +-------+                                          |
     | miss                                         |
     v                                              v
 +---------------+                          +---------------+
 | Load Balancer |------------------------->|   Write API   |
 +---------------+                          +---------------+
     |                                        |           |
     v                                        | minta     | INSERT
 +--------------------+    cache-aside        | blok ID   |
 |  Redirect Service  |-------------+         v           |
 |  (stateless)       |             |   +-----------+     |
 +--------------------+             |   | ID range  |     |
     |                              |   | allocator |     |
     | event klik (async)           v   +-----------+     v
     v                        +-------------+     +------------------+
 +---------+                  | Redis cache |---->|    URL store     |
 |  Kafka  |                  +-------------+ miss| (KV atau SQL,    |
 +---------+                                      |  shard by        |
     |                                            |  short_code)     |
     v                                            +------------------+
 +------------------------+
 | Analytics -> ClickHouse|
 +------------------------+`, 'text'),

      heading('6. Deep dive'),
      subheading('Pembuatan short code'),
      table(['Pendekatan', 'Cara kerja', 'Kelebihan', 'Kekurangan'], [
        ['Hash long URL', 'Ambil 7 karakter base62 dari SHA-256(long_url + salt)', 'URL sama → kode sama (dedupe gratis)', 'Collision: harus cek DB lalu ulangi dengan salt lain; makin penuh makin sering'],
        ['Counter global + base62', 'Sequence DB 1, 2, 3 … diubah ke base62', 'Tanpa collision, kode pendek', 'Counter jadi bottleneck & SPOF; kode berurutan mudah ditebak/di-scrape'],
        ['**Range allocation** (dipilih)', 'Tiap instance Write API meminta blok 10.000 ID dari allocator (tabel sequence/etcd), lalu membagikan dari memori', 'Tanpa koordinasi per request, tanpa collision', 'ID yang belum terpakai hilang saat instance mati (tidak masalah, ruang kunci sangat besar)'],
        ['Snowflake 64-bit', 'timestamp + worker id + sequence', 'Tanpa koordinasi pusat', 'Base62 dari 64-bit = 11 karakter, lebih panjang'],
      ]),
      paragraph('Agar kode tidak berurutan, ID numerik dilewatkan ke **permutasi bijektif** di ruang 62⁷ (mis. perkalian dengan bilangan prima besar modulo 62⁷, atau Feistel cipher kecil) sebelum di-encode base62. Hasilnya tetap unik tanpa cek collision, tetapi tidak bisa di-enumerasi. Custom alias diperlakukan terpisah: `INSERT` dengan constraint unik, gagal → 409.'),
      subheading('301 vs 302'),
      paragraph('**301 (Moved Permanently)** di-cache browser dan CDN sehingga klik berikutnya tidak menyentuh server: beban turun drastis, tetapi analytics hilang dan link yang kedaluwarsa tetap mengarah ke tujuan lama di browser yang sudah meng-cache. **302/307** membuat setiap klik melewati server sehingga statistik akurat dan expiry/penghapusan berlaku segera. Kompromi umum: 302 dengan `Cache-Control: private, max-age=...` pendek, dan CDN meng-cache di edge dengan TTL beberapa menit sambil tetap mengirim log klik dari edge.'),
      subheading('Jalur baca & analytics'),
      list([
        'Redirect service hanya membaca cache → store. Cache-aside dengan TTL beberapa jam; simpan juga **negative cache** singkat untuk kode yang tidak ada agar scraping kode acak tidak menghantam DB.',
        'Event klik dikirim **fire-and-forget** ke Kafka (atau ditulis ke log lokal lalu dikirim batch). Kegagalan analytics tidak boleh menggagalkan redirect.',
        'Konsumen meng-agregasi ke database OLAP (ClickHouse/BigQuery) per menit/jam.',
        'Keamanan: cek long URL terhadap daftar phishing/malware saat dibuat, rate limit pembuatan per user/IP, dan halaman peringatan untuk link mencurigakan.',
      ]),

      heading('7. Trade-off'),
      table(['Keputusan', 'Pilihan', 'Alternatif', 'Alasan'], [
        ['Store', 'KV store (DynamoDB/Cassandra)', 'PostgreSQL + partisi', 'Akses murni by key, skala tulis/baca horizontal; SQL tetap valid bila tim lebih menguasainya'],
        ['Short code', 'Range allocation + permutasi + base62', 'Hash + cek collision', 'Tanpa collision, tanpa round trip koordinasi per request'],
        ['Redirect', '302 + CDN TTL pendek', '301', 'Analytics akurat & expiry berlaku; beban tetap ditekan CDN'],
        ['Analytics', 'Async via Kafka', 'Tulis counter di request', 'Redirect tidak terhambat oleh tulis analytics'],
      ]),
      ...followUps([
        ['SDU-01', 'Bagaimana bila satu link viral menerima 100.000 klik/detik?', 'Itu hot key. Lapisan pertama adalah CDN: dengan TTL edge 1–5 menit hampir semua klik dilayani edge. Di belakangnya, Redirect Service bisa memakai cache in-process (LRU kecil, TTL detik) sehingga satu node Redis tidak menerima seluruh beban. Bila memakai Redis Cluster, kunci panas tetap berada di satu shard; replika baca atau cache lokal memecahkannya. Analytics untuk link ini diagregasi di produsen (hitung per detik lalu kirim satu event) agar Kafka tidak dibanjiri.'],
        ['SDU-02', 'Bagaimana menghapus atau mengubah tujuan link bila sudah dipakai 301?', 'Dengan 301, browser yang sudah meng-cache tidak akan bertanya lagi ke server, sehingga perubahan tidak bisa dijamin. Ini alasan memilih 302/307 bila link boleh diedit/dihapus atau punya expiry. Di sisi server: hapus/ubah record, invalidasi Redis (delete key), lalu purge CDN untuk path tersebut.'],
        ['SDU-03', 'Allocator ID mati. Apa dampaknya?', 'Redirect sama sekali tidak terpengaruh. Pembuatan link tetap berjalan selama tiap instance masih punya sisa blok ID di memori; dengan blok 10.000 dan ±100 tulis/detik per cluster, cadangan cukup beberapa menit hingga jam. Allocator dibuat highly available (tabel sequence di DB yang sudah direplikasi, atau etcd 3 node), dan instance meminta blok baru saat sisa di bawah 20% agar ada waktu untuk retry.'],
      ]),
      ...practice('sd-url-shortener', [
        'Ulangi estimasi dengan asumsi 1 miliar URL/bulan; tentukan apakah PostgreSQL tunggal masih masuk akal.',
        'Tulis fungsi encode/decode base62 dan permutasi bijektif modulo 62⁷, lalu uji bahwa 1 juta ID pertama tidak ada yang bentrok.',
        'Gambar ulang diagram tanpa melihat dan jelaskan alur GET dari browser sampai storage dalam 2 menit.',
        'Jelaskan secara lisan kapan memilih 301 dan kapan 302 dengan contoh bisnis nyata.',
      ]),
      references(
        ['RFC 9110: HTTP Semantics (status 3xx)', 'https://www.rfc-editor.org/rfc/rfc9110.html'],
        ['MDN: 301 Moved Permanently', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/301'],
        ['MDN: 302 Found', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302'],
        ['Twitter Snowflake (arsip GitHub)', 'https://github.com/twitter-archive/snowflake'],
        ['AWS Builders\' Library: Caching challenges and strategies', 'https://aws.amazon.com/builders-library/caching-challenges-and-strategies/'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-rate-limiter',
    title: 'Studi Kasus: Design Rate Limiter',
    summary:
      'Token bucket, leaky bucket, fixed & sliding window dibandingkan; implementasi token bucket di Go; versi terdistribusi atomik dengan Redis + Lua; penempatan, fail-open, dan header 429.',
    track: TRACK, source: systemDesignSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Rate limiter melindungi layanan dari lonjakan, penyalahgunaan, dan *noisy neighbor* di sistem multi-tenant. Soal ini menguji pemahaman algoritma, atomisitas di lingkungan terdistribusi, dan keputusan operasional (apa yang terjadi bila limiter sendiri gagal).'),
      callout('tip', 'Materi pendukung', 'Posisi rate limiting di arsitektur dibahas di [API Gateway](#distributed.api-gateway) dan [Resilience & Fault Tolerance](#distributed.resilience-fault-tolerance).'),

      heading('1. Requirement'),
      table(['Fungsional', 'Non-fungsional'], [
        ['Batasi request per kunci (user, API key, IP, endpoint) sesuai aturan, mis. 100 request/menit', 'Overhead kecil: < 1–2 ms per request'],
        ['Aturan berbeda per tier (gratis vs berbayar) dan per endpoint', 'Akurat di seluruh cluster (bukan per instance)'],
        ['Respons 429 dengan informasi kapan boleh mencoba lagi', 'Tetap tersedia: kegagalan limiter tidak boleh menjatuhkan API'],
        ['Izinkan burst wajar', 'Skala: 50.000 RPS puncak, ±1 juta kunci aktif'],
      ]),

      heading('2. Estimasi'),
      code('Asumsi & hitungan', `RPS puncak di gateway           = 50.000
Kunci aktif (API key/user)      = 1 juta
State per kunci (token bucket)  = 2 angka (tokens, ts) dalam Redis hash ~ 100-150 B
Memori                          = 1 juta x 150 B ~ 150 MB      -> kecil
Operasi Redis                   = 1 skrip Lua per request = 50.000 eval/detik
  Satu shard Redis menangani puluhan ribu eval sederhana/detik
  -> Redis Cluster 3-6 shard (kunci tersebar merata), plus replika untuk failover
Latency tambahan                = 1 round trip dalam AZ ~ 0,3-1 ms`, 'text'),

      heading('3. Algoritma'),
      table(['Algoritma', 'Cara kerja', 'Burst', 'Memori per kunci', 'Akurasi', 'Contoh pemakaian'], [
        ['**Token bucket**', 'Bucket berkapasitas B diisi r token/detik; tiap request mengambil 1 token', 'Diizinkan sampai B', '2 angka', 'Baik', 'API publik (AWS API Gateway, Stripe)'],
        ['**Leaky bucket**', 'Request masuk antrean, diproses keluar dengan laju tetap', 'Diserap antrean, keluaran rata', 'Antrean / 2 angka', 'Baik', 'Traffic shaping, `limit_req` NGINX'],
        ['**Fixed window counter**', 'Counter per jendela (mis. per menit) di-reset tiap jendela', 'Hingga 2x di batas jendela', '1 counter', 'Kasar', 'Kuota harian sederhana'],
        ['**Sliding window log**', 'Simpan timestamp tiap request (sorted set), hapus yang di luar jendela', 'Tidak', 'O(jumlah request di jendela)', 'Tepat', 'Limit kecil yang harus akurat (login, OTP)'],
        ['**Sliding window counter**', 'Counter jendela sekarang + counter jendela lalu × porsi overlap', 'Hampir tidak', '2 counter', 'Aproksimasi (Cloudflare: ±0,003% salah putus)', 'Limit volume besar di edge'],
      ]),
      callout('warn', 'Masalah batas jendela (fixed window)', 'Limit 100/menit: 100 request di 12:00:59 dan 100 lagi di 12:01:00 sama-sama lolos, sehingga dalam 2 detik masuk 200 request. Sliding window counter memperbaiki ini dengan biaya hampir sama: `perkiraan = hitung_sekarang + hitung_lalu × (1 − detik_berlalu/60)`.'),

      subheading('Token bucket di satu proses (Go)'),
      code('ratelimit/token_bucket.go', `package ratelimit

import (
	"sync"
	"time"
)

// TokenBucket: kapasitas = burst maksimum, rate = token yang ditambahkan per detik.
type TokenBucket struct {
	mu       sync.Mutex
	capacity float64
	rate     float64
	tokens   float64
	last     time.Time
	now      func() time.Time // bisa diganti jam palsu di test
}

func NewTokenBucket(capacity, ratePerSec float64) *TokenBucket {
	return &TokenBucket{
		capacity: capacity,
		rate:     ratePerSec,
		tokens:   capacity, // mulai penuh: burst awal diizinkan
		last:     time.Now(),
		now:      time.Now,
	}
}

// Allow mengambil n token bila tersedia. Pengisian ulang dihitung "malas" saat dipanggil,
// jadi tidak perlu goroutine/timer per bucket.
func (b *TokenBucket) Allow(n float64) bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := b.now()
	elapsed := now.Sub(b.last).Seconds()
	b.last = now
	b.tokens = min(b.capacity, b.tokens+elapsed*b.rate)

	if b.tokens < n {
		return false
	}
	b.tokens -= n
	return true
}

// Pemakaian: 100 request/menit dengan burst 20
//   tb := NewTokenBucket(20, 100.0/60)
//   if !tb.Allow(1) { http.Error(w, "too many requests", http.StatusTooManyRequests) }`, 'go'),
      paragraph('Untuk produksi di satu proses, pakai `golang.org/x/time/rate` (token bucket yang sudah teruji). Bucket per kunci disimpan di map dengan eviksi (LRU/TTL), jika tidak memori bocor seiring bertambahnya IP/user. Namun limiter in-process hanya akurat **per instance**: dengan 10 instance di belakang load balancer, limit efektif menjadi ±10x.'),

      subheading('Versi terdistribusi: Redis + Lua (atomik)'),
      paragraph('Implementasi naif `GET` lalu `SET` dari aplikasi punya race condition: dua instance membaca token = 1 bersamaan dan keduanya lolos. Skrip Lua dieksekusi Redis secara **atomik** (tidak ada perintah lain yang diselipkan di tengahnya), sehingga baca-hitung-tulis menjadi satu langkah. Jam diambil dari `TIME` milik Redis agar tidak bergantung pada jam tiap server aplikasi yang bisa berbeda.'),
      code('ratelimit/redis_bucket.go (go-redis v9)', `package ratelimit

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

// KEYS[1] = kunci bucket; ARGV = kapasitas, token/detik, token diminta
var tokenBucketScript = redis.NewScript(\`
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])
local need     = tonumber(ARGV[3])

local t   = redis.call('TIME')                       -- jam server Redis
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)   -- ms

local s      = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(s[1]) or capacity
local ts     = tonumber(s[2]) or now

tokens = math.min(capacity, tokens + (now - ts) / 1000 * rate)

local allowed = 0
if tokens >= need then
  tokens  = tokens - need
  allowed = 1
end

redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
-- kunci kedaluwarsa setelah bucket pasti penuh lagi: kunci idle tidak memakan memori
redis.call('PEXPIRE', KEYS[1], math.ceil(capacity / rate * 1000) + 1000)

return { allowed, math.floor(tokens) }
\`)

type RedisLimiter struct {
	rdb      *redis.Client
	capacity int
	rate     float64
}

// Allow mengembalikan (diizinkan, sisa token). Hash tag {..} menjaga satu kunci di satu slot Redis Cluster.
func (l *RedisLimiter) Allow(ctx context.Context, clientID string) (bool, int64, error) {
	key := fmt.Sprintf("rl:{%s}", clientID)
	res, err := tokenBucketScript.Run(ctx, l.rdb, []string{key}, l.capacity, l.rate, 1).Int64Slice()
	if err != nil {
		return true, 0, err // fail-open: keputusan sadar, lihat bagian trade-off
	}
	return res[0] == 1, res[1], nil
}`, 'go'),
      callout('info', 'Catatan teknis', '`Script.Run` memakai `EVALSHA` dan otomatis jatuh ke `EVAL` bila skrip belum ter-cache di Redis. Redis 7+ mereplikasi *efek* skrip (bukan teks skripnya), sehingga memanggil `TIME` di dalam skrip aman untuk replika. Untuk sliding window log, pakai sorted set: `ZREMRANGEBYSCORE` (buang yang lama) → `ZCARD` → `ZADD`, juga di dalam satu skrip.'),

      heading('4. Diagram high-level'),
      code('Penempatan limiter', `                      aturan (tier, endpoint, limit)
                      +--------------------------+
                      |  Rules store (DB/config) |---- dimuat & di-cache tiap node
                      +--------------------------+
                                   |
 Client --> CDN/WAF --> +----------------------------+     +----------------------+
 (limit IP kasar)       | API Gateway / middleware   |---->| Redis Cluster        |
                        |  1. tentukan kunci & aturan|<----| (state bucket,       |
                        |  2. EVALSHA token bucket   |     |  sharded by kunci)   |
                        |  3. lolos -> teruskan      |     +----------------------+
                        |     tolak -> 429           |
                        +----------------------------+
                                   | lolos
                                   v
                          +------------------+
                          | Service backend  |
                          +------------------+`, 'text'),
      code('Respons ditolak', `HTTP/1.1 429 Too Many Requests
Retry-After: 12
RateLimit-Policy: "default";q=100;w=60
RateLimit: "default";r=0;t=12
Content-Type: application/problem+json

{ "type": "https://api.example.co.id/errors/rate-limited",
  "title": "Terlalu banyak request", "status": 429 }`, 'text'),
      paragraph('`429` dan `Retry-After` adalah standar (RFC 6585, RFC 9110). Header `RateLimit`/`RateLimit-Policy` berasal dari draft IETF `httpapi-ratelimit-headers` yang masih berkembang; banyak API memakai varian lama `X-RateLimit-Limit/Remaining/Reset`. Yang penting: konsisten dan terdokumentasi.'),

      heading('5. Deep dive'),
      list([
        '**Di mana dipasang?** Edge/WAF untuk limit IP kasar (anti-DDoS), API gateway untuk limit per API key/tier, dan di dalam service untuk sumber daya mahal (mis. endpoint laporan). Lapisan berbeda melindungi hal berbeda.',
        '**Fail-open vs fail-closed.** Bila Redis tidak terjangkau: fail-open (izinkan) menjaga availability tetapi kehilangan perlindungan; fail-closed (tolak) aman untuk endpoint sensitif seperti login/OTP. Pilihan umum: fail-open dengan fallback limiter lokal per instance yang lebih longgar, ditambah alert.',
        '**Hot key.** Satu API key besar menumpuk di satu shard. Solusi: pecah kuota ke beberapa sub-kunci (`rl:{key}:0..3`), atau limiter lokal yang mengambil "jatah" token dari Redis per batch (mis. 100 token sekaligus) sehingga round trip berkurang.',
        '**Multi-region.** Limit global yang akurat membutuhkan koordinasi lintas region (latency puluhan–ratusan ms). Biasanya kuota dibagi per region (mis. 60/40 sesuai trafik) dan diterima sedikit ketidakakuratan.',
        '**Load shedding berbeda dengan rate limiting.** Rate limit menegakkan kontrak per klien; load shedding menolak trafik saat server sendiri kelebihan beban, apa pun kuota kliennya. Sistem matang butuh keduanya.',
      ]),

      heading('6. Trade-off'),
      table(['Keputusan', 'Pilihan', 'Alternatif', 'Alasan'], [
        ['Algoritma', 'Token bucket', 'Sliding window counter', 'Mengizinkan burst wajar, state kecil, mudah dijelaskan ke klien'],
        ['State', 'Redis terpusat + Lua', 'In-memory per instance', 'Akurat di seluruh cluster; biaya ±1 ms per request'],
        ['Kegagalan Redis', 'Fail-open + limiter lokal', 'Fail-closed', 'Availability API lebih penting dari akurasi limit, kecuali endpoint keamanan'],
        ['Multi-region', 'Kuota dibagi per region', 'Counter global sinkron', 'Menghindari latency lintas region di jalur setiap request'],
      ]),
      ...followUps([
        ['SDR-01', 'Mengapa tidak cukup `INCR` + `EXPIRE` dari aplikasi?', 'Itu fixed window counter: bisa lolos 2x limit di batas jendela. Selain itu, bila `INCR` dan `EXPIRE` dikirim terpisah lalu aplikasi crash di antaranya, kunci tidak pernah kedaluwarsa dan klien terkunci selamanya. Gunakan `SET key 0 EX 60 NX` lalu `INCR`, pipeline `MULTI/EXEC`, atau skrip Lua agar atomik. Untuk akurasi yang lebih baik pakai sliding window counter atau token bucket.'],
        ['SDR-02', 'Klien berperilaku baik tetapi terkena 429 saat retry. Bagaimana mencegah retry storm?', 'Server mengirim `Retry-After`; klien wajib mematuhinya dan memakai exponential backoff dengan jitter. Server bisa membedakan kuota untuk request idempoten yang di-retry, dan SDK resmi membatasi jumlah retry (retry budget). Tanpa jitter, ribuan klien yang ditolak bersamaan akan kembali bersamaan dan memicu lonjakan berikutnya.'],
        ['SDR-03', 'Bagaimana menerapkan limit "1.000 request/hari per merchant" dan "10 request/detik per merchant" sekaligus?', 'Evaluasi dua aturan untuk kunci yang sama dalam satu skrip Lua (dua bucket/jendela) sehingga atomik: request hanya diizinkan bila keduanya lolos, dan token hanya dikurangi bila keduanya lolos. Kuota harian cocok dengan fixed window yang di-reset pada pukul 00:00 WIB (jelaskan zona waktunya ke klien), sedangkan limit per detik memakai token bucket.'],
      ]),
      ...practice('sd-rate-limiter', [
        'Implementasikan token bucket Go di atas beserta unit test memakai jam palsu (`now`) untuk burst, isi ulang, dan batas kapasitas.',
        'Jalankan skrip Lua di Redis lokal dan uji dengan 50 goroutine paralel bahwa jumlah request yang lolos tidak melebihi kapasitas + rate × durasi.',
        'Implementasikan sliding window counter dan bandingkan hasilnya dengan fixed window pada pola trafik di batas menit.',
        'Tulis keputusan fail-open/fail-closed untuk tiga endpoint (login, katalog produk, transfer dana) beserta alasannya.',
      ]),
      references(
        ['Stripe: Scaling your API with rate limiters', 'https://stripe.com/blog/rate-limiters'],
        ['Cloudflare: How we built rate limiting capable of scaling to millions of domains', 'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/'],
        ['Redis: Scripting with Lua', 'https://redis.io/docs/latest/develop/interact/programmability/eval-intro/'],
        ['Redis: INCR (pola rate limiter)', 'https://redis.io/docs/latest/commands/incr/'],
        ['AWS Builders\' Library: Fairness in multi-tenant systems', 'https://aws.amazon.com/builders-library/fairness-in-multi-tenant-systems/'],
        ['AWS Builders\' Library: Using load shedding to avoid overload', 'https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/'],
        ['IETF draft: RateLimit header fields for HTTP', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/'],
        ['RFC 6585: status 429 Too Many Requests', 'https://www.rfc-editor.org/rfc/rfc6585.html'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-chat-realtime',
    title: 'Studi Kasus: Design Aplikasi Chat Real-time',
    summary:
      'Chat 1:1 & grup gaya WhatsApp: WebSocket gateway stateful, session registry, urutan pesan per percakapan, delivery & read receipt, presence, penyimpanan pesan, fan-out grup, dan sinkronisasi multi-device.',
    track: TRACK, source: systemDesignSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Chat menguji sistem **stateful**: jutaan koneksi persisten, routing pesan ke koneksi yang tepat, dan jaminan bahwa pesan tidak hilang, tidak dobel, dan tampil berurutan, walau jaringan seluler sering putus-sambung.'),
      callout('tip', 'Materi pendukung', 'Broker & pola pesan di [Message Queue / Message Broker](#distributed.message-queue-message-broker) dan [Pola Sistem Terdistribusi dengan Messaging](#go.pola-sistem-terdistribusi-dengan-messaging); partisi & urutan di Kafka pada [Kafka: Arsitektur, Topic, Partition & Offset](#interview.kafka-arsitektur-topic-partition-offset).'),

      heading('1. Requirement'),
      table(['Fungsional', 'Non-fungsional'], [
        ['Chat 1:1 dan grup (maks. 500 anggota)', 'Latency kirim–terima p99 < 300 ms bila keduanya online di region yang sama'],
        ['Status terkirim (✓), diterima (✓✓), dibaca', 'Tidak ada pesan hilang; duplikat tidak boleh tampil'],
        ['Indikator online/terakhir dilihat (presence)', 'Urutan konsisten dalam satu percakapan'],
        ['Riwayat tersinkron di banyak device', 'Availability tinggi; pengguna mobile sering reconnect'],
        ['Push notification saat offline', 'Data pesan awet; retensi sesuai kebijakan'],
      ]),
      callout('info', 'Di luar lingkup', 'Panggilan suara/video, end-to-end encryption (sebut saja: protokol Signal mengubah server menjadi relay ciphertext), dan media besar (cukup: upload ke object storage, kirim URL di pesan).'),

      heading('2. Estimasi'),
      code('Asumsi & hitungan', `ASUMSI
  DAU                     = 50 juta
  Pesan per user/hari     = 40
  Ukuran pesan + metadata = ~200 B
  Koneksi bersamaan puncak = 40% DAU = 20 juta

THROUGHPUT
  Pesan/hari  : 50 juta x 40          = 2 miliar
  Rata-rata   : 2 miliar / 86.400     ~ 23.000 pesan/detik
  Puncak (x3) :                       ~ 70.000 pesan/detik  (tulis ke storage)
  Pengiriman  : x rata-rata penerima (grup) -> beberapa ratus ribu deliver/detik

STORAGE
  2 miliar x 200 B = 400 GB/hari ~ 146 TB/tahun, x3 replikasi ~ 440 TB/tahun
  -> wide-column store (Cassandra/ScyllaDB), bukan satu instance SQL

KONEKSI
  Satu node gateway modern bisa menahan ratusan ribu koneksi idle (memori ~10-50 KB/koneksi).
  Konservatif 200 ribu/node -> 20 juta / 200 ribu = 100 node gateway (+ cadangan 30%)`, 'text'),

      heading('3. API & protokol'),
      code('Frame WebSocket (JSON untuk kejelasan; produksi sering protobuf)', `// client -> server: kirim pesan
{ "type": "send", "clientMsgId": "9f1c0b6e-...", "convId": "c_123",
  "body": "Halo, jadi meeting jam 3?", "sentAt": 1793353200000 }

// server -> pengirim: ACK setelah tersimpan (centang satu)
{ "type": "ack", "clientMsgId": "9f1c0b6e-...", "msgId": "7301559310741520384", "seq": 1842 }

// server -> penerima
{ "type": "message", "convId": "c_123", "msgId": "7301559310741520384", "seq": 1842,
  "from": "u_42", "body": "Halo, jadi meeting jam 3?" }

// penerima -> server: diterima & dibaca (watermark, bukan per pesan)
{ "type": "delivered", "convId": "c_123", "upToSeq": 1842 }
{ "type": "read",      "convId": "c_123", "upToSeq": 1842 }

// REST untuk sinkronisasi setelah reconnect
GET /v1/conversations/c_123/messages?afterSeq=1790&limit=100`, 'json'),

      heading('4. Skema data'),
      code('Cassandra/ScyllaDB (CQL, mirip SQL)', `-- Pesan disimpan SEKALI per percakapan, bukan per anggota.
CREATE TABLE messages (
    conv_id   text,
    bucket    int,          -- mis. hari/minggu, agar partisi tidak tumbuh tanpa batas
    seq       bigint,       -- urutan monoton dalam percakapan
    msg_id    bigint,       -- Snowflake: unik global, terurut waktu
    sender_id text,
    body      text,
    created_at timestamp,
    PRIMARY KEY ((conv_id, bucket), seq)
) WITH CLUSTERING ORDER BY (seq DESC);

-- Daftar percakapan & kursor per anggota
CREATE TABLE conversation_members (
    user_id        text,
    conv_id        text,
    last_read_seq  bigint,
    last_deliv_seq bigint,
    muted          boolean,
    PRIMARY KEY (user_id, conv_id)
);`, 'sql'),

      heading('5. Diagram high-level'),
      code('Arsitektur', `  Device A                                                     Device B
     |  WebSocket (TLS)                                  WebSocket  |
     v                                                              v
 +-----------+     +------------------+               +-----------+
 | Gateway 1 |---->|  Chat Service    |               | Gateway 7 |
 | (stateful)|     |  - beri seq      |               | (stateful)|
 +-----------+     |  - simpan pesan  |               +-----------+
     |             |  - cari gateway  |                     ^
     |             |    penerima      |---- route ke node --+
     |             +------------------+     (pub/sub per gateway)
     |                |        |      |
     |                v        v      +-------------------------+
     |      +-----------+ +------------------+                 v
     |      | Message   | | Session registry |        +-----------------+
     |      | store     | | Redis:           |        | Push Service    |
     |      | (Cassandra| | user -> gateway  |        | (FCM/APNs) bila |
     |      |  /Scylla) | | + presence TTL   |        | penerima offline|
     |      +-----------+ +------------------+        +-----------------+
     +--> heartbeat 30 detik -> perbarui presence`, 'text'),

      heading('6. Deep dive'),
      subheading('Alur kirim pesan & receipt'),
      list([
        'Client membuat `clientMsgId` (UUID) dan menyimpan pesan di outbox lokal dengan status "mengirim".',
        'Chat Service mendedupe berdasarkan `(convId, clientMsgId)` (client bisa mengirim ulang setelah reconnect), memberi `seq` berikutnya, menyimpan, lalu mengirim **ACK** → centang satu. ACK hanya dikirim setelah tulis ke storage berhasil (durable).',
        'Service mencari gateway setiap device penerima di session registry dan meneruskan pesan. Bila tidak ada sesi aktif → push notification.',
        'Device penerima mengirim `delivered` (✓✓) dan saat layar dibuka `read`. Keduanya berupa **watermark** `upToSeq`, sehingga satu frame mengonfirmasi banyak pesan dan storage cukup menyimpan satu angka per anggota.',
      ], true),
      subheading('Urutan pesan'),
      paragraph('Jam device tidak bisa dipercaya dan jam server antar-node sedikit berbeda, jadi urutan ditentukan oleh **`seq` per percakapan** yang diberikan server. Cara memberinya: semua tulis untuk satu percakapan diarahkan ke satu pemilik (partisi Kafka dengan key `convId`, atau actor/shard per percakapan) yang menaikkan counter; alternatif sederhana `INCR conv:{id}:seq` di Redis (perlu pemulihan dari storage bila Redis kehilangan data). Client menampilkan berdasarkan `seq`; bila ada lubang (menerima 1845 padahal terakhir 1842) client memanggil API sinkronisasi `afterSeq=1842`. Tidak perlu urutan global antar-percakapan.'),
      subheading('Fan-out grup'),
      paragraph('Untuk grup ≤ 500 anggota: pesan disimpan sekali, lalu di-fan-out **hanya ke device yang sedang online** lewat gateway, dan push untuk yang offline (dengan batching/collapse agar tidak 500 notifikasi sekaligus). Anggota offline mengambil sendiri lewat sinkronisasi kursor saat online. Untuk channel siaran dengan ratusan ribu anggota, dorong hanya notifikasi "ada pesan baru" dan biarkan client menarik (fan-out on read), seperti pola news feed untuk akun populer.'),
      subheading('Presence'),
      paragraph('Presence adalah data **paling sering berubah dan paling tidak penting**: cukup eventual. Gateway memperbarui `presence:{user}` dengan TTL ±60–90 detik pada setiap heartbeat; kunci kedaluwarsa = offline. Perubahan status hanya dipublikasikan ke kontak yang sedang membuka percakapan terkait (subscribe saat layar dibuka), bukan ke semua kontak, dan di-debounce agar sinyal naik-turun jaringan seluler tidak membanjiri sistem. Untuk grup besar, presence diambil saat diminta saja.'),
      subheading('Gateway stateful & deploy'),
      paragraph('Load balancer L4/L7 harus mendukung koneksi panjang. Saat deploy atau scale-in, gateway berhenti menerima koneksi baru lalu menutup koneksi lama secara bertahap (dengan jitter) agar jutaan client tidak reconnect di detik yang sama (*thundering herd*). Client memakai exponential backoff + jitter saat reconnect.'),

      heading('7. Trade-off'),
      table(['Keputusan', 'Pilihan', 'Alternatif', 'Alasan'], [
        ['Transport', 'WebSocket', 'Long polling / SSE', 'Dua arah, overhead per pesan kecil; long polling sebagai fallback jaringan yang memblokir WebSocket'],
        ['Storage pesan', 'Cassandra/ScyllaDB partisi (conv, bucket)', 'PostgreSQL sharded', 'Tulis sangat tinggi, akses pola range per percakapan; Discord memakai pola serupa'],
        ['Urutan', 'seq per percakapan dari server', 'Timestamp client', 'Deterministik dan mendeteksi pesan yang hilang'],
        ['Receipt', 'Watermark upToSeq', 'Status per pesan per penerima', 'Tulis jauh lebih sedikit, terutama di grup'],
        ['Presence', 'Redis TTL + publish terbatas', 'Broadcast ke semua kontak', 'Volume perubahan presence bisa melebihi volume pesan'],
      ]),
      ...followUps([
        ['SDC-01', 'Pengguna mengirim pesan, sinyal hilang sebelum ACK diterima, lalu client mengirim ulang. Bagaimana mencegah pesan dobel?', 'Client memakai `clientMsgId` yang sama untuk pengiriman ulang. Server menyimpan pemetaan `(convId, clientMsgId) → msgId/seq` (unique constraint atau cache dengan TTL beberapa jam). Bila sudah ada, server tidak menyimpan ulang dan hanya mengirim ACK dengan `seq` yang sama. Ini adalah idempotency key pada level pesan; hasilnya at-least-once delivery dengan efek exactly-once di tampilan.'],
        ['SDC-02', 'Satu node gateway mati dengan 200 ribu koneksi. Apa yang terjadi?', 'Koneksinya putus; client reconnect (backoff + jitter) ke node lain lewat load balancer. Entri session registry milik node itu kedaluwarsa lewat TTL atau dibersihkan oleh health check. Pesan yang dikirim selama jeda tidak hilang karena sudah tersimpan: saat reconnect client memanggil sinkronisasi dengan `afterSeq` terakhir per percakapan. Kapasitas cadangan ±30% dibutuhkan agar node lain mampu menampung lonjakan reconnect.'],
        ['SDC-03', 'Bagaimana mendukung pencarian pesan?', 'Jangan query storage pesan dengan LIKE. Pesan dikirim (lewat CDC atau event) ke indeks pencarian seperti Elasticsearch/OpenSearch yang dipartisi per user atau per percakapan, dengan filter akses berdasarkan keanggotaan. Bila E2EE aktif, server tidak bisa membaca isi sehingga pencarian harus dilakukan di device.'],
      ]),
      ...practice('sd-chat', [
        'Hitung ulang jumlah node gateway bila koneksi bersamaan naik menjadi 60 juta dan satu node hanya sanggup 100 ribu koneksi.',
        'Rancang tabel/kunci untuk menyimpan receipt dalam bentuk watermark dan jelaskan cara menampilkan "dibaca oleh 12 dari 30 anggota".',
        'Bangun prototipe kecil: server WebSocket dengan `clientMsgId` dedupe dan `seq` per percakapan, lalu uji pengiriman ulang dan deteksi lubang urutan.',
        'Jelaskan secara lisan alur pesan dari Device A ke Device B (online dan offline) dalam 3 menit.',
      ]),
      references(
        ['MDN: WebSockets API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'],
        ['RFC 6455: The WebSocket Protocol', 'https://datatracker.ietf.org/doc/html/rfc6455'],
        ['Discord: How Discord stores trillions of messages', 'https://discord.com/blog/how-discord-stores-trillions-of-messages'],
        ['Slack Engineering: Real-time messaging', 'https://slack.engineering/real-time-messaging/'],
        ['Redis: Pub/Sub', 'https://redis.io/docs/latest/develop/interact/pubsub/'],
        ['AWS Builders\' Library: Timeouts, retries and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-news-feed',
    title: 'Studi Kasus: Design News Feed',
    summary:
      'Home timeline gaya Twitter/Instagram: fan-out on write vs on read, hybrid untuk akun populer, pipeline ranking, cache timeline berisi ID, hydration, dan pagination berbasis cursor.',
    track: TRACK, source: systemDesignSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Inti soal news feed adalah satu pertanyaan: **kapan** menggabungkan postingan dari ratusan akun yang diikuti, saat postingan ditulis (fan-out on write) atau saat feed dibaca (fan-out on read)? Jawaban senior: keduanya, tergantung jumlah follower.'),
      callout('tip', 'Materi pendukung', 'Event & konsumen async di [Event-Driven Architecture](#distributed.event-driven-architecture-eda); strategi cache di [Caching](#distributed.caching); kapasitas & biaya di [Fase 4 · Skalabilitas & FinOps](#distributed.fase-4-skalabilitas-finops).'),

      heading('1. Requirement'),
      table(['Fungsional', 'Non-fungsional'], [
        ['Membuat postingan (teks + media)', 'Muat feed p99 < 300 ms'],
        ['Follow/unfollow', 'Postingan baru muncul di feed follower dalam hitungan detik (eventual)'],
        ['Home feed: postingan akun yang diikuti, terbaru/terurut ranking', 'Availability tinggi; feed sedikit basi lebih baik daripada error'],
        ['Like/komentar (counter tampil di feed)', 'Skala: 200 juta DAU'],
      ]),

      heading('2. Estimasi'),
      code('Asumsi & hitungan', `ASUMSI
  DAU                        = 200 juta
  Buka feed per user/hari    = 10   -> 2 miliar baca feed/hari
  Posting per user/hari      = 0,5  -> 100 juta posting/hari
  Rata-rata follower         = 200 (distribusi sangat miring: ada akun 50 juta follower)

QPS
  Baca feed : 2 miliar / 86.400   ~ 23.000/detik   puncak ~ 70.000/detik
  Posting   : 100 juta / 86.400   ~ 1.200/detik

FAN-OUT ON WRITE (semua akun)
  100 juta x 200 follower = 20 miliar insert timeline/hari ~ 230.000/detik
  Satu akun 50 juta follower = 50 juta insert untuk SATU posting  -> tidak bisa

CACHE TIMELINE (hanya ID)
  800 ID x 8 B = 6,4 KB per user; untuk 200 juta user aktif ~ 1,3 TB data mentah
  (overhead struktur Redis ~2-3x) -> beberapa TB RAM tersebar di cluster,
  atau simpan hanya untuk user aktif 30 hari terakhir`, 'text'),

      heading('3. API'),
      code('REST API', `POST /v1/posts
{ "text": "Bakso enak dekat kantor", "mediaIds": ["m_88"] }

GET /v1/feed?limit=20&cursor=eyJzY29yZSI6MC44MSwiaWQiOjczMDE1NTkzMTA3NDE1MjAzODR9
200 OK
{ "items": [ { "postId": "7301559310741520384", "author": {...}, "text": "...",
               "likeCount": 1204, "likedByMe": true } ],
  "nextCursor": "eyJzY29yZSI6MC43Nywi..." }

POST   /v1/users/{id}/follow
DELETE /v1/users/{id}/follow`, 'text'),
      callout('tip', 'Cursor, bukan offset', 'Feed berubah terus; `OFFSET 20` akan melompati atau menduplikasi item saat ada postingan baru. Cursor berisi posisi terakhir (skor/ID) yang di-encode, sehingga halaman berikutnya stabil.'),

      heading('4. Skema data'),
      table(['Data', 'Store', 'Kunci / bentuk'], [
        ['Postingan', 'Wide-column atau SQL sharded by `post_id`', '`post_id` (Snowflake, terurut waktu), `author_id`, teks, media, `created_at`'],
        ['Graf follow', 'SQL/KV dengan dua arah', '`followers(user_id → follower_id)` dan `following(follower_id → user_id)`, sharded by kolom pertama'],
        ['Timeline cache', 'Redis sorted set / list', '`timeline:{user_id}` → ID postingan (skor = waktu/rank), dipangkas ke 800'],
        ['Counter (like, komentar)', 'Redis + flush berkala ke DB', '`post:{id}:likes`, toleran sedikit basi'],
        ['Media', 'Object storage + CDN', 'URL ditandatangani / publik di CDN'],
      ]),

      heading('5. Diagram high-level'),
      code('Arsitektur hybrid', `    POST /posts                                    GET /feed
        |                                              |
        v                                              v
 +--------------+  post.new  +---------+     +----------------------------+
 | Post Service |----------->|  Kafka  |     |        Feed Service        |
 +--------------+            +---------+     | 1. ambil ID dari timeline  |
        |                         |          | 2. tarik posting terbaru   |
        v                         v          |    akun populer yg diikuti |
 +--------------+   +-------------------+    | 3. ranking                 |
 |  Post store  |   |  Fan-out Worker   |    | 4. hydrate (isi + counter) |
 | + cache post |   | author biasa:     |    +----------------------------+
 +--------------+   |   push ID ke      |       |          |          |
        ^           |   timeline        |       | 1        | 3        | 2, 4
        |           |   follower aktif  |       v          v          |
        |           | author populer:   |  +-----------+ +---------+  |
        |           |   lewati          |  | Timeline  | | Ranking |  |
        |           +-------------------+  | cache     | | service |  |
        |                     |            | Redis ZSET| | (ML)    |  |
        |                     +----------->| per user  | +---------+  |
        |                        ZADD      +-----------+              |
        +-------------------------------------------------------------+
                      multi-get posting & counter`, 'text'),

      heading('6. Deep dive'),
      table(['Strategi', 'Cara kerja', 'Kelebihan', 'Kekurangan'], [
        ['Fan-out on write (push)', 'Saat posting, ID disisipkan ke timeline setiap follower', 'Baca sangat cepat (timeline sudah jadi)', 'Write amplification; akun 50 juta follower = 50 juta tulis; boros untuk follower yang tidak aktif'],
        ['Fan-out on read (pull)', 'Saat baca, ambil postingan terbaru dari setiap akun yang diikuti lalu merge', 'Tulis murah, tidak ada kerja sia-sia', 'Baca mahal: 200–2.000 query per buka feed; latency tinggi'],
        ['**Hybrid** (dipilih)', 'Push untuk akun biasa; akun dengan follower > ambang (mis. 100 ribu) ditarik saat baca dan di-merge', 'Menjaga baca cepat dan tulis terkendali', 'Dua jalur kode; ambang perlu disetel'],
      ]),
      list([
        '**Hanya push ke follower aktif** (login dalam 30 hari). User yang kembali setelah lama dibangun ulang timeline-nya dengan pull saat login (cold start).',
        '**Timeline berisi ID saja**, bukan isi postingan. Isi diambil lewat **hydration**: multi-get ke cache postingan dan counter. Edit/hapus postingan cukup mengubah satu objek; timeline yang memuat ID postingan terhapus disaring saat hydrate.',
        '**Unfollow / blok**: hapus ID dari timeline secara async, plus saring saat baca agar langsung berlaku.',
        '**Ranking** sebagai pipeline: kandidat (timeline cache + akun populer + rekomendasi) → ambil fitur (kedekatan, umur, engagement) → model ringan untuk ratusan kandidat → model berat untuk puluhan teratas → aturan bisnis (keberagaman author, iklan, konten yang sudah dilihat). Bila ranking service lambat, fallback ke urutan kronologis (degradasi yang anggun).',
        '**Counter like** diperbarui di Redis dan dibuat batch ke DB; angka "1,2 rb" tidak perlu tepat setiap milidetik.',
      ]),

      heading('7. Trade-off'),
      table(['Keputusan', 'Pilihan', 'Alternatif', 'Alasan'], [
        ['Fan-out', 'Hybrid dengan ambang follower', 'Push murni / pull murni', 'Distribusi follower sangat miring'],
        ['Isi timeline', 'ID + skor', 'Objek postingan lengkap', 'Hemat memori, edit/hapus konsisten'],
        ['Urutan', 'Ranking + fallback kronologis', 'Kronologis saja', 'Engagement lebih baik, tetap tahan gangguan'],
        ['Konsistensi', 'Eventual (detik)', 'Postingan langsung terlihat semua follower', 'Fan-out async meratakan beban; penulis melihat postingannya sendiri lewat read-your-writes (sisipkan langsung di feed miliknya)'],
      ]),
      ...followUps([
        ['SDN-01', 'Seorang selebriti dengan 50 juta follower memposting. Jelaskan apa yang terjadi di sistemmu.', 'Post Service menyimpan postingan dan mengirim event. Fan-out Worker melihat author ditandai populer, jadi tidak melakukan push. Saat follower membuka feed, Feed Service mengambil daftar akun populer yang ia ikuti (biasanya sedikit), menarik postingan terbaru mereka dari cache "postingan terbaru per author" (sangat panas, direplikasi/di-cache lokal), lalu me-merge dengan timeline push sebelum ranking. Beban tulis 50 juta insert digantikan dengan beberapa baca cache per pembukaan feed.'],
        ['SDN-02', 'Redis timeline cache hilang sebagian. Bagaimana pemulihannya?', 'Timeline cache adalah data turunan, bukan sumber kebenaran. Untuk user yang cache-nya hilang, Feed Service membangun ulang dengan fan-out on read (ambil postingan terbaru dari akun yang diikuti), menampilkan hasilnya, lalu mengisi cache. Untuk mencegah semua user membangun ulang bersamaan, pakai request coalescing per user dan rate limit rebuild; feed sementara boleh lebih pendek.'],
        ['SDN-03', 'Bagaimana memastikan pengguna tidak melihat postingan yang sama berulang kali di halaman berbeda?', 'Gunakan cursor yang menyimpan posisi (skor, post_id) terakhir, bukan offset, dan kunci daftar kandidat untuk satu sesi feed (snapshot ID singkat di cache dengan TTL beberapa menit). Postingan yang sudah ditampilkan dicatat (impression log/bloom filter per user) dan diturunkan skornya pada pembukaan berikutnya.'],
      ]),
      ...practice('sd-news-feed', [
        'Hitung write amplification bila ambang akun populer 10 ribu vs 1 juta follower, dengan asumsi distribusi follower yang kamu tentukan sendiri.',
        'Implementasikan timeline dengan Redis sorted set: `ZADD`, pemangkasan ke 800 dengan `ZREMRANGEBYRANK`, dan pagination dengan cursor skor.',
        'Gambar pipeline ranking empat tahap dan sebutkan fallback untuk tiap tahap bila timeout.',
        'Jelaskan perbedaan fan-out on write, on read, dan hybrid dalam 90 detik tanpa catatan.',
      ]),
      references(
        ['InfoQ: Timelines at Scale (Twitter)', 'https://www.infoq.com/presentations/Twitter-Timeline-Scalability/'],
        ['USENIX ATC 2013: TAO, Facebook\'s distributed data store for the social graph', 'https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson'],
        ['USENIX NSDI 2013: Scaling Memcache at Facebook', 'https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala'],
        ['Redis: Sorted sets', 'https://redis.io/docs/latest/develop/data-types/sorted-sets/'],
        ['AWS Builders\' Library: Caching challenges and strategies', 'https://aws.amazon.com/builders-library/caching-challenges-and-strategies/'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-sistem-pembayaran',
    title: 'Studi Kasus: Design Sistem Pembayaran',
    summary:
      'Konteks fintech/bank Indonesia: idempotency key (termasuk X-EXTERNAL-ID SNAP), double-entry ledger, state machine transaksi, outbox pattern, integrasi payment gateway & webhook retry, rekonsiliasi, dan ilusi exactly-once.',
    track: TRACK, source: systemDesignSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Di sistem pembayaran, **kebenaran lebih penting dari kecepatan dan availability**. Uang tidak boleh terdebit dua kali, tidak boleh hilang, dan setiap rupiah harus bisa ditelusuri. Interviewer fintech menguji apakah kamu berpikir dalam **invarian** ("total debit = total kredit", "status tidak pernah mundur") dan **mode kegagalan** ("PG timeout, apakah uangnya sudah terpotong?").'),
      callout('tip', 'Materi pendukung', 'Saga, outbox, dan database-per-service dibahas di [Distributed Data Management](#distributed.distributed-data-management); isolasi & locking di [Transaksi & Konkurensi](#sql.transaksi-konkurensi); event dan konsumen idempoten di [Event-Driven Architecture](#distributed.event-driven-architecture-eda).'),

      heading('1. Requirement'),
      table(['Fungsional', 'Non-fungsional'], [
        ['Merchant membuat pembayaran (VA, QRIS, e-wallet, kartu) lewat payment gateway (PG)', 'Tidak ada double charge / double credit; tidak ada uang hilang'],
        ['Transfer saldo antar-wallet (P2P)', 'Jejak audit immutable; retensi dokumen keuangan umumnya 10 tahun (UU No. 8/1997)'],
        ['Refund penuh/sebagian', 'Availability 99,95%+ untuk penerimaan pembayaran; konsistensi kuat untuk saldo'],
        ['Notifikasi status ke merchant (webhook)', 'Latency internal p99 < 500 ms; panggilan ke PG bisa hingga puluhan detik'],
        ['Rekonsiliasi harian dengan bank/PG', 'Kepatuhan: lokasi data sesuai ketentuan BI/OJK, PCI DSS untuk data kartu (gunakan tokenisasi PG)'],
      ]),

      heading('2. Estimasi'),
      code('Asumsi & hitungan', `ASUMSI
  Transaksi       = 10 juta/hari
  Puncak          = 10x rata-rata (tanggal gajian, 12.12, flash sale)
  Entri ledger    = ~4 baris per transaksi (debit, kredit, fee, pajak/penampung)
  Ukuran baris    = ~200 B + index

QPS
  Rata-rata : 10 juta / 86.400   ~ 120 TPS
  Puncak    :                    ~ 1.200 TPS   -> satu cluster PostgreSQL kuat masih sanggup,
                                                 asal transaksi pendek & hot account ditangani

STORAGE
  Ledger : 10 juta x 4 x 200 B = 8 GB/hari ~ 3 TB/tahun (+ index ~2x)
  10 tahun retensi -> ~60-90 TB -> partisi per bulan, partisi lama ke storage murah/arsip

Kesimpulan: masalah utamanya BUKAN throughput, melainkan kebenaran, idempotensi, dan audit.`, 'text'),

      heading('3. API'),
      code('Membuat pembayaran (idempoten)', `POST /v1/payments
Idempotency-Key: 5f0c2a3e-8a8f-4d4e-9b1a-1f2d3c4b5a69
Authorization: Bearer <token merchant>
{ "merchantOrderId": "INV-2026-10-000123",
  "amount": 150000, "currency": "IDR",
  "method": "QRIS",
  "callbackUrl": "https://merchant.example.co.id/webhooks/payment" }

201 Created
{ "paymentId": "pay_01JBX9...", "status": "PENDING", "qrString": "00020101021226..." }

-- request ulang dengan key & body sama  -> respons tersimpan dikembalikan apa adanya
-- key sama, body berbeda               -> 422 (salah pakai key)
-- key sama, request pertama masih jalan -> 409 (coba lagi nanti)`, 'text'),
      paragraph('Standar **SNAP** (Standar Nasional Open API Pembayaran dari ASPI/Bank Indonesia) menerapkan prinsip yang sama: header `X-EXTERNAL-ID` wajib unik dalam hari yang sama, dan pemakaian ulang dijawab `409 Conflict`; `partnerReferenceNo` yang sudah diproses juga ditolak sebagai duplikat.'),

      heading('4. Skema data'),
      code('PostgreSQL: idempotency, payment, ledger, outbox', `CREATE TABLE idempotency_keys (
    merchant_id   BIGINT      NOT NULL,
    idem_key      TEXT        NOT NULL,
    request_hash  BYTEA       NOT NULL,          -- tolak body berbeda dengan key sama
    status        TEXT        NOT NULL,          -- IN_PROGRESS | DONE
    response_code INT,
    response_body JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (merchant_id, idem_key)          -- simpan minimal 24 jam
);

CREATE TABLE payments (
    id                 UUID PRIMARY KEY,
    merchant_id        BIGINT  NOT NULL,
    merchant_order_id  TEXT    NOT NULL,
    amount             BIGINT  NOT NULL CHECK (amount > 0),   -- satuan terkecil, BUKAN float
    currency           CHAR(3) NOT NULL,
    status             TEXT    NOT NULL,
    psp_reference      TEXT,                                  -- id transaksi di PG
    version            INT     NOT NULL DEFAULT 0,
    UNIQUE (merchant_id, merchant_order_id)
);

-- Double-entry: satu journal = satu peristiwa bisnis, minimal dua posting yang seimbang
CREATE TABLE accounts (
    id        BIGINT PRIMARY KEY,
    owner     TEXT   NOT NULL,                   -- wallet user, merchant, kas PG, fee, ...
    currency  CHAR(3) NOT NULL,
    normal_side CHAR(1) NOT NULL,                -- 'D' (aset) atau 'C' (liabilitas, pendapatan)
    balance   BIGINT NOT NULL DEFAULT 0,         -- saldo menurut sisi normal; dijaga di transaksi yang sama
    allow_negative BOOLEAN NOT NULL DEFAULT false,
    CHECK (balance >= 0 OR allow_negative)
);

CREATE TABLE journal_entries (
    id          UUID PRIMARY KEY,
    payment_id  UUID REFERENCES payments(id),
    kind        TEXT NOT NULL,                   -- CAPTURE | REFUND | TRANSFER | REVERSAL
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE postings (
    journal_id  UUID   NOT NULL REFERENCES journal_entries(id),
    account_id  BIGINT NOT NULL REFERENCES accounts(id),
    amount      BIGINT NOT NULL,                 -- positif = debit, negatif = kredit
    PRIMARY KEY (journal_id, account_id)
);
-- Invarian: SUM(amount) per journal_id = 0. Tidak ada UPDATE/DELETE; koreksi = journal REVERSAL.

CREATE TABLE outbox (
    id           BIGSERIAL PRIMARY KEY,
    aggregate_id UUID  NOT NULL,
    event_type   TEXT  NOT NULL,                 -- payment.succeeded, ...
    payload      JSONB NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);`, 'sql'),
      table(['Contoh journal: pembayaran QRIS Rp150.000, fee 0,7%', 'Debit', 'Kredit'], [
        ['Piutang ke PG / kas penampung', 'Rp150.000', ''],
        ['Saldo merchant (liabilitas kita ke merchant)', '', 'Rp148.950'],
        ['Pendapatan fee', '', 'Rp1.050'],
        ['**Total**', '**Rp150.000**', '**Rp150.000**'],
      ]),

      heading('5. State machine transaksi'),
      code('Status pembayaran', `                +---------+
                | CREATED |
                +---------+
                     | kirim ke PG
                     v
                +---------+   timeout / respons tidak jelas   +---------+
                | PENDING |---------------------------------->| UNKNOWN |
                +---------+                                    +---------+
                 |   |   |                                      | inquiry status /
       sukses    |   |   | kedaluwarsa                          | rekonsiliasi
                 v   |   v                                      v
         +-----------+ | +---------+                  (ke SUCCEEDED / FAILED)
         | SUCCEEDED | | | EXPIRED |
         +-----------+ | +---------+
               |       v gagal
               |   +--------+
               |   | FAILED |
               |   +--------+
               v
       +----------------+      +----------+
       | REFUND_PENDING |----->| REFUNDED |   (atau PARTIALLY_REFUNDED)
       +----------------+      +----------+

 Aturan: FAILED, EXPIRED, REFUNDED terminal; SUCCEEDED hanya maju ke refund.
         Transisi mundur (SUCCEEDED -> PENDING) ditolak; pengecualian bisnis
         (pembayaran terlambat, lihat SDP-02) dibuat sebagai transisi eksplisit.`, 'text'),
      code('Transisi atomik dengan compare-and-set', `BEGIN;

-- 1. Transisi hanya berlaku bila status saat ini memang PENDING (aman dari webhook ganda/terlambat)
UPDATE payments
   SET status = 'SUCCEEDED', psp_reference = :psp_ref, version = version + 1
 WHERE id = :payment_id AND status IN ('PENDING', 'UNKNOWN');
-- 0 baris terpengaruh -> sudah diproses sebelumnya: COMMIT tanpa efek, balas OK

-- 2. Journal seimbang + saldo, dalam transaksi YANG SAMA
INSERT INTO journal_entries (id, payment_id, kind) VALUES (:jid, :payment_id, 'CAPTURE');
INSERT INTO postings VALUES (:jid, :acc_pg_clearing,  150000),
                            (:jid, :acc_merchant,    -148950),
                            (:jid, :acc_fee_revenue,   -1050);
-- balance mengikuti sisi normal: debit menambah akun 'D', kredit menambah akun 'C'
UPDATE accounts SET balance = balance + 150000 WHERE id = :acc_pg_clearing;   -- aset, didebit
UPDATE accounts SET balance = balance + 148950 WHERE id = :acc_merchant;      -- liabilitas, dikredit
UPDATE accounts SET balance = balance + 1050   WHERE id = :acc_fee_revenue;   -- pendapatan, dikredit

-- 3. Event untuk dunia luar, juga di transaksi yang sama (outbox)
INSERT INTO outbox (aggregate_id, event_type, payload)
VALUES (:payment_id, 'payment.succeeded', :json);

COMMIT;`, 'sql'),
      callout('info', 'Konvensi tanda', 'Posting bertanda (debit positif, kredit negatif) sehingga invarian "jumlah per journal = 0" cukup dicek dengan `SUM`. Kolom `accounts.balance` disimpan menurut **sisi normal** akun: aset = debit − kredit, liabilitas/pendapatan = kredit − debit. Hasilnya saldo wallet user dan merchant (liabilitas kita) tampil positif dan bisa dicek dengan `balance >= :amt`. Ada tim yang menyimpan kolom `direction` (D/C) dengan nominal selalu positif; keduanya sah selama invarian keseimbangan terjaga.'),

      heading('6. Diagram high-level'),
      code('Arsitektur', `  Merchant / App
       | POST /payments  (Idempotency-Key)
       v
 +-------------+      +------------------------------------------------+
 | API Gateway |----->|               Payment Service                  |
 | auth, mTLS, |      |  1. cek/klaim idempotency key                  |
 | rate limit  |      |  2. buat payment CREATED -> PENDING            |
 +-------------+      |  3. panggil PG (timeout, retry idempoten)      |
                      +------------------------------------------------+
                         |                      |                   ^
                         | tx lokal             | HTTPS             | status
                         v                      v                   |
           +----------------------------+  +--------------------+   |
           | PostgreSQL (primary + sync |  | Payment Gateway /  |   |
           | replica): payments, ledger,|  | bank (QRIS, VA,    |   |
           | idempotency_keys, outbox   |  | e-wallet, kartu)   |   |
           +----------------------------+  +--------------------+   |
                  | CDC (Debezium) / poller        | webhook (retry)|
                  v                                v                |
           +-----------+                  +-------------------+     |
           |   Kafka   |                  | Webhook Receiver  |-----+
           +-----------+                  | verifikasi sign., |
             |     |                      | simpan ke inbox,  |
             v     v                      | balas 200 cepat   |
   Notifikasi   Analytics                 +-------------------+
   ke merchant
                 +---------------------+       file settlement (SFTP/API)
                 | Reconciliation Job  |<----- dari bank / PG, harian (T+1)
                 +---------------------+`, 'text'),

      heading('7. Deep dive'),
      subheading('Idempotency key'),
      list([
        'Klaim key dengan `INSERT ... ON CONFLICT DO NOTHING` berstatus `IN_PROGRESS`. Berhasil → proses. Gagal → baca baris: `DONE` dengan hash sama → kembalikan respons tersimpan; hash berbeda → 422; masih `IN_PROGRESS` → 409.',
        'Simpan respons **setelah** efek samping selesai, dalam transaksi yang sama dengan perubahan status bila mungkin. Bila proses crash di tengah, key `IN_PROGRESS` yang sudah tua dipulihkan oleh job yang mengecek status sebenarnya ke PG.',
        'Idempotensi juga dibutuhkan **ke arah PG**: kirim `merchantOrderId`/`partnerReferenceNo` yang sama saat retry agar PG mendedupe di sisinya.',
      ]),
      subheading('Timeout ke payment gateway'),
      paragraph('Timeout **bukan berarti gagal**: uang mungkin sudah terpotong. Jangan pernah menandai FAILED lalu membiarkan user membayar ulang. Tandai `UNKNOWN`, jalankan **status inquiry** dengan backoff, dan biarkan webhook atau rekonsiliasi menutup kasusnya. User melihat "pembayaran sedang diproses".'),
      subheading('Webhook dari PG'),
      list([
        '**Verifikasi signature** (mis. HMAC atau SHA-512 atas field tertentu + server key, sesuai dokumentasi PG) dan IP allowlist bila disediakan. Untuk kepastian, banyak tim memanggil API *get status* PG alih-alih mempercayai isi webhook.',
        '**Balas 2xx secepatnya** setelah menyimpan ke tabel inbox; proses async. PG akan me-retry bila respons lambat/gagal, sehingga handler harus idempoten.',
        '**Dedupe** berdasarkan `(provider, event_id)` atau `(psp_reference, status)` dengan unique constraint.',
        '**Urutan tidak dijamin**: "settlement" bisa datang sebelum "pending". State machine dengan compare-and-set mengabaikan transisi mundur.',
      ]),
      subheading('Outbox & ilusi exactly-once'),
      paragraph('Menulis ke DB lalu publish ke Kafka secara terpisah (dual write) pasti suatu saat gagal di tengah. **Outbox pattern** menulis event ke tabel `outbox` dalam transaksi yang sama, lalu relay (poller atau CDC seperti Debezium) mempublikasikannya. Relay bisa mengirim ulang, jadi delivery-nya **at-least-once**; konsumen mencatat `event_id` yang sudah diproses (tabel inbox dengan unique constraint) di transaksi yang sama dengan efeknya. **At-least-once + konsumen idempoten = efek exactly-once.** "Exactly-once delivery" lintas sistem tidak ada; Kafka EOS hanya berlaku untuk alur baca-proses-tulis di dalam Kafka.'),
      subheading('Hot account'),
      paragraph('Akun penampung atau merchant besar diperbarui oleh ribuan transaksi per detik; `UPDATE accounts` pada baris yang sama menjadi antrean lock. Opsi: pecah menjadi beberapa sub-akun (sharded balance) yang dijumlahkan saat dibaca, atau catat posting dulu lalu agregasikan saldo secara batch untuk akun yang tidak butuh cek saldo real-time (akun pendapatan fee). Wallet user yang wajib dicek saldonya tetap diperbarui sinkron dengan `UPDATE ... WHERE balance >= :amt`. Ambil lock akun selalu dalam urutan `id` menaik untuk menghindari deadlock pada transfer dua arah.'),
      subheading('Rekonsiliasi'),
      list([
        '**Eksternal (harian, T+1)**: cocokkan file settlement bank/PG dengan ledger berdasarkan referensi. Kategori: cocok; ada di PG tetapi tidak sukses di kita (kredit/refund otomatis); sukses di kita tetapi tidak ada di PG (investigasi, mungkin reversal); jumlah berbeda (fee/kurs). Selisih masuk antrean penyelesaian manual dengan SLA.',
        '**Internal**: setiap journal berjumlah 0; saldo tiap akun = jumlah postingnya (dibalik tandanya untuk akun bersisi normal kredit); jumlah seluruh posting = 0. Jalankan sebagai job terjadwal dengan alert.',
        'Rekonsiliasi adalah **jaring pengaman terakhir**, bukan pengganti idempotensi. Sistem yang sehat punya selisih kecil yang terus diselesaikan.',
      ]),

      heading('8. Trade-off'),
      table(['Keputusan', 'Pilihan', 'Alternatif', 'Alasan'], [
        ['Database ledger', 'PostgreSQL, transaksi ACID, replika sinkron', 'NoSQL eventual', 'Invarian saldo butuh atomisitas; throughput 1.200 TPS masih terjangkau'],
        ['Konsistensi vs availability', 'Tolak/tunda transaksi bila primary tidak tersedia (CP)', 'Terima lalu rekonsiliasi', 'Double spend lebih mahal daripada downtime singkat'],
        ['Integrasi event', 'Outbox + CDC', 'Dual write / 2PC', '2PC rapuh dan tidak didukung broker; dual write pasti inkonsisten'],
        ['Hasil PG tidak pasti', 'Status UNKNOWN + inquiry + rekonsiliasi', 'Anggap gagal', 'Menghindari double charge'],
        ['Koreksi data', 'Journal reversal', 'UPDATE/DELETE baris ledger', 'Audit trail immutable, sesuai prinsip akuntansi'],
      ]),
      ...followUps([
        ['SDP-01', 'User menekan tombol "Bayar" dua kali dan aplikasi mengirim dua request. Bagaimana sistemmu mencegah double charge?', 'Client membuat Idempotency-Key sekali per *niat* pembayaran (bukan per klik) dan memakainya untuk semua retry. Request kedua menemukan key yang sama: bila yang pertama masih berjalan → 409, bila sudah selesai → respons yang sama dikembalikan. Lapisan kedua: `UNIQUE (merchant_id, merchant_order_id)` di tabel payments. Lapisan ketiga: ID referensi yang sama dikirim ke PG sehingga PG pun menolak duplikat.'],
        ['SDP-02', 'PG mengirim webhook SUCCEEDED, tetapi sistemmu sudah menandai pembayaran EXPIRED karena melewati batas waktu. Apa yang dilakukan?', 'Uang nyata sudah diterima, jadi realitas eksternal menang. State machine mengizinkan transisi khusus EXPIRED → SUCCEEDED_LATE (atau langsung memicu refund otomatis bila pesanan sudah dibatalkan dan stok dilepas). Keputusan ini adalah aturan bisnis yang harus disepakati dengan tim produk/finance; yang tidak boleh terjadi adalah mengabaikan webhook sehingga uang user "tergantung". Kasus ini juga harus muncul di laporan rekonsiliasi.'],
        ['SDP-03', 'Bagaimana memastikan saldo wallet tidak pernah negatif di bawah konkurensi tinggi?', 'Kurangi saldo dengan update bersyarat dalam transaksi yang sama dengan journal: `UPDATE accounts SET balance = balance - :amt WHERE id = :id AND balance >= :amt`; 0 baris = saldo tidak cukup → rollback. Ini lebih efisien daripada `SELECT ... FOR UPDATE` lalu cek di aplikasi, walau keduanya benar. Constraint `CHECK (balance >= 0 OR allow_negative)` di tabel accounts menjadi pengaman terakhir di database. Isolasi READ COMMITTED cukup untuk update bersyarat satu baris karena PostgreSQL mengevaluasi ulang kondisi WHERE pada versi baris terbaru.'],
      ]),
      ...practice('sd-pembayaran', [
        'Implementasikan endpoint `POST /payments` dengan tabel idempotency_keys dan uji: request ganda paralel, body berbeda dengan key sama, serta crash di tengah proses.',
        'Tulis query rekonsiliasi internal: daftar journal yang tidak seimbang dan akun yang saldonya berbeda dari jumlah postingnya.',
        'Gambar state machine pembayaran beserta tabel transisi yang diizinkan, lalu tulis unit test yang menolak setiap transisi mundur.',
        'Simulasikan webhook terlambat, ganda, dan tidak berurutan terhadap handler-mu; pastikan saldo akhir tetap benar.',
        'Jelaskan dalam 2 menit mengapa "exactly-once delivery" tidak ada, dan apa yang sebenarnya kamu bangun.',
      ]),
      references(
        ['Stripe Docs: Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests'],
        ['Stripe Blog: Designing robust and predictable APIs with idempotency', 'https://stripe.com/blog/idempotency'],
        ['IETF draft: The Idempotency-Key HTTP header field', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/'],
        ['SNAP Developer Site (ASPI/BI): standar keamanan & header', 'https://apidevportal.aspi-indonesia.or.id/api-services/keamanan'],
        ['Midtrans: HTTP(S) notification / webhooks', 'https://docs.midtrans.com/docs/https-notification-webhooks'],
        ['microservices.io: Transactional outbox', 'https://microservices.io/patterns/data/transactional-outbox.html'],
        ['Square: Books, an immutable double-entry accounting database service', 'https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/'],
        ['Modern Treasury: Accounting for developers', 'https://www.moderntreasury.com/journal/accounting-for-developers-part-i'],
        ['AWS Builders\' Library: Making retries safe with idempotent APIs', 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/'],
        ['Confluent: Exactly-once semantics in Apache Kafka', 'https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/'],
      ),
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'sd-soal-cepat',
    title: 'System Design: 15 Soal Trade-off Cepat',
    summary:
      'Jawaban 1–2 menit untuk pertanyaan trade-off yang sering diselipkan interviewer: SQL vs NoSQL, cache invalidation, CAP/PACELC, konsistensi, sharding, idempotency, retry, circuit breaker, CDC, event sourcing, back-pressure, multi-region, observability, dan saga.',
    track: TRACK, source: systemDesignSource, duration: '1,5 jam', level: 'Med',
    blocks: [
      paragraph('Pertanyaan ini sering muncul sebagai sela di tengah studi kasus ("kenapa tidak pakai NoSQL saja?"). Jawaban yang baik: **definisi singkat → kapan memilih masing-masing → satu contoh nyata → risikonya**. Jawab dulu di kepala sebelum membuka.'),
      {
        type: 'qa',
        items: [
          qa('SD-01', 'SQL atau NoSQL? Bagaimana kamu memutuskan?', [
            paragraph('Mulai dari **pola akses dan invarian**, bukan dari skala. Pilih **SQL** (PostgreSQL/MySQL) bila data relasional, butuh transaksi multi-baris, query ad-hoc, atau constraint kuat (uang, stok, pesanan). Pilih **NoSQL** bila pola akses sudah diketahui dan sederhana (by key/range), volume tulis melebihi kapasitas satu node, atau skema sangat bervariasi: DynamoDB/Cassandra untuk KV/wide-column, MongoDB untuk dokumen, Redis untuk struktur in-memory.'),
            paragraph('Catatan senior: PostgreSQL dengan replika baca dan partisi sanggup jauh lebih besar dari yang sering diasumsikan; banyak sistem memakai keduanya (SQL sebagai sumber kebenaran, NoSQL/cache untuk jalur baca). Lihat [Perbandingan SQL vs NoSQL](#sql.perbandingan-sql-vs-nosql).'),
          ]),
          qa('SD-02', 'Bagaimana menangani cache invalidation?', [
            list([
              '**Cache-aside + delete on write**: tulis DB dulu, lalu *hapus* kunci cache (bukan set nilai baru) agar dua penulis bersamaan tidak saling menimpa dengan nilai basi.',
              '**TTL** selalu dipasang sebagai batas atas basi, plus jitter agar banyak kunci tidak kedaluwarsa bersamaan.',
              '**Race baca-tulis**: pembaca lambat bisa menulis nilai lama setelah delete. Mitigasi: versi/timestamp di nilai cache, *delayed double delete*, atau invalidasi lewat CDC dari binlog/WAL sehingga urutannya mengikuti DB.',
              '**Stampede**: saat kunci panas kedaluwarsa, ribuan request menghantam DB. Pakai request coalescing (single flight), lock singkat per kunci, atau refresh lebih awal secara probabilistik.',
            ]),
            paragraph('Lihat [Caching](#distributed.caching).'),
          ]),
          qa('SD-03', 'Jelaskan CAP dan mengapa PACELC lebih berguna.', [
            paragraph('**CAP**: saat terjadi **P**artisi jaringan, sistem terdistribusi harus memilih **C**onsistency (menolak sebagian request) atau **A**vailability (menjawab dengan data yang mungkin basi). Partisi tidak bisa dipilih untuk dihindari, jadi pilihan nyatanya CP atau AP *selama partisi*.'),
            paragraph('**PACELC** menambahkan kondisi normal: **E**lse (tanpa partisi), pilih **L**atency atau **C**onsistency. Ini lebih berguna karena sebagian besar waktu tidak ada partisi, dan trade-off harian adalah replikasi sinkron (konsisten, lebih lambat) vs async (cepat, bisa basi). Contoh: DynamoDB/Cassandra default PA/EL; sistem ledger dengan replika sinkron PC/EC.'),
          ]),
          qa('SD-04', 'Strong consistency vs eventual consistency: kapan cukup eventual?', [
            paragraph('**Strong (linearizable)**: setiap baca melihat tulis terakhir yang sudah dikonfirmasi. **Eventual**: tanpa tulis baru, semua replika akhirnya sama, tetapi untuk sementara bisa berbeda. Di antaranya ada jaminan yang sering cukup: **read-your-writes** (penulis selalu melihat tulisannya sendiri), **monotonic reads**, dan **causal**.'),
            paragraph('Eventual cukup untuk counter like, feed, presence, katalog, analytics. Strong dibutuhkan untuk saldo, stok yang tidak boleh oversell, keunikan username, dan lock. Trik umum: baca dari primary hanya untuk user yang baru saja menulis (mis. 5 detik), selebihnya dari replika.'),
          ]),
          qa('SD-05', 'Bagaimana memilih sharding key?', [
            list([
              'Kunci harus **berkardinalitas tinggi** dan **terdistribusi merata** (user_id, order_id ter-hash), bukan status, negara, atau tanggal.',
              'Kunci harus sesuai **query utama** agar sebagian besar query mengenai satu shard (mis. semua data satu tenant di shard yang sama untuk SaaS).',
              'Hindari kunci **monoton** (timestamp, auto-increment) pada range sharding: semua tulis baru jatuh ke shard terakhir.',
              'Rencanakan resharding sejak awal: hash ke banyak partisi logis (mis. 1.024) yang dipetakan ke sedikit node fisik, sehingga memindah partisi tidak perlu re-hash semua data.',
            ]),
          ]),
          qa('SD-06', 'Satu partisi menjadi hot (hot partition/hot key). Apa yang kamu lakukan?', [
            paragraph('Identifikasi dulu: baca panas atau tulis panas? **Baca panas**: cache berlapis (CDN, cache lokal in-process dengan TTL pendek, replika baca). **Tulis panas**: *key salting*/write sharding (`counter:{id}:{0..15}` lalu dijumlahkan saat dibaca), batching/agregasi di memori sebelum tulis, atau memisahkan tenant besar ke partisi khusus. Untuk saldo (tidak bisa eventual), pakai sub-akun. Jangka panjang: evaluasi ulang shard key bila hot partition bersifat struktural, bukan sesaat.'),
          ]),
          qa('SD-07', 'Apa itu idempotency dan bagaimana mengimplementasikannya di API?', [
            paragraph('Operasi idempoten menghasilkan efek yang sama walau dijalankan berkali-kali. GET/PUT/DELETE idempoten secara semantik; POST tidak. Karena jaringan membuat retry tidak terhindarkan, operasi yang mengubah state butuh **Idempotency-Key** dari client: server menyimpan key + hash request + respons, dengan unique constraint, lalu mengembalikan respons yang sama untuk retry. Konsumen event memakai `event_id` dengan pola yang sama. Detail lengkap di [Sistem Pembayaran](#interview.sd-sistem-pembayaran).'),
          ]),
          qa('SD-08', 'Bagaimana retry yang benar? Mengapa butuh backoff dan jitter?', [
            list([
              'Retry hanya untuk error **sementara** (timeout, 503, 429) dan hanya untuk operasi **idempoten**.',
              '**Exponential backoff** (100 ms, 200 ms, 400 ms, …, dengan batas atas) memberi waktu sistem pulih.',
              '**Jitter** (acak, mis. *full jitter*: tunggu acak antara 0 dan backoff) mencegah ribuan client retry di milidetik yang sama.',
              'Batasi jumlah percobaan dan pakai **retry budget** (mis. retry maksimal 10% dari total request). Retry di setiap lapisan (client → gateway → service → DB, masing-masing 3x) bisa melipatgandakan beban 27x saat terjadi gangguan; retry sebaiknya hanya di satu lapisan.',
              'Hormati `Retry-After` dan pasang timeout total (deadline) yang diteruskan ke hilir.',
            ]),
          ]),
          qa('SD-09', 'Kapan memakai circuit breaker dan bagaimana cara kerjanya?', [
            paragraph('Circuit breaker membungkus panggilan ke dependensi. **Closed**: request lewat, kegagalan dihitung. Bila rasio gagal/lambat melewati ambang → **Open**: request langsung ditolak (fail fast) atau diberi fallback, tanpa membebani dependensi yang sedang sakit dan tanpa menghabiskan thread pemanggil. Setelah jeda → **Half-open**: sebagian kecil request dicoba; sukses → closed, gagal → open lagi.'),
            paragraph('Pakai untuk panggilan sinkron ke dependensi yang bisa lambat (service lain, PG, API pihak ketiga), bersama timeout dan bulkhead (pool terpisah per dependensi). Fallback harus disadari risikonya: fallback yang jarang teruji bisa lebih berbahaya dari error yang jelas. Lihat [Resilience & Fault Tolerance](#distributed.resilience-fault-tolerance).'),
          ]),
          qa('SD-10', 'Apa itu CDC dan kapan dipakai?', [
            paragraph('**Change Data Capture** membaca log perubahan database (WAL PostgreSQL, binlog MySQL) dan memancarkannya sebagai event, mis. dengan Debezium ke Kafka. Kegunaan: relay **outbox pattern**, sinkronisasi ke search index/cache/data warehouse, dan migrasi database tanpa downtime. Kelebihannya: tidak ada dual write dan urutan mengikuti commit. Risiko: event yang membocorkan skema internal tabel (lebih baik publish dari tabel outbox yang berisi event terkontrak), slot replikasi yang menahan WAL bila konsumen mati (disk primary bisa penuh), dan perubahan skema yang harus dikelola.'),
          ]),
          qa('SD-11', 'Event sourcing vs CRUD biasa: kapan event sourcing layak?', [
            paragraph('**CRUD** menyimpan state terkini; riwayat hilang kecuali ditambah audit log. **Event sourcing** menyimpan semua event sebagai sumber kebenaran, dan state adalah hasil *replay* (dengan snapshot). Layak bila riwayat adalah inti domain (ledger, workflow regulasi, audit), butuh temporal query ("saldo per tanggal X"), atau beberapa read model berbeda dari event yang sama (CQRS).'),
            paragraph('Biayanya tinggi: evolusi skema event (versioning/upcasting), read model yang eventually consistent, kurva belajar tim, dan kesulitan menghapus data pribadi (hak hapus di UU PDP). Untuk sebagian besar layanan, CRUD + outbox + tabel audit sudah cukup. Ledger double-entry sendiri sudah "append-only" tanpa harus event sourcing penuh.'),
          ]),
          qa('SD-12', 'Apa itu back-pressure dan bagaimana menerapkannya?', [
            paragraph('Back-pressure adalah mekanisme konsumen yang lambat memberi sinyal ke produsen agar memperlambat, alih-alih menumpuk pekerjaan tanpa batas sampai memori habis atau latency meledak. Bentuknya: **antrean berbatas** (bounded queue) yang menolak/memblokir saat penuh, **429/503** ke pemanggil, pull-based consumer (Kafka consumer menarik sesuai kemampuan), flow control di gRPC/HTTP2/Reactive Streams, dan **load shedding** berdasarkan prioritas.'),
            paragraph('Prinsip penting: antrean tak terbatas hanya menunda kegagalan. Ukur umur pesan tertua (*queue age*), bukan hanya panjang antrean, dan buang pekerjaan yang sudah melewati deadline-nya karena hasilnya tidak lagi berguna bagi pemanggil.'),
          ]),
          qa('SD-13', 'Multi-region: active-passive atau active-active?', [
            table(['Aspek', 'Active-passive', 'Active-active'], [
              ['Tulis', 'Hanya di region utama', 'Di beberapa region'],
              ['Konsistensi', 'Sederhana; replika async ke region cadangan', 'Konflik tulis (perlu last-write-wins, CRDT, atau "home region" per user)'],
              ['RTO/RPO', 'Failover menit; data beberapa detik terakhir bisa hilang (async)', 'Mendekati nol bila trafik dipindah'],
              ['Biaya & kompleksitas', 'Lebih rendah', 'Tinggi: data, deploy, testing, observability'],
            ]),
            paragraph('Mulai dari multi-AZ dalam satu region (sudah menangani mayoritas kegagalan). Naik ke active-passive bila butuh disaster recovery regional, dan ke active-active hanya bila latency global atau RTO ≈ 0 benar-benar menjadi requirement. Untuk sistem uang, pola umum: setiap akun punya satu *home region* sehingga tulis tetap single-writer. Perhatikan juga regulasi lokasi data (mis. kewajiban penempatan data sektor keuangan di Indonesia).'),
          ]),
          qa('SD-14', 'Bagaimana observability untuk desainmu? Apa yang kamu ukur?', [
            list([
              '**Metrics**: empat golden signals (latency, traffic, errors, saturation) per service; RED untuk endpoint, USE untuk resource. Latency dalam persentil (p50/p99), bukan rata-rata.',
              '**SLO & error budget**: mis. 99,9% request redirect < 100 ms per 30 hari; alert berbasis burn rate, bukan setiap lonjakan.',
              '**Distributed tracing** (OpenTelemetry) dengan trace ID yang diteruskan lewat header dan pesan queue.',
              '**Structured logs** berkorelasi dengan trace ID; tanpa data sensitif (nomor kartu, PIN, token).',
              '**Metrik bisnis**: pembayaran sukses per menit, selisih rekonsiliasi, lag konsumen Kafka, umur outbox tertua; sering lebih cepat mendeteksi masalah daripada metrik teknis.',
            ]),
            paragraph('Lihat [Observability](#distributed.observability).'),
          ]),
          qa('SD-15', 'Transaksi lintas service: 2PC atau Saga?', [
            paragraph('**2PC** memberi atomisitas lintas resource, tetapi koordinator menjadi titik blokir (peserta memegang lock sampai keputusan datang), latency naik, dan banyak broker/database cloud tidak mendukungnya. **Saga** memecah transaksi menjadi rangkaian transaksi lokal; bila satu langkah gagal, jalankan **kompensasi** (refund, lepas stok). Orchestration (satu koordinator, alur eksplisit, lebih mudah di-debug) vs choreography (saling bereaksi pada event, lebih longgar tetapi alur sulit dilacak).'),
            paragraph('Konsekuensi Saga: tidak ada isolasi; state antara terlihat (mis. "stok dipesan, pembayaran belum"), jadi butuh status semantik (PENDING) dan langkah yang idempoten. Lihat [Distributed Data Management](#distributed.distributed-data-management).'),
          ]),
        ],
      },
      ...practice('sd-soal-cepat', [
        'Jawab ke-15 soal secara lisan, masing-masing maksimal 2 menit dengan timer.',
        'Untuk setiap soal, sebutkan satu insiden nyata (pengalaman sendiri atau postmortem publik) yang berhubungan.',
        'Pilih 5 soal dan tulis jawabanmu dalam pola "pilih X karena Y; kekurangannya Z; mitigasinya W".',
      ]),
      references(
        ['Daniel Abadi: Consistency tradeoffs in modern distributed database system design (PACELC)', 'https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf'],
        ['AWS Builders\' Library: Timeouts, retries and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'],
        ['AWS Builders\' Library: Avoiding insurmountable queue backlogs', 'https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/'],
        ['AWS Builders\' Library: Avoiding fallback in distributed systems', 'https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/'],
        ['Martin Fowler: Circuit Breaker', 'https://martinfowler.com/bliki/CircuitBreaker.html'],
        ['Martin Fowler: Event Sourcing', 'https://martinfowler.com/eaaDev/EventSourcing.html'],
        ['Martin Fowler: CQRS', 'https://martinfowler.com/bliki/CQRS.html'],
        ['Debezium: Features (CDC)', 'https://debezium.io/documentation/reference/stable/features.html'],
        ['Google SRE Book: Handling overload', 'https://sre.google/sre-book/handling-overload/'],
        ['Google SRE Book: Addressing cascading failures', 'https://sre.google/sre-book/addressing-cascading-failures/'],
        ['Google SRE Book: Monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/'],
      ),
    ],
  },
];
