import type { Module, Track } from '../types';
import { callout, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const START = 'Mulai di Sini';

export const englishRoadmapTracks: Track[] = [
  { title: START, summary: 'Peta level CEFR A1–C2, urutan modul dari pemula sampai mahir, padanan skor IELTS/TOEFL, dan rutinitas belajar mingguan.' },
];

export const englishRoadmapSource = 'Peta Belajar English: materi tulisan tangan dari Council of Europe (CEFR), IELTS, dan ETS (4 November 2026)';

const l = (label: string, id: string) => `[${label}](#english.${id})`;

export const englishRoadmapModules: Omit<Module, 'code'>[] = [
  {
    id: 'english-peta-belajar-cefr',
    title: 'Peta Belajar English: Level CEFR A1–C2 & Urutan Modul',
    summary: 'Cara menentukan level Anda dengan CEFR, modul yang dipelajari di tiap level dari pemula sampai mahir, jalur khusus developer, padanan skor IELTS/TOEFL, dan rutinitas mingguan.',
    track: START, source: englishRoadmapSource, duration: '20 menit', level: 'Easy',
    blocks: [
      paragraph('Kurikulum English ini besar: kosakata per topik, grammar, 16 tenses, TOEFL, IELTS, sampai English untuk kerja. Halaman ini menjawab pertanyaan pertama: **mulai dari mana, dan apa berikutnya?** Patokannya adalah **CEFR** (Common European Framework of Reference), skala enam level yang dipakai di seluruh dunia oleh kampus, perusahaan, dan penyelenggara tes.'),
      paragraph('Aturan praktisnya: kuasai satu level sampai Anda bisa *memakai* materinya (berbicara dan menulis), bukan sekadar mengerti saat membaca. Level CEFR diukur dari apa yang bisa Anda **lakukan** dengan bahasa, bukan dari berapa banyak aturan yang Anda hafal.'),
      heading('Enam level CEFR dalam satu tabel'),
      table(['Level', 'Sebutan', 'Yang bisa dilakukan', 'Contoh di tempat kerja'], [
        ['A1', 'Breakthrough', 'Memahami dan memakai frasa sehari-hari yang sangat dasar; memperkenalkan diri.', '"Hi, I\'m Budi. I\'m a backend developer."'],
        ['A2', 'Waystage', 'Berkomunikasi untuk tugas rutin dan sederhana; menjelaskan latar belakang secara singkat.', 'Menulis pesan pendek: "The server is down. I\'m checking it now."'],
        ['B1', 'Threshold', 'Menangani situasi umum, menjelaskan pengalaman, alasan, dan rencana secara sederhana.', 'Memberi update stand-up dan menulis email permintaan yang jelas.'],
        ['B2', 'Vantage', 'Berdiskusi teknis dengan lancar dan spontan, menjelaskan sudut pandang beserta kelebihan dan kekurangannya.', 'Menjelaskan trade-off desain dan lolos interview kerja internasional.'],
        ['C1', 'Effective Operational Proficiency', 'Memakai bahasa secara fleksibel dan efektif untuk keperluan sosial, akademik, dan profesional; teks terstruktur dan rapi.', 'Memimpin meeting, menulis design doc, bernegosiasi scope.'],
        ['C2', 'Mastery', 'Memahami hampir semua yang didengar atau dibaca, mengekspresikan diri dengan sangat presisi dan nuansa halus.', 'Menulis artikel teknis publik, presentasi konferensi tanpa hambatan.'],
      ]),
      callout('tip', 'Target realistis untuk developer', 'Untuk bekerja di tim internasional, **B2** biasanya sudah cukup untuk produktif; **C1** membuat Anda nyaman memimpin diskusi dan menulis dokumen penting. Jangan menunggu "sempurna" untuk mulai melamar: kebanyakan tim menilai kejelasan komunikasi, bukan aksen.'),
      heading('Cara cepat mengetahui level Anda'),
      table(['Jika Anda…', 'Kemungkinan level', 'Mulai dari'], [
        ['Sulit menyusun kalimat sederhana dan sering bingung memilih is/am/are atau do/does', 'A1–A2', l('Parts of Speech', 'english-parts-noun-pronoun-verb')],
        ['Paham teks pendek, tetapi kalimat tanya dan tenses masih sering salah', 'A2', l('Questions', 'english-questions') + ' dan ' + l('Kelompok Present', 'kelompok-present')],
        ['Bisa membaca dokumentasi, tetapi kaku saat bicara di meeting', 'B1', l('Modal Verbs', 'english-modal-verbs') + ' dan ' + l('Meeting & Stand-up', 'english-meeting-standup')],
        ['Lancar berdiskusi, tetapi tulisan terasa kurang rapi dan kurang diplomatis', 'B2', l('Technical Writing', 'english-technical-writing') + ' dan ' + l('Diplomatic English', 'english-diplomatic')],
        ['Butuh skor resmi untuk beasiswa, kerja, atau migrasi', 'B2–C1', l('Format Ujian IELTS', 'format-ujian-cara-penilaian') + ' atau ' + l('Format TOEFL', 'kenali-format-tes')],
      ]),
      paragraph('Untuk angka yang lebih objektif, kerjakan tes penempatan gratis seperti EF SET atau tes level di situs Cambridge/British Council, lalu cocokkan hasilnya dengan tabel di bawah.'),
      heading('Urutan modul per level'),
      table(['Level', 'Grammar & struktur', 'Pengucapan & listening', 'Kosakata', 'Praktik kerja'], [
        ['A1–A2', `${l('Noun, Pronoun & Verb', 'english-parts-noun-pronoun-verb')}, ${l('Adjectives & Adverbs', 'english-adjectives-adverbs')}, ${l('Prepositions & Determiners', 'english-function-words')}, ${l('Questions', 'english-questions')}`, l('Pronunciation Dasar', 'english-pronunciation-dasar'), `${l('Percakapan Umum', 'percakapan-umum-general-conversation')}, ${l('Travelling', 'travelling')}`, l('Remote Work: stand-up & chat', 'remote-work-komunikasi-tim-internasional')],
        ['A2–B1', `${l('Struktur Kalimat', 'english-sentence-structure')}, ${l('Kelompok Present', 'kelompok-present')}, ${l('Kelompok Past', 'kelompok-past')}, ${l('Kelompok Future', 'kelompok-future')}, ${l('Irregular Verbs', 'irregular-verbs-v1-v2-v3')}`, l('Word Stress & Ending', 'english-word-sentence-stress'), `${l('IT & Teknologi', 'it-teknologi-technology')}, ${l('Phrasal Verbs Penting', 'phrasal-verbs-penting')}`, l('Email & Chat Profesional', 'english-email-chat-profesional')],
        ['B1–B2', `${l('Modal Verbs', 'english-modal-verbs')}, ${l('Used to, Wish & Causative', 'english-used-to-wish-causative')}, ${l('Linking Words', 'english-linking-words')}, ${l('Tenses yang Sering Tertukar', 'perbandingan-yang-paling-sering-tertukar')}`, l('Connected Speech & Listening', 'english-connected-speech-listening'), `${l('Pengembangan Software', 'pengembangan-software-pemrograman-software-devel')}, ${l('Phrasal Verbs & Jargon Developer', 'phrasal-verbs-jargon-untuk-developer')}`, `${l('Meeting & Stand-up', 'english-meeting-standup')}, ${l('Code Review & Feedback', 'english-code-review-feedback')}`],
        ['B2–C1', `${l('Modal Perfect', 'english-modal-perfect')}, ${l('Conditionals & Relative Clauses', 'conditionals-subjunctive-reduced-relative-clause')}, ${l('Noun Clauses & Gerund', 'noun-clauses-gerund-infinitive-prepositions-repo')}, ${l('Agreement & Passive', 'agreement-parallelism-word-form-passive')}`, l('Speaking IELTS', 'speaking-struktur-aturan'), `${l('Academic Word List', 'kosakata-akademik-toefl-academic-word-list')}, ${l('IT & Software Engineering Lanjutan', 'it-software-engineering-lanjutan')}`, `${l('Technical Writing', 'english-technical-writing')}, ${l('Presentasi & Demo', 'english-presentasi-demo')}, ${l('Interview Developer', 'english-interview-developer')}`],
        ['C1–C2', `${l('Comparatives, Inversion & Articles', 'comparatives-inversion-articles-pronouns')}, ${l('Kesalahan Umum Pelajar Indonesia', 'kesalahan-umum-pelajar-indonesia')}`, l('Listening IELTS', 'listening'), `${l('Collocation & Idiom', 'sehari-hari-collocation-idiom')}, ${l('Bisnis Lanjutan', 'bisnis-profesional-lanjutan')}`, `${l('Diplomatic English', 'english-diplomatic')}, ${l('Negosiasi', 'negosiasi-negotiation')}, ${l('Writing Task 2', 'writing-task-2')}`],
      ]),
      heading('Jalur cepat khusus developer (8–12 minggu)'),
      paragraph('Bila tujuan utama Anda bekerja di tim internasional, ikuti urutan ini dan pelajari grammar di tabel atas hanya ketika Anda menemukan kesalahan yang sama berulang kali:'),
      { type: 'list', ordered: true, items: [
        `${l('Pronunciation Dasar', 'english-pronunciation-dasar')} dan ${l('Word Stress & Istilah IT', 'english-word-sentence-stress')}: supaya istilah teknis yang Anda ucapkan dikenali lawan bicara.`,
        `${l('Questions', 'english-questions')} dan ${l('Modal Verbs', 'english-modal-verbs')}: bertanya dan meminta tolong dengan sopan adalah 50% komunikasi kerja.`,
        `${l('Email & Chat Profesional', 'english-email-chat-profesional')}: komunikasi async adalah mayoritas pekerjaan remote.`,
        `${l('Technical Writing', 'english-technical-writing')} dan ${l('Code Review & Feedback', 'english-code-review-feedback')}: commit, PR, bug report, dan review comment.`,
        `${l('Meeting & Stand-up', 'english-meeting-standup')} dan ${l('Presentasi & Demo', 'english-presentasi-demo')}.`,
        `${l('Diplomatic English', 'english-diplomatic')}: menolak, tidak setuju, dan memberi feedback tanpa terdengar kasar.`,
        `${l('Interview Developer', 'english-interview-developer')} bersama ${l('Wawancara Teknis', 'wawancara-teknis-technical-interview')} sebelum mulai melamar.`,
      ] },
      heading('Padanan skor tes resmi'),
      paragraph('Tabel berikut memakai pemetaan dari penyelenggara tes (IELTS dan ETS). Angkanya adalah perkiraan batas bawah tiap level, bukan jaminan; batas 6.5 IELTS misalnya kadang dianggap B2, kadang C1. Selalu cek syarat skor institusi tujuan Anda.'),
      table(['CEFR', 'IELTS (overall band)', 'TOEFL iBT skala 1–6 (sejak 21 Jan 2026)', 'TOEFL iBT skala lama 0–120', 'TOEFL ITP (populer di kampus Indonesia)'], [
        ['A2', '—', '2–2.5', '—', '337'],
        ['B1', '4.0–5.0', '3–3.5', '42', '460'],
        ['B2', '5.5–6.5', '4–4.5', '72', '543'],
        ['C1', '7.0–8.0', '5–5.5', '95', '627'],
        ['C2', '8.5–9.0', '6', '114', 'Di atas cakupan ITP'],
      ]),
      callout('info', 'TOEFL iBT berganti skala', 'Mulai 21 Januari 2026, laporan TOEFL iBT memakai skala **1–6** dengan langkah setengah poin yang langsung selaras dengan CEFR. Selama masa transisi dua tahun, laporan juga mencantumkan skor setara di skala lama 0–120, jadi syarat lama seperti "TOEFL iBT 80" masih bisa dicocokkan.'),
      callout('warn', 'Kesalahan umum saat belajar', 'Tiga kebiasaan yang paling memperlambat pelajar Indonesia: (1) **menghafal daftar kata tanpa kalimat contoh**, sehingga kosakata tidak pernah keluar saat berbicara; (2) **hanya membaca dan mendengar** tanpa pernah menulis atau berbicara, padahal kemampuan pasif selalu jauh di depan kemampuan aktif; (3) **menunggu grammar sempurna sebelum berbicara**. Grammar diperbaiki lewat umpan balik, bukan lewat diam.'),
      heading('Rutinitas mingguan yang bisa dipertahankan'),
      table(['Hari', 'Aktivitas (30–45 menit)', 'Output yang dibuktikan'], [
        ['Senin', 'Satu modul grammar atau kosakata sesuai level', 'Lima kalimat buatan sendiri tentang pekerjaan Anda'],
        ['Selasa', 'Listening + shadowing 10 menit dari talk/podcast teknis', 'Rekaman suara Anda menirukan 1 menit audio'],
        ['Rabu', 'Menulis: email, PR description, atau ringkasan artikel', 'Satu tulisan 150–250 kata, dicek dengan kamus/AI lalu diperbaiki'],
        ['Kamis', 'Speaking: jawab satu pertanyaan interview atau jelaskan satu fitur', 'Rekaman 2 menit tanpa naskah'],
        ['Jumat', 'Ulang kosakata (spaced repetition) + kuis modul minggu ini', 'Semua kuis modul minggu ini terjawab tanpa membuka jawaban'],
        ['Akhir pekan', 'Konsumsi bebas: film, game, atau video dengan subtitle English', 'Catat 5 frasa baru beserta kalimat aslinya'],
      ]),
      ...practice('english-peta-belajar-cefr', [
        'Kerjakan satu tes penempatan online dan catat level CEFR Anda beserta tanggalnya.',
        'Pilih satu baris di tabel "Urutan modul per level" sesuai hasil tes, lalu tandai 4 modul yang akan diselesaikan bulan ini.',
        'Tulis tujuan konkret dalam bahasa Inggris, misalnya "By March I can give my stand-up update without notes."',
        'Jalankan rutinitas mingguan selama 2 minggu berturut-turut dan simpan semua rekaman serta tulisan sebagai portofolio kemajuan.',
        'Ulangi tes penempatan setelah 8–12 minggu dan bandingkan hasilnya.',
      ]),
      ...quiz([
        ['ENR-01', 'Seorang developer lancar membaca dokumentasi tetapi kaku dan lambat saat menjawab pertanyaan di meeting. Pada level mana kemungkinan ia berada, dan apa yang perlu dilatih?', 'Kemungkinan di sekitar B1: kemampuan pasif (membaca) sudah baik, tetapi kemampuan aktif (berbicara spontan) tertinggal. Fokuskan latihan pada output: modal verbs untuk bertanya dan meminta tolong, frasa meeting, serta speaking harian yang direkam, bukan menambah bacaan.'],
        ['ENR-02', 'Berapa kira-kira skor IELTS dan TOEFL iBT yang setara dengan B2?', 'IELTS sekitar 5.5–6.5; TOEFL iBT 4–4.5 di skala baru 1–6 (setara mulai sekitar 72 di skala lama 0–120). Ini perkiraan dari pemetaan penyelenggara; institusi tujuan bisa memasang syarat yang berbeda.'],
        ['ENR-03', 'Mengapa level CEFR diukur dengan kalimat "can do" dan bukan dengan daftar materi grammar?', 'Karena CEFR menilai apa yang bisa Anda lakukan dengan bahasa dalam situasi nyata (memperkenalkan diri, berdiskusi, menulis laporan). Hafal aturan tanpa bisa memakainya tidak menaikkan level.'],
      ]),
      heading('Referensi'),
      references(
        ['Council of Europe: CEFR level descriptions', 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions'],
        ['IELTS: everything you need to know about IELTS and the CEFR', 'https://ielts.org/news-and-insights/everything-you-need-to-know-about-ielts-and-the-cefr'],
        ['ETS: understand TOEFL iBT scores (skala 1–6)', 'https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html'],
        ['EF SET: tes penempatan gratis', 'https://www.efset.org/'],
      ),
    ],
  },
];
