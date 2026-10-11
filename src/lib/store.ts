import { useSyncExternalStore } from 'react';

export type QAStatus = 'known' | 'review';
export type ThemePref = 'system' | 'light' | 'dark';
export type ReadingSize = 'compact' | 'comfortable' | 'large';

export interface PlaybookState {
  /** Kunci "curriculumId.moduleId" untuk modul yang ditandai selesai. */
  done: Record<string, true>;
  /** Status latihan per pertanyaan, kunci "curriculumId.qaId". */
  qa: Record<string, QAStatus>;
  last?: { cid: string; mid: string };
  /** Butir checklist yang dicentang, kunci "curriculumId.checklistId.index". */
  checks: Record<string, true>;
  theme: ThemePref;
  readingSize: ReadingSize;
  focusMode: boolean;
}

const KEY = 'playbook:v1';
const initial: PlaybookState = { done: {}, qa: {}, checks: {}, theme: 'system', readingSize: 'comfortable', focusMode: false };

function load(): PlaybookState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<PlaybookState>;
    return migrate({ ...initial, ...parsed, done: parsed.done ?? {}, qa: parsed.qa ?? {}, checks: parsed.checks ?? {},
      readingSize: ['compact', 'comfortable', 'large'].includes(parsed.readingSize ?? '') ? parsed.readingSize! : initial.readingSize,
      focusMode: parsed.focusMode === true,
    });
  } catch {
    return initial;
  }
}

/** Kurikulum lama yang sudah digabung: algo → java, aws → devops, ai → llm. */
const RENAMED: Record<string, string> = { algo: 'java', aws: 'devops', ai: 'llm' };

function migrate(s: PlaybookState): PlaybookState {
  const aiMid = (cid: string, mid: string) => ['ai', 'llm'].includes(cid) && ['data-infrastructure', 'ai-engineering', 'automation'].includes(mid) ? `hacktiv8-${mid}` : mid;
  const fix = <T,>(rec: Record<string, T>, moduleIds = false) =>
    Object.fromEntries(
      Object.entries(rec).map(([k, v]) => {
        const [cid, ...rest] = k.split('.');
        if (moduleIds && rest.length) rest[0] = aiMid(cid, rest[0]);
        return [[RENAMED[cid] ?? cid, ...rest].join('.'), v];
      }),
    ) as Record<string, T>;
  const last = s.last ? { cid: RENAMED[s.last.cid] ?? s.last.cid, mid: aiMid(s.last.cid, s.last.mid) } : undefined;
  return { ...s, done: fix(s.done, true), qa: fix(s.qa), checks: fix(s.checks), last };
}

let state: PlaybookState = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* penyimpanan tidak tersedia (mode privat, dll.) — tetap jalan di memori */
  }
}

export function setState(fn: (s: PlaybookState) => PlaybookState) {
  state = fn(state);
  save();
  listeners.forEach((l) => l());
}

export function usePlaybook<T>(select: (s: PlaybookState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => select(state),
  );
}

export const moduleKey = (cid: string, mid: string) => `${cid}.${mid}`;

export function toggleDone(cid: string, mid: string) {
  const k = moduleKey(cid, mid);
  setState((s) => {
    const done = { ...s.done };
    if (done[k]) delete done[k];
    else done[k] = true;
    return { ...s, done };
  });
}

export function setQA(cid: string, qid: string, status: QAStatus | null) {
  const k = `${cid}.${qid}`;
  setState((s) => {
    const qa = { ...s.qa };
    if (status === null || qa[k] === status) delete qa[k];
    else qa[k] = status;
    return { ...s, qa };
  });
}

export function toggleCheck(key: string) {
  setState((s) => {
    const checks = { ...s.checks };
    if (checks[key]) delete checks[key];
    else checks[key] = true;
    return { ...s, checks };
  });
}

export function visit(cid: string, mid: string) {
  if (state.last?.cid === cid && state.last?.mid === mid) return;
  setState((s) => ({ ...s, last: { cid, mid } }));
}

export function setTheme(theme: ThemePref) {
  setState((s) => ({ ...s, theme }));
}

export function setReadingSize(readingSize: ReadingSize) {
  setState((s) => ({ ...s, readingSize }));
}

export function toggleFocusMode() {
  setState((s) => ({ ...s, focusMode: !s.focusMode }));
}

export function resetProgress() {
  setState((s) => ({ ...initial, theme: s.theme, readingSize: s.readingSize, focusMode: s.focusMode }));
}
