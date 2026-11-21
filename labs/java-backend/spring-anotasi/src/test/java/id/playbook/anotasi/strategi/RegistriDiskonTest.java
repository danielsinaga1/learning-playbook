package id.playbook.anotasi.strategi;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RegistriDiskonTest {

    @Test
    void springMenyuntikkanSemuaStrategiKeRegistri() {
        try (var ctx = new AnnotationConfigApplicationContext(RegistriDiskon.class.getPackageName())) {
            RegistriDiskon registri = ctx.getBean(RegistriDiskon.class);

            assertThat(registri.kodeTersedia()).containsExactlyInAnyOrder("PROMO10", "HEMAT20", "TANPA");
            assertThat(registri.hargaAkhir("PROMO10", new BigDecimal("199999"))).isEqualByComparingTo("179999");
            assertThat(registri.hargaAkhir("HEMAT20", new BigDecimal("1000000"))).isEqualByComparingTo("950000");  // maks 50 ribu
            assertThat(registri.hargaAkhir("HEMAT20", new BigDecimal("100000"))).isEqualByComparingTo("80000");
            assertThatThrownBy(() -> registri.hargaAkhir("GRATIS", BigDecimal.TEN)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void kodeGandaKetahuanSaatStartup() {
        StrategiDiskon a = new Promo.Diskon10Persen();
        StrategiDiskon b = new Promo.Diskon10Persen();
        assertThatThrownBy(() -> new RegistriDiskon(List.of(a, b)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PROMO10");
    }
}
