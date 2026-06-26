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

## Fase 3 — Autenticación JWT con bcrypt y Zod

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 3 — Autenticación JWT con bcrypt y Zod.
- Se aplicó TDD: primero se agregaron pruebas para validadores, helpers JWT y rutas de auth; la primera ejecución de `npm test` falló por módulos de auth inexistentes, confirmando RED.
- Se agregó Vitest como infraestructura de pruebas y el script `npm test`.
- Se crearon validadores Zod para registro y login, normalizando emails y rechazando passwords débiles.
- Se crearon helpers de bcrypt, JWT y sesión/cookies HTTP-only.
- Se implementaron `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me` con manejo de errores y sin exponer `passwordHash`.
- Se marcaron las rutas de auth como dinámicas para evitar prerender estático durante `next build`.
- Verificación Docker realizada: `npm test` pasó con 10 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.
- Revisión de seguridad: `npm audit --audit-level=high` reporta vulnerabilidades transitivas pendientes en Next.js/eslint-config-next y bcrypt que requieren upgrades mayores (`next@16`, `eslint-config-next@16`, `bcrypt@6`) y se dejan como hardening pendiente para no mezclar cambios breaking sin una fase dedicada.

## Fase 4 — Integración SECOP/datos.gov.co

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 4 — Integración SECOP/datos.gov.co.
- Se aplicó TDD agregando pruebas RED para validación de filtros, mapper de registros SECOP, cliente SODA y rutas REST de convocatorias.
- Se creó `lib/validators/convocatorias.ts` para validar `q`, `entity`, `status`, fechas ISO, `limit`, `offset` e identificadores externos.
- Se creó la capa `lib/secop/` con tipos, mapper y cliente para consultar `https://www.datos.gov.co/resource/p6dx-8zbt.json` sin API key, usando parámetros SODA seguros y normalizando el shape externo a un DTO estable.
- Se implementaron `GET /api/convocatorias` y `GET /api/convocatorias/[externalId]` con manejo de errores de validación, upstream SECOP no disponible, no encontrado y errores internos.
- Se inspeccionaron campos reales del dataset SECOP II (`id_del_proceso`, `entidad`, `estado_resumen`, `fecha_de_publicacion_del`, `urlproceso`, entre otros) antes de mapear filtros y respuesta.
- Verificación Docker realizada: `npm test` pasó con 19 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.
- Verificación en vivo realizada contra la API local: `GET http://localhost:3000/api/convocatorias?limit=1&q=DANE` respondió `200` con una convocatoria normalizada desde datos.gov.co.

## Fase 5 — Bookmarks persistidos

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 5 — Bookmarks persistidos.
- Se aplicó TDD agregando pruebas RED para validadores y rutas protegidas de bookmarks antes de crear la implementación.
- Se creó `lib/validators/bookmarks.ts` para validar payloads de favoritos, fuente, URL opcional, `rawData` e identificadores de ruta.
- Se implementaron `GET /api/bookmarks`, `POST /api/bookmarks` y `DELETE /api/bookmarks/[externalId]` usando JWT/cookie existente, Prisma y ownership por `userId`.
- `POST /api/bookmarks` usa `upsert` sobre el índice único `userId + externalId + source` para evitar duplicados y devolver el favorito existente cuando corresponde.
- `DELETE /api/bookmarks/[externalId]` es idempotente y borra únicamente el favorito del usuario autenticado con fuente `SECOP_II` por defecto.
- Las respuestas omiten `userId` para no exponer detalles internos de ownership.
- Verificación Docker realizada: `npm test` pasó con 25 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.

## Fase 6 — Búsquedas guardadas

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 6 — Búsquedas guardadas.
- Se aplicó TDD agregando pruebas RED para validadores y CRUD REST protegido de búsquedas guardadas.
- Se creó `lib/validators/saved-searches.ts` para validar nombre, query, entidad, estado, fechas ISO, filtros adicionales y parámetros de ruta.
- Se implementaron `GET /api/saved-searches`, `POST /api/saved-searches`, `PATCH /api/saved-searches/[id]` y `DELETE /api/saved-searches/[id]` con autenticación JWT/cookie y ownership por `userId`.
- Las rutas crean búsquedas asociadas al usuario autenticado, listan solo las propias, actualizan con `updateMany` restringido por `id + userId` y borran de forma idempotente con `deleteMany`.
- Las respuestas convierten fechas a `YYYY-MM-DD`, omiten `userId` y preservan filtros JSON para reabrir `/convocatorias` con los mismos criterios.
- Verificación Docker realizada: `npm test` pasó con 32 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.

