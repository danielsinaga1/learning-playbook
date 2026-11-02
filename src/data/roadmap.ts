import type { Block, Curriculum, Module, Track } from '../types';
import { callout, heading, paragraph, table } from './lesson-kit';

const START = 'Mulai di Sini';
const MAIN = 'Jalur Utama 12 Bulan';
const GOAL = 'Jalur per Tujuan';

const tracks: Track[] = [
  { title: START, summary: 'Prinsip memilih bahasa, kombinasi yang disarankan, dan cara belajar yang efektif.' },
  { title: MAIN, summary: 'Java backend → TypeScript & frontend → Python & AI → produksi & interview, dengan tautan langsung ke tiap modul.' },
  { title: GOAL, summary: 'Rute alternatif bila tujuanmu cloud-native, full stack, mobile, AI, systems, atau enterprise .NET.' },
];

export const roadmapSource = 'Rekomendasi jalur belajar: disusun dari isi playbook (30 Oktober 2026, diperbarui 2 November 2026)';

/** Langkah berurutan; tiap langkah berisi tautan ke modul pertama track terkait. */
const route = (items: [title: string, text: string][]): Block => ({
  type: 'steps',
  items: items.map(([title, text]) => ({ title, text })),
});

const checklist = (id: string, items: string[]): Block[] => [
  heading('Kriteria lulus fase'),
  { type: 'checklist', id, items },
];

