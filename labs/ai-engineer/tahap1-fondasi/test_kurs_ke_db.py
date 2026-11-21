"""Test tanpa internet: httpx.MockTransport menggantikan server kurs."""
import sqlite3
from decimal import Decimal

import httpx
import pytest

import kurs_ke_db as k

CONTOH = '{"amount":1.0,"base":"USD","date":"2026-11-13","rates":{"EUR":0.90481,"IDR":18245,"JPY":160.0,"SGD":1.2881}}'


def klien(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def ok(req):
    return httpx.Response(200, text=CONTOH, headers={"content-type": "application/json"})


def test_decimal_persis_dan_upsert_idempoten():
    data = k.ambil_kurs(klien(ok), tanggal="2026-11-14")        # Sabtu -> API menjawab kurs Jumat
    assert data.date.isoformat() == "2026-11-13"
    assert data.rates["EUR"] == Decimal("0.90481")              # bukan 0.904809999...
    conn = sqlite3.connect(":memory:")
    k.siapkan_db(conn)
    assert k.simpan(conn, data) == 4
    assert k.simpan(conn, data) == 0                            # dijalankan ulang: tidak ada duplikat
    koreksi = data.model_copy(update={"rates": {**data.rates, "IDR": Decimal("18250")}})
    assert k.simpan(conn, koreksi) == 0
    assert conn.execute("SELECT nilai FROM kurs WHERE kuote='IDR'").fetchone()[0] == "18250"


def test_request_membawa_base_dan_symbols():
    diminta = []

    def handler(req):
        diminta.append(req.url)
        return ok(req)

    k.ambil_kurs(klien(handler))
    assert diminta[0].path == "/v1/latest"
    assert diminta[0].params["base"] == "USD"
    assert diminta[0].params["symbols"] == "IDR,EUR,SGD,JPY"


def test_retry_saat_5xx_lalu_berhasil(monkeypatch):
    monkeypatch.setattr(k.time, "sleep", lambda s: None)
    panggilan = []

    def handler(req):
        panggilan.append(1)
        return httpx.Response(503) if len(panggilan) < 3 else ok(req)

    assert k.ambil_kurs(klien(handler)).rates["IDR"] == Decimal("18245")
    assert len(panggilan) == 3


def test_4xx_tidak_diulang(monkeypatch):
    monkeypatch.setattr(k.time, "sleep", lambda s: None)
    panggilan = []

    def handler(req):
        panggilan.append(1)
        return httpx.Response(404, json={"message": "not found"})

    with pytest.raises(httpx.HTTPStatusError):
        k.ambil_kurs(klien(handler))
    assert len(panggilan) == 1


def test_konversi_pakai_banker_rounding():
    assert k.konversi(Decimal("0.125"), Decimal("1")) == Decimal("0.12")   # .5 ke genap terdekat
    assert k.konversi(Decimal("0.135"), Decimal("1")) == Decimal("0.14")
    assert 0.1 + 0.2 != 0.3                                                  # alasan float dilarang
    assert Decimal("0.1") + Decimal("0.2") == Decimal("0.3")
