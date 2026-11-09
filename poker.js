/* JJ POKER — Texas Hold'em: engine, online rooms, chat, memes */
(() => {
'use strict';
const J=window.JJ,{$,esc,money,cleanName,cleanText,S,SFX,avatarSVG,CROWN,SUITS,RED,NAMES,rl,cardOf,cstr}=J;
const PL={2:'Twos',3:'Threes',4:'Fours',5:'Fives',6:'Sixes',7:'Sevens',8:'Eights',9:'Nines',10:'Tens',11:'Jacks',12:'Queens',13:'Kings',14:'Aces'};
const MAX=4,GONE_GRACE=15000,NEXT_MS=6000;
const EMOJIS=['👍','😂','😮','😎','😡','🔥','🎉','🙏'];
const QUICK=['Nice hand!','gg','All in? 👀','Ouch.','Lucky!','You’re bluffing','I fold… emotionally','One more hand'];
const BOTS=[{name:'Mira',aggr:.6,loose:.10,bluff:.07},{name:'Bram',aggr:.75,loose:.20,bluff:.10},{name:'Sol',aggr:.3,loose:.05,bluff:.02},{name:'Dex',aggr:.35,loose:.30,bluff:.04}];
const TALK={
  win:['Thank you, thank you.','Read you like a menu.','That’s called skill.','Too easy 😎','I’ll be buying snacks with this.','Calculated.'],
  allin:['Let’s dance.','All of it. Every chip.','I have a good feeling about this.','No fear.','Fortune favors the bold!'],
  lose:['Rigged.','The deck hates me.','I was setting a trap. A long one.','Fine. FINE.','That hurt my circuits.'],
  bluff:['Yes, that was a bluff. 😏','Seven-high. Never fold to me.','You folded THAT?','Pure air. Respect the hustle.'],
  hit:['Hey!','Rude 😤','I will remember this.','Right in the fur!'],
  reply:['lol','Big talk for someone with that stack.','Focus on your cards 😏','Bold words.','Noted.','Same.','😂','We’ll see.'],
};
const CODE_RE=/^t-[a-z0-9]{4,8}$/;
const anim=()=>J.animOn();

/* ---------- Evaluation ---------- */
function newDeck(){const d=[];for(let r=2;r<=14;r++)for(let s=0;s<4;s++)d.push({r,s,id:r*4+s});return d;}
const shuffle=J.shuffle;
function straightHigh(has){for(let h=14;h>=5;h--){let ok=true;for(let k=0;k<5;k++){const r=h-k;if(!(r===1?has[14]:has[r])){ok=false;break;}}if(ok)return h;}return 0;}
function sc(cat,ks){let v=cat;for(let i=0;i<5;i++)v=v*15+(ks[i]||0);return v;}
function eval7(cards){
  const rc=new Array(15).fill(0),su=[[],[],[],[]];
  for(const c of cards){rc[c.r]++;su[c.s].push(c.r);}
  let fs=-1;for(let s=0;s<4;s++)if(su[s].length>=5)fs=s;
  if(fs>=0){const h=new Array(15).fill(false);su[fs].forEach(r=>h[r]=true);const sh=straightHigh(h);if(sh)return sc(8,[sh]);}
  const quads=[],trips=[],pairs=[],singles=[];
  for(let r=14;r>=2;r--){const n=rc[r];if(n===4)quads.push(r);else if(n===3)trips.push(r);else if(n===2)pairs.push(r);else if(n===1)singles.push(r);}
  const kick=(ex,n)=>{const ks=[];for(let r=14;r>=2&&ks.length<n;r--)if(!ex.includes(r)&&rc[r]>0)ks.push(r);return ks;};
  if(quads.length)return sc(7,[quads[0],...kick([quads[0]],1)]);
  if(trips.length&&(trips.length>1||pairs.length))return sc(6,[trips[0],Math.max(trips[1]||0,pairs[0]||0)]);
  if(fs>=0)return sc(5,su[fs].slice().sort((a,b)=>b-a).slice(0,5));
  const sh=straightHigh(rc.map(x=>x>0));if(sh)return sc(4,[sh]);
  if(trips.length)return sc(3,[trips[0],...kick([trips[0]],2)]);
  if(pairs.length>=2)return sc(2,[pairs[0],pairs[1],...kick([pairs[0],pairs[1]],1)]);
  if(pairs.length)return sc(1,[pairs[0],...kick([pairs[0]],3)]);
  return sc(0,singles.slice(0,5));
}
const cat=v=>Math.floor(v/759375);
function describe(v){
  const d=[];let x=v;for(let i=0;i<5;i++){d.unshift(x%15);x=Math.floor(x/15);}
  const [a,b]=d;
  switch(x){case 8:return a===14?'Royal flush':`Straight flush, ${NAMES[a]}-high`;case 7:return `Four ${PL[a]}`;case 6:return `Full house, ${PL[a]} full of ${PL[b]}`;case 5:return `Flush, ${NAMES[a]}-high`;case 4:return `Straight, ${NAMES[a]}-high`;case 3:return `Three ${PL[a]}`;case 2:return `Two pair, ${PL[a]} and ${PL[b]}`;case 1:return `Pair of ${PL[a]}`;default:return `${NAMES[a]}-high`;}
}
function best5(cards){const best=eval7(cards);if(cards.length<=5)return new Set(cards.map(c=>c.id));const n=cards.length;for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let d=c+1;d<n;d++)for(let e=d+1;e<n;e++){const f=[cards[a],cards[b],cards[c],cards[d],cards[e]];if(eval7(f)===best)return new Set(f.map(x=>x.id));}return new Set();}
function equity(hole,board,nOpp,sims){
  const known=new Set(hole.concat(board).map(c=>c.id));const d=newDeck().filter(c=>!known.has(c.id));
  const needB=5-board.length,need=needB+nOpp*2;let score=0;
  for(let s=0;s<sims;s++){for(let k=0;k<need;k++){const j=k+Math.floor(Math.random()*(d.length-k));const t=d[k];d[k]=d[j];d[j]=t;}
    const b=board.concat(d.slice(0,needB));const my=eval7(hole.concat(b));let win=true,ties=1,idx=needB;
    for(let o=0;o<nOpp;o++){const os=eval7([d[idx],d[idx+1]].concat(b));idx+=2;if(os>my){win=false;break;}if(os===my)ties++;}
    if(win)score+=1/ties;}
  return score/sims;
}

/* ---------- Private cards ---------- */
const b64=u8=>{let s='';for(const x of u8)s+=String.fromCharCode(x);return btoa(s);};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let myKeys=null,myPub=null;const keyCache=new Map();
async function initKeys(){try{myKeys=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},false,['deriveKey']);myPub=b64(new Uint8Array(await crypto.subtle.exportKey('raw',myKeys.publicKey)));}catch(e){myKeys=null;myPub=null;}}
function sharedKey(pub){if(!keyCache.has(pub))keyCache.set(pub,(async()=>{const k=await crypto.subtle.importKey('raw',unb64(pub),{name:'ECDH',namedCurve:'P-256'},false,[]);return crypto.subtle.deriveKey({name:'ECDH',public:k},myKeys.privateKey,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);})());return keyCache.get(pub);}
async function seal(pub,obj){const k=await sharedKey(pub);const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(obj))));return [b64(iv),b64(ct)];}
async function unseal(pub,[iv,ct]){const k=await sharedKey(pub);const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},k,unb64(ct));return JSON.parse(new TextDecoder().decode(pt));}

/* ---------- State ---------- */
let mode='home';
let G=null,CV=null,PV=null,recvAt=0,mySeat=-1;
let room=null,troom=null,myPeer=null,net='wait';
let hostPeer=null,myHole=[],holeKey='',pend=null,hostGone=false,joinCode='';
let logMax=-1,shown=new Set(),shownHand=-1,sheetOpen=false,pre=null,wasTurn=false,isTall=false;
let optMode='host',unread=0,drawerTab='chat',lastChatAt=0,lastMemeAt=0;
const nick=J.nick;

/* ---------- Engine ---------- */
function blankSeat(i){return{seat:i,empty:true,kind:'empty',name:'',av:'',chips:0,hole:[],bet:0,total:0,folded:true,allIn:false,acted:false,out:true,last:'',win:false,show:false,handText:'',peer:'',by:null,pub:null,gone:false,goneAt:0,waiting:false,def:null};}
function person(i,name,kind,extra){return Object.assign(blankSeat(i),{empty:false,kind,name,av:name,chips:G.start,out:false,folded:false},extra||{});}
const canAct=p=>!p.out&&!p.folded&&!p.allIn;
function nextSeat(i,pred){for(let k=1;k<=MAX;k++){const j=(i+k+MAX)%MAX;if(pred(G.players[j]))return j;}return -1;}
const potTotal=()=>G.players.reduce((a,p)=>a+p.total,0);
function pay(p,amt){amt=Math.max(0,Math.min(amt,p.chips));p.chips-=amt;p.bet+=amt;p.total+=amt;if(p.chips===0)p.allIn=true;return amt;}
function log(t,c){G.log.push({i:G.logN++,t,c:c||''});if(G.log.length>80)G.log.shift();}
function schedule(fn,ms){const id=G.id;setTimeout(()=>{if(G&&G.id===id)fn();},ms);}
function createGame(online,code,o){
  G={id:(G?G.id:0)+1,online,code,seq:0,hand:0,dealer:Math.floor(Math.random()*MAX),sb:o.blinds,bb:o.blinds*2,start:o.start,turnMs:30000,speed:o.speed||2,rit:o.rit!==false,b72:o.b72!==false,
    players:[0,1,2,3].map(blankSeat),board:[],deck:[],street:0,currentBet:0,minRaise:o.blinds*2,toAct:0,acting:-1,handOver:false,started:false,over:false,overText:'',result:'',resultSub:'',log:[],logN:0,turnStart:0,nextAt:0,nextTok:0,enc:{},waitingRebuy:false,tour:o.tour?{lv:0,ms:Math.max(1,o.lvlMin||5)*60000,at:0,base:o.blinds,places:[],champ:null}:null};
  G.players[0]=person(0,nick(),'local',{peer:myPeer||'',av:J.myAvSeed});
}
function addBots(n){const used=new Set(G.players.map(p=>p.name));let added=0;G.players.forEach((p,i)=>{if(!p.empty||(n!=null&&added>=n))return;const d=BOTS.find(b=>!used.has(b.name));if(!d)return;used.add(d.name);G.players[i]=person(i,d.name,'bot',{def:d,av:d.name});added++;});}
function commit(){G.seq++;save();broadcast();updateHosting();showHost();}
function scheduleNext(ms){G.nextAt=Date.now()+ms;const tok=++G.nextTok;schedule(()=>{if(G.nextTok===tok)startHand();},ms);}
/* ---------- Tournament: timed blind levels, no rebuys, finishing places ---------- */
const LEVELS=[1,1.5,2,3,4,6,8,10,15,20,30,40,60,80,100,150,200];
function lvBlinds(T,lv){const sb=Math.round(T.base*LEVELS[Math.min(lv,LEVELS.length-1)]/5)*5||T.base;return [sb,sb*2];}
function tourTick(){const T=G.tour;if(!T||!G.started)return;if(!T.at)T.at=Date.now();let up=false;while(Date.now()-T.at>=T.ms&&T.lv<LEVELS.length-1){T.lv++;T.at+=T.ms;up=true;}
  const [sb,bb]=lvBlinds(T,T.lv);if(up||G.sb!==sb){G.sb=sb;G.bb=bb;if(up)log(`⏫ Blinds up! Level ${T.lv+1}: ${money(sb)}/${money(bb)}`,'w');}}
function tourBust(list){const T=G.tour;if(!T||!list.length)return;const alive=G.players.filter(p=>!p.empty&&!p.out).length;
  list.sort((a,b)=>(a.startChips||0)-(b.startChips||0));
  list.forEach((p,k)=>{const place=alive-list.length+1+(list.length-1-k);p.place=place;T.places.push({n:p.name,av:String(p.av||p.name).slice(0,24),k:p.kind==='bot'?'b':'h',seat:p.seat,pl:place});log(`${p.name} is out in ${ord(place)} place.`,'w');});}
