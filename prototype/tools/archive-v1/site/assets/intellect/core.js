/* Intellect · core.js
   Small helpers every module shares: DOM shortcuts, events, section fetching, money,
   dialogs (drawers and modals) and toasts. No dependencies. */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const theme = window.Theme || { routes: {}, strings: {} };

export const debounce = (fn, wait = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

/** Theme events are DOM events on document, prefixed "theme:". */
export const emit = (name, detail = {}) => document.dispatchEvent(new CustomEvent(`theme:${name}`, { detail }));
export const on = (name, handler) => {
  const fn = (e) => handler(e.detail, e);
  document.addEventListener(`theme:${name}`, fn);
  return () => document.removeEventListener(`theme:${name}`, fn);
};

export const define = (name, constructor) => {
  if (!customElements.get(name)) customElements.define(name, constructor);
};

export const motionOn = () => document.documentElement.classList.contains('motion-on');
export const isDesktop = () => matchMedia('(min-width: 990px)').matches;

export const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

/** Fetch one section rendered for a URL and return its parsed document. */
export async function fetchSection(sectionId, url = location.pathname + location.search, init = {}) {
  const u = new URL(url, location.origin);
  u.searchParams.set('section_id', sectionId);
  const res = await fetch(u, init);
  if (!res.ok) throw new Error(`Section ${sectionId} ${res.status}`);
  return parseHTML(await res.text());
}

/** Swap matching nodes from a freshly rendered document into the page. */
export function swap(fromDoc, selector, root = document) {
  const next = fromDoc.querySelector(selector);
  const current = root.querySelector(selector);
  if (next && current) current.replaceWith(next);
  return next;
}

/* ---------- Money ---------- */
const withDelimiters = (number, precision, thousands = ',', decimal = '.') => {
  if (Number.isNaN(number) || number == null) return '0';
  const [whole, fraction] = (number / 100).toFixed(precision).split('.');
  const formatted = whole.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousands}`);
  return fraction ? formatted + decimal + fraction : formatted;
};

export function formatMoney(cents, format = theme.showCurrencyCode ? theme.moneyWithCurrencyFormat : theme.moneyFormat) {
  const value = typeof cents === 'string' ? parseInt(cents.replace('.', ''), 10) : cents;
  return (format || '${{amount}}').replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    switch (key) {
      case 'amount_no_decimals': return withDelimiters(value, 0);
      case 'amount_with_comma_separator': return withDelimiters(value, 2, '.', ',');
      case 'amount_no_decimals_with_comma_separator': return withDelimiters(value, 0, '.', ',');
      case 'amount_with_apostrophe_separator': return withDelimiters(value, 2, "'", '.');
      case 'amount_with_space_separator': return withDelimiters(value, 2, ' ', ',');
      default: return withDelimiters(value, 2);
    }
  });
}

/* ---------- Dialogs ----------
   Every drawer and modal is a native <dialog>. Opening uses showModal() so focus is
   trapped and the page is inert; closing plays an exit animation first. */
const openDialogs = new Set();
let lastTrigger = null;

const syncLock = () => document.documentElement.classList.toggle('is-locked', openDialogs.size > 0);

export function openDialog(dialog, trigger = document.activeElement) {
  if (!dialog || dialog.open) return;
  lastTrigger = trigger;
  dialog.classList.remove('is-closing');
  dialog.showModal();
  openDialogs.add(dialog);
  syncLock();
  const focusTarget = dialog.querySelector('[autofocus]') || dialog.querySelector('[data-initial-focus]');
  if (focusTarget) requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
  dialog.dispatchEvent(new CustomEvent('dialog:open', { bubbles: true }));
  emit('dialog:open', { id: dialog.id });
}

export function closeDialog(dialog) {
  if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
  const finish = () => {
    dialog.classList.remove('is-closing');
    dialog.close();
    openDialogs.delete(dialog);
    syncLock();
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    dialog.dispatchEvent(new CustomEvent('dialog:close', { bubbles: true }));
    emit('dialog:close', { id: dialog.id });
  };
  const animated = getComputedStyle(dialog).animationName !== 'none' && motionAllowed();
  if (!animated) return finish();
  dialog.classList.add('is-closing');
  dialog.addEventListener('animationend', finish, { once: true });
  setTimeout(() => dialog.classList.contains('is-closing') && finish(), 600);
}

const motionAllowed = () => !['off', 'reduced'].includes(document.documentElement.dataset.motion);

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-dialog]');
  if (opener) {
    const dialog = document.getElementById(opener.dataset.openDialog);
    if (dialog) {
      e.preventDefault();
      openDialog(dialog, opener);
    }
    return;
  }
  const closer = e.target.closest('[data-close-dialog]');
  if (closer) {
    e.preventDefault();
    closeDialog(closer.closest('dialog'));
    return;
  }
  // Click on the backdrop (the dialog element itself, outside its content box).
  if (e.target instanceof HTMLDialogElement && e.target.open && !e.target.hasAttribute('data-blocking')) {
    const r = e.target.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside || e.target.dataset.backdropClose !== undefined) closeDialog(e.target);
  }
});

document.addEventListener('cancel', (e) => {
  if (e.target instanceof HTMLDialogElement) {
    e.preventDefault();
    if (!e.target.hasAttribute('data-blocking')) closeDialog(e.target);
  }
}, true);

/* ---------- Toasts ---------- */
export function toast(html, { timeout = 3800 } = {}) {
  const region = document.querySelector('[data-toast-region]');
  if (!region) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  region.append(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  }, timeout);
}

/* ---------- Misc ---------- */

/** Scroll the page; goes through smooth scrolling when it's on so the two never fight. */
export function scrollToY(y, { smooth = true } = {}) {
  const lenis = window.Theme?.lenis;
  const animate = smooth && motionAllowed();
  if (lenis) lenis.scrollTo(y, { immediate: !animate, duration: 1.1 });
  else window.scrollTo({ top: y, behavior: animate ? 'smooth' : 'auto' });
}

export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
