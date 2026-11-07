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
