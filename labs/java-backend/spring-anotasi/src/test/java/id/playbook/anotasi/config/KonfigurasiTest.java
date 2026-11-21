package id.playbook.anotasi.config;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

/** ApplicationContextRunner: uji konfigurasi dalam milidetik tanpa menyalakan seluruh aplikasi. */
class KonfigurasiTest {

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(BankProperties.class)
    static class HanyaProperti {
    }

    private final ApplicationContextRunner runner = new ApplicationContextRunner();

    @Test
    void propertiTidakValidMembuatAplikasiGagalStart() {
        runner.withUserConfiguration(HanyaProperti.class)
                .withPropertyValues("bank.nama=", "bank.limit-transfer-harian=-5")
                .run(ctx -> {
                    assertThat(ctx).hasFailed();
                    assertThat(ctx.getStartupFailure()).rootCause().hasMessageContaining("limitTransferHarian");
                });
    }

    @Test
    void defaultValueDipakaiBilaPropertiKosong() {
        runner.withUserConfiguration(HanyaProperti.class)
                .withPropertyValues("bank.nama=Bank Nusantara", "bank.limit-transfer-harian=25000000")
                .run(ctx -> assertThat(ctx.getBean(BankProperties.class).timeoutKurs()).isEqualTo(Duration.ofSeconds(3)));
    }

    @Test
    void conditionalOnBooleanProperty() {
        runner.withUserConfiguration(SmsConfig.class)
                .run(ctx -> assertThat(ctx).doesNotHaveBean(SmsConfig.PengirimSms.class));
        runner.withUserConfiguration(SmsConfig.class)
                .withPropertyValues("bank.fitur.notifikasi-sms=true")
                .run(ctx -> assertThat(ctx.getBean(SmsConfig.PengirimSms.class).kirim("0812")).isEqualTo("SMS terkirim ke 0812"));
    }
}
