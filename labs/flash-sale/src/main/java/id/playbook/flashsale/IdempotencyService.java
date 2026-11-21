package id.playbook.flashsale;

import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Baris 11: key per user disimpan di database agar berlaku lintas instance aplikasi. */
@Service
public class IdempotencyService {
    public record Stored(String requestHash, String status, Integer responseCode, String responseBody) {}

    private final JdbcClient jdbc;

    IdempotencyService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** Kosong = klaim berhasil (request pertama). Berisi = duplikat, lengkap dengan status dan respons lama. */
    @Transactional
    public Optional<Stored> claim(String userId, String key, String requestHash) {
        int inserted = jdbc.sql("""
                INSERT INTO idempotency_keys (user_id, key, request_hash)
                VALUES (:user, :key, :hash)
                ON CONFLICT (user_id, key) DO NOTHING
                """).param("user", userId).param("key", key).param("hash", requestHash).update();
        if (inserted == 1) {
            return Optional.empty();
        }
        return jdbc.sql("""
                SELECT request_hash, status, response_code, response_body
                FROM idempotency_keys WHERE user_id = :user AND key = :key
                """).param("user", userId).param("key", key).query(Stored.class).optional();
    }

    @Transactional
    public void complete(String userId, String key, int code, String body) {
        jdbc.sql("""
                UPDATE idempotency_keys
                SET status = 'completed', response_code = :code, response_body = :body
                WHERE user_id = :user AND key = :key
                """).param("code", code).param("body", body).param("user", userId).param("key", key).update();
    }

    /** Gagal sebelum selesai: lepaskan klaim agar klien boleh mencoba lagi dengan key yang sama. */
    @Transactional
    public void release(String userId, String key) {
        jdbc.sql("DELETE FROM idempotency_keys WHERE user_id = :user AND key = :key AND status = 'processing'")
                .param("user", userId).param("key", key).update();
    }
}
