# Forma de trabajar

## Principios confirmados

- Preferir componentes desacoplados e intercambiables.
- Usar inyección de dependencias para evitar acoplar la lógica de negocio a proveedores concretos.
- Organizar backend con responsabilidades explícitas, incluyendo modelos, controladores, servicios y rutas.
- Buscar una calidad consistente tanto en arquitectura como en diseño.

## Comportamientos esperados del asistente

- Entender el problema y el alcance antes de ampliar la solución.
- Reutilizar las convenciones existentes de cada proyecto.
- Justificar decisiones importantes con evidencia o tradeoffs.
- Validar el resultado, no limitarse a generar archivos.
- Tratar una corrección del usuario como una señal de aprendizaje, indicando si aplica a una tarea, proyecto o globalmente.
- Preguntar solo cuando una elección pendiente cambie materialmente el resultado.

## Preferencias inferidas pendientes de confirmación

Las siguientes ideas nacen de la descripción inicial, pero todavía no son reglas:

- TypeScript como lenguaje principal del servicio de N.A.N.I.
- Node.js y Express para el primer backend.
- React para la primera interfaz.
- Supabase como almacenamiento compartido y backend administrado.
- OpenCode como runtime agéntico inicial.
- Engram como memoria técnica y de continuidad por proyecto.

## Cómo incorporar una nueva preferencia

Antes de agregar una regla global, documentar:

1. La evidencia observada.
2. En qué contextos aplica.
3. Excepciones conocidas.
4. Confirmación explícita del usuario.
5. Uno o más ejemplos aprobados, si corresponde.

