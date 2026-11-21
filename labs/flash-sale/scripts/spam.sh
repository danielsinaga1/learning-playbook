#!/usr/bin/env bash
# Baris 9: kirim N pesanan SERENTAK dari satu user (satu proses curl --parallel), lalu hitung kode respons.
# Pemakaian: scripts/spam.sh [jumlah] [user]
N=${1:-30}
USER_ID=${2:-spammer}
args=()
for i in $(seq 1 "$N"); do
  [ "$i" -gt 1 ] && args+=(--next)
  args+=(-s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:8080/orders
         -H 'Content-Type: application/json' -H "X-User-Id: $USER_ID"
         -H "Idempotency-Key: $USER_ID-$i-$RANDOM" -d '{"productId":1,"qty":1}')
done
curl --parallel --parallel-max "$N" "${args[@]}" | sort | uniq -c
