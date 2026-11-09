/* JJ POKER — Capsa (Big Two), Indonesian style: you + 3 bots.
   Order: 3 low ... K A 2 high. Suits: ♦ < ♣ < ♥ < ♠. Whoever holds 3♦ starts and must play it.
   Play a single, pair, triple or 5-card hand of the same size that beats the table, or pass.
   When everyone else passes, the last player leads anything. First to empty their hand wins. */
(() => {
'use strict';
const J = window.JJ, {$, esc, num, SFX} = J;
const D = {
  en:{nextSeat:'You get a seat next hand',lobbyS:'Big Two, Indonesian style',bots:'Play with bots',host:'Host an online table',joinB:'Join',codePh:'Table code, like c-4k2m',openT:'Open tables',noneT:'No open tables right now',offline:'Online tables are not available right now. Bots are always ready.',looking:'Looking for tables…',waitHost:'Waiting for {n} to deal…',deal:'Deal',dealN:'Deal · {k} players + {b} bots',openSeat:'Open seat',botFill:'A bot plays any empty seat',invite:'Invite',nextIn:'Next hand in {s}s',closed:'The host closed the table.',hostGone:'The host disconnected. Waiting for them to come back…',rejoin:'Rejoin table {c}',watching:'This table is full. You are watching.',away:'away',sec:'{s}s',tableOf:"{n}'s table",playersN:'{k}/4 players',live:'playing',waiting:'waiting',leaveT:'Leave table',back:'Back',badCode:'Table codes look like c-4k2m',noRoom:'Could not reach that table. Check the code and try again.',youSeat:'You are in! Wait for the host to deal.',joinedT:'{n} joined',leftT:'{n} disconnected',backT:'{n} is back',yourTurn:'Your turn',lead:'Lead anything you like',start:'You have 3♦. Start with a hand that uses it',beat:'Beat {x}',pick:'Pick cards, then Play',play:'Play',pass:'Pass',hint:'Hint',sortR:'Sort: number',sortS:'Sort: suit',thinking:'{n} is thinking…',passed:'Pass',invalid:'That is not a Capsa hand',weaker:'Too low. You need something higher than {x}',size:'Play {k} cards to match the table',need3:'Your first hand must use the 3♦',noLead:'You lead this round, so you cannot pass',cleared:'Everyone passed. {n} leads',won:'{n} wins the hand!',youWon:'You win! +{c} coins',pts:'pts',left:'{k} cards',next:'Next hand',newm:'New match',noHint:'Nothing beats it. Pass this time.',single:'Single',pair:'Pair',triple:'Three of a kind',straight:'Straight',flush:'Flush',full:'Full house',four:'Four of a kind',sflush:'Straight flush',lastCard:'Last card!',penalty:'-{k}',scoreT:'Scores'},
  ko:{nextSeat:'다음 판부터 참여해요',lobbyS:'인도네시아식 빅투',bots:'봇이랑 하기',host:'온라인 방 만들기',joinB:'참가',codePh:'방 코드 (예: c-4k2m)',openT:'열린 방',noneT:'지금 열린 방이 없어요',offline:'지금은 온라인 방을 쓸 수 없어요. 봇은 언제나 준비 완료.',looking:'방을 찾는 중…',waitHost:'{n} 님이 카드를 나눠 주길 기다리는 중…',deal:'카드 나누기',dealN:'카드 나누기 · 사람 {k} + 봇 {b}',openSeat:'빈자리',botFill:'빈자리는 봇이 대신해요',invite:'초대',nextIn:'{s}초 후 다음 판',closed:'방장이 방을 닫았어요.',hostGone:'방장 연결이 끊겼어요. 돌아오길 기다리는 중…',rejoin:'{c} 방 다시 들어가기',watching:'자리가 다 찼어요. 구경 중이에요.',away:'자리 비움',sec:'{s}초',tableOf:'{n} 님의 방',playersN:'{k}/4명',live:'게임 중',waiting:'대기 중',leaveT:'방 나가기',back:'뒤로',badCode:'방 코드는 c-4k2m 같은 모양이에요',noRoom:'그 방에 들어갈 수 없어요. 코드를 확인하세요.',youSeat:'들어왔어요! 방장이 카드를 나눠 줄 때까지 기다려요.',joinedT:'{n} 님 입장',leftT:'{n} 님 연결 끊김',backT:'{n} 님이 돌아왔어요',yourTurn:'내 차례',lead:'아무 패나 내세요',start:'3♦을 가지고 있어요. 3♦이 들어간 패로 시작하세요',beat:'{x}보다 높게',pick:'카드를 고르고 내기',play:'내기',pass:'패스',hint:'힌트',sortR:'정렬: 숫자',sortS:'정렬: 무늬',thinking:'{n} 생각 중…',passed:'패스',invalid:'캡사 패가 아니에요',weaker:'너무 낮아요. {x}보다 높아야 해요',size:'테이블과 같은 {k}장을 내세요',need3:'첫 패에는 3♦이 들어가야 해요',noLead:'이번에 시작하는 차례라 패스할 수 없어요',cleared:'모두 패스. {n} 님이 시작',won:'{n} 님이 이겼어요!',youWon:'승리! +{c} 코인',pts:'점',left:'{k}장',next:'다음 판',newm:'새 게임',noHint:'이길 패가 없어요. 패스하세요.',single:'싱글',pair:'페어',triple:'트리플',straight:'스트레이트',flush:'플러시',full:'풀하우스',four:'포카드',sflush:'스트레이트 플러시',lastCard:'마지막 카드!',penalty:'-{k}',scoreT:'점수'},
  zh:{nextSeat:'下一局开始你就有座位了',lobbyS:'印尼玩法的锄大地',bots:'和机器人玩',host:'创建在线牌桌',joinB:'加入',codePh:'牌桌代码，例如 c-4k2m',openT:'开放的牌桌',noneT:'现在没有开放的牌桌',offline:'现在无法使用在线牌桌。机器人随时奉陪。',looking:'正在找牌桌…',waitHost:'等待 {n} 发牌…',deal:'发牌',dealN:'发牌 · {k} 位玩家 + {b} 个机器人',openSeat:'空位',botFill:'空位由机器人代打',invite:'邀请',nextIn:'{s} 秒后下一局',closed:'房主关闭了牌桌。',hostGone:'房主断线了，等待他回来…',rejoin:'重新加入 {c}',watching:'牌桌满了，你在观战。',away:'离开',sec:'{s}秒',tableOf:'{n} 的牌桌',playersN:'{k}/4 位玩家',live:'游戏中',waiting:'等待中',leaveT:'离开牌桌',back:'返回',badCode:'牌桌代码的格式像 c-4k2m',noRoom:'进不了这个牌桌，请检查代码。',youSeat:'进来了！等房主发牌。',joinedT:'{n} 加入了',leftT:'{n} 断线了',backT:'{n} 回来了',yourTurn:'轮到你',lead:'随便出',start:'你有方块3，第一手要用到它',beat:'要大过 {x}',pick:'选牌，然后出牌',play:'出牌',pass:'不要',hint:'提示',sortR:'排序：点数',sortS:'排序：花色',thinking:'{n} 正在思考…',passed:'不要',invalid:'这不是有效的牌型',weaker:'太小了，要比 {x} 大',size:'要出 {k} 张，和桌上一样',need3:'第一手必须包含方块3',noLead:'这轮你先出，不能不要',cleared:'大家都不要。{n} 先出',won:'{n} 赢了这一局！',youWon:'你赢了！+{c} 金币',pts:'分',left:'{k} 张',next:'下一局',newm:'新比赛',noHint:'没有能大过的牌，这次不要吧。',single:'单张',pair:'对子',triple:'三条',straight:'顺子',flush:'同花',full:'葫芦',four:'四条',sflush:'同花顺',lastCard:'最后一张！',penalty:'-{k}',scoreT:'分数'},
  id:{nextSeat:'Kamu dapat kursi di ronde berikutnya',lobbyS:'Big Two ala Indonesia',bots:'Main lawan bot',host:'Buat meja online',joinB:'Gabung',codePh:'Kode meja, misal c-4k2m',openT:'Meja terbuka',noneT:'Belum ada meja terbuka',offline:'Meja online sedang tidak tersedia. Bot selalu siap.',looking:'Mencari meja…',waitHost:'Menunggu {n} membagi kartu…',deal:'Bagi kartu',dealN:'Bagi kartu · {k} pemain + {b} bot',openSeat:'Kursi kosong',botFill:'Kursi kosong dimainkan bot',invite:'Undang',nextIn:'Ronde berikutnya {s} detik lagi',closed:'Host menutup meja.',hostGone:'Host terputus. Menunggu dia kembali…',rejoin:'Gabung lagi ke {c}',watching:'Meja penuh. Kamu menonton.',away:'pergi',sec:'{s} dtk',tableOf:'Meja {n}',playersN:'{k}/4 pemain',live:'bermain',waiting:'menunggu',leaveT:'Keluar meja',back:'Kembali',badCode:'Kode meja seperti c-4k2m',noRoom:'Tidak bisa masuk meja itu. Cek kodenya.',youSeat:'Kamu masuk! Tunggu host membagi kartu.',joinedT:'{n} bergabung',leftT:'{n} terputus',backT:'{n} kembali',yourTurn:'Giliranmu',lead:'Keluarkan kartu apa saja',start:'Kamu pegang 3♦. Mulai dengan kartu yang memakai 3♦',beat:'Kalahkan {x}',pick:'Pilih kartu, lalu Keluarkan',play:'Keluarkan',pass:'Pass',hint:'Petunjuk',sortR:'Urut: angka',sortS:'Urut: gambar',thinking:'{n} sedang berpikir…',passed:'Pass',invalid:'Itu bukan kombinasi Capsa',weaker:'Terlalu kecil. Harus lebih tinggi dari {x}',size:'Keluarkan {k} kartu seperti di meja',need3:'Kartu pertama harus memakai 3♦',noLead:'Kamu yang mulai, jadi tidak bisa pass',cleared:'Semua pass. {n} mulai',won:'{n} menang!',youWon:'Kamu menang! +{c} koin',pts:'poin',left:'{k} kartu',next:'Ronde berikutnya',newm:'Main baru',noHint:'Tidak ada yang bisa mengalahkan. Pass dulu.',single:'Satu',pair:'Pair',triple:'Tris',straight:'Straight',flush:'Flush',full:'Full house',four:'Four of a kind',sflush:'Straight flush',lastCard:'Kartu terakhir!',penalty:'-{k}',scoreT:'Skor'},
};
const t = (k, v) => { const L = (window.JJ_I18N && JJ_I18N.lang) || 'en'; let x = (D[L] || D.en)[k] || D.en[k] || k; if (v) for (const y in v) x = x.split('{' + y + '}').join(v[y]); return x; };
const SR = [3, 2, 0, 1];                       // suit strength: ♠3 ♥2 ♦0 ♣1
const rv = c => c.r === 2 ? 15 : c.r;          // 3..14, then 2 = 15
const val = c => rv(c) * 4 + SR[c.s];
const RL = r => ({11: 'J', 12: 'Q', 13: 'K', 14: 'A'})[r] || String(r);
const SUIT = ['♠', '♥', '♦', '♣'];
const is3d = c => c.r === 3 && c.s === 2;
const TYPES = ['', 'straight', 'flush', 'full', 'four', 'sflush'];

/* ---------- hand rules ---------- */
function classify(cs) {
  const n = cs.length; if (![1, 2, 3, 5].includes(n)) return null;
  const s = cs.slice().sort((a, b) => val(a) - val(b)), top = val(s[n - 1]);
  if (n === 1) return {n, t: 'single', key: top};
  if (n === 2) return s[0].r === s[1].r ? {n, t: 'pair', key: top} : null;
  if (n === 3) return s[0].r === s[1].r && s[1].r === s[2].r ? {n, t: 'triple', key: rv(s[0])} : null;
  const cnt = {}; s.forEach(c => cnt[rv(c)] = (cnt[rv(c)] || 0) + 1);
  const groups = Object.entries(cnt).map(([r, k]) => [Number(r), k]).sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = s.every(c => c.s === s[0].s);
  const rs = s.map(rv), straight = groups.length === 5 && rs[4] - rs[0] === 4 && rs[4] <= 14;
  if (straight && flush) return {n, t: 'sflush', rank: 5, key: top};
  if (groups[0][1] === 4) return {n, t: 'four', rank: 4, key: groups[0][0]};
  if (groups[0][1] === 3 && groups[1][1] === 2) return {n, t: 'full', rank: 3, key: groups[0][0]};
  if (flush) return {n, t: 'flush', rank: 2, key: top};
  if (straight) return {n, t: 'straight', rank: 1, key: top};
  return null;
}
function beats(a, b) {
  if (!b) return true; if (!a || a.n !== b.n) return false;
  if (a.n === 5 && a.rank !== b.rank) return a.rank > b.rank;
  return a.key > b.key;
}
const comboName = (info, cs) => {
  if (!info) return '';
  const s = cs.slice().sort((a, b) => val(a) - val(b)), hi = s[s.length - 1];
  if (info.t === 'single') return RL(hi.r) + SUIT[hi.s];
  if (info.t === 'pair' || info.t === 'triple') return `${t(info.t)} ${RL(hi.r)}`;
  return t(info.t);
};

/* ---------- every hand a player could make (for bots and hints) ---------- */
function combos(hand) {
  const out = [], byR = {}, byS = [[], [], [], []];
  const h = hand.slice().sort((a, b) => val(a) - val(b));
  h.forEach(c => { (byR[rv(c)] = byR[rv(c)] || []).push(c); byS[c.s].push(c); });
  const add = cs => { const info = classify(cs); if (info) out.push({cs, info}); };
  h.forEach(c => add([c]));
  Object.values(byR).forEach(g => {
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) add([g[i], g[j]]);
    if (g.length >= 3) { add(g.slice(0, 3)); if (g.length === 4) { add([g[0], g[1], g[3]]); add([g[0], g[2], g[3]]); add([g[1], g[2], g[3]]); } }
  });
  // straights: lowest card of each rank, every choice of top card
  for (let lo = 3; lo <= 10; lo++) {
    const rs = [lo, lo + 1, lo + 2, lo + 3, lo + 4]; if (!rs.every(r => byR[r])) continue;
    byR[lo + 4].forEach(topc => add([...rs.slice(0, 4).map(r => byR[r][0]), topc]));
    for (let s = 0; s < 4; s++) { const sc = rs.map(r => byR[r].find(c => c.s === s)); if (sc.every(Boolean)) add(sc); }
  }
  // flushes
  byS.forEach(g => { if (g.length < 5) return; const gg = g.slice(0, 8), n = gg.length;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) add([gg[a], gg[b], gg[c], gg[d], gg[e]]); });
  // full houses and fours
  const ranks = Object.keys(byR).map(Number);
  ranks.forEach(r3 => { const g = byR[r3]; if (g.length < 3) return;
    ranks.forEach(r2 => { if (r2 !== r3 && byR[r2].length >= 2) add([...g.slice(0, 3), byR[r2][0], byR[r2][1]]); });
    if (g.length === 4) { const k = h.find(c => rv(c) !== r3); if (k) add([...g, k]); } });
  return out;
}

