# Configuración local

## Requisitos

- Windows con PowerShell.
- Node.js 24 o posterior.
- pnpm 11 o posterior.
- Un proyecto de Supabase con PostgreSQL accesible.

## 1. Variables de entorno

```powershell
Copy-Item .env.example .env
```

Completar:

- `DATABASE_URL`: conexión usada por la aplicación. Preferir el pooler de transacciones de Supabase.
- `DIRECT_URL`: conexión directa usada por Prisma para cambios de esquema.
- `NANI_OWNER_USER_ID`: UUID del usuario propietario; debe corresponder a Supabase Auth.
- Nombre, idioma y zona horaria del perfil inicial.

Nunca enviar estas credenciales al modelo ni confirmar `.env` en Git.

## 2. Instalar y generar

```powershell
pnpm install
pnpm prisma:generate
```

## 3. Crear el esquema

Durante desarrollo inicial:

```powershell
pnpm db:push
```

Este proyecto no incluye ni ejecuta un seed de base de datos. El perfil y las memorias iniciales deben crearse mediante un flujo de administración autorizado y auditable.

Antes de producción, reemplazar `db:push` por migraciones revisadas y añadir las políticas de autorización/RLS correspondientes. Prisma conecta directamente a PostgreSQL y no hereda automáticamente el JWT de Supabase Auth; cada repositorio debe filtrar por propietario.

## 4. Ejecutar

```powershell
pnpm dev
```

Abrir `http://localhost:3000`. “Iniciar N.A.N.I.” debe mostrar nombre, revisión del contexto, cantidad de memorias vigentes y fuente `loaded`.

El health check está disponible en `GET /api/v1/health`. Un estado `not_connected` para OpenCode, Engram o worker es correcto en esta entrega y no debe presentarse como funcionalidad disponible.

## 5. Verificar

```powershell
pnpm check
pnpm build
```

`pnpm check` valida el esquema Prisma, los tipos de todos los workspaces y las pruebas unitarias de la engine.
