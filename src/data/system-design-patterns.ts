import type { Module, Track } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

/**
 * System Design dalam 12 Baris: dua belas pasangan gejala → solusi, dikelompokkan per jalur
 * (baca, tulis, traffic, kegagalan, observability). Kode Java diuji dengan JDK 17, SQL dengan
 * PostgreSQL 17, konfigurasi nginx dengan `nginx -t`, dan presign S3 dengan boto3 secara offline.
 */
const TRACK = 'System Design dalam 12 Baris';

export const systemDesignPatternTracks: Track[] = [
  { title: TRACK, summary: 'Dua belas gejala skala & keandalan dan solusi standarnya: index, cache, replica, queue, sharding, load balancer, rate limiting, CDN, retry, circuit breaker, idempotency key, dan observability.' },
];

export const systemDesignPatternSource = 'System Design dalam 12 Baris: dikembangkan dari ringkasan "System Design in 12 lines" (Saumya Awasthi), diperdalam dengan dokumentasi resmi; kode diuji dengan JDK 17, PostgreSQL 17, dan nginx 1.22 (5 November 2026)';

const CACHE_ASIDE = `import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.function.LongSupplier;

/** Cache-aside: TTL + jitter, dan perlindungan stampede (hanya satu loader per key yang menyentuh DB). */
public final class CacheAside<K, V> {
    private record Entry<V>(V value, long expiresAt) {}

    private final ConcurrentHashMap<K, Entry<V>> store = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<K, CompletableFuture<V>> loading = new ConcurrentHashMap<>();
    private final Function<K, V> loader;   // mis. SELECT ke database; jangan kembalikan null
    private final long ttlMillis;
    private final LongSupplier clock;

    public CacheAside(Function<K, V> loader, Duration ttl, LongSupplier clock) {
        this.loader = loader;
        this.ttlMillis = ttl.toMillis();
        this.clock = clock;
    }

    public V get(K key) {
        Entry<V> hit = store.get(key);
        if (hit != null && hit.expiresAt() > clock.getAsLong()) {
            return hit.value();                                    // cache hit
        }
        CompletableFuture<V> mine = new CompletableFuture<>();
        CompletableFuture<V> running = loading.putIfAbsent(key, mine);
        if (running != null) {
            return running.join();                                 // ikut menunggu loader yang sedang jalan
        }
        try {
            V value = loader.apply(key);                           // cache miss: satu-satunya query ke DB
            long jitter = ThreadLocalRandom.current().nextLong(ttlMillis / 10 + 1);  // cegah kedaluwarsa serentak
            store.put(key, new Entry<>(value, clock.getAsLong() + ttlMillis + jitter));
            mine.complete(value);
            return value;
        } catch (RuntimeException e) {
            mine.completeExceptionally(e);
            throw e;
        } finally {
            loading.remove(key, mine);
        }
    }

    /** Panggil SETELAH write ke database sukses; hapus, jangan perbarui, agar tidak menulis nilai basi. */
    public void invalidate(K key) {
        store.remove(key);
    }
}`;
const REPLICA_ROUTER = `import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/** Arahkan baca ke replica, kecuali user baru saja menulis (read-your-writes selama jendela lag). */
public final class ReplicaRouter {
    public enum Target { PRIMARY, REPLICA }

    private final Map<String, Long> lastWriteAt = new ConcurrentHashMap<>();
    private final long stickyMillis;      // > lag replikasi p99 yang terukur
    private final LongSupplier clock;

    public ReplicaRouter(long stickyMillis, LongSupplier clock) {
        this.stickyMillis = stickyMillis;
        this.clock = clock;
    }

    public Target forWrite(String userId) {
        lastWriteAt.put(userId, clock.getAsLong());
        return Target.PRIMARY;
    }

    public Target forRead(String userId) {
        Long wroteAt = lastWriteAt.get(userId);
        boolean recentlyWrote = wroteAt != null && clock.getAsLong() - wroteAt < stickyMillis;
        return recentlyWrote ? Target.PRIMARY : Target.REPLICA;
    }
}`;
const WRITE_BUFFER = `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * Queue berbatas yang meredam lonjakan tulis: request cukup antre (cepat), worker menulis per batch.
 * Demo mekanisme; di produksi pakai broker yang tahan crash (Kafka, RabbitMQ, SQS).
 */
public final class WriteBuffer<T> implements AutoCloseable {
    private final BlockingQueue<T> queue;
    private final Consumer<List<T>> sink;          // mis. INSERT batch ke database
    private final int batchSize;
    private final Thread worker;
    private volatile boolean running = true;

    public WriteBuffer(int capacity, int batchSize, Consumer<List<T>> sink) {
        this.queue = new ArrayBlockingQueue<>(capacity);
        this.batchSize = batchSize;
        this.sink = sink;
        this.worker = new Thread(this::drainLoop, "write-buffer");
        this.worker.start();
    }

    /** false = antrean penuh: balas 503/429 dengan Retry-After (backpressure), jangan tumbang. */
    public boolean submit(T item) {
        return queue.offer(item);
    }

    private void drainLoop() {
        List<T> batch = new ArrayList<>(batchSize);
        while (running || !queue.isEmpty()) {
            try {
                T first = queue.poll(100, TimeUnit.MILLISECONDS);
                if (first == null) {
                    continue;
                }
                batch.add(first);
                queue.drainTo(batch, batchSize - 1);      // ambil sisa yang sudah menunggu, maks batchSize
                sink.accept(List.copyOf(batch));           // satu round-trip DB untuk banyak baris
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } finally {
                batch.clear();
            }
        }
    }

    @Override
    public void close() {
        running = false;          // hentikan loop setelah antrean habis ditulis
        try {
            worker.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}`;
