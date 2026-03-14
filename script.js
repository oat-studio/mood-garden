/**
 * ==========================================
 * 🌿 Mood Garden - 純潔化重構版本 🌿
 * 架構：State (狀態) -> Render (渲染) -> Logic (邏輯) -> Events (事件)
 * ==========================================
 */

const Utils = {
  uid: () => "s_" + Math.random().toString(16).slice(2),
  clamp: (n, a, b) => Math.max(a, Math.min(b, n))
};

const State = {
  draft: {
    emotionName: "", baseEmoji: "", color: "#A67C74", stickers: [],
    eventText: "", qWhy: "", selfTalk: "", randomCard: "" // 🌟 移除了 choice, action, growth，換成 selfTalk
  },
  selectedStickerId: null,

  loveLanguageCards: [
    "💌 肯定的言詞：寫下三個你今天值得被稱讚的地方。",
    "💌 肯定的言詞：對著鏡子微笑，並說一聲「你辛苦了」。",
    "⏰ 精心的時刻：放下手機 15 分鐘，專心發呆或深呼吸。",
    "⏰ 精心的時刻：為自己泡一杯熱茶或咖啡，專注品嚐它的味道。",
    "🎁 接受禮物：買一份平常捨不得吃的高級甜點犒賞自己。",
    "🎁 接受禮物：下班路上，為自己買一束漂亮的花。",
    "🛠️ 服務的行動：把一直沒整理的書桌或小角落清乾淨。",
    "🛠️ 服務的行動：把明天要穿的衣服和包包提前準備好。",
    "👋 身體的接觸：洗一個舒服的熱水澡，感受水流放鬆肌肉。",
    "👋 身體的接觸：睡前用乳液輕輕按摩自己緊繃的小腿和肩膀。"
    // (為了不佔用太多版面，我先放 10 個示意，你原本的 100 個可以直接覆蓋回來)
  ],

  getGarden() { return JSON.parse(localStorage.getItem("garden") || "[]"); },
  saveGarden(entry) {
    const garden = this.getGarden();
    garden.unshift(entry);
    localStorage.setItem("garden", JSON.stringify(garden));
  },
  deleteFromGarden(id) {
    const newGarden = this.getGarden().filter(x => x.id !== id);
    localStorage.setItem("garden", JSON.stringify(newGarden));
  },

  collectDraftFromDOM() {
    this.draft.emotionName = document.getElementById("emotionNameInput")?.value.trim() || "";
    this.draft.baseEmoji = document.getElementById("baseEmojiInput")?.value.trim() || "";
    this.draft.color = document.getElementById("colorPicker")?.value || "#A67C74";
    this.draft.eventText = document.getElementById("eventInput")?.value.trim() || "";
    this.draft.qWhy = document.getElementById("qWhy")?.value.trim() || "";
    this.draft.selfTalk = document.getElementById("selfTalkInput")?.value.trim() || ""; // 🌟 收集「我想對自己說」
  }
};

