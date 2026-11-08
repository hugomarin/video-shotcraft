import {defaults} from './schema.mjs';
import {resolveMotion, clipMotionRange} from './motion.mjs';
const clone=v=>JSON.parse(JSON.stringify(v));
export const recipes=[
 {id:'interface-light',version:1,name:'Recorrido claro',description:'Explora una interfaz clara con perspectiva contenida y desplaza el foco entre dos zonas. Adecuado para dashboards y vistas completas.',props:{backgroundColor:'#d3d7dd',fadeColor:'#d3d7dd',cameraDistance:36,focusQuality:'96',fade:10,vignette:10,light:25,grain:4,shadow:25,shine:10},start:{yaw:20,pitch:-24,zoom:1.3,panX:-.1,panY:0,u:.65,v:.35,aperture:.075},end:{yaw:12,pitch:-18,zoom:1.3,panX:.1,panY:0,u:.4,v:.65,aperture:.075}},
 {id:'interface-dark',version:1,name:'Recorrido oscuro',description:'Explora una interfaz oscura con luz tenue, fundido oscuro y foco gradual. Conserva el contenido; no convierte automáticamente una imagen clara a modo oscuro.',props:{backgroundColor:'#10141b',fadeColor:'#10141b',cameraDistance:36,focusQuality:'96',fade:20,vignette:15,light:30,grain:5,shadow:25,shine:12},start:{yaw:20,pitch:-24,zoom:1.3,panX:-.1,panY:0,u:.65,v:.35,aperture:.075},end:{yaw:12,pitch:-18,zoom:1.3,panX:.1,panY:0,u:.4,v:.65,aperture:.075}},
 {id:'detail-reveal',version:1,name:'Revelar detalle',description:'Parte de un acercamiento y abre el encuadre para mostrar el conjunto. Ajusta el foco al detalle importante de tu material antes de exportar.',props:{backgroundColor:'#1b1f26',fadeColor:'#1b1f26',cameraDistance:36,focusQuality:'96',fade:8,vignette:10,light:35,grain:4,shadow:25,shine:12},start:{yaw:18,pitch:-20,zoom:1.9,panX:0,panY:0,u:.55,v:.4,aperture:.09},end:{yaw:3,pitch:-4,zoom:1.1,panX:0,panY:0,u:.5,v:.5,aperture:.025}},
];
export function applyRecipe(props, id, clip) {
 const recipe=recipes.find(r=>r.id===id);if(!recipe)throw new Error(`Receta desconocida: ${id}`);
 const custom=props.recipeState?.custom ?? props;
 const r=clipMotionRange(clip);
 // Replace the complete effect snapshot. Only the material is carried across.
 return clone({...defaults,...recipe.props,src:props.src??defaults.src,mediaAspect:props.mediaAspect??defaults.mediaAspect,...(props.media?{media:props.media}:{}),audioEnabled:props.audioEnabled??false,clipFadeFrames:props.clipFadeFrames??0,
   motion:{version:1,startFrame:r.start,endFrame:r.end,start:recipe.start,end:recipe.end},
   recipeState:{version:1,id:recipe.id,recipeVersion:recipe.version,custom}});
}
export function restoreCustom(props) {
 if(!props.recipeState?.custom)throw new Error('No hay ajustes personalizados guardados.');
 return clone(props.recipeState.custom);
}
export function snapshotProps(props,duration=180) {
 const {recipeState,__editorPose,...rest}=props;
 return clone({...defaults,...rest,motion:resolveMotion({...defaults,...rest},duration)});
}
