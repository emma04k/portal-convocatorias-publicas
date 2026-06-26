# SOUL.md — Portal de Convocatorias Públicas

## Alcance de este documento

Este archivo es el entregable de proceso del Reto AI-First Fase 1 para este repositorio.

No es el `SOUL.md` global de Hermes ubicado en `~/.hermes/SOUL.md`. No contiene personalidad del agente ni instrucciones globales. Las reglas operativas del proyecto están en `AGENTS.md`.

## Proyecto

Portal de Convocatorias Públicas del Reto AI-First Fase 1.

El objetivo del proyecto es construir un portal web para publicar, consultar y administrar convocatorias públicas, siguiendo una metodología AI-First donde los cambios de código y documentación se generan con asistencia de Hermes/Codex y quedan documentados.

## Repositorio

- Repositorio: https://github.com/emma04k/portal-convocatorias-publicas
- Rama actual al crear este documento: `main`.
- Estado inicial observado: repositorio sin commits todavía; `AGENTS.md` y este `SOUL.md` son archivos nuevos.
- Publicación en GitHub: repositorio público creado con `gh CLI`, remoto `origin` configurado y rama `main` publicada.

## Stack técnico definido

Según las reglas del proyecto en `AGENTS.md`, el stack será:

- Next.js
- TypeScript
- Prisma
- PostgreSQL

## Arquitectura definida

La arquitectura esperada del proyecto es:

- Aplicación web con Next.js.
- API REST ubicada en `app/api`.
- Acceso a base de datos mediante Prisma.
- Base de datos PostgreSQL.
- Autenticación con JWT.
- Hashing de contraseñas con `bcrypt`.
- Validación de inputs con Zod.
- Manejo de errores en todos los endpoints.

## Plan técnico aprobado

Se definió el plan técnico de construcción en `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md` usando el bundle `reto-dev` (`plan`, `codex`, `test-driven-development`, `systematic-debugging`, `requesting-code-review`, `github-pr-workflow`).

El plan aprobado organiza el producto como un monolito Next.js con App Router, API REST en `app/api`, capa de servicios en `lib/`, Prisma Client como acceso a PostgreSQL e integración con datos.gov.co/SECOP mediante la API SODA `https://www.datos.gov.co/resource/p6dx-8zbt.json`.

El plan fue ajustado para que la ejecución local no requiera instalar Node.js ni PostgreSQL directamente en WSL. La estrategia de desarrollo local usará Docker Compose con un servicio `app` para Next.js y un servicio `db` para PostgreSQL. La app se expondrá en `http://localhost:3000`; PostgreSQL estará disponible internamente como `db:5432`; Prisma usará `DATABASE_URL` apuntando al host `db`.

Alcance funcional planificado:

- Autenticación: registro, login, logout y usuario actual con JWT, bcrypt y Zod.
- Convocatorias: consulta en vivo a SECOP, filtros por texto, entidad, estado y fechas, normalización de respuesta y detalle por identificador externo.
- Persistencia: usuarios, bookmarks y búsquedas guardadas en PostgreSQL mediante Prisma.
- Frontend: landing, login, registro, browse de convocatorias, detalle, bookmarks, búsquedas guardadas y perfil.
- Ejecución local: Docker Compose, `Dockerfile.dev`, `.dockerignore`, volumen para `node_modules` y comandos dentro del contenedor `app`.
- Calidad: TDD para comportamiento nuevo, validación Zod en entradas externas, manejo de errores en endpoints, verificación por fase y revisión antes de commits relevantes.

Fases de implementación aprobadas:

1. Planificación y trazabilidad.
2. Bootstrap de Next.js y calidad base.
3. Prisma y modelo de datos PostgreSQL.
4. Autenticación JWT con bcrypt y Zod.
5. Integración SECOP/datos.gov.co.
6. Bookmarks persistidos.
7. Búsquedas guardadas.
8. Frontend de autenticación y navegación.
9. Frontend de convocatorias, bookmarks y búsquedas.
10. Perfil, hardening y preparación de demo.

## Reglas del proyecto usadas como base

Este documento toma como fuente de reglas el archivo `AGENTS.md` en la raíz del repositorio. Las reglas principales son:

- No escribir código manualmente: todo cambio de código debe ser generado por Hermes/Codex.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No modificar migraciones manualmente.
- Todo endpoint debe tener manejo de errores.
- Todo cambio importante debe actualizar `SOUL.md` o `docs/ai-log.md`.
- Usar conventional commits siempre en inglés; no usar mensajes de commit en español.
- Después de cada fase implementada, Hermes debe revisar `git status`, proponer un commit y pedir aprobación explícita antes de ejecutarlo.

