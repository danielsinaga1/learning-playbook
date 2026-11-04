import type { Block, Module, Track } from '../types';
import { callout, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const MID = 'Grammar Menengah';

export const englishGrammarMidTracks: Track[] = [
  { title: MID, summary: 'Jembatan antara grammar dasar/16 tenses dan grammar TOEFL: modal verbs, modal perfect untuk post-mortem, used to/wish/causative, serta linking words agar tulisan kerja dan esai mengalir.' },
];

export const englishGrammarMidSource = 'English Grammar Menengah: materi tulisan tangan dari Cambridge Grammar, British Council LearnEnglish, dan Purdue OWL (4 November 2026)';

const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });

export const englishGrammarMidModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── 1. Modal Verbs ─────────────────────────────
  {
    id: 'english-modal-verbs',
    title: 'Modal Verbs: Ability, Permission, Obligation, Advice & Possibility',
    summary: "can/could/be able to, may/might, must vs have to, mustn't vs don't have to, should/had better, request & offer yang sopan, serta deduksi masa kini.",
    track: MID, source: englishGrammarMidSource, duration: '50 menit', level: 'Med',
    blocks: [
      paragraph('**Modal verbs** (can, could, may, might, must, shall, should, will, would, ought to) adalah auxiliary yang menambahkan *sikap* penutur pada kata kerja utama: mampu, boleh, wajib, sebaiknya, atau mungkin. Dalam bahasa Indonesia sikap ini sering cukup diwakili satu kata seperti "harus" atau "bisa", padahal bahasa Inggris membedakannya dengan tajam. "Tidak harus" dan "tidak boleh", misalnya, memakai bentuk yang sama sekali berbeda.'),
      paragraph("Bagi developer, modal muncul di mana-mana: aturan di README (*Secrets must not be committed*), permintaan review (*Could you take a look?*), hingga dugaan saat debugging (*It might be a race condition*). Kalau tenses masih goyah, ulangi dulu [Kelompok Present](#english.kelompok-present) dan [Kelompok Future](#english.kelompok-future)."),

      heading('Aturan bentuk: modal + V1, tanpa -s, tanpa to'),
      table(['Aturan', '✗ Salah', '✓ Benar'], [
        ['Modal diikuti **V1 (bare infinitive)**', 'She can deploys it.', 'She **can deploy** it.'],
        ['Tidak ada **-s** untuk he/she/it', 'He musts sign the NDA.', 'He **must** sign the NDA.'],
        ['Tidak ada **to** sesudah modal (kecuali *ought to*)', 'You must to restart the pod.', 'You **must restart** the pod.'],
        ['Negatif cukup tambah **not**', "I don't can access the VPN.", "I **can't** (cannot) access the VPN."],
        ['Pertanyaan: modal pindah ke depan', 'Do you can review this?', '**Can you** review this?'],
        ['**Tidak boleh dua modal** berurutan', 'I will can finish it tomorrow.', 'I **will be able to** finish it tomorrow.'],
        ['Modal + passive: **modal + be + V3**', 'The migration must deployed first.', 'The migration **must be deployed** first.'],
        ['Modal + progressive: **modal + be + V-ing**', 'He might debugging now.', 'He **might be debugging** now.'],
      ]),
      paragraph('**Semi-modal** seperti *have to*, *need to*, dan *be able to* berperilaku seperti kata kerja biasa: berubah bentuk (*she has to*, *we had to*), memakai do dalam pertanyaan (*Does she have to…?*), dan bisa ditaruh setelah modal (*You might have to*, *We will be able to*). Karena itu semi-modal adalah jalan keluar untuk larangan "double modal".'),

      heading('Ability: can, could, be able to'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['can + V1', 'Kemampuan sekarang', 'I **can** read Go, but I **can\'t** write it fluently yet.'],
        ['could + V1', 'Kemampuan umum di masa lalu', 'I **could** code in Pascal when I was fifteen.'],
        ['was/were able to, managed to', 'Berhasil melakukan **satu kali** di masa lalu', 'We **were able to** restore the backup in twenty minutes.'],
        ["couldn't + V1", 'Gagal/tidak mampu di masa lalu (umum atau satu kali)', "We **couldn't** reproduce the bug locally."],
        ['will be able to', 'Kemampuan di masa depan', 'You **will be able to** deploy once you get access.'],
        ['have/has been able to', 'Kemampuan sejak dulu sampai sekarang', "We **haven't been able to** connect since the upgrade."],
      ]),
      callout('info', 'could vs was able to', 'Untuk keberhasilan pada satu kejadian spesifik di kalimat positif, gunakan *was able to* atau *managed to*: ✗ *Yesterday we could fix the outage* → ✓ *Yesterday we were able to fix the outage*. Bentuk negatif *couldn\'t* boleh untuk keduanya, dan *could* tetap wajar dengan kata kerja indra: *I could see the error in the logs.*'),

      heading('Permission, request & offer: tangga kesopanan'),
      paragraph("Untuk izin: *can* (santai), *could* (lebih sopan), *may* (formal, misalnya di rapat atau dengan klien). Memberi izin: *You can use the staging server.* Melarang: *You can't push directly to main.* Untuk meminta bantuan, makin panjang dan makin tidak langsung kalimatnya, makin sopan."),
      table(['Tingkat', 'Pola', 'Contoh di kantor', 'Cocok untuk'], [
        ['1 · santai', 'Can you + V1?', 'Can you check the logs?', 'Rekan satu tim, chat cepat'],
        ['2 · sopan netral', 'Could you + V1?', 'Could you review my PR today?', 'Pilihan aman untuk hampir semua orang'],
        ['3 · lebih sopan', 'Would you be able to + V1?', 'Would you be able to join the call at 3?', 'Atasan, tim lain, klien'],
        ['4 · sangat sopan', 'Would you mind + V-ing?', 'Would you mind sharing your screen?', 'Permintaan yang merepotkan'],
        ['5 · paling halus', 'I was wondering if you could + V1', 'I was wondering if you could extend the deadline.', 'Permintaan besar, negosiasi'],
      ]),
      list([
        "**Would you mind + V-ing** (bukan to V1). Jawaban \"ya, silakan\" justru *No, not at all* atau *Sure*; secara harfiah artinya \"saya tidak keberatan\".",
        '**Would you mind if I + past simple** untuk minta izin: *Would you mind if I shared my screen?*',
        "**Offer**: *Shall I open a ticket?* (British), *Should I…?* atau *Do you want me to…?* (American), *Would you like me to…?* (sopan di keduanya). Janji spontan memakai will: *I'll take care of it.*",
        "**Suggestion**: *Shall we start?* masih umum di kedua varian. *Will you…?* sebagai permintaan terdengar seperti perintah; hindari kepada atasan.",
      ]),

      heading("Obligation: must, have to, mustn't, don't have to"),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['must + V1', 'Kewajiban kuat, sering dari penutur sendiri atau aturan tertulis', 'All endpoints **must** require authentication.'],
        ['have to / have got to + V1', 'Kewajiban dari luar: aturan, kebijakan, keadaan', 'We **have to** follow the client\'s security policy.'],
        ['had to + V1', 'Kewajiban di masa lalu (*must* tidak punya bentuk past)', 'I **had to** rewrite the whole module.'],
        ["**mustn't** + V1", '**Dilarang**', "You **mustn't** commit API keys to the repo."],
        ["**don't have to** + V1", '**Tidak perlu** (boleh, tapi tidak wajib)', "You **don't have to** attend the retro if you're on call."],
        ["needn't / don't need to + V1", 'Tidak perlu (needn\'t lebih British)', "You **needn't** / **don't need to** update the docs for this fix."],
      ]),
      paragraph("Dalam British English, *must* sering terasa kewajiban dari penutur (*I must finish this tonight*), sedangkan *have to* dari aturan luar. Dalam percakapan American English, *have to* jauh lebih umum untuk keduanya, sementara *must* banyak dipakai di aturan tertulis dan spesifikasi. Itulah sebabnya dokumen RFC memakai MUST dan MUST NOT."),

      heading('Advice: should, ought to, had better'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['should / shouldn\'t + V1', 'Saran, rekomendasi, apa yang benar', 'You **should** add a test for the edge case.'],
        ['ought to / ought not to + V1', 'Sama dengan should, sedikit lebih formal dan jarang', 'We **ought to** document this behaviour.'],
        ["had better ('d better) + V1", 'Saran kuat **dengan ancaman akibat**; tentang sekarang/masa depan', "We**'d better** roll back before customers notice."],
        ["had better not + V1", 'Peringatan keras', "You**'d better not** run that script on production."],
      ]),
      paragraph("Meski ada *had*, *had better* tidak bermakna lampau dan tidak memakai to: ✗ *You had better to check* → ✓ *You'd better check*. Karena nadanya mengancam, jangan memakainya kepada atasan; pilih *It might be worth checking…*."),

      heading('Possibility & deduction tentang masa kini'),
      paragraph('Modal juga dipakai untuk menebak berdasarkan bukti. Bayangkan ini sebagai skala keyakinan saat membaca dashboard monitoring.'),
      table(['Keyakinan', 'Bentuk', 'Contoh'], [
        ['± 95% ya', 'must be / must + V1', 'The service **must be** down; every health check is failing.'],
        ['diharapkan', 'should be', 'The build **should be** done by now; it usually takes five minutes.'],
        ['± 50%', 'may / might / could be', 'The bug **might be** in the cache layer. It **could be** a race condition.'],
        ['± 50% tidak', "may not / might not be", "The config **might not be** loaded yet."],
        ['± 95% tidak', "can't be / couldn't be", "It **can't be** a DNS issue; we're connecting by IP address."],
        ['sedang berlangsung', 'must/might be + V-ing', 'She **must be working** from home; her status says remote.'],
      ]),
      paragraph("Lawan dari *must be* untuk deduksi adalah **can't be**, bukan *mustn't be* (yang berarti larangan). American English juga menerima *must not* untuk deduksi negatif (*He must not be online*), tapi *can't* aman di kedua varian. *Could not* (mustahil) berbeda jauh dengan *might not* (mungkin tidak)."),

      callout('warn', 'Kesalahan khas pelajar Indonesia', "✗ *You mustn't come to the meeting* (maksudnya \"tidak harus\") → ✓ *You don't have to come to the meeting.*\n✗ *I must to go now* → ✓ *I must go now* / *I have to go now.*\n✗ *He cans speak Japanese* → ✓ *He can speak Japanese.*\n✗ *I will can join later* → ✓ *I will be able to join later.*\n✗ *May be the cache is stale* → ✓ *Maybe the cache is stale* (adverb) / *The cache may be stale* (modal + be).\n✗ *You must review my PR* (kepada senior, terdengar memerintah) → ✓ *Could you review my PR when you have a moment?*"),

      ...practice('english-modal-verbs', [
        'Tulis 5 aturan tim (coding standard) memakai must, mustn\'t, have to, dan don\'t have to; pastikan maknanya berbeda dan benar.',
        'Ubah tiga perintah langsung (*Fix the test*, *Send me the logs*, *Join the call*) menjadi permintaan tingkat 2, 3, dan 4 dari tabel kesopanan.',
        'Saat debugging berikutnya, tulis tiga dugaan di catatan memakai must be, might be, dan can\'t be, lengkap dengan buktinya.',
        'Ubah tiga kalimat aktif di dokumentasi menjadi modal + passive, misalnya *You must rotate the keys* → *The keys must be rotated*.',
        'Cari satu kalimat lama di chat kerja yang memakai double modal atau must to, lalu perbaiki.',
      ]),
      ...quiz([
        ['ENM-01', "Pilih: You (mustn't / don't have to) deploy on Friday; it's optional, but the team prefers Monday.", "**don't have to**. Kalimatnya menyatakan tidak ada kewajiban (opsional). *Mustn't* berarti dilarang dan bertentangan dengan \"it's optional\"."],
        ['ENM-02', 'Perbaiki: I will can join the call at 3.', 'I **will be able to** join the call at 3. Dua modal (will + can) tidak boleh berurutan; ganti can dengan semi-modal *be able to*.'],
        ['ENM-03', 'Lengkapi deduksi: The CI badge is green, so the tests ___ passing.', '**must be** passing. Ada bukti kuat (badge hijau), jadi keyakinannya tinggi. Bentuk progresif *must be + V-ing* karena tesnya dibicarakan sebagai keadaan yang sedang berlaku.'],
        ['ENM-04', 'Ubah menjadi permintaan sopan kepada tech lead: "Review my PR."', "Contoh: *Could you review my PR when you have a moment?* atau *Would you mind reviewing my PR today?* Perhatikan *would you mind* diikuti V-ing."],
        ['ENM-05', 'Apa yang janggal pada: Yesterday we could fix the outage in ten minutes.', "Untuk keberhasilan pada satu kejadian spesifik di masa lalu, gunakan *was/were able to* atau *managed to*: **Yesterday we were able to fix the outage in ten minutes.** *Could* positif dipakai untuk kemampuan umum di masa lalu."],
        ['ENM-06', 'Ubah ke passive: Someone must rotate the API keys every 90 days.', '**The API keys must be rotated every 90 days.** Rumusnya modal + be + V3; pelaku (*someone*) tidak perlu disebut.'],
      ]),
      heading('Referensi'),
      references(
        ['British Council LearnEnglish: Modal verbs', 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/modal-verbs'],
        ['British Council LearnEnglish: Modals: deductions about the present', 'https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-present'],
        ['Cambridge Grammar: Must', 'https://dictionary.cambridge.org/grammar/british-grammar/must'],
        ['Cambridge Grammar: Have to', 'https://dictionary.cambridge.org/grammar/british-grammar/have-to'],
        ['Cambridge Grammar: Could', 'https://dictionary.cambridge.org/grammar/british-grammar/could'],
        ['Cambridge Grammar: Had better', 'https://dictionary.cambridge.org/grammar/british-grammar/had-better'],
        ['Cambridge Grammar: Shall', 'https://dictionary.cambridge.org/grammar/british-grammar/shall'],
      ),
    ],
  },

  // ───────────────────────────── 2. Modal Perfect ─────────────────────────────
  {
    id: 'english-modal-perfect',
    title: "Modal Perfect: should have, must have, could have, might have, needn't have",
    summary: "Modal + have + V3 untuk menebak masa lalu, menyesal dan mengkritik, kemungkinan yang tidak terjadi, needn't have vs didn't need to, dan bahasa post-mortem.",
    track: MID, source: englishGrammarMidSource, duration: '50 menit', level: 'Hard',
    blocks: [
      paragraph("Modal biasa membicarakan sekarang atau masa depan. Untuk membicarakan **masa lalu**, bahasa Inggris memakai **modal + have + V3**: *must have expired*, *should have added*, *could have prevented*. Bentuk ini penting untuk developer karena hampir setiap incident review berisi tiga hal: dugaan penyebab (*The cache must have expired*), pelajaran (*We should have added a timeout*), dan dampak yang nyaris terjadi (*It could have taken down checkout*)."),
      paragraph('Pastikan dulu Anda nyaman dengan V3 (past participle) di [Kelompok Past](#english.kelompok-past) dan modal dasar di [Modal Verbs](#english.english-modal-verbs).'),

      heading('Rumus & pengucapan'),
      table(['Pola', 'Rumus', 'Contoh'], [
        ['Positif', 'modal + have + V3', 'The job **must have failed** at midnight.'],
        ['Negatif', 'modal + not + have + V3', "We **shouldn't have merged** it on Friday."],
        ['Passive', 'modal + have been + V3', 'The alert **should have been triggered**.'],
        ['Progressive', 'modal + have been + V-ing', 'The worker **might have been retrying** the whole time.'],
      ]),
      table(['Tulisan', 'Bentuk singkat', 'Ucapan'], [
        ['should have', "should've", '/ˈʃʊdəv/'],
        ['could have', "could've", '/ˈkʊdəv/'],
        ['would have', "would've", '/ˈwʊdəv/'],
        ['must have', "must've", '/ˈmʌstəv/'],
        ['might have', "might've", '/ˈmaɪtəv/'],
        ["shouldn't have", "shouldn't've (lisan saja)", '/ˈʃʊdntəv/'],
      ]),
      callout('warn', 'Jangan pernah menulis "should of"', "Karena *'ve* diucapkan lemah /əv/, penutur asli pun sering salah menulis *should of*, *could of*, *would of*. Ini salah ejaan, bukan variasi: ✗ *We should of added a timeout* → ✓ *We should have added a timeout* / *We should've added a timeout*. Di dokumen formal (post-mortem, esai), tulis lengkap *should have*."),

      heading('Deduksi tentang masa lalu: must / might / can\'t have'),
      table(['Keyakinan', 'Bentuk', 'Contoh dari incident'], [
        ['± 95% ya', 'must have + V3', 'The cache **must have expired**; the hit rate dropped to zero at 02:00.'],
        ['± 50%', 'might / may / could have + V3', 'The job **might have failed** because of a network timeout.'],
        ['± 50% tidak', "might not / may not have + V3", "The config **may not have been reloaded** after the change."],
        ['± 95% tidak', "can't / couldn't have + V3", "It **can't have been** the deploy; nothing was released that day."],
      ]),
      paragraph("*May have* sedikit lebih formal dari *might have*. Seperti di masa kini, lawan *must have* adalah **can't have / couldn't have**; *mustn't have* tidak dipakai untuk deduksi dalam British English (American English menerima *must not have*)."),

      heading('Penyesalan & kritik: should have / shouldn\'t have'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['should have + V3', 'Seharusnya dilakukan, **tapi tidak**', 'We **should have added** a timeout to the HTTP client.'],
        ["shouldn't have + V3", 'Seharusnya tidak dilakukan, **tapi dilakukan**', "I **shouldn't have run** the migration without a backup."],
        ['ought to have + V3', 'Sama dengan should have, lebih formal', 'The team **ought to have been** notified earlier.'],
      ]),
      callout('tip', 'Nada blameless di post-mortem', "*You should have tested it* terdengar menyalahkan orang. Budaya post-mortem yang sehat fokus pada sistem: gunakan **we**, subjek benda, atau *could have*.\n✗ *You should have tested it before merging.*\n✓ *We should have had an integration test for this path.*\n✓ *A canary deployment could have caught this earlier.*"),

      heading('Kemungkinan yang tidak terjadi: could have / might have'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['could have + V3', 'Sebenarnya mungkin/mampu, **tapi tidak terjadi**', 'The outage **could have lasted** hours if on-call had not noticed it.'],
        ['could have + V3 (teguran halus)', 'Ada pilihan lain yang tidak diambil', "You **could have asked** me; I was online."],
        ['might have + V3', 'Akibat buruk yang nyaris terjadi', 'We **might have lost** customer data.'],
        ["couldn't have + V3", 'Mustahil, atau pujian', "We **couldn't have shipped** on time without your help."],
      ]),
      paragraph("Bedakan dengan *could* biasa: ✗ *I could help you yesterday* (maksudnya \"sebenarnya bisa tapi tidak\") → ✓ *I could have helped you yesterday, but you didn't ask.*"),

      heading("needn't have vs didn't need to"),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ["needn't have + V3", 'Sudah **dilakukan**, tapi ternyata tidak perlu (sia-sia)', "I **needn't have restarted** the server; the issue was in the client."],
        ["didn't need to + V1", 'Tidak perlu, dan **biasanya tidak dilakukan**', "I **didn't need to restart** the server, so I just cleared the cache."],
        ["didn't have to + V1", 'Sama dengan didn\'t need to; umum di American English', "We **didn't have to** page anyone; the auto-scaler handled it."],
      ]),
      paragraph("*Needn't have* terasa British. Dalam American English, makna \"sudah dilakukan tapi sia-sia\" biasanya ditulis eksplisit: *I didn't need to restart the server after all* atau *It turned out I didn't have to restart it.*"),

      heading('would have & conditional tipe 3'),
      paragraph("*Would have + V3* menyatakan hasil yang dibayangkan di masa lalu dan sering berpasangan dengan *if + past perfect* (third conditional): If we had set up an alert, we **would have detected** the memory leak earlier. Juga untuk niat yang batal: *I would have joined the call, but I was on another incident.* Pembahasan lengkap ada di [Conditionals & Subjunctive](#english.conditionals-subjunctive-reduced-relative-clause)."),
      table(['Kalimat post-mortem', 'Fungsi'], [
        ['The certificate **must have expired** at 00:00 UTC.', 'Dugaan penyebab berdasarkan bukti'],
        ['The retry storm **may have amplified** the load.', 'Faktor yang mungkin berkontribusi'],
        ["It **can't have been** a database issue; the replicas were healthy.", 'Menyingkirkan hipotesis'],
        ['We **should have added** a circuit breaker.', 'Pelajaran / action item'],
        ['A staged rollout **could have limited** the blast radius.', 'Alternatif tanpa menyalahkan'],
        ['If the alert had fired, we **would have responded** within minutes.', 'Analisis kontrafaktual'],
      ]),

      callout('warn', 'Kesalahan khas pelajar Indonesia', "✗ *The cache must have expire* → ✓ *The cache must have expired* (wajib V3).\n✗ *He must went home* → ✓ *He must have gone home.*\n✗ *We should had checked* → ✓ *We should have checked* (have selalu bentuk dasar setelah modal).\n✗ *It mustn't have been the deploy* (deduksi) → ✓ *It can't have been the deploy.*\n✗ *You should have to fix it now* (saran untuk sekarang) → ✓ *You should fix it now.* Modal perfect hanya untuk masa lalu."),

      ...practice('english-modal-perfect', [
        'Ambil satu insiden nyata (atau bug yang pernah Anda alami) dan tulis 6 kalimat post-mortem, satu untuk setiap baris tabel post-mortem.',
        'Ucapkan keras-keras should\'ve, could\'ve, must\'ve, dan shouldn\'t have masing-masing lima kali, lalu rekam dan bandingkan dengan audio kamus Cambridge.',
        'Tulis ulang tiga kalimat yang menyalahkan orang (*You should have…*) menjadi versi blameless.',
        'Buat dua pasangan kalimat needn\'t have vs didn\'t need to tentang pekerjaan minggu ini.',
        'Gabungkan if + past perfect dengan would have untuk tiga kejadian yang Anda sesali di proyek.',
      ]),
      ...quiz([
        ['ENM-07', 'Lengkapi: The deploy failed at 02:10, and the logs say "disk full". The disk ___ (fill up) before the job started.', "**must have filled up**. Bukti log kuat, jadi deduksi masa lalu dengan keyakinan tinggi memakai *must have + V3*."],
        ['ENM-08', 'Perbaiki: We should of added rate limiting.', "**We should have added rate limiting** (atau *should've*). *Should of* adalah salah ejaan karena *'ve* terdengar seperti \"of\"."],
        ['ENM-09', "Apa beda: (a) I needn't have written the migration. (b) I didn't need to write the migration.", "(a) Migrasinya **sudah ditulis**, tapi ternyata sia-sia. (b) Migrasi tidak diperlukan, dan biasanya berarti **tidak ditulis**. Bentuk (a) lebih British; di American English sering ditulis *It turned out I didn't need to write it*."],
        ['ENM-10', 'Tulis ulang secara blameless: You should have tested it before merging.', "Contoh: *We should have had a test covering this path before merge.* atau *An integration test could have caught this.* Fokus pada sistem dan proses, bukan individu."],
        ['ENM-11', 'Lengkapi: It ___ a DNS issue; the service was reachable by hostname the whole time.', "**can't have been** (atau *couldn't have been*). Buktinya menyingkirkan kemungkinan itu. Jangan *mustn't have been*."],
        ['ENM-12', 'Lengkapi: If the alert had fired, we ___ (respond) much faster.', "**would have responded**. Third conditional: if + past perfect, would have + V3, untuk masa lalu yang tidak terjadi."],
      ]),
      heading('Referensi'),
      references(
        ['British Council LearnEnglish: Modals: deductions about the past', 'https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past'],
        ["British Council LearnEnglish: Modals with 'have'", 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/modals-have'],
        ['Cambridge Grammar: Should', 'https://dictionary.cambridge.org/grammar/british-grammar/should'],
        ['Cambridge Grammar: Need', 'https://dictionary.cambridge.org/grammar/british-grammar/need'],
        ['Cambridge Grammar: Might', 'https://dictionary.cambridge.org/grammar/british-grammar/might'],
        ['Cambridge Grammar: Would', 'https://dictionary.cambridge.org/grammar/british-grammar/would'],
      ),
    ],
  },

  // ───────────────────────────── 3. Used to, Wish, Would Rather & Causative ─────────────────────────────
  {
    id: 'english-used-to-wish-causative',
    title: 'Used to, Be/Get Used to, Wish, Would Rather & Causative',
    summary: 'Kebiasaan lampau (used to vs would), terbiasa (be/get used to), wish & if only, would rather, had better, serta have/get something done dan make/let/have/get someone do.',
    track: MID, source: englishGrammarMidSource, duration: '50 menit', level: 'Med',
    blocks: [
      paragraph("Modul ini mengumpulkan pola-pola yang **bentuknya mirip tapi maknanya jauh berbeda**: *I used to work* (dulu biasa, sekarang tidak) vs *I'm used to working* (sudah terbiasa), *I wish I knew* (sekarang) vs *I wish I had known* (dulu), *I cut my hair* (sendiri) vs *I had my hair cut* (dipotongkan orang). Kuncinya ada pada kata kerja sesudahnya: V1, V-ing, past simple, atau V3."),
      paragraph('Pola wish dan would rather memakai bentuk past untuk situasi yang tidak nyata. Logikanya sama dengan conditional, jadi bacalah bersama [Conditionals & Subjunctive](#english.conditionals-subjunctive-reduced-relative-clause).'),

      heading('used to + V1 vs would: kebiasaan di masa lalu'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['used to + V1', 'Kebiasaan **atau keadaan** lampau yang sekarang tidak lagi', 'I **used to work** at a bank before I became a developer.'],
        ["didn't use to + V1", 'Negatif', "We **didn't use to** have code reviews."],
        ['Did … use to + V1?', 'Pertanyaan', '**Did** you **use to** write PHP?'],
        ['would + V1', 'Tindakan berulang di masa lalu, **bukan keadaan**', 'As a junior, I **would stay** late every Friday to fix bugs.'],
        ['past simple', 'Bisa untuk keduanya bila waktunya jelas', 'I **worked** at a bank for three years.'],
      ]),
      list([
        "**would** hanya untuk aksi berulang: ✗ *I would have a ThinkPad* (have = keadaan/kepemilikan) → ✓ *I used to have a ThinkPad.* Kata kerja keadaan seperti be, have, know, like, live tidak memakai would untuk kebiasaan.",
        "Setelah did, ejaannya **use** tanpa -d: *didn't use to*, *Did you use to…?* Bentuk *didn't used to* sering terlihat di internet, tapi hindari di tulisan formal. British formal juga punya *used not to*.",
        "*Used to* diucapkan /ˈjuːstə/ dengan bunyi /s/, bukan /z/ seperti kata kerja *use*.",
      ]),

      heading('be used to / get used to + V-ing atau noun'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ['be used to + noun / V-ing', '**Sudah terbiasa** (keadaan)', "I**'m used to working** with legacy code."],
        ['get used to + noun / V-ing', '**Menjadi terbiasa** (proses)', "I**'m getting used to** the new on-call schedule."],
        ['will get used to', 'Akan terbiasa', "Don't worry, you**'ll get used to** Vim."],
        ['be accustomed to + V-ing', 'Sinonim formal be used to', 'The team **is accustomed to deploying** daily.'],
      ]),
      paragraph("Di sini *to* adalah **preposition**, bukan bagian infinitive, sehingga sesudahnya harus noun atau V-ing. Bandingkan: I used to **write** tests after coding (dulu begitu, sekarang tidak) vs I'm used to **writing** tests first (sekarang sudah biasa TDD)."),

      heading('wish & if only: berandai-andai'),
      table(['Waktu yang disesali', 'Rumus', 'Contoh'], [
        ['Sekarang', 'wish + past simple', 'I **wish** I **knew** Rust. I wish we **had** more tests.'],
        ['Sekarang (be)', 'wish + were/was', 'I wish the docs **were** clearer. (*were* lebih formal)'],
        ['Kemampuan sekarang', 'wish + could + V1', 'I wish I **could** join, but I have another meeting.'],
        ['Masa lalu', 'wish + past perfect', 'I wish I **had backed up** the database first.'],
        ['Kebiasaan orang lain yang mengganggu', 'wish + subject + would + V1', 'I wish you **would stop** pushing directly to main.'],
        ['Lebih kuat/emosional', 'if only + pola yang sama', '**If only** we **had noticed** the alert earlier!'],
      ]),
      paragraph("*Wish + would* untuk mengeluh tentang orang atau hal lain, bukan diri sendiri: ✗ *I wish I would…* → ✓ *I wish I could…*. Untuk harapan yang nyata dan mungkin terjadi, gunakan **hope**: ✗ *I wish you get the job* → ✓ *I hope you get the job.* Ucapan formal *I wish you a happy new year* (wish + orang + noun) tetap benar."),

      heading('would rather, would prefer & had better'),
      table(['Bentuk', 'Makna', 'Contoh'], [
        ["would rather ('d rather) + V1", 'Preferensi sendiri', "I**'d rather work** on the backend."],
        ["would rather not + V1", 'Preferensi negatif', "I**'d rather not** join the call; can we do it async?"],
        ['would rather + V1 + than + V1', 'Membandingkan dua pilihan', "I'd rather **fix** it now **than patch** it later."],
        ['would rather + subject + past simple', 'Preferensi tentang **tindakan orang lain** (sekarang/nanti)', "I'd rather you **didn't deploy** today."],
        ['would rather + subject + past perfect', 'Penyesalan tentang tindakan orang lain di masa lalu', "I'd rather you **had told** me earlier."],
        ['would prefer + to V1', 'Sama dengan would rather, tapi memakai to', "I**'d prefer to** pair on this."],
        ["had better ('d better) + V1", 'Saran kuat dengan konsekuensi', "We**'d better** update the certificate before it expires."],
      ]),

      heading('Causative: menyuruh, meminta, memaksa, mengizinkan'),
      table(['Pola', 'Makna', 'Contoh'], [
        ['have + something + V3', 'Pekerjaan dilakukan orang lain (jasa/diatur)', 'We **had the code audited** by an external firm.'],
        ['get + something + V3', 'Sama, lebih informal; kadang menyiratkan usaha', 'I need to **get my laptop fixed**. We **got the bug fixed** before release.'],
        ['have + something + V3 (kejadian buruk)', 'Mengalami sesuatu yang tidak diinginkan', 'We **had our API keys stolen** last year.'],
        ['have + someone + V1', 'Menugaskan (lebih umum di American English)', "I'll **have Sarah review** it."],
        ['get + someone + **to** V1', 'Membujuk / berhasil meminta', 'I **got the PM to postpone** the deadline.'],
        ['make + someone + V1', 'Memaksa / mewajibkan', 'The linter **makes us write** docstrings.'],
        ['let + someone + V1', 'Mengizinkan', "Branch protection doesn't **let anyone push** to main."],
        ['be made + **to** V1 (passive make)', 'Dipaksa', 'We **were made to rewrite** the whole service.'],
      ]),
      paragraph("Perhatikan hanya **get someone to** dan passive **be made to** yang memakai to. *Make* dan *let* aktif selalu langsung V1. *Let* tidak punya bentuk passive yang wajar; gunakan *be allowed to*: *We are allowed to work remotely.*"),

      callout('warn', 'Kesalahan khas pelajar Indonesia', "✗ *I am used to wake up early* → ✓ I'm used to **waking** up early.\n✗ *I use to work at a bank* → ✓ I **used** to work at a bank.\n✗ *I wish I can come* → ✓ I wish I **could** come.\n✗ *I wish you get well soon* → ✓ I **hope** you get well soon.\n✗ *Let me to explain* → ✓ *Let me explain.*\n✗ *I'd rather to stay late* → ✓ *I'd rather stay late.*\n✗ *I cut my hair yesterday* (dipotong tukang cukur) → ✓ I **had/got my hair cut** yesterday.\n✗ *She made me to redo the report* → ✓ *She made me redo the report.*"),

      ...practice('english-used-to-wish-causative', [
        'Tulis lima kalimat tentang cara kerja Anda dulu memakai used to dan would; pastikan would hanya untuk aksi berulang.',
        'Tulis tiga hal yang sudah Anda biasakan (be used to) dan tiga yang sedang dibiasakan (getting used to) di pekerjaan.',
        'Buat tiga kalimat wish: satu tentang sekarang, satu tentang masa lalu, dan satu keluhan memakai would.',
        'Balas tiga ajakan rapat dengan would rather (not) yang sopan, misalnya menawarkan alternatif async.',
        'Ceritakan proses rilis tim Anda dalam lima kalimat causative (have/get something done, make, let, get someone to).',
      ]),
      ...quiz([
        ['ENM-13', 'Lengkapi: When I started at the company, I ___ (not/like) code reviews.', "**didn't use to like**. *Like* adalah kata kerja keadaan, jadi *would* tidak bisa dipakai. Past simple *didn't like* juga benar."],
        ['ENM-14', "Perbaiki: I'm still not used to work remotely.", "I'm still not used to **working** remotely. Pada *be used to*, *to* adalah preposition sehingga diikuti V-ing."],
        ['ENM-15', 'Lengkapi: I wish I ___ (take) a backup before running the migration.', '**had taken**. Penyesalan tentang masa lalu memakai wish + past perfect.'],
        ['ENM-16', "Lengkapi: I'd rather you ___ (not/merge) it until QA signs off.", "**didn't merge**. *Would rather + subject* memakai past simple untuk preferensi tentang tindakan orang lain sekarang atau nanti."],
        ['ENM-17', 'Ubah ke causative: An external company tested our API for security vulnerabilities.', "**We had our API tested for security vulnerabilities** (by an external company). Pola: have + object + V3. Versi informal: *We got our API tested…*"],
        ['ENM-18', "Isi dengan let / make / get: (a) Branch protection doesn't ___ anyone push to main. (b) I finally ___ the vendor to extend the trial. (c) The new CI ___ us fix every lint warning.", "(a) **let** (mengizinkan, + V1). (b) **got** (membujuk, + to V1). (c) **makes** (mewajibkan, + V1)."],
      ]),
      heading('Referensi'),
      references(
        ["British Council LearnEnglish: Past habits: 'used to', 'would' and the past simple", 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/past-habits-used-to-would-past-simple'],
        ["British Council LearnEnglish: Different uses of 'used to'", 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/used-to-infinitive-and-be-or-get-used-to-ing'],
        ['British Council LearnEnglish: Wishes and hypotheses', 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/wishes-hypotheses'],
        ['Cambridge Grammar: Used to', 'https://dictionary.cambridge.org/grammar/british-grammar/used-to'],
        ['Cambridge Grammar: Be used to', 'https://dictionary.cambridge.org/grammar/british-grammar/be-used-to'],
        ['Cambridge Grammar: Wish', 'https://dictionary.cambridge.org/grammar/british-grammar/wish'],
        ['Cambridge Grammar: Would rather, would sooner', 'https://dictionary.cambridge.org/grammar/british-grammar/would-rather-would-sooner'],
        ['Cambridge Grammar: Have something done', 'https://dictionary.cambridge.org/grammar/british-grammar/have-something-done'],
      ),
    ],
  },

  // ───────────────────────────── 4. Linking Words & Cohesion ─────────────────────────────
  {
    id: 'english-linking-words',
    title: 'Linking Words & Cohesion: Menyambung Kalimat dengan Benar',
    summary: 'Kategori linking words beserta tingkat formalitasnya, beda conjunction/conjunctive adverb/preposition, tanda baca however, kesalahan "although … but", dan reference words.',
    track: MID, source: englishGrammarMidSource, duration: '50 menit', level: 'Med',
    blocks: [
      paragraph('**Linking words** (connectors, transitions) memberi tahu pembaca hubungan antar-gagasan: menambah, membandingkan, sebab-akibat, atau menyimpulkan. Tulisan tanpa linking terasa seperti daftar kalimat lepas; tulisan dengan linking yang salah justru membingungkan. Masalah terbesar pelajar Indonesia bukan kurang kosakata, tetapi **tata bahasanya**: *although*, *despite*, dan *however* artinya mirip, namun masing-masing menuntut struktur kalimat berbeda.'),
      paragraph('Modul ini melanjutkan pola klausa di [Phrase, Clause & Sentence Structure](#english.english-sentence-structure) dan langsung dipakai di [Writing Task 2](#english.writing-task-2) serta [Email & Chat Profesional](#english.english-email-chat-profesional).'),

      heading('Peta kategori & tingkat formalitas'),
      table(['Fungsi', 'Netral / informal', 'Formal', 'Contoh'], [
        ['Addition', 'and, also, plus, too, as well', 'in addition, furthermore, moreover, additionally', 'The fix reduces latency. **In addition**, it lowers memory usage.'],
        ['Contrast', 'but, while', 'however, whereas, in contrast, on the other hand', 'Postgres handles joins well, **whereas** Redis is built for key lookups.'],
        ['Concession', 'although, though, even though', 'despite, in spite of, nevertheless, nonetheless', '**Despite** the tight deadline, we shipped with full test coverage.'],
        ['Cause', 'because, since, as', 'due to, owing to, given that', 'The job failed **due to** a missing environment variable.'],
        ['Result', 'so', 'therefore, consequently, as a result, thus, hence', 'The cache was cold; **as a result**, the first requests were slow.'],
        ['Purpose', 'to, so (that)', 'in order to, so as to, in order that', 'We added retries **so that** transient errors do not page on-call.'],
        ['Example', 'like, for example', 'for instance, such as, namely, e.g.', 'Critical services, **such as** auth and billing, need stricter SLAs.'],
        ['Sequence', 'first, then, next, after that, finally', 'firstly, subsequently, prior to, following', '**First**, drain the node. **Then**, apply the patch.'],
        ['Summary', 'so, basically, all in all', 'in conclusion, to sum up, overall, in summary', '**Overall**, the migration went smoothly.'],
      ]),
      paragraph('*Like* untuk contoh terdengar santai; *such as* aman di semua register. *Firstly* lebih umum di British English, sedangkan American English cenderung memakai *First*.'),

      heading('Tiga jenis penghubung: conjunction, conjunctive adverb, preposition'),
      table(['Jenis', 'Kata', 'Pola', 'Contoh'], [
        ['Coordinating conjunction', 'and, but, so, or, yet', 'IC**, but** IC', 'The tests passed, **but** the build failed.'],
        ['Subordinating conjunction', 'although, because, since, while, whereas, even though, even if, unless, so that', '**Although** IC, IC / IC **because** IC', '**Although** the tests passed, the build failed.'],
        ['Conjunctive adverb (transition)', 'however, therefore, moreover, nevertheless, consequently, otherwise', 'IC**; however,** IC / IC**. However,** IC', 'The tests passed; **however**, the build failed.'],
        ['Preposition', 'despite, in spite of, because of, due to, in addition to, instead of', '+ **noun / V-ing**', '**Despite** passing the tests, the build failed.'],
      ]),
      paragraph("IC = independent clause (punya subjek dan verb, bisa berdiri sendiri). Untuk memakai *despite* dengan klausa lengkap, tambahkan *the fact that*: Despite **the fact that** the tests passed, the build failed."),

      heading('Aturan tanda baca'),
      list([
        "**However di awal kalimat** diikuti koma: *The fix is simple. However, it requires a restart.*",
        "**Menyambung dua IC dengan however** memakai titik koma: *The fix is simple; however, it requires a restart.* Koma saja adalah **comma splice** (salah).",
        "**However di tengah klausa** diapit koma: *The fix, however, requires a restart.*",
        "*However* tanpa koma berarti \"bagaimanapun caranya\": *However you deploy it, the config must be valid.*",
        "**Subordinate clause di depan** → koma: *Because the token expired, the request failed.* Di belakang → biasanya tanpa koma: *The request failed because the token expired.* (Pengecualian: *whereas* dan *while* kontras sering tetap diberi koma.)",
        "**so** (hasil) biasanya didahului koma: *It was late, so I logged off.* **so that** (tujuan) tanpa koma: *I logged off so that I could rest.*",
        "*But* atau *And* di awal kalimat lazim di email dan blog; di esai akademik, pilih *However* atau *In addition*.",
      ]),

      heading('Pasangan yang sering tertukar'),
      table(['Pasangan', 'Bedanya', 'Contoh'], [
        ['although vs despite', 'although + **klausa**; despite + **noun/V-ing**', '**Although** it was slow, it worked. / **Despite** its slowness, it worked.'],
        ['although vs however', 'although menyatukan dua klausa dalam satu kalimat; however menghubungkan dua kalimat', 'Although it worked, it was slow. / It worked. However, it was slow.'],
        ['even though vs even if', 'even though = **fakta** (walaupun memang); even if = **pengandaian** (sekalipun seandainya)', "**Even though** v1 is deprecated, clients still use it. / We'll support v1 **even if** v3 ships next month."],
        ['because vs because of', 'because + klausa; because of + noun', '**because** the server was down / **because of** the outage'],
        ['so vs so that', 'so = hasil; so that = tujuan', 'The API was slow, **so** we added a cache. / We added a cache **so that** the API would be faster.'],
        ['besides vs beside', 'besides = selain itu; beside = di samping', '**Besides**, the license is cheaper. / The router is **beside** the server rack.'],
        ['on the other hand', 'Hanya untuk sisi yang **berlawanan**, bukan menambah', 'Go compiles fast. **On the other hand**, its generics are limited.'],
      ]),

      callout('warn', 'Kesalahan khas pelajar Indonesia', "✗ *Although the server is fast, but the database is slow.* → ✓ *Although the server is fast, the database is slow.* (Bahasa Inggris tidak memakai pasangan \"walaupun… tetapi\".)\n✗ *Because the API changed, so the client broke.* → ✓ *Because the API changed, the client broke.* / *The API changed, so the client broke.*\n✗ *Despite the server is fast…* → ✓ *Despite the server being fast…* / *Although the server is fast…*\n✗ *Because of the token expired…* → ✓ *Because the token expired…* / *Because of the expired token…*\n✗ *The tests passed, however the build failed.* → ✓ *The tests passed; however, the build failed.*\n✗ *Even if I tested it, it still broke* (padahal memang sudah dites) → ✓ *Even though I tested it, it still broke.*\n✗ *In other hand…* → ✓ *On the other hand…*\n✗ *Moreover, can you check the logs?* (di Slack, terlalu kaku) → ✓ *Also, could you check the logs?*"),

      heading('Reference words: kohesi tanpa mengulang'),
      table(['Alat', 'Fungsi', 'Contoh'], [
        ['this / these + noun', 'Merujuk gagasan sebelumnya secara jelas', 'We disabled the cron job. **This change** cut CPU usage by 30%.'],
        ['such + noun', 'Merujuk jenis hal yang sama', 'Timeouts occurred twice last week. **Such failures** should trigger an alert.'],
        ['the former / the latter', 'Yang pertama / yang terakhir dari dua hal', 'We compared Kafka and RabbitMQ and chose **the latter** for its simpler operations.'],
        ['it / they / them', 'Kata ganti untuk noun yang jelas', 'The new endpoint is faster, and **it** is fully backward-compatible.'],
        ['do so / the same', 'Menghindari pengulangan verb atau gagasan', 'Back up the database before migrating. If you cannot **do so**, ask DevOps for help.'],
      ]),
      paragraph("Hindari *This* tanpa noun bila rujukannya ambigu: We upgraded Node and changed the pool size. **This** caused the leak. Mana penyebabnya? Lebih jelas: **This pool-size change caused the leak.**"),

      heading('Contoh terapan'),
      { type: 'tabs', tabs: [
        { label: 'Email kerja', blocks: [
          paragraph("Hi Sarah,\nI've reviewed the proposal. **Overall**, it looks solid; **however**, I have two concerns. **First**, the rollout plan has no rollback step. **Second**, the cost estimate excludes data transfer. **Since** the deadline is Friday, could we discuss this tomorrow?\nThanks,\nDaniel"),
        ] },
        { label: 'Deskripsi PR', blocks: [
          paragraph("**Summary**\nThis PR adds retry logic with exponential backoff to the payment client. **Previously**, a single timeout failed the whole checkout. **As a result**, we saw a spike of support tickets during peak hours.\n**Notes**\n**Although** retries reduce failures, they can increase latency; **therefore**, attempts are capped at three. **Such** limits are configurable via `PAYMENT_MAX_RETRIES`."),
        ] },
        { label: 'IELTS / TOEFL', blocks: [
          paragraph("Some people argue that remote work reduces productivity. **Admittedly**, working from home can blur the line between work and rest. **Nevertheless**, recent studies suggest that many employees complete more tasks at home **because** they spend less time commuting. **For instance**, … **Consequently**, … **In conclusion**, …"),
          callout('tip', 'Jangan menumpuk linker', 'Penilai IELTS dan TOEFL menilai kohesi yang *mekanis* lebih rendah: setiap kalimat diawali *Moreover/Furthermore* justru terlihat dipaksakan. Pakai linker hanya ketika hubungannya perlu ditegaskan; sisanya, andalkan reference words dan urutan gagasan. Lihat juga [Writing Task 1 Academic](#english.writing-task-1-academic).'),
        ] },
      ] },

      ...practice('english-linking-words', [
        'Ambil deskripsi PR terakhir Anda, tandai semua linking words, lalu periksa tanda baca however/therefore dengan aturan di atas.',
        'Tulis satu kalimat dengan pola masing-masing: although, despite, however, even though, dan even if, semuanya tentang proyek yang sama.',
        'Cari tiga kalimat "although… but" atau "because… so" dalam tulisan lama Anda dan perbaiki.',
        'Tulis ulang paragraf 5 kalimat yang setiap kalimatnya diawali linker, sehingga hanya tersisa 2 linker dan sisanya memakai reference words.',
        'Tulis satu paragraf IELTS Task 2 (80–100 kata) yang memakai minimal satu linker dari kategori contrast, example, result, dan summary.',
      ]),
      ...quiz([
        ['ENM-19', 'Perbaiki: Although the migration succeeded, but some rows were skipped.', "**Although the migration succeeded, some rows were skipped.** Hapus *but*. Alternatif: *The migration succeeded, but some rows were skipped.*"],
        ['ENM-20', 'Isi dengan although / despite / however: ___ the high traffic, the service stayed within its SLA.', '**Despite** (atau *In spite of*). Sesudahnya ada noun phrase (*the high traffic*), bukan klausa.'],
        ['ENM-21', 'Perbaiki tanda baca: The fix is simple, however it requires a restart.', "**The fix is simple; however, it requires a restart.** atau dua kalimat: *The fix is simple. However, it requires a restart.* Koma saja menghasilkan comma splice."],
        ['ENM-22', "Isi even though / even if: (a) We'll ship on Friday ___ the design review is delayed. (b) ___ the bug was reported in March, it was fixed only in June.", '(a) **even if**: kondisi pengandaian (terjadi atau tidak, tetap rilis). (b) **Even though**: fakta yang benar-benar terjadi.'],
        ['ENM-23', 'Perbaiki: Because of the token expired, the request was rejected.', "**Because the token had expired, the request was rejected.** (because + klausa) atau **Because of the expired token, the request was rejected.** (because of + noun)."],
        ['ENM-24', 'Terjemahkan dengan reference word: "Kami mempertimbangkan Kafka dan RabbitMQ; RabbitMQ dipilih karena lebih mudah dioperasikan."', "**We considered Kafka and RabbitMQ and chose the latter because it is easier to operate.** *The latter* merujuk RabbitMQ (yang disebut terakhir) tanpa mengulang namanya."],
      ]),
      heading('Referensi'),
      references(
        ["British Council LearnEnglish: Contrasting ideas: 'although', 'despite' and others", 'https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/contrasting-ideas-although-despite-others'],
        ['Cambridge Grammar: Although and though', 'https://dictionary.cambridge.org/grammar/british-grammar/although-and-though'],
        ['Cambridge Grammar: Despite and in spite of', 'https://dictionary.cambridge.org/grammar/british-grammar/despite-and-in-spite-of'],
        ['Cambridge Grammar: However', 'https://dictionary.cambridge.org/grammar/british-grammar/however'],
        ['Cambridge Grammar: Even if and even though', 'https://dictionary.cambridge.org/grammar/british-grammar/even-if-and-even-though'],
        ['Cambridge Grammar: Because, because of', 'https://dictionary.cambridge.org/grammar/british-grammar/because-because-of'],
        ['Purdue OWL: Transitional Devices', 'https://owl.purdue.edu/owl/general_writing/mechanics/transitions_and_transitional_devices/transitional_devices.html'],
        ['Purdue OWL: Run-ons, Comma Splices, Fused Sentences', 'https://owl.purdue.edu/owl/general_writing/punctuation/independent_and_dependent_clauses/runonsentences.html'],
        ['Purdue OWL: Commas vs. Semicolons', 'https://owl.purdue.edu/owl/general_writing/punctuation/commas/commas_vs_semicolons.html'],
      ),
    ],
  },
];
