# Traspaso de producto — Product Studio sobre Shotcraft
Fecha de corte: 2026-11-07.

## Qué queremos construir
Un estudio para producir videos de producto digital con calidad cinematográfica a partir de imágenes, videos de uso real y páginas web. La persona puede dar una referencia visual y dirigir la escena; un agente prepara una propuesta editable con recetas reutilizables. El resultado debe conservar el detalle y la legibilidad de la aplicación.

Flujo objetivo:
1. Importar una imagen/video o indicar una página y las acciones que se quieren mostrar.
2. Capturar o preparar el contenido; revisar acciones, duración y encuadre.
3. Elegir una receta de presentación, ajustar cámara, foco, luz y acabado.
4. Previsualizar, editar inicio/final y guardar una variante.
5. Renderizar un video reproducible y compartir el proyecto editable.

Capturar una web y darle tratamiento visual son etapas separadas. Para acciones sobre cuentas reales, usar solo acciones autorizadas y datos de prueba.

## Decisiones del usuario
- Trabajar sobre Shotcraft y su funcionamiento nativo; evitar reconstruir todo desde cero.
- Priorizar videos de producto digital. El motor final importa menos que el resultado.
- La estética de Linear es referencia, no una promesa de reproducir exactamente su tecnología.
- Diseño Studio, visor protagonista, controles comprensibles, iconos orientativos y secciones plegables.
- Cámara lenta y estable. El problema observado es una perspectiva que se acelera hacia el infinito; no se considera resuelto limitando sliders.
- Profundidad de campo cuidada: una zona relevante nítida y desenfoque gradual, no blur uniforme.
- Acabados reutilizables: luz en gradiente, grano fino, sombra, brillo de borde, fundido y viñeta; colores de fondo y fundido independientes.
- Estilos de escena reversibles, sin mezclarse. Conservar ajustes propios al explorar recetas.
- Mantener el estudio anterior como referencia durante la migración.
- Fork personal hugomarin/video-shotcraft para colaboración entre equipos.

## Estado real y disponibilidad
La integración experimental de imagen y la muestra sintética Orbit están incluidas. Los medios privados no se publican. Consultar PRODUCT-STUDIO.md para iniciar y renderizar.

### Base publicada
Shotcraft upstream en commit `1266a3ec4831289c4d893d42dd5102723658039a`. La inspección local encontró React, Remotion, Three.js, Zustand, Vite, cards con esquema de propiedades, timeline e historial. Muchas recetas demo no exponen parámetros; requieren convertir constantes en propiedades para edición fina.

### Integración experimental incluida
Carpeta de Hugo: `/Users/hugomarin/Apps/shotcraft`.
Rama: `feature/product-scene`. Abrir el modo experimental en http://127.0.0.1:5198/?product=1 después de iniciar Vite.

Archivos de la integración:
- `workbench/src/cards/product/product-scene.tsx`: card nativa, esquema de controles e interpolación por frame.
- `workbench/src/cards/product/optical-scene.js` y `.d.ts`: adaptador Three.js y shader de foco.
- `workbench/src/productProject.ts`: escena inicial de seis segundos, 1920×1200.
- Cambios en registry, LibraryPanel y store para registrar Producto y separar almacenamiento con `?product=1`.
- `workbench/public/product-demo/dashboard.svg`: dashboard sintético propio, sin datos reales ni fuentes remotas.
- `workbench/examples/product-scene.json`: entrada portable para render.
- `workbench/public/product/dashboard.png` y `project.json`: medios privados locales ignorados por Git; no publicar.

La card actual admite imagen, inicio/final de giro e inclinación/zoom, posición, foco UV, apertura, colores, luz, grano, sombra, brillo, fundido, viñeta, exposición, esquinas y máscaras. Usa 48 muestras de lente sobre un plano: es una aproximación óptica, no un renderizador físico completo. Distancia y óptica todavía requieren diseño y validación perceptual.

Validación de esta entrega: TypeScript/Vite build y cinco tests de plataforma; MP4 H.264 de 180 frames, 1920×1200 a 30 fps. Se inspeccionaron los frames 0, 90 y 179. El dashboard es una imagen SVG rasterizada como textura, no capas independientes. No extender estas conclusiones a video de entrada o capas.

