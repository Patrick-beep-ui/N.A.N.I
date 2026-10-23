# Arquitectura de N.A.N.I.

## Alcance de la primera versión

La primera versión corre localmente y completa el ciclo central: Supabase aporta memoria personal desde el inicio, OpenCode ejecuta tareas con el modelo configurado, y Engram conserva continuidad operativa por proyecto o dispositivo. Los estándares del repositorio siguen siendo una fuente explícita y versionada.

```text
Usuario
  |
  v
Interfaz de texto
  |
  v
Servicio N.A.N.I.
  |-- ContextService ------> Supabase + knowledge/ + standards/ + examples/
  |-- AgentRuntimeInterface -> OpenCode
  |                              `-- herramientas locales autorizadas
  |-- OperationalMemoryPort -> Engram
  `-- PersonalMemoryPort ----> Supabase
```

## Componentes y límites

### Interfaz

Captura solicitudes, muestra streaming, herramientas utilizadas, permisos y resultados. No decide qué recuerdos son relevantes ni ejecuta herramientas directamente.

### Servicio N.A.N.I.

Orquesta solicitudes y mantiene las políticas de contexto, memoria y permisos. Inicialmente puede ser un único servicio modular.

### `ContextService`

Clasifica la tarea, selecciona estándares y ejemplos pertinentes, recupera memoria y construye un paquete de contexto con presupuesto limitado. No debe enviar toda la información disponible en cada interacción.

### `AgentRuntimeInterface`

Representa sesiones agénticas, herramientas, eventos y cancelación. `OpenCodeRuntime` será el primer adaptador.

### `PersonalMemoryPort`

Permite cargar el bootstrap y, en las siguientes entregas, buscar, revisar, reemplazar y olvidar conocimiento personal en Supabase.

### `OperationalMemoryPort`

Consulta y registra en Engram decisiones, acciones, resultados y aprendizaje operativo dentro de un ámbito canónico. No es la fuente principal de preferencias personales.

### `ToolRegistry`

Registra herramientas, esquema de entrada, nivel de riesgo, permisos y requisitos de confirmación. Las políticas se aplican en código.

## Flujo de una solicitud

1. Crear o reanudar una sesión y cargar un snapshot personal versionado desde Supabase.
2. Identificar tarea, proyecto, dispositivo y riesgo.
3. Recuperar decisiones operativas pertinentes desde Engram y referencias versionadas.
4. Construir un paquete de contexto trazable y limitado.
5. Ejecutar un único ciclo agéntico mediante OpenCode.
6. Verificar el resultado y registrar la observación operativa en Engram.
7. Validar candidatos de aprendizaje y aplicar cambios personales en Supabase.
8. Mostrar por separado ejecución, memoria operativa y sincronización personal.

## Decisiones iniciales

- No entrenar un modelo propio para la primera versión.
- Separar modelo de inferencia y runtime agéntico.
- Mantener OpenCode y las acciones locales en el dispositivo.
- No exponer directamente el servidor de OpenCode a Internet.
- Supabase forma parte del MVP y se consulta al iniciar la sesión; las escrituras ocurren solo ante cambios personales relevantes.
- Posponer voz; usar dictado del sistema durante la validación inicial.

## Estado implementado

- Monorepo con web, worker, contratos y engine compartida.
- Esquema Prisma para perfiles, memorias, revisiones, evidencia, cambios, dispositivos y proyectos.
- `PrismaPersonalMemoryRepository`, `ContextService` y `SessionService` para bootstrap real.
- `POST /api/v1/sessions`, health check e interfaz mínima con estado de fuente.
- Puertos definidos para OpenCode y Engram; sus adaptadores son el siguiente tramo.

## Evolución prevista

Cuando exista acceso móvil, un servicio compartido podrá resolver consultas de conocimiento y encolar trabajos. Cada dispositivo tendrá un ejecutor autenticado que solo toma tareas compatibles con sus capacidades y permisos.

