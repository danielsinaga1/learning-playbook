package id.playbook.jdkapi.chm;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/** Counter per endpoint dengan banyak penulis: ConcurrentHashMap + LongAdder. */
public final class PenghitungAkses {

    private final ConcurrentHashMap<String, LongAdder> hitungan = new ConcurrentHashMap<>();

    public void catat(String path) {
        // computeIfAbsent hanya membuat LongAdder sekali per path; increment() tidak perlu mengunci map
        hitungan.computeIfAbsent(path, k -> new LongAdder()).increment();
    }

    public long jumlah(String path) {
        LongAdder a = hitungan.get(path);
        return a == null ? 0 : a.sum();
    }

    /** Bulk operation: parallelismThreshold 1_000 = paralel bila map berisi lebih dari 1.000 entri. */
    public long total() {
        return hitungan.reduceValuesToLong(1_000, LongAdder::sum, 0L, Long::sum);
    }
}
