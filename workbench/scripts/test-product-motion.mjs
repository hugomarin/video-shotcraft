import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveMotion,sampleMotion,fixEndpoint,validateMotion} from '../src/cards/product/motion.mjs';

test('legacy scenes retain their original cosine motion and fixed focus',()=>{
 const p={yawStart:20,yawEnd:-10,pitchStart:-15,pitchEnd:5,zoomStart:1.7,zoomEnd:1.1,panX:.2,focusU:.7};
 for(const frame of [0,1,45,90,179,300]){
  const pose=sampleMotion(resolveMotion(p,180),frame),e=(1-Math.cos(Math.min(1,frame/179)*Math.PI))/2;
  assert.equal(pose.yaw,20+(-10-20)*e);assert.equal(pose.panX,.2);assert.equal(pose.u,.7);
 }
});
test('capturing a trimmed, retimed endpoint preserves the other visible endpoint and input',()=>{
 const clip={inOffset:25,duration:61,speed:1.5},props={panX:.4};
 const old=resolveMotion(props,117),pose={...sampleMotion(old,50),panX:-.5,u:.2};
 const next=fixEndpoint(props,clip,'end',pose);
 assert.equal(next.startFrame,25);assert.equal(next.endFrame,115);
 assert.deepEqual(next.start,sampleMotion(old,25));assert.deepEqual(sampleMotion(next,115),pose);
 pose.u=.8;assert.equal(next.end.u,.2);assert.deepEqual(props,{panX:.4});
});
test('motion survives JSON round trip and out-of-order seeking',()=>{
 const clip={inOffset:0,duration:180,speed:1};const a=resolveMotion();
 const m=fixEndpoint({},clip,'end',{...a.end,panY:.6,u:.2,v:.8,aperture:.12});
 const copy=JSON.parse(JSON.stringify(m));
 for(const f of [179,0,90,45,90])assert.deepEqual(sampleMotion(m,f),sampleMotion(copy,f));
 assert.equal(sampleMotion(m,-10).u,m.start.u);assert.equal(sampleMotion(m,500).u,.2);
 assert.ok(sampleMotion(m,90).u< m.start.u);
});
test('unknown versions, invalid poses and zero intervals fail explicitly',()=>{
 const m=resolveMotion();
 for(const invalid of [{...m,version:2},{...m,endFrame:0},{...m,start:{...m.start,u:2}},{...m,end:{...m.end,zoom:NaN}}])assert.throws(()=>validateMotion(invalid));
});
