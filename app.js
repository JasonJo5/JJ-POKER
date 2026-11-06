/* JJ POKER — home screen, settings, help, rewards */
(() => {
'use strict';
const J=window.JJ,{$,S,saveS,applyS,P,num,esc}=J;

/* ---------- Generic modal / nav wiring ---------- */
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-open]');
  if(o){e.preventDefault();J.openModal(o.dataset.open);if(o.dataset.open==='mHelp')setHelpTab(o.dataset.help||(J.current==='bj'?'bj':J.current==='mj'?'mj':'poker'));return;}
  if(e.target.closest('[data-close]')){J.closeModals();return;}
  const m=e.target.classList&&e.target.classList.contains('modal')?e.target:null;if(m)J.closeModals();
  const lv=e.target.closest('[data-leave]');if(lv){const scr=J.current;const api=window.JJ_SCREENS&&window.JJ_SCREENS[scr];if(api&&api.leave)api.leave();else J.show('home');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&J.anyModal()){J.closeModals();e.stopPropagation();}},true);
const navLinks=()=>document.querySelectorAll('.nav-mid a[href^="#"]:not([data-open]),.tabbar a[data-tab-link]');
const markNav=id=>navLinks().forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#'+id));
navLinks().forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const id=a.getAttribute('href').slice(1);const t=document.getElementById(id);if(t)t.scrollIntoView({behavior:J.animOn()?'smooth':'auto',block:'start'});markNav(id);}));
{let spyT=0;window.addEventListener('scroll',()=>{if(J.current!=='home'||spyT)return;spyT=setTimeout(()=>{spyT=0;const ids=['games','themes','rewards'];let cur='games';const mid=innerHeight*.4;ids.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<mid)cur=id;});if(window.scrollY<80)cur='games';markNav(cur);},120);},{passive:true});}
$('achMore').onclick=()=>{const g=$('achGrid');const on=g.classList.toggle('all');$('achMore').textContent=on?'Show fewer':'Show all badges';};
$('homeBrand').onclick=()=>window.scrollTo({top:0,behavior:J.animOn()?'smooth':'auto'});

