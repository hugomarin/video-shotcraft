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
Video como textura, captura web, carga de medios desde el inspector, capas semánticas, presets reversibles, nuevo inspector y adaptación HyperFrames. El prototipo anterior permanece separado como referencia de migración.

## Validación
Build TypeScript/Vite y cinco tests de plataforma pasan. Se renderizó el MP4 completo y se inspeccionaron inicio/mitad/final. La óptica sigue siendo experimental; este ejemplo demuestra el pipeline, no una equivalencia visual exacta con Linear. El build conserva una advertencia de tamaño del bundle.

[AGENTS.md](AGENTS.md) contiene las reglas para los agentes; [el handoff](docs/PRODUCT-HANDOFF.md) describe visión, decisiones y próximas entregas. El fork es `hugomarin/video-shotcraft`; el original permanece como `upstream`.

Verificación adicional: una copia limpia de los archivos preparados instaló con `npm ci`, compiló y renderizó el frame 90 sin medios privados. El preview local cargó la card pública sin errores de JavaScript.
