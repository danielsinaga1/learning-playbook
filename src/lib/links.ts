import { findCurriculum, findModule } from '../data';
import { href, parseRoute } from './router';
import redirects from '../data/link-redirects.json';

/** Perbaikan URL sumber lama diterapkan di renderer, agar data hasil impor tetap utuh. */
const REPLACEMENTS: Record<string, string> = {
  ...redirects,
  'https://facebook.github.io/react/docs/components-and-props.html': 'https://react.dev/learn/passing-props-to-a-component',
  'https://python.langchain.com/docs/get_started/introduction': 'https://docs.langchain.com/oss/python/langchain/overview',
  'http://www.maths.surrey.ac.uk/hosted-sites/R.Knott/Fractions/egyptian.html': 'https://r-knott.surrey.ac.uk/Fractions/egyptian.html',
  'https://www.geeksforgeeks.org/maximize-array-sum-k-negations-set-2/': 'https://www.geeksforgeeks.org/dsa/maximize-array-sum-after-k-negations-using-sorting/',
  // Dokumen lama sudah dihapus; gunakan referensi aktif tentang topik yang sama.
  'http://www.ics.uci.edu/~eppstein/161/960206.html': 'https://www.cs.princeton.edu/courses/archive/spr07/cos226/lectures/mst.pdf',
  'http://algo2.iti.kit.edu/vanstee/courses/kcenter.pdf': 'https://www.geeksforgeeks.org/dsa/greedy-approximate-algorithm-for-k-centers-problem/',
  'http://fileadmin.cs.lth.se/cs/Personal/Andrzej_Lingas/superstring.pdf': 'https://math.mit.edu/~goemans/18434S06/superstring-lele.pdf',
  'https://www.cs.ucsb.edu/~suri/cs130b/BinPacking.txt': 'https://ics.uci.edu/~goodrich/teach/cs165/notes/BinPacking.pdf',
};

export function normalizeLink(input: string): string | undefined {
  const value = input.trim().replace(/\\([()])/g, '$1');
  if (value.startsWith('#')) {
    const route = parseRoute(value);
    if (route.name === 'home') return href.home();
    if (route.name === 'curriculum') {
      const c = findCurriculum(route.cid);
      return c ? href.curriculum(c.id) : undefined;
    }
    const hit = findModule(route.cid, route.mid);
    if (!hit) return undefined;
    return route.focusId ? href.section(hit.curriculum.id, hit.module.id, route.focusId) : href.module(hit.curriculum.id, hit.module.id);
  }
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return value;
  const candidate = /^www\./i.test(value) ? `https://${value}` : value;
  // Placeholder pada contoh API bukan alamat referensi yang dapat dikunjungi.
  if (/\$\{|https?:\/\/IP(?::|-LAN)|api\.keuanganmu\.com/i.test(candidate)) return undefined;
  try {
    const url = new URL(REPLACEMENTS[candidate] ?? candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    if (url.hostname === 'en.wikipedia.org') {
      url.protocol = 'https:';
      url.pathname = url.pathname.replace(/%E2%80%99/gi, '%27');
    }
    return url.href;
  } catch { return undefined; }
}

export function splitUrlSuffix(token: string) {
  let url = token;
  let suffix = '';
  while (/[.,;:!?']$/.test(url) || (url.endsWith(')') && (url.match(/\)/g)?.length ?? 0) > (url.match(/\(/g)?.length ?? 0))) {
    suffix = url.slice(-1) + suffix;
    url = url.slice(0, -1);
  }
  return { url, suffix };
}
