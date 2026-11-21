package id.playbook.jdkapi.api;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.charset.MalformedInputException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FilesTest {

    @TempDir
    Path dir;

    /** Ekspor CSV dari sistem lama sering memakai Windows-1252, bukan UTF-8: "é" = satu byte 0xE9. */
    private Path csvSistemLama() throws IOException {
        Path csv = dir.resolve("mutasi-lama.csv");
        Files.write(csv, "nama,kota\nRené,Medan\n".getBytes(Charset.forName("windows-1252")));
        return csv;
    }

    @Test
    void readAllLinesMenolakByteYangBukanUtf8() throws IOException {
        Path csv = csvSistemLama();
        assertThatThrownBy(() -> Files.readAllLines(csv)).isInstanceOf(MalformedInputException.class);
        assertThat(Files.readAllLines(csv, Charset.forName("windows-1252"))).containsExactly("nama,kota", "René,Medan");
    }

    @Test
    void filesLinesGagalSecaraMalasSaatDibaca() throws IOException {
        Path csv = csvSistemLama();
        try (Stream<String> baris = Files.lines(csv)) {           // membuka file berhasil...
            assertThatThrownBy(baris::count)                      // ...error baru muncul saat stream dikonsumsi
                    .isInstanceOf(UncheckedIOException.class)
                    .hasCauseInstanceOf(MalformedInputException.class);
        }
    }

    @Test
    void readStringDanWriteStringSelaluUtf8() throws IOException {
        Path f = dir.resolve("catatan.txt");
        Files.writeString(f, "Saldo Rp1.500.000 — terima kasih");
        assertThat(Files.readString(f)).isEqualTo("Saldo Rp1.500.000 — terima kasih");
        assertThat(Files.readAllBytes(f)).hasSize("Saldo Rp1.500.000 — terima kasih".getBytes(StandardCharsets.UTF_8).length);
        assertThat(Files.readAllLines(f)).isEqualTo(List.of("Saldo Rp1.500.000 — terima kasih"));
    }
}
