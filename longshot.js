/* JJ POKER — Long Shot: name something in a category; the rarer your (correct) answer, the bigger the payout.
   Tiers: Sure Bet 10 · Even Money 30 · Dark Horse 60 · Long Shot 85 · Jackpot 100. Wrong or too slow pays 0.
   Solo: "Today's 7" (same questions for everyone that day) or free play. Online: friends answer together,
   and an answer someone else also gave pays half. Answers are in English. */
(() => {
'use strict';
const J = window.JJ, {$, esc, num, SFX} = J;

/* ---------- questions: [en, ko, zh, id, sure bets, even money, dark horses, long shots, jackpots]  ("a/b" = same answer) ---------- */
const QS = [
[`Name a fruit`,`과일 이름을 대세요`,`说一种水果`,`Sebutkan buah`,
 `apple,banana,orange,strawberry,grape`,`mango,pineapple,watermelon,peach,pear,cherry,lemon,kiwi,blueberry`,
 `papaya,plum,apricot,coconut,raspberry,lime,grapefruit,pomegranate,fig,cantaloupe,honeydew,nectarine,blackberry,cranberry,avocado,tangerine,clementine,melon`,
 `lychee,durian,guava,passion fruit,dragon fruit,persimmon,quince,date,mulberry,gooseberry,jackfruit,starfruit/carambola,kumquat,tamarind,rambutan,mangosteen,elderberry,boysenberry`,
 `salak/snake fruit,soursop,cherimoya,feijoa,loquat,longan,pawpaw,medlar,sapodilla,jabuticaba,langsat,acerola,yuzu,ugli fruit,miracle fruit,cloudberry,lingonberry,huckleberry,bilberry`],
[`Name an animal that lives in the ocean`,`바다에 사는 동물 이름을 대세요`,`说一种生活在海里的动物`,`Sebutkan hewan yang hidup di laut`,
 `shark,whale,dolphin,fish,octopus`,`jellyfish,seal,crab,turtle/sea turtle,starfish/sea star,squid,lobster,shrimp,orca/killer whale`,
 `stingray,manta ray,eel,seahorse,walrus,sea lion,clownfish,tuna,swordfish,narwhal,coral,sea urchin,clam,oyster,penguin`,
 `barracuda,pufferfish,anglerfish,sea cucumber,manatee,dugong,hammerhead,beluga,marlin,sardine,anchovy,krill,plankton,nudibranch,cuttlefish,mussel,scallop,sea otter/otter`,
 `blobfish,coelacanth,oarfish,sunfish/mola,lionfish,sea slug,sea anemone,barnacle,hagfish,lamprey,remora,wobbegong,dumbo octopus,vampire squid,goblin shark,sea pig,isopod`],
[`Name a country in Asia`,`아시아 나라 이름을 대세요`,`说一个亚洲国家`,`Sebutkan negara di Asia`,
 `china,japan,india,south korea/korea,thailand`,`vietnam,indonesia,philippines,malaysia,singapore,north korea`,
 `pakistan,bangladesh,nepal,cambodia,laos,myanmar/burma,sri lanka,mongolia,taiwan,saudi arabia,iran,iraq,israel,turkey`,
 `afghanistan,kazakhstan,uzbekistan,bhutan,maldives,brunei,jordan,syria,lebanon,qatar,united arab emirates/uae,kuwait,oman,yemen`,
 `timor-leste/east timor,kyrgyzstan,tajikistan,turkmenistan,bahrain,armenia,azerbaijan,georgia,cyprus`],
[`Name a pizza topping`,`피자 토핑 이름을 대세요`,`说一种披萨配料`,`Sebutkan topping pizza`,
 `pepperoni,cheese,mushroom,sausage,ham`,`pineapple,olive,onion,bacon,bell pepper/pepper,tomato`,
 `chicken,spinach,jalapeno,anchovy,beef,salami,basil,garlic,mozzarella,corn`,
 `artichoke,feta,ricotta,prosciutto,arugula/rocket,shrimp,tuna,egg,broccoli,eggplant,zucchini,bbq sauce,meatball,sun-dried tomato,goat cheese`,
 `kimchi,bulgogi,truffle,fig,pear,gorgonzola,clam,potato,capers,pesto,honey,banana,squid,duck,pistachio,nduja,burrata,sweet potato`],
[`Name something you find in a kitchen`,`부엌에 있는 물건을 대세요`,`说一样厨房里的东西`,`Sebutkan benda di dapur`,
 `fridge/refrigerator,stove,oven,sink,microwave`,`knife,fork,spoon,plate,pan,pot,table,toaster,cup`,
 `kettle,blender,dishwasher,cutting board,bowl,spatula,cabinet,chair,trash can/bin,glass,napkin,towel,chopsticks`,
 `whisk,ladle,colander,grater,peeler,tongs,rolling pin,apron,timer,oven mitt,coffee maker,rice cooker,can opener,sponge`,
 `mandoline,zester,mortar and pestle/mortar,salad spinner,garlic press,sieve,trivet,thermometer,funnel,butter dish,spice rack,cookbook,fire extinguisher,wok,steamer,air fryer`],
[`Name a sport`,`스포츠 종목을 대세요`,`说一项运动`,`Sebutkan olahraga`,
 `soccer/football,basketball,baseball,tennis,golf`,`volleyball,swimming,hockey,boxing,badminton,american football,running`,
 `cricket,rugby,table tennis/ping pong,skiing,snowboarding,cycling,surfing,wrestling,bowling,gymnastics,skateboarding,karate,taekwondo`,
 `fencing,archery,rowing,polo,lacrosse,handball,curling,judo,diving,sailing,squash,softball,climbing,triathlon,water polo`,
 `sepak takraw,kabaddi,hurling,bobsleigh,luge,skeleton,biathlon,jai alai,korfball,sumo,pickleball,dodgeball,ultimate frisbee,canoe polo,bossaball,underwater hockey,petanque`],
[`Name a musical instrument`,`악기 이름을 대세요`,`说一种乐器`,`Sebutkan alat musik`,
 `piano,guitar,drum,violin,flute`,`trumpet,saxophone,bass,keyboard,cello,clarinet,harp,ukulele`,
 `trombone,tuba,harmonica,xylophone,accordion,oboe,banjo,tambourine,triangle,organ,recorder`,
 `bassoon,french horn,viola,mandolin,sitar,bagpipes,cymbal,marimba,harpsichord,synthesizer,glockenspiel,bongo,kazoo`,
 `gamelan,angklung,gayageum,erhu,didgeridoo,theremin,hurdy-gurdy,koto,shamisen,kalimba,ocarina,steelpan/steel drum,zither,bouzouki,sousaphone,piccolo,celesta,lute,guzheng,janggu`],
[`Name a color`,`색깔 이름을 대세요`,`说一种颜色`,`Sebutkan warna`,
 `red,blue,green,yellow,black`,`white,purple,orange,pink,brown,gray/grey`,
 `gold,silver,navy,teal,beige,maroon,violet,turquoise,cyan,magenta,indigo,lavender`,
 `crimson,scarlet,burgundy,olive,mint,coral,peach,ivory,khaki,charcoal,lilac,aqua,cream,tan,amber,ruby,emerald`,
 `chartreuse,vermilion,cerulean,mauve,ochre,taupe,periwinkle,fuchsia,puce,sienna,umber,celadon,saffron,mahogany,sepia,ecru,heliotrope,cobalt`],
[`Name a vegetable`,`채소 이름을 대세요`,`说一种蔬菜`,`Sebutkan sayuran`,
 `carrot,potato,broccoli,tomato,lettuce`,`onion,cucumber,corn,spinach,pepper,cabbage,pea`,
 `celery,cauliflower,garlic,eggplant/aubergine,zucchini/courgette,pumpkin,mushroom,bean,asparagus,sweet potato,radish,kale`,
 `beet/beetroot,artichoke,leek,okra,brussels sprout,turnip,parsnip,squash,bok choy,ginger,yam,chili`,
 `kohlrabi,rutabaga,jicama,chayote,daikon,fennel,celeriac,salsify,romanesco,taro,lotus root,bitter melon,water spinach/kangkung,watercress,endive,radicchio,sunchoke,cassava`],
[`Name a dog breed`,`개 품종을 대세요`,`说一种狗的品种`,`Sebutkan ras anjing`,
 `labrador/lab,golden retriever,poodle,german shepherd,bulldog`,`chihuahua,beagle,husky/siberian husky,pug,corgi,dachshund,shiba inu/shiba,rottweiler`,
 `boxer,dalmatian,doberman,maltese,yorkshire terrier/yorkie,shih tzu,pomeranian,border collie,great dane,jindo,chow chow,samoyed,greyhound,pitbull`,
 `akita,bichon frise/bichon,cocker spaniel,cavalier king charles spaniel/cavalier,saint bernard,bernese mountain dog,mastiff,schnauzer,whippet,basset hound,bloodhound,newfoundland,jack russell,papillon,weimaraner,shar pei,afghan hound`,
 `xoloitzcuintli,basenji,komondor,puli,borzoi,vizsla,lagotto romagnolo,kooikerhondje,otterhound,saluki,leonberger,affenpinscher,tibetan mastiff,sapsali,lundehund,azawakh,schipperke,keeshond,pumi`],
[`Name a K-pop group`,`K팝 그룹 이름을 대세요`,`说一个韩流组合`,`Sebutkan grup K-pop`,
 `bts,blackpink,twice,exo`,`newjeans,seventeen,stray kids,big bang/bigbang,red velvet,aespa,ive,le sserafim`,
 `nct,itzy,txt/tomorrow x together,enhypen,ateez,girls generation/snsd,super junior,mamamoo,shinee,gidle/(g)i-dle/i-dle,got7,monsta x`,
 `2ne1,kara,wonder girls,apink,oh my girl,stayc,nmixx,treasure,the boyz,btob,infinite,winner,ikon,fromis_9/fromis 9,kep1er,illit,riize,babymonster,zerobaseone,day6`,
 `h.o.t/hot,sechs kies,shinhwa,god,tvxq,2pm,highlight/beast,cnblue,f(x)/fx,sistar,ft island,lovelyz,gfriend,april,wjsn/cosmic girls,loona,dreamcatcher,victon,oneus,cravity,xikers,tws,kiss of life,qwer`],
[`Name a city in Indonesia`,`인도네시아 도시 이름을 대세요`,`说一个印尼城市`,`Sebutkan kota di Indonesia`,
 `jakarta,surabaya,bandung,bali`,`yogyakarta/jogja/jogjakarta,medan,semarang,makassar,denpasar`,
 `malang,palembang,solo/surakarta,bogor,batam,manado,balikpapan,pontianak,padang,bekasi,tangerang,depok`,
 `pekanbaru,banjarmasin,samarinda,jayapura,kupang,mataram,ambon,cirebon,jambi,bengkulu,bandar lampung/lampung,serang,sukabumi,tasikmalaya,kediri,banda aceh`,
 `ternate,sorong,merauke,palu,kendari,gorontalo,tarakan,bukittinggi,salatiga,magelang,purwokerto,probolinggo,pematangsiantar,singkawang,bitung,tual,labuan bajo,manokwari`],
[`Name a city in South Korea`,`한국 도시 이름을 대세요`,`说一个韩国城市`,`Sebutkan kota di Korea Selatan`,
 `seoul,busan`,`incheon,daegu,daejeon,jeju`,
 `gwangju,ulsan,suwon,gyeongju,sejong,jeonju,chuncheon,gangneung,pohang`,
 `changwon,cheongju,cheonan,yeosu,sokcho,andong,mokpo,goyang,seongnam,yongin,bucheon,ansan,gimhae,paju,anyang,pyeongtaek,gumi,jinju,tongyeong`,
 `gimpo,iksan,suncheon,gunsan,wonju,chungju,jecheon,boryeong,gongju,yeongju,mungyeong,samcheok,donghae,taebaek,geoje,sacheon,miryang,naju,damyang,hwaseong,uijeongbu`],
[`Name an animated movie`,`애니메이션 영화 제목을 대세요`,`说一部动画电影`,`Sebutkan film animasi`,
 `frozen,the lion king/lion king,toy story,shrek,finding nemo`,`moana,aladdin,coco,zootopia,encanto,up,inside out,cars,the incredibles/incredibles,spirited away,tangled,minions`,
 `beauty and the beast,the little mermaid/little mermaid,cinderella,mulan,big hero 6,ratatouille,wall-e,monsters inc,kung fu panda,despicable me,madagascar,ice age,how to train your dragon,my neighbor totoro/totoro,your name,howl's moving castle,spider-verse/into the spider-verse`,
 `princess mononoke,ponyo,kiki's delivery service,the iron giant/iron giant,coraline,akira,the lego movie/lego movie,the emperor's new groove/emperor's new groove,hercules,tarzan,pocahontas,lilo and stitch/lilo & stitch,bolt,luca,turning red,soul,elemental,klaus,rango,wreck-it ralph`,
 `grave of the fireflies,perfect blue,paprika,the secret of kells/secret of kells,song of the sea,wolfwalkers,persepolis,the triplets of belleville/triplets of belleville,my life as a zucchini,fantastic mr fox,isle of dogs,mary and max,the red turtle/red turtle,flow,the boy and the heron/boy and the heron,the black cauldron/black cauldron,treasure planet,atlantis,the swan princess/swan princess,anastasia`],
[`Name a social media or chat app`,`SNS나 메신저 앱 이름을 대세요`,`说一个社交或聊天软件`,`Sebutkan aplikasi media sosial atau chat`,
 `instagram,facebook,tiktok,youtube,whatsapp`,`twitter/x,snapchat,kakaotalk/kakao,linkedin,reddit,pinterest,threads,line`,
 `wechat,telegram,discord,tumblr,twitch,weibo,band/naver band,bereal,messenger,signal`,
 `vine,myspace,clubhouse,mastodon,bluesky,quora,flickr,douyin,xiaohongshu/rednote,kakaostory,cyworld,lemon8,vk,viber,qq`,
 `friendster,orkut,google plus/google+,path,periscope,yik yak,ello,hi5,bebo,me2day,peach,plurk,mixi,ask.fm/askfm,tagged,koo,nateon,mig33`],
[`Name a word that rhymes with CAT`,`CAT과 운이 맞는 영어 단어를 대세요`,`说一个和 CAT 押韵的英文单词`,`Sebutkan kata bahasa Inggris yang berima dengan CAT`,
 `hat,bat,mat,rat`,`sat,fat,pat,flat,that,chat`,
 `brat,splat,spat,vat,gnat,slat,scat,drat,format,combat`,
 `acrobat,diplomat,thermostat,habitat,aristocrat,democrat,bureaucrat,doormat,laundromat,copycat,wildcat,tomcat,nonfat,cravat,bobcat,muskrat`,
 `autocrat,technocrat,plutocrat,rheostat,ziggurat,photostat,polecat,meerkat,dingbat,pitapat,hemostat,sprat,stat,tat,plat`],
[`Name something with wheels`,`바퀴가 달린 것을 대세요`,`说一样有轮子的东西`,`Sebutkan sesuatu yang punya roda`,
 `car,bicycle/bike,bus,truck`,`motorcycle/motorbike,train,skateboard,scooter,wheelchair,stroller,shopping cart,taxi`,
 `tractor,van,airplane/plane,wagon,roller skates,suitcase,office chair,tricycle,trolley,wheelbarrow,tram,go-kart/gokart`,
 `segway,unicycle,rickshaw,bajaj,becak,forklift,bulldozer,ambulance,fire truck,limousine,hoverboard,toy car,pram,lawn mower,roller coaster`,
 `penny-farthing,chariot,gurney,tuk-tuk/tuktuk,pizza cutter,spinning wheel,ferris wheel,roulette wheel,hamster wheel,potter's wheel,pulley,rolling pin,paint roller,dolly,caster`],
[`Name a type of bread`,`빵 종류를 대세요`,`说一种面包`,`Sebutkan jenis roti`,
 `baguette,croissant,bagel,sourdough,toast`,`brioche,ciabatta,naan,whole wheat,rye,cornbread,tortilla,bun,pita`,
 `focaccia,challah,pretzel,english muffin,roti,garlic bread,banana bread,flatbread,pumpernickel,milk bread,multigrain`,
 `chapati,paratha,soda bread,injera,lavash,matzo,bao/baozi,mantou,arepa,crumpet,panettone,stollen,anpan,melonpan,shokupan,roti canai`,
 `pandesal,lefse,piadina,kulcha,bhatura,frybread,bannock,ensaimada,khachapuri,simit,tsoureki,pogaca,zopf,pain de mie,roti jala,bolillo,conchas,hokkaido milk bread`],
[`Name a planet or moon`,`행성이나 위성 이름을 대세요`,`说一颗行星或卫星`,`Sebutkan planet atau bulan`,
 `earth,mars,jupiter,saturn,moon`,`venus,mercury,neptune,uranus,pluto`,
 `titan,europa,io,ganymede,callisto,phobos,deimos,triton`,
 `enceladus,charon,oberon,titania,miranda,ceres,eris,makemake,haumea,mimas,rhea,iapetus,dione,tethys,ariel,umbriel`,
 `hyperion,phoebe,nereid,proteus,amalthea,himalia,larissa,puck,proxima b,trappist-1e,sedna,quaoar,orcus,gonggong,vesta,pallas,kepler-22b`],
[`Name a breakfast food`,`아침 식사 메뉴를 대세요`,`说一种早餐`,`Sebutkan makanan sarapan`,
 `eggs/egg,pancakes/pancake,toast,cereal,bacon`,`waffles/waffle,oatmeal,yogurt,sausage,bagel,omelette/omelet,fruit`,
 `french toast,croissant,muffin,granola,hash browns,smoothie,porridge,rice,congee,avocado toast,breakfast burrito,bread,sandwich`,
 `eggs benedict,shakshuka,crepe,grits,biscuits and gravy,nasi uduk,bubur ayam,nasi goreng,kaya toast,dim sum,miso soup,natto,tamagoyaki,chia pudding,acai bowl,frittata,quiche,scone`,
 `kedgeree,black pudding,haggis,full english,huevos rancheros,chilaquiles,menemen,ful medames,lontong sayur,roti canai,youtiao,soy milk,gyeran-mari,kippers,baked beans,muesli,arepa`],
[`Name an ice cream flavor`,`아이스크림 맛을 대세요`,`说一种冰淇淋口味`,`Sebutkan rasa es krim`,
 `vanilla,chocolate,strawberry,mint chocolate chip/mint/mint choco`,`cookies and cream,cookie dough,rocky road,coffee,caramel,matcha/green tea,mango`,
 `pistachio,butter pecan,neapolitan,salted caramel,coconut,banana,lemon,raspberry,cheesecake,bubblegum,rum raisin,durian,taro,red bean`,
 `black sesame,rose,lavender,honey,peach,blueberry,cherry,hazelnut,tiramisu,birthday cake,moose tracks,peanut butter,almond,yuzu,ube,pandan,earl grey,maple walnut,spumoni,tutti frutti`,
 `pumpkin,ginger,avocado,corn,sweet potato,olive oil,basil,cheese,soy sauce,garlic,bacon,charcoal,kulfi,lychee,jackfruit,injeolmi,misugaru,horchata,stracciatella,fior di latte,dulce de leche`],
[`Name a holiday or festival`,`명절이나 축제 이름을 대세요`,`说一个节日`,`Sebutkan hari raya atau festival`,
 `christmas,new year,halloween,easter,thanksgiving`,`chinese new year/lunar new year/imlek,valentines day/valentine's day/valentine,eid/eid al-fitr/lebaran/idul fitri,diwali,hanukkah`,
 `chuseok,ramadan,independence day,mothers day/mother's day,fathers day/father's day,st patricks day/st patrick's day,mid-autumn festival,songkran,holi,day of the dead/dia de los muertos,carnival,oktoberfest`,
 `nyepi,vesak/waisak,passover,yom kippur,mardi gras,boxing day,labor day,memorial day,april fools,cinco de mayo,obon,tet,seollal,qingming,dragon boat festival,lantern festival,childrens day/children's day,hangul day,galungan`,
 `kartini day,purim,sukkot,guy fawkes/bonfire night,hogmanay,juneteenth,kwanzaa,epiphany,pentecost,setsubun,tanabata,hanami,pepero day,parents day,teachers day,loy krathong,thaipusam,onam,eid al-adha/idul adha,maulid`],
[`Name a type of pasta`,`파스타 종류를 대세요`,`说一种意大利面`,`Sebutkan jenis pasta`,
 `spaghetti,penne,macaroni,lasagna/lasagne,fettuccine`,`ravioli,linguine,fusilli,tortellini,rigatoni,farfalle/bow tie`,
 `orzo,gnocchi,cannelloni,rotini,angel hair/capellini,ziti,shells/conchiglie,tagliatelle,pappardelle,vermicelli`,
 `orecchiette,bucatini,manicotti,cavatappi,ditalini,radiatori,campanelle,gemelli,paccheri,trofie,mafaldine,stelline,agnolotti,cappelletti,strozzapreti`,
 `casarecce,gigli,lumache,fregola,malloreddus,pici,bigoli,corzetti,garganelli,mezzelune,culurgiones,sedanini,anelli,tortiglioni,rotelle,acini di pepe,scialatielli,maltagliati,calamarata`],
[`Name a body part`,`신체 부위를 대세요`,`说一个身体部位`,`Sebutkan bagian tubuh`,
 `hand,head,arm,leg,foot`,`eye,nose,mouth,ear,finger,heart,knee`,
 `elbow,shoulder,neck,toe,chin,wrist,ankle,hip,stomach,brain,lung,back,thumb,tongue,lip`,
 `liver,kidney,spleen,pancreas,eyebrow,eyelash,cheek,forehead,thigh,calf,shin,heel,palm,knuckle,nostril,jaw,collarbone,rib,spine,skull`,
 `philtrum,uvula,earlobe,patella,clavicle,sternum,femur,tibia,fibula,appendix,gallbladder,diaphragm,larynx,esophagus,cornea,retina,cochlea,septum,cuticle,coccyx,achilles tendon,tonsil,adam's apple`],
[`Name a flower`,`꽃 이름을 대세요`,`说一种花`,`Sebutkan bunga`,
 `rose,tulip,sunflower,daisy,lily`,`orchid,lavender,daffodil,lotus,cherry blossom,carnation,hibiscus`,
 `jasmine/melati,peony,dandelion,iris,marigold,poppy,violet,magnolia,chrysanthemum,lilac,hydrangea,azalea,camellia`,
 `gardenia,begonia,dahlia,frangipani/plumeria,bougainvillea,forget-me-not,snapdragon,petunia,pansy,gerbera,zinnia,geranium,morning glory,cosmos,gladiolus,freesia,anemone`,
 `rafflesia,corpse flower/titan arum/bunga bangkai,edelweiss,protea,bird of paradise,foxglove,larkspur,hellebore,ranunculus,amaryllis,bluebell,heather,hollyhock,wisteria,mugunghwa/rose of sharon,sweet pea,calla lily`],
[`Name something people collect`,`사람들이 모으는 것을 대세요`,`说一样人们会收藏的东西`,`Sebutkan barang yang suka dikoleksi orang`,
 `stamps,coins,cards/trading cards,books`,`shoes/sneakers,toys,art,records/vinyl,comics,stickers,dolls,watches`,
 `postcards,rocks,shells/seashells,cars,figures/figurines,magnets,keychains,photos,mugs/cups,bags,perfume,plants,lego`,
 `antiques,autographs,bottle caps,butterflies,fossils,snow globes,teddy bears,spoons,thimbles,matchboxes,tickets,pins,crystals,banknotes,maps,model trains,hats,wine`,
 `barf bags,hotel soap,sugar packets,erasers,pencils,receipts,fortune cookie fortunes,bricks,meteorites,cigar bands,beer coasters,typewriters,bonsai,sand,feathers,keys,dice,pez dispensers`],
[`Name a job`,`직업 이름을 대세요`,`说一种职业`,`Sebutkan pekerjaan`,
 `doctor,teacher,nurse,police officer/police/cop,firefighter`,`chef/cook,lawyer,engineer,pilot,farmer,dentist,programmer/developer/software engineer,driver`,
 `accountant,artist,singer,actor,mechanic,plumber,electrician,carpenter,cashier,waiter,banker,scientist,soldier,writer,designer`,
 `architect,pharmacist,veterinarian/vet,librarian,journalist,photographer,baker,barber,hairdresser,florist,tailor,surgeon,judge,astronaut,translator,lifeguard,janitor,real estate agent`,
 `actuary,sommelier,taxidermist,cartographer,glassblower,locksmith,farrier,blacksmith,chimney sweep,auctioneer,mortician,lexicographer,ornithologist,seismologist,stenographer,puppeteer,falconer,beekeeper,cobbler,stunt double,foley artist,ice sculptor`],
[`Name something you see in the sky`,`하늘에서 볼 수 있는 것을 대세요`,`说一样能在天上看到的东西`,`Sebutkan sesuatu yang terlihat di langit`,
 `sun,moon,cloud,star,bird`,`airplane/plane,rainbow,helicopter,kite,lightning`,
 `rain,snow,balloon,hot air balloon,drone,satellite,comet,planet,shooting star/meteor,smoke,fog,aurora/northern lights`,
 `blimp,constellation,galaxy,milky way,eclipse,space station/iss,rocket,fireworks,hail,eagle,bat,ufo,thunder,haze`,
 `contrail,noctilucent cloud,sundog,zodiacal light,halo,ball lightning,glider,paraglider,parachute,zeppelin,mammatus,cirrus,cumulonimbus,sky lantern,frisbee,dandelion seeds`],
[`Name a drink`,`음료 이름을 대세요`,`说一种饮料`,`Sebutkan minuman`,
 `water,coffee,tea,milk,juice/orange juice`,`soda/cola/coke,beer,wine,lemonade,hot chocolate,smoothie,soju`,
 `bubble tea/boba,iced tea,milkshake,latte,cappuccino,espresso,whiskey,vodka,sake,makgeolli,coconut water,energy drink,kombucha`,
 `matcha latte,chai,yakult,horchata,lassi,teh tarik,es teh,root beer,ginger ale,cider,mojito,sangria,margarita,tequila,rum,gin,champagne,sikhye`,
 `jamu,bandrek,wedang jahe,es cendol/cendol,es doger,kvass,ayran,mate/yerba mate,boza,sujeonggwa,omija tea,yuja tea,tepache,chicha,salep,arak,baijiu,mead,sarsaparilla,dandelion and burdock`],
[`Name a board or card game`,`보드게임이나 카드게임 이름을 대세요`,`说一个桌游或纸牌游戏`,`Sebutkan permainan papan atau kartu`,
 `chess,monopoly,poker,uno,scrabble`,`checkers,blackjack,go/baduk,jenga,clue/cluedo,mahjong,snakes and ladders`,
 `catan,risk,battleship,connect four,backgammon,domino/dominoes,yahtzee,trivial pursuit,solitaire,go fish,hwatu/go-stop,capsa/big two`,
 `ticket to ride,pandemic,codenames,dixit,carcassonne,splendor,exploding kittens,bridge,rummy,gin rummy,cribbage,mancala/congklak,othello/reversi,yut nori/yunnori,shogi,xiangqi/chinese chess`,
 `gloomhaven,twilight imperium,agricola,puerto rico,terraforming mars,wingspan,azul,root,coup,the resistance/resistance,hanabi,love letter,sushi go,skull,mafia/werewolf,gaple,cheat/bullshit,president,durak,baccarat`],
];
const TIERS = [{k: 'miss', p: 0, c: '#6b7280', e: '⬛'}, {k: 'sure', p: 10, c: '#9aa4b2', e: '⬜'}, {k: 'even', p: 30, c: '#22c995', e: '🟩'}, {k: 'dark', p: 60, c: '#3b82f6', e: '🟦'}, {k: 'long', p: 85, c: '#a855f7', e: '🟪'}, {k: 'jack', p: 100, c: '#ffc83d', e: '🟨'}];
const ROUNDS = 7, ANSWER_MS = 25000;

const D = {
  en:{title:'Long Shot',tag:'Name it. The rarer, the richer.',how:'Name something in the category. Common answers pay a little. Rare (but right) answers pay big. Answer in English.',daily:"Today's 7",dailyS:'Same 7 for everyone today',dailyDone:'Played today · {p} pts',free:'Free play',freeS:'7 random categories',host:'Play online with friends',hostS:'Same answer as a friend? You split the payout.',joinB:'Join',codePh:'Game code, like k-4k2m',openG:'Open games',noneG:'No open games right now',offline:'Online games are not available right now.',round:'{r} / {n}',ph:'Type your answer',go:'Bet it',skip:'Pass',timeUp:"Time's up!",sure:'Sure Bet',even:'Even Money',dark:'Dark Horse',long:'Long Shot',jack:'Jackpot',miss:'No dice',missS:'Not on our list',pays:'pays {p}',common:'Most people say',rare:'Long shots',next:'Next',results:'Final payout',total:'{p} pts',share:'Copy result',copied:'Copied!',again:'Play again',back:'Back',home:'Back to home',english:'Answers in English',players:'Players',start:'Start · {k} players',waitHost:'Waiting for {n} to start…',answered:'{k}/{n} answered',youAns:'Your answer',split:'Same as a friend: half pay',only:'Only you!',lead:'Leaderboard',closed:'The host ended the game.',invite:'Invite',tableOf:"{n}'s game",playersN:'{k} players',live:'playing',waiting:'waiting',leave:'Leave',best:'Best answer',stats:'Your best: {p} pts'},
  ko:{title:'롱샷',tag:'이름을 대라. 희귀할수록 대박.',how:'주제에 맞는 것을 대세요. 흔한 답은 조금, 희귀하지만 맞는 답은 크게 받아요. 영어로 답하세요.',daily:'오늘의 7문제',dailyS:'오늘은 모두 같은 7문제',dailyDone:'오늘 완료 · {p}점',free:'자유 플레이',freeS:'랜덤 주제 7개',host:'친구들과 온라인으로',hostS:'친구와 같은 답이면 반만 받아요.',joinB:'참가',codePh:'게임 코드 (예: k-4k2m)',openG:'열린 게임',noneG:'지금 열린 게임이 없어요',offline:'지금은 온라인 게임을 쓸 수 없어요.',round:'{r} / {n}',ph:'답을 입력하세요 (영어)',go:'베팅',skip:'패스',timeUp:'시간 끝!',sure:'안전빵',even:'반반',dark:'다크호스',long:'롱샷',jack:'잭팟',miss:'꽝',missS:'목록에 없는 답이에요',pays:'{p}점',common:'다들 이렇게 답해요',rare:'롱샷 답',next:'다음',results:'최종 배당',total:'{p}점',share:'결과 복사',copied:'복사됨!',again:'다시 하기',back:'뒤로',home:'홈으로',english:'영어로 답해요',players:'플레이어',start:'시작 · {k}명',waitHost:'{n} 님이 시작하길 기다리는 중…',answered:'{k}/{n}명 답함',youAns:'내 답',split:'친구와 같은 답: 반만 받아요',only:'나만 이 답!',lead:'순위',closed:'방장이 게임을 끝냈어요.',invite:'초대',tableOf:'{n} 님의 게임',playersN:'{k}명',live:'게임 중',waiting:'대기 중',leave:'나가기',best:'최고의 답',stats:'최고 기록: {p}점'},
  zh:{title:'冷门王',tag:'说出来，越冷门赚越多。',how:'说出这个类别里的东西。常见答案分少，冷门又正确的答案分多。请用英文回答。',daily:'今日7题',dailyS:'今天大家都是同样的7题',dailyDone:'今天已玩 · {p} 分',free:'自由模式',freeS:'随机7个类别',host:'和朋友在线玩',hostS:'和朋友答案一样？分数减半。',joinB:'加入',codePh:'游戏代码，例如 k-4k2m',openG:'开放的游戏',noneG:'现在没有开放的游戏',offline:'现在无法使用在线游戏。',round:'{r} / {n}',ph:'输入答案（英文）',go:'下注',skip:'跳过',timeUp:'时间到！',sure:'稳赢',even:'五五开',dark:'黑马',long:'冷门',jack:'大奖',miss:'没中',missS:'不在我们的列表里',pays:'得 {p} 分',common:'大多数人会说',rare:'冷门答案',next:'下一题',results:'最终奖金',total:'{p} 分',share:'复制结果',copied:'已复制！',again:'再玩一次',back:'返回',home:'回到首页',english:'用英文回答',players:'玩家',start:'开始 · {k} 位玩家',waitHost:'等待 {n} 开始…',answered:'{k}/{n} 已回答',youAns:'你的答案',split:'和朋友一样：分数减半',only:'只有你想到！',lead:'排行榜',closed:'房主结束了游戏。',invite:'邀请',tableOf:'{n} 的游戏',playersN:'{k} 位玩家',live:'游戏中',waiting:'等待中',leave:'离开',best:'最佳答案',stats:'你的最佳：{p} 分'},
  id:{title:'Long Shot',tag:'Sebutkan. Makin langka, makin kaya.',how:'Sebutkan sesuatu sesuai kategori. Jawaban umum dapat sedikit. Jawaban langka (tapi benar) dapat banyak. Jawab dalam bahasa Inggris.',daily:'7 Hari Ini',dailyS:'Semua orang dapat 7 soal yang sama hari ini',dailyDone:'Sudah main hari ini · {p} poin',free:'Main bebas',freeS:'7 kategori acak',host:'Main online dengan teman',hostS:'Jawaban sama dengan teman? Poin dibagi dua.',joinB:'Gabung',codePh:'Kode permainan, misal k-4k2m',openG:'Permainan terbuka',noneG:'Belum ada permainan terbuka',offline:'Permainan online sedang tidak tersedia.',round:'{r} / {n}',ph:'Ketik jawaban (bahasa Inggris)',go:'Pasang',skip:'Lewati',timeUp:'Waktu habis!',sure:'Pasti Menang',even:'Seri',dark:'Kuda Hitam',long:'Long Shot',jack:'Jackpot',miss:'Zonk',missS:'Tidak ada di daftar kami',pays:'dapat {p}',common:'Kebanyakan orang bilang',rare:'Jawaban langka',next:'Lanjut',results:'Hadiah akhir',total:'{p} poin',share:'Salin hasil',copied:'Tersalin!',again:'Main lagi',back:'Kembali',home:'Kembali ke beranda',english:'Jawab dalam bahasa Inggris',players:'Pemain',start:'Mulai · {k} pemain',waitHost:'Menunggu {n} memulai…',answered:'{k}/{n} sudah menjawab',youAns:'Jawabanmu',split:'Sama dengan teman: setengah poin',only:'Cuma kamu!',lead:'Papan skor',closed:'Host mengakhiri permainan.',invite:'Undang',tableOf:'Permainan {n}',playersN:'{k} pemain',live:'bermain',waiting:'menunggu',leave:'Keluar',best:'Jawaban terbaik',stats:'Terbaikmu: {p} poin'},
};
const L = () => (window.JJ_I18N && JJ_I18N.lang) || 'en';
const t = (k, v) => { let x = (D[L()] || D.en)[k] || D.en[k] || k; if (v) for (const y in v) x = x.split('{' + y + '}').join(v[y]); return x; };
const qText = i => QS[i][({en: 0, ko: 1, zh: 2, id: 3})[L()] || 0];

/* ---------- answer matching ---------- */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^(the|a|an) /, '');
const sing = s => s.length > 4 && s.endsWith('ies') ? s.slice(0, -3) + 'y' : s.length > 4 && /(ch|sh|x|s)es$/.test(s) ? s.slice(0, -2) : s.length > 3 && s.endsWith('s') && !s.endsWith('ss') ? s.slice(0, -1) : s;
const key = s => sing(norm(s)).replace(/ /g, '');
const BANK = QS.map(q => {
  const m = new Map(), list = [];
  for (let tier = 1; tier <= 5; tier++) q[3 + tier].split(',').forEach(entry => {
    const names = entry.split('/').map(x => x.trim()).filter(Boolean); if (!names.length) return;
    const item = {tier, name: names[0]}; list.push(item);
    names.forEach(n => { const k = key(n); if (k && !m.has(k)) m.set(k, item); });
  });
  return {m, list};
});
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; let best = i; for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); best = Math.min(best, cur[j]); } if (best > max) return max + 1; prev = cur; }
  return prev[b.length];
}
function judge(qi, raw) {
  const k = key(raw); if (!k) return {tier: 0, name: ''};
  const B = BANK[qi]; if (B.m.has(k)) return B.m.get(k);
  const max = k.length >= 8 ? 2 : k.length >= 5 ? 1 : 0; if (!max) return {tier: 0, name: ''};
  let best = null, bd = max + 1; for (const [kk, item] of B.m) { const d = lev(k, kk, max); if (d < bd) { bd = d; best = item; } }
  return best && bd <= max ? best : {tier: 0, name: ''};
}

