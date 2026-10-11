"""Menyusun bab-bab hasil konversi .docx menjadi kurikulum playbook (JSON).

Aturan utama:
- Satu kurikulum per bahasa/ekosistem; tiap dokumen sumber menjadi track (submodul).
- Bab yang topiknya sudah dibahas lebih lengkap di dokumen lain dibuang (lihat DEDUP di bawah).
"""
import copy
import json
import os
import re
import unicodedata
import sys

SRC = os.environ.get('DOCX_JSON', 'tools/docx-import/out')
DST = sys.argv[1] if len(sys.argv) > 1 else 'src/data/gen'
os.makedirs(DST, exist_ok=True)

_cache = {}


def doc(name):
    if name not in _cache:
        _cache[name] = json.load(open(f'{SRC}/{name}.json'))
    return _cache[name]


def chapter(name, idx):
    return copy.deepcopy(doc(name)['chapters'][idx])


def plain(s):
    s = re.sub(r'\\([\\*`\[\]])', r'\1', s)
    s = re.sub(r'\*\*|\*|`', '', s)
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
    return s.strip()


TITLE_PREFIX = [
    r'^(BAB|Bab)\s+\d+\s*[:—–-]\s*',
    r'^\d+\.\s+',
    r'^Modul\s+\d+\s*:\s*',
    r'^Bagian\s+\d+\s*[—–-]\s*',
    r'^\[Baru\]\s*',
]


def clean_title(t):
    t = plain(t)
    for p in TITLE_PREFIX:
        t = re.sub(p, '', t)
    t = re.sub(r'\[Baru\]\s*', '', t)
    return t.strip()


def slug(t):
    s = plain(t).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:48].strip('-') or 'modul'


def summarize(blocks):
    for b in blocks:
        if b['type'] == 'qa':
            names = [re.split(r'\s+[—–]\s+', plain(q['q']))[0] for q in b['items']]
            return f"{len(names)} soal: " + ', '.join(names[:4]) + (', dan lainnya.' if len(names) > 4 else '.')
    for b in blocks:
        if b['type'] == 'p':
            t = plain(b['text']).replace('\n', ' ')
            if len(t) < 25 or t.rstrip().endswith(':'):
                continue
            m = re.match(r'^(.{40,170}?[.!?])(\s|$)', t)
            if m:
                return m.group(1)
            return (t[:150].rsplit(' ', 1)[0] + '…') if len(t) > 150 else t
    hs = [plain(b['text']) for b in blocks if b['type'] == 'h' and b.get('level', 3) == 3]
    if hs:
        hs = [re.sub(r'^\d+(\.\d+)*\s+', '', h) for h in hs]
        s = 'Membahas ' + ', '.join(hs[:4]) + (', dan lainnya.' if len(hs) > 4 else '.')
        return s
    for b in blocks:
        if b['type'] == 'callout':
            return plain(b['text'])[:150]
        if b['type'] == 'table' and b['head']:
            return 'Tabel referensi: ' + ', '.join(plain(h) for h in b['head'] if h) + '.'
        if b['type'] == 'code':
            return 'Langkah praktik lengkap dengan contoh kode.'
        if b['type'] == 'list' and b['items']:
            first = plain(b['items'][0])
            return (first[:150].rsplit(' ', 1)[0] + '…') if len(first) > 150 else first
    return ''


def drop_sections(blocks, patterns):
    """Buang section h3 yang judulnya cocok dengan salah satu regex."""
    out = []
    skipping = False
    for b in blocks:
        if b['type'] == 'h' and b.get('level', 3) == 3:
            skipping = any(re.search(p, plain(b['text']), re.I) for p in patterns)
        if not skipping:
            out.append(b)
    return out


def split_prompt(blocks):
    """Blok teks sebelum kode pertama = konteks soal, sisanya = jawaban."""
    prompt = []
    i = 0
    while i < len(blocks) and blocks[i]['type'] in ('p', 'list') and len(prompt) < 3:
        prompt.append(blocks[i])
        i += 1
    answer = blocks[i:]
    if not answer:
        return [], prompt
    return prompt, answer


def qa_from_soal(blocks, prefix, drop=()):
    """h3 'SOAL n — judul' → item Q&A. Blok sebelum soal pertama dipertahankan."""
    out = []
    items = []
    cur = None
    for b in blocks:
        if b['type'] == 'h' and b.get('level', 3) == 3 and re.match(r'^(SOAL|LATIHAN)\b', plain(b['text']), re.I):
            cur = {'raw': plain(b['text']), 'blocks': []}
            items.append(cur)
            continue
        if cur is None:
            out.append(b)
        else:
            cur['blocks'].append(b)
    qa = []
    n = 0
    for it in items:
        m = re.match(r'^SOAL\s+(\d+)\s*[—–-]\s*(.+)$', it['raw'], re.I)
        num = int(m.group(1)) if m else None
        if num in drop:
            continue
        title = m.group(2) if m else it['raw'].title()
        n += 1
        prompt, answer = split_prompt(it['blocks'])
        item = {'id': f'{prefix}-{n:02d}', 'q': title.strip(), 'a': answer or [{'type': 'p', 'text': '(Kerjakan sendiri.)'}]}
        if prompt:
            item['prompt'] = prompt
        qa.append(item)
    if qa:
        out.append({'type': 'qa', 'items': qa})
    return out


def qa_from_qmark(blocks, prefix, drop=(), extract=None):
    out = []
    qa = []
    cur = None
    for b in blocks:
        if b['type'] == 'qmark':
            cur = {'q': plain(b['text']), 'prompt': [], 'a': [], 'in_answer': False}
            qa.append(cur)
            continue
        if cur is None:
            out.append(b)
            continue
        if b['type'] == 'h' and re.match(r'^jawaban\b', plain(b['text']), re.I):
            cur['in_answer'] = True
            continue
        (cur['a'] if cur['in_answer'] else cur['prompt']).append(b)
    items = []
    n = 0
    for it in qa:
        m = re.match(r'^(\d+)[.)]\s*(.+)$', it['q'])
        num = int(m.group(1)) if m else None
        q = m.group(2) if m else it['q']
        if extract is not None and num in extract:
            extract[num] = it['prompt'] + it['a']
            continue
        if num in drop:
            continue
        n += 1
        item = {'id': f'{prefix}-{n:02d}', 'q': q, 'a': it['a'] or it['prompt']}
        if it['a'] and it['prompt']:
            item['prompt'] = it['prompt']
        items.append(item)
    out.append({'type': 'qa', 'items': items})
    return out


def to_vocab(blocks):
    out = []
    for b in blocks:
        h = [plain(x).lower() for x in b.get('head', [])] if b['type'] == 'table' else []
        if h and re.search(r'^(word|phrase|verb|idiom|kata)', h[0]) and len(h) >= 3 and re.search(r'arti', h[1]):
            items = []
            for r in b['rows']:
                if not r or not plain(r[0]).strip():
                    continue
                it = {'term': plain(r[0]), 'meaning': plain(r[1])}
                if len(h) == 4 and 'sinonim' in h[2]:
                    it['synonyms'] = plain(r[2])
                    if plain(r[3]):
                        it['example'] = plain(r[3])
                elif plain(r[2]) and plain(r[2]) != '—':
                    it['example'] = plain(r[2])
                items.append(it)
            out.append({'type': 'vocab', 'items': items})
        else:
            out.append(b)
    return out


def practice(blocks, prefix):
    """Latihan dengan kunci → soal latihan; paragraf berisi □ → checklist."""
    out = []
    n = 0
    k = 0
    for i, b in enumerate(blocks):
        if b['type'] == 'table':
            h = [plain(x).lower() for x in b['head']]
            if any('kunci' in x or 'kemungkinan jawaban' in x for x in h):
                items = []
                for r in b['rows']:
                    cells = [c for c in r]
                    if h and h[0] in ('no', '#'):
                        cells = cells[1:]
                    if len(cells) < 2 or not plain(cells[0]):
                        continue
                    n += 1
                    items.append({'id': f'{prefix}-{n:02d}', 'q': cells[0], 'a': [{'type': 'p', 'text': cells[-1]}]})
                out.append({'type': 'qa', 'items': items})
                continue
        if b['type'] == 'p' and plain(b['text']).count('□') >= 2:
            parts = [x.strip() for x in plain(b['text']).split('□') if x.strip()]
            k += 1
            out.append({'type': 'checklist', 'id': f'{prefix}-x{k}', 'items': parts})
            continue
        if b['type'] == 'list' and b.get('ordered') and i + 1 < len(blocks) and blocks[i + 1]['type'] == 'p' \
                and re.match(r'^\W*kunci', plain(blocks[i + 1]['text']), re.I):
            key = re.sub(r'^\W*kunci[^:]*:\W*', '', blocks[i + 1]['text'], flags=re.I)
            answers = {}
            for part in re.split(r'\s+·\s+', key):
                m = re.match(r'^\s*(\d+)\s*[-–]\s*(.+)$', part)
                if m:
                    answers[int(m.group(1))] = m.group(2).strip()
            items = []
            for j, q in enumerate(b['items'], 1):
                items.append({'id': f'{prefix}-{j:02d}', 'q': q, 'a': [{'type': 'p', 'text': f'**Jawaban:** {answers.get(j, "lihat kunci di bawah")}'}]})
            out.append({'type': 'qa', 'items': items})
            blocks[i + 1] = {'type': 'p', 'text': ''}
            continue
        if b['type'] == 'p' and not b['text'].strip():
            continue
        out.append(b)
    return out


def demote(blocks):
    for b in blocks:
        if b['type'] == 'h':
            b['level'] = 4
    return blocks


SOURCE_LABEL = {
    '01_TypeScript_Penuh': 'TypeScript Penuh',
    '05_GraphQL': 'GraphQL',
    '50_Soal_Advanced_React_SpringBoot': '50 Soal Advanced React & Spring Boot',
    'Algoritma_Java': 'Kumpulan Soal & Solusi Algoritma Java',
    'Angular-Pemula-sampai-Mahir': 'Angular: Pemula sampai Mahir',
    'Backend_Go_PencatatKeuangan_API': 'Backend Go: API Pencatat Keuangan',
    'Belajar-React-TypeScript-Lengkap': 'Belajar React + TypeScript Lengkap',
    'Belajar_GoLang_Pemula_ke_Mahir': 'Belajar Golang: Pemula ke Mahir',
    'Design_Patterns_Java': 'Design Patterns dalam Java',
    'Django_FinancialTracker_1_Fondasi': 'Django Financial Tracker 1: Fondasi',
    'Django_FinancialTracker_2_Produksi': 'Django Financial Tracker 2: Produksi',
    'Docker-Kubernetes-Pemula-sampai-Mahir': 'Docker & Kubernetes: Pemula sampai Mahir',
    'English_Vocabulary_and_Phrasal_Verbs_v3': 'English Vocabulary & Phrasal Verbs',
    'Express_FinancialTracker_1_Fondasi': 'Express Financial Tracker 1: Fondasi',
    'Express_FinancialTracker_2_Produksi': 'Express Financial Tracker 2: Produksi',
    'FastAPI_FinancialTracker_1_Fondasi': 'FastAPI Financial Tracker 1: Fondasi',
    'FastAPI_FinancialTracker_2_Produksi': 'FastAPI Financial Tracker 2: Produksi',
    'Flutter-Panduan-Lengkap': 'Flutter: Panduan Lengkap',
    'Golang_Masterclass_Lengkap': 'Go Masterclass',
    'Materi-Java-SpringBoot-Pemula-sampai-Mahir': 'Materi Java & Spring Boot: Pemula sampai Mahir',
    'SpringBoot_Panduan_Lengkap': 'Spring Boot: Panduan Lengkap',
    'Panduan_Distributed_System_Spring_Boot': 'Distributed System dengan Spring Boot',
    'Struktur_Data_Java_Interview': 'Panduan Struktur Data dengan Java',
    'Panduan-Arsitektur-dan-Performa-Sistem': 'Arsitektur & Performa Sistem',
    'Modul_Rust_Pemula_hingga_Mahir': 'Pemrograman Rust: Pemula hingga Mahir',
    'Nest_FinancialTracker_1_Fondasi': 'Nest Financial Tracker 1: Fondasi',
    'Nest_FinancialTracker_2_Produksi': 'Nest Financial Tracker 2: Produksi',
    'Panduan_Backend_Platform_Engineering': 'Panduan Backend Platform Engineering',
    'Panduan_Belajar_Database_SQL_NoSQL': 'Panduan Belajar Database SQL & NoSQL',
    'SQL-Pemula-sampai-Mahir': 'SQL: Pemula sampai Mahir',
    'Proyek_React_PencatatKeuangan': 'Proyek React Pencatat Keuangan',
    'Proyek_React_PencatatKeuangan_v2_SemuaHooks': 'Proyek React Pencatat Keuangan v2 (Semua Hooks)',
    'React_Masterclass_Hooks_State_Performa': 'React Masterclass: Hooks, State & Performa',
    'React_Panduan_Konsolidasi': 'Panduan React Lengkap (Konsolidasi)',
    'ReactNative_PencatatKeuangan_Mobile': 'React Native: Pencatat Keuangan Mobile',
    'Software_Testing_Lengkap': 'Software Testing Lengkap',
    '00-Roadmap-Teknis-Lanjutan-Overview': 'Roadmap Teknis Lanjutan: Overview',
    '03-DataAI-Roadmap-Komprehensif': 'Roadmap Terpadu Data/AI (Komprehensif)',
    '03-DataAI-Fase1-LLM-Engineering': 'Data/AI Fase 1: LLM Engineering',
    '03-DataAI-Fase2-Fine-Tuning-Evaluasi': 'Data/AI Fase 2: Fine-tuning & Evaluasi',
    '03-DataAI-Fase3-MLOps': 'Data/AI Fase 3: MLOps',
    '03-DataAI-Fase4-Data-Engineering': 'Data/AI Fase 4: Data Engineering',
}
for _n in ['01-Web-Fase1-Modern-Rendering-Edge', '01-Web-Fase2-API-Design-Type-Safety', '01-Web-Fase3-Performance-Engineering',
           '01-Web-Fase4-Web-Security', '02-Mobile-Fase1-Cross-Platform', '02-Mobile-Fase2-On-Device-AI',
           '02-Mobile-Fase3-Performance-Profiling', '02-Mobile-Fase4-Arsitektur-Delivery',
           '04-SysDesign-Fase1-Distributed-Systems', '04-SysDesign-Fase2-Observability', '04-SysDesign-Fase3-Platform-Engineering',
           '04-SysDesign-Fase4-Skalabilitas-FinOps', '05-LowLevel-Fase1-Fondasi-Bahasa-Sistem', '05-LowLevel-Fase2-Concurrency-Memory-Model',
           '05-LowLevel-Fase3-OS-Internals-Performance', '05-LowLevel-Fase4-Proyek-Sistem-Skala',
           '06-DBInternals-Fase1-Storage-Engine-Fundamentals', '06-DBInternals-Fase2-Transaksi-Concurrency-Control',
           '06-DBInternals-Fase3-Query-Processing-Optimizer', '06-DBInternals-Fase4-Search-Engineering-Relevance',
           '07-ConcDist-Fase1-GPU-Parallel-Computing', '07-ConcDist-Fase2-Formal-Methods-TLA',
           '07-ConcDist-Fase3-Algoritma-Terdistribusi-Lanjutan', '07-ConcDist-Fase4-Capstone-Terverifikasi-Terakselerasi',
           '08-GreenComputing-Fase1-Fundamental-Energy-Aware', '08-GreenComputing-Fase2-Efisiensi-Software-Hardware',
           '08-GreenComputing-Fase3-Carbon-Aware-Infrastructure', '08-GreenComputing-Fase4-Capstone-Audit-Karbon']:
    _area, _fase, _rest = re.match(r'^\d+-(\w+?)-Fase(\d)-(.+)$', _n).groups()
    _area = {'Web': 'Web', 'Mobile': 'Mobile', 'SysDesign': 'System Design', 'LowLevel': 'Low-Level',
             'DBInternals': 'DB Internals', 'ConcDist': 'Concurrency & Distributed', 'GreenComputing': 'Green Computing'}[_area]
    SOURCE_LABEL[_n] = f"{_area} Fase {_fase}: {_rest.replace('-', ' ')}"


