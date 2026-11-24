/* Shared behaviour: starfield, gentle reveals, gallery lightbox. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- starfield ----
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let stars = [], w, h, dpr;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 4200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
        warm: Math.random() < 0.18,
      }));
    };
    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.p + (time / 1000) * s.s));
        ctx.fillStyle = s.warm ? `rgba(234,212,160,${a})` : `rgba(247,240,227,${a * 0.85})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    size();
    window.addEventListener("resize", size);
    requestAnimationFrame(draw);
  }

  // ---- reveal on scroll ----
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add("in"));
  }

  // ---- ribbon: duplicate for a seamless loop ----
  const track = document.querySelector(".ribbon-track");
  if (track) track.innerHTML += track.innerHTML.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"');

  // ---- lightbox ----
  const galleries = document.querySelectorAll(".gallery");
  if (galleries.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button aria-label="Close">×</button><img alt="">';
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const close = () => box.classList.remove("open");
    box.addEventListener("click", (e) => { if (e.target !== img) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    galleries.forEach((g) => g.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        const i = b.querySelector("img");
        img.src = i.src; img.alt = i.alt;
        box.classList.add("open");
        box.querySelector("button").focus();
      });
    }));
  }

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
