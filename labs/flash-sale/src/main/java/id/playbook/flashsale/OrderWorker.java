package id.playbook.flashsale;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/** Baris 2: worker menguras antrean dengan laju yang sanggup ditangani DB. */
@Component
class OrderWorker {
    private static final Logger log = LoggerFactory.getLogger(OrderWorker.class);

    private final OrderRepository orders;
    private final ProductService products;
    private final PaymentClient payment;

    OrderWorker(OrderRepository orders, ProductService products, PaymentClient payment) {
        this.orders = orders;
        this.products = products;
        this.payment = payment;
    }

    @RabbitListener(queues = MessagingConfig.ORDERS_QUEUE, concurrency = "2-4")
    void handle(OrderMessage m) {
        Optional<OrderRepository.Reservation> reservation = orders.reserve(m);   // transaksi DB selesai di sini
        if (reservation.isEmpty()) {
            log.info("pesan {} sudah pernah diproses, dilewati", m.orderId());
            return;
        }
        if (!"PENDING_PAYMENT".equals(reservation.get().status())) {
            log.info("order {} ditolak: stok habis", m.orderId());
            return;
        }
        products.evict(m.productId());   // Baris 1: stok berubah → hapus cache
        // Panggilan jaringan di LUAR transaksi DB, agar koneksi tidak tertahan selama retry
        PaymentClient.Result result = payment.charge(m.orderId(), reservation.get().amountIdr());
        orders.updateStatus(m.orderId(), result.status());
        log.info("order {} → {}", m.orderId(), result.status());
    }
}
