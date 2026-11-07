import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {frameSource} from './media.mjs';
import {schema,defaults} from './schema.mjs';
import {resolveMotion,sampleMotion} from './motion.mjs';
import type {CameraState} from './optical-scene';
import type {CardDef} from '../types';
import {createOpticalScene,type OpticalScene,type OpticalSettings} from './optical-scene';

export const ProductScene:React.FC<Record<string,unknown>>=(props)=>{
 const p={...defaults,...props},localFrame=useCurrentFrame(),{width,height,durationInFrames}=useVideoConfig();
 const frame=Math.max(0,Number(props.__sourceOffset??0)+localFrame*Number(props.__sourceSpeed??1));
 const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<OpticalScene|null>(null);
 const count=Number(p.duration)||durationInFrames;
 const state=(p.__editorPose as CameraState | undefined) ?? sampleMotion(resolveMotion(p,count),frame);
 const effects=Object.fromEntries(['light','lightX','grain','shadow','shine','fade','vignette','exposure','rounding','maskMode','maskSize','maskSoft'].map(k=>[k,Number(p[k])]));
 const settings:OpticalSettings={projection:String(p.projection),cameraDistance:Number(p.cameraDistance),focusQuality:Number(p.focusQuality),src:staticFile(String(frameSource(p,frame))),width,height,start:state,effects,effectsEnabled:Boolean(p.effectsEnabled),layerDepth:0,backgroundColor:String(p.backgroundColor),fadeColor:String(p.fadeColor),mediaAspect:Number(p.mediaAspect)};
 const latest=useRef({settings,state});latest.current={settings,state};
 useEffect(()=>{let disposed=false;const handle=delayRender('Loading product scene');
  createOpticalScene(canvas.current!,latest.current.settings).then(async scene=>{
   if(disposed){scene.dispose();continueRender(handle);return;}
   engine.current=scene;await scene.setSource(latest.current.settings.src);
   if(!disposed)scene.update(latest.current.settings,latest.current.state);continueRender(handle);
  }).catch(e=>{if(!disposed)cancelRender(e);else continueRender(handle);});
  return()=>{disposed=true;engine.current?.dispose();engine.current=null;};
 },[width,height]);
 useEffect(()=>{const scene=engine.current;if(!scene)return;let disposed=false;
  const handle=delayRender('Loading product frame');
  scene.setSource(settings.src).then(()=>{if(!disposed)scene.update(latest.current.settings,latest.current.state);continueRender(handle);})
   .catch(e=>{if(!disposed)cancelRender(e);else continueRender(handle);});
  return()=>{disposed=true;};
 },[settings.src]);
 useLayoutEffect(()=>{engine.current?.update(settings,state)});
 return <AbsoluteFill><canvas ref={canvas} style={{width:'100%',height:'100%'}} aria-label="Escena de producto con cámara y enfoque selectivo"/></AbsoluteFill>;
};
export const productSceneCard:CardDef={id:'product-optical-scene',name:'Escena de producto · Cámara y enfoque',nameEn:'Product scene · Camera & focus',category:'Producto',durationInFrames:180,durationProp:'duration',width:1920,height:1200,component:ProductScene,schema,inspectorGroups:[
 {id:'optics',label:'Óptica',fields:['projection','cameraDistance','focusQuality'],open:true},
 {id:'media',label:'Imagen',fields:['src','mediaAspect','audioEnabled'],open:true},
 {id:'start',label:'Cámara · inicio',fields:['yawStart','pitchStart','zoomStart'],open:true},
 {id:'end',label:'Cámara · final',fields:['yawEnd','pitchEnd','zoomEnd']},
 {id:'position',label:'Posición',fields:['panX','panY']},
 {id:'focus',label:'Enfoque',fields:['focusU','focusV','aperture'],open:true},
 {id:'finish',label:'Acabado',fields:['effectsEnabled']},
 {id:'background',label:'Fondo',fields:['backgroundColor','light','lightX','grain']},
 {id:'surface',label:'Superficie',fields:['shadow','shine','exposure','rounding']},
 {id:'fade',label:'Fundido y viñeta',fields:['fadeColor','fade','vignette']},
 {id:'mask',label:'Máscara',fields:['maskMode','maskSize','maskSoft']},
],accent:'#7561d6',summaryEn:'Product interface, optical focus, camera movement and editable finish.'};
