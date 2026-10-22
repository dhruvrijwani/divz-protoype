/* Intellect · sections.js
   Behaviour for content sections: scrolling text, video player, rotating quotes, press,
   shop the look, collection index, countdown, before/after, scroll story, recently viewed. */

import { $, $$, define, motionOn, parseHTML, theme } from '@theme/core';
import { initMotion } from '@theme/motion';

/* ---------- Scrolling text: speeds up with scroll velocity ---------- */
let scrollVelocity = 0;
let lastY = window.scrollY;
let lastT = performance.now();
window.addEventListener('scroll', () => {
  const now = performance.now();
  scrollVelocity = Math.min(8, Math.abs(window.scrollY - lastY) / Math.max(1, now - lastT));
  lastY = window.scrollY;
  lastT = now;
}, { passive: true });

class MarqueeBand extends HTMLElement {
  connectedCallback() {
    this.track = $('.marquee-band__track', this);
    if (!this.track || !motionOn()) return;
    this.animation = this.track.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: parseFloat(getComputedStyle(this).getPropertyValue('--marquee-dur')) * 1000 || 30000, iterations: Infinity, direction: this.hasAttribute('data-reverse') ? 'reverse' : 'normal' }
    );
    if (this.dataset.velocity !== 'true') return;
    let rate = 1;
    const loop = () => {
      const target = 1 + scrollVelocity * 2.2;
      rate += (target - rate) * 0.08;
      scrollVelocity *= 0.92;
      this.animation.playbackRate = rate;
      this.raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(this.raf);
      if (e.isIntersecting) loop();
    }).observe(this);
    this.addEventListener('pointerenter', () => this.animation.pause());
    this.addEventListener('pointerleave', () => this.animation.play());
  }
  disconnectedCallback() {
    cancelAnimationFrame(this.raf);
    this.animation?.cancel();
  }
}
define('marquee-band', MarqueeBand);

/* ---------- Video player ---------- */
class VideoPlayer extends HTMLElement {
  connectedCallback() {
    this.video = $('video', this);
    $('[data-play]', this)?.addEventListener('click', () => this.play());
    $('.video-player__media', this)?.addEventListener('click', (e) => {
      if (this.dataset.mode === 'click' && !this.classList.contains('is-playing') && !e.target.closest('button')) this.play();
    });
    $('[data-toggle]', this)?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (this.video.paused) {
        this.video.play();
        btn.classList.remove('is-paused');
      } else {
        this.video.pause();
        btn.classList.add('is-paused');
      }
    });
  }
  play() {
    this.classList.add('is-playing');
    if (this.video) {
      this.video.controls = true;
      this.video.play();
      return;
    }
    const tpl = $('template[data-embed]', this);
    if (tpl) $('.video-player__media', this).replaceChildren(tpl.content.cloneNode(true));
  }
}
define('video-player', VideoPlayer);

/* ---------- Testimonials: one big quote at a time ---------- */
class QuoteRotator extends HTMLElement {
  connectedCallback() {
    this.quotes = $$('[data-quote]', this);
    this.tabs = $$('[data-quote-tab]', this);
    this.index = 0;
    this.speed = Number(this.dataset.speed || 6) * 1000;
    this.style.setProperty('--quote-dur', `${this.speed}ms`);
    this.tabs.forEach((t) => t.addEventListener('click', () => this.show(Number(t.dataset.quoteTab), true)));
    this.addEventListener('pointerenter', () => this.classList.add('is-paused'));
    this.addEventListener('pointerleave', () => this.classList.remove('is-paused'));
    this.tick = () => {
      if (!this.classList.contains('is-paused')) this.show(this.index + 1);
    };
    if (this.quotes.length > 1) this.timer = setInterval(this.tick, this.speed);
  }
  show(i, user) {
    i = (i + this.quotes.length) % this.quotes.length;
    this.quotes[this.index].classList.remove('is-active');
    this.tabs[this.index]?.classList.remove('is-active');
    this.tabs[this.index]?.setAttribute('aria-selected', 'false');
    this.index = i;
    this.quotes[i].classList.add('is-active');
    this.tabs[i]?.classList.add('is-active');
    this.tabs[i]?.setAttribute('aria-selected', 'true');
    if (user) {
      clearInterval(this.timer);
      this.timer = setInterval(this.tick, this.speed);
    }
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
}
define('quote-rotator', QuoteRotator);

/* ---------- Press: hovering a logo shows its quote ---------- */
class PressQuotes extends HTMLElement {
  connectedCallback() {
    const logos = $$('[data-press-logo]', this);
    const quotes = $$('[data-press-quote]', this);
    let i = 0;
    const show = (n) => {
      i = n;
      logos.forEach((l, k) => l.classList.toggle('is-active', k === n));
      quotes.forEach((q, k) => q.classList.toggle('is-active', k === n));
    };
    logos.forEach((l, k) => {
      l.addEventListener('pointerenter', () => show(k));
      l.addEventListener('focus', () => show(k));
      l.addEventListener('click', () => show(k));
    });
    if (logos.length > 1) this.timer = setInterval(() => !this.matches(':hover') && show((i + 1) % logos.length), 5000);
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
}
define('press-quotes', PressQuotes);

/* ---------- Shop the look: dots and list stay in sync ---------- */
class ShopLook extends HTMLElement {
  connectedCallback() {
    const dots = $$('[data-look-dot]', this);
    const items = $$('[data-look-item]', this);
    const show = (n) => {
      dots.forEach((d, k) => d.classList.toggle('is-active', k === n));
      items.forEach((d, k) => d.classList.toggle('is-active', k === n));
    };
    dots.forEach((d, k) => {
      d.addEventListener('click', () => {
        show(k);
        items[k]?.scrollIntoView({ block: 'nearest', behavior: motionOn() ? 'smooth' : 'auto' });
      });
      d.addEventListener('pointerenter', () => show(k));
    });
    items.forEach((it, k) => it.addEventListener('pointerenter', () => show(k)));
  }
}
define('shop-look', ShopLook);

/* ---------- Collection index: image follows the cursor ---------- */
class IndexList extends HTMLElement {
  connectedCallback() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    this.float = $('.index__float', this);
    this.img = $('img', this.float);
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-8, Math.min(8, (tx - x) * 0.06));
      this.float.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };
    this.addEventListener('pointermove', (e) => {
      const r = this.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!raf) {
        x = tx;
        y = ty;
        raf = requestAnimationFrame(tick);
      }
    });
    $$('[data-index-image]', this).forEach((link) => {
      link.addEventListener('pointerenter', () => {
        this.img.src = link.dataset.indexImage;
        this.classList.add('is-hovering');
      });
    });
    this.addEventListener('pointerleave', () => {
      this.classList.remove('is-hovering');
      cancelAnimationFrame(raf);
      raf = 0;
    });
  }
}
define('index-list', IndexList);