/* ---------- game state ----------
   C is what the screen shows, always with "me" in seat 0.
   Playing bots or hosting, C is also the real game. As a guest, C is rebuilt from the host's broadcasts. */
const BOTN = ['Ana', 'Bram', 'Sol'];
const MAXS = 4, TURN_MS = 35000, GONE_MS = 4000, DROP_MS = 600000, NEXT_MS = 9000, CODE_RE = /^c-[a-z0-9]{4,8}$/;
const C = {on: false, mode: 'idle', hands: [[], [], [], []], counts: [13, 13, 13, 13], turn: 0, cur: null, passes: 0, first: true, over: false, started: false,
  scores: [0, 0, 0, 0], passed: [false, false, false, false], last: [null, null, null, null], sel: new Set(), sortBy: 'r', result: null, tok: 0, handNo: 0,
  names: ['', ...BOTN], seeds: ['', ...BOTN], kinds: ['m', 'b', 'b', 'b'], peers: ['', '', '', ''], pubs: [null, null, null, null], gone: [false, false, false, false], goneAt: [0, 0, 0, 0],
  code: '', seq: 0, turnAt: 0, nextAt: 0, wait: [], watching: false, closed: false, hostGone: false, paidHand: -1};
let troom = null, hostPeer = null, myAbs = 0, recvAt = 0;
const online = () => C.mode === 'host' || C.mode === 'client';
const seed = s => C.kinds[s] === 'b' ? C.seeds[s] : (C.seeds[s] || '') + '|' + (C.names[s] || '');
const isBot = s => C.kinds[s] === 'b';
const myName = () => J.nick() || 'You';
const sortHand = h => h.sort((a, b) => C.sortBy === 's' ? (SR[a.s] - SR[b.s] || rv(a) - rv(b)) : val(a) - val(b));
const cardOf = id => ({r: Math.floor(id / 4), s: id % 4, id});
const countOf = s => C.mode === 'client' ? C.counts[s] : C.hands[s].length;

