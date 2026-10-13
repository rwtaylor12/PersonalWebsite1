/* ==========================================================================
   EASTER EGG: Owen & Reid
   Two cartoon dinosaurs who sometimes pop up and offer a visitor a quote,
   riddle, song or photo. Content lives in js/dino-content.js.

   Secrets: type "rawr" anywhere to summon them, or add ?dinos to a page URL.
   ========================================================================== */
(() => {
  const CHANCE = 0.4;            // chance they appear on any page view
  const DELAY = [5, 12];         // seconds before they appear (random in this range)
  const MAX_PER_VISIT = 3;       // most appearances per browser session
  const QUIET_AFTER_NOS = 2;     // stop popping up after this many "No"s

  const COLORS = {
    owen: { body: "#f28c28", dark: "#c9640a", belly: "#ffd9ad" },
    reid: { body: "#3b82f6", dark: "#1f5fcf", belly: "#c7dcff" },
  };
  const ASK = {
    quotes: "Want a quote to chew on?",
    riddles: "Want a riddle? Bet you can't solve it.",
    songs: "Want a song to listen to?",
    photos: "Want to see a photo?",
  };
  const NOUN = { quotes: "quote", riddles: "riddle", songs: "song", photos: "photo" };
  const INSTEAD = {
    quotes: "Okay, how about a quote instead?",
    riddles: "How about a riddle? They're tricky.",
    songs: "How about a song suggestion?",
    photos: "Want to see a photo instead?",
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

  /* ---------- Remember what happened this visit ---------- */
  const STORE = "owen-reid";
  const memory = (() => {
    try { return JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch { return {}; }
  })();
  const remember = (changes) => {
    Object.assign(memory, changes);
    try { sessionStorage.setItem(STORE, JSON.stringify(memory)); } catch { /* storage unavailable */ }
  };

  function categories() {
    const c = window.DINO_CONTENT || {};
    return Object.keys(ASK).filter((k) => Array.isArray(c[k]) && c[k].length);
  }

  /* ---------- The dinosaurs (inline SVG) ---------- */
  function dinoSvg(name) {
    const c = COLORS[name];
    return `<svg class="dino dino-${name}" viewBox="0 0 120 110" aria-hidden="true">
      <path d="M38 78 Q10 84 2 64 Q16 74 36 66 Z" fill="${c.body}"/>
      <path d="M44 52 l5-11 5 10 M55 47 l5-11 5 10 M66 45 l5-11 4 11" fill="${c.dark}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="40" y="92" width="11" height="16" rx="5" fill="${c.dark}"/>
      <rect x="62" y="92" width="11" height="16" rx="5" fill="${c.dark}"/>
      <ellipse cx="56" cy="76" rx="27" ry="24" fill="${c.body}"/>
      <ellipse cx="60" cy="81" rx="15" ry="15" fill="${c.belly}"/>
      <path d="M76 74 q9 1 10 7" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="80" cy="42" rx="27" ry="21" fill="${c.body}"/>
      <circle cx="96" cy="46" r="1.8" fill="${c.dark}"/>
      <circle cx="74" cy="50" r="4.5" fill="#ff8fa3" opacity=".55"/>
      <g class="dino-eye"><circle cx="84" cy="35" r="7.5" fill="#fff"/><circle cx="86" cy="35.5" r="4" fill="#1b1f24"/><circle cx="87.5" cy="33.8" r="1.4" fill="#fff"/></g>
      <path d="M80 54 q10 7 21-3" stroke="#1b1f24" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  /* ---------- Show / hide ---------- */
  let root = null;
  let chat = null; // { offers: categories in the order they'll be offered, index, introduced }

  function appear(forced) {
    if (root) return;
    const cats = categories();
    if (!cats.length) return;

    chat = { offers: shuffle(cats), index: 0, introduced: new Set() };

    root = document.createElement("div");
    root.className = "dinos";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Owen and Reid, the website dinosaurs");
    root.innerHTML = `
      <div class="dino-bubble">
        <button class="dino-close" type="button" aria-label="Send the dinosaurs away">×</button>
        <p class="dino-name"></p>
        <div class="dino-say" aria-live="polite"></div>
        <div class="dino-actions"></div>
      </div>
      <div class="dino-pair">${dinoSvg("owen")}${dinoSvg("reid")}</div>`;

    // Somewhere random along the bottom of the screen.
    const width = Math.min(344, window.innerWidth - 24);
    const left = 12 + Math.random() * Math.max(0, window.innerWidth - width - 24);
    root.style.left = `${Math.round(left)}px`;
    root.style.width = `${width}px`;
    document.body.append(root);

    root.querySelector(".dino-close").addEventListener("click", leave);
    root.addEventListener("keydown", (e) => { if (e.key === "Escape") leave(); });

    ask(Math.random() < 0.5 ? "owen" : "reid");
    requestAnimationFrame(() => root.classList.add("is-in"));
    if (!forced) remember({ shown: (memory.shown || 0) + 1 });
  }

  function leave() {
    if (!root) return;
    const el = root;
    root = null;
    el.classList.remove("is-in");
    el.classList.add("is-out");
    setTimeout(() => el.remove(), reduceMotion ? 0 : 600);
  }

  /* ---------- Conversation ---------- */
  function say(text) { root.querySelector(".dino-say").replaceChildren(...[].concat(text)); }
  function buttons(list) {
    root.querySelector(".dino-actions").replaceChildren(...list.map(([label, fn, ghost]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = ghost ? "dino-btn ghost" : "dino-btn";
      b.textContent = label;
      b.addEventListener("click", fn);
      return b;
    }));
    root.querySelector(".dino-actions button")?.focus({ preventScroll: true });
  }
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };

  // One dino offers the current category. "Something else" hands over to the other dino.
  function ask(speaker) {
    const category = chat.offers[chat.index];
    const name = speaker === "owen" ? "Owen" : "Reid";
    root.classList.remove("speaker-owen", "speaker-reid");
    root.classList.add(`speaker-${speaker}`);
    root.querySelector(".dino-name").textContent = name;

    let line;
    if (!chat.introduced.size) line = `${speaker === "owen" ? "Rawr! I'm Owen." : "Hi! I'm Reid."} ${ASK[category]}`;
    else if (!chat.introduced.has(speaker)) line = `My turn! I'm ${name}. ${INSTEAD[category]}`;
    else line = INSTEAD[category];
    chat.introduced.add(speaker);
    say(el("p", line));

    const other = speaker === "owen" ? "reid" : "owen";
    const choices = [["Yes!", () => give(category, speaker)]];
    if (chat.offers.length > 1) {
      choices.push(["Something else", () => {
        chat.index = (chat.index + 1) % chat.offers.length;
        ask(other);
      }, true]);
    }
    choices.push(["No thanks", () => {
      remember({ nos: (memory.nos || 0) + 1 });
      say(el("p", "No problem. Rawr! See you around."));
      buttons([]);
      setTimeout(leave, 1600);
    }, true]);
    buttons(choices);
  }

  function give(category, speaker) {
    // Never repeat the item shown just before in this category.
    const list = window.DINO_CONTENT[category];
    const fresh = list.filter((x) => x !== chat.last?.[category]);
    const item = pick(fresh.length ? fresh : list);
    chat.last = { ...chat.last, [category]: item };
    const parts = [];
    if (category === "quotes") {
      parts.push(el("blockquote", `“${item.text}”`, "dino-quote"));
      if (item.by) parts.push(el("p", `— ${item.by}`, "dino-meta"));
    } else if (category === "riddles") {
      parts.push(el("p", item.q, "dino-riddle"));
      const answer = el("p", item.a, "dino-answer");
      answer.hidden = true;
      const reveal = el("button", "Show answer", "dino-link");
      reveal.type = "button";
      reveal.addEventListener("click", () => { answer.hidden = false; reveal.remove(); });
      parts.push(reveal, answer);
    } else if (category === "songs") {
      parts.push(el("p", "Try this one:", "dino-meta"));
      const a = el("a", `${item.title}${item.artist ? ` — ${item.artist}` : ""}`, "dino-media");
      a.href = item.url; a.target = "_blank"; a.rel = "noopener";
      parts.push(a);
    } else if (category === "photos") {
      const img = el("img", "", "dino-photo");
      img.src = item.src; img.alt = item.caption || "A photo from Ryan";
      parts.push(img);
      if (item.caption) parts.push(el("p", item.caption, "dino-meta"));
    }
    say(parts);
    const choices = [];
    if (window.DINO_CONTENT[category].length > 1) choices.push([`Another ${NOUN[category]}`, () => give(category, speaker)]);
    if (chat.offers.length > 1) {
      choices.push(["Something else", () => {
        chat.index = (chat.index + 1) % chat.offers.length;
        ask(speaker === "owen" ? "reid" : "owen");
      }, !!choices.length]);
    }
    choices.push(["Bye!", leave, true]);
    buttons(choices);
  }

  /* ---------- When to show up ---------- */
  function maybeAppear() {
    const forced = new URLSearchParams(location.search).has("dinos");
    if (forced) return setTimeout(() => appear(true), 800);
    if ((memory.shown || 0) >= MAX_PER_VISIT || (memory.nos || 0) >= QUIET_AFTER_NOS) return;
    if (Math.random() > CHANCE) return;
    const wait = (DELAY[0] + Math.random() * (DELAY[1] - DELAY[0])) * 1000;
    setTimeout(() => appear(false), wait);
  }

  // Secret summon: type "rawr" anywhere (except while typing in a form field).
  let typed = "";
  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, select, [contenteditable]") || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "rawr") { typed = ""; appear(true); }
  });

  maybeAppear();
})();
