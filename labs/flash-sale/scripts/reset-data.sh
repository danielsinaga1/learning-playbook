#!/usr/bin/env bash
# Kembalikan data ke kondisi awal tanpa membangun ulang container.
set -e
docker compose exec -T postgres-primary psql -q -U app -d flashsale -c "
  TRUNCATE orders, processed_messages, idempotency_keys;
  UPDATE products SET stock = CASE id WHEN 1 THEN 50 WHEN 2 THEN 20 ELSE 5 END;"
docker compose exec -T redis redis-cli FLUSHALL > /dev/null
curl -s -X PUT 'http://localhost:8081/internal/payments/chaos?failureRate=0' > /dev/null
echo "data direset: stok 50/20/5, cache kosong, payment normal"
