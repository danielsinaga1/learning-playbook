import { useEffect, useState } from 'react';
import { curricula, findCurriculum, findModule, groupByTrack, learning } from '../data';
import { focusContent, href } from '../lib/router';
import { setReadingSize, toggleDone, toggleFocusMode, usePlaybook, visit, type ReadingSize } from '../lib/store';
import { countCode, countQuestions, countVocab, curriculumDone, moduleMeta } from '../lib/stats';
import type { Curriculum } from '../types';
import { Badge, Blocks, CurriculumCtx } from './Blocks';
import { plain } from '../lib/inline';

const ALL_MODULES = curricula.flatMap((c) => learning(c));
const STATS = {
  curricula: curricula.length,
  modules: ALL_MODULES.length,
  questions: ALL_MODULES.reduce((n, m) => n + countQuestions(m.blocks), 0),
  code: ALL_MODULES.reduce((n, m) => n + countCode(m.blocks), 0),
  vocab: ALL_MODULES.reduce((n, m) => n + countVocab(m.blocks), 0),
};

function Progress({ value, total, label }: { value: number; total: number; label?: string }) {
  return (
    <div className="progress">
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label}>
        <span style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
      </div>
      <span className="progress-n tnum">
        {value}/{total}
      </span>
    </div>
  );
}

/* ───────────── Beranda ───────────── */

