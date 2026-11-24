/* The orbit: Hadi at the centre, five planets drifting around her,
   joined by gold threads. Words curve around each planet and slowly turn. */
(function () {
  const stage = document.querySelector(".orbit-stage");
  if (!stage) return;

  const PLANETS = [
    { id: "education",  title: "Education",       invite: "How can I support your learning journey?", href: "education.html",  color: "#e39a2d" },
    { id: "wellbeing",  title: "Wellbeing",       invite: "Take a little time for yourself.",          href: "wellbeing.html",  color: "#d98a7b" },
    { id: "dance",      title: "Dance",           invite: "Come into the circle.",                     href: "dance.html",      color: "#c4452d" },
    { id: "community",  title: "Community",       invite: "How can I support your organisation?",      href: "community.html",  color: "#7f9a6b" },
    { id: "inner-life", title: "Sufi Inner Life", invite: "Reflections from my Sufi path.",            href: "inner-life.html", color: "#4a5fb0" },
  ];

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

  let cfg, svg, planetEls = [], threadEls = [], spokeEls = [], ringEls = [];

  function layout() {
    const w = stage.getBoundingClientRect().width;
    const compact = w < 540;
    return compact
      ? { compact, orbitR: 330, planetR: 80, textR: 104, titleSize: 30, inviteSize: 0, portraitR: 150 }
      : { compact, orbitR: 340, planetR: 62, textR: 84, titleSize: 19, inviteSize: 15.5, portraitR: 150 };
  }

  function build() {
    cfg = layout();
    stage.innerHTML = "";
    planetEls = []; threadEls = []; spokeEls = []; ringEls = [];

    svg = el("svg", { viewBox: "0 0 1000 1000", role: "group", "aria-label": "Five paths orbiting Hadi" }, stage);
    const defs = el("defs", {}, svg);
    const f = el("filter", { id: "glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "14" }, f);
    const pc = el("clipPath", { id: "clip-portrait" }, defs);
    el("circle", { cx: 500, cy: 500, r: cfg.portraitR }, pc);
    const grad = el("radialGradient", { id: "sun" }, defs);
    el("stop", { offset: "0%", "stop-color": "#ead4a0", "stop-opacity": ".55" }, grad);
    el("stop", { offset: "100%", "stop-color": "#ead4a0", "stop-opacity": "0" }, grad);

    // faint orbit path
    el("circle", { class: "orbit-ring", cx: 500, cy: 500, r: cfg.orbitR }, svg);

    // threads (between every pair) + spokes (to the centre)
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

    // centre: glow, portrait, rings
    el("circle", { cx: 500, cy: 500, r: cfg.portraitR * 1.9, fill: "url(#sun)" }, svg);
    el("image", {
      href: "assets/img/portrait-round.jpg", x: 500 - cfg.portraitR, y: 500 - cfg.portraitR,
      width: cfg.portraitR * 2, height: cfg.portraitR * 2, "clip-path": "url(#clip-portrait)",
      preserveAspectRatio: "xMidYMid slice", role: "img", "aria-label": "Portrait of Hadi"
    }, svg);
    el("circle", { class: "portrait-ring", cx: 500, cy: 500, r: cfg.portraitR + 8 }, svg);
    ringEls.push(el("circle", { class: "portrait-ring outer", cx: 500, cy: 500, r: cfg.portraitR + 24 }, svg));

    // planets
    PLANETS.forEach((p, i) => {
      const a = el("a", { class: "planet", href: p.href, "aria-label": `${p.title} — ${p.invite}`, style: `--pc:${p.color}` }, svg);
      const g = el("g", {}, a);
      const cp = el("clipPath", { id: `clip-${p.id}` }, defs);
      el("circle", { cx: 0, cy: 0, r: cfg.planetR }, cp);
      el("circle", { class: "halo", r: cfg.planetR * 1.45 }, g);
      el("image", {
        href: `assets/img/planet-${p.id}.jpg`, x: -cfg.planetR, y: -cfg.planetR,
        width: cfg.planetR * 2, height: cfg.planetR * 2, "clip-path": `url(#clip-${p.id})`,
        preserveAspectRatio: "xMidYMid slice"
      }, g);
      el("circle", { class: "tint", r: cfg.planetR }, g);
      el("circle", { class: "body", r: cfg.planetR, fill: "none" }, g);

      // the turning ring of words
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

      const enter = () => focus(i);
      a.addEventListener("mouseenter", enter);
      a.addEventListener("focus", enter);
      a.addEventListener("mouseleave", blur);
      a.addEventListener("blur", blur);
      a.addEventListener("touchstart", (e) => {
        // first tap reveals the invitation, second tap enters
        if (active !== i) { e.preventDefault(); focus(i); }
      }, { passive: false });

      planetEls.push({ a, g, ring, phase: (i * 360) / PLANETS.length - 90, spin: i * 47 });
    });
    place(0);
  }

  let active = -1;
  function focus(i) {
    active = i;
    stage.classList.add("focus");
    planetEls.forEach((p, k) => p.a.classList.toggle("active", k === i));
    threadEls.forEach((l) => l.classList.toggle("lit", +l.dataset.a === i || +l.dataset.b === i));
    spokeEls.forEach((l) => l.classList.toggle("lit", +l.dataset.a === i));
    if (caption) caption.textContent = PLANETS[i].invite;
  }
  function blur() {
    active = -1;
    stage.classList.remove("focus");
    planetEls.forEach((p) => p.a.classList.remove("active"));
    if (caption) caption.textContent = defaultCaption;
  }

  // ---- motion ----
  const ORBIT_SECONDS = 260;   // one slow revolution of the planets
  const WORD_SECONDS = 70;     // one turn of the words around a planet
  let t = 0, speed = reduce ? 0 : 1, last = performance.now();

  function place(time) {
    const pos = planetEls.map((p) => {
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
    spokeEls.forEach((l) => {
      const A = pos[l.dataset.a];
      const dx = A[0] - 500, dy = A[1] - 500, d = Math.hypot(dx, dy);
      const r0 = cfg.portraitR + 26;
      l.setAttribute("x1", 500 + (dx / d) * r0); l.setAttribute("y1", 500 + (dy / d) * r0);
      l.setAttribute("x2", A[0] - (dx / d) * cfg.planetR); l.setAttribute("y2", A[1] - (dy / d) * cfg.planetR);
    });
    ringEls.forEach((r) => r.setAttribute("transform", `rotate(${(-time * 2) % 360} 500 500)`));
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const target = reduce ? 0 : active >= 0 ? 0 : 1;
    speed += (target - speed) * Math.min(1, dt * 2.2); // ease in/out of stillness
    t += dt * speed;
    place(t);
    requestAnimationFrame(tick);
  }

  build();
  requestAnimationFrame(tick);

  let rt;
  let wasCompact = cfg.compact;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const c = layout().compact;
      if (c !== wasCompact) { wasCompact = c; build(); place(t); }
    }, 150);
  });
})();
