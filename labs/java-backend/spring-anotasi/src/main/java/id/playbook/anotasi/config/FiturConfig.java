package id.playbook.anotasi.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.resilience.annotation.EnableResilientMethods;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Semua @Enable* dikumpulkan di sini, bukan di class utama. */
@Configuration(proxyBeanMethods = false)
@EnableCaching            // @Cacheable, @CachePut, @CacheEvict
@EnableAsync              // @Async
@EnableScheduling         // @Scheduled
@EnableResilientMethods   // Spring 7: @Retryable dan @ConcurrencyLimit tanpa library tambahan
public class FiturConfig {
}
