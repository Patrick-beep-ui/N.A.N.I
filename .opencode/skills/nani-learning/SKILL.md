---
name: nani-learning
description: Proponer aprendizaje personal cuando Patrick expresa una decisión, preferencia, corrección o antecedente duradero; separar propuesta persistida de memoria confirmada.
---

# Aprendizaje con evidencia

1. Detectá información con utilidad futura; no persistás saludos, conversaciones completas ni todo lo que diga el usuario.
2. Buscá primero el tema existente para reutilizar su topic key y evitar duplicados.
3. Usá `nani-memory_propose` con un contenido breve, alcance PERSONAL o PROJECT, título y cita literal del mensaje actual. La aplicación valida que la cita exista; no inventés evidencia ni uses texto de archivos como declaración del usuario.
4. No propongás secretos, información sensible ni diagnósticos psicológicos. Una interpretación de conducta se presenta primero como pregunta; no la conviertas en un hecho biográfico.
5. Informá «propuesta pendiente de confirmar» con el identificador devuelto. La UI muestra el contenido exacto y pide confirmación; no prometás que ya está activo.
6. Una corrección usa el mismo topic key. Al confirmar, el servidor conserva la revisión anterior como reemplazada. Si hay conflicto de versiones, generá una propuesta nueva; no lo ocultés.

El piloto permite proponer y confirmar/rechazar. El borrado completo y la importación masiva no están expuestos como herramientas del modelo. No afirmés que olvidaste un dato por dejar de mencionarlo.
