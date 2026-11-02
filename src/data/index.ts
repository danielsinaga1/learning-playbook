import type { Block, Curriculum, Module, Track } from '../types';
import { aws } from './aws';
import { interview } from './interview';
import { algorithms } from './algorithms';
import { ai } from './ai';
import { nextjsModules, nextjsSource, nextjsTracks } from './nextjs';
import { aiEngineerModules, aiEngineerSource, aiEngineerTracks } from './ai-engineer';
import { javaModernModules, javaModernSource, javaModernTracks } from './java-modern';
import { dsaExtraModules, dsaExtraSource } from './dsa-extra';
import { javaCoreModules, javaCoreSource, javaCoreTracks } from './java-core';
import { goModernModules, goModernSource } from './go-modern';
import { goExtraModules, goExtraSource } from './go-extra';
import { nodeCoreModules, nodeCoreSource, nodeCoreTracks } from './node-core';
import { pythonCoreModules, pythonCoreSource, pythonCoreTracks } from './python-core';
import { rustCoreModules, rustCoreSource, rustCoreTracks } from './rust-core';
import { dartModernModules, dartModernSource } from './dart-modern';
import { jsCoreModules, jsCoreSource, jsCoreTracks } from './js-core';
import { jsEcosystemModules, jsEcosystemSource, jsEcosystemTracks } from './js-ecosystem';
import { jsAdvancedModules, jsAdvancedSource, jsAdvancedTracks } from './js-advanced';
import { rustAdvancedModules, rustAdvancedSource, rustAdvancedTracks } from './rust-advanced';
import { rustProjectsModules, rustProjectsSource, rustProjectsTracks } from './rust-projects';
import { pythonPracticeModules, pythonPracticeSource, pythonPracticeTracks } from './python-practice';
import { pythonFoundationModules, pythonFoundationSource, pythonFoundationTracks } from './python-foundations';
import { kotlinCurriculum } from './kotlin';
import { csharpCurriculum } from './csharp';
import { swiftCurriculum } from './swift';
import { cppCurriculum } from './cpp';
import { phpCurriculum } from './php';
import { devToolsCurriculum } from './dev-tools';
import { roadmapCurriculum } from './roadmap';
import { csFoundationModules, csFoundationSource, csFoundationTracks } from './cs-foundations';
import { htmlCssModules, htmlCssSource, htmlCssTracks } from './html-css';
import { webSecurityCurriculum } from './web-security';
import { interviewLanguageModules, interviewLanguageSource, interviewLanguageTracks } from './interview-languages';
import { systemDesignModules, systemDesignSource, systemDesignTracks } from './system-design-interview';
import { englishFoundationArchives, englishFoundationModules, englishFoundationSources, englishFoundationTracks } from './english-foundations';
import javaGen from './gen/java.json';
import goGen from './gen/go.json';
import jsGen from './gen/js.json';
import pythonGen from './gen/python.json';
import flutterGen from './gen/flutter.json';
import devopsGen from './gen/devops.json';
import englishGen from './gen/english.json';
import sqlGen from './gen/sql.json';
import testingGen from './gen/testing.json';
import rustGen from './gen/rust.json';
import distributedGen from './gen/distributed.json';
import llmGen from './gen/llm.json';
import lldGen from './gen/lld.json';
import interviewExtra from './gen/interview-extra.json';

/*
 * Kurikulum hasil konversi .docx ada di ./gen/*.json (dibuat oleh skrip konversi).
 * Kurikulum yang ditulis tangan (aws, interview, algorithms, ai, nextjs) digabung di sini;
 * jalur belajar, Git & Shell, Web & Keamanan, Kotlin, dan C# adalah kurikulum tulisan tangan yang berdiri sendiri,
 * supaya satu bahasa/ekosistem = satu kurikulum, dengan track sebagai submodul.
 */

type GenCurriculum = Omit<Curriculum, 'modules'> & { modules: Omit<Module, 'code'>[] };
const gen = (j: unknown) => j as GenCurriculum;

function withTrack(mods: Module[], track: string): Module[] {
  return mods.map((m) => ({ ...m, track }));
}

