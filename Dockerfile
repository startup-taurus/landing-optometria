# ─────────────────────────────────────────────────────────────────────────────
# Imagen de la app Dioptrika (Next.js 14, salida standalone). Multi-stage para que
# la imagen final sea pequeña y NO contenga secretos del servidor.
#
# Build-time: lee .env para inyectar las variables NEXT_PUBLIC_* (son públicas por
# diseño: token de la Cajita, storeId, flags). Los SECRETOS de servidor (PAYPHONE_TOKEN,
# TOKEN_ENC_KEY, CRON_SECRET, DATABASE_URL, etc.) se inyectan en RUNTIME vía
# env_file en docker-compose, no quedan horneados en la imagen.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Seguridad + limpieza de los avisos EACCES:
#  1) El build standalone hornea el .env en la imagen (con perms 600 de root → el
#     usuario no-root no puede leerlo). Lo BORRAMOS: los secretos llegan por
#     env_file en runtime y las NEXT_PUBLIC_* ya quedaron inyectadas en el build.
#  2) El servidor necesita ESCRIBIR el caché de páginas; creamos .next/cache y damos
#     propiedad al usuario nextjs (sin abrir permisos a todos).
RUN rm -f /app/.env /app/.env.* && \
    mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
