# Product Studio sobre Shotcraft

Integración experimental para convertir imágenes, videos o capturas estáticas de páginas web en una escena con cámara, enfoque selectivo y acabado editable. La muestra **Orbit** es un dashboard sintético original con datos ficticios; no requiere capturas privadas.

## Abrir
Desde la raíz del repositorio:
```sh
cd workbench
npm ci
npm run dev:product
```
Abrir http://127.0.0.1:5198/?product=1. El modo normal sigue en `/`. El modo producto mantiene almacenamiento independiente. Si ya tenías un proyecto guardado, este se conserva; la card “Escena de producto” permite introducir `product-demo/dashboard.svg` como fuente.

## Renderizar la muestra
Desde `workbench/`:
```sh
npm run render:product
```
Genera `exports/product-demo.mp4` (1920×1200, 30 fps, 180 frames). Remotion puede descargar su navegador en la primera ejecución. Para usar un navegador compatible instalado:
```sh
npm run render:product -- --browser-executable=/ruta/al/navegador
```
La configuración está en `examples/product-scene.json`; cambiar `project.tracks[0].clips[0].props` permite probar parámetros sin editar código. El MP4 se genera localmente y no se versiona.

## Incluido
- Card `product-optical-scene`, categoría Producto y proyecto inicial de seis segundos.
- Giro/inclinación/zoom con inicio-final, posición, foco UV y apertura.
- Colores de fondo/fundido, luz, grano, sombra, brillo, viñeta, exposición, esquinas y máscaras.
- Shader de lente con 48 muestras sobre un plano; no es un renderizador físico completo.
- Integración con timeline, propiedades e historial existentes de Shotcraft.

## Pendiente
Capas semánticas, foco con clic, captura de interacciones web, traducción automática de referencias visuales y adaptación HyperFrames. Imagen/video, captura estática por CLI y presets reversibles ya están disponibles. El prototipo anterior permanece separado como referencia de migración.

## Validación
Build TypeScript/Vite y cinco tests de plataforma pasan. Se renderizó el MP4 completo y se inspeccionaron inicio/mitad/final. La óptica sigue siendo experimental; este ejemplo demuestra el pipeline, no una equivalencia visual exacta con Linear. El build conserva una advertencia de tamaño del bundle.

[AGENTS.md](AGENTS.md) contiene las reglas para los agentes; [el handoff](docs/PRODUCT-HANDOFF.md) describe visión, decisiones y próximas entregas. El fork es `hugomarin/video-shotcraft`; el original permanece como `upstream`.

Verificación adicional: una copia limpia de los archivos preparados instaló con `npm ci`, compiló y renderizó el frame 90 sin medios privados. El preview local cargó la card pública sin errores de JavaScript.

## Dirigir inicio y final
Selecciona una escena de producto y usa **Ver inicio** o **Ver final**. Los controles de **Dirigir toma** muestran el estado de ese instante. Al ajustarlos creas una vista de prueba: aún no modifica el proyecto ni lo exportado. Usa **Fijar inicio** o **Fijar final** para guardarla, o **Descartar prueba** para volver. Pausa la reproducción para editar. Cambiar de instante o clip descarta la prueba sin guardar.

Los extremos incluyen giro, inclinación, encuadre, posición, punto de foco y apertura. Guardar cada extremo es una operación de historial; JSON y recarga conservan lo guardado. El modelo `props.motion` tiene `version: 1`, `startFrame`, `endFrame`, `start` y `end`; los tiempos son fotogramas de origen, antes de recorte/velocidad. Si editas un clip recortado, fijar un extremo conserva la pose visible del otro extremo. Cambiar después su duración recorta o prolonga el movimiento, no redistribuye automáticamente sus keyframes.

