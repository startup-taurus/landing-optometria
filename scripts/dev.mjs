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

// Pasamos -p; si aun así el puerto se tomara en la ventana de carrera, Next hace
// su propio fallback incremental por encima de este.
const child = spawn("npx", ["next", "dev", "-p", String(port)], {
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