function resetSeats() {
  C.names = [myName(), ...BOTN]; C.seeds = [J.myAvSeed, ...BOTN]; C.kinds = ['m', 'b', 'b', 'b'];
  C.peers = ['', '', '', '']; C.pubs = [null, null, null, null]; C.gone = [false, false, false, false]; C.goneAt = [0, 0, 0, 0]; C.scores = [0, 0, 0, 0];
}
function deal() {
  if (C.mode === 'client') return;
  if (C.mode === 'host') fillSeats();
  const d = []; for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) d.push({r, s, id: r * 4 + s});
  J.shuffle(d); C.hands = [0, 1, 2, 3].map(k => d.slice(k * 13, k * 13 + 13)); sortHand(C.hands[0]);
  C.turn = C.hands.findIndex(h => h.some(is3d)); C.cur = null; C.passes = 0; C.first = true; C.over = false; C.result = null; C.started = true;
  C.passed = [false, false, false, false]; C.last = [null, null, null, null]; C.sel.clear(); C.on = true; C.tok++; C.handNo++; C.nextAt = 0; C.turnAt = Date.now();
  $('capBanner').hidden = true;
  changed(true); for (let k = 0; k < 13; k++) SFX.card(k * .04);
  schedule();
}
function newMatch() { C.scores = [0, 0, 0, 0]; C.handNo = 0; deal(); }
function changed(dealing) { C.seq++; render(dealing); if (C.mode === 'host') broadcast(); }
function schedule() {
  if (C.over || C.mode === 'client' || !C.started) return; const tok = ++C.tok, p = C.turn;
  C.turnAt = Date.now();
  if (isBot(p)) { setTimeout(() => { if (tok !== C.tok) return; botMove(p); }, 650 + Math.random() * 650); return; }
  if (p === 0) { SFX.turn(); }
  if (C.mode === 'host' && p !== 0) {
    // a friend's turn: they get TURN_MS, or a few seconds if they dropped; then the computer plays for them
    const wait = () => { if (tok !== C.tok || C.turn !== p || C.over) return; const lim = C.gone[p] ? GONE_MS : TURN_MS;
      if (Date.now() - C.turnAt > lim) { botMove(p); return; } setTimeout(wait, 500); };
    setTimeout(wait, 500);
  }
  if (C.mode === 'host' && p === 0) {
    const wait = () => { if (tok !== C.tok || C.turn !== 0 || C.over) return; if (Date.now() - C.turnAt > TURN_MS + 15000) { botMove(0); return; } setTimeout(wait, 1000); };
    setTimeout(wait, 1000);
  }
}
function legal(p, cs) {
  const info = classify(cs);
  if (!info) return {err: t('invalid')};
  if (C.first && !cs.some(is3d)) return {err: t('need3')};
  if (C.cur && info.n !== C.cur.info.n) return {err: t('size', {k: C.cur.info.n})};
  if (C.cur && !beats(info, C.cur.info)) return {err: t('weaker', {x: comboName(C.cur.info, C.cur.cs)})};
  return {info};
}
function play(p, cs) {
  if (!Array.isArray(cs) || !cs.length || !cs.every(c => c && C.hands[p].some(x => x.id === c.id))) return {err: t('invalid')};
  const L = legal(p, cs); if (L.err) return L;
  const ids = new Set(cs.map(c => c.id)); C.hands[p] = C.hands[p].filter(c => !ids.has(c.id));
  C.cur = {cs: cs.slice().sort((a, b) => val(a) - val(b)), info: L.info, by: p}; C.passes = 0; C.first = false;
  C.passed = [false, false, false, false]; C.last[p] = C.cur;
  if (p === 0) C.sel.clear();
  playFx(p, L.info, C.hands[p].length);
  if (!C.hands[p].length) { endHand(p); return {ok: true}; }
  C.turn = (p + 1) % 4; changed(); schedule(); return {ok: true};
}
function playFx(p, info, left) {
  SFX.card(0); if (info.n > 1) SFX.card(.06); if (info.n === 5) { SFX.card(.12); SFX.whoosh(); }
  if (info.n === 5 && info.rank >= 3) { shout(p, t(info.t) + '!'); SFX.chime(); }
  if (left === 1) shout(p, t('lastCard'));
}
function pass(p) {
  if (!C.cur) return {err: t('noLead')};
  C.passes++; C.passed[p] = true; SFX.fold();
  if (C.passes >= 3) {
    const lead = C.cur.by; C.cur = null; C.passes = 0; C.passed = [false, false, false, false]; C.last = [null, null, null, null];
    C.turn = lead; changed(); toastLead(lead); schedule(); return {ok: true};
  }
  C.turn = (p + 1) % 4; changed(); schedule(); return {ok: true};
}
function toastLead(p) { const b = $('capCenter'); if (b) J.floatText(b, t('cleared', {n: C.names[p]})); }
function endHand(w) {
  C.over = true; C.tok++;
  const pen = C.hands.map((h, k) => { if (k === w) return 0; const n = h.length, twos = h.filter(c => c.r === 2).length; return n * (n >= 13 ? 3 : n >= 10 ? 2 : 1) * (twos ? 2 : 1); });
  const gain = pen.reduce((a, b) => a + b, 0);
  for (let k = 0; k < 4; k++) C.scores[k] += k === w ? gain : -pen[k];
  C.result = {w, pen, gain, clean: C.hands.every((h, k) => k === w || h.length >= 8)};
  if (C.mode === 'host') { C.nextAt = Date.now() + NEXT_MS; nextTimer(); }
  changed(); celebrate();
}
let nxT = 0;
function nextTimer() { clearTimeout(nxT); const tick = () => { if (C.mode !== 'host' || !C.over) return; if (Date.now() >= C.nextAt) { deal(); return; } renderActs(); nxT = setTimeout(tick, 500); }; nxT = setTimeout(tick, 500); }
/* Win/lose effects and the score banner. Runs once per hand on every phone. */
function celebrate() {
  const r = C.result; if (!r || C.paidHand === C.handNo) return; C.paidHand = C.handNo;
  if (r.w === 0) {
    const coins = r.gain * 10; SFX.win(); J.confetti(); J.addCoins(coins); J.addXP(30 + r.gain); J.unlock('cap_win');
    if (r.clean) J.unlock('cap_clean');
    J.stat && J.stat('capw');
    setTimeout(() => { if (J.current === 'cap') J.finisher({list: [{seed: seed(0), bot: false, name: C.names[0]}], top: 'CAPSA!', big: r.gain >= 30}); }, 400);
  } else SFX.lose();
  setTimeout(() => { if (C.over && C.result === r) { paintBanner(); $('capBanner').hidden = false; } }, r.w === 0 ? 1400 : 700);
}
function paintBanner() {
  const r = C.result; if (!r) return;
  $('capBanT').textContent = r.w === 0 ? t('youWon', {c: num(r.gain * 10)}) : t('won', {n: C.names[r.w]});
  $('capBanS').innerHTML = C.names.map((n, k) => `<span class="cap-sc${k === r.w ? ' w' : ''}"><span class="av">${J.avatarSVG(seed(k), isBot(k))}</span><b>${esc(n)}</b><i>${k === r.w ? '+' + r.gain : r.pen[k] ? '-' + r.pen[k] : '0'}</i><small>${num(C.scores[k])} ${t('pts')}</small></span>`).join('');
}

