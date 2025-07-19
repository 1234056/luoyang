const timedEvents = [
    {
        year: 235, month: 7, triggered: false,
        eventAction: (state, data, isInitialSetup) => {
            if (!isInitialSetup) log("【京城大事】崇华殿夜间失火，火光冲天，殿宇焚毁殆尽！", 'highlight');
            const chonghua = data.maps.harem['崇华殿'];
            if (chonghua) {
                chonghua.name = '崇华殿(已焚毁)';
                chonghua.description = '这里只剩一片焦黑的废墟，空气中还弥漫着烧焦的味道。';
                delete chonghua.actions;
                delete chonghua.construction;
                chonghua.isDestroyed = true;
            }
        }
    },
    {
        year: 235, month: 8, triggered: false,
        eventAction: (state, data, isInitialSetup) => {
            if (!isInitialSetup) log("【京城大事】皇帝下令复建崇华殿，并更其名为“九龙殿”。", 'highlight');
            const chonghuaData = data.maps.harem['崇华殿'];
            if (chonghuaData && chonghuaData.isDestroyed) {
                delete data.maps.harem['崇华殿'];
                data.maps.harem['九龙殿'] = {
                    name: '九龙殿',
                    gridArea: chonghuaData.gridArea,
                    type: 'imperial',
                    construction: { startYear: 235, duration: 1, description: '工人们正在重建被烧毁的殿宇，新殿名为九龙殿。' },
                    description: '原为崇华殿，火灾后复建，更显气派。'
                };
            }
        }
    },
    {
        year: 241, month: 1, triggered: false, // 三体石经事件
        eventAction: (state, data, isInitialSetup) => {
            state.world.stoneClassicsErected = true;
            const taixue = data.maps.south['太学'];
            if (taixue) {
                taixue.description += ' 近来，著名的三体石经被立在了太学门外，引来无数士子观摩。';
            }
            if (!isInitialSetup) {
                log("【京城大事】《尚书》、《春秋》的三体石经已刻成，立于太学门外，成为洛阳一大盛事。", 'highlight');
            }
        }
    },
    {
        year: 265, month: 11, triggered: false,
        eventAction: (state, data, isInitialSetup) => {
            if (!isInitialSetup) log("【天下大势】司马炎篡魏，建国号为“晋”，史称西晋。洛阳依旧为都，但换了人间。", 'highlight');
            
            if (state.player.identity === '宗室') {
                const newIdentity = Math.random() < 0.8 ? '官员' : '平民';
                if (!isInitialSetup) {
                    log(`【身份变更】改朝换代，你失去了宗室的身份，如今你只是一名普通的“${newIdentity}”。`, 'highlight');
                }
                state.player.identity = newIdentity;
            }

            const zhaoyang = data.maps.palace['昭阳殿'];
            if (zhaoyang) {
                delete data.maps.palace['昭阳殿'];
                zhaoyang.name = '明阳殿';
                zhaoyang.description = '位于太极殿正北，原名昭阳殿，为避晋文帝司马昭名讳而改名。';
                data.maps.palace['明阳殿'] = zhaoyang;
                if (!isInitialSetup) log("【京城大事】为避晋文帝（司马昭）名讳，昭阳殿更名为“明阳殿”。", 'highlight');
            }
        }
    },
    {
        year: 249, month: 1, triggered: false, // 高平陵之变
        eventAction: (state, data, isInitialSetup) => {
            if (!isInitialSetup) log("【天下大势】大将军曹爽陪同皇帝谒高平陵，太傅司马懿乘机发动政变，控制京城。洛阳内外，气氛骤然紧张。", 'highlight');
            state.world.isMartialLaw = true;
            if (!isInitialSetup) log("城中已然戒严，各处关防盘查严密了许多。", 'highlight');
        }
    },
    {
        year: 260, month: 5, triggered: false, // 高贵乡公被弑
        eventAction: (state, data, isInitialSetup) => {
            if (!isInitialSetup) log("【天下大势】皇帝曹髦不甘为傀儡，率数百仆从讨伐司马昭，于宫门附近被杀。帝都为之震动！", 'highlight');
            const changhemen = data.maps.palace['阊阖门'];
            if(changhemen) {
                changhemen.isForbidden = true;
                changhemen.description = '此地刚刚发生过惊天血案，已被完全封锁，任何人不得靠近。';
            }
            if (!isInitialSetup) log("阊阖门附近已成禁区，血腥味尚未散去。", 'highlight');
        }
    },
    {
        year: 311, month: 6, triggered: false, // 永嘉之乱
        eventAction: (state, data, isInitialSetup) => {
            if (isInitialSetup) return; // 游戏不会在末日开局
            log("【天下大势】匈奴大军攻破洛阳，纵兵抢掠，焚烧宫室。千年帝都，尽为焦土...", 'highlight');
            log("永嘉五年，匈奴军队攻破洛阳，纵火焚城，史称‘永嘉之乱’。你的旅途，或许将在此终结。", 'highlight');
            endGame(state, 'yongjia');
        }
    },
    {
        year: 263, month: 11, triggered: false, // 灭蜀
        eventAction: (state, data) => {
            log("【天下大势】捷报传来，镇西将军钟会、征西将军邓艾率军破蜀，蜀后主刘禅出降，蜀汉灭亡。", 'highlight');
        }
    },
    {
        year: 280, month: 3, triggered: false, // 灭吴
        eventAction: (state, data) => {
            log("【天下大势】王濬率楼船大军攻克建业，吴主孙皓面缚出降，东吴灭亡。天下自汉末分裂以来，终归一统！", 'highlight');
        }
    },
    {
        year: 301, month: 1, triggered: false, // 八王之乱：司马伦篡位
        eventAction: (state, data) => {
            log("【天下大势】赵王司马伦废黜惠帝，自立为帝。洛阳城内人心惶惶，八王之乱的阴云愈发浓厚。", 'highlight');
        }
    },
    {
        year: 301, month: 4, triggered: false, // 八王之乱：司马伦败亡
        eventAction: (state, data) => {
            log("【天下大势】齐王司马冏、成都王司马颖、河间王司马颙三王起兵讨伐，司马伦兵败被杀，惠帝复位。但乱局远未结束。", 'highlight');
        }
    },
    {
        year: 302, month: 8, triggered: false, // 八王之乱：诸王乱战
        eventAction: (state, data) => {
            log("【天下大势】诸王为争夺权力展开混战，中原烽火连天，百姓流离失所。", 'highlight');
        }
    },
    {
        year: 306, month: 11, triggered: false, // 八王之乱：惠帝驾崩
        eventAction: (state, data) => {
            log("【天下大势】晋惠帝离奇驾崩，据传为东海王司马越所毒杀。皇太子司马炽即位，是为晋怀帝。", 'highlight');
        }
    },

    // --- 京城大事 ---
    {
        year: 226, month: 5, triggered: false, // 曹丕驾崩
        eventAction: (state, data) => {
            log("【京城大事】魏文帝曹丕驾崩于嘉福殿，终年四十。太子曹叡即位，是为魏明帝。", 'highlight');
        }
    },
    {
        year: 239, month: 1, triggered: false, // 曹叡驾崩
        eventAction: (state, data) => {
            log("【京城大事】魏明帝曹叡驾崩于嘉福殿，终年三十六。皇太子曹芳年幼，由大将军曹爽与太尉司马懿共同辅政。", 'highlight');
        }
    },
    {
        year: 290, month: 4, triggered: false, // 司马炎驾崩
        eventAction: (state, data) => {
            log("【京城大事】晋武帝司马炎驾崩，太子司马衷即位，是为晋惠帝。皇后贾南风开始干预朝政，乱象将起。", 'highlight');
        }
    }
];

