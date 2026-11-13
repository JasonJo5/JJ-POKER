/* JJ POKER — 4-player Mahjong (Hong Kong style, simplified) vs 3 bots */
(() => {
'use strict';
const J=window.JJ,{$,esc,num,SFX}=J;
const WIND=['East','South','West','North'],WCH=['東','南','西','北'];
const BOTN=['Mira','Bram','Sol'];
const TURN_MS=20000,CLAIM_MS=10000;
/* tile codes: 0-8 characters, 9-17 dots, 18-26 bamboo, 27-30 winds (E S W N), 31-33 dragons (red, green, white) */
const face=c=>c<9?'c'+(c+1):c<18?'d'+(c-8):c<27?'b'+(c-17):c<31?'w'+(c-26):'r'+(c-30);
const tname=c=>c<27?`${c%9+1} ${['Characters','Dots','Bamboo'][Math.floor(c/9)]}`:c<31?`${WIND[c-27]} wind`:['Red','Green','White'][c-31]+' dragon';
const suit=c=>c<27?Math.floor(c/9):3;
const isHonor=c=>c>=27;

const M={on:false,wall:[],uid:0,hands:[[],[],[],[]],melds:[[],[],[],[]],ponds:[[],[],[],[]],turn:0,dealer:0,round:0,handNo:1,scores:[0,0,0,0],phase:'idle',drawn:null,last:null,sel:null,claimOpts:null,timer:0,deadline:0,tok:0,result:null};
const names=()=>[J.nick(),...BOTN];
const seed=i=>i===0?J.myAvSeed+'|'+J.nick():BOTN[i-1];
const seatWind=i=>(i-M.dealer+4)%4;

/* ---------- rules ---------- */
function counts(tiles){const c=new Array(34).fill(0);tiles.forEach(t=>c[t.c!==undefined?t.c:t]++);return c;}
function decomp(c,sets){
  let i=0;while(i<34&&!c[i])i++;
  if(i===34)return sets===0;
  if(sets===0)return false;
  if(c[i]>=3){c[i]-=3;const ok=decomp(c,sets-1);c[i]+=3;if(ok)return true;}
  if(i<27&&i%9<=6&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;const ok=decomp(c,sets-1);c[i]++;c[i+1]++;c[i+2]++;if(ok)return true;}
  return false;
}
function winShape(tiles,meldCount){
  const c=counts(tiles),sets=4-meldCount;
  if(tiles.length!==sets*3+2)return null;
  if(meldCount===0&&c.filter(x=>x===2).length===7)return '7p';
  for(let i=0;i<34;i++){if(c[i]>=2){c[i]-=2;const ok=decomp(c,sets);c[i]+=2;if(ok)return 'std';}}
  return null;
}
function fanOf(seat,tiles,selfDraw){
  const melds=M.melds[seat],shape=winShape(tiles,melds.length);const c=counts(tiles);
  const all=tiles.map(t=>t.c).concat(...melds.map(m=>m.tiles));
  const suits=new Set(all.filter(x=>x<27).map(suit)),honors=all.some(isHonor);
  const fan=[];
  const pung=x=>c[x]>=3||melds.some(m=>(m.type!=='chow')&&m.tiles[0]===x);
  if(shape==='7p')fan.push(['Seven pairs',4]);
  if(shape==='std'&&melds.every(m=>m.type!=='chow')&&c.every(n=>n===0||n===2||n===3||n===4)&&c.filter(n=>n===2).length===1)fan.push(['All pungs',3]);
  if(!suits.size&&honors)fan.push(['All honors',8]);
  else if(suits.size===1&&!honors)fan.push(['Full flush',6]);
  else if(suits.size===1&&honors)fan.push(['Half flush',3]);
  [31,32,33].forEach(d=>{if(pung(d))fan.push([['Red','Green','White'][d-31]+' dragon pung',1]);});
  if(pung(27+seatWind(seat)))fan.push(['Seat wind pung',1]);
  if(pung(27+M.round))fan.push(['Round wind pung',1]);
  if(selfDraw)fan.push(['Self-drawn',1]);
  if(melds.every(m=>m.type==='ckong'))fan.push(['Concealed hand',1]);
  const total=Math.min(10,fan.reduce((a,f)=>a+f[1],0));
  return {fan,total,points:8*Math.pow(2,Math.min(total,6))};
}
function canWinWith(seat,tile){return !!winShape(M.hands[seat].concat(tile?[tile]:[]),M.melds[seat].length);}
function chowSets(hand,x){if(x>=27)return [];const c=counts(hand),r=x%9,out=[];
  if(r>=2&&c[x-2]&&c[x-1])out.push([x-2,x-1]);if(r>=1&&r<=7&&c[x-1]&&c[x+1])out.push([x-1,x+1]);if(r<=6&&c[x+1]&&c[x+2])out.push([x+1,x+2]);return out;}
function kongOptions(seat){const c=counts(M.hands[seat]),out=[];for(let i=0;i<34;i++)if(c[i]===4)out.push({c:i,kind:'ckong'});M.melds[seat].forEach((m,k)=>{if(m.type==='pong'&&c[m.tiles[0]]>=1)out.push({c:m.tiles[0],kind:'add',k});});return out;}

/* ---------- bot brain ---------- */
function tileValue(seat,hand,x){
  const c=counts(hand);let v=0;
  if(c[x]>=3)v+=10;else if(c[x]===2)v+=6;
  if(x<27){const r=x%9;if(r>=1&&c[x-1])v+=3;if(r<=7&&c[x+1])v+=3;if(r>=2&&c[x-2])v+=1.5;if(r<=6&&c[x+2])v+=1.5;if(r===0||r===8)v-=.6;else v+=.4;}
  else{const valuable=x>=31||x===27+seatWind(seat)||x===27+M.round;if(valuable&&c[x]>=2)v+=2;if(!valuable)v-=.8;}
  const seen=M.ponds.flat().filter(t=>t.c===x).length;v-=seen*.7;
  return v+Math.random()*.2;
}
function bestDiscard(seat){const hand=M.hands[seat];let best=null,bv=1e9;hand.forEach(t=>{const v=tileValue(seat,hand,t.c);if(v<bv){bv=v;best=t;}});return best;}
function botWantsPong(seat,x){const hand=M.hands[seat];const c=counts(hand);if(M.melds[seat].length===0&&c.filter(n=>n>=2).length>=5)return false;if(x>=31||x===27+seatWind(seat)||x===27+M.round)return true;return Math.random()<.55;}

/* ---------- flow ---------- */
const later=(fn,ms)=>{const tok=M.tok;setTimeout(()=>{if(M.on&&tok===M.tok)fn();},J.animOn()?ms:Math.min(ms,120));};
function newTile(c){return{c,u:++M.uid};}
function sortHand(s){M.hands[s].sort((a,b)=>a.c-b.c||a.u-b.u);}
function newMatch(){M.scores=[0,0,0,0];M.dealer=0;M.round=0;M.handNo=1;startHand();}
function startHand(){
  M.tok++;M.on=true;M.result=null;$('m4Banner').hidden=true;
  const w=[];for(let c=0;c<34;c++)for(let k=0;k<4;k++)w.push(newTile(c));J.shuffle(w);M.wall=w;
  M.hands=[[],[],[],[]];M.melds=[[],[],[],[]];M.ponds=[[],[],[],[]];M.sel=null;M.claimOpts=null;M.last=null;M.drawn=null;
  for(let r=0;r<13;r++)for(let s=0;s<4;s++)M.hands[(M.dealer+s)%4].push(M.wall.pop());
  for(let s=0;s<4;s++)sortHand(s);
  M.turn=M.dealer;M.phase='turn';
  render();SFX.card();for(let k=1;k<5;k++)SFX.card(k*.12);
  say(M.dealer,`I'm dealer. ${WIND[M.round]} round!`);
  later(()=>{draw(M.dealer);startTurn(M.dealer);},900);
}
function draw(s,back){
  if(!M.wall.length){drawGame();return false;}
  const t=back?M.wall.shift():M.wall.pop();M.hands[s].push(t);M.drawn=t;SFX.card();return true;
}
function startTurn(s){
  if(!M.on||M.result)return;M.turn=s;M.phase='turn';M.claimOpts=null;
  setDeadline(TURN_MS);render();
  if(s!==0)later(()=>botTurn(s),650+Math.random()*700);
  else{SFX.turn();}
}
function botTurn(s){
  if(M.turn!==s||M.phase!=='turn')return;
  if(M.drawn&&winShape(M.hands[s],M.melds[s].length))return declareWin(s,null);
  const ko=M.drawn?kongOptions(s):[];if(ko.length&&Math.random()<.75)return doKong(s,ko[0]);
  discard(s,bestDiscard(s));
}
function doKong(s,o){
  const h=M.hands[s];
  if(o.kind==='ckong'){M.hands[s]=h.filter(t=>t.c!==o.c);M.melds[s].push({type:'ckong',tiles:[o.c,o.c,o.c,o.c]});}
  else{const i=h.findIndex(t=>t.c===o.c);h.splice(i,1);M.melds[s][o.k]={type:'kong',tiles:[o.c,o.c,o.c,o.c],from:M.melds[s][o.k].from};}
  shout(s,'Kong!');M.drawn=null;sortHand(s);
  if(!draw(s,true))return;startTurn(s);
}
function discard(s,t){
  if(!t||M.turn!==s||M.phase!=='turn')return;
  const h=M.hands[s];const i=h.indexOf(t);if(i<0)return;h.splice(i,1);sortHand(s);
  M.ponds[s].push(t);M.last={s,t};M.drawn=null;M.sel=null;M.phase='claims';
  SFX.click();render();
  later(()=>resolveClaims(s,t),450);
}
function resolveClaims(from,t){
  const order=[1,2,3].map(k=>(from+k)%4);
  const opts=order.map(s=>{const h=M.hands[s];const c=counts(h)[t.c];return{s,hu:canWinWith(s,t),pong:c>=2,kong:c>=3,chow:s===(from+1)%4?chowSets(h,t.c):[]};});
  let botBest=null;const pri=o=>o.type==='hu'?3:o.type==='pong'||o.type==='kong'?2:o.type==='chow'?1:0;
  opts.forEach((o,idx)=>{if(o.s===0)return;let d=null;
    if(o.hu)d={type:'hu'};else if(o.kong&&Math.random()<.5)d={type:'kong'};else if(o.pong&&botWantsPong(o.s,t.c))d={type:'pong'};else if(o.chow.length&&Math.random()<.3)d={type:'chow',set:o.chow[Math.floor(Math.random()*o.chow.length)]};
    if(d){d.s=o.s;d.idx=idx;if(!botBest||pri(d)>pri(botBest))botBest=d;}});
  const me=opts.find(o=>o.s===0);const meIdx=me?opts.indexOf(me):9;
  const myMax=!me?0:me.hu?3:(me.pong||me.kong)?2:me.chow.length?1:0;
  const humanFirst=myMax>0&&(!botBest||myMax>pri(botBest)||(myMax===3&&pri(botBest)===3&&meIdx<botBest.idx));
  if(humanFirst){M.claimOpts={from,t,me,fallback:botBest};M.phase='claim';setDeadline(CLAIM_MS);render();SFX.turn();return;}
  if(botBest)return execClaim(botBest.s,botBest.type,from,t,botBest.set);
  nextTurn(from);
}
function humanClaim(type,set){
  const co=M.claimOpts;if(!co||M.phase!=='claim')return;M.claimOpts=null;
  if(type==='pass'){if(co.fallback)return execClaim(co.fallback.s,co.fallback.type,co.from,co.t,co.fallback.set);return nextTurn(co.from);}
  execClaim(0,type,co.from,co.t,set);
}
function execClaim(s,type,from,t,set){
  M.ponds[from].pop();M.last=null;
  if(type==='hu'){M.hands[s].push(t);return declareWin(s,from,t);}
  const h=M.hands[s];const take=x=>{const i=h.findIndex(q=>q.c===x);if(i>=0)h.splice(i,1);};
  if(type==='pong'){take(t.c);take(t.c);M.melds[s].push({type:'pong',tiles:[t.c,t.c,t.c],from});shout(s,'Pong!');M.turn=s;M.drawn=null;sortHand(s);startTurn(s);return;}
  if(type==='kong'){take(t.c);take(t.c);take(t.c);M.melds[s].push({type:'kong',tiles:[t.c,t.c,t.c,t.c],from});shout(s,'Kong!');sortHand(s);if(!draw(s,true))return;startTurn(s);return;}
  if(type==='chow'){set.forEach(take);M.melds[s].push({type:'chow',tiles:[t.c,...set].sort((a,b)=>a-b),from});shout(s,'Chow!');M.turn=s;M.drawn=null;sortHand(s);startTurn(s);}
}
function nextTurn(from){const s=(from+1)%4;M.turn=s;if(!draw(s))return;startTurn(s);}
function declareWin(s,from,t){
  M.phase='over';clearDeadline();
  const selfDraw=from===null;const f=fanOf(s,M.hands[s],selfDraw);
  const pay=[0,0,0,0];
  if(selfDraw){for(let k=0;k<4;k++)if(k!==s){const p=Math.ceil(f.points/2);pay[k]-=p;pay[s]+=p;}}
  else{pay[from]-=f.points;pay[s]+=f.points;}
  for(let k=0;k<4;k++)M.scores[k]+=pay[k];
  M.result={s,from,f,pay,selfDraw};
  shout(s,selfDraw?'Tsumo!':'Mahjong!');
  if(s===0){SFX.win();setTimeout(J.confetti,300);J.addCoins(f.points);J.addXP(30+f.total*10);J.unlock('mj4_win');if(f.total>=3)J.unlock('mj4_big');J.playMeme(10);}
  else{SFX.lose();if(from===0)say(s,['Thanks for the tile!','That was the one I needed.','Ron! Sorry, not sorry.'][Math.floor(Math.random()*3)]);}
  render();showResult();
  setTimeout(()=>{if(J.current==='mj4')J.finisher({list:[{seed:seed(s),bot:s!==0,name:names()[s]}],top:selfDraw?'TSUMO':'MAHJONG',big:f.total>=5});},500);
}
function drawGame(){M.phase='over';clearDeadline();M.result={s:-1};render();showResult();}
function showResult(){
  const r=M.result,nm=names();const b=$('m4Banner');
  if(r.s<0){$('m4BanT').textContent='Draw game';$('m4BanS').textContent='The wall ran out. Nobody pays.';}
  else{$('m4BanT').textContent=`${nm[r.s]} wins ${num(r.f.points)} points!`;
    $('m4BanS').innerHTML=esc(`${r.selfDraw?'Self-drawn':'On '+nm[r.from]+'’s discard'} · ${r.f.total} fan`)+'<br>'+(r.f.fan.length?r.f.fan.map(x=>esc(`${x[0]} +${x[1]}`)).join(' · '):'Chicken hand (no fan)');}
  b.hidden=false;
}
function nextHand(){
  if(!M.result)return;const r=M.result;
  if(r.s!==M.dealer){M.dealer=(M.dealer+1)%4;if(M.dealer===0)M.round=(M.round+1)%4;}
  M.handNo++;startHand();
}

/* ---------- timers ---------- */
function setDeadline(ms){M.deadline=Date.now()+ms;}
function clearDeadline(){M.deadline=0;}
setInterval(()=>{
  if(J.current!=='mj4'||!M.on||!M.deadline)return;
  const left=Math.max(0,Math.ceil((M.deadline-Date.now())/1000));
  const tEl=$('m4Timer');if(tEl)tEl.textContent=left+'s';
  if(left>0)return;
  if(M.phase==='claim'){humanClaim('pass');return;}
  if(M.phase==='turn'&&M.turn===0){const t=M.drawn&&M.hands[0].includes(M.drawn)?M.drawn:bestDiscard(0);J.toast('Time’s up. Discarded for you.','',1600);discard(0,t);}
},250);

/* ---------- speech ---------- */
function seatEl(s){return s===0?$('m4Me'):$('m4S'+s);}
function shout(s,txt){J.floatText(seatEl(s).querySelector('.av')||seatEl(s),txt);SFX.pop();}
function say(s,txt){const el=seatEl(s);if(!el)return;const t=$('m4Table').getBoundingClientRect(),r=(el.querySelector('.av')||el).getBoundingClientRect();const b=document.createElement('div');b.className='say';b.textContent=txt;const cx=r.left+r.width/2;b.style.left=(cx-t.left)+'px';b.style.top=(r.top-t.top-6)+'px';$('m4Table').appendChild(b);const w=b.offsetWidth,vw=document.documentElement.clientWidth;let dx=cx-w/2<8?8-(cx-w/2):cx+w/2>vw-8?vw-8-(cx+w/2):0;if(dx){b.style.left=(cx-t.left+dx)+'px';b.style.setProperty('--tail',(-dx)+'px');}setTimeout(()=>b.remove(),2600);}

/* ---------- rendering ---------- */
const tileH=(c,cls,extra)=>`<span class="mt${cls?' '+cls:''}"${extra||''}>${J.mjFace(face(c))}</span>`;
const backH=(cls)=>`<span class="mt back${cls?' '+cls:''}"></span>`;
function meldsH(s){return M.melds[s].map(m=>`<span class="m4-meld">${m.tiles.map((c,i)=>m.type==='ckong'&&(i===0||i===3)?backH('sm'):tileH(c,'sm')).join('')}</span>`).join('');}
function render(){
  if(!M.on)return;const nm=names();const reveal=M.phase==='over';
  for(let s=1;s<4;s++){
    const el=$('m4S'+s);const w=seatWind(s);
    el.className=`m4-seat s${s}${M.turn===s&&M.phase!=='over'?' turn':''}${M.result&&M.result.s===s?' win':''}`;
    const concealed=reveal?M.hands[s].map(t=>tileH(t.c,'sm')).join(''):M.hands[s].map(()=>backH('sm')).join('');
    el.innerHTML=`<div class="m4-who"><span class="av">${J.avatarSVG(seed(s),true)}</span><div><b>${esc(nm[s])}</b><span><i class="wind">${WCH[w]}</i>${M.dealer===s?' · dealer':''} · ${num(M.scores[s])} pts</span></div>${M.turn===s&&M.phase==='turn'?'<span class="bubble b-think"><span>•</span><span>•</span><span>•</span></span>':''}</div><div class="m4-tiles${reveal?' open':''}">${concealed}</div><div class="m4-melds">${meldsH(s)}</div>`;
  }
  const me=$('m4Me');me.className=`m4-me${M.turn===0&&M.phase!=='over'?' turn':''}${M.result&&M.result.s===0?' win':''}`;
  me.innerHTML=`<span class="av">${J.avatarSVG(seed(0),false)}</span><div><b>${esc(nm[0])} (you)</b><span><i class="wind">${WCH[seatWind(0)]}</i>${M.dealer===0?' · dealer':''} · ${num(M.scores[0])} pts</span></div>`;
  for(let s=0;s<4;s++){const p=$('m4P'+s);p.innerHTML=M.ponds[s].map((t,i)=>tileH(t.c,(M.last&&M.last.t===t?'last':'')+(i===M.ponds[s].length-1&&M.last&&M.last.t===t?' drop':''))).join('');}
  $('m4Center').innerHTML=`<b>${WCH[M.round]}</b><span>${WIND[M.round]} round · hand ${M.handNo}</span><span>Wall ${M.wall.length}</span>${[0,1,2,3].map(s=>`<i class="cw c${s}${M.turn===s?' on':''}">${WCH[seatWind(s)]}</i>`).join('')}`;
  $('m4Round').textContent=`${WIND[M.round]} ${M.handNo}`;$('m4Wall').textContent=M.wall.length;$('m4Pts').textContent=num(M.scores[0]);
  renderHand();renderActs();
}
function renderHand(){
  const h=M.hands[0];
  const showDrawn=M.drawn&&M.turn===0&&M.phase==='turn'&&h.includes(M.drawn);
  const hint=J.S.hint&&M.turn===0&&M.phase==='turn'?bestDiscard(0):null;
  const mk=(t,cls)=>`<button type="button" class="mt${cls}${M.sel===t?' sel':''}${hint===t?' hinted':''}" data-u="${t.u}" aria-label="${tname(t.c)}">${J.mjFace(face(t.c))}</button>`;
  $('m4Hand').innerHTML=(showDrawn?h.filter(t=>t!==M.drawn):h).map(t=>mk(t,'')).join('')+(showDrawn?mk(M.drawn,' drawn'):'')+(M.melds[0].length?`<span class="m4-mymelds">${meldsH(0)}</span>`:'');
  fitHand();
}
function fitHand(){
  const el=$('m4Hand');if(!el||!el.clientWidth)return;const tiles=el.querySelectorAll(':scope>.mt');const n=tiles.length;if(!n)return;
  const cs=getComputedStyle(el);const gap=parseFloat(cs.columnGap)||4;const W=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const dr=el.querySelector(':scope>.mt.drawn');const extra=dr?parseFloat(getComputedStyle(dr).marginLeft)||0:0;
  let units=n;const md=el.querySelector('.m4-mymelds');
  if(md&&getComputedStyle(md).order!=='-1'){units+=md.querySelectorAll('.mt').length*.7+(parseFloat(getComputedStyle(md).marginLeft)||0)/30+M.melds[0].length*.1;}
  // narrow phone held upright: two rows of tiles, about twice as wide and much easier to tap
  if(innerWidth<=440&&innerHeight>innerWidth&&n>=8){const per=Math.ceil(n/2),g=4;const tw2=Math.floor(Math.min(48,(W-g*(per-1)-4)/per));el.dataset.rows='2';el.style.setProperty('--cols',per);el.style.setProperty('--tw',tw2+'px');return;}
  delete el.dataset.rows;
  const tw=Math.floor(Math.max(18,Math.min(innerHeight<540&&innerWidth>innerHeight?42:62,(W-gap*(n-1)-extra-4)/units)));el.style.setProperty('--tw',tw+'px');
}
function renderActs(){
  const a=$('m4Acts');let h='';const st=$('m4Status');const nm=names();
  const timer=M.deadline?` · <span class="t" id="m4Timer">${Math.max(0,Math.ceil((M.deadline-Date.now())/1000))}s</span>`:'';
  if(M.phase==='over'){h=`<button class="btn btn-raise" type="button" data-a="next">Next hand</button><button class="btn btn-fold" type="button" data-a="newmatch">New match</button>`;st.innerHTML=M.result&&M.result.s===0?'<b>You win!</b> Nice hand.':M.result&&M.result.s>0?`<b>${esc(nm[M.result.s])}</b> won this one.`:'Draw game.';}
  else if(M.phase==='claim'&&M.claimOpts){
    const o=M.claimOpts.me,t=M.claimOpts.t;
    st.innerHTML=`<b>${esc(nm[M.claimOpts.from])}</b> discarded ${esc(tname(t.c))}. Claim it?${timer}`;
    if(o.hu)h+=`<button class="btn btn-raise" type="button" data-a="hu">Mahjong!</button>`;
    if(o.kong)h+=`<button class="btn btn-violet" type="button" data-a="kong">Kong</button>`;
    if(o.pong)h+=`<button class="btn btn-call" type="button" data-a="pong">Pong</button>`;
    o.chow.forEach((set,i)=>{h+=`<button class="btn btn-fold chowbtn" type="button" data-a="chow" data-i="${i}">Chow ${[t.c,...set].sort((a,b)=>a-b).map(c=>`<span class="mt xs">${J.mjFace(face(c))}</span>`).join('')}</button>`;});
    h+=`<button class="btn btn-fold" type="button" data-a="pass">Pass</button>`;
  }
  else if(M.phase==='turn'&&M.turn===0){
    const win=M.drawn&&winShape(M.hands[0],M.melds[0].length);const ko=M.drawn?kongOptions(0):[];
    st.innerHTML=`<b>Your turn.</b> ${M.drawn?`You drew ${esc(tname(M.drawn.c))}. `:''}Tap a tile, then discard.${timer}`;
    if(win)h+=`<button class="btn btn-raise" type="button" data-a="tsumo">Tsumo! (win)</button>`;
    ko.forEach((k,i)=>h+=`<button class="btn btn-violet" type="button" data-a="ckong" data-i="${i}">Kong ${esc(tname(k.c))}</button>`);
    h+=`<button class="btn btn-call" type="button" data-a="discard"${M.sel?'':' disabled'}>${M.sel?'Discard '+esc(tname(M.sel.c)):'Pick a tile to discard'}</button>`;
  }
  else{st.innerHTML=M.turn>0?`<b>${esc(nm[M.turn])}</b> is thinking…`:'Waiting…';}
  a.innerHTML=h;
}

/* ---------- input ---------- */
$('m4Hand').onclick=e=>{
  const b=e.target.closest('.mt[data-u]');if(!b||M.phase!=='turn'||M.turn!==0)return;
  const t=M.hands[0].find(x=>String(x.u)===b.dataset.u);if(!t)return;
  if(M.sel===t){discard(0,t);return;}
  M.sel=t;SFX.click();renderHand();renderActs();
};
$('m4Acts').onclick=e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='next')return nextHand();if(a==='newmatch')return newMatch();
  if(a==='discard'&&M.sel)return discard(0,M.sel);
  if(a==='tsumo')return declareWin(0,null);
  if(a==='ckong'){const k=kongOptions(0)[Number(b.dataset.i)];if(k)doKong(0,k);return;}
  if(M.phase==='claim'){if(a==='chow')return humanClaim('chow',M.claimOpts.me.chow[Number(b.dataset.i)]);return humanClaim(a);}
};
$('m4HintBtn').onclick=()=>{if(M.phase==='turn'&&M.turn===0){const t=bestDiscard(0);M.sel=t;renderHand();renderActs();J.toast(`<span class="t-ic">💡</span><span><b>Try discarding ${esc(tname(t.c))}</b><br>It helps your hand the least right now.</span>`,'',2600);}else if(M.phase==='claim'){const o=M.claimOpts.me;J.toast(o.hu?'Take it. That tile wins the hand!':o.pong&&(M.claimOpts.t.c>=31)?'Dragons are worth fan. Pong it!':'Passing keeps your hand concealed, which is worth a fan.','',2600);}};
document.addEventListener('keydown',e=>{if(J.current!=='mj4'||J.anyModal())return;if(e.key==='Enter'&&M.sel&&M.phase==='turn'&&M.turn===0){e.preventDefault();discard(0,M.sel);}});
J.memeGrid(document.querySelector('#m4MemePop [data-memes]'),pick=>{$('m4MemePop').hidden=true;if(pick.c)J.playCustom(pick.c);else J.playMeme(pick.k);J.floatText($('m4Me'),pick.label,'mint');});
$('m4MemeBtn').onclick=e=>{e.stopPropagation();$('m4MemePop').hidden=!$('m4MemePop').hidden;};
document.addEventListener('click',e=>{if(!$('m4MemePop').hidden&&!e.target.closest('#m4MemePop')&&!e.target.closest('#m4MemeBtn'))$('m4MemePop').hidden=true;});

