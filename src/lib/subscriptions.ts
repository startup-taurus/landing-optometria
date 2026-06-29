import crypto from "crypto";
import { query, withTransaction } from "./db";
import { seal, open } from "./crypto-vault";

// ─────────────────────────────────────────────────────────────────────────────
// Capa de suscripciones (cobro recurrente). Aquí vive la FRONTERA DE CIFRADO:
// el cardToken y el nombre del titular se guardan cifrados (AES-256-GCM, ver
// crypto-vault.ts) y solo se descifran en memoria al momento de cobrar.
//
// El nombre del titular se guarda en texto plano cifrado (no su valor AES-CBC de
// Payphone); el valor AES-CBC `cardHolder` se calcula en cada cobro con
// encryptCardHolder() — así, si el esquema AES-CBC cambia (VERIFY-3), no hay que
// migrar datos guardados.
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "paused";
export type ChargeStatus =
  | "pending"
  | "approved"
  | "declined"
  | "error"
  | "needs_reconciliation";
export type BillingCycle = "monthly" | "annual" | "test2min";

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planId: string;
  billing: string;
  cycle: BillingCycle;
  amountCents: number;
  currency: string;
  reference: string | null;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  consentIp: string | null;
  cardBrand: string | null;
  lastDigits: string | null;
  bin: string | null;
  billingAnchorDay: number | null;
  nextChargeAt: string | null;
  lastChargeAt: string | null;
  failureCount: number;
  lastError: string | null;
  firstClientTxId: string;
  firstPpTxId: number | null;
  createdAt: string;
  // Campos cifrados (no se exponen descifrados salvo getChargeCredentials).
  cardTokenEnc: string;
  cardHolderEnc: string;
}

interface SubscriptionRow {
  id: string;
  status: SubscriptionStatus;
  plan_id: string;
  billing: string;
  cycle: BillingCycle;
  amount_cents: number;
  currency: string;
  reference: string | null;
  name: string;
  email: string;
  phone: string;
  document_id: string;
  consent_ip: string | null;
  card_brand: string | null;
  last_digits: string | null;
  bin: string | null;
  billing_anchor_day: number | null;
  next_charge_at: string | null;
  last_charge_at: string | null;
  failure_count: number;
  last_error: string | null;
  first_client_tx_id: string;
  first_pp_tx_id: string | number | null;
  created_at: string;
  card_token_enc: string;
  card_holder_enc: string;
}

function toIso(v: unknown): string | null {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : String(v);
}

