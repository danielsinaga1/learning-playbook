package id.playbook.jdkapi.api;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * Executors.newFixedThreadPool memakai antrean TANPA BATAS: saat lonjakan, tugas menumpuk di memori
 * sampai OutOfMemoryError. Untuk pekerjaan CPU-bound, bangun ThreadPoolExecutor dengan antrean terbatas,
 * nama thread yang jelas, dan kebijakan penolakan yang eksplisit.
 */
public final class PoolTerbatas {

    public static ThreadPoolExecutor buat(String nama, int thread, int kapasitasAntrean) {
        return new ThreadPoolExecutor(
                thread, thread, 0L, TimeUnit.MILLISECONDS,
                new ArrayBlockingQueue<>(kapasitasAntrean),
                Thread.ofPlatform().name(nama + "-", 1).factory(),     // "laporan-1", "laporan-2", ... di thread dump
                new ThreadPoolExecutor.AbortPolicy());                 // penuh = RejectedExecutionException, bukan diam
    }

    private PoolTerbatas() {
    }
}