def strip_numbers(blocks):
    """'10.2 Goroutine' → 'Goroutine' (nomor bab asli tidak cocok lagi setelah digabung)."""
    for b in blocks:
        if b['type'] == 'h':
            b['text'] = re.sub(r'^\d+(\.\d+)*\.?\s+(?=\S)', '', b['text'])
            b['text'] = re.sub(r'\s*\((dipertahankan|Edisi Komprehensif)\)', '', b['text'])
        if b['type'] in ('p', 'callout'):
            b['text'] = re.sub(r'[ \t]{2,}', ' ', b['text'])
        if b['type'] == 'list':
            b['items'] = [re.sub(r'[ \t]{2,}', ' ', x) for x in b['items']]
        if b['type'] == 'qa':
            for q in b['items']:
                strip_numbers(q.get('prompt', []))
                strip_numbers(q['a'])
    return blocks


def M(docname, idx, title=None, drop=None, qa=None, prefix=None, qa_drop=(), summary=None, extract=None, vocab=False, extra=None):
    ch = chapter(docname, idx)
    blocks = ch['blocks']
    if drop:
        blocks = drop_sections(blocks, drop)
    if qa == 'soal':
        blocks = qa_from_soal(blocks, prefix, qa_drop)
    elif qa == 'qmark':
        blocks = qa_from_qmark(blocks, prefix, qa_drop, extract)
    if vocab:
        blocks = to_vocab(blocks)
    if extra:
        blocks = extra + blocks
    strip_numbers(blocks)
    t = title or clean_title(ch['title'])
    return {'title': t, 'summary': summary or summarize(blocks), 'source': SOURCE_LABEL[docname], 'blocks': blocks}


def MERGE(docname, idxs, title, summary=None, as_qa=None):
    """Gabungkan beberapa bab pendek menjadi satu modul (tiap bab = section atau satu soal)."""
    blocks = []
    qa = []
    for k, i in enumerate(idxs):
        ch = chapter(docname, i)
        if as_qa:
            prompt, answer = split_prompt(ch['blocks'])
            item = {'id': f'{as_qa}-{k + 1:02d}', 'q': clean_title(ch['title']), 'a': answer or ch['blocks']}
            if prompt and answer:
                item['prompt'] = prompt
            qa.append(item)
        else:
            blocks.append({'type': 'h', 'text': clean_title(ch['title']), 'level': 3})
            blocks.extend(demote(ch['blocks']))
    if qa:
        blocks.append({'type': 'qa', 'items': qa})
    strip_numbers(blocks)
    return {'title': title, 'summary': summary or summarize(blocks), 'source': SOURCE_LABEL[docname], 'blocks': blocks}


def tracked(track, mods):
    for m in mods:
        m['track'] = track
    return mods


CHECK_NOTE = 'Tidak ada kunci jawaban. Jawab dengan kata-katamu sendiri, lalu cocokkan dengan bagian Topik & Materi. Tandai **Ulangi** bila belum lancar.'


def checklistify(blocks, prefix):
    """Daftar di bagian 'Checklist …' / setelah 'Milestone' → checklist interaktif; 'Uji Pemahaman' → soal latihan."""
    out = []
    sec = ''
    after_ms = False
    n = qn = 0
    for b in blocks:
        if b['type'] == 'h':
            t = plain(b['text'])
            if b.get('level', 3) == 3:
                sec = t.lower()
            after_ms = bool(re.match(r'^(milestone|checklist)', t, re.I))
            out.append(b)
            continue
        if b['type'] == 'list' and ('checklist' in sec or after_ms):
            n += 1
            out.append({'type': 'checklist', 'id': f'{prefix}-c{n}', 'items': [re.sub(r'^[☐☑✓✔□]\s*', '', x) for x in b['items']]})
            after_ms = False
            continue
        if b['type'] == 'list' and 'uji pemahaman' in sec:
            items = []
            for x in b['items']:
                qn += 1
                items.append({'id': f'{prefix}-Q{qn}', 'q': x, 'a': [{'type': 'callout', 'tone': 'tip', 'title': 'Cara menilai', 'text': CHECK_NOTE}]})
            out.append({'type': 'qa', 'items': items})
            continue
        out.append(b)
    return out


def phase_title(t):
    t = plain(t)
    t = re.sub(r'\s*\(Edisi Komprehensif\)', '', t)
    t = re.sub(r'^(Web|Mobile|Data/AI)\s+', '', t)
    t = re.sub(r'^Fase\s+(\d+)\s*[:—–-]\s*', r'Fase \1 · ', t)
    return t.strip()


def PHASE(docname, prefix, title=None, summary=None, extra=None):
    """Satu dokumen fase (roadmap per bidang) → satu modul; bab menjadi section."""
    d = doc(docname)
    chs = copy.deepcopy(d['chapters'])
    pre = copy.deepcopy(d['preface'])
    duration = None
    for b in pre:
        if b['type'] == 'p':
            m = re.search(r'Bulan\s+\d+\s*-\s*\d+', plain(b['text']))
            if m:
                duration = m.group(0)
    blocks = []
    if len(chs) == 1:
        t = title or phase_title(chs[0]['title'])
        blocks = chs[0]['blocks']
    else:
        t = title or phase_title(chs[0]['part'] or docname)
        blocks = [b for b in pre if b['type'] == 'table']
        for ch in chs:
            blocks.append({'type': 'h', 'text': clean_title(ch['title']), 'level': 3})
            blocks.extend(demote(ch['blocks']))
    for b in blocks:
        if b['type'] == 'table' and not b['head'] and b['rows'] and plain(b['rows'][0][0]) == 'Bidang':
            for r in b['rows']:
                if plain(r[0]) == 'Fase':
                    m = re.search(r'Bulan\s+\d+\s*-\s*\d+', plain(r[1]))
                    if m and not duration:
                        duration = m.group(0)
    if extra:
        blocks = extra + blocks
    blocks = checklistify(blocks, prefix)
    strip_numbers(blocks)
    mod = {'title': t, 'summary': summary or summarize([b for b in blocks if b['type'] != 'table']), 'source': SOURCE_LABEL[docname], 'blocks': blocks}
    if duration:
        mod['duration'] = duration
    return mod


def MERGEX(parts, title, prefix, summary=None):
    """Gabungkan bab dari beberapa dokumen (doc, idx) menjadi satu modul bersection."""
    blocks = []
    src = []
    for docname, i in parts:
        ch = chapter(docname, i)
        blocks.append({'type': 'h', 'text': clean_title(ch['title']), 'level': 3})
        blocks.extend(demote(ch['blocks']))
        if SOURCE_LABEL[docname] not in src:
            src.append(SOURCE_LABEL[docname])
    blocks = checklistify(blocks, prefix)
    strip_numbers(blocks)
    return {'title': title, 'summary': summary or summarize(blocks), 'source': ' · '.join(src), 'blocks': blocks}



FT_NOTE = {
    'type': 'callout', 'tone': 'tip', 'title': 'Satu proyek, banyak bahasa',
    'text': 'API Financial Tracker (Pencatat Keuangan) yang sama dibangun di beberapa kurikulum: **Go**, **Node.js/Express**, **FastAPI**, dan **Django**. Kontrak endpoint-nya identik, jadi kamu bisa membandingkan cara tiap ekosistem menyelesaikan masalah yang sama.',
}

# ─── Dokumen tambahan (PDF batch 5): transkripsi manual, buku Greedy, RAG, cheatsheet ───
LAM, JFI, DSN, SDI, LZY = ('manual/Lambda_Code_Snippets_Java_8', 'manual/Java_Functional_Interfaces', 'manual/Data_Structure',
                           'manual/Spring_Dependency_Injection', 'manual/Lazy_Loading_React')
GRD, RAG, STF = 'Greedy_Algo', 'Retrieval_Augmented_Generation', 'Cheatsheet_ML_DL_AI_Stanford'
SOURCE_LABEL.update({
    LAM: '100 Lambda Code Snippets (Java 8)', JFI: 'Java Functional Interfaces (carousel)',
    DSN: 'Data Structure (catatan tulisan tangan)', SDI: 'Spring Dependency Injection (carousel)',
    LZY: 'Lazy Loading in React (carousel)', GRD: 'Greedy Algorithms (GeeksforGeeks)',
    RAG: 'Retrieval Augmented Generation: A Simple Introduction (Abhinav Kimothi)',
    STF: 'All Cheat Sheets: Machine Learning, Deep Learning & AI (Stanford & MIT)',
})

# ─── Dokumen tambahan (PDF batch 6) ───
KAF, API9, API6, CIJ, RJS, SQN = ('Apache_Kafka', 'API_Testing', 'End_to_End_API_Testing', 'Coding_Interview_in_Java',
                                  'React_JS', 'SQL_Notes')
EBA, DV2 = 'E-Book_Arsitektur_Performa_Sistem_Enterprise', 'Modul_DevOps_Production-Ready_Docker_Kubernetes_V2'
TDD, FTS, D60, JEC, MSP = ('manual/TDD', 'manual/FSD_dan_TSD', 'manual/60_days_Java', 'manual/Exploring_the_Java_Ecosystem',
                           'manual/Microservices_Design_Pattern')
SOURCE_LABEL.update({
    KAF: 'Apache Kafka Interview Preparation Guide (Java Edition)',
    API9: 'API Testing Series: CI/CD with API Testing (Lamhot Siagian)',
    API6: 'API Testing Series: Automating API Tests with Cucumber (Lamhot Siagian)',
    CIJ: 'Coding Interview in Java (Program Creek)', RJS: 'React JS Notes for Professionals (GoalKicker)',
    SQN: 'SQL Notes (Topper World)', EBA: 'E-Book Arsitektur & Performa Sistem Enterprise',
    DV2: 'Modul DevOps: Production-Ready Docker & Kubernetes V2',
    TDD: 'TDD untuk Vibe Coding (carousel Dicoding)', FTS: 'FSD dan TSD (carousel Muhammad Afif)',
    D60: '60 Days of Java, Day 2 (carousel Hariprasath V)', JEC: 'Exploring the Java Ecosystem (carousel)',
    MSP: 'Microservices Design Patterns (carousel Hina Arora)',
})


def _flat(x, out):
    if isinstance(x, str):
        out.append(x)
    elif isinstance(x, dict):
        for k, v in x.items():
            if k not in ('type', 'tone', 'lang', 'level', 'ordered', 'src'):
                _flat(v, out)
    elif isinstance(x, list):
        for v in x:
            _flat(v, out)
    return out


def _nz(t):
    return re.sub(r'[^a-z0-9]+', '', plain(t).lower())


_OLD = {}


def _is_old(t, names):
    key = tuple(names)
    if key not in _OLD:
        _OLD[key] = '\n'.join(_nz(x) for n in names for x in _flat([doc(n)['chapters'], doc(n).get('preface', [])], []))
    k = _nz(t)
    return len(k) < 12 or k in _OLD[key]


def FRESH(docname, idx, old, title):
    """Hanya bagian bab versi baru yang belum ada di versi lama (dokumen pembaruan) → ditempel ke modul lama."""
    out = []
    pending = None
    for b in chapter(docname, idx)['blocks']:
        nb = None
        if b['type'] == 'h':
            pending = b
            continue
        if b['type'] in ('p', 'callout'):
            nb = None if _is_old(b['text'], old) else b
        elif b['type'] == 'list':
            items = [x for x in b['items'] if not _is_old(x, old)]
            nb = {**b, 'items': items} if items else None
        elif b['type'] == 'code':
            ls = [l for l in b['code'].split('\n') if len(_nz(l)) >= 10]
            new = [l for l in ls if not _is_old(l, old)]
            nb = b if (ls and len(new) / len(ls) > 0.3) or (not ls and not _is_old(b['code'], old)) else None
        elif b['type'] == 'table':
            rows = [r for r in b['rows'] if any(not _is_old(c, old) for c in r)]
            nb = {**b, 'rows': rows} if rows else None
        else:
            nb = b
        if nb:
            if pending:
                out.append(pending)
                pending = None
            out.append(nb)
    return ([{'type': 'h', 'text': title, 'level': 3}] + demote(out)) if out else []


def add_fresh(mod, docname, idx, old, title):
    extra = FRESH(docname, idx, old, title)
    if extra:
        mod['blocks'] = mod['blocks'] + extra
        if SOURCE_LABEL[docname] not in mod['source']:
            mod['source'] += ' · ' + SOURCE_LABEL[docname]
    return mod


def QA_CHAPTERS(docname, idxs, title, prefix, summary=None, heads=True):
    """Beberapa bab Q&A (qmark) → satu modul; tiap bab jadi sub-judul + latihan soal."""
    blocks = []
    for i in idxs:
        ch = chapter(docname, i)
        if heads:
            blocks.append({'type': 'h', 'text': clean_title(ch['title']), 'level': 3})
        blocks += qa_from_qmark(demote(ch['blocks']), f'{prefix}{i + 1}')
    blocks = [b for b in blocks if not (b['type'] == 'qa' and not b['items'])]
    strip_numbers(blocks)
    return {'title': title, 'summary': summary or summarize(blocks), 'source': SOURCE_LABEL[docname], 'blocks': blocks}


def MERGE_T(docname, idxs, title, summary=None):
    """Gabung bab (judul bab jadi h3) tanpa membuang nomor 'Section x.y' kecuali awalan 'Chapter N:'."""
    blocks = []
    for i in idxs:
        ch = chapter(docname, i)
        if len(idxs) > 1:
            blocks.append({'type': 'h', 'text': re.sub(r'^(Chapter \d+|Appendix [A-Z]):\s*', '', ch['title']), 'level': 3})
        blocks += demote(ch['blocks']) if len(idxs) > 1 else ch['blocks']
    return {'title': title, 'summary': summary or summarize(blocks), 'source': SOURCE_LABEL[docname], 'blocks': blocks}


# Coding Interview in Java: 120 soal → modul per tema; tiap soal = item latihan (prompt = soal, jawaban = solusi)
CIJ_GROUPS = [
    (1, 11, 'Array, String & Interval', 'Rotate Array, Reverse Polish Notation, Word Ladder, median dua array terurut, Kth Largest, wildcard & regex matching, merge/insert interval.'),
    (12, 21, 'Two Sum, k-Sum & Parentheses', 'Keluarga Two Sum (I–III), 3Sum, 4Sum, 3Sum Closest, atoi, Merge Sorted Array, Valid & Longest Valid Parentheses.'),
    (22, 35, 'String & Array: Pola Dasar', 'strStr, minimum size subarray, search insert, longest consecutive, palindrome, zigzag, add binary, triangle, contains duplicate, remove duplicates.'),
    (36, 48, 'Sliding Window, Rotated Array & Majority', 'Longest substring, substring concatenation, minimum window, reverse words, rotated sorted array, Min Stack, majority element.'),
    (49, 62, 'Stack, Greedy & Two Pointer', 'Largest rectangle, longest common prefix, largest number, simplify path, gas station, Pascal, container with most water, candy, trapping rain water, basic calculator.'),
    (63, 77, 'Hashing & String Lanjutan', 'Group anagrams, shortest palindrome, summary ranges, increasing triplet, flip game, move zeroes, valid anagram, top K frequent, find peak, word pattern.'),
    (78, 97, 'Matriks, Grid & DP 2D', 'Set matrix zeroes, spiral, search 2D matrix, rotate image, sudoku, path sum, unique paths, number of islands, maximal rectangle/square, word search.'),
    (98, 108, 'Linked List I & Implementasi Stack', 'Stack dengan array, Add Two Numbers, reorder list, cycle, copy random pointer, merge, odd-even, remove duplicates, partition, LRU Cache.'),
    (109, 120, 'Linked List II, Stack & Queue', 'Intersection, remove elements, swap pairs, reverse list I–II, remove Nth from end, stack↔queue, palindrome list, queue dengan array, moving average.'),
]


def _qkey(t):
    t = re.split(r'\s+[—–-]\s+O\(|\s+—\s+', plain(t))[0]
    t = re.sub(r'\bin java\b', ' ', unicodedata.normalize('NFKC', t).lower())
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()


def CODING_INTERVIEW(existing):
    """existing: {kunci judul soal → (judul modul, slug modul)} dari track soal yang sudah ada."""
    if not has_doc(CIJ):
        return []
    chs = doc(CIJ)['chapters']
    mods = []
    for a, z, title, summary in CIJ_GROUPS:
        items = []
        for ch in chs:
            m = re.match(r'^(\d+)\s+(.+)$', ch['title'])
            n, q = int(m.group(1)), m.group(2).strip()
            if not (a <= n <= z):
                continue
            blocks = copy.deepcopy(ch['blocks'])
            k = next((i for i, b in enumerate(blocks) if b['type'] in ('h', 'code')), len(blocks))
            prompt, answer = blocks[:k], blocks[k:]
            if not answer:
                prompt, answer = split_prompt(blocks)
            if not answer:
                answer, prompt = prompt, []
            strip_numbers(answer)
            key = _qkey(q)
            hit = existing.get(key) or next((v for k, v in existing.items() if len(k.split()) >= 3 and (
                (key.startswith(k + ' ') and key[len(k):].strip() not in ('ii', 'iii', 'iv'))
                or key.rstrip('s') == k.rstrip('s'))), None)
            if hit:
                answer = [{'type': 'callout', 'tone': 'info', 'title': 'Juga ada di track soal',
                           'text': f'Soal ini juga dibahas di [{hit[0]}](#java.{hit[1]}) dengan pendekatan lain. Bandingkan kedua solusinya.'}] + answer
            item = {'id': f'PC-{n:03d}', 'q': f'{n}. {q}', 'a': answer}
            if prompt:
                item['prompt'] = prompt
            items.append(item)
        mods.append({'title': f'Coding Interview: {title} ({a}–{z})', 'summary': summary, 'source': SOURCE_LABEL[CIJ],
                     'blocks': [{'type': 'qa', 'items': items}]})
    return tracked('Coding Interview (Program Creek)', mods)


