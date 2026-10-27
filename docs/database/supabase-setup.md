# Supabase: configuración aplicada

Proyecto: NANI (`prinrtzjhsqmtdskpekl`). Región: us-east-2. PostgreSQL 17.
Configuración aplicada el 23 de octubre de 2026 mediante la integración autorizada por el propietario.

## Estado inicial aplicado el 23 de octubre

Esta sección documenta la configuración inicial, no el número actual de recuerdos. Las importaciones y revisiones posteriores viven en la base y no se exportan a Git. El piloto reutiliza estas tablas sin migración.

La DB estaba vacía. Se creó el esquema de `prisma/schema.prisma` sin modificar el código de la aplicación:
`profiles`, `personal_memories`, `memory_revisions`, `memory_evidence`, `memory_changes`, `devices` y `projects`.

La migración remota de Supabase es `20261023224553_nani_prisma_baseline_with_owner_read_security`.
`applied-baseline.sql` es una copia exacta de su DDL, para revisión y reproducción sobre una DB vacía.
No ejecutar ese archivo otra vez contra este proyecto.

También se creó un perfil local inicial, la entrada del proyecto N.A.N.I. y tres recuerdos con revisión, evidencia y cambio aplicado. El contenido personal no se exporta a este repositorio público.

## Conexión local

1. Copiar `.env.example` a `.env` solo si todavía no existe; conservar la configuración propia.
2. En el dashboard de Supabase, abrir **Connect** y copiar la conexión apropiada:
   - `DATABASE_URL`: conexión de PostgreSQL utilizada por el adaptador Prisma.
   - `DIRECT_URL`: conexión directa para Prisma CLI; si la red no admite IPv6, usar la conexión **Session pooler** exacta del dashboard.
   - Mantener TLS habilitado. No inferir el hostname del pooler ni publicar la contraseña.
3. Obtener el propietario local mediante SQL Editor:

```sql
select user_id, display_name from public.profiles;
```

4. Configurar `NANI_OWNER_USER_ID` con ese UUID solo si hay varios perfiles; con uno es opcional.
5. Ejecutar `pnpm install`, `pnpm prisma:generate` y `pnpm dev`.
6. Abrir la interfaz y comprobar el bootstrap de perfil y memorias.

La lectura SQL equivalente al bootstrap está verificada. La conexión desde la PC y el arranque de Next.js todavía requieren estas variables locales; no se han presentado como verificados.

## Acceso y Auth

- RLS habilitada en las siete tablas.
- `anon` y `PUBLIC` sin permisos sobre estas tablas.
- `authenticated` puede leer solamente filas de su propio `auth.uid()`, incluidas revisiones/evidencia por relación.
- Los roles del navegador no pueden insertar, modificar ni borrar recuerdos.
- Prisma accede desde el servidor. Si usa `postgres`, ese rol omite RLS: se mantienen los filtros de propietario en el repositorio y la aplicación debe permanecer local.
- No hay usuarios en Supabase Auth ni se creó un usuario ficticio editando `auth.users`. El perfil es una identidad local para el modo actual `NANI_OWNER_USER_ID`, no un login ni una sesión autenticada.
- Si se incorpora login, vincular/migrar explícitamente esta identidad al UUID real de Auth. `docs/setup.md` describe el arranque local sin login.
- El endpoint de sesiones usa el propietario de entorno o resuelve el único perfil; no constituye una implementación de login.

## Integridad adicional

Además de lo definido en Prisma, se agregó un índice único parcial para impedir duplicados cuando `scope_ref IS NULL`, y CHECKs para revisiones positivas, intervalos válidos y alcance/referencia coherentes.
Estos objetos SQL deben conservarse cuando se formalicen futuras migraciones Prisma. No restablecer la DB para resolver diferencias de migración.

El historial de Supabase y el historial de Prisma son distintos. El repositorio todavía no utiliza `prisma migrate deploy`: antes de adoptarlo se debe crear y marcar como aplicada una baseline Prisma consistente con la DB existente. No ejecutar un nuevo CREATE TABLE sobre las tablas existentes ni usar reset.

## Verificación ejecutada

- Lectura del perfil y los tres recuerdos activos con sus evidencias.
- Suplantación de claims solo dentro de una transacción de prueba: propietario lee; otro UUID no ve filas.
- Acceso anónimo denegado y escritura desde `authenticated` denegada.
- Transacción de prueba revertida, sin datos de prueba persistentes.
- Security Advisor sin hallazgos.
- Performance Advisor solo señala índices nuevos todavía sin uso; se conservan por sus consultas y relaciones previstas.

No se crearon buckets, Edge Functions, cron jobs, embeddings ni infraestructura adicional.
