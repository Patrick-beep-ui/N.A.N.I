# N.A.N.I.

N.A.N.I. es una engine que funciona como asistente virtual y segundo cerebro. Combina memoria personal en Supabase, memoria operativa en Engram, ejecución agéntica mediante OpenCode y razonamiento con el modelo configurado inicialmente como Big Pickle.

Esta primera versión es intencionalmente pequeña. Su objetivo es demostrar un ciclo completo sobre un proyecto real:

1. Crear una sesión y cargar un snapshot personal versionado desde Supabase.
2. Recibir una tarea y recuperar contexto operativo desde Engram.
3. Ejecutar mediante OpenCode con el modelo y herramientas autorizadas.
4. Registrar acciones y resultados en la memoria operativa.
5. Detectar aprendizaje personal y actualizar Supabase con evidencia y alcance.

## Estructura

```text
.
├── apps/
│   ├── web/                 # Next.js: UI y API local
│   └── worker/              # Proceso persistente para runs y sincronización
├── packages/
│   ├── contracts/           # Esquemas y tipos compartidos
│   └── engine/              # Servicios, puertos y adaptadores
├── prisma/                  # Modelo de memoria personal
├── AGENTS.md
├── knowledge/
│   ├── profile.md
│   ├── working-style.md
│   └── current-context.md
├── standards/
│   ├── ai-architecture.md
│   ├── backend-architecture.md
│   ├── frontend-and-design.md
│   └── quality-checklist.md
├── examples/
│   └── README.md
└── docs/
    ├── architecture.md
    ├── memory-policy.md
    └── roadmap.md
```

## Estado actual

La primera entrega implementa la composición básica y el arranque de sesión con un bootstrap real de PostgreSQL/Supabase. Los puertos para OpenCode y Engram ya están definidos, pero sus adaptadores todavía no están conectados.

## Ejecutar localmente

Requisitos: Node.js 24+, pnpm 11+ y un proyecto de Supabase.

```powershell
Copy-Item .env.example .env
pnpm install
pnpm prisma:generate
pnpm db:push
pnpm dev
```

Completá primero `DATABASE_URL`, `DIRECT_URL` y `NANI_OWNER_USER_ID`. La guía detallada está en [docs/setup.md](docs/setup.md).

Antes de usar información personal sensible con un modelo gratuito, revisá sus condiciones de tratamiento de datos. Los documentos de este repositorio deben contener solo lo que estés dispuesto a enviar al modelo configurado.

## Verificación

```powershell
pnpm check
pnpm build
```

## Próximo hito

Implementar `OpenCodeRuntime` y `EngramAdapter`, persistir runs/eventos locales y completar el primer recorrido real descrito en [docs/roadmap.md](docs/roadmap.md).

