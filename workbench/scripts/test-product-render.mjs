#!/usr/bin/env node
// Integration regression: a late clip must read a source frame beyond the entire composition length.
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browserIndex=process.argv.indexOf('--browser');
const browser=browserIndex<0?null:process.argv[browserIndex+1];
const temp=await mkdtemp(path.join(tmpdir(),'shotcraft-source-time-'));
try{
 const assets=path.join(temp,'public');await mkdir(path.join(assets,'frames'),{recursive:true});
 // Red at the beginning; green from source frame 90. No private or checked-in media.
 execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=red:s=160x100:r=30:d=4','-vf',"drawbox=x=0:y=0:w=iw:h=ih:color=lime:t=fill:enable='gte(n,90)'",'-start_number','0',path.join(assets,'frames/frame-%06d.png')]);
 const pose={yaw:0,pitch:0,zoom:1.2,panX:0,panY:0,u:.5,v:.5,aperture:0};
 const props={src:'frames/frame-000000.png',mediaAspect:1.6,effectsEnabled:false,media:{version:1,type:'frames',fps:30,frameCount:120,pattern:'frames/frame-%06d.png'},motion:{version:1,startFrame:0,endFrame:119,start:pose,end:pose}};
 const clip={cardId:'product-optical-scene',inOffset:0,speed:1,opacity:1,scale:1,x:0,y:0,props};
 const project={name:'Source time regression',width:320,height:200,fps:30,tracks:[{id:'t',clips:[{...clip,id:'opening',start:0,duration:4},{...clip,id:'trimmed',start:4,duration:2,inOffset:90,speed:2}]}]};
 const input=path.join(temp,'project.json'),out=path.join(temp,'result.mp4');await writeFile(input,JSON.stringify(project));
 execFileSync(process.execPath,[path.join(root,'scripts/product.mjs'),'render',input,'--assets',assets,'--out',out,...(browser?['--browser',browser]:[])],{cwd:root,stdio:'pipe',maxBuffer:8*1024*1024});
 const pixel=frame=>execFileSync('ffmpeg',['-v','error','-i',out,'-vf',`select=eq(n\\,${frame}),crop=2:2:160:100`,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);
 const first=pixel(0),last=pixel(5);
 assert(first.length>=3&&first[0]>180&&first[1]<60,'Opening must show the red source');
 assert(last.length>=3&&last[1]>180&&last[0]<60,`Late trimmed clip must show green source frame 92, got RGB ${[...last.subarray(0,3)]}`);
 console.log('PASS: MP4 frame 5 reads source frame 92 even though the composition has only 6 frames.');
}finally{await rm(temp,{recursive:true,force:true});}
