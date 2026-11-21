package id.playbook.flashsale;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class OrderRepository {
    public record Reservation(String status, long amountIdr) {}

    private final JdbcClient jdbc;

    OrderRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Satu transaksi: tandai pesan, kurangi stok secara atomik, catat pesanan.
     * Kosong = pesan ini sudah pernah diproses (duplikat dari at-least-once delivery).
     */
    @Transactional
    public Optional<Reservation> reserve(OrderMessage m) {
        int first = jdbc.sql("INSERT INTO processed_messages (message_id) VALUES (:id) ON CONFLICT DO NOTHING")
                .param("id", m.orderId()).update();
        if (first == 0) {
            return Optional.empty();
        }
        // Stok tidak pernah minus: hanya berhasil bila stok >= qty, dan harga ikut dibaca dari primary
        Optional<Long> price = jdbc.sql("""
                UPDATE products SET stock = stock - :qty
                WHERE id = :id AND stock >= :qty
                RETURNING price_idr
                """).param("qty", m.qty()).param("id", m.productId()).query(Long.class).optional();
        String status = price.isPresent() ? "PENDING_PAYMENT" : "REJECTED_OUT_OF_STOCK";
        long amount = price.orElse(0L) * m.qty();
        jdbc.sql("""
                INSERT INTO orders (id, user_id, product_id, qty, amount_idr, status)
                VALUES (:id, :user, :product, :qty, :amount, :status)
                """).param("id", m.orderId()).param("user", m.userId()).param("product", m.productId())
                .param("qty", m.qty()).param("amount", amount).param("status", status).update();
        return Optional.of(new Reservation(status, amount));
    }

    @Transactional
    public void updateStatus(String orderId, String status) {
        jdbc.sql("UPDATE orders SET status = :status WHERE id = :id").param("status", status).param("id", orderId).update();
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> find(String orderId) {
        return jdbc.sql("SELECT id, user_id, product_id, qty, amount_idr, status, created_at FROM orders WHERE id = :id")
                .param("id", orderId).query().listOfRows().stream().findFirst();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> recentByUser(String userId) {
        return jdbc.sql("""
                SELECT id, product_id, qty, status, created_at FROM orders
                WHERE user_id = :user ORDER BY created_at DESC LIMIT 20
                """).param("user", userId).query().listOfRows();
    }
}
