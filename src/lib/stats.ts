import type { Block, Curriculum, Module } from '../types';

export function countQuestions(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.type === 'qa') n += b.items.length;
    else if (b.type === 'tabs') n += b.tabs.reduce((s, t) => s + countQuestions(t.blocks), 0);
    else if (b.type === 'steps') n += b.items.reduce((s, it) => s + countQuestions(it.blocks ?? []), 0);
  }
  return n;
}

export function countVocab(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) if (b.type === 'vocab') n += b.items.length;
  return n;
}

export function countCode(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.type === 'code') n += 1;
    else if (b.type === 'tabs') n += b.tabs.reduce((s, t) => s + countCode(t.blocks), 0);
    else if (b.type === 'steps') n += b.items.reduce((s, it) => s + countCode(it.blocks ?? []), 0);
    else if (b.type === 'qa') n += b.items.reduce((s, q) => s + countCode(q.a) + countCode(q.prompt ?? []), 0);
    else if (b.type === 'details') n += countCode(b.blocks);
  }
  return n;
}

export function moduleMeta(m: Module) {
  const q = countQuestions(m.blocks);
  const v = countVocab(m.blocks);
  const parts: string[] = [];
  if (m.duration) parts.push(m.duration);
  if (q) parts.push(`${q} soal`);
  if (v) parts.push(`${v} kosakata`);
  return parts;
}

export function curriculumDone(c: Curriculum, done: Record<string, true>) {
  return c.modules.filter((m) => !m.archive && done[`${c.id}.${m.id}`]).length;
}
