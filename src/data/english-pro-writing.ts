import type { Block, Module, Track, VocabItem } from '../types';
import { callout, code, heading, paragraph, practice, quiz, references, table } from './lesson-kit';

const PRO = 'English Profesional';

export const englishProTracks: Track[] = [
  { title: PRO, summary: 'Menulis email, chat, dokumentasi teknis, code review, meeting, presentasi, bahasa diplomatis, dan interview dalam bahasa Inggris.' },
];

export const englishProWritingSource = 'English Profesional (Menulis): materi tulisan tangan dari Google developer documentation style guide, Microsoft Writing Style Guide, Conventional Commits, dan plainlanguage.gov (4 November 2026)';

const list = (items: string[], ordered = false): Block => ({ type: 'list', items, ordered });
const vocab = (items: [term: string, meaning: string, example?: string][]): Block => ({
  type: 'vocab', items: items.map(([term, meaning, example]): VocabItem => ({ term, meaning, example })),
});
/** Beberapa varian teks yang sama, satu blok kode per tab. */
const textTabs = (...items: [label: string, title: string, content: string][]): Block => ({
  type: 'tabs', tabs: items.map(([label, title, content]) => ({ label, blocks: [code(title, content, 'text')] })),
});
const l = (label: string, id: string) => `[${label}](#english.${id})`;

