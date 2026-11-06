/* JJ POKER — King's Cup: a pass-the-phone party drinking game.
   Cards sit in a ring around the cup. Tap one, read its rule out loud, pass the phone on.
   Whoever draws the 4th king drinks the cup. Any drink works: water, juice, soda. */
(() => {
'use strict';
const J = window.JJ, {$, esc, SFX} = J;
const L = () => (window.JJ_I18N && JJ_I18N.lang) || 'en';
const RANKS = {14:'A',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'J',12:'Q',13:'K'};
// Default rules [title, description] per language
const RULES = {
  en: {14:['Waterfall','Everyone starts drinking. You can only stop when the person on your right stops. You stop first.'],2:['You','Pick someone to drink.'],3:['Me','You drink.'],4:['Floor','Everyone touch the floor! Last one drinks.'],5:['Guys','All the guys drink.'],6:['Girls','All the girls drink.'],7:['Heaven','Everyone point up! Last one drinks.'],8:['Mate','Pick a mate. Whenever you drink, they drink too, until someone else draws an 8.'],9:['Rhyme','Say a word. Go around the circle rhyming with it. First to fail drinks.'],10:['Categories','Pick a category. Go around naming things in it. First to fail drinks.'],11:['Make a rule','Make a rule everyone must follow. Break it, drink.'],12:['Question master','You are the question master. Anyone who answers your questions drinks.'],13:["King's cup",'Pour some of your drink into the cup. The 4th king drinks it all!']},
  ko: {14:['폭포','모두 마시기 시작해요. 오른쪽 사람이 멈춰야 나도 멈출 수 있어요. 카드를 뽑은 사람이 먼저 멈춰요.'],2:['너','마실 사람을 지목하세요.'],3:['나','내가 마셔요.'],4:['바닥','모두 바닥을 짚어요! 꼴찌가 마셔요.'],5:['남자','남자들 모두 마셔요.'],6:['여자','여자들 모두 마셔요.'],7:['천국','모두 손가락으로 하늘을! 꼴찌가 마셔요.'],8:['짝꿍','짝꿍을 고르세요. 누가 8을 뽑을 때까지 내가 마시면 짝꿍도 마셔요.'],9:['라임','단어를 말하고 돌아가며 운을 맞춰요. 못 하면 마셔요.'],10:['카테고리','주제를 정하고 돌아가며 말해요. 못 하면 마셔요.'],11:['규칙 만들기','모두가 지켜야 할 규칙을 만들어요. 어기면 마셔요.'],12:['질문왕','내가 질문왕! 내 질문에 대답하는 사람은 마셔요.'],13:['킹스컵','내 술을 컵에 조금 부어요. 4번째 킹을 뽑은 사람이 다 마셔요!']},
  zh: {14:['瀑布','所有人一起开始喝。右边的人停了你才能停，抽牌的人先停。'],2:['你','指定一个人喝。'],3:['我','自己喝。'],4:['摸地','所有人摸地板！最后一个喝。'],5:['男生','所有男生喝。'],6:['女生','所有女生喝。'],7:['天堂','所有人手指向天！最后一个喝。'],8:['伙伴','选一个伙伴。你喝他也喝，直到有人抽到8。'],9:['押韵','说一个词，大家轮流押韵。接不上的喝。'],10:['分类','选一个类别，轮流说出属于它的东西。说不出的喝。'],11:['定规则','定一条大家必须遵守的规则。违反就喝。'],12:['问题大师','你是问题大师。谁回答你的问题谁就喝。'],13:['国王杯','往中间的杯子里倒一点你的酒。抽到第4张K的人全部喝掉！']},
  id: {14:['Air terjun','Semua mulai minum. Kamu baru boleh berhenti kalau orang di kananmu berhenti. Kamu berhenti duluan.'],2:['Kamu','Tunjuk seseorang untuk minum.'],3:['Aku','Kamu minum.'],4:['Lantai','Semua sentuh lantai! Yang terakhir minum.'],5:['Cowok','Semua cowok minum.'],6:['Cewek','Semua cewek minum.'],7:['Surga','Semua tunjuk ke atas! Yang terakhir minum.'],8:['Pasangan','Pilih pasangan. Setiap kamu minum, dia ikut minum, sampai ada yang dapat 8.'],9:['Rima','Sebut satu kata. Bergiliran cari kata yang berima. Yang gagal minum.'],10:['Kategori','Pilih kategori. Bergiliran sebut isinya. Yang gagal minum.'],11:['Buat aturan','Buat aturan yang harus diikuti semua. Melanggar, minum.'],12:['Raja tanya','Kamu raja tanya. Siapa pun yang menjawab pertanyaanmu minum.'],13:['Cangkir raja','Tuang sedikit minumanmu ke cangkir. Raja ke-4 minum semuanya!']},
};
const UI = {
  en:{yourTurn:'{n}, your turn',dragHint:'Drag a card to the cup, or tap one',passTo:'Pass the phone to',tapReady:'Tap when you have it',last:'Last cards',title:"King's Cup",sub:'Pass the phone. Tap a card. Do what it says.',turn:'{n}, tap a card',drew:'{n} drew',kings:'Kings',left:'cards left',players:'Players',add:'Add',start:'Start',newg:'New game',rules:'Rules',mates:'Mates',active:'Rules in play',qm:'Question master',none:'Nothing yet',idea:'Need an idea?',cupT:"KING'S CUP!",cupS:'{n} drinks the cup!',done:'Deck finished',doneS:'That was the last card. Shuffle up for another round?',namePh:'Player name',rulePh:'Type the new rule…',save:'Save',pickMate:'Pick your mate',edit:'Edit rules',reset:'Reset to classic',note:'For adults of legal drinking age. Any drink works: water, juice or soda. Know your limits, and never drink and drive.',next:'Next player',skip:'Pass',min:'Add at least 2 players',ready:'Done',kingN:'King {k} of 4'},
  ko:{yourTurn:'{n} 님 차례',dragHint:'카드를 컵으로 끌어오거나 누르세요',passTo:'폰을 넘겨주세요',tapReady:'받았으면 누르세요',last:'최근 카드',title:'킹스컵',sub:'폰을 돌려요. 카드를 누르고, 적힌 대로 하세요.',turn:'{n}, 카드를 누르세요',drew:'{n} 님이 뽑은 카드',kings:'킹',left:'장 남음',players:'플레이어',add:'추가',start:'시작',newg:'새 게임',rules:'규칙',mates:'짝꿍',active:'진행 중인 규칙',qm:'질문왕',none:'아직 없어요',idea:'아이디어가 필요해요?',cupT:'킹스컵!',cupS:'{n} 님이 컵을 마셔요!',done:'덱을 다 썼어요',doneS:'마지막 카드였어요. 한 판 더 할까요?',namePh:'이름',rulePh:'새 규칙을 입력하세요…',save:'저장',pickMate:'짝꿍을 고르세요',edit:'규칙 편집',reset:'기본 규칙으로',note:'법적 음주 가능 연령의 성인만. 물, 주스, 탄산음료도 OK. 적당히 마시고, 음주운전은 절대 안 돼요.',next:'다음 사람',skip:'넘기기',min:'플레이어를 2명 이상 추가하세요',ready:'완료',kingN:'킹 {k} / 4'},
  zh:{yourTurn:'轮到 {n}',dragHint:'把一张牌拖到杯子上，或直接点',passTo:'把手机交给',tapReady:'拿到后点一下',last:'最近的牌',title:'国王杯',sub:'手机传下去。点一张牌，照着做。',turn:'{n}，点一张牌',drew:'{n} 抽到了',kings:'K',left:'张剩余',players:'玩家',add:'添加',start:'开始',newg:'新游戏',rules:'规则',mates:'伙伴',active:'当前规则',qm:'问题大师',none:'暂无',idea:'需要灵感？',cupT:'国王杯！',cupS:'{n} 喝掉整杯！',done:'牌抽完了',doneS:'这是最后一张。再来一局？',namePh:'玩家名字',rulePh:'输入新规则…',save:'保存',pickMate:'选你的伙伴',edit:'编辑规则',reset:'恢复经典规则',note:'仅限达到法定饮酒年龄的成年人。水、果汁、汽水都可以。适量饮酒，酒后不开车。',next:'下一位',skip:'跳过',min:'至少添加2名玩家',ready:'完成',kingN:'第 {k} 张K（共4张）'},
  id:{yourTurn:'Giliran {n}',dragHint:'Seret kartu ke cangkir, atau ketuk',passTo:'Oper ponselnya ke',tapReady:'Ketuk kalau sudah pegang',last:'Kartu terakhir',title:'Cangkir Raja',sub:'Oper ponselnya. Ketuk kartu. Lakukan perintahnya.',turn:'{n}, ketuk satu kartu',drew:'{n} mendapat',kings:'Raja',left:'kartu tersisa',players:'Pemain',add:'Tambah',start:'Mulai',newg:'Permainan baru',rules:'Aturan',mates:'Pasangan',active:'Aturan berlaku',qm:'Raja tanya',none:'Belum ada',idea:'Butuh ide?',cupT:'CANGKIR RAJA!',cupS:'{n} minum cangkirnya!',done:'Kartu habis',doneS:'Itu kartu terakhir. Main lagi?',namePh:'Nama pemain',rulePh:'Tulis aturan baru…',save:'Simpan',pickMate:'Pilih pasanganmu',edit:'Ubah aturan',reset:'Kembali ke klasik',note:'Untuk orang dewasa yang sudah cukup umur. Minuman apa pun boleh: air, jus, soda. Kenali batasmu, dan jangan menyetir setelah minum.',next:'Pemain berikutnya',skip:'Lewati',min:'Tambahkan minimal 2 pemain',ready:'Selesai',kingN:'Raja {k} dari 4'},
};
const IDEAS = {
  en:{cat:['Beer brands','Car brands','K-pop groups','Pokémon','Football clubs','Things in a kitchen','Countries in Asia','Pizza toppings','Disney movies','Fast food chains','Phone brands','Animals in the zoo','Cocktails','Superheroes','Things that are red','Video games'],rhyme:['cat','night','cup','play','bear','king','drink','fun','card','beat'],rule:['No saying "drink"','Speak in an accent','No first names','Drink with your left hand only','No pointing','End every sentence with "bro"','Salute before you drink','No phones on the table']},
  ko:{cat:['맥주 브랜드','자동차 브랜드','K-pop 그룹','포켓몬','축구팀','부엌에 있는 물건','아시아 나라','피자 토핑','디즈니 영화','편의점 간식','휴대폰 브랜드','동물원 동물','소주 안주','슈퍼히어로','빨간 것들','게임'],rhyme:['사랑','바다','하늘','친구','고양이','노래'],rule:['"마셔" 금지','존댓말만 쓰기','이름 부르기 금지','왼손으로만 마시기','손가락질 금지','문장 끝에 "냥" 붙이기','마시기 전에 경례','폰 테이블에 올리기 금지']},
  zh:{cat:['啤酒品牌','汽车品牌','K-pop组合','宝可梦','足球俱乐部','厨房里的东西','亚洲国家','披萨配料','迪士尼电影','快餐品牌','手机品牌','动物园的动物','鸡尾酒','超级英雄','红色的东西','电子游戏'],rhyme:['花','天','月','心','酒','风'],rule:['不许说“喝”','只能用方言说话','不许叫名字','只能用左手喝','不许用手指人','每句话结尾加“哦”','喝之前先敬礼','手机不许放桌上']},
  id:{cat:['Merek bir','Merek mobil','Grup K-pop','Pokémon','Klub sepak bola','Barang di dapur','Negara di Asia','Topping pizza','Film Disney','Restoran cepat saji','Merek ponsel','Hewan di kebun binatang','Makanan Indonesia','Superhero','Benda warna merah','Video game'],rhyme:['kucing','malam','minum','main','kartu','raja'],rule:['Dilarang bilang "minum"','Bicara pakai logat','Dilarang sebut nama','Minum pakai tangan kiri','Dilarang menunjuk','Akhiri kalimat dengan "bro"','Hormat dulu sebelum minum','Ponsel tidak boleh di meja']},
};
const t = (k, v) => { let s = (UI[L()] || UI.en)[k] || UI.en[k]; if (v) for (const x in v) s = s.replace('{' + x + '}', v[x]); return s; };
const AV_BG = ['#ff8a6b','#ffc83d','#22c995','#6fdcff','#b994ff','#ff9bb3','#8fb0ff','#c8e86b','#ffb347','#5ee3c5','#ff7aa8','#9fd49a'];

const K = {
  players: [], turn: 0, deck: [], drawn: [], kings: 0, mates: [], rules: [], qm: -1, started: false, custom: {}, last: null,
};
try { const s = JSON.parse(J.store.get('jj-kc') || '{}'); if (Array.isArray(s.players)) K.players = s.players.slice(0, 12); if (s.custom && typeof s.custom === 'object') K.custom = s.custom; } catch (e) {}
const saveK = () => J.store.set('jj-kc', JSON.stringify({players: K.players, custom: K.custom}));
const rule = r => { const c = K.custom[r]; const d = (RULES[L()] || RULES.en)[r]; return c && (c[0] || c[1]) ? [c[0] || d[0], c[1] || d[1]] : d; };
const pname = i => K.players[i] || '—';
const avatar = i => J.avatarSVG('kc|' + pname(i), false);

/* ---------- deck & ring ---------- */
function newDeck() {
  const d = []; for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) d.push({r, s, id: r * 4 + s});
  K.deck = J.shuffle(d).map((c, i) => ({...c, slot: i, gone: false})); K.drawn = []; K.kings = 0; K.mates = []; K.rules = []; K.qm = -1; K.last = null;
}
function ringHTML() {
  const n = K.deck.length;
  return K.deck.map((c, i) => {
    const a = (i / n) * 360 - 90, wob = ((c.id * 37) % 11) - 5;
    return `<button type="button" class="kc-c${c.gone ? ' gone' : ''}" data-i="${i}" style="--a:${a}deg;--w:${wob}deg;--d:${(i * 12) % 600}ms" aria-label="Card ${i + 1}"${c.gone ? ' tabindex="-1" disabled' : ''}><span class="card back"></span></button>`;
  }).join('');
}
function render() {
  $('kcRing').innerHTML = ringHTML();
  $('kcCup').style.setProperty('--fill', String(K.kings / 4));
  $('kcKings').innerHTML = [0, 1, 2, 3].map(k => `<i class="${k < K.kings ? 'on' : ''}">♚</i>`).join('');
  $('kcLeft').textContent = `${K.deck.filter(c => !c.gone).length} ${t('left')}`;
  renderTurn(); renderSide();
}
function renderTurn() {
  const i = K.turn % Math.max(1, K.players.length);
  $('kcTTav').innerHTML = avatar(i); $('kcTTname').textContent = t('yourTurn', {n: pname(i)}); $('kcTThint').textContent = t('dragHint');
  const tt = $('kcTT'); tt.classList.remove('bump'); void tt.offsetWidth; tt.classList.add('bump');
  $('kcTurnAv').innerHTML = avatar(i); $('kcTurnName').textContent = t('turn', {n: pname(i)});
  $('kcPlayersRow').innerHTML = K.players.map((p, k) => `<span class="kc-p${k === i ? ' on' : ''}${k === K.qm ? ' qm' : ''}" title="${esc(p)}"><span class="av">${avatar(k)}</span><b>${esc(p)}</b></span>`).join('');
  const on = $('kcPlayersRow').querySelector('.on'); if (on) on.scrollIntoView({block: 'nearest', inline: 'center', behavior: J.animOn() ? 'smooth' : 'auto'});
}
function renderSide() {
  const mates = K.mates.length ? K.mates.map(m => `<li>🤝 ${esc(pname(m[0]))} &amp; ${esc(pname(m[1]))}</li>`).join('') : `<li class="none">${t('none')}</li>`;
  const rules = K.rules.length ? K.rules.map(r => `<li>📜 ${esc(r)}</li>`).join('') : `<li class="none">${t('none')}</li>`;
  const hist = K.drawn.slice(-6).reverse().map((c, k) => `<span class="kc-hc${k === 0 ? ' new' : ''}">${J.cardFace(c, {})}</span>`).join('');
  $('kcSide').innerHTML = `<div class="kc-hist"><h4>${t('last')}</h4><div class="kc-hrow">${hist || `<span class="none">${t('none')}</span>`}</div></div><div><h4>${t('mates')}</h4><ul>${mates}</ul></div><div><h4>${t('active')}</h4><ul>${rules}</ul></div><div><h4>${t('qm')}</h4><ul>${K.qm >= 0 ? `<li>❓ ${esc(pname(K.qm))}</li>` : `<li class="none">${t('none')}</li>`}</ul></div>`;
}

/* ---------- drawing ---------- */
let busy = false;
function draw(i, from) {
  if (busy || !K.started) return; const c = K.deck[i]; if (!c || c.gone) return;
  busy = true; c.gone = true; K.drawn.push(c);
  const who = K.turn % K.players.length;
  const btn = $('kcRing').querySelector(`[data-i="${i}"]`);
  SFX.card(0); J.buzz && J.buzz(15);
  const r = btn.getBoundingClientRect();const origin = from || {x: r.left + r.width / 2, y: r.top + r.height / 2};
  btn.classList.add('gone'); btn.disabled = true;
  if (c.r === 13) K.kings++;
  K.last = {c, who};
  showCard(c, who, true, origin);
  if (c.r === 12) K.qm = who;
  renderSide();
  $('kcLeft').textContent = `${K.deck.filter(x => !x.gone).length} ${t('left')}`;
  if (c.r === 13) { $('kcCup').style.setProperty('--fill', String(K.kings / 4)); $('kcKings').innerHTML = [0, 1, 2, 3].map(k => `<i class="${k < K.kings ? 'on' : ''}">♚</i>`).join(''); }
  setTimeout(() => { busy = false; }, 450);
}
function showCard(c, who, fresh, origin) {
  const [title, desc] = rule(c.r);
  const isCup = c.r === 13 && K.kings >= 4;
  const ov = $('kcShow'); ov.hidden = false; ov.classList.toggle('cup', isCup); ov.classList.remove('in'); void ov.offsetWidth; ov.classList.add('in');
  $('kcBig').innerHTML = J.cardFace(c, {});ov.dataset.r = c.r;
  const fly = $('kcFly');
  if (origin) { fly.style.animation = 'none'; const br = fly.getBoundingClientRect(); fly.style.setProperty('--fx', (origin.x - (br.left + br.width / 2)) + 'px'); fly.style.setProperty('--fy', (origin.y - (br.top + br.height / 2)) + 'px'); void fly.offsetWidth; fly.style.animation = ''; }
  else { fly.style.setProperty('--fx', '0px'); fly.style.setProperty('--fy', '0px'); }
  $('kcWho').innerHTML = `<span class="av">${avatar(who)}</span>${esc(t('drew', {n: pname(who)}))}`;
  $('kcTitle').textContent = isCup ? t('cupT') : title;
  $('kcDesc').textContent = isCup ? t('cupS', {n: pname(who)}) : desc;
  $('kcKingN').hidden = c.r !== 13; $('kcKingN').textContent = t('kingN', {k: K.kings});
  // extra tools for some cards
  let ex = '';
  if (c.r === 8 && K.players.length > 1) ex = `<p class="kc-ex-t">${t('pickMate')}</p><div class="kc-mates">${K.players.map((p, k) => k === who ? '' : `<button type="button" class="kc-chip" data-mate="${k}"><span class="av">${avatar(k)}</span>${esc(p)}</button>`).join('')}</div>`;
  if (c.r === 11) ex = `<div class="kc-rule"><input type="text" id="kcRuleIn" maxlength="60" placeholder="${esc(t('rulePh'))}"><button class="btn btn-raise btn-sm" type="button" id="kcRuleSave">${t('save')}</button></div><button type="button" class="link-btn kc-idea" data-idea="rule">💡 ${t('idea')}</button>`;
  if (c.r === 10) ex = `<button type="button" class="link-btn kc-idea" data-idea="cat">💡 ${t('idea')}</button>`;
  if (c.r === 9) ex = `<button type="button" class="link-btn kc-idea" data-idea="rhyme">💡 ${t('idea')}</button>`;
  $('kcExtra').innerHTML = ex;
  $('kcNext').textContent = t('next');
  if (fresh) {
    SFX.flip(.12); J.buzz && J.buzz(isCup ? [40, 60, 40, 60, 120] : 20);
    if (isCup) { SFX.fight(); setTimeout(() => { SFX.boom(); J.confetti(); const rr = $('kcBig').getBoundingClientRect(); J.burst(rr.left + rr.width / 2, rr.top + rr.height / 2, ['🍺', '👑', '💦', '🎉'], 26, {dist: 240, size: 34, dur: 1600}); }, 380); J.unlock && J.unlock('kc_cup'); }
    else if (c.r === 13) { SFX.splat(); }
    else if (c.r === 14 || c.r === 4 || c.r === 7) { SFX.whoosh(); }
    else SFX.pop();
  }
}
function nextTurn() {
  $('kcShow').hidden = true;
  const left = K.deck.filter(c => !c.gone).length;
  if (K.kings >= 4 || left === 0) { endGame(); return; }
  K.turn = (K.turn + 1) % K.players.length; renderTurn(); renderSide();
  showPass();
}
let passT = 0;
function showPass() {
  const i = K.turn % K.players.length, el = $('kcPass');
  $('kcPassAv').innerHTML = avatar(i); $('kcPassName').textContent = pname(i);
  $('kcPassTo').textContent = t('passTo'); $('kcPassTap').textContent = t('tapReady');
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); SFX.whoosh();
  clearTimeout(passT); passT = setTimeout(hidePass, 2600);
}
function hidePass() { clearTimeout(passT); const el = $('kcPass'); if (el.hidden) return; el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, 220); }
$('kcPass').addEventListener('click', hidePass);
function endGame() {
  K.started = false;
  $('kcEnd').hidden = false;
  $('kcEndT').textContent = K.kings >= 4 ? t('cupT') : t('done');
  $('kcEndS').textContent = K.kings >= 4 ? t('cupS', {n: pname(K.last ? K.last.who : 0)}) : t('doneS');
}
function startGame() {
  if (K.players.length < 2) { $('kcSetupMsg').textContent = t('min'); return; }
  J.closeModals(); newDeck(); K.turn = 0; K.started = true; $('kcEnd').hidden = true; $('kcPass').hidden = true; render();
  const ring = $('kcRing'); ring.classList.remove('dealt'); void ring.offsetWidth; ring.classList.add('dealt');
  for (let k = 0; k < 8; k++) SFX.card(k * .06);
  J.stat && J.stat('kcGames');
}

