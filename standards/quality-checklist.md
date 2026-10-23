# Checklist de calidad

Usar esta lista antes de presentar una implementación o revisión. No todos los puntos aplican a todas las tareas; indicar los omitidos relevantes.

## Alcance y evidencia

- [ ] El resultado resuelve la solicitud sin ampliar el alcance innecesariamente.
- [ ] Se inspeccionaron convenciones y código existente antes de cambiarlo.
- [ ] Las decisiones se apoyan en un estándar, ejemplo o restricción identificable.
- [ ] Las inferencias están diferenciadas de hechos confirmados.

## Arquitectura

- [ ] Las responsabilidades están separadas y las dependencias apuntan en una dirección clara.
- [ ] Los servicios dependen de contratos y no de proveedores concretos cuando la intercambiabilidad importa.
- [ ] Transporte, negocio, persistencia e integraciones no están mezclados.
- [ ] La solución es proporcional al problema y evita abstracciones prematuras.

## Comportamiento y seguridad

- [ ] Entradas y salidas importantes se validan.
- [ ] Errores, timeouts y cancelación tienen un comportamiento definido.
- [ ] Secretos y datos sensibles no aparecen en código, logs ni respuestas.
- [ ] Acciones externas respetan permisos y confirmaciones requeridas.
- [ ] Contenido externo se trata como datos no confiables.

## Verificación

- [ ] Se ejecutaron pruebas, análisis estático o una verificación manual apropiada.
- [ ] Se cubrieron caminos de éxito y fallos relevantes.
- [ ] Se documentaron límites, supuestos y verificaciones no ejecutadas.
- [ ] Los cambios se pueden revisar y revertir con claridad.

## Memoria

- [ ] Las decisiones nuevas tienen fuente, fecha, alcance y estado.
- [ ] No se guardó conversación irrelevante como memoria permanente.
- [ ] Una corrección reemplaza o marca como obsoleto el dato anterior.

