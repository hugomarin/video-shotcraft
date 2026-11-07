import {test} from 'node:test';import assert from 'node:assert/strict';
import {applyRecipe,restoreCustom,snapshotProps} from '../src/cards/product/recipes.mjs';
const clip={duration:180,inOffset:0,speed:1};
test('A to B to A is an exact snapshot, without accumulated effects',()=>{
 const custom={src:'sample.svg',mediaAspect:2,grain:92,maskMode:'2',cameraDistance:8};
 const a=applyRecipe(custom,'interface-light',clip),b=applyRecipe(a,'interface-dark',clip),again=applyRecipe(b,'interface-light',clip);
 assert.deepEqual(a,again);assert.equal(a.maskMode,'0');assert.deepEqual(restoreCustom(again),custom);
});
test('snapshots are detached and custom restoration survives JSON',()=>{
 const custom={motion:{version:1,startFrame:0,endFrame:179,start:{},end:{}}};
 const a=applyRecipe(custom,'detail-reveal',clip);custom.motion.start.changed=true;
 assert.equal(a.recipeState.custom.motion.start.changed,undefined);
 const back=restoreCustom(JSON.parse(JSON.stringify(a)));back.motion.start.changed=true;assert.equal(a.recipeState.custom.motion.start.changed,undefined);
});
test('portable snapshot materializes defaults and strips editor/recipe bookkeeping',()=>{
 const s=snapshotProps({src:'sample.svg',__editorPose:{},recipeState:{}});assert.equal(s.src,'sample.svg');assert.equal(s.motion.version,1);assert.equal(s.projection,'perspective');assert.ok(!('__editorPose' in s));assert.ok(!('recipeState' in s));
});
