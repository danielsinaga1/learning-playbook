import { useEffect, useRef, useState } from 'react';
import { curricula, findModule, groupByTrack, learning, resolveCid } from '../data';
import { href, type Route } from '../lib/router';
import { resetProgress, usePlaybook } from '../lib/store';
import { curriculumDone } from '../lib/stats';

const TOTAL = curricula.reduce((n, c) => n + learning(c).length, 0);
const COUNT = Object.fromEntries(curricula.map((c) => [c.id, learning(c).length]));
const GROUPS = Object.fromEntries(curricula.map((c) => [c.id, groupByTrack(c)]));

export function Rail({ route, onNavigate, inactive }: { route: Route; onNavigate: () => void; inactive?: boolean }) {
  const done = usePlaybook((s) => s.done);
  const [confirming, setConfirming] = useState(false);
  const [openC, setOpenC] = useState<Record<string, boolean>>({});
  const [openT, setOpenT] = useState<Record<string, boolean>>({});
  const scroller = useRef<HTMLDivElement>(null);
  const doneTotal = curricula.reduce((n, c) => n + curriculumDone(c, done), 0);

  const activeC = route.name === 'home' ? '' : (resolveCid(route.cid) ?? '');
  const activeM = route.name === 'module' ? (findModule(route.cid, route.mid)?.module.id ?? route.mid) : '';
  const activeTrack =
    activeM && curricula.find((c) => c.id === activeC)?.modules.find((m) => m.id === activeM)?.track;

  // Saat pindah halaman, buka kurikulum/track aktif dan pastikan item aktif terlihat.
  // Pindah kurikulum: tutup yang lain (akordeon) supaya sidebar tetap ringkas.
  useEffect(() => {
    if (activeC) setOpenC({ [activeC]: true });
  }, [activeC]);

  useEffect(() => {
    if (activeC && activeTrack) setOpenT((o) => ({ ...o, [`${activeC}/${activeTrack}`]: true }));
    const t = window.setTimeout(() => {
      scroller.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [activeC, activeM, activeTrack]);

  return (
    <nav className="rail" id="playbook-navigation" aria-label="Navigasi playbook" inert={inactive}>
      <button type="button" className="rail-close icon-btn" aria-label="Tutup menu navigasi" onClick={onNavigate}>×</button>
      <a className="brand" href={href.home()} onClick={onNavigate}>
        <span className="brand-mark" aria-hidden="true">
          PB
        </span>
        <span>
          <span className="brand-name">Backend Playbook</span>
          <span className="brand-sub">
            {curricula.length} kurikulum · {TOTAL} modul
          </span>
        </span>
      </a>

      <a className={`rail-home ${route.name === 'home' ? 'is-active' : ''}`} href={href.home()} onClick={onNavigate} aria-current={route.name === 'home' ? 'page' : undefined}>
        <span aria-hidden="true">⌂</span> Ruang belajar
      </a>
      <div className="rail-label">PERPUSTAKAAN MATERI</div>

      <div className="rail-progress">
        <div className="rail-progress-row">
          <span>Progres total</span>
          <span className="tnum">
            {doneTotal}/{TOTAL} modul
          </span>
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${(doneTotal / TOTAL) * 100}%` }} />
        </div>
      </div>

      <div className="rail-scroll" ref={scroller}>
        {curricula.map((c) => {
          const d = curriculumDone(c, done);
          const expanded = openC[c.id] ?? false;
          const groups = GROUPS[c.id];
          const multi = groups.length > 1;
          const isHere = activeC === c.id && !activeM;
          return (
            <section key={c.id} className={`rail-c hue-${c.hue} ${expanded ? 'is-open' : ''}`}>
              <div className={`rail-c-head ${isHere ? 'is-active' : ''}`}>
                <a
                  href={href.curriculum(c.id)}
                  onClick={() => {
                    setOpenC((o) => ({ ...o, [c.id]: true }));
                    onNavigate();
                  }}
                  aria-current={isHere ? 'page' : undefined}
                >
                  <span className="mono-chip">{c.monogram}</span>
                  <span className="rail-c-title">{c.short}</span>
                  <span className="rail-c-count tnum">
                    {d}/{COUNT[c.id]}
                  </span>
                </a>
                <button
                  type="button"
                  className="disclose"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? 'Tutup' : 'Buka'} daftar modul ${c.short}`}
                  onClick={() => setOpenC((o) => ({ ...o, [c.id]: !expanded }))}
                >
                  <span className="chev" aria-hidden="true" />
                </button>
              </div>

              {expanded &&
                groups.map((g) => {
                  const key = `${c.id}/${g.title}`;
                  const tOpen = !multi || (openT[key] ?? false);
                  const tDone = g.modules.filter(({ module: m }) => done[`${c.id}.${m.id}`]).length;
                  const isArch = g.modules.every(({ module: m }) => m.archive);
                  return (
                    <div key={key} className="rail-t">
                      {multi && (
                        <button
                          type="button"
                          className="rail-t-head"
                          aria-expanded={tOpen}
                          onClick={() => setOpenT((o) => ({ ...o, [key]: !tOpen }))}
                        >
                          <span className="chev" aria-hidden="true" />
                          <span className="rail-t-title">{g.title}</span>
                          <span className="rail-t-count tnum">
                            {isArch ? g.modules.length : `${tDone}/${g.modules.length}`}
                          </span>
                        </button>
                      )}
                      {tOpen && (
                        <ol className="rail-m">
                          {g.modules.map(({ module: m }) => {
                            const isActive = activeC === c.id && activeM === m.id;
                            const isDone = !!done[`${c.id}.${m.id}`];
                            return (
                              <li key={m.id}>
                                <a
                                  href={href.module(c.id, m.id)}
                                  className={`${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
                                  aria-current={isActive ? 'page' : undefined}
                                  onClick={onNavigate}
                                >
                                  <span className="rail-m-code tnum">{m.code}</span>
                                  <span className="rail-m-title">{m.title}</span>
                                  {!m.archive && <span className="tick" aria-label={isDone ? 'selesai' : undefined} />}
                                </a>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  );
                })}
            </section>
          );
        })}
      </div>

      <div className="rail-foot">
        <span className="rail-foot-note"><span aria-hidden="true" /> Progres tersimpan di browser ini</span>
        {confirming ? (
          <div className="confirm">
            <span>Hapus semua progres?</span>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                resetProgress();
                setConfirming(false);
              }}
            >
              Ya, reset
            </button>
            <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" className="btn-link" onClick={() => setConfirming(true)} disabled={!doneTotal}>
            Reset progres
          </button>
        )}
      </div>
    </nav>
  );
}
