CREATE TABLE products (
    id        BIGSERIAL PRIMARY KEY,
    name      TEXT   NOT NULL,
    price_idr BIGINT NOT NULL,
    stock     INT    NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
    id         TEXT PRIMARY KEY,
    user_id    TEXT        NOT NULL,
    product_id BIGINT      NOT NULL REFERENCES products (id),
    qty        INT         NOT NULL,
    amount_idr BIGINT      NOT NULL,
    status     TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Baris 6: "pesanan saya" = user_id (=) lalu created_at (ORDER BY)
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Baris 11. response_body TEXT, bukan JSONB: JSONB menormalkan spasi & urutan key,
-- sehingga respons replay tidak lagi byte-identik dengan respons pertama.
CREATE TABLE idempotency_keys (
    user_id       TEXT        NOT NULL,
    key           TEXT        NOT NULL,
    request_hash  TEXT        NOT NULL,
    status        TEXT        NOT NULL DEFAULT 'processing',
    response_code INT,
    response_body TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, key)
);

-- Baris 2: consumer idempoten (at-least-once delivery)
CREATE TABLE processed_messages (
    message_id   TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO products (name, price_idr, stock) VALUES
    ('Headset Flash Sale', 199000, 50),
    ('Keyboard Mekanik',   850000, 20),
    ('Monitor 27 inci',  3200000, 5);
