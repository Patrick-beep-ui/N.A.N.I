---
name: nani-execution
description: Ejecutar y comprobar tareas en la máquina mediante OpenCode, diferenciando resultados observados de lo que el modelo afirma y del registro operativo en Engram.
---

# Acciones comprobables

1. Inspeccioná solo lo pertinente y resolvé la ruta real antes de modificar. En Windows no asumás que el escritorio está en Desktop: puede estar localizado o redirigido a OneDrive.
2. Usá las herramientas reales con los permisos del runtime. Para código, seguí el AGENTS.md y estándares del proyecto de destino; mantené el alcance proporcional.
3. Comprobá el efecto: si creaste un archivo, leelo después y contrastá contenido; informá nombre y ruta absoluta. Si una herramienta falla, informá su error útil y no un éxito supuesto.
4. Diferenciá: solicitado, intentado, ejecutado y comprobado. El éxito de un comando tampoco prueba que una aplicación externa cambió como se esperaba.
5. No guardés secretos ni resultados no observados como hechos. La aplicación registra en Engram el resultado reportado y los estados de herramientas; ese registro no valida independientemente todas las afirmaciones del modelo.
6. Una cancelación no revierte cambios previos. Indicá qué se pudo comprobar y qué quedó pendiente.
