package id.playbook.jdkapi.api;

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
}
