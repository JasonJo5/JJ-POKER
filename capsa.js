/* JJ POKER — Capsa (Big Two), Indonesian style: you + 3 bots.
   Order: 3 low ... K A 2 high. Suits: ♦ < ♣ < ♥ < ♠. Whoever holds 3♦ starts and must play it.
   Play a single, pair, triple or 5-card hand of the same size that beats the table, or pass.
   When everyone else passes, the last player leads anything. First to empty their hand wins. */
(() => {
'use strict';
const J = window.JJ, {$, esc, num, SFX} = J;
const D = {
  en:{yourTurn:'Your turn',lead:'Lead anything you like',start:'You have 3♦. Start with a hand that uses it',beat:'Beat {x}',pick:'Pick cards, then Play',play:'Play',pass:'Pass',hint:'Hint',sortR:'Sort: number',sortS:'Sort: suit',thinking:'{n} is thinking…',passed:'Pass',invalid:'That is not a Capsa hand',weaker:'Too low. You need something higher than {x}',size:'Play {k} cards to match the table',need3:'Your first hand must use the 3♦',noLead:'You lead this round, so you cannot pass',cleared:'Everyone passed. {n} leads',won:'{n} wins the hand!',youWon:'You win! +{c} coins',pts:'pts',left:'{k} cards',next:'Next hand',newm:'New match',noHint:'Nothing beats it. Pass this time.',single:'Single',pair:'Pair',triple:'Three of a kind',straight:'Straight',flush:'Flush',full:'Full house',four:'Four of a kind',sflush:'Straight flush',lastCard:'Last card!',penalty:'-{k}',scoreT:'Scores'},
  ko:{yourTurn:'내 차례',lead:'아무 패나 내세요',start:'3♦을 가지고 있어요. 3♦이 들어간 패로 시작하세요',beat:'{x}보다 높게',pick:'카드를 고르고 내기',play:'내기',pass:'패스',hint:'힌트',sortR:'정렬: 숫자',sortS:'정렬: 무늬',thinking:'{n} 생각 중…',passed:'패스',invalid:'캡사 패가 아니에요',weaker:'너무 낮아요. {x}보다 높아야 해요',size:'테이블과 같은 {k}장을 내세요',need3:'첫 패에는 3♦이 들어가야 해요',noLead:'이번에 시작하는 차례라 패스할 수 없어요',cleared:'모두 패스. {n} 님이 시작',won:'{n} 님이 이겼어요!',youWon:'승리! +{c} 코인',pts:'점',left:'{k}장',next:'다음 판',newm:'새 게임',noHint:'이길 패가 없어요. 패스하세요.',single:'싱글',pair:'페어',triple:'트리플',straight:'스트레이트',flush:'플러시',full:'풀하우스',four:'포카드',sflush:'스트레이트 플러시',lastCard:'마지막 카드!',penalty:'-{k}',scoreT:'점수'},
  zh:{yourTurn:'轮到你',lead:'随便出',start:'你有方块3，第一手要用到它',beat:'要大过 {x}',pick:'选牌，然后出牌',play:'出牌',pass:'不要',hint:'提示',sortR:'排序：点数',sortS:'排序：花色',thinking:'{n} 正在思考…',passed:'不要',invalid:'这不是有效的牌型',weaker:'太小了，要比 {x} 大',size:'要出 {k} 张，和桌上一样',need3:'第一手必须包含方块3',noLead:'这轮你先出，不能不要',cleared:'大家都不要。{n} 先出',won:'{n} 赢了这一局！',youWon:'你赢了！+{c} 金币',pts:'分',left:'{k} 张',next:'下一局',newm:'新比赛',noHint:'没有能大过的牌，这次不要吧。',single:'单张',pair:'对子',triple:'三条',straight:'顺子',flush:'同花',full:'葫芦',four:'四条',sflush:'同花顺',lastCard:'最后一张！',penalty:'-{k}',scoreT:'分数'},
  id:{yourTurn:'Giliranmu',lead:'Keluarkan kartu apa saja',start:'Kamu pegang 3♦. Mulai dengan kartu yang memakai 3♦',beat:'Kalahkan {x}',pick:'Pilih kartu, lalu Keluarkan',play:'Keluarkan',pass:'Pass',hint:'Petunjuk',sortR:'Urut: angka',sortS:'Urut: gambar',thinking:'{n} sedang berpikir…',passed:'Pass',invalid:'Itu bukan kombinasi Capsa',weaker:'Terlalu kecil. Harus lebih tinggi dari {x}',size:'Keluarkan {k} kartu seperti di meja',need3:'Kartu pertama harus memakai 3♦',noLead:'Kamu yang mulai, jadi tidak bisa pass',cleared:'Semua pass. {n} mulai',won:'{n} menang!',youWon:'Kamu menang! +{c} koin',pts:'poin',left:'{k} kartu',next:'Ronde berikutnya',newm:'Main baru',noHint:'Tidak ada yang bisa mengalahkan. Pass dulu.',single:'Satu',pair:'Pair',triple:'Tris',straight:'Straight',flush:'Flush',full:'Full house',four:'Four of a kind',sflush:'Straight flush',lastCard:'Kartu terakhir!',penalty:'-{k}',scoreT:'Skor'},
};
const t = (k, v) => { const L = (window.JJ_I18N && JJ_I18N.lang) || 'en'; let x = (D[L] || D.en)[k] || D.en[k] || k; if (v) for (const y in v) x = x.split('{' + y + '}').join(v[y]); return x; };
const BOTN = ['Ana', 'Bram', 'Sol'];
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

/* ---------- game state ---------- */
const C = {on: false, hands: [[], [], [], []], turn: 0, cur: null, passes: 0, first: true, over: false, scores: [0, 0, 0, 0], passed: [false, false, false, false], last: [null, null, null, null], sel: new Set(), sortBy: 'r', result: null, tok: 0, handNo: 0};
const names = () => [J.nick() || 'You', ...BOTN];
const seed = i => i === 0 ? J.myAvSeed + '|' + J.nick() : BOTN[i - 1];
const sortHand = h => h.sort((a, b) => C.sortBy === 's' ? (SR[a.s] - SR[b.s] || rv(a) - rv(b)) : val(a) - val(b));

function deal() {
  const d = []; for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) d.push({r, s, id: r * 4 + s});
  J.shuffle(d); C.hands = [0, 1, 2, 3].map(k => d.slice(k * 13, k * 13 + 13)); sortHand(C.hands[0]);
  C.turn = C.hands.findIndex(h => h.some(is3d)); C.cur = null; C.passes = 0; C.first = true; C.over = false; C.result = null;
  C.passed = [false, false, false, false]; C.last = [null, null, null, null]; C.sel.clear(); C.on = true; C.tok++; C.handNo++;
  $('capBanner').hidden = true;
  render(true); for (let k = 0; k < 13; k++) SFX.card(k * .04);
  schedule();
}
function newMatch() { C.scores = [0, 0, 0, 0]; C.handNo = 0; deal(); }
function schedule() {
  if (C.over) return; const tok = ++C.tok;
  if (C.turn !== 0) setTimeout(() => { if (tok !== C.tok || J.current !== 'cap') return; botMove(C.turn); }, 650 + Math.random() * 650);
  else { SFX.turn(); }
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
  SFX.card(0); if (cs.length > 1) SFX.card(.06); if (cs.length === 5) { SFX.card(.12); SFX.whoosh(); }
  if (L.info.n === 5 && L.info.rank >= 3) { shout(p, t(L.info.t) + '!'); SFX.chime(); }
  if (C.hands[p].length === 1) shout(p, t('lastCard'));
  if (!C.hands[p].length) { endHand(p); return {ok: true}; }
  C.turn = (p + 1) % 4; render(); schedule(); return {ok: true};
}
function pass(p) {
  if (!C.cur) return {err: t('noLead')};
  C.passes++; C.passed[p] = true; SFX.fold();
  if (C.passes >= 3) {
    const lead = C.cur.by; C.cur = null; C.passes = 0; C.passed = [false, false, false, false]; C.last = [null, null, null, null];
    C.turn = lead; render(); toastLead(lead); schedule(); return {ok: true};
  }
  C.turn = (p + 1) % 4; render(); schedule(); return {ok: true};
}
function toastLead(p) { const b = $('capCenter'); if (b) J.floatText(b, t('cleared', {n: names()[p]})); }
function endHand(w) {
  C.over = true; C.tok++;
  const pen = C.hands.map((h, k) => { if (k === w) return 0; const n = h.length, twos = h.filter(c => c.r === 2).length; return n * (n >= 13 ? 3 : n >= 10 ? 2 : 1) * (twos ? 2 : 1); });
  const gain = pen.reduce((a, b) => a + b, 0);
  for (let k = 0; k < 4; k++) C.scores[k] += k === w ? gain : -pen[k];
  C.result = {w, pen, gain};
  render();
  const nm = names();
  if (w === 0) {
    const coins = gain * 10; SFX.win(); J.confetti(); J.addCoins(coins); J.addXP(30 + gain); J.unlock('cap_win');
    if (C.hands.every((h, k) => k === 0 || h.length >= 8)) J.unlock('cap_clean');
    J.stat && J.stat('capw');
    setTimeout(() => { if (J.current === 'cap') J.finisher({list: [{seed: seed(0), bot: false, name: nm[0]}], top: 'CAPSA!', big: gain >= 30}); }, 400);
  } else { SFX.lose(); }
  const b = $('capBanner');
  $('capBanT').textContent = w === 0 ? t('youWon', {c: num(gain * 10)}) : t('won', {n: nm[w]});
  $('capBanS').innerHTML = nm.map((n, k) => `<span class="cap-sc${k === w ? ' w' : ''}"><span class="av">${J.avatarSVG(seed(k), k > 0)}</span><b>${esc(n)}</b><i>${k === w ? '+' + gain : pen[k] ? '-' + pen[k] : '0'}</i><small>${num(C.scores[k])} ${t('pts')}</small></span>`).join('');
  setTimeout(() => { b.hidden = false; }, w === 0 ? 1400 : 700);
}

/* ---------- bots ---------- */
function choose(p) {
  const hand = C.hands[p], all = combos(hand), n = hand.length;
  const others = [1, 2, 3].map(k => (p + k) % 4), nextLeft = C.hands[others[0]].length, danger = Math.min(...others.map(k => C.hands[k].length)) <= 2;
  const groupSize = c => hand.filter(x => x.r === c.r).length;
  const cost = m => {
    let s = m.cs.reduce((a, c) => a + rv(c), 0) / m.cs.length;
    if (m.info.n === 1 && groupSize(m.cs[0]) >= 2) s += 3;           // don't break pairs for a single
    if (m.info.n === 2 && groupSize(m.cs[0]) === 3) s += 2;
    if (m.cs.some(c => c.r === 2) && n > 5 && !danger) s += 7;       // save the 2s
    if (m.info.n === 5) s -= 3; else if (m.info.n >= 2) s -= 1.2;    // shed more cards at once
    return s;
  };
  if (!C.cur) {
    let cand = C.first ? all.filter(m => m.cs.some(is3d)) : all;
    if (C.first) { const big = cand.filter(m => m.info.n > 1); if (big.length && Math.random() < .7) cand = big; }
    if (nextLeft === 1) { const multi = cand.filter(m => m.info.n > 1); if (multi.length) cand = multi; else return cand.reduce((a, b) => b.info.key > a.info.key ? b : a).cs; }
    const best = cand.reduce((a, b) => cost(b) < cost(a) ? b : a);
    return best.cs;
  }
  const ok = all.filter(m => m.info.n === C.cur.info.n && beats(m.info, C.cur.info));
  if (!ok.length) return null;
  if (danger || n <= 3) return ok.reduce((a, b) => (b.info.rank || 0) * 100 + b.info.key > (a.info.rank || 0) * 100 + a.info.key ? b : a).cs;
  const best = ok.reduce((a, b) => cost(b) < cost(a) ? b : a);
  if (cost(best) > 13 && Math.random() < .6) return null;            // hold strong cards for later
  return best.cs;
}
function botMove(p) {
  if (C.over || C.turn !== p) return;
  const cs = choose(p);
  if (!cs) { pass(p); return; }
  play(p, cs);
}

/* ---------- speech ---------- */
function seatEl(s) { return s === 0 ? $('capMe') : $('capS' + s); }
function shout(s, txt) { const el = seatEl(s); if (el) J.floatText(el.querySelector('.av') || el, txt); }

/* ---------- render ---------- */
const face = (c, cls) => J.cardFace(c, {cls: cls || ''});
function render(dealing) {
  if (!C.on) return; const nm = names(), reveal = C.over;
  for (let s = 1; s < 4; s++) {
    const el = $('capS' + s), h = C.hands[s], lp = C.last[s];
    el.className = `cap-seat s${s}${C.turn === s && !C.over ? ' turn' : ''}${C.result && C.result.w === s ? ' win' : ''}`;
    el.innerHTML = `<div class="cap-who"><span class="av">${J.avatarSVG(seed(s), true)}</span><div><b>${esc(nm[s])}</b><span>${t('left', {k: h.length})} · ${num(C.scores[s])}</span></div>${C.turn === s && !C.over ? '<span class="bubble b-think"><span>•</span><span>•</span><span>•</span></span>' : ''}${C.passed[s] && !C.over ? `<span class="cap-pass">${t('passed')}</span>` : ''}</div>
      <div class="cap-backs${reveal ? ' open' : ''}">${reveal ? h.map(c => face(c)).join('') : h.map(() => '<div class="card back"></div>').join('')}</div>${h.length === 1 && !C.over ? '<i class="cap-one">1</i>' : ''}`;
  }
  const me = $('capMe'); me.className = `cap-me${C.turn === 0 && !C.over ? ' turn' : ''}${C.result && C.result.w === 0 ? ' win' : ''}`;
  me.innerHTML = `<span class="av">${J.avatarSVG(seed(0), false)}</span><div><b>${esc(nm[0])}</b><span>${num(C.scores[0])} ${t('pts')}</span></div>${C.passed[0] && !C.over ? `<span class="cap-pass">${t('passed')}</span>` : ''}`;
  const cen = $('capCenter');
  if (C.cur) { cen.innerHTML = `<div class="cap-play n${C.cur.cs.length}">${C.cur.cs.map((c, i) => face(c, 'cap-in')).join('')}</div><span class="cap-lbl"><b>${esc(nm[C.cur.by])}</b> · ${esc(comboName(C.cur.info, C.cur.cs))}</span>`; }
  else cen.innerHTML = `<span class="cap-empty">${C.over ? '' : C.turn === 0 ? (C.first ? '3♦' : '✨') : ''}</span>`;
  $('capRound').textContent = '#' + C.handNo; $('capPts').textContent = num(C.scores[0]);
  renderHand(dealing); renderActs();
}
function renderHand(dealing) {
  const h = C.hands[0], el = $('capHand');
  el.innerHTML = h.map((c, i) => `<button type="button" class="cap-c${C.sel.has(c.id) ? ' sel' : ''}" data-id="${c.id}" style="--i:${i}" aria-label="${RL(c.r)} ${SUIT[c.s]}">${face(c, dealing ? 'deal' : '')}</button>`).join('');
  fitHand();
}
function fitHand() {
  const el = $('capHand'); const n = C.hands[0].length; if (!el || !el.clientWidth || !n) return;
  const W = el.clientWidth - 8, step = .62, cw = Math.max(34, Math.min(innerHeight < 540 && innerWidth > innerHeight ? Math.min(52, Math.max(34, (innerHeight - 200) / 2.6)) : 84, W / (1 + (n - 1) * step)));
  el.style.setProperty('--cw', cw.toFixed(1) + 'px'); el.style.setProperty('--ov', (-(cw * (1 - step))).toFixed(1) + 'px');
}
function renderActs() {
  const st = $('capStatus'), a = $('capActs'); const nm = names();
  const selCs = C.hands[0].filter(c => C.sel.has(c.id)), info = selCs.length ? classify(selCs) : null;
  if (C.over) { st.innerHTML = C.result.w === 0 ? `<b>${t('youWon', {c: num(C.result.gain * 10)})}</b>` : `<b>${esc(t('won', {n: nm[C.result.w]}))}</b>`; a.innerHTML = `<button class="btn btn-raise" type="button" data-a="next">${t('next')}</button><button class="btn btn-fold" type="button" data-a="newm">${t('newm')}</button>`; return; }
  if (C.turn !== 0) { st.innerHTML = esc(t('thinking', {n: nm[C.turn]})); }
  else st.innerHTML = `<b>${t('yourTurn')}</b> · ${esc(C.first ? t('start') : C.cur ? t('beat', {x: comboName(C.cur.info, C.cur.cs)}) : t('lead'))}${selCs.length ? ` · <span class="cap-selinfo${info ? '' : ' bad'}">${info ? esc(comboName(info, selCs)) : '✕'}</span>` : ''}`;
  const my = C.turn === 0;
  const canPlay = my && info && !legal(0, selCs).err;
  a.innerHTML = `<button class="btn btn-fold cap-tool" type="button" data-a="sort">${C.sortBy === 'r' ? t('sortS') : t('sortR')}</button><button class="btn btn-fold cap-tool" type="button" data-a="hint"${my ? '' : ' disabled'}>💡 ${t('hint')}</button><button class="btn btn-fold" type="button" data-a="pass"${my && C.cur ? '' : ' disabled'}>${t('pass')}</button><button class="btn btn-raise" type="button" data-a="play"${canPlay ? '' : ' disabled'}>${t('play')}${selCs.length ? ` (${selCs.length})` : ''}</button>`;
}

/* ---------- input ---------- */
$('capHand').addEventListener('click', e => {
  const b = e.target.closest('.cap-c'); if (!b || C.over) return; const id = Number(b.dataset.id);
  if (C.sel.has(id)) C.sel.delete(id); else C.sel.add(id); SFX.click(); renderHand(); renderActs();
});
$('capActs').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a;
  if (a === 'next') return deal(); if (a === 'newm') return newMatch();
  if (a === 'sort') { C.sortBy = C.sortBy === 'r' ? 's' : 'r'; sortHand(C.hands[0]); renderHand(); renderActs(); SFX.riffle(); return; }
  if (C.turn !== 0 || C.over) return;
  if (a === 'hint') { const cs = choose(0); C.sel.clear(); if (cs) { cs.forEach(c => C.sel.add(c.id)); renderHand(); renderActs(); } else J.toast(`<span class="t-ic">💡</span><span>${esc(t('noHint'))}</span>`, '', 2200); return; }
  if (a === 'pass') { const r = pass(0); if (r.err) J.toast(esc(r.err), '', 2000); return; }
  if (a === 'play') { const cs = C.hands[0].filter(c => C.sel.has(c.id)); const r = play(0, cs); if (r.err) { J.toast(esc(r.err), '', 2200); SFX.bad(); } }
});
document.addEventListener('keydown', e => { if (J.current !== 'cap' || J.anyModal()) return; if (e.key === 'Enter') { const b = $('capActs').querySelector('[data-a="play"]:not([disabled])') || $('capActs').querySelector('[data-a="next"]'); if (b) { e.preventDefault(); b.click(); } } });

