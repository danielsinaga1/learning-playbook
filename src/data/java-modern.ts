import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const MODERN = 'Java Modern (17–25)';
const SPRING_ADVANCED = 'Spring Boot: Lanjutan & Produksi';

export const javaModernTracks: Track[] = [
  { title: MODERN, summary: 'Records, sealed class, pattern matching, virtual threads, dan structured concurrency.' },
];

export const javaModernSource = 'Java Modern: materi tambahan dari JEP dan dokumentasi resmi OpenJDK, Spring, Testcontainers, dan Resilience4j (29 Oktober 2026)';

export const javaModernModules: Omit<Module, 'code'>[] = [
  {
    id: 'java-records-sealed-pattern',
    title: 'Java Modern: Records, Sealed Class & Pattern Matching',
    summary: 'Data-oriented programming di Java 21+: record, sealed interface, switch pattern, dan record pattern.',
    track: MODERN, source: javaModernSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Sejak Java 17–21, Java punya alat untuk memodelkan data secara ringkas dan aman: **record** untuk data immutable, **sealed** untuk membatasi turunan, dan **pattern matching** di `switch` yang dicek kelengkapannya oleh compiler. Java 25 adalah rilis LTS terbaru; semua fitur di modul ini sudah final sejak Java 21.'),
      code('Record: DTO dan value object', `public record Money(long amount, String currency) {
    public Money {                                   // compact constructor untuk validasi
        if (amount < 0) throw new IllegalArgumentException("amount negatif");
        currency = currency.toUpperCase();
    }

    public Money plus(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("beda mata uang");
        return new Money(amount + other.amount, currency);
    }
}

// equals, hashCode, toString, dan accessor amount()/currency() dibuat otomatis
var total = new Money(50_000, "idr").plus(new Money(25_000, "IDR"));`, 'java'),
      code('Sealed interface + switch pattern matching', `public sealed interface Payment permits Cash, Card, Transfer {}
public record Cash() implements Payment {}
public record Card(String last4, boolean credit) implements Payment {}
public record Transfer(String bank, String reference) implements Payment {}

public final class PaymentLabel {
    public static String of(Payment p) {
        return switch (p) {                               // tanpa default: compiler cek semua varian
            case Cash c -> "Tunai";
            case Card(String last4, boolean credit) when credit -> "Kartu kredit ****" + last4;
            case Card(String last4, var ignored) -> "Kartu debit ****" + last4;
            case Transfer(String bank, String ref) -> "Transfer " + bank + " (" + ref + ")";
        };
    }
}`, 'java'),
      code('instanceof pattern dan text block', `Object value = loadFromCache();
if (value instanceof Money m && m.amount() > 0) {     // cast otomatis ke m
    System.out.println(m.currency());
}

String sql = """
    SELECT id, amount, currency
    FROM transactions
    WHERE user_id = ?
    """;`, 'java'),
      table(['Fitur', 'Final sejak', 'Pengganti dari'], [
        ['`var`', 'Java 10', 'Deklarasi tipe panjang di variabel lokal'],
        ['Text block `"""`', 'Java 15', 'String multi-baris dengan `+` dan `\\n`'],
        ['Record', 'Java 16', 'POJO/Lombok `@Value` untuk data immutable'],
        ['Sealed class', 'Java 17', 'Hierarki terbuka yang tidak terkontrol'],
        ['Switch pattern & record pattern', 'Java 21', 'Rantai `if instanceof` + cast'],
      ]),
      callout('tip', 'Record di Spring Boot', 'Record cocok untuk DTO request/response dan `@ConfigurationProperties`. Untuk entity JPA tetap gunakan class biasa, karena JPA membutuhkan konstruktor tanpa argumen dan field yang bisa diubah.'),
      ...quiz([
        ['JM-01', 'Apa keuntungan sealed interface dibanding interface biasa saat memakai switch?', 'Compiler mengetahui semua implementasi yang diizinkan, sehingga switch tanpa default dicek kelengkapannya. Saat varian baru ditambahkan, setiap switch yang belum menangani varian itu gagal dikompilasi, bukan jatuh ke default secara diam-diam.'],
      ]),
      ...practice('java-records', ['Ganti satu DTO berbasis class/Lombok menjadi record dengan validasi di compact constructor.', 'Modelkan status pesanan sebagai sealed interface dan tulis switch tanpa default.', 'Tambahkan varian baru dan perbaiki semua error kompilasi yang muncul.']),
      references(['JEP 395: Records', 'https://openjdk.org/jeps/395'], ['JEP 409: Sealed Classes', 'https://openjdk.org/jeps/409'], ['JEP 441: Pattern Matching for switch', 'https://openjdk.org/jeps/441'], ['JEP 440: Record Patterns', 'https://openjdk.org/jeps/440']),
    ],
  },
  {
    id: 'java-virtual-threads',
    title: 'Java Modern: Virtual Threads & Structured Concurrency',
    summary: 'Ribuan request blocking tanpa reactive: virtual thread, executor per task, pinning, dan Spring Boot.',
    track: MODERN, source: javaModernSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('Virtual thread (final di Java 21) adalah thread ringan yang dikelola JVM. Saat kode menunggu I/O, virtual thread dilepas dari carrier thread OS sehingga satu aplikasi bisa menjalankan ratusan ribu tugas blocking. Kamu tetap menulis kode imperatif biasa tanpa `CompletableFuture` berantai atau WebFlux.'),
      code('Satu virtual thread per tugas', `import java.net.URI;
import java.net.http.*;
import java.util.concurrent.*;
import java.util.stream.IntStream;

HttpClient http = HttpClient.newHttpClient();

try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    var futures = IntStream.range(0, 10_000)
        .mapToObj(i -> executor.submit(() -> {
            var req = HttpRequest.newBuilder(URI.create("https://httpbin.org/delay/1")).build();
            return http.send(req, HttpResponse.BodyHandlers.ofString()).statusCode();
        }))
        .toList();
    for (Future<Integer> f : futures) f.get();
}   // close() menunggu semua tugas selesai`, 'java'),
      code('Spring Boot: aktifkan dengan satu properti', `# application.yaml
spring:
  threads:
    virtual:
      enabled: true    # Tomcat, @Async, dan scheduler memakai virtual thread`, 'yaml'),
      table(['Gunakan', 'Hindari'], [
        ['Aplikasi I/O-bound: REST, JDBC, HTTP client', 'Komputasi CPU berat (virtual thread tidak menambah core)'],
        ['Kode blocking yang sudah ada', 'Pooling virtual thread (buat baru per tugas, murah)'],
        ['Semaphore untuk membatasi akses ke resource', '`ThreadLocal` berisi objek besar untuk jutaan thread'],
      ]),
      callout('warn', 'Batasi resource, bukan thread', 'Virtual thread membuat konkurensi murah, tetapi database tetap punya batas koneksi. Pertahankan ukuran pool HikariCP yang wajar dan gunakan `Semaphore` untuk API eksternal dengan rate limit.'),
      code('Structured concurrency (preview) — konsep', `// Masih preview di Java 25: kompilasi dengan --enable-preview dan cek API terbaru di JEP.
// Tujuannya: subtask yang dimulai dalam satu blok harus selesai atau dibatalkan bersama.
try (var scope = StructuredTaskScope.open()) {
    var user  = scope.fork(() -> userService.find(id));
    var order = scope.fork(() -> orderService.latest(id));
    scope.join();                                  // satu gagal -> yang lain dibatalkan
    return new Dashboard(user.get(), order.get());
}`, 'java'),
      ...quiz([
        ['JM-02', 'Setelah mengaktifkan virtual thread, endpoint menjadi lebih lambat dan database kehabisan koneksi. Mengapa?', 'Lebih banyak request kini berjalan bersamaan dan semuanya meminta koneksi database. Bila pool kecil, banyak thread menunggu koneksi atau database kewalahan. Batasi konkurensi pada resource (ukuran pool, semaphore) dan ukur lagi; virtual thread menghapus batas thread, bukan batas resource.'],
      ]),
      ...practice('java-vthreads', ['Bandingkan 10.000 tugas blocking pada fixed thread pool 200 vs virtual thread per task.', 'Aktifkan spring.threads.virtual.enabled dan ukur throughput endpoint JDBC dengan k6 atau JMeter.', 'Tambahkan Semaphore untuk membatasi panggilan ke API eksternal.']),
      references(['JEP 444: Virtual Threads', 'https://openjdk.org/jeps/444'], ['Virtual threads guide (Oracle)', 'https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html'], ['Spring Boot: virtual threads', 'https://docs.spring.io/spring-boot/reference/features/spring-application.html#features.spring-application.virtual-threads']),
    ],
  },
  {
    id: 'spring-testcontainers-resilience',
    title: 'Spring Boot: Testcontainers & Resilience4j',
    summary: 'Tes integrasi dengan database asli di Docker, lalu retry, circuit breaker, dan timeout untuk panggilan eksternal.',
    track: SPRING_ADVANCED, source: javaModernSource, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Dua kebiasaan yang membedakan layanan produksi: **tes integrasi terhadap dependensi asli** (bukan H2 yang perilakunya berbeda dari PostgreSQL) dan **pertahanan terhadap layanan lain yang lambat atau mati**. Testcontainers menjalankan Postgres/Kafka/Redis di Docker selama tes; Resilience4j menambahkan retry dan circuit breaker.'),
      code('pom.xml — dependensi tes', `<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-testcontainers</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>postgresql</artifactId>
  <scope>test</scope>
</dependency>`, 'xml'),
      code('Tes integrasi dengan @ServiceConnection', `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class TransactionApiIT {

    @Container
    @ServiceConnection                 // datasource otomatis diarahkan ke container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired TestRestTemplate rest;

    @Test
    void createAndRead() {
        var created = rest.postForEntity("/api/transactions",
            Map.of("amount", 50000, "category", "makan"), Map.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        var list = rest.getForEntity("/api/transactions", List.class);
        assertThat(list.getBody()).hasSize(1);
    }
}`, 'java'),
      callout('info', 'Flyway ikut berjalan', 'Migrasi Flyway dijalankan terhadap container saat konteks Spring dimulai, sehingga tes juga memverifikasi skrip migrasi. Gunakan container `static` agar dipakai bersama oleh semua tes di kelas itu.'),
      code('Resilience4j: retry + circuit breaker', `// dependency: io.github.resilience4j:resilience4j-spring-boot3 + spring-boot-starter-aop
@Service
class ExchangeRateClient {
    private final RestClient rest = RestClient.create("https://rates.example.com");

    @Retry(name = "rates")
    @CircuitBreaker(name = "rates", fallbackMethod = "cachedRate")
    public BigDecimal usdToIdr() {
        return rest.get().uri("/usd-idr").retrieve().body(BigDecimal.class);
    }

    private BigDecimal cachedRate(Throwable cause) {
        return lastKnownRate();         // fallback saat circuit terbuka atau retry habis
    }
}`, 'java'),
      code('application.yaml', `resilience4j:
  retry:
    instances:
      rates:
        max-attempts: 3
        wait-duration: 200ms
        enable-exponential-backoff: true
  circuitbreaker:
    instances:
      rates:
        sliding-window-size: 20
        failure-rate-threshold: 50
        wait-duration-in-open-state: 30s
management:
  endpoints:
    web:
      exposure:
        include: health,circuitbreakers,metrics`, 'yaml'),
      callout('info', 'Cek versi Spring Boot', 'Artefak `resilience4j-spring-boot3` ditujukan untuk Spring Boot 3. Untuk Spring Boot 4, cocokkan artefak Resilience4j dengan dokumentasi terbaru. Spring Framework 7 juga menyediakan `@Retryable` dan `@ConcurrencyLimit` bawaan untuk kebutuhan sederhana.'),
      table(['Pola', 'Mencegah'], [
        ['Timeout', 'Thread tertahan lama oleh layanan lambat'],
        ['Retry + backoff', 'Gagal karena gangguan sesaat (hanya untuk operasi idempotent)'],
        ['Circuit breaker', 'Membanjiri layanan yang sedang mati; gagal cepat lalu coba lagi setelah jeda'],
        ['Bulkhead', 'Satu dependensi lambat menghabiskan semua thread'],
      ]),
      ...practice('spring-resilience', ['Satu tes integrasi CRUD lulus terhadap Postgres di Testcontainers.', 'Matikan WireMock/stub layanan eksternal dan buktikan circuit breaker terbuka lalu fallback dipakai.', 'Status circuit breaker terlihat di endpoint actuator.', 'Retry hanya dipasang pada operasi idempotent; jelaskan alasannya di README.']),
      references(['Spring Boot: Testcontainers', 'https://docs.spring.io/spring-boot/reference/testing/testcontainers.html'], ['Testcontainers for Java', 'https://java.testcontainers.org/'], ['Resilience4j Spring Boot', 'https://resilience4j.readme.io/docs/getting-started-3']),
    ],
  },
];
