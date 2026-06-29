-- Dioptrika — esquema de cobro recurrente (Payphone Tokenización).
-- Idempotente: se puede correr varias veces sin error (IF NOT EXISTS).
-- Los ids son UUID generados en la APP (crypto.randomUUID()) y se guardan como
-- TEXT, así no dependemos de extensiones de Postgres (portable a Docker / cualquier
-- versión). Todos los timestamps son TIMESTAMPTZ en UTC.

-- ─────────────────────────────────────────────────────────────────────────────
-- transactions  ·  registro de pagos (reemplaza data/transactions.json cuando
-- DATABASE_URL está configurado). Guardamos el StoredTransaction completo como
-- JSONB para conservar exactamente la misma forma que usa la app.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  client_transaction_id TEXT PRIMARY KEY,
  data                  JSONB NOT NULL,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- subscriptions  ·  mandato de cobro recurrente + tarjeta tokenizada
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  TEXT PRIMARY KEY,
  status              TEXT NOT NULL,            -- active | past_due | canceled | paused
  plan_id             TEXT NOT NULL,            -- unico | test
  billing             TEXT NOT NULL,            -- monthly | annual
  cycle               TEXT NOT NULL,            -- monthly | annual | test2min (periodo real)
  amount_cents        INTEGER NOT NULL,         -- PRECIO CONGELADO al suscribirse
  currency            TEXT NOT NULL DEFAULT 'USD',
  reference           TEXT,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  document_id         TEXT NOT NULL,            -- cédula/RUC
  card_holder_enc     TEXT NOT NULL,            -- nombre del titular, AES-256-GCM en reposo
  card_token_enc      TEXT NOT NULL,            -- cardToken, AES-256-GCM en reposo (v1:iv:tag:ct)
  card_brand          TEXT,
  last_digits         TEXT,
  bin                 TEXT,
  consent_at          TIMESTAMPTZ NOT NULL,
  consent_text        TEXT NOT NULL,
  consent_hash        TEXT NOT NULL,            -- sha256 del texto canónico (prueba versionada)
  consent_ip          TEXT,
  billing_anchor_day  SMALLINT,                 -- día-del-mes original (evita drift fin de mes)
  next_charge_at      TIMESTAMPTZ,              -- UTC; NULL = no programada
  last_charge_at      TIMESTAMPTZ,
  failure_count       INTEGER NOT NULL DEFAULT 0,
  last_error          TEXT,
  first_client_tx_id  TEXT NOT NULL,
  first_pp_tx_id      BIGINT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subs_due ON subscriptions (status, next_charge_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_first_tx ON subscriptions (first_client_tx_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- charges  ·  cada intento de cobro (alta + recurrente)
--   client_tx_id  = clave de idempotencia (DPK-… firmado, único por intento)
--   (subscription_id, period_start) = impide cobrar dos veces el mismo periodo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charges (
  id                  TEXT PRIMARY KEY,
  subscription_id     TEXT NOT NULL REFERENCES subscriptions(id),
  client_tx_id        TEXT NOT NULL,
  pp_transaction_id   BIGINT,
  authorization_code  TEXT,
  status              TEXT NOT NULL,            -- pending | approved | declined | error | needs_reconciliation
  status_code         INTEGER,
  message             TEXT,
  amount_cents        INTEGER NOT NULL,
  period_start        TIMESTAMPTZ NOT NULL,     -- valor PROGRAMADO de next_charge_at
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at        TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_charges_clienttx ON charges (client_tx_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_charges_period ON charges (subscription_id, period_start);
CREATE INDEX IF NOT EXISTS idx_charges_sub ON charges (subscription_id);