const HASH_RING = `import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.IntStream;

/** Consistent hashing dengan virtual node: menambah shard hanya memindahkan sekitar 1/N key. */
public final class ConsistentHashRing {
    private final TreeMap<Long, String> ring = new TreeMap<>();
    private final int virtualNodes;

    public ConsistentHashRing(List<String> shards, int virtualNodes) {
        this.virtualNodes = virtualNodes;
        shards.forEach(this::addShard);
    }

    public void addShard(String shard) {
        for (int i = 0; i < virtualNodes; i++) {
            ring.put(hash(shard + "#" + i), shard);   // banyak titik per shard = beban lebih merata
        }
    }

    public String shardFor(String key) {
        SortedMap<Long, String> tail = ring.tailMap(hash(key));
        return tail.isEmpty() ? ring.firstEntry().getValue() : tail.get(tail.firstKey());   // searah jarum jam
    }

    static long hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("MD5").digest(value.getBytes(StandardCharsets.UTF_8));
            long h = 0;
            for (int i = 0; i < 8; i++) {
                h = (h << 8) | (digest[i] & 0xff);
            }
            return h;
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public static void main(String[] args) {
        int keys = 100_000;
        ConsistentHashRing ring = new ConsistentHashRing(List.of("db-0", "db-1", "db-2", "db-3"), 200);
        Map<Integer, String> before = new HashMap<>();
        for (int k = 0; k < keys; k++) {
            before.put(k, ring.shardFor("user:" + k));
        }
        ring.addShard("db-4");
        long movedRing = before.entrySet().stream()
                .filter(e -> !e.getValue().equals(ring.shardFor("user:" + e.getKey()))).count();
        long movedModulo = IntStream.range(0, keys)
                .filter(k -> Math.floorMod(hash("user:" + k), 4L) != Math.floorMod(hash("user:" + k), 5L)).count();
        System.out.printf("consistent hashing: %.1f%% key pindah%n", 100.0 * movedRing / keys);
        System.out.printf("hash %% N          : %.1f%% key pindah%n", 100.0 * movedModulo / keys);
    }
}`;
const TOKEN_BUCKET = `import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/** Token bucket per key (user, API key, IP): boleh burst sampai capacity, rata-rata refillPerSecond. */
public final class TokenBucket {
    public record Decision(boolean allowed, long retryAfterMillis) {}

    private static final class Bucket {
        double tokens;
        long updatedAt;
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final double capacity;
    private final double refillPerMilli;
    private final LongSupplier clock;

    public TokenBucket(int capacity, double refillPerSecond, LongSupplier clock) {
        this.capacity = capacity;
        this.refillPerMilli = refillPerSecond / 1000.0;
        this.clock = clock;
    }

    public Decision tryAcquire(String key) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> {
            Bucket fresh = new Bucket();
            fresh.tokens = capacity;
            fresh.updatedAt = clock.getAsLong();
            return fresh;
        });
        synchronized (bucket) {
            long now = clock.getAsLong();
            bucket.tokens = Math.min(capacity, bucket.tokens + (now - bucket.updatedAt) * refillPerMilli);  // isi ulang malas
            bucket.updatedAt = now;
            if (bucket.tokens >= 1) {
                bucket.tokens -= 1;
                return new Decision(true, 0);
            }
            long wait = (long) Math.ceil((1 - bucket.tokens) / refillPerMilli);
            return new Decision(false, wait);        // balas 429 + header Retry-After
        }
    }
}`;
const RETRY = `import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Predicate;

/** Retry dengan exponential backoff + full jitter. Hanya untuk error sementara pada operasi idempotent. */
public final class Retry {
    @FunctionalInterface
    public interface Sleeper {
        void sleep(long millis) throws InterruptedException;
    }

    private Retry() {}

    public static <T> T withBackoff(Callable<T> call, int maxAttempts, Duration base, Duration cap,
                                    Predicate<Exception> retryable, Sleeper sleeper) throws Exception {
        for (int attempt = 1; ; attempt++) {
            try {
                return call.call();
            } catch (Exception e) {
                if (attempt >= maxAttempts || !retryable.test(e)) {
                    throw e;                                       // error permanen atau jatah habis
                }
                long ceiling = Math.min(cap.toMillis(), base.toMillis() << Math.min(attempt - 1, 20));
                long delay = ThreadLocalRandom.current().nextLong(ceiling + 1);   // full jitter: 0..ceiling
                sleeper.sleep(delay);
            }
        }
    }
}`;
const CIRCUIT_BREAKER = `import java.util.function.LongSupplier;
import java.util.function.Supplier;

/** Circuit breaker: CLOSED → (gagal beruntun) OPEN → (tunggu) HALF_OPEN → satu percobaan → CLOSED/OPEN. */
public final class CircuitBreaker {
    public enum State { CLOSED, OPEN, HALF_OPEN }

    private final int failureThreshold;
    private final long openMillis;
    private final LongSupplier clock;
    private State state = State.CLOSED;
    private int failures;
    private long openedAt;
    private boolean trialInFlight;

    public CircuitBreaker(int failureThreshold, long openMillis, LongSupplier clock) {
        this.failureThreshold = failureThreshold;
        this.openMillis = openMillis;
        this.clock = clock;
    }

    public <T> T call(Supplier<T> action, Supplier<T> fallback) {
        if (!permit()) {
            return fallback.get();                 // gagal cepat: tidak menunggu timeout layanan yang sakit
        }
        try {
            T result = action.get();
            onSuccess();
            return result;
        } catch (RuntimeException e) {
            onFailure();
            return fallback.get();
        }
    }

    private synchronized boolean permit() {
        if (state == State.OPEN && clock.getAsLong() - openedAt >= openMillis) {
            state = State.HALF_OPEN;               // waktunya mengintip apakah layanan sudah pulih
        }
        if (state == State.HALF_OPEN) {
            if (trialInFlight) {
                return false;                       // hanya satu request percobaan
            }
            trialInFlight = true;
            return true;
        }
        return state == State.CLOSED;
    }

    private synchronized void onSuccess() {
        state = State.CLOSED;
        failures = 0;
        trialInFlight = false;
    }

    private synchronized void onFailure() {
        trialInFlight = false;
        if (state == State.HALF_OPEN || ++failures >= failureThreshold) {
            state = State.OPEN;
            openedAt = clock.getAsLong();
            failures = 0;
        }
    }

    public synchronized State state() {
        return state;
    }
}`;
const IDEMPOTENCY = `import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Idempotency key: request yang sama (key + isi sama) dieksekusi sekali; duplikat menerima respons tersimpan.
 * Di produksi simpan di database/Redis dengan TTL, bukan di memori satu instance.
 */
public final class IdempotencyService {
    public record Response(int status, String body) {}

    private record Record(String requestHash, Response response) {}   // response null = sedang diproses

    private final Map<String, Record> records = new ConcurrentHashMap<>();

    public Response handle(String key, String requestHash, Supplier<Response> action) {
        Record claimed = new Record(requestHash, null);
        Record existing = records.putIfAbsent(key, claimed);       // klaim atomik
        if (existing != null) {
            if (!existing.requestHash().equals(requestHash)) {
                return new Response(422, "Idempotency-Key dipakai untuk request yang berbeda");
            }
            return existing.response() != null
                    ? existing.response()                           // replay: hasil pertama, tanpa eksekusi ulang
                    : new Response(409, "Request yang sama masih diproses");
        }
        try {
            Response response = action.get();
            records.put(key, new Record(requestHash, response));
            return response;
        } catch (RuntimeException e) {
            records.remove(key, claimed);                           // gagal sebelum selesai: boleh dicoba lagi
            throw e;
        }
    }
}`;
const PRESIGN = `"""Upload langsung dari browser ke object storage: server hanya menandatangani URL, file tidak lewat server."""
from uuid import uuid4

import boto3
from botocore.config import Config

REGION = "ap-southeast-3"   # Jakarta (region opt-in: pakai endpoint regional, bukan s3.amazonaws.com)
s3 = boto3.client("s3", region_name=REGION, endpoint_url=f"https://s3.{REGION}.amazonaws.com",
                  config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}))


def create_upload_url(content_type: str) -> dict[str, str]:
    if content_type not in {"image/webp", "image/jpeg", "image/png"}:
        raise ValueError("tipe file tidak diizinkan")
    key = f"produk/{uuid4()}.{content_type.split('/')[1]}"   # nama unik = aman di-cache selamanya
    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": "toko-media", "Key": key, "ContentType": content_type,
                "CacheControl": "public, max-age=31536000, immutable"},
        ExpiresIn=300,                                        # URL hanya berlaku 5 menit
    )
    return {"upload_url": url, "public_url": f"https://cdn.toko.example/{key}"}


if __name__ == "__main__":
    print(create_upload_url("image/webp"))`;
const INDEX_SQL = `-- Gejala: halaman "Pesanan Saya" lambat. Lihat rencana eksekusinya dulu, jangan menebak.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total, created_at
FROM orders
WHERE customer_id = 42 AND status = 'PAID'
ORDER BY created_at DESC
LIMIT 20;
-- Sebelum index: Seq Scan + Sort atas seluruh tabel.

-- Index komposit: kolom kesetaraan dulu, lalu kolom pengurutan (tanpa Sort tambahan).
-- INCLUDE membuat index "covering": kolom yang di-SELECT ikut tersimpan → Index Only Scan.
-- CONCURRENTLY: tidak mengunci tabel dari INSERT/UPDATE selama index dibangun (tidak boleh di dalam transaksi).
CREATE INDEX CONCURRENTLY idx_orders_customer_status_created
    ON orders (customer_id, status, created_at DESC)
    INCLUDE (id, total);

-- Partial index: hanya baris yang sering dicari (pesanan menunggu bayar), index jauh lebih kecil.
CREATE INDEX CONCURRENTLY idx_orders_pending_created
    ON orders (created_at)
    WHERE status = 'PENDING';`;
const REPLICA_SQL = `-- Di primary: replica mana saja yang terhubung dan seberapa jauh tertinggal
SELECT application_name, client_addr, state, write_lag, flush_lag, replay_lag
FROM pg_stat_replication;

-- Di replica: umur transaksi terakhir yang sudah diterapkan (NULL bila bukan replica)
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag,
       pg_is_in_recovery() AS is_replica;`;
