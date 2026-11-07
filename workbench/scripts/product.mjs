#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {capturePage} from './capture-page.mjs';
import {packProject} from './pack-project.mjs';
import {importMedia} from './import-media.mjs';
import {schema} from '../src/cards/product/schema.mjs';
import {poseFields} from '../src/cards/product/motion.mjs';
import {recipes,applyRecipe} from '../src/cards/product/recipes.mjs';
import {validateProject,portableProject,safeAssetPath} from '../src/cards/product/project-contract.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [command,...args]=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(`--${name}`);if(i<0)return fallback;if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(`Falta --${name}`);return args[i+1];};
const output=v=>console.log(JSON.stringify(v,null,2));
const read=()=>JSON.parse(readFileSync(path.resolve(args[0]),'utf8'));
const checkAssets=p=>{for(const t of p.tracks)for(const c of t.clips){
 const files=[c.props.src??'product-demo/dashboard.svg'];const m=c.props.media;
 if(m){for(let i=0;i<m.frameCount;i++)files.push(m.pattern.replace('%06d',String(i).padStart(6,'0')));if(m.audio)files.push(m.audio);}
 for(const src of files)if(!safeAssetPath(src)||!existsSync(path.join(option('assets',path.join(root,'public')),src)))throw new Error(`Material no encontrado en public: ${src}`);
}};
try {
 if(command==='catalog')output({version:1,description:'Crea y dirige escenas de producto con imagen o secuencia de video en un plano; no infiere capas ni modifica automáticamente el contenido.',recipes,fields:schema,motion:{version:1,time:'source frames; trim and speed are applied by the timeline',interpolation:'cosine ease-in-out',fields:poseFields,focus:'u/v are 0–1 image coordinates, origin top-left; aperture is artistic, not a physical f-number'},operations:[
  {command:'capture --url URL --out JSON [--recipe ID --browser PATH --width PX --height PX --wait MS]',purpose:'Captura estática del viewport de una página HTTP(S) pública o autorizada en un perfil limpio. No usa cuentas personales ni ejecuta acciones sobre la página.'},
  {command:'pack FILE --out DIRECTORY [--assets DIRECTORY]',purpose:'Empaquetar JSON completo y solo sus materiales referenciados, con manifiesto de hashes. No incluye código del motor.'},
  {command:'import --input FILE --out JSON [--start SECONDS --seconds SECONDS --recipe ID]',purpose:'Preparar imagen/video local. Video se decodifica a 30 fps, con audio opcional desactivado por defecto; máximo 120 segundos y 200 MB.'},
  {command:'create --asset PATH --recipe ID --out FILE',purpose:'Crear un proyecto editable a partir de una receta y material local en public.'},
  {command:'validate FILE',purpose:'Validar estructura, movimiento, óptica y existencia de materiales antes del render.'},
  {command:'snapshot FILE --out FILE',purpose:'Materializar todos los valores predeterminados y quitar estado temporal de recetas para reutilizar la pieza.'},
  {command:'render FILE --out FILE [--browser PATH]',purpose:'Renderizar el proyecto validado por frame usando Remotion.'}
 ]});
 else if(command==='capture'){
  const url=option('url'),out=option('out');if(!url||!out||existsSync(out))throw new Error('Indica --url y un --out nuevo.');
  const {material,capture}=await capturePage(url,root,{browser:option('browser'),width:Number(option('width','1600')),height:Number(option('height','1000')),waitMs:Number(option('wait','1000'))});
  const clip={id:'product-shot',cardId:'product-optical-scene',start:0,duration:180,inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{}};clip.props=applyRecipe({src:material.src,mediaAspect:material.mediaAspect},option('recipe','interface-light'),clip);
  const project=portableProject({name:'Captured product',fps:30,width:1920,height:1200,tracks:[{id:'product-track',name:'Producto',clips:[clip]}]});writeFileSync(out,JSON.stringify(project,null,2)+'\n');output({ok:true,file:path.resolve(out),capture});
 }else if(command==='pack'){const out=option('out');if(!out)throw new Error('Indica --out.');output(await packProject(read(),path.resolve(option('assets',path.join(root,'public'))),path.resolve(out)));
 }else if(command==='import'){
  const input=option('input'),out=option('out');if(!input||!out||existsSync(out))throw new Error('Indica --input y un --out nuevo.');
  const material=await importMedia(path.resolve(input),root,{start:Number(option('start','0')),seconds:Number(option('seconds','30'))});
  const clip={id:'product-shot',cardId:'product-optical-scene',start:0,duration:Math.max(2,material.durationFrames??180),inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{}};
  const {durationFrames,width,height,...props}=material;clip.props=applyRecipe(props,option('recipe','interface-light'),clip);
  const project=portableProject({name:'Imported product',fps:30,width:1920,height:1200,tracks:[{id:'product-track',name:'Producto',clips:[clip]}]});
  writeFileSync(out,JSON.stringify(project,null,2)+'\n');output({ok:true,file:path.resolve(out),material});
 }else if(command==='create'){
  const src=option('asset','product-demo/dashboard.svg'),duration=Number(option('frames','180'));
  if(!safeAssetPath(src))throw new Error('Asset debe ser relativo a public.');
  const clip={id:'product-shot',cardId:'product-optical-scene',start:0,duration,inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{}};
  clip.props=applyRecipe({src,mediaAspect:Number(option('aspect','1.6'))},option('recipe','interface-light'),clip);
  const project=portableProject({name:'Product film',fps:30,width:1920,height:1200,tracks:[{id:'product-track',name:'Producto',clips:[clip]}]});checkAssets(project);
  const out=option('out');if(!out)throw new Error('Indica --out.');if(existsSync(out))throw new Error('El archivo de salida ya existe.');writeFileSync(out,JSON.stringify(project,null,2)+'\n');output({ok:true,file:path.resolve(out)});
 }else if(['validate','snapshot','render'].includes(command)){
  const project=portableProject(read());checkAssets(project);
  if(command==='validate')output(validateProject(project));
  if(command==='snapshot'){const out=option('out');if(!out||existsSync(out))throw new Error('--out debe ser un archivo nuevo.');writeFileSync(out,JSON.stringify(project,null,2)+'\n');output({ok:true,file:path.resolve(out)});}
  if(command==='render'){
   const out=option('out');if(!out||existsSync(out))throw new Error('--out debe ser un archivo nuevo.');
   const browser=option('browser');const cmd=['src/remotion/index.ts','Main',path.resolve(out),'--codec=h264',`--props=${JSON.stringify({project,renderExact:true})}`];if(browser)cmd.push(`--browser-executable=${browser}`);const assets=option('assets');if(assets)cmd.push(`--public-dir=${path.resolve(assets)}`);
   const result=spawnSync(path.join(root,'node_modules','.bin','remotion'),['render',...cmd],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;process.exitCode=result.status??1;
  }
 }else throw new Error('Usa catalog, capture, import, create, validate, snapshot, pack o render. Consulta catalog para parámetros.');
}catch(e){console.error(JSON.stringify({ok:false,error:e.message}));process.exitCode=1;}