/* ---------- seeded picks ---------- */
const dayNo = () => { const d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 10, 1)) / 864e5) + 1; };
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function pick(seed) { const r = rng(seed), idx = QS.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, ROUNDS); }

/* ---------- state ---------- */
const S = {mode: 'idle', qs: [], r: 0, ans: [], phase: 'lobby', deadline: 0, timer: 0, day: 0,
  // online
  code: '', players: [], seq: 0, closed: false, hostGone: false, view: null};
let troom = null, hostPeer = null, recvAt = 0;
const CODE_RE = /^k-[a-z0-9]{4,8}$/;
const net = () => J.net && J.net.state() === 'ok' ? J.net.room() : null;
const myName = () => J.nick() || 'You';

/* ---------- solo ---------- */
function startSolo(daily) {
  S.mode = daily ? 'daily' : 'free'; S.day = dayNo(); S.qs = daily ? pick(S.day * 7919 + 13) : pick(Math.floor(Math.random() * 1e9)); S.r = 0; S.ans = []; S.closed = false;
  hideLobby(); ask();
}
function ask() {
  S.phase = 'q'; S.deadline = Date.now() + ANSWER_MS; renderQ(); clearInterval(S.timer); S.timer = setInterval(tick, 200);
  const inp = $('lsIn'); inp.value = ''; setTimeout(() => { if (S.phase === 'q') inp.focus(); }, 350); SFX.whoosh();
}
function tick() {
  if (S.phase !== 'q' && S.phase !== 'sent') { clearInterval(S.timer); return; }
  const left = S.deadline - Date.now(), f = Math.max(0, left / ANSWER_MS);
  $('lsBar').style.transform = `scaleX(${f})`; $('lsBar').classList.toggle('low', f < .25); $('lsSec').textContent = Math.max(0, Math.ceil(left / 1000));
  if (left <= 5000 && left > 0 && Math.ceil(left / 1000) !== S.lastBeep) { S.lastBeep = Math.ceil(left / 1000); J.tone && J.tone(880, .05, 'square', .025); }
  if (left <= 0) { if (S.mode === 'client') { clearInterval(S.timer); if (S.phase === 'q') renderQ(); return; } if (S.phase === 'q') submit(true); else if (S.mode !== 'host') clearInterval(S.timer); }
}
function submit(timeout) {
  if (S.phase !== 'q') return; const raw = timeout ? ($('lsIn').value.trim() || '') : $('lsIn').value.trim();
  if (!raw && !timeout) { $('lsIn').focus(); return; }
  if (S.mode === 'client') { if (!raw) return; troom && troom.emit('act', {t: 'ans', r: S.r, a: raw.slice(0, 40), seq: S.seq}).catch(() => {}); S.myAns = raw; S.phase = 'sent'; renderQ(); SFX.pop(); return; }
  if (S.mode === 'host') { hostAnswer(J.net.peer() || 'me', raw); S.myAns = raw; S.phase = 'sent'; renderQ(); return; }
  clearInterval(S.timer);
  const qi = S.qs[S.r], j = judge(qi, raw); S.ans.push({raw, tier: j.tier, name: j.name, pts: TIERS[j.tier].p});
  S.phase = 'rev'; reveal(S.ans[S.r]); fx(j.tier);
}
function fx(tier) {
  if (tier >= 5) { SFX.jackpot ? SFX.jackpot() : SFX.win(); J.confetti(); J.buzz && J.buzz([40, 30, 80]); }
  else if (tier >= 3) { SFX.chime(); J.buzz && J.buzz(30); }
  else if (tier >= 1) SFX.match(); else { SFX.bad(); J.buzz && J.buzz([50, 40, 50]); }
}
function nextQ() {
  if (S.mode === 'client') return;
  if (S.mode === 'host') { hostNext(); return; }
  S.r++; if (S.r >= ROUNDS) finish(); else ask();
}
function finish() {
  S.phase = 'end'; clearInterval(S.timer);
  const total = S.ans.reduce((a, x) => a + x.pts, 0);
  if (S.mode === 'daily') J.store.set('jj-ls-day', JSON.stringify({day: S.day, total, e: S.ans.map(a => TIERS[a.tier].e).join('')}));
  const best = Number(J.store.get('jj-ls-best') || 0); if (total > best) J.store.set('jj-ls-best', String(total));
  J.addCoins && J.addCoins(total); J.addXP && J.addXP(Math.round(total / 10)); if (S.ans.some(a => a.tier === 5)) J.unlock && J.unlock('ls_jack');
  renderEnd(total); SFX.win(); if (total >= 400) J.confetti();
}

