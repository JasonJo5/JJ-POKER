/* JJ POKER — invites (QR code + link), joining from a link, and offline support for the website version. */
(() => {
'use strict';
const J = window.JJ, {$, esc, SFX} = J;
const D = {
  en:{invT:'Invite friends',invS:'Scan with a phone camera, or send the link.',invClaude:'Friends open JJ POKER here in Claude, then tap your table in the list or type this code.',copyLink:'Copy link',copyCode:'Copy code',share:'Share',copied:'Copied!',poker:'Poker Card',capsa:'Capsa',longshot:'Long Shot',joinT:'Join {g} table',joinS:"Table {c}. Type the name your friends know you by.",join:'Join table',nameReq:'Type your name first',waitNet:'Connecting…',noNet:'Online tables need an internet connection. Try again in a moment.',shareTxt:'Join my {g} table on JJ POKER: {c}',offReady:'Ready to play offline',offReadyS:'Bots, King\'s Cup, Ride the Bus and Finger Roulette now work with no signal.',update:'New version ready',updateS:'Tap to reload'},
  ko:{invT:'친구 초대',invS:'폰 카메라로 스캔하거나 링크를 보내세요.',invClaude:'친구가 Claude에서 JJ POKER를 열고 목록에서 내 방을 누르거나 이 코드를 입력하면 돼요.',copyLink:'링크 복사',copyCode:'코드 복사',share:'공유',copied:'복사됨!',poker:'포커 카드',capsa:'캡사',longshot:'롱샷',joinT:'{g} 방 참가',joinS:'{c} 방이에요. 친구들이 아는 이름을 입력하세요.',join:'참가하기',nameReq:'이름을 먼저 입력하세요',waitNet:'연결 중…',noNet:'온라인 방은 인터넷 연결이 필요해요. 잠시 후 다시 시도하세요.',shareTxt:'JJ POKER {g} 방에 들어와: {c}',offReady:'오프라인 준비 완료',offReadyS:'이제 봇 게임, 킹스컵, 버스 타기, 손가락 룰렛을 인터넷 없이 할 수 있어요.',update:'새 버전이 있어요',updateS:'눌러서 새로고침'},
  zh:{invT:'邀请朋友',invS:'用手机相机扫码，或者发送链接。',invClaude:'朋友在 Claude 里打开 JJ POKER，在列表里点你的牌桌，或者输入这个代码。',copyLink:'复制链接',copyCode:'复制代码',share:'分享',copied:'已复制！',poker:'扑克牌',capsa:'锄大地',longshot:'冷门王',joinT:'加入{g}牌桌',joinS:'牌桌 {c}。输入朋友认识你的名字。',join:'加入牌桌',nameReq:'请先输入名字',waitNet:'连接中…',noNet:'在线牌桌需要网络。请稍后再试。',shareTxt:'来 JJ POKER 加入我的{g}牌桌：{c}',offReady:'可以离线玩了',offReadyS:'机器人游戏、国王杯、坐巴士和手指轮盘现在没网也能玩。',update:'有新版本',updateS:'点一下刷新'},
  id:{invT:'Undang teman',invS:'Pindai dengan kamera ponsel, atau kirim tautannya.',invClaude:'Teman buka JJ POKER di Claude, lalu ketuk mejamu di daftar atau ketik kode ini.',copyLink:'Salin tautan',copyCode:'Salin kode',share:'Bagikan',copied:'Tersalin!',poker:'Kartu Poker',capsa:'Capsa',longshot:'Long Shot',joinT:'Gabung meja {g}',joinS:'Meja {c}. Ketik nama yang dikenal temanmu.',join:'Gabung meja',nameReq:'Ketik namamu dulu',waitNet:'Menghubungkan…',noNet:'Meja online butuh internet. Coba lagi sebentar.',shareTxt:'Gabung ke meja {g} aku di JJ POKER: {c}',offReady:'Siap main offline',offReadyS:'Bot, King\'s Cup, Naik Bus dan Rolet Jari sekarang bisa dimainkan tanpa sinyal.',update:'Versi baru tersedia',updateS:'Ketuk untuk memuat ulang'},
};
const t = (k, v) => { const L = (window.JJ_I18N && JJ_I18N.lang) || 'en'; let x = (D[L] || D.en)[k] || D.en[k] || k; if (v) for (const y in v) x = x.split('{' + y + '}').join(v[y]); return x; };
const WEB = !!window.JJ_WEB;           // the GitHub Pages copy (a real link friends can open)
const GAME = c => c.startsWith('c-') ? 'capsa' : c.startsWith('k-') ? 'longshot' : 'poker';
const linkFor = code => location.origin + location.pathname + '?join=' + encodeURIComponent(code);

/* ---------- QR code as SVG ---------- */
function qrSVG(text) {
  if (!window.JJQR) return '';
  const q = window.JJQR(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), m = 2; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
  return `<svg viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}

/* ---------- invite sheet ---------- */
let cur = '';
J.invite = (code, game) => {
  cur = code; const g = t(game || GAME(code)), link = linkFor(code);
  $('invT').textContent = t('invT'); $('invG').textContent = g; $('invCode').textContent = code;
  $('invS').textContent = WEB ? t('invS') : t('invClaude');
  $('invQR').innerHTML = WEB ? qrSVG(link) : ''; $('invQR').hidden = !WEB;
  $('invLink').textContent = WEB ? link.replace(/^https?:\/\//, '') : ''; $('invLink').hidden = !WEB;
  $('invCopyL').hidden = !WEB; $('invCopyL').textContent = t('copyLink'); $('invCopyC').textContent = t('copyCode');
  $('invShare').hidden = !(WEB && navigator.share); $('invShare').textContent = t('share');
  J.openModal('mInvite'); SFX.pop && SFX.pop();
};
async function copy(txt, btn) { const old = btn.textContent; try { await navigator.clipboard.writeText(txt); } catch (e) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (x) {} ta.remove(); } btn.textContent = t('copied'); setTimeout(() => { btn.textContent = old; }, 1400); }
$('invCopyL').onclick = e => copy(linkFor(cur), e.currentTarget);
$('invCopyC').onclick = e => copy(cur, e.currentTarget);
$('invShare').onclick = () => { navigator.share({title: 'JJ POKER', text: t('shareTxt', {g: t(GAME(cur)), c: cur}), url: linkFor(cur)}).catch(() => {}); };

/* ---------- opening an invite link: ?join=c-4k2m ---------- */
const CODE = /^[tck]-[a-z0-9]{4,8}$/;
const qs = new URLSearchParams(location.search), want = String(qs.get('join') || '').toLowerCase();
if (want) { qs.delete('join'); const rest = qs.toString(); try { history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash); } catch (e) {} }
let pending = CODE.test(want) ? want : '';
function askJoin() {
  if (!pending) return;
  $('jlT').textContent = t('joinT', {g: t(GAME(pending))}); $('jlS').textContent = t('joinS', {c: pending});
  $('jlName').value = J.cleanName(($('nick') || {}).value || ''); $('jlGo').textContent = t('join'); $('jlMsg').textContent = '';
  J.openModal('mJoinLink'); setTimeout(() => { if (!$('jlName').value) $('jlName').focus(); }, 300);
}
function go() {
  const nm = J.cleanName($('jlName').value); if (!nm) { $('jlMsg').textContent = t('nameReq'); $('jlName').focus(); return; }
  const nk = $('nick'); if (nk) { nk.value = nm; nk.dispatchEvent(new Event('input', {bubbles: true})); nk.dispatchEvent(new Event('change', {bubbles: true})); } J.store.set('jj-nick', nm);
  const st = J.net ? J.net.state() : 'none';
  if (st === 'wait') { $('jlMsg').textContent = t('waitNet'); setTimeout(go, 800); return; }
  if (st !== 'ok') { $('jlMsg').textContent = t('noNet'); return; }
  const code = pending; pending = ''; J.closeModals();
  if (code.startsWith('c-') && J.capJoin) J.capJoin(code);
  else if (code.startsWith('k-') && J.lsJoin) J.lsJoin(code);
  else if (J.net) J.net.join(code);
}
$('jlGo').onclick = go;
$('jlName').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
if (pending) setTimeout(askJoin, 600);

/* ---------- offline + instant start (website copy only) ---------- */
if (WEB && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const first = !navigator.serviceWorker.controller;
      const watch = w => w && w.addEventListener('statechange', () => {
        if (w.state !== 'installed') return;
        if (first) { if (!J.store.get('jj-offok')) { J.store.set('jj-offok', '1'); J.toast(`<span class="t-ic">✈️</span><span><b>${esc(t('offReady'))}</b><br>${esc(t('offReadyS'))}</span>`, '', 5000); } }
        else J.toast(`<span class="t-ic">✨</span><span><b>${esc(t('update'))}</b><br><a href="#" onclick="location.reload();return false" style="color:inherit">${esc(t('updateS'))}</a></span>`, '', 9000);
      });
      watch(reg.installing); reg.addEventListener('updatefound', () => watch(reg.installing));
      let told = false;
      navigator.serviceWorker.addEventListener('message', e => { if (told || !e.data || e.data.type !== 'jj-updated') return; told = true; J.toast(`<span class="t-ic">✨</span><span><b>${esc(t('update'))}</b><br><a href="#" onclick="location.reload();return false" style="color:inherit">${esc(t('updateS'))}</a></span>`, '', 9000); });
    }).catch(() => {});
  });
}
J._online = {qrSVG, askJoin, linkFor};
})();
