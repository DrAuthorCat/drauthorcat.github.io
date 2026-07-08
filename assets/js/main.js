const asset = (name) => `assets/img/${name}`;

const state = {
  left: "main",
  middle: "main",
};

const panels = {
  left: document.getElementById("left-panel"),
  middle: document.getElementById("middle-panel"),
  profile: document.getElementById("profile-panel"),
};

const middleHeader = document.getElementById("middle-header");
const site = document.getElementById("site");

const contentPaths = {
  left: {
    main: "content/left/main.html",
    index: "content/left/index.html",
    fly: "content/left/i-killed-a-fly.html",
    taste: "content/left/the-taste-of-death.html",
    "taste-copy": "content/left/the-taste-of-death-copy.html",
  },
  middle: {
    main: "content/middle/main.html",
    index: "content/middle/index.html",
    "chapter-list": "content/middle/chapter-list.html",
    prologue: "content/middle/prologue.html",
    "chapter-1": "content/middle/chapter-1.html",
    "chapter-2": "content/middle/chapter-2.html",
    "chapter-2-copy": "content/middle/chapter-2-copy.html",
  },
  profile: {
    about: "content/profile/about.html",
  },
};

const hashImages = {
  K3021220477478623751587081271440: ["fly_2.png", "A stitched line drawing of a fly and red thread on lined fabric."],
  I3021202742760424543150448097424: ["fly.png", "A vertical version of the fly artwork."],
  A3021248935104685566648973310096: ["craw.png", "A dark photograph of a small ceramic plate on green fabric."],
  W3021238417970253102253762721936: ["sky.png", "A red and cream artwork titled A Crimson Sky."],
  E3022268535662638498207637223568: ["group.png", "A red embroidered procession of figures."],
  A3022298609297268146521089030288: ["chap1.png", "A red embroidered child sitting inside a bordered landscape."],
  D3022293483205344479668628666512: ["chap2.png", "A red embroidered figure standing before a tall form."],
  Q3022324786297019896649986128016: ["prologue.png", "A red embroidered landscape image."],
};

const hrefRoutes = {
  "left-main": ["left", "main"],
  "left-index": ["left", "index"],
  "left-i-killed-a-fly": ["left", "fly"],
  "left-the-taste-of-death": ["left", "taste"],
  "left-the-taste-of-death-copy": ["left", "taste-copy"],
  "middle-main": ["middle", "main"],
  "middle-index": ["middle", "index"],
  "middle-chapter-list": ["middle", "chapter-list"],
  "middle-prologue": ["middle", "prologue"],
  "middle-chapter-1": ["middle", "chapter-1"],
  "middle-chapter-2": ["middle", "chapter-2"],
  "middle-chapter-2-copy": ["middle", "chapter-2-copy"],
};

const hashRoutes = {
  K3021220477478623751587081271440: ["left", "fly"],
  A3021248935104685566648973310096: ["left", "taste"],
  W3021238417970253102253762721936: ["middle", "chapter-list"],
};

const fragmentCache = new Map();

async function loadFragment(path) {
  if (!fragmentCache.has(path)) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Could not load ${path}: ${response.status}`);
    }
    fragmentCache.set(path, await response.text());
  }
  return fragmentCache.get(path);
}

function setRoute(column, page) {
  if (column === "left" && contentPaths.left[page]) state.left = page;
  if (column === "middle" && contentPaths.middle[page]) state.middle = page;
}

function writeHash() {
  const params = new URLSearchParams();
  if (state.left !== "main") params.set("left", state.left);
  if (state.middle !== "main") params.set("middle", state.middle);
  const next = params.toString();
  history.pushState(null, "", next ? `#${next}` : window.location.pathname);
}

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const left = params.get("left");
  const middle = params.get("middle");

  if (left && contentPaths.left[left]) state.left = left;
  if (middle && contentPaths.middle[middle]) state.middle = middle;
}

function routeAttrs(column, page) {
  return {
    href: "#",
    "data-route-column": column,
    "data-route-page": page,
  };
}

function applyRouteAttrs(element, column, page) {
  const attrs = routeAttrs(column, page);
  Object.entries(attrs).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
}

function routeForLink(anchor, panelName) {
  const href = anchor.getAttribute("href") || "";
  const rel = anchor.getAttribute("rel") || "";

  if (href === "contact-form") {
    anchor.setAttribute("href", "mailto:hello@example.com");
    anchor.removeAttribute("rel");
    return null;
  }

  if (rel === "close-overlay") {
    return panelName === "middle" ? ["middle", "main"] : [panelName, "main"];
  }

  return hrefRoutes[href] || null;
}

