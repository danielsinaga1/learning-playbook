"""Konversi PDF (dihasilkan dari template panduan) → bab & blok playbook.

Heuristik berbasis ukuran/jenis font (pdfplumber):
  ≥25pt bold = sampul bagian (dilewati), 17–25pt bold = judul bab,
  9.5–12.5pt bold baris pendek = sub-judul, baris berawalan ▸/• = butir daftar,
  tabel terdeteksi = tabel, "CATATAN … / NOTES" = sisa halaman dilewati.
Pemakaian: python3 -I pdf2blocks.py file.pdf > out.json
"""
import json
import re
import sys

import pdfplumber

ESC = re.compile(r'([\\*`\[\]])')
BULLET = re.compile(r'^\s*[▸•▪■◆–-]\s+')


def esc(t):
    return ESC.sub(r'\\\1', t)


def line_style(line):
    chars = [c for c in line['chars'] if c['text'].strip()]
    if not chars:
        return 0, False, False
    c = chars[0]
    fn = c['fontname']
    bold_ratio = sum(1 for x in chars if 'Bold' in x['fontname']) / len(chars)
    ital_ratio = sum(1 for x in chars if 'Oblique' in x['fontname'] or 'Italic' in x['fontname']) / len(chars)
    return round(c['size'], 1), bold_ratio > 0.8, ital_ratio > 0.8 and 'Bold' not in fn


def in_box(line, boxes):
    mid = (line['top'] + line['bottom']) / 2
    return any(b[1] - 1 <= mid <= b[3] + 1 and b[0] - 2 <= line['x0'] <= b[2] + 2 for b in boxes)


def clean_cell(s):
    return re.sub(r'\s*\n\s*', ' ', (s or '').strip())


def parse_table(page, bbox):
    """Bangun ulang tabel tanpa garis kolom dari posisi kata: header (tebal, kapital) menentukan kolom."""
    crop = page.within_bbox((bbox[0] - 1, bbox[1] - 1, bbox[2] + 1, bbox[3] + 1))
    lines = [l for l in crop.extract_text_lines(return_chars=True) if l['text'].strip()]
    caption = None
    head_line = None
    for i, l in enumerate(lines[:3]):
        size, bold, _ = line_style(l)
        t = l['text'].strip()
        if bold and t.upper() == t and re.search(r'[A-Z]{2,}', t) and size < 9.4:
            head_line = i
            break
    if head_line is None:
        return None
    if head_line > 0:
        caption = ' '.join(l['text'].strip() for l in lines[:head_line])
    hdr = lines[head_line]
    words = crop.extract_words(extra_attrs=['size'])
    hw = [w for w in words if abs(w['top'] - hdr['top']) < 3]
    hw.sort(key=lambda w: w['x0'])
    cols = []
    for w in hw:
        if cols and w['x0'] - cols[-1]['x1'] < 9:
            cols[-1]['x1'] = w['x1']
            cols[-1]['text'] += ' ' + w['text']
        else:
            cols.append({'x0': w['x0'], 'x1': w['x1'], 'text': w['text']})
    starts = [c['x0'] for c in cols]
    body = [w for w in words if w['top'] > hdr['bottom'] + 1]
    body.sort(key=lambda w: (round(w['top']), w['x0']))
    # kelompokkan per baris visual
    vlines = []
    for w in body:
        if vlines and abs(vlines[-1]['top'] - w['top']) < 3:
            vlines[-1]['words'].append(w)
        else:
            vlines.append({'top': w['top'], 'size': w.get('size', 9), 'words': [w]})
    rows = []
    prev_top = None
    for vl in vlines:
        if prev_top is None or vl['top'] - prev_top > vl['size'] * 1.6:
            rows.append([[] for _ in starts])
        for w in sorted(vl['words'], key=lambda w: w['x0']):
            ci = 0
            for k, st in enumerate(starts):
                if w['x0'] >= st - 4:
                    ci = k
            rows[-1][ci].append(w['text'])
        prev_top = vl['top']
    rows = [[' '.join(c) for c in r] for r in rows if any(r)]
    head = [c['text'].title() if c['text'].isupper() else c['text'] for c in cols]
    return caption, head, rows


