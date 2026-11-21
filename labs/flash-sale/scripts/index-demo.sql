-- Baris 6. Jalankan: docker compose exec -T postgres-primary psql -U app -d flashsale < scripts/index-demo.sql

-- 1) 300.000 pesanan lama dari 20.000 user, agar efek index terlihat
INSERT INTO orders (id, user_id, product_id, qty, amount_idr, status, created_at)
SELECT gen_random_uuid()::text, 'arsip-' || (g % 20000), 1 + g % 3, 1, 199000, 'ARCHIVED',
       now() - make_interval(secs => g)
FROM generate_series(1, 300000) AS g;
ANALYZE orders;

-- 2) "Pesanan saya" dengan index (user_id, created_at DESC) dari schema.sql
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, product_id, qty, status, created_at FROM orders
WHERE user_id = 'arsip-42' ORDER BY created_at DESC LIMIT 20;

-- 3) Query yang sama tanpa index
DROP INDEX idx_orders_user_created;
EXPLAIN (ANALYZE, COSTS OFF)
SELECT id, product_id, qty, status, created_at FROM orders
WHERE user_id = 'arsip-42' ORDER BY created_at DESC LIMIT 20;

-- 4) Pasang kembali tanpa mengunci tulis
CREATE INDEX CONCURRENTLY idx_orders_user_created ON orders (user_id, created_at DESC);
