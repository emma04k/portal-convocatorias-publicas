# SOUL.md — Portal de Convocatorias Públicas

## Alcance de este documento

Este archivo es el entregable de proceso del Reto AI-First Fase 1 para este repositorio.

No es el `SOUL.md` global de Hermes ubicado en `~/.hermes/SOUL.md`. No contiene personalidad del agente ni instrucciones globales. Las reglas operativas del proyecto están en `AGENTS.md`.

Este documento está organizado según la plantilla recomendada en `docs/context/2a-reto-ai-first-fase1.pdf`:

- Proyecto: qué se construyó y qué problema resuelve.
- Stack y arquitectura: componentes y cómo se conectan.
- Cómo se usó Hermes y los LLMs.
- Decisiones y trade-offs.
- Bloqueos y cómo se resolvieron.
- Qué se mejoraría o pediría.
- Enlace al repositorio.

## Proyecto: qué construí y qué problema resuelve

Construí el Portal de Convocatorias Públicas del Reto AI-First Fase 1.

El objetivo del proyecto es ofrecer un portal web donde usuarios registrados pueden explorar convocatorias públicas colombianas, filtrarlas, consultar detalles, guardar convocatorias como favoritas, guardar búsquedas frecuentes y administrar su perfil.

El problema que resuelve es centralizar la consulta y seguimiento de convocatorias públicas usando datos abiertos de datos.gov.co/SECOP, con autenticación y persistencia propia por usuario.

Flujo end-to-end implementado:

1. Registro e inicio de sesión con JWT.
2. Consulta en vivo de convocatorias desde datos.gov.co/SECOP.
3. Filtros por texto, entidad, estado y fechas.
4. Consulta de detalle por identificador externo.
5. Guardado y eliminación de favoritos.
6. Guardado, ejecución y eliminación de búsquedas frecuentes.
7. Perfil con datos de cuenta, métricas de actividad y cambio de contraseña.
8. Cierre de sesión y protección de rutas privadas.

## Stack y arquitectura: componentes y cómo se conectan

### Stack técnico

Según las reglas del proyecto en `AGENTS.md` y la implementación final, el stack es:

- Next.js App Router.
- TypeScript.
- API REST en `app/api`.
- Prisma ORM.
- PostgreSQL.
- JWT en cookie HTTP-only.
- bcrypt para hashing de contraseñas.
- Zod para validación de inputs externos.
- Vitest para pruebas automatizadas.
- Docker Compose para desarrollo y validación local.
- Vercel + Neon como ruta recomendada para despliegue gratuito.

### Arquitectura implementada

La arquitectura del producto quedó como un monolito Next.js con API REST interna:

- `app/`: rutas y páginas de Next.js.
- `app/api/`: endpoints REST de autenticación, convocatorias, favoritos, búsquedas guardadas y perfil.
- `components/`: navegación, formularios, browser de convocatorias, tarjetas, detalle, gestores de recursos y perfil.
- `lib/auth/`: helpers de sesión, cookies, JWT y hashing de contraseñas.
- `lib/db/prisma.ts`: singleton de Prisma Client.
- `lib/secop/`: cliente, tipos y mapper para datos.gov.co/SECOP.
- `lib/validators/`: validadores Zod por dominio.
- `prisma/schema.prisma`: modelos `User`, `Bookmark` y `SavedSearch`.
- `prisma/migrations/`: migración inicial generada con Prisma.
- `tests/`: pruebas de validadores, rutas, UI y regresiones.
- `docker-compose.yml` y `Dockerfile.dev`: entorno local reproducible.

### Conexión entre componentes