const ord=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
function startGame(){if(G.started)return;if($('fillBots').checked)addBots();if(G.players.filter(p=>!p.empty).length<2)return;G.started=true;log(`Game on. Everyone starts with ${money(G.start)}.`,'s');startHand();}
function startHand(){
  if(!G.started||G.over)return;
  G.nextTok++;G.nextAt=0;
  const ps=G.players,now=Date.now();
  ps.forEach((p,i)=>{if(!p.empty&&p.kind==='remote'&&p.gone&&now-p.goneAt>600000){log(`${p.name} left the table.`,'s');if(G.tour&&G.started&&!p.out){p.chips=0;}else ps[i]=blankSeat(i);}});
  if(G.tour&&G.started)tourBust(ps.filter(p=>!p.empty&&!p.out&&p.chips<=0));
  ps.forEach(p=>{if(p.empty)return;if(p.chips<=0&&!p.out&&!G.tour)log(`${p.name} is out of money.`,'s');const out=p.chips<=0;p.startChips=p.chips;Object.assign(p,{hole:[],bet:0,total:0,folded:out,allIn:false,acted:false,out,last:'',win:false,show:false,handText:'',waiting:false});});
  G.enc={};G.resultSub='';G.board2=null;G.ritOn=false;G.ritBase=null;G.rabbit=null;G.rabbitOn=false;G.bounty=null;G.revealed=false;G.byFold=false;G.players.forEach(p=>{p.eq=-1;});
  const live=ps.filter(p=>!p.out);
  if(live.length<2&&G.tour&&G.started){
    G.handOver=true;G.acting=-1;G.board=[];G.over=true;const w=live[0];
    if(w){w.place=1;G.tour.champ={n:w.name,av:String(w.av||w.name).slice(0,24),k:w.kind==='bot'?'b':'h',seat:w.seat,pl:1,c:w.chips};G.tour.places.push(G.tour.champ);log(`🏆 ${w.name} wins the tournament!`,'w');}
    G.overText=w?`${w.name} wins the tournament!`:'Tournament over.';
    return commit();
  }
  if(live.length<2){
    const canRebuy=ps.some(p=>!p.empty&&p.out&&p.kind!=='bot'&&!p.gone);
    G.handOver=true;G.acting=-1;G.board=[];
    if(live.length===1&&canRebuy){G.waitingRebuy=true;G.result=`${live[0].name} has all the money`;G.resultSub=`Get ${money(G.start)} more to keep playing.`;}
    else{G.over=true;G.overText=live.length?`${live[0].name} takes the table with ${money(live[0].chips)}.`:'Everyone is out of money.';}
    return commit();
  }
  G.waitingRebuy=false;tourTick();G.hand++;G.board=[];G.street=0;G.handOver=false;G.result='';G.acting=-1;
  G.deck=shuffle(newDeck());G.dealer=nextSeat(G.dealer,p=>!p.out);
  let sbI,bbI;
  if(live.length===2){sbI=G.dealer;bbI=nextSeat(sbI,p=>!p.out);}else{sbI=nextSeat(G.dealer,p=>!p.out);bbI=nextSeat(sbI,p=>!p.out);}
  log(`Hand ${G.hand} · ${ps[G.dealer].name} deals`,'h');
  const a1=pay(ps[sbI],G.sb);ps[sbI].last=`Small blind ${money(a1)}`;
  const a2=pay(ps[bbI],G.bb);ps[bbI].last=`Big blind ${money(a2)}`;
  log(`${ps[sbI].name} posts ${money(a1)}, ${ps[bbI].name} posts ${money(a2)}`,'s');
  G.currentBet=G.bb;G.minRaise=G.bb;
  for(let r=0;r<2;r++){let i=G.dealer;for(let k=0;k<live.length;k++){i=nextSeat(i,p=>!p.out);ps[i].hole.push(G.deck.pop());}}
  const f=nextSeat(bbI,canAct);G.toAct=f<0?0:f;
  commit();schedule(step,1500+live.length*160);
}
function needsAction(p){return canAct(p)&&(!p.acted||p.bet<G.currentBet);}
function findToAct(){const able=G.players.filter(canAct);if(!able.length)return -1;if(able.length===1&&able[0].bet>=G.currentBet)return -1;for(let k=0;k<MAX;k++){const j=(G.toAct+k)%MAX;if(needsAction(G.players[j]))return j;}return -1;}
function botDelay(){const base=[0,1500,950,500][G.speed||2]||950;return base+Math.random()*base*.8;}
function step(){
  if(G.handOver)return;
  const ps=G.players,contenders=ps.filter(p=>!p.folded&&!p.out);
  if(contenders.length===1)return winByFold(contenders[0]);
  const i=findToAct();if(i<0)return endStreet();
  G.toAct=i;G.acting=i;G.turnStart=Date.now();commit();
  if(ps[i].kind==='bot'){const hurry=!ps.some(p=>p.kind!=='bot'&&!p.empty&&canAct(p));schedule(()=>botAct(i),hurry?Math.min(450,botDelay()):botDelay());}
}
function doAction(i,type,to){
  const p=G.players[i];if(G.acting!==i||G.handOver)return false;
  const toCall=Math.min(G.currentBet-p.bet,p.chips);let msg='';
  if(type==='check'&&toCall>0)return false;
  if(type==='fold'){p.folded=true;p.last='Fold';msg=`${p.name} folds`;}
  else if(type==='check'||(type==='call'&&toCall===0)){p.last='Check';msg=`${p.name} checks`;}
  else if(type==='call'){const a=pay(p,toCall);p.last=p.allIn?`All-in ${money(p.bet)}`:`Call ${money(a)}`;msg=`${p.name} calls ${money(a)}${p.allIn?' and is all-in':''}`;}
  else if(type==='raise'){
    if(p.chips<=toCall)return doAction(i,'call');
    const maxTo=p.bet+p.chips,minTo=Math.min(G.currentBet+G.minRaise,maxTo);
    to=Math.max(minTo,Math.min(Math.round(Number(to)||0),maxTo));
    const wasBet=G.currentBet===0;pay(p,to-p.bet);const inc=to-G.currentBet;
    if(inc>=G.minRaise)G.minRaise=inc;
    if(to>G.currentBet){G.currentBet=to;G.players.forEach(q=>{if(q!==p&&canAct(q))q.acted=false;});}
    p.last=p.allIn?`All-in ${money(to)}`:(wasBet?`Bet ${money(to)}`:`Raise to ${money(to)}`);
    msg=p.allIn?`${p.name} goes all-in for ${money(to)}`:wasBet?`${p.name} bets ${money(to)}`:`${p.name} raises to ${money(to)}`;
    if(p.allIn&&p.kind==='bot'){botTalk(i,'allin',.45);if(Math.random()<.3)botMeme(i,Math.random()<.5?8:2);}
  } else return false;
  p.acted=true;G.acting=-1;log(msg);G.toAct=(i+1)%MAX;commit();schedule(step,450);return true;
}
function autoAct(i){const p=G.players[i];log(`${p.name} ran out of time.`,'s');doAction(i,G.currentBet-p.bet>0?'fold':'check');}
function endStreet(){
  const ps=G.players;
  ps.forEach(p=>{p.bet=0;p.acted=false;if(!p.folded&&!p.allIn)p.last='';});
  G.currentBet=0;G.minRaise=G.bb;G.acting=-1;
  const contenders=ps.filter(p=>!p.folded&&!p.out);
  if(G.rit&&!G.ritOn&&G.street<3&&contenders.length>=2&&ps.filter(canAct).length<=1){G.ritOn=true;G.ritBase=G.board.slice();log('All-in! Running it twice.','w');}
  if(G.street===3)return showdown();
  if(!G.revealed&&contenders.length>=2&&ps.filter(canAct).length<=1){
    G.revealed=true;contenders.forEach(p=>p.show=true);calcEq();log('All-in! Cards up.','w');
    commit();schedule(dealNext,1900);return;
  }
  dealNext();
}
function dealNext(){
  const ps=G.players;
  G.street++;G.deck.pop();
  if(G.street===1)G.board.push(G.deck.pop(),G.deck.pop(),G.deck.pop());else G.board.push(G.deck.pop());
  log(`${['','Flop','Turn','River'][G.street]}: ${G.board.map(cstr).join(' ')}`,'s');
  const f=nextSeat(G.dealer,canAct);G.toAct=f<0?0:f;
  const runout=ps.filter(canAct).length<=1&&ps.filter(p=>!p.folded&&!p.out).length>=2;
  if(runout){ps.forEach(p=>{if(!p.folded&&!p.out)p.show=true;});calcEq();}
  commit();schedule(step,runout?2100:(G.street===1?1100:900));
}
/* Chance to win for every player still in, once all cards are face up. Exact on the turn and flop, sampled before the flop. */
function calcEq(){
  const live=G.players.filter(p=>!p.folded&&!p.out&&p.hole.length===2);G.players.forEach(p=>p.eq=-1);
  if(live.length<2||G.board.length>=5)return;
  const known=new Set(G.board.concat(...live.map(p=>p.hole)).map(c=>c.id));
  const rest=newDeck().filter(c=>!known.has(c.id));const need=5-G.board.length;const share=live.map(()=>0);let n=0;
  const tally=b=>{const sc=live.map(p=>eval7(p.hole.concat(b)));const best=Math.max(...sc);const w=sc.filter(x=>x===best).length;sc.forEach((x,i)=>{if(x===best)share[i]+=1/w;});n++;};
  if(need===1)rest.forEach(c=>tally(G.board.concat([c])));
  else if(need===2){for(let a=0;a<rest.length;a++)for(let b=a+1;b<rest.length;b++)tally(G.board.concat([rest[a],rest[b]]));}
  else{const d=rest.slice();for(let k=0;k<2200;k++){for(let j=0;j<need;j++){const r=j+Math.floor(Math.random()*(d.length-j));const t=d[j];d[j]=d[r];d[r]=t;}tally(G.board.concat(d.slice(0,need)));}}
  live.forEach((p,i)=>{p.eq=Math.round(share[i]/n*100);});
}
function showMine(i){const p=G.players[i];if(!G.handOver||!p||!p.win||p.show||!p.hole.length)return;p.show=true;p.handText=G.board.length>=3?describe(eval7(p.hole.concat(G.board))):'';log(`${p.name} shows ${p.hole.map(cstr).join(' ')}${p.handText?' · '+p.handText:''}`,'s');commit();}
function orderFromDealer(list){return list.slice().sort((a,b)=>((a.seat-G.dealer-1+MAX)%MAX)-((b.seat-G.dealer-1+MAX)%MAX));}
function buildPots(ps,live){
  const levels=[...new Set(ps.filter(p=>p.total>0).map(p=>p.total))].sort((a,b)=>a-b);
  const pots=[];let prev=0;
  for(const L of levels){let amt=0;ps.forEach(p=>{amt+=Math.max(0,Math.min(p.total,L)-prev);});const elig=live.filter(p=>p.total>=L);const last=pots[pots.length-1];
    if(!elig.length){if(last)last.amt+=amt;else pots.push({amt,elig:live});}
    else if(last&&last.elig.length===elig.length&&last.elig.every(p=>elig.includes(p)))last.amt+=amt;else pots.push({amt,elig});prev=L;}
  return pots;
}
/* Splits every pot across nRuns boards; ties split evenly, odd chips go to the first winner left of the dealer. */
function distribute(pots,nRuns,scoreFn,dealer){
  const order=list=>list.slice().sort((a,b)=>((a.seat-dealer-1+MAX)%MAX)-((b.seat-dealer-1+MAX)%MAX));
  const won=new Map(),runs=[];for(let k=0;k<nRuns;k++)runs.push(new Map());
  pots.forEach(pot=>{
    if(pot.amt<=0)return;
    const base=Math.floor(pot.amt/nRuns);let extra=pot.amt-base*nRuns;
    for(let k=0;k<nRuns;k++){
      const part=base+(extra>0?1:0);if(extra>0)extra--;
      const best=Math.max(...pot.elig.map(p=>scoreFn(p,k)));
      const winners=order(pot.elig.filter(p=>scoreFn(p,k)===best));
      const share=Math.floor(part/winners.length);let rem=part-share*winners.length;
      winners.forEach(w=>{const a=share+(rem>0?1:0);if(rem>0)rem--;won.set(w,(won.get(w)||0)+a);runs[k].set(w,(runs[k].get(w)||0)+a);});
    }
  });
  return {won,runs};
}
function showdown(){
  const ps=G.players,live=ps.filter(p=>!p.folded&&!p.out);
  const boards=[G.board];
  if(G.ritOn){const b2=G.ritBase.slice();while(b2.length<5){G.deck.pop();if(b2.length===0)b2.push(G.deck.pop(),G.deck.pop(),G.deck.pop());else b2.push(G.deck.pop());}G.board2=b2;boards.push(b2);log(`Run 2: ${b2.map(cstr).join(' ')}`,'s');}
  live.forEach(p=>{p.scores=boards.map(b=>eval7(p.hole.concat(b)));p.score=p.scores[0];p.handText=describe(p.scores[0]);p.handText2=boards[1]?describe(p.scores[1]):'';p.show=true;log(`${p.name} shows ${p.hole.map(cstr).join(' ')} · ${p.handText}${p.handText2?' / '+p.handText2:''}`,'s');});
  ps.forEach(p=>p.eq=-1);
  const allPots=buildPots(ps,live);
  /* A pot only one player can claim is their own uncalled bet: hand it back, it is not a win. */
  const refunds=allPots.filter(pt=>pt.elig.length===1&&pt.amt>0);
  refunds.forEach(pt=>{const p=pt.elig[0];p.chips+=pt.amt;log(`${money(pt.amt)} uncalled, returned to ${p.name}`,'s');});
  const {won,runs}=distribute(allPots.filter(pt=>pt.elig.length>1),boards.length,(p,k)=>p.scores[k],G.dealer);
  won.forEach((amt,p)=>{p.chips+=amt;p.win=true;p.last=`Wins ${money(amt)}`;log(`${p.name} wins ${money(amt)}`,'w');botCheer(p,amt);});
  live.forEach(p=>{if(!p.win&&p.kind==='bot'&&p.total>=G.bb*6)botTalk(p.seat,'lose',.4);});
  {const id=G.id,wins=[...won.keys()];live.forEach(p=>{if(p.win||p.kind!=='bot'||!wins.length)return;const w=wins[0];const big=p.total>=G.bb*10;if(Math.random()<(big?.35:.08)){const k=['tomato','egg','chicken','bomb'][Math.floor(Math.random()*4)];setTimeout(()=>{if(G&&G.id===id)sendThrow(p.seat,w.seat,k);},2900+Math.random()*900);}});
   wins.forEach(w=>{if(w.kind==='bot'&&Math.random()<.12){const loser=live.find(p=>!p.win);if(loser)setTimeout(()=>{if(G&&G.id===id)sendThrow(w.seat,loser.seat,Math.random()<.5?'kiss':'cash');},3200);}});}
  const low=h=>h.charAt(0).toLowerCase()+h.slice(1);
  const title=[...won].map(([p,a])=>`${p.name} wins ${money(a)}`).join(' · ');
  let sub;
  if(boards.length>1)sub=runs.map((r,k)=>`Run ${k+1}: ${[...r.keys()].map(p=>p.name).join(' & ')} (${low(k?[...r.keys()][0].handText2:[...r.keys()][0].handText)})`).join(' · ');
  else sub='with '+[...new Set([...won.keys()].map(p=>p.handText))].map(low).join(' · ');
  const b=applyBounty([...won.keys()]);
  endHand(title,b?`${sub} · ${b}`:sub);
}
function is72(h){return h&&h.length===2&&((h[0].r===7&&h[1].r===2)||(h[0].r===2&&h[1].r===7));}
function applyBounty(winners){
  if(!G.b72)return '';const w=winners.find(p=>is72(p.hole));if(!w)return '';
  const amt=G.bb*5;const from=[];let total=0;
  G.players.forEach(q=>{if(q===w||q.empty||q.chips<=0)return;const a=Math.min(q.chips,amt);q.chips-=a;total+=a;from.push(q.seat);});
  if(!total)return '';
  w.chips+=total;w.show=true;G.bounty={w:w.seat,amt,from,total};
  log(`7-2 bounty! ${w.name} collects ${money(total)}`,'w');
  hostMeme(w.seat,2);
  return `7-2 bounty: everyone pays ${w.name} ${money(amt)}`;
}
function winByFold(p){
  G.byFold=true;G.players.forEach(q=>q.eq=-1);
  if(p.kind==='bot'&&Math.random()<.25){const id=G.id,i=p.seat;setTimeout(()=>{if(G&&G.id===id&&G.handOver){showMine(i);if(G.board.length>=3&&cat(eval7(p.hole.concat(G.board)))<1)botTalk(i,'bluff',1);}},1300);}
  const pot=potTotal();p.chips+=pot;p.win=true;p.last=`Wins ${money(pot)}`;log(`${p.name} wins ${money(pot)} uncontested`,'w');botCheer(p,pot);
  if(G.board.length<5){const d=G.deck.slice(),rab=[];while(G.board.length+rab.length<5){d.pop();if(G.board.length+rab.length===0)rab.push(d.pop(),d.pop(),d.pop());else rab.push(d.pop());}G.rabbit=rab;}
  const b=applyBounty([p]);
  endHand(`${p.name} wins ${money(pot)}`,b?`Everyone else folded · ${b}`:'Everyone else folded');
}
function revealRabbit(){if(!G||!G.handOver||!G.rabbit||G.rabbitOn||G.over)return;G.rabbitOn=true;log(`🐇 Rabbit hunt: ${G.rabbit.map(cstr).join(' ')}`,'s');if(!G.waitingRebuy&&G.nextAt&&G.nextAt-Date.now()<4000)scheduleNext(4000);commit();}
function endHand(text,sub){G.players.forEach(p=>p.bet=0);G.handOver=true;G.acting=-1;G.result=text;G.resultSub=sub||'';scheduleNext(NEXT_MS);commit();}
function botCheer(p,amt){if(p.kind!=='bot'||amt<G.bb*6)return;if(Math.random()<.5){const e=[1,3,5,6][Math.floor(Math.random()*4)];setTimeout(()=>{if(G&&mode!=='home')sendReact(p.seat,e);},900);}botTalk(p.seat,'win',.45);if(amt>=G.bb*20&&Math.random()<.4)botMeme(p.seat,Math.random()<.5?5:10);}
function botTalk(seat,kind,chance){if(!G||Math.random()>(chance||.3))return;const lines=TALK[kind];const t=lines[Math.floor(Math.random()*lines.length)];const id=G.id;setTimeout(()=>{if(G&&G.id===id&&mode!=='home'&&mode!=='client')hostChat(seat,t);},700+Math.random()*1500);}
function botMeme(seat,k){const id=G.id;setTimeout(()=>{if(G&&G.id===id&&mode!=='home'&&mode!=='client')hostMeme(seat,k);},500+Math.random()*800);}
function doRebuy(i){
  if(G.tour)return;
  const p=G.players[i];if(!p||p.empty||p.kind==='bot'||p.chips>0||!(p.out||G.handOver))return;
  p.chips=G.start;p.waiting=true;log(`${p.name} gets ${money(G.start)} more.`,'s');
  if(G.waitingRebuy){G.waitingRebuy=false;G.result='';G.resultSub='';scheduleNext(1500);}
  commit();
}
function resetGame(){G.players.forEach(p=>{if(!p.empty){p.chips=G.start;p.out=false;p.place=0;}});if(G.tour){G.tour.lv=0;G.tour.at=Date.now();G.tour.places=[];G.tour.champ=null;const [sb,bb]=lvBlinds(G.tour,0);G.sb=sb;G.bb=bb;}G.over=false;G.overText='';G.waitingRebuy=false;G.hand=0;log(`New game. Everyone is back to ${money(G.start)}.`,'s');startHand();}

