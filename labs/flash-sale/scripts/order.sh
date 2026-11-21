#!/usr/bin/env bash
# Kirim satu pesanan. Pemakaian: scripts/order.sh <user> <productId> [qty] [idempotency-key]
USER_ID=${1:-user-1}
PRODUCT=${2:-1}
QTY=${3:-1}
KEY=${4:-lab-$(date +%s)-$RANDOM}
curl -s -w ' HTTP %{http_code}\n' -X POST http://localhost:8080/orders \
  -H 'Content-Type: application/json' \
  -H "X-User-Id: $USER_ID" \
  -H "Idempotency-Key: $KEY" \
  -d "{\"productId\":$PRODUCT,\"qty\":$QTY}"
