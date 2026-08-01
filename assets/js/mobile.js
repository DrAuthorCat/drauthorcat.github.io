const asset = (name) => `assets/img/${name}`;

const stage = document.getElementById("mobile-stage");
const profileCard = document.getElementById("profile-card");
const drawerCard = document.getElementById("drawer-card");
const detailCard = document.getElementById("detail-card");
const SHOW_CV = false;

const fragmentCache = new Map();
let drawerContentPromise;

const fragments = {
  cv: "content/mobile/cv.html",
  fly: "content/left/i-killed-a-fly.html",
  taste: "content/left/the-taste-of-death.html",
  "taste-copy": "content/left/the-taste-of-death-copy.html",
  prologue: "content/middle/prologue.html",
  "chapter-list": "content/middle/chapter-list.html",
  "chapter-1": "content/middle/chapter-1.html",
  "chapter-2": "content/middle/chapter-2.html",
  "chapter-2-copy": "content/middle/chapter-2-copy.html",
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

const routeMap = {
  "mobile-short-story": "short-story",
  "mobile-novel": "novel",
  "mobile-cv": "cv",
  "left-main": "short-story",
  "left-index": "short-story",
  "left-i-killed-a-fly": "story-fly",
  "left-the-taste-of-death": "story-taste",
  "left-the-taste-of-death-copy": "story-taste-copy",
  "middle-main": "novel",
  "middle-index": "novel",
  "middle-chapter-list": "novel-chapter-list",
  "middle-prologue": "novel-prologue",
  "middle-chapter-1": "novel-chapter-1",
  "middle-chapter-2": "novel-chapter-2",
  "middle-chapter-2-copy": "novel-chapter-2-copy",
};

function profileTemplate() {
  return `
    <div class="profile-grid">
      <img class="profile-image" src="${asset("favicon.png")}" alt="Fly artwork detail." style="max-width: 50px; max-height: 50px; width: auto; height: auto;">
      <div class="profile-copy">
        Josiah Ferrer<br>
        <a href="mailto:hello@example.com">hello@example.com</a><br>
        <a href="https://substack.com/@drdumbcat?r=8ows3l&amp;utm_medium=ios&amp;utm_source=stories&amp;shareImageVariant=image" target="_blank" rel="noreferrer">Substack</a>
        <p>
          Hello, I have been writing stories since I was a kid, and it has been a big part of my life.
          I love sharing and coming up with new and interesting ideas. I mainly enjoy writing fantasy
          and sci-fi, and my first book, <i>A Crimson Sky</i>, is currently in the works. Most of my
          stories tend to lean into the reality of life, the fact that no one is ever safe, and as such,
          most of my characters are never safe. However, I also enjoy stories on the completely opposite
          end of the spectrum, otherworldly and fantastical in nature. I believe a blend makes the best
          type of story.
        </p>
        <p>
          Outside of writing, I am a third-year college student studying applied physics. I have a deep
          interest in and passion for physics, specifically high-energy particle physics. I love learning
          more and attempting to understand what really makes up the world we live in. But like any good
          story, things tend to connect, and my interest in science comes back to my writing. The world
          itself, while the most realistic you can get and even boring at times, is, upon closer inspection,
          home to a fantastical world that makes little to no sense, where everything is uncertain. Where
          entire universes of complex interactions take place on a still table, on the sun, or even in a
          glass of water.
        </p>
        <nav class="mobile-menu" aria-label="Mobile navigation">
          <a href="#short-story" data-mobile-route="short-story">Short Story</a>
          <a href="#novel" data-mobile-route="novel">Novel</a>
          ${SHOW_CV ? '<a href="#cv" data-mobile-route="cv">CV</a>' : ""}
        </nav>
      </div>
    </div>
    <div class="copyright">Copyright &copy; 2026 J. Ferrer. All Rights Reserved</div>
  `;
}

async function loadFragment(name) {
  const path = fragments[name];
  if (!path) throw new Error(`Unknown fragment: ${name}`);

  if (!fragmentCache.has(path)) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}: ${response.status}`);
    fragmentCache.set(path, await response.text());
  }

  return fragmentCache.get(path);
}

async function loadDrawerContent() {
  if (!drawerContentPromise) {
    drawerContentPromise = fetch("content/mobile/drawer-content.json").then((response) => {
      if (!response.ok) throw new Error(`Could not load drawer content: ${response.status}`);
      return response.json();
    });
  }

  return drawerContentPromise;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeRoute(rawRoute) {
  return (rawRoute || "").replace(/^#/, "") || "home";
}

function routeToHash(route) {
  return route === "home" ? location.pathname : `#${route}`;
}

function syncProfileHeight() {
  const height = profileCard.getBoundingClientRect().height;

  if (height > 0) {
    stage.style.setProperty("--profile-card-height", `${Math.ceil(height)}px`);
  }
}

function hasOpenOverlay() {
  const route = normalizeRoute(location.hash);
  return route === "short-story" || route === "novel" || (SHOW_CV && route === "cv") || Boolean(fragmentForRoute(route));
}

function currentOverlayElement() {
  const route = normalizeRoute(location.hash);

  if (route === "short-story" || route === "novel") return drawerCard;
  if ((SHOW_CV && route === "cv") || fragmentForRoute(route)) return detailCard;
  return null;
}

function closeAllOverlays() {
  if (!hasOpenOverlay()) return;

  history.pushState(null, "", routeToHash("home"));
  render();
}

