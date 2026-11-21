package id.playbook.jdkapi.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import id.playbook.jdkapi.api.RingkasanMutasi.Mutasi;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StreamTest {

    @Test
    void toListTidakBisaDiubahSedangkanCollectorsToListBisa() {
        List<String> modern = Stream.of("a", "b").toList();                       // Java 16+
        assertThatThrownBy(() -> modern.add("c")).isInstanceOf(UnsupportedOperationException.class);

        List<String> lama = Stream.of("a", "b").collect(Collectors.toList());    // mutable (tipe tidak dijamin spesifikasi)
        lama.add("c");
        assertThat(lama).containsExactly("a", "b", "c");
    }

    @Test
    void streamHanyaBisaDipakaiSekali() {
        Stream<String> s = Stream.of("a");
        s.count();
        assertThatThrownBy(s::count).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void streamMalasDanBerhentiLebihAwal() {
        AtomicInteger diproses = new AtomicInteger();
        int pertama = IntStream.rangeClosed(1, 1_000_000)
                .peek(i -> diproses.incrementAndGet())
                .filter(i -> i % 7 == 0)
                .findFirst()
                .orElseThrow();
        assertThat(pertama).isEqualTo(7);
        assertThat(diproses).hasValue(7);                                     // bukan satu juta
    }

    @Test
    void summingDoubleUntukUangTetapSalahBigDecimalBenar() {
        double loop = 0;
        for (int i = 0; i < 10; i++) {
            loop += 0.1;
        }
        assertThat(loop).isEqualTo(0.9999999999999999);
        // summingDouble memakai compensated (Kahan) summation, jadi 10 x 0.1 kebetulan tepat 1.0 ...
        assertThat(Stream.of(0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1).collect(Collectors.summingDouble(x -> x)))
                .isEqualTo(1.0);
        // ... tetapi nilai input yang memang tidak bisa direpresentasikan biner tetap menghasilkan angka salah
        assertThat(Stream.of(1.10, 2.20).collect(Collectors.summingDouble(x -> x))).isEqualTo(3.3000000000000003);

        List<Mutasi> mutasi = List.of(
                new Mutasi("biaya-admin", new BigDecimal("1.10"), true),
                new Mutasi("biaya-admin", new BigDecimal("2.20"), true));
        assertThat(RingkasanMutasi.pengeluaranPerKategori(mutasi).get("biaya-admin")).isEqualByComparingTo("3.30");
    }

    @Test
    void groupingByDenganBigDecimal() {
        List<Mutasi> mutasi = List.of(
                new Mutasi("makan", new BigDecimal("45000"), true),
                new Mutasi("transport", new BigDecimal("120000"), true),
                new Mutasi("makan", new BigDecimal("60000"), true),
                new Mutasi("gaji", new BigDecimal("9000000"), false));
        assertThat(RingkasanMutasi.pengeluaranPerKategori(mutasi))
                .containsExactly(
                        org.assertj.core.api.Assertions.entry("makan", new BigDecimal("105000")),
                        org.assertj.core.api.Assertions.entry("transport", new BigDecimal("120000")));
        assertThat(RingkasanMutasi.kategoriBoros(mutasi, new BigDecimal("110000"))).containsExactly("transport");
    }
}