def has_doc(name):
    return os.path.exists(f'{SRC}/{name}.json')


def appendix(docname, idx, title):
    """Bab dokumen lain yang digabung ke akhir modul yang topiknya sama (bukan modul baru)."""
    ch = chapter(docname, idx)
    blocks = [{'type': 'h', 'text': title, 'level': 3}] + demote(ch['blocks'])
    return blocks


GREEDY_TRACKS = [
    ('Greedy: Konsep, Graf & MST', r'correctness of greedy|spanning tree|kruskal|prim’s|boruvka|dijkstra|dial’s|graph|k centers|max flow|edges to reverse|cycle components|connect all cities|reverse delete|water connection|initial vertices|cash flow|cost path|set cover'),
    ('Greedy: Penjadwalan & Interval', r'activity selection|job|scheduling|schedule|platforms|bookings|trains|rooms for m events|days required|process m tasks|chain of pairs|tapes'),
    ('Greedy: Koin, Knapsack & Huffman', r'coin|currency|knapsack|huffman|egyptian|fibonacci terms|candies'),
    ('Greedy: String', r'string|lexicograph|palindrom|bracket|characters|superstring'),
    ('Greedy: Sistem Operasi', r'memory management|page replacement|sjf|shortest job first|next fit|first fit|best fit|worst fit|bin packing'),
    ('Greedy: Array, Angka & Optimasi', r'.'),
]
GREEDY_ORDER = ['Greedy: Konsep, Graf & MST', 'Greedy: Penjadwalan & Interval', 'Greedy: Koin, Knapsack & Huffman',
                'Greedy: Array, Angka & Optimasi', 'Greedy: String', 'Greedy: Sistem Operasi']


def greedy_track(title):
    t = title.lower()
    for name, pat in [GREEDY_TRACKS[4]] + GREEDY_TRACKS[:4] + GREEDY_TRACKS[5:]:
        if re.search(pat, t):
            return name


def GREEDY():
    """Satu artikel = satu modul; dikelompokkan per tema ke beberapa track."""
    if not has_doc(GRD):
        return []
    mods = []
    for ch in doc(GRD)['chapters']:
        blocks = copy.deepcopy(ch['blocks'])
        url = re.search(r'https?://\S+', ch.get('source') or '')
        if url:
            label = esc_link(ch.get('orig') or ch['title'])
            blocks.append({'type': 'p', 'text': f'**Sumber:** [{label}]({url.group(0)})'})
        title = re.sub(r'\s+(Greedy Algo|DP)-\d+$', '', ch['title']).strip()
        mods.append({'title': title, 'summary': summarize(blocks), 'source': SOURCE_LABEL[GRD], 'blocks': blocks,
                     'track': greedy_track(ch['title'])})
    mods.sort(key=lambda m: (GREEDY_ORDER.index(m['track']), 0 if m['title'].startswith('Correctness') else 1))
    return mods


def esc_link(t):
    # label tautan tidak boleh berisi ']' (penanda akhir label) → pakai kurung siku lebar
    return re.sub(r'([\\*`])', r'\\\1', t.replace('[', '［').replace(']', '］'))


def PAGES_GALLERY(docname, ch, label):
    imgs = ch.get('images') or []
    if not imgs:
        return []
    a, z = ch['pages']
    return [{'type': 'details', 'summary': f'Halaman asli {label} (hal. {a}–{z}) — diagram & contoh kode bergambar',
             'blocks': [{'type': 'image', 'src': im['src'], 'alt': f'{label}, halaman {im["page"]}',
                         'caption': f'Halaman {im["page"]}'} for im in imgs]}]


# ═════════════════════════════ KURIKULUM ═════════════════════════════
CURRICULA = []

# ─── Java & Spring Boot (Strategi Algoritma dari HTML digabung di src/data/index.ts) ───
AJ = 'Algoritma_Java'
DPJ = 'Design_Patterns_Java'
MJ = 'Materi-Java-SpringBoot-Pemula-sampai-Mahir'
SB = 'SpringBoot_Panduan_Lengkap'
DS = 'Panduan_Distributed_System_Spring_Boot'
SD = 'Struktur_Data_Java_Interview'
AR = 'Panduan-Arsitektur-dan-Performa-Sistem'
java_mods = []
java_mods += tracked('Java Fundamentals', [
    M(MJ, 1, title='Persiapan Tools & Mindset'),
    M(MJ, 2, title='Java Fundamentals'),
    M(MJ, 3, title='Java Intermediate sampai Advanced'),
] + ([M(D60, 0, title='JDK, JRE, JVM & JIT (60 Days of Java, Day 2)',
        summary='Isi JDK (javac, java, javadoc, jar, jconsole, javap, jdb), JRE & library, JVM, cara JIT mempercepat kode, dan dua tahap kompilasi Java.')]
     if has_doc(D60) else [])
  + ([M(JEC, 0, summary='Tabel teknologi ekosistem Java per kategori: framework, build tool, web, testing, persistence, logging, security, messaging, REST, IDE, AI/ML, concurrency, networking, utilities.')]
     if has_doc(JEC) else []))
if has_doc(LAM):
    java_mods += tracked('Java Functional & Lambda', [
        M(JFI, 0, summary='Apa itu functional interface (SAM) dan use case Runnable, Comparator, Consumer, Predicate, UnaryOperator/BinaryOperator, serta interface kustom.'),
        M(LAM, 0, summary='Snippet 1–18: Runnable, forEach, filter, sort, functional interface kustom, Map, Optional, Predicate, Function, Supplier, operator.'),
        M(LAM, 1, summary='Snippet 19–35: sorting kustom, map, reduce, filter, distinct, sorted, count, anyMatch/allMatch/noneMatch, findFirst/findAny, sum, max, min.'),
        M(LAM, 2, summary='Snippet 36–50: joining, mapToInt, toSet, groupingBy, partitioningBy, counting, summarizingInt, toMap, Stream.of, limit, skip, peek, Optional.'),
    ])
java_mods += tracked('Struktur Data', ([M(DSN, 0, summary='Catatan tulisan tangan: definisi, klasifikasi, operasi, searching, array, linked list, stack, queue, tree, dan graph dalam 8 halaman.')]
                                     if has_doc(DSN) else []) + [
    M(SD, 0),
    M(SD, 1, drop=[r'reverse linked list', r'deteksi cycle']),        # ada di Soal Linked List
    M(SD, 2, drop=[r'valid parentheses', r'min stack']),               # ada di Soal Stack
    M(SD, 3),
    M(SD, 4, drop=[r'two sum']),                                       # ada di Soal Array
    M(SD, 5, drop=[r'validate bst']),                                  # ada di Soal Binary Tree
    M(SD, 6),
    M(SD, 7, title='Perbandingan Algoritma Sorting', drop=[r'^bubble', r'^merge sort', r'^quick sort'],
      summary='Tabel perbandingan kompleksitas, stabilitas, dan kapan memakai tiap algoritma sorting.'),
    M(SD, 9),
])
java_mods += tracked('Soal Struktur Data', [
    M(AJ, 0, title='Soal Array', qa='soal', prefix='ARR'),
    M(AJ, 1, title='Soal Linked List', qa='soal', prefix='LL'),
    M(AJ, 2, title='Soal Stack', qa='soal', prefix='STK'),
    M(AJ, 3, title='Soal Binary Tree', qa='soal', prefix='BT'),
    M(AJ, 4, title='Soal HashMap', qa='soal', prefix='HM', qa_drop=(3,)),          # Two Sum sudah ada di Array
])
java_mods += tracked('Soal Algoritma', [
    M(AJ, 5, title='Soal Sorting', qa='soal', prefix='SRT', qa_drop=(4,)),          # Merge Sort sudah di modul Divide & Conquer
    M(AJ, 6, title='Soal Searching', qa='soal', prefix='SRC', qa_drop=(1, 2)),        # Linear & Binary Search sudah di modul strategi
    M(AJ, 7, title='Soal String', qa='soal', prefix='STR', qa_drop=(6, 7, 11)),    # Anagram, Group Anagrams, Valid Parentheses duplikat
    M(AJ, 8, title='Soal Pola Bintang', qa='soal', prefix='PB'),
    M(AJ, 9, title='Soal Rekursi & Backtracking', qa='soal', prefix='REK', qa_drop=(1, 2, 4, 5)),
    MERGE(AJ, [10, 11, 12, 13, 14, 15], 'DP Klasik: Kadane sampai String DP', as_qa='DPK',
          summary='Enam pola dynamic programming yang sering keluar di coding test: Kadane, House Robber, Coin Change, Knapsack, LIS, dan String DP.'),
])
_existing = {}
for _m in java_mods:
    for _b in _m['blocks']:
        if _b['type'] == 'qa':
            for _it in _b['items']:
                _existing.setdefault(_qkey(_it['q']), (_m['title'], slug(_m['title'])))
java_mods += CODING_INTERVIEW(_existing)
java_mods += GREEDY()
java_mods += tracked('Design Patterns', [
    M(DPJ, 0), M(DPJ, 1), M(DPJ, 2), M(DPJ, 3), M(DPJ, 4),
    MERGE(AJ, list(range(16, 24)), 'Latihan Design Patterns',
          summary='Delapan latihan implementasi pattern (Singleton sampai Command) dengan kerangka kode yang tinggal kamu lengkapi.'),
    M(DPJ, 5),
])
java_mods += tracked('Spring Boot: Inti', [
    {**(_sd := M(MJ, 11)), 'blocks': _sd['blocks'] + (appendix(SDI, 0, 'Ringkasan Visual: Dependency Injection dalam Praktik') if has_doc(SDI) else []),
     'source': _sd['source'] + (' · ' + SOURCE_LABEL[SDI] if has_doc(SDI) else '')},                                                          # Spring Dasar (IoC, bean, DI, lifecycle…)
    M(SB, 2),                                                           # Auto-Configuration
    M(MJ, 5, title='Anotasi Inti & Struktur Layer', drop=[r'^4\.1', r'^4\.4', r'^4\.5'],
      summary='Anotasi Spring Boot yang wajib hafal dan struktur layer standar industri (controller, service, repository).'),
    M(MJ, 12), M(MJ, 13), M(MJ, 14), M(MJ, 15), M(MJ, 16),
    M(SB, 9),                                                           # Global Exception Handling
])
java_mods += tracked('Spring Boot: Data & Persistence', [
    M(MJ, 17),                                                          # Spring Data JPA
    M(SB, 8),                                                           # Flyway
    M(MJ, 20),                                                          # Spring Data Redis
])
java_mods += tracked('Spring Boot: Lanjutan & Produksi', [
    M(MJ, 7, title='Integrasi: REST Eksternal, Jackson & File',
      drop=[r'^6\.4', r'^6\.5', r'^6\.6', r'^6\.7', r'^6\.8', r'^6\.9'],
      summary='Memanggil API eksternal, manipulasi JSON dengan Jackson, serta upload dan download file.'),
    M(SB, 11),                                                          # Security & JWT
    M(MJ, 18), M(MJ, 19),                                               # Async, Monitoring
    M(SB, 12),                                                          # Testing
    M(SB, 17),                                                          # Tips & Best Practices
])
java_mods += tracked('Proyek & Studi Kasus', [
    M(MJ, 21, title='Proyek: Spring RESTful API (Contact Management)'),
    M(MJ, 8, title='Studi Kasus Industri: OTA & Banking'),
])
java_mods += tracked('Karier & Sertifikasi', [M(MJ, 9, title='Jalur Sertifikasi Oracle'), M(MJ, 10, title='Checklist & Sumber Belajar')])
CURRICULA.append({
    'id': 'java', 'title': 'Java & Spring Boot', 'short': 'Java & Spring', 'monogram': 'Java', 'hue': 'amber',
    'description': 'Dari Java fundamentals, struktur data, algoritma, dan design patterns sampai Spring Boot produksi, proyek, dan sertifikasi.',
    'tracks': [
        {'title': 'Java Fundamentals', 'summary': 'Setup, OOP, collections, generics, functional, concurrency, JDBC.'},
        {'title': 'Java Functional & Lambda', 'summary': 'Functional interface dan 49 snippet lambda & Stream API siap pakai.'},
        {'title': 'Struktur Data', 'summary': 'Teori array sampai graph, perbandingan sorting, cheat sheet interview.'},
        {'title': 'Strategi Algoritma', 'summary': 'Konsep: rekursi, brute force, DP, greedy, divide & conquer.'},
        {'title': 'Soal Struktur Data', 'summary': 'Array, linked list, stack, binary tree, hashmap.'},
        {'title': 'Soal Algoritma', 'summary': 'Sorting, searching, string, pola bintang, rekursi, DP klasik.'},
        {'title': 'Coding Interview (Program Creek)', 'summary': '120 soal coding interview dengan solusi Java: array, string, matriks, linked list, stack & queue.'},
        {'title': 'Greedy: Konsep, Graf & MST', 'summary': 'Kebenaran greedy, MST (Kruskal, Prim, Boruvka), Dijkstra, graph coloring, max flow.'},
        {'title': 'Greedy: Penjadwalan & Interval', 'summary': 'Activity selection, job sequencing, peron kereta, penjadwalan tugas.'},
        {'title': 'Greedy: Koin, Knapsack & Huffman', 'summary': 'Coin change, fractional knapsack, Huffman coding, Egyptian fraction.'},
        {'title': 'Greedy: Array, Angka & Optimasi', 'summary': 'Puluhan soal greedy pada array, digit, dan optimasi jumlah/biaya.'},
        {'title': 'Greedy: String', 'summary': 'Penyusunan ulang string, leksikografis, palindrom, kurung.'},
        {'title': 'Greedy: Sistem Operasi', 'summary': 'First/Best/Worst/Next Fit, page replacement, SJF, bin packing.'},
        {'title': 'Design Patterns', 'summary': 'Creational, structural, behavioral + latihan.'},
        {'title': 'Spring Boot: Inti', 'summary': 'IoC & bean, auto-config, config, logging, validation, AOP, Web MVC.'},
        {'title': 'Spring Boot: Data & Persistence', 'summary': 'Spring Data JPA, Flyway, Redis.'},
        {'title': 'Spring Boot: Lanjutan & Produksi', 'summary': 'Integrasi, security & JWT, async, monitoring, testing.'},
        {'title': 'Proyek & Studi Kasus', 'summary': 'RESTful API lengkap, studi kasus OTA & banking.'},
        {'title': 'Karier & Sertifikasi', 'summary': 'Sertifikasi Oracle, checklist kompetensi.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun tanpa pengulangan',
         'text': 'Materi Spring Boot digabung dari tiga sumber. Untuk tiap topik dipilih satu versi yang paling lengkap: seri *Spring Dasar sampai Data Redis* untuk konsep inti, *Spring Boot: Panduan Lengkap* untuk auto-configuration, Flyway, exception handling, security, dan testing. Soal yang sudah ada di track soal tidak diulang di track Struktur Data.'},
        {'type': 'callout', 'tone': 'tip', 'title': 'Cara memakai soal latihan',
         'text': 'Modul soal memakai mode latihan: baca soalnya, coba tulis solusi sendiri, lalu buka jawaban dan tandai **Paham** atau **Ulangi**.'},
        {'type': 'callout', 'tone': 'tip', 'title': 'Coding Interview (Program Creek)',
         'text': '120 soal dari *Coding Interview in Java* dikelompokkan per tema dan memakai mode latihan. Soal yang juga ada di track **Soal Struktur Data/Soal Algoritma** diberi tautan ke sana, supaya kamu bisa membandingkan dua pendekatan tanpa materi yang sama ditulis dua kali.'},
        {'type': 'callout', 'tone': 'tip', 'title': 'Greedy Algorithms',
         'text': 'Buku *Greedy Algorithms* (GeeksforGeeks, 145 artikel) dibagi menjadi enam track bertema. Bila satu soal punya kode beberapa bahasa, pilih tab bahasanya; **Java** selalu di tab pertama.'},
        {'type': 'callout', 'tone': 'info', 'title': 'Arsitektur & distributed system',
         'text': 'Materi *Arsitektur & Performa Sistem* dan *Distributed System dengan Spring Boot* sekarang ada di kurikulum **Distributed System**, bersama roadmap system design 12 bulan.'},
    ],
    'modules': java_mods,
    'sources': ['Java Algorithm Mastery (HTML)', SOURCE_LABEL[MJ], SOURCE_LABEL[SB], SOURCE_LABEL[SD], SOURCE_LABEL[AJ],
                SOURCE_LABEL[DPJ], SOURCE_LABEL[GRD], SOURCE_LABEL[LAM], SOURCE_LABEL[JFI], SOURCE_LABEL[DSN], SOURCE_LABEL[SDI],
                SOURCE_LABEL[CIJ], SOURCE_LABEL[D60], SOURCE_LABEL[JEC]],
})

