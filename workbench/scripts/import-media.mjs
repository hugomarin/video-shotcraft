import {readFile,writeFile,mkdir,copyFile,readdir,rename,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const run=promisify(execFile);
export async function importMedia(input,root,{start=0,seconds=30}={}) {
 if(!Number.isFinite(start)||start<0||!Number.isFinite(seconds)||seconds<=0||seconds>120)throw new Error('Recorte inválido: duración máxima de importación 120 s.');
 const bytes=await readFile(input);if(bytes.length>200*1024*1024)throw new Error('El archivo supera 200 MB.');
 const ext=path.extname(input).toLowerCase();
 const id=createHash('sha256').update(bytes).update(JSON.stringify({version:1,start,seconds})).digest('hex').slice(0,20);
 const base=path.join(root,'public','imports'),dest=path.join(base,id),metaFile=path.join(dest,'media.json');
 if(existsSync(metaFile))return JSON.parse(await readFile(metaFile,'utf8'));
 await mkdir(base,{recursive:true});const temp=path.join(base,`.pending-${randomUUID()}`);await mkdir(temp);
 try {
  let width,height,duration,audio=false,isImage=['.png','.jpg','.jpeg','.webp','.svg'].includes(ext);
  if(ext==='.svg'){
   const s=bytes.toString('utf8');const vb=s.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i);width=Number(s.match(/<svg[^>]*\bwidth=["']([\d.]+)/i)?.[1]??vb?.[1]);height=Number(s.match(/<svg[^>]*\bheight=["']([\d.]+)/i)?.[1]??vb?.[2]);
  }else{
   const {stdout}=await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',input]);const info=JSON.parse(stdout);const v=info.streams.find(s=>s.codec_type==='video');if(!v)throw new Error('No hay imagen ni video en el archivo.');width=v.width;height=v.height;duration=Number(info.format.duration);audio=info.streams.some(s=>s.codec_type==='audio');
  }
  if(!(width>0&&height>0)||width>8192||height>8192)throw new Error('Dimensiones no compatibles.');
  let result;
  if(isImage){const name=`image${ext}`;await copyFile(input,path.join(temp,name));result={src:`imports/${id}/${name}`,mediaAspect:width/height,width,height};}
  else {
   if(!Number.isFinite(duration)||duration<=start)throw new Error('Inicio fuera de la duración del video.');
   const length=Math.min(seconds,duration-start);
   await run('ffmpeg',['-v','error','-ss',String(start),'-i',input,'-t',String(length),'-vf','fps=30,scale=w=min(1920\\,iw):h=-2','-start_number','0',path.join(temp,'frame-%06d.png')],{maxBuffer:2*1024*1024});
   const frameCount=(await readdir(temp)).filter(f=>/^frame-\d{6}\.png$/.test(f)).length;if(!frameCount)throw new Error('No se pudieron extraer frames.');
   if(audio)await run('ffmpeg',['-v','error','-ss',String(start),'-i',input,'-t',String(length),'-map','0:a:0','-vn','-ar','48000','-c:a','pcm_s16le',path.join(temp,'audio.wav')],{maxBuffer:2*1024*1024});
   // Read actual extracted dimensions (rotation metadata/scaling may have changed them).
   const probe=JSON.parse((await run('ffprobe',['-v','error','-show_streams','-of','json',path.join(temp,'frame-000000.png')])).stdout).streams[0];
   result={src:`imports/${id}/frame-000000.png`,mediaAspect:probe.width/probe.height,width:probe.width,height:probe.height,media:{version:1,type:'frames',fps:30,frameCount,pattern:`imports/${id}/frame-%06d.png`,trimStart:0,...(audio?{audio:`imports/${id}/audio.wav`}:{})},audioEnabled:false,durationFrames:frameCount};
  }
  await writeFile(path.join(temp,'media.json'),JSON.stringify(result,null,2));
  try{await rename(temp,dest);}catch(e){if(existsSync(metaFile)){await rm(temp,{recursive:true,force:true});return JSON.parse(await readFile(metaFile,'utf8'));}throw e;}
  return result;
 }catch(e){await rm(temp,{recursive:true,force:true});throw e;}
}
