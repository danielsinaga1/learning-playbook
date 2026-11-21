package id.playbook.jdkapi.strategi;

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
}