const events = [
    {
        name: "洛阳纸贵",
        trigger: (state) => state.currentMap === 'luoyang' && state.time.year >= 280 && state.time.year <= 285 && state.player.location === '金市',
        scenes: {
            '平民': { description: "你路过集市，看到平日里无人问津的纸铺被围得水泄不通。一个书生模样的人挤出来，满头大汗地抱怨：“什么世道！连写字的纸都买不起了！都怪那个叫左思的，一篇赋文，让全洛阳的纸都贵了！”", options: [{ text: "凑个热闹", action: (state) => { log("你从人群的议论中得知了《三都赋》的盛况，增长了见闻。"); } }] },
            '商人': { description: "你在巡视自家店铺时，发现城中纸张的价格一日三涨，已然成了紧俏货。一打听，原来是因一部《三都赋》而起。这让你嗅到了巨大的商机。", options: [{ text: "立刻囤积纸张", action: (state) => { if (state.player.money >= 200) { state.player.money -= 200; log("你花费200钱囤积了一批纸张，希望能大赚一笔。"); } else { log("你的钱不够，无法囤积纸张。"); } } }, { text: "静观其变", action: (state) => { log("你决定先观察一下市场，谨慎行事。"); } }] },
            'default': { description: "你听闻近来洛阳城中纸价飞涨，据说是因为一篇名为《三都赋》的文章写得太好，人人争相传抄所致。", options: [{ text: "知道了", action: (state) => {} }] }
        }
    },
    {
        name: "濯龙血出",
        trigger: (state) => state.time.year === 220 && state.player.location === '宫城' && ['平民', '商人'].includes(state.player.identity),
        scenes: {
            'default': { 
                description: "你在宫城外听见几位老人低声议论：‘听说曹公前些日子亲自命人砍了宫前那棵濯龙树，结果不久便一病不起。有人说那树下埋着龙气，动不得……’夜风吹过，宫墙阴影下仿佛多了一丝莫名的寒意。", 
                options: [{ text: "记下此事", action: (state) => {} }]
            }
        }
    },
     {
        name: "西域来朝",
        trigger: (state) => state.time.year === 222 && state.player.location === '铜驼街',
        scenes: {
            'default': { 
                description: "铜驼街上鼓乐喧天，西域使团身着异域服饰缓缓行进。鄯善、龟兹、于阗的使臣带来琉璃宝瓶与驼绒地毯，丝绸之路上驼铃再响。", 
                options: [{ text: "观望仪仗", action: (state) => log("你挤在人群中看到蓝眼卷发的粟特人，正展示西域远道而来的香料、葡萄与光华流转的琉璃器皿。")}]
            }
        }
    },
    {
        name: "洛阳大水",
        trigger: (state) => state.time.year === 223 && state.time.month === 7 && state.player.location === '住所',
        scenes: {
            'default': { 
                description: "连日暴雨，伊洛河水猛涨，沿岸里坊尽成泽国。你亲眼见到百姓涉水而行，商贩叫苦连天，米价翻番，城中出行极为不便。有人感叹：‘天意难测，洛阳又逢大水。’", 
                options: [{ text: "艰难维生", action: (state) => { log("你设法购得一些高价米，勉强度日。"); state.player.money -= 20; } }]
            }
        }
    },
    {
        name: "司马懿辅政",
        trigger: (state) => state.time.year === 226 && state.player.location === '崇华殿',
        scenes: {
            '官员': { 
                description: "你在崇华殿目睹一场密议。新帝年幼，文帝临终托孤于曹真、陈群、司马懿、曹休四人。司马懿神色深沉，众臣皆肃然。你心知朝局将变，暗流涌动。", 
                options: [{ text: "静观其变", action: (state) => {} }]
            },
            'default': { 
                description: "你听闻宫中传出消息，说新帝年幼，朝中有四位重臣辅政，尤以司马懿最为深沉。市井间议论纷纷：‘不知这位司马将军，日后会否独揽大权？’", 
                options: [{ text: "记下传闻", action: (state) => {} }]
            }
        }
    },
    {
        name: "曹髦的才情",
        trigger: (state) => state.time.year >= 254 && state.time.year <= 260 && state.player.location === '太学'&& ['文人', '官员','宗室'].includes(state.player.identity),
        scenes: {
            'default': { 
                description: "你在太学听到学子们传诵皇帝新作的诗文，皆叹其才情横溢。有人低声道：‘可惜天子身陷权臣之手，纵有文才武略，亦难展宏图。’一时间，殿堂内外弥漫着淡淡的哀愁。", 
                options: [{ text: "默然一叹", action: (state) => {} }]
            }
        }
    },
    {
        name: "嵇康之死",
        trigger: (state) => (state.time.year === 262 || state.time.year === 263) && state.player.location === '金市',
        scenes: {
            '文人': { 
                description: "今日金市人山人海，却鸦雀无声。你看到名士嵇康因得罪钟会及司马氏，即将被处斩。临刑前，他神色不变，索琴弹奏一曲《广陵散》，叹曰：‘《广陵散》于今绝矣！’琴音绝，人亦绝。你悲从中来，不能自已。", 
                options: [{ text: "默然哀悼", action: (state) => { log("一个时代随琴声而逝，你心中充满了悲哀与无力。"); } }]
            },
            'default': { 
                description: "你听说今天金市要处斩一位非常有名的大才子嵇康。刑场上，那人毫无惧色，反而要来一架琴，弹奏了一首旷世绝伦的曲子。周围的人都说，这样的人也被杀，真是太可惜了。", 
                options: [{ text: "记下此事", action: (state) => {} }]
            }
        }
    },
    {
        name: "钟会伐蜀",
        trigger: (state) => state.time.year === 263 && (state.player.location === '宫城' || state.player.location === '中书省'),
        scenes: {
            '官员': { 
                description: "你感到朝中气氛异常，人人都在讨论伐蜀之事。镇西将军钟会如今是朝中红人，负责此次南征。你听同僚私下议论，钟会为人野心勃勃，此次手握重兵，不知是福是祸。", 
                options: [{ text: "静观其变", action: (state) => { log("你决定在朝中谨言慎行，静观局势发展。"); } }]
            },
            'default': { 
                description: "你看到城中兵马调动频繁，听人说是朝廷要派一位姓钟的大将军去攻打西边的蜀国。大家都在议论，希望这次能一举成功，好结束这几十年的战乱。", 
                options: [{ text: "希望天下太平", action: (state) => {} }]
            }
        }
    }
];
