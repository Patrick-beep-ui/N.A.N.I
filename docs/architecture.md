# Arquitectura actual

N.A.N.I. es una sola aplicación Next.js en la raíz del repositorio. No hay apps independientes, paquetes compartidos, interfaces de adaptadores sin implementación ni worker vacío.

## Flujo implementado

1. La interfaz crea una sesión local y selecciona el proyecto.
2. `services/memory.ts` identifica al propietario, filtra por proyecto/dispositivo y vigencia, y recupera contexto real de PostgreSQL/Supabase mediante Prisma.
3. Cada mensaje consulta contexto operativo de Engram con el proyecto explícito.
4. `integrations/opencode.ts` crea/reutiliza la sesión del runtime y solicita el modelo configurado. Las herramientas pertenecen al ciclo agéntico de OpenCode.
5. La UI consulta permisos de esa sesión y permite aprobar una vez, denegar o cancelar.
6. El resultado reportado por el runtime se registra en Engram; el chat informa por separado si no se confirmó la escritura.

`services/chat.ts` coordina ese recorrido. Los SDK y protocolos se mantienen en `integrations/`; Prisma y la configuración en `lib/`. Los Route Handlers validan solicitudes y traducen resultados HTTP. No se agrega una capa que solo delega otra llamada.

## Límites

- Sesiones locales en memoria, sin colas ni workers de fondo.
- Progreso por etapas y respuesta final, sin streaming de tokens.
- Solo acceso local; no hay login ni acceso móvil.
- La DB conserva el esquema y contenido anteriores.
- El aprendizaje personal automático en Supabase todavía no está conectado.
- El tiempo y permisos de las herramientas los aplica OpenCode; no se promete sandbox de la máquina.

El roadmap es una evolución a partir de este recorrido funcional, no un requisito para crear infraestructura por adelantado.
