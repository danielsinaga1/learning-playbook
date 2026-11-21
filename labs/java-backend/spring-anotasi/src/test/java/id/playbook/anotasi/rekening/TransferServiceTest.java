package id.playbook.anotasi.rekening;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Sengaja TANPA @Transactional di class test: transaksi test yang di-rollback tidak pernah commit,
 * sehingga @TransactionalEventListener(AFTER_COMMIT) tidak akan pernah terpanggil.
 */
@SpringBootTest(properties = "bank.kurs.cron=-")
class TransferServiceTest {

    @Autowired
    TransferService service;

    @Autowired
    RekeningRepository repo;

    @Autowired
    NotifikasiTransfer notifikasi;

    private String rekeningBaru(String saldo) {
        String nomor = UUID.randomUUID().toString().substring(0, 12);
        repo.save(new Rekening(nomor, new BigDecimal(saldo)));
        return nomor;
    }

    @Test
    void transferBerhasilLaluNotifikasiSetelahCommit() {
        String a = rekeningBaru("1000000.00");
        String b = rekeningBaru("0.00");

        TransferSelesai hasil = service.transfer(a, b, new BigDecimal("250000.00"));

        assertThat(repo.findByNomor(a).orElseThrow().getSaldo()).isEqualByComparingTo("750000");
        assertThat(repo.findByNomor(b).orElseThrow().getSaldo()).isEqualByComparingTo("250000");
        assertThat(notifikasi.terkirim()).contains(hasil);
    }

    @Test
    void saldoKurangDiRollbackDanTidakAdaNotifikasi() {
        String a = rekeningBaru("100000.00");
        String b = rekeningBaru("0.00");

        assertThatThrownBy(() -> service.transfer(a, b, new BigDecimal("150000.00")))
                .isInstanceOf(TransferDitolakException.class);

        assertThat(repo.findByNomor(a).orElseThrow().getSaldo()).isEqualByComparingTo("100000");
        assertThat(repo.findByNomor(b).orElseThrow().getSaldo()).isEqualByComparingTo("0");
        assertThat(notifikasi.terkirim()).noneMatch(e -> e.dari().equals(a));
    }

    @Test
    void melebihiLimitHarianDariPropertiDitolak() {
        String a = rekeningBaru("90000000.00");
        String b = rekeningBaru("0.00");
        assertThatThrownBy(() -> service.transfer(a, b, new BigDecimal("25000000.01")))
                .isInstanceOf(TransferDitolakException.class)
                .hasMessageContaining("limit");
    }
}
