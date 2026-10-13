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
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/your-handle" },
  ],
  pages: [
    { label: "About", href: "index.html" },
    { label: "Projects", href: "projects.html" },
    { label: "Resume", href: "resume.html" },
    { label: "AI Lab", href: "ai.html" },
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

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initProjectFilter();
  initPromptAnatomy();
  initCopyButtons();
  document.querySelectorAll("[data-print]").forEach((b) => b.addEventListener("click", () => print()));
});
