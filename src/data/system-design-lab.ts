import type { Block, Module } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

/**
 * Lab Flash Sale untuk track System Design dalam 12 Baris. Kode disalin apa adanya dari labs/flash-sale
 * (Spring Boot 4.1.2, PostgreSQL 17, Redis 8, RabbitMQ 4, nginx 1.29, Prometheus, Jaeger, k6) dan
 * output percobaan berasal dari run nyata pada 13 November 2026.
 */
const TRACK = 'System Design dalam 12 Baris';
const SOURCE = 'Lab Flash Sale: proyek labs/flash-sale, dijalankan dengan Docker Compose dan diuji beban dengan k6 (13 November 2026)';

export const systemDesignLabSource = SOURCE;

const COMPOSE = `name: flash-sale

services:
  nginx:                                   # Baris 3 (load balancer) + Baris 9 (rate limiting)
    image: nginx:1.29-alpine
    ports: ["8080:80"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      app1: { condition: service_healthy }
      app2: { condition: service_healthy }

  app1: &app
    build: .
    init: true                             # tini sebagai PID 1: teruskan SIGTERM, bersihkan proses zombie
    ports: ["8081:8080"]                   # akses langsung: tombol chaos & actuator
    environment: &app-env
      DB_PRIMARY_HOST: postgres-primary
      DB_REPLICA_HOST: postgres-replica
      REDIS_HOST: redis
      RABBITMQ_HOST: rabbitmq
      PAYMENT_BASE_URL: http://app1:8080   # payment gateway tiruan hidup di app1
      OTLP_TRACES_ENDPOINT: http://jaeger:4318/v1/traces
      MANAGEMENT_TRACING_SAMPLING_PROBABILITY: \${TRACE_SAMPLING:-1.0}   # TRACE_SAMPLING=0.1 untuk uji beban
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8080/actuator/health/readiness"]
      interval: 5s
      timeout: 3s
      retries: 40
    depends_on:
      postgres-replica: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }

  app2:
    <<: *app
    ports: []
    environment: *app-env

  postgres-primary:                        # Baris 6 (index) hidup di sini
    image: postgres:17
    environment:
      POSTGRES_DB: flashsale
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      REPLICATOR_PASSWORD: replicator
    command: postgres -c wal_level=replica -c max_wal_senders=5 -c max_replication_slots=5
    volumes:
      - ./postgres/primary-init.sh:/docker-entrypoint-initdb.d/01-replication.sh:ro
      - ./postgres/schema.sql:/docker-entrypoint-initdb.d/02-schema.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h localhost -U app -d flashsale"]
      interval: 3s
      timeout: 3s
      retries: 20

  postgres-replica:                        # Baris 4: streaming replication, hanya baca
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: app
      REPLICATOR_PASSWORD: replicator
      PRIMARY_HOST: postgres-primary
    entrypoint: ["/replica-entrypoint.sh"]
    volumes:
      - ./postgres/replica-entrypoint.sh:/replica-entrypoint.sh:ro
    depends_on:
      postgres-primary: { condition: service_healthy }
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h localhost -U app -d flashsale"]
      interval: 3s
      timeout: 3s
      retries: 30

  redis:                                   # Baris 1: cache bersama antar-instance
    image: redis:8-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 3s
      timeout: 3s
      retries: 10

  rabbitmq:                                # Baris 2: queue tahan crash + DLQ
    image: rabbitmq:4-management-alpine
    ports: ["15672:15672"]                 # UI: guest / guest
    healthcheck:
      # Lewat HTTP, bukan rabbitmq-diagnostics: CLI itu berjalan sebagai root dan, bila server belum
      # sempat membuat .erlang.cookie, ia membuatnya sebagai root → server gagal start (eacces).
      test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://guest:guest@localhost:15672/api/health/checks/local-alarms"]
      interval: 5s
      timeout: 5s
      retries: 30

  prometheus:                              # Baris 12: metrik
    image: prom/prometheus:v3.9.1
    ports: ["9090:9090"]
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro

  jaeger:                                  # Baris 12: trace (OTLP masuk di 4318)
    image: jaegertracing/jaeger:2.23.0
    ports: ["16686:16686"]

  k6:                                      # uji beban: docker compose run --rm k6
    image: grafana/k6:2.4.0
    profiles: ["load"]
    volumes:
      - ./load:/scripts:ro
    environment:
      BASE_URL: http://nginx
    command: run /scripts/k6.js`;
const NGINX = `events {}

http {
    # Baris 9: limit adil per user + pelindung kasar per IP. Request tanpa X-User-Id punya key kosong
    # dan tidak dihitung di zone per_user. Di produksi, key diambil dari API key/JWT, bukan header bebas.
    limit_req_zone $http_x_user_id     zone=per_user:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=per_ip:10m   rate=300r/s;
    limit_req_status 429;

    # Baris 3. Nama upstream tanpa underscore: Host "flash_sale" ditolak Tomcat dengan 400.
    upstream flashsale {
        least_conn;
        server app1:8080 max_fails=3 fail_timeout=10s;
        server app2:8080 max_fails=3 fail_timeout=10s;
        keepalive 64;
    }

    server {
        listen 80;

        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Request-Id $request_id;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 2s;
        proxy_read_timeout 10s;
        proxy_next_upstream error timeout http_502 http_503;   # POST yang sudah terkirim tidak diulang
        proxy_next_upstream_tries 2;
        add_header X-Upstream $upstream_addr always;           # instance mana yang menjawab

        location /orders {
            limit_req zone=per_user burst=10 nodelay;
            limit_req zone=per_ip burst=200 nodelay;
            proxy_pass http://flashsale;
        }

        location ~ ^/(internal|actuator)/ {
            return 404;                                        # endpoint internal tidak dibuka ke publik
        }

        location / {
            limit_req zone=per_ip burst=200 nodelay;
            proxy_pass http://flashsale;
        }
    }
}`;
const APP_YML = `spring:
  application:
    name: flash-sale
  cache:
    type: redis                                 # Baris 1: TTL & serializer di CacheConfig
    cache-names: products                       # dibuat saat startup → metriknya terdaftar
    redis:
      enable-statistics: true                   # metrik cache_gets_total{result="hit|miss"}
  data:
    redis:
      host: \${REDIS_HOST:localhost}
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    template:
      observation-enabled: true                 # Baris 12: trace ikut menyeberang lewat pesan
    listener:
      simple:
        observation-enabled: true
        default-requeue-rejected: false         # setelah retry habis → DLQ (lihat MessagingConfig)
        retry:
          enabled: true
          max-retries: 2                        # Boot 4: max-retries (bukan max-attempts) → total 3 percobaan
          initial-interval: 500ms
          multiplier: 2

app:
  datasource:
    primary:
      jdbc-url: jdbc:postgresql://\${DB_PRIMARY_HOST:localhost}:5432/flashsale
      username: app
      password: app
      maximum-pool-size: 10
    replica:
      jdbc-url: jdbc:postgresql://\${DB_REPLICA_HOST:localhost}:5432/flashsale
      username: app
      password: app
      maximum-pool-size: 10
      read-only: true
  payment:
    base-url: \${PAYMENT_BASE_URL:http://localhost:8080}

resilience4j:
  retry:
    instances:
      payment:
        max-attempts: 3
        wait-duration: 200ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        enable-randomized-wait: true            # jitter
        randomized-wait-factor: 0.5
        retry-exceptions:                       # hanya error sementara; CallNotPermittedException tidak di-retry
          - org.springframework.web.client.HttpServerErrorException
          - org.springframework.web.client.ResourceAccessException
  circuitbreaker:
    instances:
      payment:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 10
        minimum-number-of-calls: 5
        failure-rate-threshold: 50
        wait-duration-in-open-state: 20s
        permitted-number-of-calls-in-half-open-state: 2
        register-health-indicator: true

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,circuitbreakers,retries
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true                           # /actuator/health/readiness untuk healthcheck compose
  metrics:
    distribution:
      percentiles-histogram:
        "[http.server.requests]": true          # Baris 12: histogram → p99 dihitung di Prometheus
  tracing:
    sampling:
      probability: 1.0                          # lab: simpan semua trace; produksi biasanya 0.05–0.1
  opentelemetry:
    tracing:
      export:
        otlp:
          endpoint: \${OTLP_TRACES_ENDPOINT:http://localhost:4318/v1/traces}
  otlp:
    metrics:
      export:
        enabled: false                          # metrik lewat Prometheus, bukan OTLP

logging:
  structured:
    format:
      console: ecs                              # Baris 12: log JSON, trace.id ikut tercatat`;
