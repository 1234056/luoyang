const locations = {
    luoyang: {
        '宫城': { name: '宫城', gridArea: '3 / 4 / 7 / 7', type: 'imperial', description: '洛阳宫之所在，天子居所，戒备森严。', actions: [
            { 
                text: "进入宫城", 
                condition: (state) => ['官员', '宗室'].includes(state.player.identity),
                action: [
                    { id: 'switchMap', params: { mapName: 'palace', entryLocation: '阊阖门' } },
                    { id: 'log', params: { message: '你出示了身份凭证，进入了宫城。' } }
                ]
            },
            { 
                text: "尝试靠近", 
                condition: (state) => !['官员', '宗室'].includes(state.player.identity),
                action: [
                    { id: 'log', params: { message: '你被门候拦住了，无法进入宫城。', type: 'highlight' } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            },
            { 
                text: "仰望宫城", 
                condition: (state) => !['官员', '宗室'].includes(state.player.identity),
                action: [
                    { id: 'log', params: { message:[ '从墙脚仰望，宫内许多台阁楼观。','千金比屋，层楼对出，重门启扇，阁道交通，迭相临望。' ]} },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
        '金墉城': { name: '金墉城', gridArea: '1 / 1 / 2 / 2', type: 'important', 
            description: [{text:'紧邻宫城东北侧的城中之城。其上架木为榭，危楼高百尺。'},
                {text:'这里地势高亢，形如堡垒，是仿照邺城三台所建的防御要塞。'}], 
        actions: [
            { 
                text: "远远眺望", 
                action: [
                    { id: 'log', params: { message:[{text:'你远远地望着金墉城。', startYear: 220, endYear: 291 },{text:'你远远地望着金墉城，隐隐感到一丝的寒意。', startYear: 291, endYear: 311 }]  } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
        '芳林园': { name: [
                { text: '芳林园', endYear: 239, endMonth: 12 },
                { text: '华林园', startYear: 239, startMonth: 1 }
            ],
             gridArea: '2 / 4 / 3 / 7', type: 'imperial', description: '位于宫城西侧的皇家园林，内有奇花异草，亭台楼阁。', actions: [
            { 
                text: "窥探园内", 
                condition: (state) => state.player.identity !== '宗室',
                action: [
                    { id: 'log', params: { message: '你只能从高墙外窥见园内一角，无法进入。' } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            },
            { 
                text: "进入园中", 
                condition: (state) => state.player.identity === '宗室',
                action: [
                    { id: 'switchMap', params: { mapName: 'garden', entryLocation: '芳林上閤' } },
                    { id: 'log', params: { message: '你进入了这座园林。' } }
                ]
            },
        ] },
        '太尉府': { name: '太尉府', gridArea: '8 / 4 / 9 / 5', type: 'important', description: '太尉府衙。' },
        '铜驼街': { name: '铜驼街', gridArea: '7 / 5 / 15 / 6', type: 'important', 
            vertical: true, // 文字竖排
            description: [
                        { text: '纵贯内城的南北主干道，道旁有铜驼镇守，车水马龙，人物繁盛。' },
                        { text: '这里是帝都的交通命脉，商旅往来，络绎不绝。' },
                        { text: '俗语云“金马门外聚群贤，铜驼街上集少年”，足见其繁华。', startYear: 240, endYear: 265 },
                        { text: '如今正值西晋盛时，铜驼街上常有贵族名士的牛车经过，极尽奢华。', startYear: 280, endYear: 300 }
                    ],  
        actions: [
            { 
                text: "沿街漫步", 
                action: [
                    { id: 'log', params: {message: [
                            { text: '你走在宽阔的铜驼街上，感受着帝都的脉搏。' },
                            { text: '长衢罗夹巷，王侯多第宅。' },
                            { text: '大街被两道半人高的墙一分为三，达官贵人的车马在中间行驶，凡人行走在左右两侧，左入右出，不得相逢。' },
                            { text: '道旁夹种槐、柳，随风摇曳，似乎在诉说着古老的故事。' },
                            { text: '你听到有人在酒楼上作歌曰：“青阳二三月，柳青桃复红。车马不相识，音落黄埃中。”' },
                            { text: '一个衣着朴素的士子在人群中匆匆走过，似乎在为什么生计发愁。', startYear: 272, endYear: 280 },
                            { text: '你看到几个年轻人在高谈阔论，言语中颇有品评人物、臧否时政的意味。', startYear: 245, endYear: 260 }
                        ]  } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
        '宣阳门': { name: '宣阳门', gridArea: '15 / 5 / 16 / 6', type: 'important', description: '洛阳城南门之一，由此可出城。',
             actions: [
                {
                    text:'出城',
                    action: [
                    { id: 'log', params: { message: '你离开了洛阳城。' } },
                    { id: 'switchMap', params: { mapName: 'south', entryLocation: '宣阳门' } },
                ] 
                }
             ]
         },
        '金市': { name: '金市', gridArea: '3 / 2 / 5 / 3', type: 'important', description: '洛阳最重要的商业区，位于铜驼街西侧，人声鼎沸，商铺林立。', actions: [
            { 
                text: "浏览商品", 
                action: [
                    { id: 'log', params: { message: '琳琅满目的商品让你眼花缭乱。' } },
                    { id: 'advanceTime', params: { hours: 2 } }
                ] 
            }, 
            { 
                text: "打听消息", 
                action: [
                    { id: 'log', params: { message: '你从南来北往的客商口中听到了一些市井传闻。' } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
        '武库': { name: '武库', gridArea: '6 / 3 / 7 / 4', type: 'important', description: '兵器陈列之所，剑戟森然。'},
        '曹爽宅': { name: '曹爽宅', gridArea: '10 / 3 / 11 / 4', type: 'important', description: ''},
        '荀彧宅': { name: '荀彧宅', gridArea: '8 / 1 / 9 / 2', type: 'important', description: ''},
        '司马昭宅': { name: '司马昭宅', gridArea: '6 / 2 / 7 / 3', type: 'important', description: ''},
        '太社': { name: '太社', gridArea: '12 / 4 / 13 / 5', type: 'important', description: '祭祀土地、谷神之所。《周礼考工记》曰：“左祖右社”。'},
        '太庙': { name: '太庙', gridArea: '12 / 6 / 13 / 7', type: 'important', description: '祭祀祖先之所。《周礼考工记》曰：“左祖右社”。'},
        '宣阳冰室': { name: '宣阳冰室', gridArea: '14 / 6 / 15 / 7', type: 'important', description: '宣阳门附近的藏冰之所。'},
        '太仓': { name: '太仓', gridArea: '1 / 11 / 3 / 13', type: 'important', description: '粮食积贮之所。'},
        '听讼观': { name: '听讼观', gridArea: '2 / 8 / 3 / 9', type: 'important', description: ''},
        '古翟泉': { name: '古翟泉', gridArea: '2 / 9 / 4 / 10', type: 'river', description: ''},
        '石崇宅': { name: '石崇宅', gridArea: '3 / 10 / 4 / 11', type: 'important', description: ''},
        '司马懿宅': { name: '司马懿宅', gridArea: '4 / 12 / 5 / 13', type: 'important', description: ''},
        /*'马市': { name: '马市', gridArea: '4 / 12 / 5 / 13', type: 'important', description: '市场交易之所，在东北建春门外，又称“东西市”。'},*/
        '将军府': { name: '将军府', gridArea: '4 / 7 / 5 / 8', type: 'important', description: '此处有五营校尉和前后左右将军府，紧邻宫城。'},
        '潘岳宅': { name: '潘岳宅', gridArea: '4 / 8 / 5 / 9', type: 'important', description: ''},
        '东宫': { name: '东宫', gridArea: '4 / 9 / 6 / 11', type: 'imperial', description: ''},
        '住所': { name: '住所', gridArea: '15 / 1 / 16 / 2', type: 'normal', description: '你的住所。', actions: [
            { 
                text: "四处闲逛", 
                action: [
                    { id: 'log', params: { message: '你在附近的里坊闲逛，观察着邻里的日常生活。' } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }, 
            { 
                text: "回家休息", 
                action: [
                    { id: 'log', params: { message: '你回到住所休息，恢复了精力。' } },
                    { id: 'advanceTime', params: { hours: 4 } }
                ]
            }
        ] },
        '金谷园': { name: '金谷园', gridArea: '13 / 1 / 15 / 3', type: 'important', description: '西晋巨富石崇的私家园林，以奢华闻名天下。', 
            condition: (state) => state.time.year >= 280, // 金谷园在西晋时期才出名
            actions: [
                { 
                    text: "在外围感叹", 
                    action: [
                        { id: 'log', params: { message: '你只能在园外想象金谷园内的奢华景象，感叹贫富差距之大。' } },
                        { id: 'advanceTime', params: { hours: 1 } }
                    ]
                }
            ] 
        },
        '邙山入口': { name: '邙山入口', gridArea: '1 / 3 / 2 / 10', type: 'normal', description: '城北的出口，由此可前往邙山。山上多有王侯将相的陵墓。', actions: [
            { 
                text: "遥望邙山", 
                action: [
                    { id: 'log', params: { 
                        message: [
                            "你向北遥望，邙山连绵，埋葬了无数王侯将相。一代霸主们的肉体和命运最终都归为一抔黄土。城中鲜活的生命，山陵永恒的静寂，死与生的对峙在此无限延展。",
                            "北邙何垒垒，高陵有四五。借问谁家坟，皆云汉世主。",
                            "昔为万乘君，今为丘中土。感彼雍门言，凄怆哀今古。"
                ] } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
    },
    luoyangGrid: [15, 12],
    palace: {
        '阊阖门': { name: '阊阖门', gridArea: '15 / 4 / 16 / 6', type: 'imperial', description: '宫城正门，巍峨壮丽。由此可返回洛阳主城。', actions: [
            { 
                text: "出宫", 
                action: [
                    { id: 'switchMap', params: { mapName: 'luoyang', entryLocation: '宫城' } },
                    { id: 'log', params: { message: '你离开了宫城，返回洛阳主城。' } }
                ]
            }
        ]},
        '司马门': { name: '司马门', gridArea: '15 / 9 / 16 / 11', type: 'imperial', 
            description: [
                { text: "作为宫城南面的正门，司马门庄严肃穆，守卫森严。只有持有符节的官员和皇族才能出入。", startYear: 220, endYear: 248 },
                { text: "高平陵之变后，这里的守卫换了一批又一批，气氛紧张到了极点。每一次城门开合，都牵动着无数人的神经。", startYear: 249, endYear: 265 },
                { text: "晋朝建立，司马门作为皇宫南门，门阙壮丽，仪仗威严。", startYear: 266, endYear: 290 },
                { text: "八王之乱中，司马门成为了各方势力争夺的焦点。城门下血迹斑斑，见证了太多的宫廷政变。", startYear: 291, endYear: 311 }
            ],
            actions: [
                { text: '观察守备', action: { id: 'advanceTime', params: { hours: 1 } } }
            ],
            logs: [
                "一队羽林军从门内开出，气势威武。",
                "几位大臣在门前下车，整理衣冠后匆匆入内。",
                { text: "城门紧闭，盘查极严，据说大将军曹爽的党羽正在被全城搜捕。", startYear: 249, endYear: 250 }
            ]
        },
        '端门': { name: '端门', gridArea: '13 / 4 / 14 / 6', type: 'imperial', description: '殿中正门，群臣至此需下车步行，故又称“止车门”' },
        '中华门': { name: '中华门', gridArea: '11 / 4 / 12 / 6', type: 'imperial', description: '殿中正门，由此可进入太极殿。' },
        '中书省': { name: '中书省', gridArea: '12 / 3 / 13 / 4', type: 'imperial', description: '政务中枢之一，负责起草诏令。' },
        '门下省': { name: '尚书省', gridArea: '12 / 6 / 13 / 7', type: 'imperial', description: '政务中枢之一，负责执行诏令。' },
        '西中华门': { name: '西中华门', gridArea: '6 / 3 / 7 / 4', type: 'imperial', description: '太极殿前庭院的西侧门。' },
        '东中华门': { name: '东中华门', gridArea: '6 / 6 / 7 / 7', type: 'imperial', description: '太极殿前庭院的东侧门。' },
        '太极殿': { name: '太极殿', gridArea: '6 / 4 / 8 / 6', type: 'imperial', 
            construction: { startYear: 235, duration: 5, description: '工匠们正在建造新的殿宇，这里将来会是恢弘的正殿。' },
            description: '皇宫正殿，用于举行大朝会等重大典礼，威严肃穆。', 
            actions: [
                { 
                    text: "瞻仰其雄伟", 
                    action: [
                        { id: 'log', params: { message: '你瞻仰着太极殿的雄伟，心中充满敬畏。' } },
                        { id: 'advanceTime', params: { hours: 1 } }
                    ]
                }
            ] 
        },
        '西堂': { name: '西堂', gridArea: '6 / 3 / 7 / 4', type: 'imperial', construction: { startYear: 235, duration: 5, description: '工匠们正在建造新的殿宇。' },description: '位于太极殿西侧的殿堂。' },
        '东堂': { name: '东堂', gridArea: '6 / 6 / 7 / 7', type: 'imperial', construction: { startYear: 235, duration: 5, description: '工匠们正在建造新的殿宇。' },description: '位于太极殿东侧的殿堂，皇帝或在此日常听政。' },
        '神虎门': { name: '神虎门', gridArea: '9 / 1 / 10 / 2', type: 'imperial', description: '宫城西墙中部的门户，设有双阙。' },
        '云龙门': { name: '云龙门', gridArea: '9 / 8 / 10 / 9', type: 'imperial', description: '宫城东墙中部的门户，与神虎门相对，为禁中要门。' },
        '西掖门': { name: '西掖门', gridArea: '13 / 1 / 14 / 2', type: 'imperial', description: '宫城西墙南端的偏门。' },
        '东掖门': { name: '东掖门', gridArea: '13 / 8 / 14/ 9', type: 'imperial', description: '宫城东墙南端的偏门。' },
        '千秋门': { name: '千秋门', gridArea: '1 / 1 / 2 / 2', type: 'imperial', description: '宫城西墙之门。' },
        '万春门': { name: '万春门', gridArea: '1 / 8 / 2 / 9', type: 'imperial', description: '宫城东墙之门。' },
        '簿室门': { name: '簿室门', gridArea: '1 / 12 / 2 / 13', type: 'imperial', description: '宫城东墙之门。' },
        '昭阳殿': { name: [
                { text: '昭阳殿', endYear: 265, endMonth: 11 },
                { text: '明阳殿', startYear: 265, startMonth: 12 }
            ],
             gridArea: '3 / 4 / 4 / 6', type: 'imperial', 
            construction: { startYear: 235, duration: 5, description: '工匠们正在建造新的殿宇，这里将来会是皇帝的寝宫。' },
            description: '位于太极殿正北，或为皇帝正寝。' },
        '北宫区域': { name: '北宫区域', gridArea: '1 / 3 / 2 / 7', type: 'imperial', description: '宫城最北端，是北宫与苑囿所在，防备森严。', actions: [
            { 
                text: "进入北宫",
                condition: (state) => ['宗室'].includes(state.player.identity)|| (state.time.year < 240 && ['官员'].includes(state.player.identity)), // 240年前官员也能进
                action: [
                    { id: 'switchMap', params: { mapName: 'harem', entryLocation: '北宫南门' } },
                    { id: 'log', params: { message: '你通过严格的盘查，进入了北宫区域。' } }
                ]
            },
            { 
                text: "尝试进入",
                condition: (state) => !['宗室'].includes(state.player.identity)&&!(state.time.year < 240 && ['官员'].includes(state.player.identity)), // 240年前官员也能进
                action: [
                    { id: 'log', params: { message: '这里是后宫禁地，你被卫兵严词喝退。', type: 'highlight' } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ]},
    palaceGrid: [15, 12],
    harem: {
        '北宫南门': { name: '北宫南门', gridArea: '10 / 4 / 11 / 6', type: 'imperial', description: '由此可离开北宫，返回宫城南部区域。', actions: [
            { 
                text: "离开北宫", 
                action: [
                    { id: 'switchMap', params: { mapName: 'palace', entryLocation: '北宫区域' } },
                    { id: 'log', params: { message: '你离开了北宫。' } }
                ]
            }
        ]},
        '凌云台': { name: '凌云台', gridArea: '2 / 2 / 3 / 3', type: 'imperial', 
            construction: { startYear: 221, duration: 1, description: '一片繁忙的工地，工人们正在建造一座高台。' },
            description: '宫城西北的高台，内有八角冰井，可登高望远。',
            actions: [
                {
                    text: "取冰消暑",
                    condition: (state) => state.time.month >= 5 && state.time.month <= 7,
                    action: [
                        { id: 'log', params: { message: '你让仆僮从八角冰井中取来冰块消暑，感到一阵清凉。' } },
                        { id: 'advanceTime', params: { hours: 1 } }
                    ]
                },
                {
                    text: "登台远望",
                    action: [
                        { id: 'log', params: { message: ['你登上凌云台，整个洛阳宫城的景色尽收眼底。', 
                            '风生户牖，云起栋梁，目极洛川。'
                        ]} },
                        { id: 'advanceTime', params: { hours: 2 } }
                    ]
                }
            ]
        },
        '建始殿': {
            name: '建始殿',
            type: 'imperial',
            gridArea: '5 / 6 / 6 / 8',
            description: [
                { text: "由魏武帝始建，官员朝会之所", startYear: 220, endYear: 240 },
                { text: "此地已不再作为朝会地点，而是成为北宫中的宫殿", startYear: 240, endYear: 243 },
                { text: "北宫中的一座宫殿", startYear: 243, endYear: 311 }
            ],

            actions: [
                 {text: '参与朝会',
                    condition: (state) => state.time.year < 240 && state.player.identity === '官员',
                    action: [
                        { id: 'log', params: { message: '入殿参与政事' } },
                        { id: 'advanceTime', params: { hours: 3 } }
                    ]
                },
                 { text: '遥望宫殿', action: [{ id: 'advanceTime', params: { hours: 1 } },{ id: 'log', params: { message: '远远望去，殿宇在阳光下熠熠生辉。' } },] }
            ],
        },
        '崇华殿': {
            name: [
                { text: '崇华殿', endYear: 235, endMonth: 7 },
                { text: '九龙殿', startYear: 235, startMonth: 8 }
            ],
            gridArea: '5 / 2 / 6 / 4',
            type: 'imperial',
            description: [
                { text: '北宫中的一座重要宫殿。' }
            ],
            actions: [
                {
                    text: "闲逛",
                    action: [
                        { id: 'log', params: { message: '你在这座华美的宫殿附近闲逛。' } },
                        { id: 'advanceTime', params: { hours: 1 } }
                    ]
                }
            ]
        },
        '北宫北门': { name: '北宫北门', gridArea: '1 / 4 / 2 / 6', type: 'imperial', description: [{ text: '此处可以通往芳林园。', startYear: 220, endYear: 239 },{ text: '此处可以通往华林园。', startYear: 240, endYear: 311 }] , actions: [
            { 
                text: "离开北宫", 
                action: [
                    { id: 'switchMap', params: { mapName: 'garden', entryLocation: '芳林上閤' } },
                    { id: 'log', params: { message: '你离开了北宫。' } }
                ]
            }
        ]},
        '嘉福殿': { name: '嘉福殿', gridArea: '2 / 4 / 3 / 6', type: 'imperial', description: '北宫中的一座重要宫殿。' },
        '灵芝池': { name: '灵芝池', gridArea: '4 / 4 / 7 / 6', type: 'river', construction: { startYear: 222, duration: 2, description: '一座正在建设的池沼。' },description: '北宫苑囿中的一处水池。' },
        '九龙池': { name: '九龙池', gridArea: '6 / 2 / 8 / 4', type: 'river', description: '北宫苑囿中的一处水池。' },
        '宣光殿': { name: '宣光殿', gridArea: '8 / 4 / 9 / 6', type: 'imperial',  description: '北宫中的一处建筑。' },
        '玄览观': { name: '玄览观', gridArea: '2 / 1 / 3 / 2', type: 'imperial',  description: '北宫中的一处台观。' },
        '修龄观': { name: '修龄观', gridArea: '4 / 1 / 5 / 2', type: 'imperial',  description: '北宫中的一处台观。' },
        '阆风观': { name: '阆风观', gridArea: '6 / 1 / 7 / 2', type: 'imperial',  description: '北宫中的一处台观。' },
        '临商观': { name: '临商观', gridArea: '8 / 1 / 9 / 2', type: 'imperial',  description: '北宫中的一处台观。' },
        '高平观': { name: '高平观', gridArea: '2 / 9 / 3 / 10', type: 'imperial',  description: '北宫中的一处台观。' },
        '东氾观': { name: '东氾观', gridArea: '5 / 9 / 6 / 10', type: 'imperial',  description: '北宫中的一处台观。' },
        '清览观': { name: '清览观', gridArea: '8 / 9 / 9 / 10', type: 'imperial',  description: '北宫中的一处台观。' }
    },
    haremGrid: [11, 9], // 定义北宫地图网格尺寸
    garden:{
        '芳林上閤': { name:[
                { text: '芳林上閤', endYear: 239, endMonth: 12 },
                { text: '华林上閤', startYear: 239, startMonth: 1 }
            ], gridArea: '6 / 4 / 7 / 6', type: 'imperial', description:[{ text: '由此可离开芳林园，返回城区。', startYear: 220, endYear: 239 },{ text: '由此可离开华林园，返回城区。', startYear: 240, endYear: 311 }] , actions: [
            { 
                text:  '离开园林', 
                action: [
                    { id: 'switchMap', params: { mapName: 'luoyang', entryLocation: '芳林园' } },
                    { id: 'log', params: { message: '你离开了这片园林。' } }
                ]
            }
        ]},
        '天渊池':{name:'天渊池', gridArea: '1 / 2 / 3 / 4',type: 'river', construction: { startYear: 224, duration: 2, description: '一座正在建设的池沼。' }, description: '园中水池，可以流杯曲水，楫棹越歌。'},
        '九华台': { name: '九华台', gridArea: '2 / 3 / 3 / 4', type: 'imperial', construction: { "startYear": 226, "duration": 1, "description": "这里将建造一座新的宫廷台观。" }, description: '北宫苑囿中的一处台观建筑。' },
        '景阳山':{name:'景阳山', gridArea: '5 / 1 / 7 / 3',type: 'imperial', construction: { startYear: 237, duration: 2, description: '一座正在建设的假山。' },description: '园中假山，上有太行之石英、谷城之文石。'}
    },
    gardenGrid:[8,6],
    south:{
        '宣阳门': { name: '宣阳门', gridArea: '1 / 5 / 2 / 6', type: 'important', description: '洛阳城南门之一，由此可进城。',
                   actions: [
                {   text:'进城',
                    action: [
                    { id: 'log', params: { message: '你进入了洛阳城。' } },
                    { id: 'switchMap', params: { mapName: 'luoyang', entryLocation: '宣阳门' } },
                ] 
                },
                {   text:'遥望洛阳城',
                    action: [
                    { id: 'log', params: { message: ['帝宅夹清洛，丹霞捧朝暾。葱茏瑶台榭，窈窕双阙门。'] } },
                ] 
                }
             ]
                },
        '铜驼街1': { name: '铜驼街', gridArea: '2 / 5 / 10 / 6', type: 'important', 
            vertical: true, // 文字竖排
            description: [
                        { text: '纵贯内城的南北主干道，道旁有铜驼镇守，车水马龙，人物繁盛。' },
                        { text: '这里是帝都的交通命脉，商旅往来，络绎不绝。' },
                    ],  
        actions: [
            { 
                text: "沿街漫步", 
                action: [
                    { id: 'log', params: {message: [
                            { text: '你走在宽阔的铜驼街上，感受着帝都的脉搏。' },
                            { text: '道旁夹种槐、柳，随风摇曳，似乎在诉说着古老的故事。' }
                        ]  } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
        '太学': {
            name: '太学',
            type: 'important',
            gridArea: '6 / 9 / 7 / 10',
            condition: (state) => state.time.year >= 224, // 魏文帝黄初五年重开太学
            description: [
                {text:"国家最高学府，学子云集。", startYear: 220, endYear: 240 },
                {text:"太学位于城南开阳门外三里御道东。", startYear: 220, endYear: 240 },
                {text:"国家最高学府，学子云集。著名的三体石经立于太学门外，引来无数士子赞叹临摹。", startYear: 241, endYear: 311 },
                { text: "魏晋时期，太学兴盛，无数才俊在此求学，渴望着经世致用，一展抱负。", startYear: 220, endYear: 240 },
                { text: "正始年间，玄学之风吹入太学，儒学与道家的思辨，让这里的学术氛围既紧张又活跃。", startYear: 241, endYear: 248 },
                { text: "政局不明，曹爽与司马氏集团间的矛盾越发突出，太学里的空气也变得凝重起来。昔日的清谈阔论减少了，取而代之的是小心翼翼的沉默和对未来的迷茫。", startYear: 249, endYear: 265 },
                { text: "咸宁年间，太学规模更为宏大。据说太学生“东越于海，西及流沙，并时集至，万有余人。”", startYear: 266, endYear: 290 },
                { text: "八王之乱的烽火最终波及了这片学术净土。太学时而闭塞，时而成为政治斗争的附庸，昔日盛景已然不再。", startYear: 291, endYear: 311 }
            ],
            actions: [
            { 
                text: "旁听讲学", 
                action: [
                    { id: 'log', params: { message: '你在太学旁听了一场经学讲座，受益匪浅。' } },
                    { id: 'advanceTime', params: { hours: 3 } }
                ]
            },
            {
                text: "观摩三体石经",
                condition: (state) => state.time.year >= 241,
                action: [
                    { id: 'log', 
                        params:{ message:['你仔细观摩了立于太学门外的三体石经，为其书写和雕刻的精美而赞叹。' ,
                                '其上每种字体均用大篆、小篆、隶书三种字体写就，字体端正、结构严谨，为天下学习典范。']}},
                    { id: 'advanceTime', params: { hours: 2 } }
                ]
            }
        ] },
        '辟雍':{ name: '辟雍',type: 'important',gridArea: '8 / 8 / 9 / 9',},
        '明堂':{ name: '明堂',type: 'important',gridArea: '8 / 7 / 9 / 8',},
        '灵台':{ name: '灵台',type: 'important',gridArea: '8 / 6 / 9 / 7',},
        '洛水':{ name: '洛水',type: 'river',gridArea: '10 / 1 / 12 / 13',interactive: false},
        '浮桥':{ name: '浮桥',type: 'important',gridArea: '10 / 5 / 12 / 6',},
        '铜驼街2': { name: '铜驼街', gridArea: '12 / 5 / 16 / 6', type: 'important', 
            vertical: true, // 文字竖排
            description: [
                        { text: '纵贯内城的南北主干道，道旁有铜驼镇守，车水马龙，人物繁盛。' },
                        { text: '这里是帝都的交通命脉，商旅往来，络绎不绝。' },
                    ],  
        actions: [
            { 
                text: "沿街漫步", 
                action: [
                    { id: 'log', params: {message: [
                            { text: '你走在宽阔的铜驼街上，感受着帝都的脉搏。' },
                            { text: '道旁夹种槐、柳，树枝随风摇曳，似乎在诉说着古老的故事。' }
                        ]  } },
                    { id: 'advanceTime', params: { hours: 1 } }
                ]
            }
        ] },
    },
    southGrid:[15,12]
};