const PARTITION_SQL = `-- Langkah sebelum sharding: partisi hash di SATU server. Tabel & index per partisi lebih kecil,
-- VACUUM dan pemeliharaan lebih ringan, dan kunci partisi ini nanti bisa menjadi shard key.
CREATE TABLE events (
    tenant_id  BIGINT      NOT NULL,
    id         BIGINT      GENERATED ALWAYS AS IDENTITY,
    payload    JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, id)            -- primary key wajib memuat kunci partisi
) PARTITION BY HASH (tenant_id);

CREATE TABLE events_p0 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE events_p1 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE events_p2 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE events_p3 PARTITION OF events FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- Query yang menyertakan tenant_id hanya menyentuh satu partisi (partition pruning)
EXPLAIN SELECT * FROM events WHERE tenant_id = 7 ORDER BY created_at DESC LIMIT 50;`;
const IDEMPOTENCY_SQL = `CREATE TABLE idempotency_keys (
    user_id       BIGINT      NOT NULL,
    key           TEXT        NOT NULL,             -- dari header Idempotency-Key (UUID buatan klien)
    request_hash  TEXT        NOT NULL,             -- sha256(method + path + body)
    status        TEXT        NOT NULL DEFAULT 'processing',   -- processing | completed
    response_code INT,
    response_body JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)                      -- key berlaku per user, bukan global
);

-- 1) Klaim atomik. Satu baris kembali = request pertama, lanjutkan proses.
--    Nol baris = duplikat: baca baris lama, bandingkan request_hash, lalu kirim ulang respons tersimpan.
INSERT INTO idempotency_keys (user_id, key, request_hash)
VALUES (42, '6f1c2a9e-0d5b-4c1e-9f7a-3b2d8e4c1a90', 'sha256:ab12')
ON CONFLICT (user_id, key) DO NOTHING
RETURNING key;

-- 2) Setelah aksi sukses (sebaiknya dalam transaksi yang sama dengan perubahan bisnisnya)
UPDATE idempotency_keys
SET status = 'completed', response_code = 201, response_body = '{"payment_id": "pay_123"}'
WHERE user_id = 42 AND key = '6f1c2a9e-0d5b-4c1e-9f7a-3b2d8e4c1a90';

-- 3) Bersihkan berkala: klien hanya boleh me-retry dalam jendela 24 jam
DELETE FROM idempotency_keys WHERE created_at < now() - INTERVAL '24 hours';`;
const NGINX = `events {}

http {
    # Rate limiting: 10 request/detik per IP, burst 20 tanpa antre, sisanya 429
    limit_req_zone $binary_remote_addr zone=api_per_ip:10m rate=10r/s;
    limit_req_status 429;

    upstream order_service {
        least_conn;                                     # kirim ke instance dengan koneksi aktif paling sedikit
        server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;   # 3 gagal → istirahat 10 detik (health check pasif)
        server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;
        server 10.0.1.13:8080 max_fails=3 fail_timeout=10s;
        keepalive 64;                                   # pakai ulang koneksi ke backend
    }

    server {
        listen 80;

        location /api/ {
            limit_req zone=api_per_ip burst=20 nodelay;
            proxy_pass http://order_service;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header X-Request-Id $request_id;       # korelasi log antar-layanan
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_connect_timeout 2s;
            proxy_read_timeout 10s;
            proxy_next_upstream error timeout http_502 http_503;   # coba instance lain, tapi
            proxy_next_upstream_tries 2;                           # POST tidak di-retry (non-idempotent)
        }
    }
}`;

const meta = { track: TRACK, source: systemDesignPatternSource };
const sd = (id: string, label: string) => `[${label}](#distributed.${id})`;

