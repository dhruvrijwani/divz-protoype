/* Intellect · bundle.js
   Build-a-box: choose a size, fill the slots (items fly in), the lid closes when full and the
   whole box goes to the cart as one grouped set. */

import { $, $$, define, formatMoney, motionOn, toast } from '@theme/core';
import { Cart, openCart } from '@theme/cart';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

class BoxBuilder extends HTMLElement {
  connectedCallback() {
    this.items = [];
    this.sizeBtns = $$('[data-size]', this);
    this.size = Number(this.sizeBtns[0]?.dataset.size || 3);
    this.discount = Number(this.sizeBtns[0]?.dataset.discount || 0);
    this.slots = $('[data-slots]', this);
    this.crate = $('[data-box-crate]', this);

    this.addEventListener('click', (e) => {
      const add = e.target.closest('[data-box-add]');
      const size = e.target.closest('[data-size]');
      const remove = e.target.closest('[data-remove-slot]');
      if (add) this.add(add);
      if (size) this.setSize(size);
      if (remove) this.remove(Number(remove.dataset.removeSlot));
      if (e.target.closest('[data-box-submit]')) this.submit();
      if (e.target.closest('[data-box-reopen]')) this.reopen();
      if (e.target.closest('[data-box-tray]')) this.toggleTray();
    });
    this.addEventListener('change', (e) => {
      const select = e.target.closest('[data-box-variant-select]');
      if (!select) return;
      const btn = select.closest('[data-box-product]').querySelector('[data-box-add]');
      btn.dataset.variant = select.value;
      btn.dataset.price = select.selectedOptions[0].dataset.price;
    });
    this.addEventListener('keydown', (e) => {
      if (!e.target.closest('[data-size]') || !['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const i = this.sizeBtns.indexOf(e.target.closest('[data-size]'));
      const next = this.sizeBtns[(i + (e.key === 'ArrowRight' ? 1 : -1) + this.sizeBtns.length) % this.sizeBtns.length];
      next.focus();
      this.setSize(next);
    });
    this.render();
    requestAnimationFrame(() => this.movePill());
  }

  setSize(btn) {
    const size = Number(btn.dataset.size);
    if (size === this.size) return;
    this.sizeBtns.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-checked', String(b === btn));
    });
    this.size = size;
    this.discount = Number(btn.dataset.discount || 0);
    if (this.items.length > size) this.items = this.items.slice(0, size);
    this.movePill();
    this.render();
  }

  movePill() {
    const active = this.sizeBtns.find((b) => b.classList.contains('is-active'));
    const pill = $('.box__size-pill', this);
    if (!active || !pill) return;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
  }