## Qué se construyó hasta ahora

Hasta el momento de creación de este documento se construyó la base documental del proceso AI-First:

1. `AGENTS.md`
   - Define el contexto del proyecto.
   - Registra las reglas AI-First.
   - Define stack, arquitectura, seguridad, base de datos y convención de commits.

2. `SOUL.md`
   - Documenta el proceso del proyecto como entregable del reto.
   - Distingue explícitamente este archivo del `SOUL.md` global de Hermes.
   - Registra decisiones, trade-offs, bloqueos, soluciones y mejoras futuras.

3. Workflow de commits
   - Se definió un flujo obligatorio para cerrar fases: revisar `git status`, listar archivos modificados, resumir cambios, proponer un mensaje de commit en inglés y preguntar “¿Apruebas este commit?” antes de ejecutar cualquier commit.
   - El flujo prohíbe hacer push y evita pedir aprobación archivo por archivo.

4. Fase 0 — Planificación y trazabilidad / Plan técnico del portal
   - Se creó el plan técnico de implementación con arquitectura final, estructura de carpetas, modelo de datos, endpoints REST, pantallas, fases, criterios de aceptación y estrategia de commits por fase.
   - El plan quedó guardado en `.hermes/plans/2026-06-25_110644-portal-convocatorias-plan-tecnico.md`.
   - Esta fase no implementó código de aplicación; dejó trazabilidad documental, reglas de trabajo y el flujo de commits aprobado para ejecutar las fases posteriores.

5. Ejecución local con Docker
   - Se ajustó el plan técnico para levantar el proyecto con Docker Compose sin instalar Node.js ni PostgreSQL directamente en WSL.
   - Se documentó la futura creación de `docker-compose.yml`, `Dockerfile.dev`, `.dockerignore`, volumen de `node_modules`, servicio `app`, servicio `db`, `DATABASE_URL` con host `db` y comandos de operación local.
   - Se creó `README.md` con la estrategia de ejecución local planificada.

6. Fase 1 — Bootstrap Next.js y entorno Docker
   - Se determinó que la última fase completada y commiteada era la Fase 0: planificación y trazabilidad.
   - Se continuó únicamente con la siguiente fase pendiente: Fase 1 — Bootstrap del proyecto Next.js y calidad base.
   - Se creó la base de Next.js con TypeScript, scripts `dev`, `lint`, `build` y `start`, estructura `app/`, estilos globales y pantalla inicial.
   - Se creó la infraestructura de desarrollo local con `docker-compose.yml`, `Dockerfile.dev`, `.dockerignore`, `.env.example`, volumen para `node_modules` y servicio PostgreSQL interno `db:5432`.
   - Se creó `docs/ai-log.md` para registrar el avance AI-First por fases.
   - Se resolvió el bloqueo de `docker compose config` creando un `.env` local de desarrollo no versionado y confirmando que `.env` está ignorado por Git.
   - Se corrigieron bloqueos posteriores de Docker: builds reproducibles con `package-lock.json` + `npm ci`, instalación de `openssl` para Prisma en Alpine y eliminación de `NODE_ENV: development` para permitir `next build`.
   - Se validó Docker con flujo no bloqueante: `docker compose up -d --build`, `docker compose ps`, lint, build y `docker compose down`.

7. Fase 2 — Prisma y modelo de datos PostgreSQL
   - Se continuó con la siguiente fase pendiente del plan técnico después de resolver Docker.
   - Se creó `prisma/schema.prisma` para PostgreSQL con modelos `User`, `Bookmark` y `SavedSearch`.
   - Se generó mediante Prisma la migración inicial `20260625174451_init_data_model` sin editar migraciones manualmente.
   - Se creó `lib/db/prisma.ts` como singleton de Prisma Client para el runtime de Next.js.
   - Se verificó dentro de Docker: `prisma validate`, `prisma migrate dev`, `prisma generate`, `npm run lint` y `npm run build`.

8. Fase 3 — Autenticación JWT con bcrypt y Zod
   - Se implementó autenticación REST con `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`.
   - Se validan inputs con Zod, se hashean passwords con bcrypt y se firma JWT en cookie HTTP-only `SameSite=Strict`.
   - Las respuestas de usuario omiten `passwordHash` y los endpoints manejan errores de validación, credenciales inválidas, duplicados y errores internos.
   - Se agregó Vitest y pruebas TDD para validadores, JWT y rutas de auth; la validación final en Docker pasó con 10 tests, lint y build.
   - Se ejecutó `npm audit --audit-level=high`; quedan vulnerabilidades transitivas en Next.js/eslint-config-next y bcrypt que requieren upgrades mayores y deben tratarse como hardening controlado.

