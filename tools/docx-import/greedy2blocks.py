"""Konversi buku PDF kumpulan artikel (format ebook GeeksforGeeks dari LaTeX) → bab & blok playbook.

Ciri dokumen: "Chapter N" (20.7pt tebal) + judul (24.8pt tebal), teks LMRoman 10pt, kode LMMono 10pt,
label bahasa tebal ("C++", "Java", "Python3", "C#", "PHP"), bagian "Source" + URL di akhir bab,
header berjalan miring di atas halaman dan nomor halaman di bawah.

- Indentasi kode dibangun ulang dari posisi x tiap karakter (lebar karakter monospace tetap).
- Gambar dipotong dari halaman (pdftoppm) → WebP di folder media, dirujuk sebagai blok `image`.
- Kode beberapa bahasa yang berurutan → blok `tabs` (Java lebih dulu).

Pemakaian: python3 -I greedy2blocks.py buku.pdf <folder-media> <prefix-url-media> > out.json
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import pdfplumber

ESC = re.compile(r'([\\*`\[\]])')
LABELS = {
    'C++': ('cpp', 'C++'), 'CPP': ('cpp', 'C++'), 'C/C++': ('cpp', 'C/C++'), 'C': ('c', 'C'),
    'Java': ('java', 'Java'), 'Python': ('python', 'Python'), 'Python3': ('python', 'Python 3'),
    'Python 3': ('python', 'Python 3'), 'C#': ('csharp', 'C#'), 'PHP': ('php', 'PHP'),
    'JavaScript': ('js', 'JavaScript'), 'Javascript': ('js', 'JavaScript'),
}
ORDER = ['java', 'cpp', 'c', 'python', 'csharp', 'php', 'js']
RIGHT = 504          # tepi kanan blok teks (612 - 108)
LEFT = 108


def esc(t):
    return ESC.sub(r'\\\1', t)


def guess_lang(code):
    if re.search(r'#include|using namespace std|cout\s*<<', code):
        return 'cpp'
    if re.search(r'<\?php|\$\w+\s*=', code):
        return 'php'
    if re.search(r'using System|Console\.Write', code):
        return 'csharp'
    if re.search(r'System\.out|public static void main|import java', code):
        return 'java'
    if re.search(r'^\s*def \w+\(|^\s*print\s*\(|^\s*import \w+$|^\s*from \w+ import', code, re.M):
        return 'python'
    return 'text'


def is_mono(c):
    return 'Mono' in c['fontname']


def line_markup(chars):
    """Teks baris dengan **tebal**; spasi disisipkan dari jarak antar karakter."""
    out = ''
    bold = False
    prev = None
    for c in chars:
        if prev is not None and c['text'] == prev['text'] and abs(c['x0'] - prev['x0']) < 0.05:
            continue                                       # ligatur (ff, fi, ffi) tercatat ganda
        if prev is not None:
            gap = c['x0'] - prev['x1']
            if gap > c['size'] * 0.18 and not out.endswith(' '):
                if bold:
                    out += '** '
                    bold = False
                else:
                    out += ' '
        b = 'Bold' in c['fontname'] and c['text'].strip() != ''
        if b and not bold:
            out += '**'
            bold = True
        elif not b and bold and c['text'].strip():
            out += '**'
            bold = False
        out += esc(c['text']) if not is_mono(c) else c['text'].replace('`', "'")
        prev = c
    if bold:
        out += '**'
    out = re.sub(r'\*\*\s*\*\*', ' ', out)
    return re.sub(r'\s+', ' ', out).strip()


def mono_line(chars, cw):
    """Bangun ulang baris kode: tiap karakter di kolom (x - margin) / lebar karakter."""
    cols = {}
    for c in chars:
        if not c['text'].strip():
            continue
        col = max(0, int(round((c['x0'] - LEFT) / cw)))
        while col in cols:
            col += 1
        cols[col] = c['text']
    if not cols:
        return ''
    return ''.join(cols.get(i, ' ') for i in range(max(cols) + 1)).rstrip()


def crop_image(path, pno, bbox, media_dir, name, url_prefix):
    x0, top, x1, bottom = bbox
    res = 110
    s = res / 72
    with tempfile.TemporaryDirectory() as td:
        base = os.path.join(td, 'img')
        subprocess.run(['pdftoppm', '-f', str(pno), '-l', str(pno), '-r', str(res), '-x', str(int(x0 * s)), '-y', str(int(top * s)),
                        '-W', str(int((x1 - x0) * s) + 1), '-H', str(int((bottom - top) * s) + 1), '-png', '-singlefile', path, base],
                       check=True)
        from PIL import Image
        im = Image.open(base + '.png').convert('RGB')
        os.makedirs(media_dir, exist_ok=True)
        im.save(os.path.join(media_dir, name), 'WEBP', quality=72, method=6)
    return f'{url_prefix}/{name}'


def convert(path, media_dir, url_prefix):
    pdf = pdfplumber.open(path)
    chapters = []
    skipped = []
    raw = []
    cur = None
    started = False
    img_n = 0

    limit = int(os.environ.get('PAGES', '0')) or len(pdf.pages)
    first = int(os.environ.get('FIRST', '0'))
    for pg in pdf.pages[first:limit]:
        pg = pg.dedupe_chars()
        H = pg.height
        lines = pg.extract_text_lines(return_chars=True, y_tolerance=4)
        items = []
        for l in lines:
            chs = [c for c in l['chars']]
            vis = [c for c in chs if c['text'].strip()]
            if not vis:
                continue
            if l['top'] < 96 and all('Italic' in c['fontname'] for c in vis) and re.match(r'^Chapter \d+\.', l['text'].strip()):
                continue                                   # header berjalan
            if l['top'] > H - 110 and re.fullmatch(r'\d+', l['text'].strip()):
                continue                                   # nomor halaman
            items.append(('line', l['top'], l))
        seen = set()
        for im in pg.images:
            bb = (round(im['x0']), round(im['top']), round(im['x1']), round(im['bottom']))
            if bb in seen or (bb[2] - bb[0]) < 20 or (bb[3] - bb[1]) < 20:
                continue
            seen.add(bb)
            items.append(('image', im['top'], im))
        items.sort(key=lambda x: x[1])

        for kind, top, obj in items:
            if kind == 'image':
                if cur is None:
                    continue
                img_n += 1
                name = f'g{img_n:03d}.webp'
                src = crop_image(path, pg.page_number, (obj['x0'], obj['top'], obj['x1'], obj['bottom']), media_dir, name, url_prefix)
                cur['items'].append({'k': 'image', 'src': src})
                continue
            l = obj
            vis = [c for c in l['chars'] if c['text'].strip()]
            size = round(vis[0]['size'], 1)
            text = l['text'].strip()
            raw.append(text)
            bold = all('Bold' in c['fontname'] for c in vis)
            if bold and 20 <= size < 22 and text.startswith('Chapter'):
                started = True
                cur = {'title': '', 'num': text, 'items': [], 'source': [], 'orig': None, 'mode': 'title'}
                chapters.append(cur)
                continue
            if not started:
                skipped.append(text)
                continue
            if cur['mode'] == 'title' and bold and size > 22:
                cur['title'] = (cur['title'] + ' ' + text).strip()
                continue
            if cur['mode'] == 'title':
                cur['mode'] = 'orig'
            if cur['mode'] == 'orig':
                cur['mode'] = 'body'
                if text.endswith('GeeksforGeeks'):
                    cur['orig'] = text
                    continue
            if bold and size >= 11.5 and text == 'Source':
                cur['mode'] = 'source'
                continue
            if cur['mode'] == 'source':
                # URL sumber (bisa terpotong ke baris berikutnya); baris lain = isi bab yang ditaruh LaTeX setelah "Source"
                if re.match(r'^https?://', text) or (cur['source'] and not cur['source'][-1].endswith('/') and ' ' not in text
                                                     and not bold and not any(is_mono(c) for c in vis)):
                    cur['source'].append(text)
                    continue
                cur['mode'] = 'body'
            mono = sum(1 for c in vis if is_mono(c)) / len(vis) > 0.6
            cur['items'].append({'k': 'mono' if mono else 'text', 'top': l['top'], 'bottom': l['bottom'], 'x0': l['x0'],
                                 'x1': l['x1'], 'bold': bold, 'chars': l['chars'], 'text': text, 'page': pg.page_number})

    out = []
    for ch in chapters:
        out.append({'title': clean_title(ch['title']), 'num': ch['num'], 'orig': ch['orig'],
                    'source': ' '.join(ch['source']).strip(), 'blocks': build_blocks(ch['items'])})
    return {'preface': [], 'chapters': out, 'skipped': skipped, 'raw': raw}


def clean_title(t):
    return re.sub(r'\s+', ' ', t).strip()


def build_blocks(items):
    blocks = []
    para = None
    code = None
    pending = None            # (lang, label) dari label bahasa
    output_next = False
    cw = 5.2305

    def flush_para():
        nonlocal para
        if para:
            blocks.append({'type': 'p', 'text': para['text']})
        para = None

    def flush_code():
        nonlocal code
        if code:
            lines = code['lines']
            # artefak: baris pertama blok kode menjorok 1 spasi
            if len(lines) > 1 and lines[0].startswith(' ') and not lines[0].startswith('  ') and not lines[1].startswith(' '):
                lines[0] = lines[0][1:]
            while lines and not lines[-1].strip():
                lines.pop()
            src = '\n'.join(lines)
            if src.strip():
                b = {'type': 'code', 'lang': code['lang'] or guess_lang(src), 'code': src}
                if code.get('label'):
                    b['label'] = code['label']
                blocks.append(b)
        code = None

    for it in items:
        if it['k'] == 'image':
            flush_para()
            flush_code()
            blocks.append({'type': 'image', 'src': it['src'], 'alt': 'Ilustrasi dari artikel'})
            continue
        if it['k'] == 'mono':
            flush_para()
            line = mono_line(it['chars'], cw)
            if code is None:
                lang, label = pending if pending else (None, None)
                if output_next:
                    lang, label = 'text', 'Output'
                code = {'lines': [], 'lang': lang, 'label': label, 'bottom': it['top'], 'page': it['page']}
                pending = None
                output_next = False
            else:
                if it['page'] == code['page']:
                    gap = it['top'] - code['bottom']
                    blanks = max(0, int(round(gap / 11.955)) - 1)
                    code['lines'].extend([''] * min(blanks, 2))
            code['lines'].append(line)
            code['bottom'] = it['top']
            code['page'] = it['page']
            continue
        # baris teks
        t = it['text']
        if it['bold'] and t in LABELS:
            flush_para()
            flush_code()
            pending = LABELS[t]
            continue
        flush_code()
        if re.match(r'^Output\s*:?\s*$', t, re.I):
            flush_para()
            blocks.append({'type': 'h', 'text': 'Output', 'level': 4})
            output_next = True
            continue
        mk = line_markup(it['chars'])
        if it['bold'] and len(t) < 90 and not t.endswith('.'):
            flush_para()
            blocks.append({'type': 'h', 'text': mk.strip('* ').strip(), 'level': 4})
            continue
        starts_item = re.match(r'^(\d+[\).]|[a-z]\)|[ivx]+\)|•|–|—|…|\.{3}|Step\s*\d)', t)
        if para and not starts_item and it['top'] - para['bottom'] < 16 and para['x1'] > RIGHT - 45:
            para['text'] += ' ' + mk
            para['bottom'] = it['bottom']
            para['x1'] = it['x1']
        else:
            flush_para()
            para = {'text': mk, 'bottom': it['bottom'], 'x1': it['x1']}
    flush_para()
    flush_code()
    return group_tabs(blocks)


def group_tabs(blocks):
    """Kode berlabel bahasa yang berurutan → satu blok tabs (Java lebih dulu)."""
    out = []
    i = 0
    while i < len(blocks):
        b = blocks[i]
        if b['type'] == 'code' and b.get('label') and b['label'] != 'Output':
            group = [b]
            j = i + 1
            while j < len(blocks) and blocks[j]['type'] == 'code' and blocks[j].get('label') and blocks[j]['label'] != 'Output' \
                    and blocks[j]['label'] not in [g['label'] for g in group]:
                group.append(blocks[j])
                j += 1
            if len(group) > 1:
                group.sort(key=lambda g: ORDER.index(g['lang']) if g['lang'] in ORDER else 99)
                out.append({'type': 'tabs', 'tabs': [{'label': g['label'], 'blocks': [{'type': 'code', 'lang': g['lang'], 'code': g['code']}]}
                                                     for g in group]})
            else:
                out.append({'type': 'code', 'lang': b['lang'], 'title': b['label'], 'code': b['code']})
            i = j
            continue
        if b['type'] == 'code':
            b = {k: v for k, v in b.items() if k != 'label'}
        out.append(b)
        i += 1
    return out


if __name__ == '__main__':
    json.dump(convert(sys.argv[1], sys.argv[2], sys.argv[3]), sys.stdout, ensure_ascii=False, indent=1)
