import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {AbsoluteFill,useCurrentFrame,useVideoConfig,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import type {CardDef,PropField} from '../types';
import {createOpticalScene,type OpticalScene,type OpticalSettings} from './optical-scene';

const slider=(key:string,label:string,value:number,min:number,max:number,step=1):PropField=>({type:'slider',key,label,default:value,min,max,step});
const schema:PropField[]=[
 {type:'text',key:'src',label:'Imagen (ruta en public)',default:'product-demo/dashboard.svg'},
 slider('mediaAspect','Proporción ancho / alto',16/10,.5,3,.01),
 slider('yawStart','Giro lateral · inicio',15,-70,70,.5),slider('yawEnd','Giro lateral · final',3,-70,70,.5),
 slider('pitchStart','Inclinación · inicio',-12,-70,70,.5),slider('pitchEnd','Inclinación · final',1,-70,70,.5),
 slider('zoomStart','Encuadre · inicio',1.6,.75,2.7,.01),slider('zoomEnd','Encuadre · final',1.18,.75,2.7,.01),
 slider('panX','Posición horizontal',0,-2,2,.01),slider('panY','Posición vertical',0,-1.5,1.5,.01),
 slider('focusU','Enfoque horizontal',.59,0,1,.01),slider('focusV','Enfoque vertical',.45,0,1,.01),slider('aperture','Apertura / desenfoque',.06,0,.3,.005),
 {type:'color',key:'backgroundColor',label:'Color del fondo',default:'#1b1f26'},
 {type:'color',key:'fadeColor',label:'Color del fundido',default:'#060606'},
 slider('light','Luz del fondo',65,0,100),slider('lightX','Posición de luz',63,0,100),slider('grain','Grano',8,0,100),
 slider('shadow','Sombra',44,0,100),slider('shine','Brillo',22,0,100),slider('fade','Fundido',25,0,100),
 slider('vignette','Viñeta',18,0,100),slider('exposure','Exposición',100,50,150),slider('rounding','Bordes',16,0,100),
 {type:'select',key:'maskMode',label:'Máscara',default:'0',options:[{value:'0',label:'Ninguna'},{value:'1',label:'Elíptica'},{value:'2',label:'Vertical'}]},
 slider('maskSize','Extensión de máscara',65,0,100),slider('maskSoft','Suavidad',35,0,100),
 {type:'boolean',key:'effectsEnabled',label:'Aplicar acabado',default:true},
];
const defaults=Object.fromEntries(schema.map(f=>[f.key,f.default]));
export const ProductScene:React.FC<Record<string,unknown>>=(props)=>{
 const p={...defaults,...props},frame=useCurrentFrame(),{width,height,durationInFrames}=useVideoConfig();
 const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<OpticalScene|null>(null);
 const count=Number(p.duration)||durationInFrames;
 const t=Math.max(0,Math.min(1,frame/Math.max(1,count-1))),ease=(1-Math.cos(t*Math.PI))/2;
 const mix=(a:string,b:string)=>Number(p[a])+(Number(p[b])-Number(p[a]))*ease;
 const state={yaw:mix('yawStart','yawEnd'),pitch:mix('pitchStart','pitchEnd'),zoom:mix('zoomStart','zoomEnd'),panX:Number(p.panX),panY:Number(p.panY),aperture:Number(p.aperture),u:Number(p.focusU),v:Number(p.focusV)};
 const effects=Object.fromEntries(['light','lightX','grain','shadow','shine','fade','vignette','exposure','rounding','maskMode','maskSize','maskSoft'].map(k=>[k,Number(p[k])]));
 const settings:OpticalSettings={src:staticFile(String(p.src)),width,height,start:state,effects,effectsEnabled:Boolean(p.effectsEnabled),layerDepth:0,backgroundColor:String(p.backgroundColor),fadeColor:String(p.fadeColor),mediaAspect:Number(p.mediaAspect)};
 const latest=useRef({settings,state});latest.current={settings,state};
 useEffect(()=>{let disposed=false;const handle=delayRender('Loading product scene');createOpticalScene(canvas.current!,latest.current.settings).then(scene=>{if(disposed){scene.dispose();continueRender(handle);return}engine.current=scene;scene.update(latest.current.settings,latest.current.state);continueRender(handle)}).catch(e=>{if(!disposed)cancelRender(e);else continueRender(handle)});return()=>{disposed=true;engine.current?.dispose();engine.current=null}},[settings.src,width,height]);
 useLayoutEffect(()=>{engine.current?.update(settings,state)});
 return <AbsoluteFill><canvas ref={canvas} style={{width:'100%',height:'100%'}} aria-label="Escena de producto con cámara y enfoque selectivo"/></AbsoluteFill>;
};
export const productSceneCard:CardDef={id:'product-optical-scene',name:'Escena de producto · Cámara y enfoque',nameEn:'Product scene · Camera & focus',category:'Producto',durationInFrames:180,durationProp:'duration',width:1920,height:1200,component:ProductScene,schema,accent:'#7561d6',summaryEn:'Product interface, optical focus, camera movement and editable finish.'};