## Fase 7 — Frontend de autenticación y navegación

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 7 — Frontend de autenticación y navegación.
- Se aplicó TDD agregando pruebas RED para landing, formularios de autenticación, navegación global y middleware de protección de rutas privadas.
- Se creó navegación global reutilizable en `components/layout/site-nav.tsx`, con enlaces a landing, convocatorias, favoritos, búsquedas guardadas, perfil, login, registro y logout.
- Se crearon formularios cliente para login y registro en `components/auth/auth-form.tsx`, conectados a `POST /api/auth/login` y `POST /api/auth/register`, con redirección a `/convocatorias` tras autenticación exitosa.
- Se agregaron páginas públicas `/auth/login` y `/auth/register` y se mejoró la landing con llamadas a la acción.
- Se agregaron páginas privadas placeholder para `/convocatorias`, `/bookmarks`, `/saved-searches` y `/profile`, preparando la navegación de las siguientes fases.
- Se implementó `middleware.ts` para redirigir usuarios sin cookie `auth_token` desde rutas privadas hacia `/auth/login?next=...`.
- Se evitó importar helpers JWT/Node en middleware para mantener compatibilidad con Edge Runtime y eliminar warnings de build.
- Verificación Docker realizada: `npm test` pasó con 38 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.

## Fase 8 — Frontend de convocatorias, bookmarks y búsquedas

- Se continuó con la siguiente fase pendiente del plan técnico: Fase 8 — Frontend de convocatorias, bookmarks y búsquedas.
- Se aplicó TDD agregando pruebas RED para la experiencia de browse, detalle, favoritos y búsquedas guardadas.
- Se creó `components/convocatorias/convocatorias-browser.tsx` con filtros por texto, entidad, estado y fechas, paginación simple, estados de carga/vacío/error, guardado de favoritos y guardado de búsquedas.
- Se creó `components/convocatorias/convocatoria-card.tsx` para mostrar tarjetas de convocatorias con detalle, fuente SECOP y acción de favorito.
- Se creó `components/convocatorias/convocatoria-detail.tsx` y la ruta `/convocatorias/[externalId]` para consultar detalle por identificador externo y guardarlo como favorito.
- Se reemplazaron placeholders por gestores reales para `/bookmarks` y `/saved-searches`, con listado, ejecución de búsqueda guardada y eliminación idempotente.
- Se agregaron estilos de filtros, tarjetas, grillas, metadata y detalle en `app/globals.css`.
- Verificación Docker realizada: `npm test` pasó con 42 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.

## Fase 9 — Perfil, hardening y demo

- Se continuó con la última fase pendiente del plan técnico: Fase 9 — Perfil, hardening y demo.
- Se aplicó TDD agregando pruebas RED para validadores de perfil, endpoint protegido, pantalla de perfil y documentación del flujo demo.
- Se creó `GET /api/profile` para devolver usuario seguro y conteos de favoritos/búsquedas del usuario autenticado.
- Se creó `PATCH /api/profile` para actualizar nombre/email y cambiar contraseña verificando la contraseña actual antes de rehashear con bcrypt.
- Se agregó `lib/validators/profile.ts` para normalizar email, validar nombre/passwords y exigir cambios explícitos.
- Se reemplazó el placeholder de `/profile` por `components/profile/profile-manager.tsx`, con edición de cuenta, cambio de contraseña y métricas de actividad.
- Se completó `README.md` con setup, endpoints, flujo demo end-to-end y checklist de seguridad básica.
- Revisión de seguridad básica: `.env` no está versionado; `.env.example` sí; no se encontraron secretos reales en el árbol versionable, solo secretos sintéticos de tests/placeholders.
- Verificación Docker realizada: `npm test` pasó con 51 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.
- `npm audit --audit-level=high` sigue reportando vulnerabilidades en Next.js/eslint-config-next/bcrypt transitivas; `npm audit fix --force` propone upgrades breaking y queda documentado para evaluación explícita posterior.

## Ajuste UI — Navegación consciente de autenticación

