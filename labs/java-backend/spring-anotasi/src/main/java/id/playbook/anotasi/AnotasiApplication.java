package id.playbook.anotasi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Class utama sengaja polos. @Enable* untuk cache, async, scheduling, dan resilience ada di FiturConfig:
 * anotasi di class utama ikut dimuat oleh test slice seperti @WebMvcTest dan membuatnya berat.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class AnotasiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnotasiApplication.class, args);
    }
}