/* ---------- bots (also play for a friend who runs out of time) ---------- */
function choose(p) {
  const hand = C.hands[p], all = combos(hand), n = hand.length;
  const others = [1, 2, 3].map(k => (p + k) % 4), nextLeft = countOf(others[0]), danger = Math.min(...others.map(countOf)) <= 2;
  const groupSize = c => hand.filter(x => x.r === c.r).length;
  const cost = m => {
    let s = m.cs.reduce((a, c) => a + rv(c), 0) / m.cs.length;
    if (m.info.n === 1 && groupSize(m.cs[0]) >= 2) s += 3;
    if (m.info.n === 2 && groupSize(m.cs[0]) === 3) s += 2;
    if (m.cs.some(c => c.r === 2) && n > 5 && !danger) s += 7;
    if (m.info.n === 5) s -= 3; else if (m.info.n >= 2) s -= 1.2;
    return s;
  };
  if (!C.cur) {
    let cand = C.first ? all.filter(m => m.cs.some(is3d)) : all;
    if (!cand.length) return null;
    if (C.first) { const big = cand.filter(m => m.info.n > 1); if (big.length && Math.random() < .7) cand = big; }
    if (nextLeft === 1) { const multi = cand.filter(m => m.info.n > 1); if (multi.length) cand = multi; else return cand.reduce((a, b) => b.info.key > a.info.key ? b : a).cs; }
    return cand.reduce((a, b) => cost(b) < cost(a) ? b : a).cs;
  }
  const ok = all.filter(m => m.info.n === C.cur.info.n && beats(m.info, C.cur.info));
  if (!ok.length) return null;
  if (danger || n <= 3) return ok.reduce((a, b) => (b.info.rank || 0) * 100 + b.info.key > (a.info.rank || 0) * 100 + a.info.key ? b : a).cs;
  const best = ok.reduce((a, b) => cost(b) < cost(a) ? b : a);
  if (cost(best) > 13 && Math.random() < .6) return null;
  return best.cs;
}
function botMove(p) {
  if (C.over || C.turn !== p || C.mode === 'client') return;
  const cs = choose(p);
  if (!cs) { if (C.cur) pass(p); else play(p, [C.hands[p][0]]); return; }
  play(p, cs);
}