const DATASOURCE = `package id.playbook.flashsale;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;

/** Baris 4: transaksi @Transactional(readOnly = true) memakai replica, sisanya primary. */
@Configuration
class DataSourceConfig {

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("app.datasource.primary")
    HikariDataSource primaryDataSource() {
        return new HikariDataSource();
    }

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("app.datasource.replica")
    HikariDataSource replicaDataSource() {
        return new HikariDataSource();
    }

    @Bean
    @Primary
    DataSource dataSource() {
        // Koneksi fisik baru diambil saat query pertama, setelah flag readOnly transaksi diketahui
        LazyConnectionDataSourceProxy proxy = new LazyConnectionDataSourceProxy(primaryDataSource());
        proxy.setReadOnlyDataSource(replicaDataSource());   // Spring Framework 6.1.2+
        return proxy;
    }
}`;
const CACHE_CONFIG = `package id.playbook.flashsale;

import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

/**
 * Baris 1: TTL 60 detik, nilai disimpan sebagai JSON bertipe (terbaca dari redis-cli).
 * Serializer bawaan memakai serialisasi Java, yang menolak record yang tidak Serializable.
 */
@Configuration
class CacheConfig {
    @Bean
    RedisCacheConfiguration productCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new JacksonJsonRedisSerializer<>(ProductService.Product.class)));
    }
}`;
const PRODUCT_SERVICE = `package id.playbook.flashsale;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    public record Product(long id, String name, long priceIdr, int stock) {}

    private final JdbcClient jdbc;

    ProductService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Baris 1: cache-aside. Hasil null (produk tidak ada) ikut di-cache. Tanpa sync = true: dengan
     * RedisCache bawaan (writer non-locking) flag itu tidak mengunci per key, jadi tidak mencegah stampede.
     * Baris 4: saat cache miss, query dijalankan di replica.
     */
    @Cacheable(cacheNames = "products")
    @Transactional(readOnly = true)
    public Product find(long id) {
        return jdbc.sql("SELECT id, name, price_idr, stock FROM products WHERE id = :id")
                .param("id", id)
                .query(Product.class)
                .optional()
                .orElse(null);
    }

    /** Setelah stok berubah: hapus key, jangan tulis nilai baru. */
    @CacheEvict(cacheNames = "products", key = "#id")
    public void evict(long id) {
    }
}`;
const ORDER_CONTROLLER = `package id.playbook.flashsale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
class OrderController {
    record CreateOrder(@Min(1) long productId, @Min(1) @Max(5) int qty) {}

    private final IdempotencyService idempotency;
    private final OrderRepository orders;
    private final RabbitTemplate rabbit;

    OrderController(IdempotencyService idempotency, OrderRepository orders, RabbitTemplate rabbit) {
        this.idempotency = idempotency;
        this.orders = orders;
        this.rabbit = rabbit;
    }

    /** Baris 2: terima cepat (202) lalu antre. Baris 11: Idempotency-Key per user. */
    @PostMapping(value = "/orders", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> create(@RequestHeader("X-User-Id") String userId,   // lab: di produksi diambil dari token
                                  @RequestHeader("Idempotency-Key") String key,
                                  @Valid @RequestBody CreateOrder body) {
        String hash = sha256(userId + "|" + body.productId() + "|" + body.qty());
        Optional<IdempotencyService.Stored> existing = idempotency.claim(userId, key, hash);
        if (existing.isPresent()) {
            IdempotencyService.Stored stored = existing.get();
            if (!stored.requestHash().equals(hash)) {
                return json(HttpStatus.UNPROCESSABLE_CONTENT, "{\\"error\\":\\"Idempotency-Key dipakai untuk request yang berbeda\\"}");
            }
            if (!"completed".equals(stored.status())) {
                return json(HttpStatus.CONFLICT, "{\\"error\\":\\"request yang sama masih diproses\\"}");
            }
            return json(HttpStatus.valueOf(stored.responseCode()), stored.responseBody());   // replay byte-identik
        }
        try {
            String orderId = UUID.randomUUID().toString();
            rabbit.convertAndSend(MessagingConfig.ORDERS_QUEUE,
                    new OrderMessage(orderId, userId, body.productId(), body.qty()));
            String response = "{\\"orderId\\":\\"" + orderId + "\\",\\"status\\":\\"QUEUED\\"}";
            idempotency.complete(userId, key, HttpStatus.ACCEPTED.value(), response);
            return json(HttpStatus.ACCEPTED, response);
        } catch (RuntimeException e) {
            idempotency.release(userId, key);
            throw e;
        }
    }

    /** Dibaca dari replica: tepat setelah 202 pesanan bisa belum terlihat (antrean + replication lag). */
    @GetMapping("/orders/{id}")
    ResponseEntity<Map<String, Object>> get(@PathVariable String id) {
        return orders.find(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Baris 6: "pesanan saya" dilayani index (user_id, created_at DESC). */
    @GetMapping("/users/{userId}/orders")
    List<Map<String, Object>> byUser(@PathVariable String userId) {
        return orders.recentByUser(userId);
    }

    private static ResponseEntity<String> json(HttpStatus status, String body) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}`;
const IDEMPOTENCY = `package id.playbook.flashsale;

import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Baris 11: key per user disimpan di database agar berlaku lintas instance aplikasi. */
@Service
public class IdempotencyService {
    public record Stored(String requestHash, String status, Integer responseCode, String responseBody) {}

    private final JdbcClient jdbc;

    IdempotencyService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Kosong = klaim berhasil (request pertama). Berisi = duplikat, lengkap dengan status dan respons lama. */
    @Transactional
    public Optional<Stored> claim(String userId, String key, String requestHash) {
        int inserted = jdbc.sql("""
                INSERT INTO idempotency_keys (user_id, key, request_hash)
                VALUES (:user, :key, :hash)
                ON CONFLICT (user_id, key) DO NOTHING
                """).param("user", userId).param("key", key).param("hash", requestHash).update();
        if (inserted == 1) {
            return Optional.empty();
        }
        return jdbc.sql("""
                SELECT request_hash, status, response_code, response_body
                FROM idempotency_keys WHERE user_id = :user AND key = :key
                """).param("user", userId).param("key", key).query(Stored.class).optional();
    }

    @Transactional
    public void complete(String userId, String key, int code, String body) {
        jdbc.sql("""
                UPDATE idempotency_keys
                SET status = 'completed', response_code = :code, response_body = :body
                WHERE user_id = :user AND key = :key
                """).param("code", code).param("body", body).param("user", userId).param("key", key).update();
    }

    /** Gagal sebelum selesai: lepaskan klaim agar klien boleh mencoba lagi dengan key yang sama. */
    @Transactional
    public void release(String userId, String key) {
        jdbc.sql("DELETE FROM idempotency_keys WHERE user_id = :user AND key = :key AND status = 'processing'")
                .param("user", userId).param("key", key).update();
    }
}`;
const ORDER_REPOSITORY = `package id.playbook.flashsale;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class OrderRepository {
    public record Reservation(String status, long amountIdr) {}

    private final JdbcClient jdbc;

    OrderRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Satu transaksi: tandai pesan, kurangi stok secara atomik, catat pesanan.
     * Kosong = pesan ini sudah pernah diproses (duplikat dari at-least-once delivery).
     */
    @Transactional
    public Optional<Reservation> reserve(OrderMessage m) {
        int first = jdbc.sql("INSERT INTO processed_messages (message_id) VALUES (:id) ON CONFLICT DO NOTHING")
                .param("id", m.orderId()).update();
        if (first == 0) {
            return Optional.empty();
        }
        // Stok tidak pernah minus: hanya berhasil bila stok >= qty, dan harga ikut dibaca dari primary
        Optional<Long> price = jdbc.sql("""
                UPDATE products SET stock = stock - :qty
                WHERE id = :id AND stock >= :qty
                RETURNING price_idr
                """).param("qty", m.qty()).param("id", m.productId()).query(Long.class).optional();
        String status = price.isPresent() ? "PENDING_PAYMENT" : "REJECTED_OUT_OF_STOCK";
        long amount = price.orElse(0L) * m.qty();
        jdbc.sql("""
                INSERT INTO orders (id, user_id, product_id, qty, amount_idr, status)
                VALUES (:id, :user, :product, :qty, :amount, :status)
                """).param("id", m.orderId()).param("user", m.userId()).param("product", m.productId())
                .param("qty", m.qty()).param("amount", amount).param("status", status).update();
        return Optional.of(new Reservation(status, amount));
    }

    @Transactional
    public void updateStatus(String orderId, String status) {
        jdbc.sql("UPDATE orders SET status = :status WHERE id = :id").param("status", status).param("id", orderId).update();
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> find(String orderId) {
        return jdbc.sql("SELECT id, user_id, product_id, qty, amount_idr, status, created_at FROM orders WHERE id = :id")
                .param("id", orderId).query().listOfRows().stream().findFirst();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> recentByUser(String userId) {
        return jdbc.sql("""
                SELECT id, product_id, qty, status, created_at FROM orders
                WHERE user_id = :user ORDER BY created_at DESC LIMIT 20
                """).param("user", userId).query().listOfRows();
    }
}`;
const ORDER_WORKER = `package id.playbook.flashsale;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/** Baris 2: worker menguras antrean dengan laju yang sanggup ditangani DB. */
@Component
class OrderWorker {
    private static final Logger log = LoggerFactory.getLogger(OrderWorker.class);

    private final OrderRepository orders;
    private final ProductService products;
    private final PaymentClient payment;

    OrderWorker(OrderRepository orders, ProductService products, PaymentClient payment) {
        this.orders = orders;
        this.products = products;
        this.payment = payment;
    }

    @RabbitListener(queues = MessagingConfig.ORDERS_QUEUE, concurrency = "2-4")
    void handle(OrderMessage m) {
        Optional<OrderRepository.Reservation> reservation = orders.reserve(m);   // transaksi DB selesai di sini
        if (reservation.isEmpty()) {
            log.info("pesan {} sudah pernah diproses, dilewati", m.orderId());
            return;
        }
        if (!"PENDING_PAYMENT".equals(reservation.get().status())) {
            log.info("order {} ditolak: stok habis", m.orderId());
            return;
        }
        products.evict(m.productId());   // Baris 1: stok berubah → hapus cache
        // Panggilan jaringan di LUAR transaksi DB, agar koneksi tidak tertahan selama retry
        PaymentClient.Result result = payment.charge(m.orderId(), reservation.get().amountIdr());
        orders.updateStatus(m.orderId(), result.status());
        log.info("order {} → {}", m.orderId(), result.status());
    }
}`;
const MESSAGING = `package id.playbook.flashsale;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MessagingConfig {
    static final String ORDERS_QUEUE = "orders";
    static final String ORDERS_DLQ = "orders.dlq";

    @Bean
    Queue ordersQueue() {
        // Pesan yang ditolak setelah retry habis pindah ke DLQ, bukan hilang dan bukan berputar selamanya
        return QueueBuilder.durable(ORDERS_QUEUE)
                .deadLetterExchange("")
                .deadLetterRoutingKey(ORDERS_DLQ)
                .build();
    }

    @Bean
    Queue ordersDeadLetterQueue() {
        return QueueBuilder.durable(ORDERS_DLQ).build();
    }

    @Bean
    MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}`;
