const number = (key,label,value,min=-10000,max=10000,step=.1) => ({type:'number',key,label,default:value,min,max,step});
const slider = (key,label,value,min,max,step=.1) => ({type:'slider',key,label,default:value,min,max,step});
const text = (key,label,value) => ({type:'text',key,label,default:value});
const color = (key,label,value) => ({type:'color',key,label,default:value});
export const planeSchema = [
 text('file','Archivo','product-demo/dashboard.svg'),
 {type:'select',key:'mediaType',label:'Contenido',default:'image',options:[{value:'image',label:'Imagen'},{value:'video',label:'Video'}]},
 number('sourceWidth','Ancho original',1600,1),
 number('cropX','Recorte · izquierda',0,0),number('cropY','Recorte · arriba',0,0),number('cropWidth','Recorte · ancho',1600,1),number('cropHeight','Recorte · alto',1000,1),
 number('centerX','Centro en contenido · X',800),number('centerY','Centro en contenido · Y',500),
 number('anchorX','Posición en lienzo · X',800),number('anchorY','Posición en lienzo · Y',500),
 slider('pitch','Inclinación ↕',12,-85,85,.5),slider('yaw','Giro ↔',-10,-85,85,.5),slider('roll','Rotación ⟳',-7,-180,180,.5),
 slider('scaleStart','Acercamiento inicial',1,.1,6,.005),slider('scaleEnd','Acercamiento final',1.025,.1,6,.005),
 number('travelY','Recorrido vertical',-12),number('edgeSoftness','Suavidad del recorte',5,0,100),
 {type:'boolean',key:'effectsEnabled',label:'Activar acabados',default:true},
 slider('aperture','Desenfoque',0,0,32,.5),slider('focusU','Foco horizontal ↔',.5,0,1,.01),slider('focusV','Foco vertical ↕',.5,0,1,.01),slider('focusWidth','Zona nítida',.2,.02,.8,.01),
 slider('exposure','Exposición',100,50,150,1),slider('light','Luz de fondo',0,0,100,1),slider('lightX','Posición de luz',65,0,100,1),
 slider('shadow','Sombra',0,0,100,1),slider('shine','Reflejo',0,0,100,1),slider('grain','Grano',0,0,100,1),slider('rounding','Esquinas',0,0,80,1),
 color('fadeColor','Color del fundido','#ffffff'),slider('fade','Fundido inferior',0,0,100,1),slider('vignette','Viñeta',0,0,100,1),
 number('fadeFrames','Fundido · frames',15,0,300,1),color('backgroundColor','Fondo','#ffffff'),
];

export const captionSchema=[
 {type:'textarea',key:'content',label:'Texto',default:'Cada dato revela\nuna nueva oportunidad.'},
 number('left','Margen izquierdo',72),number('bottom','Margen inferior',66),slider('fontSize','Tamaño',62,16,180,1),
 color('color','Color','#162334'),text('fontFamily','Tipografía','Arial, sans-serif'),number('fontWeight','Peso',500,100,900,100),number('lineHeight','Interlineado',1.08,.5,3,.01),number('letterSpacing','Espaciado',-2.2,-10,20,.1),
 number('enterStart','Entrada · inicio',12,0,10000,1),number('enterEnd','Entrada · final',32,1,10000,1),
 number('exitStart','Salida · margen inicial',25,1,10000,1),number('exitEnd','Salida · margen final',10,0,10000,1),
 number('rise','Ascenso',10),number('riseEnd','Ascenso · final',38,1,10000,1),
];
export const fadeSchema=[color('color','Color','#ffffff'),number('clearAt','Comienza (%)',49,0,100),number('softAt','Suave (%)',62,0,100),slider('softOpacity','Opacidad suave',.22,0,1,.01),number('strongAt','Intenso (%)',80,0,100),slider('strongOpacity','Opacidad intensa',.9,0,1,.01),number('solidAt','Sólido (%)',96,0,100)];