# ─── Go ───
PM = 'Belajar_GoLang_Pemula_ke_Mahir'
MC = 'Golang_Masterclass_Lengkap'
GQ = '05_GraphQL'
GB = 'Backend_Go_PencatatKeuangan_API'
go_mods = []
go_mods += tracked('Dasar Bahasa Go', [M(PM, i) for i in (1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14)])
go_mods += tracked('Concurrency', [
    M(PM, 10), M(PM, 16),
    M(MC, 8), M(MC, 11), M(MC, 12),
])
go_mods += tracked('Idiom & Arsitektur', [M(MC, i) for i in (13, 14, 15, 16, 17, 18, 19)] + [M(PM, 29)])
go_mods += tracked('Web API & Database', [M(PM, i) for i in (15, 17, 18, 19, 20, 21)])
go_mods += tracked('Testing, Performa & Produksi', [
    M(PM, 12), M(MC, 24), M(MC, 25),
    M(PM, 25), M(PM, 26), M(PM, 27), M(PM, 28),
    M(MC, 26, title='Checklist Kesiapan Produksi', drop=[r'graceful shutdown', r'dockerize']),
    M(PM, 31),
])
go_mods += tracked('gRPC & GraphQL', [M(PM, 22)] + [M(MC, i) for i in range(27, 34)] + [M(GQ, i) for i in range(0, 7)])
go_mods += tracked('Message Queue & Sistem Terdistribusi', [M(MC, i) for i in range(34, 41)])
go_mods += tracked('Proyek: API Pencatat Keuangan', [M(GB, i, extra=[FT_NOTE] if i == 1 else None) for i in range(1, 18)])
go_mods += tracked('Proyek: E-Commerce REST API', [M(PM, 30)])
go_mods += tracked('Karier & Evolusi Go', [M(PM, 32), M(MC, 41)])
# Judul unik untuk bab GraphQL (supaya jelas di daftar)
for m in go_mods:
    if m['source'] == SOURCE_LABEL[GQ] and not m['title'].lower().startswith('graphql'):
        m['title'] = 'GraphQL: ' + m['title']
CURRICULA.append({
    'id': 'go', 'title': 'Go (Golang)', 'short': 'Go', 'monogram': 'Go', 'hue': 'teal',
    'description': 'Dari dasar bahasa sampai concurrency, REST/gRPC/GraphQL, message queue, produksi, dan dua proyek nyata: API Pencatat Keuangan dan E-Commerce.',
    'tracks': [
        {'title': 'Dasar Bahasa Go', 'summary': 'Sintaks, tipe, fungsi, struct, interface, error, module, I/O, JSON.'},
        {'title': 'Concurrency', 'summary': 'Goroutine, channel, context, sync, errgroup, jebakan umum.'},
        {'title': 'Idiom & Arsitektur', 'summary': 'Error idiomatik, generics, functional options, clean architecture.'},
        {'title': 'Web API & Database', 'summary': 'net/http, Gin, JWT, validasi, database/sql, GORM.'},
        {'title': 'Testing, Performa & Produksi', 'summary': 'Testing, pprof, memori, Docker, CI/CD, observability, deployment.'},
        {'title': 'gRPC & GraphQL', 'summary': 'Microservices, Protocol Buffers, gRPC, gqlgen & DataLoader.'},
        {'title': 'Message Queue & Sistem Terdistribusi', 'summary': 'RabbitMQ, Kafka, saga, outbox, idempotency.'},
        {'title': 'Proyek: API Pencatat Keuangan', 'summary': 'Bangun REST API berlapis dari nol sampai siap produksi.'},
        {'title': 'Proyek: E-Commerce REST API', 'summary': 'Checkout dengan transaksi database dan pagination.'},
        {'title': 'Karier & Evolusi Go', 'summary': 'Roadmap belajar, karier Go di Indonesia, fitur Go terbaru.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun dari tiga buku',
         'text': 'Kurikulum ini menggabungkan *Belajar Golang: Pemula ke Mahir*, *Go Masterclass*, dan *Backend Go: API Pencatat Keuangan*. Bab yang membahas topik sama hanya diambil sekali, dari versi yang paling lengkap.'},
    ],
    'modules': go_mods,
    'sources': [SOURCE_LABEL[PM], SOURCE_LABEL[MC], SOURCE_LABEL[GQ], SOURCE_LABEL[GB]],
})

# ─── JavaScript & TypeScript ───
RT = 'Belajar-React-TypeScript-Lengkap'
TS = '01_TypeScript_Penuh'
NG = 'Angular-Pemula-sampai-Mahir'
EX1 = 'Express_FinancialTracker_1_Fondasi'
EX2 = 'Express_FinancialTracker_2_Produksi'
RK = 'React_Panduan_Konsolidasi'
RM = 'React_Masterclass_Hooks_State_Performa'
RP1 = 'Proyek_React_PencatatKeuangan'
RP2 = 'Proyek_React_PencatatKeuangan_v2_SemuaHooks'
RN = 'ReactNative_PencatatKeuangan_Mobile'
NS1 = 'Nest_FinancialTracker_1_Fondasi'
NS2 = 'Nest_FinancialTracker_2_Produksi'
js_mods = []
js_mods += tracked('React: Fondasi', [
    M(RT, 0, title='Peta Jalan React + TypeScript', drop=[r'^urutan modul']),
    M(RK, 1, title='Pengenalan React & Cara Kerjanya'),
    M(RK, 2, title='Prasyarat JavaScript Modern (ES6+)'),
    M(RT, 1), M(RT, 2),
])
js_mods += tracked('React: Hooks, State & Performa', [
    M(RT, 3),
    MERGE(RM, [6, 9, 10, 12, 13, 15], 'Hooks Lanjutan & React 19',
          summary='Hook yang jarang dibahas di kursus dasar: useInsertionEffect, useTransition, useDeferredValue, useDebugValue, useSyncExternalStore, dan hook baru React 19.'),
    M(RT, 4),
    M(RM, 21, title='Atomic State dengan Jotai'),
    M(RT, 5, drop=[r'performance optimization']),
    MERGE(RM, [24, 25, 26, 29], 'Re-render & Memoization',
          summary='Kapan komponen re-render, cara kerja React.memo, useMemo, useCallback, dan pola mencegah render yang tidak perlu.'),
    {**(_cs := MERGE(RM, [27, 28], 'Code Splitting & Virtualization',
                     summary='Memecah bundle dengan lazy + Suspense dan merender daftar panjang secara efisien.')),
     'blocks': _cs['blocks'] + (appendix(LZY, 0, 'Ringkasan Visual: Lazy Loading in React') if has_doc(LZY) else []),
     'source': _cs['source'] + (' · ' + SOURCE_LABEL[LZY] if has_doc(LZY) else '')},
    MERGE(RM, [30, 31, 32], 'Responsivitas, React Compiler & Profiling',
          summary='useTransition untuk UI responsif, React Compiler, dan cara mengukur performa dengan Profiler.'),
])
js_mods += tracked('React: Ekosistem & Produksi', [
    M(RT, 6),
    M(RK, 9, title='Routing dengan React Router'),
    M(RT, 7), M(RT, 8),
    M(RK, 14, title='Struktur Proyek & Pola Lanjutan'),
    M(RK, 15, title='Deployment Aplikasi React'),
    M(RK, 17, title='Cheat Sheet: Best vs Bad Practice'),
])
js_mods += tracked('Proyek React', [
    M(RT, 9),
    MERGE(RP1, [0, 1, 2], 'Pencatat Keuangan v1: Persiapan & Daftar Transaksi'),
    MERGE(RP1, [3, 4, 5], 'Pencatat Keuangan v1: State, Form & Ringkasan'),
    MERGE(RP1, [6, 7, 8], 'Pencatat Keuangan v1: Hapus, Filter & localStorage'),
    MERGE(RP1, [9, 10, 11, 12], 'Pencatat Keuangan v1: Styling, Deploy & Tantangan'),
    MERGE(RP2, [0, 1, 2], 'Pencatat Keuangan v2: useReducer & useContext'),
    MERGE(RP2, [3, 4, 5, 6, 7], 'Pencatat Keuangan v2: useMemo sampai useId'),
    MERGE(RP2, [8, 9, 10, 11], 'Pencatat Keuangan v2: Transition, LayoutEffect & External Store'),
    MERGE(RP2, [12, 13], 'Pencatat Keuangan v2: Hooks React 19 & Rekap'),
])
if has_doc(RJS):
    _RN = [([1], 'Getting Started with React'), ([2], 'Components'), ([21], 'JSX'), ([4], 'State in React'),
           ([5], 'Props in React'), ([6], 'Component Lifecycle'), ([16], 'Stateless Functional Components'),
           ([13], 'React.createClass vs extends React.Component'), ([7, 22], 'Forms & User Input'),
           ([11, 15], 'Communication Between Components'), ([26, 27], 'Keys in React'), ([28], 'Higher Order Components'),
           ([10], 'React Routing'), ([14], 'AJAX Call'), ([17], 'Performance'), ([18], 'Server-Side Rendering'),
           ([24, 29], 'Flux & Redux'), ([23], 'User Interface Solutions'), ([9], 'Using React with jQuery'),
           ([3, 25, 20], 'React dengan TypeScript & Flow'), ([8, 12, 19, 30, 31], 'Setup & Tooling: Babel, Webpack, Boilerplate')]
    js_mods += tracked('React: Notes for Professionals', [MERGE_T(RJS, ix, f'React Notes: {t}') for ix, t in _RN])
js_mods += tracked('React Native', [M(RN, i) for i in range(0, 14)] + [M(RN, 14, title='Konsep React Native Mendalam')])
js_mods += tracked('TypeScript Lanjutan', [M(TS, i) for i in range(0, 9)])
js_mods += tracked('Angular', [
    M(NG, 0, title='Peta Belajar Angular', drop=[r'legenda']),
    M(NG, 1),
    M(NG, 2, drop=[r'^2\.1\b', r'^2\.3\b'], extra=[{'type': 'callout', 'tone': 'info', 'title': 'Tidak diulang',
       'text': 'Tipe dasar, interface, generic, dan utility type sudah dibahas di track **React: Fondasi** dan **TypeScript Lanjutan**. Bab ini hanya memuat bagian yang khas Angular.'}]),
] + [M(NG, i) for i in range(3, 24)])
js_mods += tracked('Node.js: Express', [
    M(EX1, i, extra=[FT_NOTE] if i == 0 else None) for i in range(0, 8)
] + [M(EX2, i) for i in range(0, 9)])
js_mods += tracked('Node.js: NestJS', [M(NS1, i) for i in range(1, 7)] + [M(NS2, i) for i in range(0, 10)])
js_mods += tracked('Roadmap Senior Web (12 Bulan)', [
    PHASE('01-Web-Fase1-Modern-Rendering-Edge', 'WEB1', ),
    PHASE('01-Web-Fase2-API-Design-Type-Safety', 'WEB2'),
    PHASE('01-Web-Fase3-Performance-Engineering', 'WEB3'),
    PHASE('01-Web-Fase4-Web-Security', 'WEB4'),
])
for _i, _m in enumerate(js_mods[-4:]):
    _m['duration'] = _m.get('duration') or f'Bulan {_i * 3 + 1}-{_i * 3 + 3}'
CURRICULA.append({
    'id': 'js', 'title': 'JavaScript & TypeScript', 'short': 'JS & TS', 'monogram': 'TS', 'hue': 'blue',
    'description': 'React dari fondasi sampai performa dan proyek nyata, React Native, TypeScript lanjutan, Angular modern, serta backend Node.js dengan Express dan NestJS.',
    'tracks': [
        {'title': 'React: Fondasi', 'summary': 'Cara kerja React, JS modern, setup Vite + TS, komponen & props.'},
        {'title': 'React: Hooks, State & Performa', 'summary': 'Semua hooks, state management, pola lanjutan, optimasi.'},
        {'title': 'React: Ekosistem & Produksi', 'summary': 'Tailwind, React Router, Next.js, testing, struktur, deploy.'},
        {'title': 'Proyek React', 'summary': 'Proyek bertingkat + Pencatat Keuangan v1 dan v2 (semua hooks).'},
        {'title': 'React: Notes for Professionals', 'summary': 'Referensi berbahasa Inggris dari Stack Overflow Docs: contoh kode komponen, state, props, lifecycle, HOC, Redux, tooling.'},
        {'title': 'React Native', 'summary': 'Aplikasi mobile Pencatat Keuangan dengan Expo, terhubung ke API Go.'},
        {'title': 'TypeScript Lanjutan', 'summary': 'Generics, utility types, discriminated union, Zod.'},
        {'title': 'Angular', 'summary': 'Komponen, DI, routing, form, signals, RxJS, NgRx, SSR.'},
        {'title': 'Node.js: Express', 'summary': 'API Financial Tracker: fondasi sampai produksi.'},
        {'title': 'Node.js: NestJS', 'summary': 'API yang sama dengan arsitektur modul, DI, guard, TypeORM.'},
        {'title': 'Roadmap Senior Web (12 Bulan)', 'summary': 'Rendering & edge, API type-safe, performance engineering, web security.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun tanpa pengulangan',
         'text': 'Materi React berasal dari empat dokumen. Jalur utamanya kursus *React + TypeScript*; dari *Masterclass* dan *Konsolidasi* hanya diambil topik yang belum dibahas (hooks lanjutan & React 19, Jotai, performa mendalam, React Router, struktur proyek, cheat sheet).'},
    ],
    'modules': js_mods,
    'sources': [SOURCE_LABEL[x] for x in (RT, RK, RM, RP1, RP2, RN, TS, NG, EX1, EX2, NS1, NS2)] + ['Roadmap Web Fase 1–4 (versi komprehensif & ringkas)', SOURCE_LABEL[LZY], SOURCE_LABEL[RJS]],
})

# ─── Python ───
FA1, FA2 = 'FastAPI_FinancialTracker_1_Fondasi', 'FastAPI_FinancialTracker_2_Produksi'
DJ1, DJ2 = 'Django_FinancialTracker_1_Fondasi', 'Django_FinancialTracker_2_Produksi'
py_mods = []
py_mods += tracked('Kontrak API', [M(FA1, 0, title='Kontrak API Financial Tracker', extra=[FT_NOTE],
                                  summary='Endpoint dan bentuk data yang sama untuk versi FastAPI dan Django.')])
py_mods += tracked('FastAPI', [M(FA1, i) for i in range(1, 7)] + [M(FA2, i) for i in range(0, 8)])
py_mods += tracked('Django', [M(DJ1, i) for i in range(1, 7)] + [M(DJ2, i) for i in range(0, 9)])
CURRICULA.append({
    'id': 'python', 'title': 'Python: FastAPI & Django', 'short': 'Python', 'monogram': 'Py', 'hue': 'violet',
    'description': 'Bangun API Financial Tracker yang sama dengan dua framework Python, dari fondasi sampai produksi, lalu bandingkan kapan memilih FastAPI atau Django.',
    'tracks': [
        {'title': 'Kontrak API', 'summary': 'Spesifikasi endpoint bersama.'},
        {'title': 'FastAPI', 'summary': 'Pydantic, async SQLAlchemy, DI, JWT, pytest, Docker.'},
        {'title': 'Django', 'summary': 'ORM, admin, DRF, JWT, keamanan, Celery, Gunicorn.'},
    ],
    'modules': py_mods,
    'sources': [SOURCE_LABEL[FA1], SOURCE_LABEL[FA2], SOURCE_LABEL[DJ1], SOURCE_LABEL[DJ2]],
})