const PAYMENT_CLIENT = `package id.playbook.flashsale;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Baris 8 (retry + backoff) dan Baris 10 (circuit breaker) di depan layanan pembayaran. */
@Component
public class PaymentClient {
    public record Result(String status) {}

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);
    private final RestClient restClient;

    PaymentClient(RestClient.Builder builder, @Value("\${app.payment.base-url}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    // Urutan aspek: Retry( CircuitBreaker( charge ) ). Fallback dipasang di aspek TERLUAR (@Retry):
    // fallback di @CircuitBreaker akan menelan exception sebelum Retry sempat mengulang.
    @Retry(name = "payment", fallbackMethod = "markPending")
    @CircuitBreaker(name = "payment")
    public Result charge(String orderId, long amountIdr) {
        return restClient.post().uri("/internal/payments")
                .header("Idempotency-Key", orderId)            // Baris 11: retry aman, gateway tidak menagih dua kali
                .body(Map.of("orderId", orderId, "amountIdr", amountIdr))
                .retrieve()
                .body(Result.class);
    }

    Result markPending(String orderId, long amountIdr, Throwable cause) {
        log.warn("pembayaran {} ditunda: {}", orderId, cause.toString());
        return new Result("PENDING_PAYMENT");                  // diproses ulang nanti, bukan error ke user
    }
}`;
const SCHEMA = `CREATE TABLE products (
    id        BIGSERIAL PRIMARY KEY,
    name      TEXT   NOT NULL,
    price_idr BIGINT NOT NULL,
    stock     INT    NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
    id         TEXT PRIMARY KEY,
    user_id    TEXT        NOT NULL,
    product_id BIGINT      NOT NULL REFERENCES products (id),
    qty        INT         NOT NULL,
    amount_idr BIGINT      NOT NULL,
    status     TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Baris 6: "pesanan saya" = user_id (=) lalu created_at (ORDER BY)
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Baris 11. response_body TEXT, bukan JSONB: JSONB menormalkan spasi & urutan key,
-- sehingga respons replay tidak lagi byte-identik dengan respons pertama.
CREATE TABLE idempotency_keys (
    user_id       TEXT        NOT NULL,
    key           TEXT        NOT NULL,
    request_hash  TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'processing',
    response_code INT,
    response_body TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
);

-- Baris 2: consumer idempoten (at-least-once delivery)
CREATE TABLE processed_messages (
    message_id   TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO products (name, price_idr, stock) VALUES
    ('Headset Flash Sale', 199000, 50),
    ('Keyboard Mekanik',   850000, 20),
    ('Monitor 27 inci',  3200000, 5);`;
const POM = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.2</version>
    <relativePath/>
  </parent>

  <groupId>id.playbook</groupId>
  <artifactId>flash-sale</artifactId>
  <version>0.1.0</version>
  <name>flash-sale</name>
  <description>Lab System Design dalam 12 Baris: layanan flash sale</description>

  <properties>
    <java.version>17</java.version>
    <resilience4j.version>2.4.0</resilience4j.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-restclient</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-aspectj</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-opentelemetry</artifactId>
    </dependency>
    <dependency>
      <groupId>io.github.resilience4j</groupId>
      <artifactId>resilience4j-spring-boot4</artifactId>
      <version>\${resilience4j.version}</version>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>`;
const DOCKERFILE = `FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;
const DOCKERIGNORE = `target/
load/`;
const APP_MAIN = `package id.playbook.flashsale;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class FlashSaleApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlashSaleApplication.class, args);
    }
}`;
const PRODUCT_CONTROLLER = `package id.playbook.flashsale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductController {
    private final ProductService products;

    ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping("/products/{id}")
    ResponseEntity<ProductService.Product> get(@PathVariable long id) {
        ProductService.Product product = products.find(id);
        return product == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(product);
    }
}`;
const ORDER_MESSAGE = `package id.playbook.flashsale;

public record OrderMessage(String orderId, String userId, long productId, int qty) {}`;
const PAYMENT_STUB = `package id.playbook.flashsale;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Payment gateway tiruan dengan tombol chaos, agar retry dan circuit breaker bisa diamati. */
@RestController
class PaymentStubController {
    private final AtomicReference<Double> failureRate = new AtomicReference<>(0.0);
    private final Map<String, Map<String, Object>> charges = new ConcurrentHashMap<>();
    private final AtomicLong calls = new AtomicLong();
    private final AtomicLong failures = new AtomicLong();

    @PostMapping("/internal/payments")
    ResponseEntity<Map<String, Object>> charge(@RequestHeader("Idempotency-Key") String key,
                                               @RequestBody Map<String, Object> body) {
        calls.incrementAndGet();
        Map<String, Object> existing = charges.get(key);
        if (existing != null) {
            return ResponseEntity.ok(existing);                          // tagihan yang sama tidak diproses dua kali
        }
        if (ThreadLocalRandom.current().nextDouble() < failureRate.get()) {
            failures.incrementAndGet();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("status", "ERROR"));
        }
        Map<String, Object> result = Map.of("status", "PAID", "orderId", body.get("orderId"));
        charges.put(key, result);
        return ResponseEntity.ok(result);
    }

    /** PUT /internal/payments/chaos?failureRate=1.0 → semua tagihan gagal; 0 → pulih. */
    @PutMapping("/internal/payments/chaos")
    Map<String, Object> chaos(@RequestParam double failureRate) {
        this.failureRate.set(Math.max(0, Math.min(1, failureRate)));
        return stats();
    }

    @GetMapping("/internal/payments/stats")
    Map<String, Object> stats() {
        return Map.of("failureRate", failureRate.get(), "calls", calls.get(), "failures", failures.get(),
                "charged", charges.size());
    }
}`;
const OBSERVABILITY = `package id.playbook.flashsale;

import io.micrometer.observation.ObservationPredicate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.observation.ServerRequestObservationContext;

/** Baris 12: scrape Prometheus & healthcheck bukan traffic user, jadi tidak dijadikan trace maupun metrik HTTP. */
@Configuration
class ObservabilityConfig {
    @Bean
    ObservationPredicate ignoreActuator() {
        return (name, context) -> !(context instanceof ServerRequestObservationContext request
                && request.getCarrier().getRequestURI().startsWith("/actuator"));
    }
}`;
const PRIMARY_INIT = `#!/bin/bash
set -e
# Role khusus replikasi + izin koneksi replikasi dari jaringan compose
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<SQL
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD '\${REPLICATOR_PASSWORD}';
SQL
echo "host replication replicator all scram-sha-256" >> "$PGDATA/pg_hba.conf"`;
const REPLICA_ENTRY = `#!/bin/bash
set -e
# Replica dibangun dari salinan primary (pg_basebackup), lalu mengikuti WAL secara streaming.
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  until PGPASSWORD="$REPLICATOR_PASSWORD" pg_isready -h "$PRIMARY_HOST" -U replicator -d postgres; do
    echo "menunggu primary..."; sleep 2
  done
  chown postgres:postgres "$PGDATA"
  until PGPASSWORD="$REPLICATOR_PASSWORD" gosu postgres pg_basebackup \\
        -h "$PRIMARY_HOST" -U replicator -D "$PGDATA" -R -X stream -C -S replica1; do
    echo "pg_basebackup belum bisa, coba lagi..."; rm -rf "\${PGDATA:?}"/*; sleep 2
  done
  chmod 700 "$PGDATA"
fi
exec docker-entrypoint.sh postgres`;
const PROMETHEUS = `global:
  scrape_interval: 5s

scrape_configs:
  - job_name: flash-sale                 # metrik HTTP, cache, circuit breaker, JVM
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ["app1:8080", "app2:8080"]

  - job_name: rabbitmq                   # panjang antrean per queue (Baris 2)
    metrics_path: /metrics/per-object
    static_configs:
      - targets: ["rabbitmq:15692"]`;
