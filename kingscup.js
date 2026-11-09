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
  en: {14:['Nunchi count','Count up together from 1, in no order, one number each. Two people say a number at the same time? Both drink. Whoever is left last drinks.'],2:['You','Pick someone to drink.'],3:['Me','You drink.'],4:['Thumb master','You are the thumb master until someone else draws a 4. Any time you put your thumb on the table, everyone must copy you. Last one drinks.'],5:['Guys','All the guys drink.'],6:['Girls','All the girls drink.'],7:['Heaven','Everyone point up! Last one drinks.'],8:['Mate','Pick a mate. Whenever you drink, they drink too, until someone else draws an 8.'],9:['3-6-9','Count up around the circle, starting with you. Clap instead of saying any number with a 3, 6 or 9 in it (33 is two claps). First to slip up drinks.'],10:['Categories','Pick a category. Go around naming things in it. First to fail drinks.'],11:['Make a rule','Make a rule everyone must follow. Break it, drink.'],12:['Question master','You are the question master. Anyone who answers your questions drinks.'],13:["King's cup",'Pour some of your drink into the cup. The 4th king drinks it all!']},
  ko: {14:['눈치 게임','다 같이 1부터 순서 없이 숫자를 외쳐요. 한 사람당 한 번! 동시에 외치면 둘 다 마시고, 끝까지 못 외친 마지막 사람도 마셔요.'],2:['너','마실 사람을 지목하세요.'],3:['나','내가 마셔요.'],4:['엄지왕','다음 4가 나올 때까지 내가 엄지왕! 언제든 엄지를 테이블에 올리면 모두 따라 해야 해요. 꼴찌가 마셔요.'],5:['남자','남자들 모두 마셔요.'],6:['여자','여자들 모두 마셔요.'],7:['천국','모두 손가락으로 하늘을! 꼴찌가 마셔요.'],8:['짝꿍','짝꿍을 고르세요. 누가 8을 뽑을 때까지 내가 마시면 짝꿍도 마셔요.'],9:['3-6-9','나부터 돌아가며 숫자를 세요. 3, 6, 9가 들어간 숫자는 말 대신 박수! (33은 박수 두 번) 틀리면 마셔요.'],10:['카테고리','주제를 정하고 돌아가며 말해요. 못 하면 마셔요.'],11:['규칙 만들기','모두가 지켜야 할 규칙을 만들어요. 어기면 마셔요.'],12:['질문왕','내가 질문왕! 내 질문에 대답하는 사람은 마셔요.'],13:['킹스컵','내 술을 컵에 조금 부어요. 4번째 킹을 뽑은 사람이 다 마셔요!']},
  zh: {14:['眼力报数','大家一起从1开始报数，不按顺序，每人只能报一次。两人同时报，一起喝；最后剩下没报的人也喝。'],2:['你','指定一个人喝。'],3:['我','自己喝。'],4:['拇指大师','在下一个人抽到4之前，你是拇指大师。你随时把拇指放到桌上，所有人都要跟着放，最后一个喝。'],5:['男生','所有男生喝。'],6:['女生','所有女生喝。'],7:['天堂','所有人手指向天！最后一个喝。'],8:['伙伴','选一个伙伴。你喝他也喝，直到有人抽到8。'],9:['3-6-9','从你开始轮流报数。数字里有3、6或9时不说，改拍手（33拍两下）。出错的人喝。'],10:['分类','选一个类别，轮流说出属于它的东西。说不出的喝。'],11:['定规则','定一条大家必须遵守的规则。违反就喝。'],12:['问题大师','你是问题大师。谁回答你的问题谁就喝。'],13:['国王杯','往中间的杯子里倒一点你的酒。抽到第4张K的人全部喝掉！']},
  id: {14:['Hitung nunchi','Hitung bersama dari 1, tanpa urutan, satu angka per orang. Dua orang bilang angka bersamaan? Dua-duanya minum. Yang terakhir tersisa juga minum.'],2:['Kamu','Tunjuk seseorang untuk minum.'],3:['Aku','Kamu minum.'],4:['Raja jempol','Kamu raja jempol sampai ada yang dapat 4. Kapan pun kamu taruh jempol di meja, semua harus ikut. Yang terakhir minum.'],5:['Cowok','Semua cowok minum.'],6:['Cewek','Semua cewek minum.'],7:['Surga','Semua tunjuk ke atas! Yang terakhir minum.'],8:['Pasangan','Pilih pasangan. Setiap kamu minum, dia ikut minum, sampai ada yang dapat 8.'],9:['3-6-9','Berhitung bergiliran mulai dari kamu. Angka yang ada 3, 6 atau 9-nya diganti tepuk tangan (33 = dua tepukan). Yang salah minum.'],10:['Kategori','Pilih kategori. Bergiliran sebut isinya. Yang gagal minum.'],11:['Buat aturan','Buat aturan yang harus diikuti semua. Melanggar, minum.'],12:['Raja tanya','Kamu raja tanya. Siapa pun yang menjawab pertanyaanmu minum.'],13:['Cangkir raja','Tuang sedikit minumanmu ke cangkir. Raja ke-4 minum semuanya!']},
};
const UI = {
  en:{idleT:'No game running',idleS:'Add your players and start a new game.',startNew:'Start a game',resT:'Game in progress',resS:'{n} cards left · {k} of 4 kings · {p} is up next',cont:'Continue',endg:'End game',pick:'{n}, pick a card!',tm:'Thumb master',masters:'Masters',playScr:'Play it on screen',outLoud:'We played it out loud',sipT:'+1 sip',sips:'sips',most:'Most sips: {n} ({k})',tapSip:'Tap a player to add a sip',nHow:'Shout the next number and tap your own face at the same moment. Same time as someone? Both drink. Last one left drinks.',getReady:'Get ready…',go:'GO!',nextN:'Next number: {n}',clash:'Same time! {a} and {b} drink',lastOne:'{n} was last. Drink!',drinks:'Drinks',finish:'Done',cHow:'Say the number out loud, or clap if it has a 3, 6 or 9 in it. Tap what you did before the time runs out!',sayN:'Say {n}',clap:'Clap',clap2:'Clap clap',wrongC:'Wrong! {n} needed {x}.',slowC:'Too slow!',drinkN:'{n} drinks!',reached:'You reached {n}',startG:'Start',saidIt:'say it',claps1:'one clap',claps2:'two claps',sayIt:'Say it',yourTurn:'{n}, your turn',dragHint:'Drag a card to the cup, or tap one',passTo:'Pass the phone to',tapReady:'Tap when you have it',last:'Last cards',title:"King's Cup",sub:'Pass the phone. Tap a card. Do what it says.',turn:'{n}, tap a card',drew:'{n} drew',kings:'Kings',left:'cards left',players:'Players',add:'Add',start:'Start',newg:'New game',rules:'Rules',mates:'Mates',active:'Rules in play',qm:'Question master',none:'Nothing yet',idea:'Need an idea?',cupT:"KING'S CUP!",cupS:'{n} drinks the cup!',done:'Deck finished',doneS:'That was the last card. Shuffle up for another round?',namePh:'Player name',rulePh:'Type the new rule…',save:'Save',pickMate:'Pick your mate',edit:'Edit rules',reset:'Reset to classic',note:'For adults of legal drinking age. Any drink works: water, juice or soda. Know your limits, and never drink and drive.',next:'Next player',skip:'Pass',min:'Add at least 2 players',ready:'Done',kingN:'King {k} of 4'},
  ko:{idleT:'진행 중인 게임 없음',idleS:'플레이어를 추가하고 새 게임을 시작하세요.',startNew:'게임 시작',resT:'진행 중인 게임',resS:'{n}장 남음 · 킹 {k}/4 · 다음은 {p} 님',cont:'이어하기',endg:'게임 끝내기',pick:'{n}, 카드를 고르세요!',tm:'엄지왕',masters:'왕',playScr:'화면으로 하기',outLoud:'말로 했어요',sipT:'+1 잔',sips:'잔',most:'가장 많이 마신 사람: {n} ({k})',tapSip:'플레이어를 누르면 한 잔 추가',nHow:'다음 숫자를 외치면서 동시에 내 얼굴을 누르세요. 누구랑 동시에? 둘 다 마셔요. 마지막 사람도 마셔요.',getReady:'준비…',go:'시작!',nextN:'다음 숫자: {n}',clash:'동시에! {a}, {b} 마셔요',lastOne:'{n} 님이 마지막. 마셔요!',drinks:'마실 사람',finish:'완료',cHow:'숫자를 말하거나, 3·6·9가 들어가면 박수! 시간이 끝나기 전에 한 것을 누르세요!',sayN:'{n} 말하기',clap:'박수',clap2:'박수 두 번',wrongC:'땡! {n}은(는) {x}',slowC:'너무 느려요!',drinkN:'{n} 님 마셔요!',reached:'{n}까지 갔어요',startG:'시작',saidIt:'말하기',claps1:'박수 한 번',claps2:'박수 두 번',sayIt:'말하기',yourTurn:'{n} 님 차례',dragHint:'카드를 컵으로 끌어오거나 누르세요',passTo:'폰을 넘겨주세요',tapReady:'받았으면 누르세요',last:'최근 카드',title:'킹스컵',sub:'폰을 돌려요. 카드를 누르고, 적힌 대로 하세요.',turn:'{n}, 카드를 누르세요',drew:'{n} 님이 뽑은 카드',kings:'킹',left:'장 남음',players:'플레이어',add:'추가',start:'시작',newg:'새 게임',rules:'규칙',mates:'짝꿍',active:'진행 중인 규칙',qm:'질문왕',none:'아직 없어요',idea:'아이디어가 필요해요?',cupT:'킹스컵!',cupS:'{n} 님이 컵을 마셔요!',done:'덱을 다 썼어요',doneS:'마지막 카드였어요. 한 판 더 할까요?',namePh:'이름',rulePh:'새 규칙을 입력하세요…',save:'저장',pickMate:'짝꿍을 고르세요',edit:'규칙 편집',reset:'기본 규칙으로',note:'법적 음주 가능 연령의 성인만. 물, 주스, 탄산음료도 OK. 적당히 마시고, 음주운전은 절대 안 돼요.',next:'다음 사람',skip:'넘기기',min:'플레이어를 2명 이상 추가하세요',ready:'완료',kingN:'킹 {k} / 4'},
  zh:{idleT:'还没开始游戏',idleS:'添加玩家，开始新游戏。',startNew:'开始游戏',resT:'游戏进行中',resS:'剩 {n} 张 · 已出 {k}/4 张K · 下一位 {p}',cont:'继续',endg:'结束游戏',pick:'{n}，抽一张牌！',tm:'拇指大师',masters:'大师',playScr:'在屏幕上玩',outLoud:'我们直接口头玩了',sipT:'+1 口',sips:'口',most:'喝得最多：{n}（{k}）',tapSip:'点玩家加一口',nHow:'喊出下一个数字的同时点自己的头像。和别人同时？一起喝。最后剩下的人也喝。',getReady:'准备…',go:'开始！',nextN:'下一个数字：{n}',clash:'同时了！{a} 和 {b} 喝',lastOne:'{n} 是最后一个，喝！',drinks:'要喝的人',finish:'完成',cHow:'把数字说出来，含3、6、9就拍手。时间到之前点你做了什么！',sayN:'说 {n}',clap:'拍手',clap2:'拍两下',wrongC:'错了！{n} 应该{x}',slowC:'太慢了！',drinkN:'{n} 喝！',reached:'数到了 {n}',startG:'开始',saidIt:'说出来',claps1:'拍一下',claps2:'拍两下',sayIt:'说出来',yourTurn:'轮到 {n}',dragHint:'把一张牌拖到杯子上，或直接点',passTo:'把手机交给',tapReady:'拿到后点一下',last:'最近的牌',title:'国王杯',sub:'手机传下去。点一张牌，照着做。',turn:'{n}，点一张牌',drew:'{n} 抽到了',kings:'K',left:'张剩余',players:'玩家',add:'添加',start:'开始',newg:'新游戏',rules:'规则',mates:'伙伴',active:'当前规则',qm:'问题大师',none:'暂无',idea:'需要灵感？',cupT:'国王杯！',cupS:'{n} 喝掉整杯！',done:'牌抽完了',doneS:'这是最后一张。再来一局？',namePh:'玩家名字',rulePh:'输入新规则…',save:'保存',pickMate:'选你的伙伴',edit:'编辑规则',reset:'恢复经典规则',note:'仅限达到法定饮酒年龄的成年人。水、果汁、汽水都可以。适量饮酒，酒后不开车。',next:'下一位',skip:'跳过',min:'至少添加2名玩家',ready:'完成',kingN:'第 {k} 张K（共4张）'},
  id:{idleT:'Belum ada permainan',idleS:'Tambahkan pemain dan mulai permainan baru.',startNew:'Mulai main',resT:'Permainan berjalan',resS:'Sisa {n} kartu · Raja {k} dari 4 · Berikutnya {p}',cont:'Lanjutkan',endg:'Akhiri permainan',pick:'{n}, ambil kartu!',tm:'Raja jempol',masters:'Raja',playScr:'Main di layar',outLoud:'Kami main langsung',sipT:'+1 teguk',sips:'teguk',most:'Paling banyak minum: {n} ({k})',tapSip:'Ketuk pemain untuk tambah 1 teguk',nHow:'Teriakkan angka berikutnya dan ketuk wajahmu sendiri bersamaan. Bareng orang lain? Dua-duanya minum. Yang terakhir juga minum.',getReady:'Siap-siap…',go:'MULAI!',nextN:'Angka berikutnya: {n}',clash:'Bersamaan! {a} dan {b} minum',lastOne:'{n} yang terakhir. Minum!',drinks:'Yang minum',finish:'Selesai',cHow:'Ucapkan angkanya, atau tepuk tangan kalau ada 3, 6 atau 9. Ketuk apa yang kamu lakukan sebelum waktu habis!',sayN:'Ucap {n}',clap:'Tepuk',clap2:'Tepuk 2×',wrongC:'Salah! {n} harusnya {x}',slowC:'Terlalu lambat!',drinkN:'{n} minum!',reached:'Sampai {n}',startG:'Mulai',saidIt:'diucapkan',claps1:'tepuk sekali',claps2:'tepuk dua kali',sayIt:'Ucapkan',yourTurn:'Giliran {n}',dragHint:'Seret kartu ke cangkir, atau ketuk',passTo:'Oper ponselnya ke',tapReady:'Ketuk kalau sudah pegang',last:'Kartu terakhir',title:'Cangkir Raja',sub:'Oper ponselnya. Ketuk kartu. Lakukan perintahnya.',turn:'{n}, ketuk satu kartu',drew:'{n} mendapat',kings:'Raja',left:'kartu tersisa',players:'Pemain',add:'Tambah',start:'Mulai',newg:'Permainan baru',rules:'Aturan',mates:'Pasangan',active:'Aturan berlaku',qm:'Raja tanya',none:'Belum ada',idea:'Butuh ide?',cupT:'CANGKIR RAJA!',cupS:'{n} minum cangkirnya!',done:'Kartu habis',doneS:'Itu kartu terakhir. Main lagi?',namePh:'Nama pemain',rulePh:'Tulis aturan baru…',save:'Simpan',pickMate:'Pilih pasanganmu',edit:'Ubah aturan',reset:'Kembali ke klasik',note:'Untuk orang dewasa yang sudah cukup umur. Minuman apa pun boleh: air, jus, soda. Kenali batasmu, dan jangan menyetir setelah minum.',next:'Pemain berikutnya',skip:'Lewati',min:'Tambahkan minimal 2 pemain',ready:'Selesai',kingN:'Raja {k} dari 4'},
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
  players: [], turn: 0, deck: [], drawn: [], kings: 0, mates: [], rules: [], qm: -1, tm: -1, sips: [], started: false, custom: {}, last: null,
};
try { const s = JSON.parse(J.store.get('jj-kc') || '{}'); if (Array.isArray(s.players)) K.players = s.players.slice(0, 12); if (s.custom && typeof s.custom === 'object') K.custom = s.custom; } catch (e) {}
const saveK = () => J.store.set('jj-kc', JSON.stringify({players: K.players, custom: K.custom}));
const rule = r => { const c = K.custom[r]; const d = (RULES[L()] || RULES.en)[r]; return c && (c[0] || c[1]) ? [c[0] || d[0], c[1] || d[1]] : d; };
const pname = i => K.players[i] || '—';
const avatar = i => J.avatarSVG('kc|' + pname(i), false);