/* ---------- Bots ---------- */
function botAct(i){
  const ps=G.players,p=ps[i],d=p.def;if(G.acting!==i)return;
  const BB=G.bb,opp=ps.filter(q=>q!==p&&!q.folded&&!q.out).length;
  const eq=equity(p.hole,G.board,opp,J.perf?(G.street===0?110:150):(G.street===0?200:280));
  const toCall=Math.min(G.currentBet-p.bet,p.chips),pot=potTotal();
  const odds=toCall>0?toCall/(pot+toCall):0,rel=eq*(opp+1),adj=rel*(1+d.loose)+(Math.random()-.5)*.3,r=Math.random();
  const canRaise=p.chips>toCall&&ps.some(q=>q!==p&&canAct(q));
  const raiseTo=frac=>G.currentBet+Math.max(G.minRaise,Math.round(((pot+toCall)*frac)/(BB/2))*(BB/2));
  const bigShove=toCall>p.chips*0.45;
  if(G.street===0){
    const need=0.95-d.loose+Math.min(0.9,Math.log2(1+toCall/BB)*0.33);
    if(toCall===0){if(canRaise&&((adj>1.6&&r<d.aggr+.3)||r<d.bluff))return doAction(i,'raise',raiseTo(.8+Math.random()*.6));return doAction(i,'check');}
    if(adj<need&&r>d.bluff)return doAction(i,'fold');
    if(canRaise&&adj>need+0.8&&r<d.aggr&&!bigShove)return doAction(i,'raise',raiseTo(.9+Math.random()*.6));
    return doAction(i,'call');
  }
  if(toCall===0){if(canRaise&&((adj>1.4&&r<d.aggr+.2)||r<d.bluff))return doAction(i,'raise',raiseTo(.45+Math.random()*.4));return doAction(i,'check');}
  if(eq*(1+d.loose*.5)<odds*(bigShove?1.25:1)&&r>d.bluff*.6)return doAction(i,'fold');
  if(canRaise&&adj>1.9&&r<d.aggr*.8)return doAction(i,'raise',raiseTo(.6+Math.random()*.5));
  return doAction(i,'call');
}

/* ---------- View ---------- */
function publicView(){
  const ap=G.acting>=0?G.players[G.acting]:null;
  return{v:5,code:G.code||'',seq:G.seq,hand:G.hand,dealer:G.dealer,acting:G.handOver?-1:G.acting,cb:G.currentBet,mr:G.minRaise,sb:G.sb,bb:G.bb,s0:G.start,tm:G.turnMs,street:G.street,
    ho:G.handOver?1:0,res:G.result,rs:G.resultSub||'',st:G.started?1:0,over:G.over?G.overText:'',wr:G.waitingRebuy?1:0,
    nx:G.handOver&&!G.over&&G.nextAt?Math.max(0,G.nextAt-Date.now()):0,
    nxa:(!G.handOver&&G.started&&G.acting<0)?findToAct():-1,rb:G.rabbitOn&&G.rabbit?G.rabbit.map(c=>c.id):0,rbOk:G.handOver&&!G.over&&G.rabbit&&!G.rabbitOn?1:0,b2:G.board2?G.board2.map(c=>c.id):0,bty:G.bounty||0,rit:G.ritOn?1:0,bf:G.byFold?1:0,tr:G.tour?{lv:G.tour.lv+1,nx:G.started&&G.tour.at?Math.max(0,G.tour.ms-(Date.now()-G.tour.at)):G.tour.ms,nb:lvBlinds(G.tour,Math.min(G.tour.lv+1,LEVELS.length-1))[1],pl:G.tour.places.map(x=>({n:x.n,av:x.av,k:x.k,s:x.seat,pl:x.pl}))}:0,
    tl:(ap&&ap.kind!=='bot'&&!G.handOver)?Math.max(0,(G.turnMs-(Date.now()-G.turnStart))/1000):-1,
    hp:myPub,board:G.board.map(c=>c.id),
    p:G.players.map(p=>p.empty?{k:'e'}:{n:p.name,av:String(p.av||p.name).slice(0,24),k:p.kind==='bot'?'b':'h',pe:p.peer||'',c:p.chips,b:p.bet,t:p.total,f:+p.folded,a:+p.allIn,o:+p.out,l:p.last,w:+p.win,hc:p.hole.length,q:(!G.handOver&&p.eq>=0)?p.eq:-1,sh:p.show?p.hole.map(c=>c.id):0,ht:p.show?p.handText:'',g:+!!p.gone,wt:+!!p.waiting,pl:p.place||0}),
    log:G.log.slice(-10)};
}
function showHost(){CV=publicView();recvAt=Date.now();mySeat=0;renderAll();}

/* ---------- Networking: host ---------- */
let bcBusy=false,bcAgain=false,lastHosting='';
async function encFor(){const out={};for(const p of G.players){if(p.empty||p.kind!=='remote'||!p.peer||!p.hole.length)continue;const key=`${G.hand}|${p.peer}|${p.pub||''}`;if(!G.enc[key]){let e=null;if(p.pub&&myKeys){try{e={x:await seal(p.pub,{h:G.hand,c:p.hole.map(c=>c.id)})};}catch(err){e=null;}}G.enc[key]=e||{h:G.hand,c:p.hole.map(c=>c.id)};}out[p.peer]=G.enc[key];}return out;}
async function broadcast(){
  if(!G||!G.online||!troom||mode!=='host')return;if(bcBusy){bcAgain=true;return;}bcBusy=true;
  try{do{bcAgain=false;const V=publicView();V.enc=await encFor();let s=JSON.stringify(V);while(new TextEncoder().encode(s).length>3900&&V.log.length){V.log.shift();s=JSON.stringify(V);}await troom.emit('state',V).catch(()=>{});}while(bcAgain);}finally{bcBusy=false;}
}
function updateHosting(){if(!room)return;let h=null;if(mode==='host'&&G&&!G.over){h={code:G.code,host:G.players[0].name,av:String(J.myAvSeed).slice(0,24),n:G.players.filter(p=>!p.empty&&p.kind!=='bot').length,open:G.players.filter(p=>p.empty).length,live:G.started?1:0,bb:G.bb};}const s=JSON.stringify(h);if(s===lastHosting)return;lastHosting=s;room.presence({hosting:h}).catch(()=>{});}
function onSit(msg){
  if(mode!=='host'||!msg||msg.sameTab)return;
  const d=msg.data&&typeof msg.data==='object'?msg.data:{};const name=cleanName(d.nm)||'Player',av=String(d.av||name).slice(0,24);
  const pub=typeof d.pub==='string'&&d.pub.length<200?d.pub:null;const ps=G.players;
  let i=ps.findIndex(p=>p.kind==='remote'&&p.peer===msg.peer);
  if(i<0)i=ps.findIndex(p=>p.kind==='remote'&&p.gone&&(msg.by?p.by===msg.by:p.name===name));
  if(i>=0){const p=ps[i];if(p.gone)log(`${name} is back.`,'s');if(p.peer!==msg.peer||p.pub!==pub)Object.keys(G.enc).forEach(k=>{if(k.includes('|'+msg.peer+'|'))delete G.enc[k];});Object.assign(p,{peer:msg.peer,pub,gone:false,name,av});return commit();}
  const e=ps.findIndex(p=>p.empty);if(e<0||(G.tour&&G.started)){broadcast();return;}
  const mid=G.started&&!G.handOver;
  ps[e]=person(e,name,'remote',{peer:msg.peer,by:msg.by||null,pub,av,out:mid,folded:mid,waiting:mid});
  log(`${name} joined the table.`,'s');commit();
}
function onAct(msg){if(mode!=='host'||!msg||!msg.data)return;const d=msg.data;const i=G.players.findIndex(p=>p.kind==='remote'&&p.peer===msg.peer);if(d.type==='rabbit'){if(i>=0&&d.hand===G.hand)revealRabbit();return;}if(d.type==='show'){if(i>=0&&d.hand===G.hand)showMine(i);return;}if(i<0||i!==G.acting||d.seq!==G.seq||d.hand!==G.hand)return;if(!['fold','check','call','raise'].includes(d.type))return;doAction(i,d.type,d.to);}
function onRebuy(msg){if(mode!=='host'||!msg)return;const i=G.players.findIndex(p=>p.kind==='remote'&&p.peer===msg.peer);if(i>=0)doRebuy(i);}
function onTablePeersHost(ch){for(const p of ch.peers)if(p.sameTab)myPeer=p.peer;if(myPeer)G.players[0].peer=myPeer;let changed=false;for(const lp of ch.left)G.players.forEach(p=>{if(p.kind==='remote'&&p.peer===lp.peer&&!p.gone){p.gone=true;p.goneAt=Date.now();log(`${p.name} disconnected.`,'s');changed=true;}});if(changed)commit();else if(ch.joined.length)broadcast();}
function wireSocial(){troom.on('react',onReactMsg);troom.on('chat',onChatMsg);troom.on('sfx',onSfxMsg);}
async function hostTable(resume,o){
  if(!room)return;
  const code=resume?resume.G.code:'t-'+(Math.random().toString(36).slice(2)+'0000').slice(0,4);
  try{troom=await room.join(code);}catch(e){homeMsg('Could not open a room right now. Try again in a moment.');return;}
  mode='host';
  if(resume)restore(resume);else createGame(true,code,o);
  troom.on('sit',onSit);troom.on('act',onAct);troom.on('rebuy',onRebuy);troom.onPeers(onTablePeersHost);wireSocial();
  troom.presence({nm:G.players[0].name,pub:myPub,host:1}).catch(()=>{});
  showGame();J.unlock('host');if(resume)resumeFlow();else commit();
}

/* ---------- Networking: client ---------- */
async function joinTable(code,peerHint){
  code=String(code||'').trim().toLowerCase();
  if(!CODE_RE.test(code)){homeMsg('Room codes look like t-4k2m.');return;}
  if(!room){homeMsg('Rooms are offline right now.');return;}
  try{troom=await room.join(code);}catch(e){homeMsg('Could not reach that room. Check the code and try again.');return;}
  mode='client';joinCode=code;hostPeer=peerHint||null;CV=null;PV=null;myHole=[];holeKey='';pend=null;hostGone=false;mySeat=-1;
  troom.on('state',onState);wireSocial();
  troom.onPeers(ch=>{for(const p of ch.peers)if(p.sameTab)myPeer=p.peer;if(hostPeer&&ch.left.some(p=>p.peer===hostPeer)){hostGone=true;hostPeer=null;renderAll();}});
  troom.presence({nm:nick(),pub:myPub}).catch(()=>{});
  J.store.set('jj-pkjoin',JSON.stringify({code,at:Date.now()}));
  showGame();sendSit();renderAll();
}
function savedJoin(){try{const s=JSON.parse(J.store.get('jj-pkjoin')||'null');if(s&&CODE_RE.test(s.code)&&Date.now()-s.at<3*3600e3)return s;}catch(e){}return null;}
/* Phone locked or app switched: when we come back, say hello again (the host gives our seat back),
   and if the connection itself died, join the room again from scratch. */
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){hiddenAt=Date.now();return;}
  if(mode!=='client'||!joinCode)return;const away=Date.now()-(hiddenAt||Date.now());
  if(hostGone||(away>8000&&Date.now()-recvAt>12000)){rejoin();return;}
  sendSit();
});
let rejoining=false;
async function rejoin(){if(rejoining||mode!=='client')return;rejoining=true;const c=joinCode;const t=troom;troom=null;if(t)t.leave().catch(()=>{});try{await joinTable(c,null);}finally{rejoining=false;}}
setInterval(()=>{if(mode==='client'&&document.visibilityState==='visible'&&joinCode&&(hostGone||Date.now()-recvAt>20000))rejoin();},10000);
function sendSit(){if(mode==='client'&&troom)troom.emit('sit',{nm:nick(),pub:myPub,av:J.myAvSeed}).catch(()=>{});}
async function onState(msg){
  if(mode!=='client'||!msg||!msg.data)return;const V=msg.data;
  if(!V||!Array.isArray(V.p)||V.p.length!==MAX||V.code!==joinCode)return;
  if(hostPeer&&msg.peer!==hostPeer)return;if(!hostPeer)hostPeer=msg.peer;
  if(V.closed){J.store.del('jj-pkjoin');CV=Object.assign({},CV||V,{closed:1});renderAll();return;}
  if(CV&&!hostGone&&V.seq<CV.seq)return;
  hostGone=false;CV=V;recvAt=Date.now();
  mySeat=V.p.findIndex(p=>p.k!=='e'&&p.pe&&p.pe===myPeer);
  await decryptMine(V);
  if(pend){if(V.acting!==mySeat||V.ho)pend=null;else if(pend.seq!==V.seq)pushAct();}
  if(CV===V)renderAll();
}
async function decryptMine(V){const e=V.enc&&myPeer?V.enc[myPeer]:null;if(!e){myHole=[];holeKey='';return;}const k=V.hand+'|'+JSON.stringify(e);if(k===holeKey)return;try{const o=e.x?(myKeys&&V.hp?await unseal(V.hp,e.x):null):e;if(o&&o.h===V.hand&&Array.isArray(o.c)){myHole=o.c.map(Number).filter(n=>n>=8&&n<=59).map(cardOf);holeKey=k;}}catch(err){myHole=[];}}
function sendAct(type,to){pend={type,to,seq:-1,at:0};pushAct();renderControls();}
function pushAct(){if(!pend||!CV||!troom)return;if(CV.acting!==mySeat||CV.ho){pend=null;return;}pend.seq=CV.seq;pend.at=Date.now();troom.emit('act',{seq:CV.seq,hand:CV.hand,type:pend.type,to:pend.to}).catch(()=>{});}