/* ---------- online: host ---------- */
const net = () => J.net && J.net.state() === 'ok' ? J.net.room() : null;
function fillSeats() {
  // friends waiting for a seat replace bots between hands
  for (let s = 1; s < 4 && C.wait.length; s++) if (C.kinds[s] === 'b' || C.kinds[s] === 'e') { const w = C.wait.shift(); seatHuman(s, w); }
  for (let s = 1; s < 4; s++) if (C.kinds[s] === 'e') { C.kinds[s] = 'b'; C.names[s] = BOTN[s - 1]; C.seeds[s] = BOTN[s - 1]; C.peers[s] = ''; C.pubs[s] = null; C.gone[s] = false; }
}
function seatHuman(s, w) { C.kinds[s] = 'h'; C.names[s] = w.name; C.seeds[s] = w.av; C.peers[s] = w.peer; C.pubs[s] = w.pub; C.gone[s] = false; C.goneAt[s] = 0; C.scores[s] = 0; }
async function hostTable() {
  const room = net(); if (!room) { lobbyMsg(t('offline')); return; }
  const code = 'c-' + (Math.random().toString(36).slice(2) + '0000').slice(0, 4);
  try { troom = await room.join(code); } catch (e) { lobbyMsg(t('noRoom')); return; }
  C.mode = 'host'; C.code = code; resetSeats(); C.kinds = ['m', 'e', 'e', 'e']; C.names = [myName(), '', '', '']; C.seeds = [J.myAvSeed, '', '', ''];
  C.started = false; C.on = true; C.over = false; C.handNo = 0; C.wait = []; C.closed = false; C.hands = [[], [], [], []]; C.cur = null; C.result = null;
  troom.on('sit', onSit); troom.on('act', onAct); troom.onPeers(onPeersHost);
  troom.presence({nm: myName(), host: 1}).catch(() => {});
  J.store.set('jj-caphost', code);
  hideLobby(); changed(); advertise(); J.unlock && J.unlock('host');
}
function advertise() {
  const room = net(); if (!room) return;
  const h = C.mode === 'host' && !C.closed ? {code: C.code, host: myName(), av: String(J.myAvSeed).slice(0, 24), n: C.kinds.filter(k => k === 'h' || k === 'm').length, open: C.kinds.filter(k => k !== 'h' && k !== 'm').length, live: C.started ? 1 : 0} : null;
  room.presence({capHost: h}).catch(() => {});
}
function onSit(msg) {
  if (C.mode !== 'host' || !msg || msg.sameTab) return;
  const d = msg.data && typeof msg.data === 'object' ? msg.data : {};
  const name = J.cleanName(d.nm) || 'Player', av = String(d.av || name).slice(0, 24), pub = typeof d.pub === 'string' && d.pub.length < 200 ? d.pub : null;
  // coming back: same connection, or the same name in a seat that dropped
  let s = C.peers.findIndex((pe, k) => C.kinds[k] === 'h' && pe === msg.peer);
  if (s < 0) s = C.kinds.findIndex((k, i) => k === 'h' && C.gone[i] && C.names[i] === name);
  if (s >= 0) { const was = C.gone[s]; C.peers[s] = msg.peer; C.pubs[s] = pub; C.gone[s] = false; C.names[s] = name; C.seeds[s] = av; encCache.clear(); if (was) note(t('backT', {n: name})); changed(); advertise(); return; }
  if (C.wait.some(w => w.peer === msg.peer)) { broadcast(); return; }
  const w = {peer: msg.peer, name, av, pub};
  const e = C.kinds.findIndex((k, i) => i > 0 && k === 'e');
  const b = C.kinds.findIndex((k, i) => i > 0 && k === 'b');
  if (e > 0 && (!C.started || C.over)) seatHuman(e, w);
  else if (b > 0 && (!C.started || C.over)) seatHuman(b, w);
  else if (C.kinds.filter((k, i) => i > 0 && k === 'h').length + C.wait.length < 3) C.wait.push(w);
  else { broadcast(); return; }
  note(t('joinedT', {n: name})); SFX.chime(); changed(); advertise();
}
function onAct(msg) {
  if (C.mode !== 'host' || !msg || !msg.data) return; const d = msg.data;
  const p = C.peers.findIndex((pe, k) => C.kinds[k] === 'h' && pe === msg.peer);
  if (p < 0 || p !== C.turn || C.over || d.seq !== C.seq) { broadcast(); return; }
  if (d.t === 'pass') { if (pass(p).err) broadcast(); return; }
  if (d.t === 'play' && Array.isArray(d.ids) && d.ids.length <= 5) {
    const cs = d.ids.map(id => C.hands[p].find(c => c.id === id)).filter(Boolean);
    if (cs.length !== d.ids.length || play(p, cs).err) broadcast();
  }
}
function onPeersHost(ch) {
  let any = false;
  for (const lp of ch.left) C.peers.forEach((pe, k) => { if (C.kinds[k] === 'h' && pe === lp.peer && !C.gone[k]) { C.gone[k] = true; C.goneAt[k] = Date.now(); note(t('leftT', {n: C.names[k]})); any = true; } });
  C.wait = C.wait.filter(w => !ch.left.some(lp => lp.peer === w.peer));
  if (any) changed(); else if (ch.joined.length) broadcast();
}
setInterval(() => {
  // a friend gone for 10 minutes gives their seat to a bot
  if (C.mode !== 'host') return; let any = false;
  for (let k = 1; k < 4; k++) if (C.kinds[k] === 'h' && C.gone[k] && Date.now() - C.goneAt[k] > DROP_MS) { C.kinds[k] = 'b'; C.names[k] = BOTN[k - 1]; C.seeds[k] = BOTN[k - 1]; C.peers[k] = ''; C.pubs[k] = null; C.gone[k] = false; any = true; }
  if (any) { changed(); advertise(); }
}, 15000);
const encCache = new Map();
async function sealHands() {
  const out = {}, N = J.net;
  for (let s = 1; s < 4; s++) {
    if (C.kinds[s] !== 'h' || !C.peers[s]) continue; const ids = C.hands[s].map(c => c.id);
    const key = `${C.handNo}|${C.peers[s]}|${C.pubs[s] || ''}|${ids.join(',')}`;
    if (!encCache.has(key)) { let e = null; if (C.pubs[s] && N && N.pub()) { try { e = {x: await N.seal(C.pubs[s], {h: C.handNo, c: ids})}; } catch (err) { e = null; } } encCache.set(key, e || {h: C.handNo, c: ids}); if (encCache.size > 60) encCache.delete(encCache.keys().next().value); }
    out[C.peers[s]] = encCache.get(key);
  }
  return out;
}
function view() {
  return {v: 1, g: 'cap', code: C.code, seq: C.seq, hn: C.handNo, st: C.started ? 1 : 0, turn: C.turn, first: C.first ? 1 : 0, hp: J.net && J.net.pub() || '',
    cur: C.cur ? {ids: C.cur.cs.map(c => c.id), by: C.cur.by} : 0, pd: C.passed.map(Number), over: C.over ? 1 : 0,
    res: C.result || 0, sc: C.scores, tl: C.started && !C.over ? Math.max(0, (isBot(C.turn) ? 0 : (C.gone[C.turn] ? GONE_MS : TURN_MS)) - (Date.now() - C.turnAt)) : 0,
    nx: C.over && C.nextAt ? Math.max(0, C.nextAt - Date.now()) : 0,
    p: C.kinds.map((k, s) => ({k, n: C.names[s], av: String(C.seeds[s] || '').slice(0, 24), pe: C.peers[s] || (s === 0 ? (J.net && J.net.peer()) || '' : ''), c: C.hands[s].length, g: C.gone[s] ? 1 : 0, o: C.over ? C.hands[s].map(c => c.id) : 0})),
    wt: C.wait.map(w => w.name)};
}
let bcBusy = false, bcAgain = false;
async function broadcast() {
  if (C.mode !== 'host' || !troom) return; if (bcBusy) { bcAgain = true; return; } bcBusy = true;
  try { do { bcAgain = false; const V = view(); V.enc = await sealHands(); await troom.emit('state', V).catch(() => {}); } while (bcAgain); } finally { bcBusy = false; }
}
setInterval(() => { if (C.mode === 'host' && troom) broadcast(); }, 4000);
function note(x) { const el = $('capCenter'); if (el && J.current === 'cap') J.floatText(el, x); }

