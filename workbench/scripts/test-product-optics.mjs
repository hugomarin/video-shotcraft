import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveOptics} from '../src/cards/product/optics.mjs';
test('legacy settings retain the previous optical constants',()=>{
 const o=resolveOptics({}, {zoom:1.6,aperture:.06});
 assert.equal(o.distance,14.4);assert.equal(o.lens,6.3*1.6);assert.equal(o.aperture,.06*9);assert.equal(o.samples,48);assert.equal(o.orthographic,0);
});
test('distance changes perspective without changing centre-plane framing',()=>{
 const pose={zoom:1.3,aperture:.08},base=resolveOptics({},pose);
 for(const d of [8,24,48]){const o=resolveOptics({cameraDistance:d},pose);assert.ok(Math.abs(o.lens/o.distance-base.lens/base.distance)<1e-12);assert.ok(Math.abs(o.aperture/o.distance-base.aperture/base.distance)<1e-12);}
});
test('parallel projection and sampling quality are explicit and validated',()=>{
 assert.equal(resolveOptics({projection:'orthographic',focusQuality:144},{zoom:1,aperture:0}).orthographic,1);
 for(const s of [{cameraDistance:0},{cameraDistance:NaN},{focusQuality:0},{projection:'unknown'}])assert.throws(()=>resolveOptics(s,{zoom:1,aperture:0}));
});
