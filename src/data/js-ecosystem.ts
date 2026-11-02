import type { Module, Track } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const REACT_ECO = 'React: Ekosistem & Produksi';
const NODE_CORE = 'Node.js: Inti Runtime';
const VUE = 'Vue & Nuxt';

/** Track baru; disarankan disisipkan sebelum track 'Angular'. */
export const jsEcosystemTracks: Track[] = [
  { title: VUE, summary: 'Vue 3 Composition API, komponen bertipe, Pinia, Vue Router, Nuxt full stack, dan proyek Pencatat Keuangan.' },
];

export const jsEcosystemSource = 'Ekosistem JS: materi tambahan dari dokumentasi resmi TanStack Query, React Hook Form, Zod, ws, Socket.IO, BullMQ, AWS SDK v3, Vue, Pinia, Vue Router, dan Nuxt (2 November 2026)';

export const jsEcosystemModules: Omit<Module, 'code'>[] = [
  // ───────────────────────── React: Ekosistem & Produksi ─────────────────────────
  {
    id: 'jse-tanstack-query-lanjutan',
    title: 'TanStack Query Mendalam: Query Key, Cache, Mutation & Infinite',
    summary: 'Query key factory, queryOptions, staleTime vs gcTime, invalidasi berbasis prefix, optimistic update yang aman, pagination, infinite scroll, dan prefetch SSR.',
    track: REACT_ECO, source: jsEcosystemSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('Dasar `useQuery` dan `useMutation` sudah dibahas di [State Management](#js.state-management). Modul ini membahas masalah yang baru muncul ketika aplikasi membesar: key yang tidak konsisten membuat invalidasi meleset, optimistic update yang lupa membatalkan refetch, list berhalaman yang berkedip saat pindah halaman, dan data SSR yang langsung di-fetch ulang di browser. Acuan: **TanStack Query v5** (cek versi terbaru).'),
      paragraph('Contoh memakai data transaksi dari [kontrak API Pencatat Keuangan](#js.kontrak-api-yang-akan-dibangun). Parameter `?page`, `?cursor`, dan `GET /api/transaksi/:id` adalah perluasan kontrak. Respons berhalaman berbentuk `{ items, berikutnya }`.'),
      code('src/api/transaksi.ts — key factory & queryOptions', `import { keepPreviousData, queryOptions } from '@tanstack/react-query';

export type Transaksi = { id: number; jenis: 'pemasukan' | 'pengeluaran'; deskripsi: string; jumlah: number; tanggal: string };
export type TransaksiBaru = Omit<Transaksi, 'id' | 'tanggal'>;
export type Filter = { page: number; jenis?: Transaksi['jenis'] };
export type Halaman = { items: Transaksi[]; berikutnya: number | null };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch('/api' + path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? \`HTTP \${res.status}\`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

// Satu sumber kebenaran untuk key: hierarki dari umum ke spesifik
export const transaksiKeys = {
  all: ['transaksi'] as const,
  lists: () => [...transaksiKeys.all, 'list'] as const,
  list: (f: Filter) => [...transaksiKeys.lists(), f] as const,
  infinite: (jenis?: string) => [...transaksiKeys.all, 'infinite', jenis ?? 'semua'] as const,
  detail: (id: number) => [...transaksiKeys.all, 'detail', id] as const,
};

// queryOptions: key + fn + opsi dalam satu objek bertipe, dipakai ulang oleh
// useQuery, useSuspenseQuery, prefetchQuery, getQueryData, dan ensureQueryData
export const transaksiQueries = {
  list: (f: Filter) => queryOptions({
    queryKey: transaksiKeys.list(f),
    queryFn: ({ signal }) => api<Halaman>(\`/transaksi?page=\${f.page}&jenis=\${f.jenis ?? ''}\`, { signal }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,   // tampilkan halaman lama selagi halaman baru dimuat
  }),
  detail: (id: number) => queryOptions({
    queryKey: transaksiKeys.detail(id),
    queryFn: ({ signal }) => api<Transaksi>(\`/transaksi/\${id}\`, { signal }),
    staleTime: 5 * 60_000,
  }),
};`, 'ts'),
      table(['Opsi / status', 'Arti', 'Konsekuensi praktis'], [
        ['`staleTime` (default 0)', 'Berapa lama data dianggap *fresh*', 'Selama fresh: tidak ada refetch otomatis (mount, focus, reconnect)'],
        ['`gcTime` (default 5 menit)', 'Berapa lama cache *inactive* (tanpa observer) disimpan', 'Kembali sebelum habis: data lama tampil instan lalu refetch bila stale'],
        ['`isPending`', 'Belum ada data sama sekali', 'Tampilkan skeleton'],
        ['`isFetching`', 'Ada request berjalan (termasuk background)', 'Indikator kecil, jangan ganti seluruh UI'],
        ['`isPlaceholderData`', 'Data yang tampil berasal dari `placeholderData`', 'Nonaktifkan tombol "Berikutnya", redupkan list'],
        ['`invalidateQueries`', 'Tandai stale berdasarkan **prefix** key', 'Query aktif langsung di-refetch, inactive di-refetch saat dipakai lagi'],
      ]),
      code('DaftarTransaksi.tsx — pagination tanpa kedip + prefetch', `import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { transaksiQueries } from './api/transaksi';

export function DaftarTransaksi() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data, isPending, isError, error, isFetching, isPlaceholderData } = useQuery(transaksiQueries.list({ page }));

  // Prefetch halaman berikutnya agar klik "Berikutnya" terasa instan
  useEffect(() => {
    if (data?.berikutnya) qc.prefetchQuery(transaksiQueries.list({ page: page + 1 }));
  }, [data, page, qc]);

  if (isPending) return <p>Memuat…</p>;
  if (isError) return <p role="alert">Gagal memuat: {error.message}</p>;

  return (
    <section aria-busy={isFetching}>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.items.map((t) => <li key={t.id}>{t.deskripsi}: {t.jumlah}</li>)}
      </ul>
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Sebelumnya</button>
      <button onClick={() => setPage((p) => p + 1)} disabled={isPlaceholderData || !data.berikutnya}>Berikutnya</button>
    </section>
  );
}`, 'ts'),
      code('src/api/mutations.ts — optimistic update di banyak cache sekaligus', `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, transaksiKeys, type Halaman, type Transaksi, type TransaksiBaru } from './transaksi';

export function useHapusTransaksi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<void>(\`/transaksi/\${id}\`, { method: 'DELETE' }),
    onMutate: async (id) => {
      // 1. batalkan refetch yang sedang jalan agar tidak menimpa perubahan optimistic
      await qc.cancelQueries({ queryKey: transaksiKeys.lists() });
      // 2. snapshot SEMUA list (semua halaman & filter) yang cocok dengan prefix
      const snapshot = qc.getQueriesData<Halaman>({ queryKey: transaksiKeys.lists() });
      // 3. ubah semua cache list sekaligus
      qc.setQueriesData<Halaman>({ queryKey: transaksiKeys.lists() }, (old) =>
        old && { ...old, items: old.items.filter((t) => t.id !== id) });
      return { snapshot };   // diteruskan ke onError/onSettled
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));   // rollback
    },
    onSettled: (_data, _err, id) => {
      qc.removeQueries({ queryKey: transaksiKeys.detail(id) });
      // return promise → mutation tetap isPending sampai refetch selesai
      return Promise.all([
        qc.invalidateQueries({ queryKey: transaksiKeys.all }),
        qc.invalidateQueries({ queryKey: ['ringkasan'] }),
      ]);
    },
  });
}

// Alternatif lebih sederhana: optimistic lewat \`variables\`, tanpa menyentuh cache
export function useTambahTransaksi() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['tambah-transaksi'],
    mutationFn: (baru: TransaksiBaru) => api<Transaksi>('/transaksi', { method: 'POST', body: JSON.stringify(baru) }),
    onSuccess: (dibuat) => {
      qc.setQueryData(transaksiKeys.detail(dibuat.id), dibuat);   // isi cache detail dari respons
      return qc.invalidateQueries({ queryKey: transaksiKeys.all });
    },
  });
}

// Di komponen mana pun (bukan hanya pemanggil mutate):
// const pending = useMutationState({
//   filters: { mutationKey: ['tambah-transaksi'], status: 'pending' },
//   select: (m) => m.state.variables as TransaksiBaru,
// });
// pending.map((t) => <li style={{ opacity: 0.5 }}>{t.deskripsi} (menyimpan…)</li>)`, 'ts'),
      callout('warn', 'Prefix yang sama harus berbentuk data yang sama', '`setQueriesData` pada prefix `[\'transaksi\', \'list\']` mengasumsikan semua cache di bawahnya bertipe `Halaman`. Itulah sebabnya infinite query diberi key `[\'transaksi\', \'infinite\', ...]`: datanya berbentuk `{ pages, pageParams }`, dan updater untuk `Halaman` akan merusaknya. Untuk *invalidasi*, prefix lebar seperti `transaksiKeys.all` aman. Untuk *update manual*, pakai prefix yang sempit.'),
      code('Infinite scroll dengan cursor + IntersectionObserver', `import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { api, transaksiKeys, type Halaman } from './api/transaksi';

export function RiwayatTanpaBatas() {
  const sentinel = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: transaksiKeys.infinite(),
    queryFn: ({ pageParam, signal }) => api<Halaman>(\`/transaksi?cursor=\${pageParam}\`, { signal }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.berikutnya,   // null/undefined = tidak ada halaman lagi
  });

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <p>Memuat…</p>;
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <>
      <ul>{items.map((t) => <li key={t.id}>{t.deskripsi}</li>)}</ul>
      <div ref={sentinel} aria-hidden />
      {isFetchingNextPage && <p>Memuat lagi…</p>}
      {!hasNextPage && <p>Semua transaksi sudah ditampilkan.</p>}
    </>
  );
}`, 'ts'),
      code('Prefetch di server + hydrate (Next.js App Router)', `// app/transaksi/page.tsx — Server Component
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { transaksiQueries } from '@/api/transaksi';
import { DaftarTransaksi } from './DaftarTransaksi';   // Client Component ('use client')

export default async function Page() {
  const qc = new QueryClient();                                // baru per request: cache tidak bocor antar pengguna
  await qc.prefetchQuery(transaksiQueries.list({ page: 1 }));  // key sama persis dengan yang dipakai client
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DaftarTransaksi />
    </HydrationBoundary>
  );
}

// Catatan:
// - queryFn di server butuh URL absolut (fetch relatif '/api' tidak jalan di server) atau akses DB langsung.
// - Di provider client: const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }));
//   staleTime > 0 mencegah refetch langsung setelah hydrate.`, 'ts'),
      callout('tip', 'Kapan TanStack Query tidak perlu', 'Di Next.js, data yang hanya dibaca oleh Server Component cukup di-fetch di server (lihat [Fetching & Cache Next.js](#js.nextjs-fetching-cache)). TanStack Query bermanfaat untuk data yang hidup di client: polling, infinite scroll, optimistic update, refetch saat focus, atau SPA tanpa server React.'),
      ...quiz([
        ['JSE-01', 'Setelah menghapus transaksi, list halaman 2 dan list berfilter "pengeluaran" masih menampilkan item itu. Apa penyebabnya, dan bagaimana key factory membantu?', 'Invalidasi kemungkinan memakai key spesifik seperti `[\'transaksi\', \'list\', { page: 1 }]`, sehingga hanya satu cache yang ditandai stale. `invalidateQueries` mencocokkan **prefix**. Dengan memanggil `transaksiKeys.lists()` atau `transaksiKeys.all`, semua halaman dan filter ikut ditandai stale: query aktif langsung di-refetch, dan query inactive di-refetch saat dipakai lagi. Factory memastikan semua key memakai hierarki yang sama, sehingga prefix ini selalu cocok.'],
        ['JSE-02', 'Dengan staleTime 0 dan gcTime 5 menit, pengguna pindah halaman lalu kembali setelah 1 menit. Apa yang dilihat pengguna? Bagaimana kalau kembali setelah 10 menit?', 'Setelah 1 menit, cache inactive masih tersimpan, jadi data lama langsung tampil (`isPending` false). Karena data sudah stale, refetch berjalan di background (`isFetching` true) dan UI diperbarui setelah selesai. Setelah 10 menit, cache sudah dibuang oleh garbage collector, jadi `isPending` kembali true dan skeleton tampil. Naikkan `staleTime` bila data jarang berubah agar refetch tidak terjadi setiap mount.'],
        ['JSE-03', 'Kapan memilih optimistic update lewat `variables` dan kapan lewat cache (`onMutate`)?', 'Pakai `variables` bila perubahan hanya perlu tampil di satu atau dua tempat. Tidak perlu rollback: bila mutation gagal, item pending hilang sendiri dan error bisa ditampilkan. Pakai cache bila perubahan harus terlihat di banyak query atau komponen, misalnya daftar, ringkasan, dan detail. Konsekuensinya ada tiga langkah wajib: `cancelQueries`, snapshot plus rollback di `onError`, dan invalidasi di `onSettled`.'],
      ]),
      ...practice('jse-tanstack', [
        'Buat `transaksiKeys` dan `transaksiQueries`. Tidak boleh ada array key yang ditulis manual di komponen (cek dengan grep `queryKey: [`).',
        'Pagination memakai `keepPreviousData`: tidak ada skeleton saat pindah halaman, dan halaman berikutnya di-prefetch (verifikasi di tab Network dan Devtools).',
        'Hapus dengan optimistic update: matikan server (atau balas 500) dan pastikan semua list kembali seperti semula.',
        'Infinite scroll memuat 20 item per halaman dan berhenti ketika `berikutnya` bernilai null.',
      ]),
      references(['TanStack Query: Query Keys', 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys'], ['Query Options', 'https://tanstack.com/query/latest/docs/framework/react/guides/query-options'], ['Optimistic Updates', 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates'], ['Infinite Queries', 'https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries'], ['Advanced Server Rendering', 'https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr']),
    ],
  },
  {
    id: 'jse-form-rhf-zod',
    title: 'Form Kompleks: React Hook Form + Zod vs React 19 Form Actions',
    summary: 'Skema Zod dipakai bersama client dan server, field array, error dari server, aksesibilitas form, serta kapan cukup memakai useActionState.',
    track: REACT_ECO, source: jsEcosystemSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Form sederhana cukup ditulis dengan `useState` atau form action React 19. Form menjadi rumit ketika punya banyak field, baris dinamis (rincian belanja), validasi silang, dan error dari server yang harus muncul di field yang tepat. **React Hook Form** (v7) menyimpan nilai input di DOM (uncontrolled) sehingga mengetik tidak me-render ulang seluruh form. **Zod** menjadi satu skema validasi yang dipakai di browser dan di server.'),
      code('Terminal', `npm i react-hook-form zod @hookform/resolvers`, 'bash'),
      code('shared/transaksi-schema.ts — dipakai client DAN server', `import { z } from 'zod';

export const rincianSchema = z.object({
  deskripsi: z.string().trim().min(1, 'Deskripsi wajib diisi').max(100, 'Maksimal 100 karakter'),
  jumlah: z.number({ error: 'Jumlah harus berupa angka' }).int().positive('Jumlah harus lebih dari 0'),
});

export const transaksiFormSchema = z.object({
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  catatan: z.string().max(200).optional(),
  rincian: z.array(rincianSchema).min(1, 'Minimal satu rincian'),
}).refine(
  (v) => v.rincian.reduce((s, r) => s + r.jumlah, 0) <= 50_000_000,
  { message: 'Total satu transaksi maksimal Rp50.000.000', path: ['rincian'] },
);

export type TransaksiForm = z.infer<typeof transaksiFormSchema>;
// Catatan: contoh memakai Zod 4 (parameter { error }). Di Zod 3 gunakan { invalid_type_error }.`, 'ts'),
      code('FormTransaksi.tsx — field array, error server, aksesibilitas', `import { useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transaksiFormSchema, type TransaksiForm } from '../shared/transaksi-schema';

export function FormTransaksi() {
  const { register, control, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<TransaksiForm>({
    resolver: zodResolver(transaksiFormSchema),
    mode: 'onTouched',                       // validasi saat blur, lalu setiap perubahan
    defaultValues: { jenis: 'pengeluaran', tanggal: '', rincian: [{ deskripsi: '', jumlah: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rincian' });
  const rincian = useWatch({ control, name: 'rincian' });   // re-render hanya saat rincian berubah
  const total = rincian.reduce((s, r) => s + (Number(r?.jumlah) || 0), 0);

  async function onSubmit(data: TransaksiForm) {
    const res = await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.status === 422) {
      const body: { errors: Record<string, string> } = await res.json();
      for (const [path, message] of Object.entries(body.errors)) {
        setError(path as FieldPath<TransaksiForm>, { type: 'server', message });   // mis. "rincian.1.jumlah"
      }
      return;
    }
    if (!res.ok) return setError('root.server', { type: String(res.status), message: 'Gagal menyimpan. Coba lagi.' });
    reset();
  }

  const errId = (name: string) => name.replaceAll('.', '-') + '-err';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="tanggal">Tanggal</label>
      <input id="tanggal" type="date" aria-invalid={!!errors.tanggal}
        aria-describedby={errors.tanggal ? errId('tanggal') : undefined} {...register('tanggal')} />
      {errors.tanggal && <p id={errId('tanggal')} role="alert">{errors.tanggal.message}</p>}

      <fieldset>
        <legend>Rincian (total: {total.toLocaleString('id-ID')})</legend>
        {fields.map((field, i) => {
          const e = errors.rincian?.[i];
          return (
            <div key={field.id}>   {/* field.id, BUKAN index */}
              <label htmlFor={\`rincian-\${i}-deskripsi\`}>Deskripsi {i + 1}</label>
              <input id={\`rincian-\${i}-deskripsi\`} aria-invalid={!!e?.deskripsi}
                aria-describedby={e?.deskripsi ? errId(\`rincian.\${i}.deskripsi\`) : undefined}
                {...register(\`rincian.\${i}.deskripsi\`)} />
              {e?.deskripsi && <p id={errId(\`rincian.\${i}.deskripsi\`)} role="alert">{e.deskripsi.message}</p>}

              <label htmlFor={\`rincian-\${i}-jumlah\`}>Jumlah {i + 1}</label>
              <input id={\`rincian-\${i}-jumlah\`} type="number" inputMode="numeric" aria-invalid={!!e?.jumlah}
                aria-describedby={e?.jumlah ? errId(\`rincian.\${i}.jumlah\`) : undefined}
                {...register(\`rincian.\${i}.jumlah\`, { valueAsNumber: true })} />
              {e?.jumlah && <p id={errId(\`rincian.\${i}.jumlah\`)} role="alert">{e.jumlah.message}</p>}

              <button type="button" onClick={() => remove(i)} disabled={fields.length === 1}
                aria-label={\`Hapus rincian \${i + 1}\`}>Hapus</button>
            </div>
          );
        })}
        <button type="button" onClick={() => append({ deskripsi: '', jumlah: 0 })}>+ Rincian</button>
        {(errors.rincian?.message ?? errors.rincian?.root?.message) && (
          <p role="alert">{errors.rincian?.message ?? errors.rincian?.root?.message}</p>
        )}
      </fieldset>

      {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
      <button disabled={isSubmitting}>{isSubmitting ? 'Menyimpan…' : 'Simpan'}</button>
    </form>
  );
}`, 'ts'),
      code('Server Express — skema yang sama, error dipetakan ke path field', `import express from 'express';
import { transaksiFormSchema } from '../shared/transaksi-schema.js';

const app = express();
app.use(express.json());

app.post('/api/transaksi', async (req, res) => {
  const hasil = transaksiFormSchema.safeParse(req.body);
  if (!hasil.success) {
    // path ['rincian', 1, 'jumlah'] → "rincian.1.jumlah", cocok dengan nama field React Hook Form
    const errors = Object.fromEntries(hasil.error.issues.map((i) => [i.path.join('.') || 'root.server', i.message]));
    return res.status(422).json({ errors });
  }
  // Aturan bisnis yang hanya diketahui server
  if (await sudahDicatat(req.user.id, hasil.data)) {
    return res.status(422).json({ errors: { tanggal: 'Transaksi serupa sudah dicatat di tanggal ini' } });
  }
  res.status(201).json(await simpan(req.user.id, hasil.data));
});`, 'ts'),
      code('Pembanding: React 19 form action (tanpa library)', `import { useActionState } from 'react';
import { rincianSchema } from '../shared/transaksi-schema';

type State = { errors?: Record<string, string>; values?: { deskripsi?: string; jumlah?: string }; ok?: boolean };

async function simpan(_prev: State, formData: FormData): Promise<State> {
  const values = { deskripsi: String(formData.get('deskripsi') ?? ''), jumlah: String(formData.get('jumlah') ?? '') };
  const hasil = rincianSchema.safeParse({ deskripsi: values.deskripsi, jumlah: Number(values.jumlah) });
  if (!hasil.success) {
    return { values, errors: Object.fromEntries(hasil.error.issues.map((i) => [i.path.join('.'), i.message])) };
  }
  const res = await fetch('/api/transaksi', { method: 'POST', body: JSON.stringify(hasil.data), headers: { 'Content-Type': 'application/json' } });
  return res.ok ? { ok: true } : { values, errors: { server: 'Gagal menyimpan' } };
}

export function FormCepat() {
  const [state, action, isPending] = useActionState(simpan, {});
  return (
    <form action={action}>
      {/* React mereset form setelah action selesai: kembalikan nilai lewat defaultValue */}
      <input name="deskripsi" defaultValue={state.values?.deskripsi} aria-invalid={!!state.errors?.deskripsi} />
      {state.errors?.deskripsi && <p role="alert">{state.errors.deskripsi}</p>}
      <input name="jumlah" type="number" defaultValue={state.values?.jumlah} />
      {state.errors?.jumlah && <p role="alert">{state.errors.jumlah}</p>}
      <button disabled={isPending}>Simpan</button>
    </form>
  );
}`, 'ts'),
      table(['Aspek', 'React Hook Form + Zod', 'React 19 form action (`useActionState`)'], [
        ['Validasi saat mengetik / blur', 'Bawaan (`mode`)', 'Tidak ada; validasi saat submit'],
        ['Field array dinamis', '`useFieldArray` dengan id stabil', 'Manual (state + nama input berindeks)'],
        ['Re-render', 'Minimal (input uncontrolled, `useWatch` terarah)', 'Minimal, form uncontrolled'],
        ['Progressive enhancement (tanpa JS)', 'Tidak; butuh JS', 'Ya bila action adalah Server Function (Next.js)'],
        ['Error server per field', '`setError(path)`', 'Dikembalikan lewat state'],
        ['Cocok untuk', 'Form panjang, wizard, rincian dinamis, dashboard', 'Form pendek: login, komentar, form Next.js berbasis Server Action'],
      ]),
      callout('tip', 'Checklist aksesibilitas form', 'Setiap input punya `<label htmlFor>`. Error ditautkan dengan `aria-describedby` dan ditandai `aria-invalid`. Pesan error memakai `role="alert"` agar dibacakan screen reader. Kelompok field memakai `<fieldset>` + `<legend>`. Pakai `noValidate` agar balon validasi bawaan browser tidak bentrok dengan pesan Zod. React Hook Form sudah memfokuskan field error pertama saat submit (`shouldFocusError`, aktif secara default) selama ref dari `register` terpasang.'),
      callout('warn', 'Komponen pihak ketiga', 'Date picker atau select kustom yang tidak meneruskan `ref` ke elemen input tidak bisa memakai `register`. Bungkus dengan `<Controller control={control} name="..." render={({ field }) => ...} />` agar nilai, blur, dan fokus error tetap terhubung.'),
      ...quiz([
        ['JSE-04', 'Mengapa `key={field.id}` wajib di `useFieldArray`, bukan `key={i}`?', '`field.id` adalah id stabil yang dibuat React Hook Form untuk setiap baris. Index berubah saat baris dihapus atau disisipkan, sehingga React memasangkan elemen DOM dan registrasi input ke baris yang salah: nilai dan pesan error terlihat bergeser ke baris lain.'],
        ['JSE-05', 'Zod sudah memvalidasi di client. Mengapa server tetap harus memvalidasi, dan bagaimana error server ditampilkan di field yang tepat?', 'Request bisa dikirim tanpa UI (curl, script), dan aturan bisnis seperti duplikasi atau kepemilikan data hanya diketahui server. Server memakai skema yang sama, lalu membalas 422 dengan peta `path → pesan` (`rincian.1.jumlah`). Client memanggil `setError(path, ...)` untuk setiap entri, dan memakai `root.server` untuk error yang tidak terkait field.'],
        ['JSE-06', 'Pada form React 19 dengan `useActionState`, semua input kosong setelah submit yang gagal validasi. Mengapa?', 'React mereset form uncontrolled secara otomatis setelah action di `<form action>` selesai tanpa melempar error, termasuk ketika action mengembalikan state berisi error. Solusinya: kembalikan nilai yang dikirim di dalam state lalu pasang lewat `defaultValue`, atau pakai React Hook Form untuk form yang kompleks.'],
      ]),
      ...practice('jse-form', [
        'Form rincian dinamis: tambah dan hapus baris, total diperbarui langsung, dan minimal satu baris tidak bisa dihapus.',
        'Server membalas 422 untuk `rincian.1.jumlah`; pesan muncul tepat di bawah input baris kedua.',
        'Uji dengan screen reader (NVDA/VoiceOver) atau Lighthouse: setiap error dibacakan dan fokus pindah ke field error pertama.',
        'Tulis ulang form login memakai `useActionState`, lalu bandingkan jumlah kode dan perilakunya dengan versi React Hook Form.',
      ]),
      references(['React Hook Form: useForm', 'https://react-hook-form.com/docs/useform'], ['useFieldArray', 'https://react-hook-form.com/docs/usefieldarray'], ['Hookform resolvers', 'https://github.com/react-hook-form/resolvers'], ['Zod', 'https://zod.dev'], ['React: useActionState', 'https://react.dev/reference/react/useActionState'], ['W3C WAI: Forms tutorial', 'https://www.w3.org/WAI/tutorials/forms/']),
    ],
  },

  // ───────────────────────── Node.js: Inti Runtime ─────────────────────────
  {
    id: 'jse-node-realtime',
    title: 'Node.js: Realtime dengan WebSocket, Socket.IO & Server-Sent Events',
    summary: 'SSE untuk notifikasi satu arah, ws dengan autentikasi saat upgrade, heartbeat ping/pong, Socket.IO rooms, dan scaling banyak instance dengan Redis.',
    track: NODE_CORE, source: jsEcosystemSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Fitur seperti notifikasi transaksi baru, progres impor CSV, atau saldo yang berubah di tab lain memerlukan server yang **mendorong** data ke klien. Polling setiap beberapa detik boros dan selalu terlambat. Pilihan modernnya: **Server-Sent Events** (satu arah, HTTP biasa) atau **WebSocket** (dua arah). Setiap koneksi realtime hidup lama di event loop (lihat [Event Loop](#js.node-event-loop)), jadi kebocoran listener dan koneksi mati yang tidak terdeteksi langsung berdampak ke memori.'),
      table(['Teknik', 'Arah', 'Reconnect', 'Kapan dipakai'], [
        ['Polling / long polling', 'Klien → server', 'Manual', 'Fallback; data yang jarang berubah'],
        ['Server-Sent Events', 'Server → klien', 'Otomatis + `Last-Event-ID`', 'Notifikasi, progres job, feed, streaming token LLM'],
        ['WebSocket (`ws`)', 'Dua arah', 'Manual', 'Chat, kolaborasi, game; kontrol penuh, protokol sendiri'],
        ['Socket.IO', 'Dua arah', 'Otomatis', 'Rooms, ack, fallback polling, adapter multi-instance siap pakai'],
      ]),
      code('SSE dengan Express — heartbeat dan cleanup', `import express from 'express';
import { EventEmitter } from 'node:events';

const app = express();
const bus = new EventEmitter();   // hanya satu proses; untuk banyak instance lihat Redis pub/sub di bawah
bus.setMaxListeners(0);           // satu listener per koneksi; hilangkan peringatan batas 10
let eventId = 0;

app.get('/api/events', requireAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',   // matikan buffering respons di Nginx
  });
  res.write('retry: 5000\\n\\n');  // browser reconnect 5 detik setelah putus
  // Saat reconnect browser mengirim header Last-Event-ID: kirim ulang event yang terlewat dari storage

  const kirim = (evt) => {
    if (evt.userId !== req.user.id) return;   // hanya event milik user ini
    res.write(\`id: \${evt.id}\\nevent: \${evt.type}\\ndata: \${JSON.stringify(evt.data)}\\n\\n\`);
  };
  const heartbeat = setInterval(() => res.write(': ping\\n\\n'), 15_000);   // baris komentar: menjaga proxy tidak memutus koneksi idle
  bus.on('transaksi', kirim);

  req.on('close', () => {                    // WAJIB: tanpa ini listener & interval bocor
    clearInterval(heartbeat);
    bus.off('transaksi', kirim);
  });
});

app.post('/api/transaksi', requireAuth, express.json(), async (req, res) => {
  const t = await repo.tambah(req.user.id, req.body);
  bus.emit('transaksi', { id: ++eventId, userId: req.user.id, type: 'transaksi-baru', data: t });
  res.status(201).json(t);
});

// Browser:
// const es = new EventSource('/api/events');   // cookie sesi ikut terkirim (same-origin)
// es.addEventListener('transaksi-baru', (e) => tampilkan(JSON.parse(e.data)));`, 'js'),
      code('ws — autentikasi saat upgrade, validasi pesan, heartbeat', `import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });   // tolak pesan > 64 KB

server.on('upgrade', async (req, socket, head) => {
  // Browser tidak menerapkan CORS ke WebSocket: periksa Origin dan sesi sendiri
  const user = await autentikasiDariCookie(req).catch(() => null);
  if (!user || req.headers.origin !== 'https://app.example.com') {
    socket.write('HTTP/1.1 401 Unauthorized\\r\\n\\r\\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, user));
});

wss.on('connection', (ws, _req, user) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('error', console.error);
  ws.on('message', (raw, isBinary) => {
    if (isBinary) return;
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return ws.close(1003, 'format tidak valid'); }
    if (msg.type === 'sedang-mengetik') broadcast({ type: 'sedang-mengetik', userId: user.id }, ws);
  });
});

function broadcast(payload, kecuali) {
  const data = JSON.stringify(payload);
  for (const client of wss.clients) {
    // bufferedAmount besar = klien lambat; lewati agar memori server tidak membengkak
    if (client !== kecuali && client.readyState === WebSocket.OPEN && client.bufferedAmount < 1_000_000) client.send(data);
  }
}

// Heartbeat: koneksi yang tidak membalas pong dalam satu interval diputus
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);
wss.on('close', () => clearInterval(interval));

server.listen(8080);`, 'js'),
      code('Socket.IO — auth middleware, rooms, ack, Redis adapter', `import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'https://app.example.com', credentials: true },
  pingInterval: 25_000,   // heartbeat bawaan (nilai default ditulis eksplisit)
  pingTimeout: 20_000,
});
io.adapter(createAdapter(pub, sub));   // broadcast diteruskan ke semua instance lewat Redis pub/sub

io.use(async (socket, next) => {
  try {
    socket.data.user = await verifikasiToken(socket.handshake.auth.token);
    next();
  } catch {
    next(new Error('unauthorized'));   // klien menerima event connect_error
  }
});

io.on('connection', (socket) => {
  const { id } = socket.data.user;
  socket.join(\`user:\${id}\`);           // room per user: semua tab & perangkat miliknya

  socket.on('anggaran:gabung', async (anggaranId, ack) => {
    if (!(await bolehAkses(id, anggaranId))) return ack({ ok: false, error: 'forbidden' });   // otorisasi sebelum join
    socket.join(\`anggaran:\${anggaranId}\`);
    ack({ ok: true });
  });
});

// Dipanggil dari route HTTP di instance mana pun
export function notifikasiUser(userId, payload) {
  io.to(\`user:\${userId}\`).emit('transaksi:baru', payload);
}

httpServer.listen(3000);

// Klien:
// import { io } from 'socket.io-client';
// const socket = io('https://api.example.com', { auth: { token }, withCredentials: true });
// socket.on('transaksi:baru', render);
// const res = await socket.emitWithAck('anggaran:gabung', 7);`, 'js'),
      code('SSE / ws di banyak instance — Redis pub/sub manual', `import Redis from 'ioredis';

const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);   // koneksi dalam mode subscribe tidak bisa dipakai perintah lain

await sub.subscribe('transaksi');
sub.on('message', (_channel, pesan) => bus.emit('transaksi', JSON.parse(pesan)));   // teruskan ke koneksi lokal

// Ganti bus.emit(...) di route POST dengan:
await pub.publish('transaksi', JSON.stringify({ id: Date.now(), userId: req.user.id, type: 'transaksi-baru', data: t }));`, 'js'),
      callout('warn', 'Scaling bukan hanya soal adapter', 'Adapter Redis hanya meneruskan **broadcast**. State per koneksi tetap ada di instance masing-masing. Socket.IO memulai koneksi dengan HTTP long polling, jadi di belakang load balancer dengan banyak instance kamu butuh **sticky session** (misalnya hash berbasis cookie), atau paksa klien memakai `transports: [\'websocket\']`. Atur juga idle timeout di load balancer agar lebih panjang dari interval heartbeat. Fitur `connectionStateRecovery` tidak didukung adapter Redis klasik (pub/sub); untuk itu pakai Redis Streams adapter. Untuk emit dari proses tanpa server Socket.IO (misalnya worker BullMQ), pakai `@socket.io/redis-emitter`.'),
      callout('tip', 'Desain sistem', 'Untuk diskusi arsitektur chat skala besar (presence, urutan pesan, fan-out), lihat [System Design: Chat Realtime](#interview.sd-chat-realtime).'),
      ...quiz([
        ['JSE-07', 'Socket.IO berjalan di 3 replika di belakang load balancer. User A terhubung ke replika 1 dan tidak menerima notifikasi yang di-emit dari replika 2. Apa yang kurang?', 'Adapter lintas instance, misalnya `@socket.io/redis-adapter`. Tanpa adapter, `io.to(room).emit` hanya menjangkau socket di proses yang memanggilnya. Dengan adapter, event dipublikasikan ke Redis lalu diteruskan ke semua replika. Selain itu, aktifkan sticky session bila transport long polling dipakai, agar handshake dan request polling berikutnya mendarat di instance yang sama.'],
        ['JSE-08', 'Mengapa heartbeat aplikasi diperlukan, padahal TCP bisa mendeteksi koneksi putus?', 'Koneksi bisa mati diam-diam: Wi-Fi hilang, laptop sleep, atau NAT dan proxy memutus koneksi idle tanpa mengirim FIN. Server tidak tahu dan tetap menyimpan socket, sehingga memori bocor dan broadcast dikirim ke koneksi mati. Ping/pong dengan batas waktu mendeteksi kondisi ini lalu memanggil `terminate()`. Pada SSE, baris komentar periodik juga menjaga proxy agar tidak menganggap koneksi idle.'],
        ['JSE-09', 'Notifikasi status job impor hanya mengalir dari server ke klien. SSE atau WebSocket?', 'SSE sudah cukup dan lebih sederhana: HTTP biasa, cookie dan auth middleware tetap berlaku, reconnect dan `Last-Event-ID` sudah bawaan browser, serta mudah lewat proxy dan HTTP/2. WebSocket dipilih bila klien juga sering mengirim pesan dengan latensi rendah, seperti chat, editor kolaboratif, atau game. Catatan: di HTTP/1.1 browser membatasi sekitar 6 koneksi per domain, jadi sajikan SSE lewat HTTP/2.'],
      ]),
      ...practice('jse-realtime', [
        'Endpoint SSE `/api/events` mengirim `transaksi-baru` ke tab lain milik user yang sama. Tutup tab dan pastikan jumlah listener kembali (cek `bus.listenerCount(\'transaksi\')`).',
        'Server ws menolak upgrade tanpa sesi atau dari Origin lain dengan 401. Uji dengan `wscat` atau `websocat`.',
        'Putuskan jaringan klien secara paksa (DevTools → Offline); koneksi di server di-`terminate` dalam waktu kurang dari 60 detik.',
        'Jalankan 2 instance Socket.IO + Redis (docker compose); notifikasi dari instance 1 sampai ke klien di instance 2.',
      ]),
      references(['ws (GitHub)', 'https://github.com/websockets/ws'], ['Socket.IO v4 docs', 'https://socket.io/docs/v4/'], ['Socket.IO Redis adapter', 'https://socket.io/docs/v4/redis-adapter/'], ['Socket.IO: multiple nodes', 'https://socket.io/docs/v4/using-multiple-nodes/'], ['MDN: Using server-sent events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events']),
    ],
  },
  {
    id: 'jse-node-bullmq-redis',
    title: 'Node.js: Background Job dengan BullMQ & Caching Redis',
    summary: 'Antrian BullMQ: retry, backoff, concurrency, rate limit, job scheduler, idempotensi, graceful shutdown; cache-aside Redis, stampede, dan strategi invalidasi.',
    track: NODE_CORE, source: jsEcosystemSource, duration: '2,5 jam', level: 'Hard',
    blocks: [
      paragraph('Request HTTP harus cepat. Pekerjaan yang lambat atau tidak wajib selesai sebelum respons, seperti membuat PDF laporan, mengirim email, atau mengimpor CSV, dipindahkan ke **antrian**. API cukup membalas `202 Accepted`, lalu proses **worker** terpisah mengerjakannya dengan retry otomatis. **BullMQ** (v5, cek versi terbaru) memakai Redis sebagai penyimpanan antrian. Redis yang sama juga sering dipakai sebagai **cache** untuk mengurangi query berat ke database.'),
      code('Terminal', `npm i bullmq ioredis
docker run -d --name redis-queue -p 6379:6379 redis:7 redis-server --maxmemory-policy noeviction`, 'bash'),
      code('queue.js — producer di API', `import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

export const laporanQueue = new Queue('laporan', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2_000 },   // tunggu 2s, 4s, 8s, 16s antar percobaan
    removeOnComplete: { count: 1000 },                // simpan 1000 job sukses terakhir
    removeOnFail: { age: 7 * 24 * 3600 },             // job gagal disimpan 7 hari untuk investigasi
  },
});

app.post('/api/laporan', requireAuth, async (req, res) => {
  const { bulan } = req.body;                         // "2026-10"
  const job = await laporanQueue.add('kirim-laporan', { userId: req.user.id, bulan }, {
    jobId: \`laporan-\${req.user.id}-\${bulan}\`,         // id deterministik: klik ganda tidak membuat job ganda
  });
  res.status(202).json({ jobId: job.id });            // klien bisa memantau status (atau terima lewat SSE)
});`, 'js'),
      code('worker.js — proses terpisah', `import { Worker, UnrecoverableError } from 'bullmq';
import IORedis from 'ioredis';

// Worker WAJIB maxRetriesPerRequest: null (perintah blocking menunggu job baru)
const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

const worker = new Worker('laporan', async (job) => {
  const user = await db.cariUser(job.data.userId);
  if (!user) throw new UnrecoverableError('user tidak ditemukan');   // langsung gagal, tanpa retry

  if (await db.laporanSudahTerkirim(user.id, job.data.bulan)) return { dilewati: true };   // idempoten

  await job.updateProgress(20);
  const pdf = await buatPdfLaporan(user, job.data.bulan);
  await job.updateProgress(80);
  await kirimEmail(user.email, pdf);
  await db.tandaiLaporanTerkirim(user.id, job.data.bulan);
  return { terkirim: true };                                        // tersimpan sebagai job.returnvalue
}, {
  connection,
  concurrency: 5,                           // maksimal 5 job paralel di proses ini
  limiter: { max: 50, duration: 60_000 },   // maksimal 50 job/menit untuk SELURUH worker antrian ini (kuota email)
});

worker.on('failed', (job, err) => {
  console.error(\`job \${job?.id} gagal pada percobaan \${job?.attemptsMade}: \${err.message}\`);
});

// Graceful shutdown: tunggu job aktif selesai, jangan dibunuh di tengah jalan
for (const sinyal of ['SIGTERM', 'SIGINT']) {
  process.on(sinyal, async () => {
    await worker.close();
    await connection.quit();
    process.exit(0);
  });
}`, 'js'),
      code('Job berulang dengan Job Scheduler', `// BullMQ 5.16+: upsertJobScheduler menggantikan opsi { repeat } yang lama.
// "upsert" = aman dipanggil di setiap start/deploy, tidak membuat jadwal ganda.
await laporanQueue.upsertJobScheduler(
  'ringkasan-harian',
  { pattern: '0 7 * * *', tz: 'Asia/Jakarta' },      // setiap hari pukul 07.00 WIB
  { name: 'ringkasan', data: { tipe: 'harian' }, opts: { attempts: 3 } },
);

await laporanQueue.upsertJobScheduler('bersihkan-upload-yatim', { every: 15 * 60_000 });   // setiap 15 menit

await laporanQueue.removeJobScheduler('bersihkan-upload-yatim');
console.log(await laporanQueue.getJobSchedulers());`, 'js'),
      table(['Opsi', 'Fungsi', 'Catatan'], [
        ['`attempts` + `backoff`', 'Retry dengan jeda fixed/exponential', 'Error sementara (timeout, 503) pulih sendiri'],
        ['`UnrecoverableError`', 'Gagal permanen tanpa retry', 'Input tidak valid, data sudah dihapus'],
        ['`concurrency`', 'Job paralel per proses worker', 'Naikkan untuk job I/O; untuk job CPU tambah proses'],
        ['`limiter`', 'Rate limit global per antrian', 'Kuota API pihak ketiga'],
        ['`jobId`', 'Deduplikasi saat enqueue', 'Tidak boleh berupa angka murni; pakai string'],
        ['`removeOnComplete/Fail`', 'Batasi data job di Redis', 'Tanpa ini Redis terus membesar'],
        ['Stalled job', 'Worker mati saat memproses → job diambil worker lain', 'Karena itu handler harus idempoten'],
      ]),
      code('cache.js — cache-aside, jitter TTL, dan perlindungan stampede', `import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_CACHE_URL);   // instance terpisah dari antrian (lihat callout)
const jitter = () => Math.floor(Math.random() * 60);     // sebar waktu kedaluwarsa agar tidak serentak

export async function cacheAside(key, ttlDetik, loader, percobaan = 0) {
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit);

  // Stampede: saat key populer kedaluwarsa, hanya SATU request yang memuat ulang dari DB
  const dapatKunci = await redis.set(\`lock:\${key}\`, '1', 'EX', 10, 'NX');
  if (dapatKunci !== 'OK' && percobaan < 20) {
    await new Promise((r) => setTimeout(r, 50));
    return cacheAside(key, ttlDetik, loader, percobaan + 1);   // tunggu lalu baca cache lagi
  }
  try {
    const segar = await loader();
    await redis.set(key, JSON.stringify(segar), 'EX', ttlDetik + jitter());
    return segar;
  } finally {
    if (dapatKunci === 'OK') await redis.del(\`lock:\${key}\`);
  }
}

// Versi di dalam key: naikkan v1 → v2 bila bentuk data berubah saat deploy
const ringkasanKey = (userId) => \`ringkasan:v1:\${userId}\`;

export const ambilRingkasan = (userId) =>
  cacheAside(ringkasanKey(userId), 300, () => repo.hitungRingkasan(userId));

export async function tambahTransaksi(userId, data) {
  const t = await repo.tambah(userId, data);   // 1. tulis ke database (sumber kebenaran)
  await redis.del(ringkasanKey(userId));      // 2. HAPUS cache, jangan di-update
  return t;
}

// Banyak key per user (list berhalaman, filter)? Pakai nomor generasi, bukan KEYS/SCAN + DEL:
//   const gen = (await redis.get(\`gen:transaksi:\${userId}\`)) ?? '0';
//   key = \`transaksi:\${userId}:g\${gen}:page:\${page}\`;
//   invalidasi: await redis.incr(\`gen:transaksi:\${userId}\`);   // key lama mati sendiri lewat TTL`, 'js'),
      table(['Strategi invalidasi', 'Cara kerja', 'Kelebihan / risiko'], [
        ['TTL saja', 'Data basi maksimal selama TTL', 'Paling sederhana; cocok untuk data publik yang toleran basi'],
        ['Delete-on-write', 'Hapus key setelah commit DB', 'Umum dipakai; masih ada race kecil yang dibatasi oleh TTL'],
        ['Nomor generasi', '`INCR` generasi; key lama ditinggal', 'Invalidasi banyak key dalam O(1); butuh TTL agar memori kembali'],
        ['Write-through', 'Tulis DB dan cache bersamaan', 'Cache selalu terisi; rawan tidak konsisten bila salah satu gagal'],
        ['Pub/sub ke cache lokal', 'Broadcast invalidasi ke cache in-memory tiap instance', 'Latensi terendah; kompleksitas tertinggi'],
      ]),
      callout('warn', 'Pisahkan Redis antrian dan Redis cache', 'BullMQ mewajibkan `maxmemory-policy noeviction`. Kalau Redis membuang key saat memori penuh, data job hilang tanpa error. Cache justru membutuhkan eviction (`allkeys-lru`) supaya tidak pernah penuh. Pakai dua instance, atau minimal dua database dengan kebijakan yang sesuai di layanan terkelola. Jangan pernah memakai `KEYS *` di produksi: perintah itu memblok Redis.'),
      ...quiz([
        ['JSE-10', 'Job kirim email kena timeout lalu di-retry, padahal email pertama sebenarnya terkirim. User menerima 2 email. Bagaimana mencegahnya?', 'BullMQ menjamin *at-least-once*: job bisa dijalankan lebih dari sekali (retry, stalled job). Handler harus **idempoten**. Simpan penanda "sudah dikirim" dengan unique constraint di DB dan periksa sebelum mengirim, atau kirim idempotency key ke penyedia email bila didukung. `jobId` deterministik hanya mencegah duplikasi saat enqueue, bukan saat eksekusi ulang.'],
        ['JSE-11', 'Mengapa setelah menulis ke DB cache sebaiknya dihapus, bukan diperbarui dengan nilai baru?', 'Dua write bersamaan bisa memperbarui cache dalam urutan yang berbeda dari urutan commit di DB, sehingga cache menyimpan nilai lama sampai TTL habis. Menghapus cache lebih aman karena pembaca berikutnya memuat nilai terbaru dari DB. Race kecil masih mungkin terjadi (pembaca lama menulis nilai basi tepat setelah delete), jadi TTL tetap dipasang sebagai batas atas.'],
        ['JSE-12', 'Ribuan request datang tepat saat cache ringkasan populer kedaluwarsa, dan DB langsung kewalahan. Apa nama masalahnya dan apa solusinya?', 'Ini *cache stampede* (thundering herd). Solusinya: lock `SET NX EX` agar hanya satu request yang memuat ulang sementara request lain menunggu lalu membaca cache, jitter pada TTL agar key tidak kedaluwarsa serentak, dan untuk key yang sangat panas, refresh di background (stale-while-revalidate) sebelum TTL habis.'],
      ]),
      ...practice('jse-bullmq', [
        'Endpoint `/api/laporan` membalas 202 dalam kurang dari 50 ms; worker di proses terpisah membuat laporan dan mencatat progres.',
        'Simulasikan kegagalan acak 50%: job berhasil setelah retry dengan jeda exponential; job dengan user yang tidak ada langsung gagal tanpa retry.',
        'Kirim `SIGTERM` ke worker saat job berjalan: job selesai dulu sebelum proses berhenti.',
        'Cache `GET /api/ringkasan` dengan cache-aside; ukur latensi sebelum dan sesudah, dan pastikan ringkasan langsung benar setelah transaksi baru ditambahkan.',
      ]),
      references(['BullMQ docs', 'https://docs.bullmq.io'], ['BullMQ: Retrying failing jobs', 'https://docs.bullmq.io/guide/retrying-failing-jobs'], ['BullMQ: Job Schedulers', 'https://docs.bullmq.io/guide/job-schedulers'], ['BullMQ: Going to production', 'https://docs.bullmq.io/guide/going-to-production'], ['ioredis', 'https://github.com/redis/ioredis'], ['Redis SET (NX, EX)', 'https://redis.io/docs/latest/commands/set/']),
    ],
  },
  {
    id: 'jse-node-upload-storage',
    title: 'Node.js: Upload File & Object Storage (S3-Compatible)',
    summary: 'multer untuk file kecil, busboy streaming langsung ke S3/MinIO/R2, presigned URL untuk upload dari browser, validasi magic bytes, dan checklist keamanan.',
    track: NODE_CORE, source: jsEcosystemSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Fitur unggah foto struk atau impor CSV terlihat sederhana, tetapi menyimpan file di disk server menyulitkan scaling (setiap replika punya disk sendiri) dan membuka banyak celah keamanan. Pola produksinya: simpan file di **object storage** (AWS S3, Cloudflare R2, MinIO, dan layanan S3-compatible lain), lalu simpan *key*-nya di database. Sebelum file sampai ke storage, server membatasi ukuran, memeriksa isi file, dan menentukan nama file sendiri.'),
      code('Terminal', `npm i multer busboy file-type @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
# MinIO lokal untuk development (S3-compatible)
docker run -d -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=minio -e MINIO_ROOT_PASSWORD=minio12345 minio/minio server /data --console-address ":9001"`, 'bash'),
      code('s3.js — satu klien untuk AWS, R2, atau MinIO', `import { S3Client } from '@aws-sdk/client-s3';

export const BUCKET = process.env.S3_BUCKET;
export const s3 = new S3Client({
  region: process.env.S3_REGION ?? 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,            // http://localhost:9000 (MinIO) / endpoint R2; kosongkan untuk AWS
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),   // MinIO memakai path-style: endpoint/bucket/key
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY },
});

// Peta tipe yang diizinkan → ekstensi yang KITA tentukan
export const IZIN = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['application/pdf', 'pdf']]);`, 'js'),
      code('multer — file kecil di memori + validasi magic bytes', `import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET, IZIN } from './s3.js';

const upload = multer({
  storage: multer.memoryStorage(),                           // hanya untuk file kecil; file besar → streaming
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 5 },   // 2 MB
});

app.post('/api/transaksi/:id/bukti', requireAuth, upload.single('bukti'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file bukti wajib diisi' });

  const tipe = await fileTypeFromBuffer(req.file.buffer);    // baca magic bytes, bukan header dari klien
  if (!tipe || !IZIN.has(tipe.mime)) return res.status(415).json({ error: 'hanya JPG, PNG, atau PDF' });

  const transaksi = await repo.cariMilik(req.user.id, Number(req.params.id));   // otorisasi kepemilikan
  if (!transaksi) return res.status(404).json({ error: 'transaksi tidak ditemukan' });

  const key = \`bukti/\${req.user.id}/\${randomUUID()}.\${IZIN.get(tipe.mime)}\`;   // nama asli TIDAK dipakai
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: req.file.buffer, ContentType: tipe.mime }));
  await repo.simpanBukti(transaksi.id, key);
  res.status(201).json({ key });
});

// multer melempar MulterError (mis. LIMIT_FILE_SIZE) → ubah jadi respons rapi
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err.message });
  }
  next(err);
});`, 'js'),
      code('busboy — streaming file besar langsung ke S3', `import busboy from 'busboy';
import { Upload } from '@aws-sdk/lib-storage';
import { randomUUID } from 'node:crypto';
import { s3, BUCKET } from './s3.js';

app.post('/api/impor', requireAuth, (req, res) => {
  const bb = busboy({ headers: req.headers, limits: { fileSize: 200 * 1024 * 1024, files: 1 } });
  let selesai = null;

  bb.on('file', (field, file, info) => {
    if (field !== 'csv' || selesai) { file.resume(); return; }   // buang stream yang tidak diharapkan
    const key = \`impor/\${req.user.id}/\${randomUUID()}.csv\`;
    const upload = new Upload({
      client: s3,
      params: { Bucket: BUCKET, Key: key, Body: file, ContentType: 'text/csv' },
      partSize: 8 * 1024 * 1024,   // multipart upload: memori ≈ partSize × queueSize, bukan ukuran file
      queueSize: 4,
    });
    file.on('limit', () => upload.abort());                     // melebihi 200 MB → batalkan multipart upload
    selesai = upload.done().then(() => ({ key, nama: info.filename }));
  });

  bb.on('close', async () => {
    try {
      if (!selesai) return res.status(400).json({ error: 'field csv wajib diisi' });
      const { key } = await selesai;
      await imporQueue.add('impor-csv', { userId: req.user.id, key });   // validasi isi & parsing di worker BullMQ
      res.status(202).json({ key });
    } catch {
      res.status(413).json({ error: 'file terlalu besar atau upload gagal' });
    }
  });
  bb.on('error', (err) => { req.unpipe(bb); res.status(400).json({ error: err.message }); });
  req.pipe(bb);
});`, 'js'),
      code('Presigned URL — browser upload langsung ke storage', `import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 1. Server memberi izin upload: key ditentukan server, URL berumur 5 menit
app.post('/api/bukti/presign', requireAuth, async (req, res) => {
  const { contentType } = req.body;
  if (!IZIN.has(contentType)) return res.status(400).json({ error: 'tipe file tidak diizinkan' });
  const key = \`bukti/\${req.user.id}/\${randomUUID()}.\${IZIN.get(contentType)}\`;
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn: 300 });
  res.json({ url, key });
});

// 2. Browser: await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
//    (bucket perlu aturan CORS yang mengizinkan PUT dari origin aplikasi)

// 3. Konfirmasi: server memeriksa objek sebelum mengaitkannya ke data
app.put('/api/transaksi/:id/bukti', requireAuth, async (req, res) => {
  const { key } = req.body;
  if (!key.startsWith(\`bukti/\${req.user.id}/\`)) return res.status(403).json({ error: 'key bukan milikmu' });
  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
  if (head.ContentLength > 5 * 1024 * 1024) return res.status(413).json({ error: 'maksimal 5 MB' });   // hapus objeknya juga
  await repo.simpanBukti(Number(req.params.id), key);
  res.status(204).end();
});

// 4. Unduh dari bucket privat: URL bertanda tangan berumur pendek, dipaksa sebagai attachment
export const urlUnduh = (key) => getSignedUrl(s3,
  new GetObjectCommand({ Bucket: BUCKET, Key: key, ResponseContentDisposition: 'attachment' }), { expiresIn: 60 });`, 'js'),
      table(['Pendekatan', 'Memori server', 'Kapan dipakai'], [
        ['multer `memoryStorage`', 'Seukuran file', 'File kecil (< beberapa MB) yang perlu diperiksa atau diproses langsung'],
        ['multer `diskStorage`', 'Kecil, tetapi memakai disk lokal', 'Diproses tool lokal (ffmpeg, ClamAV) lalu dihapus'],
        ['busboy + `lib-storage`', 'Sekitar partSize × queueSize', 'File besar yang tetap harus lewat server'],
        ['Presigned URL', 'Nol (tidak lewat server)', 'Banyak atau besar file dari browser/mobile; server hanya memberi izin dan memverifikasi'],
      ]),
      callout('warn', 'Checklist keamanan upload', '1) Batasi ukuran di proxy (`client_max_body_size` Nginx) **dan** di aplikasi. 2) Jangan percaya `Content-Type` atau ekstensi dari klien: periksa magic bytes. 3) Key acak buatan server; jangan pernah memakai nama file asli sebagai path (path traversal, lihat [Injection](#web.sec-injection)). 4) Bucket privat; akses lewat URL bertanda tangan berumur pendek. 5) Jangan sajikan HTML/SVG unggahan secara inline dari origin aplikasi (stored XSS, lihat [XSS & CSRF](#web.sec-xss-csrf)); pakai `Content-Disposition: attachment` atau domain terpisah. 6) Pindai malware untuk file yang dibagikan ke pengguna lain. 7) Hapus objek yatim (upload tanpa konfirmasi) dengan job terjadwal atau lifecycle rule.'),
      callout('info', 'Presigned PUT tidak membatasi ukuran', 'URL presigned PUT tidak menjamin batas ukuran file. Untuk menegakkan batas sebelum upload, pakai **presigned POST** (`@aws-sdk/s3-presigned-post`) dengan kondisi `content-length-range`. Alternatifnya, periksa `ContentLength` lewat `HeadObject` saat konfirmasi lalu hapus objek yang melanggar, seperti contoh di atas.'),
      ...quiz([
        ['JSE-13', 'Klien mengunggah `struk.jpg` dengan `Content-Type: image/jpeg`, tetapi isinya HTML berisi script. Validasi apa yang menangkapnya, dan apa risikonya bila lolos?', 'Ekstensi dan `Content-Type` sepenuhnya dikendalikan klien. Pemeriksaan magic bytes (`file-type`) akan mendeteksi bahwa isinya bukan JPEG lalu menolaknya. Bila lolos dan disajikan inline dari origin aplikasi, browser bisa merender HTML itu dan terjadilah *stored XSS* yang mencuri sesi. Pertahanan berlapis: key acak, `ContentType` dari hasil deteksi, `Content-Disposition: attachment`, dan domain atau bucket terpisah.'],
        ['JSE-14', 'Kapan presigned URL lebih baik daripada upload lewat server, dan apa yang tetap harus dilakukan server?', 'Presigned URL lebih baik untuk file besar atau upload dalam jumlah banyak: bandwidth, memori, dan waktu request server tidak terpakai, dan upload langsung menuju storage. Server tetap mengotorisasi (hanya user yang berhak mendapat URL, key ditentukan server, masa berlaku pendek) dan memverifikasi setelah upload (`HeadObject`: ukuran, tipe, prefix milik user) sebelum key dikaitkan ke data. Upload lewat server dipilih bila file harus diproses atau dipindai secara sinkron.'],
      ]),
      ...practice('jse-upload', [
        'Endpoint bukti transaksi menolak file 3 MB (413), file `.exe` yang di-rename menjadi `.jpg` (415), dan transaksi milik user lain (404).',
        'Upload CSV 500 MB lewat busboy ke MinIO: memori proses tetap di bawah 150 MB (pantau dengan `process.memoryUsage().rss`).',
        'Alur presigned: browser upload langsung ke MinIO (atur CORS bucket), lalu konfirmasi ke API yang memeriksa prefix key dan ukuran.',
        'Job terjadwal BullMQ menghapus objek di `bukti/` yang tidak tercatat di database setelah 24 jam.',
      ]),
      references(['multer', 'https://github.com/expressjs/multer'], ['busboy', 'https://github.com/mscdex/busboy'], ['AWS SDK v3: S3 client', 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/'], ['@aws-sdk/lib-storage', 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-storage/'], ['S3 presigned URL', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html'], ['OWASP File Upload Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html']),
    ],
  },

  // ───────────────────────── Vue & Nuxt ─────────────────────────
  {
    id: 'jse-vue-dasar',
    title: 'Vue 3 Dasar: SFC, Composition API & Template',
    summary: 'Single File Component, <script setup lang="ts">, ref/reactive/computed/watch, directive template, dan perbandingan dengan React.',
    track: VUE, source: jsEcosystemSource, duration: '2 jam', level: 'Easy',
    blocks: [
      paragraph('Vue adalah framework UI progresif dengan **reaktivitas berbasis proxy**. Kamu cukup mengubah nilai, lalu Vue tahu persis bagian template mana yang perlu diperbarui. Tidak ada aturan "panggil setter" seperti `useState`, dan tidak perlu `useMemo` atau dependency array. Satu komponen ditulis dalam satu file `.vue` (**SFC**) yang berisi logika, template, dan style. Acuan: **Vue 3.5** dengan Composition API dan `<script setup>` (cek versi terbaru).'),
      code('Terminal', `npm create vue@latest pencatat-vue   # pilih: TypeScript, Router, Pinia, Vitest, ESLint
cd pencatat-vue && npm install && npm run dev
npm run type-check                    # vue-tsc: cek tipe .vue (Vite hanya membuang tipe, tidak mengecek)`, 'bash'),
      code('src/components/TransaksiCepat.vue — SFC lengkap', `<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type Jenis = 'pemasukan' | 'pengeluaran';
interface Transaksi { id: number; jenis: Jenis; deskripsi: string; jumlah: number }

const filters = ['semua', 'pemasukan', 'pengeluaran'] as const;
const deskripsi = ref('');
const jumlah = ref<number | null>(null);
const jenis = ref<Jenis>('pengeluaran');
const filter = ref<(typeof filters)[number]>('semua');
const daftar = ref<Transaksi[]>(JSON.parse(localStorage.getItem('transaksi') ?? '[]'));

// computed: nilai turunan, di-cache sampai dependensinya berubah
const tampil = computed(() => filter.value === 'semua' ? daftar.value : daftar.value.filter((t) => t.jenis === filter.value));
const saldo = computed(() => daftar.value.reduce((s, t) => s + (t.jenis === 'pemasukan' ? t.jumlah : -t.jumlah), 0));
const valid = computed(() => deskripsi.value.trim() !== '' && (jumlah.value ?? 0) > 0);

function tambah() {
  if (!valid.value) return;
  daftar.value.push({ id: Date.now(), jenis: jenis.value, deskripsi: deskripsi.value.trim(), jumlah: jumlah.value! });
  deskripsi.value = '';
  jumlah.value = null;
}
const hapus = (id: number) => { daftar.value = daftar.value.filter((t) => t.id !== id); };

// watch: efek samping saat data berubah; deep karena isi array dimutasi (push)
watch(daftar, (baru) => localStorage.setItem('transaksi', JSON.stringify(baru)), { deep: true });

const rupiah = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<template>
  <h1>Saldo: <span :class="{ minus: saldo < 0 }">{{ rupiah(saldo) }}</span></h1>

  <form @submit.prevent="tambah">
    <input v-model.trim="deskripsi" placeholder="Deskripsi" aria-label="Deskripsi" />
    <input v-model.number="jumlah" type="number" min="1" placeholder="Jumlah" aria-label="Jumlah" />
    <select v-model="jenis" aria-label="Jenis">
      <option value="pemasukan">Pemasukan</option>
      <option value="pengeluaran">Pengeluaran</option>
    </select>
    <button :disabled="!valid">Tambah</button>
  </form>

  <div role="group" aria-label="Filter">
    <button v-for="f in filters" :key="f" :aria-pressed="filter === f" @click="filter = f">{{ f }}</button>
  </div>

  <p v-if="tampil.length === 0">Belum ada transaksi.</p>
  <ul v-else>
    <li v-for="t in tampil" :key="t.id" :class="t.jenis">
      {{ t.deskripsi }}: {{ rupiah(t.jumlah) }}
      <button @click="hapus(t.id)">Hapus</button>
    </li>
  </ul>
</template>

<style scoped>
/* scoped: hanya berlaku untuk komponen ini */
.minus { color: crimson; }
.pemasukan { border-left: 4px solid seagreen; }
.pengeluaran { border-left: 4px solid crimson; }
</style>`, 'html'),
      code('ref vs reactive, watch vs watchEffect', `import { reactive, ref, toRefs, watch, watchEffect } from 'vue';

const hitung = ref(0);                               // nilai apa pun; .value di script, tanpa .value di template
const form = reactive({ deskripsi: '', jumlah: 0 }); // hanya objek; tanpa .value

hitung.value++;
form.jumlah = 5000;

// JEBAKAN: destrukturisasi reactive memutus reaktivitas
const { deskripsi } = form;        // string biasa, tidak reaktif lagi
const { jumlah } = toRefs(form);   // ref yang tetap terhubung ke form.jumlah

watch(hitung, (baru, lama) => console.log(lama, '→', baru));        // sumber eksplisit, ada nilai lama
watch(() => form.jumlah, (baru) => console.log('jumlah', baru));    // properti reactive: pakai getter
watch([hitung, () => form.deskripsi], ([h, d]) => console.log(h, d)); // beberapa sumber
watchEffect(() => console.log('otomatis melacak', form.jumlah));     // jalan langsung, dependensi dilacak sendiri`, 'ts'),
      table(['Directive', 'Fungsi', 'Contoh'], [
        ['`{{ }}`', 'Interpolasi teks (otomatis di-escape)', '`{{ rupiah(saldo) }}`'],
        ['`v-bind` / `:`', 'Bind atribut atau prop', '`:disabled="!valid"`, `:class="{ minus: saldo < 0 }"`'],
        ['`v-on` / `@`', 'Event listener + modifier', '`@submit.prevent="tambah"`, `@keyup.enter="cari"`'],
        ['`v-model`', 'Two-way binding + modifier', '`v-model.trim`, `v-model.number`, `v-model.lazy`'],
        ['`v-if` / `v-else-if` / `v-else`', 'Render bersyarat (elemen dibuat/dihapus)', '`v-if="tampil.length === 0"`'],
        ['`v-show`', 'Toggle CSS `display` (elemen tetap ada)', 'Untuk elemen yang sering di-toggle'],
        ['`v-for` + `:key`', 'Perulangan dengan key stabil', '`v-for="t in tampil" :key="t.id"`'],
        ['`v-html`', 'HTML mentah, **rawan XSS**', 'Hindari untuk input pengguna'],
      ]),
      table(['React', 'Vue 3'], [
        ['`useState`', '`ref` / `reactive`'],
        ['`useMemo`', '`computed` (dependensi otomatis)'],
        ['`useEffect`', '`watch` / `watchEffect` / `onMounted` / `onUnmounted`'],
        ['JSX + `map` / `&&`', 'Template + `v-for` / `v-if`'],
        ['props + `children`', 'props + slots'],
        ['Context', '`provide` / `inject`'],
        ['Zustand / Redux', 'Pinia'],
        ['Next.js', 'Nuxt'],
      ]),
      callout('warn', 'Jangan gabungkan v-if dan v-for di elemen yang sama', 'Di Vue 3, `v-if` dievaluasi **sebelum** `v-for`, sehingga variabel perulangan belum tersedia di dalam `v-if`. Filter data lewat `computed` (seperti `tampil` di atas), atau bungkus dengan `<template v-for>`.'),
      callout('tip', 'Tooling', 'Pasang ekstensi **Vue - Official** (Volar) di VS Code untuk autocomplete dan pengecekan tipe di template, serta **Vue DevTools** di browser untuk memeriksa state komponen dan Pinia.'),
      ...quiz([
        ['JSE-15', '`const { jumlah } = reactive({ jumlah: 0 })`, lalu `jumlah++` tidak mengubah UI. Mengapa?', 'Destrukturisasi menyalin nilai primitif keluar dari proxy reactive, sehingga `jumlah` hanya angka biasa dan Vue tidak lagi melacaknya. Akses lewat objeknya (`form.jumlah++`), pakai `toRefs(form)`, atau gunakan `ref` sejak awal.'],
        ['JSE-16', 'Apa beda `computed` dengan fungsi biasa yang dipanggil di template?', '`computed` di-cache dan hanya dihitung ulang bila dependensi reaktifnya berubah, sedangkan fungsi biasa dijalankan setiap kali komponen render. Pakai `computed` untuk nilai turunan (saldo, daftar terfilter), dan jangan menaruh efek samping (fetch, localStorage) di dalamnya; itu tugas `watch`.'],
      ]),
      ...practice('jse-vue-dasar', [
        'Buat proyek dengan `npm create vue@latest`; `npm run type-check` lulus tanpa error.',
        'Komponen TransaksiCepat: tambah, hapus, filter, dan saldo tetap tersimpan setelah reload.',
        'Tulis ulang satu komponen dari proyek [Pencatat Keuangan React v1](#js.pencatat-keuangan-v1-persiapan-daftar-transaksi) ke Vue, lalu catat perbedaan jumlah baris dan konsepnya.',
        'Tunjukkan jebakan destrukturisasi `reactive` dalam contoh kecil, lalu perbaiki dengan `toRefs`.',
      ]),
      references(['Vue: Introduction', 'https://vuejs.org/guide/introduction.html'], ['Reactivity Fundamentals', 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html'], ['Template Syntax', 'https://vuejs.org/guide/essentials/template-syntax.html'], ['Watchers', 'https://vuejs.org/guide/essentials/watchers.html'], ['TypeScript with Composition API', 'https://vuejs.org/guide/typescript/composition-api.html']),
    ],
  },
  {
    id: 'jse-vue-komponen',
    title: 'Komponen Vue: Props, Emits, v-model, Slots & Composables',
    summary: 'defineProps/defineEmits bertipe, defineModel, slot bernama dan scoped slot generik, provide/inject dengan InjectionKey, dan composable yang dapat dipakai ulang.',
    track: VUE, source: jsEcosystemSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('Aplikasi Vue disusun dari komponen kecil yang berkomunikasi dengan aturan jelas: data turun lewat **props**, kejadian naik lewat **emits**, dan konten disisipkan lewat **slots**. Logika yang dipakai berulang (fetch, format uang, debounce) diekstrak menjadi **composable**, fungsi `use*` yang setara dengan custom hook di React. Dengan `<script setup lang="ts">`, semua kontrak ini bertipe penuh.'),
      code('TransaksiItem.vue — props & emits bertipe', `<script setup lang="ts">
import type { Transaksi } from '@/types';

// Vue 3.5+: destrukturisasi props tetap reaktif dan bisa diberi nilai default
const { transaksi, bisaHapus = true } = defineProps<{ transaksi: Transaksi; bisaHapus?: boolean }>();

// Sintaks tuple bernama: nama event → argumen
const emit = defineEmits<{ hapus: [id: number]; edit: [t: Transaksi] }>();
</script>

<template>
  <li :class="transaksi.jenis">
    <span>{{ transaksi.deskripsi }}</span>
    <strong>{{ transaksi.jumlah.toLocaleString('id-ID') }}</strong>
    <button @click="emit('edit', transaksi)">Edit</button>
    <button v-if="bisaHapus" @click="emit('hapus', transaksi.id)">Hapus</button>
  </li>
</template>

<!-- Induk:
<TransaksiItem v-for="t in daftar" :key="t.id" :transaksi="t" @hapus="hapus" @edit="bukaEditor" />
-->`, 'html'),
      code('InputRupiah.vue — v-model pada komponen dengan defineModel', `<script setup lang="ts">
// Vue 3.4+: defineModel = prop modelValue + emit update:modelValue dalam satu ref
const model = defineModel<number | null>({ required: true });
const { id, label, error } = defineProps<{ id: string; label: string; error?: string }>();
</script>

<template>
  <label :for="id">{{ label }}</label>
  <input :id="id" v-model.number="model" type="number" min="0" inputmode="numeric"
    :aria-invalid="!!error" :aria-describedby="error ? id + '-err' : undefined" />
  <p v-if="error" :id="id + '-err'" role="alert">{{ error }}</p>
</template>

<!-- Pemakaian:
<InputRupiah id="jumlah" label="Jumlah" v-model="form.jumlah" :error="errors.jumlah" />
Beberapa v-model: const jenis = defineModel<string>('jenis')  →  <Komp v-model:jenis="form.jenis" />
-->`, 'html'),
      code('DaftarData.vue — komponen generik dengan slot bernama & scoped slot', `<script setup lang="ts" generic="T extends { id: number }">
defineProps<{ items: T[]; memuat?: boolean }>();
defineSlots<{
  default(props: { item: T; index: number }): unknown;   // scoped slot: induk menerima item
  kosong?(): unknown;
  header?(): unknown;
}>();
</script>

<template>
  <header v-if="$slots.header"><slot name="header" /></header>
  <p v-if="memuat" aria-live="polite">Memuat…</p>
  <slot v-else-if="items.length === 0" name="kosong"><p>Tidak ada data.</p></slot>
  <ul v-else>
    <li v-for="(item, index) in items" :key="item.id">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>

<!-- Pemakaian — tipe item disimpulkan dari :items
<DaftarData :items="transaksi" :memuat="loading">
  <template #header><h2>Transaksi</h2></template>
  <template #default="{ item }">{{ item.deskripsi }}: {{ item.jumlah }}</template>
  <template #kosong><p>Belum ada transaksi bulan ini.</p></template>
</DaftarData>
-->`, 'html'),
      code('composables/ — provide/inject bertipe & useApi dengan pembatalan', `// composables/usePengaturan.ts
import { inject, provide, readonly, ref, type InjectionKey, type Ref } from 'vue';

interface Pengaturan { mataUang: Readonly<Ref<string>>; setMataUang: (m: string) => void }
const PengaturanKey: InjectionKey<Pengaturan> = Symbol('pengaturan');

export function providePengaturan() {          // panggil di komponen induk (mis. App.vue)
  const mataUang = ref('IDR');
  provide(PengaturanKey, { mataUang: readonly(mataUang), setMataUang: (m) => { mataUang.value = m; } });
}

export function usePengaturan() {              // panggil di keturunan mana pun
  const p = inject(PengaturanKey);
  if (!p) throw new Error('usePengaturan() harus berada di bawah providePengaturan()');
  return p;
}

// composables/useApi.ts
import { onWatcherCleanup, ref, shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue';

export function useApi<T>(url: MaybeRefOrGetter<string>) {
  const data = shallowRef<T | null>(null);
  const error = ref<string | null>(null);
  const loading = ref(false);

  watchEffect(async () => {
    const target = toValue(url);               // dibaca sebelum await → dilacak sebagai dependensi
    const ctrl = new AbortController();
    onWatcherCleanup(() => ctrl.abort());      // Vue 3.5+: batalkan request lama saat url berubah
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(target, { signal: ctrl.signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      data.value = await res.json();
    } catch (e) {
      if (!ctrl.signal.aborted) error.value = (e as Error).message;
    } finally {
      if (!ctrl.signal.aborted) loading.value = false;
    }
  });

  return { data, error, loading };             // kembalikan ref → aman didestrukturisasi
}

// Pemakaian:
// const jenis = ref('pengeluaran');
// const { data, loading } = useApi<Transaksi[]>(() => \`/api/transaksi?jenis=\${jenis.value}\`);`, 'ts'),
      table(['Kebutuhan', 'Mekanisme', 'Catatan'], [
        ['Induk → anak', 'Props', 'Satu arah; anak tidak boleh mengubah prop'],
        ['Anak → induk', 'Emits', 'Kontrak event bertipe'],
        ['Nilai dua arah', '`v-model` / `defineModel`', 'Input kustom, dialog terbuka/tertutup'],
        ['Induk menentukan isi', 'Slots / scoped slots', 'Layout, list generik, kartu'],
        ['Subtree dalam tanpa prop drilling', '`provide` / `inject`', 'Tema, pengaturan, komponen compound (Tabs, Form)'],
        ['Logika dipakai ulang', 'Composable `use*`', 'State baru per pemanggil'],
        ['State global aplikasi', 'Pinia', 'Dibahas di modul berikutnya'],
      ]),
      callout('warn', 'Jangan mutasi props', 'Mengubah `transaksi.jumlah` dari anak memang "berhasil" untuk objek (karena proxy-nya sama), tetapi aliran data jadi sulit dilacak, dan Vue memperingatkan bila prop di-assign ulang. Kirim event (`emit(\'edit\', ...)`), pakai `defineModel`, atau salin ke state lokal (`const draf = ref({ ...transaksi })`).'),
      callout('tip', 'Aturan composable', 'Beri nama `useXxx`, panggil secara sinkron di `<script setup>` (bukan di dalam callback atau setelah `await`), terima input sebagai `MaybeRefOrGetter` lalu baca dengan `toValue`, dan kembalikan objek berisi `ref` agar pemanggil bisa mendestrukturisasi tanpa kehilangan reaktivitas.'),
      ...quiz([
        ['JSE-17', 'Di Vue 3.5, `const { id } = defineProps<{ id: number }>()` lalu `watch(id, ...)` menghasilkan error atau tidak pernah terpicu. Mengapa, dan apa perbaikannya?', 'Compiler mengubah akses `id` menjadi `props.id`, tetapi `watch(id)` menerima *nilai* angka saat itu, bukan sumber reaktif. Bungkus dengan getter: `watch(() => id, ...)`. Hal yang sama berlaku saat meneruskan prop ke composable: kirim `() => id`, bukan `id`.'],
        ['JSE-18', 'Kapan memakai composable, provide/inject, dan Pinia?', 'Composable untuk logika yang dipakai ulang dengan state terpisah per pemanggil (`useApi`, `useDebounce`). Provide/inject untuk berbagi state ke satu subtree tertentu tanpa prop drilling, misalnya komponen compound atau pengaturan per halaman. Pinia untuk state global yang dibagikan ke seluruh aplikasi, dengan devtools, plugin, dan dukungan SSR yang aman.'],
      ]),
      ...practice('jse-vue-komponen', [
        'Pecah TransaksiCepat menjadi `FormTransaksi`, `TransaksiItem`, dan `DaftarData`; props dan emits bertipe, `npm run type-check` lulus.',
        'Buat `InputRupiah` dengan `defineModel` dan dukungan error yang aksesibel.',
        'Gunakan `DaftarData` dengan dua tipe item berbeda (transaksi dan kategori); autocomplete slot prop menampilkan tipe yang benar.',
        'Ganti fetch manual dengan `useApi`; mengganti filter dengan cepat tidak menyebabkan respons lama menimpa respons baru.',
      ]),
      references(['Props', 'https://vuejs.org/guide/components/props.html'], ['Component Events', 'https://vuejs.org/guide/components/events.html'], ['Component v-model', 'https://vuejs.org/guide/components/v-model.html'], ['Slots', 'https://vuejs.org/guide/components/slots.html'], ['Provide / Inject', 'https://vuejs.org/guide/components/provide-inject.html'], ['Composables', 'https://vuejs.org/guide/reusability/composables.html']),
    ],
  },
  {
    id: 'jse-vue-pinia-router',
    title: 'Pinia & Vue Router: State Global, Routing Dinamis & Guard',
    summary: 'Setup store Pinia, storeToRefs, route dinamis dengan props, nested & lazy routes, RouteMeta bertipe, navigation guard, dan komponen yang dipakai ulang antar route.',
    track: VUE, source: jsEcosystemSource, duration: '2 jam', level: 'Med',
    blocks: [
      paragraph('**Pinia** adalah state management resmi Vue: store berupa fungsi `defineStore` yang ringan, bertipe otomatis, terlihat di Vue DevTools, dan aman untuk SSR. **Vue Router** memetakan URL ke komponen, mendukung parameter dinamis, route bersarang, lazy loading, dan guard untuk alur login. Acuan: **Pinia 3** dan API **Vue Router 4** (cek versi terbaru).'),
      code('src/stores/auth.ts & main.ts', `import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface User { id: number; nama: string }

// Setup store: ref = state, computed = getter, function = action
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const siap = ref(false);                       // sesi sudah dicek ke server?
  const sudahLogin = computed(() => user.value !== null);

  async function muatSesi() {
    const res = await fetch('/api/me', { credentials: 'include' });   // sesi di cookie httpOnly, bukan localStorage
    user.value = res.ok ? await res.json() : null;
    siap.value = true;
  }
  async function login(email: string, password: string) {
    const res = await fetch('/api/login', { method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) throw new Error('Email atau password salah');
    user.value = await res.json();
  }
  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    user.value = null;
  }
  return { user, siap, sudahLogin, muatSesi, login, logout };
});

// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';

createApp(App).use(createPinia()).use(router).mount('#app');   // Pinia sebelum router agar guard bisa memakai store`, 'ts'),
      code('Memakai store di komponen', `<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '@/stores/transaksi';

const store = useTransaksiStore();
const { tampil, ringkasan, memuat } = storeToRefs(store);   // state & getter tetap reaktif
const { muat, hapus } = store;                               // action boleh didestrukturisasi langsung

muat();
</script>

<template>
  <p v-if="memuat">Memuat…</p>
  <p>Saldo: {{ ringkasan.saldo }}</p>
  <ul><li v-for="t in tampil" :key="t.id">{{ t.deskripsi }} <button @click="hapus(t.id)">Hapus</button></li></ul>
</template>`, 'html'),
      code('src/router/index.ts — dinamis, nested, lazy, guard', `import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DaftarView from '@/views/DaftarView.vue';      // halaman utama: dimuat langsung

declare module 'vue-router' {
  interface RouteMeta { butuhLogin?: boolean; judul?: string }   // meta bertipe
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'daftar', component: DaftarView, meta: { butuhLogin: true, judul: 'Transaksi' } },
    {
      path: '/transaksi/:id',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),   // lazy: chunk terpisah, dimuat saat dikunjungi
      props: (route) => ({ id: Number(route.params.id) }), // param → prop bertipe number
      meta: { butuhLogin: true, judul: 'Detail' },
    },
    {
      path: '/laporan',
      component: () => import('@/views/LaporanLayout.vue'),   // berisi <RouterView /> untuk anak
      meta: { butuhLogin: true, judul: 'Laporan' },
      children: [
        { path: '', redirect: { name: 'laporan-bulanan' } },
        { path: 'bulanan', name: 'laporan-bulanan', component: () => import('@/views/LaporanBulanan.vue') },
        { path: 'kategori', name: 'laporan-kategori', component: () => import('@/views/LaporanKategori.vue') },
      ],
    },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
  ],
  scrollBehavior: (_to, _from, posisiTersimpan) => posisiTersimpan ?? { top: 0 },
});

// meta anak digabung dengan meta induk, jadi /laporan/bulanan juga butuhLogin
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.siap) await auth.muatSesi();
  if (to.meta.butuhLogin && !auth.sudahLogin) return { name: 'login', query: { redirect: to.fullPath } };
  if (to.name === 'login' && auth.sudahLogin) return { name: 'daftar' };
  // tidak mengembalikan apa pun = lanjutkan navigasi
});

router.afterEach((to) => {
  document.title = to.meta.judul ? \`\${to.meta.judul} · Pencatat Keuangan\` : 'Pencatat Keuangan';
});`, 'ts'),
      code('DetailView.vue — param berubah & cegah keluar saat belum disimpan', `<script setup lang="ts">
import { ref, watch } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { useTransaksiStore } from '@/stores/transaksi';
import type { Transaksi } from '@/types';

const { id } = defineProps<{ id: number }>();
const router = useRouter();
const store = useTransaksiStore();
const draf = ref<Transaksi | null>(null);
const adaPerubahan = ref(false);

// /transaksi/1 → /transaksi/2 memakai ULANG komponen yang sama: pantau id, bukan hanya saat mount
watch(() => id, async (baru) => {
  await store.pastikanTermuat();
  const t = store.daftar.find((x) => x.id === baru);
  if (!t) return router.replace({ name: 'not-found', params: { pathMatch: ['transaksi', String(baru)] } });
  draf.value = { ...t };
  adaPerubahan.value = false;
}, { immediate: true });

onBeforeRouteLeave(() => {
  if (adaPerubahan.value && !window.confirm('Perubahan belum disimpan. Tinggalkan halaman?')) return false;
});
</script>

<template>
  <form v-if="draf" @input="adaPerubahan = true" @submit.prevent="store.ubah(draf.id, draf).then(() => (adaPerubahan = false))">
    <input v-model="draf.deskripsi" aria-label="Deskripsi" />
    <input v-model.number="draf.jumlah" type="number" aria-label="Jumlah" />
    <button>Simpan</button>
    <RouterLink :to="{ name: 'daftar' }">Kembali</RouterLink>
  </form>
</template>`, 'html'),
      table(['Guard', 'Lokasi', 'Contoh kegunaan'], [
        ['`router.beforeEach`', 'Global', 'Cek login, muat sesi sekali'],
        ['`beforeEnter`', 'Per route di definisi routes', 'Hanya untuk route admin'],
        ['`onBeforeRouteUpdate`', 'Komponen; param route berubah', 'Alternatif `watch` untuk memuat data baru'],
        ['`onBeforeRouteLeave`', 'Komponen; akan meninggalkan route', 'Konfirmasi perubahan belum disimpan'],
        ['`router.afterEach`', 'Global, setelah navigasi', 'Judul halaman, analytics'],
      ]),
      table(['Pinia: Setup store', 'Pinia: Option store'], [
        ['`defineStore(\'id\', () => { ... })`', '`defineStore(\'id\', { state, getters, actions })`'],
        ['Bebas memakai composable & `watch` di dalamnya', 'Struktur tetap, mirip Vuex'],
        ['`$reset()` harus ditulis sendiri', '`$reset()` tersedia bawaan'],
        ['Semua state harus di-*return*', 'Semua di `state()` otomatis menjadi state'],
      ]),
      callout('warn', 'Guard frontend hanya UX', 'Guard `butuhLogin` mencegah pengguna *melihat* halaman, tetapi siapa pun tetap bisa memanggil API secara langsung. Server tetap wajib memeriksa sesi dan kepemilikan data di setiap endpoint. Lihat [Otorisasi](#web.sec-otorisasi).'),
      ...quiz([
        ['JSE-19', '`const { saldo } = useTransaksiStore()` menampilkan nilai awal tetapi tidak pernah berubah. Mengapa?', 'Store adalah objek `reactive`. Destrukturisasi langsung menyalin nilai saat itu dan memutus reaktivitas. Pakai `const { saldo } = storeToRefs(store)` untuk state dan getter. Action boleh didestrukturisasi langsung karena berupa fungsi biasa.'],
        ['JSE-20', 'Navigasi dari `/transaksi/1` ke `/transaksi/2` mengubah URL, tetapi data di halaman masih transaksi 1. Apa penyebab dan solusinya?', 'Vue Router memakai ulang instance komponen yang sama bila route record-nya sama, sehingga `onMounted` tidak berjalan lagi. Pantau parameter dengan `watch(() => id, ..., { immediate: true })` atau `onBeforeRouteUpdate`. Bila komponen memang harus dibuat ulang, pasang `:key="$route.fullPath"` pada `<RouterView>`, dengan konsekuensi biaya render lebih besar.'],
      ]),
      ...practice('jse-vue-router', [
        'Store `auth` dan `transaksi` dengan setup store; Vue DevTools menampilkan state dan riwayat action.',
        'Route `/transaksi/:id` lazy-loaded (cek chunk terpisah di tab Network) dan menerima `id` sebagai prop number.',
        'Akses `/laporan/bulanan` tanpa login → diarahkan ke `/login?redirect=...` → setelah login kembali ke laporan.',
        'Ubah deskripsi di halaman detail lalu klik link lain: muncul konfirmasi; setelah disimpan, tidak muncul lagi.',
      ]),
      references(['Pinia: Defining a Store', 'https://pinia.vuejs.org/core-concepts/'], ['Pinia: Using a store outside components', 'https://pinia.vuejs.org/core-concepts/outside-component-usage.html'], ['Vue Router guide', 'https://router.vuejs.org/guide/'], ['Navigation Guards', 'https://router.vuejs.org/guide/advanced/navigation-guards.html'], ['Lazy Loading Routes', 'https://router.vuejs.org/guide/advanced/lazy-loading.html'], ['Typed RouteMeta', 'https://router.vuejs.org/guide/advanced/meta.html']),
    ],
  },
  {
    id: 'jse-nuxt',
    title: 'Nuxt: File-Based Routing, Data Fetching, Server Routes & Deploy',
    summary: 'Struktur Nuxt 4, routing berbasis file, useFetch/useAsyncData/$fetch, server API dengan Nitro, runtimeConfig, mode render per route, dan target deploy.',
    track: VUE, source: jsEcosystemSource, duration: '2,5 jam', level: 'Med',
    blocks: [
      paragraph('**Nuxt** bagi Vue setara dengan Next.js bagi React: routing berbasis file, SSR, auto-import komponen dan composable, serta server API di proyek yang sama lewat mesin **Nitro**. Hasil build bisa dijalankan sebagai server Node, situs statis, atau di platform serverless/edge. Acuan: **Nuxt 4** (rilis 2025, cek versi terbaru). Struktur Nuxt 4 meletakkan kode aplikasi di folder `app/`.'),
      code('Terminal & struktur proyek', `npm create nuxt@latest pencatat-nuxt
cd pencatat-nuxt && npm i zod @pinia/nuxt pinia && npm run dev

pencatat-nuxt/
├─ app/
│  ├─ app.vue                        # <NuxtLayout><NuxtPage /></NuxtLayout>
│  ├─ layouts/default.vue
│  ├─ pages/
│  │  ├─ index.vue                   → /
│  │  ├─ tentang.vue                 → /tentang
│  │  ├─ transaksi/[id].vue          → /transaksi/:id
│  │  └─ laporan/[[bulan]].vue       → /laporan dan /laporan/:bulan (opsional)
│  ├─ components/TransaksiItem.vue   # auto-import: <TransaksiItem />
│  ├─ composables/useRupiah.ts       # auto-import: useRupiah()
│  └─ middleware/auth.ts
├─ server/
│  ├─ api/transaksi/index.get.ts     → GET    /api/transaksi
│  ├─ api/transaksi/index.post.ts    → POST   /api/transaksi
│  ├─ api/transaksi/[id].get.ts      → GET    /api/transaksi/:id
│  ├─ api/transaksi/[id].delete.ts   → DELETE /api/transaksi/:id
│  └─ utils/db.ts                    # auto-import di dalam server/
├─ shared/types.ts                   # dipakai app & server (alias #shared)
└─ nuxt.config.ts`, 'bash'),
      code('server/api — route handler Nitro dengan validasi Zod', `// server/api/transaksi/index.get.ts
import { z } from 'zod';

const Query = z.object({ jenis: z.enum(['pemasukan', 'pengeluaran']).optional() });

export default defineEventHandler(async (event) => {
  const { jenis } = await getValidatedQuery(event, Query.parse);   // gagal validasi → 400 otomatis
  return db.daftar({ jenis });                                      // objek/array diserialisasi ke JSON
});

// server/api/transaksi/index.post.ts
import { z } from 'zod';

const Baru = z.object({
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  deskripsi: z.string().trim().min(1, 'deskripsi wajib diisi'),
  jumlah: z.number().int().positive('jumlah harus lebih dari 0'),
});

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, Baru.parse);
  setResponseStatus(event, 201);
  return db.tambah(data);
});

// server/api/transaksi/[id].delete.ts
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'));
  if (!(await db.hapus(id))) throw createError({ statusCode: 404, statusMessage: 'transaksi tidak ditemukan' });
  return sendNoContent(event);   // 204
});`, 'ts'),
      code('app/pages/index.vue — useFetch dengan query reaktif', `<script setup lang="ts">
import type { Transaksi } from '#shared/types';

const jenis = ref<'' | 'pemasukan' | 'pengeluaran'>('');   // ref, computed, useFetch: auto-import

const { data: daftar, status, error, refresh } = await useFetch<Transaksi[]>('/api/transaksi', {
  query: { jenis: computed(() => jenis.value || undefined) },   // berubah → fetch ulang otomatis
  default: () => [],
});

async function hapus(id: number) {
  await $fetch(\`/api/transaksi/\${id}\`, { method: 'DELETE' });   // $fetch untuk aksi pengguna
  await refresh();
}

useHead({ title: 'Transaksi' });
</script>

<template>
  <select v-model="jenis" aria-label="Filter jenis">
    <option value="">Semua</option>
    <option value="pemasukan">Pemasukan</option>
    <option value="pengeluaran">Pengeluaran</option>
  </select>
  <p v-if="status === 'pending'">Memuat…</p>
  <p v-else-if="error" role="alert">{{ error.message }}</p>
  <ul v-else>
    <TransaksiItem v-for="t in daftar" :key="t.id" :transaksi="t" @hapus="hapus" />
  </ul>
  <NuxtLink to="/laporan">Lihat laporan</NuxtLink>
</template>`, 'html'),
      code('app/pages/transaksi/[id].vue — useAsyncData & halaman 404', `<script setup lang="ts">
import type { Transaksi } from '#shared/types';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const id = computed(() => Number(route.params.id));

const { data: transaksi } = await useAsyncData(
  () => \`transaksi-\${id.value}\`,                       // key reaktif: id berubah → fetch ulang
  () => $fetch<Transaksi>(\`/api/transaksi/\${id.value}\`),
);

if (!transaksi.value) {
  throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan', fatal: true });
}
</script>

<!-- app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useState<{ id: number } | null>('user', () => null);   // state SSR-safe, dibagi server → client
  if (!user.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } });
});
-->`, 'html'),
      code('nuxt.config.ts — runtimeConfig & mode render per route', `export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    databaseUrl: '',                                   // server-only, diisi env NUXT_DATABASE_URL
    public: { appName: 'Pencatat Keuangan' },          // ikut ke browser, env NUXT_PUBLIC_APP_NAME
  },
  routeRules: {
    '/tentang': { prerender: true },                   // HTML statis saat build
    '/blog/**': { isr: 3600 },                         // cache 1 jam lalu regenerasi (platform yang mendukung)
    '/laporan/**': { ssr: false },                     // SPA: dirender di browser saja
    '/api/**': { headers: { 'cache-control': 'no-store' } },
  },
});
// Baca di server: const { databaseUrl } = useRuntimeConfig(event)`, 'ts'),
      code('Build & deploy', `npm run build                       # nuxt build → .output/ (server Nitro + aset)
node .output/server/index.mjs       # jalankan di VPS/Docker; port lewat env PORT
npm run generate                    # nuxt generate → situs statis di .output/public (tanpa server API)
NITRO_PRESET=vercel npm run build   # preset lain: netlify, cloudflare_module, node-server (default), ...`, 'bash'),
      table(['API', 'Dipakai di', 'Perilaku'], [
        ['`useFetch(url)`', 'Setup komponen/halaman', 'SSR + hasil dikirim ke client lewat payload (tanpa fetch ganda), key otomatis dari URL'],
        ['`useAsyncData(key, fn)`', 'Setup; sumber data bukan URL tunggal', 'Sama dengan useFetch, tetapi bebas memanggil apa pun (beberapa `$fetch`, SDK)'],
        ['`$fetch(url)`', 'Event handler, action Pinia, server', 'Fetch biasa (ofetch); di setup SSR akan berjalan dua kali'],
        ['`refresh()` / `refreshNuxtData(key)`', 'Setelah mutasi', 'Muat ulang data dengan key tertentu'],
      ]),
      table(['Mode render', 'Cara di Nuxt', 'Cocok untuk'], [
        ['SSR universal (default)', 'Tanpa konfigurasi', 'Halaman dinamis yang butuh SEO dan first paint cepat'],
        ['SSG / prerender', '`prerender: true` atau `nuxt generate`', 'Landing, dokumentasi, blog'],
        ['ISR / SWR', '`isr: detik` / `swr: detik`', 'Konten publik yang jarang berubah'],
        ['SPA', '`ssr: false` per route atau global', 'Dashboard privat yang berat interaksi'],
      ]),
      callout('warn', 'Jebakan data fetching', '1) Memanggil `await $fetch()` di top-level `<script setup>` membuat request berjalan di server **dan** diulang di browser saat hidrasi; pakai `useFetch`/`useAsyncData`. 2) Di Nuxt 4, `data` adalah `shallowRef`: mengubah `daftar.value[0].jumlah` tidak memicu render, jadi ganti array-nya atau panggil `refresh()` (atau set `deep: true`). 3) Dua pemanggilan dengan key sama berbagi data yang sama; beri key unik untuk data berbeda.'),
      callout('tip', 'Pernah memakai Next.js?', 'Konsep yang sama dengan nama berbeda: `pages/` ≈ App Router, `server/api` ≈ Route Handlers, `routeRules` ≈ opsi rendering per segmen, `useFetch` ≈ fetch di Server Component plus hidrasi data. Bandingkan dengan [Next.js App Router](#js.nextjs-app-router).'),
      ...quiz([
        ['JSE-21', 'Mengapa `const data = await $fetch(\'/api/transaksi\')` di top-level halaman SSR Nuxt dianggap salah?', 'Saat SSR, kode setup berjalan di server lalu dijalankan lagi di browser saat hidrasi. `$fetch` tidak menyimpan hasilnya ke payload, sehingga request terjadi dua kali dan bisa menyebabkan hydration mismatch bila datanya berubah di antara keduanya. `useFetch`/`useAsyncData` menyimpan hasil server di payload, dan browser memakainya tanpa request ulang.'],
        ['JSE-22', 'Aplikasi punya halaman `/tentang`, blog publik, dan dashboard laporan privat. Bagaimana mengatur mode render di Nuxt?', 'Pakai `routeRules` per pola route: `/tentang` dengan `prerender: true` (statis saat build), `/blog/**` dengan `isr` atau `swr` (cache lalu diregenerasi), dan `/laporan/**` dengan `ssr: false` (SPA, tidak butuh SEO, data per user). Halaman lain tetap SSR universal sebagai default.'],
      ]),
      ...practice('jse-nuxt', [
        'Port API Pencatat Keuangan ke `server/api` Nuxt dengan validasi Zod; kontrak sama dengan [Express](#js.membangun-api-financial-tracker-in-memory).',
        'Halaman daftar memakai `useFetch` dengan filter reaktif; tab Network menunjukkan tidak ada fetch ganda saat load pertama.',
        'Halaman `/transaksi/999` menampilkan halaman error 404 Nuxt.',
        'Build dengan preset `node-server`, jalankan `.output/server/index.mjs` di Docker, lalu coba `nuxt generate` untuk halaman `/tentang`.',
      ]),
      references(['Nuxt: Introduction', 'https://nuxt.com/docs/getting-started/introduction'], ['Data Fetching', 'https://nuxt.com/docs/getting-started/data-fetching'], ['Server directory (Nitro)', 'https://nuxt.com/docs/guide/directory-structure/server'], ['Rendering Modes', 'https://nuxt.com/docs/guide/concepts/rendering'], ['Deployment', 'https://nuxt.com/docs/getting-started/deployment'], ['Upgrade ke Nuxt 4', 'https://nuxt.com/docs/getting-started/upgrade']),
    ],
  },
  {
    id: 'jse-vue-proyek-pencatat',
    title: 'Proyek Vue: Pencatat Keuangan (Komponen, Pinia & Fetch API)',
    summary: 'Aplikasi Pencatat Keuangan versi Vue yang memakai kontrak API yang sama dengan backend Express/Go/FastAPI: lapisan API bertipe, store Pinia dengan optimistic delete, form tervalidasi, dan ringkasan.',
    track: VUE, source: jsEcosystemSource, duration: '3 jam', level: 'Med',
    blocks: [
      paragraph('Proyek ini membangun ulang Pencatat Keuangan dari kurikulum React, kali ini dengan Vue 3 + Pinia. Backend-nya adalah API yang sama dari [Kontrak API](#js.kontrak-api-yang-akan-dibangun): `GET/POST /api/transaksi`, `PUT/DELETE /api/transaksi/:id`, dan `GET /api/ringkasan` di port 8080, dengan error berbentuk `{ error }`. Kamu bisa memakai server Express, Go, atau FastAPI dari kurikulum lain tanpa perubahan apa pun.'),
      code('Terminal & vite.config.ts — proxy ke backend', `npm create vue@latest pencatat-vue   # TypeScript + Pinia + Vitest
cd pencatat-vue && npm install

// vite.config.ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: { '/api': 'http://localhost:8080' } },   // tanpa CORS saat development
});`, 'ts'),
      code('src/types.ts & src/api.ts — lapisan API bertipe', `// src/types.ts
export type Jenis = 'pemasukan' | 'pengeluaran';
export interface Transaksi { id: number; jenis: Jenis; deskripsi: string; jumlah: number; tanggal: string }
export type TransaksiBaru = Pick<Transaksi, 'jenis' | 'deskripsi' | 'jumlah'>;
export interface Ringkasan { pemasukan: number; pengeluaran: number; saldo: number }

// src/api.ts
import type { Ringkasan, Transaksi, TransaksiBaru } from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`/api\${path}\`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? \`HTTP \${res.status}\`);   // kontrak: { error: string }
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  daftar: () => request<Transaksi[]>('/transaksi'),
  tambah: (t: TransaksiBaru) => request<Transaksi>('/transaksi', { method: 'POST', body: JSON.stringify(t) }),
  ubah: (id: number, t: Partial<TransaksiBaru>) => request<Transaksi>(\`/transaksi/\${id}\`, { method: 'PUT', body: JSON.stringify(t) }),
  hapus: (id: number) => request<void>(\`/transaksi/\${id}\`, { method: 'DELETE' }),
  ringkasan: () => request<Ringkasan>('/ringkasan'),
};`, 'ts'),
      code('src/stores/transaksi.ts — store Pinia', `import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/api';
import type { Jenis, Ringkasan, Transaksi, TransaksiBaru } from '@/types';

export const useTransaksiStore = defineStore('transaksi', () => {
  const daftar = ref<Transaksi[]>([]);
  const memuat = ref(false);
  const error = ref<string | null>(null);
  const filter = ref<'semua' | Jenis>('semua');

  const tampil = computed(() => filter.value === 'semua' ? daftar.value : daftar.value.filter((t) => t.jenis === filter.value));
  // Dihitung lokal agar langsung konsisten dengan daftar; nilainya sama dengan GET /api/ringkasan
  const ringkasan = computed<Ringkasan>(() => {
    const total = (j: Jenis) => daftar.value.filter((t) => t.jenis === j).reduce((s, t) => s + t.jumlah, 0);
    const pemasukan = total('pemasukan');
    const pengeluaran = total('pengeluaran');
    return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
  });

  async function muat() {
    memuat.value = true;
    error.value = null;
    try {
      daftar.value = (await api.daftar()).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      memuat.value = false;
    }
  }

  async function tambah(baru: TransaksiBaru) {
    const dibuat = await api.tambah(baru);   // error dibiarkan naik agar form bisa menampilkannya
    daftar.value = [dibuat, ...daftar.value];
  }

  async function hapus(id: number) {
    const sebelum = daftar.value;
    daftar.value = daftar.value.filter((t) => t.id !== id);   // optimistic: langsung hilang dari UI
    try {
      await api.hapus(id);
    } catch (e) {
      daftar.value = sebelum;                                  // rollback
      error.value = \`Gagal menghapus: \${(e as Error).message}\`;
    }
  }

  return { daftar, memuat, error, filter, tampil, ringkasan, muat, tambah, hapus };
});`, 'ts'),
      code('src/components/FormTransaksi.vue — validasi & error server', `<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useTransaksiStore } from '@/stores/transaksi';
import type { TransaksiBaru } from '@/types';

const store = useTransaksiStore();
const awal = (): TransaksiBaru => ({ jenis: 'pengeluaran', deskripsi: '', jumlah: 0 });
const form = reactive(awal());
const disentuh = reactive({ deskripsi: false, jumlah: false });
const menyimpan = ref(false);
const errorServer = ref<string | null>(null);

const errors = computed(() => ({
  deskripsi: form.deskripsi.trim() ? null : 'Deskripsi wajib diisi',
  jumlah: form.jumlah > 0 ? null : 'Jumlah harus lebih dari 0',
}));

async function simpan() {
  disentuh.deskripsi = disentuh.jumlah = true;
  if (errors.value.deskripsi || errors.value.jumlah) return;
  menyimpan.value = true;
  errorServer.value = null;
  try {
    await store.tambah({ ...form, deskripsi: form.deskripsi.trim() });
    Object.assign(form, awal());
    Object.assign(disentuh, { deskripsi: false, jumlah: false });
  } catch (e) {
    errorServer.value = (e as Error).message;   // mis. "jumlah harus lebih dari 0" dari server
  } finally {
    menyimpan.value = false;
  }
}
</script>

<template>
  <form novalidate @submit.prevent="simpan">
    <fieldset>
      <legend>Jenis</legend>
      <label><input v-model="form.jenis" type="radio" value="pemasukan" /> Pemasukan</label>
      <label><input v-model="form.jenis" type="radio" value="pengeluaran" /> Pengeluaran</label>
    </fieldset>

    <label for="deskripsi">Deskripsi</label>
    <input id="deskripsi" v-model="form.deskripsi" @blur="disentuh.deskripsi = true"
      :aria-invalid="disentuh.deskripsi && !!errors.deskripsi" aria-describedby="deskripsi-err" />
    <p v-if="disentuh.deskripsi && errors.deskripsi" id="deskripsi-err" role="alert">{{ errors.deskripsi }}</p>

    <label for="jumlah">Jumlah (Rp)</label>
    <input id="jumlah" v-model.number="form.jumlah" type="number" min="1" inputmode="numeric"
      @blur="disentuh.jumlah = true" :aria-invalid="disentuh.jumlah && !!errors.jumlah" aria-describedby="jumlah-err" />
    <p v-if="disentuh.jumlah && errors.jumlah" id="jumlah-err" role="alert">{{ errors.jumlah }}</p>

    <button :disabled="menyimpan">{{ menyimpan ? 'Menyimpan…' : 'Tambah' }}</button>
    <p v-if="errorServer" role="alert" class="error">{{ errorServer }}</p>
  </form>
</template>`, 'html'),
      code('src/App.vue — merangkai ringkasan, filter, dan daftar', `<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTransaksiStore } from '@/stores/transaksi';
import FormTransaksi from '@/components/FormTransaksi.vue';
import TransaksiItem from '@/components/TransaksiItem.vue';   // dari modul Komponen Vue
import DaftarData from '@/components/DaftarData.vue';

const store = useTransaksiStore();
const { tampil, ringkasan, memuat, error, filter } = storeToRefs(store);
const rupiah = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

onMounted(store.muat);
</script>

<template>
  <main>
    <h1>Pencatat Keuangan</h1>
    <section class="ringkasan" aria-label="Ringkasan">
      <div>Pemasukan <strong>{{ rupiah(ringkasan.pemasukan) }}</strong></div>
      <div>Pengeluaran <strong>{{ rupiah(ringkasan.pengeluaran) }}</strong></div>
      <div>Saldo <strong :class="{ minus: ringkasan.saldo < 0 }">{{ rupiah(ringkasan.saldo) }}</strong></div>
    </section>

    <FormTransaksi />

    <p v-if="error" role="alert">{{ error }} <button @click="store.muat()">Coba lagi</button></p>

    <select v-model="filter" aria-label="Filter jenis">
      <option value="semua">Semua</option>
      <option value="pemasukan">Pemasukan</option>
      <option value="pengeluaran">Pengeluaran</option>
    </select>

    <DaftarData :items="tampil" :memuat="memuat">
      <template #default="{ item }">
        <TransaksiItem :transaksi="item" @hapus="store.hapus" />
      </template>
      <template #kosong><p>Belum ada transaksi. Tambahkan yang pertama!</p></template>
    </DaftarData>
  </main>
</template>`, 'html'),
      code('src/stores/transaksi.spec.ts — tes store dengan Vitest', `import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useTransaksiStore } from './transaksi';
import { api } from '@/api';

vi.mock('@/api');

describe('store transaksi', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('menghitung ringkasan', () => {
    const store = useTransaksiStore();
    store.daftar = [
      { id: 1, jenis: 'pemasukan', deskripsi: 'Gaji', jumlah: 5_000_000, tanggal: '2026-11-01' },
      { id: 2, jenis: 'pengeluaran', deskripsi: 'Kopi', jumlah: 18_000, tanggal: '2026-11-02' },
    ];
    expect(store.ringkasan).toEqual({ pemasukan: 5_000_000, pengeluaran: 18_000, saldo: 4_982_000 });
  });

  it('rollback bila hapus gagal', async () => {
    vi.mocked(api.hapus).mockRejectedValue(new Error('500'));
    const store = useTransaksiStore();
    store.daftar = [{ id: 1, jenis: 'pemasukan', deskripsi: 'Gaji', jumlah: 1, tanggal: '2026-11-01' }];
    await store.hapus(1);
    expect(store.daftar).toHaveLength(1);
    expect(store.error).toContain('Gagal menghapus');
  });
});`, 'ts'),
      table(['Pencatat Keuangan React', 'Versi Vue'], [
        ['`useState` + `useReducer` / Context', 'Store Pinia `useTransaksiStore`'],
        ['`useMemo` untuk ringkasan', '`computed` di store'],
        ['`useEffect(() => muat(), [])`', '`onMounted(store.muat)`'],
        ['Form terkontrol + `onChange`', '`v-model` + `reactive`'],
        ['`useOptimistic` (React 19)', 'Optimistic manual + rollback di action'],
        ['React Testing Library', 'Vitest + `setActivePinia` (dan Vue Test Utils untuk komponen)'],
      ]),
      callout('info', 'Uang sebagai integer', 'Seperti di modul backend, `jumlah` disimpan dalam rupiah bulat (integer). Format ke mata uang hanya dilakukan saat ditampilkan (`toLocaleString(\'id-ID\', ...)`) dan jangan pernah menghitung saldo dari string berformat.'),
      ...quiz([
        ['JSE-23', 'Menghapus transaksi secara optimistic gagal karena server membalas 500. Apa yang harus terjadi di UI?', 'Daftar dikembalikan ke snapshot sebelum penghapusan (rollback), lalu pesan error ditampilkan dengan `role="alert"` beserta opsi coba lagi. Jangan biarkan item hilang diam-diam padahal datanya masih ada di server, karena setelah reload item itu akan muncul kembali dan membingungkan pengguna.'],
        ['JSE-24', 'Mengapa daftar transaksi disimpan di Pinia, bukan di state lokal `App.vue`?', 'Data dipakai oleh banyak komponen (form, daftar, ringkasan, dan nanti halaman detail atau laporan lewat router). Menyimpannya di App memaksa props turun dan emit naik berantai. Pinia memusatkan state dan aksinya, terlihat di DevTools, mudah dites tanpa me-render komponen, dan bisa dipindahkan ke Nuxt dengan `@pinia/nuxt`.'],
      ]),
      ...practice('jse-vue-proyek', [
        'Jalankan backend Express (atau Go/FastAPI) di port 8080; aplikasi Vue bisa menampilkan, menambah, dan menghapus transaksi tanpa perubahan di backend.',
        'Matikan backend: muncul pesan error dengan tombol "Coba lagi"; hapus yang gagal di-rollback.',
        'Tambahkan fitur edit (PUT) lewat route `/transaksi/:id` dari modul Pinia & Vue Router, lengkap dengan konfirmasi perubahan belum disimpan.',
        'Tes Vitest untuk store (ringkasan, rollback) lulus; tambahkan satu tes komponen `FormTransaksi` dengan Vue Test Utils.',
      ]),
      references(['Vue: Quick Start', 'https://vuejs.org/guide/quick-start.html'], ['Pinia: Testing stores', 'https://pinia.vuejs.org/cookbook/testing.html'], ['Vite: server.proxy', 'https://vite.dev/config/server-options.html#server-proxy'], ['Vue Test Utils', 'https://test-utils.vuejs.org/'], ['Vitest', 'https://vitest.dev/guide/']),
    ],
  },
];
