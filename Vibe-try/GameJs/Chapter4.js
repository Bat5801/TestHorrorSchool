class Chapter4 {
    constructor(game) {
        this.game = game;
        this.plotProgress = 0;
        this.escapeTimer = null;
        this.clickCount = 0;
        this.requiredClicks = 15; // 需要点击的次数
        this.clickTimeLimit = 5000; // 点击时间限制(毫秒)
        this.isPuzzleActive = false;
        this.typingInterval = null;
    }

    // 开始第四章
    start(startTime = null) {
        this.game.gameState.currentChapter = 'chapter4';
        this.plotProgress = 0;
        // 初始化游戏时间
        if (startTime) {
            this.updateGameTime(startTime);
        } else {
            this.updateGameTime('23:30'); // 默认起始时间
        }
        // 确保玩家有徽章
        if (!this.game.gameState.inventory.includes('徽章')) {
            this.game.gameState.inventory.push('徽章');
            this.game.updateInventoryDisplay();
        }
        this.loadScene('outsideSchool');
    }

    loadScene(sceneName) {
        this.game.gameState.currentScene = sceneName;
        this.game.updateGameMap(sceneName);
        this.game.elements.gameMap.innerHTML = ''; // 清空地图
        this.game.elements.gameActions.innerHTML = ''; // 清空动作按钮
        this.game.elements.dialogueChoices.innerHTML = ''; // 清空对话选项

        switch (sceneName) {
            case 'outsideSchool':
                this.showOutsideSchoolScene();
                break;
            case 'forestPath':
                this.showForestPathScene();
                break;
            case 'abandonedHouse':
                this.showAbandonedHouseScene();
                break;
            default:
                this.showDialogue('未知场景', [{ text: '返回学校', action: () => this.loadScene('outsideSchool') }]);
        }
    }

    showOutsideSchoolScene() {
        // 创建学校外部场景
        const sceneDescription = document.createElement('div');
        sceneDescription.className = 'scene-description';
        sceneDescription.innerHTML = `
            <p>你终于逃出了学校，但诅咒并没有结束。</p>
            <p>校园外的街道笼罩在一片诡异的黑雾中，路灯闪烁不定，将你的影子拉得很长。</p>
            <p>你摸了摸口袋，那枚徽章还在，散发着微弱的光芒。</p>
        `;
        this.game.elements.gameMap.appendChild(sceneDescription);

        // 添加场景图片 (待添加资源)
        // const sceneImage = document.createElement('img');
        // sceneImage.src = 'assets/img/outside-school.png';
        // sceneImage.alt = '学校外部';
        // sceneImage.className = 'scene-image';
        // this.game.elements.gameMap.appendChild(sceneImage);

        // 播放环境音效
        this.playSound('ambient');

        if (this.plotProgress === 0) {
            this.showDialogue('你站在学校门口，大口喘着气。身后的学校在黑雾中若隐若现，仿佛一只择人而噬的怪物。', [
                { text: '查看周围', action: () => this.examineSurroundings() },
                { text: '尝试联系外界', action: () => this.tryContactOutside() }
            ]);
        }
    }

    examineSurroundings() {
        this.plotProgress = 1;
        this.showDialogue('街道上空无一人，所有的店铺都关门了。不远处的十字路口，似乎有一个模糊的身影在晃动。', [
            { text: '走向十字路口', action: () => this.walkToCrossroad() },
            { text: '留在原地', action: () => this.stayInPlace() }
        ]);
    }

    tryContactOutside() {
        this.plotProgress = 2;
        if (this.game.gameState.inventory.includes('手机')) {
            this.showDialogue('你掏出手机，发现没有信号。屏幕上突然出现一行血红色的字："无处可逃"。', [
                { text: '放弃联系', action: () => this.examineSurroundings() }
            ]);
        } else {
            this.showDialogue('你没有可以联系外界的工具。', [
                { text: '查看周围', action: () => this.examineSurroundings() }
            ]);
        }
    }

    walkToCrossroad() {
        this.plotProgress = 3;
        const friendName = this.getFriendName();
        const pronoun = this.getFriendPronoun('pronoun');
        this.showDialogue(`你慢慢走向十字路口，那个身影越来越清晰。当你走近时，你认出了那个身影——是${friendName}！但${pronoun}的眼睛是空洞的，正缓缓向你走来。`, [
            { text: `呼唤${pronoun}`, action: () => this.callFriend() },
            { text: '转身逃跑', action: () => this.runAway() }
        ]);
    }

    stayInPlace() {
        this.plotProgress = 4;
        this.showDialogue('你决定留在原地，观察周围的情况。黑雾越来越浓，你感到一阵寒意。突然，你听到身后传来脚步声...', [
            { text: '转身查看', action: () => this.turnAround() },
            { text: '撒腿就跑', action: () => this.runAway() }
        ]);
    }

    callFriend() {
        this.plotProgress = 5;
        const friendName = this.getFriendName();
        const pronounObj = this.getFriendPronoun('object');
        const pronounSub = this.getFriendPronoun('subject');
        this.showDialogue(`"${friendName}！是我啊！"你大声呼唤着。但${pronounSub}没有回应，继续向你走来。当${pronounSub}走到你面前时，你发现${pronounSub}的脖子上有一个熟悉的符号——和学校徽章上的一样！`, [
            { text: `尝试唤醒${pronounObj}`, action: () => this.attemptToWakeFriend() },
            { text: '后退躲避', action: () => this.backAway() }
        ]);
    }


    attemptToWakeFriend() {
        this.plotProgress = 6;
        const pronounObj = this.getFriendPronoun('object');
        const pronounSub = this.getFriendPronoun('subject');
        this.showDialogue(`你伸手去碰${pronounObj}的肩膀，${pronounSub}突然抓住你的手，力气大得惊人。${pronounSub}的嘴里发出低沉的声音："和我一起...永远留在这里..."`, [
            { text: '挣脱', action: () => this.startEscapePuzzle() }
        ]);
    }

    startEscapePuzzle() {
        this.isPuzzleActive = true;
        this.clickCount = 0;
        this.game.elements.dialogueChoices.innerHTML = '';

        const puzzleContainer = document.createElement('div');
        puzzleContainer.className = 'escape-puzzle';
        const friendName = this.getFriendName();
        puzzleContainer.innerHTML = `
            <p>你必须快速点击${friendName}的手才能挣脱！</p>
            <p>剩余时间: <span id="escape-timer">5</span>秒</p>
            <p>点击次数: <span id="click-count">0</span>/15</p>
            <button id="escape-button" class="big-button">点击挣脱</button>
        `;
        this.game.elements.dialogueText.appendChild(puzzleContainer);

        const escapeButton = document.getElementById('escape-button');
        const timerDisplay = document.getElementById('escape-timer');
        const countDisplay = document.getElementById('click-count');

        let timeLeft = this.clickTimeLimit / 1000;

        // 更新计时器显示
        timerDisplay.textContent = timeLeft;

        // 设置点击事件
        escapeButton.addEventListener('click', () => {
            if (this.isPuzzleActive) {
                this.clickCount++;
                countDisplay.textContent = this.clickCount;

                // 如果达到所需点击次数，解谜成功
                if (this.clickCount >= this.requiredClicks) {
                    this.escapeSuccess();
                }
            }
        });

        // 启动计时器
        this.escapeTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                // 时间到，解谜失败
                this.escapeFailed();
            }
        }, 1000);
    }

    escapeSuccess() {
        this.isPuzzleActive = false;
        clearInterval(this.escapeTimer);
        this.game.elements.dialogueText.innerHTML = '';

        const friendName = this.getFriendName();
        const pronounSub = this.getFriendPronoun('subject');
        this.showDialogue(`你成功挣脱了${friendName}的束缚！${pronounSub}发出一声尖叫，倒在地上。你趁机转身向森林跑去。`, [
            { text: '逃往森林', action: () => this.loadScene('forestPath') }
        ]);
    }

    escapeFailed() {
        this.isPuzzleActive = false;
        clearInterval(this.escapeTimer);
        this.game.elements.dialogueText.innerHTML = '';

        const friendName = this.getFriendName();
        this.playSound('horror');
        this.game.showDeath(`${friendName}的手紧紧抓住你，你感到一股寒意传遍全身。眼前一黑，你失去了意识...`);
    }

    backAway() {
        this.plotProgress = 7;
        const friendName = this.getFriendName();
        const pronoun = this.getFriendPronoun('subject');
        this.showDialogue(`你慢慢后退，${friendName}继续向你逼近。突然，${pronoun}加快了速度，朝你扑来！`, [
            { text: '转身逃跑', action: () => this.runAway() }
        ]);
    }

    runAway() {
        this.plotProgress = 8;
        this.showDialogue('你转身就跑，不敢回头。你不知道跑了多久，直到你冲进了一片森林。', [
            { text: '继续前进', action: () => this.loadScene('forestPath') }
        ]);
    }

    turnAround() {
        this.plotProgress = 9;
        this.playSound('horror');
        this.showDialogue('你缓缓转身，看到一个穿着黑袍的人站在你身后。他的脸被兜帽遮住，只露出一双闪着红光的眼睛。', [
            { text: '逃跑', action: () => this.runAway() },
            { text: '尝试沟通', action: () => this.tryToCommunicate() }
        ]);
    }

    tryToCommunicate() {
        this.plotProgress = 10;
        this.game.playSound('horror');
        this.showDialogue('"你是谁？想干什么？"你壮着胆子问道。黑袍人没有回答，只是伸出手，指向你的口袋。你意识到他想要徽章...', [
            { text: '交出徽章', action: () => this.giveBadge() },
            { text: '拒绝', action: () => this.refuseToGiveBadge() }
        ]);
    }

    giveBadge() {
        this.plotProgress = 11;
        if (this.game.gameState.inventory.includes('徽章')) {
            // 移除徽章
            this.game.gameState.inventory = this.game.gameState.inventory.filter(item => item !== '徽章');
            this.game.updateInventoryDisplay();

            this.showDialogue('你不情愿地交出徽章。黑袍人接过徽章，发出一阵令人毛骨悚然的笑声。"游戏才刚刚开始..."他说完，消失在黑雾中。', [
                { text: '进入森林', action: () => this.loadScene('forestPath') }
            ]);
        } else {
            this.showDialogue('你没有徽章可以交出。黑袍人似乎很生气，他的眼睛变得更红了...', [
                { text: '逃跑', action: () => this.runAway() }
            ]);
        }
    }

    refuseToGiveBadge() {
        this.plotProgress = 12;
        this.game.playSound('horror');
        this.showDeath('黑袍人发出一声怒吼，黑雾瞬间将你吞噬。你感到一阵剧痛，然后什么都不知道了...');
    }

    showForestPathScene() {
        // 创建森林路径场景
        const sceneDescription = document.createElement('div');
        sceneDescription.className = 'scene-description';
        sceneDescription.innerHTML = `
            <p>你跑进了一片古老的森林，树木高大挺拔，枝叶茂密，几乎遮住了天空。</p>
            <p>月光透过树叶的缝隙洒在地上，形成斑驳的光影。空气中弥漫着潮湿的泥土气息。</p>
            <p>你听到远处传来流水的声音，还有一些奇怪的声音，像是树枝断裂的声音，又像是低语。</p>
        `;
        this.game.elements.gameMap.appendChild(sceneDescription);

        // 添加场景图片 (待添加资源)
        // const sceneImage = document.createElement('img');
        // sceneImage.src = 'assets/img/forest-path.png';
        // sceneImage.alt = '森林路径';
        // sceneImage.className = 'scene-image';
        // this.game.elements.gameMap.appendChild(sceneImage);

        this.showDialogue('你站在森林的入口，不知道该往哪个方向走。这时，你注意到地上有两条明显的路径：一条通向深处，另一条似乎通向河边。', [
            { text: '走深处的路', action: () => this.goDeepIntoForest() },
            { text: '走向河边', action: () => this.goToRiver() }
        ]);
    }

    goDeepIntoForest() {
        this.plotProgress = 13;
        this.showDialogue('你选择了深入森林的路径。树木越来越密集，光线越来越暗。你感到周围的气温正在下降...', [
            { text: '继续前进', action: () => this.continueDeepIntoForest() },
            { text: '返回', action: () => this.loadScene('forestPath') }
        ]);
    }

    goToRiver() {
        this.plotProgress = 14;
        this.showDialogue('你走向河边。流水声越来越清晰，最后你来到了一条清澈的小溪边。溪边有一间破旧的小木屋。', [
            { text: '进入小木屋', action: () => this.loadScene('abandonedHouse') },
            { text: '在河边休息', action: () => this.restByRiver() }
        ]);
    }

    continueDeepIntoForest() {
        this.plotProgress = 15;
        this.game.playSound('horror');
        this.showDialogue('你继续前进，突然，你看到前面有一片空地。空地上有一个古老的祭坛，上面放着一本破旧的书。', [
            { text: '查看祭坛', action: () => this.examineAltar() },
            { text: '离开这里', action: () => this.loadScene('forestPath') }
        ]);
    }

    restByRiver() {
        this.plotProgress = 16;
        this.showDialogue('你在河边坐下，洗了把脸。冰凉的溪水让你精神一振。这时，你注意到水中有什么东西在闪闪发光...', [
            { text: '查看水中', action: () => this.checkWater() },
            { text: '离开', action: () => this.loadScene('forestPath') }
        ]);
    }

    examineAltar() {
        this.plotProgress = 17;
        this.showDialogue('你走到祭坛前，查看那本破旧的书。书的封面写着"校史秘录"四个字。你翻开书，发现里面记载着学校的黑暗历史...', [
            { text: '继续阅读', action: () => this.readBook() },
            { text: '合上书本', action: () => this.loadScene('forestPath') }
        ]);
    }

    checkWater() {
        this.plotProgress = 18;
        this.showDialogue('你伸手到水中，捞出一个闪闪发光的物体。是一枚戒指，上面刻着和徽章相同的符号。', [
            { text: '拿起戒指', action: () => this.takeRing() },
            { text: '放回水中', action: () => this.loadScene('forestPath') }
        ]);
    }

    readBook() {
        this.plotProgress = 19;
        this.showDialogue('书中记载，学校建于一个古老的墓地之上。为了镇压墓地中的邪灵，学校的创始人使用了一种古老的仪式，但仪式失败了，反而唤醒了更强大的邪灵...', [
            { text: '继续阅读', action: () => this.continueReading() },
            { text: '合上书本', action: () => this.loadScene('forestPath') }
        ]);
    }

    takeRing() {
        this.plotProgress = 20;
        if (!this.game.gameState.inventory.includes('刻痕戒指')) {
            this.game.gameState.inventory.push('刻痕戒指');
            this.game.updateInventoryDisplay();
        }
        this.showDialogue('你拿起戒指，戴在手上。戒指突然发出一阵强光，你感到一股力量涌入体内。', [
            { text: '进入小木屋', action: () => this.loadScene('abandonedHouse') }
        ]);
    }

    continueReading() {
        this.plotProgress = 21;
        this.showDialogue('书中还提到，唯一能彻底消灭邪灵的方法是找到四件神器：火焰、水、生命和黑暗。这四件神器分别藏在学校的四个角落...', [
            { text: '继续阅读', action: () => this.readMore() },
            { text: '合上书本', action: () => this.loadScene('forestPath') }
        ]);
    }

    readMore() {
        this.plotProgress = 22;
        this.showDialogue('...但黑暗神器已经失踪了几百年。有人说它被带到了森林里，也有人说它被埋在了学校的地下...', [
            { text: '合上书本', action: () => this.loadScene('forestPath') }
        ]);
    }

    showAbandonedHouseScene() {
        // 创建废弃小木屋场景
        const sceneDescription = document.createElement('div');
        sceneDescription.className = 'scene-description';
        sceneDescription.innerHTML = `
            <p>你走进小木屋，里面布满了灰尘和蜘蛛网。家具都很破旧，似乎已经很久没有人住了。</p>
            <p>墙上挂着一幅褪色的画像，画中是一个穿着古装的女人，她的眼睛空洞洞的，仿佛在注视着你。</p>
            <p>屋子中央有一张桌子，上面放着一盏油灯和一本日记。</p>
        `;
        this.game.elements.gameMap.appendChild(sceneDescription);

        // 添加场景图片 (待添加资源)
        // const sceneImage = document.createElement('img');
        // sceneImage.src = 'assets/img/abandoned-house.png';
        // sceneImage.alt = '废弃小木屋';
        // sceneImage.className = 'scene-image';
        // this.game.elements.gameMap.appendChild(sceneImage);

        this.showDialogue('你站在小木屋中央，不知道该先查看什么。', [
            { text: '查看日记', action: () => this.readDiary() },
            { text: '查看画像', action: () => this.examinePortrait() },
            { text: '离开', action: () => this.loadScene('forestPath') }
        ]);
    }

    readDiary() {
        this.plotProgress = 23;
        this.showDialogue('你拿起桌上的日记，翻开第一页。字迹已经有些模糊，但仍能辨认："我知道他们在做什么。他们用学生的血来喂养那个东西..."', [
            { text: '继续阅读', action: () => this.continueReadingDiary() },
            { text: '放下日记', action: () => this.loadScene('abandonedHouse') }
        ]);
    }

    examinePortrait() {
        this.plotProgress = 24;
        this.showDialogue('你走近画像，仔细观察。画中女人的眼睛似乎在跟着你移动。突然，画像开始渗出鲜血...', [
            { text: '触摸画像', action: () => this.touchPortrait() },
            { text: '后退', action: () => this.loadScene('abandonedHouse') }
        ]);
    }

    continueReadingDiary() {
        this.plotProgress = 25;
        this.showDialogue('"那个东西越来越强大了。我必须找到黑暗神器，否则一切都晚了..."日记到这里就结束了，后面的 pages 都被撕毁了。', [
            { text: '放下日记', action: () => this.loadScene('abandonedHouse') }
        ]);
    }

    touchPortrait() {
        this.plotProgress = 26;
        this.playSound('horror');
        this.showDialogue('你触摸画像，画像上的鲜血突然变得滚烫。画中女人的眼睛里流出更多的血，她的嘴开始动，似乎在说着什么...', [
            { text: '仔细倾听', action: () => this.listenToPortrait() },
            { text: '远离画像', action: () => this.loadScene('abandonedHouse') }
        ]);
    }

    listenToPortrait() {
        this.plotProgress = 27;
        this.showDialogue('你凑近画像，听到一个微弱的声音："救我...黑暗...神器...在...墓地..."', [
            { text: '离开小木屋', action: () => this.loadScene('forestPath') }
        ]);
    }

    // 播放音效
    playSound(soundName) {
        try {
            if (soundName === 'ding' && this.game.horrorDing) {
                this.game.horrorDing.currentTime = 0;
                this.game.horrorDing.play().catch(e => console.log('音效播放失败:', e));
            } else if (soundName === 'horror' && this.game.horrorUp) {
                this.game.horrorUp.currentTime = 0;
                this.game.horrorUp.play().catch(e => console.log('音效播放失败:', e));
            } else if (soundName === 'ambient' && this.game.ambientSound) {
                this.game.ambientSound.currentTime = 0;
                this.game.ambientSound.play().catch(e => console.log('音效播放失败:', e));
            }
        } catch (error) {
            console.log('音效播放错误:', error);
        }
    }

    // 根据玩家性别获取朋友的正确代词
    getFriendPronoun(type) {
        // 检查是否为非正常性别
        const abnormalGenders = ['沃尔玛购物袋', '武装直升机'];
        if (abnormalGenders.includes(this.game.gameState.playerGender)) {
            return '它';
        }

        const isMale = this.game.gameState.playerGender === 'male';
        switch (type) {
            case 'subject': // 主格 (他/她)
                return isMale ? '他' : '她';
            case 'object': // 宾格 (他/她)
                return isMale ? '他' : '她';
            case 'possessive': // 所有格 (他的/她的)
                return isMale ? '他的' : '她的';
            case 'pronoun': // 代词 (他/她)
                return isMale ? '他' : '她';
            default:
                return isMale ? '他' : '她';
        }
    }

    // 根据玩家性别获取朋友名字
    getFriendName() {
        const abnormalGenders = ['沃尔玛购物袋', '武装直升机'];
        if (abnormalGenders.includes(this.game.gameState.playerGender)) {
            return Math.random() < 0.5 ? '汪汪' : '喵喵';
        }
        return this.game.gameState.playerGender === "male" ? "张伟" : "李娜";
    }

    // 更新游戏时间
    updateGameTime(time) {
        this.game.gameState.gameTime = time;
        this.game.elements.currentTimeDisplay.textContent = time;
    }

    // 打字机效果显示对话
    showDialogue(text, choices) {
        // 直接使用游戏对象的showDialogue方法
        this.game.showDialogue(text, choices);
    }
}

// 导出Chapter4类到window对象
window.Chapter4 = Chapter4;