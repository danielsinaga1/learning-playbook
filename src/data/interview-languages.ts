import type { Block, Module, QAItem, Track } from '../types';
import { callout, code, heading, paragraph, references, table } from './lesson-kit';

/*
 * Interview Prep per bahasa: Go, Python & AI Engineer, TypeScript & Node.js, Kotlin & C#/.NET,
 * plus strategi menjawab & pertanyaan behavioral. Status latihan disimpan per kurikulum
 * ("interview.<qaId>"), jadi awalan GOI-/PYI-/TSI-/KTI-/CSI-/BHV- cukup unik di kurikulum interview.
 */

const GO = 'Go';
const PY = 'Python & AI Engineer';
const TS = 'TypeScript & Node.js';
const KT_CS = 'Kotlin & C#/.NET';
const STRATEGI = 'Cara Menjawab';

export const interviewLanguageTracks: Track[] = [
  { title: GO, summary: 'Goroutine, channel, context, race, slice/map, interface, error, generics, GC, testing, plus soal coding.' },
  { title: PY, summary: 'Mutability, GIL & asyncio, generator, decorator, typing, FastAPI, lalu RAG, eval, prompt injection, agent, biaya.' },
  { title: TS, summary: 'Event loop, closure, this, sistem tipe TypeScript, streams, worker threads, ESM/CJS, memory leak, keamanan API.' },
  { title: KT_CS, summary: 'Kotlin: null safety, sealed class, coroutines, Flow. C#: async/await, LINQ, DI lifetime, EF Core, records, NRT.' },
  { title: STRATEGI, summary: 'Alur interview teknis, metode STAR, 8 pertanyaan behavioral, dan pertanyaan balik untuk interviewer.' },
];

export const interviewLanguageSource =
  'Interview per bahasa: disusun dari dokumentasi resmi Go, Python, TypeScript, Node.js, Kotlin, dan .NET (30 Oktober 2026)';

const ul = (...items: string[]): Block => ({ type: 'list', items });
const ol = (...items: string[]): Block => ({ type: 'list', items, ordered: true });
const followUp = (text: string): Block => callout('tip', 'Follow-up umum', text);
const trap = (text: string): Block => callout('warn', 'Jebakan', text);
const learn = (...links: [label: string, href: string][]): Block =>
  paragraph(`Materi terkait: ${links.map(([label, href]) => `[${label}](${href})`).join(', ')}.`);
const qa = (id: string, q: string, a: Block[], prompt?: Block[]): QAItem => (prompt ? { id, q, prompt, a } : { id, q, a });
const howTo: Block = callout(
  'tip',
  'Cara latihan',
  'Jawab dulu di kepala (atau ucapkan keras-keras seperti sedang interview), baru buka jawabannya. Setelah membaca, tandai **Paham** atau **Ulangi**, lalu pakai filter *Ulangi* untuk sesi review berikutnya. Jawaban di sini sengaja padat: kembangkan dengan pengalamanmu sendiri.',
);

/* ───────────────────────────── Go ───────────────────────────── */

