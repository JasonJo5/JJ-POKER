/* JJ POKER — shared core: settings, theme, sound + memes, avatars, cards, profile (coins/xp/achievements), toasts, fx */
window.JJ = (() => {
'use strict';
const $ = id => document.getElementById(id);
const store = {get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NF=new Intl.NumberFormat('en-US');
const money = n => '$'+NF.format(Math.round(n||0));
const num = n => NF.format(Math.round(n||0));
/* Phones and touch tablets get a lighter mode: same look, fewer costly effects. */
const perf=(()=>{try{return matchMedia('(pointer:coarse)').matches||innerWidth<=820;}catch(e){return false;}})();
if(perf)document.documentElement.classList.add('perf');
const cleanName = s => String(s||'').replace(/[\u0000-\u001f\u007f<>]/g,'').trim().slice(0,16);
const cleanText = s => String(s||'').replace(/[\u0000-\u001f\u007f​-‏‪-‮]/g,'').trim().slice(0,120);
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* ---------- Settings & theme ---------- */
const DEF={scene:'default',rit:true,b72:true,dockOff:false,theme:'auto',felt:'blue',back:'coral',sound:true,memes:true,anim:true,four:false,hint:true,vib:true,fin:true,lite:false,tour:0,lvlMin:4,lang:'',blinds:10,start:1000,time:40,bots:3,speed:2,mjLevel:'classic',mjFree:true};
const S=Object.assign({},DEF);
try{Object.assign(S,JSON.parse(store.get('jj-set')||store.get('jpp-set')||'{}'));}catch(e){}
const saveS=()=>store.set('jj-set',JSON.stringify(S));
const root=document.documentElement;
function resolvedTheme(){if(S.theme!=='auto')return S.theme;const v=root.getAttribute('data-theme');if(v==='dark'||v==='light')return v;return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
const listeners=[];
function applyS(){
  root.setAttribute('data-jj',resolvedTheme());root.setAttribute('data-felt',S.felt);root.setAttribute('data-back',S.back);
  if(!SCENES[S.scene])S.scene='default';root.setAttribute('data-tone',SCENES[S.scene].tone);
  if(root.getAttribute('data-scene')!==S.scene){root.setAttribute('data-scene',S.scene);document.querySelectorAll('.room-bg').forEach(decorate);}
  document.querySelectorAll('[data-scene-btn]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneBtn===S.scene)));
  root.classList.toggle('noanim',!S.anim);root.classList.toggle('lite',!!S.lite);root.classList.toggle('four',!!S.four);
  document.querySelectorAll('[data-theme-btn]').forEach(b=>{const v=b.dataset.themeBtn;b.setAttribute('aria-pressed',String(b.closest('.modal')?S.theme===v:resolvedTheme()===v));});
  const map={sSound:'sound',sMemes:'memes',sAnim:'anim',sFour:'four',sHint:'hint',sVib:'vib',sFin:'fin',sLite:'lite'};
  Object.entries(map).forEach(([id,k])=>{const el=$(id);if(el)el.checked=!!S[k];});
  document.querySelectorAll('.sound-toggle').forEach(b=>b.innerHTML=`<svg><use href="#i-${S.sound?'sound':'mute'}"/></svg>`);
  document.querySelectorAll('#feltSw .sw').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===S.felt)));
  document.querySelectorAll('#backSw .sw').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===S.back)));
  listeners.forEach(f=>{try{f();}catch(e){}});
}
new MutationObserver(()=>{if(S.theme==='auto')root.setAttribute('data-jj',resolvedTheme());}).observe(root,{attributes:true,attributeFilter:['data-theme']});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(S.theme==='auto')applyS();});}catch(e){}
const animOn=()=>S.anim;

/* ---------- Sound engine ---------- */
let AC=null,master=null;
function ac(){
  if(!S.sound)return null;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.9;master.connect(AC.destination);}catch(e){return null;}}
  if(AC.state==='suspended')AC.resume().catch(()=>{});
  return AC;
}
function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+d);}
function tone(f,d,type,vol,delay,f2){const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);env(g,t,.01,vol||.1,d);o.connect(g).connect(master);o.start(t);o.stop(t+d+.05);}
function noise(d,vol,freq,delay,q,type){const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const n=Math.max(1,Math.floor(a.sampleRate*d));const buf=a.createBuffer(1,n,a.sampleRate);const ch=buf.getChannelData(0);for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=a.createBufferSource();s.buffer=buf;const f=a.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq||2000;f.Q.value=q||1.2;const g=a.createGain();g.gain.value=vol||.2;s.connect(f).connect(g).connect(master);s.start(t);}
/* voice-ish: sawtooth through two formant filters */
function voice(f0,f1,dur,delay,formants,vol){const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const o=a.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=a.createGain();env(g,t,.03,vol||.25,dur);const mix=a.createGain();mix.gain.value=1;(formants||[700,1200]).forEach(fq=>{const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fq;bp.Q.value=6;o.connect(bp).connect(mix);});mix.connect(g).connect(master);o.start(t);o.stop(t+dur+.05);}
function buzz(p){try{if(S.vib&&navigator.vibrate&&document.visibilityState==='visible')navigator.vibrate(p);}catch(e){}}
const SFX={
  chip(n){for(let k=0;k<Math.min(n||2,4);k++){noise(.04,.35,4200,k*.07,4);tone(2400+Math.random()*600,.05,'sine',.05,k*.07);}},
  card(delay){noise(.12,.22,1500,delay||0,.7);},
  riffle(){for(let k=0;k<9;k++)noise(.03,.16,2600+k*90,k*.035,3);},
  check(){noise(.05,.45,500,0,2);noise(.05,.45,500,.12,2);},
  fold(){noise(.18,.15,900,0,.6);},
  turn(){buzz([30,60,30]);tone(660,.16,'sine',.12);tone(990,.24,'sine',.1,.13);},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.1,i*.09));},
  lose(){tone(392,.25,'triangle',.08);tone(311,.35,'triangle',.08,.18);},
  pop(){tone(880,.08,'sine',.07);},
  whoosh(){noise(.28,.18,1400,0,.6);},
  splat(){noise(.2,.5,520,0,1.1);tone(170,.14,'sine',.14,0,90);},
  clink(){tone(2300,.09,'triangle',.08);tone(3100,.14,'triangle',.06,.06);},
  kiss(){tone(700,.07,'sine',.1,0,1400);tone(1500,.09,'sine',.07,.08,900);},
  boom(){noise(.6,.7,260,0,.6);tone(80,.5,'sine',.3,0,40);},
  bawk(){tone(760,.07,'square',.05,0,600);tone(540,.13,'square',.05,.09,420);tone(860,.07,'square',.04,.25,700);},
  chime(){[1047,1319,1568].forEach((f,i)=>tone(f,.28,'sine',.06,i*.07));},
  cash(){for(let k=0;k<4;k++)noise(.04,.3,4200,k*.06,4);tone(1760,.1,'triangle',.07,.26);tone(2350,.18,'triangle',.06,.33);},
  fight(){noise(.5,.55,220,0,.6);tone(110,.5,'sawtooth',.06,0,55);[220,277,330,440].forEach((f,i)=>tone(f,.35,'square',.035,.18+i*.08));},
  click(){tone(1200,.03,'square',.03);},
  match(){tone(1046,.12,'sine',.1);tone(1568,.18,'sine',.08,.06);},
  tick(){tone(1800,.02,'square',.04);},
  coins(){for(let k=0;k<6;k++)tone(1500+Math.random()*900,.07,'triangle',.05,k*.06);},
  level(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.3,'square',.05,i*.08));},
  bad(){tone(180,.12,'square',.05);},
};
/* Original synthesized meme sounds (no outside recordings) */
const MEMES=[
  {name:'Bruh',ic:'😐',play(){voice(120,92,.45,0,[600,1050],.35);}},
  {name:'Boom',ic:'💥',play(){tone(150,1.3,'sine',.6,0,35);noise(.4,.35,180,0,.8,'lowpass');tone(75,1.4,'sine',.35,.02,30);}},
  {name:'Airhorn',ic:'📯',play(){[0,.32,.64].forEach((d,k)=>{const len=k===2?.9:.22;[440,445,554,660].forEach(f=>tone(f,len,'sawtooth',.06,d));});}},
  {name:'Sad trombone',ic:'🎺',play(){[[311,.35],[294,.35],[277,.35],[262,1.1]].reduce((t,[f,d])=>{voice(f,f*(d>1?.94:.99),d,t,[500,1100],.25);return t+d*.92;},0);}},
  {name:'Ba dum tss',ic:'🥁',play(){tone(180,.15,'sine',.4,0,90);tone(140,.18,'sine',.4,.18,70);noise(.6,.3,7000,.4,.6,'highpass');}},
  {name:'Ha ha ha',ic:'🤣',play(){for(let k=0;k<6;k++)voice(420-k*25,330-k*25,.13,k*.16,[800,1300],.3);}},
  {name:'Woooow',ic:'😮',play(){const a=ac();if(!a)return;voice(180,320,.35,0,[350,900],.3);voice(320,150,.6,.35,[700,1100],.3);}},
  {name:'Crickets',ic:'🦗',play(){for(let k=0;k<8;k++)[0,.04,.08].forEach(d=>tone(4300,.03,'sine',.05,k*.32+d));}},
  {name:'Dun dun dunnn',ic:'😱',play(){[[196,.25],[185,.25],[156,1.1]].reduce((t,[f,d])=>{[f,f*1.5,f*2].forEach(x=>tone(x,d,'sawtooth',.04,t));return t+d+.08;},0);}},
  {name:'Applause',ic:'👏',play(){for(let k=0;k<70;k++)noise(.05,.12+Math.random()*.1,1500+Math.random()*2500,Math.random()*1.8,2);}},
  {name:'Cha-ching',ic:'🤑',play(){noise(.08,.3,3000,0,2);[1319,1760,2093].forEach((f,i)=>tone(f,.4,'triangle',.07,.08+i*.05));}},
  {name:'Oof',ic:'🫠',play(){voice(260,140,.3,0,[500,900],.35);}},
];
function playMeme(i){if(!S.sound||!S.memes)return;const m=MEMES[i];if(m)try{m.play();}catch(e){}}
document.addEventListener('pointerdown',()=>{if(S.sound)ac();},{passive:true});

