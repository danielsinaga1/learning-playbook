package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;

/**
 * Kontrak strategy hanya berisi apa yang SEMUA strategi butuhkan: harga masuk, diskon keluar.
 * Parameter khusus (persen, batas, siapa yang menyetujui) adalah konfigurasi strategi, masuk lewat konstruktor.
 */
public interface StrategiDiskon {

    String kode();

    Diskon hitung(BigDecimal harga);
}
