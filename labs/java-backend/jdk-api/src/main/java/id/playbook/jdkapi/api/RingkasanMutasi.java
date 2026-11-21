package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/** Stream untuk agregasi uang: BigDecimal dijumlah dengan reducing, BUKAN summingDouble. */
public final class RingkasanMutasi {

    public record Mutasi(String kategori, BigDecimal jumlah, boolean debit) {
    }

    /** Total pengeluaran per kategori, urut nama kategori. */
    public static Map<String, BigDecimal> pengeluaranPerKategori(List<Mutasi> mutasi) {
        return mutasi.stream()
                .filter(Mutasi::debit)
                .collect(Collectors.groupingBy(
                        Mutasi::kategori,
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Mutasi::jumlah, BigDecimal::add)));
    }

    /** Kategori dengan pengeluaran di atas batas; .toList() (Java 16+) menghasilkan list yang tidak bisa diubah. */
    public static List<String> kategoriBoros(List<Mutasi> mutasi, BigDecimal batas) {
        return pengeluaranPerKategori(mutasi).entrySet().stream()
                .filter(e -> e.getValue().compareTo(batas) > 0)
                .map(Map.Entry::getKey)
                .toList();
    }

    private RingkasanMutasi() {
    }
}