/* ---------- Avatars ---------- */
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const AV_BG=['#ffc83d','#22c995','#ff9bb3','#8fb0ff','#b994ff','#ff8a6b','#6fdcff','#c8e86b'];
const SKIN=['#fbd9c2','#f0bf98','#d49a6c','#a86f47','#74492d'];
const HAIR=['#1d1b2f','#5a3825','#d08b3a','#f1e6c8','#c2384a','#3550e8','#2b2b2b'];
const SHIRT=['#151a36','#2f4be0','#ff6b4a','#22c995','#ffffff','#7a4cf0'];
const ANIMALS=['cat','dog','fox','bear','panda','bunny','frog','koala','pig','owl','tiger','penguin','lion','monkey'];
function avatarSVG(seed,bot){
  const h=hash(seed+(bot?'#bot':'')),pk=(a,k)=>a[(h>>>k)%a.length],dl=-((h>>>4)%55)/10;
  const sp=ANIMALS[h%ANIMALS.length],bg=pk(AV_BG,5),shirt=pk(SHIRT,19);
  const ink='#1d1a2b';
  const eyes=(x1,x2,y,r)=>`<g class="eyes" style="animation-delay:${dl}s"><circle cx="${x1}" cy="${y}" r="${r||2.6}" fill="${ink}"/><circle cx="${x2}" cy="${y}" r="${r||2.6}" fill="${ink}"/><circle cx="${x1+.9}" cy="${y-.9}" r=".9" fill="#fff"/><circle cx="${x2+.9}" cy="${y-.9}" r=".9" fill="#fff"/></g>`;
  const cheeks=(y)=>`<circle cx="21" cy="${y}" r="2.6" fill="#ff7a8a" opacity=".45"/><circle cx="43" cy="${y}" r="2.6" fill="#ff7a8a" opacity=".45"/>`;
  const smile=(y)=>`<path d="M28.5 ${y}q3.5 3 7 0" stroke="${ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  let a='';
  switch(sp){
    case 'cat':{const f=pk(['#f4a259','#9aa3b5','#3d3d4e','#f2e3c6','#e07a3f'],9),i=f==='#3d3d4e'?'#6d6d82':'#ffb3c1';
      a=`<path d="M14 30 18 8l13 12z" fill="${f}"/><path d="M50 30 46 8 33 20z" fill="${f}"/><path d="M17.5 24 19.5 13l6 6z" fill="${i}"/><path d="M46.5 24 44.5 13l-6 6z" fill="${i}"/><ellipse cx="32" cy="35" rx="18" ry="16" fill="${f}"/>${eyes(25,39,34)}<path d="M30 40h4l-2 2.4z" fill="#ff8fa3"/><path d="M28 43.5q2 2 4 0q2 2 4 0" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M12 38h9M12 42l9-1.5M52 38h-9M52 42l-9-1.5" stroke="${f==='#3d3d4e'?'#aaa':ink}" stroke-width="1" opacity=".55"/>`;break;}
    case 'dog':{const f=pk(['#c98a5a','#e8c39e','#8b6b4e','#f5f0e6'],9),e=f==='#f5f0e6'?'#c98a5a':'#6b4a33';
      a=`<ellipse cx="15" cy="33" rx="6.5" ry="13" fill="${e}" transform="rotate(14 15 33)"/><ellipse cx="49" cy="33" rx="6.5" ry="13" fill="${e}" transform="rotate(-14 49 33)"/><circle cx="32" cy="34" r="17" fill="${f}"/><ellipse cx="32" cy="42" rx="9.5" ry="7.5" fill="#fff4e6"/>${eyes(25,39,31)}<ellipse cx="32" cy="38.5" rx="4" ry="3" fill="${ink}"/><path d="M32 41.5v2.5M28.5 44q3.5 2.5 7 0" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M30 46q2 4 4 0z" fill="#ff7a8a"/>`;break;}
    case 'fox':{const f=pk(['#f07b3a','#e2622a','#f3a35c'],9);
      a=`<path d="M13 28 17 5l13 14z" fill="${f}"/><path d="M51 28 47 5 34 19z" fill="${f}"/><path d="M16 22 18 10l7 8z" fill="${ink}" opacity=".75"/><path d="M48 22 46 10l-7 8z" fill="${ink}" opacity=".75"/><path d="M12 30Q32 8 52 30Q50 46 32 55Q14 46 12 30z" fill="${f}"/><path d="M17 36Q26 40 32 54Q38 40 47 36Q44 50 32 55Q20 50 17 36z" fill="#fff"/>${eyes(25,39,33,2.3)}<circle cx="32" cy="50" r="2.8" fill="${ink}"/>`;break;}
    case 'bear':{const f=pk(['#9c6b43','#7a5232','#c4915e'],9);
      a=`<circle cx="17" cy="20" r="7.5" fill="${f}"/><circle cx="47" cy="20" r="7.5" fill="${f}"/><circle cx="17" cy="20" r="4" fill="#e7c49a"/><circle cx="47" cy="20" r="4" fill="#e7c49a"/><circle cx="32" cy="35" r="18" fill="${f}"/><ellipse cx="32" cy="42" rx="8.5" ry="6.5" fill="#e7c49a"/>${eyes(25,39,32)}<ellipse cx="32" cy="39.5" rx="3.6" ry="2.7" fill="${ink}"/>${smile(43)}`;break;}
    case 'panda':
      a=`<circle cx="17" cy="20" r="7.5" fill="${ink}"/><circle cx="47" cy="20" r="7.5" fill="${ink}"/><circle cx="32" cy="35" r="18" fill="#fbfbfb"/><ellipse cx="24.5" cy="34" rx="5.5" ry="7" fill="${ink}" transform="rotate(-25 24.5 34)"/><ellipse cx="39.5" cy="34" rx="5.5" ry="7" fill="${ink}" transform="rotate(25 39.5 34)"/><g class="eyes" style="animation-delay:${dl}s"><circle cx="25" cy="33" r="2" fill="#fff"/><circle cx="39" cy="33" r="2" fill="#fff"/></g><ellipse cx="32" cy="41" rx="3.4" ry="2.4" fill="${ink}"/>${smile(44)}${cheeks(42)}`;break;
    case 'bunny':{const f=pk(['#f3eee6','#c9c1d6','#e9d3c0'],9);
      a=`<ellipse cx="24" cy="13" rx="5.5" ry="14" fill="${f}" transform="rotate(-8 24 13)"/><ellipse cx="40" cy="13" rx="5.5" ry="14" fill="${f}" transform="rotate(8 40 13)"/><ellipse cx="24" cy="14" rx="2.6" ry="10" fill="#ffb3c1" transform="rotate(-8 24 14)"/><ellipse cx="40" cy="14" rx="2.6" ry="10" fill="#ffb3c1" transform="rotate(8 40 14)"/><circle cx="32" cy="38" r="16" fill="${f}"/>${eyes(26,38,36)}<path d="M30.5 41h3l-1.5 2z" fill="#ff8fa3"/><path d="M32 43v2M29 46q3 2 6 0" stroke="${ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>${cheeks(43)}`;break;}
    case 'frog':
      a=`<circle cx="20" cy="24" r="8.5" fill="#5cc26f"/><circle cx="44" cy="24" r="8.5" fill="#5cc26f"/><ellipse cx="32" cy="39" rx="21" ry="15" fill="#5cc26f"/><circle cx="20" cy="24" r="5.5" fill="#fff"/><circle cx="44" cy="24" r="5.5" fill="#fff"/>${eyes(20,44,24,2.8)}<path d="M20 42q12 9 24 0" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="18" cy="38" r="3" fill="#ff7a8a" opacity=".45"/><circle cx="46" cy="38" r="3" fill="#ff7a8a" opacity=".45"/>`;break;
    case 'koala':
      a=`<circle cx="14" cy="26" r="10" fill="#a3a9b8"/><circle cx="50" cy="26" r="10" fill="#a3a9b8"/><circle cx="14" cy="26" r="6" fill="#eae6f0"/><circle cx="50" cy="26" r="6" fill="#eae6f0"/><circle cx="32" cy="36" r="17" fill="#a3a9b8"/>${eyes(24,40,32)}<ellipse cx="32" cy="40" rx="5" ry="7" fill="${ink}"/>`;break;
    case 'pig':
      a=`<path d="M15 24 18 12l9 8z" fill="#f48aa0"/><path d="M49 24 46 12l-9 8z" fill="#f48aa0"/><circle cx="32" cy="35" r="18" fill="#f7a8b8"/>${eyes(24,40,31)}<ellipse cx="32" cy="41" rx="8.5" ry="6" fill="#f48aa0"/><ellipse cx="29" cy="41" rx="1.6" ry="2.2" fill="#b04a62"/><ellipse cx="35" cy="41" rx="1.6" ry="2.2" fill="#b04a62"/>${cheeks(44)}`;break;
    case 'owl':{const f=pk(['#8d6748','#6d7a8f','#a7784e'],9);
      a=`<path d="M14 22 16 8l10 9z" fill="${f}"/><path d="M50 22 48 8l-10 9z" fill="${f}"/><circle cx="32" cy="35" r="19" fill="${f}"/><path d="M18 50q14-14 28 0" fill="#e9d6b8" opacity=".6"/><circle cx="24" cy="31" r="8" fill="#fff"/><circle cx="40" cy="31" r="8" fill="#fff"/><circle cx="24" cy="31" r="8" fill="none" stroke="#f5a623" stroke-width="2"/><circle cx="40" cy="31" r="8" fill="none" stroke="#f5a623" stroke-width="2"/>${eyes(24,40,31,3.6)}<path d="M29.5 38h5L32 43z" fill="#f5a623"/>`;break;}
    case 'tiger':
      a=`<circle cx="17" cy="20" r="6.5" fill="#f39237"/><circle cx="47" cy="20" r="6.5" fill="#f39237"/><circle cx="17" cy="20" r="3.2" fill="#fff"/><circle cx="47" cy="20" r="3.2" fill="#fff"/><circle cx="32" cy="35" r="18" fill="#f39237"/><path d="M32 17v6M26 18l2 5M38 18l-2 5M14 32h6M14 37h5M50 32h-6M50 37h-5" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="32" cy="43" rx="10" ry="7.5" fill="#fff"/>${eyes(25,39,32)}<path d="M29.5 39h5L32 41.8z" fill="#ff7a8a"/><path d="M28.5 44q3.5 2.5 7 0" stroke="${ink}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;break;
    case 'penguin':
      a=`<circle cx="32" cy="34" r="19" fill="#2a3042"/><path d="M32 22c-6-5-14-1-14 8 0 9 6 16 14 18 8-2 14-9 14-18 0-9-8-13-14-8z" fill="#fff"/>${eyes(26,38,32)}<path d="M28.5 37h7L32 42z" fill="#f5a623"/>${cheeks(38)}`;break;
    case 'lion':
      a=`${[0,30,60,90,120,150,180,210,240,270,300,330].map(d=>`<circle cx="${(32+18*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(35+18*Math.sin(d*Math.PI/180)).toFixed(1)}" r="8" fill="#c56a1a"/>`).join('')}<circle cx="32" cy="35" r="15" fill="#f2b14f"/><circle cx="21" cy="23" r="4" fill="#f2b14f"/><circle cx="43" cy="23" r="4" fill="#f2b14f"/>${eyes(26,38,33)}<ellipse cx="32" cy="41" rx="7" ry="5" fill="#fbe2b4"/><path d="M29.5 38.5h5L32 41z" fill="${ink}"/>${smile(42.5)}`;break;
    case 'monkey':
      a=`<circle cx="12" cy="35" r="7" fill="#8a5a3c"/><circle cx="52" cy="35" r="7" fill="#8a5a3c"/><circle cx="12" cy="35" r="4" fill="#f0b8a0"/><circle cx="52" cy="35" r="4" fill="#f0b8a0"/><circle cx="32" cy="33" r="18" fill="#8a5a3c"/><path d="M24 26a6 6 0 0 1 8 2 6 6 0 0 1 8-2c5 2 6 8 4 12 2 6-3 12-12 12s-14-6-12-12c-2-4-1-10 4-12z" fill="#e8c7a0"/>${eyes(27,37,32)}<circle cx="30" cy="40" r="1" fill="${ink}"/><circle cx="34" cy="40" r="1" fill="${ink}"/>${smile(43)}`;break;
  }
  const sc=S.scene||'default';
  const flower=(x,y,r,c,cc)=>`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(d=>`<ellipse cx="0" cy="${-r*.55}" rx="${r*.45}" ry="${r*.6}" fill="${c}" transform="rotate(${d})"/>`).join('')}<circle r="${r*.28}" fill="${cc}"/></g>`;
  let acc='',suit=shirt;
  if(sc==='default')acc=`<path d="M25.5 53.5 32 57l-6.5 3.5zM38.5 53.5 32 57l6.5 3.5z" fill="#ffc83d" stroke="#c99a00" stroke-width=".8"/><circle cx="32" cy="57" r="1.9" fill="#c99a00"/>`;
  if(sc==='ocean')acc=`<path d="M14 58h36M12 61.5h40" stroke="#fff" stroke-width="1.7" opacity=".75"/><g transform="translate(2 -5) rotate(-14 45 12)"><path d="M33 16q11-11 24 0v2.5H33z" fill="#fff"/><rect x="31.5" y="16" width="27" height="4.4" rx="2.2" fill="#2f6fe0"/><path d="M58 18l4 4" stroke="#2f6fe0" stroke-width="2" stroke-linecap="round"/><circle cx="45" cy="9" r="1.8" fill="#2f6fe0"/></g>`;
  if(sc==='explorer'){acc=`<path d="M22 53q10 6 20 0l-2 4q-8 4-16 0z" fill="#e8590c"/><g transform="translate(2 -5) rotate(-12 42 13)"><ellipse cx="42" cy="16" rx="15" ry="3.4" fill="#a87b42"/><path d="M30 16q0-12 12-12t12 12z" fill="#d9b277"/><path d="M30.5 13.5h23" stroke="#7a5326" stroke-width="2.2"/><path d="M42 4v-2" stroke="#7a5326" stroke-width="2" stroke-linecap="round"/></g>`;suit='#8a6a3a';}
  if(sc==='space'){suit='#e9ecf6';acc=`<rect x="36" y="55" width="7" height="5" rx="1" fill="#ff5e5e"/><circle cx="32" cy="33" r="27" fill="rgba(190,225,255,.14)" stroke="rgba(255,255,255,.9)" stroke-width="2.4"/><path d="M13 24a21 21 0 0 1 13-12" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="48" cy="46" r="1.6" fill="#fff" opacity=".7"/>`;}
  if(sc==='jungle')acc=`<path d="M36 12q6-10 16-7-3 9-16 7z" fill="#2f9e5b"/><path d="M37 11.5q6-3 14-6" stroke="#1f7a45" stroke-width="1"/>${flower(48,15,9,'#ff5d7a','#ffd23f')}`;
  if(sc==='synth'){suit='#241650';acc=`<path d="M14 35a18 18 0 0 1 36 0" stroke="#ff3df0" stroke-width="3.4" fill="none" stroke-linecap="round"/><rect x="9" y="30" width="8.5" height="13" rx="4" fill="#1d1a2b" stroke="#5ff4ff" stroke-width="1.8"/><rect x="46.5" y="30" width="8.5" height="13" rx="4" fill="#1d1a2b" stroke="#5ff4ff" stroke-width="1.8"/><path d="M18 58h28" stroke="#ff3df0" stroke-width="2" opacity=".9"/>`;}
  if(sc==='aurora'){acc=`<path d="M18 52.5q14 6 28 0l-.5 5.5q-13.5 5-27 0z" fill="#e63946"/><path d="M38 55l3.5 9h-5.5l-2-8.5z" fill="#c92a37"/><g transform="translate(0 -4)"><path d="M14.5 23q17.5-22 35 0z" fill="#2fb8a8"/><path d="M20 15l3 7M27 10l1.5 9M37 10l-1.5 9M44 15l-3 7" stroke="#249488" stroke-width="2"/><rect x="12.5" y="20.5" width="39" height="6.5" rx="3.2" fill="#eef6ff"/><circle cx="32" cy="4.5" r="4" fill="#eef6ff"/></g>`;}
  if(sc==='sakura')acc=`${flower(47,15,8,'#ffc4d8','#ff6f9c')}${flower(39,10,5.5,'#ffd8e6','#ff6f9c')}<circle cx="53" cy="22" r="1.6" fill="#ffb0cb"/>`;
  const antenna=bot?`<line x1="32" y1="1.5" x2="32" y2="9" stroke="${ink}" stroke-width="2"/><circle cx="32" cy="2.8" r="2.6" fill="#22c995" stroke="${ink}" stroke-width="1.2"/>`:'';
  return `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><path d="M10 64c2-9 10-13 22-13s20 4 22 13z" fill="${suit}"/>${a}${acc}${antenna}</svg>`;
}
const CROWN=`<svg class="crown" viewBox="0 0 30 22" aria-hidden="true"><path d="M3 18 1 5l8 6 6-10 6 10 8-6-2 13z" fill="#ffc83d" stroke="#151a36" stroke-width="2" stroke-linejoin="round"/><circle cx="15" cy="13" r="2" fill="#ff6b4a"/></svg>`;

/* ---------- Playing cards ---------- */
const SUITS=['♠','♥','♦','♣'],RED=[0,1,1,0],SUIT_NAMES=['spades','hearts','diamonds','clubs'];
const NAMES={2:'Two',3:'Three',4:'Four',5:'Five',6:'Six',7:'Seven',8:'Eight',9:'Nine',10:'Ten',11:'Jack',12:'Queen',13:'King',14:'Ace'};
const rl=r=>({11:'J',12:'Q',13:'K',14:'A'})[r]||String(r);
const cardOf=id=>({r:Math.floor(id/4),s:id%4,id});
const cstr=c=>rl(c.r)+SUITS[c.s];
function cardFace(c,o){
  o=o||{};const del=o.flipAt!=null&&o.anim==='deal'?` style="--dd:${Math.round(o.delay||0)}ms;--fd:${Math.round(o.flipAt)}ms"`:o.delay?` style="animation-delay:${Math.round(o.delay)}ms"`:'';
  if(o.flipAt!=null&&o.anim==='deal')o.cls=(o.cls?o.cls+' ':'')+'mine';
  if(o.down)return `<div class="card back${o.anim?' '+o.anim:''}${o.cls?' '+o.cls:''}"${del} aria-label="Face-down card"></div>`;
  return `<div class="card s${c.s}${RED[c.s]?' red':''}${o.anim?' '+o.anim:''}${o.cls?' '+o.cls:''}"${del} aria-label="${NAMES[c.r]} of ${SUIT_NAMES[c.s]}"><span class="cr">${rl(c.r)}</span><span class="cs">${SUITS[c.s]}</span><span class="cb">${SUITS[c.s]}</span></div>`;
}
function shuffle(a){const u=new Uint32Array(a.length);try{crypto.getRandomValues(u);}catch(e){for(let i=0;i<u.length;i++)u[i]=Math.random()*4294967296;}for(let i=a.length-1;i>0;i--){const j=u[i]%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- FX layer: flying chips, confetti, floating text ---------- */
let fx=null;
function fxLayer(){if(!fx){fx=document.createElement('div');fx.className='fx-layer';document.body.appendChild(fx);}return fx;}
function centerPx(el){const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}
const CHIP_COLORS=['#ff6b4a','#ffc83d','#22c995','#7a4cf0','#ffffff','#2f4be0'];
function flyChips(fromEl,toEl,n,delay,opts){
  opts=opts||{};
  if(!fromEl||!toEl||!fromEl.getBoundingClientRect().width||!toEl.getBoundingClientRect().width)return;
  if(!opts.silent)setTimeout(()=>SFX.chip(n),(delay||0)+420);
  if(!animOn())return;
  const L=fxLayer();const [x0,y0]=centerPx(fromEl),[x1,y1]=centerPx(toEl);
  for(let k=0;k<n;k++){
    const c=document.createElement('i');c.className='pchip fly';c.style.setProperty('--c',CHIP_COLORS[k%CHIP_COLORS.length]);if(opts.coin)c.classList.add('coin');L.appendChild(c);
    const jx=(Math.random()-.5)*16,jy=(Math.random()-.5)*10,mx=(x0+x1)/2+(Math.random()-.5)*60,my=Math.min(y0,y1)-50-Math.random()*40;
    const a=c.animate([{transform:`translate(${x0}px,${y0}px) scale(.5)`,opacity:0},{transform:`translate(${x0}px,${y0}px) scale(1.1)`,opacity:1,offset:.08},{transform:`translate(${mx}px,${my}px) scale(1.15) rotate(200deg)`,opacity:1,offset:.5},{transform:`translate(${x1+jx}px,${y1+jy}px) scale(.85) rotate(360deg)`,opacity:1,offset:.92},{transform:`translate(${x1+jx}px,${y1+jy}px) scale(.6)`,opacity:0}],{duration:820,delay:(delay||0)+k*70,easing:'cubic-bezier(.3,.55,.25,1)',fill:'both'});
    a.onfinish=()=>c.remove();
  }
}
function floatText(el,text,cls){
  if(!el)return;const [x,y]=centerPx(el);const t=document.createElement('div');t.className='float-txt '+(cls||'');t.textContent=text;t.style.left=x+'px';t.style.top=y+'px';fxLayer().appendChild(t);
  if(!animOn()){setTimeout(()=>t.remove(),1200);return;}
  t.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:0},{transform:'translate(-50%,-90%) scale(1.1)',opacity:1,offset:.2},{transform:'translate(-50%,-220%) scale(1)',opacity:0}],{duration:1500,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).onfinish=()=>t.remove();
}
function floatEmoji(el,emoji){
  if(!el)return;const [x,y]=centerPx(el);const e=document.createElement('span');e.className='emo';e.textContent=emoji;fxLayer().appendChild(e);
  if(!animOn()){e.style.transform=`translate(${x}px,${y-50}px)`;setTimeout(()=>e.remove(),1500);return;}
  const dx=(Math.random()-.5)*40;
  e.animate([{transform:`translate(${x}px,${y}px) scale(.3)`,opacity:0},{transform:`translate(${x+dx/2}px,${y-50}px) scale(1.3)`,opacity:1,offset:.25},{transform:`translate(${x+dx}px,${y-130}px) scale(1)`,opacity:0}],{duration:1800,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).onfinish=()=>e.remove();
}
function confetti(){
  if(!animOn())return;
  const cv=document.createElement('canvas');cv.className='confetti';fxLayer().appendChild(cv);const ctx=cv.getContext('2d');
  const w=cv.width=innerWidth,h=cv.height=innerHeight;if(perf)cv.style.imageRendering='auto';const cols=['#ff6b4a','#ffc83d','#22c995','#2f4be0','#ff9bb3','#ffffff'];
  const ps=Array.from({length:perf?80:170},()=>({x:w/2+(Math.random()-.5)*w*.4,y:h*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,r:Math.random()*7+4,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*6,s:(Math.random()-.5)*.3,coin:Math.random()<.28}));
  const t0=performance.now();
  const fr=t=>{const e=t-t0;ctx.clearRect(0,0,w,h);ps.forEach(p=>{p.vy+=.32;p.x+=p.vx;p.y+=p.vy;p.a+=p.s;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.globalAlpha=Math.max(0,1-e/2200);if(p.coin){ctx.fillStyle='#ffc83d';ctx.beginPath();ctx.ellipse(0,0,p.r,p.r*Math.abs(Math.cos(p.a*2))+.5,0,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);}ctx.restore();});if(e<2200)requestAnimationFrame(fr);else cv.remove();};
  requestAnimationFrame(fr);
}
function toast(html,kind,ms){
  let host=$('toasts');if(!host){host=document.createElement('div');host.id='toasts';host.className='toasts';host.setAttribute('aria-live','polite');document.body.appendChild(host);}
  while(host.children.length>=3)host.firstChild.remove();
  const t=document.createElement('div');t.className='toast '+(kind||'');t.innerHTML=html;host.appendChild(t);
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400);},ms||3200);
}

/* ---------- Profile: coins, XP, stats, achievements ---------- */
const ACH=[
  {id:'first_hand',ic:'🃏',name:'Shuffle up',desc:'Play your first poker hand',coins:100},
  {id:'first_pot',ic:'💰',name:'First blood',desc:'Win a poker pot',coins:150},
  {id:'big_pot',ic:'🐳',name:'Whale watching',desc:'Win a pot of 25 big blinds or more',coins:400},
  {id:'allin_win',ic:'🔥',name:'Send it',desc:'Win a hand after going all-in',coins:300},
  {id:'monster',ic:'👑',name:'Monster hand',desc:'Win with a full house or better',coins:500},
  {id:'bluff',ic:'🎭',name:'Poker face',desc:'Win a pot without showing your cards',coins:150},
  {id:'host',ic:'🏠',name:'House party',desc:'Host an online room',coins:200},
  {id:'chatty',ic:'💬',name:'Table talk',desc:'Send a chat message or meme',coins:50},
  {id:'bj_first',ic:'🂡',name:'Natural',desc:'Hit a blackjack',coins:250},
  {id:'bj_streak',ic:'⚡',name:'Hot streak',desc:'Win 5 blackjack hands in a row',coins:600},
  {id:'bj_double',ic:'✌️',name:'Double trouble',desc:'Win a doubled hand',coins:200},
  {id:'mj_clear',ic:'🧘',name:'Zen master',desc:'Clear a mahjong board',coins:400},
  {id:'mj_fast',ic:'⏱️',name:'Speed tiles',desc:'Clear an easy mahjong board in under 4 minutes',coins:500},
  {id:'mj_combo',ic:'🌀',name:'Combo breaker',desc:'Reach a ×5 mahjong combo',coins:250},
  {id:'p_72',ic:'7️⃣',name:'Seven-deuce king',desc:'Collect the 7-2 bounty',coins:400},
  {id:'sl_big',ic:'🎰',name:'Reel deal',desc:'Hit a big win on Lucky Slots',coins:200},
  {id:'sl_jack',ic:'💰',name:'Jackpot!',desc:'Line up 7️⃣7️⃣7️⃣ on Lucky Slots',coins:1000},
  {id:'p_rabbit',ic:'🐇',name:'Rabbit hunter',desc:'Use the rabbit hunt',coins:50},
  {id:'p_rit',ic:'🔁',name:'Twice as nice',desc:'Win both runs when running it twice',coins:300},
  {id:'mj4_win',ic:'🀄',name:'Mahjong!',desc:'Win a 4-player mahjong hand',coins:300},
  {id:'mj4_big',ic:'🐉',name:'Dragon tamer',desc:'Win a mahjong hand worth 3 fan or more',coins:600},
  {id:'spin',ic:'🎡',name:'Wheel of fortune',desc:'Spin the daily wheel',coins:0},
  {id:'level5',ic:'⭐',name:'Regular',desc:'Reach level 5',coins:1000},
];
const P={coins:2000,xp:0,stats:{ph:0,pw:0,big:0,bjh:0,bjw:0,bjbj:0,bjstreak:0,bjbest:0,mjc:0,mjbest:0},ach:{},lastSpin:0};
try{const s=JSON.parse(store.get('jj-prof')||'null');if(s){Object.assign(P,s);P.stats=Object.assign({ph:0,pw:0,big:0,bjh:0,bjw:0,bjbj:0,bjstreak:0,bjbest:0,mjc:0,mjbest:0},s.stats||{});P.ach=s.ach||{};}}catch(e){}
const saveP=()=>store.set('jj-prof',JSON.stringify(P));
const level=xp=>Math.floor(Math.sqrt((xp||0)/120))+1;
const xpFor=l=>(l-1)*(l-1)*120;
const profileListeners=[];
function profChanged(){saveP();profileListeners.forEach(f=>{try{f();}catch(e){}});}
function addCoins(n){P.coins=Math.max(0,Math.round(P.coins+n));profChanged();}
function addXP(n){const before=level(P.xp);P.xp+=Math.max(0,Math.round(n));const after=level(P.xp);profChanged();if(after>before){SFX.level();confetti();toast(`<b>Level ${after}!</b> You got <b>${num(after*100)}</b> bonus coins.`,'gold',4000);addCoins(after*100);if(after>=5)unlock('level5');}}
function unlock(id){if(P.ach[id])return;const a=ACH.find(x=>x.id===id);if(!a)return;P.ach[id]=Date.now();if(a.coins)P.coins+=a.coins;profChanged();SFX.coins();toast(`<span class="t-ic">${a.ic}</span><span><b>Achievement: ${esc(a.name)}</b><br>${esc(a.desc)}${a.coins?` · +${num(a.coins)} coins`:''}</span>`,'ach',4200);}
function stat(k,v,mode){if(mode==='max')P.stats[k]=Math.max(P.stats[k]||0,v);else P.stats[k]=(P.stats[k]||0)+(v==null?1:v);profChanged();}

/* ---------- Room themes ---------- */
const SCENES={
  default:{name:'JJ Lounge',ic:'🎰',felt:'blue',back:'coral',desc:'Neon, lamps, late nights',tone:'none'},
  ocean:{name:'Under the Sea',ic:'🐠',felt:'teal',back:'blue',desc:'Reefs, turtles, light rays',tone:'dark'},
  explorer:{name:'Explorer',ic:'🧭',felt:'green',back:'coral',desc:'Old maps, balloons, flights',tone:'light'},
  space:{name:'Deep Space',ic:'🪐',felt:'purple',back:'violet',desc:'Rockets, planets, comets',tone:'dark'},
  jungle:{name:'Jungle',ic:'🌴',felt:'green',back:'mint',desc:'Parrots, vines, fireflies',tone:'dark'},
  sakura:{name:'Sakura',ic:'🌸',felt:'rose',back:'coral',desc:'Cherry blossoms, lanterns',tone:'light'},
  synth:{name:'Neon City',ic:'🌆',felt:'purple',back:'violet',desc:'Synthwave sunset, glowing grid',tone:'dark'},
  aurora:{name:'Aurora',ic:'🏔️',felt:'teal',back:'blue',desc:'Northern lights, snow, pines',tone:'dark'},
};
const R=(a,b)=>a+Math.random()*(b-a);
function lampHTML(cls){return `<div class="lamp ${cls}"><svg viewBox="0 0 100 120"><line x1="50" y1="0" x2="50" y2="60" stroke="#2a2f55" stroke-width="2"/><path d="M22 92c0-18 12-32 28-32s28 14 28 32z" fill="#151a36"/><path d="M22 92h56" stroke="#ffc83d" stroke-width="3"/><ellipse cx="50" cy="94" rx="10" ry="5" fill="#fff3c4"/></svg><div class="cone"></div></div>`;}
function decorate(el){
  const label=el.dataset.label||'JJ POKER',sub=el.dataset.sub||'OPEN LATE',side=el.dataset.side?' side':'';
  const sc=S.scene||'default';let h=`<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>`;
  const neonTxt={ocean:'UNDER THE SEA',explorer:'EXPLORERS CLUB',space:'ORBIT CLUB',jungle:'JUNGLE ROOM',sakura:'BLOSSOM HOUSE',synth:'NEON CITY',aurora:'NORTHERN LIGHTS'}[sc];
  h+=`<div class="neon${side}">${label}<small>${sc==='default'?sub:neonTxt}</small></div>`;
  if(sc==='default'){h+=lampHTML('l1')+lampHTML('l2');for(let i=0;i<18;i++)h+=`<span class="mote" style="left:${R(0,100)}%;top:${R(30,100)}%;width:${R(3,9)}px;height:${R(3,9)}px;--c:${['#ffc83d','#ff9bb3','#8fb0ff','#22c995','#fff'][i%5]};--d:${R(10,24)}s;--dl:${-R(0,20)}s;--x:${R(-40,40)}px;--o:${R(.15,.4)}"></span>`;}
  if(sc==='ocean'){
    for(let i=0;i<4;i++)h+=`<span class="ray" style="left:${10+i*24}%;--r:${R(-18,18)}deg;--dl:${-R(0,8)}s"></span>`;
    for(let i=0;i<22;i++){const z=R(4,16);h+=`<span class="bub" style="left:${R(0,100)}%;width:${z}px;height:${z}px;--d:${R(7,16)}s;--dl:${-R(0,16)}s;--x:${R(-30,30)}px"></span>`;}
    const fc=['#ffb347','#ff6b8a','#ffd93d','#6fdcff','#b994ff'];
    for(let i=0;i<5;i++){const rev=i%2;h+=`<span class="fish${rev?' rev':''}" style="top:${R(14,80)}%;--d:${R(18,34)}s;--dl:${-R(0,30)}s;--s:${R(.6,1.3)}"><svg viewBox="0 0 64 32"><path d="M6 16Q22 0 42 16Q22 32 6 16z" fill="${fc[i]}"/><path d="M40 16l16-10v20z" fill="${fc[i]}"/><path d="M20 9q4 7 0 14" stroke="rgba(0,0,0,.2)" stroke-width="2" fill="none"/><circle cx="13" cy="14" r="2.2" fill="#10182a"/></svg></span>`;}
    for(let i=0;i<8;i++)h+=`<span class="weed" style="left:${R(0,100)}%;--h:${R(80,200)}px;--dl:${-R(0,6)}s"><svg viewBox="0 0 30 200" preserveAspectRatio="none"><path d="M15 200C0 160 30 130 15 100S0 40 15 0" stroke="${['#1b9e77','#2bc48a','#127a5c'][i%3]}" stroke-width="7" fill="none" stroke-linecap="round"/></svg></span>`;
    h+=`<span class="jelly" style="left:${R(8,20)}%;top:${R(20,40)}%"><svg viewBox="0 0 60 90"><path d="M5 30a25 25 0 0 1 50 0q-5 6-10 0-5 6-10 0-5 6-10 0-5 6-10 0-5 6-10 0z" fill="rgba(255,150,220,.55)"/><path d="M15 34q-4 20 2 40M25 34q4 22-2 46M35 34q-4 22 2 46M45 34q4 20-2 40" stroke="rgba(255,170,230,.5)" stroke-width="2" fill="none"/></svg></span>`;
    h+=`<span class="caustic"></span>`;
    h+=`<span class="whale"><svg viewBox="0 0 300 120"><path d="M10 70C40 20 160 10 230 50c20 12 30 8 44-14 6 18 4 34-8 46 14 6 22 14 24 26-20-6-34-6-46 0-40 20-150 24-200-6C30 94 6 84 10 70z" fill="rgba(4,30,60,.55)"/><circle cx="60" cy="66" r="4" fill="rgba(160,220,255,.5)"/></svg></span>`;
    h+=`<span class="turtle"><svg viewBox="0 0 90 60"><g class="flip f1"><path d="M30 18 12 4c-4 0-4 6 0 9l14 10z" fill="#4fae7c"/></g><g class="flip f2"><path d="M30 42 12 56c-4 0-4-6 0-9l14-10z" fill="#4fae7c"/></g><path d="M62 40l12 12c3 1 5-3 3-5l-9-12z" fill="#4fae7c"/><path d="M62 20l12-12c3-1 5 3 3 5l-9 12z" fill="#4fae7c"/><ellipse cx="80" cy="30" rx="9" ry="7" fill="#5fc28d"/><circle cx="84" cy="27.5" r="1.6" fill="#10202a"/><ellipse cx="46" cy="30" rx="26" ry="19" fill="#2f8f5f"/><path d="M46 13l9 9-9 9-9-9zM46 31l9 9-9 8-9-8zM28 24l9 6-9 8-6-7zM64 24l-9 6 9 8 6-7z" fill="#3fb07a" opacity=".85"/></svg></span>`;
    h+=`<svg class="reef" viewBox="0 0 1000 130" preserveAspectRatio="none"><path d="M0 130V96c40-12 70 6 110-6s60-30 110-18 60 26 120 16 80-34 140-24 70 30 130 20 90-26 150-14 70 26 100 22 30-8 40-6V130z" fill="#0a3d5c"/>${[[70,'#ff7aa8'],[230,'#ffb347'],[410,'#b994ff'],[560,'#ff6b8a'],[720,'#ffd93d'],[880,'#6fdcff']].map(([x,c],i)=>`<g class="coral" style="animation-delay:${-i*.7}s;transform-origin:${x}px 120px"><path d="M${x} 120v-38m0 14-14-16m14 6 12-18m-12 34 18-10" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="${x-14}" cy="80" r="5" fill="${c}"/><circle cx="${x+12}" cy="66" r="5" fill="${c}"/><circle cx="${x}" cy="80" r="5" fill="${c}"/><circle cx="${x+18}" cy="88" r="4" fill="${c}"/></g>`).join('')}${[150,480,800].map(x=>`<g><ellipse cx="${x}" cy="118" rx="26" ry="12" fill="#ff9e6b"/><path d="M${x-20} 116q20-14 40 0" stroke="#e8794a" stroke-width="2" fill="none"/></g>`).join('')}</svg>`;
    h+=`<span class="starfish">⭐</span>`;
  }
  if(sc==='explorer'){
    let paths='';[[200,180],[780,420],[560,120]].forEach(([cx,cy],k)=>{for(let r=1;r<=6;r++){let d='';for(let a=0;a<=360;a+=20){const rr=r*26+Math.sin(a*.05+k)*8+Math.cos(a*.11+r)*6;const x=cx+rr*Math.cos(a*Math.PI/180),y=cy+rr*.7*Math.sin(a*Math.PI/180);d+=(a?'L':'M')+x.toFixed(0)+' '+y.toFixed(0);}paths+=`<path d="${d}Z"/>`;}});
    let grid='';for(let x=0;x<=1000;x+=100)grid+=`<line x1="${x}" y1="0" x2="${x}" y2="600"/>`;for(let y=0;y<=600;y+=100)grid+=`<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`;
    h+=`<svg class="map" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice"><g class="grid">${grid}</g><g class="contours">${paths}</g><path class="route" d="M80 520C260 300 420 560 600 300S900 80 960 160"/></svg>`;
    h+=`<span class="plane">✈</span>`;
    h+=`<span class="compass"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/><path d="M50 8 56 50 50 92 44 50z" fill="currentColor" opacity=".25"/><path d="M8 50 50 44 92 50 50 56z" fill="currentColor" opacity=".25"/><g class="needle"><path d="M50 14 56 50H44z" fill="#d92d20"/><path d="M50 86 56 50H44z" fill="currentColor"/></g><text x="50" y="7" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">N</text></svg></span>`;
    [[18,62],[72,30],[58,74]].forEach(([x,y],i)=>h+=`<span class="mpin" style="left:${x}%;top:${y}%;--dl:${-i*.7}s">📍</span>`);
    const cloud=`<svg viewBox="0 0 120 60"><path d="M22 52h76a18 18 0 0 0 0-36 26 26 0 0 0-50-6 20 20 0 0 0-26 42z" fill="currentColor"/></svg>`;
    for(let i=0;i<4;i++)h+=`<span class="cloud" style="top:${R(6,46)}%;--d:${R(60,110)}s;--dl:${-R(0,100)}s;--s:${R(.6,1.4)}">${cloud}</span>`;
    h+=`<span class="balloon"><svg viewBox="0 0 80 120"><path d="M40 4C18 4 6 22 6 40c0 22 22 38 28 50h12c6-12 28-28 28-50C74 22 62 4 40 4z" fill="#e8590c"/><path d="M40 4c-10 0-16 18-16 36s10 38 12 50h8c2-12 12-32 12-50S50 4 40 4z" fill="#ffd166"/><path d="M40 4c-3 0-5 18-5 36s3 38 3 50h4c0-12 3-32 3-50S43 4 40 4z" fill="#e8590c"/><path d="M34 90l-2 12M46 90l2 12" stroke="#6b4a2b" stroke-width="1.5"/><rect x="30" y="102" width="20" height="13" rx="3" fill="#8a5a2b"/></svg></span>`;
    h+=`<svg class="peaks" viewBox="0 0 1000 160" preserveAspectRatio="none"><path d="M0 160 120 70l60 40 110-90 90 80 70-40 120 100 90-60 110 70 90-50 140 80z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M290 20l-30 30 18-6 12 10 10-12 20 6z" fill="currentColor" opacity=".5"/></svg>`;
    h+=`<span class="stamp"><b>JJ</b>AIR MAIL<small>★ ${new Date().getFullYear()} ★</small></span>`;
  }
  if(sc==='space'){
    for(let i=0;i<70;i++){const z=R(1,3);h+=`<span class="star" style="left:${R(0,100)}%;top:${R(0,100)}%;width:${z}px;height:${z}px;--d:${R(2,5)}s;--dl:${-R(0,5)}s"></span>`;}
    h+=`<span class="planet"><svg viewBox="0 0 140 100"><ellipse cx="70" cy="52" rx="66" ry="14" fill="none" stroke="#ffd59e" stroke-width="5" opacity=".75"/><circle cx="70" cy="50" r="30" fill="url(#plg)"/><path d="M42 58a30 30 0 0 0 56 0" fill="none"/><ellipse cx="70" cy="52" rx="66" ry="14" fill="none" stroke="#ffd59e" stroke-width="5" stroke-dasharray="0 104 100" opacity=".9"/><defs><linearGradient id="plg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9bd2"/><stop offset="1" stop-color="#7a4cf0"/></linearGradient></defs></svg></span>`;
    h+=`<span class="moon"></span>`;
    for(let i=0;i<3;i++)h+=`<span class="shoot" style="top:${R(5,45)}%;left:${R(30,90)}%;--dl:${i*4+R(0,3)}s"></span>`;
    for(let i=0;i<6;i++)h+=`<span class="spark" style="left:${R(4,96)}%;top:${R(4,90)}%;--d:${R(3,6)}s;--dl:${-R(0,6)}s;--z:${R(10,20)}px"></span>`;
    h+=`<span class="rocket"><svg viewBox="0 0 60 120"><g class="flame"><path d="M22 92q8 30 8 26 0 4 8-26z" fill="#ffb347"/><path d="M26 92q4 18 4 16 0 2 4-16z" fill="#fff3c4"/></g><path d="M30 4C16 18 14 44 16 92h28c2-48 0-74-14-88z" fill="#f1f3fb"/><path d="M30 4c-6 6-10 14-12 24h24C40 18 36 10 30 4z" fill="#ff5e5e"/><circle cx="30" cy="48" r="8" fill="#4d7dff" stroke="#c6cde3" stroke-width="3"/><path d="M16 70 4 94h12zM44 70l12 24H44z" fill="#ff5e5e"/></svg></span>`;
    h+=`<span class="sat"><svg viewBox="0 0 120 60"><rect x="4" y="18" width="34" height="24" rx="2" fill="#3a5bd9" stroke="#9fb3ff" stroke-width="1.5"/><path d="M15 18v24M26 18v24M4 30h34" stroke="#9fb3ff" stroke-width="1"/><rect x="82" y="18" width="34" height="24" rx="2" fill="#3a5bd9" stroke="#9fb3ff" stroke-width="1.5"/><path d="M93 18v24M104 18v24M82 30h34" stroke="#9fb3ff" stroke-width="1"/><path d="M38 30h44" stroke="#c6cde3" stroke-width="3"/><rect x="48" y="16" width="24" height="28" rx="5" fill="#e3e7f3"/><path d="M60 16V6" stroke="#c6cde3" stroke-width="2"/><circle cx="60" cy="5" r="3" fill="#ff5ea8"/></svg></span>`;
    h+=`<span class="astro"><svg viewBox="0 0 80 100"><path d="M24 54 8 66c-4 3 0 9 4 7l16-9zM56 54l16 12c4 3 0 9-4 7l-16-9z" fill="#e8ebf5"/><rect x="22" y="44" width="36" height="34" rx="12" fill="#f4f6fc"/><rect x="31" y="54" width="18" height="10" rx="3" fill="#ff8a4c"/><path d="M26 76v14c0 4 10 4 10 0V78zM44 78v12c0 4 10 4 10 0V76z" fill="#e8ebf5"/><circle cx="40" cy="28" r="20" fill="#f4f6fc"/><rect x="26" y="18" width="28" height="20" rx="10" fill="#1d2a5c"/><path d="M31 23q5-4 12-2" stroke="#8fb0ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg></span>`;
  }
  if(sc==='jungle'){
    const leaf=(c)=>`<svg viewBox="0 0 120 160"><path d="M60 156C10 120 0 60 60 4c60 56 50 116 0 152z" fill="${c}"/><path d="M60 150V10" stroke="rgba(0,0,0,.25)" stroke-width="3"/>${[30,55,80,105].map(y=>`<path d="M60 ${y}l-34 -14M60 ${y}l34 -14" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`).join('')}</svg>`;
    [['tl','#2f9e5b'],['tr','#1f7a45'],['bl','#3cb371'],['br','#257a4b'],['tl2','#46c07a'],['tr2','#2a8a52']].forEach(([p,c])=>h+=`<span class="leaf ${p}">${leaf(c)}</span>`);
    for(let i=0;i<4;i++)h+=`<span class="vine" style="left:${10+i*26+R(-4,4)}%;--h:${R(120,260)}px;--dl:${-R(0,5)}s"></span>`;
    for(let i=0;i<18;i++)h+=`<span class="ffly" style="left:${R(0,100)}%;top:${R(20,95)}%;--d:${R(5,11)}s;--dl:${-R(0,10)}s;--x:${R(-60,60)}px;--y:${R(-50,50)}px"></span>`;
    h+=`<span class="mist"></span>`;
    h+=`<span class="parrot"><svg viewBox="0 0 100 70"><g class="wing"><path d="M40 30C30 4 10 2 4 8c14 2 22 14 30 28z" fill="#2f6fe0"/><path d="M40 30C34 12 22 8 14 10c10 4 16 14 22 24z" fill="#ffd23f"/></g><path d="M20 40c10-14 34-16 50-8l10 6-12 4c-8 10-26 16-48 12z" fill="#e63946"/><path d="M22 52 4 66l22-8z" fill="#2f6fe0"/><circle cx="74" cy="34" r="10" fill="#e63946"/><path d="M82 32q12 2 10 12-4-6-10-4z" fill="#f4d58d"/><circle cx="76" cy="31" r="3.4" fill="#fff"/><circle cx="76.8" cy="31" r="1.8" fill="#10202a"/></svg></span>`;
    const bfc=['#ffd23f','#ff7aa8','#6fdcff','#ff9e3d'];
    for(let i=0;i<5;i++)h+=`<span class="bfly" style="left:${R(8,88)}%;top:${R(30,80)}%;--d:${R(9,15)}s;--dl:${-R(0,12)}s;--x:${R(-120,120)}px;--y:${R(-80,40)}px"><svg viewBox="0 0 40 30"><g class="wl"><path d="M20 15C14 2 2 2 4 12c1 6 8 6 16 3z" fill="${bfc[i%4]}"/><path d="M20 15C12 18 6 26 10 28s8-6 10-13z" fill="${bfc[i%4]}" opacity=".8"/></g><g class="wr"><path d="M20 15C26 2 38 2 36 12c-1 6-8 6-16 3z" fill="${bfc[i%4]}"/><path d="M20 15c8 3 14 11 10 13s-8-6-10-13z" fill="${bfc[i%4]}" opacity=".8"/></g><path d="M20 8v16" stroke="#1d1a2b" stroke-width="2" stroke-linecap="round"/></svg></span>`;
    [[6,'#ff5d7a'],[88,'#ffb347'],[52,'#ff7aa8']].forEach(([x,c],i)=>h+=`<span class="hibis" style="left:${x}%;--dl:${-i*1.3}s"><svg viewBox="0 0 40 40">${[0,72,144,216,288].map(a=>`<ellipse cx="20" cy="10" rx="7" ry="10" fill="${c}" transform="rotate(${a} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="4" fill="#ffd23f"/></svg></span>`);
  }
  if(sc==='synth'){
    for(let i=0;i<45;i++){const z=R(1,2.6);h+=`<span class="star" style="left:${R(0,100)}%;top:${R(0,55)}%;width:${z}px;height:${z}px;--d:${R(2,5)}s;--dl:${-R(0,5)}s"></span>`;}
    h+=`<span class="sw-sunwrap"><span class="sw-sun"></span></span>`;
    let bl='',wn='';let x=0;
    while(x<1000){const w=R(26,70),ht=R(40,170);bl+=`<rect x="${x.toFixed(0)}" y="${(200-ht).toFixed(0)}" width="${w.toFixed(0)}" height="${ht.toFixed(0)}"/>`;
      for(let yy=200-ht+8;yy<192;yy+=12)for(let xx=x+5;xx<x+w-6;xx+=10)if(Math.random()<.32)wn+=`<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="4" height="5" fill="${Math.random()<.7?'#ffd36b':'#5ff4ff'}"/>`;
      if(Math.random()<.25)bl+=`<rect x="${(x+w/2-1).toFixed(0)}" y="${(200-ht-24).toFixed(0)}" width="2" height="24"/>`;
      x+=w+R(2,8);}
    h+=`<svg class="sw-city" viewBox="0 0 1000 200" preserveAspectRatio="none"><g class="far">${bl.replace(/y="(\d+)"/g,(m,v)=>`y="${Math.min(198,Number(v)+40)}"`)}</g><g class="near">${bl}</g><g class="win">${wn}</g></svg>`;
    h+=`<span class="sw-floor"><span class="sw-grid"></span></span>`;
    for(let i=0;i<2;i++)h+=`<span class="sw-car" style="top:${R(18,42)}%;--d:${R(9,14)}s;--dl:${-R(0,10)}s"></span>`;
  }
  if(sc==='aurora'){
    for(let i=0;i<60;i++){const z=R(1,2.6);h+=`<span class="star" style="left:${R(0,100)}%;top:${R(0,60)}%;width:${z}px;height:${z}px;--d:${R(2,6)}s;--dl:${-R(0,6)}s"></span>`;}
    for(let i=0;i<3;i++)h+=`<span class="aur a${i+1}"></span>`;
    h+=`<span class="shoot" style="top:${R(5,25)}%;left:${R(50,90)}%;--dl:2s"></span>`;
    const pine=(x,y,z)=>`<g transform="translate(${x} ${y}) scale(${z})"><rect x="-3" y="0" width="6" height="12" fill="#2b1d14"/><path d="M0-62 18-28H9L24 0H-24L-9-28H-18z" fill="#0d3a3f"/><path d="M0-62 9-45 3-47-2-43-9-45zM-9-28H9L5-24 0-27-6-23z" fill="#e8f4ff"/></g>`;
    let pines='';for(let i=0;i<14;i++)pines+=pine(R(0,1000).toFixed(0),R(196,214).toFixed(0),R(.45,.9).toFixed(2));
    h+=`<svg class="ar-land" viewBox="0 0 1000 240" preserveAspectRatio="none"><path d="M0 240V120l90-60 70 40 110-90 100 80 80-30 120 90 90-60 120 70 110-50 110 60v110z" fill="#1b3a57"/><path d="M270 10l-40 34 22-6 18 14 16-16 26 8zM600 70l-30 26 18-4 12 10 12-12 20 6z" fill="#dfeefa" opacity=".9"/><path d="M0 240v-60c140-30 260 10 400-10s300-40 420-10 140 20 180 10v70z" fill="#e8f4ff"/><path d="M0 240v-26c200-14 380 6 560-4s300-10 440 0v30z" fill="#cfe4f5"/>${pines}<g transform="translate(780 200)"><path d="M-34 0a34 30 0 0 1 68 0z" fill="#f4f9ff"/><path d="M-34 0a34 30 0 0 1 68 0" fill="none" stroke="#bcd6ea" stroke-width="2"/><path d="M-26-12h52M-32-4h64M-18-22h36M-8-28v6M8-28v6M-16-12v8M0-12v8M16-12v8" stroke="#bcd6ea" stroke-width="1.6"/><path d="M-10 0a10 10 0 0 1 20 0z" fill="#27455f"/><path d="M-6 0a6 7 0 0 1 12 0z" fill="#ffc86b"/></g></svg>`;
    for(let i=0;i<40;i++){const z=R(2,6);h+=`<span class="snow" style="left:${R(-5,100)}%;width:${z}px;height:${z}px;--d:${R(8,18)}s;--dl:${-R(0,18)}s;--x:${R(-60,60)}px;opacity:${R(.5,1).toFixed(2)}"></span>`;}
  }
  if(sc==='sakura'){
    h+=`<span class="sk-sun"></span>`;
    h+=`<svg class="sk-hills" viewBox="0 0 1000 220" preserveAspectRatio="none"><path d="M0 220V120c90-40 180-60 280-30s170 10 260-30 200-30 300 10 120 40 160 30v120z" class="h1"/><path d="M0 220V160c120-30 220-10 330 10s200-30 320-30 220 40 350 20v60z" class="h2"/><path d="M0 220v-30c150-10 300 10 500 0s350-20 500 0v30z" class="h3"/></svg>`;
    const bloss=(x,y,r,c)=>`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="${-r*.55}" rx="${r*.42}" ry="${r*.55}" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="${r*.22}" fill="#ff6f9c"/></g>`;
    const branch=(flip)=>`<svg viewBox="0 0 400 240" class="sk-branch${flip?' r':''}"><path d="M0 30C80 40 140 70 200 60s110-10 180 40M120 52c10 30 40 50 80 60M240 70c10-30 40-40 70-40" stroke="#6b3f3a" stroke-width="9" fill="none" stroke-linecap="round"/>${[[60,30,16],[110,50,14],[150,70,18],[200,60,15],[250,66,17],[300,74,14],[350,92,18],[180,100,14],[210,110,16],[300,34,15],[280,30,12],[90,24,12],[380,104,13],[230,92,11]].map(([x,y,r],i)=>bloss(x,y+R(-6,6),r,['#ffc4d8','#ffd8e6','#ffb0cb'][i%3])).join('')}</svg>`;
    h+=branch(0)+branch(1);
    for(let i=0;i<3;i++)h+=`<span class="lantern" style="left:${[18,50,82][i]}%;--dl:${-i*1.6}s"><svg viewBox="0 0 40 70"><path d="M20 0v10" stroke="#6b3f3a" stroke-width="1.5"/><rect x="10" y="9" width="20" height="5" rx="2" fill="#3a2a2a"/><ellipse cx="20" cy="34" rx="16" ry="20" fill="#ff6b6b"/><path d="M8 26h24M6 34h28M8 42h24" stroke="rgba(120,20,20,.35)" stroke-width="1.5"/><rect x="10" y="53" width="20" height="5" rx="2" fill="#3a2a2a"/><path d="M20 58v10" stroke="#ffc83d" stroke-width="2"/></svg></span>`;
    for(let i=0;i<28;i++){const z=R(8,16);h+=`<span class="petal" style="left:${R(-5,100)}%;width:${z}px;height:${z*.8}px;--d:${R(9,18)}s;--dl:${-R(0,18)}s;--x:${R(40,180)}px;--r:${R(200,720)}deg"></span>`;}
  }
  el.innerHTML=h;
  if(perf)el.querySelectorAll('.bub,.ffly,.petal,.snow,.mote,.star,.spark,.weed,.cloud,.bfly,.vine,.sw-car').forEach((e,i)=>{if(i%3)e.remove();});
}