/* ---------- deck & ring ---------- */
function newDeck() {
  const d = []; for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) d.push({r, s, id: r * 4 + s});
  K.deck = J.shuffle(d).map((c, i) => ({...c, slot: i, gone: false})); K.drawn = []; K.kings = 0; K.mates = []; K.rules = []; K.qm = -1; K.tm = -1; K.last = null; K.sips = K.players.map(() => 0);
}
function ringHTML() {
  const n = K.deck.length;
  return K.deck.map((c, i) => {
 const h1 = J.hash('kc' + c.id + ':' + i), h2 = J.hash('w' + i + ':' + c.id), h3 = J.hash('r' + c.id);
    const a = (i / n) * 360 - 90 + ((h1 % 100) / 100 - .5) * 5, wob = ((h2 % 1000) / 1000 - .5) * 56, rj = ((h3 % 100) / 100 - .5) * 5;
    return `<button type="button" class="kc-c${c.gone ? ' gone' : ''}" data-i="${i}" style="--a:${a.toFixed(1)}deg;--w:${wob.toFixed(1)}deg;--rj:${rj.toFixed(2)}cqw;--d:${(i * 12) % 600}ms" aria-label="Card ${i + 1}"${c.gone ? ' tabindex="-1" disabled' : ''}><span class="card back"></span></button>`;
  }).join('');
}
function render() {
  $('kcRing').innerHTML = ringHTML();
  layoutRing();
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
  $('kcBTav').innerHTML = avatar(i); $('kcBTname').textContent = t('pick', {n: pname(i)});
  const bt = $('kcBigTurn'); bt.classList.remove('bump'); void bt.offsetWidth; bt.classList.add('bump');
  $('kcPlayersRow').innerHTML = K.players.map((p, k) => `<button type="button" class="kc-p${k === i ? ' on' : ''}${k === K.qm ? ' qm' : ''}${k === K.tm ? ' tm' : ''}" data-sip="${k}" title="${esc(t('tapSip'))}"><span class="av">${avatar(k)}${K.sips[k] ? `<i class="kc-sip">${K.sips[k]}</i>` : ''}</span><b>${esc(p)}</b></button>`).join('');
  const on = $('kcPlayersRow').querySelector('.on'); if (on) on.scrollIntoView({block: 'nearest', inline: 'center', behavior: J.animOn() ? 'smooth' : 'auto'});
}
function renderSide() {
  const mates = K.mates.length ? K.mates.map(m => `<li>🤝 ${esc(pname(m[0]))} &amp; ${esc(pname(m[1]))}</li>`).join('') : `<li class="none">${t('none')}</li>`;
  const rules = K.rules.length ? K.rules.map(r => `<li>📜 ${esc(r)}</li>`).join('') : `<li class="none">${t('none')}</li>`;
  const hist = K.drawn.slice(-6).reverse().map((c, k) => `<span class="kc-hc${k === 0 ? ' new' : ''}">${J.cardFace(c, {})}</span>`).join('');
  $('kcSide').innerHTML = `<div class="kc-hist"><h4>${t('last')}</h4><div class="kc-hrow">${hist || `<span class="none">${t('none')}</span>`}</div></div><div class="kc-mast"><h4>${t('masters')}</h4><ul>${K.qm >= 0 ? `<li title="${esc(t('qm'))}">❓ ${esc(pname(K.qm))}</li>` : ''}${K.tm >= 0 ? `<li title="${esc(t('tm'))}">👍 ${esc(pname(K.tm))}</li>` : ''}${K.qm < 0 && K.tm < 0 ? `<li class="none">${t('none')}</li>` : ''}</ul></div>`;
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
  if (c.r === 4) K.tm = who;
  renderSide();
  $('kcLeft').textContent = `${K.deck.filter(x => !x.gone).length} ${t('left')}`;
  if (c.r === 13) { $('kcCup').style.setProperty('--fill', String(K.kings / 4)); $('kcKings').innerHTML = [0, 1, 2, 3].map(k => `<i class="${k < K.kings ? 'on' : ''}">♚</i>`).join(''); }
  setTimeout(() => { busy = false; }, 450);
  saveGame();
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
  // just the card and its rule
  $('kcExtra').innerHTML = ''; $('kcShow').classList.remove('has-play');
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
  K.turn = (K.turn + 1) % K.players.length; renderTurn(); renderSide(); saveGame();
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
  K.started = false; clearSave();
  $('kcEnd').hidden = false;
  $('kcEndT').textContent = K.kings >= 4 ? t('cupT') : t('done');
  $('kcEndS').textContent = K.kings >= 4 ? t('cupS', {n: pname(K.last ? K.last.who : 0)}) : t('doneS');
  const top = K.sips.reduce((b, v, k) => v > (K.sips[b] || 0) ? k : b, 0);
  $('kcEndM').textContent = K.sips[top] ? t('most', {n: pname(top), k: K.sips[top]}) : '';
}
function startGame() {
  if (K.players.length < 2) { $('kcSetupMsg').textContent = t('min'); return; }
  J.closeModals(); newDeck(); K.turn = 0; K.started = true; $('kcEnd').hidden = true; $('kcPass').hidden = true; $('kcResume').hidden = true; $('kcIdle').hidden = true; render(); saveGame();
  const ring = $('kcRing'); ring.classList.remove('dealt'); void ring.offsetWidth; ring.classList.add('dealt');
  for (let k = 0; k < 8; k++) SFX.card(k * .06);
  J.stat && J.stat('kcGames');
}


