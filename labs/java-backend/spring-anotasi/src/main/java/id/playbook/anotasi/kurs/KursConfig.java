package id.playbook.anotasi.kurs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

/**
 * Spring 7: daftarkan HTTP interface sebagai bean dalam grup "kurs".
 * Base URL dan timeout grup diatur lewat properti spring.http.serviceclient.kurs.*
 */
@Configuration(proxyBeanMethods = false)
@ImportHttpServices(group = "kurs", types = KursApi.class)
public class KursConfig {
}
