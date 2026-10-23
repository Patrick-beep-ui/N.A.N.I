# Estándar de arquitectura de IA

Estado: borrador basado en preferencias declaradas. Debe validarse contra un proyecto real.

## Objetivo

Mantener la lógica de producto independiente del proveedor de modelos y separar inferencia directa de ejecución agéntica.

## Contratos principales

### `AIClientInterface`

Abstrae inferencia directa y acotada, por ejemplo clasificar, extraer, resumir o generar una respuesta sin ciclo de herramientas.

Debe evitar exponer tipos exclusivos de un proveedor. La entrada y salida pertenecen al dominio de la aplicación; cada cliente traduce desde y hacia el SDK correspondiente.

### `AIService`

Contiene casos de uso de IA y depende de `AIClientInterface` mediante inyección de dependencias. Decide prompts, validación, políticas de reintento y transformación de resultados; no contiene credenciales ni crea clientes concretos internamente.

### Clientes de proveedor

Cada cliente implementa `AIClientInterface` y encapsula autenticación, formato de mensajes, límites, errores y particularidades del proveedor.

### `AgentRuntimeInterface`

Abstrae ejecución agéntica: sesiones, herramientas, permisos, streaming, eventos y resultados. OpenCode debe implementar este contrato como `OpenCodeRuntime`; no debe tratarse como un simple cliente de texto.

## Reglas

- Inyectar contratos, no instanciar SDKs dentro de servicios de dominio.
- Mantener selección de proveedor y modelo en configuración.
- Normalizar errores sin perder la causa original.
- Hacer explícitos timeouts, cancelación, reintentos y límites.
- Validar salidas estructuradas en el límite de la integración.
- Evitar dependencias circulares entre servicios, clientes y herramientas.
- Registrar proveedor, modelo, latencia y uso cuando esté disponible, sin registrar secretos ni contenido sensible por defecto.
- Permitir pruebas con dobles de `AIClientInterface` y `AgentRuntimeInterface`.

## Criterios de revisión

- ¿La lógica de negocio puede probarse sin red?
- ¿Cambiar de proveedor requiere modificar un caso de uso?
- ¿Los tipos del proveedor se filtran fuera del adaptador?
- ¿Se distingue una llamada de inferencia de una ejecución agéntica?
- ¿Existe una política visible para fallos, cancelación y observabilidad?

## Pendiente de confirmar

- Nombres exactos de interfaces y carpetas.
- Forma preferida de seleccionar proveedor y modelo.
- Estrategia de fallback entre modelos.
- Librería de validación y formato estándar de errores.

