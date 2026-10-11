import { useEffect, useMemo, useRef, useState } from 'react';
import { curricula } from '../data';
import { buildIndex, search, snippet, type SearchEntry } from '../lib/search';
import { navigate } from '../lib/router';

const INDEX = buildIndex(curricula);
const HUE = Object.fromEntries(curricula.map((c) => [c.id, c.hue]));

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(INDEX, q), [q]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.current?.focus();
    return () => previous?.focus({ preventScroll: true });
  }, []);

  useEffect(() => { document.getElementById(`search-result-${sel}`)?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const go = (e: SearchEntry) => {
    onClose();
    navigate(`${e.cid}.${e.mid}`, e.focusId);
  };

  const onKey = (ev: React.KeyboardEvent) => {
    if (ev.key === 'Escape') onClose();
    else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setSel((s) => Math.max(0, Math.min(s + 1, results.length - 1)));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (ev.key === 'Enter' && results[sel]) {
      ev.preventDefault();
      go(results[sel]);
    } else if (ev.key === 'Tab') {
      const dialog = ev.currentTarget;
      const controls = [...dialog.querySelectorAll<HTMLElement>('input, button')];
      const first = controls[0];
      const last = controls.at(-1);
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last?.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first?.focus(); }
    }
  };

  return (
    <div className="scrim" onMouseDown={onClose}>
      <div
        className="search"
        role="dialog"
        aria-modal="true"
        aria-label="Cari di playbook"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="search-field">
          <span className="search-icon" aria-hidden="true" />
          <input
            ref={input}
            id="search-input"
            type="search"
            placeholder="Cari modul, konsep, atau pertanyaan… (mis. HashMap, IAM, knapsack)"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            autoComplete="off"
            aria-label="Kata kunci pencarian"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[sel] ? `search-result-${sel}` : undefined}
          />
          <button type="button" className="search-close" aria-label="Tutup pencarian" onClick={onClose}>×</button>
        </div>
        <ul className="search-results" id="search-results" role="listbox">
          {q && results.length === 0 && <li className="search-empty">Tidak ada hasil untuk “{q}”.</li>}
          {!q && (
            <li className="search-empty">
              Ketik kata kunci. Gunakan <kbd>↑</kbd> <kbd>↓</kbd> untuk memilih dan <kbd>Enter</kbd> untuk membuka.
            </li>
          )}
          {results.map((r, i) => (
            <li key={`${r.cid}.${r.mid}.${r.focusId ?? ''}`} id={`search-result-${i}`} role="option" aria-selected={i === sel}>
              <button type="button" className={`hue-${HUE[r.cid]}`} onMouseEnter={() => setSel(i)} onClick={() => go(r)}>
                <span className="sr-kind">{r.kind === 'question' ? 'Pertanyaan' : 'Modul'}</span>
                <span className="sr-title">{r.title}</span>
                <span className="sr-ctx">{r.context}</span>
                <span className="sr-snip">{snippet(r.text, q)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