/* ---------- Custom sounds (uploaded by the owner, shared with everyone) ---------- */
const SB={list:[],db:null,assets:null,canEdit:false,ready:false,audio:new Map(),listeners:[]};
function sbChanged(){SB.listeners.forEach(f=>{try{f();}catch(e){}});}
function preload(it){if(SB.audio.has(it.id))return;try{const a=new Audio('/_blob/'+it.id);a.preload='auto';SB.audio.set(it.id,a);}catch(e){}}
async function initSounds(){
  if(!(window.claude&&typeof window.claude.use==='function'))return;
  try{
    const [db,as]=await Promise.all([window.claude.use('db'),window.claude.use('assets').catch(()=>null)]);
    SB.db=db;SB.assets=as;SB.canEdit=!!(db&&as);
    if(db){db.doc('sounds/board').onSnapshot(snap=>{const d=snap&&snap.exists?snap.data():null;const items=d&&Array.isArray(d.items)?d.items.filter(x=>x&&typeof x.id==='string'&&/^[A-Za-z0-9_-]{8,64}$/.test(x.id)).slice(0,16).map(x=>({id:x.id,name:cleanName(x.name)||'Sound',ic:typeof x.ic==='string'?x.ic.slice(0,4):'🔊'})):[];SB.list=items;items.forEach(preload);SB.ready=true;sbChanged();},()=>{SB.ready=true;sbChanged();});}
    sbChanged();
  }catch(e){sbChanged();}
}
function playCustom(id){if(!S.sound||!S.memes)return false;const it=SB.list.find(x=>x.id===id);if(!it)return false;let a=SB.audio.get(id);if(!a){preload(it);a=SB.audio.get(id);}if(!a)return false;try{const c=a.cloneNode();c.volume=.9;c.play().catch(()=>{});}catch(e){}return true;}
async function toUploadable(file){
  if(file.type==='video/mp4'||file.type==='video/webm')return{blob:file,type:file.type};
  const buf=await file.arrayBuffer();const ctx=new (window.AudioContext||window.webkitAudioContext)();
  const audio=await ctx.decodeAudioData(buf);const dur=Math.min(audio.duration,8);
  const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
  if(!mime)throw new Error('This browser cannot convert audio. Try a short .mp4 or .webm clip instead.');
  const dest=ctx.createMediaStreamDestination();const src=ctx.createBufferSource();src.buffer=audio;src.connect(dest);
  const rec=new MediaRecorder(dest.stream,{mimeType:mime});const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
  const done=new Promise(r=>rec.onstop=r);rec.start();src.start();await sleep(dur*1000+200);rec.stop();try{src.stop();}catch(e){}await done;ctx.close();
  const type=mime.includes('mp4')?'video/mp4':'video/webm';return{blob:new Blob(chunks,{type}),type};
}
async function addSound(file,name,ic){
  if(!SB.canEdit)throw new Error('Only the owner can add sounds.');
  if(SB.list.length>=16)throw new Error('The board is full (16 sounds). Remove one first.');
  if(file.size>15e6)throw new Error('That file is too big. Keep sounds under 15 MB.');
  const {blob,type}=await toUploadable(file);
  const r=await SB.assets.upload(blob,{type});
  const items=SB.list.concat([{id:r.id,name:cleanName(name)||'Sound',ic:ic||'🔊'}]);
  await SB.db.doc('sounds/board').set({items});
  return r.id;
}
async function removeSound(id){
  if(!SB.canEdit)return;const items=SB.list.filter(x=>x.id!==id);
  await SB.db.doc('sounds/board').set({items});
  try{await SB.assets.delete(id);}catch(e){}
}

