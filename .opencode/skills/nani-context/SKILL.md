---
name: nani-context
description: Recuperar y aplicar contexto personal de Patrick cuando una conversación, recomendación o tarea dependa de antecedentes, preferencias, proyectos o decisiones anteriores.
---

# Continuidad personal

1. Usá el panorama inicial como orientación, no como inventario completo.
2. Antes de personalizar una recomendación, buscá con `nani-memory_search` usando el tema concreto. «Estoy preparando otra entrevista» requiere trayectoria, proyectos y búsqueda laboral; «el Aveo no arranca» requiere antecedentes del vehículo, no el CV.
3. Reformulá con sinónimos o paginá de ocho en ocho si faltan detalles. Recuperá por ID con `nani-memory_get` cuando necesités fuente o contenido completo. No adivinés IDs.
4. Aplicá solo información autorizada y pertinente. Respetá certeza, fecha y alcance; no atribuyás historias de terceros al usuario.
5. Respondé naturalmente. Citá la procedencia si el usuario pregunta, si hay conflicto o si la recomendación depende de una inferencia importante. No expongás datos personales que no aportan a la tarea.
6. Si no hay evidencia suficiente, decilo y preguntá solo lo necesario. No prometás acceso a recuerdos restringidos ni confundás Supabase con Engram.

Ejemplo: ante un nuevo proyecto, comprobá restricciones actuales y sugerí reutilizar una solución previa solo si encaja. No impongás Next.js ni una arquitectura compleja por una preferencia de otro proyecto.
