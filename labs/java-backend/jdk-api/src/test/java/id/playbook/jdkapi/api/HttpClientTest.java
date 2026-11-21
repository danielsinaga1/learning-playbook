package id.playbook.jdkapi.api;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Server HTTP lokal bawaan JDK: base=USD sukses, base=GANGGU 503, base=LAMBAT menjawab setelah 2 detik. */
class HttpClientTest {

    static HttpServer server;
    static URI base;

    @BeforeAll
    static void mulai() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());   // handler lambat tidak memblokir yang lain
        server.createContext("/v1/latest", ex -> {
            String q = ex.getRequestURI().getQuery();
            int status = 200;
            String body = "{\"base\":\"USD\",\"date\":\"2026-11-13\",\"rates\":{\"IDR\":18245}}";
            if (q.contains("GANGGU")) {
                status = 503;
                body = "{\"message\":\"maintenance\"}";
            } else if (q.contains("LAMBAT")) {
                try {
                    Thread.sleep(2_000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(status, bytes.length);
            try (OutputStream os = ex.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();
        base = URI.create("http://127.0.0.1:" + server.getAddress().getPort());
    }

    @AfterAll
    static void berhenti() {
        server.stop(0);
    }

    @Test
    void thenAcceptPrintlnMencetakObjekResponsBukanBody() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            HttpRequest req = HttpRequest.newBuilder(base.resolve("/v1/latest?base=USD")).build();
            HttpResponse<String> resp = http.sendAsync(req, HttpResponse.BodyHandlers.ofString()).join();
            // Inilah yang dicetak oleh .thenAccept(System.out::println):
            assertThat(String.valueOf(resp)).isEqualTo("(GET " + base + "/v1/latest?base=USD) 200");
            assertThat(String.valueOf(resp)).doesNotContain("IDR");
            assertThat(resp.body()).contains("\"IDR\":18245");
        }
    }

    @Test
    void suksesSinkronDanAsinkron() throws Exception {
        try (KursClient kurs = new KursClient(base, Duration.ofSeconds(1))) {
            assertThat(kurs.kursTerbaru("USD")).contains("18245");
            assertThat(kurs.kursTerbaruAsync("USD").join()).contains("18245");
        }
    }

    @Test
    void status503TidakMelemparExceptionSendiri() throws Exception {
        try (HttpClient http = HttpClient.newHttpClient()) {
            HttpResponse<String> resp = http.send(
                    HttpRequest.newBuilder(base.resolve("/v1/latest?base=GANGGU")).build(), HttpResponse.BodyHandlers.ofString());
            assertThat(resp.statusCode()).isEqualTo(503);                  // tidak ada exception: wajib dicek manual
        }
        try (KursClient kurs = new KursClient(base, Duration.ofSeconds(1))) {
            assertThatThrownBy(() -> kurs.kursTerbaru("GANGGU"))
                    .isInstanceOf(KursClient.KursTidakTersediaException.class)
                    .hasMessageStartingWith("HTTP 503");
            assertThatThrownBy(() -> kurs.kursTerbaruAsync("GANGGU").join())
                    .isInstanceOf(CompletionException.class)
                    .hasCauseInstanceOf(KursClient.KursTidakTersediaException.class);
        }
    }

    @Test
    void timeoutPerRequestMemutusServerLambat() throws Exception {
        try (KursClient kurs = new KursClient(base, Duration.ofMillis(300))) {
            long mulai = System.nanoTime();
            assertThatThrownBy(() -> kurs.kursTerbaru("LAMBAT")).isInstanceOf(HttpTimeoutException.class);
            assertThat(Duration.ofNanos(System.nanoTime() - mulai)).isLessThan(Duration.ofMillis(1_500));
        }
    }
}