- El frontend consume rutas REST internas bajo `/api`.
- Las rutas protegidas derivan el usuario desde la cookie JWT `auth_token`; el cliente no decide ni envía `userId`.
- Prisma conecta la lógica de API con PostgreSQL.
- El cliente SECOP consulta el dataset SODA `p6dx-8zbt` de datos.gov.co y normaliza la respuesta a DTOs estables.
- Zod valida entradas externas antes de consultar SECOP o escribir en base de datos.
- Docker Compose conecta `app` con PostgreSQL usando el host interno `db:5432`.
- En Vercel el build usa la salida estándar `.next`; en desarrollo local `next dev` usa `.next-dev` para evitar conflictos de artefactos.

## Cómo usé Hermes y los LLMs

Hermes se usó como agente principal de desarrollo, documentación, validación y corrección. Los cambios de código y documentación se generaron o modificaron mediante herramientas del agente, siguiendo la regla de cero código manual.

### Reglas de trabajo usadas como base

El archivo `AGENTS.md` fue la fuente normativa principal:

- No escribir código manualmente: todo cambio de código debe ser generado por Hermes/Codex.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No modificar migraciones manualmente.
- Todo endpoint debe tener manejo de errores.
- Todo cambio importante debe actualizar `SOUL.md` o `docs/ai-log.md`.
- Usar Conventional Commits siempre en inglés.
- Después de cada fase implementada, revisar `git status`, proponer un commit y pedir aprobación explícita antes de ejecutarlo.

### Skills e instrucciones clave

Skills y flujos usados durante el proyecto:

- Bundle `reto-dev`, definido en `/home/edog/.hermes/skill-bundles/reto-dev.yaml`.
- `plan`: para crear el plan técnico accionable antes de implementar código.
- `test-driven-development`: para trabajar con pruebas RED/GREEN en auth, SECOP, bookmarks, búsquedas, UI y perfil.
- `systematic-debugging`: para investigar errores antes de corregirlos, especialmente el error de Vercel al no encontrar `.next`.
- `docker-compose-development`: para validar con flujo Docker Compose no bloqueante.
- `database-migrations`: para respetar Prisma y no editar migraciones manualmente.
- `git-workflow`: para mantener Conventional Commits en inglés, revisar estado Git y pedir aprobación antes de commits.
- `github-pr-workflow` y `requesting-code-review`: para alinear revisión y preparación de cambios.
- `ocr-and-documents`: para extraer del PDF del reto la plantilla usada para organizar este entregable.

### Prompts e iteraciones que funcionaron bien

Prompts relevantes usados por el usuario:

- Crear `AGENTS.md` con reglas del proyecto para el Reto AI-First.
- Crear `SOUL.md` como entregable del reto, aclarando que no debe confundirse con el `SOUL.md` global de Hermes.
- Crear el plan técnico del Portal de Convocatorias Públicas usando el bundle `reto-dev`, sin implementar código todavía.
- Ajustar el plan técnico para ejecución local con Docker Compose antes de implementar código.
- Determinar la última fase completada y continuar únicamente con la siguiente fase pendiente del plan técnico.
- Validar qué estaba pendiente antes de subir al repo, separando commits locales, cambios sin commit y estado del remote.
- Preparar el repositorio para despliegue en Vercel + Neon.
- Investigar y corregir el fallo de Vercel sobre la carpeta `.next`.

Iteraciones útiles:

- Planificar primero, implementar por fases y validar cada fase con herramientas reales.
- Usar TDD para endpoints y componentes críticos.
- Mantener documentación viva en `docs/ai-log.md`, `README.md` y `SOUL.md`.
- Hacer commit solo después de resumir archivos, cambio y mensaje propuesto.
- No hacer push salvo instrucción explícita del usuario.

## Qué se construyó hasta ahora

### Fase 0 — Planificación y trazabilidad

- Se creó `AGENTS.md` con contexto, reglas AI-First, stack, arquitectura, seguridad, base de datos y convención de commits.
- Se creó `SOUL.md` como documentación del proceso y entregable del reto.
- Se creó el plan técnico en `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`.
- Se definió una implementación incremental por fases.
- Se ajustó el plan para que la ejecución local no requiera instalar Node.js ni PostgreSQL directamente en WSL.

