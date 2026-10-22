/* Intellect · slider.js
   Scroll-snap carousel: arrows, progress line and mouse drag. Native scrolling does the
   rest, so touch and trackpads feel right. */

import { define, motionOn } from '@theme/core';

class SliderComponent extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-slider-track]');
    if (!this.track) return;
    this.prev = this.querySelector('[data-slider-prev]');
    this.next = this.querySelector('[data-slider-next]');
    this.bar = this.querySelector('[data-slider-progress]');
    this.prev?.addEventListener('click', () => this.page(-1));
    this.next?.addEventListener('click', () => this.page(1));
    this.update = this.update.bind(this);
    this.track.addEventListener('scroll', this.update, { passive: true });
    new ResizeObserver(this.update).observe(this.track);
    this.enableDrag();
    this.update();
  }

  page(direction) {
    const item = this.track.firstElementChild;
    const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
    const step = item ? item.getBoundingClientRect().width + gap : this.track.clientWidth;
    const perView = Math.max(1, Math.floor((this.track.clientWidth + gap) / step));
    this.track.scrollBy({ left: direction * step * perView, behavior: motionOn() ? 'smooth' : 'auto' });
  }

  update() {
    const { scrollLeft, scrollWidth, clientWidth } = this.track;
    const max = scrollWidth - clientWidth;
    if (this.prev) this.prev.disabled = scrollLeft <= 2;
    if (this.next) this.next.disabled = scrollLeft >= max - 2;
    this.toggleAttribute('data-static', max <= 2);
    if (this.bar) {
      const width = Math.min(100, (clientWidth / scrollWidth) * 100);
      const x = max > 0 ? (scrollLeft / max) * (100 / width - 1) * 100 : 0;
      this.bar.style.setProperty('--w', `${width}%`);
      this.bar.style.setProperty('--x', `${x}%`);
    }
  }

  enableDrag() {
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;
    this.track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = this.track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        this.track.classList.add('is-dragging');
      }
      if (moved) this.track.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        this.track.classList.remove('is-dragging');
        // Swallow the click that ends a drag so links don't open.
        this.track.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
      }
    });
  }
}
define('slider-component', SliderComponent);