/* ---------- screen ---------- */
function fit() {
  fitHand(); const st = $('capStage'), tb = $('capTable'); const W = st.clientWidth - 16, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return;
  const tall = W / H < 1.05; const ratio = tall ? Math.max(.62, Math.min(.85, W / H)) : Math.min(2, Math.max(1.4, W / H));
  const w = Math.max(260, Math.min(W, H * ratio)); tb.style.width = w + 'px'; tb.style.height = (w / ratio) + 'px'; tb.classList.toggle('tall', tall); tb.classList.toggle('short', !tall && w / ratio < 330);
}
new ResizeObserver(() => { if (J.current === 'cap') fit(); }).observe($('capStage'));
new ResizeObserver(() => { if (J.current === 'cap') fitHand(); }).observe($('capHand'));
function open() { J.show('cap'); fit(); if (!C.on) newMatch(); else { render(); schedule(); } }
J.registerScreen('cap', {hide() { C.tok++; }});
$('capBtn').onclick = open;
J.onSettings(() => { if (J.current === 'cap' && C.on) render(); });
J._cap = {C, classify, beats, combos, choose, play, pass};
$('gcCap').innerHTML = [{r: 2, s: 0}, {r: 2, s: 1}, {r: 3, s: 2}].map((c, i) => J.cardFace(c, {})).join('');
})();
