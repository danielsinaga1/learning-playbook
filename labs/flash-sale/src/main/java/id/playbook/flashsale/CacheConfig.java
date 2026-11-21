package id.playbook.flashsale;

import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

/**
 * Baris 1: TTL 60 detik, nilai disimpan sebagai JSON bertipe (terbaca dari redis-cli).
 * Serializer bawaan memakai serialisasi Java, yang menolak record yang tidak Serializable.
 */
@Configuration
class CacheConfig {
    @Bean
    RedisCacheConfiguration productCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new JacksonJsonRedisSerializer<>(ProductService.Product.class)));
    }
}
