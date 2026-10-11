import type { Block, Module, Track } from '../types';

const FOUNDATION = 'Next.js: Fondasi';
const FULL_STACK = 'Next.js: Data & Full Stack';
const PRODUCTION = 'Next.js: Produksi & Proyek';

export const nextjsTracks: Track[] = [
  { title: FOUNDATION, summary: 'Setup, App Router, Server/Client Components, navigasi, streaming, dan error.' },
  { title: FULL_STACK, summary: 'Fetching, Cache Components, Server Actions, form, API, database, dan autentikasi.' },
  { title: PRODUCTION, summary: 'Metadata, performa, testing, deployment, dan proyek Learning Tracker.' },
];

export const nextjsSource = 'Next.js App Router: materi praktik dari dokumentasi resmi (11 Oktober 2026)';

const heading = (text: string): Block => ({ type: 'h', text });
const paragraph = (text: string): Block => ({ type: 'p', text });
const code = (title: string, content: string, lang: 'ts' | 'bash' | 'text' = 'ts'): Block => ({
  type: 'code', lang, title, code: content,
});
const practice = (id: string, items: string[]): Block[] => [
  heading('Latihan & kriteria selesai'),
  { type: 'checklist', id: `nextjs-${id}`, items },
];
const references = (...pages: [string, string][]): Block => ({
  type: 'list', items: pages.map(([label, path]) => `[${label}](https://nextjs.org/docs/app/${path})`),
});

