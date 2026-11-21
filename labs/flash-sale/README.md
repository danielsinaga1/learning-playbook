# Lab Flash Sale: 12 Baris dalam Satu Sistem

Proyek praktik untuk track **System Design dalam 12 Baris** di playbook (kurikulum Distributed System).
Panduan lengkap, penjelasan tiap file, dan hasil percobaan ada di modul
**Lab Flash Sale** (`#distributed.sdp-lab-flash-sale`) dan **Uji Beban & Chaos** (`#distributed.sdp-lab-uji-beban`).

## Isi

| Komponen | Baris |
|---|---|
| nginx (`least_conn`, `limit_req` per user + per IP) | 3, 9 |
| 2 instance Spring Boot 4.1 (Java 21) | 3 |
| Redis cache-aside (JSON, TTL 60 s) | 1 |
| RabbitMQ: `POST /orders` → 202 → worker, DLQ, consumer idempoten | 2 |
| PostgreSQL primary + streaming replica, `readOnly` → replica | 4 |
| Index `(user_id, created_at DESC)` | 6 |
| Payment gateway tiruan + Resilience4j retry & circuit breaker | 8, 10 |
| `Idempotency-Key` di API dan ke gateway | 11 |
| Log JSON (ECS), Prometheus, Jaeger (OpenTelemetry) | 12 |

Baris 5 (sharding) dan 7 (object storage + CDN) sengaja tidak dipasang; lihat modulnya masing-masing.

## Menjalankan

Butuh Docker + Compose v2 dan sekitar 4 GB RAM kosong. JDK lokal tidak diperlukan (build di dalam Docker).

```bash
docker compose up -d --build        # build pertama 5–10 menit
docker compose ps                   # tunggu app1/app2 (healthy)
curl -s localhost:8080/products/1
bash scripts/order.sh user-1 1      # buat pesanan
```

| URL | Isi |
|---|---|
| http://localhost:8080 | API lewat nginx |
| http://localhost:8081/actuator | actuator app1, tombol chaos payment |
| http://localhost:15672 | RabbitMQ (guest / guest) |
| http://localhost:9090 | Prometheus |
| http://localhost:16686 | Jaeger |

Uji beban: `TRACE_SAMPLING=0.1 docker compose up -d app1 app2`, lalu `docker compose run --rm k6`.
Reset data: `bash scripts/reset-data.sh`. Bersihkan semuanya: `docker compose down -v`.
