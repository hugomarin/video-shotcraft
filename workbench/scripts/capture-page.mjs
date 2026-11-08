import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import path from 'node:path';
import {openBrowser} from '@remotion/renderer';import {importMedia} from './import-media.mjs';
export function captureOptions(url,{width=1600,height=1000,waitMs=1000}={}){
 const u=new URL(url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw new Error('Usa una URL HTTP(S) sin credenciales.');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<320||height<200||width>3840||height>2160||!Number.isFinite(waitMs)||waitMs<0||waitMs>10000)throw new Error('Viewport o espera fuera de rango.');
 return {url:u.href,width,height,waitMs};
}
/** Adapter for the pinned Remotion browser. Fresh profile, no personal cookies.
 * Captures a viewport only; no clicks, form submission or inferred layers. */
export async function capturePage(url,root,options={}){
 const config=captureOptions(url,options),dir=await mkdtemp(path.join(tmpdir(),'shotcraft-capture-'));
 let browser;
 try{
  browser=await openBrowser('chrome',{browserExecutable:options.browser??null,logLevel:'error'});
  const page=await browser.newPage({context:()=>null,logLevel:'error',indent:false,pageIndex:0,onBrowserLog:null,onLog:()=>{}});
  await page.setViewport({width:config.width,height:config.height,deviceScaleFactor:1});
  const response=await page.goto({url:config.url,timeout:30000});if(!response||response.status()>=400)throw new Error(`La página respondió ${response?.status()??'sin respuesta'}.`);
  await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]));
  await new Promise(resolve=>setTimeout(resolve,config.waitMs));
  const {value:image}=await page._client().send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  const file=path.join(dir,'page.png');await writeFile(file,Buffer.from(image.data,'base64'));
  const material=await importMedia(file,root);
  return {material,capture:{version:1,url:page.url(),viewport:{width:config.width,height:config.height},waitMs:config.waitMs,kind:'static-viewport'}};
 }finally{if(browser)await browser.close({silent:true});await rm(dir,{recursive:true,force:true});}
}
