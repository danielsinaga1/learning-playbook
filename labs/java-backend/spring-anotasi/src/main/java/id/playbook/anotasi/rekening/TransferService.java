package id.playbook.anotasi.rekening;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

import id.playbook.anotasi.config.BankProperties;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Constructor injection: tanpa @Autowired (satu konstruktor = otomatis), field bisa final. */
@Service
public class TransferService {

    private final RekeningRepository repo;
    private final ApplicationEventPublisher events;
    private final BankProperties bank;

    public TransferService(RekeningRepository repo, ApplicationEventPublisher events, BankProperties bank) {
        this.repo = repo;
        this.events = events;
        this.bank = bank;
    }

    @Transactional
    public TransferSelesai transfer(String dari, String ke, BigDecimal jumlah) {
        if (dari.equals(ke)) {
            throw new TransferDitolakException("Rekening asal dan tujuan sama");
        }
        if (jumlah.compareTo(bank.limitTransferHarian()) > 0) {
            throw new TransferDitolakException("Melebihi limit transfer harian " + bank.limitTransferHarian());
        }
        // Kunci dua baris dengan urutan tetap: dua transfer berlawanan arah tidak akan saling menunggu (deadlock).
        List<String> urut = Stream.of(dari, ke).sorted().toList();
        Rekening pertama = kunci(urut.get(0));
        Rekening kedua = kunci(urut.get(1));
        Rekening asal = pertama.getNomor().equals(dari) ? pertama : kedua;
        Rekening tujuan = asal == pertama ? kedua : pertama;

        asal.debit(jumlah);       // melempar TransferDitolakException bila saldo kurang -> rollback
        tujuan.kredit(jumlah);

        TransferSelesai selesai = new TransferSelesai(dari, ke, jumlah);
        events.publishEvent(selesai);   // diterima listener SETELAH commit, bukan sekarang
        return selesai;
    }

    @Transactional(readOnly = true)
    public Rekening cari(String nomor) {
        return repo.findByNomor(nomor).orElseThrow(() -> new RekeningTidakDitemukanException(nomor));
    }

    private Rekening kunci(String nomor) {
        return repo.kunciUntukUpdate(nomor).orElseThrow(() -> new RekeningTidakDitemukanException(nomor));
    }
}
