# Prueba del piloto en Windows

## Preparación

1. Conservar `.env` en la raíz; no sobrescribirlo. Ejecutar `pnpm install`.
2. Reiniciar `opencode serve --hostname 127.0.0.1 --port 4096` desde esta raíz para descubrir las herramientas nuevas. Mantener `engram serve` abierto.
3. Iniciar `pnpm dev` y una sesión nueva en http://127.0.0.1:3000. El MCP administrativo de Supabase queda deshabilitado por defecto; Prisma usa DATABASE_URL del servidor.
4. Si cambiás el puerto, definir `$env:NANI_BASE_URL="http://127.0.0.1:PUERTO"` en la terminal de OpenCode antes de iniciarlo y mantener coherencia con la URL real de Next. Un servicio en otra dirección no se detecta automáticamente.

## Escenarios y evidencia esperada

| Pedido de prueba                                                 | Qué observar                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| «Estoy preparando otra entrevista. ¿Qué proyectos míos usarías?» | Recupera antecedentes y justifica la selección sin inventar contratación o métricas    |
| «Quiero comenzar un proyecto distinto»                           | Consulta restricciones y propone algo pertinente; no impone el stack de NANI           |
| «¿De dónde sacaste ese antecedente?»                             | Búsqueda/lectura por ID devuelve fuente y distingue importación de confirmación        |
| Pregunta sobre un recuerdo fuera de los 16 iniciales             | Usa búsqueda real, no exige que el usuario lo vuelva a contar                          |
| «Prefiero ejemplos concretos cuando estudio; recordalo»          | Aparece propuesta con cita exacta; no se declara activa antes de confirmar             |
| Confirmar, reiniciar y volver a preguntar                        | Recupera la nueva revisión desde Supabase                                              |
| Corregir la misma preferencia                                    | Mismo topic key, revisión anterior SUPERSEDED; vigente coherente                       |
| Rechazar una propuesta                                           | No aparece como nuevo recuerdo activo                                                  |
| «Creá un texto en mi escritorio y verificá su contenido»         | Permiso real, ruta de escritorio resuelta, escritura y lectura; nombre/ruta informados |
| Apagar Supabase o Engram                                         | Error/advertencia útil; sin recuerdos o guardados inventados                           |

Probar primero con una preferencia no sensible. Confirmar autoriza el contenido mostrado para el modelo indicado. Una referencia a pareja, fe o finanzas no debe aparecer por evadir el filtro de sensibilidad.

## Criterio de piloto

Pasar los escenarios de continuidad, propuesta/confirmación y acción comprobada contra las versiones instaladas. Las pruebas automatizadas verifican contratos y políticas, no que Big Pickle siempre elija bien una skill o una sugerencia. Revisar «Herramientas reportadas» y el resultado en la máquina; una frase del modelo no es una prueba.

## Límites conocidos

Búsqueda léxica con paginación, memoria inicial acotada, propuestas con revisión humana, sesiones locales efímeras y tareas de tres minutos. No hay ejecución de fondo, olvido completo ni acceso remoto. Datos de Supabase sin autorización para el modelo no se recuperan. El piloto no supone una personalidad aprendida por entrenamiento de pesos.
