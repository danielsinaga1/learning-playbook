import type { Block, Module, Track } from '../types';
import documents from './english-foundations-source.json';

export const englishFoundationTracks: Track[] = [
  { title: 'Grammar Dasar', summary: 'Parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection, dan determiner.' },
  { title: 'Struktur Kalimat', summary: 'Phrase, clause, sentence, serta pola simple, compound, complex, dan compound-complex.' },
  { title: 'Adjectives & Numbers', summary: 'Bentuk superlative, pengecualian, ordinal numbers, urutan, dan tanggal.' },
];
export const englishFoundationSources = documents.map((doc) => doc.filename);
const h = (text: string): Block => ({ type: 'h', text });
const p = (text: string): Block => ({ type: 'p', text });
const table = (head: string[], rows: string[][]): Block => ({ type: 'table', head, rows });
const note = (text: string): Block => ({ type: 'callout', tone: 'info', title: 'Catatan & penyempurnaan sumber', text });
const practice = (id: string, items: string[]): Block => ({ type: 'checklist', id: `english-foundations-${id}`, items });
const quiz = (id: string, items: [string, string][]): Block => ({ type: 'qa', items: items.map(([q, a], i) => ({ id: `ENF-${id}-${i + 1}`, q, a: [p(a)] })) });
const source = (index: number): Block => p(`[Lihat halaman asli & teks lengkap ${documents[index].filename}](#english.arsip-english-${documents[index].slug}).`);