/* ---------- Social: reactions, chat, memes ---------- */
const online=()=>troom&&(mode==='host'||mode==='client');
function seatOfPeer(peer){return CV?CV.p.findIndex(p=>p.k!=='e'&&p.pe===peer):-1;}
function seatOverride(msg){if(mode==='client'&&msg.peer===hostPeer&&msg.data&&Number.isInteger(msg.data.s)&&msg.data.s>=0&&msg.data.s<MAX)return msg.data.s;return -1;}
const whoEl=seat=>seatEls[seat]&&seatEls[seat].querySelector('.who');
/* ---------- Throwables: tap a player and lob something at them ---------- */
const THROWS=[{k:'tomato',ic:'🍅',n:'Tomato'},{k:'egg',ic:'🥚',n:'Egg'},{k:'beer',ic:'🍺',n:'Cheers'},{k:'kiss',ic:'💋',n:'Kiss'},{k:'rose',ic:'🌹',n:'Rose'},{k:'bomb',ic:'💣',n:'Bomb'},{k:'cash',ic:'💸',n:'Make it rain'},{k:'chicken',ic:'🐔',n:'Chicken'}];
const THROW_IDX=Object.fromEntries(THROWS.map((t,i)=>[t.k,i]));
let lastThrow=0;const recvThrow={};let throwTarget=-1;
function sendThrow(from,to,k){if(!(k in THROW_IDX)||from===to||from<0||to<0)return;showThrow(from,to,k);if(online())troom.emit('react',mode==='host'?{th:k,to,s:from}:{th:k,to}).catch(()=>{});
  if(mode!=='client'&&G){const tp=G.players[to];if(tp&&tp.kind==='bot'&&!['beer','kiss','rose','cash'].includes(k)&&Math.random()<.4)botTalk(to,'hit',1);
    else if(tp&&tp.kind==='bot'&&Math.random()<.18){const id=G.id;setTimeout(()=>{if(G&&G.id===id)sendThrow(to,from,['tomato','egg','chicken'][Math.floor(Math.random()*3)]);},1500);}}}
function showThrow(from,to,k){
  const a=whoEl(from),b=whoEl(to);if(!a||!b||!a.offsetParent||!b.offsetParent)return;
  const now=Date.now();if(recvThrow[from]&&now-recvThrow[from]<350)return;recvThrow[from]=now;
  const t=THROWS[THROW_IDX[k]];const [x0,y0]=J.centerPx(a),[x1,y1]=J.centerPx(b);
  const impact=()=>throwImpact(k,b,x1,y1);
  if(!J.animOn()){impact();return;}
  const L=document.querySelector('.fx-layer')||document.body;const e=document.createElement('span');e.className='thrown';e.textContent=t.ic;L.appendChild(e);
  const mx=(x0+x1)/2,my=Math.min(y0,y1)-90-Math.abs(x1-x0)*.12,spin=k==='bomb'||k==='egg'||k==='tomato'?540:200;
  SFX.whoosh();
  e.animate([{transform:`translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.6) rotate(0)`},{transform:`translate(${mx}px,${my}px) translate(-50%,-50%) scale(1.25) rotate(${spin/2}deg)`,offset:.5},{transform:`translate(${x1}px,${y1}px) translate(-50%,-50%) scale(1) rotate(${spin}deg)`}],{duration:640,easing:'cubic-bezier(.3,.1,.6,1)',fill:'forwards'}).onfinish=()=>{e.remove();impact();};
}
function throwImpact(k,who,x,y){
  const seat=who.closest('.seat');const B=J.burst;
  const stain=(cls)=>{const s2=document.createElement('span');s2.className='stain '+cls;who.appendChild(s2);setTimeout(()=>s2.classList.add('fade'),1600);setTimeout(()=>s2.remove(),2300);};
  if(seat){seat.classList.remove('hit');void seat.offsetWidth;seat.classList.add('hit');setTimeout(()=>seat.classList.remove('hit'),500);}
  switch(k){
    case 'tomato':SFX.splat();stain('tomato');B(x,y,['🍅','💦'],6,{dist:60});J.floatText(who,'SPLAT!','bad');break;
    case 'egg':SFX.splat();stain('egg');B(x,y,['🥚','🍳'],4,{dist:50});J.floatText(who,'Eggs-cuse me?!','');break;
    case 'beer':SFX.clink();B(x,y-10,['🫧','🍺','🫧'],9,{angle:-Math.PI/2,cone:1.6,dist:80});J.floatText(who,'Cheers! 🍻','mint');break;
    case 'kiss':SFX.kiss();B(x,y,['❤️','💕','💋'],10,{angle:-Math.PI/2,cone:2,dist:90});break;
    case 'rose':SFX.chime();B(x,y,['🌸','🌹','🌸'],12,{dist:80});J.floatText(who,'For you 🌹','mint');break;
    case 'bomb':SFX.boom();B(x,y,['💥','🔥','💨'],12,{dist:110,size:30});if(seat){seat.classList.add('boom');setTimeout(()=>seat.classList.remove('boom'),700);}stain('soot');J.floatText(who,'BOOM!','bad');break;
    case 'cash':SFX.cash();B(x,y-60,['💵','💸','💵'],14,{angle:Math.PI/2,cone:2.2,dist:110,fall:40,up:0});J.floatText(who,'Make it rain!','gold');break;
    case 'chicken':SFX.bawk();B(x,y-20,['🪶','🪶','🐔'],9,{dist:80});J.floatText(who,'BAWK BAWK!','');break;
  }
}
function openThrow(seat){
  const pop=$('throwPop'),who=whoEl(seat);if(!pop||!who)return;throwTarget=seat;
  const name=CV&&CV.p[seat]?CV.p[seat].n:'them';$('throwTo').textContent=name;
  pop.hidden=false;const r=who.getBoundingClientRect(),pr=pop.getBoundingClientRect();
  let x=r.left+r.width/2-pr.width/2,y=r.bottom+10;if(y+pr.height>innerHeight-8)y=r.top-pr.height-10;
  x=Math.max(8,Math.min(innerWidth-pr.width-8,x));y=Math.max(8,y);pop.style.left=x+'px';pop.style.top=y+'px';
}
function closeThrow(){$('throwPop').hidden=true;throwTarget=-1;}
function sendReact(seat,e){showReact(seat,e);if(online())troom.emit('react',mode==='host'?{e,s:seat}:{e}).catch(()=>{});}
function onReactMsg(msg){if(!msg||msg.sameTab||!msg.data)return;
  if(typeof msg.data.th==='string'){const k=msg.data.th,to=Number(msg.data.to);if(!(k in THROW_IDX)||!(to>=0&&to<MAX))return;let from=seatOverride(msg);if(from<0)from=seatOfPeer(msg.peer);if(from>=0&&from!==to){showThrow(from,to,k);
    if(mode==='host'&&G){const tp=G.players[to];if(tp&&tp.kind==='bot'&&!['beer','kiss','rose','cash'].includes(k)&&Math.random()<.4)botTalk(to,'hit',1);}}return;}const e=Number(msg.data.e);if(!(e>=0&&e<EMOJIS.length))return;let seat=seatOverride(msg);if(seat<0)seat=seatOfPeer(msg.peer);if(seat>=0)showReact(seat,e);}
function showReact(seat,e){SFX.pop();J.floatEmoji(whoEl(seat),EMOJIS[e]);}
function seatName(seat){return CV&&seat>=0&&CV.p[seat]&&CV.p[seat].k!=='e'?CV.p[seat].n:'Someone';}
function seatAv(seat){const p=CV&&seat>=0?CV.p[seat]:null;if(!p||p.k==='e')return['x',false];return p.k==='b'?[p.n,true]:[(p.av||'')+'|'+p.n,false];}
function sendChat(text){
  text=cleanText(text);if(!text)return;if(Date.now()-lastChatAt<700)return;lastChatAt=Date.now();
  showChat(mySeat,text,true);J.unlock('chatty');
  if(online())troom.emit('chat',{t:text}).catch(()=>{});
  if(mode!=='client'&&G)G.players.forEach(p=>{if(p.kind==='bot'&&Math.random()<.22)botTalk(p.seat,'reply',1);});
}
function hostChat(seat,text){showChat(seat,text,false);if(mode==='host'&&troom)troom.emit('chat',{t:text,s:seat}).catch(()=>{});}
function onChatMsg(msg){
  if(!msg||msg.sameTab||!msg.data)return;const t=cleanText(msg.data.t);if(!t)return;
  let seat=seatOverride(msg);if(seat<0)seat=seatOfPeer(msg.peer);
  showChat(seat,t,false);
  if(mode==='host'&&G&&seat>=0&&G.players[seat]&&G.players[seat].kind==='remote')G.players.forEach(p=>{if(p.kind==='bot'&&Math.random()<.18)botTalk(p.seat,'reply',1);});
}
function addLine(seat,html,cls,mine){
  const ul=$('chatlog');const none=ul.querySelector('.none');if(none)none.remove();
  const li=document.createElement('li');
  if(cls==='sys'){li.className='sys';const s=document.createElement('span');s.textContent=html;li.appendChild(s);}
  else{if(mine)li.className='mine';const [seed,bot]=seatAv(seat);const av=document.createElement('span');av.className='av';av.innerHTML=avatarSVG(seed,bot);const d=document.createElement('div');const b=document.createElement('b');b.textContent=seat>=0?seatName(seat):'Spectator';const p=document.createElement('p');p.textContent=html;d.append(b,p);li.append(av,d);}
  ul.appendChild(li);while(ul.children.length>100)ul.firstChild.remove();
  const body=$('tabChat');body.scrollTop=body.scrollHeight;
  const dockVisible=(matchMedia('(min-width:1180px)').matches&&!S.dockOff)||$('dock').classList.contains('open');
  if(!dockVisible||drawerTab!=='chat'){unread++;$('chatDot').hidden=false;$('chatDot').textContent=unread>9?'9+':unread;if(cls!=='sys'&&!mine&&!dockVisible)chatNotify(seat,html);}
}
/* Phone-style chat notification in the top-left corner while the chat panel is closed. */
function chatNotify(seat,text){
  const box=$('chatNotifs');if(!box)return;
  const [seed,bot]=seatAv(seat);const name=seat>=0?seatName(seat):'Spectator';
  let n=box.querySelector(`.cn[data-seat="${seat}"]`);
  if(n){const t=n.querySelector('.cn-t');t.textContent=text;const c=n.querySelector('.cn-n');const k=Number(n.dataset.k||1)+1;n.dataset.k=k;c.textContent=k+' new';c.hidden=false;n.classList.remove('bump');void n.offsetWidth;n.classList.add('bump');box.prepend(n);}
  else{
    n=document.createElement('button');n.type='button';n.className='cn';n.dataset.seat=seat;n.dataset.k=1;
    n.innerHTML=`<span class="cn-app"><i>💬</i>JJ Chat<em>now</em></span><span class="cn-row"><span class="av">${avatarSVG(seed,bot)}</span><span class="cn-body"><b></b><span class="cn-t"></span></span><span class="cn-n" hidden></span></span>`;
    n.querySelector('b').textContent=name;n.querySelector('.cn-t').textContent=text;
    box.prepend(n);
    while(box.children.length>3)box.lastChild.remove();
  }
  clearTimeout(n._t);n._t=setTimeout(()=>dismissNotif(n),J.perf?3800:5200);
}
function dismissNotif(n){if(!n.isConnected)return;n.classList.add('out');setTimeout(()=>n.remove(),320);}
/* flick a notification up or sideways to dismiss it */
{let ns=null;const box=$('chatNotifs');
 box.addEventListener('pointerdown',e=>{const n=e.target.closest('.cn');if(!n)return;ns={n,x:e.clientX,y:e.clientY,id:e.pointerId,moved:false};});
 box.addEventListener('pointermove',e=>{if(!ns||e.pointerId!==ns.id)return;const dx=e.clientX-ns.x,dy=Math.min(0,e.clientY-ns.y);if(!ns.moved&&Math.hypot(dx,dy)<8)return;ns.moved=true;ns.n.classList.add('drag');ns.n.style.transform=`translate(${dx}px,${dy}px)`;ns.n.style.opacity=String(Math.max(0,1-Math.hypot(dx,dy)/160));});
 const up=e=>{if(!ns||e.pointerId!==ns.id)return;const {n,moved}=ns,dx=e.clientX-ns.x,dy=e.clientY-ns.y;ns=null;if(!moved)return;n.classList.remove('drag');
   if(Math.abs(dx)>70||dy<-30){n.style.transition='transform .2s,opacity .2s';n.style.transform=`translate(${dx*2}px,${Math.min(0,dy)*2}px)`;n.style.opacity='0';setTimeout(()=>n.remove(),200);}else{n.style.transform='';n.style.opacity='';}
   n._swiped=true;setTimeout(()=>{n._swiped=false;},50);};
 box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);}
