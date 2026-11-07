import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateFilm,snapshotFilm} from '../src/cards/product/film-contract.mjs';
const fixture=()=>JSON.parse(fs.readFileSync(new URL('../examples/product-film.json',import.meta.url))).project;
test('native film roundtrip materializes complete settings without mutating the source',()=>{
 const p=fixture(),before=JSON.stringify(p);assert.equal(validateFilm(p).ok,true);const a=snapshotFilm(p),b=snapshotFilm(JSON.parse(JSON.stringify(a)));assert.deepEqual(a,b);assert.equal(JSON.stringify(p),before);assert.deepEqual(a.tracks.map(t=>t.clips.map(c=>[c.start,c.duration,c.inOffset,c.speed])),p.tracks.map(t=>t.clips.map(c=>[c.start,c.duration,c.inOffset,c.speed])));
});
test('unknown versions and parameters fail rather than silently reinterpret',()=>{
 const p=fixture();p.productFilm.version=2;assert.equal(validateFilm(p).ok,false);assert.throws(()=>snapshotFilm(p));p.productFilm.version=1;p.tracks[2].clips[0].props.perspective=2000;assert.equal(validateFilm(p).ok,false);
});
test('invalid crop, timing, colors, paths and gradient stops are rejected',()=>{
 for(const [key,value]of [['cropWidth',0],['pitch',NaN],['pitch',null],['backgroundColor','red'],['file','../secret.png'],['file',23]]){const p=fixture();p.tracks[2].clips[0].props[key]=value;assert.equal(validateFilm(p).ok,false,key);}
 const p=fixture();p.tracks[1].clips[0].props.softAt=99;assert.equal(validateFilm(p).ok,false);
 const q=fixture();q.tracks[2].clips[0].speed=0;assert.equal(validateFilm(q).ok,false);
});
test('ordinary projects keep their existing contract; malformed film structures fail safely',()=>{
 assert.equal(validateFilm({tracks:[]}).ok,true);assert.equal(validateFilm({tracks:[null]}).ok,false);assert.equal(validateFilm({tracks:[{clips:[null]}]}).ok,false);
});

test('CLI package carries synthetic media and refuses overwriting an existing destination',async()=>{
 const {mkdtempSync,rmSync,readFileSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {spawnSync}=await import('node:child_process');const dir=mkdtempSync(join(tmpdir(),'film-pack-'));
 try{const script=new URL('./product-film.mjs',import.meta.url).pathname,input=new URL('../examples/product-film.json',import.meta.url).pathname,out=join(dir,'bundle');
  const run=()=>spawnSync(process.execPath,[script,'pack',input,out],{encoding:'utf8'});assert.equal(run().status,0);assert.deepEqual(JSON.parse(readFileSync(join(out,'project.json'))),snapshotFilm(fixture()));assert.equal(JSON.parse(readFileSync(join(out,'assets.json'))).length,1);assert.equal(run().status,1);assert.ok(readFileSync(join(out,'public/product-demo/dashboard.svg')).length>0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
