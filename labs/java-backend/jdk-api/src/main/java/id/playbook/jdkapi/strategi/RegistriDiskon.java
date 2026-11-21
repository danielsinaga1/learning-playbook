package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Pemilihan strategy saat RUNTIME berdasarkan kode (dari request, konfigurasi, atau database promo).
 * Klien tidak pernah menulis "new DiskonX()" sendiri; menambah promo tidak mengubah kode klien.
 */
public final class RegistriDiskon {

    private final Map<String, StrategiDiskon> perKode;

    public RegistriDiskon(Collection<? extends StrategiDiskon> semua) {
        // toUnmodifiableMap gagal dengan IllegalStateException bila ada kode ganda: ketahuan saat start
        this.perKode = semua.stream().collect(Collectors.toUnmodifiableMap(StrategiDiskon::kode, Function.identity()));
    }

    public Optional<StrategiDiskon> cari(String kode) {
        return Optional.ofNullable(perKode.get(kode));
    }

    /** Kode kosong = tanpa diskon; kode yang tidak dikenal = ditolak (jangan diam-diam diberi harga normal). */
    public Diskon hitung(String kode, BigDecimal harga) {
        if (kode == null || kode.isBlank()) {
            return Diskon.TIDAK_ADA;
        }
        return cari(kode)
                .orElseThrow(() -> new IllegalArgumentException("Kode promo tidak dikenal: " + kode))
                .hitung(harga);
    }
}
