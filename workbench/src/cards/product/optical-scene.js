import * as THREE from 'three';
import {resolveOptics} from './optics.mjs';
export async function createOpticalScene(canvas,settings){
let optics=resolveOptics(settings,settings.start),current={...settings.start},effects={maskMode:0,maskSize:65,maskSoft:35,...settings.effects},enabled=settings.effectsEnabled,layerDepth=settings.layerDepth,backgroundColor=settings.backgroundColor,fadeColor=settings.fadeColor,fxDefaults=effects;
const texture=await new THREE.TextureLoader().loadAsync(settings.src);
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(settings.width,settings.height,false);
texture.flipY=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
const uniforms={orthographic:{value:0},sampleCount:{value:48},mediaAspect:{value:2912/1770},img:{value:texture},aspect:{value:1.6},yaw:{value:0},pitch:{value:0},distance:{value:4.8},focus:{value:4.8},aperture:{value:.1},pan:{value:new THREE.Vector2()},bg:{value:new THREE.Vector3(.07,.07,.07)}};
for(const key of Object.keys(fxDefaults)) uniforms[key]={value:effects[key]/100};uniforms.enabled={value:enabled?1:0};uniforms.layerDepth={value:layerDepth};uniforms.lens={value:6.3};uniforms.backTint={value:new THREE.Vector3()};uniforms.fadeTint={value:new THREE.Vector3()};
const material=new THREE.ShaderMaterial({uniforms,vertexShader:'varying vec2 v;void main(){v=uv*2.-1.;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`precision highp float;
varying vec2 v;uniform sampler2D img;uniform float aspect,yaw,pitch,distance,focus,aperture;uniform vec2 pan;uniform vec3 bg;uniform vec3 backTint,fadeTint;
uniform float layerDepth,lens,mediaAspect,orthographic,sampleCount;
uniform float maskMode,maskSize,maskSoft;
uniform float light,lightX,grain,shadow,shine,fade,vignette,exposure,rounding,enabled;
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
float box(vec2 p,vec2 size,float r){vec2 q=abs(p)-size+vec2(r);return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 d=normalize(vec3(v.x*aspect,v.y,-lens));vec3 fp=d*(focus/-d.z);mat3 rot=ry(yaw)*rx(pitch);vec3 bx=rot*vec3(1.,0.,0.),by=rot*vec3(0.,1.,0.),n=rot*vec3(0.,0.,1.);vec3 center=vec3(pan,-distance);vec3 sum=vec3(0.);
float glow=exp(-dot((v-vec2(lightX*2.-1.,.9))*vec2(.8,.95),(v-vec2(lightX*2.-1.,.9))*vec2(.8,.95)))*light*.45;
vec3 background=mix(bg,backTint+vec3(glow*.95,glow,glow*1.04),enabled);
for(int i=0;i<144;i++){
if(float(i)>=sampleCount)break;
float k=float(i)+.5,a=k*2.39996323,r=sqrt(k/sampleCount)*aperture;vec3 o=vec3(cos(a)*r,sin(a)*r,0.);
vec3 target=fp;
if(orthographic>.5){vec2 screen=vec2(v.x*aspect,v.y)*distance/lens;o.xy+=screen;target=vec3(screen,-focus);}
vec3 ray=normalize(target-o);
vec3 col=background;float closest=1000.;
for(int j=0;j<2;j++){
float isSide=float(j);vec2 cropMin=vec2(0.),cropMax=vec2(1.);vec2 dims=vec2(4.7,4.7/mediaAspect);vec3 pc=center;
if(layerDepth>.001){
 if(j==0){cropMax.x=.755;dims.x*=.755;pc+=bx*(-.575-layerDepth*.12);}
 else{cropMin=vec2(.775,.186);cropMax=vec2(1.,.954);dims*=cropMax-cropMin;pc+=bx*(1.82-layerDepth*.24)+by*(-.20+layerDepth*.12)+n*(layerDepth*.85);}
}else if(j==1){continue;}
float t=dot(pc-o,n)/dot(ray,n);vec3 hit=o+ray*t-pc;vec2 uv=vec2(dot(hit,bx)/dims.x+.5,.5-dot(hit,by)/dims.y);
float ratio=dims.y/dims.x;float radius=min(rounding*.075*enabled,ratio*.12);float sd=box((uv-.5)*vec2(1.,ratio),vec2(.5,.5*ratio),radius);
float sh=box((uv-vec2(.515,.54))*vec2(1.,ratio),vec2(.49,.49*ratio),radius);float shadowMask=exp(-max(sh,0.)*max(sh,0.)/.0025)*shadow*.8*enabled;
if(t>0.&&t<closest){col*=1.-shadowMask;}
if(t>0.&&t<closest&&uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.){
vec2 imageUV=mix(cropMin,cropMax,uv);vec3 tex=texture2D(img,imageUV).rgb;
float reflection=exp(-pow((uv.x+uv.y*.32-(lightX*.8+.1)-yaw*.12)*3.7,2.))*shine*.24;
tex=tex*mix(1.,exposure,enabled)+vec3(reflection*enabled);float rim=1.-smoothstep(.001,.004,abs(sd));tex+=vec3(rim*shine*.18*enabled*(1.-uv.y));
tex=mix(tex,fadeTint,smoothstep(.34,1.,uv.y)*fade*enabled);float alpha=1.-smoothstep(-.0015,.0015,sd);float maskAlpha=1.;if(maskMode>.005&&maskMode<.015){float radius=length((uv-.5)*vec2(1.,1.25));float size=.12+maskSize*.65;maskAlpha=1.-smoothstep(size,size+.015+maskSoft*.45,radius);}else if(maskMode>=.015){maskAlpha=1.-smoothstep(maskSize*.85,min(.999,maskSize*.85+.05+maskSoft*.6),uv.y);}alpha*=mix(1.,maskAlpha,enabled);col=mix(col,tex,alpha);if(alpha>.5)closest=t;
}
}sum+=col;}
vec3 color=sum/sampleCount;float edge=smoothstep(.22,1.45,length(v*vec2(.8,1.)));color=mix(color,fadeTint,edge*vignette*.85*enabled);
float bottom=smoothstep(.10,1.,(-v.y+1.)*.5);color=mix(color,fadeTint,bottom*bottom*fade*.45*enabled);
color+=(noise(gl_FragCoord.xy)-.5)*grain*.055*enabled;gl_FragColor=vec4(clamp(color,0.,1.),1.);}
`});
const scene=new THREE.Scene();scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const camera=new THREE.Camera();
const radians=Math.PI/180;
function basis(){const m=new THREE.Matrix4().makeRotationY(current.yaw*radians).multiply(new THREE.Matrix4().makeRotationX(current.pitch*radians));return {x:new THREE.Vector3(1,0,0).applyMatrix4(m),y:new THREE.Vector3(0,1,0).applyMatrix4(m),n:new THREE.Vector3(0,0,1).applyMatrix4(m)}}
function center(){return new THREE.Vector3(current.panX,current.panY,-optics.distance)}
function draw(){function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)}uniforms.backTint.value.fromArray(rgb(backgroundColor));uniforms.fadeTint.value.fromArray(rgb(fadeColor));const b=basis(),c=center(),point=c.clone().addScaledVector(b.x,(current.u-.5)*4.7).addScaledVector(b.y,(.5-current.v)*4.7/uniforms.mediaAspect.value);if(layerDepth>.001){if(current.u>=.775)point.addScaledVector(b.x,-layerDepth*.24).addScaledVector(b.y,layerDepth*.12).addScaledVector(b.n,layerDepth*.85);else point.addScaledVector(b.x,-layerDepth*.12);}uniforms.lens.value=optics.lens;uniforms.orthographic.value=optics.orthographic;uniforms.sampleCount.value=optics.samples;uniforms.layerDepth.value=layerDepth;uniforms.yaw.value=current.yaw*radians;uniforms.pitch.value=current.pitch*radians;uniforms.distance.value=-c.z;uniforms.focus.value=Math.max(.3,-point.z);uniforms.aperture.value=optics.aperture;uniforms.pan.value.set(current.panX,current.panY);for(const key in effects)uniforms[key].value=effects[key]/100;uniforms.enabled.value=enabled?1:0;renderer.render(scene,camera);}


uniforms.aspect.value=settings.width/settings.height;
return {update(next,state){optics=resolveOptics(next,state);current=state;effects=next.effects;enabled=next.effectsEnabled;layerDepth=next.layerDepth;backgroundColor=next.backgroundColor;fadeColor=next.fadeColor;uniforms.mediaAspect.value=next.mediaAspect||2912/1770;draw()},dispose(){texture.dispose();material.dispose();scene.children[0].geometry.dispose();renderer.dispose()}};
}