9. Fase 4 — Integración SECOP/datos.gov.co
   - Se implementó la consulta pública de convocatorias desde datos.gov.co usando la API SODA del dataset SECOP II `p6dx-8zbt`.
   - Se crearon validadores Zod para filtros de convocatorias, tipos y mapper de normalización en `lib/secop/`, y endpoints REST `GET /api/convocatorias` y `GET /api/convocatorias/[externalId]`.
   - Se validan `q`, `entity`, `status`, fechas, paginación e identificadores externos antes de consultar el upstream.
   - Los endpoints manejan errores de validación, errores controlados del upstream SECOP, registros no encontrados y errores internos sin exponer stack traces al cliente.
   - Se verificó dentro de Docker: `npm test` con 19 tests, `npm run lint`, `npm run build` y una consulta local real a `/api/convocatorias?limit=1&q=DANE` con respuesta `200`.

10. Fase 5 — Bookmarks persistidos
   - Se implementaron favoritos persistidos por usuario con `GET /api/bookmarks`, `POST /api/bookmarks` y `DELETE /api/bookmarks/[externalId]`.
   - Los endpoints reutilizan la autenticación JWT/cookie existente, validan inputs con Zod y usan Prisma para listar, crear y borrar favoritos por `userId`.
   - La creación usa `upsert` para respetar el índice único `userId + externalId + source` y evitar duplicados.
   - El borrado es idempotente y restringido al usuario autenticado; las respuestas no exponen `userId`.
   - Se verificó dentro de Docker: `npm test` con 25 tests, `npm run lint` y `npm run build`.

11. Fase 6 — Búsquedas guardadas
   - Se implementó CRUD REST protegido para búsquedas guardadas con `GET /api/saved-searches`, `POST /api/saved-searches`, `PATCH /api/saved-searches/[id]` y `DELETE /api/saved-searches/[id]`.
   - Los endpoints reutilizan JWT/cookie, validan inputs con Zod y usan Prisma sobre el modelo `SavedSearch` existente.
   - Cada operación deriva `userId` desde la sesión autenticada; no se acepta ownership desde el cliente.
   - Las actualizaciones y borrados se restringen por `id + userId`, evitando acceso a búsquedas de otros usuarios.
   - Se preservan filtros JSON para poder reabrir `/convocatorias` con los criterios guardados.
   - Se verificó dentro de Docker: `npm test` con 32 tests, `npm run lint` y `npm run build`.

12. Fase 7 — Frontend de autenticación y navegación
   - Se creó navegación global con enlaces a landing, convocatorias, favoritos, búsquedas guardadas, perfil, login, registro y logout.
   - Se implementaron páginas públicas `/auth/login` y `/auth/register` con formularios cliente conectados a los endpoints REST de autenticación existentes.
   - La landing se actualizó con llamadas a la acción para explorar convocatorias, crear cuenta e iniciar sesión.
   - Se agregaron páginas privadas placeholder para `/convocatorias`, `/bookmarks`, `/saved-searches` y `/profile` para preparar la experiencia UI posterior.
   - Se implementó middleware de protección frontend para redirigir rutas privadas sin cookie `auth_token` a `/auth/login?next=...`.
   - Se verificó dentro de Docker: `npm test` con 38 tests, `npm run lint` y `npm run build` sin warnings.

13. Fase 8 — Frontend de convocatorias, bookmarks y búsquedas
   - Se implementó la experiencia principal de browse en `/convocatorias` con filtros, paginación simple, estados de carga/vacío/error y acciones para guardar favoritos y búsquedas.
   - Se creó detalle de convocatoria en `/convocatorias/[externalId]`, consultando el endpoint REST de SECOP y permitiendo guardar la convocatoria como favorito.
   - Se reemplazaron placeholders de `/bookmarks` y `/saved-searches` por gestores cliente que listan recursos propios, enlazan a detalle/ejecución y permiten eliminar registros.
   - Se agregaron componentes reutilizables para tarjetas, detalle y managers de recursos persistidos.
   - Se añadieron estilos para filtros, grillas, tarjetas, metadata y detalle.
   - Se verificó dentro de Docker: `npm test` con 42 tests, `npm run lint` y `npm run build`.

