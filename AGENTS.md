# AGENTS.md

## Contexto del proyecto

Este repositorio contiene el Portal de Convocatorias Públicas del Reto AI-First Fase 1.

## Reglas de trabajo AI-First

- No escribir código manualmente: todo cambio de código debe ser generado por Hermes/Codex.
- Todo cambio importante debe actualizar `SOUL.md` o `docs/ai-log.md`.
- No guardar secretos, tokens, credenciales ni archivos `.env` en Git.
- No modificar migraciones manualmente.
- No hacer commits, push ni reescribir historial sin una instrucción explícita del usuario.

## Stack técnico

- Next.js
- TypeScript
- Prisma
- PostgreSQL

## Arquitectura y convenciones

- Usar API REST en `app/api`.
- Usar JWT para autenticación.
- Usar `bcrypt` para password hashing.
- Usar Zod para validar inputs.
- Usar Prisma para acceso a base de datos.
- Todo endpoint debe incluir manejo de errores.

## Base de datos

- Usar Prisma para leer y escribir datos.
- No editar migraciones manualmente; generar cambios mediante las herramientas adecuadas de Prisma.
- Revisar el impacto de cualquier cambio de esquema antes de aplicarlo.

## Seguridad

- Nunca exponer secretos en código, logs, documentación o commits.
- Validar todos los inputs externos con Zod antes de procesarlos.
- Hashear contraseñas con `bcrypt`; nunca almacenar passwords en texto plano.
- Firmar y verificar autenticación con JWT.

## Commits

Usar conventional commits en español o inglés.

Ejemplos:

- `feat(auth): add JWT login`
- `fix(api): manejar errores de validación`
- `docs(ai): actualizar ai-log del reto`

## Workflow de commits

- Después de cada fase implementada, revisar `git status` y proponer un commit.
- Antes de ejecutar cualquier commit, mostrar al usuario:
  - Archivos modificados.
  - Resumen del cambio.
  - Mensaje de commit propuesto en inglés.
- Preguntar exactamente: “¿Apruebas este commit?”
- Solo ejecutar el commit si el usuario responde afirmativamente.
- No pedir aprobación archivo por archivo; pedir aprobación únicamente antes del commit.
- No hacer push.