/* ---------- setup ---------- */
function renderSetup() {
  $('kcList').innerHTML = K.players.map((p, i) => `<li><span class="av" style="background:${AV_BG[i % AV_BG.length]}">${avatar(i)}</span><b>${esc(p)}</b><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remove ${esc(p)}"><svg><use href="#i-close"/></svg></button></li>`).join('');
  $('kcSetupMsg').textContent = K.players.length < 2 ? t('min') : '';
  $('kcGo').disabled = K.players.length < 2;
}
function addPlayer() {
  const v = J.cleanName($('kcName').value); if (!v || K.players.length >= 12) return;
  K.players.push(v); $('kcName').value = ''; saveK(); renderSetup(); SFX.pop(); $('kcName').focus();
}
$('kcAdd').onclick = addPlayer;
$('kcName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addPlayer(); } });
$('kcList').onclick = e => { const b = e.target.closest('[data-rm]'); if (!b) return; K.players.splice(Number(b.dataset.rm), 1); saveK(); renderSetup(); };
$('kcGo').onclick = startGame;
function openSetup() {
  if (!K.players.length) { const me = J.nick(); if (me) K.players.push(me); }
  renderSetup(); J.openModal('mKC');
}

/* ---------- rules editor ---------- */
function renderRulesEd() {
  const ranks = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  $('kcRulesList').innerHTML = ranks.map(r => { const [a, b] = rule(r); return `<li><span class="kc-rk">${RANKS[r]}</span><input type="text" data-r="${r}" data-f="0" maxlength="24" value="${esc(a)}" aria-label="${RANKS[r]} title"><textarea data-r="${r}" data-f="1" maxlength="140" rows="2" aria-label="${RANKS[r]} rule">${esc(b)}</textarea></li>`; }).join('');
}
$('kcRulesList').addEventListener('input', e => {
  const el = e.target.closest('[data-r]'); if (!el) return; const r = el.dataset.r, f = Number(el.dataset.f);
  const cur = K.custom[r] || ['', '']; cur[f] = el.value.slice(0, f ? 140 : 24); K.custom[r] = cur; saveK();
});
$('kcReset').onclick = () => { K.custom = {}; saveK(); renderRulesEd(); SFX.pop(); };

/* ---------- table wiring ---------- */
/* Tap a card, or drag it out of the ring: let go anywhere past a short distance and it flips. */
let drag = null, justDragged = false;
$('kcRing').addEventListener('click', e => { if (justDragged) return; const b = e.target.closest('.kc-c'); if (b) draw(Number(b.dataset.i)); });
$('kcRing').addEventListener('pointerdown', e => {
  const b = e.target.closest('.kc-c'); if (!b || b.disabled || busy || !K.started || !$('kcPass').hidden) return;
  drag = {b, i: Number(b.dataset.i), x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null};
});
window.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.ghost) {
    if (Math.hypot(dx, dy) < 8) return;
    const tb = $('kcTable'), r = drag.b.getBoundingClientRect(), tr = tb.getBoundingClientRect();
    const g = document.createElement('div'); g.className = 'kc-ghost'; g.innerHTML = '<span class="card back"></span>';
    g.style.width = drag.b.offsetWidth + 'px'; g.style.setProperty('--cw', drag.b.offsetWidth + 'px'); tb.appendChild(g); drag.ghost = g; drag.tr = tr; drag.b.classList.add('lift'); SFX.card(0);
    drag.off = {x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2)};
  }
  e.preventDefault();
  const g = drag.ghost, tr = drag.tr, cx = e.clientX - tr.left - drag.off.x, cy = e.clientY - tr.top - drag.off.y;
  const dist = Math.hypot(dx, dy), tilt = Math.max(-25, Math.min(25, dx / 6));
  g.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${tilt}deg) scale(${1 + Math.min(.35, dist / 500)})`;
  const cup = $('kcCup').getBoundingClientRect(); const near = e.clientX > cup.left - 20 && e.clientX < cup.right + 20 && e.clientY > cup.top - 20 && e.clientY < cup.bottom + 20;
  $('kcTable').classList.toggle('drop-near', dist > 40); $('kcCup').classList.toggle('hot', near);
}, {passive: false});
const endDrag = e => {
  if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null;
  $('kcTable').classList.remove('drop-near'); $('kcCup').classList.remove('hot');
  if (!d.ghost) return;
  justDragged = true; setTimeout(() => { justDragged = false; }, 60);
  const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
  const gr = d.ghost.getBoundingClientRect(); d.ghost.remove(); d.b.classList.remove('lift');
  if (dist > 40 && e.type !== 'pointercancel') draw(d.i, {x: gr.left + gr.width / 2, y: gr.top + gr.height / 2});
};
window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);
$('kcNext').onclick = nextTurn;
$('kcShow').addEventListener('click', e => {
  const m = e.target.closest('[data-mate]');
  if (m && K.last) { const a = K.last.who, b = Number(m.dataset.mate); K.mates = K.mates.filter(x => x[0] !== a && x[1] !== a); K.mates.push([a, b]); SFX.chime(); renderSide(); nextTurn(); return; }
  const id = e.target.closest('[data-idea]');
  if (id) { const pool = (IDEAS[L()] || IDEAS.en)[id.dataset.idea]; const pick = pool[Math.floor(Math.random() * pool.length)];
    if (id.dataset.idea === 'rule') { const inp = $('kcRuleIn'); if (inp) inp.value = pick; }
    else J.toast(`<span class="t-ic">💡</span><span><b>${esc(pick)}</b></span>`, '', 2400);
    SFX.pop(); return; }
  if (e.target.closest('#kcRuleSave')) { const v = J.cleanText($('kcRuleIn').value); if (v) { K.rules.push(v.slice(0, 60)); if (K.rules.length > 6) K.rules.shift(); SFX.chime(); } renderSide(); nextTurn(); }
});
document.addEventListener('keydown', e => { if (J.current !== 'kc' || J.anyModal()) return; if (!$('kcShow').hidden && (e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); nextTurn(); } });
$('kcNew').onclick = () => openSetup();
$('kcAgain').onclick = () => { $('kcEnd').hidden = true; startGame(); };
$('kcPlayersBtn').onclick = () => openSetup();
$('kcRulesBtn').onclick = () => { renderRulesEd(); J.openModal('mKCRules'); };
J.onSettings(() => { if (J.current === 'kc') { render(); if (!$('kcShow').hidden && K.last) showCard(K.last.c, K.last.who, false); } });

function fit() { const st = $('kcStage'), tb = $('kcTable'); const W = st.clientWidth - 12, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return; const w = Math.max(240, Math.min(W, H, 760)); tb.style.width = w + 'px'; tb.style.height = w + 'px'; }
new ResizeObserver(() => { if (J.current === 'kc') fit(); }).observe($('kcStage'));
function open() {
  J.show('kc'); fit();
  if (!K.started) { newDeck(); render(); openSetup(); } else render();
}
J.registerScreen('kc', {hide() {}});
$('kcBtn').onclick = open;
$('gcKC').innerHTML = '<div class="kc-mini"><span class="kc-mcup">🍺</span>' + [0, 1, 2, 3, 4, 5].map(k => `<i style="--a:${k * 60}deg"></i>`).join('') + '</div>';
})();