const Render = {
  createMoodGraphic(baseEmoji, stickers, color, sizePx = 120) {
    const safeBase = baseEmoji || "🧸";
    const scale = sizePx / 200; 
    const stickersHTML = stickers.map(s => {
      const left = s.x * 100; const top = s.y * 100; const scaledSize = s.size * scale;
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

  canvas() {
    const canvasEl = document.getElementById("canvas");
    const baseEl = document.getElementById("baseEmoji");
    if (!canvasEl || !baseEl) return;

    baseEl.textContent = document.getElementById("baseEmojiInput")?.value.trim() || "";
    canvasEl.style.setProperty('--current-color', document.getElementById("colorPicker")?.value || "#A67C74");

    [...canvasEl.querySelectorAll(".sticker")].forEach(el => el.remove());

    State.draft.stickers.forEach(s => {
      const el = document.createElement("div");
      el.className = "sticker" + (s.id === State.selectedStickerId ? " selected" : "");
      el.textContent = s.emoji;
      el.style.fontSize = s.size + "px";
      el.style.left = (s.x * 100) + "%";
      el.style.top = (s.y * 100) + "%";

      const startInteraction = (e) => {
        if (e.cancelable) e.preventDefault();
        State.selectedStickerId = s.id;
        
        [...canvasEl.querySelectorAll(".sticker")].forEach(node => node.classList.remove("selected"));
        el.classList.add("selected");
        
        const slider = document.getElementById("sizeSlider");
        if (slider) slider.value = s.size;

        Logic.startDrag(e, s.id, el); 
      };
      
      el.addEventListener("mousedown", startInteraction);
      el.addEventListener("touchstart", startInteraction, { passive: false });

      canvasEl.appendChild(el);
    });
  },

  companions() {
    const companions = document.querySelectorAll(".floating-companion");
    const html = this.createMoodGraphic(State.draft.baseEmoji, State.draft.stickers, State.draft.color, 80);
    companions.forEach(el => { el.innerHTML = html; el.style.backgroundColor = "transparent"; el.style.boxShadow = "none"; });
  },

  homePreview() {
    const latest = State.getGarden()[0];
    const iconEl = document.getElementById("latestIcon");
    const previewRow = document.querySelector(".previewRow");
    if (!iconEl) return;

    if (!latest) {
      iconEl.innerHTML = "";
      document.getElementById("latestName").textContent = "（還沒有紀錄）";
      document.getElementById("latestTitle").textContent = "你可以從第一階段開始，慢慢來。";
      document.getElementById("latestDate").textContent = "";
      if (previewRow) { previewRow.onclick = null; previewRow.style.cursor = "default"; }
      return;
    }
    iconEl.innerHTML = this.createMoodGraphic(latest.baseEmoji, latest.stickers, latest.color, 52);
    document.getElementById("latestName").textContent = latest.emotionName || "(未命名情緒)";
    document.getElementById("latestDate").textContent = latest.date || "";
    document.getElementById("latestTitle").textContent = latest.eventText?.slice(0, 18) + "…" || "";
    if (previewRow) { previewRow.style.cursor = "pointer"; previewRow.onclick = () => Logic.openModal(latest); }
  },

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
      let randomX, randomY, overlapping = true, attempts = 0;
      while (overlapping && attempts < 50) {
        randomX = Math.floor(Math.random() * 80) + 10;
        randomY = Math.floor(Math.random() * 80) + 10;
        overlapping = false;
        for (let spot of placedSpots) { if (Math.hypot(spot.x - randomX, spot.y - randomY) < 18) overlapping = true; }
        attempts++;
      }
      placedSpots.push({ x: randomX, y: randomY });
      plant.style.left = randomX + "%"; plant.style.top = randomY + "%";
      plant.innerHTML = this.createMoodGraphic(item.baseEmoji, item.stickers, item.color, 80);
      plant.addEventListener("click", () => Logic.openModal(item));
      list.appendChild(plant);
    });
  },

  page(pageId) {
    // 🌟 已經沒有 pageMoveOn 了
    ["pageHome", "pageCalm", "pageUnderstand", "pageUnderstand2"].forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });
    document.getElementById(pageId)?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
};

const Logic = {
  startDrag(e, id, el) { 
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    const s = State.draft.stickers.find(x => x.id === id);
    if (!s) return;

    const onMove = (ev) => {
      if (ev.cancelable) ev.preventDefault(); 
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;

      s.x = Utils.clamp((clientX - rect.left) / rect.width, 0, 1);
      s.y = Utils.clamp((clientY - rect.top) / rect.height, 0, 1);
      
      if (el) {
        el.style.left = (s.x * 100) + "%";
        el.style.top = (s.y * 100) + "%";
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  },

  addSticker() {
    const input = document.getElementById("customStickerInput");
    if (!input.value.trim()) return;
    State.draft.stickers.push({ id: Utils.uid(), emoji: input.value.trim(), x: 0.5, y: 0.5, size: 40 });
    input.value = ""; Render.canvas();
  },

  deleteSticker() {
    if (!State.selectedStickerId) return;
    State.draft.stickers = State.draft.stickers.filter(s => s.id !== State.selectedStickerId);
    State.selectedStickerId = null; Render.canvas();
  },

  drawCard() {
    const cardDiv = document.getElementById("randomActionCard");
    const textP = document.getElementById("randomActionText");
    const btn = document.getElementById("drawCardBtn");
    cardDiv.classList.remove("show");
    setTimeout(() => {
      const card = State.loveLanguageCards[Math.floor(Math.random() * State.loveLanguageCards.length)];
      State.draft.randomCard = card; textP.textContent = card; cardDiv.classList.add("show");
      btn.textContent = "🔄 再抽一張看看";
    }, 50);
  },

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
            if (circle) circle.style.transform = "scale(1)"; return;
          }
        }
        timeLeft = phases[phaseIdx].secs; updateUI();
      }
    }, 1000);
  },

  openModal(item) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modalContent");
    const color = item.color || "#A67C74";
    const modalCard = document.querySelector(".modalCard");
    if (modalCard) { modalCard.style.borderLeftColor = color; modalCard.style.borderLeftWidth = "8px"; modalCard.style.borderLeftStyle = "solid"; }
    
    // 🌟 Modal 顯示內容更新，對應新欄位
    content.innerHTML = `
      <div style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px; font-size: 24px; font-weight: bold;">${item.emotionName || "(未命名)"}</div>
      <div style="color: #666; margin-bottom: 16px;">${item.date}</div>
      <div style="display:flex; justify-content:center; margin-bottom: 20px;">${Render.createMoodGraphic(item.baseEmoji, item.stickers, color, 120)}</div>
      <div>
        <b style="color:${color}; font-size: 18px;">【事實與觸發】</b><br/>
        <b>🧾 紀錄事件：</b><br/>${item.eventText || "無"}<br/><br/>
        <b>🧠 觸發點：</b><br/>${item.qWhy || "無"}<br/><br/>
        <b style="color:${color}; font-size: 18px;">【深對話與陪伴】</b><br/>
        <b>🌿 我想對自己說：</b><br/>${item.selfTalk || "無"}<br/><br/>
        ${item.randomCard ? `<b>💡 抽到的靈感卡：</b><br/>${item.randomCard}` : ""}
      </div>
      <div style="margin-top:20px; text-align:right;"><button id="modalDeleteBtn" class="danger">刪除這筆紀錄</button></div>
    `;
    document.getElementById("modalDeleteBtn").onclick = () => {
      if (confirm("要把這個情緒從花園中移除嗎？")) { State.deleteFromGarden(item.id); Render.gardenList(); Render.homePreview(); modal.classList.add("hidden"); }
    };
    modal.classList.remove("hidden");
  },

  // 🌟 核心存檔功能：支援「階段性儲存」
  finishAndSave(isPartialSave = false) {
    State.collectDraftFromDOM();
    
    if (isPartialSave) {
      // 如果按的是「🌿 先記錄到這」
      if (!State.draft.emotionName && !State.draft.baseEmoji) {
        // 什麼都還沒填，就直接回家
        Render.page("pageHome");
        return;
      }
      // 只要有填名字或表情，就存進花園
      State.saveGarden({ ...State.draft, id: Utils.uid(), date: new Date().toLocaleString("zh-TW") });
      alert("🍃 已為你保留目前的紀錄。先好好休息吧！");
      location.reload();
    } else {
      // 如果按的是「完成，種入花園」
      if (!State.draft.emotionName) return alert("請先幫情緒取個名字喔！🌿"), Render.page("pageUnderstand");
      if (!State.draft.baseEmoji) return alert("請輸入一個主體 emoji！"), Render.page("pageUnderstand");
      
      State.saveGarden({ ...State.draft, id: Utils.uid(), date: new Date().toLocaleString("zh-TW") });
      alert("🍃 成功種下情緒種子，正在你的花園裡發芽🌷"); 
      location.reload();
    }
  }
};

