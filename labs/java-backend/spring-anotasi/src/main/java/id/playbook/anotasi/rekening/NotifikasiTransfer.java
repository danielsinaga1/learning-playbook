package id.playbook.anotasi.rekening;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * AFTER_COMMIT: notifikasi hanya terkirim bila transaksi benar-benar berhasil.
 * Dengan @EventListener biasa, nasabah bisa menerima SMS "transfer berhasil" untuk transaksi yang di-rollback.
 */
@Component
public class NotifikasiTransfer {

    private final List<TransferSelesai> terkirim = new CopyOnWriteArrayList<>();

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void kirim(TransferSelesai event) {
        terkirim.add(event);   // di sistem nyata: push/SMS, sebaiknya lewat outbox agar tidak hilang saat crash
    }

    public List<TransferSelesai> terkirim() {
        return List.copyOf(terkirim);
    }
}
