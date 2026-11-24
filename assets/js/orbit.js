/* The landing hero: young Hadi dancing at the centre of the universe, five
   painted planets orbiting her, all joined by gold threads. When a planet
   passes one of her open hands, a spark leaps from her hand and the planet
   bursts into stars and ripples of light. Touching a planet does the same. */
(function () {
  const stage = document.querySelector(".orbit-stage");
  if (!stage) return;

  const PLANETS = [
    { id: "education",  title: "Education",       invite: "How can I support your learning journey?", href: "education.html",  color: "#e39a2d",
      blurb: "Twenty years in Montessori, Reggio Emilia and nature education. I walk alongside schools, educators and families.",
      tags: ["Schools & teams", "Home education", "Online classes"] },
    { id: "wellbeing",  title: "Wellbeing",       invite: "Take a little time for yourself.",          href: "wellbeing.html",  color: "#d98a7b",
      blurb: "A space to slow down, breathe and come home to the body.",
      tags: ["Yoga", "Meditation", "Sound baths", "Women's retreats"] },
    { id: "dance",      title: "Dance",           invite: "Come into the circle.",                     href: "dance.html",      color: "#c4452d",
      blurb: "Simple circle dances of Universal Peace, sung together. No experience needed.",
      tags: ["Dance evenings", "Retreats", "Dances I've written"] },
    { id: "community",  title: "Community",       invite: "How can I support your organisation?",      href: "community.html",  color: "#7f9a6b",
      blurb: "Events and admin support for organisations, with care for every newcomer.",
      tags: ["Gatherings & retreats", "Newsletters", "Enquiries"] },
    { id: "inner-life", title: "Sufi Inner Life", invite: "Reflections from my Sufi path.",            href: "inner-life.html", color: "#4a5fb0",
      blurb: "Writing, paintings and the questions I am living with.",
      tags: ["Reflections", "Paintings", "The Soul of the Child"] },
  ];

  // The dancer: a looping video of young Hadi dancing (transparent background).
  // Safari plays the HEVC .mov (with alpha); Chrome, Edge and Firefox play the WebM.
  const VIDEO = { mov: "assets/video/hadi-dance.mov?v=7", webm: "assets/video/hadi-dance.webm?v=7", poster: "assets/video/hadi-dance-poster.webp" };
  const FIG = { x: 214, y: 269, w: 628, h: 476 };            // where the video sits (viewBox units)
  const HEART = { x: 505, y: 416 };                          // her glowing heart
  const HANDS = [{ x: 360, y: 400 }, { x: 655, y: 400 }];    // her open palms
  const FEET = { x: 500, y: 715 };
  const VIDEO_SPEED = 0.85;   // play her whirl a little slower than generated
  const HEART_EVERY = 13;
  // outer rings: radius (viewBox units), seconds per turn (negative = other way), lights on them
  const OUTER = [
    { r: 440, sec: 260, dashed: true, motes: [{ a: 30, size: 2.6, o: .9 }, { a: 205, size: 1.8, o: .6 }] },
    { r: 520, sec: -380, motes: [{ a: 120, size: 3.2, o: .85 }, { a: 300, size: 2, o: .55 }, { a: 330, size: 1.4, o: .4 }] },
    { r: 610, sec: 520, dashed: true, motes: [{ a: 250, size: 2.4, o: .7 }] },
  ];      // seconds between light pouring from her heart

  const ORBIT_SECONDS = 150;   // one revolution of the planets
  const WORD_SECONDS = 60;     // one turn of the words around a planet
  const START = -50;           // starting angle of the first planet (degrees)
  const TOUCH_EVERY = [5, 7];   // seconds between her reaching out to a planet

  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const caption = document.querySelector(".center-caption .q");
  const defaultCaption = caption ? caption.textContent : "";

  const el = (name, attrs = {}, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  let cfg, svg, front, video, auraEl, moteEls = [];
  let planetEls = [], threadEls = [], spokeEls = [];
  let pos = [];                // current planet centres
  let figOffset = { x: 0, y: 0, rot: 0 };

  function layout() {
    const w = stage.getBoundingClientRect().width;
    const compact = w < 540;
    return compact
      ? { compact, orbitR: 342, planetR: 94, textR: 120, titleSize: 32, inviteSize: 0 }
      : { compact, orbitR: 350, planetR: 72, textR: 95, titleSize: 20, inviteSize: 15.5 };
  }

  function build() {
    cfg = layout();
    stage.innerHTML = "";
    planetEls = []; threadEls = []; spokeEls = [];

    // back layer: aura and threads · middle: the dancer video · front: the planets
    svg = el("svg", { viewBox: "0 0 1000 1000", class: "orbit-back", "aria-hidden": "true" }, stage);
    const defs = el("defs", {}, svg);
    const f = el("filter", { id: "glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "14" }, f);
    const sun = el("radialGradient", { id: "sun" }, defs);
    el("stop", { offset: "0%", "stop-color": "#f3dfab", "stop-opacity": ".42" }, sun);
    el("stop", { offset: "45%", "stop-color": "#d6ad5b", "stop-opacity": ".14" }, sun);
    el("stop", { offset: "100%", "stop-color": "#d6ad5b", "stop-opacity": "0" }, sun);
    const gs = el("filter", { id: "glow-soft", x: "-200%", y: "-200%", width: "500%", height: "500%" }, defs);
    el("feGaussianBlur", { stdDeviation: "3" }, gs);
    const fm = el("feMerge", {}, gs); el("feMergeNode", {}, fm); el("feMergeNode", { in: "SourceGraphic" }, fm);

    el("circle", { class: "orbit-ring", cx: 500, cy: 500, r: cfg.orbitR }, svg);

    // wider rings of the cosmic stage, each with a few travelling lights
    moteEls = [];
    OUTER.forEach((o) => {
      el("circle", { class: "outer-ring" + (o.dashed ? " dashed" : ""), cx: 500, cy: 500, r: o.r }, svg);
      o.motes.forEach((m) => moteEls.push({ el: el("circle", { class: "mote", r: m.size, opacity: m.o,
        cx: 500 + o.r * Math.cos((m.a * Math.PI) / 180), cy: 500 + o.r * Math.sin((m.a * Math.PI) / 180) }, svg), r: o.r, a: m.a, sec: o.sec }));
    });

    auraEl = el("circle", { class: "aura", cx: 500, cy: 480, r: 300, fill: "url(#sun)" }, svg);

    // threads between every pair of planets, and fainter ones to her heart
    const tg = el("g", {}, svg);
    for (let i = 0; i < PLANETS.length; i++) {
      for (let j = i + 1; j < PLANETS.length; j++) {
        const l = el("line", { class: "thread" }, tg);
        l.dataset.a = i; l.dataset.b = j;
        threadEls.push(l);
      }
      const s = el("line", { class: "thread spoke" }, tg);
      s.dataset.a = i;
      spokeEls.push(s);
    }

    // the dancer
    video = document.createElement("video");
    video.className = "dancer-video";
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "auto", poster: VIDEO.poster });
    video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", "Painting of young Hadi dancing among the stars");
    video.setAttribute("role", "img");
    video.innerHTML = `<source src="${VIDEO.mov}" type='video/quicktime; codecs="hvc1"'><source src="${VIDEO.webm}" type="video/webm">`;
    Object.assign(video.style, { left: FIG.x / 10 + "%", top: FIG.y / 10 + "%", width: FIG.w / 10 + "%" });
    stage.appendChild(video);
    video.defaultPlaybackRate = video.playbackRate = VIDEO_SPEED;
    video.addEventListener("loadedmetadata", () => { video.playbackRate = VIDEO_SPEED; });
    if (!reduce) { video.autoplay = true; video.play().catch(() => {}); }

    front = el("svg", { viewBox: "0 0 1000 1000", class: "orbit-front", role: "group", "aria-label": "Five paths orbiting Hadi" }, stage);

    // planets
    PLANETS.forEach((p, i) => {
      const a = el("a", { class: "planet", href: p.href, "aria-label": `${p.title}: ${p.invite}`, style: `--pc:${p.color}` }, front);
      const g = el("g", {}, a);
      el("circle", { class: "halo", r: cfg.planetR * 1.45 }, g);
      const S = cfg.planetR * 2.48;   // the painted orb includes its own glow
      el("image", { class: "orb", href: `assets/img/orb-${p.id}.webp`, x: -S / 2, y: -S / 2, width: S, height: S }, g);
      el("circle", { class: "body", r: cfg.planetR + 2, fill: "none" }, g);
      el("circle", { class: "hit", r: cfg.planetR * 1.3, fill: "transparent" }, g);

      const ring = el("g", { class: "label-ring" }, g);
      const R = cfg.textR;
      el("path", { id: `ring-${p.id}`, d: `M ${-R},0 a ${R},${R} 0 1,1 ${2 * R},0 a ${R},${R} 0 1,1 ${-2 * R},0`, fill: "none" }, ring);
      const t1 = el("text", { class: "title-text", style: `font-size:${cfg.titleSize}px` }, ring);
      const tp1 = el("textPath", { href: `#ring-${p.id}`, startOffset: "25%", "text-anchor": "middle" }, t1);
      tp1.textContent = p.title;
      if (cfg.inviteSize) {
        const t2 = el("text", { class: "invite-text", style: `font-size:${cfg.inviteSize}px` }, ring);
        const tp2 = el("textPath", { href: `#ring-${p.id}`, startOffset: "75%", "text-anchor": "middle" }, t2);
        tp2.textContent = p.invite;
      }

      const enter = () => { if (active !== i) { focus(i); burst(i, 0.7); } };
      a.addEventListener("mouseenter", enter);
      a.addEventListener("focus", enter);
      a.addEventListener("mouseleave", () => blurSoon());
      a.addEventListener("blur", () => blurSoon());
      a.addEventListener("touchstart", (e) => {
        // first tap opens the planet's card, second tap enters
        if (active !== i) { e.preventDefault(); focus(i); burst(i, 1.1); }
      }, { passive: false });
      a.addEventListener("click", (e) => {
        if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        burst(i, 1.6);
        setTimeout(() => { window.location.href = p.href; }, 520);
      });

      planetEls.push({ a, g, ring, phase: START + (i * 360) / PLANETS.length, spin: i * 47, last: -99 });
    });

    // the information card that opens beside a planet
    card = document.createElement("div");
    card.className = "planet-card";
    card.setAttribute("aria-hidden", "true");
    card.addEventListener("mouseenter", () => clearTimeout(hideT));
    card.addEventListener("mouseleave", () => blurSoon());
    stage.appendChild(card);

    // effects layer (sparks, stars, ripples) sits above everything
    fx.canvas = document.createElement("canvas");
    fx.canvas.className = "orbit-fx";
    fx.canvas.setAttribute("aria-hidden", "true");
    stage.appendChild(fx.canvas);
    fx.ctx = fx.canvas.getContext("2d");
    sizeFx();
    place(t);
  }

  // ---------------------------------------------------------------- focus
  let active = -1, card, hideT;
  function focus(i) {
    clearTimeout(hideT);
    active = i;
    stage.classList.add("focus");
    planetEls.forEach((p, k) => p.a.classList.toggle("active", k === i));
    threadEls.forEach((l) => l.classList.toggle("lit", +l.dataset.a === i || +l.dataset.b === i));
    spokeEls.forEach((l) => l.classList.toggle("lit", +l.dataset.a === i));
    if (caption) caption.textContent = PLANETS[i].invite;
    const p = PLANETS[i];
    card.style.setProperty("--pc", p.color);
    card.innerHTML = `<b class="pc-title">${p.title}</b><em class="pc-invite">${p.invite}</em>` +
      `<p class="pc-blurb">${p.blurb}</p><div class="pc-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>` +
      `<a class="pc-go" href="${p.href}">Enter ${p.title} <span aria-hidden="true">→</span></a>`;
    card.classList.remove("show"); void card.offsetWidth;
    card.classList.add("show");
    card.setAttribute("aria-hidden", "false");
    placeCard();
  }
  function blur() {
    active = -1;
    stage.classList.remove("focus");
    planetEls.forEach((p) => p.a.classList.remove("active"));
    if (caption) caption.textContent = defaultCaption;
    if (card) { card.classList.remove("show"); card.setAttribute("aria-hidden", "true"); }
  }
  function blurSoon() {
    clearTimeout(hideT);
    hideT = setTimeout(() => {
      if (card.matches(":hover") || card.contains(document.activeElement)) return;
      blur();
    }, 280);
  }
  // keep the card beside its planet, opening outward from the centre
  function placeCard() {
    if (active < 0 || !card) return;
    if (cfg.compact) { card.classList.add("below"); card.style.left = card.style.top = ""; return; }
    card.classList.remove("below");
    const [x, y] = pos[active];
    const right = x >= 500;
    const sr = stage.getBoundingClientRect(), k = sr.width / 1000, cw = card.offsetWidth;
    const anchor = (right ? x + cfg.textR + 26 : x - cfg.textR - 26) * k;
    let left = right ? anchor : anchor - cw;
    // keep the whole card on screen
    left = Math.max(12 - sr.left, Math.min(window.innerWidth - 12 - sr.left - cw, left));
    card.style.setProperty("--dx", right ? "10px" : "-10px");
    card.style.left = left.toFixed(1) + "px";
    card.style.top = Math.min(880, Math.max(120, y)) / 10 + "%";
  }
  // tapping anywhere else closes an open card on touch screens
  document.addEventListener("touchstart", (e) => {
    if (active >= 0 && !e.target.closest(".planet, .planet-card")) blur();
  }, { passive: true });

  // ---------------------------------------------------------------- effects
  const fx = { canvas: null, ctx: null, scale: 1, dpr: 1, items: [] };
  function sizeFx() {
    const r = stage.getBoundingClientRect();
    fx.dpr = Math.min(2, window.devicePixelRatio || 1);
    fx.canvas.width = Math.round(r.width * fx.dpr);
    fx.canvas.height = Math.round(r.height * fx.dpr);
    fx.scale = (r.width / 1000) * fx.dpr;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const GOLD = ["#f6dc9a", "#e9c26e", "#fff4d0"];

  function stars(x, y, n, color, power) {
    for (let k = 0; k < n; k++) {
      const ang = rand(0, Math.PI * 2), sp = rand(60, 260) * power;
      fx.items.push({
        type: "star", x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        life: 0, max: rand(0.9, 1.8), size: rand(3, 9) * Math.min(1.4, power),
        color: Math.random() < 0.6 ? GOLD[k % 3] : color, rot: rand(0, Math.PI), spin: rand(-3, 3),
      });
    }
  }
  function rings(x, y, r0, color, n) {
    for (let k = 0; k < n; k++) {
      fx.items.push({ type: "ring", x, y, r0, r1: r0 * 2.9, life: -k * 0.22, max: 1.5, color });
    }
  }
  function burst(i, power = 1) {
    if (reduce || !pos[i]) return;
    const [x, y] = pos[i];
    stars(x, y, Math.round(26 * power), PLANETS[i].color, power);
    rings(x, y, cfg.planetR, PLANETS[i].color, 3);
    glint(i);
  }
  function ripple(i, n) {
    if (reduce || !pos[i]) return;
    rings(pos[i][0], pos[i][1], cfg.planetR, PLANETS[i].color, n);
  }
  function glint(i) {
    const p = planetEls[i];
    p.a.classList.remove("touched"); void p.a.getBBox();
    p.a.classList.add("touched");
    threadEls.forEach((l) => {
      if (+l.dataset.a === i || +l.dataset.b === i) {
        l.classList.remove("glint"); void l.getBBox(); l.classList.add("glint");
      }
    });
    clearTimeout(p.gt);
    p.gt = setTimeout(() => {
      p.a.classList.remove("touched");
      threadEls.forEach((l) => l.classList.remove("glint"));
    }, 1800);
  }
  // a spark leaps from her hand to a passing planet
  function spark(h, i) {
    const from = handPoint(h);
    fx.items.push({ type: "spark", from, to: i, life: 0, max: 0.75, color: PLANETS[i].color });
  }
  function handPoint(h) {
    // follow the dancer's gentle float and sway
    const c = Math.cos(figOffset.rot), s = Math.sin(figOffset.rot);
    const dx = HANDS[h].x - FEET.x, dy = HANDS[h].y - FEET.y;
    return [FEET.x + dx * c - dy * s + figOffset.x, FEET.y + dx * s + dy * c + figOffset.y];
  }
  function heartPoint() {
    const c = Math.cos(figOffset.rot), s = Math.sin(figOffset.rot);
    const dx = HEART.x - FEET.x, dy = HEART.y - FEET.y;
    return [FEET.x + dx * c - dy * s + figOffset.x, FEET.y + dx * s + dy * c + figOffset.y];
  }

  function sparkle(ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.16, r * 0.16, r, 0); ctx.quadraticCurveTo(r * 0.16, -r * 0.16, 0, 0);
    }
    ctx.fill(); ctx.restore();
  }

  function drawFx(dt) {
    const ctx = fx.ctx, S = fx.scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, fx.canvas.width, fx.canvas.height);
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    const keep = [];
    for (const it of fx.items) {
      it.life += dt;
      if (it.life < 0) { keep.push(it); continue; }
      const k = it.life / it.max;
      if (k >= 1) {
        if (it.type === "spark") burst(it.to, 1);
        continue;
      }
      if (it.type === "star") {
        it.vx *= 1 - dt * 1.8; it.vy *= 1 - dt * 1.8; it.vy += 12 * dt;
        it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.spin * dt;
        const a = (1 - k) * (0.6 + 0.4 * Math.sin(it.life * 18));
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = it.color;
        sparkle(ctx, it.x, it.y, it.size * (1 - k * 0.5), it.rot);
      } else if (it.type === "ring") {
        const e = 1 - Math.pow(1 - k, 3);
        ctx.globalAlpha = (1 - k) * 0.75;
        ctx.strokeStyle = it.color; ctx.lineWidth = 2.2 * (1 - k) + 0.4;
        ctx.beginPath(); ctx.arc(it.x, it.y, it.r0 + (it.r1 - it.r0) * e, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = (1 - k) * 0.4; ctx.strokeStyle = "#f6dc9a";
        ctx.beginPath(); ctx.arc(it.x, it.y, it.r0 + (it.r1 - it.r0) * e * 0.85, 0, Math.PI * 2); ctx.stroke();
      } else if (it.type === "spark") {
        const to = pos[it.to], e = k * k * (3 - 2 * k);
        const x = it.from[0] + (to[0] - it.from[0]) * e, y = it.from[1] + (to[1] - it.from[1]) * e;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
        g.addColorStop(0, "rgba(255,244,208,1)"); g.addColorStop(0.4, "rgba(240,196,99,.5)"); g.addColorStop(1, "rgba(214,173,91,0)");
        ctx.globalAlpha = 1; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
        // trail of gold dust
        if (Math.random() < 0.9) fx.items.push({ type: "dust", x, y, vx: rand(-14, 14), vy: rand(-14, 14), life: 0, max: rand(0.5, 1), size: rand(1, 2.4) });
      } else if (it.type === "dust") {
        it.x += it.vx * dt; it.y += it.vy * dt;
        ctx.globalAlpha = (1 - k) * 0.9; ctx.fillStyle = "#f6dc9a";
        ctx.beginPath(); ctx.arc(it.x, it.y, it.size, 0, Math.PI * 2); ctx.fill();
      }
      keep.push(it);
    }
    fx.items = keep;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  // a gentle fountain of sparkles around the planet being looked at
  let hoverClock = 0;
  function hoverSparkles(dt) {
    hoverClock += dt;
    while (hoverClock > 0.07) {
      hoverClock -= 0.07;
      const [px, py] = pos[active], th = rand(0, Math.PI * 2), r = cfg.planetR * rand(0.9, 1.15);
      const sp = rand(18, 55);
      fx.items.push({
        type: "star", x: px + Math.cos(th) * r, y: py + Math.sin(th) * r,
        vx: Math.cos(th) * sp, vy: Math.sin(th) * sp - 10, life: 0, max: rand(0.8, 1.5), size: rand(2.5, 6),
        color: Math.random() < 0.55 ? GOLD[(Math.random() * 3) | 0] : PLANETS[active].color, rot: rand(0, Math.PI), spin: rand(-2, 2),
      });
    }
  }

  // gold dust drifting off her as she dances
  let dustClock = 0;
  function emitDust(dt) {
    dustClock += dt;
    while (dustClock > 0.09) {
      dustClock -= 0.09;
      const src = Math.random();
      let x, y;
      if (src < 0.5) { const h = handPoint(Math.random() < 0.5 ? 0 : 1); x = h[0] + rand(-14, 14); y = h[1] + rand(-14, 14); }
      else { x = rand(320, 690) + figOffset.x; y = rand(560, 690) + figOffset.y; }
      fx.items.push({ type: "dust", x, y, vx: rand(-10, 10), vy: rand(-28, -8), life: 0, max: rand(1.2, 2.6), size: rand(0.8, 2) });
    }
  }

  // ---------------------------------------------------------------- motion
  let t = 0, clock = 0, speed = reduce ? 0 : 1, last = performance.now();
  let visible = true;

  function place(time) {
    pos = planetEls.map((p) => {
      const ang = ((p.phase + (time / ORBIT_SECONDS) * 360) * Math.PI) / 180;
      return [500 + cfg.orbitR * Math.cos(ang), 500 + cfg.orbitR * Math.sin(ang)];
    });
    planetEls.forEach((p, i) => {
      p.g.setAttribute("transform", `translate(${pos[i][0].toFixed(2)} ${pos[i][1].toFixed(2)})`);
      p.ring.setAttribute("transform", `rotate(${(p.spin + (time / WORD_SECONDS) * 360) % 360})`);
    });
    threadEls.forEach((l) => {
      const A = pos[l.dataset.a], B = pos[l.dataset.b];
      l.setAttribute("x1", A[0]); l.setAttribute("y1", A[1]);
      l.setAttribute("x2", B[0]); l.setAttribute("y2", B[1]);
    });
    const hp = heartPoint();
    spokeEls.forEach((l) => {
      const A = pos[l.dataset.a];
      const dx = A[0] - hp[0], dy = A[1] - hp[1], d = Math.hypot(dx, dy);
      l.setAttribute("x1", hp[0] + (dx / d) * 40); l.setAttribute("y1", hp[1] + (dy / d) * 40);
      l.setAttribute("x2", A[0] - (dx / d) * cfg.planetR); l.setAttribute("y2", A[1] - (dy / d) * cfg.planetR);
    });
  }

  let nextHeart = 6;
  function dance(c) {
    // a gentle float on top of her own movement
    figOffset.y = Math.sin((c / 7) * Math.PI * 2) * 6;
    figOffset.x = 0; figOffset.rot = 0;
    video.style.transform = `translateY(${(figOffset.y / 10).toFixed(3)}%)`;
    auraEl.setAttribute("r", (300 + Math.sin((c / 6) * Math.PI * 2) * 16).toFixed(1));
    if (c >= nextHeart) {                       // light pours from her heart
      nextHeart = c + HEART_EVERY;
      const h = heartPoint();
      stars(h[0], h[1], 22, "#f0c463", 0.9);
      rings(h[0], h[1], 30, "#d6ad5b", 2);
      threadEls.forEach((l) => { l.classList.remove("glint"); void l.getBBox(); l.classList.add("glint"); });
      setTimeout(() => threadEls.forEach((l) => l.classList.remove("glint")), 1800);
    }
  }

  // she reaches out to a planet every few seconds, and any planet that
  // drifts right past an open hand gets a spark too
  let nextTouch = 1.5, handTurn = 0;
  const angTo = (p) => Math.atan2(p[1] - 500, p[0] - 500);
  const angDiff = (a, b) => { let d = Math.abs(a - b); return d > Math.PI ? 2 * Math.PI - d : d; };
  function touches() {
    if (clock >= nextTouch) {
      nextTouch = clock + rand(TOUCH_EVERY[0], TOUCH_EVERY[1]);
      const h = handTurn++ % 2, ha = angTo(handPoint(h));
      let best = -1, bd = 9;
      planetEls.forEach((p, i) => {
        const d = angDiff(ha, angTo(pos[i]));
        if (d < bd && clock - p.last > 4) { bd = d; best = i; }
      });
      if (best >= 0) { planetEls[best].last = clock; spark(h, best); }
    }
    planetEls.forEach((p, i) => {
      for (let h = 0; h < 2; h++) {
        if (angDiff(angTo(handPoint(h)), angTo(pos[i])) < 0.035 && clock - p.last > 4) { p.last = clock; spark(h, i); }
      }
    });
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible) {
      const target = active >= 0 ? 0 : 1;
      speed += (target - speed) * Math.min(1, dt * 2.2); // ease in/out of stillness
      t += dt * speed;
      clock += dt;
      dance(clock);
      moteEls.forEach((m) => {
        const ang = ((m.a + (clock / m.sec) * 360) * Math.PI) / 180;
        m.el.setAttribute("cx", (500 + m.r * Math.cos(ang)).toFixed(1));
        m.el.setAttribute("cy", (500 + m.r * Math.sin(ang)).toFixed(1));
      });
      place(t);
      emitDust(dt);
      if (active >= 0) hoverSparkles(dt);
      placeCard();
      touches();
      drawFx(dt);
    }
    requestAnimationFrame(tick);
  }

  build();
  if (!reduce) {
    requestAnimationFrame(tick);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        visible = e[0].isIntersecting;
        if (visible) video.play().catch(() => {}); else video.pause();
      }).observe(stage);
    }
  }

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (layout().compact !== cfg.compact) build();
      else sizeFx();
    }, 150);
  });
})();
