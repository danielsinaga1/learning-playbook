import type { Block, Curriculum, Module, Track } from '../types';
import { aws } from './aws';
import { interview } from './interview';
import { algorithms } from './algorithms';
import { ai } from './ai';
import { nextjsModules, nextjsSource, nextjsTracks } from './nextjs';
import { aiEngineerModules, aiEngineerSource, aiEngineerTracks } from './ai-engineer';
import { javaModernModules, javaModernSource, javaModernTracks } from './java-modern';
import { goModernModules, goModernSource } from './go-modern';
import { nodeCoreModules, nodeCoreSource, nodeCoreTracks } from './node-core';
import { pythonCoreModules, pythonCoreSource, pythonCoreTracks } from './python-core';
import { rustCoreModules, rustCoreSource, rustCoreTracks } from './rust-core';
import { dartModernModules, dartModernSource } from './dart-modern';
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
 * Kurikulum yang ditulis tangan (aws, interview, algorithms, ai, nextjs) digabung di sini
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

/** Java Modern disisipkan setelah Functional & Lambda; modul Testcontainers masuk track Spring Boot lanjutan. */
const java = numbered({
  ...gen(javaGen),
  tracks: insertTracks(gen(javaGen).tracks, javaModernTracks, 'Java Functional & Lambda', 'after'),
  sources: [...(gen(javaGen).sources ?? []), javaModernSource],
  modules: [...withTrack(algorithms.modules, 'Strategi Algoritma'), ...gen(javaGen).modules, ...javaModernModules],
  intro: [...(algorithms.intro ?? []), ...(gen(javaGen).intro ?? [])],
});

const devops = numbered({
  ...gen(devopsGen),
  modules: [...withTrack(aws.modules, 'AWS untuk Java Developer'), ...gen(devopsGen).modules],
  intro: aws.intro,
});

/** Next.js ditambahkan setelah TypeScript, sebelum Angular; ID materi lama tetap stabil. */
const javascriptGen = gen(jsGen);
const javascriptTracks = javascriptGen.tracks ?? [];
const angularIndex = javascriptTracks.findIndex((track) => track.title === 'Angular');
const nextjsIndex = angularIndex < 0 ? javascriptTracks.length : angularIndex;
const javascript = numbered({
  ...javascriptGen,
  description: 'React dari fondasi sampai performa dan proyek nyata, React Native, TypeScript lanjutan, Next.js App Router sampai full stack dan produksi, Angular modern, serta backend Node.js: inti runtime (event loop, streams, Drizzle), Express, dan NestJS.',
  tracks: insertTracks(
    [...javascriptTracks.slice(0, nextjsIndex), ...nextjsTracks, ...javascriptTracks.slice(nextjsIndex)],
    nodeCoreTracks, 'Node.js: Express', 'before',
  ),
  sources: [...(javascriptGen.sources ?? []), nextjsSource, nodeCoreSource],
  modules: [
    ...javascriptGen.modules.map((module) => module.id === 'next-js-app-router' ? {
      ...module,
      blocks: [
        { type: 'callout' as const, tone: 'info' as const, title: 'Jalur praktik Next.js terbaru', text: 'Bab ini merupakan pengantar dari dokumen React. Lanjutkan ke [Next.js: Fondasi & Setup](#js.nextjs-fondasi-setup) untuk 12 modul praktik App Router dengan acuan Next.js 16.4, Cache Components, autentikasi, testing, dan proyek akhir.' },
        ...module.blocks,
      ],
    } : module),
    ...nextjsModules,
    ...nodeCoreModules,
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
  return {
    ...interview,
    title: 'Interview Prep: Java, Spring, React & Kafka',
    description: `Pertanyaan interview: 30 konsep Java, Spring Boot & AWS untuk Senior Java Backend, ${qaCount('React & Spring Boot Advanced')} soal advanced React & Spring Boot, dan ${qaCount('Apache Kafka (Java)')} soal Apache Kafka plus cheat sheet. Jawab dulu di kepala, lalu nilai dirimu.`,
    tracks: [
      { title: 'Java, Spring Boot & AWS', summary: '30 pertanyaan konsep dasar level senior.' },
      { title: 'React & Spring Boot Advanced', summary: 'Soal technical & coding test level advanced.' },
      { title: 'Apache Kafka (Java)', summary: 'Arsitektur, producer/consumer, replikasi, Streams, Connect, security, skenario, cheat sheet.' },
      ARCHIVE_TRACK,
    ],
    sources: ['Interview Prep Java, Spring & AWS (HTML)', ...((interviewExtra as unknown as { sources: string[] }).sources ?? [])],
    modules: [...modules, ...advanced, ...archive],
  };
}

/** Go: pelajaran tambahan masuk ke track yang sudah ada. */
const goBase = gen(goGen);
const go = numbered({
  ...goBase,
  sources: [...(goBase.sources ?? []), goModernSource],
  modules: [...goBase.modules, ...goModernModules],
});

/** Python Inti mendahului FastAPI/Django: bahasa dulu, framework kemudian. */
const pythonBase = gen(pythonGen);
const python = numbered({
  ...pythonBase,
  title: 'Python: Inti, FastAPI & Django',
  description: `Bahasa Python dari fondasi sampai asyncio dan tooling modern, lalu ${pythonBase.description.charAt(0).toLowerCase()}${pythonBase.description.slice(1)}`,
  tracks: insertTracks(pythonBase.tracks, pythonCoreTracks, 'Kontrak API', 'before'),
  sources: [...(pythonBase.sources ?? []), pythonCoreSource],
  modules: [...pythonBase.modules, ...pythonCoreModules],
});

/** Rust: inti bahasa (ownership sampai trait) dan backend Axum setelah Rust Dasar. */
const rustBase = gen(rustGen);
const rust = numbered({
  ...rustBase,
  description: `${rustBase.description} Dilanjutkan ownership, borrowing, enum & pattern matching, error handling, trait & generic, serta REST API dengan Tokio, Axum, dan SQLx.`,
  tracks: insertTracks(rustBase.tracks, rustCoreTracks, 'Rust Dasar', 'after'),
  sources: [...(rustBase.sources ?? []), rustCoreSource],
  modules: [...rustBase.modules, ...rustCoreModules],
});

/** Flutter: Dart 3, Pigeon, dan aksesibilitas masuk ke track yang sudah ada. */
const flutterBase = gen(flutterGen);
const flutter = numbered({
  ...flutterBase,
  sources: [...(flutterBase.sources ?? []), dartModernSource],
  modules: [...flutterBase.modules, ...dartModernModules],
});

/** Daftar kurikulum sesuai urutan tampil. */
export const curricula: Curriculum[] = [
  java,
  go,
  javascript,
  python,
  rust,
  flutter,
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
