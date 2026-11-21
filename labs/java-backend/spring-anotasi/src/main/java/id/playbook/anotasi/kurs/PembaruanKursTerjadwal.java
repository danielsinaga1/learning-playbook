package id.playbook.anotasi.kurs;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PembaruanKursTerjadwal {

    private final KursService kurs;

    public PembaruanKursTerjadwal(KursService kurs) {
        this.kurs = kurs;
    }

    /**
     * Hari kerja pukul 17.00 WIB. Zona waktu ditulis eksplisit: server sering berjalan dalam UTC.
     * Nilai cron "-" mematikan job (dipakai di test dan lingkungan yang tidak boleh memanggil API luar).
     */
    @Scheduled(cron = "${bank.kurs.cron:0 0 17 * * MON-FRI}", zone = "Asia/Jakarta")
    public void segarkanKurs() {
        kurs.segarkan("USD");
    }
}
