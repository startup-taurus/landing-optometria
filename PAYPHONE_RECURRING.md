# Cobro recurrente tokenizado (Payphone) — Dioptrika

Cobro recurrente con **tarjeta tokenizada** portado del proyecto de referencia
`landing-management` (flujora), probado en producción. La criptografía y el flujo
son idénticos; solo cambian el branding, el catálogo y el diseño (dioptrika).

## Arquitectura

- **Plan único** `$30/mes` (IVA 15% incluido → base $26.09 + IVA $3.91). Catálogo en
  [src/lib/payphone.ts](src/lib/payphone.ts) (`PLAN_CATALOG`). Plan de prueba `test`
  ($1) cobrable solo con `PAYPHONE_TEST_MODE=true`, expuesto en `/prueba` (noindex).
- **Cripto**: `cardHolder` AES-256-CBC (IV cero) en cada cobro
  ([payphone-crypto.ts](src/lib/payphone-crypto.ts)); token y nombre cifrados en
  reposo AES-256-GCM con `TOKEN_ENC_KEY` ([crypto-vault.ts](src/lib/crypto-vault.ts)).
- **BD**: Postgres (`pg`, pool perezoso + advisory lock). Tablas `subscriptions`,
  `charges`, `transactions` ([migrations/001_init.sql](migrations/001_init.sql)).
- **Rutas**: `/api/payphone/init` (valida cédula+consent, calcula montos),
  `/api/payphone/response` (GET: captura y cifra el `ctoken` del redirect),
  `/api/payphone/confirm` (valida monto, crea la suscripción),
  `/api/cron/charge-due` (cobra lo vencido), `/api/subscriptions/{cancel,self-cancel}`.

## Correr en local (npm run dev) usando la BD de Docker

```bash
docker compose up -d db          # solo la base; se crea sola con su esquema
npm run dev                      # http://localhost:3000  (usa DATABASE_URL=127.0.0.1:5434)
```

La cajita está en **modo PRUEBA** (`PAYPHONE_TEST_MODE=true`). Prueba el cobro $1 en
`http://localhost:3000/prueba` con una tarjeta sandbox de Payphone.

## Stack completo en Docker (como en prod)

```bash
docker compose up -d --build     # db + web. Web en 127.0.0.1:3006
curl -I http://127.0.0.1:3006    # → 200
```

## Validar el cobro RECURRENTE (después del primer pago)

**Cadencia según el modo** (la decide `confirm/route.ts` por `PAYPHONE_TEST_MODE`):

| Modo | `PAYPHONE_TEST_MODE` | Ciclo de la suscripción | Cron |
|------|----------------------|-------------------------|------|
| **Local / sandbox** | `true` | cada **2 min** (`RECURRING_TEST_INTERVAL_MIN`) | dispáralo cada 2 min |
| **Producción** | `false` | **mensual** (o anual) | 1×/día a las **05:00** |

### Local (cada 2 min)

En modo prueba, la suscripción nace con `next_charge_at = +2 min`. Deja este bucle
en OTRA terminal mientras corre `npm run dev`: **verifica cada minuto** y el cobro
ocurre solo cuando vence (cada 2 min). Disparar de más es inocuo (devuelve
`processed:0` si nada vence):

```bash
while true; do
  curl -fsS -X POST http://localhost:3000/api/cron/charge-due \
    -H "Authorization: Bearer $CRON_SECRET"; echo
  sleep 60   # verifica cada 1 min; el cobro se ejecuta cada 2 min (cuando vence)
done
```

O fuerza una renovación inmediata adelantando la fecha y disparando el cron una vez:

```bash
docker compose exec -T db psql -U dioptrika -d dioptrika \
  -c "UPDATE subscriptions SET next_charge_at = now() - interval '1 minute' WHERE status='active';"
curl -X POST http://localhost:3000/api/cron/charge-due -H "Authorization: Bearer $CRON_SECRET"
# → {"processed":1,"approved":1,...}  y next_charge_at avanza +2 min
```

### Producción (mensual, cron diario 05:00)

Con `PAYPHONE_TEST_MODE=false` el ciclo es mensual. Programa el cron del sistema /
systemd timer / CronJob para que corra **todos los días a las 5am**; cobra solo las
suscripciones cuyo `next_charge_at` ya venció (las que cumplen su mes ese día):

```
0 5 * * *  curl -fsS -X POST https://dioptrika.com/api/cron/charge-due -H "Authorization: Bearer $CRON_SECRET"
```

## Antes de PRODUCCIÓN (pendientes Payphone — VERIFY)

1. **`PAYPHONE_CODING_PASSWORD`**: hoy hay un placeholder de sandbox. En prod debe ser
   la "contraseña de codificación" REAL de tu cuenta Payphone (32 chars o 64 hex).
2. **VERIFY-1/2/3/4** (comentados en el código): confirmar en sandbox el nombre del
   parámetro del token (`ctoken`), la forma del `order`/`unitPrice`, el esquema AES-CBC
   del `cardHolder` y el campo de estado del cobro tokenizado.
3. **CSP**: en prod pon `CSP_UPGRADE_INSECURE=true` (local/sandbox por http, déjalo sin
   definir). La CSP ya permite Cardinal/Songbird (3DS) y `*.payphonetodoesposible.com`.
4. **DATABASE_URL** en el servidor: la app dentro de compose ya usa `db:5432`
   automáticamente; desde el host se usa `127.0.0.1:5434`.

## Secretos (en .env, gitignored — `chmod 600 .env` en el server)

`PAYPHONE_HMAC_SECRET`, `TOKEN_ENC_KEY`, `CRON_SECRET`, `POSTGRES_PASSWORD` y
`PAYPHONE_CODING_PASSWORD`. Si pierdes `TOKEN_ENC_KEY`, los tokens guardados quedan
ilegibles (los clientes deben re-registrar su tarjeta).