def convert(path):
    pdf = pdfplumber.open(path)
    chapters = []
    skipped = []
    cur = None
    part = None
    skip_toc = False

    def target():
        return cur['blocks'] if cur else []

    for page in pdf.pages:
        H = page.height
        if any(c['size'] >= 25 for c in page.chars):
            # halaman sampul / pembatas bagian → disimpan sebagai teks arsip
            for ln in page.extract_text_lines():
                if 42 <= ln['top'] <= page.height - 40 and ln['text'].strip():
                    skipped.append(ln['text'].strip())
            continue
        tables = page.find_tables()
        # Tabel seukuran halaman = layout sampul, abaikan
        tables = [t for t in tables if (t.bbox[3] - t.bbox[1]) < H * 0.9]
        boxes = [t.bbox for t in tables]
        items = []
        for t in tables:
            items.append(('table', t.bbox[1], t))
        for ln in page.extract_text_lines(return_chars=True):
            if ln['top'] < 42 or ln['top'] > H - 40:
                continue  # header & footer berjalan
            if in_box(ln, boxes):
                continue
            items.append(('line', ln['top'], ln))
        items.sort(key=lambda x: x[1])

        para = None  # dict(text, size, ital, bottom)
        callout = None
        lst = None
        notes = False
        prev_kind = None

        def flush():
            nonlocal para, callout, lst
            if para and para['text'].strip() and not skip_toc:
                txt = esc(para['text'].strip())
                if para['ital'] and len(txt) < 400:
                    txt = f'*{txt}*'
                target().append({'type': 'p', 'text': txt})
            para = None
            if callout and not skip_toc:
                if callout['items']:
                    target().append({'type': 'callout', 'tone': tone_for(callout['title']), 'title': callout['title'],
                                     'text': '\n'.join('• ' + esc(x) for x in callout['items'])})
                else:
                    target().append({'type': 'h', 'text': esc(callout['title']), 'level': 3})
            callout = None
            if lst and lst['items'] and not skip_toc:
                target().append({'type': 'list', 'items': [esc(x) for x in lst['items']]})
            lst = None

        for kind, top, obj in items:
            if notes:
                break
            if kind == 'table':
                flush()
                if skip_toc:
                    continue
                parsed = parse_table(page, obj.bbox)
                if parsed:
                    caption, head, rows = parsed
                    if caption:
                        target().append({'type': 'h', 'text': esc(caption), 'level': 3})
                    target().append({'type': 'table', 'head': [esc(h) for h in head], 'rows': [[esc(c) for c in r] for r in rows]})
                else:
                    rows = [[clean_cell(c) for c in r] for r in obj.extract() if any((c or '').strip() for c in r)]
                    if not rows:
                        continue
                    if all(len(r) == 1 for r in rows):
                        # kotak teks satu kolom → callout
                        target().append({'type': 'callout', 'tone': 'info', 'title': rows[0][0][:80], 'text': esc(' '.join(r[0] for r in rows[1:]) or rows[0][0])})
                    else:
                        ncol = max(len(r) for r in rows)
                        rows = [r + [''] * (ncol - len(r)) for r in rows]
                        target().append({'type': 'table', 'head': [esc(c) for c in rows[0]], 'rows': [[esc(c) for c in r] for r in rows[1:]]})
                prev_kind = 'table'
                continue
            ln = obj
            text = ln['text'].strip()
            if not text:
                continue
            size, bold, ital = line_style(ln)
            if re.match(r'^CATATAN( PRIBADI)?\s*/\s*(MY\s+)?NOTES', text, re.I):
                flush()
                notes = True
                continue
            if size >= 25:
                flush()
                continue  # sampul bagian
            if size >= 17 and bold:
                flush()
                skip_toc = False
                title = text
                cur = {'title': title, 'part': part, 'blocks': []}
                chapters.append(cur)
                prev_kind = 'chapter'
                continue
            if prev_kind == 'chapter' and ital and size >= 10.5:
                prev_kind = 'subtitle'
                if cur is not None:
                    cur['subtitle'] = text
                continue  # sub-judul bahasa Inggris di bawah judul bab
            is_bullet = bool(BULLET.match(text))
            if bold and not is_bullet and len(text) < 110 and 9.2 <= size <= 12.5:
                # judul kotak (diikuti butir) atau sub-judul
                flush()
                if re.match(r'^daftar isi$', text, re.I):
                    skip_toc = True
                    skipped.append(text)
                    continue
                skip_toc = False
                callout = {'title': text, 'items': []}
                prev_kind = 'heading'
                continue
            if skip_toc:
                skipped.append(text)
                continue
            if is_bullet:
                body = BULLET.sub('', text)
                if callout is not None:
                    if para:
                        flush_para = para
                        para = None
                        target().append({'type': 'p', 'text': esc(flush_para['text'])})
                    callout['items'].append(body)
                    callout['x'] = ln['x0']
                else:
                    if para:
                        target().append({'type': 'p', 'text': esc(para['text'])})
                        para = None
                    if lst is None:
                        lst = {'items': []}
                    lst['items'].append(body)
                    lst['x'] = ln['x0']
                prev_kind = 'bullet'
                continue
            # lanjutan butir (baris tanpa simbol, menjorok sama/lebih)
            if prev_kind == 'bullet':
                tgt = callout if callout is not None and callout['items'] else lst
                if tgt and tgt['items'] and ln['x0'] >= tgt.get('x', 0) - 2 and not bold:
                    tgt['items'][-1] += ' ' + text
                    continue
            # judul kotak yang tidak diikuti butir → sub-judul biasa
            if callout is not None and not callout['items']:
                t = callout['title']
                callout = None
                target().append({'type': 'h', 'text': esc(t), 'level': 3})
            if lst:
                target().append({'type': 'list', 'items': [esc(x) for x in lst['items']]})
                lst = None
            if para and abs(para['size'] - size) < 0.3 and para['ital'] == ital and top - para['bottom'] < size * 1.2:
                para['text'] += ' ' + text
                para['bottom'] = ln['bottom']
            else:
                if para:
                    target().append({'type': 'p', 'text': (f"*{esc(para['text'])}*" if para['ital'] else esc(para['text']))})
                para = {'text': text, 'size': size, 'ital': ital, 'bottom': ln['bottom']}
            prev_kind = 'para'
        flush()
        # judul kotak tanpa isi di akhir halaman
    for ch in chapters:
        out = []
        for b in ch['blocks']:
            # tabel yang terpotong antar-halaman: [h X][tabel] [h X][tabel kepala sama] → satu tabel
            if b['type'] == 'table' and out:
                prev = out[-1]
                if prev['type'] == 'h' and len(out) >= 3 and out[-2]['type'] == 'table' and out[-3]['type'] == 'h' \
                        and out[-3]['text'] == prev['text'] and out[-2]['head'] == b['head']:
                    out.pop()
                    out[-1]['rows'].extend(b['rows'])
                    continue
                if prev['type'] == 'table' and prev['head'] == b['head']:
                    prev['rows'].extend(b['rows'])
                    continue
            out.append(b)
        ch['blocks'] = out
    return {'preface': [], 'chapters': chapters, 'skipped': skipped, 'raw': raw_segments(pdf)}