/* ---------- sips ---------- */
function addSip(k, el, n) {
  n = n || 1; if (k < 0 || k >= K.players.length) return;
  K.sips[k] = (K.sips[k] || 0) + n; J.stat && J.stat('sips', n);
  J.floatText(el || $('kcPlayersRow').querySelector(`[data-sip="${k}"]`) || $('kcTurnAv'), `${pname(k)} +${n} 🍺`, 'gold'); SFX.clink();
  renderTurn(); saveGame();
}

/* ---------- on-screen mini games for A (nunchi count) and 9 (3-6-9) ---------- */
let mini = null;
const mt = [];
const later = (f, ms) => { const id = setTimeout(f, ms); mt.push(id); return id; };
function clearMini() { mt.splice(0).forEach(clearTimeout); if (mini && mini.raf) cancelAnimationFrame(mini.raf); }
function openMini(kind) {
  if (!K.last) return; clearMini();
  mini = {kind, who: K.last.who, over: false};
  const ov = $('kcMini'); ov.hidden = false; ov.classList.remove('in'); void ov.offsetWidth; ov.classList.add('in');
  ov.dataset.kind = kind;
  $('kmT').textContent = kind === 'nunchi' ? rule(14)[0] : '3-6-9';
  $('kmHow').textContent = kind === 'nunchi' ? t('nHow') : t('cHow');
  $('kmRes').hidden = true; $('kmRes').innerHTML = '';
  if (kind === 'nunchi') nunchiSetup(); else c369Setup();
  countdown(() => kind === 'nunchi' ? nunchiGo() : c369Go());
}
function closeMini(next) { clearMini(); mini = null; $('kcMini').hidden = true; if (next) nextTurn(); }
function countdown(done) {
  const st = $('kmStat'); let n = 3; st.className = 'km-stat count'; st.textContent = t('getReady');
  const step = () => { if (!mini) return; if (n > 0) { st.textContent = n; st.classList.remove('beat'); void st.offsetWidth; st.classList.add('beat'); SFX.tick(); J.buzz && J.buzz(12); n--; later(step, 700); } else { st.textContent = t('go'); st.classList.remove('beat'); void st.offsetWidth; st.classList.add('beat'); SFX.chime(); J.buzz && J.buzz(40); later(done, 350); } };
  later(step, 500);
}
function miniResult(drinkers, title, sub) {
  if (!mini) return; mini.over = true; clearMini();
  drinkers.forEach(k => { K.sips[k] = (K.sips[k] || 0) + 1; });
  J.stat && J.stat('sips', drinkers.length);
  const r = $('kmRes');
  r.innerHTML = `<b class="km-rt">${esc(title)}</b>${sub ? `<span class="km-rs">${esc(sub)}</span>` : ''}<div class="km-dr">${drinkers.map(k => `<span class="km-d"><span class="av">${avatar(k)}</span><b>${esc(pname(k))}</b><i>🍺 +1</i></span>`).join('')}</div><button type="button" class="btn btn-raise" data-mdone>${t('finish')}</button>`;
  r.hidden = false; SFX.splat(); J.buzz && J.buzz([60, 40, 60]);
  const rr = r.getBoundingClientRect(); J.burst(rr.left + rr.width / 2, rr.top + 40, ['🍺', '💦', '😵'], 14, {dist: 160, size: 28});
  renderTurn();
}
/* Nunchi count: everyone shouts the next number and taps their own face. Two taps within 0.45 s = a clash. */
function nunchiSetup() {
  mini.n = 0; mini.claimed = {}; mini.pending = null; mini.active = false;
  $('kmBody').innerHTML = `<div class="km-grid n${Math.min(K.players.length, 12)}">${K.players.map((p, k) => `<button type="button" class="km-p" data-np="${k}" disabled><span class="av">${avatar(k)}</span><b>${esc(p)}</b><i class="km-n"></i></button>`).join('')}</div>`;
}
function nunchiGo() { if (!mini) return; mini.active = true; $('kmBody').querySelectorAll('.km-p').forEach(b => b.disabled = false); $('kmStat').className = 'km-stat'; $('kmStat').textContent = t('nextN', {n: 1}); }
function nunchiTap(k) {
  const m = mini; if (!m || m.kind !== 'nunchi' || !m.active || m.over || m.claimed[k] != null) return;
  const now = performance.now(), el = q => $('kmBody').querySelector(`[data-np="${q}"]`);
  if (m.pending && m.pending.k !== k && now - m.pending.t < 450) {
    clearTimeout(m.pending.timer); const a = m.pending.k; m.pending = null;
    [a, k].forEach(q => { el(q).classList.add('clash'); el(q).querySelector('.km-n').textContent = m.n + 1; });
    SFX.bad(); miniResult([a, k], t('clash', {a: pname(a), b: pname(k)}), ''); return;
  }
  if (m.pending) return;
  const b = el(k); b.classList.add('pend'); b.querySelector('.km-n').textContent = m.n + 1; J.buzz && J.buzz(10);
  m.pending = {k, t: now, timer: later(() => {
    m.pending = null; m.n++; m.claimed[k] = m.n; b.classList.remove('pend'); b.classList.add('done'); b.disabled = true;
    J.tone && J.tone(500 + m.n * 70, .09, 'triangle', .07);
    const left = K.players.map((_, q) => q).filter(q => m.claimed[q] == null);
    if (left.length <= 1) { const last = left[0]; if (last != null) { el(last).classList.add('clash'); el(last).querySelector('.km-n').textContent = m.n + 1; } miniResult(left, t('lastOne', {n: pname(last)}), ''); return; }
    $('kmStat').textContent = t('nextN', {n: m.n + 1});
  }, 450)};
}
/* 3-6-9: the phone goes round the circle. Tap Say, Clap or Clap clap for each number before the bar runs out. */
const need369 = n => Math.min(2, String(n).split('').filter(d => d === '3' || d === '6' || d === '9').length);
function c369Setup() {
  mini.n = 1; mini.p = mini.who;
  $('kmBody').innerHTML = `<div class="km369"><div class="km-who" id="km369Who"></div><div class="km-num" id="km369Num">1</div><div class="km-bar"><i id="km369Bar"></i></div><div class="km-btns" id="km369Btns"></div></div>`;
  c369Paint(true);
}
function c369Paint(idle) {
  const m = mini; $('km369Who').innerHTML = `<span class="av">${avatar(m.p)}</span><b>${esc(t('yourTurn', {n: pname(m.p)}))}</b>`;
  const num = $('km369Num'); num.textContent = m.n; num.classList.remove('beat'); void num.offsetWidth; num.classList.add('beat');
  const opts = J.shuffle([['say', t('sayN', {n: m.n})], ['clap', '👏 ' + t('clap')], ['clap2', '👏👏 ' + t('clap2')]]);
  $('km369Btns').innerHTML = opts.map(o => `<button type="button" class="btn ${o[0] === 'say' ? 'btn-call' : o[0] === 'clap' ? 'btn-raise' : 'btn-violet'}" data-c="${o[0]}"${idle ? ' disabled' : ''}>${esc(o[1])}</button>`).join('');
}
function c369Go() {
  if (!mini) return; mini.active = true; $('kmStat').className = 'km-stat'; $('kmStat').textContent = '';
  c369Paint(false); c369Timer();
}
function c369Timer() {
  const m = mini; m.ms = Math.max(1300, 3200 - (m.n - 1) * 70); m.t0 = performance.now();
  const bar = $('km369Bar');
  const f = now => { if (!mini || mini !== m || m.over) return; const x = 1 - (now - m.t0) / m.ms; bar.style.transform = `scaleX(${Math.max(0, x)})`; bar.classList.toggle('low', x < .35);
    if (x <= 0) { miniResult([m.p], t('slowC'), t('reached', {n: m.n})); return; } m.raf = requestAnimationFrame(f); };
  m.raf = requestAnimationFrame(f);
}
function c369Answer(kind) {
  const m = mini; if (!m || m.kind !== 'c369' || !m.active || m.over) return;
  const need = need369(m.n), want = ['say', 'clap', 'clap2'][need];
  if (kind !== want) { SFX.bad(); miniResult([m.p], t('drinkN', {n: pname(m.p)}), t('wrongC', {n: m.n, x: [t('saidIt'), t('claps1'), t('claps2')][need]})); return; }
  if (kind === 'say') SFX.pop(); else { SFX.clap(); if (kind === 'clap2') SFX.clap(.12); }
  J.buzz && J.buzz(kind === 'say' ? 8 : [8, 40, 8]);
  cancelAnimationFrame(m.raf); m.n++; m.p = (m.p + 1) % K.players.length; c369Paint(false); c369Timer();
}
$('kcMini').addEventListener('pointerdown', e => { const b = e.target.closest('[data-np]'); if (b && !b.disabled) { e.preventDefault(); nunchiTap(Number(b.dataset.np)); } });
$('kcMini').addEventListener('click', e => {
  const c = e.target.closest('[data-c]'); if (c && !c.disabled) { c369Answer(c.dataset.c); return; }
  if (e.target.closest('[data-mdone]')) { closeMini(true); return; }
  if (e.target.closest('[data-mx]')) closeMini(false);
});

