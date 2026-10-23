# Contexto actual

Actualizado: 2026-10-23

## Foco

Construir el recorrido central de N.A.N.I.: contexto personal desde Supabase, ejecución agéntica con OpenCode/Big Pickle, continuidad operativa en Engram y aprendizaje persistente.

## Estado

- Base documental y especificación v1.0: disponibles.
- Monorepo Next.js, worker, contracts y engine: inicializado.
- Modelo Prisma de memoria personal: implementado y validado.
- Bootstrap de sesión desde Supabase/PostgreSQL: implementado; falta configurarlo contra una instancia real.
- OpenCode: puerto definido; instalación, modelo y adaptador pendientes de verificar.
- Engram: puerto definido; transporte y adaptador pendientes de verificar.
- Worker: proceso base creado; runs, eventos y outbox pendientes.
- Proyecto de referencia: pendiente de seleccionar.
- Voz e integraciones personales: fuera del primer hito.

## Próximas decisiones

1. Crear o seleccionar el proyecto Supabase y el usuario propietario.
2. Configurar `DATABASE_URL`, `DIRECT_URL` y `NANI_OWNER_USER_ID`.
3. Verificar versiones y transporte real de OpenCode y Engram en Windows.
4. Resolver el identificador disponible de Big Pickle sin habilitar fallback pago.
5. Definir las primeras carpetas y herramientas autorizadas.

## Próxima prueba

Crear el perfil inicial en Supabase y comprobar que `POST /api/v1/sessions` devuelve el snapshot, su revisión y el estado `loaded` sin aceptar identidad desde el navegador.

