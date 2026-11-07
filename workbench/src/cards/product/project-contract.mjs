import {schema} from './schema.mjs';
import {resolveMotion,clipMotionRange} from './motion.mjs';
import {resolveOptics} from './optics.mjs';
import {snapshotProps} from './recipes.mjs';
export const safeAssetPath=s=>typeof s==='string' && s.length>0 && !s.startsWith('/') && !s.includes('\\') && !s.split('/').some(x=>x==='..'||x==='.') && !/[:?#\u0000-\u001f]/.test(s);
export function validateProject(input) {
 const p=input?.project??input;
 const errors=[];const fail=s=>errors.push(s);
 if(!p||typeof p!=='object')return {ok:false,errors:['Proyecto ausente.']};
 for(const key of ['width','height','fps'])if(!Number.isInteger(p[key])||p[key]<1||p[key]>(key==='fps'?120:8192))fail(`${key}: entero fuera de rango.`);
 if(!Array.isArray(p.tracks))return {ok:false,errors:[...errors,'tracks debe ser una lista.']};
 const ids=new Set();
 for(const track of p.tracks){
  if(!Array.isArray(track?.clips)){fail('Pista sin clips.');continue;}
  for(const c of track.clips){
   if(!c||typeof c!=='object'){fail('Clip inválido.');continue;}
   if(typeof c.id!=='string'||ids.has(c.id))fail('ID de clip ausente o duplicado.');ids.add(c.id);
   for(const k of ['start','duration'])if(!Number.isInteger(c[k])||c[k]<(k==='duration'?2:0))fail(`${c.id}.${k}: entero fuera de rango.`);
   if(!Number.isFinite(c.speed)||c.speed<=0||c.speed>4)fail(`${c.id}.speed inválido.`);
   if(!Number.isFinite(c.inOffset)||c.inOffset<0)fail(`${c.id}.inOffset inválido.`);
   for(const k of ['opacity','scale','x','y'])if(!Number.isFinite(c[k]))fail(`${c.id}.${k} inválido.`);
   if(c.cardId!=='product-optical-scene'){fail(`${c.id}: esta herramienta valida exclusivamente escenas de producto.`);continue;}
   if(!c.props||typeof c.props!=='object'||Array.isArray(c.props)){fail(`${c.id}: props inválidas.`);continue;}
   const props=c.props;
   for(const f of schema){const v=props[f.key];if(v===undefined)continue;
    if(f.type==='slider'&&(!Number.isFinite(v)||v<f.min||v>f.max))fail(`${c.id}.${f.key}: fuera de rango.`);
    if(f.type==='color'&&(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))fail(`${c.id}.${f.key}: color hexadecimal inválido.`);
    if(f.type==='select'&&!f.options.some(o=>o.value===v))fail(`${c.id}.${f.key}: opción inválida.`);
    if(f.type==='boolean'&&typeof v!=='boolean')fail(`${c.id}.${f.key}: booleano requerido.`);
    if(f.type==='text'&&typeof v!=='string')fail(`${c.id}.${f.key}: texto requerido.`);
   }
   if(props.src!==undefined&&!safeAssetPath(props.src))fail(`${c.id}.src: usa una ruta relativa de public.`);
   if('__editorPose' in props)fail(`${c.id}: la vista de prueba no pertenece al proyecto guardado.`);
   try {resolveMotion(props,clipMotionRange(c).duration);resolveOptics({...props,focusQuality:props.focusQuality===undefined?48:Number(props.focusQuality)},{zoom:1,aperture:0});}catch(e){fail(`${c.id}: ${e.message}`);}
  }
 }
 return {ok:errors.length===0,errors};
}
export function portableProject(input){
 const p=input.project??input;const result=validateProject(p);if(!result.ok)throw new Error(result.errors.join('\n'));
 return {...p,tracks:p.tracks.map(t=>({...t,clips:t.clips.map(c=>({...c,props:snapshotProps(c.props,clipMotionRange(c).duration)}))}))};
}
