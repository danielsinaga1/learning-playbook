package id.playbook.anotasi.laporan;

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
}
