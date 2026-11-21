#!/usr/bin/env bash
# Baris 8 + 10: buat payment gateway gagal total, kirim 8 pesanan, lalu lihat retry dan circuit breaker.
# Pemakaian: scripts/chaos-payment.sh [failureRate]   (default 1 = semua tagihan gagal)
RATE=${1:-1}
curl -s -X PUT "http://localhost:8081/internal/payments/chaos?failureRate=$RATE" > /dev/null
for i in $(seq 1 8); do bash scripts/order.sh "chaos-$i" 2 > /dev/null; done
sleep 10
echo "gateway      : $(curl -s http://localhost:8081/internal/payments/stats)"
echo "status order : $(docker compose exec -T postgres-primary psql -U app -d flashsale -Atc \
  "SELECT string_agg(status || '=' || n, ', ') FROM (SELECT status, count(*) n FROM orders
   WHERE user_id LIKE 'chaos-%' GROUP BY status) s")"
for app in app1 app2; do
  state=$(docker compose exec -T "$app" curl -s localhost:8080/actuator/circuitbreakers | grep -o '"state":"[A-Z_]*"')
  retry=$(docker compose exec -T "$app" curl -s localhost:8080/actuator/prometheus \
    | grep '^resilience4j_retry_calls_total' | sed -E 's/.*kind="([a-z_]+)".* ([0-9.]+)$/\1=\2/' | tr '\n' ' ')
  echo "$app circuit  : $state | retry: $retry"
done
