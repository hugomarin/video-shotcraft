/** Shared, frame-driven motion contract. No browser state or wall clock. */
export const poseFields = [
  {key:'yaw', label:'Giro ↔', min:-70, max:70, step:.5, unit:'°'},
  {key:'pitch', label:'Inclinación ↕', min:-70, max:70, step:.5, unit:'°'},
  {key:'zoom', label:'Encuadre', min:.75, max:2.7, step:.01, unit:''},
  {key:'panX', label:'Posición ↔', min:-2, max:2, step:.01, unit:''},
  {key:'panY', label:'Posición ↕', min:-1.5, max:1.5, step:.01, unit:''},
  {key:'u', label:'Foco ↔', min:0, max:1, step:.01, unit:''},
  {key:'v', label:'Foco ↕', min:0, max:1, step:.01, unit:''},
  {key:'aperture', label:'Desenfoque', min:0, max:.3, step:.005, unit:''},
];
export function validateMotion(m) {
  if (!m || m.version !== 1 || !Number.isFinite(m.startFrame) || !Number.isFinite(m.endFrame) || m.startFrame < 0 || m.endFrame <= m.startFrame)
    throw new Error('Movimiento no válido: versión o intervalo de fotogramas.');
  for (const endpoint of ['start','end']) for (const f of poseFields) {
    const n=m[endpoint]?.[f.key];
    if (!Number.isFinite(n) || n<f.min || n>f.max) throw new Error(`Movimiento no válido: ${endpoint}.${f.key}`);
  }
  return m;
}
export function resolveMotion(p={}, duration=180) {
  if (p.motion !== undefined) return validateMotion(p.motion);
  const common={panX:Number(p.panX ?? 0),panY:Number(p.panY ?? 0),u:Number(p.focusU ?? .59),v:Number(p.focusV ?? .45),aperture:Number(p.aperture ?? .06)};
  return {version:1,startFrame:0,endFrame:Math.max(1,duration-1),
    start:{...common,yaw:Number(p.yawStart ?? 15),pitch:Number(p.pitchStart ?? -12),zoom:Number(p.zoomStart ?? 1.6)},
    end:{...common,yaw:Number(p.yawEnd ?? 3),pitch:Number(p.pitchEnd ?? 1),zoom:Number(p.zoomEnd ?? 1.18)}};
}
export function sampleMotion(m, frame) {
  const t=Math.max(0,Math.min(1,(frame-m.startFrame)/(m.endFrame-m.startFrame)));
  const ease=(1-Math.cos(t*Math.PI))/2;
  return Object.fromEntries(poseFields.map(({key})=>[key,m.start[key]+(m.end[key]-m.start[key])*ease]));
}
export function clipMotionRange(clip) {
  return {start:clip.inOffset,end:clip.inOffset+(clip.duration-1)*clip.speed,duration:Math.max(1,Math.round(clip.inOffset+clip.duration*clip.speed))};
}
/** Capture visible endpoints when editing a trimmed/retimed clip. Never mutate old snapshots. */
export function fixEndpoint(props, clip, endpoint, pose) {
  const r=clipMotionRange(clip), m=resolveMotion(props,r.duration);
  return validateMotion({version:1,startFrame:r.start,endFrame:r.end,
    start:{...sampleMotion(m,r.start)},end:{...sampleMotion(m,r.end)},[endpoint]:{...pose}});
}
