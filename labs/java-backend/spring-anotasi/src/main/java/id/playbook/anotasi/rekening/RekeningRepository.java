package id.playbook.anotasi.rekening;

import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface RekeningRepository extends JpaRepository<Rekening, Long> {

    Optional<Rekening> findByNomor(String nomor);   // query diturunkan dari nama method

    /** SELECT ... FOR UPDATE: transaksi lain yang mengunci baris yang sama menunggu sampai commit. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Rekening r where r.nomor = :nomor")
    Optional<Rekening> kunciUntukUpdate(String nomor);
}
