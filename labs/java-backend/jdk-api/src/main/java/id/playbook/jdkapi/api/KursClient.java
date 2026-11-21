package id.playbook.jdkapi.api;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

/**
 * HttpClient dibuat SEKALI dan dipakai ulang (connection pool, HTTP/2, thread internal ada di dalamnya).
 * Dua timeout berbeda: connectTimeout di client, timeout per request di HttpRequest (default: tanpa batas!).
 */
public final class KursClient implements AutoCloseable {

    private final HttpClient http;
    private final URI baseUrl;
    private final Duration timeoutRequest;

    public KursClient(URI baseUrl, Duration timeoutRequest) {
        this.baseUrl = baseUrl;
        this.timeoutRequest = timeoutRequest;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NORMAL)        // default NEVER
                .build();
    }

    private HttpRequest request(String base) {
        return HttpRequest.newBuilder(baseUrl.resolve("/v1/latest?base=" + URLEncoder.encode(base, StandardCharsets.UTF_8)))
                .timeout(timeoutRequest)
                .header("Accept", "application/json")
                .GET()
                .build();
    }

    /** Sinkron: sederhana dan, di virtual thread, tidak memboroskan thread platform. */
    public String kursTerbaru(String base) throws IOException, InterruptedException {
        HttpResponse<String> resp = http.send(request(base), HttpResponse.BodyHandlers.ofString());
        return bodyBilaSukses(resp);
    }

    /** Asinkron: ambil BODY-nya, bukan objek HttpResponse; status non-2xx menjadi exception. */
    public CompletableFuture<String> kursTerbaruAsync(String base) {
        return http.sendAsync(request(base), HttpResponse.BodyHandlers.ofString())
                .thenApply(KursClient::bodyBilaSukses);
    }

    private static String bodyBilaSukses(HttpResponse<String> resp) {
        // HttpClient TIDAK melempar exception untuk 4xx/5xx: status wajib dicek sendiri
        if (resp.statusCode() / 100 != 2) {
            throw new KursTidakTersediaException("HTTP " + resp.statusCode() + " dari " + resp.uri());
        }
        return resp.body();
    }

    @Override
    public void close() {
        http.close();                                               // Java 21+: HttpClient AutoCloseable
    }

    public static final class KursTidakTersediaException extends RuntimeException {
        public KursTidakTersediaException(String pesan) {
            super(pesan);
        }
    }
}
