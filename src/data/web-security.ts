import type { Block, Curriculum, Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const WEB = 'Internet & HTTP';
const SEC = 'Keamanan Aplikasi';

const webSecurityTracks: Track[] = [
  { title: WEB, summary: 'Apa yang terjadi dari URL sampai respons: DNS, TCP, TLS, semantik HTTP, caching, cookie, desain REST API, serta aturan browser seperti same-origin policy dan CORS.' },
  { title: SEC, summary: 'Peta OWASP Top 10:2025 lalu praktiknya: injection, XSS & CSRF, autentikasi, otorisasi, rahasia & supply chain, dan checklist sebelum rilis ke produksi.' },
];

export const webSecuritySource = 'Fondasi Web & Keamanan: materi tulisan tangan dari MDN, OWASP, RFC HTTP, dan web.dev (30 Oktober 2026)';

/** Satu blok kode per tab, untuk contoh yang sama dalam beberapa bahasa. */
const tabs = (...items: [label: string, block: Block][]): Block => ({
  type: 'tabs', tabs: items.map(([label, block]) => ({ label, blocks: [block] })),
});
const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });

const modules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── Internet & HTTP ─────────────────────────────
  {
    id: 'web-cara-kerja-internet',
    title: 'Cara Kerja Internet: dari URL ke Respons',
    summary: 'Apa yang terjadi saat mengetik URL: DNS, IP & port, TCP handshake, TLS handshake, latency, serta cara mengamatinya dengan dig, curl -v, dan openssl.',
    track: WEB, source: webSecuritySource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('Saat kamu mengetik `https://api.toko.example/produk` lalu menekan Enter, ada beberapa langkah yang terjadi sebelum byte pertama JSON diterima. Backend developer perlu memahaminya untuk menjawab pertanyaan sehari-hari: mengapa request pertama lambat, mengapa sertifikat ditolak, mengapa service tidak bisa dihubungi dari container, dan di mana sebaiknya cache dipasang.'),
      list([
        '**Parsing URL**: skema (`https`), host (`api.toko.example`), port (implisit 443 untuk HTTPS, 80 untuk HTTP), path (`/produk`), dan query string.',
        '**DNS**: nama host diterjemahkan menjadi alamat IP. Browser memeriksa cache-nya sendiri, lalu cache OS, lalu *recursive resolver* (milik ISP, kantor, atau publik seperti `1.1.1.1`). Resolver bertanya berurutan ke root server, server TLD, lalu *authoritative nameserver* domain itu. Hasilnya di-cache selama TTL.',
        '**TCP**: three-way handshake (SYN, SYN-ACK, ACK) ke `IP:443`. Biayanya 1 RTT (*round-trip time*).',
        '**TLS**: client dan server menyepakati versi dan cipher. Server mengirim sertifikat yang dicek terhadap CA tepercaya dan nama host (dikirim lewat SNI), lalu kunci sesi diturunkan. TLS 1.3 butuh 1 RTT, TLS 1.2 butuh 2 RTT. Versi HTTP (h2 atau http/1.1) juga disepakati di sini lewat ALPN.',
        '**HTTP**: request dikirim di atas koneksi terenkripsi, server memproses, lalu mengirim respons. Koneksi dipertahankan (*keep-alive*) agar request berikutnya tidak perlu handshake ulang.',
        '**Pemrosesan di klien**: browser mem-parse HTML/CSS/JS dan memicu request lanjutan; klien API mem-parse JSON.',
      ], true),
      code('Mengamati DNS dengan dig', `dig +short example.com A          # alamat IPv4
dig +short example.com AAAA       # alamat IPv6
dig example.com                   # lengkap: ANSWER SECTION, TTL, server yang menjawab
dig +trace example.com            # ikuti rantai root -> TLD -> authoritative
dig @1.1.1.1 example.com          # tanya resolver tertentu (bandingkan dengan resolver kantor)
dig +short example.com NS         # nameserver authoritative
dig +short example.com TXT        # mis. verifikasi domain, SPF
dig -x 1.1.1.1 +short             # reverse lookup (PTR)

# Windows tanpa dig: nslookup example.com   atau   Resolve-DnsName example.com (PowerShell)`, 'bash'),
      table(['Record', 'Isi', 'Contoh pemakaian'], [
        ['`A` / `AAAA`', 'Alamat IPv4 / IPv6', 'Mengarahkan `api.toko.example` ke load balancer'],
        ['`CNAME`', 'Alias ke nama lain', '`www` menunjuk ke host CDN'],
        ['`MX`', 'Server email penerima', 'Email ke `@toko.example`'],
        ['`TXT`', 'Teks bebas', 'SPF, DKIM, verifikasi kepemilikan domain'],
        ['`NS`', 'Nameserver authoritative', 'Delegasi domain ke penyedia DNS'],
        ['`HTTPS` / `SVCB`', 'Petunjuk koneksi (ALPN, IP hint)', 'Mengiklankan dukungan HTTP/3 sejak awal'],
      ]),
      code('curl -v: membaca setiap tahap koneksi (output dipersingkat)', `$ curl -v https://example.com/
* Host example.com:443 was resolved.                 <- 1. DNS selesai
*   Trying 203.0.113.10:443...
* Connected to example.com (203.0.113.10) port 443  <- 2. TCP handshake selesai
* ALPN: curl offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):   <- 3. TLS handshake dimulai
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN: server accepted h2                           <- versi HTTP disepakati di dalam TLS
* Server certificate:
*  subject: CN=example.com
*  expire date: ...
*  issuer: ...                                       <- rantai sertifikat ke CA
> GET / HTTP/2                                       <- 4. request (baris diawali >)
> Host: example.com
> User-Agent: curl/8.x
> Accept: */*
< HTTP/2 200                                         <- 5. respons (baris diawali <)
< content-type: text/html
< cache-control: max-age=3600

(Alamat 203.0.113.x adalah blok dokumentasi; IP aslinya berbeda.)`, 'text'),
      code('Mengukur latency per tahap & memeriksa sertifikat', `# Setiap angka bersifat kumulatif sejak awal request
curl -o /dev/null -s -w 'dns=%{time_namelookup}s tcp=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s\\n' https://example.com/

# Sertifikat: subjek, penerbit, masa berlaku
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates

# Apakah port terbuka? (PowerShell: Test-NetConnection db.internal -Port 5432)
nc -vz db.internal 5432`, 'bash'),
      callout('tip', 'Latency = jumlah RTT × jarak', 'Request HTTPS pertama ke server baru butuh kira-kira 3 sampai 4 RTT sebelum byte pertama respons tiba: DNS (bila belum di-cache), TCP, TLS 1.3, lalu request itu sendiri. Bila RTT ke server 200 ms (misalnya Jakarta ke pesisir timur AS), ratusan milidetik habis sebelum kodemu sempat bekerja. Penawarnya: pakai ulang koneksi (keep-alive, *connection pool* di HTTP client dan driver database), letakkan server atau CDN dekat pengguna, gunakan HTTP/2 atau HTTP/3, dan aktifkan TLS session resumption.'),
      callout('info', 'IP, port, dan jebakan 127.0.0.1', 'IP mengidentifikasi host, port mengidentifikasi proses di host itu (443 HTTPS, 80 HTTP, 53 DNS, 22 SSH, 5432 PostgreSQL). Server yang listen di `127.0.0.1:8080` hanya menerima koneksi dari host yang sama; di dalam container artinya **tidak bisa diakses dari luar container**. Bind ke `0.0.0.0` (semua interface) lalu batasi akses dengan firewall atau network policy. Alamat privat (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) tidak bisa dirutekan dari internet. Lihat juga [Shell: Proses, Port, curl & SSH](#tools.sh-proses-jaringan-ssh).'),
      ...quiz([
        ['WEB-01', 'Request pertama ke API memakan 900 ms, request berikutnya hanya 120 ms. Apa penjelasan yang paling mungkin?', 'Request pertama menanggung biaya DNS lookup, TCP handshake, dan TLS handshake (beberapa RTT). Request berikutnya memakai ulang koneksi yang sama (keep-alive) dan hasil DNS yang sudah di-cache, sehingga hanya perlu 1 RTT plus waktu proses server. Ukur dengan `curl -w` untuk melihat porsi `dns`, `tcp`, dan `tls`.'],
        ['WEB-02', 'Aplikasi di dalam container berjalan normal (`curl localhost:8080` di dalam container berhasil), tetapi dari host gagal walau port sudah di-publish. Apa yang perlu dicek pertama?', 'Alamat bind. Bila server listen di `127.0.0.1`, ia hanya menerima koneksi dari loopback container itu sendiri. Ubah menjadi `0.0.0.0:8080` (misalnya `--host 0.0.0.0` di uvicorn/Vite, `server.address` di Spring) agar menerima koneksi dari interface jaringan container.'],
        ['WEB-03', 'Record DNS sudah diubah ke IP baru, tetapi sebagian pengguna masih diarahkan ke server lama selama satu jam. Mengapa?', 'Resolver dan klien menyimpan jawaban lama sampai TTL-nya habis. Bila TTL record 3600 detik, perubahan baru terlihat merata setelah sekitar satu jam. Praktik migrasi: turunkan TTL (misalnya ke 60 detik) beberapa waktu sebelum perpindahan, lalu naikkan lagi setelah stabil, dan biarkan server lama tetap hidup sampai trafik habis.'],
      ]),
      ...practice('web-cara-kerja-internet', [
        'Jalankan `dig +trace` untuk domain kantormu atau proyekmu; catat nameserver authoritative dan TTL record `A`-nya.',
        'Jalankan `curl -v` ke sebuah API dan tandai baris yang menunjukkan DNS, TCP, TLS, request, dan respons.',
        'Ukur `curl -w` ke tiga endpoint (localhost, server di region yang sama, server di benua lain) dan jelaskan perbedaan `tcp` dan `tls` dengan konsep RTT.',
        'Periksa tanggal kedaluwarsa sertifikat sebuah domain dengan `openssl s_client` dan tuliskan siapa penerbitnya.',
      ]),
      references(
        ['MDN: How the web works', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works'],
        ['MDN: An overview of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview'],
        ['MDN Glossary: TLS', 'https://developer.mozilla.org/en-US/docs/Glossary/TLS'],
        ['RFC 1035: Domain Names, Implementation and Specification', 'https://www.rfc-editor.org/rfc/rfc1035.html'],
        ['RFC 9293: Transmission Control Protocol', 'https://www.rfc-editor.org/rfc/rfc9293.html'],
        ['RFC 8446: TLS 1.3', 'https://www.rfc-editor.org/rfc/rfc8446.html'],
        ['curl man page', 'https://curl.se/docs/manpage.html'],
      ),
    ],
  },
  {
    id: 'web-http-mendalam',
    title: 'HTTP Mendalam: Method, Status, Header & Caching',
    summary: 'Anatomi request/respons, safe dan idempotent method, status code yang tepat, header penting, caching dengan Cache-Control dan ETag, cookie, serta HTTP/1.1 vs HTTP/2 vs HTTP/3.',
    track: WEB, source: webSecuritySource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('HTTP adalah protokol *request-response* yang **stateless**: setiap request membawa semua informasi yang dibutuhkan server, sedangkan "state" seperti login dibawa lewat cookie atau token. Semantiknya (method, status code, header) didefinisikan di RFC 9110 dan **sama** di HTTP/1.1, HTTP/2, dan HTTP/3; yang berbeda hanya cara pesannya dikirim lewat jaringan.'),
      code('Anatomi request dan respons (format HTTP/1.1)', `POST /v1/orders HTTP/1.1                       <- method, target, versi
Host: api.toko.example                         <- header (wajib di HTTP/1.1)
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOi...
Idempotency-Key: 0b9c2f0e-6a0e-4d8b-9a55-3f1f2a7c9e11
Content-Length: 34
                                               <- baris kosong memisahkan header dan body
{"productId":"p-123","quantity":2}

HTTP/1.1 201 Created                           <- status line
Location: /v1/orders/ord_789                   <- URL resource baru
Content-Type: application/json
Cache-Control: no-store

{"id":"ord_789","status":"PENDING"}`, 'text'),
      heading('Safe dan idempotent'),
      paragraph('**Safe** berarti method tidak dimaksudkan mengubah state di server. **Idempotent** berarti mengirim request yang sama berkali-kali menghasilkan efek yang sama dengan mengirimnya sekali. Sifat ini penting karena client, proxy, dan load balancer boleh mengulang request idempotent secara otomatis ketika koneksi putus.'),
      table(['Method', 'Safe', 'Idempotent', 'Pemakaian umum'], [
        ['`GET`', 'Ya', 'Ya', 'Mengambil resource; jangan pernah mengubah data lewat GET'],
        ['`HEAD`', 'Ya', 'Ya', 'Seperti GET tanpa body: cek keberadaan, ukuran, atau ETag'],
        ['`OPTIONS`', 'Ya', 'Ya', 'Menanyakan kapabilitas; dipakai browser untuk preflight CORS'],
        ['`POST`', 'Tidak', 'Tidak', 'Membuat resource atau menjalankan aksi; jadikan aman diulang dengan `Idempotency-Key`'],
        ['`PUT`', 'Tidak', 'Ya', 'Mengganti seluruh representasi resource di URL tertentu'],
        ['`PATCH`', 'Tidak', 'Tidak dijamin', 'Mengubah sebagian resource (`{"status":"PAID"}` idempotent, `{"op":"increment"}` tidak)'],
        ['`DELETE`', 'Tidak', 'Ya', 'Menghapus; DELETE kedua tidak menghapus hal lain (boleh menjawab 404 atau 204)'],
      ]),
      table(['Status', 'Arti', 'Kapan dipakai'], [
        ['`200 OK` / `201 Created` / `204 No Content`', 'Sukses', '201 untuk resource baru (sertakan `Location`); 204 bila tidak ada body'],
        ['`301` / `308` vs `302` / `307`', 'Redirect permanen vs sementara', '307 dan 308 menjamin method dan body tidak berubah saat diikuti'],
        ['`304 Not Modified`', 'Salinan cache masih valid', 'Jawaban untuk `If-None-Match` / `If-Modified-Since`'],
        ['`400 Bad Request`', 'Request rusak', 'JSON tidak valid, parameter wajib hilang'],
        ['`401 Unauthorized`', 'Belum terautentikasi', 'Token tidak ada, kedaluwarsa, atau tidak valid; sertakan `WWW-Authenticate`'],
        ['`403 Forbidden`', 'Terautentikasi tetapi tidak berhak', 'User biasa memanggil endpoint admin'],
        ['`404 Not Found`', 'Tidak ada (atau tidak boleh tahu)', 'Juga dipakai untuk menyembunyikan resource milik orang lain'],
        ['`409 Conflict`', 'Konflik dengan state saat ini', 'Email sudah terdaftar, versi optimistic lock berbeda'],
        ['`422 Unprocessable Content`', 'Format benar, isi tidak valid', 'Validasi bisnis gagal (sebagian tim memakai 400 untuk semua validasi; yang penting konsisten)'],
        ['`429 Too Many Requests`', 'Kena rate limit', 'Sertakan `Retry-After`'],
        ['`500` / `502` / `503` / `504`', 'Kesalahan server / gateway', '503 + `Retry-After` saat maintenance; 502/504 biasanya dari proxy'],
      ]),
      callout('warn', '401 vs 403', 'Meski namanya "Unauthorized", `401` berarti **belum terautentikasi** (server tidak tahu siapa kamu). `403` berarti server tahu siapa kamu tetapi kamu **tidak berhak**. Mengirim ulang token yang sama tidak akan mengubah 403.'),
      heading('Caching'),
      code('Cache-Control, ETag, dan revalidasi', `# Respons pertama
HTTP/1.1 200 OK
Cache-Control: private, max-age=60          <- hanya cache browser, segar selama 60 detik
ETag: "v42-a1b2c3"                          <- sidik jari versi representasi

# Setelah 60 detik salinan dianggap basi -> browser bertanya "masih sama?"
GET /v1/profile HTTP/1.1
If-None-Match: "v42-a1b2c3"

HTTP/1.1 304 Not Modified                   <- tanpa body; klien memakai salinan lokal
ETag: "v42-a1b2c3"

# Aset statis dengan hash di nama file: cache selamanya
Cache-Control: public, max-age=31536000, immutable

# Data sensitif (saldo, data pribadi): jangan disimpan di mana pun
Cache-Control: no-store`, 'text'),
      table(['Directive', 'Arti'], [
        ['`no-store`', 'Jangan simpan sama sekali. Pakai untuk respons berisi data pribadi atau token.'],
        ['`no-cache`', 'Boleh disimpan, tetapi **wajib revalidasi** ke server sebelum dipakai (bukan berarti "tidak di-cache").'],
        ['`private` / `public`', 'Hanya cache browser / boleh juga di cache bersama (CDN, proxy).'],
        ['`max-age=N` / `s-maxage=N`', 'Segar selama N detik; `s-maxage` khusus cache bersama.'],
        ['`stale-while-revalidate=N`', 'Boleh menyajikan salinan basi sambil memperbarui di latar belakang.'],
        ['`immutable`', 'Isi tidak akan berubah selama segar; browser tidak perlu revalidasi saat reload.'],
      ]),
      code('Cookie dan versi protokol', `# Server menyetel cookie (atribut keamanan dibahas di modul browser & CORS)
Set-Cookie: __Host-session=9f8e7d6c; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600
# Browser mengirimnya kembali pada request berikutnya
Cookie: __Host-session=9f8e7d6c

# Cek versi HTTP yang dinegosiasikan
curl -sI --http1.1 https://example.com/ | head -1     # HTTP/1.1 200 OK
curl -sI --http2   https://example.com/ | head -1     # HTTP/2 200
curl -sI --http3   https://example.com/ | head -1     # butuh curl yang dibangun dengan dukungan HTTP/3`, 'text'),
      table(['Aspek', 'HTTP/1.1', 'HTTP/2', 'HTTP/3'], [
        ['Transport', 'TCP', 'TCP', 'QUIC di atas UDP'],
        ['Format', 'Teks', 'Biner (frame)', 'Biner (frame)'],
        ['Banyak request sekaligus', 'Satu per koneksi; browser membuka beberapa koneksi per host', 'Multiplexing banyak stream di satu koneksi', 'Multiplexing, stream independen'],
        ['Head-of-line blocking', 'Di level HTTP dan TCP', 'Masih di level TCP: satu paket hilang menahan semua stream', 'Dihilangkan di transport; paket hilang hanya menahan stream-nya'],
        ['Kompresi header', 'Tidak ada', 'HPACK', 'QPACK'],
        ['Handshake', 'TCP + TLS', 'TCP + TLS (dipilih lewat ALPN)', 'QUIC menyatukan transport + TLS 1.3 (1 RTT, 0-RTT saat resume)'],
      ]),
      ...quiz([
        ['WEB-04', 'Mengapa `PUT /users/7` idempotent sedangkan `POST /users` tidak?', 'PUT mengganti resource di URL yang sudah ditentukan dengan representasi yang sama, jadi mengirimnya dua kali tetap berakhir di state yang sama. POST ke koleksi membuat resource baru setiap kali dikirim, sehingga retry bisa menghasilkan dua user. Untuk membuat POST aman diulang, gunakan `Idempotency-Key`.'],
        ['WEB-05', 'Apa beda `Cache-Control: no-cache` dan `no-store`?', '`no-cache` tetap boleh menyimpan salinan, tetapi wajib revalidasi ke server (misalnya lewat ETag) sebelum dipakai. `no-store` melarang penyimpanan sama sekali, cocok untuk respons berisi data pribadi atau token.'],
        ['WEB-06', 'Token JWT user valid, tetapi ia memanggil `DELETE /admin/users/9` tanpa role admin. Status apa yang tepat, dan apa bedanya bila token sudah kedaluwarsa?', 'Tanpa role admin: `403 Forbidden`, karena identitasnya diketahui tetapi tidak berhak. Token kedaluwarsa: `401 Unauthorized` (dengan header `WWW-Authenticate`), karena server tidak bisa memastikan identitasnya; client sebaiknya refresh token atau login ulang.'],
      ]),
      ...practice('web-http-mendalam', [
        'Pilih satu API yang kamu buat; buat tabel endpoint berisi method, status sukses, status gagal, dan apakah endpoint itu idempotent.',
        'Tambahkan `ETag` pada satu endpoint GET dan buktikan dengan `curl -H \'If-None-Match: "..."\'` bahwa server menjawab 304.',
        'Periksa header `Cache-Control` pada endpoint yang mengembalikan data pribadi; pastikan nilainya `no-store`.',
        'Bandingkan `curl -sI --http1.1` dan `--http2` ke situs produksimu dan catat versi yang dinegosiasikan.',
      ]),
      references(
        ['RFC 9110: HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110.html'],
        ['RFC 9111: HTTP Caching', 'https://www.rfc-editor.org/rfc/rfc9111.html'],
        ['MDN: HTTP request methods', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods'],
        ['MDN: HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status'],
        ['MDN: HTTP caching', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching'],
        ['MDN: Evolution of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP'],
        ['web.dev: Prevent unnecessary network requests with the HTTP Cache', 'https://web.dev/articles/http-cache'],
        ['RFC 9113: HTTP/2', 'https://www.rfc-editor.org/rfc/rfc9113.html'],
        ['RFC 9114: HTTP/3', 'https://www.rfc-editor.org/rfc/rfc9114.html'],
      ),
    ],
  },
  {
    id: 'web-desain-rest-api',
    title: 'Desain REST API yang Konsisten',
    summary: 'Penamaan resource, versioning, pagination offset vs cursor, filter & sort, Idempotency-Key, format error application/problem+json (RFC 9457), dan kontrak OpenAPI.',
    track: WEB, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('API yang baik terasa **membosankan**: setelah memakai dua endpoint, developer bisa menebak bentuk endpoint ketiga. Konsistensi lebih penting daripada debat "REST murni". Modul ini merangkum keputusan yang paling sering muncul: nama resource, versi, pagination, error, retry yang aman, dan kontrak tertulis.'),
      table(['Hindari', 'Lebih baik', 'Alasan'], [
        ['`GET /getOrders`', '`GET /orders`', 'Method sudah menyatakan aksi; URL menyatakan resource (kata benda, jamak)'],
        ['`POST /orders/123/delete`', '`DELETE /orders/123`', 'Pakai semantik method HTTP'],
        ['`GET /order?id=123`', '`GET /orders/123`', 'Identitas di path, query untuk filter, sort, dan pagination'],
        ['`/Order_List`, `/orderItems`', '`/orders`, `/order-items`', 'Huruf kecil dan kebab-case di URL; pilih satu gaya field JSON (camelCase atau snake_case) dan pakai di mana-mana'],
        ['`/users/7/orders/123/items/9/reviews`', '`/items/9/reviews`', 'Batasi nesting satu sampai dua level'],
        ['`POST /orders/123/update-status`', '`POST /orders/123/cancel` atau `PATCH /orders/123`', 'Aksi non-CRUD boleh berupa sub-resource kata kerja, asal konsisten'],
      ]),
      callout('info', 'Versioning', 'Pilihan paling umum adalah versi di path (`/v1/orders`): jelas, mudah di-route dan di-cache. Alternatifnya lewat header (`Accept: application/vnd.toko.v2+json`) atau versi berbasis tanggal per akun. Apa pun caranya: **perubahan aditif** (field atau endpoint baru) tidak memerlukan versi baru, sedangkan menghapus atau mengganti nama field, mengubah tipe, atau mengubah arti status code adalah *breaking change*. Umumkan penghentian dengan header `Deprecation` (RFC 9745) dan `Sunset` (RFC 8594), beri tenggat, dan pantau siapa yang masih memanggil versi lama.'),
      code('Pagination: offset vs cursor (keyset)', `-- Request offset:  GET /v1/orders?limit=20&offset=100000
-- Database tetap membaca lalu membuang 100.000 baris pertama
SELECT id, created_at, total FROM orders
WHERE customer_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 100000;

-- Request cursor:  GET /v1/orders?limit=20&after=eyJjIjoiMjAyNi0xMC0yOVQwODowMDowMFoiLCJpIjoxMjN9
-- Cursor = base64 dari (created_at, id) baris terakhir halaman sebelumnya
SELECT id, created_at, total FROM orders
WHERE customer_id = $1
  AND (created_at, id) < ($2, $3)        -- lanjut tepat setelah baris terakhir
ORDER BY created_at DESC, id DESC        -- id sebagai tie-breaker agar urutan stabil
LIMIT 20;

-- Index yang membuat kedua query cepat
CREATE INDEX idx_orders_customer_created ON orders (customer_id, created_at DESC, id DESC);

-- Bentuk respons: { "data": [ ... ], "nextCursor": "eyJ..." }  (null bila halaman terakhir)`, 'sql'),
      table(['Aspek', 'Offset (`?page=` / `?offset=`)', 'Cursor / keyset (`?after=`)'], [
        ['Lompat ke halaman N', 'Bisa', 'Tidak (hanya maju/mundur)'],
        ['Performa di halaman jauh', 'Makin lambat (baris dibaca lalu dibuang)', 'Stabil, memakai index'],
        ['Data berubah saat paging', 'Baris bisa terlewat atau muncul dua kali', 'Konsisten'],
        ['Cocok untuk', 'Tabel admin kecil, butuh nomor halaman', 'Feed, infinite scroll, API publik, sinkronisasi data'],
      ]),
      paragraph('**Filter dan sort** lewat query string: `GET /v1/orders?status=PAID&created_from=2026-10-01&sort=-created_at&limit=20`. Kolom sort harus berasal dari *allowlist* karena tidak bisa diparameterisasi di SQL (lihat [Injection](#web.sec-injection)), dan batasi `limit` maksimum (misalnya 100) agar satu request tidak menguras database.'),
      code('Idempotency-Key untuk POST yang aman diulang (sketsa Express)', `app.post('/v1/payments', requireAuth, async (req, res) => {
  const key = req.get('Idempotency-Key');
  if (!key) return problem(res, 400, 'Header Idempotency-Key wajib diisi');

  const scope = \`\${req.user.id}:\${key}\`;          // key hanya berlaku per user
  const bodyHash = sha256(JSON.stringify(req.body));
  const saved = await idem.find(scope);              // tabel idempotency_keys atau Redis

  if (saved) {
    if (saved.bodyHash !== bodyHash) return problem(res, 422, 'Idempotency-Key dipakai untuk body berbeda');
    if (saved.state === 'in_progress') return problem(res, 409, 'Request yang sama masih diproses');
    return res.status(saved.status).json(saved.body); // putar ulang respons pertama, tanpa charge ulang
  }

  await idem.insertInProgress(scope, bodyHash);      // UNIQUE(scope) mencegah race dua request bersamaan
  const payment = await payments.charge(req.body);
  await idem.complete(scope, 201, payment);          // simpan hasil, kedaluwarsa mis. 24 jam
  res.status(201).json(payment);
});`, 'ts'),
      code('Format error standar: application/problem+json (RFC 9457)', `{
  "type": "https://api.toko.example/problems/insufficient-stock",
  "title": "Stok tidak mencukupi",
  "status": 409,
  "detail": "Produk p-123 tersisa 1, diminta 2.",
  "instance": "/v1/orders",
  "requestId": "req_01JBX7Q2M4",
  "errors": [
    { "pointer": "/quantity", "detail": "maksimal 1" }
  ]
}`, 'json'),
      paragraph('`type`, `title`, `status`, `detail`, dan `instance` adalah anggota standar; field tambahan seperti `errors` dan `requestId` diperbolehkan sebagai *extension member*. Kirim dengan `Content-Type: application/problem+json`. Client cukup menulis satu penangan error untuk semua endpoint, dan `type` menjadi kode error yang stabil untuk logika program, sementara `title` dan `detail` untuk manusia.'),
      code('Kontrak OpenAPI (potongan)', `openapi: 3.1.1          # 3.2 sudah terbit (2025); banyak tool masih menargetkan 3.1
info:
  title: Toko API
  version: 1.0.0
paths:
  /v1/orders/{orderId}:
    get:
      operationId: getOrder
      security:
        - bearerAuth: []
      parameters:
        - name: orderId
          in: path
          required: true
          schema: { type: string, pattern: '^ord_[a-zA-Z0-9]+$' }
      responses:
        '200':
          description: Order ditemukan
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Order' }
        '404':
          description: Tidak ditemukan atau bukan milik user
          content:
            application/problem+json:
              schema: { $ref: '#/components/schemas/Problem' }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }`, 'yaml'),
      callout('tip', 'Kontrak sebagai sumber kebenaran', 'Simpan file OpenAPI di repo, review perubahannya di PR, dan otomasi dari sana: dokumentasi (Swagger UI, Redoc), generator client, validasi request di server, dan contract test. Alat seperti `oasdiff` bisa mendeteksi breaking change di CI. Untuk menguji API secara manual atau otomatis, lihat [API Testing dengan Postman](#testing.api-testing-dengan-postman).'),
      ...quiz([
        ['WEB-07', 'Feed transaksi memakai `?page=` dan pengguna mengeluh ada transaksi yang muncul dua kali saat scroll. Apa penyebab dan solusinya?', 'Dengan offset, transaksi baru yang masuk di depan menggeser semua baris, sehingga baris terakhir halaman sebelumnya muncul lagi di halaman berikutnya (atau ada yang terlewat bila data dihapus). Gunakan cursor/keyset pagination berdasarkan `(created_at, id)` baris terakhir; hasilnya stabil dan juga lebih cepat di halaman jauh.'],
        ['WEB-08', 'Client mengirim ulang `POST /v1/payments` dengan `Idempotency-Key` yang sama tetapi `amount` berbeda. Apa respons yang tepat?', 'Tolak dengan error (draft IETF Idempotency-Key menyarankan `422`), karena key yang sama hanya boleh mewakili satu operasi. Bila body identik dan request pertama sudah selesai, putar ulang respons pertama; bila masih diproses, jawab `409`.'],
        ['WEB-09', 'Apa keuntungan memakai `application/problem+json` dibanding setiap endpoint punya bentuk error sendiri?', 'Satu format standar (RFC 9457) yang dikenali tooling dan client: client cukup menulis satu penangan error, `type` menjadi kode error yang stabil untuk logika program, `status` konsisten dengan status HTTP, dan field tambahan seperti `errors` per field tetap dimungkinkan.'],
      ]),
      ...practice('web-desain-rest-api', [
        'Review daftar endpoint proyekmu terhadap tabel penamaan; perbaiki minimal tiga yang tidak konsisten (atau dokumentasikan alasannya).',
        'Ubah satu endpoint list dari offset ke cursor pagination; buktikan dengan `EXPLAIN` bahwa query memakai index.',
        'Implementasikan `Idempotency-Key` pada satu endpoint POST, termasuk kasus body berbeda (422) dan request bersamaan (409).',
        'Buat penangan error global yang selalu mengembalikan `application/problem+json`, lalu tulis kontrak OpenAPI untuk dua endpoint.',
      ]),
      references(
        ['RFC 9457: Problem Details for HTTP APIs', 'https://www.rfc-editor.org/rfc/rfc9457.html'],
        ['IETF draft: The Idempotency-Key HTTP Header Field', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/'],
        ['RFC 9745: The Deprecation HTTP Response Header Field', 'https://www.rfc-editor.org/rfc/rfc9745.html'],
        ['RFC 8594: The Sunset HTTP Header Field', 'https://www.rfc-editor.org/rfc/rfc8594.html'],
        ['OpenAPI Specification (versi terbaru)', 'https://spec.openapis.org/oas/latest.html'],
        ['OWASP REST Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html'],
      ),
    ],
  },
  {
    id: 'web-browser-cors',
    title: 'Browser: Same-Origin Policy, CORS, Cookie & Storage',
    summary: 'Origin vs site, same-origin policy, CORS dan preflight, atribut cookie Secure/HttpOnly/SameSite, pengantar Content Security Policy, dan memilih tempat menyimpan data di browser.',
    track: WEB, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Browser menjalankan kode dari banyak situs dalam satu aplikasi, jadi ia butuh aturan tentang siapa boleh membaca apa. Aturan dasarnya adalah **same-origin policy (SOP)**: skrip dari satu *origin* tidak boleh **membaca** respons dari origin lain. *Origin* adalah kombinasi **skema + host + port**. Perhatikan kata *membaca*: SOP tidak mencegah browser **mengirim** request lintas situs, dan itulah akar serangan CSRF.'),
      table(['URL dibandingkan dengan `https://app.toko.example`', 'Same-origin?', 'Same-site?'], [
        ['`https://app.toko.example/akun`', 'Ya (hanya path berbeda)', 'Ya'],
        ['`http://app.toko.example`', 'Tidak (skema)', 'Tidak (skema berbeda dihitung beda situs)'],
        ['`https://app.toko.example:8443`', 'Tidak (port)', 'Ya'],
        ['`https://api.toko.example`', 'Tidak (host)', 'Ya (sama-sama `toko.example`)'],
        ['`https://toko-lain.example`', 'Tidak', 'Tidak'],
      ]),
      paragraph('*Site* adalah skema plus domain terdaftar (eTLD+1, misalnya `toko.example`). Konsep ini dipakai oleh atribut cookie `SameSite`; konsep origin dipakai oleh SOP dan CORS.'),
      heading('CORS dan preflight'),
      paragraph('**CORS** (*Cross-Origin Resource Sharing*) adalah cara server **melonggarkan** SOP secara selektif: server menyatakan origin mana yang boleh membaca responsnya. Request "sederhana" (GET/HEAD/POST dengan header standar dan `Content-Type` form atau `text/plain`) langsung dikirim. Request lain, misalnya yang membawa `Authorization` atau `Content-Type: application/json`, didahului **preflight** `OPTIONS`.'),
      code('Pertukaran preflight lalu request sebenarnya', `# 1. Browser otomatis mengirim preflight (kode aplikasimu tidak menulis ini)
OPTIONS /v1/orders HTTP/1.1
Host: api.toko.example
Origin: https://app.toko.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization, content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.toko.example
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 600          <- hasil preflight di-cache 10 menit
Vary: Origin

# 2. Preflight lolos, baru request sebenarnya dikirim
POST /v1/orders HTTP/1.1
Origin: https://app.toko.example
Authorization: Bearer eyJ...
Content-Type: application/json

HTTP/1.1 201 Created
Access-Control-Allow-Origin: https://app.toko.example   <- wajib ada lagi di respons ini
Vary: Origin`, 'text'),
      code('Konfigurasi CORS dengan allowlist (Express + paket cors)', `import cors from 'cors';

const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ORIGINS ?? 'https://app.toko.example').split(','),   // localhost hanya di env dev
);

app.use(cors({
  origin(origin, callback) {
    // origin kosong = bukan dari browser (curl, server-to-server); CORS tidak berlaku
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    return callback(null, false);       // tanpa header CORS -> browser menolak membaca respons
  },
  credentials: true,                    // izinkan cookie; tidak boleh dipadukan dengan origin '*'
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
  maxAge: 600,
}));

// SALAH: memantulkan Origin apa pun + credentials = situs mana pun bisa membaca data user yang login
// app.use(cors({ origin: true, credentials: true }));`, 'ts'),
      callout('warn', 'CORS bukan pengganti autentikasi', 'CORS hanya dipatuhi **browser** untuk melindungi pengguna. curl, Postman, dan skrip penyerang mengabaikannya sepenuhnya. Selain itu, untuk request sederhana server **sudah memproses** request sebelum browser memblokir pembacaan responsnya. Setiap endpoint tetap wajib memeriksa autentikasi dan otorisasi. Contoh middleware CORS di Go ada di [Middleware: CORS, Logging, Recover](#go.middleware-cors-logging-recover).'),
      heading('Atribut cookie'),
      table(['Atribut', 'Fungsi', 'Rekomendasi'], [
        ['`Secure`', 'Cookie hanya dikirim lewat HTTPS', 'Selalu'],
        ['`HttpOnly`', 'Tidak bisa dibaca JavaScript (`document.cookie`)', 'Selalu untuk session ID dan refresh token; XSS tidak bisa mencurinya'],
        ['`SameSite=Lax`', 'Tidak dikirim pada request lintas situs, kecuali navigasi top-level GET', 'Default yang baik untuk session'],
        ['`SameSite=Strict`', 'Tidak pernah dikirim dari konteks lintas situs', 'Aksi sangat sensitif; user yang datang dari link email tampak belum login'],
        ['`SameSite=None`', 'Selalu dikirim, termasuk lintas situs', 'Hanya bila memang perlu (widget embed, SSO); wajib bersama `Secure`'],
        ['`Domain`', 'Cookie juga berlaku untuk subdomain', 'Hilangkan bila tidak perlu (host-only lebih aman)'],
        ['Prefix `__Host-`', 'Browser mewajibkan `Secure`, `Path=/`, dan tanpa `Domain`', 'Pakai untuk cookie session'],
      ]),
      paragraph('Jangan bergantung pada nilai default `SameSite` karena perilaku browser berbeda; Chrome memperlakukan cookie tanpa atribut sebagai `Lax`, tetapi tidak semua browser demikian. Selalu setel secara eksplisit.'),
      heading('Content Security Policy (pengantar)'),
      paragraph('**CSP** adalah header yang memberi tahu browser sumber mana yang boleh memuat skrip, gaya, gambar, dan frame. Bila ada celah XSS, CSP yang ketat mencegah skrip sisipan dijalankan. Mulailah dengan mode `Report-Only` untuk melihat apa yang akan rusak sebelum menegakkannya. Pembahasan lengkap ada di [XSS & CSRF](#web.sec-xss-csrf).'),
      code('Contoh header CSP', `# Situs sederhana tanpa skrip pihak ketiga
Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'

# Strict CSP berbasis nonce (nonce acak baru di setiap respons), uji dulu dengan Report-Only
Content-Security-Policy-Report-Only: script-src 'nonce-R4nd0mP3rReq' 'strict-dynamic'; object-src 'none'; base-uri 'none'`, 'text'),
      table(['Tempat menyimpan', 'Dibaca JavaScript?', 'Dikirim otomatis?', 'Cocok untuk'], [
        ['Cookie `HttpOnly; Secure`', 'Tidak', 'Ya, ke domainnya', 'Session ID, refresh token (butuh proteksi CSRF)'],
        ['`localStorage`', 'Ya', 'Tidak', 'Preferensi UI non-sensitif; **bukan** token (satu XSS cukup untuk mencurinya)'],
        ['`sessionStorage`', 'Ya', 'Tidak', 'State per tab yang non-sensitif'],
        ['Memori (variabel JS)', 'Ya, hilang saat reload', 'Tidak', 'Access token berumur pendek di SPA'],
        ['IndexedDB', 'Ya', 'Tidak', 'Data offline besar yang bukan rahasia'],
      ]),
      ...quiz([
        ['WEB-10', 'Frontend menampilkan "CORS error" untuk `POST /v1/comments` berjenis form sederhana, tetapi komentarnya tetap tersimpan di database. Bagaimana mungkin?', 'Request form sederhana tidak memicu preflight, jadi browser langsung mengirimnya dan server memprosesnya. Yang diblokir browser hanya **pembacaan respons** karena header `Access-Control-Allow-Origin` tidak cocok. Karena itu CORS tidak boleh dianggap kontrol akses, dan endpoint yang mengubah data butuh proteksi CSRF.'],
        ['WEB-11', 'Mengapa `Access-Control-Allow-Origin: *` tidak bisa dipakai bersama `Access-Control-Allow-Credentials: true`?', 'Spesifikasi melarangnya: respons untuk request ber-credential (cookie, header Authorization dari browser) harus menyebut satu origin spesifik. Bila server "mengakali" dengan memantulkan header `Origin` apa pun, efeknya sama berbahayanya: situs mana pun bisa membaca data user yang sedang login.'],
        ['WEB-12', 'Session cookie memakai `SameSite=Lax`. Apakah halaman jahat di `https://promo.toko.example` (subdomain yang diambil alih) bisa memicu request ber-cookie ke `https://app.toko.example`?', 'Bisa. Keduanya **same-site** (`toko.example`), jadi `SameSite` tidak membatasi. SameSite melindungi dari situs lain, bukan dari subdomain sendiri. Tambahkan token CSRF atau pemeriksaan `Origin`/`Sec-Fetch-Site`, gunakan cookie host-only dengan prefix `__Host-`, dan jaga subdomain dari takeover.'],
      ]),
      ...practice('web-browser-cors', [
        'Buka DevTools tab Network, temukan request preflight `OPTIONS` di aplikasimu, dan jelaskan setiap header `Access-Control-*` di responsnya.',
        'Ganti konfigurasi CORS yang memakai `*` atau memantulkan origin menjadi allowlist dari environment variable.',
        'Audit semua cookie aplikasimu di DevTools tab Application: pastikan session memakai `Secure`, `HttpOnly`, `SameSite` eksplisit, dan idealnya prefix `__Host-`.',
        'Pasang header `Content-Security-Policy-Report-Only` di lingkungan staging dan catat pelanggaran yang muncul di console.',
      ]),
      references(
        ['MDN: Same-origin policy', 'https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy'],
        ['MDN: Cross-Origin Resource Sharing (CORS)', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS'],
        ['MDN: Using HTTP cookies', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies'],
        ['MDN: Set-Cookie', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie'],
        ['MDN: Content Security Policy', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP'],
        ['MDN: Web Storage API', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API'],
        ['web.dev: Understanding "same-site" and "same-origin"', 'https://web.dev/articles/same-site-same-origin'],
        ['web.dev: SameSite cookies explained', 'https://web.dev/articles/samesite-cookies-explained'],
        ['RFC 6265: HTTP State Management Mechanism', 'https://www.rfc-editor.org/rfc/rfc6265.html'],
      ),
    ],
  },

  // ───────────────────────────── Keamanan Aplikasi ─────────────────────────────
  {
    id: 'sec-owasp-top-10',
    title: 'Peta OWASP Top 10:2025',
    summary: 'Sepuluh kategori risiko aplikasi web edisi 2025, contoh nyata dan mitigasi satu baris untuk masing-masing, apa yang berubah dari 2021, serta contoh misconfiguration dan fail-open.',
    track: SEC, source: webSecuritySource, duration: '1,5 jam', level: 'Easy',
    blocks: [
      paragraph('**OWASP Top 10** adalah dokumen kesadaran (*awareness*) tentang risiko paling kritis pada aplikasi web, disusun dari data pengujian ribuan aplikasi dan survei komunitas. Edisi terbaru adalah **OWASP Top 10:2025**. Gunakan sebagai peta untuk berdiskusi dan memprioritaskan, bukan sebagai standar lengkap; untuk daftar kontrol yang bisa diverifikasi, OWASP menyediakan ASVS.'),
      table(['Kode', 'Kategori', 'Contoh', 'Mitigasi singkat'], [
        ['A01:2025', 'Broken Access Control', 'IDOR: `GET /invoices/124` milik user lain; juga mencakup SSRF dan CSRF', 'Cek otorisasi di server untuk setiap objek, deny by default ([Otorisasi](#web.sec-otorisasi))'],
        ['A02:2025', 'Security Misconfiguration', 'Endpoint debug/actuator terbuka, stack trace tampil, bucket publik', 'Konfigurasi default yang aman, hardening otomatis lewat IaC, header keamanan'],
        ['A03:2025', 'Software Supply Chain Failures', 'Dependensi rentan, paket typosquatting, pipeline CI disusupi', 'Lockfile, scan dependensi, SBOM, verifikasi asal artefak ([Rahasia & Supply Chain](#web.sec-secret-supply-chain))'],
        ['A04:2025', 'Cryptographic Failures', 'Data dikirim tanpa TLS, password di-hash MD5, kunci di source code', 'TLS di mana-mana, algoritma modern dari library teruji, argon2id untuk password'],
        ['A05:2025', 'Injection', 'SQL injection, command injection, XSS', 'Query berparameter, hindari shell, output encoding ([Injection](#web.sec-injection), [XSS & CSRF](#web.sec-xss-csrf))'],
        ['A06:2025', 'Insecure Design', 'Reset password lewat pertanyaan rahasia, tanpa batas percobaan voucher', 'Threat modeling sejak desain, abuse case, batas bisnis'],
        ['A07:2025', 'Authentication Failures', 'Credential stuffing tanpa rate limit, session tidak dirotasi setelah login', 'MFA, hashing yang benar, rate limit login, manajemen session ([Autentikasi](#web.sec-autentikasi))'],
        ['A08:2025', 'Software or Data Integrity Failures', 'Deserialisasi objek tak tepercaya, update otomatis tanpa tanda tangan', 'Verifikasi tanda tangan/checksum, hindari deserialisasi native dari input'],
        ['A09:2025', 'Security Logging and Alerting Failures', 'Brute force berjam-jam tanpa ada yang tahu; token tercatat di log', 'Log event keamanan, alert yang ditindaklanjuti, jangan log rahasia'],
        ['A10:2025', 'Mishandling of Exceptional Conditions', 'Error layanan otorisasi dianggap "boleh" (fail open), transaksi setengah jadi', 'Fail closed, rollback penuh, penanganan error yang konsisten'],
      ]),
      callout('info', 'Yang berubah dari edisi 2021', '**Security Misconfiguration** naik ke peringkat 2. *Vulnerable and Outdated Components* diperluas menjadi **Software Supply Chain Failures**. **SSRF** tidak lagi berdiri sendiri dan digabung ke Broken Access Control. **Mishandling of Exceptional Conditions** adalah kategori baru. Untuk API, baca juga OWASP API Security Top 10 (2023), yang menempatkan *Broken Object Level Authorization* di posisi pertama.'),
      code('A02 Security Misconfiguration: actuator Spring Boot', `# RENTAN: semua endpoint actuator terbuka.
# /actuator/heapdump bisa berisi password, token, dan data user yang sedang ada di memori;
# /actuator/env menampilkan konfigurasi.
management.endpoints.web.exposure.include=*

# PERBAIKAN: buka seperlunya, detail kesehatan hanya untuk yang berwenang,
# dan idealnya letakkan actuator di port terpisah yang tidak diekspos ke internet
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.health.show-details=when-authorized
management.server.port=9090
server.error.include-stacktrace=never`, 'properties'),
      code('A10 Mishandling of Exceptional Conditions: fail open vs fail closed', `// RENTAN (fail open): error dari layanan otorisasi dianggap "boleh"
func canReadInvoiceUnsafe(ctx context.Context, user User, invoiceID string) bool {
    allowed, err := authz.Check(ctx, user.ID, "invoice:read", invoiceID)
    if err != nil {
        log.Printf("authz error: %v", err)
        return true // "supaya user tidak terganggu saat authz down"
    }
    return allowed
}

// PERBAIKAN (fail closed): kegagalan pemeriksaan = akses ditolak
func canReadInvoice(ctx context.Context, user User, invoiceID string) (bool, error) {
    allowed, err := authz.Check(ctx, user.ID, "invoice:read", invoiceID)
    if err != nil {
        slog.ErrorContext(ctx, "authz check failed", "err", err, "invoice", invoiceID)
        return false, err // handler menjawab 503, bukan menampilkan data
    }
    return allowed, nil
}`, 'go'),
      ...quiz([
        ['SEC-01', 'Di kategori mana Server-Side Request Forgery (SSRF) berada pada OWASP Top 10:2025?', 'Di **A01:2025 Broken Access Control**. Pada edisi 2021 SSRF adalah kategori sendiri (A10:2021); pada 2025 digabung karena intinya adalah server mengakses resource yang seharusnya tidak boleh dijangkau atas perintah penyerang.'],
        ['SEC-02', 'Tim berkata "XSS tidak ada di Top 10 lagi". Benarkah?', 'Tidak. Cross-Site Scripting (CWE-79) termasuk dalam **A05:2025 Injection**, bersama SQL injection dan command injection. Kategorinya digabung sejak edisi 2021, bukan dihapus.'],
        ['SEC-03', 'Berikan satu contoh "fail open" dan jelaskan mengapa masuk A10:2025.', 'Contoh: bila layanan pengecekan lisensi, fraud, atau otorisasi timeout, kode menganggap hasilnya "lolos". Saat kondisi tidak normal, sistem justru memberi akses. A10:2025 mencakup penanganan kondisi luar biasa yang salah, termasuk CWE-636 *Not Failing Securely*. Perbaikannya: fail closed dan rollback transaksi yang setengah jadi.'],
      ]),
      ...practice('sec-owasp-top-10', [
        'Petakan aplikasi yang sedang kamu kerjakan ke sepuluh kategori: tulis satu risiko konkret dan satu kontrol yang sudah ada (atau belum) untuk tiap kategori.',
        'Cari satu tempat di kodemu yang menangkap error lalu melanjutkan seolah sukses; tentukan apakah itu fail open dan perbaiki bila perlu.',
        'Periksa endpoint debug, admin, actuator, atau metrics yang terbuka di lingkungan staging/produksi.',
        'Baca halaman A01:2025 di situs OWASP dan catat tiga CWE yang paling relevan dengan aplikasimu.',
      ]),
      references(
        ['OWASP Top 10:2025', 'https://top10.owasp.org/2025/'],
        ['OWASP Top 10:2025 A01 Broken Access Control', 'https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/'],
        ['OWASP Top 10:2025 A10 Mishandling of Exceptional Conditions', 'https://top10.owasp.org/2025/A10_2025-Mishandling_of_Exceptional_Conditions/'],
        ['OWASP API Security Top 10 (2023): API1 BOLA', 'https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/'],
        ['OWASP Application Security Verification Standard (ASVS)', 'https://asvs.owasp.org/'],
        ['OWASP Cheat Sheet Series: indeks per kategori Top 10', 'https://cheatsheetseries.owasp.org/IndexTopTen.html'],
      ),
    ],
  },
  {
    id: 'sec-injection',
    title: 'Injection: SQL, Command & Path Traversal',
    summary: 'Contoh rentan dan perbaikannya untuk SQL injection di Java (JDBC/JPA), Go (database/sql), Python, dan Node; allowlist untuk ORDER BY; command injection; dan path traversal.',
    track: SEC, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Injection terjadi ketika **data dari pengguna ikut ditafsirkan sebagai kode** oleh interpreter lain: SQL engine, shell, filesystem, template engine. Akar masalahnya selalu sama, yaitu menyambung string. Pertahanannya juga sama: **pisahkan kode dari data** lewat API yang menerima parameter terpisah, dan untuk bagian yang tidak bisa diparameterisasi gunakan *allowlist*.'),
      callout('warn', 'Tentang contoh rentan', 'Setiap contoh berlabel **RENTAN** ditulis untuk dikenali saat code review, bukan untuk ditiru. Selalu baca perbaikannya tepat di bawahnya, dan uji hanya pada aplikasi milikmu sendiri.'),
      paragraph('Misalkan input `email` berisi `\' OR \'1\'=\'1`. Dengan penyambungan string, klausa `WHERE` berubah menjadi selalu benar dan query mengembalikan seluruh tabel. Dengan query berparameter, nilai itu dikirim ke database **terpisah** dari teks SQL, sehingga diperlakukan sebagai string biasa yang tidak cocok dengan email mana pun.'),
      tabs(
        ['Java (JDBC/JPA)', code('SQL injection di Java', `// RENTAN: input disambung ke teks SQL
String sql = "SELECT id, email FROM users WHERE email = '" + email + "'";
try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(sql)) { /* ... */ }

// PERBAIKAN: PreparedStatement dengan placeholder ?
String sql = "SELECT id, email FROM users WHERE email = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, email);
    try (ResultSet rs = ps.executeQuery()) { /* ... */ }
}

// JPA: JPQL juga bisa diinjeksi bila disambung
// RENTAN: em.createQuery("SELECT u FROM User u WHERE u.email = '" + email + "'", User.class)
List<User> users = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
        .setParameter("email", email)
        .getResultList();

// Spring Data: derived query dan @Query dengan parameter bernama sudah aman
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);`, 'java')],
        ['Go (database/sql)', code('SQL injection di Go', `// RENTAN: fmt.Sprintf membangun SQL dari input
q := fmt.Sprintf("SELECT id, email FROM users WHERE email = '%s'", email)
rows, err := db.QueryContext(ctx, q)

// PERBAIKAN: placeholder ($1 untuk PostgreSQL, ? untuk MySQL/SQLite)
var u User
err := db.QueryRowContext(ctx,
    "SELECT id, email FROM users WHERE email = $1", email,
).Scan(&u.ID, &u.Email)

// Nama kolom/arah ORDER BY tidak bisa diparameterisasi -> pakai allowlist
var sortColumns = map[string]string{"created": "created_at", "email": "email"}

col, ok := sortColumns[r.URL.Query().Get("sort")]
if !ok {
    col = "created_at" // nilai default, bukan input mentah
}
dir := "ASC"
if r.URL.Query().Get("dir") == "desc" {
    dir = "DESC"
}
rows, err := db.QueryContext(ctx,
    "SELECT id, email FROM users ORDER BY "+col+" "+dir+" LIMIT $1", limit)`, 'go')],
        ['Python', code('SQL injection di Python', `# RENTAN: f-string (atau % / .format) membangun SQL
cur.execute(f"SELECT id, email FROM users WHERE email = '{email}'")

# PERBAIKAN (psycopg 3): parameter dikirim terpisah sebagai tuple
cur.execute("SELECT id, email FROM users WHERE email = %s", (email,))
# sqlite3 memakai placeholder ?:  cur.execute("... WHERE email = ?", (email,))

# SQLAlchemy 2.0: ORM atau text() dengan bind parameter
from sqlalchemy import select, text
stmt = select(User).where(User.email == email)
rows = session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})

# Django ORM sudah berparameter; hati-hati dengan raw() dan extra():
User.objects.raw("SELECT * FROM app_user WHERE email = %s", [email])   # aman
# User.objects.raw(f"SELECT * FROM app_user WHERE email = '{email}'")  # RENTAN`, 'python')],
        ['Node (pg)', code('SQL injection di Node.js', `// RENTAN: template literal menyisipkan input ke SQL
const result = await pool.query(\`SELECT id, email FROM users WHERE email = '\${email}'\`);

// PERBAIKAN: node-postgres dengan placeholder $1 dan array nilai
const { rows } = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

// Query builder/ORM juga berparameter, KECUALI fungsi "raw"/"unsafe":
// Prisma: $queryRaw\`... \${email}\` aman (tagged template), $queryRawUnsafe(str) TIDAK
const users = await prisma.$queryRaw\`SELECT id FROM users WHERE email = \${email}\`;`, 'ts')],
      ),
      heading('Command injection'),
      paragraph('Hindari memanggil shell. Panggil program langsung dengan **array argumen** sehingga karakter seperti `;`, `|`, `$()`, dan backtick tidak punya arti khusus. Tetap validasi nilainya, karena argumen yang diawali `-` bisa ditafsirkan sebagai opsi (*argument injection*); bila didukung program, sisipkan `--` sebelum argumen dari pengguna. Lebih baik lagi: gunakan library native (misalnya library image processing) daripada menjalankan proses eksternal.'),
      tabs(
        ['Python', code('Command injection di Python', `import ipaddress, subprocess

# RENTAN: shell=True + input pengguna. host = "8.8.8.8; cat /etc/passwd"
subprocess.run(f"ping -c 1 {host}", shell=True)

# PERBAIKAN: validasi ketat, lalu list argumen tanpa shell
ip = ipaddress.ip_address(host)            # ValueError bila bukan IP valid
subprocess.run(["ping", "-c", "1", str(ip)], check=True, timeout=5, capture_output=True)`, 'python')],
        ['Node', code('Command injection di Node.js', `import { execFile } from 'node:child_process';
import { isIP } from 'node:net';

// RENTAN: exec menjalankan string lewat /bin/sh
// exec(\`ping -c 1 \${host}\`, callback);

// PERBAIKAN: validasi lalu execFile (tanpa shell) dengan array argumen
if (isIP(host) === 0) throw new Error('host harus berupa alamat IP');
execFile('ping', ['-c', '1', host], { timeout: 5000 }, (err, stdout) => { /* ... */ });`, 'ts')],
        ['Go', code('Command injection di Go', `// RENTAN: meneruskan string ke sh -c
out, err := exec.CommandContext(ctx, "sh", "-c", "ping -c 1 "+host).Output()

// PERBAIKAN: exec.Command tidak memakai shell; validasi agar tidak ada argument injection
addr, err := netip.ParseAddr(host)
if err != nil {
    return fmt.Errorf("host tidak valid: %w", err)
}
out, err := exec.CommandContext(ctx, "ping", "-c", "1", addr.String()).Output()`, 'go')],
      ),
      heading('Path traversal'),
      paragraph('Input seperti `../../etc/passwd` atau `..%2F..%2F.env` membuat aplikasi membaca file di luar folder yang dimaksud. Pertahanan: jangan memakai nama file dari pengguna bila bisa (simpan file dengan ID acak dan petakan di database); bila harus, **resolve path absolut lalu pastikan masih di dalam folder dasar**, atau gunakan API yang membatasi akses ke satu direktori.'),
      tabs(
        ['Node', code('Path traversal di Node.js', `import path from 'node:path';

const BASE = path.resolve('uploads');

// RENTAN: GET /files?name=../../.env
app.get('/files', (req, res) => res.sendFile(path.join(BASE, String(req.query.name))));

// PERBAIKAN: resolve lalu cek prefix (tambahkan path.sep agar "uploads-lain" tidak lolos)
app.get('/files', (req, res) => {
  const target = path.resolve(BASE, String(req.query.name));
  if (!target.startsWith(BASE + path.sep)) return res.sendStatus(400);
  res.sendFile(target);
});`, 'ts')],
        ['Go', code('Path traversal di Go', `// RENTAN: filepath.Join membersihkan ".." tetapi tetap bisa keluar dari base
f, err := os.Open(filepath.Join(baseDir, name))

// PERBAIKAN (Go 1.24+): os.OpenInRoot menolak path yang keluar dari baseDir,
// termasuk lewat symlink
f, err := os.OpenInRoot(baseDir, name)

// Versi lama: tolak nama yang tidak lokal
if !filepath.IsLocal(name) {
    return errors.New("nama file tidak valid")
}`, 'go')],
        ['Python', code('Path traversal di Python', `from pathlib import Path

BASE = Path("uploads").resolve()

# RENTAN: open(BASE / name)  -> name = "../../.env"

# PERBAIKAN: resolve lalu pastikan masih di dalam BASE (Python 3.9+)
target = (BASE / name).resolve()
if not target.is_relative_to(BASE):
    raise PermissionError("akses di luar folder uploads")
data = target.read_bytes()`, 'python')],
        ['Java', code('Path traversal di Java', `Path base = Path.of("uploads").toAbsolutePath().normalize();

// RENTAN: Files.readAllBytes(base.resolve(name))

// PERBAIKAN: normalize lalu cek startsWith
Path target = base.resolve(name).normalize();
if (!target.startsWith(base)) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nama file tidak valid");
}
byte[] data = Files.readAllBytes(target);`, 'java')],
      ),
      table(['Jenis', 'Penyebab', 'Pertahanan utama'], [
        ['SQL / JPQL / HQL', 'String SQL disambung dengan input', 'Query berparameter, ORM tanpa fungsi raw/unsafe, allowlist untuk identifier'],
        ['NoSQL (MongoDB)', 'Objek dari JSON dipakai langsung sebagai filter (`{"$ne": null}`)', 'Validasi tipe (harus string), gunakan schema validator'],
        ['OS command', 'Shell menafsirkan input', 'Tanpa shell, array argumen, validasi, library native'],
        ['Path traversal', 'Nama file dari pengguna', 'ID acak, resolve + cek folder dasar, `os.OpenInRoot`'],
        ['Template injection (SSTI)', 'Input dijadikan template, bukan data template', 'Jangan render string dari pengguna sebagai template'],
        ['Log injection', 'Baris baru di input memalsukan entri log', 'Structured logging (JSON), encode karakter kontrol'],
      ]),
      ...quiz([
        ['SEC-04', 'Mengapa `ORDER BY ?` dengan parameter tidak bisa dipakai untuk memilih kolom sort, dan apa solusinya?', 'Placeholder hanya menggantikan **nilai**, bukan identifier seperti nama kolom atau kata kunci `ASC`/`DESC`; nilai parameter akan diperlakukan sebagai literal string. Solusinya adalah allowlist: petakan input (`created`, `email`) ke nama kolom yang sudah pasti, dan pakai default bila input tidak dikenal.'],
        ['SEC-05', 'Apakah memakai ORM otomatis aman dari SQL injection?', 'Sebagian besar API ORM aman karena berparameter, tetapi hampir semua ORM menyediakan jalur raw: `$queryRawUnsafe` di Prisma, `createQuery` dengan string disambung di JPA, `raw()`/`extra()` di Django, `text()` dengan f-string di SQLAlchemy. Injection tetap mungkin bila jalur ini dipakai dengan penyambungan string.'],
        ['SEC-06', 'Kode Go memakai `exec.Command("git", "clone", repoURL)` tanpa shell. Apakah masih ada risiko?', 'Ya, argument injection: bila `repoURL` diawali `-` (misalnya `--upload-pack=...`), git menafsirkannya sebagai opsi. Validasi formatnya (misalnya harus diawali `https://`), sisipkan `--` sebelum argumen posisional bila program mendukungnya, dan pertimbangkan library native.'],
      ]),
      ...practice('sec-injection', [
        'Cari di codebase-mu semua penyambungan string ke SQL (`+`, f-string, `fmt.Sprintf`, template literal di dekat `query(`); ubah menjadi query berparameter.',
        'Implementasikan sort dinamis dengan allowlist kolom dan tulis test yang membuktikan input tak dikenal jatuh ke default.',
        'Cari pemanggilan `exec`, `shell=True`, `Runtime.exec`, atau `sh -c`; ganti dengan array argumen dan validasi.',
        'Tulis test untuk endpoint download file dengan input `../`, `..%2F`, dan path absolut, lalu pastikan semuanya ditolak.',
      ]),
      references(
        ['OWASP SQL Injection Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'],
        ['OWASP Query Parameterization Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html'],
        ['OWASP OS Command Injection Defense Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html'],
        ['OWASP Injection Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html'],
        ['OWASP: Path Traversal', 'https://community.owasp.org/attacks/Path_Traversal'],
        ['Go: Avoiding SQL injection risk', 'https://go.dev/doc/database/sql-injection'],
        ['OWASP Top 10:2025 A05 Injection', 'https://top10.owasp.org/2025/A05_2025-Injection/'],
      ),
    ],
  },
  {
    id: 'sec-xss-csrf',
    title: 'XSS & CSRF',
    summary: 'Stored, reflected, dan DOM XSS; output encoding dan auto-escaping framework; dangerouslySetInnerHTML dan sanitasi; strict CSP; CSRF dengan SameSite, token, dan Fetch Metadata.',
    track: SEC, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('**XSS** (*Cross-Site Scripting*) terjadi ketika input penyerang dijalankan sebagai skrip di browser korban, di origin aplikasimu. Skrip itu bisa melakukan apa pun yang bisa dilakukan user: membaca data di halaman, memanggil API dengan session korban, atau mencuri token di `localStorage`. **CSRF** (*Cross-Site Request Forgery*) adalah kebalikannya: situs lain membuat browser korban **mengirim** request ber-cookie ke aplikasimu tanpa sepengetahuan korban.'),
      table(['Jenis XSS', 'Alur', 'Contoh'], [
        ['Stored', 'Payload disimpan di server lalu ditampilkan ke user lain', 'Komentar berisi `<img src=x onerror=...>` dirender tanpa escape'],
        ['Reflected', 'Payload ada di request dan langsung dipantulkan di respons', '`/search?q=<script>...` ditampilkan apa adanya di halaman hasil'],
        ['DOM-based', 'Kode JavaScript di browser menulis data tak tepercaya ke "sink" berbahaya', '`innerHTML = location.hash`; server tidak pernah melihat payload'],
      ]),
      paragraph('Pertahanan utama adalah **output encoding sesuai konteks**: teks yang masuk ke HTML di-escape (`<` menjadi `&lt;`), nilai di atribut di-quote dan di-escape, URL divalidasi skemanya. Template engine modern melakukannya otomatis (*auto-escaping*); celah biasanya muncul di jalur yang sengaja mematikan escape.'),
      code('DOM XSS: sink berbahaya dan perbaikannya', `// RENTAN: nilai dari URL ditulis ke innerHTML
// payload: /cari?q=<img src=x onerror=alert(document.domain)>
const q = new URLSearchParams(location.search).get('q') ?? '';
document.querySelector('#judul').innerHTML = \`Hasil untuk: \${q}\`;

// PERBAIKAN: tulis sebagai teks, bukan HTML
document.querySelector('#judul').textContent = \`Hasil untuk: \${q}\`;

// Bila memang perlu HTML dari pengguna (mis. editor rich text): sanitasi dengan allowlist
import DOMPurify from 'dompurify';
document.querySelector('#isi').innerHTML = DOMPurify.sanitize(htmlDariPengguna);

// Sink lain yang perlu diwaspadai: outerHTML, insertAdjacentHTML, document.write,
// eval, new Function, setTimeout("string"), element.setAttribute('href', ...)`, 'js'),
      code('React: auto-escaping, dangerouslySetInnerHTML, dan URL', `import DOMPurify from 'dompurify';

// AMAN: JSX meng-escape teks secara otomatis
<p>{comment.body}</p>

// RENTAN: escape dimatikan, HTML dari pengguna dirender apa adanya
<div dangerouslySetInnerHTML={{ __html: comment.body }} />

// PERBAIKAN: sanitasi dulu (atau render Markdown dengan library yang aman)
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }} />

// URL dari pengguna: escape HTML tidak mencegah href="javascript:..." -> validasi skema
function safeUrl(raw: string): string {
  try {
    const url = new URL(raw, window.location.origin);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '#';
  } catch {
    return '#';
  }
}
<a href={safeUrl(profile.website)} rel="noopener noreferrer">Website</a>`, 'ts'),
      table(['Teknologi', 'Default (aman)', 'Jalur yang mematikan escape'], [
        ['React / Next.js', '`{nilai}` di JSX', '`dangerouslySetInnerHTML`, `href` dengan `javascript:`'],
        ['Vue', '`{{ nilai }}`', '`v-html`'],
        ['Angular', 'Interpolasi + sanitizer bawaan', '`bypassSecurityTrustHtml`'],
        ['Thymeleaf (Spring)', '`th:text`', '`th:utext`'],
        ['Go', '`html/template` (escape sesuai konteks)', '`text/template` untuk HTML, tipe `template.HTML`'],
        ['Jinja2 / Django', 'Autoescape aktif (Flask/Django)', '`|safe`, `mark_safe`, `{% autoescape false %}`'],
        ['Razor (ASP.NET)', '`@nilai`', '`@Html.Raw`'],
      ]),
      heading('Content Security Policy sebagai lapisan kedua'),
      paragraph('CSP tidak menggantikan output encoding, tetapi membatasi dampak bila ada celah. Rekomendasi web.dev dan OWASP adalah **strict CSP** berbasis *nonce* atau *hash*: hanya skrip dengan nonce acak per respons yang boleh berjalan, sehingga skrip sisipan dan handler inline seperti `onerror` diblokir. Header contohnya: `script-src \'nonce-{acak}\' \'strict-dynamic\'; object-src \'none\'; base-uri \'none\'`, lalu setiap tag `<script>` milikmu diberi atribut `nonce` yang sama. Mulai dengan `Content-Security-Policy-Report-Only`, dan pertimbangkan **Trusted Types** untuk menutup DOM XSS di aplikasi besar.'),
      heading('CSRF'),
      code('Serangan CSRF (contoh edukasi) dan pertahanan di server', `<!-- Halaman milik penyerang di https://hadiah-gratis.example
     Bila korban masih login di bank.example dan cookie session-nya ikut terkirim,
     transfer terjadi tanpa korban menekan apa pun. -->
<form action="https://bank.example/transfer" method="POST">
  <input type="hidden" name="to" value="rekening-penyerang">
  <input type="hidden" name="amount" value="5000000">
</form>
<script>document.forms[0].submit();</script>

<!-- PERTAHANAN di bank.example:
  1. Cookie session: SameSite=Lax (atau Strict) -> tidak dikirim pada POST lintas situs
  2. Token CSRF per session di setiap form/request yang mengubah state
     <input type="hidden" name="_csrf" value="{token dari server}">
  3. Tolak request non-GET bila Sec-Fetch-Site = cross-site atau Origin tidak dikenal
  4. Jangan pernah mengubah state lewat GET -->`, 'html'),
      table(['Pertahanan', 'Cara kerja', 'Catatan'], [
        ['Cookie `SameSite=Lax`/`Strict`', 'Browser tidak mengirim cookie pada request lintas situs (kecuali navigasi GET untuk Lax)', 'Tidak melindungi dari subdomain sendiri (same-site) dan GET yang mengubah state'],
        ['Token CSRF (synchronizer)', 'Server memberi token acak, request wajib menyertakannya; situs lain tidak bisa membacanya', 'Bawaan Spring Security, Django, ASP.NET Core antiforgery, Laravel'],
        ['Double-submit cookie (signed)', 'Token di cookie dan di header/body harus cocok; tanda tangan HMAC mengikatnya ke session', 'Untuk aplikasi stateless'],
        ['Fetch Metadata / `Origin`', 'Tolak request non-safe dengan `Sec-Fetch-Site: cross-site` atau `Origin` asing', 'Go 1.25+ punya `http.CrossOriginProtection` bawaan'],
        ['Header kustom untuk API JSON', 'Request lintas origin dengan header kustom memicu preflight, yang ditolak CORS', 'Bergantung pada konfigurasi CORS yang benar'],
      ]),
      callout('tip', 'Bearer token di header vs cookie', 'API yang hanya menerima `Authorization: Bearer ...` yang ditambahkan JavaScript secara eksplisit tidak rentan CSRF klasik, karena browser tidak menambahkan header itu otomatis. Namun token yang bisa dibaca JavaScript rentan dicuri lewat XSS. Cookie `HttpOnly` kebal pencurian lewat XSS tetapi butuh proteksi CSRF. Tidak ada pilihan tanpa trade-off; yang penting pertahanan yang sesuai dipasang.'),
      ...quiz([
        ['SEC-07', 'Aplikasi React tidak pernah memakai `dangerouslySetInnerHTML`. Apakah pasti bebas XSS?', 'Belum tentu. Masih ada `href`/`src` berisi `javascript:` dari input pengguna, manipulasi DOM langsung (`innerHTML` lewat ref atau library pihak ketiga), SSR yang menyisipkan JSON ke `<script>` tanpa escape, serta library Markdown/HTML yang tidak menyanitasi. Auto-escaping JSX hanya melindungi teks di dalam `{}`.'],
        ['SEC-08', 'Mengapa CSP dengan `script-src \'self\' \'unsafe-inline\'` hampir tidak melindungi dari XSS?', '`\'unsafe-inline\'` mengizinkan semua skrip inline dan handler event seperti `onerror`, yang justru bentuk payload XSS paling umum. Strict CSP berbasis nonce atau hash hanya mengizinkan skrip yang memang ditandai server.'],
        ['SEC-09', 'Endpoint `GET /akun/hapus?id=5` dilindungi cookie `SameSite=Lax`. Apakah aman dari CSRF?', 'Tidak. `Lax` tetap mengirim cookie pada navigasi top-level GET, jadi link atau redirect dari situs lain bisa memicunya. Akar masalahnya adalah GET yang mengubah state; ubah menjadi `POST`/`DELETE` dan tambahkan token CSRF atau pemeriksaan Fetch Metadata.'],
      ]),
      ...practice('sec-xss-csrf', [
        'Cari `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `th:utext`, `|safe`, atau `template.HTML` di codebase-mu; pastikan setiap pemakaian disanitasi atau datanya tepercaya.',
        'Pasang strict CSP berbasis nonce dalam mode Report-Only di staging, perbaiki pelanggarannya, lalu tegakkan.',
        'Uji CSRF pada aplikasimu: buat halaman HTML lokal di origin lain berisi form POST ke endpoint yang mengubah data, dan pastikan request ditolak.',
        'Pastikan tidak ada endpoint GET yang mengubah state (hapus, transfer, logout massal).',
      ]),
      references(
        ['OWASP Cross Site Scripting Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
        ['OWASP DOM based XSS Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html'],
        ['OWASP Cross-Site Request Forgery Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html'],
        ['OWASP Content Security Policy Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html'],
        ['MDN: Cross-site scripting (XSS)', 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS'],
        ['MDN: Cross-site request forgery (CSRF)', 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF'],
        ['web.dev: Mitigate XSS with a strict CSP', 'https://web.dev/articles/strict-csp'],
        ['web.dev: Protect your resources with Fetch Metadata', 'https://web.dev/articles/fetch-metadata'],
        ['web.dev: Prevent DOM-based XSS with Trusted Types', 'https://web.dev/articles/trusted-types'],
      ),
    ],
  },
  {
    id: 'sec-autentikasi',
    title: 'Autentikasi: Password, Session, JWT & OAuth',
    summary: 'Hashing password dengan argon2id/bcrypt sesuai parameter OWASP, session vs JWT, jebakan JWT, refresh token rotation, MFA, serta gambaran OAuth 2.x/OpenID Connect dengan PKCE.',
    track: SEC, source: webSecuritySource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Autentikasi menjawab **"siapa kamu?"**, sedangkan otorisasi menjawab **"boleh apa?"**. Kesalahan autentikasi jarang berupa bug kriptografi; biasanya berupa pilihan yang keliru: hash password yang cepat, token yang tidak pernah kedaluwarsa, verifikasi JWT yang longgar, atau login tanpa batas percobaan. Bila memungkinkan, pakai identity provider atau library yang matang daripada menulis semuanya sendiri.'),
      heading('Menyimpan password'),
      paragraph('Password **di-hash, bukan dienkripsi**, dengan fungsi yang sengaja lambat dan memakai salt unik (semua library di bawah membuat salt otomatis). Rekomendasi OWASP: **Argon2id** dengan minimal 19 MiB memori, 2 iterasi, 1 paralelisme. Untuk sistem lama, **bcrypt** dengan work factor minimal 10 dan batas input 72 byte. Bila wajib FIPS-140, PBKDF2-HMAC-SHA256 dengan minimal 600.000 iterasi. MD5, SHA-1, dan SHA-256 polos **tidak boleh** dipakai untuk password.'),
      tabs(
        ['Python', code('Argon2id dengan argon2-cffi', `from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Parameter minimum OWASP; default argon2-cffi (RFC 9106 low-memory) bahkan lebih kuat
ph = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)   # memory_cost dalam KiB

stored = ph.hash(password)        # "$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>"

def verify(stored: str, password: str) -> bool:
    try:
        ph.verify(stored, password)
    except VerifyMismatchError:
        return False
    if ph.check_needs_rehash(stored):        # parameter dinaikkan? hash ulang saat login sukses
        save_new_hash(ph.hash(password))
    return True`, 'python')],
        ['Node', code('Argon2id dengan paket argon2', `import argon2 from 'argon2';

const stored = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,   // KiB (19 MiB)
  timeCost: 2,
  parallelism: 1,
});

const ok = await argon2.verify(stored, password);   // parameter & salt dibaca dari string hash`, 'ts')],
        ['Java', code('Argon2id dengan Spring Security', `// Butuh dependency org.bouncycastle:bcprov-jdk18on
// Argon2PasswordEncoder(saltLength, hashLength, parallelism, memoryKiB, iterations)
PasswordEncoder encoder = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);

String stored = encoder.encode(rawPassword);
boolean ok = encoder.matches(rawPassword, stored);

// Atau DelegatingPasswordEncoder (prefix {bcrypt}/{argon2}) agar algoritma bisa dimigrasi bertahap
PasswordEncoder delegating = PasswordEncoderFactories.createDelegatingPasswordEncoder();`, 'java')],
        ['Go', code('bcrypt dengan golang.org/x/crypto', `import "golang.org/x/crypto/bcrypt"

// cost 12 (minimum OWASP untuk bcrypt adalah 10); password > 72 byte ditolak dengan ErrPasswordTooLong
hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)

err = bcrypt.CompareHashAndPassword(hash, []byte(password))
ok := err == nil

// Argon2id juga tersedia di golang.org/x/crypto/argon2 (argon2.IDKey), tetapi kamu
// harus membuat salt dan menyusun format string hash sendiri`, 'go')],
      ),
      heading('Session vs JWT'),
      table(['Aspek', 'Session (ID acak di cookie + data di server)', 'JWT (token bertanda tangan berisi klaim)'], [
        ['Pencabutan (logout, ban)', 'Instan: hapus session di server', 'Sulit sebelum `exp`; butuh masa berlaku pendek atau denylist'],
        ['State di server', 'Perlu penyimpanan (Redis, database)', 'Bisa diverifikasi tanpa lookup (cukup kunci publik)'],
        ['Ukuran per request', 'Kecil (ID saja)', 'Lebih besar; tumbuh seiring klaim'],
        ['Cocok untuk', 'Aplikasi web klasik, BFF (*backend for frontend*)', 'Komunikasi antar service, API dengan banyak resource server'],
        ['Risiko umum', 'Session fixation, CSRF', 'Verifikasi algoritma/klaim yang longgar, token berumur panjang, disimpan di `localStorage`'],
      ]),
      paragraph('Untuk aplikasi web milik sendiri, **session di cookie `HttpOnly`** sering menjadi pilihan paling sederhana dan aman. Bila memakai JWT, perlakukan sebagai *access token* berumur pendek (5 sampai 15 menit) yang dipasangkan dengan refresh token.'),
      code('Verifikasi JWT yang ketat (Node, library jose)', `import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://auth.toko.example/.well-known/jwks.json'));

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    algorithms: ['RS256'],                 // tetapkan algoritma: tolak "none" dan alg confusion
    issuer: 'https://auth.toko.example/',  // token dari penerbit lain ditolak
    audience: 'api://toko-orders',         // token untuk API lain ditolak
    maxTokenAge: '15m',                    // pagar tambahan selain klaim exp
  });
  return payload;                          // exp & nbf sudah dicek oleh jwtVerify
}

// Jebakan yang sering muncul:
//  - jwt.decode() hanya MEMBACA isi token, tidak memverifikasi tanda tangan
//  - header alg "none" atau alg yang ditukar (RS256 -> HS256 dengan kunci publik sebagai secret)
//  - secret HMAC lemah seperti "secret" bisa di-brute force secara offline
//  - token tanpa exp atau berlaku berhari-hari; data sensitif di payload (payload hanya base64, bukan enkripsi)`, 'ts'),
      heading('Refresh token, MFA, dan perlindungan login'),
      list([
        '**Refresh token rotation**: setiap pemakaian refresh token menghasilkan refresh token baru dan yang lama dinonaktifkan. Bila token lama dipakai lagi (*reuse*), anggap bocor dan cabut seluruh keluarga token milik session itu. Simpan di cookie `HttpOnly; Secure; SameSite` dengan `Path` sempit (misalnya `/auth/refresh`), dan simpan hash-nya di server agar bisa dicabut.',
        '**Rotasi session ID setelah login** dan perubahan hak akses untuk mencegah *session fixation*; batasi idle timeout dan absolute timeout.',
        '**MFA**: passkey/WebAuthn tahan phishing dan paling dianjurkan; TOTP (RFC 6238) cukup baik; SMS OTP paling lemah (SIM swap) tetapi tetap lebih baik daripada tanpa MFA. Sediakan recovery code dan wajibkan MFA ulang untuk aksi sensitif.',
        '**Pesan error generik**: "email atau password salah" untuk kedua kasus, dan waktu respons yang serupa agar penyerang tidak bisa mengenumerasi akun.',
        '**Rate limit dan deteksi credential stuffing** per akun dan per IP; periksa password baru terhadap daftar password bocor; jangan memaksa aturan komposisi yang rumit, utamakan panjang minimal.',
      ]),
      heading('OAuth 2.x dan OpenID Connect dengan PKCE'),
      paragraph('**OAuth 2.0** adalah protokol *otorisasi delegasi*: aplikasi mendapat access token untuk memanggil API atas nama user. **OpenID Connect (OIDC)** menambahkan lapisan identitas di atasnya lewat `id_token`, sehingga dipakai untuk "Login dengan Google/Microsoft". Praktik terkini dirangkum di *OAuth 2.0 Security Best Current Practice* (RFC 9700) dan draf OAuth 2.1: gunakan **Authorization Code + PKCE untuk semua jenis client**, jangan pakai implicit grant atau password grant, dan cocokkan `redirect_uri` secara persis.'),
      code('Authorization Code + PKCE: alur dan pembuatan code_challenge', `// 1. Client membuat code_verifier acak dan code_challenge = BASE64URL(SHA256(verifier))
import { createHash, randomBytes } from 'node:crypto';

const codeVerifier = randomBytes(32).toString('base64url');   // simpan sementara di session
const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
const state = randomBytes(16).toString('base64url');          // anti-CSRF pada callback

// 2. Arahkan browser ke authorization server
//    GET https://auth.toko.example/authorize?response_type=code&client_id=web-app
//        &redirect_uri=https://app.toko.example/callback&scope=openid%20profile
//        &state=<state>&code_challenge=<codeChallenge>&code_challenge_method=S256
//
// 3. User login + consent -> redirect ke /callback?code=...&state=...  (cek state!)
//
// 4. Tukar code dengan token, sertakan code_verifier aslinya
//    POST https://auth.toko.example/token
//      grant_type=authorization_code&code=...&redirect_uri=...&client_id=web-app
//      &code_verifier=<codeVerifier>
//
// Code yang dicegat penyerang tidak berguna tanpa code_verifier.
// 5. Verifikasi id_token (iss, aud, exp, nonce) sebelum menganggap user login.`, 'ts'),
      callout('info', 'Implementasi per stack', 'Lihat penerapannya di modul bahasa: [Spring Security & JWT](#java.spring-security-jwt), [Authentication dengan JWT (Go)](#go.authentication-dengan-jwt), [Next.js: Database, Autentikasi & Otorisasi](#js.nextjs-auth-database), dan [ASP.NET Core: Middleware, JWT & Authorization](#csharp.cs-auth-middleware). Untuk SPA, pola **BFF** (backend menyimpan token, browser hanya memegang cookie session `HttpOnly`) menghindari token di JavaScript sama sekali.'),
      ...quiz([
        ['SEC-10', 'Mengapa SHA-256 dengan salt tidak cukup untuk menyimpan password, padahal SHA-256 adalah hash yang aman?', 'SHA-256 dirancang **cepat**: GPU bisa menghitung miliaran hash per detik, sehingga password lemah cepat ditebak secara offline setelah database bocor. Argon2id, bcrypt, scrypt, dan PBKDF2 sengaja lambat dan dapat diatur biayanya; Argon2id juga *memory-hard* sehingga mahal diparalelkan di GPU/ASIC.'],
        ['SEC-11', 'Sebutkan tiga pemeriksaan wajib saat memverifikasi JWT di API.', 'Tanda tangan dengan algoritma yang ditetapkan di server (allowlist, misalnya hanya `RS256`; tolak `none`), klaim `exp`/`nbf` (dan masa berlaku pendek), serta `iss` dan `aud` yang sesuai sehingga token dari penerbit lain atau untuk API lain ditolak. Jangan memakai fungsi `decode` tanpa verifikasi.'],
        ['SEC-12', 'Apa masalah yang diselesaikan PKCE pada OAuth Authorization Code flow?', 'PKCE mengikat authorization code ke client yang memulai alur. Client mengirim `code_challenge` di awal dan `code_verifier` saat menukar code. Penyerang yang mencegat code (misalnya lewat redirect URI atau aplikasi jahat di perangkat yang sama) tidak bisa menukarnya tanpa verifier. Karena itu PKCE dianjurkan untuk semua client, termasuk confidential client.'],
      ]),
      ...practice('sec-autentikasi', [
        'Periksa algoritma hash password di proyekmu; bila belum argon2id/bcrypt dengan parameter OWASP, rancang migrasi bertahap (hash ulang saat user berhasil login).',
        'Audit verifikasi JWT: pastikan algoritma dikunci, serta `iss`, `aud`, dan `exp` diperiksa; tulis test untuk token dengan `alg: none`, issuer salah, dan kedaluwarsa.',
        'Implementasikan refresh token rotation dengan deteksi reuse dan simpan refresh token di cookie `HttpOnly`.',
        'Tambahkan rate limit pada endpoint login dan pastikan pesan error tidak membedakan "email tidak terdaftar" dan "password salah".',
      ]),
      references(
        ['OWASP Password Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],
        ['OWASP Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'],
        ['OWASP Session Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html'],
        ['OWASP JSON Web Token Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html'],
        ['OWASP Multifactor Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html'],
        ['OWASP OAuth 2.0 Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html'],
        ['RFC 8725: JSON Web Token Best Current Practices', 'https://www.rfc-editor.org/rfc/rfc8725.html'],
        ['RFC 9700: OAuth 2.0 Security Best Current Practice', 'https://www.rfc-editor.org/rfc/rfc9700.html'],
        ['RFC 7636: Proof Key for Code Exchange (PKCE)', 'https://www.rfc-editor.org/rfc/rfc7636.html'],
        ['OpenID Foundation: How OpenID Connect Works', 'https://openid.net/developers/how-connect-works/'],
      ),
    ],
  },
  {
    id: 'sec-otorisasi',
    title: 'Otorisasi: IDOR, RBAC/ABAC & Multi-Tenant',
    summary: 'IDOR/BOLA beserta perbaikannya, RBAC vs ABAC vs ReBAC, deny by default, isolasi tenant di query dan row-level security, serta mass assignment.',
    track: SEC, source: webSecuritySource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Broken Access Control adalah peringkat 1 OWASP Top 10:2025, dan menurut OWASP setiap aplikasi yang diuji memiliki setidaknya satu bentuknya. Penyebabnya jarang rumit: endpoint memeriksa **apakah user sudah login**, tetapi lupa memeriksa **apakah user boleh mengakses objek ini**. Pada API, kasus ini dikenal sebagai **IDOR** (*Insecure Direct Object Reference*) atau **BOLA** (*Broken Object Level Authorization*).'),
      code('IDOR/BOLA: rentan vs perbaikan (Express + Prisma)', `// RENTAN: semua user yang login bisa membaca invoice siapa pun dengan mengganti id
app.get('/v1/invoices/:id', requireAuth, async (req, res) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
  if (!invoice) return res.sendStatus(404);
  res.json(invoice);
});

// PERBAIKAN: kepemilikan (dan tenant) menjadi bagian dari query
app.get('/v1/invoices/:id', requireAuth, async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, tenantId: req.user.tenantId, ownerId: req.user.id },
  });
  // 404 (bukan 403) agar penyerang tidak tahu bahwa id itu ada milik orang lain
  if (!invoice) return res.sendStatus(404);
  res.json(invoice);
});

// ID acak (UUID) mempersulit tebakan, tetapi BUKAN pengganti pemeriksaan otorisasi.`, 'ts'),
      callout('warn', 'Deny by default', 'Jadikan "tolak" sebagai keadaan bawaan: middleware global mewajibkan autentikasi, dan endpoint publik dibuka secara eksplisit lewat allowlist. Pemeriksaan otorisasi dilakukan **di server** untuk setiap request dan setiap objek; menyembunyikan tombol di UI bukan kontrol akses. Pusatkan logikanya (fungsi policy, anotasi seperti `@PreAuthorize`, atau policy engine seperti OPA, Cedar, atau OpenFGA) agar tidak tersebar dan terlupa di satu endpoint.'),
      table(['Model', 'Keputusan berdasarkan', 'Contoh aturan', 'Cocok untuk'], [
        ['RBAC', 'Role user', '`ADMIN` boleh menghapus produk', 'Aplikasi dengan sedikit jenis pengguna; mudah diaudit'],
        ['ABAC', 'Atribut user, resource, aksi, dan konteks', 'Manajer boleh menyetujui klaim di departemennya sendiri di bawah Rp10 juta pada jam kerja', 'Aturan bisnis yang halus; mencegah ledakan jumlah role'],
        ['ReBAC', 'Relasi antar entitas', 'User boleh mengedit dokumen bila ia anggota tim pemilik folder', 'Fitur berbagi ala Google Drive; diimplementasikan dengan OpenFGA/SpiceDB'],
      ]),
      paragraph('Dalam praktik, kombinasi paling umum adalah RBAC untuk kemampuan kasar (siapa boleh mengakses fitur) ditambah pemeriksaan kepemilikan atau atribut untuk setiap objek.'),
      heading('Multi-tenant: isolasi di setiap query'),
      code('Tenant dari konteks auth + row-level security PostgreSQL', `// Go: tenantID SELALU berasal dari token/session, tidak pernah dari body atau query string
func (r *InvoiceRepo) Get(ctx context.Context, tenantID, invoiceID string) (Invoice, error) {
    var inv Invoice
    err := r.db.QueryRowContext(ctx,
        "SELECT id, tenant_id, total FROM invoices WHERE id = $1 AND tenant_id = $2",
        invoiceID, tenantID,
    ).Scan(&inv.ID, &inv.TenantID, &inv.Total)
    if errors.Is(err, sql.ErrNoRows) {
        return Invoice{}, ErrNotFound
    }
    return inv, err
}

/* Lapisan kedua di PostgreSQL: row-level security (RLS)
   ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE invoices FORCE ROW LEVEL SECURITY;        -- berlaku juga bagi pemilik tabel
   CREATE POLICY tenant_isolation ON invoices
     USING (tenant_id = current_setting('app.tenant_id')::uuid);

   Di awal setiap transaksi aplikasi (true = hanya untuk transaksi ini):
   SELECT set_config('app.tenant_id', $1, true);

   Role database aplikasi tidak boleh superuser atau BYPASSRLS. */`, 'go'),
      list([
        'Ambil `tenantId` dari token/session yang sudah diverifikasi, bukan dari parameter request.',
        'Setiap query, cache key, nama objek storage (`tenants/{tenantId}/...`), dan job antrean menyertakan tenant.',
        'Pastikan endpoint list, pencarian, ekspor, dan laporan juga terfilter tenant, bukan hanya endpoint detail.',
        'Tulis test otomatis: user tenant A mencoba membaca, mengubah, dan menghapus resource tenant B pada setiap endpoint, dan semuanya harus gagal.',
      ]),
      heading('Mass assignment'),
      code('Mass assignment: entity langsung di-bind vs DTO (Spring)', `// RENTAN: entity JPA langsung di-bind dari JSON.
// Klien cukup mengirim {"displayName":"Budi","role":"ADMIN","emailVerified":true}
@PatchMapping("/me")
User updateMe(@RequestBody User body, @AuthenticationPrincipal Jwt jwt) {
    body.setId(jwt.getSubject());
    return userRepository.save(body);
}

// PERBAIKAN: DTO hanya berisi field yang boleh diubah user, dengan validasi
record UpdateProfileRequest(
        @NotBlank @Size(max = 80) String displayName,
        @Size(max = 280) String bio) {}

@PatchMapping("/me")
UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest req, @AuthenticationPrincipal Jwt jwt) {
    User user = userRepository.findById(jwt.getSubject()).orElseThrow();
    user.setDisplayName(req.displayName());
    user.setBio(req.bio());
    return UserResponse.from(userRepository.save(user));   // respons juga DTO: jangan bocorkan passwordHash
}`, 'java'),
      paragraph('Pola yang sama berlaku di stack lain: skema Zod/Pydantic yang hanya berisi field yang diizinkan, `Model.objects.create(**request.data)` diganti serializer dengan `fields` eksplisit, dan di Go struct request terpisah dari struct model database.'),
      ...quiz([
        ['SEC-13', 'Endpoint `GET /v1/orders/:id` sudah mewajibkan login, dan ID-nya UUID acak. Apakah otorisasinya sudah cukup?', 'Belum. Login hanya membuktikan identitas, dan UUID hanya mempersulit tebakan; ID tetap bisa bocor lewat log, URL yang dibagikan, atau endpoint lain. Query harus memastikan order itu milik user/tenant yang meminta (misalnya `WHERE id = ? AND owner_id = ?`).'],
        ['SEC-14', 'Kapan ABAC lebih tepat daripada RBAC?', 'Ketika keputusan bergantung pada atribut objek atau konteks, bukan hanya jenis pengguna, misalnya departemen, nilai transaksi, status dokumen, atau waktu. Mengekspresikan aturan seperti itu dengan RBAC murni membuat jumlah role meledak (`MANAGER_DEPT_A_UNDER_10M`, dan seterusnya).'],
        ['SEC-15', 'Mengapa endpoint `PATCH /me` yang menerima entity langsung berbahaya walaupun UI hanya menampilkan field nama dan bio?', 'Penyerang tidak memakai UI; ia bisa mengirim JSON berisi field apa pun yang dikenali entity, seperti `role`, `emailVerified`, atau `tenantId`, dan framework akan mengikatnya (mass assignment). Gunakan DTO/skema allowlist untuk input.'],
      ]),
      ...practice('sec-otorisasi', [
        'Buat matriks endpoint × role/kepemilikan untuk aplikasimu, lalu tandai endpoint yang belum memeriksa kepemilikan objek.',
        'Tulis test integrasi "user A tidak bisa membaca/mengubah/menghapus resource user B" untuk minimal tiga endpoint.',
        'Bila aplikasimu multi-tenant, pastikan `tenantId` hanya berasal dari token; coba aktifkan row-level security PostgreSQL di satu tabel.',
        'Cari endpoint yang mengikat request langsung ke entity/model database dan ganti dengan DTO atau skema allowlist.',
      ]),
      references(
        ['OWASP Authorization Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'],
        ['OWASP Insecure Direct Object Reference Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html'],
        ['OWASP Mass Assignment Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html'],
        ['OWASP Multi-Tenant Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html'],
        ['OWASP API Security Top 10 (2023): API1 BOLA', 'https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/'],
        ['OWASP Top 10:2025 A01 Broken Access Control', 'https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/'],
      ),
    ],
  },
  {
    id: 'sec-secret-supply-chain',
    title: 'Rahasia, Dependensi & Supply Chain',
    summary: 'Mengelola secret (.env, vault, rotasi), menangani secret yang bocor, scanning dependensi dengan npm audit, govulncheck, pip-audit, dan OWASP Dependency-Check, SBOM, lockfile, serta logging yang aman.',
    track: SEC, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Kode yang kamu tulis hanya sebagian kecil dari aplikasi; sisanya adalah dependensi, image dasar, dan pipeline build. **Software Supply Chain Failures** (A03:2025) mencakup semuanya. Di sisi lain, secret seperti password database dan API key sering bocor lewat jalur yang membosankan: file `.env` yang ter-commit, log, atau screenshot. Modul ini membahas keduanya.'),
      heading('Mengelola secret'),
      list([
        '**Development lokal**: `.env` boleh dipakai tetapi masuk `.gitignore`; commit hanya `.env.example` berisi nama variabel dan nilai palsu.',
        '**Produksi**: simpan di secret manager (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) atau Kubernetes Secret yang dienkripsi dan aksesnya dibatasi; aplikasi membacanya saat start atau lewat injeksi environment. Lihat [Konfigurasi: ConfigMap & Secret](#devops.konfigurasi-configmap-secret).',
        '**Hak minimum dan umur pendek**: satu credential per service per lingkungan, dengan izin seminimal mungkin. Lebih baik lagi credential dinamis yang kedaluwarsa sendiri (Vault dynamic secrets, IAM role, workload identity).',
        '**Rotasi** terjadwal dan bisa dilakukan tanpa downtime (dukung dua kunci aktif sementara); rotasi segera bila ada indikasi bocor.',
      ]),
      code('Mencegah dan menangani secret yang bocor', `# .env.example (di-commit): nama variabel saja
# DATABASE_URL=postgres://app:CHANGE_ME@localhost:5432/app
# JWT_SIGNING_KEY=

# Scan sebelum push: seluruh riwayat repo dan folder kerja
gitleaks git -v
gitleaks dir . -v

# Ambil secret dari secret manager saat deploy, bukan dari file di repo
aws secretsmanager get-secret-value --secret-id prod/toko/db --query SecretString --output text
vault kv get -field=password secret/toko/db

# Bila secret TERLANJUR ter-push:
# 1. Cabut/rotasi secret itu SEKARANG; anggap sudah disalahgunakan (bot memindai GitHub dalam hitungan menit)
# 2. Periksa log akses penyedia (cloud, database, payment gateway) untuk pemakaian mencurigakan
# 3. Baru setelah itu bersihkan riwayat Git (git filter-repo) dan minta kolaborator clone ulang
# 4. Aktifkan GitHub secret scanning + push protection agar tidak terulang`, 'bash'),
      callout('warn', 'Menghapus dari Git bukan perbaikan', 'Menulis ulang riwayat tidak menarik kembali secret dari clone, fork, cache CI, atau tangan orang yang sudah melihatnya. **Rotasi adalah perbaikan sebenarnya**; membersihkan riwayat hanya mengurangi paparan berikutnya. Langkah teknis membersihkan riwayat ada di [Git: Membatalkan Perubahan & Pemulihan](#tools.git-undo-recovery).'),
      heading('Scanning dependensi dan SBOM'),
      code('Audit dependensi per ekosistem dan membuat SBOM', `# Node.js
npm ci                                      # pasang PERSIS sesuai package-lock.json
npm audit --omit=dev --audit-level=high     # exit code != 0 bila ada temuan >= high

# Go: hanya melaporkan kerentanan pada fungsi yang benar-benar dipanggil kodemu
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...

# Python
pip install pip-audit
pip-audit -r requirements.txt               # atau tanpa -r untuk environment aktif

# Java/.NET/dll.: OWASP Dependency-Check (NVD API key mempercepat unduhan data)
dependency-check.sh --project toko-api --scan . --format HTML --nvdApiKey "$NVD_API_KEY"
# Maven: mvn org.owasp:dependency-check-maven:check

# SBOM (Software Bill of Materials) format CycloneDX
npm sbom --sbom-format cyclonedx > sbom.cdx.json
syft dir:. -o cyclonedx-json > sbom.cdx.json`, 'bash'),
      table(['Ekosistem', 'Lockfile', 'Install yang reprodusibel'], [
        ['Node.js', '`package-lock.json` / `pnpm-lock.yaml`', '`npm ci` / `pnpm install --frozen-lockfile`'],
        ['Go', '`go.sum` (checksum, diverifikasi terhadap sumdb)', '`go mod download` + `go mod verify`'],
        ['Python', '`uv.lock` / `poetry.lock` / requirements dengan hash', '`uv sync --locked` / `pip install --require-hashes -r requirements.txt`'],
        ['Java', 'Gradle dependency locking / versi tetap di Maven', 'Hindari rentang versi dinamis; aktifkan dependency verification di Gradle'],
        ['Container', 'Digest image (`@sha256:...`)', 'Pin image dasar dengan digest, perbarui lewat Renovate/Dependabot'],
      ]),
      paragraph('Lengkapi dengan kebiasaan supply chain lain: perbarui dependensi secara rutin lewat Dependabot atau Renovate (pembaruan kecil yang sering lebih aman daripada lompatan besar), periksa nama paket sebelum menambah dependensi (typosquatting), pin GitHub Actions pihak ketiga ke commit SHA, beri token CI izin minimum, dan tanda tangani artefak rilis. Untuk Go, lihat juga [Fuzzing, Benchmark & Keamanan Dependensi](#go.go-fuzz-bench-security) dan pembahasan pipeline di [DevSecOps & Keamanan Supply Chain](#devops.devsecops-keamanan-supply-chain).'),
      heading('Logging yang aman'),
      code('Redaksi data sensitif di log (Node, pino)', `import pino from 'pino';

export const logger = pino({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.nik',
    ],
    censor: '[REDACTED]',
  },
});

// RENTAN: seluruh body dan header masuk log (password, token, data pribadi)
logger.info({ body: req.body, headers: req.headers }, 'login attempt');

// PERBAIKAN: log event keamanan dengan field yang dipilih secara sadar
logger.warn(
  { event: 'auth.login_failed', userId: user?.id, ip: req.ip, requestId: req.id },
  'login gagal',
);`, 'ts'),
      table(['Log', 'Jangan log'], [
        ['Event keamanan: login sukses/gagal, perubahan password/MFA, akses ditolak, perubahan role', 'Password, token, session ID, API key, isi header `Authorization`/`Cookie`'],
        ['ID user, ID request/trace, IP, user agent, waktu (UTC)', 'Nomor kartu, NIK, data kesehatan, isi dokumen pribadi'],
        ['Kegagalan validasi input (ringkas, tanpa payload utuh)', 'Body request/respons lengkap secara default'],
      ]),
      ...quiz([
        ['SEC-16', 'API key ter-push ke repo publik lima menit lalu dan commit-nya sudah kamu hapus dengan force push. Apa langkah berikutnya yang paling penting?', 'Cabut dan rotasi API key itu sekarang juga, lalu periksa log penyedia untuk pemakaian mencurigakan. Bot memindai GitHub dalam hitungan menit, dan commit lama bisa tetap ada di fork, cache, atau event API. Menghapus dari riwayat tidak membuat key itu kembali rahasia.'],
        ['SEC-17', 'Apa kelebihan `govulncheck` dibanding scanner yang hanya membaca daftar dependensi?', '`govulncheck` menganalisis call graph sehingga hanya melaporkan kerentanan pada fungsi yang benar-benar bisa dipanggil kodemu. Hasilnya jauh lebih sedikit *false positive* dibanding sekadar mencocokkan versi modul dengan database CVE.'],
        ['SEC-18', 'Mengapa CI sebaiknya memakai `npm ci` daripada `npm install`?', '`npm ci` memasang versi persis dari `package-lock.json`, gagal bila lockfile tidak sinkron dengan `package.json`, dan tidak pernah mengubah lockfile. Build menjadi reprodusibel dan versi yang diaudit sama dengan yang dipasang, sehingga tidak ada versi baru (mungkin disusupi) yang ikut masuk diam-diam.'],
      ]),
      ...practice('sec-secret-supply-chain', [
        'Jalankan `gitleaks git` di repo-mu; tindak lanjuti setiap temuan (rotasi bila asli, allowlist bila false positive).',
        'Tambahkan langkah audit dependensi (`npm audit`, `govulncheck`, `pip-audit`, atau Dependency-Check) ke pipeline CI yang menggagalkan build untuk temuan high/critical.',
        'Hasilkan SBOM CycloneDX untuk satu service dan simpan sebagai artefak rilis.',
        'Konfigurasikan redaksi log untuk header `Authorization`, `Cookie`, dan field password, lalu buktikan dengan request uji.',
      ]),
      references(
        ['OWASP Secrets Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'],
        ['OWASP Vulnerable Dependency Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html'],
        ['OWASP Software Supply Chain Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html'],
        ['OWASP Logging Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html'],
        ['OWASP Dependency-Check', 'https://owasp.org/projects/dependency-check'],
        ['Go: Vulnerability Management (govulncheck)', 'https://go.dev/doc/security/vuln/'],
        ['npm audit', 'https://docs.npmjs.com/cli/v10/commands/npm-audit/'],
        ['pip-audit', 'https://pypi.org/project/pip-audit/'],
        ['CycloneDX', 'https://cyclonedx.org/'],
        ['GitHub Docs: Push protection', 'https://docs.github.com/en/code-security/concepts/secret-security/push-protection'],
      ),
    ],
  },
  {
    id: 'sec-checklist-produksi',
    title: 'Checklist Keamanan Produksi & Threat Modeling',
    summary: 'Security header, konfigurasi TLS, rate limiting, validasi input, pesan error yang aman, threat modeling STRIDE singkat, dan checklist akhir sebelum rilis.',
    track: SEC, source: webSecuritySource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Modul ini merangkum kontrol yang sebaiknya ada sebelum aplikasi menerima trafik sungguhan. Tidak ada satu kontrol yang cukup; tujuannya adalah **pertahanan berlapis** sehingga satu kesalahan tidak langsung menjadi insiden. Gunakan threat modeling untuk memutuskan lapisan mana yang paling penting bagi sistemmu.'),
      table(['Header', 'Nilai yang disarankan', 'Melindungi dari'], [
        ['`Strict-Transport-Security`', '`max-age=63072000; includeSubDomains` (tambah `preload` setelah yakin semua subdomain HTTPS)', 'Downgrade ke HTTP, SSL stripping'],
        ['`Content-Security-Policy`', "Strict CSP berbasis nonce + `object-src 'none'; base-uri 'none'; frame-ancestors 'none'`", 'XSS, clickjacking'],
        ['`X-Content-Type-Options`', '`nosniff`', 'MIME sniffing (file teks dieksekusi sebagai skrip)'],
        ['`Referrer-Policy`', '`strict-origin-when-cross-origin` atau `no-referrer`', 'Kebocoran URL berisi token/ID ke situs lain'],
        ['`Permissions-Policy`', '`camera=(), microphone=(), geolocation=()`', 'Penyalahgunaan fitur browser oleh skrip/iframe'],
        ['`Cross-Origin-Opener-Policy`', '`same-origin`', 'Serangan lintas jendela (XS-Leaks)'],
        ['`X-Frame-Options`', '`DENY` (untuk browser lama; utamakan `frame-ancestors`)', 'Clickjacking'],
        ['`Cache-Control` pada respons sensitif', '`no-store`', 'Data pribadi tersimpan di cache bersama atau browser'],
        ['`Server`, `X-Powered-By`', 'Hapus atau samarkan', 'Fingerprinting versi'],
        ['`X-XSS-Protection`', 'Jangan dipakai (atau `0`)', 'Filter lama browser sudah dihapus dan bisa disalahgunakan'],
      ]),
      code('Header, rate limit, validasi input, dan error yang aman (Express)', `import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const app = express();
app.set('trust proxy', 1);                      // tepat 1 reverse proxy di depan: req.ip dari X-Forwarded-For
app.use(helmet());                              // HSTS, nosniff, CSP dasar, frame-ancestors, hapus X-Powered-By
app.use(express.json({ limit: '100kb' }));      // batasi ukuran body

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,                                    // 10 percobaan per 15 menit per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// Validasi allowlist: tipe, panjang, format; field lain dibuang
const LoginBody = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});

app.post('/v1/auth/login', loginLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).type('application/problem+json')
      .json({ type: 'about:blank', title: 'Input tidak valid', status: 400 });
  }
  // ... autentikasi; pesan gagal generik: "email atau password salah"
});

// Error handler terakhir: detail lengkap ke log, respons generik ke klien
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.get('X-Request-Id') ?? crypto.randomUUID();
  logger.error({ err, requestId }, 'unhandled error');
  res.status(500).type('application/problem+json')
    .json({ type: 'about:blank', title: 'Terjadi kesalahan pada server', status: 500, requestId });
});`, 'ts'),
      code('TLS, redirect HTTPS, dan rate limit di reverse proxy (nginx)', `http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    server_tokens off;                                   # sembunyikan versi nginx

    server {
        listen 80;
        return 301 https://$host$request_uri;            # semua HTTP diarahkan ke HTTPS
    }

    server {
        listen 443 ssl;
        http2 on;
        server_name api.toko.example;

        ssl_certificate     /etc/letsencrypt/live/api.toko.example/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.toko.example/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;                   # matikan SSLv3, TLS 1.0, TLS 1.1

        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        client_max_body_size 1m;
        location / {
            limit_req zone=api burst=20 nodelay;         # kelebihan dijawab 503 (atur limit_req_status 429)
            proxy_pass http://127.0.0.1:8080;
        }
    }
}`, 'text'),
      callout('tip', 'TLS tanpa repot', 'Gunakan sertifikat otomatis (Let\'s Encrypt/ACME, cert-manager di Kubernetes, atau sertifikat terkelola di load balancer cloud) agar tidak ada sertifikat kedaluwarsa. Pakai konfigurasi siap pakai seperti Mozilla SSL Configuration Generator (profil *intermediate*), uji hasilnya dengan alat pemeriksa TLS, dan jangan lupa koneksi internal: aplikasi ke database dan antar service juga sebaiknya terenkripsi.'),
      heading('Threat modeling cepat dengan STRIDE'),
      paragraph('Threat modeling tidak harus berupa dokumen tebal. Dalam 30 sampai 60 menit bersama tim, jawab empat pertanyaan: **apa yang kita bangun?** (gambar diagram alur data sederhana beserta batas kepercayaan), **apa yang bisa salah?** (telusuri dengan STRIDE), **apa yang akan kita lakukan?** (mitigasi, terima risiko, atau pindahkan), dan **apakah sudah cukup baik?** (tinjau ulang saat desain berubah).'),
      table(['Ancaman', 'Properti yang dilanggar', 'Contoh di API', 'Mitigasi'], [
        ['**S**poofing', 'Autentikasi', 'Login memakai credential curian', 'MFA, rate limit, deteksi anomali'],
        ['**T**ampering', 'Integritas', 'Mengubah harga di body request, mengubah token', 'Validasi di server, tanda tangan, harga dihitung ulang di server'],
        ['**R**epudiation', 'Non-repudiation', '"Saya tidak pernah menyetujui transfer itu"', 'Audit log yang tidak bisa diubah, dengan identitas dan waktu'],
        ['**I**nformation disclosure', 'Kerahasiaan', 'IDOR, stack trace, bucket publik', 'Otorisasi per objek, error generik, enkripsi'],
        ['**D**enial of service', 'Ketersediaan', 'Body raksasa, query mahal, flood login', 'Rate limit, batas ukuran & timeout, pagination wajib'],
        ['**E**levation of privilege', 'Otorisasi', 'Mass assignment `role: ADMIN`', 'DTO allowlist, deny by default, least privilege'],
      ]),
      heading('Checklist akhir sebelum rilis'),
      { type: 'checklist', id: 'sec-checklist-produksi-final', items: [
        'Semua trafik lewat HTTPS dengan TLS 1.2+, HSTS aktif, sertifikat diperbarui otomatis.',
        'Security header terpasang dan dicek (CSP, nosniff, Referrer-Policy, frame-ancestors, `no-store` untuk respons sensitif).',
        'Setiap endpoint memeriksa autentikasi dan otorisasi per objek/tenant; endpoint publik terdaftar eksplisit.',
        'Semua query berparameter; tidak ada shell dengan input pengguna; upload dan path file divalidasi.',
        'Password di-hash argon2id/bcrypt; session/JWT berumur pendek dengan verifikasi ketat; MFA tersedia untuk admin.',
        'Rate limit pada login, reset password, OTP, dan endpoint mahal; batas ukuran body dan timeout terpasang.',
        'Validasi input dengan skema allowlist; pesan error generik tanpa stack trace, dengan `requestId` untuk penelusuran.',
        'CORS memakai allowlist origin; cookie memakai `Secure`, `HttpOnly`, `SameSite`; proteksi CSRF untuk auth berbasis cookie.',
        'Tidak ada secret di repo atau image; secret di secret manager dengan hak minimum dan prosedur rotasi.',
        'Scan dependensi dan secret berjalan di CI; lockfile dipakai; SBOM dihasilkan untuk rilis.',
        'Event keamanan dicatat tanpa data sensitif, dan ada alert yang dipantau seseorang.',
        'Endpoint debug/admin/actuator tidak terekspos ke internet; mode debug mati di produksi.',
        'Backup terenkripsi dan sudah diuji restore; ada runbook insiden (siapa dihubungi, cara mencabut credential).',
      ] },
      ...quiz([
        ['SEC-19', 'Mengapa sebaiknya tidak langsung menambahkan `preload` pada header HSTS?', 'Domain yang masuk HSTS preload list dipaksa HTTPS oleh browser untuk domain itu **dan semua subdomainnya**, dan proses keluar dari daftar itu lambat (bisa berbulan-bulan). Bila masih ada subdomain yang hanya bisa HTTP (misalnya sistem internal lama), subdomain itu tidak bisa diakses. Mulai dengan `max-age` kecil, naikkan bertahap, lalu preload setelah yakin.'],
        ['SEC-20', 'Rate limit per IP di aplikasi Express berjalan di belakang load balancer, tetapi semua user tiba-tiba kena limit bersamaan. Apa penyebabnya?', 'Aplikasi melihat IP load balancer sebagai `req.ip` untuk semua request, sehingga semua user berbagi satu kuota. Atur `trust proxy` sesuai jumlah proxy tepercaya agar IP klien diambil dari `X-Forwarded-For`. Jangan memercayai header itu secara buta (misalnya `trust proxy: true` saat aplikasi juga bisa diakses langsung), karena penyerang bisa memalsukannya untuk menghindari limit.'],
        ['SEC-21', 'Pada sesi STRIDE, ancaman "user mengubah `price` di body request checkout" masuk kategori apa, dan apa mitigasinya?', '**Tampering** (pelanggaran integritas). Mitigasinya: server tidak pernah memercayai harga dari klien; hitung ulang total dari katalog dan aturan diskon di server, dan validasi input dengan skema yang tidak menerima field `price` sama sekali.'],
      ]),
      ...practice('sec-checklist-produksi', [
        'Pindai header situs staging-mu dengan `curl -sI` dan bandingkan dengan tabel header; tambahkan yang belum ada.',
        'Pasang rate limit pada login dan reset password, lalu buktikan dengan skrip yang mengirim 20 request bahwa server menjawab 429 dengan `Retry-After`.',
        'Lakukan sesi STRIDE 45 menit untuk satu fitur (misalnya checkout) dan tulis minimal satu ancaman per huruf beserta mitigasinya.',
        'Isi checklist akhir di atas untuk satu service dan buat tiket untuk setiap butir yang belum terpenuhi.',
      ]),
      references(
        ['OWASP HTTP Security Response Headers Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html'],
        ['OWASP Transport Layer Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html'],
        ['OWASP Input Validation Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html'],
        ['OWASP Error Handling Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html'],
        ['OWASP Denial of Service Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html'],
        ['OWASP Threat Modeling Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html'],
        ['MDN: Strict-Transport-Security', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security'],
        ['MDN: 429 Too Many Requests', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429'],
        ['web.dev: Security headers quick reference', 'https://web.dev/articles/security-headers'],
        ['OWASP ASVS', 'https://asvs.owasp.org/'],
      ),
    ],
  },
];

export const webSecurityCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'web',
  title: 'Fondasi Web & Keamanan Aplikasi',
  short: 'Web & Keamanan',
  monogram: 'Sec',
  hue: 'maroon',
  description:
    'Fondasi yang dipakai setiap backend developer apa pun bahasanya: cara kerja internet dan HTTP, desain REST API, aturan browser (CORS, cookie, CSP), lalu keamanan aplikasi berdasarkan OWASP Top 10:2025, dari injection dan XSS sampai autentikasi, otorisasi, supply chain, dan checklist produksi.',
  tracks: webSecurityTracks,
  sources: [webSecuritySource],
  intro: [
    callout('info', 'Lintas bahasa', 'Materi ini tidak terikat satu stack. Konsepnya berlaku di mana pun, dan contoh kodenya ditulis dalam beberapa bahasa (Java, Go, Python, TypeScript/Node) serta HTTP mentah, supaya kamu bisa mengenali pola yang sama di proyekmu sendiri. Kerjakan track **Internet & HTTP** lebih dulu, lalu **Keamanan Aplikasi**.'),
    callout('warn', 'Untuk pertahanan', 'Contoh berlabel **RENTAN** ditampilkan agar mudah dikenali saat code review dan selalu diikuti perbaikannya. Uji teknik apa pun hanya pada aplikasi milikmu sendiri atau yang kamu punya izin tertulis untuk menguji.'),
  ],
  modules,
};
