# Arquitectura de N.A.N.I.

## Alcance de la primera versión

La primera versión corre localmente, recibe texto y utiliza OpenCode como runtime agéntico. Los estándares de este repositorio son la fuente explícita y versionada; Engram conserva continuidad técnica por proyecto. Supabase se incorpora después de validar el ciclo de memoria.

```text
Usuario
  |
  v
Interfaz de texto
  |
  v
Servicio N.A.N.I.
  |-- ContextService ------> knowledge/ + standards/ + examples/
  |-- AgentRuntimeInterface -> OpenCode
  |                              |-- Engram
  |                              `-- herramientas locales autorizadas
  `-- MemoryRepositoryInterface -> futuro: Supabase
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

### `MemoryRepositoryInterface`

Permite buscar, proponer, confirmar, reemplazar y olvidar recuerdos. Engram cubre inicialmente la continuidad técnica; Supabase será el almacén compartido para perfil, documentos, tareas y dispositivos.

### `ToolRegistry`

Registra herramientas, esquema de entrada, nivel de riesgo, permisos y requisitos de confirmación. Las políticas se aplican en código.

## Flujo de una solicitud

1. Identificar tarea, proyecto y riesgo.
2. Elegir fuentes de contexto relevantes.
3. Recuperar decisiones locales y ejemplos.
4. Construir un paquete de contexto trazable.
5. Ejecutar la tarea mediante OpenCode.
6. Validar el resultado contra el checklist.
7. Mostrar resultado, fuentes y acciones realizadas.
8. Proponer recuerdos nuevos; persistir solo según la política.

## Decisiones iniciales

- No entrenar un modelo propio para la primera versión.
- Separar modelo de inferencia y runtime agéntico.
- Mantener OpenCode y las acciones locales en el dispositivo.
- No exponer directamente el servidor de OpenCode a Internet.
- Posponer Supabase hasta comprobar aplicación, corrección y continuidad con archivos y Engram.
- Posponer voz; usar dictado del sistema durante la validación inicial.

## Evolución prevista

Cuando exista acceso móvil, un servicio compartido podrá resolver consultas de conocimiento y encolar trabajos. Cada dispositivo tendrá un ejecutor autenticado que solo toma tareas compatibles con sus capacidades y permisos.

