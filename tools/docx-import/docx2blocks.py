"""Konversi .docx → daftar bab (chapter) berisi Block playbook (JSON).

Dipakai: python3 -I docx2blocks.py <file.docx> <config-json> > out.json
Config (JSON string):
  levels:        {"Heading1": 1, ...}  pemetaan style → level heading
  size_levels:   {"36": 1, "28": 2}     (opsional) bold + ukuran font → level heading
  chapter:       level yang memulai modul baru
  lang:          bahasa kode default
  qa:            (opsional) {"mode": "bold-numbered"|"heading", "level": 3, "prefix": "R"}
"""
import json
import re
import sys

from docx import Document
from docx.oxml.ns import qn

MONO_FONTS = ('courier', 'consolas', 'mono', 'menlo', 'monaco', 'source code')
SKIP_HEADINGS = re.compile(r'^(daftar isi|table of contents|isi)$', re.I)
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'


def is_on(el):
    if el is None:
        return False
    v = el.get(qn('w:val'))
    return v not in ('0', 'false', 'none')


class Ctx:
    def __init__(self, doc):
        self.doc = doc
        self.rels = {r.rId: r.target_ref for r in doc.part.rels.values() if r.is_external}
        self.num_fmt = {}
        try:
            numbering = doc.part.numbering_part.element
            abstract = {}
            for an in numbering.findall(qn('w:abstractNum')):
                aid = an.get(qn('w:abstractNumId'))
                lv = {}
                for l in an.findall(qn('w:lvl')):
                    fmt = l.find(qn('w:numFmt'))
                    lv[l.get(qn('w:ilvl'))] = fmt.get(qn('w:val')) if fmt is not None else 'bullet'
                abstract[aid] = lv
            for n in numbering.findall(qn('w:num')):
                aid = n.find(qn('w:abstractNumId')).get(qn('w:val'))
                self.num_fmt[n.get(qn('w:numId'))] = abstract.get(aid, {})
        except Exception:
            pass
        # font & bold dari style paragraf/karakter
        self.style_mono = set()
        self.style_bold = set()
        for s in doc.styles:
            try:
                f = s.font
                if f is not None and f.name and any(m in f.name.lower() for m in MONO_FONTS):
                    self.style_mono.add(s.style_id)
                if f is not None and f.bold:
                    self.style_bold.add(s.style_id)
            except Exception:
                pass
        self.style_mono.update({'SourceCode', 'VerbatimChar', 'HTMLCode', 'HTMLPreformatted'})


def run_props(r, ctx, pmono, pbold):
    rpr = r.find(qn('w:rPr'))
    mono, bold, ital = pmono, pbold, False
    if rpr is not None:
        f = rpr.find(qn('w:rFonts'))
        if f is not None:
            name = (f.get(qn('w:ascii')) or f.get(qn('w:hAnsi')) or '').lower()
            if name:
                mono = any(m in name for m in MONO_FONTS)
        rs = rpr.find(qn('w:rStyle'))
        if rs is not None:
            sid = rs.get(qn('w:val'))
            if sid in ctx.style_mono or sid.endswith('Tok'):
                mono = True
            if sid in ('Strong',) or sid in ctx.style_bold:
                bold = True
        b = rpr.find(qn('w:b'))
        if b is not None:
            bold = is_on(b)
        i = rpr.find(qn('w:i'))
        if i is not None:
            ital = is_on(i)
    return mono, bold, ital


def run_size(r):
    rpr = r.find(qn('w:rPr'))
    if rpr is None:
        return None
    sz = rpr.find(qn('w:sz'))
    return int(sz.get(qn('w:val'))) if sz is not None else None