/**
 * Urutkan modul mengikuti urutan track, lalu beri kode 01, 02, … supaya nomor,
 * daftar, dan tombol sebelumnya/berikutnya selalu konsisten.
 */
function numbered(c: GenCurriculum): Curriculum {
  const order = (c.tracks ?? []).map((t) => t.title);
  const rank = (m: Omit<Module, 'code'>) => {
    if (m.archive) return order.length + 1;
    const i = order.indexOf(m.track ?? '');
    return i < 0 ? order.length : i;
  };
  const sorted = c.modules.map((m, i) => ({ m, i })).sort((a, b) => rank(a.m) - rank(b.m) || a.i - b.i);
  let n = 0;
  let a = 0;
  return {
    ...c,
    modules: sorted.map(({ m }) => ({ ...m, code: m.archive ? `A${++a}` : String(++n).padStart(2, '0') })),
  };
}

/** Track arsip: peta bab dan sisa isi dokumen asli (tidak dihitung dalam progres). */
export const ARCHIVE_TRACK = { title: 'Arsip Sumber', summary: 'Peta bab dokumen asli dan bagian yang tidak masuk jalur utama, supaya tidak ada isi yang hilang.' };
export const learning = (c: Curriculum) => c.modules.filter((m) => !m.archive);

/**
 * Sisipkan track tulisan tangan sebelum/sesudah track acuan (atau sebelum Arsip Sumber bila acuan tidak ada),
 * sehingga konversi ulang gen/*.json tidak menghapus pelajaran tambahan.
 */
function insertTracks(tracks: Track[] | undefined, add: Track[], anchor: string, position: 'before' | 'after'): Track[] {
  const list = tracks ?? [];
  const found = list.findIndex((track) => track.title === anchor);
  const archive = list.findIndex((track) => track.title === ARCHIVE_TRACK.title);
  const at = found < 0 ? (archive < 0 ? list.length : archive) : position === 'after' ? found + 1 : found;
  return [...list.slice(0, at), ...add, ...list.slice(at)];
}

/** Big-O membuka track Struktur Data; modul DSA lain (Heap, Trie, Union-Find, graf, binary search, bit) menyusul di track masing-masing. */
const BIG_O = 'dsa-big-o-kompleksitas';

/**
 * Java Inti (OOP sampai JVM & GC) menyusul Java Fundamentals; Java Modern disisipkan setelah Functional & Lambda.
 * Modul Spring tambahan (JPA mendalam, cache, messaging, native image, Testcontainers) masuk track Spring yang sudah ada.
 */
const java = numbered({
  ...gen(javaGen),
  tracks: insertTracks(
    insertTracks(gen(javaGen).tracks, javaModernTracks, 'Java Functional & Lambda', 'after'),
    javaCoreTracks, 'Java Fundamentals', 'after',
  ),
  sources: [...(gen(javaGen).sources ?? []), javaCoreSource, javaModernSource, dsaExtraSource],
  modules: [
    ...withTrack(algorithms.modules, 'Strategi Algoritma'),
    ...dsaExtraModules.filter((m) => m.id === BIG_O),
    ...gen(javaGen).modules,
    ...javaModernModules,
    ...javaCoreModules,
    ...dsaExtraModules.filter((m) => m.id !== BIG_O),
  ],
  intro: [...(algorithms.intro ?? []), ...(gen(javaGen).intro ?? [])],
});

const devops = numbered({
  ...gen(devopsGen),
  modules: [...withTrack(aws.modules, 'AWS untuk Java Developer'), ...gen(devopsGen).modules],
  intro: aws.intro,
});

/**
 * HTML & CSS, lalu JavaScript Dasar → Lanjutan dan TypeScript Dasar membuka kurikulum (sebelum React);
 * TypeScript Tingkat Mahir menyusul TypeScript Lanjutan, Vue & Nuxt sebelum Angular.
 * Next.js ditambahkan setelah TypeScript, sebelum Angular; ID materi lama tetap stabil.
 */
