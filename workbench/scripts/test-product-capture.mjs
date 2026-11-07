import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,readFile,rm,mkdir} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';
import {captureOptions} from './capture-page.mjs';import {packProject} from './pack-project.mjs';
const project={name:'Portable',fps:30,width:960,height:600,tracks:[{id:'t',clips:[{id:'c',cardId:'product-optical-scene',start:0,duration:60,inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props:{src:'demo.svg'}}]}]};
test('capture rejects non-web URLs, embedded credentials and unbounded viewports',()=>{
 for(const url of ['file:///etc/passwd','data:text/html,test','https://user:pass@example.com'])assert.throws(()=>captureOptions(url));
 assert.throws(()=>captureOptions('https://example.com',{width:99999}));assert.equal(captureOptions('http://localhost:5199').url,'http://localhost:5199/');
});
test('pack copies only referenced material and records hashes without overwriting',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'product-pack-test-'));try{
  await mkdir(path.join(dir,'assets'));await writeFile(path.join(dir,'assets','demo.svg'),'<svg/>');await writeFile(path.join(dir,'assets','private.txt'),'not referenced');
  const out=path.join(dir,'bundle');await packProject(project,path.join(dir,'assets'),out);const manifest=JSON.parse(await readFile(path.join(out,'manifest.json'),'utf8'));assert.equal(manifest.assets.length,1);assert.equal(manifest.assets[0].sha256.length,64);
  assert.equal((JSON.parse(await readFile(path.join(out,'project.json'),'utf8'))).tracks[0].clips[0].props.motion.version,1);
  await assert.rejects(packProject(project,path.join(dir,'assets'),out));
 }finally{await rm(dir,{recursive:true,force:true});}
});