const ORDER_SH = `#!/usr/bin/env bash
# Kirim satu pesanan. Pemakaian: scripts/order.sh <user> <productId> [qty] [idempotency-key]
USER_ID=\${1:-user-1}
PRODUCT=\${2:-1}
QTY=\${3:-1}
KEY=\${4:-lab-$(date +%s)-$RANDOM}
curl -s -w ' HTTP %{http_code}\\n' -X POST http://localhost:8080/orders \\
  -H 'Content-Type: application/json' \\
  -H "X-User-Id: $USER_ID" \\
  -H "Idempotency-Key: $KEY" \\
  -d "{\\"productId\\":$PRODUCT,\\"qty\\":$QTY}"`;
const RESET_SH = `#!/usr/bin/env bash
# Kembalikan data ke kondisi awal tanpa membangun ulang container.
set -e
docker compose exec -T postgres-primary psql -q -U app -d flashsale -c "
  TRUNCATE orders, processed_messages, idempotency_keys;
  UPDATE products SET stock = CASE id WHEN 1 THEN 50 WHEN 2 THEN 20 ELSE 5 END;"
docker compose exec -T redis redis-cli FLUSHALL > /dev/null
curl -s -X PUT 'http://localhost:8081/internal/payments/chaos?failureRate=0' > /dev/null
echo "data direset: stok 50/20/5, cache kosong, payment normal"`;
const SPAM_SH = `#!/usr/bin/env bash
# Baris 9: kirim N pesanan SERENTAK dari satu user (satu proses curl --parallel), lalu hitung kode respons.
# Pemakaian: scripts/spam.sh [jumlah] [user]
N=\${1:-30}
USER_ID=\${2:-spammer}
args=()
for i in $(seq 1 "$N"); do
  [ "$i" -gt 1 ] && args+=(--next)
  args+=(-s -o /dev/null -w '%{http_code}\\n' -X POST http://localhost:8080/orders
         -H 'Content-Type: application/json' -H "X-User-Id: $USER_ID"
         -H "Idempotency-Key: $USER_ID-$i-$RANDOM" -d '{"productId":1,"qty":1}')
done
curl --parallel --parallel-max "$N" "\${args[@]}" | sort | uniq -c`;
const CHAOS_SH = `#!/usr/bin/env bash
# Baris 8 + 10: buat payment gateway gagal total, kirim 8 pesanan, lalu lihat retry dan circuit breaker.
# Pemakaian: scripts/chaos-payment.sh [failureRate]   (default 1 = semua tagihan gagal)
RATE=\${1:-1}
curl -s -X PUT "http://localhost:8081/internal/payments/chaos?failureRate=$RATE" > /dev/null
for i in $(seq 1 8); do bash scripts/order.sh "chaos-$i" 2 > /dev/null; done
sleep 10
echo "gateway      : $(curl -s http://localhost:8081/internal/payments/stats)"
echo "status order : $(docker compose exec -T postgres-primary psql -U app -d flashsale -Atc \\
  "SELECT string_agg(status || '=' || n, ', ') FROM (SELECT status, count(*) n FROM orders
   WHERE user_id LIKE 'chaos-%' GROUP BY status) s")"
for app in app1 app2; do
  state=$(docker compose exec -T "$app" curl -s localhost:8080/actuator/circuitbreakers | grep -o '"state":"[A-Z_]*"')
  retry=$(docker compose exec -T "$app" curl -s localhost:8080/actuator/prometheus \\
    | grep '^resilience4j_retry_calls_total' | sed -E 's/.*kind="([a-z_]+)".* ([0-9.]+)$/\\1=\\2/' | tr '\\n' ' ')
  echo "$app circuit  : $state | retry: $retry"
done`;
const INDEX_SQL = `-- Baris 6. Jalankan: docker compose exec -T postgres-primary psql -U app -d flashsale < scripts/index-demo.sql

-- 1) 300.000 pesanan lama dari 20.000 user, agar efek index terlihat
INSERT INTO orders (id, user_id, product_id, qty, amount_idr, status, created_at)
SELECT gen_random_uuid()::text, 'arsip-' || (g % 20000), 1 + g % 3, 1, 199000, 'ARCHIVED',
       now() - make_interval(secs => g)
FROM generate_series(1, 300000) AS g;
ANALYZE orders;

-- 2) "Pesanan saya" dengan index (user_id, created_at DESC) dari schema.sql
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, product_id, qty, status, created_at FROM orders
WHERE user_id = 'arsip-42' ORDER BY created_at DESC LIMIT 20;

-- 3) Query yang sama tanpa index
DROP INDEX idx_orders_user_created;
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, product_id, qty, status, created_at FROM orders
WHERE user_id = 'arsip-42' ORDER BY created_at DESC LIMIT 20;

-- 4) Pasang kembali tanpa mengunci tulis
CREATE INDEX CONCURRENTLY idx_orders_user_created ON orders (user_id, created_at DESC);`;
const K6 = `// Jalankan: docker compose run --rm k6
import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: {
    browse: {                       // Baris 1/3/4: baca berat, dilayani cache di dua instance
      executor: 'constant-arrival-rate', rate: 30, timeUnit: '1s', duration: '60s',
      preAllocatedVUs: 20, exec: 'browse',
    },
    flash_sale: {                   // Baris 2/11: lonjakan checkout 10 detik, setiap klien me-retry sekali
      executor: 'ramping-arrival-rate', startRate: 2, timeUnit: '1s', preAllocatedVUs: 60, exec: 'checkout',
      stages: [{ target: 2, duration: '20s' }, { target: 40, duration: '10s' }, { target: 2, duration: '30s' }],
    },
    abuser: {                       // Baris 9: satu user mengirim 30 request/detik
      executor: 'constant-arrival-rate', rate: 30, timeUnit: '1s', duration: '20s', startTime: '20s',
      preAllocatedVUs: 10, exec: 'abuse',
    },
  },
  thresholds: {
    'http_req_duration{scenario:browse}': ['p(95)<200'],
    'http_req_failed{scenario:browse}': ['rate<0.01'],
    'checks{scenario:flash_sale}': ['rate>0.99'],
    'checks{scenario:abuser}': ['rate>0.7'],
  },
};

export function browse() {
  const res = http.get(\`\${BASE}/products/\${1 + Math.floor(Math.random() * 3)}\`);
  check(res, { 'produk 200': (r) => r.status === 200 });
}

export function checkout() {
  const params = {
    headers: {
      ...JSON_HEADERS,
      'X-User-Id': \`user-\${__VU}-\${__ITER}\`,
      'Idempotency-Key': \`\${__VU}-\${__ITER}-\${Date.now()}\`,
    },
  };
  const body = JSON.stringify({ productId: 1 + Math.floor(Math.random() * 3), qty: 1 });
  const first = http.post(\`\${BASE}/orders\`, body, params);
  const retry = http.post(\`\${BASE}/orders\`, body, params);   // klien me-retry dengan key yang sama
  check(first, { 'order diterima 202': (r) => r.status === 202 });
  check(retry, { 'retry = replay pesanan yang sama': (r) => r.status === 202 && r.body === first.body });
}

export function abuse() {
  const params = { headers: { ...JSON_HEADERS, 'X-User-Id': 'bot-1', 'Idempotency-Key': \`bot-\${__ITER}-\${Date.now()}\` } };
  const res = http.post(\`\${BASE}/orders\`, JSON.stringify({ productId: 1, qty: 1 }), params);
  check(res, { 'bot dibatasi 429': (r) => r.status === 429 });
}`;

const meta = { track: TRACK, source: SOURCE };

