import {validateProject} from './project-contract.mjs';
import {planeSchema,captionSchema,fadeSchema} from './film-schema.mjs';
export const FILM_CONTRACT={version:1,projection:'css-parallel',coordinateSpace:'composition-pixels'};
export const filmSchemas={'product-film-plane-v1':planeSchema,'product-film-caption-v1':captionSchema,'product-film-fade-v1':fadeSchema};
export function validateFilm(project){
 const errors=[];
 if(!project || !Array.isArray(project.tracks))return {ok:false,errors:['Project tracks are required']};
 if(project.tracks.some(t=>!t||!Array.isArray(t.clips)||t.clips.some(c=>!c||typeof c!=='object')))return {ok:false,errors:['Invalid tracks/clips']};
 const clips=project.tracks.flatMap(t=>t.clips);
 if(!project.productFilm && !clips.some(c=>c.cardId?.startsWith('product-film-')))return {ok:true,errors};
 for(const [k,v]of Object.entries(FILM_CONTRACT))if(project.productFilm?.[k]!==v)errors.push(`Unsupported productFilm.${k}`);
 for(const k of ['fps','width','height'])if(!Number.isFinite(project[k])||project[k]<=0)errors.push(`Invalid ${k}`);
 for(const c of clips){
  if(!c.cardId?.startsWith('product-film-'))continue;
  const schema=filmSchemas[c.cardId];if(!schema){errors.push(`Unsupported card ${c.cardId}`);continue;}
  for(const k of ['start','duration','inOffset','speed','opacity','scale','x','y'])if(!Number.isFinite(c[k]))errors.push(`${c.id}: invalid ${k}`);
  if(c.duration<2||c.start<0||c.inOffset<0||c.speed<=0||c.scale<=0||c.opacity<0||c.opacity>1)errors.push(`${c.id}: invalid timing/layer`);
  const p=c.props??{};
  if(typeof p!=='object'||Array.isArray(p)){errors.push(`${c.id}: invalid properties`);continue;}
  for(const k of Object.keys(p))if(!schema.some(f=>f.key===k))errors.push(`${c.id}: unsupported property ${k}`);
  for(const f of schema){const v=Object.hasOwn(p,f.key)?p[f.key]:f.default;
   if(['number','slider'].includes(f.type)){if(!Number.isFinite(v)||(f.min!==undefined&&v<f.min)||(f.max!==undefined&&v>f.max))errors.push(`${c.id}: invalid ${f.key}`);}
   else if(f.type==='boolean'){if(typeof v!=='boolean')errors.push(`${c.id}: invalid ${f.key}`);}
   else if(typeof v!=='string'||(f.type==='select'&&!f.options.some(o=>o.value===v))||(f.type==='color'&&!/^#[0-9a-f]{6}$/i.test(v)))errors.push(`${c.id}: invalid ${f.key}`);
  }
  if(typeof p.file==='string' && p.file && (/^(?:[a-z]+:|\/|\\)/i.test(p.file)||p.file.split(/[\\/]/).includes('..')))errors.push(`${c.id}: asset must be a public-relative path`);
  if(c.cardId==='product-film-fade-v1'){
   const v=Object.fromEntries(schema.map(f=>[f.key,p[f.key]??f.default]));
   if(!(v.clearAt<=v.softAt&&v.softAt<=v.strongAt&&v.strongAt<=v.solidAt))errors.push(`${c.id}: gradient stops must be ordered`);
  }
 }
 const optical={...project,tracks:project.tracks.map(t=>({...t,clips:t.clips.filter(c=>c.cardId==='product-optical-scene')}))};
 if(optical.tracks.some(t=>t.clips.length))errors.push(...validateProject(optical).errors);
 return {ok:errors.length===0,errors};
}
export function snapshotFilm(project){
 const check=validateFilm(project);if(!check.ok)throw new Error(check.errors.join('\n'));
 const copy=JSON.parse(JSON.stringify(project));
 for(const t of copy.tracks)for(const c of t.clips){const schema=filmSchemas[c.cardId];if(schema)c.props={...Object.fromEntries(schema.map(f=>[f.key,f.default])),...c.props};}
 return copy;
}
