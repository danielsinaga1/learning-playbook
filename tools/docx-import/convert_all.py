"""Konversi semua dokumen sumber → tools/docx-import/out/*.json, lalu susun kurikulum.

Pemakaian (dari root proyek):
    pip install python-docx pdfplumber lxml pillow
    python3 tools/docx-import/convert_all.py <folder-sumber>

Isi folder sumber (dicari rekursif):
    *.docx            dokumen utama (nama file harus ada di configs.json)
    *.pdf             PDF; cara konversinya mengikuti "tool" di configs.json:
                        (tanpa tool) → pdf2blocks.py   (panduan IELTS)
                        greedy       → greedy2blocks.py (buku Greedy Algorithms)
                        canva        → canva2blocks.py  (e-book RAG; + gambar halaman)
                        sheets       → sheets2blocks.py (cheatsheet rumus; gambar halaman + teks)
                        text         → text2blocks.py   (PDF teks umum: e-book/handout; peran baris dari font & latar)
                        manual       → transkripsi manual di manual_sources.py (PDF berupa gambar)
    alt/*.docx        versi ringkas roadmap Web/Mobile (hanya untuk arsip)
    html/*.html       tiga halaman HTML awal (isinya ada di src/data/*.ts; hanya untuk arsip)
Gambar halaman/ilustrasi ditulis ke public/media/<nama>/ dan dirujuk sebagai "media/<nama>/...".
Dokumen yang tidak dikenal (mis. Belajar_Hacktiv8.docx, ditulis tangan di src/data/ai.ts) dilewati.

Setelah itu jalankan audit cakupan:
    python3 tools/docx-import/audit.py <folder-sumber> <folder-sumber>/en <folder-sumber>/alt <folder-sumber>/pdf2 <folder-sumber>/html/*.html > audit.json
    python3 tools/docx-import/report.py audit.json > tools/docx-import/LAPORAN_CAKUPAN.md
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
src = sys.argv[1]
out = os.path.join(HERE, 'out')
cfgs = json.load(open(os.path.join(HERE, 'configs.json')))
TOOLS = {'greedy': 'greedy2blocks.py', 'canva': 'canva2blocks.py', 'sheets': 'sheets2blocks.py', 'text': 'text2blocks.py'}


def run(tool, path, dest, *args):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    r = subprocess.run([sys.executable, '-I', os.path.join(HERE, tool), path, *args], capture_output=True, text=True)
    if r.returncode:
        print('GAGAL', path, r.stderr[-500:])
        return
    open(dest, 'w').write(r.stdout)
    print('ok', os.path.relpath(dest, out))


subprocess.run([sys.executable, '-I', os.path.join(HERE, 'manual_sources.py'), out], check=True)
for root, _, files in os.walk(src):
    sub = os.path.basename(root)
    for f in sorted(files):
        name, ext = os.path.splitext(f)
        path = os.path.join(root, f)
        cfg = cfgs.get(name, {})
        tool = cfg.get('tool')
        if ext == '.html':
            run('html2blocks.py', path, os.path.join(out, 'html', name + '.json'))
        elif ext == '.pdf' and tool == 'manual':
            if cfg.get('render_pages'):  # slide yang ditampilkan sebagai gambar (mis. diagram carousel)
                media = os.path.join(ROOT, 'public', 'media', cfg['media'])
                os.makedirs(media, exist_ok=True)
                for pno in cfg['render_pages']:
                    dest = os.path.join(media, f'p{pno:02d}.webp')
                    if not os.path.exists(dest):
                        subprocess.run(['pdftoppm', '-f', str(pno), '-l', str(pno), '-r', str(cfg.get('dpi', 110)), '-png',
                                        '-singlefile', path, dest[:-5]], check=True)
                        from PIL import Image
                        im = Image.open(dest[:-5] + '.png').convert('RGB')
                        w = cfg.get('width', 900)
                        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im
                        im.save(dest, 'WEBP', quality=62, method=6)
                        os.remove(dest[:-5] + '.png')
            continue
        elif ext == '.pdf' and tool == 'text' and 'media' not in cfg:
            run(TOOLS[tool], path, os.path.join(out, name + '.json'), json.dumps(cfg))
        elif ext == '.pdf' and tool in TOOLS:
            media = os.path.join(ROOT, 'public', 'media', cfg['media'])
            prefix = f"media/{cfg['media']}"
            extra = [media, prefix] if tool == 'greedy' else [json.dumps(cfg), media, prefix]
            run(TOOLS[tool], path, os.path.join(out, name + '.json'), *extra)
        elif ext == '.pdf':
            run('pdf2blocks.py', path, os.path.join(out, name + '.json'))
        elif ext == '.docx' and sub == 'alt':
            run('docx2blocks.py', path, os.path.join(out, 'alt', name + '.json'), json.dumps({'chapter': 1}))
        elif ext == '.docx' and name in cfgs:
            run('docx2blocks.py', path, os.path.join(out, name + '.json'), json.dumps(cfgs[name]))
        elif ext == '.docx':
            print('lewati (tidak ada di configs.json):', f)
subprocess.run([sys.executable, '-I', os.path.join(HERE, 'assemble.py')], check=True, env={**os.environ, 'DOCX_JSON': out})