def para_info(p, ctx):
    ppr = p.find(qn('w:pPr'))
    style = ''
    num = None
    if ppr is not None:
        ps = ppr.find(qn('w:pStyle'))
        if ps is not None:
            style = ps.get(qn('w:val'))
        np_ = ppr.find(qn('w:numPr'))
        if np_ is not None:
            nid = np_.find(qn('w:numId'))
            il = np_.find(qn('w:ilvl'))
            if nid is not None and nid.get(qn('w:val')) != '0':
                num = (nid.get(qn('w:val')), il.get(qn('w:val')) if il is not None else '0')
    pmono = style in ctx.style_mono
    pbold = style in ctx.style_bold
    segs = []  # (text, mono, bold, ital, link)
    sizes = []

    def walk(node, link=None):
        for ch in node:
            tag = ch.tag
            if tag == qn('w:r'):
                mono, bold, ital = run_props(ch, ctx, pmono, pbold)
                s = run_size(ch)
                txt = ''
                for x in ch:
                    if x.tag == qn('w:t'):
                        txt += x.text or ''
                    elif x.tag == qn('w:tab'):
                        txt += '\t'
                    elif x.tag in (qn('w:br'), qn('w:cr')):
                        if x.get(qn('w:type')) != 'page':
                            txt += '\n'
                if txt:
                    segs.append([txt, mono, bold, ital, link])
                    if txt.strip() and s:
                        sizes.append(s)
            elif tag == qn('w:hyperlink'):
                rid = ch.get('{%s}id' % R_NS)
                walk(ch, ctx.rels.get(rid) if rid else None)
            elif tag in (qn('w:smartTag'), qn('w:ins'), qn('w:sdt'), qn('w:sdtContent'), qn('w:fldSimple')):
                walk(ch, link)

    walk(p)
    text = ''.join(s[0] for s in segs)
    vis = [s for s in segs if s[0].strip()]
    tot = sum(len(s[0].strip()) for s in vis) or 1
    mono_r = sum(len(s[0].strip()) for s in vis if s[1]) / tot
    bold_r = sum(len(s[0].strip()) for s in vis if s[2]) / tot
    return {
        'style': style,
        'num': num,
        'segs': segs,
        'text': text,
        'mono': mono_r,
        'bold': bold_r,
        'size': max(sizes) if sizes else None,
        'pmono': pmono,
    }


ESC = re.compile(r'([\\*`\[\]])')


def esc(t):
    return ESC.sub(r'\\\1', t)


def inline(segs):
    """Segmen run → string inline markup (**b**, *i*, `c`, [t](u))."""
    merged = []
    for t, m, b, i, l in segs:
        if merged and merged[-1][1:] == [m, b, i, l]:
            merged[-1][0] += t
        else:
            merged.append([t, m, b, i, l])
    out = ''
    for t, m, b, i, l in merged:
        if not t:
            continue
        lead = len(t) - len(t.lstrip(' '))
        trail = len(t) - len(t.rstrip(' '))
        core = t.strip(' ')
        if not core:
            out += t
            continue
        if m and '`' not in core and '\n' not in core:
            s = f'`{core}`'
        else:
            def wrap(line):
                line_s = line.strip()
                if not line_s:
                    return line
                e = esc(line_s)
                if b:
                    return f'**{e}**'
                if i:
                    return f'*{e}*'
                return e
            s = '\n'.join(wrap(x) for x in core.split('\n'))
        if l and not m:
            s = f'[{s}]({l})'
        out += ' ' * lead + s + ' ' * trail
    out = out.replace('****', '')
    return out.strip()


def strip_markup(s):
    return re.sub(r'\\([\\*`\[\]])', r'\1', re.sub(r'(\*\*|`)', '', s))


