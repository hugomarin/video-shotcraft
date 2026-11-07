import {create} from 'zustand';
import type {CameraState} from './cards/product/optical-scene';
export type PosePreview = {clipId:string;pose:CameraState} | null;
/** Ephemeral editor state: deliberately outside ProjectData, export and history. */
export const useProductPreview = create<{preview:PosePreview;set:(preview:PosePreview)=>void}>(set=>({preview:null,set:preview=>set({preview})}));
