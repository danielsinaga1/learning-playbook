import type { Block, Module, QAItem } from '../types';
import { code, heading, paragraph, practice, references } from './lesson-kit';
import { systemDesignPatternSource } from './system-design-patterns';

/**
 * Latihan diagnosis untuk track System Design dalam 12 Baris: setiap insiden menampilkan gejala dan
 * metrik lebih dulu; jawaban (baris yang tepat, bukti, tindakan, harga, jebakan) baru terbuka setelah diklik.
 */
const TRACK = 'System Design dalam 12 Baris';

interface Answer {
  baris: string;
  bukti: string;
  tindakan: string;
  harga: string;
  jebakan: string;
}

const incident = (id: string, q: string, context: string, evidence: string, a: Answer): QAItem => ({
  id,
  q,
  prompt: [paragraph(context), code('Bukti yang tersedia', evidence, 'text')],
  a: [
    paragraph(`**${a.baris}**`),
    paragraph(`**Bukti yang mengonfirmasi:** ${a.bukti}`),
    paragraph(`**Tindakan:** ${a.tindakan}`),
    paragraph(`**Harga yang dibayar:** ${a.harga}`),
    paragraph(`**Jebakan:** ${a.jebakan}`),
  ],
});

const singleLine: QAItem[] = [
  incident('SDP-25', 'Riwayat transaksi makin lambat setiap bulan',
    'Halaman "Riwayat Transaksi" naik dari p95 120 ms menjadi 2,8 detik dalam tiga bulan, seiring tabel bertambah besar. Endpoint lain normal dan hit ratio cache untuk katalog 94%.',
    `slow query log (durasi 2.731 ms):
  SELECT * FROM transactions WHERE account_id = $1
  ORDER BY created_at DESC LIMIT 50

EXPLAIN:
  Limit
    -> Sort (Sort Key: created_at DESC)
         -> Seq Scan on transactions  (rows=18.400.000)
              Filter: (account_id = $1)`,
    {
      baris: 'Baris 6 · Query lambat → index',
      bukti: 'Seq Scan + Sort atas 18 juta baris, dan latensi tumbuh sebanding ukuran tabel. Itu tanda database membaca seluruh tabel untuk setiap permintaan.',
      tindakan: '`CREATE INDEX CONCURRENTLY ON transactions (account_id, created_at DESC)`, lalu cek ulang `EXPLAIN ANALYZE`: rencana harus menjadi Index Scan tanpa Sort. Ganti `SELECT *` dengan kolom yang dibutuhkan.',
      harga: 'Setiap INSERT/UPDATE sedikit lebih lambat dan index memakan ruang disk.',
      jebakan: 'Memasang cache lebih dulu. Data riwayat bersifat per akun sehingga hit ratio rendah, dan setiap miss tetap 2,8 detik.',
    }),
  incident('SDP-26', 'Checkout tumbang tepat saat flash sale dimulai',
    'Pukul 12.00 flash sale dibuka. Selama 90 detik POST /checkout timeout. Di luar jam itu database santai (CPU sekitar 25%).',
    `12:00:00  checkout rps 40 → 1.800    db pool aktif 20/20 (penuh)
12:00:30  p99 checkout 30.000 ms     5xx 61%
          HikariPool-1 - Connection is not available, request timed out after 30000ms
12:01:30  rps kembali 60             semua normal lagi`,
    {
      baris: 'Baris 2 · Lonjakan tulis → buffer dengan queue',
      bukti: 'Kejenuhan hanya terjadi di puncak yang singkat, sementara rata-rata beban jauh di bawah kapasitas. Database sanggup rata-ratanya, hanya tidak sanggup puncaknya.',
      tindakan: 'API menerima pesanan, menaruhnya di queue, lalu membalas 202 + id pesanan. Worker memprosesnya dengan laju yang sanggup ditangani DB. Saat antrean penuh, API membalas 429/503 (backpressure).',
      harga: 'Eventual consistency (UI menampilkan "pesanan diproses"), consumer wajib idempoten, dan butuh DLQ serta pemantauan panjang antrean.',
      jebakan: 'Menaikkan pool koneksi menjadi 200 (DB kewalahan oleh context switch dan lock), atau sharding untuk masalah yang hanya berlangsung 90 detik.',
    }),
  incident('SDP-27', 'Widget rekomendasi lambat, seluruh halaman produk ikut mati',
    'Layanan rekomendasi (fitur pelengkap) sedang bermasalah dengan p99 12 detik. Akibatnya halaman produk ikut gagal, padahal database dan cache sehat.',
    `tomcat_threads_busy{app="catalog"}                     200 / 200
http_client_requests p99 {uri="/recommendations"}      12,4 s
http_server_requests 5xx {app="catalog"}               38%`,
    {
      baris: 'Baris 10 · Satu layanan gagal → circuit breaker (+ timeout)',
      bukti: 'Thread katalog habis menunggu satu dependency yang lambat. Ini cascading failure: masalah di fitur pelengkap menjalar ke fitur utama.',
      tindakan: 'Pasang timeout pendek (mis. 300 ms) dan circuit breaker dengan fallback: sembunyikan widget atau tampilkan rekomendasi dari cache. Saat sirkuit OPEN, panggilan gagal cepat tanpa menahan thread.',
      harga: 'Fallback harus dirancang per fitur, dan ambang breaker perlu disetel dari data.',
      jebakan: 'Menambah retry (beban ke layanan yang sakit justru naik) atau menambah thread (hanya menunda habisnya thread).',
    }),
  incident('SDP-28', 'Keluhan tagihan ganda dari pengguna jaringan seluler',
    'Minggu ini ada 23 keluhan tagihan ganda. Semuanya terjadi pada pengguna dengan sinyal buruk.',
    `10:41:07.120  POST /charges order=A-8812 amount=450000 → 201 charge=ch_91
10:41:17.388  POST /charges order=A-8812 amount=450000 → 201 charge=ch_92
              (aplikasi mobile me-retry setelah timeout 10 detik)`,
    {
      baris: 'Baris 11 · Request duplikat → idempotency key',
      bukti: 'Request pertama sukses tetapi responsnya tidak sampai ke klien. Retry dengan isi yang sama dianggap tagihan baru.',
      tindakan: 'Klien membuat satu Idempotency-Key saat tombol Bayar ditekan dan memakainya di semua retry. Server menyimpan key + hasilnya: duplikat menerima respons yang sama tanpa eksekusi ulang. Teruskan key yang sama ke payment gateway.',
      harga: 'Tabel key dengan TTL, serta penanganan status "masih diproses" (409) dan key yang dipakai ulang untuk isi berbeda (422).',
      jebakan: 'Mematikan retry di klien. User akan menekan tombol lagi secara manual, dan hasilnya tetap tagihan ganda.',
    }),
  incident('SDP-29', 'CPU primary 85% karena dashboard admin',
    'Dashboard admin dan laporan membuat CPU primary 85% sepanjang hari, dan latensi tulis ikut naik. Query sudah ber-index. Cache tidak cocok karena laporan memakai filter bebas.',
    `pg_stat_statements (24 jam):
  SELECT  92% total waktu eksekusi
  INSERT/UPDATE 8%
replica: belum ada`,
    {
      baris: 'Baris 4 · DB berat di baca → read replica',
      bukti: 'Beban didominasi SELECT dan query sudah efisien, jadi masalahnya volume baca di satu server.',
      tindakan: 'Tambah read replica dan arahkan transaksi read-only (laporan, dashboard) ke sana. Untuk laporan yang sangat berat, pertimbangkan replica khusus analitik atau data warehouse.',
      harga: 'Replication lag: data milik user sendiri yang baru ditulis harus dibaca dari primary (read-your-writes). Replica tidak membantu beban tulis.',
      jebakan: 'Sharding, yang menyelesaikan masalah tulis, padahal masalahnya baca.',
    }),
  incident('SDP-30', 'Checkout "lambat sekali" setiap Senin pagi, tetapi dashboard hijau',
    'Sebagian user mengeluh checkout sangat lambat setiap Senin pagi. Dashboard hanya menampilkan latensi rata-rata (180 ms) dan tidak ada error di log. Debug dilakukan dengan SSH ke 6 server lalu grep log teks.',
    `dashboard: avg latency checkout 180 ms   error 0,1%
log: teks bebas, tanpa request id, tersebar di 6 instance
tracing: tidak ada`,
    {
      baris: 'Baris 12 · Tidak tahu apa yang rusak → logs, metrics, tracing',
      bukti: 'Rata-rata menyembunyikan ekor distribusi. Tanpa trace, tidak ada cara melihat langkah mana yang lambat untuk request tertentu.',
      tindakan: 'Tambah histogram dan pantau p95/p99 per endpoint dan instance. Pasang tracing OpenTelemetry. Kirim log JSON terpusat dengan trace id. Setelah itu baru cari penyebabnya (mis. batch job Senin yang mengunci tabel).',
      harga: 'Biaya penyimpanan log dan trace (atasi dengan sampling) dan disiplin label metrik (kardinalitas).',
      jebakan: 'Menambah server tanpa tahu penyebabnya.',
    }),
  incident('SDP-31', 'Satu mitra membuat API lambat untuk semua mitra',
    'API katalog untuk mitra kadang lambat bagi semua orang. Setelah diselidiki, satu mitra mengirim traffic dari scraper yang salah konfigurasi.',
    `request/detik per API key (5 menit terakhir):
  pk_live_77   2.400
  pk_live_12      18
  pk_live_31      11
  ... 140 mitra lain rata-rata 15`,
    {
      baris: 'Baris 9 · Request terlalu banyak → rate limiting',
      bukti: 'Satu kunci menghasilkan lebih dari 95% traffic. Masalahnya keadilan antar-klien, bukan kapasitas total.',
      tindakan: 'Token bucket per API key di gateway, sesuai kuota paket. Balas 429 + Retry-After. Simpan state di Redis agar limit berlaku lintas instance.',
      harga: 'State bersama antar-instance, dan risiko limit terlalu ketat untuk mitra yang sah (tetapkan kuota dari data pemakaian).',
      jebakan: 'Limit per IP (mitra besar di belakang NAT ikut terkena) atau limit global (semua mitra dihukum karena satu klien).',
    }),
  incident('SDP-32', 'Satu VM mentok dan setiap deploy berarti downtime',
    'Aplikasi berjalan di satu VM 8 vCPU. Saat jam sibuk CPU 95% dan p99 melonjak. Setiap deploy menyebabkan downtime sekitar 40 detik. Database santai.',
    `app VM:  CPU 95% (jam 19–22), load average 14
db:      CPU 30%, koneksi 40/200
deploy:  stop → start, 40 detik 502`,
    {
      baris: 'Baris 3 · Traffic terlalu besar → load balancer',
      bukti: 'Bottleneck ada di lapisan aplikasi (CPU app penuh, DB longgar), dan satu instance juga berarti tidak ada redundansi saat deploy.',
      tindakan: 'Buat aplikasi stateless (sesi ke Redis/token, file ke object storage), jalankan beberapa instance di belakang load balancer dengan health check readiness, lalu deploy bergiliran (rolling).',
      harga: 'Refactor stateless, tambahan komponen (LB), dan biaya instance.',
      jebakan: 'Menaikkan VM menjadi 32 vCPU. Ada batasnya, tetap satu titik gagal, dan deploy tetap downtime.',
    }),
  incident('SDP-33', 'Gambar produk lambat dan hilang di instance kedua',
    'Halaman produk lambat di Indonesia Timur. Setelah instance kedua ditambahkan, sebagian gambar hasil upload menjadi 404.',
    `bandwidth keluar app: 95% untuk GET /uploads/*.jpg
TTFB gambar dari Jayapura: 1,8 s
upload disimpan di disk lokal: /var/app/uploads (berbeda per instance)`,
    {
      baris: 'Baris 7 · File lambat → object storage + CDN',
      bukti: 'Server aplikasi menghabiskan bandwidth untuk file statis, jaraknya jauh dari user, dan file tersimpan di disk lokal yang tidak dibagi antar-instance.',
      tindakan: 'Pindahkan file ke object storage (upload langsung via presigned URL) dan sajikan lewat CDN. Beri nama file unik/ber-hash dengan `Cache-Control: public, max-age=31536000, immutable`.',
      harga: 'Biaya penyimpanan dan egress CDN, plus proses migrasi file lama.',
      jebakan: 'Menambah instance lagi. File tetap tersebar di disk lokal masing-masing.',
    }),
  incident('SDP-34', '6.000 query identik per detik ke produk populer',
    'GET /products/{id} dipanggil 6.000 kali per detik, dan 80% di antaranya hanya untuk 200 produk populer. Query sudah memakai primary key (0,4 ms), tetapi pool koneksi DB sering penuh.',
    `pg_stat_statements:
  SELECT ... FROM products WHERE id = $1   calls/s 6.000   mean 0,4 ms
db pool: sering 50/50 pada jam ramai
distribusi akses: 200 id = 80% traffic`,
    {
      baris: 'Baris 1 · Baca lambat → cache',
      bukti: 'Query sudah optimal. Masalahnya pengulangan data yang sama dalam jumlah besar, dan distribusi akses yang sangat terkonsentrasi membuat hit ratio cache tinggi.',
      tindakan: 'Cache-aside di Redis dengan TTL + jitter, single flight per key, dan invalidasi (hapus key) saat harga/stok berubah. Target hit ratio di atas 95%, sehingga query DB turun puluhan kali lipat.',
      harga: 'Data bisa basi sampai TTL. Untuk stok, tampilkan nilai perkiraan lalu cek ulang secara atomik saat checkout.',
      jebakan: 'Menambah index (sudah primary key) atau read replica (lebih mahal untuk masalah yang selesai dengan cache).',
    }),
  incident('SDP-35', 'Error sesekali ke layanan inventory langsung sampai ke user',
    'Sekitar 0,5% panggilan ke layanan inventory gagal dengan 503 atau "connection reset", dan berhasil bila diulang manual. Saat ini error itu langsung ditampilkan ke user sebagai "Checkout gagal".',
    `inventory client errors (1 jam):
  503 Service Unavailable   412
  Connection reset          97
  400 Bad Request           3
retry: tidak ada`,
    {
      baris: 'Baris 8 · Gagal sementara → retry dengan backoff',
      bukti: 'Mayoritas error bersifat sementara (503, koneksi putus) dan hilang saat diulang.',
      tindakan: 'Retry 2–3 kali dengan exponential backoff + jitter, hanya untuk error sementara (bukan 400), dan hanya untuk operasi idempoten atau yang ber-idempotency key. Pasang timeout per percobaan.',
      harga: 'Latensi bertambah saat retry, dan risiko retry storm bila tanpa jitter atau batas. Gabungkan dengan circuit breaker.',
      jebakan: 'Me-retry 400 (tidak akan berhasil) atau retry tanpa batas dan tanpa jitter.',
    }),
  incident('SDP-36', 'Tulis IoT jenuh walau semua cara murah sudah dicoba',
    'Platform IoT menulis 180.000 event per detik dan tumbuh 15% per bulan. Primary PostgreSQL sudah 64 vCPU, index sudah minimal, insert sudah batch, data lama diarsipkan, dan tabel dipartisi harian.',
    `primary: WAL write & IOPS jenuh, CPU 88%
read replica: tidak membantu (beban 97% tulis)
proyeksi: 2× dalam 5 bulan`,
    {
      baris: 'Baris 5 · DB berat di tulis → sharding',
      bukti: 'Beban tulis melampaui kemampuan satu primary setelah semua langkah yang lebih murah dilakukan, dan tren pertumbuhannya jelas.',
      tindakan: 'Shard berdasarkan hash `device_id` atau `tenant_id` (mis. Citus, atau consistent hashing di aplikasi), atau pindah ke penyimpanan yang dioptimalkan untuk tulis time-series.',
      harga: 'Query lintas shard (pindahkan analitik ke warehouse), resharding, dan kompleksitas operasional.',
      jebakan: 'Shard berdasarkan waktu. Semua tulis baru jatuh ke shard terbaru sehingga terjadi hotspot.',
    }),
];