### Estudio anterior: referencia de migración
Prototipo anterior local: `/Users/hugomarin/Apps/product-assesment/camera-hyperframes` (permanece en su ubicación original).
Editor: http://127.0.0.1:3030/editor.html cuando su servidor esté activo.
Contiene controles de cámara y acabado, inspector plegable, carga de imagen/video, recorte de video, captura de frame y grabación de pantalla iniciada por el usuario. Exporta un proyecto HyperFrames con preparación de frames de video por FFmpeg. Conserva medios en IndexedDB y ajustes en localStorage.

Esto describe el prototipo previo, no capacidades ya migradas a Shotcraft. La grabación depende de permiso del navegador; no asumir captura automatizada validada. No hay una solución de audio integrada en ese prototipo.

## Próximas entregas, en orden
### Plan acordable tras revisar las referencias — 2026-11-07
Prioridad aclarada por Hugo: herramienta propia para lograr tomas inspiradas en Linear con poco esfuerzo. Shotcraft es la base para reutilizar editor y recetas; no presupone construir una plataforma completa. El agente prepara una propuesta y la persona dirige los mismos parámetros visualmente. Este plan está propuesto, no implementado.

Referencias revisadas: grabaciones de las 4.52.39 p.m. (tarjetas de entornos, 20.795 s) y 5.14.50 p.m. (interfaz con escritura, 18.628 s), del 2026-11-06. Se inspeccionaron secuencias a un fotograma por segundo y detalles ampliados. No se ha determinado su implementación interna; los archivos de referencia permanecen fuera del repositorio.

1. **Prueba óptica antes del rediseño.** Comparar la escena actual con perspectiva de óptica larga y una alternativa ortográfica, manteniendo composición y contenido. Separar orientación, encuadre, distancia y óptica. Comparar el shader actual con una solución de profundidad de campo basada en profundidad de escena compatible con nuestro render. Evaluar foco cercano/lejano, halos, legibilidad, estabilidad temporal y coste. Entrega: una toma sintética de 6–8 s con inicio/mitad/final y MP4; decidir el enfoque por resultado visual.
2. **Modelo e inspector de dirección.** Versionar escena y migrar datos existentes; añadir trayectorias de posición y foco, además de giro/inclinación/encuadre. Foco con clic, fijar/ver inicio-final, reset por sección, panel plegable y controles avanzados separados. Aceptación: misma escena editable por agente y persona, sin saltos al guardar posiciones, undo/redo y persistencia correctos; visor y timeline visibles.
3. **Tres recetas completas.** Recorrido de interfaz, revelado de detalle y exploración de tarjetas. Empezar por las dos de plano único; completar tarjetas cuando existan activos separados. Adaptar recetas nativas seleccionadas exponiendo constantes como propiedades. Incorporar ritmo, cámara, foco y acabado, con variantes clara/oscura. Aceptación: reemplazar contenido y ajustar pocos controles; A→B→A exacto y recuperación del estado personalizado.
4. **Contenido en movimiento.** Importar video, proporción/duración automáticas, recorte y errores claros; sincronizar contenido y cámara por frame. Definir explícitamente audio original, silencio y mezcla. Aceptación: buscar cualquier instante y renderizar un clip corto con escritura, comprobando correspondencia de preview/exportación y audio. La tarjeta multimedia existente no equivale a video integrado en el shader óptico.
5. **Elementos separados y dirección por referencia.** Importar activos/SVG/DOM como capas revisables con profundidad real y foco compartido. Eliminar cualquier dependencia de recortes específicos de un dashboard antes de habilitar capas. Preparar propuestas del agente en el mismo esquema versionado. Captura web reproducible después de validar video importado.

Decisión técnica propuesta: conservar Remotion como única fuente de tiempo y Three.js como base gráfica. GSAP no está declarado en el workbench ni se usa en la card de producto actual; incorporarlo solo si simplifica una coreografía concreta, siempre evaluado por frame. El renderer actual usa un shader de 48 muestras, distancia fija 14.4 y óptica 6.3 × zoom; no es una cámara física convencional. Instalar otra biblioteca no constituye una mejora de calidad validada.

