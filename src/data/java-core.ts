import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const CORE = 'Java Inti: Bahasa & Platform';
const SPRING_DATA = 'Spring Boot: Data & Persistence';
const SPRING_ADVANCED = 'Spring Boot: Lanjutan & Produksi';

export const javaCoreTracks: Track[] = [
  { title: CORE, summary: 'Bahasa Java secara mendalam: OOP, String & exception, Collections & generics, build & test, I/O & JDBC, concurrency, serta JVM & GC.' },
];

export const javaCoreSource = 'Java Inti: materi tambahan dari dokumentasi resmi OpenJDK/Oracle Java SE, JUnit, Mockito, HikariCP, Hibernate, Spring, dan GraalVM (2 November 2026)';

export const javaCoreModules: Omit<Module, 'code'>[] = [
  {
    id: 'jc-oop-mendalam',
    title: 'Java Inti: OOP Mendalam & Kontrak equals/hashCode',
    summary: 'Empat pilar dalam praktik, abstract class vs interface (default method), komposisi vs inheritance, dan kontrak equals/hashCode/toString.',
    track: CORE, source: javaCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Modul [Java Fundamentals](#java.java-fundamentals) sudah memperkenalkan empat pilar OOP. Di pekerjaan nyata, pertanyaannya bukan lagi "apa itu inheritance", melainkan **keputusan desain**: kapan memakai abstract class atau interface, kapan pewarisan justru membuat kode rapuh, dan bagaimana menulis `equals`/`hashCode` yang benar supaya `HashMap` dan `HashSet` tidak "kehilangan" data.'),
      paragraph('Ringkasnya: **encapsulation** menjaga invarian objek (saldo tidak boleh negatif), **abstraction** menyembunyikan detail di balik kontrak, **inheritance** berbagi implementasi, dan **polymorphism** membuat pemanggil cukup mengenal tipe umum. Pilar yang paling sering disalahgunakan adalah inheritance.'),
      code('Encapsulation + polymorphism lewat interface', `public interface DiscountPolicy {
    long apply(long price);                       // kontrak: pemanggil tidak peduli implementasinya
}

public final class NoDiscount implements DiscountPolicy {
    public long apply(long price) { return price; }
}

public final class PercentDiscount implements DiscountPolicy {
    private final int percent;
    public PercentDiscount(int percent) {
        if (percent < 0 || percent > 100) throw new IllegalArgumentException("persen 0..100");
        this.percent = percent;
    }
    public long apply(long price) { return price - (price * percent / 100); }
}

public class Wallet {
    private long balance;                         // private: hanya diubah lewat method yang menjaga invarian

    public void pay(long price, DiscountPolicy policy) {
        long total = policy.apply(price);         // polymorphism: implementasi dipilih saat runtime
        if (total > balance) throw new IllegalStateException("saldo tidak cukup");
        balance -= total;
    }

    public void topUp(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("nominal harus positif");
        balance += amount;
    }

    public long balance() { return balance; }     // tidak ada setBalance(): invarian terjaga
}`, 'java'),
      code('Abstract class vs interface + default method', `// Interface: kontrak + perilaku default tanpa state
public interface Notifier {
    void send(String to, String message);

    default void sendAll(List<String> recipients, String message) {   // Java 8+
        recipients.forEach(r -> send(r, message));
    }

    static Notifier noop() { return (to, msg) -> {}; }                // static method di interface
}

// Abstract class: berbagi state + template method
public abstract class HttpNotifier implements Notifier {
    protected final HttpClient http = HttpClient.newHttpClient();     // state bersama
    private final String baseUrl;

    protected HttpNotifier(String baseUrl) { this.baseUrl = baseUrl; } // konstruktor

    @Override
    public final void send(String to, String message) {               // alur tetap
        var request = buildRequest(baseUrl, to, message);             // langkah yang diisi subclass
        try {
            http.send(request, HttpResponse.BodyHandlers.discarding());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }

    protected abstract HttpRequest buildRequest(String baseUrl, String to, String message);
}

// "Diamond" default method: compiler memaksa kamu memilih
interface Flyer   { default String move() { return "terbang"; } }
interface Swimmer { default String move() { return "berenang"; } }

class Duck implements Flyer, Swimmer {
    @Override
    public String move() {                                            // tanpa override -> error kompilasi
        return Flyer.super.move() + " & " + Swimmer.super.move();
    }
}`, 'java'),
      table(['Aspek', 'Interface', 'Abstract class'], [
        ['State (field instance)', 'Tidak bisa (hanya konstanta `static final`)', 'Bisa'],
        ['Konstruktor', 'Tidak ada', 'Ada, dipanggil lewat `super(...)`'],
        ['Pewarisan', 'Satu class bisa implement banyak interface', 'Hanya satu superclass'],
        ['Method', '`abstract`, `default`, `static`, `private` (Java 9+)', 'Semua jenis, termasuk `final` dan `protected`'],
        ['Kapan dipakai', 'Kontrak/kemampuan (`Comparable`, `Notifier`), titik ekstensi', 'Kerangka dengan state & alur tetap (template method)'],
      ]),
      code('Komposisi vs inheritance: masalah fragile base class', `// Inheritance yang terlihat wajar...
public class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;

    @Override public boolean add(E e) { addCount++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);              // addAll milik HashSet memanggil add() per elemen!
    }
    public int addCount() { return addCount; }
}

var s = new InstrumentedHashSet<String>();
s.addAll(List.of("a", "b", "c"));
System.out.println(s.addCount());           // 6, bukan 3 — kode kita bergantung pada detail internal parent

// Komposisi: bungkus, jangan warisi
public final class CountingSet<E> {
    private final Set<E> delegate = new HashSet<>();
    private int addCount = 0;

    public boolean add(E e) { addCount++; return delegate.add(e); }
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c);           // delegate tidak memanggil method kita -> tidak dobel
    }
    public boolean contains(Object o) { return delegate.contains(o); }
    public int addCount() { return addCount; }
}`, 'java'),
      callout('tip', 'Aturan praktis', 'Gunakan inheritance hanya bila relasinya benar-benar **is-a** dan superclass memang dirancang untuk diwarisi (terdokumentasi, punya method `protected` sebagai titik ekstensi). Selain itu, pilih komposisi + interface. Tandai class yang tidak dirancang untuk diwarisi dengan `final`.'),
      code('Kontrak equals, hashCode, dan toString', `public final class Sku {                           // final: equals berbasis instanceof tetap simetris
    private final String code;
    private final String warehouse;

    public Sku(String code, String warehouse) {
        this.code = Objects.requireNonNull(code);
        this.warehouse = Objects.requireNonNull(warehouse);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                    // refleksif + jalan pintas
        if (!(o instanceof Sku other)) return false;   // juga menangani null
        return code.equals(other.code) && warehouse.equals(other.warehouse);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, warehouse);          // field yang SAMA dengan equals
    }

    @Override
    public String toString() {
        return "Sku[" + code + "@" + warehouse + "]";  // untuk log & debugging; jangan masukkan data rahasia
    }
}

// Bug klasik: equals di-override, hashCode tidak
class BadKey {
    final String id;
    BadKey(String id) { this.id = id; }
    @Override public boolean equals(Object o) { return o instanceof BadKey b && id.equals(b.id); }
}

Set<BadKey> set = new HashSet<>();
set.add(new BadKey("A"));
System.out.println(set.contains(new BadKey("A")));   // hampir selalu false: hashCode beda -> bucket beda

// Alternatif paling aman untuk value object: record
public record SkuRecord(String code, String warehouse) {}  // equals/hashCode/toString otomatis & benar`, 'java'),
      table(['Aturan kontrak', 'Artinya'], [
        ['Refleksif', '`x.equals(x)` selalu `true`'],
        ['Simetris', '`x.equals(y)` sama dengan `y.equals(x)`'],
        ['Transitif', 'Jika `x = y` dan `y = z`, maka `x = z`'],
        ['Konsisten', 'Hasil tidak berubah selama field yang dibandingkan tidak berubah'],
        ['Non-null', '`x.equals(null)` selalu `false`, tidak melempar exception'],
        ['hashCode', 'Dua objek yang `equals` **wajib** punya `hashCode` sama (sebaliknya tidak wajib)'],
      ]),
      callout('warn', 'Jangan ubah key setelah masuk HashMap', 'Jika field yang dipakai `hashCode` diubah setelah objek menjadi key `HashMap` atau elemen `HashSet`, objek itu tersangkut di bucket lama: `contains` mengembalikan `false` padahal objeknya masih ada. Buat key immutable (field `final`, atau pakai record).'),
      ...quiz([
        ['JC-01', 'Class `Sku` meng-override `equals` tetapi tidak `hashCode`. Mengapa `set.contains(new Sku("A","JKT"))` bisa mengembalikan false padahal objek yang sama isinya sudah ditambahkan?', '`HashSet` pertama-tama memakai `hashCode` untuk memilih bucket, baru membandingkan dengan `equals` di bucket itu. Tanpa override, `hashCode` berasal dari identitas objek sehingga dua objek berisi sama hampir pasti jatuh ke bucket berbeda, dan `equals` tidak pernah dipanggil. Override keduanya dengan field yang sama, atau pakai record.'],
        ['JC-02', 'Class `Duck` mengimplementasikan dua interface yang sama-sama punya default method `move()`. Apa yang terjadi dan bagaimana menyelesaikannya?', 'Kompilasi gagal karena ambigu. Class harus meng-override `move()` dan boleh memanggil versi tertentu dengan `Flyer.super.move()`. Aturan resolusinya: method di class menang atas default method; interface yang lebih spesifik (subinterface) menang atas induknya; sisanya wajib diselesaikan manual.'],
        ['JC-03', 'Mengapa `InstrumentedHashSet` menghitung 6 untuk tiga elemen, dan mengapa komposisi menyelesaikannya?', 'Implementasi `addAll` yang diwarisi memanggil `add` untuk setiap elemen, dan `add` itu sudah kita override sehingga dihitung dua kali. Subclass bergantung pada detail internal parent yang bisa berubah antar versi JDK. Dengan komposisi, objek yang dibungkus tidak tahu tentang method kita, jadi tidak ada panggilan balik yang tak terduga.'],
      ]),
      ...practice('jc-oop', [
        'Modelkan `Money` (amount + currency) sebagai class `final` dengan `equals`/`hashCode`/`toString` manual, lalu tulis ulang sebagai record dan bandingkan.',
        'Buktikan bug `BadKey`: tambahkan ke `HashSet`, cek `contains`, lalu perbaiki dengan `hashCode`.',
        'Refactor satu hierarki `extends` di proyekmu (atau contoh `InstrumentedHashSet`) menjadi komposisi + interface.',
        'Tulis interface dengan default method dan satu abstract class template method; jelaskan di komentar kenapa masing-masing dipilih.',
      ]),
      references(
        ['Oracle Java Tutorial: Interfaces and Inheritance', 'https://docs.oracle.com/javase/tutorial/java/IandI/index.html'],
        ['Javadoc Object.equals & hashCode', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html'],
        ['JLS 9.4.1: Inheritance and Overriding (interface)', 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.4.1'],
      ),
    ],
  },
  {
    id: 'jc-string-exception',
    title: 'Java Inti: String & Exception Handling',
    summary: 'String immutable dan string pool, StringBuilder, hierarki exception checked vs unchecked, try-with-resources, custom exception, dan praktik baik.',
    track: CORE, source: javaCoreSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Dua hal ini muncul di hampir setiap baris kode Java, dan keduanya punya jebakan yang sering keluar di interview maupun bug produksi: membandingkan String dengan `==`, menggabungkan String di dalam loop besar, menelan exception sampai bug tidak terlacak, atau lupa menutup file dan koneksi.'),
      paragraph('`String` di Java **immutable**: setiap "perubahan" (`toUpperCase`, `replace`, `+`) menghasilkan objek baru. Karena tidak bisa berubah, String aman dipakai sebagai key `HashMap`, aman dibagi antar thread, dan literal yang sama bisa dipakai bersama lewat **string pool**.'),
      code('String pool, == vs equals', `String a = "halo";
String b = "halo";                 // literal sama -> objek yang sama dari string pool
String c = new String("halo");     // memaksa objek baru di heap (hampir tidak pernah perlu)
String d = "ha" + "lo";            // konstanta compile-time: digabung saat kompilasi, masuk pool

System.out.println(a == b);          // true  (referensi sama)
System.out.println(a == c);          // false (objek berbeda)
System.out.println(a.equals(c));     // true  -> selalu pakai equals untuk membandingkan isi
System.out.println(a == d);          // true
System.out.println(a == c.intern()); // true  (intern mengembalikan versi pool)

String part = "ha";
System.out.println(a == part + "lo"); // false: digabung saat runtime -> objek baru

String upper = a.toUpperCase();      // a tetap "halo"; upper objek baru "HALO"`, 'java'),
      code('Menggabungkan String: + vs StringBuilder', `List<String> names = loadNames();            // misal 100.000 nama

// Buruk untuk n besar: tiap iterasi membuat String baru dan menyalin isi lama -> O(n^2)
String csv = "";
for (String name : names) csv += name + ",";

// Baik: satu buffer yang tumbuh
var sb = new StringBuilder();
for (String name : names) {
    if (!sb.isEmpty()) sb.append(",");          // isEmpty() pada CharSequence: Java 15+
    sb.append(name);
}
String result = sb.toString();

// Paling ringkas untuk kasus umum
String joined = String.join(",", names);
String bracketed = names.stream().collect(Collectors.joining(", ", "[", "]"));

// Method modern yang sering dipakai
"  halo  ".strip();          // "halo" (sadar Unicode, Java 11)
"   ".isBlank();             // true (Java 11)
"ab".repeat(3);              // "ababab" (Java 11)
"Halo %s, saldo %,d".formatted("Budi", 1500000);   // Java 15`, 'java'),
      callout('info', 'Kapan + tetap boleh', 'Satu ekspresi seperti `"Halo " + nama + "!"` tidak masalah: compiler mengoptimalkannya (sejak Java 9 lewat `invokedynamic`, JEP 280). Yang mahal adalah `+=` berulang di dalam loop. `StringBuffer` adalah versi lama yang tersinkronisasi; pakai `StringBuilder`.'),
      table(['Kelompok', 'Contoh', 'Wajib ditangani?', 'Makna'], [
        ['`Error`', '`OutOfMemoryError`, `StackOverflowError`', 'Tidak', 'Masalah JVM/lingkungan; jangan ditangkap untuk dipulihkan'],
        ['Checked (`Exception`)', '`IOException`, `SQLException`', 'Ya: `catch` atau `throws`', 'Kegagalan eksternal yang wajar dan bisa diantisipasi'],
        ['Unchecked (`RuntimeException`)', '`NullPointerException`, `IllegalArgumentException`, `IllegalStateException`', 'Tidak', 'Bug atau pelanggaran precondition'],
      ]),
      code('try-with-resources & suppressed exception', `static String firstLine(Path file) throws IOException {
    try (BufferedReader reader = Files.newBufferedReader(file)) {
        return reader.readLine();
    }                                            // close() otomatis, juga saat exception
}

class Resource implements AutoCloseable {
    private final String name;
    Resource(String name) { this.name = name; System.out.println("buka " + name); }
    @Override public void close() {
        System.out.println("tutup " + name);
        throw new IllegalStateException("gagal tutup " + name);
    }
}

try (var a = new Resource("A"); var b = new Resource("B")) {
    throw new RuntimeException("gagal di body");
} catch (RuntimeException e) {
    System.out.println(e.getMessage());                      // gagal di body
    for (Throwable s : e.getSuppressed()) {
        System.out.println("suppressed: " + s.getMessage()); // gagal tutup B, lalu gagal tutup A
    }
}
// Urutan output: buka A, buka B, tutup B, tutup A (dibalik), lalu exception utama + suppressed`, 'java'),
      code('Custom exception & menerjemahkan exception antar layer', `// Exception domain: unchecked, membawa data yang berguna
public class InsufficientBalanceException extends RuntimeException {
    private final String accountId;

    public InsufficientBalanceException(String accountId, long requested, long available) {
        super("Saldo tidak cukup di akun %s: diminta %d, tersedia %d"
            .formatted(accountId, requested, available));
        this.accountId = accountId;
    }

    public String accountId() { return accountId; }
}

public class ReportNotFoundException extends RuntimeException {
    public ReportNotFoundException(String id, Throwable cause) {
        super("Laporan tidak ditemukan: " + id, cause);           // simpan cause!
    }
}

public class ReportRepository {
    public String load(String id) {
        try {
            return Files.readString(Path.of("reports", id + ".json"));
        } catch (NoSuchFileException e) {                        // subclass dulu...
            throw new ReportNotFoundException(id, e);
        } catch (IOException e) {                                // ...baru superclass
            throw new UncheckedIOException("Gagal membaca laporan " + id, e);
        }
    }
}`, 'java'),
      code('ANTI-PATTERN yang sering ditemukan saat code review', `// 1. Menelan exception: bug hilang tanpa jejak
try { send(); } catch (Exception e) { }

// 2. Membuang cause: stack trace asli lenyap
catch (SQLException e) { throw new RuntimeException("DB error"); }      // tambahkan ", e"

// 3. Log lalu lempar ulang di setiap layer -> satu error tercatat 4 kali
catch (IOException e) { log.error("gagal", e); throw e; }

// 4. Menelan interrupt
catch (InterruptedException e) { }                // benar: Thread.currentThread().interrupt();

// 5. Exception sebagai alur kontrol normal
try { return Integer.parseInt(input); } catch (NumberFormatException e) { return 0; }
// lebih jujur: validasi dulu, atau kembalikan Optional/OptionalInt`, 'java'),
      callout('tip', 'Praktik baik ringkas', 'Lempar exception sedini mungkin (validasi argumen), tangkap selambat mungkin (di boundary seperti controller atau handler global), log **sekali** di tempat menangkap, selalu sertakan `cause`, dan gunakan unchecked exception untuk aturan bisnis. Di Spring, handler global dibahas di [Global Exception Handling](#java.global-exception-handling).'),
      ...quiz([
        ['JC-04', 'Mengapa `"halo" == new String("halo")` bernilai false, sedangkan `"ha" + "lo" == "halo"` bernilai true?', '`new String` selalu membuat objek baru di heap, sehingga referensinya berbeda dari literal di string pool. `"ha" + "lo"` adalah konstanta compile-time yang digabung saat kompilasi menjadi literal `"halo"`, sehingga merujuk objek pool yang sama. Untuk membandingkan isi, gunakan `equals`.'],
        ['JC-05', 'Di try-with-resources, body melempar exception dan `close()` juga melempar. Exception mana yang sampai ke pemanggil?', 'Exception dari body adalah exception utama. Exception dari `close()` tidak hilang: ia dilampirkan sebagai *suppressed* dan bisa dibaca dengan `getSuppressed()`. Ini berbeda dari `finally` manual, di mana exception dari `finally` bisa menimpa exception utama.'],
        ['JC-06', 'Kapan memilih checked exception, kapan unchecked?', 'Checked cocok untuk kegagalan eksternal yang memang harus dipikirkan pemanggil dan bisa dipulihkan (file tidak ada, jaringan putus) di API tingkat rendah. Unchecked cocok untuk bug, pelanggaran precondition, dan aturan bisnis yang ditangani terpusat. Praktik umum di aplikasi modern: terjemahkan checked exception tingkat rendah menjadi unchecked exception domain di batas layer, sambil menyimpan cause.'],
      ]),
      ...practice('jc-string-exception', [
        'Ukur waktu `+=` vs `StringBuilder` untuk menggabungkan 100.000 String dan catat hasilnya.',
        'Tulis class `AutoCloseable` sendiri dan buktikan urutan `close()` serta isi `getSuppressed()`.',
        'Buat hierarki exception domain (`DomainException` dan dua turunannya) yang menyimpan cause dan data konteks.',
        'Cari minimal dua anti-pattern dari daftar di atas di kode lamamu dan perbaiki.',
      ]),
      references(
        ['Javadoc java.lang.String', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html'],
        ['Oracle Java Tutorial: Exceptions', 'https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html'],
        ['Oracle Java Tutorial: try-with-resources', 'https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html'],
        ['JEP 280: Indify String Concatenation', 'https://openjdk.org/jeps/280'],
      ),
    ],
  },
  {
    id: 'jc-collections-generics',
    title: 'Java Inti: Collections Framework & Generics',
    summary: 'Memilih List/Set/Map/Deque berdasarkan kompleksitas, Comparable/Comparator, koleksi immutable, generics, wildcard & PECS, serta type erasure.',
    track: CORE, source: javaCoreSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Collections Framework adalah API yang paling sering kamu pakai setelah `String`. Memilih implementasi yang salah (misal `contains` pada `ArrayList` berisi jutaan elemen di dalam loop) membuat kode O(n²) tanpa terlihat. Internal `HashMap` dibahas di [HashMap & HashSet](#java.hashmap-hashset); modul ini fokus pada **memilih implementasi, mengurutkan, immutability, dan generics**.'),
      table(['Implementasi', 'get / akses', 'add', 'contains / cari', 'Catatan'], [
        ['`ArrayList`', 'O(1) by index', 'O(1) amortized di akhir', 'O(n)', 'Default untuk List; sisip di tengah O(n)'],
        ['`LinkedList`', 'O(n)', 'O(1) di ujung', 'O(n)', 'Jarang menang di praktik karena cache locality buruk'],
        ['`HashSet` / `HashMap`', 'O(1) rata-rata', 'O(1) rata-rata', 'O(1) rata-rata', 'Tanpa urutan; bucket padat jadi tree (worst O(log n)) sejak Java 8'],
        ['`LinkedHashMap`', 'O(1)', 'O(1)', 'O(1)', 'Urutan insert atau urutan akses (untuk LRU)'],
        ['`TreeMap` / `TreeSet`', 'O(log n)', 'O(log n)', 'O(log n)', 'Terurut; `floorKey`, `ceilingKey`, `subMap`'],
        ['`ArrayDeque`', 'O(1) di ujung', 'O(1) di ujung', 'O(n)', 'Pengganti `Stack` dan `LinkedList` sebagai queue/stack'],
        ['`PriorityQueue`', 'peek O(1)', 'offer O(log n)', 'O(n)', 'Min-heap; poll O(log n); untuk top-k dan scheduling'],
      ]),
      code('Comparable & Comparator', `public record Version(int major, int minor) implements Comparable<Version> {
    @Override
    public int compareTo(Version o) {                       // urutan alami
        int c = Integer.compare(major, o.major);            // JANGAN: major - o.major (bisa overflow)
        return c != 0 ? c : Integer.compare(minor, o.minor);
    }
}

public record Employee(String name, String dept, int salary) {}

List<Employee> staff = new ArrayList<>(List.of(
    new Employee("Ani", "IT", 20_000_000),
    new Employee("Budi", "IT", 25_000_000),
    new Employee("Citra", "HR", 18_000_000)));

staff.sort(Comparator.comparing(Employee::dept)                          // dept naik
    .thenComparing(Employee::salary, Comparator.reverseOrder())          // gaji turun
    .thenComparing(Employee::name));                                     // nama naik

// Field nullable: tentukan posisi null secara eksplisit
Comparator<Employee> byDeptNullLast =
    Comparator.comparing(Employee::dept, Comparator.nullsLast(Comparator.naturalOrder()));

// TreeMap memakai Comparator yang sama untuk menentukan "kesamaan" key
Map<String, Integer> caseInsensitive = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);`, 'java'),
      code('Koleksi immutable, view, dan jebakannya', `List<String> a = List.of("x", "y");        // immutable; List.of(null) -> NullPointerException
// a.add("z");                             // UnsupportedOperationException saat runtime

List<String> b = Arrays.asList("x", "y");  // ukuran tetap: set() boleh, add()/remove() tidak

List<String> source = new ArrayList<>(List.of("x"));
List<String> view = Collections.unmodifiableList(source);   // VIEW read-only
List<String> copy = List.copyOf(source);                    // salinan immutable sungguhan
source.add("y");
System.out.println(view);   // [x, y]  <- perubahan source tetap terlihat
System.out.println(copy);   // [x]

List<Integer> evens = IntStream.range(0, 10).filter(i -> i % 2 == 0).boxed().toList(); // unmodifiable (Java 16)

// ConcurrentModificationException: hapus elemen saat for-each
List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4));
// for (Integer n : nums) if (n % 2 == 0) nums.remove(n);   // CME
nums.removeIf(n -> n % 2 == 0);                              // benar

// Java 21: Sequenced Collections (JEP 431)
List<String> list = new ArrayList<>(List.of("a", "b", "c"));
list.getFirst(); list.getLast(); list.reversed();           // juga untuk LinkedHashMap/LinkedHashSet/Deque`, 'java'),
      code('Deque, PriorityQueue, dan LRU dengan LinkedHashMap', `Deque<Character> stack = new ArrayDeque<>();     // stack: push/pop/peek
Deque<String> queue = new ArrayDeque<>();        // queue: offer/poll/peek

// Top-3 transaksi terbesar dari stream jutaan data: min-heap ukuran k -> O(n log k)
PriorityQueue<Long> top = new PriorityQueue<>();
for (long amount : amounts) {
    top.offer(amount);
    if (top.size() > 3) top.poll();              // buang yang terkecil
}

// LRU cache sederhana (bukan thread-safe)
class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LruCache(int capacity) {
        super(16, 0.75f, true);                  // accessOrder = true: get() memindahkan entry ke akhir
        this.capacity = capacity;
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;                // titik ekstensi resmi yang memang dirancang untuk di-override
    }
}`, 'java'),
      paragraph('**Generics** memberi keamanan tipe saat kompilasi. Generics bersifat **invariant**: `List<Integer>` bukan subtipe `List<Number>`, walaupun `Integer` subtipe `Number`. Wildcard menjembatani ini dengan aturan **PECS** (*Producer Extends, Consumer Super*): jika koleksi hanya **dibaca** (menghasilkan nilai), pakai `? extends T`; jika hanya **ditulisi** (menerima nilai), pakai `? super T`.'),
      code('Wildcard & PECS', `static double sum(Collection<? extends Number> nums) {      // producer: hanya dibaca
    double total = 0;
    for (Number n : nums) total += n.doubleValue();
    // nums.add(1);                                         // error: tipe persisnya tidak diketahui
    return total;
}

static void fillIds(List<? super Integer> target) {         // consumer: hanya ditulisi
    for (int i = 1; i <= 3; i++) target.add(i);
}

static <T> void copy(List<? super T> dest, List<? extends T> src) {   // pola Collections.copy
    for (T item : src) dest.add(item);
}

static <T extends Comparable<? super T>> T max(Collection<? extends T> items) {
    Iterator<? extends T> it = items.iterator();
    T best = it.next();
    while (it.hasNext()) {
        T next = it.next();
        if (next.compareTo(best) > 0) best = next;
    }
    return best;
}

sum(List.of(1, 2.5, 3L));                  // List<Integer>, List<Double>, campuran: semua bisa
List<Object> sink = new ArrayList<>();
fillIds(sink);                             // List<Object> menerima Integer
// List<Number> n = new ArrayList<Integer>();   // error kompilasi: generics invariant`, 'java'),
      code('Type erasure dan konsekuensinya', `List<String> s = new ArrayList<>();
List<Integer> i = new ArrayList<>();
System.out.println(s.getClass() == i.getClass());   // true: saat runtime keduanya hanya ArrayList

Object obj = s;
// if (obj instanceof List<String>) {}   // error: argumen tipe tidak ada saat runtime
if (obj instanceof List<?> l) { }        // boleh

// class Box<T> { T create() { return new T(); } }      // error: T tidak diketahui saat runtime
static <T> T create(Class<T> type) throws ReflectiveOperationException {
    return type.getDeclaredConstructor().newInstance();   // solusi: kirim type token
}

// void handle(List<String> x) {}  +  void handle(List<Integer> x) {}  -> name clash (erasure sama)

// Heap pollution lewat raw type: error muncul jauh dari penyebabnya
List raw = s;
raw.add(42);                              // hanya warning "unchecked"
// String first = s.get(0);               // ClassCastException DI SINI

// Bandingkan dengan array yang covariant & reified
Object[] arr = new String[1];
// arr[0] = 1;                            // ArrayStoreException saat runtime`, 'java'),
      callout('warn', 'Jangan abaikan warning unchecked', 'Raw type (`List` tanpa `<...>`) dan cast `(List<String>)` mematikan pemeriksaan compiler. Error baru muncul sebagai `ClassCastException` di tempat lain. Jika terpaksa memakai `@SuppressWarnings("unchecked")`, letakkan di cakupan sekecil mungkin dan tulis alasannya.'),
      ...quiz([
        ['JC-07', 'Kenapa `List<Integer>` tidak bisa dikirim ke method `void sum(List<Number> nums)`, dan bagaimana memperbaikinya?', 'Generics invariant. Jika diizinkan, method itu bisa memanggil `nums.add(2.5)` dan merusak list yang seharusnya hanya berisi Integer. Karena method hanya membaca, ubah parameternya menjadi `List<? extends Number>`: kamu boleh membaca sebagai `Number`, tetapi tidak boleh menambah elemen.'],
        ['JC-08', 'Apa beda `Collections.unmodifiableList(list)` dan `List.copyOf(list)`?', '`unmodifiableList` mengembalikan *view* read-only atas list asli: perubahan lewat referensi asli tetap terlihat. `List.copyOf` membuat salinan immutable yang terlepas dari sumbernya (dan menolak null). Untuk mengembalikan data dari getter tanpa risiko diubah, `List.copyOf` lebih aman.'],
        ['JC-09', 'Mengapa `compareTo` yang ditulis sebagai `return this.amount - o.amount;` berbahaya?', 'Pengurangan dua int bisa overflow, misalnya nilai negatif besar dikurangi positif besar, sehingga tandanya terbalik dan urutan menjadi salah tanpa error. Gunakan `Integer.compare` atau `Comparator.comparingInt`.'],
      ]),
      ...practice('jc-collections', [
        'Ukur `contains` pada `ArrayList` vs `HashSet` berisi 1 juta elemen untuk 10.000 pencarian.',
        'Urutkan daftar transaksi berdasarkan kategori, nominal menurun, lalu tanggal, dengan satu rantai `Comparator`.',
        'Tulis method generik `<T> void moveAll(Collection<? extends T> from, Collection<? super T> to)` dan uji dengan `List<Integer>` ke `List<Number>`.',
        'Implementasikan `LruCache` dan tulis tes yang membuktikan entry paling lama tidak diakses dibuang lebih dulu.',
      ]),
      references(
        ['Oracle Java Tutorial: Collections', 'https://docs.oracle.com/javase/tutorial/collections/index.html'],
        ['Oracle Java Tutorial: Generics', 'https://docs.oracle.com/javase/tutorial/java/generics/index.html'],
        ['JEP 431: Sequenced Collections', 'https://openjdk.org/jeps/431'],
        ['Javadoc java.util', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html'],
      ),
    ],
  },
  {
    id: 'jc-build-test',
    title: 'Java Inti: Build (Maven/Gradle) & Testing (JUnit 5, Mockito, AssertJ)',
    summary: 'Struktur proyek, Maven vs Gradle, dependency scope, JUnit 5 (lifecycle, parameterized, nested), Mockito, dan AssertJ — tanpa Spring.',
    track: CORE, source: javaCoreSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Sebelum menyentuh Spring, kamu perlu nyaman membangun dan menguji proyek Java biasa. Build tool mengatur dependency, versi Java, kompilasi, dan menjalankan tes; framework tes membuat perilaku kode terdokumentasi dan aman di-refactor. Modul [Testing](#java.testing) di track Spring membahas MockMvc; di sini fondasinya tanpa Spring sehingga tes berjalan dalam milidetik.'),
      code('Struktur proyek standar (Maven & Gradle sama)', `wallet-core/
├── pom.xml                      # atau build.gradle.kts + settings.gradle.kts
├── mvnw, .mvn/                  # Maven Wrapper (atau gradlew, gradle/) — commit ke repo
└── src/
    ├── main/
    │   ├── java/com/example/wallet/TransferService.java
    │   └── resources/           # file konfigurasi, SQL, template
    └── test/
        ├── java/com/example/wallet/TransferServiceTest.java   # package sama -> bisa akses package-private
        └── resources/`, 'text'),
      code('pom.xml minimal dengan BOM JUnit', `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>wallet-core</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencyManagement>
    <dependencies>
      <dependency>                          <!-- BOM: menyelaraskan versi semua modul JUnit -->
        <groupId>org.junit</groupId>
        <artifactId>junit-bom</artifactId>
        <version>5.11.4</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
    <dependency>                            <!-- scope compile (default) -->
      <groupId>com.zaxxer</groupId>
      <artifactId>HikariCP</artifactId>
      <version>5.1.0</version>
    </dependency>
    <dependency>                            <!-- hanya dibutuhkan saat runtime -->
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <version>42.7.4</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <scope>test</scope>                   <!-- versi dari BOM -->
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-junit-jupiter</artifactId>
      <version>5.14.2</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.26.3</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>
      </plugin>
    </plugins>
  </build>
</project>`, 'xml'),
      code('build.gradle.kts setara', `plugins {
    java
}

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }   // Gradle mengunduh JDK yang tepat
}

repositories { mavenCentral() }

dependencies {
    implementation("com.zaxxer:HikariCP:5.1.0")
    runtimeOnly("org.postgresql:postgresql:42.7.4")

    testImplementation(platform("org.junit:junit-bom:5.11.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("org.mockito:mockito-junit-jupiter:5.14.2")
    testImplementation("org.assertj:assertj-core:3.26.3")
}

tasks.test {
    useJUnitPlatform()
}`, 'kotlin'),
      callout('info', 'Versi di contoh', 'Versi di atas adalah rilis stabil yang pasti ada; cek versi terbaru di Maven Central sebelum dipakai. JUnit 6 (rilis 2025) mempertahankan API Jupiter (`org.junit.jupiter.api`), jadi kode tes di modul ini tetap berlaku — perhatikan bahwa JUnit 6 membutuhkan Java 17+.'),
      table(['Kebutuhan', 'Maven scope', 'Gradle configuration'], [
        ['Dipakai kode utama, ikut ke runtime', '`compile` (default)', '`implementation` (atau `api` di plugin `java-library` bila tipe-nya terekspos ke konsumen)'],
        ['Hanya saat kompilasi, disediakan lingkungan', '`provided`', '`compileOnly`'],
        ['Hanya saat runtime (driver JDBC)', '`runtime`', '`runtimeOnly`'],
        ['Hanya untuk tes', '`test`', '`testImplementation` / `testRuntimeOnly`'],
        ['Menyelaraskan versi (BOM)', '`import` di `dependencyManagement`', '`platform(...)`'],
        ['Annotation processor (Lombok, MapStruct)', '`annotationProcessorPaths` di compiler plugin', '`annotationProcessor`'],
      ]),
      table(['Aspek', 'Maven', 'Gradle'], [
        ['Konfigurasi', 'XML deklaratif, konvensi kaku', 'Kotlin/Groovy DSL, fleksibel dan bisa diprogram'],
        ['Performa', 'Cukup; tanpa build cache bawaan', 'Incremental build, build cache, daemon: lebih cepat di proyek besar'],
        ['Kurva belajar', 'Rendah, mudah dibaca siapa pun', 'Lebih tinggi; skrip build bisa jadi rumit'],
        ['Ekosistem', 'Paling umum di enterprise Java', 'Standar Android/Kotlin, banyak dipakai proyek modern'],
      ]),
      code('Kode yang diuji', `public record Account(String id, long balance) {}

public interface AccountRepository {
    Optional<Account> find(String id);
    void save(Account account);
}

public interface Notifier {
    void send(String accountId, String message);
}

public class TransferService {
    private final AccountRepository accounts;
    private final Notifier notifier;

    public TransferService(AccountRepository accounts, Notifier notifier) {
        this.accounts = accounts;
        this.notifier = notifier;
    }

    public void transfer(String from, String to, long amount) {
        if (amount <= 0) throw new IllegalArgumentException("nominal harus positif");
        Account src = accounts.find(from).orElseThrow();
        Account dst = accounts.find(to).orElseThrow();
        if (src.balance() < amount) throw new InsufficientBalanceException(from, amount, src.balance());
        accounts.save(new Account(src.id(), src.balance() - amount));
        accounts.save(new Account(dst.id(), dst.balance() + amount));
        notifier.send(from, "Transfer " + amount + " ke " + to + " berhasil");
    }
}`, 'java'),
      code('JUnit 5: lifecycle, parameterized, nested + AssertJ', `import static org.assertj.core.api.Assertions.*;

// Fake sederhana: sering lebih jelas daripada mock untuk repository
class InMemoryAccounts implements AccountRepository {
    private final Map<String, Account> data = new HashMap<>();
    InMemoryAccounts(Account... initial) { for (Account a : initial) data.put(a.id(), a); }
    public Optional<Account> find(String id) { return Optional.ofNullable(data.get(id)); }
    public void save(Account a) { data.put(a.id(), a); }
}

class TransferServiceValidationTest {
    private TransferService service;

    @BeforeAll static void initAll() { /* sekali per kelas, method static */ }

    @BeforeEach
    void setUp() {                                   // instance test class baru untuk SETIAP test
        service = new TransferService(new InMemoryAccounts(), (id, msg) -> {});
    }

    @ParameterizedTest(name = "nominal {0} ditolak")
    @ValueSource(longs = { 0, -1, -50_000 })
    void rejectsNonPositiveAmount(long amount) {
        assertThatThrownBy(() -> service.transfer("A", "B", amount))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("positif");
    }

    @ParameterizedTest(name = "{0} - {1} = {2}")
    @CsvSource({
        "100000, 40000, 60000",
        "50000,  50000, 0"
    })
    void subtractsBalance(long initial, long amount, long expected) {
        var repo = new InMemoryAccounts(new Account("A", initial), new Account("B", 0));
        new TransferService(repo, (id, msg) -> {}).transfer("A", "B", amount);
        assertThat(repo.find("A").orElseThrow().balance()).isEqualTo(expected);
    }

    @Nested
    @DisplayName("saat akun tidak ada")
    class MissingAccount {
        @Test
        void throwsNoSuchElement() {
            assertThatThrownBy(() -> service.transfer("X", "Y", 1_000))
                .isInstanceOf(NoSuchElementException.class);
        }
    }
}`, 'java'),
      code('Mockito: stub, verify, ArgumentCaptor', `import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)        // strict stubs: stub yang tidak terpakai membuat tes gagal
class TransferServiceTest {
    @Mock AccountRepository accounts;
    @Mock Notifier notifier;
    @InjectMocks TransferService service;  // konstruktor diisi dengan mock di atas
    @Captor ArgumentCaptor<String> message;

    @Test
    void successfulTransferSavesBothAndNotifies() {
        when(accounts.find("A")).thenReturn(Optional.of(new Account("A", 100_000)));
        when(accounts.find("B")).thenReturn(Optional.of(new Account("B", 0)));

        service.transfer("A", "B", 40_000);

        verify(accounts).save(new Account("A", 60_000));     // record: equals berbasis isi
        verify(accounts).save(new Account("B", 40_000));
        verify(notifier).send(eq("A"), message.capture());
        assertThat(message.getValue()).contains("40000").contains("B");
    }

    @Test
    void insufficientBalanceSavesNothing() {
        when(accounts.find("A")).thenReturn(Optional.of(new Account("A", 10)));
        when(accounts.find("B")).thenReturn(Optional.of(new Account("B", 0)));

        assertThatThrownBy(() -> service.transfer("A", "B", 40_000))
            .isInstanceOf(InsufficientBalanceException.class);

        verify(accounts, never()).save(any());
        verifyNoInteractions(notifier);
    }
}`, 'java'),
      code('Perintah sehari-hari', `./mvnw test                                  # compile + jalankan unit test (surefire)
./mvnw -Dtest=TransferServiceTest test       # satu kelas tes
./mvnw verify                                # + integration test (failsafe) & pemeriksaan lain
./mvnw dependency:tree                       # dependency transitif & konflik versi

./gradlew test --tests "*TransferServiceTest"
./gradlew dependencies --configuration runtimeClasspath`, 'bash'),
      callout('warn', 'Jebakan umum', '**Mock bukan untuk semuanya**: jangan mock value object, record, atau class milik library (mis. `HttpClient`) — bungkus dengan interface milikmu. Jangan memverifikasi setiap interaksi; verifikasi efek yang penting. Di JDK 21+ Mockito memunculkan peringatan *dynamic agent loading*; dokumentasi Mockito menyarankan memasang Mockito sebagai `-javaagent` di konfigurasi surefire/Gradle `test`.'),
      ...quiz([
        ['JC-10', 'Apa beda `@BeforeAll` dan `@BeforeEach`, dan mengapa `@BeforeAll` harus static secara default?', '`@BeforeEach` berjalan sebelum setiap test; `@BeforeAll` sekali per kelas. JUnit 5 membuat instance test class baru untuk setiap method test (lifecycle per-method), sehingga method yang berjalan sekali sebelum ada instance harus static. Dengan `@TestInstance(Lifecycle.PER_CLASS)` satu instance dipakai bersama sehingga `@BeforeAll` boleh non-static, tetapi state antar tes jadi berbagi.'],
        ['JC-11', 'Driver PostgreSQL diberi scope `compile`, bukan `runtime`. Apa dampaknya?', 'Kode masih berjalan, tetapi kode utama bisa tidak sengaja mengimpor kelas spesifik driver (`org.postgresql...`) sehingga terikat ke satu vendor. Dengan scope `runtime`/`runtimeOnly`, compiler menolak impor itu dan kode hanya bergantung pada API JDBC standar.'],
        ['JC-12', 'Tes Mockito gagal dengan `UnnecessaryStubbingException`. Apa artinya?', '`MockitoExtension` memakai strict stubs: ada `when(...)` yang tidak pernah dipanggil oleh kode yang diuji. Biasanya tanda tes salah skenario atau sisa copy-paste. Hapus stub itu; gunakan `lenient()` hanya bila benar-benar disengaja.'],
      ]),
      ...practice('jc-build-test', [
        'Buat proyek Maven atau Gradle dari nol (tanpa Spring Initializr) dengan Java 21, JUnit 5, Mockito, dan AssertJ; `./mvnw test` atau `./gradlew test` lulus.',
        'Tulis minimal satu `@ParameterizedTest` dengan `@CsvSource` dan satu dengan `@MethodSource`.',
        'Uji `TransferService` dengan Mockito: kasus sukses, saldo kurang, dan akun tidak ada; gunakan `ArgumentCaptor` sekali.',
        'Jalankan `dependency:tree` atau `gradlew dependencies` dan jelaskan dari mana satu dependency transitif berasal.',
      ]),
      references(
        ['JUnit User Guide', 'https://docs.junit.org/current/user-guide/'],
        ['Mockito Javadoc', 'https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html'],
        ['AssertJ documentation', 'https://assertj.github.io/doc/'],
        ['Maven: Dependency Mechanism & Scope', 'https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html'],
        ['Gradle: Java plugin & dependency configurations', 'https://docs.gradle.org/current/userguide/java_plugin.html'],
      ),
    ],
  },
  {
    id: 'jc-io-nio-jdbc',
    title: 'Java Inti: I/O, NIO.2 & JDBC',
    summary: 'Path/Files untuk file, JDBC dengan PreparedStatement, transaksi manual, batch, dan connection pool HikariCP — fondasi sebelum JPA.',
    track: CORE, source: javaCoreSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Spring Data JPA menyembunyikan banyak hal: membuka koneksi, menyiapkan statement, mengatur transaksi, mengembalikan koneksi ke pool. Saat ada masalah produksi (koneksi habis, query lambat, deadlock), kamu perlu tahu apa yang terjadi di bawahnya. Modul ini membahas **NIO.2** untuk file dan **JDBC murni** + **HikariCP**, sehingga [Spring Data JPA](#java.spring-data-jpa) dan [JPA mendalam](#java.jc-jpa-mendalam) tidak lagi terasa seperti sihir.'),
      paragraph('Untuk file, gunakan API **NIO.2** (`java.nio.file.Path` dan `Files`, sejak Java 7) alih-alih `java.io.File` yang lama: pesan error lebih jelas (`NoSuchFileException` bukan sekadar `false`), mendukung symlink, atribut file, dan operasi atomik.'),
      code('Path & Files: baca, tulis, dan telusuri direktori', `Path dir = Path.of("data", "reports");
Files.createDirectories(dir);                                 // aman bila sudah ada
Path file = dir.resolve("2026-11.csv");

Files.writeString(file, "id,amount" + System.lineSeparator());          // CREATE + TRUNCATE (default)
Files.writeString(file, "1,50000" + System.lineSeparator(), StandardOpenOption.APPEND);

String all = Files.readString(file);                          // hanya untuk file kecil (masuk memori seluruhnya)

try (Stream<String> lines = Files.lines(file)) {              // file besar: dibaca lazy, WAJIB ditutup
    long total = lines.skip(1)
        .mapToLong(line -> Long.parseLong(line.split(",")[1]))
        .sum();
    System.out.println(total);
}

try (Stream<Path> paths = Files.walk(Path.of("data"))) {      // juga memegang handle direktori
    List<Path> csvFiles = paths.filter(p -> p.toString().endsWith(".csv")).toList();
}

try (BufferedWriter out = Files.newBufferedWriter(dir.resolve("big.csv"))) {
    for (int i = 0; i < 1_000_000; i++) { out.write(i + ",0"); out.newLine(); }
}`, 'java'),
      code('Menulis file secara atomik', `// Masalah: proses mati di tengah writeString -> file setengah jadi dibaca proses lain.
// Solusi: tulis ke file sementara di direktori yang SAMA, lalu rename atomik.
static void writeAtomically(Path target, String content) throws IOException {
    Path tmp = Files.createTempFile(target.getParent(), ".tmp-", ".part");
    try {
        Files.writeString(tmp, content);
        Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE);   // pembaca melihat versi lama ATAU baru
    } finally {
        Files.deleteIfExists(tmp);                                  // bersih-bersih bila move gagal
    }
}`, 'java'),
      callout('info', 'Charset', '`Files.readString`/`writeString`/`lines` selalu memakai UTF-8 bila charset tidak disebut. Sejak Java 18 (JEP 400), default charset untuk API lain seperti `FileReader` juga UTF-8. Untuk file dari sistem lama (mis. Windows-1252), sebutkan charset secara eksplisit.'),
      paragraph('**JDBC** adalah API standar untuk bicara dengan database relasional. Aturan pentingnya: selalu gunakan `PreparedStatement` dengan placeholder `?` (aman dari SQL injection dan rencana query bisa dipakai ulang), dan tutup `Connection`, `PreparedStatement`, `ResultSet` dengan try-with-resources.'),
      code('Query dengan PreparedStatement', `public final class JdbcAccountRepository {
    private final DataSource dataSource;

    public JdbcAccountRepository(DataSource dataSource) { this.dataSource = dataSource; }

    public Optional<Account> findById(String id) throws SQLException {
        String sql = "SELECT id, balance FROM accounts WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);                                 // index mulai dari 1
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                return Optional.of(new Account(rs.getString("id"), rs.getLong("balance")));
            }
        }                                                        // conn.close() -> kembali ke pool
    }

    // JANGAN: "SELECT ... WHERE id = '" + id + "'"  ->  id = "x' OR '1'='1" membocorkan semua baris
}`, 'java'),
      code('Transaksi manual: transfer saldo', `public void transfer(String from, String to, long amount) throws SQLException {
    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false);                               // mulai transaksi
        try (PreparedStatement debit = conn.prepareStatement(
                 "UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?");
             PreparedStatement credit = conn.prepareStatement(
                 "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {

            debit.setLong(1, amount);
            debit.setString(2, from);
            debit.setLong(3, amount);
            if (debit.executeUpdate() != 1) {                    // 0 baris: akun tidak ada / saldo kurang
                throw new IllegalStateException("saldo tidak cukup atau akun tidak ada: " + from);
            }

            credit.setLong(1, amount);
            credit.setString(2, to);
            if (credit.executeUpdate() != 1) {
                throw new IllegalStateException("akun tujuan tidak ada: " + to);
            }

            conn.commit();                                       // dua UPDATE jadi permanen bersamaan
        } catch (SQLException | RuntimeException e) {
            conn.rollback();                                     // batalkan semuanya
            throw e;
        } finally {
            conn.setAutoCommit(true);                            // kembalikan koneksi dalam keadaan bersih
        }
    }
}`, 'java'),
      code('Batch insert', `public void insertAll(List<Event> events) throws SQLException {
    String sql = "INSERT INTO events(id, type, payload) VALUES (?, ?, ?)";
    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        conn.setAutoCommit(false);
        try {
            int count = 0;
            for (Event e : events) {
                ps.setObject(1, e.id());                         // UUID didukung driver PostgreSQL
                ps.setString(2, e.type());
                ps.setString(3, e.payload());
                ps.addBatch();
                if (++count % 1_000 == 0) ps.executeBatch();     // kirim per 1.000 baris
            }
            ps.executeBatch();
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        }
    }
}
// PostgreSQL: tambahkan reWriteBatchedInserts=true di JDBC URL agar batch digabung jadi multi-row INSERT`, 'java'),
      code('Connection pool dengan HikariCP', `HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/wallet");
cfg.setUsername("wallet");
cfg.setPassword(System.getenv("DB_PASSWORD"));     // jangan hardcode kredensial
cfg.setMaximumPoolSize(10);                         // mulai kecil, ukur, baru naikkan
cfg.setConnectionTimeout(3_000);                    // ms menunggu koneksi dari pool sebelum gagal
cfg.setMaxLifetime(30 * 60_000);                    // lebih pendek dari batas idle di DB/proxy/firewall
cfg.setPoolName("wallet-pool");

try (HikariDataSource ds = new HikariDataSource(cfg)) {   // tutup pool saat aplikasi berhenti
    var repo = new JdbcAccountRepository(ds);
    repo.transfer("A", "B", 40_000);
}

// Spring Boot memakai HikariCP secara default; properti setara:
// spring.datasource.hikari.maximum-pool-size=10
// spring.datasource.hikari.connection-timeout=3000`, 'java'),
      table(['Lapisan', 'Kontrol SQL', 'Boilerplate', 'Cocok untuk'], [
        ['JDBC murni', 'Penuh', 'Tinggi (open/close, mapping manual)', 'Library, tool kecil, memahami dasar'],
        ['Spring `JdbcClient`/`JdbcTemplate`', 'Penuh', 'Rendah; exception diterjemahkan ke `DataAccessException`', 'Query kompleks, reporting, batch, performa kritis'],
        ['JPA/Hibernate', 'Sebagian (SQL dihasilkan)', 'Paling rendah untuk CRUD', 'Domain kaya relasi; perlu paham N+1 & lazy loading'],
      ]),
      callout('warn', 'Pool kecil sering lebih cepat', 'Menaikkan `maximumPoolSize` ke 100 jarang mempercepat aplikasi: database punya core CPU dan disk terbatas, sehingga terlalu banyak koneksi aktif justru menambah context switching dan contention. Wiki HikariCP menyarankan memulai dari rumus `core_count * 2 + effective_spindle_count` lalu mengukur. Pantau metrik pool (`hikaricp_connections_pending`) sebelum mengubah angka.'),
      ...quiz([
        ['JC-13', 'Mengapa `Files.lines(path)` harus dibungkus try-with-resources, padahal `Files.readString` tidak?', '`Files.lines` mengembalikan Stream lazy yang memegang file handle terbuka sampai stream ditutup. Tanpa menutupnya, handle bocor dan lama-lama muncul "Too many open files". `readString` membaca seluruh isi lalu langsung menutup file, sehingga tidak ada resource yang tersisa.'],
        ['JC-14', 'Di transaksi manual, apa yang terjadi bila exception terjadi setelah UPDATE pertama dan kode tidak memanggil `rollback()`?', 'Perubahan belum di-commit, tetapi koneksi kembali ke pool masih dalam transaksi terbuka (dan mungkin memegang lock baris). Tergantung pool/driver, perubahan bisa di-rollback saat koneksi ditutup atau dibersihkan, tetapi jangan bergantung pada itu: selalu rollback eksplisit dan kembalikan autoCommit. Inilah pekerjaan yang dilakukan `@Transactional` untukmu.'],
        ['JC-15', 'Bagaimana `PreparedStatement` mencegah SQL injection?', 'Teks SQL dan nilai parameter dikirim terpisah. Database mem-parse SQL dengan placeholder lebih dulu, lalu nilai parameter diperlakukan sebagai data, bukan bagian dari sintaks SQL. Input seperti `x\' OR \'1\'=\'1` hanya menjadi string pembanding biasa.'],
      ]),
      ...practice('jc-io-jdbc', [
        'Tulis program yang membaca CSV transaksi 1 juta baris dengan `Files.lines` dan menghitung total per kategori tanpa memuat semua ke memori.',
        'Implementasikan repository JDBC (find, insert, transfer) terhadap PostgreSQL di Docker dengan HikariCP.',
        'Buktikan rollback: lempar exception di antara dua UPDATE dan verifikasi saldo tidak berubah.',
        'Bandingkan waktu insert 100.000 baris satu per satu vs batch (dengan dan tanpa `reWriteBatchedInserts`).',
      ]),
      references(
        ['Javadoc java.nio.file.Files', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html'],
        ['Oracle Java Tutorial: JDBC Basics', 'https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html'],
        ['HikariCP', 'https://github.com/brettwooldridge/HikariCP'],
        ['HikariCP: About Pool Sizing', 'https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing'],
        ['Spring Framework: JdbcClient', 'https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html'],
      ),
    ],
  },
  {
    id: 'jc-concurrency-klasik',
    title: 'Java Inti: Concurrency Klasik & Java Memory Model',
    summary: 'Thread, synchronized, volatile, happens-before, ExecutorService, CompletableFuture, ConcurrentHashMap, atomic, ReentrantLock, dan CountDownLatch.',
    track: CORE, source: javaCoreSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Virtual thread ([modul virtual threads](#java.java-virtual-threads)) membuat thread murah, tetapi **tidak** menghapus masalah klasik concurrency: race condition, visibilitas memori, deadlock, dan koordinasi antar tugas. Semua itu tetap diatur oleh **Java Memory Model (JMM)** dan alat di `java.util.concurrent`. Bug concurrency jarang muncul di laptop dan sering muncul di produksi di bawah beban, jadi pahami aturannya, jangan mengandalkan "sepertinya aman".'),
      paragraph('Dua masalah berbeda yang sering tertukar: **atomicity** (operasi `count++` sebenarnya baca-ubah-tulis tiga langkah sehingga dua thread bisa saling menimpa) dan **visibility** (thread lain bisa tidak pernah melihat nilai baru karena cache CPU dan reordering oleh compiler/JIT). `synchronized` menyelesaikan keduanya; `volatile` hanya visibility.'),
      code('Race condition, synchronized, dan volatile', `class Counter {
    private int count = 0;
    void increment() { count++; }                     // read-modify-write: TIDAK atomik
    int get() { return count; }
}

var counter = new Counter();
Runnable task = () -> { for (int i = 0; i < 1_000_000; i++) counter.increment(); };
Thread t1 = new Thread(task), t2 = new Thread(task);
t1.start(); t2.start();
t1.join(); t2.join();
System.out.println(counter.get());                    // hampir selalu < 2.000.000

class SafeCounter {
    private int count = 0;
    synchronized void increment() { count++; }        // mutual exclusion + visibility
    synchronized int get() { return count; }          // getter juga harus synchronized!
}

class Worker implements Runnable {
    private volatile boolean running = true;          // tanpa volatile, loop bisa tak pernah berhenti
    public void run() { while (running) { doWork(); } }
    void stop() { running = false; }
}
// volatile int count; count++;  -> TETAP race: volatile tidak membuat ++ atomik`, 'java'),
      table(['Aturan happens-before (JLS 17.4.5)', 'Artinya dalam praktik'], [
        ['Program order', 'Dalam satu thread, aksi sebelumnya terlihat oleh aksi sesudahnya'],
        ['Monitor lock', '`unlock` sebuah monitor terjadi-sebelum `lock` berikutnya pada monitor yang **sama**'],
        ['volatile', 'Tulis ke field volatile terjadi-sebelum setiap baca berikutnya atas field itu (dan semua tulisan sebelumnya ikut terlihat)'],
        ['Thread start / join', '`t.start()` terjadi-sebelum aksi di `t`; semua aksi di `t` terjadi-sebelum `t.join()` kembali'],
        ['java.util.concurrent', 'Aksi sebelum `submit`/`put`/`countDown` terlihat oleh thread yang menjalankan/mengambil/`await`'],
        ['Transitif', 'Jika A hb B dan B hb C, maka A hb C — inilah cara "menitipkan" visibilitas'],
      ]),
      code('Double-checked locking dan alternatif yang lebih sederhana', `class Config {
    private static volatile Config instance;          // volatile WAJIB: tanpa itu thread lain bisa
                                                      // melihat objek yang belum selesai dikonstruksi
    static Config get() {
        Config local = instance;
        if (local == null) {
            synchronized (Config.class) {
                local = instance;
                if (local == null) instance = local = Config.load();
            }
        }
        return local;
    }
}

// Lebih sederhana: holder idiom — inisialisasi class dijamin thread-safe & lazy oleh JVM
final class ConfigHolder {
    private static final class Holder { static final Config INSTANCE = Config.load(); }
    static Config get() { return Holder.INSTANCE; }
}`, 'java'),
      code('ExecutorService & CompletableFuture', `// Executor berumur panjang: buat sekali, shutdown saat aplikasi berhenti
ExecutorService io = Executors.newFixedThreadPool(32);

Dashboard load(String userId) {
    CompletableFuture<User> user =
        CompletableFuture.supplyAsync(() -> userClient.get(userId), io);   // executor eksplisit!
    CompletableFuture<List<Order>> orders =
        CompletableFuture.supplyAsync(() -> orderClient.list(userId), io)
            .orTimeout(2, TimeUnit.SECONDS)                                // Java 9+
            .exceptionally(ex -> List.of());                               // fallback: dashboard tetap tampil

    return user.thenCombine(orders, Dashboard::new)                        // gabung dua hasil independen
        .thenCompose(d -> CompletableFuture.supplyAsync(() -> enrich(d), io)) // lanjutan yang juga async
        .join();                                                           // error dibungkus CompletionException
}

void shutdown() throws InterruptedException {
    io.shutdown();                                                         // tolak tugas baru
    if (!io.awaitTermination(30, TimeUnit.SECONDS)) io.shutdownNow();      // interrupt yang masih jalan
}

// Sejak Java 19 ExecutorService adalah AutoCloseable: close() = shutdown + tunggu selesai
try (var pool = Executors.newFixedThreadPool(4)) {
    List<Future<Integer>> results = pool.invokeAll(List.of(() -> 1, () -> 2));
}`, 'java'),
      code('ConcurrentHashMap, atomic, LongAdder', `ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();
void record(String path) {
    hits.computeIfAbsent(path, k -> new LongAdder()).increment();   // atomik per key
}

ConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();
stock.merge("SKU-1", 5, Integer::sum);                              // tambah atau inisialisasi, atomik

// SALAH: check-then-act tetap race walau map-nya thread-safe
if (!stock.containsKey("SKU-2")) stock.put("SKU-2", 0);
// BENAR
stock.putIfAbsent("SKU-2", 0);

AtomicLong sequence = new AtomicLong();
long nextId = sequence.incrementAndGet();                           // CAS, tanpa lock

AtomicReference<BigDecimal> highest = new AtomicReference<>(BigDecimal.ZERO);
highest.accumulateAndGet(new BigDecimal("12.50"), BigDecimal::max); // loop CAS di dalamnya`, 'java'),
      code('ReentrantLock (lock ordering) & CountDownLatch', `final class Account {
    final String id;
    long balance;
    final ReentrantLock lock = new ReentrantLock();
    Account(String id, long balance) { this.id = id; this.balance = balance; }
}

boolean transfer(Account a, Account b, long amount) throws InterruptedException {
    Account first  = a.id.compareTo(b.id) < 0 ? a : b;    // urutan kunci global -> cegah deadlock
    Account second = first == a ? b : a;
    if (!first.lock.tryLock(1, TimeUnit.SECONDS)) return false;   // tidak menunggu selamanya
    try {
        if (!second.lock.tryLock(1, TimeUnit.SECONDS)) return false;
        try {
            if (a.balance < amount) return false;
            a.balance -= amount;
            b.balance += amount;
            return true;
        } finally {
            second.lock.unlock();
        }
    } finally {
        first.lock.unlock();                               // unlock SELALU di finally
    }
}

// CountDownLatch: tunggu N pekerjaan selesai
int shards = 5;
CountDownLatch done = new CountDownLatch(shards);
try (ExecutorService pool = Executors.newFixedThreadPool(shards)) {
    for (int i = 0; i < shards; i++) {
        int shard = i;
        pool.submit(() -> {
            try { migrate(shard); } finally { done.countDown(); }   // countDown walau gagal
        });
    }
    if (!done.await(5, TimeUnit.MINUTES)) throw new IllegalStateException("migrasi timeout");
}`, 'java'),
      table(['Alat', 'Gunakan untuk', 'Catatan'], [
        ['`synchronized`', 'Critical section sederhana', 'Otomatis lepas saat exception; tidak bisa timeout'],
        ['`ReentrantLock`', 'Butuh `tryLock` dengan timeout, lock yang bisa di-interrupt, `Condition`', 'Wajib `unlock()` di `finally`'],
        ['`volatile`', 'Flag/status yang ditulis satu thread dan dibaca banyak thread', 'Bukan untuk `++` atau check-then-act'],
        ['`AtomicLong`/`AtomicReference`', 'Counter, ID, update CAS satu variabel', 'Update gabungan banyak variabel tetap butuh lock'],
        ['`LongAdder`', 'Counter dengan kontensi tinggi (metrik)', 'Lebih cepat dari `AtomicLong` saat banyak penulis; `sum()` tidak snapshot atomik'],
        ['`ConcurrentHashMap`', 'Map bersama antar thread', 'Gunakan `compute`/`merge`/`putIfAbsent`; jangan kerja lama di dalam lambda `compute`'],
        ['`CountDownLatch`/`Semaphore`', 'Menunggu N event / membatasi akses ke resource', 'Latch sekali pakai; Semaphore cocok untuk rate limit sederhana'],
      ]),
      callout('warn', 'Jebakan CompletableFuture & interrupt', 'Tanpa argumen executor, `supplyAsync` memakai `ForkJoinPool.commonPool()` yang ukurannya sekitar jumlah core dan juga dipakai parallel stream. Panggilan HTTP/JDBC blocking di sana bisa membuat seluruh aplikasi tersendat. Selalu berikan executor sendiri untuk I/O. Saat menangkap `InterruptedException`, pulihkan status dengan `Thread.currentThread().interrupt()` agar pemanggil tahu thread diminta berhenti.'),
      callout('info', 'Virtual thread & synchronized', 'Di Java 21–23, blocking di dalam blok `synchronized` mem-*pin* virtual thread ke carrier thread sehingga skalabilitas turun; saat itu `ReentrantLock` disarankan untuk jalur I/O panas. Sejak JDK 24 (JEP 491) masalah pinning karena `synchronized` sudah diatasi. Alat lain di modul ini berlaku sama untuk platform maupun virtual thread.'),
      ...quiz([
        ['JC-16', 'Field `count` sudah `volatile`. Apakah `count++` dari banyak thread sekarang aman?', 'Tidak. `volatile` menjamin setiap thread membaca nilai terbaru dan tulisan langsung terlihat, tetapi `count++` tetap tiga langkah (baca, tambah, tulis) sehingga dua thread bisa membaca nilai yang sama lalu saling menimpa. Gunakan `AtomicInteger.incrementAndGet()`, `LongAdder`, atau `synchronized`.'],
        ['JC-17', 'Mengapa double-checked locking tanpa `volatile` rusak?', 'Pembuatan objek terdiri dari alokasi, inisialisasi field, dan menulis referensi. Tanpa happens-before, JIT/CPU boleh mengurutkan ulang sehingga referensi terlihat oleh thread lain sebelum field selesai diinisialisasi. Thread itu melewati pengecekan `null` tanpa lock dan memakai objek setengah jadi. `volatile` pada field menciptakan relasi happens-before antara tulisan dan bacaan.'],
        ['JC-18', 'Dua thread memanggil `transfer(a, b)` dan `transfer(b, a)` bersamaan, masing-masing mengunci akun pertama dulu. Apa yang terjadi dan bagaimana mencegahnya?', 'Deadlock: thread 1 memegang lock `a` dan menunggu `b`, thread 2 memegang `b` dan menunggu `a`. Cegah dengan urutan penguncian global yang konsisten (misal berdasarkan ID), dan/atau `tryLock` dengan timeout supaya thread bisa mundur. Thread dump (`jcmd <pid> Thread.print`) akan melaporkan deadlock yang terdeteksi.'],
      ]),
      ...practice('jc-concurrency', [
        'Reproduksi race condition `Counter` lalu perbaiki dengan tiga cara: `synchronized`, `AtomicInteger`, `LongAdder`; bandingkan waktunya.',
        'Buat demo deadlock dua akun, ambil thread dump dengan `jcmd`, lalu perbaiki dengan lock ordering.',
        'Gabungkan tiga panggilan layanan (bisa disimulasikan dengan `Thread.sleep`) memakai `CompletableFuture` dengan executor sendiri, timeout, dan fallback.',
        'Tulis penghitung hit per endpoint berbasis `ConcurrentHashMap<String, LongAdder>` dan uji dengan 50 thread.',
      ]),
      references(
        ['JLS 17.4: Memory Model', 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4'],
        ['Javadoc java.util.concurrent (Memory Consistency Properties)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html'],
        ['Javadoc CompletableFuture', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'],
        ['JEP 491: Synchronize Virtual Threads without Pinning', 'https://openjdk.org/jeps/491'],
      ),
    ],
  },
  {
    id: 'jc-jvm-gc',
    title: 'Java Inti: JVM Internals, Garbage Collection & Diagnosis Memory',
    summary: 'Area memori JVM, class loading, G1 vs ZGC generational, flag heap untuk container, JFR/JMC, heap dump, dan mendiagnosis memory leak.',
    track: CORE, source: javaCoreSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Modul [JDK, JRE, JVM & JIT](#java.jdk-jre-jvm-jit-60-days-of-java-day-2) menjelaskan bagaimana bytecode dijalankan. Modul ini melanjutkan ke pertanyaan yang muncul saat aplikasi sudah di produksi: kenapa pod di-*OOMKilled* padahal `-Xmx` lebih kecil dari limit container, kenapa latensi p99 melonjak setiap beberapa menit, dan bagaimana menemukan objek yang bocor di heap berukuran gigabyte.'),
      table(['Area memori', 'Isi', 'Diatur dengan', 'Gejala bila habis'], [
        ['Heap: young (Eden + Survivor)', 'Objek baru; kebanyakan mati muda', 'Otomatis oleh GC (G1 menyesuaikan ukuran)', 'GC muda sangat sering'],
        ['Heap: old', 'Objek yang bertahan beberapa siklus GC', '`-Xmx`, `-XX:MaxRAMPercentage`', '`OutOfMemoryError: Java heap space`'],
        ['Metaspace', 'Metadata class (menggantikan PermGen sejak Java 8)', '`-XX:MaxMetaspaceSize`', '`OutOfMemoryError: Metaspace` (sering classloader leak)'],
        ['Thread stack', 'Frame method per thread platform', '`-Xss`', '`StackOverflowError` (rekursi tanpa batas)'],
        ['Code cache', 'Kode native hasil JIT', '`-XX:ReservedCodeCacheSize`', 'Peringatan code cache penuh, JIT berhenti, aplikasi melambat'],
        ['Direct/native memory', 'Buffer NIO, Netty, thread, GC internal', '`-XX:MaxDirectMemorySize`', '`OutOfMemoryError: Direct buffer memory` atau container OOMKilled'],
      ]),
      paragraph('**Class loading** terjadi lazy saat sebuah class pertama kali dipakai, melalui tiga tahap: *loading* (membaca bytecode), *linking* (verifikasi, persiapan field static, resolusi referensi), dan *initialization* (menjalankan blok `static`). Class loader bekerja dengan **parent delegation**: permintaan diteruskan ke parent dulu, sehingga class inti seperti `java.lang.String` tidak bisa ditimpa aplikasi.'),
      code('Hierarki class loader', `public class App {
    public static void main(String[] args) {
        System.out.println(String.class.getClassLoader());             // null -> bootstrap loader (native)
        System.out.println(java.sql.Connection.class.getClassLoader()); // platform loader (modul java.sql)
        System.out.println(App.class.getClassLoader());                // app (system) loader: classpath kamu
    }
}
// Inisialisasi class static terjadi sekali & thread-safe -> dasar holder idiom singleton.
// Classloader leak: aplikasi di-redeploy di app server, tetapi thread/ThreadLocal/driver JDBC
// masih mereferensikan class lama -> seluruh class lama tidak bisa di-GC -> Metaspace terus naik.`, 'java'),
      paragraph('**Garbage collector** modern bekerja berdasarkan hipotesis generasional: kebanyakan objek mati muda, sehingga young generation dibersihkan sering dan murah. **G1** adalah default sejak Java 9 dan menyeimbangkan throughput dengan target pause (`-XX:MaxGCPauseMillis`, default 200 ms). **ZGC** melakukan hampir semua pekerjaan secara concurrent dengan pause di bawah milidetik; mode generasional diperkenalkan di JDK 21 (JEP 439), menjadi default di JDK 23 (JEP 474), dan mode non-generasional dihapus di JDK 24 (JEP 490).'),
      table(['GC', 'Flag', 'Kekuatan', 'Pertimbangan'], [
        ['Serial', '`-XX:+UseSerialGC`', 'Overhead terkecil, satu thread', 'Dipilih otomatis bila JVM melihat < 2 CPU atau < ~1,8 GB RAM'],
        ['Parallel', '`-XX:+UseParallelGC`', 'Throughput maksimal untuk batch', 'Pause bisa panjang pada heap besar'],
        ['G1 (default)', '`-XX:+UseG1GC`', 'Seimbang; target pause bisa diatur', 'Pilihan aman untuk kebanyakan layanan web'],
        ['ZGC (generational)', '`-XX:+UseZGC`', 'Pause sub-milidetik, heap sangat besar', 'Butuh headroom CPU & memori lebih; throughput sedikit lebih rendah'],
      ]),
      code('Flag JVM untuk layanan di container', `java \\
  -XX:InitialRAMPercentage=50 -XX:MaxRAMPercentage=75 \\
  -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \\
  -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps \\
  -XX:+ExitOnOutOfMemoryError \\
  -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20m \\
  -XX:StartFlightRecording=maxage=6h,dumponexit=true,filename=/dumps/app.jfr \\
  -jar app.jar

# Latensi ketat & heap besar: coba ZGC (generational secara default sejak JDK 23)
java -XX:+UseZGC -XX:MaxRAMPercentage=75 -jar app.jar

# Cek flag efektif tanpa menjalankan aplikasi
java -XX:MaxRAMPercentage=75 -XX:+PrintFlagsFinal -version | grep -E "MaxHeapSize|UseG1GC|UseSerialGC"`, 'bash'),
      callout('warn', 'Memori container bukan hanya heap', 'Tanpa flag, heap maksimum default sekitar 1/4 memori yang terlihat (JVM sudah sadar limit container). Dengan `MaxRAMPercentage=75`, sisa 25% dipakai metaspace, thread stack, code cache, direct buffer, dan GC itu sendiri. Bila pod mati dengan exit code 137 tanpa `OutOfMemoryError` di log, kemungkinan besar memori **native** yang membengkak: aktifkan `-XX:NativeMemoryTracking=summary` dan periksa `jcmd <pid> VM.native_memory summary`. Perhatikan juga: container dengan 1 CPU membuat JVM memilih Serial GC; set GC secara eksplisit bila itu tidak diinginkan.'),
      code('Diagnosis dengan jcmd & JFR', `jcmd                                          # daftar proses JVM beserta PID
jcmd <pid> VM.flags                           # flag efektif: GC terpilih, ukuran heap
jcmd <pid> GC.heap_info                       # pemakaian heap per region/generasi
jcmd <pid> GC.class_histogram | head -25      # jumlah & ukuran objek per class (memicu full GC)
jcmd <pid> Thread.print > threads.txt         # thread dump: deadlock, thread tertahan di I/O
jcmd <pid> GC.heap_dump /dumps/heap.hprof     # heap dump: ada pause, hati-hati heap besar di produksi

# Java Flight Recorder: profiling overhead rendah, aman di produksi
jcmd <pid> JFR.start name=leak duration=10m settings=profile filename=/dumps/leak.jfr
jcmd <pid> JFR.dump name=leak filename=/dumps/leak-now.jfr    # ambil snapshot sebelum selesai
jfr summary /dumps/leak.jfr
jfr print --events jdk.GarbageCollection /dumps/leak.jfr | head -40
# Buka file .jfr di JDK Mission Control (JMC): hot method, alokasi, lock contention, GC pause`, 'bash'),
      code('Pola memory leak yang paling sering', `// 1. Cache static tanpa batas
public class SessionRegistry {
    private static final Map<String, UserSession> SESSIONS = new ConcurrentHashMap<>();
    public static void onLogin(UserSession s) { SESSIONS.put(s.id(), s); }
    // tidak ada penghapusan saat session kedaluwarsa -> tumbuh selamanya
}
// Perbaikan: batas ukuran + kedaluwarsa, mis. Caffeine
Cache<String, UserSession> sessions = Caffeine.newBuilder()
    .maximumSize(100_000)
    .expireAfterAccess(Duration.ofMinutes(30))
    .build();

// 2. ThreadLocal di thread pool: thread hidup selamanya, nilainya ikut hidup
private static final ThreadLocal<RequestContext> CONTEXT = new ThreadLocal<>();
void handle(Request req) {
    CONTEXT.set(new RequestContext(req));
    try { process(req); }
    finally { CONTEXT.remove(); }        // wajib; juga mencegah data request bocor ke request lain
}

// 3. Listener/callback yang didaftarkan tapi tidak pernah dilepas
eventBus.register(this);                 // objek ini kini direferensikan eventBus selamanya

// 4. Antrian tanpa batas antara producer cepat dan consumer lambat
BlockingQueue<Job> jobs = new LinkedBlockingQueue<>();          // kapasitas Integer.MAX_VALUE
BlockingQueue<Job> bounded = new ArrayBlockingQueue<>(10_000); // backpressure`, 'java'),
      table(['Langkah diagnosis leak', 'Yang dicari'], [
        ['1. Lihat grafik heap setelah GC (metrik Micrometer/JFR)', 'Pola gergaji normal; garis dasar setelah GC yang terus naik = kandidat leak'],
        ['2. `GC.class_histogram` dua kali berselang beberapa menit', 'Class yang jumlah instance-nya terus bertambah'],
        ['3. Heap dump, buka di Eclipse MAT', 'Laporan *Leak Suspects* dan *Dominator Tree* (retained heap terbesar)'],
        ['4. *Path to GC Roots* dari objek tersangka', 'Siapa yang menahan objek: field static, ThreadLocal, cache, listener'],
        ['5. Perbaiki, lalu ulangi uji beban', 'Garis dasar heap setelah GC menjadi datar'],
      ]),
      ...quiz([
        ['JC-19', 'Grafik heap berbentuk gergaji, tetapi titik terendah setelah setiap GC terus naik selama berjam-jam. Apa artinya dan apa langkah berikutnya?', 'Pola gergaji sendiri normal (objek dialokasikan lalu dibersihkan). Titik terendah yang terus naik berarti ada objek yang tetap reachable dan menumpuk, tanda memory leak. Ambil class histogram berkala untuk melihat class yang tumbuh, lalu heap dump dan analisis dominator tree serta path to GC roots di Eclipse MAT.'],
        ['JC-20', 'Pod Kubernetes di-restart dengan exit code 137, tetapi tidak ada `OutOfMemoryError` di log dan heap terlihat aman. Apa penyebab yang mungkin?', 'Kernel membunuh proses karena total memori proses melewati limit container (OOMKilled), bukan karena heap penuh. Penyebabnya memori non-heap: metaspace, thread stack (banyak thread platform), direct buffer (Netty/NIO), code cache, atau `-Xmx` yang terlalu dekat dengan limit. Turunkan persentase heap, aktifkan Native Memory Tracking, dan ukur.'],
        ['JC-21', 'Kapan memilih ZGC daripada G1?', 'Bila latensi ekor (p99/p999) sangat penting dan pause G1 puluhan sampai ratusan milidetik tidak bisa diterima, terutama pada heap besar. ZGC generasional memberi pause sub-milidetik dengan biaya CPU dan headroom memori sedikit lebih besar. Untuk kebanyakan layanan, G1 sudah cukup; putuskan berdasarkan pengukuran GC log/JFR, bukan asumsi.'],
      ]),
      ...practice('jc-jvm-gc', [
        'Jalankan aplikasi dengan GC log dan JFR aktif, buka rekaman di JDK Mission Control, dan catat tiga method dengan alokasi terbesar.',
        'Buat leak sengaja (cache static tanpa batas), ambil heap dump, dan temukan penyebabnya lewat Dominator Tree di Eclipse MAT.',
        'Jalankan aplikasi yang sama di container dengan limit 512 MB dan 1 CPU; periksa GC terpilih dan `MaxHeapSize` dengan `jcmd VM.flags`.',
        'Bandingkan p99 latensi endpoint di bawah beban dengan G1 vs ZGC.',
      ]),
      references(
        ['HotSpot GC Tuning Guide', 'https://docs.oracle.com/en/java/javase/21/gctuning/'],
        ['Java Troubleshooting Guide', 'https://docs.oracle.com/en/java/javase/21/troubleshoot/'],
        ['jcmd reference', 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html'],
        ['JEP 474: ZGC Generational Mode by Default', 'https://openjdk.org/jeps/474'],
        ['JDK Mission Control', 'https://jdk.java.net/jmc/'],
        ['Eclipse Memory Analyzer (MAT)', 'https://eclipse.dev/mat/'],
        ['JVM Spec Ch. 5: Loading, Linking, and Initializing', 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html'],
      ),
    ],
  },
  {
    id: 'jc-jpa-mendalam',
    title: 'Spring Boot: JPA Mendalam — N+1, Transaksi & Locking',
    summary: 'Relasi & fetch type, N+1 dan solusinya (fetch join, @EntityGraph, batch size), @Transactional propagation/isolation/readOnly, self-invocation, locking, dan projection.',
    track: SPRING_DATA, source: javaCoreSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Modul [Spring Data JPA](#java.spring-data-jpa) mengenalkan repository, query method, locking, dan projection. Modul ini membahas apa yang membuat aplikasi JPA **lambat atau salah** di produksi: ratusan query tersembunyi (N+1), `LazyInitializationException`, `@Transactional` yang diam-diam tidak berlaku, dan update yang saling menimpa. Kalau kamu belum nyaman dengan transaksi JDBC manual, baca dulu [I/O, NIO.2 & JDBC](#java.jc-io-nio-jdbc).'),
      paragraph('Prinsip utama: **jadikan semua relasi LAZY**, lalu ambil data yang dibutuhkan secara eksplisit per use case (fetch join, entity graph, atau projection). Default JPA justru tidak konsisten: `@ManyToOne` dan `@OneToOne` defaultnya EAGER, sedangkan `@OneToMany` dan `@ManyToMany` LAZY.'),
      code('Entity dengan relasi LAZY dan @Version', `@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)   // default EAGER -> ubah ke LAZY
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();      // default LAZY

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal total;
    private Instant createdAt;

    @Version
    private long version;                                   // optimistic locking

    protected Order() {}                                    // dibutuhkan JPA

    public void addItem(OrderItem item) {                   // jaga kedua sisi relasi tetap sinkron
        items.add(item);
        item.setOrder(this);
    }
}`, 'java'),
      code('N+1: gejala dan tiga solusinya', `// GEJALA: 1 query untuk orders + N query untuk items (satu per order)
List<Order> orders = orderRepository.findByStatus(OrderStatus.PAID);   // SELECT ... FROM orders
for (Order o : orders) {
    o.getItems().size();                                               // SELECT ... FROM order_item WHERE order_id=? (xN)
}

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);

    // Solusi 1: fetch join — satu query dengan JOIN
    // (Hibernate 6 sudah menghapus duplikat root entity otomatis, DISTINCT tidak lagi wajib)
    @Query("select o from Order o join fetch o.items where o.status = :status")
    List<Order> findWithItemsByStatus(@Param("status") OrderStatus status);

    // Solusi 2: @EntityGraph — deklaratif, bisa dipasang di query method turunan
    @EntityGraph(attributePaths = {"customer", "items"})
    List<Order> findByCreatedAtAfter(Instant since);

    // Pagination + koleksi: ambil ID per halaman dulu, lalu fetch join berdasarkan ID
    @Query("select o.id from Order o where o.status = :status")
    Page<Long> findIdsByStatus(@Param("status") OrderStatus status, Pageable pageable);

    @Query("select o from Order o join fetch o.items where o.id in :ids")
    List<Order> findWithItemsByIds(@Param("ids") Collection<Long> ids);
}`, 'java'),
      code('Solusi 3: batch fetching + konfigurasi diagnosis', `spring:
  jpa:
    open-in-view: false                   # jangan biarkan lazy loading terjadi di controller/serializer
    properties:
      hibernate:
        default_batch_fetch_size: 50      # lazy collection dimuat per 50 parent: 1 + ceil(N/50) query
        generate_statistics: true         # hanya dev/test: jumlah query & entity per session
logging:
  level:
    org.hibernate.SQL: debug              # tampilkan SQL yang dijalankan
    org.hibernate.orm.jdbc.bind: trace    # nilai parameter (Hibernate 6) — jangan di produksi`, 'yaml'),
      table(['Teknik', 'Query', 'Kelebihan', 'Jebakan'], [
        ['Fetch join', '1', 'Eksplisit, paling sedikit round trip', 'Dengan pagination atas koleksi, Hibernate memaginasi di memori (peringatan HHH90003004); dua koleksi `List` sekaligus memicu `MultipleBagFetchException`'],
        ['`@EntityGraph`', '1', 'Tanpa menulis JPQL, bisa dipakai ulang', 'Jebakan sama dengan fetch join karena hasilnya juga JOIN'],
        ['Batch fetch size', '1 + N/ukuran batch', 'Global, aman untuk pagination dan banyak koleksi', 'Masih lebih dari satu query; tetap perlu dipantau'],
        ['Projection DTO', '1', 'Hanya kolom yang perlu, tanpa dirty checking', 'Hasilnya bukan entity terkelola (read-only)'],
      ]),
      paragraph('`@Transactional` bekerja lewat **proxy**: Spring membungkus bean, dan proxy itulah yang membuka transaksi sebelum method dipanggil lalu commit/rollback sesudahnya. Konsekuensinya: aturan transaksi hanya berlaku bila pemanggilan **melewati proxy**, dan secara default rollback hanya terjadi untuk `RuntimeException` dan `Error`.'),
      code('Propagation, readOnly, dan rollbackFor', `@Service
public class CheckoutService {
    private final OrderRepository orders;
    private final AuditService audit;

    public CheckoutService(OrderRepository orders, AuditService audit) {
        this.orders = orders;
        this.audit = audit;
    }

    @Transactional                                       // REQUIRED: ikut transaksi yang ada atau buat baru
    public Long checkout(CheckoutRequest req) {
        Order order = orders.save(Order.from(req));
        audit.record("CHECKOUT_ATTEMPT", order.getId()); // REQUIRES_NEW: tetap tersimpan walau checkout rollback
        if (req.total().compareTo(LIMIT) > 0) {
            throw new LimitExceededException(req.total()); // unchecked -> rollback order, audit tetap ada
        }
        return order.getId();
    }

    @Transactional(readOnly = true)                      // Hibernate melewati dirty checking & flush
    public OrderView view(Long id) {
        return orders.findById(id).map(OrderView::from).orElseThrow();
    }

    @Transactional(rollbackFor = Exception.class)        // checked exception defaultnya COMMIT!
    public void importFile(Path file) throws IOException {
        Files.readAllLines(file).forEach(line -> orders.save(Order.parse(line)));
    }
}

@Service
class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)   // transaksi & koneksi KEDUA
    public void record(String action, Long refId) { /* insert audit_log */ }
}`, 'java'),
      code('Jebakan self-invocation dan perbaikannya', `@Service
public class ReportService {
    public void generateAll(List<Long> ids) {
        for (Long id : ids) generateOne(id);     // this.generateOne(): TIDAK lewat proxy
    }                                            // -> anotasi di bawah diabaikan begitu saja

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateOne(Long id) { /* ... */ }
}

// Perbaikan 1 (disarankan): pindahkan ke bean lain, lalu inject
@Service
class ReportWorker {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateOne(Long id) { /* ... */ }
}

// Perbaikan 2: TransactionTemplate untuk kontrol programatik per item
@Service
public class ReportBatchService {
    private final TransactionTemplate tx;

    public ReportBatchService(PlatformTransactionManager tm) {
        this.tx = new TransactionTemplate(tm);
        this.tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void generateAll(List<Long> ids) {
        for (Long id : ids) {
            try {
                tx.executeWithoutResult(status -> generateOne(id));   // satu item gagal tidak membatalkan yang lain
            } catch (RuntimeException e) {
                log.warn("report {} gagal", id, e);
            }
        }
    }
}`, 'java'),
      table(['Propagation', 'Perilaku', 'Kapan dipakai'], [
        ['`REQUIRED` (default)', 'Ikut transaksi yang ada, atau buat baru', 'Hampir semua method service'],
        ['`REQUIRES_NEW`', 'Tangguhkan transaksi luar, buat transaksi baru (koneksi baru)', 'Audit log, outbox yang harus tetap tersimpan; hati-hati habisnya pool'],
        ['`NESTED`', 'Savepoint di dalam transaksi luar (JDBC/`DataSourceTransactionManager`)', 'Rollback sebagian tanpa membatalkan semuanya'],
        ['`SUPPORTS`', 'Ikut bila ada, tanpa transaksi bila tidak', 'Bacaan yang tidak peduli transaksi'],
        ['`MANDATORY`', 'Wajib sudah ada transaksi, jika tidak exception', 'Method yang hanya boleh dipanggil dari dalam transaksi'],
        ['`NOT_SUPPORTED` / `NEVER`', 'Jalan tanpa transaksi / exception bila ada transaksi', 'Panggilan lambat ke luar yang tidak boleh menahan koneksi'],
      ]),
      callout('warn', 'UnexpectedRollbackException', 'Jika method `REQUIRED` di dalam melempar RuntimeException, transaksi bersama ditandai *rollback-only*. Walaupun method luar menangkap exception itu dan lanjut, commit di akhir gagal dengan `UnexpectedRollbackException`. Jika kegagalan bagian dalam memang boleh diabaikan, jalankan bagian itu dengan `REQUIRES_NEW` atau jangan lempar exception. Isolation bisa diatur dengan `@Transactional(isolation = Isolation.REPEATABLE_READ)`; default-nya mengikuti database (PostgreSQL: READ COMMITTED, MySQL InnoDB: REPEATABLE READ).'),
      code('Optimistic vs pessimistic locking', `// Optimistic: @Version di entity. UPDATE ... WHERE id=? AND version=?; 0 baris -> konflik
@Service
class StockService {
    private final StockTx stockTx;               // bean lain dengan method @Transactional

    StockService(StockTx stockTx) { this.stockTx = stockTx; }

    public void adjust(Long productId, int delta) {
        for (int attempt = 1; ; attempt++) {     // retry DI LUAR transaksi: tiap percobaan transaksi baru
            try {
                stockTx.apply(productId, delta);
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                if (attempt == 3) throw e;
            }
        }
    }
}

// Pessimistic: kunci baris di database (SELECT ... FOR UPDATE)
public interface AccountRepository extends JpaRepository<Account, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))  // dukungan tergantung DB
    @Query("select a from Account a where a.id = :id")
    Optional<Account> findForUpdate(@Param("id") Long id);
}`, 'java'),
      table(['Aspek', 'Optimistic (`@Version`)', 'Pessimistic (`FOR UPDATE`)'], [
        ['Cara kerja', 'Deteksi konflik saat commit', 'Cegah konflik dengan mengunci saat baca'],
        ['Cocok untuk', 'Konflik jarang: edit profil, katalog', 'Konflik sering & mahal: saldo, stok flash sale, kursi'],
        ['Biaya', 'Tanpa lock; perlu retry/pesan ke user', 'Transaksi lain menunggu; risiko deadlock & lock timeout'],
        ['Rentang', 'Bisa lintas request (versi dikirim ke client)', 'Hanya selama transaksi; jaga transaksi tetap singkat'],
      ]),
      code('Projection: ambil hanya yang dibutuhkan', `public interface OrderSummary {                    // interface projection (closed)
    Long getId();
    OrderStatus getStatus();
    BigDecimal getTotal();
}

public record OrderRow(Long id, String customerName, BigDecimal total) {}

public interface OrderQueryRepository extends JpaRepository<Order, Long> {
    List<OrderSummary> findByStatus(OrderStatus status);           // SELECT hanya id, status, total

    @Query("""
        select new com.example.order.OrderRow(o.id, c.name, o.total)
        from Order o join o.customer c
        where o.createdAt >= :since
        """)
    List<OrderRow> findRowsSince(@Param("since") Instant since);   // DTO record lewat constructor expression

    <T> List<T> findByCustomerId(Long customerId, Class<T> type);  // dynamic projection
}`, 'java'),
      ...quiz([
        ['JC-22', 'Endpoint daftar 100 order dengan item-nya menjalankan 101 query. Sebutkan dua perbaikan dan kapan masing-masing lebih tepat.', 'Itu N+1. Fetch join atau `@EntityGraph` menjadikannya satu query dan cocok bila tanpa pagination atau hanya satu koleksi. Bila endpoint dipaginasi, fetch join atas koleksi membuat Hibernate memaginasi di memori; lebih tepat memakai `default_batch_fetch_size` (1 + N/batch query) atau pola dua langkah: ambil ID per halaman, lalu fetch join berdasarkan ID. Untuk tampilan read-only, projection DTO sering paling efisien.'],
        ['JC-23', 'Method `generateAll()` memanggil `generateOne()` di class yang sama, dan `generateOne` diberi `@Transactional(REQUIRES_NEW)`. Mengapa tidak ada transaksi baru?', 'Transaksi diterapkan oleh proxy Spring di sekitar bean. Pemanggilan internal `this.generateOne()` langsung menuju objek asli, tidak melewati proxy, sehingga anotasinya tidak pernah dievaluasi. Pindahkan method ke bean lain dan inject, atau gunakan `TransactionTemplate`.'],
        ['JC-24', 'Method `@Transactional` melempar `IOException` setelah menyimpan dua entity. Apakah datanya di-rollback?', 'Tidak, secara default. Spring hanya rollback untuk unchecked exception (`RuntimeException`) dan `Error`; checked exception membuat transaksi tetap commit. Tambahkan `rollbackFor = Exception.class` atau terjemahkan ke unchecked exception.'],
      ]),
      ...practice('jc-jpa', [
        'Aktifkan log SQL dan statistik Hibernate, reproduksi N+1 di endpoint daftar, lalu perbaiki dengan fetch join dan bandingkan jumlah query.',
        'Set `spring.jpa.open-in-view: false` dan perbaiki semua `LazyInitializationException` yang muncul dengan fetch eksplisit atau DTO.',
        'Tulis tes yang membuktikan audit `REQUIRES_NEW` tetap tersimpan saat checkout di-rollback.',
        'Simulasikan dua update bersamaan pada entity ber-`@Version` dan tangani `ObjectOptimisticLockingFailureException` dengan retry di luar transaksi.',
      ]),
      references(
        ['Spring Framework: Declarative Transaction Management', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html'],
        ['Spring Framework: Transaction Propagation', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html'],
        ['Spring Data JPA: Projections', 'https://docs.spring.io/spring-data/jpa/reference/repositories/projections.html'],
        ['Spring Data JPA reference', 'https://docs.spring.io/spring-data/jpa/reference/'],
        ['Hibernate ORM documentation', 'https://hibernate.org/orm/documentation/'],
      ),
    ],
  },
  {
    id: 'jc-spring-cache-scheduling-openapi',
    title: 'Spring Boot: Cache, Scheduling & OpenAPI',
    summary: '@Cacheable dengan Caffeine dan Redis (TTL per cache, sync, key), @Scheduled yang aman di banyak instance dengan ShedLock, dan dokumentasi API dengan springdoc-openapi.',
    track: SPRING_ADVANCED, source: javaCoreSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Tiga kebutuhan yang muncul di hampir setiap layanan produksi. Konsep caching (cache-aside, stampede, invalidasi) sudah dibahas di [Caching](#distributed.caching), dan dasar `@Cacheable` dengan Redis ada di [Spring Data Redis](#java.spring-data-redis); `@Scheduled` dasar ada di [Spring Async](#java.spring-async). Modul ini fokus pada detail yang membedakan demo dan produksi: **TTL per cache, key yang benar, cache lokal vs terdistribusi, job terjadwal yang tidak berjalan ganda saat aplikasi di-scale ke beberapa instance, dan kontrak API yang terdokumentasi.**'),
      code('Dependensi & konfigurasi Caffeine', `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
  <groupId>com.github.ben-manes.caffeine</groupId>
  <artifactId>caffeine</artifactId>              <!-- versi dikelola Spring Boot -->
</dependency>`, 'xml'),
      code('application.yaml — Caffeine', `spring:
  cache:
    type: caffeine
    cache-names: products,exchange-rates
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=10m,recordStats   # recordStats -> metrik hit/miss`, 'yaml'),
      code('Anotasi cache dengan key, kondisi, dan sync', `@Configuration
@EnableCaching
class CacheConfig {}

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    @Cacheable(cacheNames = "products", key = "#id", unless = "#result == null")
    public ProductDto find(Long id) {
        return repo.findById(id).map(ProductDto::from).orElse(null);
    }

    // sync = true: saat cache miss bersamaan, hanya satu thread yang memanggil method (cegah stampede lokal)
    @Cacheable(cacheNames = "exchange-rates", key = "#from + ':' + #to", sync = true)
    public BigDecimal rate(String from, String to) {
        return rateClient.fetch(from, to);
    }

    @CachePut(cacheNames = "products", key = "#result.id()")    // perbarui cache dengan hasil terbaru
    @Transactional
    public ProductDto update(Long id, UpdateProduct cmd) {
        Product p = repo.findById(id).orElseThrow();
        p.apply(cmd);
        return ProductDto.from(p);
    }

    @CacheEvict(cacheNames = "products", key = "#id")
    public void delete(Long id) { repo.deleteById(id); }

    @CacheEvict(cacheNames = "products", allEntries = true)
    public void reindexAll() { /* ... */ }
}`, 'java'),
      code('Redis sebagai cache terdistribusi (application.yaml)', `spring:
  cache:
    type: redis
    redis:
      time-to-live: 10m           # TTL default semua cache
      key-prefix: "shop:"
      cache-null-values: false
  data:
    redis:
      host: localhost
      port: 6379`, 'yaml'),
      code('TTL berbeda per cache lewat customizer Spring Boot', `@Configuration
class RedisCacheConfig {
    @Bean
    RedisCacheManagerBuilderCustomizer cacheTtls() {
        return builder -> builder
            .withCacheConfiguration("exchange-rates",
                RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(1)))
            .withCacheConfiguration("products",
                RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(1)));
    }
}`, 'java'),
      table(['Aspek', 'Caffeine (lokal)', 'Redis (terdistribusi)'], [
        ['Latensi', 'Nanodetik–mikrodetik, di heap', 'Sub-milidetik + round trip jaringan + serialisasi'],
        ['Konsistensi antar instance', 'Tiap instance punya salinan sendiri; evict hanya lokal', 'Satu sumber bersama untuk semua instance'],
        ['Kapasitas', 'Dibatasi heap (ikut memengaruhi GC)', 'Dibatasi memori Redis, terpisah dari JVM'],
        ['Cocok untuk', 'Data referensi kecil, kurs, konfigurasi; toleran sedikit basi', 'Data yang di-update dan harus konsisten antar instance, sesi'],
      ]),
      callout('warn', 'Jebakan cache yang sering terjadi', '**Self-invocation**: seperti `@Transactional`, anotasi cache bekerja lewat proxy, jadi pemanggilan dari method di class yang sama tidak di-cache. **Key**: tanpa `key`, Spring memakai semua parameter; parameter berupa objek tanpa `equals`/`hashCode` membuat cache tidak pernah hit. **Objek mutable**: Caffeine mengembalikan objek yang sama — jika pemanggil mengubahnya, isi cache ikut berubah; cache DTO/record immutable. **Redis**: class yang di-cache harus bisa diserialisasi dan kompatibel antar versi deploy.'),
      code('@Scheduled yang aman di banyak instance dengan ShedLock', `<!-- pom.xml: cek versi terbaru ShedLock di Maven Central -->
<dependency>
  <groupId>net.javacrumbs.shedlock</groupId>
  <artifactId>shedlock-spring</artifactId>
  <version>\${shedlock.version}</version>
</dependency>
<dependency>
  <groupId>net.javacrumbs.shedlock</groupId>
  <artifactId>shedlock-provider-jdbc-template</artifactId>
  <version>\${shedlock.version}</version>
</dependency>`, 'xml'),
      code('Flyway migration: tabel lock ShedLock', `CREATE TABLE shedlock (
    name       VARCHAR(64)  NOT NULL PRIMARY KEY,
    lock_until TIMESTAMP    NOT NULL,
    locked_at  TIMESTAMP    NOT NULL,
    locked_by  VARCHAR(255) NOT NULL
);`, 'sql'),
      code('Konfigurasi scheduler + lock', `@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT10M")
class SchedulingConfig {
    @Bean
    LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
            JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(new JdbcTemplate(dataSource))
                .usingDbTime()                    // pakai jam database, bukan jam tiap pod
                .build());
    }
}

@Component
class BillingJobs {
    // Detik Menit Jam Tanggal Bulan Hari -> setiap hari jam 02:00 WIB
    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Jakarta")
    @SchedulerLock(name = "dailyInvoice", lockAtMostFor = "PT30M", lockAtLeastFor = "PT1M")
    public void generateDailyInvoices() {
        invoiceService.generateFor(LocalDate.now(ZoneId.of("Asia/Jakarta")).minusDays(1));
    }

    @Scheduled(fixedDelay = 30, timeUnit = TimeUnit.SECONDS)     // jeda 30 dtk SETELAH run sebelumnya selesai
    @SchedulerLock(name = "outboxRelay", lockAtMostFor = "PT2M")
    public void relayOutbox() { outbox.publishPending(); }
}`, 'java'),
      table(['Mode', 'Perilaku', 'Catatan'], [
        ['`fixedRate`', 'Mulai setiap N, dihitung dari awal run sebelumnya', 'Bila run lebih lama dari N, eksekusi berikutnya langsung menyusul'],
        ['`fixedDelay`', 'Tunggu N setelah run sebelumnya selesai', 'Paling aman untuk job polling'],
        ['`cron`', 'Jadwal kalender, 6 field (diawali detik)', 'Selalu set `zone`; default zona waktu JVM/server'],
      ]),
      callout('info', 'Thread scheduler', 'Scheduler bawaan Spring Boot hanya punya **satu thread** (`spring.task.scheduling.pool.size`, default 1): satu job lambat menunda semua job lain. Naikkan ukuran pool atau aktifkan virtual thread (`spring.threads.virtual.enabled=true`). ShedLock tidak menggantikan antrian job; ia hanya memastikan satu instance yang menjalankan job pada satu waktu. `lockAtMostFor` harus lebih lama dari durasi normal job, karena lock dilepas paksa setelah waktu itu bila pod mati.'),
      code('springdoc-openapi: dependensi',`<!-- springdoc 2.x untuk Spring Boot 3, 3.x untuk Spring Boot 4: cek tabel kompatibilitas -->
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>\${springdoc.version}</version>
</dependency>`, 'xml'),
      code('Controller, DTO, dan konfigurasi OpenAPI', `// Swagger UI: /swagger-ui.html   Spesifikasi JSON: /v3/api-docs
@RestController
@RequestMapping("/api/products")
@Tag(name = "Produk", description = "Katalog produk")
class ProductController {
    @Operation(summary = "Ambil produk berdasarkan ID")
    @ApiResponse(responseCode = "200", description = "Ditemukan")
    @ApiResponse(responseCode = "404", description = "Produk tidak ada",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{id}")
    ProductDto get(@Parameter(description = "ID produk", example = "42") @PathVariable Long id) {
        return productService.findOrThrow(id);
    }
}

public record ProductDto(
    @Schema(example = "42") Long id,
    @Schema(example = "Kopi Gayo 250g") String name,
    @Schema(description = "Harga dalam rupiah", example = "85000") long price) {}

@Configuration
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
class OpenApiConfig {
    @Bean
    OpenAPI shopApi() {
        return new OpenAPI()
            .info(new Info().title("Shop API").version("v1").description("API katalog & pesanan"))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));  // tombol Authorize di UI
    }
}`, 'java'),
      code('Matikan Swagger UI di produksi', `springdoc:
  packages-to-scan: com.example.shop.api
---
spring:
  config:
    activate:
      on-profile: prod
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false`, 'yaml'),
      callout('tip', 'Kontrak API di CI', 'Simpan hasil `/v3/api-docs` sebagai artefak build dan bandingkan dengan versi sebelumnya (misal dengan tool diff OpenAPI) untuk mendeteksi *breaking change* sebelum rilis. Alternatifnya pendekatan *contract-first*: tulis spesifikasi OpenAPI dulu, lalu generate interface controller dengan OpenAPI Generator.'),
      ...quiz([
        ['JC-25', 'Aplikasi berjalan di 3 pod dan memakai Caffeine untuk cache produk. Setelah harga di-update, sebagian request masih menampilkan harga lama. Mengapa, dan apa pilihannya?', '`@CacheEvict` hanya menghapus cache lokal di pod yang menerima request update; dua pod lain masih menyimpan salinan lama sampai TTL habis. Pilihannya: pindah ke Redis sebagai cache bersama, memakai TTL pendek bila sedikit basi masih dapat diterima, atau menyiarkan event invalidasi ke semua instance (misal lewat Redis pub/sub atau broker).'],
        ['JC-26', 'Job `@Scheduled` mengirim email tagihan dua kali setelah aplikasi di-scale ke 2 pod. Apa penyebab dan solusinya?', 'Setiap instance menjalankan scheduler-nya sendiri, jadi job berjalan di kedua pod. Gunakan lock terdistribusi seperti ShedLock dengan tabel di database bersama sehingga hanya satu instance yang memperoleh lock per jadwal. Tetap buat job idempotent (misal tandai invoice yang sudah dikirim) karena lock bisa dilepas paksa setelah `lockAtMostFor`.'],
      ]),
      ...practice('jc-cache-scheduling', [
        'Pasang Caffeine dengan `recordStats`, beri `@Cacheable` pada endpoint lambat, dan tampilkan hit ratio lewat metrik actuator `cache.gets`.',
        'Pindahkan cache ke Redis dengan TTL berbeda untuk dua cache, lalu buktikan evict terlihat dari dua instance aplikasi.',
        'Buat job `@Scheduled` dengan ShedLock, jalankan dua instance, dan buktikan dari log hanya satu yang mengeksekusi.',
        'Dokumentasikan semua endpoint dengan springdoc (contoh nilai, kode error, skema keamanan JWT) dan matikan UI di profil `prod`.',
      ]),
      references(
        ['Spring Boot: Caching', 'https://docs.spring.io/spring-boot/reference/io/caching.html'],
        ['Spring Framework: Cache Abstraction', 'https://docs.spring.io/spring-framework/reference/integration/cache.html'],
        ['Spring Framework: Task Execution and Scheduling', 'https://docs.spring.io/spring-framework/reference/integration/scheduling.html'],
        ['ShedLock', 'https://github.com/lukas-krecan/ShedLock'],
        ['springdoc-openapi', 'https://springdoc.org/'],
      ),
    ],
  },
  {
    id: 'jc-spring-messaging-reliability',
    title: 'Spring Boot: Messaging Andal — Idempotent Consumer, Retry & Dead Letter',
    summary: 'Spring for Apache Kafka dan Spring AMQP di produksi: konfigurasi andal, retry blocking vs non-blocking, dead-letter topic/queue, dan consumer idempotent.',
    track: SPRING_ADVANCED, source: javaCoreSource, duration: '3 jam', level: 'Hard',
    blocks: [
      paragraph('Dasar message broker, producer/consumer RabbitMQ & Kafka, dan perbandingan keduanya sudah ada di [Message Queue / Message Broker](#distributed.message-queue-message-broker). Modul itu berhenti pada nasihat "buat consumer idempoten dan siapkan DLQ". Modul ini adalah **implementasinya**: apa yang terjadi saat listener melempar exception, bagaimana mencegah satu *poison message* memblokir partisi, bagaimana pesan gagal berakhir di dead-letter topic, dan bagaimana menjamin pesan duplikat tidak memproses pembayaran dua kali.'),
      paragraph('Asumsi yang harus selalu dipegang: pengiriman di Kafka maupun RabbitMQ pada praktiknya **at-least-once**. Consumer bisa crash setelah memproses tetapi sebelum offset/ack tercatat, rebalance bisa terjadi di tengah, dan producer bisa mengirim ulang. Jadi duplikat adalah kondisi normal yang harus ditangani di kode, bukan kasus langka.'),
      callout('info', 'Versi API', 'Contoh Kafka di modul ini memakai API Spring for Apache Kafka 3.x (Spring Boot 3). Spring Boot 4 membawa Spring for Apache Kafka 4.x, yang antara lain beralih dari Spring Retry ke mekanisme retry milik Spring Framework 7 dan menambah serializer berbasis Jackson 3 — anotasi backoff dan nama class serializer bisa berbeda. Cek panduan migrasi sebelum menyalin ke proyek Boot 4.'),
      code('Konfigurasi Kafka yang andal (application.yaml)', `spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      acks: all                                # tunggu semua replika in-sync
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        enable.idempotence: true               # cegah duplikat akibat retry producer
    consumer:
      group-id: ledger-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      # Bungkus deserializer: payload rusak tidak membuat listener crash berulang-ulang
      value-deserializer: org.springframework.kafka.support.serializer.ErrorHandlingDeserializer
      properties:
        spring.deserializer.value.delegate.class: org.springframework.kafka.support.serializer.JsonDeserializer
        spring.json.trusted.packages: com.example.events
    listener:
      ack-mode: record                         # commit offset per record setelah listener sukses`, 'yaml'),
      code('Retry blocking + dead-letter topic dengan DefaultErrorHandler', `@Configuration
class KafkaErrorHandlingConfig {

    // Spring Boot otomatis memasang bean CommonErrorHandler ke container factory bawaan
    @Bean
    DefaultErrorHandler kafkaErrorHandler(KafkaOperations<Object, Object> template) {
        // Setelah retry habis: kirim ke "<topic>.DLT" di partisi yang sama, lengkap dengan header error
        var recoverer = new DeadLetterPublishingRecoverer(template);

        var backOff = new ExponentialBackOffWithMaxRetries(3);   // 1 percobaan + 3 retry
        backOff.setInitialInterval(500);
        backOff.setMultiplier(2.0);
        backOff.setMaxInterval(5_000);

        var handler = new DefaultErrorHandler(recoverer, backOff);
        // Error permanen: retry tidak akan menolong -> langsung ke DLT
        // (DeserializationException dkk. sudah dianggap fatal secara default)
        handler.addNotRetryableExceptions(InvalidPaymentException.class);
        return handler;
    }
}

@Component
class PaymentListener {
    private final PaymentHandler handler;                 // bean terpisah agar @Transactional lewat proxy

    PaymentListener(PaymentHandler handler) { this.handler = handler; }

    @KafkaListener(topics = "payments.requested")
    void onMessage(PaymentRequested event) {
        handler.handle(event);                            // exception -> DefaultErrorHandler mengambil alih
    }
}`, 'java'),
      code('Retry non-blocking dengan @RetryableTopic', `@Component
class NotificationListener {

    @RetryableTopic(
        attempts = "4",                                          // total percobaan, termasuk yang pertama
        backoff = @Backoff(delay = 1_000, multiplier = 2.0),     // org.springframework.retry.annotation.Backoff (3.x)
        exclude = InvalidRecipientException.class)               // langsung ke DLT
    @KafkaListener(topics = "notifications")
    void send(NotificationRequested event) {
        emailGateway.send(event);                                // gagal -> pindah ke topic retry, partisi utama lanjut
    }

    @DltHandler
    void dead(NotificationRequested event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.error("Notifikasi {} masuk {} setelah semua retry gagal", event.id(), topic);
        alerting.raise("notification-dlt", event.id());
    }
}`, 'java'),
      table(['Aspek', 'Blocking (`DefaultErrorHandler`)', 'Non-blocking (`@RetryableTopic`)'], [
        ['Mekanisme', 'Retry di thread consumer, record di-seek ulang', 'Record dipindah ke topic retry, diproses ulang setelah jeda'],
        ['Urutan per key', 'Terjaga', 'Tidak terjaga: pesan berikutnya bisa diproses lebih dulu'],
        ['Dampak ke partisi', 'Partisi tertahan selama backoff', 'Partisi utama tetap mengalir'],
        ['Topic tambahan', 'Hanya DLT', 'Beberapa topic retry + DLT'],
        ['Cocok untuk', 'Event yang urutannya penting (ledger, status order); backoff total pendek', 'Panggilan eksternal yang bisa lama gagal (email, webhook)'],
      ]),
      callout('warn', 'Backoff panjang di blocking retry', 'Total waktu blocking retry harus jauh di bawah `max.poll.interval.ms` (default 5 menit). Jika tidak, broker menganggap consumer mati, terjadi rebalance, dan record yang sama diproses consumer lain — retry tanpa akhir. Untuk penundaan panjang, gunakan retry non-blocking.'),
      paragraph('**Idempotent consumer** berarti memproses pesan yang sama dua kali menghasilkan efek yang sama dengan sekali. Pola yang paling andal: setiap event membawa `eventId` unik, dan consumer mencatat ID yang sudah diproses **di transaksi database yang sama** dengan perubahan bisnisnya. Bila crash terjadi setelah commit tetapi sebelum offset tercatat, pesan dikirim ulang, insert ID gagal karena duplikat, dan pesan dilewati dengan aman.'),
      code('Flyway migration: tabel processed_events', `CREATE TABLE processed_events (
    event_id     UUID         NOT NULL,
    consumer     VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (event_id, consumer)
);`, 'sql'),
      code('Idempotent consumer: catat ID di transaksi yang sama', `@Service
class PaymentHandler {
    private final JdbcClient jdbc;
    private final LedgerService ledger;

    PaymentHandler(JdbcClient jdbc, LedgerService ledger) {
        this.jdbc = jdbc;
        this.ledger = ledger;
    }

    @Transactional
    public void handle(PaymentRequested event) {
        int inserted = jdbc.sql("""
                INSERT INTO processed_events(event_id, consumer)
                VALUES (:id, 'ledger')
                ON CONFLICT DO NOTHING
                """)
            .param("id", event.eventId())
            .update();

        if (inserted == 0) return;                       // duplikat: sudah diproses, abaikan

        ledger.credit(event.accountId(), event.amount()); // efek bisnis dalam transaksi yang SAMA
    }                                                    // commit: ID tercatat + saldo berubah, atau keduanya batal
}`, 'java'),
      code('Spring AMQP (RabbitMQ): retry lalu dead-letter exchange', `@Configuration
class RabbitTopology {
    static final String QUEUE = "orders.created";
    static final String DLX   = "orders.dlx";
    static final String DLQ   = "orders.created.dlq";

    @Bean
    Queue ordersQueue() {
        return QueueBuilder.durable(QUEUE)
            .deadLetterExchange(DLX)              // pesan yang di-reject tanpa requeue dikirim ke sini
            .deadLetterRoutingKey(DLQ)
            .build();
    }

    @Bean DirectExchange deadLetterExchange() { return new DirectExchange(DLX); }
    @Bean Queue deadLetterQueue() { return QueueBuilder.durable(DLQ).build(); }
    @Bean Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(DLQ);
    }
}`, 'java'),
      code('application.yaml — retry listener RabbitMQ', `spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: auto
        default-requeue-rejected: false   # jangan requeue tanpa henti (poison message loop)
        retry:
          enabled: true                   # retry di memori consumer, lalu reject -> DLX
          max-attempts: 4
          initial-interval: 1s
          multiplier: 2.0
          max-interval: 10s`, 'yaml'),
      callout('tip', 'Sisi producer: outbox', 'Idempotent consumer melindungi dari duplikat, tetapi tidak dari pesan yang **hilang** karena *dual write*: data tersimpan di database, lalu aplikasi crash sebelum `kafkaTemplate.send`. Pola **transactional outbox** menyimpan event ke tabel outbox dalam transaksi yang sama dengan data bisnis, lalu relay (job terjadwal atau CDC seperti Debezium) yang mempublikasikannya. DLT juga perlu pemilik: pasang alert pada jumlah pesan DLT dan siapkan cara me-*replay* setelah bug diperbaiki.'),
      ...quiz([
        ['JC-27', 'Mengapa consumer tetap harus idempoten walaupun producer sudah memakai `enable.idempotence=true`?', 'Producer idempotence hanya mencegah duplikat yang ditulis ke partisi akibat retry producer. Duplikat di sisi consumer tetap terjadi: consumer bisa crash setelah memproses tetapi sebelum offset di-commit, atau rebalance terjadi di tengah pemrosesan, sehingga record yang sama dikirim ulang. Efek ke sistem luar (database, email, pembayaran) hanya aman bila consumer sendiri mendeteksi duplikat.'],
        ['JC-28', 'Tim memakai `@RetryableTopic` untuk event perubahan status order (CREATED lalu PAID lalu SHIPPED). Apa risikonya?', 'Retry non-blocking memindahkan record gagal ke topic retry sementara record berikutnya untuk key yang sama tetap diproses. Event PAID yang gagal sementara bisa diproses setelah SHIPPED, sehingga status akhir salah. Untuk event yang urutannya penting, pakai blocking retry dengan backoff pendek, atau buat consumer menolak transisi status yang tidak valid (misal berdasarkan nomor versi).'],
        ['JC-29', 'Apa itu poison message dan bagaimana konfigurasi di modul ini menanganinya?', 'Pesan yang selalu gagal diproses (payload rusak, data tidak valid). Tanpa penanganan, consumer me-retry selamanya dan partisi/queue macet. `ErrorHandlingDeserializer` mengubah payload rusak menjadi error yang dianggap fatal, `DefaultErrorHandler` membatasi retry lalu mengirim ke DLT, exception permanen langsung ke DLT, dan di RabbitMQ `default-requeue-rejected: false` mengarahkan pesan ke dead-letter exchange.'],
      ]),
      ...practice('jc-messaging', [
        'Jalankan Kafka di Docker, kirim event dengan payload rusak, dan buktikan pesan itu masuk `<topic>.DLT` tanpa menghentikan consumer.',
        'Implementasikan tabel `processed_events`, kirim event yang sama dua kali, dan buktikan saldo hanya bertambah sekali.',
        'Bandingkan blocking retry dan `@RetryableTopic` dengan layanan email tiruan yang gagal 3 kali; amati urutan pemrosesan dan topic yang dibuat.',
        'Konfigurasi queue RabbitMQ dengan DLX dan retry 4 kali; buktikan pesan gagal berakhir di DLQ, lalu tulis skrip replay sederhana.',
      ]),
      references(
        ['Spring for Apache Kafka reference', 'https://docs.spring.io/spring-kafka/reference/'],
        ['Spring Kafka: Non-Blocking Retries', 'https://docs.spring.io/spring-kafka/reference/retrytopic.html'],
        ['Spring Boot: Apache Kafka support', 'https://docs.spring.io/spring-boot/reference/messaging/kafka.html'],
        ['Spring AMQP reference', 'https://docs.spring.io/spring-amqp/reference/'],
        ['RabbitMQ: Dead Letter Exchanges', 'https://www.rabbitmq.com/docs/dlx'],
      ),
    ],
  },
  {
    id: 'jc-graalvm-native-aot',
    title: 'Spring Boot: GraalVM Native Image, AOT & CDS',
    summary: 'Native image dengan Spring AOT, runtime hints, buildpacks, serta alternatif startup cepat di JVM (CDS & AOT cache) — dan trade-off masing-masing.',
    track: SPRING_ADVANCED, source: javaCoreSource, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('Aplikasi Spring Boot di JVM biasanya butuh beberapa detik untuk start dan ratusan MB memori. Untuk layanan yang berjalan berhari-hari itu tidak masalah, tetapi untuk *serverless*, *scale-to-zero*, CLI, atau autoscaling agresif, waktu start dan memori adalah biaya langsung. Ada dua jalur: **GraalVM Native Image** (kompilasi ke executable native) dan **mempercepat JVM** dengan CDS/AOT cache. Keduanya punya trade-off nyata; pilih berdasarkan pengukuran.'),
      paragraph('Native image bekerja dengan asumsi **closed world**: saat build, analisis statis menentukan semua class, method, dan resource yang bisa dijangkau; yang tidak terdeteksi tidak ada di executable. Reflection, proxy dinamis, dan resource classpath harus diketahui saat build. Spring Boot menjalankan **AOT processing** yang mengevaluasi konfigurasi saat build, menghasilkan kode definisi bean, dan menulis *hints* untuk GraalVM.'),
      code('Membangun native image', `# Maven (spring-boot-starter-parent menyediakan profil "native")
# Tambahkan plugin org.graalvm.buildtools:native-maven-plugin ke <build><plugins>
./mvnw -Pnative native:compile          # butuh GraalVM / Liberica NIK dengan native-image di PATH
./target/myapp                          # executable native

# Image container via Cloud Native Buildpacks: tidak butuh GraalVM lokal, cukup Docker
./mvnw -Pnative spring-boot:build-image -Dspring-boot.build-image.imageName=myapp:native

# Gradle: terapkan plugin org.graalvm.buildtools.native (cek versi terbaru)
./gradlew nativeCompile                 # hasil: build/native/nativeCompile/myapp
./gradlew bootBuildImage                # otomatis native bila plugin GraalVM diterapkan

# Jalankan tes dalam mode native (menemukan hint yang kurang)
./mvnw -PnativeTest test
./gradlew nativeTest

# Lebih cepat untuk iterasi: jalankan hasil AOT di JVM biasa
./mvnw -Pnative package
java -Dspring.aot.enabled=true -jar target/myapp.jar`, 'bash'),
      code('Runtime hints untuk reflection & resource', `@Configuration
@ImportRuntimeHints(AppRuntimeHints.class)
class NativeConfig {}

class AppRuntimeHints implements RuntimeHintsRegistrar {
    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        // Resource yang dibaca lewat classpath, mis. getResourceAsStream("templates/invoice.mustache")
        hints.resources().registerPattern("templates/*.mustache");

        // Class yang dibuat lewat reflection oleh kode/library kita sendiri
        hints.reflection().registerType(LegacyPlugin.class,
            MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS, MemberCategory.INVOKE_PUBLIC_METHODS);
    }
}

// DTO yang di-(de)serialisasi manual dengan ObjectMapper (bukan lewat controller/RestClient)
@RegisterReflectionForBinding(ExchangeRateResponse.class)
@Component
class RateClient { /* ... */ }`, 'java'),
      code('Tracing agent: kumpulkan metadata otomatis', `# Jalankan di JVM dengan agent, lalu lewati skenario penting (hit endpoint, jalankan job)
java -Dspring.aot.enabled=true \\
  -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image/com.example/myapp \\
  -jar target/myapp.jar
# Saat aplikasi berhenti, file reachability metadata ditulis ke direktori itu dan ikut build berikutnya.
# Agent hanya merekam jalur kode yang benar-benar dieksekusi: tinjau hasilnya & lengkapi dengan tes native.`, 'bash'),
      callout('warn', 'Yang ditetapkan saat build oleh AOT', 'Dengan AOT, classpath dan definisi bean **dibekukan saat build**. Akibatnya: `@Profile` dan konfigurasi per profil yang menentukan bean mana yang dibuat, serta `@ConditionalOnProperty`/kondisi lain, dievaluasi saat build — mengganti profil aktif saat runtime tidak akan menambah atau menghapus bean. Nilai properti biasa (URL database, kredensial) tetap dibaca saat runtime. Java agent (mis. agent APM) tidak didukung di native image; periksa dukungan library observability-mu.'),
      paragraph('Bila native image terlalu mahal atau terlalu membatasi, percepat JVM. **Class Data Sharing (CDS)** menyimpan class yang sudah di-parse ke file arsip sehingga start berikutnya tidak perlu memuatnya ulang. Spring Boot (sejak 3.3) mendukung alur ini lewat ekstraksi jar. Project Leyden memperluasnya menjadi **AOT cache** yang juga menyimpan class yang sudah di-link (JDK 24, JEP 483) dan profil method (JDK 25, JEP 515), dengan perintah satu langkah di JDK 25 (JEP 514).'),
      code('CDS dan AOT cache di JVM', `# 1) Ekstrak jar ke layout yang ramah CDS
java -Djarmode=tools -jar target/myapp.jar extract --destination application
cd application

# 2) Training run: start aplikasi, berhenti otomatis setelah context refresh, rekam arsip
java -XX:ArchiveClassesAtExit=application.jsa -Dspring.context.exit=onRefresh -jar myapp.jar

# 3) Jalankan dengan arsip (classpath harus sama persis dengan saat training)
java -XX:SharedArchiveFile=application.jsa -jar myapp.jar

# JDK 25+: AOT cache Project Leyden, satu langkah training lalu pakai
java -XX:AOTCacheOutput=app.aot -Dspring.context.exit=onRefresh -jar myapp.jar
java -XX:AOTCache=app.aot -jar myapp.jar

# Buildpacks: aktifkan CDS saat membuat image (Maven: <image><env> di konfigurasi plugin)
#   BP_JVM_CDS_ENABLED=true`, 'bash'),
      table(['Aspek', 'JVM (JIT)', 'JVM + CDS / AOT cache', 'Native Image'], [
        ['Waktu start', 'Detik', 'Lebih cepat (ukur; tergantung aplikasi)', 'Puluhan–ratusan milidetik'],
        ['Memori (RSS)', 'Tertinggi', 'Mirip JVM', 'Jauh lebih kecil'],
        ['Throughput puncak', 'Terbaik setelah warm-up berkat JIT', 'Sama dengan JVM, warm-up lebih singkat (dengan profil method)', 'Umumnya lebih rendah; PGO membantu (Oracle GraalVM)'],
        ['Waktu & biaya build', 'Cepat', '+ training run', 'Menit, butuh RAM besar (beberapa GB)'],
        ['Kompatibilitas', 'Penuh', 'Penuh; JDK & classpath harus identik', 'Closed world: reflection/proxy/resource perlu hints'],
        ['Tooling', 'JFR, Java agent, heap dump lengkap', 'Sama dengan JVM', 'Terbatas; Java agent tidak didukung'],
        ['Cocok untuk', 'Layanan long-running', 'Layanan long-running yang sering di-scale', 'Serverless, scale-to-zero, CLI, sidecar'],
      ]),
      callout('tip', 'Cara memutuskan', 'Ukur tiga angka untuk aplikasimu sendiri di setiap opsi: waktu sampai siap menerima request, RSS di bawah beban, dan throughput/p99 setelah 5 menit. Bila masalah utamanya waktu start saat autoscaling, coba CDS/AOT cache dulu karena hampir tanpa risiko kompatibilitas. Pilih native bila biaya memori dan cold start mendominasi dan seluruh dependensimu sudah teruji di native (lihat GraalVM Reachability Metadata Repository).'),
      ...quiz([
        ['JC-30', 'Mengapa layanan native image bisa punya throughput puncak lebih rendah daripada versi JVM-nya?', 'JIT di JVM mengoptimalkan kode berdasarkan profil eksekusi nyata saat runtime (inlining agresif, spekulasi tipe, deoptimisasi bila asumsi salah). Native image dikompilasi sebelumnya tanpa profil runtime, sehingga optimasinya lebih konservatif. Profile-guided optimization di Oracle GraalVM mempersempit jaraknya, tetapi butuh langkah build tambahan.'],
        ['JC-31', 'Aplikasi native dibangun dengan profil default, lalu dijalankan dengan `--spring.profiles.active=prod`. Bean yang hanya ada di `@Profile("prod")` tidak muncul. Mengapa?', 'AOT processing mengevaluasi kondisi dan profil saat build, lalu membekukan daftar definisi bean. Saat runtime, profil yang berbeda tidak bisa menambah bean yang tidak dihasilkan saat build. Tentukan profil saat build (misal `spring.profiles.active` dalam konfigurasi AOT) atau hindari profil untuk menentukan keberadaan bean; gunakan properti untuk nilai konfigurasi.'],
      ]),
      ...practice('jc-native', [
        'Ukur waktu start dan RSS satu aplikasi Spring Boot REST di JVM biasa sebagai baseline.',
        'Terapkan CDS (atau AOT cache di JDK 25) dan bandingkan waktu start dengan baseline.',
        'Bangun native image lewat buildpacks, jalankan `nativeTest`, dan perbaiki minimal satu hint yang kurang dengan `RuntimeHintsRegistrar`.',
        'Tulis tabel perbandingan (start, RSS, throughput, waktu build) dan rekomendasi untuk aplikasimu di README.',
      ]),
      references(
        ['Spring Boot: GraalVM Native Images', 'https://docs.spring.io/spring-boot/reference/packaging/native-image/index.html'],
        ['Spring Boot: Packaging (CDS, AOT, container images)', 'https://docs.spring.io/spring-boot/reference/packaging/index.html'],
        ['GraalVM Native Image', 'https://www.graalvm.org/latest/reference-manual/native-image/'],
        ['JEP 483: Ahead-of-Time Class Loading & Linking', 'https://openjdk.org/jeps/483'],
        ['JEP 514: Ahead-of-Time Command-Line Ergonomics', 'https://openjdk.org/jeps/514'],
        ['Paketo Buildpacks', 'https://paketo.io/docs/'],
      ),
    ],
  },
];