# ───────────────────── deteksi bahasa kode ─────────────────────
def detect_lang(code, title, default):
    t = (title or '').lower()
    c = code
    first = c.lstrip().split('\n', 1)[0]
    if '├──' in c or '└──' in c:
        return 'text'
    if re.match(r'^\s*(#.*\n\s*)*(Feature|Scenario|Given|When|Then|Background):?\b', c):
        return 'text'
    yaml_lines = re.findall(r'^\s*[\w.-]+:(\s|$)', c, re.M)
    if len(yaml_lines) >= 2 and not re.search(r'[{};()]\s*$|=>|\breturn\b', c, re.M):
        return 'yaml'
    ext = re.search(r'\.(go|java|py|tsx?|jsx?|mjs|cjs|dart|ya?ml|json|proto|graphqls?|sql|html|s?css|kt|rs|tf)\b', t)
    if ext:
        e = ext.group(1)
        return {'go': 'go', 'java': 'java', 'kt': 'java', 'py': 'python', 'ts': 'ts', 'tsx': 'ts', 'js': 'js', 'jsx': 'js',
                'mjs': 'js', 'cjs': 'js', 'dart': 'dart', 'yml': 'yaml', 'yaml': 'yaml', 'json': 'json', 'proto': 'proto',
                'graphql': 'graphql', 'graphqls': 'graphql', 'sql': 'sql', 'html': 'html', 'css': 'css', 'scss': 'css',
                'rs': 'rust', 'tf': 'hcl'}[e]
    if re.search(r'terraform|\.tf\b', t) or re.search(r'^\s*(resource|provider|module|variable|output)\s+"', c, re.M):
        return 'hcl'
    if 'dockerfile' in t or re.search(r'^\s*FROM\s+\S+', c, re.M) and re.search(r'^\s*(RUN|COPY|CMD|WORKDIR|EXPOSE|ENTRYPOINT)\b', c, re.M):
        return 'docker'
    if re.search(r'compose|manifest|workflow|kubernetes|k8s', t) or (re.search(r'^\s*(apiVersion|kind|services|jobs|steps|spec|metadata):', c, re.M) and not re.search(r'[{};]\s*$', c, re.M)):
        return 'yaml'
    if re.search(r'terminal|shell|bash|\bcli\b', t) or re.match(r'^\s*(\$ |#!|npm |npx |pnpm |yarn |cargo |rustup |rustc |nest |eas |expo |k6 |terraform |argocd |psql |mysql |go (run|mod|get|build|test|install|vet|tool)\b|pip3? |python3? -m|uvicorn |docker |docker-compose |kubectl |minikube |helm |git |curl |mkdir |cd |brew |flutter |dart (run|pub|create)|ng |sudo |apt |export |protoc |django-admin|mvn |\./mvnw|gradle|\./gradlew|java -|ls |cat |echo |alembic |celery |gunicorn |poetry |wget |chmod |grpcurl |hey |wrk |golangci-lint )', c):
        return 'bash'
    if re.search(r'^\s*syntax\s*=\s*"proto3"', c, re.M) or re.search(r'^\s*(message|service)\s+\w+\s*\{', c, re.M) and re.search(r'=\s*\d+;', c):
        return 'proto'
    if re.match(r'^\s*(type|input|schema|extend type|enum|scalar|interface)\s+\w*\s*(implements \w+\s*)?\{', c) and not re.search(r'[;=]\s*$', c, re.M) or re.match(r'^\s*(query|mutation|subscription)\b[^{]*\{', c):
        return 'graphql'
    if re.match(r'^\s*(--.*\n\s*)*(SELECT|CREATE (TABLE|INDEX|UNIQUE)|INSERT INTO|UPDATE \w+ SET|DELETE FROM|ALTER TABLE|DROP TABLE|WITH \w+ AS)\b', c, re.I):
        return 'sql'
    if re.match(r'^\s*[\[{]', c) and re.search(r'"[\w-]+"\s*:', c) and not re.search(r'=>|function|const |import |def |=\s|;\s*$', c, re.M):
        return 'json'
    if re.match(r'^\s*<(!doctype|html|div|template|section|form|ul|ol|button|p|span|app-|ng-|main|header|nav|a |input|label|table|router-outlet|h\d|mat-|li|img|select|textarea|@if|@for)\b', c, re.I):
        return 'html'
    if re.match(r'^\s*([.#:@]?[\w-]+[\w\s.#:>,\[\]="-]*)\{\s*$', first) and re.search(r'^\s*[\w-]+\s*:\s*[^;]+;', c, re.M) and not re.search(r'\b(const|function|let|var|return|class|func|def)\b|=>', c):
        return 'css'
    specific = {
        'go': r'^\s*package \w+\s*$|\bfunc (\(\w+ \*?\w+\) )?\w+\(|\w+ := |\bfmt\.\w+\(|\berr != nil\b',
        'rust': r'\bfn \w+\(|\blet mut\b|println!\(|\bimpl\b|::new\(|\b(cargo|rustc)\b',
        'java': r'\b(public|private|protected) (static )?(final )?(abstract )?(class|interface|void|record|enum)\b|System\.out\.|@(RestController|Autowired|SpringBootApplication|Entity|Service|Repository|Override|Bean|Configuration)\b',
        'python': r'^\s*(async def |def \w+\(|from [\w.]+ import |class \w+(\([\w., ]*\))?:\s*$)|^\s*@(app|router|pytest)\.|\bself\.\w+',
        'dart': r'\b(Widget build|StatelessWidget|StatefulWidget|BuildContext|setState\(\(\)|ChangeNotifier|Future<\w+> \w+\(|late final)|\bvoid main\(\)',
        'ts': r'\binterface \w+ (extends [\w, <>]+ )?\{|\w\??: (string|number|boolean)\b|^\s*import .+ from [\'"]|\bReact\.|\buse(State|Effect|Memo|Callback|Ref)\b|@(Component|Injectable|Input|Output)\(|\bsignal\(|\bexport (const|function|default)\b',
        'js': r'require\(|module\.exports|^\s*import .+ from [\'"]|\bconsole\.log\(|\bexport (const|function|default)\b',
    }
    if default in specific:
        if re.search(specific[default], c, re.M):
            return default
        for lang in ('go', 'java', 'python', 'dart', 'rust'):
            if lang != default and re.search(specific[lang], c, re.M):
                return lang
        strong_ts = r'\w\??: (string|number|boolean)\b|^\s*import .+ from [\'"]|\bexport (const|function|default)\b|\bReact\.|\buse(State|Effect)\b|\bconsole\.log\(|\bconst \w+ = '
        if default not in ('ts', 'js') and re.search(strong_ts, c, re.M):
            return 'ts' if re.search(r'\w\??: (string|number|boolean)\b|\binterface \w+', c) else 'js'
        return default
    return default


