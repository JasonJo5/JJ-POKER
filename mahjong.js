/* JJ POKER — Mahjong Solitaire */
(() => {
'use strict';
const J=window.JJ,{$,num,SFX}=J;
const CJK='"Noto Serif SC","Songti SC","STSong","SimSun","Microsoft YaHei","PingFang SC",serif';
const NUMS=['一','二','三','四','五','六','七','八','九'];
const C={blue:'#1f5bd8',green:'#12805c',red:'#d92d20',navy:'#1b2a4a'};

/* ---------- Tile faces ---------- */
const DOTS={1:[[30,40]],2:[[30,22],[30,58]],3:[[16,17],[30,40],[44,63]],4:[[18,24],[42,24],[18,56],[42,56]],5:[[18,22],[42,22],[30,40],[18,58],[42,58]],6:[[18,18],[42,18],[18,40],[42,40],[18,62],[42,62]],7:[[14,13],[30,21],[46,29],[18,49],[42,49],[18,67],[42,67]],8:[[18,14],[42,14],[18,32],[42,32],[18,50],[42,50],[18,68],[42,68]],9:[[14,17],[30,17],[46,17],[14,40],[30,40],[46,40],[14,63],[30,63],[46,63]]};
const DOTCOL={1:[C.red],2:[C.green,C.blue],3:[C.blue,C.red,C.green],4:[C.blue,C.green,C.green,C.blue],5:[C.blue,C.green,C.red,C.green,C.blue],6:[C.green,C.green,C.red,C.red,C.red,C.red],7:[C.green,C.green,C.green,C.red,C.red,C.red,C.red],8:Array(8).fill(C.blue),9:[C.blue,C.blue,C.blue,C.red,C.red,C.red,C.green,C.green,C.green]};
function dotsSVG(n){const r=n===1?15:n<=4?9:n<=6?8:7;return DOTS[n].map(([x,y],i)=>{const c=DOTCOL[n][i];return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r*.68}" fill="#fffdf6"/><circle cx="${x}" cy="${y}" r="${r*.42}" fill="${c}"/>${n===1?`<circle cx="${x}" cy="${y}" r="${r*.18}" fill="#fffdf6"/>`:''}`;}).join('');}
const BAMPOS={2:[[30,22],[30,58]],3:[[30,22],[18,58],[42,58]],4:[[18,22],[42,22],[18,58],[42,58]],5:[[16,22],[44,22],[30,40],[16,58],[44,58]],6:[[14,22],[30,22],[46,22],[14,58],[30,58],[46,58]],7:[[30,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]],8:[[12,22],[24,22],[36,22],[48,22],[12,58],[24,58],[36,58],[48,58]],9:[[14,14],[30,14],[46,14],[14,40],[30,40],[46,40],[14,66],[30,66],[46,66]]};
function stick(x,y,col,h){h=h||22;return `<rect x="${x-3.6}" y="${y-h/2}" width="7.2" height="${h}" rx="3.6" fill="${col}"/><rect x="${x-4.4}" y="${y-1.4}" width="8.8" height="2.8" rx="1.4" fill="${col}" opacity=".85"/><line x1="${x}" y1="${y-h/2+3}" x2="${x}" y2="${y+h/2-3}" stroke="#fffdf6" stroke-width="1.2" opacity=".55"/>`;}
function bambooSVG(n){
  if(n===1)return `<ellipse cx="30" cy="46" rx="13" ry="16" fill="${C.green}"/><path d="M20 58 8 72h18z" fill="${C.green}"/><path d="M40 58 52 72H34z" fill="${C.blue}"/><circle cx="34" cy="26" r="8" fill="${C.green}"/><path d="M40 24l8-3-6 7z" fill="${C.red}"/><circle cx="36" cy="25" r="1.8" fill="#fffdf6"/><path d="M28 18c2-6 6-8 10-6" stroke="${C.red}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="30" cy="46" r="5" fill="${C.red}" opacity=".85"/>`;
  return BAMPOS[n].map(([x,y],i)=>stick(x,y,(n===9&&i>=3&&i<6)||(n===5&&i===2)||(n===7&&i===0)?C.red:(n===8&&(i===1||i===2||i===5||i===6))?C.blue:C.green,n>=7?20:24)).join('');
}
const txt=(t,y,size,col,extra)=>`<text x="30" y="${y}" text-anchor="middle" dominant-baseline="central" font-family='${CJK}' font-weight="700" font-size="${size}" fill="${col}"${extra||''}>${t}</text>`;
function faceSVG(f){
  const k=f[0],n=+f.slice(1);let body='';
  if(k==='d')body=dotsSVG(n);
  else if(k==='b')body=bambooSVG(n);
  else if(k==='c')body=txt(NUMS[n-1],24,24,C.navy)+txt('萬',58,30,C.red);
  else if(k==='w')body=txt(['東','南','西','北'][n-1],42,38,C.navy)+`<text x="50" y="14" text-anchor="middle" font-family="IBM Plex Sans KR,sans-serif" font-weight="700" font-size="9" fill="${C.red}">${'ESWN'[n-1]}</text>`;
  else if(k==='r')body=n===1?txt('中',42,42,C.red):n===2?txt('發',42,40,C.green):`<rect x="12" y="14" width="36" height="52" rx="5" fill="none" stroke="${C.blue}" stroke-width="4"/><rect x="18" y="20" width="24" height="40" rx="3" fill="none" stroke="${C.blue}" stroke-width="2"/>`;
  else if(k==='f'){const ch=['梅','蘭','菊','竹'][n-1],col=['#d63384',C.violet||'#7c3aed','#e8590c',C.green][n-1];body=`<circle cx="30" cy="40" r="22" fill="${col}" opacity=".12"/>`+txt(ch,42,32,col)+`<text x="49" y="14" text-anchor="middle" font-size="10" fill="${col}">✿</text>`;}
  else if(k==='s'){const ch=['春','夏','秋','冬'][n-1],col=[C.green,C.red,'#e8590c',C.blue][n-1];body=`<rect x="10" y="12" width="40" height="56" rx="8" fill="${col}" opacity=".1"/>`+txt(ch,42,32,col)+`<text x="49" y="14" text-anchor="middle" font-family="IBM Plex Sans KR,sans-serif" font-weight="700" font-size="9" fill="${col}">${n}</text>`;}
  return `<svg viewBox="0 0 60 80" aria-hidden="true">${body}</svg>`;
}
const faceCache=new Map();
const faceOf=f=>{if(!faceCache.has(f))faceCache.set(f,faceSVG(f));return faceCache.get(f);};
J.mjFace=f=>faceOf(f);
const keyOf=f=>f[0]==='f'?'F':f[0]==='s'?'S':f;
const LABEL=f=>{const k=f[0],n=+f.slice(1);return k==='d'?`${n} of dots`:k==='b'?`${n} of bamboo`:k==='c'?`${n} of characters`:k==='w'?['East','South','West','North'][n-1]+' wind':k==='r'?['Red','Green','White'][n-1]+' dragon':k==='f'?'Flower':'Season';};

/* ---------- Layouts (half-tile units) ---------- */
function rect(x0,x1,y0,y1,z){const a=[];for(let y=y0;y<=y1;y+=2)for(let x=x0;x<=x1;x+=2)a.push({x,y,z});return a;}
const LAYOUTS={
  easy:()=>[...rect(0,14,0,8,0),...rect(2,12,2,6,1),...rect(4,10,4,4,2)],
  classic:()=>[...rect(0,18,0,10,0),{x:-2,y:5,z:0},{x:20,y:5,z:0},...rect(2,16,2,8,1),...rect(4,14,4,6,2),{x:8,y:5,z:3},{x:10,y:5,z:3}],
};

/* ---------- Rules ---------- */
const M={tiles:[],sel:null,hist:[],score:0,combo:0,lastAt:0,start:0,elapsed:0,done:false,level:'classic',maxCombo:0,hints:0};
function isFreeIn(t,set){
  for(const u of set){if(u===t)continue;if(u.z===t.z+1&&Math.abs(u.x-t.x)<2&&Math.abs(u.y-t.y)<2)return false;}
  let L=false,R=false;for(const u of set){if(u===t||u.z!==t.z||Math.abs(u.y-t.y)>=2)continue;if(u.x===t.x-2)L=true;else if(u.x===t.x+2)R=true;if(L&&R)return false;}
  return true;
}
const live=()=>M.tiles.filter(t=>!t.removed);
function freeSet(){const L=live();return L.filter(t=>isFreeIn(t,L));}
function pairsAvail(){const by={};freeSet().forEach(t=>{by[t.key]=(by[t.key]||0)+1;});return Object.values(by).reduce((a,n)=>a+Math.floor(n/2),0);}
function makePairs(n){
  const pool=[];const regs=[];for(const k of ['d','b','c'])for(let i=1;i<=9;i++)regs.push(k+i);for(let i=1;i<=4;i++)regs.push('w'+i);for(let i=1;i<=3;i++)regs.push('r'+i);
  regs.forEach(f=>{pool.push([f,f],[f,f]);});
  const fl=J.shuffle([1,2,3,4]),se=J.shuffle([1,2,3,4]);pool.push(['f'+fl[0],'f'+fl[1]],['f'+fl[2],'f'+fl[3]],['s'+se[0],'s'+se[1]],['s'+se[2],'s'+se[3]]);
  return J.shuffle(pool).slice(0,n);
}
function solvableAssign(pos,pairs){
  for(let attempt=0;attempt<300;attempt++){
    let rem=pos.slice();const out=new Map();let ok=true;const pf=J.shuffle(pairs.slice());
    for(const pr of pf){const fr=rem.filter(t=>isFreeIn(t,rem));if(fr.length<2){ok=false;break;}
      const a=fr[Math.floor(Math.random()*fr.length)];let others=fr.filter(t=>t!==a);
      const far=others.filter(t=>Math.abs(t.x-a.x)>2||t.z!==a.z);if(far.length&&Math.random()<.8)others=far;
      const b=others[Math.floor(Math.random()*others.length)];out.set(a,pr[0]);out.set(b,pr[1]);rem=rem.filter(t=>t!==a&&t!==b);}
    if(ok)return out;
  }
  return null;
}

/* ---------- Game ---------- */
function newGame(level){
  M.level=level||M.level;J.S.mjLevel=M.level;J.saveS();
  const pos=LAYOUTS[M.level]().map((p,i)=>Object.assign({id:i,removed:false},p));
  const asg=solvableAssign(pos,makePairs(pos.length/2));
  pos.forEach(t=>{t.face=asg?asg.get(t):'d1';t.key=keyOf(t.face);});
  Object.assign(M,{tiles:pos,sel:null,hist:[],score:0,combo:0,lastAt:0,start:Date.now(),elapsed:0,done:false,maxCombo:0,hints:0});
  build();update();
  $('mjStatus').textContent=M.level==='easy'?'Easy board: 62 tiles. Warm up those matching muscles.':'Classic board: 108 tiles. Take a breath and find the free ones.';
}
const boardEl=$('mjBoard');
let tileEls=new Map();
function layoutDims(){const T=M.tiles;const minX=Math.min(...T.map(t=>t.x)),maxX=Math.max(...T.map(t=>t.x)),maxY=Math.max(...T.map(t=>t.y)),zmax=Math.max(...T.map(t=>t.z));return{minX,maxX,maxY,zmax};}
function build(){
  boardEl.innerHTML='';tileEls=new Map();
  M.tiles.forEach(t=>{const el=document.createElement('button');el.type='button';el.className='tile';el.innerHTML=faceOf(t.face);el.setAttribute('aria-label',LABEL(t.face));el.onclick=()=>tap(t);tileEls.set(t,el);boardEl.appendChild(el);});
  place();
}
function place(){
  if(!M.tiles.length)return;
  const st=$('mjStage');const W=st.clientWidth-24,H=st.clientHeight-24;if(W<=0||H<=0)return;
  const {minX,maxX,maxY,zmax}=layoutDims();const cols=(maxX+2-minX)/2,rows=(maxY+2)/2;
  const dk=.1;const tw=Math.max(16,Math.min(W/(cols+zmax*dk+.15),H/(rows*1.3+zmax*dk+.15),96));const th=tw*1.3,d=tw*dk;
  boardEl.style.width=(cols*tw+zmax*d+d)+'px';boardEl.style.height=(rows*th+zmax*d+d)+'px';
  M.tiles.forEach(t=>{const el=tileEls.get(t);el.style.cssText=`left:${((t.x-minX)/2*tw-t.z*d+zmax*d).toFixed(1)}px;top:${(t.y/2*th-t.z*d+zmax*d).toFixed(1)}px;width:${(tw-1).toFixed(1)}px;height:${(th-1).toFixed(1)}px;z-index:${t.z*1000+t.y*30+t.x+10};--tw:${tw}px;--d:${Math.max(2,d*.55).toFixed(1)}px`;if(t.removed)el.hidden=true;});
}
new ResizeObserver(()=>{if(J.current==='mj')place();}).observe($('mjStage'));
function update(){
  const L=live(),fs=new Set(L.filter(t=>isFreeIn(t,L)));
  M.tiles.forEach(t=>{const el=tileEls.get(t);if(t.removed)return;el.classList.toggle('free',fs.has(t));el.classList.toggle('blocked',J.S.mjFree&&!fs.has(t));el.classList.toggle('sel',M.sel===t);});
  $('mjLeft').textContent=L.length/2;$('mjScore').textContent=num(M.score);
  const pa=pairsAvail();$('mjMoves').textContent=pa;
  $('mjSub').textContent=M.done?'Board cleared!':pa?`${pa} ${pa===1?'pair':'pairs'} you can take right now`:'No moves. Shuffle!';
  $('mjUndo').disabled=!M.hist.length||M.done;$('mjHint').disabled=M.done||!pa;$('mjShuffle').disabled=M.done||!L.length;
  if(!M.done&&L.length&&!pa){$('mjStatus').textContent='No moves left. Hit Shuffle and the tiles rearrange into a board you can still clear.';if(J.animOn())$('mjShuffle').animate([{transform:'scale(1)'},{transform:'scale(1.07)'},{transform:'scale(1)'}],{duration:600,iterations:3});}
}
function tap(t){
  if(M.done||t.removed)return;
  const L=live();
  if(!isFreeIn(t,L)){const el=tileEls.get(t);el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');SFX.bad();$('mjStatus').textContent='That tile is blocked. Free tiles have nothing on top and an open left or right side.';return;}
  if(M.sel===t){M.sel=null;SFX.click();update();return;}
  if(M.sel&&M.sel.key===t.key){match(M.sel,t);return;}
  M.sel=t;SFX.click();update();
}
function match(a,b){
  const now=Date.now();M.combo=now-M.lastAt<3500?M.combo+1:1;M.lastAt=now;M.maxCombo=Math.max(M.maxCombo,M.combo);
  const pts=10*M.combo;M.score+=pts;M.hist.push({a,b,pts});M.sel=null;
  [a,b].forEach(t=>{t.removed=true;const el=tileEls.get(t);el.classList.add('gone');setTimeout(()=>{if(t.removed)el.hidden=true;el.classList.remove('gone');},460);});
  SFX.match();if(M.combo>=3)SFX.coins();
  const el=tileEls.get(b);J.floatText(el,M.combo>1?`+${pts} ×${M.combo}`:`+${pts}`,M.combo>=3?'':'mint');
  const cb=$('mjCombo');if(M.combo>=2){cb.textContent=`Combo ×${M.combo}!`;if(J.animOn())cb.animate([{transform:'translateX(-50%) scale(.6)',opacity:0},{transform:'translateX(-50%) scale(1.15)',opacity:1,offset:.3},{transform:'translateX(-50%) scale(1)',opacity:0}],{duration:1200,fill:'both'});}
  if(M.combo>=5)J.unlock('mj_combo');
  $('mjStatus').textContent=M.combo>=2?`Nice! Match again within 3 seconds to keep the combo going.`:'Matched. Keep going!';
  update();
  if(!live().length)win();
}
function win(){
  M.done=true;M.elapsed=Math.round((Date.now()-M.start)/1000);
  const base=M.level==='easy'?150:300,bonus=Math.max(0,Math.round((M.level==='easy'?400:900)-M.elapsed))+M.score;
  const coins=base+Math.round(bonus/2);
  J.addCoins(coins);J.addXP(M.level==='easy'?40:80);J.stat('mjc');
  if(!J.P.stats.mjbest||M.elapsed<J.P.stats.mjbest){J.P.stats.mjbest=M.elapsed;J.saveP();}
  J.unlock('mj_clear');if(M.level==='easy'&&M.elapsed<240)J.unlock('mj_fast');
  SFX.win();setTimeout(J.confetti,200);
  J.toast(`<span class="t-ic">🀄</span><span><b>Board cleared in ${fmt(M.elapsed)}!</b><br>Score ${num(M.score)} · +${num(coins)} coins</span>`,'gold',5000);
  $('mjStatus').textContent=`Cleared in ${fmt(M.elapsed)} with a best combo of ×${M.maxCombo}. Press New board for another round.`;
  update();
}
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function hint(){
  const fs=freeSet();const by={};for(const t of fs){(by[t.key]=by[t.key]||[]).push(t);}
  const pair=Object.values(by).find(a=>a.length>=2);if(!pair)return;
  M.hints++;M.combo=0;
  pair.slice(0,2).forEach(t=>{const el=tileEls.get(t);el.classList.remove('hintme');void el.offsetWidth;el.classList.add('hintme');setTimeout(()=>el.classList.remove('hintme'),2800);});
  SFX.pop();$('mjStatus').textContent=`Try the two ${LABEL(pair[0].face).toLowerCase()} tiles. Hints reset your combo.`;
}
function reshuffle(){
  const L=live();if(!L.length)return;
  const by={};L.forEach(t=>{(by[t.key]=by[t.key]||[]).push(t.face);});
  const pairs=[];Object.values(by).forEach(fs=>{for(let i=0;i+1<fs.length;i+=2)pairs.push([fs[i],fs[i+1]]);});
  const asg=solvableAssign(L,pairs);
  if(asg)L.forEach(t=>{t.face=asg.get(t);t.key=keyOf(t.face);});
  else{const faces=J.shuffle(L.map(t=>t.face));L.forEach((t,i)=>{t.face=faces[i];t.key=keyOf(t.face);});}
  M.sel=null;M.combo=0;
  L.forEach((t,i)=>{const el=tileEls.get(t);el.innerHTML=faceOf(t.face);el.setAttribute('aria-label',LABEL(t.face));if(J.animOn())el.animate([{transform:'rotateY(0)'},{transform:'rotateY(90deg)'},{transform:'rotateY(0)'}],{duration:500,delay:i*6});});
  SFX.card();$('mjStatus').textContent='Shuffled into a board you can still clear.';update();
}
function undo(){
  const h=M.hist.pop();if(!h)return;
  [h.a,h.b].forEach(t=>{t.removed=false;const el=tileEls.get(t);el.hidden=false;if(J.animOn())el.animate([{transform:'translateY(-20px) scale(.6)',opacity:0},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.2,1.4,.4,1)'});});
  M.score=Math.max(0,M.score-h.pts);M.combo=0;M.sel=null;SFX.click();update();
}
$('mjHint').onclick=hint;$('mjShuffle').onclick=reshuffle;$('mjUndo').onclick=undo;
$('mjNew').onclick=()=>newGame(M.level);
setInterval(()=>{if(J.current!=='mj'||M.done||!M.tiles.length)return;$('mjTime').textContent=fmt(Math.round((Date.now()-M.start)/1000));},1000);
document.addEventListener('keydown',e=>{if(J.current!=='mj'||J.anyModal())return;const k=e.key.toLowerCase();if(k==='h')hint();else if(k==='z'&&(e.metaKey||e.ctrlKey))undo();});

function open(level){J.show('mj');$('mjMeAv').innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false);if(!M.tiles.length||M.done||level!==M.level)newGame(level);else{place();update();}setTimeout(place,30);}
J.registerScreen('mj',{hide(){}});
(window.JJ_SCREENS=window.JJ_SCREENS||{}).mj={leave(){J.show('home');J.renderPokerHome&&J.renderPokerHome();}};
$('mjEasy').onclick=()=>open('easy');$('mjClassic').onclick=()=>open('classic');

/* home art */
$('gcMJ').innerHTML=['r1','d5','b1'].map((f,i)=>`<span class="tile" style="position:relative;width:58px;height:76px;--tw:58px;--d:5px;cursor:default">${faceOf(f)}</span>`).join('');
J.onSettings(()=>{if(J.current==='mj')$('mjMeAv').innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false);});
})();
