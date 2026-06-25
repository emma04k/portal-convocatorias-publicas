# Portal de Convocatorias Públicas — Plan Técnico

> **Para Hermes/Codex:** usar el bundle `reto-dev` como flujo de trabajo: `plan`, `codex`, `test-driven-development`, `systematic-debugging`, `requesting-code-review` y `github-pr-workflow`. Implementar fase por fase, sin escribir código manualmente fuera de Hermes/Codex, sin push, y cerrando cada fase con revisión de `git status` y propuesta de commit aprobada por el usuario.

**Objetivo:** construir una aplicación web end-to-end para que usuarios registrados exploren convocatorias públicas colombianas desde datos.gov.co/SECOP, filtren resultados, guarden favoritos y administren búsquedas guardadas.

**Arquitectura:** monolito web con Next.js App Router, API REST en `app/api`, capa de servicios para reglas de negocio e integración Socrata/SODA, Prisma como ORM y PostgreSQL como base de datos persistente. La autenticación usa JWT firmado en cookies HTTP-only o encabezado Authorization, contraseñas hasheadas con bcrypt y validación de todos los inputs externos con Zod.

**Tech stack:** Next.js, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, API SODA de datos.gov.co (`https://www.datos.gov.co/resource/p6dx-8zbt.json`).

---

## 1. Contexto y restricciones

Fuentes leídas:
- `AGENTS.md`: reglas obligatorias del proyecto.
- `SOUL.md`: documentación viva del proceso AI-First.
- `docs/context/2a-reto-ai-first-fase1.pdf`: requisitos del reto. La ruta solicitada `docs/context/reto-ai-first-fase1.pdf` no existe; se usó el PDF encontrado en `docs/context/2a-reto-ai-first-fase1.pdf`.
- Bundle `reto-dev`: definido en `/home/edog/.hermes/skill-bundles/reto-dev.yaml`.

Restricciones obligatorias:
- Cero código manual: Hermes/Codex genera e itera cambios.
- No hacer push.
- No editar migraciones manualmente; generar cambios de esquema mediante Prisma.
- Todo endpoint REST debe validar inputs con Zod y manejar errores.
- JWT para autenticación; bcrypt para hashing de passwords.
- Todo cambio importante debe actualizar `SOUL.md` o `docs/ai-log.md`.
- Después de cada fase: revisar `git status`, listar archivos modificados, resumir cambios, proponer commit en inglés y preguntar “¿Apruebas este commit?”.

---

## 2. Arquitectura final del proyecto

### 2.1 Capas

1. Frontend Next.js App Router
   - Pantallas públicas: landing, login, registro.
   - Pantallas privadas: dashboard/browse de convocatorias, detalle, bookmarks, búsquedas guardadas, perfil.
   - Componentes reutilizables para formularios, filtros, tarjetas de convocatorias, estados de carga y errores.

2. API REST en `app/api`
   - Endpoints de autenticación.
   - Endpoints de usuario/perfil.
   - Endpoints proxy/normalización de convocatorias SECOP desde datos.gov.co.
   - Endpoints de bookmarks.
   - Endpoints de búsquedas guardadas.
   - Respuestas JSON consistentes y manejo centralizado de errores.

3. Capa de dominio y servicios en `lib/`
   - `lib/auth`: hashing, JWT, sesión actual.
   - `lib/db`: Prisma Client singleton.
   - `lib/validators`: schemas Zod compartidos por API y frontend.
   - `lib/secop`: cliente Socrata/SODA, mapeo de filtros, normalización de datos externos.
   - `lib/errors`: helpers de errores HTTP y respuestas consistentes.

4. Persistencia
   - PostgreSQL.
   - Prisma schema y migraciones generadas por Prisma.
   - Tablas mínimas: usuarios, bookmarks, búsquedas guardadas.

5. Integración externa
   - API SECOP I/SODA: `https://www.datos.gov.co/resource/p6dx-8zbt.json`.
   - Consultas sin API key para fase inicial.
   - Filtros por entidad, fecha, estado y texto libre cuando el dataset lo permita.

### 2.2 Flujo de datos principal