# ───────────────────── tabel ─────────────────────
def cell_paras(tc, ctx):
    return [para_info(p, ctx) for p in tc.iter(qn('w:p'))]


def fill_of(tc):
    shd = tc.find('.//' + qn('w:shd'))
    return (shd.get(qn('w:fill')) or '').upper() if shd is not None else ''


def is_dark(hexv):
    if not re.fullmatch(r'[0-9A-F]{6}', hexv or ''):
        return False
    r, g, b = int(hexv[0:2], 16), int(hexv[2:4], 16), int(hexv[4:6], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) < 110


def mono_ratio(paras):
    vis = [p for p in paras if p['text'].strip()]
    if not vis:
        return 0
    tot = sum(len(p['text'].strip()) for p in vis)
    return sum(len(p['text'].strip()) * p['mono'] for p in vis) / (tot or 1)


TONE_RULES = [
    ('warn', r'peringatan|hati-hati|jebakan|awas|perhatian|warning|bahaya|⚠|pitfall|kesalahan umum|anti-pattern|jangan|red flag|caution'),
    ('success', r'checkpoint|✓|✅|kegunaan|kapan dipakai|best practice|praktik terbaik|ringkasan|rangkuman|hasil'),
    ('tip', r'tips?\b|💡|trik|pro tip|saran|bonus|latihan|catatan penting|ingat'),
    ('info', r'.'),
]


def tone_for(label):
    l = (label or '').lower()
    for tone, pat in TONE_RULES:
        if re.search(pat, l):
            return tone
    return 'info'


