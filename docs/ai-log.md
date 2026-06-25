# AI Log — Portal de Convocatorias Públicas

## Fase 1 — Bootstrap Next.js y entorno Docker

- Se determinó que la última fase completada y commiteada fue la Fase 0: planificación y trazabilidad.
- Se inició únicamente la siguiente fase pendiente del plan técnico: Fase 1 — Bootstrap del proyecto Next.js y calidad base.
- Se creó la base de Next.js con TypeScript y scripts de desarrollo, lint y build.
- Se agregó ejecución local con Docker Compose para evitar instalar Node.js y PostgreSQL directamente en WSL.
- Se configuró el servicio `app` para Next.js y el servicio `db` para PostgreSQL, con `DATABASE_URL` usando el host interno `db`.
- Se agregó `.env.example` sin secretos reales y con placeholders/valores de desarrollo.
- Para no guardar credenciales reales, `docker-compose.yml` exige definir `DATABASE_URL` y `POSTGRES_PASSWORD` en un `.env` local no versionado.
- Verificación realizada: `package.json` es JSON válido.
- Bloqueo resuelto: se creó un `.env` local de desarrollo no versionado con `DATABASE_URL` y `POSTGRES_PASSWORD`; `.env` está cubierto por `.gitignore` y `docker compose config` vuelve a ejecutar correctamente.
- Ajuste adicional de Docker: se generó `package-lock.json`, `Dockerfile.dev` pasó de `npm install` a `npm ci --no-audit --no-fund` para builds reproducibles, y se instaló `openssl` en la imagen Alpine para evitar fallos de Prisma.
- Ajuste de build: se removió `NODE_ENV: development` del servicio `app` porque rompía `next build`; Next.js ya define el entorno adecuado por comando.
- Verificación Docker no bloqueante realizada: `docker compose up -d --build`, `docker compose ps`, `docker compose exec app npm run lint`, `docker compose exec app npm run build` y `docker compose down` ejecutaron correctamente.

## Fase 2 — Prisma y modelo de datos PostgreSQL

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 2 — Prisma y modelo de datos PostgreSQL.
- Se creó `prisma/schema.prisma` con datasource PostgreSQL y generator de Prisma Client.
- Se definieron los modelos `User`, `Bookmark` y `SavedSearch`, incluyendo índices, constraints únicos, relaciones y nombres de tablas/columnas mapeados a snake_case.
- Se creó `lib/db/prisma.ts` como Prisma Client singleton para reutilizar conexión en desarrollo.
- La migración inicial fue generada y aplicada mediante Prisma dentro de Docker: `20260625174451_init_data_model`.
- Verificación realizada dentro de Docker: `npx prisma validate`, `npx prisma migrate dev --name init_data_model`, `npx prisma generate`, `npm run lint` y `npm run build` pasaron correctamente.