/* ---------- render ---------- */
function showView(v) { ['lsQ', 'lsRev', 'lsEnd'].forEach(id => $(id).hidden = id !== v); }
function renderQ() {
  showView('lsQ'); const qi = S.qs[S.r];
  $('lsRound').textContent = t('round', {r: S.r + 1, n: ROUNDS}); $('lsScore').textContent = num(score());
  $('lsQt').textContent = qText(qi); $('lsHint').textContent = L() === 'en' ? t('how').split('. ').slice(0, 2).join('. ') + '.' : t('english');
  $('lsIn').placeholder = t('ph'); $('lsGo').textContent = t('go');
  const sent = S.phase === 'sent' || (S.mode === 'client' && S.phase === 'q' && S.deadline < Date.now());
  $('lsIn').disabled = sent; $('lsGo').disabled = sent;
  $('lsSent').hidden = !sent; $('lsSent').textContent = sent ? `${t('youAns')}: ${S.myAns || '—'}` : '';
  renderOnlineBits();
}
const score = () => S.mode === 'host' || S.mode === 'client' ? ((S.view && S.view.pl || []).find(p => p.me) || {s: 0}).s : S.ans.reduce((a, x) => a + x.pts, 0);
function examples(qi) {
  const l = BANK[qi].list; const by = tr => l.filter(x => x.tier === tr).map(x => x.name);
  const common = by(1).slice(0, 4), rare = J.shuffle(by(5).slice()).slice(0, 3);
  return {common, rare};
}
function tierChip(tr, extra) { const T = TIERS[tr]; return `<span class="ls-tier t-${T.k}" style="--tc:${T.c}">${esc(t(T.k))}${extra || ''}</span>`; }
function reveal(a) {
  showView('lsRev'); const qi = S.qs[S.r], ex = examples(qi);
  $('lsRound').textContent = t('round', {r: S.r + 1, n: ROUNDS}); $('lsScore').textContent = num(score());
  $('lsRq').textContent = qText(qi);
  $('lsMine').innerHTML = `<div class="ls-ans"><b>${esc(a.raw || '—')}</b>${a.tier && a.name && key(a.name) !== key(a.raw) ? `<small>= ${esc(a.name)}</small>` : ''}</div>${tierChip(a.tier)}<div class="ls-pay">${a.tier ? '+' + a.pts : '0'}</div>${a.tier ? '' : `<p class="ls-miss">${esc(a.raw ? t('missS') : t('timeUp'))}</p>`}`;
  $('lsMine').className = 'ls-mine tier-' + TIERS[a.tier].k;
  $('lsEx').innerHTML = `<div><h4>${t('common')}</h4><p>${ex.common.map(esc).join(' · ')}</p></div><div><h4>${t('rare')}</h4><p>${ex.rare.map(esc).join(' · ')}</p></div>`;
  $('lsOthers').innerHTML = ''; $('lsNext').hidden = false; $('lsNext').textContent = S.r >= ROUNDS - 1 ? t('results') : t('next') + ' →';
}
function renderEnd(total) {
  showView('lsEnd'); $('lsTotal').classList.remove('sm');
  $('lsEndT').textContent = t('results'); $('lsTotal').textContent = t('total', {p: num(total)});
  $('lsEndList').innerHTML = S.ans.map((a, i) => `<li><span class="ls-q">${esc(qText(S.qs[i]))}</span><b>${esc(a.raw || '—')}</b>${tierChip(a.tier)}<i>${a.pts}</i></li>`).join('');
  $('lsEmoji').textContent = S.ans.map(a => TIERS[a.tier].e).join('');
  $('lsShare').textContent = t('share'); $('lsAgain').textContent = t('again'); $('lsHome').textContent = t('home');
  $('lsBoard').innerHTML = ''; $('lsShare').hidden = false; $('lsAgain').hidden = S.mode === 'client';
}
$('lsGo').onclick = () => submit(false);
$('lsIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(false); } });
$('lsNext').onclick = () => nextQ();
$('lsShare').onclick = async e => {
  const total = S.mode === 'host' || S.mode === 'client' ? score() : S.ans.reduce((a, x) => a + x.pts, 0);
  const txt = `JJ POKER · ${t('title')}${S.mode === 'daily' ? ' #' + S.day : ''}\n${$('lsEmoji').textContent}\n${total} / ${ROUNDS * 100}`;
  const b = e.currentTarget, old = b.textContent; try { await navigator.clipboard.writeText(txt); } catch (x) {} b.textContent = t('copied'); setTimeout(() => b.textContent = old, 1400);
};
$('lsAgain').onclick = () => { if (S.mode === 'host') { hostStart(); return; } showLobby(); };
$('lsHome').onclick = () => { leaveOnline(); showLobby(); };

/* ---------- online: host ---------- */
function hostPlayers() { return S.players; }
async function hostGame() {
  const room = net(); if (!room) { lobbyMsg(t('offline')); return; }
  const code = 'k-' + (Math.random().toString(36).slice(2) + '0000').slice(0, 4);
  try { troom = await room.join(code); } catch (e) { lobbyMsg(t('offline')); return; }
  S.mode = 'host'; S.code = code; S.players = [{peer: J.net.peer() || 'me', name: myName(), av: J.myAvSeed, s: 0, gone: false, me: true}]; S.phase = 'lobby'; S.r = 0; S.closed = false; S.round = null;
  troom.on('sit', hostSit); troom.on('act', hostAct); troom.onPeers(hostPeers);
  hideLobby(); advertise(); hostBroadcast(); renderOnline();
}
function advertise() { const room = net(); if (!room) return; room.presence({lsHost: S.mode === 'host' && !S.closed ? {code: S.code, host: myName(), av: String(J.myAvSeed).slice(0, 24), n: S.players.filter(p => !p.gone).length, live: S.phase !== 'lobby' ? 1 : 0} : null}).catch(() => {}); }
function hostSit(msg) {
  if (S.mode !== 'host' || !msg || msg.sameTab) return; const d = msg.data || {};
  const name = J.cleanName(d.nm) || 'Player', av = String(d.av || name).slice(0, 24);
  let p = S.players.find(x => x.peer === msg.peer) || S.players.find(x => x.gone && x.name === name);
  if (p) { p.peer = msg.peer; p.gone = false; p.name = name; p.av = av; }
  else if (S.players.length < 12) { S.players.push({peer: msg.peer, name, av, s: 0, gone: false}); SFX.chime(); }
  hostBroadcast(); advertise(); renderOnline();
}
function hostPeers(ch) { let any = false; ch.left.forEach(lp => S.players.forEach(p => { if (!p.me && p.peer === lp.peer && !p.gone) { p.gone = true; any = true; } })); if (any) { hostBroadcast(); renderOnline(); checkAll(); } else if (ch.joined.length) hostBroadcast(); }
function hostStart() {
  S.qs = pick(Math.floor(Math.random() * 1e9)); S.r = -1; S.players.forEach(p => { p.s = 0; }); S.hist = []; hostNext();
}
function hostNext() {
  S.r++; if (S.r >= ROUNDS) { S.phase = 'end'; clearInterval(S.timer); clearInterval(S.hostT); hostBroadcast(); renderOnline(); advertise(); const me = S.players[0]; if (me) { J.addCoins && J.addCoins(me.s); J.addXP && J.addXP(Math.round(me.s / 10)); } SFX.win(); return; }
  S.round = {qi: S.qs[S.r], ans: {}}; S.phase = 'q'; S.deadline = Date.now() + ANSWER_MS; S.myAns = ''; S.lastBeep = 0;
  clearInterval(S.timer); S.timer = setInterval(tick, 200);
  clearInterval(S.hostT); S.hostT = setInterval(() => { if (S.mode !== 'host' || S.phase === 'rev' || S.phase === 'end') { clearInterval(S.hostT); return; } if (Date.now() > S.deadline + 800) hostReveal(); }, 250);
  hostBroadcast(); renderOnline(); advertise(); SFX.whoosh(); setTimeout(() => { if (S.phase === 'q') $('lsIn').focus(); }, 350); $('lsIn').value = '';
}
function hostAnswer(peer, raw) { if (!S.round || (S.phase !== 'q' && S.phase !== 'sent')) return; if (S.round.ans[peer] != null) return; S.round.ans[peer] = String(raw || '').slice(0, 40); hostBroadcast(); renderOnline(); checkAll(); }
function hostAct(msg) {
  if (S.mode !== 'host' || !msg || !msg.data) return; const d = msg.data;
  if (d.t === 'ans' && d.r === S.r && S.round && Date.now() < S.deadline + 1500) { const p = S.players.find(x => x.peer === msg.peer); if (p) hostAnswer(msg.peer, d.a); }
}
function checkAll() { if (S.mode !== 'host' || !S.round || S.phase === 'rev') return; const live = S.players.filter(p => !p.gone); if (live.every(p => S.round.ans[p.peer] != null)) setTimeout(hostReveal, 500); }
function hostReveal() {
  if (S.phase === 'rev' || !S.round) return; S.phase = 'rev'; clearInterval(S.timer); clearInterval(S.hostT);
  const qi = S.round.qi, res = {};
  const j = {}; S.players.forEach(p => { const a = S.round.ans[p.peer] || ''; j[p.peer] = a ? judge(qi, a) : {tier: 0, name: ''}; });
  S.players.forEach(p => {
    const me = j[p.peer], a = S.round.ans[p.peer] || ''; let pts = TIERS[me.tier].p, tag = '';
    if (me.tier) { const same = S.players.filter(o => o !== p && j[o.peer].tier && j[o.peer].name === me.name).length; if (same) { pts = Math.round(pts / 2); tag = 'split'; } else if (S.players.length > 1) { pts += 10; tag = 'only'; } }
    p.s += pts; res[p.peer] = {a, tier: me.tier, name: me.name, pts, tag};
  });
  S.round.res = res; hostBroadcast(); renderOnline(); const mine = res[S.players[0].peer]; if (mine) fx(mine.tier);
}
function hostView() {
  return {v: 1, g: 'ls', code: S.code, seq: ++S.seq, ph: S.phase === 'sent' ? 'q' : S.phase, r: S.r, qi: S.round ? S.round.qi : -1, dl: S.phase === 'q' || S.phase === 'sent' ? Math.max(0, S.deadline - Date.now()) : 0,
    pl: S.players.map(p => ({pe: p.peer, n: p.name, av: p.av, s: p.s, g: p.gone ? 1 : 0, an: S.round && S.round.ans[p.peer] != null ? 1 : 0})),
    res: S.phase === 'rev' && S.round && S.round.res ? S.round.res : 0};
}
let bcT = 0;
function hostBroadcast() { if (S.mode !== 'host' || !troom) return; const V = hostView(); S.view = decorate(V); troom.emit('state', V).catch(() => {}); }
setInterval(() => { if (S.mode === 'host' && troom) hostBroadcast(); }, 3000);
function decorate(V) { const me = J.net && J.net.peer() || 'me'; V.pl.forEach(p => { p.me = p.pe === me || (S.mode === 'host' && p.pe === (S.players[0] && S.players[0].peer)); }); return V; }

/* ---------- online: guest ---------- */
async function joinGame(code, hint) {
  code = String(code || '').trim().toLowerCase(); if (!CODE_RE.test(code)) { lobbyMsg('k-4k2m?'); return; }
  const room = net(); if (!room) { lobbyMsg(t('offline')); return; }
  try { troom = await room.join(code); } catch (e) { lobbyMsg(t('offline')); return; }
  S.mode = 'client'; S.code = code; hostPeer = hint || null; S.closed = false; S.hostGone = false; S.view = null; S.phase = 'lobby'; S.lastR = -2; recvAt = Date.now();
  troom.on('state', onState); troom.onPeers(ch => { if (hostPeer && ch.left.some(p => p.peer === hostPeer)) { S.hostGone = true; renderOnline(); } });
  J.store.set('jj-lsjoin', JSON.stringify({code, at: Date.now()}));
  hideLobby(); renderOnline(); sit();
}
function sit() { if (S.mode === 'client' && troom) troom.emit('sit', {nm: myName(), av: J.myAvSeed}).catch(() => {}); }
function onState(msg) {
  if (S.mode !== 'client' || !msg || !msg.data) return; const V = msg.data;
  if (V.g !== 'ls' || V.code !== S.code || !Array.isArray(V.pl)) return;
  if (hostPeer && msg.peer !== hostPeer && !S.hostGone) return; hostPeer = msg.peer; S.hostGone = false;
  if (V.closed) { S.closed = true; J.store.del('jj-lsjoin'); renderOnline(); return; }
  if (S.view && V.seq < S.view.seq) return;
  recvAt = Date.now(); S.view = decorate(V);
  if (!S.view.pl.some(p => p.me)) sit();
  const newRound = V.r !== S.lastR && V.ph === 'q';
  if (newRound) { S.lastR = V.r; S.myAns = ''; S.phase = 'q'; $('lsIn').value = ''; S.lastBeep = 0; SFX.whoosh(); setTimeout(() => { if (S.phase === 'q') $('lsIn').focus(); }, 350); }
  S.r = V.r; S.qs[V.r] = V.qi;
  if (V.ph === 'q') { S.deadline = Date.now() + V.dl; if (S.phase !== 'sent') S.phase = 'q'; clearInterval(S.timer); S.timer = setInterval(tick, 200); }
  else if (V.ph === 'rev' && S.phase !== 'rev') { S.phase = 'rev'; clearInterval(S.timer); const mine = V.res && V.res[J.net.peer()]; if (mine) fx(mine.tier); }
  else if (V.ph === 'end' && S.phase !== 'end') { S.phase = 'end'; const me = S.view.pl.find(p => p.me); if (me) { J.addCoins && J.addCoins(me.s); J.addXP && J.addXP(Math.round(me.s / 10)); } SFX.win(); }
  else if (V.ph === 'lobby') S.phase = 'lobby';
  renderOnline();
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible' || S.mode !== 'client') return; if (S.hostGone || Date.now() - recvAt > 10000) rejoin(); else sit(); });
setInterval(() => { if (S.mode === 'client' && !S.closed && document.visibilityState === 'visible' && Date.now() - recvAt > 12000) rejoin(); }, 6000);
let rj = false;
async function rejoin() { if (rj) return; rj = true; const c = S.code; const r = troom; troom = null; if (r) r.leave().catch(() => {}); try { await joinGame(c, null); } finally { rj = false; } }
function leaveOnline() {
  clearInterval(S.timer); clearInterval(S.hostT); S.wonShown = false;
  if (S.mode === 'host' && troom) { const V = hostView(); V.closed = 1; troom.emit('state', V).catch(() => {}); const room = net(); if (room) room.presence({lsHost: null}).catch(() => {}); }
  if (S.mode === 'client') J.store.del('jj-lsjoin');
  const r = troom; troom = null; if (r) r.leave().catch(() => {});
  S.mode = 'idle'; S.phase = 'lobby'; S.view = null; S.closed = false;
}

/* ---------- online render ---------- */
function renderOnlineBits() {
  const on = S.mode === 'host' || S.mode === 'client', V = S.view;
  $('lsPlayers').hidden = !on || !V;
  if (!on || !V) return;
  $('lsPlayers').innerHTML = V.pl.map(p => `<span class="ls-pl${p.me ? ' me' : ''}${p.g ? ' gone' : ''}${p.an && V.ph === 'q' ? ' done' : ''}"><span class="av">${J.avatarSVG(String(p.av || '') + '|' + p.n, false)}</span><b>${esc(p.n)}</b><i>${num(p.s)}</i></span>`).join('');
}
function renderOnline() {
  if (J.current !== 'ls') return;
  const V = S.view || (S.mode === 'host' ? decorate(hostView()) : null);
  $('lsInvite').hidden = !(S.mode === 'host' || S.mode === 'client');
  if (S.closed) { showView('lsEnd'); $('lsEndT').textContent = t('closed'); $('lsTotal').textContent = ''; $('lsEndList').innerHTML = ''; $('lsEmoji').textContent = ''; $('lsBoard').innerHTML = ''; $('lsShare').hidden = true; $('lsAgain').hidden = true; $('lsHome').textContent = t('back'); return; }
  if (!V) { showView('lsQ'); $('lsQt').textContent = '…'; return; }
  S.view = V;
  $('lsTotal').classList.toggle('sm', V.ph === 'lobby');
  if (V.ph === 'lobby') {
    showView('lsEnd'); $('lsRound').textContent = '— / ' + ROUNDS; $('lsScore').textContent = '0'; $('lsEndT').textContent = S.code; $('lsTotal').textContent = S.mode === 'host' ? t('hostS') : t('waitHost', {n: (V.pl[0] || {}).n || ''});
    $('lsEndList').innerHTML = ''; $('lsEmoji').textContent = ''; $('lsShare').hidden = true;
    $('lsBoard').innerHTML = V.pl.map(p => `<li class="${p.g ? 'gone' : ''}"><span class="av">${J.avatarSVG(String(p.av || '') + '|' + p.n, false)}</span><b>${esc(p.n)}</b></li>`).join('');
    $('lsAgain').hidden = S.mode !== 'host'; $('lsAgain').textContent = t('start', {k: V.pl.filter(p => !p.g).length}); $('lsHome').textContent = t('leave');
    return;
  }
  if (V.ph === 'q') { renderQ(); $('lsAnswered').hidden = false; $('lsAnswered').textContent = t('answered', {k: V.pl.filter(p => p.an).length, n: V.pl.filter(p => !p.g).length}); return; }
  $('lsAnswered').hidden = true;
  if (V.ph === 'rev') {
    const me = V.res && Object.entries(V.res).find(([pe]) => (V.pl.find(p => p.pe === pe) || {}).me);
    const a = me ? me[1] : {a: '', tier: 0, pts: 0};
    reveal({raw: a.a, tier: a.tier, name: a.name, pts: a.pts});
    $('lsMine').insertAdjacentHTML('beforeend', a.tag ? `<p class="ls-tag ${a.tag}">${esc(t(a.tag))}</p>` : '');
    $('lsOthers').innerHTML = V.pl.filter(p => !p.me).map(p => { const r = V.res[p.pe] || {a: '', tier: 0, pts: 0}; return `<li><span class="av">${J.avatarSVG(String(p.av || '') + '|' + p.n, false)}</span><b>${esc(p.n)}</b><span class="ls-oa">${esc(r.a || '—')}</span>${tierChip(r.tier)}<i>+${r.pts}</i></li>`; }).join('');
    $('lsNext').hidden = S.mode !== 'host';
    renderOnlineBits(); $('lsPlayers').hidden = false;
    return;
  }
  if (V.ph === 'end') {
    showView('lsEnd'); const sorted = V.pl.slice().sort((a, b) => b.s - a.s);
    $('lsEndT').textContent = t('lead'); const me = V.pl.find(p => p.me); $('lsTotal').textContent = me ? t('total', {p: num(me.s)}) : '';
    $('lsEndList').innerHTML = ''; $('lsEmoji').textContent = '';
    $('lsBoard').innerHTML = sorted.map((p, i) => `<li class="${p.me ? 'me' : ''}"><span class="rk">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="av">${J.avatarSVG(String(p.av || '') + '|' + p.n, false)}</span><b>${esc(p.n)}</b><i>${num(p.s)}</i></li>`).join('');
    $('lsShare').hidden = true; $('lsAgain').hidden = S.mode !== 'host'; $('lsAgain').textContent = t('again'); $('lsHome').textContent = t('leave');
    if (sorted[0] && sorted[0].me && !S.wonShown) { S.wonShown = true; J.confetti(); }
  }
}

/* ---------- lobby ---------- */
function savedJoin() { try { const s = JSON.parse(J.store.get('jj-lsjoin') || 'null'); if (s && CODE_RE.test(s.code) && Date.now() - s.at < 3 * 3600e3) return s; } catch (e) {} return null; }
function showLobby() { $('lsLobby').hidden = false; renderLobby(); }
function hideLobby() { $('lsLobby').hidden = true; }
function lobbyMsg(x) { $('lsLobMsg').textContent = x || ''; }
function renderLobby() {
  if ($('lsLobby').hidden) return;
  const room = net(), today = (() => { try { const s = JSON.parse(J.store.get('jj-ls-day') || 'null'); return s && s.day === dayNo() ? s : null; } catch (e) { return null; } })();
  $('lsTag').textContent = t('tag'); $('lsHow').textContent = t('how');
  $('lsDaily').innerHTML = `<b>📅 ${esc(t('daily'))} #${dayNo()}</b><small>${esc(today ? t('dailyDone', {p: today.total}) + ' ' + today.e : t('dailyS'))}</small>`; $('lsDaily').disabled = !!today;
  $('lsFree').innerHTML = `<b>🎲 ${esc(t('free'))}</b><small>${esc(t('freeS'))}</small>`;
  $('lsHostB').innerHTML = `<b>🌐 ${esc(t('host'))}</b><small>${esc(t('hostS'))}</small>`; $('lsHostB').disabled = !room;
  $('lsJoinIn').placeholder = t('codePh'); $('lsJoinB').textContent = t('joinB'); $('lsJoinB').disabled = !room; $('lsOpenH').textContent = t('openG');
  const best = Number(J.store.get('jj-ls-best') || 0); $('lsBest').textContent = best ? t('stats', {p: best}) : '';
  const sj = savedJoin(); $('lsRejoin').hidden = !(sj && room); if (sj) $('lsRejoin').textContent = '↩ ' + sj.code;
  const ul = $('lsOpen'); ul.innerHTML = ''; const seen = new Set();
  (room ? room.peers() : []).forEach(p => { const h = p.presence && p.presence.lsHost; if (p.sameTab || !h || !CODE_RE.test(String(h.code)) || seen.has(h.code)) return; seen.add(h.code);
    const li = document.createElement('li'); li.innerHTML = `<span class="av">${J.avatarSVG(String(h.av || '').slice(0, 24) + '|' + (J.cleanName(h.host) || ''), false)}</span><div class="r-info"><b>${esc(t('tableOf', {n: J.cleanName(h.host) || '?'}))}</b><span>${esc(h.code)} · ${t('playersN', {k: h.n | 0})} · ${h.live ? t('live') : t('waiting')}</span></div><button class="btn btn-call" type="button" data-jc="${esc(h.code)}" data-jp="${esc(p.peer)}">${t('joinB')}</button>`; ul.appendChild(li); });
  if (!ul.children.length) ul.innerHTML = `<li class="none">${esc(room ? t('noneG') : t('offline'))}</li>`;
}
$('lsDaily').onclick = () => { leaveOnline(); startSolo(true); };
$('lsFree').onclick = () => { leaveOnline(); startSolo(false); };
$('lsHostB').onclick = () => { leaveOnline(); hostGame(); };
$('lsJoinB').onclick = () => { leaveOnline(); joinGame($('lsJoinIn').value); };
$('lsJoinIn').addEventListener('keydown', e => { if (e.key === 'Enter') $('lsJoinB').click(); });
$('lsRejoin').onclick = () => { const s = savedJoin(); if (s) { leaveOnline(); joinGame(s.code); } };
$('lsOpen').addEventListener('click', e => { const b = e.target.closest('[data-jc]'); if (b) { leaveOnline(); joinGame(b.dataset.jc, b.dataset.jp); } });
$('lsInvite').onclick = () => { if (S.code && J.invite) J.invite(S.code, 'longshot'); };
J.net && J.net.onChange(() => { if (J.current === 'ls') renderLobby(); });

function open() { J.show('ls'); if (S.mode === 'idle' || (S.phase === 'end' && S.mode !== 'host' && S.mode !== 'client')) showLobby(); else if (S.mode === 'host' || S.mode === 'client') renderOnline(); }
J.registerScreen('ls', {hide() {}});
(window.JJ_SCREENS = window.JJ_SCREENS || {}).ls = {leave() { leaveOnline(); clearInterval(S.timer); S.mode = 'idle'; J.show('home'); }};
$('lsBtn').onclick = open;
J.lsJoin = code => { J.show('ls'); leaveOnline(); joinGame(code); };
J.onSettings(() => { if (J.current !== 'ls') return; renderLobby(); if (S.mode === 'host' || S.mode === 'client') renderOnline(); else if (S.phase === 'q') renderQ(); else if (S.phase === 'rev') reveal(S.ans[S.r]); else if (S.phase === 'end') renderEnd(S.ans.reduce((a, x) => a + x.pts, 0)); });
J._ls = {S, judge, QS, BANK, key, pick, dayNo};
$('gcLS').innerHTML = '<div class="ls-art">' + TIERS.slice(1).map((T, i) => `<span style="--tc:${T.c};--k:${i}">${['10', '30', '60', '85', '100'][i]}</span>`).join('') + '<b>🎯</b></div>';
})();