function mapRow(r: SubscriptionRow): Subscription {
  return {
    id: r.id,
    status: r.status,
    planId: r.plan_id,
    billing: r.billing,
    cycle: r.cycle,
    amountCents: r.amount_cents,
    currency: r.currency,
    reference: r.reference,
    name: r.name,
    email: r.email,
    phone: r.phone,
    documentId: r.document_id,
    consentIp: r.consent_ip,
    cardBrand: r.card_brand,
    lastDigits: r.last_digits,
    bin: r.bin,
    billingAnchorDay: r.billing_anchor_day,
    nextChargeAt: toIso(r.next_charge_at),
    lastChargeAt: toIso(r.last_charge_at),
    failureCount: r.failure_count,
    lastError: r.last_error,
    firstClientTxId: r.first_client_tx_id,
    firstPpTxId: r.first_pp_tx_id == null ? null : Number(r.first_pp_tx_id),
    createdAt: toIso(r.created_at) ?? "",
    cardTokenEnc: r.card_token_enc,
    cardHolderEnc: r.card_holder_enc,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo de fechas (UTC). Ancla al día-del-mes original para evitar drift:
// 31-ene + 1 mes → 28-feb, pero el siguiente vuelve a día 31 (no se queda en 28).
// ─────────────────────────────────────────────────────────────────────────────
function daysInMonthUTC(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

export function addPeriod(
  fromIso: string,
  cycle: BillingCycle,
  anchorDay: number | null
): string {
  const from = new Date(fromIso);
  if (cycle === "test2min") {
    // Modo PRUEBA: renueva cada N minutos (default 2) para validar la recurrencia
    // y la cancelación sin esperar un mes. Ajustable con RECURRING_TEST_INTERVAL_MIN.
    const mins = Number(process.env.RECURRING_TEST_INTERVAL_MIN) || 2;
    return new Date(from.getTime() + mins * 60 * 1000).toISOString();
  }
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const hh = from.getUTCHours();
  const mi = from.getUTCMinutes();
  const ss = from.getUTCSeconds();
  const anchor = anchorDay ?? from.getUTCDate();

  const monthsToAdd = cycle === "annual" ? 12 : 1;
  const total = m + monthsToAdd;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;
  const day = Math.min(anchor, daysInMonthUTC(ny, nm));
  return new Date(Date.UTC(ny, nm, day, hh, mi, ss)).toISOString();
}

export function consentHash(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

// ─────────────────────────────────────────────────────────────────────────────
// Alta de suscripción (tras el PRIMER pago aprobado y tokenizado).
// Idempotente por first_client_tx_id: un doble /confirm no crea dos suscripciones.
// Registra además el primer cobro (la propia alta) como `approved`.
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateSubscriptionInput {
  planId: string;
  billing: string;
  cycle: BillingCycle;
  amountCents: number;
  currency: string;
  reference?: string | null;
  name: string;
  email: string;
  phone: string;
  documentId: string;
  cardHolderName: string; // texto plano; se cifra en reposo
  cardToken: string; // texto plano; se cifra en reposo
  cardBrand?: string | null;
  lastDigits?: string | null;
  bin?: string | null;
  consentText: string;
  consentAt: string; // ISO
  consentIp?: string | null;
  startIso: string; // inicio de la suscripción (= momento del primer pago)
  firstClientTxId: string;
  firstPpTxId?: number | null;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ id: string; created: boolean; duplicate?: boolean }> {
  const id = crypto.randomUUID();
  const anchorDay =
    input.cycle === "test2min" ? null : new Date(input.startIso).getUTCDate();
  const nextChargeAt = addPeriod(input.startIso, input.cycle, anchorDay);
  const cardTokenEnc = seal(input.cardToken);
  const cardHolderEnc = seal(input.cardHolderName);
  const cHash = consentHash(input.consentText);

  return withTransaction(async (client) => {
    // Guard anti-duplicado (S4): si ya existe una suscripción ACTIVA del mismo
    // cliente+plan+ciclo (con OTRO clientTransactionId), NO creamos otra → evita el
    // doble cobro recurrente cuando el cliente reintenta el pago. El cargo extra del
    // alta se concilia manualmente (lo alerta /confirm).
    const dup = await client.query<{ id: string }>(
      `SELECT id FROM subscriptions
       WHERE email = $1 AND plan_id = $2 AND billing = $3 AND status = 'active'
         AND first_client_tx_id <> $4
       LIMIT 1`,
      [input.email, input.planId, input.billing, input.firstClientTxId]
    );
    if (dup.rows.length > 0) {
      return { id: dup.rows[0].id, created: false, duplicate: true };
    }

    const ins = await client.query<{ id: string }>(
      `INSERT INTO subscriptions (
         id, status, plan_id, billing, cycle, amount_cents, currency, reference,
         name, email, phone, document_id,
         card_holder_enc, card_token_enc, card_brand, last_digits, bin,
         consent_at, consent_text, consent_hash, consent_ip,
         billing_anchor_day, next_charge_at, last_charge_at,
         first_client_tx_id, first_pp_tx_id
       ) VALUES (
         $1,'active',$2,$3,$4,$5,$6,$7,
         $8,$9,$10,$11,
         $12,$13,$14,$15,$16,
         $17,$18,$19,$20,
         $21,$22,$23,
         $24,$25
       )
       ON CONFLICT (first_client_tx_id) DO NOTHING
       RETURNING id`,
      [
        id,
        input.planId,
        input.billing,
        input.cycle,
        input.amountCents,
        input.currency,
        input.reference ?? null,
        input.name,
        input.email,
        input.phone,
        input.documentId,
        cardHolderEnc,
        cardTokenEnc,
        input.cardBrand ?? null,
        input.lastDigits ?? null,
        input.bin ?? null,
        input.consentAt,
        input.consentText,
        cHash,
        input.consentIp ?? null,
        anchorDay,
        nextChargeAt,
        input.startIso, // last_charge_at = el alta ya se cobró
        input.firstClientTxId,
        input.firstPpTxId ?? null,
      ]
    );

    if (ins.rows.length === 0) {
      // Ya existía (doble confirm). Devolvemos el id existente, no creado.
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM subscriptions WHERE first_client_tx_id = $1",
        [input.firstClientTxId]
      );
      return { id: existing.rows[0]?.id ?? id, created: false };
    }

    // Primer cobro (la propia alta) como histórico aprobado.
    await client.query(
      `INSERT INTO charges (
         id, subscription_id, client_tx_id, pp_transaction_id, authorization_code,
         status, status_code, amount_cents, period_start, confirmed_at
       ) VALUES ($1,$2,$3,$4,$5,'approved',3,$6,$7,$8)
       ON CONFLICT (subscription_id, period_start) DO NOTHING`,
      [
        crypto.randomUUID(),
        id,
        input.firstClientTxId,
        input.firstPpTxId ?? null,
        null,
        input.amountCents,
        input.startIso,
        input.startIso,
      ]
    );

    return { id, created: true };
  });
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const rows = await query<SubscriptionRow>(
    "SELECT * FROM subscriptions WHERE id = $1",
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listDueSubscriptions(
  nowIso: string,
  limit = 50
): Promise<Subscription[]> {
  const rows = await query<SubscriptionRow>(
    `SELECT * FROM subscriptions
     WHERE status = 'active' AND next_charge_at IS NOT NULL AND next_charge_at <= $1
     ORDER BY next_charge_at ASC
     LIMIT $2`,
    [nowIso, limit]
  );
  return rows.map(mapRow);
}

export async function cancelSubscription(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE subscriptions
     SET status = 'canceled', next_charge_at = NULL, updated_at = now()
     WHERE id = $1 AND status <> 'canceled'
     RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

/** Descifra las credenciales necesarias para cobrar. Solo en memoria, efímero. */
export function getChargeCredentials(sub: Subscription): {
  cardToken: string;
  cardHolderName: string;
} {
  return {
    cardToken: open(sub.cardTokenEnc),
    cardHolderName: open(sub.cardHolderEnc),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cobro recurrente · ciclo de vida de un `charge`
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gate de idempotencia: intenta crear la fila `pending` del cobro del periodo.
 * Si ya existe un cobro para (subscription_id, period_start) → devuelve null
 * (NO se vuelve a cobrar ese periodo). Debe llamarse y COMMITear ANTES del HTTP.
 */
export async function recordChargeAttempt(input: {
  subscriptionId: string;
  clientTxId: string;
  periodStart: string;
  amountCents: number;
}): Promise<string | null> {
  const id = crypto.randomUUID();
  const rows = await query<{ id: string }>(
    `INSERT INTO charges (
       id, subscription_id, client_tx_id, status, amount_cents, period_start
     ) VALUES ($1,$2,$3,'pending',$4,$5)
     ON CONFLICT (subscription_id, period_start) DO NOTHING
     RETURNING id`,
    [id, input.subscriptionId, input.clientTxId, input.amountCents, input.periodStart]
  );
  return rows[0]?.id ?? null;
}

/** Cobro aprobado: marca el charge y AVANZA la agenda desde el periodo programado. */
export async function markChargeApproved(input: {
  chargeId: string;
  subscriptionId: string;
  scheduledPeriod: string; // valor previo de next_charge_at
  cycle: BillingCycle;
  anchorDay: number | null;
  ppTransactionId?: number | null;
  authorizationCode?: string | null;
  newCardToken?: string | null; // si Payphone rotó el token
}): Promise<void> {
  const next = addPeriod(input.scheduledPeriod, input.cycle, input.anchorDay);
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE charges
       SET status = 'approved', status_code = 3, confirmed_at = now(),
           pp_transaction_id = $2, authorization_code = $3
       WHERE id = $1`,
      [input.chargeId, input.ppTransactionId ?? null, input.authorizationCode ?? null]
    );
    const sets = [
      "status = 'active'",
      "failure_count = 0",
      "last_error = NULL",
      "last_charge_at = now()",
      "next_charge_at = $2",
      "updated_at = now()",
    ];
    const params: unknown[] = [input.subscriptionId, next];
    if (input.newCardToken) {
      params.push(seal(input.newCardToken));
      sets.push(`card_token_enc = $${params.length}`);
    }
    await client.query(
      `UPDATE subscriptions SET ${sets.join(", ")} WHERE id = $1`,
      params
    );
  });
}

/**
 * Cobro RECHAZADO (claro). Incrementa el contador; reprograma con backoff si
 * quedan reintentos, o pasa a past_due al agotarlos.
 */
export async function markChargeDeclined(input: {
  chargeId: string;
  subscriptionId: string;
  statusCode?: number | null;
  message?: string | null;
  maxRetries: number;
  backoffMs: number;
  nowIso: string;
}): Promise<{ pastDue: boolean }> {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE charges SET status = 'declined', status_code = $2, message = $3
       WHERE id = $1`,
      [input.chargeId, input.statusCode ?? null, input.message ?? null]
    );
    const subRows = await client.query<{ failure_count: number }>(
      `UPDATE subscriptions SET failure_count = failure_count + 1, last_error = $2, updated_at = now()
       WHERE id = $1 RETURNING failure_count`,
      [input.subscriptionId, input.message ?? "declined"]
    );
    const failures = subRows.rows[0]?.failure_count ?? input.maxRetries;
    if (failures >= input.maxRetries) {
      await client.query(
        `UPDATE subscriptions SET status = 'past_due', next_charge_at = NULL, updated_at = now()
         WHERE id = $1`,
        [input.subscriptionId]
      );
      return { pastDue: true };
    }
    const retryAt = new Date(
      new Date(input.nowIso).getTime() + input.backoffMs
    ).toISOString();
    await client.query(
      `UPDATE subscriptions SET next_charge_at = $2, updated_at = now() WHERE id = $1`,
      [input.subscriptionId, retryAt]
    );
    return { pastDue: false };
  });
}

/**
 * Resultado AMBIGUO (timeout / error de red / crash). NO se reintenta a ciegas
 * (duplicaría el cobro): el charge queda en needs_reconciliation. Además se PAUSA
 * la suscripción (status='paused', next_charge_at=NULL) para SACARLA del scheduler
 * — si no, quedaría con next_charge_at en el pasado, se re-seleccionaría en cada
 * run y podría saturar el batch (hambruna de cobros legítimos). Requiere
 * conciliación manual contra Payphone (ver VERIFY-7) y reactivación.
 */
export async function markChargeNeedsReconciliation(input: {
  chargeId: string;
  subscriptionId: string;
  message?: string | null;
}): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE charges SET status = 'needs_reconciliation', message = $2 WHERE id = $1`,
      [input.chargeId, input.message ?? null]
    );
    await client.query(
      `UPDATE subscriptions
       SET status = 'paused', next_charge_at = NULL, last_error = $2, updated_at = now()
       WHERE id = $1`,
      [input.subscriptionId, input.message ?? "needs_reconciliation"]
    );
  });
}