$('chatNotifs').addEventListener('click',e=>{if(e.target.closest('.cn')&&e.target.closest('.cn')._swiped)return;const n=e.target.closest('.cn');if(!n)return;$('chatNotifs').innerHTML='';if(matchMedia('(min-width:1180px)').matches)setDockOff(false);else openDock();setTab('chat');});
function sayBubble(seat,text,meme){
  const who=whoEl(seat);if(!who)return;const [x,y]=centerOf(who);tableEl.querySelectorAll(`.say[data-seat="${seat}"]`).forEach(o=>o.remove());const s=document.createElement('div');s.className='say'+(meme?' meme':'');s.dataset.seat=seat;s.textContent=text;
  let top=y-who.offsetHeight/2-10;const se=who.closest('.seat');
  if(se&&se.classList.contains('pos0')){s.classList.add('side','l');const lx=x-who.offsetWidth/2-12;s.style.maxWidth=Math.max(110,Math.min(220,lx-6))+'px';s.style.left=lx+'px';s.style.top=y+'px';tableEl.appendChild(s);setTimeout(()=>s.remove(),meme?2600:4500);return;}
  if(se&&!se.classList.contains('pos2')){const r=se.getBoundingClientRect(),t=tableEl.getBoundingClientRect();top=Math.min(top,r.top-t.top-8);}
  s.style.left=x+'px';s.style.top=top+'px';tableEl.appendChild(s);
  const hw=s.offsetWidth/2,tw=tableEl.clientWidth;if(hw*2<tw){const cx=Math.max(hw+4,Math.min(tw-hw-4,x));if(cx!==x){s.style.left=cx+'px';s.style.setProperty('--tail',(x-cx)+'px');}}setTimeout(()=>s.remove(),meme?2600:4500);
}
function showChat(seat,text,mine){addLine(seat,text,'',mine);if(seat>=0){sayBubble(seat,text,false);SFX.pop();}}
function memePick(d){
  if(d&&typeof d.c==='string'){const it=J.SB.list.find(x=>x.id===d.c);return it?{c:it.id,label:`${it.ic} ${it.name}`}:null;}
  const k=Number(d&&d.k);if(k>=0&&k<J.MEMES.length)return{k,label:`${J.MEMES[k].ic} ${J.MEMES[k].name}`};return null;
}
function sendMeme(pick){
  if(Date.now()-lastMemeAt<1500){J.toast('Easy, DJ. One meme every couple of seconds.','',1800);return;}
  lastMemeAt=Date.now();J.unlock('chatty');
  showMeme(mySeat,pick);
  const payload=pick.c?{c:pick.c}:{k:pick.k};if(mode==='host')payload.s=mySeat;
  if(online())troom.emit('sfx',payload).catch(()=>{});
}
function hostMeme(seat,k){const pick=memePick({k});if(!pick)return;showMeme(seat,pick);if(mode==='host'&&troom)troom.emit('sfx',{k,s:seat}).catch(()=>{});}
const memeSeen=new Map();
function onSfxMsg(msg){
  if(!msg||msg.sameTab||!msg.data)return;const pick=memePick(msg.data);if(!pick)return;
  const last=memeSeen.get(msg.peer)||0;if(Date.now()-last<1200)return;memeSeen.set(msg.peer,Date.now());
  let seat=seatOverride(msg);if(seat<0)seat=seatOfPeer(msg.peer);
  showMeme(seat,pick);
}
function showMeme(seat,pick){if(pick.c)J.playCustom(pick.c);else J.playMeme(pick.k);if(seat>=0)sayBubble(seat,pick.label,true);addLine(seat,`${seat>=0?seatName(seat):'Someone'} played ${pick.label}`,'sys');}

/* ---------- Practice ---------- */
function startPractice(o){mode='practice';createGame(false,null,o);addBots(o.bots);showGame();G.started=true;log(`Bot game: ${money(G.start)} each, blinds ${money(G.sb)}/${money(G.bb)}.`,'s');startHand();setTimeout(()=>{if(G&&mode==='practice')hostChat(1,['Fresh meat 😏','Good luck. You’ll need it.','Let’s gooo','Shuffle up and deal!'][Math.floor(Math.random()*4)]);},2200);}

/* ---------- Save / resume ---------- */
function save(){if(mode==='host'||mode==='practice')J.store.set('jj-save',JSON.stringify({mode,at:Date.now(),G}));}
function readSave(){try{const s=JSON.parse(J.store.get('jj-save')||'null');if(s&&s.G&&s.G.sb&&Date.now()-s.at<6*3600e3&&!s.G.over)return s;}catch(e){}return null;}
function restore(s){const id=(G?G.id:0)+1;G=s.G;G.id=id;G.online=s.mode==='host';G.nextTok=0;G.enc={};G.players[0].peer=myPeer||'';G.players[0].name=nick();G.players[0].av=J.myAvSeed;G.players.forEach(p=>{if(p.kind==='remote'){p.gone=true;p.goneAt=Date.now();}});}
function resumeFlow(){log('Game resumed.','s');if(!G.started){commit();return;}if(G.handOver){commit();if(!G.waitingRebuy&&!G.over)scheduleNext(2500);}else{G.acting=-1;step();}}

/* ---------- Screens ---------- */
function showGame(){
  J.show('poker');
  $('overlay').hidden=true;$('log').innerHTML='';logMax=-1;shown=new Set();shownHand=-1;PV=null;pre=null;wasTurn=false;closeSheet();
  $('chatlog').innerHTML='<li class="none">Say hi. Or say nothing and look mysterious.</li>';unread=0;$('chatDot').hidden=true;
  $('emojis').innerHTML=EMOJIS.map((e,i)=>`<button type="button" data-e="${i}" aria-label="React ${e}">${e}</button>`).join('');
  $('memePop').hidden=true;closeThrow();$('chatNotifs').innerHTML='';setTab('chat');
  fitTable();
}
function leaveTable(){
  if(mode==='host'&&troom){const V=publicView();V.closed=1;V.enc={};V.log=[];troom.emit('state',V).catch(()=>{});}
  if(mode==='host'||mode==='practice')J.store.del('jj-save');
  if(mode==='client')J.store.del('jj-pkjoin');
  const t=troom;troom=null;if(t)t.leave().catch(()=>{});
  if(G)G.id++;
  G=null;CV=null;PV=null;mode='home';mySeat=-1;pend=null;hostPeer=null;hostGone=false;
  lastHosting='null';if(room)room.presence({hosting:null}).catch(()=>{});
  closeDock();J.show('home');renderHome();
}
function homeMsg(t){$('homeMsg').textContent=t;}
J.registerScreen('poker',{hide(){}});
(window.JJ_SCREENS=window.JJ_SCREENS||{}).poker={leave(){$('leaveBtn').click();}};

/* ---------- Home (poker card) ---------- */
function renderHome(){
  if(J.current!=='home')return;
  const ok=net==='ok';$('createBtn').disabled=!ok;$('joinBtn').disabled=!ok;
  const sv=readSave(),rb=$('resumeBtn');
  const sj=savedJoin();
  if(sv&&(sv.mode==='practice'||ok)){rb.hidden=false;rb.textContent=sv.mode==='host'?`Resume room ${sv.G.code} · hand ${sv.G.hand}`:`Resume bot game · ${money(sv.G.players[0].chips)}`;}
  else if(sj&&ok){rb.hidden=false;rb.textContent=`Rejoin table ${sj.code}`;}else rb.hidden=true;
  const ul=$('rooms');ul.innerHTML='';
  const list=room?room.peers().filter(p=>!p.sameTab&&p.presence&&p.presence.hosting&&typeof p.presence.hosting==='object'):[];
  const seen=new Set();
  list.forEach(p=>{
    const h=p.presence.hosting;if(typeof h.code!=='string'||!CODE_RE.test(h.code)||seen.has(h.code))return;seen.add(h.code);
    const n=Math.max(0,Math.min(4,Number(h.n)||0)),open=Math.max(0,Math.min(4,Number(h.open)||0)),bb=Math.max(0,Number(h.bb)||0);
    const li=document.createElement('li');const av=document.createElement('span');av.className='av';av.innerHTML=avatarSVG(String(h.av||'').slice(0,24)+'|'+(cleanName(h.host)||''),false);
    const info=document.createElement('div');info.className='r-info';const b=document.createElement('b');b.textContent=`${cleanName(h.host)||'Someone'}'s room`;
    const s=document.createElement('span');s.textContent=`${h.code} · ${n}/4${bb?` · ${money(bb/2)}/${money(bb)}`:''} · ${h.live?'playing':'waiting'}`;
    info.append(b,s);const btn=document.createElement('button');btn.className='btn btn-call';btn.type='button';btn.textContent=open?'Join':'Watch';btn.onclick=()=>joinTable(h.code,p.peer);
    li.append(av,info,btn);ul.appendChild(li);
  });
  if(!ul.children.length){const li=document.createElement('li');li.className='none';li.textContent=ok?'No open rooms. Be the host with the most.':net==='wait'?'Looking for rooms…':'Online rooms are napping. Bots are wide awake.';ul.appendChild(li);}
}
J.renderPokerHome=renderHome;