1. Usuario inicia sesión o se registra.
2. API autentica, hashea/verifica password con bcrypt y emite JWT.
3. Frontend consulta `/api/convocatorias` con filtros.
4. API valida query params con Zod, traduce filtros a SODA, consulta datos.gov.co y normaliza respuesta.
5. Usuario guarda una convocatoria.
6. API protegida valida JWT, persiste bookmark con Prisma y devuelve estado actualizado.
7. Usuario consulta bookmarks, búsquedas guardadas y perfil desde endpoints protegidos.

---

## 3. Estructura de carpetas propuesta

```text
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── bookmarks/
│   │   │   ├── route.ts
│   │   │   └── [externalId]/route.ts
│   │   ├── convocatorias/
│   │   │   ├── route.ts
│   │   │   └── [externalId]/route.ts
│   │   ├── profile/route.ts
│   │   └── saved-searches/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── bookmarks/page.tsx
│   ├── convocatorias/
│   │   ├── page.tsx
│   │   └── [externalId]/page.tsx
│   ├── profile/page.tsx
│   ├── saved-searches/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── bookmarks/
│   ├── convocatorias/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── auth/
│   │   ├── bcrypt.ts
│   │   ├── jwt.ts
│   │   └── session.ts
│   ├── db/
│   │   └── prisma.ts
│   ├── errors/
│   │   └── api-error.ts
│   ├── secop/
│   │   ├── client.ts
│   │   ├── mapper.ts
│   │   └── types.ts
│   └── validators/
│       ├── auth.ts
│       ├── bookmarks.ts
│       ├── convocatorias.ts
│       ├── profile.ts
│       └── saved-searches.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── tests/
│   ├── api/
│   ├── integration/
│   └── unit/
├── docs/
│   ├── ai-log.md
│   └── context/
│       └── 2a-reto-ai-first-fase1.pdf
├── docker-compose.yml
├── Dockerfile.dev
├── .dockerignore
├── .env.example
├── AGENTS.md
├── SOUL.md
├── package.json
└── README.md
```

Nota: la estructura se creará gradualmente por fases. Este plan no implementa archivos de código.

---

## 4. Ejecución local con Docker

Objetivo: permitir levantar el portal localmente sin instalar Node.js ni PostgreSQL directamente en WSL. El único prerrequisito local será Docker con Docker Compose.

### 4.1 Servicios de Docker Compose

Se debe crear `docker-compose.yml` con dos servicios principales:

1. `app`
   - Construye la aplicación Next.js usando `Dockerfile.dev`.
   - Expone la app en `http://localhost:3000` mediante el mapeo `3000:3000`.
   - Monta el código del repositorio dentro del contenedor para desarrollo.
   - Usa volumen separado para `node_modules` para evitar conflictos entre dependencias instaladas en Linux del contenedor y el filesystem montado desde WSL/Windows.
   - Depende de `db`.
   - Define `DATABASE_URL` apuntando al host interno `db`.

2. `db`
   - Usa una imagen oficial de PostgreSQL.
   - Expone PostgreSQL solo dentro de la red de Compose como `db:5432` para la app.
   - Persiste datos en un volumen de Docker.
   - Configura usuario, password y base de datos de desarrollo sin secretos reales.

### 4.2 Variables de entorno de desarrollo

Para Prisma dentro de Docker Compose, la URL de conexión debe usar el hostname del servicio `db`:

```env
DATABASE_URL="postgresql://postgres:<dev-password>@db:5432/portal_convocatorias?schema=public"
```

Notas:
- No usar `localhost` dentro del contenedor `app` para conectar a PostgreSQL; dentro de Compose el host correcto es `db`.
- `.env.example` debe documentar esta URL para desarrollo Docker, sin secretos reales de producción.
- Si se necesita conexión desde herramientas del host en una fase futura, se puede evaluar exponer `5432:5432`, pero el requisito base del plan es que PostgreSQL esté disponible internamente como `db:5432`.

### 4.3 Archivos de infraestructura a crear en Fase 1

#### `Dockerfile.dev`

Responsabilidades:
- Usar una imagen Node LTS.
- Definir `/app` como directorio de trabajo.
- Copiar `package.json` y lockfile cuando existan.
- Instalar dependencias dentro del contenedor.
- Exponer el puerto `3000`.
- Ejecutar el servidor de desarrollo de Next.js escuchando en `0.0.0.0` para que el puerto sea accesible desde el host.

