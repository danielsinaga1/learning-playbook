package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/** Entity JPA: anotasi jakarta.persistence (bukan javax.persistence sejak Spring Boot 3). */
@Entity
@Table(name = "rekening")
public class Rekening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String nomor;

    @Column(nullable = false, precision = 19, scale = 2)   // uang: DECIMAL, bukan DOUBLE
    private BigDecimal saldo;

    @Version                                                // optimistic locking: update ganda ditolak
    private long versi;

    protected Rekening() {                                  // wajib untuk JPA
    }

    public Rekening(String nomor, BigDecimal saldo) {
        this.nomor = nomor;
        this.saldo = saldo;
    }

    void debit(BigDecimal jumlah) {
        if (saldo.compareTo(jumlah) < 0) {
            throw new TransferDitolakException("Saldo rekening " + nomor + " tidak cukup");
        }
        saldo = saldo.subtract(jumlah);
    }

    void kredit(BigDecimal jumlah) {
        saldo = saldo.add(jumlah);
    }

    public Long getId() {
        return id;
    }

    public String getNomor() {
        return nomor;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public long getVersi() {
        return versi;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
}