/* ---------- Table rendering ---------- */
const LAYOUT={wide:{seat:[[50,100],[7.5,47],[50,0],[92.5,47]]},tall:{seat:[[50,100],[13,67],[50,0],[87,67]]}};
const tableEl=$('table'),boardEl=$('board');
const seatEls=[];
for(let i=0;i<MAX;i++){const s=document.createElement('div');s.className='seat';tableEl.appendChild(s);seatEls.push(s);}
const rot=i=>mySeat>=0?(i-mySeat+MAX)%MAX:i;
function fitTable(){
  const st=$('stage');const W=st.clientWidth-16,H=st.clientHeight-8;if(W<=0||H<=0)return;
  const sideways=innerWidth>innerHeight&&innerHeight<540;const tall=W/H<1.15||(!sideways&&W<620&&W/H<1.5);
  /* fill the space: the table stretches between a tall and a wide shape instead of keeping one fixed shape */
  const ratio=tall?Math.max(.56,Math.min(.8,W/H)):Math.max(1.4,Math.min(1.95,W/H));
  const w=Math.max(160,Math.min(W,H*ratio));
  tableEl.style.width=w+'px';tableEl.style.height=(w/ratio)+'px';
  if(tall!==isTall){isTall=tall;tableEl.classList.toggle('tall',tall);}tableEl.classList.toggle('short',!tall&&w/ratio<460);
}
new ResizeObserver(()=>{if(J.current!=='poker')return;fitTable();if(CV){const pv=PV;PV=null;renderAll(true);PV=pv;}}).observe($('stage'));
const dealT=new Map();
function cardHTML(c,down,key,o){
  o=o||{};const fresh=key&&!shown.has(key);if(key)shown.add(key);
  let a='',delay=fresh?(o.delay||0):0,flipAt=o.flipAt;
  if(fresh&&anim()){a=down?'deal':(shown.has(key.slice(0,-1)+'d')?'flip':'deal');if(a==='deal')dealT.set(key,{t:performance.now(),d:o.delay||0});}
  else if(key&&dealT.has(key)&&anim()){
    /* the seat was redrawn mid-deal: keep the same animation going instead of snapping */
    const r=dealT.get(key),el=performance.now()-r.t,end=flipAt!=null?flipAt+520:r.d+640;
    if(el<end){a='deal';delay=r.d-el;if(flipAt!=null)flipAt-=el;}else dealT.delete(key);
  }
  if(dealT.size>60)dealT.clear();
  return J.cardFace(c,{down,anim:a,delay,cls:o.cls,flipAt:a==='deal'&&flipAt!=null?flipAt:null});
}
const bubbleClass=t=>'b-'+(t.split(' ')[0]||'').toLowerCase().replace(/[^a-z]/g,'');
function myHoleCards(){return mode==='client'?myHole:(G?G.players[0].hole:[]);}
function ingestLog(entries){if(!Array.isArray(entries))return;const ol=$('log');for(const e of entries){if(!e||typeof e.i!=='number'||e.i<=logMax)continue;logMax=e.i;const li=document.createElement('li');if(['h','w','s'].includes(e.c))li.className=e.c;li.textContent=String(e.t||'').slice(0,200);ol.prepend(li);}while(ol.children.length>200)ol.lastChild.remove();}
function centerOf(el){const t=tableEl.getBoundingClientRect(),r=el.getBoundingClientRect();return [r.left+r.width/2-t.left,r.top+r.height/2-t.top];}
let potShown=0,potAnim=0;
function setPot(v,delay){
  const el=$('potAmt');cancelAnimationFrame(potAnim);
  if(!anim()||v<potShown){potShown=v;el.textContent=money(v);return;}
  const from=potShown;potShown=v;
  setTimeout(()=>{const t0=performance.now();const tick=t=>{const k=Math.min(1,(t-t0)/450);el.textContent=money(from+(v-from)*(1-Math.pow(1-k,3)));if(k<1)potAnim=requestAnimationFrame(tick);};potAnim=requestAnimationFrame(tick);$('pot').animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:350,easing:'ease-out'});},delay||0);
}
function renderStacks(total,bb){
  const n=total>0?Math.min(18,Math.max(1,Math.ceil(Math.log2(total/bb+1)*2.4))):0;
  const cols=['#ff6b4a','#ffc83d','#22c995'];const per=[0,0,0];for(let k=0;k<n;k++)per[k%3]++;
  $('stacks').innerHTML=per.filter(x=>x>0).map((x,i)=>`<span class="stk-col">${('<i style="--c:'+cols[i]+'"></i>').repeat(x)}</span>`).join('');
}
const prevBubble=[];
const ordS=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
const seedOf=p=>p.k==='b'?p.n:(p.av||'')+'|'+(p.n||'');
function animateDiff(P,V){
  if(!P||P.code!==V.code)return;
  const newHand=V.hand!==P.hand;
  V.p.forEach((p,i)=>{
    if(p.k==='e')return;const pp=P.p[i]||{};
    const d=newHand?(p.t||0):((p.t||0)-(pp.t||0));
    if(d>0)J.flyChips(whoEl(i),$('potbox'),Math.min(7,Math.max(3,Math.ceil(d/V.bb)+1)),newHand?300+i*120:0);
    if(!newHand&&p.l!==pp.l){if(p.l==='Check')SFX.check();else if(p.l==='Fold')SFX.fold();}
  });
  if(newHand&&V.st){const nL=V.p.filter(q=>q.hc>0).length||1;SFX.riffle();if(mySeat>=0&&V.p[mySeat]&&V.p[mySeat].hc>0){const ft=((2*nL)*150+250+650)/1000;SFX.flip(ft);SFX.flip(ft+.12);}const sh=$('shoe');sh.classList.remove('shuf');void sh.offsetWidth;sh.classList.add('shuf');V.p.forEach((p,i)=>{if(p.hc>0)for(let k=0;k<2;k++)SFX.card(((k*nL+((i-V.dealer-1+MAX)%MAX))*150+250)/1000);});}
  if(!newHand&&V.board.length>P.board.length)for(let k=P.board.length;k<V.board.length;k++){SFX.card((k-P.board.length)*.14);SFX.flip((k-P.board.length)*.14+.22);}
  if(V.ho&&!P.ho&&V.hand===P.hand){
    V.p.forEach((p,i)=>{if(p.w)J.flyChips($('center'),whoEl(i),9,450,{coin:true});});
    trackResult(P,V);
    const ws=V.p.filter(p=>p.k!=='e'&&p.w);
    if(ws.length){const pot=P.p.reduce((a,q)=>a+(q.t||0),0);const big=pot>=V.bb*25&&!V.bf;const id=V.hand;
      setTimeout(()=>{if(CV&&CV.hand===id&&J.current==='poker')J.finisher({list:ws.map(p=>({seed:seedOf(p),bot:p.k==='b',name:p.n})),big,dur:V.bf?1900:2500});},1050);}
  }
  if(V.bty&&V.ho&&(!P.bty||P.hand!==V.hand)){
    const b=V.bty;setTimeout(()=>{(b.from||[]).forEach((f,k)=>J.flyChips(whoEl(f),whoEl(b.w),4,k*150));J.floatText(whoEl(b.w),`7-2 bounty +${money(b.total)}`);},1300);
    if(b.w===mySeat)J.unlock('p_72');
  }
  if(V.rb&&!P.rb&&V.hand===P.hand)SFX.card();
}
function trackResult(P,V){
  const me=mySeat>=0?V.p[mySeat]:null;if(!me||!(P.p[mySeat]&&P.p[mySeat].hc>0))return;
  J.stat('ph');J.addXP(6);J.unlock('first_hand');
  if(me.w){
    const pot=V.p.reduce((a,q)=>a+(q.t||0),0);
    setTimeout(()=>{J.confetti();SFX.win();},550);
    J.stat('pw');J.stat('big',pot,'max');J.addXP(18+Math.min(60,Math.round(pot/V.bb)));J.unlock('first_pot');
    if(pot>=V.bb*25)J.unlock('big_pot');
    if(P.p[mySeat].a||me.a)J.unlock('allin_win');
    const hole=myHoleCards();if(hole.length&&V.board.length===5&&cat(eval7(hole.concat(V.board.map(cardOf))))>=6&&Array.isArray(me.sh)&&me.sh.length)J.unlock('monster');
    if(!(Array.isArray(me.sh)&&me.sh.length))J.unlock('bluff');
    if(V.b2){const hole2=myHoleCards();if(hole2.length){const mine=b=>eval7(hole2.concat(b.map(cardOf)));const others=V.p.filter((q,j)=>j!==mySeat&&Array.isArray(q.sh)&&q.sh.length&&!q.f);const beat=b=>others.every(q=>eval7(q.sh.map(cardOf).concat(b.map(cardOf)))<=mine(b));if(beat(V.board)&&beat(V.b2))J.unlock('p_rit');}}
  }
}
function placeDealer(V){
  const db=$('dealerBtn');
  if(!(V.st&&V.hand>0&&V.p[V.dealer]&&V.p[V.dealer].k!=='e')){db.hidden=true;return;}
  const who=whoEl(V.dealer);if(!who)return;
  if(db.hidden)db.style.transition='none';db.hidden=false;const [x,y]=centerOf(who);const r=who.offsetWidth/2;const d=rot(V.dealer);
  db.style.transform=`translate(${x+(d===3?-1:1)*r*.95}px,${isTall&&d!==0?y+r*.75:y-r*.8}px)`;if(db.style.transition==='none'){void db.offsetWidth;db.style.transition='';}
}
function renderAll(noAnim){
  const V=CV;
  $('codeTxt').textContent=mode==='practice'?'Bots':(V&&V.code)||joinCode||'—';
  $('roomLbl').textContent=mode==='practice'?'Game':'Room';$('copyBtn').hidden=mode==='practice';
  $('handNo').textContent=V?V.hand:0;$('blindTxt').textContent=V?`${money(V.sb)}/${money(V.bb)}`:'—';
  $('tourPill').hidden=!(V&&V.tr);$('blindPill').style.display=V&&V.tr?'none':'';if(V&&V.tr){$('tourLv').textContent=`Lv ${V.tr.lv} · ${money(V.sb)}/${money(V.bb)}`;tourClock();}
  if(V&&V.tr&&PV&&PV.tr&&PV.code===V.code&&V.tr.lv>PV.tr.lv&&!V.over){SFX.fight();J.toast(`<span class="t-ic">⏫</span><span><b>Blinds up! Level ${V.tr.lv}</b><br>Now ${money(V.sb)}/${money(V.bb)}. Tighten up.</span>`,'gold',3200);const tp=$('tourPill');tp.classList.add('hot');setTimeout(()=>tp.classList.remove('hot'),2500);}
  if(V&&V.tr&&V.over&&PV&&!PV.over&&PV.code===V.code){const ch=V.tr.pl.find(x=>x.pl===1);if(ch)setTimeout(()=>{J.finisher({list:[{seed:ch.k==='b'?ch.n:ch.av+'|'+ch.n,bot:ch.k==='b',name:ch.n}],top:'TOURNAMENT CHAMPION',big:true,say:'LAST ONE STANDING!',dur:3200});J.confetti();},400);
    const mine=V.p[mySeat];if(mine&&mine.pl)J.toast(`<span class="t-ic">${['','🏆','🥈','🥉'][mine.pl]||'🎖️'}</span><span><b>You finished ${ordS(mine.pl)}</b><br>${mine.pl===1?'Champion of the table!':'Good run. Rematch?'}</span>`,'gold',4200);}
  if(!V){seatEls.forEach(s=>{s.innerHTML='';s.className='seat';});boardEl.innerHTML='';$('board2').hidden=true;$('potbox').style.visibility='hidden';$('waitbox').hidden=true;$('banner').hidden=true;$('dealerBtn').hidden=true;renderOverlay();renderMe();renderControls();return;}
  if(V.hand!==shownHand){shown=new Set();shownHand=V.hand;}
  ingestLog(V.log);
  const L=isTall?LAYOUT.tall:LAYOUT.wide,hole=myHoleCards(),board=V.board.map(cardOf);
  let hiSet=null,hiSet2=null;
  const shownP=V.p.filter(p=>p.k!=='e'&&!p.f&&Array.isArray(p.sh)&&p.sh.length);
  const winSet=b=>{const sc=shownP.map(p=>eval7(p.sh.map(cardOf).concat(b)));const best=Math.max(...sc);const set=new Set();shownP.forEach((p,i)=>{if(sc[i]===best)best5(p.sh.map(cardOf).concat(b)).forEach(id=>set.add(id));});return set;};
  if(V.ho&&shownP.length>=1&&board.length===5&&V.p.some(p=>p.w))hiSet=winSet(board);
  const board2=V.b2?V.b2.map(cardOf):null;
  if(V.ho&&board2&&shownP.length)hiSet2=winSet(board2);
  const inHi=id=>(hiSet&&hiSet.has(id))||(hiSet2&&hiSet2.has(id));
  /* read every size we need in one go, before changing anything (avoids repeated layout on phones) */
  const shoeR=$('shoe').getBoundingClientRect(),tR=tableEl.getBoundingClientRect(),bR0=boardEl.getBoundingClientRect();
  const seatR=seatEls.map(el=>el.getBoundingClientRect());
  const sx=shoeR.left+shoeR.width/2-tR.left,sy=shoeR.top+shoeR.height/2-tR.top;
  const setH=(el,h)=>{if(el._h!==h){el._h=h;el.innerHTML=h;}};
  const setC=(el,c)=>{if(el.className!==c)el.className=c;};
  const setV=(el,k,v)=>{if(el.style.getPropertyValue(k)!==v)el.style.setProperty(k,v);};
  const nLive=V.p.filter(p=>p.hc>0).length||1;
  V.p.forEach((p,i)=>{
    const el=seatEls[i],d=rot(i),[x,y]=L.seat[d];
    setV(el,'left',x+'%');setV(el,'top',y+'%');
    if(p.k==='e'){setC(el,`seat open pos${d}`);el.hidden=mode==='practice';setH(el,`<div class="cards"></div><div class="who">+</div><div class="plate"><span class="nm">Open seat</span><span class="stk">&nbsp;</span></div>`);prevBubble[i]='';return;}
    el.hidden=false;
    const isMe=i===mySeat;
    const lowTime=V.acting===i&&V.tl>=0&&(V.tl-(Date.now()-recvAt)/1000)<6;
    setC(el,`seat pos${d}`+(isMe?' me':'')+(p.f&&!p.o?' folded':'')+(p.o?' out':'')+(p.g?' away':'')+(p.w?' win':'')+(V.acting===i?' acting':'')+(V.acting===i&&V.tl<0?' nolimit':'')+(lowTime?' low':''));
    const er=seatR[i];const cx=er.left+er.width/2-tR.left,cy=er.top+er.height*(d===2?.8:.25)-tR.top;
    setV(el,'--dx',(sx-cx).toFixed(0)+'px');setV(el,'--dy',(sy-cy).toFixed(0)+'px');
    const ord=(i-V.dealer-1+MAX)%MAX;
    let cards='';
    if(p.hc>0){
      const dl=k=>(k*nLive+ord)*150+250;
      const cls=id=>hiSet?(inHi(id)?'hi':'dim'):'';
      if(isMe&&hole.length)cards=hole.map((c,k)=>cardHTML(c,false,`${V.hand}-${i}-${k}-u`,{delay:dl(k),flipAt:(2*nLive)*150+250+650+k*120,cls:p.w?cls(c.id):''})).join('');
      else if(Array.isArray(p.sh)&&p.sh.length)cards=p.sh.map((id,k)=>cardHTML(cardOf(id),false,`${V.hand}-${i}-${k}-u`,{cls:hiSet?(inHi(id)?'hi':'dim'):''})).join('');
      else cards=cardHTML(null,true,`${V.hand}-${i}-0-d`,{delay:dl(0)})+cardHTML(null,true,`${V.hand}-${i}-1-d`,{delay:dl(1)});
    }
    let ht=p.ht||'';
    if(!ht&&isMe&&S.hint&&!p.f&&hole.length&&board.length>=3)ht=describe(eval7(hole.concat(board)));
    const bub=p.wt?'Joins next hand':p.g?'Away':(p.l||'');
    const think=V.acting===i&&!V.ho;
    const popCls=bub&&bub!==prevBubble[i]?' pop':'';prevBubble[i]=think?'…':bub;
    const bubHTML=think?`<span class="bubble b-think"><span>•</span><span>•</span><span>•</span></span>`:bub?`<span class="bubble ${bubbleClass(bub)}${popCls}">${esc(bub)}</span>`:'';
    const avSeed=seedOf(p);
    const eqMax=Math.max(...V.p.map(q=>q.q>=0?q.q:-1));
    const eqHTML=p.q>=0?`<span class="eqb${p.q===eqMax?' lead':''}${p.q===0?' dead':''}">${p.q}%</span>`:'';
    setH(el,`<div class="cards${!isMe&&Array.isArray(p.sh)&&p.sh.length?' up':''}">${cards}</div>
      <div class="who"><div class="ring"></div><span class="av">${avatarSVG(avSeed,p.k==='b')}</span>${bubHTML}${p.w?CROWN:''}${eqHTML}</div>
      <div class="plate"><span class="nm">${esc(p.n||'Player')}${isMe?' <i>(you)</i>':p.k==='b'?' <i>· bot</i>':''}</span><span class="stk">${p.o&&p.c===0?(V.tr&&p.pl?`Out · ${ordS(p.pl)}`:'Busted'):money(p.c)}</span></div>
      ${ht&&(!isMe||p.w)?`<div class="htxt">${esc(ht)}</div>`:''}`);
  });
  const started=!!V.st;
  boardEl.hidden=!started;$('shoe').style.visibility=started?'visible':'hidden';
  if(started){
    const bR=bR0.width?bR0:boardEl.getBoundingClientRect();setV(boardEl,'--dx',(sx-(bR.left+bR.width/2-tR.left)).toFixed(0)+'px');setV(boardEl,'--dy',(sy-(bR.top+bR.height/2-tR.top)).toFixed(0)+'px');
    const prevN=PV&&PV.hand===V.hand?PV.board.length:0;
    const rb=Array.isArray(V.rb)?V.rb.map(cardOf):[];
    let bh='';for(let k=0;k<5;k++){
      if(board[k])bh+=cardHTML(board[k],false,`${V.hand}-b${k}-u`,{delay:k>=prevN?(k-prevN)*140:0,cls:hiSet?(hiSet.has(board[k].id)?'hi':'dim'):''});
      else if(rb[k-board.length])bh+=cardHTML(rb[k-board.length],false,`${V.hand}-r${k}-u`,{delay:(k-board.length)*160,cls:'rabbit'});
      else bh+='<div class="slot"></div>';}
    setH(boardEl,bh);
    const b2El=$('board2');
    if(board2){b2El.hidden=false;b2El.style.setProperty('--dx',boardEl.style.getPropertyValue('--dx'));b2El.style.setProperty('--dy',boardEl.style.getPropertyValue('--dy'));b2El.innerHTML='<span class="run-lbl">Run 2</span>'+board2.map((c,k)=>cardHTML(c,false,`${V.hand}-b2${k}-u`,{delay:k*140,cls:hiSet2?(hiSet2.has(c.id)?'hi':'dim'):''})).join('');}
    else{b2El.hidden=true;b2El.innerHTML='';}
    $('runLbl').hidden=!board2&&!V.rit;
  }
  $('street').textContent=started&&!V.ho&&V.hand>0?['PRE-FLOP','FLOP','TURN','RIVER'][V.street||0]+' · POT':'POT';
  const total=V.p.reduce((a,q)=>a+(q.t||0),0);
  $('potbox').style.visibility=started&&V.hand>0?'visible':'hidden';
  const prevTotal=PV&&PV.code===V.code&&PV.hand===V.hand?PV.p.reduce((a,q)=>a+(q.t||0),0):-1;
  const chipsMoving=!noAnim&&PV&&PV.code===V.code&&(V.hand!==PV.hand||total>prevTotal);
  if(V.ho){
    if(PV&&!PV.ho&&!noAnim){setPot(total);renderStacks(total,V.bb);setTimeout(()=>{if(CV&&CV.ho&&CV.hand===V.hand){setPot(0);renderStacks(0,V.bb);}},1400);}
    else if(!PV||PV.code!==V.code){setPot(0);renderStacks(0,V.bb);}
  } else if(total!==prevTotal||noAnim){
    setPot(total,chipsMoving?780:0);
    if(chipsMoving)setTimeout(()=>{if(CV===V)renderStacks(total,V.bb);},820);else renderStacks(total,V.bb);
  }
  const bn=$('banner');
  const showBn=started&&V.ho&&V.res&&!V.over;
  if(showBn){bn.hidden=false;$('bannerT').textContent=V.res;$('bannerS').textContent=V.rs||'';}else bn.hidden=true;
  if(showBn)$('potbox').style.visibility='hidden';
  placeDealer(V);
  if(!noAnim)animateDiff(PV,V);
  PV=V;
  renderWait();renderOverlay();renderMe();renderControls();updateRing();
}
function renderMe(){
  const V=CV,p=V&&mySeat>=0?V.p[mySeat]:null;
  $('mebox').hidden=!p;if(!p)return;
  $('meAv').innerHTML=avatarSVG((p.av||'')+'|'+p.n,false);
  $('meName').textContent=p.t>0&&!V.ho?`${p.n} · ${money(p.t)} in the pot`:`${p.n} · your money`;
  $('meStack').textContent=p.o&&p.c===0?'$0':money(p.c);
  const hole=myHoleCards(),board=V.board.map(cardOf);
  $('meHand').textContent=S.hint&&!p.f&&hole.length?(board.length>=3?describe(eval7(hole.concat(board))):(hole[0].r===hole[1].r?`Pocket ${PL[hole[0].r]}`:`${cstr(hole[0])} ${cstr(hole[1])}${hole[0].s===hole[1].s?' suited':''}`)):'';
}
function renderWait(){
  const V=CV,wb=$('waitbox');$('center').classList.toggle('waiting',!!(V&&!V.st));if(!V||V.st){wb.hidden=true;return;}
  wb.hidden=false;$('wbCode').textContent=V.code||'';
  $('wbWho').innerHTML=V.p.filter(p=>p.k!=='e').map(p=>`<span class="av" title="${esc(p.n)}">${avatarSVG(p.k==='b'?p.n:(p.av||'')+'|'+p.n,p.k==='b')}</span>`).join('');
  const humans=V.p.filter(p=>p.k==='h').length,isHost=mode==='host';
  $('fillWrap').hidden=!isHost;$('startBtn').hidden=!isHost;
  if(isHost){const fill=$('fillBots').checked;$('startBtn').disabled=!(humans>=2||(fill&&humans>=1));$('wbText').textContent=humans<2?`Send this code to your friends. ${humans} of 4 seated.`:`${humans} of 4 seated. Start when everyone's in.`;}
  else $('wbText').textContent=mySeat>=0?`You're in! Waiting for ${V.p[0].n||'the host'} to start.`:V.p.every(p=>p.k!=='e')?'This room is full. You can watch.':'Finding you a seat…';
}
function renderOverlay(){
  const ov=$('overlay'),V=CV;let title='',text='',btn='';
  if(mode==='client'&&V&&V.closed){title='Room closed';text='The host closed this room.';}
  else if(mode==='client'&&hostGone){title='Host disconnected';text='Hang tight. The game picks up again if the host comes back.';}
  else if(V&&V.over){title=V.tr?'🏆 Tournament over':'Game over';text=V.over;btn=(mode==='host'||mode==='practice')?(V.tr?'New tournament':'Play again'):'';if(mode==='client')text+=' Waiting for the host to start again.';}
  const pod=$('ovPodium');
  if(title&&V&&V.over&&V.tr&&V.tr.pl.length){const by=n=>V.tr.pl.find(x=>x.pl===n);const cell=(n,cls)=>{const x=by(n);if(!x)return '<div></div>';return `<div class="pod ${cls}"><span class="av">${avatarSVG(x.k==='b'?x.n:x.av+'|'+x.n,x.k==='b')}</span><b>${esc(x.n)}</b><div class="step">${['','🥇','🥈','🥉'][n]}</div></div>`;};
    pod.innerHTML=cell(2,'p2')+cell(1,'p1')+cell(3,'p3');pod.hidden=false;const rest=V.tr.pl.filter(x=>x.pl>3).sort((a,b)=>a.pl-b.pl);if(rest.length)text+=' '+rest.map(x=>`${ordS(x.pl)}: ${x.n}`).join(' · ');}
  else pod.hidden=true;
  if(!title){ov.hidden=true;return;}
  ov.hidden=false;$('ovTitle').textContent=title;$('ovText').textContent=text;$('ovBtn').hidden=!btn;$('ovBtn').textContent=btn;
}
function updateRing(){
  if(!CV||CV.acting<0||J.current!=='poker')return;const el=seatEls[CV.acting];if(!el)return;const r=el.querySelector('.ring');if(!r)return;
  if(CV.tl>=0){const left=Math.max(0,CV.tl-(Date.now()-recvAt)/1000);r.style.setProperty('--p',(left/((CV.tm||40000)/1000)).toFixed(3));el.classList.toggle('low',left<6);}
}

