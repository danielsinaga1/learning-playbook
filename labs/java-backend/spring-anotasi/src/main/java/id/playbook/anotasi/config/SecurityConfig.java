package id.playbook.anotasi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 6+: bean SecurityFilterChain, bukan "extends WebSecurityConfigurerAdapter" (sudah dihapus).
 * @EnableMethodSecurity menggantikan @EnableGlobalMethodSecurity (deprecated) dan mengaktifkan @PreAuthorize.
 */
@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/rekening/**").hasAnyRole("TELLER", "NASABAH")
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                // API stateless dengan Basic/Bearer token: CSRF tidak relevan. Aplikasi berbasis cookie session WAJIB menyalakannya.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }
}