Validación transversal por entrega: build y tests de plataforma; en cambios visuales, inicio/mitad/final, contenido claro/oscuro y MP4 corto; para estado, presets, undo/redo y recarga; para video, seek y audio. Comparar rendimiento de preview y coste de exportación antes de elegir calidad por defecto.

Sesión local de revisión: el puerto 5198 estaba ocupado por Vite de la ubicación anterior y devolvía 404. Se inició el checkout actual en http://127.0.0.1:5199/?product=1, sin detener aquel proceso. Esto es una URL de sesión, no un cambio del puerto por defecto. La página cargó sin errores de consola; no se repitió un render MP4 en esta revisión.

### 1. Base reproducible — implementada
Card nativa y muestra sintética incluidas. Los valores por defecto apuntan al SVG público. La carga de textura sucede antes de crear el renderer para evitar dejar un contexto WebGL vivo cuando falla la imagen. Build, tests y MP4 verificados.
Aceptación: otra persona clona, instala, abre el modo producto y renderiza sin archivos externos de Hugo.

### 2. Consolidar el modelo de escena y el inspector
Definir un esquema versionado para medio, cámara, keyframes, foco, acabado y receta. Normalizar unidades y nombrar los ejes. Separar zoom/encuadre de perspectiva; probar óptica larga y alternativa ortográfica con la misma composición antes de elegir.
Añadir inspector plegable, iconos, fijar/ver inicio-final, reset por sección y deshacer.
Aceptación: no hay saltos al editar endpoints; el visor permanece visible y cada cambio tiene una explicación visual clara.

### 3. Recetas reversibles
Crear presets completos y versionados: presentación clara, presentación oscura, revelado suave y foco en un detalle. Son propuestas iniciales, no requisitos de nombres.
Preservar un estado personalizado y evitar objetos anidados compartidos.
Aceptación: A→B→A reproduce A exactamente; undo restaura todos los parámetros afectados.

### 4. Video y captura de aplicaciones
Añadir fuente discriminada imagen/video; gestionar carga, proporción, duración, trim y estado de error. Diseñar decodificación/seek determinista para la textura y el render por frame; investigar audio y rendimiento antes de prometer equivalencia.
Después añadir captura web mediante acciones reproducibles sobre una demo o entorno autorizado.
Aceptación: el mismo frame del timeline muestra el mismo contenido en preview y exportación; recorte y audio tienen comportamiento explícito.

### 5. Capas y dirección por agente
Importar SVG/DOM o activos separados como capas con profundidad, sombras y foco. Mantener una alternativa de plano único. Evitar recortes hardcodeados de un dashboard.
El agente debe generar/editar el mismo esquema que usa la interfaz, con validación y vista previa, sin escribir una escena incompatible con el editor.
Aceptación: cambios del agente son editables, reversibles y exportables por el mismo pipeline.

### 6. Exportación y compatibilidad
Priorizar MP4 reproducible y proyecto portable con medios. Evaluar HyperFrames como adaptador después de estabilizar el modelo, documentando efectos no equivalentes. No exigir dos motores para terminar la primera versión útil.

## Criterios visuales
- Texto legible en el punto de interés; blur progresivo por profundidad.
- Perspectiva contenida, sin fuga brusca ni aceleración inesperada.
- Luces, sombras y brillos coherentes, discretos, sin ocultar el producto.
- Fade/viñeta guían la mirada y funcionan sobre fondos claros y oscuros.
- Grano fino, sin parpadeo distractor ni pérdida de texto.
- Movimiento suave con reposo suficiente para leer.
- Comparar la misma composición al evaluar cambios: no confundir menos zoom con mejor óptica.

## Primera instrucción para retomar
Lee AGENTS.md y este handoff. Inspecciona git status y la card experimental antes de modificar. Continúa con la entrega 2: modelo de escena e inspector. Revisa primero la muestra pública y la óptica actual. Conserva el prototipo anterior. Reporta qué está implementado, qué se verificó y qué queda pendiente.

Verificación adicional: una copia limpia de los archivos preparados instaló con `npm ci`, compiló y renderizó el frame 90 sin medios privados. El preview local cargó la card pública sin errores de JavaScript.

