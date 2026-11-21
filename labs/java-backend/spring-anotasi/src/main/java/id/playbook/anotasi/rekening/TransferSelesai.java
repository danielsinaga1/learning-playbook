package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

/** Event domain; juga dipakai sebagai body respons transfer. */
public record TransferSelesai(String dari, String ke, BigDecimal jumlah) {
}
