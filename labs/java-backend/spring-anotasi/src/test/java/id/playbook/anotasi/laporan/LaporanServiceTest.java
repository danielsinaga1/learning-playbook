package id.playbook.anotasi.laporan;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "bank.kurs.cron=-")
class LaporanServiceTest {

    @Autowired
    LaporanService laporan;

    @Test
    void asyncBerjalanDiVirtualThread() throws Exception {
        String hasil = laporan.buatLaporanBulanan("1001").get(5, TimeUnit.SECONDS);
        assertThat(hasil).isEqualTo("1001 dibuat di virtual thread");   // spring.threads.virtual.enabled=true
    }

    @Test
    void concurrencyLimitMembatasiEksekusiBersamaan() throws Exception {
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            threads.add(Thread.ofVirtual().start(() -> {
                try {
                    laporan.tarikDataCoreBanking();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }));
        }
        for (Thread t : threads) {
            t.join();
        }
        assertThat(laporan.puncakBersamaan()).isBetween(2, 3);   // 20 pemanggil, paling banyak 3 sekaligus
    }
}
