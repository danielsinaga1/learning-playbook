package id.playbook.flashsale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
class OrderController {
    record CreateOrder(@Min(1) long productId, @Min(1) @Max(5) int qty) {}

    private final IdempotencyService idempotency;
    private final OrderRepository orders;
    private final RabbitTemplate rabbit;

    OrderController(IdempotencyService idempotency, OrderRepository orders, RabbitTemplate rabbit) {
        this.idempotency = idempotency;
        this.orders = orders;
        this.rabbit = rabbit;
    }

    /** Baris 2: terima cepat (202) lalu antre. Baris 11: Idempotency-Key per user. */
    @PostMapping(value = "/orders", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> create(@RequestHeader("X-User-Id") String userId,   // lab: di produksi diambil dari token
                                  @RequestHeader("Idempotency-Key") String key,
                                  @Valid @RequestBody CreateOrder body) {
        String hash = sha256(userId + "|" + body.productId() + "|" + body.qty());
        Optional<IdempotencyService.Stored> existing = idempotency.claim(userId, key, hash);
        if (existing.isPresent()) {
            IdempotencyService.Stored stored = existing.get();
            if (!stored.requestHash().equals(hash)) {
                return json(HttpStatus.UNPROCESSABLE_CONTENT, "{\"error\":\"Idempotency-Key dipakai untuk request yang berbeda\"}");
            }
            if (!"completed".equals(stored.status())) {
                return json(HttpStatus.CONFLICT, "{\"error\":\"request yang sama masih diproses\"}");
            }
            return json(HttpStatus.valueOf(stored.responseCode()), stored.responseBody());   // replay byte-identik
        }
        try {
            String orderId = UUID.randomUUID().toString();
            rabbit.convertAndSend(MessagingConfig.ORDERS_QUEUE,
                    new OrderMessage(orderId, userId, body.productId(), body.qty()));
            String response = "{\"orderId\":\"" + orderId + "\",\"status\":\"QUEUED\"}";
            idempotency.complete(userId, key, HttpStatus.ACCEPTED.value(), response);
            return json(HttpStatus.ACCEPTED, response);
        } catch (RuntimeException e) {
            idempotency.release(userId, key);
            throw e;
        }
    }

    /** Dibaca dari replica: tepat setelah 202 pesanan bisa belum terlihat (antrean + replication lag). */
    @GetMapping("/orders/{id}")
    ResponseEntity<Map<String, Object>> get(@PathVariable String id) {
        return orders.find(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Baris 6: "pesanan saya" dilayani index (user_id, created_at DESC). */
    @GetMapping("/users/{userId}/orders")
    List<Map<String, Object>> byUser(@PathVariable String userId) {
        return orders.recentByUser(userId);
    }

    private static ResponseEntity<String> json(HttpStatus status, String body) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
