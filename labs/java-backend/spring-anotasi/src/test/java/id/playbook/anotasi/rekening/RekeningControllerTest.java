package id.playbook.anotasi.rekening;

import java.math.BigDecimal;

import id.playbook.anotasi.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verifyNoInteractions;

/** Boot 4: @WebMvcTest pindah paket; @MockBean sudah dihapus, gantinya @MockitoBean (Spring Framework 6.2+). */
@WebMvcTest(RekeningController.class)
@Import(SecurityConfig.class)            // slice tidak memuat @Configuration biasa; aturan keamanan diimpor manual
class RekeningControllerTest {

    @Autowired
    MockMvcTester mvc;                    // gaya AssertJ (Spring 6.2+), pengganti andExpect(...) berantai

    @MockitoBean
    TransferService service;

    private static final String BODY_TRANSFER = """
            {"dari": "1001", "ke": "1002", "jumlah": 150000.00}""";

    @Test
    @WithMockUser(roles = "NASABAH")
    void tanpaHeaderVersiDianggapVersi1() {
        given(service.cari("1001")).willReturn(new Rekening("1001", new BigDecimal("500000.00")));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "1001"))
                .hasStatusOk()
                .bodyText().contains("\"nomor\":\"1001\"").doesNotContain("mataUang");
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void headerVersi2MemilihHandlerVersi2() {
        given(service.cari("1001")).willReturn(new Rekening("1001", new BigDecimal("500000.00")));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "1001").header("X-API-Version", "2"))
                .hasStatusOk()
                .bodyJson().extractingPath("$.mataUang").isEqualTo("IDR");
    }

    @Test
    void transferTanpaLoginDitolak401() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.UNAUTHORIZED);
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void transferOlehNasabahDitolak403OlehPreAuthorize() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.FORBIDDEN);
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void transferOlehTellerBerhasil201() {
        given(service.transfer(eq("1001"), eq("1002"), any()))
                .willReturn(new TransferSelesai("1001", "1002", new BigDecimal("150000.00")));
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.CREATED)
                .bodyJson().extractingPath("$.ke").isEqualTo("1002");
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void jumlahNegatifDitolakValidasi400() {
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"dari": "1001", "ke": "1002", "jumlah": -5}"""))
                .hasStatus(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(service);                // @Valid menolak sebelum service dipanggil
    }

    @Test
    @WithMockUser(roles = "NASABAH")
    void rekeningTidakAdaMenjadiProblemDetail404() {
        given(service.cari("9999")).willThrow(new RekeningTidakDitemukanException("9999"));
        assertThat(mvc.get().uri("/api/rekening/{nomor}", "9999"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasContentType(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson().extractingPath("$.title").isEqualTo("Rekening tidak ditemukan");
    }

    @Test
    @WithMockUser(roles = "TELLER")
    void transferDitolakAturanBisnis422() {
        given(service.transfer(any(), any(), any())).willThrow(new TransferDitolakException("Saldo rekening 1001 tidak cukup"));
        assertThat(mvc.post().uri("/api/rekening/transfer").contentType(MediaType.APPLICATION_JSON).content(BODY_TRANSFER))
                .hasStatus(HttpStatus.UNPROCESSABLE_CONTENT)
                .bodyJson().extractingPath("$.detail").isEqualTo("Saldo rekening 1001 tidak cukup");
    }
}
