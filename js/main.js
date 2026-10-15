/* ==========================================================================
   SITE CONFIG — edit this block to personalise the whole site.
   The header and footer on every page are built from these values.
   ========================================================================== */
const SITE = {
  name: "Ryan W Taylor",
  initials: "RWT",
  email: "wryan.taylor12@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/rwtaylor12" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/rwt12" },
  ],
  pages: [
    { label: "About", href: "index.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Resume", href: "resume.html" },
    { label: "AI Lab", href: "ai.html" },
    { label: "Say hello", href: "contact.html" },
  ],
};

/* ---------- Theme (light / dark) ---------- */
function getStoredTheme() {
  try { return localStorage.getItem("theme"); } catch { return null; }
}
function applyTheme(theme) {
  if (theme) document.documentElement.setAttribute("data-theme", theme);
  else document.documentElement.removeAttribute("data-theme");
}
applyTheme(getStoredTheme());

function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
}

/* ---------- Header & footer ---------- */
function renderHeader() {
  const here = location.pathname.split("/").pop() || "index.html";
  const nav = SITE.pages
    .map(
      (p) =>
        `<a href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.label}</a>`
    )
    .join("");

  document.getElementById("site-header").innerHTML = `
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="${SITE.name} — home">
        <span class="brand-mark">${SITE.initials}</span>
        <span class="brand-name">${SITE.name}</span>
      </a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="site-nav">${nav}
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode">◐</button>
      </nav>
    </div>`;

  document.querySelector(".theme-toggle").addEventListener("click", toggleTheme);
  const menuBtn = document.querySelector(".menu-toggle");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

function renderFooter() {
  const links = SITE.links
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
    .join("");
  document.getElementById("site-footer").innerHTML = `
    <div class="container footer-inner">
      <p>© ${new Date().getFullYear()} ${SITE.name} · Built with plain HTML, CSS &amp; a lot of prompting.</p>
      <p class="footer-links"><a href="mailto:${SITE.email}">Email</a>${links}</p>
    </div>`;
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");

/* ---------- Home: rotating banner images ---------- */
const BANNER_SECONDS = 6;

function initBanner() {
  const root = document.querySelector("[data-banner]");
  if (!root) return;
  // Each <img> becomes a slide: the whole photo, plus a blurred copy filling the space behind it.
  const slides = [...root.querySelectorAll(".banner-slides img")].map((img) => {
    const slide = document.createElement("div");
    slide.className = "banner-slide";
    const backdrop = img.cloneNode();
    backdrop.className = "banner-backdrop";
    img.classList.add("banner-photo");
    img.replaceWith(slide);
    slide.append(backdrop, img);
    return slide;
  });
  if (!slides.length) return;
  const dots = root.querySelector(".banner-dots");
  dots.innerHTML = slides
    .map((_, n) => `<button type="button" role="tab" aria-label="Image ${n + 1}"></button>`)
    .join("");
  const dotBtns = [...dots.children];
  if (slides.length < 2) dots.hidden = true;

  let current = 0;
  let timer;
  const show = (n) => {
    current = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === current));
    dotBtns.forEach((d, k) => d.setAttribute("aria-selected", String(k === current)));
  };
  const start = () => {
    clearInterval(timer);
    if (!reduceMotion && slides.length > 1) timer = setInterval(() => show(current + 1), BANNER_SECONDS * 1000);
  };

  dots.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    show(dotBtns.indexOf(btn));
    start();
  });
  show(0);
  start();
}

/* ---------- Home: about-me rolodex ---------- */
const ROLODEX_SECONDS = 3;

function initRolodex() {
  const root = document.querySelector("[data-rolodex]");
  if (!root) return;
  const cards = [...root.querySelectorAll(".rolodex-cards li")];
  if (!cards.length) return;
  const count = root.querySelector(".rolodex-count");

  let current = 0;
  let timer;
  const show = (n) => {
    const prev = cards[current];
    current = n % cards.length;
    cards.forEach((c) => c.classList.remove("is-active", "is-leaving"));
    if (prev !== cards[current]) prev.classList.add("is-leaving");
    cards[current].classList.add("is-active");
    count.textContent = `${pad(current + 1)} / ${pad(cards.length)}`;
  };
  const stop = () => clearInterval(timer);
  const start = () => {
    stop();
    if (!reduceMotion) timer = setInterval(() => show(current + 1), ROLODEX_SECONDS * 1000);
  };

  root.querySelector(".rolodex-window").addEventListener("click", () => {
    show(current + 1);
    start();
  });
  // Hold still while someone is reading it.
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  show(0);
  start();
}

