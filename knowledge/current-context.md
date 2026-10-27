# Contexto actual del piloto

- Objetivo: que NANI use contexto personal para conversar, decidir y sugerir naturalmente, sin requerir que Patrick pida consultar su memoria.
- Una sola aplicación Next.js/Prisma; OpenCode 1 y Engram locales. No hay nuevos workspaces, servidores de memoria independientes ni migración de esquema en esta entrega.
- Instrucciones permanentes: `.opencode/nani.md`; contexto siempre cargado y skills de aprendizaje/ejecución disponibles bajo `.opencode/skills/`.
- Bootstrap acotado, actualización y búsqueda personal por turno, herramientas nativas para ampliar resultados y consultar fuentes.
- Aprendizaje: propuestas en memory_changes; confirmación/rechazo desde UI; confirmación transaccional con historial, evidencia y revisión de contexto. No escribir hechos activos solo por inferencia del modelo.
- La evaluación de personalización y ejecución real se hace en Windows con sus servicios: `docs/pilot.md`. Las pruebas automatizadas no sustituyen esa evaluación.
- Pendientes: olvido completo con derivados, búsqueda semántica, voz y ejecución en segundo plano. Solo incorporarlos si el piloto lo requiere.