## Mejora del inspector — 2026-11-07
Implementada agrupación opcional nativa mediante `CardDef.inspectorGroups`. La escena de producto usa secciones plegables independientes: Imagen, Cámara inicio/final, Posición, Enfoque, Acabado, Fondo, Superficie, Fundido y viñeta, Máscara. Etiquetas abreviadas; claves, valores y render conservados. Timing & Speed y Layer siguen siendo las secciones originales de Shotcraft. Las tarjetas sin grupos conservan su presentación anterior.

Verificado: build, cinco tests de plataforma, apertura simultánea de secciones y revisión visual en el demo local. Se mantiene la advertencia de tamaño del bundle. No se renderizó MP4 ni se validaron presets en este cambio de presentación; presets y acciones fijar/ver inicio-final siguen pendientes. Las nuevas etiquetas continúan en español y no se ha añadido español como idioma global del editor.

## Entrega de dirección por keyframes — 2026-11-07
Rama de inspector: `codex/product-direction`, PR #2, sobre `feature/product-scene` (PR #1 aún abierto). Segunda rama: `codex/product-keyframes`, basada en la del inspector.

Implementado: vista de prueba separada de ProjectData, botones fijar/ver inicio-final, movimiento versionado de giro/inclinación/encuadre/posición/foco/apertura, compatibilidad con parámetros anteriores y captura de extremos visibles en clips recortados o con velocidad. Interpolación compartida por editor y render, gobernada por frame. No se ha cambiado el shader óptico ni validado una mejora de calidad respecto a Linear. La duración no redistribuye keyframes ya guardados; conserva su tiempo de origen.

Validación: build, cinco tests de plataforma y cuatro tests de movimiento (compatibilidad anterior, recorte/velocidad, JSON y seek, validación). En navegador aislado se verificaron captura, descarte, undo/redo y persistencia; sin modificar el proyecto del navegador del usuario. MP4 real de 60 frames, 960×600 a 30 fps, inspeccionado en 0/30/59. Usó el navegador local instalado porque la descarga de Chrome no estaba disponible. Advertencia de tamaño de bundle existente. Pendientes: comparación óptica clara/oscura, foco con clic, recetas reversibles, entrada de video y captura web, catálogo semántico y validación completa de proyecto para agentes.

## Comparación óptica — 2026-11-07
Rama `codex/product-optics`, sobre `codex/product-keyframes`. Añade distancia con compensación de óptica y apertura, proyección paralela y 48/96/144 muestras de lente. Controles en sección Óptica; los ajustes antiguos mantienen sus valores por defecto. Imagen oscura sintética y proyecto comparativo incluidos. Se mantiene el shader de plano único; no afirmar que se resolvió la calidad de profundidad de campo de la referencia.

Verificado: build, siete tests de producto y cinco de plataforma; cambio de proyección y calidad con recarga en navegador aislado, sin errores. Comparación de renderer anterior/actual en un frame a 640×400: diferencia máxima de canal 1/255 y media 0.00001075, no identidad binaria. MP4 final de 360 frames a 960×600/30fps: tres ópticas × claro/oscuro; revisados inicio/mitad/final de los seis clips. La perspectiva larga disminuye convergencia; la paralela la elimina. El acabado de luz/sombra y el foco siguen siendo aproximaciones, con margen de mejora. No se realizó un benchmark estable de rendimiento ni una comparación con un postproceso de profundidad; 48 muestras siguen siendo el valor predeterminado. Advertencia de bundle grande preexistente.

## Recetas y contrato para agentes — 2026-11-07
Rama `codex/product-recipes`: esquema de controles compartido entre renderer y CLI; tres recetas completas versión 1, recuperación de ajustes personalizados y acción explícita para guardar nueva base. Catálogo semántico, creación, validación, snapshot completo y render mediante `scripts/product.mjs`. No se ha añadido un servidor MCP; el agente invoca comandos y usa el mismo JSON del editor.

Verificado: build, 13 pruebas de producto y cinco de plataforma. Navegador aislado: A→B→A, restauración personalizada, undo/redo. CLI create/validate y render real de ejemplo de tres recetas, 180 frames a 960×600/30fps, inspeccionados inicio/mitad/final. Muestra JSON importable y pública; solo fixtures sintéticos. Pendientes: entrada de video, captura de URL e importación cómoda de medios, exportación con empaquetado de assets y revisión perceptual con Hugo. Advertencia de tamaño del bundle existente.
