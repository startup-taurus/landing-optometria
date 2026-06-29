import { Pool, type PoolClient, type QueryResultRow } from "pg";

// ─────────────────────────────────────────────────────────────────────────────
// Conexión a PostgreSQL (solo servidor).
//
// IMPORTANTE: el pool es PEREZOSO — no se crea ni conecta al importar el módulo,
// solo en la primera consulta real. Así `next build` / rutas que no tocan la BD
// no fallan aunque DATABASE_URL no esté presente en build.
//
// `pg` es JS puro (sin módulo nativo) → portable a Docker sin herramientas de
// compilación. NUNCA importes este archivo desde un componente cliente.
// ─────────────────────────────────────────────────────────────────────────────

let pool: Pool | null = null;

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no configurado");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      // SSL opcional: muchos Postgres gestionados lo exigen. Actívalo con
      // DATABASE_SSL=true (rejectUnauthorized=false para certificados self-signed).
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
    pool.on("error", (err) => {
      console.error("[db] error inesperado en cliente idle:", err.message);
    });
  }
  return pool;
}

// Errores TRANSITORIOS de conexión. En Docker Desktop (Windows/Mac) el proxy del
// puerto publicado (5434) suele RECHAZAR la primera conexión tras estar inactivo
// (ECONNREFUSED inmediato) y aceptar la siguiente — por eso el primer /init fallaba
// con 503 y el reintento del usuario funcionaba. También cubrimos cortes de conexión
// y apagados administrativos de Postgres. Reintentar aquí lo hace transparente.
const TRANSIENT_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "ENOTFOUND",
  "57P01", // admin_shutdown
  "57P03", // cannot_connect_now (arrancando)
  "08006", // connection_failure
  "08001", // sqlclient_unable_to_establish_sqlconnection
  "08004", // sqlserver_rejected_establishment_of_sqlconnection
]);

function isTransient(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return typeof code === "string" && TRANSIENT_CODES.has(code);
}

// Reintenta `fn` ante errores transitorios de conexión, con backoff corto. Solo se
// usa donde reintentar es SEGURO: establecer conexión (nada se ejecutó aún) y
// consultas que aún no llegaron a correr (el fallo es al conectar).
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === 4) throw err;
      const backoff = 150 * attempt;
      console.warn(
        `[db] ${label}: error transitorio (${(err as { code?: string }).code}); ` +
          `reintento ${attempt}/3 en ${backoff}ms`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

// Conexión con reintento: el punto donde golpea el ECONNREFUSED del proxy de Docker.
async function connectWithRetry(): Promise<PoolClient> {
  return withRetry(() => getPool().connect(), "connect");
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  // pool.query() conecta+ejecuta; si el fallo es al CONECTAR (ECONNREFUSED), la
  // sentencia no llegó a correr, así que reintentar es seguro.
  const res = await withRetry(
    () => getPool().query<T>(text, params as never),
    "query"
  );
  return res.rows;
}

/**
 * Ejecuta `fn` dentro de una transacción con un cliente dedicado.
 * Hace COMMIT si resuelve y ROLLBACK si lanza.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await connectWithRetry();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Lock de aplicación a nivel de sesión. Devuelve true si se obtuvo. Garantiza
 * una sola ejecución concurrente AUNQUE haya múltiples instancias/contenedores
 * (a diferencia de un lock en memoria). Si se obtiene, `fn` corre y el lock se
 * libera al final con el MISMO cliente; si no, retorna `whenLocked`.
 */
export async function withAdvisoryLock<T>(
  key: number,
  fn: () => Promise<T>,
  whenLocked: T
): Promise<T> {
  const client = await connectWithRetry();
  try {
    const res = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock($1) AS locked",
      [key]
    );
    if (!res.rows[0]?.locked) {
      return whenLocked;
    }
    try {
      return await fn();
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [key]);
    }
  } finally {
    client.release();
  }
}
