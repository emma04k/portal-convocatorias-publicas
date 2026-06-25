# Portal de Convocatorias Públicas

Portal web del Reto AI-First Fase 1 para explorar convocatorias públicas colombianas desde datos.gov.co/SECOP, gestionar favoritos y guardar búsquedas.

## Estado actual

El repositorio tiene completadas las fases principales del plan técnico: bootstrap Next.js/Docker, Prisma/PostgreSQL, autenticación JWT, integración SECOP, favoritos, búsquedas guardadas, UI de autenticación, experiencia de convocatorias y cierre de perfil/demo.

Plan técnico principal:

- `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`

## Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- JWT en cookie HTTP-only
- bcrypt
- Zod
- Docker Compose para ejecución local
- Vitest

## Ejecución local con Docker

El proyecto puede levantarse localmente sin instalar Node.js ni PostgreSQL directamente en WSL. El prerrequisito local es Docker con Docker Compose.

### Servicios

- `app`: aplicación Next.js construida desde `Dockerfile.dev` y expuesta en `http://localhost:3000`.
- `db`: PostgreSQL accesible internamente para la app como `db:5432`.

### Archivos de infraestructura incluidos

- `docker-compose.yml`
- `Dockerfile.dev`
- `.dockerignore`
- `.env.example`

### Variables de entorno

Dentro del contenedor `app`, Prisma debe usar el host `db`, no `localhost`:

```env
DATABASE_URL="postgresql://postgres:***@db:5432/portal_convocatorias?schema=public"
POSTGRES_PASSWORD="<set-local-dev-password>"
JWT_SECRET="<set-local-strong-secret>"
```

Antes de levantar el entorno, copia `.env.example` a `.env` y reemplaza los placeholders con valores locales. No commitear `.env`.

### Comandos de desarrollo

Levantar app y base de datos:

```bash
docker compose up -d --build
docker compose ps
```

Ejecutar migraciones Prisma desde el contenedor `app`:

```bash
docker compose exec app npx prisma migrate dev
```

Ejecutar pruebas, lint y build:

```bash
docker compose exec app npm test
docker compose exec app npm run lint
docker compose exec app npm run build
```

Detener los servicios:

```bash
docker compose down
```

## Endpoints principales

Autenticación:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Convocatorias SECOP:

- `GET /api/convocatorias`
- `GET /api/convocatorias/[externalId]`

Recursos autenticados:

- `GET /api/bookmarks`
- `POST /api/bookmarks`
- `DELETE /api/bookmarks/[externalId]`
- `GET /api/saved-searches`
- `POST /api/saved-searches`
- `PATCH /api/saved-searches/[id]`
- `DELETE /api/saved-searches/[id]`
- `GET /api/profile`
- `PATCH /api/profile`

## Flujo demo end-to-end

Flujo recomendado para una demo de 5–7 minutos: registro → login → convocatorias → favorito → búsquedas guardadas → perfil.

1. Abrir `http://localhost:3000` y explicar que la fuente de datos es datos.gov.co/SECOP.
2. Crear una cuenta nueva desde `/auth/register`.
3. Confirmar redirección a `/convocatorias` y ejecutar una búsqueda con filtros por texto, entidad, estado o fechas.
4. Abrir el detalle de una convocatoria y usar el enlace a la fuente externa cuando esté disponible.
5. Guardar una convocatoria como favorito y revisar `/bookmarks`.
6. Guardar filtros como búsqueda frecuente y revisar `/saved-searches`.
7. Ejecutar una búsqueda guardada para volver a `/convocatorias` con los query params restaurados.
8. Abrir `/profile` para mostrar datos de cuenta, conteos de actividad y cambio de contraseña.
9. Cerrar sesión desde la navegación y confirmar que las rutas privadas redirigen a login.

## Checklist de seguridad básica

- JWT en cookie HTTP-only con `SameSite=Strict`; no se guarda token en `localStorage`.
- Contraseñas hasheadas con bcrypt; nunca se devuelve `passwordHash` en respuestas JSON.
- Inputs externos validados con Zod en rutas de API.
- Prisma se usa como ORM; no hay SQL concatenado manualmente.
- Endpoints de favoritos, búsquedas guardadas y perfil derivan `userId` desde la sesión autenticada.
- Middleware solo hace gating UX por presencia de cookie; la autorización real se valida en API.
- No commitear `.env`, secretos, tokens ni credenciales.
- Errores públicos usan mensajes controlados; detalles quedan en logs del servidor.

## Reglas de trabajo

- No escribir código manualmente fuera de Hermes/Codex.
- No hacer push desde Hermes.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No hacer commit sin aprobación explícita del usuario.
- Después de cada fase, revisar `git status`, mostrar archivos modificados, resumir cambios, proponer commit en inglés y preguntar: “¿Apruebas este commit?”
