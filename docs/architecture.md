# Arquitectura del piloto

Una aplicación Next.js + TypeScript + Prisma. No hay workspaces funcionales, worker separado ni servidor de memoria adicional.

1. La sesión resuelve al único propietario (o UUID configurado) y conserva proyecto, dispositivo y modelo en servidor.
2. Cada turno carga instrucciones permanentes y `nani-context`, refresca el bootstrap y busca contexto pertinente en Supabase; consulta también Engram por proyecto.
3. OpenCode se conecta a la raíz de NANI, comprueba que existen las herramientas de memoria y ejecuta con el modelo explícito. La carpeta de destino se indica en el prompt; no es un sandbox.
4. Las herramientas nativas llaman a una ruta local de Next con el ID de runtime aportado por OpenCode. Solo un turno activo puede usarlas; no aceptan propietario, modelo o proyecto arbitrarios.
5. El aprendizaje crea cambios PENDING. La UI confirma/rechaza; al confirmar, Prisma aplica revisiones/evidencia/historial y actualiza context_revision en transacción, con control de conflictos.
6. La UI conserva permisos y cancelación. Engram registra respuesta reportada y estados de herramientas; no certifica efectos por sí solo.

`services/chat.ts` coordina; `memory.ts` recupera; `learning.ts` protege cambios; `behavior.ts` lee instrucciones fijas. Los Route Handlers traducen HTTP. No se crean abstracciones que solo delegan.

Ver `docs/behavior.md`, `docs/memory-policy.md` y `docs/pilot.md`. No se altera el esquema ni se importan datos personales a Git. Las pruebas usan dobles de persistencia y servicios HTTP locales; el piloto real es una verificación separada.