const labBlocks: Block[] = [
  paragraph('Setiap baris sudah dipelajari sendiri-sendiri. Di produksi, baris-baris itu berjalan bersamaan dan saling memengaruhi: cache diisi ulang dari replica yang tertinggal, retry bertemu idempotency key, pesan yang dikirim ulang bertemu consumer, aplikasi yang lambat bertemu health check load balancer. Lab ini menjalankan sepuluh dari dua belas baris dalam satu layanan **flash sale**, lalu membuktikan masing-masing dengan percobaan yang bisa kamu ulang.'),
  code('Arsitektur lab', `Klien / k6 ──▶ nginx :8080      Baris 3 load balancer (least_conn) · Baris 9 rate limit
                  │
          ┌───────┴────────┐
          ▼                ▼
       app1 :8081        app2           Spring Boot 4.1.2 · Java 21 · dua instance identik
          │
          ├─ Baris 1  GET /products/{id} ──▶ Redis (cache-aside, TTL 60 s)
          ├─ Baris 4  transaksi readOnly ──▶ PostgreSQL replica ◀── streaming ── primary (Baris 6 index)
          ├─ Baris 2  POST /orders → 202 ──▶ RabbitMQ "orders" ──▶ worker di kedua app ──▶ "orders.dlq"
          ├─ Baris 11 Idempotency-Key per user (tabel idempotency_keys) + consumer idempoten
          └─ Baris 8/10 worker ──▶ payment gateway tiruan (retry + circuit breaker, tombol chaos)

Baris 12: log JSON (ECS) · Prometheus :9090 (metrik) · Jaeger :16686 (trace OpenTelemetry)`, 'text'),
  table(['Baris', 'Di lab', 'Dibuktikan di'], [
    ['1 · Cache', '`ProductService` + `CacheConfig` (Redis, JSON, TTL 60 s)', 'Percobaan 2'],
    ['2 · Queue', '`POST /orders` → RabbitMQ → `OrderWorker`, DLQ', 'Percobaan 4'],
    ['3 · Load balancer', 'nginx `least_conn` ke app1 & app2', 'Percobaan 1'],
    ['4 · Read replica', '`LazyConnectionDataSourceProxy.setReadOnlyDataSource`', 'Percobaan 3'],
    ['5 · Sharding', 'Tidak dipasang: satu primary cukup untuk beban lab', '[Beban Tulis](#distributed.sdp-beban-tulis)'],
    ['6 · Index', '`idx_orders_user_created` di `schema.sql`', 'Percobaan 5'],
    ['7 · Object storage + CDN', 'Tidak dipasang: lab tidak menyajikan file', '[Traffic Besar](#distributed.sdp-traffic)'],
    ['8 · Retry + backoff', 'Resilience4j `@Retry` dengan jitter', '[Uji Beban & Chaos](#distributed.sdp-lab-uji-beban)'],
    ['9 · Rate limiting', 'nginx `limit_req` per user + per IP', 'Percobaan 6'],
    ['10 · Circuit breaker', 'Resilience4j `@CircuitBreaker`', '[Uji Beban & Chaos](#distributed.sdp-lab-uji-beban)'],
    ['11 · Idempotency key', 'Header `Idempotency-Key`, tabel `idempotency_keys`', 'Percobaan 4'],
    ['12 · Observability', 'ECS log, Prometheus, Jaeger', '[Uji Beban & Chaos](#distributed.sdp-lab-uji-beban)'],
  ]),
  heading('Menyiapkan lab'),
  { type: 'steps', items: [
    { title: 'Prasyarat', text: 'Docker Desktop atau Docker Engine dengan Compose v2, sekitar 4 GB RAM kosong, dan shell bash (Git Bash atau WSL di Windows). JDK lokal tidak perlu karena aplikasi di-build di dalam Docker.' },
    { title: 'Ambil kode', text: 'Semua file ada di folder `labs/flash-sale` di repositori playbook ini, dan isinya ditampilkan lengkap di bawah.' },
    { title: 'Jalankan', text: '`docker compose up -d --build`. Build pertama butuh 5–10 menit untuk mengunduh dependensi Maven. Tunggu sampai `docker compose ps` menampilkan app1 dan app2 `(healthy)`.' },
    { title: 'Bersihkan', text: '`docker compose down -v` menghapus container, jaringan, dan volume data lab.' },
  ] },
  table(['URL', 'Isi'], [
    ['`http://localhost:8080`', 'API lewat nginx: `/products/{id}`, `/orders`, `/orders/{id}`, `/users/{id}/orders`'],
    ['`http://localhost:8081/actuator`', 'Actuator app1 (health, prometheus, circuitbreakers, retries) dan tombol chaos `/internal/payments/...`'],
    ['`http://localhost:15672`', 'RabbitMQ management (guest / guest)'],
    ['`http://localhost:9090`', 'Prometheus'],
    ['`http://localhost:16686`', 'Jaeger UI'],
  ]),
  callout('info', 'Endpoint internal tidak lewat nginx', 'nginx membalas 404 untuk `/internal/` dan `/actuator/`. Tombol chaos dan metrik hanya bisa diakses langsung di app1 (`:8081`) atau dari dalam jaringan Compose, seperti yang semestinya terjadi di produksi.'),
  heading('Kode inti per baris'),
  code('docker-compose.yml', COMPOSE, 'yaml'),
  code('nginx/nginx.conf', NGINX, 'text'),
  code('src/main/resources/application.yml', APP_YML, 'yaml'),
  code('postgres/schema.sql', SCHEMA, 'sql'),
  code('DataSourceConfig.java (Baris 4)', DATASOURCE, 'java'),
  code('CacheConfig.java (Baris 1)', CACHE_CONFIG, 'java'),
  code('ProductService.java (Baris 1 + 4)', PRODUCT_SERVICE, 'java'),
  code('OrderController.java (Baris 2 + 11)', ORDER_CONTROLLER, 'java'),
  code('IdempotencyService.java (Baris 11)', IDEMPOTENCY, 'java'),
  code('OrderRepository.java (stok atomik, consumer idempoten)', ORDER_REPOSITORY, 'java'),
  code('OrderWorker.java (Baris 2)', ORDER_WORKER, 'java'),
  code('MessagingConfig.java (queue + DLQ)', MESSAGING, 'java'),
  code('PaymentClient.java (Baris 8 + 10)', PAYMENT_CLIENT, 'java'),
  { type: 'details', summary: 'File pendukung: pom.xml, Dockerfile, skrip Postgres, Prometheus, controller, dan skrip percobaan', blocks: [
    code('pom.xml', POM, 'xml'),
    code('Dockerfile', DOCKERFILE, 'docker'),
    code('.dockerignore', DOCKERIGNORE, 'text'),
    code('postgres/primary-init.sh', PRIMARY_INIT, 'bash'),
    code('postgres/replica-entrypoint.sh', REPLICA_ENTRY, 'bash'),
    code('prometheus/prometheus.yml', PROMETHEUS, 'yaml'),
    code('FlashSaleApplication.java', APP_MAIN, 'java'),
    code('ProductController.java', PRODUCT_CONTROLLER, 'java'),
    code('OrderMessage.java', ORDER_MESSAGE, 'java'),
    code('PaymentStubController.java', PAYMENT_STUB, 'java'),
    code('ObservabilityConfig.java', OBSERVABILITY, 'java'),
    code('scripts/order.sh', ORDER_SH, 'bash'),
    code('scripts/reset-data.sh', RESET_SH, 'bash'),
    code('scripts/spam.sh', SPAM_SH, 'bash'),
    code('scripts/index-demo.sql', INDEX_SQL, 'sql'),
  ] },
  heading('Percobaan 1 · Load balancer membagi traffic (Baris 3)'),
  code('Header X-Upstream menunjukkan instance yang menjawab', `$ for i in 1 2 3 4; do curl -s -o /dev/null -D - localhost:8080/products/1 | grep -i x-upstream; done
X-Upstream: 172.23.0.9:8080
X-Upstream: 172.23.0.8:8080
X-Upstream: 172.23.0.9:8080
X-Upstream: 172.23.0.8:8080`, 'bash'),
  heading('Percobaan 2 · Cache-aside di Redis (Baris 1)'),
  code('Nilai cache berbentuk JSON, punya TTL, dan hasil 404 ikut di-cache', `$ curl -s localhost:8080/products/1
{"id":1,"name":"Headset Flash Sale","priceIdr":199000,"stock":50}
$ docker compose exec redis redis-cli GET products::1
{"id":1,"name":"Headset Flash Sale","priceIdr":199000,"stock":50}
$ docker compose exec redis redis-cli TTL products::1
38
$ curl -s -o /dev/null -w "%{http_code}\\n" localhost:8080/products/999
404
$ docker compose exec redis redis-cli --scan
products::1
products::999`, 'bash'),
  paragraph('Produk yang tidak ada juga di-cache. Tanpa itu, request ke ID palsu selalu tembus ke database. Setelah pesanan diproses, worker menghapus key produk itu sehingga stok berikutnya dibaca ulang dari database.'),
  heading('Percobaan 3 · Replication lag terlihat oleh user (Baris 4)'),
  code('Jeda replay di replica, lalu baca pesanan yang baru dibuat', `$ docker compose exec postgres-replica psql -U app -d flashsale -c "SELECT pg_wal_replay_pause();"
$ bash scripts/order.sh u-lag 2
{"orderId":"51483cfd-2116-447a-a63e-48ba0b7c4036","status":"QUEUED"} HTTP 202
$ curl -s -o /dev/null -w "%{http_code}\\n" localhost:8080/orders/$ORDER
404                                   ← dibaca dari replica yang tertinggal
$ docker compose exec postgres-primary psql -U app -d flashsale -Atc "SELECT status FROM orders WHERE id = '$ORDER'"
PAID                                  ← di primary pesanan sudah lunas
$ docker compose exec postgres-replica psql -U app -d flashsale -c "SELECT pg_wal_replay_resume();"
$ curl -s localhost:8080/orders/$ORDER
{"id":"51483cfd-...","user_id":"u-lag","product_id":2,"qty":1,"amount_idr":850000,"status":"PAID",...}`, 'bash'),
  paragraph('Inilah bentuk nyata replication lag: transaksi `readOnly` benar-benar diarahkan ke replica, dan selama replica tertinggal, user tidak melihat pesanannya sendiri. Di produksi, lag biasanya milidetik sampai detik. Data yang baru ditulis oleh user yang sama sebaiknya dibaca dari primary (read-your-writes).'),
  callout('warn', 'Mengukur lag dengan benar', '`now() - pg_last_xact_replay_timestamp()` di replica menunjukkan sekitar 10 menit pada percobaan ini, padahal replica tidak tertinggal sejauh itu. Nilainya ikut naik ketika primary sepi, karena tidak ada transaksi baru untuk diputar ulang. Pantau `replay_lag` di `pg_stat_replication` pada primary, atau bandingkan LSN.'),
  heading('Percobaan 4 · Idempotency, queue, DLQ, dan pesan duplikat (Baris 2 + 11)'),
  code('Retry dengan key yang sama menghasilkan respons yang identik byte per byte', `$ bash scripts/order.sh u-1 1 2 kunci-1    # pertama
{"orderId":"b27b0a51-8f29-43b8-985d-7b1cb0da4cff","status":"QUEUED"} HTTP 202
$ bash scripts/order.sh u-1 1 2 kunci-1    # retry, key sama
{"orderId":"b27b0a51-8f29-43b8-985d-7b1cb0da4cff","status":"QUEUED"} HTTP 202
$ bash scripts/order.sh u-1 1 3 kunci-1    # key sama, isi beda
{"error":"Idempotency-Key dipakai untuk request yang berbeda"} HTTP 422
$ bash scripts/order.sh u-2 1 2 kunci-1    # key sama, user lain → pesanan baru
{"orderId":"8b659b21-8bda-48d8-a735-3381529fbcb1","status":"QUEUED"} HTTP 202
$ curl -s localhost:8080/products/1        # stok 50 → 46, cache sudah di-evict
{"id":1,"name":"Headset Flash Sale","priceIdr":199000,"stock":46}`, 'bash'),
  code('Pesan beracun berakhir di DLQ setelah 3 percobaan', `$ bash scripts/order.sh u-3 999            # produk tidak ada → FK gagal di worker
{"orderId":"e685b1cc-145f-42b6-b7da-083c6a9a9239","status":"QUEUED"} HTTP 202
$ docker compose exec rabbitmq rabbitmqctl list_queues name messages
orders.dlq	1
orders	0`, 'bash'),
  code('Pesan yang sudah diproses dikirim ulang: consumer melewatinya', `$ curl -s -u guest:guest -H 'Content-Type: application/json' \\
    -X POST localhost:15672/api/exchanges/%2F/amq.default/publish \\
    -d '{"routing_key":"orders","properties":{"content_type":"application/json"},
         "payload":"{\\"orderId\\":\\"b27b0a51-8f29-43b8-985d-7b1cb0da4cff\\",\\"userId\\":\\"u-1\\",\\"productId\\":1,\\"qty\\":2}",
         "payload_encoding":"string"}'
{"routed":true}
$ docker compose logs app1 app2 | grep "sudah pernah diproses"
"message":"pesan b27b0a51-8f29-43b8-985d-7b1cb0da4cff sudah pernah diproses, dilewati"
$ curl -s localhost:8080/products/1        # stok tetap 46
{"id":1,"name":"Headset Flash Sale","priceIdr":199000,"stock":46}`, 'bash'),
  paragraph('Di lab, produk yang tidak ada sengaja tidak divalidasi di API agar DLQ bisa dicoba. Di sistem nyata, validasi produk di API, dan gunakan DLQ untuk kegagalan yang tidak terduga.'),
  heading('Percobaan 5 · Index untuk "pesanan saya" (Baris 6)'),
  code('scripts/index-demo.sql dengan 300.000 pesanan', `$ docker compose exec -T postgres-primary psql -U app -d flashsale < scripts/index-demo.sql
-- dengan index (user_id, created_at DESC)
 Limit (actual time=2.990..3.000 rows=15 loops=1)
   ->  Sort ...
         ->  Bitmap Heap Scan on orders
               ->  Bitmap Index Scan on idx_orders_user_created
 Execution Time: 3.272 ms
-- tanpa index
 Limit (actual time=76.591..86.142 rows=15 loops=1)
   ->  Gather Merge (Workers Launched: 2)
         ->  Sort ...
               ->  Parallel Seq Scan on orders  (Rows Removed by Filter: 99996)
 Execution Time: 88.446 ms`, 'bash'),
  paragraph('Hasilnya 88 ms menjadi 3,3 ms, sekitar 27 kali lebih cepat, dan selisihnya terus membesar seiring tabel tumbuh. Karena hasilnya hanya 15 baris, planner memilih Bitmap Index Scan lalu mengurutkan 15 baris itu. Itu tetap jauh lebih murah daripada membaca 300.000 baris.'),
  heading('Percobaan 6 · Rate limit per user (Baris 9)'),
  code('30 request serentak dari satu user', `$ bash scripts/spam.sh 30 spammer
     13 202
     17 429
$ bash scripts/order.sh user-lain 1        # user lain tetap dilayani
{"orderId":"35a78eea-f2cb-4120-94f3-1244375213f7","status":"QUEUED"} HTTP 202`, 'bash'),
  paragraph('Zone `per_user` mengizinkan 5 request per detik dengan burst 10, sehingga 13 lolos (burst + isi ulang selama request berlangsung) dan 17 ditolak. Mengirim 30 request **berurutan** dengan curl tidak memicu limit, karena tiap proses curl di Windows memakan ratusan milidetik dan lajunya tidak pernah melewati 5 per detik. Uji rate limit harus benar-benar serentak.'),
  heading('Jebakan yang ditemukan saat membangun lab'),
  paragraph('Semua jebakan di bawah benar-benar terjadi saat lab ini dibangun dan dijalankan. Hampir semuanya tidak menghasilkan error yang jelas.'),
  table(['Gejala', 'Penyebab', 'Perbaikan'], [
    ['Semua request lewat nginx dibalas 400 dari Tomcat', 'Nama upstream `flash_sale` dikirim sebagai header Host; underscore tidak sah di hostname', 'Nama tanpa underscore + `proxy_set_header Host $host`'],
    ['`GET /products` 500: *Cannot serialize value ... without a serializer*', 'Serializer cache Redis bawaan memakai serialisasi Java, sedangkan record tidak `Serializable`', '`JacksonJsonRedisSerializer` bertipe di `CacheConfig`'],
    ['Respons replay idempotency berbeda dari aslinya', 'Kolom JSONB menormalkan spasi dan urutan key', 'Simpan respons sebagai `TEXT`'],
    ['App `(healthy)` tetapi semua baca 500', 'Port replica salah, dan grup readiness bawaan tidak memeriksa database', 'Perbaiki URL. Menambah `db` ke readiness juga berisiko: semua instance bisa tidak siap bersamaan'],
    ['RabbitMQ gagal start: `.erlang.cookie: eacces`', 'Healthcheck `rabbitmq-diagnostics` berjalan sebagai root dan membuat cookie sebelum server', 'Healthcheck lewat HTTP management API'],
    ['Retry listener tidak sesuai konfigurasi', 'Boot 4 memakai `retry.max-retries`; `max-attempts` diabaikan tanpa peringatan', 'Pakai nama property yang benar dan cek di `/actuator/configprops`'],
    ['Metrik `cache_gets_total` tidak ada', 'Cache dibuat saat pertama dipakai, setelah metrik didaftarkan', '`spring.cache.cache-names: products`'],
    ['Retry tidak pernah mengulang', '`fallbackMethod` di `@CircuitBreaker` menelan exception sebelum `@Retry`', 'Fallback di `@Retry` (angka di modul uji beban)'],
    ['`@Cacheable(sync = true)` tidak mencegah stampede', 'RedisCache dengan writer non-locking bawaan tidak mengunci per key: 50 miss serentak memicu 3–6 query', 'Terima stampede kecil, tambah cache lokal (Caffeine) untuk key panas, atau lock terdistribusi untuk loader mahal'],
    ['Jaeger penuh trace `/actuator/prometheus`', 'Setiap scrape Prometheus ikut di-trace dan dihitung di metrik HTTP', '`ObservationPredicate` yang melewati `/actuator`'],
    ['`docker compose stop` gagal: *PID is zombie*', 'JVM sebagai PID 1 tidak membersihkan proses anak', '`init: true` di service aplikasi'],
  ]),
  ...practice('sdp-lab-flash-sale', [
    'Jalankan lab dan ulangi Percobaan 1–6; bandingkan outputmu dengan yang tertulis di modul ini.',
    'Terapkan read-your-writes: setelah POST /orders, baca pesanan milik user itu dari primary (mis. method service terpisah tanpa readOnly).',
    'Tambahkan validasi produk di API, lalu buat percobaan DLQ baru dengan cara lain (mis. kolom yang melanggar constraint).',
    'Buat job rekonsiliasi yang memproses ulang pesanan PENDING_PAYMENT dengan Idempotency-Key = orderId.',
    'Ganti Redis cache dengan dua tingkat (Caffeine lokal + Redis) dan ukur ulang jumlah query saat 50 miss serentak.',
  ]),
  ...quiz([
    ['SDP-40', 'Mengapa routing baca ke replica memakai LazyConnectionDataSourceProxy, bukan langsung memilih DataSource saat transaksi dimulai?', 'Transaction manager mengambil koneksi di awal transaksi, sebelum flag readOnly selesai diterapkan. Proxy lazy menunda pengambilan koneksi fisik sampai query pertama, saat flag readOnly sudah diketahui, sehingga koneksi bisa diambil dari replica. Bonusnya, transaksi yang tidak menjalankan query (mis. karena cache hit) tidak meminjam koneksi sama sekali.'],
    ['SDP-41', 'Mengapa pemanggilan payment gateway di OrderWorker diletakkan di luar transaksi database?', 'Retry dengan backoff bisa memakan beberapa detik. Bila dilakukan di dalam transaksi, koneksi database dan lock baris produk tertahan selama itu, sehingga pool cepat habis saat lonjakan. Reservasi stok dibuat atomik dalam satu transaksi singkat. Pembayaran dilakukan setelahnya dan aman diulang karena memakai Idempotency-Key = orderId.'],
    ['SDP-42', 'Percobaan 3 menunjukkan 404 untuk pesanan yang sudah PAID. Apakah ini bug?', 'Bukan bug, melainkan konsekuensi read replica: baca diarahkan ke replica yang tertinggal. Solusinya read-your-writes untuk data milik user sendiri (baca dari primary sesaat setelah menulis), atau UI yang menampilkan status "sedang diproses" setelah 202 alih-alih langsung membaca ulang.'],
    ['SDP-43', 'Mengapa `UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty` membuat stok tidak pernah minus walau banyak worker berjalan bersamaan?', 'Pengecekan dan pengurangan terjadi dalam satu statement atomik dengan row lock. Worker kedua menunggu lock, lalu mengevaluasi ulang kondisi `stock >= :qty` terhadap nilai terbaru. Bila stok tidak cukup, tidak ada baris yang berubah dan pesanan ditolak. Pola baca-lalu-tulis di aplikasi (SELECT lalu UPDATE) akan rentan race condition.'],
  ]),
  references(
    ['Spring Framework: LazyConnectionDataSourceProxy', 'https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/datasource/LazyConnectionDataSourceProxy.html'],
    ['Spring Boot: Caching (Redis)', 'https://docs.spring.io/spring-boot/reference/io/caching.html'],
    ['Spring AMQP: Exception handling & dead letters', 'https://docs.spring.io/spring-amqp/reference/amqp/exception-handling.html'],
    ['PostgreSQL: Hot Standby', 'https://www.postgresql.org/docs/current/hot-standby.html'],
    ['nginx: limit_req module', 'https://nginx.org/en/docs/http/ngx_http_limit_req_module.html'],
  ),
];

