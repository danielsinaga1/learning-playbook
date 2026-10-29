import type { Block, CodeLang, QAItem } from '../types';

/** Pembuat blok untuk materi yang ditulis tangan (pelajaran tambahan per bahasa). */
export const heading = (text: string): Block => ({ type: 'h', text });
export const paragraph = (text: string): Block => ({ type: 'p', text });
export const code = (title: string, content: string, lang: CodeLang): Block => ({ type: 'code', lang, title, code: content });
export const table = (head: string[], rows: string[][]): Block => ({ type: 'table', head, rows });
export const callout = (tone: 'info' | 'tip' | 'warn', title: string, text: string): Block => ({ type: 'callout', tone, title, text });

/** Checklist latihan; `id` diberi awalan kurikulum agar unik. */
export const practice = (id: string, items: string[]): Block[] => [
  heading('Latihan & kriteria selesai'),
  { type: 'checklist', id, items },
];

export const quiz = (items: [id: string, q: string, a: string][]): Block[] => [
  heading('Cek pemahaman — jawab sebelum membuka solusi'),
  { type: 'qa', items: items.map(([id, q, a]): QAItem => ({ id, q, a: [paragraph(a)] })) },
];

export const references = (...links: [label: string, url: string][]): Block => ({
  type: 'list', items: links.map(([label, url]) => `[${label}](${url})`),
});