#### `.dockerignore`

Debe excluir, como mínimo:
- `node_modules`
- `.next`
- `.git`
- `.env`
- logs y archivos temporales

#### Volúmenes recomendados

Se debe usar:
- Un bind mount del repositorio hacia `/app` para desarrollo.
- Un volumen nombrado para `/app/node_modules`.
- Un volumen nombrado para datos de PostgreSQL.

### 4.4 Comandos documentados

Levantar la app y base de datos:

```bash
docker compose up -d --build
docker compose ps
```

Detener y remover contenedores/red asociada:

```bash
docker compose down
```

Ejecutar migraciones Prisma desde el contenedor `app`:

```bash
docker compose exec app npx prisma migrate dev
```

Ejecutar lint desde el contenedor `app`:

```bash
docker compose exec app npm run lint
```

Ejecutar build desde el contenedor `app`:

```bash
docker compose exec app npm run build
```

### 4.5 Criterios de aceptación de ejecución local

- `docker compose up --build` levanta `app` y `db` sin requerir Node.js ni PostgreSQL instalados directamente en WSL.
- La aplicación queda disponible en `http://localhost:3000`.
- El servicio `app` puede resolver PostgreSQL como `db:5432`.
- Prisma usa `DATABASE_URL` con host `db` dentro de Compose.
- `docker compose exec app npx prisma migrate dev` ejecuta migraciones contra el servicio `db`.
- `docker compose exec app npm run lint` y `docker compose exec app npm run build` son los comandos oficiales de validación local.

---

## 5. Modelo de datos

### 5.1 Entidades

#### User

Propósito: usuario registrado con perfil propio.

Campos:
- `id`: identificador interno.
- `email`: único, normalizado a lowercase.
- `name`: nombre visible.
- `passwordHash`: hash bcrypt; nunca guardar password plano.
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de actualización.

Relaciones:
- Tiene muchos `Bookmark`.
- Tiene muchas `SavedSearch`.

Índices/constraints:
- Unique en `email`.

#### Bookmark

Propósito: favorito persistido de una convocatoria externa de SECOP/datos.gov.co.

Campos:
- `id`: identificador interno.
- `userId`: FK a usuario.
- `externalId`: identificador estable de la convocatoria/contrato en datos.gov.co.
- `source`: origen, inicialmente `SECOP_I`.
- `title`: título o descripción resumida normalizada.
- `entityName`: entidad contratante normalizada.
- `status`: estado externo normalizado si existe.
- `processNumber`: número de proceso/contrato si existe.
- `url`: enlace externo si existe.
- `rawData`: JSON con snapshot mínimo del registro externo para mostrar bookmarks aunque cambie la API.
- `createdAt`: fecha de guardado.

Relaciones:
- Pertenece a `User`.

Índices/constraints:
- Unique compuesto `userId + externalId + source` para evitar duplicados.
- Índice por `userId`.

#### SavedSearch

Propósito: búsqueda guardada por el usuario para repetir filtros frecuentes.

Campos:
- `id`: identificador interno.
- `userId`: FK a usuario.
- `name`: nombre asignado por el usuario.
- `query`: texto libre opcional.
- `entityName`: filtro por entidad opcional.
- `status`: filtro por estado opcional.
- `dateFrom`: fecha inicial opcional.
- `dateTo`: fecha final opcional.
- `filters`: JSON opcional para preservar filtros adicionales.
- `createdAt`: fecha de creación.
- `updatedAt`: fecha de actualización.

Relaciones:
- Pertenece a `User`.

Índices/constraints:
- Índice por `userId`.
- Opcional: unique compuesto `userId + name` si se decide evitar nombres duplicados.

### 5.2 Datos que NO se persistirán inicialmente

- No se guardará una copia completa del dataset SECOP.
- No se implementarán roles administrativos en la primera versión.
- No se almacenarán tokens externos ni API keys de datos.gov.co para consultas básicas.

---

## 6. Endpoints REST necesarios

Todas las rutas deben:
- Validar body/query/path params con Zod.
- Responder JSON.
- Manejar errores con códigos HTTP adecuados.
- No exponer stack traces ni secretos.
- Usar Prisma para persistencia.

### 6.1 Auth