const loadBlocks: Block[] = [
  paragraph('Fungsi yang benar saat diuji satu per satu belum tentu bertahan saat lonjakan. Modul ini menjalankan uji beban k6 pada lab, membuat payment gateway gagal dengan sengaja, lalu memakai metrik, log, dan trace (Baris 12) untuk mendiagnosis apa yang terjadi. Semua angka berasal dari run nyata di laptop Windows dengan Docker Desktop (VM 12 vCPU yang juga menjalankan container lain), jadi angkamu akan berbeda. Yang penting adalah polanya.'),
  heading('Skenario uji beban'),
  code('load/k6.js', K6, 'js'),
  table(['Skenario', 'Beban', 'Yang dibuktikan', 'Threshold'], [
    ['browse', '30 GET/detik selama 60 detik', 'Cache + dua instance menjaga latensi baca', 'p95 < 200 ms, gagal < 1%'],
    ['flash_sale', '2 → 40 checkout/detik selama 10 detik, masing-masing di-retry sekali', 'Queue meredam lonjakan, retry = replay', 'check > 99%'],
    ['abuser', 'Satu user 30 POST/detik selama 20 detik', 'Rate limit per user', '> 70% dibalas 429'],
  ]),
  code('Menjalankan uji', `TRACE_SAMPLING=0.1 docker compose up -d app1 app2   # sampling trace 10% saat uji beban
bash scripts/reset-data.sh
docker compose run --rm k6`, 'bash'),
  heading('Hasil: run pertama gagal, dan itu justru pelajarannya'),
  table(['Run', 'Kondisi', 'Browse gagal', 'p95 browse', 'Checkout benar', 'Iterasi drop'], [
    ['1', 'JVM baru di-build (dingin), tracing 100%', '28,2%', '2,63 s', '96,4%', '956'],
    ['2', 'JVM hangat (1 run sebelumnya), tracing 100%', '0%', '561 ms', '100%', '22'],
    ['3', 'JVM hangat (2 run), tracing 100%', '0%', '248 ms', '100%', '-'],
    ['4', 'JVM hangat (2 run), tracing 10%', '0%', '**45 ms**', '100%', '-'],
    ['5', 'Ulangan run 3: tracing 100%', '0%', '222 ms', '100%', '-'],
  ]),
  paragraph('Bot nakal dibatasi dengan konsisten di semua run: 79–82% request-nya dibalas 429, sementara checkout user biasa tidak terganggu.'),
  heading('Diagnosis run 1 dengan tiga sinyal'),
  { type: 'steps', items: [
    { title: 'Log nginx: apa yang gagal?', text: 'Hitung kode status per endpoint. Hasilnya: 294 `GET 502` dan 71 `POST 502`, dengan error `no live upstreams while connecting to upstream`. nginx menganggap kedua instance mati.' },
    { title: 'Log nginx: mengapa dianggap mati?', text: 'Sebelum 502 muncul, ada 20 `upstream timed out (110)` pada `GET /products/{id}` di kedua instance. Dengan `max_fails=3 fail_timeout=10s`, tiga timeout menandai instance gagal selama 10 detik. Saat keduanya ditandai, semua request ditolak, termasuk yang sebenarnya bisa dijawab cache.' },
    { title: 'Metrik: mengapa lambat?', text: '`http_server_requests_seconds_max` untuk `/products/{id}` mencapai 18 detik. Pool Hikari primary penuh (10/10, 16 menunggu). `system_cpu_usage` mencapai 0,95: VM Docker kehabisan CPU, dengan GC pause sampai 0,5 detik.' },
    { title: 'CPU per container: siapa yang boros?', text: '`docker stats` saat lonjakan: app2 577%, app1 297% (sekitar 9 core untuk ±110 request/detik), postgres-primary 119%, k6 72%.' },
    { title: 'Uji hipotesis satu per satu', text: 'Run 2 (JVM hangat) menghapus semua 502. Run 3 vs 4 hanya mengubah sampling trace 100% → 10%: CPU kedua app turun dari ±4,9–8,7 core ke ±2,2 core dan p95 browse dari 222–248 ms ke 45 ms.' },
  ] },
  callout('warn', 'Health check pasif bisa mengubah "lambat" menjadi "mati total"', 'Timeout selalu dihitung sebagai kegagalan oleh nginx. Bila semua instance lambat bersamaan (CPU penuh, dependency bersama lambat), `max_fails` menandai semuanya gagal dan nginx berhenti mencoba sama sekali. Kurangi risikonya dengan timeout yang realistis per endpoint, kapasitas cadangan, warm-up sebelum instance menerima traffic, dan load shedding (429/503 cepat) sebelum antrean menumpuk.'),
  callout('info', 'Biaya tracing nyata', 'Di lab ini, sampling 100% kira-kira menggandakan sampai melipatempatkan CPU aplikasi. Angkanya bergantung pada lingkungan, tetapi arahnya konsisten di dua run. Sampling 100% cocok untuk development dan demo; di produksi mulai dari 5–10% (parent-based) dan naikkan hanya untuk jalur yang sedang diselidiki.'),
  heading('Chaos: payment gateway gagal total (Baris 8 + 10)'),
  code('scripts/chaos-payment.sh', CHAOS_SH, 'bash'),
  code('Varian SALAH: fallbackMethod di @CircuitBreaker', `$ bash scripts/chaos-payment.sh 1
gateway      : {"calls":8,"charged":0,"failures":8,"failureRate":1.0}
status order : PENDING_PAYMENT=8
app1 circuit  : "state":"CLOSED" | retry: failed_with_retry=0.0 failed_without_retry=0.0 successful_with_retry=0.0 successful_without_retry=4.0
app2 circuit  : "state":"CLOSED" | retry: failed_with_retry=0.0 failed_without_retry=0.0 successful_with_retry=0.0 successful_without_retry=4.0`, 'bash'),
  code('Varian BENAR: fallbackMethod di @Retry', `$ bash scripts/chaos-payment.sh 1
gateway      : {"calls":11,"charged":0,"failures":11,"failureRate":1.0}
status order : PENDING_PAYMENT=8
app1 circuit  : "state":"OPEN" | retry: failed_with_retry=2.0 failed_without_retry=2.0 successful_with_retry=0.0 successful_without_retry=0.0
app2 circuit  : "state":"OPEN" | retry: failed_with_retry=1.0 failed_without_retry=3.0 successful_with_retry=0.0 successful_without_retry=0.0`, 'bash'),
  paragraph('Pada varian salah, 8 pesanan menghasilkan tepat 8 panggilan: tidak ada satu pun retry. Lebih buruk lagi, metrik Retry melaporkan **successful_without_retry**, padahal semua tagihan gagal. Penyebabnya, fallback di aspek dalam (`@CircuitBreaker`) mengembalikan nilai normal, sehingga aspek luar (`@Retry`) mengira panggilan sukses.'),
  paragraph('Pada varian benar, beberapa pesanan pertama di-retry hingga circuit breaker terbuka di masing-masing instance. Setelah itu, panggilan berikutnya gagal cepat (`failed_without_retry`) tanpa menyentuh gateway. Totalnya 11 panggilan, bukan 24 (8 × 3). Circuit breaker berlaku **per instance**, jadi setiap instance perlu beberapa kegagalan sendiri sebelum terbuka.'),
  code('Pemulihan: gateway normal kembali, sirkuit menutup sendiri', `$ curl -s -X PUT "localhost:8081/internal/payments/chaos?failureRate=0"
$ sleep 21; for i in 1 2 3 4; do bash scripts/order.sh pulih-$i 2; done
app1: "state":"CLOSED"
app2: "state":"CLOSED"
chaos|PENDING_PAYMENT|8
pulih|PAID|4`, 'bash'),
  paragraph('Setelah `wait-duration-in-open-state` (20 detik), sirkuit masuk HALF_OPEN, panggilan percobaan sukses, lalu kembali CLOSED. Delapan pesanan dari masa gangguan tetap PENDING_PAYMENT. Fallback yang benar menunda pekerjaan, bukan menyelesaikannya, jadi tetap butuh job rekonsiliasi.'),
  heading('Satu pesanan dalam satu trace'),
  code('Span dari Jaeger untuk satu POST /orders', `  0.0 ms   27.3 ms  http post /orders                  ← API menerima, klaim idempotency
 13.6 ms    3.4 ms    /orders send                     ← publish ke RabbitMQ
 20.8 ms   54.8 ms      orders receive                 ← worker (bisa instance lain)
 42.8 ms   23.3 ms        http post                    ← PaymentClient
 56.3 ms    4.6 ms          http post /internal/payments  ← payment gateway`, 'text'),
  paragraph('Konteks trace ikut menyeberang lewat header pesan RabbitMQ karena `spring.rabbitmq.template.observation-enabled` dan `listener.simple.observation-enabled` dinyalakan. Tanpa itu, trace berhenti di "send" dan pekerjaan worker muncul sebagai trace terpisah yang tidak tersambung.'),
  heading('Query Prometheus yang dipakai'),
  code('PromQL', `# RED per instance
sum by (instance) (rate(http_server_requests_seconds_count[1m]))
sum by (instance) (rate(http_server_requests_seconds_count{status=~"5.."}[1m]))
histogram_quantile(0.95, sum by (le, uri) (rate(http_server_requests_seconds_bucket[1m])))

# Kejenuhan
max_over_time(hikaricp_connections_pending[10m])        # antrean koneksi per pool
max_over_time(system_cpu_usage[10m])                    # CPU host/VM yang dilihat JVM

# Cache, queue, circuit breaker
sum(rate(cache_gets_total{cache="products",result="hit"}[5m])) / sum(rate(cache_gets_total{cache="products"}[5m]))
max_over_time(rabbitmq_queue_messages_ready{queue="orders"}[10m])
resilience4j_circuitbreaker_state{name="payment",state="open"}`, 'text'),
  ...practice('sdp-lab-uji-beban', [
    'Jalankan k6 dua kali berturut-turut setelah build ulang dan bandingkan run dingin vs hangat.',
    'Ulangi perbandingan sampling trace 100% vs 10% dan catat CPU per container dengan `docker stats`.',
    'Failover: saat k6 berjalan, `docker compose stop app2` di tengah lonjakan, lalu hitung request gagal dan bandingkan GET vs POST.',
    'Setelah uji, cek integritas: stok tidak minus, dan jumlah qty pesanan PAID + PENDING_PAYMENT per produk sama dengan stok awal dikurangi stok akhir.',
    'Reproduksi varian salah fallbackMethod dan buktikan sendiri angka metrik Retry-nya.',
  ]),
  ...quiz([
    ['SDP-44', 'Run pertama gagal 28% untuk GET yang seharusnya dilayani cache. Apa rantai penyebabnya?', 'CPU VM jenuh (JVM baru start sehingga JIT masih bekerja, ditambah tracing 100%) membuat sebagian request lebih dari 10 detik. nginx menghitung timeout sebagai kegagalan, dan setelah `max_fails` kedua instance ditandai mati, sehingga semua request dibalas 502 `no live upstreams`, termasuk cache hit. Satu masalah kapasitas menjadi outage total karena health check pasif.'],
    ['SDP-45', 'Mengapa metrik Retry melaporkan sukses pada varian fallback yang salah?', 'Urutan aspeknya Retry( CircuitBreaker( fungsi ) ). Fallback di CircuitBreaker menangkap exception dan mengembalikan nilai normal (PENDING_PAYMENT), sehingga dari sudut pandang Retry panggilan selesai tanpa error. Retry tidak mengulang dan mencatat successful_without_retry. Metrik bisa "berbohong" bila semantik fallback tidak dipahami.'],
    ['SDP-46', 'Mengapa uji beban perlu warm-up?', 'JVM yang baru start menjalankan kode dalam mode interpretasi dan sibuk mengompilasi (JIT), cache aplikasi masih kosong, dan pool koneksi baru dibuat. Hasil run pertama mencampur biaya start dengan performa sebenarnya. Lakukan warm-up atau buang menit pertama, kecuali yang ingin diukur memang perilaku saat deploy (dalam hal itu, warm-up di readiness probe adalah solusinya).'],
    ['SDP-47', 'Sampling trace 10% menurunkan p95 dari 222–248 ms ke 45 ms di lab ini. Apakah berarti tracing harus dimatikan?', 'Tidak. Artinya sampling adalah keputusan kapasitas. Simpan cukup trace untuk debugging (5–10% parent-based, atau tail sampling di collector untuk menyimpan semua trace yang error/lambat), dan ukur biayanya di lingkungan sendiri. Tracing 100% cocok untuk development, demo, atau penyelidikan sementara.'],
  ]),
  references(
    ['Grafana k6: Scenarios', 'https://grafana.com/docs/k6/latest/using-k6/scenarios/'],
    ['nginx: upstream max_fails & fail_timeout', 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html#server'],
    ['Resilience4j: Getting started (urutan aspek)', 'https://resilience4j.readme.io/docs/getting-started-3'],
    ['OpenTelemetry: Sampling', 'https://opentelemetry.io/docs/concepts/sampling/'],
    ['Jaeger', 'https://www.jaegertracing.io/docs/latest/'],
  ),
];

export const systemDesignLabModules: Omit<Module, 'code'>[] = [
  {
    id: 'sdp-lab-flash-sale',
    title: 'Lab Flash Sale: 12 Baris dalam Satu Sistem',
    summary: 'Satu layanan flash sale di Docker Compose (nginx, dua Spring Boot 4, PostgreSQL primary + replica, Redis, RabbitMQ, Prometheus, Jaeger) dengan enam percobaan yang membuktikan tiap baris, plus jebakan nyata yang ditemukan saat membangunnya.',
    ...meta, duration: '4 jam', level: 'Hard', blocks: labBlocks,
  },
  {
    id: 'sdp-lab-uji-beban',
    title: 'Lab Flash Sale: Uji Beban, Chaos & Diagnosis dengan Metrik',
    summary: 'Uji beban k6 yang gagal di run pertama lalu didiagnosis dengan log, metrik, dan trace; biaya sampling trace; chaos payment gateway yang membuktikan penempatan fallback Resilience4j; dan pemulihan circuit breaker.',
    ...meta, duration: '2,5 jam', level: 'Hard', blocks: loadBlocks,
  },
];