function linkToRoute(anchor, context) {
  const href = anchor.getAttribute("href") || "";
  const rel = anchor.getAttribute("rel") || "";

  if (href === "contact-form") {
    anchor.setAttribute("href", "mailto:hello@example.com");
    anchor.removeAttribute("rel");
    return null;
  }

  if (rel === "home-page") return "home";

  if (rel === "close-overlay") {
    if (context === "story") return "short-story";
    if (context === "novel") return "novel";
    return "home";
  }

  return routeMap[href] || null;
}

function applyRoute(anchor, route) {
  anchor.setAttribute("href", routeToHash(route));
  anchor.setAttribute("data-mobile-route", route);
  anchor.removeAttribute("rel");
}

function makeMediaElement(mediaItem) {
  const hash = mediaItem.getAttribute("hash");
  const imageInfo = hashImages[hash] || ["profile.png", "Placeholder image."];
  const route = routeMap[mediaItem.getAttribute("href")];
  const linked = mediaItem.classList.contains("linked") && route;
  const wrapper = document.createElement(linked ? "a" : "span");
  const img = document.createElement("img");

  wrapper.className = `cargo-media ${mediaItem.className}`.trim();
  if (mediaItem.hasAttribute("grid-span")) {
    wrapper.setAttribute("grid-span", mediaItem.getAttribute("grid-span"));
  }

  if (linked) {
    applyRoute(wrapper, route);
  }

  img.src = asset(imageInfo[0]);
  img.alt = imageInfo[1];
  wrapper.append(img);
  return wrapper;
}

function hydrate(container, context) {
  container.querySelectorAll("media-item").forEach((mediaItem) => {
    mediaItem.replaceWith(makeMediaElement(mediaItem));
  });

  container.querySelectorAll("a").forEach((anchor) => {
    if (anchor.hasAttribute("data-mobile-route")) return;
    const route = linkToRoute(anchor, context);
    if (route) applyRoute(anchor, route);
  });
}

async function drawerTemplate(kind) {
  const isStory = kind === "short-story";
  const content = await loadDrawerContent();
  const drawer = isStory ? content.shortStory : content.novel;

  drawerCard.innerHTML = `
    <header class="drawer-title">
      <span>${escapeHTML(drawer.title)}</span>
    </header>
    <div class="drawer-body">
      ${drawer.items.map((item, index) => drawerItemTemplate(item, index)).join("")}
    </div>
  `;
}

function drawerItemTemplate(item, index) {
  const divider = index === 0 ? "" : "<hr>";

  return `
    ${divider}
    <article class="mobile-drawer-item">
      <a class="cargo-media linked" href="${routeToHash(item.route)}" data-mobile-route="${escapeHTML(item.route)}">
        <img src="${asset(item.image)}" alt="${escapeHTML(item.imageAlt)}">
      </a>
      <column-set class="mobile-drawer-caption" gutter="0.5rem" mobile-gutter="0rem">
        <column-unit slot="0">
          <span class="caption">${escapeHTML(item.title)}<br><br></span>
        </column-unit>
        <column-unit slot="1">
          <span class="caption">
            ${escapeHTML(item.description)}<br><br>
            <a href="${routeToHash(item.route)}" data-mobile-route="${escapeHTML(item.route)}">${escapeHTML(item.linkLabel)}</a>
          </span>
        </column-unit>
      </column-set>
    </article>
  `;
}

function detailContext(route) {
  if (route.startsWith("story-")) return "story";
  if (route === "cv") return "cv";
  return "novel";
}

function fragmentForRoute(route) {
  const detailMap = {
    "story-fly": "fly",
    "story-taste": "taste",
    "story-taste-copy": "taste-copy",
    "novel-prologue": "prologue",
    "novel-chapter-list": "chapter-list",
    "novel-chapter-1": "chapter-1",
    "novel-chapter-2": "chapter-2",
    "novel-chapter-2-copy": "chapter-2-copy",
    cv: SHOW_CV ? "cv" : null,
  };

  return detailMap[route];
}

async function renderDetail(route) {
  const fragmentName = fragmentForRoute(route);
  const html = await loadFragment(fragmentName);
  const context = detailContext(route);

  detailCard.innerHTML = route === "cv"
    ? `<div class="cv-content">${html}</div>`
    : html;

  hydrate(detailCard, context);
}

async function render() {
  const route = normalizeRoute(location.hash);
  profileCard.innerHTML = profileTemplate();
  hydrate(profileCard, "home");
  syncProfileHeight();
  requestAnimationFrame(syncProfileHeight);

  drawerCard.innerHTML = "";
  detailCard.innerHTML = "";

  if (!SHOW_CV && route === "cv") {
    stage.dataset.view = "home";
    return;
  }

  if (route === "short-story" || route === "novel") {
    stage.dataset.view = route;
    await drawerTemplate(route);
    return;
  }

  if (route === "cv" || fragmentForRoute(route)) {
    stage.dataset.view = route === "cv" ? "cv" : "detail";
    await renderDetail(route);
    return;
  }

  stage.dataset.view = "home";
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-mobile-route]");

  if (trigger) {
    event.preventDefault();
    history.pushState(null, "", routeToHash(trigger.dataset.mobileRoute));
    render();
    return;
  }

  const overlay = currentOverlayElement();

  if (!overlay || overlay.contains(event.target)) return;

  closeAllOverlays();
});

window.addEventListener("hashchange", render);
window.addEventListener("popstate", render);
window.addEventListener("resize", syncProfileHeight);

if ("ResizeObserver" in window) {
  new ResizeObserver(syncProfileHeight).observe(profileCard);
}

if (document.fonts) {
  document.fonts.ready.then(syncProfileHeight);
}

render();
