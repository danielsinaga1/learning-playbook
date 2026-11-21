// Jalankan: docker compose run --rm k6
import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: {
    browse: {                       // Baris 1/3/4: baca berat, dilayani cache di dua instance
      executor: 'constant-arrival-rate', rate: 30, timeUnit: '1s', duration: '60s',
      preAllocatedVUs: 20, exec: 'browse',
    },
    flash_sale: {                   // Baris 2/11: lonjakan checkout 10 detik, setiap klien me-retry sekali
      executor: 'ramping-arrival-rate', startRate: 2, timeUnit: '1s', preAllocatedVUs: 60, exec: 'checkout',
      stages: [{ target: 2, duration: '20s' }, { target: 40, duration: '10s' }, { target: 2, duration: '30s' }],
    },
    abuser: {                       // Baris 9: satu user mengirim 30 request/detik
      executor: 'constant-arrival-rate', rate: 30, timeUnit: '1s', duration: '20s', startTime: '20s',
      preAllocatedVUs: 10, exec: 'abuse',
    },
  },
  thresholds: {
    'http_req_duration{scenario:browse}': ['p(95)<200'],
    'http_req_failed{scenario:browse}': ['rate<0.01'],
    'checks{scenario:flash_sale}': ['rate>0.99'],
    'checks{scenario:abuser}': ['rate>0.7'],
  },
};

export function browse() {
  const res = http.get(`${BASE}/products/${1 + Math.floor(Math.random() * 3)}`);
  check(res, { 'produk 200': (r) => r.status === 200 });
}

export function checkout() {
  const params = {
    headers: {
      ...JSON_HEADERS,
      'X-User-Id': `user-${__VU}-${__ITER}`,
      'Idempotency-Key': `${__VU}-${__ITER}-${Date.now()}`,
    },
  };
  const body = JSON.stringify({ productId: 1 + Math.floor(Math.random() * 3), qty: 1 });
  const first = http.post(`${BASE}/orders`, body, params);
  const retry = http.post(`${BASE}/orders`, body, params);   // klien me-retry dengan key yang sama
  check(first, { 'order diterima 202': (r) => r.status === 202 });
  check(retry, { 'retry = replay pesanan yang sama': (r) => r.status === 202 && r.body === first.body });
}

export function abuse() {
  const params = { headers: { ...JSON_HEADERS, 'X-User-Id': 'bot-1', 'Idempotency-Key': `bot-${__ITER}-${Date.now()}` } };
  const res = http.post(`${BASE}/orders`, JSON.stringify({ productId: 1, qty: 1 }), params);
  check(res, { 'bot dibatasi 429': (r) => r.status === 429 });
}