/** Lessons are kept outside gen/ so a full source conversion cannot erase them. */
export const englishFoundationModules: Omit<Module, 'code'>[] = [
  {
    id: 'english-parts-noun-pronoun-verb', title: 'Parts of Speech: Noun, Pronoun & Verb',
    summary: 'Kenali kata benda, kata ganti, kata kerja, serta perannya dalam kalimat.',
    track: 'Grammar Dasar', source: documents[0].filename, level: 'Easy', duration: '35 menit',
    blocks: [
      p('Parts of speech mengelompokkan kata menurut fungsi dalam kalimat. Handout membahas delapan kelas kata tradisional serta determiner. Pelajari fungsi kata dalam konteks; kata yang sama dapat menjalankan fungsi berbeda.'),
      h('Noun: kata benda'),
      p('Noun menamai orang, tempat, benda, atau ide. Noun dapat menjadi subjek, objek kata kerja, atau objek preposisi: **The student** reads **a book** in **the library**. Bentuknya dapat singular atau plural.'),
      table(['Jenis noun', 'Makna', 'Contoh'], [
        ['Countable', 'Dapat dihitung; punya bentuk tunggal/jamak.', 'book/books, elephant, train'],
        ['Uncountable', 'Biasanya tidak dihitung langsung.', 'sand, love, happiness'],
        ['Common', 'Nama umum.', 'country, city, month'],
        ['Proper', 'Nama khusus; huruf awal kapital.', 'Switzerland, Jakarta, January'],
        ['Concrete', 'Dapat ditangkap indra.', 'bag, cake, building'],
        ['Abstract', 'Ide, keadaan, atau konsep.', 'friendship, time, imagination'],
        ['Collective', 'Kelompok sebagai satu kesatuan.', 'family, government, a herd of deer'],
      ]),
      note('Kategori noun dapat tumpang tindih: book adalah countable, common, dan concrete. Deer sendiri bukan collective noun; **a herd of deer** menyatakan kelompok. Deer dapat berbentuk tunggal maupun jamak.'),
      h('Pronoun: kata ganti'),
      table(['Jenis', 'Fungsi', 'Contoh'], [
        ['Personal', 'Menggantikan orang/benda sebagai subjek atau objek.', 'I, we, he, she; me, us, him, her'],
        ['Demonstrative', 'Menunjukkan sesuatu.', 'this, that, these, those'],
        ['Interrogative', 'Menanyakan identitas atau pilihan.', 'who, whom, what, which, whose'],
        ['Indefinite', 'Merujuk sesuatu yang tidak spesifik.', 'nothing, someone, everybody'],
        ['Possessive', 'Menyatakan kepemilikan tanpa noun sesudahnya.', 'mine, yours, hers, his'],
        ['Reciprocal', 'Tindakan timbal balik.', 'each other, one another'],
        ['Relative', 'Memperkenalkan klausa relatif.', 'who, whom, which, whose, that'],
        ['Reflexive', 'Objek kembali ke subjek.', 'I taught myself.'],
        ['Intensive', 'Menekankan pelaku; dapat dihapus tanpa merusak inti kalimat.', 'She herself wrote it.'],
      ]),
      p('**This/these** merujuk yang dekat; **that/those** yang jauh. This/that tunggal, these/those jamak: This is my book. These are my friends. That is your car. Those are beautiful flowers.'),
      p('Pertanyaan: **Who is coming to the party?** (subjek); **Whom did you invite?** (objek, formal); **What do you want to eat?**; **Which do you prefer?**; **Whose is this?**. Dalam Which book do you prefer? dan Whose jacket is this?, which/whose menentukan noun, sehingga berfungsi sebagai determiner.'),
      p('Relative clauses: The man **who called you** is waiting. The nanny **whom my mom hired yesterday** was a doctor. The car **which is parked outside** belongs to my sister. The dog **that is barking** belongs to us. The student **whose book is missing** is worried.'),
      note('Anywhere adalah adverb tempat, bukan indefinite pronoun. Pada That dog is barking loudly, **that** adalah determiner; contoh relative pronoun yang tepat ialah the dog **that is barking**. Who/whom biasanya merujuk orang; which merujuk benda atau hewan.'),
      h('Verb: tindakan, peristiwa & keadaan'),
      table(['Jenis', 'Fungsi', 'Contoh'], [
        ['Action verb', 'Menyatakan tindakan.', 'run, jump, eat; She reads a book.'],
        ['Linking verb', 'Menghubungkan subjek dengan pelengkap subjek.', 'be, seem, appear; She seems happy.'],
        ['Auxiliary verb', 'Membantu menyatakan aspek, pertanyaan, negasi, atau modalitas.', 'be, have, do; can, must, will'],
        ['Transitive', 'Memerlukan objek langsung dalam penggunaan tersebut.', 'She reads a book.'],
        ['Intransitive', 'Tidak memakai objek langsung.', 'The baby sleeps.'],
      ]),
      note('Linking verb menghubungkan subjek dengan **pelengkap**, bukan objek. Can, must, dan will adalah modal auxiliaries. Bandingkan She is happy (linking) dengan She is running (auxiliary).'),
      practice('parts', ['Tandai noun, pronoun, dan verb dalam lima kalimat sendiri.', 'Buat contoh pronoun sebagai subjek, objek, dan pemilik.', 'Bedakan linking verb dan auxiliary dalam dua kalimat dengan is.']),
      quiz('parts', [['Apa fungsi herself dalam She herself fixed the bug?', 'Intensive pronoun: menekankan bahwa dia sendiri yang memperbaikinya.'], ['Apakah happy merupakan objek dalam She seems happy?', 'Bukan. Happy adalah adjective sebagai pelengkap subjek setelah linking verb seems.']]),
      source(0),
    ],
  },
  {
    id: 'english-adjectives-adverbs', title: 'Parts of Speech: Adjectives & Adverbs',
    summary: 'Kata sifat, kata keterangan, posisi modifier, serta jenis dan contohnya.',
    track: 'Grammar Dasar', source: documents[0].filename, level: 'Easy', duration: '35 menit',
    blocks: [
      h('Adjective: menjelaskan noun atau pronoun'),
      p('Adjective menjelaskan sifat: a **careful** driver; the driver is **careful**. Attributive adjective berada sebelum noun, sedangkan predicative adjective menjadi pelengkap setelah linking verb, seperti be, seem, atau look.'),
      table(['Jenis / istilah dalam handout', 'Penjelasan & contoh'], [
        ['Absolute', 'Makna cenderung mutlak: perfect, complete. Penggunaan perbandingan dapat bergantung pada konteks.'],
        ['Attributive & predicative', 'A tall, slim, strong, short-haired girl. / The decision was unfair, unacceptable, and illogical.'],
        ['Comparative & superlative', 'It is easier to read than to write. / She is the most intelligent student in the class.'],
        ['Compound', 'Gabungan kata: well-known, high-tech, deep-blue, fast-paced; a well-known actor.'],
        ['Demonstrative', 'This house belongs to my uncle. This menentukan noun house.'],
        ['Possessive', 'Her girlfriend is beautiful. Her menyatakan pemilik.'],
        ['Quantitative', 'Jumlah: some, much, little; The goat ate all the food in the basket.'],
        ['Numeral', 'Bilangan/urutan: three books, the first meeting; This is the first time we have met.'],
        ['Interrogative', 'Which book did you borrow from the library?'],
        ['Distributive', 'Each, every, either, neither; Each of the two teachers had a red hat.'],
        ['Proper', 'Berasal dari nama khusus: Turkish culture, Indonesian athletes.'],
        ['Intensifier', 'Very dalam She is very happy adalah adverb yang menguatkan adjective happy.'],
        ['Participle', 'Bentuk -ed/-ing sebagai adjective: an experienced teacher, an interesting book.'],
        ['Noun as modifier', 'Noun menerangkan noun lain: a gold medal, a school bus.'],
      ]),
      note('Handout menggunakan beberapa istilah adjective tradisional. This, her, some, each, dan which sebelum noun dibahas pula sebagai **determiners**, sehingga tidak perlu dihafal sebagai dua daftar terpisah. Very adalah adverb; Indonesian adalah proper adjective, sedangkan gold pada gold medal adalah noun modifier. Excellent dapat dibandingkan dalam konteks tertentu, sehingga bukan contoh aturan mutlak yang aman.'),
      h('Adverb: menjelaskan verb, adjective, adverb, atau seluruh kalimat'),
      table(['Jenis', 'Contoh kata', 'Contoh kalimat'], [
        ['Manner: bagaimana', 'quickly, slowly, carefully, loudly, wisely', 'She sings beautifully. He drove carefully through the fog.'],
        ['Time: kapan', 'now, soon, later, yesterday, today, tomorrow, yet', 'We are going to see a movie tomorrow.'],
        ['Place: di mana', 'here, there, everywhere, nowhere', 'Put the book over there.'],
        ['Frequency: seberapa sering', 'always, never, often, sometimes, rarely, usually', 'I always eat breakfast before I go to school.'],
        ['Degree: tingkat', 'very, extremely, quite, too, barely, highly', 'That book is much too expensive.'],
        ['Conjunctive', 'however, therefore, besides, meanwhile, nonetheless', 'I wanted to go for a walk; however, it started to rain.'],
        ['Interrogative', 'when, where, why, how', 'When will you be back? How did it happen?'],
        ['Relative', 'where, when, why', 'I remember the place where I first met her.'],
        ['Demonstrative (istilah handout)', 'here, there', 'I left my keys here.'],
        ['Viewpoint & commenting', 'frankly, honestly, personally', 'Frankly, I do not like the idea.'],
        ['Intensifiers & mitigators', 'very, slightly, quite, almost', 'It is very hot today. She is slightly tired.'],
      ]),
      note('Kategori adverb dapat tumpang tindih. However bukan coordinating conjunction: jangan menghubungkan dua independent clauses hanya dengan koma. Gunakan titik atau titik koma: I wanted to go for a walk; however, it started to rain.'),
      p('Bandingkan **a careful driver** (adjective menerangkan driver) dengan **She drives carefully** (adverb menerangkan drives). Lanjutkan aturan perbandingan ke [Superlative & Ordinal Numbers](#english.english-superlative-ordinal).'),
      practice('modifiers', ['Buat tiga pasangan kalimat adjective/adverb.', 'Tandai attributive dan predicative adjective.', 'Gabungkan dua klausa dengan however dan tanda baca yang tepat.']),
      quiz('modifiers', [['Apa kelas kata very pada She is very happy?', 'Adverb of degree yang menerangkan adjective happy.'], ['Perbaiki: She drives careful.', 'She drives carefully. Carefully menerangkan cara mengemudi.']]), source(0),
    ],
  },
  {
    id: 'english-function-words', title: 'Parts of Speech: Prepositions, Conjunctions & Determiners',
    summary: 'Hubungan waktu/tempat, penghubung gagasan, kata seru, serta penentu noun.',
    track: 'Grammar Dasar', source: documents[0].filename, level: 'Easy', duration: '30 menit',
    blocks: [
      h('Preposition: hubungan antarkata'),
      p('Preposition umumnya diikuti noun phrase atau pronoun untuk membentuk prepositional phrase: in the garden, with her. Fungsinya menunjukkan waktu, tempat, arah, sebab, cara, atau hubungan lainnya.'),
      table(['Hubungan', 'Pola & contoh'], [
        ['Waktu', 'At: at 5 PM. On: on Monday, on 25 December. In: in July, in 2026.'],
        ['Tempat', 'The cat is in the box. The book is on the table. She is at the library.'],
        ['Gerakan', 'He walked to the park. She jumped into the pool. They walked across the street.'],
        ['Sebab / tujuan / penerima', 'The match was canceled because of the rain. This gift is for you.'],
        ['Cara / alat', 'She traveled by train. He cut the paper with scissors.'],
        ['Kepemilikan / hubungan', 'The cover of the book is blue. She is the one with the red bag.'],
      ]),
      p('Because of diikuti noun phrase: **because of the rain**. Because diikuti klausa: **because it rained**. For pada This gift is for you menunjukkan penerima; maknanya bergantung pada konteks.'),
      h('Conjunction & interjection'),
      table(['Kelas', 'Fungsi', 'Contoh'], [
        ['Coordinating conjunction', 'Menghubungkan unsur setara; FANBOYS: for, and, nor, but, or, yet, so.', 'I like coffee, and she likes tea.'],
        ['Subordinating conjunction', 'Memperkenalkan dependent clause.', 'Although it rained, we walked. I stayed because I was tired.'],
        ['Interjection', 'Menunjukkan emosi atau reaksi.', 'Wow! Ouch! Hey!'],
      ]),
      h('Determiner: memberi konteks pada noun'),
      table(['Jenis', 'Kata & penggunaan'], [
        ['Articles', 'The untuk referen tertentu; a/an untuk noun countable tunggal yang belum tertentu. I saw a cat. She wants an apple.'],
        ['Demonstratives', 'This/that + noun tunggal; these/those + noun jamak. This car is fast. Those trees are tall.'],
        ['Possessives', 'My, your, his, her, its, our, their. This is my book.'],
        ['Quantifiers', 'Some, many, few, all, much. I have some friends. Many people attended the event.'],
        ['Numbers', 'Jumlah tertentu: one, two, three. I have three apples.'],
        ['Distributives', 'Each, every, both. Each student must submit their assignment.'],
        ['Interrogatives', 'Which, what, whose sebelum noun. Which book do you prefer?'],
      ]),
      p('Pilih **a/an berdasarkan bunyi**, bukan huruf: an hour, a university. Many/few umumnya bersama countable nouns; much/little bersama uncountable nouns. Bandingkan **my book** (possessive determiner) dengan **the book is mine** (possessive pronoun).'),
      practice('function', ['Buat kalimat dengan at, on, dan in untuk waktu.', 'Bedakan because dan because of.', 'Buat pasangan this/these dan my/mine.']),
      quiz('function', [['Pilih: We met (in/on/at) Monday.', 'On Monday. On digunakan untuk hari atau tanggal.'], ['Apa perbedaan This is mine dan This book is mine?', 'This pada kalimat pertama berdiri sendiri sebagai demonstrative pronoun. Pada kalimat kedua, this menentukan noun book sebagai determiner. Mine adalah possessive pronoun pada keduanya.']]), source(0),
    ],
  },
  {
    id: 'english-sentence-structure', title: 'Phrase, Clause & Sentence Structure',
    summary: 'Gabungan Materi 2 dan 3: unsur kalimat, empat pola struktur, rumus, dan tanda baca.',
    track: 'Struktur Kalimat', source: `${documents[1].filename}; ${documents[2].filename}`, level: 'Easy', duration: '40 menit',
    blocks: [
      h('Dari phrase ke sentence'),
      table(['Unsur', 'Ciri', 'Contoh'], [
        ['Phrase', 'Kelompok kata yang membentuk satu unit; bukan pasangan subjek + predikat lengkap sebagai klausa.', 'the tall building; in the garden'],
        ['Independent clause (IC)', 'Memiliki subjek dan predikat serta dapat berdiri sendiri.', 'She enjoys reading books.'],
        ['Dependent clause (DC)', 'Dalam contoh dasar ini memiliki subjek dan verb, tetapi perlu klausa utama.', 'Although it was raining; when she arrives'],
        ['Sentence', 'Menyampaikan gagasan utuh, memiliki minimal satu IC, dan memakai tanda baca akhir yang sesuai.', 'Although it was raining, he went for a walk.'],
      ]),
      note('Phrase dapat mengandung noun atau verb; maksudnya bukan sama sekali tidak memiliki keduanya. **Is running** adalah verb phrase. Definisi klausa di sini berfokus pada finite clauses dasar. Pada imperative seperti Sit down!, subjek you tersirat.'),
      h('Jenis phrase dalam Materi 2'),
      table(['Jenis', 'Inti & fungsi', 'Contoh'], [
        ['Noun phrase', 'Berinti noun; dapat menjadi subjek atau objek.', 'the tall building; an interesting book'],
        ['Adjective phrase', 'Berinti adjective; menerangkan noun atau menjadi pelengkap.', 'full of energy; very beautiful'],
        ['Verb phrase', 'Main verb beserta auxiliary bila ada.', 'is running; have been waiting'],
        ['Prepositional phrase', 'Preposition beserta pelengkapnya.', 'in the garden; with a smile'],
      ]),
      h('Empat jenis sentence structure'),
      p('Hitung klausa, bukan panjang kalimat. S = subject, V = verb, IC = independent clause, DC = dependent clause. S + V adalah pola minimum untuk contoh tertentu; verb lain dapat memerlukan objek atau pelengkap.'),
      table(['Jenis', 'Karakteristik / pola', 'Contoh gabungan Materi 2 & 3'], [
        ['Simple', '1 IC; dapat memiliki subjek atau predikat majemuk.', 'I like coffee. She enjoys reading books.'],
        ['Compound', 'Minimal 2 IC; misalnya IC + koma + coordinating conjunction + IC.', 'I like coffee, and she likes tea. I wanted to go for a walk, but it started to rain.'],
        ['Complex', '1 IC + minimal 1 DC; urutannya dapat dibalik.', 'Although it was raining, we went for a walk. I will go to the party if I finish my homework.'],
        ['Compound-complex', 'Minimal 2 IC + minimal 1 DC.', 'Although it was raining, I went for a walk, and I enjoyed it.'],
      ]),
      p('Contoh Materi 3: **She likes to read books because they help her relax, but she does not have much time.** IC 1 = She likes to read books; DC = because they help her relax; IC 2 = she does not have much time. Jadi, kalimat ini compound-complex.'),
      h('Tanda baca & kekeliruan umum'),
      { type: 'list', items: [
        'DC di awal biasanya diikuti koma: Although it rained, we walked. DC setelah IC biasanya tidak memerlukan koma: We walked although it rained.',
        'Dua IC dapat digabung dengan koma + FANBOYS, titik koma, atau dipisah menjadi dua kalimat. Jangan memakai koma saja (comma splice).',
        'When she arrives. adalah fragment jika berdiri sendiri. Lengkapi: When she arrives, we will start.',
        'The sun is shining. adalah independent clause dan sekaligus simple sentence.',
        'Simple tidak selalu pendek: satu IC dapat memiliki banyak modifier. And yang hanya menghubungkan dua noun tidak otomatis membuat compound sentence.',
      ] },
      practice('sentence', ['Tandai subjek dan verb pada setiap klausa dalam empat contoh tabel.', 'Tulis satu kalimat untuk masing-masing dari empat pola.', 'Gabungkan When she arrives dengan IC dan tanda baca yang tepat.']),
      quiz('sentence', [['Klasifikasikan: I read books and write notes.', 'Simple sentence: satu independent clause dengan subjek I dan predikat majemuk.'], ['Klasifikasikan: Although it rained, I stayed, and she left.', 'Compound-complex: DC although it rained, IC I stayed, dan IC she left.'], ['Perbaiki: I was tired, I went home.', 'I was tired, so I went home. Alternatif: I was tired; I went home.']]), source(1), source(2),
    ],
  },
  {
    id: 'english-superlative-ordinal', title: 'Superlative Adjectives & Ordinal Numbers',
    summary: 'Menyatakan tingkat paling tinggi/rendah, peringkat, urutan, dan tanggal.',
    track: 'Adjectives & Numbers', source: documents[3].filename, level: 'Easy', duration: '30 menit',
    blocks: [
      h('Superlative adjectives'),
      p('Superlative membandingkan satu anggota dengan seluruh anggota lain dalam kelompok: **She is the tallest student in the class.** Gunakan the pada pola umum the + superlative + noun. Comparative membandingkan dua hal: taller than; superlative menyatakan yang paling: the tallest.'),
      table(['Aturan', 'Contoh'], [
        ['Satu suku kata: biasanya tambahkan -est.', 'tall → tallest; small → smallest'],
        ['Akhiran -e: tambahkan -st.', 'large → largest; late → latest'],
        ['Vokal pendek + satu konsonan akhir pada pola seperti big: gandakan konsonan.', 'big → biggest; hot → hottest'],
        ['Dua suku kata berakhiran consonant + y: y menjadi -iest.', 'happy → happiest; easy → easiest'],
        ['Kata panjang: umumnya most + adjective.', 'beautiful → most beautiful; intelligent → most intelligent'],
        ['Tingkat terendah: least + adjective.', 'the least expensive option'],
      ]),
      note('Aturan handout “dua atau lebih suku kata selalu most” disederhanakan terlalu jauh: happy menjadi happiest. Beberapa adjective dua suku kata memiliki variasi, seperti cleverest/most clever. Hindari bentuk ganda most biggest. Artikel juga dapat diganti possessive: my best friend.'),
      h('Bentuk dalam tabel sumber & koreksinya'),
      table(['Bentuk dasar', 'Superlative', 'Catatan'], [
        ['good', 'best', 'the best student'], ['bad', 'worst', 'the worst result'],
        ['far', 'farthest / furthest', 'Farthest lazim untuk jarak fisik; furthest juga dipakai untuk makna kiasan.'],
        ['little (jumlah)', 'least', 'the least time; untuk ukuran kecil, gunakan small → smallest'],
        ['many / much', 'most', 'the most books / the most water'],
        ['well', 'best', 'Sebagai adverb: She performs best; well juga dapat berarti sehat sebagai adjective.'],
        ['old', 'oldest', 'Bentuk beraturan; eldest dipakai terbatas, misalnya saudara dalam keluarga.'],
        ['late', 'latest', 'Bentuk beraturan; ejaan Latestt pada sumber diperbaiki.'],
      ]),
      h('Ordinal numbers: posisi dalam urutan'),
      p('Cardinal menjawab “berapa?” (one, two, three); ordinal menjawab “urutan ke berapa?” (first, second, third). Contoh: **She is the first student to submit the assignment.** Gunakan the first/the second untuk urutan tertentu, atau possessive seperti my first job.'),
      table(['Angka', 'Ordinal', 'Penulisan kata'], [
        ['1 / 2 / 3', '1st / 2nd / 3rd', 'first / second / third'],
        ['4 / 5 / 8 / 9', '4th / 5th / 8th / 9th', 'fourth / fifth / eighth / ninth'],
        ['11 / 12 / 13', '11th / 12th / 13th', 'eleventh / twelfth / thirteenth'],
        ['20 / 21 / 22 / 23', '20th / 21st / 22nd / 23rd', 'twentieth / twenty-first / twenty-second / twenty-third'],
        ['25 / 100', '25th / 100th', 'twenty-fifth / one hundredth'],
      ]),
      p('Akhiran biasanya mengikuti digit terakhir: 1 → st, 2 → nd, 3 → rd, lainnya → th. Pengecualian: bilangan yang berakhir **11, 12, 13** memakai th, termasuk 111th, 112th, 113th.'),
      h('Ordinal untuk tanggal'),
      p('**My birthday is on the 25th of December.** (Ulang tahun saya tanggal 25 Desember.) Bentuk tulis yang lazim juga mencakup **25 December** atau **December 25**; saat dibaca, tanggal dapat memakai ordinal. Gunakan **on** untuk hari/tanggal.'),
      p('Setelah fondasi ini, lanjutkan ke [Comparatives, Inversion, Articles & Pronouns](#english.comparatives-inversion-articles-pronouns) untuk penerapan dalam Grammar TOEFL.'),
      practice('comparison', ['Ubah big, happy, beautiful, good, dan bad menjadi superlative.', 'Tulis ordinal untuk 11, 21, 22, 23, dan 113.', 'Buat satu kalimat superlative dan satu kalimat tanggal ulang tahun.']),
      quiz('comparison', [['Perbaiki: This is the most biggest room.', 'This is the biggest room. Jangan memakai most bersama bentuk -est.'], ['Tulis ordinal untuk 12, 21, dan 113.', '12th (twelfth), 21st (twenty-first), dan 113th (one hundred and thirteenth).'], ['Apakah semua adjective dua suku kata memakai most?', 'Tidak. Contohnya happy → happiest dan easy → easiest.']]), source(3),
    ],
  },
];

