import type {ClipData} from '../../types';
export const recipes:{id:string;version:number;name:string;description:string;props:Record<string,unknown>;start:Record<string,number>;end:Record<string,number>}[];
export function applyRecipe(props:Record<string,unknown>,id:string,clip:Pick<ClipData,'duration'|'inOffset'|'speed'>):Record<string,unknown>;
export function restoreCustom(props:Record<string,unknown>):Record<string,unknown>;
export function snapshotProps(props:Record<string,unknown>,duration?:number):Record<string,unknown>;