def raw_segments(pdf):
    """Potongan teks per baris (dipisah bila ada jarak lebar antar kata = kolom berbeda),
    tanpa header/footer berjalan, untuk pemeriksaan cakupan akhir."""
    out = []
    for page in pdf.pages:
        H = page.height
        words = [w for w in page.extract_words() if 42 <= w['top'] <= H - 40]
        words.sort(key=lambda w: w['top'])
        lines = []
        for w in words:
            if lines and abs(w['top'] - lines[-1][0]['top']) < 2.5:
                lines[-1].append(w)
            else:
                lines.append([w])
        for ln in lines:
            ln.sort(key=lambda w: w['x0'])
            seg = [ln[0]]
            for w in ln[1:]:
                if w['x0'] - seg[-1]['x1'] > 6:
                    out.append(' '.join(x['text'] for x in seg))
                    seg = []
                seg.append(w)
            out.append(' '.join(x['text'] for x in seg))
    return out


def tone_for(label):
    l = (label or '').lower()
    if re.search(r'jebakan|hindari|kesalahan|jangan|salah|awas', l):
        return 'warn'
    if re.search(r'tips?|cara|strategi|aturan emas|ingat', l):
        return 'tip'
    if re.search(r'checklist|ringkas|kunci', l):
        return 'success'
    return 'info'


if __name__ == '__main__':
    json.dump(convert(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
