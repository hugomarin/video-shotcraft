export function validateMedia(media) {
 if(!media||media.version!==1||media.type!=='frames'||!Number.isInteger(media.fps)||media.fps<1||media.fps>120||!Number.isInteger(media.frameCount)||media.frameCount<1||media.frameCount>14400||typeof media.pattern!=='string'||!media.pattern.endsWith('frame-%06d.png')||!Number.isFinite(media.trimStart??0)||(media.trimStart??0)<0||(media.trimStart??0)>=media.frameCount)throw new Error('Secuencia de video inválida.');
 return media;
}
export function mediaFrame(media,sourceFrame) {
 validateMedia(media);
 return Math.min(media.frameCount-1,Math.max(0,Math.floor(sourceFrame*media.fps/30+(media.trimStart??0))));
}
export function frameSource(props,sourceFrame) {
 if(!props.media)return props.src;
 const m=validateMedia(props.media);return m.pattern.replace('%06d',String(mediaFrame(m,sourceFrame)).padStart(6,'0'));
}
