# Portal de Convocatorias Públicas

Portal web del Reto AI-First Fase 1 para explorar convocatorias públicas colombianas desde datos.gov.co/SECOP, guardar favoritos, guardar búsquedas frecuentes y administrar el perfil de usuario.

- Aplicación desplegada: https://portal-convocatorias-publicas-one.vercel.app
- Repositorio: https://github.com/emma04k/portal-convocatorias-publicas
- Plan técnico: `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`
- Entregable AI-First: `SOUL.md`

## Qué resuelve

Las convocatorias públicas suelen estar distribuidas en fuentes técnicas difíciles de seguir. Este portal ofrece una experiencia web para buscar oportunidades de SECOP, consultar detalles, guardar convocatorias relevantes y reutilizar búsquedas frecuentes con una cuenta propia.

## Funcionalidades principales

- Registro, login y logout con JWT en cookie HTTP-only.
- Exploración de convocatorias SECOP desde datos.gov.co.
- Filtros por texto, entidad, estado y fechas.
- Vista de detalle por identificador externo.
- Favoritos persistidos por usuario.
- Búsquedas guardadas y ejecución posterior con filtros restaurados.
- Perfil con datos de cuenta, métricas de actividad y cambio de contraseña.
- Navegación protegida para rutas privadas.
- Feedback visual con SweetAlert2 en acciones de perfil.
- UI responsive con foco visible, objetivos táctiles mínimos y tarjetas protegidas contra textos largos.

## Stack

- Next.js 14 App Router
- TypeScript
- React 18
- Prisma ORM
- PostgreSQL
- JWT en cookie HTTP-only
- bcrypt
- Zod
- Vitest
- Docker Compose
- Vercel + Neon para despliegue

## Arquitectura rápida

```text
app/                     Páginas y rutas App Router
app/api/                 API REST interna
components/              Componentes de UI y pantallas cliente
lib/auth/                Cookies, JWT, sesión y hashing
lib/db/prisma.ts         Prisma Client singleton
lib/secop/               Cliente, tipos y mapper SECOP/SODA
lib/validators/          Validadores Zod por dominio
prisma/                  Schema y migraciones generadas por Prisma
tests/                   Pruebas Vitest source-level y de rutas
```

El frontend consume rutas REST internas bajo `/api`. Las rutas protegidas derivan el usuario desde la cookie `auth_token`; el cliente nunca decide el `userId`. Prisma conecta la API con PostgreSQL. El cliente SECOP consulta el dataset público de datos.gov.co y normaliza los registros a DTOs estables de la app.

## Ejecución local con Docker

El flujo local oficial usa Docker Compose. No hace falta instalar Node.js ni PostgreSQL directamente en WSL para validar la aplicación.

### Prerrequisitos

- Docker
- Docker Compose

### Variables de entorno

Copia el archivo de ejemplo y completa valores locales:

```bash
cp .env.example .env
```

Dentro del contenedor `app`, Prisma debe usar el hostname interno `db`, no `localhost`:

```env
DATABASE_URL="postgresql://postgres:<local-password>@db:5432/portal_convocatorias?schema=public"
POSTGRES_PASSWORD="<local-password>"
JWT_SECRET="<local-strong-secret>"
```

No versionar `.env`, URLs reales de base de datos, tokens ni secretos.

### Levantar el entorno

```bash
docker compose up -d --build
docker compose ps
```

La app queda disponible en:

```text
http://localhost:3000
```

### Base de datos local

Aplicar migraciones de desarrollo:

```bash
docker compose exec app npx prisma migrate dev
```

Regenerar Prisma Client si hace falta:

```bash
docker compose exec app npx prisma generate
```

### Validación local

Ejecutar dentro del servicio `app`:

```bash
docker compose exec app npm run test
docker compose exec app npm run lint
docker compose exec app npm run build
```

Detener servicios:

```bash
docker compose down
```

## Scripts disponibles

| Script | Uso |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo usando `.next-dev`. |
| `npm run test` | Ejecuta Vitest. |
| `npm run lint` | Ejecuta Next lint. |
| `npm run build` | Genera build productivo estándar en `.next`. |
| `npm run start` | Sirve el build productivo. |
| `npm run db:deploy` | Aplica migraciones Prisma en producción con `prisma migrate deploy`. |
| `postinstall` | Ejecuta `prisma generate` después de instalar dependencias. |

En este repositorio, la validación confiable se hace dentro de Docker Compose para evitar depender del estado de `node_modules` del host.

## Despliegue en Vercel + Neon

La ruta recomendada es Vercel para Next.js y Neon para PostgreSQL administrado.

### 1. Crear base de datos en Neon

1. Crear un proyecto en https://neon.com.
2. Copiar el connection string PostgreSQL.
3. Usar una URL con SSL habilitado:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

La URL real debe vivir solo como variable de entorno segura.

### 2. Configurar variables en Vercel