/* ---------- Countdown ---------- */
class CountDown extends HTMLElement {
  connectedCallback() {
    this.end = new Date(this.dataset.end).getTime();
    if (Number.isNaN(this.end)) return;
    this.nums = Object.fromEntries($$('[data-unit]', this).map((n) => [n.dataset.unit, n]));
    this.update();
    this.timer = setInterval(() => this.update(), 1000);
  }
  update() {
    const left = this.end - Date.now();
    if (left <= 0) {
      clearInterval(this.timer);
      if (this.dataset.expired === 'hide' && !window.Shopify?.designMode) this.closest('.shopify-section').hidden = true;
      else {
        $('.promo__timer', this)?.setAttribute('hidden', '');
        $('.promo__ended', this)?.removeAttribute('hidden');
      }
      return;
    }
    const parts = {
      days: Math.floor(left / 864e5),
      hours: Math.floor((left / 36e5) % 24),
      minutes: Math.floor((left / 6e4) % 60),
      seconds: Math.floor((left / 1e3) % 60),
    };
    for (const [unit, el] of Object.entries(this.nums)) {
      const text = String(parts[unit]).padStart(2, '0');
      if (el.textContent !== text) {
        el.textContent = text;
        if (motionOn() && unit !== 'days') el.animate([{ transform: 'translateY(-30%)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
}
define('count-down', CountDown);

/* ---------- Before / after ---------- */
class BeforeAfter extends HTMLElement {
  connectedCallback() {
    const range = $('.ba__range', this);
    range?.addEventListener('input', () => this.style.setProperty('--pos', `${range.value}%`));
  }
}
define('before-after', BeforeAfter);

/* ---------- Scroll story: the sticky image follows the step in view ---------- */
class ScrollStory extends HTMLElement {
  connectedCallback() {
    const steps = $$('[data-story-step]', this);
    const media = $$('[data-story-media]', this);
    const bar = $('.story__progress span', this);
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const n = Number(e.target.dataset.storyStep);
        steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
        media.forEach((m, k) => m.classList.toggle('is-active', k === n));
        if (bar) bar.style.transform = `scaleY(${(n + 1) / steps.length})`;
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => this.io.observe(s));
  }
  disconnectedCallback() {
    this.io?.disconnect();
  }
}
define('scroll-story', ScrollStory);

/* ---------- Recently viewed ---------- */
const RECENT_KEY = 'theme:recent';
export const rememberProduct = (handle) => {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter((h) => h !== handle);
    list.unshift(handle);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 16)));
  } catch {}
};

class RecentlyViewed extends HTMLElement {
  async connectedCallback() {
    let handles = [];
    try {
      handles = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {}
    handles = handles.filter((h) => h !== this.dataset.exclude).slice(0, Number(this.dataset.limit || 8));
    if (!handles.length) return;
    const list = $('[data-recent-list]', this);
    const cards = await Promise.all(
      handles.map((h) =>
        fetch(`${theme.routes.root}products/${h}?section_id=product-card`.replace('//products', '/products'))
          .then((r) => (r.ok ? r.text() : ''))
          .then((html) => parseHTML(html).querySelector('[data-card-wrap]')?.innerHTML || '')
          .catch(() => '')
      )
    );
    const html = cards.filter(Boolean).map((c) => `<li>${c}</li>`).join('');
    if (!html) return;
    list.innerHTML = html;
    this.hidden = false;
    initMotion(this);
  }
}
define('recently-viewed', RecentlyViewed);
