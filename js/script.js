document.addEventListener('DOMContentLoaded', () => {
    // 验证DOM元素是否都存在
    const requiredElements = [
        'time-display', 'stat-identity', 'stat-money', 'stat-location',
        'map-grid', 'event-log', 'destination-select', 'travel-info',
        'travel-btn', 'local-actions', 'location-info', 'event-panel'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        return;
    }

    // --- 游戏核心数据 ---
    const gameData = {
        identities: [
            { name: '平民', money: 100 },
            { name: '商人', money: 500 },
            { name: '官员', money: 300 },
            { name: '文人', money: 150 },
            { name: '宗室', money: 1000 }
        ],
        eras: [
            { start: 220, end: 265, name: "魏", atmosphere: { security: 'normal', economy: 'stable', mood: 'neutral' }, description: "曹魏治下，洛阳作为都城，逐渐恢复着汉末的创伤。" },
            { start: 266, end: 290, name: "西晋（统一初期）", atmosphere: { security: 'low', economy: 'prosperous', mood: 'optimistic' }, description: "晋武帝平定天下，洛阳迎来了短暂的统一与繁华。" },
            { start: 291, end: 311, name: "西晋（八王之乱）", atmosphere: { security: 'high', economy: 'inflated', mood: 'chaotic' }, description: "八王之乱起，洛阳卷入无尽的战火与阴谋，繁华不再。" }
        ],
        maps: locations, // from locations.js
        shichen: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
        timedEvents: timedEvents, // from events.js
        events: events // from events.js
    };

    // --- 游戏状态 ---
    let gameState = {
        player: { identity: null, money: 0, location: '里坊' },
        time: { year: 220, month: 1, day: 1, shichen_index: 4, ke: 0 }, // 引入“刻”
        world: {},
        currentMap: 'luoyang'
    };

    // --- DOM 元素 ---
    const DOMElements = {
        timeDisplay: document.getElementById('time-display'),
        statIdentity: document.getElementById('stat-identity'),
        statMoney: document.getElementById('stat-money'),
        statLocation: document.getElementById('stat-location'),
        mapGrid: document.getElementById('map-grid'),
        eventLog: document.getElementById('event-log'),
        destinationSelect: document.getElementById('destination-select'),
        travelInfo: document.getElementById('travel-info'),
        travelBtn: document.getElementById('travel-btn'),
        localActions: document.getElementById('local-actions'),
        locationInfo: document.getElementById('location-info'),
        eventPanel: document.getElementById('event-panel'),
        eventTitle: document.getElementById('event-title'),
        eventDescription: document.getElementById('event-description'),
        eventOptions: document.getElementById('event-options'),
        mainControls: document.getElementById('main-controls'),
        transportSelect: document.getElementById('transport-select'),
        passMonthBtn: document.getElementById('pass-month-btn'), // 新增按钮
    };

    // --- 辅助函数 ---
    function getRandomText(textOrArray) {
        if (!Array.isArray(textOrArray) || textOrArray.length === 0) {
            return textOrArray;
        }

        const currentYear = gameState.time.year;

        const validOptions = textOrArray.filter(option => {
            // 纯字符串，始终有效
            if (typeof option === 'string') {
                return true;
            }
            // 对象格式，检查时间限制
            if (typeof option === 'object' && option.text) {
                const { startYear, endYear } = option;
                const isAfterStart = startYear === undefined || currentYear >= startYear;
                const isBeforeEnd = endYear === undefined || currentYear <= endYear;
                return isAfterStart && isBeforeEnd;
            }
            return false; // 忽略无效格式
        });

        // 如果有符合条件的选项，从中随机选取一个
        if (validOptions.length > 0) {
            const chosen = validOptions[Math.floor(Math.random() * validOptions.length)];
            return typeof chosen === 'string' ? chosen : chosen.text;
        }

        // 如果没有符合当前年份的特定文本，则在所有无时间限制的通用文本中随机选择一个作为后备
        const genericOptions = textOrArray.filter(option => 
            typeof option === 'string' || 
            (typeof option === 'object' && option.text && option.startYear === undefined && option.endYear === undefined)
        );

        if (genericOptions.length > 0) {
            const chosen = genericOptions[Math.floor(Math.random() * genericOptions.length)];
            return typeof chosen === 'string' ? chosen : chosen.text;
        }
        
        return ""; // 如果没有任何可用文本，返回空字符串
    }

    // 新增：根据时间获取地名
    function getTimedName(locationObject) {
        if (!locationObject || !locationObject.name) {
            return "";
        }
        if (typeof locationObject.name === 'string') {
            return locationObject.name;
        }
        if (Array.isArray(locationObject.name)) {
            const currentYear = gameState.time.year;
            const currentMonth = gameState.time.month;

            let bestMatch = null;

            for (const option of locationObject.name) {
                const isYearMatch = (!option.startYear || currentYear >= option.startYear) && 
                                    (!option.endYear || currentYear <= option.endYear);
                const isMonthMatch = (!option.startMonth || currentYear > option.startYear || (currentYear === option.startYear && currentMonth >= option.startMonth)) &&
                                     (!option.endMonth || currentYear < option.endYear || (currentYear === option.endYear && currentMonth <= option.endMonth));

                if (isYearMatch && isMonthMatch) {
                    // 优先选择有时间限制的最新匹配项
                    if (option.startYear || option.startMonth) {
                        if (!bestMatch || 
                            (option.startYear > (bestMatch.startYear || 0)) ||
                            (option.startYear === (bestMatch.startYear || 0) && option.startMonth > (bestMatch.startMonth || 0))) {
                            bestMatch = option;
                        }
                    } else if (!bestMatch) {
                        // 如果没有更好的匹配，则使用通用名称
                        bestMatch = option;
                    }
                }
            }
            if (bestMatch) return bestMatch.text;

            // 后备：返回第一个没有时间限制的名称
            const fallback = locationObject.name.find(opt => !opt.startYear && !opt.startMonth);
            if (fallback) return fallback.text;
        }
        return ""; // 如果没有找到合适的名称
    }

    function log(message, type = 'normal') {
        const entry = document.createElement('div');
        entry.className = 'event-entry';
        const time = `<strong>${getYearEra(gameState.time.year)} ${gameState.time.year}年 ${gameData.shichen[gameState.time.shichen_index]}时:</strong>`;
        
        // 使用 getRandomText 来处理可能存在的复杂数组
        const processedMessage = getRandomText(message);

        entry.innerHTML = `<div class="event-time">${time}</div><div class="${type === 'highlight' ? 'highlight' : ''}">${processedMessage}</div>`;
        DOMElements.eventLog.appendChild(entry);

        // 限制日志条目数量，防止过长
        while (DOMElements.eventLog.children.length > 50) {
            DOMElements.eventLog.removeChild(DOMElements.eventLog.firstChild);
        }

        // 自动滚动到底部
        DOMElements.eventLog.scrollTop = DOMElements.eventLog.scrollHeight;
    }

    function getYearEra(year) {
        if (year < 220) return "汉";
        if (year <= 265) return "魏";
        if (year <= 316) return "晋";
        return "未知";
    }

    function updateUI() {
        // 更新时间显示，加入“刻”
        DOMElements.timeDisplay.innerHTML = `${getYearEra(gameState.time.year)} ${gameState.time.year}年 ${gameState.time.month}月${gameState.time.day}日 <span class="highlight">${gameData.shichen[gameState.time.shichen_index]}时${gameState.time.ke}刻</span>`;
        DOMElements.statIdentity.textContent = gameState.player.identity;
        DOMElements.statMoney.textContent = gameState.player.money;
        // 使用 getTimedName 更新当前位置显示
        const currentLocationObject = gameData.maps[gameState.currentMap][gameState.player.location];
        DOMElements.statLocation.textContent = getTimedName(currentLocationObject);
        updateDestinationSelect();
        updateMapHighlight();
    }

    function advanceTimeInKe(ke) {
        let totalKe = gameState.time.ke + ke;
        let shichenPassed = Math.floor(totalKe / 8);
        gameState.time.ke = totalKe % 8;

        if (shichenPassed === 0) {
            updateUI();
            return;
        }

        let totalShichen = gameState.time.shichen_index + shichenPassed;
        let daysPassed = Math.floor(totalShichen / 12);
        gameState.time.shichen_index = totalShichen % 12;

        if (daysPassed > 0) {
            gameState.time.day += daysPassed;
            // Check for timed events before month/year change
            checkTimedEvents(); 
            
            if (gameState.time.day > 30) {
                let monthsPassed = Math.floor((gameState.time.day - 1) / 30);
                gameState.time.day = ((gameState.time.day - 1) % 30) + 1;
                
                if (monthsPassed > 0) {
                    gameState.time.month += monthsPassed;
                    if (gameState.time.month > 12) {
                        let yearsPassed = Math.floor((gameState.time.month - 1) / 12);
                        gameState.time.month = ((gameState.time.month - 1) % 12) + 1;
                        gameState.time.year += yearsPassed;
                        log(`新年伊始，如今是${getYearEra(gameState.time.year)} ${gameState.time.year}年。`, 'highlight');
                        updateWorldState();
                    }
                }
                // Check for timed events after month/year change
                checkTimedEvents();
            }
        }
        updateUI();
    }

    function advanceMonth(months) {
        gameState.time.month += months;
        if (gameState.time.month > 12) {
            let yearsPassed = Math.floor((gameState.time.month - 1) / 12);
            gameState.time.month = ((gameState.time.month - 1) % 12) + 1;
            gameState.time.year += yearsPassed;
            log(`新年伊始，如今是${getYearEra(gameState.time.year)} ${gameState.time.year}年。`, 'highlight');
            updateWorldState();
        }
        log("光阴虚度，转眼已是一月之后。", "highlight");
        checkTimedEvents();
        updateUI();
    }
    
    function calculateTravelTime(from, to, transport) {
        const currentLocations = gameData.maps[gameState.currentMap];
        const fromLoc = currentLocations[from];
        const toLoc = currentLocations[to];
        if (!fromLoc || !toLoc) return 999; // 返回一个较大的刻数
        
        const [r1, c1] = fromLoc.gridArea.split(' / ').slice(0, 2).map(Number);
        const [r2, c2] = toLoc.gridArea.split(' / ').slice(0, 2).map(Number);

        const distance = Math.ceil(Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(c1 - c2, 2)));

        let timeMultiplier = 2; // 大地图默认乘数
        if (['palace', 'harem', 'garden'].includes(gameState.currentMap)) {
            timeMultiplier = 1; // 宫城等小地图乘数
        }

        let baseTimeInKe = distance * timeMultiplier;

        // 根据交通工具调整时间
        switch(transport) {
            case 'oxcart':
                baseTimeInKe = Math.ceil(baseTimeInKe * 0.7);
                break;
            case 'horse':
                baseTimeInKe = Math.ceil(baseTimeInKe * 0.4);
                break;
        }
        
        return Math.max(1, baseTimeInKe); // 至少花费1刻
    }

    function updateTransportOptions() {
        const transportSelect = DOMElements.transportSelect;
        const isPeasant = gameState.player.identity === '平民';

        if (isPeasant) {
            transportSelect.querySelector('option[value="oxcart"]').disabled = true;
            transportSelect.querySelector('option[value="horse"]').disabled = true;
            transportSelect.value = 'walk';
            return;
        }

        const walkingOnlyMaps = ['harem'];
        const walkingOnlyLocations = [
            // Palace locations after Duanmen
            '端门', '中华门', '中书省', '尚书省', '西中华门', '东中华门', 
            '太极殿', '西堂', '东堂', '西上阁', '东上阁', '昭阳殿', '北宫区域'
        ];

        const isWalkingOnly = walkingOnlyMaps.includes(gameState.currentMap) || 
                              (gameState.currentMap === 'palace' && walkingOnlyLocations.includes(gameState.player.location));

        transportSelect.querySelector('option[value="oxcart"]').disabled = isWalkingOnly;
        transportSelect.querySelector('option[value="horse"]').disabled = isWalkingOnly;

        if (isWalkingOnly && transportSelect.value !== 'walk') {
            transportSelect.value = 'walk';
        }
    }

    function moveTo(locationName) {
        if (gameState.player.location === locationName) {
            log("你已在此地。");
            return;
        }

        const destinationObject = gameData.maps[gameState.currentMap][locationName];
        if (!destinationObject) {
            console.error(`moveTo: Could not find location object for ${locationName}`);
            return;
        }
        const timedDestinationName = getTimedName(destinationObject);

        const transport = DOMElements.transportSelect.value;
        let travelTimeInKe = calculateTravelTime(gameState.player.location, locationName, transport);
        
        const transportText = {
            'walk': '步行',
            'oxcart': '乘坐牛车',
            'horse': '骑马'
        }[transport];

        const hours = Math.floor(travelTimeInKe / 8);
        const ke = travelTimeInKe % 8;
        let timeString = "";
        if (hours > 0) timeString += `${hours}个时辰`;
        if (ke > 0) timeString += `${ke}刻`;

        log(`你决定${transportText}前往 ${timedDestinationName}，预计花费${timeString}。`);

        // 在实际移动时才判断是否下雨
        if (Math.random() < 0.1) {
            travelTimeInKe = Math.ceil(travelTimeInKe * 1.5);
            log(`天降大雨，道路泥泞，行程受阻。行动耗时增加了。`, "highlight");
        }

        advanceTimeInKe(travelTimeInKe);
        gameState.player.location = locationName;
        
        log(`抵达 ${timedDestinationName}。`, 'highlight');
        updateTransportOptions();
        updateUI();

        if (!checkEvents()) {
            displayLocationInfo(locationName);
        }
    }

    function executeAction(actionOrActions) {
        if (Array.isArray(actionOrActions)) {
            actionOrActions.forEach(action => executeAction(action));
            // After an array of actions, the UI should be fully up to date
            // because the last action should have triggered a refresh.
            // We can call it one last time to be safe, but it might be redundant.
            updateUI();
            return;
        }

        const action = actionOrActions; // It's a single action object

        if (!action || !action.id) {
            console.error("Invalid action provided to executeAction", action);
            return;
        }

        const { id, params } = action;

        switch (id) {
            case 'log':
                log(getRandomText(action.params.message), action.params.type);
                break;
            case 'advanceTime': // 旧的 advanceTime 现在作为 action 使用，统一为 advanceTimeInKe
                const hoursToKe = (params.hours || 0) * 8;
                advanceTimeInKe(hoursToKe);
                return; 
            case 'switchMap':
                // FIX: Use the correct parameter names from locations.js
                switchMap(params.mapName, params.entryLocation);
                break;
            case 'endGame':
                endGame(gameState, params.reason);
                break;
            case 'updateMoney':
                gameState.player.money += params.amount;
                if (params.amount > 0) {
                    log(`你获得了 ${params.amount} 钱。`, 'highlight');
                } else {
                    log(`你花费了 ${-params.amount} 钱。`);
                }
                break;
            // This case is now handled by the initial array check
            // case 'multi': ... 
            default:
                console.warn(`Unknown action id: ${id}`);
        }
        // For actions that don't manage their own UI updates (like advanceTime does)
        updateUI();
    }

    function displayLocationInfo(locationName) {
        const location = gameData.maps[gameState.currentMap][locationName];
        if (!location) return;

        // 使用 getTimedName 获取并显示地名
        const displayName = getTimedName(location);
        let infoHTML = `<h3>${displayName}</h3>`;

        // 检查是否在建设中
        if (location.construction) {
            const { startYear, duration } = location.construction;
            const endYear = startYear + duration;
            const currentYear = gameState.time.year;

            if (currentYear < startYear) {
                infoHTML += `<p>此地尚未建成。</p>`;
            } else if (currentYear < endYear) {
                infoHTML += `<p>此地正在建设中，预计于 ${endYear} 年完工。</p>`;
            } else {
                infoHTML += `<p>此地的建设已于 ${endYear} 年完成。</p>`;
            }
        }

        // 获取当前年份对应的描述，逻辑已简化
        const descriptionSource = location.description || '';
        infoHTML += `<p>${getRandomText(descriptionSource)}</p>`;

        DOMElements.locationInfo.innerHTML = infoHTML;

        DOMElements.localActions.innerHTML = '';

        // 只有当玩家在当前位置时才显示行动选项
        if (locationName === gameState.player.location) {
            if (location.actions && !location.isDestroyed) {
                location.actions.forEach(actionDef => {
                    // FIX: Correctly check the condition against the game state.
                    if (actionDef.condition && !actionDef.condition(gameState)) {
                        return; // Skip this action if condition is not met
                    }
                    const button = document.createElement('button');
                    button.textContent = actionDef.text;
                    button.onclick = () => {
                        executeAction(actionDef.action); // Pass the actual action object/array
                    };
                    DOMElements.localActions.appendChild(button);
                });
            } else if (location.isDestroyed) {
                const p = document.createElement('p');
                p.textContent = "此地已是一片废墟。";
                DOMElements.localActions.appendChild(p);
            }
        } else {
            // 当玩家不在该位置时，显示需要移动到此处的提示
            const p = document.createElement('p');
            p.textContent = "需要先到达此处才能执行行动。";
            DOMElements.localActions.appendChild(p);
        }
    }

    function checkEvents() {
        for (const event of gameData.events) {
            if (event.trigger(gameState)) {
                triggerEvent(event);
                return true;
            }
        }
        return false;
    }

    function checkTimedEvents() {
        gameData.timedEvents.forEach(event => {
            if (!event.triggered && gameState.time.year === event.year && gameState.time.month === event.month) {
                event.action(gameState, gameData);
                event.triggered = true;
                // Re-render everything that might have changed
                updateWorldState();
                updateUI();
            }
        });
    }

    function triggerEvent(event) {
        const scene = event.scenes[gameState.player.identity] || event.scenes['default'];
        if (!scene) return;

        DOMElements.eventPanel.style.display = 'block';
        DOMElements.mainControls.style.display = 'none';
        DOMElements.eventTitle.textContent = event.name;
        DOMElements.eventDescription.textContent = getRandomText(scene.description);

        DOMElements.eventOptions.innerHTML = '';
        scene.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.onclick = () => {
                option.action(gameState);
                DOMElements.mainControls.style.display = 'grid';
                DOMElements.eventPanel.style.display = 'none';
                displayLocationInfo(gameState.player.location);
                updateUI();
            };
            DOMElements.eventOptions.appendChild(button);
        });
    }
    
    function endGame(state, reason) {
        DOMElements.mainControls.style.display = 'none';
        DOMElements.eventPanel.style.display = 'none';

        let finalMessage = "";
        switch (reason) {
            case 'yongjia':
                finalMessage = `永嘉五年，匈奴攻陷洛阳，你身陷乱军之中，未能幸免。在这座燃烧的都城里，你的故事结束了。`;
                break;
            case 'gaopingling_execution':
                finalMessage = `高平陵之变后，你被牵连入狱，最终被当做曹爽余党处死。你的生命，终结于这场残酷的政治清洗。`;
                break;
            case 'gaopingling_killed_resisting':
                finalMessage = `面对抓捕，你试图反抗，但最终寡不敌众，被当场格杀。`;
                break;
            default:
                finalMessage = "游戏结束。";
        }

        log(finalMessage, 'highlight');
        log(`--- 最终结局 ---`, 'highlight');
        log(`身份: ${state.player.identity}`);
        log(`财富: ${state.player.money}`);
        log(`存活至: ${getYearEra(state.time.year)} ${state.time.year}年`);

        // 可以在此根据身份、财富等计算最终得分
        const score = state.player.money + (state.time.year - 220) * 10;
        log(`最终得分: ${score}`);
    }
    
    function updateWorldState() {
        const currentLocations = gameData.maps[gameState.currentMap];
        for (const locKey in currentLocations) {
            const loc = currentLocations[locKey];
            // A location exists if it has no construction info, or if the current year is at or after its construction start year.
            gameState.world[locKey] = !loc.construction || gameState.time.year >= loc.construction.startYear;
        }
        renderMap();
    }

    // 辅助函数：创建一条线
    function createLine(type, start, end, orientation) {
        const line = document.createElement('div');
        line.className = `map-line ${type}-line ${orientation}`;
        
        // 计算位置和尺寸
        const cellWidth = DOMElements.mapGrid.clientWidth / gameData.maps[`${gameState.currentMap}Grid`][1];
        const cellHeight = DOMElements.mapGrid.clientHeight / gameData.maps[`${gameState.currentMap}Grid`][0];
        
        if (orientation === 'horizontal') {
            const left = (start[1] - 1) * cellWidth;
            const top = (start[0] - 1) * cellHeight;
            const width = (end[1] - start[1] + 1) * cellWidth;
            
            line.style.left = `${left}px`;
            line.style.top = `${top}px`;
            line.style.width = `${width}px`;
        } else {
            const left = (start[1] - 1) * cellWidth;
            const top = (start[0] - 1) * cellHeight;
            const height = (end[0] - start[0] + 1) * cellHeight;
            
            line.style.left = `${left}px`;
            line.style.top = `${top}px`;
            line.style.height = `${height}px`;
        }
        
        return line;
    }

    // 渲染地图的函数
    function renderMap() {
        const gridKey = `${gameState.currentMap}Grid`;
        const gridDimensions = gameData.maps[gridKey];
        const currentLocations = gameData.maps[gameState.currentMap];
        
        // 清空地图网格
        DOMElements.mapGrid.innerHTML = '';

        // 设置网格尺寸
        const setGridSize = () => {
            const rows = gridDimensions ? gridDimensions[0] : 10;
            const cols = gridDimensions ? gridDimensions[1] : 8;
            DOMElements.mapGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            DOMElements.mapGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            return { rows, cols };
        };

        // 创建线条元素（墙或路）
        const createLineElement = (location, cellWidth, cellHeight) => {
            const isVertical = location.start[1] === location.end[1];
            const line = document.createElement('div');
            line.className = `map-line ${location.type}-line ${isVertical ? 'vertical' : 'horizontal'}`;

            if (isVertical) {
                // 垂直线
                const column = location.start[1]; // 列号
                const startRow = Math.min(location.start[0], location.end[0]); // 起始行
                const endRow = Math.max(location.start[0], location.end[0]); // 结束行
                
                line.style.left = `${(column - 1) * cellWidth}px`;
                line.style.top = `${(startRow - 1) * cellHeight - (location.offset === 'up' ? cellHeight/2 : 0)}px`;
                line.style.height = `${(endRow - startRow + 1) * cellHeight}px`;
            } else {
                // 水平线
                const row = location.start[0]; // 行号
                const startCol = Math.min(location.start[1], location.end[1]); // 起始列
                const endCol = Math.max(location.start[1], location.end[1]); // 结束列
                
                line.style.top = `${(row - 1) * cellHeight - (location.offset === 'up' ? cellHeight/2 : 0)}px`;
                line.style.left = `${(startCol - 1) * cellWidth}px`;
                line.style.width = `${(endCol - startCol + 1) * cellWidth}px`;
            }

            return line;
        };

        // 创建地点单元格
        const createLocationCell = (key, location) => {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            if (location.type) cell.classList.add(location.type);
            if (location.vertical) cell.classList.add('vertical-text');
            if (location.gridArea) cell.style.gridArea = location.gridArea;
            
            const name = getTimedName(location);
            cell.textContent = name;
            cell.dataset.location = key;

            // 当前位置高亮
            if (key === gameState.player.location) {
                cell.classList.add('current');
            }

            // 建设状态检查
            if (location.construction) {
                const { startYear, duration } = location.construction;
                const currentYear = gameState.time.year;

                if (currentYear < startYear) {
                    // 建筑尚未开始建设，不显示
                    cell.classList.add('not-built');
                    return null; // 返回 null 表示不添加此单元格
                } else if (currentYear < startYear + duration) {
                    // 正在建设中
                    cell.classList.add('under-construction');
                    // 覆盖原有的描述
                    const descriptionText = location.construction.description || '此地正在建设中。';
                    cell.title = descriptionText;
                }
            }

            // 添加点击事件
            if (location.interactive !== false) {
                cell.addEventListener('click', () => {
                    if (!location.interactive || location.type !== 'wall') {
                        // 检查建筑状态
                        if (location.construction) {
                            const { startYear, duration } = location.construction;
                            const currentYear = gameState.time.year;
                            
                            if (currentYear < startYear + duration) {
                                // 建筑还在建设中
                                const displayName = getTimedName(location);
                                const endYear = startYear + duration;
                                DOMElements.locationInfo.innerHTML = `<h3>${displayName}</h3><p>${location.construction.description || '此地正在建设中。'}<br>预计于${endYear}年完工。</p>`;
                                DOMElements.localActions.innerHTML = '<p>此地正在建设中，暂时无法进入。</p>';
                                return;
                            }
                        }

                        // 更新目的地选择
                        DOMElements.destinationSelect.value = key;
                        // 更新行程信息
                        updateTravelInfo();
                        // 显示地点信息，但不显示行动选项
                        const displayName = getTimedName(location);
                        const descriptionText = getRandomText(location.description || '');
                        DOMElements.locationInfo.innerHTML = `<h3>${displayName}</h3><p>${descriptionText}</p>`;
                        // 如果不是当前位置，清空行动选项
                        if (key !== gameState.player.location) {
                            DOMElements.localActions.innerHTML = '<p>需要先到达此处才能执行行动。</p>';
                        }
                    }
                });
            }

            return cell;
        };

        // 主渲染逻辑
        if (gridDimensions) {
            const { rows, cols } = setGridSize();
            const cellWidth = DOMElements.mapGrid.clientWidth / cols;
            const cellHeight = DOMElements.mapGrid.clientHeight / rows;

            // 渲染墙和道路
            Object.entries(currentLocations)
                .filter(([_, loc]) => (loc.type === 'wall' || loc.type === 'road') && loc.start && loc.end)
                .forEach(([_, location]) => {
                    DOMElements.mapGrid.appendChild(createLineElement(location, cellWidth, cellHeight));
                });

            // 渲染其他地点
            Object.entries(currentLocations)
                .filter(([_, loc]) => loc.type !== 'wall' && loc.type !== 'road' && !loc.start)
                .forEach(([key, location]) => {
                    const cell = createLocationCell(key, location);
                    if (cell) { // 只有当cell不为null时才添加
                        DOMElements.mapGrid.appendChild(cell);
                    }
                });
        } else {
            // Fallback to default if not defined
            setGridSize();
        }
        updateMapHighlight();
    }

    function updateMapHighlight() {
        document.querySelectorAll('.map-cell').forEach(cell => {
            cell.classList.remove('current');
            // 修复：使用 dataset.location (内部ID) 进行比较，而不是 textContent (显示名称)
            if (cell.dataset.location === gameState.player.location) {
                cell.classList.add('current');
            }
        });
    }

    function updateDestinationSelect() {
        DOMElements.destinationSelect.innerHTML = '';
        const currentMapData = gameData.maps[gameState.currentMap];
        for (const locationName in currentMapData) {
            if (locationName !== gameState.player.location) {
                const location = currentMapData[locationName];
                const option = document.createElement('option');
                option.value = locationName;
                // 使用 getTimedName
                option.textContent = getTimedName(location);
                DOMElements.destinationSelect.appendChild(option);
            }
        }
        updateTravelInfo();
    }
    
    function updateTravelInfo() {
        const destination = DOMElements.destinationSelect.value;
        const transport = DOMElements.transportSelect.value;
        if (destination) {
            const locationObject = gameData.maps[gameState.currentMap][destination];
            const displayName = getTimedName(locationObject);
            const travelTimeInKe = calculateTravelTime(gameState.player.location, destination, transport);
            const hours = Math.floor(travelTimeInKe / 8);
            const ke = travelTimeInKe % 8;
            let timeString = "";
            if (hours > 0) timeString += `${hours}个时辰`;
            if (ke > 0) timeString += `${ke}刻`;
            if (timeString === "") timeString = "不到一刻";

            // 修复：使用 displayName 显示目的地名称
            DOMElements.travelInfo.innerHTML = `至 <span class="highlight">${displayName}</span>: 预估行程 <span class="highlight">${timeString}</span>`;
        } else {
            DOMElements.travelInfo.innerHTML = '请选择一个目的地';
        }
    }

    function switchMap(mapName, entryLocation) {
        const oldMap = gameState.currentMap;
        gameState.currentMap = mapName;
        
        const mapDisplayName = {
            luoyang: '洛阳城',
            palace: '宫城',
            harem: '北宫',
            garden: '芳林园',
            south:'洛阳城南'
        };

        log(`你进入了 ${mapDisplayName[mapName] || mapName}。`, 'highlight');
        
        if (entryLocation) {
            gameState.player.location = entryLocation;
        } else {
            // Set default entry points for each map
            if (mapName === 'palace') {
                gameState.player.location = '阊阖门';
            } else if (mapName === 'harem') {
                gameState.player.location = '北宫南门';
            } else if (mapName === 'garden') {
                gameState.player.location = '芳林上閤';
            } else {
                gameState.player.location = '住所';
            }
        }

        updateTransportOptions();
        updateWorldState(); // Re-render map and check for existing locations
        updateUI();
        
        // 确保显示正确的地点信息和行动选项
        const newLocation = gameData.maps[mapName][gameState.player.location];
        if (newLocation) {
            displayLocationInfo(gameState.player.location);
        }
    }

    function initGame() {
        // 确保所有DOM元素都已经正确初始化
        if (!DOMElements.timeDisplay || !DOMElements.eventLog || !DOMElements.statIdentity || 
            !DOMElements.statMoney || !DOMElements.statLocation) {
            console.error('DOM elements not properly initialized');
            return;
        }

        // 初始化游戏状态
        gameState.time.year = 220 + Math.floor(Math.random() * 91);
        gameState.time.month = 1;
        gameState.time.day = 1;
        gameState.time.shichen_index = 4; // 从辰时开始
        gameState.time.ke = 0;

        const randomIdentity = gameData.identities[Math.floor(Math.random() * gameData.identities.length)];
        gameState.player.identity = randomIdentity.name;
        gameState.player.money = randomIdentity.money;
        gameState.player.location = '住所';

        // 确保事件日志是空的并且可以正常工作
        DOMElements.eventLog.textContent = '';
        // 先记录游戏开始信息
        log(`游戏开始。你的身份是 ${gameState.player.identity}。`, 'highlight');
        log(`当前是 ${getYearEra(gameState.time.year)} ${gameState.time.year}年。`);

        // 更新界面显示
        DOMElements.timeDisplay.innerHTML = `${getYearEra(gameState.time.year)} ${gameState.time.year}年 ${gameState.time.month}月${gameState.time.day}日 <span class="highlight">${gameData.shichen[gameState.time.shichen_index]}时${gameState.time.ke}刻</span>`;
        DOMElements.statIdentity.textContent = gameState.player.identity;
        DOMElements.statMoney.textContent = gameState.player.money;
        DOMElements.statLocation.textContent = getTimedName(gameData.maps[gameState.currentMap][gameState.player.location]);

        // 初始化世界状态
        updateWorldState();
        
        // 更新其他UI组件
        updateTransportOptions();
        updateDestinationSelect();
        updateMapHighlight();
        displayLocationInfo(gameState.player.location);
        
        // 绑定事件处理器
        DOMElements.destinationSelect.onchange = updateTravelInfo;
        DOMElements.transportSelect.onchange = updateTravelInfo;
        DOMElements.travelBtn.onclick = () => {
            const destination = DOMElements.destinationSelect.value;
            if (destination) {
                moveTo(destination);
            }
        };
        DOMElements.passMonthBtn.onclick = () => {
            advanceMonth(1);
        };
    }

    initGame();
});
