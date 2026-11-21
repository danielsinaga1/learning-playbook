# Lab Java Backend: ConcurrentHashMap, 5 API JDK, Strategy, dan Anotasi Spring Boot 4.1

Kode pendamping lima modul Java di playbook. Setiap klaim di modul dibuktikan dengan test.
Saat diuji: OpenJDK 21.0.2, Maven 3.9.9, Spring Boot 4.1.2, 18–19 November 2026.

| Folder | Isi | Test |
|---|---|---|
| `jdk-api` | Java 21 tanpa framework: ConcurrentHashMap (`chm`), Strategy (`strategi`), CompletableFuture/ExecutorService/Stream/Files/HttpClient (`api`) | 45 |
| `spring-anotasi` | Aplikasi rekening Spring Boot 4.1.2: properti tervalidasi, security per method, API versioning, transaksi + event after-commit, HTTP interface client + retry + cache, `@Async` di virtual thread, `@ConcurrencyLimit` | 50 |

## Menjalankan

```bash
# JDK 21+ wajib (virtual thread, ExecutorService/HttpClient AutoCloseable)
cd jdk-api && mvn test
java -cp target/classes id.playbook.jdkapi.chm.ChmDemo     # demo race condition; angka berbeda tiap run

cd ../spring-anotasi && mvn test                           # H2 in-memory, tanpa Docker dan tanpa internet
```

`AnotasiBoot4Test` memeriksa langsung classpath: anotasi yang dihapus di Boot 4 (`@MockBean`, `@Required`,
`@PersistenceConstructor`, `@JsonComponent`, ...), lokasi paket baru (`@WebMvcTest`, `@DataJpaTest`,
`@EntityScan`), dan yang masih ada tetapi deprecated (`@EnableGlobalMethodSecurity`). Jalankan ulang setelah upgrade versi.

Data rekening, nasabah, dan bank di lab ini fiktif.
