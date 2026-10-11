import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const file of ['playbook.html', 'dist-single/index.html']) {
    const context = await browser.newContext();
    // Pastikan materi lokal tidak bergantung pada koneksi internet.
    await context.route(/^https?:/, (route) => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const url = pathToFileURL(resolve(file)).href;
    await page.goto(`${url}#java.boruvka-s-algorithm`, { waitUntil: 'domcontentloaded' });
    const image = page.locator('.reading-content .figure img').first();
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector('.reading-content .figure img');
      return image?.complete && image.naturalWidth > 0;
    });
    await page.goto(`${url}#llm.program`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Perbesar gambar:/ }).first().click();
    await page.waitForFunction(() => {
      const image = document.querySelector('dialog img');
      return image?.complete && image.naturalWidth > 0;
    });
    await page.getByRole('button', { name: 'Tutup gambar' }).click();
    await page.goto(`${url}#java.persiapan-tools-mindset/section-2`, { waitUntil: 'domcontentloaded' });
    await page.locator('#section-2').waitFor();
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log(`${file}: offline navigation, media files, embedded images, and image enlargement OK.`);
    await context.close();
  }
} finally { await browser.close(); }
