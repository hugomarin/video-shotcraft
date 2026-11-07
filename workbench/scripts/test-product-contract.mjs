import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateProject,portableProject,safeAssetPath} from '../src/cards/product/project-contract.mjs';
const project=()=>({name:'Test',fps:30,width:960,height:600,tracks:[{id:'t',clips:[{id:'c',cardId:'product-optical-scene',start:0,duration:60,speed:1,inOffset:0,opacity:1,scale:1,x:0,y:0,props:{}}]}]});
test('portable output validates and freezes all defaults',()=>{const p=portableProject(project());assert.equal(validateProject(p).ok,true);assert.equal(p.tracks[0].clips[0].props.motion.endFrame,59);assert.equal(p.tracks[0].clips[0].props.src,'product-demo/dashboard.svg');});
test('unsafe assets and incomplete or invalid motion fail before rendering',()=>{
 for(const value of ['../secret.png','/tmp/x','https://x.test/x','a/../x','a\\x'])assert.equal(safeAssetPath(value),false);
 for(const props of [{src:'../secret.png'},{motion:{version:2}},{backgroundColor:'red'},{cameraDistance:-1},{focusQuality:'999'}]){const p=project();p.tracks[0].clips[0].props=props;assert.equal(validateProject(p).ok,false);}
});
test('invalid timing, duplicate IDs and unsupported card IDs are reported',()=>{const p=project();p.tracks[0].clips.push({...p.tracks[0].clips[0],duration:0,speed:0,cardId:'missing'});assert.ok(validateProject(p).errors.length>=4);});
