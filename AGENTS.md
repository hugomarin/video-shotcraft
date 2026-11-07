# AGENTS.md — Product Studio sobre Shotcraft

## Objetivo
Convertir imágenes, grabaciones de aplicaciones y páginas web en videos de producto digital con acabado cinematográfico, editables tanto por una persona como por un agente. Usar Shotcraft como base: conservar sus recetas, timeline, historial y render con Remotion.

## Leer al empezar
1. `docs/PRODUCT-HANDOFF.md`: visión, decisiones, estado real y siguiente entrega.
2. `PRODUCT-STUDIO.md`: mapa de la integración local.
3. El README y las instrucciones más específicas del área que se vaya a modificar.

La integración experimental de imagen y la muestra sintética Orbit están incluidas en el repositorio. Ver el handoff para distinguirlas de funciones futuras. Comprobar git status antes de editar y no sobrescribir cambios locales.

## Reglas de producto
- La referencia estética es la presentación de producto de Linear: jerarquía clara, movimiento pausado, perspectiva contenida, foco selectivo, luz y sombras suaves. No afirmar que conocemos su implementación interna.
- No resolver la perspectiva excesiva solamente reduciendo rangos de sliders. Separar orientación, encuadre, distancia y óptica; comparar frames de inicio, mitad y final.
- Fondo y fundido tienen colores independientes; soportar acabados claros y oscuros.
- Cada preset debe ser una instantánea completa, versionada y reversible. Aplicarlo no puede acumular residuos del anterior. Undo/redo y volver al estado personalizado deben conservarse.
- Interfaz Studio: visor y timeline visibles en una pantalla; inspector derecho con secciones plegables independientes. Scroll interno solo cuando haga falta por tamaño de pantalla. Etiquetas comprensibles e iconos que expliquen los ejes.
- Acciones explícitas: “Fijar inicio”, “Fijar final”, “Ver inicio”, “Ver final”. Separar estado actual y keyframes.
- No convertir automáticamente una captura plana en supuestas capas semánticas. Las capas deben provenir de SVG/DOM/activos separados o de una segmentación revisable.
- HTML/SVG deben mantener legibilidad y proporción. Un video requiere sincronización por frame, recorte y estrategia de audio; no basta cambiar una textura de imagen por una textura de video.

## Arquitectura y trabajo
- Extender cards, PropField y ProjectData nativos antes de crear un editor paralelo.
- Remotion y el tiempo del frame gobiernan el render. No depender del reloj, requestAnimationFrame o reproducción en tiempo real para exportar.
- Three.js puede resolver profundidad y materiales; GSAP es opcional para autoría, no una segunda fuente de tiempo.
- HyperFrames es una posible exportación/adaptación futura; no es una dependencia obligatoria del producto.
- Mantener modo demo original y almacenamiento del modo producto separados. Versionar futuras migraciones.
- Reutilizar recetas existentes; exponer sus parámetros donde hoy hay constantes.
- Cada integración debe funcionar desde un clon limpio con un ejemplo sintético incluido. No depender de rutas absolutas de la computadora de Hugo.
- Preservar licencia y atribuciones del upstream. Revisar las condiciones de dependencias antes de distribuir el producto.

## Verificación
En `workbench/`:
```sh
npm ci
npm run build
npm run test:platform
npm run dev -- --host 127.0.0.1 --port 5198
```
Para cambios visuales: revisar inicio/mitad/final, imagen clara y oscura, preset A→B→A, undo/redo y persistencia. Para video: comprobar seek y render de un clip corto, no solo reproducción del visor. Registrar lo realmente ejecutado y las limitaciones. No afirmar “exportación validada” por haber renderizado únicamente un PNG.

## Colaboración y publicación
- `origin`: https://github.com/hugomarin/video-shotcraft
- `upstream`: https://github.com/Vincentwei1021/video-shotcraft
- Desarrollar mejoras en ramas pequeñas y revisables; no enviar cambios al upstream sin solicitud.
- El fork es público. Usar fixtures sintéticos. No publicar capturas de clientes, grabaciones privadas, credenciales ni archivos locales de proyecto.
- Revisar el diff staged antes de publicar. No usar git add . sobre una carpeta con medios de trabajo.
- Actualizar el handoff cuando cambie el estado de una funcionalidad.
