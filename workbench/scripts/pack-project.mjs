import {mkdir,copyFile,writeFile,readFile,rm,rename} from 'node:fs/promises';import {existsSync} from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
import {portableProject,safeAssetPath} from '../src/cards/product/project-contract.mjs';
export function referencedAssets(project){
 const files=new Set();for(const t of project.tracks)for(const c of t.clips){files.add(c.props.src??'product-demo/dashboard.svg');const m=c.props.media;if(m){for(let i=0;i<m.frameCount;i++)files.add(m.pattern.replace('%06d',String(i).padStart(6,'0')));if(m.audio)files.add(m.audio);}}
 for(const f of files)if(!safeAssetPath(f))throw new Error(`Ruta no portable: ${f}`);return [...files].sort();
}
export async function packProject(input,assetsRoot,out){
 if(existsSync(out))throw new Error('El destino ya existe.');const project=portableProject(input);const temp=`${out}.pending-${randomUUID()}`;await mkdir(temp,{recursive:true});
 try{const assets=[];for(const file of referencedAssets(project)){const source=path.join(assetsRoot,file),dest=path.join(temp,'public',file);await mkdir(path.dirname(dest),{recursive:true});await copyFile(source,dest);const bytes=await readFile(dest);assets.push({path:file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
 await writeFile(path.join(temp,'project.json'),JSON.stringify(project,null,2)+'\n');await writeFile(path.join(temp,'manifest.json'),JSON.stringify({version:1,assets},null,2)+'\n');await rename(temp,out);return {ok:true,directory:out,files:assets.length};
 }catch(e){await rm(temp,{recursive:true,force:true});throw e;}
}
