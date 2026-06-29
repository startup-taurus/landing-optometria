import { promises as fs } from "fs";
import path from "path";
import type { StoredTransaction } from "./payphone";
import { hasDatabase, query } from "./db";

// ─────────────────────────────────────────────────────────────────────────────
// Persistencia de transacciones (registro del primer pago / pago único).
//
// Dos backends, misma firma pública (saveTransaction / getTransaction):
//   · Si DATABASE_URL está configurado → PostgreSQL (tabla `transactions`, upsert
//     atómico por client_transaction_id → seguro ante escrituras concurrentes).
//   · Si NO → archivo JSON `data/transactions.json` con escritura atómica
//     (tmp + rename) y un mutex en proceso (comportamiento anterior de dioptrika).
//
// Así, correr en local con `npm run dev` sin Postgres no rompe nada; al levantar
// la base (Docker) se usa automáticamente el backend seguro. El StoredTransaction
// se guarda tal cual (JSONB) para conservar exactamente la misma forma.
// ─────────────────────────────────────────────────────────────────────────────

// ── Backend Postgres ─────────────────────────────────────────────────────────
async function pgSave(tx: StoredTransaction): Promise<void> {
  await query(
    `INSERT INTO transactions (client_transaction_id, data, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (client_transaction_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [tx.clientTransactionId, JSON.stringify(tx)]
  );
}

async function pgGet(clientTransactionId: string): Promise<StoredTransaction | null> {
  const rows = await query<{ data: StoredTransaction }>(
    "SELECT data FROM transactions WHERE client_transaction_id = $1",
    [clientTransactionId]
  );
  return rows[0]?.data ?? null;
}

// ── Backend archivo JSON (fallback) ──────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "transactions.json");
const TMP = `${FILE}.tmp`;

// Mutex en proceso: serializa TODA lectura-modificación-escritura del archivo.
// En el VPS único (un solo proceso Node) esto elimina la carrera clásica de
// "lost update": dos requests concurrentes que leen el mismo snapshot y se pisan.
let lock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(() => fn());
  lock = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function readAllUnlocked(): Promise<StoredTransaction[]> {
  let raw: string;
  try {
    raw = await fs.readFile(FILE, "utf8");
  } catch {
    return []; // El archivo aún no existe: lista vacía legítima.
  }
  const trimmed = raw.trim();
  if (!trimmed) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    // Archivo NO vacío pero corrupto: NO devolver [] (eso borraría el historial en
    // silencio). Fallamos cerrado y ruidoso para que el caller lo registre/alerte.
    throw new Error(
      `transactions.json corrupto, no se sobrescribe: ${(err as Error).message}`
    );
  }
  return Array.isArray(parsed) ? (parsed as StoredTransaction[]) : [];
}

async function writeAllUnlocked(list: StoredTransaction[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Escritura atómica: escribimos a un temporal y luego rename (atómico en el mismo
  // filesystem). Un corte a mitad nunca deja transactions.json truncado/corrupto.
  await fs.writeFile(TMP, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(TMP, FILE);
}

async function fileSave(tx: StoredTransaction): Promise<void> {
  await withLock(async () => {
    const list = await readAllUnlocked();
    const idx = list.findIndex((t) => t.clientTransactionId === tx.clientTransactionId);
    if (idx >= 0) list[idx] = tx;
    else list.push(tx);
    await writeAllUnlocked(list);
  });
}

async function fileGet(clientTransactionId: string): Promise<StoredTransaction | null> {
  return withLock(async () => {
    const list = await readAllUnlocked();
    return list.find((t) => t.clientTransactionId === clientTransactionId) ?? null;
  });
}

// ── API pública ──────────────────────────────────────────────────────────────
export async function saveTransaction(tx: StoredTransaction): Promise<void> {
  if (hasDatabase()) return pgSave(tx);
  return fileSave(tx);
}

export async function getTransaction(
  clientTransactionId: string
): Promise<StoredTransaction | null> {
  if (hasDatabase()) return pgGet(clientTransactionId);
  return fileGet(clientTransactionId);
}
