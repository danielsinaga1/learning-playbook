"""Audit cakupan: apakah setiap potongan teks dokumen sumber ada di data aplikasi?

python3 -I audit.py <folder|file> [...] > laporan.json
Unit = paragraf / sel tabel / baris kode (dinormalisasi: huruf kecil, hanya a-z0-9).
Mendukung .docx, .pdf (pdftotext; header/footer berjalan diabaikan), dan .html.
Pemeriksaan ini independen dari skrip konversi (membaca file asli dengan alat lain).
"""
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

from docx import Document
from docx.oxml.ns import qn

APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'data')


def norm(s):
    s = unicodedata.normalize('NFKC', s).lower()
    s = s.replace('\\', '')
    return re.sub(r'[^a-z0-9]+', '', s)


def app_corpus():
    parts = []
    for f in glob.glob(f'{APP}/gen/*.json'):
        def walk(x):
            if isinstance(x, str):
                parts.append(x)
            elif isinstance(x, dict):
                # kunci metadata (tipe blok, nada callout, bahasa kode, id) bukan isi
                keys = [k for k in x.keys() if k not in ('type', 'tone', 'lang', 'id', 'level', 'ordered', 'hue', 'track', 'monogram')]
                # judul ditulis sebelum isi (callout, kode) agar urutan sama dengan dokumen
                for k in ('title', 'q', 'term'):
                    if k in keys:
                        keys.remove(k)
                        keys.insert(0, k)
                for k in keys:
                    walk(x[k])
            elif isinstance(x, list):
                for v in x:
                    walk(v)
        walk(json.load(open(f, encoding='utf-8')))
    # file .ts yang ditulis tangan: ambil isi string literal saja (tanpa nama properti)
    lit = re.compile(r"(?:(\w+)\s*:\s*)?('(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`)")
    meta = {'type', 'tone', 'lang', 'id', 'level', 'hue', 'track', 'monogram'}
    for f in glob.glob(f'{APP}/*.ts'):
        if f.endswith('index.ts'):
            continue
        for m in lit.finditer(open(f, encoding='utf-8').read()):
            if m.group(1) not in meta:
                parts.append(m.group(2)[1:-1].replace('\\n', '\n'))
    return norm(' '.join(parts))


def para_text(p):
    out = ''
    for node in p.iter():
        if node.tag == qn('w:t'):
            out += node.text or ''
        elif node.tag in (qn('w:br'), qn('w:cr')):
            out += '\n'
        elif node.tag == qn('w:tab'):
            out += ' '
    return out


def docx_units(path):
    d = Document(path)
    units = []
    for el in d.element.body.iter():
        if el.tag == qn('w:p'):
            t = para_text(el)
            for line in t.split('\n'):
                if line.strip():
                    units.append(line.strip())
    return units


def pdf_units(path):
    """Baris pdftotext dipecah per kolom; baris yang berulang di awal/akhir ≥3 halaman = header/footer."""
    import subprocess
    txt = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
    txt = INVIS.sub('', txt)                      # tanda arah teks/zero-width (PDF ekspor Google Docs)
    pages = [[l.strip() for l in pg.split('\n') if l.strip()] for pg in txt.split('\f')]
    edge = {}
    for pg in pages:
        for l in pg[:2] + pg[-2:]:
            k = re.sub(r'\d+', '#', l)
            edge[k] = edge.get(k, 0) + 1
    running = {k for k, v in edge.items() if v >= 2}
    units, ignored = [], set()
    for pg in pages:
        for i, line in enumerate(pg):
            if (i < 2 or i >= len(pg) - 2) and (re.sub(r'\d+', '#', line) in running or re.match(r'^Chapter \d+\. ', line)):
                ignored.add(line)
                continue
            for seg in re.split(r'\s{3,}', line):
                if seg.strip():
                    units.append(seg.strip())
    IGNORED[path] = sorted(ignored)
    return units


# PDF berbasis gambar: teks dibaca dengan OCR (tesseract) dan dicocokkan secara longgar.
# Catatan tulisan tangan tidak bisa di-OCR dengan andal → diperiksa manual (halaman dibaca satu per satu).
# PDF yang tiap halamannya juga ditampilkan sebagai gambar di aplikasi: teks diagram/rumus yang urutan karakternya
# berbeda saat diekstrak tetap utuh di gambar halaman.
PAGE_IMAGES = {'Retrieval_Augmented_Generation.pdf', 'Cheatsheet_ML_DL_AI_Stanford.pdf'}
# Gambar tertanam yang juga ditampilkan di aplikasi (screenshot, diagram slide): nomor halamannya.
IMAGES_SHOWN = {'API_Testing.pdf': {14}, 'End_to_End_API_Testing.pdf': {5, 6, 8},
                'Microservices_Design_Pattern.pdf': set(range(2, 16))}
