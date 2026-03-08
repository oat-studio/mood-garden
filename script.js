/**
 * ==========================================
 * 🌿 Mood Garden - 純潔化重構版本 🌿
 * 架構：State (狀態) -> Render (渲染) -> Logic (邏輯) -> Events (事件)
 * ==========================================
 */

// 工具函式：產生唯一 ID 與 限制數值範圍
const Utils = {
  uid: () => "s_" + Math.random().toString(16).slice(2),
  clamp: (n, a, b) => Math.max(a, Math.min(b, n))
};

// ==========================================
// 1. State (狀態管理與資料層)
// ==========================================
const State = {
  // 當前編輯中的草稿
  draft: {
    emotionName: "",
    baseEmoji: "",
    color: "#A67C74", // 預設色
    stickers: [],     // 格式: { id, emoji, x, y, size } (x,y 為 0~1 的百分比)
    eventText: "",
    qWhy: "",
    choiceText: "",
    actionText: "",
    growthText: "",
    randomCard: ""
  },
  
  selectedStickerId: null,

  // ==========================================
  // 擴充性：愛的五種語言 100 招卡片資料庫
  // ==========================================
  loveLanguageCards: [
    // 💌 肯定的言詞 (Words of Affirmation)：透過正向的語言來肯定與鼓勵自己。
    "💌 肯定的言詞：寫下三個你今天值得被稱讚的地方。",
    "💌 肯定的言詞：對著鏡子微笑，並說一聲「你辛苦了」。",
    "💌 肯定的言詞：原諒自己今天犯下的一個小失誤。",
    "💌 肯定的言詞：找出一件你過去完成並感到驕傲的事，重新肯定自己。",
    "💌 肯定的言詞：用溫柔的語氣，寫一封簡短的信給未來的自己。",
    "💌 肯定的言詞：當腦海出現自我批評時，用一句客觀的陳述替換它。",
    "💌 肯定的言詞：告訴自己：「我的情緒是正常的，我允許自己有這些感受。」",
    "💌 肯定的言詞：列出三個你最喜歡自己的特質或性格。",
    "💌 肯定的言詞：在便利貼上寫下「我足夠好」，貼在常看到的地方。",
    "💌 肯定的言詞：錄下自己唸一段鼓勵的話，放給自己聽。",
    "💌 肯定的言詞：拒絕別人的不合理要求，並在心裡肯定自己保護了界線。",
    "💌 肯定的言詞：把別人對你的稱讚寫下來，建立一個「稱讚資料夾」。",
    "💌 肯定的言詞：告訴自己：「不需要完美，完成就很棒了。」",
    "💌 肯定的言詞：寫下今天發生的一件小確幸，感謝自己去體會它。",
    "💌 肯定的言詞：在心裡對那個受傷的自己說：「我會陪著你。」",
    "💌 肯定的言詞：肯定自己付出的努力，而不是只看最終結果。",
    "💌 肯定的言詞：睡前對自己說：「今天已經盡力了，現在可以安心休息了。」",
    "💌 肯定的言詞：寫下一個你克服過的困難，提醒自己有多堅強。",
    "💌 肯定的言詞：當感到焦慮時，對自己說：「這只是一個情緒，它會過去的。」",
    "💌 肯定的言詞：對自己說出你現在最想從別人口中聽到的那句安慰。",

    // ⏰ 精心的時刻 (Quality Time)：給自己不被打擾、全心全意專注的陪伴時光。
    "⏰ 精心的時刻：放下手機 15 分鐘，專心發呆或深呼吸。",
    "⏰ 精心的時刻：為自己泡一杯熱茶或咖啡，專注品嚐它的味道。",
    "⏰ 精心的時刻：帶自己去一間一直想去的咖啡廳，享受獨處時光。",
    "⏰ 精心的時刻：找一部喜歡的電影，準備好零食，專心享受。",
    "⏰ 精心的時刻：去公園或自然環境散步 20 分鐘，只聽環境音。",
    "⏰ 精心的時刻：閉上眼睛，聆聽一首能讓你平靜下來的純音樂。",
    "⏰ 精心的時刻：花 30 分鐘做一件你真正喜歡、沒有任何目的的愛好。",
    "⏰ 精心的時刻：關掉所有通知，給自己半小時的「數位斷捨離」。",
    "⏰ 精心的時刻：坐在窗邊，花 5 分鐘安靜地觀察天空或雲朵。",
    "⏰ 精心的時刻：進行一次 10 分鐘的靜心冥想。",
    "⏰ 精心的時刻：慢慢地吃一頓飯，細細品嚐每一口食物的層次。",
    "⏰ 精心的時刻：整理以前的照片，給自己一段回憶的美好時光。",
    "⏰ 精心的時刻：什麼都不做，允許自己「浪費」半小時的時間。",
    "⏰ 精心的時刻：找一個舒服的角落，閱讀一本喜歡的書。",
    "⏰ 精心的時刻：畫畫、塗鴉或拼圖，讓大腦進入心流狀態。",
    "⏰ 精心的時刻：提早 30 分鐘起床，享受早晨無人打擾的寧靜。",
    "⏰ 精心的時刻：專注地觀察一株植物或一朵花的紋理。",
    "⏰ 精心的時刻：寫日記，與自己的內心展開一場深度的對話。",
    "⏰ 精心的時刻：點起一顆喜歡的香氛蠟燭，靜靜看著燭火跳動。",
    "⏰ 精心的時刻：安排一個專屬於自己的「週末微旅行」或散步路線。",

    // 🎁 接受禮物 (Receiving Gifts)：給自己實質的獎勵，表達對自己的重視。
    "🎁 接受禮物：買一份平常捨不得吃的高級甜點犒賞自己。",
    "🎁 接受禮物：下班路上，為自己買一束漂亮的花。",
    "🎁 接受禮物：買一本一直想看的新書送給自己。",
    "🎁 接受禮物：升級一件每天都會用到的日常用品（例如：好寫的筆）。",
    "🎁 接受禮物：清空購物車裡那個猶豫很久、但在預算內的小東西。",
    "🎁 接受禮物：為自己點一份最喜歡的外送餐點。",
    "🎁 接受禮物：買一款喜歡的香氛或精油，讓好味道陪伴自己。",
    "🎁 接受禮物：挑選一張有質感的明信片，寫好後寄給自己。",
    "🎁 接受禮物：去文具店買一張可愛的貼紙或一本新筆記本。",
    "🎁 接受禮物：買一杯平常不會點的特別口味手搖飲。",
    "🎁 接受禮物：投資一個能讓自己進步的線上課程或講座。",
    "🎁 接受禮物：為自己挑選一件穿起來自信又舒適的新衣服。",
    "🎁 接受禮物：買一包好的咖啡豆或茶葉，提升早晨的儀式感。",
    "🎁 接受禮物：去超市買喜歡的食材，為自己做一頓豐盛的料理。",
    "🎁 接受禮物：買一個漂亮的水壺，鼓勵自己多喝水。",
    "🎁 接受禮物：送自己一個能提升睡眠品質的眼罩或香氛噴霧。",
    "🎁 接受禮物：買一張喜歡的歌手的實體專輯或周邊小物。",
    "🎁 接受禮物：在二手書店或市集為自己尋寶，買下一件有緣的小物。",
    "🎁 接受禮物：訂閱一個能帶來快樂的服務（例如：串流平台）。",
    "🎁 接受禮物：把零錢存進一個特別的存錢筒，作為未來的「夢想基金」。",

    // 🛠️ 服務的行動 (Acts of Service)：透過實際的行動來照顧自己的生活與健康。
    "🛠️ 服務的行動：把一直沒整理的書桌或小角落清乾淨。",
    "🛠️ 服務的行動：把明天要穿的衣服和包包提前準備好。",
    "🛠️ 服務的行動：預約那個拖了很久的牙醫或健康檢查。",
    "🛠️ 服務的行動：退訂信箱裡那些總是讓你分心的廣告信件。",
    "🛠️ 服務的行動：幫自己換洗乾淨、充滿香氣的床單和枕頭套。",
    "🛠️ 服務的行動：取消一個讓你感到有壓力的聚會，把時間還給自己。",
    "🛠️ 服務的行動：為自己準備明天的健康便當或切好一盒水果。",
    "🛠️ 服務的行動：建立一個自動扣款存錢的機制，照顧未來的財務。",
    "🛠️ 服務的行動：把手機裡積滿的無用截圖和垃圾檔案清空。",
    "🛠️ 服務的行動：洗掉水槽裡堆積的碗盤，讓空間恢復清爽。",
    "🛠️ 服務的行動：寫下本週的代辦事項，並勇敢劃掉不重要的三件事。",
    "🛠️ 服務的行動：為自己倒一大杯溫開水，並定時提醒自己喝完。",
    "🛠️ 服務的行動：整理衣櫃，把不再穿的衣服捐出或回收。",
    "🛠️ 服務的行動：幫自己的電腦桌面分類，換上一個舒壓的背景圖。",
    "🛠️ 服務的行動：找出家裡壞掉的小東西，把它修好或丟掉。",
    "🛠️ 服務的行動：整理錢包，把發票和收據分類收好。",
    "🛠️ 服務的行動：果斷拒絕一件超出自己目前能力範圍的請託。",
    "🛠️ 服務的行動：買好一週的日用品，減少臨時要採買的焦慮。",
    "🛠️ 服務的行動：設定好睡眠模式，讓手機在晚上自動靜音。",
    "🛠️ 服務的行動：幫家裡的植物澆水，修剪枯萎的葉片。",

    // 👋 身體的接觸 (Physical Touch)：透過感官與肢體的放鬆，讓身體感到安全與舒適。
    "👋 身體的接觸：洗一個舒服的熱水澡，感受水流放鬆肌肉。",
    "👋 身體的接觸：睡前用乳液輕輕按摩自己緊繃的小腿和肩膀。",
    "👋 身體的接觸：換上衣櫃裡最柔軟、最親膚的那套睡衣。",
    "👋 身體的接觸：用熱毛巾敷在眼睛或後頸上，停留幾分鐘。",
    "👋 身體的接觸：雙手用力搓熱，然後輕輕覆蓋在臉頰上。",
    "👋 身體的接觸：做 5 分鐘的伸展操，拉開緊繃的背部和肩頸。",
    "👋 身體的接觸：找一張舒服的沙發或床，把自己裹在厚厚的毯子裡。",
    "👋 身體的接觸：赤腳踩在草地或沙灘上，感受大地的觸感。",
    "👋 身體的接觸：慢慢梳頭髮，感受梳子輕輕按摩頭皮的感覺。",
    "👋 身體的接觸：閉上眼，用雙手指腹輕敲頭部，像下雨一樣放鬆頭皮。",
    "👋 身體的接觸：泡個熱水腳，讓全身的血液循環變好。",
    "👋 身體的接觸：給自己塗上護手霜，仔細按摩每一根手指。",
    "👋 身體的接觸：輕拍自己的胸口，跟著心跳的節奏慢慢深呼吸。",
    "👋 身體的接觸：找一個有陽光的地方，讓皮膚感受太陽的溫暖。",
    "👋 身體的接觸：用雙手輕輕揉捏耳朵，刺激穴道放鬆。",
    "👋 身體的接觸：睡覺時抱著一個柔軟的抱枕或絨毛娃娃。",
    "👋 身體的接觸：運動到微微出汗，感受身體鮮活的能量。",
    "👋 身體的接觸：輕輕撫摸寵物（如果有的話），感受毛茸茸的療癒感。",
    "👋 身體的接觸：換上最舒適的襪子，不讓腳底受涼。",
    "👋 身體的接觸：躺平在地板或瑜珈墊上，感受身體的重量完全釋放。"
  ],

  // LocalStorage 操作
  getGarden() {
    return JSON.parse(localStorage.getItem("garden") || "[]");
  },
  saveGarden(entry) {
    const garden = this.getGarden();
    garden.unshift(entry);
    localStorage.setItem("garden", JSON.stringify(garden));
  },
  deleteFromGarden(id) {
    const newGarden = this.getGarden().filter(x => x.id !== id);
    localStorage.setItem("garden", JSON.stringify(newGarden));
  },

  // 從 DOM 收集資料到 Draft
  collectDraftFromDOM() {
    this.draft.emotionName = document.getElementById("emotionNameInput")?.value.trim() || "";
    this.draft.baseEmoji = document.getElementById("baseEmojiInput")?.value.trim() || "";
    this.draft.color = document.getElementById("colorPicker")?.value || "#A67C74";
    this.draft.eventText = document.getElementById("eventInput")?.value.trim() || "";
    this.draft.qWhy = document.getElementById("qWhy")?.value.trim() || "";
    this.draft.choiceText = document.getElementById("choiceInput")?.value.trim() || "";
    this.draft.growthText = document.getElementById("growthText")?.value.trim() || "";
    this.draft.actionText = document.getElementById("actionText")?.value.trim() || "";
  }
};


