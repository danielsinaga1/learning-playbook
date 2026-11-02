import type { Module } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const BASICS = 'Dasar Bahasa Go';
const CONCURRENCY = 'Concurrency';
const IDIOM = 'Idiom & Arsitektur';
const WEB_DB = 'Web API & Database';
const TESTING = 'Testing, Performa & Produksi';

export const goExtraSource = 'Go: materi tambahan dari dokumentasi resmi Go (paket time, unicode/utf8, reflect, runtime, runtime/trace), golang.org/x/sync, golang.org/x/time, cobra, dan coder/websocket (2 November 2026)';

const src = { source: goExtraSource };

/** Ditambahkan ke track yang sudah ada; tidak membuat track baru. */
export const goExtraModules: Omit<Module, 'code'>[] = [
  {
    ...src,
    id: 'gox-string-rune-time',
    title: 'String, Byte, Rune & Unicode, plus Paket time',
    summary: 'String sebagai byte UTF-8, range per rune, strings.Builder, lalu time.Duration, zona waktu Asia/Jakarta, layout 2006-01-02, Parse vs ParseInLocation, dan jebakan tanggal.',
    track: BASICS, duration: '90 menit', level: 'Easy',
    blocks: [
      paragraph('Dua jenis data muncul di hampir setiap program backend: **teks** dan **waktu**, dan keduanya punya jebakan. String Go adalah deretan byte (biasanya UTF-8) yang tidak bisa diubah, sehingga `len("☕")` bernilai 3, bukan 1. Paket `time` memakai cara format yang unik (tanggal acuan `2006-01-02 15:04:05`) dan zona waktu yang mudah tertukar antara UTC dan WIB. Tipe dasar `rune` dan `byte` sudah diperkenalkan di [Variabel, Konstanta, dan Tipe Data](#go.variabel-konstanta-dan-tipe-data); modul ini membahas cara memakainya dengan benar.'),
      heading('String, byte, dan rune'),
      code('Byte vs rune, dan memotong teks dengan aman', `package main

import (
	"fmt"
	"strings"
	"unicode"
	"unicode/utf8"
)

// potong mengambil maksimal n karakter (rune), tidak pernah membelah karakter multibyte.
func potong(s string, n int) string {
	if utf8.RuneCountInString(s) <= n {
		return s
	}
	i := 0
	for pos := range s { // pos = posisi byte awal setiap rune
		if i == n {
			return s[:pos] + "…"
		}
		i++
	}
	return s
}

func main() {
	s := "Kopi ☕ Gayo"
	fmt.Println(len(s), utf8.RuneCountInString(s)) // 13 11: len menghitung BYTE
	fmt.Println(s[0], string(s[0]))                // 75 K: indeks string menghasilkan byte
	fmt.Println(s[5:8])                            // ☕ (byte 5..8)
	// s[5:6] hanya sepertiga karakter: dicetak sebagai �

	for i, r := range s { // range atas string berjalan per RUNE
		if r > unicode.MaxASCII {
			fmt.Printf("%c di byte %d (%U)\\n", r, i, r) // ☕ di byte 5 (U+2615)
		}
	}

	runes := []rune(s)                // konversi O(n) + alokasi; pakai bila butuh indeks karakter
	fmt.Println(string(runes[5]))     // ☕
	b := []byte(s)                    // salinan yang bisa diubah; string asli immutable
	b[0] = 'k'
	fmt.Println(string(b), "|", s)    // kopi ☕ Gayo | Kopi ☕ Gayo
	fmt.Println(utf8.ValidString("\\xff")) // false: byte tidak valid UTF-8

	fmt.Println(potong("Nasi goreng spesial 🍳", 11)) // Nasi goreng…
	fmt.Println(strings.EqualFold("Go", "GO"))        // true: banding tanpa peduli kapital
	user, domain, ok := strings.Cut("ani@contoh.id", "@")
	fmt.Println(user, domain, ok)                     // ani contoh.id true
	fmt.Println(strings.Fields("  bayar   listrik "))  // [bayar listrik]

	var sb strings.Builder // menyusun string tanpa alokasi berulang
	for i := range 3 {
		fmt.Fprintf(&sb, "item-%d;", i)
	}
	fmt.Println(sb.String()) // item-0;item-1;item-2;
}`, 'go'),
      table(['Tipe / paket', 'Isi', 'Pakai untuk'], [
        ['`string`', 'Byte read-only (biasanya UTF-8)', 'Teks; murah dibagi karena tidak bisa diubah'],
        ['`byte` (= `uint8`)', 'Satu byte', 'Data biner, protokol, ASCII'],
        ['`rune` (= `int32`)', 'Satu code point Unicode', 'Iterasi karakter, `unicode.IsLetter`'],
        ['`[]byte`', 'Byte yang bisa diubah', 'I/O, `bytes.Buffer`, encoding'],
        ['`strings` / `bytes`', 'Fungsi yang sama untuk string dan []byte', '`Cut`, `Fields`, `Split`, `Contains`, `Builder`'],
        ['`unicode/utf8`', 'Hitung dan validasi UTF-8', '`RuneCountInString`, `ValidString`, `DecodeRuneInString`'],
      ]),
      heading('Paket time: Duration, zona waktu, dan format'),
      code('Asia/Jakarta, layout, dan Duration', `package main

import (
	"fmt"
	"time"
	_ "time/tzdata" // sematkan database zona waktu ke binary (sekitar 450 KB)
)

func main() {
	// Tanpa tzdata, LoadLocation gagal di image scratch/distroless yang tidak punya /usr/share/zoneinfo
	wib, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		panic(err)
	}

	t := time.Date(2026, time.November, 2, 9, 30, 0, 0, wib)
	fmt.Println(t.Format("2006-01-02 15:04:05 MST"))   // 2026-11-02 09:30:00 WIB
	fmt.Println(t.UTC().Format(time.RFC3339))           // 2026-11-02T02:30:00Z
	fmt.Println(t.Format("Monday, 02 Jan 2006"))        // Monday, 02 Nov 2026 (nama selalu bahasa Inggris)
	fmt.Println(t.Format(time.DateOnly), t.Format(time.Kitchen)) // 2026-11-02 9:30AM

	// Parse tanpa info zona = UTC. Untuk input jam lokal dari form, pakai ParseInLocation.
	a, _ := time.Parse(time.DateTime, "2026-11-02 09:30:00")
	b, _ := time.ParseInLocation(time.DateTime, "2026-11-02 09:30:00", wib)
	fmt.Println(a.Sub(b))                      // 7h0m0s: "jam yang sama" tetapi momen berbeda
	fmt.Println(a.Equal(b.Add(7 * time.Hour))) // true. Jangan bandingkan time.Time dengan ==

	// Duration adalah int64 nanodetik
	d := 90 * time.Minute
	fmt.Println(d, d.Hours())                  // 1h30m0s 1.5
	batas, _ := time.ParseDuration("1m30s")
	mulai := time.Now()
	// ... kerja ...
	fmt.Println(time.Since(mulai) < batas)     // Since memakai jam monotonic: aman dari perubahan jam sistem

	// AddDate menormalkan tanggal: 31 Jan + 1 bulan = "31 Feb" = 3 Maret 2026
	jan31 := time.Date(2026, 1, 31, 0, 0, 0, 0, wib)
	fmt.Println(jan31.AddDate(0, 1, 0).Format(time.DateOnly)) // 2026-03-03

	// Awal hari di WIB. t.Truncate(24*time.Hour) memotong berdasarkan UTC, hasilnya jam 07:00 WIB.
	y, m, hari := t.Date()
	awal := time.Date(y, m, hari, 0, 0, 0, 0, wib)
	fmt.Println(awal.Format(time.DateTime))    // 2026-11-02 00:00:00
}`, 'go'),
      table(['Elemen layout', 'Arti', 'Contoh hasil'], [
        ['`2006` / `06`', 'Tahun 4 / 2 digit', '2026 / 26'],
        ['`01` / `1` / `Jan` / `January`', 'Bulan', '11 / 11 / Nov / November'],
        ['`02` / `2` / `Mon` / `Monday`', 'Tanggal / nama hari', '02 / 2 / Mon / Monday'],
        ['`15` / `03` + `PM`', 'Jam 24 / jam 12', '09 / 09 AM'],
        ['`04` / `05` / `.000`', 'Menit / detik / milidetik', '30 / 00 / .123'],
        ['`MST` / `-0700` / `Z07:00`', 'Nama zona / offset', 'WIB / +0700 / +07:00 (Z bila UTC)'],
        ['`time.RFC3339`, `time.DateOnly`, `time.DateTime`', 'Konstanta siap pakai', 'Pakai daripada mengetik ulang'],
      ]),
      callout('tip', 'Aturan praktis waktu di backend', 'Simpan dan kirim waktu dalam **UTC** (kolom `TIMESTAMPTZ`, JSON RFC3339; lihat [JSON Encoding & Decoding](#go.json-encoding-decoding)), dan ubah ke WIB/WITA/WIT hanya saat menampilkan ke pengguna. Untuk laporan harian, tentukan batas hari di zona pengguna, bukan di zona server.'),
      callout('warn', 'Jebakan yang sering terjadi', 'Menulis layout dengan angka lain (`"2026-11-02"` atau `"YYYY-MM-DD"`) menghasilkan output aneh tanpa error. Membagi string dengan `s[:n]` bisa membelah emoji atau huruf beraksen. Sejak Go 1.23, timer dan ticker yang tidak di-`Stop()` tetap bisa dibersihkan GC, tetapi tetap panggil `defer ticker.Stop()` agar maksudnya jelas.'),
      ...quiz([
        ['GOX-11', 'Mengapa `for i := 0; i < len(s); i++ { fmt.Print(string(s[i])) }` merusak teks "Café ☕", sedangkan `for _, r := range s` tidak?', 'Loop indeks berjalan per byte. é dan ☕ terdiri dari beberapa byte, sehingga setiap byte dicetak sendiri-sendiri dan menjadi karakter rusak. range atas string mendekode UTF-8 dan menghasilkan satu rune per karakter beserta posisi byte awalnya.'],
        ['GOX-12', 'Pengguna di Jakarta mengisi "2026-11-02 09:30" di form, lalu server memakai `time.Parse` dan menyimpannya. Di laporan muncul jam 16:30 WIB. Apa yang salah?', 'time.Parse tanpa info zona menganggap input sebagai UTC, sehingga 09:30 UTC = 16:30 WIB. Gunakan `time.ParseInLocation(layout, input, wib)` dengan lokasi Asia/Jakarta agar input dibaca sebagai jam lokal, lalu simpan dalam UTC.'],
      ]),
      ...practice('gox-string-time', [
        'Fungsi `Potong(s string, n int) string` lulus table-driven test berisi teks ASCII, huruf beraksen, dan emoji.',
        'Fungsi `FormatTanggalID(t time.Time) string` menghasilkan "Senin, 2 November 2026" dengan nama hari dan bulan bahasa Indonesia (peta manual, karena Format selalu bahasa Inggris).',
        'Hitung batas awal dan akhir "hari ini" serta "bulan ini" dalam WIB untuk query laporan, lalu tes dengan waktu tetap (bukan time.Now).',
        'Build binary dengan `CGO_ENABLED=0`, jalankan di image `scratch`, dan buktikan `LoadLocation("Asia/Jakarta")` gagal tanpa `time/tzdata` dan berhasil dengannya.',
      ]),
      references(
        ['Go Blog: Strings, bytes, runes and characters', 'https://go.dev/blog/strings'],
        ['unicode/utf8', 'https://pkg.go.dev/unicode/utf8'],
        ['strings', 'https://pkg.go.dev/strings'],
        ['time', 'https://pkg.go.dev/time'],
        ['time/tzdata', 'https://pkg.go.dev/time/tzdata'],
      ),
    ],
  },
  {
    ...src,
    id: 'gox-pola-concurrency',
    title: 'Pola Concurrency: Pipeline, Fan-out/Fan-in, Worker Pool Berbatas & Rate Limiting',
    summary: 'Pipeline yang bisa dibatalkan, fan-out/fan-in generik, worker pool dengan errgroup.SetLimit, semaphore berbobot, rate limiting dengan Ticker dan x/time/rate, serta shutdown yang menyelesaikan pekerjaan berjalan.',
    track: CONCURRENCY, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('[Goroutine & Channel](#go.goroutine-channel-concurrency-di-go) memperkenalkan worker pool sederhana, dan [errgroup](#go.errgroup-concurrency-dengan-error) menangani error pertama. Di produksi, pola-pola itu perlu tiga hal tambahan: **setiap goroutine punya jalan keluar** saat context dibatalkan (tanpa itu terjadi goroutine leak), **jumlah kerja paralel dibatasi** agar database atau API tujuan tidak kebanjiran, dan **laju request dikendalikan** sesuai kuota pihak lain. Contoh di bawah memakai Go 1.22+ (variabel loop per iterasi, `range` atas int) dan `sync.WaitGroup.Go` dari Go 1.25.'),
      heading('Pipeline dan fan-out/fan-in'),
      code('Tahap-tahap yang dihubungkan channel, semuanya patuh pada ctx', `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Hasil struct {
	ID    int
	Nilai string
}

// Tahap 1: sumber. Pemilik channel yang menutupnya.
func sumber(ctx context.Context, ids ...int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for _, id := range ids {
			select {
			case out <- id:
			case <-ctx.Done(): // konsumen berhenti: jangan menggantung selamanya di send
				return
			}
		}
	}()
	return out
}

// Tahap 2: kerja lambat (misalnya memanggil API). Dijalankan di beberapa goroutine = fan-out.
func ambil(ctx context.Context, in <-chan int) <-chan Hasil {
	out := make(chan Hasil)
	go func() {
		defer close(out)
		for id := range in {
			time.Sleep(50 * time.Millisecond) // pura-pura I/O
			select {
			case out <- Hasil{ID: id, Nilai: fmt.Sprintf("data-%d", id)}:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}

// Fan-in: gabungkan banyak channel menjadi satu. Generik, bisa dipakai ulang.
func gabung[T any](ctx context.Context, chans ...<-chan T) <-chan T {
	out := make(chan T)
	var wg sync.WaitGroup
	for _, c := range chans {
		wg.Go(func() { // Go 1.25+: Add(1), go, dan Done sekaligus
			for v := range c {
				select {
				case out <- v:
				case <-ctx.Done():
					return
				}
			}
		})
	}
	go func() { wg.Wait(); close(out) }() // tutup setelah SEMUA input selesai
	return out
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	ids := sumber(ctx, 1, 2, 3, 4, 5, 6, 7, 8)
	pekerja := make([]<-chan Hasil, 4) // fan-out: 4 goroutine membaca channel yang SAMA
	for i := range pekerja {
		pekerja[i] = ambil(ctx, ids)
	}
	for h := range gabung(ctx, pekerja...) { // urutan hasil tidak dijamin
		fmt.Println(h.ID, h.Nilai)
	}
}`, 'go'),
      heading('Worker pool berbatas dan semaphore'),
      code('errgroup.SetLimit dan semaphore berbobot', `import (
	"context"
	"fmt"

	"golang.org/x/sync/errgroup"
	"golang.org/x/sync/semaphore"
)

// Proses ribuan ID, maksimal 8 sekaligus, berhenti di error pertama.
func prosesSemua(ctx context.Context, ids []int) ([]Hasil, error) {
	g, ctx := errgroup.WithContext(ctx)
	g.SetLimit(8)                    // g.Go memblok bila sudah ada 8 goroutine aktif
	hasil := make([]Hasil, len(ids)) // tiap goroutine menulis indeksnya sendiri: tanpa mutex
	for i, id := range ids {
		g.Go(func() error {
			h, err := ambilSatu(ctx, id) // ctx batal bila goroutine lain gagal
			if err != nil {
				return fmt.Errorf("id %d: %w", id, err)
			}
			hasil[i] = h
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		return nil, err
	}
	return hasil, nil
}

// Semaphore berbobot: file besar "memakan" lebih banyak kuota dibanding file kecil.
var kuotaMemori = semaphore.NewWeighted(512) // total 512 MB untuk pemrosesan bersamaan

func prosesFile(ctx context.Context, ukuranMB int64) error {
	bobot := min(ukuranMB, 512)
	if err := kuotaMemori.Acquire(ctx, bobot); err != nil {
		return err // ctx batal saat menunggu
	}
	defer kuotaMemori.Release(bobot)
	// ... baca dan proses file ...
	return nil
}

// Tanpa dependensi: channel ber-buffer sebagai semaphore sederhana
var slot = make(chan struct{}, 5)

func denganSlot(ctx context.Context, kerja func()) error {
	select {
	case slot <- struct{}{}:
		defer func() { <-slot }()
		kerja()
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}`, 'go'),
      heading('Rate limiting'),
      code('time.Ticker vs token bucket x/time/rate', `import (
	"context"
	"net/http"
	"time"

	"golang.org/x/time/rate"
)

// Ticker: laju tetap tanpa burst, misalnya 5 request/detik ke API pihak ketiga
func kirimBerirama(ctx context.Context, reqs []Req) error {
	tick := time.NewTicker(200 * time.Millisecond)
	defer tick.Stop()
	for _, r := range reqs {
		select {
		case <-tick.C:
			kirim(r)
		case <-ctx.Done():
			return ctx.Err()
		}
	}
	return nil
}

// Token bucket: rata-rata 10/detik, boleh burst sampai 20
var lim = rate.NewLimiter(rate.Limit(10), 20)

func kirimDenganLimiter(ctx context.Context, reqs []Req) error {
	for _, r := range reqs {
		if err := lim.Wait(ctx); err != nil { // menunggu token, atau error bila ctx batal/deadline terlalu dekat
			return err
		}
		kirim(r)
	}
	return nil
}

// Di sisi server: tolak dengan 429 alih-alih menunggu
func batasiLaju(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !lim.Allow() {
			w.Header().Set("Retry-After", "1")
			http.Error(w, "terlalu banyak request", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}`, 'go'),
      heading('Graceful cancel: berhenti menerima, selesaikan yang berjalan'),
      code('signal.NotifyContext, drain, dan batas waktu shutdown', `func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	jobs := make(chan Job)
	var wg sync.WaitGroup
	for range 4 {
		wg.Go(func() {
			for job := range jobs { // berhenti saat jobs ditutup dan kosong
				// WithoutCancel (Go 1.21+): job yang SUDAH diambil tidak ikut dibatalkan oleh Ctrl+C,
				// tetapi tetap diberi batas waktu sendiri.
				jctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
				proses(jctx, job)
				cancel()
			}
		})
	}

	produksi(ctx, jobs) // membaca antrean sampai ctx batal
	close(jobs)         // 1. berhenti memberi pekerjaan baru

	selesai := make(chan struct{})
	go func() { wg.Wait(); close(selesai) }()
	select {
	case <-selesai: // 2. semua job berjalan sudah tuntas
		log.Println("berhenti bersih")
	case <-time.After(25 * time.Second): // 3. jangan melebihi terminationGracePeriod (Kubernetes default 30 dtk)
		log.Println("batas waktu shutdown habis, keluar paksa")
	}
}`, 'go'),
      table(['Pola', 'Masalah yang dipecahkan', 'Alat'], [
        ['Pipeline', 'Memecah proses menjadi tahap yang berjalan bersamaan', 'Channel tak ber-buffer + `ctx.Done()` di setiap send'],
        ['Fan-out / fan-in', 'Satu tahap lambat dijalankan beberapa goroutine lalu hasilnya digabung', '`gabung[T]` dengan WaitGroup'],
        ['Worker pool berbatas', 'Ribuan tugas tanpa ribuan goroutine aktif', '`errgroup.SetLimit`, atau N worker membaca satu channel'],
        ['Semaphore', 'Membatasi sumber daya (koneksi, memori) lintas fungsi', '`chan struct{}` atau `semaphore.Weighted`'],
        ['Rate limiting', 'Menjaga laju sesuai kuota', '`time.Ticker` (tetap), `rate.Limiter` (token bucket + burst)'],
        ['Graceful cancel', 'Deploy tanpa kehilangan pekerjaan', '`signal.NotifyContext`, `close(jobs)`, `context.WithoutCancel`'],
      ]),
      callout('warn', 'Goroutine leak', 'Setiap `out <- v` yang tidak dibungkus `select` dengan `ctx.Done()` bisa menggantung selamanya bila konsumen berhenti lebih awal, dan goroutine yang menggantung tidak pernah dibersihkan GC. Pasang `go.uber.org/goleak` di tes (`defer goleak.VerifyNone(t)`) dan pantau jumlah goroutine di metrics. Untuk menguji kode yang bergantung pada waktu tanpa menunggu sungguhan, gunakan `testing/synctest` (stabil sejak Go 1.25).'),
      callout('tip', 'Limiter per klien', 'Satu `rate.Limiter` global membatasi seluruh server. Untuk membatasi per IP atau per API key, simpan limiter dalam map yang dilindungi mutex dan bersihkan entri lama secara berkala; contohnya ada di [Keamanan & Hardening](#go.keamanan-hardening). Bila ada banyak instance, batas harus disimpan di tempat bersama seperti Redis.'),
      ...quiz([
        ['GOX-13', 'Pada fungsi `gabung`, mengapa `close(out)` dilakukan di goroutine terpisah setelah `wg.Wait()`, bukan dengan `defer close(out)` di dalam `gabung`?', 'gabung harus segera mengembalikan channel agar pemanggil bisa mulai membaca. Bila close dilakukan saat gabung selesai, channel tertutup sebelum goroutine pembaca mengirim apa pun (panic send on closed channel). Channel hanya boleh ditutup setelah semua pengirim selesai, dan goroutine terpisah yang menunggu WaitGroup memastikan itu tanpa memblok pemanggil.'],
        ['GOX-14', 'Kapan memilih `rate.Limiter` dibanding `time.Ticker`?', 'Ticker memberi interval tetap tanpa burst dan cocok untuk satu loop sederhana. rate.Limiter memakai token bucket: rata-rata laju terjaga, tetapi boleh burst setelah idle; bisa dibagi banyak goroutine; punya Wait (menunggu dengan ctx), Allow (tolak langsung, cocok untuk HTTP 429), dan Reserve. Untuk kuota API pihak ketiga dan middleware server, rate.Limiter biasanya lebih tepat.'],
        ['GOX-15', 'Mengapa job yang sedang berjalan diberi `context.WithoutCancel(ctx)` saat shutdown?', 'ctx dari signal.NotifyContext langsung batal saat SIGTERM. Bila diteruskan apa adanya, semua query dan request di job yang sedang berjalan ikut gagal di tengah jalan. WithoutCancel mempertahankan nilai context (trace id dan sebagainya) tanpa ikut dibatalkan, lalu WithTimeout memberi batas waktu sendiri agar job tetap tidak berjalan selamanya.'],
      ]),
      ...practice('gox-pola-concurrency', [
        'Pipeline tiga tahap (baca CSV → validasi → simpan) berhenti bersih tanpa goroutine leak saat context dibatalkan di tengah; dibuktikan dengan goleak.',
        'Proses 1.000 ID dengan `errgroup.SetLimit(10)` dan buktikan lewat counter atomik bahwa tidak pernah ada lebih dari 10 pemanggilan aktif.',
        'Klien API pihak ketiga memakai `rate.Limiter` 5 rps burst 10; tes memakai `testing/synctest` sehingga tidak perlu menunggu waktu sungguhan.',
        'Worker antrean berhenti dengan SIGTERM tanpa kehilangan job yang sudah diambil, dan keluar paksa setelah 25 detik bila ada job yang macet.',
      ]),
      references(
        ['Go Blog: Pipelines and cancellation', 'https://go.dev/blog/pipelines'],
        ['Go Concurrency Patterns: Context', 'https://go.dev/blog/context'],
        ['golang.org/x/sync/errgroup', 'https://pkg.go.dev/golang.org/x/sync/errgroup'],
        ['golang.org/x/sync/semaphore', 'https://pkg.go.dev/golang.org/x/sync/semaphore'],
        ['golang.org/x/time/rate', 'https://pkg.go.dev/golang.org/x/time/rate'],
        ['testing/synctest', 'https://pkg.go.dev/testing/synctest'],
        ['goleak', 'https://github.com/uber-go/goleak'],
      ),
    ],
  },
  {
    ...src,
    id: 'gox-reflection-struct-tag',
    title: 'Reflection & Struct Tags',
    summary: 'reflect.Type dan reflect.Value, membaca struct tag, mengubah nilai lewat pointer, membuat validator mini berbasis tag, serta kapan reflection sebaiknya tidak dipakai.',
    track: IDIOM, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('`encoding/json`, `database/sql` scanner, GORM, dan validator seperti go-playground/validator bekerja dengan cara yang sama: membaca **struct tag** (`json:"nama"`) lewat paket **reflect** saat runtime. Memahami reflection membuat Anda tahu mengapa field huruf kecil diabaikan JSON, mengapa tag salah ketik tidak menghasilkan error, dan kapan lebih baik memakai generics atau code generation.'),
      code('Type, Value, Kind, dan membaca tag', `package main

import (
	"fmt"
	"reflect"
)

type Transaksi struct {
	ID       int64  \`json:"id" db:"id"\`
	Kategori string \`json:"kategori" db:"kategori" validate:"required"\`
	Jumlah   int64  \`json:"jumlah,omitempty" db:"jumlah" validate:"min=1"\`
	catatan  string // tidak diekspor: reflect bisa melihat, tetapi tidak bisa membaca nilainya lewat Interface()
}

func main() {
	tx := Transaksi{ID: 1, Kategori: "makan", Jumlah: 25000}

	t := reflect.TypeOf(tx)  // informasi tipe (statis)
	v := reflect.ValueOf(tx) // nilai saat ini (salinan!)
	fmt.Println(t.Name(), t.Kind(), t.NumField()) // Transaksi struct 4

	for i := range t.NumField() {
		f := t.Field(i)
		if !f.IsExported() {
			continue
		}
		kolom, ada := f.Tag.Lookup("db") // Lookup membedakan "tidak ada" dan "kosong"
		fmt.Printf("%-8s %-6s db=%q ada=%v json=%q nilai=%v\\n",
			f.Name, f.Type, kolom, ada, f.Tag.Get("json"), v.Field(i).Interface())
	}

	// Mengubah nilai: butuh pointer, lalu Elem() untuk sampai ke struct-nya
	fmt.Println(v.FieldByName("Kategori").CanSet()) // false: v adalah salinan
	rv := reflect.ValueOf(&tx).Elem()
	if f := rv.FieldByName("Kategori"); f.CanSet() {
		f.SetString("transport")
	}
	fmt.Println(tx.Kategori) // transport

	// Tipe dari parameter generik tanpa membuat nilai (Go 1.22+)
	fmt.Println(reflect.TypeFor[Transaksi]().NumField()) // 4
}`, 'go'),
      code('Validator mini berbasis tag', `package validasi

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"unicode/utf8"
)

// Struct menerima struct atau pointer ke struct, lalu memeriksa tag validate:"required,min=N".
func Struct(x any) error {
	v := reflect.ValueOf(x)
	if v.Kind() == reflect.Pointer {
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		return fmt.Errorf("validasi: butuh struct, dapat %s", v.Kind())
	}
	t := v.Type()
	var errs []error
	for i := range t.NumField() {
		sf := t.Field(i)
		aturan, ok := sf.Tag.Lookup("validate")
		if !ok || !sf.IsExported() {
			continue
		}
		fv := v.Field(i)
		for _, r := range strings.Split(aturan, ",") {
			nama, arg, _ := strings.Cut(r, "=")
			switch nama {
			case "required":
				if fv.IsZero() {
					errs = append(errs, fmt.Errorf("%s wajib diisi", sf.Name))
				}
			case "min":
				n, err := strconv.ParseInt(arg, 10, 64)
				if err != nil {
					return fmt.Errorf("tag min tidak valid pada %s: %w", sf.Name, err) // bug programmer
				}
				switch fv.Kind() {
				case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
					if fv.Int() < n {
						errs = append(errs, fmt.Errorf("%s minimal %d", sf.Name, n))
					}
				case reflect.String:
					if int64(utf8.RuneCountInString(fv.String())) < n {
						errs = append(errs, fmt.Errorf("%s minimal %d karakter", sf.Name, n))
					}
				default:
					return fmt.Errorf("min tidak didukung untuk %s (%s)", sf.Name, fv.Kind())
				}
			}
		}
	}
	return errors.Join(errs...) // nil bila tidak ada error
}

// Pemakaian:
//   err := validasi.Struct(&Transaksi{Jumlah: 0})
//   fmt.Println(err) // Kategori wajib diisi
//                    // Jumlah minimal 1`, 'go'),
      table(['Kebutuhan', 'Tanpa reflection', 'Dengan reflection'], [
        ['Fungsi untuk banyak tipe', 'Generics (`func Map[T, U any]`) atau interface', '`reflect.Value` (lambat, tidak type-safe)'],
        ['Mapping struct ke JSON/DB', 'Code generation (sqlc, easyjson, protobuf)', '`encoding/json`, GORM, sqlx'],
        ['Validasi input', 'Method `Validate() error` di setiap tipe', 'Tag `validate:"..."` + library validator'],
        ['Membandingkan struct di tes', '`==` untuk struct comparable, atau `cmp.Equal`', '`reflect.DeepEqual` (pesan gagal kurang jelas)'],
      ]),
      callout('warn', 'Kapan TIDAK memakai reflection', 'Reflection memindahkan error dari saat kompilasi ke saat runtime (panic `call of reflect.Value.SetString on zero Value` bila nama field salah), 10–100 kali lebih lambat dari akses langsung, dan menyulitkan pembaca kode. Pilih urutan ini: kode biasa → interface → generics → code generation → reflection. Bila tetap memakai reflection di jalur panas, hitung metadata per tipe sekali saja lalu simpan di cache (`sync.Map` dengan kunci `reflect.Type`), seperti yang dilakukan encoding/json.'),
      callout('tip', 'Format struct tag', 'Bentuknya `kunci:"nilai"` dipisah spasi, tanpa spasi di sekitar titik dua: `json:"id" db:"id"`. Tag salah format diam-diam diabaikan, tetapi `go vet` (analyzer structtag) melaporkannya. Untuk JSON, `json:"-"` menyembunyikan field, `omitempty` membuang nilai kosong, dan sejak Go 1.24 ada `omitzero` yang memakai zero value atau method `IsZero()` sehingga cocok untuk `time.Time`.'),
      ...quiz([
        ['GOX-16', 'Mengapa `reflect.ValueOf(tx).FieldByName("Kategori").SetString("x")` panic, padahal fieldnya diekspor?', 'ValueOf(tx) menerima salinan nilai tx, sehingga hasilnya tidak addressable dan CanSet() false. Mengubahnya tidak akan berpengaruh ke tx asli, maka reflect menolak dengan panic. Kirim pointer: `reflect.ValueOf(&tx).Elem()` menghasilkan Value yang addressable dan bisa diubah.'],
        ['GOX-17', 'Field `catatan` bertipe string dengan tag `json:"catatan"` tidak pernah muncul di output JSON. Mengapa, dan bagaimana memperbaikinya?', 'Nama field diawali huruf kecil sehingga tidak diekspor. Paket reflect tidak boleh membaca nilai field yang tidak diekspor dari paket lain, sehingga encoding/json melewatinya walau ada tag. Ganti nama menjadi `Catatan` dan pertahankan tag `json:"catatan"` untuk nama di JSON.'],
      ]),
      ...practice('gox-reflection', [
        'Validator mini mendukung `required`, `min`, `max`, dan `email` (cek sederhana dengan `strings.Cut`), lengkap dengan table-driven test.',
        'Fungsi `Kolom[T any]() []string` mengembalikan daftar tag `db` dari struct T memakai `reflect.TypeFor[T]()`, dengan hasil di-cache per tipe.',
        'Benchmark akses field langsung vs lewat reflect (`FieldByName`) dan catat perbedaannya dengan `-benchmem`.',
        'Jalankan `go vet` pada struct dengan tag salah format (misalnya `json: "id"`) dan perbaiki peringatannya.',
      ]),
      references(
        ['Go Blog: The Laws of Reflection', 'https://go.dev/blog/laws-of-reflection'],
        ['reflect', 'https://pkg.go.dev/reflect'],
        ['reflect.StructTag', 'https://pkg.go.dev/reflect#StructTag'],
        ['encoding/json (omitempty, omitzero)', 'https://pkg.go.dev/encoding/json'],
        ['go vet structtag', 'https://pkg.go.dev/golang.org/x/tools/go/analysis/passes/structtag'],
      ),
    ],
  },
  {
    ...src,
    id: 'gox-cli-cobra',
    title: 'Membangun CLI dengan flag & cobra',
    summary: 'Paket flag untuk alat kecil, cobra untuk CLI dengan subcommand, persistent flag, validasi argumen, context dan sinyal, tes command tanpa proses baru, serta versi lewat ldflags.',
    track: IDIOM, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Go sangat populer untuk CLI: kubectl, docker, gh, dan hugo ditulis dengan Go, dan sebagian besar memakai **cobra**. Untuk alat kecil dengan beberapa opsi, paket standar `flag` sudah cukup. Saat CLI tumbuh menjadi beberapa subcommand (`todo add`, `todo list`), cobra memberi struktur, bantuan otomatis, dan shell completion. Prinsip yang sama dengan [Struktur Proyek & DI](#go.struktur-proyek-dependency-injection): logika di paket `internal/`, lapisan CLI hanya menerjemahkan argumen.'),
      code('Paket flag: cukup untuk alat satu perintah', `package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	file := flag.String("file", "todo.json", "lokasi file data")
	semua := flag.Bool("semua", false, "tampilkan juga tugas selesai")
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "pakai: %s [opsi] [kata-kunci]\\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()                 // -file=x.json atau --file x.json; -h menampilkan bantuan

	fmt.Println(*file, *semua, flag.Args()) // flag.Args() = argumen posisi setelah opsi
}`, 'go'),
      code('internal/todo/todo.go — logika yang dipakai CLI', `package todo

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
)

type Tugas struct {
	ID        int    \`json:"id"\`
	Teks      string \`json:"teks"\`
	Prioritas int    \`json:"prioritas"\`
	Selesai   bool   \`json:"selesai"\`
}

type Daftar struct{ Tugas []Tugas \`json:"tugas"\` }

func Muat(path string) (*Daftar, error) {
	b, err := os.ReadFile(path)
	if errors.Is(err, fs.ErrNotExist) {
		return &Daftar{}, nil // belum ada file = daftar kosong
	}
	if err != nil {
		return nil, err
	}
	var d Daftar
	return &d, json.Unmarshal(b, &d)
}

// Simpan menulis file sementara lalu rename agar file lama tidak rusak bila proses mati di tengah.
func (d *Daftar) Simpan(path string) error {
	b, err := json.MarshalIndent(d, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func (d *Daftar) Tambah(teks string, prioritas int) int {
	id := 1
	for _, t := range d.Tugas {
		id = max(id, t.ID+1)
	}
	d.Tugas = append(d.Tugas, Tugas{ID: id, Teks: teks, Prioritas: prioritas})
	return id
}`, 'go'),
      code('cmd/root.go — cobra dengan constructor (bukan variabel global)', `package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"example.com/todo/internal/todo"
)

var version = "dev" // diisi saat build: -ldflags "-X example.com/todo/cmd.version=v1.2.0"

// NewRootCmd membuat pohon command baru setiap dipanggil, sehingga tes tidak saling berbagi state flag.
func NewRootCmd() *cobra.Command {
	var file string
	root := &cobra.Command{
		Use:          "todo",
		Short:        "Pencatat tugas di terminal",
		Version:      version,  // --version otomatis
		SilenceUsage: true,     // error runtime tidak perlu diikuti teks bantuan panjang
	}
	def := "todo.json"
	if v := os.Getenv("TODO_FILE"); v != "" {
		def = v
	}
	// Persistent flag: berlaku untuk root dan semua subcommand
	root.PersistentFlags().StringVarP(&file, "file", "f", def, "lokasi file data")
	root.AddCommand(newAddCmd(&file), newListCmd(&file))
	return root
}

func newAddCmd(file *string) *cobra.Command {
	var prioritas int
	cmd := &cobra.Command{
		Use:     "add <teks>",
		Short:   "Tambah tugas baru",
		Example: "  todo add \\"bayar listrik\\" -p 1",
		Args:    cobra.ExactArgs(1), // validasi jumlah argumen posisi
		RunE: func(cmd *cobra.Command, args []string) error {
			if prioritas < 1 || prioritas > 3 {
				return fmt.Errorf("prioritas harus 1..3, dapat %d", prioritas)
			}
			d, err := todo.Muat(*file)
			if err != nil {
				return fmt.Errorf("muat %s: %w", *file, err)
			}
			id := d.Tambah(args[0], prioritas)
			if err := d.Simpan(*file); err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "ditambahkan #%d\\n", id) // bukan fmt.Println: agar bisa dites
			return nil
		},
	}
	cmd.Flags().IntVarP(&prioritas, "prioritas", "p", 2, "1 (tinggi) sampai 3 (rendah)")
	return cmd
}

func newListCmd(file *string) *cobra.Command {
	var semua bool
	cmd := &cobra.Command{
		Use:     "list",
		Aliases: []string{"ls"},
		Short:   "Tampilkan tugas",
		Args:    cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			_ = cmd.Context() // context dari ExecuteContext: teruskan ke operasi yang bisa lama
			d, err := todo.Muat(*file)
			if err != nil {
				return err
			}
			for _, t := range d.Tugas {
				if semua || !t.Selesai {
					fmt.Fprintf(cmd.OutOrStdout(), "%3d P%d %s\\n", t.ID, t.Prioritas, t.Teks)
				}
			}
			return nil
		},
	}
	cmd.Flags().BoolVarP(&semua, "semua", "a", false, "tampilkan juga yang selesai")
	return cmd
}`, 'go'),
      code('main.go dan cmd/root_test.go', `// main.go
package main

import (
	"context"
	"os"
	"os/signal"

	"example.com/todo/cmd"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	if err := cmd.NewRootCmd().ExecuteContext(ctx); err != nil {
		os.Exit(1) // cobra sudah mencetak "Error: ..." ke stderr
	}
}

// cmd/root_test.go
package cmd

import (
	"bytes"
	"path/filepath"
	"strings"
	"testing"
)

func jalankan(t *testing.T, args ...string) (string, error) {
	t.Helper()
	var out bytes.Buffer
	root := NewRootCmd()
	root.SetOut(&out)
	root.SetErr(&out)
	root.SetArgs(args)
	err := root.Execute()
	return out.String(), err
}

func TestAddLaluList(t *testing.T) {
	file := filepath.Join(t.TempDir(), "t.json")
	if _, err := jalankan(t, "--file", file, "add", "beli kopi", "-p", "1"); err != nil {
		t.Fatal(err)
	}
	out, err := jalankan(t, "-f", file, "ls")
	if err != nil || !strings.Contains(out, "beli kopi") {
		t.Fatalf("list: err=%v out=%q", err, out)
	}
}

func TestPrioritasDiLuarRentang(t *testing.T) {
	_, err := jalankan(t, "-f", filepath.Join(t.TempDir(), "t.json"), "add", "x", "-p", "9")
	if err == nil || !strings.Contains(err.Error(), "prioritas harus") {
		t.Fatalf("ingin error prioritas, dapat %v", err)
	}
}`, 'go'),
      code('Build, versi, dan distribusi', `go mod init example.com/todo
go get github.com/spf13/cobra@latest

go build -ldflags "-s -w -X example.com/todo/cmd.version=v1.2.0" -o bin/todo .
./bin/todo --version            # todo version v1.2.0
./bin/todo completion bash > /etc/bash_completion.d/todo   # shell completion gratis dari cobra

# Pengguna dengan toolchain Go:
go install example.com/todo@latest
# Alternatif versi tanpa ldflags: debug.ReadBuildInfo() berisi versi modul saat dipasang via go install
# Rilis multi-OS + checksum + Homebrew: GoReleaser`, 'bash'),
      table(['Kebutuhan', 'flag (stdlib)', 'cobra'], [
        ['Opsi sederhana', '`flag.String`, `flag.Bool`', '`cmd.Flags().StringVarP` (dengan shorthand `-f`)'],
        ['Subcommand', 'Manual dengan `flag.NewFlagSet` per perintah', '`AddCommand`, alias, bantuan per perintah'],
        ['Validasi argumen posisi', 'Manual', '`cobra.ExactArgs`, `MinimumNArgs`, `NoArgs`'],
        ['Flag untuk semua subcommand', 'Manual', '`PersistentFlags()`'],
        ['Bantuan dan completion', '`-h` dasar', '`--help`, `completion bash/zsh/fish/powershell`'],
        ['Konfigurasi file + env', 'Manual', 'Sering dipasangkan dengan viper (opsional, menambah dependensi)'],
      ]),
      callout('tip', 'Buat CLI yang bisa dites', 'Gunakan constructor `NewRootCmd()` daripada variabel global `rootCmd` (bawaan generator `cobra-cli`), tulis output ke `cmd.OutOrStdout()` dan error ke `cmd.ErrOrStderr()`, dan kembalikan error dari `RunE` alih-alih memanggil `os.Exit` di tengah command. Dengan begitu tes cukup memanggil `SetArgs` dan `Execute` tanpa membuat proses baru.'),
      ...quiz([
        ['GOX-18', 'Mengapa command cobra di tes kedua kadang membawa nilai flag dari tes pertama bila memakai variabel global `rootCmd`?', 'Variabel flag dan objek command global dibuat sekali per proses. Flag yang di-parse di tes pertama tetap tersimpan, sehingga tes berikutnya mewarisinya. Constructor NewRootCmd membuat command dan variabel flag baru di setiap pemanggilan, sehingga setiap tes terisolasi.'],
        ['GOX-19', 'Apa beda `Run` dan `RunE` pada cobra.Command, dan mengapa `RunE` lebih disukai?', 'Run tidak mengembalikan apa pun, sehingga error harus dicetak dan os.Exit dipanggil di dalam command, yang menyulitkan tes dan melewati defer. RunE mengembalikan error ke Execute, yang mencetak pesan secara konsisten dan membiarkan main menentukan exit code.'],
      ]),
      ...practice('gox-cli-cobra', [
        'CLI `todo` punya subcommand `add`, `list`, `done <id>`, dan `rm <id>` dengan validasi argumen dan pesan error yang jelas.',
        'Flag `--file` berlaku di semua subcommand dan bisa diisi lewat env `TODO_FILE`; urutan prioritas (flag > env > default) dibuktikan dengan tes.',
        'Minimal empat tes command memakai `SetArgs` dan `SetOut`, termasuk kasus error.',
        '`todo --version` menampilkan versi dari `-ldflags -X`, dan binary untuk linux/amd64, darwin/arm64, dan windows/amd64 dibangun dengan `GOOS`/`GOARCH`.',
      ]),
      references(
        ['flag', 'https://pkg.go.dev/flag'],
        ['cobra', 'https://github.com/spf13/cobra'],
        ['cobra user guide', 'https://github.com/spf13/cobra/blob/main/site/content/user_guide.md'],
        ['Go: Command-line interfaces', 'https://go.dev/solutions/clis'],
        ['GoReleaser', 'https://goreleaser.com/'],
      ),
    ],
  },
  {
    ...src,
    id: 'gox-realtime-websocket-sse',
    title: 'Realtime: Server-Sent Events, WebSocket & Hub Broadcast',
    summary: 'SSE dengan net/http dan ResponseController, WebSocket dengan coder/websocket, hub broadcast yang tahan klien lambat, heartbeat, reconnect di klien, serta keamanan dan skala.',
    track: WEB_DB, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Dashboard saldo yang langsung berubah saat transaksi masuk, notifikasi, progress upload, dan chat butuh server yang bisa **mengirim data tanpa diminta**. Ada dua pilihan utama. **Server-Sent Events (SSE)** adalah HTTP biasa yang tetap terbuka dan mengalir satu arah dari server ke klien, didukung browser lewat `EventSource` dengan reconnect otomatis. **WebSocket** adalah koneksi dua arah penuh, cocok bila klien juga sering mengirim (chat, game, kolaborasi). Keduanya memakai pola **hub** yang sama untuk menyiarkan pesan ke banyak klien.'),
      table(['Aspek', 'Polling', 'SSE', 'WebSocket'], [
        ['Arah', 'Klien bertanya berulang', 'Server → klien', 'Dua arah'],
        ['Protokol', 'HTTP biasa', 'HTTP (text/event-stream)', 'Upgrade ke protokol ws/wss'],
        ['Reconnect', 'Tidak perlu', 'Otomatis oleh browser (+ Last-Event-ID)', 'Harus ditulis sendiri'],
        ['Data', 'Apa saja', 'Teks UTF-8', 'Teks dan biner'],
        ['Cocok untuk', 'Update jarang', 'Notifikasi, feed, progress, harga', 'Chat, game, editor kolaboratif'],
      ]),
      code('hub.go — broadcast yang tidak macet karena satu klien lambat', `package realtime

import "sync"

type Hub struct {
	mu    sync.Mutex
	klien map[chan []byte]struct{}
}

func NewHub() *Hub { return &Hub{klien: make(map[chan []byte]struct{})} }

// Gabung mendaftarkan klien baru; panggil fungsi kembalian saat klien pergi.
func (h *Hub) Gabung() (<-chan []byte, func()) {
	ch := make(chan []byte, 16) // buffer kecil per klien
	h.mu.Lock()
	h.klien[ch] = struct{}{}
	h.mu.Unlock()
	return ch, func() {
		h.mu.Lock()
		delete(h.klien, ch) // channel tidak di-close: tidak ada risiko send ke channel tertutup
		h.mu.Unlock()
	}
}

func (h *Hub) Siarkan(pesan []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.klien {
		select {
		case ch <- pesan:
		default: // buffer penuh = klien terlalu lambat; lewati agar klien lain tidak ikut tertahan
		}
	}
}

func (h *Hub) Jumlah() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.klien)
}`, 'go'),
      code('sse.go — Server-Sent Events dengan heartbeat', `package realtime

import (
	"fmt"
	"net/http"
	"time"
)

func (h *Hub) SSE(w http.ResponseWriter, r *http.Request) {
	rc := http.NewResponseController(w)
	// Server dengan WriteTimeout akan memutus stream panjang; matikan khusus untuk request ini
	_ = rc.SetWriteDeadline(time.Time{})

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no") // nginx: jangan menahan (buffer) respons

	ch, keluar := h.Gabung()
	defer keluar()

	fmt.Fprint(w, "retry: 3000\\n\\n") // browser menunggu 3 detik sebelum reconnect
	if err := rc.Flush(); err != nil {
		return
	}
	// Saat reconnect, browser mengirim header Last-Event-ID: bisa dipakai untuk mengirim ulang yang terlewat
	_ = r.Header.Get("Last-Event-ID")

	detak := time.NewTicker(25 * time.Second)
	defer detak.Stop()
	id := 0
	for {
		select {
		case <-r.Context().Done(): // tab ditutup atau koneksi putus
			return
		case pesan := <-ch:
			id++
			fmt.Fprintf(w, "id: %d\\nevent: saldo\\ndata: %s\\n\\n", id, pesan) // satu event diakhiri baris kosong
		case <-detak.C:
			fmt.Fprint(w, ": ping\\n\\n") // baris komentar: menjaga koneksi tetap hidup di proxy/load balancer
		}
		if err := rc.Flush(); err != nil {
			return
		}
	}
}`, 'go'),
      code('ws.go — WebSocket dengan coder/websocket', `package realtime

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/coder/websocket"        // go get github.com/coder/websocket
	"github.com/coder/websocket/wsjson"
)

type PesanChat struct {
	Dari string \`json:"dari"\`
	Teks string \`json:"teks"\`
}

func (h *Hub) WS(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		// Tolak origin lain (Cross-Site WebSocket Hijacking). Default: hanya origin yang sama.
		OriginPatterns: []string{"app.contoh.id", "localhost:5173"},
	})
	if err != nil {
		return // Accept sudah menulis respons error
	}
	defer c.CloseNow()
	c.SetReadLimit(4096) // pesan lebih besar dari 4 KB memutus koneksi

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()
	ch, keluar := h.Gabung()
	defer keluar()

	// Goroutine penulis: broadcast + heartbeat
	go func() {
		defer cancel()
		detak := time.NewTicker(30 * time.Second)
		defer detak.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case pesan := <-ch:
				wctx, batal := context.WithTimeout(ctx, 5*time.Second)
				err := c.Write(wctx, websocket.MessageText, pesan)
				batal()
				if err != nil {
					return
				}
			case <-detak.C:
				pctx, batal := context.WithTimeout(ctx, 10*time.Second)
				err := c.Ping(pctx) // menunggu pong; butuh loop pembaca yang aktif (di bawah)
				batal()
				if err != nil {
					return // klien hilang tanpa menutup koneksi
				}
			}
		}
	}()

	// Loop pembaca: pesan dari klien disiarkan ke semua
	for {
		var m PesanChat
		if err := wsjson.Read(ctx, c, &m); err != nil {
			// websocket.CloseStatus(err) == websocket.StatusNormalClosure: klien menutup dengan normal
			return
		}
		if b, err := json.Marshal(m); err == nil {
			h.Siarkan(b)
		}
	}
}

// Routing (Go 1.22+):
//   mux.HandleFunc("GET /events", hub.SSE)
//   mux.HandleFunc("GET /ws", hub.WS)`, 'go'),
      code('Klien di browser', `// SSE: reconnect otomatis
const es = new EventSource('/events', { withCredentials: true });
es.addEventListener('saldo', (e) => tampilkanSaldo(JSON.parse(e.data)));
es.onerror = () => console.log('terputus; browser akan mencoba lagi');

// WebSocket: reconnect ditulis sendiri, dengan backoff + jitter agar server tidak diserbu bersamaan
let jeda = 1000;
function sambung() {
  const ws = new WebSocket(\`\${location.protocol === 'https:' ? 'wss' : 'ws'}://\${location.host}/ws\`);
  ws.onopen = () => { jeda = 1000; ws.send(JSON.stringify({ dari: 'ani', teks: 'halo' })); };
  ws.onmessage = (e) => tampilkanPesan(JSON.parse(e.data));
  ws.onclose = () => {
    setTimeout(sambung, jeda + Math.random() * 1000);
    jeda = Math.min(jeda * 2, 30000);
  };
}
sambung();`, 'js'),
      callout('warn', 'Autentikasi dan keamanan', 'Browser tidak bisa menambahkan header `Authorization` pada `EventSource` maupun `new WebSocket()`. Pakai cookie sesi (HttpOnly, SameSite) yang dikirim otomatis, atau token berumur pendek di query string yang ditukar dari endpoint terautentikasi (lihat [Authentication dengan JWT](#go.authentication-dengan-jwt)); jangan menaruh token jangka panjang di URL karena tercatat di log. Untuk WebSocket, selalu batasi origin, ukuran pesan, dan jumlah koneksi per pengguna.'),
      callout('info', 'Skala ke banyak instance', 'Hub di atas hanya mengenal klien di proses yang sama. Bila API berjalan di beberapa instance di balik load balancer, siarkan pesan lewat pub/sub (Redis Pub/Sub, NATS, atau Postgres LISTEN/NOTIFY) dan setiap instance meneruskannya ke hub lokalnya. Pantau jumlah koneksi aktif (`hub.Jumlah()`) di metrics dan naikkan batas file descriptor di server.'),
      ...quiz([
        ['GOX-20', 'Mengapa `Siarkan` memakai `select` dengan `default` alih-alih langsung `ch <- pesan`?', 'Send langsung memblok bila buffer klien penuh. Karena Siarkan memegang mutex dan berjalan untuk semua klien, satu klien lambat (jaringan buruk, tab di background) akan menahan siaran ke semua klien lain. Dengan default, pesan untuk klien lambat dilewati (atau klien itu bisa diputus), dan klien lain tetap menerima tepat waktu.'],
        ['GOX-21', 'Stream SSE selalu terputus tepat setelah 30 detik di produksi, padahal lancar di lokal. Apa dua penyebab yang paling mungkin?', 'Pertama, `http.Server.WriteTimeout` (misalnya 30 detik) berlaku untuk seluruh respons, termasuk stream; matikan per request dengan `ResponseController.SetWriteDeadline(time.Time{})`. Kedua, proxy atau load balancer menutup koneksi yang idle; kirim heartbeat (baris komentar `: ping`) lebih sering dari batas idle-nya, dan matikan buffering proxy.'],
      ]),
      ...practice('gox-realtime', [
        'Endpoint `GET /events` mengirim event `saldo` setiap kali `POST /transaksi` berhasil, diuji dengan `curl -N` dan EventSource di browser.',
        'Hub punya tes dengan 100 klien, termasuk satu klien yang tidak pernah membaca, dan siaran ke klien lain tetap selesai di bawah 100 ms.',
        'Chat WebSocket menolak origin lain, memutus pesan di atas 4 KB, dan mendeteksi klien hilang lewat ping dalam 40 detik.',
        'Klien React tersambung ulang otomatis dengan backoff saat server di-restart, tanpa duplikasi listener.',
      ]),
      references(
        ['MDN: Using server-sent events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events'],
        ['net/http.ResponseController', 'https://pkg.go.dev/net/http#ResponseController'],
        ['coder/websocket', 'https://github.com/coder/websocket'],
        ['gorilla/websocket (alternatif)', 'https://github.com/gorilla/websocket'],
        ['MDN: WebSocket API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'],
        ['OWASP: WebSocket Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html'],
      ),
    ],
  },
  {
    ...src,
    id: 'gox-runtime-gc-tuning',
    title: 'Runtime & GC Tuning: Scheduler GMP, GOGC, GOMEMLIMIT, GOMAXPROCS & runtime/trace',
    summary: 'Cara scheduler G-M-P bekerja, cara GC menentukan target heap, menyetel GOGC dan GOMEMLIMIT di container, GOMAXPROCS yang sadar cgroup, membaca runtime/metrics dan gctrace, serta merekam runtime/trace dan flight recorder.',
    track: TESTING, duration: '2–3 jam', level: 'Hard',
    blocks: [
      paragraph('[Memori, Escape Analysis & sync.Pool](#go.memori-escape-analysis-sync-pool) membahas cara mengurangi alokasi, dan [Profiling (pprof)](#go.profiling-pprof) menunjukkan fungsi mana yang boros. Modul ini naik satu tingkat ke **runtime**: bagaimana goroutine dijadwalkan ke thread OS, kapan GC berjalan, dan tombol apa yang bisa diputar saat aplikasi berjalan di container dengan batas CPU dan memori. Kebanyakan aplikasi tidak perlu menyentuh pengaturan default. Yang perlu adalah memahami gejalanya: OOMKilled di Kubernetes, latensi p99 yang melonjak, atau CPU throttling.'),
      heading('Scheduler G-M-P'),
      code('Model mental', `G = goroutine     : stack kecil (mulai ~2 KB, tumbuh sesuai kebutuhan), jutaan pun murah
M = machine       : thread OS yang benar-benar menjalankan kode
P = processor     : "izin" menjalankan kode Go; jumlahnya = GOMAXPROCS

  P0 [run queue lokal: G G G]  --dipasang ke-->  M0 (thread)
  P1 [run queue lokal: G G  ]  --dipasang ke-->  M1 (thread)
         ^
         |  work stealing: P yang kosong mencuri setengah antrean P lain,
         |  lalu mengambil dari run queue global dan network poller
         v
  Network poller (epoll/kqueue/IOCP): goroutine yang menunggu socket tidak memakai thread

- Syscall blocking: M ikut terblok, P dilepas dan dipasang ke M lain agar G lain tetap jalan.
- Preemption asinkron (sejak Go 1.14): loop CPU panjang tanpa pemanggilan fungsi tetap bisa diinterupsi.
- GOMAXPROCS membatasi berapa G yang menjalankan kode Go SECARA PARALEL, bukan jumlah goroutine.`, 'text'),
      heading('GC: GOGC dan GOMEMLIMIT'),
      paragraph('GC Go bersifat *concurrent mark-sweep*: sebagian besar kerja berjalan bersamaan dengan aplikasi, dengan jeda stop-the-world yang sangat singkat. Kapan GC dimulai ditentukan oleh **target heap**: kira-kira `live heap + (live heap + GC roots) × GOGC/100`. Dengan GOGC=100 (default), heap boleh tumbuh sekitar dua kali live heap sebelum siklus berikutnya. **GOMEMLIMIT** (Go 1.19+) menambahkan batas lunak total memori runtime: saat mendekati batas, GC berjalan lebih sering walau target GOGC belum tercapai.'),
      code('Mengamati GC dan menyetel lewat environment', `# Satu baris per siklus GC ke stderr
GODEBUG=gctrace=1 ./kas-api
# gc 12 @3.201s 1%: 0.031+2.1+0.018 ms clock, ... 48->49->24 MB, 50 MB goal, ... 8 P
#        |      |                                  |   |   |      |
#        |      +-- % CPU dipakai GC sejak start   |   |   |      +-- target heap siklus berikutnya
#        +-- waktu sejak start                     |   |   +-- live heap setelah mark
#                                    heap saat mulai   +-- heap saat selesai

GOGC=200 ./kas-api                      # GC lebih jarang, CPU GC turun, memori puncak naik
GOMEMLIMIT=900MiB ./kas-api             # batas lunak; satuan B, KiB, MiB, GiB
GOGC=off GOMEMLIMIT=900MiB ./kas-api    # GC hanya saat mendekati batas: hemat CPU, tetapi berbahaya
                                        # bila live heap tumbuh mendekati batas (GC berjalan terus-menerus)`, 'bash'),
      code('Membaca runtime/metrics dan menyetel dari kode', `package main

import (
	"fmt"
	"runtime"
	"runtime/debug"
	"runtime/metrics"
)

func laporRuntime() {
	sampel := []metrics.Sample{
		{Name: "/gc/heap/goal:bytes"},
		{Name: "/gc/heap/live:bytes"},
		{Name: "/gc/gogc:percent"},
		{Name: "/gc/gomemlimit:bytes"},
		{Name: "/gc/cycles/total:gc-cycles"},
		{Name: "/sched/gomaxprocs:threads"},
		{Name: "/sched/goroutines:goroutines"},
	}
	metrics.Read(sampel)
	for _, s := range sampel {
		if s.Value.Kind() == metrics.KindUint64 { // KindBad = metrik tidak dikenal di versi Go ini
			fmt.Printf("%-30s %d\\n", s.Name, s.Value.Uint64())
		}
	}
	fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0), "NumCPU:", runtime.NumCPU()) // argumen 0 = hanya baca
}

func main() {
	// Setara dengan env var; berguna bila nilai dihitung saat start (misalnya dari konfigurasi)
	debug.SetMemoryLimit(900 << 20) // 900 MiB
	debug.SetGCPercent(150)
	laporRuntime()
}`, 'go'),
      heading('Container: GOMAXPROCS dan batas memori'),
      code('Deployment Kubernetes', `apiVersion: apps/v1
kind: Deployment
metadata:
  name: kas-api
spec:
  template:
    spec:
      containers:
        - name: api
          image: registry.contoh.id/kas-api:1.4.0
          resources:
            requests: { cpu: "500m", memory: 512Mi }
            limits:   { cpu: "2",    memory: 1Gi }
          env:
            # Sekitar 90% dari limit: sisakan ruang untuk memori di luar heap Go (cgo, mmap, page cache)
            - name: GOMEMLIMIT
              value: "900MiB"
            # GOMAXPROCS sengaja TIDAK diset: Go 1.25+ membacanya dari batas CPU cgroup.
            # Untuk Go < 1.25: import _ "go.uber.org/automaxprocs" di main.`, 'yaml'),
      table(['Pengaturan', 'Default', 'Kapan diubah', 'Risiko'], [
        ['`GOGC`', '100', 'CPU GC tinggi di profil dan memori masih longgar → naikkan', 'Memori puncak naik'],
        ['`GOMEMLIMIT`', 'Tanpa batas', 'Selalu di container dengan limit memori: ~90% limit', 'Terlalu rendah → GC berjalan terus (thrashing), latensi naik'],
        ['`GOMAXPROCS`', 'Go 1.25+: min(core, batas CPU cgroup)', 'Jarang; misalnya sengaja membatasi paralelisme', 'Lebih besar dari kuota CPU → throttling dan lonjakan p99'],
        ['`GODEBUG=gctrace=1`', 'Mati', 'Investigasi sementara', 'Log stderr sangat ramai'],
        ['`debug.SetMemoryLimit` / `SetGCPercent`', '-', 'Nilai dihitung saat runtime', 'Tersebar di kode; dokumentasikan'],
      ]),
      callout('info', 'GOMAXPROCS sadar container (Go 1.25+)', 'Sebelum Go 1.25, GOMAXPROCS sama dengan jumlah core host, sehingga pod dengan limit 2 CPU di node 64 core menjalankan 64 thread paralel dan terkena CPU throttling berat; solusinya `go.uber.org/automaxprocs`. Sejak Go 1.25, di Linux runtime membaca batas CPU cgroup dan memperbaruinya bila batas berubah, selama GOMAXPROCS tidak diset manual dan baris `go` di go.mod minimal 1.25. Untuk GOMEMLIMIT tidak ada deteksi otomatis bawaan; set lewat env, atau gunakan paket seperti `github.com/KimMachineGun/automemlimit`.'),
      heading('runtime/trace dan flight recorder'),
      paragraph('pprof menjawab *fungsi mana yang memakan CPU atau memori*. **Execution trace** menjawab *apa yang terjadi dari waktu ke waktu*: goroutine yang menunggu lama di run queue, jeda GC, lock contention, dan goroutine yang terblok di syscall atau channel. Ini alat yang tepat untuk lonjakan latensi yang tidak terlihat di profil CPU.'),
      code('Merekam trace dan menandai bagian penting', `// Dari tes:      go test -trace=trace.out ./internal/checkout
// Dari server:   curl -o trace.out "http://localhost:6060/debug/pprof/trace?seconds=5"
// Analisis:      go tool trace trace.out    (UI di browser: timeline per P, GC, goroutine)

import (
	"context"
	"os"
	"runtime/trace"
	"time"
)

func checkout(ctx context.Context, id int64) error {
	ctx, task := trace.NewTask(ctx, "checkout")   // muncul sebagai satu "task" di go tool trace
	defer task.End()

	trace.WithRegion(ctx, "validasi-stok", func() { validasi(ctx, id) })
	trace.Log(ctx, "pesanan", "id dicatat")
	return bayar(ctx, id)
}

// Flight recorder (Go 1.25+): trace terus direkam di buffer melingkar di memori,
// lalu disimpan ke file hanya saat terjadi masalah. Cocok untuk lonjakan latensi yang jarang.
var fr = trace.NewFlightRecorder(trace.FlightRecorderConfig{
	MinAge:   10 * time.Second, // simpan setidaknya 10 detik terakhir
	MaxBytes: 16 << 20,         // batas ukuran buffer
})

func pasangFlightRecorder() error { return fr.Start() }

func simpanBilaLambat(durasi time.Duration) {
	if durasi < 2*time.Second || !fr.Enabled() {
		return
	}
	f, err := os.Create("lambat-" + time.Now().Format("150405") + ".trace")
	if err != nil {
		return
	}
	defer f.Close()
	_, _ = fr.WriteTo(f) // buka dengan go tool trace
}`, 'go'),
      callout('tip', 'Urutan kerja tuning', 'Mulai dari metrik: live heap, target heap, CPU yang dipakai GC (`gctrace` atau `/gc/...`), jumlah goroutine, dan CPU throttling container. Kurangi alokasi lebih dulu (dampaknya paling besar dan permanen), set GOMEMLIMIT sesuai limit container, lalu baru pertimbangkan GOGC. Setiap perubahan dibuktikan dengan benchmark atau load test, bukan dugaan. Rilis Go terbaru juga terus memperbaiki GC (misalnya GC "Green Tea" yang mulai diperkenalkan sebagai eksperimen di Go 1.25), jadi cek release notes sebelum tuning manual yang rumit.'),
      ...quiz([
        ['GOX-22', 'Pod dengan limit memori 1 GiB terus OOMKilled padahal live heap aplikasi hanya sekitar 600 MB. Mengapa bisa terjadi, dan apa perbaikan pertamanya?', 'Dengan GOGC=100, target heap kira-kira dua kali live heap, yaitu sekitar 1,2 GB, melebihi limit container sebelum GC sempat berjalan. Runtime tidak tahu ada batas 1 GiB. Set GOMEMLIMIT sekitar 900MiB agar GC berjalan lebih sering saat mendekati batas; bila live heap memang tumbuh terus, cari kebocoran dengan profil heap.'],
        ['GOX-23', 'Aplikasi Go 1.22 di pod dengan limit 2 CPU pada node 32 core menunjukkan p99 latensi buruk dan metrik throttling tinggi. Apa penyebab dan solusinya?', 'Sebelum Go 1.25, GOMAXPROCS = jumlah core host (32), sehingga runtime menjalankan hingga 32 thread paralel. Kuota CFS 2 CPU habis di awal setiap periode dan container di-throttle sampai periode berikutnya. Solusinya import `go.uber.org/automaxprocs`, set GOMAXPROCS=2 lewat env, atau upgrade ke Go 1.25+ (dengan go.mod `go 1.25` atau lebih baru) yang membaca batas CPU cgroup secara otomatis.'],
        ['GOX-24', 'Kapan memakai execution trace (`go tool trace`) dibanding profil CPU pprof?', 'pprof CPU menunjukkan fungsi yang paling banyak memakai CPU secara agregat. Execution trace menunjukkan urutan kejadian per goroutine dan per P: berapa lama goroutine menunggu dijadwalkan, terblok di channel/lock/syscall, dan kapan GC menjeda. Lonjakan latensi tanpa CPU tinggi biasanya hanya terlihat di trace.'],
      ]),
      ...practice('gox-runtime-gc', [
        'Jalankan API dengan `GODEBUG=gctrace=1` di bawah load test, lalu catat live heap, target heap, dan persentase CPU GC untuk GOGC=100 dan GOGC=200.',
        'Ekspos metrik runtime (`/gc/heap/live:bytes`, `/gc/heap/goal:bytes`, `/sched/goroutines:goroutines`) ke Prometheus atau endpoint JSON internal.',
        'Deploy ke container dengan limit memori 256 MiB, picu OOM dengan beban besar, lalu buktikan GOMEMLIMIT=230MiB mencegahnya (atau jelaskan mengapa tidak bila live heap memang terlalu besar).',
        'Pasang flight recorder yang menyimpan trace saat request lebih dari 2 detik, picu satu request lambat, dan analisis file hasilnya dengan `go tool trace`.',
      ]),
      references(
        ['A Guide to the Go Garbage Collector', 'https://go.dev/doc/gc-guide'],
        ['runtime (GOGC, GOMEMLIMIT, GOMAXPROCS, GODEBUG)', 'https://pkg.go.dev/runtime'],
        ['runtime/metrics', 'https://pkg.go.dev/runtime/metrics'],
        ['runtime/trace', 'https://pkg.go.dev/runtime/trace'],
        ['Go Blog: Container-aware GOMAXPROCS', 'https://go.dev/blog/container-aware-gomaxprocs'],
        ['Go Blog: Flight Recorder in Go 1.25', 'https://go.dev/blog/flight-recorder'],
        ['Go 1.25 Release Notes', 'https://go.dev/doc/go1.25'],
      ),
    ],
  },
];