/* ---------- Modals ---------- */
function openModal(id){const m=$(id);if(!m)return;m.hidden=false;const f=m.querySelector('[data-autofocus]')||m.querySelector('button,input');if(f)setTimeout(()=>{try{f.focus();}catch(e){}},40);}
function closeModals(){document.querySelectorAll('.modal').forEach(m=>m.hidden=true);}
function anyModal(){return !!document.querySelector('.modal:not([hidden])');}

/* ---------- identity ---------- */
let myAvSeed=store.get('jj-av')||store.get('jpp-av')||String(Math.floor(Math.random()*1e6));store.set('jj-av',myAvSeed);
const nick=()=>cleanName(($('nick')||{}).value)||'Player';
function shuffleAvatar(){myAvSeed=String(Math.floor(Math.random()*1e6));store.set('jj-av',myAvSeed);}

/* ---------- screens ---------- */
const screens={};
let current='home';
function registerScreen(name,api){screens[name]=api;}
/* If a game screen still runs slowly, switch on battery saver once and say so. */
let fpsChecked=false;
function watchFps(){
  if(fpsChecked||S.lite||!perf||store.get('jj-autolite'))return;fpsChecked=true;
  let n=0,last=0,slow=0,sum=0;
  const f=t=>{if(last){const d=t-last;sum+=d;if(d>34)slow++;n++;}last=t;
    if(n<150&&current!=='home')return requestAnimationFrame(f);
    if(n<150){fpsChecked=false;return;}
    const fps=1000*n/sum;
    if(fps<42||slow>n*.25){store.set('jj-autolite','1');S.lite=true;saveS();applyS();
      toast('<span class="t-ic">🔋</span><span><b>Battery saver is on</b><br>The background stopped moving so the game runs smoothly. Turn it off in Settings.</span>','',4500);}
  };
  setTimeout(()=>requestAnimationFrame(f),2500);
}
function show(name){
  if(current&&screens[current]&&screens[current].hide&&current!==name)screens[current].hide();
  document.querySelectorAll('[data-screen]').forEach(el=>el.hidden=el.dataset.screen!==name);
  document.body.classList.toggle('in-game',name!=='home');
  current=name;window.scrollTo(0,0);
  if(screens[name]&&screens[name].show)screens[name].show();
  if(name!=='home')watchFps();
}