14. Fase 9 — Perfil, hardening y demo
   - Se implementó `GET /api/profile` para exponer usuario seguro y conteos de actividad del usuario autenticado.
   - Se implementó `PATCH /api/profile` para editar nombre/email y cambiar contraseña validando la contraseña actual y rehasheando con bcrypt.
   - Se agregó pantalla de perfil con edición de cuenta, cambio de contraseña y métricas de favoritos/búsquedas guardadas.
   - Se completó `README.md` con comandos de setup, endpoints, flujo demo end-to-end y checklist de seguridad básica.
   - Se revisó que `.env` no esté versionado y que no haya secretos reales en el árbol versionable; los hallazgos fueron placeholders o secretos sintéticos de tests.
   - Se verificó dentro de Docker: `npm test` con 51 tests, `npm run lint` y `npm run build`.
   - `npm audit --audit-level=high` conserva vulnerabilidades transitivas que requieren upgrades breaking (`next`, `eslint-config-next`, `bcrypt`); se documenta como riesgo pendiente para una decisión explícita de upgrade.

## Cómo se usó Hermes

Hermes se utilizó como agente de desarrollo dentro del repositorio para:

- Crear documentación del proyecto directamente en la raíz del repo.
- Verificar el estado de Git antes de editar.
- Revisar la existencia de archivos relevantes como `AGENTS.md`, `SOUL.md`, `package.json` y configuración de Prisma.
- Escribir archivos mediante herramientas del agente, no mediante edición manual.
- Verificar el contenido creado leyendo el archivo después de escribirlo.

## Skills/prompts usados

Skills y bundle usados durante la planificación:

- Bundle `reto-dev`, definido en `/home/edog/.hermes/skill-bundles/reto-dev.yaml`.
- `plan`, para crear un plan accionable sin implementar código.
- `codex`, como parte del bundle para futuras fases de implementación asistida.
- `test-driven-development`, para definir la estrategia TDD por fase.
- `requesting-code-review`, para considerar revisión antes de commits relevantes.
- `github-pr-workflow` y `git-workflow`, para alinear la estrategia de commits y PRs sin hacer push desde Hermes.
- `database-migrations`, para respetar el uso de Prisma y no editar migraciones manualmente.

Prompts relevantes usados por el usuario:

- Crear `AGENTS.md` con reglas del proyecto para el Reto AI-First.
- Crear `SOUL.md` como entregable del reto, aclarando que no debe confundirse con el `SOUL.md` global de Hermes.
- Crear el plan técnico del Portal de Convocatorias Públicas usando el bundle `reto-dev`, sin implementar código todavía.
- Ajustar el plan técnico para ejecución local con Docker Compose antes de implementar código.
- Determinar la última fase completada y continuar únicamente con la siguiente fase pendiente del plan técnico.

## Decisiones tomadas

- Separar reglas operativas en `AGENTS.md` y documentación de proceso en `SOUL.md`.
- No incluir personalidad del agente ni instrucciones globales en este archivo.
- Documentar el estado real observado del repositorio, sin inventar funcionalidades todavía no implementadas.
- Marcar el enlace del repositorio como pendiente porque no hay URL remota configurada actualmente en Git.
- Mantener este archivo como documentación viva, actualizable durante el desarrollo.
- Formalizar un workflow de commits con aprobación humana explícita antes de cada commit, manteniendo trazabilidad sin hacer push desde Hermes.
- Aclarar que todos los mensajes de commit deben estar en inglés para evitar ambigüedad en futuras fases o mantenimientos.
- Planificar una implementación incremental por fases para priorizar el flujo end-to-end exigido por el reto: auth, browse de convocatorias desde datos.gov.co y bookmarks persistidos.
- Usar PostgreSQL como base de datos objetivo del proyecto, aunque el reto permitía PostgreSQL o SQLite, porque `AGENTS.md` fija PostgreSQL como stack del repositorio.
- Usar Docker Compose como forma oficial de desarrollo local para evitar instalar Node.js y PostgreSQL directamente en WSL.
- Definir que Prisma dentro del contenedor `app` debe conectarse a PostgreSQL usando `db:5432`, no `localhost`.
- No guardar `.env` ni credenciales reales; `docker-compose.yml` requiere variables locales desde `.env` para `DATABASE_URL` y `POSTGRES_PASSWORD`.

## Trade-offs