/** Preserve source wording and original page appearance outside learning progress. */
export const englishFoundationArchives: Omit<Module, 'code'>[] = documents.map((doc) => ({
  id: `arsip-english-${doc.slug}`, title: `Arsip: ${doc.filename.replace('.pdf', '')}`,
  summary: `Peta materi, ${doc.pages.length} halaman asli, dan teks lengkap untuk pencarian.`,
  track: 'Arsip Sumber', archive: true, source: doc.filename,
  blocks: [
    h('Peta bab'),
    { type: 'list', items: doc.modules.map((id) => {
      const module = englishFoundationModules.find((item) => item.id === id)!;
      return `[${module.title}](#english.${id})`;
    }) },
    note('Halaman asli dipertahankan apa adanya, termasuk contoh atau salah ketik. Materi belajar pada tautan di atas menyajikan penjelasan yang dirapikan dan koreksi yang diberi catatan.'),
    ...doc.pages.flatMap((page): Block[] => [
      h(`Halaman ${page.page}`),
      { type: 'details', summary: `Lihat halaman asli ${page.page}`, blocks: [
        { type: 'image', src: page.src, alt: `${doc.filename}, halaman ${page.page}`, caption: `Halaman asli ${page.page} dari ${doc.pages.length}.` },
      ] },
      { type: 'details', summary: `Teks lengkap halaman ${page.page}`, blocks: [p(page.text)] },
    ]),
  ],
}));