// ==========================================
// 2. Render Engine (統一渲染引擎)
// ==========================================
const Render = {
  // ⭐️ 核心渲染邏輯：將精靈、花園、預覽圖統一，不再寫重複的 HTML
  createMoodGraphic(baseEmoji, stickers, color, sizePx = 120) {
    const safeBase = baseEmoji || "🧸";
    // 根據容器大小計算縮放比例 (基準值為畫布高度 200px)
    const scale = sizePx / 200; 

    const stickersHTML = stickers.map(s => {
      const left = s.x * 100; // 轉換為百分比
      const top = s.y * 100;
      const scaledSize = s.size * scale; // 貼紙等比縮放
      return `<div style="position:absolute; left:${left}%; top:${top}%; transform:translate(-50%, -50%); font-size:${scaledSize}px; line-height:1; user-select:none;">${s.emoji}</div>`;
    }).join("");

    return `
      <div style="
        width: ${sizePx}px; height: ${sizePx}px;
        background: radial-gradient(circle, ${color}44 0%, transparent 70%);
        border-radius: 50%;
        filter: drop-shadow(0px 8px 16px ${color}66);
        display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden;
      ">
        <div style="font-size:${sizePx * 0.5}px; line-height:1; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">${safeBase}</div>
        ${stickersHTML}
      </div>
    `;
  },

  // 渲染大畫布 (500x200 長方形)
  canvas() {
    const canvasEl = document.getElementById("canvas");
    const baseEl = document.getElementById("baseEmoji");
    if (!canvasEl || !baseEl) return;

    const currentW = canvasEl.offsetWidth || 500;
    const currentH = canvasEl.offsetHeight || 200;

    baseEl.textContent = document.getElementById("baseEmojiInput")?.value.trim() || "";
    // 依據標記色更新畫布光暈
    canvasEl.style.setProperty('--current-color', document.getElementById("colorPicker")?.value || "#A67C74");

    // 清除舊貼紙
    [...canvasEl.querySelectorAll(".sticker")].forEach(el => el.remove());

    State.draft.stickers.forEach(s => {
      const el = document.createElement("div");
      el.className = "sticker" + (s.id === State.selectedStickerId ? " selected" : "");
      el.textContent = s.emoji;
      el.style.fontSize = s.size + "px";
      el.style.left = (s.x * 100) + "%"; // ⭐️ 使用百分比，確保 RWD 縮放不跑位
      el.style.top = (s.y * 100) + "%";

      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        State.selectedStickerId = s.id;
        Render.canvas();
        Logic.startDrag(e, s.id);
      });
      canvasEl.appendChild(el);
    });

    // 同步滑桿
    const slider = document.getElementById("sizeSlider");
    if (slider) {
      const selected = State.draft.stickers.find(x => x.id === State.selectedStickerId);
      slider.value = selected ? selected.size : 40;
    }
  },

  // 渲染右上角陪伴精靈
  companions() {
    const companions = document.querySelectorAll(".floating-companion");
    const html = this.createMoodGraphic(State.draft.baseEmoji, State.draft.stickers, State.draft.color, 80);
    companions.forEach(el => {
      el.innerHTML = html;
      el.style.backgroundColor = "transparent";
      el.style.boxShadow = "none";
    });
  },

  // 渲染首頁近期預覽
  homePreview() {
    const latest = State.getGarden()[0];
    const iconEl = document.getElementById("latestIcon");
    const previewRow = document.querySelector(".previewRow"); // 🌟 抓取整張預覽卡片
    if (!iconEl) return;

    if (!latest) {
      iconEl.innerHTML = "";
      document.getElementById("latestName").textContent = "（還沒有紀錄）";
      document.getElementById("latestTitle").textContent = "你可以從第一階段開始，慢慢來。";
      document.getElementById("latestDate").textContent = "";
      
      // 如果還沒紀錄，拔掉點擊功能
      if (previewRow) {
        previewRow.onclick = null;
        previewRow.style.cursor = "default";
      }
      return;
    }

    iconEl.innerHTML = this.createMoodGraphic(latest.baseEmoji, latest.stickers, latest.color, 52);
    document.getElementById("latestName").textContent = latest.emotionName || "(未命名情緒)";
    document.getElementById("latestDate").textContent = latest.date || "";
    document.getElementById("latestTitle").textContent = latest.eventText?.slice(0, 18) + "…" || "";

    // 🌟 核心新增：綁定點擊事件，讓它呼叫原本寫好的 openModal！
    if (previewRow) {
      previewRow.style.cursor = "pointer"; // 讓滑鼠變成手指
      previewRow.onclick = () => Logic.openModal(latest); // 點擊卡片彈出回顧視窗
    }
  },

  // 渲染隨機花園
  gardenList() {
    const garden = State.getGarden();
    const list = document.getElementById("gardenList");
    if (!list) return;
    list.innerHTML = "";

    const placedSpots = [];
    garden.forEach(item => {
      const plant = document.createElement("div");
      plant.className = "gardenPlant";
      plant.style.position = "absolute";
      plant.style.cursor = "pointer";

      // 防碰撞邏輯
      let randomX, randomY, overlapping = true, attempts = 0;
      while (overlapping && attempts < 50) {
        randomX = Math.floor(Math.random() * 80) + 10;
        randomY = Math.floor(Math.random() * 80) + 10;
        overlapping = false;
        for (let spot of placedSpots) {
          if (Math.hypot(spot.x - randomX, spot.y - randomY) < 18) overlapping = true;
        }
        attempts++;
      }
      placedSpots.push({ x: randomX, y: randomY });

      plant.style.left = randomX + "%";
      plant.style.top = randomY + "%";
      plant.innerHTML = this.createMoodGraphic(item.baseEmoji, item.stickers, item.color, 80);
      plant.addEventListener("click", () => Logic.openModal(item));
      list.appendChild(plant);
    });
  },

  // 切換頁面
  page(pageId) {
    ["pageHome", "pageCalm", "pageUnderstand", "pageUnderstand2", "pageMoveOn"].forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });
    document.getElementById(pageId)?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};