/* ---------- setup ---------- */
let setupCfg = null;
const smin = () => (setupCfg && setupCfg.min) || 2, smax = () => (setupCfg && setupCfg.max) || 12;
function renderSetup() {
  $('kcSetT').textContent = setupCfg ? setupCfg.title : t('title'); $('kcSetSub').textContent = setupCfg ? setupCfg.sub : t('sub');
  $('kcList').innerHTML = K.players.map((p, i) => `<li><span class="av" style="background:${AV_BG[i % AV_BG.length]}">${avatar(i)}</span><b>${esc(p)}</b><button type="button" class="icon-btn" data-rm="${i}" aria-label="Remove ${esc(p)}"><svg><use href="#i-close"/></svg></button></li>`).join('');
  $('kcSetupMsg').textContent = K.players.length < smin() ? t('min') : K.players.length > smax() ? `Max ${smax()}` : '';
  $('kcGo').disabled = K.players.length < smin() || K.players.length > smax();
}
function addPlayer() {
  const v = J.cleanName($('kcName').value); if (!v || K.players.length >= smax()) return;
  K.players.push(v); $('kcName').value = ''; saveK(); renderSetup(); SFX.pop(); $('kcName').focus();
}
$('kcAdd').onclick = addPlayer;
$('kcName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addPlayer(); } });
$('kcList').onclick = e => { const b = e.target.closest('[data-rm]'); if (!b) return; K.players.splice(Number(b.dataset.rm), 1); saveK(); renderSetup(); };
$('kcGo').onclick = () => { if (setupCfg) { if (K.players.length < smin() || K.players.length > smax()) return; const cb = setupCfg.onStart; J.closeModals(); cb(K.players.slice()); } else startGame(); };
function openSetup(cfg) {
  setupCfg = cfg && cfg.onStart ? cfg : null;
  if (!K.players.length) { const me = J.nick(); if (me) K.players.push(me); }
  renderSetup(); J.openModal('mKC');
}
/* Shared player list for every party game on this phone */
J.party = {setup: openSetup, players: () => K.players.slice(), avatar: n => J.avatarSVG('kc|' + n, false), t: (dict) => (k, v) => { let x = (dict[L()] || dict.en)[k] || dict.en[k] || k; if (v) for (const y in v) x = x.split('{' + y + '}').join(v[y]); return x; }};

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
  const pm = e.target.closest('[data-mini]'); if (pm) { openMini(pm.dataset.mini); return; }
  const id = e.target.closest('[data-idea]');
  if (id) { const pool = (IDEAS[L()] || IDEAS.en)[id.dataset.idea]; const pick = pool[Math.floor(Math.random() * pool.length)];
    if (id.dataset.idea === 'rule') { const inp = $('kcRuleIn'); if (inp) inp.value = pick; }
    else J.toast(`<span class="t-ic">💡</span><span><b>${esc(pick)}</b></span>`, '', 2400);
    SFX.pop(); return; }
  if (e.target.closest('#kcRuleSave')) { const v = J.cleanText($('kcRuleIn').value); if (v) { K.rules.push(v.slice(0, 60)); if (K.rules.length > 6) K.rules.shift(); SFX.chime(); } renderSide(); nextTurn(); }
});
document.addEventListener('keydown', e => { if (J.current !== 'kc' || J.anyModal() || !$('kcMini').hidden) return; if (!$('kcShow').hidden && (e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); nextTurn(); } });
$('kcNew').onclick = () => openSetup();
$('kcPlayersRow').addEventListener('click', e => { const b = e.target.closest('[data-sip]'); if (!b || !K.started) return; addSip(Number(b.dataset.sip), b); });
$('kcAgain').onclick = () => { $('kcEnd').hidden = true; startGame(); };
$('kcPlayersBtn').onclick = () => openSetup();
$('kcRulesBtn').onclick = () => { renderRulesEd(); J.openModal('mKCRules'); };
J.onSettings(() => { if (J.current === 'kc') { render(); if (!$('kcShow').hidden && K.last) showCard(K.last.c, K.last.who, false); } });

