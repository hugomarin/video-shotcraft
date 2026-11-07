# Product Studio sobre Shotcraft

Integración experimental para convertir una imagen de producto en una escena con cámara, enfoque selectivo y acabado editable. La muestra **Orbit** es un dashboard sintético original con datos ficticios; no requiere capturas privadas.

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
Video como textura, captura web, carga de medios desde el inspector, capas semánticas, presets reversibles, foco con clic y adaptación HyperFrames. El prototipo anterior permanece separado como referencia de migración.

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
Para abrirlo en el editor, importa el objeto `project` del ejemplo (el archivo completo es la envoltura de props del CLI). Los medios sintéticos están incluidos; el video resultante queda fuera de Git.
