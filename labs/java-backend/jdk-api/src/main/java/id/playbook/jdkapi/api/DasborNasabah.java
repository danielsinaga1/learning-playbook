package id.playbook.jdkapi.api;

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
}
