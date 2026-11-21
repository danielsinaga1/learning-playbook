package id.playbook.flashsale;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {
    public record Product(long id, String name, long priceIdr, int stock) {}

    private final JdbcClient jdbc;

    ProductService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Baris 1: cache-aside. Hasil null (produk tidak ada) ikut di-cache. Tanpa sync = true: dengan
     * RedisCache bawaan (writer non-locking) flag itu tidak mengunci per key, jadi tidak mencegah stampede.
     * Baris 4: saat cache miss, query dijalankan di replica.
     */
    @Cacheable(cacheNames = "products")
    @Transactional(readOnly = true)
    public Product find(long id) {
        return jdbc.sql("SELECT id, name, price_idr, stock FROM products WHERE id = :id")
                .param("id", id)
                .query(Product.class)
                .optional()
                .orElse(null);
    }

    /** Setelah stok berubah: hapus key, jangan tulis nilai baru. */
    @CacheEvict(cacheNames = "products", key = "#id")
    public void evict(long id) {
    }
}