Los proyectos sin `motion` conservan sus parámetros e interpolación anteriores. Con `motion`, sus poses tienen prioridad sobre los campos antiguos. Cada pose usa `yaw`/`pitch` (grados), `zoom` (encuadre), `panX`/`panY` (unidades de escena), `u`/`v` (coordenadas 0–1 sobre la imagen, origen arriba izquierda) y `aperture` (intensidad artística, no f-stop físico). El controlador compartido valida versión, intervalos y límites antes de guardar; no se trata todavía de una validación completa del proyecto importado.

Prueba portable: `examples/product-motion.json` (2 s, 960×600, 30 fps). Render desde workbench:
```sh
npx remotion render src/remotion/index.ts Main exports/product-motion.mp4 --props=examples/product-motion.json --codec=h264
npm run test:product
```

## Comparar ópticas
La sección **Óptica** permite seleccionar perspectiva o proyección paralela, distancia de 8 a 48 unidades y 48/96/144 muestras de lente. Al cambiar distancia se compensa la óptica para conservar el tamaño en el plano central; las zonas inclinadas cambian su convergencia. El encuadre sigue en la pose. La apertura se compensa con la distancia para mantener aproximadamente la intensidad de desenfoque. Son controles artísticos, no focales ni aperturas físicas calibradas. La proyección paralela utiliza un desenfoque sintético; la distancia conserva influencia en esa aproximación, aunque no cambia la geometría proyectada.

Predeterminados anteriores conservados: perspectiva, distancia 14.4, 48 muestras. Para probar perspectiva más contenida, compara 14.4 y 36 con el mismo encuadre. Más muestras pueden reducir la estructura visible del muestreo a costa de más trabajo gráfico; no cambian la profundidad ni garantizan mayor realismo. No se ha incorporado un postprocesado de profundidad de escena ni geometría multicapa.

`examples/product-optics.json` contiene seis clips de dos segundos: perspectiva 14.4, perspectiva 36 y paralela, primero con imagen clara y después oscura. Todos usan el mismo recorrido y 96 muestras, para comparar ópticas sin mezclar ese cambio con calidad de muestreo. Desde workbench:
```sh
npx remotion render src/remotion/index.ts Main exports/product-optics.mp4 --props=examples/product-optics.json --codec=h264
```
Para abrirlo en el editor, importa el archivo completo o su objeto `project`; ambas formas son admitidas. Los medios sintéticos están incluidos; el video resultante queda fuera de Git.

## Recetas y agentes
El inspector ofrece Recorrido claro, Recorrido oscuro y Revelar detalle. Aplicar sustituye todos los ajustes visuales y conserva el material. A→B→A es exacto; **Volver a mis ajustes** restaura la configuración anterior a explorar recetas. **Guardar mis ajustes** establece una nueva base personalizada. Cada acción es reversible con undo/redo.

Desde la raíz del repo:
```sh
node workbench/scripts/product.mjs catalog
node workbench/scripts/product.mjs create --asset product-demo/dashboard.svg --recipe interface-light --out /tmp/product.json
node workbench/scripts/product.mjs validate /tmp/product.json
node workbench/scripts/product.mjs snapshot /tmp/product.json --out /tmp/product-portable.json
node workbench/scripts/product.mjs render /tmp/product.json --out /tmp/product.mp4
```
El catálogo describe cuándo usar cada receta, controles, unidades y operaciones. El JSON creado se importa directamente con Import en Workbench. La validación CLI se limita a escenas `product-optical-scene`, revisa parámetros y existencia de materiales locales. No valida montajes generales de Shotcraft. `snapshot` materializa valores y quita metadatos de exploración; los assets siguen siendo archivos externos en public. Las salidas CLI no sobrescriben archivos existentes. Render admite `--browser /ruta/al/navegador`.

`examples/product-recipes.json` contiene las tres recetas con medios sintéticos. La receta oscura no convierte una imagen clara en oscura: el contenido y el acabado son decisiones distintas.