#### `POST /api/auth/register`

Body:
- `name`
- `email`
- `password`

Comportamiento:
- Validar input.
- Normalizar email.
- Rechazar email duplicado.
- Hashear password con bcrypt.
- Crear usuario.
- Emitir JWT y devolver usuario seguro sin `passwordHash`.

Códigos esperados:
- `201` creado.
- `400` validación inválida.
- `409` email ya registrado.
- `500` error inesperado.

#### `POST /api/auth/login`

Body:
- `email`
- `password`

Comportamiento:
- Validar input.
- Buscar usuario.
- Comparar password con bcrypt.
- Emitir JWT si las credenciales son válidas.

Códigos esperados:
- `200` autenticado.
- `400` validación inválida.
- `401` credenciales inválidas.
- `500` error inesperado.

#### `POST /api/auth/logout`

Comportamiento:
- Invalidar cookie HTTP-only si se usa cookie.
- Si se usa Authorization header, devolver éxito para que el frontend borre token local.

Códigos esperados:
- `200` sesión cerrada.

#### `GET /api/auth/me`

Comportamiento:
- Requiere JWT.
- Devuelve usuario autenticado sin datos sensibles.

Códigos esperados:
- `200` usuario actual.
- `401` no autenticado.

### 6.2 Perfil

#### `GET /api/profile`

Comportamiento:
- Requiere JWT.
- Devuelve datos del usuario y conteos básicos: bookmarks y búsquedas guardadas.

#### `PATCH /api/profile`

Body:
- `name` opcional.
- `email` opcional.
- `currentPassword`/`newPassword` opcionales para cambio de password.

Comportamiento:
- Requiere JWT.
- Validar input.
- Si cambia password, verificar contraseña actual y hashear nueva.

### 6.3 Convocatorias SECOP

#### `GET /api/convocatorias`

Query params:
- `q` texto libre opcional.
- `entity` opcional.
- `status` opcional.
- `dateFrom` opcional.
- `dateTo` opcional.
- `limit` con máximo seguro.
- `offset` para paginación.

Comportamiento:
- Validar filtros.
- Traducir filtros a SODA.
- Consultar `https://www.datos.gov.co/resource/p6dx-8zbt.json`.
- Normalizar respuesta a un DTO estable del portal.
- Incluir metadata de paginación básica.

#### `GET /api/convocatorias/[externalId]`

Comportamiento:
- Validar `externalId`.
- Consultar un registro por identificador externo si el dataset expone un campo estable.
- Normalizar detalle.
- Opcionalmente incluir si el usuario autenticado ya lo guardó como bookmark.

### 6.4 Bookmarks

#### `GET /api/bookmarks`

Comportamiento:
- Requiere JWT.
- Lista bookmarks del usuario autenticado, ordenados por fecha de guardado descendente.

#### `POST /api/bookmarks`

Body:
- `externalId`
- `source`
- `title`
- `entityName`
- `status`
- `processNumber`
- `url`
- `rawData`

Comportamiento:
- Requiere JWT.
- Validar input.
- Crear bookmark si no existe.
- Si ya existe, devolverlo sin duplicar.

#### `DELETE /api/bookmarks/[externalId]`

Comportamiento:
- Requiere JWT.
- Elimina bookmark del usuario para ese `externalId`.
- Debe ser idempotente: si no existe, responder éxito o `404` según decisión de implementación; se recomienda `204` idempotente.

### 6.5 Búsquedas guardadas

#### `GET /api/saved-searches`

Comportamiento:
- Requiere JWT.
- Lista búsquedas guardadas del usuario.

#### `POST /api/saved-searches`

Body:
- `name`
- `query`
- `entityName`
- `status`
- `dateFrom`
- `dateTo`
- `filters`

Comportamiento:
- Requiere JWT.
- Validar input.
- Guardar filtros reutilizables.

#### `PATCH /api/saved-searches/[id]`

Comportamiento:
- Requiere JWT.
- Solo permite editar búsquedas propias.
- Actualiza nombre y filtros.

#### `DELETE /api/saved-searches/[id]`

Comportamiento:
- Requiere JWT.
- Solo permite borrar búsquedas propias.

---

## 7. Pantallas del frontend

### Públicas

