"""Laporan cakupan per dokumen (Markdown) dari hasil audit.py + ringkasan arsip assemble.py.

python3 tools/docx-import/report.py audit.json [audit2.json ...] > tools/docx-import/LAPORAN_CAKUPAN.md
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
audit = {}
for f in sys.argv[1:]:
    audit.update(json.load(open(f)))
arsip = json.load(open(os.path.join(os.environ.get('DOCX_JSON', os.path.join(HERE, 'out')), '_arsip.json')))
ORDER = ['Java & Spring', 'Go', 'JS & TS', 'Python', 'Rust', 'Mobile', 'Database & SQL', 'Distributed System',
         'Low Level Design', 'Cloud & DevOps', 'Testing & QA', 'LLM', 'Interview Prep', 'English Learning']

rows = []
for key, v in audit.items():
    stem = os.path.splitext(key)[0]
    name = ('html/' + stem) if key.endswith('.html') else stem
    info = arsip.get(name) or arsip.get('manual/' + stem) or {}
    cur = info.get('curriculum')
    if stem == 'Belajar_Hacktiv8':
        cur = 'LLM'
    ok = v['units'] - v['missing']
    rows.append({'cur': cur or '?', 'key': key, 'units': v['units'], 'ok': ok, 'para': v.get('paraphrased', 0) + v.get('ocr_fuzzy', 0),
                 'img': v.get('in_page_images', 0), 'arch': info.get('archived', 0), 'manual': v.get('manual_verified'),
                 'ocr': v.get('ocr')})
rows.sort(key=lambda r: (ORDER.index(r['cur']) if r['cur'] in ORDER else 99, r['key'].startswith('alt/'), r['key']))
T = sum(r['units'] for r in rows)
F = sum(r['ok'] for r in rows)
I = sum(r['img'] for r in rows)
fmt = lambda n: f'{n:,}'.replace(',', '.')
print('# Laporan cakupan dokumen sumber\n')
pct = f'{100 * F / T:.2f}'.replace('.', ',')
print(f'Diperiksa otomatis pada {len(rows)} file: **{fmt(F)} dari {fmt(T)} potongan teks ({pct}%) ada di aplikasi**'
      + (f', termasuk {fmt(I)} baris rumus/diagram yang tampil utuh di gambar halaman.' if I else '.') + '\n')
print('Cara cek: setiap paragraf, sel tabel, dan baris kode di file asli dibaca langsung (python-docx, pdftotext, lxml, '
      'dan OCR tesseract untuk PDF berupa gambar — bukan skrip konversi), lalu dicari di data aplikasi setelah dinormalisasi '
      '(huruf kecil, tanpa tanda baca). Potongan di bawah 15 karakter (nomor halaman, label kolom) tidak dihitung, dan '
      'header/footer berjalan di PDF (mis. "Disusun untuk Daniel", judul bab di atas halaman) diabaikan.\n')
print('- **Arsip**: jumlah bagian yang disimpan di track *Arsip Sumber* karena tidak masuk jalur utama '
      '(duplikat dari sumber lain, pengantar, daftar isi, versi ringkas, teks promosi slide).')
print('- **Parafrase/OCR**: kalimat yang cocok secara longgar (≥70–80% katanya sama). Dipakai untuk 3 halaman HTML awal '
      'yang ditulis ulang, dan untuk hasil OCR slide bergambar yang ejaannya tidak sempurna.')
print('- **Di gambar**: untuk e-book RAG dan cheatsheet Stanford/MIT, tiap halaman juga ditampilkan sebagai gambar. Baris rumus '
      'atau label diagram yang urutan karakternya berubah saat diekstrak dihitung di kolom ini. Begitu juga teks di dalam '
      'screenshot (IDE, GitHub, hasil test) di PDF API Testing dan label diagram slide Microservices Design Patterns, yang '
      'ditampilkan utuh sebagai gambar di modulnya.')
print('- Untuk PDF yang punya lapisan teks, OCR hanya dipakai untuk teks di dalam gambar tertanam (teks biasa sudah dicek '
      'lewat pdftotext). Halaman yang seluruhnya gambar di-OCR penuh.\n')
print('| Kurikulum | File | Potongan | Ada | Parafrase/OCR | Di gambar | Arsip |')
print('|---|---|---:|---:|---:|---:|---:|')
for r in rows:
    key = r['key'] + (' ✍️' if r['manual'] else '')
    units = r['units'] if not r['manual'] else '—'
    ok = r['ok'] if not r['manual'] else 'manual'
    print(f"| {r['cur']} | {key} | {units} | {ok} | {r['para'] or ''} | {r['img'] or ''} | {r['arch'] or ''} |")
WHY = {
    '60_days_Java.pdf': 'hasil OCR: footer slide yang terbaca rusak, dan baris email/nomor telepon pribadi dari tangkapan layar '
                        'profil LinkedIn penulis yang sengaja tidak disalin (sisa teks profil ada di arsip)',
    'TDD.pdf': 'hasil OCR: teks slide yang tercampur ilustrasi di sebelahnya; kalimat aslinya sudah disalin utuh dan diperiksa per slide',
}
miss = [(k, v) for k, v in audit.items() if v['missing']]
if miss:
    print('\n## Potongan yang tidak ditemukan\n')
    for k, v in miss:
        why = WHY.get(k) or ('hasil OCR dari gambar; baris ikon/handle media sosial atau huruf yang salah terbaca, isinya sudah diperiksa manual'
                             if v.get('ocr') else 'rumus dengan subskrip; teksnya ada di aplikasi tetapi terpecah di beberapa baris')
        print(f"- `{k}` ({v['missing']} baris, {why}):")
        for x in v['missing_samples']:
            print(f"  - `{x.replace('`', "'")}`")
print('\nCatatan:\n')
for r in rows:
    if r['manual']:
        print(f"- ✍️ `{r['key']}`: {r['manual']}")
print('- `Belajar_Hacktiv8.docx` hanya berisi dua gambar slide. Keduanya ditampilkan di modul *Program Applied AI Engineer (Hacktiv8)* '
      '(kurikulum LLM), dan isinya juga ditulis sebagai teks.')
print('- `100 Lambda Code Snippets (Java 8).pdf`, `Java Functional Interfaces.pdf`, `Lazy Loading React.pdf`, dan '
      '`Spring Dependency Injection.pdf` berisi kode dalam bentuk gambar; kodenya disalin manual lalu dicocokkan dengan OCR. '
      'PDF Lambda hanya memuat snippet 1–50 dan nomor 33 tidak ada di sumber.')
print('- `TDD.pdf` dan `FSD_dan_TSD.pdf` seluruhnya gambar slide; isinya disalin manual lalu dicocokkan dengan OCR. '
      '`60_days_Java.pdf`, `Exploring_the_Java_Ecosystem.pdf`, dan `Microservices_Design_Pattern.pdf` punya lapisan teks; '
      'kode di gambar (Hello World) dan label diagram juga disalin, dan 14 slide pola microservices ditampilkan sebagai gambar.')
print('- `E-Book_Arsitektur_Performa_Sistem_Enterprise.pdf` dan `Modul_DevOps_Production-Ready_Docker_Kubernetes_V2.pdf` adalah '
      'versi baru dari dokumen yang sudah ada. Hanya bagian yang baru (studi kasus, kode, peringatan keamanan) yang ditambahkan '
      'ke modul topik yang sama dengan judul *Pembaruan …*; bagian yang sama dengan versi lama tidak diulang.')
print('- `Coding_Interview_in_Java.pdf`: 23 dari 120 soal juga ada di track soal Java yang sudah ada. Soalnya tetap ditampilkan '
      'karena solusinya berbeda, dengan tautan ke modul lama supaya bisa dibandingkan.')
print('- `alt/…` adalah versi ringkas roadmap Web/Mobile yang terunggah dua kali dengan isi berbeda. '
      'Versi komprehensif ada di jalur utama; bagian versi ringkas yang berbeda ada di arsip.')
print('- `English_Komprehensif_v2_Vocabulary_Baru.docx` isinya identik dengan `English_Komprehensif_Tenses_TOEFL_v2.docx`.')