const goModule: Omit<Module, 'code'> = {
  id: 'iv-go',
  title: 'Interview Go',
  summary: '15 soal Go level menengah-senior: konkurensi (goroutine, channel, select, sync, context, race), slice & map, interface, error, defer, generics, GC, layout proyek, testing, dan soal coding worker pool.',
  track: GO,
  source: interviewLanguageSource,
  duration: '75 menit',
  level: 'Hard',
  blocks: [
    howTo,
    heading('Konkurensi'),
    {
      type: 'qa',
      items: [
        qa('GOI-01', 'Apa beda goroutine dengan OS thread? Bagaimana scheduler Go bekerja?', [
          table(['Aspek', 'Goroutine', 'OS thread'], [
            ['Dikelola oleh', 'Runtime Go (user space)', 'Kernel OS'],
            ['Stack awal', 'Kecil (beberapa KB), tumbuh/menyusut otomatis', 'Tetap, biasanya ~1–8 MB'],
            ['Biaya buat & context switch', 'Sangat murah, tanpa syscall', 'Mahal, lewat kernel'],
            ['Jumlah realistis', 'Ratusan ribu sampai jutaan', 'Ribuan'],
          ]),
          paragraph('Scheduler Go memakai model **M:N** dengan tiga entitas: **G** (goroutine), **M** (machine = OS thread), dan **P** (processor, konteks eksekusi yang memegang run queue lokal). Jumlah P = `GOMAXPROCS` (default jumlah CPU; versi Go terbaru di Linux juga memperhitungkan batas CPU cgroup container). P yang kosong mencuri goroutine dari P lain (*work stealing*). Saat goroutine melakukan syscall blocking, M dilepas dari P supaya P bisa dipakai M lain. Network I/O memakai *netpoller* (epoll/kqueue) sehingga goroutine yang menunggu socket tidak memakan thread.'),
          paragraph('Sejak Go mendukung *asynchronous preemption*, goroutine dengan loop ketat tanpa function call tetap bisa di-preempt, jadi satu goroutine tidak bisa memonopoli P selamanya.'),
          followUp('"Apakah goroutine gratis?" Tidak: tiap goroutine tetap memakan memori stack dan bisa **bocor** bila menunggu channel yang tidak pernah dikirim. Selalu pikirkan *bagaimana goroutine ini berhenti*.'),
          learn(['Goroutine, Channel & Concurrency', '#go.goroutine-channel-concurrency-di-go']),
        ]),
        qa('GOI-02', 'Jelaskan channel unbuffered vs buffered. Apa yang terjadi saat send/receive ke channel nil atau yang sudah di-close?', [
          ul(
            '**Unbuffered** (`make(chan T)`): send menunggu sampai ada receiver, dan sebaliknya. Ini *handoff sinkron* yang sekaligus menjadi titik sinkronisasi (happens-before).',
            '**Buffered** (`make(chan T, n)`): send hanya blok bila buffer penuh, receive blok bila buffer kosong. Berguna sebagai antrean atau semaphore (`make(chan struct{}, 10)`), bukan untuk "mempercepat" kode yang desainnya salah.',
          ),
          table(['Operasi', 'Channel nil', 'Channel tertutup'], [
            ['Send `ch <- v`', 'Blok selamanya', '**panic**'],
            ['Receive `<-ch`', 'Blok selamanya', 'Langsung dapat zero value, `ok == false`'],
            ['`close(ch)`', '**panic**', '**panic** (close dua kali)'],
          ]),
          ul(
            'Aturan praktis: **yang mengirim yang menutup**, dan hanya bila receiver perlu tahu data sudah habis (misalnya untuk `for v := range ch`).',
            'Channel nil berguna di `select` untuk mematikan sebuah case secara dinamis.',
          ),
          followUp('"Kapan pakai channel, kapan mutex?" Channel untuk memindahkan kepemilikan data atau mengoordinasikan alur kerja; mutex untuk melindungi state bersama yang sederhana (cache, counter). Jangan memaksakan channel untuk semua hal.'),
        ]),
        qa('GOI-03', 'Bagaimana `select` bekerja? Bagaimana membuat timeout dan operasi non-blocking?', [
          ul(
            '`select` menunggu sampai salah satu case siap. Bila beberapa siap sekaligus, Go memilih **secara acak** (bukan urutan penulisan) supaya tidak ada case yang kelaparan.',
            'Ada `default` → `select` tidak pernah blok (try-send / try-receive).',
            'Tanpa case sama sekali (`select {}`) → blok selamanya.',
          ),
          code('Timeout, pembatalan, dan non-blocking', `select {
case res := <-resultCh:
    return res, nil
case <-ctx.Done():               // dibatalkan atau deadline lewat
    return nil, ctx.Err()
case <-time.After(2 * time.Second):
    return nil, errors.New("timeout")
}

// Non-blocking send: buang event bila buffer penuh
select {
case events <- e:
default:
    dropped.Add(1)
}`, 'go'),
          trap('`time.After` di dalam loop panas membuat timer baru setiap iterasi. Versi Go modern sudah bisa meng-GC timer yang tidak direferensikan, tetapi untuk loop lebih rapi memakai satu `time.NewTimer`/`Ticker` atau `context.WithTimeout` di luar loop.'),
        ]),
        qa('GOI-04', 'Kapan memakai `sync.WaitGroup`, `sync.Mutex`/`RWMutex`, dan kenapa map biasa tidak aman dipakai bersamaan?', [
          ul(
            '**WaitGroup**: menunggu sekumpulan goroutine selesai. Panggil `Add` *sebelum* `go`, `Done` lewat `defer`. Versi Go terbaru juga punya `wg.Go(func(){...})` yang membungkus Add/Done.',
            '**Mutex**: melindungi critical section. **RWMutex** hanya menguntungkan bila pembacaan jauh lebih banyak dan critical section cukup panjang; untuk kasus kecil sering malah lebih lambat.',
            'Mutex **tidak boleh di-copy** setelah dipakai (struct berisi mutex harus diteruskan via pointer). `go vet` (copylocks) menangkap ini.',
          ),
          paragraph('**Map bawaan tidak aman untuk konkurensi**: tulis bersamaan (atau tulis + baca) adalah data race, dan runtime bisa menghentikan program dengan `fatal error: concurrent map writes` (bukan panic yang bisa di-recover). Pilihan:'),
          table(['Pilihan', 'Cocok untuk'], [
            ['`map` + `sync.Mutex`/`RWMutex`', 'Default; paling mudah dipahami dan diuji'],
            ['`sync.Map`', 'Key ditulis sekali lalu sering dibaca, atau tiap goroutine menulis key berbeda'],
            ['Sharding (N map + N mutex)', 'Kontensi tinggi pada map besar'],
            ['Satu goroutine pemilik + channel', 'State yang logikanya kompleks (pola actor)'],
          ]),
          learn(['Paket sync', '#go.paket-sync'], ['Jebakan Concurrency', '#go.jebakan-concurrency']),
        ]),
        qa('GOI-05', 'Untuk apa `context.Context`? Bagaimana cancellation merambat?', [
          paragraph('Context membawa **sinyal pembatalan, deadline, dan nilai request-scoped** melintasi batas API dan goroutine. Saat parent dibatalkan, semua turunan ikut dibatalkan (pohon context).'),
          code('Pola standar', `func (s *Service) GetOrder(ctx context.Context, id int64) (*Order, error) {
    ctx, cancel := context.WithTimeout(ctx, 800*time.Millisecond)
    defer cancel() // wajib: melepas timer & resource walau selesai lebih cepat

    row := s.db.QueryRowContext(ctx, "SELECT ... WHERE id = $1", id)
    // ...
}`, 'go'),
          ul(
            'Context adalah **parameter pertama** bernama `ctx`; jangan disimpan di struct, jangan kirim `nil` (pakai `context.TODO()`).',
            'Pembatalan bersifat **kooperatif**: kode yang lama berjalan harus memeriksa `ctx.Done()`/`ctx.Err()`.',
            '`context.Value` hanya untuk data lintas-lapisan seperti request ID/trace, bukan untuk parameter opsional. Pakai tipe key privat agar tidak bentrok.',
            'Fungsi yang berguna: `WithCancelCause` (alasan pembatalan), `WithoutCancel` (pekerjaan lanjutan yang tidak boleh ikut batal, mis. audit log), `AfterFunc`.',
          ),
          followUp('"Apa yang terjadi bila lupa `cancel()`?" Timer dan goroutine internal context tidak dilepas sampai parent selesai: kebocoran resource. `go vet` (lostcancel) memperingatkan ini.'),
          learn(['Context: Cancellation & Timeout', '#go.context-cancellation-timeout-dan-request-scoped']),
        ]),
        qa(
          'GOI-06',
          '(Coding) Kode di bawah seharusnya mencetak 1000. Apa masalahnya, bagaimana mendeteksinya, dan bagaimana memperbaikinya?',
          [
            paragraph('Ini **data race**: 1000 goroutine membaca-ubah-tulis `count` tanpa sinkronisasi. `count++` bukan operasi atomik (load, add, store), jadi update saling menimpa dan hasilnya acak (sering < 1000). Menurut memory model Go, program dengan data race tidak punya perilaku yang dijamin.'),
            paragraph('**Deteksi**: `go test -race ./...` atau `go run -race .`. Race detector (berbasis ThreadSanitizer) menginstrumentasi akses memori dan melaporkan dua stack trace yang bentrok. Ia hanya menangkap race yang *benar-benar terjadi* saat eksekusi, jadi jalankan di test dan CI dengan beban realistis. Overhead-nya besar (CPU dan memori berlipat), jadi biasanya tidak dipakai di production.'),
            code('Perbaikan: atomic (counter sederhana) atau mutex (state lebih kompleks)', `var count atomic.Int64
var wg sync.WaitGroup
for range 1000 {
    wg.Add(1)
    go func() {
        defer wg.Done()
        count.Add(1)
    }()
}
wg.Wait()
fmt.Println(count.Load()) // 1000

// Alternatif:
// var mu sync.Mutex
// mu.Lock(); count++; mu.Unlock()`, 'go'),
            followUp('"Apakah `GOMAXPROCS=1` menghilangkan race?" Tidak. Preemption tetap bisa terjadi di tengah read-modify-write, dan secara memory model program tetap salah.'),
          ],
          [code('main.go', `func main() {
    count := 0
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            count++
        }()
    }
    wg.Wait()
    fmt.Println(count)
}`, 'go')],
        ),
        qa(
          'GOI-07',
          '(Coding) Implementasikan worker pool: proses daftar job dengan N worker, kumpulkan hasilnya, dan hormati pembatalan context.',
          [
            code('Worker pool dengan channel + WaitGroup', `func Process(ctx context.Context, jobs []Job, workers int) ([]Result, error) {
    jobCh := make(chan Job)
    resCh := make(chan Result)

    var wg sync.WaitGroup
    for range workers {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := range jobCh {          // berhenti saat jobCh ditutup
                r := handle(ctx, j)
                select {
                case resCh <- r:
                case <-ctx.Done():
                    return
                }
            }
        }()
    }

    go func() {                             // producer
        defer close(jobCh)
        for _, j := range jobs {
            select {
            case jobCh <- j:
            case <-ctx.Done():
                return
            }
        }
    }()

    go func() { wg.Wait(); close(resCh) }() // tutup hasil setelah semua worker selesai

    out := make([]Result, 0, len(jobs))
    for r := range resCh {
        out = append(out, r)
    }
    return out, ctx.Err()
}`, 'go'),
            paragraph('Poin yang dinilai interviewer:'),
            ul(
              'Siapa menutup channel apa: producer menutup `jobCh`, goroutine terpisah menutup `resCh` setelah `wg.Wait()`.',
              'Tidak ada goroutine yang bocor saat context dibatalkan (setiap send punya jalur keluar `ctx.Done()`).',
              'Jumlah worker dibatasi (backpressure), bukan satu goroutine per job.',
              'Bila urutan hasil penting, sertakan index di `Result` lalu isi slice berdasarkan index.',
            ),
            paragraph('Di kode production, `golang.org/x/sync/errgroup` dengan `g.SetLimit(n)` sering lebih ringkas: error pertama membatalkan context bersama.'),
            followUp('"Bagaimana jika satu job gagal, apakah semua harus berhenti?" Diskusikan dua mode: fail-fast (errgroup) vs kumpulkan semua error (`errors.Join`).'),
            learn(['errgroup', '#go.errgroup-concurrency-dengan-error']),
          ],
          [paragraph('Tanda tangan fungsi: `func Process(ctx context.Context, jobs []Job, workers int) ([]Result, error)`. Fungsi `handle(ctx, job) Result` sudah tersedia.')],
        ),
      ],
    },
    heading('Bahasa, memori & tooling'),
    {
      type: 'qa',
      items: [
        qa(
          'GOI-08',
          'Apa output kode ini? Jelaskan len, cap, dan aliasing pada slice.',
          [
            paragraph('Output: **`2 2`**. Slice adalah *header* berisi pointer ke backing array, `len`, dan `cap`. `a` punya len 3 dan cap 5, jadi `append(a, 1)` tidak perlu alokasi: ia menulis ke index 3 array yang **sama**. `append(a, 2)` juga menulis ke index 3 array yang sama, menimpa nilai 1. `b` dan `c` berbagi memori.'),
            ul(
              'Bila cap tidak cukup, `append` mengalokasikan array baru (kapasitas tumbuh kira-kira berlipat untuk slice kecil, lebih landai untuk slice besar) dan aliasing putus. Karena itu perilaku ini terlihat "acak" bagi yang tidak paham.',
              'Selalu pakai hasil `append`: `s = append(s, x)`.',
              'Batasi kapasitas dengan *full slice expression* `a[0:3:3]` agar `append` dipaksa menyalin, atau salin eksplisit dengan `slices.Clone`.',
              'Sub-slice dari array besar menahan seluruh array tetap hidup di memori (kebocoran halus). Salin bagian kecil yang dibutuhkan.',
            ),
            followUp('"Beda `var s []int` dan `s := []int{}`?" Yang pertama nil slice (len 0, `s == nil`), yang kedua slice kosong non-nil. Keduanya aman untuk `append`/`range`, tetapi di-encode JSON berbeda: `null` vs `[]`.'),
            learn(['Array, Slice & Map', '#go.array-slice-dan-map']),
          ],
          [code('slice.go', `a := make([]int, 3, 5)
b := append(a, 1)
c := append(a, 2)
fmt.Println(b[3], c[3])`, 'go')],
        ),
        qa(
          'GOI-09',
          'Kenapa `do() == nil` bernilai false padahal yang dikembalikan pointer nil? (nil interface trap)',
          [
            paragraph('Nilai interface terdiri dari dua bagian: **(tipe dinamis, nilai)**. Interface hanya `nil` bila *keduanya* nil. `return e` membungkus `(*MyErr, nil)` ke dalam `error`, sehingga tipenya terisi dan perbandingan dengan `nil` menghasilkan `false`. Caller mengira terjadi error padahal tidak.'),
            code('Perbaikan', `func do() error {
    var e *MyErr
    if somethingWrong {
        e = &MyErr{}
    }
    if e == nil {
        return nil      // kembalikan nil interface secara eksplisit
    }
    return e
}`, 'go'),
            ul(
              'Aturan: fungsi yang mengembalikan `error` sebaiknya bertipe hasil `error`, bukan tipe konkret `*MyErr`, dan mengembalikan literal `nil` saat sukses.',
              'Desain interface Go: **implisit** (tanpa `implements`), definisikan interface di sisi *consumer*, kecil (1–3 method). "Accept interfaces, return structs."',
            ),
            followUp('"Method dengan receiver pointer vs value, apa pengaruhnya ke interface?" Method set `T` hanya berisi method receiver value; method set `*T` berisi keduanya. Jadi bila `Error()` ber-receiver pointer, hanya `*MyErr` yang memenuhi `error`.'),
            learn(['Interface & Polymorphism', '#go.interface-dan-polymorphism']),
          ],
          [code('nil_trap.go', `type MyErr struct{}

func (*MyErr) Error() string { return "boom" }

func do() error {
    var e *MyErr = nil
    return e
}

func main() {
    fmt.Println(do() == nil) // ?
}`, 'go')],
        ),
        qa('GOI-10', 'Bagaimana error handling idiomatik di Go? Jelaskan wrapping, `errors.Is`, dan `errors.As`.', [
          ul(
            'Error adalah nilai biasa; periksa segera (`if err != nil`) dan tambahkan konteks saat meneruskan ke atas.',
            '**Wrap** dengan `fmt.Errorf("ambil order %d: %w", id, err)`. `%w` menyimpan error asli dalam rantai; `%v` hanya menyalin teksnya (rantai putus).',
            '`errors.Is(err, sql.ErrNoRows)`: apakah ada error **sentinel** tertentu di rantai.',
            '`errors.As(err, &target)`: ambil error dengan **tipe** tertentu dari rantai untuk membaca field-nya.',
            '`errors.Join` menggabungkan beberapa error (mis. validasi atau cleanup).',
          ),
          code('Contoh di layer service → handler', `var ErrNotFound = errors.New("not found")

type ValidationError struct{ Field string }
func (e *ValidationError) Error() string { return "invalid " + e.Field }

// handler
switch {
case errors.Is(err, ErrNotFound):
    writeJSON(w, http.StatusNotFound, msg("order tidak ditemukan"))
case errors.As(err, new(*ValidationError)):
    writeJSON(w, http.StatusBadRequest, msg(err.Error()))
default:
    slog.Error("get order", "err", err)
    writeJSON(w, http.StatusInternalServerError, msg("internal error"))
}`, 'go'),
          ul(
            '**panic** hanya untuk bug/kondisi mustahil (invariant rusak), bukan untuk alur bisnis. `recover` dipakai di batas (middleware HTTP) agar satu request tidak menjatuhkan proses.',
            'Jangan log *dan* return error yang sama di setiap lapisan (log ganda); log sekali di batas teratas.',
          ),
          followUp('"Kapan memakai sentinel error vs tipe error?" Sentinel untuk kondisi tanpa data tambahan; tipe untuk error yang membawa detail. Hati-hati mengekspor sentinel dari library internal: ia menjadi bagian API publik.'),
          learn(['Error Handling Idiomatik', '#go.error-handling-idiomatik']),
        ]),
        qa(
          'GOI-11',
          'Apa output fungsi ini? Jelaskan urutan `defer`, evaluasi argumen, dan named result.',
          [
            paragraph('Output: **`2 1 0 10`**.'),
            ol(
              '`defer` dieksekusi **LIFO** saat fungsi kembali, setelah nilai return diset.',
              'Argumen `defer fmt.Print(i, " ")` **dievaluasi saat defer didaftarkan**, jadi tercetak 2, 1, 0 (bukan 3 3 3).',
              '`return 5` mengisi named result `n = 5`, lalu closure defer pertama (yang dijalankan terakhir) mengubahnya menjadi 10.',
            ),
            ul(
              'Pola ini dipakai untuk menambah konteks pada error: `defer func() { if err != nil { err = fmt.Errorf("x: %w", err) } }()`.',
              '`recover()` hanya berfungsi bila dipanggil langsung di dalam fungsi yang di-defer.',
              '`defer` di dalam loop panjang (mis. `defer f.Close()` per file) menumpuk sampai fungsi selesai; pindahkan isi loop ke fungsi terpisah.',
            ),
            followUp('Sejak Go 1.22 variabel loop `for` dibuat baru per iterasi, jadi closure di dalam loop tidak lagi berbagi variabel yang sama. Interviewer kadang menanyakan bug klasik "semua goroutine mencetak nilai terakhir" untuk menguji apakah kamu tahu perubahan ini.'),
          ],
          [code('defer.go', `func f() (n int) {
    defer func() { n *= 2 }()
    for i := 0; i < 3; i++ {
        defer fmt.Print(i, " ")
    }
    return 5
}

func main() { fmt.Println(f()) }`, 'go')],
        ),
        qa('GOI-12', 'Kapan memakai generics di Go dan kapan tidak?', [
          code('Type parameter & constraint', `type Number interface {
    ~int | ~int64 | ~float64   // ~ = termasuk tipe turunan, mis. type Rupiah int64
}

func Sum[T Number](xs []T) T {
    var total T
    for _, x := range xs {
        total += x
    }
    return total
}

func Keys[K comparable, V any](m map[K]V) []K { /* ... */ }`, 'go'),
          ul(
            '**Pakai** untuk struktur data dan algoritma yang sama untuk banyak tipe: koleksi, `Map/Filter`, cache generik, helper repository, pool. Paket standar `slices`, `maps`, `cmp` adalah contohnya.',
            '**Jangan** bila perilakunya berbeda per tipe: itu tugas interface. Jangan juga mengganti interface sederhana seperti `io.Reader` dengan type parameter.',
            'Batasan: method tidak boleh punya type parameter sendiri (hanya tipe-nya); tidak ada specialization.',
            'Implementasi compiler memakai *GC shape stenciling* + dictionary, jadi generics tidak selalu secepat kode yang ditulis manual per tipe; ukur bila penting.',
          ),
          followUp('"Bedanya `any` dan `comparable`?" `any` = `interface{}`; `comparable` membatasi ke tipe yang bisa dibandingkan `==` (syarat key map).'),
          learn(['Generics', '#go.generics']),
        ]),
        qa('GOI-13', 'Apa itu escape analysis? Bagaimana GC Go bekerja dan bagaimana men-tuning-nya?', [
          paragraph('**Escape analysis**: compiler memutuskan apakah sebuah variabel bisa tinggal di **stack** (gratis, hilang saat fungsi kembali) atau harus "lolos" ke **heap** (dikelola GC). Variabel lolos bila referensinya hidup lebih lama dari fungsi: dikembalikan sebagai pointer, disimpan di interface/closure yang hidup lama, dikirim ke channel, ukurannya tidak diketahui saat compile, dan sebagainya.'),
          code('Melihat keputusan compiler', `go build -gcflags=-m ./...
# ./order.go:12:9: &Order{...} escapes to heap
# ./order.go:20:6: moved to heap: buf`, 'bash'),
          ul(
            'GC Go: **concurrent mark-and-sweep** dengan tri-color marking dan write barrier; berjalan berdampingan dengan program sehingga jeda stop-the-world sangat singkat. Objek tidak dipindah (non-moving).',
            '`GOGC` (default 100): GC berikutnya dipicu saat heap tumbuh 100% dari heap hidup setelah GC terakhir. Lebih besar = lebih jarang GC, memori lebih boros.',
            '`GOMEMLIMIT`: batas memori lunak; penting di container agar GC lebih agresif sebelum kena OOM kill.',
            'Kurangi alokasi: prealokasi slice (`make([]T, 0, n)`), `sync.Pool` untuk buffer sementara, hindari konversi `[]byte`↔`string` berulang, ukur dengan `pprof` (`-memprofile`, `/debug/pprof/heap`) dan `b.ReportAllocs()`.',
          ),
          followUp('"Apakah mengembalikan pointer selalu lebih cepat dari value?" Tidak. Pointer sering memaksa alokasi heap; struct kecil yang disalin lewat stack bisa lebih cepat. Ukur dulu.'),
        ]),
        qa('GOI-14', 'Bagaimana kamu menyusun layout proyek backend Go?', [
          paragraph('Tidak ada layout "resmi" yang wajib; repo `golang-standards/project-layout` **bukan** standar resmi tim Go. Panduan resmi (go.dev/doc/modules/layout) intinya: mulai sederhana, tambah struktur saat dibutuhkan.'),
          code('Layout umum untuk layanan', `myservice/
├── go.mod
├── cmd/
│   ├── api/main.go          # wiring: config, DB, router, graceful shutdown
│   └── worker/main.go
├── internal/                # tidak bisa di-import modul lain (ditegakkan compiler)
│   ├── order/               # paket per domain: handler, service, repository
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── postgres.go
│   └── platform/            # db, logger, config, middleware
├── migrations/
└── api/openapi.yaml`, 'text'),
          ul(
            'Paket dikelompokkan **per domain/fitur**, bukan per lapisan teknis (`models/`, `controllers/`) yang memicu import cycle.',
            'Nama paket pendek, huruf kecil, tanpa `util`/`common` generik.',
            'Dependency injection manual di `main` (konstruktor eksplisit) biasanya cukup; framework DI jarang diperlukan.',
            '`internal/` untuk semua yang tidak ingin dijadikan API publik.',
          ),
          followUp('"Bagaimana menghindari import cycle?" Definisikan interface di paket consumer, pindahkan tipe bersama ke paket yang lebih rendah, atau gabungkan paket yang terlalu erat.'),
        ]),
        qa('GOI-15', 'Bagaimana kamu menulis test di Go? Jelaskan table-driven test, subtest, dan benchmark.', [
          code('Table-driven test dengan subtest', `func TestHitungDiskon(t *testing.T) {
    tests := []struct {
        name  string
        total int64
        want  int64
    }{
        {"di bawah minimum", 50_000, 0},
        {"tepat minimum", 100_000, 10_000},
        {"di atas batas maksimum", 5_000_000, 50_000},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            if got := HitungDiskon(tt.total); got != tt.want {
                t.Errorf("HitungDiskon(%d) = %d, want %d", tt.total, got, tt.want)
            }
        })
    }
}

func BenchmarkHitungDiskon(b *testing.B) {
    for b.Loop() {
        HitungDiskon(1_000_000)
    }
}`, 'go'),
          ul(
            '`t.Run` membuat subtest yang bisa dijalankan sendiri: `go test -run TestHitungDiskon/tepat`.',
            '`t.Helper()`, `t.Cleanup()`, `t.TempDir()`, `t.Setenv()` untuk test yang bersih.',
            'HTTP handler diuji dengan `net/http/httptest` (`httptest.NewRecorder`, `httptest.NewServer`). Integrasi DB nyata dengan testcontainers atau database lokal.',
            'Flag penting: `-race`, `-cover`, `-count=1` (abaikan cache), `-shuffle=on`. Fuzzing bawaan lewat `func FuzzXxx(f *testing.F)`.',
            'Mock: definisikan interface kecil di consumer lalu buat fake manual; library mock opsional.',
          ),
          followUp('"Bagaimana menguji kode yang bergantung waktu?" Injeksikan clock/fungsi `now` sebagai dependency, atau gunakan paket `testing/synctest` di versi Go yang mendukungnya untuk kode konkuren dengan timer.'),
          learn(['Testing di Go', '#go.testing-di-go'], ['Fuzzing, Benchmark & Security', '#go.go-fuzz-bench-security']),
        ]),
      ],
    },
    heading('Referensi'),
    references(
      ['The Go Memory Model', 'https://go.dev/ref/mem'],
      ['Effective Go', 'https://go.dev/doc/effective_go'],
      ['Go Concurrency Patterns: Pipelines and cancellation', 'https://go.dev/blog/pipelines'],
      ['Data Race Detector', 'https://go.dev/doc/articles/race_detector'],
      ['Package context', 'https://pkg.go.dev/context'],
      ['Working with Errors in Go 1.13', 'https://go.dev/blog/go1.13-errors'],
      ['A Guide to the Go Garbage Collector', 'https://go.dev/doc/gc-guide'],
      ['Organizing a Go module', 'https://go.dev/doc/modules/layout'],
      ['Package testing', 'https://pkg.go.dev/testing'],
    ),
  ],
};

/* ──────────────────────── Python & AI Engineer ──────────────────────── */

