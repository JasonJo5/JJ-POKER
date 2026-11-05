/* JJ POKER — Lucky Slots: three reels, one payline, coins from your JJ wallet. */
(() => {
'use strict';
const J = window.JJ, {$, esc, num, SFX} = J;
const SYM = [
  {s:'🍒', w:26, pay:10}, {s:'🍋', w:22, pay:10}, {s:'🍊', w:18, pay:12}, {s:'🍉', w:13, pay:16},
  {s:'🔔', w:9, pay:25}, {s:'⭐', w:6, pay:40}, {s:'💎', w:4, pay:80}, {s:'7️⃣', w:2, pay:200},
];
const TOTAL = SYM.reduce((a, x) => a + x.w, 0);
const BETS = [10, 50, 100, 500];
const S = {bet: 10, spinning: false, auto: 0, reels: [0, 1, 2].map(() => [pick(), pick(), pick()]), last: 0, streak: 0, opened: false};
function pick() { let r = Math.random() * TOTAL; for (let i = 0; i < SYM.length; i++) { r -= SYM[i].w; if (r < 0) return i; } return 0; }

/* Payout in multiples of the bet for the middle row. */
function payout(a, b, c) {
  if (a === b && b === c) return {x: SYM[a].pay, kind: SYM[a].s === '7️⃣' ? 'jackpot' : 'three'};
  if (a === b) return {x: (SYM[a].s === '7️⃣' || SYM[a].s === '💎') ? 3 : 1.5, kind: 'pair'};
  const ch = [a, b, c].filter(i => SYM[i].s === '🍒').length;
  if (ch) return {x: ch * .5, kind: 'cherry'};
  return {x: 0, kind: 'none'};
}

/* ---------- build ---------- */
const reelEls = [...document.querySelectorAll('#slReels .sl-reel')];
function cell(i) { return `<span class="sl-sym">${SYM[i].s}</span>`; }
function paint() { reelEls.forEach((el, k) => { const st = el.querySelector('.sl-strip'); st.getAnimations().forEach(x => x.cancel()); el.querySelector('.sl-strip').innerHTML = S.reels[k].map(cell).join(''); el.querySelector('.sl-strip').style.transform = 'none'; }); }
function renderBar() {
  $('slCoins').textContent = num(J.P.coins);
  $('slBets').querySelectorAll('button').forEach(b => { const v = Number(b.dataset.v); b.setAttribute('aria-pressed', String(v === S.bet)); b.disabled = S.spinning || v > J.P.coins; });
  $('slSpin').disabled = S.spinning && !S.auto || J.P.coins < S.bet && !S.spinning;
  $('slSpin').textContent = S.spinning ? '…' : 'Spin';
  $('slAuto').textContent = S.auto ? `Stop (${S.auto})` : 'Auto ×10';
  $('slAuto').classList.toggle('on', !!S.auto);
  $('slJack').textContent = num(S.bet * 200);
  $('slBroke').hidden = !(J.P.coins < BETS[0] && !S.spinning);
  $('slLast').textContent = S.last ? '+' + num(S.last) : '—';
  $('slStreak').textContent = S.streak;
}
function fit() {
  const st = $('slStage'), m = $('slMachine'); const W = st.clientWidth - 16, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return;
  const ratio = .82; const w = Math.max(220, Math.min(W * .86, H * ratio, 560)); m.style.width = w + 'px'; m.style.height = (w / ratio) + 'px';
}
new ResizeObserver(() => { if (J.current === 'slots') fit(); }).observe($('slStage'));
$('slPay').innerHTML = SYM.slice().reverse().map(x => `<li><span>${x.s}${x.s}${x.s}</span><b>${x.pay}×</b></li>`).join('') +
  `<li><span>7️⃣7️⃣ · 💎💎</span><b>3×</b></li><li><span>Any pair (left)</span><b>1.5×</b></li><li><span>Each 🍒</span><b>0.5×</b></li>`;
$('slBets').innerHTML = BETS.map(v => `<button type="button" data-v="${v}">${num(v)}</button>`).join('');
$('slBets').onclick = e => { const b = e.target.closest('button[data-v]'); if (!b || S.spinning) return; S.bet = Number(b.dataset.v); SFX.pop(); renderBar(); };

/* ---------- spin ---------- */
const wait = ms => new Promise(r => setTimeout(r, ms));
function status(t) { $('slStatus').innerHTML = t; }
async function spin() {
  if (S.spinning) return;
  if (J.P.coins < S.bet) { status(`<b>Not enough coins</b> for a ${num(S.bet)} bet.`); S.auto = 0; renderBar(); return; }
  S.spinning = true; J.addCoins(-S.bet); J.stat('slSpins');
  const final = [pick(), pick(), pick()];
  // A little drama: sometimes tease the jackpot on the first two reels
  if (Math.random() < .04) { final[0] = 7; final[1] = 7; }
  renderBar(); status('Spinning…'); $('slMachine').classList.remove('win', 'big', 'jack');
  const lever = $('slLever'); lever.classList.remove('pull'); void lever.offsetWidth; lever.classList.add('pull');
  SFX.whoosh();
  const symH = reelEls[0].clientHeight / 3, anims = [];
  reelEls.forEach((el, k) => {
    const strip = el.querySelector('.sl-strip'); const n = 18 + k * 7; const seq = [];
    for (let i = 0; i < n; i++) seq.push(pick());
    const all = S.reels[k].concat(seq, [pick(), final[k], pick()]);
    strip.innerHTML = all.map(cell).join('');
    const dist = (all.length - 3) * symH;
    const dur = 1100 + k * 420;
    el.classList.add('spin');
    const a = strip.animate([{transform: 'translateY(0)'}, {transform: `translateY(${-dist - symH * .35}px)`, offset: .9}, {transform: `translateY(${-dist}px)`}], {duration: J.animOn() ? dur : 10, easing: 'cubic-bezier(.35,.05,.25,1)', fill: 'forwards'});
    anims.push(a.finished.then(() => { el.classList.remove('spin'); SFX.check(); S.reels[k] = all.slice(-3); }));
    if (J.animOn()) for (let t = 120; t < dur - 100; t += 110) setTimeout(() => SFX.card(0), t);
  });
  await Promise.all(anims);
  paint();
  const [a, b, c] = final; const r = payout(a, b, c); const win = Math.round(S.bet * r.x);
  const mid = [...document.querySelectorAll('#slReels .sl-reel')].map(el => el.querySelectorAll('.sl-sym')[1]);
  if (win > 0) {
    S.last = win; S.streak++;
    const which = r.kind === 'three' || r.kind === 'jackpot' ? [0, 1, 2] : r.kind === 'pair' ? [0, 1] : [0, 1, 2].filter(i => SYM[final[i]].s === '🍒');
    which.forEach(i => mid[i] && mid[i].classList.add('hit'));
    J.addCoins(win); J.stat('slWon', win);
    const mx = $('slMachine');
    J.flyChips($('slReels'), $('slCoinsBox'), Math.min(12, 3 + Math.round(r.x)), 0, {coin: true});
    J.floatText($('slReels'), `+${num(win)}`, r.x >= 20 ? 'gold' : 'mint');
    if (r.kind === 'jackpot') {
      mx.classList.add('jack'); status(`<b>JACKPOT!</b> 7️⃣7️⃣7️⃣ pays ${num(win)} coins!`); SFX.win(); J.playMeme && J.playMeme(10);
      const rr = $('slReels').getBoundingClientRect(); J.burst(rr.left + rr.width / 2, rr.top, ['🪙', '💰', '✨'], 30, {angle: -Math.PI / 2, cone: 2.4, dist: 260, size: 30, dur: 1600, stagger: 20});
      J.confetti(); J.unlock('sl_jack'); S.auto = 0;
      setTimeout(() => J.finisher({list: [{seed: J.myAvSeed + '|' + J.nick(), bot: false, name: J.nick() || ''}], top: 'JACKPOT', say: `+${num(win)} COINS`, big: true, dur: 3000}), 500);
    } else if (r.x >= 20) {
      mx.classList.add('big'); status(`<b>Big win!</b> ${esc(SYM[a].s.repeat(3))} pays ${num(win)} coins.`); SFX.win(); J.confetti(); J.unlock('sl_big');
      const rr = $('slReels').getBoundingClientRect(); J.burst(rr.left + rr.width / 2, rr.top + rr.height / 2, ['🪙', '✨'], 18, {dist: 200, size: 26});
    } else { mx.classList.add('win'); status(`<b>Win!</b> +${num(win)} coins.`); SFX.cash(); }
    J.addXP(Math.min(40, 2 + Math.round(r.x)));
  } else {
    S.streak = 0;
    if (SYM[a].s === '7️⃣' && SYM[b].s === '7️⃣') status('<b>So close…</b> two sevens. One more and it was the jackpot.');
    else status(['No luck this time.', 'The machine is warming up.', 'Next one. Definitely the next one.', 'Spin to win'][Math.floor(Math.random() * 4)]);
  }
  S.spinning = false;
  if (S.auto > 0) { S.auto--; renderBar(); if (S.auto > 0 && J.current === 'slots') { await wait(win > 0 ? 900 : 350); if (S.auto > 0 && J.current === 'slots') return spin(); } }
  renderBar();
}
$('slSpin').onclick = () => { if (S.auto) { S.auto = 0; renderBar(); return; } spin(); };
$('slLever').onclick = () => spin();
$('slAuto').onclick = () => { if (S.auto) { S.auto = 0; renderBar(); return; } S.auto = 10; renderBar(); spin(); };
$('slFree').onclick = () => { J.addCoins(500); J.floatText($('slCoinsBox'), '+500', 'gold'); SFX.coins && SFX.coins(); renderBar(); };
document.addEventListener('keydown', e => { if (J.current !== 'slots' || J.anyModal()) return; if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); spin(); } });
J.onProfile && J.onProfile(() => { if (J.current === 'slots' && !S.spinning) renderBar(); });

/* ---------- screen ---------- */
function open() {
  J.show('slots'); $('slMeAv').innerHTML = J.avatarSVG(J.myAvSeed + '|' + J.nick(), false);
  paint(); fit(); renderBar();
  if (!S.opened) { S.opened = true; status('Pick a bet, then pull the lever.'); }
}
J.registerScreen('slots', {hide() { S.auto = 0; }});
J.onSettings(() => { if (J.current === 'slots') $('slMeAv').innerHTML = J.avatarSVG(J.myAvSeed + '|' + J.nick(), false); });
$('slBtn').onclick = open;
$('gcSL').innerHTML = '<div class="mini-reels"><span>7️⃣</span><span>7️⃣</span><span>7️⃣</span></div>';
})();
