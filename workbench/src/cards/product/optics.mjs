/** Keep the centre-plane framing constant as distance changes. This is an
 * artistic thin-lens approximation; aperture is not a physical f-number. */
export function resolveOptics(settings, pose) {
  const distance=Number(settings.cameraDistance ?? 14.4);
  const samples=Number(settings.focusQuality ?? 48);
  const projection=settings.projection ?? 'perspective';
  if(!Number.isFinite(distance)||distance<8||distance>48)throw new Error('Distancia de cámara fuera de rango (8–48).');
  if(![48,96,144].includes(samples))throw new Error('Calidad de foco no válida.');
  if(!['perspective','orthographic'].includes(projection))throw new Error('Proyección no válida.');
  return {distance,lens:6.3*pose.zoom*(distance/14.4),aperture:pose.aperture*9*(distance/14.4),samples,orthographic:projection==='orthographic'?1:0};
}