const javascriptGen = gen(jsGen);
const javascriptBaseTracks = insertTracks(insertTracks(javascriptGen.tracks, jsCoreTracks, 'React: Fondasi', 'before'), htmlCssTracks, 'JavaScript Dasar', 'before');
const [jsLanjutanTrack, tsMahirTrack] = jsAdvancedTracks;
const javascriptTracks = insertTracks(
  insertTracks(javascriptBaseTracks, [jsLanjutanTrack], 'JavaScript Dasar', 'after'),
  [tsMahirTrack], 'TypeScript Lanjutan', 'after',
);
const angularIndex = javascriptTracks.findIndex((track) => track.title === 'Angular');
const nextjsIndex = angularIndex < 0 ? javascriptTracks.length : angularIndex;
const javascript = numbered({
  ...javascriptGen,
  description: 'HTML & CSS, JavaScript dan TypeScript dasar, lalu React dari fondasi sampai performa dan proyek nyata, React Native, TypeScript lanjutan, Next.js App Router sampai full stack dan produksi, Angular modern, serta backend Node.js: inti runtime (event loop, streams, Drizzle), Express, dan NestJS.',
  tracks: insertTracks(
    insertTracks(
      [...javascriptTracks.slice(0, nextjsIndex), ...nextjsTracks, ...javascriptTracks.slice(nextjsIndex)],
      nodeCoreTracks, 'Node.js: Express', 'before',
    ),
    jsEcosystemTracks, 'Angular', 'before',
  ),
  sources: [...(javascriptGen.sources ?? []), htmlCssSource, jsCoreSource, nextjsSource, nodeCoreSource, jsEcosystemSource, jsAdvancedSource],
  modules: [
    ...javascriptGen.modules.map((module) => module.id === 'next-js-app-router' ? {
      ...module,
      blocks: [
        { type: 'callout' as const, tone: 'info' as const, title: 'Jalur praktik Next.js terbaru', text: 'Bab ini merupakan pengantar dari dokumen React. Lanjutkan ke [Next.js: Fondasi & Setup](#js.nextjs-fondasi-setup) untuk 12 modul praktik App Router dengan acuan Next.js 16.4, Cache Components, autentikasi, testing, dan proyek akhir.' },
        ...module.blocks,
      ],
    } : module),
    ...htmlCssModules,
    ...jsCoreModules,
    ...jsAdvancedModules,
    ...nextjsModules,
    ...nodeCoreModules,
    ...jsEcosystemModules,
  ],
});

/** Fondasi grammar mendahului tenses/ujian; Materi 2 dan 3 berbagi satu modul. */
const englishBase = gen(englishGen);
const englishTracks = englishBase.tracks ?? [];
const tensesIndex = englishTracks.findIndex((track) => track.title === '16 Tenses');
const foundationIndex = tensesIndex < 0 ? 0 : tensesIndex;
const english = numbered({
  ...englishBase,
  description: 'Kosakata & phrasal verbs untuk kerja dan developer, grammar dasar, struktur kalimat, superlative & ordinal numbers, 16 tenses, TOEFL, dan IELTS.',
  tracks: [...englishTracks.slice(0, foundationIndex), ...englishFoundationTracks, ...englishTracks.slice(foundationIndex)],
  sources: [...(englishBase.sources ?? []), ...englishFoundationSources],
  intro: [
    { type: 'callout', tone: 'tip', title: 'Mulai dari fondasi grammar', text: 'Untuk pemula: [Parts of Speech](#english.english-parts-noun-pronoun-verb) → [Adjectives & Adverbs](#english.english-adjectives-adverbs) → [Prepositions & Determiners](#english.english-function-words) → [Struktur Kalimat](#english.english-sentence-structure) → [Superlative & Ordinal](#english.english-superlative-ordinal), lalu 16 Tenses dan Grammar TOEFL. Materi 2 dan 3 digabung agar tidak berulang; semua halaman asli tersedia di Arsip Sumber.' },
    ...(englishBase.intro ?? []),
  ],
  modules: [...englishBase.modules, ...englishFoundationModules, ...englishFoundationArchives],
});

