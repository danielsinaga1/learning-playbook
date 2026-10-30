import { expect, test } from '@playwright/test';

test('fondasi English: struktur gabungan, latihan, dan arsip halaman sumber', async ({ page }) => {
  await page.goto('/#english.english-sentence-structure');
  await expect(page.locator('.reader-sheet h1')).toHaveText('Phrase, Clause & Sentence Structure');
  await expect(page.getByRole('heading', { name: 'Empat jenis sentence structure', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Lihat halaman asli & teks lengkap Materi 3/ }).click();
  await expect(page).toHaveURL(/#english\.arsip-english-sentence-structure$/);
  await page.getByText('Lihat halaman asli 1', { exact: true }).click();
  const image = page.locator('.reading-content img').first();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  await page.getByRole('link', { name: 'Phrase, Clause & Sentence Structure', exact: true }).last().click();
  await expect(page.locator('.reader-sheet h1')).toHaveText('Phrase, Clause & Sentence Structure');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('jalur AI Engineer dan pelajaran tambahan per bahasa tampil tanpa error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const lessons: [string, string][] = [
    ['#llm.aie-langgraph-memory-hitl', 'AI Engineer: LangGraph — Memory & Human-in-the-Loop'],
    ['#java.java-records-sealed-pattern', 'Java Modern: Records, Sealed Class & Pattern Matching'],
    ['#go.go-pgx-sqlc', 'Database Type-Safe: pgx, sqlc & Migrasi goose'],
    ['#js.node-event-loop', 'Node.js: Event Loop, Promise & Async Mendalam'],
    ['#python.py-fondasi-bahasa', 'Python: Fondasi Bahasa & Koleksi'],
    ['#rust.rust-ownership-borrowing', 'Rust: Ownership, Borrowing & Lifetime'],
    ['#flutter.dart3-records-patterns-sealed', 'Dart 3 Mendalam: Records, Patterns & Sealed Class'],
    ['#js.js-fungsi-closure', 'JavaScript: Fungsi, Scope & Closure'],
    ['#js.ts-setup-tipe-dasar', 'TypeScript: Setup, tsc & Tipe Dasar'],
    ['#rust.rust-closure-iterator', 'Rust: Closure & Iterator Mendalam'],
    ['#python.py-pytest-mendalam', 'Python: pytest Mendalam'],
    ['#kotlin.kt-setup-dasar', 'Kotlin: Setup & Sintaks Dasar'],
    ['#csharp.cs-setup-dasar', 'C#: Setup .NET & Dasar Bahasa'],
    ['#tools.git-konsep-dasar', 'Git: Konsep Dasar & Commit yang Baik'],
    ['#js.css-flexbox-grid', 'CSS: Layout dengan Flexbox & Grid'],
    ['#web.sec-injection', 'Injection: SQL, Command & Path Traversal'],
    ['#interview.sd-rate-limiter', 'Studi Kasus: Design Rate Limiter'],
  ];
  for (const [hash, title] of lessons) {
    await page.goto('/' + hash);
    await expect(page.locator('.reader-sheet h1')).toHaveText(title);
    await expect(page.locator('.reading-content pre').first()).toBeVisible();
  }
  await page.goto('/#python');
  await expect(page.getByText('Python Inti', { exact: true }).first()).toBeVisible();
  await page.goto('/#interview.iv-go');
  await expect(page.locator('.reader-sheet h1')).toHaveText('Interview Go');
  await expect(page.locator('section.qa').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('jalur belajar: rute per tujuan menautkan ke modul bahasa', async ({ page }) => {
  await page.goto('/#jalur.jalur-per-tujuan');
  await expect(page.locator('.reader-sheet h1')).toHaveText('Jalur per Tujuan Karier');
  await page.getByRole('tab', { name: 'Enterprise (.NET)' }).click();
  await page.getByRole('link', { name: 'Minimal API', exact: true }).click();
  await expect(page).toHaveURL(/#csharp\.cs-aspnet-minimal-api$/);
  await expect(page.locator('.reading-content pre').first()).toBeVisible();
  await page.goto('/#jalur.jalur-fase-1-java-backend');
  await page.getByRole('link', { name: 'Git: Konsep Dasar', exact: true }).click();
  await expect(page).toHaveURL(/#tools\.git-konsep-dasar$/);
});

test('progres dapat diekspor, direset, lalu diimpor kembali', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Di ponsel sidebar berupa laci tertutup; alur yang sama diuji di desktop.');
  await page.goto('/#tools.git-konsep-dasar');
  await page.getByRole('button', { name: 'Tandai modul ini selesai' }).click();
  const rail = page.locator('.rail');
  const [download] = await Promise.all([page.waitForEvent('download'), rail.getByRole('button', { name: 'Ekspor', exact: true }).click()]);
  expect(download.suggestedFilename()).toMatch(/^playbook-progres-\d{4}-\d{2}-\d{2}\.json$/);
  const backup = testInfo.outputPath('progres.json');
  await download.saveAs(backup);

  await rail.getByRole('button', { name: 'Reset progres' }).click();
  await rail.getByRole('button', { name: 'Ya, reset' }).click();
  await expect(page.locator('.done-btn')).toHaveAttribute('aria-pressed', 'false');

  await rail.getByLabel('Pilih file cadangan progres').setInputFiles(backup);
  await expect(rail.getByRole('status')).toHaveText(/Dipulihkan: 1 modul/);
  await expect(page.locator('.done-btn')).toHaveAttribute('aria-pressed', 'true');

  await rail.getByLabel('Pilih file cadangan progres').setInputFiles({ name: 'salah.json', mimeType: 'application/json', buffer: Buffer.from('{"done":{}}') });
  await expect(rail.getByRole('status')).toHaveText('File ini bukan cadangan progres Backend Playbook.');
});

test('beranda, filter kurikulum, navigasi, dan progres tersimpan', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.c-card')).toHaveCount(19);
  await page.getByRole('searchbox', { name: 'Cari kurikulum', exact: true }).fill('Rust');
  const rust = page.locator('.c-card').filter({ has: page.getByRole('heading', { name: 'Rust', exact: true }) });
  await expect(rust).toBeVisible();
  await rust.locator('.c-card-cta').click();
  await expect(page.locator('.reader-sheet h1')).toBeVisible();
  await page.getByRole('button', { name: 'Tandai modul ini selesai' }).click();
  await page.reload();
  await expect(page.locator('.done-btn')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/');
  await page.getByRole('button', { name: 'Sedang dipelajari', exact: true }).click();
  await expect(page.locator('.c-card')).toHaveCount(1);
  await expect(page.locator('.c-card h3')).toHaveText('Rust');
});

test('tautan daftar isi dapat dibuka ulang dan navigasi browser bekerja', async ({ page }) => {
  await page.goto('/#java.persiapan-tools-mindset');
  const details = page.locator('.contents');
  if (!await details.evaluate((el: HTMLDetailsElement) => el.open)) await details.locator('summary').click();
  const section = page.getByRole('link', { name: 'Struktur proyek Maven (wajib hafal)', exact: true });
  await section.click();
  await expect(page).toHaveURL(/\/section-\d+$/);
  const id = new URL(page.url()).hash.split('/')[1];
  await expect(page.locator(`#${id}`)).toBeInViewport();
  await page.reload();
  await expect(page.locator(`#${id}`)).toBeInViewport();
  await page.locator('.reader-back').click();
  await expect(page).toHaveURL(/#java$/);
  await page.goBack();
  await expect(page.locator(`#${id}`)).toBeInViewport();
});

test('ukuran teks, mode fokus, tema, dan tata letak tanpa luapan', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#java.persiapan-tools-mindset');
  await page.getByRole('combobox', { name: 'Ukuran teks materi' }).selectOption('large');
  await expect(page.locator('.reading-content')).toHaveCSS('font-size', '20px');
  await page.getByRole('button', { name: 'Mode fokus', exact: true }).click();
  await expect(page.locator('.rail')).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Keluar fokus' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('combobox', { name: 'Ukuran teks materi' })).toHaveValue('large');
  await page.getByRole('button', { name: 'Keluar fokus' }).click();
  await page.getByRole('button', { name: /Tema: sistem/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /Tema: terang/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('pencarian menuju pertanyaan, dapat dimuat ulang, dan ditutup dengan keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cari materi', exact: true }).click();
  await page.getByRole('combobox', { name: 'Kata kunci pencarian' }).fill('J-01');
  const result = page.getByRole('option').filter({ has: page.locator('.sr-kind', { hasText: 'Pertanyaan' }) }).first();
  await expect(result).toBeVisible();
  await result.getByRole('button').click();
  await expect(page).toHaveURL(/\/q-J-01$/);
  await expect(page.locator('#q-J-01')).toHaveClass(/is-open/);
  await page.reload();
  await expect(page.locator('#q-J-01')).toHaveClass(/is-open/);
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('tautan kurikulum lama diarahkan ke modul baru', async ({ page }) => {
  await page.goto('/#ai.data-infrastructure');
  await expect(page).toHaveURL(/#llm\.hacktiv8-data-infrastructure$/);
  await expect(page.locator('.reader-sheet h1')).toBeVisible();
});

test('gambar materi dapat diperbesar dan ditutup', async ({ page }) => {
  await page.goto('/#llm.program');
  await page.getByRole('button', { name: /Perbesar gambar:/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Unduh gambar' })).toBeVisible();
  await page.getByRole('button', { name: 'Tutup gambar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('progres dari kurikulum lama tetap tersedia', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('playbook:v1', JSON.stringify({ done: { 'ai.data-infrastructure': true }, qa: {}, checks: {}, theme: 'dark', last: { cid: 'ai', mid: 'data-infrastructure' } })));
  await page.goto('/#ai.data-infrastructure');
  await expect(page.locator('.done-btn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/');
  await expect(page.locator('.resume')).toHaveAttribute('href', '#llm.hacktiv8-data-infrastructure');
});

test('sidebar ponsel membuka dan menutup setelah memilih materi', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
  await expect(page.locator('.app')).toHaveClass(/drawer-open/);
  await page.locator('.rail-c-head a').filter({ hasText: 'Go' }).click();
  await expect(page).toHaveURL(/#go$/);
  await expect(page.locator('.app')).not.toHaveClass(/drawer-open/);
  await expect(page.getByRole('button', { name: 'Buka menu', exact: true })).toBeVisible();
});