- Se corrigió la navegación global para mostrar enlaces según presencia de cookie `auth_token`.
- Usuario no autenticado: muestra `Convocatorias`, `Iniciar sesión` y `Crear cuenta`; oculta `Favoritos`, `Búsquedas`, `Perfil` y `Cerrar sesión`.
- Usuario autenticado: muestra `Convocatorias`, `Favoritos`, `Búsquedas`, `Perfil` y `Cerrar sesión`; oculta `Iniciar sesión` y `Crear cuenta`.
- Se agregó prueba TDD para cubrir el branch de navegación basado en `cookies()` y `AUTH_COOKIE_NAME`.
- Verificación Docker realizada: `npm test` pasó con 52 tests, `npm run lint` pasó sin errores y `npm run build` pasó correctamente.

## Ajuste UI — Cambio de contraseña en perfil

- Se corrigió el formulario de cambio de contraseña para conservar la referencia al formulario antes del `await` de `fetch`, evitando el error `Cannot read properties of null (reading 'reset')` cuando la contraseña sí se actualiza correctamente.
- Se agregó prueba de regresión para asegurar que el reset usa la referencia estable del formulario y no `event.currentTarget` después de operaciones asíncronas.

## Ajuste UI — Mensajes de éxito en perfil

- Se agregaron mensajes de estado dedicados para confirmar cuando los datos del perfil se actualizan correctamente y cuando la contraseña se cambia correctamente.
- Los mensajes usan `role="status"` y `aria-live="polite"` para que el feedback sea visible y accesible junto a cada formulario.
- Se agregó prueba de regresión para cubrir los mensajes de éxito del perfil y la contraseña.

## Ajuste UI — CTA de landing según autenticación

- Se ajustó la raíz del portal para leer la cookie de autenticación y ocultar `Iniciar sesión` y `Crear cuenta` cuando el usuario ya está autenticado.
- Para usuarios autenticados, la landing mantiene `Explorar convocatorias` y muestra un acceso directo a `Ir a mi perfil`.
- Se agregó prueba de regresión para cubrir el branch autenticado de la landing.

## Ajuste SECOP — Filtros flexibles por entidad y estado

- Se cambió la consulta SECOP para que los filtros `entity` y `status` usen coincidencia parcial case-insensitive mediante `$where`, en lugar de parámetros de igualdad exacta.
- El filtro de entidad ahora busca coincidencias dentro de `entidad` y el filtro de estado dentro de `estado_resumen`, combinándose con filtros de fecha cuando aplican.
- Se agregaron pruebas de regresión para validar la construcción del `$where` flexible y el escape de literales SoQL.
- Se verificó una consulta en vivo contra datos.gov.co con entidad parcial `dane` y estado parcial `presentación`, recibiendo respuesta `200`.

## Ajuste UI — Aplicación de búsquedas guardadas

- Se corrigió la página de convocatorias para recibir los `searchParams` de la URL y pasarlos como filtros iniciales al navegador de convocatorias.
- Al ejecutar una búsqueda guardada desde `/saved-searches`, los parámetros `q`, `entity`, `status`, `dateFrom` y `dateTo` ahora se aplican al cargar `/convocatorias`.
- Se agregó prueba de regresión para cubrir el flujo de abrir una búsqueda guardada y aplicar sus filtros iniciales.

## Ajuste UI — Limpieza de filtros de búsqueda

- Se agregó el botón `Limpiar filtros` en el formulario de convocatorias para restablecer texto libre, entidad, estado y rango de fechas.
- Los campos del formulario de búsqueda ahora son controlados por estado para que la limpieza actualice inmediatamente los inputs visibles.
- Al limpiar filtros también se reinicia la paginación y se remueve la query string de `/convocatorias` cuando venía desde una búsqueda guardada.
- Se agregó prueba de regresión para cubrir la presencia del botón y el reseteo de filtros.

## Ajuste UI — Layout de filtros de convocatorias

- Se reorganizó el formulario de filtros de convocatorias para separar los campos y las acciones en dos filas: una fila de campos y una fila de botones.
- La fila de campos usa una grilla de cinco columnas en escritorio y se apila en una columna en pantallas pequeñas.
- Se agregó prueba de regresión para cubrir la estructura de filas y estilos del layout.
- Se amplió el ancho útil de la tarjeta de contenido y se aumentó la separación horizontal entre los inputs para mejorar la lectura visual del formulario.
- Se refinó el layout responsive de filtros para evitar solapamientos: grilla con `minmax`, `gap` horizontal/vertical, inputs al 100%, `min-width: 0`, dos columnas en tablet y una columna en móvil.
