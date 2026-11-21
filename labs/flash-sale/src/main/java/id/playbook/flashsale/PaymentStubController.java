package id.playbook.flashsale;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Payment gateway tiruan dengan tombol chaos, agar retry dan circuit breaker bisa diamati. */
@RestController
class PaymentStubController {
    private final AtomicReference<Double> failureRate = new AtomicReference<>(0.0);
    private final Map<String, Map<String, Object>> charges = new ConcurrentHashMap<>();
    private final AtomicLong calls = new AtomicLong();
    private final AtomicLong failures = new AtomicLong();

    @PostMapping("/internal/payments")
    ResponseEntity<Map<String, Object>> charge(@RequestHeader("Idempotency-Key") String key,
                                               @RequestBody Map<String, Object> body) {
        calls.incrementAndGet();
        Map<String, Object> existing = charges.get(key);
        if (existing != null) {
            return ResponseEntity.ok(existing);                          // tagihan yang sama tidak diproses dua kali
        }
        if (ThreadLocalRandom.current().nextDouble() < failureRate.get()) {
            failures.incrementAndGet();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("status", "ERROR"));
        }
        Map<String, Object> result = Map.of("status", "PAID", "orderId", body.get("orderId"));
        charges.put(key, result);
        return ResponseEntity.ok(result);
    }

    /** PUT /internal/payments/chaos?failureRate=1.0 → semua tagihan gagal; 0 → pulih. */
    @PutMapping("/internal/payments/chaos")
    Map<String, Object> chaos(@RequestParam double failureRate) {
        this.failureRate.set(Math.max(0, Math.min(1, failureRate)));
        return stats();
    }

    @GetMapping("/internal/payments/stats")
    Map<String, Object> stats() {
        return Map.of("failureRate", failureRate.get(), "calls", calls.get(), "failures", failures.get(),
                "charged", charges.size());
    }
}
