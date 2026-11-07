import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {importMedia} from './import-media.mjs';
export const mediaImportPlugin=root=>({name:'product-media-import',configureServer(server){
 server.middlewares.use('/api/product-media',async(req,res)=>{
  const send=(status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
  if(req.method!=='POST')return send(405,{error:'Usa POST.'});
  let dir;
  try{
   const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)return send(403,{error:'Origen no permitido.'});
   const name=decodeURIComponent(String(req.headers['x-file-name']??''));const ext=path.extname(name).toLowerCase();if(!['.png','.jpg','.jpeg','.webp','.svg','.mp4','.mov','.webm','.mkv'].includes(ext))throw new Error('Formato no compatible.');
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>200*1024*1024)throw new Error('Máximo 200 MB.');chunks.push(chunk);}
   dir=await mkdtemp(path.join(tmpdir(),'shotcraft-upload-'));const file=path.join(dir,`source${ext}`);await writeFile(file,Buffer.concat(chunks));
   const material=await importMedia(file,root,{start:Number(req.headers['x-trim-start']??0),seconds:Number(req.headers['x-trim-seconds']??30)});
   send(200,material);
  }catch(e){send(400,{error:e.message});}finally{if(dir)await rm(dir,{recursive:true,force:true});}
 });
}});
