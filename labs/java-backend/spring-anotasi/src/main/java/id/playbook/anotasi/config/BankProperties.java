package id.playbook.anotasi.config;

import java.math.BigDecimal;
import java.time.Duration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/**
 * Konfigurasi bertipe: record = immutable, binding lewat konstruktor (tanpa @ConstructorBinding sejak Boot 3).
 * @Validated membuat aplikasi GAGAL START bila nilainya tidak valid, bukan gagal di tengah malam.
 */
@ConfigurationProperties(prefix = "bank")
@Validated
public record BankProperties(
        @NotBlank String nama,
        @NotNull @Positive BigDecimal limitTransferHarian,
        @DefaultValue("3s") Duration timeoutKurs) {
}