setTimeout(initSounds,0);
/* ---------- Particle burst ---------- */
function burst(x,y,items,n,o){
  o=o||{};if(!animOn())return;const L=fxLayer();
  for(let k=0;k<n;k++){const e=document.createElement('span');e.className='pt';e.textContent=items[k%items.length];e.style.left=x+'px';e.style.top=y+'px';e.style.fontSize=(o.size||22)*(.7+Math.random()*.6)+'px';L.appendChild(e);
    const a=(o.angle!=null?o.angle:Math.random()*Math.PI*2)+(o.angle!=null?(Math.random()-.5)*(o.cone||1.2):0),sp=(o.dist||70)*(.5+Math.random()*.8),dx=Math.cos(a)*sp,dy=Math.sin(a)*sp+(o.fall||0);
    e.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{transform:`translate(calc(-50% + ${dx*.4}px),calc(-50% + ${dy*.4-(o.up||20)}px)) scale(1.1) rotate(${(Math.random()-.5)*90}deg)`,opacity:1,offset:.3},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8) rotate(${(Math.random()-.5)*300}deg)`,opacity:0}],{duration:(o.dur||900)*(.8+Math.random()*.5),delay:(o.delay||0)+k*(o.stagger||18),easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'}).onfinish=()=>e.remove();}
}
/* ---------- Victory finisher (fighting-game style) ---------- */
const FIN={
  cat:{fx:'slash',c:'#ffffff',say:'PURR-FECT!'},dog:{fx:'rings',c:'#ffc83d',word:'WOOF!',say:"WHO'S A GOOD BOY?"},fox:{fx:'fire',c:'#ff7a1a',say:'OUTFOXED!'},
  bear:{fx:'slam',c:'#c98a5a',say:'UNBEARABLE!'},panda:{fx:'kick',c:'#ffffff',word:'HI-YAH!',say:'PANDA-MONIUM!'},bunny:{fx:'rain',e:['🥕'],c:'#ff9e3d',say:'HOP-LESS FOR YOU!'},
  frog:{fx:'tongue',c:'#5cc26f',say:'TOAD-ALLY WON!'},koala:{fx:'swirl',e:['🍃','💤','🍃'],c:'#9fd49a',say:'KOALA-FIED!'},pig:{fx:'rain',e:['🪙','💰'],c:'#f7a8b8',say:'BRINGING HOME THE BACON!'},
  owl:{fx:'swirl',e:['🪶'],c:'#d9b277',say:"WHOO'S THE BOSS?"},tiger:{fx:'slash',c:'#ff8a1a',say:'EYE OF THE TIGER!'},penguin:{fx:'rain',e:['❄️','🧊'],c:'#8fd8ff',say:'ICE COLD!'},
  lion:{fx:'rings',c:'#ffb02e',word:'ROAR!',say:'KING OF THE TABLE!'},monkey:{fx:'swirl',e:['🍌'],c:'#ffd23f',say:'GO BANANAS!'}};
function speciesOf(seed,bot){return ANIMALS[hash(seed+(bot?'#bot':''))%ANIMALS.length];}
let finEl=null;
function finisher(o){
  if(!S.fin||!animOn()||!o||!o.list||!o.list.length)return;
  if(finEl){finEl.remove();finEl=null;}
  const list=o.list.slice(0,2),sp=speciesOf(list[0].seed,list[0].bot),cfg=FIN[sp]||FIN.cat;
  const el=document.createElement('div');el.className=`fin fx-${cfg.fx}`;el.style.setProperty('--fc',cfg.c);
  const title=list.length>1?'SPLIT POT!':list[0].name?`${String(list[0].name).toUpperCase()} WINS`:'YOU WIN';
  const top=list.length>1?(o.top||''):(o.top||(o.big?'FLAWLESS VICTORY':''));
  const say=list.length>1?list.map(x=>x.name).join(' & '):(o.say||cfg.say);
  let fxh='';
  if(cfg.fx==='slash')fxh='<i class="f-slash s1"></i><i class="f-slash s2"></i><i class="f-slash s3"></i>';
  if(cfg.fx==='rings')fxh='<i class="f-ring r1"></i><i class="f-ring r2"></i><i class="f-ring r3"></i>';
  if(cfg.fx==='slam')fxh='<svg class="f-crack" viewBox="0 0 400 120"><path d="M200 0 180 40 210 60 170 120M200 0 230 30 215 70 260 120M200 0 150 25 120 70 60 100M200 0 260 20 300 60 360 90" stroke="rgba(0,0,0,.55)" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
  if(cfg.fx==='kick')fxh='<i class="f-star"></i>';
  if(cfg.fx==='tongue')fxh='<i class="f-tongue"><b>🪙</b></i>';
  if(cfg.fx==='fire')fxh='<i class="f-trail"></i>';
  el.innerHTML=`<div class="fin-bg"></div><div class="fin-lines"></div><span class="fin-skip">TAP TO SKIP</span><div class="fin-stage"><div class="fin-hero"><div class="fin-fx">${fxh}</div>${list.map(x=>`<span class="av">${avatarSVG(x.seed,x.bot)}</span>`).join('')}${cfg.word&&list.length===1?`<span class="f-word">${cfg.word}</span>`:''}</div><div class="fin-txt">${top?`<small>${esc(top)}</small>`:''}<b>${esc(title)}</b><em>${esc(say)}</em></div></div>`;
  document.body.appendChild(el);finEl=el;
  el.querySelector('.fin-stage').addEventListener('click',()=>{el.classList.add('out');setTimeout(()=>{el.remove();if(finEl===el)finEl=null;},300);});
  SFX.fight();setTimeout(()=>{({slash:SFX.whoosh,rings:SFX.boom,fire:SFX.whoosh,slam:SFX.boom,kick:SFX.splat,rain:SFX.cash,swirl:SFX.chime,tongue:SFX.kiss}[cfg.fx]||SFX.pop)();},520);
  setTimeout(()=>{if(!el.isConnected)return;const r=el.querySelector('.fin-hero').getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;
    if(cfg.fx==='rain')burst(cx,r.top-40,cfg.e,22,{angle:Math.PI/2,cone:2.6,dist:260,fall:120,up:0,size:30,dur:1500,stagger:30});
    if(cfg.fx==='swirl')burst(cx,cy,cfg.e,16,{dist:190,size:30,dur:1500,stagger:25});
    if(cfg.fx==='fire')burst(cx-120,cy,['🔥'],14,{angle:Math.PI,cone:.8,dist:220,size:30,dur:1100,stagger:22});
    if(cfg.fx==='slam')burst(cx,r.bottom,['💨','💥'],12,{angle:-Math.PI/2,cone:2.8,dist:170,size:30,dur:1000});
    if(cfg.fx==='kick')burst(cx+90,cy,['💥','✨'],10,{dist:150,size:30,dur:900});
    if(cfg.fx==='slash'||cfg.fx==='rings')burst(cx,cy,['✨'],8,{dist:200,size:24,dur:1000});},560);
  if(o.big&&S.sound&&'speechSynthesis' in window){try{const u=new SpeechSynthesisUtterance(`${list[0].name} wins. Flawless victory.`);u.pitch=.4;u.rate=.85;u.volume=.9;setTimeout(()=>speechSynthesis.speak(u),650);}catch(e){}}
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();if(finEl===el)finEl=null;},380);},o.dur||2500);
}
return {perf,burst,finisher,speciesOf,SCENES,decorate,SB,playCustom,addSound,removeSound,onSounds:f=>SB.listeners.push(f),$,store,esc,money,num,cleanName,cleanText,sleep,S,saveS,applyS,resolvedTheme,onSettings:f=>listeners.push(f),animOn,
  SFX,buzz,MEMES,playMeme,tone,noise,avatarSVG,CROWN,SUITS,RED,NAMES,rl,cardOf,cstr,cardFace,shuffle,hash,
  flyChips,floatText,floatEmoji,confetti,toast,centerPx,
  P,ACH,level,xpFor,addCoins,addXP,unlock,stat,onProfile:f=>profileListeners.push(f),saveP,
  openModal,closeModals,anyModal,get myAvSeed(){return myAvSeed;},shuffleAvatar,nick,registerScreen,show,get current(){return current;}};
})();
