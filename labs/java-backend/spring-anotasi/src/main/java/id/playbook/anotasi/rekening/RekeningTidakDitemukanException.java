package id.playbook.anotasi.rekening;

/** Dipetakan ke HTTP 404 oleh PenanganGalat. */
public class RekeningTidakDitemukanException extends RuntimeException {

    public RekeningTidakDitemukanException(String nomor) {
        super("Rekening " + nomor + " tidak ditemukan");
    }
}