/**
 * LLM: outline program Applied AI Engineer (Hacktiv8) masuk ke track Peta Belajar.
 * Jalur praktik AI Engineer (LangChain v1, LangGraph, Langfuse) disisipkan setelah RAG, sebelum Fase 2.
 */
const llmBase = gen(llmGen);
const llmTracks = llmBase.tracks ?? [];
const ragIndex = llmTracks.findIndex((track) => track.title === 'RAG: Panduan Lengkap');
const aiEngineerIndex = ragIndex < 0 ? llmTracks.length : ragIndex + 1;
const llm = numbered({
  ...llmBase,
  description: `${llmBase.description} Plus jalur praktik AI Engineer: Claude API, LangChain v1, LangGraph, Langfuse, eval, dan full stack.`,
  tracks: [...llmTracks.slice(0, aiEngineerIndex), ...aiEngineerTracks, ...llmTracks.slice(aiEngineerIndex)],
  sources: [...(llmBase.sources ?? []), aiEngineerSource],
  intro: [
    { type: 'callout', tone: 'tip', title: 'Jalur praktik AI Engineer', text: 'Ingin langsung membangun agent? Ikuti 11 modul mulai dari [Peta Stack & Jalur Belajar](#llm.aie-roadmap-stack): Python modern, Claude API & tool calling, LangChain v1, LangGraph (memory, human-in-the-loop, multi-agent), Langfuse (tracing, prompt, eval), lalu full stack FastAPI + Next.js dan proyek akhir.' },
    ...(llmBase.intro ?? []),
  ],
  modules: [
    ...aiEngineerModules,
    ...withTrack(ai.modules, 'Peta Belajar').map((m) => ({
      ...m,
      id: m.id === 'program' ? m.id : `hacktiv8-${m.id}`,
      title: m.id === 'program' ? 'Program Applied AI Engineer (Hacktiv8)' : `Hacktiv8 ${m.title}`,
      source: 'Belajar Hacktiv8 (outline program Applied AI Engineer)',
    })),
    ...gen(llmGen).modules,
  ],
});

