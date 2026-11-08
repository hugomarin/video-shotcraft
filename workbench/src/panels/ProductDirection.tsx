import React, {useEffect} from 'react';
import type {ClipData} from '../types';
import {useStore} from '../store';
import {playerRef, seekTo} from '../playerRef';
import {useProductPreview} from '../productPreview';
import {clipMotionRange, fixEndpoint, poseFields, resolveMotion, sampleMotion} from '../cards/product/motion.mjs';

export const ProductDirection:React.FC<{clip:ClipData;props:Record<string,unknown>}>=({clip,props})=>{
  const frame=useStore(s=>s.playhead), playing=useStore(s=>s.playing);
  const preview=useProductPreview(s=>s.preview), setPreview=useProductPreview(s=>s.set);
  const range=clipMotionRange(clip);
  const motion=resolveMotion(props,range.duration);
  const local=Math.max(0,Math.min(clip.duration-1,frame-clip.start));
  const sampled=sampleMotion(motion,clip.inOffset+local*clip.speed);
  const draft=preview?.clipId===clip.id ? preview.pose : null;
  const pose=draft ?? sampled;
  const editable=!playing && frame>=clip.start && frame<clip.start+clip.duration;
  // Seeking, playback, undo, edits elsewhere and leaving this clip discard only the uncommitted preview.
  useEffect(()=>{setPreview(null);},[frame,playing,clip.props,clip.duration,clip.speed,clip.inOffset,setPreview]);
  useEffect(()=>()=>setPreview(null),[clip.id,setPreview]);
  const view=(endpoint:'start'|'end')=>{
    playerRef.current?.pause(); setPreview(null);
    const f=clip.start+(endpoint==='end'?clip.duration-1:0);
    seekTo(f);useStore.getState().setPlayhead(f);
  };
  const save=(endpoint:'start'|'end')=>{
    const next=fixEndpoint(props,clip,endpoint,pose);
    const store=useStore.getState();store.commit();store.updateClipProps(clip.id,{motion:next});view(endpoint);
  };
  return <section className="product-direction">
    <div className="sec-title">Dirigir toma</div>
    <p className="direction-note" role="status">{!editable?'Pausa sobre la toma o pulsa Ver inicio / Ver final.':draft?'Vista de prueba · fija inicio o final para guardarla.':'Estado actual · ajusta la pose y fija un extremo.'}</p>
    <div className="direction-actions">
      <button className="btn" onClick={()=>view('start')}>Ver inicio</button>
      <button className="btn" onClick={()=>view('end')}>Ver final</button>
    </div>
    {poseFields.map(f=><label className="prop-row" key={f.key}>
      <span className="prop-label">{f.label}</span>
      <span className="prop-ctl ctl-row"><input type="range" disabled={!editable} aria-label={`Pose · ${f.label}`} min={f.min} max={f.max} step={f.step} value={pose[f.key]}
        onChange={e=>{playerRef.current?.pause();const target=Math.max(clip.start,Math.min(clip.start+clip.duration-1,frame));if(target!==frame){seekTo(target);useStore.getState().setPlayhead(target);}setPreview({clipId:clip.id,pose:{...pose,[f.key]:Number(e.target.value)}});}}/>
        <span className="slider-val">{Number(pose[f.key].toFixed(3))}{f.unit}</span></span>
    </label>)}
    <div className="direction-actions">
      <button className="btn" disabled={!editable} onClick={()=>save('start')}>Fijar inicio</button>
      <button className="btn" disabled={!editable} onClick={()=>save('end')}>Fijar final</button>
    </div>
    <button className="mini" disabled={!draft} onClick={()=>setPreview(null)}>Descartar prueba</button>
  </section>;
};
