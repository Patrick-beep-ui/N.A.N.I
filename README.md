# N.A.N.I.

N.A.N.I. es el núcleo versionado de un asistente personal digital: conoce el contexto de su usuario, aplica sus estándares de trabajo y conserva decisiones útiles sin mezclar hechos, inferencias y reglas.

Esta primera versión es intencionalmente pequeña. Su objetivo es demostrar un ciclo completo sobre un proyecto real:

1. Recibir una tarea por texto.
2. Recuperar únicamente el contexto relevante.
3. Aplicar estándares explícitos y citar su fuente.
4. Revisar o producir trabajo.
5. Registrar decisiones y correcciones para una sesión futura.

## Estructura

```text
.
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

## Cómo usarlo ahora

Abrí este directorio como proyecto en OpenCode y pedile una tarea concreta, por ejemplo:

> Revisá este proyecto usando mis criterios de arquitectura y calidad. Indicá qué referencias consultaste, separá errores de preferencias y no guardés ninguna inferencia como regla confirmada.

Antes de usar información personal sensible con un modelo gratuito, revisá sus condiciones de tratamiento de datos. Los documentos de este repositorio deben contener solo lo que estés dispuesto a enviar al modelo configurado.

## Próximo hito

Conectar OpenCode y Engram y ejecutar las tres pruebas descritas en [docs/roadmap.md](docs/roadmap.md): aplicación, corrección y continuidad.