/* ---------- Contact page: send the form without leaving the page ---------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const status = form.querySelector("[data-form-status]");
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = "Please fill in your name, a valid email and a message.";
      status.dataset.state = "error";
      form.reportValidity();
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "";
    try {
      const res = await fetch(form.dataset.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === "false") throw new Error(data.message || res.statusText);
      form.reset();
      status.textContent = "Thanks! Your message is on its way.";
      status.dataset.state = "ok";
    } catch {
      status.innerHTML = `Sorry, that didn't send. You can email me directly at <a href="mailto:${SITE.email}">${SITE.email}</a>.`;
      status.dataset.state = "error";
    } finally {
      button.disabled = false;
      button.textContent = "Send message";
    }
  });
}

/* ---------- Projects page: rotating showcase ---------- */
const CAROUSEL_SECONDS = 7;

function initCarousel() {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;
  const slides = [...root.querySelectorAll(".carousel-slide")];
  const dots = root.querySelector(".carousel-dots");
  root.style.setProperty("--carousel-ms", `${CAROUSEL_SECONDS * 1000}ms`);
  dots.innerHTML = slides
    .map((s, n) => `<button type="button" role="tab" aria-label="${s.getAttribute("aria-label") || `Project ${n + 1}`}"></button>`)
    .join("");
  const dotBtns = [...dots.children];

  let current = 0;
  let timer;
  const show = (n) => {
    const prev = slides[current];
    current = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle("is-active", k === current);
      s.classList.toggle("is-leaving", s === prev && k !== current);
      s.inert = k !== current; // keep hidden slides out of tab order
    });
    dotBtns.forEach((d, k) => d.setAttribute("aria-selected", String(k === current)));
  };
  // Restart the active dot's progress bar so it lines up with the timer.
  const restartBar = () => {
    const d = dotBtns[current];
    d.setAttribute("aria-selected", "false");
    void d.offsetWidth;
    d.setAttribute("aria-selected", "true");
  };
  let hovered = false;
  let focused = false;
  const start = () => {
    clearInterval(timer);
    restartBar();
    const paused = hovered || focused || reduceMotion || slides.length < 2;
    root.classList.toggle("is-paused", paused);
    if (!paused) timer = setInterval(() => { show(current + 1); restartBar(); }, CAROUSEL_SECONDS * 1000);
  };
  const go = (n) => { show(n); start(); };

  dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(dotBtns.indexOf(b)); });
  root.querySelector("[data-carousel-prev]").addEventListener("click", () => go(current - 1));
  root.querySelector("[data-carousel-next]").addEventListener("click", () => go(current + 1));
  // Hold still while someone is reading or using it.
  root.addEventListener("mouseenter", () => { hovered = true; start(); });
  root.addEventListener("mouseleave", () => { hovered = false; start(); });
  root.addEventListener("focusin", () => { focused = true; start(); });
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) { focused = false; start(); } });
  // Swipe on touch screens.
  let x0 = null;
  root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  show(0);
  start();
}

/* ---------- Projects page: tag filter ---------- */
function initProjectFilter() {
  const bar = document.querySelector("[data-filter-bar]");
  if (!bar) return;
  const cards = [...document.querySelectorAll("[data-tags]")];
  const tags = new Set(cards.flatMap((c) => c.dataset.tags.split(",").map((t) => t.trim())));

  bar.innerHTML =
    `<button class="chip is-active" data-filter="all">All</button>` +
    [...tags].sort().map((t) => `<button class="chip" data-filter="${t}">${t}</button>`).join("");

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    bar.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      const match = f === "all" || c.dataset.tags.split(",").map((t) => t.trim()).includes(f);
      c.hidden = !match;
    });
  });
}

/* ---------- AI Lab: prompt anatomy explorer ---------- */
function initPromptAnatomy() {
  const root = document.querySelector("[data-anatomy]");
  if (!root) return;
  const explain = root.querySelector("[data-anatomy-explain]");
  root.addEventListener("click", (e) => {
    const part = e.target.closest("[data-part]");
    if (!part) return;
    root.querySelectorAll("[data-part]").forEach((p) => p.classList.toggle("is-active", p === part));
    explain.textContent = part.dataset.note;
  });
}

/* ---------- Copy-to-clipboard buttons ---------- */
function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.getElementById(btn.dataset.copy).innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
      } catch {
        btn.textContent = "Copy failed";
      }
      setTimeout(() => (btn.textContent = "Copy prompt"), 1500);
    });
  });
}

/* ---------- Easter egg: load Owen & Reid on every page ---------- */
function loadDinos() {
  for (const src of ["js/dino-content.js", "js/dinos.js"]) {
    const s = document.createElement("script");
    s.src = src;
    s.async = false; // keep order: content first, then the dinosaurs
    document.body.append(s);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDinos();
  renderHeader();
  renderFooter();
  initBanner();
  initRolodex();
  initContactForm();
  initCarousel();
  initProjectFilter();
  initPromptAnatomy();
  initCopyButtons();
});
