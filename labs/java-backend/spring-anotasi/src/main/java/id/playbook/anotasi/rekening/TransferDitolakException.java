package id.playbook.anotasi.rekening;

/** Aturan bisnis menolak transfer (saldo kurang, limit terlampaui). Dipetakan ke HTTP 422. */
public class TransferDitolakException extends RuntimeException {

    public TransferDitolakException(String pesan) {
        super(pesan);
    }
}
