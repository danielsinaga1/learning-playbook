package id.playbook.anotasi.kurs;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.HttpClientErrorException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Server HTTP palsu (bawaan JDK) menggantikan API kurs: 503 sekali untuk base USD, 404 untuk base XXX. */
@SpringBootTest(properties = "bank.kurs.cron=-")
class KursServiceTest {

    static final AtomicInteger PANGGILAN_USD = new AtomicInteger();
    static final AtomicInteger PANGGILAN_XXX = new AtomicInteger();
    static final HttpServer SERVER = mulaiServer();

    static HttpServer mulaiServer() {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/v1/latest", ex -> {
                String query = ex.getRequestURI().getQuery();
                int status;
                String body;
                if (query.contains("base=XXX")) {
                    PANGGILAN_XXX.incrementAndGet();
                    status = 404;
                    body = "{\"message\":\"not found\"}";
                } else if (PANGGILAN_USD.incrementAndGet() == 1) {
                    status = 503;                                   // gangguan sementara pertama
                    body = "{}";
                } else {
                    status = 200;
                    body = "{\"amount\":1.0,\"base\":\"USD\",\"date\":\"2026-11-13\",\"rates\":{\"IDR\":18245,\"EUR\":0.90481}}";
                }
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().add("Content-Type", "application/json");
                ex.sendResponseHeaders(status, bytes.length);
                try (OutputStream os = ex.getResponseBody()) {
                    os.write(bytes);
                }
            });
            s.start();
            return s;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @DynamicPropertySource
    static void arahkanKeServerPalsu(DynamicPropertyRegistry r) {
        r.add("spring.http.serviceclient.kurs.base-url", () -> "http://127.0.0.1:" + SERVER.getAddress().getPort());
    }

    @AfterAll
    static void hentikan() {
        SERVER.stop(0);
    }

    @Autowired
    KursService kurs;

    @Test
    void retrySaat503LaluHasilnyaDicache() {
        KursApi.KursResponse pertama = kurs.kursTerbaru("USD");

        assertThat(pertama.rates().get("IDR")).isEqualByComparingTo("18245");
        assertThat(pertama.date()).hasToString("2026-11-13");
        assertThat(PANGGILAN_USD.get()).isEqualTo(2);           // 503, lalu retry berhasil

        kurs.kursTerbaru("USD");
        assertThat(PANGGILAN_USD.get()).isEqualTo(2);           // panggilan kedua dari cache
    }

    @Test
    void galat4xxTidakDiRetry() {
        assertThatThrownBy(() -> kurs.kursTerbaru("XXX")).isInstanceOf(HttpClientErrorException.NotFound.class);
        assertThat(PANGGILAN_XXX.get()).isEqualTo(1);
    }
}
