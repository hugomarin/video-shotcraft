import React,{useRef,useState} from 'react';
import type {ClipData} from '../types';import {useStore} from '../store';
export const ProductMedia:React.FC<{clip:ClipData}>=({clip})=>{
 const input=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[start,setStart]=useState(0),[seconds,setSeconds]=useState(30);
 const load=async(file:File)=>{
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/product-media',{method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(file.name),'X-Trim-Start':String(start),'X-Trim-Seconds':String(seconds)},body:file});
   const result=await response.json();if(!response.ok)throw new Error(result.error??'No se pudo importar.');
   const store=useStore.getState();const current=store.project.tracks.flatMap(t=>t.clips).find(c=>c.id===clip.id);if(!current)throw new Error('La toma ya no existe.');
   const {width,height,durationFrames,...material}=result;
   const duration=durationFrames?Math.max(2,Math.round(durationFrames/30*store.project.fps)):current.duration;
   const props={...current.props,...material,media:material.media,audioEnabled:false};
   if(durationFrames&&props.motion){const m=props.motion as {start:unknown;end:unknown};props.motion={version:1,startFrame:0,endFrame:Math.max(1,durationFrames-1),start:m.start,end:m.end};}
   store.commit();store.updateClip(clip.id,{props,duration,...(durationFrames?{inOffset:0,speed:30/store.project.fps}:{})});
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);if(input.current)input.current.value='';}
 };
 return <details className="prop-group" open><summary className="sec-title">Importar contenido</summary><div className="prop-group-body">
 <p className="direction-note">Imagen o video local. El video se prepara a 30 fps; máximo 200 MB y 120 s por importación. Audio desactivado inicialmente.</p>
 <label className="prop-row"><span className="prop-label">Desde (s)</span><input aria-label="Inicio de importación" type="number" min={0} step={.1} value={start} onChange={e=>setStart(Number(e.target.value))}/></label>
 <label className="prop-row"><span className="prop-label">Duración (s)</span><input aria-label="Duración de importación" type="number" min={.1} max={120} step={.1} value={seconds} onChange={e=>setSeconds(Number(e.target.value))}/></label>
 <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,video/mp4,video/quicktime,video/webm,.mkv" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)void load(f);}}/>
 <button className="btn" disabled={busy} onClick={()=>input.current?.click()}>{busy?'Preparando contenido…':'Elegir imagen o video'}</button>
 {error&&<p role="alert" className="direction-note">{error}</p>}
 </div></details>;
};