/* help tabs */
function setHelpTab(t){document.querySelectorAll('[data-help-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.helpTab===t)));document.querySelectorAll('[data-help-pane]').forEach(p=>p.hidden=p.dataset.helpPane!==t);}
document.querySelectorAll('[data-help-tab]').forEach(b=>b.onclick=()=>setHelpTab(b.dataset.helpTab));

/* ---------- Settings ---------- */
const felts=[['blue','#2f4be0'],['teal','#0f8a80'],['green','#13985f'],['red','#c53a4b'],['purple','#6a42d8'],['black','#2b2e3d'],['rose','#d9577f']];
$('feltSw').innerHTML=felts.map(([v,c])=>`<button type="button" class="sw" data-v="${v}" style="background:radial-gradient(circle at 40% 30%,${c}cc,${c})" aria-label="${v} table"></button>`).join('');
const backs=[['coral','#ff6b4a'],['blue','#2f4be0'],['mint','#17b083'],['violet','#7c3aed'],['black','#22253a']];
$('backSw').innerHTML=backs.map(([v,c])=>`<button type="button" class="sw" data-v="${v}" style="background:${c};background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.22) 0 2px,transparent 2px 8px)" aria-label="${v} card back"></button>`).join('');
$('feltSw').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;S.felt=b.dataset.v;saveS();applyS();};
$('backSw').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;S.back=b.dataset.v;saveS();applyS();};
document.querySelectorAll('[data-theme-btn]').forEach(b=>b.onclick=()=>{S.theme=b.dataset.themeBtn;saveS();applyS();});
const syncLang=()=>{const cur=(window.JJ_I18N&&JJ_I18N.lang)||'en';document.querySelectorAll('#langSeg [data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===cur)));};
$('langSeg').onclick=e=>{const b=e.target.closest('[data-lang]');if(!b)return;S.lang=b.dataset.lang;saveS();if(window.JJ_I18N)JJ_I18N.setLang(S.lang);applyS();syncLang();J.SFX.pop();};
setTimeout(syncLang,0);document.addEventListener('click',e=>{if(e.target.closest('[data-open="mSettings"]'))setTimeout(syncLang,0);});
$('themeFlip').onclick=()=>{S.theme=J.resolvedTheme()==='dark'?'light':'dark';saveS();applyS();};
const flipIc=()=>{const m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#f4f5fa';$('themeFlip').innerHTML=`<svg><use href="#i-${J.resolvedTheme()==='dark'?'sun':'moon'}"/></svg>`;};J.onSettings(flipIc);flipIc();
[['sSound','sound'],['sMemes','memes'],['sAnim','anim'],['sFour','four'],['sHint','hint'],['sVib','vib'],['sFin','fin'],['sLite','lite']].forEach(([id,k])=>{$(id).onchange=e=>{S[k]=e.target.checked;saveS();applyS();if(k==='sound'&&S.sound)J.SFX.pop();};});
document.querySelectorAll('.sound-toggle').forEach(b=>b.onclick=()=>{S.sound=!S.sound;saveS();applyS();if(S.sound)J.SFX.pop();});

/* hand rankings */
const R=[['Royal flush','A♠ K♠ Q♠ J♠ 10♠'],['Straight flush','9♥ 8♥ 7♥ 6♥ 5♥'],['Four of a kind','Q♣ Q♦ Q♥ Q♠ 3♦'],['Full house','K♠ K♥ K♦ 4♣ 4♠'],['Flush','A♦ J♦ 8♦ 6♦ 2♦'],['Straight','10♣ 9♦ 8♠ 7♥ 6♣'],['Three of a kind','7♠ 7♥ 7♦ K♣ 2♠'],['Two pair','J♥ J♣ 5♦ 5♠ A♠'],['Pair','10♥ 10♠ K♦ 6♣ 3♥'],['High card','A♣ Q♦ 9♠ 5♥ 2♣']];
const parse=t=>{const r={A:14,K:13,Q:12,J:11}[t.slice(0,-1)]||Number(t.slice(0,-1));return J.cardOf(r*4+J.SUITS.indexOf(t.slice(-1)));};
$('ranks').innerHTML=R.map(([n,c])=>`<li><b>${n}</b><span class="mc">${c.split(' ').map(t=>J.cardFace(parse(t))).join('')}</span></li>`).join('');

/* meme grids */
J.memeGrid=(el,onPick)=>{
  if(!el)return;
  const draw=()=>{let h=J.MEMES.map((m,i)=>`<button type="button" data-m="${i}"><span>${m.ic}</span>${esc(m.name)}</button>`).join('');
    const cs=J.SB.list;if(cs.length||J.SB.canEdit||J.SB.folder){h+=`<div class="memes-sep">Your sounds</div>`+cs.map(x=>`<button type="button" data-c="${esc(x.id)}"><span>${esc(x.ic)}</span>${esc(x.name)}</button>`).join('');if(J.SB.canEdit||J.SB.folder)h+=`<button type="button" class="add" data-add="1"><span>＋</span>Add sound</button>`;}
    el.innerHTML=h;};
  draw();J.onSounds(draw);
  el.onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.add){J.openModal('mSound');return;}
    if(b.dataset.m!==undefined){const k=Number(b.dataset.m);onPick({k,label:`${J.MEMES[k].ic} ${J.MEMES[k].name}`});}
    else if(b.dataset.c){const it=J.SB.list.find(x=>x.id===b.dataset.c);if(it)onPick({c:it.id,label:`${it.ic} ${it.name}`});}};
};

/* ---------- Sound uploads ---------- */
const ICS=['🔊','😂','🐶','💀','🔥','📢','🎵','🤡','😭','🚨'];let pickedIc='🔊';
$('sndIcons').innerHTML=ICS.map(i=>`<button type="button" data-i="${i}" aria-pressed="${i===pickedIc}">${i}</button>`).join('');
$('sndIcons').onclick=e=>{const b=e.target.closest('button');if(!b)return;pickedIc=b.dataset.i;$('sndIcons').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));};
$('sndFile').onchange=()=>{const f=$('sndFile').files[0];if(f&&!$('sndName').value)$('sndName').value=f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').slice(0,16);$('sndMsg').textContent=f?`${f.name} · ${(f.size/1024).toFixed(0)} KB`:'';};
function renderSndList(){
  const ul=$('sndList');const cs=J.SB.list;
  ul.innerHTML=cs.length?cs.map(x=>`<li><button type="button" class="link-btn" data-play="${esc(x.id)}">${esc(x.ic)} ${esc(x.name)}</button>${J.SB.canEdit?`<button type="button" class="icon-btn" data-del="${esc(x.id)}" aria-label="Remove ${esc(x.name)}"><svg><use href="#i-close"/></svg></button>`:''}</li>`).join(''):'<li class="none">No custom sounds yet.</li>';
  $('sndForm').hidden=!J.SB.canEdit;$('sndNoEdit').hidden=J.SB.canEdit||J.SB.folder;$('sndFolder').hidden=!J.SB.folder;$('sndIntro').hidden=J.SB.folder;
}
J.onSounds(renderSndList);renderSndList();
$('sndList').onclick=async e=>{const p=e.target.closest('[data-play]');if(p){J.playCustom(p.dataset.play);return;}const d=e.target.closest('[data-del]');if(d){d.disabled=true;try{await J.removeSound(d.dataset.del);}catch(err){$('sndMsg').textContent='Could not remove that sound.';}}};
$('sndUp').onclick=async()=>{
  const f=$('sndFile').files[0];if(!f){$('sndMsg').textContent='Pick an audio file first.';return;}
  const b=$('sndUp');b.disabled=true;$('sndMsg').textContent='Converting and uploading… (up to 8 seconds per clip)';
  try{await J.addSound(f,$('sndName').value,pickedIc);$('sndMsg').textContent='Added! Everyone at the table can play it now.';$('sndFile').value='';$('sndName').value='';J.SFX.coins();}
  catch(err){$('sndMsg').textContent=(err&&err.message)||'Upload failed. Try a different file.';}
  b.disabled=false;
};

/* ---------- Themes ---------- */
function setScene(v){S.scene=v;const sc=J.SCENES[v];if(sc){S.felt=sc.felt;S.back=sc.back;}saveS();applyS();J.SFX.pop();}
$('sceneGrid').innerHTML=Object.entries(J.SCENES).map(([k,v])=>`<button type="button" class="scene-card sp-${k}" data-scene-btn="${k}" aria-pressed="false"><span class="sc-art"><span class="sc-ic">${v.ic}</span></span><span class="sc-txt"><b>${esc(v.name)}</b><small>${esc(v.desc)}</small></span></button>`).join('');
$('sceneSeg').innerHTML=Object.entries(J.SCENES).map(([k,v])=>`<button type="button" data-scene-btn="${k}" aria-pressed="false">${v.ic} ${esc(v.name)}</button>`).join('');
document.querySelectorAll('[data-scene-btn]').forEach(b=>b.onclick=()=>setScene(b.dataset.sceneBtn));

/* ---------- Identity ---------- */
const nickEl=$('nick');
nickEl.value=J.cleanName(J.store.get('jj-nick')||J.store.get('jpp-nick')||'');
function renderMyAv(){$('myAv').innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false);document.querySelectorAll('[data-my-av]').forEach(el=>el.innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false));}
{let lastSc=J.S.scene;J.onSettings(()=>{if(J.S.scene!==lastSc){lastSc=J.S.scene;renderMyAv();}});}
J.renderMyAv=renderMyAv;
nickEl.addEventListener('input',()=>{J.store.set('jj-nick',nickEl.value);renderMyAv();});
$('avPick').onclick=()=>{J.shuffleAvatar();renderMyAv();J.SFX.pop();if(J.animOn())$('myAv').animate([{transform:'rotate(-25deg) scale(.7)'},{transform:'none'}],{duration:450,easing:'cubic-bezier(.2,1.5,.4,1)'});};

