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

## Despliegue en Vercel + Neon

La opción recomendada para publicar el proyecto sin administrar servidor es desplegar la app Next.js en Vercel y usar Neon como PostgreSQL administrado.

### 1. Crear la base de datos en Neon

1. Crear un proyecto en [Neon](https://neon.com).
2. Copiar el connection string PostgreSQL del proyecto.
3. Usar una URL con SSL habilitado, por ejemplo:

```env
DATABASE_URL="postgresql://<user>:***@<host>/<database>?sslmode=require"
```

No guardar esta URL en Git ni pegarla en archivos versionados.

### 2. Configurar variables en Vercel

En `Project Settings > Environment Variables`, agregar al menos:

```env
DATABASE_URL="postgresql://<user>:***@<host>/<database>?sslmode=require"
JWT_SECRET="<set-production-strong-secret>"
```

`JWT_SECRET` debe ser un valor fuerte generado fuera del repositorio. Ejemplo local para generarlo:

```bash
openssl rand -base64 32
```

### 3. Importar el repositorio en Vercel

1. Crear un nuevo proyecto en [Vercel](https://vercel.com).
2. Importar el repositorio de GitHub.
3. Mantener el preset de framework como `Next.js`.
4. Usar el build command por defecto del proyecto:

```bash
npm run build
```

El script `postinstall` ejecuta `prisma generate` para que Prisma Client esté disponible durante el build/deploy.

Vercel espera encontrar la salida estándar de Next.js en `.next`; por eso el script `build` no debe sobrescribir `NEXT_DIST_DIR`.

### 4. Aplicar migraciones Prisma en producción

Después de crear la base de datos y configurar `DATABASE_URL`, aplicar las migraciones con:

```bash
npm run db:deploy
```

Este comando ejecuta `prisma migrate deploy`, que es el flujo apropiado para producción. No usar `prisma migrate dev` contra la base de datos productiva.

### 5. Validar el despliegue

Después del primer deploy, revisar manualmente en la URL pública:

1. Crear una cuenta en `/auth/register`.
2. Iniciar sesión en `/auth/login`.
3. Buscar convocatorias en `/convocatorias`.
4. Guardar una convocatoria como favorita y revisar `/bookmarks`.
5. Guardar una búsqueda y revisar `/saved-searches`.
6. Abrir `/profile` y confirmar que la sesión funciona.
7. Cerrar sesión y confirmar que las rutas privadas redirigen a login.

### Notas operativas

- No se necesita `Dockerfile` ni `docker-compose.yml` para Vercel.
- No configurar `NEXT_DIST_DIR` en Vercel; el build productivo debe generar `.next`.
- No subir `.env`, tokens ni credenciales.
- Si se modifica `prisma/schema.prisma`, crear una migración en desarrollo y luego ejecutar `npm run db:deploy` para aplicarla en Neon.
- Si Vercel reporta errores de Prisma Client, confirmar que `postinstall` haya ejecutado `prisma generate`.

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
