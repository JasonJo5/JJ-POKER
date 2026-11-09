/* JJ POKER — Finger Roulette (everyone holds a finger on the screen, the phone picks)
   and the Casino / Casual / Party filter on the home screen. */
(() => {
'use strict';
const J = window.JJ, {$, SFX} = J;
const D = {
  en:{hold:'Everyone put a finger on the screen',hold2:'Hold still…',mouse:'No touch screen? Click to drop a spot, click it again to remove it.',need:'{k} fingers · need at least 2',one:'Who drinks',two:'Two drink',teams:'Teams',order:'Who goes first',drinks:'This finger drinks! 🍺',drink2:'These two drink! 🍺',teamA:'Team pink',teamB:'Team blue',teamT:'Teams are set!',orderT:'That is the order!',lift:'Lift all fingers to play again',fingers:'{k} fingers'},
  ko:{hold:'모두 화면에 손가락을 올려요',hold2:'움직이지 마세요…',mouse:'터치 화면이 없나요? 클릭하면 점이 생기고, 다시 클릭하면 지워져요.',need:'손가락 {k}개 · 최소 2개 필요',one:'마실 사람',two:'두 명 마시기',teams:'팀 나누기',order:'순서 정하기',drinks:'이 손가락이 마셔요! 🍺',drink2:'이 두 사람이 마셔요! 🍺',teamA:'핑크 팀',teamB:'블루 팀',teamT:'팀이 정해졌어요!',orderT:'순서가 정해졌어요!',lift:'다시 하려면 손가락을 모두 떼세요',fingers:'손가락 {k}개'},
  zh:{hold:'所有人把一根手指放在屏幕上',hold2:'别动…',mouse:'没有触摸屏？点击放一个点，再点一次移除。',need:'{k} 根手指 · 至少需要2根',one:'谁喝',two:'两个人喝',teams:'分队',order:'谁先来',drinks:'这根手指喝！🍺',drink2:'这两个人喝！🍺',teamA:'粉队',teamB:'蓝队',teamT:'队伍分好了！',orderT:'顺序定好了！',lift:'松开所有手指再玩一次',fingers:'{k} 根手指'},
  id:{hold:'Semua taruh satu jari di layar',hold2:'Tahan…',mouse:'Tidak ada layar sentuh? Klik untuk menaruh titik, klik lagi untuk menghapus.',need:'{k} jari · minimal 2',one:'Siapa minum',two:'Dua orang minum',teams:'Bagi tim',order:'Siapa duluan',drinks:'Jari ini minum! 🍺',drink2:'Dua orang ini minum! 🍺',teamA:'Tim pink',teamB:'Tim biru',teamT:'Tim sudah dibagi!',orderT:'Urutannya sudah jadi!',lift:'Angkat semua jari untuk main lagi',fingers:'{k} jari'},
};
const t = J.party.t(D);
const COL = ['#ff6b4a', '#ffc83d', '#22c995', '#6fdcff', '#b994ff', '#ff7aa8', '#8fb0ff', '#c8e86b', '#ffb347', '#5ee3c5'];
const F = {pts: new Map(), phase: 'wait', mode: 'one', timer: 0, raf: 0, uid: 0, pick: []};
const stage = () => $('frStage');

function relPos(e) { const r = stage().getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; }
function addPt(id, x, y, pinned) {
  if (F.pts.size >= 10) return;
  const used = new Set([...F.pts.values()].map(p => p.c)); const c = COL.find(x => !used.has(x)) || COL[F.uid % COL.length]; F.uid++;
  const el = document.createElement('div'); el.className = 'fr-dot'; el.style.setProperty('--c', c); el.innerHTML = '<i></i><b></b>';
  stage().appendChild(el); const p = {id, x, y, c, el, pinned}; F.pts.set(id, p); place(p);
  J.tone && J.tone(420 + F.pts.size * 60, .07, 'sine', .06); J.buzz && J.buzz(10);
  changed();
}
function place(p) { p.el.style.transform = `translate(${p.x}px,${p.y}px)`; }
function rmPt(id) { const p = F.pts.get(id); if (!p) return; F.pts.delete(id); if (F.phase === 'done') { p.el.classList.add('gone'); setTimeout(() => p.el.remove(), 300); } else p.el.remove(); changed(true); }
function changed(removed) {
  if (F.phase === 'done') { if (!F.pts.size) reset(); return; }
  if (F.phase === 'spin') { if (removed && F.pts.size < 2) reset(); return; }
  clearTimeout(F.timer); F.phase = 'wait'; stage().classList.remove('arming');
  F.pts.forEach(p => p.el.classList.remove('arm'));
  status();
  if (F.pts.size >= 2) {
    F.timer = setTimeout(() => {
      F.phase = 'arm'; stage().classList.add('arming'); F.pts.forEach(p => p.el.classList.add('arm')); status(); SFX.tick();
      F.timer = setTimeout(spin, 1500);
    }, 900);
  }
}
function status() {
  const n = F.pts.size, st = $('frStatus');
  st.textContent = F.phase === 'arm' ? t('hold2') : n >= 2 ? t('fingers', {k: n}) : n ? t('need', {k: n}) : t('hold');
  $('frHint').hidden = n > 0;
}
function spin() {
  if (F.pts.size < 2) return; F.phase = 'spin'; stage().classList.remove('arming');
  const pts = [...F.pts.values()]; const order = J.shuffle(pts.slice());
  const want = F.mode === 'two' ? Math.min(2, pts.length - 1) : 1;
  const target = order[0]; let k = 0, delay = 60; const total = 18 + Math.floor(Math.random() * pts.length);
  const step = () => {
    if (F.phase !== 'spin') return;
    pts.forEach(p => p.el.classList.remove('hot')); const p = pts[k % pts.length]; p.el.classList.add('hot'); SFX.tick(); J.buzz && J.buzz(6);
    k++; if (k >= total && p === target) { finish(order, want); return; }
    delay = Math.min(260, delay * 1.09); F.timer = setTimeout(step, delay);
  };
  step();
}
function finish(order, want) {
  F.phase = 'done'; const pts = [...F.pts.values()]; pts.forEach(p => p.el.classList.remove('hot', 'arm'));
  const st = stage(); st.classList.add('done');
  if (F.mode === 'one' || F.mode === 'two') {
    const win = order.slice(0, want); pts.forEach(p => p.el.classList.add(win.includes(p) ? 'win' : 'lose'));
    st.style.setProperty('--flood', win[0].c); st.classList.add('flood');
    $('frStatus').textContent = want > 1 ? t('drink2') : t('drinks');
    SFX.splat(); J.buzz && J.buzz([80, 50, 80]);
    win.forEach(p => { const r = p.el.getBoundingClientRect(); J.burst(r.left + r.width / 2, r.top + r.height / 2, ['🍺', '💥', '✨'], 14, {dist: 140, size: 28}); });
  } else if (F.mode === 'teams') {
    order.forEach((p, i) => { p.el.classList.add('team', i % 2 ? 'tb' : 'ta'); p.el.querySelector('b').textContent = i % 2 ? 'B' : 'A'; });
    $('frStatus').textContent = t('teamT'); SFX.chime();
  } else {
    order.forEach((p, i) => { p.el.classList.add('ord'); p.el.querySelector('b').textContent = i + 1; p.el.style.setProperty('--dl', i * 120 + 'ms'); });
    $('frStatus').textContent = t('orderT'); SFX.chime();
  }
  $('frLift').hidden = false; $('frLift').textContent = t('lift');
  J.unlock && J.unlock('fr_spin'); J.stat && J.stat('frSpins');
}
function reset() {
  clearTimeout(F.timer); F.phase = 'wait'; const st = stage(); st.classList.remove('done', 'flood', 'arming');
  st.querySelectorAll('.fr-dot').forEach(d => { if (![...F.pts.values()].some(p => p.el === d)) d.remove(); });
  F.pts.forEach(p => { p.el.className = 'fr-dot'; p.el.querySelector('b').textContent = ''; });
  $('frLift').hidden = true; status();
}

/* touch: hold a finger down. mouse: click to drop a spot, click the spot to remove it */
const st = $('frStage');
st.addEventListener('pointerdown', e => {
  if (J.current !== 'fr') return; e.preventDefault();
  if (F.phase === 'done' && e.pointerType !== 'touch') { const d = e.target.closest('.fr-dot'); if (!d) { [...F.pts.keys()].forEach(rmPt); return; } }
  if (e.pointerType === 'touch' || e.pointerType === 'pen') { if (F.phase === 'done') return; try { st.setPointerCapture(e.pointerId); } catch (x) {} const {x, y} = relPos(e); addPt('t' + e.pointerId, x, y, false); return; }
  const d = e.target.closest('.fr-dot'); if (d) { const p = [...F.pts.values()].find(p => p.el === d); if (p) { rmPt(p.id); return; } }
  if (F.phase === 'spin') return;
  const {x, y} = relPos(e); addPt('m' + (F.uid + 1), x, y, true);
});
st.addEventListener('pointermove', e => { const p = F.pts.get('t' + e.pointerId); if (!p) return; const {x, y} = relPos(e); p.x = x; p.y = y; place(p); });
const up = e => { if (e.pointerType === 'mouse') return; rmPt('t' + e.pointerId); };
st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
st.addEventListener('contextmenu', e => e.preventDefault());
$('frModes').addEventListener('click', e => { const b = e.target.closest('[data-fm]'); if (!b) return; F.mode = b.dataset.fm; $('frModes').querySelectorAll('[data-fm]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); SFX.click(); if (F.phase === 'done') { [...F.pts.keys()].forEach(id => { if (F.pts.get(id).pinned) rmPt(id); }); reset(); } });
function labels() { $('frModes').querySelectorAll('[data-fm]').forEach(b => { b.textContent = t(b.dataset.fm); }); $('frHint').textContent = matchMedia('(pointer:coarse)').matches ? '☝️ ☝️ ☝️' : t('mouse'); status(); }
function open() { J.show('fr'); [...F.pts.keys()].forEach(rmPt); reset(); labels(); }
J.registerScreen('fr', {hide() { clearTimeout(F.timer); [...F.pts.keys()].forEach(rmPt); reset(); }});
$('frBtn').onclick = open;
J.onSettings(() => { if (J.current === 'fr') labels(); });
J._fr = {F, addPt, rmPt};
$('gcFR').innerHTML = '<div class="fr-art">' + [0, 1, 2, 3, 4].map(k => `<i style="--c:${COL[k]};--k:${k}"></i>`).join('') + '<span>☝️</span></div>';

/* ---------- home: Casino / Casual / Party ---------- */
const tabs = document.querySelector('.gsec-tabs');
if (tabs) {
  const setSec = k => { tabs.querySelectorAll('[data-gsec]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gsec === k))); document.querySelectorAll('[data-gsec-pane]').forEach(p => { p.hidden = k !== 'all' && p.dataset.gsecPane !== k; }); J.store.set('jj-gsec', k); };
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-gsec]'); if (b) { setSec(b.dataset.gsec); SFX.click(); } });
  const saved = J.store.get('jj-gsec'); if (saved && tabs.querySelector(`[data-gsec="${saved}"]`)) setSec(saved);
}
})();
