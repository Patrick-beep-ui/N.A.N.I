# N.A.N.I.

Una sola aplicación Next.js + TypeScript + Prisma. Supabase conserva el conocimiento personal; OpenCode ejecuta las tareas con Big Pickle; Engram conserva el contexto operativo local.

## Arranque

Node.js 24+ y pnpm 11.3.0. Desde esta misma raíz:

```powershell
Copy-Item .env.example .env
pnpm install
pnpm dev
```

Completá `DATABASE_URL` antes de iniciar una sesión. No hay que copiar `.env` a otra carpeta. `NANI_OWNER_USER_ID` es opcional si hay un único perfil en la DB. Las tablas ya están creadas en el proyecto existente: no ejecutar reset ni db push.

Para conversar y ejecutar tareas, mantené estos servicios locales abiertos en otras terminales:

```powershell
engram serve
opencode serve --hostname 127.0.0.1 --port 4096
```

Big Pickle debe estar disponible en tu instalación de OpenCode. El modelo inicial es `opencode/big-pickle`; no se cambia automáticamente por otro. Abrí http://127.0.0.1:3000, iniciá una sesión, elegí el proyecto y enviá una tarea. Las acciones que requieren permiso se autorizan una vez desde el chat. Podés cancelar la ejecución.

La carpeta operativa se configura con `NANI_WORKING_DIRECTORY`; vacía usa la raíz de N.A.N.I. Cambiarla requiere reiniciar el servidor e iniciar una sesión nueva. Es una carpeta de trabajo, no un sandbox del sistema operativo.

## Estructura

- `src/app`: interfaz y endpoints de Next.js.
- `src/services`: sesión, memoria y coordinación del chat.
- `src/integrations`: clientes reales de OpenCode y Engram.
- `src/lib`: configuración, cliente Prisma, tipos y acceso local.
- `prisma`: esquema existente; no se alteraron las tablas ni los datos.

Existe un solo `package.json`, una sola instalación y un solo proceso de N.A.N.I. `pnpm-workspace.yaml` conserva únicamente las políticas de instalación de pnpm 11 con `packages: []`; no declara subproyectos ni paquetes compartidos.

## Qué está conectado

- Bootstrap real desde Supabase con selección de proyecto/dispositivo y vigencia.
- Detección del único propietario local cuando no se proporciona UUID.
- Chat con sesiones de OpenCode por SDK, modelo explícito, permisos y cancelación.
- Consulta de Engram antes de cada turno y registro del resultado reportado por OpenCode.
- Estado diferenciado cuando una tarea termina pero Engram no confirma el registro.

El piloto busca contexto personal en cada turno y permite profundizar con herramientas nativas. El aprendizaje genera propuestas revisables: confirmar activa una revisión en Supabase, rechazar no crea un recuerdo. No se confunde propuesta con hecho confirmado. Las sesiones de la UI viven en memoria: un reinicio requiere iniciarlas de nuevo; el historial de OpenCode y Engram sigue en sus servicios.

## Verificación

```powershell
pnpm check
pnpm build
pnpm start
```

`dev`, `build` y `check` generan el cliente Prisma automáticamente. Los servidores dev y producción escuchan en loopback. Ver [docs/setup.md](docs/setup.md) para configuración y límites de esta entrega.

## Comportamiento y piloto

Las instrucciones permanentes están en `.opencode/nani.md`; las skills de contexto, aprendizaje y ejecución, en `.opencode/skills/`. Las herramientas consultan Supabase por Prisma sin entregar SQL o credenciales al modelo. El MCP administrativo queda deshabilitado por defecto.

Reiniciar OpenCode desde esta raíz tras instalar los cambios. La carpeta operativa indica el destino de tareas; el runtime mantiene la raíz de NANI para cargar sus herramientas. Ver [comportamiento](docs/behavior.md), [política de memoria](docs/memory-policy.md) y [pruebas del piloto](docs/pilot.md).
