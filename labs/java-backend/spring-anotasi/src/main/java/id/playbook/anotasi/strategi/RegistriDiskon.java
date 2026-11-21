package id.playbook.anotasi.strategi;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

/**
 * Spring menyuntikkan SEMUA bean StrategiDiskon sebagai List. Registri memetakannya per kode.
 * toUnmodifiableMap melempar IllegalStateException bila dua promo memakai kode yang sama:
 * kesalahan konfigurasi ketahuan saat aplikasi start, bukan saat nasabah checkout.
 */
@Service
public class RegistriDiskon {

    private final Map<String, StrategiDiskon> perKode;

    public RegistriDiskon(List<StrategiDiskon> semua) {
        this.perKode = semua.stream().collect(Collectors.toUnmodifiableMap(StrategiDiskon::kode, Function.identity()));
    }

    public BigDecimal hargaAkhir(String kodePromo, BigDecimal harga) {
        StrategiDiskon strategi = perKode.get(kodePromo);
        if (strategi == null) {
            throw new IllegalArgumentException("Kode promo tidak dikenal: " + kodePromo);
        }
        return harga.subtract(strategi.potongan(harga));
    }

    public Set<String> kodeTersedia() {
        return perKode.keySet();
    }
}