# Slide dengan tata letak dua kolom (teks + ilustrasi): segmentasi otomatis tesseract (psm 3) lebih tepat daripada psm 6.
OCR_PSM = {'TDD.pdf': '3'}
INVIS = re.compile('[\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]')
MANUAL_VERIFIED = {'Data_Structure.pdf': 'Catatan tulisan tangan; OCR tidak andal, isi 8 halaman diperiksa manual.'}
OCR = {}


def image_boxes(path, dpi):
    """Kotak gambar tertanam per halaman (dalam piksel render) — teks OCR di luar gambar sudah dicek lewat pdftotext."""
    import pdfplumber
    k = dpi / 72.0
    out = {}
    with pdfplumber.open(path) as pdf:
        for i, p in enumerate(pdf.pages, start=1):
            if len([c for c in p.chars if c['text'].strip()]) < 20:   # halaman tanpa lapisan teks: semua hasil OCR dipakai
                out[i] = [(0, 0, p.width * k, p.height * k)]
            else:
                out[i] = [(im['x0'] * k, im['top'] * k, im['x1'] * k, im['bottom'] * k) for im in p.images]
    return out


def ocr_units(path):
    """Baris OCR (tesseract, TSV) yang letaknya di dalam gambar tertanam: [(teks, halaman)]."""
    dpi = 200
    boxes = image_boxes(path, dpi)
    units = []
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['pdftoppm', '-r', str(dpi), '-png', path, os.path.join(td, 'p')], check=True)
        pngs = sorted(f for f in os.listdir(td) if f.endswith('.png'))
        for pno, f in enumerate(pngs, start=1):
            base = os.path.join(td, f[:-4])
            psm = OCR_PSM.get(os.path.basename(path), '6')
            subprocess.run(['tesseract', base + '.png', base, '--psm', psm, 'tsv'], capture_output=True)
            lines = {}
            for row in open(base + '.tsv', encoding='utf-8', errors='ignore').read().split('\n')[1:]:
                c = row.split('\t')
                if len(c) < 12 or c[0] != '5' or not c[11].strip():
                    continue
                key = (c[2], c[3], c[4])
                x, y, w, h = map(int, c[6:10])
                ln = lines.setdefault(key, {'words': [], 'x0': x, 'y0': y, 'x1': x + w, 'y1': y + h})
                ln['words'].append(c[11])
                ln['x0'], ln['y0'] = min(ln['x0'], x), min(ln['y0'], y)
                ln['x1'], ln['y1'] = max(ln['x1'], x + w), max(ln['y1'], y + h)
            for ln in lines.values():
                cx, cy = (ln['x0'] + ln['x1']) / 2, (ln['y0'] + ln['y1']) / 2
                if any(b[0] <= cx <= b[2] and b[1] <= cy <= b[3] for b in boxes.get(pno, [])):
                    units.append((' '.join(ln['words']), pno))
    return units


def needs_ocr(path):
    info = subprocess.run(['pdfinfo', path], capture_output=True, text=True).stdout
    pages = int(re.search(r'Pages:\s+(\d+)', info).group(1))
    imgs = subprocess.run(['pdfimages', '-list', path], capture_output=True, text=True).stdout.count('\n') - 2
    return pages <= 20 and imgs > 0


def html_units(path):
    import lxml.html
    root = lxml.html.fromstring(open(path, encoding='utf-8').read())
    for bad in root.xpath('//script|//style'):
        bad.drop_tree()
    units = []
    blocks = root.xpath('//p|//li|//td|//th|//h1|//h2|//h3|//h4|//h5|//h6|//pre|//summary|//dt|//dd|//figcaption|//blockquote|//button|//span|//div')
    for el in blocks:
        # hanya elemen "daun" teks: teks langsung milik elemen ini (tanpa anak blok)
        if el.tag in ('div', 'span') and any(ch.tag in ('div', 'p', 'ul', 'ol', 'table', 'pre', 'section', 'h1', 'h2', 'h3', 'h4') for ch in el):
            t = (el.text or '').strip()
            if t:
                units.append(t)
            continue
        # anak elemen dipisah spasi (mis. <span>EC2</span><span>Manual setup</span>)
        t = el.text_content() if el.tag == 'pre' else '\n'.join(
            ' '.join(x.strip() for x in seg.split(' ') if x.strip()) for seg in ' \u2063 '.join(el.itertext()).split('\n'))
        t = t.replace(' \u2063 ', ' ').replace('\u2063', '')
        for line in t.split('\n'):
            if line.strip():
                units.append(re.sub(r'\s+', ' ', line.strip()))
    return units


IGNORED = {}


PREFIX = re.compile(r'^\s*((bab|bagian|fase|lampiran|modul|soal|part)\s+[\w.]+\s*[:—–.-]?\s*|[A-Ea-e]?\d+(\.\d+)*[.)]?\s+|[A-E]\.\d+\s+)', re.I)


