// Aplica las migraciones SQL de ./migrations en orden alfabético contra la BD de
// DATABASE_URL. Idempotente: los .sql usan IF NOT EXISTS, así que correrlo varias
// veces no rompe nada.
//
// Uso:
//   npm run db:migrate            (lee DATABASE_URL del .env / del entorno)
//
// NOTA: con Docker la BD ya ejecuta estas migraciones SOLA en el primer arranque
// (monta ./migrations en /docker-entrypoint-initdb.d). Este script sirve para
// aplicar migraciones NUEVAS después, o contra una BD externa/gestionada.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Mini-cargador de .env (sin dependencias): solo si DATABASE_URL no está en el entorno.
function loadDotEnv() {
  const file = path.join(ROOT, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) loadDotEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("✖ DATABASE_URL no configurado (ni en el entorno ni en .env)");
    process.exit(1);
  }

  const dir = path.join(ROOT, "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    console.log("No hay migraciones .sql en ./migrations");
    return;
  }

  const client = new pg.Client({
    connectionString,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    for (const f of files) {
      const sql = readFileSync(path.join(dir, f), "utf8");
      process.stdout.write(`→ ${f} … `);
      await client.query(sql);
      console.log("ok");
    }
    console.log("✓ Migraciones aplicadas");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("✖ Error en la migración:", err.message);
  process.exit(1);
});