/* ---------- Illustrations ---------- */
const face=(r,s)=>J.cardFace(J.cardOf(r*4+s));
$('artCards').innerHTML=face(14,0)+face(14,1)+face(13,1);
$('fcAv1').innerHTML=J.avatarSVG('Mira',true);
$('gcPoker').innerHTML=face(14,0)+face(13,1)+face(12,2);
$('gcBJ').innerHTML=face(14,3)+face(13,0)+'<i class="pchip" style="--c:#ffc83d;width:54px;height:54px;border-width:5px;align-self:center"></i>';

/* ---------- Profile UI ---------- */
function renderProfile(){
  document.querySelectorAll('.coinTxt').forEach(el=>el.textContent=num(P.coins));
  const lv=J.level(P.xp),a=J.xpFor(lv),b=J.xpFor(lv+1);
  $('lvlTxt').textContent=lv;$('xpFill').style.width=Math.min(100,((P.xp-a)/(b-a))*100)+'%';$('xpTxt').textContent=`${num(P.xp-a)} / ${num(b-a)} XP`;
  const st=P.stats;
  const best=st.mjbest?`${Math.floor(st.mjbest/60)}:${String(st.mjbest%60).padStart(2,'0')}`:'—';
  $('mystats').innerHTML=[[num(st.ph),'poker hands'],[num(st.pw),'pots won'],[money0(st.big),'biggest pot'],[num(st.bjh),'blackjack hands'],[num(st.bjw),'blackjack wins'],[num(st.bjbj),'naturals'],[num(st.mjc),'mahjong clears'],[best,'fastest clear']].map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('');
  const got=J.ACH.filter(x=>P.ach[x.id]).length;$('achCount').textContent=`${got} of ${J.ACH.length}`;
  $('achGrid').innerHTML=[...J.ACH].sort((x,y)=>(P.ach[y.id]?1:0)-(P.ach[x.id]?1:0)).map(x=>`<div class="ach${P.ach[x.id]?' on':''}" title="${esc(x.desc)}"><span class="ic">${x.ic}</span><span><b>${esc(x.name)}</b><span>${esc(x.desc)}</span></span></div>`).join('');
  renderSpin();
}
const money0=n=>n?'$'+num(n):'—';
J.onProfile(renderProfile);

