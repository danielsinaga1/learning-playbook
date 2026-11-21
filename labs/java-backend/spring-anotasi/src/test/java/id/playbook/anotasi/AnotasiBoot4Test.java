package id.playbook.anotasi;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Bukti, bukan ingatan: classpath Spring Boot 4.1.2 diperiksa langsung.
 * Jalankan ulang setelah upgrade versi untuk melihat apa yang berubah.
 */
class AnotasiBoot4Test {

    @ParameterizedTest
    @ValueSource(strings = {
            "org.springframework.boot.test.mock.mockito.MockBean",                         // dihapus Boot 4 -> @MockitoBean
            "org.springframework.boot.test.mock.mockito.SpyBean",                          // dihapus Boot 4 -> @MockitoSpyBean
            "org.springframework.beans.factory.annotation.Required",                       // dihapus Spring 6
            "org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter",
            "org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity",
            "org.springframework.data.annotation.PersistenceConstructor",                  // -> @PersistenceCreator
            "org.springframework.boot.jackson.JsonComponent",                              // Boot 4 -> @JacksonComponent
            "org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest",          // lokasi Boot 3
            "org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest",             // lokasi Boot 3
            "org.springframework.boot.autoconfigure.domain.EntityScan",                    // lokasi Boot 3
            "javax.annotation.PostConstruct",                                              // -> jakarta.annotation
            "javax.persistence.Entity",                                                    // -> jakarta.persistence
            "jakarta.annotation.ManagedBean",                                              // tidak ada di Jakarta Annotations 3.0
    })
    void sudahTidakAdaDiBoot4(String kelas) {
        assertThatThrownBy(() -> Class.forName(kelas)).isInstanceOf(ClassNotFoundException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "org.springframework.test.context.bean.override.mockito.MockitoBean",
            "org.springframework.test.context.bean.override.mockito.MockitoSpyBean",
            "org.springframework.data.annotation.PersistenceCreator",
            "org.springframework.boot.jackson.JacksonComponent",
            "org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest",
            "org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest",
            "org.springframework.boot.persistence.autoconfigure.EntityScan",
            "org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity",
            "org.springframework.resilience.annotation.Retryable",
            "org.springframework.resilience.annotation.ConcurrencyLimit",
            "org.springframework.web.service.registry.ImportHttpServices",
            "org.springframework.boot.autoconfigure.condition.ConditionalOnBooleanProperty",
            "jakarta.annotation.PostConstruct",
            "org.jspecify.annotations.NullMarked",
    })
    void penggantinyaAda(String kelas) throws ClassNotFoundException {
        assertThat(Class.forName(kelas)).isNotNull();
    }

    @Test
    void masihAdaTetapiDeprecated() throws Exception {
        Class<?> globalMethodSecurity =
                Class.forName("org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity");
        assertThat(globalMethodSecurity.isAnnotationPresent(Deprecated.class)).isTrue();
        assertThat(Class.forName("org.springframework.lang.Nullable").isAnnotationPresent(Deprecated.class)).isTrue();
        assertThat(HttpStatus.class.getField("UNPROCESSABLE_ENTITY").isAnnotationPresent(Deprecated.class)).isTrue();
    }
}