En `Project Settings > Environment Variables`, agregar:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="<production-strong-secret>"
```

Para generar un secreto fuerte localmente:

```bash
openssl rand -base64 32
```

### 3. Importar el repositorio

1. Crear un nuevo proyecto en https://vercel.com.
2. Importar el repositorio de GitHub.
3. Mantener el preset `Next.js`.
4. Usar el build command del proyecto:

```bash
npm run build
```

No configurar `NEXT_DIST_DIR` en Vercel. El build productivo debe generar `.next`, que es la salida esperada por el runtime de Next.js en Vercel.

### 4. Aplicar migraciones en producción

Después de configurar `DATABASE_URL`, aplicar migraciones con:

```bash
npm run db:deploy
```

No uses `prisma migrate dev` contra la base de datos productiva.

Si querés mantener la validación aislada en Docker, podés ejecutar el deploy de migraciones inyectando la URL solo en el proceso del comando:

```bash
DATABASE_URL='<NEON_DATABASE_URL>' docker compose run --rm --no-deps -e DATABASE_URL app npm run db:deploy
```

No pegues la URL real en archivos versionados ni en documentación.

## Endpoints principales

### Autenticación

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Crea una cuenta. |
| `POST` | `/api/auth/login` | Inicia sesión y setea cookie HTTP-only. |
| `POST` | `/api/auth/logout` | Cierra sesión. |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado seguro. |

### Convocatorias SECOP

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/convocatorias` | Lista convocatorias con filtros. |
| `GET` | `/api/convocatorias/[externalId]` | Consulta detalle por identificador externo. |

### Recursos autenticados

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/bookmarks` | Lista favoritos del usuario. |
| `POST` | `/api/bookmarks` | Guarda una convocatoria como favorita. |
| `DELETE` | `/api/bookmarks/[externalId]` | Elimina un favorito del usuario. |
| `GET` | `/api/saved-searches` | Lista búsquedas guardadas. |
| `POST` | `/api/saved-searches` | Guarda una búsqueda. |
| `PATCH` | `/api/saved-searches/[id]` | Actualiza una búsqueda propia. |
| `DELETE` | `/api/saved-searches/[id]` | Elimina una búsqueda propia. |
| `GET` | `/api/profile` | Devuelve perfil y métricas. |
| `PATCH` | `/api/profile` | Actualiza perfil o contraseña. |

## Flujo demo end-to-end

Flujo recomendado para una demo de 5 a 7 minutos:

1. Abrir `http://localhost:3000` o la URL pública de Vercel.
2. Explicar que la fuente de datos es datos.gov.co/SECOP.
3. Crear una cuenta desde `/auth/register`.
4. Confirmar redirección a `/convocatorias`.
5. Buscar convocatorias usando texto, entidad, estado o fechas.
6. Abrir el detalle de una convocatoria.
7. Usar el enlace a la fuente SECOP cuando esté disponible.
8. Guardar una convocatoria como favorita y revisar `/bookmarks`.
9. Guardar filtros como búsqueda frecuente y revisar `/saved-searches`.
10. Ejecutar una búsqueda guardada y confirmar que `/convocatorias` restaura los filtros.
11. Abrir `/profile` para mostrar datos de cuenta, conteos y cambio de contraseña.
12. Cerrar sesión y confirmar que las rutas privadas redirigen a login.

## Checklist de seguridad básica

- JWT en cookie HTTP-only con `SameSite=Strict`.
- El token no se guarda en `localStorage`.
- Contraseñas hasheadas con bcrypt.
- `passwordHash` nunca se devuelve en respuestas JSON.
- Inputs externos validados con Zod.
- Prisma se usa como ORM; no hay SQL concatenado manualmente.
- Favoritos, búsquedas guardadas y perfil derivan `userId` desde la sesión autenticada.
- Middleware hace gating UX por presencia de cookie; la autorización real se valida en API.
- Errores públicos usan mensajes controlados.
- `.env`, URLs reales, tokens y credenciales no se versionan.

## Estado de validación

Última validación relevante documentada en `SOUL.md`:

```bash
docker compose up -d --build
docker compose ps
docker compose exec app npm run lint
docker compose exec app npm run test
docker compose exec app npm run build
docker compose down
```

Resultado registrado: lint OK, build OK y 63 tests pasando dentro de Docker.

## Trabajo pendiente recomendado

- Agregar CI en GitHub Actions para lint, tests y build.
- Agregar pruebas end-to-end con Playwright para el flujo completo.
- Revisar upgrades de seguridad de Next.js, eslint-config-next y bcrypt en una fase dedicada.
- Agregar rate limiting básico a endpoints de autenticación.
- Mejorar observabilidad server-side sin exponer detalles al cliente.
- Mantener un checklist operativo post-deploy para validar URL pública, autenticación, favoritos, búsquedas y perfil.

## Reglas de trabajo AI-First

- Todo cambio de código debe generarse mediante Hermes/Codex.
- Cambios importantes deben actualizar `SOUL.md` o `docs/ai-log.md`.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No modificar migraciones manualmente.
- No hacer commit sin aprobación explícita del usuario.
- No hacer push desde Hermes.
- Los commits usan Conventional Commits en inglés.

Antes de cualquier commit, se debe revisar `git status`, mostrar archivos modificados, resumir el cambio, proponer un mensaje de commit en inglés y preguntar: “¿Apruebas este commit?”
