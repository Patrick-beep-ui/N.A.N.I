# Contexto actual

Actualizado: 2026-10-23

- El usuario pidió simplificar la implementación: una sola aplicación, sin workspaces funcionales separados ni capas vacías.
- Stack: Next.js App Router, TypeScript, Prisma y Supabase.
- La DB existente conserva perfil, recuerdos y revisiones; esta refactorización no aplica migraciones ni modifica datos.
- La aplicación integra un chat local con OpenCode y Engram mediante sus APIs.
- La comprobación contra los procesos reales de la PC se realiza al usar la rama; los contratos se prueban aquí con servicios locales de prueba.
- Pendiente: aprendizaje personal automático en Supabase. La interfaz no debe afirmar que ya lo ejecuta.