- Se documentó la arquitectura objetivo aunque todavía no existe implementación de Next.js, Prisma ni PostgreSQL en el árbol del repositorio observado.
- Se priorizó claridad del proceso AI-First sobre detalle técnico de implementación, porque el proyecto aún está en fase inicial.
- Se evitó declarar features como completadas para mantener trazabilidad honesta del avance.
- Se decidió no implementar código durante la fase de planificación para mantener separación entre diseño técnico y ejecución.
- Se priorizó un monolito Next.js con API REST interna sobre una separación frontend/backend independiente para reducir complejidad y llegar al demo end-to-end dentro del tiempo del reto.
- Se decidió documentar la infraestructura Docker antes de crearla, manteniendo la solicitud de no implementar código todavía.
- Se aceptó que el entorno local dependa de Docker Compose para simplificar setup a cambio de requerir Docker instalado.
- Se evitó instalar dependencias Node directamente en WSL; la instalación queda encapsulada en `Dockerfile.dev`.

## Bloqueos encontrados

- No se encontró `package.json`, configuración de Prisma ni estructura `app/api` en el repositorio al momento de crear este documento.
- No se encontró URL remota configurada para enlazar el repositorio.
- No existían commits todavía en la rama `main`.
- La ruta solicitada `docs/context/reto-ai-first-fase1.pdf` no existe; el PDF disponible y leído fue `docs/context/2a-reto-ai-first-fase1.pdf`.
- El bloqueo vigente de Docker cambió durante la implementación: la integración Docker/WSL ya estaba disponible, pero `docker compose config` fallaba porque faltaba un `.env` local con `DATABASE_URL` y `POSTGRES_PASSWORD`.
- Durante la validación aparecieron dos bloqueos adicionales ya resueltos: `npm install` dentro de Docker tardaba demasiado sin lockfile reproducible, y Prisma en Alpine necesitaba OpenSSL para ejecutar migraciones.
- `npm audit --audit-level=high` reporta vulnerabilidades que no se corrigen con `npm audit fix` sin cambios mayores; resolverlas requiere evaluar upgrades breaking de Next.js, eslint-config-next y bcrypt.

## Soluciones aplicadas

- Crear primero documentación base (`AGENTS.md` y `SOUL.md`) para fijar reglas y trazabilidad antes de implementar código.
- Registrar explícitamente los pendientes y el estado real del repo.
- Usar `AGENTS.md` como fuente normativa para las reglas del proyecto.
- Crear un plan técnico versionable antes de iniciar la implementación.
- Registrar en este documento la ruta real del PDF usado como contexto del reto.
- Agregar sección “Ejecución local con Docker” al plan técnico.
- Crear `README.md` con comandos previstos de Docker Compose, Prisma, lint y build.
- Crear los archivos de bootstrap de Next.js y Docker de Fase 1.
- Crear un `.env` local de desarrollo no versionado para satisfacer `docker compose config` sin commitear secretos.
- Confirmar que `.env` está protegido por `.gitignore`.
- Usar `package-lock.json` y `npm ci --no-audit --no-fund` en Docker para builds reproducibles.
- Instalar `openssl` en la imagen de desarrollo para que Prisma funcione en Alpine.
- Remover `NODE_ENV: development` de Compose para que `next build` use el entorno correcto.
- Validar Docker con flujo no bloqueante y cerrar contenedores con `docker compose down`.
- Configurar Prisma, generar la migración inicial y validar el modelo de datos PostgreSQL.
- Implementar autenticación con JWT, bcrypt, Zod y cookies HTTP-only.
- Agregar pruebas automatizadas de autenticación con Vitest y ejecutarlas dentro de Docker.

## Mejoras futuras

- Inicializar el proyecto Next.js con TypeScript.
- Configurar Prisma y PostgreSQL.
- Crear estructura `app/api` para endpoints REST.
- Implementar autenticación con JWT y hashing con `bcrypt`.
- Agregar validación con Zod en todos los endpoints.
- Diseñar modelos iniciales de Prisma para usuarios, convocatorias y entidades relacionadas.
- Agregar manejo de errores consistente en la API.
- Crear `docs/ai-log.md` para registrar decisiones y prompts de desarrollo posteriores.
- Configurar linting, formatting y pruebas.
- Agregar README con instrucciones de instalación, variables de entorno y ejecución local.
- Configurar la URL remota del repositorio y actualizar este documento con el enlace real.

## Convención de commits

El proyecto debe usar conventional commits en español o inglés.

Ejemplos:

- `feat(auth): add JWT login`
- `docs(ai): crear SOUL del reto AI-First`
- `fix(api): manejar errores de validación`

## Enlace al repositorio

Pendiente: no hay remoto Git configurado actualmente.

Cuando exista, actualizar esta sección con la URL pública o privada correspondiente.
