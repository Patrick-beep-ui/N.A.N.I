# Ejemplos aprobados

Esta carpeta contiene referencias que representan el estándar real del usuario. Los ejemplos tienen más valor cuando incluyen el motivo de su aprobación, no solo código final.

## Formato recomendado

Crear una carpeta por ejemplo:

```text
examples/
└── ai-provider-adapter/
    ├── README.md
    └── source/
```

El `README.md` de cada ejemplo debe indicar:

- Proyecto y fecha de origen.
- Problema que resuelve.
- Qué decisiones representan el estándar personal.
- Qué partes son específicas del proyecto y no deben generalizarse.
- Estado: `propuesto`, `aprobado` u `obsoleto`.

## Primeros ejemplos por incorporar

1. Una implementación de `AIInterface -> AIService -> client`.
2. Un módulo backend con ruta, controlador, servicio y persistencia.
3. Una interfaz visual aprobada con sus criterios de diseño.

No copiar secretos, archivos de entorno, datos privados ni código cuya licencia no permita reutilización.

