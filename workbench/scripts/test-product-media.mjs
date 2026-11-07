import {test} from 'node:test';import assert from 'node:assert/strict';
import {mediaFrame,frameSource,validateMedia} from '../src/cards/product/media.mjs';
import {applyRecipe} from '../src/cards/product/recipes.mjs';
const media={version:1,type:'frames',fps:30,frameCount:60,trimStart:10,pattern:'imports/test/frame-%06d.png',audio:'imports/test/audio.wav'};
test('video frame seeking is independent of request order and clamps the final frame',()=>{
 for(const [f,i] of [[0,10],[30,40],[10,20],[30,40],[100,59]])assert.equal(mediaFrame(media,f),i);
 assert.equal(frameSource({media},2),'imports/test/frame-000012.png');
 assert.equal(mediaFrame({...media,fps:60},10),30);
});
test('recipes preserve video content, trim and explicit audio state',()=>{
 const p=applyRecipe({src:'imports/test/frame-000000.png',media,audioEnabled:true},'detail-reveal',{inOffset:0,duration:60,speed:1});
 assert.deepEqual(p.media,media);assert.equal(p.audioEnabled,true);
});
test('unsupported media contracts and exhausted trim are rejected',()=>{
 for(const m of [{...media,version:2},{...media,trimStart:60},{...media,frameCount:0},{...media,fps:0}])assert.throws(()=>validateMedia(m));
});