/* Square table normally; when the phone has spare height (panel slid down), stretch it into an oval
   so the ring, the cup and the revealed card all get bigger. */
function fit() {
  const st = $('kcStage'), tb = $('kcTable'); const W = st.clientWidth - 12, H = st.clientHeight - 8; if (W <= 0 || H <= 0) return;
  const oval = false, lab = $('kcBar').classList.contains('min') ? 64 : 0;
  if (oval) { const w = Math.max(240, W), h = Math.min(H, w * 1.62); tb.style.width = w + 'px'; tb.style.height = h + 'px'; }
  else { const w = Math.max(240, Math.min(W, H - lab, 760)); tb.style.width = w + 'px'; tb.style.height = w + 'px'; tb.style.marginTop = lab ? (-lab / 2) + 'px' : ''; $('kcBigTurn').style.setProperty('--bt', (st.clientHeight / 2 - lab / 2 + w / 2 + 8) + 'px'); }
  tb.classList.toggle('oval', oval); layoutRing();
}
function layoutRing() {
  const tb = $('kcTable'); if (!tb.classList.contains('oval')) return;
  const W = tb.clientWidth, H = tb.clientHeight, rx = W * .375, ry = H / 2 - W * .125, cards = $('kcRing').children, n = cards.length; if (!n || !W) return;
  // spread the cards evenly along the oval, not evenly by angle
  const N = 720, pts = [], len = [0]; for (let k = 0; k <= N; k++) { const a = -Math.PI / 2 + k / N * Math.PI * 2; pts.push(a); if (k) { const a0 = pts[k - 1]; len.push(len[k - 1] + Math.hypot(rx * (Math.cos(a) - Math.cos(a0)), ry * (Math.sin(a) - Math.sin(a0)))); } }
  const P = len[N], kcw = Math.min(P / n * 2.3, W * .15, 84); tb.style.setProperty('--kcw', kcw + 'px');
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = i / n * P; while (j < N && len[j + 1] < target) j++;
    const a = pts[j], x = W / 2 + rx * Math.cos(a), y = H / 2 + ry * Math.sin(a), rot = Math.atan2(Math.sin(a) / ry, Math.cos(a) / rx) * 180 / Math.PI + 90;
    const b = cards[i]; b.style.setProperty('--x', x.toFixed(1) + 'px'); b.style.setProperty('--y', y.toFixed(1) + 'px'); b.style.setProperty('--rot', rot.toFixed(1) + 'deg');
  }
}
/* Slide the details panel down (or tap the handle) to make the table bigger. */
let barMin = J.store.get('jj-kcmin') === '1';
function setBarMin(v) { barMin = v; J.store.set('jj-kcmin', v ? '1' : '0'); const b = $('kcBar'); b.classList.toggle('min', v); b.style.transform = ''; const g = $('kcGrip'); g.setAttribute('aria-expanded', String(!v)); g.setAttribute('aria-label', v ? 'Show details' : 'Hide details'); requestAnimationFrame(fit); }
setBarMin(barMin);
let bd = null;
$('kcBar').addEventListener('pointerdown', e => { if (!e.target.closest('#kcGrip,.kc-turn')) return; bd = {y: e.clientY, id: e.pointerId, moved: false, grip: !!e.target.closest('#kcGrip')}; });
window.addEventListener('pointermove', e => { if (!bd || e.pointerId !== bd.id) return; const dy = e.clientY - bd.y; if (Math.abs(dy) > 6) bd.moved = true; if (!bd.moved) return; const b = $('kcBar'); b.classList.add('drag'); b.style.transform = `translateY(${barMin ? Math.min(0, Math.max(-40, dy * .4)) : Math.max(0, Math.min(120, dy))}px)`; });
const endBar = e => { if (!bd || e.pointerId !== bd.id) return; const d = bd; bd = null; const b = $('kcBar'); b.classList.remove('drag'); const dy = e.clientY - d.y;
  if (d.moved) { if (dy > 28 && !barMin) setBarMin(true); else if (dy < -24 && barMin) setBarMin(false); else b.style.transform = ''; SFX.whoosh(); }
  else if (d.grip) { setBarMin(!barMin); SFX.click(); } };
