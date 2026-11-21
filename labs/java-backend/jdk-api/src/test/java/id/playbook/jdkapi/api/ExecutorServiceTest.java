package id.playbook.jdkapi.api;

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
}