/* ---------- online: guest ---------- */
async function joinTable(code, peerHint) {
  code = String(code || '').trim().toLowerCase();
  if (!CODE_RE.test(code)) { lobbyMsg(t('badCode')); return; }
  const room = net(); if (!room) { lobbyMsg(t('offline')); return; }
  try { troom = await room.join(code); } catch (e) { lobbyMsg(t('noRoom')); return; }
  C.mode = 'client'; C.code = code; hostPeer = peerHint || null; C.on = true; C.started = false; C.closed = false; C.hostGone = false; C.watching = false;
  C.hands = [[], [], [], []]; C.cur = null; C.result = null; C.over = false; C.sel.clear(); recvAt = Date.now();
  resetSeats(); C.kinds = ['m', 'e', 'e', 'e'];
  troom.on('state', onState);
  troom.onPeers(ch => { if (hostPeer && ch.left.some(p => p.peer === hostPeer)) { C.hostGone = true; render(); } });
  J.store.set('jj-capjoin', JSON.stringify({code, at: Date.now()}));
  hideLobby(); render(); sendSit();
}
function sendSit() { if (C.mode === 'client' && troom) troom.emit('sit', {nm: myName(), pub: J.net && J.net.pub(), av: J.myAvSeed}).catch(() => {}); }
let lastHn = -1, myHand = [], handKey = '';
async function onState(msg) {
  if (C.mode !== 'client' || !msg || !msg.data) return; const V = msg.data;
  if (V.g !== 'cap' || V.code !== C.code || !Array.isArray(V.p) || V.p.length !== 4) return;
  if (hostPeer && msg.peer !== hostPeer && !C.hostGone) return; hostPeer = msg.peer; C.hostGone = false;
  if (V.closed) { C.closed = true; J.store.del('jj-capjoin'); render(); return; }
  if (V.seq < C.seq && V.hn === C.handNo) return;
  recvAt = Date.now();
  const me = J.net && J.net.peer(); myAbs = V.p.findIndex(p => p.pe && p.pe === me && p.k === 'h');
  C.watching = myAbs < 0; C.queued = myAbs < 0 && (V.wt || []).includes(myName());
  const base = myAbs >= 0 ? myAbs : 0, R = s => (s - base + 4) % 4, A = d => (d + base) % 4;
  // my cards
  if (myAbs >= 0 && V.enc && me && V.enc[me]) {
    const e = V.enc[me], key = JSON.stringify(e);
    if (key !== handKey) { handKey = key; try { const o = e.x ? await J.net.unseal(V.hp, e.x) : e; if (o && o.h === V.hn && Array.isArray(o.c)) { const keep = C.sortBy; myHand = o.c.map(cardOf); sortHand(myHand); C.sortBy = keep; } } catch (err) {} }
  } else if (myAbs < 0) myHand = [];
  const newHand = V.hn !== lastHn; if (newHand) { lastHn = V.hn; C.sel.clear(); $('capBanner').hidden = true; if (V.st) for (let k = 0; k < 13; k++) SFX.card(k * .04); }
  const prevCur = C.cur && C.cur.cs.map(c => c.id).join(), prevTurn = C.turn, prevPd = C.passed.slice();
  C.seq = V.seq; C.handNo = V.hn; C.started = !!V.st; C.first = !!V.first; C.over = !!V.over;
  for (let d = 0; d < 4; d++) {
    const p = V.p[A(d)];
    C.kinds[d] = d === 0 && myAbs >= 0 ? 'm' : p.k === 'm' ? 'h' : p.k; C.names[d] = p.k === 'e' ? '' : String(p.n || ''); C.seeds[d] = String(p.av || p.n || '');
    C.counts[d] = p.c | 0; C.gone[d] = !!p.g; C.scores[d] = (V.sc || [])[A(d)] | 0; C.passed[d] = !!(V.pd || [])[A(d)];
    C.hands[d] = d === 0 && myAbs >= 0 ? myHand.slice() : (Array.isArray(p.o) ? p.o.map(cardOf) : Array.from({length: p.c | 0}, () => null));
  }
  if (myAbs >= 0) sortHand(C.hands[0]);
  C.turn = R(V.turn);
  C.cur = V.cur ? (() => { const cs = V.cur.ids.map(cardOf); return {cs, info: classify(cs), by: R(V.cur.by)}; })() : null;
  C.result = V.res ? {w: R(V.res.w), pen: [0, 1, 2, 3].map(d => V.res.pen[A(d)]), gain: V.res.gain, clean: V.res.clean} : null;
  C.tlEnd = Date.now() + (V.tl || 0); C.nextAt = V.nx ? Date.now() + V.nx : 0; C.wait = V.wt || [];
  // sounds for what just happened on the table
  const curKey = C.cur && C.cur.cs.map(c => c.id).join();
  if (curKey && curKey !== prevCur && C.cur) playFx(C.cur.by, C.cur.info, C.counts[C.cur.by]);
  C.passed.forEach((v, d) => { if (v && !prevPd[d] && !newHand) SFX.fold(); });
  if (C.turn === 0 && prevTurn !== 0 && C.started && !C.over && myAbs >= 0) SFX.turn();
  for (const k of [...C.sel]) if (!C.hands[0].some(c => c && c.id === k)) C.sel.delete(k);
  render(newHand);
  if (C.over && C.result) celebrate();
}
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); return; }
  if (C.mode !== 'client') return;
  if (C.hostGone || Date.now() - recvAt > 12000) rejoin(); else sendSit();
});
setInterval(() => { if (C.mode === 'client' && !C.closed && document.visibilityState === 'visible' && Date.now() - recvAt > 15000) rejoin(); }, 8000);
let rejoining = false;
async function rejoin() { if (rejoining || C.mode !== 'client' || C.closed) return; rejoining = true; const c = C.code; const r = troom; troom = null; if (r) r.leave().catch(() => {}); try { await joinTable(c, null); } finally { rejoining = false; } }
function sendAct(d) { if (!troom) return; d.seq = C.seq; troom.emit('act', d).catch(() => {}); }

function leaveOnline() {
  clearTimeout(nxT);
  if (C.mode === 'host' && troom) { const V = view(); V.closed = 1; V.enc = {}; troom.emit('state', V).catch(() => {}); J.store.del('jj-caphost'); }
  if (C.mode === 'client') J.store.del('jj-capjoin');
  const r = troom; troom = null; if (r) r.leave().catch(() => {});
  const was = C.mode; C.mode = 'idle'; C.on = false; C.tok++; C.started = false; C.closed = false; myHand = []; handKey = ''; lastHn = -1;
  if (was === 'host') { const room = net(); if (room) room.presence({capHost: null}).catch(() => {}); }
}

/* ---------- lobby: bots, host, join ---------- */
function savedJoin() { try { const s = JSON.parse(J.store.get('jj-capjoin') || 'null'); if (s && CODE_RE.test(s.code) && Date.now() - s.at < 3 * 3600e3) return s; } catch (e) {} return null; }
function showLobby() { $('capLobby').hidden = false; $('capBanner').hidden = true; renderLobby(); }
function hideLobby() { $('capLobby').hidden = true; }
function lobbyMsg(x) { $('capLobMsg').textContent = x || ''; }
function renderLobby() {
  if ($('capLobby').hidden) return;
  const room = net(), st = J.net ? J.net.state() : 'none';
  $('capLobS').textContent = t('lobbyS'); $('capBots').textContent = '🤖 ' + t('bots'); $('capHost').textContent = '🌐 ' + t('host');
  $('capJoinIn').placeholder = t('codePh'); $('capJoinB').textContent = t('joinB'); $('capOpenH').textContent = t('openT');
  $('capHost').disabled = !room; $('capJoinB').disabled = !room;
  const sj = savedJoin(), rb = $('capRejoin'); rb.hidden = !(sj && room); if (sj) rb.textContent = '↩ ' + t('rejoin', {c: sj.code});
  const ul = $('capOpen'); ul.innerHTML = '';
  const seen = new Set();
  (room ? room.peers() : []).forEach(p => {
    const h = p.presence && p.presence.capHost; if (p.sameTab || !h || typeof h !== 'object' || !CODE_RE.test(String(h.code)) || seen.has(h.code)) return; seen.add(h.code);
    const li = document.createElement('li');
    li.innerHTML = `<span class="av">${J.avatarSVG(String(h.av || '').slice(0, 24) + '|' + (J.cleanName(h.host) || ''), false)}</span><div class="r-info"><b>${esc(t('tableOf', {n: J.cleanName(h.host) || '?'}))}</b><span>${esc(h.code)} · ${t('playersN', {k: Math.min(4, h.n | 0)})} · ${h.live ? t('live') : t('waiting')}</span></div><button class="btn btn-call" type="button" data-jc="${esc(h.code)}" data-jp="${esc(p.peer)}">${t('joinB')}</button>`;
    ul.appendChild(li);
  });
  if (!ul.children.length) ul.innerHTML = `<li class="none">${esc(room ? t('noneT') : st === 'wait' ? t('looking') : t('offline'))}</li>`;
}
$('capBots').onclick = () => { leaveOnline(); C.mode = 'bots'; resetSeats(); hideLobby(); newMatch(); };
$('capHost').onclick = () => { leaveOnline(); hostTable(); };
$('capJoinB').onclick = () => { leaveOnline(); joinTable($('capJoinIn').value); };
$('capJoinIn').addEventListener('keydown', e => { if (e.key === 'Enter') $('capJoinB').click(); });
$('capRejoin').onclick = () => { const s = savedJoin(); if (s) { leaveOnline(); joinTable(s.code); } };
$('capOpen').addEventListener('click', e => { const b = e.target.closest('[data-jc]'); if (b) { leaveOnline(); joinTable(b.dataset.jc, b.dataset.jp); } });
$('capLobBack').onclick = () => J.show('home');
J.net && J.net.onChange(() => { if (J.current === 'cap') renderLobby(); });
$('capInvite').onclick = () => { if (C.code && J.invite) J.invite(C.code, 'capsa'); };