def clean_title(t):
    t = strip_markup(t).strip()
    t = re.sub(r'^[^\wÀ-ɏ(\["\'#]+', '', t)  # buang emoji/simbol di depan
    t = t.strip(' :.—-–')
    return t


def callout_from_paras(paras):
    paras = [p for p in paras if p['text'].strip()]
    if not paras:
        return None
    label = None
    title = None
    lines = []
    first = paras[0]
    ftxt = first['text'].strip()
    rest = paras
    # baris label tersendiri (mis. "TIPS", "KEGUNAAN & KAPAN DIPAKAI")
    if len(paras) > 1 and len(ftxt) <= 48 and (first['bold'] > 0.9 or ftxt.upper() == ftxt):
        label = clean_title(ftxt)
        rest = paras[1:]
    for k, p in enumerate(rest):
        segs = [list(s) for s in p['segs']]
        if k == 0:
            # judul = run tebal di awal paragraf
            lead = ''
            j = 0
            while j < len(segs) and (segs[j][2] or not segs[j][0].strip()):
                lead += segs[j][0]
                j += 1
            if lead.strip() and j < len(segs) and len(lead.strip()) <= 90:
                title = clean_title(lead)
                segs = segs[j:]
            elif lead.strip() and j == len(segs) and len(rest) > 1 and len(lead.strip()) <= 90:
                title = clean_title(lead)
                segs = []
        txt = inline(segs) if segs else ''
        if p['mono'] > 0.8 and txt:
            txt = '`' + strip_markup(txt) + '`' if '`' not in p['text'] else esc(p['text'])
        if p['num'] or p['style'] in ('ListBullet', 'ListParagraph'):
            txt = '• ' + txt
        if txt:
            lines.append(txt)
    if not title and label:
        title, label = label, None
    tone = tone_for(f'{label or ""} {title or ""}')
    text = '\n'.join(lines).strip()
    if not text and title:
        text, title = title, None
    if not text:
        return None
    b = {'type': 'callout', 'tone': tone, 'text': text}
    if title:
        b['title'] = title
    return b


def code_from_paras(paras, title, default_lang):
    # Judul di baris pertama sel kode (tebal, pendek), mis. "Postman — tab Tests (JavaScript)"
    vis = [p for p in paras if p['text'].strip()]
    if not title and len(vis) > 1 and vis[0]['bold'] > 0.9 and len(vis[0]['text'].strip()) < 80 \
            and not any(p['bold'] > 0.9 for p in vis[1:3]):
        title = vis[0]['text'].strip()
        paras = paras[paras.index(vis[0]) + 1:]
    lines = [p['text'].replace('\t', '    ').rstrip() for p in paras]
    code = '\n'.join(lines).strip('\n')
    # buang indentasi minimum
    ls = code.split('\n')
    ind = [len(l) - len(l.lstrip(' ')) for l in ls if l.strip()]
    m = min(ind) if ind else 0
    if m:
        code = '\n'.join(l[m:] for l in ls)
    b = {'type': 'code', 'lang': detect_lang(code, title, default_lang), 'code': code}
    if title:
        b['title'] = clean_title(title) or title
    return b


