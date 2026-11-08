import {planeFocus} from './film-focus.mjs';
import {planeSchema,captionSchema,fadeSchema} from './film-schema.mjs';
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {CardDef, PropField} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const values = (schema:PropField[],props:Record<string,unknown>) => ({...Object.fromEntries(schema.map(f=>[f.key,f.default])),...props});

/** V1: CSS parallel projection, transform order and pixel coordinates are part of the contract.
 * A native video card receives trim/speed directly, so media and camera share source time.
 * Never reinterpret these units as the optical shader's camera units.
 */
export const FilmPlane:React.FC<Record<string,unknown>> = props => {
 const p=values(planeSchema,props),local=useCurrentFrame();
 const f=Number(props.inOffset??0)+local*Number(props.speed??1);
 const d=Math.max(2,Number(props.duration??180));
 const progress=interpolate(f,[0,d-1],[0,1],clamp), smooth=progress*progress*(3-2*progress);
 const fade=Math.min(Number(p.fadeFrames),(d-1)/2);
 const opacity=fade>0?Math.min(interpolate(f,[0,fade],[0,1],clamp),interpolate(f,[d-1-fade,d-1],[1,0],clamp)):1;
 const mediaStyle:React.CSSProperties={position:'absolute',width:Number(p.sourceWidth),left:-Number(p.cropX),top:-Number(p.cropY),maxWidth:'none'};
 const enabled=p.effectsEnabled===true;
 const focus=planeFocus(Object.fromEntries(['pitch','yaw','roll','cropWidth','cropHeight','focusU','focusV','focusWidth','aperture'].map(k=>[k,Number(p[k])])) as Parameters<typeof planeFocus>[0]);
 const amount=(key:string)=>enabled?Number(p[key]):0;
 const texture='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="7" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity=".5"/></svg>');
 const soft=Math.min(Number(p.edgeSoftness),Number(p.cropWidth)/2);
 return <AbsoluteFill style={{background:String(p.backgroundColor),opacity}}>
  {amount('light')>0&&<AbsoluteFill style={{background:`radial-gradient(ellipse at ${p.lightX}% 10%,rgba(255,255,255,${amount('light')/100}),transparent 75%)`}}/>}
  <div style={{position:'absolute',left:Number(p.anchorX),top:Number(p.anchorY),filter:amount('shadow')?`drop-shadow(0 18px 24px rgba(0,0,0,${amount('shadow')*.006}))`:undefined,transformOrigin:'0 0',transform:`translateY(${smooth*Number(p.travelY)}px) rotateX(${p.pitch}deg) rotateY(${p.yaw}deg) rotateZ(${p.roll}deg) scale(${Number(p.scaleStart)+smooth*(Number(p.scaleEnd)-Number(p.scaleStart))})`}}>
   <div style={{position:'absolute',left:Number(p.cropX)-Number(p.centerX),top:Number(p.cropY)-Number(p.centerY),width:Number(p.cropWidth),height:Number(p.cropHeight),overflow:'hidden',borderRadius:amount('rounding'),maskImage:soft?`linear-gradient(to right,transparent,black ${soft}px,black calc(100% - ${soft}px),transparent)`:undefined}}>
    {p.mediaType==='video'?<OffthreadVideo src={staticFile(String(p.file))} muted trimBefore={Math.round(Number(props.inOffset??0))} playbackRate={Number(props.speed??1)} style={{...mediaStyle,filter:enabled&&Number(p.exposure)!==100?`brightness(${Number(p.exposure)/100})`:undefined}}/>:<Img src={staticFile(String(p.file))} style={{...mediaStyle,filter:enabled&&Number(p.exposure)!==100?`brightness(${Number(p.exposure)/100})`:undefined}}/>}
    {enabled&&focus.blur>0&&<AbsoluteFill style={{backdropFilter:`blur(${focus.blur}px)`,WebkitBackdropFilter:`blur(${focus.blur}px)`,maskImage:focus.mask,pointerEvents:'none'}}/>}
    {amount('shine')>0&&<AbsoluteFill style={{background:`linear-gradient(115deg,transparent 20%,rgba(255,255,255,${amount('shine')*.006}) ${p.lightX}%,transparent 90%)`,pointerEvents:'none'}}/>}
    {amount('grain')>0&&<AbsoluteFill style={{backgroundImage:`url("${texture}")`,opacity:amount('grain')*.007,mixBlendMode:'soft-light',pointerEvents:'none'}}/>}
   </div>
  </div>
  {amount('fade')>0&&<AbsoluteFill style={{background:`linear-gradient(to bottom,transparent 30%,${p.fadeColor} 100%)`,opacity:amount('fade')/100,pointerEvents:'none'}}/>}
  {amount('vignette')>0&&<AbsoluteFill style={{background:`radial-gradient(ellipse at center,transparent 35%,${p.fadeColor} 100%)`,opacity:amount('vignette')/100,pointerEvents:'none'}}/>}
 </AbsoluteFill>;
};
export const filmPlaneCard:CardDef={id:'product-film-plane-v1',name:'Plano de producto · Paralelo',category:'Producto',kind:'video',timing:'realtime',durationInFrames:180,durationProp:'duration',width:1600,height:1000,component:FilmPlane,schema:planeSchema,accent:'#7561d6',inspectorGroups:[
 {id:'focus',label:'Enfoque y profundidad de campo',fields:['aperture','focusU','focusV','focusWidth'],open:true},
 {id:'orientation',label:'Inclinación',fields:['pitch','yaw','roll'],open:true},
 {id:'framing',label:'Encuadre y movimiento',fields:['anchorX','anchorY','scaleStart','scaleEnd','travelY'],open:true},
 {id:'content',label:'Contenido',fields:['file','mediaType','sourceWidth']},
 {id:'crop',label:'Recorte y centro',fields:['cropX','cropY','cropWidth','cropHeight','centerX','centerY','edgeSoftness']},
 {id:'appearance',label:'Apariencia',fields:['effectsEnabled','exposure','shadow','shine','grain','rounding'],open:true},
 {id:'background',label:'Fondo',fields:['backgroundColor','light','lightX'],open:true},
 {id:'finish',label:'Fundido y viñeta',fields:['fadeColor','fade','vignette','fadeFrames']},
]};

