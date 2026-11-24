/* The cosmic stage around the hero: twinkling sparkle-stars, occasional
   shooting stars, and a gentle parallax as the visitor moves. */
(function () {
  const section = document.querySelector(".cosmos");
  const canvas = document.getElementById("cosmos-fx");
  const stage = document.querySelector(".orbit-stage");
  if (!section || !canvas || !stage) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  const nebulae = section.querySelector(".nebulae");
  const moon = section.querySelector(".moon");

  let W = 0, H = 0, dpr = 1, sparkles = [], shooting = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = section.clientWidth; H = section.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);

    const sr = stage.getBoundingClientRect(), cr = section.getBoundingClientRect();
    const cx = sr.left - cr.left + sr.width / 2, cy = sr.top - cr.top + sr.height / 2;
    const R = sr.width * 0.47;
    const mr = moon ? moon.getBoundingClientRect() : null;
    const onMoon = (x, y) => mr && x > mr.left - cr.left - 30 && x < mr.right - cr.left + 30 && y > mr.top - cr.top - 30 && y < mr.bottom - cr.top + 30;
    const free = (x, y, pad) => Math.hypot(x - cx, y - cy) > R + pad && y > 100 && y < H - 30 && !onMoon(x, y);

    // sparkle-stars scattered in the open sky
    sparkles = [];
    const want = W > 900 ? 11 : W > 600 ? 8 : 5;
    for (let tries = 0; sparkles.length < want && tries < 400; tries++) {
      const x = rand(20, W - 20), y = rand(100, H - 40);
      if (!free(x, y, 20)) continue;
      if (sparkles.some((s) => Math.hypot(s.x - x, s.y - y) < 120)) continue;
      sparkles.push({ x, y, r: rand(3.5, 7.5), p: rand(0, Math.PI * 2), s: rand(0.6, 1.2), rot: rand(0, 1), warm: Math.random() < 0.7 });
    }

  }
  function sparkle(x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.14, r * 0.14, r, 0); ctx.quadraticCurveTo(r * 0.14, -r * 0.14, 0, 0);
    }
    ctx.fill(); ctx.restore();
  }

  let nextShoot = 2.5;
  function shoot(time) {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? rand(-40, W * 0.45) : rand(W * 0.55, W + 40);
    const y = rand(60, H * 0.45);
    const ang = (fromLeft ? rand(18, 34) : rand(146, 162)) * (Math.PI / 180);
    shooting.push({ x, y, vx: Math.cos(ang), vy: Math.sin(ang), t0: time, dur: rand(0.9, 1.4), len: rand(110, 190), speed: rand(520, 760) });
  }

  function draw(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // sparkle-stars
    for (const s of sparkles) {
      const pulse = reduce ? 0.7 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(s.p + time * s.s));
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
      g.addColorStop(0, s.warm ? `rgba(246,220,154,${0.28 * pulse})` : `rgba(200,210,255,${0.22 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = s.warm ? `rgba(250,232,184,${0.9 * pulse})` : `rgba(226,232,255,${0.85 * pulse})`;
      sparkle(s.x, s.y, s.r * (0.75 + 0.25 * pulse), s.rot + (reduce ? 0 : time * 0.05));
    }

    // shooting stars
    if (!reduce) {
      if (time > nextShoot) { shoot(time); nextShoot = time + rand(5, 10); }
      shooting = shooting.filter((s) => time - s.t0 < s.dur);
      for (const s of shooting) {
        const k = (time - s.t0) / s.dur, d = (time - s.t0) * s.speed;
        const hx = s.x + s.vx * d, hy = s.y + s.vy * d;
        const tx = hx - s.vx * s.len * (0.4 + 0.6 * Math.sin(Math.PI * k)), ty = hy - s.vy * s.len * (0.4 + 0.6 * Math.sin(Math.PI * k));
        const a = Math.sin(Math.PI * k);
        const g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, "rgba(246,220,154,0)"); g.addColorStop(1, `rgba(255,248,225,${0.85 * a})`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.fillStyle = `rgba(255,248,225,${a})`;
        ctx.beginPath(); ctx.arc(hx, hy, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ---- loop, paused while the hero is off screen ----
  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(section);
  }
  function frame(now) {
    if (visible) draw(now / 1000);
    requestAnimationFrame(frame);
  }

  // ---- gentle parallax: far layers drift a little as the pointer moves ----
  if (!reduce && nebulae && window.matchMedia("(pointer: fine)").matches) {
    section.addEventListener("pointermove", (e) => {
      const r = section.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      nebulae.style.transform = `translate(${(-dx * 28).toFixed(1)}px, ${(-dy * 20).toFixed(1)}px)`;
      canvas.style.transform = `translate(${(-dx * 12).toFixed(1)}px, ${(-dy * 8).toFixed(1)}px)`;
      if (moon) moon.style.transform = `translate(${(-dx * 20).toFixed(1)}px, ${(-dy * 14).toFixed(1)}px)`;
    });
    section.addEventListener("pointerleave", () => { nebulae.style.transform = ""; canvas.style.transform = ""; if (moon) moon.style.transform = ""; });
  }

  layout();
  if (reduce) draw(0); else requestAnimationFrame(frame);
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { layout(); if (reduce) draw(0); }, 150);
  });
})();
