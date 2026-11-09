/* JJ POKER — Ride the Bus: a pass-the-phone drinking card game.
   1) Four guessing rounds: red/black, higher/lower, inside/outside, suit. Wrong guesses drink.
   2) The pyramid: matching cards give out sips.
   3) Whoever holds the most cards rides the bus: four right in a row to get off. */
(() => {
'use strict';
const J = window.JJ, {$, esc, SFX} = J;
const D = {
  en:{idleS:'Add your players and start a new ride.',startNew:'Start a game',title:'Ride the Bus',sub:'Guess the cards. Wrong guesses drink. The unluckiest player rides the bus.',q0:'Red or black?',q1:'Higher or lower than {c}?',q2:'Inside or outside {a} and {b}?',q3:'Which suit?',red:'Red',black:'Black',higher:'Higher',lower:'Lower',inside:'Inside',outside:'Outside',s0:'Spades',s1:'Hearts',s2:'Diamonds',s3:'Clubs',right:'Right! Give out {k} 🍺',wrong:'Wrong! Drink {k} 🍺',same:'Same card! Drink {k} 🍺',next:'Next',round:'Round {r} of 4',passTo:'Pass the phone to',tapReady:'Tap when you have it',pyrT:'The pyramid',pyrHow:'Flip the cards one by one. Holding the same number? Give out that many sips and drop the card.',flip:'Flip a card',give:'{n} gives out {k} 🍺',nobody:'Nobody has a {r}.',rowV:'Row worth {k} 🍺',rides:'{n} rides the bus!',tie:'Tie on {k} cards. The deck picked {n}.',busHow:'Four right in a row gets you off. Wrong? Drink and start again.',tryN:'Try {k}',off:'{n} got off the bus after {k} tries!',off1:'{n} got off the bus first try!',restart:'Back to the start',endT:'Ride over',sips:'sips',again:'Play again',home:'Back to home',mercy:'Let them off',left:'{k} left',pGuess:'Guessing',pPyr:'Pyramid',pBus:'The bus',most:'Most sips: {n} ({k})',turn:'{n}, your guess',toPyr:'Build the pyramid',toBus:'Board the bus',busTurn:'{n}, card {k} of 4',hold:'Cards in hand'},
  ko:{idleS:'플레이어를 추가하고 새 게임을 시작하세요.',startNew:'게임 시작',title:'버스 타기',sub:'카드를 맞혀요. 틀리면 마셔요. 제일 운 없는 사람이 버스를 타요.',q0:'빨강? 검정?',q1:'{c}보다 높다? 낮다?',q2:'{a}와 {b} 사이? 바깥?',q3:'무슨 무늬?',red:'빨강',black:'검정',higher:'높다',lower:'낮다',inside:'사이',outside:'바깥',s0:'스페이드',s1:'하트',s2:'다이아',s3:'클럽',right:'정답! {k}잔 나눠 줘요 🍺',wrong:'땡! {k}잔 마셔요 🍺',same:'같은 숫자! {k}잔 마셔요 🍺',next:'다음',round:'{r} / 4 라운드',passTo:'폰을 넘겨주세요',tapReady:'받았으면 누르세요',pyrT:'피라미드',pyrHow:'카드를 한 장씩 뒤집어요. 같은 숫자를 들고 있으면 그만큼 나눠 주고 카드를 내려놓아요.',flip:'카드 뒤집기',give:'{n} 님이 {k}잔 나눠 줘요 🍺',nobody:'{r} 가진 사람 없음.',rowV:'이 줄은 {k}잔 🍺',rides:'{n} 님이 버스를 타요!',tie:'{k}장 동점. 덱이 {n} 님을 골랐어요.',busHow:'4번 연속 맞히면 내려요. 틀리면? 마시고 처음부터.',tryN:'{k}번째 시도',off:'{n} 님이 {k}번 만에 버스에서 내렸어요!',off1:'{n} 님이 한 번에 내렸어요!',restart:'처음부터',endT:'운행 종료',sips:'잔',again:'한 판 더',home:'홈으로',mercy:'봐주기',left:'{k}장 남음',pGuess:'맞히기',pPyr:'피라미드',pBus:'버스',most:'가장 많이 마신 사람: {n} ({k})',turn:'{n} 님, 맞혀 보세요',toPyr:'피라미드 만들기',toBus:'버스 타기',busTurn:'{n}, 4장 중 {k}번째',hold:'들고 있는 카드'},
  zh:{idleS:'添加玩家，开始新的一局。',startNew:'开始游戏',title:'坐巴士',sub:'猜牌。猜错就喝。最倒霉的人要坐巴士。',q0:'红还是黑？',q1:'比 {c} 大还是小？',q2:'在 {a} 和 {b} 之间还是外面？',q3:'什么花色？',red:'红',black:'黑',higher:'大',lower:'小',inside:'之间',outside:'外面',s0:'黑桃',s1:'红心',s2:'方块',s3:'梅花',right:'对了！分出 {k} 口 🍺',wrong:'错了！喝 {k} 口 🍺',same:'一样大！喝 {k} 口 🍺',next:'下一个',round:'第 {r} 轮（共4轮）',passTo:'把手机交给',tapReady:'拿到后点一下',pyrT:'金字塔',pyrHow:'一张张翻牌。手里有同样的数字？分出那么多口，把牌放下。',flip:'翻一张',give:'{n} 分出 {k} 口 🍺',nobody:'没人有 {r}。',rowV:'这一排 {k} 口 🍺',rides:'{n} 要坐巴士！',tie:'都是 {k} 张，牌堆选了 {n}。',busHow:'连续猜对4张才能下车。错了？喝完从头来。',tryN:'第 {k} 次',off:'{n} 试了 {k} 次终于下车！',off1:'{n} 一次就下车了！',restart:'从头开始',endT:'到站了',sips:'口',again:'再来一局',home:'回到首页',mercy:'放他下车',left:'剩 {k} 张',pGuess:'猜牌',pPyr:'金字塔',pBus:'巴士',most:'喝得最多：{n}（{k}）',turn:'{n}，你来猜',toPyr:'搭金字塔',toBus:'上巴士',busTurn:'{n}，第 {k}/4 张',hold:'手里的牌'},
  id:{idleS:'Tambahkan pemain dan mulai permainan baru.',startNew:'Mulai main',title:'Naik Bus',sub:'Tebak kartunya. Salah tebak minum. Yang paling sial naik bus.',q0:'Merah atau hitam?',q1:'Lebih tinggi atau rendah dari {c}?',q2:'Di antara atau di luar {a} dan {b}?',q3:'Gambar apa?',red:'Merah',black:'Hitam',higher:'Tinggi',lower:'Rendah',inside:'Di antara',outside:'Di luar',s0:'Sekop',s1:'Hati',s2:'Wajik',s3:'Keriting',right:'Benar! Bagi {k} 🍺',wrong:'Salah! Minum {k} 🍺',same:'Sama! Minum {k} 🍺',next:'Lanjut',round:'Ronde {r} dari 4',passTo:'Oper ponselnya ke',tapReady:'Ketuk kalau sudah pegang',pyrT:'Piramida',pyrHow:'Buka kartu satu per satu. Pegang angka yang sama? Bagi teguk sebanyak itu dan buang kartunya.',flip:'Buka kartu',give:'{n} membagi {k} 🍺',nobody:'Tidak ada yang punya {r}.',rowV:'Baris ini {k} 🍺',rides:'{n} naik bus!',tie:'Seri {k} kartu. Dek memilih {n}.',busHow:'Benar 4 kali berturut-turut untuk turun. Salah? Minum dan ulang.',tryN:'Percobaan {k}',off:'{n} turun dari bus setelah {k} kali!',off1:'{n} langsung turun!',restart:'Ulang dari awal',endT:'Sampai tujuan',sips:'teguk',again:'Main lagi',home:'Kembali ke beranda',mercy:'Turunkan saja',left:'sisa {k}',pGuess:'Tebak',pPyr:'Piramida',pBus:'Bus',most:'Paling banyak minum: {n} ({k})',turn:'{n}, tebak!',toPyr:'Susun piramida',toBus:'Naik bus',busTurn:'{n}, kartu {k} dari 4',hold:'Kartu di tangan'},
};
const t = J.party.t(D);
const RL = r => ({11: 'J', 12: 'Q', 13: 'K', 14: 'A'})[r] || String(r);
const SUIT = ['♠', '♥', '♦', '♣'], RED = [0, 1, 1, 0];
const B = {on: false, players: [], deck: [], hands: [], used: [], sips: [], given: [], phase: 'idle', round: 0, p: 0, pyr: [], pyrI: 0, rider: -1, bus: [], step: 0, tries: 1, wait: false, res: null};
const av = i => J.party.avatar(B.players[i]);
const nm = i => B.players[i] || '—';
const fresh = () => { const d = []; for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) d.push({r, s, id: r * 4 + s}); return J.shuffle(d); };
const take = () => { if (!B.deck.length) B.deck = fresh(); return B.deck.pop(); };
const OPTS = [[['red', 'red'], ['black', 'black']], [['higher', 'higher'], ['lower', 'lower']], [['inside', 'inside'], ['outside', 'outside']], [['s1', '♥'], ['s0', '♠'], ['s2', '♦'], ['s3', '♣']]];

function judge(r, pick, prev, c) {
  // returns 'ok' | 'bad' | 'same'
  if (r === 0) return (RED[c.s] ? 'red' : 'black') === pick ? 'ok' : 'bad';
  if (r === 1) { if (c.r === prev[0].r) return 'same'; return (c.r > prev[0].r ? 'higher' : 'lower') === pick ? 'ok' : 'bad'; }
  if (r === 2) { const lo = Math.min(prev[0].r, prev[1].r), hi = Math.max(prev[0].r, prev[1].r); if (c.r === lo || c.r === hi) return 'same'; return ((c.r > lo && c.r < hi) ? 'inside' : 'outside') === pick ? 'ok' : 'bad'; }
  return ('s' + c.s) === pick ? 'ok' : 'bad';
}
function question(r, prev) {
  if (r === 0) return t('q0');
  if (r === 1) return t('q1', {c: RL(prev[0].r) + SUIT[prev[0].s]});
  if (r === 2) return t('q2', {a: RL(prev[0].r), b: RL(prev[1].r)});
  return t('q3');
}

/* ---------- flow ---------- */
function start(players) {
  B.players = players.slice(0, 10); B.deck = fresh(); B.hands = B.players.map(() => []); B.used = B.players.map(() => []);
  B.sips = B.players.map(() => 0); B.given = B.players.map(() => 0); B.phase = 'guess'; B.round = 0; B.p = 0; B.pyr = []; B.pyrI = 0; B.rider = -1; B.bus = []; B.step = 0; B.tries = 1; B.res = null; B.on = true;
  $('busEnd').hidden = true; J.stat && J.stat('busGames');
  render(); showPass(0, true);
}
function guess(pick) {
  if (B.wait || B.res) return;
  const busMode = B.phase === 'bus', p = busMode ? B.rider : B.p, r = busMode ? B.step : B.round;
  const prev = busMode ? B.bus : B.hands[p], c = take();
  const v = judge(r, pick, prev, c), k = r + 1;
  prev.push(c); if (!busMode) B.used[p].push(false);
  B.res = {v, k, p};
  if (v !== 'ok') { B.sips[p] += busMode ? k : k * (v === 'same' ? 2 : 1); J.stat && J.stat('sips', k); }
  SFX.card(0); SFX.flip(.12);
  setTimeout(() => {
    if (v === 'ok') { SFX.match(); J.buzz && J.buzz(15); } else { SFX.bad(); J.buzz && J.buzz([50, 40, 50]); }
    if (busMode && v === 'ok' && r === 3) { offBus(); return; }
    render();
  }, 380);
  render(true);
}
function next() {
  const was = B.res; B.res = null;
  if (B.phase === 'guess') {
    if (B.p < B.players.length - 1) { B.p++; render(); showPass(B.p); return; }
    if (B.round < 3) { B.round++; B.p = 0; render(); showPass(0); return; }
    B.phase = 'pyrIntro'; render(); return;
  }
  if (B.phase === 'bus') {
    if (was && was.v !== 'ok') { B.tries++; B.step = 0; B.bus = []; SFX.whoosh(); }
    else B.step++;
    render(); return;
  }
}
function buildPyr() { B.phase = 'pyr'; B.pyr = []; for (let k = 0; k < 10; k++) B.pyr.push({c: take(), up: false}); B.pyrI = 0; B.res = null; render(); for (let k = 0; k < 10; k++) SFX.card(k * .05); }
const ROWOF = i => i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 3; // bottom row first
function flip() {
  if (B.phase !== 'pyr' || B.pyrI >= 10 || B.wait) return;
  const slot = B.pyr[B.pyrI]; slot.up = true; const k = ROWOF(B.pyrI) + 1; B.pyrI++;
  const hits = [];
  B.hands.forEach((h, p) => h.forEach((c, i) => { if (!B.used[p][i] && c.r === slot.c.r) { B.used[p][i] = true; B.given[p] += k; hits.push(p); } }));
  B.res = {pyr: true, hits, k, r: slot.c.r};
  SFX.flip(0); if (hits.length) { SFX.chime(); J.buzz && J.buzz(20); } else SFX.pop();
  render();
}
function chooseRider() {
  const left = B.hands.map((h, p) => h.filter((_, i) => !B.used[p][i]).length);
  const most = Math.max(...left), tied = left.map((n, p) => n === most ? p : -1).filter(p => p >= 0);
  B.rider = tied[Math.floor(Math.random() * tied.length)]; B.tie = tied.length > 1 ? most : 0;
  B.phase = 'busIntro'; B.res = null; render(); SFX.fight();
}
function boardBus() { B.phase = 'bus'; B.bus = []; B.step = 0; B.tries = 1; B.deck = fresh(); B.res = null; render(); showPass(B.rider); }
function offBus() {
  B.phase = 'end'; B.on = false; render();
  const top = B.sips.reduce((b, v, k) => v > B.sips[b] ? k : b, 0);
  $('busEndT').textContent = B.tries === 1 ? t('off1', {n: nm(B.rider)}) : t('off', {n: nm(B.rider), k: B.tries});
  $('busEndList').innerHTML = B.players.map((p, k) => ({p, k, s: B.sips[k]})).sort((a, b) => b.s - a.s).map(x => `<li><span class="av">${av(x.k)}</span><b>${esc(x.p)}</b><span>${x.s} ${t('sips')}</span></li>`).join('');
  $('busEndM').textContent = B.sips[top] ? t('most', {n: nm(top), k: B.sips[top]}) : '';
  $('busEnd').hidden = false; SFX.win(); J.confetti(); J.unlock && J.unlock('bus_off'); J.addXP && J.addXP(25);
}

/* ---------- pass screen ---------- */
let passT = 0;
function showPass(i, first) {
  const el = $('busPass'); $('busPassAv').innerHTML = av(i); $('busPassName').textContent = nm(i);
  $('busPassTo').textContent = t('passTo'); $('busPassTap').textContent = t('tapReady');
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); if (!first) SFX.whoosh();
  clearTimeout(passT); passT = setTimeout(hidePass, 2400);
}
function hidePass() { clearTimeout(passT); $('busPass').hidden = true; }
$('busPass').addEventListener('click', hidePass);