# ─── Mobile: Flutter & Cross-Platform ───
FL = 'Flutter-Panduan-Lengkap'
fl_mods = []
fl_mods += tracked('Fondasi', [M(FL, 0, title='Peta Belajar Flutter', drop=[r'legenda']), M(FL, 1), M(FL, 2), M(FL, 3)])
fl_mods += tracked('Membangun Aplikasi', [M(FL, i) for i in (4, 5, 6, 7, 8)])
fl_mods += tracked('Menuju Produksi', [M(FL, i) for i in (9, 10, 11, 12, 13, 14)])
fl_mods += tracked('Roadmap Senior Mobile (12 Bulan)', [
    PHASE('02-Mobile-Fase1-Cross-Platform', 'MOB1'),
    PHASE('02-Mobile-Fase2-On-Device-AI', 'MOB2'),
    PHASE('02-Mobile-Fase3-Performance-Profiling', 'MOB3'),
    PHASE('02-Mobile-Fase4-Arsitektur-Delivery', 'MOB4'),
])
for _i, _m in enumerate(fl_mods[-4:]):
    _m['duration'] = _m.get('duration') or f'Bulan {_i * 3 + 1}-{_i * 3 + 3}'
CURRICULA.append({
    'id': 'flutter', 'title': 'Mobile: Flutter & Cross-Platform', 'short': 'Mobile', 'monogram': 'App', 'hue': 'sky',
    'description': 'Flutter & Dart dari widget sampai rilis, lalu roadmap senior mobile: Kotlin/Compose Multiplatform, on-device AI, profiling performa, dan arsitektur & delivery skala besar.',
    'tracks': [
        {'title': 'Fondasi', 'summary': 'Setup, Dart, widget & rendering.'},
        {'title': 'Membangun Aplikasi', 'summary': 'UI nyata, state, REST API, penyimpanan lokal, animasi.'},
        {'title': 'Menuju Produksi', 'summary': 'Performa, testing, rilis, best practice.'},
        {'title': 'Roadmap Senior Mobile (12 Bulan)', 'summary': 'Cross-platform, on-device AI, profiling, multi-module & CI/CD.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'React Native',
         'text': 'Aplikasi mobile dengan React Native ada di kurikulum **JavaScript & TypeScript** (track React Native), karena bahasanya JavaScript.'},
    ],
    'modules': fl_mods,
    'sources': [SOURCE_LABEL[FL], 'Roadmap Mobile Fase 1–4 (versi komprehensif & ringkas)'],
})

# ─── Cloud & DevOps (AWS dari HTML digabung di index.ts) ───
DK = 'Docker-Kubernetes-Pemula-sampai-Mahir'
ops_mods = []
ops_mods += tracked('Docker', [M(DK, i) for i in range(0, 9)])
ops_mods += tracked('Kubernetes', [M(DK, i) for i in range(9, 20)])
ops_mods[0]['title'] = 'Pendahuluan Docker & Kubernetes'
if has_doc(DV2):
    # versi V2 (production-ready): hanya bagian yang belum ada di versi lama yang ditambahkan ke modul yang sama
    for _v2, _dk in [(1, 0), (2, 1), (3, 2), (4, 3), (5, 4), (6, 7), (7, 8), (8, 9), (9, 11), (10, 13), (11, 14), (12, 18), (13, 19)]:
        add_fresh(ops_mods[_dk], DV2, _v2, [DK], 'Pembaruan V2: Production-Ready')
PE = 'Panduan_Backend_Platform_Engineering'
ops_mods += tracked('Platform Engineering & SRE', [M(PE, 0, title='Pendahuluan Platform Engineering', drop=[r'cara membaca'])]
                    + [M(PE, i) for i in range(1, 19)] + [M(PE, 19, title='Peta Jalan & Glosarium Platform')])
CURRICULA.append({
    'id': 'devops', 'title': 'Cloud & DevOps', 'short': 'Cloud & DevOps', 'monogram': 'Ops', 'hue': 'orange',
    'description': 'Roadmap AWS untuk Java developer, Docker dan Kubernetes dari dasar, lalu platform engineering & SRE: observability, GitOps, resiliensi, DevSecOps, dan manajemen insiden.',
    'tracks': [
        {'title': 'AWS untuk Java Developer', 'summary': 'Fondasi AWS, core services, DevOps, deploy Spring Boot gratis.'},
        {'title': 'Docker', 'summary': 'Image, container, volume, network, Compose, best practice.'},
        {'title': 'Kubernetes', 'summary': 'Pod, Deployment, Service, ConfigMap, PVC, Ingress, HPA, Helm.'},
        {'title': 'Platform Engineering & SRE', 'summary': 'Observability, IaC & GitOps, SRE, resiliensi, DevSecOps, rilis, insiden.'},
    ],
    'modules': ops_mods,
    'sources': ['AWS Roadmap for Java Developer (HTML)', SOURCE_LABEL[DK], SOURCE_LABEL[DV2], SOURCE_LABEL[PE]],
})

# ─── Interview Prep: tambahan 50 soal (digabung di index.ts) ───
SO = '50_Soal_Advanced_React_SpringBoot'
spring_extract = {28: None, 29: None, 31: None, 50: None}
iv_mods = []
iv_mods += tracked('React & Spring Boot Advanced', [
    M(SO, 0, title='React Advanced', qa='qmark', prefix='R',
      summary='25 soal React level advanced: closure, Fiber, concurrent rendering, memoization, pola komponen, data fetching.'),
    M(SO, 1, title='Spring Boot Advanced', qa='qmark', prefix='SB', qa_drop=(27,), extract=spring_extract,
      summary='Soal Spring Boot level advanced: lifecycle, transaksi, caching, locking, resilience, batch, WebSocket, testing.'),
])
if has_doc(KAF):
    iv_mods += tracked('Apache Kafka (Java)', [
        QA_CHAPTERS(KAF, [0, 1], 'Kafka: Arsitektur, Topic, Partition & Offset', 'KF',
                    summary='Apa itu Kafka, komponen inti, beda dengan message queue biasa, topic & partisi, offset, dan memilih jumlah partisi.'),
        QA_CHAPTERS(KAF, [2, 3], 'Kafka: Producer, Consumer & Consumer Group', 'KF',
                    summary='Cara kerja producer, setting acks, idempotent producer & exactly-once, consumer group, rebalancing, auto.offset.reset, commitSync vs commitAsync.'),
        QA_CHAPTERS(KAF, [4, 5], 'Kafka: Replikasi, Keandalan & Tuning', 'KF',
                    summary='Replikasi & ISR, min.insync.replicas, saat broker mati, konfigurasi producer/consumer untuk throughput tinggi, dan rahasia kecepatan Kafka.'),
        QA_CHAPTERS(KAF, [6, 7], 'Kafka Streams & Kafka Connect', 'KF',
                    summary='Kafka Streams vs consumer biasa, KStream vs KTable, state store, serta source/sink connector di Kafka Connect.'),
        QA_CHAPTERS(KAF, [8, 9], 'Kafka Lanjutan: Konsep, Security & Monitoring', 'KF',
                    summary='Log compaction, KRaft vs ZooKeeper, delivery semantics, schema evolution, mekanisme keamanan, dan metrik yang wajib dimonitor.'),
        QA_CHAPTERS(KAF, [10, 11], 'Kafka: Pola, Best Practice & Soal Skenario', 'KF',
                    summary='Pola desain Kafka, kesalahan umum, dead letter queue, lalu soal skenario: sistem order, urutan pesan lintas partisi, zero data loss.'),
        M(KAF, 12, title='Cheat Sheet Kafka: Konfigurasi, CLI & Delivery Guarantee'),
    ])
# Bahasa kode: bagian Spring Boot berisi Java, bagian React berisi TS/JS.
def relang(blocks, frm, to):
    for b in blocks:
        if b['type'] == 'code' and b['lang'] in frm:
            b['lang'] = to
        if b['type'] == 'qa':
            for q in b['items']:
                relang(q.get('prompt', []), frm, to)
                relang(q['a'], frm, to)
relang(iv_mods[0]['blocks'], ('java',), 'ts')
relang(iv_mods[1]['blocks'], ('ts', 'js', 'dart'), 'java')
for v in spring_extract.values():
    relang(v or [], ('ts', 'js', 'dart'), 'java')

CURRICULA.append({
    'id': 'interview-extra', 'modules': iv_mods,
    # Jawaban advanced untuk soal yang sudah ada di modul Spring Boot dasar → ditambahkan sebagai pendalaman.
    'merge': {'S-07': spring_extract[28], 'S-08': spring_extract[29], 'S-09': spring_extract[31], 'S-10': spring_extract[50]},
    'sources': [SOURCE_LABEL[SO]] + ([SOURCE_LABEL[KAF]] if has_doc(KAF) else []),
})

# ─── Database & SQL ───
DB = 'Panduan_Belajar_Database_SQL_NoSQL'
SQ = 'SQL-Pemula-sampai-Mahir'
sql_mods = []
sql_mods += tracked('Konsep Database', [
    M(DB, 0),
    M(DB, 1, title='Database Relasional Populer', drop=[r'^2\.1', r'^2\.2', r'^2\.3'],
      summary='Mengenal PostgreSQL, MySQL, dan database relasional populer lain beserta kekuatannya.'),
])
sql_mods += tracked('SQL: Pemula sampai Mahir', [M(SQ, 0, title='Peta Belajar SQL', drop=[r'legenda'])] + [M(SQ, i) for i in range(1, 29)])
if has_doc(SQN):
    sql_mods += tracked('SQL Notes (Referensi Cepat)', [M(SQN, i, title=f'SQL Notes: {t}') for i, t in enumerate([
        'Jenis Perintah SQL (DDL, DML, DCL, TCL, DQL)', 'CREATE, DROP, INSERT, SELECT & WHERE', 'UPDATE, DELETE, LIKE & Wildcard',
        'TOP/LIMIT, ORDER BY, GROUP BY, DISTINCT & Alias', 'UNION, INTERSECT, EXCEPT & JOIN', 'Constraints, NULL, ALTER & TRUNCATE',
        'Views', 'Query Agregat, IN, BETWEEN & Fungsi'])])
sql_mods += tracked('NoSQL & Database Modern', [
    M(DB, 4), M(DB, 5), M(DB, 6),
    M(DB, 7, title='Studi Kasus & Latihan NoSQL', drop=[r'^8\.1', r'^8\.2']),
    M(DB, 8),
])
CURRICULA.append({
    'id': 'sql', 'title': 'Database & SQL', 'short': 'Database & SQL', 'monogram': 'SQL', 'hue': 'indigo',
    'description': 'SQL dari SELECT pertama sampai window function, index, transaksi, dan studi kasus, ditambah NoSQL, teorema CAP, dan database modern.',
    'tracks': [
        {'title': 'Konsep Database', 'summary': 'Apa itu database dan pilihan database relasional.'},
        {'title': 'SQL: Pemula sampai Mahir', 'summary': 'DDL, DML, JOIN, subquery, CTE, window, index, transaksi, studi kasus.'},
        {'title': 'SQL Notes (Referensi Cepat)', 'summary': 'Catatan ringkas berbahasa Inggris: sintaks + contoh tabel hasil untuk tiap perintah.'},
        {'title': 'NoSQL & Database Modern', 'summary': 'Empat tipe NoSQL, CAP, SQL vs NoSQL, NewSQL, roadmap.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun tanpa pengulangan',
         'text': 'Konsep relasional, ACID, normalisasi, kategori perintah, JOIN, CTE, window function, dan studi kasus toko online diambil dari *SQL: Pemula sampai Mahir* yang lebih mendalam. Dari *Panduan Database* diambil bagian NoSQL, perbandingan, NewSQL, dan roadmap.'},
    ],
    'modules': sql_mods,
    'sources': [SOURCE_LABEL[SQ], SOURCE_LABEL[DB], SOURCE_LABEL[SQN]],
})

# ─── Software Testing ───
ST = 'Software_Testing_Lengkap'
st_mods = []
st_mods += tracked('Fondasi Testing', [M(ST, i) for i in range(0, 7)] + ([M(FTS, 0, summary='Beda Functional Specification Document dan Technical Specification Document, dengan analogi membuat mobil.')] if has_doc(FTS) else []))
st_mods += tracked('Testing dalam Praktik', [M(ST, 7), M(ST, 8)])          # Bab 9 SQL → kurikulum Database & SQL
st_mods += tracked('Automation Testing', [M(ST, i) for i in range(10, 17)])
if has_doc(API9):
    _ci = MERGE(API9, [0, 1, 2], 'CI/CD untuk API Testing: Konsep & Tools',
                summary='Apa itu CI dan CD, manfaatnya untuk API testing, serta kelebihan & kekurangan Jenkins, GitLab CI/CD, AWS CodePipeline, Travis CI, CircleCI, Bamboo, dan GitHub Actions.')
    _ci['blocks'] = copy.deepcopy(doc(API9)['preface']) + _ci['blocks']
    st_mods += tracked('API Testing & TDD', [
        M(TDD, 0, title='TDD untuk Vibe Coding: Red, Green, Refactor',
          summary='Kenapa langsung deploy tanpa test berbahaya, definisi TDD, dan siklus red–green–refactor saat ngoding bersama AI.'),
        M(API6, 0, title='Automating API Tests: TestNG, Rest Assured & Cucumber'),
        M(API6, 1, title='Soal Interview: Automation API Testing', qa='qmark', prefix='API6'),
        _ci,
        M(API9, 3, title='Pipeline CI: Maven, BDD & GitHub Actions'),
        M(API9, 4, title='Soal Interview: CI/CD & API Testing', qa='qmark', prefix='API9'),
    ])
st_mods += tracked('Lanjutan & Snippet', [
    M(ST, 17, drop=[r'chaos', r'shift-left', r'k6']),                         # dibahas di Platform Engineering
    M(ST, 18),
])
CURRICULA.append({
    'id': 'testing', 'title': 'Software Testing & QA', 'short': 'Testing & QA', 'monogram': 'QA', 'hue': 'slate',
    'description': 'Fondasi QA, teknik desain test case, API testing, automation (unit, UI, API, BDD), CI/CD, sampai mutation dan contract testing.',
    'tracks': [
        {'title': 'Fondasi Testing', 'summary': 'Prinsip, SDLC/STLC, level & tipe testing, desain test case, artefak.'},
        {'title': 'Testing dalam Praktik', 'summary': 'Tools manajemen testing, API testing dengan Postman.'},
        {'title': 'Automation Testing', 'summary': 'Unit, UI (Selenium, Cypress, Playwright), API, BDD, CI/CD.'},
        {'title': 'API Testing & TDD', 'summary': 'TDD, otomasi API dengan TestNG + Rest Assured + Cucumber, CI/CD untuk API test, soal interview.'},
        {'title': 'Lanjutan & Snippet', 'summary': 'Mutation & contract testing, snippet Java/Go/React/Angular.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Tidak diulang',
         'text': 'Dasar SQL untuk tester ada di kurikulum **Database & SQL**; chaos engineering, load testing k6, dan DevSecOps ada di track **Platform Engineering & SRE**.'},
    ],
    'modules': st_mods,
    'sources': [SOURCE_LABEL[ST]] + [SOURCE_LABEL[n] for n in (API6, API9, TDD, FTS) if has_doc(n)],
})

# ─── Rust ───
RS = 'Modul_Rust_Pemula_hingga_Mahir'
CURRICULA.append({
    'id': 'rust', 'title': 'Rust', 'short': 'Rust', 'monogram': 'Rust', 'hue': 'red',
    'description': 'Mulai belajar Rust: instalasi dengan rustup, variabel dan tipe data, struktur kontrol, fungsi, dan latihan bertingkat.',
    'tracks': [{'title': 'Rust Dasar', 'summary': 'Setup sampai fungsi, plus latihan.'}],
    'intro': [{'type': 'callout', 'tone': 'tip', 'title': 'Lanjutan',
               'text': 'Setelah dasar ini, lanjutkan ke track **Low-Level & Systems Programming** di kurikulum Low Level Design (ownership mendalam, concurrency, unsafe, profiling).'}],
    'modules': tracked('Rust Dasar', [M(RS, i) for i in range(0, 7)]),
    'sources': [SOURCE_LABEL[RS]],
})

# ─── Distributed System ───
SDN = ['04-SysDesign-Fase1-Distributed-Systems', '04-SysDesign-Fase2-Observability',
       '04-SysDesign-Fase3-Platform-Engineering', '04-SysDesign-Fase4-Skalabilitas-FinOps']
