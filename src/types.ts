/**
 * Model data playbook.
 * Curriculum → (track) → Module → Block. Teks di dalam block mendukung inline markup:
 *   **tebal**, *miring*, `kode`, [teks](https://url), \* untuk karakter literal, baris baru = <br>
 */

export type Tone = 'info' | 'tip' | 'warn' | 'success';
export type BadgeTone = 'high' | 'mid' | 'low' | 'neutral';
export type Level = 'Easy' | 'Med' | 'Hard';
export type CodeLang =
  | 'java'
  | 'go'
  | 'ts'
  | 'js'
  | 'python'
  | 'dart'
  | 'bash'
  | 'docker'
  | 'yaml'
  | 'json'
  | 'sql'
  | 'graphql'
  | 'proto'
  | 'rust'
  | 'hcl'
  | 'html'
  | 'css'
  | 'properties'
  | 'xml'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'php'
  | 'text';

export type Hue =
  | 'amber'
  | 'green'
  | 'teal'
  | 'rose'
  | 'blue'
  | 'violet'
  | 'sky'
  | 'orange'
  | 'lime'
  | 'red'
  | 'indigo'
  | 'slate'
  | 'fuchsia'
  | 'cyan';

export type Cell = string | { badge: BadgeTone; text: string };

export interface QAItem {
  /** ID unik & stabil dalam satu kurikulum, dipakai menyimpan status latihan (mis. "J-01"). */
  id: string;
  q: string;
  /** Konteks soal (deskripsi, potongan kode) yang tampil sebelum jawaban. */
  prompt?: Block[];
  a: Block[];
}

export interface VocabItem {
  term: string;
  meaning: string;
  synonyms?: string;
  example?: string;
}

export type Block =
  | { type: 'h'; text: string; level?: 3 | 4 }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; tone: Tone; title?: string; text: string }
  | { type: 'code'; lang: CodeLang; code: string; title?: string }
  | { type: 'skills'; items: { name: string; desc: string }[] }
  | { type: 'cards'; items: { title: string; text: string; label?: string }[] }
  | { type: 'table'; head: string[]; rows: Cell[][] }
  | { type: 'steps'; items: { title: string; text?: string; blocks?: Block[] }[] }
  | { type: 'tags'; items: { label: string; tone?: BadgeTone }[] }
  | { type: 'tabs'; tabs: { label: string; blocks: Block[] }[] }
  | { type: 'qa'; items: QAItem[] }
  | { type: 'vocab'; items: VocabItem[] }
  /** Daftar centang yang tersimpan (milestone, checklist kompetensi). `id` unik dalam kurikulum. */
  | { type: 'checklist'; id: string; items: string[] }
  /** Gambar asli dari dokumen sumber (mis. slide). */
  | { type: 'image'; src: string; alt: string; caption?: string }
  /** Bagian lipat (mis. teks hasil ekstraksi atau galeri halaman asli); isi baru dirender saat dibuka. */
  | { type: 'details'; summary: string; blocks: Block[] };

export interface Module {
  id: string;
  /** Kode pendek yang tampil di daftar, mis. "01". Diisi otomatis bila kosong. */
  code: string;
  title: string;
  summary: string;
  /** Nama track (submodul) tempat modul ini berada. */
  track?: string;
  /** Dokumen asal materi. */
  source?: string;
  duration?: string;
  level?: Level;
  /** Modul arsip: peta bab & sisa isi dokumen asli. Tidak dihitung dalam progres. */
  archive?: boolean;
  blocks: Block[];
}

export interface Track {
  title: string;
  summary?: string;
}

export interface Curriculum {
  id: string;
  title: string;
  /** Label pendek untuk sidebar & breadcrumb. */
  short: string;
  monogram: string;
  hue: Hue;
  description: string;
  /** Urutan & deskripsi track. Modul dikelompokkan berdasarkan `module.track`. */
  tracks?: Track[];
  /** Dokumen sumber yang digabung ke kurikulum ini. */
  sources?: string[];
  /** Konten pembuka yang tampil di halaman ringkasan kurikulum. */
  intro?: Block[];
  modules: Module[];
}