const Events = {
  init() {
    document.getElementById("startFlowBtn")?.addEventListener("click", () => Render.page("pageCalm"));
    document.getElementById("quickAddBtn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    document.getElementById("logoTitle")?.addEventListener("click", () => Render.page("pageHome"));
    
    // 🌟 在冷靜頁面，什麼都沒產生，單純回首頁
    document.getElementById("backHomeFromCalm")?.addEventListener("click", () => {
      Render.page("pageHome");
    });

    // 🌟 在 1/2 跟 2/2 頁面的返回按鈕，綁定為「階段性存檔」
    document.getElementById("backHomeFromUnderstand")?.addEventListener("click", () => Logic.finishAndSave(true));
    document.getElementById("backHomeFromUnderstand2")?.addEventListener("click", () => Logic.finishAndSave(true));

    document.getElementById("backToUnderstand1Btn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    document.getElementById("toUnderstandBtn")?.addEventListener("click", () => Render.page("pageUnderstand"));
    
    document.getElementById("toUnderstand2Btn")?.addEventListener("click", () => {
      State.collectDraftFromDOM();
      if (!State.draft.emotionName) return alert("請先為這份情緒取個專屬的名字喔！🌿");
      if (!State.draft.baseEmoji) return alert("請先輸入一個主體表符（例：🧸 / 🐈‍⬛ / ❤️‍🩹）。");
      Render.companions(); Render.page("pageUnderstand2");
    });
    
    // 最終完成按鈕
    document.getElementById("finishBtn")?.addEventListener("click", () => Logic.finishAndSave(false));

    document.getElementById("startBreathBtn")?.addEventListener("click", () => Logic.startBreath());
    document.getElementById("addStickerToPaletteBtn")?.addEventListener("click", () => Logic.addSticker());
    document.getElementById("deleteStickerBtn")?.addEventListener("click", () => Logic.deleteSticker());
    document.getElementById("drawCardBtn")?.addEventListener("click", () => Logic.drawCard());
    document.getElementById("baseEmojiInput")?.addEventListener("input", () => { State.collectDraftFromDOM(); Render.canvas(); });
    document.getElementById("colorPicker")?.addEventListener("input", () => { State.collectDraftFromDOM(); Render.canvas(); });
    document.getElementById("sizeSlider")?.addEventListener("input", (e) => {
      const s = State.draft.stickers.find(x => x.id === State.selectedStickerId);
      if (s) { s.size = Number(e.target.value); Render.canvas(); }
    });
    document.querySelectorAll('.paletteItem').forEach(item => { item.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', e.target.dataset.emoji)); });
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
          y: Utils.clamp((e.clientY - rect.top) / rect.height, 0, 1), size: 40
        });
        Render.canvas();
      }
    });
    document.getElementById("closeModal")?.addEventListener("click", () => document.getElementById("modal").classList.add("hidden"));
    document.getElementById("modal")?.addEventListener("click", (e) => { if (e.target.id === "modal") document.getElementById("modal").classList.add("hidden"); });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Events.init(); Render.homePreview(); Render.gardenList(); Render.canvas();
});
