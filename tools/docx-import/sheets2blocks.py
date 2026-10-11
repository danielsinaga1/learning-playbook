"""Cheatsheet padat rumus (PDF) → modul berisi gambar tiap halaman + teks hasil ekstraksi (untuk pencarian).

Rumus matematika tidak bisa diubah ke teks tanpa merusaknya, jadi halaman ditampilkan apa adanya sebagai gambar.
Teks (pdftotext -raw) disimpan di blok lipat supaya tetap bisa dicari.

python3 -I sheets2blocks.py file.pdf '<config-json>' <folder-media> <prefix-url> > out.json
config: {"chapters": [[judul, hal_awal, hal_akhir, ringkasan], ...], "dpi": 140, "quality": 55, "skip_pages": [1]}
"""
import json
import os
import re
import subprocess
import sys
import tempfile

ESC = re.compile(r'([\\*`\[\]])')


def page_text(path, p):
    t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), '-raw', path, '-'], capture_output=True, text=True).stdout
    lines = [re.sub(r'\s+', ' ', l).strip() for l in t.split('\n')]
    return [l for l in lines if l]


def headings(lines):
    out = []
    for l in lines:
        m = re.match(r'^(\d+(\.\d+)*)\s+([A-Z][A-Za-z ,&\-–’\'()/]+?)(\s+\d+)?$', l)
        if m and len(l) < 70 and '. . .' not in l and not m.group(4):
            out.append(f'{m.group(1)} {m.group(3).strip()}')
    return out


def render(path, p, media_dir, name, dpi, quality):
    from PIL import Image
    with tempfile.TemporaryDirectory() as td:
        base = os.path.join(td, 'p')
        subprocess.run(['pdftoppm', '-f', str(p), '-l', str(p), '-r', str(dpi), '-png', '-singlefile', path, base], check=True)
        im = Image.open(base + '.png').convert('RGB')
        os.makedirs(media_dir, exist_ok=True)
        im.save(os.path.join(media_dir, name), 'WEBP', quality=quality, method=6)


def convert(path, cfg, media_dir, url_prefix):
    chapters = []
    skipped = []
    raw = []
    for p in cfg.get('skip_pages', []):
        skipped.extend(page_text(path, p))
    for title, a, z, summary in cfg['chapters']:
        blocks = []
        heads = []
        for p in range(a, z + 1):
            heads += [h for h in headings(page_text(path, p)) if h not in heads]
        if heads:
            blocks.append({'type': 'p', 'text': '**Isi halaman ini:** ' + ' · '.join(ESC.sub(r'\\\1', h) for h in heads)})
        for p in range(a, z + 1):
            name = f'p{p:02d}.webp'
            if not os.path.exists(os.path.join(media_dir, name)):
                render(path, p, media_dir, name, cfg.get('dpi', 140), cfg.get('quality', 55))
            lines = page_text(path, p)
            raw.extend(lines)
            blocks.append({'type': 'h', 'text': f'Halaman {p}', 'level': 4})
            blocks.append({'type': 'image', 'src': f'{url_prefix}/{name}', 'alt': f'{title} — halaman {p} dari cheatsheet',
                           'caption': 'Klik gambar untuk membuka ukuran penuh.'})
            blocks.append({'type': 'details', 'summary': f'Teks halaman {p} (hasil ekstraksi, untuk pencarian)',
                           'blocks': [{'type': 'p', 'text': ESC.sub(r'\\\1', '\n'.join(lines))}]})
        chapters.append({'title': title, 'summary': summary, 'pages': [a, z], 'blocks': blocks})
    return {'preface': [], 'chapters': chapters, 'skipped': skipped, 'raw': raw}


if __name__ == '__main__':
    json.dump(convert(sys.argv[1], json.loads(sys.argv[2]), sys.argv[3], sys.argv[4]), sys.stdout, ensure_ascii=False, indent=1)
