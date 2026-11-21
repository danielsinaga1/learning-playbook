package id.playbook.jdkapi.strategi;

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
}
