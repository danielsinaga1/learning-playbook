import type { Block, Curriculum } from '../types';
import { plain } from './inline';

export interface SearchEntry {
  cid: string;
  mid: string;
  /** Elemen tujuan (mis. pertanyaan Q&A) — opsional. */
  focusId?: string;
  kind: 'module' | 'question';
  title: string;
  context: string;
  text: string;
  /** Versi huruf kecil untuk pencocokan cepat. */
  lc: string;
  lcTitle: string;
}

function blockText(b: Block): string {
  switch (b.type) {
    case 'h':
    case 'p':
      return plain(b.text);
    case 'list':
      return b.items.map(plain).join(' ');
    case 'callout':
      return `${b.title ?? ''} ${plain(b.text)}`;
    case 'code':
      return `${b.title ?? ''} ${b.code}`;
    case 'skills':
      return b.items.map((s) => `${s.name} ${s.desc}`).join(' ');
    case 'cards':
      return b.items.map((c) => `${c.title} ${c.text}`).join(' ');
    case 'table':
      return [...b.head, ...b.rows.flat().map((c) => (typeof c === 'string' ? plain(c) : c.text))].join(' ');
    case 'steps':
      return b.items.map((s) => `${s.title} ${s.text ? plain(s.text) : ''} ${(s.blocks ?? []).map(blockText).join(' ')}`).join(' ');
    case 'tags':
      return b.items.map((t) => t.label).join(' ');
    case 'tabs':
      return b.tabs.map((t) => `${t.label} ${t.blocks.map(blockText).join(' ')}`).join(' ');
    case 'qa':
      return '';
    case 'vocab':
      return b.items.map((v) => `${v.term} ${v.meaning} ${v.synonyms ?? ''} ${v.example ?? ''}`).join(' ');
    case 'checklist':
      return b.items.map(plain).join(' ');
    case 'image':
      return `${b.alt} ${b.caption ? plain(b.caption) : ''}`;
    case 'details':
      return `${plain(b.summary)} ${b.blocks.map(blockText).join(' ')}`;
  }
}

export function buildIndex(curricula: Curriculum[]): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const c of curricula) {
    for (const m of c.modules) {
      const text = `${m.title} ${m.summary} ${m.blocks.map(blockText).join(' ')}`;
      out.push({
        cid: c.id,
        mid: m.id,
        kind: 'module',
        title: m.title,
        context: m.track ? `${c.short} › ${m.track}` : c.short,
        text,
        lc: text.toLowerCase(),
        lcTitle: m.title.toLowerCase(),
      });
      for (const b of m.blocks) {
        if (b.type !== 'qa') continue;
        for (const q of b.items) {
          const title = `${q.id} · ${plain(q.q)}`;
          const text = [...(q.prompt ?? []), ...q.a].map(blockText).join(' ');
          out.push({
            cid: c.id,
            mid: m.id,
            focusId: q.id,
            kind: 'question',
            title,
            context: `${c.short} › ${m.title}`,
            text,
            lc: text.toLowerCase(),
            lcTitle: title.toLowerCase(),
          });
        }
      }
    }
  }
  return out;
}

export function search(index: SearchEntry[], query: string, limit = 20) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const title = e.lcTitle;
    const body = e.lc;
    let score = 0;
    let all = true;
    for (const t of terms) {
      if (title.includes(t)) score += 5;
      else if (body.includes(t)) score += 1;
      else {
        all = false;
        break;
      }
    }
    if (all) scored.push({ e, score: score + (e.kind === 'question' ? 0.5 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.e);
}

/** Potongan teks di sekitar istilah pertama yang cocok. */
export function snippet(text: string, query: string, radius = 60) {
  const t = query.toLowerCase().split(/\s+/).filter(Boolean)[0];
  if (!t) return '';
  const i = text.toLowerCase().indexOf(t);
  if (i < 0) return '';
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + t.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`;
}
