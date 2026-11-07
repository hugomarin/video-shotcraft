export type CameraState = {yaw:number;pitch:number;zoom:number;panX:number;panY:number;aperture:number;u:number;v:number};
export type OpticalSettings = {projection?:string;cameraDistance?:number;focusQuality?:number;src:string;width:number;height:number;start:CameraState;effects:Record<string,number>;effectsEnabled:boolean;layerDepth:number;backgroundColor:string;fadeColor:string;mediaAspect:number};
export type OpticalScene = {update(settings:OpticalSettings,state:CameraState):void;dispose():void};
export function createOpticalScene(canvas:HTMLCanvasElement,settings:OpticalSettings):Promise<OpticalScene>;
