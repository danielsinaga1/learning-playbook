import type { Module } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

/**
 * Review materi Java dari masukan pengguna (infografik ConcurrentHashMap, carousel Strategy Pattern,
 * cheat sheet anotasi Spring, carousel 5 Java API). Kode disalin apa adanya dari labs/java-backend dan diuji:
 * jdk-api (JDK 21, 45 test) dan spring-anotasi (Spring Boot 4.1.2, 50 test). Output demo berasal dari run nyata 18-19 November 2026.
 */
export const javaReviewSource = 'Review materi Java: labs/java-backend, diuji dengan OpenJDK 21.0.2, Spring Boot 4.1.2 (Spring Framework 7.0.10, Spring Security 7.1.2), JUnit 6.0.3 (19 November 2026)';

const CORE = 'Java Inti: Bahasa & Platform';
const MODERN = 'Java Modern (17–25)';
const PATTERNS = 'Design Patterns';
const SPRING = 'Spring Boot: Inti';
const src = { source: javaReviewSource };

/** Modul baru beserta modul yang menjadi jangkarnya (disisipkan tepat setelahnya). */
export const javaReviewModules: { after: string; module: Omit<Module, 'code'> }[] = [
  {
    after: 'jc-concurrency-klasik',
    module: {
      id: 'jc-concurrenthashmap',
      title: 'Java Inti: ConcurrentHashMap Mendalam — Cara Kerja, Operasi Atomik & 14 Soal Interview',
      summary: 'Kapan dan bagaimana memakai ConcurrentHashMap dengan benar: cara kerja Java 8+, operasi atomik compute/merge, iterator weakly consistent, jebakan get-lalu-put, dan jawaban 14 soal interview, semuanya dibuktikan dengan kode.',
      track: CORE, ...src, duration: '2 jam', level: 'Med',
      blocks: [
        paragraph('`ConcurrentHashMap` (CHM) adalah implementasi `Map` di `java.util.concurrent` yang aman dipakai banyak thread sekaligus tanpa mengunci seluruh map. Ia dipakai di mana-mana di backend: cache lokal, counter metrik, registry sesi, rate limiter per pengguna. Modul [Concurrency Klasik](#java.jc-concurrency-klasik) sudah memperkenalkannya; modul ini membahasnya sampai tuntas, termasuk hal yang sering salah dipahami.'),
        callout('warn', 'Thread-safe bukan berarti logika Anda thread-safe', 'Setiap operasi CHM atomik, tetapi gabungan dua operasi tidak. `if (map.get(k) < 5) map.put(k, ...)` tetap race condition walaupun memakai CHM. Hampir semua bug CHM di produksi berasal dari pola cek-lalu-ubah seperti ini. Gantinya: `compute`, `computeIfAbsent`, `computeIfPresent`, `merge`, `putIfAbsent`, atau `replace(k, lama, baru)`.'),
        heading('Bukti: tiga cara menambah counter dari 8 thread'),
        code('labs/java-backend/jdk-api/.../chm/ChmDemo.java', `package id.playbook.jdkapi.chm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiPredicate;

/** Jalankan beberapa kali: hasil race condition berbeda setiap run. Angka di modul berasal dari run nyata. */
public final class ChmDemo {

    static final int THREADS = 8;
    static final int PER_THREAD = 100_000;

    public static void main(String[] args) throws Exception {
        System.out.printf("Target %,d penambahan dari %d thread%n", THREADS * PER_THREAD, THREADS);

        Map<String, Integer> hashMap = new HashMap<>();
        String galat = jalankan(() -> hashMap.merge("k", 1, Integer::sum));
        System.out.printf("HashMap.merge           : %,d%s%n", hashMap.getOrDefault("k", 0), galat);

        ConcurrentHashMap<String, Integer> getPut = new ConcurrentHashMap<>(Map.of("k", 0));
        galat = jalankan(() -> getPut.put("k", getPut.get("k") + 1));
        System.out.printf("CHM get() lalu put()    : %,d%s%n", getPut.get("k"), galat);

        ConcurrentHashMap<String, Integer> merge = new ConcurrentHashMap<>();
        galat = jalankan(() -> merge.merge("k", 1, Integer::sum));
        System.out.printf("CHM merge()             : %,d%s%n", merge.get("k"), galat);

        System.out.println();
        System.out.println("Stok 100, 1.000 pembeli serentak (virtual thread), masing-masing membeli 1:");
        System.out.println("  get lalu put       : " + rebutan((stok, sku) -> stok.ambilTidakAtomik(sku, 1)));
        System.out.println("  computeIfPresent   : " + rebutan((stok, sku) -> stok.ambil(sku, 1)));
    }

    /** Menjalankan aksi dari 8 thread yang mulai bersamaan; melaporkan exception yang terjadi di thread. */
    static String jalankan(Runnable aksi) throws InterruptedException {
        CountDownLatch mulai = new CountDownLatch(1);
        List<Future<?>> hasil = new ArrayList<>();
        try (ExecutorService pool = Executors.newFixedThreadPool(THREADS)) {
            for (int t = 0; t < THREADS; t++) {
                hasil.add(pool.submit(() -> {
                    mulai.await();
                    for (int i = 0; i < PER_THREAD; i++) {
                        aksi.run();
                    }
                    return null;
                }));
            }
            mulai.countDown();
        }                                                   // close() menunggu semua tugas selesai
        int gagal = 0;
        for (Future<?> f : hasil) {
            try {
                f.get();
            } catch (ExecutionException e) {
                gagal++;
            }
        }
        return gagal == 0 ? "" : "  (" + gagal + " thread berhenti karena exception)";
    }

    static String rebutan(BiPredicate<StokGudang, String> beli) throws InterruptedException {
        StokGudang stok = new StokGudang();
        stok.tambah("SKU-1", 100);
        AtomicInteger terjual = new AtomicInteger();
        CountDownLatch mulai = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 1_000; i++) {
                pool.submit(() -> {
                    mulai.await();
                    if (beli.test(stok, "SKU-1")) {
                        terjual.incrementAndGet();
                    }
                    return null;
                });
            }
            mulai.countDown();
        }
        return "terjual " + terjual.get() + ", sisa stok " + stok.sisa("SKU-1");
    }

    private ChmDemo() {
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../chm/StokGudang.java', `package id.playbook.jdkapi.chm;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Stok per SKU yang dibaca dan diubah banyak thread sekaligus (contoh "real-time" di infografik).
 * Aturannya: cek dan ubah harus terjadi di dalam SATU operasi atomik per key (merge/compute).
 */
public final class StokGudang {

    private final ConcurrentHashMap<String, Integer> stok = new ConcurrentHashMap<>();

    public void tambah(String sku, int jumlah) {
        stok.merge(sku, jumlah, Integer::sum);          // inisialisasi ATAU tambah, atomik
    }

    /** Benar: syarat "stok cukup" diperiksa di dalam computeIfPresent, saat bin key ini terkunci. */
    public boolean ambil(String sku, int jumlah) {
        boolean[] berhasil = {false};                   // penampung hasil; lambda berjalan di thread pemanggil
        stok.computeIfPresent(sku, (k, sisa) -> {
            if (sisa < jumlah) {
                return sisa;                            // tidak cukup: nilai tidak berubah
            }
            berhasil[0] = true;
            return sisa - jumlah;
        });
        return berhasil[0];
    }

    /** SALAH: get lalu put. Setiap operasi atomik, tetapi gabungannya tidak. Dua thread bisa membaca sisa yang sama. */
    public boolean ambilTidakAtomik(String sku, int jumlah) {
        Integer sisa = stok.get(sku);
        if (sisa == null || sisa < jumlah) {
            return false;
        }
        Thread.yield();                                 // mensimulasikan kerja di antara cek dan update (validasi, log, hitung harga)
        stok.put(sku, sisa - jumlah);
        return true;
    }

    public int sisa(String sku) {
        return stok.getOrDefault(sku, 0);
    }
}`, 'java'),
        table(['Varian (target 800.000)', 'Run 1', 'Run 2', 'Run 3'], [
          ['`HashMap.merge` dari 8 thread', '512.488', '247.196', '184.133'],
          ['CHM `get()` lalu `put()`', '302.847', '364.652', '386.481'],
          ['CHM `merge()`', '800.000', '800.000', '800.000'],
          ['Stok 100, 1.000 pembeli, `get` lalu `put`', 'terjual 1.000', 'terjual 202', 'terjual 673'],
          ['Stok 100, 1.000 pembeli, `computeIfPresent`', 'terjual 100', 'terjual 100', 'terjual 100'],
        ]),
        paragraph('Angka di atas berasal dari tiga run nyata di laptop 12 prosesor logis dengan JDK 21 (18 November 2026); angka Anda akan berbeda, dan justru itu intinya: race condition tidak deterministik. Perhatikan baris kedua: memakai CHM tidak menyelamatkan kode yang memecah satu perubahan menjadi `get` dan `put`. Pada demo stok, cara yang salah menjual sampai 10 kali stok yang ada. Satu-satunya yang selalu benar adalah operasi atomik per key.'),
        heading('Cara kerja di Java 8+'),
        table(['Bagian', 'Cara kerja', 'Akibat praktis'], [
          ['Struktur', 'Array `Node<K,V>[]` (bin), dibuat malas saat insert pertama', 'Konstruktor murah; `initialCapacity` hanya petunjuk ukuran'],
          ['Baca (`get`)', 'Tanpa lock; `Node.val` dan `next` adalah `volatile`', 'Pembaca tidak pernah menunggu penulis'],
          ['Tulis ke bin kosong', 'CAS (compare-and-swap) untuk memasang node pertama, tanpa lock', 'Insert ke bin berbeda berjalan benar-benar paralel'],
          ['Tulis ke bin terisi', '`synchronized` pada node pertama bin itu saja', 'Kontensi hanya terjadi bila dua thread menulis ke bin yang sama'],
          ['Bin panjang', 'Linked list diubah menjadi pohon merah-hitam bila ≥ 8 node (dan tabel ≥ 64)', 'Hash buruk/serangan hash collision tetap O(log n), bukan O(n)'],
          ['Resize', 'Tabel baru 2× ukuran; banyak thread membantu memindahkan bin, bin yang sudah pindah ditandai `ForwardingNode`', 'Baca tetap berjalan selama resize'],
          ['`size()`', 'Jumlah `baseCount` + sel counter (mirip `LongAdder`)', 'Perkiraan saat ada penulis lain; pakai `mappingCount()` (long) untuk map sangat besar'],
        ]),
        paragraph('**Java 7 ke bawah** memakai *segment locking*: map dibagi menjadi `Segment` (default 16), masing-masing sebuah `ReentrantLock`, sehingga paling banyak 16 penulis bersamaan. Java 8 membuang desain itu; kelas `Segment` hanya tersisa untuk kompatibilitas serialisasi, dan argumen `concurrencyLevel` di konstruktor kini sekadar petunjuk ukuran.'),
        heading('Perbandingan dengan HashMap dan Hashtable'),
        table(['Aspek', '`HashMap`', '`Hashtable`', '`ConcurrentHashMap`'], [
          ['Thread-safe', 'Tidak', 'Ya, semua method `synchronized` (satu lock untuk seluruh map)', 'Ya, lock per bin + CAS; baca tanpa lock'],
          ['Key / value `null`', '1 key null, banyak value null', 'Tidak boleh', 'Tidak boleh (NPE)'],
          ['Iterator', 'Fail-fast (`ConcurrentModificationException`)', '`keySet().iterator()` fail-fast; `keys()`/`elements()` (Enumeration) tidak', 'Weakly consistent, tidak pernah CME'],
          ['Operasi atomik majemuk', '`compute`/`merge` ada tetapi tidak aman antar thread', 'Aman tetapi semua thread antre satu lock', '`compute`/`merge`/`computeIfAbsent` atomik per key'],
          ['Kapan dipakai', 'Satu thread, atau data tidak berubah setelah dibuat', 'Kode lama; jangan untuk kode baru', 'Map yang dibaca dan diubah banyak thread'],
        ]),
        callout('info', 'Mengapa null dilarang?', 'Di map biasa, `get(k) == null` bisa berarti key tidak ada atau nilainya null, dan Anda membedakannya dengan `containsKey`. Di map yang diubah thread lain, dua panggilan itu bisa melihat keadaan yang berbeda. Dengan melarang null, `get` yang mengembalikan null selalu berarti "tidak ada", tanpa ambiguitas.'),
        heading('Method penting dan jebakannya'),
        table(['Method', 'Perilaku', 'Jebakan'], [
          ['`putIfAbsent(k, v)`', 'Pasang bila belum ada; kembalikan nilai lama', '`v` sudah dihitung sebelum dipanggil, walau key sudah ada'],
          ['`computeIfAbsent(k, f)`', '`f` dipanggil hanya bila key belum ada', 'Bin terkunci selama `f` berjalan: jangan I/O, jangan lama'],
          ['`computeIfPresent(k, f)`', 'Ubah bila ada; `f` mengembalikan null = hapus', 'Cocok untuk "kurangi bila cukup" (stok, kuota)'],
          ['`compute(k, f)`', 'Ubah apa pun keadaannya', 'Mengubah map yang sama di dalam `f` melempar `IllegalStateException: Recursive update`'],
          ['`merge(k, v, f)`', 'Pasang `v` bila belum ada, selain itu `f(lama, v)`', 'Pola terbaik untuk counter dan akumulasi'],
          ['`replace(k, lama, baru)`', 'CAS level map', 'Perlu loop retry bila gagal'],
          ['`forEach/search/reduce(threshold, ...)`', 'Operasi massal, paralel bila jumlah entri > threshold', 'Hasil tidak snapshot bila map sedang diubah'],
          ['`ConcurrentHashMap.newKeySet()`', '`Set` thread-safe berbasis CHM', 'Pengganti `Collections.synchronizedSet(new HashSet<>())`'],
        ]),
        code('labs/java-backend/jdk-api/.../chm/PenghitungAkses.java', `package id.playbook.jdkapi.chm;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/** Counter per endpoint dengan banyak penulis: ConcurrentHashMap + LongAdder. */
public final class PenghitungAkses {

    private final ConcurrentHashMap<String, LongAdder> hitungan = new ConcurrentHashMap<>();

    public void catat(String path) {
        // computeIfAbsent hanya membuat LongAdder sekali per path; increment() tidak perlu mengunci map
        hitungan.computeIfAbsent(path, k -> new LongAdder()).increment();
    }

    public long jumlah(String path) {
        LongAdder a = hitungan.get(path);
        return a == null ? 0 : a.sum();
    }

    /** Bulk operation: parallelismThreshold 1_000 = paralel bila map berisi lebih dari 1.000 entri. */
    public long total() {
        return hitungan.reduceValuesToLong(1_000, LongAdder::sum, 0L, Long::sum);
    }
}`, 'java'),
        heading('Setiap klaim di atas dibuktikan'),
        code('labs/java-backend/jdk-api/.../chm/ChmTest.java', `package id.playbook.jdkapi.chm;

import java.util.ConcurrentModificationException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Setiap klaim di modul ConcurrentHashMap dibuktikan di sini (hanya perilaku yang deterministik). */
class ChmTest {

    @Test
    void nullDitolakSedangkanHashMapMenerima() {
        Map<String, String> chm = new ConcurrentHashMap<>();
        assertThatThrownBy(() -> chm.put(null, "x")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> chm.put("x", null)).isInstanceOf(NullPointerException.class);

        Map<String, String> hm = new HashMap<>();
        hm.put(null, "satu key null");
        hm.put("a", null);
        hm.put("b", null);
        assertThat(hm).hasSize(3);
    }

    @Test
    void iteratorChmWeaklyConsistentTidakMelemparCme() {
        Map<String, Integer> chm = new ConcurrentHashMap<>(Map.of("a", 1, "b", 2, "c", 3));
        for (String k : chm.keySet()) {
            chm.put(k + "-baru", 0);                 // modifikasi saat iterasi: tidak ada exception
        }
        assertThat(chm).containsKeys("a-baru", "b-baru", "c-baru");
    }

    @Test
    void iteratorHashMapFailFast() {
        Map<String, Integer> hm = new HashMap<>(Map.of("a", 1, "b", 2));
        assertThatThrownBy(() -> {
            for (String k : hm.keySet()) {
                hm.put(k + "-baru", 0);
            }
        }).isInstanceOf(ConcurrentModificationException.class);
    }

    @Test
    void hashtableIteratorFailFastTetapiEnumerationTidak() {
        Hashtable<String, Integer> ht = new Hashtable<>(Map.of("a", 1, "b", 2));
        Iterator<String> it = ht.keySet().iterator();
        it.next();
        ht.put("c", 3);
        assertThatThrownBy(it::next).isInstanceOf(ConcurrentModificationException.class);

        Enumeration<String> en = ht.keys();         // API lama: tidak fail-fast
        en.nextElement();
        ht.put("d", 4);
        en.nextElement();                           // tidak melempar
    }

    @Test
    void putIfAbsentMenghitungNilaiWalauKeySudahAda() {
        ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>(Map.of("k", "lama"));
        AtomicInteger dihitung = new AtomicInteger();

        map.putIfAbsent("k", mahal(dihitung));             // argumen dievaluasi dulu
        map.computeIfAbsent("k", key -> mahal(dihitung));  // fungsi tidak dipanggil: key sudah ada

        assertThat(dihitung).hasValue(1);
        assertThat(map.get("k")).isEqualTo("lama");
    }

    private static String mahal(AtomicInteger dihitung) {
        dihitung.incrementAndGet();
        return "baru";
    }

    @Test
    void computeMengembalikanNullBerartiHapus() {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>(Map.of("SKU", 1));
        map.compute("SKU", (k, v) -> v - 1 == 0 ? null : v - 1);
        assertThat(map).doesNotContainKey("SKU");
    }

    @Test
    void mengubahMapYangSamaDiDalamComputeIfAbsentDitolak() {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        assertThatThrownBy(() -> map.computeIfAbsent("a", k -> map.computeIfAbsent("a", k2 -> 1)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Recursive update");
    }

    @Test
    void mergeDariBanyakThreadSelaluTepat() throws InterruptedException {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        CountDownLatch mulai = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) {
                pool.submit(() -> {
                    mulai.await();
                    for (int i = 0; i < 50_000; i++) {
                        map.merge("k", 1, Integer::sum);
                    }
                    return null;
                });
            }
            mulai.countDown();
        }
        assertThat(map.get("k")).isEqualTo(400_000);
    }

    @RepeatedTest(5)
    void stokTidakPernahOversellDenganComputeIfPresent() throws InterruptedException {
        StokGudang stok = new StokGudang();
        stok.tambah("SKU-1", 100);
        AtomicInteger terjual = new AtomicInteger();
        CountDownLatch mulai = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 1_000; i++) {
                pool.submit(() -> {
                    mulai.await();
                    if (stok.ambil("SKU-1", 1)) {
                        terjual.incrementAndGet();
                    }
                    return null;
                });
            }
            mulai.countDown();
        }
        assertThat(terjual).hasValue(100);
        assertThat(stok.sisa("SKU-1")).isZero();
    }

    @Test
    void longAdderDanBulkOperation() throws InterruptedException {
        PenghitungAkses akses = new PenghitungAkses();
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 10_000; i++) {
                String path = i % 2 == 0 ? "/saldo" : "/mutasi";
                pool.submit(() -> akses.catat(path));
            }
        }
        assertThat(akses.jumlah("/saldo")).isEqualTo(5_000);
        assertThat(akses.total()).isEqualTo(10_000);
    }

    @Test
    void newKeySetDanMappingCount() {
        Set<String> rekeningAktif = ConcurrentHashMap.newKeySet();   // Set thread-safe berbasis CHM
        rekeningAktif.add("1001");
        rekeningAktif.add("1001");
        assertThat(rekeningAktif).hasSize(1);

        ConcurrentHashMap<Integer, Integer> besar = new ConcurrentHashMap<>();
        for (int i = 0; i < 1_000; i++) {
            besar.put(i, i);
        }
        assertThat(besar.mappingCount()).isEqualTo(1_000L);          // long; size() dibatasi int
        Integer ketemu = besar.search(1, (k, v) -> v == 500 ? k : null);   // berhenti di hasil non-null pertama
        assertThat(ketemu).isEqualTo(500);
    }
}`, 'java'),
        heading('Koreksi terhadap infografik "ConcurrentHashMap Complete Guide"'),
        table(['Klaim di infografik', 'Status', 'Catatan'], [
          ['Thread-safe, tidak ada key/value null, Java 7 segment vs Java 8+ CAS + synchronized', 'Benar', 'Dibuktikan di `ChmTest`'],
          ['Iterator Hashtable: fail-fast', 'Sebagian', 'Iterator dari `keySet()`/`entrySet()` fail-fast; Enumeration dari `keys()`/`elements()` tidak'],
          ['"Thread-safe" tanpa catatan', 'Kurang', 'Tidak menyebut bahwa gabungan operasi (get lalu put) tetap race condition: kesalahan paling umum'],
          ['Contoh stok e-commerce', 'Kurang', 'Tidak menunjukkan caranya; tanpa `compute`/`merge`, stok bisa minus atau terjual berlebih'],
          ['"Does not allow duplicate keys"', 'Benar tetapi bukan ciri khas', 'Berlaku untuk semua `Map`'],
          ['Tidak dibahas', 'Tambahan', '`size()` hanya perkiraan, batasan lambda `compute`, `mappingCount`, operasi massal, `newKeySet`'],
        ]),
        heading('14 soal interview dari infografik'),
        ...quiz([
          ['CHM-01', 'Apa itu ConcurrentHashMap?', 'Implementasi `Map` di `java.util.concurrent` yang mendukung baca dan tulis dari banyak thread secara aman dengan kontensi rendah: baca tanpa lock, tulis mengunci per bin (Java 8+). Menyediakan operasi atomik per key seperti `compute`, `merge`, dan `computeIfAbsent`.'],
          ['CHM-02', 'Mengapa ConcurrentHashMap thread-safe?', 'Field node yang dibaca bersama (`val`, `next`) bersifat `volatile`, insert ke bin kosong memakai CAS, dan perubahan pada bin yang sudah terisi dilakukan di bawah `synchronized` pada node pertama bin itu. Resize dikoordinasikan dengan `ForwardingNode` sehingga pembaca tetap melihat data yang konsisten.'],
          ['CHM-03', 'Apa bedanya dengan HashMap?', 'HashMap tidak aman untuk penulis bersamaan: update bisa hilang (dibuktikan di demo, 800.000 penambahan menjadi sekitar 200–500 ribu) dan struktur bisa rusak. HashMap menerima satu key null dan value null; CHM tidak. Iterator HashMap fail-fast, CHM weakly consistent. Untuk satu thread, HashMap sedikit lebih cepat.'],
          ['CHM-04', 'Apa bedanya Hashtable dan ConcurrentHashMap?', 'Hashtable mengunci seluruh objek di setiap method, sehingga semua pembaca dan penulis antre satu lock. CHM membaca tanpa lock dan mengunci per bin saat menulis, sehingga skalabel. Hashtable adalah kelas lama (Java 1.0) dan tidak dipakai di kode baru.'],
          ['CHM-05', 'Mengapa null key dan null value tidak diizinkan?', 'Agar `get(k) == null` selalu berarti "tidak ada". Di map yang diubah thread lain, membedakan "tidak ada" dari "bernilai null" dengan `containsKey` lalu `get` tidak bisa dilakukan secara atomik.'],
          ['CHM-06', 'Apa itu CAS?', 'Compare-and-swap: instruksi atomik CPU yang mengganti nilai di memori hanya bila nilainya masih sama dengan yang diharapkan, dan mengembalikan apakah berhasil. Tidak memblokir thread; bila gagal, kode mencoba lagi. CHM memakainya untuk memasang node di bin kosong dan mengatur ukuran tabel.'],
          ['CHM-07', 'Apa itu segment locking?', 'Desain CHM Java 7: map dibagi menjadi beberapa Segment (default 16), masing-masing dengan `ReentrantLock` sendiri, sehingga paling banyak 16 penulis bisa bekerja bersamaan. Java 8 menggantinya dengan lock per bin dan CAS yang lebih halus.'],
          ['CHM-08', 'Apa itu weakly consistent iterator?', 'Iterator yang tidak melempar `ConcurrentModificationException`, berjalan di atas keadaan map saat itu, menjamin setiap elemen yang ada sejak iterator dibuat dikunjungi paling banyak sekali, dan mungkin (tidak pasti) melihat perubahan yang terjadi setelahnya.'],
          ['CHM-09', 'Apakah mendukung baca bersamaan?', 'Ya. `get` tidak mengambil lock sama sekali, sehingga banyak thread bisa membaca bersamaan, juga saat ada penulis dan saat resize.'],
          ['CHM-10', 'Bisakah dua thread mengubah map bersamaan?', 'Bisa, bila key-nya jatuh di bin berbeda: masing-masing memakai CAS atau lock bin sendiri. Bila di bin yang sama, salah satu menunggu lock bin itu.'],
          ['CHM-11', 'Apa bedanya put() dan putIfAbsent()?', '`put` selalu menimpa dan mengembalikan nilai lama. `putIfAbsent` hanya memasang bila key belum ada, secara atomik, dan mengembalikan nilai yang sudah ada (atau null bila berhasil memasang). Catatan: argumen nilai sudah dihitung sebelum `putIfAbsent` dipanggil.'],
          ['CHM-12', 'Apa bedanya compute() dan computeIfAbsent()?', '`computeIfAbsent` hanya memanggil fungsi bila key belum ada, cocok untuk inisialisasi malas (mis. `new LongAdder()`). `compute` selalu memanggil fungsi dengan nilai saat ini (bisa null) dan cocok untuk transformasi; mengembalikan null berarti menghapus. Keduanya mengunci bin selama fungsi berjalan, jadi fungsinya harus singkat dan tidak boleh mengubah map yang sama.'],
          ['CHM-13', 'Apakah melempar ConcurrentModificationException?', 'Tidak. Iterator dan stream dari CHM weakly consistent, sehingga map boleh diubah selama iterasi, oleh thread lain maupun oleh thread yang sedang beriterasi.'],
          ['CHM-14', 'Apa yang terjadi bila dua thread mengubah key yang sama bersamaan?', 'Dengan `put`, keduanya berhasil berurutan dan nilai terakhir menang; tidak ada data rusak, tetapi satu update bisa tertimpa. Dengan `compute`/`merge`, perubahan dijalankan bergiliran di bawah lock bin sehingga tidak ada update yang hilang. Dengan `get` lalu `put`, update hilang (lihat demo).'],
        ]),
        ...practice('jc-concurrenthashmap', [
          'Jalankan `ChmDemo` tiga kali dan catat angkanya; jelaskan mengapa baris `merge` selalu tepat.',
          'Tulis rate limiter sederhana per pengguna: `ConcurrentHashMap<String, Deque<Instant>>` dengan `compute`, lalu uji dengan 1.000 virtual thread.',
          'Ubah `StokGudang.ambil` agar menolak pengambilan bila SKU tidak dikenal, dan tambahkan test-nya.',
          'Bandingkan waktu 8 thread × 1 juta `merge` pada CHM vs `Collections.synchronizedMap(new HashMap<>())`.',
        ]),
        references(
          ['Javadoc ConcurrentHashMap (Java 21)', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html'],
          ['Kode sumber ConcurrentHashMap (OpenJDK)', 'https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/util/concurrent/ConcurrentHashMap.java'],
          ['Javadoc LongAdder', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/LongAdder.html'],
        ),
      ],
    },
  },
  {
    after: 'java-virtual-threads',
    module: {
      id: 'java-lima-api-backend',
      title: 'Java Modern: 5 API Backend yang Sering Disalahpakai — CompletableFuture, ExecutorService, Stream, Files & HttpClient',
      summary: 'Lima API JDK yang dipakai setiap backend developer, dengan contoh populer yang mengandung jebakan, versi yang benar untuk Java 21, dan test yang membuktikan setiap jebakan.',
      track: MODERN, ...src, duration: '2,5 jam', level: 'Med',
      blocks: [
        paragraph('Carousel "5 Java APIs Every Backend Dev Must Master" memilih API yang tepat: `CompletableFuture`, `ExecutorService`, `Stream`, `Files`, dan `HttpClient` memang dipakai setiap hari. Masalahnya ada di contoh kodenya: setiap contoh berjalan di demo, tetapi masing-masing membawa satu jebakan yang baru terasa di produksi. Modul ini membedah kelimanya dan membuktikan setiap jebakan dengan test (Java 21, tanpa library tambahan).'),
        table(['API', 'Contoh populer', 'Jebakan', 'Versi benar'], [
          ['CompletableFuture', '`supplyAsync(() -> fetchData()).thenApply(...).thenAccept(System.out::println)`', 'Tanpa executor (I/O di commonPool), tanpa timeout, tanpa penanganan error; di `main` bisa selesai sebelum mencetak', 'Executor eksplisit, `orTimeout`/`completeOnTimeout`, `exceptionally`, `join()` di batas luar'],
          ['ExecutorService', '`newFixedThreadPool(3)`; `submit(...)`; `shutdown()`', 'Exception di `submit` hilang tanpa jejak; antrean tanpa batas; tidak menunggu selesai', 'try-with-resources (Java 19+), simpan `Future`, virtual thread untuk I/O, antrean terbatas untuk CPU'],
          ['Stream', '`.collect(Collectors.toList())`', 'Bukan salah, tetapi ada `.toList()` (Java 16) yang tidak bisa diubah; `summingDouble` untuk uang tetap salah', '`.toList()`, `BigDecimal` dengan `reducing`'],
          ['Files', '`Files.readAllLines(Path.of("config.txt"))`', 'Seluruh file masuk memori; file non-UTF-8 melempar `MalformedInputException`', 'Sebut charset untuk file lama; `Files.lines` di try-with-resources untuk file besar'],
          ['HttpClient', '`HttpClient.newHttpClient()` per panggilan; `sendAsync(...).thenAccept(System.out::println)`', 'Tanpa timeout (default menunggu selamanya), status 5xx tidak dicek, yang tercetak objek respons bukan body', 'Satu client dipakai ulang, `connectTimeout` + `timeout` per request, cek status, ambil `body()`'],
        ]),
        heading('1. CompletableFuture'),
        paragraph('`supplyAsync` tanpa executor menjalankan tugas di `ForkJoinPool.commonPool()`: pool kecil (sekitar jumlah core) yang juga dipakai parallel stream. Panggilan HTTP atau database yang blocking di sana bisa menghabiskan pool untuk seluruh aplikasi. Thread commonPool juga daemon, sehingga di `main` program bisa selesai sebelum `thenAccept` sempat mencetak. Exception di rantai tanpa `exceptionally`/`join` tersimpan di future dan tidak pernah terlihat.'),
        code('labs/java-backend/jdk-api/.../api/DasborNasabah.java', `package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

/**
 * Tiga panggilan ke sistem berbeda dijalankan paralel. Setiap panggilan punya kebijakan sendiri:
 * saldo WAJIB (gagal/lambat = halaman gagal), mutasi dan kurs BOLEH kosong (degradasi anggun).
 */
public final class DasborNasabah {

    public interface Sumber {
        BigDecimal saldo(String rekening);

        List<String> mutasiTerakhir(String rekening);

        BigDecimal kursUsd();
    }

    public record Dasbor(BigDecimal saldo, List<String> mutasi, Optional<BigDecimal> kursUsd) {
    }

    private final Sumber sumber;
    private final Executor executor;

    /** Executor diberikan dari luar: untuk I/O blocking pakai virtual thread, BUKAN ForkJoinPool.commonPool(). */
    public DasborNasabah(Sumber sumber, Executor executor) {
        this.sumber = sumber;
        this.executor = executor;
    }

    public Dasbor muat(String rekening) {
        CompletableFuture<BigDecimal> saldo = CompletableFuture
                .supplyAsync(() -> sumber.saldo(rekening), executor)
                .orTimeout(2, TimeUnit.SECONDS);                                  // wajib: lambat = gagal

        CompletableFuture<List<String>> mutasi = CompletableFuture
                .supplyAsync(() -> sumber.mutasiTerakhir(rekening), executor)
                .completeOnTimeout(List.of(), 1, TimeUnit.SECONDS)                // lambat = kosong
                .exceptionally(e -> List.of());                                    // gagal = kosong

        CompletableFuture<Optional<BigDecimal>> kurs = CompletableFuture
                .supplyAsync(() -> Optional.of(sumber.kursUsd()), executor)
                .completeOnTimeout(Optional.empty(), 500, TimeUnit.MILLISECONDS)
                .exceptionally(e -> Optional.empty());

        try {
            return saldo.thenCombine(mutasi, (s, m) -> new Dasbor(s, m, Optional.empty()))
                    .thenCombine(kurs, (d, k) -> new Dasbor(d.saldo(), d.mutasi(), k))
                    .join();                                                       // tunggu di batas paling luar
        } catch (CompletionException e) {
            throw new DasborTidakTersediaException("Saldo tidak dapat dimuat", e.getCause());
        }
    }

    public static final class DasborTidakTersediaException extends RuntimeException {
        public DasborTidakTersediaException(String pesan, Throwable sebab) {
            super(pesan, sebab);
        }
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../api/CompletableFutureTest.java', `package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ForkJoinPool;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class CompletableFutureTest {

    private final ExecutorService io = Executors.newVirtualThreadPerTaskExecutor();

    @AfterEach
    void tutup() {
        io.close();
    }

    static void tidur(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }

    /** Sumber palsu: setiap panggilan butuh waktu tertentu atau gagal. */
    record SumberPalsu(long msSaldo, long msMutasi, long msKurs, boolean saldoGagal, boolean kursGagal)
            implements DasborNasabah.Sumber {
        public BigDecimal saldo(String rekening) {
            tidur(msSaldo);
            if (saldoGagal) {
                throw new IllegalStateException("core banking down");
            }
            return new BigDecimal("1500000.00");
        }

        public List<String> mutasiTerakhir(String rekening) {
            tidur(msMutasi);
            return List.of("TRF-001", "QRIS-002");
        }

        public BigDecimal kursUsd() {
            tidur(msKurs);
            if (kursGagal) {
                throw new IllegalStateException("API kurs 503");
            }
            return new BigDecimal("18245");
        }
    }

    @Test
    void tigaPanggilanBerjalanParalel() {
        var dasbor = new DasborNasabah(new SumberPalsu(300, 300, 300, false, false), io);
        long mulai = System.nanoTime();
        DasborNasabah.Dasbor hasil = dasbor.muat("1001");
        Duration waktu = Duration.ofNanos(System.nanoTime() - mulai);

        assertThat(hasil.mutasi()).hasSize(2);
        assertThat(hasil.kursUsd()).contains(new BigDecimal("18245"));
        assertThat(waktu).isLessThan(Duration.ofMillis(800));          // berurutan butuh 900 ms
    }

    @Test
    void sumberOpsionalYangLambatAtauGagalTidakMenggagalkanHalaman() {
        var dasbor = new DasborNasabah(new SumberPalsu(50, 3_000, 50, false, true), io);
        long mulai = System.nanoTime();
        DasborNasabah.Dasbor hasil = dasbor.muat("1001");

        assertThat(hasil.saldo()).isEqualByComparingTo("1500000");
        assertThat(hasil.mutasi()).isEmpty();                          // completeOnTimeout setelah 1 detik
        assertThat(hasil.kursUsd()).isEmpty();                         // exceptionally
        assertThat(Duration.ofNanos(System.nanoTime() - mulai)).isLessThan(Duration.ofMillis(2_500));
    }

    @Test
    void saldoGagalMenjadiExceptionYangJelas() {
        var dasbor = new DasborNasabah(new SumberPalsu(50, 50, 50, true, false), io);
        assertThatThrownBy(() -> dasbor.muat("1001"))
                .isInstanceOf(DasborNasabah.DasborTidakTersediaException.class)
                .hasRootCauseMessage("core banking down");
    }

    @Test
    void saldoLambatKenaOrTimeout() {
        var dasbor = new DasborNasabah(new SumberPalsu(5_000, 50, 50, false, false), io);
        assertThatThrownBy(() -> dasbor.muat("1001"))
                .isInstanceOf(DasborNasabah.DasborTidakTersediaException.class)
                .hasCauseInstanceOf(java.util.concurrent.TimeoutException.class);
    }

    @Test
    void tanpaExecutorTugasBerjalanDiCommonPoolYangDaemon() {
        assumeTrue(ForkJoinPool.getCommonPoolParallelism() > 1);       // di mesin 1-core JDK memakai thread baru per tugas
        boolean daemon = CompletableFuture.supplyAsync(() -> Thread.currentThread().isDaemon()).join();
        // Daemon thread tidak menahan JVM: di main(), rantai thenAccept bisa belum jalan saat program selesai.
        assertThat(daemon).isTrue();
    }

    @Test
    void exceptionTersimpanDiFutureDanTidakTerlihatBilaTidakDiperiksa() {
        CompletableFuture<Void> f = CompletableFuture.runAsync(() -> {
            throw new IllegalStateException("gagal diam-diam");
        }, io);
        Throwable galat = f.handle((hasil, e) -> e).join();             // tidak ada log otomatis; harus diambil sendiri
        assertThat(f.isCompletedExceptionally()).isTrue();
        assertThat(galat).hasRootCauseMessage("gagal diam-diam");
    }
}`, 'java'),
        callout('tip', 'Dengan virtual thread, sering tidak butuh rantai future', 'Sejak Java 21, kode blocking biasa di dalam virtual thread sudah murah. Untuk "jalankan tiga panggilan paralel lalu gabungkan", `ExecutorService` virtual thread + `Future.get()` sering lebih mudah dibaca dan di-debug daripada rantai `thenCombine`. Structured concurrency (`StructuredTaskScope`, masih preview di Java 25) adalah arah berikutnya; lihat [Virtual Threads & Structured Concurrency](#java.java-virtual-threads).'),
        heading('2. ExecutorService'),
        paragraph('`submit()` menangkap exception ke dalam `Future`; bila `get()` tidak pernah dipanggil, error itu lenyap tanpa log. `newFixedThreadPool` memakai antrean tanpa batas: saat lonjakan, tugas menumpuk di memori. Sejak Java 19, `ExecutorService` adalah `AutoCloseable`, dan `close()` menunggu semua tugas selesai. Pilih jenis executor sesuai beban: virtual thread untuk I/O, pool tetap seukuran core dengan antrean terbatas untuk kerja CPU.'),
        code('labs/java-backend/jdk-api/.../api/PoolTerbatas.java', `package id.playbook.jdkapi.api;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * Executors.newFixedThreadPool memakai antrean TANPA BATAS: saat lonjakan, tugas menumpuk di memori
 * sampai OutOfMemoryError. Untuk pekerjaan CPU-bound, bangun ThreadPoolExecutor dengan antrean terbatas,
 * nama thread yang jelas, dan kebijakan penolakan yang eksplisit.
 */
public final class PoolTerbatas {

    public static ThreadPoolExecutor buat(String nama, int thread, int kapasitasAntrean) {
        return new ThreadPoolExecutor(
                thread, thread, 0L, TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(kapasitasAntrean),
                Thread.ofPlatform().name(nama + "-", 1).factory(),     // "laporan-1", "laporan-2", ... di thread dump
                new ThreadPoolExecutor.AbortPolicy());                 // penuh = RejectedExecutionException, bukan diam
    }

    private PoolTerbatas() {
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../api/ExecutorServiceTest.java', `package id.playbook.jdkapi.api;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExecutorServiceTest {

    @Test
    void submitMenyimpanExceptionDiFuture() throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            Future<?> f = pool.submit(() -> {
                throw new IllegalStateException("gagal menghitung bunga");
            });
            // Tidak ada stack trace di konsol. Tanpa f.get(), error ini hilang tanpa jejak.
            assertThatThrownBy(f::get)
                    .isInstanceOf(ExecutionException.class)
                    .hasCauseInstanceOf(IllegalStateException.class);
        }
    }

    @Test
    void tryWithResourcesMenungguSemuaTugasSelesai() {
        AtomicInteger selesai = new AtomicInteger();
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {   // Java 21+
            for (int i = 0; i < 100; i++) {
                pool.submit(() -> {
                    Thread.sleep(20);
                    return selesai.incrementAndGet();
                });
            }
        }                                     // close() = shutdown() + awaitTermination()
        assertThat(selesai).hasValue(100);
    }

    @Test
    void antreanTerbatasMenolakSaatPenuhDanThreadBernama() throws Exception {
        CountDownLatch tahan = new CountDownLatch(1);
        AtomicReference<String> namaThread = new AtomicReference<>();
        ThreadPoolExecutor pool = PoolTerbatas.buat("laporan", 1, 1);
        try {
            pool.submit(() -> {                                   // menempati satu-satunya thread
                namaThread.set(Thread.currentThread().getName());
                tahan.await();
                return null;
            });
            pool.submit(() -> null);                              // mengisi satu-satunya slot antrean
            assertThatThrownBy(() -> pool.submit(() -> null))     // tugas ketiga ditolak, tidak menumpuk di memori
                    .isInstanceOf(RejectedExecutionException.class);
        } finally {
            tahan.countDown();
            pool.close();
        }
        assertThat(namaThread.get()).isEqualTo("laporan-1");
    }

    @Test
    void semaphoreMembatasiVirtualThreadKeSistemHilir() {
        Semaphore izin = new Semaphore(10);                       // mis. pool koneksi database = 10
        AtomicInteger sedang = new AtomicInteger();
        AtomicInteger puncak = new AtomicInteger();
        try (ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 200; i++) {
                pool.submit(() -> {
                    izin.acquire();
                    try {
                        puncak.accumulateAndGet(sedang.incrementAndGet(), Math::max);
                        Thread.sleep(10);
                    } finally {
                        sedang.decrementAndGet();
                        izin.release();
                    }
                    return null;
                });
            }
        }
        assertThat(puncak.get()).isLessThanOrEqualTo(10);
    }
}`, 'java'),
        table(['Beban', 'Executor', 'Alasan'], [
          ['I/O blocking (HTTP, JDBC, file)', '`Executors.newVirtualThreadPerTaskExecutor()`', 'Ribuan tugas menunggu I/O tanpa ribuan thread OS'],
          ['CPU (hitung, kompresi, enkripsi)', '`ThreadPoolExecutor` ukuran = jumlah core, antrean terbatas', 'Lebih banyak thread dari core hanya menambah context switch'],
          ['Terjadwal', '`ScheduledExecutorService` / `@Scheduled` di Spring', 'Bukan `ExecutorService` biasa seperti klaim carousel'],
          ['Batasi beban ke sistem hilir', '`Semaphore` di dalam virtual thread', 'Virtual thread tidak terbatas; database tidak'],
        ]),
        heading('3. Stream'),
        paragraph('Contoh di carousel sudah benar. Yang perlu diketahui: sejak Java 16, `.toList()` lebih ringkas dan mengembalikan list yang tidak bisa diubah, sedangkan `Collectors.toList()` mengembalikan list yang bisa diubah (tipenya tidak dijamin spesifikasi). Stream malas dan hanya bisa dipakai sekali. "Selamat tinggal for-loop" juga berlebihan: loop tetap lebih jelas untuk logika dengan banyak state, checked exception, atau keluar lebih awal yang rumit.'),
        code('labs/java-backend/jdk-api/.../api/RingkasanMutasi.java', `package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/** Stream untuk agregasi uang: BigDecimal dijumlah dengan reducing, BUKAN summingDouble. */
