#!/usr/bin/env node
import {referencedAssets} from './pack-project.mjs';
import {fileURLToPath} from 'node:url';import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {FILM_CONTRACT,filmSchemas,snapshotFilm} from '../src/cards/product/film-contract.mjs';
const [command,input,output]=process.argv.slice(2);
try{
 if(command==='catalog'){console.log(JSON.stringify({contract:FILM_CONTRACT,units:{time:'project frames',position:'composition pixels',crop:'source pixels at sourceWidth',angles:'degrees',scale:'unitless'},cards:filmSchemas},null,2));}
 else{
  if(!['validate','snapshot','pack'].includes(command)||!input)throw new Error('Usage: product-film.mjs catalog | validate INPUT | snapshot INPUT OUTPUT | pack INPUT OUTPUT_DIR');
  const raw=JSON.parse(fs.readFileSync(input,'utf8')),project=snapshotFilm(raw.project??raw);
  if(!project.productFilm)throw new Error('A versioned productFilm contract is required');
  if(command==='validate')console.log('Valid product film');
  if(command==='snapshot'){if(!output)throw new Error('Output required');fs.writeFileSync(output,JSON.stringify(project,null,2),{flag:'wx'});}
  if(command==='pack'){
   if(!output)throw new Error('Output directory required');if(fs.existsSync(output))throw new Error('Output exists');
   if(project.tracks.some(t=>t.clips.some(c=>!filmSchemas[c.cardId] && c.cardId!=='audio-clip' && c.cardId!=='product-optical-scene')))throw new Error('Pack supports film-v1, optical scenes and audio-clip only; no assets will be silently omitted');
   const base=fileURLToPath(new URL('../public/',import.meta.url));
   const optical={tracks:project.tracks.map(t=>({...t,clips:t.clips.filter(c=>c.cardId==='product-optical-scene')}))};
   const files=[...new Set([...referencedAssets(optical),...project.tracks.flatMap(t=>t.clips.flatMap(c=>c.props.file?[c.props.file]:[]))])];
   const assets=files.map(file=>{if(typeof file!=='string'||/^(?:[a-z]+:|\/|\\)/i.test(file)||file.split(/[\\/]/).includes('..'))throw new Error('Asset must be public-relative');const src=path.join(base,file);const bytes=fs.readFileSync(src);return {file,bytes,sha256:createHash('sha256').update(bytes).digest('hex')};});
   fs.mkdirSync(output,{recursive:true});
   try{for(const {file,bytes}of assets){const dest=path.join(output,'public',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);}
    fs.writeFileSync(path.join(output,'project.json'),JSON.stringify(project,null,2));fs.writeFileSync(path.join(output,'assets.json'),JSON.stringify(assets.map(({file,bytes,sha256})=>({file,size:bytes.length,sha256})),null,2));
   }catch(e){fs.rmSync(output,{recursive:true,force:true});throw e;}
   console.log(`Packed ${assets.length} assets`);
  }
 }
}catch(e){console.error(e.message);process.exitCode=1;}