1. Landing `/`
   - Explica el portal.
   - CTA a registro/login.
   - Resume fuente SECOP/datos.gov.co.

2. Registro `/auth/register`
   - Formulario con nombre, email y password.
   - Validación cliente alineada con Zod.
   - Redirige a convocatorias tras registro exitoso.

3. Login `/auth/login`
   - Formulario email/password.
   - Manejo de errores de credenciales.
   - Redirige a convocatorias tras login exitoso.

### Privadas

4. Browse `/convocatorias`
   - Filtros: texto, entidad, estado, fecha desde/hasta.
   - Lista paginada de convocatorias.
   - Acciones: ver detalle, guardar/quitar bookmark, guardar búsqueda.
   - Estados: loading, error de API externa, sin resultados.

5. Detalle `/convocatorias/[externalId]`
   - Información completa normalizada de la convocatoria.
   - Acción guardar/quitar bookmark.
   - Enlace a fuente externa si está disponible.

6. Bookmarks `/bookmarks`
   - Lista de favoritos persistidos.
   - Eliminar favorito.
   - Volver a consultar detalle/fuente.

7. Búsquedas guardadas `/saved-searches`
   - Lista de búsquedas guardadas.
   - Ejecutar búsqueda.
   - Editar nombre/filtros.
   - Eliminar búsqueda.

8. Perfil `/profile`
   - Datos del usuario.
   - Conteos de actividad.
   - Editar nombre/email.
   - Cambiar contraseña.
   - Cerrar sesión.

---

## 8. Fases de implementación

### Fase 0 — Planificación y trazabilidad

Objetivo:
- Dejar documentado el plan técnico y actualizar `SOUL.md`.

Actividades:
- Crear plan técnico en `.hermes/plans/`.
- Registrar plan en `SOUL.md`.
- Revisar `git status`.
- Proponer commit de documentación.

Criterios de aceptación:
- El plan contiene arquitectura, estructura, modelo de datos, endpoints, pantallas, fases, criterios y commits.
- `SOUL.md` referencia el plan técnico.
- No se implementa código de aplicación.

Commit propuesto:
- `docs(ai): add technical implementation plan`

### Fase 1 — Bootstrap del proyecto Next.js y calidad base

Objetivo:
- Inicializar la base de Next.js con TypeScript y herramientas mínimas de calidad.

Actividades:
- Crear proyecto Next.js App Router en el repo existente.
- Configurar TypeScript.
- Configurar lint/build scripts.
- Crear `docker-compose.yml` con servicios `app` y `db`.
- Crear `Dockerfile.dev` para ejecutar Next.js dentro de Docker.
- Crear `.dockerignore` para excluir dependencias, build output, Git y archivos sensibles.
- Configurar `.env.example` con `DATABASE_URL` para Prisma usando el host interno `db`.
- Crear `.env.example` sin secretos.
- Crear README inicial con ejecución local mediante Docker Compose.
- Crear `docs/ai-log.md` si no existe.

Criterios de aceptación:
- `docker compose up --build` levanta `app` y `db`.
- La app queda expuesta en `http://localhost:3000`.
- PostgreSQL queda disponible para la app como `db:5432`.
- `docker compose exec app npm run lint` ejecuta sin errores nuevos.
- `docker compose exec app npm run build` ejecuta correctamente o queda documentado cualquier bloqueo real.
- No hay secretos ni `.env` versionado.

Commit propuesto:
- `chore(dev): bootstrap nextjs docker environment`

### Fase 2 — Prisma y modelo de datos PostgreSQL

Objetivo:
- Configurar Prisma y definir modelos `User`, `Bookmark` y `SavedSearch`.

Actividades:
- Instalar Prisma y Prisma Client.
- Configurar `prisma/schema.prisma` para PostgreSQL.
- Modelar usuarios, bookmarks y búsquedas guardadas.
- Generar migración con Prisma; no editar migraciones manualmente.
- Crear Prisma Client singleton.

Criterios de aceptación:
- `npx prisma validate` pasa.
- `npx prisma generate` pasa.
- La migración se genera por Prisma.
- El modelo soporta las tablas mínimas exigidas por el reto.

Commit propuesto:
- `feat(db): add prisma data model`

### Fase 3 — Autenticación JWT con bcrypt y Zod