const modules: Omit<Module, 'code'>[] = [
  {
    id: 'jalur-prinsip-pilih-bahasa',
    title: 'Prinsip & Memilih Bahasa',
    summary: 'Satu bahasa utama sampai produksi, lalu satu pendamping dengan tujuan berbeda. Perbandingan semua bahasa di playbook.',
    track: START, source: roadmapSource, duration: '20 menit', level: 'Easy',
    blocks: [
      paragraph('Kesalahan paling umum saat belajar pemrograman adalah berpindah bahasa sebelum benar-benar bisa membangun sesuatu. Konsep inti (tipe data, struktur data, error handling, testing, HTTP, database) **sama di semua bahasa**; yang berbeda hanya sintaks dan ekosistem. Maka kuasai satu bahasa sampai bisa *deploy*, *testing*, dan menjawab soal interview, baru tambah bahasa kedua.'),
      callout('tip', 'Aturan praktis', '**Satu bahasa utama** (6–9 bulan sampai mahir) + **satu pendamping** yang tujuannya berbeda (frontend, AI, atau mobile). Bahasa ketiga dan seterusnya hanya bila pekerjaan atau proyek benar-benar membutuhkan.'),
      heading('Kombinasi yang disarankan'),
      table(['Peran', 'Bahasa', 'Alasan'], [
        ['**Utama (backend)**', '[Java & Spring Boot](#java)', 'Materi paling lengkap di playbook (algoritma, Spring, Interview Prep, AWS); banyak dipakai di enterprise dan perbankan.'],
        ['**Pendamping 1**', '[JavaScript & TypeScript](#js)', 'Wajib untuk full stack (React, Next.js) dan backend Node.js.'],
        ['**Pendamping 2**', '[Python](#python)', 'Jalan masuk ke AI Engineer (LangChain, LangGraph, FastAPI) dan otomasi.'],
        ['**Fondasi harian**', '[Git & Shell](#tools)', 'Dipakai setiap hari di bahasa apa pun; pelajari sejak minggu pertama.'],
        ['**Fondasi lintas bahasa**', '[Web & Keamanan](#web)', 'HTTP, desain REST API, dan OWASP berlaku sama di semua bahasa backend.'],
        ['**Opsional, nanti**', '[Go](#go), [Rust](#rust), [Kotlin](#kotlin), [C# & .NET](#csharp), [PHP & Laravel](#php), [C & C++](#cpp), [Swift & iOS](#swift)', 'Sesuai tujuan karier; lihat [Jalur per Tujuan](#jalur.jalur-per-tujuan).'],
      ]),
      callout('info', 'Lebih suka startup atau infrastruktur cloud?', 'Tukar posisi Java dengan **Go**. Go lebih cepat dikuasai, binarinya kecil, dan materinya di playbook juga dalam (dua proyek lengkap). Rute lengkapnya ada di [Jalur per Tujuan](#jalur.jalur-per-tujuan).'),
      heading('Perbandingan bahasa di playbook'),
      table(['Bahasa', 'Paling cocok untuk', 'Kurva belajar', 'Mulai dari'], [
        ['Java', 'Backend enterprise, perbankan, sistem besar', 'Sedang', '[Persiapan Tools & Mindset](#java.persiapan-tools-mindset)'],
        ['Go', 'Microservices, cloud-native, CLI, infrastruktur', 'Landai', '[Pengenalan Go](#go.pengenalan-go-golang)'],
        ['JavaScript / TypeScript', 'Frontend, full stack, backend Node.js', 'Landai → sedang', '[JavaScript: Variabel & Tipe](#js.js-variabel-tipe)'],
        ['Python', 'AI/LLM, data, otomasi, backend FastAPI', 'Landai', '[Python Dasar: Setup & Variabel](#python.pyf-setup-variabel-string)'],
        ['Kotlin', 'Android, backend Spring modern', 'Sedang (mudah bila sudah Java)', '[Kotlin: Setup & Dasar](#kotlin.kt-setup-dasar)'],
        ['C# / .NET', 'Enterprise, pemerintahan, aplikasi Windows, game (Unity)', 'Sedang', '[C#: Setup & Dasar](#csharp.cs-setup-dasar)'],
        ['Dart / Flutter', 'Aplikasi mobile lintas platform', 'Landai', '[Peta Belajar Flutter](#flutter.peta-belajar-flutter)'],
        ['Rust', 'Performa tinggi, systems, tooling', 'Curam', '[Pendahuluan Rust](#rust.pendahuluan)'],
        ['PHP / Laravel', 'Web & API bisnis, agensi, UMKM, CMS', 'Landai', '[PHP: Setup & Sintaks Dasar](#php.php-setup-sintaks)'],
        ['C / C++', 'Systems, embedded, game, competitive programming', 'Curam', '[C: Setup & Tahap Build](#cpp.c-setup-dasar)'],
        ['Swift', 'Aplikasi iOS/macOS native', 'Sedang', '[Swift: Setup & Sintaks Dasar](#swift.sw-setup-dasar)'],
      ]),
      heading('Cara memakai jalur ini'),
      { type: 'list', ordered: true, items: [
        'Baca [Cara Belajar yang Efektif](#jalur.jalur-cara-belajar) sekali, lalu tentukan jadwal mingguan.',
        'Ikuti fase di track **Jalur Utama 12 Bulan** berurutan, atau pilih rute di **Jalur per Tujuan**.',
        'Tandai modul selesai di setiap kurikulum; centang *Kriteria lulus fase* sebelum pindah fase.',
        'Bila sebuah topik sudah dikuasai, lewati saja: jalur ini peta, bukan kewajiban.',
      ] },
    ],
  },
  {
    id: 'jalur-cara-belajar',
    title: 'Cara Belajar yang Efektif',
    summary: 'Aturan 70/30, satu proyek yang dibangun ulang di tiap bahasa, jadwal mingguan, dan memakai fitur latihan aplikasi.',
    track: START, source: roadmapSource, duration: '15 menit', level: 'Easy',
    blocks: [
      paragraph('Membaca materi memberi rasa paham; menulis kode yang memberi kemampuan. Tiga kebiasaan di bawah ini paling besar pengaruhnya.'),
      { type: 'cards', items: [
        { label: '1', title: 'Aturan 70/30', text: '70% waktu menulis kode atau mengerjakan proyek, 30% membaca. Setiap modul punya checklist latihan: kerjakan sebelum menandai selesai.' },
        { label: '2', title: 'Satu proyek, banyak bahasa', text: 'Bangun ulang aplikasi **Pencatat Keuangan** di tiap bahasa baru. Kontraknya sudah ada, jadi perbedaan bahasa langsung terlihat.' },
        { label: '3', title: 'Ulangi berjarak', text: 'Pakai mode latihan soal (Paham / Ulangi). Soal yang ditandai *Ulangi* dikerjakan lagi 3 dan 7 hari kemudian.' },
      ] },
      heading('Proyek berlanjut: Pencatat Keuangan'),
      table(['Bahasa', 'Titik awal di playbook'], [
        ['Go', '[Proyek: API Pencatat Keuangan](#go.apa-yang-akan-kita-bangun)'],
        ['Python', '[Kontrak API Financial Tracker](#python.kontrak-api-financial-tracker) → FastAPI'],
        ['Node.js', '[Kontrak API Express](#js.kontrak-api-yang-akan-dibangun)'],
        ['React Native', '[Aplikasi mobile Pencatat Keuangan](#js.apa-yang-akan-kita-bangun)'],
        ['C# & PHP', '[Proyek ASP.NET Core](#csharp.cs-proyek-financial-tracker) · [Proyek Laravel](#php.lv-proyek-financial-tracker)'],
        ['Java, Kotlin, Rust', 'Pakai kontrak API yang sama: Spring Boot, Kotlin + Spring/Ktor, atau Axum.'],
      ]),
      heading('Contoh jadwal mingguan (± 10 jam)'),
      table(['Hari', 'Kegiatan', 'Durasi'], [
        ['Senin–Kamis', 'Satu modul: baca, ketik ulang contoh kode, kerjakan checklist', '1–1,5 jam/hari'],
        ['Jumat', '2–3 soal struktur data/algoritma', '1 jam'],
        ['Sabtu', 'Proyek berlanjut: tambah satu fitur, tulis test, commit', '3 jam'],
        ['Minggu', 'Ulangi soal bertanda *Ulangi*, tulis catatan ringkas minggu ini', '1 jam'],
      ]),
      callout('warn', 'Hindari tutorial hell', 'Bila tiga modul berturut-turut selesai tanpa menulis kode sendiri, berhenti dan buat sesuatu yang kecil tanpa melihat materi. Tidak bisa? Itu tanda bagian mana yang perlu diulang.'),
      heading('Fitur aplikasi yang membantu'),
      { type: 'list', items: [
        '**Tandai selesai** di tiap modul: progres per kurikulum dan track terlihat di beranda.',
        '**Pencarian global** (`Ctrl+K` atau `/`): cari konsep lintas bahasa, mis. "closure" atau "pattern matching".',
        '**Mode fokus** dan ukuran teks untuk sesi membaca panjang.',
        '**Checklist** tersimpan di browser: centang kriteria lulus tiap fase.',
      ] },
      { type: 'checklist', id: 'jalur-kebiasaan', items: [
        'Jadwal belajar mingguan sudah ditentukan dan dicatat di kalender.',
        'Repositori Git untuk proyek berlanjut sudah dibuat.',
        'Satu minggu pertama selesai mengikuti aturan 70/30.',
      ] },
    ],
  },
  {
    id: 'jalur-fase-1-java-backend',
    title: 'Fase 1 · Bulan 1–4: Java Backend Siap Kerja',
    summary: 'Git & terminal, Java dari fondasi sampai fitur modern, struktur data & algoritma, SQL, Spring Boot, proyek, dan testing.',
    track: MAIN, source: roadmapSource, duration: '4 bulan', level: 'Med',
    blocks: [
      paragraph('Tujuan fase ini: membangun REST API Spring Boot dengan database, validasi, test, dan bisa menjelaskan pilihan desainnya. Struktur data dikerjakan **paralel**, sedikit tapi rutin setiap hari.'),
      route([
        ['Minggu 1: Git & terminal', '[Git: Konsep Dasar](#tools.git-konsep-dasar) → [Branch, Merge & Rebase](#tools.git-branch-merge-rebase) → [Terminal & Navigasi](#tools.sh-terminal-navigasi).'],
        ['Bulan 1: Java Fundamentals', '[Persiapan Tools & Mindset](#java.persiapan-tools-mindset) → [Java Fundamentals](#java.java-fundamentals) → [OOP Mendalam](#java.jc-oop-mendalam) → [String & Exception](#java.jc-string-exception) → [Collections & Generics](#java.jc-collections-generics) → [Maven/Gradle & JUnit](#java.jc-build-test).'],
        ['Bulan 2: Java Inti lanjutan', '[I/O, NIO.2 & JDBC](#java.jc-io-nio-jdbc) → [Intermediate sampai Advanced](#java.java-intermediate-sampai-advanced) → [Concurrency Klasik](#java.jc-concurrency-klasik); [JVM & GC](#java.jc-jvm-gc) dibaca saat mulai tuning.'],
        ['Bulan 1–2: Functional & Java Modern', '[Functional Interfaces](#java.functional-interfaces-konsep-use-case) → [Stream API](#java.stream-api-dengan-lambda-19-35) → [Records, Sealed & Pattern Matching](#java.java-records-sealed-pattern) → [Virtual Threads](#java.java-virtual-threads).'],
        ['Paralel: Struktur Data & Algoritma', '[Big-O & Kompleksitas](#java.dsa-big-o-kompleksitas) → [Catatan Ringkas Struktur Data](#java.catatan-ringkas-struktur-data) → [Rekursi](#java.rekursi) → [Soal Array](#java.soal-array) → [Heap](#java.dsa-heap-priority-queue) → [Algoritma Graf](#java.dsa-graph-algorithms); target 3–5 soal per minggu.'],
        ['Bulan 2: SQL', '[Pengenalan Database](#sql.pengenalan-database) → [Peta Belajar SQL](#sql.peta-belajar-sql).'],
        ['Bulan 2: Fondasi web', '[Cara Kerja Internet](#web.web-cara-kerja-internet) → [HTTP Mendalam](#web.web-http-mendalam) → [Desain REST API](#web.web-desain-rest-api).'],
        ['Bulan 3: Spring Boot', '[Spring Dasar](#java.spring-dasar) → [Spring Web MVC](#java.spring-web-mvc) → [Spring Data JPA](#java.spring-data-jpa) → [JPA Mendalam](#java.jc-jpa-mendalam) → [Testcontainers & Resilience4j](#java.spring-testcontainers-resilience).'],
        ['Bulan 4: Proyek & testing', '[Proyek Spring RESTful API](#java.proyek-spring-restful-api-contact-management) + [Fondasi Testing](#testing.pendahuluan) → [TDD](#testing.tdd-untuk-vibe-coding-red-green-refactor).'],
      ]),
      ...checklist('jalur-fase-1', [
        'Bisa membuat branch, commit rapi, dan menyelesaikan konflik merge sendiri.',
        'REST API Spring Boot dengan PostgreSQL, validasi, dan global exception handler berjalan, mengikuti konvensi status code dan format error yang konsisten.',
        'Ada unit test dan minimal satu integration test dengan Testcontainers.',
        'Sudah menyelesaikan ≥ 40 soal struktur data/algoritma dan bisa menjelaskan kompleksitasnya.',
        'Proyek di-push ke GitHub dengan README cara menjalankan.',
      ]),
    ],
  },
  {
    id: 'jalur-fase-2-typescript-frontend',
    title: 'Fase 2 · Bulan 5–7: TypeScript & Frontend',
    summary: 'HTML & CSS, JavaScript dasar, TypeScript, React, lalu Next.js full stack yang memanggil API dari fase 1.',
    track: MAIN, source: roadmapSource, duration: '3 bulan', level: 'Med',
    blocks: [
      paragraph('Tujuan fase ini: menjadi full stack. Jangan langsung lompat ke React. Closure, `this`, dan Promise yang dipahami setengah-setengah adalah sumber bug React yang paling sering.'),
      route([
        ['Bulan 5: HTML & CSS', '[Struktur & Semantik](#js.html-struktur-semantik) → [Form & Aksesibilitas](#js.html-form-aksesibilitas) → [Selector, Cascade & Box Model](#js.css-selector-cascade-box) → [Flexbox & Grid](#js.css-flexbox-grid) → [Responsif Modern](#js.css-responsif-modern) → [Proyek Halaman Profil](#js.css-proyek-landing).'],
        ['Bulan 5: JavaScript Dasar', '[Variabel & Tipe](#js.js-variabel-tipe) → [Fungsi & Closure](#js.js-fungsi-closure) → [Objek, Prototype & Class](#js.js-objek-prototype-class) → [Array & Iterasi](#js.js-array-iterasi) → [Async & Promise](#js.js-async-promise) → [Modul & Runtime](#js.js-modul-runtime).'],
        ['Bulan 5–6: TypeScript', '[TS: Setup & Tipe Dasar](#js.ts-setup-tipe-dasar) → [Union & Narrowing](#js.ts-object-union-narrowing) → [Fungsi & Generic](#js.ts-fungsi-generic-dasar) → [Utility Types & Proyek](#js.ts-utility-proyek) → [TypeScript Lanjutan](#js.kenapa-typescript-dan-kenapa-sekarang).'],
        ['Bulan 6: React', '[Peta Jalan React + TypeScript](#js.peta-jalan-react-typescript) → [Hooks Lengkap](#js.hooks-lengkap) → [Proyek Praktik](#js.proyek-praktik-mudah-kompleks).'],
        ['Bulan 7: Next.js', '[Next.js: Fondasi & Setup](#js.nextjs-fondasi-setup) → [Server Actions](#js.nextjs-server-actions) → [Autentikasi & Database](#js.nextjs-auth-database) → [Proyek Learning Tracker](#js.nextjs-proyek-learning-tracker).'],
      ]),
      callout('tip', 'Proyek fase ini', 'Buat frontend Next.js untuk API Spring Boot dari fase 1: login, daftar data dengan pagination, form dengan validasi, dan halaman error. Deploy keduanya.'),
      ...checklist('jalur-fase-2', [
        'Halaman profil responsif buatan sendiri (tanpa framework CSS) lolos audit aksesibilitas Lighthouse.',
        'Bisa menjelaskan closure, `this`, dan event loop dengan contoh kode sendiri.',
        'Proyek JavaScript kecil sudah dimigrasikan ke TypeScript strict tanpa `any`.',
        'Aplikasi Next.js memanggil API Spring Boot, lengkap dengan loading & error state.',
        'Ada test end-to-end Playwright untuk alur utama.',
      ]),
    ],
  },
  {
    id: 'jalur-fase-3-python-ai',
    title: 'Fase 3 · Bulan 8–10: Python & AI Engineer',
    summary: 'Python inti dan praktik (pytest, packaging, CLI), FastAPI, lalu RAG dan agent dengan LangChain, LangGraph, dan Langfuse.',
    track: MAIN, source: roadmapSource, duration: '3 bulan', level: 'Med',
    blocks: [
      paragraph('Tujuan fase ini: membangun aplikasi LLM yang bisa diukur kualitasnya, bukan sekadar demo. Python dipelajari dulu sebagai bahasa, baru framework.'),
      route([
        ['Bulan 8: Python Dasar → Inti', 'Bila baru mengenal Python: [Python Dasar](#python.pyf-setup-variabel-string) (5 modul) dulu. Lalu [Fondasi Bahasa](#python.py-fondasi-bahasa) → [OOP & dataclass](#python.py-oop-dataclass) → [Generator & Decorator](#python.py-generator-decorator) → [Typing & Tooling](#python.py-typing-tooling) → [asyncio](#python.py-asyncio).'],
        ['Bulan 8: Python Praktik', '[pytest Mendalam](#python.py-pytest-mendalam) → [Packaging & pyproject](#python.py-packaging-pyproject) → [Proyek CLI & Otomasi](#python.py-proyek-cli-otomasi) → [pandas Mendalam](#python.pyf-pandas-mendalam).'],
        ['Bulan 9: FastAPI & RAG', '[Mengenal FastAPI](#python.mengenal-fastapi) → [Peta Kurikulum Data/AI](#llm.peta-kurikulum-data-ai) → [Apa itu RAG](#llm.apa-itu-rag-manfaatnya).'],
        ['Bulan 10: AI Engineer', '[Peta Stack](#llm.aie-roadmap-stack) → [Claude API & Tool Calling](#llm.aie-llm-api-tool-calling) → [LangGraph Dasar](#llm.aie-langgraph-dasar) → [Langfuse Tracing](#llm.aie-langfuse-tracing) → [Proyek Akhir](#llm.aie-proyek-akhir).'],
      ]),
      ...checklist('jalur-fase-3', [
        'Paket Python sendiri bisa di-install dan dijalankan sebagai perintah CLI, dengan test pytest.',
        'API FastAPI dengan RAG di atas dokumen sendiri berjalan.',
        'Agent memakai tool calling dan punya dataset evaluasi di Langfuse.',
      ]),
    ],
  },
  {
    id: 'jalur-fase-4-produksi-interview',
    title: 'Fase 4 · Bulan 11–12: Produksi & Interview',
    summary: 'Docker, Kubernetes, AWS, keamanan aplikasi, sistem terdistribusi, otomasi shell, lalu persiapan interview, system design, dan coding test.',
    track: MAIN, source: roadmapSource, duration: '2 bulan', level: 'Hard',
    blocks: [
      paragraph('Tujuan fase ini: proyek dari fase sebelumnya berjalan di cloud dengan pipeline otomatis, dan kamu siap menghadapi interview teknis.'),
      route([
        ['Kontainer & cloud', '[Pendahuluan Docker & Kubernetes](#devops.pendahuluan-docker-kubernetes) → [Mengenal Kubernetes](#devops.mengenal-kubernetes) → [Fondasi AWS](#devops.fondasi) → [Deploy](#devops.deploy).'],
        ['Otomasi', '[Shell Scripting](#tools.sh-scripting) → [Otomasi Proyek](#tools.sh-otomasi-proyek) → [Git Lanjutan](#tools.git-lanjutan).'],
        ['Sistem terdistribusi', '[Memahami Distributed System](#distributed.pengantar-memahami-distributed-system) → [Arsitektur & Performa](#distributed.pengantar-arsitektur-performa).'],
        ['Keamanan aplikasi', '[OWASP Top 10](#web.sec-owasp-top-10) → [Injection](#web.sec-injection) → [Autentikasi](#web.sec-autentikasi) → [Otorisasi](#web.sec-otorisasi) → [Checklist Produksi](#web.sec-checklist-produksi).'],
        ['Interview', '[Strategi & Behavioral](#interview.iv-strategi-behavioral) → [Interview Java](#interview.java) → [Interview Spring](#interview.spring) → [Coding Interview](#java.coding-interview-array-string-interval-1-11) → [Greedy](#java.correctness-of-greedy-algorithms).'],
        ['System design interview', '[Kerangka & Estimasi](#interview.sd-kerangka-estimasi) → [URL Shortener](#interview.sd-url-shortener) → [Rate Limiter](#interview.sd-rate-limiter) → [Sistem Pembayaran](#interview.sd-sistem-pembayaran) → [Soal Cepat](#interview.sd-soal-cepat).'],
      ]),
      ...checklist('jalur-fase-4', [
        'Proyek berjalan di container dan ter-deploy ke cloud lewat CI/CD.',
        'Bisa menggambar dan menjelaskan arsitektur proyek: cache, queue, database, dan titik gagalnya.',
        'Proyek lolos checklist keamanan produksi: password di-hash, query terparameter, otorisasi per resource, tanpa secret di repo.',
        'Menjawab 30 pertanyaan Interview Prep tanpa melihat jawaban.',
        'Bisa mendesain dua studi kasus system design dalam 45 menit sambil menjelaskan trade-off-nya.',
        'Mock interview coding 45 menit selesai minimal tiga kali.',
      ]),
    ],
  },
  {
    id: 'jalur-per-tujuan',
    title: 'Jalur per Tujuan Karier',
    summary: 'Sepuluh rute alternatif: cloud-native Go, full stack TypeScript, mobile, AI Engineer, systems Rust, JVM modern Kotlin, enterprise .NET, web PHP/Laravel, C/C++, dan iOS native.',
    track: GOAL, source: roadmapSource, duration: '15 menit', level: 'Easy',
    blocks: [
      paragraph('Pilih satu rute sesuai tujuan. Git & Shell tetap jadi fondasi di semua rute; struktur data & algoritma tetap dibutuhkan untuk interview di bahasa apa pun.'),
      { type: 'tabs', tabs: [
        { label: 'Cloud-native (Go)', blocks: [
          paragraph('Untuk startup, platform engineering, dan microservices.'),
          route([
            ['Bahasa', '[Pengenalan Go](#go.pengenalan-go-golang) → [Goroutine & Channel](#go.goroutine-channel-concurrency-di-go) → [Error Handling Idiomatik](#go.error-handling-idiomatik).'],
            ['Web & database', '[net/http](#go.http-client-server-net-http) → [pgx, sqlc & goose](#go.go-pgx-sqlc) → [Testing di Go](#go.testing-di-go).'],
            ['Proyek & sistem', '[API Pencatat Keuangan](#go.apa-yang-akan-kita-bangun) → [Microservices](#go.pengenalan-microservices-dengan-go) → [Message Queue](#go.kenapa-message-queue-dari-sinkron-ke-asinkron) → [Kubernetes](#devops.mengenal-kubernetes).'],
            ['Interview', '[Interview Go](#interview.iv-go) → [System Design: Kerangka & Estimasi](#interview.sd-kerangka-estimasi).'],
          ]),
        ] },
        { label: 'Full stack (TypeScript)', blocks: [
          paragraph('Satu bahasa untuk frontend dan backend.'),
          route([
            ['Fondasi', '[HTML & CSS Dasar](#js.html-struktur-semantik) → [JavaScript Dasar](#js.js-variabel-tipe) → [JavaScript Lanjutan](#js.jsa-error-debugging) → [Proyek Vanilla JS](#js.jsa-proyek-vanilla) → [TypeScript Dasar](#js.ts-setup-tipe-dasar) → [TypeScript Lanjutan](#js.kenapa-typescript-dan-kenapa-sekarang) → [TypeScript Tingkat Mahir](#js.jsa-ts-conditional-infer).'],
            ['Frontend', '[React](#js.peta-jalan-react-typescript) → [TanStack Query](#js.jse-tanstack-query-lanjutan) → [Next.js](#js.nextjs-fondasi-setup); alternatif: [Vue 3](#js.jse-vue-dasar) → [Nuxt](#js.jse-nuxt).'],
            ['Backend', '[Event Loop](#js.node-event-loop) → [Express](#js.kontrak-api-yang-akan-dibangun) → [NestJS](#js.mengenal-nest-js) → [Drizzle ORM](#js.node-drizzle-orm).'],
            ['Interview', '[Interview TypeScript & Node.js](#interview.iv-typescript-node) → [React Advanced](#interview.react-advanced).'],
          ]),
        ] },
        { label: 'Mobile', blocks: [
          paragraph('Flutter untuk satu kode di Android & iOS; Kotlin bila fokus Android native.'),
          route([
            ['Lintas platform', '[Peta Belajar Flutter](#flutter.peta-belajar-flutter) → [Dart 3](#flutter.dart3-records-patterns-sealed) → [Membangun UI Nyata](#flutter.membangun-ui-nyata) → [Optimasi Performa](#flutter.optimasi-performa).'],
            ['Android native', '[Kotlin: Setup & Dasar](#kotlin.kt-setup-dasar) → [Null Safety](#kotlin.kt-null-safety) → [Coroutines](#kotlin.kt-coroutines) → [Flow](#kotlin.kt-flow) → [Jetpack Compose](#kotlin.kt-compose-dasar) → [Arsitektur Android](#kotlin.kt-android-arsitektur) → [Data Layer](#kotlin.kt-android-data-layer).'],
            ['iOS native', 'Lihat tab **iOS native (Swift)**: [Swift & iOS](#swift).'],
          ]),
        ] },
        { label: 'AI Engineer (Python)', blocks: [
          paragraph('Membangun aplikasi LLM, RAG, dan agent.'),
          route([
            ['Python', '[Python Dasar](#python.pyf-setup-variabel-string) → [Fondasi Bahasa](#python.py-fondasi-bahasa) → [asyncio](#python.py-asyncio) → [pytest Mendalam](#python.py-pytest-mendalam) → [NumPy](#python.pyf-numpy) → [pandas](#python.pyf-pandas-mendalam).'],
            ['LLM', '[Prompt Engineering](#llm.prompt-engineering-sistematis) → [RAG](#llm.apa-itu-rag-manfaatnya) → [AI Engineer: Peta Stack](#llm.aie-roadmap-stack).'],
            ['Produksi', '[Evaluasi dengan Langfuse](#llm.aie-evaluasi-langfuse) → [Full Stack & Deploy](#llm.aie-fullstack-deploy) → [Proyek Akhir](#llm.aie-proyek-akhir).'],
            ['Interview', '[Interview Python & AI Engineer](#interview.iv-python-ai).'],
          ]),
        ] },
        { label: 'Systems (Rust)', blocks: [
          paragraph('Untuk performa tinggi, tooling, dan pemahaman memori. Paling cocok sebagai bahasa kedua atau ketiga.'),
          route([
            ['Dasar & inti', '[Pendahuluan Rust](#rust.pendahuluan) → [Ownership & Borrowing](#rust.rust-ownership-borrowing) → [Error Handling](#rust.rust-error-handling) → [Trait & Generic](#rust.rust-trait-generic).'],
            ['Lanjutan', '[Closure & Iterator](#rust.rust-closure-iterator) → [Smart Pointer](#rust.rust-smart-pointer) → [Concurrency](#rust.rust-concurrency) → [Testing & Cargo](#rust.rust-testing-cargo).'],
            ['Backend & sistem', '[REST API Axum](#rust.rust-axum-tokio) → [Async Mendalam](#rust.rsp-async-mendalam) → [Axum Siap Produksi](#rust.rsp-axum-produksi) → [Proyek CLI clap](#rust.rsp-cli-clap) → [Low-Level & Systems Programming](#lld.fase-1-fondasi-bahasa-sistem-rust-c-modern).'],
          ]),
        ] },
        { label: 'JVM modern (Kotlin)', blocks: [
          paragraph('Bila sudah menguasai Java dan ingin kode yang lebih ringkas di Spring Boot.'),
          route([
            ['Bahasa', '[Setup & Dasar](#kotlin.kt-setup-dasar) → [Fungsi & Lambda](#kotlin.kt-fungsi-lambda) → [Class, Data & Sealed](#kotlin.kt-class-data-sealed) → [Koleksi & Scope Function](#kotlin.kt-koleksi-scope).'],
            ['Backend', '[Coroutines](#kotlin.kt-coroutines) → [Spring Boot dengan Kotlin](#kotlin.kt-spring-boot-api) → [Testing](#kotlin.kt-testing) → [Ktor Server](#kotlin.kt-ktor-server).'],
            ['Interview', '[Interview Kotlin & C#/.NET](#interview.iv-kotlin-dotnet) → [Interview Spring](#interview.spring).'],
          ]),
        ] },
        { label: 'Enterprise (.NET)', blocks: [
          paragraph('Untuk perusahaan dan instansi yang memakai ekosistem Microsoft. Konsepnya mirip Java & Spring.'),
          route([
            ['Bahasa', '[Setup & Dasar](#csharp.cs-setup-dasar) → [Class & Record](#csharp.cs-oop-class-record) → [Koleksi & LINQ](#csharp.cs-koleksi-linq) → [async/await](#csharp.cs-async-await).'],
            ['Web API', '[Minimal API](#csharp.cs-aspnet-minimal-api) → [EF Core](#csharp.cs-ef-core) → [Auth & Middleware](#csharp.cs-auth-middleware).'],
            ['Produksi', '[Clean Architecture](#csharp.cs-clean-architecture) → [Testing dengan xUnit](#csharp.cs-testing-xunit) → [Deploy dengan Docker](#csharp.cs-deploy-docker) → [Proyek Akhir](#csharp.cs-proyek-financial-tracker).'],
            ['Interview', '[Interview Kotlin & C#/.NET](#interview.iv-kotlin-dotnet).'],
          ]),
        ] },
        { label: 'Web (PHP & Laravel)', blocks: [
          paragraph('Untuk agensi, UMKM, dan banyak lowongan web di Indonesia. Cepat dari nol sampai aplikasi jalan.'),
          route([
            ['Bahasa', '[Setup & Sintaks](#php.php-setup-sintaks) → [OOP](#php.php-oop) → [Composer & PSR](#php.php-error-composer) → [PHP Modern 8.x](#php.php-modern) → [PDO](#php.php-pdo-database).'],
            ['Laravel', '[Routing & Blade](#php.lv-dasar-routing) → [Eloquent](#php.lv-eloquent) → [Validasi & Resource](#php.lv-validasi-resource) → [Sanctum, Gate & Policy](#php.lv-auth-sanctum).'],
            ['Produksi', '[Queue & Event](#php.lv-queue-event) → [Testing Pest](#php.lv-testing) → [Performa & Deploy](#php.lv-performa-deploy) → [Proyek Financial Tracker](#php.lv-proyek-financial-tracker).'],
          ]),
        ] },
        { label: 'Systems & CP (C/C++)', blocks: [
          paragraph('Untuk embedded, game engine, komponen performa kritis, dan competitive programming.'),
          route([
            ['C', '[Setup & Tahap Build](#cpp.c-setup-dasar) → [Pointer](#cpp.c-pointer) → [Memori Dinamis](#cpp.c-memori-dinamis) → [Multi-file & Makefile](#cpp.c-file-multi-file).'],
            ['C++ modern', '[Dari C ke C++](#cpp.cpp-dari-c-ke-cpp) → [STL](#cpp.cpp-stl) → [Smart Pointer & Move](#cpp.cpp-smart-pointer-move) → [Template & Concepts](#cpp.cpp-template-concepts) → [Tooling](#cpp.cpp-tooling).'],
            ['Lanjutan', '[Template CP](#cpp.cpp-cp-template) → [Pola Soal Klasik](#cpp.cpp-cp-pola-klasik) → [Low-Level & Systems Programming](#lld.fase-1-fondasi-bahasa-sistem-rust-c-modern).'],
          ]),
        ] },
        { label: 'iOS native (Swift)', blocks: [
          paragraph('Untuk aplikasi iPhone/iPad/Mac native. Butuh Mac + Xcode untuk bagian SwiftUI.'),
          route([
            ['Bahasa', '[Setup & Sintaks](#swift.sw-setup-dasar) → [Struct, Class & Enum](#swift.sw-struct-class-enum) → [Protocol & Generic](#swift.sw-protocol-generic) → [Error & ARC](#swift.sw-error-arc).'],
            ['Concurrency', '[async/await](#swift.sw-async-await) → [Actor & Sendable](#swift.sw-actor-sendable).'],
            ['SwiftUI', '[View & Layout](#swift.sw-swiftui-dasar) → [State & Navigasi](#swift.sw-swiftui-state) → [Networking & SwiftData](#swift.sw-networking-swiftdata) → [Testing & Rilis](#swift.sw-testing-mvvm-rilis).'],
          ]),
        ] },
      ] },
      callout('info', 'Ganti rute di tengah jalan?', 'Boleh, asal fase yang sedang berjalan selesai dulu. Fondasi yang sudah dibangun (Git, SQL, testing, struktur data, HTTP) terbawa ke rute mana pun.'),
    ],
  },
];

export const roadmapCurriculum: Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] } = {
  id: 'jalur',
  title: 'Jalur Belajar Bahasa Pemrograman',
  short: 'Jalur Belajar',
  monogram: 'Rute',
  hue: 'gold',
  description: 'Rekomendasi urutan belajar: satu bahasa utama sampai produksi, lalu pendamping. Jalur 12 bulan (Java → TypeScript → Python & AI → produksi) dan tujuh rute per tujuan karier, dengan tautan langsung ke modul.',
  tracks,
  sources: [roadmapSource],
  intro: [
    callout('tip', 'Mulai di sini', 'Baru mulai atau bingung harus belajar apa dulu? Baca [Prinsip & Memilih Bahasa](#jalur.jalur-prinsip-pilih-bahasa), lalu ikuti [Fase 1](#jalur.jalur-fase-1-java-backend) atau pilih rute di [Jalur per Tujuan Karier](#jalur.jalur-per-tujuan).'),
  ],
  modules,
};