export const englishProWritingModules: Omit<Module, 'code'>[] = [
  // ───────────────────────────── 1. Email & Chat ─────────────────────────────
  {
    id: 'english-email-chat-profesional',
    title: 'Email & Chat Profesional: Struktur, Register & Template',
    summary: 'Memilih register formal/neutral/casual, menulis subject line yang jelas, struktur context → request → deadline → next step, delapan template siap pakai, etiket chat async, dan frasa "Indoglish" yang perlu diganti.',
    track: PRO, source: englishProWritingSource, duration: '1 jam', level: 'Med',
    blocks: [
      paragraph('Di tim remote, sebagian besar kesan orang tentang Anda terbentuk dari **tulisan**: email, pesan Slack, dan komentar tiket. Rekan di zona waktu lain tidak bisa menoleh dan bertanya *"maksudnya apa?"*; jika pesan Anda kurang jelas, satu pertanyaan bolak-balik bisa menghabiskan satu hari kerja. Karena itu targetnya bukan bahasa yang "tinggi", melainkan pesan yang **bisa langsung ditindaklanjuti** setelah dibaca sekali.'),
      paragraph(`Modul ini melatih *keterampilan* menulis, bukan menghafal kata. Kosakata dasar stand-up dan singkatan chat (FYI, EOD, LGTM) sudah ada di ${l('Remote Work & Komunikasi Tim Internasional', 'remote-work-komunikasi-tim-internasional')}; di sini kita merangkainya menjadi email dan pesan utuh. Untuk melunakkan permintaan, lihat juga ${l('Modal Verbs', 'english-modal-verbs')} dan ${l('Bahasa Diplomatis', 'english-diplomatic')}.`),

      heading('Register: formal, neutral, casual'),
      paragraph('**Register** adalah tingkat keformalan. Kesalahan paling umum developer Indonesia bukan terlalu santai, melainkan **terlalu formal** untuk rekan satu tim ("Dear Sir, I would like to humbly request…"). Di kebanyakan perusahaan teknologi internasional, **neutral** adalah default untuk email kerja, dan rekan kerja dipanggil dengan nama depan tanpa *Sir/Madam/Mr.*.'),
      table(['Register', 'Kapan dipakai', 'Pembuka', 'Penutup'], [
        ['**Formal**', 'Klien atau vendor baru, eksekutif di luar tim, lamaran kerja, keluhan resmi.', 'Dear Ms. Tan, / Dear Hiring Team,', 'Kind regards, / Best regards, / Sincerely, (sangat formal, jarang di email kerja)'],
        ['**Neutral**', 'Rekan kerja, tim lain, manajer: default email dan pesan kerja.', 'Hi Sarah, / Hello team, / Hi everyone,', 'Thanks, / Best, / Thanks in advance,'],
        ['**Casual**', 'Chat dengan rekan dekat, thread yang sedang berjalan.', 'Hey! / Hi Sarah — / langsung ke inti tanpa sapaan', 'Thanks! / Cheers / cukup emoji reaction'],
      ]),
      textTabs(
        ['Formal', 'Ke vendor eksternal', `Dear Mr. Lee,

We are seeing intermittent timeouts when calling your Payments API
from our production environment (about 2% of requests since
3 November, 09:00 UTC).

Could you please confirm whether there is a known issue on your side?
We have attached sample request IDs and timestamps.

Kind regards,
Budi Santoso
Backend Engineer, Example Corp`],
        ['Neutral', 'Ke rekan di tim lain', `Hi Sarah,

We're seeing intermittent timeouts from the Payments API on production
(about 2% of requests since this morning).

Could you check whether anything changed on your side yesterday?
Sample request IDs are in the attached sheet.

Thanks,
Budi`],
        ['Casual', 'Chat ke rekan satu tim', `Hey Andi, are you seeing Payments API timeouts too? About 2% of our
requests since this morning. Request IDs are in the thread below.`],
      ),

      heading('Subject line yang bisa dipindai'),
      paragraph('Penerima memutuskan dari subject line apakah email dibuka sekarang, nanti, atau tidak sama sekali. Letakkan informasi kunci di **5–7 kata pertama**, sebutkan tindakan yang diminta, dan sertakan ID tiket bila ada. Tag dalam kurung siku seperti **[Action needed]**, **[FYI]**, atau **[Decision]** membantu penerima memilah.'),
      table(['Kurang jelas', 'Lebih baik', 'Kenapa'], [
        ['Question', 'Question: which Redis cluster should the cache service use?', 'Pertanyaannya sudah terbaca tanpa membuka email.'],
        ['URGENT!!!', '[Action needed by Fri] Approve prod DB access for INC-1203', 'Mendesak dijelaskan dengan tenggat, bukan tanda seru.'],
        ['Update', 'Checkout migration: week 3 update (on track)', 'Status utama muncul di subject.'],
        ['(no subject)', 'Notes: API versioning meeting, 3 Nov', 'Mudah dicari ulang di inbox.'],
        ['Re: Re: Fw: lunch plan', 'Staging outage follow-up (was: lunch plan)', 'Ganti subject bila topik thread berubah.'],
      ]),

      heading('Struktur 4 bagian: context → request → deadline → next step'),
      paragraph('Hampir semua email kerja muat dalam empat bagian. **Context**: satu atau dua kalimat tentang situasinya (bukan riwayat lengkap). **Request**: apa persisnya yang Anda minta, idealnya satu permintaan per email. **Deadline**: kapan, dengan zona waktu bila tim tersebar. **Next step**: apa yang terjadi setelahnya atau apa yang Anda lakukan sementara itu. Jika pembaca hanya membaca dua kalimat pertama, mereka tetap harus tahu apa yang Anda butuhkan.'),
      code('Contoh dengan anotasi', `Subject: Review needed: rate limiting for the public API (PR #214)

Hi Sarah,

[CONTEXT]   We're adding rate limiting to the public API before the partner
            launch on 14 November.
[REQUEST]   Could you review PR #214? I'd especially like your view on the
            sliding-window approach, since you built the current Redis setup.
[DEADLINE]  Ideally by Wednesday, 17:00 UTC+7 (11:00 CET), so it makes
            Thursday's release.
[NEXT STEP] If you're busy this week, let me know and I'll ask Andi instead.

Thanks,
Budi`, 'text'),
      callout('tip', 'Satu email, satu tujuan', 'Jika Anda punya tiga permintaan yang tidak saling terkait, kirim tiga email (atau satu email dengan daftar bernomor yang jelas). Permintaan kedua dan ketiga di paragraf terakhir hampir selalu terlewat. Untuk waktu, tulis zona waktunya: *by Wednesday 17:00 UTC+7*, bukan *by tomorrow afternoon*, karena "tomorrow" di Jakarta bisa masih "today" di San Francisco.'),

      heading('Delapan template siap pakai'),
      paragraph('Ganti bagian yang spesifik (nama, tiket, tanggal), tetapi pertahankan strukturnya. Perhatikan bahwa setiap template menyebut apa yang sudah dicoba atau statusnya, permintaan yang konkret, dan waktu.'),
      textTabs(
        ['Asking for help', 'Meminta bantuan', `Subject: Question about webhook retries in payment-service (PAY-482)

Hi Sarah,

I'm working on PAY-482 (duplicate refunds) and I'm stuck on how webhook
retries are handled.

What I've tried so far:
- Checked the retry config (max 5 attempts, exponential backoff)
- Reproduced the duplicate on staging (request ID 7f3a91c)

My question: should the idempotency key come from the gateway, or do we
generate it ourselves?

No rush. Any time before Thursday's planning works. If it's easier to
explain live, I'm happy to jump on a 15-minute call.

Thanks,
Budi`],
        ['Requesting review', 'Meminta review', `Hi team,

Could someone review PR #214 (rate limiting for the public API)?
It's about 300 lines, mostly middleware and tests.

The main thing I'd like feedback on is the sliding-window approach;
the trade-offs are explained in the PR description.

I'm hoping to merge by Wednesday EOD (UTC+7) so it goes into
Thursday's release. Thanks!`],
        ['Following up', 'Follow-up / reminder', `Hi Mark,

Just following up on my message from Monday about read access to the
staging database (OPS-91). I'm blocked on the migration test until
the request is approved.

Could you approve it, or point me to someone who can?

Thanks,
Budi

--- versi chat yang lebih ringan ---
Bumping this in case it got buried: still need OPS-91 approved to
unblock the migration test. Thanks!`],
        ['Declining', 'Menolak dengan alternatif', `Hi Lisa,

Thanks for thinking of me for the reporting dashboard. Unfortunately,
I can't take it on this sprint: I'm fully committed to the checkout
migration until 20 November.

A couple of options:
- I could start on it next sprint (from 21 November).
- Andi worked on the reporting pipeline before and may have capacity.

Let me know what works best for you.

Best,
Budi`],
        ['Apologizing for a delay', 'Minta maaf atas keterlambatan', `Hi Tom,

Sorry for the delay on the API documentation. I underestimated the
time needed to document the error codes.

Current status: all endpoints are documented; error codes are about
70% done.
New ETA: Friday, 12:00 UTC.

I'll share the finished sections today so you're not blocked.

Thanks for your patience,
Budi`],
        ['Escalating', 'Eskalasi', `Subject: [Action needed] Payment failures on production (INC-1203)

Hi Rina,

I'd like to escalate INC-1203. It's now affecting customers, and we
haven't been able to resolve it at the team level.

Impact: about 4% of card payments have failed since 09:00 UTC
(roughly 350 transactions).
What we've done: rolled back our last deploy (no change) and opened a
ticket with the vendor at 09:40 UTC. No response yet.
What we need: someone with vendor account access to raise the
priority, or approval to switch traffic to the backup gateway.

I'll post updates in #inc-1203 every 30 minutes.

Thanks,
Budi`],
        ['Out of office', 'Pesan otomatis cuti', `Subject: Out of office until Monday, 10 November

Hi,

I'm out of the office from 5 to 9 November with limited access to
email. I'll reply when I'm back on Monday, 10 November.

For urgent questions about the order service, please contact
Andi (andi@example.com). For production incidents, use #oncall.

Thanks,
Budi`],
        ['Introducing yourself', 'Memperkenalkan diri ke tim baru', `Hi everyone!

I'm Budi, and I've just joined the Payments team as a backend engineer.
I'm based in Jakarta (UTC+7), so my afternoon overlaps with the
European morning.

Before this, I spent four years building order and inventory services
in Go and PostgreSQL at an e-commerce company.

This week I'm onboarding with Sarah and setting up my local
environment. If there's anything you think I should read first,
I'd love to hear it.

Looking forward to working with you all!`],
      ),

      heading('Etiket chat async (Slack/Teams)'),
      list([
        '**Jangan kirim "hi" sendirian** ([nohello.net](https://nohello.net/)). Pesan *"Hi, are you there?"* memaksa orang menunggu Anda mengetik pertanyaan. Gabungkan sapaan dan pertanyaan dalam **satu pesan**: *"Hi Sarah, quick question about the orders API: …"*.',
        '**Satu pesan dengan konteks lengkap**: apa yang terjadi, di mana (env, service, endpoint), apa yang sudah dicoba, dan apa yang Anda butuhkan. Sertakan request ID, link log, atau screenshot, bukan "error nih".',
        '**Pakai thread.** Balas di thread, bukan di channel utama, supaya diskusi tidak menenggelamkan topik lain. Jika keputusan penting lahir di thread, ringkas di channel atau tiket.',
        '**Emoji reaction sebagai tanda terima.** 👀 berarti "sedang saya lihat", ✅ berarti "selesai", 👍 berarti "oke/setuju". Ini menggantikan balasan *"Noted"* yang menambah notifikasi.',
        '**Hormati zona waktu.** Pesan boleh dikirim kapan saja, tetapi jangan berharap dibalas di luar jam kerja orang itu. Gunakan fitur *schedule send*, dan tulis waktu dengan zona: *"before 15:00 CET"*.',
        '**Hemat @here/@channel.** Hanya untuk hal yang memang perlu perhatian semua orang sekarang. Untuk satu orang, mention langsung namanya.',
        '**Edit, jangan spam.** Typo kecil cukup diedit. Satu ide yang dipecah menjadi lima pesan pendek menghasilkan lima notifikasi.',
        '**Pilih kanal yang tepat.** Chat untuk pertanyaan cepat; tiket untuk pekerjaan yang perlu dilacak; email untuk pihak eksternal atau hal formal; call bila thread sudah lebih dari 3–4 balasan tanpa kesimpulan.',
      ]),
      textTabs(
        ['Sebelum', 'Empat pesan, nol konteks', `hi
mas are you there?
can I ask something
the api error`],
        ['Sesudah', 'Satu pesan yang bisa langsung dijawab', `Hi Sarah, quick question about the orders API: on staging,
GET /orders?status=paid has returned 500 since this morning
(request ID 7f3a91c). The logs say "column paid_at does not exist".
Did yesterday's migration run on staging? No rush, I'm working on
something else in the meantime.`],
      ),

      heading('Indoglish: frasa yang perlu diganti'),
      paragraph('Frasa berikut lahir dari terjemahan harfiah bahasa Indonesia atau dari gaya surat kantor lama. Sebagian tidak salah secara grammar, tetapi terdengar kaku, kuno, atau membingungkan bagi rekan internasional.'),
      table(['Hindari', 'Masalahnya', 'Ganti dengan'], [
        ['Please be informed that…', 'Kaku dan birokratis, terdengar seperti pengumuman resmi.', 'Just a heads-up: … / FYI, … / I wanted to let you know that…'],
        ['Kindly do the needful.', 'Tidak jelas apa yang diminta; asing bagi banyak penutur.', 'Could you approve the access request by Thursday?'],
        ['I will revert back to you.', '*Revert* berarti mengembalikan ke keadaan semula (seperti git revert); *back* juga mubazir.', "I'll get back to you by Friday."],
        ['Noted with thanks.', 'Formal kuno; di chat cukup reaction.', 'Thanks, got it. / Thanks, I\'ll take care of it. / ✅'],
        ['Sorry for disturbing.', 'Sebagai adjective, *disturbing* berarti "meresahkan/mengerikan".', 'Sorry to bother you, … / atau langsung: Quick question about…'],
        ['Can I ask something?', 'Pertanyaan tentang pertanyaan; lawan bicara harus menunggu.', 'Langsung tanyakan: How do I get access to the staging logs?'],
        ['Already done.', 'Apa yang selesai? Di mana buktinya?', 'Done: the fix is deployed to staging (PR #231).'],
        ['Thanks before.', 'Terjemahan "terima kasih sebelumnya".', 'Thanks in advance. / Thanks!'],
        ['Please kindly…', 'Dua penanda sopan sekaligus, terdengar berlebihan.', 'Could you please… / Would you mind…'],
        ['We will discuss about it.', '*Discuss* tidak memakai *about*.', "We'll discuss it on Monday."],
        ['Waiting for your good news.', 'Terjemahan harfiah, terdengar aneh.', 'I look forward to hearing from you. / Let me know what you think.'],
        ['Do you understand?', 'Bisa terdengar menggurui.', 'Does that make sense? / Let me know if anything is unclear.'],
      ]),
      callout('warn', 'Kesalahan khas penulis Indonesia', '**(1) Terlalu formal ke rekan sendiri**: *Dear Sir* untuk rekan satu tim membuat jarak; pakai *Hi + nama depan*. **(2) Minta maaf berlebihan**: *"Sorry for disturbing, sorry for my bad English"* melemahkan pesan; cukup sampaikan dengan jelas. **(3) Permintaan tersembunyi**: *"Maybe if you have time you can check"* membuat penerima tidak yakin ini permintaan; tulis *"Could you check … by Friday?"*. **(4) Tanpa konteks**: *"Already done"* atau *"error"* tanpa link, env, dan ID. **(5) Waktu ambigu**: *"tomorrow"* tanpa tanggal dan zona waktu. **(6) Artikel hilang**: *"Sorry for late reply"* → *"Sorry for the late reply"*.'),

      heading('Before/after: menulis ulang email nyata'),
      textTabs(
        ['Sebelum', 'Kaku, tanpa permintaan jelas', `Dear Sir/Madam,

Please be informed that I want to ask about the deployment. Sorry for
disturbing. Kindly do the needful regarding the server access because
I already request it last week but still not get. I will revert back
after got the access. Thanks before.`],
        ['Sesudah', 'Context → request → deadline → next step', `Subject: Request: staging server access for the deployment test (OPS-91)

Hi Mark,

I requested read access to the staging server last Tuesday (OPS-91),
but it hasn't been approved yet. I need it to run the deployment test
before Thursday's release.

Could you approve the request today, or let me know who can?
Once I have access, I'll run the test and share the results in #release.

Thanks,
Budi`],
      ),
      paragraph('Perhatikan perubahannya: subject memuat permintaan dan ID tiket; sapaan memakai nama; *already request … still not get* menjadi kalimat past/present perfect yang benar (*I requested … it hasn\'t been approved yet*); permintaan berbentuk pertanyaan sopan dengan tenggat; dan ada langkah berikutnya yang konkret.'),

      ...practice('english-email-chat-profesional', [
        'Tulis ulang 3 email atau pesan kerja terakhir Anda dengan struktur context → request → deadline → next step. Kriteria: permintaan terbaca dalam dua kalimat pertama, ada tenggat dengan zona waktu.',
        'Ubah 5 subject line dari inbox Anda menjadi versi yang bisa dipindai. Kriteria: informasi kunci di 5–7 kata pertama, tindakan yang diminta jelas, ada ID tiket bila relevan.',
        'Tulis satu pesan Slack untuk melaporkan error di staging tanpa "hi" terpisah. Kriteria: satu pesan, memuat env, endpoint, request ID atau log, apa yang sudah dicoba, dan apa yang Anda butuhkan.',
        'Pilih dua template (declining dan apologizing for a delay) lalu sesuaikan dengan situasi nyata Anda. Kriteria: penolakan menawarkan alternatif; permintaan maaf memuat status sekarang dan ETA baru.',
        'Cari 5 frasa Indoglish di chat atau email lama Anda (gunakan tabel di atas) dan tulis penggantinya. Kriteria: tidak ada lagi "Please be informed", "revert back", "Thanks before", atau "Sorry for disturbing".',
        'Tulis pesan perkenalan diri untuk tim baru (maksimal 6 kalimat). Kriteria: menyebut peran, lokasi dan zona waktu, pengalaman relevan, dan satu ajakan atau pertanyaan.',
      ]),
      ...quiz([
        ['ENW-01', 'Tulis ulang pesan chat ini: "hi" (enter) "are you free?" (enter) "can I ask something about deployment".', 'Satu pesan dengan konteks: "Hi Andi, quick question about the deployment: the release job failed at the migration step on staging (link to the CI run). Do you know if we need to run migration 0042 manually first? No rush, I can look into it myself in the meantime." Sapaan dan pertanyaan digabung, ada lokasi masalah, bukti, dan pertanyaan spesifik.'],
        ['ENW-02', 'Apa yang salah dengan "I will revert back to you after the meeting", dan bagaimana versi yang lebih baik?', 'Revert berarti mengembalikan sesuatu ke keadaan sebelumnya (seperti git revert), dan "back" mubazir karena re- sudah berarti kembali. Versi yang lebih baik: "I\'ll get back to you after the meeting (around 15:00 UTC+7)." Tambahkan waktu agar penerima tahu kapan menunggu.'],
        ['ENW-03', 'Perbaiki subject line "URGENT!!! Please help" untuk email tentang API key production yang akan kedaluwarsa besok.', 'Contoh: "[Action needed by 5 Nov] Renew the production API key for the payment gateway". Kemendesakan dinyatakan dengan tanggal dan tindakan, bukan huruf kapital dan tanda seru; penerima tahu apa yang diminta tanpa membuka email.'],
        ['ENW-04', 'Register mana yang tepat untuk email pertama ke klien baru, dan untuk follow-up PR ke rekan satu tim? Beri pembuka dan penutup masing-masing.', 'Klien baru: formal, misalnya "Dear Ms. Tan," … "Kind regards,". Rekan satu tim: neutral atau casual, misalnya "Hi Sarah," … "Thanks," atau di chat langsung "Hey Sarah, …" tanpa penutup. Memakai "Dear Sir" ke rekan satu tim terdengar kaku dan berjarak.'],
        ['ENW-05', 'Tulis ulang: "Sorry for disturbing. Already done for the bug. Thanks before."', 'Contoh: "The checkout bug is fixed: PR #231 is merged and deployed to staging. Could you verify it on your side when you have a moment? Thanks!" Permintaan maaf yang tidak perlu dibuang, "already done" diganti dengan apa yang selesai beserta buktinya, dan "Thanks before" diganti "Thanks!" atau "Thanks in advance".'],
      ]),
      heading('Referensi'),
      references(
        ['plainlanguage.gov: Federal Plain Language Guidelines', 'https://www.plainlanguage.gov/guidelines/'],
        ['Microsoft Writing Style Guide: Welcome', 'https://learn.microsoft.com/en-us/style-guide/welcome/'],
        ['Google developer documentation style guide', 'https://developers.google.com/style'],
        ['nohello.net: please don\'t just say hello in chat', 'https://nohello.net/'],
      ),
    ],
  },

  // ───────────────────────────── 2. Technical Writing ─────────────────────────────
  {
    id: 'english-technical-writing',
    title: 'Technical Writing: Commit, Pull Request, Bug Report, README & Design Doc',
    summary: 'Prinsip plain English (active voice, present tense, kalimat pendek), commit message imperatif dan Conventional Commits, template PR dan bug report, struktur README, frasa ADR/RFC, serta grammar yang paling sering salah: artikel dan countable vs uncountable.',
    track: PRO, source: englishProWritingSource, duration: '1 jam', level: 'Hard',
    blocks: [
      paragraph('Tulisan teknis dibaca jauh lebih sering daripada ditulis: commit message dibaca saat `git blame` dua tahun kemudian, PR description dibaca reviewer di zona waktu lain, bug report dibaca engineer on-call jam 3 pagi. Pembaca-pembaca ini sibuk, sering bukan penutur asli, dan kadang memakai mesin penerjemah. Tulisan yang bagus untuk mereka adalah tulisan yang **pendek, konsisten, dan tidak ambigu**.'),
      paragraph(`Modul ini memakai panduan yang dipakai industri: Google developer documentation style guide, Microsoft Writing Style Guide, Conventional Commits, dan plain language guidelines. Kosakata dasar proses software ada di ${l('Pengembangan Software', 'pengembangan-software-pemrograman-software-devel')}; untuk kata penghubung dalam paragraf panjang (however, therefore, as a result), lihat ${l('Linking Words', 'english-linking-words')}.`),

      heading('Prinsip plain English untuk developer'),
      table(['Prinsip', 'Sebelum', 'Sesudah'], [
        ['**Active voice**: pelaku jelas', 'The token is validated by the middleware.', 'The middleware validates the token.'],
        ['**Present tense** untuk perilaku sistem', 'The endpoint will return 404 if the order is not found.', 'The endpoint returns 404 if the order doesn\'t exist.'],
        ['**Kalimat pendek**: satu ide per kalimat', 'This service, which was created in 2021 to replace the old monolith and which is owned by the payments team, handles refunds.', 'This service handles refunds. The payments team owns it.'],
        ['**Second person** dan imperatif untuk instruksi', 'The user should configure the API key first.', 'Configure the API key first. / You can configure…'],
        ['**Syarat di depan**', 'Run the migration if you use PostgreSQL.', 'If you use PostgreSQL, run the migration.'],
        ['**Istilah konsisten**', 'Create an API key… Then paste the token… The secret expires…', 'Pilih satu istilah (API key) dan pakai terus.'],
        ['**Hindari simply/just/easy/obviously**', 'Simply run the script and it just works.', 'Run the script. (Jika gagal, pembaca tidak merasa bodoh.)'],
        ['**Rujukan jelas**, bukan it/this mengambang', 'This causes it to fail.', 'The missing index causes the query to time out.'],
      ]),
      callout('info', 'Kenapa present tense?', 'Dokumentasi menjelaskan perilaku sistem *sekarang*, setiap kali pembaca membacanya. Google style guide menyarankan present tense dan menghindari *will* kecuali benar-benar membicarakan masa depan. Commit message dan release notes adalah pengecualian: mereka mencatat perubahan, dengan aturan sendiri (lihat bagian berikut).'),

      heading('Commit message: imperatif, 50/72, menjawab "why"'),
      paragraph('Aturan klasik dari artikel *How to Write a Git Commit Message* (cbea.ms): pisahkan subject dan body dengan satu baris kosong; subject sekitar **50 karakter** (maksimal 72); awali dengan huruf kapital; tanpa titik di akhir; gunakan **imperative mood**; bungkus body di **72 karakter**; body menjelaskan **what dan why**, bukan how (how sudah terlihat di diff). Tes sederhana untuk imperative mood: subject harus melengkapi kalimat *"If applied, this commit will …"*.'),
      table(['Kurang baik', 'Lebih baik', 'Alasan'], [
        ['fix bug', 'Fix crash when the cart is empty', 'Bug yang mana? Subject harus spesifik.'],
        ['Fixed the login issue.', 'Fix session expiry for remember-me logins', 'Imperatif (Fix, bukan Fixed), tanpa titik, spesifik.'],
        ['Adding validation for email', 'Add email format validation to sign-up', '*If applied, this commit will add…* ✓'],
        ['update', 'Upgrade Go to 1.23 and refresh go.sum', 'Apa yang di-update dan ke versi berapa.'],
        ['changes based on review', 'Rename OrderRepo methods to match the service layer', 'Sebutkan perubahannya, bukan asal-usulnya.'],
        ['WIP / asdf / final fix 2', '(squash sebelum merge)', 'Riwayat sementara boleh berantakan; yang masuk main jangan.'],
      ]),
      paragraph('**Conventional Commits** menambahkan struktur yang bisa dibaca mesin (untuk changelog dan semantic versioning): `<type>[optional scope]: <description>`. Spesifikasi hanya mendefinisikan `feat` (fitur baru, setara MINOR) dan `fix` (perbaikan bug, setara PATCH); tipe lain berikut berasal dari konvensi Angular dan sangat umum dipakai (misalnya oleh commitlint). **Breaking change** ditandai dengan `!` setelah type/scope atau footer `BREAKING CHANGE:` (setara MAJOR).'),
      table(['Type', 'Arti', 'Contoh'], [
        ['feat', 'Fitur baru bagi pengguna', 'feat(auth): add password reset via email'],
        ['fix', 'Perbaikan bug', 'fix(orders): prevent duplicate refunds on webhook retry'],
        ['docs', 'Dokumentasi saja', 'docs(readme): add local setup with Docker Compose'],
        ['refactor', 'Ubah struktur kode tanpa mengubah perilaku', 'refactor(payment): extract gateway client into its own package'],
        ['perf', 'Peningkatan performa', 'perf(search): cache the category tree for 5 minutes'],
        ['test', 'Menambah atau memperbaiki tes', 'test(cart): cover empty cart and expired coupon cases'],
        ['build', 'Build system atau dependency', 'build: upgrade Node.js to 22 in the Dockerfile'],
        ['ci', 'Konfigurasi CI', 'ci: run integration tests on pull requests'],
        ['chore', 'Pekerjaan rutin lain yang tidak mengubah src/test', 'chore: remove unused environment variables'],
        ['style', 'Format saja (spasi, titik koma), bukan CSS', 'style: apply gofmt to handlers'],
        ['feat!', 'Breaking change', 'feat(api)!: remove the v1 orders endpoint'],
      ]),
      code('Commit lengkap: subject, body, footer', `fix(orders): prevent duplicate refunds on webhook retry

The payment gateway retries a webhook when it doesn't receive a 2xx
response within 10 seconds. Our handler sometimes took longer than
that, so the same refund was processed twice.

Store the gateway event ID and skip events that were already
processed. Return 200 for duplicates so the gateway stops retrying.

Refs: PAY-482`, 'text'),
      code('Menulis subject + body dari terminal', `# Setiap -m menjadi paragraf terpisah (subject, lalu body)
git commit -m "fix(orders): prevent duplicate refunds on webhook retry" \\
  -m "Store the gateway event ID and skip events that were already processed."

# Cek apakah riwayat Anda terbaca sebagai daftar perubahan
git log --oneline -10`, 'bash'),
      callout('tip', 'Huruf kapital setelah type?', 'Aturan cbea.ms meminta subject diawali huruf kapital (*Fix crash…*). Dengan Conventional Commits, banyak tim menulis deskripsi huruf kecil setelah type (*fix: prevent…*), dan commitlint default menolak beberapa bentuk kapital. Keduanya diterima; ikuti konvensi repo Anda dan jaga konsistensi.'),

      heading('Pull request description'),
      paragraph('PR description menjawab pertanyaan reviewer sebelum mereka bertanya: apa yang berubah, kenapa, bagaimana mengujinya, dan apa risikonya. Reviewer yang memahami *why* memberi review yang lebih baik dan lebih cepat.'),
      textTabs(
        ['Template', 'PR template (markdown)', `## Summary
One or two sentences: what this PR does.

## Why
The problem, the ticket, or the user impact. Link: PAY-123

## Changes
- Main change 1
- Main change 2

## How to test
1. Step one
2. Step two
3. Expected result

## Screenshots / sample output
Before/after for UI changes, or a sample request/response for API changes.

## Risks and rollback
What could break, who is affected, and how to roll back
(revert, feature flag, migration down).`],
        ['Contoh terisi', 'PR #231: prevent duplicate refunds', `## Summary
Prevent duplicate refunds when the payment gateway retries a webhook.

## Why
The gateway retries webhooks that take longer than 10 seconds. Our
handler sometimes took 12-15 seconds, so 37 refunds were processed
twice last week (PAY-482).

## Changes
- Add a \`processed_events\` table with a unique index on \`event_id\`
- Skip events that were already processed and return 200
- Move the slow ledger update to a background job

## How to test
1. Run \`make test\` (new tests in \`refund_handler_test.go\`)
2. On staging, send the same webhook twice:
   \`./scripts/replay-webhook.sh evt_123\`
3. Check that only one refund row exists for \`evt_123\`

## Risks and rollback
- The migration adds a new table only, so it is safe to roll back.
- If the background job fails, refunds still succeed but the ledger
  update is delayed. An alert fires after 5 minutes.
- Rollback: revert this PR; the table can stay.`],
      ),

      heading('Bug report yang bisa direproduksi'),
      paragraph('Judul bug report yang baik mengikuti pola **[di mana] apa yang terjadi + kapan/kondisinya**. Isi minimalnya: environment, langkah reproduksi bernomor, expected vs actual, bukti (log, request ID, screenshot), frekuensi, dan severity beserta dampaknya. Pisahkan fakta dari dugaan: tulis dugaan di bagian *Notes*.'),
      textTabs(
        ['Template', 'Bug report template', `Title: [Environment] What happens + when it happens

Environment: env, service and version (or commit), OS/browser if relevant
Steps to reproduce:
  1. ...
  2. ...
Expected result: ...
Actual result: ...
Logs / evidence: request ID, stack trace, screenshot
Frequency: always / intermittent (3 out of 10) / once
Severity and impact: who is affected and how badly
Notes: suspected cause, workarounds, related tickets`],
        ['Contoh terisi', 'Bug report: orders endpoint', `Title: [Staging] GET /orders returns 500 when filtering by status=paid

Environment: staging, orders-service v2.14.0 (commit 3e1f9a2), PostgreSQL 16
Steps to reproduce:
  1. Log in as qa-user@example.com
  2. Call GET /orders?status=paid
Expected result: 200 with a list of paid orders
Actual result: 500 Internal Server Error, body {"error":"internal"}
Logs / evidence:
  ERROR orders.repo: pq: column "paid_at" does not exist
  request_id=7f3a91c
Frequency: always (5 out of 5 attempts) since 3 Nov, 09:00 UTC
Severity and impact: high. Blocks QA for the checkout release.
  Production is not affected.
Notes: started after migration 0042 was merged. The migration may
  not have run on staging.`],
      ),

      heading('README: halaman depan proyek'),
      paragraph('README menjawab, dengan urutan ini: *proyek apa ini, kenapa ada, bagaimana menjalankannya, bagaimana memakainya, dan siapa yang bisa ditanya*. Tulis langkah instalasi sebagai perintah yang bisa disalin, uji langkahnya di mesin bersih, dan jangan menganggap pembaca tahu konteks internal.'),
      code('Kerangka README', `# orders-service

Manages customer orders and refunds for the Example store.

## Requirements
- Go 1.23+
- Docker and Docker Compose

## Getting started
1. Copy the environment file: cp .env.example .env
2. Start the dependencies: docker compose up -d
3. Run the service: make run

## Configuration
| Variable       | Description                  | Default |
|----------------|------------------------------|---------|
| DATABASE_URL   | PostgreSQL connection string | -       |
| PORT           | HTTP port                    | 8080    |

## Usage
Example request and response for the main endpoints.

## Running tests
make test

## Deployment
How releases happen, or a link to the runbook.

## Contributing
Branch naming, commit convention, how to request a review.

## Owners
Payments team, #team-payments on Slack`, 'text'),

      heading('ADR, RFC & design doc: frasa yang sering dipakai'),
      paragraph('**ADR** (Architecture Decision Record) mencatat satu keputusan: *Context → Decision → Consequences*, sering ditambah *Status* dan *Alternatives considered*. **RFC** atau **design doc** lebih panjang dan dipakai *sebelum* keputusan untuk meminta masukan. Bahasa di keduanya harus netral dan berbasis alasan: tunjukkan trade-off, jangan hanya kelebihan pilihan Anda.'),
      vocab([
        ['Context / Background', 'Situasi dan masalah yang memicu keputusan', 'Our order table has grown to 400 million rows, and reporting queries now take minutes.'],
        ['We propose…', 'Kami mengusulkan… (RFC/design doc)', 'We propose moving reporting queries to a read replica.'],
        ['Decision', 'Keputusan yang diambil (ADR)', 'We will use PostgreSQL logical replication for the reporting database.'],
        ['Consequences', 'Akibat keputusan, positif maupun negatif', 'Reports may be up to 30 seconds behind the primary database.'],
        ['Alternatives considered', 'Opsi lain yang dipertimbangkan dan alasannya ditolak', 'We considered a nightly ETL job, but it would make reports up to 24 hours old.'],
        ['Trade-off', 'Kompromi: mendapat X dengan mengorbankan Y', 'The trade-off is higher infrastructure cost in exchange for faster reports.'],
        ['in favor of… / at the cost of…', 'memilih… / dengan mengorbankan…', 'We chose consistency at the cost of higher write latency.'],
        ['Goals / Non-goals', 'Yang ingin dicapai / yang sengaja tidak dikejar', 'Non-goal: real-time dashboards.'],
        ['Out of scope', 'Di luar cakupan dokumen ini', 'Migrating historical data is out of scope for this phase.'],
        ['Open questions', 'Pertanyaan yang belum terjawab', 'Open question: who owns the replica during incidents?'],
        ['Assumptions', 'Asumsi yang dipakai', 'We assume traffic will not exceed 2,000 requests per second this year.'],
        ['Superseded by…', 'Digantikan oleh keputusan lain', 'Status: superseded by ADR-0012.'],
      ]),
      code('Kerangka ADR (format Michael Nygard)', `# ADR-0007: Use a read replica for reporting queries

Status: Accepted (2026-11-04)

## Context
Reporting queries on the primary database take up to 3 minutes and
slow down checkout during business hours.

## Decision
We will move all reporting queries to a PostgreSQL read replica.

## Alternatives considered
- Nightly ETL to a data warehouse: rejected, reports would be up to
  24 hours old.
- Bigger primary instance: rejected, it only delays the problem.

## Consequences
- Checkout latency is no longer affected by reports.
- Reports can lag the primary by up to 30 seconds.
- We pay for one more database instance.`, 'text'),

      heading('Grammar yang paling sering muncul'),
      paragraph('**Artikel (a/an/the).** Bahasa Indonesia tidak punya artikel, sehingga artikel paling sering hilang dari tulisan kita. Aturan praktisnya: **singular countable noun hampir selalu butuh determiner** (a, an, the, this, our, each). Pakai *a/an* saat pertama kali menyebut sesuatu yang tidak spesifik, *the* saat pembaca tahu yang mana. Plural atau uncountable dalam arti umum tidak memakai artikel: *Logs are stored in S3.* Pilihan *a* atau *an* ditentukan **bunyi**, bukan huruf: *an API, an HTTP request, an hour, a URL, a UUID, a user*. Untuk SQL, *an SQL query* (es-kyu-el) dan *a SQL query* (sequel) sama-sama dipakai.'),
      table(['Salah', 'Benar'], [
        ['Endpoint returns list of orders.', 'The endpoint returns a list of orders.'],
        ['Function return error if user not found.', 'The function returns an error if the user isn\'t found.'],
        ['Please check attached file.', 'Please check the attached file.'],
        ['We use the Redis for caching.', 'We use Redis for caching. (nama produk tanpa the)'],
      ]),
      table(['Kata', 'Jenis', 'Hindari', 'Gunakan'], [
        ['data', 'Di tulisan teknis umumnya uncountable (bentuk jamak *the data are* juga diterima; pilih satu)', 'datas', 'The data is stored in S3. / a data set, some data'],
        ['feedback', 'Uncountable', 'feedbacks, a feedback', 'some feedback, a piece of feedback, two comments'],
        ['information', 'Uncountable', 'informations', 'more information, a piece of information, details'],
        ['code (source code)', 'Uncountable', 'many codes, a code (untuk kode program)', 'some code, a code snippet, this code. Countable untuk *error codes* dan *discount codes*.'],
        ['software / hardware', 'Uncountable', 'softwares', 'software, software packages, tools'],
        ['documentation', 'Uncountable', 'documentations', 'documentation, the docs, a document'],
        ['access', 'Uncountable', 'request an access', 'request access to staging'],
        ['advice / knowledge / progress', 'Uncountable', 'advices, knowledges', 'some advice, a tip; good progress'],
      ]),
      callout('warn', 'Kesalahan khas developer Indonesia dalam tulisan teknis', '**(1) Artikel hilang**: *"Endpoint returns list"* → *"The endpoint returns a list"*. **(2) -s orang ketiga hilang**: *"The function return"* → *"returns"*. **(3) Uncountable dijamakkan**: *informations, feedbacks, softwares, codes*. **(4) Tense campur di commit**: *Fixed…, Adding…, Fix…* dalam satu PR; pilih imperatif. **(5) Subject commit yang tidak informatif**: *"fix bug", "update", "revisi"*. **(6) Kalimat panjang dengan banyak** *and* hasil terjemahan dari kalimat Indonesia yang panjang; pecah menjadi beberapa kalimat. **(7) Campur bahasa** di repo internasional (*"fix bug di handler"*): tulis seluruhnya dalam English.'),

      heading('Checklist self-review sebelum klik "Create"'),
      list([
        'Kalimat pertama menjawab *apa* dan kalimat kedua menjawab *kenapa*.',
        'Semua instruksi berbentuk imperatif dan bernomor bila berurutan.',
        'Tidak ada passive voice yang menyembunyikan pelaku tanpa alasan.',
        'Istilah konsisten: satu nama untuk satu konsep di seluruh dokumen.',
        'Setiap singular countable noun punya artikel atau determiner.',
        'Tidak ada *informations, feedbacks, softwares, datas*.',
        'Tidak ada *simply, just, easy, obviously*.',
        'Angka, versi, env, dan zona waktu ditulis eksplisit.',
        'Perintah dan nama file ada di code formatting dan bisa disalin.',
        'Baca sekali dengan suara keras atau jalankan spell/grammar checker.',
      ], true),

      ...practice('english-technical-writing', [
        'Tulis ulang 3 commit terakhir Anda dalam format Conventional Commits. Kriteria: type yang tepat, subject imperatif di bawah 72 karakter, dan minimal satu commit memiliki body yang menjelaskan why.',
        'Tulis PR description untuk pekerjaan terakhir Anda memakai template di atas. Kriteria: ada Summary, Why, How to test yang bisa diikuti orang lain, dan Risks/rollback.',
        'Ubah satu laporan bug informal (misalnya "checkout error pas bayar") menjadi bug report lengkap. Kriteria: judul berpola [env] apa + kondisi, langkah bernomor, expected vs actual terpisah, ada bukti dan severity.',
        'Audit README salah satu repo Anda. Kriteria: orang baru bisa menjalankan proyek hanya dengan mengikuti README, tanpa bertanya.',
        'Tulis ADR singkat (maksimal satu halaman) untuk satu keputusan teknis nyata. Kriteria: Context, Decision, minimal dua Alternatives considered, dan Consequences yang memuat sisi negatif.',
        'Tandai semua noun di satu paragraf dokumentasi Anda, lalu periksa artikel dan bentuk jamaknya. Kriteria: tidak ada singular countable noun tanpa determiner dan tidak ada uncountable yang dijamakkan.',
      ]),
      ...quiz([
        ['ENW-06', 'Tulis ulang commit "Fixed bug on login page." menjadi Conventional Commits yang baik untuk perbaikan: user yang memilih "remember me" ter-logout setelah 1 jam.', 'Contoh: "fix(auth): keep remember-me sessions for 30 days". Type fix, scope auth, deskripsi imperatif (keep, bukan kept/keeping), spesifik tentang perilaku, tanpa titik. Body bisa menjelaskan why: "The session TTL ignored the remember-me flag, so all sessions expired after 1 hour."'],
        ['ENW-07', 'Perbaiki kalimat dokumentasi: "Simply, the request will be validated by the gateway and if it is failed then error will be returned."', 'Contoh: "The gateway validates the request. If validation fails, the gateway returns a 400 error." Perubahan: hapus simply, passive menjadi active, will menjadi present tense, kalimat dipecah dua, artikel ditambahkan, dan "is failed" (salah) menjadi "fails".'],
        ['ENW-08', 'Temukan dan perbaiki kesalahan: "Please give me some feedbacks about the informations in documentations."', 'Feedback, information, dan documentation adalah uncountable. Benar: "Could you give me some feedback on the information in the documentation?" Perhatikan juga preposisi: feedback on (bukan about) lebih umum, dan bentuk pertanyaan Could you… lebih sopan daripada Please give me.'],
        ['ENW-09', 'Apa beda isi bagian "Expected result" dan "Actual result" di bug report, dan kenapa dugaan penyebab tidak ditaruh di sana?', 'Expected result adalah perilaku yang seharusnya terjadi (menurut spesifikasi atau akal sehat); actual result adalah apa yang benar-benar terjadi, termasuk status code atau pesan error. Keduanya fakta yang bisa diverifikasi. Dugaan penyebab ditaruh di Notes supaya pembaca tidak terarah ke diagnosis yang mungkin salah.'],
        ['ENW-10', 'Dalam design doc, tulis satu kalimat yang menyatakan trade-off memakai cache Redis untuk halaman produk.', 'Contoh: "Caching product pages in Redis reduces median latency from 300 ms to 40 ms, at the cost of showing prices that can be up to 60 seconds out of date." Kalimat trade-off yang baik menyebut keuntungan dan kerugiannya, idealnya dengan angka.'],
      ]),
      heading('Referensi'),
      references(
        ['Google developer documentation style guide', 'https://developers.google.com/style'],
        ['Microsoft Writing Style Guide', 'https://learn.microsoft.com/en-us/style-guide/welcome/'],
        ['Conventional Commits 1.0.0', 'https://www.conventionalcommits.org/'],
        ['Chris Beams: How to Write a Git Commit Message', 'https://cbea.ms/git-commit/'],
        ['plainlanguage.gov: Federal Plain Language Guidelines', 'https://www.plainlanguage.gov/guidelines/'],
      ),
    ],
  },

  // ───────────────────────────── 3. Code Review ─────────────────────────────
  {
    id: 'english-code-review-feedback',
    title: 'Code Review & Feedback Tertulis',
    summary: 'Label komentar ala Conventional Comments (nit, suggestion, question, issue, praise), pola kalimat yang melunakkan kritik, meminta klarifikasi, berbeda pendapat dengan sopan, menanggapi feedback, pesan approval, serta feedback untuk dokumen dan desain.',
    track: PRO, source: englishProWritingSource, duration: '1 jam', level: 'Med',
    blocks: [
      paragraph('Komentar code review adalah teks tanpa nada suara dan tanpa ekspresi wajah. Kalimat yang di kepala Anda terdengar netral, misalnya *"Why did you do this?"*, bisa dibaca sebagai tuduhan oleh rekan di benua lain. Sebaliknya, komentar yang terlalu halus (*"maybe it could possibly be better if…"*) membuat penulis PR tidak tahu apakah itu wajib diubah atau sekadar saran.'),
      paragraph(`Tujuan modul ini: menulis komentar yang **jelas tingkat kepentingannya**, **fokus pada kode, bukan pada orangnya**, dan **menjelaskan alasan**. Untuk teknik melunakkan kalimat secara umum, lihat ${l('Bahasa Diplomatis', 'english-diplomatic')} dan ${l('Modal Verbs', 'english-modal-verbs')}; singkatan seperti LGTM dan PTAL ada di ${l('Phrasal Verbs & Jargon Developer', 'phrasal-verbs-jargon-untuk-developer')}.`),

      heading('Label komentar: Conventional Comments'),
      paragraph('[Conventional Comments](https://conventionalcomments.org/) adalah konvensi agar setiap komentar diawali label yang menyatakan maksudnya: `<label> [decorations]: <subject>`, diikuti diskusi opsional. Decoration seperti `(non-blocking)`, `(blocking)`, atau `(if-minor)` memperjelas apakah komentar menghalangi merge. Banyak tim memakai versi ringkas tanpa mengikuti spesifikasi penuh, misalnya `nit:` (dari *nitpick*, sudah dipakai jauh sebelum Conventional Comments) atau `blocking:`.'),
      table(['Label', 'Maksud', 'Contoh'], [
        ['praise:', 'Pujian yang tulus dan spesifik', 'praise: Nice use of table-driven tests here, very easy to extend.'],
        ['nitpick: / nit:', 'Hal kecil, selera; tidak menghalangi merge', 'nit: I\'d name this `pendingOrders` instead of `list2`.'],
        ['suggestion:', 'Usulan perbaikan; jelaskan kenapa', 'suggestion: Could we pass the clock in? It would make the expiry logic easier to test.'],
        ['issue:', 'Masalah nyata; pasangkan dengan suggestion bila bisa', 'issue (blocking): This query runs once per item (N+1). For 1,000 items that\'s 1,000 queries.'],
        ['question:', 'Bertanya, belum tentu ada masalah', 'question: Is this endpoint called by the mobile app too?'],
        ['thought:', 'Ide yang muncul, tidak menuntut tindakan', 'thought: Long term, this could become a shared middleware.'],
        ['todo:', 'Perubahan kecil yang perlu dilakukan', 'todo: Please add this env variable to `.env.example`.'],
        ['chore:', 'Tugas proses sebelum merge', 'chore: Please update the changelog before merging.'],
        ['note:', 'Informasi untuk pembaca', 'note: This config is also read by the billing job.'],
      ]),
      code('Contoh komentar dengan label dan decoration', `suggestion (non-blocking): Could we use errors.Is here instead of comparing strings?
String matching breaks if the message changes.

issue (blocking): The migration drops the column before the new code is deployed.
During the rollout, old pods will fail. Could we split it into two migrations?

question: What happens if the gateway returns a 200 with an empty body?

praise: The retry test with a fake clock is really clear. Thanks for adding it!`, 'text'),

      heading('Pola kalimat untuk melunakkan tanpa mengaburkan'),
      paragraph('Melunakkan bukan berarti tidak jelas. Pola di bawah membuat komentar terdengar kolaboratif, tetapi isinya tetap spesifik: *apa* yang ingin diubah dan *kenapa*. Pakai *we* untuk kode bersama (*"Could we…"*) dan bicarakan kodenya, bukan orangnya (*"This function…"*, bukan *"You…"*).'),
      vocab([
        ['What do you think about…?', 'Bagaimana kalau…? (mengajak diskusi)', 'What do you think about moving this check into the validator?'],
        ['Could we…?', 'Bisakah kita…? (usulan, kepemilikan bersama)', 'Could we return early here to reduce nesting?'],
        ['Have you considered…?', 'Sudah mempertimbangkan…?', 'Have you considered using a database transaction for these two writes?'],
        ['I might be missing something, but…', 'Mungkin saya melewatkan sesuatu, tapi…', 'I might be missing something, but where is the lock released if this returns an error?'],
        ['I wonder if…', 'Saya penasaran apakah…', 'I wonder if this would be simpler with a map instead of a switch.'],
        ['It might be worth…', 'Mungkin layak…', 'It might be worth adding a metric here so we notice when retries spike.'],
        ['One option would be to…', 'Salah satu opsinya adalah…', 'One option would be to cache the result for the length of the request.'],
        ['Would it make sense to…?', 'Apakah masuk akal untuk…?', 'Would it make sense to split this PR into the migration and the feature?'],
        ['Not blocking, but…', 'Tidak menghalangi merge, tapi…', 'Not blocking, but a short comment explaining the magic number would help.'],
        ['Feel free to ignore', 'Boleh diabaikan', 'nit: Personal preference, feel free to ignore.'],
      ]),

      heading('Meminta klarifikasi'),
      list([
        '*"Could you help me understand why … ?"*: jauh lebih lunak daripada *"Why did you … ?"*.',
        '*"What\'s the reason for … here?"*: bertanya tentang keputusan, bukan menyalahkan orangnya.',
        '*"Just to make sure I understand: this runs only for new users, right?"*: memastikan pemahaman sebelum memberi saran.',
        '*"Is this intended to handle … , or is that covered somewhere else?"*: menunjukkan Anda sudah mencari.',
        '*"Could you add a comment explaining this? It wasn\'t obvious to me, so it probably won\'t be for the next reader."*: meminta dokumentasi tanpa terdengar menuntut.',
        '*"I\'m not sure I follow. Do you mean A or B?"*: saat membalas komentar reviewer yang ambigu.',
      ]),

      heading('Berbeda pendapat dengan sopan dan menjelaskan trade-off'),
      paragraph('Sebagai penulis PR, Anda **boleh** tidak setuju dengan reviewer. Yang membuat perbedaan pendapat terasa profesional adalah urutannya: **akui poin mereka → jelaskan alasan Anda dengan fakta → sebutkan trade-off → tawarkan jalan keluar**. Jika thread sudah lebih dari dua kali bolak-balik, pindahkan ke call singkat lalu tulis kesimpulannya di PR.'),
      textTabs(
        ['Mempertahankan pilihan', 'Penulis PR menjawab reviewer', `Reviewer:
suggestion: Could we use a message queue here instead of a goroutine?

Author:
I see the appeal, and a queue would give us retries for free. I went
with a goroutine because this job runs about 10 times a day and takes
under a second, so a new queue felt like extra infrastructure to
maintain. The trade-off is that a job is lost if the pod restarts
mid-run; for this report that's acceptable because it reruns hourly.
Happy to switch if you feel strongly or if you see a case I'm missing.`],
        ['Menunda ke follow-up', 'Setuju, tapi tidak di PR ini', `Fair point, the error handling in this package is inconsistent.
I'd prefer to keep this PR focused on the refund fix so it can go out
today, and handle the cleanup separately. I've created PAY-501 for it.
Does that work for you?`],
        ['Reviewer tidak setuju', 'Reviewer menyampaikan keberatan', `issue (blocking): I'm not convinced the cache is safe here. Prices can
change during a flash sale, and a 10-minute TTL means customers could
see a price we no longer honour at checkout. Could we either shorten
the TTL to 30 seconds or invalidate on price updates? Let me know if
you'd like to talk it through on a quick call.`],
      ),

      heading('Menanggapi feedback'),
      vocab([
        ['Good catch, fixed in abc123.', 'Tangkapan bagus, sudah diperbaiki di commit abc123', 'Good catch, fixed in 9f2c1d4.'],
        ['Done. / Updated.', 'Sudah dikerjakan (sertakan commit bila bisa)', 'Done in 4e7a0b2.'],
        ['Thanks, I didn\'t know about…', 'Terima kasih, saya belum tahu tentang…', "Thanks, I didn't know about slices.Contains. Switched to it."],
        ['I kept X because…, happy to change if you feel strongly.', 'Saya pertahankan X karena…, siap diubah bila Anda merasa penting', 'I kept the explicit loop because it\'s easier to debug, happy to change if you feel strongly.'],
        ['Fair point. I\'ve moved it to a follow-up: …', 'Masuk akal; saya pindahkan ke tiket terpisah', "Fair point. I've moved it to a follow-up: PAY-501."],
        ['I\'m not sure I follow. Could you give an example?', 'Saya belum menangkap maksudnya; boleh contoh?', "I'm not sure I follow. Could you give an example of the input that breaks?"],
        ['Resolving this, since…', 'Saya tutup thread ini karena…', 'Resolving this, since we agreed on the call to keep the current approach.'],
        ['PTAL (please take another look)', 'Mohon dilihat lagi setelah perubahan', 'Addressed all comments, PTAL.'],
      ]),

      heading('Pesan approval yang bermakna'),
      paragraph('*"LGTM"* sendirian sah-sah saja, tetapi approval yang menyebut apa yang Anda periksa memberi rasa percaya diri kepada penulis dan memberi tahu tim seberapa dalam review dilakukan.'),
      list([
        '*"LGTM! Nice work on the retry tests; the edge cases are well covered."*',
        '*"Approving. I left two nits, feel free to address them or ignore them."*',
        '*"Approved with one suggestion. No need for another review after you address it."*',
        '*"I reviewed the API and migration parts; I\'m not familiar with the frontend changes, so it would be good to get a second reviewer for those."*',
        '*"Looks good overall, but I\'d like the migration issue fixed before merge, so I\'m requesting changes for now."*',
      ]),

      heading('Feedback untuk dokumen dan desain'),
      paragraph('Untuk design doc, RFC, atau mockup, mulailah dari **gambaran besar** lalu turun ke detail. Pembaca perlu tahu dulu apakah Anda setuju dengan arahnya, baru kemudian soal wording.'),
      vocab([
        ['The overall direction makes sense to me.', 'Arah besarnya masuk akal bagi saya', 'The overall direction makes sense to me. My main concern is the migration plan.'],
        ['My main concern is…', 'Kekhawatiran utama saya adalah…', 'My main concern is how we roll back if the replica falls behind.'],
        ['This section would be easier to follow with…', 'Bagian ini lebih mudah diikuti dengan…', 'Section 3 would be easier to follow with a sequence diagram.'],
        ['Could you add numbers to support…?', 'Bisa tambahkan angka untuk mendukung…?', 'Could you add numbers to support the latency estimate?'],
        ['I\'d suggest moving X to "Out of scope".', 'Saya sarankan X dipindah ke Out of scope', "I'd suggest moving the admin UI to Out of scope for phase 1."],
        ['+1 to …\'s point about…', 'Setuju dengan poin … tentang…', "+1 to Sarah's point about data retention."],
        ['Minor wording suggestions inline; none are blocking.', 'Saran wording kecil ada di komentar; tidak ada yang menghalangi', 'Minor wording suggestions inline; none are blocking.'],
      ]),

      heading('Terlalu blunt → lebih baik'),
      table(['Terlalu blunt', 'Lebih baik', 'Yang berubah'], [
        ['This is wrong.', 'issue: This returns the wrong total when a discount applies. Could we apply the discount before tax?', 'Apa yang salah + kapan + usulan.'],
        ['Why did you do this?', 'question: What\'s the reason for using a goroutine here? I\'m wondering how errors get reported.', 'Bertanya tentang keputusan, sebut kekhawatirannya.'],
        ['Don\'t use global variables.', 'suggestion: Could we pass the config in instead of using a global? It would make this easier to test.', 'Kita + alasan.'],
        ['Bad naming.', 'nit: `data2` is a bit hard to follow. Maybe `pendingOrders`?', 'Label + contoh konkret.'],
        ['You forgot the tests.', 'Could we add a test for the empty-cart case?', 'Fokus ke kode, spesifik.'],
        ['This is slow.', 'This runs one query per item (N+1). For 1,000 items that\'s 1,000 queries. Could we batch them?', 'Dampak dengan angka.'],
        ['Use library X.', 'Have you considered library X? It already handles retries and backoff.', 'Pertanyaan + manfaat.'],
        ['No, it\'s fine. (membalas reviewer)', 'I think it\'s OK as is, because the input is already validated in the handler. Let me know if I\'m missing a case.', 'Alasan + terbuka pada koreksi.'],
      ]),
      callout('info', 'Catatan budaya: tingkat keterusterangan berbeda', 'Ada tim yang terbiasa sangat lugas (*"This won\'t work, the lock is never released."*) dan ada yang membungkus setiap kritik dengan pujian. Keduanya bukan soal benar-salah; amati gaya tim Anda selama beberapa minggu dan ikuti. Yang berlaku di mana pun: komentari **kode, bukan orang**; jelaskan **alasan**; dan bedakan dengan jelas mana yang **wajib** dan mana yang **opsional**.'),
      callout('warn', 'Kesalahan khas reviewer & penulis PR Indonesia', '**(1) Minta maaf berlebihan**: *"Sorry, sorry, my bad, so sorry for the mistake"* untuk typo; cukup *"Good catch, fixed in abc123."* Simpan *sorry* untuk dampak nyata (misalnya merusak production). **(2) Terlalu sungkan sehingga kabur**: *"Maybe it\'s better if… but up to you"* untuk bug serius; pakai label `issue (blocking):`. **(3) Terjemahan langsung yang ketus**: *"Why you not use transaction?"* → *"Have you considered using a transaction here?"* **(4) Membalas hanya "ok" atau "done"** tanpa commit; reviewer harus mencari sendiri. **(5) Diam saat tidak setuju** lalu mengubah kode dengan berat hati; lebih baik jelaskan alasan Anda sekali dengan sopan.'),

      ...practice('english-code-review-feedback', [
        'Ambil 5 komentar review yang pernah Anda tulis atau terima, lalu tulis ulang dengan label Conventional Comments. Kriteria: setiap komentar punya label, yang menghalangi merge ditandai (blocking), dan setiap suggestion punya alasan.',
        'Tulis ulang 3 komentar dari tabel "terlalu blunt" dengan kasus dari kode Anda sendiri. Kriteria: fokus pada kode, ada alasan atau dampak, tidak ada "you forgot" atau "why did you".',
        'Tulis balasan untuk reviewer yang meminta perubahan yang tidak Anda setujui. Kriteria: mengakui poin reviewer, alasan berbasis fakta, menyebut trade-off, dan menawarkan jalan keluar (follow-up atau call).',
        'Balas 3 komentar review terakhir di PR Anda memakai frasa dari bagian "Menanggapi feedback". Kriteria: setiap balasan menyertakan commit hash atau tiket follow-up.',
        'Tulis satu pesan approval yang menyebut apa yang Anda periksa dan apa yang tidak. Kriteria: lebih dari sekadar "LGTM", maksimal 3 kalimat.',
        'Beri feedback tertulis pada satu design doc atau README rekan Anda. Kriteria: dibuka dengan pendapat tentang arah besar, satu kekhawatiran utama, lalu saran detail yang ditandai non-blocking.',
      ]),
      ...quiz([
        ['ENW-11', 'Tulis ulang komentar review: "Why you not handle the error? This is wrong."', 'Contoh: "issue (blocking): If db.Save fails here, the error is ignored and the API still returns 200. Could we return the error so the client knows the order wasn\'t saved?" Grammar diperbaiki, komentar fokus pada kode dan dampaknya, dan ada usulan konkret. Label blocking jelas karena ini bug nyata.'],
        ['ENW-12', 'Apa beda "nit:" dan "issue (blocking):", dan kenapa label itu penting di tim remote?', 'nit adalah hal kecil atau selera yang tidak menghalangi merge; issue (blocking) adalah masalah yang harus diselesaikan sebelum merge. Di tim remote, penulis PR sering membaca komentar saat reviewer sedang offline; label membuat mereka bisa memprioritaskan tanpa menunggu klarifikasi dan mencegah salah paham bahwa setiap komentar adalah perintah.'],
        ['ENW-13', 'Reviewer menemukan typo di nama variabel Anda. Tulis balasan yang tepat, lalu jelaskan kenapa "So sorry, my mistake, I will be more careful next time" kurang ideal.', 'Balasan: "Good catch, fixed in 3b8e21f." Permintaan maaf panjang untuk hal kecil terdengar berlebihan, menggeser fokus dari kode ke perasaan, dan bisa membuat reviewer canggung memberi komentar berikutnya. Simpan permintaan maaf untuk kesalahan berdampak nyata.'],
        ['ENW-14', 'Reviewer menyarankan memakai Redis untuk menyimpan session, tetapi Anda memilih JWT stateless. Tulis balasan yang tidak setuju dengan sopan.', 'Contoh: "I see the benefit, since Redis would let us revoke sessions immediately. I went with stateless JWTs because this service runs in three regions and a shared Redis would add cross-region latency to every request. The trade-off is that revocation takes up to 15 minutes (the token TTL). Happy to revisit if instant revocation becomes a requirement, or we can discuss it on a quick call." Akui poinnya, alasan, trade-off, tawarkan jalan keluar.'],
        ['ENW-15', 'Ubah approval "LGTM" menjadi approval yang lebih informatif untuk PR yang mengubah API dan frontend, padahal Anda hanya paham bagian API.', 'Contoh: "Approving the API changes: the validation and error codes look good, and the new tests cover the edge cases. I\'m not familiar with the frontend part, so it would be good to get a second reviewer for that." Approval menyebut apa yang diperiksa dan batas review Anda.'],
      ]),
      heading('Referensi'),
      references(
        ['Conventional Comments', 'https://conventionalcomments.org/'],
        ['Google Engineering Practices: How to write code review comments', 'https://google.github.io/eng-practices/review/reviewer/comments.html'],
        ['Google developer documentation style guide: Voice and tone', 'https://developers.google.com/style/tone'],
        ['Microsoft Writing Style Guide', 'https://learn.microsoft.com/en-us/style-guide/welcome/'],
      ),
    ],
  },
];