function makeMediaElement(mediaItem, panelName) {
  const hash = mediaItem.getAttribute("hash");
  const imageInfo = hashImages[hash] || ["profile.png", "Placeholder image."];
  const route = hrefRoutes[mediaItem.getAttribute("href")] || hashRoutes[hash];
  const isLinked = mediaItem.classList.contains("linked") && route;
  const wrapper = document.createElement(isLinked ? "a" : "span");
  const img = document.createElement("img");

  wrapper.className = `cargo-media ${mediaItem.className}`.trim();
  wrapper.dataset.hash = hash || "";
  wrapper.dataset.panel = panelName;
  if (mediaItem.hasAttribute("grid-span")) {
    wrapper.setAttribute("grid-span", mediaItem.getAttribute("grid-span"));
  }
  if (isLinked) {
    applyRouteAttrs(wrapper, route[0], route[1]);
  }

  img.src = asset(imageInfo[0]);
  img.alt = imageInfo[1];
  wrapper.append(img);
  return wrapper;
}

function hydratePanel(panel, panelName) {
  panel.querySelectorAll("media-item").forEach((mediaItem) => {
    mediaItem.replaceWith(makeMediaElement(mediaItem, panelName));
  });

  panel.querySelectorAll("text-icon").forEach((icon) => {
    const span = document.createElement("span");
    span.className = "menu-icon";
    span.setAttribute("aria-hidden", "true");
    icon.replaceWith(span);
  });

  panel.querySelectorAll("a").forEach((anchor) => {
    if (anchor.hasAttribute("data-route-column")) return;
    const route = routeForLink(anchor, panelName);
    if (!route) return;

    applyRouteAttrs(anchor, route[0], route[1]);
    anchor.removeAttribute("rel");
  });
}

function markPanelSubheader(panel, panelName, page) {
  if (panelName === "profile" || page === "main") return;

  const first = panel.firstElementChild;
  if (!first || first.tagName.toLowerCase() !== "column-set") return;

  first.classList.add("panel-subheader");
}

async function renderPanel(panelName, page, preserveScroll) {
  const panel = panels[panelName];
  const path = panelName === "profile" ? contentPaths.profile.about : contentPaths[panelName][page];
  panel.innerHTML = await loadFragment(path);
  markPanelSubheader(panel, panelName, page);
  hydratePanel(panel, panelName);

  if (!preserveScroll) {
    panel.scrollTop = 0;
  }
}

function renderMiddleHeader() {
  middleHeader.innerHTML = `
    <span>Novel</span>
    <button class="menu-button" type="button" data-route-column="middle" data-route-page="index" aria-label="Open novel index">
      <span class="menu-icon" aria-hidden="true"></span>
    </button>
  `;
}

async function render({ preserveScroll = false } = {}) {
  renderMiddleHeader();
  site.classList.toggle("is-middle-overlay", state.middle !== "main");

  await Promise.all([
    renderPanel("left", state.left, preserveScroll),
    renderPanel("middle", state.middle, preserveScroll),
    renderPanel("profile", "about", preserveScroll),
  ]);
}

async function applyHashState() {
  state.left = "main";
  state.middle = "main";
  parseHash();
  await render();
}

function hasOpenOverlay() {
  return state.left !== "main" || state.middle !== "main";
}

function isInsideOpenOverlay(target) {
  const activeColumns = [];

  if (state.left !== "main") activeColumns.push(document.querySelector('[data-column="left"]'));
  if (state.middle !== "main") activeColumns.push(document.querySelector('[data-column="middle"]'));

  return activeColumns.some((column) => column && column.contains(target));
}

function resetOverlayState() {
  state.left = "main";
  state.middle = "main";
}

async function closeAllOverlays() {
  if (!hasOpenOverlay()) return;

  resetOverlayState();
  writeHash();
  await render();
}

document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-route-column][data-route-page]");

  if (trigger) {
    event.preventDefault();

    if (hasOpenOverlay() && !isInsideOpenOverlay(trigger)) {
      resetOverlayState();
    }

    setRoute(trigger.dataset.routeColumn, trigger.dataset.routePage);
    writeHash();
    await render();
    return;
  }

  if (!hasOpenOverlay() || isInsideOpenOverlay(event.target)) return;

  await closeAllOverlays();
});

window.addEventListener("hashchange", applyHashState);
window.addEventListener("popstate", applyHashState);

parseHash();
render();
