/* Intellect · motion.js
   Scroll reveals for anything marked data-reveal, data-reveal-media or data-split.
   CSS owns the look (base.css); this file only decides when things are "in".
   Elements that enter together are staggered automatically in reading order. */

const root = document.documentElement;
const mode = root.dataset.revealHeadings || 'lines';
const SELECTOR = '[data-reveal], [data-reveal-media], [data-split]';

let observer;

export function motionEnabled() {
  return !['off', 'reduced'].includes(root.dataset.motion);
}

/** Wrap every word (keeping links, em and strong intact) so each can rise inside a clip box. */
export function splitWords(el) {
  if (el.classList.contains('is-split')) return;
  const words = [];
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        if (parts.length === 1 && !parts[0].trim()) continue;
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(' '));
            continue;
          }
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.textContent = part;
          w.append(wi);
          frag.append(w);
          words.push(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(el);
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  words.forEach((w) => w.setAttribute('aria-hidden', 'true'));
  el.classList.add('is-split');
  timeWords(el);
}

/** Delay per line (lines mode) or per word (words / fade mode). */
function timeWords(el) {
  const words = el.querySelectorAll('.w');
  let line = -1;
  let lastTop = null;
  words.forEach((w, i) => {
    const top = w.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      line += 1;
      lastTop = top;
    }
    const delay = mode === 'lines' ? line * 110 : i * 38;
    w.firstChild.style.setProperty('--d', delay);
  });
}

function reveal(entries) {
  const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
  entering
    .sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.top - rb.top || ra.left - rb.left;
    })
    .forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 8));
      el.classList.add('is-in');
      observer.unobserve(el);
    });
}

export function initMotion(scope = document) {
  const elements = Array.from(scope.querySelectorAll(SELECTOR));
  if (scope instanceof Element && scope.matches(SELECTOR)) elements.push(scope);

  if (!motionEnabled()) {
    elements.forEach((el) => el.classList.add('is-in'));
    return;
  }

  observer ||= new IntersectionObserver(reveal, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  for (const el of elements) {
    if (el.closest('#MainContent > .shopify-section:first-child')) {
      el.classList.add('is-in');
      continue;
    }
    if (el.hasAttribute('data-split')) {
      if (mode === 'none') {
        el.classList.add('is-in', 'is-split');
        continue;
      }
      splitWords(el);
    }
    observer.observe(el);
  }
}

/* Re-time split headings after a resize changes where lines break (only those not yet shown). */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('[data-split].is-split:not(.is-in)').forEach(timeWords);
  }, 200);
});
