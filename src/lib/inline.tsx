import { Fragment, type ReactNode } from 'react';
import { normalizeLink, splitUrlSuffix } from './links';

// Urutan alternatif penting: escape dulu, lalu tebal sebelum miring.
const TOKEN =
  /(\\[\\*`[\]]|\*\*(?:\\.|[^*\\])+\*\*|`[^`\n]+`|\[[^\]\n]+\]\((?:\\.|[^()\s]|\([^()\s]*\))+\)|\*(?!\s)(?:\\.|[^*\\\n])+?\*|(?:https?:\/\/|www\.)[^\s<>"`*[\]\\]+|\n)/gi;

/** Render inline markup sederhana: **tebal**, *miring*, `kode`, [teks](url), \* literal, baris baru. */
export function Inline({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

export function renderInline(text: string, linkify = true): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push(<Fragment key={i++}>{buf}</Fragment>);
      buf = '';
    }
  };
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    buf += text.slice(last, start);
    const tok = match[0];
    last = start + tok.length;
    if (tok.startsWith('\\')) {
      buf += tok.slice(1);
      continue;
    }
    flush();
    if (tok === '\n') {
      out.push(<br key={i++} />);
    } else if (tok.startsWith('**')) {
      out.push(<strong key={i++}>{renderInline(tok.slice(2, -2), linkify)}</strong>);
    } else if (tok.startsWith('`')) {
      out.push(
        <code key={i++} className="ic">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith('[')) {
      const m = /^\[([^\]]+)\]\((.+)\)$/.exec(tok);
      if (m) {
        const target = linkify ? normalizeLink(m[2]) : undefined;
        const internal = target?.startsWith('#');
        out.push(
          target && internal ? (
            <a key={i++} href={target} className="xref">
              {renderInline(m[1], false)}
            </a>
          ) : target ? (
            <a key={i++} href={target} target={target.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
              {renderInline(m[1], false)}
            </a>
          ) : (
            <Fragment key={i++}>{renderInline(m[1], false)}</Fragment>
          ),
        );
      }
    } else if (/^(https?:\/\/|www\.)/i.test(tok)) {
      const { url, suffix } = splitUrlSuffix(tok);
      const target = linkify ? normalizeLink(url) : undefined;
      out.push(target ? <a key={i++} href={target} target="_blank" rel="noopener noreferrer">{target}</a> : <Fragment key={i++}>{url}</Fragment>);
      buf += suffix;
    } else {
      out.push(<em key={i++}>{renderInline(tok.slice(1, -1), linkify)}</em>);
    }
  }
  buf += text.slice(last);
  flush();
  return out;
}

/** Versi teks polos (tanpa markup), dipakai untuk indeks pencarian. */
export function plain(text: string) {
  return text
    .replace(/\*\*((?:\\.|[^*\\])+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*((?:\\.|[^*\\\n])+?)\*/g, '$1')
    .replace(/\\([\\*`[\]])/g, '$1');
}
