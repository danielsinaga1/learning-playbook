package id.playbook.anotasi.kurs;

import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

@Service
public class KursService {

    static final String SIMBOL = "IDR,EUR,SGD,JPY";

    private final KursApi api;

    public KursService(KursApi api) {
        this.api = api;
    }

    /**
     * Retry hanya untuk gangguan sementara: 5xx dan I/O (timeout, koneksi). 4xx tidak di-retry.
     * Panggilan kedua dengan base yang sama dilayani cache, tidak memanggil API lagi.
     */
    @Cacheable(cacheNames = "kurs", key = "#base")
    @Retryable(includes = {HttpServerErrorException.class, ResourceAccessException.class},
               maxRetries = 2, delay = 100, multiplier = 2)
    public KursApi.KursResponse kursTerbaru(String base) {
        return api.terbaru(base, SIMBOL);
    }

    /** Dipanggil job terjadwal: selalu ambil data baru lalu timpa isi cache. */
    @CachePut(cacheNames = "kurs", key = "#base")
    public KursApi.KursResponse segarkan(String base) {
        return api.terbaru(base, SIMBOL);
    }
}