/** Materi manual dipisahkan dari gen/*.json agar aman saat dokumen sumber dikonversi ulang. */
export const nextjsModules: Omit<Module, 'code'>[] = [
  {
    id: 'nextjs-fondasi-setup',
    title: 'Next.js: Fondasi & Setup Proyek',
    summary: 'Dari React ke App Router: lingkungan kerja, struktur proyek, dan jalur belajar.',
    track: FOUNDATION, source: nextjsSource, duration: '60–90 menit', level: 'Easy',
    blocks: [
      paragraph('Next.js menambahkan routing, rendering server, dan endpoint backend pada React. Prasyarat: komponen, props, hooks, async/await, dan TypeScript dasar. Mulai dari [kurikulum React & TypeScript](#js) bila konsep ini masih asing.'),
      { type: 'callout', tone: 'info', title: 'Acuan versi & lokasi latihan', text: 'Materi memakai **Next.js 16.4 App Router**, sesuai dokumentasi resmi yang diperiksa pada 11 Oktober 2026. Buat aplikasi latihan di folder terpisah dari playbook ini. Gunakan Node.js LTS yang memenuhi minimum **20.9**. Cocokkan versi saat mengikuti tutorial lama.' },
      heading('Buat aplikasi latihan'),
      code('Terminal — jalankan dari folder tempat proyek latihan akan dibuat', `node --version
npx create-next-app@latest learning-tracker --ts --eslint --app --src-dir --import-alias "@/*"
# Pilih Cache Components dan opsi styling sesuai kebutuhan.
cd learning-tracker
npm run dev
# Buka http://localhost:3000`, 'bash'),
      paragraph('Perintah CLI membuat proyek baru. Contoh berikut menggunakan `src/app` dan alias `@/*` menuju `src/*`; konfigurasi berada di root. Pastikan Cache Components serta Partial Prefetching aktif pada modul caching.'),
      code('Peta folder proyek latihan', `learning-tracker/
  src/app/layout.tsx       # HTML, body, dan UI bersama
  src/app/page.tsx         # Halaman /
  src/app/lessons/page.tsx # Halaman /lessons
  src/components/         # Komponen UI
  src/lib/                # Akses data dan validasi
  public/                 # Aset: /cover.webp
  next.config.ts
  package.json`, 'text'),
      code('src/app/page.tsx — ganti halaman awal', `import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Learning Tracker</h1>
      <p>Susun rencana belajar dan catat progresmu.</p>
      <Link href="/lessons">Jelajahi materi</Link>
    </main>
  );
}`),
      ...practice('setup', ['Aplikasi berjalan di localhost:3000 dan perubahan judul terlihat.', 'Jelaskan perbedaan aplikasi React Vite dan aplikasi Next.js.', 'Catat versi Next.js, Node.js, dan pilihan CLI dalam README proyek latihan.']),
      references(['Installation', 'getting-started/installation']),
    ],
  },
  {
    id: 'nextjs-app-router',
    title: 'Next.js: App Router, Layout & Dynamic Route',
    summary: 'Konvensi file, halaman bertingkat, parameter async, dan tautan antarrute.',
    track: FOUNDATION, source: nextjsSource, duration: '90 menit', level: 'Easy',
    blocks: [
      paragraph('Folder membentuk segmen URL; `page.tsx` menyediakan halaman dan `layout.tsx` membungkus turunannya. Root layout harus memiliki `html` dan `body`. Route group seperti `(marketing)` mengelompokkan file tanpa menambah segmen URL.'),
      { type: 'table', head: ['File / folder di src/app', 'Peran'], rows: [
        ['page.tsx', 'Halaman /'], ['lessons/page.tsx', 'Daftar /lessons'],
        ['lessons/[slug]/page.tsx', 'Detail /lessons/react-dasar'],
        ['lessons/layout.tsx', 'UI bersama untuk daftar dan detail materi'],
        ['(marketing)/about/page.tsx', 'Halaman /about'],
      ] },
      code('src/lib/lessons.ts — fixture bersama untuk latihan', `export const lessons = [
  { slug: 'react-dasar', title: 'React Dasar', minutes: 45 },
  { slug: 'nextjs-routing', title: 'Next.js Routing', minutes: 60 },
];`),
      code('src/app/lessons/page.tsx', `import Link from 'next/link';
import { lessons } from '@/lib/lessons';

export default function LessonsPage() {
  return (
    <main>
      <h1>Daftar materi</h1>
      <ul>{lessons.map((lesson) => (
        <li key={lesson.slug}>
          <Link href={'/lessons/' + lesson.slug}>{lesson.title}</Link>
        </li>
      ))}</ul>
    </main>
  );
}`),
      code('src/app/lessons/[slug]/page.tsx', `import { notFound } from 'next/navigation';
import { lessons } from '@/lib/lessons';

export function generateStaticParams() {
  return lessons.map(({ slug }) => ({ slug }));
}

export default async function LessonPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();
  return <main><h1>{lesson.title}</h1><p>{lesson.minutes} menit</p></main>;
}`),
      paragraph('`params` dan prop `searchParams` pada page menggunakan Promise: baca dengan `await`. Nama segmen dinamis saja tidak menentukan kapan rendering terjadi. `generateStaticParams` menyediakan slug untuk prerender. Pada Cache Components, susun batas Suspense untuk data yang membutuhkan request.'),
      ...practice('routing', ['Buka dua detail materi melalui Link dan muat ulang URL detail.', 'Tambahkan layout materi dengan navigasi kembali ke daftar.', 'Tambahkan route group lalu buktikan nama grup tidak muncul di URL.']),
      references(['Layouts and Pages', 'getting-started/layouts-and-pages'], ['Dynamic Segments', 'api-reference/file-conventions/dynamic-routes']),
    ],
  },
  {
    id: 'nextjs-server-client',
    title: 'Next.js: Server & Client Components',
    summary: 'Batas server/browser, hydration, props, dan interaktivitas seperlunya.',
    track: FOUNDATION, source: nextjsSource, duration: '75 menit', level: 'Med',
    blocks: [
      paragraph('Page dan layout adalah Server Components secara default. Gunakan server untuk query dan rahasia, lalu kirim data yang dibutuhkan UI. Tambahkan `"use client"` pada batas komponen interaktif yang memakai state, event, atau API browser.'),
      { type: 'table', head: ['Kebutuhan', 'Tempat'], rows: [
        ['Query database / API key', 'Server Component atau modul server'],
        ['Klik, input, useState', 'Client Component'],
        ['localStorage, window', 'Effect atau event di Client Component'],
        ['Data awal + tombol interaktif', 'Server parent → props → Client child'],
      ] },
      code('src/components/study-counter.tsx', `'use client';

import { useState } from 'react';

export default function StudyCounter({ target }: { target: number }) {
  const [minutes, setMinutes] = useState(0);
  return (
    <section aria-label="Latihan timer">
      <p>{minutes} / {target} menit</p>
      <button onClick={() => setMinutes((value) => value + 5)}>
        Tambah 5 menit
      </button>
    </section>
  );
}`),
      code('src/app/practice/page.tsx — parent tetap di server', `import StudyCounter from '@/components/study-counter';

export default function PracticePage() {
  return <main><h1>Sesi belajar</h1><StudyCounter target={30} /></main>;
}`),
      { type: 'callout', tone: 'warn', title: 'Hydration & batas import', text: 'Client Components juga dapat diprerender di server pada kunjungan pertama. Jangan membaca `window` saat render awal atau menghasilkan HTML awal yang berbeda. Import di bawah batas `use client` masuk graf client; tandai modul database dengan `import "server-only"`. Props lintas batas harus dapat diserialisasi oleh React; hindari mengirim koneksi database atau fungsi biasa.' },
      ...practice('components', ['Tombol menambah angka tanpa menjadikan seluruh halaman Client Component.', 'Pindahkan pembacaan localStorage ke useEffect dan jelaskan alasannya.', 'Periksa bundle / Network: data rahasia tidak dikirim melalui props.']),
      references(['Server and Client Components', 'getting-started/server-and-client-components'], ['Data Security', 'guides/data-security']),
    ],
  },
  {
    id: 'nextjs-loading-error',
    title: 'Next.js: Navigasi, Streaming & Penanganan Error',
    summary: 'Link, loading.tsx, Suspense, halaman 404, dan pemulihan error.',
    track: FOUNDATION, source: nextjsSource, duration: '75 menit', level: 'Med',
    blocks: [
      paragraph('`Link` mendukung navigasi client dan prefetch. Streaming mengirim bagian halaman saat siap. `loading.tsx` menyediakan fallback segmen; Suspense yang lebih kecil membuat bagian lambat tidak menahan seluruh UI.'),
      code('src/app/lessons/loading.tsx', `export default function LoadingLessons() {
  return <p role="status">Memuat materi belajar…</p>;
}`),
      code('src/app/lessons/error.tsx — Next.js 16.4', `'use client';

export default function LessonsError({ retry }: { retry: () => void }) {
  return (
    <section>
      <h2>Materi belum berhasil dimuat</h2>
      <button onClick={() => retry()}>Coba lagi</button>
    </section>
  );
}`),
      paragraph('Dokumentasi 16.4 memakai prop `retry` untuk mencoba mengambil dan merender ulang segmen. Tutorial versi lama dapat memakai `reset`; periksa API versi proyekmu. Error boundary segmen menangani error turunannya; error pada layout segmen perlu boundary di atasnya.'),
      code('src/app/lessons/[slug]/not-found.tsx', `import Link from 'next/link';

export default function MissingLesson() {
  return <main><h1>Materi tidak ditemukan</h1><Link href="/lessons">Kembali</Link></main>;
}`),
      { type: 'list', items: ['Gunakan `notFound()` untuk materi yang tidak ada.', 'Kesalahan validasi form adalah state yang bisa ditampilkan; kegagalan tak terduga dapat dilempar ke boundary.', 'Uji loading dengan data async yang benar-benar lambat dan periksa prefetch pada build produksi.'] },
      ...practice('errors', ['Slug tidak dikenal menampilkan halaman materi tidak ditemukan.', 'Simulasikan query gagal dan pastikan tombol Coba lagi terlihat.', 'Tempatkan Suspense di sekitar widget lambat; navigasi utama tetap bisa dipakai.']),
      references(['Linking and Navigating', 'getting-started/linking-and-navigating'], ['Error Handling', 'getting-started/error-handling']),
    ],
  },
  {
    id: 'nextjs-fetching-cache',
    title: 'Next.js: Data Fetching & Cache Components',
    summary: 'Data async, cache eksplisit, lifetime, tag, dan pemilihan data yang aman dicache.',
    track: FULL_STACK, source: nextjsSource, duration: '90–120 menit', level: 'Med',
    blocks: [
      paragraph('Server Components dapat membaca API atau database langsung. `fetch` tidak dicache secara default. Caching lintas request berbeda dari memoization selama render. Tentukan kesegaran data, bukan hanya lokasi pemanggilan.'),
      code('src/lib/remote-lessons.ts — contoh fetch ke API latihan milikmu', `import 'server-only';

export async function getRemoteLessons(): Promise<unknown> {
  const url = process.env.LESSONS_API_URL;
  if (!url) throw new Error('LESSONS_API_URL belum dikonfigurasi');
  const response = await fetch(url);
  if (!response.ok) throw new Error('API materi gagal: ' + response.status);
  return response.json();
}`),
      paragraph('Set LESSONS_API_URL ke API yang benar-benar tersedia. Return `unknown` mengingatkan bahwa JSON harus divalidasi sesuai skema sebelum dipakai UI. Render data request yang belum dicache di dalam Suspense. Contoh katalog berikut tetap memakai fixture lokal agar latihan dasar tidak membutuhkan API eksternal.'),
      code('next.config.ts — konfigurasi proyek latihan', `import type { NextConfig } from 'next';

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};
export default config;`),
      code('src/lib/catalog.ts — contoh cache katalog publik dari fixture', `import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { lessons } from '@/lib/lessons';

export async function getCatalog() {
  'use cache';
  cacheLife('hours');
  cacheTag('lesson-catalog');
  return lessons;
}`),
      paragraph('Ganti fixture dengan query katalog ketika database sudah tersedia. `use cache` menyimpan hasil; argumen menjadi bagian key. `cacheLife` menentukan lifetime dan `cacheTag` mengelompokkan invalidasi. Modul berikut menjelaskan pembaruan setelah mutasi.'),
      code('src/app/catalog/page.tsx', `import { getCatalog } from '@/lib/catalog';

export default async function CatalogPage() {
  const items = await getCatalog();
  return <main><h1>Katalog</h1><ul>{items.map((item) => (
    <li key={item.slug}>{item.title}</li>
  ))}</ul></main>;
}`),
      { type: 'callout', tone: 'warn', title: 'Data publik dan data pengguna', text: 'Mulai dengan cache katalog publik. Baca sesi, cookies, dan data personal di luar scope cache bersama, dalam boundary Suspense yang sesuai. Jangan memasukkan progres semua pengguna ke satu cache global. Pola `fetch(..., { next: { revalidate: 60 } })` dari tutorial lama perlu dibaca bersama konfigurasi caching yang dipakai proyek tersebut.' },
      ...practice('cache', ['Katalog menggunakan use cache dengan lifetime dan tag eksplisit.', 'Buat widget progres personal di Suspense yang terpisah dari katalog.', 'Untuk dua query independen, gunakan Promise.all dan jelaskan manfaatnya.']),
      references(['Fetching Data', 'getting-started/fetching-data'], ['Caching', 'getting-started/caching'], ['Revalidating', 'getting-started/revalidating']),
    ],
  },
  {
    id: 'nextjs-server-actions',
    title: 'Next.js: Server Actions, Form & Validasi',
    summary: 'Mutasi melalui form, useActionState, pending state, dan invalidasi setelah penyimpanan.',
    track: FULL_STACK, source: nextjsSource, duration: '120 menit', level: 'Med',
    blocks: [
      paragraph('Server Action adalah Server Function untuk mutasi, ditandai `use server`. Form mengirim FormData. Validasi tetap dilakukan di server; atribut HTML hanya membantu pengguna. Mulai dengan action validasi yang bisa dijalankan tanpa database.'),
      code('src/app/goals/actions.ts — tahap 1: validasi, belum menyimpan', `'use server';

export type GoalState = { message: string };

export async function validateGoal(
  _previous: GoalState,
  formData: FormData,
): Promise<GoalState> {
  const title = formData.get('title');
  if (typeof title !== 'string' || title.trim().length < 3) {
    return { message: 'Judul harus berisi minimal 3 karakter.' };
  }
  if (title.trim().length > 120) {
    return { message: 'Judul maksimal 120 karakter.' };
  }
  return { message: 'Validasi berhasil; lanjutkan integrasi penyimpanan.' };
}`),
      code('src/components/goal-form.tsx', `'use client';

import { useActionState } from 'react';
import { validateGoal } from '@/app/goals/actions';

export default function GoalForm() {
  const [state, action, pending] = useActionState(validateGoal, { message: '' });
  return (
    <form action={action}>
      <label htmlFor="goal-title">Target belajar</label>
      <input id="goal-title" name="title" required minLength={3} maxLength={120} />
      <p aria-live="polite">{state.message}</p>
      <button disabled={pending}>{pending ? 'Memeriksa…' : 'Periksa target'}</button>
    </form>
  );
}`),
      paragraph('Render GoalForm dari `src/app/goals/page.tsx`. Tahap 2: ganti action menjadi createGoal, verifikasi sesi, simpan judul beserta userId di database, lalu tampilkan sukses hanya setelah commit database berhasil. Jangan mengambil userId dari field form.'),
      { type: 'table', head: ['Sesudah mutasi', 'Pilihan'], rows: [
        ['UI route perlu dimuat ulang', '`revalidatePath("/goals")`'],
        ['Cache bertag harus segera segar untuk pembuat perubahan', '`updateTag(tag)` — hanya Server Actions'],
        ['Katalog publik boleh memperlihatkan data lama sementara', '`revalidateTag("lesson-catalog", "max")`'],
      ] },
      paragraph('Panggil invalidasi setelah write berhasil. Jika perlu pindah halaman, panggil `redirect` di luar catch umum karena redirect memakai control flow khusus. Untuk data personal tanpa cache, jangan menciptakan tag global hanya demi invalidasi.'),
      ...practice('actions', ['Input kosong / terlalu pendek menampilkan pesan yang dapat dibaca pembaca layar.', 'Tombol memiliki pending state dan hasil validasi tidak mengklaim data tersimpan.', 'Setelah integrasi database, reload membuktikan target tersimpan dan akses user lain ditolak.']),
      references(['Mutating Data', 'getting-started/mutating-data'], ['Forms', 'guides/forms'], ['Revalidating', 'getting-started/revalidating']),
    ],
  },
  {
    id: 'nextjs-route-handlers',
    title: 'Next.js: Route Handlers & Backend for Frontend',
    summary: 'Endpoint JSON, filter URL, status HTTP, dan integrasi backend terpisah.',
    track: FULL_STACK, source: nextjsSource, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('Gunakan `route.ts` saat konsumen membutuhkan HTTP: aplikasi mobile, webhook, atau fetch dari browser. Server Component dapat memanggil lapisan data langsung; memanggil endpoint internal sendiri menambah perjalanan jaringan yang tidak diperlukan.'),
      code('src/app/api/lessons/route.ts — endpoint publik dengan filter', `import { lessons } from '@/lib/lessons';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length > 80) {
    return Response.json({ error: 'Kata kunci terlalu panjang.' }, { status: 400 });
  }
  const data = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(q.toLowerCase()),
  );
  return Response.json({ data });
}`),
      code('Terminal — periksa response endpoint', `curl.exe -i "http://localhost:3000/api/lessons?q=React"
# Di macOS/Linux gunakan curl tanpa .exe.`, 'bash'),
      { type: 'table', head: ['Situasi', 'Respons'], rows: [
        ['Berhasil membaca', '200 + JSON'], ['Berhasil membuat resource', '201 + JSON'],
        ['Payload tidak valid', '400'], ['Sesi tidak valid', '401'],
        ['Tidak punya izin', '403'], ['Resource tidak ada', '404'],
      ] },
      { type: 'callout', tone: 'info', title: 'Integrasi Go / Spring Boot / NestJS', text: 'Next.js dapat menjadi lapisan Backend for Frontend: verifikasi sesi, panggil API backend dari server, lalu kirim DTO kecil ke UI. Simpan token upstream di server. Tentukan pemilik aturan bisnis dan database agar validasi tidak berbeda antar aplikasi.' },
      paragraph('`route.ts` dan `page.tsx` tidak boleh menangani segmen yang sama. HTTP method diekspor sebagai fungsi GET, POST, dan seterusnya. Dengan Cache Components, endpoint GET mengikuti model prerender/cache yang relevan; endpoint dengan URL request pada contoh ini memerlukan request.'),
      ...practice('api', ['Filter React hanya menghasilkan materi yang cocok.', 'Query lebih dari 80 karakter mengembalikan 400.', 'Tambahkan POST dengan validasi JSON, autentikasi, dan respons 201 setelah penyimpanan.']),
      references(['Route Handlers', 'getting-started/route-handlers'], ['Backend for Frontend', 'guides/backend-for-frontend']),
    ],
  },
  {
    id: 'nextjs-auth-database',
    title: 'Next.js: Database, Autentikasi & Otorisasi',
    summary: 'Sesi, kepemilikan data, DAL, environment variables, dan peran Proxy.',
    track: FULL_STACK, source: nextjsSource, duration: '120–180 menit', level: 'Hard',
    blocks: [
      paragraph('Autentikasi membuktikan identitas; sesi mempertahankan status login; otorisasi menentukan akses data. Pilih library autentikasi dari panduan resmi lalu ikuti adapter database dan pengaturan sesinya. Simpan pemeriksaan akses dekat query dalam Data Access Layer (DAL).'),
      code('Skema minimal Learning Tracker — rancangan tabel', `users:    id, email
lessons:  id, slug UNIQUE, title, minutes
goals:    id, user_id REFERENCES users, title, created_at
progress: user_id REFERENCES users, lesson_id REFERENCES lessons, completed_at
          UNIQUE(user_id, lesson_id)
INDEX goals(user_id, created_at)`, 'text'),
      { type: 'callout', tone: 'info', title: 'Kontrak contoh DAL', text: 'Snippet berikut adalah pola integrasi. Sediakan `@/lib/session` dengan verifySession() yang memvalidasi sesi dan mengembalikan userId terpercaya atau menolak akses. Sediakan `@/lib/db` berisi client ORM dengan model goal. Keduanya dibuat saat menghubungkan library auth dan database pilihanmu; bukan API bawaan Next.js.' },
      code('src/lib/goals.ts — pola integrasi setelah adapter tersedia', `import 'server-only';
import { verifySession } from '@/lib/session';
import { db } from '@/lib/db';

export async function getMyGoals() {
  const { userId } = await verifySession();
  return db.goal.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteMyGoal(id: string) {
  const { userId } = await verifySession();
  return db.goal.deleteMany({ where: { id, userId } });
}`),
      paragraph('Action pemanggil tetap memvalidasi input dan menangani hasil delete yang tidak menemukan baris. Query write dengan id + userId mencegah pengguna menghapus milik orang lain. Return hanya field untuk UI; jangan mengirim password hash, token, atau objek session lengkap.'),
      { type: 'list', items: ['Simpan DATABASE_URL dan secret sesi di environment server. Prefix `NEXT_PUBLIC_` memasukkan nilai ke bundle browser saat build.', 'Periksa akses pada setiap action dan endpoint privat, termasuk permintaan langsung tanpa membuka halaman.', 'Pada Next.js 16, `middleware.ts` disebut `proxy.ts`. Proxy dapat membantu redirect awal; keputusan izin tetap dilakukan di DAL / action / endpoint.', 'Gunakan parameterized query atau ORM, migration, dan constraint database; progress berulang tidak boleh menghasilkan duplikat.'] },
      ...practice('auth', ['Dua akun hanya melihat dan mengubah targetnya masing-masing.', 'Permintaan langsung ke endpoint/action privat tanpa sesi ditolak.', 'Manipulasi id milik akun lain tidak mengubah data.', 'Secret tidak muncul pada HTML, respons API, bundle, atau commit.']),
      references(['Authentication', 'guides/authentication'], ['Environment Variables', 'guides/environment-variables'], ['Proxy', 'getting-started/proxy']),
    ],
  },
  {
    id: 'nextjs-metadata-performance',
    title: 'Next.js: Metadata, SEO & Performa',
    summary: 'Title, deskripsi, gambar, JavaScript, dan pengukuran sebelum optimasi.',
    track: PRODUCTION, source: nextjsSource, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('Ekspor metadata dari Server Component page atau layout. Gunakan generateMetadata untuk judul dari data, dan manfaatkan helper query yang sama dengan halaman. SEO juga bergantung pada konten yang berguna, heading, tautan, dan halaman yang dapat diakses.'),
      code('src/app/lessons/[slug]/page.tsx — tambahkan ekspor metadata', `import type { Metadata } from 'next';
// Gunakan import lessons yang sudah ada pada modul routing.

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = lessons.find((item) => item.slug === slug);
  return {
    title: lesson ? lesson.title + ' | Learning Tracker' : 'Materi tidak ditemukan',
    description: lesson ? 'Latihan terarah: ' + lesson.title : undefined,
  };
}`),
      heading('Optimasi yang dapat diukur'),
      { type: 'list', items: ['Utamakan Server Components untuk UI tanpa interaksi; batasi library client yang besar.', 'Gunakan next/image untuk gambar, alt yang jelas, dan dimensi atau fill + container yang sesuai. Siapkan aset lokal sebelum merujuknya.', 'Jika gambar memakai fill atau responsif, sesuaikan sizes dengan lebar sebenarnya; batasi sumber remote melalui remotePatterns.', 'Gunakan next/font untuk mengelola font. Ukur layout shift, berat JS, dan respons navigasi dengan build produksi.', 'Lazy load widget client berat bila tidak diperlukan saat halaman pertama muncul.'] },
      ...practice('seo', ['Title berbeda untuk masing-masing detail materi dan tetap benar setelah reload.', 'Gambar mempunyai alt dan ruang layout sebelum selesai dimuat.', 'Catat ukuran JS dan hasil pengukuran sebelum / sesudah satu optimasi.']),
      references(['Metadata and OG Images', 'getting-started/metadata-and-og-images'], ['Image API', 'api-reference/components/image'], ['Font API', 'api-reference/components/font']),
    ],
  },
  {
    id: 'nextjs-testing',
    title: 'Next.js: Strategi Testing & Playwright',
    summary: 'Uji perilaku pengguna, validasi, akses data, dan integrasi pada build produksi.',
    track: PRODUCTION, source: nextjsSource, duration: '90–120 menit', level: 'Med',
    blocks: [
      paragraph('Pisahkan unit test aturan domain, integration test repository/action, dan E2E alur utama. E2E menguji batas server dan browser bersama, termasuk Server Components async. Pakai database tes terisolasi dan fixture yang bisa diulang.'),
      code('Terminal — pada proyek latihan', `npm init playwright@latest
# Pilih TypeScript dan install browser bila diminta.
npm run build
npm run start
# Terminal lain:
npx playwright test`, 'bash'),
      code('tests/lessons.spec.ts — fixture dari modul routing', `import { expect, test } from '@playwright/test';

test('materi dapat dibuka dan dimuat ulang', async ({ page }) => {
  await page.goto('http://localhost:3000/lessons');
  await page.getByRole('link', { name: 'React Dasar', exact: true }).click();
  await expect(page).toHaveURL(new RegExp('/lessons/react-dasar$'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React Dasar');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React Dasar');
});`),
      { type: 'table', head: ['Lapisan', 'Skenario bernilai'], rows: [
        ['Unit', 'Judul kosong, terlalu panjang, normalisasi input'],
        ['Integration', 'Write gagal tidak melaporkan sukses; query memfilter userId'],
        ['E2E', 'Login → buat target → reload → target tetap ada'],
        ['Akses', 'Akun B tidak dapat membaca / menghapus target akun A'],
        ['UI', 'Pending state, error, 404, keyboard, viewport ponsel'],
      ] },
      paragraph('Jalankan terhadap `next build` + `next start` untuk mendekati produksi. Konfigurasi webServer Playwright dapat menjalankan server secara otomatis. Jangan menguji dengan database produksi atau mengganti akses server dengan mock pada seluruh tes.'),
      ...practice('tests', ['Tes fixture materi lulus terhadap build produksi.', 'Tambahkan satu tes form invalid dan satu tes penyimpanan dengan reload.', 'Uji akses antar pengguna melalui request langsung, bukan hanya tombol UI.']),
      references(['Playwright', 'guides/testing/playwright']),
    ],
  },
  {
    id: 'nextjs-deployment',
    title: 'Next.js: Deployment & Checklist Produksi',
    summary: 'Build, konfigurasi runtime, pilihan hosting, migrasi, dan operasi aplikasi.',
    track: PRODUCTION, source: nextjsSource, duration: '90 menit', level: 'Hard',
    blocks: [
      paragraph('Pilih target berdasarkan fitur yang dipakai. Node.js server atau Docker mendukung fitur server Next.js; static export memiliki batasan. Learning Tracker dengan sesi, mutasi, dan database memerlukan runtime server atau adapter hosting yang mendukungnya.'),
      code('Terminal — pemeriksaan rilis pada proyek latihan', `npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run start
# Jalankan E2E di terminal lain terhadap server produksi.`, 'bash'),
      paragraph('Next.js 16 tidak menjalankan lint otomatis saat build; jadikan lint langkah tersendiri. Jika memakai Docker standalone, sertakan aset public dan .next/static sesuai panduan hosting. Sesuaikan pool koneksi database dengan model server / serverless.'),
      { type: 'steps', items: [
        { title: 'Siapkan environment', text: 'Pisahkan development, test, staging, dan production. Set secret pada platform hosting; siapkan .env.example tanpa nilai rahasia.' },
        { title: 'Siapkan database', text: 'Jalankan migration lewat proses rilis yang terkendali, cek koneksi, dan siapkan backup serta rencana pemulihan.' },
        { title: 'Deploy ke staging', text: 'Uji login, redirect callback, write, reload, serta invalidasi cache dengan domain staging.' },
        { title: 'Operasikan', text: 'Catat error server tanpa token/data sensitif, pantau latency dan kegagalan, lalu siapkan rollback ke versi sebelumnya.' },
      ] },
      ...practice('deploy', ['Lint, typecheck, build, dan E2E selesai sebelum rilis.', 'Domain callback auth, HTTPS, dan cookie sesi sesuai environment.', 'Tidak memakai static export untuk fitur yang membutuhkan server.', 'Ada langkah migration, backup, observasi error, dan rollback di README.']),
      references(['Deploying', 'getting-started/deploying'], ['Environment Variables', 'guides/environment-variables'], ['Installation: linting', 'getting-started/installation']),
    ],
  },
  {
    id: 'nextjs-proyek-learning-tracker',
    title: 'Next.js: Proyek Akhir Learning Tracker',
    summary: 'Satukan katalog publik, login, target pribadi, progres, dan tes dalam satu aplikasi.',
    track: PRODUCTION, source: nextjsSource, duration: '5–7 hari', level: 'Hard',
    blocks: [
      paragraph('Bangun Learning Tracker dari proyek latihan. Pengunjung membaca katalog; pengguna login membuat target dan menandai materi selesai. Gunakan tiga modul fondasi, empat modul data, dan materi produksi sebagai referensi implementasi.'),
      { type: 'table', head: ['Halaman / endpoint', 'Kriteria penerimaan'], rows: [
        ['/lessons dan /lessons/[slug]', 'Katalog publik, metadata, 404, loading, cache eksplisit'],
        ['/goals', 'Login wajib, create/update/delete target milik sendiri'],
        ['/dashboard', 'Progress personal, filter URL, data tetap ada setelah reload'],
        ['/api/progress', 'Validasi, sesi, kepemilikan, respons HTTP konsisten'],
      ] },
      { type: 'steps', items: [
        { title: 'Hari 1: rute & UI', text: 'Buat layout, katalog fixture, detail, halaman kosong, dan form yang dapat dipakai dengan keyboard.' },
        { title: 'Hari 2: data', text: 'Siapkan migration dan seed katalog. Ganti fixture dengan repository server; cache hanya katalog publik terlebih dahulu.' },
        { title: 'Hari 3: auth & CRUD', text: 'Hubungkan library sesi. Terapkan userId dari sesi pada semua query privat dan mutasi target.' },
        { title: 'Hari 4: progress & error', text: 'Simpan progress dengan constraint unik. Tambahkan pending, empty state, error, dan filter dari URL.' },
        { title: 'Hari 5–7: verifikasi & rilis', text: 'Uji dua akun, hard reload, request langsung, dan viewport ponsel. Dokumentasikan keputusan caching lalu deploy ke staging.' },
      ] },
      heading('Latihan evaluasi — jawab sebelum membuka solusi'),
      { type: 'qa', items: [
        { id: 'NEXT-01', q: 'Mengapa use client cukup pada GoalForm?', a: [paragraph('Form memerlukan useActionState dan feedback interaktif. Layout serta query katalog tetap di server sehingga JavaScript client lebih kecil. Action server diimpor melalui mekanisme Server Function; koneksi database tetap berada pada modul server.')] },
        { id: 'NEXT-02', q: 'Target baru hilang setelah reload. Apa yang diperiksa?', a: [paragraph('Pastikan action benar-benar melakukan write database dan menunggu keberhasilannya. Periksa environment database dan filter userId pada query pembaca. Jika memakai cache, periksa key serta invalidasi. State React saja tidak memberi persistensi.')] },
        { id: 'NEXT-03', q: 'Tombol hapus disembunyikan untuk akun B. Apakah target akun A aman?', a: [paragraph('Belum. Request langsung tetap dapat dibuat. Server harus memvalidasi sesi dan mengeksekusi write yang memfilter id serta userId pemilik dalam query yang sama. Uji manipulasi id dengan akun B.')] },
        { id: 'NEXT-04', q: 'Kapan katalog dan dashboard memakai strategi cache berbeda?', a: [paragraph('Katalog adalah data bersama yang boleh memiliki lifetime dan tag publik. Dashboard bergantung pada identitas serta perubahan pengguna; mulai dengan query personal tanpa cache bersama, lalu tentukan key dan invalidasi per pengguna jika memang diperlukan.')] },
      ] },
      ...practice('project', ['Katalog, CRUD target, dan progres selesai dengan database nyata.', 'Reload mempertahankan data; dua akun tidak saling mengakses target.', 'Tes alur utama dan akses server lulus pada build produksi.', 'README menjelaskan setup, seed, migration, caching, environment, dan rilis.']),
      paragraph('Lanjutkan ke [Data Fetching & Cache Components](#js.nextjs-fetching-cache), [Database & Autentikasi](#js.nextjs-auth-database), atau [Testing](#js.nextjs-testing) untuk memperbaiki bagian proyek yang belum memenuhi kriteria.'),
      references(['Dokumentasi App Router', 'getting-started/installation']),
    ],
  },
];