### Fase 1 — Bootstrap Next.js y entorno Docker

- Se creó la base de Next.js con TypeScript, scripts `dev`, `lint`, `build` y `start`, estructura `app/`, estilos globales y pantalla inicial.
- Se creó la infraestructura local con `docker-compose.yml`, `Dockerfile.dev`, `.dockerignore`, `.env.example`, volumen para `node_modules` y servicio PostgreSQL interno `db:5432`.
- Se creó `docs/ai-log.md` para registrar el avance AI-First por fases.
- Se resolvió el bloqueo de `docker compose config` creando un `.env` local de desarrollo no versionado y confirmando que `.env` está ignorado por Git.
- Se corrigieron bloqueos de Docker: builds reproducibles con `package-lock.json` + `npm ci`, instalación de OpenSSL para Prisma en Alpine y eliminación de `NODE_ENV: development`.
- Se validó Docker con flujo no bloqueante: `docker compose up -d --build`, `docker compose ps`, lint, build y `docker compose down`.

### Fase 2 — Prisma y modelo de datos PostgreSQL

- Se creó `prisma/schema.prisma` para PostgreSQL con modelos `User`, `Bookmark` y `SavedSearch`.
- Se generó mediante Prisma la migración inicial `20260625174451_init_data_model` sin editar migraciones manualmente.
- Se creó `lib/db/prisma.ts` como singleton de Prisma Client.
- Se verificó dentro de Docker: `prisma validate`, `prisma migrate dev`, `prisma generate`, `npm run lint` y `npm run build`.

### Fase 3 — Autenticación JWT con bcrypt y Zod

- Se implementó autenticación REST con `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`.
- Se validan inputs con Zod, se hashean passwords con bcrypt y se firma JWT en cookie HTTP-only `SameSite=Strict`.
- Las respuestas de usuario omiten `passwordHash` y los endpoints manejan errores de validación, credenciales inválidas, duplicados y errores internos.
- Se agregó Vitest y pruebas TDD para validadores, JWT y rutas de auth.
- La validación final en Docker pasó con 10 tests, lint y build.
- `npm audit --audit-level=high` reportó vulnerabilidades transitivas en Next.js/eslint-config-next y bcrypt que requieren upgrades mayores; quedaron como hardening pendiente.

### Fase 4 — Integración SECOP/datos.gov.co

- Se implementó la consulta pública de convocatorias desde datos.gov.co usando la API SODA del dataset SECOP `p6dx-8zbt`.
- Se crearon validadores Zod para filtros de convocatorias, tipos y mapper de normalización en `lib/secop/`.
- Se implementaron `GET /api/convocatorias` y `GET /api/convocatorias/[externalId]`.
- Se validan `q`, `entity`, `status`, fechas, paginación e identificadores externos antes de consultar el upstream.
- Los endpoints manejan errores de validación, errores controlados del upstream SECOP, registros no encontrados y errores internos sin exponer stack traces al cliente.
- Se verificó dentro de Docker con 19 tests, lint, build y una consulta local real a `/api/convocatorias?limit=1&q=DANE` con respuesta `200`.

### Fase 5 — Bookmarks persistidos

- Se implementaron favoritos persistidos por usuario con `GET /api/bookmarks`, `POST /api/bookmarks` y `DELETE /api/bookmarks/[externalId]`.
- Los endpoints reutilizan autenticación JWT/cookie, validan inputs con Zod y usan Prisma por `userId`.
- La creación usa `upsert` para respetar el índice único `userId + externalId + source` y evitar duplicados.
- El borrado es idempotente y restringido al usuario autenticado; las respuestas no exponen `userId`.
- Se verificó dentro de Docker con 25 tests, lint y build.

### Fase 6 — Búsquedas guardadas

