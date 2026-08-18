/* Runs a doc page's inline <script> under a stub DOM. It cannot lay anything
   out — getBoundingClientRect returns 0 — so every rig bails at its first
   measure. What it DOES catch is the class of bug node --check cannot see: a
   free variable, a missing export, a call on undefined. */
import fs from 'node:fs';
import vm from 'node:vm';

const page = process.argv[2];
const html = fs.readFileSync(page, 'utf8');
const inline = html.match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])
    .map(s => 'docs/' + s);

const mk = (tag='div') => {
  const e = {
    tagName: tag, className: '', children: [], style: new Proxy({setProperty(){}, removeProperty(){}, getPropertyValue:()=>''}, {get:(t,k)=>(k in t?t[k]:''), set:()=>true}),
    dataset: {}, textContent: '', innerHTML: '', title: '', type: '', disabled: false,
    classList: { add(){}, remove(){}, toggle(){return false}, contains(){return false} },
    append(...k){ e.children.push(...k); return e },
    appendChild(k){ e.children.push(k); return k },
    setAttribute(){}, getAttribute(){return null}, removeAttribute(){},
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){return true},
    querySelector(){ return mk() }, querySelectorAll(){ return [] },
    closest(){ return null }, remove(){}, replaceWith(){}, replaceChild(){},
    getBoundingClientRect(){ return {width:0,height:0,top:0,left:0,right:0,bottom:0} },
    focus(){}, click(){}, setPointerCapture(){}, insertBefore(){}, cloneNode(){ return mk(tag) },
    get firstChild(){ return null }, get parentNode(){ return null },
  };
  return e;
};
const doc = {
  createElement: t => mk(t), createElementNS: (_n,t) => mk(t),
  getElementById: () => mk(), querySelector: () => mk(), querySelectorAll: () => [],
  addEventListener(){}, documentElement: mk(), body: mk(), head: mk(),
  createTextNode: () => mk('#text'),
};
const win = {
  document: doc, devicePixelRatio: 1,
  requestAnimationFrame: fn => { try { fn(0) } catch (e) { throw e } },
  cancelAnimationFrame(){}, setTimeout: (fn)=>{ }, clearTimeout(){}, setInterval(){}, clearInterval(){},
  getComputedStyle: () => new Proxy({}, {get:()=>''}),
  matchMedia: () => ({ matches:false, addEventListener(){} }),
  IntersectionObserver: class { observe(){} disconnect(){} },
  ResizeObserver: class { observe(){} disconnect(){} },
  location: { pathname: '/' + (process.argv[2]||'').split('/').pop(), hash:'', href:'' },
  history: { replaceState(){}, pushState(){} },
  localStorage: { getItem:()=>null, setItem(){}, removeItem(){} },
  addEventListener(){}, removeEventListener(){}, console,
  AudioContext: class { constructor(){ this.destination={}; this.currentTime=0; this.state='running' }
    createGain(){ return {connect(){}, gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}}} }
    createOscillator(){ return {connect(){}, start(){}, stop(){}, frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}, type:''} }
    createBiquadFilter(){ return {connect(){}, frequency:{value:0,setValueAtTime(){}}, Q:{value:0}, type:''} }
    createBuffer(){ return {getChannelData:()=>new Float32Array(64)} }
    createBufferSource(){ return {connect(){}, start(){}, buffer:null} }
    resume(){} },
};
win.window = win; win.globalThis = win; win.self = win;
const ctx = vm.createContext(win);
for (const t of tags) {
  try { vm.runInContext(fs.readFileSync(t,'utf8'), ctx, {filename:t}); }
  catch (e) { console.log(`  (dep ${t}: ${e.message})`); }
}
try {
  vm.runInContext(inline, ctx, { filename: page });
  console.log(`  OK      ${page}`);
} catch (e) {
  const stack = (e.stack||'').split('\n').slice(0,3).join('\n          ');
  console.log(`  THROWS  ${page}\n          ${e.constructor.name}: ${e.message}\n          ${stack}`);
  process.exitCode = 1;
}
