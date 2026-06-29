// Arranca `next dev` en el primer puerto REALMENTE libre a partir de 3000.
//
// Por qué este script y no solo `next dev`: el detector de puerto de Next solo
// miraba IPv4 y, si otro proceso ocupaba el 3000 únicamente en IPv6 (::1) —como
// el facturacion-backend en esta máquina—, Next creía que 3000 estaba libre y lo
// tomaba, dejando un http://localhost:3000 AMBIGUO (a veces una app, a veces otra).
// Aquí sondeamos IPv4 (127.0.0.1) E IPv6 (::1) y saltamos al siguiente puerto libre.
//
// Nota: esto es solo para desarrollo. `npm start` (producción) sigue en puerto fijo
// porque nginx en el VPS proxea a un puerto concreto.
import net from "node:net";
import fs from "node:fs";
import { spawn } from "node:child_process";

const START_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT = START_PORT + 50;

function probe(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true); // algo está escuchando → ocupado
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false)); // ECONNREFUSED → libre
  });
}

async function inUse(port) {
  const [v4, v6] = await Promise.all([probe(port, "127.0.0.1"), probe(port, "::1")]);
  return v4 || v6;
}

let port = START_PORT;
while (port < MAX_PORT && (await inUse(port))) port++;

if (port !== START_PORT) {
  console.log(`⚠  Puerto ${START_PORT} ocupado → usando el siguiente libre: ${port}\n`);
}

// Turbopack (compilador dev en Rust): arranque/compilación MUCHO más livianos que
// webpack en esta máquina (Windows). Es SOLO para dev — `next build` (producción)
// sigue con webpack, así que el output es idéntico. Si algún día Turbopack diera
// problemas, desactívalo con NO_TURBO=1 npm run dev.
const useTurbo = process.env.NO_TURBO !== "1";
const nextArgs = ["next", "dev", ...(useTurbo ? ["--turbo"] : []), "-p", String(port)];

// Pasamos -p; si aun así el puerto se tomara en la ventana de carrera, Next hace
// su propio fallback incremental por encima de este.
const child = spawn("npx", nextArgs, {
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));

// ── Auto-cron de PRUEBA ──────────────────────────────────────────────────────
// SOLO en modo prueba (PAYPHONE_TEST_MODE=true): dispara el cobro recurrente cada
// 60s para que la renovación (cada 2 min) ocurra SOLA, sin tener que correr un curl
// en bucle. En PRODUCCIÓN no aplica: ahí lo dispara el cron del sistema (1×/día 5am).
function readEnv() {
  try {
    const out = {};
    for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
    return out;
  } catch {
    return {};
  }
}

const env = readEnv();
if (env.PAYPHONE_TEST_MODE === "true" && (env.CRON_SECRET || "").length >= 16) {
  const url = `http://127.0.0.1:${port}/api/cron/charge-due`;
  const tick = async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      });
      const body = await res.json().catch(() => ({}));
      // Solo avisamos cuando HUBO movimiento (evita ruido cada minuto).
      if (res.ok && body && (body.processed > 0 || body.reconcile > 0)) {
        console.log(`\n⏱  [auto-cron prueba] ${JSON.stringify(body)}`);
      }
    } catch {
      /* server compilando/reiniciando: reintenta al próximo tick */
    }
  };
  // Espera a que el server compile y arranque antes del primer disparo.
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, 15_000);
  console.log(
    `⏱  Auto-cron de PRUEBA activo: POST ${url} cada 60s ` +
      `(cobra lo vencido; renovación cada ${env.RECURRING_TEST_INTERVAL_MIN || 2} min).\n`
  );
}