public final class RingkasanMutasi {

    public record Mutasi(String kategori, BigDecimal jumlah, boolean debit) {
    }

    /** Total pengeluaran per kategori, urut nama kategori. */
    public static Map<String, BigDecimal> pengeluaranPerKategori(List<Mutasi> mutasi) {
        return mutasi.stream()
                .filter(Mutasi::debit)
                .collect(Collectors.groupingBy(
                        Mutasi::kategori,
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Mutasi::jumlah, BigDecimal::add)));
    }

    /** Kategori dengan pengeluaran di atas batas; .toList() (Java 16+) menghasilkan list yang tidak bisa diubah. */
    public static List<String> kategoriBoros(List<Mutasi> mutasi, BigDecimal batas) {
        return pengeluaranPerKategori(mutasi).entrySet().stream()
                .filter(e -> e.getValue().compareTo(batas) > 0)
                .map(Map.Entry::getKey)
                .toList();
    }

    private RingkasanMutasi() {
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../api/StreamTest.java', `package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import id.playbook.jdkapi.api.RingkasanMutasi.Mutasi;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StreamTest {

    @Test
    void toListTidakBisaDiubahSedangkanCollectorsToListBisa() {
        List<String> modern = Stream.of("a", "b").toList();                       // Java 16+
        assertThatThrownBy(() -> modern.add("c")).isInstanceOf(UnsupportedOperationException.class);

        List<String> lama = Stream.of("a", "b").collect(Collectors.toList());    // mutable (tipe tidak dijamin spesifikasi)
        lama.add("c");
        assertThat(lama).containsExactly("a", "b", "c");
    }

    @Test
    void streamHanyaBisaDipakaiSekali() {
        Stream<String> s = Stream.of("a");
        s.count();
        assertThatThrownBy(s::count).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void streamMalasDanBerhentiLebihAwal() {
        AtomicInteger diproses = new AtomicInteger();
        int pertama = IntStream.rangeClosed(1, 1_000_000)
                .peek(i -> diproses.incrementAndGet())
                .filter(i -> i % 7 == 0)
                .findFirst()
                .orElseThrow();
        assertThat(pertama).isEqualTo(7);
        assertThat(diproses).hasValue(7);                                     // bukan satu juta
    }

    @Test
    void summingDoubleUntukUangTetapSalahBigDecimalBenar() {
        double loop = 0;
        for (int i = 0; i < 10; i++) {
            loop += 0.1;
        }
        assertThat(loop).isEqualTo(0.9999999999999999);
        // summingDouble memakai compensated (Kahan) summation, jadi 10 x 0.1 kebetulan tepat 1.0 ...
        assertThat(Stream.of(0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1).collect(Collectors.summingDouble(x -> x)))
                .isEqualTo(1.0);
        // ... tetapi nilai input yang memang tidak bisa direpresentasikan biner tetap menghasilkan angka salah
        assertThat(Stream.of(1.10, 2.20).collect(Collectors.summingDouble(x -> x))).isEqualTo(3.3000000000000003);

        List<Mutasi> mutasi = List.of(
                new Mutasi("biaya-admin", new BigDecimal("1.10"), true),
                new Mutasi("biaya-admin", new BigDecimal("2.20"), true));
        assertThat(RingkasanMutasi.pengeluaranPerKategori(mutasi).get("biaya-admin")).isEqualByComparingTo("3.30");
    }

    @Test
    void groupingByDenganBigDecimal() {
        List<Mutasi> mutasi = List.of(
                new Mutasi("makan", new BigDecimal("45000"), true),
                new Mutasi("transport", new BigDecimal("120000"), true),
                new Mutasi("makan", new BigDecimal("60000"), true),
                new Mutasi("gaji", new BigDecimal("9000000"), false));
        assertThat(RingkasanMutasi.pengeluaranPerKategori(mutasi))
                .containsExactly(
                        org.assertj.core.api.Assertions.entry("makan", new BigDecimal("105000")),
                        org.assertj.core.api.Assertions.entry("transport", new BigDecimal("120000")));
        assertThat(RingkasanMutasi.kategoriBoros(mutasi, new BigDecimal("110000"))).containsExactly("transport");
    }
}`, 'java'),
        callout('info', 'Temuan saat menguji: summingDouble lebih pintar dari yang dikira', 'Test pertama mengasumsikan `Collectors.summingDouble` menjumlah 10 × 0,1 menjadi 0,9999999999999999, dan test itu gagal: hasilnya tepat 1,0 karena `summingDouble` memakai compensated (Kahan) summation. Kompensasi itu hanya mengurangi galat penjumlahan, tidak memperbaiki nilai input yang memang tidak bisa direpresentasikan biner: `1.10 + 2.20` tetap `3.3000000000000003`. Untuk uang, tetap pakai `BigDecimal`.'),
        heading('4. Files'),
        paragraph('`Files.readAllLines(path)` membaca seluruh file ke memori dan, tanpa argumen charset, selalu mendekode sebagai UTF-8 secara ketat. File ekspor dari sistem lama (sering Windows-1252) dengan huruf seperti "é" langsung gagal dengan `MalformedInputException`. `Files.lines` gagal dengan cara yang lebih menyesatkan: membuka file berhasil, error baru muncul saat stream dikonsumsi sebagai `UncheckedIOException`. Pola baca/tulis yang aman (try-with-resources, penulisan atomik) dibahas di [I/O, NIO.2 & JDBC](#java.jc-io-nio-jdbc).'),
        code('labs/java-backend/jdk-api/.../api/FilesTest.java', `package id.playbook.jdkapi.api;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FilesTest {

    @TempDir
    Path dir;

    /** Ekspor CSV dari sistem lama sering memakai Windows-1252, bukan UTF-8: "é" = satu byte 0xE9. */
    private Path csvSistemLama() throws IOException {
        Path csv = dir.resolve("mutasi-lama.csv");
        Files.write(csv, "nama,kota\\nRené,Medan\\n".getBytes(Charset.forName("windows-1252")));
        return csv;
    }

    @Test
    void readAllLinesMenolakByteYangBukanUtf8() throws IOException {
        Path csv = csvSistemLama();
        assertThatThrownBy(() -> Files.readAllLines(csv)).isInstanceOf(MalformedInputException.class);
        assertThat(Files.readAllLines(csv, Charset.forName("windows-1252"))).containsExactly("nama,kota", "René,Medan");
    }

    @Test
    void filesLinesGagalSecaraMalasSaatDibaca() throws IOException {
        Path csv = csvSistemLama();
        try (Stream<String> baris = Files.lines(csv)) {           // membuka file berhasil...
            assertThatThrownBy(baris::count)                      // ...error baru muncul saat stream dikonsumsi
                    .isInstanceOf(UncheckedIOException.class)
                    .hasCauseInstanceOf(MalformedInputException.class);
        }
    }

    @Test
    void readStringDanWriteStringSelaluUtf8() throws IOException {
        Path f = dir.resolve("catatan.txt");
        Files.writeString(f, "Saldo Rp1.500.000 — terima kasih");
        assertThat(Files.readString(f)).isEqualTo("Saldo Rp1.500.000 — terima kasih");
        assertThat(Files.readAllBytes(f)).hasSize("Saldo Rp1.500.000 — terima kasih".getBytes(StandardCharsets.UTF_8).length);
        assertThat(Files.readAllLines(f)).isEqualTo(List.of("Saldo Rp1.500.000 — terima kasih"));
    }
}`, 'java'),
        heading('5. HttpClient'),
        paragraph('`HttpClient` membawa connection pool, dukungan HTTP/2, dan thread internal, sehingga harus dibuat sekali dan dipakai ulang. `HttpRequest` tanpa `.timeout(...)` menunggu selamanya bila server diam. `HttpClient` tidak melempar exception untuk 4xx/5xx. Dan `sendAsync(...).thenAccept(System.out::println)` mencetak objek `HttpResponse`, yang `toString()`-nya hanya berisi metode, URI, dan status, bukan body.'),
        code('labs/java-backend/jdk-api/.../api/KursClient.java', `package id.playbook.jdkapi.api;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * HttpClient dibuat SEKALI dan dipakai ulang (connection pool, HTTP/2, thread internal ada di dalamnya).
 * Dua timeout berbeda: connectTimeout di client, timeout per request di HttpRequest (default: tanpa batas!).
 */
public final class KursClient implements AutoCloseable {

    private final HttpClient http;
    private final URI baseUrl;
    private final Duration timeoutRequest;

    public KursClient(URI baseUrl, Duration timeoutRequest) {
        this.baseUrl = baseUrl;
        this.timeoutRequest = timeoutRequest;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NORMAL)        // default NEVER
                .build();
    }

    private HttpRequest request(String base) {
        return HttpRequest.newBuilder(baseUrl.resolve("/v1/latest?base=" + URLEncoder.encode(base, StandardCharsets.UTF_8)))
                .timeout(timeoutRequest)
                .header("Accept", "application/json")
                .GET()
                .build();
    }

    /** Sinkron: sederhana dan, di virtual thread, tidak memboroskan thread platform. */
    public String kursTerbaru(String base) throws IOException, InterruptedException {
        HttpResponse<String> resp = http.send(request(base), HttpResponse.BodyHandlers.ofString());
        return bodyBilaSukses(resp);
    }

    /** Asinkron: ambil BODY-nya, bukan objek HttpResponse; status non-2xx menjadi exception. */
    public CompletableFuture<String> kursTerbaruAsync(String base) {
        return http.sendAsync(request(base), HttpResponse.BodyHandlers.ofString())
                .thenApply(KursClient::bodyBilaSukses);
    }

    private static String bodyBilaSukses(HttpResponse<String> resp) {
        // HttpClient TIDAK melempar exception untuk 4xx/5xx: status wajib dicek sendiri
        if (resp.statusCode() / 100 != 2) {
            throw new KursTidakTersediaException("HTTP " + resp.statusCode() + " dari " + resp.uri());
        }
        return resp.body();
    }

    @Override
    public void close() {
        http.close();                                               // Java 21+: HttpClient AutoCloseable
    }

    public static final class KursTidakTersediaException extends RuntimeException {
        public KursTidakTersediaException(String pesan) {
            super(pesan);
        }
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../api/HttpClientTest.java', `package id.playbook.jdkapi.api;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Server HTTP lokal bawaan JDK: base=USD sukses, base=GANGGU 503, base=LAMBAT menjawab setelah 2 detik. */
class HttpClientTest {

    static HttpServer server;
    static URI base;

    @BeforeAll
    static void mulai() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());   // handler lambat tidak memblokir yang lain
        server.createContext("/v1/latest", ex -> {
            String q = ex.getRequestURI().getQuery();
            int status = 200;
            String body = "{\\"base\\":\\"USD\\",\\"date\\":\\"2026-11-13\\",\\"rates\\":{\\"IDR\\":18245}}";
            if (q.contains("GANGGU")) {
                status = 503;
                body = "{\\"message\\":\\"maintenance\\"}";
            } else if (q.contains("LAMBAT")) {
                try {
                    Thread.sleep(2_000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(status, bytes.length);
            try (OutputStream os = ex.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();
        base = URI.create("http://127.0.0.1:" + server.getAddress().getPort());
    }

    @AfterAll
    static void berhenti() {
        server.stop(0);
    }

    @Test
    void thenAcceptPrintlnMencetakObjekResponsBukanBody() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            HttpRequest req = HttpRequest.newBuilder(base.resolve("/v1/latest?base=USD")).build();
            HttpResponse<String> resp = http.sendAsync(req, HttpResponse.BodyHandlers.ofString()).join();
            // Inilah yang dicetak oleh .thenAccept(System.out::println):
            assertThat(String.valueOf(resp)).isEqualTo("(GET " + base + "/v1/latest?base=USD) 200");
            assertThat(String.valueOf(resp)).doesNotContain("IDR");
            assertThat(resp.body()).contains("\\"IDR\\":18245");
        }
    }

    @Test
    void suksesSinkronDanAsinkron() throws Exception {
        try (KursClient kurs = new KursClient(base, Duration.ofSeconds(1))) {
            assertThat(kurs.kursTerbaru("USD")).contains("18245");
            assertThat(kurs.kursTerbaruAsync("USD").join()).contains("18245");
        }
    }

    @Test
    void status503TidakMelemparExceptionSendiri() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            HttpResponse<String> resp = http.send(
                    HttpRequest.newBuilder(base.resolve("/v1/latest?base=GANGGU")).build(), HttpResponse.BodyHandlers.ofString());
            assertThat(resp.statusCode()).isEqualTo(503);                  // tidak ada exception: wajib dicek manual
        }
        try (KursClient kurs = new KursClient(base, Duration.ofSeconds(1))) {
            assertThatThrownBy(() -> kurs.kursTerbaru("GANGGU"))
                    .isInstanceOf(KursClient.KursTidakTersediaException.class)
                    .hasMessageStartingWith("HTTP 503");
            assertThatThrownBy(() -> kurs.kursTerbaruAsync("GANGGU").join())
                    .isInstanceOf(CompletionException.class)
                    .hasCauseInstanceOf(KursClient.KursTidakTersediaException.class);
        }
    }

    @Test
    void timeoutPerRequestMemutusServerLambat() throws Exception {
        try (KursClient kurs = new KursClient(base, Duration.ofMillis(300))) {
            long mulai = System.nanoTime();
            assertThatThrownBy(() -> kurs.kursTerbaru("LAMBAT")).isInstanceOf(HttpTimeoutException.class);
            assertThat(Duration.ofNanos(System.nanoTime() - mulai)).isLessThan(Duration.ofMillis(1_500));
        }
    }
}`, 'java'),
        callout('tip', 'Di aplikasi Spring', 'Untuk memanggil REST API dari Spring Boot, gunakan `RestClient` atau HTTP interface (`@HttpExchange`) yang timeout dan base URL-nya diatur lewat properti; lihat [Lab Anotasi Spring Boot 4.1](#java.spring-anotasi-lab). `java.net.http.HttpClient` tetap pilihan tepat untuk library, CLI, dan layanan tanpa framework.'),
        ...practice('java-lima-api-backend', [
          'Jalankan `mvn test` di `labs/java-backend/jdk-api` (JDK 21) dan pastikan 45 test lulus.',
          'Ubah `DasborNasabah` agar kurs boleh berumur sampai 5 menit dari cache lokal bila API kurs gagal.',
          'Tulis `PoolTerbatas` versi `CallerRunsPolicy` dan jelaskan kapan lebih baik daripada `AbortPolicy`.',
          'Tambahkan retry dengan backoff ke `KursClient` hanya untuk 5xx dan `HttpTimeoutException`, lalu uji dengan server lokal.',
          'Baca file CSV 500 MB dengan `Files.lines` dan ukur memori dibanding `readAllLines`.',
        ]),
        ...quiz([
          ['API5-01', 'Mengapa `CompletableFuture.supplyAsync(() -> panggilHttp())` tanpa executor berbahaya di aplikasi web?', 'Tugas berjalan di `ForkJoinPool.commonPool()` yang berukuran sekitar jumlah core dan dipakai bersama (termasuk parallel stream). Panggilan blocking menahan thread pool itu; beberapa request lambat cukup untuk membuat semua tugas async di aplikasi ikut antre.'],
          ['API5-02', 'Sebuah tugas di `executor.submit()` melempar exception, tetapi log bersih. Mengapa?', '`submit` membungkus tugas dalam `Future`; exception disimpan di sana dan hanya muncul sebagai `ExecutionException` saat `get()` dipanggil. Bila hasilnya tidak pernah diambil, error itu hilang. Simpan future dan ambil hasilnya, atau tangani exception di dalam tugas.'],
          ['API5-03', 'Apa beda `.toList()` dan `.collect(Collectors.toList())`?', '`.toList()` (Java 16+) mengembalikan list yang tidak bisa diubah (`add` melempar `UnsupportedOperationException`) dan menerima elemen null. `Collectors.toList()` mengembalikan list yang bisa diubah, tipenya tidak dijamin. Pilih `.toList()` kecuali Anda memang perlu mengubah hasilnya.'],
          ['API5-04', 'Mengapa `HttpRequest` sebaiknya selalu diberi `.timeout(...)`?', 'Tanpa timeout, request menunggu respons tanpa batas. Satu server hilir yang macet bisa menahan thread (atau virtual thread dan memori) di aplikasi Anda selamanya. `connectTimeout` di client hanya membatasi pembukaan koneksi, bukan menunggu respons.'],
          ['API5-05', 'Apa yang tercetak oleh `client.sendAsync(req, ofString()).thenAccept(System.out::println)`?', '`toString()` dari `HttpResponse`, misalnya `(GET http://host/path) 200`, bukan body. Untuk body gunakan `.thenApply(HttpResponse::body)`, dan cek `statusCode()` dulu karena 4xx/5xx tidak dianggap error oleh HttpClient.'],
        ]),
        references(
          ['Javadoc CompletableFuture', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html'],
          ['JEP 444: Virtual Threads', 'https://openjdk.org/jeps/444'],
          ['Javadoc Stream.toList()', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html#toList()'],
          ['Javadoc java.nio.file.Files', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html'],
          ['Javadoc java.net.http.HttpClient', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html'],
        ),
      ],
    },
  },
  {
    after: 'behavioral-patterns',
    module: {
      id: 'strategy-pattern-produksi',
      title: 'Strategy Pattern di Produksi: Review Contoh Populer, BigDecimal, Registry & Spring',
      summary: 'Membedah contoh Strategy yang sering beredar (diskon dengan double), lalu membangun versi produksi: kontrak yang tepat, BigDecimal, aturan bisnis eksplisit, pemilihan saat runtime, enum strategy untuk bunga pinjaman, dan injeksi Spring.',
      track: PATTERNS, ...src, duration: '1,5 jam', level: 'Med',
      blocks: [
        paragraph('[Behavioral Patterns](#java.behavioral-patterns) sudah menjelaskan idenya: Strategy membungkus setiap algoritma dalam objek tersendiri agar bisa ditukar tanpa mengubah kode pemakai. Modul ini membahas langkah berikutnya, yaitu bagaimana Strategy ditulis di kode yang menangani uang sungguhan, dimulai dari contoh yang sering beredar di media sosial.'),
        code('Bentuk contoh yang sering beredar (diringkas)', `public interface DiscountStrategy {
    double applyDiscount(double amount, int percentage);
}

public class ManagerDiscount implements DiscountStrategy {
    public double applyDiscount(double amount, int percentage) {
        if (percentage > 50) {
            System.out.println("[LOG] Manager discount capped at 50%");
            percentage = 50;                          // dipotong diam-diam
        }
        return amount * (1 - percentage / 100.0);
    }
}

// pemakaian: inner class non-static, dan klien memilih class konkret sendiri
DiscountStrategy d = main.new ManagerDiscount();
double hasil = d.applyDiscount(1000.0, 60);         // 500.0`, 'java'),
        table(['Masalah', 'Akibat', 'Perbaikan'], [
          ['`double` untuk uang', '`19999 × 0,85` = 16999.149999999998; diskon 10% dari 10,45 dibulatkan `Math.round` menjadi 9,40 (seharusnya 9,41)', '`BigDecimal` dengan skala dan `RoundingMode` eksplisit'],
          ['`percentage` di kontrak interface', 'Setiap strategi dipaksa menerima parameter yang mungkin tidak relevan; klien yang menentukan aturannya, bukan strategi', 'Kontrak hanya `hitung(harga)`; konfigurasi (persen, batas) masuk lewat konstruktor'],
          ['Batas 50% dipotong diam-diam', 'Manajer mengira memberi 60%, sistem memberi 50%, tanpa jejak', 'Aturan eksplisit: di atas batas wajib penyetuju, selain itu ditolak dengan exception'],
          ['`System.out.println` sebagai log', 'Tidak masuk sistem log/audit, tidak bisa difilter', 'Logger (`System.Logger`/SLF4J) dan hasil yang membawa alasan (`Diskon.keterangan`)'],
          ['`main.new DefaultDiscount()`', 'Inner class non-static terikat ke objek luar tanpa alasan', 'Class top-level atau record'],
          ['Klien menulis `new ...Discount()`', 'Pemilihan strategi tersebar di klien; menambah promo berarti mengubah klien', 'Registry: pilih berdasarkan kode saat runtime'],
        ]),
        heading('Versi produksi'),
        code('labs/java-backend/jdk-api/.../strategi/StrategiDiskon.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;

/**
 * Kontrak strategy hanya berisi apa yang SEMUA strategi butuhkan: harga masuk, diskon keluar.
 * Parameter khusus (persen, batas, siapa yang menyetujui) adalah konfigurasi strategi, masuk lewat konstruktor.
 */
public interface StrategiDiskon {

    String kode();

    Diskon hitung(BigDecimal harga);
}`, 'java'),
        code('labs/java-backend/jdk-api/.../strategi/Diskon.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/** Hasil strategy: potongan DAN alasannya, supaya bisa ditampilkan ke pelanggan dan dicatat untuk audit. */
public record Diskon(BigDecimal potongan, String keterangan) {

    public Diskon {
        Objects.requireNonNull(potongan, "potongan");
        if (potongan.signum() < 0) {
            throw new IllegalArgumentException("Potongan tidak boleh negatif: " + potongan);
        }
    }

    public static final Diskon TIDAK_ADA = new Diskon(BigDecimal.ZERO, "tanpa diskon");

    /** Persen dari harga, dibulatkan ke rupiah penuh. Ikuti kebijakan pembulatan internal di sistem nyata. */
    static BigDecimal persen(BigDecimal harga, BigDecimal persen) {
        return harga.multiply(persen).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }

    public BigDecimal hargaAkhir(BigDecimal harga) {
        return harga.subtract(potongan).max(BigDecimal.ZERO);
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../strategi/DiskonPersen.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;

/** Diskon persen dengan batas maksimal opsional, mis. "20% maks Rp50.000". Record = immutable, aman dibagi antar thread. */
public record DiskonPersen(String kode, BigDecimal persen, BigDecimal maksimal) implements StrategiDiskon {

    public DiskonPersen {
        if (persen.signum() <= 0 || persen.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Persen harus di antara 0 dan 100: " + persen);
        }
    }

    public static DiskonPersen tanpaBatas(String kode, String persen) {
        return new DiskonPersen(kode, new BigDecimal(persen), null);
    }

    public static DiskonPersen denganBatas(String kode, String persen, String maksimal) {
        return new DiskonPersen(kode, new BigDecimal(persen), new BigDecimal(maksimal));
    }

    @Override
    public Diskon hitung(BigDecimal harga) {
        BigDecimal potongan = Diskon.persen(harga, persen);
        if (maksimal != null && potongan.compareTo(maksimal) > 0) {
            return new Diskon(maksimal, persen.toPlainString() + "% dibatasi maksimal " + maksimal.toPlainString());
        }
        return new Diskon(potongan, persen.toPlainString() + "%");
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../strategi/DiskonManajer.java', `package id.playbook.jdkapi.strategi;

import java.lang.System.Logger;
import java.lang.System.Logger.Level;
import java.math.BigDecimal;

/**
 * Diskon khusus yang dimasukkan manajer. Aturan bisnisnya EKSPLISIT:
 * sampai batas kewenangan langsung berlaku; di atas batas wajib ada penyetuju. Tidak ada "potong diam-diam".
 */
public record DiskonManajer(String kode, BigDecimal persen, BigDecimal batasKewenangan, String disetujuiOleh)
        implements StrategiDiskon {

    private static final Logger AUDIT = System.getLogger("audit.diskon");   // JDK logger, bukan System.out

    public DiskonManajer {
        if (persen.signum() <= 0 || persen.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Persen harus di antara 0 dan 100: " + persen);
        }
    }

    @Override
    public Diskon hitung(BigDecimal harga) {
        if (persen.compareTo(batasKewenangan) > 0 && (disetujuiOleh == null || disetujuiOleh.isBlank())) {
            throw new PersetujuanDiperlukanException(
                    "Diskon " + persen.toPlainString() + "% melebihi batas " + batasKewenangan.toPlainString() + "%");
        }
        BigDecimal potongan = Diskon.persen(harga, persen);
        String keterangan = disetujuiOleh == null
                ? "diskon manajer " + persen.toPlainString() + "%"
                : "diskon manajer " + persen.toPlainString() + "%, disetujui " + disetujuiOleh;
        AUDIT.log(Level.INFO, "kode={0} harga={1} potongan={2} keterangan={3}", kode, harga, potongan, keterangan);
        return new Diskon(potongan, keterangan);
    }

    public static final class PersetujuanDiperlukanException extends RuntimeException {
        public PersetujuanDiperlukanException(String pesan) {
            super(pesan);
        }
    }
}`, 'java'),
        code('labs/java-backend/jdk-api/.../strategi/RegistriDiskon.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Pemilihan strategy saat RUNTIME berdasarkan kode (dari request, konfigurasi, atau database promo).
 * Klien tidak pernah menulis "new DiskonX()" sendiri; menambah promo tidak mengubah kode klien.
 */
public final class RegistriDiskon {

    private final Map<String, StrategiDiskon> perKode;

    public RegistriDiskon(Collection<? extends StrategiDiskon> semua) {
        // toUnmodifiableMap gagal dengan IllegalStateException bila ada kode ganda: ketahuan saat start
        this.perKode = semua.stream().collect(Collectors.toUnmodifiableMap(StrategiDiskon::kode, Function.identity()));
    }

    public Optional<StrategiDiskon> cari(String kode) {
        return Optional.ofNullable(perKode.get(kode));
    }

    /** Kode kosong = tanpa diskon; kode yang tidak dikenal = ditolak (jangan diam-diam diberi harga normal). */
    public Diskon hitung(String kode, BigDecimal harga) {
        if (kode == null || kode.isBlank()) {
            return Diskon.TIDAK_ADA;
        }
        return cari(kode)
                .orElseThrow(() -> new IllegalArgumentException("Kode promo tidak dikenal: " + kode))
                .hitung(harga);
    }
}`, 'java'),
        heading('Enum strategy: pilihan tertutup seperti metode bunga'),
        paragraph('Bila daftar strategi tertutup dan diatur produk atau regulasi, misalnya metode bunga pinjaman, enum dengan method per konstanta lebih tepat: semua pilihan terlihat di satu tempat, `switch` bisa dicek kelengkapannya, dan nilai dari konfigurasi dipetakan dengan `valueOf`. Untuk pokok Rp12 juta, bunga 12% per tahun, tenor 12 bulan: flat menghasilkan total bunga Rp1.440.000, menurun Rp780.000.'),
        code('labs/java-backend/jdk-api/.../strategi/MetodeBunga.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Enum strategy: cocok bila pilihannya TERTUTUP dan diatur regulasi/produk (bukan promo yang bertambah tiap minggu).
 * Total bunga pinjaman dengan pokok dicicil rata per bulan.
 */
public enum MetodeBunga {

    /** Bunga dihitung dari pokok AWAL setiap bulan (umum di KTA dan kredit kendaraan). */
    FLAT {
        @Override
        public BigDecimal totalBunga(BigDecimal pokok, BigDecimal bungaPerTahun, int tenorBulan) {
            return pokok.multiply(bungaPerTahun).multiply(BigDecimal.valueOf(tenorBulan))
                    .divide(BigDecimal.valueOf(1200), 0, RoundingMode.HALF_UP);
        }
    },

    /** Bunga dihitung dari SISA pokok setiap bulan (efektif/menurun). */
    MENURUN {
        @Override
        public BigDecimal totalBunga(BigDecimal pokok, BigDecimal bungaPerTahun, int tenorBulan) {
            BigDecimal cicilanPokok = pokok.divide(BigDecimal.valueOf(tenorBulan), 10, RoundingMode.HALF_UP);
            BigDecimal sisa = pokok;
            BigDecimal total = BigDecimal.ZERO;
            for (int bulan = 1; bulan <= tenorBulan; bulan++) {
                total = total.add(sisa.multiply(bungaPerTahun).divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP));
                sisa = sisa.subtract(cicilanPokok);
            }
            return total.setScale(0, RoundingMode.HALF_UP);
        }
    };

    public abstract BigDecimal totalBunga(BigDecimal pokok, BigDecimal bungaPerTahun, int tenorBulan);
}`, 'java'),
        code('labs/java-backend/jdk-api/.../strategi/StrategiTest.java', `package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.function.UnaryOperator;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StrategiTest {

    @Test
    void doubleUntukUangMenghasilkanAngkaYangSalah() {
        // Bentuk yang sering beredar: amount * (1 - percentage / 100.0)
        assertThat(19_999.0 * (1 - 15 / 100.0)).isEqualTo(16999.149999999998);
        assertThat(Math.round(10.45 * (1 - 10 / 100.0) * 100) / 100.0).isEqualTo(9.40);   // seharusnya 9.41
        assertThat(new BigDecimal("10.45").multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP))
                .isEqualByComparingTo("9.41");
    }

    @Test
    void persenDenganBatasMaksimal() {
        StrategiDiskon hemat = DiskonPersen.denganBatas("HEMAT20", "20", "50000");
        assertThat(hemat.hitung(new BigDecimal("100000")).potongan()).isEqualByComparingTo("20000");
        Diskon besar = hemat.hitung(new BigDecimal("1000000"));
        assertThat(besar.potongan()).isEqualByComparingTo("50000");
        assertThat(besar.keterangan()).isEqualTo("20% dibatasi maksimal 50000");
        assertThat(besar.hargaAkhir(new BigDecimal("1000000"))).isEqualByComparingTo("950000");
    }

    @Test
    void persenDibulatkanKeRupiahPenuh() {
        Diskon d = DiskonPersen.tanpaBatas("PROMO15", "15").hitung(new BigDecimal("19999"));
        assertThat(d.potongan()).isEqualByComparingTo("3000");          // 2999.85 -> 3000
        assertThat(d.hargaAkhir(new BigDecimal("19999"))).isEqualByComparingTo("16999");
    }

    @Test
    void diskonManajerDiAtasBatasWajibPersetujuan() {
        BigDecimal batas = new BigDecimal("50");
        StrategiDiskon tanpaPenyetuju = new DiskonManajer("MGR", new BigDecimal("60"), batas, null);
        assertThatThrownBy(() -> tanpaPenyetuju.hitung(new BigDecimal("1000")))
                .isInstanceOf(DiskonManajer.PersetujuanDiperlukanException.class)
                .hasMessage("Diskon 60% melebihi batas 50%");

        Diskon disetujui = new DiskonManajer("MGR", new BigDecimal("60"), batas, "kepala-cabang-007")
                .hitung(new BigDecimal("1000"));
        assertThat(disetujui.potongan()).isEqualByComparingTo("600");
        assertThat(disetujui.keterangan()).contains("disetujui kepala-cabang-007");

        assertThat(new DiskonManajer("MGR", new BigDecimal("10"), batas, null).hitung(new BigDecimal("1000")).potongan())
                .isEqualByComparingTo("100");
    }

    @Test
    void registriMemilihStrategiSaatRuntime() {
        var registri = new RegistriDiskon(List.of(
                DiskonPersen.tanpaBatas("PROMO10", "10"),
                DiskonPersen.denganBatas("HEMAT20", "20", "50000")));

        assertThat(registri.hitung("PROMO10", new BigDecimal("1000")).potongan()).isEqualByComparingTo("100");
        assertThat(registri.hitung("", new BigDecimal("1000"))).isEqualTo(Diskon.TIDAK_ADA);
        assertThatThrownBy(() -> registri.hitung("GRATIS", BigDecimal.TEN)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void kodeGandaGagalSaatStart() {
        assertThatThrownBy(() -> new RegistriDiskon(List.of(
                DiskonPersen.tanpaBatas("PROMO10", "10"),
                DiskonPersen.tanpaBatas("PROMO10", "15"))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PROMO10");
    }

    @Test
    void enumStrategyMetodeBunga() {
        BigDecimal pokok = new BigDecimal("12000000");
        BigDecimal bunga = new BigDecimal("12");                       // 12% per tahun, tenor 12 bulan
        assertThat(MetodeBunga.FLAT.totalBunga(pokok, bunga, 12)).isEqualByComparingTo("1440000");
        assertThat(MetodeBunga.MENURUN.totalBunga(pokok, bunga, 12)).isEqualByComparingTo("780000");
        assertThat(MetodeBunga.valueOf("MENURUN")).isSameAs(MetodeBunga.MENURUN);   // pilih dari string konfigurasi
    }

    @Test
    void strategiSederhanaCukupLambda() {
        // Bila strategi hanya satu fungsi tanpa konfigurasi/audit, interface fungsional + lambda sudah cukup.
        Map<String, UnaryOperator<BigDecimal>> pembulatan = Map.of(
                "RUPIAH", x -> x.setScale(0, RoundingMode.HALF_UP),
                "RIBUAN", x -> x.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(1000)));
        assertThat(pembulatan.get("RIBUAN").apply(new BigDecimal("16999.15"))).isEqualByComparingTo("17000");
        assertThat(pembulatan.get("RUPIAH").apply(new BigDecimal("16999.15"))).isEqualByComparingTo("16999");
    }
}`, 'java'),
        heading('Dengan Spring: setiap strategi sebuah bean'),
        paragraph('Di Spring, setiap implementasi ditandai `@Component`, dan Spring menyuntikkan semuanya sebagai `List<StrategiDiskon>`. Menambah promo baru cukup dengan menambah satu class; registry dan klien tidak berubah. Spring juga bisa menyuntikkan `Map<String, StrategiDiskon>` dengan key nama bean, tetapi kode eksplisit (`kode()`) lebih stabil: nama bean berubah saat class di-rename.'),
        code('labs/java-backend/spring-anotasi/.../strategi/Promo.java', `package id.playbook.anotasi.strategi;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

/** Tiga implementasi sebagai bean. Di proyek nyata masing-masing di file sendiri. */
final class Promo {

    private static final BigDecimal SERATUS = BigDecimal.valueOf(100);

    private Promo() {
    }

    static BigDecimal persen(BigDecimal harga, BigDecimal persen) {
        return harga.multiply(persen).divide(SERATUS, 0, RoundingMode.HALF_UP);
    }

    @Component
    static class Diskon10Persen implements StrategiDiskon {
        public String kode() {
            return "PROMO10";
        }

        public BigDecimal potongan(BigDecimal harga) {
            return persen(harga, BigDecimal.TEN);
        }
    }

    /** "Diskon 20% maksimal Rp50.000": bentuk promo paling umum di e-commerce dan kartu kredit. */
    @Component
    static class Diskon20PersenMaks50Ribu implements StrategiDiskon {
        private static final BigDecimal MAKS = BigDecimal.valueOf(50_000);

        public String kode() {
            return "HEMAT20";
        }

        public BigDecimal potongan(BigDecimal harga) {
            return persen(harga, BigDecimal.valueOf(20)).min(MAKS);
        }
    }

    @Component
    static class TanpaDiskon implements StrategiDiskon {
        public String kode() {
            return "TANPA";
        }

        public BigDecimal potongan(BigDecimal harga) {
            return BigDecimal.ZERO;
        }
    }
}`, 'java'),
        code('labs/java-backend/spring-anotasi/.../strategi/RegistriDiskon.java', `package id.playbook.anotasi.strategi;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

/**
 * Spring menyuntikkan SEMUA bean StrategiDiskon sebagai List. Registri memetakannya per kode.
 * toUnmodifiableMap melempar IllegalStateException bila dua promo memakai kode yang sama:
 * kesalahan konfigurasi ketahuan saat aplikasi start, bukan saat nasabah checkout.
 */
@Service
public class RegistriDiskon {

    private final Map<String, StrategiDiskon> perKode;

    public RegistriDiskon(List<StrategiDiskon> semua) {
        this.perKode = semua.stream().collect(Collectors.toUnmodifiableMap(StrategiDiskon::kode, Function.identity()));
    }

    public BigDecimal hargaAkhir(String kodePromo, BigDecimal harga) {
        StrategiDiskon strategi = perKode.get(kodePromo);
        if (strategi == null) {
            throw new IllegalArgumentException("Kode promo tidak dikenal: " + kodePromo);
        }
        return harga.subtract(strategi.potongan(harga));
    }

    public Set<String> kodeTersedia() {
        return perKode.keySet();
    }
}`, 'java'),
        code('labs/java-backend/spring-anotasi/.../strategi/RegistriDiskonTest.java', `package id.playbook.anotasi.strategi;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RegistriDiskonTest {

    @Test
    void springMenyuntikkanSemuaStrategiKeRegistri() {
        try (var ctx = new AnnotationConfigApplicationContext(RegistriDiskon.class.getPackageName())) {
            RegistriDiskon registri = ctx.getBean(RegistriDiskon.class);

            assertThat(registri.kodeTersedia()).containsExactlyInAnyOrder("PROMO10", "HEMAT20", "TANPA");
            assertThat(registri.hargaAkhir("PROMO10", new BigDecimal("199999"))).isEqualByComparingTo("179999");
            assertThat(registri.hargaAkhir("HEMAT20", new BigDecimal("1000000"))).isEqualByComparingTo("950000");  // maks 50 ribu
            assertThat(registri.hargaAkhir("HEMAT20", new BigDecimal("100000"))).isEqualByComparingTo("80000");
            assertThatThrownBy(() -> registri.hargaAkhir("GRATIS", BigDecimal.TEN)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void kodeGandaKetahuanSaatStartup() {
        StrategiDiskon a = new Promo.Diskon10Persen();
        StrategiDiskon b = new Promo.Diskon10Persen();
        assertThatThrownBy(() -> new RegistriDiskon(List.of(a, b)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PROMO10");
    }
}`, 'java'),
        heading('Memilih bentuk'),
        table(['Bentuk', 'Pakai bila', 'Contoh'], [
          ['Interface + class/record', 'Strategi punya konfigurasi, dependensi, atau audit; daftarnya terus bertambah', 'Promo, aturan biaya per merchant'],
          ['Enum dengan method per konstanta', 'Daftar tertutup dan jarang berubah', 'Metode bunga, jenis pembulatan'],
          ['Lambda (`Function`, `UnaryOperator`)', 'Satu fungsi tanpa state dan tanpa kebutuhan audit', 'Format tampilan, pembulatan sederhana'],
          ['Sealed interface + record + `switch`', 'Variannya adalah DATA dan logikanya terpusat (bukan polimorfisme)', 'Jenis transaksi yang diproses satu service'],
        ]),
        callout('tip', 'Konsisten dengan modul Behavioral Patterns', 'Contoh `ShippingStrategy` di modul sebelumnya juga memakai `BigDecimal` untuk ongkos kirim dan berat, dan mengembalikan record `ShippingQuote`. Berat ikut `BigDecimal` agar galat float dari penjumlahan berat tidak terbawa ke perhitungan biaya.'),
        ...practice('strategy-pattern-produksi', [
          'Tambahkan strategi `CashbackKartuKredit` (10% maks Rp100.000, hanya untuk BIN kartu tertentu) tanpa mengubah `RegistriDiskon`.',
          'Tambahkan metode bunga `ANUITAS` ke `MetodeBunga` dan uji dengan simulasi kredit yang Anda kenal.',
          'Ubah `RegistriDiskon` agar memuat daftar promo aktif dari database dan menolak promo yang sudah kedaluwarsa.',
          'Tulis test yang memastikan setiap strategi tidak pernah menghasilkan potongan lebih besar dari harga.',
        ]),
        ...quiz([
          ['SPT-01', 'Mengapa parameter `percentage` sebaiknya tidak ada di method interface strategy?', 'Karena itu konfigurasi milik strategi tertentu, bukan kebutuhan semua strategi. Bila ada di kontrak, klien yang menentukan aturannya dan strategi yang tidak memakai persen terpaksa mengabaikannya. Konfigurasi masuk lewat konstruktor; kontrak hanya berisi data yang dibutuhkan semua implementasi.'],
          ['SPT-02', 'Mengapa diskon manajer di atas batas sebaiknya ditolak, bukan dipotong ke 50%?', 'Pemotongan diam-diam membuat sistem melakukan hal yang tidak diminta pengguna tanpa jejak, dan menyembunyikan pelanggaran kebijakan. Menolak dengan pesan jelas (atau meminta persetujuan) membuat aturan bisnis eksplisit, bisa diaudit, dan bisa diuji.'],
          ['SPT-03', 'Kapan enum lebih cocok daripada interface + class untuk Strategy?', 'Saat daftar strategi tertutup dan jarang berubah (metode bunga, jenis pembulatan): semua varian terlihat di satu file, bisa dipilih dari konfigurasi dengan `valueOf`, dan aman dipakai di `switch`. Untuk daftar yang terus bertambah atau butuh dependensi, interface + class lebih tepat.'],
          ['SPT-04', 'Spring bisa menyuntikkan `Map<String, StrategiDiskon>` dengan key nama bean. Mengapa memilih method `kode()` sendiri?', 'Nama bean berasal dari nama class dan ikut berubah saat class di-rename, padahal kode promo adalah kontrak dengan klien atau data di database. Kode eksplisit stabil, dan duplikasi kode ketahuan saat aplikasi start lewat `toUnmodifiableMap`.'],
        ]),
        references(
          ['Refactoring.Guru: Strategy', 'https://refactoring.guru/design-patterns/strategy'],
          ['Javadoc BigDecimal', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html'],
          ['Spring Framework: Autowiring collections', 'https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html'],
        ),
      ],
    },
  },
  {
    after: 'anotasi-inti-struktur-layer',
    module: {
      id: 'spring-anotasi-boot4',
      title: 'Cheat Sheet Anotasi Spring Boot 4.1 (Terverifikasi) & Koreksi Cheat Sheet Lama',
      summary: 'Anotasi yang benar-benar dipakai di Spring Boot 4.1 / Spring Framework 7, dikelompokkan per kebutuhan dan diperiksa langsung terhadap jar; plus daftar koreksi untuk cheat sheet lama yang masih beredar.',
      track: SPRING, ...src, duration: '1 jam', level: 'Easy',
      blocks: [
        paragraph('Cheat sheet anotasi Spring yang beredar di media sosial kebanyakan ditulis untuk Spring 4 dan Boot 1.x. Sebagian anotasinya sudah dihapus, sebagian pindah paket, dan beberapa deskripsinya keliru sejak awal. Cheat sheet di modul ini disusun untuk **Spring Boot 4.1.2** (Spring Framework 7.0, Spring Security 7.1, Jakarta EE 11). Setiap klaim "dihapus", "pindah paket", dan "deprecated" diperiksa langsung terhadap classpath dengan test, bukan dari ingatan.'),
        code('labs/java-backend/spring-anotasi/.../AnotasiBoot4Test.java', `package id.playbook.anotasi;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Bukti, bukan ingatan: classpath Spring Boot 4.1.2 diperiksa langsung.
 * Jalankan ulang setelah upgrade versi untuk melihat apa yang berubah.
 */
class AnotasiBoot4Test {

    @ParameterizedTest
    @ValueSource(strings = {
            "org.springframework.boot.test.mock.mockito.MockBean",                         // dihapus Boot 4 -> @MockitoBean
            "org.springframework.boot.test.mock.mockito.SpyBean",                          // dihapus Boot 4 -> @MockitoSpyBean
            "org.springframework.beans.factory.annotation.Required",                       // dihapus Spring 6
            "org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter",
            "org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity",
            "org.springframework.data.annotation.PersistenceConstructor",                  // -> @PersistenceCreator
            "org.springframework.boot.jackson.JsonComponent",                              // Boot 4 -> @JacksonComponent
            "org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest",          // lokasi Boot 3
            "org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest",             // lokasi Boot 3
            "org.springframework.boot.autoconfigure.domain.EntityScan",                    // lokasi Boot 3
            "javax.annotation.PostConstruct",                                              // -> jakarta.annotation
            "javax.persistence.Entity",                                                    // -> jakarta.persistence
            "jakarta.annotation.ManagedBean",                                              // tidak ada di Jakarta Annotations 3.0
    })
    void sudahTidakAdaDiBoot4(String kelas) {
        assertThatThrownBy(() -> Class.forName(kelas)).isInstanceOf(ClassNotFoundException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "org.springframework.test.context.bean.override.mockito.MockitoBean",
            "org.springframework.test.context.bean.override.mockito.MockitoSpyBean",
            "org.springframework.data.annotation.PersistenceCreator",
            "org.springframework.boot.jackson.JacksonComponent",
            "org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest",
            "org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest",
            "org.springframework.boot.persistence.autoconfigure.EntityScan",
            "org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity",
            "org.springframework.resilience.annotation.Retryable",
            "org.springframework.resilience.annotation.ConcurrencyLimit",
            "org.springframework.web.service.registry.ImportHttpServices",
            "org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty",
            "jakarta.annotation.PostConstruct",
            "org.jspecify.annotations.NullMarked",
    })
    void penggantinyaAda(String kelas) throws ClassNotFoundException {
        assertThat(Class.forName(kelas)).isNotNull();
    }

    @Test
    void masihAdaTetapiDeprecated() throws Exception {
        Class<?> globalMethodSecurity =
                Class.forName("org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity");
        assertThat(globalMethodSecurity.isAnnotationPresent(Deprecated.class)).isTrue();
        assertThat(Class.forName("org.springframework.lang.Nullable").isAnnotationPresent(Deprecated.class)).isTrue();
        assertThat(HttpStatus.class.getField("UNPROCESSABLE_ENTITY").isAnnotationPresent(Deprecated.class)).isTrue();
    }
}`, 'java'),
        heading('Komponen & dependency injection'),
        table(['Anotasi', 'Fungsi', 'Catatan'], [
          ['`@Component`, `@Service`, `@Repository`, `@Controller`', 'Mendaftarkan class sebagai bean lewat component scan', '`@Repository` juga menerjemahkan exception persistence menjadi `DataAccessException`'],
          ['`@Configuration(proxyBeanMethods = false)` + `@Bean`', 'Bean yang dibuat manual (class pihak ketiga, konfigurasi khusus)', '`proxyBeanMethods = false` mempercepat start bila method `@Bean` tidak saling memanggil'],
          ['(tanpa anotasi) constructor injection', 'Satu konstruktor otomatis dipakai untuk injeksi', '`@Autowired` tidak diperlukan; field bisa `final`; mudah dites tanpa Spring'],
          ['`@Qualifier`, `@Primary`', 'Memilih bean bila ada lebih dari satu kandidat', 'Untuk banyak implementasi sekaligus, suntikkan `List<T>` (lihat [Strategy di Produksi](#java.strategy-pattern-produksi))'],
          ['`@Lazy`, `@Scope`', 'Inisialisasi saat dipakai; scope selain singleton', '`@RequestScope`/`@SessionScope` untuk bean per request/sesi web'],
          ['`@Profile`, `@ConditionalOnProperty`, `@ConditionalOnBooleanProperty`', 'Bean hanya aktif pada profil/properti tertentu', '`@ConditionalOnBooleanProperty` baru sejak Boot 3.5'],
          ['`@PostConstruct`, `@PreDestroy`', 'Hook setelah bean dibuat / sebelum dihancurkan', 'Paket `jakarta.annotation` (bukan `javax`)'],
          ['`@Inject`, `@Named`, `@Resource`', 'Alternatif standar Jakarta untuk injeksi', 'Paket `jakarta.inject` / `jakarta.annotation`; jarang perlu di proyek Spring'],
        ]),
        heading('Konfigurasi Spring Boot'),
        table(['Anotasi', 'Fungsi', 'Catatan'], [
          ['`@SpringBootApplication`', '`@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`', 'Jangan taruh `@Enable*` di class ini; test slice ikut memuatnya'],
          ['`@ConfigurationProperties` + record', 'Konfigurasi bertipe dan immutable', 'Tanpa `@ConstructorBinding` sejak Boot 3; daftarkan dengan `@ConfigurationPropertiesScan`'],
          ['`@Validated` + Jakarta Validation', 'Aplikasi gagal start bila konfigurasi tidak valid', 'Lebih baik gagal saat deploy daripada saat transaksi pertama'],
          ['`@DefaultValue`', 'Nilai default untuk parameter record properties', 'Paket `org.springframework.boot.context.properties.bind`'],
          ['`@Value("${...}")`', 'Satu nilai properti', 'Untuk lebih dari satu-dua nilai, pakai `@ConfigurationProperties`'],
          ['`@EntityScan`', 'Paket entity di luar paket aplikasi', 'Boot 4: `org.springframework.boot.persistence.autoconfigure.EntityScan`'],
        ]),
        heading('Web MVC & HTTP client'),
        table(['Anotasi', 'Fungsi', 'Catatan'], [
          ['`@RestController`, `@RequestMapping`', 'Controller REST; prefix path', 'Bukan `@RESTController` seperti di cheat sheet lama'],
          ['`@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping`', 'Pemetaan per metode HTTP', 'Spring 7: atribut `version` untuk API versioning'],
          ['`@PathVariable`, `@RequestParam`, `@RequestHeader`, `@CookieValue`, `@RequestBody`', 'Mengikat bagian request ke parameter', '`@CookieValue` dengan C besar'],
          ['`@Valid`', 'Validasi body/parameter; gagal = 400', 'Paket `jakarta.validation`'],
          ['`@ResponseStatus`', 'Status HTTP untuk handler atau class exception', 'Bukan "menandai business exception"'],
          ['`@RestControllerAdvice` + `@ExceptionHandler`', 'Penanganan error terpusat', 'Kembalikan `ProblemDetail` (RFC 9457)'],
          ['`@CrossOrigin`', 'CORS per controller', 'Untuk aturan global, atur di `WebMvcConfigurer` atau Spring Security'],
          ['`@HttpExchange`, `@GetExchange`, `@PostExchange`', 'Klien HTTP deklaratif dari interface', 'Pengganti Feign untuk kebanyakan kasus'],
          ['`@ImportHttpServices`', 'Spring 7: mendaftarkan HTTP interface sebagai bean per grup', 'Base URL/timeout lewat `spring.http.serviceclient.<grup>.*`'],
        ]),
        callout('warn', '@EnableWebMvc di Spring Boot', 'Menambahkan `@EnableWebMvc` di aplikasi Boot mematikan auto-configuration Spring MVC (konverter, static resource, format tanggal dari properti). Untuk kustomisasi, implementasikan `WebMvcConfigurer` tanpa `@EnableWebMvc`.'),
        heading('Data & transaksi'),
        table(['Anotasi', 'Fungsi', 'Catatan'], [
          ['`@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`', 'Pemetaan JPA', 'Paket `jakarta.persistence`'],
          ['`@Version`', 'Optimistic locking', 'Update dari salinan basi gagal dengan `ObjectOptimisticLockingFailureException`'],
          ['`@Query`, `@Modifying`, `@Lock`, `@EntityGraph`', 'Query kustom, query ubah, pessimistic lock, fetch graph', '`@Lock(PESSIMISTIC_WRITE)` = `SELECT ... FOR UPDATE`'],
          ['`@Transactional`', 'Batas transaksi (class atau method)', 'Tidak berlaku untuk pemanggilan dari class yang sama; checked exception tidak rollback secara default'],
          ['`@TransactionalEventListener`', 'Listener yang berjalan pada fase transaksi (default AFTER_COMMIT)', 'Notifikasi hanya untuk transaksi yang benar-benar commit'],
          ['`@EnableJpaAuditing` + `@CreatedDate`/`@LastModifiedDate`', 'Kolom audit otomatis', '`@EnableJpaRepositories` dan `@EnableTransactionManagement` sudah otomatis di Boot'],
          ['`@PersistenceCreator`', 'Konstruktor yang dipakai Spring Data untuk membuat objek', 'Pengganti `@PersistenceConstructor` (sudah dihapus)'],
        ]),
        heading('Keamanan'),
        table(['Anotasi / bentuk', 'Fungsi', 'Catatan'], [
          ['Bean `SecurityFilterChain`', 'Aturan keamanan HTTP', '`WebSecurityConfigurerAdapter` sudah dihapus'],
          ['`@EnableMethodSecurity`', 'Mengaktifkan `@PreAuthorize`/`@PostAuthorize`', '`@EnableGlobalMethodSecurity` deprecated'],
          ['`@PreAuthorize("hasRole(\'TELLER\')")`', 'Otorisasi per method', 'Diperiksa sebelum method berjalan; 403 bila tidak berhak'],
          ['`@AuthenticationPrincipal`', 'Pengguna yang login sebagai parameter controller', 'Paket `org.springframework.security.core.annotation`'],
          ['`@EnableWebSecurity`', 'Mengaktifkan konfigurasi web security', 'Opsional di Boot bila sudah ada bean `SecurityFilterChain`'],
        ]),
        heading('Async, jadwal, cache & resilience'),
        table(['Anotasi', 'Fungsi', 'Catatan'], [
          ['`@EnableAsync` + `@Async`', 'Jalankan method di executor lain', 'Dengan `spring.threads.virtual.enabled=true` memakai virtual thread; kembalikan `CompletableFuture`'],
          ['`@EnableScheduling` + `@Scheduled`', 'Job terjadwal (`cron`, `fixedDelay`, `fixedRate`)', 'Tulis `zone` eksplisit; cron `"-"` mematikan job'],
          ['`@EnableCaching` + `@Cacheable`/`@CachePut`/`@CacheEvict`', 'Cache hasil method', '`@CachePut` selalu menjalankan method lalu menimpa cache'],
          ['`@EnableResilientMethods` + `@Retryable`', 'Spring 7: retry tanpa library tambahan', 'Atribut `includes`, `maxRetries`, `delay`, `multiplier`, `jitter`, `timeout`'],
          ['`@ConcurrencyLimit`', 'Spring 7: batasi eksekusi bersamaan sebuah method', 'Policy `BLOCK` (default) atau `REJECT`; berguna bersama virtual thread'],
        ]),
        heading('Testing'),
        table(['Anotasi', 'Fungsi', 'Catatan Boot 4'], [
          ['`@SpringBootTest`', 'Seluruh context aplikasi', 'Paket tetap `org.springframework.boot.test.context`'],
          ['`@WebMvcTest`', 'Slice web: controller, advice, filter, security', '`org.springframework.boot.webmvc.test.autoconfigure`, starter `spring-boot-starter-webmvc-test`'],
          ['`@DataJpaTest`', 'Slice JPA dengan database embedded', '`org.springframework.boot.data.jpa.test.autoconfigure`, starter `spring-boot-starter-data-jpa-test`'],
          ['`@MockitoBean`, `@MockitoSpyBean`', 'Mengganti bean di context dengan mock/spy', 'Pengganti `@MockBean`/`@SpyBean` yang sudah dihapus'],
          ['`@TestConfiguration`, `@DynamicPropertySource`', 'Bean tambahan untuk test; properti yang dihitung saat runtime', 'Contoh: port server palsu'],
          ['`@WithMockUser`', 'Menjalankan test sebagai pengguna dengan role tertentu', 'Dari `spring-security-test`'],
          ['`@ServiceConnection`', 'Menghubungkan container Testcontainers ke properti koneksi', 'Butuh `spring-boot-testcontainers`; lihat [Testcontainers & Resilience4j](#java.spring-testcontainers-resilience)'],
        ]),
        heading('Null-safety'),
        paragraph('Spring Framework 7 memakai anotasi [JSpecify](https://jspecify.dev): `@NullMarked` di `package-info.java` membuat semua tipe di paket itu dianggap non-null kecuali diberi `org.jspecify.annotations.Nullable`. `org.springframework.lang.Nullable` masih ada tetapi sudah deprecated.'),
        heading('Koreksi cheat sheet lama'),
        table(['Di cheat sheet lama', 'Status di Boot 4.1', 'Pengganti / catatan'], [
          ['`@Required`', 'Dihapus (terverifikasi)', 'Constructor injection'],
          ['`@ManagedBean`', 'Tidak ada di Jakarta Annotations 3.0 (terverifikasi)', '`@Component`'],
          ['`@MockBean`, `@SpyBean`', 'Dihapus (terverifikasi)', '`@MockitoBean`, `@MockitoSpyBean`'],
          ['`@EnableWebSecurity` "extends WebSecurityConfigurerAdapter"', 'Adapter dihapus (terverifikasi)', 'Bean `SecurityFilterChain`'],
          ['`@EnableGlobalMethodSecurity`', 'Deprecated (terverifikasi)', '`@EnableMethodSecurity`'],
          ['`@EnableWebMvcSecurity`', 'Dihapus (terverifikasi)', 'Tidak perlu'],
          ['`@PersistenceConstructor`', 'Dihapus (terverifikasi)', '`@PersistenceCreator`'],
          ['`@JsonComponent`', 'Dihapus di Boot 4 (terverifikasi)', '`@JacksonComponent` (Jackson 3)'],
          ['`@WebMvcTest`/`@DataJpaTest` "with @RunWith(SpringRunner.class)"', 'Paket pindah (terverifikasi); `@RunWith` adalah JUnit 4', 'JUnit 5/6: tidak perlu anotasi tambahan'],
          ['`@WebIntegrationTest`, `@SpringApplicationConfiguration`', 'Era Boot 1.x', '`@SpringBootTest`'],
          ['`@ExportMetricWriter`, `@ExportMetricReader`', 'Era Boot 1.x', 'Micrometer'],
          ['`@DataMongoTest` "in-memory embedded MongoDB"', 'Dukungan embedded MongoDB sudah dihapus sejak Boot 3', 'Testcontainers'],
          ['`@EnableAuthorizationServer`, `@EnableResourceServer`, `@EnableOAuth2Client`, `@EnableOAuth2Sso`', 'Proyek Spring Security OAuth lama sudah EOL', 'Spring Authorization Server; `oauth2ResourceServer()`/`oauth2Login()` di `SecurityFilterChain`'],
          ['`@EnableHystrix`, `@HystrixCommand`, `@RibbonClient`, `@EnableZuulProxy`, `@EnableTurbine`', 'Dikeluarkan dari Spring Cloud sejak 2020.0', 'Resilience4j / Spring Cloud CircuitBreaker, Spring Cloud LoadBalancer, Spring Cloud Gateway'],
          ['`@EnableBinding`, `@StreamListener`, `@Input`, `@Output`', 'Model anotasi Spring Cloud Stream sudah dihapus', 'Bean `Function`/`Consumer`/`Supplier`'],
          ['`@SpanName`, `@EnableZipkinStreamServer` (Sleuth)', 'Sleuth digantikan Micrometer Tracing sejak Boot 3', '`@Observed`, OpenTelemetry'],
          ['`QuerydslPredicate` dengan `com.mysema.query...`', 'Paket Querydsl 3', '`com.querydsl.core.types.Predicate`'],
          ['`@RESTController`, `@cookieValue`, `@EhableOAuth2Client`, `@GatewayHeaer`, `@RepositoryEvenHandler`, `@AutoconfigureOrder`, `@@EnableConfigurationProperties`, `@EnableFeignCLients`, `@Spybean`, "`@Schedule`"', 'Salah tulis', '`@RestController`, `@CookieValue`, `@EnableOAuth2Client`, `@GatewayHeader`, `@RepositoryEventHandler`, `@AutoConfigureOrder`, `@EnableConfigurationProperties`, `@EnableFeignClients`, `@SpyBean`, `@Scheduled`'],
          ['`@ResponseStatus` "Indicates a business exception"', 'Deskripsi keliru', 'Menetapkan status HTTP untuk handler atau class exception'],
          ['`@ControllerAdvice` "auto-detected through classpath scanning"', 'Deskripsi keliru (salinan deskripsi lain)', 'Handler global untuk `@ExceptionHandler`, `@InitBinder`, `@ModelAttribute` di semua controller'],
          ['`@EnableEurekaServer` "enables the Eureka client"', 'Deskripsi keliru', 'Menjalankan server Eureka; klien cukup dependency + properti'],
          ['`@Headers` "Deprecated. Use @Header"', 'Deskripsi keliru', '`@Header` mengambil satu header pesan, `@Headers` seluruh header sebagai `Map`'],
          ['`@Target`, `@Retention`, `@interface` di bagian konfigurasi Spring', 'Bukan anotasi Spring', 'Fitur bahasa Java untuk membuat anotasi sendiri'],
        ]),
        callout('info', 'Cara membaca kolom status', '"Terverifikasi" berarti dicek oleh `AnotasiBoot4Test` terhadap classpath Spring Boot 4.1.2 di lab. Baris Spring Cloud, OAuth lama, dan Sleuth tidak ada di classpath lab, jadi statusnya mengacu pada dokumentasi resmi masing-masing proyek.'),
        ...practice('spring-anotasi-boot4', [
          'Jalankan `AnotasiBoot4Test` dan tambahkan tiga anotasi lain yang ingin Anda periksa.',
          'Cari di proyek Anda: `@MockBean`, `javax.`, `WebSecurityConfigurerAdapter`, `@EnableGlobalMethodSecurity`; buat daftar migrasinya.',
          'Pindahkan semua `@Enable*` dari class utama aplikasi Anda ke class `@Configuration` terpisah dan ukur waktu `@WebMvcTest` sebelum dan sesudahnya.',
        ]),
        ...quiz([
          ['SBA-01', 'Proyek naik dari Boot 3.3 ke 4.1 dan test gagal kompilasi di `@MockBean`. Apa penggantinya?', '`@MockitoBean` dari `org.springframework.test.context.bean.override.mockito` (Spring Framework 6.2+). `@MockBean` sudah deprecated sejak Boot 3.4 dan dihapus di Boot 4. Untuk spy, `@MockitoSpyBean`.'],
          ['SBA-02', 'Mengapa `@EnableCaching` atau `@EnableScheduling` sebaiknya tidak diletakkan di class `@SpringBootApplication`?', 'Test slice seperti `@WebMvcTest` memakai class utama sebagai konfigurasi, sehingga anotasi di sana ikut aktif dan membutuhkan bean yang tidak ada di slice, atau menjalankan job terjadwal di tengah test. Letakkan di class `@Configuration` terpisah.'],
          ['SBA-03', 'Apa bedanya `@EnableGlobalMethodSecurity` dan `@EnableMethodSecurity`?', '`@EnableMethodSecurity` (Security 5.6+) adalah penggantinya: memakai `AuthorizationManager`, mengaktifkan `@PreAuthorize`/`@PostAuthorize` secara default, dan bisa dikonfigurasi lebih sederhana. `@EnableGlobalMethodSecurity` masih ada di Security 7.1 tetapi deprecated.'],
          ['SBA-04', 'Kapan memakai `@Retryable` bawaan Spring 7 dan kapan Resilience4j?', '`@Retryable` + `@EnableResilientMethods` cukup untuk retry dengan backoff dan pembatasan concurrency tanpa dependency tambahan. Bila butuh circuit breaker, bulkhead, rate limiter, atau metrik resilience yang lengkap, Resilience4j tetap pilihan.'],
          ['SBA-05', 'Mengapa notifikasi transfer memakai `@TransactionalEventListener` dan bukan `@EventListener`?', '`@EventListener` berjalan saat event dipublikasikan, yaitu di tengah transaksi; bila transaksi kemudian rollback, nasabah sudah menerima notifikasi untuk transfer yang tidak terjadi. Dengan fase AFTER_COMMIT, listener hanya berjalan setelah commit berhasil.'],
        ]),
        references(
          ['Spring Boot 4.0 Migration Guide', 'https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide'],
          ['Spring Framework 7: Bean overriding in tests (@MockitoBean)', 'https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-mockitobean.html'],
          ['Spring Framework 7: Resilience features', 'https://docs.spring.io/spring-framework/reference/core/resilience.html'],
          ['Spring Security: Method security', 'https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html'],
          ['Spring Cloud Netflix: maintenance mode', 'https://spring.io/blog/2018/12/12/spring-cloud-greenwich-rc1-available-now'],
        ),
      ],
    },
  },
  {
    after: 'spring-anotasi-boot4',
    module: {
      id: 'spring-anotasi-lab',
      title: 'Lab Anotasi Spring Boot 4.1: Aplikasi Rekening yang Diuji dari Controller sampai Retry',
      summary: 'Satu aplikasi rekening kecil yang memakai anotasi modern secara nyata: properti tervalidasi, security per method, API versioning, transaksi dengan event after-commit, HTTP interface client dengan retry dan cache, @Async di virtual thread, dan @ConcurrencyLimit; 50 test lulus.',
      track: SPRING, ...src, duration: '3 jam', level: 'Hard',
      blocks: [
        paragraph('Cheat sheet hanya berguna bila Anda tahu bagaimana anotasi itu bekerja bersama. Lab ini adalah aplikasi Spring Boot 4.1.2 kecil bertema rekening bank dengan data di H2. Setiap anotasi dipakai untuk masalah nyata dan dibuktikan dengan test. Jalankan dengan JDK 21: `mvn test` di `labs/java-backend/spring-anotasi`.'),
        table(['Bagian', 'Anotasi utama', 'Dibuktikan oleh'], [
          ['Konfigurasi', '`@ConfigurationProperties` (record), `@Validated`, `@DefaultValue`, `@ConditionalOnBooleanProperty`', '`KonfigurasiTest` (ApplicationContextRunner)'],
          ['Web & security', '`@RestController`, API versioning, `@Valid`, `@PreAuthorize`, `@RestControllerAdvice`', '`RekeningControllerTest` (`@WebMvcTest` + `@MockitoBean`)'],
          ['Transaksi', '`@Transactional`, `@Lock`, `@Version`, `@TransactionalEventListener`', '`TransferServiceTest`, `RekeningRepositoryTest`'],
          ['Integrasi', '`@ImportHttpServices`, `@HttpExchange`, `@Retryable`, `@Cacheable`', '`KursServiceTest` (server HTTP palsu)'],
          ['Concurrency', '`@Async` (virtual thread), `@ConcurrencyLimit`, `@Scheduled`', '`LaporanServiceTest`'],
        ]),
        heading('Build dan konfigurasi'),
        code('labs/java-backend/spring-anotasi/pom.xml', `<?xml version="1.0" encoding="UTF-8"?>
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
    <artifactId>spring-anotasi</artifactId>
    <version>1.0.0</version>
    <name>spring-anotasi</name>
    <description>Anotasi Spring Boot 4.1 yang diverifikasi dengan kompilasi dan test</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-restclient</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Boot 4: test starter dipecah per teknologi -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security-test</artifactId>
            <scope>test</scope>
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
</project>`, 'xml'),
        code('src/main/resources/application.properties', `spring.application.name=spring-anotasi

bank.nama=Bank Nusantara
bank.limit-transfer-harian=25000000
bank.timeout-kurs=3s

# HTTP interface client grup "kurs" (@ImportHttpServices)
spring.http.serviceclient.kurs.base-url=https://api.frankfurter.dev
spring.http.serviceclient.kurs.connect-timeout=2s
spring.http.serviceclient.kurs.read-timeout=3s

# Spring 7 API versioning lewat header; tanpa header dianggap versi 1
spring.mvc.apiversion.use.header=X-API-Version
spring.mvc.apiversion.default=1

# Java 21+: executor @Async, Tomcat, dan scheduler memakai virtual thread
spring.threads.virtual.enabled=true

spring.jpa.open-in-view=false`, 'properties'),
        code('AnotasiApplication.java', `package id.playbook.anotasi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Class utama sengaja polos. @Enable* untuk cache, async, scheduling, dan resilience ada di FiturConfig:
 * anotasi di class utama ikut dimuat oleh test slice seperti @WebMvcTest dan membuatnya berat.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class AnotasiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnotasiApplication.class, args);
    }
}`, 'java'),
        code('config/FiturConfig.java', `package id.playbook.anotasi.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Semua @Enable* dikumpulkan di sini, bukan di class utama. */
@Configuration(proxyBeanMethods = false)
@EnableCaching            // @Cacheable, @CachePut, @CacheEvict
@EnableAsync              // @Async
@EnableScheduling         // @Scheduled
@EnableResilientMethods   // Spring 7: @Retryable dan @ConcurrencyLimit tanpa library tambahan
public class FiturConfig {
}`, 'java'),
        code('config/BankProperties.java', `package id.playbook.anotasi.config;

import java.math.BigDecimal;
import java.time.Duration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/**
 * Konfigurasi bertipe: record = immutable, binding lewat konstruktor (tanpa @ConstructorBinding sejak Boot 3).
 * @Validated membuat aplikasi GAGAL START bila nilainya tidak valid, bukan gagal di tengah malam.
 */
@ConfigurationProperties(prefix = "bank")
@Validated
public record BankProperties(
        @NotBlank String nama,
        @NotNull @Positive BigDecimal limitTransferHarian,
        @DefaultValue("3s") Duration timeoutKurs) {
}`, 'java'),
        code('config/SmsConfig.java', `package id.playbook.anotasi.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class SmsConfig {

    /** Bean hanya dibuat bila bank.fitur.notifikasi-sms=true (Boot 3.5+). Tanpa properti = tidak ada bean. */
    @Bean
    @ConditionalOnBooleanProperty("bank.fitur.notifikasi-sms")
    PengirimSms pengirimSms() {
        return nomor -> "SMS terkirim ke " + nomor;
    }

    @FunctionalInterface
    public interface PengirimSms {
        String kirim(String nomor);
    }
}`, 'java'),
        code('config/KonfigurasiTest.java', `package id.playbook.anotasi.config;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

/** ApplicationContextRunner: uji konfigurasi dalam milidetik tanpa menyalakan seluruh aplikasi. */
class KonfigurasiTest {

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(BankProperties.class)
    static class HanyaProperti {
    }

    private final ApplicationContextRunner runner = new ApplicationContextRunner();

    @Test
    void propertiTidakValidMembuatAplikasiGagalStart() {
        runner.withUserConfiguration(HanyaProperti.class)
                .withPropertyValues("bank.nama=", "bank.limit-transfer-harian=-5")
                .run(ctx -> {
                    assertThat(ctx).hasFailed();
                    assertThat(ctx.getStartupFailure()).rootCause().hasMessageContaining("limitTransferHarian");
                });
    }

    @Test
    void defaultValueDipakaiBilaPropertiKosong() {
        runner.withUserConfiguration(HanyaProperti.class)
                .withPropertyValues("bank.nama=Bank Nusantara", "bank.limit-transfer-harian=25000000")
                .run(ctx -> assertThat(ctx.getBean(BankProperties.class).timeoutKurs()).isEqualTo(Duration.ofSeconds(3)));
    }

    @Test
    void conditionalOnBooleanProperty() {
        runner.withUserConfiguration(SmsConfig.class)
                .run(ctx -> assertThat(ctx).doesNotHaveBean(SmsConfig.PengirimSms.class));
        runner.withUserConfiguration(SmsConfig.class)
                .withPropertyValues("bank.fitur.notifikasi-sms=true")
                .run(ctx -> assertThat(ctx.getBean(SmsConfig.PengirimSms.class).kirim("0812")).isEqualTo("SMS terkirim ke 0812"));
    }
}`, 'java'),
        heading('Web, validasi, security, dan API versioning'),
        code('config/SecurityConfig.java', `package id.playbook.anotasi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 6+: bean SecurityFilterChain, bukan "extends WebSecurityConfigurerAdapter" (sudah dihapus).
 * @EnableMethodSecurity menggantikan @EnableGlobalMethodSecurity (deprecated) dan mengaktifkan @PreAuthorize.
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/rekening/**").hasAnyRole("TELLER", "NASABAH")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                // API stateless dengan Basic/Bearer token: CSRF tidak relevan. Aplikasi berbasis cookie session WAJIB menyalakannya.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}`, 'java'),
        code('rekening/RekeningController.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rekening")
public class RekeningController {

    private final TransferService service;

    public RekeningController(TransferService service) {
        this.service = service;
    }

    public record TransferRequest(
            @NotBlank @Size(max = 20) String dari,
            @NotBlank @Size(max = 20) String ke,
            @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal jumlah) {
    }

    public record SaldoV1(String nomor, BigDecimal saldo) {
    }

    public record SaldoV2(String nomor, BigDecimal saldo, String mataUang) {
    }

    /** Spring 7 API versioning: versi dibaca dari header X-API-Version (lihat application.properties). */
    @GetMapping(path = "/{nomor}", version = "1")
    public SaldoV1 saldoV1(@PathVariable String nomor) {
        Rekening r = service.cari(nomor);
        return new SaldoV1(r.getNomor(), r.getSaldo());
    }

    @GetMapping(path = "/{nomor}", version = "2")
    public SaldoV2 saldoV2(@PathVariable String nomor) {
        Rekening r = service.cari(nomor);
        return new SaldoV2(r.getNomor(), r.getSaldo(), "IDR");
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('TELLER')")          // aktif karena @EnableMethodSecurity
    public TransferSelesai transfer(@Valid @RequestBody TransferRequest req) {
        return service.transfer(req.dari(), req.ke(), req.jumlah());
    }
}`, 'java'),
        code('web/PenanganGalat.java', `package id.playbook.anotasi.web;

import id.playbook.anotasi.rekening.RekeningTidakDitemukanException;
import id.playbook.anotasi.rekening.TransferDitolakException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Satu tempat memetakan exception ke respons RFC 9457 (ProblemDetail). */
@RestControllerAdvice
public class PenanganGalat {

    @ExceptionHandler(RekeningTidakDitemukanException.class)
    ProblemDetail tidakDitemukan(RekeningTidakDitemukanException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        pd.setTitle("Rekening tidak ditemukan");
        return pd;
    }

    @ExceptionHandler(TransferDitolakException.class)
    ProblemDetail ditolak(TransferDitolakException e) {
        // Spring 7: UNPROCESSABLE_ENTITY deprecated, namanya mengikuti RFC 9110
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, e.getMessage());
        pd.setTitle("Transfer ditolak");
        return pd;
    }
}`, 'java'),
        code('rekening/RekeningControllerTest.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import id.playbook.anotasi.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;

/** Boot 4: @WebMvcTest pindah paket; @MockBean sudah dihapus, gantinya @MockitoBean (Spring Framework 6.2+). */
@WebMvcTest(RekeningController.class)
@Import(SecurityConfig.class)            // slice tidak memuat @Configuration biasa; aturan keamanan diimpor manual
class RekeningControllerTest {

    @Autowired
    MockMvcTester mvc;                    // gaya AssertJ (Spring 6.2+), pengganti andExpect(...) berantai

    @MockitoBean
    TransferService service;

    private static final String BODY_TRANSFER = """
            {"dari": "1001", "ke": "1002", "jumlah": 150000.00}""";

    @Test
    @WithMockUser(roles = "NASABAH")
    void tanpaHeaderVersiDianggapVersi1() {
        given(service.cari("1001")).willReturn(new Rekening("1001", new BigDecimal("500000.00")));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "1001"))
                .hasStatusOk()
                .bodyText().contains("\\"nomor\\":\\"1001\\"").doesNotContain("mataUang");
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void headerVersi2MemilihHandlerVersi2() {
        given(service.cari("1001")).willReturn(new Rekening("1001", new BigDecimal("500000.00")));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "1001").header("X-API-Version", "2"))
                .hasStatusOk()
                .bodyJson().extractingPath("$.mataUang").isEqualTo("IDR");
    }

    @Test
    void transferTanpaLoginDitolak401() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.UNAUTHORIZED);
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void transferOlehNasabahDitolak403OlehPreAuthorize() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.FORBIDDEN);
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void transferOlehTellerBerhasil201() {
        given(service.transfer(eq("1001"), eq("1002"), any()))
                .willReturn(new TransferSelesai("1001", "1002", new BigDecimal("150000.00")));
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.CREATED)
                .bodyJson().extractingPath("$.ke").isEqualTo("1002");
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void jumlahNegatifDitolakValidasi400() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"dari": "1001", "ke": "1002", "jumlah": -5}"""))
                .hasStatus(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(service);                // @Valid menolak sebelum service dipanggil
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void rekeningTidakAdaMenjadiProblemDetail404() {
        given(service.cari("9999")).willThrow(new RekeningTidakDitemukanException("9999"));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "9999"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasContentType(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson().extractingPath("$.title").isEqualTo("Rekening tidak ditemukan");
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void transferDitolakAturanBisnis422() {
        given(service.transfer(any(), any(), any())).willThrow(new TransferDitolakException("Saldo rekening 1001 tidak cukup"));
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
                .bodyJson().extractingPath("$.detail").isEqualTo("Saldo rekening 1001 tidak cukup");
    }
}`, 'java'),
        callout('info', 'Tiga detail yang ketahuan saat lab ini dibuat', '(1) `@WebMvcTest` tidak memuat class `@Configuration` biasa, sehingga `SecurityConfig` harus di-`@Import`; tanpa itu `@PreAuthorize` tidak aktif dan test 403 justru lulus sebagai 201. (2) Spring 7 men-deprecate `HttpStatus.UNPROCESSABLE_ENTITY`; namanya kini `UNPROCESSABLE_CONTENT` sesuai RFC 9110. (3) `MockMvcTester` (Spring 6.2+) memberi assertion gaya AssertJ dan sudah tersedia otomatis di `@WebMvcTest`.'),
        heading('Transaksi, locking, dan event setelah commit'),
        code('rekening/Rekening.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/** Entity JPA: anotasi jakarta.persistence (bukan javax.persistence sejak Spring Boot 3). */
@Entity
@Table(name = "rekening")
public class Rekening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String nomor;

    @Column(nullable = false, precision = 19, scale = 2)   // uang: DECIMAL, bukan DOUBLE
    private BigDecimal saldo;

    @Version                                                // optimistic locking: update ganda ditolak
    private long versi;

    protected Rekening() {                                  // wajib untuk JPA
    }

    public Rekening(String nomor, BigDecimal saldo) {
        this.nomor = nomor;
        this.saldo = saldo;
    }

    void debit(BigDecimal jumlah) {
        if (saldo.compareTo(jumlah) < 0) {
            throw new TransferDitolakException("Saldo rekening " + nomor + " tidak cukup");
        }
        saldo = saldo.subtract(jumlah);
    }

    void kredit(BigDecimal jumlah) {
        saldo = saldo.add(jumlah);
    }

    public Long getId() {
        return id;
    }

    public String getNomor() {
        return nomor;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public long getVersi() {
        return versi;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}`, 'java'),
        code('rekening/RekeningRepository.java', `package id.playbook.anotasi.rekening;

import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface RekeningRepository extends JpaRepository<Rekening, Long> {

    Optional<Rekening> findByNomor(String nomor);   // query diturunkan dari nama method

    /** SELECT ... FOR UPDATE: transaksi lain yang mengunci baris yang sama menunggu sampai commit. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Rekening r where r.nomor = :nomor")
    Optional<Rekening> kunciUntukUpdate(String nomor);
}`, 'java'),
        code('rekening/TransferService.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

import id.playbook.anotasi.config.BankProperties;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Constructor injection: tanpa @Autowired (satu konstruktor = otomatis), field bisa final. */
@Service
public class TransferService {

    private final RekeningRepository repo;
    private final ApplicationEventPublisher events;
    private final BankProperties bank;

    public TransferService(RekeningRepository repo, ApplicationEventPublisher events, BankProperties bank) {
        this.repo = repo;
        this.events = events;
        this.bank = bank;
    }

    @Transactional
    public TransferSelesai transfer(String dari, String ke, BigDecimal jumlah) {
        if (dari.equals(ke)) {
            throw new TransferDitolakException("Rekening asal dan tujuan sama");
        }
        if (jumlah.compareTo(bank.limitTransferHarian()) > 0) {
            throw new TransferDitolakException("Melebihi limit transfer harian " + bank.limitTransferHarian());
        }
        // Kunci dua baris dengan urutan tetap: dua transfer berlawanan arah tidak akan saling menunggu (deadlock).
        List<String> urut = Stream.of(dari, ke).sorted().toList();
        Rekening pertama = kunci(urut.get(0));
        Rekening kedua = kunci(urut.get(1));
        Rekening asal = pertama.getNomor().equals(dari) ? pertama : kedua;
        Rekening tujuan = asal == pertama ? kedua : pertama;

        asal.debit(jumlah);       // melempar TransferDitolakException bila saldo kurang -> rollback
        tujuan.kredit(jumlah);

        TransferSelesai selesai = new TransferSelesai(dari, ke, jumlah);
        events.publishEvent(selesai);   // diterima listener SETELAH commit, bukan sekarang
        return selesai;
    }

    @Transactional(readOnly = true)
    public Rekening cari(String nomor) {
        return repo.findByNomor(nomor).orElseThrow(() -> new RekeningTidakDitemukanException(nomor));
    }

    private Rekening kunci(String nomor) {
        return repo.kunciUntukUpdate(nomor).orElseThrow(() -> new RekeningTidakDitemukanException(nomor));
    }
}`, 'java'),
        code('rekening/NotifikasiTransfer.java', `package id.playbook.anotasi.rekening;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * AFTER_COMMIT: notifikasi hanya terkirim bila transaksi benar-benar berhasil.
 * Dengan @EventListener biasa, nasabah bisa menerima SMS "transfer berhasil" untuk transaksi yang di-rollback.
 */
@Component
public class NotifikasiTransfer {

    private final List<TransferSelesai> terkirim = new CopyOnWriteArrayList<>();

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void kirim(TransferSelesai event) {
        terkirim.add(event);   // di sistem nyata: push/SMS, sebaiknya lewat outbox agar tidak hilang saat crash
    }

    public List<TransferSelesai> terkirim() {
        return List.copyOf(terkirim);
    }
}`, 'java'),
        code('rekening/package-info.java', `/**
 * Spring 7 memakai JSpecify untuk null-safety: dengan @NullMarked semua tipe di paket ini dianggap non-null
 * kecuali diberi org.jspecify.annotations.Nullable. org.springframework.lang.Nullable kini deprecated.
 */
@NullMarked
package id.playbook.anotasi.rekening;

import org.jspecify.annotations.NullMarked;`, 'java'),
        code('rekening/TransferServiceTest.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sengaja TANPA @Transactional di class test: transaksi test yang di-rollback tidak pernah commit,
 * sehingga @TransactionalEventListener(AFTER_COMMIT) tidak akan pernah terpanggil.
 */
@SpringBootTest(properties = "bank.kurs.cron=-")
class TransferServiceTest {

    @Autowired
    TransferService service;

    @Autowired
    RekeningRepository repo;

    @Autowired
    NotifikasiTransfer notifikasi;

    private String rekeningBaru(String saldo) {
        String nomor = UUID.randomUUID().toString().substring(0, 12);
        repo.save(new Rekening(nomor, new BigDecimal(saldo)));
        return nomor;
    }

    @Test
    void transferBerhasilLaluNotifikasiSetelahCommit() {
        String a = rekeningBaru("1000000.00");
        String b = rekeningBaru("0.00");

        TransferSelesai hasil = service.transfer(a, b, new BigDecimal("250000.00"));

        assertThat(repo.findByNomor(a).orElseThrow().getSaldo()).isEqualByComparingTo("750000");
        assertThat(repo.findByNomor(b).orElseThrow().getSaldo()).isEqualByComparingTo("250000");
        assertThat(notifikasi.terkirim()).contains(hasil);
    }

    @Test
    void saldoKurangDiRollbackDanTidakAdaNotifikasi() {
        String a = rekeningBaru("100000.00");
        String b = rekeningBaru("0.00");

        assertThatThrownBy(() -> service.transfer(a, b, new BigDecimal("150000.00")))
                .isInstanceOf(TransferDitolakException.class);

        assertThat(repo.findByNomor(a).orElseThrow().getSaldo()).isEqualByComparingTo("100000");
        assertThat(repo.findByNomor(b).orElseThrow().getSaldo()).isEqualByComparingTo("0");
        assertThat(notifikasi.terkirim()).noneMatch(e -> e.dari().equals(a));
    }

    @Test
    void melebihiLimitHarianDariPropertiDitolak() {
        String a = rekeningBaru("90000000.00");
        String b = rekeningBaru("0.00");
        assertThatThrownBy(() -> service.transfer(a, b, new BigDecimal("25000000.01")))
                .isInstanceOf(TransferDitolakException.class)
                .hasMessageContaining("limit");
    }
}`, 'java'),
        code('rekening/RekeningRepositoryTest.java', `package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Boot 4: @DataJpaTest di org.springframework.boot.data.jpa.test.autoconfigure (modul spring-boot-data-jpa-test). */
@DataJpaTest
class RekeningRepositoryTest {

    @Autowired
    RekeningRepository repo;

    @Autowired
    TestEntityManager em;

    @Test
    void queryDariNamaMethod() {
        em.persistAndFlush(new Rekening("5001", new BigDecimal("10.00")));
        assertThat(repo.findByNomor("5001")).get().extracting(Rekening::getSaldo).isEqualTo(new BigDecimal("10.00"));
        assertThat(repo.findByNomor("tidak-ada")).isEmpty();
    }

    @Test
    void versionMenolakUpdateDariSalinanBasi() {
        Long id = em.persistFlushFind(new Rekening("5002", new BigDecimal("1000.00"))).getId();
        em.clear();

        Rekening salinanA = repo.findById(id).orElseThrow();
        em.detach(salinanA);
        Rekening salinanB = repo.findById(id).orElseThrow();   // dua "pengguna" membaca versi yang sama
        em.detach(salinanB);

        salinanA.setSaldo(new BigDecimal("900.00"));
        repo.saveAndFlush(salinanA);                           // versi 0 -> 1

        salinanB.setSaldo(new BigDecimal("800.00"));           // masih membawa versi 0
        assertThatThrownBy(() -> repo.saveAndFlush(salinanB))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }
}`, 'java'),
        heading('HTTP interface client, retry, cache, dan job terjadwal'),
        code('kurs/KursApi.java', `package id.playbook.anotasi.kurs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/** HTTP interface client: cukup deklarasi interface, implementasinya dibuat Spring (pengganti Feign untuk kasus umum). */
@HttpExchange("/v1")
public interface KursApi {

    @GetExchange("/latest")
    KursResponse terbaru(@RequestParam String base, @RequestParam String symbols);

    record KursResponse(String base, LocalDate date, Map<String, BigDecimal> rates) {
    }
}`, 'java'),
        code('kurs/KursConfig.java', `package id.playbook.anotasi.kurs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

/**
 * Spring 7: daftarkan HTTP interface sebagai bean dalam grup "kurs".
 * Base URL dan timeout grup diatur lewat properti spring.http.serviceclient.kurs.*
 */
@Configuration(proxyBeanMethods = false)
@ImportHttpServices(group = "kurs", types = KursApi.class)
public class KursConfig {
}`, 'java'),
        code('kurs/KursService.java', `package id.playbook.anotasi.kurs;

import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

@Service
public class KursService {

    static final String SIMBOL = "IDR,EUR,SGD,JPY";

    private final KursApi api;

    public KursService(KursApi api) {
        this.api = api;
    }

    /**
     * Retry hanya untuk gangguan sementara: 5xx dan I/O (timeout, koneksi). 4xx tidak di-retry.
     * Panggilan kedua dengan base yang sama dilayani cache, tidak memanggil API lagi.
     */
    @Cacheable(cacheNames = "kurs", key = "#base")
    @Retryable(includes = {HttpServerErrorException.class, ResourceAccessException.class},
               maxRetries = 2, delay = 100, multiplier = 2)
    public KursApi.KursResponse kursTerbaru(String base) {
        return api.terbaru(base, SIMBOL);
    }

    /** Dipanggil job terjadwal: selalu ambil data baru lalu timpa isi cache. */
    @CachePut(cacheNames = "kurs", key = "#base")
    public KursApi.KursResponse segarkan(String base) {
        return api.terbaru(base, SIMBOL);
    }
}`, 'java'),
        code('kurs/PembaruanKursTerjadwal.java', `package id.playbook.anotasi.kurs;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PembaruanKursTerjadwal {

    private final KursService kurs;

    public PembaruanKursTerjadwal(KursService kurs) {
        this.kurs = kurs;
    }

    /**
     * Hari kerja pukul 17.00 WIB. Zona waktu ditulis eksplisit: server sering berjalan dalam UTC.
     * Nilai cron "-" mematikan job (dipakai di test dan lingkungan yang tidak boleh memanggil API luar).
     */
    @Scheduled(cron = "\${bank.kurs.cron:0 0 17 * * MON-FRI}", zone = "Asia/Jakarta")
    public void segarkanKurs() {
        kurs.segarkan("USD");
    }
}`, 'java'),
        code('kurs/KursServiceTest.java', `package id.playbook.anotasi.kurs;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.HttpClientErrorException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Server HTTP palsu (bawaan JDK) menggantikan API kurs: 503 sekali untuk base USD, 404 untuk base XXX. */
@SpringBootTest(properties = "bank.kurs.cron=-")
class KursServiceTest {

    static final AtomicInteger PANGGILAN_USD = new AtomicInteger();
    static final AtomicInteger PANGGILAN_XXX = new AtomicInteger();
    static final HttpServer SERVER = mulaiServer();

    static HttpServer mulaiServer() {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/v1/latest", ex -> {
                String query = ex.getRequestURI().getQuery();
                int status;
                String body;
                if (query.contains("base=XXX")) {
                    PANGGILAN_XXX.incrementAndGet();
                    status = 404;
                    body = "{\\"message\\":\\"not found\\"}";
                } else if (PANGGILAN_USD.incrementAndGet() == 1) {
                    status = 503;                                   // gangguan sementara pertama
                    body = "{}";
                } else {
                    status = 200;
                    body = "{\\"amount\\":1.0,\\"base\\":\\"USD\\",\\"date\\":\\"2026-11-13\\",\\"rates\\":{\\"IDR\\":18245,\\"EUR\\":0.90481}}";
                }
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().add("Content-Type", "application/json");
                ex.sendResponseHeaders(status, bytes.length);
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(bytes);
                }
            });
            s.start();
            return s;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @DynamicPropertySource
    static void arahkanKeServerPalsu(DynamicPropertyRegistry r) {
        r.add("spring.http.serviceclient.kurs.base-url", () -> "http://127.0.0.1:" + SERVER.getAddress().getPort());
    }

    @AfterAll
    static void hentikan() {
        SERVER.stop(0);
    }

    @Autowired
    KursService kurs;

    @Test
    void retrySaat503LaluHasilnyaDicache() {
        KursApi.KursResponse pertama = kurs.kursTerbaru("USD");

        assertThat(pertama.rates().get("IDR")).isEqualByComparingTo("18245");
        assertThat(pertama.date()).hasToString("2026-11-13");
        assertThat(PANGGILAN_USD.get()).isEqualTo(2);           // 503, lalu retry berhasil

        kurs.kursTerbaru("USD");
        assertThat(PANGGILAN_USD.get()).isEqualTo(2);           // panggilan kedua dari cache
    }

    @Test
    void galat4xxTidakDiRetry() {
        assertThatThrownBy(() -> kurs.kursTerbaru("XXX")).isInstanceOf(HttpClientErrorException.NotFound.class);
        assertThat(PANGGILAN_XXX.get()).isEqualTo(1);
    }
}`, 'java'),
        heading('@Async di virtual thread dan @ConcurrencyLimit'),
        code('laporan/LaporanService.java', `package id.playbook.anotasi.laporan;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.resilience.annotation.ConcurrencyLimit;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class LaporanService {

    private final AtomicInteger sedangBerjalan = new AtomicInteger();
    private final AtomicInteger puncak = new AtomicInteger();

    /**
     * @Async: dijalankan executor aplikasi. Dengan spring.threads.virtual.enabled=true (Java 21+),
     * executor itu memakai virtual thread. Kembalikan CompletableFuture agar pemanggil bisa menunggu/menangani error.
     */
    @Async
    public CompletableFuture<String> buatLaporanBulanan(String rekening) {
        Thread t = Thread.currentThread();
        return CompletableFuture.completedFuture(rekening + " dibuat di " + (t.isVirtual() ? "virtual thread" : t.getName()));
    }

    /**
     * Spring 7: maksimal 3 eksekusi bersamaan; pemanggil ke-4 menunggu (policy BLOCK, default).
     * Berguna saat ribuan virtual thread memanggil sistem hilir yang hanya kuat menerima sedikit beban.
     */
    @ConcurrencyLimit(3)
    public void tarikDataCoreBanking() throws InterruptedException {
        int sekarang = sedangBerjalan.incrementAndGet();
        puncak.accumulateAndGet(sekarang, Math::max);
        try {
            Thread.sleep(50);              // pura-pura memanggil sistem lama yang lambat
        } finally {
            sedangBerjalan.decrementAndGet();
        }
    }

    public int puncakBersamaan() {
        return puncak.get();
    }
}`, 'java'),
        code('laporan/LaporanServiceTest.java', `package id.playbook.anotasi.laporan;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "bank.kurs.cron=-")
class LaporanServiceTest {

    @Autowired
    LaporanService laporan;

    @Test
    void asyncBerjalanDiVirtualThread() throws Exception {
        String hasil = laporan.buatLaporanBulanan("1001").get(5, TimeUnit.SECONDS);
        assertThat(hasil).isEqualTo("1001 dibuat di virtual thread");   // spring.threads.virtual.enabled=true
    }

    @Test
    void concurrencyLimitMembatasiEksekusiBersamaan() throws Exception {
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            threads.add(Thread.ofVirtual().start(() -> {
                try {
                    laporan.tarikDataCoreBanking();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
        }
        for (Thread t : threads) {
            t.join();
        }
        assertThat(laporan.puncakBersamaan()).isBetween(2, 3);   // 20 pemanggil, paling banyak 3 sekaligus
    }
}`, 'java'),
        code('Hasil mvn test (JDK 21.0.2, 18 November 2026)', `Tests run: 28 -- in id.playbook.anotasi.AnotasiBoot4Test
Tests run: 3  -- in id.playbook.anotasi.config.KonfigurasiTest
Tests run: 2  -- in id.playbook.anotasi.kurs.KursServiceTest
Tests run: 2  -- in id.playbook.anotasi.laporan.LaporanServiceTest
Tests run: 8  -- in id.playbook.anotasi.rekening.RekeningControllerTest
Tests run: 2  -- in id.playbook.anotasi.rekening.RekeningRepositoryTest
Tests run: 3  -- in id.playbook.anotasi.rekening.TransferServiceTest
Tests run: 2  -- in id.playbook.anotasi.strategi.RegistriDiskonTest
Tests run: 50, Failures: 0, Errors: 0, Skipped: 0`, 'text'),
        callout('tip', 'Waktu start context pertama', 'Context Spring penuh yang pertama di JVM butuh sekitar 74 detik di laptop lab (inisialisasi Hibernate saja sekitar 20 detik saat JVM masih dingin); context berikutnya 1–6 detik karena class sudah termuat dan context di-cache. Test yang memakai konfigurasi sama (di lab: `properties = "bank.kurs.cron=-"`) berbagi satu context; setiap variasi properti membuat context baru.'),
        ...practice('spring-anotasi-lab', [
          'Jalankan `mvn test` dengan JDK 21 dan pastikan 50 test lulus.',
          'Tambahkan endpoint `GET /api/rekening/{nomor}/mutasi` dengan `@PreAuthorize` yang hanya mengizinkan pemilik rekening (`@AuthenticationPrincipal`).',
          'Ubah `NotifikasiTransfer` menjadi `@Async` dan sesuaikan test agar menunggu dengan benar.',
          'Tambahkan `@Retryable` untuk konflik optimistic lock di sebuah service terpisah dan buktikan dengan dua thread yang memperbarui rekening yang sama.',
          'Ganti H2 dengan PostgreSQL lewat Testcontainers dan `@ServiceConnection`.',
        ]),
        ...quiz([
          ['SBL-01', 'Mengapa `TransferServiceTest` tidak diberi `@Transactional`?', 'Test yang `@Transactional` di-rollback di akhir, sehingga transaksi tidak pernah commit dan `@TransactionalEventListener(AFTER_COMMIT)` tidak pernah dipanggil. Test akan gagal membuktikan notifikasi, atau lebih buruk, membuktikan hal yang salah.'],
          ['SBL-02', 'Mengapa `TransferService` mengunci dua rekening dalam urutan nomor yang tetap?', 'Dua transfer berlawanan arah (A→B dan B→A) yang mengunci dengan urutan berbeda bisa saling menunggu selamanya (deadlock). Dengan urutan tetap, keduanya mengunci rekening yang sama lebih dulu, sehingga yang satu menunggu yang lain selesai.'],
          ['SBL-03', 'Mengapa `KursService` hanya me-retry `HttpServerErrorException` dan `ResourceAccessException`?', 'Keduanya mewakili gangguan sementara (5xx, timeout, koneksi). Error 4xx berarti request kita salah; mengulangnya hanya membuang waktu dan menambah beban. Test `galat4xxTidakDiRetry` membuktikan 404 dipanggil tepat sekali.'],
          ['SBL-04', 'Apa yang dibuktikan `LaporanServiceTest.concurrencyLimitMembatasiEksekusiBersamaan`?', 'Dari 20 virtual thread yang memanggil method bersamaan, paling banyak 3 yang berjalan sekaligus karena `@ConcurrencyLimit(3)`; sisanya menunggu (policy BLOCK). Ini cara melindungi sistem hilir yang lambat saat pemanggilnya virtual thread yang jumlahnya tidak terbatas.'],
        ]),
        references(
          ['Spring Framework 7: HTTP Interface Clients', 'https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#rest-http-interface'],
          ['Spring Framework 7: API Versioning', 'https://docs.spring.io/spring-framework/reference/web/webmvc-versioning.html'],
          ['Spring Boot: Testing', 'https://docs.spring.io/spring-boot/reference/testing/index.html'],
          ['Spring Framework: Transaction-bound events', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html'],
        ),
      ],
    },
  },
];
