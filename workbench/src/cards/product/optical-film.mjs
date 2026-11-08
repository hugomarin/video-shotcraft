import {defaults} from './schema.mjs';
import {validateProject} from './project-contract.mjs';
import {validateFilm} from './film-contract.mjs';
/** Explicit optical poses and prepared materials, never reinterpret CSS zoom/pixel positions.
 * Keeps native timeline/text/audio and returns an independent project.
 */
export function opticalFilm(project, shots) {
 const check=validateFilm(project);if(!check.ok)throw new Error(check.errors.join('\n'));
 const copy=structuredClone(project);
 for(const track of copy.tracks)for(const clip of track.clips){
  if(clip.cardId!=='product-film-plane-v1')continue;
  const shot=shots[clip.id];
  if(!shot?.material?.src||!shot.motion)throw new Error(`Optical material and motion required: ${clip.id}`);
  const fade=clip.props.fadeFrames??15;
  clip.cardId='product-optical-scene';
  clip.props={...defaults,...shot.effects,...shot.material,audioEnabled:false,motion:shot.motion,clipFadeFrames:fade};
 }
 const optical={...copy,tracks:copy.tracks.map(t=>({...t,clips:t.clips.filter(c=>c.cardId==='product-optical-scene')}))};
 const result=validateProject(optical);if(!result.ok)throw new Error(result.errors.join('\n'));
 return copy;
}
