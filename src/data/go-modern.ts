import type { Module } from '../types';
import { callout, code, paragraph, practice, quiz, references, table } from './lesson-kit';

const WEB_DB = 'Web API & Database';
const TESTING = 'Testing, Performa & Produksi';

export const goModernSource = 'Go: materi tambahan dari dokumentasi resmi Go, pgx, sqlc, dan goose (29 Oktober 2026)';

/** Ditambahkan ke track yang sudah ada; tidak membuat track baru. */
export const goModernModules: Omit<Module, 'code'>[] = [
  {
    id: 'go-pgx-sqlc',
    title: 'Database Type-Safe: pgx, sqlc & Migrasi goose',
    summary: 'Tulis SQL biasa, hasilkan kode Go bertipe, kelola skema dengan migrasi, dan transaksi yang benar.',
    track: WEB_DB, source: goModernSource, duration: '2–3 jam', level: 'Med',
    blocks: [
      paragraph('Alternatif dari ORM seperti GORM: tulis SQL apa adanya, lalu **sqlc** membaca skema dan query untuk menghasilkan fungsi Go yang bertipe. Kesalahan nama kolom atau tipe ketahuan saat generate, bukan saat produksi. **pgx** adalah driver PostgreSQL paling lengkap untuk Go, dan **goose** mengelola migrasi skema.'),
      table(['Pendekatan', 'Kelebihan', 'Kekurangan'], [
        ['database/sql manual', 'Tanpa dependensi', 'Scan kolom manual, rawan typo'],
        ['GORM', 'Cepat untuk CRUD', 'SQL tersembunyi, N+1 dan query lambat sulit dilihat'],
        ['sqlc + pgx', 'SQL eksplisit, kode bertipe, performa tinggi', 'Query dinamis kompleks perlu ditulis manual'],
      ]),
      code('Terminal', `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go install github.com/pressly/goose/v3/cmd/goose@latest
go get github.com/jackc/pgx/v5
goose -dir db/migrations create create_transaksi sql`, 'bash'),
      code('db/migrations/20261029_create_transaksi.sql', `-- +goose Up
CREATE TABLE transaksi (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    jumlah     BIGINT      NOT NULL CHECK (jumlah > 0),
    kategori   TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transaksi_user ON transaksi (user_id, created_at DESC);

-- +goose Down
DROP TABLE transaksi;`, 'sql'),
      code('db/query/transaksi.sql', `-- name: CreateTransaksi :one
INSERT INTO transaksi (user_id, jumlah, kategori)
VALUES ($1, $2, $3)
RETURNING *;

-- name: ListTransaksi :many
SELECT * FROM transaksi
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2;

-- name: TotalPerKategori :many
SELECT kategori, SUM(jumlah)::BIGINT AS total
FROM transaksi
WHERE user_id = $1
GROUP BY kategori;`, 'sql'),
      code('sqlc.yaml', `version: "2"
sql:
  - engine: postgresql
    schema: db/migrations
    queries: db/query
    gen:
      go:
        package: store
        out: internal/store
        sql_package: pgx/v5`, 'yaml'),
      code('Memakai kode hasil sqlc generate', `package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"example.com/kas/internal/store"
)

func main() {
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	q := store.New(pool)
	tx, err := q.CreateTransaksi(ctx, store.CreateTransaksiParams{UserID: 1, Jumlah: 50000, Kategori: "makan"})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("dibuat id=%d", tx.ID)
}

// Transaksi database: beberapa query harus berhasil atau gagal bersama
func pindahSaldo(ctx context.Context, pool *pgxpool.Pool, fn func(*store.Queries) error) error {
	return pgx.BeginFunc(ctx, pool, func(tx pgx.Tx) error {
		return fn(store.New(tx))   // commit bila nil, rollback bila error atau panic
	})
}`, 'go'),
      code('Terminal — alur kerja harian', `goose -dir db/migrations postgres "$DATABASE_URL" up
sqlc generate
go test ./...`, 'bash'),
      ...practice('go-sqlc', ['Migrasi up/down berjalan bersih di database kosong.', 'Tiga query sqlc ter-generate dan dipakai handler.', 'Salah ketik nama kolom di query membuat sqlc generate gagal, bukan error saat runtime.', 'Operasi dua query memakai pgx.BeginFunc dan rollback saat salah satunya gagal.']),
      references(['sqlc docs', 'https://docs.sqlc.dev/en/latest/'], ['pgx', 'https://github.com/jackc/pgx'], ['goose', 'https://github.com/pressly/goose']),
    ],
  },
  {
    id: 'go-fuzz-bench-security',
    title: 'Fuzzing, Benchmark & Keamanan Dependensi',
    summary: 'go test -fuzz untuk input aneh, benchmark dengan b.Loop, race detector, dan govulncheck di CI.',
    track: TESTING, source: goModernSource, duration: '90 menit', level: 'Med',
    blocks: [
      paragraph('Toolchain Go sudah menyertakan alat yang biasanya butuh library tambahan di bahasa lain: **fuzzing** untuk menemukan input yang membuat kode panic, **benchmark** untuk mengukur performa, **race detector**, dan **govulncheck** untuk mencari kerentanan yang benar-benar dipanggil oleh kodemu.'),
      code('parse.go dan fuzz test', `// parse.go
package kas

import (
	"errors"
	"strconv"
	"strings"
)

// ParseRupiah mengubah "Rp 1.250.000" menjadi 1250000.
func ParseRupiah(s string) (int64, error) {
	s = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(s), "Rp"))
	s = strings.ReplaceAll(s, ".", "")
	if s == "" {
		return 0, errors.New("kosong")
	}
	return strconv.ParseInt(s, 10, 64)
}

// parse_test.go (package kas, import "strings" dan "testing")
func FuzzParseRupiah(f *testing.F) {
	for _, seed := range []string{"Rp 1.250.000", "500", "Rp", ""} {
		f.Add(seed)
	}
	f.Fuzz(func(t *testing.T, s string) {
		n, err := ParseRupiah(s)
		if err == nil && n < 0 && !strings.Contains(s, "-") {
			t.Fatalf("angka negatif tanpa tanda minus: %q -> %d", s, n)
		}
	})
}`, 'go'),
      code('Terminal — fuzz, race, benchmark', `go test -run=^$ -fuzz=FuzzParseRupiah -fuzztime=30s ./...
# Input yang gagal disimpan di testdata/fuzz/ dan otomatis jadi regression test

go test -race ./...                 # deteksi data race saat tes berjalan
go test -bench=. -benchmem ./...    # ns/op, B/op, allocs/op`, 'bash'),
      code('Benchmark dengan b.Loop (Go 1.24+)', `func BenchmarkParseRupiah(b *testing.B) {
	for b.Loop() {                  // pengganti for i := 0; i < b.N; i++
		_, _ = ParseRupiah("Rp 1.250.000")
	}
}`, 'go'),
      code('Bandingkan sebelum/sesudah optimasi', `go test -bench=ParseRupiah -count=10 ./... > old.txt
# ... ubah kode ...
go test -bench=ParseRupiah -count=10 ./... > new.txt
go install golang.org/x/perf/cmd/benchstat@latest
benchstat old.txt new.txt`, 'bash'),
      code('govulncheck', `go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
# Hanya melaporkan kerentanan pada fungsi yang benar-benar terjangkau dari kodemu`, 'bash'),
      code('.github/workflows/go.yml — potongan langkah', `- uses: actions/setup-go@v5
  with:
    go-version-file: go.mod
- run: go vet ./...
- run: go test -race ./...
- run: go run golang.org/x/vuln/cmd/govulncheck@latest ./...`, 'yaml'),
      callout('tip', 'Pemakaian fuzzing', 'Fuzz fungsi yang menerima input eksternal: parser, decoder, validasi, dan konversi format. Jalankan fuzz panjang secara berkala (misalnya malam hari), dan cukup jalankan seed corpus di setiap CI.'),
      ...quiz([
        ['GOX-01', 'Mengapa benchmark tunggal (count=1) tidak cukup untuk menyimpulkan optimasi berhasil?', 'Hasil benchmark bervariasi karena noise CPU, GC, dan proses lain. Jalankan beberapa kali dan bandingkan dengan benchstat, yang menghitung perbedaan beserta signifikansi statistiknya.'],
      ]),
      ...practice('go-fuzz', ['Fuzz test menemukan minimal satu input yang tidak ditangani, lalu kode diperbaiki.', 'go test -race lulus di seluruh paket.', 'Hasil benchstat sebelum/sesudah satu optimasi dicatat.', 'govulncheck berjalan di CI.']),
      references(['Go fuzzing', 'https://go.dev/doc/security/fuzz/'], ['testing package', 'https://pkg.go.dev/testing'], ['Race detector', 'https://go.dev/doc/articles/race_detector'], ['govulncheck', 'https://go.dev/doc/security/vuln/']),
    ],
  },
];