LINK = {
    1: 'Materi pendukung: track **Distributed System dengan Spring Boot** di kurikulum ini, dan track **Message Queue & Sistem Terdistribusi** di kurikulum Go.',
    2: 'Materi pendukung: modul observability, Prometheus, Grafana, dan OpenTelemetry di track **Platform Engineering & SRE** (kurikulum Cloud & DevOps).',
    3: 'Materi pendukung: modul IaC & GitOps, platform engineering, dan DevSecOps di track **Platform Engineering & SRE** (kurikulum Cloud & DevOps).',
    4: 'Materi pendukung: modul Kubernetes di kurikulum Cloud & DevOps serta modul skalabilitas & load testing di track **Platform Engineering & SRE**.',
}
ds_mods = []
ds_mods += tracked('Roadmap 12 Bulan', [
    PHASE(n, f'SD{i + 1}', extra=[{'type': 'callout', 'tone': 'tip', 'title': 'Materi pendukung', 'text': LINK[i + 1]}])
    for i, n in enumerate(SDN)
])
_ar = [
    M(AR, 0, title='Pengantar Arsitektur & Performa'),
    M(AR, 1), M(AR, 2), M(AR, 3), M(AR, 4),
    MERGE(AR, [5, 6, 7, 8], 'Menghubungkan Keempat Topik',
          summary='Bagaimana system design, performance tuning, DDD, dan EDA saling terkait, plus urutan belajarnya.'),
]
if has_doc(EBA):
    # e-book versi enterprise: studi kasus & kode baru ditambahkan ke modul topik yang sama
    for _e, _a in [(1, 0), (2, 1), (3, 2), (4, 3), (5, 4), (6, 5)]:
        add_fresh(_ar[_a], EBA, _e, [AR], 'Pembaruan Edisi Enterprise')
if has_doc(MSP):
    _ar.append(M(MSP, 0, summary='Gateway, Service Registry, Circuit Breaker, Saga, CQRS, Bulkhead, Sidecar, API Composition, EDA, Database per Service, Retry, Config Externalization, Strangler Fig, Leader Election — masing-masing dengan diagram.'))
ds_mods += tracked('Arsitektur & Performa Sistem', _ar)
ds_mods += tracked('Distributed System dengan Spring Boot', [M(DS, i) for i in range(0, 13)] + [M(DS, 13, title='Penutup Distributed System')])
CURRICULA.append({
    'id': 'distributed', 'title': 'Distributed System', 'short': 'Distributed System', 'monogram': 'DS', 'hue': 'fuchsia',
    'description': 'Roadmap system design 12 bulan (consensus, event sourcing, saga & outbox, observability, platform engineering, multi-region & FinOps), arsitektur & performa, dan implementasinya dengan Spring Boot.',
    'tracks': [
        {'title': 'Roadmap 12 Bulan', 'summary': 'Distributed systems, observability, platform engineering, skalabilitas & FinOps.'},
        {'title': 'Arsitektur & Performa Sistem', 'summary': 'System design, performance tuning, DDD, event-driven architecture, 14 pola microservices.'},
        {'title': 'Distributed System dengan Spring Boot', 'summary': 'Caching, messaging, reactive, discovery, resilience, gateway, outbox.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Cara memakai',
         'text': 'Ikuti **Roadmap 12 Bulan** sebagai rencana belajar. Setiap fase punya checklist milestone dan kompetensi yang bisa kamu centang. Track lainnya adalah materi pendalaman yang dirujuk oleh roadmap.'},
        {'type': 'callout', 'tone': 'tip', 'title': 'Lanjutan setelah roadmap ini',
         'text': 'Formal methods (TLA+), varian Paxos, BFT, CRDT, dan GPU computing ada di track **Concurrency & Distributed Lanjutan** pada kurikulum **Low Level Design**, satu seri dengan roadmap low-level dan database internals.'},
    ],
    'modules': ds_mods,
    'sources': ['System Design Fase 1–4', SOURCE_LABEL[AR], SOURCE_LABEL[EBA], SOURCE_LABEL[MSP], SOURCE_LABEL[DS]],
})

# ─── LLM ───
RM_ = '03-DataAI-Roadmap-Komprehensif'
F2_, F3_, F4_ = '03-DataAI-Fase2-Fine-Tuning-Evaluasi', '03-DataAI-Fase3-MLOps', '03-DataAI-Fase4-Data-Engineering'
llm_mods = []
llm_mods += tracked('Peta Belajar', [M(RM_, 0, title='Peta Kurikulum Data/AI')])
llm_mods += tracked('Fase 0 · Data Infrastructure', [M(RM_, i) for i in range(1, 6)] + [MERGEX([(RM_, 6)], 'Rencana 4 Minggu Fase 0', 'F0')])
llm_mods += tracked('Fase 1 · LLM Engineering', [M(RM_, i) for i in range(7, 19)] + [
    MERGEX([(RM_, 19), (RM_, 20), (RM_, 21)], 'Rencana, Checklist & Cheat Sheet Fase 1', 'F1',
           summary='Rencana 12 minggu, checklist kompetensi yang bisa dicentang, dan cheat sheet best vs bad untuk LLM engineering.')])
if has_doc(RAG):
    _rag_sum = ['Keterbatasan LLM (knowledge cut-off, halusinasi), definisi RAG, manfaat, dan use case populer.',
                'Arsitektur RAG (indexing & RAG pipeline) dan memuat data dengan LangChain loader & LlamaHub.',
                'Mengapa dokumen dipecah, strategi chunking, split per karakter/rekursif/token, dan chunking khusus.',
                'Apa itu embedding, cara memilih model embedding, dan contoh OpenAI & Hugging Face.',
                'Vector store: FAISS, Pinecone, Chroma, Weaviate, dan cara memilihnya.',
                'Retrieval (similarity, MMR, multi-query, contextual compression), augmentation, dan generation.',
                'Evaluasi RAG: metrik retrieval & generation, RAGAS, framework dan benchmark.',
                'Kapan RAG vs fine-tuning, serta lapisan LLMOps stack untuk RAG.',
                'RAG multimodal dan evolusi Naive → Advanced → Modular RAG.',
                'Ucapan terima kasih penulis dan daftar sumber bacaan lanjutan.']
    _rag = []
    for _i, _ch in enumerate(doc(RAG)['chapters']):
        _b = copy.deepcopy(_ch['blocks']) + PAGES_GALLERY(RAG, _ch, 'RAG: A Simple Introduction')
        _rag.append({'title': _ch['title'], 'summary': _rag_sum[_i] if _i < len(_rag_sum) else summarize(_b),
                     'source': SOURCE_LABEL[RAG], 'blocks': _b})
    _rag[0]['blocks'] = [{'type': 'callout', 'tone': 'info', 'title': 'Tentang track ini',
                          'text': 'Disusun dari e-book *Retrieval Augmented Generation: A Simple Introduction* (Abhinav Kimothi, 75 halaman, bahasa Inggris). '
                                  'Teks ditata ulang per bagian; diagram dan contoh kode yang berbentuk gambar ada di **Halaman asli** di akhir tiap modul. '
                                  'Untuk versi bahasa Indonesia yang lebih praktis, lihat modul RAG di track **Fase 1 · LLM Engineering**.'}] + _rag[0]['blocks']
    llm_mods += tracked('RAG: Panduan Lengkap', _rag)
llm_mods += tracked('Fase 2 · Fine-tuning & Evaluasi', [M(F2_, i) for i in range(0, 5)] + [
    MERGEX([(RM_, 23), (F2_, 6), (F2_, 7)], 'Rencana, Checklist & Cheat Sheet Fase 2', 'F2',
           summary='Rencana 12 minggu, checklist kompetensi, dan cheat sheet untuk fine-tuning & evaluasi model.')])
llm_mods += tracked('Fase 3 · MLOps & Automation', [M(F3_, i) for i in range(0, 5)] + [M(RM_, i) for i in range(25, 29)] + [
    MERGEX([(RM_, 29), (F3_, 6), (F3_, 7)], 'Rencana, Checklist & Cheat Sheet Fase 3', 'F3',
           summary='Rencana 12 minggu, checklist kompetensi, dan cheat sheet untuk MLOps, deployment, dan automation.')])
llm_mods += tracked('Fase 4 · Data Engineering', [M(F4_, i) for i in range(0, 5)] + [
    MERGEX([(RM_, 31), (F4_, 6), (F4_, 7)], 'Rencana, Checklist & Cheat Sheet Fase 4', 'F4',
           summary='Rencana 12 minggu, checklist kompetensi, dan cheat sheet untuk data engineering skala besar.')])
llm_mods += tracked('Proyek Akhir Terpadu', [MERGEX([(RM_, 32), (RM_, 33), (RM_, 34)], 'Benang Merah & Proyek Akhir', 'PA',
           summary='Dependensi antar fase, checklist proyek akhir terpadu, dan urutan implementasi yang disarankan.')])
if has_doc(STF):
    _st = []
    for _ch in doc(STF)['chapters']:
        _st.append({'title': _ch['title'], 'summary': _ch.get('summary') or summarize(_ch['blocks']), 'source': SOURCE_LABEL[STF],
                    'blocks': copy.deepcopy(_ch['blocks'])})
    _st[0]['blocks'] = [{'type': 'callout', 'tone': 'info', 'title': 'Tentang cheatsheet ini',
                         'text': 'Kumpulan cheatsheet yang dikompilasi Nikhil Yadav: ringkasan probabilitas MIT 6.041 (Fabián Kozynski) dan '
                                 '*Super VIP Cheatsheet* Stanford CS229 (Machine Learning), CS230 (Deep Learning), dan CS221 (Artificial Intelligence) '
                                 'karya Afshine & Shervine Amidi. Halaman ditampilkan sebagai gambar agar rumusnya utuh; teks tiap halaman ada di bagian lipat '
                                 'di bawah gambar dan ikut terindeks di pencarian.'}] + _st[0]['blocks']
    llm_mods += tracked('Referensi: Cheatsheet ML, DL & AI', _st)
for _m in llm_mods:
    _m['title'] = re.sub(r'^Bab\s+\d+(\.\d+)?\s*[—–-]\s*', '', _m['title'])
CURRICULA.append({
    'id': 'llm', 'title': 'LLM', 'short': 'LLM', 'monogram': 'LLM', 'hue': 'lime',
    'description': 'Jalur Data/AI terpadu: fondasi data infrastructure, LLM engineering (prompt, embedding, RAG, evaluasi, agent), fine-tuning, MLOps & automation, sampai data engineering skala besar.',
    'tracks': [
        {'title': 'Peta Belajar', 'summary': 'Peta kurikulum dan program Applied AI Engineer.'},
        {'title': 'Fase 0 · Data Infrastructure', 'summary': 'pandas, PostgreSQL, FastAPI, Docker, peta ekosistem data.'},
        {'title': 'Fase 1 · LLM Engineering', 'summary': 'Prompt, embedding, vector DB, RAG, evaluasi, LangSmith, agent, LangChain, CrewAI.'},
        {'title': 'RAG: Panduan Lengkap', 'summary': 'E-book RAG A Simple Introduction: indexing, chunking, embedding, vector store, retrieval, evaluasi.'},
        {'title': 'Fase 2 · Fine-tuning & Evaluasi', 'summary': 'Keputusan adaptasi model, LoRA/QLoRA, evaluasi, guardrails.'},
        {'title': 'Fase 3 · MLOps & Automation', 'summary': 'Registry, drift, CI/CD model, serving, Ollama, MCP, n8n, VPS.'},
        {'title': 'Fase 4 · Data Engineering', 'summary': 'Kafka & Flink, lakehouse, orkestrasi, data contracts.'},
        {'title': 'Proyek Akhir Terpadu', 'summary': 'Benang merah antar fase dan checklist proyek akhir.'},
        {'title': 'Referensi: Cheatsheet ML, DL & AI', 'summary': 'Cheatsheet Stanford CS229, CS230, CS221 dan probabilitas MIT.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun tanpa pengulangan',
         'text': '*Roadmap Terpadu Data/AI* sudah memuat seluruh isi dokumen *Fase 1: LLM Engineering* (dengan bab tambahan), jadi Fase 1 diambil dari roadmap. Untuk Fase 2–4 dipakai dokumen fase yang lebih lengkap; ringkasan "Materi Inti" di roadmap tidak diulang. Outline program Applied AI Engineer (Hacktiv8) dipetakan ke Fase 0, 1, dan 3.'},
    ],
    'modules': llm_mods,
    'sources': [SOURCE_LABEL[RM_], 'Data/AI Fase 1: LLM Engineering', SOURCE_LABEL[F2_], SOURCE_LABEL[F3_], SOURCE_LABEL[F4_],
                'Belajar Hacktiv8 (outline program Applied AI Engineer)', SOURCE_LABEL[RAG], SOURCE_LABEL[STF]],
})

# ─── Low Level Design ───
OV = '00-Roadmap-Teknis-Lanjutan-Overview'
LLN = ['05-LowLevel-Fase1-Fondasi-Bahasa-Sistem', '05-LowLevel-Fase2-Concurrency-Memory-Model',
       '05-LowLevel-Fase3-OS-Internals-Performance', '05-LowLevel-Fase4-Proyek-Sistem-Skala']
DBN = ['06-DBInternals-Fase1-Storage-Engine-Fundamentals', '06-DBInternals-Fase2-Transaksi-Concurrency-Control',
       '06-DBInternals-Fase3-Query-Processing-Optimizer', '06-DBInternals-Fase4-Search-Engineering-Relevance']
lld_mods = []
lld_mods += tracked('Peta Roadmap', [MERGEX([(OV, i) for i in range(0, 4)], 'Roadmap Teknis Lanjutan', 'OV',
           summary='Dua bidang 12 bulan yang saling menguatkan: low-level systems programming dan database internals & search engineering.')])
lld_mods += tracked('Low-Level & Systems Programming', [PHASE(n, f'LL{i + 1}') for i, n in enumerate(LLN)])
lld_mods += tracked('Database Internals & Search', [PHASE(n, f'DB{i + 1}') for i, n in enumerate(DBN)])
# Roadmap lanjutan seri yang sama (07 & 08): concurrency/distributed lanjutan + green computing
OV2 = '00-Roadmap-ConcDist-Green-Overview'
CDN = ['07-ConcDist-Fase1-GPU-Parallel-Computing', '07-ConcDist-Fase2-Formal-Methods-TLA',
       '07-ConcDist-Fase3-Algoritma-Terdistribusi-Lanjutan', '07-ConcDist-Fase4-Capstone-Terverifikasi-Terakselerasi']
GCN = ['08-GreenComputing-Fase1-Fundamental-Energy-Aware', '08-GreenComputing-Fase2-Efisiensi-Software-Hardware',
       '08-GreenComputing-Fase3-Carbon-Aware-Infrastructure', '08-GreenComputing-Fase4-Capstone-Audit-Karbon']
SOURCE_LABEL[OV2] = 'Roadmap Concurrency & Green Computing: Overview'
if has_doc(OV2):
    _ov2 = MERGEX([(OV2, i) for i in range(0, 4)], 'Roadmap Concurrency & Green Computing', 'OV2',
                  summary='Dua bidang lanjutan 12 bulan: GPU & formal methods untuk sistem terdistribusi, serta rekayasa software yang sadar energi dan karbon.')
    # ringkasan dua bidang (tabel di halaman judul) ikut ditampilkan
    _ov2['blocks'] = [b for b in copy.deepcopy(doc(OV2)['preface']) if b['type'] == 'table'] + _ov2['blocks']
    lld_mods.insert(1, {**_ov2, 'track': 'Peta Roadmap'})
    lld_mods += tracked('Concurrency & Distributed Lanjutan', [PHASE(n, f'CD{i + 1}') for i, n in enumerate(CDN)])
    lld_mods += tracked('Green & Sustainable Computing', [PHASE(n, f'GC{i + 1}') for i, n in enumerate(GCN)])
