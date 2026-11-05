const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function app({supported=true,loaded=true}={}) {
 class El extends EventTarget {
  constructor(){super();this.style={};this.dataset={};this.classList={add(){},remove(){}};this.open=false;this.loaded=loaded;this.canActivateAR=supported;this.attrs={};}
  setAttribute(k,v){this.attrs[k]=v;} removeAttribute(k){delete this.attrs[k];}
  showModal(){this.open=true;} close(){this.open=false;this.dispatchEvent(new Event('close'));}
 }
 const els=new Map();const el=s=>{if(!els.has(s))els.set(s,new El());return els.get(s);};
 const ctx={console,URL,Event,Promise,setTimeout,clearTimeout,location:{href:'https://example.com/Carta3D-AR/'},history:{replaceState(){}},localStorage:{getItem(){},setItem(){}},sessionStorage:{getItem(){},setItem(){}},document:{querySelector:el,querySelectorAll:()=>[]},navigator:{userAgent:'Android Chrome',xr:{isSessionSupported:async()=>supported}},customElements:{get:()=>class{},whenDefined:()=>Promise.resolve()},isSecureContext:true};ctx.window=ctx;
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('docs/app.js','utf8'),ctx);
 return {el,run:code=>vm.runInContext(code,ctx)};
}
test('loaded model automatically prepares the AR action',async(t)=>{
 const a=app();t.after(()=>a.el('#dishDialog').close());a.run("openDish('burger')");a.el('#dishViewer').dispatchEvent(new Event('load'));
 await new Promise(r=>setImmediate(r));
 assert.match(a.el('#arButtonLabel').textContent,/Ver en mi mesa/);
});
test('renderer or model error is persistent and offers retry',(t)=>{
 const a=app({loaded:false});t.after(()=>a.el('#dishDialog').close());a.run("openDish('burger')");a.el('#dishViewer').dispatchEvent(new Event('error'));
 assert.match(a.el('#viewerStatus').textContent,/No se pudo/);
 assert.equal(a.el('#retryViewer').hidden,false);
 assert.equal(a.el('#arButton').disabled,true);
});
test('AR check waits for loading instead of declaring the device incompatible',async(t)=>{
 const a=app({loaded:false});t.after(()=>a.el('#dishDialog').close());a.run("openDish('burger')");const pending=a.run('checkAR()');
 await new Promise(r=>setImmediate(r));a.el('#dishViewer').loaded=true;a.el('#dishViewer').dispatchEvent(new Event('load'));
 await pending;
 assert.match(a.el('#arButtonLabel').textContent,/Ver en mi mesa/);
});
test('a rejected AR session from a closed dish cannot overwrite the next dish',async(t)=>{
 const a=app();t.after(()=>a.el('#dishDialog').close());let reject;
 a.el('#dishViewer').activateAR=()=>new Promise((_,r)=>reject=r);
 a.run("openDish('burger')");await a.run('checkAR()');a.run('launchAR()');
 a.el('#dishDialog').close();a.run("openDish('pizza')");const before=a.el('#arFallback').textContent;
 reject(new Error('cancelled'));await new Promise(r=>setImmediate(r));
 assert.equal(a.el('#arFallback').textContent,before);
});