- Se implementó CRUD REST protegido para búsquedas guardadas con `GET /api/saved-searches`, `POST /api/saved-searches`, `PATCH /api/saved-searches/[id]` y `DELETE /api/saved-searches/[id]`.
- Cada operación deriva `userId` desde la sesión autenticada; no se acepta ownership desde el cliente.
- Las actualizaciones y borrados se restringen por `id + userId`.
- Se preservan filtros JSON para reabrir `/convocatorias` con los criterios guardados.
- Se verificó dentro de Docker con 32 tests, lint y build.

### Fase 7 — Frontend de autenticación y navegación

- Se creó navegación global con enlaces a landing, convocatorias, favoritos, búsquedas guardadas, perfil, login, registro y logout.
- Se implementaron páginas públicas `/auth/login` y `/auth/register` con formularios cliente conectados al API.
- La landing se actualizó con llamadas a la acción.
- Se agregaron páginas privadas placeholder para preparar `/convocatorias`, `/bookmarks`, `/saved-searches` y `/profile`.
- Se implementó middleware de protección frontend para redirigir rutas privadas sin cookie `auth_token` a `/auth/login?next=...`.
- Se evitó importar helpers JWT/Node en middleware para mantener compatibilidad con Edge Runtime.
- Se verificó dentro de Docker con 38 tests, lint y build.

### Fase 8 — Frontend de convocatorias, bookmarks y búsquedas

- Se implementó la experiencia principal de browse en `/convocatorias` con filtros, paginación simple, estados de carga/vacío/error y acciones para guardar favoritos y búsquedas.
- Se creó detalle de convocatoria en `/convocatorias/[externalId]`.
- Se reemplazaron placeholders de `/bookmarks` y `/saved-searches` por gestores cliente reales.
- Se agregaron componentes reutilizables para tarjetas, detalle y managers de recursos persistidos.
- Se añadieron estilos para filtros, grillas, tarjetas, metadata y detalle.
- Se verificó dentro de Docker con 42 tests, lint y build.

### Fase 9 — Perfil, hardening y demo

- Se implementó `GET /api/profile` para exponer usuario seguro y conteos de actividad.
- Se implementó `PATCH /api/profile` para editar nombre/email y cambiar contraseña validando la contraseña actual y rehasheando con bcrypt.
- Se agregó pantalla de perfil con edición de cuenta, cambio de contraseña y métricas de favoritos/búsquedas guardadas.
- Se completó `README.md` con comandos de setup, endpoints, flujo demo end-to-end y checklist de seguridad básica.
- Se revisó que `.env` no esté versionado y que no haya secretos reales en el árbol versionable; los hallazgos fueron placeholders o secretos sintéticos de tests.
- Se verificó dentro de Docker con 51 tests, lint y build.
- `npm audit --audit-level=high` conserva vulnerabilidades transitivas que requieren upgrades breaking (`next`, `eslint-config-next`, `bcrypt`).

### Ajustes posteriores, preparación y despliegue

- Navegación consciente de autenticación: muestra u oculta enlaces según presencia de cookie `auth_token`.
- Corrección del cambio de contraseña para evitar `Cannot read properties of null (reading 'reset')` cuando la contraseña se actualiza correctamente.
- Feedback de perfil mejorado con SweetAlert2 para actualizar cuenta y cambiar contraseña, manteniendo mensajes de éxito/error en español y el reset seguro del formulario solo cuando la API responde correctamente.
- Landing adaptada para ocultar `Iniciar sesión` y `Crear cuenta` cuando el usuario ya está autenticado.
- Pulido visual de la landing, navegación, tarjetas, estados de carga/vacío y accesibilidad global con enlace de salto al contenido, foco visible y objetivos táctiles de 44px.
- Filtros SECOP flexibles por entidad y estado usando coincidencia parcial case-insensitive.
- Aplicación correcta de filtros al ejecutar búsquedas guardadas.
- Botón `Limpiar filtros` en convocatorias.
- Mejoras responsive del layout de filtros para evitar solapamientos.
- Separación local de artefactos de Next.js: `next dev` usa `.next-dev`.
- Preparación para Vercel + Neon: `postinstall` ejecuta `prisma generate`, `db:deploy` ejecuta `prisma migrate deploy` y `README.md` documenta variables y pasos.
- Corrección para Vercel: `npm run build` usa `next build` sin `NEXT_DIST_DIR`, generando `.next`, que es la salida esperada por Vercel.
- Despliegue final completado en Vercel con URL pública: https://portal-convocatorias-publicas-one.vercel.app.
- Base de datos productiva configurada en Neon; la URL real se mantiene fuera del repositorio y se gestiona como variable de entorno segura.
- Migraciones de producción aplicadas a Neon desde Docker con `DATABASE_URL='<NEON_DATABASE_URL>' docker compose run --rm --no-deps -e DATABASE_URL app npm run db:deploy`, evitando depender del `node_modules` local.