CURRICULA.append({
    'id': 'lld', 'title': 'Low Level Design', 'short': 'Low Level Design', 'monogram': 'LLD', 'hue': 'cyan',
    'description': 'Roadmap 12 bulan per bidang: Rust/C++ modern, concurrency & memory model, OS internals & profiling, database internals (B-Tree/LSM, MVCC, optimizer) & search engineering, GPU/CUDA & formal methods (TLA+, Paxos/BFT/CRDT), serta green & sustainable computing.',
    'tracks': [
        {'title': 'Peta Roadmap', 'summary': 'Cara memakai roadmap, jalur serial vs paralel, sinergi antar-bidang.'},
        {'title': 'Low-Level & Systems Programming', 'summary': 'Bahasa sistem, concurrency, OS internals, proyek performa kritis.'},
        {'title': 'Database Internals & Search', 'summary': 'Storage engine, transaksi & recovery, query optimizer, relevance.'},
        {'title': 'Concurrency & Distributed Lanjutan', 'summary': 'GPU & CUDA, formal methods dengan TLA+, Paxos/BFT/CRDT, capstone sistem terverifikasi & terakselerasi.'},
        {'title': 'Green & Sustainable Computing', 'summary': 'Mengukur energi & karbon, optimasi software/hardware, infrastruktur carbon-aware, audit karbon.'},
    ],
    'intro': [
        {'type': 'callout', 'tone': 'tip', 'title': 'Latihan di setiap fase',
         'text': 'Setiap fase punya **Uji Pemahaman** (mode latihan Paham/Ulangi) serta checklist milestone dan kompetensi yang bisa kamu centang. Dasar Rust ada di kurikulum **Rust**; dasar SQL di **Database & SQL**.'},
        {'type': 'callout', 'tone': 'info', 'title': 'Empat bidang, satu seri',
         'text': 'Keempat bidang di sini berasal dari seri roadmap yang sama (dokumen 05–08). **Concurrency & Distributed Lanjutan** melanjutkan Raft dari roadmap System Design di kurikulum **Distributed System**; **Green & Sustainable Computing** memakai ulang benchmark dari track Low-Level dan menyambung ke infrastruktur cloud di kurikulum **Cloud & DevOps**.'},
    ],
    'modules': lld_mods,
    'sources': [SOURCE_LABEL[OV], 'Low-Level Fase 1–4', 'DB Internals Fase 1–4']
               + ([SOURCE_LABEL[OV2], 'Concurrency & Distributed Fase 1–4', 'Green Computing Fase 1–4'] if has_doc(OV2) else []),
})

# ─── English Learning ───
EN = 'English_Vocabulary_and_Phrasal_Verbs_v3'
TF = 'English_Komprehensif_Tenses_TOEFL_v2'
IM = 'Panduan_Master_IELTS'
IB = 'Ringkasan_IELTS_Vocabulary_Booster'
SOURCE_LABEL[TF] = 'English Mastery: 16 Tenses & TOEFL (v2)'
SOURCE_LABEL[IM] = 'Panduan Master IELTS (PDF)'
SOURCE_LABEL[IB] = 'Ringkasan IELTS Vocabulary Booster (PDF)'
en_title = lambda i: re.sub(r'^Bagian\s+\d+\s*-\s*', '', clean_title(doc(EN)['chapters'][i]['title']))


def EM(docname, idx, prefix=None, title=None, **kw):
    m = M(docname, idx, title=title, vocab=True, **kw)
    if prefix:
        m['blocks'] = practice(m['blocks'], prefix)
    m['title'] = re.sub(r'^[A-E]\.\d+\s+', '', m['title'])
    m['title'] = re.sub(r'^\d+\.\s+', '', m['title'])
    return m


def EMERGE(docname, idxs, title, summary=None):
    m = MERGE(docname, idxs, title, summary=summary)
    m['blocks'] = to_vocab(m['blocks'])
    for b in m['blocks']:
        if b['type'] == 'h':
            b['text'] = re.sub(r'^[A-E]\.\d+\s+', '', b['text'])
    return m


en_mods = []
en_mods += tracked('Sehari-hari & Travelling', [M(EN, i, title=en_title(i), vocab=True) for i in (1, 2, 6)])
en_mods += tracked('Kerja & Bisnis', [M(EN, i, title=en_title(i), vocab=True) for i in (3, 4, 7, 8, 9, 10)])
en_mods += tracked('Phrasal Verbs & Idiom', [M(EN, i, title=en_title(i), vocab=True) for i in (11, 12)])
en_mods += tracked('Untuk Developer', [M(EN, i, title=en_title(i), vocab=True) for i in (5, 13, 14, 15, 16, 17)])
en_mods += tracked('Vocabulary Lanjutan + Sinonim', [EM(TF, i) for i in (46, 47, 48, 49)])
en_mods += tracked('16 Tenses', [EM(TF, i) for i in range(0, 6)] + [
    EM(TF, 51, title='Cheat Sheet 16 Tenses', summary='Rumus, contoh kilat, dan sinyal khas ke-16 tenses dalam satu tabel.'),
    EM(TF, 52, title='Irregular Verbs (V1–V2–V3)', summary='Kata kerja tidak beraturan yang paling sering dipakai beserta bentuk V2 dan V3.')])
en_mods += tracked('Grammar TOEFL', [
    EMERGE(TF, [6, 7, 8, 9], 'Agreement, Parallelism, Word Form & Passive'),
    EMERGE(TF, [10, 11, 12, 13], 'Conditionals, Subjunctive, Reduced & Relative Clauses'),
    EMERGE(TF, [14, 15, 16, 17], 'Comparatives, Inversion, Articles & Pronouns'),
    EMERGE(TF, [18, 19, 20, 21], 'Noun Clauses, Gerund/Infinitive, Prepositions & Reported Speech'),
    EM(TF, 53, title='Kesalahan Umum Pelajar Indonesia'),
])
en_mods += tracked('Strategi TOEFL', [EM(TF, i, prefix='TF') for i in range(22, 26)] + [
    EM(TF, 26, prefix='TF', summary='10 soal structure & written expression dengan kunci dan alasan singkat.'),
    EM(TF, 27, prefix='TF')])
en_mods += tracked('IELTS: Kenali Ujian', [
    {**EM(IM, 0, title='Cara Memakai Panduan IELTS'), 'blocks': EM(IM, 0)['blocks'][:2]},
    EM(IM, 1), EM(IM, 2), EM(IM, 3),
])
en_mods += tracked('IELTS: Listening & Reading', [EM(IM, 4), EM(IM, 5)])
en_mods += tracked('IELTS: Writing', [EM(IM, i) for i in range(6, 14)])
en_mods += tracked('IELTS: Speaking', [EM(IM, 14), EM(IM, 15)])
en_mods += tracked('IELTS: Grammar, Kosakata & Rencana', [EM(IM, 16), EM(IM, 17), EM(IM, 18), EM(IM, 19, prefix='IL', summary='Perbaiki 24 kalimat salah, latihan parafrase, serta tugas Writing dan Speaking yang bisa dicentang.'), EM(IM, 20, prefix='IR')])
en_mods += tracked('IELTS Vocabulary Booster', [EM(IB, i) for i in range(1, 11)] + [EM(IB, 11), EM(IB, 12, prefix='IB')])

# Kosakata yang sama di beberapa sumber hanya ditampilkan sekali (kemunculan pertama).
_seen = set()
_dropped = 0
for _m in en_mods:
    for _b in _m['blocks']:
        if _b['type'] != 'vocab':
            continue
        keep = []
        for it in _b['items']:
            key = re.sub(r'\s*\([^)]*\)\s*$', '', it['term']).strip().lower()
            if key in _seen:
                _dropped += 1
                continue
            _seen.add(key)
            keep.append(it)
        _b['items'] = keep
    _m['blocks'] = [b for b in _m['blocks'] if not (b['type'] == 'vocab' and not b['items'])]
print('kosakata duplikat dibuang:', _dropped)

tips = chapter(EN, 18)['blocks']
use = chapter(EN, 0)['blocks']
CURRICULA.append({
    'id': 'english', 'title': 'English Learning', 'short': 'English Learning', 'monogram': 'EN', 'hue': 'rose',
    'description': 'Kosakata & phrasal verbs untuk kerja dan developer, 16 tenses, grammar & strategi TOEFL, persiapan IELTS lengkap, dan IELTS Vocabulary Booster.',
    'tracks': [
        {'title': 'Sehari-hari & Travelling', 'summary': 'Percakapan, perjalanan, kesehatan.'},
        {'title': 'Kerja & Bisnis', 'summary': 'Keuangan, kantor, interview, marketing, CS, negosiasi.'},
        {'title': 'Phrasal Verbs & Idiom', 'summary': 'Phrasal verbs per bidang dan idiom populer.'},
        {'title': 'Untuk Developer', 'summary': 'Istilah IT, pemrograman, agile, interview teknis, remote work.'},
        {'title': 'Vocabulary Lanjutan + Sinonim', 'summary': 'Academic word list, bisnis, IT, collocation & idiom.'},
        {'title': '16 Tenses', 'summary': 'Present, past, future, past future, perbandingan, cheat sheet, irregular verbs.'},
        {'title': 'Grammar TOEFL', 'summary': 'Structure & written expression: 16 pola yang paling sering keluar.'},
        {'title': 'Strategi TOEFL', 'summary': 'Format tes, strategi tiap seksi, latihan mini, rencana 8 minggu.'},
        {'title': 'IELTS: Kenali Ujian', 'summary': 'Peta dokumen, format & penilaian, mitos dan aturan lintas skill.'},
        {'title': 'IELTS: Listening & Reading', 'summary': 'Strategi, jebakan, manajemen waktu, jenis soal.'},
        {'title': 'IELTS: Writing', 'summary': 'Task 1 Academic & GT, Task 2, esai band 9, bank ide.'},
        {'title': 'IELTS: Speaking', 'summary': 'Tiga bagian, aturan, ungkapan siap pakai, topik Part 1.'},
        {'title': 'IELTS: Grammar, Kosakata & Rencana', 'summary': 'Kesalahan tersering, parafrase, latihan mandiri, rencana 8 minggu.'},
        {'title': 'IELTS Vocabulary Booster', 'summary': '9 topik Writing Task 2, 42 kata berdampak, rencana 14 hari.'},
    ],
    'intro': [b for b in use if b['type'] == 'p'] + [
        {'type': 'callout', 'tone': 'tip', 'title': 'Mode hafalan',
         'text': 'Di setiap tabel kosakata, aktifkan **Mode hafalan** untuk menyembunyikan arti. Tebak dulu, lalu klik barisnya untuk melihat jawabannya.'},
        {'type': 'callout', 'tone': 'info', 'title': 'Disusun tanpa pengulangan',
         'text': 'Dua dokumen *English Komprehensif v2* isinya identik, jadi dipakai satu. Bagian D di dalamnya sama dengan kosakata yang sudah ada, dan kata yang muncul di lebih dari satu sumber hanya ditampilkan sekali. Teknik menghafal diambil dari *IELTS Vocabulary Booster* dan *Tips Belajar Cepat*.'},
    ] + tips,
    'modules': en_mods,
    'sources': [SOURCE_LABEL[EN], SOURCE_LABEL[TF], 'English Komprehensif v2: Vocabulary Baru', SOURCE_LABEL[IM], SOURCE_LABEL[IB]],
})

# ═════════════════════════════ BAHASA KODE ═════════════════════════════
SHELL_CMD = r'(go|flutter|dart|ng|npm|npx|pnpm|yarn|node|mkdir|cd|echo|ls|cat|git|docker|kubectl|helm|curl|wget|pip|pip3|python3?|brew|sudo|apt|apt-get|export|firebase|gcloud|aws|bundletool|fastlane|eas|expo|cargo|rustup|java|mvn|gradle|\./\w+|source|chmod|cp|mv|rm|touch|sh|bash|make|terraform|k6|psql|redis-cli|ollama|uvicorn|gunicorn|django-admin|alembic|migrate|protoc|buf|sqlc|swag|grpcurl|golangci-lint|air|wire)'


def guess_hash_lang(code, orig):
    first = code.lstrip().split('\n', 1)[0].lower()
    lines = [l for l in code.split('\n') if l.strip() and not l.strip().startswith('#')]
    n = max(len(lines), 1)
    if orig in ('js', 'ts') and re.search(r'\bconst |\blet |=>|\bfunction ', code):
        return orig
    if orig == 'java' and re.search(r'@[A-Z]\w+|\bclass\s+\w+|\bpublic\s', code):
        return orig
    if re.search(r'^\s*(extend\s+)?(type|input|enum|interface|query|mutation|schema)\b[^\n]*[{@]', code, re.M):
        return 'graphql'
    if re.search(r'^FROM\s', code, re.M):
        return 'docker'
    if re.search(r'\bdef \w+\(|^\s*import \w|^\s*from [\w.]+ import|:=|\bprint\(|^\s*for \w+ in ', code, re.M):
        return 'python'
    yamlish = sum(bool(re.match(r'^\s*-?\s*[\w.-]+:(\s|$)', l)) for l in lines)
    vals = [l.split(':', 1)[1].split() for l in lines if ':' in l]
    prose = bool(vals) and sum(len(v) for v in vals) / len(vals) >= 5
    if re.search(r'\.ya?ml\b|compose', first) or re.search(r'^\s*-?\s*(run|uses|steps|jobs|runs-on):\s', code, re.M) \
            or (lines and yamlish > n * 0.6 and not prose):
        return 'yaml'
    kv = sum(bool(re.match(r'^\s*[\w.\-\[\]]+\s*=\s*\S', l)) for l in lines)
    if lines and kv > n * 0.6:
        upper = sum(bool(re.match(r'^\s*[A-Z][A-Z0-9_]*\s*=', l)) for l in lines)
        return 'bash' if upper > n * 0.6 else 'properties'
    cmd = sum(bool(re.match(r'^\s*(\$\s*)?' + SHELL_CMD + r'(\s|$)', l)) for l in lines)
    if lines and cmd >= n * 0.3:
        return 'bash'
    if re.search(r'\breturn\b|^\s*\w+ = \w+\(', code, re.M):
        return 'python'
    return 'text'


def fix_hash_comment_langs(blocks):
    """Kode yang dibuka komentar '#' bukan Go/TS/Java/Dart/Rust: tentukan ulang bahasanya."""
    for b in blocks:
        if b['type'] == 'code' and b['lang'] in ('go', 'ts', 'js', 'java', 'dart', 'rust') and b['code'].lstrip().startswith('# '):
            b['lang'] = guess_hash_lang(b['code'], b['lang'])
        if b['type'] == 'qa':
            for q in b['items']:
                fix_hash_comment_langs(q.get('prompt', []))
                fix_hash_comment_langs(q['a'])


def clean_heads(blocks):
    """Judul (h) ditampilkan sebagai teks biasa: buang tanda escape & tebal dari hasil konversi PDF."""
    for b in blocks:
        if b['type'] == 'h':
            b['text'] = re.sub(r'\\([\\*`\[\]])', r'\1', b['text']).replace('**', '').strip()
        elif b['type'] == 'qa':
            for q in b['items']:
                clean_heads(q.get('prompt', []))
                clean_heads(q['a'])
        elif b['type'] == 'details':
            clean_heads(b['blocks'])
        elif b['type'] == 'tabs':
            for t in b.get('tabs', []):
                clean_heads(t.get('blocks', []))


for c in CURRICULA:
    for m in c['modules']:
        fix_hash_comment_langs(m['blocks'])
        clean_heads(m['blocks'])

# ═════════════════════════════ ID MODUL ═════════════════════════════
def assign_ids(mods, seen=None):
    seen = set() if seen is None else seen
    for m in mods:
        base = slug(m['title'])
        sid = base
        k = 2
        while sid in seen:
            sid = f'{base}-{k}'
            k += 1
        seen.add(sid)
        m['id'] = sid
    return seen


for c in CURRICULA:
    c['_ids'] = assign_ids(c['modules'])

# ═════════════════════════════ ARSIP SUMBER ═════════════════════════════
# Semua isi dokumen asli harus ada di aplikasi. Bagian yang tidak masuk jalur utama
# (duplikat, pengantar, daftar isi, bab yang digantikan sumber lain) disimpan di track
# "Arsip Sumber" kurikulumnya, lengkap dengan peta bab → modul.
ARCHIVE_TRACK = {'title': 'Arsip Sumber',
                 'summary': 'Peta bab dokumen asli dan bagian yang tidak masuk jalur utama, supaya tidak ada isi yang hilang.'}
ALT = 'alt/'
for _n in ['01-Web-Fase1-Modern-Rendering-Edge', '01-Web-Fase2-API-Design-Type-Safety', '01-Web-Fase3-Performance-Engineering',
           '01-Web-Fase4-Web-Security', '02-Mobile-Fase1-Cross-Platform', '02-Mobile-Fase2-On-Device-AI',
           '02-Mobile-Fase3-Performance-Profiling', '02-Mobile-Fase4-Arsitektur-Delivery']:
    if os.path.exists(f'{SRC}/{ALT}{_n}.json'):
        SOURCE_LABEL[ALT + _n] = SOURCE_LABEL[_n] + ' (versi ringkas)'
SOURCE_LABEL['03-DataAI-Fase1-LLM-Engineering'] = 'Data/AI Fase 1: LLM Engineering'
# Tiga halaman HTML awal (isinya ditulis ulang di src/data/*.ts) juga diarsipkan bagian yang belum ada.
HTML = {'html/aws-java-roadmap': 'AWS Roadmap for Java Developer (HTML)',
        'html/java-algorithms': 'Java Algorithm Mastery (HTML)',
        'html/interview-prep-java-spring-aws': 'Interview Prep Java, Spring & AWS (HTML)'}