/* ---------- render ---------- */
const face = (c, cls) => J.cardFace(c, {cls: cls || ''});
const back = cls => `<div class="card back${cls ? ' ' + cls : ''}"></div>`;
function render(flipping) {
  const ph = B.phase;
  $('busPhase').textContent = ph === 'guess' ? t('round', {r: B.round + 1}) : ph.startsWith('pyr') ? t('pPyr') : ph.startsWith('bus') ? t('pBus') : t('endT');
  const head = $('busHead'), cards = $('busCards'), msg = $('busMsg'), opts = $('busOpts');
  const tb = $('busTable'); tb.dataset.phase = ph;
  let h = '', o = '', m = '';
  if (ph === 'guess' || ph === 'bus') {
    const p = ph === 'bus' ? B.rider : B.p, hand = ph === 'bus' ? B.bus : B.hands[p], r = ph === 'bus' ? B.step : B.round;
    head.innerHTML = `<span class="av">${av(p)}</span><div><b>${esc(ph === 'bus' ? t('busTurn', {n: nm(p), k: Math.min(4, r + 1)}) : t('turn', {n: nm(p)}))}</b><span>${esc(ph === 'bus' ? t('tryN', {k: B.tries}) + ' · ' + t('busHow') : t('round', {r: r + 1}))}</span></div>`;
    h = [0, 1, 2, 3].map(i => { const c = hand[i]; const last = c && i === hand.length - 1 && B.res; return `<div class="bus-slot${i === r && !B.res ? ' now' : ''}${last ? ' ' + (B.res.v === 'ok' ? 'ok' : 'bad') : ''}">${c ? face(c, last ? 'bflip' : '') : i === r ? back('wait') : '<div class="slot"></div>'}<i class="bus-k">${i + 1} 🍺</i></div>`; }).join('');
    if (B.res && !flipping) {
      const v = B.res.v; m = `<b class="${v === 'ok' ? 'ok' : 'bad'}">${esc(v === 'ok' ? t('right', {k: B.res.k}) : v === 'same' ? t('same', {k: ph === 'bus' ? B.res.k : B.res.k * 2}) : t('wrong', {k: B.res.k}))}</b>`;
      if (ph === 'bus' && v !== 'ok') m += `<span>${esc(t('restart'))}</span>`;
      o = `<button type="button" class="btn btn-raise bus-next" data-b="next">${t('next')} →</button>`;
      if (ph === 'bus' && v !== 'ok' && B.tries >= 5) o += `<button type="button" class="btn btn-fold" data-b="mercy">${t('mercy')}</button>`;
    } else if (!B.res) {
      m = `<b class="q">${esc(question(r, hand))}</b>`;
      o = OPTS[r].map(([k, lab]) => `<button type="button" class="btn bus-o o-${k}" data-g="${k}">${r === 3 ? `<span class="su${RED[Number(k[1])] ? ' red' : ''}">${lab}</span><small>${esc(t(k))}</small>` : r === 0 ? `<span class="dot"></span>${esc(t(k))}` : esc(t(k))}</button>`).join('');
    }
  } else if (ph === 'pyrIntro' || ph === 'pyr') {
    head.innerHTML = `<span class="av py">🔺</span><div><b>${t('pyrT')}</b><span>${esc(t('pyrHow'))}</span></div>`;
    const rows = [[9], [7, 8], [4, 5, 6], [0, 1, 2, 3]];
    h = `<div class="bus-pyr">${rows.map((row, ri) => `<div class="pyr-row"><i class="pyr-v">${4 - ri} 🍺</i>${row.map(i => { const s = B.pyr[i]; if (!s) return '<div class="slot"></div>'; return `<div class="pyr-c${i === B.pyrI ? ' next' : ''}" data-pi="${i}">${s.up ? face(s.c, i === B.pyrI - 1 ? 'bflip' : '') : back()}</div>`; }).join('')}</div>`).join('')}</div>`;
    if (ph === 'pyrIntro') { o = `<button type="button" class="btn btn-raise" data-b="pyr">🔺 ${t('toPyr')}</button>`; m = ''; }
    else if (B.pyrI < 10) {
      o = `<button type="button" class="btn btn-raise" data-b="flip">${t('flip')} (${B.pyrI + 1}/10)</button>`;
      if (B.res) m = B.res.hits.length ? `<b class="ok">${[...new Set(B.res.hits)].map(p => esc(t('give', {n: nm(p), k: B.res.k * B.res.hits.filter(x => x === p).length}))).join('<br>')}</b>` : `<b>${esc(t('nobody', {r: RL(B.res.r)}))}</b>`;
      else m = `<span>${esc(t('rowV', {k: 1}))}</span>`;
    } else {
      if (B.res) m = B.res.hits.length ? `<b class="ok">${[...new Set(B.res.hits)].map(p => esc(t('give', {n: nm(p), k: B.res.k * B.res.hits.filter(x => x === p).length}))).join('<br>')}</b>` : `<b>${esc(t('nobody', {r: RL(B.res.r)}))}</b>`;
      o = `<button type="button" class="btn btn-violet" data-b="rider">🚌 ${t('next')} →</button>`;
    }
  } else if (ph === 'busIntro') {
    head.innerHTML = `<span class="av">${av(B.rider)}</span><div><b>${esc(t('rides', {n: nm(B.rider)}))}</b><span>${esc(B.tie ? t('tie', {k: B.tie, n: nm(B.rider)}) : t('busHow'))}</span></div>`;
    h = `<div class="bus-ride"><span class="bus-emoji">🚌</span><span class="av">${av(B.rider)}</span></div>`;
    o = `<button type="button" class="btn btn-raise" data-b="board">🚌 ${t('toBus')}</button>`;
  } else if (ph === 'end') {
    head.innerHTML = `<span class="av">${av(B.rider)}</span><div><b>${esc(t('endT'))}</b><span></span></div>`;
    h = `<div class="bus-ride off"><span class="bus-emoji">🚌</span><span class="av">${av(B.rider)}</span></div>`;
    o = `<button type="button" class="btn btn-raise" data-b="again">${t('again')}</button>`;
  }
  cards.innerHTML = h; msg.innerHTML = m; opts.innerHTML = o;
  opts.dataset.n = (o.match(/<button/g) || []).length;
  renderPlayers();
}
function renderPlayers() {
  const cur = B.phase === 'guess' ? B.p : B.phase.startsWith('bus') ? B.rider : -1;
  $('busPlayers').innerHTML = B.players.map((p, k) => {
    const left = B.hands[k] ? B.hands[k].filter((_, i) => !B.used[k][i]) : [];
    return `<div class="bus-pl${k === cur ? ' on' : ''}${k === B.rider ? ' rider' : ''}"><span class="av">${av(k)}${B.sips[k] ? `<i class="kc-sip">${B.sips[k]}</i>` : ''}</span><b>${esc(p)}</b><span class="bus-mini">${(B.hands[k] || []).map((c, i) => B.used[k][i] ? '' : `<i class="${RED[c.s] ? 'red' : ''}">${RL(c.r)}</i>`).join('')}</span></div>`;
  }).join('');
}

