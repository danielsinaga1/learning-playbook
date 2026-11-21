package id.playbook.anotasi.web;

import id.playbook.anotasi.rekening.RekeningTidakDitemukanException;
import id.playbook.anotasi.rekening.TransferDitolakException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Satu tempat memetakan exception ke respons RFC 9457 (ProblemDetail). */
@RestControllerAdvice
public class PenanganGalat {

    @ExceptionHandler(RekeningTidakDitemukanException.class)
    ProblemDetail tidakDitemukan(RekeningTidakDitemukanException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        pd.setTitle("Rekening tidak ditemukan");
        return pd;
    }

    @ExceptionHandler(TransferDitolakException.class)
    ProblemDetail ditolak(TransferDitolakException e) {
        // Spring 7: UNPROCESSABLE_ENTITY deprecated, namanya mengikuti RFC 9110
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, e.getMessage());
        pd.setTitle("Transfer ditolak");
        return pd;
    }
}