export function Home() {
  const done = usePlaybook((s) => s.done);
  const last = usePlaybook((s) => s.last);
  const lastHit = last ? findModule(last.cid, last.mid) : undefined;
  const [filter, setFilter] = useState<'all' | 'started' | 'new' | 'done'>('all');
  const [query, setQuery] = useState('');
  const completed = curricula.reduce((n, c) => n + curriculumDone(c, done), 0);
  const featured = lastHit ?? { curriculum: curricula[0], module: learning(curricula[0])[0] };
  const filters = [
    { id: 'all', label: 'Semua kurikulum' },
    { id: 'started', label: 'Sedang dipelajari' },
    { id: 'new', label: 'Belum dimulai' },
    { id: 'done', label: 'Selesai' },
  ] as const;
  const visible = curricula.filter((c) => {
    const n = curriculumDone(c, done);
    const status = filter === 'all' || (filter === 'started' && n > 0 && n < learning(c).length) || (filter === 'new' && n === 0) || (filter === 'done' && n === learning(c).length);
    return status && `${c.title} ${c.description} ${(c.tracks ?? []).map((t) => t.title).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="page page-home">
      <div className="home-greeting"><span>Ruang belajar Daniel</span><span className="home-status"><span /> Selangkah lebih paham, setiap hari</span></div>
      <header className="hero">
        <div className="hero-copy">
        <p className="eyebrow"><span className="hero-dot" /> PERPUSTAKAAN PRIBADIMU</p>
        <h1>Belajar lebih terarah.<br /><span>Pahami lebih dalam.</span></h1>
        <p className="lede">
          Dari baris kode pertama hingga arsitektur sistem. Semua materi,
          contoh kode, dan latihanmu tersusun rapi dalam satu ruang belajar.
        </p>
        <a className="primary-link" href={href.module(featured.curriculum.id, featured.module.id)}>{lastHit ? 'Lanjutkan belajar' : 'Mulai belajar'} <span aria-hidden="true">↗</span></a>
        </div>
        <StudyIllustration />
        <dl className="hero-stats">
          <div>
            <dt>Kurikulum</dt>
            <dd className="tnum">{STATS.curricula}</dd>
          </div>
          <div>
            <dt>Modul</dt>
            <dd className="tnum">{STATS.modules.toLocaleString('id-ID')}</dd>
          </div>
          <div>
            <dt>Soal latihan</dt>
            <dd className="tnum">{STATS.questions}</dd>
          </div>
          <div>
            <dt>Contoh kode</dt>
            <dd className="tnum">{STATS.code.toLocaleString('id-ID')}</dd>
          </div>
          <div>
            <dt>Kosakata</dt>
            <dd className="tnum">{STATS.vocab.toLocaleString('id-ID')}</dd>
          </div>
        </dl>
      </header>

      <div className="learning-overview">
        <a className={`resume hue-${featured.curriculum.hue}`} href={href.module(featured.curriculum.id, featured.module.id)}>
          <span className="eyebrow">{lastHit ? 'LANJUTKAN DARI SINI' : 'LANGKAH PERTAMA'}</span>
          <span className="resume-title">
            {featured.module.title}
          </span>
          <span className="resume-ctx">
            <span className="mono-chip">{featured.curriculum.monogram}</span> {featured.curriculum.short} · Modul {featured.module.code}
          </span>
          <span className="resume-go" aria-hidden="true">
            →
          </span>
        </a>
        <div className="learning-progress">
          <span className="eyebrow">PERJALANAN BELAJARMU</span>
          <p><strong className="tnum">{completed}</strong><span> dari {STATS.modules} modul selesai</span></p>
          <Progress value={completed} total={STATS.modules} label="Progres seluruh materi" />
        </div>
      </div>

      <div className="library-head"><div><h2>Jelajahi kurikulum</h2><p>Pilih bidang yang ingin kamu kuasai, lalu pelajari satu per satu.</p></div><span className="library-count">{visible.length} kurikulum</span></div>
      <div className="library-toolbar">
        <div className="library-filters" role="group" aria-label="Filter kurikulum">
          {filters.map((f) => <button type="button" key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
        </div>
        <label className="library-search"><span className="search-icon" aria-hidden="true" /><input type="search" placeholder="Cari kurikulum…" aria-label="Cari kurikulum" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      </div>
      {visible.length === 0 && <div className="library-empty"><h3>Belum ada kurikulum di sini</h3><p>{query ? 'Coba kata kunci lain untuk menemukan materi.' : 'Pilih filter lain atau mulai belajar dan tandai modul yang sudah kamu pahami.'}</p><button type="button" className="btn-ghost" onClick={() => { setFilter('all'); setQuery(''); }}>Tampilkan semua kurikulum</button></div>}
      <div className="c-grid">
        {visible.map((c) => {
          const d = curriculumDone(c, done);
          const mods = learning(c);
          const next = mods.find((m) => !done[`${c.id}.${m.id}`]) ?? mods[0];
          return (
            <article key={c.id} className={`c-card hue-${c.hue}`}>
              <div className="c-card-top">
                <span className="mono-chip lg">{c.monogram}</span>
                <span className={`c-card-n tnum ${d === mods.length ? 'all-done' : ''}`}>{d === mods.length ? '✓ Selesai' : `${mods.length} modul`}</span>
              </div>
              <h3>
                <a href={href.curriculum(c.id)}>{c.title}</a>
              </h3>
              <p>{c.description}</p>
              {tracksOf(c).length > 1 && (
                <ul className="c-card-tracks" aria-label="Track">
                  {tracksOf(c).slice(0, 3).map((t) => (
                    <li key={t.title}>{t.title}</li>
                  ))}
                  {tracksOf(c).length > 3 && <li>+{tracksOf(c).length - 3} track</li>}
                </ul>
              )}
              <Progress value={d} total={mods.length} label={`Progres ${c.short}`} />
              <div className="c-card-footer"><a className="c-card-browse" href={href.curriculum(c.id)}>Lihat kurikulum <span aria-hidden="true">↗</span></a><a className="c-card-cta" href={href.module(c.id, next.id)} title={next.title}>{d === 0 ? 'Mulai' : d === mods.length ? 'Ulas lagi' : 'Lanjut'}</a></div>
            </article>
          );
        })}
      </div>
      <p className="home-foot">Dibuat untuk belajar dengan tenang. Satu modul, satu pemahaman baru.</p>
    </div>
  );
}

function StudyIllustration() {
  return <div className="study-art" aria-hidden="true">
    <svg viewBox="0 0 300 230" fill="none">
      <circle cx="159" cy="118" r="96" fill="currentColor" opacity=".055" />
      <circle cx="159" cy="118" r="77" stroke="currentColor" strokeDasharray="3 7" opacity=".16" />
      <path d="M57 162 164 193 263 155 158 126Z" fill="#b4d5c5" stroke="#457e69" strokeWidth="1.5" />
      <path d="m57 162 1 17 106 31 99-38v-17l-99 38Z" fill="#e8efe8" stroke="#457e69" strokeWidth="1.5" />
      <path d="m69 139 107 31 86-33-107-31Z" fill="#f1d9a5" stroke="#998558" strokeWidth="1.5" />
      <path d="m69 139 1 16 106 31 86-33v-16l-86 33Z" fill="#fcf6e6" stroke="#998558" strokeWidth="1.5" />
      <path d="m56 110 105 31 99-38-105-31Z" fill="#2d7963" stroke="#235a4b" strokeWidth="1.5" />
      <path d="m56 110 1 17 104 31 99-38v-17l-99 38Z" fill="#f2f6ef" stroke="#235a4b" strokeWidth="1.5" />
      <path d="m57 110 104 31v17L57 127Z" fill="#235a4b" />
      <path d="m115 112 26 8 54-20-26-8Z" stroke="#bce4d1" strokeWidth="1.5" />
      <path d="m130 105 11 3m6 2 10 3" stroke="#bce4d1" strokeWidth="1.5" />
      <path d="m216 43 2 9 9 2-9 2-2 9-2-9-9-2 9-2Z" fill="#9eb5a2" />
      <path d="m80 68 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#c5a968" />
      <circle cx="241" cy="191" r="4" fill="#c5a968" />
      <rect x="88" y="34" width="66" height="27" rx="13.5" fill="#fffaf0" stroke="#d9d9c9" />
      <text x="121" y="51.5" textAnchor="middle" fill="#42725f" fontFamily="monospace" fontSize="12">&lt;/&gt;</text>
    </svg>
    <span>MATERI RAPI. PIKIRAN JERNIH.</span>
  </div>;
}

/* ───────────── Ringkasan kurikulum ───────────── */

export function CurriculumView({ cid }: { cid: string }) {
  const c = findCurriculum(cid);
  const done = usePlaybook((s) => s.done);
  useEffect(() => { window.scrollTo(0, 0); }, [cid]);
  if (!c) return <NotFound />;
  const d = curriculumDone(c, done);
  const total = learning(c).length;
  const nTracks = tracksOf(c).length;

  return (
    <CurriculumCtx.Provider value={c.id}>
      <div className={`page hue-${c.hue}`}>
        <header className="page-head">
          <p className="eyebrow">
            <span className="mono-chip">{c.monogram}</span> Kurikulum
            {nTracks > 1 ? ` · ${nTracks} track` : ''} · {total} modul
          </p>
          <h1>{c.title}</h1>
          <p className="lede">{c.description}</p>
          <Progress value={d} total={total} label="Progres kurikulum" />
        </header>

        {c.intro && <Blocks blocks={c.intro} />}

        {c.sources && c.sources.length > 0 && (
          <p className="sources">
            <span className="eyebrow">Sumber</span> {c.sources.join(' · ')}
          </p>
        )}

        {groupByTrack(c).map((g) => {
          const gd = g.modules.filter(({ module: m }) => done[`${c.id}.${m.id}`]).length;
          const isArch = g.modules.every(({ module: m }) => m.archive);
          return (
            <section key={g.title || 'modul'} className={`track ${isArch ? 'track-archive' : ''}`}>
              <header className="track-head">
                <h2>{g.title || 'Daftar modul'}</h2>
                {g.summary && <p>{g.summary}</p>}
                <span className="track-n tnum">
                  {isArch ? `${g.modules.length} dokumen` : `${gd}/${g.modules.length} selesai`}
                </span>
              </header>
              <ol className="m-list">
                {g.modules.map(({ module: m }) => {
                  const isDone = !!done[`${c.id}.${m.id}`];
                  const meta = moduleMeta(m);
                  return (
                    <li key={m.id} className={isDone ? 'is-done' : ''}>
                      <a href={href.module(c.id, m.id)}>
                        <span className="m-code tnum">{m.code}</span>
                        <span className="m-body">
                          <span className="m-title">{m.title}</span>
                          {m.summary && <span className="m-sum">{m.summary}</span>}
                        </span>
                        <span className="m-meta">
                          {m.level && <LevelBadge level={m.level} />}
                          {meta.map((x) => (
                            <span key={x} className="chip">
                              {x}
                            </span>
                          ))}
                        </span>
                        <span className="m-state">{isDone ? 'Selesai' : ''}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </CurriculumCtx.Provider>
  );
}

/** Track belajar (tanpa track arsip). */
function tracksOf(c: Curriculum) {
  return (c.tracks ?? []).filter((t) => t.title !== 'Arsip Sumber');
}

function LevelBadge({ level }: { level: 'Easy' | 'Med' | 'Hard' }) {
  const tone = level === 'Easy' ? 'low' : level === 'Med' ? 'mid' : 'high';
  return <Badge tone={tone}>{level}</Badge>;
}

/* ───────────── Modul ───────────── */

export function ModuleView({ cid, mid, focusId }: { cid: string; mid: string; focusId?: string }) {
  const hit = findModule(cid, mid);
  const exists = !!hit;
  const isDone = usePlaybook((s) => !!s.done[`${hit?.curriculum.id ?? cid}.${hit?.module.id ?? mid}`]);
  const readingSize = usePlaybook((s) => s.readingSize);
  const focusMode = usePlaybook((s) => s.focusMode);
  const realCid = hit?.curriculum.id ?? cid;
  const realMid = hit?.module.id ?? mid;

  useEffect(() => {
    if (!exists) return;
    visit(realCid, realMid);
    if (focusId) {
      // beri waktu render, lalu minta blok Q&A membuka pertanyaan tujuan
      const frame = requestAnimationFrame(() => focusContent(focusId));
      return () => cancelAnimationFrame(frame);
    } else {
      window.scrollTo(0, 0);
    }
  }, [realCid, realMid, exists, focusId]);

  if (!hit) return <NotFound />;
  const { curriculum: c, module: m, index } = hit;
  // Pager hanya berpindah di antara modul sejenis (belajar ↔ belajar, arsip ↔ arsip).
  const sameKind = (x?: (typeof c.modules)[number]) => (x && !!x.archive === !!m.archive ? x : undefined);
  const prev = sameKind(c.modules[index - 1]);
  const next = sameKind(c.modules[index + 1]);
  const total = learning(c).length;
  const meta = moduleMeta(m);
  // Jangan ulangi ringkasan bila kalimatnya persis pembuka paragraf pertama.
  const first = m.blocks[0];
  const lede =
    first?.type === 'p' && plain(first.text).replace(/\s+/g, ' ').startsWith(m.summary.replace(/…$/, '')) ? '' : m.summary;

  return (
    <CurriculumCtx.Provider value={c.id}>
      <article className={`page reader-page reading-${readingSize} hue-${c.hue}`}>
        <div className="reader-toolbar">
          <a className="reader-back" href={href.curriculum(c.id)}><span aria-hidden="true">←</span> {c.short}</a>
          <div className="reader-controls">
            <label className="reading-select"><span aria-hidden="true">Aa</span><select aria-label="Ukuran teks materi" value={readingSize} onChange={(e) => setReadingSize(e.target.value as ReadingSize)}><option value="compact">Ringkas</option><option value="comfortable">Nyaman</option><option value="large">Besar</option></select></label>
            <button type="button" className="focus-btn" aria-pressed={focusMode} onClick={toggleFocusMode}><span aria-hidden="true">{focusMode ? '⊞' : '⌗'}</span> {focusMode ? 'Keluar fokus' : 'Mode fokus'}</button>
          </div>
        </div>
        <div className="reader-layout">
        <div className="reader-sheet">
        <header className="page-head">
          <p className="eyebrow">
            <a href={href.curriculum(c.id)} className="mono-chip">
              {c.monogram}
            </a>{' '}
            {c.short}
            {m.track ? ` · ${m.track}` : ''} · {m.archive ? m.code : `Modul ${m.code} dari ${total}`}
          </p>
          <h1>{m.title}</h1>
          {lede && <p className="lede">{lede}</p>}
          {(m.level || meta.length > 0) && (
            <div className="head-meta">
              {m.level && <LevelBadge level={m.level} />}
              {meta.map((x) => (
                <span key={x} className="chip">
                  {x}
                </span>
              ))}
              {isDone && <span className="chip chip-done">Selesai</span>}
            </div>
          )}
        </header>

        <div className="reading-content"><Blocks blocks={m.blocks} anchorPrefix="section" /></div>

        {m.source && (
          <p className="sources">
            <span className="eyebrow">Sumber</span> {m.source}
          </p>
        )}

        <footer className="m-foot">
          {!m.archive && (
            <button type="button" className={`done-btn ${isDone ? 'is-done' : ''}`} aria-pressed={isDone} onClick={() => toggleDone(c.id, m.id)}>
              <span className="tick" aria-hidden="true" />
              {isDone ? 'Modul selesai — klik untuk batalkan' : 'Tandai modul ini selesai'}
            </button>
          )}
          <nav className="pager" aria-label="Modul sebelumnya dan berikutnya">
            {prev ? (
              <a href={href.module(c.id, prev.id)} className="pager-prev">
                <span className="eyebrow">Sebelumnya</span>
                <span>
                  {prev.code} · {prev.title}
                </span>
              </a>
            ) : (
              <a href={href.curriculum(c.id)} className="pager-prev">
                <span className="eyebrow">Kembali</span>
                <span>Ringkasan kurikulum</span>
              </a>
            )}
            {next ? (
              <a href={href.module(c.id, next.id)} className="pager-next">
                <span className="eyebrow">Berikutnya</span>
                <span>
                  {next.code} · {next.title}
                </span>
              </a>
            ) : (
              <NextCurriculum current={c} />
            )}
          </nav>
        </footer>
        </div>
        <TableOfContents cid={c.id} mid={m.id} blocks={m.blocks} />
        </div>
      </article>
    </CurriculumCtx.Provider>
  );
}

function TableOfContents({ cid, mid, blocks }: { cid: string; mid: string; blocks: import('../types').Block[] }) {
  const sections = blocks.flatMap((b, i) => b.type === 'h' ? [{ id: `section-${i}`, title: plain(b.text), sub: b.level === 4 }] : []);
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const [progress, setProgress] = useState(0);
  const [contentsOpen, setContentsOpen] = useState(() => window.matchMedia('(min-width: 1251px)').matches);
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>('.reader-sheet');
    if (!sheet) return;
    let frame = 0;
    const update = () => {
      const bounds = sheet.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - window.innerHeight + 90);
      setProgress(Math.min(100, Math.max(0, Math.round((90 - bounds.top) / distance * 100))));
      const headings = sheet.querySelectorAll<HTMLElement>('[id^="section-"]');
      let current = headings[0]?.id ?? '';
      headings.forEach((h) => { if (h.getBoundingClientRect().top <= 180) current = h.id; });
      setActive(current);
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const observer = new ResizeObserver(onScroll);
    observer.observe(sheet);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [cid, mid]);

  return <aside className="reader-aside">
    <details className="contents" open={contentsOpen} onToggle={(e) => setContentsOpen(e.currentTarget.open)}>
      <summary>DALAM MODUL INI <span className="chev" aria-hidden="true" /></summary>
      {sections.length ? <nav aria-label="Daftar isi modul"><ol>{sections.map((s) => <li key={s.id} className={s.sub ? 'is-sub' : ''}><a href={href.section(cid, mid, s.id)} aria-current={active === s.id ? 'location' : undefined} onClick={() => { if (window.location.hash === href.section(cid, mid, s.id)) focusContent(s.id); }}>{s.title}</a></li>)}</ol></nav> : <p className="contents-empty">Baca materi dan latihan di halaman ini.</p>}
    </details>
    <div className="reading-progress"><span>Posisi membaca <strong className="tnum">{progress}%</strong></span><div className="bar" role="progressbar" aria-label="Posisi membaca" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div><p>Luangkan waktu. Pahami satu bagian sebelum melanjutkan.</p></div>
    <a className="back-to-top" href={href.module(cid, mid)} onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}>↑ Kembali ke atas</a>
  </aside>;
}

function NextCurriculum({ current }: { current: Curriculum }) {
  const i = curricula.findIndex((c) => c.id === current.id);
  const nextC = curricula[(i + 1) % curricula.length];
  if (nextC.id === current.id) return <span />;
  return (
    <a href={href.curriculum(nextC.id)} className="pager-next">
      <span className="eyebrow">Kurikulum berikutnya</span>
      <span>{nextC.title}</span>
    </a>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Tidak ditemukan</p>
        <h1>Halaman ini tidak ada</h1>
        <p className="lede">
          Link mungkin sudah berubah. <a href={href.home()}>Kembali ke beranda</a> untuk memilih kurikulum.
        </p>
      </header>
    </div>
  );
}
