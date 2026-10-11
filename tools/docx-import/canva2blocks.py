"""Konversi PDF desain bebas (Canva / slide) → bab & blok playbook, plus gambar tiap halaman.

Teks diambil per kotak (pdfminer layout) lalu disusun ulang mengikuti kolom: kotak yang tepat di bawah
kotak lain dan sejajar horizontal dianggap lanjutan (judul kartu → isi kartu). Label pendek yang tersebar
(teks di dalam diagram) dikumpulkan menjadi satu baris "Label diagram". Header/footer berjalan dibuang.
Setiap halaman juga dirender menjadi WebP untuk galeri "halaman asli".

python3 -I canva2blocks.py file.pdf '<config-json>' <folder-media> <prefix-url> > out.json
config: {"chapters": [[judul, hal_awal, hal_akhir], ...], "skip_pages": [1, 2], "header_top": 30,
         "footer_top": 805, "dpi": 110, "quality": 60}
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from pdfminer.high_level import extract_pages
from pdfminer.layout import LAParams, LTChar, LTTextBoxHorizontal

ESC = re.compile(r'([\\*`\[\]])')


def esc(t):
    return ESC.sub(r'\\\1', t)


def box_info(el, H):
    chars = [c for line in el for c in line if isinstance(c, LTChar)]
    if not chars:
        return None
    vis = [c for c in chars if c.get_text().strip()]
    if not vis:
        return None
    sizes = sorted(round(c.size) for c in vis)
    size = sizes[len(sizes) // 2]
    bold = sum('Bold' in c.fontname for c in vis) / len(vis) > 0.7
    ital = sum('Italic' in c.fontname for c in vis) / len(vis) > 0.7
    lines = [re.sub(r'\s+', ' ', l.get_text()).strip() for l in el]
    lines = [l for l in lines if l]
    return {'x0': el.x0, 'x1': el.x1, 'top': H - el.y1, 'bottom': H - el.y0, 'size': size, 'bold': bold, 'ital': ital,
            'lines': lines, 'font': vis[0].fontname.split('+')[-1]}


def overlap(a, b):
    return max(0.0, min(a['x1'], b['x1']) - max(a['x0'], b['x0']))


def order_boxes(boxes):
    """Susun kotak menjadi rantai kolom, lalu urutkan rantai dari atas ke bawah, kiri ke kanan."""
    boxes = sorted(boxes, key=lambda b: (round(b['top'] / 6), b['x0']))
    chains = []
    for b in boxes:
        best = None
        for ch in chains:
            a = ch[-1]
            gap = b['top'] - a['bottom']
            if -4 <= gap < 34 and overlap(a, b) > 0.5 * min(a['x1'] - a['x0'], b['x1'] - b['x0']):
                # jangan sambung bila ada kotak lain sejajar (awal kolom baru) atau b melintasi beberapa kolom
                sib = [o for o in boxes if o is not b and abs(o['top'] - b['top']) < 12 and overlap(a, o) > 0]
                multi = [c for c in chains if c is not ch and -4 <= b['top'] - c[-1]['bottom'] < 34 and overlap(c[-1], b) > 0]
                if not sib and not multi:
                    best = ch
                    break
        if best is not None:
            best.append(b)
        else:
            chains.append([b])
    chains.sort(key=lambda ch: (round(ch[0]['top'] / 8), ch[0]['x0']))
    return [b for ch in chains for b in ch]


def is_label(b):
    text = ' '.join(b['lines'])
    return len(text) <= 32 and not (b['bold'] and b['size'] >= 16) and b['size'] <= 16 and len(b['lines']) <= 3


def blocks_from_boxes(boxes):
    out = []
    labels = []

    def flush_labels():
        nonlocal labels
        if labels:
            if len(labels) == 1 and len(labels[0]) > 12:
                out.append({'type': 'p', 'text': esc(labels[0])})
            else:
                out.append({'type': 'p', 'text': '*Label diagram:* ' + ' · '.join(esc(x) for x in labels)})
        labels = []

    for b in boxes:
        text = ' '.join(b['lines'])
        if is_label(b) and not text.endswith(('.', ':')):
            labels.append(text)
            continue
        flush_labels()
        if b['bold'] and b['size'] >= 30:
            out.append({'type': 'h', 'text': esc(text), 'level': 3})
        elif b['bold'] and b['size'] >= 18 and len(text) < 120:
            out.append({'type': 'h', 'text': esc(text), 'level': 4})
        elif b['bold'] and len(text) < 100:
            out.append({'type': 'p', 'text': f'**{esc(text)}**'})
        elif any(l.startswith(('•', '●', '▪', '- ')) for l in b['lines']):
            items, cur = [], None
            for l in b['lines']:
                if l.startswith(('•', '●', '▪', '- ')):
                    if cur:
                        items.append(cur)
                    cur = l.lstrip('•●▪- ').strip()
                else:
                    cur = (cur + ' ' + l) if cur else l
            if cur:
                items.append(cur)
            out.append({'type': 'list', 'items': [esc(i) for i in items]})
        else:
            t = esc(text)
            out.append({'type': 'p', 'text': f'*{t}*' if b['ital'] else t})
    flush_labels()
    # paragraf yang terpotong antarkotak (tanpa tanda akhir kalimat) disambung
    merged = []
    for blk in out:
        if merged and blk['type'] == 'p' and merged[-1]['type'] == 'p' and not merged[-1]['text'].startswith(('*', '**')) \
                and not blk['text'].startswith('*') and re.search(r'[a-z,]$', merged[-1]['text']) and re.match(r'^[a-z]', blk['text']):
            merged[-1]['text'] += ' ' + blk['text']
        else:
            merged.append(blk)
    return merged


def render(path, pno, media_dir, name, dpi, quality):
    from PIL import Image
    with tempfile.TemporaryDirectory() as td:
        base = os.path.join(td, 'p')
        subprocess.run(['pdftoppm', '-f', str(pno), '-l', str(pno), '-r', str(dpi), '-png', '-singlefile', path, base], check=True)
        im = Image.open(base + '.png').convert('RGB')
        os.makedirs(media_dir, exist_ok=True)
        im.save(os.path.join(media_dir, name), 'WEBP', quality=quality, method=6)


def convert(path, cfg, media_dir, url_prefix):
    header_top = cfg.get('header_top', 30)
    footer_top = cfg.get('footer_top', 805)
    skip_pages = set(cfg.get('skip_pages', []))
    pages = {}
    skipped = []
    raw = []
    params = LAParams(line_margin=0.4, char_margin=4.0, word_margin=0.2, boxes_flow=0.5)
    for i, layout in enumerate(extract_pages(path, laparams=params), start=1):
        H = layout.height
        boxes = []
        for el in layout:
            if not isinstance(el, LTTextBoxHorizontal):
                continue
            b = box_info(el, H)
            if not b:
                continue
            text = ' '.join(b['lines'])
            raw.extend(b['lines'])
            if b['top'] < header_top or b['top'] > footer_top:
                skipped.append(text)
                continue
            boxes.append(b)
        if i in skip_pages:
            skipped.extend(' '.join(b['lines']) for b in order_boxes(boxes))
            continue
        pages[i] = blocks_from_boxes(order_boxes(boxes))
    chapters = []
    for title, a, z in cfg['chapters']:
        blocks = []
        imgs = []
        for p in range(a, z + 1):
            blocks.extend(pages.get(p, []))
            name = f'p{p:02d}.webp'
            if not os.path.exists(os.path.join(media_dir, name)):
                render(path, p, media_dir, name, cfg.get('dpi', 110), cfg.get('quality', 60))
            imgs.append({'page': p, 'src': f'{url_prefix}/{name}'})
        chapters.append({'title': title, 'pages': [a, z], 'blocks': blocks, 'images': imgs})
    return {'preface': [], 'chapters': chapters, 'skipped': skipped, 'raw': raw}


if __name__ == '__main__':
    json.dump(convert(sys.argv[1], json.loads(sys.argv[2]), sys.argv[3], sys.argv[4]), sys.stdout, ensure_ascii=False, indent=1)
