# Laporan cakupan dokumen sumber

Diperiksa otomatis pada 108 file: **53.266 dari 53.275 potongan teks (99,98%) ada di aplikasi**, termasuk 97 baris rumus/diagram yang tampil utuh di gambar halaman.

Cara cek: setiap paragraf, sel tabel, dan baris kode di file asli dibaca langsung (python-docx, pdftotext, lxml, dan OCR tesseract untuk PDF berupa gambar — bukan skrip konversi), lalu dicari di data aplikasi setelah dinormalisasi (huruf kecil, tanpa tanda baca). Potongan di bawah 15 karakter (nomor halaman, label kolom) tidak dihitung, dan header/footer berjalan di PDF (mis. "Disusun untuk Daniel", judul bab di atas halaman) diabaikan.

- **Arsip**: jumlah bagian yang disimpan di track *Arsip Sumber* karena tidak masuk jalur utama (duplikat dari sumber lain, pengantar, daftar isi, versi ringkas, teks promosi slide).
- **Parafrase/OCR**: kalimat yang cocok secara longgar (≥70–80% katanya sama). Dipakai untuk 3 halaman HTML awal yang ditulis ulang, dan untuk hasil OCR slide bergambar yang ejaannya tidak sempurna.
- **Di gambar**: untuk e-book RAG dan cheatsheet Stanford/MIT, tiap halaman juga ditampilkan sebagai gambar. Baris rumus atau label diagram yang urutan karakternya berubah saat diekstrak dihitung di kolom ini. Begitu juga teks di dalam screenshot (IDE, GitHub, hasil test) di PDF API Testing dan label diagram slide Microservices Design Patterns, yang ditampilkan utuh sebagai gambar di modulnya.
- Untuk PDF yang punya lapisan teks, OCR hanya dipakai untuk teks di dalam gambar tertanam (teks biasa sudah dicek lewat pdftotext). Halaman yang seluruhnya gambar di-OCR penuh.

