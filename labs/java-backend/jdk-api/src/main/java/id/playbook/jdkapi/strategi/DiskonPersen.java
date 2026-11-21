package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;

/** Diskon persen dengan batas maksimal opsional, mis. "20% maks Rp50.000". Record = immutable, aman dibagi antar thread. */
public record DiskonPersen(String kode, BigDecimal persen, BigDecimal maksimal) implements StrategiDiskon {

    public DiskonPersen {
        if (persen.signum() <= 0 || persen.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Persen harus di antara 0 dan 100: " + persen);
        }
    }

    public static DiskonPersen tanpaBatas(String kode, String persen) {
        return new DiskonPersen(kode, new BigDecimal(persen), null);
    }

    public static DiskonPersen denganBatas(String kode, String persen, String maksimal) {
        return new DiskonPersen(kode, new BigDecimal(persen), new BigDecimal(maksimal));
    }

    @Override
    public Diskon hitung(BigDecimal harga) {
        BigDecimal potongan = Diskon.persen(harga, persen);
        if (maksimal != null && potongan.compareTo(maksimal) > 0) {
            return new Diskon(maksimal, persen.toPlainString() + "% dibatasi maksimal " + maksimal.toPlainString());
        }
        return new Diskon(potongan, persen.toPlainString() + "%");
    }
}
