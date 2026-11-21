package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Boot 4: @DataJpaTest di org.springframework.boot.data.jpa.test.autoconfigure (modul spring-boot-data-jpa-test). */
@DataJpaTest
class RekeningRepositoryTest {

    @Autowired
    RekeningRepository repo;

    @Autowired
    TestEntityManager em;

    @Test
    void queryDariNamaMethod() {
        em.persistAndFlush(new Rekening("5001", new BigDecimal("10.00")));
        assertThat(repo.findByNomor("5001")).get().extracting(Rekening::getSaldo).isEqualTo(new BigDecimal("10.00"));
        assertThat(repo.findByNomor("tidak-ada")).isEmpty();
    }

    @Test
    void versionMenolakUpdateDariSalinanBasi() {
        Long id = em.persistFlushFind(new Rekening("5002", new BigDecimal("1000.00"))).getId();
        em.clear();

        Rekening salinanA = repo.findById(id).orElseThrow();
        em.detach(salinanA);
        Rekening salinanB = repo.findById(id).orElseThrow();   // dua "pengguna" membaca versi yang sama
        em.detach(salinanB);

        salinanA.setSaldo(new BigDecimal("900.00"));
        repo.saveAndFlush(salinanA);                           // versi 0 -> 1

        salinanB.setSaldo(new BigDecimal("800.00"));           // masih membawa versi 0
        assertThatThrownBy(() -> repo.saveAndFlush(salinanB))
                .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }
}
