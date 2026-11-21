package id.playbook.anotasi.kurs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/** HTTP interface client: cukup deklarasi interface, implementasinya dibuat Spring (pengganti Feign untuk kasus umum). */
@HttpExchange("/v1")
public interface KursApi {

    @GetExchange("/latest")
    KursResponse terbaru(@RequestParam String base, @RequestParam String symbols);

    record KursResponse(String base, LocalDate date, Map<String, BigDecimal> rates) {
    }
}