/** Jawaban advanced (50 soal) untuk pertanyaan yang sudah ada → ditambahkan sebagai pendalaman. */
function mergeInterview(): Curriculum {
  const extra = interviewExtra as unknown as { modules: Module[]; archive?: Module[]; merge: Record<string, Block[] | null> };
  const modules = interview.modules.map((m) => ({
    ...m,
    track: 'Java, Spring Boot & AWS',
    blocks: m.blocks.map((b) =>
      b.type !== 'qa'
        ? b
        : {
            ...b,
            items: b.items.map((q) => {
              const add = extra.merge[q.id];
              if (!add?.length) return q;
              return {
                ...q,
                a: [...q.a, { type: 'h', text: 'Pendalaman: contoh implementasi', level: 4 } as Block, ...add],
              };
            }),
          },
    ),
  }));
  const count: Record<string, number> = {};
  const advanced = extra.modules.map((m) => {
    const k = m.track === 'Apache Kafka (Java)' ? 'K' : 'A';
    count[k] = (count[k] ?? 0) + 1;
    return { ...m, code: k === 'K' ? `K${count[k]}` : count[k] === 1 ? 'R' : 'SB' };
  });
  const qaCount = (track: string) =>
    extra.modules
      .filter((m) => m.track === track)
      .reduce((n, m) => n + m.blocks.reduce((k, b) => k + (b.type === 'qa' ? b.items.length : 0), 0), 0);
  const archive = (extra.archive ?? []).map((m, i) => ({ ...m, code: `A${i + 1}` }));
  /** Interview per bahasa & system design (tulisan tangan): kode modul pendek dan tetap. */
  const LANG_CODE: Record<string, string> = { 'iv-go': 'GO', 'iv-python-ai': 'PY', 'iv-typescript-node': 'TS', 'iv-kotlin-dotnet': 'KC', 'iv-strategi-behavioral': 'ST' };
  const languages = interviewLanguageModules.map((m) => ({ ...m, code: LANG_CODE[m.id] ?? m.id }));
  const strategy = languages.filter((m) => m.id === 'iv-strategi-behavioral');
  const perLanguage = languages.filter((m) => m.id !== 'iv-strategi-behavioral');
  const systemDesign = systemDesignModules.map((m, i) => ({ ...m, code: `SD${i + 1}` }));
  const track = (title: string) => interviewLanguageTracks.find((t) => t.title === title)!;
  const qaIn = (mods: Omit<Module, 'code'>[]) => mods.reduce((n, m) => n + m.blocks.reduce((k, b) => k + (b.type === 'qa' ? b.items.length : 0), 0), 0);
  return {
    ...interview,
    title: 'Interview Prep: Bahasa, System Design & Kafka',
    description: `Pertanyaan interview: strategi & behavioral, 30 konsep Java, Spring Boot & AWS untuk Senior Java Backend, ${qaIn(perLanguage)} soal Go, Python & AI Engineer, TypeScript & Node.js, Kotlin & C#/.NET, ${qaCount('React & Spring Boot Advanced')} soal advanced React & Spring Boot, ${qaCount('Apache Kafka (Java)')} soal Apache Kafka plus cheat sheet, dan ${systemDesign.length} modul system design interview. Jawab dulu di kepala, lalu nilai dirimu.`,
    tracks: [
      track('Cara Menjawab'),
      { title: 'Java, Spring Boot & AWS', summary: '30 pertanyaan konsep dasar level senior.' },
      ...interviewLanguageTracks.filter((t) => t.title !== 'Cara Menjawab'),
      { title: 'React & Spring Boot Advanced', summary: 'Soal technical & coding test level advanced.' },
      { title: 'Apache Kafka (Java)', summary: 'Arsitektur, producer/consumer, replikasi, Streams, Connect, security, skenario, cheat sheet.' },
      ...systemDesignTracks,
      ARCHIVE_TRACK,
    ],
    sources: ['Interview Prep Java, Spring & AWS (HTML)', ...((interviewExtra as unknown as { sources: string[] }).sources ?? []), interviewLanguageSource, systemDesignSource],
    modules: [...strategy, ...modules, ...perLanguage, ...advanced, ...systemDesign, ...archive],
  };
}

/** Go: pelajaran tambahan masuk ke track yang sudah ada. */
const goBase = gen(goGen);
const go = numbered({
  ...goBase,
  sources: [...(goBase.sources ?? []), goModernSource, goExtraSource],
  modules: [...goBase.modules, ...goModernModules, ...goExtraModules],
});

/** Python Dasar → Inti → Praktik → Mahir → Data mendahului FastAPI/Django: bahasa dulu, framework kemudian. */
const pythonBase = gen(pythonGen);
const python = numbered({
  ...pythonBase,
  title: 'Python: Inti, FastAPI & Django',
  description: `Bahasa Python dari dasar untuk pemula sampai asyncio dan tooling modern, praktik pytest, packaging, dan proyek CLI, topik mahir (data model, metaprogramming, performa & paralelisme, soal algoritma), ekosistem data (NumPy, pandas, SQLAlchemy), lalu ${pythonBase.description.charAt(0).toLowerCase()}${pythonBase.description.slice(1)}`,
  tracks: insertTracks(
    insertTracks(
      insertTracks(insertTracks(pythonBase.tracks, pythonCoreTracks, 'Kontrak API', 'before'), pythonPracticeTracks, 'Kontrak API', 'before'),
      pythonFoundationTracks.filter((t) => t.title === 'Python Dasar'), 'Python Inti', 'before',
    ),
    pythonFoundationTracks.filter((t) => t.title !== 'Python Dasar'), 'Python Praktik', 'after',
  ),
  sources: [...(pythonBase.sources ?? []), pythonCoreSource, pythonPracticeSource, pythonFoundationSource],
  modules: [...pythonBase.modules, ...pythonCoreModules, ...pythonPracticeModules, ...pythonFoundationModules],
});

