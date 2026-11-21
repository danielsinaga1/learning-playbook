package id.playbook.jdkapi.chm;

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
}
