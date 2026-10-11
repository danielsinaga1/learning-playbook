import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { curricula, findCurriculum, findModule } = await server.ssrLoadModule('/src/data/index.ts');
  const { renderInline } = await server.ssrLoadModule('/src/lib/inline.tsx');
  const { normalizeLink } = await server.ssrLoadModule('/src/lib/links.ts');
  const { parseRoute } = await server.ssrLoadModule('/src/lib/router.ts');
  const errors = [];
  const internal = new Set();
  const external = new Set();
  const images = new Set();
  let checkedModules = 0;

  function checkTarget(target, context) {
    const route = parseRoute(target);
    if (route.name === 'home') return;
    const hit = route.name === 'module' ? findModule(route.cid, route.mid) : findCurriculum(route.cid);
    if (!hit) errors.push(`${context}: ${target}`);
    internal.add(target);
  }
  function walk(value, context, key = '') {
    if (typeof value === 'string') {
      if (key === 'code') return;
      if (key === 'src') { images.add(value); return; }
      // Audit tautan asli juga: tautan rusak tidak boleh sekadar hilang dari renderer.
      for (const m of value.matchAll(/\[[^\]\n]+\]\((#[^\s)]+)\)/g)) checkTarget(m[1], context);
      const html = renderToStaticMarkup(renderInline(value));
      for (const m of html.matchAll(/href="([^"]+)"/g)) {
        const target = m[1].replaceAll('&amp;', '&').replaceAll('&#x27;', "'");
        if (target.startsWith('#')) checkTarget(target, context);
        else if (/^https?:/.test(target)) external.add(target);
      }
    } else if (Array.isArray(value)) value.forEach((v) => walk(v, context, key));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => walk(v, context, k));
  }
  for (const c of curricula) {
    const ids = new Set();
    walk(c.intro, c.id);
    for (const m of c.modules) {
      assert(!ids.has(m.id), `Duplicate module ID: ${c.id}.${m.id}`);
      ids.add(m.id);
      checkTarget(`#${c.id}.${m.id}`, 'Module navigation');
      walk(m.blocks, `${c.id}.${m.id}`);
      checkedModules++;
    }
  }
  for (const src of images) {
    if (src.startsWith('data:')) continue;
    const path = src.startsWith('/src/') ? resolve(`.${src}`) : resolve('public', src);
    if (!existsSync(path)) errors.push(`Missing image: ${src}`);
  }

  // Kasus nyata yang sebelumnya tidak menghasilkan tautan yang benar.
  const cases = [
    ['Kunjungi https://go.dev/dl/.', 'https://go.dev/dl/'],
    ['[Pohon](https://en.wikipedia.org/wiki/Tree_(data_structure))', 'https://en.wikipedia.org/wiki/Tree_(data_structure)'],
    ['**https://docs.llamaindex.ai/en/stable/**', 'https://docs.llamaindex.ai/en/stable/'],
    ['[Materi lama](#ai.data-infrastructure)', '#llm.hacktiv8-data-infrastructure'],
    ['[Daftar isi](#java.persiapan-tools-mindset/section-0)', '#java.persiapan-tools-mindset/section-0'],
  ];
  for (const [text, target] of cases) assert(renderToStaticMarkup(renderInline(text)).includes(`href="${normalizeLink(target)}"`), `Link rendering failed: ${text}`);
  assert(!renderToStaticMarkup(renderInline('`https://go.dev/dl/`')).includes('<a'), 'Code must stay literal');
  assert(!renderToStaticMarkup(renderInline('[x](javascript:alert(1))')).includes('<a'), 'Unsafe protocol');
  assert(!renderToStaticMarkup(renderInline('https://api.example.com/${id}')).includes('<a'), 'API placeholder');
  assert.equal(normalizeLink('#ai.data-infrastructure'), '#llm.hacktiv8-data-infrastructure');
  assert.equal(normalizeLink('#does-not-exist'), undefined);

  console.log(`${curricula.length} curricula, ${checkedModules} modules, ${internal.size} internal targets, ${images.size} images, ${external.size} external URLs.`);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Internal links, imported images, aliases, and inline URL rendering: OK.');

  if (process.argv.includes('--external')) {
    const urls = [...external].filter((s) => !/localhost|127\.0\.0\.1|192\.168\.|10\.0\.2\.2/.test(s));
    const failures = [];
    const restricted = [];
    let cursor = 0;
    let ok = 0;
    async function worker() {
      while (cursor < urls.length) {
        const url = urls[cursor++];
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0' } });
          await response.body?.cancel();
          if (response.ok) ok++;
          else if ([401, 403, 429, 999].includes(response.status)) restricted.push({ url, status: response.status });
          else failures.push({ url, status: response.status });
        } catch (e) { failures.push({ url, error: e.message }); }
      }
    }
    await Promise.all(Array.from({ length: 8 }, worker));
    console.log(JSON.stringify({ accessible: ok, restricted, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  }
} finally { await server.close(); }