/** Rust: inti bahasa (ownership sampai trait), lanjutan (iterator sampai macro), lalu backend Axum. */
const rustBase = gen(rustGen);
const rust = numbered({
  ...rustBase,
  description: `${rustBase.description} Dilanjutkan ownership, borrowing, enum & pattern matching, error handling, trait & generic, closure & iterator, smart pointer, concurrency, testing, macro, serta REST API dengan Tokio, Axum, dan SQLx. Ditutup async mendalam, unsafe & FFI, Axum siap produksi, proyek CLI clap, benchmark, dan WebAssembly.`,
  tracks: insertTracks(
    insertTracks(insertTracks(rustBase.tracks, rustCoreTracks, 'Rust Dasar', 'after'), rustAdvancedTracks, 'Rust Inti', 'after'),
    rustProjectsTracks, 'Rust untuk Backend', 'after',
  ),
  sources: [...(rustBase.sources ?? []), rustCoreSource, rustAdvancedSource, rustProjectsSource],
  modules: [...rustBase.modules, ...rustCoreModules, ...rustAdvancedModules, ...rustProjectsModules],
});

/** Flutter: Dart 3, Pigeon, dan aksesibilitas masuk ke track yang sudah ada. */
const flutterBase = gen(flutterGen);
const flutter = numbered({
  ...flutterBase,
  sources: [...(flutterBase.sources ?? []), dartModernSource],
  modules: [...flutterBase.modules, ...dartModernModules],
});

/** Jalur belajar: fondasi pemrograman & ilmu komputer tepat setelah Mulai di Sini. */
const roadmap = numbered({
  ...roadmapCurriculum,
  tracks: insertTracks(roadmapCurriculum.tracks, csFoundationTracks, 'Mulai di Sini', 'after'),
  sources: [...(roadmapCurriculum.sources ?? []), csFoundationSource],
  modules: [...roadmapCurriculum.modules, ...csFoundationModules],
});

/** Daftar kurikulum sesuai urutan tampil. */
export const curricula: Curriculum[] = [
  roadmap,
  numbered(devToolsCurriculum),
  numbered(webSecurityCurriculum),
  java,
  go,
  javascript,
  python,
  rust,
  numbered(cppCurriculum),
  numbered(kotlinCurriculum),
  numbered(csharpCurriculum),
  numbered(phpCurriculum),
  flutter,
  numbered(swiftCurriculum),
  numbered(gen(sqlGen)),
  numbered(gen(distributedGen)),
  numbered(gen(lldGen)),
  devops,
  numbered(gen(testingGen)),
  llm,
  mergeInterview(),
  english,
];

/** ID lama (sebelum penggabungan) tetap bisa dibuka. */
const ALIAS: Record<string, string> = { algo: 'java', aws: 'devops', ai: 'llm' };
export const resolveCid = (id: string | undefined) => (id && ALIAS[id]) || id;

export function findCurriculum(id: string | undefined) {
  const cid = resolveCid(id);
  return curricula.find((c) => c.id === cid);
}

export function findModule(cid: string | undefined, mid: string | undefined) {
  const c = findCurriculum(cid);
  if (!c) return undefined;
  const realMid = cid === 'ai' && mid !== 'program' && !mid?.startsWith('hacktiv8-') ? `hacktiv8-${mid}` : mid;
  const index = c.modules.findIndex((m) => m.id === realMid);
  if (index < 0) return undefined;
  return { curriculum: c, module: c.modules[index], index };
}

/** Kelompokkan modul per track, mengikuti urutan `curriculum.tracks`. */
export function groupByTrack(c: Curriculum) {
  const order = (c.tracks ?? []).map((t) => t.title);
  const groups = new Map<string, { title: string; summary?: string; modules: { module: Module; index: number }[] }>();
  for (const t of c.tracks ?? []) groups.set(t.title, { title: t.title, summary: t.summary, modules: [] });
  c.modules.forEach((module, index) => {
    const key = module.track ?? '';
    if (!groups.has(key)) groups.set(key, { title: key, modules: [] });
    groups.get(key)!.modules.push({ module, index });
  });
  return [...groups.values()]
    .filter((g) => g.modules.length)
    .sort((a, b) => {
      const ia = order.indexOf(a.title);
      const ib = order.indexOf(b.title);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
}
