package id.playbook.anotasi.strategi;

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
}
