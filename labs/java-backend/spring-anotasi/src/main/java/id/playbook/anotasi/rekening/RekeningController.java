package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rekening")
public class RekeningController {

    private final TransferService service;

    public RekeningController(TransferService service) {
        this.service = service;
    }

    public record TransferRequest(
            @NotBlank @Size(max = 20) String dari,
            @NotBlank @Size(max = 20) String ke,
            @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal jumlah) {
    }

    public record SaldoV1(String nomor, BigDecimal saldo) {
    }

    public record SaldoV2(String nomor, BigDecimal saldo, String mataUang) {
    }

    /** Spring 7 API versioning: versi dibaca dari header X-API-Version (lihat application.properties). */
    @GetMapping(path = "/{nomor}", version = "1")
    public SaldoV1 saldoV1(@PathVariable String nomor) {
        Rekening r = service.cari(nomor);
        return new SaldoV1(r.getNomor(), r.getSaldo());
    }

    @GetMapping(path = "/{nomor}", version = "2")
    public SaldoV2 saldoV2(@PathVariable String nomor) {
        Rekening r = service.cari(nomor);
        return new SaldoV2(r.getNomor(), r.getSaldo(), "IDR");
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('TELLER')")          // aktif karena @EnableMethodSecurity
    public TransferSelesai transfer(@Valid @RequestBody TransferRequest req) {
        return service.transfer(req.dari(), req.ke(), req.jumlah());
    }
}
