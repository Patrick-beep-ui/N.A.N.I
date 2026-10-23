# Configuración local de una sola aplicación

## Un archivo .env

Desde la raíz, copiar `.env.example` a `.env` y completar `DATABASE_URL` con la conexión Session pooler (5432) exacta de Supabase. Mantener TLS; usar la contraseña de PostgreSQL. `DIRECT_URL` puede quedar vacío y Prisma CLI utilizará `DATABASE_URL`.

Next.js y Prisma CLI ahora arrancan desde la misma raíz. Los archivos antiguos `apps/web/.env.local` no se leen. Si ya tenías variables en la terminal o un `.env.local` en la raíz, recordá que pueden prevalecer sobre `.env`; no mantengas copias divergentes. Reiniciar `pnpm dev` después de editar configuración.

`NANI_OWNER_USER_ID` es opcional: si hay exactamente un perfil, se selecciona del lado del servidor. Con varios perfiles se exige el UUID explícito y no se acepta desde el navegador. La identidad inicial del proyecto existente es local; no hay login de Supabase Auth implementado.

## Instalar e iniciar

```powershell
pnpm install
pnpm dev
```

La aplicación usa http://127.0.0.1:3000. El servidor escucha solamente en loopback y la API rechaza Host y Origin externos. Para llamadas POST desde una herramienta local, incluir un Origin que coincida con el Host, por ejemplo `Origin: http://127.0.0.1:3000`. No abrir este servicio sin implementar autenticación de red.

La DB existente ya está configurada. No se necesita ejecutar `db:push`; el esquema solo cambió la ubicación del cliente generado a `src/generated/prisma`. Historial y datos permanecen intactos.

## OpenCode

En otra terminal, con tus proveedores y MCP habituales ya configurados:

```powershell
opencode serve --hostname 127.0.0.1 --port 4096
```

`OPENCODE_BASE_URL` usa esa dirección. `OPENCODE_MODEL` debe ser el identificador real disponible; por defecto `opencode/big-pickle`. Se solicita ese modelo por SDK y no hay fallback automático. Si configurás Basic Auth en OpenCode, completar `OPENCODE_SERVER_USERNAME` y `OPENCODE_SERVER_PASSWORD` también en `.env`.

La integración utiliza las rutas del servidor OpenCode 1 (contrato del SDK 1.19.4). El import del SDK `/v2` indica el cliente con argumentos planos, no una migración al servidor OpenCode 2. Si tu instalación ofrece únicamente la API de servidor 2, esta entrega no declara compatibilidad con ella.

La sesión permite lecturas de proyecto, bloquea lectura directa de `.env` y solicita aprobación para las demás herramientas. La interfaz muestra patrones y permite aprobar una vez o denegar. Un shell autorizado conserva los permisos del usuario del sistema; esto no constituye aislamiento fuerte. El modelo no recibe la configuración de conexión.

## Engram

```powershell
engram serve
```

`ENGRAM_BASE_URL` usa http://127.0.0.1:7437 por defecto. Si habilitaste `ENGRAM_HTTP_TOKEN` en ese servicio, configurar el mismo valor aquí. Se utilizan sus endpoints HTTP `/sessions`, `/search` y `/observations`, con proyecto explícito.

Cada turno renueva/registra su sesión y busca hasta cinco antecedentes. Un fallo de Engram no se presenta como guardado exitoso. Las escrituras no se reintentan automáticamente después de una confirmación incierta. El campo `operation_id` se envía para versiones compatibles; no se asume que versiones antiguas proporcionen idempotencia.

## Alcance actual

El chat devuelve progreso por etapas y la respuesta final; todavía no transmite cada token del modelo. Permite una tarea por sesión y un máximo de tres minutos por turno, con cancelación explícita. Las tareas dependen del proceso local y la conexión; no se promete continuación después de cerrarlo. Reiniciar la app invalida sus sesiones locales, sin borrar las de los servicios externos.

El contexto de Supabase se carga al iniciar sesión, incluyendo memorias personales y del proyecto/dispositivo seleccionado, solo si están activas y vigentes. Al modelo se envían únicamente memorias PUBLIC o INTERNAL con autorización de exposición al modelo exacto. El resumen de perfil sin clasificación no se envía automáticamente. Iniciar sesión nueva recarga cambios de Supabase.

Engram guarda la solicitud y un resumen del resultado informado por OpenCode. No equivale a una auditoría completa de comandos ni a una validación independiente de lo que el modelo afirma. No hay todavía un flujo automático de nuevas memorias personales en Supabase.

## Validar

`pnpm check` genera Prisma, tipos de rutas, comprueba TypeScript y ejecuta pruebas de filtros de memoria, permisos locales y contratos HTTP de los adaptadores. `pnpm build` comprueba la compilación de producción. `/api/v1/health` comprueba la conexión DB y alcance de servicios locales; HTTP reachable no prueba que un modelo esté autenticado o disponible.
