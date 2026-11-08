import {mkdir,writeFile} from 'node:fs/promises';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {importMedia} from './import-media.mjs';import {applyRecipe} from '../src/cards/product/recipes.mjs';import {portableProject} from '../src/cards/product/project-contract.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'exports');await mkdir(out,{recursive:true});const input=path.join(out,'synthetic-input.mp4');
await promisify(execFile)('ffmpeg',['-v','error','-f','lavfi','-i','testsrc2=size=640x400:rate=30','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','2','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-y',input]);
const {durationFrames,width,height,...material}=await importMedia(input,root,{seconds:2});
const clip={id:'video-shot',cardId:'product-optical-scene',start:0,duration:durationFrames,inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{}};clip.props=applyRecipe({...material,audioEnabled:true},'interface-light',clip);
const project=portableProject({name:'Synthetic video test',fps:30,width:960,height:600,tracks:[{id:'video',name:'Video',clips:[clip]}]});await writeFile(path.join(out,'video-example.json'),JSON.stringify(project,null,2)+'\n');console.log(path.join(out,'video-example.json'));