for _k, _v in HTML.items():
    if os.path.exists(f'{SRC}/{_k}.json'):
        SOURCE_LABEL[_k] = _v
# Modul yang ditulis tangan di src/data/*.ts (untuk peta bab dokumen HTML)
TS_MODS = [('devops', 'fondasi', 'Fondasi AWS'), ('devops', 'core-services', 'Core Services untuk Java'),
           ('devops', 'devops', 'DevOps & Monitoring'), ('devops', 'prioritas', 'Prioritas Belajar untuk Posisi Ini'),
           ('devops', 'deploy', 'Deploy Spring Boot ke AWS (Gratis)'), ('devops', 'alternatif', 'Alternatif Deploy Gratis'),
           ('java', 'rekursi', 'Rekursi'), ('java', 'brute-force', 'Brute Force'), ('java', 'dynamic-programming', 'Dynamic Programming'),
           ('java', 'greedy', 'Greedy Algorithm'), ('java', 'divide-conquer', 'Divide & Conquer'),
           ('java', 'perbandingan', 'Perbandingan Algoritma'),
           ('interview', 'java', 'Java Core'), ('interview', 'spring', 'Spring Boot'), ('interview', 'aws', 'AWS Fundamentals')]
TS_LOC = {
    ('html/aws-java-roadmap', 'Roadmap & Free Tier Deploy'): [('devops', None, 'Pengantar kurikulum Cloud & DevOps')],
    ('html/aws-java-roadmap', 'Learning Roadmap'): TS_MODS[0:3],
    ('html/java-algorithms', 'Kuasai Algoritma'): [('java', None, 'Pengantar kurikulum Java & Spring Boot')],
    ('html/interview-prep-java-spring-aws', 'Java · Spring Boot · AWS'): [('interview', None, 'Pengantar Interview Prep')],
}
SOURCE_LABEL['English_Komprehensif_v2_Vocabulary_Baru'] = 'English Komprehensif v2: Vocabulary Baru'

DOC_CUR = {
    'java': ['html/java-algorithms', MJ, SB, SD, AJ, DPJ] + [n for n in (GRD, LAM, JFI, DSN, SDI) if has_doc(n)],
    'go': [PM, MC, GQ, GB],
    'js': [RT, RK, RM, RP1, RP2, RN, TS, NG, EX1, EX2, NS1, NS2,
           '01-Web-Fase1-Modern-Rendering-Edge', '01-Web-Fase2-API-Design-Type-Safety',
           '01-Web-Fase3-Performance-Engineering', '01-Web-Fase4-Web-Security'],
    'python': [FA1, FA2, DJ1, DJ2],
    'flutter': [FL, '02-Mobile-Fase1-Cross-Platform', '02-Mobile-Fase2-On-Device-AI',
                '02-Mobile-Fase3-Performance-Profiling', '02-Mobile-Fase4-Arsitektur-Delivery'],
    'devops': ['html/aws-java-roadmap', DK, PE],
    'interview-extra': [SO, 'html/interview-prep-java-spring-aws'],
    'sql': [SQ, DB],
    'testing': [ST],
    'rust': [RS],
    'distributed': SDN + [AR, DS],
    'llm': [RM_, '03-DataAI-Fase1-LLM-Engineering', F2_, F3_, F4_],
    'lld': [OV] + LLN + DBN + ([OV2] + CDN + GCN if has_doc(OV2) else []),
    'english': [EN, TF, 'English_Komprehensif_v2_Vocabulary_Baru', IM, IB],
}
for _cid in ('js', 'flutter'):
    DOC_CUR[_cid] += [ALT + n for n in DOC_CUR[_cid] if ALT + n in SOURCE_LABEL]
DOC_CUR['js'] += [n for n in (LZY,) if has_doc(n)]
DOC_CUR['llm'] += [n for n in (RAG, STF) if has_doc(n)]
for _cid, _ns in [('java', (CIJ, D60, JEC)), ('js', (RJS,)), ('sql', (SQN,)), ('testing', (API9, API6, TDD, FTS)),
                  ('distributed', (EBA, MSP)), ('devops', (DV2,)), ('interview-extra', (KAF,))]:
    DOC_CUR[_cid] += [n for n in _ns if has_doc(n)]
CID_PUBLIC = {'interview-extra': 'interview'}
SKIP_KEYS = {'type', 'tone', 'lang', 'id', 'level', 'ordered', 'hue', 'track', 'monogram', '_ids'}


def norm(s):
    return re.sub(r'[^a-z0-9]+', '', s.lower().replace('\\', ''))


def strings(x, out):
    if isinstance(x, str):
        out.append(x)
    elif isinstance(x, dict):
        keys = [k for k in x if k not in SKIP_KEYS]
        for k in ('term', 'q', 'title'):
            if k in keys:
                keys.remove(k)
                keys.insert(0, k)
        for k in keys:
            strings(x[k], out)
    elif isinstance(x, list):
        for v in x:
            strings(v, out)
    return out


ATOMS = {}      # teks ternormalisasi → (cid, mid, judul modul)
_parts = []
for c in CURRICULA:
    cid = CID_PUBLIC.get(c['id'], c['id'])
    for m in c['modules']:
        for t in strings(m, []):
            ATOMS.setdefault(norm(t), (cid, m['id'], m['title']))
            _parts.append(t)
    for t in strings(c.get('intro', []), []):
        ATOMS.setdefault(norm(t), (cid, None, 'Pengantar kurikulum'))
        _parts.append(t)
    for k, v in (c.get('merge') or {}).items():
        for t in strings(v or [], []):
            ATOMS.setdefault(norm(t), ('interview', 'spring', f'Spring Boot (pendalaman {k})'))
            _parts.append(t)
HAND = os.path.join(DST, '..')
TS_LIT = []
TS_STR = re.compile(r"(?:(\w+)\s*:\s*)?('(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`)")


def ts_strings(src):
    """Hanya isi string literal dari file .ts (tanpa nama properti/metadata) agar urutan teks sama dengan sumber."""
    out = []
    for m in TS_STR.finditer(src):
        if m.group(1) in SKIP_KEYS:
            continue
        t = m.group(2)[1:-1]
        t = re.sub(r'\\n', '\n', t)
        t = re.sub(r'\\(.)', r'\1', t)
        out.append(t)
    return out


for f in ('aws.ts', 'interview.ts', 'algorithms.ts', 'ai.ts'):
    if os.path.exists(os.path.join(HAND, f)):
        _ts = ts_strings(open(os.path.join(HAND, f), encoding='utf-8').read())
        TS_LIT.extend(_ts)
        _parts.extend(_ts)
MAIN = norm('\n'.join(_parts))
ARCH_ATOMS = set()
ARCH_PARTS = []
_arch_cache = ['', 0]


def arch_text():
    if _arch_cache[1] != len(ARCH_PARTS):
        _arch_cache[0] = norm('\n'.join(ARCH_PARTS))
        _arch_cache[1] = len(ARCH_PARTS)
    return _arch_cache[0]


NUM = re.compile(r'^\s*((bab|bagian|fase|lampiran|modul|soal|part)\s+[\w.]+\s*[:—–.-]?\s*|[A-Ea-e]?\d+(\.\d+)*[.)]?\s+|[A-E]\.\d+\s+|[A-Z]{1,3}-\d+\s+)', re.I)


TS_TOKENS = [set(re.findall(r'[a-z0-9]{3,}', plain(x).lower())) for x in TS_LIT]
FUZZY = [False]


def fuzzy_found(t):
    """Untuk halaman HTML awal: isinya ditulis ulang (parafrase ringan) di file .ts.
    Dianggap ada bila ≥80% kata (≥3 huruf) muncul dalam satu string yang sama."""
    toks = set(re.findall(r'[a-z0-9]{3,}', plain(t).lower()))
    if len(toks) < 3:
        return False
    need = 0.8 * len(toks)
    return any(len(toks & ts) >= need for ts in TS_TOKENS)


def found(t, heading=False):
    if FUZZY[0] and fuzzy_found(t):
        return True
    variants = [t]
    if heading:
        v = re.sub(r'(\s+|\t)\d{1,3}$', '', plain(t))          # nomor halaman di daftar isi
        variants.append(v)
        variants.append(NUM.sub('', v))
        variants.append(re.sub(r'\s*\((dipertahankan|edisi komprehensif)\)', '', variants[-1], flags=re.I))
    for v in variants:
        n = norm(v)
        if len(n) < 6 or n in ATOMS or n in ARCH_ATOMS or n in MAIN or n in arch_text():
            return True
    return False


def row_found(cells):
    if found(' '.join(cells)):
        return True
    return all(found(x) for x in cells)


def missing_part(b):
    """Bagian blok yang belum ada di aplikasi (None bila sudah lengkap)."""
    t = b['type']
    if t in ('p', 'qmark'):
        return None if found(b['text']) else {'type': 'p', 'text': b['text']}
    if t == 'list':
        miss = [x for x in b['items'] if not found(x)]
        return {**b, 'items': miss} if miss else None
    if t == 'callout':
        lines = [b.get('title', '')] + b['text'].split('\n')
        return None if all(found(x) for x in lines) else b
    if t == 'code':
        if FUZZY[0]:
            # kode yang ditulis ulang: periksa per baris (komentar/angka yang berubah ikut tersimpan)
            lines = [x for x in b['code'].split('\n') if len(norm(x)) >= 12]
            return None if found(b['code']) and all(found(x) for x in lines) else b
        return None if found(b['code']) else b
    if t == 'table':
        rows = [r for r in b['rows'] if not row_found(r)]
        if rows:
            return {**b, 'rows': rows}
        return None if row_found(b['head']) else {**b, 'rows': []}
    return None


def remember(blocks):
    for t in strings(blocks, []):
        ARCH_PARTS.append(t)
        ARCH_ATOMS.add(norm(t))


def votes(blocks, home):
    cnt = {}
    for t in strings(blocks, []):
        n = norm(t)
        if len(n) < 12 or n not in ATOMS:
            continue
        key = ATOMS[n]
        cnt[key] = cnt.get(key, 0) + 1
    if not cnt:
        return []
    top = max(cnt.values())
    picks = sorted(cnt.items(), key=lambda kv: -kv[1])
    return [k for k, v in picks if v >= max(2, top * 0.2) or v == top][:3]


CUR_TITLE = {CID_PUBLIC.get(c['id'], c['id']): c.get('short', c.get('title', c['id'])) for c in CURRICULA}
CUR_TITLE['interview'] = 'Interview Prep'


def where(keys, home):
    out = []
    for cid, mid, title in keys:
        link = f'#{cid}.{mid}' if mid else f'#{cid}'
        label = esc_md(title)
        out.append((f'{CUR_TITLE.get(cid, cid)} › ' if cid != home else '') + f'[{label}]({link})')
    return '; '.join(out)


def esc_md(t):
    return re.sub(r'([\\*`\[\]])', r'\\\1', plain(t))


def archive_doc(name, home):
    d = doc(name)
    FUZZY[0] = name.startswith('html/')
    label = SOURCE_LABEL[name]
    peta = []
    body = []
    n_missing = 0

    def section(title, blocks):
        nonlocal n_missing
        out = []
        h3 = h4 = None
        pend = []
        for b in blocks:
            if b['type'] == 'h':
                if b.get('level', 3) <= 3:
                    h3, h4 = b, None
                else:
                    h4 = b
                continue
            part = missing_part(b)
            if not part:
                continue
            n_missing += 1
            for h in (h3, h4):
                if h is not None and not h.get('_done'):
                    out.append({'type': 'h', 'text': plain(h['text']), 'level': 4})
                    h['_done'] = True
            out.append(part)
        # judul sub-bagian yang tidak ada di mana pun (tanpa isi yang hilang)
        lost_h = [plain(b['text']) for b in blocks if b['type'] == 'h' and not b.get('_done') and not found(b['text'], heading=True)]
        if lost_h:
            out.append({'type': 'p', 'text': '*Sub-judul asli:* ' + ' · '.join(esc_md(x) for x in lost_h)})
        if out:
            body.append({'type': 'h', 'text': title, 'level': 3})
            body.extend(out)
        return bool(out)

    if d.get('preface'):
        section('Pengantar dokumen', copy.deepcopy(d['preface']))
    part = None
    for ch in d['chapters']:
        if ch.get('part') and ch['part'] != part:
            part = ch['part']
            peta.append([f'**{esc_md(part)}**', ''])
        blocks = copy.deepcopy(ch['blocks'])
        title = clean_title(ch['title']) or ch['title']
        if name.startswith('html/'):
            keys = TS_LOC.get((name, ch['title'])) or [k for k in TS_MODS if norm(k[2]) == norm(plain(ch['title']))] \
                or votes(blocks, home)
        else:
            keys = votes(blocks, home)
        loc = where(keys, home)
        sub = ch.get('subtitle')
        had = section(title + (f' — {sub}' if sub else ''), blocks)
        if had and loc:
            loc += ' · sisanya di bawah'
        elif had:
            loc = 'Di bawah (arsip)'
        elif not loc:
            loc = 'Tercakup di modul lain'
        peta.append([esc_md(ch['title']) + (f' *({esc_md(sub)})*' if sub else ''), loc])
    remember(peta)
    remember(body)
    leftovers = []
    for t in d.get('skipped', []) + d.get('raw', []):
        if not found(t, heading=True) and norm(t) not in {norm(x) for x in leftovers}:
            leftovers.append(t)
            ARCH_ATOMS.add(norm(t))
            ARCH_PARTS.append(t)
    if leftovers:
        n_missing += len(leftovers)
        body.append({'type': 'h', 'text': 'Teks lain dari dokumen', 'level': 3})
        body.append({'type': 'p', 'text': 'Potongan teks (sampul, daftar isi, label tabel, catatan kecil) yang tidak termasuk dalam bab mana pun.'})
        body.append({'type': 'list', 'items': [re.sub(r'([\\*`\[\]])', r'\\\1', x) for x in leftovers]})
    intro = {'type': 'callout', 'tone': 'info', 'title': 'Tentang arsip ini',
             'text': f'Isi dokumen *{esc_md(label)}* sudah dipindahkan ke aplikasi. **Peta bab** menunjukkan di modul mana setiap bab sekarang berada. '
                     + ('Di bawahnya ada bagian dokumen asli yang tidak masuk jalur utama, biasanya karena sudah dibahas di sumber lain atau berupa pengantar dan daftar isi.'
                        if body else 'Semua bagian dokumen ini sudah ada di jalur utama.')}
    blocks = [intro, {'type': 'h', 'text': 'Peta bab', 'level': 3},
              {'type': 'table', 'head': ['Bab di dokumen asli', 'Sekarang ada di'], 'rows': peta}] + body
    if home == 'english':
        blocks = to_vocab(blocks)
    summary = f'Peta {len(peta)} bab' + (f' dan {n_missing} bagian yang tidak ada di jalur utama.' if n_missing else '; semua isinya sudah ada di jalur utama.')
    return {'title': f'Arsip · {label}', 'summary': summary, 'source': label, 'track': ARCHIVE_TRACK['title'],
            'archive': True, 'blocks': blocks}, n_missing


ARCHIVE_STATS = {}
for c in CURRICULA:
    names = DOC_CUR.get(c['id'], [])
    if not names:
        continue
    home = CID_PUBLIC.get(c['id'], c['id'])
    arch = []
    for name in names:
        m, k = archive_doc(name, home)
        arch.append(m)
        ARCHIVE_STATS[name] = k
    assign_ids(arch, c['_ids'])
    if c['id'] == 'interview-extra':
        c['archive'] = arch
    else:
        c['modules'] += arch
        c['tracks'] = c.get('tracks', []) + [ARCHIVE_TRACK]
for k, v in ARCHIVE_STATS.items():
    if v:
        print(f'  arsip {k[:50]:50} {v:4} bagian')
# ringkasan arsip per dokumen (dipakai untuk laporan cakupan)
json.dump({n: {'curriculum': CUR_TITLE.get(CID_PUBLIC.get(cid, cid), cid), 'archived': ARCHIVE_STATS.get(n, 0)}
           for cid, names in DOC_CUR.items() for n in names},
          open(os.path.join(SRC, '_arsip.json'), 'w'), ensure_ascii=False, indent=1)

# ═════════════════════════════ OUTPUT ═════════════════════════════
total = 0
for c in CURRICULA:
    c.pop('_ids', None)
    total += len(c['modules'])
    json.dump(c, open(f"{DST}/{c['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f"{c['id']:16} {len(c['modules']):3} modul  {os.path.getsize(f'{DST}/' + c['id'] + '.json') // 1024} KB")
print('total modul', total)