/* ---------- Controls ---------- */
const bFold=$('bFold'),bCall=$('bCall'),bRaise=$('bRaise'),slider=$('slider'),raiseIn=$('raiseIn');
function me(){return CV&&mySeat>=0?CV.p[mySeat]:null;}
function limits(){const V=CV,p=me();const toCall=Math.min(V.cb-p.b,p.c),maxTo=p.b+p.c,minTo=Math.min(V.cb+V.mr,maxTo);const canRaise=p.c>toCall&&V.p.some((q,j)=>j!==mySeat&&q.k!=='e'&&!q.o&&!q.f&&!q.a);return{p,toCall,maxTo,minTo,canRaise};}
const vPot=()=>CV.p.reduce((a,q)=>a+(q.t||0),0);
function myTurn(){return !!(CV&&CV.st&&!CV.ho&&!CV.over&&mySeat>=0&&CV.acting===mySeat&&!pend&&!hostGone);}
function inHand(){const p=me();return !!(CV&&CV.st&&!CV.ho&&!CV.over&&p&&p.hc>0&&!p.f&&!p.a&&!p.o);}
function secsLeft(){return CV&&CV.tl>=0?Math.max(0,Math.ceil(CV.tl-(Date.now()-recvAt)/1000)):-1;}
function presetVal(kind){const {toCall,maxTo,minTo}=limits();const pot=vPot();const st=CV.sb||10;const v=kind==='min'?minTo:kind==='all'?maxTo:CV.cb+Math.round(((pot+toCall)*(kind==='half'?.5:1))/st)*st;return Math.max(minTo,Math.min(v,maxTo));}
function fillSlider(){const mn=Number(slider.min),mx=Number(slider.max),v=Number(slider.value);slider.style.setProperty('--fill',(mx>mn?((v-mn)/(mx-mn))*100:100)+'%');}
function openSheet(){
  if(!myTurn())return;const L=limits();if(!L.canRaise)return;
  sheetOpen=true;$('sheet').hidden=false;$('mainBtns').hidden=true;
  slider.min=L.minTo;slider.max=L.maxTo;slider.step=CV.sb||10;
  setAmt(presetVal(CV.cb===0?'half':'min'));
  ['min','half','pot','all'].forEach(k=>$('p'+k[0].toUpperCase()+k.slice(1)).textContent=money(presetVal(k)));
  renderControls();
  setTimeout(()=>{try{raiseIn.focus({preventScroll:true});raiseIn.select();}catch(e){}},30);
}
function closeSheet(){sheetOpen=false;$('sheet').hidden=true;$('mainBtns').hidden=false;}
function setAmt(v){raiseIn.value=Math.round(v);slider.value=v;fillSlider();checkAmt();}
function checkAmt(){
  if(!CV||mySeat<0)return false;const L=limits();const v=Math.round(Number(raiseIn.value));
  const ok=raiseIn.value!==''&&Number.isFinite(v)&&v>=L.minTo&&v<=L.maxTo;const h=$('hint');
  if(!ok){h.textContent=`Choose between ${money(L.minTo)} and ${money(L.maxTo)}.`;h.classList.add('bad');}
  else{h.textContent=v>=L.maxTo?'That’s all your money. Bold.':`You put ${money(v-L.p.b)} more into the pot.`;h.classList.remove('bad');}
  $('rConfirm').disabled=!ok;
  $('rConfirm').textContent=ok?(v>=L.maxTo?`All-in ${money(v)}`:CV.cb===0?`Bet ${money(v)}`:`Raise to ${money(v)}`):'Raise';
  return ok;
}
/* last 5 seconds of your turn: soft tick and a buzz each second */
let lastTick=-1;
setInterval(()=>{if(J.current!=='poker'||!myTurn()){lastTick=-1;return;}const t=secsLeft();if(t>=0&&t<=5&&t!==lastTick&&t>0){lastTick=t;SFX.tone?SFX.tone(1400,.05,'sine',.035):J.tone(1400,.05,'sine',.035);J.buzz&&J.buzz(25);$('bar').classList.remove('tick');void $('bar').offsetWidth;$('bar').classList.add('tick');}},250);
function tourClock(){const V=CV;if(!V||!V.tr)return;const left=V.st?Math.max(0,V.tr.nx-(Date.now()-recvAt)):V.tr.nx;const m=Math.floor(left/60000),sec=Math.floor(left/1000)%60;$('tourNext').textContent=V.over?'':` · ⏫ ${m}:${String(sec).padStart(2,'0')}`;}
setInterval(()=>{if(J.current==='poker')tourClock();},1000);
function renderControls(){
  if(J.current!=='poker')return;
  const st=$('status'),V=CV,turn=myTurn(),p=me();let html='';
  const t=secsLeft(),timer=t>=0?` · <span class="t">${t}s</span>`:'';
  if(!V)html=mode==='client'?'Joining the room…':'';
  else if(!V.st)html=mode==='host'?'Waiting for your friends to join.':'Waiting for the host to start.';
  else if(V.over)html=esc(V.over);
  else if(V.tr&&p&&p.o&&p.pl)html=`You finished <b>${ordS(p.pl)}</b>. Stick around and watch who takes it.`;
  else if(V.ho){const n=Math.ceil((V.nx-(Date.now()-recvAt))/1000);html=V.wr?esc(V.rs||''):(n>0?`Next hand in <b>${n}s</b>`:'Shuffling…');}
  else if(turn){const L=limits();html=(L.toCall>0?`<b>Your turn.</b> ${money(L.toCall)} to call`:`<b>Your turn.</b> You can check`)+timer;}
  else if(pend)html='Sending your move…';
  else{
    const ai=V.acting>=0?V.acting:(V.nxa>=0?V.nxa:-1);
    const dealingTxt=V.board.length===0?'Dealing the flop…':V.board.length===3?'Dealing the turn…':V.board.length===4?'Dealing the river…':'Showdown…';
    const who=ai>=0&&V.p[ai]&&V.p[ai].k!=='e'?(ai===mySeat?'<b>Your turn</b> is next':`<b>${esc(V.p[ai].n)}</b> is thinking…${V.acting>=0?timer:''}`):dealingTxt;
    if(!p)html=who?`Watching · ${who}`:`Watching`;
    else if(p.wt||(p.o&&p.c>0))html=`You join next hand. ${who}`;
    else if(p.f)html=`You folded. ${who}`;
    else if(p.a)html=`You're all-in! ${who||'Dealing the rest…'}`;
    else html=who;
  }
  st.innerHTML=html;
  $('emojis').hidden=!(V&&V.st&&p)||sheetOpen;
  $('bar').classList.toggle('myturn',turn);
  const showRebuy=!!(V&&V.st&&!V.over&&!V.tr&&p&&p.c===0&&(p.o||V.ho));
  $('rebuyBox').hidden=!showRebuy;if(showRebuy)$('rebuyBtn').textContent=`Get ${money(V.s0||1000)} more`;
  const canNext=(mode==='host'||mode==='practice')&&V&&V.st&&V.ho&&!V.over&&!V.wr;
  const canRabbit=!!(V&&V.ho&&V.rbOk&&mySeat>=0);
  const meP=V&&mySeat>=0?V.p[mySeat]:null;
  const canShow=!!(V&&V.ho&&!V.over&&V.bf&&meP&&meP.w&&!(Array.isArray(meP.sh)&&meP.sh.length));
  $('bNext').hidden=!canNext;$('rabbitBtn').hidden=!canRabbit;$('showBtn').hidden=!canShow;
  $('nextRow').hidden=!(canNext||canRabbit||canShow);
  if(!turn&&sheetOpen)closeSheet();
  const showPre=!turn&&!pend&&inHand();
  $('preRow').hidden=!showPre;
  if(showPre){
    const L=limits();
    const pc=$('preRow').querySelector('[data-pre="check"]');pc.textContent=L.toCall>0?`Call ${money(L.toCall)}`:'Check';pc.dataset.amt=L.toCall;
    if(pre==='check'&&pc.dataset.lock!==undefined&&Number(pc.dataset.lock)!==L.toCall)pre=null;
    $('preRow').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(pre===b.dataset.pre)));
  }
  $('mainBtns').hidden=!(!sheetOpen&&(turn||(!showPre&&V&&V.st&&!V.over&&!V.ho&&p&&!showRebuy)));
  [bFold,bCall,bRaise].forEach(b=>b.disabled=!turn);
  if(turn&&!wasTurn){SFX.turn();if(J.animOn()&&mySeat>=0)setTimeout(()=>J.floatText(whoEl(mySeat),'Your turn!','gold'),150);if(pre){const k=pre;pre=null;setTimeout(()=>applyPre(k),350);}}
  wasTurn=turn;
  if(!turn){bCall.textContent=V&&p&&V.cb>p.b?'Call':'Check';bRaise.textContent='Raise';return;}
  const L=limits();
  bCall.textContent=L.toCall===0?'Check':(L.toCall>=L.p.c?`All-in ${money(L.toCall)}`:`Call ${money(L.toCall)}`);
  bRaise.disabled=!L.canRaise;bRaise.innerHTML=`${V.cb===0?'Bet':'Raise'}${L.canRaise?`<small class="bsub">min ${money(L.minTo)}</small>`:''}`;
  if(sheetOpen){slider.min=L.minTo;slider.max=L.maxTo;fillSlider();}
}
function applyPre(k){
  if(!myTurn())return;const L=limits();
  if(k==='checkfold')act(L.toCall===0?'check':'fold');
  else if(k==='check'){if(L.toCall===0)act('check');else if(Number($('preRow').querySelector('[data-pre="check"]').dataset.lock)===L.toCall)act('call');}
  else if(k==='callany')act(L.toCall===0?'check':'call');
}
function act(type,to){if(!myTurn())return;closeSheet();if(mode==='client')return sendAct(type,to);doAction(mySeat,type,to);}
bFold.onclick=()=>act('fold');
bCall.onclick=()=>{const {toCall}=limits();act(toCall===0?'check':'call');};
bRaise.onclick=()=>openSheet();
$('rCancel').onclick=()=>closeSheet();
$('rConfirm').onclick=()=>{if(checkAmt())act('raise',Math.round(Number(raiseIn.value)));};
slider.oninput=()=>{raiseIn.value=slider.value;fillSlider();checkAmt();};
raiseIn.oninput=()=>{const v=Number(raiseIn.value);if(Number.isFinite(v)){slider.value=v;fillSlider();}checkAmt();};
raiseIn.onblur=()=>{if(!CV||mySeat<0||!sheetOpen||raiseIn.value==='')return;const L=limits();const v=Number(raiseIn.value);if(!Number.isFinite(v))return;setAmt(Math.max(L.minTo,Math.min(Math.round(v),L.maxTo)));};
$('minus').onclick=()=>{const L=limits();setAmt(Math.max(L.minTo,(Math.round(Number(raiseIn.value))||L.minTo)-CV.bb));};
$('plus').onclick=()=>{const L=limits();setAmt(Math.min(L.maxTo,(Math.round(Number(raiseIn.value))||L.minTo)+CV.bb));};
document.querySelectorAll('#sheet .preset').forEach(b=>b.onclick=()=>setAmt(presetVal(b.dataset.q)));
$('preRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=b.dataset.pre;pre=pre===k?null:k;if(k==='check')b.dataset.lock=b.dataset.amt;renderControls();});
tableEl.addEventListener('click',e=>{const w=e.target.closest('.seat .who');if(!w||mySeat<0||!CV)return;const el=w.closest('.seat');const i=seatEls.indexOf(el);if(i<0||i===mySeat||!CV.p[i]||CV.p[i].k==='e')return;e.stopPropagation();if(throwTarget===i&&!$('throwPop').hidden){closeThrow();return;}openThrow(i);});
$('throwGrid').innerHTML=THROWS.map(t=>`<button type="button" data-k="${t.k}" title="${t.n}"><span>${t.ic}</span>${t.n}</button>`).join('');
$('throwGrid').onclick=e=>{const b=e.target.closest('button[data-k]');if(!b||throwTarget<0)return;const now=Date.now();if(now-lastThrow<900)return;lastThrow=now;const to=throwTarget;closeThrow();sendThrow(mySeat,to,b.dataset.k);J.unlock('chatty');};
document.addEventListener('click',e=>{if(!$('throwPop').hidden&&!e.target.closest('#throwPop'))closeThrow();});
$('emoBtn').onclick=e=>{e.stopPropagation();$('bar').classList.toggle('emo-open');};
document.addEventListener('click',e=>{if($('bar').classList.contains('emo-open')&&!e.target.closest('#emojis')&&!e.target.closest('#emoBtn'))$('bar').classList.remove('emo-open');});
$('emojis').onclick=e=>{$('bar').classList.remove('emo-open');const b=e.target.closest('button[data-e]');if(!b||mySeat<0)return;sendReact(mySeat,Number(b.dataset.e));};
J.memeGrid($('memeGrid'),pick=>{$('memePop').hidden=true;sendMeme(pick);});
$('memeBtn').onclick=e=>{e.stopPropagation();$('memePop').hidden=!$('memePop').hidden;};
document.addEventListener('click',e=>{if(!$('memePop').hidden&&!e.target.closest('#memePop')&&!e.target.closest('#memeBtn'))$('memePop').hidden=true;});
$('bNext').onclick=()=>{if(G&&G.handOver&&!G.over&&!G.waitingRebuy)startHand();};
$('showBtn').onclick=()=>{$('showBtn').hidden=true;if(mode==='client'){if(troom&&CV)troom.emit('act',{type:'show',hand:CV.hand,seq:CV.seq}).catch(()=>{});}else if(G)showMine(mySeat);};
$('rabbitBtn').onclick=()=>{J.unlock('p_rabbit');$('rabbitBtn').hidden=true;if(mode==='client'){if(troom&&CV)troom.emit('act',{type:'rabbit',hand:CV.hand,seq:CV.seq}).catch(()=>{});}else revealRabbit();};
$('rebuyBtn').onclick=()=>{if(mode==='client'){if(troom)troom.emit('rebuy',{}).catch(()=>{});$('rebuyBox').hidden=true;}else doRebuy(0);};
$('startBtn').onclick=()=>{if(mode==='host')startGame();};
$('fillBots').onchange=()=>renderWait();
$('ovBtn').onclick=()=>{if(G&&G.over)resetGame();};
$('ovHome').onclick=()=>leaveTable();
async function copyCode(btn){const code=CV&&CV.code||joinCode;if(!code)return;const old=btn.textContent;try{await navigator.clipboard.writeText(code);btn.textContent='Copied!';}catch(e){btn.textContent=code;}setTimeout(()=>{btn.textContent=old;},1600);}
$('copyBtn').onclick=e=>{const code=CV&&CV.code||joinCode;if(J.invite&&code)J.invite(code,'poker');else copyCode(e.currentTarget);};
$('wbCopy').onclick=e=>{const code=CV&&CV.code||joinCode;if(J.invite&&code)J.invite(code,'poker');else copyCode(e.currentTarget);};
let leaveArm=0;
$('leaveBtn').onclick=()=>{const b=$('leaveBtn');if(mode==='host'&&G&&G.started&&Date.now()-leaveArm>3000){leaveArm=Date.now();b.textContent='Tap again to close room';b.classList.add('warn');setTimeout(()=>{b.textContent='Leave';b.classList.remove('warn');},3000);return;}b.textContent='Leave';b.classList.remove('warn');leaveTable();};

/* Dock */
function openDock(){$('chatNotifs').innerHTML='';const d=$('dock');d.style.removeProperty('--dy');d.style.removeProperty('--dx');d.classList.add('open');$('dockBg').hidden=false;setTab(drawerTab);
  unread=0;$('chatDot').hidden=true;
  if(!J.store.get('jj-dockhint')&&!matchMedia('(min-width:1180px)').matches){J.store.set('jj-dockhint','1');setTimeout(()=>J.current==='poker'&&J.toast('<span class="t-ic">👆</span><span><b>Swipe the chat away</b><br>Drag the top bar down to close or up for full screen. Swipe sideways to close too.</span>','',4200),400);}}
function closeDock(){const d=$('dock');d.classList.remove('open','full');d.style.removeProperty('--dy');d.style.removeProperty('--dx');$('dockBg').hidden=true;$('chatIn').blur();}
/* Drag the chat: on a phone held upright it is a bottom sheet (down closes, up = full screen);
   held sideways it is a side panel (swipe right closes). Left/right swipes also close the bottom sheet. */
(()=>{
  const d=$('dock');let st=null;
  const sheet=()=>matchMedia('(max-width:760px) and (orientation:portrait),(max-width:560px)').matches;
  const side=()=>!sheet()&&!matchMedia('(min-width:1180px)').matches;
  d.addEventListener('pointerdown',e=>{
    if(!d.classList.contains('open')||e.button>0)return;
    const onHead=e.target.closest('.dock-head,.dock-grab');const body=$('tabChat');
    if(e.target.closest('input,button,.chat-form,.quick')&&!onHead)return;
    if(!onHead&&!(sheet()&&body.scrollTop<=0)&&!side())return;
    st={x:e.clientX,y:e.clientY,id:e.pointerId,t:performance.now(),mode:null,head:!!onHead};
  });
  d.addEventListener('pointermove',e=>{
    if(!st||e.pointerId!==st.id)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
    if(!st.mode){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
      if(sheet())st.mode=Math.abs(dx)>Math.abs(dy)*1.3?'x':(dy>0||st.head?'y':null);else st.mode=dx>0&&Math.abs(dx)>Math.abs(dy)?'x':null;
      if(!st.mode){st=null;return;}d.classList.add('drag');try{d.setPointerCapture(e.pointerId);}catch(_){}}
    e.preventDefault();
    if(st.mode==='y'){const v=d.classList.contains('full')?Math.max(0,dy):Math.max(dy<0?dy*.35:dy,-80);d.style.setProperty('--dy',v+'px');d.style.opacity='';}
    else{if(sheet()){d.style.setProperty('--dy','0px');d.style.translate=dx+'px 0';d.style.opacity=String(Math.max(.25,1-Math.abs(dx)/400));}else d.style.setProperty('--dx',Math.max(0,dx)+'px');}
  });
  const end=e=>{
    if(!st||e.pointerId!==st.id)return;const dx=e.clientX-st.x,dy=e.clientY-st.y,dt=performance.now()-st.t,mode=st.mode;st=null;
    d.classList.remove('drag');
    if(!mode)return;
    const fast=dt<260;
    if(mode==='y'){
      if(dy>110||(fast&&dy>40)){if(d.classList.contains('full')&&dy<220&&!fast){d.classList.remove('full');d.style.removeProperty('--dy');}else closeDock();}
      else if(dy<-50){d.classList.add('full');d.style.removeProperty('--dy');}
      else d.style.removeProperty('--dy');
    }else{
      const far=Math.abs(dx)>110||(fast&&Math.abs(dx)>45);
      if(sheet()){if(far){d.style.transition='translate .25s ease,opacity .25s ease';d.style.translate=(dx>0?'110%':'-110%')+' 0';d.style.opacity='0';setTimeout(()=>{d.style.transition='';d.style.translate='';d.style.opacity='';closeDock();},240);}else{d.style.transition='translate .25s ease,opacity .25s ease';d.style.translate='';d.style.opacity='';setTimeout(()=>d.style.transition='',260);}}
      else{if(far&&dx>0)closeDock();else d.style.removeProperty('--dx');}
    }
  };
  d.addEventListener('pointerup',end);d.addEventListener('pointercancel',end);
})();
function setTab(tab){drawerTab=tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));$('tabChat').hidden=tab!=='chat';$('tabHist').hidden=tab!=='hist';$('chatForm').hidden=tab!=='chat';$('quick').hidden=tab!=='chat';if(tab==='chat'){unread=0;$('chatDot').hidden=true;const b=$('tabChat');b.scrollTop=b.scrollHeight;}}
const wide=()=>matchMedia('(min-width:1180px)').matches;
function setDockOff(v){S.dockOff=!!v;J.saveS();$('game').classList.toggle('dock-off',S.dockOff);if(!S.dockOff){unread=0;$('chatDot').hidden=true;}requestAnimationFrame(()=>{fitTable();if(CV){const pv=PV;PV=null;renderAll(true);PV=pv;}});}
$('game').classList.toggle('dock-off',!!S.dockOff);
$('dockMin').onclick=()=>setDockOff(true);
$('chatBtn').onclick=()=>{if(wide()){setDockOff(false);setTab('chat');}else openDock();};$('dockClose').onclick=closeDock;$('dockBg').onclick=closeDock;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('quick').innerHTML=QUICK.map(q=>`<button type="button">${esc(q)}</button>`).join('');
$('quick').onclick=e=>{const b=e.target.closest('button');if(b)sendChat(b.textContent);};
$('chatForm').onsubmit=e=>{e.preventDefault();sendChat($('chatIn').value);$('chatIn').value='';};