def found(u, corpus):
    n = norm(u)
    if n in corpus:
        return True
    v = re.sub(r'\s+\d{1,3}$', '', u)            # nomor halaman di daftar isi
    if len(norm(v)) >= 8 and norm(v) in corpus:
        return True
    v = PREFIX.sub('', v)
    v = re.sub(r'\s*\((dipertahankan|edisi komprehensif)\)', '', v, flags=re.I)
    if len(norm(v)) >= 8 and norm(v) in corpus:
        return True
    # label + isi (mis. "Catatan: …", "The Why — …", "JUDUL. isi") disimpan terpisah
    for sep in (': ', ' — ', '. ', ' - '):
        if sep in u:
            a, b = u.split(sep, 1)
            na, nb = norm(PREFIX.sub('', a)), norm(b)
            if (len(na) < 3 or na in corpus) and len(nb) >= 8 and nb in corpus:
                return True
    return False


def ts_token_sets():
    lit = re.compile(r"'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`")
    out = []
    for f in glob.glob(f'{APP}/*.ts'):
        for m in lit.finditer(open(f, encoding='utf-8').read()):
            out.append(set(re.findall(r'[a-z0-9]{3,}', m.group(0).lower())))
    return out


def paraphrased(u, sets):
    """HTML awal ditulis ulang di .ts: ≥80% kata (≥3 huruf) ada dalam satu string yang sama."""
    toks = set(re.findall(r'[a-z0-9]{3,}', u.lower()))
    return len(toks) >= 3 and any(len(toks & s) >= 0.8 * len(toks) for s in sets)


def app_token_sets():
    out = []
    for f in glob.glob(f'{APP}/gen/*.json'):
        def walk(x):
            if isinstance(x, str):
                for line in x.split('\n'):
                    t = set(re.findall(r'[a-z0-9]{3,}', unicodedata.normalize('NFKC', line).lower()))
                    if t:
                        out.append(t)
            elif isinstance(x, dict):
                for v in x.values():
                    walk(v)
            elif isinstance(x, list):
                for v in x:
                    walk(v)
        walk(json.load(open(f, encoding='utf-8')))
    return out


def ocr_found(u, sets):
    """Baris hasil OCR dianggap ada bila ≥70% katanya (≥3 huruf) muncul di satu baris teks aplikasi."""
    toks = set(re.findall(r'[a-z0-9]{3,}', u.lower()))
    if len(toks) < 2:
        return True
    return any(len(toks & s) >= 0.7 * len(toks) for s in sets)


def main(folders):
    corpus = app_corpus()
    ts_sets = ts_token_sets()
    app_sets = app_token_sets()
    report = {}
    paths = []
    for folder in folders:
        if os.path.isfile(folder):
            paths.append(folder)
        else:
            paths += sorted(glob.glob(os.path.join(folder, '*.docx')) + glob.glob(os.path.join(folder, '*.pdf')))
    for path in paths:
        if True:
            units = docx_units(path) if path.endswith('.docx') else pdf_units(path) if path.endswith('.pdf') else html_units(path)
            ocr = {}
            if path.endswith('.pdf') and os.path.basename(path) not in MANUAL_VERIFIED and needs_ocr(path):
                extra = ocr_units(path)
                head_toks = set(re.findall(r'[a-z0-9]{3,}', ' '.join(IGNORED.get(path, [])).lower())) | {'page'}
                for u, pno in extra:
                    toks = set(re.findall(r'[a-z0-9]{3,}', u.lower()))
                    if head_toks and toks and len(toks & head_toks) >= 0.5 * len(toks):
                        continue                     # header/footer berjalan yang terbaca OCR
                    ocr.setdefault(norm(u), pno)
                    units.append(u)
            total = 0
            missing = []
            para = 0
            ocrm = 0
            img = 0
            img_samples = []
            seen = set()
            for u in units:
                n = norm(u)
                if len(n) < 15 or n in seen:
                    continue
                seen.add(n)
                total += 1
                if not found(u, corpus):
                    if n in ocr and ocr_found(u, app_sets):
                        ocrm += 1
                        continue
                    if os.path.basename(path) in PAGE_IMAGES or (n in ocr and ocr[n] in IMAGES_SHOWN.get(os.path.basename(path), ())):
                        img += 1
                        img_samples.append(u)
                        continue
                    if path.endswith('.html') and paraphrased(u, ts_sets):
                        para += 1
                        continue
                    missing.append(u)
            key = os.path.basename(path)
            if '/alt/' in path:
                key = 'alt/' + key
            report[key] = {
                'units': total,
                'missing': len(missing),
                'coverage': round(100 * (total - len(missing)) / total, 2) if total else 100.0,
                'paraphrased': para,
                'missing_samples': missing,
                'ignored_running_header_footer': IGNORED.get(path, []),
                'ocr': bool(ocr),
                'ocr_fuzzy': ocrm,
                'in_page_images': img,
                'in_page_images_samples': img_samples,
                'manual_verified': MANUAL_VERIFIED.get(os.path.basename(path)),
            }
    json.dump(report, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1:])
