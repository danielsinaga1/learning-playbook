import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import type { Block, BadgeTone, Cell, CodeLang, QAItem, Tone, VocabItem } from '../types';
import { Inline } from '../lib/inline';
import { highlight } from '../lib/highlight';
import { setQA, toggleCheck, usePlaybook, type QAStatus } from '../lib/store';

/** Curriculum aktif, dipakai komponen Q&A untuk menyimpan status. */
export const CurriculumCtx = createContext<string>('');

export function Blocks({ blocks, anchorPrefix }: { blocks: Block[]; anchorPrefix?: string }) {
  return (
    <div className="blocks">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} anchorId={anchorPrefix && b.type === 'h' ? `${anchorPrefix}-${i}` : undefined} />
      ))}
    </div>
  );
}

function BlockView({ block: b, anchorId }: { block: Block; anchorId?: string }) {
  switch (b.type) {
    case 'h':
      return b.level === 4 ? <h4 id={anchorId} tabIndex={anchorId ? -1 : undefined} className="b-h4"><Inline text={b.text} /></h4> : <h3 id={anchorId} tabIndex={anchorId ? -1 : undefined} className="b-h"><Inline text={b.text} /></h3>;
    case 'p':
      return (
        <p className="b-p">
          <Inline text={b.text} />
        </p>
      );
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return (
        <Tag className="b-list">
          {b.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'callout':
      return <Callout tone={b.tone} title={b.title} text={b.text} />;
    case 'code':
      return <CodeBlock code={b.code} lang={b.lang} title={b.title} />;
    case 'skills':
      return (
        <dl className="b-skills">
          {b.items.map((s) => (
            <div key={s.name} className="skill">
              <dt>{s.name}</dt>
              <dd>
                <Inline text={s.desc} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'cards':
      return (
        <div className={`b-cards n${Math.min(b.items.length, 3)}`}>
          {b.items.map((c) => (
            <div key={c.title} className="cardcell">
              {c.label && <span className="eyebrow">{c.label}</span>}
              <strong>{c.title}</strong>
              <p>
                <Inline text={c.text} />
              </p>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className="b-table">
          <table>
            {b.head.length > 0 && (
              <thead>
                <tr>
                  {b.head.map((h, i) => (
                    <th key={i}>
                      <Inline text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {b.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <CellView cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'steps':
      return (
        <ol className="b-steps">
          {b.items.map((s, i) => (
            <li key={i} className="step">
              <span className="step-n" aria-hidden="true">
                {i + 1}
              </span>
              <div className="step-body">
                <h4>{s.title}</h4>
                {s.text && (
                  <p>
                    <Inline text={s.text} />
                  </p>
                )}
                {s.blocks && <Blocks blocks={s.blocks} />}
              </div>
            </li>
          ))}
        </ol>
      );
    case 'tags':
      return (
        <div className="b-tags">
          {b.items.map((t) => (
            <Badge key={t.label} tone={t.tone ?? 'neutral'}>
              {t.label}
            </Badge>
          ))}
        </div>
      );
    case 'tabs':
      return <Tabs tabs={b.tabs} />;
    case 'qa':
      return <QAList items={b.items} />;
    case 'vocab':
      return <Vocab items={b.items} />;
    case 'checklist':
      return <Checklist id={b.id} items={b.items} />;
    case 'details':
      return <Details summary={b.summary} blocks={b.blocks} />;
    case 'image':
      return <ImageBlock src={b.src} alt={b.alt} caption={b.caption} />;
  }
}

function ImageBlock({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <figure className="figure">
    <button type="button" className="figure-open" aria-label={`Perbesar gambar: ${alt}`} onClick={() => setOpen(true)}>
      <img src={src} alt={alt} loading="lazy" />
      <span className="figure-zoom" aria-hidden="true">⤢ Perbesar</span>
    </button>
    {caption && <figcaption><Inline text={caption} /></figcaption>}
    <dialog ref={dialog} className="image-dialog" aria-label={alt} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      {open && <><div className="image-dialog-head"><span>{alt}</span><button type="button" className="icon-btn" aria-label="Tutup gambar" onClick={() => dialog.current?.close()}>×</button></div><div className="image-dialog-body"><img src={src} alt={alt} /></div><a className="image-download" href={src} download>Unduh gambar ↓</a></>}
    </dialog>
  </figure>;
}

function Checklist({ id, items }: { id: string; items: string[] }) {
  const cid = useContext(CurriculumCtx);
  const checks = usePlaybook((s) => s.checks);
  const key = (i: number) => `${cid}.${id}.${i}`;
  const n = items.filter((_, i) => checks[key(i)]).length;
  return (
    <section className="checklist">
      <div className="checklist-head">
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${(n / items.length) * 100}%` }} />
        </div>
        <span className="checklist-n tnum">
          {n}/{items.length} tercapai
        </span>
      </div>
      <ul>
        {items.map((it, i) => {
          const on = !!checks[key(i)];
          return (
            <li key={i} className={on ? 'is-on' : ''}>
              <label>
                <input type="checkbox" id={`chk-${id}-${i}`} checked={on} onChange={() => toggleCheck(key(i))} />
                <span className="box" aria-hidden="true" />
                <span className="txt">
                  <Inline text={it} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CellView({ cell }: { cell: Cell }) {
  if (typeof cell === 'string') return <Inline text={cell} />;
  return <Badge tone={cell.badge}>{cell.text}</Badge>;
}

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const TONE_LABEL: Record<Tone, string> = {
  info: 'Catatan',
  tip: 'Tips',
  warn: 'Perhatian',
  success: 'Bagus',
};

function Callout({ tone, title, text }: { tone: Tone; title?: string; text: string }) {
  // Baris berawalan "• " dikelompokkan menjadi daftar.
  const parts: (string | string[])[] = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('• ')) {
      const last = parts[parts.length - 1];
      if (Array.isArray(last)) last.push(line.slice(2));
      else parts.push([line.slice(2)]);
    } else if (line.trim()) {
      parts.push(line);
    }
  }
  return (
    <aside className={`callout callout-${tone}`}>
      <span className="callout-k">{title ?? TONE_LABEL[tone]}</span>
      {parts.map((p, i) =>
        Array.isArray(p) ? (
          <ul key={i}>
            {p.map((li, j) => (
              <li key={j}>
                <Inline text={li} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <Inline text={p} />
          </p>
        ),
      )}
    </aside>
  );
}

const LANG_LABEL: Record<CodeLang, string> = {
  java: 'Java',
  go: 'Go',
  ts: 'TypeScript',
  js: 'JavaScript',
  python: 'Python',
  dart: 'Dart',
  bash: 'Shell',
  docker: 'Dockerfile',
  yaml: 'YAML',
  json: 'JSON',
  sql: 'SQL',
  graphql: 'GraphQL',
  proto: 'Protobuf',
  rust: 'Rust',
  hcl: 'Terraform',
  html: 'HTML',
  css: 'CSS',
  properties: 'Properties',
  xml: 'XML',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  php: 'PHP',
  kotlin: 'Kotlin',
  text: 'Teks',
};

export function CodeBlock({ code, lang, title }: { code: string; lang: CodeLang; title?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className="code">
      <figcaption>
        <span className="code-title">{title ?? LANG_LABEL[lang]}</span>
        <span className="code-meta">
          {title && <span className="code-lang">{LANG_LABEL[lang]}</span>}
          <button type="button" className="code-copy" onClick={copy} aria-live="polite">
            {copied ? 'Tersalin' : 'Salin'}
          </button>
        </span>
      </figcaption>
      <pre>
        <code>{highlight(code, lang)}</code>
      </pre>
    </figure>
  );
}

/** Bagian lipat: isinya baru dirender (dan gambarnya dimuat) saat dibuka. */
function Details({ summary, blocks }: { summary: string; blocks: Block[] }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="b-details" onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        <Inline text={summary} />
      </summary>
      {open && (
        <div className="b-details-body">
          <Blocks blocks={blocks} />
        </div>
      )}
    </details>
  );
}

function Tabs({ tabs }: { tabs: { label: string; blocks: Block[] }[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  return (
    <div className="b-tabs">
      <div className="tablist" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            id={`${uid}-t${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-p${i}`}
            className="tab"
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" id={`${uid}-p${i}`} aria-labelledby={`${uid}-t${i}`} hidden={i !== active}>
          {i === active && <Blocks blocks={t.blocks} />}
        </div>
      ))}
    </div>
  );
}

/* ───────────── Q&A / mode latihan ───────────── */

type Filter = 'all' | 'unrated' | 'review' | 'known';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'unrated', label: 'Belum dinilai' },
  { id: 'review', label: 'Ulangi' },
  { id: 'known', label: 'Paham' },
];

function QAList({ items }: { items: QAItem[] }) {
  const cid = useContext(CurriculumCtx);
  const qa = usePlaybook((s) => s.qa);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const statusOf = (id: string): QAStatus | undefined => qa[`${cid}.${id}`];
  const counts = {
    all: items.length,
    known: items.filter((q) => statusOf(q.id) === 'known').length,
    review: items.filter((q) => statusOf(q.id) === 'review').length,
    unrated: items.filter((q) => !statusOf(q.id)).length,
  };

  const visible = items.filter((q) => {
    const s = statusOf(q.id);
    if (filter === 'all') return true;
    if (filter === 'unrated') return !s;
    return s === filter;
  });

  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const allOpen = visible.length > 0 && visible.every((q) => open[q.id]);
  const setAll = (v: boolean) => {
    setOpen((o) => ({ ...o, ...Object.fromEntries(visible.map((q) => [q.id, v])) }));
    if (v) setRevealed((r) => ({ ...r, ...Object.fromEntries(visible.map((q) => [q.id, true])) }));
  };

  // Buka & scroll ke pertanyaan jika dituju dari pencarian.
  useEffect(() => {
    const onFocus = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!items.some((q) => q.id === id)) return;
      setFilter('all');
      setOpen((o) => ({ ...o, [id]: true }));
      requestAnimationFrame(() => {
        const el = document.getElementById(`q-${id}`);
        el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        el?.querySelector<HTMLButtonElement>('button.qa-q')?.focus({ preventScroll: true });
      });
    };
    window.addEventListener('playbook:focus', onFocus);
    return () => window.removeEventListener('playbook:focus', onFocus);
  }, [items]);

  const pct = (n: number) => `${(n / items.length) * 100}%`;

  return (
    <section className="qa">
      <div className="qa-summary">
        <div className="qa-meter" aria-hidden="true">
          <span className="seg seg-known" style={{ width: pct(counts.known) }} />
          <span className="seg seg-review" style={{ width: pct(counts.review) }} />
        </div>
        <p className="qa-counts">
          <span className="dot dot-known" /> {counts.known} paham
          <span className="dot dot-review" /> {counts.review} ulangi
          <span className="dot dot-none" /> {counts.unrated} belum dinilai
        </p>
      </div>

      <div className="qa-toolbar">
        <div className="seg-control" role="group" aria-label="Filter pertanyaan">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="num">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn-ghost" onClick={() => setAll(!allOpen)} disabled={!visible.length}>
          {allOpen ? 'Tutup semua' : 'Buka semua'}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="qa-empty">
          {filter === 'review'
            ? 'Belum ada pertanyaan yang ditandai Ulangi.'
            : filter === 'known'
              ? 'Belum ada pertanyaan yang ditandai Paham.'
              : 'Semua pertanyaan sudah dinilai.'}
        </p>
      ) : (
        <ol className="qa-list">
          {visible.map((q) => {
            const s = statusOf(q.id);
            const isOpen = !!open[q.id];
            return (
              <li key={q.id} id={`q-${q.id}`} className={`qa-item ${isOpen ? 'is-open' : ''} ${s ? `is-${s}` : ''}`}>
                <button
                  type="button"
                  className="qa-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen((o) => ({ ...o, [q.id]: !isOpen }))}
                >
                  <span className="qa-id">{q.id}</span>
                  <span className="qa-text">
                    <Inline text={q.q} />
                  </span>
                  {s && <span className={`qa-state st-${s}`}>{s === 'known' ? 'Paham' : 'Ulangi'}</span>}
                  <span className="chev" aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="qa-a">
                    {q.prompt && q.prompt.length > 0 && (
                      <div className="qa-prompt">
                        <Blocks blocks={q.prompt} />
                      </div>
                    )}
                    {q.prompt && q.prompt.length > 0 && !revealed[q.id] ? (
                      <button type="button" className="reveal-btn" onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}>
                        Lihat jawaban
                      </button>
                    ) : (
                      <>
                        {q.prompt && q.prompt.length > 0 && <span className="qa-label">Jawaban</span>}
                        <Blocks blocks={q.a} />
                      </>
                    )}
                    <div className="assess" role="group" aria-label="Nilai pemahamanmu">
                      <span className="assess-k">Seberapa paham?</span>
                      <button
                        type="button"
                        className="assess-btn known"
                        aria-pressed={s === 'known'}
                        onClick={() => setQA(cid, q.id, 'known')}
                      >
                        Paham
                      </button>
                      <button
                        type="button"
                        className="assess-btn review"
                        aria-pressed={s === 'review'}
                        onClick={() => setQA(cid, q.id, 'review')}
                      >
                        Ulangi
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/* ───────────── Kosakata / mode hafalan ───────────── */

function Vocab({ items }: { items: VocabItem[] }) {
  const [quiz, setQuiz] = useState(false);
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const uid = useId();

  const toggleQuiz = () => {
    setQuiz((q) => !q);
    setShown({});
  };

  return (
    <section className={`vocab ${quiz ? 'is-quiz' : ''}`}>
      <div className="vocab-bar">
        <span className="vocab-n">{items.length} kata &amp; frasa</span>
        <label className="switch" htmlFor={`${uid}-quiz`}>
          <input id={`${uid}-quiz`} type="checkbox" checked={quiz} onChange={toggleQuiz} />
          <span className="switch-track" aria-hidden="true" />
          Mode hafalan
        </label>
      </div>
      <ul className="vocab-list">
        {items.map((v, i) => {
          const open = !quiz || shown[i];
          return (
            <li key={i} className={open ? 'is-shown' : ''}>
              <button
                type="button"
                className="vocab-row"
                onClick={() => quiz && setShown((s) => ({ ...s, [i]: !s[i] }))}
                aria-expanded={quiz ? !!shown[i] : undefined}
                tabIndex={quiz ? 0 : -1}
              >
                <span className="vocab-term">{v.term}</span>
                <span className="vocab-meaning">
                  {open ? v.meaning : 'Ketuk untuk melihat arti'}
                  {open && v.synonyms && <span className="vocab-syn">≈ {v.synonyms}</span>}
                </span>
                {v.example && <span className="vocab-ex">{open ? v.example : ''}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