const combined: QAItem[] = [
  incident('SDP-37', 'Layanan pembayaran tumbang lagi setiap kali baru pulih',
    'Setelah gangguan 5 menit, layanan pembayaran pulih, tetapi dalam 30 detik traffic ke sana melonjak 9× normal dan layanan tumbang lagi. Pola ini terulang tiga kali.',
    `payment rps:  normal 300 → saat pulih 2.700 → tumbang → pulih → 2.900 → tumbang
klien: gateway retry 3×, service checkout retry 3×, SDK HTTP retry 3× (tanpa jitter)`,
    {
      baris: 'Gabungan Baris 8 + 10 + 9 · Retry storm',
      bukti: 'Retry di tiga lapisan (3 × 3 × 3 = 27 request per kegagalan) tanpa jitter. Semua klien mengulang serentak tepat saat layanan pulih.',
      tindakan: 'Retry di satu lapisan saja, dengan jitter dan retry budget. Circuit breaker dengan HALF_OPEN yang hanya meloloskan sedikit panggilan percobaan. Rate limiting/load shedding di depan layanan pembayaran.',
      harga: 'Sebagian request gagal lebih cepat selama pemulihan, demi pemulihan yang stabil.',
      jebakan: 'Menambah kapasitas pembayaran 10×. Gelombang retry berikutnya tetap bisa melampauinya.',
    }),
  incident('SDP-38', 'Harga baru tidak muncul selama tepat 10 menit, padahal cache sudah dihapus',
    'Admin mengubah harga produk. Panel admin langsung menampilkan harga baru, tetapi halaman publik menampilkan harga lama selama tepat 10 menit. Kode sudah menghapus key cache setelah update.',
    `cache TTL: 10 menit
update harga → DELETE cache key (sukses)
GET publik berikutnya: cache miss → SELECT ke READ REPLICA → simpan ke cache
replication lag saat itu: ~800 ms`,
    {
      baris: 'Interaksi Baris 1 + 4 · Cache diisi ulang dari replica yang tertinggal',
      bukti: 'Cache dihapus, lalu request publik berikutnya membaca replica yang belum menerima update dan menyimpan nilai lama itu ke cache selama TTL penuh. Durasi "tepat 10 menit" sama dengan TTL.',
      tindakan: 'Isi ulang cache dari primary untuk key yang baru ditulis, atau lakukan penghapusan kedua setelah melewati jendela lag (delayed double delete). Pantau replication lag, dan pakai TTL lebih pendek untuk data yang sering berubah.',
      harga: 'Sedikit beban tambahan ke primary atau logika invalidasi yang lebih rumit.',
      jebakan: 'Menyalahkan cache lalu mematikannya. Masalahnya ada pada urutan antara invalidasi dan replikasi.',
    }),
  incident('SDP-39', 'Pesanan tercatat dua kali, hanya saat deploy',
    'Laporan keuangan menunjukkan 0,3% pesanan tercatat dua kali, semuanya pada menit-menit deploy. Consumer RabbitMQ memakai ack manual setelah proses selesai.',
    `deploy 14:02: consumer di-restart (SIGTERM)
14:02:11 order O-551 diproses → insert sukses → proses berhenti sebelum ack
14:02:19 pesan O-551 dikirim ulang → diproses lagi → insert kedua`,
    {
      baris: 'Interaksi Baris 2 + 11 · At-least-once delivery tanpa consumer idempoten',
      bukti: 'Pesan yang sudah diproses tetapi belum di-ack dikirim ulang oleh broker setelah restart. Ini perilaku normal at-least-once, bukan bug broker.',
      tindakan: 'Buat consumer idempoten: catat id pesan (atau unique constraint pada id pesanan) dalam transaksi yang sama dengan efeknya, seperti tabel `processed_messages` di Lab Flash Sale. Tambahkan graceful shutdown agar pesan yang sedang diproses diselesaikan sebelum berhenti.',
      harga: 'Satu tabel atau constraint tambahan dan satu query per pesan.',
      jebakan: 'Mencari pengaturan "exactly-once" di broker. Jaminan akhirnya tetap harus dibuat di consumer.',
    }),
];

