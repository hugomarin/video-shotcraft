const slider=(key,label,value,min,max,step=1)=>({type:'slider',key,label,default:value,min,max,step});
export const schema=[
 slider('clipFadeFrames','Entrada / salida · frames',0,0,300),
 {type:'boolean',key:'audioEnabled',label:'Audio original',default:false},
 {type:'text',key:'src',label:'Ruta de imagen',default:'product-demo/dashboard.svg'},
 slider('mediaAspect','Proporción',16/10,.5,3,.01),
 {type:'select',key:'projection',label:'Proyección',default:'perspective',options:[{value:'perspective',label:'Perspectiva'},{value:'orthographic',label:'Paralela'}]},
 slider('cameraDistance','Distancia',14.4,8,48,.1),
 {type:'select',key:'focusQuality',label:'Calidad de foco',default:'48',options:[{value:'48',label:'Rápida · 48'},{value:'96',label:'Suave · 96'},{value:'144',label:'Fina · 144'}]},
 slider('yawStart','Giro ↔',15,-70,70,.5),slider('yawEnd','Giro ↔',3,-70,70,.5),
 slider('pitchStart','Inclinación ↕',-12,-70,70,.5),slider('pitchEnd','Inclinación ↕',1,-70,70,.5),
 slider('zoomStart','Encuadre',1.6,.75,2.7,.01),slider('zoomEnd','Encuadre',1.18,.75,2.7,.01),
 slider('panX','Horizontal ↔',0,-2,2,.01),slider('panY','Vertical ↕',0,-1.5,1.5,.01),
 slider('focusU','Horizontal ↔',.59,0,1,.01),slider('focusV','Vertical ↕',.45,0,1,.01),slider('aperture','Desenfoque',.06,0,.3,.005),
 {type:'color',key:'backgroundColor',label:'Color',default:'#1b1f26'},
 {type:'color',key:'fadeColor',label:'Color',default:'#060606'},
 slider('light','Luz',65,0,100),slider('lightX','Posición de luz',63,0,100),slider('grain','Grano',8,0,100),
 slider('shadow','Sombra',44,0,100),slider('shine','Brillo',22,0,100),slider('fade','Fundido',25,0,100),
 slider('vignette','Viñeta',18,0,100),slider('exposure','Exposición',100,50,150),slider('rounding','Bordes',16,0,100),
 {type:'select',key:'maskMode',label:'Máscara',default:'0',options:[{value:'0',label:'Ninguna'},{value:'1',label:'Elíptica'},{value:'2',label:'Vertical'}]},
 slider('maskSize','Extensión',65,0,100),slider('maskSoft','Suavidad',35,0,100),
 {type:'boolean',key:'effectsEnabled',label:'Activar acabado',default:true},
];
export const defaults=Object.fromEntries(schema.map(f=>[f.key,f.default]));