def table_blocks(tbl, ctx, default_lang):
    rows = tbl.findall(qn('w:tr'))
    out = []
    data_rows = []  # [[(paras, fill)]]

    def flush_table():
        nonlocal data_rows
        if not data_rows:
            return
        ncol = max(len(r) for r in data_rows)
        first = data_rows[0]
        head_like = all(
            (sum(1 for p in c[0] if p['text'].strip()) <= 2) and (
                all(p['bold'] > 0.8 for p in c[0] if p['text'].strip()) or is_dark(c[1]))
            for c in first if any(p['text'].strip() for p in c[0])
        )
        def cell_txt(c):
            parts = []
            for p in c[0]:
                t = inline(p['segs']) if p['text'].strip() else ''
                if p['mono'] > 0.8 and t and '`' not in p['text']:
                    t = '`' + p['text'].strip() + '`'
                if t:
                    parts.append(t)
            return '\n'.join(parts)
        rows_txt = [[cell_txt(c) for c in r] + [''] * (ncol - len(r)) for r in data_rows]
        if not head_like and len(rows_txt) >= 3 and all(x and len(x) <= 32 and not re.search(r'[`*]', x) for x in rows_txt[0]):
            head_like = True
        if head_like and len(rows_txt) > 1:
            head = [strip_markup(x) for x in rows_txt[0]]
            body = rows_txt[1:]
        else:
            head, body = [], rows_txt
        out.append({'type': 'table', 'head': head, 'rows': body})
        data_rows = []

    i = 0
    while i < len(rows):
        tcs = rows[i].findall(qn('w:tc'))
        if len(tcs) == 1:
            flush_table()
            paras = cell_paras(tcs[0], ctx)
            nonempty = [p for p in paras if p['text'].strip()]
            if not nonempty:
                i += 1
                continue
            mr = mono_ratio(paras)
            # judul untuk kode di baris berikutnya
            def gather(j):
                """Kumpulkan baris satu-sel berikutnya yang berisi kode (atau baris kosong di dalam kode)."""
                acc = []
                while j < len(rows):
                    tc2 = rows[j].findall(qn('w:tc'))
                    if len(tc2) != 1:
                        break
                    ps2 = cell_paras(tc2[0], ctx)
                    if mono_ratio(ps2) > 0.6 or not any(p_['text'].strip() for p_ in ps2):
                        acc.extend(ps2)
                        j += 1
                    else:
                        break
                return acc, j
            if len(nonempty) == 1 and len(nonempty[0]['text'].strip()) < 110 and i + 1 < len(rows):
                nxt = rows[i + 1].findall(qn('w:tc'))
                if len(nxt) == 1:
                    np_ = cell_paras(nxt[0], ctx)
                    if mono_ratio(np_) > 0.6 and (nonempty[0]['bold'] > 0.6 or is_dark(fill_of(tcs[0])) or nonempty[0]['mono'] > 0.8):
                        acc, j = gather(i + 1)
                        while acc and not acc[-1]['text'].strip():
                            acc.pop()
                        out.append(code_from_paras(acc, nonempty[0]['text'].strip(), default_lang))
                        i = j
                        continue
            if mr > 0.6:
                acc, j = gather(i)
                while acc and not acc[-1]['text'].strip():
                    acc.pop()
                out.append(code_from_paras(acc, None, default_lang))
                i = j
                continue
            else:
                c = callout_from_paras(paras)
                if c:
                    out.append(c)
        else:
            data_rows.append([(cell_paras(tc, ctx), fill_of(tc)) for tc in tcs])
        i += 1
    flush_table()
    return out


