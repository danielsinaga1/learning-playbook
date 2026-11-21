package id.playbook.flashsale;

import io.micrometer.observation.ObservationPredicate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.observation.ServerRequestObservationContext;

/** Baris 12: scrape Prometheus & healthcheck bukan traffic user, jadi tidak dijadikan trace maupun metrik HTTP. */
@Configuration
class ObservabilityConfig {
    @Bean
    ObservationPredicate ignoreActuator() {
        return (name, context) -> !(context instanceof ServerRequestObservationContext request
                && request.getCarrier().getRequestURI().startsWith("/actuator"));
    }
}
