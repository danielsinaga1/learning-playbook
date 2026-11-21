package id.playbook.anotasi.strategi;

import java.math.BigDecimal;

/** Strategy: setiap promo adalah satu bean. Menambah promo = menambah class, tanpa mengubah kode pemakai. */
public interface StrategiDiskon {

    /** Kunci yang dipakai klien/konfigurasi, mis. "PROMO10". Lebih stabil daripada nama bean. */
    String kode();

    /** Potongan dalam rupiah (bukan harga akhir), dibulatkan ke rupiah penuh. */
    BigDecimal potongan(BigDecimal harga);
}