export const FilmCaption:React.FC<Record<string,unknown>>=props=>{
 const p=values(captionSchema,props),local=useCurrentFrame(),f=Number(props.inOffset??0)+local*Number(props.speed??1),d=Math.max(2,Number(props.duration??180));
 // Separate envelopes also remain well-defined when clips are shortened below the default fades.
 const start=Number(p.enterStart),end=Math.max(start+1,Number(p.enterEnd));
 const outEnd=d-Number(p.exitEnd),outStart=Math.min(outEnd-1,d-Number(p.exitStart));
 const opacity=Math.min(interpolate(f,[start,end],[0,1],clamp),interpolate(f,[outStart,outEnd],[1,0],clamp));
 return <div style={{position:'absolute',left:Number(p.left),bottom:Number(p.bottom),fontFamily:String(p.fontFamily),fontWeight:Number(p.fontWeight),fontSize:Number(p.fontSize),lineHeight:Number(p.lineHeight),letterSpacing:Number(p.letterSpacing),color:String(p.color),opacity,transform:`translateY(${interpolate(f,[start,Math.max(start+1,Number(p.riseEnd))],[Number(p.rise),0],clamp)}px)`}}>{String(p.content).split('\n').map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}{line}</React.Fragment>)}</div>;
};
export const filmCaptionCard:CardDef={id:'product-film-caption-v1',name:'Texto de producto',category:'Producto',kind:'video',timing:'realtime',durationInFrames:180,durationProp:'duration',width:1600,height:1000,component:FilmCaption,schema:captionSchema,inspectorGroups:[
 {id:'text',label:'Texto',fields:['content','fontSize','color','left','bottom'],open:true},
 {id:'type',label:'Tipografía',fields:['fontFamily','fontWeight','lineHeight','letterSpacing']},
 {id:'time',label:'Entrada y salida · frames',fields:['enterStart','enterEnd','exitStart','exitEnd','rise','riseEnd']},
]};
export const FilmFade:React.FC<Record<string,unknown>>=props=>{const p=values(fadeSchema,props);const hex=String(p.color).replace('#','');const rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)).join(',');return <AbsoluteFill style={{background:`linear-gradient(to bottom,rgba(${rgb},0) ${p.clearAt}%,rgba(${rgb},${p.softOpacity}) ${p.softAt}%,rgba(${rgb},${p.strongOpacity}) ${p.strongAt}%,${p.color} ${p.solidAt}%)`,pointerEvents:'none'}}/>};
export const filmFadeCard:CardDef={id:'product-film-fade-v1',name:'Degradado de lectura',category:'Producto',durationInFrames:180,width:1600,height:1000,component:FilmFade,schema:fadeSchema};