Última validación relevante ejecutada:

- `docker compose up -d --build`: OK.
- `docker compose ps`: OK.
- `docker compose exec app npm run lint`: OK.
- `docker compose exec app npm run test`: OK, 19 archivos de test y 62 tests pasando.
- `docker compose exec app npm run build`: OK.
- Verificación de salida `.next`: OK (`vercel-output-ok`).
- `docker compose down`: OK.

Validación posterior relevante ejecutada dentro de Docker para el pulido UI y SweetAlert2:

- `docker compose exec app npm ls sweetalert2 --depth=0`: OK, `sweetalert2@11.26.25` instalado en el volumen `node_modules` del contenedor.
- `docker compose exec app npm run test -- tests/ui/profile-and-demo.test.ts`: OK, 4 tests pasando.
- `docker compose exec app npm run lint`: OK, sin warnings ni errores.
- `docker compose exec app npm run test`: OK, 19 archivos de test y 62 tests pasando.
- `docker compose exec app npm run build`: OK, compilación productiva exitosa.

## Decisiones y trade-offs

- Separar reglas operativas en `AGENTS.md` y documentación de proceso en `SOUL.md`.
- No incluir personalidad del agente ni instrucciones globales en este archivo.
- Mantener este archivo como documentación viva durante el desarrollo.
- Formalizar un workflow de commits con aprobación humana explícita antes de cada commit.
- Usar Conventional Commits en inglés únicamente para mantener consistencia.
- Usar PostgreSQL como base de datos objetivo, aunque el reto permitía PostgreSQL o SQLite, porque `AGENTS.md` fija PostgreSQL.
- Priorizar un monolito Next.js con API REST interna sobre una separación frontend/backend independiente para reducir complejidad y llegar al demo end-to-end.
- Usar Docker Compose como forma oficial de desarrollo local para evitar instalar Node.js y PostgreSQL directamente en WSL.
- Definir que Prisma dentro del contenedor `app` se conecte a PostgreSQL usando `db:5432`, no `localhost`.
- No guardar `.env` ni credenciales reales; `docker-compose.yml` requiere variables locales desde `.env`.
- Consultar SECOP en vivo para cumplir el requisito de integración con datos.gov.co, aceptando dependencia del upstream.
- Usar `upsert` en bookmarks para evitar duplicados y hacer idempotente el guardado.
- Separar artefactos locales de desarrollo con `.next-dev`, pero mantener el build productivo en `.next` para compatibilidad con Vercel.
- Elegir Vercel + Neon como ruta recomendada de despliegue gratuito por compatibilidad con Next.js + PostgreSQL administrado.
- Dejar los upgrades de seguridad como hardening explícito para no mezclar cambios breaking sin una fase dedicada.

## Bloqueos y cómo los resolví

