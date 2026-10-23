# Roadmap

## Fase 0 — Conocimiento explícito

Objetivo: disponer de instrucciones y estándares revisables.

- [x] Crear estructura inicial.
- [x] Separar perfil, estilo, contexto, estándares y ejemplos.
- [x] Definir política inicial de memoria.
- [ ] Elegir un proyecto real como referencia.
- [ ] Sustituir borradores por reglas confirmadas con evidencia.

## Fase 1 — Contratos, composición y Supabase

Objetivo: crear una engine modular y arrancar sesiones con memoria personal real.

- [x] Crear monorepo Next.js + worker + packages compartidos.
- [x] Definir contratos de sesión, contexto y memoria.
- [x] Definir puertos de runtime, memoria personal y memoria operativa.
- [x] Modelar perfiles, memorias, revisiones, evidencia y cambios en Prisma.
- [x] Implementar bootstrap de sesión desde Supabase/PostgreSQL.
- [x] Exponer UI y `POST /api/v1/sessions` con estado real.
- [ ] Configurar un proyecto Supabase y comprobar el recorrido contra la instancia real.

### Aceptación de la fase

1. La sesión cita una revisión real del perfil cargada desde Supabase.
2. El navegador no puede elegir el propietario de la memoria.
3. Un fallo de configuración o perfil se muestra como fallo; no como contexto cargado.

La fase termina al ejecutar este recorrido contra el proyecto Supabase del usuario.

## Fase 2 — Recorrido agéntico y memoria operativa

Objetivo: completar una tarea real mediante OpenCode y registrar continuidad en Engram.

- [ ] Verificar las versiones instaladas de OpenCode y Engram.
- [ ] Implementar `OpenCodeRuntime`.
- [ ] Implementar `EngramAdapter` con ámbitos canónicos.
- [ ] Persistir runs y eventos antes de depender del streaming.
- [ ] Añadir streaming, cancelación, auditoría y confirmaciones.
- [ ] Ejecutar una mejora pequeña sobre una carpeta autorizada.

## Fase 3 — Aprendizaje persistente

Objetivo: convertir evidencia nueva en revisiones personales trazables.

- [ ] Implementar candidatos estructurados de memoria.
- [ ] Implementar `LearningService` con certeza, alcance y sensibilidad.
- [ ] Crear revisiones transaccionales e idempotentes en Supabase.
- [ ] Mantener inferencias como candidatas y excepciones en su ámbito.
- [ ] Comprobar que otra sesión utiliza el cambio correcto.

## Fase 4 — Confiabilidad e interfaz diaria

Objetivo: hacer el recorrido durable, recuperable y observable.

- [ ] Event store y outbox SQLite local.
- [ ] Reintentos, conflictos de revisión y reconciliación.
- [ ] Panel de actividad, autorizaciones y memoria editable.
- [ ] Olvido con invalidación de caché y operaciones pendientes.
- [ ] Métricas de latencia, consultas, sincronización y duplicados.

## Fase 5 — Conectores, voz y múltiples dispositivos

Objetivo: añadir interacción natural sin comprometer privacidad ni fiabilidad.

- [ ] Evaluar transcripción local en español.
- [ ] Evaluar síntesis local y alojada.
- [ ] Añadir audio después de validar la experiencia por texto.
- [ ] Evaluar activación por voz solo con controles claros de privacidad.
- [ ] Integrar correo y calendario con permisos explícitos.
- [ ] Añadir scheduler y proactividad fuera de sesión.
- [ ] Incorporar ejecutores autenticados en otros dispositivos.

## Aceptación del MVP

Una interacción debe cargar conocimiento personal desde Supabase, ejecutar una tarea real mediante OpenCode/Big Pickle, registrar lo ocurrido en Engram y aplicar un cambio personal cuando exista evidencia válida. Una sesión nueva debe utilizar ese cambio con el alcance correcto.

