/* Intellect · moments.js — seasonal moments that react to the shopper.
   Diwali: fireworks when the page opens; after every add to cart a fountain of sparks from the pressed button,
   then shells overhead. Rising diya embers in between.
   Christmas: layered snowfall, and Santa's sleigh flying across after load and add to cart.
   One canvas, paused when nothing is moving or the tab is hidden. Off for reduced motion. */

import { motionOn } from '@theme/core';

const name = document.documentElement.dataset.moment;
const effect = Boolean(window.Theme?.moment?.effect);
const isChristmas = name === 'christmas' || name === 'christmas-summer';

if (motionOn() && name) start();

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'moment-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  // The canvas lives in the top layer (a manual popover) so celebrations play above the open cart drawer.
  canvas.setAttribute('popover', 'manual');
  raise(canvas);
  document.addEventListener('theme:dialog:open', () => {
    raise(canvas);
    document.querySelectorAll('.moment-sleigh').forEach(raise);
  });
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  let w = 0;
  let h = 0;
  const resize = () => {
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
  };
  resize();
  addEventListener('resize', resize);
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- Particles ---------- */
  const sparks = []; // fireworks, sleigh trail, bursts
  const ambient = []; // embers, snow, sparkles

  // Saturated festival colours that still read on a pale page. Each shell pairs a main colour with a glitter tone.
  const FIRE = [
    ['#ff6a00', '#ffc23d'], // saffron
    ['#e0218a', '#ff9ad5'], // rani pink
    ['#0f9d58', '#9be15d'], // emerald
    ['#e8a400', '#fff1a8'], // gold
    ['#3b5bdb', '#a5b8ff'], // royal blue
    ['#e63946', '#ffb199'], // sindoor red
  ];
  const flashes = [];

  function burst(x, y, [main, glitter], count = 96, power = 1) {
    flashes.push({ x, y, life: 1, c: main, r: 90 * dpr * power });
    const ring = Math.random() < 0.35; // some shells open as a clean ring, others as a full peony
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + rand(-0.06, 0.06);
      const v = (ring ? rand(5.2, 5.8) : rand(1.4, 6.4)) * dpr * power;
      const isGlitter = Math.random() < 0.28;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.008, 0.014), c: isGlitter ? glitter : main, g: 0.05 * dpr, r: rand(2, 3.4) * dpr, drag: 0.972, twinkle: isGlitter });
    }
  }

  function rocket(x, targetY, delay = 0) {
    setTimeout(() => {
      const colour = FIRE[(Math.random() * FIRE.length) | 0];
      // Launch speed is solved so the shell peaks right at its target height.
      const g = 0.16 * dpr;
      const vy = -Math.sqrt(2 * g * Math.max(80 * dpr, h + 10 - targetY));
      sparks.push({ x, y: h + 10, vx: rand(-0.6, 0.6) * dpr, vy, life: 1, decay: 0, c: colour[0], g, r: 3 * dpr, rocket: true, colour });
      wake();
    }, delay);
  }

  function fireworks(n = 4) {
    // With a side drawer open, keep the shells over the page rather than across the cart.
    const drawer = document.querySelector('dialog[open].drawer');
    const edge = drawer ? drawer.getBoundingClientRect().left : 0;
    const right = edge > innerWidth * 0.4 ? edge * dpr - 80 * dpr : w * 0.88;
    for (let i = 0; i < n; i += 1) rocket(rand(w * 0.1, right), rand(h * 0.14, h * 0.4), i * 320 + rand(0, 160));
  }

  // An "anar" fountain from the button the shopper pressed: the action itself lights up.
  function fountain(cx, cy) {
    const x = cx * dpr;
    const y = cy * dpr;
    const colour = FIRE[(Math.random() * FIRE.length) | 0];
    flashes.push({ x, y, life: 1, c: colour[0], r: 60 * dpr });
    for (let i = 0; i < 70; i += 1) {
      const a = -Math.PI / 2 + rand(-0.75, 0.75);
      const v = rand(3, 8.5) * dpr;
      sparks.push({ x: x + rand(-14, 14) * dpr, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.012, 0.02), c: Math.random() < 0.35 ? colour[1] : colour[0], g: 0.14 * dpr, r: rand(1.8, 3) * dpr, drag: 0.985, twinkle: Math.random() < 0.3 });
    }
    wake();
  }

  /* Ambient layers */
  if (effect) {
    const count = innerWidth < 750 ? 26 : 54;
    for (let i = 0; i < count; i += 1) ambient.push(newAmbient(true));
  }
  function newAmbient(initial) {
    if (name === 'diwali') return { x: rand(0, w), y: initial ? rand(0, h) : h + 10, vy: -rand(0.15, 0.45) * dpr, vx: rand(-0.1, 0.1) * dpr, r: rand(0.8, 2) * dpr, a: rand(0.25, 0.7), c: ['#ffd27a', '#ffb347', '#ff8c1a'][(Math.random() * 3) | 0], t: rand(0, 6) };
    if (name === 'christmas') {
      const depth = Math.random();
      return { x: rand(0, w), y: initial ? rand(0, h) : -10, vy: (0.35 + depth * 1.1) * dpr, vx: rand(-0.25, 0.25) * dpr, r: (0.8 + depth * 2.8) * dpr, a: 0.35 + depth * 0.6, c: '#ffffff', t: rand(0, 6) };
    }
    return { x: rand(0, w), y: rand(0, h), vx: 0, vy: 0, r: rand(0.8, 1.8) * dpr, a: rand(0.4, 0.9), c: ['#ffe28a', '#ffd166', '#fff4c7'][(Math.random() * 3) | 0], t: rand(0, 6), life: rand(0, 1) };
  }

  /* ---------- Loop ---------- */
  let raf = 0;
  function wake() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function frame() {
    raf = 0;
    ctx.clearRect(0, 0, w, h);

    // White snow needs a soft cool edge to show on white pages as well as over photographs.
    if (name === 'christmas') {
      ctx.shadowColor = 'rgb(70 90 120 / 0.55)';
      ctx.shadowBlur = 3 * dpr;
    }
    for (let i = 0; i < ambient.length; i += 1) {
      const p = ambient[i];
      p.t += 0.02;
      p.x += p.vx + Math.sin(p.t) * 0.25 * dpr;
      p.y += p.vy;
      let alpha = p.a;
      if (name === 'diwali') alpha *= 0.6 + Math.sin(p.t * 3) * 0.4;
      if (name === 'christmas-summer') {
        p.life += 0.006;
        alpha = Math.max(0, Math.sin(p.life * Math.PI)) * p.a;
        if (p.life >= 1) ambient[i] = newAmbient(true);
      }
      if (p.y < -20 || p.y > h + 20) ambient[i] = newAmbient(false);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    for (let i = flashes.length - 1; i >= 0; i -= 1) {
      const f = flashes[i];
      f.life -= 0.06;
      if (f.life <= 0) {
        flashes.splice(i, 1);
        continue;
      }
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 1.4);
      grad.addColorStop(0, f.c);
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = f.life * 0.32;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineCap = 'round';
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const s = sparks[i];
      s.vy += s.g;
      if (s.drag) {
        s.vx *= s.drag;
        s.vy *= s.drag;
      }
      s.x += s.vx;
      s.y += s.vy;
      if (s.rocket) {
        // Falling sparks behind the rising shell.
        if (Math.random() < 0.7) sparks.push({ x: s.x, y: s.y, vx: rand(-0.5, 0.5) * dpr, vy: rand(0.5, 1.5) * dpr, life: 0.8, decay: 0.03, c: s.colour[1], g: 0.04 * dpr, r: 1.6 * dpr });
        if (s.vy >= -0.6 * dpr) {
          sparks.splice(i, 1);
          burst(s.x, s.y, s.colour, innerWidth < 750 ? 64 : 96, innerWidth < 750 ? 0.7 : 1);
          continue;
        }
      }
      s.life -= s.decay;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      // Streak length follows speed, so bursts read as motion rather than dots.
      const tail = s.rocket ? 5 : 3.2;
      let alpha = Math.min(1, s.life * 1.6);
      if (s.twinkle && s.life < 0.55) alpha *= Math.random() < 0.5 ? 1 : 0.15;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = s.c;
      ctx.lineWidth = s.r * (0.5 + s.life * 0.5);
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * tail, s.y - s.vy * tail);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (ambient.length || sparks.length || flashes.length || sleighActive) raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else wake();
  });

  /* ---------- Santa's sleigh ---------- */
  let sleighActive = false;
  let sleighQueued = false;
  function sleigh() {
    if (sleighActive) {
      sleighQueued = true;
      return;
    }
    sleighActive = true;
    const el = document.createElement('div');
    el.className = 'moment-sleigh';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = SLEIGH;
    el.setAttribute('popover', 'manual');
    document.body.append(el);
    raise(el);
    const width = el.offsetWidth || 260;
    const top = Math.max(110, innerHeight * 0.16);
    el.style.top = `${top}px`;
    const fly = el.animate(
      [
        { transform: `translate(${-width - 20}px, 30px) rotate(-6deg)` },
        { transform: `translate(${innerWidth * 0.3}px, -10px) rotate(-3deg)`, offset: 0.35 },
        { transform: `translate(${innerWidth * 0.65}px, 10px) rotate(-5deg)`, offset: 0.7 },
        { transform: `translate(${innerWidth + 40}px, -40px) rotate(-9deg)` },
      ],
      { duration: Math.max(6500, innerWidth * 5.5), easing: 'linear' }
    );
    const trail = setInterval(() => {
      const r = el.getBoundingClientRect();
      for (let i = 0; i < 3; i += 1) {
        sparks.push({ x: (r.left + 18) * dpr, y: (r.top + r.height * 0.75) * dpr, px: (r.left + 18) * dpr, py: (r.top + r.height * 0.75) * dpr, vx: rand(-1.2, -0.2) * dpr, vy: rand(-0.4, 0.6) * dpr, life: 1, decay: rand(0.015, 0.03), c: ['#e8a400', '#ffc23d', '#d4a72c'][i], g: 0.02 * dpr, r: rand(1.2, 2.2) * dpr });
      }
      wake();
    }, 45);
    fly.finished.then(() => {
      clearInterval(trail);
      el.remove();
      sleighActive = false;
      if (sleighQueued) {
        sleighQueued = false;
        setTimeout(sleigh, 300);
      }
    });
    wake();
  }

  /* ---------- When things happen ---------- */
  const ONCE = `theme:moment-intro:${name}`;
  const firstTime = !sessionStorage.getItem(ONCE);
  try { sessionStorage.setItem(ONCE, '1'); } catch {}

  if (name === 'diwali') setTimeout(() => fireworks(firstTime ? 5 : 2), 900);
  if (isChristmas && firstTime) setTimeout(sleigh, 1600);

  // Remember the button the shopper pressed, so the celebration starts from it.
  let pressed = null;
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('button, [type="submit"], .btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    pressed = { x: r.left + r.width / 2, y: r.top + 4, at: performance.now() };
  }, { passive: true });

  document.addEventListener('theme:cart:added', () => {
    if (name === 'diwali') {
      if (pressed && performance.now() - pressed.at < 8000) fountain(pressed.x, pressed.y);
      setTimeout(() => fireworks(innerWidth < 750 ? 3 : 4), 350);
    }
    if (isChristmas) setTimeout(sleigh, 500);
  });
  // Diwali: heading to checkout lights the button and sends up two shells.
  document.addEventListener('click', (e) => {
    const btn = name === 'diwali' && e.target.closest('[name="checkout"]');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    fountain(r.left + r.width / 2, r.top + 4);
    fireworks(2);
  });

  wake();
}