Objetivo:
- Implementar registro, login, logout y usuario actual.

Actividades:
- Crear schemas Zod para registro/login.
- Crear helpers de bcrypt y JWT.
- Implementar rutas `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Crear protección de rutas API.
- Agregar pruebas unitarias e integración para auth usando TDD.

Criterios de aceptación:
- Registro crea usuario con password hasheado.
- Login rechaza credenciales inválidas.
- JWT permite consultar `/api/auth/me`.
- No se expone `passwordHash`.
- Tests relevantes pasan.

Commit propuesto:
- `feat(auth): add jwt authentication`

### Fase 4 — Integración SECOP/datos.gov.co

Objetivo:
- Consultar convocatorias en vivo desde datos.gov.co usando API SODA.

Actividades:
- Crear cliente `lib/secop/client.ts`.
- Definir DTO normalizado de convocatoria.
- Implementar filtros por entidad, fecha, estado y texto cuando el dataset lo permita.
- Implementar `GET /api/convocatorias` y `GET /api/convocatorias/[externalId]`.
- Agregar manejo de errores de red/API externa.
- Agregar pruebas de mapper y validación; mockear red solo donde sea necesario.

Criterios de aceptación:
- Endpoint lista convocatorias reales o reporta error controlado.
- Los filtros se validan y no permiten query injection.
- La respuesta usa un shape estable para el frontend.
- Tests de normalización y validación pasan.

Commit propuesto:
- `feat(secop): add public calls integration`

### Fase 5 — Bookmarks persistidos

Objetivo:
- Permitir guardar y administrar favoritos por usuario.

Actividades:
- Crear schemas Zod de bookmarks.
- Implementar `GET /api/bookmarks`, `POST /api/bookmarks`, `DELETE /api/bookmarks/[externalId]`.
- Validar ownership por JWT.
- Evitar duplicados con unique compuesto.
- Agregar pruebas de endpoints protegidos.

Criterios de aceptación:
- Usuario autenticado puede guardar convocatoria.
- Usuario no autenticado recibe `401`.
- Duplicados no crean registros repetidos.
- Usuario solo ve y borra sus propios bookmarks.

Commit propuesto:
- `feat(bookmarks): persist user favorites`

### Fase 6 — Búsquedas guardadas

Objetivo:
- Permitir guardar, editar, ejecutar y eliminar búsquedas frecuentes.

Actividades:
- Crear schemas Zod de búsquedas guardadas.
- Implementar CRUD REST protegido.
- Conectar ejecución de búsqueda guardada con filtros de `/convocatorias`.
- Agregar pruebas de ownership y validación.

Criterios de aceptación:
- Usuario puede crear, listar, editar y borrar búsquedas propias.
- Filtros guardados pueden reabrir `/convocatorias` con query params.
- Usuario no puede acceder a búsquedas de otro usuario.

Commit propuesto:
- `feat(searches): add saved searches`

### Fase 7 — Frontend de autenticación y navegación

Objetivo:
- Crear interfaz base y flujo de sesión.

Actividades:
- Crear layout global y navegación.
- Crear pantallas landing, login y registro.
- Conectar formularios con endpoints auth.
- Manejar estados de carga y error.
- Proteger pantallas privadas desde el frontend.

Criterios de aceptación:
- Usuario puede registrarse desde UI.
- Usuario puede iniciar y cerrar sesión desde UI.
- Pantallas privadas redirigen o bloquean usuarios no autenticados.
- Build/lint pasan.

Commit propuesto:
- `feat(ui): add authentication screens`

### Fase 8 — Frontend de convocatorias, bookmarks y búsquedas

Objetivo:
- Completar experiencia principal del portal.

Actividades:
- Crear browse con filtros y paginación.
- Crear tarjetas y detalle de convocatoria.
- Conectar guardar/quitar bookmark.
- Crear pantallas de bookmarks y búsquedas guardadas.
- Añadir estados vacíos, loading y errores.

Criterios de aceptación:
- Usuario puede buscar convocatorias reales desde UI.
- Usuario puede guardar y quitar favoritos desde UI.
- Usuario puede guardar y ejecutar búsquedas desde UI.
- La experiencia end-to-end auth + browse + bookmark funciona.

Commit propuesto:
- `feat(ui): add calls browsing experience`

### Fase 9 — Perfil, hardening y demo

Objetivo:
- Cerrar el producto para evaluación del reto.

Actividades:
- Crear pantalla de perfil.
- Completar README con setup, variables y demo flow.
- Actualizar `SOUL.md` y `docs/ai-log.md` con decisiones finales.
- Ejecutar lint/build/tests.
- Revisar seguridad básica: secretos, validación, errores, passwords, JWT.
- Preparar checklist para demo de 5–7 minutos.

Criterios de aceptación:
- Demo end-to-end documentada.
- Tests/lint/build pasan o bloqueos quedan documentados honestamente.
- `SOUL.md` tiene trazabilidad suficiente del proceso AI-First.
- No hay push automático.

Commit propuesto:
- `docs(ai): finalize challenge delivery notes`

---

## 9. Estrategia de pruebas y validación

Regla general por el bundle `reto-dev`:
- Implementación con TDD cuando se cree código de comportamiento.
- Cada fase con verificación antes de proponer commit.
- Revisión de código antes de commits con cambios no triviales.

Pruebas esperadas:
- Unitarias: validators Zod, mappers SECOP, helpers auth.
- Integración API: auth, bookmarks, saved searches, convocatorias con mock controlado de red.
- End-to-end manual/demo: registro → login → browse SECOP → bookmark → bookmarks → saved search → perfil/logout.

Comandos previstos cuando exista el proyecto:
- `docker compose up -d --build`
- `docker compose ps`
- `docker compose exec app npm run lint`
- `docker compose exec app npm run build`
- `docker compose exec app npm test` o comando equivalente configurado en `package.json`
- `docker compose exec app npx prisma migrate dev`
- `docker compose exec app npx prisma validate`
- `docker compose exec app npx prisma generate`
- `docker compose down`
- Alternativamente, dentro del contenedor `app`: `npm run lint`, `npm run build` y `npm test`.

---

## 10. Riesgos, trade-offs y decisiones

1. Dataset SECOP externo
   - Riesgo: nombres de campos del dataset pueden no coincidir con los filtros deseados.
   - Mitigación: crear capa `lib/secop/mapper.ts` y ajustar filtros después de inspeccionar datos reales.

2. Sin API key de datos.gov.co
   - Riesgo: rate limits para consultas públicas.
   - Mitigación: limitar `limit`, paginar y manejar errores de API externa; considerar API key solo si se vuelve necesario y sin commitear secretos.

3. JWT en cookie vs local storage
   - Decisión recomendada: cookie HTTP-only para reducir exposición a XSS.
   - Si se usa Authorization header por simplicidad inicial, documentar trade-off y evitar persistencia insegura.

4. PostgreSQL en entorno local
   - Riesgo: setup más pesado que SQLite si se instala directamente en WSL.
   - Mitigación: usar Docker Compose con servicio `db` y `DATABASE_URL` apuntando a `db:5432`.

5. Alcance de 6 días hábiles
   - Decisión: priorizar flujo end-to-end mínimo funcional sobre features administrativas.

6. Dependencias Node en bind mounts
   - Riesgo: conflictos entre `node_modules` del host y del contenedor.
   - Mitigación: usar volumen nombrado para `/app/node_modules` y excluir `node_modules` en `.dockerignore`.

---

## 11. Checklist de cierre por fase

Antes de proponer commit en cada fase:
- [ ] Releer `AGENTS.md` si hay duda de reglas.
- [ ] Confirmar que no se escribió código manualmente fuera de Hermes/Codex.
- [ ] Ejecutar pruebas/validaciones aplicables.
- [ ] Actualizar `SOUL.md` o `docs/ai-log.md` si la fase cambia decisiones importantes.
- [ ] Ejecutar `git status --short`.
- [ ] Mostrar archivos modificados.
- [ ] Resumir el cambio.
- [ ] Proponer mensaje de commit en inglés.
- [ ] Preguntar: “¿Apruebas este commit?”
- [ ] Solo hacer commit si el usuario aprueba.
- [ ] No hacer push.

---

## 12. Primer commit de esta planificación

Archivos esperados:
- `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`
- `SOUL.md`

Mensaje propuesto:
- `docs(ai): add technical implementation plan`
