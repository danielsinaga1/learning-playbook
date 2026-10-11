"""Konversi PDF teks umum (e-book, handout, catatan) → bab & blok playbook.

Setiap baris diberi peran berdasarkan font, ukuran, posisi, dan warna latar (pdfplumber), lalu baris
berurutan disusun menjadi blok: judul bab/sub-judul, paragraf (tebal/miring/kode inline dipertahankan),
butir daftar, blok kode (indentasi dihitung dari posisi karakter), callout (kotak berwarna), tabel
(garis sel atau kotak berwarna per sel), soal (qmark), dan gambar (dipotong dari halaman → WebP).

python3 -I text2blocks.py file.pdf '<config-json>' [folder-media prefix-url] > out.json

Konfigurasi (semua opsional kecuali "rules"):
  rules       daftar {"font": regex, "size": [min, max], "text": regex, "fill": [r,g,b] | "dark" | "any",
                      "x0": [min, max], "bold": bool, "role": peran}; aturan pertama yang cocok dipakai.
              Peran: chapter, h3, h4, q, code, callout, bullet, body, skip, drop (tidak dicatat).
  header/footer   baris dengan top < header atau top > footer dibuang (dicatat di "skipped")
  skip_pages  halaman yang seluruhnya dicatat di "skipped" (sampul, daftar isi)
  mono        regex nama font monospace; code_fill: daftar warna latar blok kode; callout_fill: warna callout
  lang        bahasa kode default; tables: true/false; images: {"min": 60, "skip": [[w,h], ...], "dpi": 110}
  q_strip     regex yang dibuang dari awal teks soal; star: regex penanda "sering ditanya"
  dehyphen    sambung kata yang terpotong tanda hubung di akhir baris (PDF LaTeX)
"""
import json
import os
import re
import statistics
import subprocess
import sys
import tempfile

import pdfplumber

ESC = re.compile(r'([\\*`\[\]])')
ZW = re.compile('[​-‏‪-‮⁠-⁤﻿­-]')
LIG = str.maketrans({'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st'})
BULLETS = '•●▪◦○■□➢►▸◆‣∙·✓✔➤➔→'
BOLD = re.compile(r'Bold|Black|Heavy|Semibold|SemiBold|Demi|-B$|,B\b', re.I)
ITAL = re.compile(r'Italic|Oblique|Ital\b|-It$|-I$|Slant', re.I)


def esc(t):
    return ESC.sub(r'\\\1', t)


def ckey(c):
    if c is None:
        return None
    if isinstance(c, (int, float)):
        c = (c, c, c)
    c = tuple(float(x) for x in c)
    if len(c) == 1:
        c = (c[0],) * 3
    if len(c) == 4:  # CMYK → RGB kasar
        k = c[3]
        c = tuple((1 - min(1, x + k)) for x in c[:3])
    return tuple(round(x, 2) for x in c[:3])


def lum(c):
    return 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2] if c else 1


def color_match(c, want):
    if want is None:
        return True
    if c is None:
        return False
    if want == 'any':
        return True
    if want == 'dark':
        return lum(c) < 0.45
    if want == 'light':
        return lum(c) >= 0.45 and c != (1.0, 1.0, 1.0)
    if isinstance(want[0], (list, tuple)):
        return any(color_match(c, w) for w in want)
    return all(abs(a - b) < 0.03 for a, b in zip(c, want))


class Cfg:
    def __init__(self, d):
        self.d = d
        self.mono = re.compile(d.get('mono', r'Mono|Courier|Consolas|Menlo|Monaco|Code|Typewriter|Fixed'), re.I)
        self.rules = []
        for r in d.get('rules', []):
            rr = dict(r)
            for k in ('font', 'text'):
                if k in rr:
                    rr[k] = re.compile(rr[k])
            self.rules.append(rr)

    def get(self, k, default=None):
        return self.d.get(k, default)


# ------------------------------------------------------------------ halaman → baris

