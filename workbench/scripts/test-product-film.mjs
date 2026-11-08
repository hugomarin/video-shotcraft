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

test('focus follows CSS plane depth, disables on a frontal plane and is finite at extreme tilts',async()=>{
 const {planeFocus}=await import('../src/cards/product/film-focus.mjs');
 const base={pitch:0,yaw:0,roll:0,cropWidth:800,cropHeight:500,focusU:.5,focusV:.5,focusWidth:.2,aperture:10};
 assert.equal(planeFocus(base).blur,0);
 const pitched=planeFocus({...base,pitch:30});assert.ok(pitched.blur>0);assert.ok(pitched.mask.startsWith('linear-gradient(180deg'));
 const turned=planeFocus({...base,pitch:30,roll:90});assert.ok(turned.mask.startsWith('linear-gradient(90.00000000000001deg')||turned.mask.startsWith('linear-gradient(90deg'));
 const focused=planeFocus({...base,pitch:30,focusV:.8});assert.notEqual(focused.mask,pitched.mask);
 for(const pitch of [-85,0,85])for(const yaw of [-85,0,85]){const f=planeFocus({...base,pitch,yaw,roll:179});assert.ok(Number.isFinite(f.blur));assert.ok(!f.mask.includes('NaN'));}
});
test('old film JSON gets neutral finishes and enabled effects persist without changing framing',()=>{
 const p=fixture();const before=structuredClone(p.tracks[2].clips[0].props);const plain=snapshotFilm(p);const props=plain.tracks[2].clips[0].props;
 assert.equal(props.aperture,0);assert.equal(props.exposure,100);assert.equal(props.shadow,0);assert.equal(props.fade,0);
 Object.assign(props,{aperture:8,focusU:.3,focusV:.6,light:25,shadow:20,shine:10,grain:8,exposure:110,fadeColor:'#112233',backgroundColor:'#334455',effectsEnabled:false});
 const restored=snapshotFilm(JSON.parse(JSON.stringify(plain)));assert.deepEqual(restored,plain);for(const k of ['pitch','yaw','roll','anchorX','centerX','cropX','scaleStart'])assert.equal(props[k],before[k]);
 props.effectsEnabled='false';assert.equal(validateFilm(plain).ok,false);
});

test('mask controls round-trip and bypass without changing existing geometry',async()=>{
 const {planeMask}=await import('../src/cards/product/film-mask.mjs');
 assert.equal(planeMask('0',65,35),undefined);
 assert.equal(planeMask('2',65,35,false),undefined);
 for(const mode of ['1','2']) {
  const p=snapshotFilm(fixture());const props=p.tracks[2].clips[0].props;
  Object.assign(props,{maskMode:mode,maskSize:47,maskSoft:24});
  assert.deepEqual(snapshotFilm(JSON.parse(JSON.stringify(p))),p);
  for(const size of [0,100])for(const soft of [0,100])assert.ok(!planeMask(mode,size,soft).includes('NaN'));
 }
 const p=fixture();p.tracks[2].clips[0].props.maskMode='3';assert.equal(validateFilm(p).ok,false);
});

test('prototype orientation matches the Y-up prototype basis after CSS axis conversion',async()=>{
 const {planeOrientation}=await import('../src/cards/product/film-orientation.mjs');
 const {Matrix4,Vector3}=await import('three');
 for(const pitch of [-27,0,27])for(const yaw of [-36,0,36]){
  const r=Math.PI/180, proto=new Matrix4().makeRotationY(yaw*r).multiply(new Matrix4().makeRotationX(pitch*r));
  const css=new Matrix4().makeRotationY(yaw*r).multiply(new Matrix4().makeRotationX(-pitch*r));
  for(const [x,y]of [[1,0],[0,1],[.3,.7]]){
   const a=new Vector3(x,-y,0).applyMatrix4(proto),b=new Vector3(x,y,0).applyMatrix4(css);
   assert.ok(Math.abs(a.x-b.x)<1e-10);assert.ok(Math.abs(a.y+b.y)<1e-10);assert.ok(Math.abs(a.z-b.z)<1e-10);
  }
  assert.equal(planeOrientation('prototype',pitch,yaw,0),`rotateY(${yaw}deg) rotateX(${-pitch}deg) rotateZ(0deg)`);
 }
 assert.equal(planeOrientation('legacy',18,-10,-7),'rotateX(18deg) rotateY(-10deg) rotateZ(-7deg)');
 const p=snapshotFilm(fixture());assert.equal(p.tracks[2].clips[0].props.cameraModel,'legacy');
 p.tracks[2].clips[0].props.cameraModel='prototype';assert.deepEqual(snapshotFilm(JSON.parse(JSON.stringify(p))),p);
});
