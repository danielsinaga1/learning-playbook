package id.playbook.flashsale;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;

/** Baris 4: transaksi @Transactional(readOnly = true) memakai replica, sisanya primary. */
@Configuration
class DataSourceConfig {

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("app.datasource.primary")
    HikariDataSource primaryDataSource() {
        return new HikariDataSource();
    }

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("app.datasource.replica")
    HikariDataSource replicaDataSource() {
        return new HikariDataSource();
    }

    @Bean
    @Primary
    DataSource dataSource() {
        // Koneksi fisik baru diambil saat query pertama, setelah flag readOnly transaksi diketahui
        LazyConnectionDataSourceProxy proxy = new LazyConnectionDataSourceProxy(primaryDataSource());
        proxy.setReadOnlyDataSource(replicaDataSource());   // Spring Framework 6.1.2+
        return proxy;
    }
}