const blocks: Block[] = [
  paragraph('Hafal 12 baris berbeda dengan bisa memakainya. Di dunia nyata, insiden tidak datang dengan label "pasang cache". Yang datang adalah grafik, potongan log, dan keluhan user. Latihan ini melatih langkah yang sering dilewati: membaca bukti, memilih baris yang tepat, dan menyebut harganya.'),
  heading('Cara berlatih'),
  { type: 'steps', items: [
    { title: 'Baca gejala dan bukti', text: 'Buka satu insiden, baca konteks dan potongan metrik/log-nya. Jangan buka jawabannya dulu.' },
    { title: 'Jawab lima hal', text: 'Baris mana, bukti mana yang mengonfirmasi, tindakan konkret, harga yang dibayar, dan jebakan yang menggoda tetapi salah.' },
    { title: 'Buka jawaban dan nilai dirimu', text: 'Tandai "Paham" hanya bila kelima bagian tepat. Insiden yang ditandai "Ulangi" muncul di filter latihanmu.' },
  ] },
  paragraph('Dua belas insiden pertama masing-masing mewakili satu baris, dengan urutan diacak. Tiga insiden terakhir adalah gabungan beberapa baris, yang paling sering terjadi di produksi dan paling sering salah didiagnosis.'),
  heading('Insiden satu baris'),
  { type: 'qa', items: singleLine },
  heading('Insiden gabungan'),
  { type: 'qa', items: combined },
  ...practice('sdp-latihan-insiden', [
    'Jawab ke-15 insiden tanpa membuka jawaban, lalu nilai diri dengan tombol Paham/Ulangi.',
    'Tulis satu insiden nyata dari pekerjaanmu dengan format yang sama: konteks, bukti, baris, tindakan, harga, jebakan.',
    'Pilih dua insiden gabungan dan reproduksi salah satunya di [Lab Flash Sale](#distributed.sdp-lab-flash-sale).',
  ]),
  references(
    ['Google SRE Book: Effective Troubleshooting', 'https://sre.google/sre-book/effective-troubleshooting/'],
    ['Google SRE Book: Addressing Cascading Failures', 'https://sre.google/sre-book/addressing-cascading-failures/'],
    ['AWS Builders\' Library: Avoiding insurmountable queue backlogs', 'https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/'],
  ),
];

export const systemDesignDrillModules: Omit<Module, 'code'>[] = [
  {
    id: 'sdp-latihan-insiden',
    title: 'Latihan Diagnosis: 15 Insiden dari Gejala ke Baris yang Tepat',
    summary: 'Dua belas insiden satu baris dan tiga insiden gabungan: baca metrik dan log, pilih baris yang tepat, sebut bukti, tindakan, harga, dan jebakannya.',
    track: TRACK,
    source: systemDesignPatternSource,
    duration: '1,5 jam',
    level: 'Med',
    blocks,
  },
];