/* ---------- Daily wheel ---------- */
const PRIZES=[100,500,150,1000,200,2500,300,750];
const WCOL=['#ff6b4a','#ffc83d','#22c995','#2f4be0','#ff9bb3','#7a4cf0','#3cc9b9','#ff8a4c'];
(function drawWheel(){
  const n=PRIZES.length,seg=360/n;let h='';
  const pt=(a,r)=>[r*Math.sin(a*Math.PI/180),-r*Math.cos(a*Math.PI/180)];
  for(let i=0;i<n;i++){const a0=i*seg,a1=a0+seg;const [x0,y0]=pt(a0,96),[x1,y1]=pt(a1,96);h+=`<path d="M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A96 96 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${WCOL[i]}" stroke="#fff" stroke-width="2"/>`;const am=a0+seg/2;const [tx,ty]=pt(am,64);h+=`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${am} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="middle" dominant-baseline="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="15" fill="#fff" style="paint-order:stroke" stroke="rgba(0,0,0,.25)" stroke-width="2">${PRIZES[i]>=1000?(PRIZES[i]/1000)+'K':PRIZES[i]}</text>`;}
  h+=`<circle r="97" fill="none" stroke="#151a36" stroke-width="4"/>`;
  for(let i=0;i<n;i++){const [x,y]=pt(i*seg,97);h+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#fff"/>`;}
  $('wheel').innerHTML=h;
})();
let spinning=false,wheelRot=0;
function spinLeft(){return Math.max(0,P.lastSpin+24*3600e3-Date.now());}
function renderSpin(){
  if(spinning)return;const left=spinLeft();const b=$('spinBtn');
  if(left>0){b.disabled=true;const h=Math.floor(left/3600e3),m=Math.floor(left%3600e3/60e3);b.textContent=`Next spin in ${h}h ${m}m`;}
  else{b.disabled=false;b.textContent='Spin the wheel';}
}
$('spinBtn').onclick=()=>{
  if(spinning||spinLeft()>0)return;spinning=true;$('spinBtn').disabled=true;$('spinBtn').textContent='Spinning…';
  const weights=[22,10,20,5,18,2,16,7];let r=Math.random()*weights.reduce((a,b)=>a+b,0),idx=0;for(;idx<weights.length;idx++){r-=weights[idx];if(r<=0)break;}idx=Math.min(idx,PRIZES.length-1);
  const seg=360/PRIZES.length,center=idx*seg+seg/2,jit=(Math.random()-.5)*seg*.6;
  wheelRot+=360*6+((360-center-jit)-(wheelRot%360)+360)%360;
  const w=$('wheel');w.style.transform=`rotate(${wheelRot}deg)`;
  let t=0;const ticks=()=>{if(!spinning)return;J.SFX.tick();t++;setTimeout(ticks,40+t*t*1.1);};ticks();
  setTimeout(()=>{spinning=false;P.lastSpin=Date.now();J.addCoins(PRIZES[idx]);J.SFX.coins();J.confetti();J.toast(`<span class="t-ic">🎡</span><span><b>You won ${num(PRIZES[idx])} coins!</b><br>Come back tomorrow for another spin.</span>`,'gold',4200);$('spinTxt').textContent=`Today's prize: ${num(PRIZES[idx])} coins. Spend them at the blackjack table.`;J.unlock('spin');renderProfile();},J.animOn()?4300:200);
};
setInterval(renderSpin,30000);

/* ---------- Boot ---------- */
applyS();renderMyAv();renderProfile();
})();
