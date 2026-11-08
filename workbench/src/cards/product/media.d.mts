export type FrameMedia={version:1;type:'frames';fps:number;frameCount:number;pattern:string;trimStart?:number;audio?:string;width?:number;height?:number};
export function validateMedia(m:unknown):FrameMedia;
export function mediaFrame(m:FrameMedia,frame:number):number;
export function frameSource(p:Record<string,unknown>,frame:number):string;
