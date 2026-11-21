package id.playbook.jdkapi.strategi;

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
}
