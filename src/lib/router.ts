import { useSyncExternalStore } from 'react';

/**
 * Routing berbasis hash, hanya memakai karakter aman (huruf, angka, titik, minus)
 * sehingga link langsung tetap bekerja di file lokal maupun saat di-hosting.
 *   ""               → beranda
 *   "#aws"           → ringkasan kurikulum
 *   "#aws.fondasi"   → modul
 */
export type Route =
  | { name: 'home' }
  | { name: 'curriculum'; cid: string }
  | { name: 'module'; cid: string; mid: string; focusId?: string };

export function parseRoute(hash: string): Route {
  let h: string;
  try { h = decodeURIComponent(hash.replace(/^#/, '')); }
  catch { h = hash.replace(/^#/, ''); }
  if (!h) return { name: 'home' };
  const [target, focusId] = h.split('/');
  const dot = target.indexOf('.');
  const cid = dot < 0 ? target : target.slice(0, dot);
  const mid = dot < 0 ? '' : target.slice(dot + 1);
  if (mid) return { name: 'module', cid, mid, ...(focusId ? { focusId } : {}) };
  return { name: 'curriculum', cid };
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return parseRoute(hash);
}

export function navigate(target: string, focusId?: string) {
  const focus = focusId ? (focusId.startsWith('section-') || focusId.startsWith('q-') ? focusId : `q-${focusId}`) : undefined;
  const next = target ? `#${target}${focus ? `/${focus}` : ''}` : '';
  if (window.location.hash === next) {
    // Sudah di halaman yang sama: langsung minta fokus tanpa ganti route.
    if (focus) focusContent(focus);
    return;
  }
  window.location.hash = next;
}

export function focusContent(id: string) {
  if (id.startsWith('q-')) {
    window.dispatchEvent(new CustomEvent('playbook:focus', { detail: id.slice(2) }));
  } else {
    const element = document.getElementById(id);
    element?.scrollIntoView({ block: 'start' });
    element?.focus({ preventScroll: true });
  }
}

export const href = {
  home: () => '#',
  curriculum: (cid: string) => `#${cid}`,
  module: (cid: string, mid: string) => `#${cid}.${mid}`,
  section: (cid: string, mid: string, id: string) => `#${cid}.${mid}/${id}`,
};
