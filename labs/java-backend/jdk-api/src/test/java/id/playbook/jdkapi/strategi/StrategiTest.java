package id.playbook.jdkapi.strategi;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.function.UnaryOperator;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StrategiTest {

    @Test
    void doubleUntukUangMenghasilkanAngkaYangSalah() {
        // Bentuk yang sering beredar: amount * (1 - percentage / 100.0)
        assertThat(19_999.0 * (1 - 15 / 100.0)).isEqualTo(16999.149999999998);
        assertThat(Math.round(10.45 * (1 - 10 / 100.0) * 100) / 100.0).isEqualTo(9.40);   // seharusnya 9.41
        assertThat(new BigDecimal("10.45").multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP))
                .isEqualByComparingTo("9.41");
    }

    @Test
    void persenDenganBatasMaksimal() {
        StrategiDiskon hemat = DiskonPersen.denganBatas("HEMAT20", "20", "50000");
        assertThat(hemat.hitung(new BigDecimal("100000")).potongan()).isEqualByComparingTo("20000");
        Diskon besar = hemat.hitung(new BigDecimal("1000000"));
        assertThat(besar.potongan()).isEqualByComparingTo("50000");
        assertThat(besar.keterangan()).isEqualTo("20% dibatasi maksimal 50000");
        assertThat(besar.hargaAkhir(new BigDecimal("1000000"))).isEqualByComparingTo("950000");
    }

    @Test
    void persenDibulatkanKeRupiahPenuh() {
        Diskon d = DiskonPersen.tanpaBatas("PROMO15", "15").hitung(new BigDecimal("19999"));
        assertThat(d.potongan()).isEqualByComparingTo("3000");          // 2999.85 -> 3000
        assertThat(d.hargaAkhir(new BigDecimal("19999"))).isEqualByComparingTo("16999");
    }

    @Test
    void diskonManajerDiAtasBatasWajibPersetujuan() {
        BigDecimal batas = new BigDecimal("50");
        StrategiDiskon tanpaPenyetuju = new DiskonManajer("MGR", new BigDecimal("60"), batas, null);
        assertThatThrownBy(() -> tanpaPenyetuju.hitung(new BigDecimal("1000")))
                .isInstanceOf(DiskonManajer.PersetujuanDiperlukanException.class)
                .hasMessage("Diskon 60% melebihi batas 50%");

        Diskon disetujui = new DiskonManajer("MGR", new BigDecimal("60"), batas, "kepala-cabang-007")
                .hitung(new BigDecimal("1000"));
        assertThat(disetujui.potongan()).isEqualByComparingTo("600");
        assertThat(disetujui.keterangan()).contains("disetujui kepala-cabang-007");

        assertThat(new DiskonManajer("MGR", new BigDecimal("10"), batas, null).hitung(new BigDecimal("1000")).potongan())
                .isEqualByComparingTo("100");
    }

    @Test
    void registriMemilihStrategiSaatRuntime() {
        var registri = new RegistriDiskon(List.of(
                DiskonPersen.tanpaBatas("PROMO10", "10"),
                DiskonPersen.denganBatas("HEMAT20", "20", "50000")));

        assertThat(registri.hitung("PROMO10", new BigDecimal("1000")).potongan()).isEqualByComparingTo("100");
        assertThat(registri.hitung("", new BigDecimal("1000"))).isEqualTo(Diskon.TIDAK_ADA);
        assertThatThrownBy(() -> registri.hitung("GRATIS", BigDecimal.TEN)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void kodeGandaGagalSaatStart() {
        assertThatThrownBy(() -> new RegistriDiskon(List.of(
                DiskonPersen.tanpaBatas("PROMO10", "10"),
                DiskonPersen.tanpaBatas("PROMO10", "15"))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PROMO10");
    }

    @Test
    void enumStrategyMetodeBunga() {
        BigDecimal pokok = new BigDecimal("12000000");
        BigDecimal bunga = new BigDecimal("12");                       // 12% per tahun, tenor 12 bulan
        assertThat(MetodeBunga.FLAT.totalBunga(pokok, bunga, 12)).isEqualByComparingTo("1440000");
        assertThat(MetodeBunga.MENURUN.totalBunga(pokok, bunga, 12)).isEqualByComparingTo("780000");
        assertThat(MetodeBunga.valueOf("MENURUN")).isSameAs(MetodeBunga.MENURUN);   // pilih dari string konfigurasi
    }

    @Test
    void strategiSederhanaCukupLambda() {
        // Bila strategi hanya satu fungsi tanpa konfigurasi/audit, interface fungsional + lambda sudah cukup.
        Map<String, UnaryOperator<BigDecimal>> pembulatan = Map.of(
                "RUPIAH", x -> x.setScale(0, RoundingMode.HALF_UP),
                "RIBUAN", x -> x.divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(1000)));
        assertThat(pembulatan.get("RIBUAN").apply(new BigDecimal("16999.15"))).isEqualByComparingTo("17000");
        assertThat(pembulatan.get("RUPIAH").apply(new BigDecimal("16999.15"))).isEqualByComparingTo("16999");
    }
}
