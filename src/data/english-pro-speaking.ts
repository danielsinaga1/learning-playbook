import type { Block, Module, VocabItem } from '../types';
import { callout, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const TRACK = 'English Profesional';

export const englishProSpeakingSource = 'English Profesional (Berbicara): materi tulisan tangan dari British Council LearnEnglish, Cambridge Dictionary, dan panduan wawancara perilaku STAR (4 November 2026)';

const sub = (text: string): Block => ({ type: 'h', text, level: 3 });
const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });
/** Bank frasa: [frasa English, makna/catatan pemakaian, contoh English]. */
const phrases = (items: [term: string, meaning: string, example?: string][]): Block => ({
  type: 'vocab', items: items.map(([term, meaning, example]): VocabItem => ({ term, meaning, example })),
});
const details = (summary: string, blocks: Block[]): Block => ({ type: 'details', summary, blocks });
const tabs = (...items: [label: string, blocks: Block[]][]): Block => ({
  type: 'tabs', tabs: items.map(([label, blocks]) => ({ label, blocks })),
});

export const englishProSpeakingModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── 1. Meeting, Stand-up & Small Talk ─────────────────────────────
  {
    id: 'english-meeting-standup',
    title: 'Meeting, Stand-up & Small Talk',
    summary: 'Frasa per fungsi untuk rapat tim internasional: membuka agenda, stand-up lisan & tertulis, minta klarifikasi, menyela, setuju/tidak setuju, merangkum action item, frasa video call, small talk, dan contoh dialog incident sync.',
    track: TRACK, source: englishProSpeakingSource, duration: '1 jam', level: 'Med',
    blocks: [
      paragraph('Daftar kosakata rapat sudah ada di [Kerja & Perusahaan](#english.kerja-perusahaan-work-company) dan [Remote Work](#english.remote-work-komunikasi-tim-internasional). Materi ini melatih **keterampilan berbicaranya**: frasa dikelompokkan menurut *fungsi* (apa yang ingin Anda lakukan dalam percakapan), sehingga saat rapat berjalan cepat Anda tidak mencari kata, tetapi memilih "alat" yang tepat: minta ulang, menyela, menolak halus, atau menutup diskusi.'),
      paragraph('Prinsip utamanya: dalam rapat remote, **diam dianggap setuju**. Developer Indonesia sering paham isi rapat tetapi tidak bersuara karena takut salah grammar. Rekan internasional lebih menghargai kalimat sederhana yang jelas daripada kalimat panjang yang sempurna. Hafalkan 2–3 frasa per fungsi, bukan semuanya.'),

      heading('1. Membuka rapat & menyepakati agenda'),
      phrases([
        ["Let's get started.", 'Pembuka paling netral. Lebih alami daripada "Let us begin the meeting".', "Okay, it's two past — let's get started."],
        ["Thanks for joining, everyone.", 'Sapaan pembuka standar untuk rapat online.', 'Thanks for joining, everyone. I know it is late for some of you.'],
        ['The goal of today is to…', 'Menyatakan tujuan rapat dalam satu kalimat.', 'The goal of today is to agree on the scope for Sprint 14.'],
        ["We've got three things on the agenda.", 'Menyebut jumlah poin dulu membantu pendengar mengikuti.', "We've got three things on the agenda: the release, the incident review, and on-call."],
        ["Let's try to wrap up by half past.", 'Menetapkan batas waktu dengan sopan.', "Let's try to wrap up by half past so people can make their next call."],
        ['Is there anything anyone wants to add?', 'Memberi kesempatan menambah agenda.', 'Before we start, is there anything anyone wants to add?'],
      ]),

      heading('2. Memberi status: stand-up lisan & versi async'),
      paragraph('Stand-up bukan laporan ke atasan, tetapi sinkronisasi tim. Rumusnya **Yesterday → Today → Blockers**, maksimal 60 detik. Sebut *hasil*, bukan aktivitas ("I finished the retry logic" lebih baik daripada "I was doing many things about the webhook").'),
      tabs(
        ['Lisan (60 detik)', [
          list([
            "**Yesterday** I finished the retry logic for the payment webhook. The PR is up and waiting for review.",
            "**Today** I'm going to write the integration tests and pair with Sara on the idempotency key.",
            "**Blockers**: I still don't have access to the staging database. Could someone from ops help me after this?",
            "Variasi: *I'm on track for Thursday.* / *I'm running a bit behind — the migration took longer than expected.* / *Nothing blocking me right now.*",
          ]),
        ]],
        ['Tertulis (Slack/async)', [
          list([
            '**Yesterday:** Finished retry logic for the payment webhook (PR #482, needs review).',
            '**Today:** Integration tests + pairing with Sara on idempotency keys.',
            '**Blockers:** No access to the staging DB yet — ops, could you take a look?',
            '**Heads-up:** I\'m out Friday afternoon (public holiday in Indonesia).',
          ]),
          callout('tip', 'Gaya tulisan async', 'Versi tertulis boleh tanpa subjek ("Finished…", "Pairing with…") dan memakai label tebal. Sertakan nomor PR/tiket agar orang di zona waktu lain bisa bertindak tanpa bertanya balik. Lanjutan gaya chat ada di [Email & Chat Profesional](#english.english-email-chat-profesional).'),
        ]],
      ),

      heading('3. Minta klarifikasi & mengecek pemahaman'),
      paragraph('Ini fungsi **paling penting** bagi non-native speaker. Meminta ulang bukan tanda lemah; mengerjakan hal yang salah selama seminggu jauh lebih mahal. Gunakan frasa yang menyebut *bagian mana* yang belum jelas.'),
      phrases([
        ['Sorry, could you say that again?', 'Minta diulang; sopan dan umum.', 'Sorry, could you say that again? You cut out a bit.'],
        ['Sorry, I didn\'t catch the last part.', 'Lebih spesifik: hanya bagian akhir yang terlewat.', "Sorry, I didn't catch the last part — after the cache?"],
        ['Could you speak a bit more slowly?', 'Wajar diminta, terutama saat aksen sulit.', 'Could you speak a bit more slowly? My connection is lagging.'],
        ['Just to make sure I understand, …', 'Mengulang dengan kata sendiri (paraphrase) untuk konfirmasi.', 'Just to make sure I understand, we ship the API first and the UI next sprint?'],
        ['When you say X, do you mean…?', 'Mengklarifikasi istilah yang ambigu.', 'When you say "real-time", do you mean under one second, or just push-based?'],
        ['So what you\'re saying is…', 'Merangkum maksud lawan bicara.', "So what you're saying is the bottleneck is the database, not the API."],
        ['Could you give me an example?', 'Minta contoh konkret.', 'Could you give me an example of a request that fails?'],
      ]),

      heading('4. Menyela, setuju, tidak setuju & mengulur waktu'),
      tabs(
        ['Menyela', [phrases([
          ['Sorry to interrupt, but…', 'Menyela dengan sopan; pendek lalu langsung ke poin.', 'Sorry to interrupt, but that endpoint is already deprecated.'],
          ['Can I just jump in here?', 'Informal, umum di tim tech.', 'Can I just jump in here? I have some context on this.'],
          ['If I could just add something…', 'Lebih formal.', 'If I could just add something about the timeline…'],
          ['Sorry, go ahead.', 'Saat dua orang bicara bersamaan: persilakan.', 'Oh, sorry, go ahead.'],
          ['Can I finish my point?', 'Saat Anda disela. Ucapkan dengan nada ramah.', 'Can I just finish my point? It will take ten seconds.'],
        ])]],
        ['Setuju', [phrases([
          ['That makes sense.', 'Setuju yang paling sering dipakai developer.', 'That makes sense. Let\'s go with the queue.'],
          ['I agree with Tom on this.', 'Menyebut nama menunjukkan Anda menyimak.', 'I agree with Tom on this — the risk is low.'],
          ['I agree up to a point, but…', 'Setuju sebagian.', 'I agree up to a point, but we still need a rollback plan.'],
          ['That\'s true, although…', 'Setuju sebagian dengan catatan.', "That's true, although it only works if traffic stays flat."],
          ['I see where you\'re coming from.', 'Mengakui sudut pandang tanpa langsung setuju.', "I see where you're coming from, but I'm worried about cost."],
        ])]],
        ['Tidak setuju', [phrases([
          ["I'm not sure I agree.", 'Tidak setuju yang sopan dan jelas.', "I'm not sure I agree. Caching here might hide the real problem."],
          ['I see it a bit differently.', 'Lebih lembut; lanjutkan dengan alasan.', 'I see it a bit differently — the issue is the schema, not the query.'],
          ['Have we considered…?', 'Tidak setuju lewat pertanyaan.', 'Have we considered just adding an index first?'],
          ['My concern is that…', 'Menyampaikan risiko, bukan menyerang ide.', 'My concern is that we have no tests around that module.'],
        ])]],
        ['Mengulur waktu', [phrases([
          ['That\'s a good question. Let me think for a second.', 'Memberi jeda berpikir tanpa diam canggung.', "That's a good question. Let me think for a second."],
          ['Let me check and get back to you.', 'Bila jawabannya butuh data.', 'Let me check the logs and get back to you by end of day.'],
          ["I'd need to look into that.", 'Tidak mau menebak.', "I'd need to look into that before I commit to a date."],
          ['How can I put this…', 'Pengisi jeda alami (bukan "eee…").', 'How can I put this… the service works, but nobody owns it.'],
        ])]],
      ),
      paragraph('Tingkat kehalusan ketidaksetujuan dibahas mendalam di [Diplomatic English](#english.english-diplomatic).'),

      heading('5. Merangkum action item & menutup rapat'),
      paragraph('Rapat tanpa ringkasan menghasilkan kebingungan di zona waktu lain. Pola yang aman: **siapa + akan melakukan apa + kapan**. Jika tidak ada yang merangkum, Anda boleh mengambil peran itu; ini cara mudah terlihat proaktif.'),
      phrases([
        ['So, to sum up…', 'Memulai ringkasan.', 'So, to sum up: we freeze the release until the fix is verified.'],
        ['Let me recap the action items.', 'Daftar tugas hasil rapat.', 'Let me recap the action items before we drop off.'],
        ["Who's going to own this?", 'Menetapkan penanggung jawab (owner).', "Who's going to own the post-mortem?"],
        ["I'll take that.", 'Mengambil tugas secara sukarela.', "I'll take that. I'll have a draft by Wednesday."],
        ['Daniel will look into X by Friday.', 'Format ringkasan: nama + will + tugas + tenggat.', 'Daniel will look into the timeout issue by Friday.'],
        ["I'll send a summary in the channel.", 'Janji ringkasan tertulis.', "I'll send a summary in the channel after this call."],
        ["Let's leave it there. Thanks, everyone.", 'Menutup rapat.', "I think we can leave it there. Thanks, everyone."],
        ["Let's take this offline.", 'Diskusi berlanjut di luar rapat (berdua/chat), bukan "offline" internet.', "This is getting detailed — let's take this offline, Raj."],
      ]),

      heading('6. Frasa khusus video call'),
      table(['Situasi', 'Ucapkan', 'Hindari'], [
        ['Orang lain bicara tapi tidak terdengar', "*I think you're on mute.* / *You're still muted.*", '*Your mic is die* / *Open your mic*'],
        ['Suara putus-putus', "*You're breaking up.* / *You cut out for a second — could you repeat that?*", '*Your signal is bad, bad*'],
        ['Video membeku', '*Your screen is frozen.* / *I think we lost you for a moment.*', '*You are stuck*'],
        ['Mau berbagi layar', '*Let me share my screen.* / *Can everyone see my screen?*', '*I will share screen, can or not?*'],
        ['Selesai berbagi', "*I'll stop sharing now.*", '*Close share*'],
        ['Koneksi Anda buruk', "*Sorry, my connection is unstable. I'll turn my camera off.*", 'Diam saja lalu menghilang'],
        ['Harus keluar lebih dulu', "*Sorry, I have to drop off for another call.* / *I need to jump.*", '*I want to go out*'],
        ['Mengecek audio', '*Can you hear me okay?*', '*Can you hear me or not?*'],
      ]),

      heading('7. Small talk: topik aman, menjaga obrolan, dan keluar'),
      paragraph('Dua sampai tiga menit pertama rapat sering diisi small talk. Tujuannya membangun hubungan, bukan bertukar informasi. Pola yang membuat obrolan tidak mati: **Answer + Extra detail + Question back**. Jawaban satu kata ("Fine.") terdengar dingin bagi telinga Anglo.'),
      table(['Topik aman', 'Pembuka', 'Pertanyaan lanjutan'], [
        ['Akhir pekan', '*Did you get up to anything fun this weekend?*', "*Oh nice, how was it? Do you go there often?*"],
        ['Cuaca & musim', "*It's rainy season here, so it's been pouring every afternoon. How's the weather there?*", '*Is it getting cold already?*'],
        ['Zona waktu', '*What time is it for you now?*', "*So you're just starting your day — coffee already?*"],
        ['Makanan & perjalanan', '*Have you ever been to Southeast Asia?*', '*What was your favourite place?*'],
        ['Teknologi / hobi', "*Have you tried that new framework everyone's talking about?*", '*Would you use it in production?*'],
      ]),
      list([
        '**Hindari**: gaji, agama, politik, usia, status pernikahan ("Are you married? Why not yet?"), berat badan atau penampilan ("You look fatter"). Pertanyaan yang biasa di Indonesia bisa terdengar sangat pribadi.',
        "**Keluar dengan sopan**: *Anyway, shall we get started?* / *I'll let you get back to it.* / *Great catching up — talk soon!*",
        "**Menjawab 'How are you?'**: *Good, thanks! A bit busy with the release, but good. How about you?* Bukan daftar keluhan panjang, bukan juga hanya *Fine.*",
      ]),

      heading('8. Contoh dialog lengkap: incident sync'),
      details('Buka dialog: incident sync 15 menit setelah error rate naik', [
        list([
          "**Maria (lead):** Okay, let's get started. Thanks for jumping on at short notice. The goal is to understand the checkout errors and decide on next steps. Daniel, can you give us a quick status?",
          "**Daniel:** Sure. Around 9:40 UTC, the error rate on the checkout service went from roughly 0.5% to 8%. Most of the errors are timeouts when we call the payment provider. I've already rolled back yesterday's deploy, but the errors are still there, so it's probably not our code.",
          "**Tom:** Sorry to interrupt, but are we sure the rollback finished on all pods?",
          "**Daniel:** Good point. Let me double-check… yes, all six pods are on the previous version.",
          "**Maria:** Okay. Just to make sure I understand — you think the problem is on the provider's side?",
          "**Daniel:** That's my best guess right now. Their status page doesn't show anything yet, though.",
          "**Tom:** I'm not sure I agree. We also changed the connection pool size last week. Have we considered that?",
          "**Daniel:** That's true, although that change went out five days ago. But I can check the pool metrics to rule it out.",
          "**Maria:** Great. So, to sum up: Daniel will check the pool metrics and keep the rollback in place. Tom, could you contact the provider's support?",
          "**Tom:** I'll take that.",
          "**Maria:** And I'll post an update in the incident channel every 30 minutes. Let's sync again at 10:30. Thanks, everyone.",
        ]),
        callout('info', 'Perhatikan', 'Daniel memakai angka ("roughly 0.5% to 8%"), membedakan fakta dan dugaan ("That\'s my best guess"), dan menerima koreksi tanpa defensif ("Good point. Let me double-check"). Maria merangkum dengan pola *nama + will + tugas*.'),
      ]),

      callout('warn', 'Kesalahan khas pembicara Indonesia dalam rapat', '(1) Menjawab "Yes, yes" padahal belum paham: lebih baik *Sorry, could you rephrase that?* (2) **"Can I ask?"** sebelum bertanya: langsung saja *Quick question: …* (3) **"I will discuss about it"**: discuss tidak memakai about, jadi *discuss it*. (4) **"Make a meeting"**: *set up / schedule a meeting*. (5) Stand-up berisi daftar aktivitas tanpa hasil atau blocker. (6) Menjawab small talk dengan satu kata lalu diam. (7) **"Offline"** dikira "tidak online": *take it offline* artinya dibahas terpisah.'),

      ...practice('english-meeting-standup', [
        'Rekam stand-up lisan Anda (Yesterday/Today/Blockers) tentang pekerjaan nyata minggu ini: maksimal 60 detik, ada minimal satu hasil konkret dan satu blocker atau "Nothing blocking me".',
        'Tulis versi async stand-up yang sama dalam 3–4 baris berlabel dengan nomor PR/tiket; bisa dipahami tanpa konteks rapat.',
        'Ucapkan keras-keras satu frasa dari setiap fungsi (klarifikasi, menyela, setuju sebagian, tidak setuju, mengulur waktu) dalam kalimat tentang proyek Anda sendiri.',
        'Latih small talk 2 menit dengan teman atau AI: setiap jawaban harus mengikuti pola Answer + Extra detail + Question back, lalu tutup dengan frasa keluar yang sopan.',
        'Pada rapat berikutnya, ambil peran merangkum: ucapkan minimal dua action item dengan format nama + will + tugas + tenggat.',
      ]),
      ...quiz([
        ['ENT-01', 'Rekan bicara tentang "the new flow", tapi ada dua flow yang sedang dikerjakan. Frasa apa yang tepat?', 'Gunakan frasa klarifikasi istilah: "When you say the new flow, do you mean the checkout flow or the onboarding flow?" Menyebut dua pilihan membuat klarifikasi lebih cepat dijawab.'],
        ['ENT-02', 'Apa arti "Let\'s take this offline" dalam rapat?', 'Topik akan dibahas terpisah di luar rapat ini (misalnya berdua atau lewat chat) karena terlalu detail untuk semua peserta. Bukan berarti koneksi internet dimatikan.'],
        ['ENT-03', 'Perbaiki stand-up ini: "Yesterday I do many things about API. Today continue. No problem."', 'Contoh: "Yesterday I finished the pagination for the orders API. Today I\'m going to add tests for it. Nothing blocking me right now." Gunakan past simple untuk kemarin, sebut hasil konkret, dan nyatakan blocker dengan jelas.'],
        ['ENT-04', 'Bagaimana menjawab "How was your weekend?" agar obrolan berlanjut?', 'Pola Answer + Extra detail + Question back, misalnya: "Pretty good, thanks! I went hiking near Bandung — it was really foggy but beautiful. How about you, did you do anything fun?"'],
        ['ENT-05', 'Dua orang mulai bicara bersamaan dengan Anda. Apa yang diucapkan?', '"Sorry, go ahead." (mempersilakan) atau, bila poin Anda mendesak, "Sorry — can I just jump in quickly? It\'s about the deadline."'],
      ]),
      heading('Referensi'),
      references(
        ['British Council LearnEnglish — Business English', 'https://learnenglish.britishcouncil.org/business-english'],
        ['British Council LearnEnglish — halaman utama', 'https://learnenglish.britishcouncil.org/'],
        ['Cambridge Dictionary — small talk', 'https://dictionary.cambridge.org/dictionary/english/small-talk'],
        ['Cambridge Dictionary — action item', 'https://dictionary.cambridge.org/dictionary/english/action-item'],
        ['Scrum Guide — Daily Scrum', 'https://scrumguides.org/scrum-guide.html'],
      ),
    ],
  },

  // ───────────────────────────── 2. Presentasi, Demo & Q&A ─────────────────────────────
  {
    id: 'english-presentasi-demo',
    title: 'Presentasi, Demo & Sesi Q&A',
    summary: 'Struktur presentasi teknis, signposting, menjelaskan diagram arsitektur dan grafik, cara membaca angka/versi/IP/path dengan suara, skrip live demo (termasuk saat demo gagal), serta menangani pertanyaan Q&A.',
    track: TRACK, source: englishProSpeakingSource, duration: '1 jam', level: 'Med',
    blocks: [
      paragraph('Developer sering presentasi tanpa menyebutnya presentasi: demo sprint review, tech talk internal, menjelaskan desain di depan arsitek, atau walkthrough PR besar. Penonton internasional memaafkan aksen, tetapi tidak memaafkan presentasi yang **sulit diikuti**. Solusinya bukan kosakata canggih, melainkan struktur yang terdengar jelas dan *signposting*: kalimat penanda yang memberi tahu pendengar di mana mereka berada.'),
      paragraph('Materi ini juga membahas hal yang jarang diajarkan: cara **mengucapkan angka teknis** (versi, IP, persentase, desimal, path) dan apa yang dikatakan saat demo rusak di depan semua orang.'),

      heading('1. Struktur presentasi teknis'),
      table(['Bagian', 'Fungsi', 'Contoh kalimat'], [
        ['Hook', 'Membuat orang peduli dalam 20 detik pertama.', '*Last month, our checkout timed out for one in twenty users. Today I want to show you how we fixed it.*'],
        ['Agenda', 'Peta presentasi; sebut jumlah bagian.', "*I'll cover three things: the problem, the new design, and the results.*"],
        ['Isi + signposting', 'Setiap perpindahan bagian diberi penanda.', '*Moving on to the new design…*'],
        ['Summary', 'Ulangi 2–3 poin kunci.', '*So, to recap: we moved to async processing, latency dropped by 60%, and costs stayed flat.*'],
        ['Call to action', 'Apa yang Anda minta dari audiens.', "*What I need from you is a review of the RFC by Friday.*"],
        ['Q&A', 'Mengundang pertanyaan.', "*I'm happy to take any questions.*"],
      ]),

      heading('2. Bank frasa signposting'),
      phrases([
        ["Today I'd like to talk about…", 'Membuka topik.', "Today I'd like to talk about how we handle retries."],
        ["I'll start with…, then…, and finally…", 'Agenda berurutan.', "I'll start with the problem, then the design, and finally a short demo."],
        ['Moving on to…', 'Pindah bagian.', 'Moving on to the database layer.'],
        ['This brings me to…', 'Transisi yang mengalir dari poin sebelumnya.', 'This brings me to the main trade-off.'],
        ["Let's take a closer look at…", 'Masuk ke detail.', "Let's take a closer look at the sequence diagram."],
        ['As I mentioned earlier, …', 'Mengaitkan ke poin sebelumnya.', 'As I mentioned earlier, the cache is write-through.'],
        ["I'll come back to that later.", 'Menunda detail agar alur tidak putus.', "Good question — I'll come back to that in the results section."],
        ['To put it simply, …', 'Menyederhanakan konsep teknis.', 'To put it simply, the queue absorbs the traffic spikes.'],
        ['The key takeaway here is…', 'Menandai poin terpenting.', 'The key takeaway here is that most of the latency was DNS.'],
        ['That brings me to the end of…', 'Menutup.', 'That brings me to the end of the presentation.'],
      ]),

      heading('3. Menjelaskan diagram arsitektur & alur data'),
      paragraph('Ceritakan diagram seperti mengikuti **satu request** dari kiri ke kanan. Gunakan present simple (proses yang selalu terjadi) dan kata kerja yang menggambarkan gerakan. Tunjuk komponen sambil menyebut namanya: *"This box here is the gateway."*'),
      details('Contoh narasi: alur order dari client sampai notifikasi', [
        paragraph("\"Let me walk you through the flow. The request **hits** the API gateway, **which then** validates the JWT and **routes** it to the order service. The order service **writes** the order to Postgres and **publishes** an `OrderCreated` event to Kafka. **Downstream**, two consumers **pick up** that event: the payment service and the notification service. If the payment provider is slow, the payment service **retries** with exponential backoff, and after three attempts it **falls back to** a dead-letter queue. Everything **sits behind** a load balancer, and the read path **is backed by** a Redis cache.\""),
      ]),
      table(['Ungkapan', 'Makna'], [
        ['*hits / reaches*', 'request sampai ke komponen'],
        ['*sits behind / in front of*', 'posisi relatif (load balancer *in front of* the servers)'],
        ['*upstream / downstream*', 'sebelum / sesudah dalam alur data'],
        ['*fans out to*', 'satu pesan dikirim ke banyak penerima'],
        ['*is backed by*', 'disimpan/didukung oleh (*backed by S3*)'],
        ['*falls back to*', 'memakai cadangan bila gagal'],
        ['*talks to / calls*', 'berkomunikasi dengan service lain'],
        ['*is responsible for*', 'tugas sebuah komponen'],
      ]),

      heading('4. Angka, grafik & cara membaca simbol teknis'),
      paragraph('Untuk grafik, bedakan **by** (selisih) dan **to** (nilai akhir): *Latency dropped by 200 ms* (turun sebanyak 200) vs *Latency dropped to 200 ms* (sekarang 200). Kata kerja tren: *increase, rise, grow, spike* (naik tajam lalu turun); *drop, fall, decline, dip* (turun sedikit sementara); *plateau / level off* (mendatar); *peak at* (mencapai puncak); *fluctuate* (naik-turun).'),
      table(['Tertulis', 'Diucapkan', 'Catatan'], [
        ['1.5', '*one point five*', 'English memakai titik untuk desimal. 1,5 dalam English bisa dibaca "one comma five" atau disangka 15.'],
        ['3.14', '*three point one four*', 'Digit setelah titik dibaca satu per satu, bukan "three point fourteen".'],
        ['0.5%', '*zero point five percent* / *point five percent*', 'UK juga *nought point five*.'],
        ['40% → 55%', '*up fifteen percentage points* (bukan "15 percent")', 'Naik dari 40% ke 55% adalah 15 *percentage points*, atau naik 37.5% secara relatif.'],
        ['1,500', '*one thousand five hundred* / *fifteen hundred*', 'Koma di English adalah pemisah ribuan.'],
        ['2.5M', '*two point five million*', 'Bukan "two point five millions".'],
        ['250 ms', '*two hundred (and) fifty milliseconds*', 'UK cenderung memakai *and*; US sering tidak.'],
        ['p99', '*p ninety-nine* / *the ninety-ninth percentile*', '*Our p99 latency is under 300 milliseconds.*'],
        ['2×', '*twice as fast* / *two times faster* / *double*', '*Half the latency* untuk 0.5×.'],
        ['v2.3.1', '*version two point three point one* / *two dot three dot one*', 'Keduanya umum; konsisten dalam satu presentasi.'],
        ['192.168.1.10', '*one nine two dot one six eight dot one dot ten*', 'Oktet IP biasanya dibaca digit per digit, dengan *dot*.'],
        ['/var/log/nginx', '*slash var slash log slash engine-x*', 'Nginx dibaca *engine-x*.'],
        ['HTTP 404 / :8080', '*four-oh-four* / *port eighty-eighty*', '0 sering dibaca *oh* dalam kode dan nomor.'],
        ['`user_id`, `--force`, `#`, `~`', '*user underscore ID*, *dash dash force*, *hash*, *tilde*', '# disebut *pound* di US untuk telepon; *hash* dalam konteks kode/tag.'],
        ['2026, Nov 4', '*twenty twenty-six*, *November fourth* (US) / *the fourth of November* (UK)', 'Tanggal tertulis 04/11 bisa berarti 11 April di US: sebutkan nama bulan.'],
      ]),

      heading('5. Skrip live demo & saat demo rusak'),
      list([
        "**Konteks dulu**: *What you're about to see is the new retry flow running on staging.*",
        "**Narasikan aksi**: *I'm going to place an order… and now I'll kill the payment service to simulate an outage.*",
        "**Tunjukkan apa yang harus diperhatikan**: *Keep an eye on the top-right panel — that's the queue depth.*",
        "**Hubungkan ke manfaat**: *As you can see, the order isn't lost. It's retried automatically once the service comes back.*",
      ], true),
      phrases([
        ['Bear with me for a second.', 'Minta audiens menunggu sebentar (bukan "bare with me").', 'Bear with me for a second — the page is loading.'],
        ['Well, that\'s the live demo effect.', 'Humor ringan saat demo gagal; meredakan suasana.', "Well, that's the live demo effect. Let me try that again."],
        ['While that loads, let me explain what should happen.', 'Mengisi waktu tunggu dengan penjelasan.', 'While that loads, let me explain what should happen next.'],
        ["Let me switch to the recording I prepared.", 'Rencana cadangan: selalu siapkan rekaman demo.', "That's not cooperating, so let me switch to the recording I prepared."],
        ["I'll share a working version after the call.", 'Menutup kegagalan dengan janji tindak lanjut.', "I'll share a working version in the channel after the call."],
      ]),

      heading('6. Sesi Q&A'),
      paragraph('Langkah aman untuk setiap pertanyaan: **dengarkan sampai selesai → ulangi atau parafrasekan → jawab singkat → cek apakah sudah terjawab**. Mengulang pertanyaan memberi waktu berpikir dan memastikan audiens online juga mendengar.'),
      phrases([
        ["So if I understand correctly, you're asking whether…", 'Parafrase pertanyaan.', "So if I understand correctly, you're asking whether this works with multiple regions?"],
        ['Thanks for raising that.', 'Alternatif untuk "That\'s a great question", yang bila dipakai setiap kali terdengar hafalan.', 'Thanks for raising that — it was a big debate in the team.'],
        ["I don't know off the top of my head — I'll follow up.", 'Jujur tidak tahu angka/detail; janjikan tindak lanjut.', "I don't know the exact number off the top of my head. I'll follow up in the channel."],
        ['Does that answer your question?', 'Mengecek jawaban.', 'Does that answer your question, or should I go deeper?'],
        ['I can see why that\'s a concern.', 'Menanggapi pertanyaan bernada menyerang dengan tenang.', "I can see why that's a concern. Here's what we did to reduce the risk."],
        ["That's a bit outside the scope of today, but…", 'Pertanyaan tidak relevan.', "That's a bit outside the scope of today, but I'm happy to chat about it afterwards."],
        ["In the interest of time, let's take that offline.", 'Pertanyaan terlalu panjang atau satu orang mendominasi.', "In the interest of time, let's take that offline — I'll ping you."],
      ]),

      heading('7. Teknik latihan (rehearsal)'),
      list([
        '**Rekam diri sendiri** (video atau audio) lalu dengarkan: catat kata yang Anda ucapkan dengan tidak yakin dan jeda "eee…" yang panjang.',
        '**Ukur waktu per bagian**. Kecepatan bicara presentasi yang nyaman kira-kira 120–150 kata per menit; non-native speaker sebaiknya di batas bawah.',
        '**Tulis kalimat pembuka dan penutup kata per kata**; bagian tengah cukup poin-poin. Pembuka yang lancar menenangkan saraf.',
        '**Latih angka dan istilah** dari presentasi Anda dengan suara keras: versi, persentase, nama service.',
        '**Tandai kata yang ditekan** dalam kalimat kunci; lihat [Word & Sentence Stress](#english.english-word-sentence-stress).',
        '**Siapkan 3 pertanyaan sulit** yang mungkin muncul beserta jawaban 2–3 kalimat.',
      ]),

      callout('warn', 'Kesalahan khas pembicara Indonesia saat presentasi', '(1) Desimal dengan koma ("one koma five"): gunakan *point*. (2) **"Next slide…"** berulang sebagai satu-satunya transisi: variasikan dengan *Moving on to…* / *This brings me to…*. (3) Membaca slide kata per kata. (4) **"Any question?"**: yang alami *Any questions?* (jamak). (5) Minta maaf di awal: "Sorry for my bad English" langsung menurunkan kepercayaan audiens. Mulai saja dengan hook. (6) **"Percent"** untuk selisih persentase: gunakan *percentage points*. (7) Menyebut tanggal dengan angka saja (04/11) di tim internasional.'),

      ...practice('english-presentasi-demo', [
        'Siapkan presentasi 5 menit tentang satu fitur atau perbaikan yang pernah Anda buat, dengan hook, agenda tiga bagian, minimal tiga frasa signposting berbeda, summary, dan call to action.',
        'Rekam narasi 60–90 detik yang menjelaskan satu diagram arsitektur proyek Anda dengan mengikuti satu request dari client sampai database, memakai minimal lima ungkapan dari tabel alur data.',
        'Bacakan keras-keras dan rekam: v3.10.2, 10.0.0.255, 0.75%, 2.4M requests, p95 = 180 ms, /etc/nginx/nginx.conf, port 5432. Bandingkan dengan tabel; tidak boleh ada "koma" untuk desimal.',
        'Jelaskan satu grafik metrik (latency atau error rate) dalam 4 kalimat dengan memakai by/to dengan benar serta minimal dua kata kerja tren (spike, plateau, drop, dll.).',
        'Simulasikan demo yang gagal: ucapkan tiga kalimat pemulihan (bear with me, jelaskan apa yang seharusnya terjadi, pindah ke rekaman) tanpa berhenti lebih dari 3 detik.',
        'Minta teman mengajukan dua pertanyaan, satu sulit dan satu di luar topik; jawab dengan pola parafrase → jawab → cek.',
      ]),
      ...quiz([
        ['ENT-06', 'Apa beda "Error rate dropped by 2%" dan "Error rate dropped to 2%"?', '"By 2%" menyatakan besarnya penurunan (selisih), misalnya dari 5% menjadi 3%. "To 2%" menyatakan nilai akhir: sekarang 2%. Jika angkanya persentase, selisih yang tepat disebut "two percentage points".'],
        ['ENT-07', 'Bagaimana mengucapkan versi v1.12.0 dan IP 10.0.0.1?', 'v1.12.0: "version one point twelve point zero" (atau "one dot twelve dot oh"). Bagian versi dibaca sebagai angka utuh, tidak seperti desimal. IP 10.0.0.1: "ten dot zero dot zero dot one" (zero sering diucapkan "oh").'],
        ['ENT-08', 'Demo tiba-tiba error. Apa urutan kalimat yang baik?', 'Contoh: "Bear with me for a second." → "While that loads, let me explain what should happen." → bila tetap gagal, "Let me switch to the recording I prepared" dan "I\'ll share a working version after the call." Tetap tenang; humor ringan seperti "the live demo effect" juga membantu.'],
        ['ENT-09', 'Anda ditanya angka throughput yang tidak Anda hafal. Apa jawabannya?', '"I don\'t know the exact number off the top of my head, but it\'s roughly in the thousands per second. I\'ll check and follow up in the channel." Jangan mengarang angka; beri perkiraan bila yakin, lalu tepati janji tindak lanjut.'],
        ['ENT-10', 'Kenapa "That\'s a great question" sebaiknya tidak dipakai untuk setiap pertanyaan?', 'Jika diulang terus, frasa itu terdengar hafalan dan kehilangan makna. Variasikan dengan "Thanks for raising that", "Good point", atau langsung parafrasekan pertanyaannya.'],
      ]),
      heading('Referensi'),
      references(
        ['British Council LearnEnglish — Business English', 'https://learnenglish.britishcouncil.org/business-english'],
        ['Cambridge Dictionary — signpost', 'https://dictionary.cambridge.org/dictionary/english/signpost'],
        ['Cambridge Dictionary — plateau', 'https://dictionary.cambridge.org/dictionary/english/plateau'],
        ['Cambridge Dictionary — percentage point', 'https://dictionary.cambridge.org/dictionary/english/percentage-point'],
        ['Cambridge Dictionary — off the top of your head', 'https://dictionary.cambridge.org/dictionary/english/off-the-top-of-head'],
      ),
    ],
  },

  // ───────────────────────────── 3. Diplomatic English ─────────────────────────────
  {
    id: 'english-diplomatic',
    title: 'Diplomatic English: Softening, Hedging, Saying No & Disagreeing',
    summary: 'Mengubah kalimat langsung menjadi diplomatis (modal, past continuous, pertanyaan, passive), hedging, menolak scope/deadline dengan alternatif, tidak setuju dengan atasan, feedback lisan model SBI, minta maaf secukupnya, perbedaan budaya, dan menghindari Indoglish.',
    track: TRACK, source: englishProSpeakingSource, duration: '1 jam', level: 'Hard',
    blocks: [
      paragraph('Kalimat yang grammar-nya benar bisa tetap terdengar kasar. *"You are wrong. This design is bad."* benar secara tata bahasa, tetapi di tim internasional terdengar menyerang. Sebaliknya, kalimat yang terlalu halus bisa membuat pesan Anda tidak tertangkap sama sekali. Diplomatic English adalah keterampilan **mengatur kekuatan pesan**: isinya tetap jelas, bungkusnya membuat orang mau mendengar.'),
      paragraph('Materi ini melengkapi [Modal Verbs](#english.english-modal-verbs) (alat grammar utamanya) dan [Code Review & Feedback](#english.english-code-review-feedback) (versi tertulisnya). Fokus di sini adalah percakapan lisan: rapat, 1-on-1, dan negosiasi scope; lihat juga [Negosiasi](#english.negosiasi-negotiation).'),

      heading('1. Tabel transformasi: langsung → diplomatis'),
      table(['Teknik', 'Langsung', 'Diplomatis'], [
        ['Modal (could, might, would)', 'This is a problem.', 'This **could** be a problem.'],
        ['Pengecil (a bit, slightly, a little)', 'The API is slow.', 'The API is **a bit** slow.'],
        ['Negatif + kata positif', 'The test coverage is bad.', 'The test coverage **isn\'t quite where we want it** yet.'],
        ['Pertanyaan, bukan pernyataan', 'You should use a queue.', '**Would it make sense** to use a queue?'],
        ['Past continuous (*I was wondering*)', 'I want two more days.', '**I was wondering if** I could have two more days.'],
        ['Passive (fokus ke masalah, bukan orang)', 'You broke the build.', 'The build **was broken** by the last merge.'],
        ['*We* bukan *you*', 'You need to fix the docs.', '**We** need to update the docs.'],
        ['Pembuka penyangga', 'No, that won\'t work.', '**I\'m afraid** that might not work.'],
        ['Fokus solusi', 'Your estimate is wrong.', '**What if we** split it and re-estimate?'],
        ['Perasaan/opini, bukan fakta mutlak', 'This is overengineered.', '**I feel** this **might be** more complex than we need.'],
      ]),
      callout('tip', 'Jangan menumpuk semua teknik', '"I was just wondering if maybe we could possibly perhaps consider…" terdengar tidak percaya diri dan membingungkan. Pakai **satu atau dua** pelunak per kalimat, lalu sampaikan isi dengan jelas.'),

      heading('2. Hedging: tidak terlalu yakin dengan sopan'),
      paragraph('Hedging berarti mengurangi kepastian klaim, sesuatu yang penting saat Anda belum punya data lengkap (misalnya di tengah incident). Bedakan hedging (jujur soal ketidakpastian) dari bertele-tele.'),
      phrases([
        ['It seems / It appears that…', 'Berdasarkan yang terlihat, belum pasti.', 'It seems that the memory leak started after the upgrade.'],
        ['tends to…', 'Kecenderungan, bukan selalu.', 'This query tends to time out under heavy load.'],
        ['As far as I know, …', 'Sejauh pengetahuan saya.', "As far as I know, nobody's using the v1 endpoint."],
        ['I might be wrong, but…', 'Membuka pendapat yang berpotensi bertentangan.', 'I might be wrong, but I think the cron runs twice.'],
        ["I'd suggest…", 'Saran yang tidak memaksa.', "I'd suggest we wait for the metrics before rolling out."],
        ['There might be a risk that…', 'Menyampaikan risiko dengan lunak.', 'There might be a risk that clients cache the old token.'],
        ['From what I can see, …', 'Berdasarkan data yang ada.', 'From what I can see, the spike lines up with the batch job.'],
      ]),

      heading('3. Mengatakan "tidak" & menolak scope atau deadline'),
      paragraph('Rumus yang aman: **Akui permintaan → Nyatakan batasan dengan fakta → Tawarkan alternatif → Minta keputusan.** Penolakan tanpa alternatif terdengar tidak kooperatif; menerima semua permintaan membuat Anda gagal deadline dan kehilangan kepercayaan.'),
      list([
        "**Akui:** *I understand this is important for the client demo.*",
        "**Batasan:** *With the current scope, I don't think we can get it done by Friday without cutting the tests.*",
        "**Alternatif:** *What we could do is ship the read-only version on Friday and the editing feature next Wednesday.*",
        "**Keputusan:** *Would that work for you, or should we drop something else from the sprint?*",
      ], true),
      phrases([
        ["I'm afraid I can't take that on right now.", 'Menolak tugas tambahan.', "I'm afraid I can't take that on right now — I'm fully booked with the migration."],
        ["That's not something I can commit to by…", 'Menolak tenggat tertentu.', "That's not something I can commit to by Monday, but Wednesday is realistic."],
        ['If we add this, something else will have to give.', 'Menjelaskan konsekuensi scope creep.', 'If we add this to the sprint, something else will have to give. What should we deprioritise?'],
        ['Can we look at the priorities together?', 'Mengajak atasan memilih.', 'I have three urgent requests. Can we look at the priorities together?'],
        ['Let me get back to you with a realistic estimate.', 'Menolak memberi janji spontan.', 'Let me get back to you this afternoon with a realistic estimate.'],
      ]),

      heading('4. Tidak setuju dengan senior atau manager'),
      paragraph('Di banyak tim internasional, junior yang diam saat melihat risiko justru dinilai kurang. Kuncinya: **setujui tujuan, pertanyakan cara**, bawa data, dan lakukan secara privat bila topiknya sensitif.'),
      phrases([
        ['I see the goal, but I have a concern about the approach.', 'Memisahkan tujuan dan cara.', 'I see the goal, but I have a concern about doing it in one big release.'],
        ['Could I offer a different perspective?', 'Minta izin menyampaikan pandangan lain.', 'Could I offer a different perspective? I worked on that module last year.'],
        ['Help me understand…', 'Pertanyaan yang membuat atasan menjelaskan alasannya.', 'Help me understand why we need to rewrite it instead of refactoring.'],
        ['The data suggests…', 'Ketidaksetujuan berbasis bukti.', 'The data suggests most users never reach that page.'],
        ["If we go ahead, I'd recommend we at least…", 'Menerima keputusan sambil mengurangi risiko (disagree and commit).', "If we go ahead, I'd recommend we at least add a feature flag."],
        ['Happy to go with your call on this.', 'Menutup dengan menerima keputusan setelah didengar.', "I've said my piece — happy to go with your call on this."],
      ]),

      heading('5. Memberi & menerima feedback lisan (model SBI)'),
      paragraph('Model **SBI (Situation–Behavior–Impact)** dari Center for Creative Leadership membuat feedback spesifik dan tidak menyerang pribadi: sebut **situasi** kapan/di mana, **perilaku** yang bisa diamati (bukan sifat), dan **dampaknya**. Tutup dengan pertanyaan atau ajakan.'),
      tabs(
        ['Memberi (korektif)', [list([
          '**Situation:** *In yesterday\'s sprint review…*',
          '**Behavior:** *…when the client asked about the delay, you said the backend team was the problem.*',
          '**Impact:** *…the client then asked our team lead for an escalation, and it put us in a tough spot.*',
          '**Ajakan:** *Next time, could we say "we\'re looking into it" and sort it out internally first? What do you think?*',
        ])]],
        ['Memberi (positif)', [list([
          "*In this morning's incident call, you posted updates every fifteen minutes without being asked. It meant the support team could answer customers right away. That was really helpful — thank you.*",
          'Feedback positif juga harus spesifik. *Good job!* saja kurang bermakna.',
        ])]],
        ['Menerima', [phrases([
          ['Thanks for telling me.', 'Respons pertama; jangan langsung membela diri.', "Thanks for telling me. I didn't realise it came across that way."],
          ['Could you give me an example?', 'Minta contoh bila feedback terlalu umum.', 'Could you give me an example so I know what to change?'],
          ["That's fair.", 'Mengakui feedback yang benar.', "That's fair. I'll make sure to flag delays earlier."],
          ['Can I give a bit of context?', 'Menjelaskan konteks tanpa terdengar defensif.', 'Can I give a bit of context? I was waiting on the API spec.'],
        ])]],
      ),

      heading('6. Minta maaf secukupnya'),
      paragraph('Pembicara Indonesia cenderung **terlalu sering minta maaf** ("Sorry, sorry, sorry for my bad English, sorry for late"). Bagi telinga Anglo, ini menurunkan kesan kompeten. Ganti permintaan maaf dengan **terima kasih** bila memungkinkan, dan untuk kesalahan nyata gunakan pola **akui → perbaiki → cegah**.'),
      table(['Over-apologizing', 'Lebih baik'], [
        ['Sorry for my bad English.', '*(tidak perlu)* atau *Thanks for your patience.*'],
        ['Sorry for late reply.', '*Thanks for waiting.* / *Sorry for the late reply.* (dengan "the")'],
        ['Sorry, sorry, I am very sorry, it is all my fault.', "*That was my mistake. I've already reverted it, and I'll add a test so it doesn't happen again.*"],
        ['Sorry to disturb you.', '*Sorry to bother you* / *Got a minute?* / *Hi Sam, quick question:*'],
        ['Sorry, can I ask?', '*Quick question:* / *Can I ask you something about…?*'],
      ]),

      heading('7. Catatan budaya: indirect ala Indonesia ≠ indirect ala Anglo'),
      paragraph('Orang Indonesia dan orang Inggris sama-sama dikenal tidak langsung, tetapi **caranya berbeda**. Indonesia cenderung menghindari kata "tidak" dan konflik terbuka, misalnya menjawab "Iya, nanti saya coba" padahal artinya tidak bisa. British English memakai *understatement* dan kode sopan; American English (dan Belanda, Jerman, Australia) cenderung lebih langsung. Ini kecenderungan umum, bukan aturan untuk setiap individu.'),
      table(['Ucapan', 'Makna harfiah', 'Makna yang sering dimaksud (terutama UK)'], [
        ['*That\'s interesting.*', 'Itu menarik.', 'Bisa berarti: saya tidak yakin / tidak setuju.'],
        ['*I hear what you say.*', 'Saya mendengar.', 'Saya tidak setuju dan tidak ingin membahasnya lagi.'],
        ['*With (the greatest) respect, …*', 'Dengan hormat…', 'Saya akan mengatakan Anda keliru.'],
        ['*Quite good.*', 'Cukup bagus.', 'UK: lumayan, belum memuaskan. US: sering berarti bagus sekali.'],
        ['*Not bad.*', 'Tidak buruk.', 'UK: sering berarti bagus.'],
        ["*I'll bear it in mind.*", 'Akan saya ingat.', 'Kemungkinan besar tidak akan dilakukan.'],
        ['*Perhaps you could…*', 'Mungkin Anda bisa…', 'Sering merupakan instruksi halus: lakukan ini.'],
        ['*Just a minor comment…*', 'Komentar kecil.', 'Bisa jadi masalah yang perlu diperbaiki.'],
      ]),
      list([
        '**Iya ≠ setuju**: di tim internasional, "Yes" dianggap komitmen. Bila maksud Anda "saya dengar", katakan *I see* atau *Got it, let me check if that\'s feasible.*',
        '**Diam ≠ sopan**: tidak ada keberatan dianggap persetujuan. Sampaikan kekhawatiran dengan lunak, jangan disimpan.',
        '**Lunak di bentuk, jelas di isi**: *I\'m afraid we can\'t make Friday* tetap mengatakan "tidak" dengan jelas.',
        'Ungkapan seperti *Insya Allah* tetap boleh dipakai, tetapi jangan jadikan satu-satunya jawaban komitmen di rapat internasional: rekan yang tidak mengenalnya bisa salah menangkap tingkat kepastiannya. Tambahkan komitmen yang jelas, misalnya *I\'ll do my best to finish by Friday, but there\'s a risk because…*',
      ]),

      heading('8. Menghindari Indoglish dalam percakapan'),
      table(['Indoglish', 'Alternatif alami'], [
        ['Same-same.', '*Same here.* / *Likewise.* / *You too.* / *It\'s the same.*'],
        ['I already finish.', "*I've finished.* / *It's done.* / *I've already done it.*"],
        ['I not yet finish.', "*I haven't finished yet.* / *Not yet — it'll be done by noon.*"],
        ['"Already." (menjawab "Did you deploy it?")', '*Yes, I did.* / *Yes, it\'s already deployed.* / *Yep, it went out this morning.*'],
        ['Can or not?', '*Is that possible?* / *Would that work?*'],
        ['I want to ask.', "*I'd like to ask…* / *Quick question:*"],
        ['Please explain me.', '*Could you explain it to me?*'],
        ['How to say…', '*How can I put this…* / *What\'s the word…*'],
        ['Until now the bug still exists.', '*The bug is still there.* / *So far, we haven\'t fixed it.*'],
        ['No problem, no problem, no problem.', '*Sure.* / *Happy to help.* / *No worries.* (sekali cukup)'],
      ]),
      callout('warn', 'Kesalahan khas: terlalu halus atau terlalu langsung', 'Dua kesalahan ekstrem yang sering terjadi: (1) **Terlalu langsung** karena menerjemahkan dari Indonesia dengan grammar paling sederhana: "You must fix this today", "Your code is wrong", "Why you not reply?". Gunakan modal, *we*, dan pertanyaan. (2) **Terlalu halus sampai pesan hilang**: "Maybe, if possible, if you have time, perhaps…" lalu tidak pernah menyebut masalahnya. Setelah pelunak, isi pesan harus muncul di kalimat yang sama: *I\'m a bit worried we won\'t make Friday.*'),

      ...practice('english-diplomatic', [
        'Ubah 8 kalimat langsung dari pekerjaan Anda (komentar rapat, keberatan, permintaan) menjadi diplomatis memakai teknik berbeda dari tabel; setiap kalimat maksimal dua pelunak dan pesannya tetap jelas.',
        'Rekam penolakan scope atau deadline 45–60 detik dengan empat langkah: akui, batasan, alternatif, minta keputusan.',
        'Tulis lalu ucapkan satu feedback korektif dan satu feedback positif dengan model SBI tentang situasi kerja nyata (nama boleh disamarkan).',
        'Latih respons menerima feedback: minta teman memberi kritik acak, lalu jawab dengan "Thanks for telling me" + pertanyaan klarifikasi, tanpa membela diri di kalimat pertama.',
        'Rekam diri Anda di satu rapat atau latihan; hitung berapa kali Anda mengucapkan "sorry". Targetkan maksimal satu kali, dan ganti sisanya dengan "thanks".',
      ]),
      ...quiz([
        ['ENT-11', 'Buat versi diplomatis dari "You didn\'t test this, so production broke."', 'Contoh: "It looks like this change wasn\'t covered by tests, and that may be what caused the outage. Could we add a test before the next deploy?" Tekniknya: hedging (looks like, may), passive untuk menghindari menyalahkan orang, dan fokus solusi dengan pertanyaan.'],
        ['ENT-12', 'Manager Inggris berkata "That\'s an interesting idea, I\'ll bear it in mind." Apa kemungkinan maksudnya?', 'Kemungkinan besar ia tidak yakin dengan ide itu dan tidak berencana menjalankannya. Jika idenya penting, tanyakan langsung dengan sopan: "Would it help if I put together a quick proof of concept?" untuk mendapat sinyal yang lebih jelas.'],
        ['ENT-13', 'Apa empat langkah menolak deadline yang tidak realistis?', '(1) Akui kepentingan permintaannya, (2) nyatakan batasan dengan fakta, (3) tawarkan alternatif (scope lebih kecil, tanggal lain, atau prioritas dikorbankan), (4) minta keputusan: "Would that work for you?"'],
        ['ENT-14', 'Perbaiki: "Sorry to disturb, can I ask? I already finish the API but not yet deploy."', '"Hi, sorry to bother you — quick question. I\'ve finished the API, but I haven\'t deployed it yet. Should I deploy it today or wait for the review?" Perhatikan present perfect (I\'ve finished, haven\'t deployed) dan pertanyaan yang langsung ke poin.'],
        ['ENT-15', 'Apa tiga komponen SBI dan mengapa "You are careless" bukan feedback SBI?', 'Situation (kapan/di mana), Behavior (tindakan yang bisa diamati), Impact (akibatnya). "You are careless" adalah label sifat, bukan perilaku teramati, sehingga terasa menyerang pribadi dan tidak memberi tahu apa yang harus diubah.'],
      ]),
      heading('Referensi'),
      references(
        ['Cambridge Dictionary Grammar — Politeness', 'https://dictionary.cambridge.org/grammar/british-grammar/politeness'],
        ['Cambridge Dictionary Grammar — Hedges', 'https://dictionary.cambridge.org/grammar/british-grammar/hedges'],
        ['Cambridge Dictionary — understatement', 'https://dictionary.cambridge.org/dictionary/english/understatement'],
        ['British Council LearnEnglish — Business English', 'https://learnenglish.britishcouncil.org/business-english'],
        ['Center for Creative Leadership (model SBI)', 'https://www.ccl.org/'],
      ),
    ],
  },

  // ───────────────────────────── 4. Interview Developer ─────────────────────────────
  {
    id: 'english-interview-developer',
    title: 'Interview Kerja Developer dalam English: Perkenalan, STAR & Menjelaskan Proyek',
    summary: 'Struktur "Tell me about yourself" (present–past–future), metode STAR dengan tiga contoh cerita lengkap, bahasa hasil kerja, menjelaskan peran di proyek, berpikir keras saat system design, saat tidak tahu jawaban, pertanyaan untuk interviewer, frasa gaji/notice period/remote, dan kesalahan tense yang umum.',
    track: TRACK, source: englishProSpeakingSource, duration: '1 jam', level: 'Hard',
    blocks: [
      paragraph('Kosakata interview sudah ada di [Interview Kerja](#english.interview-kerja-job-interview) dan [Wawancara Teknis](#english.wawancara-teknis-technical-interview). Materi ini fokus pada **cara menyusun jawaban lisan**: jawaban yang terstruktur, berdurasi tepat, menunjukkan peran Anda sendiri, dan memuat hasil terukur. Interviewer di perusahaan internasional jarang menilai aksen; mereka menilai apakah Anda bisa **menjelaskan pekerjaan teknis dengan jelas** kepada rekan kerja.'),
      paragraph('Siapkan jawaban sebagai **kerangka**, bukan naskah hafalan. Jawaban yang dihafal kata per kata terdengar seperti dibacakan dan mudah buyar bila pertanyaannya sedikit berbeda.'),

      heading('1. "Tell me about yourself": present → past → future'),
      table(['Bagian', 'Isi', 'Durasi'], [
        ['Present', 'Peran sekarang, fokus teknis, satu pencapaian.', '~30 detik'],
        ['Past', 'Bagaimana Anda sampai di sini; 1–2 pengalaman relevan.', '~30 detik'],
        ['Future', 'Kenapa posisi ini, apa yang ingin Anda kerjakan berikutnya.', '~20 detik'],
      ]),
      details('Contoh jawaban backend developer (~80 detik)', [
        paragraph("\"**Currently**, I'm a backend engineer at a fintech company in Jakarta, where I work mainly with Go and PostgreSQL. I'm part of the payments team, and over the last year I've been responsible for our transaction processing service, which handles about two million transactions a day. One thing I'm proud of is that I led the migration from a monolith endpoint to an event-driven flow, which cut our p99 latency by around 40%.\""),
        paragraph("\"**Before that**, I spent two years at a software agency building REST APIs in Laravel for clients in logistics and retail. That's where I learned to work directly with clients and to ship quickly, but I also saw how much technical debt you get without good testing, which is why I care a lot about test coverage and observability now.\""),
        paragraph("\"**Now** I'm looking for a role where I can work on distributed systems at a larger scale and with an international team. Your platform team's work on reliability really caught my attention, and I think my experience with payments and incident handling would be a good fit.\""),
      ]),
      callout('tip', 'Yang tidak perlu dimasukkan', 'Tanggal lahir, kota asal, status keluarga, hobi panjang, atau membacakan ulang seluruh CV. Mulailah dari peran sekarang, bukan dari "I was born in…" atau "I graduated in 2018 from…".'),

      heading('2. Metode STAR & bahasa hasil kerja'),
      paragraph('Pertanyaan perilaku ("Tell me about a time when…") dijawab dengan **STAR**: **S**ituation (konteks singkat), **T**ask (tanggung jawab Anda), **A**ction (apa yang *Anda* lakukan: bagian terpanjang), **R**esult (hasil, sebaiknya terukur, plus pelajaran). Gunakan **past simple** untuk seluruh cerita. Porsi yang baik: S+T ±20%, A ±60%, R ±20%; total 1,5–2 menit.'),
      phrases([
        ['reduced X by Y%', 'Menurunkan (latency, biaya, error).', 'I reduced the API response time by 40%.'],
        ['cut X from A to B', 'Memotong dari nilai A ke B.', 'We cut the build time from 20 minutes to 6.'],
        ['increased / improved X', 'Meningkatkan.', 'I improved test coverage from 35% to 80%.'],
        ['saved the team X hours a week', 'Hasil dalam waktu.', 'The script saved the team about five hours a week.'],
        ['resulted in / led to', 'Menghubungkan aksi dengan hasil.', 'The change led to zero payment-related incidents that quarter.'],
        ['What I learned from this was…', 'Refleksi; bagus untuk menutup cerita.', 'What I learned from this was to involve QA much earlier.'],
      ]),
      tabs(
        ['Konflik dengan rekan', [
          paragraph('**Q:** *Tell me about a time you disagreed with a teammate.*'),
          list([
            "**S:** In my last team, a senior colleague wanted to add Redis caching to fix a slow reporting endpoint, and the release was two weeks away.",
            "**T:** I was the owner of that endpoint, so it was my job to make sure the fix was correct and safe.",
            "**A:** I profiled the endpoint first and found that the real issue was an N+1 query, not the lack of a cache. Instead of arguing in the group chat, I set up a 20-minute call with him, showed him the profiling results, and suggested we fix the query first and only add caching if it was still slow. I also offered to pair on it so he could review the change.",
            "**R:** The query fix alone brought the response time from about 4 seconds to 300 milliseconds, so we didn't need the cache at all. He later asked me to present the profiling approach to the whole team. What I learned was that data makes disagreements much less personal.",
          ]),
        ]],
        ['Insiden produksi', [
          paragraph('**Q:** *Tell me about a time you handled a production incident.*'),
          list([
            "**S:** On a Friday evening, our checkout started returning 500 errors for around 15% of users, right after a marketing campaign went live.",
            "**T:** I was the on-call engineer, so I was responsible for mitigating the impact and coordinating the response.",
            "**A:** I opened an incident channel and posted updates every fifteen minutes. From the logs, I saw that the database connection pool was exhausted. As a quick mitigation, I increased the pool size and scaled the service from four to eight pods. Once errors dropped, I traced the root cause to a new endpoint that held connections open during an external API call. On Monday I wrote the post-mortem and moved that call outside the transaction.",
            "**R:** We were back to normal within 25 minutes, and the fix prevented the same issue during the next campaign, which had twice the traffic. We also added an alert on pool usage, so we now catch this before users do.",
          ]),
        ]],
        ['Deadline ketat', [
          paragraph('**Q:** *Tell me about a time you worked under a tight deadline.*'),
          list([
            "**S:** A regulator changed the reporting format, and we had three weeks to deliver a new export API that normally would have taken six.",
            "**T:** I was the only backend developer on the project, so I had to deliver the API and make sure the data was accurate.",
            "**A:** First, I split the requirements into must-have and nice-to-have and agreed on that list with the product manager in writing. I reused our existing query layer instead of building a new one, wrote contract tests against the regulator's sample files, and shared a working draft with the compliance team after the first week, so they could catch mistakes early.",
            "**R:** We delivered on time, and the first submission was accepted without corrections. The nice-to-have features shipped two weeks later. The key lesson for me was that agreeing on scope early is the best way to protect a deadline.",
          ]),
        ]],
      ),

      heading('3. Menjelaskan proyek & peran Anda'),
      paragraph('Kesalahan paling umum: semua kalimat memakai **we**. Interviewer ingin menilai *Anda*. Pakai **we** untuk konteks tim, **I** untuk kontribusi Anda. Struktur 4 langkah: **apa produknya → masalah teknisnya → peran Anda → hasilnya**.'),
      table(['Terlalu kabur', 'Lebih kuat'], [
        ['We made a payment system.', 'Our team built a payment service; **I was responsible for** the webhook processing and reconciliation jobs.'],
        ['We used microservices, Kafka, Redis.', '**I designed** the event schema in Kafka and **implemented** the idempotency layer so duplicate webhooks were ignored.'],
        ['We improved performance.', '**I identified** the slow queries with `EXPLAIN ANALYZE` and **added** two composite indexes, which cut the p95 from 1.2 seconds to 200 milliseconds.'],
        ['I helped with the deployment.', '**I set up** the CI pipeline in GitHub Actions and **wrote** the Helm charts for staging and production.'],
      ]),
      list([
        "*The project was…* / *The main challenge was…* / *My part was…* / *I owned…*",
        "*I worked closely with the mobile team to…* (kolaborasi, tetap jelas peran Anda)",
        "*Looking back, I'd do X differently because…* (menunjukkan refleksi, sangat disukai interviewer senior)",
      ]),

      heading('4. Berpikir keras di technical & system design interview'),
      paragraph('Dalam coding dan system design interview, diam selama 3 menit adalah sinyal buruk; interviewer ingin **mendengar proses berpikir Anda**. Struktur bicaranya: klarifikasi → asumsi → opsi & trade-off → keputusan → evaluasi ulang.'),
      phrases([
        ['Before I jump in, can I clarify the requirements?', 'Selalu mulai dengan klarifikasi.', 'Before I jump in, can I clarify a few requirements?'],
        ['Roughly how many users / requests per second are we expecting?', 'Menanyakan skala.', 'Roughly how many requests per second are we expecting at peak?'],
        ["I'm going to assume that…", 'Menyatakan asumsi secara eksplisit.', "I'm going to assume reads are much more frequent than writes."],
        ['Let me think out loud for a second.', 'Meminta waktu sambil tetap berbicara.', 'Let me think out loud for a second.'],
        ['One option would be… The upside is…, the downside is…', 'Kerangka trade-off.', 'One option would be a relational DB. The upside is strong consistency; the downside is harder horizontal scaling.'],
        ["Given that…, I'd lean towards…", 'Mengambil keputusan berdasar asumsi.', "Given that we need strong consistency for balances, I'd lean towards Postgres."],
        ['If this needed to scale further, we could…', 'Menunjukkan Anda memikirkan pertumbuhan.', 'If this needed to scale further, we could shard by user ID.'],
        ['Let me sanity-check that.', 'Mengecek ulang hitungan atau logika.', 'Let me sanity-check that: a hundred million rows times one kilobyte is about a hundred gigabytes.'],
        ['Does that sound reasonable, or would you like me to go deeper into…?', 'Melibatkan interviewer.', 'Does that sound reasonable, or would you like me to go deeper into the caching layer?'],
      ]),

      heading('5. Saat tidak tahu jawabannya'),
      list([
        "**Jujur + tunjukkan cara berpikir**: *I haven't worked with Cassandra directly, but here's how I'd approach it based on what I know about wide-column stores…*",
        "**Hubungkan ke yang Anda tahu**: *I'm not familiar with that tool, but it sounds similar to Sidekiq, which I've used for background jobs.*",
        "**Tebakan terukur**: *I'm not 100% sure, but my guess would be that it's a locking issue. Am I on the right track?*",
        "**Lupa sintaks**: *I don't remember the exact syntax, but conceptually I'd use a window function here.*",
        '**Jangan**: mengarang dengan yakin, diam lama, atau berkata *I don\'t know* lalu berhenti.',
      ]),

      heading('6. Pertanyaan untuk interviewer & frasa gaji, notice period, remote'),
      sub('Pertanyaan yang menunjukkan minat (pilih 2–3)'),
      list([
        '*What does success look like in the first 90 days for this role?*',
        "*What's the biggest technical challenge the team is facing right now?*",
        '*How does the team handle on-call and incidents?*',
        "*What's the code review and deployment process like?*",
        '*How are architecture decisions made — is there an RFC process?*',
        '*How does the team collaborate across time zones?*',
      ]),
      sub('Gaji, notice period & remote'),
      phrases([
        ["I'd like to learn more about the role before discussing numbers.", 'Menunda pembahasan gaji di tahap awal.', "If that's okay, I'd like to learn more about the role before discussing numbers."],
        ["I'm looking for something in the range of X to Y.", 'Menyebut rentang, bukan satu angka.', "Based on my research, I'm looking for something in the range of 60 to 70 thousand US dollars a year."],
        ['Is that gross or net? / Is that per year or per month?', 'Memastikan basis angka.', 'Just to clarify, is that figure gross, per year?'],
        ['depending on the overall package', 'Membuka ruang untuk benefit, equity, dll.', "That's flexible, depending on the overall package."],
        ['My notice period is one month.', 'Masa pemberitahuan resign (umum di Indonesia: 30 hari).', 'My notice period is one month, so I could start in early January.'],
        ["I'm based in Jakarta, GMT+7.", 'Menyatakan zona waktu (WIB = UTC+7).', "I'm based in Jakarta, GMT+7, and I'm happy to overlap four hours with CET."],
        ['Would this be a full-time employee role or a contractor role?', 'Status kerja untuk remote internasional.', 'Would this be a full-time employee role, or a contractor role through an employer of record?'],
      ]),
      paragraph('Lanjutan teknik tawar-menawar ada di [Negosiasi](#english.negosiasi-negotiation).'),

      heading('7. Kesalahan grammar yang sering muncul di interview'),
      table(['Salah', 'Benar', 'Alasan'], [
        ['I work with Go since 2021.', "I've worked / I've been working with Go since 2021.", 'Sejak masa lalu sampai sekarang: present perfect (continuous).'],
        ['I have worked at Tokopedia from 2019 to 2021.', 'I worked at Tokopedia from 2019 to 2021.', 'Periode yang sudah selesai: past simple.'],
        ['I am working here for three years.', "I've been working here for three years.", '*For + durasi* yang masih berlangsung: present perfect continuous.'],
        ['I have 5 years experience.', 'I have five years of experience. / five years\' experience', 'Perlu *of* atau apostrof posesif.'],
        ['I was graduated from ITB.', 'I graduated from ITB in 2019.', '*Graduate* adalah verb aktif.'],
        ['I am responsible to maintain the API.', 'I was / am responsible for maintaining the API.', '*Responsible for + -ing/noun*.'],
        ['My weakness is perfectionist.', 'I tend to be a perfectionist. / My weakness is perfectionism.', 'Perfectionist = orang; perfectionism = sifat.'],
        ['In my last project, I make the API and he test it.', 'In my last project, I built the API and he tested it.', 'Cerita STAR: konsisten past simple.'],
        ['I want to find a job that can make me grow.', "I'm looking for a role where I can grow.", 'Lebih natural dan positif.'],
      ]),
      paragraph('Ringkasan aturan: **pengalaman yang masih berlanjut** → present perfect (*I have worked with Go for three years*); **kejadian/periode yang selesai** → past simple (*I worked at X from 2019 to 2021*); **cerita STAR** → past simple dari awal sampai akhir.'),

      callout('warn', 'Kesalahan khas kandidat Indonesia', '(1) Terlalu rendah hati: "I only help a little", "I am just a junior" mengecilkan kontribusi; sebut saja apa yang Anda lakukan. (2) "We" di setiap kalimat sehingga peran Anda tidak terlihat. (3) Jawaban tanpa angka hasil. (4) Menjawab "Do you have any questions?" dengan "No, it\'s clear". Selalu siapkan 2–3 pertanyaan. (5) Langsung menyebut satu angka gaji terlalu rendah karena tidak riset pasar. (6) Bercampur tense dalam satu cerita (I make… then I fixed… and it works). (7) Minta maaf atas bahasa Inggris di awal interview.'),

      ...practice('english-interview-developer', [
        "Rekam jawaban 'Tell me about yourself' maksimal 90 detik dengan struktur present–past–future; harus ada minimal satu angka hasil dan alasan spesifik melamar posisi tersebut.",
        'Tulis tiga cerita STAR dari pengalaman nyata Anda (konflik, insiden/bug serius, deadline ketat); setiap cerita 1,5–2 menit saat diucapkan, Action ±60%, seluruhnya dalam past simple, dan Result berisi angka atau dampak konkret.',
        'Jelaskan satu proyek dalam 2 menit dengan struktur produk → masalah teknis → peran Anda → hasil; hitung rasio "I" vs "we" (minimal setengah kalimat kontribusi memakai "I").',
        'Simulasikan system design 15 menit (misalnya URL shortener): rekam dan pastikan Anda memulai dengan klarifikasi requirement, menyatakan minimal dua asumsi, dan membandingkan dua opsi dengan pola "One option would be…, the downside is…".',
        'Siapkan dan ucapkan jawaban untuk ekspektasi gaji (rentang), notice period, dan zona waktu/overlap jam kerja, ditambah tiga pertanyaan untuk interviewer.',
        'Perbaiki tense di catatan interview Anda: tandai setiap kalimat pengalaman sebagai past simple atau present perfect dan cek dengan tabel kesalahan umum.',
      ]),
      ...quiz([
        ['ENT-16', 'Apa struktur yang disarankan untuk "Tell me about yourself" dan berapa lama durasinya?', 'Present (peran sekarang + satu pencapaian) → Past (pengalaman relevan sebelumnya) → Future (kenapa posisi ini). Durasi sekitar 60–90 detik. Hindari mulai dari tempat lahir atau membacakan seluruh CV.'],
        ['ENT-17', 'Dalam STAR, bagian mana yang paling panjang dan mengapa?', 'Action, sekitar 60% jawaban, karena interviewer menilai apa yang Anda lakukan, bagaimana Anda berpikir, dan cara Anda bekerja sama. Situation dan Task cukup singkat sebagai konteks; Result menutup dengan hasil terukur dan pelajaran.'],
        ['ENT-18', 'Pilih yang benar: "I have worked at Gojek from 2020 to 2022" atau "I worked at Gojek from 2020 to 2022"? Lalu bagaimana menyatakan pengalaman Go yang masih berlangsung?', '"I worked at Gojek from 2020 to 2022" karena periodenya sudah selesai dan disebut jelas (past simple). Untuk yang masih berlangsung: "I have worked with Go for three years" atau "I\'ve been working with Go since 2023" (present perfect).'],
        ['ENT-19', 'Interviewer bertanya tentang teknologi yang belum pernah Anda pakai. Bagaimana menjawabnya?', 'Jujur, lalu tunjukkan cara berpikir: "I haven\'t used it directly, but from what I know it\'s similar to X, which I\'ve used for Y. Here\'s how I\'d approach it…" Boleh ditutup dengan "Am I on the right track?" Jangan mengarang dengan yakin atau berhenti di "I don\'t know".'],
        ['ENT-20', 'Ubah agar peran Anda terlihat: "We built a notification service using Kafka and it became faster."', 'Contoh: "Our team built a notification service. I designed the Kafka consumer and implemented batching, which reduced delivery time from about 5 seconds to under 1 second." Kontribusi memakai "I" + verb spesifik (designed, implemented) + hasil terukur.'],
      ]),
      heading('Referensi'),
      references(
        ['The Muse — The STAR Interview Method', 'https://www.themuse.com/advice/star-interview-method'],
        ['British Council LearnEnglish — Business English', 'https://learnenglish.britishcouncil.org/business-english'],
        ['Cambridge Dictionary Grammar — Present perfect', 'https://dictionary.cambridge.org/grammar/british-grammar/present-perfect-simple-i-have-worked'],
        ['Cambridge Dictionary — notice period', 'https://dictionary.cambridge.org/dictionary/english/notice-period'],
        ['Cambridge Dictionary — trade-off', 'https://dictionary.cambridge.org/dictionary/english/trade-off'],
      ),
    ],
  },
];
