"""Import the four English handouts, preserving every source page and its text.

Usage: python tools/import-english-foundations.py C:/Users/name/Downloads
Requires pdfplumber, pypdfium2, and Pillow. Curated lessons live separately in
src/data/english-foundations.ts so reimporting does not overwrite them.
"""
import json
import sys
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ('Materi 1 __ PARTS OF SPEECH.pdf', 'parts-of-speech', ['english-parts-noun-pronoun-verb', 'english-adjectives-adverbs', 'english-function-words']),
    ('Materi 2 __ PHRASE, CLAUSE, AND SENTENCE.pdf', 'phrase-clause-sentence', ['english-sentence-structure']),
    ('Materi 3 __ SENTENCE STRUCTURE.pdf', 'sentence-structure', ['english-sentence-structure']),
    ('Materi 4 __ SUPERLATIVE & ORDINAL ADJECTIVES.pdf', 'superlative-ordinal', ['english-superlative-ordinal']),
]


def main():
    source_dir = Path(sys.argv[1])
    output = ROOT / 'public/media/english-foundations'
    output.mkdir(parents=True, exist_ok=True)
    documents = []
    for filename, slug, modules in SOURCES:
        path = source_dir / filename
        renderer = pdfium.PdfDocument(path)
        pages = []
        with pdfplumber.open(path) as pdf:
            for index, page in enumerate(pdf.pages):
                name = f'{slug}-{index + 1:02}.webp'
                rendered_page = renderer[index]
                bitmap = rendered_page.render(scale=1.5)
                image = bitmap.to_pil()
                image.save(output / name, 'WEBP', quality=88)
                pages.append({'page': index + 1, 'text': page.extract_text() or '',
                              'src': f'media/english-foundations/{name}'})
                image.close()
                bitmap.close()
                rendered_page.close()
        renderer.close()
        assert all(p['text'].strip() for p in pages), f'Empty source text: {filename}'
        documents.append({'filename': filename, 'slug': slug, 'modules': modules, 'pages': pages})
        print(f'{filename}: {len(pages)} pages preserved')
    (ROOT / 'src/data/english-foundations-source.json').write_text(
        json.dumps(documents, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