def page_fills(page):
    out = []
    for r in page.rects:
        if not r.get('fill'):
            continue
        if r['width'] > page.width - 8 and r['height'] > page.height - 8:
            continue
        if r['height'] < 4 or r['width'] < 2:
            continue
        out.append({'x0': r['x0'], 'x1': r['x1'], 'top': r['top'], 'bottom': r['bottom'], 'c': ckey(r.get('non_stroking_color'))})
    return out


def find_fill(fills, top, bottom, x0, x1):
    mid = (top + bottom) / 2
    best = None
    for f in fills:
        if f['top'] - 1 <= mid <= f['bottom'] + 1 and f['x0'] - 3 <= x0 and f['x1'] + 3 >= min(x1, x0 + 8):
            area = (f['x1'] - f['x0']) * (f['bottom'] - f['top'])
            if best is None or area < best[0]:
                best = (area, f)
    return best[1] if best else None


def build_lines(chars, cfg):
    chars = [c for c in chars if c['text'] and not ZW.fullmatch(c['text'])]
    chars = [dict(c, text=ZW.sub('', c['text']).translate(LIG)) for c in chars]
    chars = [c for c in chars if c['text'] and c['text'].strip()]
    chars.sort(key=lambda c: (round(c['top'], 1), c['x0']))
    lines = []
    for c in chars:
        size = c['size'] or 10
        placed = False
        for ln in reversed(lines[-4:]):
            tol = max(1.8, 0.33 * min(ln['size'], size))
            if abs(ln['bottom'] - c['bottom']) <= tol or abs(ln['top'] - c['top']) <= tol:
                ln['chars'].append(c)
                ln['top'] = min(ln['top'], c['top'])
                ln['bottom'] = max(ln['bottom'], c['bottom'])
                placed = True
                break
        if not placed:
            lines.append({'chars': [c], 'top': c['top'], 'bottom': c['bottom'], 'size': size})
    out = []
    for ln in lines:
        cs = sorted(ln['chars'], key=lambda c: c['x0'])
        ded = []
        for c in cs:  # huruf tebal tiruan (dicetak dua kali)
            if ded and c['text'] == ded[-1]['text'] and abs(c['x0'] - ded[-1]['x0']) < 0.8:
                continue
            ded.append(c)
        sizes = sorted(round(c['size'], 1) for c in ded)
        fonts = [c['fontname'].split('+')[-1] for c in ded]
        cols = [ckey(c.get('non_stroking_color')) if not isinstance(c.get('non_stroking_color'), str) else None for c in ded]
        n = len(ded)
        out.append({
            'chars': ded, 'top': min(c['top'] for c in ded), 'bottom': max(c['bottom'] for c in ded),
            'x0': ded[0]['x0'], 'x1': ded[-1]['x1'], 'size': sizes[len(sizes) // 2],
            'font': max(set(fonts), key=fonts.count),
            'first_font': fonts[0],
            'mono': sum(1 for f in fonts if cfg.mono.search(f)) / n,
            'bold': sum(1 for f in fonts if BOLD.search(f)) / n,
            'ital': sum(1 for f in fonts if ITAL.search(f)) / n,
            'color': max(set(cols), key=cols.count),
        })
        out[-1]['text'] = plain_text(out[-1], cfg)
    out.sort(key=lambda l: (l['top'], l['x0']))
    return out


def gap_space(prev, c, cfg):
    gap = c['x0'] - prev['x1']
    size = min(prev['size'], c['size']) or 10
    return gap > cfg.get('space', 0.17) * size


def plain_text(line, cfg):
    s = ''
    prev = None
    for c in line['chars']:
        if prev is not None and gap_space(prev, c, cfg):
            s += ' '
        s += c['text']
        prev = c
    return s.strip()


def styled_text(line, cfg, allow_code=True):
    """Teks satu baris dengan penanda **tebal**, *miring*, `kode`."""
    words = []
    cur = None
    prev = None
    for c in line['chars']:
        if prev is None or gap_space(prev, c, cfg):
            cur = {'t': '', 'st': []}
            words.append(cur)
        cur['t'] += c['text']
        f = c['fontname'].split('+')[-1]
        cur['st'].append('c' if (allow_code and cfg.mono.search(f) and line['mono'] < 0.7) else
                         'b' if BOLD.search(f) else 'i' if ITAL.search(f) else '')
        prev = c
    runs = []
    for w in words:
        st = max(set(w['st']), key=w['st'].count)
        if runs and runs[-1][0] == st:
            runs[-1][1].append(w['t'])
        else:
            runs.append([st, [w['t']]])
    parts = []
    for st, ws in runs:
        t = ' '.join(ws)
        if st == 'c':
            parts.append('`' + t.replace('`', "'") + '`')
        elif st == 'b' and re.search(r'\w', t):
            parts.append('**' + esc(t) + '**')
        elif st == 'i' and re.search(r'\w', t):
            parts.append('*' + esc(t) + '*')
        else:
            parts.append(esc(t))
    return ' '.join(parts)


def merge_marks(t):
    t = re.sub(r'\*\*\s+\*\*', ' ', t)
    t = re.sub(r'(?<![*\\])\*\s+\*(?!\*)', ' ', t)
    t = re.sub(r'`\s+`', ' ', t)
    t = re.sub(r'\*\*\*\*', '', t)
    return t.strip()


def code_text(lines, cfg):
    """Rekonstruksi kode: kolom dihitung dari posisi x tiap karakter."""
    mono_chars = [c for ln in lines for c in ln['chars'] if cfg.mono.search(c['fontname'])]
    if len(mono_chars) > 0.6 * sum(len(ln['chars']) for ln in lines):
        widths = sorted(round(c['x1'] - c['x0'], 2) for c in mono_chars if c['x1'] - c['x0'] > 1)
        cw = widths[len(widths) // 2] if widths else 5.4
        base = min(ln['x0'] - ln.get('page_left', 0) for ln in lines)
        out = []
        for ln in lines:
            row = []
            for c in ln['chars']:
                col = max(0, int(round((c['x0'] - ln.get('page_left', 0) - base) / cw)))
                if col < len(row):
                    col = len(row)
                row.extend(' ' * (col - len(row)))
                row.append(c['text'])
            out.append((ln, ''.join(row).rstrip()))
    else:  # kode dengan font proporsional: indentasi dari selisih x
        size = statistics.median(ln['size'] for ln in lines)
        sw = cfg.get('code_space', 0.278) * size
        base = min(ln['x0'] - ln.get('page_left', 0) for ln in lines)
        out = [(ln, ' ' * int(round((ln['x0'] - ln.get('page_left', 0) - base) / sw)) + plain_text(ln, cfg)) for ln in lines]
    # baris kosong dari jarak vertikal
    pitches = [b[0]['top'] - a[0]['top'] for a, b in zip(out, out[1:]) if b[0]['page'] == a[0]['page'] and b[0]['top'] > a[0]['top']]
    pitch = min(pitches) if pitches else 12
    pitch = statistics.median([p for p in pitches if p < pitch * 1.3]) if pitches else pitch
    text = []
    for i, (ln, t) in enumerate(out):
        if i and ln['page'] == out[i - 1][0]['page']:
            gap = ln['top'] - out[i - 1][0]['top']
            if gap > pitch * 1.6:
                text.append('')
        text.append(t)
    num = cfg.get('code_strip_num')
    if num:
        text = [re.sub(num, '', t, count=1) for t in text]
    return '\n'.join(text).strip('\n')


# ------------------------------------------------------------------ tabel & gambar

def cell_grid_tables(page, fills):
    """Tabel tanpa garis: baris berisi ≥2 kotak berwarna yang bersebelahan dengan batas kolom sama."""
    rows = {}
    for f in fills:
        rows.setdefault((round(f['top']), round(f['bottom'])), []).append(f)
    good = []
    for (t, b), fs in rows.items():
        fs.sort(key=lambda f: f['x0'])
        if len(fs) >= 2 and all(abs(fs[i]['x1'] - fs[i + 1]['x0']) < 2 for i in range(len(fs) - 1)) \
                and all(f['x1'] - f['x0'] >= 25 for f in fs) and fs[-1]['x1'] - fs[0]['x0'] >= 0.4 * page.width:
            good.append({'top': t, 'bottom': b, 'cols': [(f['x0'], f['x1']) for f in fs]})
    good.sort(key=lambda r: r['top'])
    tables = []
    for r in good:
        if tables and abs(tables[-1]['bottom'] - r['top']) < 3 and len(tables[-1]['rows'][-1]['cols']) == len(r['cols']) \
                and all(abs(a[0] - b[0]) < 2 for a, b in zip(tables[-1]['rows'][-1]['cols'], r['cols'])):
            tables[-1]['rows'].append(r)
            tables[-1]['bottom'] = r['bottom']
        else:
            tables.append({'top': r['top'], 'bottom': r['bottom'], 'rows': [r]})
    out = []
    for t in tables:
        cols = t['rows'][0]['cols']
        bbox = (cols[0][0], t['top'], cols[-1][1], t['bottom'])
        out.append({'bbox': bbox, 'rows_bbox': [[(c[0], r['top'], c[1], r['bottom']) for c in r['cols']] for r in t['rows']]})
    return out


def cell_text(page, box, cfg):
    x0, top, x1, bottom = box
    chars = [c for c in page.chars if x0 - 1 <= (c['x0'] + c['x1']) / 2 <= x1 + 1 and top - 1 <= (c['top'] + c['bottom']) / 2 <= bottom + 1]
    lines = build_lines(chars, cfg)
    return merge_marks(' '.join(styled_text(l, cfg) for l in lines))


def page_tables(page, fills, cfg):
    found = []
    if cfg.get('tables', True):
        for t in page.find_tables():
            cells = t.rows
            ncol = max(len(r.cells) for r in cells) if cells else 0
            if ncol < 2 or len(cells) < 2:
                continue
            rows_bbox = [[c for c in r.cells] for r in cells]
            found.append({'bbox': t.bbox, 'rows_bbox': rows_bbox})
        for t in cell_grid_tables(page, fills):
            if not any(abs(t['bbox'][1] - f['bbox'][1]) < 4 or (f['bbox'][1] <= t['bbox'][1] <= f['bbox'][3]) for f in found):
                found.append(t)
    out = []
    for t in found:
        rows = []
        for r in t['rows_bbox']:
            row = [cell_text(page, c, cfg) if c else '' for c in r]
            if any(x.strip() for x in row):
                rows.append(row)
        if len(rows) < 2 and not cfg.get('single_row_tables'):
            continue
        # tabel 1 kolom efektif (kotak kode/callout) bukan tabel
        nonempty_cols = sum(1 for j in range(max(len(r) for r in rows)) if any(j < len(r) and r[j].strip() for r in rows))
        if nonempty_cols < 2 or sum(1 for r in rows for x in r if x.strip()) < 4:
            continue
        # semua huruf di area tabel harus masuk ke sel; kalau tidak (sel gabungan tak terbaca) → baca sebagai baris biasa
        x0, top, x1, bottom = t['bbox']
        inside = sum(1 for c in page.chars if c['text'].strip() and x0 - 1 <= (c['x0'] + c['x1']) / 2 <= x1 + 1
                     and top - 1 <= (c['top'] + c['bottom']) / 2 <= bottom + 1)
        got = sum(len(re.sub(r'\s|\*\*|`', '', x)) for r in rows for x in r)
        if inside and got < 0.9 * inside:
            continue
        w = max(len(r) for r in rows)
        rows = [r + [''] * (w - len(r)) for r in rows]
        out.append({'bbox': t['bbox'], 'head': rows[0], 'rows': rows[1:]})
    return out


def render_crop(path, pno, bbox, page, out_file, dpi):
    from PIL import Image
    with tempfile.TemporaryDirectory() as td:
        base = os.path.join(td, 'p')
        subprocess.run(['pdftoppm', '-f', str(pno), '-l', str(pno), '-r', str(dpi), '-png', '-singlefile', path, base], check=True)
        im = Image.open(base + '.png').convert('RGB')
        k = dpi / 72.0
        x0, top, x1, bottom = bbox
        box = (max(0, int(x0 * k) - 2), max(0, int(top * k) - 2), min(im.width, int(x1 * k) + 2), min(im.height, int(bottom * k) + 2))
        im = im.crop(box)
        os.makedirs(os.path.dirname(out_file), exist_ok=True)
        im.save(out_file, 'WEBP', quality=72, method=6)


# ------------------------------------------------------------------ peran baris

def role_of(line, cfg, page_h):
    t = line['text']
    for r in cfg.rules:
        if 'font' in r and not r['font'].search(line['font']):
            continue
        if 'first_font' in r and not re.search(r['first_font'], line['first_font']):
            continue
        if 'first_size' in r and not (r['first_size'][0] <= line['chars'][0]['size'] <= r['first_size'][1]):
            continue
        if 'size' in r and not (r['size'][0] <= line['size'] <= r['size'][1]):
            continue
        if 'text' in r and not r['text'].search(t):
            continue
        if 'fill' in r and not color_match(line.get('fill'), r['fill']):
            continue
        if 'color' in r and not color_match(line.get('color'), r['color']):
            continue
        if 'nofill' in r and line.get('fill') is not None:
            continue
        if 'x0' in r and not (r['x0'][0] <= line['x0'] <= r['x0'][1]):
            continue
        if 'bold' in r and (line['bold'] > 0.6) != r['bold']:
            continue
        if 'mono' in r and (line['mono'] > 0.6) != r['mono']:
            continue
        if 'pages' in r and line['page'] not in r['pages']:
            continue
        return r['role']
    fb = line.get('fill_box')
    if line['mono'] > 0.7 and (not cfg.get('code_need_fill') or (fb is not None and fb['x1'] - fb['x0'] >= cfg.get('code_fill_min_w', 0))):
        return 'code'
    cf = cfg.get('code_fill')
    if cf and color_match(line.get('fill'), cf):
        return 'code'
    kf = cfg.get('callout_fill')
    if kf and color_match(line.get('fill'), kf):
        return 'callout'
    if t[:1] in BULLETS or re.match(r'^[-–]\s', t):
        return 'bullet'
    return 'body'


def guess_lang(code, default):
    s = code.strip()
    first = s.split('\n', 1)[0].strip()
    if re.match(r'^(<\?xml|<project|<dependenc|<plugin|<build|<!--|<settings|<suite|<configuration)', s):
        return 'xml'
    if re.match(r'^(<!DOCTYPE html|<html|<div|<head|<body|<script|<ul|<p>|<span|<form|<input|<button)', s, re.I):
        return 'html'
    if re.match(r'^(Feature|Scenario|Given|When|Then|Background)\b', s):
        return 'text'
    if re.match(r'^[\[{]\s*("|\n|$)', s) and not re.search(r'[;=]\s*$', s, re.M):
        return 'json'
    if (re.search(r'^(apiVersion|kind|services|jobs|stages|steps|workflows|metadata|spec):', s, re.M) or re.match(r'^(name|on|version|image|language|script|env|pipeline):', s)
            or re.match(r'^- (name|uses|run):', s)) and not re.search(r';\s*$', s, re.M):
        return 'yaml'
    if re.search(r'^FROM\s', s, re.M) and re.search(r'^(RUN|COPY|WORKDIR|CMD|ENTRYPOINT)\b', s, re.M):
        return 'docker'
    if re.match(r'^(\$ |npm |npx |yarn |mvn |git |docker |kubectl |helm |curl |kafka-|bin/|\./|cd |mkdir |java -|gradle |pip |minikube |sudo |apt|brew )', first) \
            or (first.startswith('#') and re.search(r'^(kafka-[\w-]+\.sh|bin/|docker |kubectl |curl |mvn |npm |git |helm |minikube )', s, re.M)):
        return 'bash'
    if re.match(r'^(SQL>\s*)?(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|WITH|BEGIN|SET)\b', s, re.I) \
            and not re.search(r'[{}]\s*$', s, re.M):
        return 'sql'
    if re.search(r'^package \w+\s*$|^func[ (]|:= ', s, re.M) and re.search(r'\bfunc\b', s):
        return 'go'
    if re.search(r'^(import React|import \{|export default|const \w+ = |let \w+ = |var \w+ = |ReactDOM|function \w+\()', s, re.M) \
            and not re.search(r'^\s*(public|private|protected)\s', s, re.M):
        return 'js'
    if re.search(r'^\s*(public|private|protected)\s|^\s*@(Override|Test|Given|When|Then|Before|After|RunWith|CucumberOptions|SpringBootApplication|Bean|Autowired)\b|import java|import org\.|import io\.|package [\w.]+;|System\.out|\b(int|void|String|boolean|long)\s+\w+\s*[(=;]', s, re.M):
        return 'java'
    if default != 'java' and re.search(r'^\s*(class|interface)\s', s, re.M):
        return default
    if re.search(r'^\s*server\s*\{|try_files|location /', s, re.M):
        return 'text'
    return default


# ------------------------------------------------------------------ konversi

def convert(path, cfg_d, media_dir=None, url_prefix=None):
    cfg = Cfg(cfg_d)
    header = cfg.get('header', 0)
    footer = cfg.get('footer', 10000)
    skip_pages = set(cfg.get('skip_pages', []))
    img_cfg = cfg.get('images')
    flow = []
    skipped = []
    raw = []
    with pdfplumber.open(path) as pdf:
        for pno, page in enumerate(pdf.pages, start=1):
            fills = page_fills(page)
            tables = page_tables(page, fills, cfg) if pno not in skip_pages else []
            boxes = [t['bbox'] for t in tables]

            def in_table(c):
                mx, my = (c['x0'] + c['x1']) / 2, (c['top'] + c['bottom']) / 2
                return any(b[0] - 1 <= mx <= b[2] + 1 and b[1] - 1 <= my <= b[3] + 1 for b in boxes)
            lines = build_lines([c for c in page.chars if not in_table(c)], cfg)
            body_x = [l['x0'] for l in lines if header <= l['top'] <= footer]
            page_left = (min(body_x) if body_x else 0) if cfg.get('page_margin_shift') else 0
            for ln in lines:
                ln['page_left'] = page_left
                ln['page'] = pno
                f = find_fill(fills, ln['top'], ln['bottom'], ln['x0'], ln['x1'])
                ln['fill'] = f['c'] if f else None
                ln['fill_box'] = f
                raw.append(re.sub(r'^o\s+(?=[A-Z])', '', ln['text']))
                if pno in skip_pages:
                    skipped.append(ln['text'])
                    continue
                if ln['top'] < header or ln['top'] > footer:
                    skipped.append(ln['text'])
                    continue
                ln['role'] = role_of(ln, cfg, page.height)
                if ln['role'] == 'drop':
                    continue
                if ln['role'] == 'skip':
                    skipped.append(ln['text'])
                    continue
                flow.append(('line', ln))
            for t in tables:
                raw.extend(' | '.join(r) for r in [t['head']] + t['rows'])
                flow.append(('table', {'page': pno, 'top': t['bbox'][1], 'x0': t['bbox'][0], 'head': t['head'], 'rows': t['rows']}))
            if img_cfg and media_dir and pno not in skip_pages:
                skip_sizes = [tuple(x) for x in img_cfg.get('skip', [])]
                k = 0
                for im in page.images:
                    w, h = im['x1'] - im['x0'], im['bottom'] - im['top']
                    if tuple(im['srcsize']) in skip_sizes or w < img_cfg.get('min', 60) or h < img_cfg.get('min_h', 30):
                        continue
                    if pno in img_cfg.get('skip_pages', []):
                        continue
                    k += 1
                    name = f'p{pno:03d}-{k}.webp'
                    out_file = os.path.join(media_dir, name)
                    if not os.path.exists(out_file):
                        bbox = (max(0, im['x0']), max(0, im['top']), min(page.width, im['x1']), min(page.height, im['bottom']))
                        render_crop(path, pno, bbox, page, out_file, img_cfg.get('dpi', 110))
                    flow.append(('image', {'page': pno, 'top': im['top'], 'x0': im['x0'], 'src': f'{url_prefix}/{name}'}))
    flow.sort(key=lambda it: (it[1]['page'], it[1]['top'], it[1]['x0']))
    skipped += cfg.get('extra_skipped', [])   # teks di gambar sampul yang tidak ditampilkan
    return assemble(flow, cfg, skipped, raw)


def body_pitch(flow):
    ps = []
    prev = None
    for kind, it in flow:
        if kind == 'line' and it['role'] in ('body', 'bullet'):
            if prev is not None and prev['page'] == it['page'] and 0 < it['top'] - prev['top'] < 2.2 * it['size']:
                ps.append(round(it['top'] - prev['top'], 1))
            prev = it
        else:
            prev = None
    if not ps:
        return 13.0
    ps.sort()
    return ps[len(ps) // 3]


def assemble(flow, cfg, skipped, raw):
    pitch = body_pitch(flow)
    x1s = sorted(it['x1'] for k, it in flow if k == 'line' and it['role'] == 'body')
    right = x1s[int(len(x1s) * 0.85)] if x1s else 1e9
    para_k = cfg.get('para_gap', 1.3)
    chapters = []
    preface = []
    cur = {'blocks': preface}
    st = {'open': None, 'last': None}   # blok yang sedang dibangun, baris terakhir

    def blocks():
        return cur['blocks']

    def close():
        o = st['open']
        if not o:
            return
        kind = o['kind']
        if kind == 'para':
            t = merge_marks(o['text'])
            if t:
                blocks().append({'type': 'p', 'text': t})
        elif kind == 'list':
            items = [merge_marks(x) for x in o['items'] if merge_marks(x)]
            if items:
                b = {'type': 'list', 'items': items}
                if o.get('ordered'):
                    b['ordered'] = True
                blocks().append(b)
        elif kind == 'code':
            code = code_text(o['lines'], cfg)
            if code.strip():
                blocks().append({'type': 'code', 'lang': guess_lang(code, cfg.get('lang', 'text')), 'code': code})
        elif kind == 'callout':
            t = merge_marks(' '.join(o['parts']))
            if t:
                tone = cfg.get('callout_tone', 'info')
                if re.search(r'⚠|warning|peringatan|pitfall|caution|avoid|jangan', t, re.I):
                    tone = 'warn'
                t = re.sub(r'^\W*(⚠️?|💡|📌|ℹ️?)\s*', '', t)
                blocks().append({'type': 'callout', 'tone': tone, 'text': t})
        elif kind in ('h3', 'h4'):
            t = merge_marks(' '.join(o['parts']))
            t = re.sub(r'^[' + re.escape(BULLETS) + r']\s*', '', t).replace('**', '')
            if t:
                blocks().append({'type': 'h', 'text': t, 'level': 3 if kind == 'h3' else 4})
        elif kind == 'q':
            t = merge_marks(' '.join(o['parts']))
            t = re.sub(r'\*\*', '', t)
            star = cfg.get('star')
            starred = bool(star and re.search(star, t))
            if star:
                t = re.sub(star, '', t).strip()
            if cfg.get('q_strip'):
                t = re.sub(cfg.get('q_strip'), '', t).strip()
            if starred:
                t += ' ⭐'
            blocks().append({'type': 'qmark', 'text': t})
        st['open'] = None

    def gap_ok(ln, k=para_k):
        last = st['last']
        if last is None:
            return False
        if last['page'] != ln['page']:
            return True  # lanjut ke halaman berikutnya
        return ln['top'] - last['top'] <= pitch * k

    for kind, it in flow:
        if kind == 'table':
            close()
            bl = blocks()
            if bl and bl[-1]['type'] == 'table' and st['last'] is None and len(bl[-1]['head']) == len(it['head']) \
                    and (it['head'] == bl[-1]['head'] or (not any('**' in h for h in it['head']) and any('**' in h for h in bl[-1]['head']))):
                bl[-1]['rows'].extend(([] if it['head'] == bl[-1]['head'] else [it['head']]) + it['rows'])  # tabel bersambung ke halaman berikutnya
            else:
                bl.append({'type': 'table', 'head': it['head'], 'rows': it['rows']})
            st['last'] = None
            continue
        if kind == 'image':
            close()
            blocks().append({'type': 'image', 'src': it['src'], 'alt': cfg.get('img_alt', 'Gambar dari dokumen sumber'),
                             'caption': f"Gambar asli dari dokumen sumber (hal. {it['page']})."})
            st['last'] = None
            continue
        ln = it
        role = ln['role']
        o = st['open']
        if role == 'chapter':
            if o and o['kind'] == 'chapter' and gap_ok(ln, 2.6):
                cur['title'] += ' ' + ln['text']
            else:
                close()
                cur = {'title': ln['text'], 'blocks': [], 'page': ln['page']}
                chapters.append(cur)
                st['open'] = {'kind': 'chapter'}
            st['last'] = ln
            continue
        if role in ('h3', 'h4', 'q', 'callout'):
            if o and o['kind'] == role and gap_ok(ln, 1.9 if role != 'callout' else 2.2) and \
                    not (role == 'q' and cfg.get('q_new') and re.search(cfg.get('q_new'), ln['text'])):
                o['parts'].append(styled_text(ln, cfg))
            else:
                close()
                st['open'] = {'kind': role, 'parts': [styled_text(ln, cfg)]}
            st['last'] = ln
            continue
        if role == 'code':
            if o and o['kind'] == 'code' and (gap_ok(ln, cfg.get('code_gap', 3.2)) or (ln['page'] != st['last']['page'])):
                o['lines'].append(ln)
            else:
                close()
                st['open'] = {'kind': 'code', 'lines': [ln]}
            st['last'] = ln
            continue
        txt = styled_text(ln, cfg)
        if role == 'bullet':
            item = re.sub(r'^(\*\*|\*|`)?\s*(\\\*|[' + re.escape(BULLETS) + r']|[-–]|o(?=\s))\s*', lambda m: m.group(1) or '', txt)
            item = re.sub(r'^`o`\s*', '', item)
            if o and o['kind'] == 'list' and gap_ok(ln, 2.4) and not o.get('ordered'):
                o['items'].append(item)
                o['x0'] = ln['x0']
            else:
                close()
                st['open'] = {'kind': 'list', 'items': [item], 'x0': ln['x0']}
            st['last'] = ln
            continue
        if role == 'num':  # butir bernomor "1. ..."
            item = re.sub(r'^\s*\d+[.)]\s*', '', txt)
            if o and o['kind'] == 'list' and o.get('ordered') and gap_ok(ln, 2.4):
                o['items'].append(item)
            else:
                close()
                st['open'] = {'kind': 'list', 'items': [item], 'x0': ln['x0'], 'ordered': True}
            st['last'] = ln
            continue
        # body
        if o and o['kind'] == 'list' and gap_ok(ln, cfg.get('list_gap', 1.9)) and ln['x0'] > o['x0'] + 2:
            joiner = '' if (cfg.get('dehyphen') and o['items'][-1].endswith('-') and re.match(r'^[a-z]', txt)) else ' '
            if joiner == '':
                o['items'][-1] = o['items'][-1][:-1]
            o['items'][-1] += joiner + txt
        elif o and o['kind'] == 'para' and gap_ok(ln) and not (re.search(r'[.:!?]\**$', o['text']) and (
                st['last']['page'] != ln['page'] or st['last']['x1'] < right - cfg.get('short_line', 45))):
            if cfg.get('dehyphen') and o['text'].endswith('-') and re.match(r'^[a-z]', txt):
                o['text'] = o['text'][:-1] + txt
            else:
                o['text'] += ' ' + txt
        else:
            close()
            st['open'] = {'kind': 'para', 'text': txt}
        st['last'] = ln
    close()
    for ch in chapters:
        ch['title'] = re.sub(r'\s+', ' ', ch['title']).strip()
        ch.pop('page', None)
    return {'preface': preface, 'chapters': chapters, 'skipped': skipped, 'raw': raw}


if __name__ == '__main__':
    args = sys.argv[1:]
    cfg = json.loads(args[1]) if len(args) > 1 else {}
    media = args[2] if len(args) > 2 else None
    prefix = args[3] if len(args) > 3 else None
    json.dump(convert(args[0], cfg, media, prefix), sys.stdout, ensure_ascii=False, indent=1)