# ───────────────────── konversi utama ─────────────────────
def convert(path, cfg):
    doc = Document(path)
    ctx = Ctx(doc)
    levels = cfg.get('levels', {'Heading1': 1, 'Heading2': 2, 'Heading3': 3, 'Heading4': 4})
    size_levels = {int(k): v for k, v in cfg.get('size_levels', {}).items()}
    chapter = cfg.get('chapter', 1)
    lang = cfg.get('lang', 'text')
    part_min_size = cfg.get('part_min_size', 40)

    chapters = []
    preface = []
    skipped = []
    cur = None
    part = None
    skip_level = None
    pending_part = []

    items = list(doc.element.body.iterchildren())

    def target():
        return cur['blocks'] if cur else preface

    code_buf = []
    list_buf = None  # {'type':'list','ordered':bool,'items':[]}
    quote_open = False

    def flush_code():
        nonlocal code_buf
        while code_buf and not code_buf[-1]['text'].strip():
            code_buf.pop()
        if code_buf:
            target().append(code_from_paras(code_buf, None, lang))
        code_buf = []

    def flush_list():
        nonlocal list_buf
        if list_buf and list_buf['items']:
            target().append(list_buf)
        list_buf = None

    def flush_all():
        nonlocal quote_open
        flush_code()
        flush_list()
        quote_open = False

    def heading_level(info):
        st = info['style']
        if st in levels:
            return levels[st]
        if st == 'Title':
            return 0
        t = info['text'].strip()
        if size_levels and info['bold'] > 0.9 and info['size'] and len(t) < 140 and '\n' not in t:
            return size_levels.get(info['size'])
        return None

    pending_title = None
    for idx, el in enumerate(items):
        if el.tag == qn('w:tbl'):
            if skip_level is not None:
                for tc in el.iter(qn('w:tc')):
                    t = ' '.join(para_info(p_, ctx)['text'] for p_ in tc.iter(qn('w:p'))).strip()
                    if t:
                        skipped.append(t)
                continue
            flush_all()
            tb = table_blocks(el, ctx, lang)
            if pending_title and tb and tb[0]['type'] == 'code' and not tb[0].get('title'):
                tb[0]['title'] = pending_title
                tb[0]['lang'] = detect_lang(tb[0]['code'], pending_title, lang)
            pending_title = None
            target().extend(tb)
            continue
        if el.tag == qn('w:p') and pending_title and para_info(el, ctx)['text'].strip():
            pending_title = None
        if el.tag != qn('w:p'):
            continue
        info = para_info(el, ctx)
        txt = info['text']
        lvl = heading_level(info) if txt.strip() else None

        if lvl is not None and lvl >= 0:
            title = clean_title(txt.replace('\n', ' '))
            if skip_level is not None and lvl <= skip_level:
                skip_level = None
            if skip_level is not None:
                skipped.append(txt.strip())
                continue
            flush_all()
            if SKIP_HEADINGS.match(title):
                skipped.append(txt.strip())
                skip_level = lvl
                continue
            if lvl == 0 or lvl < chapter:
                part = title
                skipped.append(txt.strip())
                continue
            if lvl == chapter:
                cur = {'title': title, 'part': part, 'blocks': []}
                chapters.append(cur)
                continue
            target().append({'type': 'h', 'text': title, 'level': 3 if lvl == chapter + 1 else 4})
            continue

        if skip_level is not None:
            if txt.strip():
                skipped.append(txt.strip())
            continue

        if cfg.get('qa_size') and info['bold'] > 0.9 and info['size'] == cfg['qa_size'] and re.match(r'^\s*\d+[.)]\s', txt):
            flush_all()
            target().append({'type': 'qmark', 'text': inline(info['segs']).replace('\n', ' ')})
            continue

        # paragraf "BAGIAN" besar (bold, ukuran besar) → penanda part
        if info['bold'] > 0.9 and info['size'] and info['size'] >= part_min_size and len(txt.strip()) < 90:
            flush_all()
            t = clean_title(txt)
            skipped.append(txt.strip())
            if re.match(r'^(bagian|part)\s+[ivx\d]+$', t, re.I):
                pending_part = [t]
            else:
                part = (pending_part[0] + ' — ' + t) if pending_part else t
                pending_part = []
            continue

        # Paragraf mono+tebal pendek tepat sebelum tabel kode = judul kode
        if info['mono'] > 0.8 and info['bold'] > 0.9 and len(txt.strip()) < 80 and not code_buf:
            nxt = next((x for x in items[idx + 1:] if x.tag != qn('w:p') or para_info(x, ctx)['text'].strip()), None)
            if nxt is not None and nxt.tag == qn('w:tbl'):
                flush_all()
                pending_title = txt.strip()
                continue

        is_code = info['pmono'] or info['mono'] > 0.8 and txt.strip()
        if not txt.strip():
            if code_buf:
                code_buf.append(info)  # baris kosong di dalam kode
            else:
                flush_list()
            continue
        if is_code:
            flush_list()
            if info['style'] == 'SourceCode':
                flush_code()
                target().append(code_from_paras([info], None, lang))
            else:
                code_buf.append(info)
            continue
        flush_code()

        is_list = info['num'] is not None or info['style'] in ('ListBullet', 'ListNumber', 'ListParagraph', 'Compact')
        if is_list:
            ordered = False
            if info['num']:
                fmt = ctx.num_fmt.get(info['num'][0], {}).get(info['num'][1], 'bullet')
                ordered = fmt not in ('bullet', 'none')
            if info['style'] == 'ListNumber':
                ordered = True
            if list_buf is None or list_buf['ordered'] != ordered:
                flush_list()
                list_buf = {'type': 'list', 'ordered': ordered, 'items': []}
            list_buf['items'].append(inline(info['segs']).replace('\n', ' '))
            continue
        flush_list()

        if info['style'] in ('BlockText', 'Quote', 'IntenseQuote'):
            c = callout_from_paras([info])
            if c:
                blocks = target()
                if quote_open and 'title' not in c and blocks and blocks[-1]['type'] == 'callout':
                    blocks[-1]['text'] += '\n' + c['text']
                else:
                    blocks.append(c)
                    quote_open = True
            continue
        quote_open = False

        # paragraf biasa; pecah pola "Judul:\n- a\n- b" atau "teks: - a - b"
        md = inline(info['segs'])
        lines = md.split('\n')

        def unwrap(l):
            mm = re.match(r'^(\*{1,3})(.*?)(\1)$', l.strip())
            return mm.group(2) if mm else l.strip()

        is_item = lambda l: re.match(r'^\s*(\\-|-|•)\s+', unwrap(l))
        if len(lines) > 1 and sum(1 for l in lines if is_item(l)) >= 2:
            intro = [unwrap(l) for l in lines if not is_item(l) and l.strip()]
            items_ = [re.sub(r'^\s*(\\-|-|•)\s+', '', unwrap(l)) for l in lines if is_item(l)]
            if intro:
                target().append({'type': 'p', 'text': '\n'.join(intro)})
            target().append({'type': 'list', 'items': items_})
            continue
        m = re.match(r'^(.{3,160}?:)\s+-\s+(.+)$', md.replace('\n', ' '))
        if m and m.group(2).count(' - ') >= 1:
            parts = [x.strip() for x in m.group(2).split(' - ') if x.strip()]
            target().append({'type': 'p', 'text': m.group(1)})
            target().append({'type': 'list', 'items': parts})
            continue
        lab = re.match(r'^\*\*([^*]{2,40}?):?\*\*:?\s+(.+)$', md, re.S)
        if lab and re.match(r'^(catatan|tips?|penting|peringatan|perhatian|ingat|info|hati-hati|note|warning|pro tip|kesimpulan|ringkasan)\b', lab.group(1).strip(), re.I):
            target().append({'type': 'callout', 'tone': tone_for(lab.group(1)), 'title': lab.group(1).strip(' :'), 'text': lab.group(2).strip()})
            continue
        b = {'type': 'p', 'text': md}
        # paragraf tebal pendek tanpa style heading → sub-judul
        if info['bold'] > 0.95 and len(txt.strip()) < 90 and not txt.strip().endswith('.') and '\n' not in txt.strip():
            b = {'type': 'h', 'text': clean_title(txt), 'level': 4}
        target().append(b)

    flush_all()
    return {'preface': preface, 'chapters': chapters, 'skipped': skipped, 'raw': raw_lines(doc)}


def raw_lines(doc):
    """Semua baris teks di badan dokumen (paragraf & sel tabel), untuk pemeriksaan cakupan akhir."""
    out = []
    for el in doc.element.body.iter():
        if el.tag != qn('w:p'):
            continue
        t = ''
        for node in el.iter():
            if node.tag == qn('w:t'):
                t += node.text or ''
            elif node.tag in (qn('w:br'), qn('w:cr')):
                t += '\n'
            elif node.tag == qn('w:tab'):
                t += ' '
        out.extend(x.strip() for x in t.split('\n') if x.strip())
    return out


if __name__ == '__main__':
    path = sys.argv[1]
    cfg = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    res = convert(path, cfg)
    json.dump(res, sys.stdout, ensure_ascii=False, indent=1)
