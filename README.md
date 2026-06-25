# Portal de Convocatorias Públicas

Portal web del Reto AI-First Fase 1 para explorar convocatorias públicas colombianas desde datos.gov.co/SECOP, gestionar favoritos y guardar búsquedas.

## Estado actual

El repositorio tiene completada la Fase 1 del plan técnico: bootstrap de Next.js con TypeScript y entorno de ejecución local con Docker Compose.

Plan técnico principal:

- `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`

## Stack planificado

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Zod
- Docker Compose para ejecución local

## Ejecución local con Docker

El proyecto debe poder levantarse localmente sin instalar Node.js ni PostgreSQL directamente en WSL. El prerrequisito local será Docker con Docker Compose.

### Servicios esperados

- `app`: aplicación Next.js construida desde `Dockerfile.dev` y expuesta en `http://localhost:3000`.
- `db`: PostgreSQL accesible internamente para la app como `db:5432`.

### Archivos de infraestructura incluidos

- `docker-compose.yml`
- `Dockerfile.dev`
- `.dockerignore`
- `.env.example`

### DATABASE_URL para Prisma dentro de Docker Compose

Dentro del contenedor `app`, Prisma debe usar el host `db`, no `localhost`:

```env
DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@db:5432/portal_convocatorias?schema=public"
```

Antes de levantar el entorno, copia `.env.example` a `.env` y reemplaza los placeholders con valores locales. No commits el archivo `.env`.

### Comandos previstos

Levantar la app y la base de datos:

```bash
docker compose up --build
```

Detener los servicios:

```bash
docker compose down
```

Ejecutar migraciones Prisma desde el contenedor `app`:

```bash
docker compose exec app npx prisma migrate dev
```

Ejecutar lint:

```bash
docker compose exec app npm run lint
```

Ejecutar build:

```bash
docker compose exec app npm run build
```

## Reglas de trabajo

- No escribir código manualmente fuera de Hermes/Codex.
- No hacer push desde Hermes.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No hacer commit sin aprobación explícita del usuario.
- Después de cada fase, revisar `git status`, mostrar archivos modificados, resumir cambios, proponer commit en inglés y preguntar: “¿Apruebas este commit?”