/* Options modal */
function syncOpts(){document.querySelectorAll('#mOpts [data-opt]').forEach(g=>{const key=g.dataset.opt;g.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(String(S[key]||0)===b.dataset.v)));});$('optLvl').hidden=!S.tour;}
document.querySelectorAll('#mOpts [data-opt] button').forEach(b=>b.onclick=()=>{S[b.parentElement.dataset.opt]=Number(b.dataset.v);J.saveS();syncOpts();});
function openOpts(kind){optMode=kind;$('optsTitle').textContent=kind==='host'?'Room settings':'Bot game';$('optBots').hidden=kind==='host';$('oRit').checked=S.rit!==false;$('oB72').checked=S.b72!==false;$('optSpeed').hidden=kind==='host';$('optGo').textContent=kind==='host'?'Create room':'Deal me in';syncOpts();J.openModal('mOpts');}
$('optGo').onclick=()=>{J.closeModals();homeMsg('');S.rit=$('oRit').checked;S.b72=$('oB72').checked;J.saveS();const o={blinds:S.blinds,start:S.start,bots:S.bots,speed:S.speed,rit:S.rit,b72:S.b72,tour:!!S.tour,lvlMin:S.lvlMin||4};if(optMode==='host')hostTable(null,o);else startPractice(o);};
$('createBtn').onclick=()=>openOpts('host');
$('botBtn').onclick=()=>openOpts('bots');
$('resumeBtn').onclick=()=>{const s=readSave();if(!s){const sj=savedJoin();if(sj&&net==='ok')return joinTable(sj.code);return renderHome();}if(s.mode==='host')hostTable(s);else{mode='practice';restore(s);showGame();resumeFlow();}};
$('joinForm').onsubmit=e=>{e.preventDefault();homeMsg('');joinTable($('codeIn').value,null);};

document.addEventListener('keydown',e=>{
  if(J.current!=='poker')return;
  if(e.key==='Escape'){if(sheetOpen){closeSheet();return;}closeDock();$('memePop').hidden=true;return;}
  if(e.metaKey||e.ctrlKey||e.altKey||J.anyModal())return;
  const k=e.key.toLowerCase();
  if(sheetOpen){if(k==='enter'){e.preventDefault();$('rConfirm').click();}return;}
  if(e.target&&e.target.tagName==='INPUT')return;
  if(k==='n'&&!$('nextRow').hidden){$('bNext').click();return;}
  if(!myTurn())return;
  if(k==='f')bFold.click();else if(k==='c')bCall.click();else if(k==='r'&&!bRaise.disabled)bRaise.click();
});
J.onSettings(()=>{if(J.current==='poker'&&CV)renderAll(true);});

/* Ticks */
let tickN=0;
setInterval(()=>{
  tickN++;
  if((mode==='host'||mode==='practice')&&G&&G.started&&!G.handOver&&G.acting>=0){const p=G.players[G.acting],now=Date.now();if(p.kind!=='bot'){if(p.gone&&now-p.goneAt>GONE_GRACE&&now-G.turnStart>1500)autoAct(G.acting);else if(now-G.turnStart>(G.turnMs||20000))autoAct(G.acting);}}
  if(mode==='host'&&tickN%3===0)broadcast();
  if(mode==='client'){if(pend&&Date.now()-pend.at>1500)pushAct();if(tickN%2===0&&(!CV||mySeat<0)&&!(CV&&CV.p.every(p=>p.k!=='e')))sendSit();}
  if(J.current==='poker')renderControls();
},1000);
setInterval(updateRing,200);

const netL=[];
J.net={room:()=>room,state:()=>net,peer:()=>myPeer,pub:()=>myPub,seal,unseal,onChange:f=>netL.push(f),join:(code,peer)=>joinTable(code,peer),code:()=>(CV&&CV.code)||joinCode||(G&&G.code)||''};
J._pk={refresh:()=>showHost(),hostChat:(a,b)=>hostChat(a,b),showdown:()=>showdown(),distribute,buildPots,eval7,describe,getG:()=>G,applyBounty,is72};
/* Boot */
renderHome();initKeys();
(async()=>{
  const ok=window.claude&&typeof window.claude.use==='function';
  if(!ok){net='none';renderHome();netL.forEach(f=>{try{f()}catch(e){}});return;}
  try{
    const [r,u]=await Promise.all([window.claude.use('room'),window.claude.use('user').catch(()=>null)]);
    if(u&&!$('nick').value){try{const m=await u.me();if(m&&m.name){$('nick').value=cleanName(m.name.split(' ')[0]);J.renderMyAv&&J.renderMyAv();}}catch(e){}}
    if(!r){net='none';renderHome();return;}
    room=r;net='ok';
    room.onPeers(ch=>{for(const p of ch.peers)if(p.sameTab)myPeer=p.peer;renderHome();netL.forEach(f=>{try{f()}catch(e){}});},()=>{net='none';room=null;renderHome();netL.forEach(f=>{try{f()}catch(e){}});});
    renderHome();netL.forEach(f=>{try{f()}catch(e){}});
  }catch(e){net='none';renderHome();}
})();
})();