- No existía estructura inicial de Next.js, Prisma ni `app/api`: se resolvió creando primero documentación, plan técnico y luego bootstrap incremental.
- No se encontró inicialmente una ruta genérica `docs/context/reto-ai-first-fase1.pdf`; el PDF disponible y usado fue `docs/context/2a-reto-ai-first-fase1.pdf`.
- `docker compose config` falló por falta de variables locales: se creó `.env` local no versionado y se confirmó que `.env` está cubierto por `.gitignore`.
- `npm install` dentro de Docker tardaba demasiado o no era reproducible: se generó `package-lock.json` y se usó `npm ci --no-audit --no-fund`.
- Prisma en Alpine necesitaba OpenSSL: se agregó `openssl` al `Dockerfile.dev`.
- `NODE_ENV: development` rompía `next build`: se removió esa variable del servicio `app`.
- Middleware con imports incompatibles con Edge Runtime: se evitó importar helpers JWT/Node y se hizo gating por presencia de cookie.
- `npm audit --audit-level=high` reportó vulnerabilidades que no se corrigen sin upgrades mayores: se documentó como hardening pendiente.
- `node_modules` local quedó incompleto y con permisos de root: se usó Docker como ruta confiable para lint, tests y build.
- Vercel falló con `The Next.js output directory ".next" was not found`: se identificó que `build` generaba `.next-build`; se corrigió para usar `next build` y generar `.next`.
- Al agregar `sweetalert2`, el contenedor `app` ya estaba levantado con un volumen `node_modules` anterior que no incluía la nueva dependencia; se resolvió instalando la dependencia dentro del servicio Docker y validando nuevamente con lint, tests y build dentro del contenedor.

## Qué mejoraría o pediría

- Mantener un checklist operativo post-deploy para validar periódicamente la URL pública, autenticación, favoritos, búsquedas guardadas y perfil.
- Automatizar el flujo controlado de release para migraciones nuevas de Prisma usando el mismo patrón seguro aplicado manualmente: inyectar `DATABASE_URL` como variable de entorno y ejecutar `docker compose run --rm --no-deps -e DATABASE_URL app npm run db:deploy` sin exponer la URL real de Neon.
- Agregar CI en GitHub Actions para lint, tests y build en cada push.
- Agregar pruebas end-to-end con Playwright para registro, login, browse, favoritos, búsquedas, perfil y logout.
- Revisar upgrades de seguridad de Next.js, eslint-config-next y bcrypt en una fase explícita de hardening.
- Agregar rate limiting básico a endpoints de autenticación.
- Mejorar observabilidad server-side en producción sin exponer detalles al cliente.
- Agregar guía de operación post-deploy: migraciones, rollback, variables y smoke tests.
- Evaluar cache o tolerancia a fallos para datos.gov.co si el uso aumenta.
- Agregar seeds o datos demo opcionales para presentaciones.

## Enlace al repositorio

Repositorio publicado:

- https://github.com/emma04k/portal-convocatorias-publicas

Aplicación desplegada:

- https://portal-convocatorias-publicas-one.vercel.app

Base de datos productiva:

- Neon PostgreSQL configurado mediante `DATABASE_URL` en el entorno de despliegue.
- La URL real de Neon y `JWT_SECRET` no se documentan ni se versionan por seguridad.

Estado actual de Git al reorganizar este documento:

- Rama principal: `main`.
- Remoto: `origin/main`.
- La rama local estaba sincronizada con `origin/main` antes de esta actualización documental.
- No se deben subir secretos, `.env`, URL real de Neon ni `JWT_SECRET` al repositorio.

## Convención de commits y trazabilidad

El proyecto usa Conventional Commits en inglés únicamente.

Ejemplos:

- `feat(auth): add JWT authentication`
- `fix(deploy): restore Next.js default build output for Vercel`
- `docs(ai): update SOUL deliverable with challenge template`

Después de cada fase o cambio importante se revisa `git status`, se resumen archivos modificados, se propone un mensaje de commit en inglés y se pregunta: “¿Apruebas este commit?” antes de ejecutar el commit.

La bitácora detallada de cambios está en `docs/ai-log.md`.
