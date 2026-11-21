package id.playbook.jdkapi.chm;

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
}
