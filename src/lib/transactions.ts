import { promises as fs } from "fs";
import path from "path";
import type { StoredTransaction } from "./payphone";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "transactions.json");
const TMP = `${FILE}.tmp`;

// ---------------------------------------------------------------------------
// Mutex en proceso: serializa TODA lectura-modificación-escritura del archivo.
// En el VPS único (un solo proceso Node) esto elimina la carrera clásica de
// "lost update": dos requests concurrentes que leen el mismo snapshot y se
// pisan al escribir. Cada operación corre después de que la anterior termine.
// Si se escala a multi-instancia, migrar a SQLite/Postgres con UNIQUE(clientTxId).
// ---------------------------------------------------------------------------
let lock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(() => fn());
  // La cola sigue viva pase lo que pase (no se envenena si fn rechaza).
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

export async function saveTransaction(tx: StoredTransaction): Promise<void> {
  await withLock(async () => {
    const list = await readAllUnlocked();
    const idx = list.findIndex((t) => t.clientTransactionId === tx.clientTransactionId);
    if (idx >= 0) list[idx] = tx;
    else list.push(tx);
    await writeAllUnlocked(list);
  });
}

export async function getTransaction(
  clientTransactionId: string
): Promise<StoredTransaction | null> {
  return withLock(async () => {
    const list = await readAllUnlocked();
    return list.find((t) => t.clientTransactionId === clientTransactionId) ?? null;
  });
}

/**
 * Compare-and-set atómico. Ejecuta `mutator` con el registro actual (o null si no
 * existe) DENTRO del lock y persiste lo que devuelva. Si `mutator` devuelve null,
 * no se escribe nada. Devuelve el registro persistido (o el actual si no hubo cambio).
 *
 * Permite transiciones seguras "solo el ganador escribe", p.ej. pending -> approved,
 * sin que dos confirmaciones concurrentes apliquen ambas el cambio y dupliquen efectos.
 */
export async function updateTransaction(
  clientTransactionId: string,
  mutator: (current: StoredTransaction | null) => StoredTransaction | null
): Promise<StoredTransaction | null> {
  return withLock(async () => {
    const list = await readAllUnlocked();
    const idx = list.findIndex((t) => t.clientTransactionId === clientTransactionId);
    const current = idx >= 0 ? list[idx] : null;
    const next = mutator(current);
    if (next === null) return current;
    if (idx >= 0) list[idx] = next;
    else list.push(next);
    await writeAllUnlocked(list);
    return next;
  });
}
