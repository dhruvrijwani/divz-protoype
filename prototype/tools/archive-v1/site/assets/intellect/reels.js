/* Intellect · reels.js
   Shoppable videos: previews play only while on screen (or on hover), and a tap opens a
   full-screen, story-style viewer with progress bars, sound and the product sheet. */

import { $, $$, define, openDialog, closeDialog, motionOn, theme } from '@theme/core';

const playSafe = (video) => video?.play().catch(() => {});

class VideoReels extends HTMLElement {
  connectedCallback() {
    this.reels = $$('[data-reel]', this);
    this.mode = this.dataset.autoplay;
    const videos = this.reels.map((r) => r.querySelector('video')).filter(Boolean);

    if (this.mode === 'view' && motionOn()) {
      this.io = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          const video = target.querySelector('video');
          if (!video) return;
          if (isIntersecting && intersectionRatio > 0.55) {
            video.preload = 'auto';
            playSafe(video);
          } else video.pause();
        });
      }, { threshold: [0, 0.55, 1] });
      this.reels.forEach((r) => this.io.observe(r));
    } else if (this.mode === 'hover') {
      this.reels.forEach((r) => {
        const video = r.querySelector('video');
        r.addEventListener('pointerenter', () => playSafe(video));
        r.addEventListener('pointerleave', () => video?.pause());
      });
    }
    videos.forEach((v) => {
      v.muted = true;
      v.removeAttribute('controls');
    });

    this.addEventListener('click', (e) => {
      const open = e.target.closest('[data-reel-open]');
      if (!open) return;
      e.preventDefault();
      this.openViewer(Number(open.closest('[data-reel]').dataset.index));
    });
  }

  disconnectedCallback() {
    this.io?.disconnect();
  }

  buildViewer() {
    if (this.viewer) return this.viewer;
    const d = document.createElement('dialog');
    d.className = 'reel-viewer';
    d.setAttribute('aria-label', this.querySelector('h2')?.textContent.trim() || 'Videos');
    d.innerHTML = `
      <div class="reel-viewer__stage">
        <div class="reel-viewer__bars">${this.reels.map(() => '<span><i></i></span>').join('')}</div>
        <div class="reel-viewer__top">
          <span class="reel-viewer__creator caption"></span>
          <div class="reel-viewer__actions">
            <button type="button" class="reel-viewer__btn" data-sound aria-label="Sound"></button>
            <button type="button" class="reel-viewer__btn" data-close-dialog aria-label="Close">${closeIcon}</button>
          </div>
        </div>
        <div class="reel-viewer__frame"><video playsinline></video></div>
        <button type="button" class="reel-viewer__zone reel-viewer__zone--prev" data-prev aria-label="Previous"></button>
        <button type="button" class="reel-viewer__zone reel-viewer__zone--next" data-next aria-label="Next"></button>
        <div class="reel-viewer__sheet"></div>
      </div>`;
    document.body.append(d);
    this.viewer = d;
    this.video = $('video', d);
    this.muted = true;
    this.updateSound();
    $('[data-prev]', d).addEventListener('click', () => this.go(this.index - 1));
    $('[data-next]', d).addEventListener('click', () => this.go(this.index + 1));
    $('[data-sound]', d).addEventListener('click', () => {
      this.muted = !this.muted;
      this.video.muted = this.muted;
      this.updateSound();
    });
    this.video.addEventListener('timeupdate', () => {
      const bar = $$('.reel-viewer__bars i', d)[this.index];
      if (bar && this.video.duration) bar.style.transform = `scaleX(${this.video.currentTime / this.video.duration})`;
    });
    this.video.addEventListener('ended', () => this.go(this.index + 1));
    d.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.go(this.index + 1);
      if (e.key === 'ArrowLeft') this.go(this.index - 1);
    });
    d.addEventListener('dialog:close', () => {
      this.video.pause();
      this.reels.forEach((r) => this.mode === 'view' && this.io && playSafe(r.querySelector('video')));
    });
    // Swipe left / right on touch.
    let startX = 0;
    d.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
    d.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) this.go(this.index + (dx < 0 ? 1 : -1));
    });
    return d;
  }

  updateSound() {
    $('[data-sound]', this.viewer).innerHTML = this.muted ? volumeOffIcon : volumeIcon;
  }

  openViewer(index) {
    this.buildViewer();
    this.reels.forEach((r) => r.querySelector('video')?.pause());
    openDialog(this.viewer);
    this.go(index);
  }

  go(index) {
    if (index < 0) index = 0;
    if (index >= this.reels.length) {
      closeDialog(this.viewer);
      return;
    }
    const direction = index >= (this.index ?? 0) ? 1 : -1;
    this.index = index;
    const reel = this.reels[index];
    const source = reel.querySelector('video');
    const bars = $$('.reel-viewer__bars i', this.viewer);
    bars.forEach((b, i) => (b.style.transform = `scaleX(${i < index ? 1 : 0})`));

    if (source) {
      this.video.innerHTML = source.innerHTML;
      this.video.poster = source.poster || '';
      this.video.muted = this.muted;
      this.video.load();
      playSafe(this.video);
    }
    $('.reel-viewer__creator', this.viewer).textContent = reel.querySelector('.reel__creator')?.textContent.trim() || '';
    const sheet = $('.reel-viewer__sheet', this.viewer);
    const tpl = reel.querySelector('template[data-reel-sheet]');
    sheet.replaceChildren(tpl ? tpl.content.cloneNode(true) : '');
    if (motionOn()) {
      $('.reel-viewer__frame', this.viewer).animate(
        [{ opacity: 0.4, transform: `translateX(${direction * 40}px) scale(0.98)` }, { opacity: 1, transform: 'none' }],
        { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
      sheet.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    }
  }
}

const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const volumeOffIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/></svg>';
const volumeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';

define('video-reels', VideoReels);
export { theme };
