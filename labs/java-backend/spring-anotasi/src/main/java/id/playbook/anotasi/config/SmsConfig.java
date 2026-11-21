package id.playbook.anotasi.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class SmsConfig {

    /** Bean hanya dibuat bila bank.fitur.notifikasi-sms=true (Boot 3.5+). Tanpa properti = tidak ada bean. */
    @Bean
    @ConditionalOnBooleanProperty("bank.fitur.notifikasi-sms")
    PengirimSms pengirimSms() {
        return nomor -> "SMS terkirim ke " + nomor;
    }

    @FunctionalInterface
    public interface PengirimSms {
        String kirim(String nomor);
    }
}
