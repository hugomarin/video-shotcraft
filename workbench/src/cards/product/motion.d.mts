import type {CameraState} from './optical-scene';
export type Motion = {version:1;startFrame:number;endFrame:number;start:CameraState;end:CameraState};
export const poseFields: {key:keyof CameraState;label:string;min:number;max:number;step:number;unit:string}[];
export function validateMotion(m:unknown):Motion;
export function resolveMotion(p?:Record<string,unknown>,duration?:number):Motion;
export function sampleMotion(m:Motion,frame:number):CameraState;
type Timing = {inOffset:number;duration:number;speed:number};
export function clipMotionRange(c:Timing):{start:number;end:number;duration:number};
export function fixEndpoint(p:Record<string,unknown>,c:Timing,e:'start'|'end',pose:CameraState):Motion;
