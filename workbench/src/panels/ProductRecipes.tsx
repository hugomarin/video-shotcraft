import React,{useState} from 'react';
import type {ClipData} from '../types';
import {useStore} from '../store';
import {recipes,applyRecipe,restoreCustom,snapshotProps} from '../cards/product/recipes.mjs';
export const ProductRecipes:React.FC<{clip:ClipData}>=({clip})=>{
 const [choice,setChoice]=useState(recipes[0].id);
 const recipe=recipes.find(r=>r.id===choice)!;
 const replace=(props:Record<string,unknown>)=>{const s=useStore.getState();s.commit();s.updateClip(clip.id,{props});};
 return <section><div className="sec-title">Receta</div>
 <select aria-label="Receta de producto" value={choice} onChange={e=>setChoice(e.target.value)}>{recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
 <p className="direction-note">{recipe.description}</p>
 <div className="direction-actions"><button className="btn" onClick={()=>replace(applyRecipe(clip.props,choice,clip))}>Aplicar receta</button>
 <button className="btn" disabled={!clip.props.recipeState} onClick={()=>replace(restoreCustom(clip.props))}>Volver a mis ajustes</button></div>
 <button className="mini" onClick={()=>replace(snapshotProps(clip.props,Math.max(1,Math.round(clip.inOffset+clip.duration*clip.speed))))}>Guardar mis ajustes</button>
 <p className="direction-note">Aplicar sustituye cámara y acabado. Tus ajustes anteriores se conservan.</p>
 </section>;
};
