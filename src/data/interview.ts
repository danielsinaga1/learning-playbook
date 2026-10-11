import type { Curriculum } from '../types';

export const interview: Curriculum = {
  id: 'interview',
  title: 'Interview Prep: Java, Spring Boot & AWS',
  short: 'Interview Prep',
  monogram: 'Q&A',
  hue: 'green',
  description:
    '30 pertanyaan konsep dasar yang paling sering muncul di interview Senior Java Backend Developer. Buka tiap pertanyaan, jawab dulu di kepala, lalu nilai dirimu.',
  intro: [
    {
      type: 'callout',
      tone: 'tip',
      title: 'Cara latihan',
      text: 'Coba jawab tiap pertanyaan sebelum membuka jawabannya. Setelah membaca, tandai **Paham** atau **Ulangi**. Pakai filter *Ulangi* untuk sesi review berikutnya.',
    },
  ],
  modules: [
    {
      id: 'java',
      code: 'J',
      title: 'Java Core',
      summary: 'Fondasi yang wajib lancar dijawab untuk level senior. Yang ditanya konsep dalam, bukan sintaks.',
      blocks: [
        {
          type: 'qa',
          items: [
            {
              id: 'J-01',
              q: 'Apa perbedaan JDK, JRE, dan JVM?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**JVM** (Java Virtual Machine): mesin yang menjalankan bytecode Java. Platform-dependent, tapi membuat Java "write once, run anywhere".',
                    '**JRE** (Java Runtime Environment): JVM + library standar. Cukup untuk *menjalankan* aplikasi Java.',
                    '**JDK** (Java Development Kit): JRE + compiler (`javac`) + tools. Dibutuhkan untuk *mengembangkan* aplikasi.',
                  ],
                },
              ],
            },
            {
              id: 'J-02',
              q: 'Jelaskan perbedaan == dan .equals()',
              a: [
                {
                  type: 'p',
                  text: '`==` membandingkan **referensi memori** (apakah objek yang sama), sedangkan `.equals()` membandingkan **isi/nilai** objek (jika di-override).',
                },
                {
                  type: 'code',
                  lang: 'java',
                  code: `String a = new String("hello");
String b = new String("hello");

a == b        // false (beda objek di memori)
a.equals(b)   // true  (isi sama)`,
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Follow-up umum',
                  text: 'Jelaskan juga String pool: literal `"hello" == "hello"` bisa `true` karena interning.',
                },
              ],
            },
            {
              id: 'J-03',
              q: 'Apa itu HashMap dan bagaimana cara kerjanya secara internal?',
              a: [
                { type: 'p', text: 'HashMap menyimpan data key-value memakai **array of buckets**. Cara kerjanya:' },
                {
                  type: 'list',
                  items: [
                    'Key di-hash dengan `hashCode()` untuk menentukan index bucket',
                    'Jika collision (2 key di bucket sama), disimpan sebagai **LinkedList**',
                    'Sejak Java 8: jika list > 8 elemen, diubah jadi **Red-Black Tree** (lookup O(log n))',
                    'Load factor default 0.75: resize (rehashing) saat 75% penuh',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  title: 'Pertanyaan jebakan',
                  text: 'Kenapa harus override `hashCode()` jika override `equals()`? Karena kontraknya: objek yang equal HARUS punya hashCode sama.',
                },
              ],
            },
            {
              id: 'J-04',
              q: 'Perbedaan ArrayList vs LinkedList? Kapan pakai yang mana?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**ArrayList**: backed by array. Akses by index O(1), insert/delete di tengah O(n). Pilih untuk *read-heavy*.',
                    '**LinkedList**: doubly linked nodes. Insert/delete di awal/akhir O(1), akses by index O(n). Pilih untuk *frequent insert/delete*.',
                  ],
                },
                {
                  type: 'p',
                  text: 'Praktiknya **ArrayList hampir selalu lebih cepat** karena CPU cache locality. LinkedList jarang dipakai di production.',
                },
              ],
            },
            {
              id: 'J-05',
              q: 'Apa itu immutability? Kenapa String immutable?',
              a: [
                { type: 'p', text: 'Objek immutable tidak bisa diubah setelah dibuat. String immutable karena:' },
                {
                  type: 'list',
                  items: [
                    '**Security**: String dipakai di classloading, network connection, dll',
                    '**String pool**: bisa di-share antar referensi dengan aman',
                    '**Thread-safety**: aman dipakai multi-thread tanpa sinkronisasi',
                    '**HashCode caching**: hash hanya dihitung sekali',
                  ],
                },
              ],
            },
            {
              id: 'J-06',
              q: 'Jelaskan multithreading: Thread vs Runnable vs ExecutorService',
              a: [
                {
                  type: 'list',
                  items: [
                    '**Thread**: extend class Thread (tidak fleksibel, Java single inheritance)',
                    '**Runnable**: implement interface, lebih fleksibel, tapi tidak return value',
                    '**Callable**: seperti Runnable tapi bisa return value & throw exception',
                    '**ExecutorService**: thread pool management. Best practice modern, jangan buat thread manual.',
                  ],
                },
                {
                  type: 'code',
                  lang: 'java',
                  code: `ExecutorService executor = Executors.newFixedThreadPool(10);
Future<String> result = executor.submit(() -> "done");`,
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Bonus poin',
                  text: 'Sebutkan **Virtual Threads** (Java 21): lightweight threads untuk high-concurrency.',
                },
              ],
            },
            {
              id: 'J-07',
              q: 'Apa itu Stream API? Perbedaan map() dan flatMap()?',
              a: [
                { type: 'p', text: 'Stream API (Java 8+) untuk memproses koleksi secara deklaratif/functional.' },
                {
                  type: 'list',
                  items: [
                    '`map()`: transformasi 1-to-1, `Stream<T> → Stream<R>`',
                    '`flatMap()`: transformasi 1-to-many lalu flatten, `Stream<List<T>> → Stream<T>`',
                  ],
                },
                {
                  type: 'code',
                  lang: 'java',
                  code: `// map: ["a","b"] -> ["A","B"]
list.stream().map(String::toUpperCase)

// flatMap: [[1,2],[3,4]] -> [1,2,3,4]
listOfLists.stream().flatMap(List::stream)`,
                },
              ],
            },
            {
              id: 'J-08',
              q: 'Checked vs Unchecked Exception?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**Checked**: wajib di-handle/declare (extends `Exception`): `IOException`, `SQLException`. Dicek saat compile.',
                    '**Unchecked**: runtime exception (extends `RuntimeException`): `NullPointerException`, `IllegalArgumentException`. Tidak wajib di-catch.',
                  ],
                },
                {
                  type: 'p',
                  text: 'Best practice modern: pakai unchecked untuk error business logic, checked hanya untuk kondisi yang bisa di-recover.',
                },
              ],
            },
            {
              id: 'J-09',
              q: 'Bagaimana cara kerja Garbage Collection?',
              a: [
                { type: 'p', text: 'GC otomatis membersihkan objek yang tidak punya referensi lagi. Konsep kunci:' },
                {
                  type: 'list',
                  items: [
                    '**Heap dibagi generasi:** Young Gen (Eden + Survivor) dan Old Gen',
                    'Objek baru masuk Eden, survive minor GC lalu naik ke Survivor, lama-lama ke Old Gen',
                    '**Minor GC** (young gen, cepat) vs **Major/Full GC** (old gen, lebih lambat, bisa stop-the-world)',
                    'Collector modern: **G1GC** (default Java 9+), **ZGC** (low latency)',
                  ],
                },
              ],
            },
            {
              id: 'J-10',
              q: 'Fitur baru Java apa yang kamu pakai? (Java 11 → 21)',
              a: [
                { type: 'p', text: 'Pertanyaan untuk mengecek apakah kamu mengikuti perkembangan. Highlight:' },
                {
                  type: 'list',
                  items: [
                    '**Java 11:** `var` di lambda, HTTP Client baru, String methods (`isBlank`, `lines`)',
                    '**Java 14–16:** Records (`record User(String name) {}`), pattern matching `instanceof`',
                    '**Java 17 (LTS):** Sealed classes, switch expressions',
                    '**Java 21 (LTS):** Virtual Threads, pattern matching for switch, Sequenced Collections',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'spring',
      code: 'S',
      title: 'Spring Boot',
      summary: 'Dengan 8 tahun Spring Boot, interviewer berharap kamu paham "kenapa", bukan cuma "bagaimana".',
      blocks: [
        {
          type: 'qa',
          items: [
            {
              id: 'S-01',
              q: 'Apa itu Dependency Injection dan IoC Container?',
              a: [
                {
                  type: 'p',
                  text: '**IoC (Inversion of Control)**: kontrol pembuatan objek dipindahkan dari kode kita ke framework. **DI** adalah implementasinya: dependency "disuntikkan" oleh Spring, bukan dibuat manual dengan `new`.',
                },
                {
                  type: 'list',
                  items: [
                    '**Constructor injection**: recommended (immutable, testable, fail-fast)',
                    '**Setter injection**: untuk dependency opsional',
                    '**Field injection** (`@Autowired` di field): hindari, susah di-test',
                  ],
                },
              ],
            },
            {
              id: 'S-02',
              q: 'Bagaimana cara kerja @SpringBootApplication?',
              a: [
                { type: 'p', text: 'Anotasi gabungan dari 3 anotasi:' },
                {
                  type: 'list',
                  items: [
                    '`@Configuration`: class ini sumber bean definitions',
                    '`@EnableAutoConfiguration`: Spring Boot auto-configure berdasarkan dependency di classpath (misal ada H2, datasource otomatis di-setup)',
                    '`@ComponentScan`: scan package untuk `@Component`, `@Service`, `@Repository`, `@Controller`',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Follow-up',
                  text: 'Bagaimana exclude auto-configuration? `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)`',
                },
              ],
            },
            {
              id: 'S-03',
              q: 'Apa perbedaan @Component, @Service, @Repository, @Controller?',
              a: [
                {
                  type: 'p',
                  text: 'Semuanya stereotype annotation. Secara fungsi sama (membuat bean); bedanya semantik & fitur tambahan:',
                },
                {
                  type: 'list',
                  items: [
                    '`@Component`: generic component',
                    '`@Service`: business logic layer (semantik saja)',
                    '`@Repository`: data layer + **exception translation** (SQLException → DataAccessException)',
                    '`@Controller` / `@RestController`: web layer; `@RestController` = `@Controller` + `@ResponseBody`',
                  ],
                },
              ],
            },
            {
              id: 'S-04',
              q: 'Jelaskan Bean Scope di Spring',
              a: [
                {
                  type: 'list',
                  items: [
                    '**singleton** (default): 1 instance per container',
                    '**prototype**: instance baru setiap di-request',
                    '**request**: 1 instance per HTTP request (web)',
                    '**session**: 1 instance per HTTP session (web)',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  title: 'Jebakan klasik',
                  text: 'Singleton bean TIDAK otomatis thread-safe. Spring hanya menjamin 1 instance; state management tanggung jawab kita.',
                },
              ],
            },
            {
              id: 'S-05',
              q: 'Bagaimana cara kerja @Transactional?',
              a: [
                {
                  type: 'p',
                  text: 'Spring membuat **proxy** di sekitar method: transaksi dimulai sebelum method, commit jika sukses, rollback jika RuntimeException.',
                },
                { type: 'p', text: 'Hal penting yang sering ditanya:' },
                {
                  type: 'list',
                  items: [
                    '**Self-invocation tidak bekerja**: memanggil method `@Transactional` dari method lain di class yang sama tidak lewat proxy',
                    'Default rollback hanya untuk **unchecked exception**; checked perlu `rollbackFor`',
                    'Propagation: `REQUIRED` (default), `REQUIRES_NEW`, `NESTED`, dll',
                    'Hanya bekerja di **public method**',
                  ],
                },
              ],
            },
            {
              id: 'S-06',
              q: 'Apa itu Spring Boot Actuator?',
              a: [
                { type: 'p', text: 'Modul untuk monitoring & management di production. Endpoint penting:' },
                {
                  type: 'list',
                  items: [
                    '`/actuator/health`: health check (dipakai load balancer/K8s)',
                    '`/actuator/metrics`: metrics aplikasi (memory, CPU, HTTP)',
                    '`/actuator/info`, `/actuator/env`, `/actuator/loggers`',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Relevan dengan AWS',
                  text: 'Health endpoint dipakai Elastic Beanstalk & ALB untuk health check. Koneksi yang bagus untuk posisi ini.',
                },
              ],
            },
            {
              id: 'S-07',
              q: 'Bagaimana handle exception secara global di REST API?',
              a: [
                {
                  type: 'code',
                  lang: 'java',
                  code: `@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      UserNotFoundException ex) {
    return ResponseEntity.status(404)
        .body(new ErrorResponse(ex.getMessage()));
  }
}`,
                },
                {
                  type: 'p',
                  text: '`@RestControllerAdvice` menangkap exception dari semua controller: terpusat, konsisten, dan bersih.',
                },
              ],
            },
            {
              id: 'S-08',
              q: 'JPA: perbedaan FetchType.LAZY vs EAGER? Apa itu N+1 problem?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**EAGER**: relasi langsung di-load bersama entity utama',
                    '**LAZY**: relasi di-load saat diakses (default yang disarankan)',
                  ],
                },
                {
                  type: 'p',
                  text: '**N+1 problem:** query 1 list (1 query) lalu akses relasi tiap item (N query tambahan). Solusi:',
                },
                {
                  type: 'list',
                  items: ['`JOIN FETCH` di JPQL', '`@EntityGraph`', 'Batch fetching (`@BatchSize`)'],
                },
              ],
            },
            {
              id: 'S-09',
              q: 'Bagaimana mengamankan REST API di Spring?',
              a: [
                { type: 'p', text: 'Spring Security + JWT adalah pola paling umum:' },
                {
                  type: 'list',
                  items: [
                    'Login → server generate **JWT token** → client kirim di header `Authorization: Bearer ...`',
                    'Filter chain memvalidasi token tiap request (stateless)',
                    "Method security: `@PreAuthorize(\"hasRole('ADMIN')\")`",
                    'Untuk OAuth2/SSO: Spring Security OAuth2 Resource Server',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Relevan untuk fintech/trading',
                  text: 'Sebutkan juga rate limiting, input validation, dan audit logging. Domain klien mereka high-risk trading.',
                },
              ],
            },
            {
              id: 'S-10',
              q: 'Bagaimana struktur microservices dengan Spring Boot?',
              a: [
                { type: 'p', text: 'Komponen kunci ekosistem Spring Cloud:' },
                {
                  type: 'list',
                  items: [
                    '**API Gateway**: Spring Cloud Gateway (routing, auth, rate limit)',
                    '**Service Discovery**: Eureka / Consul (atau DNS di K8s/AWS)',
                    '**Config**: Spring Cloud Config / AWS Parameter Store',
                    '**Resilience**: Resilience4j (circuit breaker, retry, timeout)',
                    '**Komunikasi**: REST (sync), Kafka/SQS (async)',
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'aws',
      code: 'A',
      title: 'AWS Fundamentals',
      summary: 'Pengalaman AWS kamu < 1 tahun, jadi fokus ke konsep. Interviewer akan maklum asal fundamentalnya kuat.',
      blocks: [
        {
          type: 'qa',
          items: [
            {
              id: 'A-01',
              q: 'Apa itu Region dan Availability Zone (AZ)?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**Region**: lokasi geografis (misal `ap-southeast-1` Singapore). Data tidak keluar region kecuali disengaja.',
                    '**AZ**: data center terpisah dalam 1 region (minimal 3 per region). Untuk high availability, deploy di multi-AZ.',
                  ],
                },
                {
                  type: 'p',
                  text: 'Contoh: RDS Multi-AZ punya standby replica di AZ lain, failover otomatis jika AZ utama down.',
                },
              ],
            },
            {
              id: 'A-02',
              q: 'Jelaskan IAM: User, Role, Policy',
              a: [
                {
                  type: 'list',
                  items: [
                    '**User**: identitas untuk manusia (login console / access key)',
                    '**Role**: identitas untuk service/aplikasi, di-assume sementara (tanpa password permanen)',
                    '**Policy**: dokumen JSON yang menentukan permission (Allow/Deny + Action + Resource)',
                  ],
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Best practice yang wajib disebut',
                  text: 'Aplikasi di EC2 harus pakai **IAM Role**, bukan hardcode access key. Principle of least privilege.',
                },
              ],
            },
            {
              id: 'A-03',
              q: 'EC2 vs Lambda vs ECS: kapan pakai yang mana?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**EC2**: VM penuh, kontrol total. Untuk app long-running yang butuh kustomisasi OS.',
                    '**Lambda**: serverless function, bayar per eksekusi, maks 15 menit. Untuk event-driven, API ringan, cron job.',
                    '**ECS/Fargate**: container orchestration. Untuk microservices dengan Docker, tanpa kelola server (Fargate).',
                  ],
                },
                { type: 'p', text: 'Spring Boot tradisional → EC2/ECS. Spring Cloud Function → bisa Lambda.' },
              ],
            },
            {
              id: 'A-04',
              q: 'Apa itu S3? Apa saja storage class-nya?',
              a: [
                { type: 'p', text: 'Object storage untuk menyimpan file apa pun (bukan file system). Konsep: bucket → object → key.' },
                {
                  type: 'list',
                  items: [
                    '**Standard**: akses sering',
                    '**Infrequent Access (IA)**: jarang diakses, lebih murah',
                    '**Glacier**: arsip, retrieval menit sampai jam',
                    '**Intelligent-Tiering**: pindah otomatis berdasarkan pola akses',
                  ],
                },
                {
                  type: 'p',
                  text: 'Fitur penting: versioning, lifecycle policy, pre-signed URL (akses sementara), server-side encryption.',
                },
              ],
            },
            {
              id: 'A-05',
              q: 'RDS vs DynamoDB: apa bedanya?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**RDS**: relational managed (MySQL, PostgreSQL, dll). SQL, JOIN, ACID transaction. Scaling vertikal + read replica.',
                    '**DynamoDB**: NoSQL key-value/document, fully managed, serverless. Latensi single-digit millisecond, scaling horizontal otomatis.',
                  ],
                },
                {
                  type: 'p',
                  text: 'Pilih DynamoDB untuk high-throughput, pola akses sederhana by key, traffic tidak terprediksi. Pilih RDS untuk relasi kompleks, query fleksibel, reporting.',
                },
                {
                  type: 'callout',
                  tone: 'tip',
                  title: 'Job desc mereka menyebut DynamoDB',
                  text: 'Pelajari juga partition key vs sort key, GSI/LSI, dan model harga DynamoDB (on-demand vs provisioned).',
                },
              ],
            },
            {
              id: 'A-06',
              q: 'Apa itu VPC, Subnet, dan Security Group?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**VPC**: jaringan virtual private milik kamu di AWS',
                    '**Subnet**: pembagian VPC. *Public subnet* (ada route ke Internet Gateway) vs *private subnet* (database, backend)',
                    '**Security Group**: firewall level instance, stateful, hanya allow rules',
                    '**NACL**: firewall level subnet, stateless, bisa deny',
                  ],
                },
                { type: 'p', text: 'Pola umum: load balancer di public subnet, app + database di private subnet.' },
              ],
            },
            {
              id: 'A-07',
              q: 'Bagaimana load balancing & auto scaling bekerja di AWS?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**ALB** (Application Load Balancer): layer 7, routing by path/host, cocok untuk REST API & microservices',
                    '**NLB**: layer 4, ultra-low latency, TCP/UDP',
                    '**Auto Scaling Group**: tambah/kurangi EC2 otomatis berdasarkan metric (CPU, request count)',
                  ],
                },
                { type: 'p', text: 'Pola: ALB → Target Group → ASG dengan health check ke `/actuator/health`.' },
              ],
            },
            {
              id: 'A-08',
              q: 'Apa itu SQS dan SNS? Bedanya apa?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**SQS**: message *queue* (pull). 1 message dikonsumsi 1 consumer. Untuk decoupling & async processing.',
                    '**SNS**: pub/sub *notification* (push). 1 message ke banyak subscriber (email, Lambda, SQS).',
                  ],
                },
                {
                  type: 'p',
                  text: 'Pola umum **fan-out**: SNS → beberapa SQS queue → masing-masing diproses service berbeda.',
                },
                { type: 'p', text: 'Di Spring: `spring-cloud-aws-starter-sqs` dengan `@SqsListener`.' },
              ],
            },
            {
              id: 'A-09',
              q: 'Bagaimana cara monitoring aplikasi di AWS?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**CloudWatch Logs**: centralized logging (log app dikirim via agent/awslogs driver)',
                    '**CloudWatch Metrics**: CPU, memory, custom metrics (via Micrometer dari Spring Boot)',
                    '**CloudWatch Alarms**: alert ke SNS jika threshold terlampaui',
                    '**X-Ray**: distributed tracing antar microservices',
                  ],
                },
              ],
            },
            {
              id: 'A-10',
              q: 'Bagaimana cara menyimpan secret (DB password, API key) dengan aman?',
              a: [
                {
                  type: 'list',
                  items: [
                    '**Secrets Manager**: simpan & rotasi otomatis secret (DB credentials). Berbayar per secret.',
                    '**Parameter Store (SSM)**: key-value config, ada kuota gratis, `SecureString` untuk nilai terenkripsi.',
                  ],
                },
                {
                  type: 'p',
                  text: 'Integrasi Spring: `spring-cloud-aws-starter-secrets-manager`, secret otomatis jadi property.',
                },
                {
                  type: 'callout',
                  tone: 'warn',
                  title: 'Jangan pernah bilang',
                  text: 'Simpan di `application.properties` atau environment variable plain text di repo. Itu red flag besar di interview.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
