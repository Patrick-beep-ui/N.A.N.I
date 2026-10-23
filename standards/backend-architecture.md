# Estándar de arquitectura backend

Estado: borrador basado en preferencias declaradas. Debe validarse contra un proyecto real.

## Flujo de responsabilidades

```text
route -> controller -> service/use case -> repository or adapter
```

- **Routes:** declaran endpoints, middleware y enlace con controladores.
- **Controllers:** traducen transporte HTTP a entradas del caso de uso y transforman su resultado en respuesta HTTP.
- **Services/use cases:** contienen reglas y orquestación de negocio.
- **Models/domain:** expresan datos, invariantes y conceptos del dominio.
- **Repositories/adapters:** encapsulan persistencia y servicios externos.

## Reglas

- Los controladores deben ser pequeños y no contener reglas de negocio.
- Los servicios no deben depender de objetos HTTP ni de SDKs concretos.
- La validación de forma ocurre al entrar; las invariantes del dominio se protegen en el dominio o caso de uso.
- Los errores esperados deben representarse de forma explícita y mapearse a HTTP en el límite.
- Las dependencias externas deben inyectarse mediante contratos.
- La configuración y los secretos no deben importarse de forma dispersa por la aplicación.
- Cada módulo debe tener una responsabilidad clara y una dirección de dependencias comprensible.

## Definición mínima de un endpoint completo

- Contrato de entrada y salida.
- Validación de entrada.
- Autorización cuando aplique.
- Caso de uso separado del transporte.
- Persistencia o integración mediante un adaptador.
- Manejo consistente de errores.
- Pruebas proporcionales al riesgo.
- Logs útiles sin secretos ni datos personales innecesarios.

## Señales de alerta

- Un controlador que consulta directamente la base de datos.
- Un servicio que construye su propio cliente externo.
- Respuestas HTTP creadas dentro del dominio.
- Capturas de error que ocultan la causa o devuelven éxito falso.
- Tipos duplicados y divergentes para el mismo concepto.
- Carpetas organizadas por capa cuando eso dispersa excesivamente un dominio; evaluar módulos por feature cuando el proyecto crezca.

## Pendiente de confirmar

- Estructura exacta por capas o por feature.
- Convenciones de nombres.
- Framework HTTP, ORM y librería de validación preferidos.
- Estrategia de pruebas y umbrales de cobertura.

