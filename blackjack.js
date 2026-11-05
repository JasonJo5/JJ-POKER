/* JJ POKER — Blackjack vs JJ-21 */
(() => {
'use strict';
const J=window.JJ,{$,num,S,SFX}=J;
const CHIPS=[[5,'#ffffff'],[25,'#22c995'],[100,'#151a36'],[500,'#7a4cf0'],[1000,'#ffc83d']];
const CHIPC=v=>(CHIPS.slice().reverse().find(([d])=>v>=d)||CHIPS[0])[1];
const LINES={bust:['Ouch. One card too many.','The 22 club welcomes you.','Greedy, greedy.'],bj:['Natural! Show-off.','Blackjack! I felt that in my circuits.','Okay, that was pretty.'],dbust:['I’m malfunctioning…','Error 22: dealer busted.','Fine, take my chips.'],dwin:['House wins. As foretold.','Better luck next shuffle.','The robot remains undefeated.'],push:['A tie. How diplomatic.','Push. Nobody cries.']};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const B={shoe:[],uid:0,bet:0,last:0,hands:[],active:0,dealer:[],phase:'bet',busy:false,holeUp:false,seen:new Set(),tall:false};

/* ---------- shoe & values ---------- */
function buildShoe(){const s=[];for(let d=0;d<6;d++)for(let r=2;r<=14;r++)for(let k=0;k<4;k++)s.push({r,s:k,id:r*4+k});J.shuffle(s);B.shoe=s;}
function draw(){if(B.shoe.length<20)buildShoe();const c=B.shoe.pop();return Object.assign({},c,{u:++B.uid});}
const val=c=>c.r===14?11:c.r>=10?10:c.r;
function score(cards){let t=0,a=0;for(const c of cards){t+=val(c);if(c.r===14)a++;}while(t>21&&a){t-=10;a--;}return{t,soft:a>0};}
const isBJ=h=>h.cards.length===2&&score(h.cards).t===21&&!h.split;

/* ---------- layout ---------- */
const table=$('bjTable');
function fit(){const st=$('bjStage');const W=st.clientWidth-16,H=st.clientHeight-8;if(W<=0||H<=0)return;const sideways=innerWidth>innerHeight&&innerHeight<540;const tall=W/H<1.1||(!sideways&&W<620&&W/H<1.45);const ratio=tall?.82:1.75;const w=Math.max(200,Math.min(W,H*ratio));table.style.width=w+'px';table.style.height=(w/ratio)+'px';B.tall=tall;table.classList.toggle('tall',tall);}
new ResizeObserver(()=>{if(J.current==='bj'){fit();render(true);}}).observe($('bjStage'));
function rel(el){const t=table.getBoundingClientRect(),r=el.getBoundingClientRect();return [r.left+r.width/2-t.left,r.top+r.height/2-t.top];}

/* ---------- rendering ---------- */
function cardHTML(c,down,i){
  const key=c.u+(down?'d':'u');const fresh=!B.seen.has(key);B.seen.add(key);
  let a='';if(fresh&&J.animOn())a=down?'deal':(B.seen.has(c.u+'d')?'flip':'deal');
  return J.cardFace(c,{down,anim:a});
}
function setDeal(el){const [sx,sy]=rel($('bjShoe'));const [cx,cy]=rel(el);el.style.setProperty('--dx',(sx-cx).toFixed(0)+'px');el.style.setProperty('--dy',(sy-cy).toFixed(0)+'px');}
function totalBadge(cards,extra){const s=score(cards);let cls='';if(s.t>21)cls='bust';else if(extra==='bj')cls='bj';else if(extra==='win')cls='win';return `<span class="total ${cls}">${extra==='bj'?'Blackjack':s.t>21?'Bust '+s.t:(s.soft&&s.t<21&&B.phase==='play'?`${s.t-10} / ${s.t}`:s.t)}</span>`;}
function render(noAnim){
  // dealer
  const dEl=$('bjDealer');setDeal(dEl);
  dEl.innerHTML=B.dealer.map((c,i)=>cardHTML(c,i===1&&!B.holeUp,i)).join('');
  const dt=$('bjDTotal');
  if(B.dealer.length){dt.hidden=false;const vis=B.holeUp?B.dealer:B.dealer.slice(0,1);const s=score(vis);dt.textContent=s.t>21?`Bust ${s.t}`:(B.holeUp&&B.dealer.length===2&&s.t===21?'Blackjack':String(s.t)+(B.holeUp?'':' + ?'));dt.className='total'+(s.t>21?' bust':'');}else dt.hidden=true;
  // hands
  const hEl=$('bjHands');
  hEl.innerHTML=B.hands.map((h,i)=>`<div class="bj-hand${B.phase==='play'&&i===B.active&&B.hands.length>1?' active':''}" data-h="${i}"><div class="bj-cards">${''}</div><div class="hb">${h.cards.length?totalBadge(h.cards,h.res==='bj'?'bj':h.res==='win'?'win':''):''}<span class="betchip"><i class="pchip" style="--c:${CHIPC(h.bet)};width:16px;height:16px;border-width:2px"></i>${num(h.bet)}${h.doubled?' ×2':''}</span></div></div>`).join('');
  hEl.querySelectorAll('.bj-hand').forEach((el,i)=>{const row=el.querySelector('.bj-cards');setDeal(row);row.innerHTML=B.hands[i].cards.map(c=>cardHTML(c,false)).join('');});
  // spot
  $('bjSpot').hidden=B.phase!=='bet'&&B.hands.length>0;
  renderStack();
  $('bjShoeTxt').textContent=B.shoe.length;
  $('bjStreak').textContent=J.P.stats.bjstreak||0;
  renderBar();
}
function renderStack(){
  const s=$('bjStack');let v=B.phase==='bet'?B.bet:0;const parts=[];
  for(const [d,c] of CHIPS.slice().reverse()){while(v>=d&&parts.length<9){parts.push(c);v-=d;}}
  s.innerHTML=parts.map((c,i)=>`<i style="--c:${c};top:${60-i*9}%"></i>`).join('');
  $('bjBetTxt').textContent=B.phase==='bet'?(B.bet?`Bet ${num(B.bet)}`:'Place a bet'):'';
}
function renderBar(){
  const coins=J.P.coins;
  $('bjCoins').innerHTML=`<span style="display:inline-flex;align-items:center;gap:8px"><i class="coin" style="width:22px;height:22px"></i>${num(coins)}</span>`;
  const betting=B.phase==='bet',playing=B.phase==='play'&&!B.busy;
  $('bjBetRow').hidden=!betting;$('bjPlayRow').hidden=betting;
  const broke=betting&&coins<5&&B.bet===0;$('bjBroke').hidden=!broke;
  document.querySelectorAll('#bjChips .bchip').forEach(b=>{const v=b.dataset.v==='all'?coins:Number(b.dataset.v);b.disabled=!betting||B.bet+v>coins&&b.dataset.v!=='all'||coins-B.bet<=0;});
  $('bjDeal').disabled=!betting||B.bet<=0||B.bet>coins;$('bjClear').disabled=!betting||!B.bet;$('bjRebet').disabled=!betting||!B.last||B.last>coins||B.bet===B.last;
  $('bjRebet').textContent=B.last?`Rebet ${num(B.last)}`:'Rebet';
  const h=B.hands[B.active];
  $('bjHit').disabled=!playing;$('bjStand').disabled=!playing;
  $('bjDouble').disabled=!playing||!h||h.cards.length!==2||coins<h.bet;
  $('bjSplit').disabled=!playing||!h||B.hands.length>1||h.cards.length!==2||val(h.cards[0])!==val(h.cards[1])||coins<h.bet;
  const st=$('bjStatus');
  if(betting)st.textContent=B.bet?`Betting ${num(B.bet)} coins. Hit Deal when ready.`:(coins<5?'You’re out of coins.':'Tap chips to bet, then deal.');
  else if(B.phase==='play'&&h){const s=score(h.cards);st.innerHTML=`<b>Your move.</b> ${B.hands.length>1?`Hand ${B.active+1} of ${B.hands.length}: `:''}you have ${s.soft&&s.t<21?`soft ${s.t}`:s.t}${B.dealer[0]?`, dealer shows ${val(B.dealer[0])===11?'an ace':val(B.dealer[0])}`:''}.`;}
  else if(B.phase==='dealer')st.textContent='Dealer’s turn…';
  const hint=B.phase==='play'&&!B.busy&&S.hint?advice():null;
  $('bjMeHint').textContent=hint?`Hint: ${hint.label}`:'';
  $('bjHintBtn').hidden=B.phase!=='play';
}

/* ---------- basic strategy ---------- */
function advice(){
  const h=B.hands[B.active];if(!h||!B.dealer[0])return null;
  const up=val(B.dealer[0]),s=score(h.cards),two=h.cards.length===2;
  const canD=two&&J.P.coins>=h.bet,canP=two&&B.hands.length===1&&val(h.cards[0])===val(h.cards[1])&&J.P.coins>=h.bet;
  const R=(a)=>({H:{k:'hit',label:'Hit'},S:{k:'stand',label:'Stand'},D:canD?{k:'double',label:'Double down'}:{k:'hit',label:'Hit'},Ds:canD?{k:'double',label:'Double down'}:{k:'stand',label:'Stand'},P:{k:'split',label:'Split'}})[a];
  if(canP){const v=val(h.cards[0]);
    if(v===11||v===8)return R('P');if(v===9&&![7,10,11].includes(up))return R('P');if((v===7||v===2||v===3)&&up<=7)return R('P');if(v===6&&up<=6)return R('P');if(v===4&&(up===5||up===6))return R('P');}
  if(s.soft&&s.t<21){const t=s.t;
    if(t>=20)return R('S');if(t===19)return up===6?R('Ds'):R('S');
    if(t===18)return up<=6&&up>=2?R('Ds'):(up<=8?R('S'):R('H'));
    if(t===17)return up>=3&&up<=6?R('D'):R('H');
    if(t>=15)return up>=4&&up<=6?R('D'):R('H');
    return up>=5&&up<=6?R('D'):R('H');}
  const t=s.t;
  if(t>=17)return R('S');if(t>=13)return up<=6?R('S'):R('H');if(t===12)return up>=4&&up<=6?R('S'):R('H');
  if(t===11)return R('D');if(t===10)return up<=9?R('D'):R('H');if(t===9)return up>=3&&up<=6?R('D'):R('H');return R('H');
}

/* ---------- flow ---------- */
const wait=ms=>J.sleep(J.animOn()?ms:60);
function say(text){const d=$('bjDealer');if(!d)return;const t=table.getBoundingClientRect(),r=d.getBoundingClientRect();table.querySelectorAll('.say').forEach(x=>x.remove());const s=document.createElement('div');s.className='say side';s.textContent=text;table.appendChild(s);const x=Math.min(r.right-t.left+(r.width?14:60),t.width-Math.min(220,s.offsetWidth)-8);s.style.left=Math.max(8,x)+'px';s.style.top=(r.top-t.top+r.height/2)+'px';setTimeout(()=>s.remove(),2800);}
function addBet(v,el){
  if(B.phase!=='bet')return;const coins=J.P.coins;
  const add=v==='all'?coins-B.bet:Math.min(v,coins-B.bet);if(add<=0)return;
  B.bet+=add;SFX.chip(1);if(el)J.flyChips(el,$('bjSpot'),2,0,{silent:true});renderStack();renderBar();
}
async function deal(){
  if(B.phase!=='bet'||B.bet<=0||B.bet>J.P.coins||B.busy)return;
  B.busy=true;J.addCoins(-B.bet);B.last=B.bet;
  B.hands=[{cards:[],bet:B.bet,doubled:false,done:false,res:null,split:false}];B.dealer=[];B.active=0;B.holeUp=false;B.phase='play';B.bet=0;B.seen=new Set();
  J.flyChips($('bjSpot'),$('bjSpot'),0,0,{silent:true});
  render();
  for(const who of ['p','d','p','d']){await wait(330);if(who==='p')B.hands[0].cards.push(draw());else B.dealer.push(draw());SFX.card();render();}
  await wait(450);
  const up=val(B.dealer[0]),dBJ=score(B.dealer).t===21;
  if(up>=10&&!dBJ&&!isBJ(B.hands[0])){/* dealer peeks silently */}
  if(dBJ||isBJ(B.hands[0])){B.hands[0].done=true;B.busy=false;return dealerPlay(true);}
  B.busy=false;render();
}
async function hit(){const h=B.hands[B.active];if(B.phase!=='play'||B.busy||!h)return;B.busy=true;h.cards.push(draw());SFX.card();render();await wait(300);const s=score(h.cards);if(s.t>21){h.done=true;h.res='bust';SFX.lose();J.floatText($('bjHands').children[B.active],'Bust!','bad');if(B.hands.length===1)say(pick(LINES.bust));}else if(s.t===21)h.done=true;B.busy=false;if(h.done)next();else render();}
function stand(){const h=B.hands[B.active];if(B.phase!=='play'||B.busy||!h)return;h.done=true;SFX.click();next();}
async function dbl(){const h=B.hands[B.active];if(B.phase!=='play'||B.busy||!h||h.cards.length!==2||J.P.coins<h.bet)return;B.busy=true;J.addCoins(-h.bet);J.flyChips($('bjMeAv'),$('bjHands').children[B.active],3,0);h.bet*=2;h.doubled=true;await wait(300);h.cards.push(draw());SFX.card();render();await wait(400);if(score(h.cards).t>21){h.res='bust';SFX.lose();}h.done=true;B.busy=false;next();}
async function split(){
  const h=B.hands[B.active];if(B.phase!=='play'||B.busy||!h||B.hands.length>1||h.cards.length!==2||val(h.cards[0])!==val(h.cards[1])||J.P.coins<h.bet)return;
  B.busy=true;J.addCoins(-h.bet);
  const aces=h.cards[0].r===14;
  B.hands=[{cards:[h.cards[0]],bet:h.bet,doubled:false,done:false,res:null,split:true},{cards:[h.cards[1]],bet:h.bet,doubled:false,done:false,res:null,split:true}];
  render();await wait(350);
  for(let i=0;i<2;i++){B.hands[i].cards.push(draw());SFX.card();render();await wait(330);}
  if(aces)B.hands.forEach(x=>x.done=true);
  B.hands.forEach(x=>{if(score(x.cards).t===21)x.done=true;});
  B.active=0;B.busy=false;next();
}
function next(){const i=B.hands.findIndex(h=>!h.done);if(i>=0){B.active=i;render();return;}dealerPlay(false);}
async function dealerPlay(natural){
  B.phase='dealer';B.busy=true;render();await wait(400);
  B.holeUp=true;SFX.card();render();await wait(650);
  const live=B.hands.some(h=>h.res!=='bust');
  const anyBJ=B.hands.length===1&&isBJ(B.hands[0]);
  if(live&&!natural&&!anyBJ){while(score(B.dealer).t<17){B.dealer.push(draw());SFX.card();render();await wait(650);}}
  settle();
}
function settle(){
  const d=score(B.dealer),dBJ=B.dealer.length===2&&d.t===21;
  let pay=0,net=0,wins=0,losses=0,gotBJ=false,dblWin=false;
  B.hands.forEach(h=>{
    const s=score(h.cards);let r;
    if(s.t>21)r='bust';else if(isBJ(h)&&!dBJ)r='bj';else if(dBJ&&!isBJ(h))r='lose';else if(isBJ(h)&&dBJ)r='push';else if(d.t>21||s.t>d.t)r='win';else if(s.t===d.t)r='push';else r='lose';
    h.res=r;const back=r==='bj'?h.bet*2.5:r==='win'?h.bet*2:r==='push'?h.bet:0;pay+=back;net+=back-h.bet;
    if(r==='win'||r==='bj')wins++;if(r==='lose'||r==='bust')losses++;if(r==='bj')gotBJ=true;if(r==='win'&&h.doubled)dblWin=true;
  });
  pay=Math.round(pay);
  B.phase='bet';B.busy=false;
  const handsEls=[...$('bjHands').children];
  render();
  const hEls=[...$('bjHands').children];
  if(pay>0){J.flyChips($('bjDealerAv'),hEls[0]||$('bjSpot'),Math.min(10,3+Math.ceil(pay/Math.max(1,B.last))*2),200);setTimeout(()=>{J.addCoins(pay);J.floatText($('bjCoins'),`+${num(pay)}`);renderBar();},900);}
  else if(net<0){J.flyChips(hEls[0]||$('bjSpot'),$('bjDealerAv'),4,150);}
  // banner
  let title,sub;
  if(gotBJ){title='Blackjack!';sub=`You win ${num(net)} coins (3 to 2).`;}
  if(gotBJ||(net>0&&net>=500))setTimeout(()=>{if(J.current==='bj')J.finisher({list:[{seed:J.myAvSeed+'|'+J.nick(),bot:false,name:J.nick()||''}],top:gotBJ?'BLACKJACK':'',big:net>=2000});},700);
  else if(net>0){title=d.t>21?'Dealer busts!':'You win!';sub=`+${num(net)} coins`;}
  else if(net===0&&wins+losses===0){title='Push';sub='Your bet comes back.';}
  else if(net===0){title='Even';sub='Win one, lose one.';}
  else{title=B.hands.every(h=>h.res==='bust')?'Bust':'Dealer wins';sub=`−${num(-net)} coins`;}
  showBanner(title,sub);
  if(gotBJ)say(pick(LINES.bj));else if(d.t>21&&net>0)say(pick(LINES.dbust));else if(net<0&&!B.hands.every(h=>h.res==='bust'))say(pick(LINES.dwin));else if(net===0&&wins===0)say(pick(LINES.push));
  if(net>0){SFX.win();if(gotBJ||net>=B.last*1.5)setTimeout(J.confetti,300);}else if(net<0)SFX.lose();
  // stats
  J.stat('bjh');J.addXP(4+(net>0?10:0)+(gotBJ?20:0));
  if(net>0){J.stat('bjw');J.P.stats.bjstreak=(J.P.stats.bjstreak||0)+1;J.stat('bjbest',J.P.stats.bjstreak,'max');if(J.P.stats.bjstreak>=5)J.unlock('bj_streak');}else if(net<0){J.P.stats.bjstreak=0;J.saveP();}
  if(gotBJ){J.stat('bjbj');J.unlock('bj_first');}
  if(dblWin)J.unlock('bj_double');
  if(B.last<=J.P.coins+pay-0)B.bet=0;
  setTimeout(()=>{if(B.phase==='bet'){$('bjBanner').hidden=true;}},2600);
  render();
}
function showBanner(t,s){$('bjBannerT').textContent=t;$('bjBannerS').textContent=s;const b=$('bjBanner');b.hidden=true;void b.offsetWidth;b.hidden=false;}

/* ---------- wiring ---------- */
$('bjChips').innerHTML=CHIPS.map(([v,c])=>`<button class="bchip" type="button" data-v="${v}" style="--c:${c};${c==='#ffffff'||c==='#ffc83d'?'color:#3a2700;text-shadow:none;':''}" aria-label="Add ${v.toLocaleString('en-US')}">${v>=1000?v/1000+'K':v}</button>`).join('')+`<button class="bchip" type="button" data-v="all" style="--c:#ff6b4a" aria-label="All in">ALL</button>`;
$('bjChips').onclick=e=>{const b=e.target.closest('.bchip');if(!b||b.disabled)return;addBet(b.dataset.v==='all'?'all':Number(b.dataset.v),b);};
$('bjClear').onclick=()=>{B.bet=0;SFX.click();renderStack();renderBar();};
$('bjRebet').onclick=()=>{if(B.last&&B.last<=J.P.coins){B.bet=B.last;SFX.chip(2);renderStack();renderBar();}};
$('bjDeal').onclick=()=>{$('bjBanner').hidden=true;deal();};
$('bjHit').onclick=hit;$('bjStand').onclick=stand;$('bjDouble').onclick=dbl;$('bjSplit').onclick=split;
$('bjFree').onclick=()=>{J.addCoins(500);SFX.coins();J.floatText($('bjCoins'),'+500');renderBar();};
$('bjHintBtn').onclick=()=>{const a=advice();if(!a)return;J.toast(`<span class="t-ic">💡</span><span><b>${a.label}</b><br>That’s the textbook move here.</span>`,'',2600);const map={hit:'bjHit',stand:'bjStand',double:'bjDouble',split:'bjSplit'};const el=$(map[a.k]);if(el&&J.animOn())el.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:500,iterations:2});};
J.memeGrid(document.querySelector('#bjMemePop [data-memes]'),pick=>{$('bjMemePop').hidden=true;if(pick.c)J.playCustom(pick.c);else J.playMeme(pick.k);J.floatText($('bjMeAv'),pick.label,'mint');});
$('bjMemeBtn').onclick=e=>{e.stopPropagation();$('bjMemePop').hidden=!$('bjMemePop').hidden;};
document.addEventListener('click',e=>{if(!$('bjMemePop').hidden&&!e.target.closest('#bjMemePop')&&!e.target.closest('#bjMemeBtn'))$('bjMemePop').hidden=true;});
document.addEventListener('keydown',e=>{
  if(J.current!=='bj'||J.anyModal()||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target&&e.target.tagName==='INPUT')return;
  const k=e.key.toLowerCase();
  if(B.phase==='bet'){if(k==='enter'||k===' '){e.preventDefault();if(!B.bet&&B.last)$('bjRebet').click();$('bjDeal').click();}return;}
  if(k==='h')hit();else if(k==='s')stand();else if(k==='d')dbl();else if(k==='p')split();
});
J.onProfile(()=>{if(J.current==='bj')renderBar();});
J.onSettings(()=>{if(J.current==='bj')render(true);});

function open(){J.show('bj');$('bjDealerAv').innerHTML=J.avatarSVG('JJ-21',true);$('bjMeAv').innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false);if(!B.shoe.length)buildShoe();fit();render();if(!B.greeted){B.greeted=true;setTimeout(()=>say('Welcome! Place your bet.'),500);}}
J.registerScreen('bj',{hide(){}});
J.onSettings(()=>{});
(window.JJ_SCREENS=window.JJ_SCREENS||{}).bj={leave(){if(B.phase!=='bet'){J.toast('Finish this hand first. The robot insists.','',2000);return;}J.show('home');J.renderPokerHome&&J.renderPokerHome();}};
$('bjBtn').onclick=open;
J.onSettings(()=>{if(J.current==='bj'){$('bjDealerAv').innerHTML=J.avatarSVG('JJ-21',true);$('bjMeAv').innerHTML=J.avatarSVG(J.myAvSeed+'|'+J.nick(),false);}});
})();