  add(btn) {
    if (this.items.length >= this.size) {
      if (motionOn()) this.crate.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 380 });
      const bigger = this.sizeBtns.find((b) => Number(b.dataset.size) > this.size);
      toast(this.dataset.textBlocked + (bigger ? ` (${bigger.dataset.size})` : ''));
      return;
    }
    const item = { variant: btn.dataset.variant, price: Number(btn.dataset.price), title: btn.dataset.title, image: btn.dataset.image, product: btn.closest('[data-box-product]').dataset.boxProduct };
    this.items.push(item);
    const index = this.items.length - 1;
    this.render();
    const slot = this.slots.children[index];
    const img = btn.closest('[data-box-product]').querySelector('img');
    if (motionOn() && img && slot) this.fly(img, slot);
  }

  fly(img, slot) {
    const from = img.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const ghost = img.cloneNode();
    ghost.removeAttribute('srcset');
    ghost.src = img.currentSrc || img.src;
    ghost.className = 'box__ghost';
    ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
    document.body.append(ghost);
    slot.style.opacity = '0';
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    ghost.animate(
      [
        { transform: 'translate(0,0) scale(1)', borderRadius: '12px' },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(${(to.width / from.width + 1) / 2})`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(${to.width / from.width})`, borderRadius: '8px' },
      ],
      { duration: 640, easing: 'cubic-bezier(.45,0,.2,1)' }
    ).finished.then(() => {
      ghost.remove();
      slot.style.opacity = '';
      slot.animate([{ transform: 'scale(0.8)' }, { transform: 'scale(1.08)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    });
  }

  remove(i) {
    this.items.splice(i, 1);
    this.crate.classList.remove('is-closed');
    this.render();
  }

  reopen() {
    this.crate.classList.remove('is-closed');
    this.render();
  }

  render() {
    const full = this.items.length === this.size;
    this.slots.style.setProperty('--slots', this.size);
    this.slots.innerHTML = Array.from({ length: this.size }, (_, i) => {
      const it = this.items[i];
      return it
        ? `<li class="box__slot is-filled"><img src="${esc(it.image)}" alt="" width="200" height="200"><button type="button" class="box__remove" data-remove-slot="${i}" aria-label="${esc(this.dataset.textRemove.replace('[title]', it.title))}">×</button></li>`
        : `<li class="box__slot"><span>${i + 1}</span></li>`;
    }).join('');

    const subtotal = this.items.reduce((sum, it) => sum + it.price, 0);
    const saving = full ? Math.round((subtotal * this.discount) / 100) : 0;
    $('[data-items-total]', this).textContent = formatMoney(subtotal);
    $('[data-saving]', this).textContent = saving ? `−${formatMoney(saving)}` : formatMoney(0);
    $('[data-box-total]', this).textContent = formatMoney(subtotal - saving);
    $('[data-meter]', this).style.transform = `scaleX(${this.items.length / this.size})`;

    const left = this.size - this.items.length;
    const progress = $('[data-progress]', this);
    progress.textContent = full
      ? this.dataset.textFull.replace('[discount]', this.discount)
      : this.dataset.textProgress.replace('[count]', this.items.length).replace('[size]', this.size) + ' ' + this.dataset.textMore.replace('[left]', left).replace('[discount]', this.discount);

    const submit = $('[data-box-submit]', this);
    submit.disabled = !full;
    $('[data-box-submit-label]', this).textContent = full ? this.dataset.textAdd.replace('[price]', formatMoney(subtotal - saving)) : this.dataset.textFill;
    $('[data-box-reopen]', this).hidden = !this.crate.classList.contains('is-closed');

    // Count badges on product cards.
    $$('[data-box-product]', this).forEach((card) => {
      const n = this.items.filter((it) => it.product === card.dataset.boxProduct).length;
      const badge = $('[data-count]', card);
      badge.hidden = n === 0;
      badge.querySelector('span').textContent = n;
    });

    // Mobile tray
    $('[data-tray-slots]', this).innerHTML = Array.from({ length: this.size }, (_, i) => (this.items[i] ? `<img src="${esc(this.items[i].image)}" alt="" width="40" height="40">` : '<i></i>')).join('');
    $('[data-tray-text]', this).textContent = `${this.items.length}/${this.size} · ${formatMoney(subtotal - saving)}`;

    if (full && !this.crate.classList.contains('is-closed')) {
      setTimeout(() => {
        if (this.items.length === this.size) {
          this.crate.classList.add('is-closed');
          $('[data-box-reopen]', this).hidden = false;
        }
      }, motionOn() ? 650 : 0);
    }
  }

  toggleTray() {
    const open = this.classList.toggle('tray-open');
    $('[data-box-tray]', this).setAttribute('aria-expanded', String(open));
  }

  async submit() {
    if (this.items.length !== this.size) return;
    const btn = $('[data-box-submit]', this);
    btn.classList.add('is-loading');
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    const label = `${this.dataset.name} · ${this.size} · ${code}`;
    const items = this.items.map((it) => ({ id: Number(it.variant), quantity: 1, properties: { Box: label, _box: code } }));
    if (this.dataset.boxVariant) items.unshift({ id: Number(this.dataset.boxVariant), quantity: 1, properties: { Box: label, _box: code } });
    try {
      const data = new FormData();
      items.forEach((it, i) => {
        data.append(`items[${i}][id]`, it.id);
        data.append(`items[${i}][quantity]`, it.quantity);
        Object.entries(it.properties).forEach(([k, v]) => data.append(`items[${i}][properties][${k}]`, v));
      });
      if (motionOn()) await this.crate.animate([{ transform: 'none' }, { transform: 'scale(0.9) translateY(-10px)' }, { transform: 'scale(0.2) translate(40vw, -40vh)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished;
      await Cart.add(data);
      this.crate.getAnimations().forEach((a) => a.cancel());
      this.items = [];
      this.crate.classList.remove('is-closed');
      this.render();
      if (motionOn()) this.crate.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
      openCart();
    } catch (err) {
      toast(err.message);
      this.crate.getAnimations().forEach((a) => a.cancel());
    } finally {
      btn.classList.remove('is-loading');
    }
  }
}
define('box-builder', BoxBuilder);