| Kurikulum | File | Potongan | Ada | Parafrase/OCR | Di gambar | Arsip |
|---|---|---:|---:|---:|---:|---:|
| Java & Spring | 60_days_Java.pdf | 110 | 108 | 1 |  | 6 |
| Java & Spring | Algoritma_Java.docx | 1108 | 1108 |  |  | 21 |
| Java & Spring | Coding_Interview_in_Java.pdf | 2244 | 2244 |  |  | 38 |
| Java & Spring | Data_Structure.pdf ✍️ | — | manual |  |  | 1 |
| Java & Spring | Design_Patterns_Java.docx | 571 | 571 |  |  | 2 |
| Java & Spring | Exploring_the_Java_Ecosystem.pdf | 90 | 90 |  |  |  |
| Java & Spring | Greedy_Algo.pdf | 10212 | 10210 |  |  | 4 |
| Java & Spring | Java_Functional_Interfaces.pdf | 48 | 48 | 4 |  | 4 |
| Java & Spring | Lambda_Code_Snippets_Java_8.pdf | 176 | 175 | 11 |  | 2 |
| Java & Spring | Materi-Java-SpringBoot-Pemula-sampai-Mahir.docx | 1771 | 1771 |  |  | 42 |
| Java & Spring | SpringBoot_Panduan_Lengkap.docx | 627 | 627 |  |  | 61 |
| Java & Spring | Spring_Dependency_Injection.pdf | 47 | 45 | 2 |  |  |
| Java & Spring | Struktur_Data_Java_Interview.docx | 413 | 413 |  |  | 18 |
| Java & Spring | java-algorithms.html | 207 | 207 | 13 |  | 26 |
| Go | 05_GraphQL.docx | 102 | 102 |  |  | 5 |
| Go | Backend_Go_PencatatKeuangan_API.docx | 586 | 586 |  |  | 15 |
| Go | Belajar_GoLang_Pemula_ke_Mahir.docx | 1366 | 1366 |  |  | 26 |
| Go | Golang_Masterclass_Lengkap.docx | 966 | 966 |  |  | 66 |
| JS & TS | 01-Web-Fase1-Modern-Rendering-Edge.docx | 147 | 147 |  |  |  |
| JS & TS | 01-Web-Fase2-API-Design-Type-Safety.docx | 122 | 122 |  |  |  |
| JS & TS | 01-Web-Fase3-Performance-Engineering.docx | 119 | 119 |  |  |  |
| JS & TS | 01-Web-Fase4-Web-Security.docx | 110 | 110 |  |  |  |
| JS & TS | 01_TypeScript_Penuh.docx | 200 | 200 |  |  | 2 |
| JS & TS | Angular-Pemula-sampai-Mahir.docx | 1372 | 1372 |  |  | 12 |
| JS & TS | Belajar-React-TypeScript-Lengkap.docx | 1699 | 1699 |  |  | 13 |
| JS & TS | Express_FinancialTracker_1_Fondasi.docx | 184 | 184 |  |  | 3 |
| JS & TS | Express_FinancialTracker_2_Produksi.docx | 223 | 223 |  |  | 1 |
| JS & TS | Lazy_Loading_React.pdf | 40 | 40 | 6 |  | 2 |
| JS & TS | Nest_FinancialTracker_1_Fondasi.docx | 142 | 142 |  |  | 3 |
| JS & TS | Nest_FinancialTracker_2_Produksi.docx | 197 | 197 |  |  | 1 |
| JS & TS | Proyek_React_PencatatKeuangan.docx | 236 | 236 |  |  | 3 |
| JS & TS | Proyek_React_PencatatKeuangan_v2_SemuaHooks.docx | 375 | 375 |  |  | 3 |
| JS & TS | ReactNative_PencatatKeuangan_Mobile.docx | 493 | 493 |  |  | 5 |
| JS & TS | React_JS.pdf | 1954 | 1954 |  |  | 19 |
| JS & TS | React_Masterclass_Hooks_State_Performa.docx | 400 | 400 |  |  | 60 |
| JS & TS | React_Panduan_Konsolidasi.docx | 446 | 446 |  |  | 87 |
| JS & TS | alt/01-Web-Fase1-Modern-Rendering-Edge.docx | 57 | 57 |  |  | 18 |
| JS & TS | alt/01-Web-Fase2-API-Design-Type-Safety.docx | 56 | 56 |  |  | 17 |
| JS & TS | alt/01-Web-Fase3-Performance-Engineering.docx | 59 | 59 |  |  | 17 |
| JS & TS | alt/01-Web-Fase4-Web-Security.docx | 58 | 58 |  |  | 17 |
| Python | Django_FinancialTracker_1_Fondasi.docx | 136 | 136 |  |  | 3 |
| Python | Django_FinancialTracker_2_Produksi.docx | 128 | 128 |  |  | 1 |
| Python | FastAPI_FinancialTracker_1_Fondasi.docx | 122 | 122 |  |  | 2 |
| Python | FastAPI_FinancialTracker_2_Produksi.docx | 144 | 144 |  |  | 1 |
| Rust | Modul_Rust_Pemula_hingga_Mahir.docx | 157 | 157 |  |  | 1 |
| Mobile | 02-Mobile-Fase1-Cross-Platform.docx | 103 | 103 |  |  |  |
| Mobile | 02-Mobile-Fase2-On-Device-AI.docx | 95 | 95 |  |  |  |
| Mobile | 02-Mobile-Fase3-Performance-Profiling.docx | 102 | 102 |  |  |  |
| Mobile | 02-Mobile-Fase4-Arsitektur-Delivery.docx | 104 | 104 |  |  |  |
| Mobile | Flutter-Panduan-Lengkap.docx | 826 | 826 |  |  | 5 |
| Mobile | alt/02-Mobile-Fase1-Cross-Platform.docx | 55 | 55 |  |  | 17 |
| Mobile | alt/02-Mobile-Fase2-On-Device-AI.docx | 54 | 54 |  |  | 17 |
| Mobile | alt/02-Mobile-Fase3-Performance-Profiling.docx | 55 | 55 |  |  | 17 |
| Mobile | alt/02-Mobile-Fase4-Arsitektur-Delivery.docx | 55 | 55 |  |  | 17 |
| Database & SQL | Panduan_Belajar_Database_SQL_NoSQL.docx | 298 | 298 |  |  | 37 |
| Database & SQL | SQL-Pemula-sampai-Mahir.docx | 1490 | 1490 |  |  | 8 |
| Database & SQL | SQL_Notes.pdf | 760 | 760 |  |  | 2 |
| Distributed System | 04-SysDesign-Fase1-Distributed-Systems.docx | 55 | 55 |  |  | 1 |
| Distributed System | 04-SysDesign-Fase2-Observability.docx | 55 | 55 |  |  | 1 |
| Distributed System | 04-SysDesign-Fase3-Platform-Engineering.docx | 56 | 56 |  |  | 1 |
| Distributed System | 04-SysDesign-Fase4-Skalabilitas-FinOps.docx | 55 | 55 |  |  | 1 |
| Distributed System | E-Book_Arsitektur_Performa_Sistem_Enterprise.pdf | 185 | 185 |  |  | 1 |
| Distributed System | Microservices_Design_Pattern.pdf | 61 | 61 | 6 | 6 |  |
| Distributed System | Panduan-Arsitektur-dan-Performa-Sistem.docx | 340 | 340 |  |  | 2 |
| Distributed System | Panduan_Distributed_System_Spring_Boot.docx | 532 | 532 |  |  | 3 |
| Low Level Design | 00-Roadmap-ConcDist-Green-Overview.docx | 55 | 55 |  |  | 2 |
| Low Level Design | 00-Roadmap-Teknis-Lanjutan-Overview.docx | 51 | 51 |  |  | 4 |
| Low Level Design | 05-LowLevel-Fase1-Fondasi-Bahasa-Sistem.docx | 119 | 119 |  |  | 1 |
| Low Level Design | 05-LowLevel-Fase2-Concurrency-Memory-Model.docx | 116 | 116 |  |  | 1 |
| Low Level Design | 05-LowLevel-Fase3-OS-Internals-Performance.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 05-LowLevel-Fase4-Proyek-Sistem-Skala.docx | 112 | 112 |  |  | 1 |
| Low Level Design | 06-DBInternals-Fase1-Storage-Engine-Fundamentals.docx | 109 | 109 |  |  | 1 |
| Low Level Design | 06-DBInternals-Fase2-Transaksi-Concurrency-Control.docx | 112 | 112 |  |  | 1 |
| Low Level Design | 06-DBInternals-Fase3-Query-Processing-Optimizer.docx | 108 | 108 |  |  | 1 |
| Low Level Design | 06-DBInternals-Fase4-Search-Engineering-Relevance.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 07-ConcDist-Fase1-GPU-Parallel-Computing.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 07-ConcDist-Fase2-Formal-Methods-TLA.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 07-ConcDist-Fase3-Algoritma-Terdistribusi-Lanjutan.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 07-ConcDist-Fase4-Capstone-Terverifikasi-Terakselerasi.docx | 109 | 109 |  |  | 1 |
| Low Level Design | 08-GreenComputing-Fase1-Fundamental-Energy-Aware.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 08-GreenComputing-Fase2-Efisiensi-Software-Hardware.docx | 110 | 110 |  |  | 1 |
| Low Level Design | 08-GreenComputing-Fase3-Carbon-Aware-Infrastructure.docx | 109 | 109 |  |  | 1 |
| Low Level Design | 08-GreenComputing-Fase4-Capstone-Audit-Karbon.docx | 110 | 110 |  |  | 1 |
| Cloud & DevOps | Docker-Kubernetes-Pemula-sampai-Mahir.docx | 456 | 456 |  |  | 3 |
| Cloud & DevOps | Modul_DevOps_Production-Ready_Docker_Kubernetes_V2.pdf | 179 | 179 |  |  | 1 |
| Cloud & DevOps | Panduan_Backend_Platform_Engineering.docx | 482 | 482 |  |  | 15 |
| Cloud & DevOps | aws-java-roadmap.html | 117 | 117 | 12 |  | 7 |
| Testing & QA | API_Testing.pdf | 329 | 329 |  | 11 | 5 |
| Testing & QA | End_to_End_API_Testing.pdf | 258 | 258 | 4 | 35 | 2 |
| Testing & QA | FSD_dan_TSD.pdf | 35 | 35 | 4 |  | 4 |
| Testing & QA | Software_Testing_Lengkap.docx | 552 | 552 |  |  | 22 |
| Testing & QA | TDD.pdf | 24 | 22 | 5 |  | 7 |
| LLM | 03-DataAI-Fase1-LLM-Engineering.docx | 206 | 206 |  |  | 10 |
| LLM | 03-DataAI-Fase2-Fine-Tuning-Evaluasi.docx | 101 | 101 |  |  | 3 |
| LLM | 03-DataAI-Fase3-MLOps.docx | 101 | 101 |  |  | 3 |
| LLM | 03-DataAI-Fase4-Data-Engineering.docx | 103 | 103 |  |  | 3 |
| LLM | 03-DataAI-Roadmap-Komprehensif.docx | 439 | 439 |  |  | 5 |
| LLM | Belajar_Hacktiv8.docx | 0 | 0 |  |  |  |
| LLM | Cheatsheet_ML_DL_AI_Stanford.pdf | 1870 | 1870 |  | 30 | 2 |
| LLM | Retrieval_Augmented_Generation.pdf | 1277 | 1277 |  | 15 | 8 |
| Interview Prep | 50_Soal_Advanced_React_SpringBoot.docx | 497 | 497 |  |  | 54 |
| Interview Prep | Apache_Kafka.pdf | 574 | 574 |  |  | 62 |
| Interview Prep | interview-prep-java-spring-aws.html | 182 | 182 | 51 |  | 12 |
| English Learning | English_Komprehensif_Tenses_TOEFL_v2.docx | 2243 | 2243 |  |  | 22 |
| English Learning | English_Komprehensif_v2_Vocabulary_Baru.docx | 2244 | 2244 |  |  |  |
| English Learning | English_Vocabulary_and_Phrasal_Verbs_v3.docx | 941 | 941 |  |  | 44 |
| English Learning | Panduan_Master_IELTS.pdf | 2002 | 2002 |  |  | 26 |
| English Learning | Ringkasan_IELTS_Vocabulary_Booster.pdf | 827 | 827 |  |  | 53 |

