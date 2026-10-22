/* Intellect · slideshow.js
   <hero-reel>: on phones, the Reel hero shows one panel at a time, full screen, with story bars.
   <slide-show>: the Slideshow section (separate desktop and phone media per slide).
   Both advance on a timer, pause when off screen or when the tab is hidden, and follow swipes. */

import { $, $$, define, motionOn } from '@theme/core';

/* Swipe on an element without blocking vertical page scroll. */
function onSwipe(el, cb) {
  let x0 = 0;
  let y0 = 0;
  el.addEventListener('touchstart', (e) => {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) cb(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* Shared timer: runs only while the element is on screen and the tab is visible. */
class Ticker {
  constructor(el, ms, step) {
    this.el = el;
    this.ms = ms;
    this.step = step;
    this.visible = false;
    this.held = false;
    new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.sync();
    }, { threshold: 0.35 }).observe(el);
    document.addEventListener('visibilitychange', () => this.sync());
  }
  get running() {
    return this.visible && !this.held && !document.hidden && this.ms > 0;
  }
  restart() {
    clearTimeout(this.timer);
    if (this.running) this.timer = setTimeout(() => this.step(1), this.ms);
  }
  sync() {
    this.el.classList.toggle('is-paused', !this.running);
    this.restart();
  }
  hold(on) {
    this.held = on;
    this.sync();
  }
}

/* ---------- Hero reel on phones ---------- */
class HeroReel extends HTMLElement {
  connectedCallback() {
    this.panels = $$('.hero__panel', this);
    this.bars = $$('.hero__bars span', this);
    this.mq = matchMedia('(max-width: 749px)');
    this.mq.addEventListener('change', () => this.setup());
    this.setup();
  }

  setup() {
    const rotate = this.dataset.mobile === 'rotate' && this.mq.matches && this.panels.length > 1;
    clearTimeout(this.ticker?.timer);
    if (!rotate) {
      // Desktop or side-by-side: every panel visible and playing.
      this.panels.forEach((p) => {
        p.classList.remove('is-active');
        $('video', p)?.play().catch(() => {});
      });
      return;
    }
    if (!this.ticker) {
      const ms = (parseFloat(getComputedStyle(this).getPropertyValue('--reel-dur')) || 5) * 1000;
      this.ticker = new Ticker(this, motionOn() ? ms : 0, (d) => this.go(this.index + d));
      onSwipe(this.closest('.hero__stage') || this, (d) => this.go(this.index + d));
    }
    this.go(0);
  }

  go(i) {
    const n = this.panels.length;
    this.index = (i + n) % n;
    this.panels.forEach((p, k) => {
      const on = k === this.index;
      p.classList.toggle('is-active', on);
      const v = $('video', p);
      if (v) on ? v.play().catch(() => {}) : v.pause();
    });
    this.bars.forEach((b, k) => {
      b.classList.toggle('is-done', k < this.index);
      b.classList.remove('is-active');
      if (k === this.index) {
        void b.offsetWidth; // restart the fill animation
        b.classList.add('is-active');
      }
    });
    this.ticker.restart();
  }
}
define('hero-reel', HeroReel);

/* ---------- Slideshow section ---------- */
class SlideShow extends HTMLElement {
  connectedCallback() {
    this.slides = $$('.slideshow__slide', this);
    this.dots = $$('[data-slide-to]', this);
    this.counter = $('[data-slide-count]', this);
    if (this.slides.length < 2) {
      this.slides[0]?.classList.add('is-active');
      return;
    }
    const ms = Number(this.dataset.autoplay) * 1000;
    this.ticker = new Ticker(this, motionOn() ? ms : 0, (d) => this.go(this.index + d));
    $('[data-slide-prev]', this)?.addEventListener('click', () => this.go(this.index - 1));
    $('[data-slide-next]', this)?.addEventListener('click', () => this.go(this.index + 1));
    this.dots.forEach((d) => d.addEventListener('click', () => this.go(Number(d.dataset.slideTo))));
    onSwipe(this, (d) => this.go(this.index + d));
    if (this.dataset.pauseHover === 'true') {
      this.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && this.ticker.hold(true));
      this.addEventListener('pointerleave', () => this.ticker.hold(false));
    }
    this.addEventListener('focusin', () => this.ticker.hold(true));
    this.addEventListener('focusout', () => this.ticker.hold(false));
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.go(this.index + 1);
      if (e.key === 'ArrowLeft') this.go(this.index - 1);
    });
    // Theme editor: show the slide being edited.
    document.addEventListener('shopify:block:select', (e) => {
      const k = this.slides.findIndex((s) => s.contains(e.target) || s === e.target);
      if (k > -1) {
        this.go(k);
        this.ticker.hold(true);
      }
    });
    document.addEventListener('shopify:block:deselect', () => this.ticker.hold(false));
    this.go(0, true);
  }

  go(i, first = false) {
    const n = this.slides.length;
    const prev = this.index;
    this.index = (i + n) % n;
    this.dataset.direction = first || prev === undefined ? 'next' : (i > prev ? 'next' : 'prev');
    this.slides.forEach((s, k) => {
      const on = k === this.index;
      s.classList.toggle('is-active', on);
      s.classList.toggle('is-leaving', k === prev && !on);
      s.toggleAttribute('inert', !on);
      s.setAttribute('aria-hidden', String(!on));
      // Only the video for this screen size plays; the other one never downloads.
      $$('video', s).forEach((v) => (on && v.offsetParent !== null ? v.play().catch(() => {}) : v.pause()));
    });
    this.dots.forEach((d, k) => {
      d.classList.remove('is-active');
      d.setAttribute('aria-current', String(k === this.index));
      if (k === this.index) {
        void d.offsetWidth;
        d.classList.add('is-active');
      }
    });
    if (this.counter) this.counter.textContent = String(this.index + 1).padStart(2, '0');
    this.ticker.restart();
  }
}
define('slide-show', SlideShow);
