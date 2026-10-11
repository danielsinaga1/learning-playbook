import { readFileSync, writeFileSync } from 'node:fs';

// Di root repo, gambar tersedia di public/media. Di dist-single, tetap media/.
const html = readFileSync('dist-single/index.html', 'utf8')
  .replace(/(["'`])media\//g, '$1public/media/')
  .replace('href="./favicon.svg"', 'href="./public/favicon.svg"');
writeFileSync('playbook.html', html);
console.log('playbook.html updated; keep public/media next to the project.');
