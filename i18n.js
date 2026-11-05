/* JJ POKER — interface languages: English, 한국어, 中文, Bahasa Indonesia.
   Text in the page is written in English; this file swaps each piece of text
   for the chosen language as it appears, and swaps it back when you return to English. */
(() => {
'use strict';
const LANGS = [['en','English'],['ko','한국어'],['zh','中文'],['id','Bahasa Indonesia']];
const IDX = {ko:1, zh:2, id:3};
// [English, Korean, Chinese, Indonesian]
const T = [
['Games','게임','游戏','Permainan'],['Themes','테마','主题','Tema'],['Rewards','보상','奖励','Hadiah'],['How to play','게임 방법','玩法','Cara main'],['Help','도움말','帮助','Bantuan'],
['Cards · Chips · Chaos','카드 · 칩 · 혼돈','牌 · 筹码 · 混乱','Kartu · Chip · Kekacauan'],
['Play money · real bragging rights','가짜 돈 · 진짜 자랑거리','虚拟筹码 · 真实炫耀','Uang mainan · gengsi sungguhan'],
['Bluff hard.','과감하게 블러핑.','大胆诈唬。','Gertak habis-habisan.'],['Fold with dignity.','폴드는 품위 있게.','弃牌也要体面。','Fold dengan bermartabat.'],
['Poker with your friends, blackjack against a robot who never blinks, and mahjong for when you need to calm down after losing both. Every chip is fake. The trash talk is not.','친구들과 포커, 눈 하나 깜짝 안 하는 로봇과 블랙잭, 둘 다 지고 나면 마음을 달래 줄 마작까지. 칩은 전부 가짜지만, 도발은 진짜입니다.','和朋友打扑克，和从不眨眼的机器人玩21点，两样都输了就来局麻将冷静一下。筹码都是假的，嘴炮是真的。','Poker bareng teman, blackjack melawan robot yang tak pernah berkedip, dan mahjong untuk menenangkan diri setelah kalah di keduanya. Semua chip palsu. Ejekannya asli.'],
['Level','레벨','等级','Level'],['games to lose at','개의 게임','款游戏','permainan'],['players per poker table','명이 한 테이블','人一桌','pemain per meja'],['meme sounds','개의 밈 사운드','个梗音效','suara meme'],['free spin every day','매일 무료 룰렛','每日免费转盘','putaran gratis tiap hari'],
['Mira went all-in','미라가 올인했어요','Mira 全押了','Mira all-in'],['with a 7 and a 2. Again.','7-2로. 또.','又是7和2。','pakai 7 dan 2. Lagi.'],['Royal flush!','로열 플러시!','皇家同花顺！','Royal flush!'],['Ana won $2,400','아나가 $2,400 획득','Ana 赢了 $2,400','Ana menang $2.400'],['Budi played Sad trombone','부디가 슬픈 트롬본을 틀었어요','Budi 播放了悲伤长号','Budi memutar Trombon sedih'],['at exactly the right moment','딱 맞는 타이밍에','时机刚刚好','tepat di saat yang pas'],
['Pick your poison','골라 보세요','选个游戏吧','Pilih racunmu'],['Four games, zero real money, unlimited excuses.','게임 넷, 진짜 돈 제로, 핑계는 무한.','四款游戏，零真钱，借口无限。','Empat permainan, nol uang asli, alasan tak terbatas.'],
['Online · 1–4 players','온라인 · 1–4명','在线 · 1–4人','Online · 1–4 pemain'],["Texas Hold'em",'텍사스 홀덤','德州扑克',"Texas Hold'em"],
['Make a room, send the code, deal your friends in. Chat, emojis and meme sounds everyone hears.','방을 만들고 코드를 보내 친구를 초대하세요. 채팅, 이모지, 모두에게 들리는 밈 사운드까지.','开个房间，发出房间码，叫朋友入座。聊天、表情和大家都能听到的梗音效。','Buat room, kirim kodenya, ajak teman. Chat, emoji, dan suara meme yang didengar semua orang.'],
['Create room','방 만들기','创建房间','Buat room'],['Play bots','봇과 플레이','和机器人玩','Main lawan bot'],['Join','참가','加入','Gabung'],['Resume','이어하기','继续','Lanjutkan'],['Looking for rooms…','방을 찾는 중…','正在寻找房间…','Mencari room…'],
['Solo · vs the dealer','솔로 · 딜러와 대결','单人 · 对战庄家','Solo · lawan dealer'],['Blackjack','블랙잭','21点','Blackjack'],
['Get to 21, beat JJ-21 the robot dealer. Blackjack pays 3 to 2. Stuck? The hint button knows basic strategy.','21을 만들어 로봇 딜러 JJ-21을 이기세요. 블랙잭은 3:2 배당. 막히면 힌트 버튼이 기본 전략을 알려 줘요.','凑到21点，打败机器人庄家JJ-21。黑杰克赔3比2。卡住了？提示按钮懂基本策略。','Capai 21, kalahkan JJ-21 si dealer robot. Blackjack dibayar 3 banding 2. Bingung? Tombol petunjuk tahu strategi dasarnya.'],
['Sit at the blackjack table','블랙잭 테이블에 앉기','坐上21点牌桌','Duduk di meja blackjack'],['You + 3 bots · or solitaire','나 + 봇 3명 · 또는 솔리테어','你 + 3个机器人 · 或单人','Kamu + 3 bot · atau solitaire'],['Mahjong','마작','麻将','Mahjong'],
['The real thing: 13 tiles, four winds, you against three bots. Pong, chow, kong, then shout Mahjong! Or relax with solitaire.','진짜 마작: 13장, 네 바람, 봇 셋과 대결. 펑, 치, 깡 하고 "마작!"을 외치세요. 아니면 솔리테어로 휴식.','正宗麻将：13张牌，东南西北，你对三个机器人。碰、吃、杠，然后喊“和了！”。也可以玩单人连连看放松。','Mahjong asli: 13 ubin, empat angin, kamu lawan tiga bot. Pong, chow, kong, lalu teriak Mahjong! Atau santai dengan solitaire.'],
['Play 4-player mahjong','4인 마작 하기','玩四人麻将','Main mahjong 4 pemain'],['Solitaire · easy','솔리테어 · 쉬움','单人 · 简单','Solitaire · mudah'],['Solitaire · classic','솔리테어 · 클래식','单人 · 经典','Solitaire · klasik'],
['Pick a vibe','분위기 고르기','选个氛围','Pilih suasana'],['Every table gets the same theme. Change it any time from Settings.','모든 테이블에 같은 테마가 적용돼요. 설정에서 언제든 바꿀 수 있어요.','所有牌桌都用同一主题，可随时在设置中更改。','Semua meja memakai tema yang sama. Ganti kapan saja di Pengaturan.'],
['Spin once a day, level up by playing, collect badges for your bad decisions.','하루 한 번 룰렛, 플레이로 레벨 업, 나쁜 선택으로 배지 수집.','每天转一次，边玩边升级，用你的烂决定收集徽章。','Putar sekali sehari, naik level dengan bermain, kumpulkan lencana dari keputusan burukmu.'],
['Daily spin','일일 룰렛','每日转盘','Putaran harian'],['Free coins for blackjack and bragging. One spin every 24 hours.','블랙잭과 자랑용 무료 코인. 24시간마다 한 번.','送你21点用的金币，外加炫耀资本。每24小时转一次。','Koin gratis untuk blackjack dan pamer. Satu putaran tiap 24 jam.'],
['Spin the wheel','룰렛 돌리기','转动转盘','Putar roda'],['Spinning…','돌아가는 중…','转动中…','Berputar…'],['Your stats','내 기록','我的数据','Statistikmu'],['Achievements','업적','成就','Pencapaian'],['Show all badges','배지 모두 보기','查看全部徽章','Lihat semua lencana'],['Show fewer','접기','收起','Lebih sedikit'],
['JJ POKER · play money only, no real cash, no payouts.','JJ POKER · 가짜 돈만 사용, 현금·환전 없음.','JJ POKER · 仅限虚拟筹码，无真钱、无兑付。','JJ POKER · hanya uang mainan, tanpa uang asli, tanpa pembayaran.'],['Made for game nights.','게임의 밤을 위해 만들었어요.','为游戏之夜而生。','Dibuat untuk malam main bareng.'],
['poker hands','포커 핸드','扑克手数','tangan poker'],['pots won','이긴 팟','赢得底池','pot dimenangkan'],['biggest pot','최대 팟','最大底池','pot terbesar'],['blackjack hands','블랙잭 판','21点局数','ronde blackjack'],['blackjack wins','블랙잭 승리','21点胜场','menang blackjack'],['naturals','내추럴','黑杰克','natural'],['mahjong clears','마작 클리어','麻将通关','mahjong selesai'],['fastest clear','최단 클리어','最快通关','tercepat'],
['Room','방','房间','Room'],['Game','게임','游戏','Game'],['Bots','봇','机器人','Bot'],['Copy','복사','复制','Salin'],['Copied!','복사됨!','已复制！','Tersalin!'],['Blinds','블라인드','盲注','Blind'],['Hand','핸드','手','Tangan'],['Leave','나가기','离开','Keluar'],['Tap again to close room','한 번 더 누르면 방이 닫혀요','再点一次关闭房间','Ketuk lagi untuk menutup room'],
['POT','팟','底池','POT'],['PRE-FLOP · POT','프리플랍 · 팟','翻牌前 · 底池','PRE-FLOP · POT'],['FLOP · POT','플랍 · 팟','翻牌 · 底池','FLOP · POT'],['TURN · POT','턴 · 팟','转牌 · 底池','TURN · POT'],['RIVER · POT','리버 · 팟','河牌 · 底池','RIVER · POT'],
['🔁 Running it twice','🔁 두 번 돌리기','🔁 发两次','🔁 Run it twice'],['Run 2','두 번째','第二轮','Run 2'],['Room code','방 코드','房间码','Kode room'],['Copy code','코드 복사','复制房间码','Salin kode'],['Waiting for friends.','친구를 기다리는 중.','等待朋友加入。','Menunggu teman.'],
['Fill empty seats with bots','빈자리는 봇으로 채우기','空位用机器人补满','Isi kursi kosong dengan bot'],['Start game','게임 시작','开始游戏','Mulai main'],['Game over','게임 종료','游戏结束','Permainan selesai'],['Play again','다시 하기','再来一局','Main lagi'],['Back to home','홈으로','返回首页','Kembali ke beranda'],
['🏆 Tournament over','🏆 토너먼트 종료','🏆 锦标赛结束','🏆 Turnamen selesai'],['New tournament','새 토너먼트','新锦标赛','Turnamen baru'],
["You're out of money. It happens to the best of us.",'돈이 다 떨어졌어요. 고수도 그럴 때가 있죠.','你没钱了。高手也会这样。','Uangmu habis. Jagoan pun pernah begini.'],
['Fold','폴드','弃牌','Fold'],['Check','체크','过牌','Check'],['Call','콜','跟注','Call'],['Raise','레이즈','加注','Raise'],['Check / Fold','체크 / 폴드','过牌 / 弃牌','Check / Fold'],['Call any','무조건 콜','跟任何注','Call berapa pun'],
['Min','최소','最小','Min'],['½ Pot','½ 팟','½ 底池','½ Pot'],['Pot','팟','底池','Pot'],['All-in','올인','全押','All-in'],['Back','뒤로','返回','Kembali'],
['👀 Show my cards','👀 내 카드 공개','👀 亮出我的牌','👀 Tunjukkan kartuku'],['🐇 Rabbit hunt','🐇 래빗 헌트','🐇 看看后面的牌','🐇 Rabbit hunt'],['Deal next hand now','다음 핸드 바로 시작','立即发下一手','Bagikan tangan berikutnya'],
['Meme sounds','밈 사운드','梗音效','Suara meme'],['everyone at the table hears these','테이블의 모두가 들어요','全桌都能听到','semua orang di meja mendengarnya'],['for dramatic moments','극적인 순간을 위해','留给戏剧性时刻','untuk momen dramatis'],
['Chat','채팅','聊天','Chat'],['History','기록','记录','Riwayat'],['Say hi. Or say nothing and look mysterious.','인사해 보세요. 아니면 조용히 미스터리하게.','打个招呼。或者一言不发，保持神秘。','Sapa dulu. Atau diam saja biar misterius.'],['Send','보내기','发送','Kirim'],['Talk some trash','도발 한마디','来点嘴炮','Lempar ejekan'],
['Nice hand!','나이스 핸드!','好牌！','Tangan bagus!'],['Ouch.','아야.','哎哟。','Aduh.'],['Lucky!','운 좋네!','运气真好！','Hoki!'],['Throw at','던질 대상:','扔向','Lempar ke'],
['Tomato','토마토','番茄','Tomat'],['Egg','달걀','鸡蛋','Telur'],['Cheers','건배','干杯','Bersulang'],['Kiss','뽀뽀','飞吻','Cium'],['Rose','장미','玫瑰','Mawar'],['Bomb','폭탄','炸弹','Bom'],['Make it rain','돈 뿌리기','撒钱','Hujan uang'],['Chicken','닭','鸡','Ayam'],
['SPLAT!','철퍼덕!','啪！','SPLAT!'],['BOOM!','쾅!','轰！','BUM!'],['Make it rain!','돈벼락!','撒钱啦！','Hujan uang!'],['BAWK BAWK!','꼬꼬댁!','咯咯哒！','KOK KOK!'],['For you 🌹','당신에게 🌹','送给你 🌹','Untukmu 🌹'],['Cheers! 🍻','건배! 🍻','干杯！🍻','Bersulang! 🍻'],
['Shoe','슈','牌靴','Shoe'],['Streak','연승','连胜','Beruntun'],['JJ-21 · dealer','JJ-21 · 딜러','JJ-21 · 庄家','JJ-21 · dealer'],['Place a bet','베팅하세요','请下注','Pasang taruhan'],['Your coins','내 코인','我的金币','Koinmu'],
['Tap chips to bet, then deal.','칩을 눌러 베팅하고 딜하세요.','点筹码下注，然后发牌。','Ketuk chip untuk bertaruh, lalu bagikan.'],['Clear','지우기','清除','Hapus'],['Rebet','같은 금액','重复下注','Ulang'],['Deal','딜','发牌','Bagikan'],['Hit','히트','要牌','Hit'],['Stand','스탠드','停牌','Stand'],['Double','더블','加倍','Double'],['Split','스플릿','分牌','Split'],
['Out of coins. The robot thanks you.','코인이 다 떨어졌어요. 로봇이 감사하대요.','金币用光了。机器人谢谢你。','Koin habis. Si robot berterima kasih.'],['Get 500 free coins','무료 코인 500 받기','领取500免费金币','Ambil 500 koin gratis'],["Dealer’s turn…",'딜러 차례…','庄家回合…','Giliran dealer…'],
['Welcome! Place your bet.','어서 오세요! 베팅하세요.','欢迎！请下注。','Selamat datang! Pasang taruhanmu.'],['Blackjack!','블랙잭!','黑杰克！','Blackjack!'],['You win!','승리!','你赢了！','Kamu menang!'],['Dealer busts!','딜러 버스트!','庄家爆牌！','Dealer bust!'],['Push','무승부','平局','Seri'],['Your bet comes back.','베팅 금액을 돌려받아요.','退还你的下注。','Taruhanmu kembali.'],
['Pairs','쌍','对数','Pasangan'],['Score','점수','分数','Skor'],['Moves available','가능한 수','可走步数','Langkah tersedia'],['Match two free tiles','자유 패 두 장을 맞추세요','配对两张可选的牌','Pasangkan dua ubin bebas'],
['A tile is free when nothing sits on it and its left or right side is open.','위에 아무것도 없고 왼쪽이나 오른쪽이 열려 있으면 자유 패예요.','上面没有压牌、且左边或右边空着的牌才可选。','Ubin bebas jika tak ada yang menindihnya dan sisi kiri atau kanannya terbuka.'],
['Hint','힌트','提示','Petunjuk'],['Shuffle','섞기','洗牌','Kocok'],['Undo','되돌리기','撤销','Urungkan'],['New board','새 판','新牌局','Papan baru'],['Round','라운드','圈','Ronde'],['Wall','패산','牌墙','Tembok'],['You','나','你','Kamu'],
['Pick a tile to discard','버릴 패를 고르세요','选一张牌打出','Pilih ubin untuk dibuang'],['Pass','패스','过','Lewat'],['Pong','펑','碰','Pong'],['Kong','깡','杠','Kong'],['Chow','치','吃','Chow'],['Mahjong!','마작!','和了！','Mahjong!'],['Tsumo! (win)','쯔모! (승리)','自摸！（和牌）','Tsumo! (menang)'],['Next hand','다음 판','下一局','Tangan berikutnya'],['New match','새 대국','新对局','Pertandingan baru'],['Draw game','유국','流局','Seri'],['The wall ran out. Nobody pays.','패산이 다 떨어졌어요. 아무도 내지 않아요.','牌墙摸完了，没人付分。','Tembok habis. Tak ada yang bayar.'],
['Your sounds','내 사운드','我的音效','Suaramu'],['Add to soundboard','사운드보드에 추가','加入音效板','Tambah ke papan suara'],
['Room settings','방 설정','房间设置','Pengaturan room'],['Bot game','봇 게임','机器人对局','Main lawan bot'],['1 bot','봇 1명','1个机器人','1 bot'],['2 bots','봇 2명','2个机器人','2 bot'],['3 bots','봇 3명','3个机器人','3 bot'],['Starting money','시작 금액','起始筹码','Modal awal'],
['House rules · everyone gets 30 seconds per move','하우스 룰 · 한 수에 30초','房规 · 每步30秒','Aturan meja · 30 detik per langkah'],['Run it twice','두 번 돌리기','发两次','Run it twice'],["When everyone's all-in, deal the rest twice and split the pot",'모두 올인하면 남은 카드를 두 번 깔고 팟을 나눠요','所有人全押时，剩余公共牌发两次并平分底池','Saat semua all-in, sisa kartu dibagikan dua kali dan pot dibagi'],
['7-2 bounty','7-2 현상금','7-2 悬赏','Bonus 7-2'],['Win a hand holding 7-2 and everyone pays you 5 big blinds','7-2로 이기면 모두가 빅블라인드 5배를 줘요','拿7-2赢一手，每人付你5个大盲','Menang dengan 7-2 dan semua bayar kamu 5 big blind'],
['Game type','게임 방식','游戏类型','Jenis permainan'],['💵 Cash game','💵 캐시 게임','💵 现金局','💵 Cash game'],['🏆 Tournament','🏆 토너먼트','🏆 锦标赛','🏆 Turnamen'],['Blinds go up every','블라인드 상승 간격','盲注上涨间隔','Blind naik setiap'],['· no rebuys, last one standing wins','· 리바이 없음, 최후의 1인이 우승','· 不能重买，坚持到最后者获胜','· tanpa rebuy, yang bertahan terakhir menang'],
['2 min','2분','2分钟','2 mnt'],['4 min','4분','4分钟','4 mnt'],['6 min','6분','6分钟','6 mnt'],['10 min','10분','10分钟','10 mnt'],['Bot speed','봇 속도','机器人速度','Kecepatan bot'],['Relaxed','여유','悠闲','Santai'],['Normal','보통','正常','Normal'],['Fast','빠름','快','Cepat'],['Deal me in','시작하기','发牌吧','Ayo main'],
['Settings','설정','设置','Pengaturan'],['Theme','테마','主题','Tema'],['Light','라이트','浅色','Terang'],['Dark','다크','深色','Gelap'],['Device','기기 설정','跟随设备','Perangkat'],['Language','언어','语言','Bahasa'],['Room theme','방 테마','房间主题','Tema room'],['Table color','테이블 색','桌面颜色','Warna meja'],['Card back','카드 뒷면','牌背','Punggung kartu'],
['Sound effects','효과음','音效','Efek suara'],['Chips, cards and your-turn chime','칩, 카드, 내 차례 알림음','筹码、发牌和轮到你的提示音','Chip, kartu, dan nada giliranmu'],['Hear memes other players send','다른 플레이어가 보낸 밈 듣기','听其他玩家发的梗音效','Dengar meme dari pemain lain'],
['Animations','애니메이션','动画','Animasi'],['Flying chips, dealing, confetti','날아가는 칩, 딜링, 꽃가루','飞筹码、发牌、彩纸','Chip terbang, pembagian kartu, konfeti'],['Four-color deck','4색 덱','四色牌','Dek empat warna'],['Blue diamonds, green clubs','파란 다이아, 초록 클럽','蓝色方块，绿色梅花','Wajik biru, keriting hijau'],
['Hand helper','핸드 도우미','牌型助手','Bantuan tangan'],['Name your poker hand, show blackjack hints','포커 족보 표시, 블랙잭 힌트','显示扑克牌型和21点提示','Tampilkan nama tangan poker dan petunjuk blackjack'],['Vibrate on your turn','내 차례에 진동','轮到你时震动','Getar saat giliranmu'],['Phones only, when the browser allows it','휴대폰 전용, 브라우저가 허용할 때','仅限手机且浏览器允许时','Hanya ponsel, jika browser mengizinkan'],
['Victory moves','승리 필살기','胜利绝招','Jurus kemenangan'],["Each animal's finishing move when they win a hand",'핸드를 이기면 동물마다 필살기를 보여 줘요','赢下一手时每只动物的终结技','Jurus pamungkas tiap hewan saat menang'],['Battery saver','배터리 절약','省电模式','Hemat baterai'],['Keeps the theme but stops the moving background parts','테마는 유지하고 움직이는 배경만 멈춰요','保留主题，只停止背景动画','Tema tetap, bagian latar yang bergerak dihentikan'],
['Poker','포커','扑克','Poker'],['Solitaire','솔리테어','单人麻将','Solitaire'],['Hand rankings, best to worst','족보 순위 (높은 순)','牌型大小（从大到小）','Urutan tangan, terbaik ke terburuk'],['Slots','슬롯','老虎机','Slot'],
['Royal flush','로열 플러시','皇家同花顺','Royal flush'],['Straight flush','스트레이트 플러시','同花顺','Straight flush'],['Four of a kind','포카드','四条','Four of a kind'],['Full house','풀하우스','葫芦','Full house'],['Flush','플러시','同花','Flush'],['Straight','스트레이트','顺子','Straight'],['Three of a kind','트리플','三条','Three of a kind'],['Two pair','투페어','两对','Two pair'],['Pair','원페어','一对','Pair'],['High card','하이카드','高牌','Kartu tinggi'],
['Joining the room…','방에 들어가는 중…','正在加入房间…','Masuk ke room…'],['Waiting for your friends to join.','친구들이 들어오길 기다리는 중.','等待朋友加入。','Menunggu teman bergabung.'],['Waiting for the host to start.','방장이 시작하길 기다리는 중.','等待房主开始。','Menunggu host memulai.'],['Shuffling…','섞는 중…','洗牌中…','Mengocok…'],['Sending your move…','내 수를 보내는 중…','正在发送你的操作…','Mengirim langkahmu…'],
['Your turn.','내 차례.','轮到你了。','Giliranmu.'],['Your turn','내 차례','轮到你','Giliranmu'],['is next','다음이에요','是下一个','berikutnya'],['You can check','체크할 수 있어요','你可以过牌','Kamu bisa check'],['is thinking…','생각 중…','正在思考…','sedang berpikir…'],
['Dealing the flop…','플랍을 까는 중…','正在发翻牌…','Membagikan flop…'],['Dealing the turn…','턴을 까는 중…','正在发转牌…','Membagikan turn…'],['Dealing the river…','리버를 까는 중…','正在发河牌…','Membagikan river…'],['Showdown…','쇼다운…','摊牌…','Showdown…'],['Dealing the rest…','남은 카드를 까는 중…','正在发剩下的牌…','Membagikan sisanya…'],['Watching','관전 중','观战中','Menonton'],
['Everyone else folded','모두 폴드했어요','其他人都弃牌了','Semua lawan fold'],['Busted','파산','出局','Bangkrut'],['Joins next hand','다음 핸드 참가','下一手加入','Ikut tangan berikutnya'],['Away','자리 비움','离开','Pergi'],['Open seat','빈자리','空座位','Kursi kosong'],['bot','봇','机器人','bot'],['(you)','(나)','（你）','(kamu)'],
['JJ Chat','JJ 채팅','JJ 聊天','JJ Chat'],['now','방금','刚刚','baru saja'],['TAP TO SKIP','눌러서 건너뛰기','点击跳过','KETUK UNTUK LEWATI'],
['Play money only. No real cash, no payouts.','가짜 돈 전용. 현금·환전 없음.','仅限虚拟筹码。无真钱、无兑付。','Hanya uang mainan. Tanpa uang asli.'],
['Lucky Slots','럭키 슬롯','幸运老虎机','Slot Keberuntungan'],['Pick a bet, then pull the lever.','베팅을 고르고 레버를 당기세요.','选好下注，然后拉下拉杆。','Pilih taruhan, lalu tarik tuasnya.'],['Bet, then spin','베팅 후 돌리기','下注后旋转','Bertaruh lalu putar'],['Auto ×10','자동 ×10','自动 ×10','Otomatis ×10'],['No luck this time.','이번엔 꽝.','这次没中。','Belum beruntung.'],['The machine is warming up.','기계가 예열 중이에요.','机器正在热身。','Mesinnya lagi pemanasan.'],['Next one. Definitely the next one.','다음 판엔 꼭.','下一把，肯定是下一把。','Berikutnya. Pasti berikutnya.'],['Any pair (left)','왼쪽 두 개 일치','左侧任意一对','Pasangan (kiri)'],['Each 🍒','🍒 하나당','每个🍒','Tiap 🍒'],['Win','당첨','赢','Menang'],['Spin','돌리기','旋转','Putar'],['Bet','베팅','下注','Taruhan'],['Paytable','배당표','赔率表','Tabel bayaran'],['Auto','자동','自动','Otomatis'],['Stop','정지','停止','Berhenti'],
['Pull the lever, line up three and watch the coins pour out. Jackpot pays 200×.','레버를 당겨 세 개를 맞추면 코인이 쏟아져요. 잭팟은 200배.','拉下拉杆，三个连成一线就会掉金币。大奖200倍。','Tarik tuas, jajarkan tiga simbol dan lihat koin mengalir. Jackpot 200×.'],
['Solo · coins','솔로 · 코인','单人 · 金币','Solo · koin'],['Play slots','슬롯 하기','玩老虎机','Main slot'],['Spin to win','돌려서 이기세요','转起来赢大奖','Putar untuk menang'],['Win','당첨','赢','Menang'],['JACKPOT!','잭팟!','大奖！','JACKPOT!'],['Big win!','대박!','大赢！','Menang besar!'],['So close…','아깝다…','差一点…','Hampir…'],['Not enough coins','코인이 부족해요','金币不足','Koin tidak cukup'],
];
const MAP = {ko:new Map(), zh:new Map(), id:new Map()};
T.forEach(r => { for (const L in IDX) if (r[IDX[L]]) MAP[L].set(r[0], r[IDX[L]]); });

// Ranks and hand names, for the hand helper and showdown messages
const RK = {ace:'A',aces:'A',king:'K',kings:'K',queen:'Q',queens:'Q',jack:'J',jacks:'J',ten:'10',tens:'10',nine:'9',nines:'9',eight:'8',eights:'8',seven:'7',sevens:'7',six:'6',sixes:'6',five:'5',fives:'5',four:'4',fours:'4',three:'3',threes:'3',two:'2',twos:'2'};
const r = w => RK[String(w).toLowerCase()] || w;
const HANDS = {
  ko:[[/^royal flush$/i,()=>'로열 플러시'],[/^straight flush, (\w+)-high$/i,(m)=>`${r(m[1])} 하이 스트레이트 플러시`],[/^four (\w+)$/i,m=>`${r(m[1])} 포카드`],[/^full house, (\w+) full of (\w+)$/i,m=>`풀하우스 (${r(m[1])}, ${r(m[2])})`],[/^flush, (\w+)-high$/i,m=>`${r(m[1])} 하이 플러시`],[/^straight, (\w+)-high$/i,m=>`${r(m[1])} 하이 스트레이트`],[/^three (\w+)$/i,m=>`${r(m[1])} 트리플`],[/^two pair, (\w+) and (\w+)$/i,m=>`투페어 (${r(m[1])}, ${r(m[2])})`],[/^pair of (\w+)$/i,m=>`${r(m[1])} 원페어`],[/^(\w+)-high$/i,m=>`${r(m[1])} 하이`]],
  zh:[[/^royal flush$/i,()=>'皇家同花顺'],[/^straight flush, (\w+)-high$/i,m=>`${r(m[1])}高同花顺`],[/^four (\w+)$/i,m=>`四条${r(m[1])}`],[/^full house, (\w+) full of (\w+)$/i,m=>`葫芦（${r(m[1])}带${r(m[2])}）`],[/^flush, (\w+)-high$/i,m=>`${r(m[1])}高同花`],[/^straight, (\w+)-high$/i,m=>`${r(m[1])}高顺子`],[/^three (\w+)$/i,m=>`三条${r(m[1])}`],[/^two pair, (\w+) and (\w+)$/i,m=>`两对（${r(m[1])}和${r(m[2])}）`],[/^pair of (\w+)$/i,m=>`一对${r(m[1])}`],[/^(\w+)-high$/i,m=>`${r(m[1])}高牌`]],
  id:[[/^royal flush$/i,()=>'Royal flush'],[/^straight flush, (\w+)-high$/i,m=>`Straight flush tinggi ${r(m[1])}`],[/^four (\w+)$/i,m=>`Four of a kind ${r(m[1])}`],[/^full house, (\w+) full of (\w+)$/i,m=>`Full house ${r(m[1])} dan ${r(m[2])}`],[/^flush, (\w+)-high$/i,m=>`Flush tinggi ${r(m[1])}`],[/^straight, (\w+)-high$/i,m=>`Straight tinggi ${r(m[1])}`],[/^three (\w+)$/i,m=>`Three of a kind ${r(m[1])}`],[/^two pair, (\w+) and (\w+)$/i,m=>`Two pair ${r(m[1])} dan ${r(m[2])}`],[/^pair of (\w+)$/i,m=>`Sepasang ${r(m[1])}`],[/^(\w+)-high$/i,m=>`${r(m[1])} tinggi`]],
};
function hand(s, L) { for (const [re, f] of HANDS[L]) { const m = s.match(re); if (m) return f(m); } return null; }
const W = {ko:['승리','으로','콜','올인','스몰 블라인드','빅 블라인드','레이즈','다음 핸드까지','수딧'],zh:['赢得','凭','跟注','全押','小盲','大盲','加注','下一手还有','同花'],id:['menang','dengan','Call','All-in','Small blind','Big blind','Raise','Tangan berikutnya dalam','suited']};
// Patterns for text that has numbers or names in it
const PAT = [
  [/^(.+) wins (\$[\d,.]+)$/, (m,L)=>L==='ko'?`${m[1]} ${m[2]} 획득`:L==='zh'?`${m[1]} 赢得 ${m[2]}`:`${m[1]} menang ${m[2]}`],
  [/^(.+) · (\$[\d,.]+) in the pot$/, (m,L)=>L==='ko'?`${m[1]} · 팟에 ${m[2]}`:L==='zh'?`${m[1]} · 已下注 ${m[2]}`:`${m[1]} · ${m[2]} di pot`],
  [/^(.+) · your money$/, (m,L)=>L==='ko'?`${m[1]} · 내 돈`:L==='zh'?`${m[1]} · 我的筹码`:`${m[1]} · uangmu`],
  [/^· bot$/, (m,L)=>({ko:'· 봇',zh:'· 机器人',id:'· bot'}[L])],
  [/^You put (\$[\d,.]+) more into the pot\.$/, (m,L)=>L==='ko'?`팟에 ${m[1]}을 더 넣어요.`:L==='zh'?`再往底池放 ${m[1]}。`:`Kamu menambah ${m[1]} ke pot.`],
  [/^That’s all your money\. Bold\.$/, (m,L)=>({ko:'전 재산이에요. 대담하네요.',zh:'这是你全部的钱。够胆。',id:'Itu semua uangmu. Berani.'}[L])],
  [/^You finished (\d+)\w+$/, (m,L)=>L==='ko'?`최종 ${m[1]}위`:L==='zh'?`你获得第${m[1]}名`:`Kamu finis ke-${m[1]}`],
  [/^(.+) wins the tournament!$/, (m,L)=>L==='ko'?`${m[1]} 토너먼트 우승!`:L==='zh'?`${m[1]} 赢得锦标赛！`:`${m[1]} juara turnamen!`],
  [/^Now (\$[\d,.]+\/\$[\d,.]+)\. Tighten up\.$/, (m,L)=>L==='ko'?`이제 ${m[1]}. 신중하게.`:L==='zh'?`现在是 ${m[1]}。打紧一点。`:`Sekarang ${m[1]}. Main lebih ketat.`],
  [/^Wins (\$[\d,.]+)$/, (m,L)=>L==='ko'?`${m[1]} 획득`:L==='zh'?`赢得 ${m[1]}`:`Menang ${m[1]}`],
  [/^with (.+)$/, (m,L)=>{const h=hand(m[1],L);return h?(L==='ko'?`${h}(으)로`:L==='zh'?`凭${h}`:`dengan ${h}`):null;}],
  [/^(\$[\d,.]+) to call( ·)?$/, (m,L)=>(L==='ko'?`${m[1]} 콜`:L==='zh'?`跟注 ${m[1]}`:`${m[1]} untuk call`)+(m[2]||'')],
  [/^You can check( ·)?$/, (m,L)=>({ko:'체크할 수 있어요',zh:'你可以过牌',id:'Kamu bisa check'}[L])+(m[1]||'')],
  [/^is thinking…( ·)?$/, (m,L)=>({ko:'생각 중…',zh:'正在思考…',id:'sedang berpikir…'}[L])+(m[1]||'')],
  [/^Call (\$[\d,.]+)$/, (m,L)=>`${W[L][2]} ${m[1]}`],
  [/^Raise (\$[\d,.]+)$/, (m,L)=>`${W[L][6]} ${m[1]}`],
  [/^Raise to (\$[\d,.]+)$/, (m,L)=>`${W[L][6]} ${m[1]}`],
  [/^All-in (\$[\d,.]+)$/, (m,L)=>`${W[L][3]} ${m[1]}`],
  [/^Small blind (\$[\d,.]+)$/, (m,L)=>`${W[L][4]} ${m[1]}`],
  [/^Big blind (\$[\d,.]+)$/, (m,L)=>`${W[L][5]} ${m[1]}`],
  [/^Next hand in$/, (m,L)=>W[L][7]],
  [/^(.+) suited$/, (m,L)=>`${m[1]} ${W[L][8]}`],
  [/^Get (\$[\d,.]+) more$/, (m,L)=>L==='ko'?`${m[1]} 더 받기`:L==='zh'?`再领 ${m[1]}`:`Ambil ${m[1]} lagi`],
  [/^Everyone else folded · (.+)$/, (m,L)=>`${MAP[L].get('Everyone else folded')} · ${m[1]}`],
  [/^Out · (\d+)(st|nd|rd|th)$/, (m,L)=>L==='ko'?`탈락 · ${m[1]}위`:L==='zh'?`出局 · 第${m[1]}名`:`Keluar · ke-${m[1]}`],
  [/^Lv (\d+) · (.+)$/, (m,L)=>L==='ko'?`레벨 ${m[1]} · ${m[2]}`:L==='zh'?`第${m[1]}级 · ${m[2]}`:`Lv ${m[1]} · ${m[2]}`],
  [/^Blinds up! Level (\d+)$/, (m,L)=>L==='ko'?`블라인드 상승! 레벨 ${m[1]}`:L==='zh'?`盲注上涨！第${m[1]}级`:`Blind naik! Level ${m[1]}`],
  [/^You finished$/, (m,L)=>({ko:'최종 순위',zh:'你的名次',id:'Kamu finis'}[L])],
  [/^(.+)'s room$/, (m,L)=>L==='ko'?`${m[1]}의 방`:L==='zh'?`${m[1]} 的房间`:`Room ${m[1]}`],
  [/^Discard (.+)$/, (m,L)=>L==='ko'?`${m[1]} 버리기`:L==='zh'?`打出 ${m[1]}`:`Buang ${m[1]}`],
  [/^You drew (.+)\. Tap a tile, then discard\.( ·)?$/, (m,L)=>(L==='ko'?`${m[1]} 패를 뽑았어요. 버릴 패를 고르세요.`:L==='zh'?`你摸到了 ${m[1]}。选一张牌打出。`:`Kamu dapat ${m[1]}. Pilih ubin lalu buang.`)+(m[2]||'')],
  [/^Tap a tile, then discard\.( ·)?$/, (m,L)=>({ko:'버릴 패를 고르세요.',zh:'选一张牌打出。',id:'Pilih ubin lalu buang.'}[L])+(m[1]||'')],
  [/^Next spin in (\d+)h (\d+)m$/, (m,L)=>L==='ko'?`다음 룰렛까지 ${m[1]}시간 ${m[2]}분`:L==='zh'?`下次转盘还有 ${m[1]}小时${m[2]}分`:`Putaran berikutnya ${m[1]}j ${m[2]}m`],
  [/^(\d+) of (\d+)$/, (m,L)=>`${m[1]} / ${m[2]}`],
];
function tr(s, L) {
  if (!L || L === 'en' || !MAP[L]) return null;
  const t = MAP[L].get(s); if (t) return t;
  const h = hand(s, L); if (h) return h;
  for (const [re, f] of PAT) { const m = s.match(re); if (m) { const v = f(m, L); if (v) return v; } }
  return null;
}

const SKIP = '.chatlog p,.cn-t,.say,.code-big,script,style,textarea,.fin-txt b,.fin-txt em,.fin-txt small,.f-word,[data-noi18n]';
let lang = 'en', busy = false;
const ATTRS = ['placeholder','aria-label','title'];
function doText(n) {
  if (n.__en === undefined) n.__en = n.nodeValue;
  else if (n.nodeValue !== n.__tr) n.__en = n.nodeValue; // the game changed the text
  const src = n.__en, key = src.trim();
  if (!key || !/[A-Za-z]/.test(key)) return;
  const p = n.parentElement; if (p && (p.closest(SKIP) || p.matches('.nm,.chatlog b,.cn-body b,.m4-who b,.m4-me b,.pod b,#throwTo,#meName.nm'))) return;
  const t = tr(key, lang);
  const out = t ? src.replace(key, t) : src;
  if (n.nodeValue !== out) { n.nodeValue = out; }
  n.__tr = out;
}
function doEl(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const k = 'data-en-' + a; let src = el.getAttribute(k);
    const cur = el.getAttribute(a);
    if (src === null || (cur !== el.__trA?.[a] && cur !== src)) { src = cur; el.setAttribute(k, src); }
    const t = tr(src.trim(), lang); const out = t || src;
    if (cur !== out) el.setAttribute(a, out);
    (el.__trA = el.__trA || {})[a] = out;
  }
}
function walk(root) {
  if (!root) return;
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1) return;
  if (root.matches && root.matches('script,style')) return;
  doEl(root);
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n; while ((n = it.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
}
function apply() {
  busy = true; try { walk(document.body); } finally { busy = false; }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.documentElement.classList.toggle('cjk', lang === 'ko' || lang === 'zh');
}
const mo = new MutationObserver(list => {
  if (busy) return; busy = true;
  try { for (const m of list) { if (m.type === 'characterData') doText(m.target); else if (m.type === 'attributes') doEl(m.target); else m.addedNodes.forEach(walk); } }
  finally { mo.takeRecords(); busy = false; }
});
function setLang(L) {
  lang = LANGS.some(x => x[0] === L) ? L : 'en';
  apply();
}
window.JJ_I18N = {LANGS, setLang, tr: s => tr(s, lang) || s, get lang() { return lang; }};
function start() {
  let L = 'en';
  try { const s = JSON.parse(localStorage.getItem('jj-set') || '{}'); if (s.lang) L = s.lang; else { const n = (navigator.language || '').toLowerCase(); L = n.startsWith('ko') ? 'ko' : n.startsWith('zh') ? 'zh' : n.startsWith('id') ? 'id' : 'en'; } } catch (e) {}
  setLang(L);
  mo.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