## Importar imagen o video
En **Importar contenido**, elige un archivo local; para video indica inicio y duración en segundos antes de cargarlo. Admite hasta 200 MB y 120 s por importación. Requiere FFmpeg/ffprobe en PATH. El material queda en `workbench/public/imports/` (ignorado por Git). Los videos se preparan como PNG a 30 fps y audio WAV separado; esto consume más disco que el original. La imagen conserva proporción; el video se limita a 1920 px de ancho. El panel ajusta la duración del clip y redistribuye sus dos poses guardadas al nuevo contenido.

**Audio original** está desactivado al importar. Al activarlo, recorte y velocidad del timeline se aplican también al audio. Tras agotar la secuencia se mantiene el último fotograma; el audio termina. No se ha implementado mezcla de varias fuentes dentro de esta escena. Para cambiar una secuencia por una imagen usa Importar contenido; editar solo la ruta no elimina una secuencia existente.

Para agentes:
```sh
node workbench/scripts/product.mjs import --input /ruta/video.mp4 --start 0 --seconds 10 --recipe interface-light --out /tmp/video-project.json
node workbench/scripts/generate-video-example.mjs
node workbench/scripts/product.mjs render workbench/exports/video-example.json --out /tmp/video-test.mp4
```
El generador produce un patrón de video con tono sintético en exports; no requiere medios privados. El contenido se selecciona por fotograma de origen y se usa el mismo cálculo para seek y render. La carga de textura reutiliza el contexto gráfico; al exportar espera a que el fotograma esté cargado. La reproducción del visor puede perder fluidez con archivos grandes; la exportación no depende de esa velocidad de reproducción.

## Capturar una página y transportar el proyecto
Desde la raíz del repo, con el servidor local encendido:
```sh
node workbench/scripts/product.mjs capture --url http://127.0.0.1:5198/product-demo/page.html --out /tmp/web-project.json
node workbench/scripts/product.mjs pack /tmp/web-project.json --out /tmp/web-bundle
node workbench/scripts/product.mjs validate /tmp/web-bundle/project.json --assets /tmp/web-bundle/public
node workbench/scripts/product.mjs render /tmp/web-bundle/project.json --assets /tmp/web-bundle/public --out /tmp/web-film.mp4
```
`capture` acepta HTTP(S), abre un perfil limpio y captura el viewport (1600×1000 por defecto). Opciones: `--width`, `--height`, `--wait` en milisegundos, `--recipe` y `--browser`. No hereda sesiones personales ni graba clics/scroll; para interacciones utiliza un video. Una página con carga tardía puede requerir ajustar la espera o revisar la captura. Usa páginas públicas o autorizadas. La muestra HTML incluida es sintética. La captura queda en public/imports y no se publica por Git.

`pack` crea un directorio nuevo con project.json, public/ y manifest.json (tamaño y SHA-256 de cada material). Incluye todos los fotogramas y el audio referenciado; no incluye el motor. En otro clon compatible puedes renderizar con `--assets` sin copiar materiales al repo. Para editar allí, copia el contenido de public/ del paquete a workbench/public/ antes de importar project.json. El inspector no importa carpetas de paquetes todavía. Tanto el JSON directo como la envoltura `{project: ...}` pueden abrirse en el editor; las escenas de producto se validan antes de reemplazar el proyecto actual.

Esto proporciona herramientas semánticas para que un agente construya una propuesta. No incluye un modelo que analice automáticamente cualquier video de referencia ni garantiza reproducir la estética de Linear.

## Comprobar recorte de video al final de un montaje
```sh
cd workbench
npm run test:product-render -- --browser /ruta/al/navegador
```
Esta prueba de integración requiere FFmpeg y un navegador compatible (si se omite `--browser`, Remotion puede descargarlo). Genera material sintético y comprueba el MP4, incluyendo un recorte de origen que excede la duración completa del montaje. El tiempo de la escena de producto se calcula directamente desde el frame del clip; evita el límite que Freeze aplica al tiempo de la composición. No modifica el remapeo de las demás cards.