## Potongan yang tidak ditemukan

- `Greedy_Algo.pdf` (2 baris, rumus dengan subskrip; teksnya ada di aplikasi tetapi terpecah di beberapa baris):
  - `a1 , an , a2 , an-1 ,…., an/2 , a(n/2) + 1`
  - `a(n/2)-1 , an/2 are subtracted twice while a(n/2)+1 , a(n/2)+2 , a(n/2)+3 ,….., an – 1 , an are added`
- `Lambda_Code_Snippets_Java_8.pdf` (1 baris, hasil OCR dari gambar; baris ikon/handle media sosial atau huruf yang salah terbaca, isinya sudah diperiksa manual):
  - `this in POF format`
- `Spring_Dependency_Injection.pdf` (2 baris, hasil OCR dari gambar; baris ikon/handle media sosial atau huruf yang salah terbaca, isinya sudah diperiksa manual):
  - `String databaseUrl1;`
  - `Zh, ‘igh. £9 X [in) ciamgnanadeep`
- `60_days_Java.pdf` (2 baris, hasil OCR: footer slide yang terbaca rusak, dan baris email/nomor telepon pribadi dari tangkapan layar profil LinkedIn penulis yang sengaja tidak disalin (sisa teks profil ada di arsip)):
  - `Hariprasath V {J seco tot`
  - `7 rr 5 hariprasathv6@gmail.com ©+919080555464`
