"""Konversi halaman HTML (materi awal) → bab & blok playbook, untuk arsip & audit.

Bab baru dimulai di setiap <h1>/<h2>; <h3>/<h4>/<summary> menjadi sub-judul,
<p> paragraf, <ul>/<ol> daftar, <pre> kode, <table> tabel, dan elemen teks lain paragraf.
Pemakaian: python3 -I html2blocks.py file.html > out.json
"""
import json
import re
import sys

import lxml.html

INLINE = {'strong', 'b', 'em', 'i', 'code', 'a', 'small', 'sup', 'sub', 'u', 'mark', 'kbd', 'br'}
BLOCKY = {'div', 'p', 'ul', 'ol', 'table', 'pre', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'details',
          'summary', 'header', 'main', 'aside', 'nav', 'article', 'li', 'tr', 'td', 'th', 'thead', 'tbody', 'blockquote'}
ESC = re.compile(r'([\\*`\[\]])')


def esc(t):
    return ESC.sub(r'\\\1', t)


def squash(t):
    return re.sub(r'\s+', ' ', t).strip()


def inline(el):
    """Teks elemen dengan markup inline; anak span/div tanpa teks penghubung dipisah ' — '."""
    parts = []
    if el.text:
        parts.append(esc(el.text))
    kids = [c for c in el if isinstance(c.tag, str)]
    joiner_needed = not (el.text or '').strip() and all(not (c.tail or '').strip() for c in kids) and len(kids) > 1 \
        and all(c.tag in ('span', 'div') for c in kids)
    for i, c in enumerate(kids):
        t = inline(c)
        if c.tag in ('strong', 'b') and t.strip():
            t = f'**{t.strip()}**'
        elif c.tag in ('em', 'i') and t.strip():
            t = f'*{t.strip()}*'
        elif c.tag == 'code' and t.strip():
            t = f'`{c.text_content().strip()}`'
        elif c.tag == 'br':
            t = '\n'
        if joiner_needed and i > 0:
            parts.append(' — ')
        elif c.tag in ('span', 'div') and parts and not parts[-1].endswith((' ', '\n')):
            parts.append(' ')
        parts.append(t)
        if c.tail:
            parts.append(esc(c.tail))
    return re.sub(r'[ \t]+', ' ', ''.join(parts)).replace(' \n', '\n').strip()


def convert(path):
    root = lxml.html.fromstring(open(path, encoding='utf-8').read())
    for bad in root.xpath('//script|//style|//head'):
        bad.drop_tree()
    chapters = []
    preface = []
    cur = None

    def target():
        return cur['blocks'] if cur else preface

    def walk(el):
        nonlocal cur
        tag = el.tag if isinstance(el.tag, str) else ''
        if not tag:
            return
        if tag in ('h1', 'h2'):
            cur = {'title': squash(el.text_content()), 'part': None, 'blocks': []}
            chapters.append(cur)
            return
        if tag in ('h3', 'h4', 'h5', 'h6', 'summary'):
            t = squash(el.text_content()).rstrip('▶ ').strip()
            if t:
                target().append({'type': 'h', 'text': esc(t), 'level': 3 if tag == 'h3' else 4})
            return
        if tag == 'pre':
            code = el.text_content().strip('\n')
            if code.strip():
                lang = 'java' if re.search(r'\b(public|class|void|int|return)\b', code) else 'bash'
                target().append({'type': 'code', 'lang': lang, 'code': code})
            return
        if tag in ('ul', 'ol'):
            items = []
            for li in el.xpath('./li'):
                sub = li.xpath('./ul|./ol')
                for s in sub:
                    s.getparent().remove(s)
                t = inline(li)
                if t:
                    items.append(t)
                for s in sub:
                    items += [inline(x) for x in s.xpath('.//li') if inline(x)]
            if items:
                b = {'type': 'list', 'items': items}
                if tag == 'ol':
                    b['ordered'] = True
                target().append(b)
            return
        if tag == 'table':
            head = [squash(th.text_content()) for th in el.xpath('.//thead//th')]
            rows = [[inline(td) for td in tr.xpath('./td|./th')] for tr in el.xpath('.//tbody/tr') or el.xpath('.//tr')]
            rows = [r for r in rows if any(r) and r != head]
            target().append({'type': 'table', 'head': head, 'rows': rows})
            return
        if tag == 'p' or (tag in ('div', 'span', 'blockquote', 'header', 'li', 'td', 'a')
                          and not any(isinstance(c.tag, str) and c.tag in BLOCKY for c in el)):
            t = inline(el)
            if t:
                target().append({'type': 'p', 'text': t})
            return
        if (el.text or '').strip():
            target().append({'type': 'p', 'text': esc(squash(el.text))})
        for c in el:
            walk(c)
            if isinstance(c.tag, str) and (c.tail or '').strip():
                target().append({'type': 'p', 'text': esc(squash(c.tail))})

    walk(root.find('body') if root.find('body') is not None else root)
    title = root.xpath('//title')
    return {'preface': preface, 'chapters': chapters, 'skipped': [], 'raw': []}


if __name__ == '__main__':
    json.dump(convert(sys.argv[1]), sys.stdout, ensure_ascii=False, indent=1)