// ==========================================
// 3. Logic (業務邏輯與控制器)
// ==========================================
const Logic = {
  // 拖拽邏輯
  startDrag(e, id) {
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    const s = State.draft.stickers.find(x => x.id === id);
    if (!s) return;

    const onMove = (ev) => {
      s.x = Utils.clamp((ev.clientX - rect.left) / rect.width, 0, 1);
      s.y = Utils.clamp((ev.clientY - rect.top) / rect.height, 0, 1);
      Render.canvas();
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  },

  // 新增貼紙
  addSticker() {
    const input = document.getElementById("customStickerInput");
    if (!input.value.trim()) return;
    State.draft.stickers.push({
      id: Utils.uid(),
      emoji: input.value.trim(),
      x: 0.5, y: 0.5, size: 40
    });
    input.value = "";
    Render.canvas();
  },

  // 刪除選中貼紙
  deleteSticker() {
    if (!State.selectedStickerId) return;
    State.draft.stickers = State.draft.stickers.filter(s => s.id !== State.selectedStickerId);
    State.selectedStickerId = null;
    Render.canvas();
  },

  // 抽卡功能
  drawCard() {
    const cardDiv = document.getElementById("randomActionCard");
    const textP = document.getElementById("randomActionText");
    const btn = document.getElementById("drawCardBtn");
    
    cardDiv.classList.remove("show");
    setTimeout(() => {
      const card = State.loveLanguageCards[Math.floor(Math.random() * State.loveLanguageCards.length)];
      State.draft.randomCard = card;
      textP.textContent = card;
      cardDiv.classList.add("show");
      btn.textContent = "🔄 再抽一張看看";
    }, 50);
  },

  // 呼吸引導
  breathTimer: null,
  startBreath() {
    if (this.breathTimer) clearInterval(this.breathTimer);
    const label = document.getElementById("breathLabel");
    const count = document.getElementById("breathCount");
    const circle = document.getElementById("breathCircle");
    
    const phases = [
      { name: "吸氣", detail: "肚子鼓起來", secs: 4, scale: 1.25 },
      { name: "屏息", detail: "胸口不動", secs: 1, scale: 1.25 },
      { name: "吐氣", detail: "肚子縮回去", secs: 6, scale: 0.95 }
    ];
    let phaseIdx = 0, timeLeft = phases[0].secs, round = 1;

    const updateUI = () => {
      if (label) label.innerHTML = `${phases[phaseIdx].name}<br><span style="font-size:14px; color:#666;">${phases[phaseIdx].detail}</span>`;
      if (count) count.textContent = `${timeLeft}s`;
      if (circle) circle.style.transform = `scale(${phases[phaseIdx].scale})`;
    };

    updateUI();
    this.breathTimer = setInterval(() => {
      timeLeft--;
      if (count) count.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        phaseIdx++;
        if (phaseIdx >= phases.length) {
          phaseIdx = 0; round++;
          if (round > 5) {
            clearInterval(this.breathTimer);
            if (label) label.innerHTML = `完成 ✅<br><span style="font-size:14px; color:#666;">準備好就可以繼續了。</span>`;
            if (count) count.textContent = "—";
            if (circle) circle.style.transform = "scale(1)";
            return;
          }
        }
        timeLeft = phases[phaseIdx].secs;
        updateUI();
      }
    }, 1000);
  },

  // 開啟詳細記錄 Modal
  openModal(item) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");
    const color = item.color || "#A67C74";

    // 🌟 核心修正：動態改變 Modal 卡片的左側邊框顏色！
    const modalCard = document.querySelector(".modalCard");
    if (modalCard) {
      modalCard.style.borderLeftColor = color;
      modalCard.style.borderLeftWidth = "8px"; // 確保邊框夠粗，視覺更明顯
      modalCard.style.borderLeftStyle = "solid";
    }

    content.innerHTML = `
      <div style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px; font-size: 24px; font-weight: bold;">${item.emotionName}</div>
      <div style="color: #666; margin-bottom: 16px;">${item.date}</div>
      <div style="display:flex; justify-content:center; margin-bottom: 20px;">
        ${Render.createMoodGraphic(item.baseEmoji, item.stickers, color, 120)}
      </div>
      <div>
        <b style="color:${color}; font-size: 18px;">【事實與對話】</b><br/>
        <b>🧾紀錄事件：</b><br/>${item.eventText || "無"}<br/><br/>
        <b>🧠觸發點：</b><br/>${item.qWhy || "無"}<br/><br/>
        <b>🌱轉念行動：</b><br/>${item.choiceText || "無"}<br/><br/>
        <b style="color:${color}; font-size: 18px;">【邁步前進】</b><br/>
        <b>📝心靈收穫：</b><br/>${item.growthText || "無"}<br/><br/>
        <b>🚀具體計畫：</b><br/>${item.actionText || "無"}<br/><br/>
        ${item.randomCard ? `<b>💡抽到的行動卡：</b><br/>${item.randomCard}` : ""}
      </div>
      <div style="margin-top:20px; text-align:right;">
        <button id="modalDeleteBtn" class="danger">刪除這筆紀錄</button>
      </div>
    `;

    document.getElementById("modalDeleteBtn").onclick = () => {
      if (confirm("要把這個情緒從花園中移除嗎？")) {
        State.deleteFromGarden(item.id);
        Render.gardenList();
        Render.homePreview();
        modal.classList.add("hidden");
      }
    };
    modal.classList.remove("hidden");
  },

  // 最終存檔
  finishAndSave() {
    State.collectDraftFromDOM();
    if (!State.draft.emotionName) return alert("請先幫情緒取個名字喔！🌿"), Render.page("pageUnderstand");
    if (!State.draft.baseEmoji) return alert("請輸入一個主體 emoji！"), Render.page("pageUnderstand");
    if (!State.draft.eventText) return alert("先寫下『發生了什麼』，一句也可以～ 🌱"), Render.page("pageUnderstand2");

    State.saveGarden({ ...State.draft, id: Utils.uid(), date: new Date().toLocaleString("zh-TW") });
    alert("🍃成功種下情緒種子，正在你的花園裡發芽🌷");
    location.reload();
  }
};