/* ---------- input ---------- */
$('busOpts').addEventListener('click', e => {
  const g = e.target.closest('[data-g]'); if (g) { guess(g.dataset.g); return; }
  const b = e.target.closest('[data-b]'); if (!b) return; const a = b.dataset.b;
  if (a === 'next') next(); else if (a === 'pyr') buildPyr(); else if (a === 'flip') flip(); else if (a === 'rider') chooseRider(); else if (a === 'board') boardBus();
  else if (a === 'again') setup(); else if (a === 'mercy') offBus();
});
$('busCards').addEventListener('click', e => { const c = e.target.closest('.pyr-c.next'); if (c) flip(); });
$('busAgain').onclick = () => { $('busEnd').hidden = true; setup(); };
$('busPlayersBtn').onclick = () => setup();
document.addEventListener('keydown', e => { if (J.current !== 'bus' || J.anyModal() || e.target.tagName === 'INPUT') return; if (e.key === 'Enter' || e.key === ' ') { const b = $('busOpts').querySelector('[data-b]'); if (b) { e.preventDefault(); b.click(); } } });

function renderIdle() {
  if (J.current !== 'bus' || B.on || !$('mKC').hidden || B.phase === 'end') return;
  $('busHead').innerHTML = `<span class="av py">🚌</span><div><b>${esc(t('title'))}</b><span>${esc(t('idleS'))}</span></div>`;
  $('busCards').innerHTML = `<div class="bus-ride"><span class="bus-emoji">🚌</span></div>`; $('busMsg').innerHTML = '';
  $('busOpts').innerHTML = `<button type="button" class="btn btn-raise" data-b="again">${esc(t('startNew'))}</button>`; $('busOpts').dataset.n = 1; $('busPlayers').innerHTML = '';
}
new MutationObserver(() => { if ($('mKC').hidden) setTimeout(renderIdle, 60); }).observe($('mKC'), {attributes: true, attributeFilter: ['hidden']});
function setup() { J.party.setup({title: t('title'), sub: t('sub'), min: 2, max: 10, onStart: start}); }
function fit() { const st = $('busStage'), tb = $('busTable'); const W = st.clientWidth - 12, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return; const w = Math.min(W, 760), h = Math.min(H, w * 1.3); tb.style.width = w + 'px'; tb.style.height = h + 'px'; tb.classList.toggle('wide', w / h > 1.25); }
new ResizeObserver(() => { if (J.current === 'bus') fit(); }).observe($('busStage'));
function open() { J.show('bus'); fit(); if (!B.on) { B.players = J.party.players(); B.phase = 'idle'; $('busCards').innerHTML = ''; setup(); } else render(); }
J.registerScreen('bus', {hide() {}});
$('busBtn').onclick = open;
J.onSettings(() => { if (J.current === 'bus' && B.phase !== 'idle') render(); });
J._bus = {B, guess, next, flip};
$('gcBus').innerHTML = '<div class="bus-art"><span>🚌</span>' + [0, 1, 2].map(k => `<div class="card back" style="--k:${k}"></div>`).join('') + '</div>';
})();