/* ---------- speech ---------- */
function seatEl(s) { return s === 0 ? $('capMe') : $('capS' + s); }
function shout(s, txt) { const el = seatEl(s); if (el && J.current === 'cap') J.floatText(el.querySelector('.av') || el, txt); }

/* ---------- render ---------- */
const face = (c, cls) => J.cardFace(c, {cls: cls || ''});
const secsLeft = () => Math.max(0, Math.ceil((C.mode === 'client' ? (C.tlEnd || 0) - Date.now() : (C.gone[C.turn] ? GONE_MS : C.turn === 0 ? TURN_MS + 15000 : TURN_MS) - (Date.now() - C.turnAt)) / 1000));
function render(dealing) {
  if (!C.on) return; const reveal = C.over, waitingRoom = online() && !C.started;
  $('capScreen').classList.toggle('online', online());
  $('capInvite').hidden = !online() || C.closed;
  for (let s = 1; s < 4; s++) {
    const el = $('capS' + s), h = C.hands[s], lp = C.last[s], k = C.kinds[s], cnt = countOf(s);
    el.className = `cap-seat s${s}${C.turn === s && !C.over && C.started ? ' turn' : ''}${C.result && C.result.w === s ? ' win' : ''}${C.gone[s] ? ' gone' : ''}`;
    if (k === 'e') { el.innerHTML = `<div class="cap-who open"><span class="av">＋</span><div><b>${t('openSeat')}</b><span>${t('botFill')}</span></div></div>`; continue; }
    el.innerHTML = `<div class="cap-who"><span class="av">${J.avatarSVG(seed(s), isBot(s))}</span><div><b>${esc(C.names[s])}${C.gone[s] ? ' 💤' : ''}</b><span>${C.started ? t('left', {k: cnt}) + ' · ' : ''}${num(C.scores[s])}</span></div>${C.turn === s && !C.over && C.started ? `<span class="bubble b-think"><span>•</span><span>•</span><span>•</span></span>${!isBot(s) && online() ? `<i class="cap-tl" data-tl>${secsLeft()}</i>` : ''}` : ''}${C.passed[s] && !C.over ? `<span class="cap-pass">${t('passed')}</span>` : ''}</div>
      ${C.started ? `<div class="cap-backs${reveal && h.every(Boolean) ? ' open' : ''}">${reveal && h.every(Boolean) ? h.map(c => face(c)).join('') : Array.from({length: cnt}, () => '<div class="card back"></div>').join('')}</div>` : ''}${cnt === 1 && !C.over && C.started ? '<i class="cap-one">1</i>' : ''}`;
  }
  const me = $('capMe'); me.className = `cap-me${C.turn === 0 && !C.over && C.started ? ' turn' : ''}${C.result && C.result.w === 0 ? ' win' : ''}`;
  me.innerHTML = C.watching ? `<span class="av">👀</span><div><b>${esc(C.queued ? t('nextSeat') : t('watching'))}</b></div>` : `<span class="av">${J.avatarSVG(seed(0), false)}</span><div><b>${esc(C.names[0])}</b><span>${num(C.scores[0])} ${t('pts')}</span></div>${C.passed[0] && !C.over ? `<span class="cap-pass">${t('passed')}</span>` : ''}`;
  const cen = $('capCenter');
  if (C.closed) cen.innerHTML = `<span class="cap-msg">${esc(t('closed'))}</span>`;
  else if (C.mode === 'client' && C.hostGone) cen.innerHTML = `<span class="cap-msg">${esc(t('hostGone'))}</span>`;
  else if (waitingRoom) cen.innerHTML = `<span class="cap-code">${esc(C.code)}</span><span class="cap-msg">${esc(C.mode === 'host' ? t('botFill') : t('waitHost', {n: C.names[[1, 2, 3].find(d => C.kinds[d] === 'h') ?? 1] || 'host'}))}</span>`;
  else if (C.cur) cen.innerHTML = `<div class="cap-play n${C.cur.cs.length}">${C.cur.cs.map(c => face(c, 'cap-in')).join('')}</div><span class="cap-lbl"><b>${esc(C.names[C.cur.by])}</b> · ${esc(comboName(C.cur.info, C.cur.cs))}</span>`;
  else cen.innerHTML = `<span class="cap-empty">${C.over ? '' : C.turn === 0 ? (C.first ? '3♦' : '✨') : ''}</span>`;
  $('capRound').textContent = '#' + C.handNo; $('capPts').textContent = num(C.scores[0]);
  if (C.over && C.result && !$('capBanner').hidden) paintBanner();
  renderHand(dealing); renderActs();
}
function renderHand(dealing) {
  const h = C.hands[0].filter(Boolean), el = $('capHand');
  el.innerHTML = h.map((c, i) => `<button type="button" class="cap-c${C.sel.has(c.id) ? ' sel' : ''}" data-id="${c.id}" style="--i:${i}" aria-label="${RL(c.r)} ${SUIT[c.s]}">${face(c, dealing ? 'deal' : '')}</button>`).join('');
  fitHand();
}
function fitHand() {
  const el = $('capHand'); const n = C.hands[0].filter(Boolean).length; if (!el || !el.clientWidth || !n) return;
  const W = el.clientWidth - 8, step = .62, cw = Math.max(34, Math.min(innerHeight < 540 && innerWidth > innerHeight ? Math.min(52, Math.max(34, (innerHeight - 200) / 2.6)) : 84, W / (1 + (n - 1) * step)));
  el.style.setProperty('--cw', cw.toFixed(1) + 'px'); el.style.setProperty('--ov', (-(cw * (1 - step))).toFixed(1) + 'px');
}
function myTurnNow() { return C.started && !C.over && C.turn === 0 && !C.watching && !C.closed && !(C.mode === 'client' && C.hostGone); }
function renderActs() {
  const st = $('capStatus'), a = $('capActs');
  const hand = C.hands[0].filter(Boolean), selCs = hand.filter(c => C.sel.has(c.id)), info = selCs.length ? classify(selCs) : null;
  if (C.closed) { st.innerHTML = esc(t('closed')); a.innerHTML = `<button class="btn btn-raise" type="button" data-a="lobby">${t('back')}</button>`; return; }
  if (online() && !C.started) {
    const humans = C.kinds.filter(k => k === 'h' || k === 'm').length, bots = 4 - humans;
    if (C.mode === 'host') { st.innerHTML = `<b>${esc(C.code)}</b> · ${t('playersN', {k: humans})}`; a.innerHTML = `<button class="btn btn-violet" type="button" data-a="invite">📲 ${t('invite')}</button><button class="btn btn-raise" type="button" data-a="deal">${t('dealN', {k: humans, b: bots})}</button>`; }
    else { st.innerHTML = esc(C.watching && !C.queued && C.kinds.every(k => k !== 'e') ? t('watching') : t('youSeat')); a.innerHTML = `<button class="btn btn-violet" type="button" data-a="invite">📲 ${t('invite')}</button><button class="btn btn-fold" type="button" data-a="lobby">${t('leaveT')}</button>`; }
    a.dataset.mode = 'wait'; return;
  }
  a.dataset.mode = '';
  if (C.over) {
    const nx = C.nextAt ? Math.max(0, Math.ceil((C.nextAt - Date.now()) / 1000)) : 0;
    st.innerHTML = C.result && C.result.w === 0 ? `<b>${t('youWon', {c: num(C.result.gain * 10)})}</b>` : C.result ? `<b>${esc(t('won', {n: C.names[C.result.w]}))}</b>` : '';
    if (online() && nx) st.innerHTML += ` · ${esc(t('nextIn', {s: nx}))}`;
    a.innerHTML = C.mode === 'client' ? `<button class="btn btn-fold" type="button" data-a="lobby">${t('leaveT')}</button>` : `<button class="btn btn-raise" type="button" data-a="next">${t('next')}</button>${C.mode === 'bots' ? `<button class="btn btn-fold" type="button" data-a="newm">${t('newm')}</button>` : `<button class="btn btn-violet" type="button" data-a="invite">📲 ${t('invite')}</button>`}`;
    return;
  }
  if (C.watching) { st.innerHTML = esc(C.queued ? t('nextSeat') : t('watching')); a.innerHTML = `<button class="btn btn-fold" type="button" data-a="lobby">${t('leaveT')}</button>`; return; }
  if (C.mode === 'client' && C.hostGone) st.innerHTML = esc(t('hostGone'));
  else if (C.turn !== 0) st.innerHTML = esc(t('thinking', {n: C.names[C.turn]})) + (online() && !isBot(C.turn) ? ` · ${t('sec', {s: secsLeft()})}` : '');
  else st.innerHTML = `<b>${t('yourTurn')}</b>${online() ? ` <i class="cap-mytl">${t('sec', {s: secsLeft()})}</i>` : ''} · ${esc(C.first ? t('start') : C.cur ? t('beat', {x: comboName(C.cur.info, C.cur.cs)}) : t('lead'))}${selCs.length ? ` · <span class="cap-selinfo${info ? '' : ' bad'}">${info ? esc(comboName(info, selCs)) : '✕'}</span>` : ''}`;
  const my = myTurnNow();
  const canPlay = my && info && !legal(0, selCs).err;
  a.innerHTML = `<button class="btn btn-fold cap-tool" type="button" data-a="sort">${C.sortBy === 'r' ? t('sortS') : t('sortR')}</button><button class="btn btn-fold cap-tool" type="button" data-a="hint"${my ? '' : ' disabled'}>💡 ${t('hint')}</button><button class="btn btn-fold" type="button" data-a="pass"${my && C.cur ? '' : ' disabled'}>${t('pass')}</button><button class="btn btn-raise" type="button" data-a="play"${canPlay ? '' : ' disabled'}>${t('play')}${selCs.length ? ` (${selCs.length})` : ''}</button>`;
}
setInterval(() => {
  // countdowns for online turns
  if (J.current !== 'cap' || !online() || !C.started) return;
  if (!C.over) { const s = secsLeft(); document.querySelectorAll('#capScreen [data-tl]').forEach(el => el.textContent = s); const m = document.querySelector('#capStatus .cap-mytl'); if (m) m.textContent = t('sec', {s}); else if (C.turn !== 0) renderActs(); if (C.turn === 0 && myTurnNow() && s <= 5 && s > 0) J.tone && J.tone(900, .05, 'square', .03); }
  else if (C.mode === 'client' && C.nextAt) renderActs();
}, 1000);