// ==========================================
// 4. Events (事件監聽綁定中心)
// ==========================================
const Events = {
  init() {
    // ---- 導覽按鈕 ----
    document.getElementById("startFlowBtn")?.addEventListener("click", () => Render.page("pageCalm"));
    document.getElementById("quickAddBtn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    document.getElementById("logoTitle")?.addEventListener("click", () => Render.page("pageHome"));
    
    // 返回按鈕
    ["backHomeFromCalm", "backHomeFromUnderstand", "backHomeFromUnderstand2"].forEach(id => {
      document.getElementById(id)?.addEventListener("click", () => {
        State.collectDraftFromDOM();
        Render.page("pageHome");
      });
    });
    document.getElementById("backToUnderstand1Btn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    document.getElementById("backToUnderstandBtn")?.addEventListener("click", () => Render.page("pageUnderstand2"));

    // ---- 階段推進防呆 ----
    document.getElementById("toUnderstandBtn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    
    document.getElementById("toUnderstand2Btn")?.addEventListener("click", () => {
      State.collectDraftFromDOM();
      if (!State.draft.emotionName) return alert("請先為這份情緒取個專屬的名字喔！🌿");
      if (!State.draft.baseEmoji) return alert("請先輸入一個主體表符（例：🧸 / 🐈‍⬛ / ❤️‍🩹）。");
      Render.companions();
      Render.page("pageUnderstand2");
    });

    document.getElementById("toMoveOnBtn")?.addEventListener("click", () => {
      State.collectDraftFromDOM();
      if (!State.draft.eventText) return alert("先寫下『發生了什麼』，一句也可以～ 🌱");
      Render.companions();
      Render.page("pageMoveOn");
    });

    document.getElementById("finishBtn")?.addEventListener("click", () => Logic.finishAndSave());

    // ---- 功能按鈕 ----
    document.getElementById("startBreathBtn")?.addEventListener("click", () => Logic.startBreath());
    document.getElementById("addStickerToPaletteBtn")?.addEventListener("click", () => Logic.addSticker());
    document.getElementById("deleteStickerBtn")?.addEventListener("click", () => Logic.deleteSticker());
    document.getElementById("drawCardBtn")?.addEventListener("click", () => Logic.drawCard());
    
    // 即時更新畫布主體與顏色
    document.getElementById("baseEmojiInput")?.addEventListener("input", () => { State.collectDraftFromDOM(); Render.canvas(); });
    document.getElementById("colorPicker")?.addEventListener("input", () => { State.collectDraftFromDOM(); Render.canvas(); });
    
    // 貼紙大小滑桿
    document.getElementById("sizeSlider")?.addEventListener("input", (e) => {
      const s = State.draft.stickers.find(x => x.id === State.selectedStickerId);
      if (s) { s.size = Number(e.target.value); Render.canvas(); }
    });

    // 元素庫拖拽支援
    document.querySelectorAll('.paletteItem').forEach(item => {
      item.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', e.target.dataset.emoji));
    });
    const canvasEl = document.getElementById("canvas");
    canvasEl?.addEventListener('dragover', e => e.preventDefault());
    canvasEl?.addEventListener('drop', e => {
      e.preventDefault();
      const emoji = e.dataTransfer.getData('text/plain');
      if (emoji) {
        const rect = canvasEl.getBoundingClientRect();
        State.draft.stickers.push({
          id: Utils.uid(), emoji,
          x: Utils.clamp((e.clientX - rect.left) / rect.width, 0, 1),
          y: Utils.clamp((e.clientY - rect.top) / rect.height, 0, 1),
          size: 40
        });
        Render.canvas();
      }
    });

    // Modal 關閉
    document.getElementById("closeModal")?.addEventListener("click", () => document.getElementById("modal").classList.add("hidden"));
    document.getElementById("modal")?.addEventListener("click", (e) => { if (e.target.id === "modal") document.getElementById("modal").classList.add("hidden"); });
  }
};

// ==========================================
// 啟動 App
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  Events.init();
  Render.homePreview();
  Render.gardenList();
  Render.canvas();
});