// Re-enter the top layer so the element sits above whatever dialog opened last.
function raise(el) {
  if (!el.showPopover) return;
  try {
    if (el.matches(':popover-open')) el.hidePopover();
    el.showPopover();
  } catch {}
}

const SLEIGH = `
<svg viewBox="0 0 340 100" width="300" height="88">
  <defs>
    <g id="deer">
      <ellipse cx="0" cy="0" rx="16" ry="7" fill="#8b5a2b"/>
      <path d="M11 -3 L17 -14 L22 -13 L17 -1 Z" fill="#8b5a2b"/>
      <ellipse cx="23" cy="-15" rx="6.5" ry="4.2" fill="#8b5a2b"/>
      <path d="M21 -18 L19 -27 M19 -23 L14 -26 M24 -19 L27 -28 M26 -24 L31 -26" stroke="#5d3a1a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <path d="M-10 4 L-17 13 M-5 5 L-1 15 M8 5 L3 14 M12 4 L19 11" stroke="#7a4c22" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M-15 -2 L-21 -6" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="21" cy="-17" r="1" fill="#1a1a1a"/>
    </g>
  </defs>
  <path d="M118 58 C150 54 175 52 200 50 M200 50 C222 48 238 46 258 44 M258 44 C276 42 290 40 310 38" stroke="#d4a72c" stroke-width="1.3" fill="none"/>
  <use href="#deer" transform="translate(186 54)"/>
  <use href="#deer" transform="translate(244 48)"/>
  <use href="#deer" transform="translate(302 42)"/>
  <circle cx="331" cy="27" r="3" fill="#ff3b30"/>
  <circle cx="331" cy="27" r="6" fill="#ff3b30" opacity=".25"/>
  <path d="M14 72 Q8 86 26 88 L112 88 Q126 88 128 76" fill="none" stroke="#d4a72c" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M24 78 L28 52 Q30 44 40 44 L68 44 L72 58 L110 58 Q120 58 118 68 L114 78 Z" fill="#b3261e"/>
  <path d="M30 52 L110 61" stroke="#e8c15a" stroke-width="1.6"/>
  <path d="M32 46 Q26 26 42 22 Q58 20 57 36 Q58 46 51 47 Z" fill="#7a4a2a"/>
  <rect x="66" y="40" width="26" height="20" rx="7" fill="#d32f2f"/>
  <circle cx="81" cy="34" r="9" fill="#f5c9a5"/>
  <path d="M71 35 Q81 55 91 35 Z" fill="#ffffff"/>
  <path d="M71 31 Q80 14 95 22 L99 31 Z" fill="#d32f2f"/>
  <rect x="70" y="29" width="23" height="4" rx="2" fill="#ffffff"/>
  <circle cx="100" cy="31" r="3.2" fill="#ffffff"/>
</svg>`;
