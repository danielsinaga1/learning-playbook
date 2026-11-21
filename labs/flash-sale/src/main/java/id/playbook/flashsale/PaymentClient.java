package id.playbook.flashsale;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Baris 8 (retry + backoff) dan Baris 10 (circuit breaker) di depan layanan pembayaran. */
@Component
public class PaymentClient {
    public record Result(String status) {}

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);
    private final RestClient restClient;

    PaymentClient(RestClient.Builder builder, @Value("${app.payment.base-url}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    // Urutan aspek: Retry( CircuitBreaker( charge ) ). Fallback dipasang di aspek TERLUAR (@Retry):
    // fallback di @CircuitBreaker akan menelan exception sebelum Retry sempat mengulang.
    @Retry(name = "payment", fallbackMethod = "markPending")
    @CircuitBreaker(name = "payment")
    public Result charge(String orderId, long amountIdr) {
        return restClient.post().uri("/internal/payments")
                .header("Idempotency-Key", orderId)            // Baris 11: retry aman, gateway tidak menagih dua kali
                .body(Map.of("orderId", orderId, "amountIdr", amountIdr))
                .retrieve()
                .body(Result.class);
    }

    Result markPending(String orderId, long amountIdr, Throwable cause) {
        log.warn("pembayaran {} ditunda: {}", orderId, cause.toString());
        return new Result("PENDING_PAYMENT");                  // diproses ulang nanti, bukan error ke user
    }
}