- `TDD.pdf` (2 baris, hasil OCR: teks slide yang tercampur ilustrasi di sebelahnya; kalimat aslinya sudah disalin utuh dan diperiksa per slide):
  - `<7 analoginya dibalik! maya rest.Cace 0`
  - `male dites, tapi kamu ages CODE`

Catatan:

- ✍️ `Data_Structure.pdf`: Catatan tulisan tangan; OCR tidak andal, isi 8 halaman diperiksa manual.
- `Belajar_Hacktiv8.docx` hanya berisi dua gambar slide. Keduanya ditampilkan di modul *Program Applied AI Engineer (Hacktiv8)* (kurikulum LLM), dan isinya juga ditulis sebagai teks.
- `100 Lambda Code Snippets (Java 8).pdf`, `Java Functional Interfaces.pdf`, `Lazy Loading React.pdf`, dan `Spring Dependency Injection.pdf` berisi kode dalam bentuk gambar; kodenya disalin manual lalu dicocokkan dengan OCR. PDF Lambda hanya memuat snippet 1–50 dan nomor 33 tidak ada di sumber.
- `TDD.pdf` dan `FSD_dan_TSD.pdf` seluruhnya gambar slide; isinya disalin manual lalu dicocokkan dengan OCR. `60_days_Java.pdf`, `Exploring_the_Java_Ecosystem.pdf`, dan `Microservices_Design_Pattern.pdf` punya lapisan teks; kode di gambar (Hello World) dan label diagram juga disalin, dan 14 slide pola microservices ditampilkan sebagai gambar.
- `E-Book_Arsitektur_Performa_Sistem_Enterprise.pdf` dan `Modul_DevOps_Production-Ready_Docker_Kubernetes_V2.pdf` adalah versi baru dari dokumen yang sudah ada. Hanya bagian yang baru (studi kasus, kode, peringatan keamanan) yang ditambahkan ke modul topik yang sama dengan judul *Pembaruan …*; bagian yang sama dengan versi lama tidak diulang.
- `Coding_Interview_in_Java.pdf`: 23 dari 120 soal juga ada di track soal Java yang sudah ada. Soalnya tetap ditampilkan karena solusinya berbeda, dengan tautan ke modul lama supaya bisa dibandingkan.
- `alt/…` adalah versi ringkas roadmap Web/Mobile yang terunggah dua kali dengan isi berbeda. Versi komprehensif ada di jalur utama; bagian versi ringkas yang berbeda ada di arsip.
- `English_Komprehensif_v2_Vocabulary_Baru.docx` isinya identik dengan `English_Komprehensif_Tenses_TOEFL_v2.docx`.