/* ---------- input ---------- */
$('capHand').addEventListener('click', e => {
  const b = e.target.closest('.cap-c'); if (!b || C.over) return; const id = Number(b.dataset.id);
  if (C.sel.has(id)) C.sel.delete(id); else C.sel.add(id); SFX.click(); renderHand(); renderActs();
});
$('capActs').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a;
  if (a === 'invite') { if (J.invite) J.invite(C.code, 'capsa'); return; }
  if (a === 'lobby') { leaveOnline(); showLobby(); return; }
  if (a === 'deal' && C.mode === 'host') { C.scores = [0, 0, 0, 0]; deal(); advertise(); return; }
  if (a === 'next') { clearTimeout(nxT); return deal(); } if (a === 'newm') return newMatch();
  if (a === 'sort') { C.sortBy = C.sortBy === 'r' ? 's' : 'r'; sortHand(C.hands[0]); renderHand(); renderActs(); SFX.riffle(); return; }
  if (!myTurnNow()) return;
  if (a === 'hint') { const cs = choose(0); C.sel.clear(); if (cs) { cs.forEach(c => C.sel.add(c.id)); renderHand(); renderActs(); } else J.toast(`<span class="t-ic">💡</span><span>${esc(t('noHint'))}</span>`, '', 2200); return; }
  if (a === 'pass') { if (!C.cur) { J.toast(esc(t('noLead')), '', 2000); return; } if (C.mode === 'client') { sendAct({t: 'pass'}); b.disabled = true; return; } pass(0); return; }
  if (a === 'play') {
    const cs = C.hands[0].filter(c => c && C.sel.has(c.id)); const L = legal(0, cs);
    if (L.err) { J.toast(esc(L.err), '', 2200); SFX.bad(); return; }
    if (C.mode === 'client') { sendAct({t: 'play', ids: cs.map(c => c.id)}); b.disabled = true; return; }
    const r = play(0, cs); if (r.err) { J.toast(esc(r.err), '', 2200); SFX.bad(); }
  }
});
document.addEventListener('keydown', e => { if (J.current !== 'cap' || J.anyModal() || e.target.tagName === 'INPUT') return; if (e.key === 'Enter') { const b = $('capActs').querySelector('[data-a="play"]:not([disabled])') || $('capActs').querySelector('[data-a="next"]'); if (b) { e.preventDefault(); b.click(); } } });

/* ---------- screen ---------- */
function fit() {
  fitHand(); const st = $('capStage'), tb = $('capTable'); const W = st.clientWidth - 16, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return;
  const tall = W / H < 1.05; const ratio = tall ? Math.max(.62, Math.min(.85, W / H)) : Math.min(2, Math.max(1.4, W / H));
  const w = Math.max(260, Math.min(W, H * ratio)); tb.style.width = w + 'px'; tb.style.height = (w / ratio) + 'px'; tb.classList.toggle('tall', tall); tb.classList.toggle('short', !tall && w / ratio < 330);
}
new ResizeObserver(() => { if (J.current === 'cap') fit(); }).observe($('capStage'));
new ResizeObserver(() => { if (J.current === 'cap') fitHand(); }).observe($('capHand'));
function open() { J.show('cap'); fit(); if (C.on) { render(); schedule(); } else showLobby(); }
J.registerScreen('cap', {hide() { if (C.mode === 'bots') C.tok++; }});
(window.JJ_SCREENS = window.JJ_SCREENS || {}).cap = {leave() { leaveOnline(); J.show('home'); }};
$('capBtn').onclick = open;
J.onSettings(() => { if (J.current === 'cap') { if (C.on) render(); renderLobby(); } });
J.capJoin = code => { J.show('cap'); fit(); leaveOnline(); joinTable(code); };
J._cap = {C, classify, beats, combos, choose, play, pass, deal, view, hostTable, joinTable};
$('gcCap').innerHTML = [{r: 2, s: 0}, {r: 2, s: 1}, {r: 3, s: 2}].map((c, i) => J.cardFace(c, {})).join('');
})();
