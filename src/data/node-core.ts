import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const NODE_CORE = 'Node.js: Inti Runtime';

export const nodeCoreTracks: Track[] = [
  { title: NODE_CORE, summary: 'Event loop, streams, worker threads, fitur bawaan Node modern, dan database type-safe dengan Drizzle.' },
];

export const nodeCoreSource = 'Node.js Inti: materi tambahan dari dokumentasi resmi Node.js dan Drizzle ORM (29 Oktober 2026)';

/** Ditaruh sebelum Express/NestJS: framework berjalan di atas konsep runtime ini. */
export const nodeCoreModules: Omit<Module, 'code'>[] = [
  {
    id: 'node-event-loop',
    title: 'Node.js: Event Loop, Promise & Async Mendalam',
    summary: 'Urutan eksekusi microtask/macrotask, blocking vs non-blocking, error async, dan AbortController.',
    track: NODE_CORE, source: nodeCoreSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Node.js menjalankan JavaScript di **satu thread** dengan event loop. I/O (file, jaringan, database) diserahkan ke sistem operasi atau threadpool libuv, lalu callback-nya dijadwalkan kembali. Memahami urutan ini menjelaskan mengapa satu loop berat bisa membuat seluruh server tidak merespons.'),
      code('Tebak urutan output', `setTimeout(() => console.log('1 timeout'), 0);
setImmediate(() => console.log('2 immediate'));
Promise.resolve().then(() => console.log('3 promise'));
process.nextTick(() => console.log('4 nextTick'));
queueMicrotask(() => console.log('5 microtask'));
console.log('6 sync');

// Output: 6 sync, 4 nextTick, 3 promise, 5 microtask, lalu 1 timeout / 2 immediate
// (urutan timeout vs immediate di modul utama bisa berubah; di dalam callback I/O, immediate lebih dulu)`, 'js'),
      table(['Antrian', 'Isi', 'Kapan dijalankan'], [
        ['Sinkron', 'Kode biasa', 'Langsung, sampai call stack kosong'],
        ['process.nextTick', 'Callback nextTick', 'Segera setelah operasi saat ini, sebelum promise'],
        ['Microtask', 'Promise `.then`, `await`, queueMicrotask', 'Setelah nextTick, sebelum fase event loop berikutnya'],
        ['Timers', 'setTimeout, setInterval', 'Fase timers'],
        ['Poll / Check', 'Callback I/O / setImmediate', 'Fase poll lalu check'],
      ]),
      code('Blocking vs non-blocking', `import { createServer } from 'node:http';
import { pbkdf2Sync, pbkdf2 } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);

createServer(async (req, res) => {
  if (req.url === '/sync') {
    pbkdf2Sync('rahasia', 'salt', 500_000, 64, 'sha512'); // memblok SEMUA request lain
    res.end('sync selesai');
  } else if (req.url === '/async') {
    await pbkdf2Async('rahasia', 'salt', 500_000, 64, 'sha512'); // dikerjakan threadpool libuv
    res.end('async selesai');
  } else {
    res.end('ok');
  }
}).listen(3000);`, 'js'),
      code('Paralel, timeout, dan pembatalan', `async function ambilDashboard(userId, signal) {
  const opts = { signal };
  const [user, orders] = await Promise.all([
    fetch('https://api.example.com/users/' + userId, opts).then((r) => r.json()),
    fetch('https://api.example.com/orders?user=' + userId, opts).then((r) => r.json()),
  ]);
  return { user, orders };
}

// Batalkan otomatis setelah 3 detik
const data = await ambilDashboard(42, AbortSignal.timeout(3000));

// allSettled: tetap lanjut walau sebagian gagal
const hasil = await Promise.allSettled([fetch('https://a.example'), fetch('https://b.example')]);
hasil.forEach((h) => console.log(h.status));`, 'js'),
      callout('warn', 'Promise tanpa await atau catch', 'Promise yang ditolak tanpa handler memicu `unhandledRejection`, dan Node versi modern menghentikan proses. Selalu `await` atau pasang `.catch`, terutama pada fungsi async di dalam event handler dan `forEach` (gunakan `for...of` + await atau `Promise.all`).'),
      ...quiz([
        ['NODE-01', 'Endpoint melakukan JSON.parse pada file 200 MB. Mengapa endpoint lain ikut lambat?', 'JSON.parse berjalan sinkron di thread utama. Selama parsing, event loop tidak bisa memproses request lain. Solusinya: proses data secara streaming, pindahkan ke worker thread, atau kecilkan payload.'],
      ]),
      ...practice('node-event-loop', ['Jelaskan output contoh urutan dan cocokkan dengan hasil eksekusi.', 'Ukur latensi endpoint /ok saat /sync dan /async dibebani dengan autocannon.', 'Tambahkan AbortSignal.timeout pada semua fetch ke layanan eksternal.']),
      references(['Event loop', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'], ['Don’t block the event loop', 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'], ['AbortSignal', 'https://nodejs.org/api/globals.html#class-abortsignal']),
    ],
  },
  {
    id: 'node-streams-workers',
    title: 'Node.js: Streams, Worker Threads & Fitur Bawaan Modern',
    summary: 'pipeline dengan backpressure, worker_threads untuk CPU, test runner, --watch, dan .env bawaan.',
    track: NODE_CORE, source: nodeCoreSource, duration: '2 jam', level: 'Hard',
    blocks: [
      paragraph('**Streams** memproses data sepotong demi sepotong, sehingga file atau respons besar tidak perlu dimuat utuh ke memori. **Worker threads** memindahkan komputasi berat dari thread utama. Node versi modern juga menyediakan test runner, watch mode, dan pembaca `.env` tanpa paket tambahan.'),
      code('Export CSV besar dengan pipeline', `import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { createGzip } from 'node:zlib';

const hanyaPengeluaran = new Transform({
  transform(chunk, _enc, done) {
    const baris = chunk.toString().split('\\n').filter((b) => b.includes(',pengeluaran,'));
    done(null, baris.length ? baris.join('\\n') + '\\n' : '');
  },
});

// pipeline mengurus backpressure dan menutup semua stream saat error
await pipeline(
  createReadStream('transaksi.csv'),
  hanyaPengeluaran,
  createGzip(),
  createWriteStream('pengeluaran.csv.gz'),
);`, 'js'),
      callout('info', 'Contoh disederhanakan', 'Transform di atas memotong per chunk, sehingga satu baris bisa terbelah di batas chunk. Untuk CSV nyata, gunakan `readline` atau parser streaming seperti `csv-parse`.'),
      code('Worker thread untuk komputasi berat', `// hash-worker.js
import { parentPort, workerData } from 'node:worker_threads';
import { pbkdf2Sync } from 'node:crypto';

const hasil = pbkdf2Sync(workerData.password, 'salt', 500_000, 64, 'sha512').toString('hex');
parentPort.postMessage(hasil);

// main.js
import { Worker } from 'node:worker_threads';

function hashDiWorker(password) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('./hash-worker.js', import.meta.url), { workerData: { password } });
    w.once('message', resolve);
    w.once('error', reject);
  });
}

console.log(await hashDiWorker('rahasia'));
// Produksi: pakai pool worker (mis. paket piscina) agar worker tidak dibuat per request`, 'js'),
      code('Fitur bawaan Node modern', `node --watch server.js                 # restart otomatis, pengganti nodemon
node --env-file=.env server.js         # muat .env tanpa paket dotenv
node --test                            # jalankan *.test.js dengan test runner bawaan
node server.ts                         # Node 22.18+/23.6+: type stripping TypeScript tanpa build`, 'bash'),
      code('saldo.test.js — node:test', `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hitungSaldo } from './saldo.js';

test('saldo = pemasukan - pengeluaran', () => {
  assert.equal(hitungSaldo([{ jenis: 'pemasukan', jumlah: 100 }, { jenis: 'pengeluaran', jumlah: 30 }]), 70);
});`, 'js'),
      table(['Beban kerja', 'Solusi'], [
        ['I/O banyak (HTTP, DB)', 'Async biasa di thread utama'],
        ['Data besar', 'Streams + pipeline'],
        ['CPU berat sesekali', 'worker_threads / pool worker'],
        ['Memanfaatkan semua core untuk server HTTP', 'Beberapa proses (cluster, PM2, atau replika container)'],
      ]),
      ...practice('node-streams', ['Export 1 juta baris dengan pipeline; memori proses tetap stabil.', 'Endpoint hashing via worker tidak memperlambat endpoint lain.', 'Ganti nodemon dan dotenv dengan --watch dan --env-file.', 'Tulis tiga tes dengan node:test.']),
      references(['Stream', 'https://nodejs.org/api/stream.html'], ['Worker threads', 'https://nodejs.org/api/worker_threads.html'], ['Test runner', 'https://nodejs.org/api/test.html'], ['TypeScript di Node', 'https://nodejs.org/en/learn/typescript/run-natively']),
    ],
  },
  {
    id: 'node-drizzle-orm',
    title: 'Node.js: Database Type-Safe dengan Drizzle ORM',
    summary: 'Skema di TypeScript, query mirip SQL dengan tipe otomatis, migrasi drizzle-kit, relasi, dan transaksi.',
    track: NODE_CORE, source: nodeCoreSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Drizzle mendefinisikan skema database dalam TypeScript, lalu tipe hasil query diturunkan otomatis dari skema itu. Query tetap terlihat seperti SQL, tanpa generator kode terpisah. Cocok dipakai di Express, NestJS, maupun Server Actions Next.js.'),
      code('Terminal', `npm i drizzle-orm pg
npm i -D drizzle-kit @types/pg`, 'bash'),
      code('src/db/schema.ts', `import { bigint, index, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const jenisEnum = pgEnum('jenis', ['pemasukan', 'pengeluaran']);

export const transaksi = pgTable('transaksi', {
  id: serial().primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  jenis: jenisEnum().notNull(),
  jumlah: bigint({ mode: 'number' }).notNull(),
  kategori: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('idx_transaksi_user').on(t.userId, t.createdAt)]);

export type Transaksi = typeof transaksi.$inferSelect;
export type TransaksiBaru = typeof transaksi.$inferInsert;`, 'ts'),
      code('drizzle.config.ts', `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
});`, 'ts'),
      code('Terminal — migrasi', `npx drizzle-kit generate   # buat file SQL migrasi dari perubahan skema
npx drizzle-kit migrate    # jalankan migrasi ke database
npx drizzle-kit studio     # GUI untuk melihat data`, 'bash'),
      code('src/db/repo.ts — query', `import { drizzle } from 'drizzle-orm/node-postgres';
import { and, desc, eq, sql } from 'drizzle-orm';
import { transaksi, type TransaksiBaru } from './schema';

export const db = drizzle(process.env.DATABASE_URL!);

export function daftar(userId: number, limit = 20) {
  return db.select().from(transaksi)
    .where(eq(transaksi.userId, userId))
    .orderBy(desc(transaksi.createdAt))
    .limit(limit);                         // tipe hasil: Transaksi[]
}

export async function tambah(data: TransaksiBaru) {
  const [row] = await db.insert(transaksi).values(data).returning();
  return row;
}

export function totalPerKategori(userId: number) {
  return db.select({ kategori: transaksi.kategori, total: sql<number>\`sum(\${transaksi.jumlah})::bigint\`.mapWith(Number) })
    .from(transaksi)
    .where(and(eq(transaksi.userId, userId), eq(transaksi.jenis, 'pengeluaran')))
    .groupBy(transaksi.kategori);
}

export async function hapusMilik(userId: number, id: number) {
  // Filter id DAN userId dalam satu query: mencegah user menghapus data milik orang lain
  return db.delete(transaksi).where(and(eq(transaksi.id, id), eq(transaksi.userId, userId))).returning();
}

export function pindahKategori(userId: number, dari: string, ke: string) {
  return db.transaction(async (tx) => {
    await tx.update(transaksi).set({ kategori: ke })
      .where(and(eq(transaksi.userId, userId), eq(transaksi.kategori, dari)));
    // query lain di tx ikut di-rollback bila ada error
  });
}`, 'ts'),
      table(['ORM/Query builder', 'Ciri'], [
        ['Drizzle', 'Skema TS, query mirip SQL, ringan, tanpa generate klien'],
        ['Prisma', 'Skema `.prisma`, klien di-generate, DX tinggi, abstraksi lebih tebal'],
        ['TypeORM', 'Decorator entity, umum di NestJS lama'],
        ['Kysely', 'Query builder type-safe murni, tanpa definisi skema/migrasi bawaan'],
      ]),
      ...practice('node-drizzle', ['Skema, migrasi, dan seed berjalan di Postgres lokal.', 'Ganti repository in-memory pada proyek Express Financial Tracker dengan Drizzle.', 'Salah ketik nama kolom menghasilkan error TypeScript, bukan error runtime.', 'Hapus data memfilter id dan userId sekaligus; uji dengan dua user.']),
      references(['Drizzle docs', 'https://orm.drizzle.team/docs/overview'], ['Drizzle + PostgreSQL', 'https://orm.drizzle.team/docs/get-started-postgresql'], ['drizzle-kit', 'https://orm.drizzle.team/docs/kit-overview']),
    ],
  },
];
