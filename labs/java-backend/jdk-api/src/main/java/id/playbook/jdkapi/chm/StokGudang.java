package id.playbook.jdkapi.chm;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Stok per SKU yang dibaca dan diubah banyak thread sekaligus (contoh "real-time" di infografik).
 * Aturannya: cek dan ubah harus terjadi di dalam SATU operasi atomik per key (merge/compute).
 */
public final class StokGudang {

    private final ConcurrentHashMap<String, Integer> stok = new ConcurrentHashMap<>();

    public void tambah(String sku, int jumlah) {
        stok.merge(sku, jumlah, Integer::sum);          // inisialisasi ATAU tambah, atomik
    }

    /** Benar: syarat "stok cukup" diperiksa di dalam computeIfPresent, saat bin key ini terkunci. */
    public boolean ambil(String sku, int jumlah) {
        boolean[] berhasil = {false};                   // penampung hasil; lambda berjalan di thread pemanggil
        stok.computeIfPresent(sku, (k, sisa) -> {
            if (sisa < jumlah) {
                return sisa;                            // tidak cukup: nilai tidak berubah
            }
            berhasil[0] = true;
            return sisa - jumlah;
        });
        return berhasil[0];
    }

    /** SALAH: get lalu put. Setiap operasi atomik, tetapi gabungannya tidak. Dua thread bisa membaca sisa yang sama. */
    public boolean ambilTidakAtomik(String sku, int jumlah) {
        Integer sisa = stok.get(sku);
        if (sisa == null || sisa < jumlah) {
            return false;
        }
        Thread.yield();                                 // mensimulasikan kerja di antara cek dan update (validasi, log, hitung harga)
        stok.put(sku, sisa - jumlah);
        return true;
    }

    public int sisa(String sku) {
        return stok.getOrDefault(sku, 0);
    }
}
