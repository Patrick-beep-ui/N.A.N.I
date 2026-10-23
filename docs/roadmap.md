# Roadmap

## Fase 0 — Conocimiento explícito

Objetivo: disponer de instrucciones y estándares revisables.

- [x] Crear estructura inicial.
- [x] Separar perfil, estilo, contexto, estándares y ejemplos.
- [x] Definir política inicial de memoria.
- [ ] Elegir un proyecto real como referencia.
- [ ] Sustituir borradores por reglas confirmadas con evidencia.

## Fase 1 — OpenCode + Engram

Objetivo: demostrar que N.A.N.I. aplica criterios y mantiene continuidad.

- [ ] Verificar instalación y entorno de OpenCode.
- [ ] Verificar conexión MCP con Engram.
- [ ] Configurar instrucciones del proyecto.
- [ ] Ejecutar las pruebas de aceptación.

### Pruebas de aceptación

1. **Aplicación:** pedir una implementación pequeña y comprobar que cita y aplica los estándares relevantes.
2. **Corrección:** corregir una decisión, registrar fuente y alcance, y comprobar que deja de usar la versión anterior.
3. **Continuidad:** iniciar otra sesión y comprobar que recupera la decisión correcta sin cargar recuerdos irrelevantes.

La fase termina cuando las tres pruebas se repiten de forma confiable sobre un proyecto real.

## Fase 2 — Servicio local

Objetivo: controlar la preparación de contexto y la ejecución desde una capa propia.

- [ ] Crear servicio TypeScript modular.
- [ ] Definir `AgentRuntimeInterface`, `MemoryRepositoryInterface` y `ToolRegistry`.
- [ ] Implementar `OpenCodeRuntime`.
- [ ] Añadir streaming, cancelación, auditoría y confirmaciones.
- [ ] Medir latencia y calidad de recuperación.

## Fase 3 — Supabase e interfaz

Objetivo: compartir conocimiento y estado entre sesiones y dispositivos.

- [ ] Diseñar esquema con procedencia, alcance, estado y sensibilidad.
- [ ] Implementar búsqueda híbrida y políticas de acceso.
- [ ] Crear interfaz React de chat y trazabilidad.
- [ ] Separar servicio compartido de ejecutor local.
- [ ] Incorporar corrección y olvido de memorias.

## Fase 4 — Herramientas personales

Objetivo: integrar capacidades concretas con permisos verificables.

- [ ] Archivos y repositorios autorizados.
- [ ] Lectura de correo y calendario.
- [ ] Borradores y creación de eventos con confirmación.
- [ ] Cola autenticada de tareas para dispositivos.
- [ ] Investigar WhatsApp según el caso de uso exacto.

## Fase 5 — Voz y presencia multidispositivo

Objetivo: añadir interacción natural sin comprometer privacidad ni fiabilidad.

- [ ] Evaluar transcripción local en español.
- [ ] Evaluar síntesis local y alojada.
- [ ] Añadir audio después de validar la experiencia por texto.
- [ ] Evaluar activación por voz solo con controles claros de privacidad.

