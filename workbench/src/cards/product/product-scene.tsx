import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {resolveMotion,sampleMotion} from './motion.mjs';
import type {CameraState} from './optical-scene';
import type {CardDef,PropField} from '../types';
import {createOpticalScene,type OpticalScene,type OpticalSettings} from './optical-scene';

const slider=(key:string,label:string,value:number,min:number,max:number,step=1):PropField=>({type:'slider',key,label,default:value,min,max,step});
const schema:PropField[]=[
 {type:'text',key:'src',label:'Ruta de imagen',default:'product-demo/dashboard.svg'},
 slider('mediaAspect','Proporción',16/10,.5,3,.01),
 {type:'select',key:'projection',label:'Proyección',default:'perspective',options:[{value:'perspective',label:'Perspectiva'},{value:'orthographic',label:'Paralela'}]},
 slider('cameraDistance','Distancia',14.4,8,48,.1),
 {type:'select',key:'focusQuality',label:'Calidad de foco',default:'48',options:[{value:'48',label:'Rápida · 48'},{value:'96',label:'Suave · 96'},{value:'144',label:'Fina · 144'}]},
 slider('yawStart','Giro ↔',15,-70,70,.5),slider('yawEnd','Giro ↔',3,-70,70,.5),
 slider('pitchStart','Inclinación ↕',-12,-70,70,.5),slider('pitchEnd','Inclinación ↕',1,-70,70,.5),
 slider('zoomStart','Encuadre',1.6,.75,2.7,.01),slider('zoomEnd','Encuadre',1.18,.75,2.7,.01),
 slider('panX','Horizontal ↔',0,-2,2,.01),slider('panY','Vertical ↕',0,-1.5,1.5,.01),
 slider('focusU','Horizontal ↔',.59,0,1,.01),slider('focusV','Vertical ↕',.45,0,1,.01),slider('aperture','Desenfoque',.06,0,.3,.005),
 {type:'color',key:'backgroundColor',label:'Color',default:'#1b1f26'},
 {type:'color',key:'fadeColor',label:'Color',default:'#060606'},
 slider('light','Luz',65,0,100),slider('lightX','Posición de luz',63,0,100),slider('grain','Grano',8,0,100),
 slider('shadow','Sombra',44,0,100),slider('shine','Brillo',22,0,100),slider('fade','Fundido',25,0,100),
 slider('vignette','Viñeta',18,0,100),slider('exposure','Exposición',100,50,150),slider('rounding','Bordes',16,0,100),
 {type:'select',key:'maskMode',label:'Máscara',default:'0',options:[{value:'0',label:'Ninguna'},{value:'1',label:'Elíptica'},{value:'2',label:'Vertical'}]},
 slider('maskSize','Extensión',65,0,100),slider('maskSoft','Suavidad',35,0,100),
 {type:'boolean',key:'effectsEnabled',label:'Activar acabado',default:true},
];
const defaults=Object.fromEntries(schema.map(f=>[f.key,f.default]));
export const ProductScene:React.FC<Record<string,unknown>>=(props)=>{
 const p={...defaults,...props},frame=useCurrentFrame(),{width,height,durationInFrames}=useVideoConfig();
 const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<OpticalScene|null>(null);
 const count=Number(p.duration)||durationInFrames;
 const state=(p.__editorPose as CameraState | undefined) ?? sampleMotion(resolveMotion(p,count),frame);
 const effects=Object.fromEntries(['light','lightX','grain','shadow','shine','fade','vignette','exposure','rounding','maskMode','maskSize','maskSoft'].map(k=>[k,Number(p[k])]));
 const settings:OpticalSettings={projection:String(p.projection),cameraDistance:Number(p.cameraDistance),focusQuality:Number(p.focusQuality),src:staticFile(String(p.src)),width,height,start:state,effects,effectsEnabled:Boolean(p.effectsEnabled),layerDepth:0,backgroundColor:String(p.backgroundColor),fadeColor:String(p.fadeColor),mediaAspect:Number(p.mediaAspect)};
 const latest=useRef({settings,state});latest.current={settings,state};
 useEffect(()=>{let disposed=false;const handle=delayRender('Loading product scene');createOpticalScene(canvas.current!,latest.current.settings).then(scene=>{if(disposed){scene.dispose();continueRender(handle);return}engine.current=scene;scene.update(latest.current.settings,latest.current.state);continueRender(handle)}).catch(e=>{if(!disposed)cancelRender(e);else continueRender(handle)});return()=>{disposed=true;engine.current?.dispose();engine.current=null}},[settings.src,width,height]);
 useLayoutEffect(()=>{engine.current?.update(settings,state)});
 return <AbsoluteFill><canvas ref={canvas} style={{width:'100%',height:'100%'}} aria-label="Escena de producto con cámara y enfoque selectivo"/></AbsoluteFill>;
};
export const productSceneCard:CardDef={id:'product-optical-scene',name:'Escena de producto · Cámara y enfoque',nameEn:'Product scene · Camera & focus',category:'Producto',durationInFrames:180,durationProp:'duration',width:1920,height:1200,component:ProductScene,schema,inspectorGroups:[
 {id:'optics',label:'Óptica',fields:['projection','cameraDistance','focusQuality'],open:true},
 {id:'media',label:'Imagen',fields:['src','mediaAspect'],open:true},
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
