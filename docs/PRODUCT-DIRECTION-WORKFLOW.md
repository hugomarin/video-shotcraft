# Del prompt a una pieza dirigida

## Skills del proyecto

La skill propia está versionada en [product-film-direction](../.agents/skills/product-film-direction/SKILL.md), incluida su plantilla de propuesta. La skill oficial de Remotion se instala dentro del proyecto:

```sh
python3 scripts/install-project-skills.py
```

Requiere Python 3.9+ y Git con acceso a GitHub. El origen y commit están fijados en [skills.lock.json](../skills.lock.json). La instalación es local, no sustituye una carpeta existente desconocida y no cambia dependencias del editor. El repositorio externo no incluye una licencia explícita en la revisión fijada; por eso este fork versiona el instalador y la referencia, no una copia de los contenidos externos. La guía instalada puede corresponder a una versión más reciente que el motor: verificar cada API antes de usarla, sin actualizar paquetes automáticamente.

## Etapas y entregables

1. **Prompt libre → historia y guion.** Ordenar las ideas, recomendar una historia, asignar tiempos orientativos y justificar omisiones. Separar acciones observadas, supuestos y capacidades que requerirían desarrollo.
2. **Brief visual → referencias del usuario.** Pedir ejemplos concretos de apertura, movimiento y cierre; indicar qué decisiones resolverán. Música o intención sonora si existe. No convertir falta de audio en bloqueo del guion.
3. **Referencias → propuesta visual.** Tres imágenes clave basadas en el producto real, encuadres, movimiento y relación musical. Separar bocetos de funciones existentes. No producir todo el video para explicar una dirección.
4. **Dirección acordada → producción.** Capturar o preparar solo lo necesario, implementar movimiento con tiempo de frame y exportar lo autorizado. Mantener guion/JSON y medios editables.
5. **Resultado → evaluación crítica.** Comparar evidencia con la referencia, revisar transiciones en movimiento y no solo fotogramas. Registrar qué funcionó, diferencias deliberadas, defectos y siguiente corrección concreta.

El usuario puede autorizar varias etapas de una vez; no añadir aprobaciones redundantes. Si ha indicado que primero entregará las referencias, esperar ese material antes de decidir la dirección final o producir.

## Prueba con worker independiente

Cuando se solicite, iniciar un worker sin historial de conversación. Darle el prompt libre, las skills, el alcance vigente, acceso al producto y una carpeta de salida aislada. No suministrar guiones, renders ni críticas anteriores como si fueran parte del prompt. En una prueba de guion, no pedirle un video como criterio de éxito.

El evaluador fija antes de leer la entrega estos criterios:

| Criterio | Evidencia requerida |
| --- | --- |
| Fidelidad | Acciones cubiertas o excluidas con razón; sin resultados inventados |
| Historia | Relación entre situación, descubrimiento y consecuencia |
| Tiempo | Duraciones coherentes, pausas de lectura, escritura y resultado |
| Dirección | Cámara, respuesta del producto y transición diferenciadas |
| Evidencia | Capturas/observaciones distinguidas de hipótesis |
| Handoff visual | Petición de referencias concreta y proporcionada |
| Viabilidad | Capacidades existentes separadas de preparación y desarrollo |

Calificar cumple / parcial / no cumple con ejemplos. Un guion satisfactorio no prueba calidad estética del video. Guardar la respuesta inicial antes de corregirla; identificar revisiones del evaluador. Registrar cualquier acceso a antecedentes que limite la independencia. No publicar en el fork capturas o briefs privados; las pruebas particulares quedan en salidas locales ignoradas.