window.addEventListener('pointerup', endBar); window.addEventListener('pointercancel', endBar);
new ResizeObserver(() => { if (J.current === 'kc') fit(); }).observe($('kcStage'));
/* ---------- save the game so closing the app by accident is not the end ---------- */
const SAVE = 'jj-kcgame';
function saveGame() {
  if (!K.started) return;
  try { J.store.set(SAVE, JSON.stringify({players: K.players, deck: K.deck.map(c => [c.id, c.gone ? 1 : 0]), drawn: K.drawn.map(c => c.id), kings: K.kings, turn: K.turn, qm: K.qm, tm: K.tm, sips: K.sips, last: K.last ? [K.last.c.id, K.last.who] : null, open: !$('kcShow').hidden})); } catch (e) {}
}
function clearSave() { J.store.set(SAVE, ''); }
function loadGame() {
  try {
    const g = JSON.parse(J.store.get(SAVE) || 'null'); if (!g || !Array.isArray(g.deck) || g.deck.length !== 52 || !Array.isArray(g.players) || g.players.length < 2) return false;
    const card = id => ({r: Math.floor(id / 4), s: id % 4, id});
    K.players = g.players.slice(0, 12); K.deck = g.deck.map(([id, gone], i) => ({...card(id), slot: i, gone: !!gone}));
    K.drawn = (g.drawn || []).map(card); K.kings = g.kings | 0; K.turn = g.turn | 0; K.qm = g.qm ?? -1; K.tm = g.tm ?? -1;
    K.sips = K.players.map((_, k) => (g.sips && g.sips[k]) | 0); K.mates = []; K.rules = [];
    K.last = g.last ? {c: card(g.last[0]), who: g.last[1]} : null; K.resumeOpen = !!g.open;
    return K.deck.some(c => !c.gone) && K.kings < 4;
  } catch (e) { return false; }
}
function askResume() {
  const left = K.deck.filter(c => !c.gone).length;
  $('kcResT').textContent = t('resT');
  $('kcResS').textContent = t('resS', {n: left, k: K.kings, p: pname(K.turn % K.players.length)});
  $('kcCont').textContent = t('cont'); $('kcEndG').textContent = t('endg');
  $('kcResume').hidden = false; $('kcEnd').hidden = true;
}
/* Closing the player list without starting leaves no game: say so, with a Start button, instead of a dead table. */
function showIdle() {
  if (J.current !== 'kc' || K.started || !$('kcResume').hidden || !$('kcEnd').hidden || !$('mKC').hidden) return;
  $('kcIdleT').textContent = t('idleT'); $('kcIdleS').textContent = t('idleS'); $('kcIdleGo').textContent = t('startNew');
  $('kcIdle').hidden = false;
}
new MutationObserver(() => { if ($('mKC').hidden) setTimeout(showIdle, 60); else $('kcIdle').hidden = true; }).observe($('mKC'), {attributes: true, attributeFilter: ['hidden']});
$('kcIdleGo').onclick = () => openSetup();
$('kcCont').onclick = () => {
  $('kcResume').hidden = true; K.started = true; render(); SFX.chime();
  if (K.resumeOpen && K.last) showCard(K.last.c, K.last.who, false); else showPass();
  K.resumeOpen = false;
};
$('kcEndG').onclick = () => { $('kcResume').hidden = true; K.started = false; clearSave(); newDeck(); render(); openSetup(); };
addEventListener('pagehide', saveGame);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveGame(); });
function open() {
  J.show('kc'); fit();
  if (K.started || loadGame()) { K.started = false; render(); askResume(); return; }
  newDeck(); render(); openSetup();
}
J.registerScreen('kc', {hide() { if (mini) closeMini(false); saveGame(); }});
$('kcBtn').onclick = open;
J._kc = {K, draw, openMini};
$('gcKC').innerHTML = '<div class="kc-mini"><span class="kc-mcup">🍺</span>' + [0, 1, 2, 3, 4, 5].map(k => `<i style="--a:${k * 60}deg"></i>`).join('') + '</div>';
})();