export const systemDesignPatternModules: Omit<Module, 'code'>[] = [
  {
    id: 'sdp-peta-12-baris',
    title: 'System Design dalam 12 Baris: Peta Gejala → Solusi',
    summary: 'Dua belas masalah skala dan keandalan paling umum, bukti yang perlu dicari, solusi standarnya, dan harga yang dibayar setiap solusi.',
    ...meta, duration: '45 menit', level: 'Easy',
    blocks: [
      paragraph('Sebagian besar keputusan system design adalah mencocokkan **gejala yang terukur** dengan **solusi standar**, lalu menyebutkan **harganya**. Dua belas baris di bawah adalah kosakata dasarnya. Yang membedakan engineer senior bukan hafal solusinya, tetapi tahu bukti apa yang harus dilihat dulu dan apa yang dikorbankan.'),
      table(['#', 'Gejala', 'Bukti yang dicari', 'Solusi', 'Harga yang dibayar', 'Modul'], [
        ['1', 'Baca lambat', 'p95 endpoint baca tinggi, query yang sama berulang', 'Cache', 'Data basi, invalidasi, stampede', sd('sdp-baca-cepat', 'Baca Cepat')],
        ['2', 'Lonjakan tulis', 'Pool koneksi DB habis saat flash sale', 'Queue sebagai buffer', 'Eventual consistency, consumer idempoten', sd('sdp-beban-tulis', 'Beban Tulis')],
        ['3', 'Traffic terlalu besar', 'CPU/memori satu instance mentok', 'Load balancer + instance horizontal', 'Aplikasi wajib stateless', sd('sdp-traffic', 'Traffic')],
        ['4', 'DB berat di baca', 'CPU DB didominasi SELECT', 'Read replica', 'Replication lag', sd('sdp-baca-cepat', 'Baca Cepat')],
        ['5', 'DB berat di tulis', 'Primary jenuh I/O walau query sudah optimal', 'Sharding', 'Query lintas shard, resharding', sd('sdp-beban-tulis', 'Beban Tulis')],
        ['6', 'Query lambat', 'Slow query log, `Seq Scan` di `EXPLAIN`', 'Index', 'Tulis sedikit lebih lambat, ruang disk', sd('sdp-baca-cepat', 'Baca Cepat')],
        ['7', 'File lambat dimuat', 'Bandwidth server habis untuk gambar/video', 'Object storage + CDN', 'Invalidasi cache CDN, biaya egress', sd('sdp-traffic', 'Traffic')],
        ['8', 'Gagal sementara', 'Timeout/503 acak yang hilang sendiri', 'Retry dengan backoff + jitter', 'Retry storm bila salah pasang', sd('sdp-gagal-anggun', 'Gagal Anggun')],
        ['9', 'Request terlalu banyak', 'Satu klien membanjiri API', 'Rate limiting', 'State bersama antar-instance', sd('sdp-traffic', 'Traffic')],
        ['10', 'Satu layanan gagal', 'Thread habis menunggu dependency mati', 'Circuit breaker', 'Fallback harus dirancang', sd('sdp-gagal-anggun', 'Gagal Anggun')],
        ['11', 'Request duplikat', 'Tagihan ganda saat klien retry', 'Idempotency key', 'Penyimpanan key + TTL', sd('sdp-gagal-anggun', 'Gagal Anggun')],
        ['12', 'Tidak tahu apa yang rusak', 'MTTR lama, debug lewat SSH', 'Logs, metrics, tracing', 'Biaya penyimpanan, kardinalitas', sd('sdp-observability', 'Observability')],
      ]),
      code('Di mana tiap solusi berada', `Klien ──▶ CDN ─────────(file statis)──────────▶ Object storage
  │
  ▼
Load balancer + rate limiting
  │
  ▼
Instance aplikasi ×N (stateless) ──────────────▶ Cache (Redis)
  │  retry + backoff · circuit breaker · idempotency key
  ├──▶ Queue ──▶ Worker ──▶ DB primary (shard 0..N, ber-index)
  └──────────────────────────▶ Read replica
Semua komponen ──▶ logs · metrics · traces`, 'text'),
      heading('Urutan yang masuk akal: ukur, lalu yang termurah dulu'),
      { type: 'steps', items: [
        { title: 'Ukur', text: 'Latensi p95/p99 per endpoint, slow query log, `EXPLAIN ANALYZE`, CPU dan koneksi DB. Tanpa angka, setiap solusi hanya tebakan.' },
        { title: 'Perbaiki di tempat', text: 'Index, hilangkan N+1 query, pagination, batasi kolom yang di-SELECT. Murah dan sering menyelesaikan 80% masalah.' },
        { title: 'Cache', text: 'Untuk data yang sering dibaca dan boleh sedikit basi.' },
        { title: 'Scale out aplikasi', text: 'Buat aplikasi stateless, tambah instance di belakang load balancer.' },
        { title: 'Read replica & queue', text: 'Pisahkan beban baca dari primary; ubah tulis yang tidak harus sinkron menjadi asinkron.' },
        { title: 'Partisi, lalu sharding', text: 'Paling akhir, karena paling mahal dan paling sulit dibatalkan.' },
      ] },
      callout('warn', 'Jangan mulai dari sharding', 'Sharding mengubah cara menulis query, transaksi, migrasi, dan backup untuk selamanya. Satu server PostgreSQL yang dirawat baik dengan index tepat, cache, dan read replica sanggup melayani beban yang jauh lebih besar daripada kebanyakan produk.'),
      heading('Memakai 12 baris ini di interview'),
      { type: 'list', items: [
        'Sebut gejalanya dengan angka dari estimasi: "1.000 baca/detik untuk 10 ribu produk populer, jadi cache cocok".',
        'Usulkan solusi, lalu **langsung sebut harganya**: "data bisa basi sampai 60 detik; untuk stok, saya invalidasi saat checkout".',
        'Jelaskan cara membuktikan berhasil: metrik apa yang turun (p99, CPU DB, hit ratio).',
        'Latih kerangkanya di [Kerangka 45 Menit & Estimasi](#interview.sd-kerangka-estimasi) dan [15 Soal Trade-off Cepat](#interview.sd-soal-cepat).',
      ] },
      ...practice('sdp-peta-12-baris', [
        'Untuk aplikasi yang sedang kamu kerjakan, tandai baris mana yang sudah diterapkan dan mana yang belum.',
        'Pilih satu endpoint paling lambat, ukur p95-nya, lalu tentukan baris mana yang paling murah untuk dicoba.',
        'Jelaskan harga dari tiga solusi yang sudah kamu pakai ke rekan tim dalam satu kalimat masing-masing.',
      ]),
      ...quiz([
        ['SDP-01', 'Endpoint daftar produk lambat. Tim langsung mengusulkan Redis. Apa yang seharusnya dilakukan dulu?', 'Ukur dan lihat penyebabnya. Cek slow query log dan `EXPLAIN ANALYZE`: bila query melakukan Seq Scan atau N+1, index atau perbaikan query jauh lebih murah dan tidak membawa masalah data basi. Cache dipasang setelah query sehat tetapi beban baca berulang masih tinggi.'],
        ['SDP-02', 'Mengapa sharding diletakkan paling akhir?', 'Sharding paling mahal dan paling sulit dibatalkan: query lintas shard, transaksi terdistribusi, resharding, migrasi, dan backup menjadi rumit. Index, cache, read replica, queue, dan partisi di satu server biasanya cukup. Sharding baru masuk akal ketika beban tulis atau ukuran data memang melampaui satu primary.'],
        ['SDP-03', 'Apa yang membuat jawaban system design terdengar senior?', 'Selalu menyebut harga setiap solusi dan cara membuktikannya. Contoh: cache menurunkan p99 dan CPU DB, tetapi membawa data basi dan risiko stampede, jadi saya pasang TTL dengan jitter, invalidasi saat tulis, dan memantau hit ratio.'],
      ]),
      references(
        ['The System Design Primer', 'https://github.com/donnemartin/system-design-primer'],
        ['AWS Well-Architected: Reliability Pillar', 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html'],
        ['Google SRE Book', 'https://sre.google/sre-book/table-of-contents/'],
      ),
    ],
  },
  {
    id: 'sdp-baca-cepat',
    title: 'Baca Cepat: Index, Cache & Read Replica',
    summary: 'Tiga perbaikan jalur baca dari yang termurah: index yang tepat, cache-aside dengan perlindungan stampede, dan read replica dengan read-your-writes.',
    ...meta, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Jalur baca diperbaiki dari yang termurah: **index** (mengubah cara database mencari), lalu **cache** (tidak bertanya ke database sama sekali), lalu **read replica** (menambah server yang menjawab SELECT). Masing-masing menyelesaikan masalah yang berbeda; memasang cache di atas query tanpa index hanya menyembunyikan masalah sampai cache kosong.'),
      heading('Baris 6 · Query lambat → index'),
      code('index_orders.sql', INDEX_SQL, 'sql'),
      callout('info', 'Hasil uji lokal', 'Pada tabel 300.000 pesanan di PostgreSQL 17, query di atas berubah dari *Parallel Seq Scan + Sort* (sekitar 365 ms) menjadi *Index Only Scan* setelah index komposit dibuat dan `VACUUM ANALYZE` dijalankan.'),
      table(['Aturan', 'Alasan'], [
        ['Kolom kesetaraan (`=`) dulu, lalu range atau `ORDER BY`', 'Index B-tree dibaca dari kiri; urutan yang benar menghilangkan langkah Sort'],
        ['Leftmost prefix', 'Index `(customer_id, status, created_at)` membantu query yang memfilter `customer_id` saja, tetapi tidak yang memfilter `status` saja'],
        ['Covering index (`INCLUDE`)', 'Semua kolom yang dibaca ada di index → tidak perlu membuka tabel'],
        ['Partial index (`WHERE`)', 'Index kecil untuk subset yang sering dicari'],
        ['Setiap index memperlambat tulis', 'INSERT/UPDATE harus memperbarui semua index; hapus index dengan `idx_scan = 0` di `pg_stat_user_indexes`'],
        ['`CREATE INDEX CONCURRENTLY` di produksi', 'Tidak mengunci tulis selama index dibangun'],
      ]),
      heading('Baris 1 · Baca lambat → cache'),
      table(['Strategi', 'Cara kerja', 'Cocok untuk'], [
        ['Cache-aside', 'Aplikasi cek cache; bila miss, baca DB lalu isi cache', 'Paling umum; data baca-berat'],
        ['Read-through', 'Library cache yang memanggil loader saat miss', 'Sama seperti cache-aside, kode lebih ringkas'],
        ['Write-through', 'Tulis ke cache dan DB bersamaan', 'Data yang langsung dibaca setelah ditulis'],
        ['Write-behind', 'Tulis ke cache, DB diperbarui belakangan', 'Counter/metrik; berisiko kehilangan data'],
      ]),
      code('CacheAside.java', CACHE_ASIDE, 'java'),
      { type: 'list', items: [
        '**Cache stampede**: saat key populer kedaluwarsa, ribuan request menghantam DB bersamaan. Obatnya satu loader per key (seperti di atas) atau `@Cacheable(sync = true)` di Spring.',
        '**Kedaluwarsa serentak**: beri jitter pada TTL agar key yang diisi bersamaan tidak kedaluwarsa bersamaan.',
        '**Invalidasi**: setelah tulis ke DB sukses, **hapus** key cache, jangan menulis nilai baru (dua penulis bisa saling menimpa dengan nilai basi).',
        '**Key yang tidak ada**: cache juga hasil kosong (`Optional.empty()`) dengan TTL pendek, agar request untuk ID palsu tidak selalu tembus ke DB.',
        '**Cache bukan sumber kebenaran**: sistem harus tetap benar (meski lambat) saat cache kosong atau mati.',
        '**Ukur hit ratio**: di bawah sekitar 80% biasanya berarti TTL terlalu pendek atau key terlalu spesifik.',
      ] },
      heading('Baris 4 · DB berat di baca → read replica'),
      paragraph('Replica menerima salinan perubahan dari primary (umumnya asinkron) dan melayani SELECT. Replica tidak membantu beban tulis, dan ada **replication lag**: user yang baru menyimpan profil lalu membaca dari replica bisa melihat data lama.'),
      code('replica_lag.sql', REPLICA_SQL, 'sql'),
      code('ReplicaRouter.java', REPLICA_ROUTER, 'java'),
      { type: 'list', items: [
        '**Read-your-writes**: setelah user menulis, arahkan bacaannya ke primary selama jendela yang lebih panjang dari lag p99. Dengan banyak instance aplikasi, simpan penanda waktu tulis di sesi/cookie, bukan di memori satu instance.',
        '**Di Spring**: tandai service baca dengan `@Transactional(readOnly = true)`, lalu arahkan koneksi lewat `AbstractRoutingDataSource` yang membungkus `LazyConnectionDataSourceProxy`.',
        '**Pantau lag** dan keluarkan replica dari rotasi bila lag melewati ambang.',
      ] },
      paragraph(`Pendalaman konsep: ${sd('caching', 'Caching')} dan ${sd('performance-tuning', 'Performance Tuning')}.`),
      ...practice('sdp-baca-cepat', [
        'Jalankan `EXPLAIN (ANALYZE, BUFFERS)` pada tiga query paling lambat di aplikasimu dan catat jenis scan-nya.',
        'Buat index komposit untuk satu query, lalu bandingkan rencana dan waktu eksekusi sebelum/sesudah.',
        'Pasang cache-aside untuk satu endpoint baca-berat dan ukur hit ratio serta penurunan CPU DB.',
        'Simulasikan stampede (100 thread, key yang sama) dan buktikan hanya satu query yang sampai ke DB.',
      ]),
      ...quiz([
        ['SDP-04', 'Index (status, customer_id) sudah ada, tetapi query WHERE customer_id = ? masih Seq Scan. Mengapa?', 'Index B-tree dibaca dari kolom paling kiri (leftmost prefix). Karena kolom pertamanya `status`, index itu tidak bisa dipakai untuk mencari berdasarkan `customer_id` saja. Buat index yang diawali `customer_id`, atau ubah urutan kolom bila query lain mengizinkan.'],
        ['SDP-05', 'Setelah update produk, mengapa key cache dihapus alih-alih langsung diisi nilai baru?', 'Dua request tulis yang hampir bersamaan bisa menulis ke cache dengan urutan terbalik dari urutan commit di DB, sehingga cache menyimpan nilai lama tanpa batas waktu. Menghapus key memaksa pembacaan berikutnya mengambil nilai terbaru dari DB.'],
        ['SDP-06', 'Apa itu cache stampede dan dua cara mencegahnya?', 'Saat key populer kedaluwarsa, banyak request miss bersamaan dan semuanya menghantam DB. Cegah dengan single flight (hanya satu loader per key, yang lain menunggu hasilnya, mis. `@Cacheable(sync = true)`) dan jitter pada TTL agar key tidak kedaluwarsa serentak. Untuk key sangat panas, perbarui cache di latar belakang sebelum kedaluwarsa.'],
        ['SDP-07', 'User menyimpan alamat baru, lalu halaman profil masih menampilkan alamat lama. Apa penyebab yang mungkin dan perbaikannya?', 'Bacaan diarahkan ke read replica yang tertinggal dari primary (replication lag). Terapkan read-your-writes: setelah user menulis, arahkan bacaannya ke primary selama jendela lebih panjang dari lag p99, atau baca dari primary khusus untuk data milik user itu sendiri.'],
      ]),
      references(
        ['PostgreSQL: Indexes', 'https://www.postgresql.org/docs/current/indexes.html'],
        ['PostgreSQL: Using EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html'],
        ['Spring Framework: Cache Abstraction', 'https://docs.spring.io/spring-framework/reference/integration/cache.html'],
        ['AWS: Caching best practices', 'https://aws.amazon.com/caching/best-practices/'],
      ),
    ],
  },
  {
    id: 'sdp-beban-tulis',
    title: 'Beban Tulis: Queue untuk Lonjakan & Sharding',
    summary: 'Meredam lonjakan tulis dengan queue (backpressure, batch, consumer idempoten) dan membagi data saat satu primary tidak cukup (partisi, shard key, consistent hashing).',
    ...meta, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Beban tulis punya dua bentuk berbeda. **Lonjakan** (flash sale, impor massal) bersifat sementara: database sanggup rata-ratanya, hanya tidak sanggup puncaknya, jadi solusinya adalah **meratakan** dengan queue. **Beban tulis yang tinggi terus-menerus** melampaui kapasitas satu primary, jadi solusinya adalah **membagi** data ke beberapa server.'),
      heading('Baris 2 · Lonjakan tulis → buffer dengan queue'),
      code('Sinkron vs asinkron', `Sinkron   : Klien ──▶ API ──▶ DB (tunggu INSERT) ──▶ 201       puncak traffic = puncak beban DB
Asinkron  : Klien ──▶ API ──▶ Queue ──▶ 202 Accepted + id     API cepat, DB menerima laju yang rata
                              └──▶ Worker ──(batch)──▶ DB      klien cek status lewat GET /jobs/{id}`, 'text'),
      code('WriteBuffer.java', WRITE_BUFFER, 'java'),
      paragraph('Contoh di atas memperlihatkan dua mekanisme inti: **backpressure** (`submit` mengembalikan false saat penuh, sehingga API membalas 429/503 alih-alih tumbang) dan **batching** (satu round-trip DB untuk banyak baris). Antrean di memori hilang saat proses crash, jadi di produksi pakai broker yang tahan crash.'),
      table(['Isu', 'Praktik'], [
        ['Durabilitas', 'Kafka, RabbitMQ (quorum queue), atau SQS. Pesan baru di-ack setelah tersimpan.'],
        ['At-least-once delivery', 'Pesan bisa terkirim dua kali → consumer harus idempoten (simpan id pesan yang sudah diproses).'],
        ['Pesan beracun', 'Setelah N kali gagal, pindahkan ke dead-letter queue (DLQ) dan beri alert.'],
        ['Urutan', 'Kafka menjaga urutan per partition key (mis. `order_id`), tidak global.'],
        ['DB + event konsisten', 'Pakai transactional outbox: tulis event ke tabel outbox dalam transaksi yang sama, publikasikan belakangan.'],
        ['Visibilitas', 'Pantau panjang antrean dan umur pesan tertua; itulah tanda consumer tertinggal.'],
      ]),
      heading('Baris 5 · DB berat di tulis → sharding'),
      paragraph('Sebelum sharding, habiskan opsi yang lebih murah: naikkan spesifikasi server, optimalkan query dan index (setiap index menambah biaya tulis), batch tulis, arsipkan data lama, pisahkan database per layanan, dan **partisi** tabel besar di satu server.'),
      code('partition_events.sql', PARTITION_SQL, 'sql'),
      table(['Shard key', 'Kelebihan', 'Risiko'], [
        ['`tenant_id` (SaaS B2B)', 'Semua data satu tenant di satu shard; query & transaksi tetap lokal', 'Tenant raksasa menjadi hot shard'],
        ['`user_id` (B2C)', 'Distribusi merata untuk banyak user kecil', 'Fitur lintas user (feed, pencarian) jadi lintas shard'],
        ['Waktu (`created_at`)', 'Mudah mengarsipkan data lama', 'Semua tulis baru menumpuk di shard terbaru (hotspot)'],
        ['Hash dari key', 'Distribusi paling merata', 'Range query atas key menjadi scatter-gather'],
      ]),
      code('ConsistentHashRing.java', HASH_RING, 'java'),
      code('Output main() pada uji lokal (100.000 key, 4 → 5 shard)', `consistent hashing: 20.8% key pindah
hash % N          : 80.1% key pindah`, 'text'),
      paragraph('Dengan `hash % N`, menambah satu shard memindahkan hampir semua key, sehingga hampir semua data harus disalin. Consistent hashing hanya memindahkan sekitar 1/N bagian (di sini ~20%), dan virtual node membuat beban antar-shard merata.'),
      { type: 'list', items: [
        '**Query lintas shard** (laporan, pencarian global) menjadi scatter-gather; pindahkan ke data warehouse atau mesin pencari.',
        '**Transaksi lintas shard** dihindari dengan memilih shard key yang membuat satu transaksi bisnis tetap di satu shard; sisanya pakai saga.',
        '**ID unik global**: pakai UUIDv7 atau ID gaya Snowflake, bukan auto-increment per shard.',
        '**Jangan membangun dari nol** bila bisa memakai Citus (PostgreSQL), Vitess (MySQL), atau database terkelola dengan partition key (DynamoDB, Spanner).',
      ] },
      paragraph(`Pendalaman: ${sd('message-queue-message-broker', 'Message Queue / Message Broker')}, ${sd('event-driven-architecture-eda', 'Event-Driven Architecture')}, dan ${sd('distributed-data-management', 'Distributed Data Management')}.`),
      ...practice('sdp-beban-tulis', [
        'Ubah satu endpoint tulis berat menjadi 202 Accepted + worker, lengkap dengan endpoint status.',
        'Buat consumer idempoten: kirim pesan yang sama dua kali dan buktikan efeknya hanya sekali.',
        'Jalankan ConsistentHashRing.main dan bandingkan jumlah key yang pindah dengan `hash % N`.',
        'Pilih shard key untuk aplikasi SaaS multi-tenant dan tuliskan tiga query yang menjadi lintas shard.',
      ]),
      ...quiz([
        ['SDP-08', 'Apa beda masalah yang diselesaikan queue dan sharding?', 'Queue meratakan lonjakan sementara: database sanggup rata-rata beban, tetapi tidak puncaknya, jadi pekerjaan ditampung dan diproses dengan laju yang stabil. Sharding menambah kapasitas tulis permanen ketika rata-rata beban sudah melampaui satu primary. Queue tidak menolong bila laju masuk terus lebih besar dari laju proses; antrean hanya akan terus memanjang.'],
        ['SDP-09', 'Broker menjamin at-least-once. Apa konsekuensinya untuk consumer?', 'Pesan yang sama bisa diproses lebih dari sekali (mis. consumer crash setelah memproses tetapi sebelum ack). Consumer harus idempoten: catat id pesan yang sudah diproses dalam transaksi yang sama dengan efeknya, atau buat operasinya alami idempoten (upsert, set status).'],
        ['SDP-10', 'Mengapa `created_at` biasanya shard key yang buruk untuk tabel event?', 'Semua tulis baru jatuh ke shard yang memegang rentang waktu terbaru, sehingga satu shard menjadi hotspot sementara shard lain menganggur. Shard key yang baik mendistribusikan tulis merata dan menjaga query umum tetap di satu shard, misalnya `tenant_id` atau hash dari `user_id`.'],
        ['SDP-11', 'Mengapa consistent hashing lebih baik daripada hash % N saat menambah shard?', 'Dengan hash % N, mengubah N mengubah tujuan hampir semua key, jadi hampir semua data harus dipindahkan (uji lokal: ~80% untuk 4 → 5 shard). Consistent hashing hanya memindahkan key di segmen ring yang diambil shard baru, sekitar 1/N (uji lokal: ~21%), dan virtual node menjaga beban tetap merata.'],
      ]),
      references(
        ['PostgreSQL: Table Partitioning', 'https://www.postgresql.org/docs/current/ddl-partitioning.html'],
        ['Pattern: Transactional outbox', 'https://microservices.io/patterns/data/transactional-outbox.html'],
        ['Citus documentation', 'https://docs.citusdata.com/'],
        ['Vitess documentation', 'https://vitess.io/docs/'],
      ),
    ],
  },
  {
    id: 'sdp-traffic',
    title: 'Traffic Besar: Load Balancer, Rate Limiting, Object Storage & CDN',
    summary: 'Membagi traffic ke banyak instance stateless, membatasi klien yang berlebihan dengan token bucket, dan memindahkan file ke object storage + CDN.',
    ...meta, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Tiga baris ini mengatur traffic **sebelum** sampai ke logika bisnis: load balancer membagi request ke banyak instance, rate limiting menolak klien yang berlebihan, dan CDN menjawab permintaan file tanpa menyentuh server aplikasi sama sekali.'),
      heading('Baris 3 · Traffic terlalu besar → load balancer'),
      table(['Lapisan', 'Melihat', 'Bisa melakukan', 'Contoh'], [
        ['L4 (TCP/UDP)', 'IP dan port', 'Sangat cepat, tidak membuka isi request', 'AWS NLB, HAProxy mode tcp'],
        ['L7 (HTTP)', 'Path, header, cookie', 'Routing per path, TLS termination, retry, rate limit', 'AWS ALB, nginx, Envoy'],
      ]),
      table(['Algoritma', 'Cara kerja', 'Kapan'], [
        ['Round robin', 'Bergiliran', 'Request seragam dan singkat'],
        ['Least connections', 'Ke instance dengan koneksi aktif paling sedikit', 'Durasi request bervariasi'],
        ['Hash (IP/key)', 'Key yang sama ke instance yang sama', 'Butuh afinitas (cache lokal); hindari untuk sesi'],
      ]),
      code('nginx.conf', NGINX, 'text'),
      { type: 'list', items: [
        '**Aplikasi wajib stateless**: sesi di Redis atau token, file di object storage. Instance mana pun harus bisa melayani request mana pun.',
        '**Health check**: bedakan *liveness* (proses hidup) dan *readiness* (siap menerima traffic, mis. DB terhubung). Spring Boot: `/actuator/health/liveness` dan `/actuator/health/readiness`.',
        '**Graceful shutdown**: saat deploy, berhenti menerima request baru dan selesaikan yang sedang berjalan (`server.shutdown=graceful`, default sejak Spring Boot 3.4).',
        '**Retry di load balancer** hanya untuk request idempoten; nginx secara default tidak mengulang POST ke upstream lain.',
      ] },
      heading('Baris 9 · Request terlalu banyak → rate limiting'),
      table(['Algoritma', 'Sifat', 'Catatan'], [
        ['Fixed window', 'Hitung per menit kalender', 'Sederhana; bisa lolos 2× di batas jendela'],
        ['Sliding window', 'Hitung dalam 60 detik terakhir', 'Lebih adil; sedikit lebih mahal'],
        ['Token bucket', 'Token terisi dengan laju tetap, burst sampai kapasitas', 'Paling umum untuk API publik'],
        ['Leaky bucket', 'Antre dan keluarkan dengan laju tetap', 'Meratakan output, menambah latensi'],
      ]),
      code('TokenBucket.java', TOKEN_BUCKET, 'java'),
      { type: 'list', items: [
        '**Kunci limit**: per API key atau user untuk keadilan, per IP untuk endpoint anonim (login, daftar), per tenant untuk SaaS.',
        '**Respons**: `429 Too Many Requests` dengan header `Retry-After`, agar klien yang baik tahu kapan mencoba lagi.',
        '**Banyak instance**: bucket di memori hanya berlaku per instance. Untuk limit global, simpan state di Redis dan perbarui secara atomik (skrip Lua), atau pasang limit di API gateway.',
        '**Lapisan**: limit kasar per IP di edge/gateway, limit bisnis per user di aplikasi.',
      ] },
      paragraph('Desain rate limiter terdistribusi lengkap ada di [Studi Kasus: Design Rate Limiter](#interview.sd-rate-limiter).'),
      heading('Baris 7 · File lambat → object storage + CDN'),
      code('Alur upload dan download', `Upload  : Browser ──(1) minta URL──▶ API ──(presign)──▶ URL bertanda tangan, berlaku 5 menit
          Browser ──(2) PUT file langsung─────────────▶ Object storage (S3/GCS/R2)
Download: Browser ──▶ CDN edge terdekat ──(miss)──▶ Object storage
                       └──(hit) langsung dari edge, server aplikasi tidak tersentuh`, 'text'),
      code('presign_upload.py', PRESIGN, 'python'),
      table(['Jenis konten', 'Header Cache-Control', 'Alasan'], [
        ['Aset dengan hash di nama (`app.3f9a1c.js`, gambar ber-UUID)', '`public, max-age=31536000, immutable`', 'Nama berubah setiap isinya berubah, jadi aman di-cache setahun'],
        ['HTML halaman', '`no-cache`', 'Boleh disimpan, tetapi wajib divalidasi ulang agar rilis baru langsung terlihat'],
        ['Data pribadi user', '`private, no-store`', 'Jangan pernah disimpan di CDN atau cache bersama'],
      ]),
      { type: 'list', items: [
        '**Versikan nama file** alih-alih mengandalkan invalidasi CDN, yang lambat dan sering berbayar.',
        '**Konten privat** (invoice, dokumen KTP) disajikan lewat signed URL berumur pendek, bukan bucket publik.',
        '**Validasi upload**: batasi tipe dan ukuran, dan proses (resize, scan) secara asinkron setelah upload selesai.',
      ] },
      ...practice('sdp-traffic', [
        'Jalankan dua instance aplikasi di belakang nginx dengan konfigurasi di atas, lalu matikan satu dan amati traffic pindah.',
        'Pastikan aplikasi stateless: login di instance A, request berikutnya dilayani instance B tanpa logout.',
        'Pasang token bucket per API key yang membalas 429 + Retry-After, lalu uji dengan 50 request beruntun.',
        'Ubah upload gambar agar langsung ke object storage lewat presigned URL dan disajikan lewat CDN.',
      ]),
      ...quiz([
        ['SDP-12', 'Setelah menambah instance di belakang load balancer, user sering logout sendiri. Apa penyebabnya?', 'Sesi disimpan di memori masing-masing instance. Request berikutnya mendarat di instance lain yang tidak mengenal sesi itu. Perbaikannya membuat aplikasi stateless: simpan sesi di Redis/database atau pakai token. Sticky session hanya menunda masalah dan merusak pemerataan beban.'],
        ['SDP-13', 'Mengapa token bucket populer untuk API publik?', 'Token bucket mengizinkan burst wajar (sampai kapasitas bucket) sambil menjaga laju rata-rata, sesuai pola klien nyata yang mengirim beberapa request sekaligus lalu diam. Implementasinya ringan: cukup simpan jumlah token dan waktu pembaruan terakhir per key, lalu isi ulang secara malas saat request datang.'],
        ['SDP-14', 'Rate limit 100 request/menit dipasang di memori aplikasi yang berjalan 5 instance. Berapa limit efektifnya dan bagaimana memperbaikinya?', 'Hingga sekitar 500 request/menit, karena tiap instance menghitung sendiri. Untuk limit global, simpan counter atau bucket di penyimpanan bersama seperti Redis dengan operasi atomik (Lua script), atau pasang limit di API gateway yang berada di depan semua instance.'],
        ['SDP-15', 'Mengapa file aset sebaiknya diberi hash di namanya?', 'Nama yang berubah setiap isinya berubah membuat file aman di-cache sangat lama (`max-age` setahun, `immutable`) di browser dan CDN. Rilis baru otomatis memakai nama baru, jadi tidak perlu invalidasi CDN yang lambat, dan user tidak pernah menerima campuran file lama dan baru.'],
      ]),
      references(
        ['nginx: upstream module', 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html'],
        ['nginx: limit_req module', 'https://nginx.org/en/docs/http/ngx_http_limit_req_module.html'],
        ['MDN: Cache-Control', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control'],
        ['MDN: 429 Too Many Requests', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429'],
        ['Amazon S3: Uploading objects with presigned URLs', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html'],
      ),
    ],
  },
  {
    id: 'sdp-gagal-anggun',
    title: 'Gagal dengan Anggun: Retry + Backoff, Circuit Breaker & Idempotency Key',
    summary: 'Mengulang hanya yang aman diulang, berhenti memanggil layanan yang sakit, dan memastikan request ganda tidak menghasilkan efek ganda.',
    ...meta, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Di sistem terdistribusi, kegagalan sebagian adalah keadaan normal. Tiga baris ini bekerja sebagai satu paket: **retry** menangani gangguan sementara, **circuit breaker** mencegah retry memperparah layanan yang sedang sakit, dan **idempotency key** memastikan retry tidak menghasilkan efek ganda (tagihan dua kali, pesanan dobel).'),
      heading('Baris 8 · Gagal sementara → retry dengan backoff'),
      table(['Kondisi', 'Retry?', 'Alasan'], [
        ['Timeout, koneksi terputus, 502/503/504', 'Ya', 'Biasanya sementara'],
        ['429 Too Many Requests', 'Ya, setelah `Retry-After`', 'Server meminta menunggu'],
        ['400, 401, 403, 404, 422', 'Tidak', 'Mengulang tidak akan mengubah hasil'],
        ['POST tanpa idempotency key', 'Tidak', 'Bisa menghasilkan efek ganda'],
      ]),
      code('Retry.java', RETRY, 'java'),
      { type: 'list', items: [
        '**Jitter wajib**: tanpa jitter, ribuan klien yang gagal bersamaan juga me-retry bersamaan dan menghantam server yang baru pulih (*thundering herd*). Full jitter memilih jeda acak antara 0 dan batas eksponensial.',
        '**Timeout dulu**: retry tanpa timeout hanya menumpuk thread yang menunggu. Setiap panggilan jaringan butuh connect & read timeout.',
        '**Retry di satu lapisan saja**: bila gateway, service A, dan klien HTTP masing-masing mengulang 3 kali, satu kegagalan bisa menjadi 27 request.',
        '**Batasi total**: jumlah percobaan maksimal, batas jeda (`cap`), dan idealnya *retry budget* (mis. retry maksimal 10% dari total request).',
      ] },
      heading('Baris 10 · Satu layanan gagal → circuit breaker'),
      code('Tiga keadaan circuit breaker', `           gagal beruntun ≥ ambang
 CLOSED ───────────────────────────▶ OPEN ──── semua panggilan langsung fallback
   ▲                                   │        (gagal cepat, tanpa menunggu timeout)
   │ percobaan sukses                  │ setelah waktu tunggu
   │                                   ▼
   └───────────────────────────── HALF_OPEN ── satu panggilan percobaan
                                       │ percobaan gagal
                                       └──────▶ kembali OPEN`, 'text'),
      code('CircuitBreaker.java', CIRCUIT_BREAKER, 'java'),
      table(['Fallback', 'Contoh'], [
        ['Nilai dari cache', 'Rekomendasi produk dari cache kemarin'],
        ['Nilai default', 'Ongkir standar saat layanan ongkir mati'],
        ['Tunda dan proses nanti', 'Simpan pembayaran sebagai PENDING, proses ulang dari queue'],
        ['Matikan fitur', 'Sembunyikan widget ulasan, halaman produk tetap jalan'],
        ['Gagal cepat dengan pesan jelas', '503 + pesan "coba beberapa saat lagi", bukan menggantung 30 detik'],
      ]),
      paragraph('Di Spring Boot, pakai Resilience4j alih-alih menulis sendiri. Urutan default aspek Resilience4j adalah Retry membungkus CircuitBreaker, sehingga saat sirkuit terbuka, panggilan ditolak cepat tanpa menghabiskan jatah retry (asal `CallNotPermittedException` tidak termasuk exception yang di-retry).'),
      code('application.yml (Resilience4j)', `resilience4j:
  circuitbreaker:
    instances:
      payment:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 20
        minimum-number-of-calls: 10
        failure-rate-threshold: 50                 # % gagal yang membuka sirkuit
        slow-call-duration-threshold: 2s
        slow-call-rate-threshold: 50               # panggilan lambat juga dihitung "sakit"
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
  retry:
    instances:
      payment:
        max-attempts: 3
        wait-duration: 200ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions:
          - java.io.IOException
          - org.springframework.web.client.ResourceAccessException`, 'yaml'),
      code('PaymentClient.java (Spring Boot + Resilience4j)', `@Service
public class PaymentClient {
    private final RestClient restClient;

    PaymentClient(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://payment.internal").build();
    }

    @Retry(name = "payment")
    @CircuitBreaker(name = "payment", fallbackMethod = "markPending")
    public PaymentResult charge(ChargeRequest request, String idempotencyKey) {
        return restClient.post().uri("/charges")
                .header("Idempotency-Key", idempotencyKey)   // retry aman: gateway menolak tagihan ganda
                .body(request)
                .retrieve()
                .body(PaymentResult.class);
    }

    // Signature fallback = parameter yang sama + Throwable
    private PaymentResult markPending(ChargeRequest request, String idempotencyKey, Throwable cause) {
        return PaymentResult.pending(idempotencyKey);         // diproses ulang dari queue, kunci yang sama
    }
}`, 'java'),
      heading('Baris 11 · Request duplikat → idempotency key'),
      paragraph('Klien membuat satu key unik (UUID) **per operasi bisnis**, bukan per percobaan, dan mengirimnya di header `Idempotency-Key`. Server menyimpan key beserta hasilnya: request pertama dieksekusi, duplikatnya menerima hasil yang sama tanpa eksekusi ulang.'),
      code('IdempotencyService.java', IDEMPOTENCY, 'java'),
      code('idempotency_keys.sql', IDEMPOTENCY_SQL, 'sql'),
      table(['Situasi', 'Respons'], [
        ['Key baru', 'Eksekusi, simpan hasil, kembalikan hasil'],
        ['Key sama, isi sama, sudah selesai', 'Kembalikan hasil tersimpan (status code sama)'],
        ['Key sama, masih diproses', '409 Conflict; klien mencoba lagi sebentar lagi'],
        ['Key sama, isi berbeda', '422; ini bug di klien, jangan dieksekusi'],
        ['Eksekusi gagal sebelum selesai', 'Lepaskan klaim agar klien boleh mencoba lagi'],
      ]),
      callout('tip', 'Idempotensi juga untuk consumer dan agent', 'Pola yang sama melindungi consumer queue (key = id pesan) dan agent AI yang memanggil tool berisiko (key = `tool_use_id`), lihat [Human Approval](#llm.agent-human-approval).'),
      paragraph(`Pendalaman: ${sd('resilience-fault-tolerance', 'Resilience & Fault Tolerance')} dan [Studi Kasus: Design Sistem Pembayaran](#interview.sd-sistem-pembayaran).`),
      ...practice('sdp-gagal-anggun', [
        'Bungkus satu panggilan HTTP keluar dengan timeout + retry (hanya error sementara) + jitter.',
        'Pasang circuit breaker Resilience4j dan buktikan sirkuit terbuka saat dependency dimatikan, lalu pulih sendiri.',
        'Tambahkan header Idempotency-Key ke endpoint pembayaran dan kirim request yang sama 10 kali paralel: tagihan hanya satu.',
        'Hitung amplifikasi retry di arsitekturmu: berapa request yang tercipta dari satu kegagalan di lapisan terdalam?',
      ]),
      ...quiz([
        ['SDP-16', 'Mengapa retry tanpa jitter bisa membuat layanan yang baru pulih jatuh lagi?', 'Semua klien yang gagal pada saat yang sama akan me-retry pada jeda yang sama (100 ms, 200 ms, 400 ms...), sehingga beban datang dalam gelombang serentak tepat saat layanan baru pulih. Jitter menyebarkan retry secara acak dalam rentang jeda, meratakan beban.'],
        ['SDP-17', 'Gateway, service A, dan HTTP client masing-masing me-retry 3 kali. Apa risikonya?', 'Amplifikasi retry: satu kegagalan di lapisan terdalam bisa menjadi hingga 3 × 3 × 3 = 27 request, memperparah layanan yang sudah kelebihan beban. Retry sebaiknya hanya di satu lapisan (biasanya yang paling dekat ke dependency), dengan batas total dan circuit breaker.'],
        ['SDP-18', 'Apa yang dilakukan circuit breaker dalam keadaan HALF_OPEN?', 'Setelah waktu tunggu OPEN habis, breaker mengizinkan sejumlah kecil panggilan percobaan. Bila sukses, breaker kembali CLOSED dan traffic normal mengalir. Bila gagal, kembali OPEN dan waktu tunggu dimulai lagi. Ini mencegah layanan yang baru pulih langsung dibanjiri traffic penuh.'],
        ['SDP-19', 'Klien membuat Idempotency-Key baru di setiap percobaan retry. Apa masalahnya?', 'Server melihat setiap percobaan sebagai operasi baru, jadi perlindungan dari efek ganda hilang. Key harus dibuat sekali per operasi bisnis (mis. saat user menekan Bayar) dan dipakai ulang di semua retry operasi itu.'],
        ['SDP-20', 'Mengapa key yang sama dengan isi request berbeda harus ditolak?', 'Itu tanda bug atau penyalahgunaan di klien: key dipakai ulang untuk operasi lain. Mengembalikan hasil tersimpan akan memberi respons yang tidak sesuai request, sedangkan mengeksekusinya merusak jaminan idempotensi. Simpan hash isi request bersama key, lalu tolak dengan 422 bila berbeda.'],
      ]),
      references(
        ['AWS Builders\' Library: Timeouts, retries, and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'],
        ['Martin Fowler: CircuitBreaker', 'https://martinfowler.com/bliki/CircuitBreaker.html'],
        ['Resilience4j: CircuitBreaker', 'https://resilience4j.readme.io/docs/circuitbreaker'],
        ['Stripe: Idempotent requests', 'https://docs.stripe.com/api/idempotent_requests'],
        ['IETF draft: The Idempotency-Key HTTP Header Field', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/'],
      ),
    ],
  },
  {
    id: 'sdp-observability',
    title: 'Melihat yang Rusak: Logs, Metrics & Tracing',
    summary: 'Tiga sinyal observability dan kapan memakai masing-masing: log terstruktur berkorelasi, metrik RED/USE dengan histogram, distributed tracing OpenTelemetry, serta alert berbasis gejala.',
    ...meta, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Sebelas baris sebelumnya hanya bisa dipilih dan dibuktikan bila kamu bisa **melihat** sistemnya. Tiga sinyal saling melengkapi: **metrics** memberi tahu *ada* masalah, **tracing** memberi tahu *di mana*, dan **logs** memberi tahu *mengapa*.'),
      table(['Sinyal', 'Menjawab', 'Bentuk', 'Pemicu biaya', 'Contoh alat'], [
        ['Metrics', 'Apakah ada masalah? Seberapa besar?', 'Angka teragregasi per waktu', 'Kardinalitas label', 'Prometheus, Grafana, CloudWatch'],
        ['Tracing', 'Di layanan/langkah mana waktunya habis?', 'Pohon span per request', 'Volume trace (atasi dengan sampling)', 'OpenTelemetry, Jaeger, Tempo'],
        ['Logs', 'Apa yang terjadi persisnya?', 'Event terstruktur (JSON)', 'Volume baris log', 'Loki, Elasticsearch, CloudWatch Logs'],
      ]),
      code('Alur debug yang efisien', `Alert (metrik: error rate checkout > 2%)
   └──▶ Dashboard: endpoint & instance mana yang naik?
          └──▶ Trace contoh yang lambat/gagal: span mana yang merah?
                 └──▶ Log dengan trace_id yang sama: pesan error & konteksnya`, 'text'),
      heading('Logs: terstruktur dan berkorelasi'),
      code('Contoh bentuk satu baris log JSON', `{
  "@timestamp": "2026-11-05T08:15:42.120Z",
  "log.level": "ERROR",
  "service.name": "order-service",
  "message": "Pembayaran gagal setelah 3 percobaan",
  "trace.id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span.id": "00f067aa0ba902b7",
  "order.id": "A-100",
  "error.type": "java.net.SocketTimeoutException"
}`, 'json'),
      { type: 'list', items: [
        '**JSON, bukan kalimat bebas**: field bisa difilter dan diagregasi (`order.id = A-100`).',
        '**Trace id di setiap baris**: menghubungkan log dengan trace dan log layanan lain untuk request yang sama.',
        '**Level yang jujur**: ERROR untuk yang butuh tindakan; jangan ERROR untuk 404 biasa.',
        '**Jangan pernah log** password, token, nomor kartu, atau data pribadi utuh.',
      ] },
      heading('Metrics: RED, USE, dan histogram'),
      table(['Metode', 'Untuk', 'Metrik'], [
        ['RED', 'Layanan/endpoint', 'Rate (request/detik), Errors (rasio gagal), Duration (distribusi latensi)'],
        ['USE', 'Sumber daya (CPU, pool koneksi, disk, queue)', 'Utilization, Saturation (antrean), Errors'],
        ['Four golden signals', 'Ringkasan Google SRE', 'Latency, traffic, errors, saturation'],
      ]),
      code('PromQL untuk RED (metrik Micrometer/Spring Boot)', `# Rate: request per detik per endpoint
sum by (uri) (rate(http_server_requests_seconds_count[5m]))

# Errors: rasio respons 5xx
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_server_requests_seconds_count[5m]))

# Duration: p99 per endpoint (butuh histogram aktif)
histogram_quantile(0.99, sum by (le, uri) (rate(http_server_requests_seconds_bucket[5m])))`, 'text'),
      { type: 'list', items: [
        '**Persentil, bukan rata-rata**: rata-rata 80 ms bisa menyembunyikan 1% user yang menunggu 5 detik. Pantau p95 dan p99.',
        '**Histogram, bukan persentil per instance**: bucket histogram bisa dijumlahkan antar-instance; persentil yang sudah dihitung per instance tidak bisa.',
        '**Awas kardinalitas**: label `user_id` atau `order_id` menciptakan jutaan deret waktu dan meledakkan biaya. Label hanya untuk dimensi bernilai sedikit (endpoint, status, region).',
      ] },
      heading('Tracing: mengikuti satu request lintas layanan'),
      paragraph('Satu **trace** adalah perjalanan satu request; setiap langkah (panggilan HTTP, query DB, publish ke queue) adalah **span**. Konteks trace dibawa antar-layanan lewat header W3C `traceparent`, misalnya `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01` (versi, trace id, span induk, flag sampling).'),
      code('Instrumentasi tanpa ubah kode: OpenTelemetry Java agent', `curl -L -o opentelemetry-javaagent.jar \\
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

export OTEL_SERVICE_NAME=order-service
export OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
export OTEL_TRACES_SAMPLER=parentbased_traceidratio
export OTEL_TRACES_SAMPLER_ARG=0.1          # simpan 10% trace; keputusan mengikuti layanan pemanggil

java -javaagent:opentelemetry-javaagent.jar -jar order-service.jar`, 'bash'),
      code('application.yml: log JSON + metrik Prometheus (Spring Boot 3.4+)', `spring:
  application:
    name: order-service
logging:
  structured:
    format:
      console: ecs                          # log JSON format Elastic Common Schema
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus          # butuh dependency micrometer-registry-prometheus
  metrics:
    distribution:
      percentiles-histogram:
        "[http.server.requests]": true      # bucket histogram → p95/p99 bisa dihitung di Prometheus`, 'yaml'),
      heading('Alert berbasis gejala dan SLO'),
      { type: 'list', items: [
        '**Tetapkan SLO** dari sudut pandang user, mis. "99,9% request checkout sukses dan di bawah 500 ms dalam 30 hari".',
        '**Alert pada gejala** (error rate, latensi, SLO terbakar terlalu cepat), bukan pada penyebab (CPU 80%) yang belum tentu dirasakan user.',
        '**Setiap alert punya runbook**: apa artinya, dashboard mana yang dilihat, langkah mitigasi pertama.',
        '**Alert yang tidak ditindaklanjuti dihapus**: kebisingan membuat alert penting ikut diabaikan.',
      ] },
      paragraph(`Pendalaman: ${sd('observability', 'Observability')}, [Konsep Observability](#devops.konsep-observability), dan [OpenTelemetry & Distributed Tracing](#devops.opentelemetry-distributed-tracing).`),
      ...practice('sdp-observability', [
        'Ubah log aplikasimu menjadi JSON terstruktur yang memuat trace id di setiap baris.',
        'Buat dashboard RED untuk tiga endpoint terpenting: request/detik, rasio 5xx, dan p99.',
        'Pasang OpenTelemetry Java agent pada dua layanan yang saling memanggil dan temukan trace lintas keduanya.',
        'Tulis satu SLO dan satu alert berbasis gejala beserta runbook-nya.',
      ]),
      ...quiz([
        ['SDP-21', 'Mengapa latensi rata-rata menyesatkan?', 'Rata-rata menyembunyikan ekor distribusi. Bila 99% request 50 ms dan 1% request 5 detik, rata-ratanya sekitar 100 ms dan terlihat sehat, padahal ribuan user menunggu 5 detik. Pantau p95/p99 dari histogram untuk melihat pengalaman user yang paling lambat.'],
        ['SDP-22', 'Mengapa user_id tidak boleh menjadi label metrik?', 'Setiap kombinasi nilai label menjadi deret waktu terpisah. Jutaan user berarti jutaan deret waktu, sehingga memori dan biaya sistem metrik meledak dan query melambat. Detail per user milik log dan trace; label metrik hanya untuk dimensi bernilai sedikit seperti endpoint, status, dan region.'],
        ['SDP-23', 'Error rate checkout naik. Bagaimana tiga sinyal dipakai bersama untuk menemukan penyebabnya?', 'Metrik menunjukkan kapan dan di endpoint/instance mana error naik. Dari situ ambil trace contoh yang gagal untuk melihat span mana yang error atau lambat (mis. panggilan ke layanan pembayaran timeout). Terakhir, filter log dengan trace id yang sama untuk membaca pesan error dan konteks persisnya.'],
        ['SDP-24', 'Mengapa alert sebaiknya berdasarkan gejala, bukan penyebab seperti CPU 80%?', 'CPU tinggi belum tentu dirasakan user, sehingga alert penyebab sering bising dan diabaikan. Sebaliknya banyak masalah nyata (deadlock, dependency lambat) tidak menaikkan CPU sama sekali. Alert berbasis gejala (error rate, latensi, laju terbakarnya SLO) langsung mencerminkan dampak pada user.'],
      ]),
      references(
        ['Google SRE Book: Monitoring Distributed Systems', 'https://sre.google/sre-book/monitoring-distributed-systems/'],
        ['OpenTelemetry Java agent', 'https://opentelemetry.io/docs/zero-code/java/agent/'],
        ['W3C Trace Context', 'https://www.w3.org/TR/trace-context/'],
        ['Prometheus: Histograms and summaries', 'https://prometheus.io/docs/practices/histograms/'],
        ['Spring Boot: Structured logging', 'https://docs.spring.io/spring-boot/reference/features/logging.html#features.logging.structured'],
      ),
    ],
  },
];