/* ---------- screen ---------- */
function fit(){fitHand();const st=$('m4Stage'),tb=$('m4Table');const W=st.clientWidth-16,H=st.clientHeight-8;if(W<=0||H<=0)return;const sideways=innerWidth>innerHeight&&innerHeight<540;const tall=W/H<1.05||(!sideways&&W<640&&W/H<1.4);const ratio=tall?.78:(H<320?Math.min(2.1,Math.max(1.6,W/H)):1.6);const w=Math.max(260,Math.min(W,H*ratio));tb.style.width=w+'px';tb.style.height=(w/ratio)+'px';tb.classList.toggle('tall',tall);tb.classList.toggle('short',!tall&&w/ratio<330);}
new ResizeObserver(()=>{if(J.current==='mj4')fit();}).observe($('m4Stage'));
function open(){J.show('mj4');fit();if(!M.on)newMatch();else render();}
J.registerScreen('mj4',{hide(){}});
(window.JJ_SCREENS=window.JJ_SCREENS||{}).mj4={leave(){J.show('home');J.renderPokerHome&&J.renderPokerHome();}};
$('mj4Btn').onclick=open;
J.onSettings(()=>{if(J.current==='mj4'&&M.on)render();});
J._m4={M,winShape,fanOf,counts};
J.onSettings(()=>{if(J.current==='mj4'&&M.on)render();});
})();
