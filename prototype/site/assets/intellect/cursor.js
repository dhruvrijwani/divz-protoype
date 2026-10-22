/* Intellect · cursor.js
   A labelled disc that follows the mouse over elements marked data-cursor="View" etc.
   The native cursor stays everywhere else. Desktop mouse only; loaded on demand. */

const root = document.documentElement;
const el = document.createElement('div');
el.className = 'cursor';
el.setAttribute('aria-hidden', 'true');
el.innerHTML = '<span class="cursor__disc"><span class="cursor__label"></span></span>';
document.body.append(el);
const label = el.querySelector('.cursor__label');
root.classList.add('has-cursor');

let x = -200;
let y = -200;
let tx = x;
let ty = y;
let target = null;
let raf = 0;

const tick = () => {
  x += (tx - x) * 0.22;
  y += (ty - y) * 0.22;
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
};

const setTarget = (next) => {
  if (next === target) return;
  target = next;
  if (next) label.textContent = next.dataset.cursor;
  el.classList.toggle('is-active', Boolean(next));
};

document.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  // Phone-width layouts (including the editor's mobile preview) never show the disc.
  if (innerWidth < 750) {
    setTarget(null);
    return;
  }
  tx = e.clientX;
  ty = e.clientY;
  if (!target) {
    // Jump straight to the pointer when appearing, so the disc doesn't fly in from afar.
    x = tx;
    y = ty;
  }
  const over = e.target.closest?.('[data-cursor]');
  const blocked = e.target.closest?.('button, input, select, textarea, label, .card__sizes, .swatches, dialog');
  setTarget(over && !blocked ? over : null);
  if (!raf) raf = requestAnimationFrame(tick);
}, { passive: true });

document.addEventListener('pointerleave', () => setTarget(null));
document.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
document.addEventListener('pointerup', () => el.classList.remove('is-pressed'));
document.addEventListener('theme:dialog:open', () => setTarget(null));