const pythonModule: Omit<Module, 'code'> = {
  id: 'iv-python-ai',
  title: 'Interview Python & AI Engineer',
  summary: '15 soal: 9 soal inti Python & FastAPI (mutability, GIL vs asyncio, generator, decorator, context manager, dataclass vs Pydantic, typing, packaging, dependency injection) dan 6 soal AI Engineer (RAG, chunking & embedding, evaluasi, prompt injection, agent, biaya & latensi).',
  track: PY,
  source: interviewLanguageSource,
  duration: '75 menit',
  level: 'Med',
  blocks: [
    howTo,
    heading('Python & FastAPI'),
    {
      type: 'qa',
      items: [
        qa(
          'PYI-01',
          'Apa output kode ini? Jelaskan mutability dan jebakan default argument.',
          [
            paragraph("Output: `['a']` lalu `['a', 'b']`. Nilai default **dievaluasi sekali saat `def` dijalankan**, bukan setiap pemanggilan. List default yang sama dipakai bersama oleh semua panggilan."),
            code('Perbaikan idiomatik', `def tambah(item, keranjang=None):
    if keranjang is None:
        keranjang = []
    keranjang.append(item)
    return keranjang`, 'python'),
            ul(
              'Tipe **immutable**: `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`. **Mutable**: `list`, `dict`, `set`, objek biasa.',
              'Python selalu meneruskan *referensi ke objek* (call by sharing). Mengubah isi objek mutable terlihat oleh caller; meng-assign ulang nama parameter tidak.',
              'Tuple berisi list tetap bisa "berubah" isinya: tuple hanya immutable di level referensi.',
              '`copy.copy` = shallow copy, `copy.deepcopy` = salin rekursif.',
            ),
            followUp('"Kenapa `is` vs `==`?" `is` membandingkan identitas objek, `==` membandingkan nilai. Pakai `is` hanya untuk singleton seperti `None`.'),
          ],
          [code('default_arg.py', `def tambah(item, keranjang=[]):
    keranjang.append(item)
    return keranjang

print(tambah("a"))
print(tambah("b"))`, 'python')],
        ),
        qa('PYI-02', 'Apa itu GIL? Kapan memakai threading, multiprocessing, atau asyncio?', [
          paragraph('**GIL** (Global Interpreter Lock) di CPython memastikan hanya satu thread yang mengeksekusi bytecode Python pada satu waktu. Akibatnya thread **tidak** mempercepat pekerjaan CPU-bound murni Python, tetapi tetap berguna untuk I/O karena GIL dilepas saat menunggu I/O (dan oleh banyak ekstensi C seperti NumPy).'),
          table(['Model', 'Cocok untuk', 'Catatan'], [
            ['`threading` / `ThreadPoolExecutor`', 'I/O-bound dengan library sinkron', 'Mudah, tetapi perlu lock untuk state bersama'],
            ['`multiprocessing` / `ProcessPoolExecutor`', 'CPU-bound (parsing, hitung berat)', 'Paralel sungguhan; biaya proses & serialisasi (pickle)'],
            ['`asyncio`', 'I/O-bound dengan konkurensi tinggi (ribuan koneksi)', 'Satu thread, kooperatif; semua library harus async'],
          ]),
          ul(
            'Python 3.13 memperkenalkan build **free-threaded** (tanpa GIL, PEP 703) sebagai eksperimen; di rilis berikutnya statusnya naik menjadi didukung resmi, tetapi build default masih memakai GIL dan tidak semua ekstensi C kompatibel.',
            'Di asyncio, satu panggilan blocking (`time.sleep`, `requests`, driver DB sinkron) membekukan seluruh event loop. Pindahkan ke thread dengan `await asyncio.to_thread(fn)`.',
            'Konkurensi terstruktur: `asyncio.TaskGroup` (pembatalan otomatis bila satu task gagal) dan `asyncio.timeout()`.',
          ),
          followUp('"Apakah GIL membuat kode kita thread-safe?" Tidak. Operasi seperti `counter += 1` terdiri dari beberapa bytecode dan bisa diselingi thread lain; tetap butuh `threading.Lock`.'),
          learn(['asyncio', '#python.py-asyncio']),
        ]),
        qa('PYI-03', 'Apa itu generator? Bedanya dengan list, dan kapan dipakai?', [
          paragraph('Generator adalah fungsi dengan `yield` yang menghasilkan nilai **satu per satu secara lazy** dan menyimpan state-nya di antara pemanggilan `next()`. Memori konstan, cocok untuk data besar atau stream.'),
          code('Pipeline lazy', `def baca_baris(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip()

def hanya_valid(rows):
    return (r for r in rows if r and not r.startswith("#"))  # generator expression

total = sum(1 for _ in hanya_valid(baca_baris("transaksi.csv")))`, 'python'),
          ul(
            'Generator hanya bisa diiterasi **sekali**; iterasi kedua kosong.',
            '`yield from` mendelegasikan ke sub-generator. `send()`/`throw()`/`close()` ada tetapi jarang dipakai di kode aplikasi.',
            'Async generator (`async def` + `yield`) diiterasi dengan `async for`, misalnya untuk streaming token LLM atau baris dari DB.',
            '`itertools` (islice, chain, batched, groupby) memperkaya pipeline lazy.',
          ),
          followUp('"Kapan sebaiknya tetap memakai list?" Saat perlu akses index, iterasi berkali-kali, atau `len()`, dan datanya muat di memori.'),
          learn(['Generator & Decorator', '#python.py-generator-decorator']),
        ]),
        qa('PYI-04', 'Bagaimana decorator bekerja? Tulis decorator dengan argumen.', [
          paragraph('Decorator adalah fungsi yang menerima fungsi dan mengembalikan fungsi (biasanya pembungkus). `@retry(times=3)` di atas `def f` setara dengan `f = retry(times=3)(f)`, jadi decorator berargumen butuh **tiga lapis**.'),
          code('Decorator retry dengan argumen', `import functools, time

def retry(times: int = 3, delay: float = 0.5, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)                 # pertahankan __name__, docstring, signature
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt == times:
                        raise
                    time.sleep(delay * 2 ** (attempt - 1))   # exponential backoff
        return wrapper
    return decorator

@retry(times=3, exceptions=(ConnectionError,))
def ambil_kurs(): ...`, 'python'),
          ul(
            'Untuk fungsi `async`, wrapper juga harus `async def` dan memakai `await fn(...)` serta `asyncio.sleep`.',
            'Untuk typing yang benar, gunakan `ParamSpec` agar signature fungsi asli tetap terlihat oleh type checker.',
            'Contoh dunia nyata: `@app.get` di FastAPI, `@functools.cache`, `@pytest.fixture`, `@property`.',
          ),
          followUp('"Apa yang terjadi tanpa `functools.wraps`?" Nama dan signature fungsi hilang; log menyesatkan dan framework yang membaca signature (FastAPI) bisa salah.'),
        ]),
        qa('PYI-05', 'Apa itu context manager? Bagaimana membuatnya?', [
          paragraph('Context manager menjamin **setup dan cleanup** berpasangan lewat `with`, bahkan bila terjadi exception: file, koneksi, lock, transaksi, timer.'),
          code('Dua cara membuat', `from contextlib import contextmanager

class Transaksi:
    def __init__(self, conn): self.conn = conn
    def __enter__(self): return self.conn.cursor()
    def __exit__(self, exc_type, exc, tb):
        if exc_type: self.conn.rollback()
        else: self.conn.commit()
        return False          # True = menelan exception (jarang benar)

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - start:.3f}s")`, 'python'),
          ul(
            'Versi async: `__aenter__`/`__aexit__` atau `@asynccontextmanager`, dipakai dengan `async with` (mis. `httpx.AsyncClient`, sesi SQLAlchemy async, lifespan FastAPI).',
            '`contextlib.ExitStack` untuk jumlah resource yang dinamis; `contextlib.suppress` untuk mengabaikan exception tertentu secara eksplisit.',
          ),
          learn(['Generator, Decorator & Context Manager', '#python.py-generator-decorator']),
        ]),
        qa('PYI-06', 'dataclass vs Pydantic: kapan memakai yang mana?', [
          table(['Aspek', '`@dataclass`', 'Pydantic `BaseModel`'], [
            ['Validasi runtime', 'Tidak ada (type hint hanya anotasi)', 'Ya, termasuk koersi tipe (`"5"` → `5`) atau strict mode'],
            ['Serialisasi', 'Manual / `asdict`', '`model_dump()`, `model_dump_json()`, JSON Schema'],
            ['Performa', 'Sangat ringan', 'Core validasi ditulis di Rust, cepat tetapi tetap ada biaya'],
            ['Cocok untuk', 'Objek domain internal, value object', 'Batas sistem: request/response API, config, output LLM terstruktur'],
          ]),
          ul(
            'Pola umum: **Pydantic di tepi** (input tidak tepercaya), dataclass/objek domain di dalam.',
            'Opsi dataclass yang perlu diketahui: `frozen=True` (immutable & hashable), `slots=True` (hemat memori), `kw_only=True`, `field(default_factory=list)` (menghindari jebakan default mutable).',
            'Pydantic: `Field(gt=0)`, `field_validator`, `model_validator`, `ConfigDict(extra="forbid")`, `pydantic-settings` untuk konfigurasi dari env.',
          ),
          followUp('"Bagaimana FastAPI memakai Pydantic?" Parameter body bertipe model divalidasi otomatis (422 bila gagal) dan `response_model` memfilter field yang tidak boleh bocor ke response.'),
        ]),
        qa('PYI-07', 'Seberapa jauh kamu memakai type hints? Jelaskan Protocol, generics, dan batasannya.', [
          ul(
            'Type hint **tidak ditegakkan saat runtime**; nilainya datang dari type checker (mypy, pyright) di CI, IDE, dan library yang membacanya (Pydantic, FastAPI).',
            'Sintaks modern: `list[int]`, `dict[str, Any]`, `X | None`, `Literal["IDR", "USD"]`, `TypedDict`, `Annotated[int, Field(gt=0)]`.',
            '**Protocol** = structural typing (mirip interface Go): kelas memenuhi protocol bila punya method yang cocok, tanpa pewarisan. Bagus untuk dependency yang mudah di-fake di test.',
            'Generics dengan sintaks type parameter (Python 3.12+): `def pertama[T](xs: list[T]) -> T: ...` dan alias `type Hasil[T] = T | None`.',
          ),
          code('Protocol untuk dependency', `from typing import Protocol

class PaymentGateway(Protocol):
    def charge(self, order_id: str, amount: int) -> str: ...

class OrderService:
    def __init__(self, gateway: PaymentGateway) -> None:
        self.gateway = gateway      # Midtrans, Xendit, atau FakeGateway di test`, 'python'),
          followUp('"`Any` vs `object`?" `Any` mematikan pemeriksaan (bisa apa saja ke mana saja); `object` aman karena harus di-narrowing dulu sebelum dipakai, mirip `unknown` di TypeScript.'),
          learn(['Typing & Tooling', '#python.py-typing-tooling']),
        ]),
        qa('PYI-08', 'Bagaimana kamu mengelola dependency, virtual environment, dan packaging proyek Python?', [
          ul(
            '**Virtual environment** mengisolasi paket per proyek (`python -m venv .venv`) agar tidak bentrok dengan paket global sistem.',
            '**`pyproject.toml`** adalah tempat standar metadata proyek, dependency, dan konfigurasi tool (ruff, pytest, mypy). `setup.py` hanya untuk proyek lama.',
            '**Lock file** menjamin build yang reproducible: `uv.lock` (uv), `poetry.lock`, atau `requirements.txt` hasil `pip-compile`/`uv pip compile` dengan versi terkunci.',
            'Pisahkan dependency runtime dan dev (`[dependency-groups]` atau extras).',
            'Library dipublikasikan sebagai **wheel**; aplikasi biasanya cukup dikemas sebagai image container.',
          ),
          code('Alur dengan uv', `uv init layanan-kas && cd layanan-kas
uv add fastapi "uvicorn[standard]" sqlalchemy
uv add --dev pytest ruff mypy
uv run pytest
uv sync --frozen        # di CI/Docker: pasang persis sesuai uv.lock`, 'bash'),
          followUp('"Kenapa image Docker produksi tidak menjalankan `pip install` tanpa versi?" Build menjadi tidak deterministik: dependency transitif bisa naik versi diam-diam dan merusak production.'),
          learn(['Packaging & pyproject', '#python.py-packaging-pyproject']),
        ]),
        qa(
          'PYI-09',
          'Bagaimana dependency injection di FastAPI bekerja? Apa masalah endpoint di bawah dan apa jebakan async lainnya?',
          [
            paragraph('**Masalah**: `requests.get` dan `time.sleep` bersifat blocking. Di dalam `async def`, keduanya membekukan event loop sehingga semua request lain ikut menunggu. Perbaiki dengan client async (`httpx.AsyncClient`, `await asyncio.sleep`), atau jadikan endpoint `def` biasa: FastAPI menjalankan endpoint sinkron di threadpool.'),
            code('Dependency dengan yield + Annotated', `from typing import Annotated
from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session                       # kode setelah yield = cleanup

SessionDep = Annotated[AsyncSession, Depends(get_session)]

async def current_user(token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep) -> User:
    ...

@app.get("/kurs/{kode}")
async def kurs(kode: str, user: Annotated[User, Depends(current_user)], db: SessionDep):
    ...`, 'python'),
            ul(
              'FastAPI menyusun **graf dependency** dari signature; dependency yang sama dalam satu request di-*cache* (dipanggil sekali) secara default.',
              'Dependency dengan `yield` cocok untuk sesi DB, transaksi, dan resource yang perlu ditutup.',
              'Di test, ganti dependency dengan `app.dependency_overrides[get_session] = fake_session`.',
              'Resource global (pool DB, HTTP client) dibuat sekali di **lifespan**, bukan per request.',
              'Pekerjaan CPU-bound berat jangan di event loop: pindahkan ke worker (Celery/RQ/arq) atau process pool.',
            ),
            followUp('"`def` atau `async def` untuk endpoint?" `async def` hanya bila semua I/O di dalamnya async. Bila memakai library sinkron, `def` lebih aman karena dijalankan di threadpool.'),
            learn(['Mengenal FastAPI', '#python.mengenal-fastapi'], ['asyncio', '#python.py-asyncio']),
          ],
          [code('main.py', `@app.get("/kurs/{kode}")
async def kurs(kode: str):
    resp = requests.get(f"https://api.kurs.example/{kode}")   # ~1 detik
    time.sleep(0.2)                                           # "rate limit"
    return resp.json()`, 'python')],
        ),
      ],
    },
    heading('AI Engineer: LLM, RAG & agent'),
    {
      type: 'qa',
      items: [
        qa('PYI-10', 'Rancang pipeline RAG untuk asisten tanya-jawab dokumen kebijakan internal perusahaan.', [
          paragraph('Jawab terstruktur dalam dua jalur, lalu bahas evaluasi dan operasional:'),
          table(['Tahap', 'Keputusan penting'], [
            ['Ingestion', 'Parse PDF/HTML/DOCX, bersihkan header/footer, simpan metadata (judul, versi, tanggal berlaku, unit, hak akses)'],
            ['Chunking', 'Berdasarkan struktur (heading/pasal), ukuran & overlap diuji, bukan ditebak'],
            ['Embedding & index', 'Model embedding yang mendukung Bahasa Indonesia; vector store (pgvector, Qdrant, OpenSearch) + index keyword (BM25)'],
            ['Retrieval', 'Hybrid search (vektor + keyword), filter metadata & **ACL user**, ambil top-k lalu **rerank**'],
            ['Generation', 'Prompt dengan konteks bernomor, wajib sitasi, instruksi "katakan tidak tahu bila tidak ada di dokumen"'],
            ['Evaluasi & observability', 'Dataset pertanyaan emas, metrik retrieval & jawaban, tracing tiap langkah, feedback user'],
          ]),
          ul(
            'Hak akses ditegakkan di **retrieval** (filter query), bukan diserahkan ke LLM.',
            'Dokumen berubah: pipeline ingestion inkremental (hash konten), hapus chunk versi lama.',
            'Pertanyaan yang tidak perlu dokumen (sapaan, hitungan) bisa di-route tanpa retrieval untuk hemat biaya.',
          ),
          followUp('"RAG vs fine-tuning?" RAG untuk pengetahuan yang sering berubah dan butuh sitasi; fine-tuning untuk gaya/format atau perilaku khusus, bukan cara utama menambah fakta.'),
          learn(['RAG end-to-end', '#llm.rag-end-to-end'], ['Apa itu RAG', '#llm.apa-itu-rag-manfaatnya']),
        ]),
        qa('PYI-11', 'Bagaimana memilih strategi chunking dan model embedding?', [
          table(['Strategi chunking', 'Kelebihan', 'Kekurangan'], [
            ['Ukuran tetap + overlap', 'Sederhana, cepat', 'Memotong kalimat/tabel di tengah'],
            ['Rekursif per struktur (heading, paragraf, kalimat)', 'Menjaga makna; default yang baik', 'Ukuran chunk bervariasi'],
            ['Semantic chunking', 'Batas mengikuti perubahan topik', 'Mahal saat ingestion, butuh tuning'],
            ['Parent-document / small-to-big', 'Retrieval presisi dengan chunk kecil, konteks lengkap dari parent', 'Penyimpanan & logika lebih kompleks'],
          ]),
          ul(
            'Chunk terlalu kecil → konteks hilang; terlalu besar → embedding "rata-rata" topik dan memboroskan token.',
            'Sisipkan konteks ke chunk (judul dokumen, heading bab) agar chunk bisa berdiri sendiri.',
            'Embedding: **model yang sama** untuk dokumen dan query; perhatikan dukungan multibahasa, dimensi (biaya penyimpanan), batas panjang input, dan lisensi/lokasi data.',
            'Ganti model embedding = **re-embed seluruh korpus**; simpan nama/versi model di metadata.',
            'Putuskan dengan eksperimen: bandingkan recall@k beberapa konfigurasi pada dataset pertanyaan nyata.',
          ),
          learn(['Embeddings', '#llm.embeddings']),
        ]),
        qa('PYI-12', 'Bagaimana mengevaluasi aplikasi LLM sebelum dan sesudah rilis?', [
          ol(
            '**Dataset evaluasi**: kumpulan pertanyaan + jawaban/konteks acuan dari kasus nyata, termasuk kasus sulit dan pertanyaan yang seharusnya dijawab "tidak tahu".',
            '**Metrik retrieval**: recall@k, precision@k, MRR/nDCG (apakah chunk yang benar terambil).',
            '**Metrik jawaban**: faithfulness/groundedness (tidak mengarang di luar konteks), answer relevance, kebenaran terhadap jawaban acuan, format.',
            '**Cara menilai**: assertion deterministik (JSON valid, mengandung sitasi), LLM-as-judge dengan rubric jelas yang **dikalibrasi** terhadap label manusia, dan review manusia untuk sampel.',
            '**Regression test di CI**: setiap ubah prompt/model/chunking, jalankan eksperimen dan bandingkan skor.',
            '**Online**: tracing (input, konteks, output, latensi, biaya), feedback user, sampling percakapan untuk review, alert pada lonjakan error/biaya.',
          ),
          followUp('"Kelemahan LLM-as-judge?" Bias posisi dan panjang, bias terhadap gaya model sendiri, tidak konsisten. Mitigasi: rubric biner/skala kecil, contoh, judge model berbeda, dan cek kesepakatan dengan manusia.'),
          learn(['Evaluasi dengan Langfuse', '#llm.aie-evaluasi-langfuse'], ['Evaluasi RAG', '#llm.evaluasi-rag']),
        ]),
        qa('PYI-13', 'Apa itu prompt injection dan bagaimana memitigasinya?', [
          paragraph('Prompt injection terjadi ketika teks yang dikendalikan penyerang diperlakukan model sebagai instruksi. **Langsung**: user mengetik "abaikan instruksi sebelumnya...". **Tidak langsung**: instruksi tersembunyi di dokumen, email, atau halaman web yang diambil RAG/tool. Belum ada solusi tunggal yang sempurna, jadi pertahanannya berlapis.'),
          ul(
            '**Least privilege**: tool hanya punya izin minimum; kredensial tidak pernah masuk prompt; akses data ditegakkan oleh backend dengan identitas user, bukan oleh model.',
            '**Human-in-the-loop** untuk aksi berisiko (transfer dana, kirim email, hapus data).',
            '**Pisahkan konten tidak tepercaya**: tandai dengan delimiter/tag dan nyatakan di system prompt bahwa isinya data, bukan perintah.',
            '**Validasi output**: skema terstruktur, allowlist nilai/URL/domain, sanitasi sebelum dirender (cegah XSS/markdown image exfiltration).',
            '**Deteksi & monitoring**: classifier/guardrail untuk input dan output, logging, rate limit, red teaming berkala.',
          ),
          followUp('"Apakah system prompt yang tegas cukup?" Tidak. Anggap model bisa saja dibujuk; yang menentukan adalah apa yang **bisa** dilakukan sistem bila model menurut pada penyerang.'),
        ]),
        qa('PYI-14', 'Bagaimana tool calling bekerja, dan kapan memakai agent dibanding workflow biasa?', [
          ol(
            'Aplikasi mengirim pesan + definisi tool (nama, deskripsi, JSON Schema parameter).',
            'Model memutuskan memanggil tool dan mengembalikan nama tool + argumen JSON. **Model tidak mengeksekusi apa pun.**',
            'Aplikasi memvalidasi argumen, mengeksekusi fungsi, lalu mengirim hasilnya kembali sebagai tool result.',
            'Ulangi sampai model memberi jawaban akhir. Loop inilah yang disebut **agent**.',
          ),
          table(['Workflow (alur tetap)', 'Agent (model memilih langkah)'], [
            ['Langkah diketahui di depan', 'Langkah tergantung hasil sebelumnya'],
            ['Murah, cepat, mudah diuji', 'Fleksibel, tetapi lebih mahal & sulit diprediksi'],
            ['Contoh: klasifikasi tiket → ekstraksi → simpan', 'Contoh: investigasi insiden lintas beberapa sistem'],
          ]),
          ul(
            'Mulai dari workflow paling sederhana; naik ke agent hanya bila memang perlu.',
            'Desain tool: deskripsi jelas, parameter sedikit dan bertipe, pesan error informatif, idempoten bila mungkin.',
            'Pengaman: batas iterasi/biaya, timeout per tool, validasi argumen, tracing setiap langkah, persetujuan manusia untuk aksi destruktif.',
          ),
          learn(['LLM API & Tool Calling', '#llm.aie-llm-api-tool-calling'], ['LangGraph Dasar', '#llm.aie-langgraph-dasar']),
        ]),
        qa('PYI-15', 'Bagaimana menekan biaya dan latensi aplikasi LLM?', [
          table(['Teknik', 'Dampak'], [
            ['Model routing: model kecil untuk tugas mudah, model besar hanya bila perlu', 'Biaya turun signifikan'],
            ['Prompt caching untuk prefix panjang yang berulang (system prompt, dokumen)', 'Biaya & latensi input turun'],
            ['Kurangi konteks: rerank lalu ambil top-k kecil, ringkas riwayat chat', 'Token input turun'],
            ['Batasi output (`max_tokens`, format ringkas, structured output)', 'Token output (lebih mahal) turun'],
            ['Streaming respons', 'Waktu ke token pertama (TTFT) terasa lebih cepat'],
            ['Panggil tool/LLM secara paralel bila independen', 'Latensi total turun'],
            ['Batch API untuk pekerjaan offline', 'Biaya per token lebih murah'],
            ['Cache jawaban untuk pertanyaan identik/serupa', 'Hemat panggilan'],
          ]),
          ul(
            'Ukur dulu: biaya per request/fitur/user, p50/p95 latensi, TTFT, dan token per langkah lewat tracing.',
            'Tetapkan anggaran: batas token per request, rate limit per user, alert biaya harian.',
            'Setiap optimasi harus lolos evaluasi kualitas; hemat biaya tidak berguna bila jawaban memburuk.',
          ),
          followUp('"Bagaimana menangani rate limit provider?" Retry dengan exponential backoff + jitter, antrean, fallback ke model/provider lain, dan circuit breaker.'),
        ]),
      ],
    },
    heading('Referensi'),
    references(
      ['Python: Global Interpreter Lock (glossary)', 'https://docs.python.org/3/glossary.html#term-global-interpreter-lock'],
      ['Python: Free-threading HOWTO', 'https://docs.python.org/3/howto/free-threading-python.html'],
      ['Python: asyncio', 'https://docs.python.org/3/library/asyncio.html'],
      ['Python: dataclasses', 'https://docs.python.org/3/library/dataclasses.html'],
      ['Python: contextlib', 'https://docs.python.org/3/library/contextlib.html'],
      ['Python typing: Protocols', 'https://typing.python.org/en/latest/spec/protocol.html'],
      ['Pydantic', 'https://docs.pydantic.dev/latest/'],
      ['FastAPI: Concurrency and async / await', 'https://fastapi.tiangolo.com/async/'],
      ['FastAPI: Dependencies', 'https://fastapi.tiangolo.com/tutorial/dependencies/'],
      ['Python Packaging User Guide', 'https://packaging.python.org/en/latest/'],
      ['uv', 'https://docs.astral.sh/uv/'],
      ['Claude: Tool use', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview'],
      ['OWASP Top 10 for LLM Applications', 'https://genai.owasp.org/llm-top-10/'],
    ),
  ],
};

/* ──────────────────────── TypeScript & Node.js ──────────────────────── */

const tsModule: Omit<Module, 'code'> = {
  id: 'iv-typescript-node',
  title: 'Interview TypeScript & Node.js',
  summary: '15 soal: event loop & microtask (dengan tebak output), closure, this, == vs ===, sistem tipe TypeScript (type vs interface, unknown, generics, discriminated union, utility types), lalu Node.js: streams & backpressure, worker threads vs cluster, error async, ESM vs CJS, memory leak, dan keamanan API.',
  track: TS,
  source: interviewLanguageSource,
  duration: '75 menit',
  level: 'Med',
  blocks: [
    howTo,
    heading('JavaScript & TypeScript'),
    {
      type: 'qa',
      items: [
        qa(
          'TSI-01',
          'Tebak urutan output kode ini (dijalankan sebagai file CommonJS) dan jelaskan fase event loop Node.js.',
          [
            paragraph('Output: **`1 7 5 4 6`**, lalu **`2` dan `3` dalam urutan yang tidak dijamin**.'),
            ol(
              'Kode sinkron dulu: `1`, `7`.',
              'Setelah stack kosong, Node mengosongkan antrean **`process.nextTick`** (`5`), lalu antrean **microtask Promise** (`4`, `6`; `queueMicrotask` masuk antrean yang sama dengan `.then`).',
              '`setTimeout(0)` (fase timers) vs `setImmediate` (fase check): dari main module urutannya bergantung pada kinerja proses saat itu. Di dalam callback I/O, `setImmediate` **selalu** lebih dulu.',
            ),
            table(['Fase event loop (libuv)', 'Isi'], [
              ['timers', 'Callback `setTimeout`/`setInterval` yang sudah jatuh tempo'],
              ['pending callbacks', 'Callback I/O sistem tertentu yang ditunda'],
              ['poll', 'Ambil event I/O baru dan jalankan callback-nya; bisa menunggu di sini'],
              ['check', 'Callback `setImmediate`'],
              ['close callbacks', "Mis. `socket.on('close')`"],
            ]),
            paragraph('Antrean nextTick dan microtask dikosongkan **setelah setiap callback**, bukan hanya di antara fase. Karena itu `nextTick`/Promise rekursif bisa membuat I/O kelaparan.'),
            trap('Di modul ESM, kode top-level sudah berjalan di dalam evaluasi modul yang asinkron, sehingga urutan `nextTick` relatif terhadap Promise bisa berbeda. Sebutkan asumsi CJS/ESM saat menjawab.'),
            followUp('"Bagaimana mendeteksi event loop yang terblokir?" `perf_hooks.monitorEventLoopDelay()`, metrik event loop lag di APM, dan profil CPU (`--cpu-prof`).'),
            learn(['Node.js: Event Loop', '#js.node-event-loop']),
          ],
          [code('index.cjs', `console.log('1');
setTimeout(() => console.log('2'), 0);
setImmediate(() => console.log('3'));
Promise.resolve().then(() => console.log('4'));
process.nextTick(() => console.log('5'));
queueMicrotask(() => console.log('6'));
console.log('7');`, 'js')],
        ),
        qa('TSI-02', 'Apa itu closure? Kenapa loop dengan `var` mencetak 3 3 3?', [
          paragraph('Closure adalah fungsi yang **mengingat variabel dari scope tempat ia dibuat**, walaupun scope itu sudah selesai dieksekusi. Ini dasar dari module pattern, factory, memoization, dan handler yang membawa state.'),
          code('Bug klasik', `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);   // 3 3 3: satu i (function-scoped) dibagi semua callback
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);   // 0 1 2: let membuat binding baru per iterasi
}

function counter() {
  let n = 0;                              // state privat
  return { inc: () => ++n, get: () => n };
}`, 'js'),
          ul(
            'Closure menahan variabel yang direferensikan tetap hidup; menangkap objek besar di closure yang berumur panjang (listener, cache) adalah sumber memory leak.',
            'Gunakan `const`/`let`; `var` hanya muncul di kode lama.',
          ),
          learn(['Fungsi & Closure', '#js.js-fungsi-closure']),
        ]),
        qa('TSI-03', 'Bagaimana nilai `this` ditentukan di JavaScript?', [
          table(['Cara pemanggilan', 'Nilai `this`'], [
            ['`obj.method()`', '`obj` (implicit binding)'],
            ['`fn()` biasa', '`undefined` di strict mode/modul, `globalThis` di sloppy mode'],
            ['`fn.call(x)`, `fn.apply(x)`, `fn.bind(x)`', '`x` (explicit binding)'],
            ['`new Fn()`', 'Objek baru'],
            ['Arrow function', 'Diambil dari scope luar (lexical), tidak bisa diubah `call`/`bind`'],
          ]),
          code('Kehilangan this saat method dijadikan callback', `class OrderService {
  prefix = 'ORD';
  format(id: number) { return \`\${this.prefix}-\${id}\`; }
  formatArrow = (id: number) => \`\${this.prefix}-\${id}\`;
}
const s = new OrderService();
[1, 2].map(s.format);            // TypeError: this undefined
[1, 2].map(s.format.bind(s));    // OK
[1, 2].map(s.formatArrow);       // OK: arrow field terikat ke instance`, 'ts'),
          followUp('"Kekurangan arrow function sebagai class field?" Dibuat ulang untuk setiap instance (tidak di prototype), tidak bisa di-override lewat `super` dengan cara biasa.'),
        ]),
        qa('TSI-04', 'Apa beda `==` dan `===`? Kapan `==` masih dipakai?', [
          ul(
            '`===` (strict equality): tanpa konversi tipe. Ini default yang benar.',
            '`==` (loose equality): melakukan **type coercion** dengan aturan yang sulit diingat: `0 == ""` true, `"0" == false` true, `[] == false` true, `null == 0` false.',
            '`null == undefined` true, dan keduanya tidak `==` nilai lain. Karena itu idiom `x == null` kadang sengaja dipakai untuk mengecek null **atau** undefined sekaligus (beberapa style guide mengizinkan pengecualian ini).',
            '`NaN === NaN` false; gunakan `Number.isNaN`. `Object.is` membedakan `+0`/`-0` dan menganggap `NaN` sama dengan `NaN`.',
            'Objek dibandingkan **berdasarkan referensi**, bukan isi.',
          ),
          followUp('"Bagaimana membandingkan dua objek secara isi?" Bandingkan field yang relevan, pakai util deep-equal teruji, atau `node:util` `isDeepStrictEqual`. Hindari `JSON.stringify` karena urutan key dan tipe khusus.'),
        ]),
        qa('TSI-05', '`type` vs `interface` di TypeScript: kapan memakai yang mana?', [
          table(['Kemampuan', '`interface`', '`type`'], [
            ['Bentuk objek', 'Ya', 'Ya'],
            ['Union, tuple, primitive alias, mapped/conditional type', 'Tidak', 'Ya'],
            ['Declaration merging (deklarasi dua kali digabung)', 'Ya', 'Tidak (error duplikat)'],
            ['Pewarisan', '`extends` (konflik properti dilaporkan)', 'Intersection `&` (konflik bisa diam-diam jadi `never`)'],
          ]),
          ul(
            'Praktik umum: `interface` untuk kontrak objek/API publik yang mungkin diperluas (dan augmentasi library, mis. `Express.Request`), `type` untuk union, utilitas, dan komposisi.',
            'Yang lebih penting dari pilihannya adalah **konsistensi** dalam satu codebase.',
            'Pada hierarki besar, `interface extends` cenderung lebih ramah performa compiler daripada intersection berlapis.',
          ),
        ]),
        qa('TSI-06', 'Apa beda `any`, `unknown`, dan `never`?', [
          ul(
            '**`any`**: mematikan pemeriksaan tipe. Bisa di-assign ke dan dari apa saja; error "menular" diam-diam ke seluruh kode.',
            '**`unknown`**: tipe atas yang aman. Bisa menerima nilai apa saja, tetapi **harus di-narrowing** (`typeof`, `instanceof`, type guard, validasi skema) sebelum dipakai. Tepat untuk input eksternal: `JSON.parse`, body request, `catch (e)`.',
            '**`never`**: tipe tanpa nilai. Muncul pada fungsi yang selalu throw/tidak pernah kembali, cabang yang mustahil, dan pemeriksaan exhaustive.',
          ),
          code('unknown + validasi skema di batas sistem', `import { z } from 'zod';

const CreateOrder = z.object({ productId: z.string().uuid(), qty: z.number().int().positive() });
type CreateOrder = z.infer<typeof CreateOrder>;

function parseBody(body: unknown): CreateOrder {
  return CreateOrder.parse(body);   // runtime check + tipe statis dari satu sumber
}`, 'ts'),
          followUp('"TypeScript sudah mengecek tipe, kenapa butuh validasi runtime?" Tipe dihapus saat compile; data dari jaringan tidak pernah dicek oleh compiler.'),
        ]),
        qa('TSI-07', 'Jelaskan generics dan constraint di TypeScript dengan contoh nyata.', [
          code('Generic dengan constraint & keyof', `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((it) => it[key]);
}
pluck([{ id: 1, nama: 'Budi' }], 'nama');   // string[]
pluck([{ id: 1 }], 'email');                // error compile: 'email' bukan key

interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}

type ApiResponse<T, E = { message: string }> =
  | { ok: true; data: T }
  | { ok: false; error: E };`, 'ts'),
          ul(
            'Biarkan TypeScript **menginfer** type argument; tulis eksplisit hanya bila inferensi gagal.',
            'Type parameter yang hanya muncul sekali (mis. hanya di return) biasanya tanda desain yang salah: itu sama saja dengan cast.',
            '`const` type parameter (`<const T>`) mempertahankan literal type, berguna untuk konfigurasi/route.',
          ),
          learn(['Fungsi & Generic Dasar', '#js.ts-fungsi-generic-dasar']),
        ]),
        qa('TSI-08', 'Apa itu discriminated union? Bagaimana memastikan semua kasus ditangani?', [
          paragraph('Union dari beberapa tipe objek yang punya satu properti literal bersama (*discriminant*, mis. `status`/`kind`). Saat properti itu dicek, TypeScript mempersempit tipenya secara otomatis.'),
          code('Exhaustive check dengan never', `type Payment =
  | { status: 'pending'; createdAt: Date }
  | { status: 'paid'; paidAt: Date; method: 'VA' | 'QRIS' | 'CARD' }
  | { status: 'failed'; reason: string };

function label(p: Payment): string {
  switch (p.status) {
    case 'pending': return 'Menunggu pembayaran';
    case 'paid':    return \`Lunas via \${p.method}\`;      // p.method hanya ada di sini
    case 'failed':  return \`Gagal: \${p.reason}\`;
    default: {
      const _exhaustive: never = p;   // error compile bila ada status baru yang lupa ditangani
      return _exhaustive;
    }
  }
}`, 'ts'),
          paragraph('Polanya membuat state yang mustahil tidak bisa direpresentasikan (tidak ada `paidAt` pada pembayaran gagal), jauh lebih aman daripada satu objek dengan banyak field opsional.'),
          learn(['Object, Union & Narrowing', '#js.ts-object-union-narrowing']),
        ]),
        qa('TSI-09', 'Sebutkan utility types yang sering dipakai, lalu implementasikan `Partial` sendiri.', [
          table(['Utility', 'Fungsi'], [
            ['`Partial<T>` / `Required<T>`', 'Semua properti opsional / wajib'],
            ['`Readonly<T>`', 'Semua properti readonly (dangkal)'],
            ['`Pick<T, K>` / `Omit<T, K>`', 'Ambil / buang sebagian key'],
            ['`Record<K, V>`', 'Objek dengan key K dan nilai V'],
            ['`ReturnType<F>` / `Parameters<F>` / `Awaited<T>`', 'Turunkan tipe dari fungsi/Promise'],
            ['`Exclude<U, X>` / `Extract<U, X>` / `NonNullable<T>`', 'Operasi pada union'],
          ]),
          code('Mapped type & conditional type', `type MyPartial<T> = { [K in keyof T]?: T[K] };

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type UpdateUserDto = Partial<Omit<User, 'id' | 'createdAt'>>;`, 'ts'),
          followUp('Operator `satisfies` sering ditanyakan bersama: ia memeriksa nilai terhadap tipe tanpa melebarkan tipe hasil inferensinya.'),
          learn(['Utility Types & Proyek', '#js.ts-utility-proyek']),
        ]),
      ],
    },
    heading('Node.js'),
    {
      type: 'qa',
      items: [
        qa('TSI-10', 'Apa itu backpressure di Node.js streams dan bagaimana menanganinya?', [
          paragraph('Backpressure terjadi ketika producer (readable) menghasilkan data lebih cepat daripada consumer (writable) memprosesnya. Tanpa kendali, data menumpuk di buffer memori sampai proses kehabisan memori.'),
          ul(
            '`writable.write(chunk)` mengembalikan `false` bila buffer internal melewati `highWaterMark`; producer harus berhenti dan menunggu event `drain`.',
            '`pipeline()` dari `node:stream/promises` menangani backpressure, propagasi error, dan cleanup semua stream secara otomatis. Lebih aman daripada `.pipe()` yang tidak meneruskan error.',
            'Async iterator (`for await (const chunk of readable)`) juga menghormati backpressure secara alami.',
          ),
          code('Ekspor CSV besar tanpa memuat semua ke memori', `import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { Transform } from 'node:stream';

app.get('/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/gzip');
  const toCsv = new Transform({
    objectMode: true,
    transform(row, _enc, cb) { cb(null, \`\${row.id},\${row.amount}\\n\`); },
  });
  await pipeline(db.streamQuery('SELECT id, amount FROM transaksi'), toCsv, createGzip(), res);
});`, 'ts'),
          followUp('"Bagaimana bila client memutus koneksi di tengah?" `pipeline` menghancurkan semua stream dan menolak promise; tangani error-nya dan pastikan cursor DB ikut ditutup.'),
          learn(['Streams & Worker Threads', '#js.node-streams-workers']),
        ]),
        qa('TSI-11', 'Worker threads vs cluster vs child process: kapan memakai masing-masing?', [
          table(['Mekanisme', 'Isolasi', 'Cocok untuk'], [
            ['`worker_threads`', 'Thread dalam satu proses, V8 isolate terpisah; bisa berbagi memori via `SharedArrayBuffer`', 'Tugas **CPU-bound** (hash, kompresi, parsing besar, image) tanpa memblokir event loop'],
            ['`cluster`', 'Beberapa proses Node yang berbagi port server', 'Memakai semua core untuk server HTTP dalam satu mesin'],
            ['`child_process`', 'Proses OS terpisah', 'Menjalankan program/skrip lain (ffmpeg, Python)'],
          ]),
          ul(
            'Di Kubernetes/container, skala horizontal biasanya lewat **replika pod** (satu proses Node per container) daripada `cluster`.',
            'Worker thread punya biaya start dan memori; pakai **pool** (mis. Piscina) daripada membuat worker per request.',
            'I/O tidak perlu worker thread: libuv sudah menanganinya secara asinkron.',
          ),
          learn(['Streams & Worker Threads', '#js.node-streams-workers']),
        ]),
        qa('TSI-12', 'Bagaimana error handling yang benar di kode async Node.js?', [
          ul(
            'Gunakan `async/await` + `try/catch` di batas yang tepat (handler, job), bukan di setiap fungsi.',
            'Promise yang ditolak tanpa handler memicu `unhandledRejection`; di Node modern perilaku default-nya adalah **menghentikan proses**. Daftarkan handler untuk logging lalu biarkan proses restart dengan bersih.',
            '**Floating promise** (memanggil fungsi async tanpa `await`/`.catch`) adalah sumber bug utama; aktifkan aturan lint `no-floating-promises`.',
            '`Promise.all` gagal cepat pada penolakan pertama (yang lain tetap berjalan); `Promise.allSettled` menunggu semuanya. Batasi konkurensi untuk daftar besar.',
            'Express 5 meneruskan promise yang ditolak dari handler ke error middleware; di Express 4 perlu wrapper atau `next(err)`. NestJS memakai exception filter.',
            'Bungkus error dengan konteks memakai `new Error("gagal simpan order", { cause: err })`.',
            'Batalkan pekerjaan dengan `AbortSignal`/`AbortSignal.timeout(ms)` pada `fetch` dan API Node yang mendukungnya.',
          ),
          code('Pola dasar', `process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandled rejection');
  process.exit(1);                         // biarkan orchestrator me-restart
});

const results = await Promise.allSettled(ids.map((id) => fetchUser(id)));
const failed = results.filter((r) => r.status === 'rejected');`, 'ts'),
          followUp('"Kenapa tidak melanjutkan proses setelah `uncaughtException`?" State aplikasi bisa sudah rusak; aturan amannya log, tutup koneksi dengan rapi, lalu keluar.'),
        ]),
        qa('TSI-13', 'Apa beda ES Modules dan CommonJS? Apa masalah yang sering muncul?', [
          table(['Aspek', 'CommonJS', 'ES Modules'], [
            ['Sintaks', '`require` / `module.exports`', '`import` / `export`'],
            ['Pemuatan', 'Sinkron, dinamis saat runtime', 'Dianalisis statis, mendukung top-level `await`'],
            ['Penanda di Node', '`.cjs` atau default tanpa `"type"`', '`.mjs` atau `"type": "module"` di package.json'],
            ['`__dirname`', 'Tersedia', 'Pakai `import.meta.dirname` / `import.meta.url`'],
            ['Tree shaking', 'Sulit', 'Mudah karena statis'],
          ]),
          ul(
            'ESM bisa meng-`import` CJS. Node versi terbaru juga bisa `require()` modul ESM yang tidak memakai top-level await; di versi lama ini error `ERR_REQUIRE_ESM`.',
            'Di ESM, path relatif wajib lengkap dengan ekstensi (`./db.js`).',
            '**Dual package hazard**: paket yang menyediakan build CJS dan ESM bisa termuat dua kali dengan state terpisah.',
            'TypeScript: pakai `"module": "nodenext"` agar aturan resolusi sama dengan Node.',
          ),
          learn(['Modul & Runtime', '#js.js-modul-runtime']),
        ]),
        qa('TSI-14', 'Apa penyebab umum memory leak di Node.js dan bagaimana menginvestigasinya?', [
          ul(
            '**Cache tanpa batas** (Map global yang terus bertambah). Gunakan LRU dengan ukuran/TTL, atau `WeakMap` bila key-nya objek.',
            '**Event listener tidak dilepas** (peringatan `MaxListenersExceededWarning` adalah gejala).',
            '**Timer** `setInterval` yang tidak pernah di-`clearInterval`.',
            '**Closure** yang menahan objek besar (request, buffer) di struktur berumur panjang.',
            'Promise yang tidak pernah selesai dan menumpuk, atau antrean in-memory tanpa batas.',
          ),
          ol(
            'Konfirmasi: grafik heap/RSS naik terus walaupun beban stabil (bukan sekadar GC yang malas).',
            'Ambil dua sampai tiga **heap snapshot** berselang (`node --inspect` + Chrome DevTools, `v8.writeHeapSnapshot()`, atau `--heapsnapshot-near-heap-limit`).',
            'Bandingkan snapshot (view *Comparison*), cari konstruktor yang jumlahnya terus naik, lalu ikuti *retainers* sampai ke akar.',
            'Perbaiki, lalu buktikan dengan load test.',
          ),
          followUp('"RSS naik tapi heap stabil?" Kemungkinan memori di luar heap V8: Buffer/ArrayBuffer, addon native, atau fragmentasi. Cek `process.memoryUsage()` (field `external`, `arrayBuffers`).'),
        ]),
        qa('TSI-15', 'Bagaimana kamu mengamankan REST API berbasis Express atau NestJS?', [
          table(['Lapisan', 'Kontrol'], [
            ['Transport & header', 'HTTPS, `helmet`, matikan `x-powered-by`, CORS dengan allowlist origin (bukan `*` bila memakai cookie)'],
            ['Input', 'Validasi skema (zod; di Nest `ValidationPipe` dengan `whitelist` + `forbidNonWhitelisted`), batasi ukuran body, waspadai ReDoS & prototype pollution'],
            ['Autentikasi', 'Verifikasi JWT dengan algoritma & issuer/audience yang ditetapkan, masa berlaku pendek, refresh token aman; cookie `HttpOnly`, `Secure`, `SameSite`'],
            ['Otorisasi', 'Cek kepemilikan **per resource** (cegah IDOR/BOLA), bukan hanya "sudah login"; guard/policy terpusat'],
            ['Data', 'Query terparameter/ORM (cegah SQL injection), jangan kembalikan field sensitif, enkripsi data penting'],
            ['Abuse', 'Rate limiting per IP/user, lockout login, idempotency key untuk pembayaran'],
            ['Operasional', 'Secret di env/secret manager, `npm audit`/Dependabot, error response tanpa stack trace, audit log'],
          ]),
          followUp('Rujuk **OWASP API Security Top 10**; Broken Object Level Authorization (BOLA) ada di urutan pertama dan paling sering ditemukan di API nyata.'),
        ]),
      ],
    },
    heading('Referensi'),
    references(
      ['Node.js: The Event Loop, Timers, and process.nextTick()', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'],
      ["Node.js: Don't Block the Event Loop", 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'],
      ['Node.js: Stream', 'https://nodejs.org/api/stream.html'],
      ['Node.js: Worker threads', 'https://nodejs.org/api/worker_threads.html'],
      ['Node.js: ECMAScript modules', 'https://nodejs.org/api/esm.html'],
      ['TypeScript Handbook: Narrowing', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'],
      ['TypeScript Handbook: Generics', 'https://www.typescriptlang.org/docs/handbook/2/generics.html'],
      ['TypeScript: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html'],
      ['MDN: this', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'],
      ['Express: Security Best Practices', 'https://expressjs.com/en/advanced/best-practice-security.html'],
      ['OWASP API Security Top 10', 'https://owasp.org/API-Security/'],
    ),
  ],
};

/* ──────────────────────── Kotlin & C#/.NET ──────────────────────── */

const ktCsModule: Omit<Module, 'code'> = {
  id: 'iv-kotlin-dotnet',
  title: 'Interview Kotlin & C#/.NET',
  summary: '16 soal: 8 soal Kotlin (null safety, data & sealed class, coroutines, structured concurrency, Flow vs StateFlow, scope & extension function, interop Java) dan 8 soal C# (value vs reference type, async/await & deadlock, IEnumerable vs IQueryable, deferred execution, DI lifetime, EF Core, records, nullable reference types).',
  track: KT_CS,
  source: interviewLanguageSource,
  duration: '80 menit',
  level: 'Hard',
  blocks: [
    howTo,
    heading('Kotlin'),
    {
      type: 'qa',
      items: [
        qa('KTI-01', 'Bagaimana null safety di Kotlin bekerja? Kapan `!!` boleh dipakai?', [
          ul(
            'Tipe dibedakan di level compiler: `String` tidak bisa null, `String?` bisa. Memanggil method pada `String?` tanpa pengecekan adalah error compile.',
            'Operator: safe call `?.`, Elvis `?:` (nilai default atau `return`/`throw`), `let` untuk blok non-null, smart cast setelah `if (x != null)`.',
            '`!!` melempar `NullPointerException` bila null. Pakai hanya bila kamu benar-benar bisa membuktikan nilainya non-null dan ingin gagal keras; di kode bisnis biasanya tanda desain yang kurang tepat.',
            '`lateinit var` untuk properti yang diisi belakangan (DI, setup test); mengaksesnya sebelum diisi melempar `UninitializedPropertyAccessException`.',
          ),
          code('Contoh', `fun kotaPengiriman(user: User?): String =
    user?.alamat?.kota ?: "Belum diisi"

fun requireOrder(id: Long): Order =
    repo.findByIdOrNull(id) ?: throw OrderNotFound(id)`, 'kotlin'),
          followUp('"Apa itu platform type?" Nilai dari kode Java ditandai `String!`: Kotlin tidak tahu apakah bisa null, jadi tanggung jawab ada di kita. Lihat KTI-08.'),
          learn(['Null Safety', '#kotlin.kt-null-safety']),
        ]),
        qa('KTI-02', 'Apa itu data class dan sealed class? Beri contoh pemakaiannya di backend.', [
          ul(
            '**data class** menghasilkan `equals`/`hashCode`/`toString`/`copy`/`componentN` dari properti di primary constructor. Cocok untuk DTO dan value object. Properti di body class tidak ikut `equals`.',
            '**sealed class/interface** membatasi subclass ke modul & paket yang sama, sehingga `when` bisa **exhaustive** tanpa `else`. Menambah subtype baru memaksa semua `when` diperbarui.',
          ),
          code('Hasil operasi sebagai sealed hierarchy', `sealed interface PaymentResult {
    data class Success(val trxId: String) : PaymentResult
    data class Declined(val reason: String) : PaymentResult
    data object Timeout : PaymentResult
}

fun toResponse(r: PaymentResult): ResponseEntity<Any> = when (r) {
    is PaymentResult.Success  -> ResponseEntity.ok(r)
    is PaymentResult.Declined -> ResponseEntity.unprocessableEntity().body(r.reason)
    PaymentResult.Timeout     -> ResponseEntity.status(504).build()
}   // tanpa else: compiler memastikan semua kasus tertangani`, 'kotlin'),
          trap('Jangan memakai data class untuk entity JPA: `equals`/`hashCode` berbasis semua field bermasalah dengan lazy loading dan id yang baru terisi setelah persist. Pakai class biasa dengan plugin `kotlin-jpa`/no-arg.'),
          learn(['Class, Data & Sealed', '#kotlin.kt-class-data-sealed']),
        ]),
        qa('KTI-03', 'Coroutine vs thread: apa bedanya dan bagaimana `suspend` bekerja?', [
          ul(
            'Coroutine adalah komputasi yang bisa **ditangguhkan tanpa memblokir thread**. Ribuan coroutine bisa berjalan di atas beberapa thread.',
            'Fungsi `suspend` dikompilasi menjadi state machine dengan parameter `Continuation` (CPS). Saat menunggu I/O, coroutine melepas thread dan dilanjutkan nanti, bisa di thread lain.',
            '**Dispatcher** menentukan thread: `Dispatchers.Default` (CPU-bound, sebanyak core), `Dispatchers.IO` (pool elastis untuk I/O blocking), `Dispatchers.Main` (UI Android).',
            'Memanggil kode **blocking** (JDBC, `Thread.sleep`) di dalam coroutine tetap memblokir thread; bungkus dengan `withContext(Dispatchers.IO)`.',
          ),
          code('Panggilan paralel', `suspend fun dashboard(userId: Long): Dashboard = coroutineScope {
    val profil = async { profileClient.get(userId) }
    val saldo  = async { walletClient.balance(userId) }
    Dashboard(profil.await(), saldo.await())
}`, 'kotlin'),
          followUp('"Coroutines vs virtual threads Java 21?" Keduanya membuat I/O murah. Virtual threads mempertahankan gaya blocking tanpa mengubah API; coroutines memberi structured concurrency, Flow, dan kontrol pembatalan yang eksplisit di level bahasa.'),
          learn(['Coroutines', '#kotlin.kt-coroutines']),
        ]),
        qa('KTI-04', 'Apa itu structured concurrency? Bagaimana pembatalan dan error merambat?', [
          ul(
            'Setiap coroutine diluncurkan di dalam **scope** dan menjadi anak dari `Job` scope itu. Parent baru selesai setelah semua anak selesai, jadi tidak ada coroutine yang "bocor".',
            'Dengan `Job` biasa / `coroutineScope`: satu anak gagal → **parent dan semua saudara dibatalkan**, exception merambat ke atas.',
            'Dengan `SupervisorJob` / `supervisorScope`: kegagalan anak tidak membatalkan saudara (cocok untuk tugas independen).',
            'Pembatalan **kooperatif**: fungsi suspend dari kotlinx.coroutines memeriksa pembatalan; loop CPU harus memanggil `ensureActive()`/`yield()`.',
            'Hindari `GlobalScope`: tidak terikat lifecycle. Pakai scope milik framework (`viewModelScope`, scope request di Spring) atau scope yang kamu kelola sendiri.',
          ),
          trap('Jangan menelan `CancellationException`. `try { ... } catch (e: Exception) { }` atau `runCatching { }` di sekitar fungsi suspend bisa menangkapnya dan membuat coroutine yang seharusnya batal terus berjalan. Lempar ulang bila menangkapnya.'),
          learn(['Coroutines', '#kotlin.kt-coroutines']),
        ]),
        qa('KTI-05', 'Apa beda `Flow`, `StateFlow`, dan `SharedFlow`?', [
          table(['Tipe', 'Sifat', 'Contoh pemakaian'], [
            ['`Flow`', '**Cold**: producer berjalan ulang untuk setiap collector', 'Stream hasil query, pemrosesan data bertahap'],
            ['`StateFlow`', '**Hot**, selalu punya nilai terkini (`.value`), konflasi, hanya memancarkan bila nilai berubah (`equals`)', 'State UI/ViewModel, status koneksi'],
            ['`SharedFlow`', '**Hot**, bisa banyak subscriber, `replay` & buffer bisa dikonfigurasi, tanpa nilai awal', 'Event broadcast ke banyak pendengar'],
          ]),
          code('Mengubah Flow menjadi StateFlow', `val uiState: StateFlow<UiState> = repository.transaksiFlow()
    .map { UiState.Data(it) }
    .catch { emit(UiState.Error(it.message)) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)`, 'kotlin'),
          ul(
            'Karena konflasi, StateFlow **tidak cocok untuk event sekali jalan** (navigasi, toast): event bisa hilang atau tergabung.',
            'Operator penting: `map`, `filter`, `flatMapLatest`, `debounce`, `combine`, `flowOn` (mengganti dispatcher upstream), `catch`.',
          ),
          learn(['Flow', '#kotlin.kt-flow']),
        ]),
        qa('KTI-06', 'Jelaskan perbedaan scope function `let`, `run`, `with`, `apply`, dan `also`.', [
          table(['Fungsi', 'Objek di dalam blok', 'Mengembalikan', 'Pemakaian khas'], [
            ['`let`', '`it`', 'Hasil lambda', 'Blok untuk nilai non-null: `x?.let { }`, transformasi'],
            ['`run`', '`this`', 'Hasil lambda', 'Konfigurasi + hitung hasil'],
            ['`with(obj)`', '`this`', 'Hasil lambda', 'Memanggil banyak method pada satu objek (bukan extension)'],
            ['`apply`', '`this`', 'Objek itu sendiri', 'Inisialisasi/konfigurasi objek (builder)'],
            ['`also`', '`it`', 'Objek itu sendiri', 'Efek samping: logging, validasi'],
          ]),
          code('Contoh', `val client = OkHttpClient.Builder().apply {
    connectTimeout(Duration.ofSeconds(3))
    readTimeout(Duration.ofSeconds(10))
}.build()

val order = repo.save(newOrder).also { log.info("order dibuat {}", it.id) }`, 'kotlin'),
          followUp('Kritik yang sering diharapkan interviewer: rantai scope function yang bersarang membuat `it`/`this` ambigu. Keterbacaan lebih penting daripada ringkas.'),
          learn(['Koleksi & Scope Function', '#kotlin.kt-koleksi-scope']),
        ]),
        qa('KTI-07', 'Bagaimana extension function bekerja? Apa batasannya?', [
          paragraph('Extension function menambah fungsi ke tipe yang sudah ada tanpa mewarisi atau mengubah source-nya. Di bytecode ia menjadi **fungsi static** dengan receiver sebagai parameter pertama.'),
          code('Contoh', `fun BigDecimal.toRupiah(): String =
    NumberFormat.getCurrencyInstance(Locale.of("id", "ID")).format(this)

fun String?.isNullOrBlankId(): Boolean = this == null || this.isBlank()   // receiver nullable`, 'kotlin'),
          ul(
            'Di-resolve secara **statis** berdasarkan tipe yang dideklarasikan, bukan tipe runtime: tidak ada polymorphism/override.',
            'Bila class sudah punya member function dengan signature sama, **member yang menang**.',
            'Tidak bisa mengakses member `private`/`protected` receiver, dan extension property tidak punya backing field.',
            'Gunakan untuk utilitas dan DSL; hindari menaruh logika bisnis inti tersebar di extension yang sulit ditemukan.',
          ),
          learn(['Generic, DSL & Interop Java', '#kotlin.kt-generic-dsl-java-interop']),
        ]),
        qa('KTI-08', 'Apa yang perlu diperhatikan saat Kotlin dan Java berinteroperasi (misalnya di proyek Spring)?', [
          ul(
            '**Platform types** dari Java (`T!`): nullability tidak diketahui. Anotasi seperti `@Nullable`/`@NonNull` (JSpecify, JetBrains, dan lainnya) dibaca compiler Kotlin untuk menentukan tipe.',
            'Class dan method Kotlin **final secara default**; Spring butuh proxy → pakai plugin `kotlin-spring` (all-open). Entity JPA butuh constructor tanpa argumen → plugin `kotlin-jpa` (no-arg).',
            'Kotlin tidak punya checked exception; tambahkan `@Throws(IOException::class)` agar pemanggil Java bisa menangkapnya.',
            '`@JvmStatic` (static di companion), `@JvmOverloads` (overload untuk default argument), `@JvmField` (field publik tanpa getter), `@JvmName` (mengatasi bentrok signature).',
            'Koleksi read-only Kotlin (`List`) adalah `java.util.List` biasa di Java: kode Java tetap bisa memodifikasinya.',
            'SAM conversion memungkinkan lambda Kotlin dipakai untuk interface fungsional Java.',
          ),
          learn(['Generic, DSL & Interop Java', '#kotlin.kt-generic-dsl-java-interop'], ['Spring Boot API dengan Kotlin', '#kotlin.kt-spring-boot-api']),
        ]),
      ],
    },
    heading('C# & .NET'),
    {
      type: 'qa',
      items: [
        qa('CSI-01', 'Apa beda value type dan reference type di C#? Apa itu boxing?', [
          table(['Aspek', 'Value type (`struct`, `enum`, `int`, `record struct`)', 'Reference type (`class`, `record`, `string`, array)'], [
            ['Assignment', 'Menyalin seluruh nilai', 'Menyalin referensi; dua variabel menunjuk objek yang sama'],
            ['Null', 'Tidak bisa (kecuali `Nullable<T>`/`int?`)', 'Bisa'],
            ['Lokasi', 'Disimpan *inline*: di stack untuk variabel lokal, atau di dalam objek yang memuatnya', 'Objek di managed heap, dikelola GC'],
          ]),
          ul(
            '"Struct selalu di stack" adalah penyederhanaan yang keliru: struct yang menjadi field class atau elemen array berada di heap.',
            '**Boxing**: value type dikonversi ke `object`/interface → alokasi heap + salinan. Terjadi diam-diam, mis. `object o = 42;` atau memanggil method interface pada struct lewat variabel bertipe interface. Generics menghindarinya.',
            'Struct sebaiknya kecil dan **immutable** (`readonly struct`); struct mutable menghasilkan bug karena yang diubah adalah salinan.',
            '`string` adalah reference type tetapi immutable dan `==`-nya membandingkan isi.',
          ),
          followUp('"Apa itu `ref struct`/`Span<T>`?" Tipe yang wajib tinggal di stack, untuk memproses potongan memori tanpa alokasi; tidak boleh disimpan di field class atau dipakai melewati `await`.'),
          learn(['OOP, Class & Record', '#csharp.cs-oop-class-record']),
        ]),
        qa(
          'CSI-02',
          'Kenapa kode di bawah bisa deadlock di aplikasi desktop/ASP.NET lama? Bagaimana praktik async/await yang benar?',
          [
            paragraph('Di lingkungan dengan **SynchronizationContext** satu thread (WinForms/WPF, ASP.NET klasik), `.Result` memblokir thread itu. Saat `GetAsync` selesai, kelanjutan setelah `await` ingin kembali ke context yang sama, tetapi thread itu sedang diblokir menunggu hasil → keduanya saling menunggu.'),
            ul(
              'ASP.NET Core **tidak** punya SynchronizationContext, jadi deadlock klasik ini tidak terjadi, tetapi *sync-over-async* tetap merusak: thread pool kehabisan thread (**thread pool starvation**) di bawah beban.',
              '**Async all the way**: jangan pernah `.Result`/`.Wait()`/`.GetAwaiter().GetResult()` di jalur request.',
              'Di kode **library**, `ConfigureAwait(false)` menghindari kembali ke context pemanggil.',
              'Hindari `async void` kecuali event handler: exception-nya tidak bisa ditangkap pemanggil dan bisa menjatuhkan proses.',
              'Teruskan `CancellationToken` sampai ke panggilan DB/HTTP.',
              'Jalankan operasi independen paralel dengan `Task.WhenAll`; `Task.Run` untuk CPU-bound, bukan untuk "membuat I/O jadi async".',
            ),
            code('Versi benar', `public async Task<IActionResult> Get(int id, CancellationToken ct)
{
    var user = await _client.GetFromJsonAsync<UserDto>($"users/{id}", ct);
    return user is null ? NotFound() : Ok(user);
}`, 'csharp'),
            followUp('"Kapan memakai `ValueTask`?" Bila method sangat sering selesai secara sinkron (mis. cache hit) dan alokasi `Task` terukur menjadi masalah. Aturannya ketat: jangan di-await dua kali.'),
            learn(['Async/Await', '#csharp.cs-async-await']),
          ],
          [code('UserController.cs', `public IActionResult Get(int id)
{
    var user = _client.GetAsync($"users/{id}").Result;   // sync-over-async
    return Ok(user);
}`, 'csharp')],
        ),
        qa('CSI-03', 'Apa beda `IEnumerable<T>` dan `IQueryable<T>`? Apa risikonya di EF Core?', [
          table(['Aspek', '`IEnumerable<T>`', '`IQueryable<T>`'], [
            ['Eksekusi', 'Di memori (LINQ to Objects)', 'Diterjemahkan provider (EF Core → SQL)'],
            ['Lambda', '`Func<T, bool>` (kode biasa)', '`Expression<Func<T, bool>>` (expression tree)'],
            ['Filter `Where`', 'Setelah data dimuat', 'Masuk ke `WHERE` di database'],
          ]),
          code('Jebakan: filter terjadi di memori', `// Parameter bertipe IEnumerable → query berhenti dikomposisi di DB
IEnumerable<Order> Aktif(IEnumerable<Order> src) => src.Where(o => o.Status == "PAID");

var hasil = Aktif(db.Orders).Take(10).ToList();
// SQL: SELECT * FROM Orders  ← seluruh tabel ditarik, filter & Take di memori

IQueryable<Order> AktifQ(IQueryable<Order> src) => src.Where(o => o.Status == "PAID");
// SQL: SELECT TOP(10) ... WHERE Status = 'PAID'`, 'csharp'),
          ul(
            '`AsEnumerable()`/`ToList()` terlalu awal memindahkan sisa query ke memori.',
            'Method C# yang tidak bisa diterjemahkan di tengah query membuat EF Core melempar exception (kecuali di `Select` terakhir), bukan diam-diam mengevaluasi di client.',
          ),
          learn(['Koleksi & LINQ', '#csharp.cs-koleksi-linq']),
        ]),
        qa('CSI-04', 'Apa itu deferred execution di LINQ? Apa bug yang bisa muncul?', [
          paragraph('Operator seperti `Where`, `Select`, `OrderBy` hanya **membangun query**; eksekusi terjadi saat hasil dienumerasi (`foreach`, `ToList`, `Count`, `First`, `Sum`, `Any`).'),
          code('Bug karena deferred execution', `var minimum = 100_000m;
var besar = transaksi.Where(t => t.Jumlah > minimum);   // belum dieksekusi
minimum = 1_000_000m;                                     // closure menangkap variabel, bukan nilai
Console.WriteLine(besar.Count());                         // memakai 1_000_000

var q = db.Orders.Where(o => o.Paid);
var total = q.Count();      // query #1 ke DB
var list  = q.ToList();     // query #2 ke DB: multiple enumeration`, 'csharp'),
          ul(
            '**Multiple enumeration**: tiap enumerasi menjalankan ulang query/iterator (mahal, bahkan hasilnya bisa berbeda). Materialisasi sekali dengan `ToList()` bila hasilnya dipakai berkali-kali.',
            'Exception dari query (mis. pembagian nol di `Select`) baru muncul saat enumerasi, jauh dari baris yang menulisnya.',
            'Kebalikannya, deferred execution memungkinkan komposisi query bertahap (filter dinamis) sebelum dieksekusi sekali.',
          ),
        ]),
        qa('CSI-05', 'Jelaskan lifetime DI di ASP.NET Core dan apa itu captive dependency.', [
          table(['Lifetime', 'Instance', 'Contoh'], [
            ['Singleton', 'Satu untuk seluruh aplikasi', 'Cache, `HttpClient` factory, konfigurasi'],
            ['Scoped', 'Satu per scope (per request HTTP)', '`DbContext`, unit of work, user saat ini'],
            ['Transient', 'Baru setiap kali di-resolve', 'Service ringan tanpa state'],
          ]),
          paragraph('**Captive dependency**: service berumur panjang menahan service berumur lebih pendek, mis. singleton yang menerima `DbContext` (scoped) di constructor. `DbContext` itu terjebak hidup selamanya dan dipakai bersamaan oleh banyak request, padahal **tidak thread-safe** → data basi, exception konkurensi, kebocoran memori.'),
          code('Memakai service scoped dari BackgroundService (singleton)', `public sealed class OutboxWorker(IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            await using var scope = scopes.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            // proses batch outbox ...
            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }
}`, 'csharp'),
          ul(
            'Di environment Development, container default memvalidasi scope (`ValidateScopes`) dan melempar exception saat scoped di-resolve dari root/singleton.',
            'Transient `IDisposable` yang di-resolve dari root provider baru dibuang saat aplikasi berhenti: sumber kebocoran yang halus.',
          ),
          learn(['Generic, DI & Exception', '#csharp.cs-generic-di-exception']),
        ]),
        qa('CSI-06', 'Bagaimana change tracking EF Core bekerja, dan bagaimana mendeteksi serta memperbaiki N+1 query?', [
          ul(
            'Secara default entity hasil query **di-track**: EF menyimpan snapshot dan `SaveChanges()` menghasilkan `UPDATE` untuk properti yang berubah.',
            'Untuk endpoint baca, `AsNoTracking()` (atau proyeksi ke DTO) lebih cepat dan hemat memori.',
            '**N+1**: 1 query untuk daftar + 1 query per baris untuk relasi. Biasanya karena lazy loading atau query di dalam loop.',
          ),
          code('Dari N+1 ke satu query', `// N+1: satu query per order untuk memuat Items (lazy loading / query di loop)
foreach (var o in await db.Orders.ToListAsync(ct))
    total += o.Items.Sum(i => i.Harga);

// Proyeksi: hanya kolom yang dibutuhkan, satu query, tanpa tracking
var ringkasan = await db.Orders
    .Where(o => o.UserId == userId)
    .Select(o => new OrderSummary(o.Id, o.Items.Count, o.Items.Sum(i => i.Harga)))
    .ToListAsync(ct);

// Atau eager loading bila butuh entity lengkap
var orders = await db.Orders.Include(o => o.Items).AsSplitQuery().ToListAsync(ct);`, 'csharp'),
          ul(
            'Deteksi: log SQL (`LogTo`, level `Information` untuk kategori database command), APM/OpenTelemetry, atau test yang menghitung jumlah query.',
            '`Include` beberapa koleksi sekaligus bisa menghasilkan *cartesian explosion*; `AsSplitQuery()` memecahnya menjadi beberapa query.',
            'Update/hapus massal tanpa memuat entity: `ExecuteUpdateAsync`/`ExecuteDeleteAsync`.',
          ),
          learn(['EF Core', '#csharp.cs-ef-core']),
        ]),
        qa('CSI-07', 'Apa itu `record` di C#? Kapan memakainya dan kapan tidak?', [
          ul(
            '`record` (class) adalah reference type dengan **value equality**: dua record sama bila semua propertinya sama. `record struct` adalah versi value type.',
            'Positional record `public record Money(decimal Amount, string Currency);` menghasilkan properti init-only, constructor, `Deconstruct`, `ToString` yang informatif.',
            'Ekspresi `with` membuat salinan dengan perubahan sebagian (non-destructive mutation). Salinannya **dangkal**: koleksi di dalamnya tetap dibagi.',
          ),
          code('Contoh', `public record Money(decimal Amount, string Currency)
{
    public Money Add(Money other) =>
        Currency == other.Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Mata uang beda");
}

new Money(10_000, "IDR") == new Money(10_000, "IDR");   // true`, 'csharp'),
          ul(
            '**Cocok**: DTO, request/response API, value object, event, message.',
            '**Kurang cocok**: entity EF Core (identitas berbasis key dan perlu mutable untuk tracking), atau record dengan properti koleksi (equality koleksi tetap berdasarkan referensi).',
          ),
          learn(['OOP, Class & Record', '#csharp.cs-oop-class-record']),
        ]),
        qa('CSI-08', 'Bagaimana nullable reference types (NRT) bekerja? Apakah ia mencegah NullReferenceException?', [
          ul(
            'Dengan `<Nullable>enable</Nullable>` (default di template proyek baru), `string` berarti "tidak boleh null" dan `string?` berarti "boleh null". Compiler melakukan **flow analysis** dan memberi **warning**.',
            'Ini hanya analisis **compile-time**: tidak ada pemeriksaan runtime. Data dari JSON, reflection, atau library tanpa anotasi tetap bisa null, jadi validasi input tetap perlu.',
            'Operator `!` (null-forgiving) hanya membungkam warning, tidak mengubah perilaku runtime.',
            'Modifier `required` memaksa properti diisi saat inisialisasi objek.',
            'Atribut seperti `[NotNullWhen(true)]`, `[MaybeNullWhen(false)]`, `[MemberNotNull]` membantu compiler memahami method helper (mis. pola `TryGet`).',
            'Jadikan warning nullable sebagai error di CI (`<WarningsAsErrors>nullable</WarningsAsErrors>`) agar disiplin terjaga, dan pakai `ArgumentNullException.ThrowIfNull(x)` di batas API publik.',
          ),
          code('Contoh', `public sealed class CreateUserRequest
{
    public required string Email { get; init; }
    public string? Telepon { get; init; }
}

public bool TryFind(int id, [NotNullWhen(true)] out User? user) { /* ... */ }

if (repo.TryFind(5, out var u))
    Console.WriteLine(u.Email);   // tanpa warning: compiler tahu u tidak null`, 'csharp'),
          learn(['Null & Pattern Matching Modern', '#csharp.cs-null-pattern-modern']),
        ]),
      ],
    },
    heading('Referensi'),
    references(
      ['Kotlin: Null safety', 'https://kotlinlang.org/docs/null-safety.html'],
      ['Kotlin: Sealed classes', 'https://kotlinlang.org/docs/sealed-classes.html'],
      ['Kotlin: Coroutines basics', 'https://kotlinlang.org/docs/coroutines-basics.html'],
      ['Kotlin: Cancellation and timeouts', 'https://kotlinlang.org/docs/cancellation-and-timeouts.html'],
      ['Kotlin: Asynchronous Flow', 'https://kotlinlang.org/docs/flow.html'],
      ['Android: StateFlow and SharedFlow', 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow'],
      ['Kotlin: Scope functions', 'https://kotlinlang.org/docs/scope-functions.html'],
      ['Kotlin: Extensions', 'https://kotlinlang.org/docs/extensions.html'],
      ['Kotlin: Calling Java from Kotlin', 'https://kotlinlang.org/docs/java-interop.html'],
      ['C#: Asynchronous programming', 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/'],
      ['C#: Records', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records'],
      ['C#: Nullable reference types', 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/null-safety/nullable-reference-types'],
      ['C#: LINQ', 'https://learn.microsoft.com/en-us/dotnet/csharp/linq/'],
      ['.NET: Dependency injection', 'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview'],
      ['EF Core: Tracking vs. No-Tracking Queries', 'https://learn.microsoft.com/en-us/ef/core/querying/tracking'],
      ['EF Core: Eager loading', 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager'],
    ),
  ],
};

/* ──────────────────────── Strategi & Behavioral ──────────────────────── */

const behavioralModule: Omit<Module, 'code'> = {
  id: 'iv-strategi-behavioral',
  title: 'Strategi Interview & Pertanyaan Behavioral',
  summary: 'Alur interview teknis dari screening sampai offering, cara menjawab coding & system design, metode STAR dengan contoh lengkap, 8 pertanyaan behavioral dengan contoh jawaban backend developer, dan pertanyaan balik untuk interviewer.',
  track: STRATEGI,
  source: interviewLanguageSource,
  duration: '45 menit',
  level: 'Med',
  blocks: [
    callout('tip', 'Cara latihan', 'Baca alurnya sekali, lalu latih jawaban behavioral dengan **ceritamu sendiri**: jawab dulu di kepala atau rekam suaramu, baru buka contoh jawaban dan tandai **Paham** atau **Ulangi**. Contoh jawaban di sini adalah kerangka, bukan naskah untuk dihafal.'),
    heading('Alur interview teknis'),
    table(['Tahap', 'Bentuk umum', 'Yang dinilai', 'Tips'], [
      ['Screening HR / recruiter', 'Telepon/video 15–30 menit', 'Motivasi, ekspektasi gaji, notice period, komunikasi', 'Siapkan perkenalan 60–90 detik dan rentang gaji yang sudah diriset'],
      ['Tes online / take-home', 'HackerRank/Codility, atau proyek kecil 1–3 hari', 'Kebenaran, kualitas kode, test, README', 'Kerjakan rapi: struktur, test, cara menjalankan, asumsi tertulis'],
      ['Live coding', '45–60 menit bersama engineer', 'Cara berpikir, komunikasi, edge case', 'Klarifikasi soal, sebut pendekatan brute force dulu, lalu optimasi; bicara sambil menulis'],
      ['Technical deep-dive', 'Tanya jawab bahasa/framework & proyekmu', 'Kedalaman pemahaman, pengalaman nyata', 'Siapkan 2–3 proyek yang bisa dijelaskan sampai detail trade-off'],
      ['System design', '45–60 menit, papan tulis/online', 'Kebutuhan, estimasi, desain, trade-off, skalabilitas', 'Ikuti kerangka: requirement → API → data → arsitektur → bottleneck'],
      ['Behavioral / interview user', 'Dengan engineering manager atau lead', 'Kolaborasi, ownership, cara menghadapi konflik & kegagalan', 'Pakai metode STAR dengan angka nyata'],
      ['Offering', 'Penawaran tertulis', 'Negosiasi', 'Bandingkan total paket: gaji pokok, tunjangan, THR, bonus, BPJS, asuransi, kebijakan remote'],
    ]),
    callout('info', 'Konteks di Indonesia', 'Perusahaan korporat dan perbankan sering menambahkan **psikotes** dan medical check-up; startup dan perusahaan multinasional sering mewawancarai dalam **bahasa Inggris** (lihat kurikulum English). Notice period resign yang umum adalah 1 bulan (cek kontrakmu). Saat ditanya gaji, sebutkan apakah angkanya **gross atau take home pay**.'),
    { type: 'h', text: 'Cara menjawab soal coding & system design', level: 3 },
    ol(
      '**Klarifikasi**: ulangi soal dengan kata-katamu, tanyakan ukuran input, format, dan edge case (kosong, duplikat, angka negatif).',
      '**Contoh**: buat 1–2 contoh kecil dan hasil yang diharapkan.',
      '**Pendekatan**: sebutkan solusi naif + kompleksitasnya, lalu tawarkan yang lebih baik sebelum menulis kode.',
      '**Tulis kode** yang bersih dengan nama variabel jelas, sambil menjelaskan.',
      '**Uji**: jalankan contoh secara manual, cek edge case, sebutkan kompleksitas waktu & memori.',
      'Untuk system design: kebutuhan fungsional & non-fungsional → estimasi beban → API → model data → arsitektur → bottleneck & trade-off (konsistensi, caching, antrean, failure).',
    ),
    heading('Metode STAR'),
    table(['Huruf', 'Isi', 'Porsi waktu'], [
      ['**S**ituation', 'Konteks singkat: tim, sistem, skala', '~10%'],
      ['**T**ask', 'Tanggung jawab atau masalahmu secara spesifik', '~10%'],
      ['**A**ction', 'Apa yang **kamu** lakukan (pakai "saya", bukan "kami"), termasuk alasan keputusan', '~60%'],
      ['**R**esult', 'Hasil terukur + pelajaran yang dibawa ke depan', '~20%'],
    ]),
    { type: 'h', text: 'Contoh lengkap: "Ceritakan masalah production yang pernah kamu tangani"', level: 3 },
    {
      type: 'steps',
      items: [
        { title: 'Situation', text: 'Saya backend developer di tim pembayaran sebuah e-commerce. Saat promo tanggal kembar, endpoint pembuatan virtual account mulai timeout dan tingkat error naik ke sekitar 8%.' },
        { title: 'Task', text: 'Saya sedang on-call, jadi tugas saya menstabilkan layanan secepatnya lalu mencari akar masalah supaya tidak terulang di promo berikutnya.' },
        { title: 'Action', text: 'Dari tracing saya melihat connection pool database habis karena setiap request menunggu panggilan ke payment gateway sambil menahan transaksi DB terbuka. Mitigasi cepat: saya menaikkan timeout pemanggilan gateway agar lebih ketat dan mengaktifkan circuit breaker, sehingga request gagal cepat alih-alih menumpuk. Setelah stabil, saya memindahkan panggilan gateway ke luar transaksi DB, menambahkan idempotency key agar retry aman, lalu menulis load test yang meniru pola trafik promo.' },
        { title: 'Result', text: 'Error turun di bawah 0,5% dalam 30 menit. Di promo berikutnya, dengan trafik sekitar dua kali lipat, p95 latensi stabil di bawah 400 ms. Saya menulis postmortem tanpa menyalahkan siapa pun dan menjadikan "jangan menahan transaksi DB saat memanggil layanan eksternal" sebagai checklist code review tim.' },
      ],
    },
    callout('warn', 'Kesalahan umum', 'Cerita terlalu panjang di Situation, memakai "kami" sehingga kontribusimu tidak terlihat, tanpa angka, menyalahkan orang lain, atau tidak menyebut pelajaran. Siapkan 5–6 cerita yang bisa dipakai ulang untuk berbagai pertanyaan.'),
    heading('8 pertanyaan behavioral yang sering muncul'),
    {
      type: 'qa',
      items: [
        qa('BHV-01', 'Ceritakan tentang dirimu.', [
          paragraph('Struktur **sekarang → sebelumnya → kenapa di sini**, 60–90 detik, fokus pada hal yang relevan dengan posisi.'),
          callout('info', 'Contoh jawaban', 'Saya backend developer dengan 4 tahun pengalaman, saat ini di perusahaan fintech di Jakarta. Saya banyak mengerjakan layanan pembayaran dengan Go dan PostgreSQL: dari desain API, integrasi payment gateway, sampai on-call. Pencapaian yang paling saya banggakan adalah memecah modul settlement dari monolit sehingga waktu proses harian turun dari 3 jam menjadi 40 menit. Sebelumnya saya 2 tahun membangun aplikasi internal dengan Java Spring. Saya tertarik dengan posisi ini karena skala trafiknya lebih besar dan tim ini sedang membangun platform event-driven, area yang ingin saya dalami.'),
          ul('Jangan membacakan CV dari awal kuliah.', 'Akhiri dengan jembatan ke posisi yang dilamar.'),
        ]),
        qa('BHV-02', 'Proyek apa yang paling menantang atau paling kamu banggakan?', [
          paragraph('Pilih proyek dengan **kompleksitas teknis + dampak bisnis** yang jelas, dan bagian yang benar-benar kamu pegang. Siapkan detail untuk pertanyaan lanjutan: kenapa memilih teknologi itu, alternatif yang ditolak, apa yang akan kamu lakukan berbeda.'),
          callout('info', 'Contoh jawaban (ringkas STAR)', '**S**: Rekonsiliasi transaksi harian dengan bank dilakukan manual oleh tim finance dengan Excel, memakan 1 hari kerja. **T**: Saya diminta membangun layanan rekonsiliasi otomatis. **A**: Saya merancang parser untuk 3 format file mutasi bank, mencocokkan transaksi dengan aturan bertingkat (ID referensi, lalu nominal + waktu), dan menyediakan halaman untuk kasus yang tidak cocok. Saya menulis test dengan data mutasi asli yang sudah dianonimkan. **R**: 97% transaksi cocok otomatis, waktu rekonsiliasi turun menjadi sekitar 1 jam, dan selisih yang dulu baru ketahuan di akhir bulan kini terdeteksi di hari yang sama.'),
        ]),
        qa('BHV-03', 'Ceritakan saat kamu berbeda pendapat dengan rekan kerja atau atasan.', [
          paragraph('Yang dinilai: kamu bisa tidak setuju **dengan data dan hormat**, lalu tetap berkomitmen pada keputusan akhir (*disagree and commit*).'),
          callout('info', 'Contoh jawaban', 'Tech lead saya ingin langsung memecah layanan order menjadi microservices. Saya khawatir karena tim hanya 4 orang dan belum punya observability yang memadai. Saya tidak menolak di forum, tetapi menyiapkan dokumen singkat: biaya operasional, risiko konsistensi data, dan alternatif modular monolith dengan batas modul yang jelas. Kami sepakat memulai dengan modular monolith dan memisahkan satu modul (notifikasi) sebagai percobaan. Enam bulan kemudian modul itu dipisah dengan lancar, dan tim menghindari kerumitan di modul lain yang ternyata belum perlu dipisah.'),
          ul('Hindari cerita di mana kamu "menang" dan pihak lain digambarkan bodoh.', 'Bila keputusan akhirnya bukan pilihanmu, ceritakan bagaimana kamu tetap mendukungnya.'),
        ]),
        qa('BHV-04', 'Ceritakan kesalahan atau kegagalan yang pernah kamu buat.', [
          paragraph('Pilih kesalahan nyata (bukan "saya terlalu perfeksionis"), akui tanggung jawabmu, jelaskan perbaikan, lalu **apa yang berubah** dalam cara kerjamu.'),
          callout('info', 'Contoh jawaban', 'Saya pernah menjalankan migrasi database yang menambah index pada tabel transaksi berisi puluhan juta baris di jam kerja. Migrasi mengunci tabel dan checkout gagal sekitar 10 menit. Saya segera membatalkan migrasi dan melapor ke tim. Setelah itu saya mengulang dengan `CREATE INDEX CONCURRENTLY` di luar jam sibuk, lalu mengusulkan aturan: migrasi pada tabel besar wajib direview, diuji di staging dengan volume data serupa, dan dijalankan dengan rencana rollback. Sejak itu tidak ada lagi insiden migrasi di tim kami.'),
        ]),
        qa('BHV-05', 'Bagaimana kamu menghadapi deadline ketat atau prioritas yang berubah mendadak?', [
          paragraph('Tunjukkan bahwa kamu **mengelola scope dan ekspektasi**, bukan sekadar lembur.'),
          callout('info', 'Contoh jawaban', 'Dua minggu sebelum rilis fitur paylater, regulator meminta perubahan alur persetujuan. Saya memecah pekerjaan dan menandai mana yang wajib untuk kepatuhan dan mana yang bisa ditunda. Saya menyampaikan ke product manager bahwa tidak semua bisa masuk tepat waktu, lalu kami sepakat merilis alur wajib dulu dan menunda dashboard internal satu sprint. Saya juga menambahkan feature flag agar rilis bisa diaktifkan bertahap. Fitur rilis tepat waktu tanpa insiden, dan dashboard menyusul minggu berikutnya.'),
        ]),
        qa('BHV-06', 'Ceritakan saat kamu harus mempelajari teknologi baru dengan cepat.', [
          callout('info', 'Contoh jawaban', 'Tim kami memutuskan memakai Kafka untuk event pembayaran, padahal belum ada yang berpengalaman. Saya mengambil inisiatif: membaca dokumentasi resmi tentang partition, consumer group, dan delivery semantics, membuat prototipe kecil di lokal dengan Docker, lalu sengaja menguji skenario gagal seperti consumer mati dan pesan duplikat. Dalam dua minggu saya menulis panduan internal dan pola consumer yang idempoten, lalu membawakan sesi berbagi untuk tim. Layanan pertama berbasis Kafka rilis sebulan kemudian dan polanya dipakai tim lain.'),
          ul('Tunjukkan **cara belajarmu** (sumber resmi, prototipe, uji skenario gagal), bukan hanya "saya belajar sendiri".'),
        ]),
        qa('BHV-07', 'Bagaimana kamu menerima kritik, misalnya dalam code review?', [
          callout('info', 'Contoh jawaban', 'Di awal bergabung, pull request saya sering besar dan reviewer kesulitan memberi masukan. Senior saya menyarankan PR yang lebih kecil. Awalnya saya merasa memperlambat pekerjaan, tetapi saya mencobanya: memecah fitur menjadi PR di bawah 300 baris dengan deskripsi jelas. Waktu review turun dari rata-rata 2 hari menjadi beberapa jam dan bug yang lolos ke staging berkurang. Sekarang saya juga memberi review dengan cara yang sama: menjelaskan alasan, membedakan yang wajib dan yang sekadar saran.'),
          ul('Tunjukkan bahwa kamu memisahkan kritik terhadap kode dari kritik terhadap diri.', 'Bonus: ceritakan bagaimana kamu memberi feedback ke orang lain.'),
        ]),
        qa('BHV-08', 'Kenapa ingin pindah, dan kenapa memilih perusahaan kami?', [
          paragraph('Jawab **positif dan berorientasi ke depan**; jangan menjelekkan kantor lama. Hubungkan dengan hal spesifik dari perusahaan (produk, skala, tech blog, stack) yang sudah kamu riset.'),
          callout('info', 'Contoh jawaban', 'Di tempat sekarang saya sudah banyak belajar tentang sistem pembayaran, tetapi skalanya relatif stabil dan sebagian besar pekerjaan saya kini pemeliharaan. Saya ingin tantangan di sistem dengan trafik lebih tinggi. Dari tech blog tim ini saya membaca tentang migrasi ke arsitektur event-driven dan masalah konsistensi yang kalian hadapi, dan itu persis area yang ingin saya dalami. Produk kalian juga saya pakai sehari-hari, jadi saya bisa melihat dampak langsung pekerjaan saya.'),
          followUp('Bila langsung ditanya ekspektasi gaji: sebutkan **rentang** berdasarkan riset pasar dan pengalamanmu, jelaskan apakah gross atau take home pay, dan tunjukkan keterbukaan pada total paket. Bila belum siap, tanyakan dulu rentang yang dianggarkan untuk posisi ini.'),
        ]),
      ],
    },
    heading('Pertanyaan untuk interviewer'),
    paragraph('Di akhir sesi hampir selalu ada "Ada pertanyaan untuk kami?". Jawaban "tidak ada" menyia-nyiakan kesempatan menilai perusahaan. Siapkan 3–4 pertanyaan, sesuaikan dengan siapa yang mewawancarai:'),
    ul(
      'Seperti apa hari kerja biasa seorang backend engineer di tim ini?',
      'Bagaimana alur dari ide sampai ke production: code review, CI/CD, frekuensi deploy?',
      'Bagaimana sistem on-call dan penanganan insiden? Apakah ada postmortem tanpa menyalahkan?',
      'Tantangan teknis terbesar tim dalam 6–12 bulan ke depan?',
      'Seperti apa ekspektasi untuk posisi ini di 3 bulan pertama? Bagaimana kinerja dinilai?',
      'Bagaimana kesempatan belajar dan jenjang karier (jalur IC vs manajerial)?',
      'Bagaimana komposisi tim dan cara kerja dengan product/QA?',
      'Untuk HR: kebijakan kerja remote/hybrid, tahapan selanjutnya, dan kapan kira-kira ada kabar.',
    ),
    heading('Checklist persiapan'),
    {
      type: 'checklist',
      id: 'iv-strategi',
      items: [
        'Perkenalan diri 60–90 detik sudah dilatih dengan suara keras (Bahasa Indonesia dan Inggris bila perlu).',
        '5–6 cerita STAR siap: proyek terbaik, insiden/kegagalan, konflik, deadline ketat, belajar cepat, kepemimpinan/mentoring.',
        'Setiap cerita punya angka hasil yang jelas (latensi, error rate, waktu, biaya, jumlah user).',
        '2–3 proyek di CV bisa dijelaskan sampai detail arsitektur dan trade-off.',
        'Sudah latihan live coding dengan timer sambil berbicara (minimal 10 soal).',
        'Sudah latihan minimal 2 soal system design end-to-end dengan kerangka requirement → API → data → arsitektur → bottleneck.',
        'Riset perusahaan: produk, stack teknologi, tech blog, berita terbaru.',
        'Rentang gaji (gross vs take home pay) dan notice period sudah ditentukan.',
        '3–4 pertanyaan untuk interviewer sudah disiapkan.',
        'Untuk interview online: kamera, mikrofon, koneksi, dan editor/IDE sudah dites sebelumnya.',
      ],
    },
    heading('Referensi'),
    references(
      ['Tech Interview Handbook: Behavioral interviews', 'https://www.techinterviewhandbook.org/behavioral-interview/'],
      ['Amazon Leadership Principles (sering dipakai sebagai acuan pertanyaan behavioral)', 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles'],
      ['OWASP API Security Top 10 (bahan diskusi keamanan saat deep-dive)', 'https://owasp.org/API-Security/'],
    ),
  ],
};

export const interviewLanguageModules: Omit<Module, 'code'>[] = [goModule, pythonModule, tsModule, ktCsModule, behavioralModule];
