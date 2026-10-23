(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // site/assets/intellect/core.js
  async function fetchSection(sectionId, url = location.pathname + location.search, init = {}) {
    const u = new URL(url, location.origin);
    u.searchParams.set("section_id", sectionId);
    const res = await fetch(u, init);
    if (!res.ok) throw new Error(`Section ${sectionId} ${res.status}`);
    return parseHTML(await res.text());
  }
  function formatMoney(cents, format = theme.showCurrencyCode ? theme.moneyWithCurrencyFormat : theme.moneyFormat) {
    const value = typeof cents === "string" ? parseInt(cents.replace(".", ""), 10) : cents;
    return (format || "${{amount}}").replace(/\{\{\s*(\w+)\s*\}\}/, (_2, key) => {
      switch (key) {
        case "amount_no_decimals":
          return withDelimiters(value, 0);
        case "amount_with_comma_separator":
          return withDelimiters(value, 2, ".", ",");
        case "amount_no_decimals_with_comma_separator":
          return withDelimiters(value, 0, ".", ",");
        case "amount_with_apostrophe_separator":
          return withDelimiters(value, 2, "'", ".");
        case "amount_with_space_separator":
          return withDelimiters(value, 2, " ", ",");
        default:
          return withDelimiters(value, 2);
      }
    });
  }
  function openDialog(dialog, trigger = document.activeElement) {
    if (!dialog || dialog.open) return;
    lastTrigger = trigger;
    dialog.classList.remove("is-closing");
    dialog.showModal();
    openDialogs.add(dialog);
    syncLock();
    const focusTarget = dialog.querySelector("[autofocus]") || dialog.querySelector("[data-initial-focus]");
    if (focusTarget) requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    dialog.dispatchEvent(new CustomEvent("dialog:open", { bubbles: true }));
    emit("dialog:open", { id: dialog.id });
  }
  function closeDialog(dialog) {
    if (!dialog || !dialog.open || dialog.classList.contains("is-closing")) return;
    const finish = () => {
      dialog.classList.remove("is-closing");
      dialog.close();
      openDialogs.delete(dialog);
      syncLock();
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
      dialog.dispatchEvent(new CustomEvent("dialog:close", { bubbles: true }));
      emit("dialog:close", { id: dialog.id });
    };
    const animated = getComputedStyle(dialog).animationName !== "none" && motionAllowed();
    if (!animated) return finish();
    dialog.classList.add("is-closing");
    dialog.addEventListener("animationend", finish, { once: true });
    setTimeout(() => dialog.classList.contains("is-closing") && finish(), 600);
  }
  function toast(html2, { timeout = 3800 } = {}) {
    const region = document.querySelector("[data-toast-region]");
    if (!region) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = html2;
    region.append(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    }, timeout);
  }
  function scrollToY(y, { smooth = true } = {}) {
    const lenis = window.Theme?.lenis;
    const animate = smooth && motionAllowed();
    if (lenis) lenis.scrollTo(y, { immediate: !animate, duration: 1.1 });
    else window.scrollTo({ top: y, behavior: animate ? "smooth" : "auto" });
  }
  var $, $$, theme, debounce, emit, on, define, motionOn, isDesktop, parseHTML, withDelimiters, openDialogs, lastTrigger, syncLock, motionAllowed;
  var init_core = __esm({
    "site/assets/intellect/core.js"() {
      $ = (selector, root2 = document) => root2.querySelector(selector);
      $$ = (selector, root2 = document) => Array.from(root2.querySelectorAll(selector));
      theme = window.Theme || { routes: {}, strings: {} };
      debounce = (fn, wait = 200) => {
        let t;
        return (...args) => {
          clearTimeout(t);
          t = setTimeout(() => fn(...args), wait);
        };
      };
      emit = (name2, detail = {}) => document.dispatchEvent(new CustomEvent(`theme:${name2}`, { detail }));
      on = (name2, handler) => {
        const fn = (e) => handler(e.detail, e);
        document.addEventListener(`theme:${name2}`, fn);
        return () => document.removeEventListener(`theme:${name2}`, fn);
      };
      define = (name2, constructor) => {
        if (!customElements.get(name2)) customElements.define(name2, constructor);
      };
      motionOn = () => document.documentElement.classList.contains("motion-on");
      isDesktop = () => matchMedia("(min-width: 990px)").matches;
      parseHTML = (html2) => new DOMParser().parseFromString(html2, "text/html");
      withDelimiters = (number, precision, thousands = ",", decimal = ".") => {
        if (Number.isNaN(number) || number == null) return "0";
        const [whole, fraction] = (number / 100).toFixed(precision).split(".");
        const formatted = whole.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousands}`);
        return fraction ? formatted + decimal + fraction : formatted;
      };
      openDialogs = /* @__PURE__ */ new Set();
      lastTrigger = null;
      syncLock = () => document.documentElement.classList.toggle("is-locked", openDialogs.size > 0);
      motionAllowed = () => !["off", "reduced"].includes(document.documentElement.dataset.motion);
      document.addEventListener("click", (e) => {
        const opener = e.target.closest("[data-open-dialog]");
        if (opener) {
          const dialog = document.getElementById(opener.dataset.openDialog);
          if (dialog) {
            e.preventDefault();
            openDialog(dialog, opener);
          }
          return;
        }
        const closer = e.target.closest("[data-close-dialog]");
        if (closer) {
          e.preventDefault();
          closeDialog(closer.closest("dialog"));
          return;
        }
        if (e.target instanceof HTMLDialogElement && e.target.open && !e.target.hasAttribute("data-blocking")) {
          const r = e.target.getBoundingClientRect();
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (!inside || e.target.dataset.backdropClose !== void 0) closeDialog(e.target);
        }
      });
      document.addEventListener("cancel", (e) => {
        if (e.target instanceof HTMLDialogElement) {
          e.preventDefault();
          if (!e.target.hasAttribute("data-blocking")) closeDialog(e.target);
        }
      }, true);
    }
  });

  // site/assets/intellect/motion.js
  function motionEnabled() {
    return !["off", "reduced"].includes(root.dataset.motion);
  }
  function splitWords(el) {
    if (el.classList.contains("is-split")) return;
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
              frag.append(document.createTextNode(" "));
              continue;
            }
            const w = document.createElement("span");
            w.className = "w";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = part;
            w.append(wi);
            frag.append(w);
            words.push(w);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          walk(child);
        }
      }
    };
    walk(el);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    words.forEach((w) => w.setAttribute("aria-hidden", "true"));
    el.classList.add("is-split");
    timeWords(el);
  }
  function timeWords(el) {
    const words = el.querySelectorAll(".w");
    let line = -1;
    let lastTop = null;
    words.forEach((w, i) => {
      const top = w.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        line += 1;
        lastTop = top;
      }
      const delay = mode === "lines" ? line * 110 : i * 38;
      w.firstChild.style.setProperty("--d", delay);
    });
  }
  function reveal(entries) {
    const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    entering.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return ra.top - rb.top || ra.left - rb.left;
    }).forEach((el, i) => {
      if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", Math.min(i, 8));
      el.classList.add("is-in");
      observer.unobserve(el);
    });
  }
  function initMotion(scope = document) {
    const elements = Array.from(scope.querySelectorAll(SELECTOR));
    if (scope instanceof Element && scope.matches(SELECTOR)) elements.push(scope);
    if (!motionEnabled()) {
      elements.forEach((el) => el.classList.add("is-in"));
      return;
    }
    observer || (observer = new IntersectionObserver(reveal, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }));
    for (const el of elements) {
      if (el.closest("#MainContent > .shopify-section:first-child")) {
        el.classList.add("is-in");
        continue;
      }
      if (el.hasAttribute("data-split")) {
        if (mode === "none") {
          el.classList.add("is-in", "is-split");
          continue;
        }
        splitWords(el);
      }
      observer.observe(el);
    }
  }
  var root, mode, SELECTOR, observer, resizeTimer;
  var init_motion = __esm({
    "site/assets/intellect/motion.js"() {
      root = document.documentElement;
      mode = root.dataset.revealHeadings || "lines";
      SELECTOR = "[data-reveal], [data-reveal-media], [data-split]";
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          document.querySelectorAll("[data-split].is-split:not(.is-in)").forEach(timeWords);
        }, 200);
      });
    }
  });

  // site/assets/intellect/product.js
  var product_exports = {};
  function updateSection(root2, doc, variant) {
    ["[data-price-wrap]", "[data-inventory]", "[data-sku]", "[data-variant-picker]"].forEach((selector) => {
      const next = doc.querySelector(selector);
      const current = root2.querySelector(selector);
      if (next && current) current.replaceWith(next);
    });
    const form = root2.querySelector("[data-buy-buttons]");
    const nextForm = doc.querySelector("[data-buy-buttons]");
    if (form && nextForm) {
      const idInput = form.querySelector("[data-variant-id]");
      const nextId = nextForm.querySelector("[data-variant-id]");
      if (idInput && nextId) {
        idInput.value = nextId.value;
        idInput.disabled = nextId.disabled;
      }
      const button = form.querySelector("[data-add-button]");
      const nextButton = nextForm.querySelector("[data-add-button]");
      if (button && nextButton) {
        button.disabled = nextButton.disabled;
        const labelEl = button.querySelector("[data-add-label]");
        const nextLabel = nextButton.querySelector("[data-add-label]");
        if (labelEl && nextLabel && labelEl.textContent !== nextLabel.textContent) {
          labelEl.textContent = nextLabel.textContent;
          labelEl.dataset.text = nextLabel.textContent;
        }
      }
      form.querySelector(".buy-buttons__dynamic")?.classList.toggle("is-hidden", !variant?.available);
    }
    const pickup = root2.querySelector("pickup-availability");
    if (pickup && variant) {
      pickup.dataset.variantId = variant.id;
      pickup.hidden = !variant.available;
      pickup.load();
    }
    if (variant?.featured_media) root2.querySelector("media-gallery")?.showMedia(variant.featured_media.id, variant);
  }
  var VariantPicker, SizeChart, MediaGallery, PickupAvailability, ProductRecommendations, productRoot, DAY, DeliveryEstimate, BuyBar, GiftMode, PersonaliseBlock;
  var init_product = __esm({
    "site/assets/intellect/product.js"() {
      init_core();
      init_cart();
      init_motion();
      VariantPicker = class extends HTMLElement {
        connectedCallback() {
          this.addEventListener("change", (e) => this.onChange(e.target));
        }
        selectedValueIds() {
          return $$("fieldset", this).map((fs) => fs.querySelector("select")?.value || fs.querySelector("input:checked")?.value).filter(Boolean);
        }
        async onChange(target) {
          const fieldset = target.closest("fieldset");
          const label = fieldset?.querySelector("[data-option-label]");
          const option = target.tagName === "SELECT" ? target.selectedOptions[0] : target;
          if (label) label.textContent = option.dataset.optionValue || option.textContent.split(" \u2014 ")[0].trim();
          const root2 = this.closest("[data-product-root]");
          const sectionId = this.dataset.sectionId;
          const productUrl = option.dataset.productUrl || this.dataset.productUrl;
          const focusedId = document.activeElement?.id;
          this.controller?.abort();
          this.controller = new AbortController();
          root2.classList.add("is-updating");
          try {
            const url = `${productUrl}?section_id=${sectionId}&option_values=${this.selectedValueIds().join(",")}`;
            const doc = parseHTML(await fetch(url, { signal: this.controller.signal }).then((r) => r.text()));
            const variant = JSON.parse(doc.querySelector("[data-selected-variant]")?.textContent || "null");
            if (productUrl !== this.dataset.productUrl) {
              const next = doc.querySelector("[data-product-root]");
              if (next) {
                root2.replaceWith(next);
                window.Shopify?.PaymentButton?.init?.();
                history.replaceState({}, "", variant ? `${productUrl}?variant=${variant.id}` : productUrl);
                if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
                emit("variant:change", { variant, sectionId, root: next });
              }
              return;
            }
            updateSection(root2, doc, variant);
            if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
            if (variant && root2.closest(".main")) {
              const u = new URL(location.href);
              u.searchParams.set("variant", variant.id);
              history.replaceState({}, "", u);
            }
            emit("variant:change", { variant, sectionId, root: root2 });
          } catch (err) {
            if (err.name !== "AbortError") console.error(err);
          } finally {
            root2.classList.remove("is-updating");
          }
        }
      };
      define("variant-picker", VariantPicker);
      SizeChart = class extends HTMLElement {
        connectedCallback() {
          this.base = this.dataset.unit === "in" ? "in" : "cm";
          const unitRe = /\b(cm|in|inch|inches)\b/i;
          const heads = $$("thead th", this);
          this.cols = heads.map((th, i) => unitRe.test(th.textContent) ? i : -1).filter((i) => i > 0);
          heads.forEach((th) => th.dataset.text = th.textContent);
          $$("tbody tr", this).forEach((tr) => [...tr.children].forEach((c) => c.dataset.text = c.textContent));
          const unitBox = $$("[data-unit-btn]", this);
          if (!this.cols.length) unitBox[0]?.parentElement.remove();
          unitBox.forEach((b) => b.addEventListener("click", () => this.show(b.dataset.unitBtn, true)));
          let saved = null;
          try {
            saved = localStorage.getItem("theme:size-unit");
          } catch {
          }
          if (saved && saved !== this.base && this.cols.length) this.show(saved);
          this.closest("dialog")?.addEventListener("dialog:open", () => this.markCurrent());
        }
        show(unit, remember = false) {
          const convert = (text) => {
            if (unit === this.base) return text;
            return text.replace(/\d+(?:[.,]\d+)?/g, (n) => {
              const v = parseFloat(n.replace(",", "."));
              const out = unit === "in" ? Math.round(v / 2.54 * 2) / 2 : Math.round(v * 2.54);
              return String(out);
            });
          };
          $$("thead th", this).forEach((th, i) => {
            if (this.cols.includes(i)) th.textContent = unit === this.base ? th.dataset.text : th.dataset.text.replace(/\b(cm|in|inch|inches)\b/i, unit);
          });
          $$("tbody tr", this).forEach((tr) => [...tr.children].forEach((c, i) => {
            if (this.cols.includes(i)) c.textContent = convert(c.dataset.text);
          }));
          $$("[data-unit-btn]", this).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.unitBtn === unit)));
          if (remember) try {
            localStorage.setItem("theme:size-unit", unit);
          } catch {
          }
        }
        // Highlight the row for the size the shopper has picked on this product.
        markCurrent() {
          const root2 = this.closest("[data-product-root]") || this.closest(".shopify-section") || document;
          const picked = $$("[data-option-label]", root2).map((l) => l.textContent.trim().toLowerCase());
          $$("tbody tr", this).forEach((tr) => {
            const on2 = picked.includes(tr.dataset.size);
            tr.classList.toggle("is-current", on2);
            if (on2) tr.firstElementChild.dataset.label = theme.strings.sizeSelected || "";
          });
        }
      };
      define("size-chart", SizeChart);
      MediaGallery = class extends HTMLElement {
        connectedCallback() {
          this.track = this.querySelector("[data-gallery-track]");
          this.items = $$(".gallery__item", this);
          this.dots = $$(".gallery__dot", this);
          this.counter = this.querySelector("[data-gallery-current]");
          this.layout = this.dataset.layout;
          this.observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && this.isHorizontal()) this.setActive(this.visibleItems().indexOf(entry.target));
              });
            },
            { root: this.track, threshold: 0.6 }
          );
          this.items.forEach((item) => this.observer.observe(item));
          this.querySelector("[data-gallery-prev]")?.addEventListener("click", () => this.step(-1));
          this.querySelector("[data-gallery-next]")?.addEventListener("click", () => this.step(1));
          this.addEventListener("click", (e) => {
            const thumb = e.target.closest("[data-thumb]");
            if (thumb) return this.scrollToItem(this.items.find((i) => i.dataset.mediaId === thumb.dataset.thumb));
            const zoom = e.target.closest("[data-zoom]") || isDesktop() && e.target.closest('.gallery__item[data-media-type="image"] img');
            if (zoom) this.openLightbox(e.target.closest(".gallery__item").dataset.mediaId);
          });
          const picker = this.closest("[data-product-root]")?.querySelector("variant-picker");
          if (this.dataset.hideVariants === "true" && picker) {
            const variant = JSON.parse(picker.querySelector("[data-selected-variant]")?.textContent || "null");
            this.filterByColour(variant);
          }
        }
        disconnectedCallback() {
          this.observer?.disconnect();
        }
        isHorizontal() {
          return !isDesktop() || this.layout === "carousel" || this.layout === "thumbs";
        }
        visibleItems() {
          return this.items.filter((i) => !i.hidden);
        }
        setActive(index) {
          if (index < 0) return;
          this.index = index;
          const items = this.visibleItems();
          items.forEach((item, i) => item.classList.toggle("is-active", i === index));
          this.dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
          if (this.counter) this.counter.textContent = index + 1;
          const id = items[index]?.dataset.mediaId;
          $$("[data-thumb]", this).forEach((t) => t.classList.toggle("is-active", t.dataset.thumb === id));
          const prev = this.querySelector("[data-gallery-prev]");
          const next = this.querySelector("[data-gallery-next]");
          if (prev) prev.disabled = index === 0;
          if (next) next.disabled = index === items.length - 1;
          this.items.forEach((item) => {
            const video = item.querySelector("video");
            if (!video) return;
            item.classList.contains("is-active") ? video.play().catch(() => {
            }) : video.pause();
          });
        }
        step(direction) {
          const items = this.visibleItems();
          this.scrollToItem(items[Math.max(0, Math.min(items.length - 1, (this.index || 0) + direction))]);
        }
        scrollToItem(item, smooth = true) {
          if (!item) return;
          if (this.isHorizontal()) {
            this.track.scrollTo({ left: item.offsetLeft - this.track.offsetLeft, behavior: smooth && motionOn() ? "smooth" : "auto" });
          }
          this.setActive(this.visibleItems().indexOf(item));
        }
        showMedia(mediaId, variant) {
          if (this.dataset.hideVariants === "true") this.filterByColour(variant);
          const item = this.items.find((i) => i.dataset.mediaId === String(mediaId));
          if (!item) return;
          if (this.isHorizontal()) return this.scrollToItem(item);
          if (this.track.firstElementChild !== item) {
            this.track.prepend(item);
            this.items = $$(".gallery__item", this);
            if (motionOn()) item.animate([{ opacity: 0.2, transform: "scale(1.02)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
          }
          const top = this.getBoundingClientRect().top;
          if (top < 0) scrollToY(window.scrollY + top - 100);
        }
        filterByColour(variant) {
          if (!variant) return;
          const values = new Set(
            $$("variant-picker [data-option-value]", this.closest("[data-product-root]")).map((i) => i.dataset.optionValue.toLowerCase())
          );
          const selected = variant.options.map((o) => o.toLowerCase());
          this.items.forEach((item) => {
            const alt = item.dataset.mediaAlt;
            item.hidden = Boolean(alt && values.has(alt) && !selected.includes(alt));
          });
          this.dots.forEach((dot, i) => dot.hidden = i >= this.visibleItems().length);
        }
        openLightbox(mediaId) {
          const section = this.closest("[data-section-id]");
          const box = section && document.getElementById(`Lightbox-${section.dataset.sectionId}`);
          if (!box) return;
          openDialog(box);
          const target = box.querySelector(`[data-lightbox-id="${mediaId}"]`);
          requestAnimationFrame(() => target?.scrollIntoView({ block: "start" }));
        }
      };
      define("media-gallery", MediaGallery);
      document.addEventListener("click", (e) => {
        const step = e.target.closest("[data-qty] [data-step]");
        if (!step) return;
        const input = step.closest("[data-qty]").querySelector("input");
        const inc = Number(input.step) || 1;
        const min = Number(input.min) || 1;
        const max = input.max ? Number(input.max) : Infinity;
        input.value = Math.min(max, Math.max(min, Number(input.value) + inc * Number(step.dataset.step)));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      PickupAvailability = class extends HTMLElement {
        connectedCallback() {
          this.load();
        }
        async load() {
          if (this.hidden || !this.dataset.variantId) return;
          try {
            const url = `${this.dataset.baseUrl}variants/${this.dataset.variantId}/?section_id=pickup-availability`;
            const doc = parseHTML(await fetch(url).then((r) => r.text()));
            const content = doc.querySelector("[data-pickup]");
            this.innerHTML = content ? content.innerHTML : "";
          } catch {
            this.innerHTML = "";
          }
        }
      };
      define("pickup-availability", PickupAvailability);
      ProductRecommendations = class extends HTMLElement {
        connectedCallback() {
          if (this.querySelector("[data-recommendations-content]") || !this.dataset.url) return;
          const io = new IntersectionObserver(async (entries) => {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            try {
              const doc = parseHTML(await fetch(this.dataset.url).then((r) => r.text()));
              const holder = doc.querySelector(`[data-block-id="${this.dataset.blockId}"] [data-recommendations-content]`) || doc.querySelector("[data-recommendations-content]");
              if (holder) {
                this.append(holder);
                initMotion(holder);
                if (motionOn()) holder.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
              }
            } catch {
            }
          }, { rootMargin: "400px 0px" });
          io.observe(this);
        }
      };
      define("product-recommendations", ProductRecommendations);
      $$("[data-tz-offset]").forEach((input) => input.value = (/* @__PURE__ */ new Date()).getTimezoneOffset().toString());
      productRoot = document.querySelector(".main [data-product-root][data-product-url]");
      if (productRoot) {
        try {
          const handle = productRoot.dataset.productUrl.split("/products/")[1]?.split(/[?#]/)[0];
          const list = JSON.parse(localStorage.getItem("theme:recent") || "[]").filter((h) => h !== handle);
          if (handle) localStorage.setItem("theme:recent", JSON.stringify([handle, ...list].slice(0, 16)));
        } catch {
        }
      }
      DAY = 864e5;
      DeliveryEstimate = class extends HTMLElement {
        connectedCallback() {
          this.cutoff = Number(this.dataset.cutoff);
          const [h, m] = this.dataset.offset.replace(/^[+-]/, "").split(":").map(Number);
          this.offsetMs = (this.dataset.offset.startsWith("-") ? -1 : 1) * (h * 60 + (m || 0)) * 6e4;
          this.weekends = this.dataset.weekends === "true";
          this.holidays = new Set((this.dataset.holidays || "").split(",").map((s) => s.trim()).filter(Boolean));
          this.fmt = new Intl.DateTimeFormat(this.dataset.locale || void 0, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
          this.update();
          this.timer = setInterval(() => this.update(), 1e3);
        }
        disconnectedCallback() {
          clearInterval(this.timer);
        }
        // "Store time" as a UTC date whose fields read like the store's wall clock.
        storeNow() {
          return new Date(Date.now() + this.offsetMs);
        }
        isWorkday(d) {
          const day = d.getUTCDay();
          if (!this.weekends && (day === 0 || day === 6)) return false;
          return !this.holidays.has(d.toISOString().slice(0, 10));
        }
        addWorkdays(d, n) {
          const out = new Date(d);
          let left = n;
          while (left > 0) {
            out.setTime(out.getTime() + DAY);
            if (this.isWorkday(out)) left -= 1;
          }
          return out;
        }
        update() {
          const now = this.storeNow();
          const cutoffToday = new Date(now);
          cutoffToday.setUTCHours(this.cutoff, 0, 0, 0);
          let dispatch = new Date(now);
          let ms = cutoffToday - now;
          if (!(this.isWorkday(now) && ms > 0)) {
            dispatch = new Date(now);
            do
              dispatch.setTime(dispatch.getTime() + DAY);
            while (!this.isWorkday(dispatch));
            dispatch.setUTCHours(this.cutoff, 0, 0, 0);
            ms = dispatch - now;
          }
          const from = this.addWorkdays(dispatch, Number(this.dataset.min));
          const to = this.addWorkdays(dispatch, Number(this.dataset.max));
          const date = +from === +to ? this.fmt.format(from) : this.dataset.textRange.replace("[from]", this.fmt.format(from)).replace("[to]", this.fmt.format(to));
          const text = this.querySelector("[data-delivery-text]");
          if (ms < 6 * 36e5) {
            const hrs = Math.floor(ms / 36e5);
            const mins = Math.floor(ms % 36e5 / 6e4);
            const secs = Math.floor(ms % 6e4 / 1e3);
            const time = hrs > 0 ? `${hrs}h ${String(mins).padStart(2, "0")}m` : `${mins}m ${String(secs).padStart(2, "0")}s`;
            text.innerHTML = this.dataset.textCountdown.replace("[time]", `<strong>${time}</strong>`).replace("[date]", `<strong>${date}</strong>`);
          } else {
            text.innerHTML = this.dataset.textArrives.replace("[date]", `<strong>${date}</strong>`);
          }
          this.hidden = false;
        }
      };
      define("delivery-estimate", DeliveryEstimate);
      BuyBar = class extends HTMLElement {
        connectedCallback() {
          this.root = document.querySelector(`[data-section-id="${this.dataset.sectionId}"][data-product-root]`);
          if (!this.root) return;
          this.smart = this.dataset.mode === "smart";
          this.mainButton = () => this.root.querySelector("[data-add-button]");
          this.querySelector("[data-bar-add]")?.addEventListener("click", () => this.add());
          this.querySelector("[data-bar-select]")?.addEventListener("change", (e) => this.choose(e.target));
          document.addEventListener("theme:variant:change", (e) => this.sync(e.detail));
          const watch = this.root.querySelector(".buy-buttons") || this.mainButton();
          this.io = new IntersectionObserver(([entry]) => {
            const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            this.toggle(past);
          });
          if (watch) this.io.observe(watch);
          if (this.smart) {
            this.buildNav();
            this.progress = this.querySelector("[data-bar-progress]");
            this.onScroll = () => {
              const max = document.documentElement.scrollHeight - innerHeight;
              if (this.progress) this.progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
            };
            window.addEventListener("scroll", this.onScroll, { passive: true });
          }
        }
        disconnectedCallback() {
          this.io?.disconnect();
          this.spy?.disconnect();
          if (this.onScroll) window.removeEventListener("scroll", this.onScroll);
        }
        toggle(show) {
          if (show === this.classList.contains("is-visible")) return;
          this.classList.toggle("is-visible", show);
          this.toggleAttribute("inert", !show);
          document.documentElement.classList.toggle("has-buy-bar", show);
          if (show && this.smart && motionOn()) this.morph();
        }
        // A ghost of the main button flies into the bar's button.
        morph() {
          const from = this.mainButton()?.getBoundingClientRect();
          const target = this.querySelector("[data-bar-add]");
          if (!from || !target) return;
          requestAnimationFrame(() => {
            const to = target.getBoundingClientRect();
            if (!to.width) return;
            const ghost = document.createElement("div");
            ghost.className = "buy-bar__ghost";
            ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
            document.body.append(ghost);
            ghost.animate(
              [
                { transform: "none", opacity: 1 },
                { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`, opacity: 0.2 }
              ],
              { duration: 620, easing: "cubic-bezier(.65,0,.35,1)" }
            ).finished.then(() => ghost.remove());
            target.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: 620 });
          });
        }
        add() {
          const form = this.root.querySelector("[data-buy-buttons] form");
          const main = this.mainButton();
          if (!form || main?.disabled) {
            this.root.scrollIntoView({ behavior: motionOn() ? "smooth" : "auto" });
            return;
          }
          const barBtn = this.querySelector("[data-bar-add]");
          barBtn.classList.add("is-loading");
          const done = () => barBtn.classList.remove("is-loading");
          document.addEventListener("theme:cart:added", done, { once: true });
          setTimeout(done, 4e3);
          form.requestSubmit(main || void 0);
        }
        // Pick the same options in the main picker, which re-renders price, stock and media.
        choose(select) {
          const option = select.selectedOptions[0];
          const values = (option.dataset.options || "").split("|");
          const picker = this.root.querySelector("variant-picker");
          if (!picker) return;
          let last = null;
          picker.querySelectorAll("fieldset").forEach((fs, i) => {
            const sel = fs.querySelector("select");
            if (sel) {
              const match = [...sel.options].find((o) => o.textContent.trim().split(" \u2014 ")[0] === values[i]);
              if (match) sel.value = match.value;
              last = sel;
              return;
            }
            const input = [...fs.querySelectorAll('input[type="radio"]')].find((r) => r.dataset.optionValue === values[i]);
            if (input) {
              input.checked = true;
              last = input;
            }
          });
          last?.dispatchEvent(new Event("change", { bubbles: true }));
        }
        sync({ variant, root: root2 }) {
          if (!variant || root2 && root2 !== this.root && !this.root.contains(root2)) return;
          const price = this.root.querySelector("[data-price-wrap] [data-price]");
          const barPrice = this.querySelector("[data-bar-price]");
          if (price && barPrice) barPrice.innerHTML = price.outerHTML;
          const label = this.querySelector("[data-bar-variant]");
          if (label) label.textContent = variant.title;
          const select = this.querySelector("[data-bar-select]");
          if (select) select.value = variant.id;
          const btn = this.querySelector("[data-bar-add]");
          if (btn) {
            btn.disabled = !variant.available;
            this.querySelector("[data-bar-label]").textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;
          }
          const img = this.querySelector(".buy-bar__thumb img");
          if (img && variant.featured_media?.preview_image?.src) {
            img.removeAttribute("srcset");
            img.src = `${variant.featured_media.preview_image.src}${variant.featured_media.preview_image.src.includes("?") ? "&" : "?"}width=120`;
          }
        }
        // Links to the sections below the product, with a pill that follows the one in view.
        buildNav() {
          const nav = this.querySelector("[data-bar-nav]");
          if (!nav) return;
          const targets = $$(".main > .shopify-section").filter((s) => !s.contains(this.root) && s.querySelector("h2") && s.offsetHeight > 120).slice(0, 4);
          if (targets.length < 2) return;
          const pill = nav.querySelector(".buy-bar__pill");
          const links = targets.map((section) => {
            if (!section.id) section.id = `s-${Math.random().toString(36).slice(2, 8)}`;
            const a = document.createElement("a");
            a.href = `#${section.id}`;
            a.className = "buy-bar__link";
            a.textContent = section.querySelector("h2").getAttribute("aria-label") || section.querySelector("h2").textContent.replace(/\s+/g, " ").trim().slice(0, 24);
            a.addEventListener("click", (e) => {
              e.preventDefault();
              const y = section.getBoundingClientRect().top + scrollY - 80;
              scrollToY(y);
            });
            nav.append(a);
            return a;
          });
          nav.hidden = false;
          const movePill = (a) => {
            if (!a) return pill.style.opacity = "0";
            pill.style.opacity = "1";
            pill.style.width = `${a.offsetWidth}px`;
            pill.style.transform = `translateX(${a.offsetLeft}px)`;
            links.forEach((l) => l.classList.toggle("is-active", l === a));
          };
          this.spy = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) movePill(links[targets.indexOf(e.target)]);
            });
          }, { rootMargin: "-45% 0px -50% 0px" });
          targets.forEach((t) => this.spy.observe(t));
        }
      };
      define("buy-bar", BuyBar);
      GiftMode = class extends HTMLElement {
        connectedCallback() {
          this.root = this.closest("[data-product-root]");
          this.toggle = this.querySelector("[data-gift-toggle]");
          this.panel = this.querySelector("[data-gift-panel]");
          this.fields = $$("[data-gift-to], [data-gift-from], [data-gift-message]", this);
          this.starters = (this.dataset.starterText || "").split(/\r?\n/);
          this.toggle.addEventListener("change", () => this.setOn(this.toggle.checked));
          this.addEventListener("input", () => this.preview());
          this.addEventListener("change", (e) => {
            if (e.target.name?.startsWith("gift-wrap-")) this.paintWrap();
            if (e.target.matches("[data-gift-date-toggle]")) this.toggleDates(e.target.checked);
          });
          this.addEventListener("click", (e) => {
            const chip = e.target.closest("[data-occasion]");
            if (chip) this.typeStarter(Number(chip.dataset.occasion), chip);
          });
          this.onSubmit = (e) => {
            const form = e.target.querySelector?.("form");
            if (!this.toggle.checked || form?.getAttribute("id") !== this.dataset.form) return;
            e.detail.after.push(() => this.addExtras());
            this.seal();
          };
          document.addEventListener("product-form:submit", this.onSubmit);
        }
        disconnectedCallback() {
          document.removeEventListener("product-form:submit", this.onSubmit);
          clearInterval(this.typing);
        }
        setOn(on2) {
          this.fields.forEach((f) => f.disabled = !on2);
          this.root?.classList.toggle("is-gift", on2);
          if (on2) {
            this.panel.hidden = false;
            this.ensureWrap();
            this.paintWrap();
            this.preview();
            if (motionOn()) {
              this.panel.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "cubic-bezier(.16,1,.3,1)" });
              $$(".gift__group", this.panel).forEach((g, i) => g.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 80 * i, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
            }
          } else {
            this.panel.hidden = true;
          }
          this.summary();
        }
        // Paper, ribbon, bow and a tag laid over the product photo.
        ensureWrap() {
          const host = this.root?.querySelector(".gallery__item.is-active .media, .gallery__item .media");
          if (!host || host.querySelector(".gift-wrap")) return;
          const wrap = document.createElement("div");
          wrap.className = "gift-wrap";
          wrap.setAttribute("aria-hidden", "true");
          wrap.innerHTML = `
      <span class="gift-wrap__paper gift-wrap__paper--l"></span>
      <span class="gift-wrap__paper gift-wrap__paper--r"></span>
      <span class="gift-wrap__ribbon gift-wrap__ribbon--v"></span>
      <span class="gift-wrap__ribbon gift-wrap__ribbon--h"></span>
      <svg class="gift-wrap__bow" viewBox="0 0 120 70"><path d="M60 35C42 8 14 4 10 18c-4 14 22 22 50 17Zm0 0c18-27 46-31 50-17 4 14-22 22-50 17Z"/><path d="M60 35 44 66l9-2 7 6M60 35l16 31-9-2-7 6"/><circle cx="60" cy="35" r="7"/></svg>
      <span class="gift-wrap__tag"><span data-tag-text></span></span>`;
          host.append(wrap);
          this.wrapEl = wrap;
        }
        paintWrap() {
          const input = this.querySelector('input[name^="gift-wrap-"]:checked');
          if (!this.wrapEl) return;
          const color = input?.dataset.wrapColor || "#c8a77c";
          this.wrapEl.style.setProperty("--paper", color.startsWith("url") ? "#c8a77c" : color);
          this.wrapEl.style.setProperty("--paper-img", input?.dataset.wrapImage ? `url("${input.dataset.wrapImage}")` : "none");
          this.summary();
        }
        preview() {
          const to = this.querySelector("[data-gift-to]")?.value.trim();
          const from = this.querySelector("[data-gift-from]")?.value.trim();
          const msg = this.querySelector("[data-gift-message]");
          this.querySelector("[data-card-to]").textContent = to || "\u2026";
          this.querySelector("[data-card-from]").textContent = from || "\u2026";
          const cardMsg = this.querySelector("[data-card-msg]");
          if (msg?.value.trim()) cardMsg.textContent = msg.value;
          const count = this.querySelector("[data-gift-count]");
          if (count && msg) count.textContent = `${msg.value.length} / ${msg.maxLength}`;
          const tag = this.wrapEl?.querySelector("[data-tag-text]");
          if (tag) tag.textContent = to ? theme.strings.giftFor.replace("[name]", to) : theme.strings.giftWrapped;
        }
        typeStarter(index, chip) {
          const msg = this.querySelector("[data-gift-message]");
          const text = this.starters[index]?.trim();
          if (!msg || !text) return;
          $$("[data-occasion]", this).forEach((c) => c.classList.toggle("is-active", c === chip));
          clearInterval(this.typing);
          if (!motionOn()) {
            msg.value = text;
            this.preview();
            return;
          }
          msg.value = "";
          let i = 0;
          this.typing = setInterval(() => {
            msg.value = text.slice(0, ++i);
            this.preview();
            if (i >= text.length) clearInterval(this.typing);
          }, 18);
        }
        toggleDates(on2) {
          const box = this.querySelector("[data-gift-dates]");
          if (!box) return;
          box.hidden = !on2;
          if (on2 && !box.children.length) {
            const fmt = new Intl.DateTimeFormat(this.dataset.locale || void 0, { weekday: "short", day: "numeric", month: "short" });
            const day = /* @__PURE__ */ new Date();
            day.setDate(day.getDate() + Number(this.dataset.leadDays || 2));
            let made = 0;
            while (made < 14) {
              if (!(this.dataset.skipSundays === "true" && day.getDay() === 0)) {
                const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
                const [wd, ...rest] = fmt.format(day).replace(",", "").split(" ");
                box.insertAdjacentHTML("beforeend", `<label class="gift__date"><input type="radio" name="gift-date-${this.dataset.form}" value="${iso}" ${made === 0 ? "checked" : ""}><span class="caption">${wd}</span><span>${rest.join(" ")}</span></label>`);
                made += 1;
              }
              day.setDate(day.getDate() + 1);
            }
            if (motionOn()) $$(".gift__date", box).forEach((d, i) => d.animate([{ opacity: 0, transform: "translateX(12px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: i * 25, fill: "backwards", easing: "cubic-bezier(.16,1,.3,1)" }));
          }
          this.summary();
        }
        summary() {
          const el = this.querySelector("[data-gift-summary]");
          if (!el) return;
          if (!this.toggle.checked) return el.textContent = "";
          const wrap = this.querySelector('input[name^="gift-wrap-"]:checked');
          const date = this.querySelector("[data-gift-dates]:not([hidden]) input:checked");
          const parts = [];
          if (wrap) parts.push(`${wrap.dataset.wrapTitle}${Number(wrap.dataset.wrapPrice) ? ` (+${formatMoney(Number(wrap.dataset.wrapPrice))})` : ""}`);
          if (this.querySelector("[data-gift-hide]")?.checked) parts.push(theme.strings.giftHidden);
          if (date) parts.push([...date.closest("label").querySelectorAll("span")].map((s) => s.textContent).join(" "));
          el.textContent = parts.join(" \xB7 ");
        }
        seal() {
          if (!motionOn() || !this.wrapEl) return;
          this.wrapEl.querySelector(".gift-wrap__tag")?.animate([{ transform: "rotate(-8deg) scale(1)" }, { transform: "rotate(-2deg) scale(1.18)" }, { transform: "rotate(-8deg) scale(1)" }], { duration: 600, easing: "cubic-bezier(.34,1.56,.64,1)" });
        }
        async addExtras() {
          const wrap = this.querySelector('input[name^="gift-wrap-"]:checked');
          if (wrap && !wrap.disabled) {
            const data = new FormData();
            data.append("id", wrap.value);
            data.append("quantity", 1);
            data.append("properties[_wrap_for]", this.root?.querySelector("h1")?.textContent.trim() || "");
            await Cart.add(data).catch(() => {
            });
          }
          const attributes = { Gift: "Yes" };
          const hide = this.querySelector("[data-gift-hide]");
          if (hide) attributes["Hide prices"] = hide.checked ? "Yes" : "No";
          const date = this.querySelector("[data-gift-dates]:not([hidden]) input:checked");
          if (date) attributes["Delivery date"] = date.value;
          await Cart.update({ attributes }).catch(() => {
          });
        }
      };
      define("gift-mode", GiftMode);
      PersonaliseBlock = class extends HTMLElement {
        connectedCallback() {
          this.root = this.closest("[data-product-root]");
          this.toggle = this.querySelector("[data-personalise-toggle]");
          this.input = this.querySelector("[data-personalise-text]");
          this.inputs = $$("input", this).filter((i) => i !== this.toggle);
          this.allowed = new RegExp(`[^${this.dataset.pattern || "A-Za-z0-9 .&'-"}]`, "g");
          this.toggle.addEventListener("change", () => this.setOn(this.toggle.checked));
          this.input.addEventListener("input", () => this.typed());
          this.addEventListener("change", (e) => {
            if (e.target !== this.toggle) this.paint(true);
          });
          this.onSubmit = (e) => {
            const form = e.target.querySelector?.("form");
            if (!this.toggle.checked || form?.getAttribute("id") !== this.dataset.form) return;
            if (!this.input.value.trim()) {
              this.error(theme.strings.personaliseEmpty);
              this.input.focus();
              e.detail.cancel = theme.strings.personaliseEmpty;
              return;
            }
            if (this.dataset.feeVariant) {
              e.detail.after.push(() => {
                const data = new FormData();
                data.append("id", this.dataset.feeVariant);
                data.append("quantity", 1);
                data.append("properties[_personalised]", this.input.value.trim());
                return Cart.add(data).catch(() => {
                });
              });
            }
          };
          document.addEventListener("product-form:submit", this.onSubmit);
        }
        disconnectedCallback() {
          document.removeEventListener("product-form:submit", this.onSubmit);
        }
        setOn(on2) {
          this.inputs.forEach((i) => i.disabled = !on2);
          this.querySelector("[data-personalise-panel]").hidden = !on2;
          this.root?.classList.toggle("is-personalised", on2);
          if (on2) {
            this.ensureStamp();
            this.paint();
            this.input.focus({ preventScroll: true });
          }
        }
        ensureStamp() {
          const host = this.root?.querySelector(".gallery__item.is-active .media, .gallery__item .media");
          if (!host || host.querySelector(".stamp")) {
            this.stamp = host?.querySelector(".stamp");
            return;
          }
          this.stamp = document.createElement("div");
          this.stamp.className = "stamp";
          this.stamp.setAttribute("aria-hidden", "true");
          this.stamp.innerHTML = '<span class="stamp__text"></span>';
          host.append(this.stamp);
        }
        typed() {
          const clean = this.input.value.replace(this.allowed, "");
          if (clean !== this.input.value) {
            this.input.value = clean;
            this.error(theme.strings.personaliseChars);
          } else this.error("");
          this.querySelector("[data-personalise-count]").textContent = `${this.input.value.length} / ${this.input.maxLength}`;
          $$("[data-sample]", this).forEach((s) => s.textContent = this.input.value.slice(0, 3) || "Aa");
          this.paint(true);
        }
        paint(pressed) {
          if (!this.stamp) return;
          const text = this.input.value.trim();
          const font = this.querySelector("[data-font]:checked")?.dataset.font || "heading";
          const finish = this.querySelector("[data-finish]:checked")?.dataset.finish || "gold";
          const place = this.querySelector("[data-place]:checked")?.dataset.place || "center";
          const y = Number(this.dataset.y) + (place === "top" ? -22 : place === "bottom" ? 22 : 0);
          this.stamp.style.setProperty("--x", `${this.dataset.x}%`);
          this.stamp.style.setProperty("--y", `${y}%`);
          this.stamp.dataset.font = font;
          this.stamp.dataset.finish = finish;
          const el = this.stamp.querySelector(".stamp__text");
          el.textContent = text;
          el.style.setProperty("--fit", Math.min(1, 9 / Math.max(text.length, 1)).toFixed(3));
          this.stamp.classList.toggle("is-empty", !text);
          if (pressed && text && motionOn()) {
            el.animate([{ transform: "translate(-50%, -50%) scale(1.06)", filter: "brightness(1.4)" }, { transform: "translate(-50%, -50%) scale(1)", filter: "none" }], { duration: 260, easing: "cubic-bezier(.16,1,.3,1)" });
            this.stamp.classList.remove("is-sweeping");
            void this.stamp.offsetWidth;
            this.stamp.classList.add("is-sweeping");
          }
        }
        error(message) {
          const box = this.querySelector("[data-personalise-error]");
          box.hidden = !message;
          box.textContent = message;
        }
      };
      define("personalise-block", PersonaliseBlock);
    }
  });

  // site/assets/intellect/cart.js
  async function post(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: body instanceof FormData ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status) {
      const message = data.description || data.message || theme.strings.cartError;
      throw Object.assign(new Error(message), { data });
    }
    return data;
  }
  async function render(sections, cart) {
    let count = cart?.item_count;
    if (sections) {
      for (const [id, html2] of Object.entries(sections)) {
        if (!html2) continue;
        const doc = parseHTML(html2);
        const next = doc.querySelector("[data-cart-content]");
        $$(`[data-cart-section="${id}"]`).forEach((holder) => {
          const current = holder.querySelector("[data-cart-content]");
          if (current && next) {
            const scroller = holder.querySelector(".drawer__body");
            const top = scroller?.scrollTop;
            current.replaceWith(next.cloneNode(true));
            const newScroller = holder.querySelector(".drawer__body");
            if (newScroller && top) newScroller.scrollTop = top;
          }
        });
        const countEl = doc.querySelector("[data-item-count]");
        if (countEl && count === void 0) count = Number(countEl.dataset.itemCount);
      }
    }
    if (count === void 0) count = (await Cart.get()).item_count;
    setCount(count);
    renderedAt = Date.now();
  }
  async function refreshCart() {
    const sections = {};
    await Promise.all(cartSections().map(async (id) => {
      const url = new URL(location.href);
      url.searchParams.set("section_id", id);
      sections[id] = await fetch(url).then((r) => r.text()).catch(() => "");
    }));
    await render(sections);
  }
  function setCount(count) {
    $$("[data-cart-count]").forEach((el) => {
      const changed = el.textContent.trim() !== String(count);
      el.querySelector("span") ? el.querySelector("span").textContent = count : el.textContent = count;
      el.hidden = count === 0;
      if (changed && count > 0) {
        el.classList.remove("is-bumping");
        void el.offsetWidth;
        el.classList.add("is-bumping");
      }
    });
  }
  function openCart() {
    const drawer = document.getElementById("CartDrawer");
    if (drawer) openDialog(drawer);
    else location.href = routes.cart;
  }
  function flyToCart(source) {
    const target = $$("[data-cart-icon]").find((el) => el.offsetParent !== null);
    if (!source || !target || !motionOn()) return Promise.resolve();
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width) return Promise.resolve();
    const size = Math.min(from.width, 140);
    const ghost = document.createElement("div");
    ghost.style.cssText = `position:fixed;z-index:300;left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px;pointer-events:none;`;
    const img = document.createElement("img");
    img.src = source.currentSrc || source.src;
    img.alt = "";
    img.style.cssText = `width:100%;height:100%;object-fit:cover;border-radius:${Math.max(6, size / 8)}px;box-shadow:0 18px 40px -16px rgb(0 0 0/.45)`;
    ghost.append(img);
    document.body.append(ghost);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const duration = 760;
    const x2 = ghost.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], { duration, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
    img.animate(
      [
        { transform: "translateY(0) scale(1)", opacity: 1 },
        { transform: `translateY(${dy * 0.15 - 60}px) scale(.7)`, opacity: 1, offset: 0.35 },
        { transform: `translateY(${dy}px) scale(.12)`, opacity: 0.4 }
      ],
      { duration, easing: "cubic-bezier(.5,0,.8,.6)", fill: "forwards" }
    );
    return x2.finished.then(() => ghost.remove());
  }
  var routes, cartSections, Cart, renderedAt, ProductForm, quickDialog, CartDrawer, CartItems, LADDER_KEY, giftBusy, RewardLadder, upsellCache, CartUpsells;
  var init_cart = __esm({
    "site/assets/intellect/cart.js"() {
      init_core();
      routes = theme.routes;
      cartSections = () => [...new Set($$("[data-cart-section]").map((el) => el.dataset.cartSection))];
      Cart = {
        async get() {
          const res = await fetch(`${routes.cart}.js`, { headers: { Accept: "application/json" } });
          return res.json();
        },
        async add(formData) {
          const sections = cartSections();
          if (sections.length) {
            formData.append("sections", sections.join(","));
            formData.append("sections_url", location.pathname);
          }
          const data = await post(`${routes.cartAdd}.js`, formData);
          await render(data.sections);
          emit("cart:added", { item: data });
          return data;
        },
        async change(line, quantity) {
          const sections = cartSections();
          const data = await post(`${routes.cartChange}.js`, { line, quantity, sections, sections_url: location.pathname });
          await render(data.sections, data);
          emit("cart:changed", { cart: data });
          return data;
        },
        async update(body) {
          const sections = cartSections();
          const data = await post(`${routes.cartUpdate}.js`, { ...body, sections, sections_url: location.pathname });
          if (body.updates || body.attributes) await render(data.sections, data);
          return data;
        }
      };
      renderedAt = Date.now();
      document.addEventListener("dialog:open", (e) => {
        if (e.target.id === "CartDrawer" && Date.now() - renderedAt > 4e3) refreshCart();
      });
      window.addEventListener("pageshow", (e) => {
        if (e.persisted) refreshCart();
      });
      ProductForm = class extends HTMLElement {
        connectedCallback() {
          this.form = this.querySelector("form");
          if (!this.form) return;
          this.form.addEventListener("submit", (e) => this.onSubmit(e));
        }
        async onSubmit(e) {
          if (theme.cartType === "page" && !this.hasAttribute("data-quick")) return;
          e.preventDefault();
          const button = e.submitter || this.form.querySelector('[type="submit"]');
          if (!button || button.disabled || button.classList.contains("is-loading")) return;
          this.setError("");
          button.classList.add("is-loading");
          button.setAttribute("aria-busy", "true");
          const source = this.closest("dialog") ? null : this.closest("[data-product-root]")?.querySelector("[data-fly-source] img, .card__img-1, img");
          try {
            const fly = flyToCart(source);
            const data = new FormData(this.form, e.submitter?.name ? e.submitter : void 0);
            const hooks = { data, after: [] };
            this.dispatchEvent(new CustomEvent("product-form:submit", { bubbles: true, detail: hooks }));
            if (hooks.cancel) throw new Error(hooks.cancel);
            await Cart.add(data);
            for (const step of hooks.after) await step();
            if (button.classList.contains("card__size")) {
              button.classList.add("is-added");
              setTimeout(() => button.classList.remove("is-added"), 1400);
            }
            await fly;
            this.dispatchEvent(new CustomEvent("product-form:added", { bubbles: true }));
            const quickView = this.closest("dialog");
            if (quickView && quickView.id !== "CartDrawer") closeDialog(quickView);
            if (theme.cartType === "drawer" && theme.cartOpenOnAdd && document.getElementById("CartDrawer")) {
              setTimeout(openCart, quickView ? 380 : 0);
            } else {
              toast(`${theme.strings.addedToCart} <a href="${routes.cart}">${theme.strings.viewCart}</a>`);
            }
          } catch (err) {
            this.setError(err.message);
          } finally {
            button.classList.remove("is-loading");
            button.removeAttribute("aria-busy");
          }
        }
        setError(message) {
          const box = this.querySelector("[data-form-error]");
          if (!box) {
            if (message) toast(message);
            return;
          }
          box.hidden = !message;
          box.querySelector("[data-message]").textContent = message;
        }
      };
      define("product-form", ProductForm);
      document.addEventListener("click", async (e) => {
        const trigger = e.target.closest("[data-quick-view]");
        if (!trigger) return;
        e.preventDefault();
        if (!quickDialog) {
          quickDialog = document.createElement("dialog");
          quickDialog.className = `drawer quick-view ${document.body.dataset.drawerScheme || ""}`;
          quickDialog.id = "QuickView";
          quickDialog.setAttribute("aria-label", trigger.getAttribute("aria-label") || "");
          document.body.append(quickDialog);
        }
        trigger.classList.add("is-loading");
        try {
          const [doc] = await Promise.all([fetchSection("quick-view", trigger.dataset.quickView), Promise.resolve().then(() => (init_product(), product_exports))]);
          const content = doc.querySelector("[data-quick-view-content]");
          quickDialog.replaceChildren(...content ? content.childNodes : []);
          window.Shopify?.PaymentButton?.init?.();
          openDialog(quickDialog, trigger);
        } catch (err) {
          location.href = trigger.dataset.quickView;
        } finally {
          trigger.classList.remove("is-loading");
        }
      });
      CartDrawer = class extends HTMLElement {
        connectedCallback() {
          this.dialog = this.querySelector("dialog");
          document.addEventListener("click", (e) => {
            const opener = e.target.closest("[data-cart-toggle]");
            if (!opener || !this.dialog) return;
            e.preventDefault();
            openDialog(this.dialog, opener);
          });
          this.dialog?.addEventListener("dialog:open", () => {
            this.querySelector("cart-upsells")?.load();
          });
        }
      };
      define("cart-drawer", CartDrawer);
      CartItems = class extends HTMLElement {
        connectedCallback() {
          this.addEventListener("click", (e) => {
            const remove = e.target.closest("[data-remove-line]");
            const step = e.target.closest("[data-qty-step]");
            if (remove) {
              e.preventDefault();
              this.update(Number(remove.dataset.removeLine), 0);
            } else if (step) {
              const input = step.closest(".qty").querySelector("input");
              const value = Math.max(0, Number(input.value) + Number(step.dataset.qtyStep));
              input.value = value;
              this.queue(Number(input.dataset.line), value);
            }
          });
          this.addEventListener("change", (e) => {
            if (e.target.matches("[data-line]")) this.queue(Number(e.target.dataset.line), Math.max(0, Number(e.target.value)));
          });
          this.queue = debounce((line, qty) => this.update(line, qty), 350);
        }
        async update(line, quantity) {
          const row = this.querySelector(`[data-line-row="${line}"]`);
          if (quantity === 0 && row && motionOn()) {
            const h = row.offsetHeight;
            row.animate(
              [{ opacity: 1, height: `${h}px`, transform: "none" }, { opacity: 0, height: "0px", transform: "translateX(24px)", paddingBlock: 0, marginBlock: 0 }],
              { duration: 420, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" }
            );
          }
          this.classList.add("is-busy");
          try {
            await Cart.change(line, quantity);
          } catch (err) {
            toast(err.message);
            refreshCart();
          } finally {
            this.classList.remove("is-busy");
          }
        }
      };
      define("cart-items", CartItems);
      LADDER_KEY = "theme:ladder";
      giftBusy = false;
      RewardLadder = class extends HTMLElement {
        connectedCallback() {
          const rate = Number(window.Shopify?.currency?.rate || 1);
          this.tiers = JSON.parse(this.dataset.tiers || "[]").map((t) => ({ ...t, amount: Math.round(t.amount * rate) }));
          this.giftLines = JSON.parse(this.dataset.giftLines || "[]");
          this.total = Number(this.dataset.total);
          if (!this.tiers.length) return;
          this.max = Math.max(...this.tiers.map((t) => t.amount));
          const unlocked = this.tiers.filter((t) => this.total >= t.amount).map((t) => t.n);
          const previous = JSON.parse(sessionStorage.getItem(LADDER_KEY) || "null");
          sessionStorage.setItem(LADDER_KEY, JSON.stringify({ unlocked, pct: this.pct() }));
          this.paint(previous?.pct ?? this.pct());
          this.message();
          if (previous) {
            unlocked.filter((n) => !previous.unlocked.includes(n)).forEach((n) => this.celebrate(n));
            previous.unlocked.filter((n) => !unlocked.includes(n)).forEach((n) => this.shake(n));
          }
          const next = this.tiers.find((t) => this.total < t.amount);
          window.Theme.ladder = next ? { remaining: next.amount - this.total, label: next.label } : null;
          document.dispatchEvent(new CustomEvent("theme:ladder", { detail: window.Theme.ladder }));
          this.syncGifts(unlocked);
        }
        pct() {
          return Math.min(100, this.total / this.max * 100);
        }
        paint(from) {
          const fill = this.querySelector("[data-ladder-fill]");
          const to = this.pct();
          fill.style.width = `${to}%`;
          if (motionOn() && Math.abs(from - to) > 0.5) {
            fill.animate([{ width: `${from}%` }, { width: `${to}%` }], { duration: 1e3, easing: "cubic-bezier(.16,1,.3,1)" });
          }
          this.tiers.forEach((t) => this.querySelector(`[data-node="${t.n}"]`)?.classList.toggle("is-unlocked", this.total >= t.amount));
        }
        message() {
          const text = this.querySelector("[data-ladder-text]");
          const next = this.tiers.find((t) => this.total < t.amount);
          text.innerHTML = next ? this.dataset.textNext.replace("[amount]", `<strong>${formatMoney(next.amount - this.total)}</strong>`).replace("[reward]", `<strong>${next.label}</strong>`) : this.dataset.textDone;
          this.classList.toggle("is-complete", !next);
        }
        celebrate(n) {
          const node = this.querySelector(`[data-node="${n}"]`);
          const tier = this.tiers.find((t) => t.n === n);
          if (!node) return;
          node.classList.add("is-new");
          setTimeout(() => node.classList.remove("is-new"), 1200);
          const live = this.querySelector("[data-ladder-text]");
          if (live && tier) live.setAttribute("aria-label", this.dataset.textUnlocked.replace("[reward]", tier.label));
          if (!motionOn()) return;
          const dot = node.querySelector(".ladder__dot");
          const colours = ["var(--accent)", "var(--text)", "#f2c14e", "#7ec8a5"];
          for (let i = 0; i < 16; i += 1) {
            const p = document.createElement("span");
            p.className = "ladder__spark";
            p.style.background = colours[i % colours.length];
            dot.append(p);
            const angle = Math.PI * 2 * i / 16 + Math.random() * 0.4;
            const dist = 26 + Math.random() * 22;
            p.animate(
              [
                { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
                { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.2)`, opacity: 0 }
              ],
              { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.16,1,.3,1)" }
            ).finished.then(() => p.remove());
          }
        }
        shake(n) {
          const node = this.querySelector(`[data-node="${n}"] .ladder__dot`);
          if (node && motionOn()) node.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-2px)" }, { transform: "none" }], { duration: 420 });
        }
        // Add the gift when its reward unlocks, take it out when the cart drops below.
        // If the shopper removes the gift themselves, don't put it back this session.
        async syncGifts(unlocked) {
          if (giftBusy) return;
          for (const tier of this.tiers.filter((t) => t.type === "gift" && t.gift)) {
            const line = this.giftLines.find((g) => String(g.tier) === String(tier.n));
            const addedKey = `theme:gift-added:${tier.n}`;
            const dismissedKey = `theme:gift-dismissed:${tier.n}`;
            const isUnlocked = unlocked.includes(tier.n);
            if (isUnlocked && !line) {
              if (sessionStorage.getItem(addedKey)) {
                sessionStorage.setItem(dismissedKey, "1");
                sessionStorage.removeItem(addedKey);
                continue;
              }
              if (sessionStorage.getItem(dismissedKey)) continue;
              giftBusy = true;
              try {
                const data = new FormData();
                data.append("id", tier.gift);
                data.append("quantity", 1);
                data.append("properties[_reward]", tier.n);
                sessionStorage.setItem(addedKey, "1");
                await Cart.add(data);
              } catch {
                sessionStorage.removeItem(addedKey);
              } finally {
                giftBusy = false;
              }
              return;
            }
            if (!isUnlocked && line) {
              giftBusy = true;
              try {
                sessionStorage.removeItem(addedKey);
                await Cart.change(line.line, 0);
              } finally {
                giftBusy = false;
              }
              return;
            }
          }
        }
      };
      define("reward-ladder", RewardLadder);
      upsellCache = /* @__PURE__ */ new Map();
      CartUpsells = class extends HTMLElement {
        connectedCallback() {
          if (this.closest("dialog")?.open || !this.closest("dialog")) this.load();
        }
        async load() {
          const id = this.dataset.productId;
          if (!id || this.dataset.loaded === id) return;
          this.dataset.loaded = id;
          try {
            if (!upsellCache.has(id)) {
              const url = `${routes.recommendations}?product_id=${id}&limit=8&intent=complementary&section_id=cart-upsells`;
              let html2 = await fetch(url).then((r) => r.text());
              let doc = parseHTML(html2);
              if (!doc.querySelector("[data-upsell-item]")) {
                html2 = await fetch(url.replace("intent=complementary", "intent=related")).then((r) => r.text());
                doc = parseHTML(html2);
              }
              upsellCache.set(id, doc.querySelector("[data-upsells]")?.innerHTML || "");
            }
            const inCart = (this.dataset.exclude || "").split(",");
            this.innerHTML = upsellCache.get(id);
            this.querySelectorAll("[data-upsell-item]").forEach((el, i) => {
              if (inCart.includes(el.dataset.upsellItem) || i > 5) el.remove();
            });
            this.hidden = !this.querySelector("[data-upsell-item]");
            this.rank();
          } catch {
            this.hidden = true;
          }
        }
      };
      define("cart-upsells", CartUpsells);
      CartUpsells.prototype.rank = function rank() {
        const next = window.Theme.ladder;
        const list = this.querySelector(".cart-upsells__list");
        if (!next || !theme.rankUpsells || !list) return;
        const items = $$("[data-upsell-item]", list);
        const unlocks = items.filter((i) => Number(i.dataset.price) >= next.remaining).sort((a, b) => a.dataset.price - b.dataset.price);
        const rest = items.filter((i) => !unlocks.includes(i)).sort((a, b) => b.dataset.price - a.dataset.price);
        [...unlocks, ...rest].forEach((item) => {
          list.append(item);
          const tag = item.querySelector("[data-upsell-tag]");
          if (!tag) return;
          tag.textContent = Number(item.dataset.price) >= next.remaining ? theme.strings.rewardUnlocks.replace("[reward]", next.label) : theme.strings.rewardCloser.replace("[amount]", formatMoney(Number(item.dataset.price))).replace("[reward]", next.label);
          tag.hidden = false;
        });
      };
      document.addEventListener("theme:ladder", () => $$("cart-upsells").forEach((u) => u.rank?.()));
      document.addEventListener("input", debounce((e) => {
        if (e.target.matches("[data-cart-note]")) Cart.update({ note: e.target.value });
      }, 500));
      document.addEventListener("submit", (e) => {
        const form = e.target.closest("[data-cart-form]");
        if (!form) return;
        const terms = form.querySelector("[data-cart-terms]");
        if (terms && !terms.checked) {
          e.preventDefault();
          toast(theme.strings.termsRequired);
          terms.focus();
        }
      });
      on("cart:refresh", () => refreshCart());
      window.Theme = window.Theme || {};
      window.Theme.cart = { refresh: refreshCart, open: openCart };
    }
  });

  // site/assets/intellect/vendor-lenis.js
  var vendor_lenis_exports = {};
  __export(vendor_lenis_exports, {
    default: () => X
  });
  function L(t, i, e) {
    return Math.max(t, Math.min(i, e));
  }
  function H(t, i, e) {
    return (1 - e) * t + e * i;
  }
  function x(t, i, e, s) {
    return H(t, i, 1 - Math.exp(-e * s));
  }
  function O(t, i) {
    return (t % i + i) % i;
  }
  function k(t, i) {
    let e;
    return function(...s) {
      let o = this;
      clearTimeout(e), e = setTimeout(() => {
        e = void 0, t.apply(o, s);
      }, i);
    };
  }
  var R, M, D, N, _, S, C, W, X;
  var init_vendor_lenis = __esm({
    "site/assets/intellect/vendor-lenis.js"() {
      /*! Lenis 1.3.11 | MIT License | https://github.com/darkroomengineering/lenis */
      R = "1.3.11";
      M = class {
        constructor() {
          __publicField(this, "isRunning", false);
          __publicField(this, "value", 0);
          __publicField(this, "from", 0);
          __publicField(this, "to", 0);
          __publicField(this, "currentTime", 0);
          __publicField(this, "lerp");
          __publicField(this, "duration");
          __publicField(this, "easing");
          __publicField(this, "onUpdate");
        }
        advance(t) {
          if (!this.isRunning) return;
          let i = false;
          if (this.duration && this.easing) {
            this.currentTime += t;
            const e = L(0, this.currentTime / this.duration, 1);
            i = e >= 1;
            const s = i ? 1 : this.easing(e);
            this.value = this.from + (this.to - this.from) * s;
          } else this.lerp ? (this.value = x(this.value, this.to, this.lerp * 60, t), Math.round(this.value) === this.to && (this.value = this.to, i = true)) : (this.value = this.to, i = true);
          i && this.stop(), this.onUpdate?.(this.value, i);
        }
        stop() {
          this.isRunning = false;
        }
        fromTo(t, i, { lerp: e, duration: s, easing: o, onStart: l, onUpdate: r }) {
          this.from = this.value = t, this.to = i, this.lerp = e, this.duration = s, this.easing = o, this.currentTime = 0, this.isRunning = true, l?.(), this.onUpdate = r;
        }
      };
      D = class {
        constructor(t, i, { autoResize: e = true, debounce: s = 250 } = {}) {
          __publicField(this, "width", 0);
          __publicField(this, "height", 0);
          __publicField(this, "scrollHeight", 0);
          __publicField(this, "scrollWidth", 0);
          __publicField(this, "debouncedResize");
          __publicField(this, "wrapperResizeObserver");
          __publicField(this, "contentResizeObserver");
          __publicField(this, "resize", () => {
            this.onWrapperResize(), this.onContentResize();
          });
          __publicField(this, "onWrapperResize", () => {
            this.wrapper instanceof Window ? (this.width = window.innerWidth, this.height = window.innerHeight) : (this.width = this.wrapper.clientWidth, this.height = this.wrapper.clientHeight);
          });
          __publicField(this, "onContentResize", () => {
            this.wrapper instanceof Window ? (this.scrollHeight = this.content.scrollHeight, this.scrollWidth = this.content.scrollWidth) : (this.scrollHeight = this.wrapper.scrollHeight, this.scrollWidth = this.wrapper.scrollWidth);
          });
          this.wrapper = t, this.content = i, e && (this.debouncedResize = k(this.resize, s), this.wrapper instanceof Window ? window.addEventListener("resize", this.debouncedResize, false) : (this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize), this.wrapperResizeObserver.observe(this.wrapper)), this.contentResizeObserver = new ResizeObserver(this.debouncedResize), this.contentResizeObserver.observe(this.content)), this.resize();
        }
        destroy() {
          this.wrapperResizeObserver?.disconnect(), this.contentResizeObserver?.disconnect(), this.wrapper === window && this.debouncedResize && window.removeEventListener("resize", this.debouncedResize, false);
        }
        get limit() {
          return { x: this.scrollWidth - this.width, y: this.scrollHeight - this.height };
        }
      };
      N = class {
        constructor() {
          __publicField(this, "events", {});
        }
        emit(t, ...i) {
          let e = this.events[t] || [];
          for (let s = 0, o = e.length; s < o; s++) e[s]?.(...i);
        }
        on(t, i) {
          return this.events[t]?.push(i) || (this.events[t] = [i]), () => {
            this.events[t] = this.events[t]?.filter((e) => i !== e);
          };
        }
        off(t, i) {
          this.events[t] = this.events[t]?.filter((e) => i !== e);
        }
        destroy() {
          this.events = {};
        }
      };
      _ = 100 / 6;
      S = { passive: false };
      C = class {
        constructor(t, i = { wheelMultiplier: 1, touchMultiplier: 1 }) {
          __publicField(this, "touchStart", { x: 0, y: 0 });
          __publicField(this, "lastDelta", { x: 0, y: 0 });
          __publicField(this, "window", { width: 0, height: 0 });
          __publicField(this, "emitter", new N());
          __publicField(this, "onTouchStart", (t) => {
            const { clientX: i, clientY: e } = t.targetTouches ? t.targetTouches[0] : t;
            this.touchStart.x = i, this.touchStart.y = e, this.lastDelta = { x: 0, y: 0 }, this.emitter.emit("scroll", { deltaX: 0, deltaY: 0, event: t });
          });
          __publicField(this, "onTouchMove", (t) => {
            const { clientX: i, clientY: e } = t.targetTouches ? t.targetTouches[0] : t, s = -(i - this.touchStart.x) * this.options.touchMultiplier, o = -(e - this.touchStart.y) * this.options.touchMultiplier;
            this.touchStart.x = i, this.touchStart.y = e, this.lastDelta = { x: s, y: o }, this.emitter.emit("scroll", { deltaX: s, deltaY: o, event: t });
          });
          __publicField(this, "onTouchEnd", (t) => {
            this.emitter.emit("scroll", { deltaX: this.lastDelta.x, deltaY: this.lastDelta.y, event: t });
          });
          __publicField(this, "onWheel", (t) => {
            let { deltaX: i, deltaY: e, deltaMode: s } = t;
            const o = s === 1 ? _ : s === 2 ? this.window.width : 1, l = s === 1 ? _ : s === 2 ? this.window.height : 1;
            i *= o, e *= l, i *= this.options.wheelMultiplier, e *= this.options.wheelMultiplier, this.emitter.emit("scroll", { deltaX: i, deltaY: e, event: t });
          });
          __publicField(this, "onWindowResize", () => {
            this.window = { width: window.innerWidth, height: window.innerHeight };
          });
          this.element = t, this.options = i, window.addEventListener("resize", this.onWindowResize, false), this.onWindowResize(), this.element.addEventListener("wheel", this.onWheel, S), this.element.addEventListener("touchstart", this.onTouchStart, S), this.element.addEventListener("touchmove", this.onTouchMove, S), this.element.addEventListener("touchend", this.onTouchEnd, S);
        }
        on(t, i) {
          return this.emitter.on(t, i);
        }
        destroy() {
          this.emitter.destroy(), window.removeEventListener("resize", this.onWindowResize, false), this.element.removeEventListener("wheel", this.onWheel, S), this.element.removeEventListener("touchstart", this.onTouchStart, S), this.element.removeEventListener("touchmove", this.onTouchMove, S), this.element.removeEventListener("touchend", this.onTouchEnd, S);
        }
      };
      W = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
      X = class {
        constructor({ wrapper: t = window, content: i = document.documentElement, eventsTarget: e = t, smoothWheel: s = true, syncTouch: o = false, syncTouchLerp: l = 0.075, touchInertiaExponent: r = 1.7, duration: c, easing: h, lerp: p = 0.1, infinite: u = false, orientation: m = "vertical", gestureOrientation: n = m === "horizontal" ? "both" : "vertical", touchMultiplier: a = 1, wheelMultiplier: d = 1, autoResize: v = true, prevent: f, virtualScroll: g, overscroll: y = true, autoRaf: E = false, anchors: z = false, autoToggle: w = false, allowNestedScroll: T = false, __experimental__naiveDimensions: b = false } = {}) {
          __publicField(this, "_isScrolling", false);
          __publicField(this, "_isStopped", false);
          __publicField(this, "_isLocked", false);
          __publicField(this, "_preventNextNativeScrollEvent", false);
          __publicField(this, "_resetVelocityTimeout", null);
          __publicField(this, "__rafID", null);
          __publicField(this, "isTouching");
          __publicField(this, "time", 0);
          __publicField(this, "userData", {});
          __publicField(this, "lastVelocity", 0);
          __publicField(this, "velocity", 0);
          __publicField(this, "direction", 0);
          __publicField(this, "options");
          __publicField(this, "targetScroll");
          __publicField(this, "animatedScroll");
          __publicField(this, "animate", new M());
          __publicField(this, "emitter", new N());
          __publicField(this, "dimensions");
          __publicField(this, "virtualScroll");
          __publicField(this, "onScrollEnd", (t) => {
            t instanceof CustomEvent || (this.isScrolling === "smooth" || this.isScrolling === false) && t.stopPropagation();
          });
          __publicField(this, "dispatchScrollendEvent", () => {
            this.options.wrapper.dispatchEvent(new CustomEvent("scrollend", { bubbles: this.options.wrapper === window, detail: { lenisScrollEnd: true } }));
          });
          __publicField(this, "onTransitionEnd", (t) => {
            if (t.propertyName.includes("overflow")) {
              const i = this.isHorizontal ? "overflow-x" : "overflow-y", e = getComputedStyle(this.rootElement)[i];
              ["hidden", "clip"].includes(e) ? this.internalStop() : this.internalStart();
            }
          });
          __publicField(this, "onClick", (t) => {
            const e = t.composedPath().find((s) => s instanceof HTMLAnchorElement && (s.getAttribute("href")?.startsWith("#") || s.getAttribute("href")?.startsWith("/#") || s.getAttribute("href")?.startsWith("./#")));
            if (e) {
              const s = e.getAttribute("href");
              if (s) {
                const o = typeof this.options.anchors == "object" && this.options.anchors ? this.options.anchors : void 0;
                let l = `#${s.split("#")[1]}`;
                ["#", "/#", "./#", "#top", "/#top", "./#top"].includes(s) && (l = 0), this.scrollTo(l, o);
              }
            }
          });
          __publicField(this, "onPointerDown", (t) => {
            t.button === 1 && this.reset();
          });
          __publicField(this, "onVirtualScroll", (t) => {
            if (typeof this.options.virtualScroll == "function" && this.options.virtualScroll(t) === false) return;
            const { deltaX: i, deltaY: e, event: s } = t;
            if (this.emitter.emit("virtual-scroll", { deltaX: i, deltaY: e, event: s }), s.ctrlKey || s.lenisStopPropagation) return;
            const o = s.type.includes("touch"), l = s.type.includes("wheel");
            this.isTouching = s.type === "touchstart" || s.type === "touchmove";
            const r = i === 0 && e === 0;
            if (this.options.syncTouch && o && s.type === "touchstart" && r && !this.isStopped && !this.isLocked) {
              this.reset();
              return;
            }
            const h = this.options.gestureOrientation === "vertical" && e === 0 || this.options.gestureOrientation === "horizontal" && i === 0;
            if (r || h) return;
            let p = s.composedPath();
            p = p.slice(0, p.indexOf(this.rootElement));
            const u = this.options.prevent;
            if (p.find((f) => f instanceof HTMLElement && (typeof u == "function" && u?.(f) || f.hasAttribute?.("data-lenis-prevent") || o && f.hasAttribute?.("data-lenis-prevent-touch") || l && f.hasAttribute?.("data-lenis-prevent-wheel") || this.options.allowNestedScroll && this.checkNestedScroll(f, { deltaX: i, deltaY: e })))) return;
            if (this.isStopped || this.isLocked) {
              s.cancelable && s.preventDefault();
              return;
            }
            if (!(this.options.syncTouch && o || this.options.smoothWheel && l)) {
              this.isScrolling = "native", this.animate.stop(), s.lenisStopPropagation = true;
              return;
            }
            let n = e;
            this.options.gestureOrientation === "both" ? n = Math.abs(e) > Math.abs(i) ? e : i : this.options.gestureOrientation === "horizontal" && (n = i), (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && this.limit > 0 && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && e > 0 || this.animatedScroll === this.limit && e < 0)) && (s.lenisStopPropagation = true), s.cancelable && s.preventDefault();
            const a = o && this.options.syncTouch, v = o && s.type === "touchend";
            v && (n = Math.sign(this.velocity) * Math.pow(Math.abs(this.velocity), this.options.touchInertiaExponent)), this.scrollTo(this.targetScroll + n, { programmatic: false, ...a ? { lerp: v ? this.options.syncTouchLerp : 1 } : { lerp: this.options.lerp, duration: this.options.duration, easing: this.options.easing } });
          });
          __publicField(this, "onNativeScroll", () => {
            if (this._resetVelocityTimeout !== null && (clearTimeout(this._resetVelocityTimeout), this._resetVelocityTimeout = null), this._preventNextNativeScrollEvent) {
              this._preventNextNativeScrollEvent = false;
              return;
            }
            if (this.isScrolling === false || this.isScrolling === "native") {
              const t = this.animatedScroll;
              this.animatedScroll = this.targetScroll = this.actualScroll, this.lastVelocity = this.velocity, this.velocity = this.animatedScroll - t, this.direction = Math.sign(this.animatedScroll - t), this.isStopped || (this.isScrolling = "native"), this.emit(), this.velocity !== 0 && (this._resetVelocityTimeout = setTimeout(() => {
                this.lastVelocity = this.velocity, this.velocity = 0, this.isScrolling = false, this.emit();
              }, 400));
            }
          });
          __publicField(this, "raf", (t) => {
            const i = t - (this.time || t);
            this.time = t, this.animate.advance(i * 1e-3), this.options.autoRaf && (this.__rafID = requestAnimationFrame(this.raf));
          });
          window.lenisVersion = R, (!t || t === document.documentElement) && (t = window), typeof c == "number" && typeof h != "function" ? h = W : typeof h == "function" && typeof c != "number" && (c = 1), this.options = { wrapper: t, content: i, eventsTarget: e, smoothWheel: s, syncTouch: o, syncTouchLerp: l, touchInertiaExponent: r, duration: c, easing: h, lerp: p, infinite: u, gestureOrientation: n, orientation: m, touchMultiplier: a, wheelMultiplier: d, autoResize: v, prevent: f, virtualScroll: g, overscroll: y, autoRaf: E, anchors: z, autoToggle: w, allowNestedScroll: T, __experimental__naiveDimensions: b }, this.dimensions = new D(t, i, { autoResize: v }), this.updateClassName(), this.targetScroll = this.animatedScroll = this.actualScroll, this.options.wrapper.addEventListener("scroll", this.onNativeScroll, false), this.options.wrapper.addEventListener("scrollend", this.onScrollEnd, { capture: true }), this.options.anchors && this.options.wrapper === window && this.options.wrapper.addEventListener("click", this.onClick, false), this.options.wrapper.addEventListener("pointerdown", this.onPointerDown, false), this.virtualScroll = new C(e, { touchMultiplier: a, wheelMultiplier: d }), this.virtualScroll.on("scroll", this.onVirtualScroll), this.options.autoToggle && this.rootElement.addEventListener("transitionend", this.onTransitionEnd, { passive: true }), this.options.autoRaf && (this.__rafID = requestAnimationFrame(this.raf));
        }
        destroy() {
          this.emitter.destroy(), this.options.wrapper.removeEventListener("scroll", this.onNativeScroll, false), this.options.wrapper.removeEventListener("scrollend", this.onScrollEnd, { capture: true }), this.options.wrapper.removeEventListener("pointerdown", this.onPointerDown, false), this.options.anchors && this.options.wrapper === window && this.options.wrapper.removeEventListener("click", this.onClick, false), this.virtualScroll.destroy(), this.dimensions.destroy(), this.cleanUpClassName(), this.__rafID && cancelAnimationFrame(this.__rafID);
        }
        on(t, i) {
          return this.emitter.on(t, i);
        }
        off(t, i) {
          return this.emitter.off(t, i);
        }
        setScroll(t) {
          this.isHorizontal ? this.options.wrapper.scrollTo({ left: t, behavior: "instant" }) : this.options.wrapper.scrollTo({ top: t, behavior: "instant" });
        }
        resize() {
          this.dimensions.resize(), this.animatedScroll = this.targetScroll = this.actualScroll, this.emit();
        }
        emit() {
          this.emitter.emit("scroll", this);
        }
        reset() {
          this.isLocked = false, this.isScrolling = false, this.animatedScroll = this.targetScroll = this.actualScroll, this.lastVelocity = this.velocity = 0, this.animate.stop();
        }
        start() {
          if (this.isStopped) {
            if (this.options.autoToggle) {
              this.rootElement.style.removeProperty("overflow");
              return;
            }
            this.internalStart();
          }
        }
        internalStart() {
          this.isStopped && (this.reset(), this.isStopped = false, this.emit());
        }
        stop() {
          if (!this.isStopped) {
            if (this.options.autoToggle) {
              this.rootElement.style.setProperty("overflow", "clip");
              return;
            }
            this.internalStop();
          }
        }
        internalStop() {
          this.isStopped || (this.reset(), this.isStopped = true, this.emit());
        }
        scrollTo(t, { offset: i = 0, immediate: e = false, lock: s = false, duration: o = this.options.duration, easing: l = this.options.easing, lerp: r = this.options.lerp, onStart: c, onComplete: h, force: p = false, programmatic: u = true, userData: m } = {}) {
          if (!((this.isStopped || this.isLocked) && !p)) {
            if (typeof t == "string" && ["top", "left", "start"].includes(t)) t = 0;
            else if (typeof t == "string" && ["bottom", "right", "end"].includes(t)) t = this.limit;
            else {
              let n;
              if (typeof t == "string" ? n = document.querySelector(t) : t instanceof HTMLElement && t?.nodeType && (n = t), n) {
                if (this.options.wrapper !== window) {
                  const d = this.rootElement.getBoundingClientRect();
                  i -= this.isHorizontal ? d.left : d.top;
                }
                const a = n.getBoundingClientRect();
                t = (this.isHorizontal ? a.left : a.top) + this.animatedScroll;
              }
            }
            if (typeof t == "number") {
              if (t += i, t = Math.round(t), this.options.infinite) {
                if (u) {
                  this.targetScroll = this.animatedScroll = this.scroll;
                  const n = t - this.animatedScroll;
                  n > this.limit / 2 ? t = t - this.limit : n < -this.limit / 2 && (t = t + this.limit);
                }
              } else t = L(0, t, this.limit);
              if (t === this.targetScroll) {
                c?.(this), h?.(this);
                return;
              }
              if (this.userData = m ?? {}, e) {
                this.animatedScroll = this.targetScroll = t, this.setScroll(this.scroll), this.reset(), this.preventNextNativeScrollEvent(), this.emit(), h?.(this), this.userData = {}, requestAnimationFrame(() => {
                  this.dispatchScrollendEvent();
                });
                return;
              }
              u || (this.targetScroll = t), typeof o == "number" && typeof l != "function" ? l = W : typeof l == "function" && typeof o != "number" && (o = 1), this.animate.fromTo(this.animatedScroll, t, { duration: o, easing: l, lerp: r, onStart: () => {
                s && (this.isLocked = true), this.isScrolling = "smooth", c?.(this);
              }, onUpdate: (n, a) => {
                this.isScrolling = "smooth", this.lastVelocity = this.velocity, this.velocity = n - this.animatedScroll, this.direction = Math.sign(this.velocity), this.animatedScroll = n, this.setScroll(this.scroll), u && (this.targetScroll = n), a || this.emit(), a && (this.reset(), this.emit(), h?.(this), this.userData = {}, requestAnimationFrame(() => {
                  this.dispatchScrollendEvent();
                }), this.preventNextNativeScrollEvent());
              } });
            }
          }
        }
        preventNextNativeScrollEvent() {
          this._preventNextNativeScrollEvent = true, requestAnimationFrame(() => {
            this._preventNextNativeScrollEvent = false;
          });
        }
        checkNestedScroll(t, { deltaX: i, deltaY: e }) {
          const s = Date.now(), o = t._lenis ?? (t._lenis = {});
          let l, r, c, h, p, u, m, n;
          const a = this.options.gestureOrientation;
          if (s - (o.time ?? 0) > 2e3) {
            o.time = Date.now();
            const w = window.getComputedStyle(t);
            o.computedStyle = w;
            const T = w.overflowX, b = w.overflowY;
            if (l = ["auto", "overlay", "scroll"].includes(T), r = ["auto", "overlay", "scroll"].includes(b), o.hasOverflowX = l, o.hasOverflowY = r, !l && !r || a === "vertical" && !r || a === "horizontal" && !l) return false;
            p = t.scrollWidth, u = t.scrollHeight, m = t.clientWidth, n = t.clientHeight, c = p > m, h = u > n, o.isScrollableX = c, o.isScrollableY = h, o.scrollWidth = p, o.scrollHeight = u, o.clientWidth = m, o.clientHeight = n;
          } else c = o.isScrollableX, h = o.isScrollableY, l = o.hasOverflowX, r = o.hasOverflowY, p = o.scrollWidth, u = o.scrollHeight, m = o.clientWidth, n = o.clientHeight;
          if (!l && !r || !c && !h || a === "vertical" && (!r || !h) || a === "horizontal" && (!l || !c)) return false;
          let d;
          if (a === "horizontal") d = "x";
          else if (a === "vertical") d = "y";
          else {
            const w = i !== 0, T = e !== 0;
            w && l && c && (d = "x"), T && r && h && (d = "y");
          }
          if (!d) return false;
          let v, f, g, y, E;
          if (d === "x") v = t.scrollLeft, f = p - m, g = i, y = l, E = c;
          else if (d === "y") v = t.scrollTop, f = u - n, g = e, y = r, E = h;
          else return false;
          return (g > 0 ? v < f : v > 0) && y && E;
        }
        get rootElement() {
          return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
        }
        get limit() {
          return this.options.__experimental__naiveDimensions ? this.isHorizontal ? this.rootElement.scrollWidth - this.rootElement.clientWidth : this.rootElement.scrollHeight - this.rootElement.clientHeight : this.dimensions.limit[this.isHorizontal ? "x" : "y"];
        }
        get isHorizontal() {
          return this.options.orientation === "horizontal";
        }
        get actualScroll() {
          const t = this.options.wrapper;
          return this.isHorizontal ? t.scrollX ?? t.scrollLeft : t.scrollY ?? t.scrollTop;
        }
        get scroll() {
          return this.options.infinite ? O(this.animatedScroll, this.limit) : this.animatedScroll;
        }
        get progress() {
          return this.limit === 0 ? 1 : this.scroll / this.limit;
        }
        get isScrolling() {
          return this._isScrolling;
        }
        set isScrolling(t) {
          this._isScrolling !== t && (this._isScrolling = t, this.updateClassName());
        }
        get isStopped() {
          return this._isStopped;
        }
        set isStopped(t) {
          this._isStopped !== t && (this._isStopped = t, this.updateClassName());
        }
        get isLocked() {
          return this._isLocked;
        }
        set isLocked(t) {
          this._isLocked !== t && (this._isLocked = t, this.updateClassName());
        }
        get isSmooth() {
          return this.isScrolling === "smooth";
        }
        get className() {
          let t = "lenis";
          return this.options.autoToggle && (t += " lenis-autoToggle"), this.isStopped && (t += " lenis-stopped"), this.isLocked && (t += " lenis-locked"), this.isScrolling && (t += " lenis-scrolling"), this.isScrolling === "smooth" && (t += " lenis-smooth"), t;
        }
        updateClassName() {
          this.cleanUpClassName(), this.rootElement.className = `${this.rootElement.className} ${this.className}`.trim();
        }
        cleanUpClassName() {
          this.rootElement.className = this.rootElement.className.replace(/lenis(-\w+)?/g, "").trim();
        }
      };
    }
  });

  // site/assets/intellect/cursor.js
  var require_cursor = __commonJS({
    "site/assets/intellect/cursor.js"() {
      var root2 = document.documentElement;
      var el = document.createElement("div");
      el.className = "cursor";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = '<span class="cursor__disc"><span class="cursor__label"></span></span>';
      document.body.append(el);
      var label = el.querySelector(".cursor__label");
      root2.classList.add("has-cursor");
      var x2 = -200;
      var y = -200;
      var tx = x2;
      var ty = y;
      var target = null;
      var raf = 0;
      var tick = () => {
        x2 += (tx - x2) * 0.22;
        y += (ty - y) * 0.22;
        el.style.transform = `translate3d(${x2}px, ${y}px, 0)`;
        raf = Math.abs(tx - x2) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
      };
      var setTarget = (next) => {
        if (next === target) return;
        target = next;
        if (next) label.textContent = next.dataset.cursor;
        el.classList.toggle("is-active", Boolean(next));
      };
      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        if (innerWidth < 750) {
          setTarget(null);
          return;
        }
        tx = e.clientX;
        ty = e.clientY;
        if (!target) {
          x2 = tx;
          y = ty;
        }
        const over = e.target.closest?.("[data-cursor]");
        const blocked = e.target.closest?.("button, input, select, textarea, label, .card__sizes, .swatches, dialog");
        setTarget(over && !blocked ? over : null);
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });
      document.addEventListener("pointerleave", () => setTarget(null));
      document.addEventListener("pointerdown", () => el.classList.add("is-pressed"));
      document.addEventListener("pointerup", () => el.classList.remove("is-pressed"));
      document.addEventListener("theme:dialog:open", () => setTarget(null));
    }
  });

  // site/assets/intellect/theme.js
  init_core();
  init_motion();
  init_cart();
  var html = document.documentElement;
  html.classList.toggle("motion-on", motionEnabled());
  initMotion(document);
  html.classList.add("js-ready");
  var announce = document.querySelector("announcement-bar");
  if (announce) {
    const setAnnounce = () => html.style.setProperty("--announcement-h", `${announce.offsetHeight}px`);
    setAnnounce();
    new ResizeObserver(setAnnounce).observe(announce);
  }
  async function initSmoothScroll() {
    const lerp = Number(html.dataset.smoothScroll);
    if (!lerp || !motionEnabled() || !matchMedia("(pointer: fine)").matches) return;
    const { default: Lenis } = await Promise.resolve().then(() => (init_vendor_lenis(), vendor_lenis_exports));
    const lenis = new Lenis({
      lerp,
      autoRaf: true,
      anchors: { offset: -(parseFloat(getComputedStyle(html).getPropertyValue("--header-offset")) || 0) - 16 },
      allowNestedScroll: true,
      // Drawers, popups and anything marked data-lenis-prevent keep native scrolling.
      prevent: (node) => Boolean(node.closest?.("dialog, [data-lenis-prevent]"))
    });
    window.Theme.lenis = lenis;
    document.addEventListener("theme:dialog:open", () => lenis.stop());
    document.addEventListener("theme:dialog:close", () => {
      if (!html.classList.contains("is-locked")) lenis.start();
    });
  }
  ("requestIdleCallback" in window ? requestIdleCallback : setTimeout)(initSmoothScroll);
  if (html.dataset.cursorLabels === "true" && motionEnabled() && matchMedia("(pointer: fine) and (hover: hover)").matches) {
    ("requestIdleCallback" in window ? requestIdleCallback : setTimeout)(() => Promise.resolve().then(() => __toESM(require_cursor())));
  }
  var SiteHeader = class extends HTMLElement {
    connectedCallback() {
      this.section = this.closest(".section-header") || this;
      this.mode = this.dataset.sticky || "scroll-up";
      this.lastY = window.scrollY;
      this.bar = this.querySelector(".header__bar");
      if (this.mode === "none") this.section.classList.add("is-static");
      this.measure = () => {
        const h = this.offsetHeight;
        const hidden = this.section.classList.contains("is-hidden");
        html.style.setProperty("--header-total", `${h}px`);
        html.style.setProperty("--header-offset", this.mode === "none" || hidden ? "0px" : `${h}px`);
      };
      this.measure();
      new ResizeObserver(this.measure).observe(this);
      this.onScroll = this.onScroll.bind(this);
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.onScroll();
      this.initMenus();
    }
    disconnectedCallback() {
      window.removeEventListener("scroll", this.onScroll);
    }
    onScroll() {
      const y = window.scrollY;
      this.section.classList.toggle("is-scrolled", y > 8);
      if (this.mode === "scroll-up") {
        const goingDown = y > this.lastY + 4;
        const goingUp = y < this.lastY - 4;
        const past = y > (this.bar?.offsetHeight || 80) * 2;
        if (goingDown && past && !this.querySelector(".nav__item.is-open")) this.section.classList.add("is-hidden");
        else if (goingUp || !past) this.section.classList.remove("is-hidden");
        if (goingDown || goingUp) this.measure();
      }
      this.lastY = y;
    }
    initMenus() {
      const items = $$(".nav__item[data-has-panel]", this);
      let openTimer;
      let closeTimer;
      const open = (item) => {
        items.forEach((other) => other !== item && this.close(other));
        item.classList.add("is-open");
        item.querySelector(":scope > .nav__link")?.setAttribute("aria-expanded", "true");
        this.section.classList.add("menu-open");
      };
      items.forEach((item) => {
        item.addEventListener("pointerenter", (e) => {
          if (e.pointerType !== "mouse") return;
          clearTimeout(closeTimer);
          openTimer = setTimeout(() => open(item), this.querySelector(".nav__item.is-open") ? 0 : 90);
        });
        item.addEventListener("pointerleave", (e) => {
          if (e.pointerType !== "mouse") return;
          clearTimeout(openTimer);
          closeTimer = setTimeout(() => this.close(item), 180);
        });
        item.addEventListener("focusin", () => open(item));
        item.addEventListener("focusout", (e) => {
          if (!item.contains(e.relatedTarget)) this.close(item);
        });
        item.querySelector(":scope > .nav__link")?.addEventListener("click", (e) => {
          if (matchMedia("(hover: none)").matches && !item.classList.contains("is-open")) {
            e.preventDefault();
            open(item);
          }
        });
      });
      this.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        const item = this.querySelector(".nav__item.is-open");
        if (item) {
          this.close(item);
          item.querySelector(".nav__link")?.focus();
        }
      });
    }
    close(item) {
      item.classList.remove("is-open");
      item.querySelector(":scope > .nav__link")?.setAttribute("aria-expanded", "false");
      if (!this.querySelector(".nav__item.is-open")) this.section.classList.remove("menu-open");
    }
  };
  define("site-header", SiteHeader);
  var MenuDrawer = class extends HTMLElement {
    connectedCallback() {
      this.addEventListener("click", (e) => {
        const forward = e.target.closest("[data-panel-open]");
        const back = e.target.closest("[data-panel-back]");
        if (forward) this.go(forward.dataset.panelOpen, "forward");
        if (back) this.go(back.dataset.panelBack, "back");
      });
      this.closest("dialog")?.addEventListener("dialog:close", () => this.go("menu-root", "reset"));
    }
    go(id, direction) {
      const next = this.querySelector(`#${CSS.escape(id)}`);
      const current = this.querySelector(".menu-panel.is-active");
      if (!next || next === current) return;
      if (direction === "reset") {
        $$(".menu-panel", this).forEach((p) => {
          p.classList.remove("is-active", "is-left");
          if (p !== next) p.classList.add("is-right");
        });
        next.classList.remove("is-right");
        next.classList.add("is-active");
        return;
      }
      current?.classList.remove("is-active");
      current?.classList.add(direction === "forward" ? "is-left" : "is-right");
      next.classList.remove("is-left", "is-right");
      next.classList.add("is-active");
      next.querySelector("a, button")?.focus({ preventScroll: true });
    }
  };
  define("menu-drawer", MenuDrawer);
  var AnnouncementBar = class extends HTMLElement {
    connectedCallback() {
      this.items = $$(".announcement__item", this);
      if (this.items.length < 2 || this.dataset.mode === "marquee") return;
      this.index = 0;
      this.querySelector("[data-prev]")?.addEventListener("click", () => this.show(this.index - 1, true));
      this.querySelector("[data-next]")?.addEventListener("click", () => this.show(this.index + 1, true));
      this.addEventListener("pointerenter", () => this.stop());
      this.addEventListener("pointerleave", () => this.play());
      this.play();
    }
    show(i, user) {
      const leaving = this.items[this.index];
      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      leaving.setAttribute("aria-hidden", "true");
      setTimeout(() => leaving.classList.remove("is-leaving"), 500);
      this.index = (i + this.items.length) % this.items.length;
      this.items[this.index].classList.add("is-active");
      this.items[this.index].removeAttribute("aria-hidden");
      if (user) this.play();
    }
    play() {
      this.stop();
      const speed = Number(this.dataset.speed || 5) * 1e3;
      this.timer = setInterval(() => this.show(this.index + 1), speed);
    }
    stop() {
      clearInterval(this.timer);
    }
    disconnectedCallback() {
      this.stop();
    }
  };
  define("announcement-bar", AnnouncementBar);
  var PredictiveSearch = class extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('input[type="search"]');
      this.results = this.querySelector("[data-search-results]");
      this.idle = this.results?.innerHTML || "";
      this.cache = /* @__PURE__ */ new Map();
      if (!this.input || this.dataset.enabled !== "true") return;
      this.input.addEventListener("input", debounce(() => this.search(), 220));
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.results.querySelector("a")?.focus();
        }
      });
    }
    async search() {
      const q = this.input.value.trim();
      if (!q) {
        this.results.innerHTML = this.idle;
        return;
      }
      this.results.classList.add("is-loading");
      try {
        if (!this.cache.has(q)) {
          const url = `${theme.routes.predictiveSearch}?q=${encodeURIComponent(q)}&section_id=predictive-search&resources[limit]=6&resources[limit_scope]=each&resources[options][fields]=title,product_type,variants.title,vendor,tag`;
          const text = await fetch(url).then((r) => r.text());
          this.cache.set(q, parseHTML(text).querySelector("[data-predictive]")?.innerHTML || "");
        }
        if (this.input.value.trim() === q) {
          this.results.innerHTML = this.cache.get(q);
          initMotion(this.results);
        }
      } finally {
        this.results.classList.remove("is-loading");
      }
    }
  };
  define("predictive-search", PredictiveSearch);
  var ShareButton = class extends HTMLElement {
    connectedCallback() {
      this.querySelector("button")?.addEventListener("click", async () => {
        const data = { title: this.dataset.title, url: this.dataset.url };
        if (navigator.share) {
          try {
            await navigator.share(data);
          } catch {
          }
          return;
        }
        await navigator.clipboard?.writeText(data.url);
        toast(theme.strings.copied);
      });
    }
  };
  define("share-button", ShareButton);
  var swapCardImage = (card, url) => {
    const img = card.querySelector(".card__img-1");
    if (!img || !url) return;
    if (!img.dataset.originalSrc) {
      img.dataset.originalSrc = img.currentSrc || img.src;
      img.dataset.originalSrcset = img.getAttribute("srcset") || "";
    }
    img.removeAttribute("srcset");
    img.src = url;
  };
  document.addEventListener("pointerover", (e) => {
    const swatch = e.target.closest?.("[data-card] [data-swatch-image]");
    if (swatch && e.pointerType === "mouse") swapCardImage(swatch.closest("[data-card]"), swatch.dataset.swatchImage);
  });
  document.addEventListener("pointerout", (e) => {
    const swatch = e.target.closest?.("[data-card] [data-swatch]");
    if (!swatch || swatch.contains(e.relatedTarget)) return;
    const card = swatch.closest("[data-card]");
    const active = card.querySelector("[data-swatch].is-active");
    const img = card.querySelector(".card__img-1");
    if (active?.dataset.swatchImage) swapCardImage(card, active.dataset.swatchImage);
    else if (img?.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
      if (img.dataset.originalSrcset) img.setAttribute("srcset", img.dataset.originalSrcset);
    }
  });
  document.addEventListener("click", (e) => {
    const swatch = e.target.closest("[data-card] [data-swatch]");
    if (!swatch) return;
    e.preventDefault();
    const card = swatch.closest("[data-card]");
    card.dataset.colour = swatch.dataset.swatch;
    $$("[data-swatch]", card).forEach((s) => {
      s.classList.toggle("is-active", s === swatch);
      s.setAttribute("aria-pressed", String(s === swatch));
    });
    $$(".card__size", card).forEach((b) => b.hidden = b.dataset.colour !== swatch.dataset.swatch);
    $$("[data-card-link]", card).forEach((a) => a.href = swatch.dataset.url);
    if (swatch.dataset.swatchImage) swapCardImage(card, swatch.dataset.swatchImage);
  });
  var fitText = (el) => {
    el.style.removeProperty("--fit-size");
    const width = el.clientWidth;
    const natural = (el.firstElementChild || el).getBoundingClientRect().width;
    if (!width || !natural) return;
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.style.setProperty("--fit-size", `${Math.floor(size * (width / natural) * 0.995)}px`);
  };
  var lastWidths = /* @__PURE__ */ new WeakMap();
  var fitObserver = new ResizeObserver((entries) => entries.forEach((e) => {
    if (lastWidths.get(e.target) === e.contentRect.width) return;
    lastWidths.set(e.target, e.contentRect.width);
    fitText(e.target);
  }));
  var observeFit = (root2 = document) => $$("[data-fit]", root2).forEach((el) => fitObserver.observe(el));
  observeFit();
  document.fonts?.ready.then(() => $$("[data-fit]").forEach(fitText));
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-localization-select]")) e.target.form.submit();
  });
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="/products/"]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || !motionOn()) return;
    const media = link.closest(".card, [data-vt-scope]")?.querySelector("[data-vt-media]");
    if (media) media.style.viewTransitionName = "product-media";
  });
  window.addEventListener("pageshow", () => {
    $$(".card [data-vt-media]").forEach((el) => el.style.viewTransitionName = "");
  });
  if (window.Shopify?.designMode) {
    document.addEventListener("shopify:section:load", (e) => {
      initMotion(e.target);
      observeFit(e.target);
    });
    document.addEventListener("shopify:block:select", (e) => {
      const dialog = e.target.closest("dialog");
      if (dialog) openDialog(dialog);
      e.target.closest("[data-slide]")?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    document.addEventListener("shopify:section:select", (e) => {
      const dialog = e.target.querySelector("dialog[data-editor-open]");
      if (dialog) openDialog(dialog);
    });
    document.addEventListener("shopify:section:deselect", (e) => {
      const dialog = e.target.querySelector("dialog[open]");
      if (dialog) closeDialog(dialog);
    });
  }

  // site/assets/intellect/slideshow.js
  init_core();
  function onSwipe(el, cb) {
    let x0 = 0;
    let y0 = 0;
    el.addEventListener("touchstart", (e) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) cb(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  var Ticker = class {
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
      document.addEventListener("visibilitychange", () => this.sync());
    }
    get running() {
      return this.visible && !this.held && !document.hidden && this.ms > 0;
    }
    restart() {
      clearTimeout(this.timer);
      if (this.running) this.timer = setTimeout(() => this.step(1), this.ms);
    }
    sync() {
      this.el.classList.toggle("is-paused", !this.running);
      this.restart();
    }
    hold(on2) {
      this.held = on2;
      this.sync();
    }
  };
  var HeroReel = class extends HTMLElement {
    connectedCallback() {
      this.panels = $$(".hero__panel", this);
      this.bars = $$(".hero__bars span", this);
      this.mq = matchMedia("(max-width: 749px)");
      this.mq.addEventListener("change", () => this.setup());
      this.setup();
    }
    setup() {
      const rotate = this.dataset.mobile === "rotate" && this.mq.matches && this.panels.length > 1;
      clearTimeout(this.ticker?.timer);
      if (!rotate) {
        this.panels.forEach((p) => {
          p.classList.remove("is-active");
          $("video", p)?.play().catch(() => {
          });
        });
        return;
      }
      if (!this.ticker) {
        const ms = (parseFloat(getComputedStyle(this).getPropertyValue("--reel-dur")) || 5) * 1e3;
        this.ticker = new Ticker(this, motionOn() ? ms : 0, (d) => this.go(this.index + d));
        onSwipe(this.closest(".hero__stage") || this, (d) => this.go(this.index + d));
      }
      this.go(0);
    }
    go(i) {
      const n = this.panels.length;
      this.index = (i + n) % n;
      this.panels.forEach((p, k2) => {
        const on2 = k2 === this.index;
        p.classList.toggle("is-active", on2);
        const v = $("video", p);
        if (v) on2 ? v.play().catch(() => {
        }) : v.pause();
      });
      this.bars.forEach((b, k2) => {
        b.classList.toggle("is-done", k2 < this.index);
        b.classList.remove("is-active");
        if (k2 === this.index) {
          void b.offsetWidth;
          b.classList.add("is-active");
        }
      });
      this.ticker.restart();
    }
  };
  define("hero-reel", HeroReel);
  var SlideShow = class extends HTMLElement {
    connectedCallback() {
      this.slides = $$(".slideshow__slide", this);
      this.dots = $$("[data-slide-to]", this);
      this.counter = $("[data-slide-count]", this);
      if (this.slides.length < 2) {
        this.slides[0]?.classList.add("is-active");
        return;
      }
      const ms = Number(this.dataset.autoplay) * 1e3;
      this.ticker = new Ticker(this, motionOn() ? ms : 0, (d) => this.go(this.index + d));
      $("[data-slide-prev]", this)?.addEventListener("click", () => this.go(this.index - 1));
      $("[data-slide-next]", this)?.addEventListener("click", () => this.go(this.index + 1));
      this.dots.forEach((d) => d.addEventListener("click", () => this.go(Number(d.dataset.slideTo))));
      onSwipe(this, (d) => this.go(this.index + d));
      if (this.dataset.pauseHover === "true") {
        this.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && this.ticker.hold(true));
        this.addEventListener("pointerleave", () => this.ticker.hold(false));
      }
      this.addEventListener("focusin", () => this.ticker.hold(true));
      this.addEventListener("focusout", () => this.ticker.hold(false));
      this.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") this.go(this.index + 1);
        if (e.key === "ArrowLeft") this.go(this.index - 1);
      });
      document.addEventListener("shopify:block:select", (e) => {
        const k2 = this.slides.findIndex((s) => s.contains(e.target) || s === e.target);
        if (k2 > -1) {
          this.go(k2);
          this.ticker.hold(true);
        }
      });
      document.addEventListener("shopify:block:deselect", () => this.ticker.hold(false));
      this.go(0, true);
    }
    go(i, first = false) {
      const n = this.slides.length;
      const prev = this.index;
      this.index = (i + n) % n;
      this.dataset.direction = first || prev === void 0 ? "next" : i > prev ? "next" : "prev";
      this.slides.forEach((s, k2) => {
        const on2 = k2 === this.index;
        s.classList.toggle("is-active", on2);
        s.classList.toggle("is-leaving", k2 === prev && !on2);
        s.toggleAttribute("inert", !on2);
        s.setAttribute("aria-hidden", String(!on2));
        $$("video", s).forEach((v) => on2 && v.offsetParent !== null ? v.play().catch(() => {
        }) : v.pause());
      });
      this.dots.forEach((d, k2) => {
        d.classList.remove("is-active");
        d.setAttribute("aria-current", String(k2 === this.index));
        if (k2 === this.index) {
          void d.offsetWidth;
          d.classList.add("is-active");
        }
      });
      if (this.counter) this.counter.textContent = String(this.index + 1).padStart(2, "0");
      this.ticker.restart();
    }
  };
  define("slide-show", SlideShow);

  // site/assets/intellect/sections.js
  init_core();
  init_motion();
  var scrollVelocity = 0;
  var lastY = window.scrollY;
  var lastT = performance.now();
  window.addEventListener("scroll", () => {
    const now = performance.now();
    scrollVelocity = Math.min(8, Math.abs(window.scrollY - lastY) / Math.max(1, now - lastT));
    lastY = window.scrollY;
    lastT = now;
  }, { passive: true });
  var MarqueeBand = class extends HTMLElement {
    connectedCallback() {
      this.track = $(".marquee-band__track", this);
      if (!this.track || !motionOn()) return;
      this.animation = this.track.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
        { duration: parseFloat(getComputedStyle(this).getPropertyValue("--marquee-dur")) * 1e3 || 3e4, iterations: Infinity, direction: this.hasAttribute("data-reverse") ? "reverse" : "normal" }
      );
      if (this.dataset.velocity !== "true") return;
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
      this.addEventListener("pointerenter", () => this.animation.pause());
      this.addEventListener("pointerleave", () => this.animation.play());
    }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.animation?.cancel();
    }
  };
  define("marquee-band", MarqueeBand);
  var VideoPlayer = class extends HTMLElement {
    connectedCallback() {
      this.video = $("video", this);
      $("[data-play]", this)?.addEventListener("click", () => this.play());
      $(".video-player__media", this)?.addEventListener("click", (e) => {
        if (this.dataset.mode === "click" && !this.classList.contains("is-playing") && !e.target.closest("button")) this.play();
      });
      $("[data-toggle]", this)?.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        if (this.video.paused) {
          this.video.play();
          btn.classList.remove("is-paused");
        } else {
          this.video.pause();
          btn.classList.add("is-paused");
        }
      });
    }
    play() {
      this.classList.add("is-playing");
      if (this.video) {
        this.video.controls = true;
        this.video.play();
        return;
      }
      const tpl = $("template[data-embed]", this);
      if (tpl) $(".video-player__media", this).replaceChildren(tpl.content.cloneNode(true));
    }
  };
  define("video-player", VideoPlayer);
  var QuoteRotator = class extends HTMLElement {
    connectedCallback() {
      this.quotes = $$("[data-quote]", this);
      this.tabs = $$("[data-quote-tab]", this);
      this.index = 0;
      this.speed = Number(this.dataset.speed || 6) * 1e3;
      this.style.setProperty("--quote-dur", `${this.speed}ms`);
      this.tabs.forEach((t) => t.addEventListener("click", () => this.show(Number(t.dataset.quoteTab), true)));
      this.addEventListener("pointerenter", () => this.classList.add("is-paused"));
      this.addEventListener("pointerleave", () => this.classList.remove("is-paused"));
      this.tick = () => {
        if (!this.classList.contains("is-paused")) this.show(this.index + 1);
      };
      if (this.quotes.length > 1) this.timer = setInterval(this.tick, this.speed);
    }
    show(i, user) {
      i = (i + this.quotes.length) % this.quotes.length;
      this.quotes[this.index].classList.remove("is-active");
      this.tabs[this.index]?.classList.remove("is-active");
      this.tabs[this.index]?.setAttribute("aria-selected", "false");
      this.index = i;
      this.quotes[i].classList.add("is-active");
      this.tabs[i]?.classList.add("is-active");
      this.tabs[i]?.setAttribute("aria-selected", "true");
      if (user) {
        clearInterval(this.timer);
        this.timer = setInterval(this.tick, this.speed);
      }
    }
    disconnectedCallback() {
      clearInterval(this.timer);
    }
  };
  define("quote-rotator", QuoteRotator);
  var PressQuotes = class extends HTMLElement {
    connectedCallback() {
      const logos = $$("[data-press-logo]", this);
      const quotes = $$("[data-press-quote]", this);
      let i = 0;
      const show = (n) => {
        i = n;
        logos.forEach((l, k2) => l.classList.toggle("is-active", k2 === n));
        quotes.forEach((q, k2) => q.classList.toggle("is-active", k2 === n));
      };
      logos.forEach((l, k2) => {
        l.addEventListener("pointerenter", () => show(k2));
        l.addEventListener("focus", () => show(k2));
        l.addEventListener("click", () => show(k2));
      });
      if (logos.length > 1) this.timer = setInterval(() => !this.matches(":hover") && show((i + 1) % logos.length), 5e3);
    }
    disconnectedCallback() {
      clearInterval(this.timer);
    }
  };
  define("press-quotes", PressQuotes);
  var ShopLook = class extends HTMLElement {
    connectedCallback() {
      const dots = $$("[data-look-dot]", this);
      const items = $$("[data-look-item]", this);
      const show = (n) => {
        dots.forEach((d, k2) => d.classList.toggle("is-active", k2 === n));
        items.forEach((d, k2) => d.classList.toggle("is-active", k2 === n));
      };
      dots.forEach((d, k2) => {
        d.addEventListener("click", () => {
          show(k2);
          items[k2]?.scrollIntoView({ block: "nearest", behavior: motionOn() ? "smooth" : "auto" });
        });
        d.addEventListener("pointerenter", () => show(k2));
      });
      items.forEach((it, k2) => it.addEventListener("pointerenter", () => show(k2)));
    }
  };
  define("shop-look", ShopLook);
  var IndexList = class extends HTMLElement {
    connectedCallback() {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      this.float = $(".index__float", this);
      this.img = $("img", this.float);
      let x2 = 0;
      let y = 0;
      let tx = 0;
      let ty = 0;
      let raf = 0;
      const tick = () => {
        x2 += (tx - x2) * 0.14;
        y += (ty - y) * 0.14;
        const tilt = Math.max(-8, Math.min(8, (tx - x2) * 0.06));
        this.float.style.transform = `translate3d(${x2}px, ${y}px, 0) translate(32px, -50%) rotate(${tilt}deg)`;
        raf = requestAnimationFrame(tick);
      };
      let anchor = null;
      const aim = (e) => {
        if (!anchor) return;
        const r = this.getBoundingClientRect();
        const title = $(".index__title", anchor).getBoundingClientRect();
        const row = anchor.getBoundingClientRect();
        const drift = e ? Math.max(-24, Math.min(24, (e.clientY - (row.top + row.height / 2)) * 0.4)) : 0;
        tx = title.right - r.left;
        ty = row.top + row.height / 2 - r.top + drift;
        if (!raf) {
          x2 = tx;
          y = ty;
          raf = requestAnimationFrame(tick);
        }
      };
      this.addEventListener("pointermove", aim);
      $$("[data-index-image]", this).forEach((link) => {
        link.addEventListener("pointerenter", (e) => {
          this.img.src = link.dataset.indexImage;
          this.classList.add("is-hovering");
          anchor = link;
          aim(e);
        });
      });
      this.addEventListener("pointerleave", () => {
        this.classList.remove("is-hovering");
        cancelAnimationFrame(raf);
        raf = 0;
      });
    }
  };
  define("index-list", IndexList);
  var CountDown = class extends HTMLElement {
    connectedCallback() {
      this.end = new Date(this.dataset.end).getTime();
      if (Number.isNaN(this.end)) return;
      this.nums = Object.fromEntries($$("[data-unit]", this).map((n) => [n.dataset.unit, n]));
      this.update();
      this.timer = setInterval(() => this.update(), 1e3);
    }
    update() {
      const left = this.end - Date.now();
      if (left <= 0) {
        clearInterval(this.timer);
        if (this.dataset.expired === "hide" && !window.Shopify?.designMode) this.closest(".shopify-section").hidden = true;
        else {
          $(".promo__timer", this)?.setAttribute("hidden", "");
          $(".promo__ended", this)?.removeAttribute("hidden");
        }
        return;
      }
      const parts = {
        days: Math.floor(left / 864e5),
        hours: Math.floor(left / 36e5 % 24),
        minutes: Math.floor(left / 6e4 % 60),
        seconds: Math.floor(left / 1e3 % 60)
      };
      for (const [unit, el] of Object.entries(this.nums)) {
        const text = String(parts[unit]).padStart(2, "0");
        if (el.textContent !== text) {
          el.textContent = text;
          if (motionOn() && unit !== "days") el.animate([{ transform: "translateY(-30%)", opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
        }
      }
    }
    disconnectedCallback() {
      clearInterval(this.timer);
    }
  };
  define("count-down", CountDown);
  var BeforeAfter = class extends HTMLElement {
    connectedCallback() {
      const range = $(".ba__range", this);
      range?.addEventListener("input", () => this.style.setProperty("--pos", `${range.value}%`));
    }
  };
  define("before-after", BeforeAfter);
  var ScrollStory = class extends HTMLElement {
    connectedCallback() {
      const steps = $$("[data-story-step]", this);
      const media = $$("[data-story-media]", this);
      const bar = $(".story__progress span", this);
      this.io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const n = Number(e.target.dataset.storyStep);
          steps.forEach((s, k2) => s.classList.toggle("is-active", k2 === n));
          media.forEach((m, k2) => m.classList.toggle("is-active", k2 === n));
          if (bar) bar.style.transform = `scaleY(${(n + 1) / steps.length})`;
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      steps.forEach((s) => this.io.observe(s));
    }
    disconnectedCallback() {
      this.io?.disconnect();
    }
  };
  define("scroll-story", ScrollStory);
  var RECENT_KEY = "theme:recent";
  var RecentlyViewed = class extends HTMLElement {
    async connectedCallback() {
      let handles = [];
      try {
        handles = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      } catch {
      }
      handles = handles.filter((h) => h !== this.dataset.exclude).slice(0, Number(this.dataset.limit || 8));
      if (!handles.length) return;
      const list = $("[data-recent-list]", this);
      const cards = await Promise.all(
        handles.map(
          (h) => fetch(`${theme.routes.root}products/${h}?section_id=product-card`.replace("//products", "/products")).then((r) => r.ok ? r.text() : "").then((html3) => parseHTML(html3).querySelector("[data-card-wrap]")?.innerHTML || "").catch(() => "")
        )
      );
      const html2 = cards.filter(Boolean).map((c) => `<li>${c}</li>`).join("");
      if (!html2) return;
      list.innerHTML = html2;
      this.hidden = false;
      initMotion(this);
    }
  };
  define("recently-viewed", RecentlyViewed);

  // site/assets/intellect/reels.js
  init_core();
  var playSafe = (video) => video?.play().catch(() => {
  });
  var VideoReels = class extends HTMLElement {
    connectedCallback() {
      this.reels = $$("[data-reel]", this);
      this.mode = this.dataset.autoplay;
      const videos = this.reels.map((r) => r.querySelector("video")).filter(Boolean);
      if (this.mode === "view" && motionOn()) {
        this.io = new IntersectionObserver((entries) => {
          entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
            const video = target.querySelector("video");
            if (!video) return;
            if (isIntersecting && intersectionRatio > 0.55) {
              video.preload = "auto";
              playSafe(video);
            } else video.pause();
          });
        }, { threshold: [0, 0.55, 1] });
        this.reels.forEach((r) => this.io.observe(r));
      } else if (this.mode === "hover") {
        this.reels.forEach((r) => {
          const video = r.querySelector("video");
          r.addEventListener("pointerenter", () => playSafe(video));
          r.addEventListener("pointerleave", () => video?.pause());
        });
      }
      videos.forEach((v) => {
        v.muted = true;
        v.removeAttribute("controls");
      });
      this.addEventListener("click", (e) => {
        const open = e.target.closest("[data-reel-open]");
        if (!open) return;
        e.preventDefault();
        this.openViewer(Number(open.closest("[data-reel]").dataset.index));
      });
    }
    disconnectedCallback() {
      this.io?.disconnect();
    }
    buildViewer() {
      if (this.viewer) return this.viewer;
      const d = document.createElement("dialog");
      d.className = "reel-viewer";
      d.setAttribute("aria-label", this.querySelector("h2")?.textContent.trim() || "Videos");
      d.innerHTML = `
      <div class="reel-viewer__stage">
        <div class="reel-viewer__bars">${this.reels.map(() => "<span><i></i></span>").join("")}</div>
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
      this.video = $("video", d);
      this.muted = true;
      this.updateSound();
      $("[data-prev]", d).addEventListener("click", () => this.go(this.index - 1));
      $("[data-next]", d).addEventListener("click", () => this.go(this.index + 1));
      $("[data-sound]", d).addEventListener("click", () => {
        this.muted = !this.muted;
        this.video.muted = this.muted;
        this.updateSound();
      });
      this.video.addEventListener("timeupdate", () => {
        const bar = $$(".reel-viewer__bars i", d)[this.index];
        if (bar && this.video.duration) bar.style.transform = `scaleX(${this.video.currentTime / this.video.duration})`;
      });
      this.video.addEventListener("ended", () => this.go(this.index + 1));
      d.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") this.go(this.index + 1);
        if (e.key === "ArrowLeft") this.go(this.index - 1);
      });
      d.addEventListener("dialog:close", () => {
        this.video.pause();
        this.reels.forEach((r) => this.mode === "view" && this.io && playSafe(r.querySelector("video")));
      });
      let startX = 0;
      d.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, { passive: true });
      d.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) this.go(this.index + (dx < 0 ? 1 : -1));
      });
      return d;
    }
    updateSound() {
      $("[data-sound]", this.viewer).innerHTML = this.muted ? volumeOffIcon : volumeIcon;
    }
    openViewer(index) {
      this.buildViewer();
      this.reels.forEach((r) => r.querySelector("video")?.pause());
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
      const source = reel.querySelector("video");
      const bars = $$(".reel-viewer__bars i", this.viewer);
      bars.forEach((b, i) => b.style.transform = `scaleX(${i < index ? 1 : 0})`);
      if (source) {
        this.video.innerHTML = source.innerHTML;
        this.video.poster = source.poster || "";
        this.video.muted = this.muted;
        this.video.load();
        playSafe(this.video);
      }
      $(".reel-viewer__creator", this.viewer).textContent = reel.querySelector(".reel__creator")?.textContent.trim() || "";
      const sheet = $(".reel-viewer__sheet", this.viewer);
      const tpl = reel.querySelector("template[data-reel-sheet]");
      sheet.replaceChildren(tpl ? tpl.content.cloneNode(true) : "");
      if (motionOn()) {
        $(".reel-viewer__frame", this.viewer).animate(
          [{ opacity: 0.4, transform: `translateX(${direction * 40}px) scale(0.98)` }, { opacity: 1, transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" }
        );
        sheet.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 120, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
      }
    }
  };
  var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var volumeOffIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/></svg>';
  var volumeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
  define("video-reels", VideoReels);

  // site/assets/intellect/slider.js
  init_core();
  var SliderComponent = class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector("[data-slider-track]");
      if (!this.track) return;
      this.prev = this.querySelector("[data-slider-prev]");
      this.next = this.querySelector("[data-slider-next]");
      this.bar = this.querySelector("[data-slider-progress]");
      this.prev?.addEventListener("click", () => this.page(-1));
      this.next?.addEventListener("click", () => this.page(1));
      this.update = this.update.bind(this);
      this.track.addEventListener("scroll", this.update, { passive: true });
      new ResizeObserver(this.update).observe(this.track);
      this.enableDrag();
      this.update();
    }
    page(direction) {
      const item = this.track.firstElementChild;
      const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
      const step = item ? item.getBoundingClientRect().width + gap : this.track.clientWidth;
      const perView = Math.max(1, Math.floor((this.track.clientWidth + gap) / step));
      this.track.scrollBy({ left: direction * step * perView, behavior: motionOn() ? "smooth" : "auto" });
    }
    update() {
      const { scrollLeft, scrollWidth, clientWidth } = this.track;
      const max = scrollWidth - clientWidth;
      if (this.prev) this.prev.disabled = scrollLeft <= 2;
      if (this.next) this.next.disabled = scrollLeft >= max - 2;
      this.toggleAttribute("data-static", max <= 2);
      if (this.bar) {
        const width = Math.min(100, clientWidth / scrollWidth * 100);
        const x2 = max > 0 ? scrollLeft / max * (100 / width - 1) * 100 : 0;
        this.bar.style.setProperty("--w", `${width}%`);
        this.bar.style.setProperty("--x", `${x2}%`);
      }
    }
    enableDrag() {
      let startX = 0;
      let startScroll = 0;
      let dragging = false;
      let moved = false;
      this.track.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startScroll = this.track.scrollLeft;
      });
      window.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          this.track.classList.add("is-dragging");
        }
        if (moved) this.track.scrollLeft = startScroll - dx;
      });
      window.addEventListener("pointerup", () => {
        if (!dragging) return;
        dragging = false;
        if (moved) {
          this.track.classList.remove("is-dragging");
          this.track.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true });
        }
      });
    }
  };
  define("slider-component", SliderComponent);

  // site/assets/intellect/collection.js
  init_core();
  init_motion();
  var DENSITY_KEY = "theme:grid-density";
  var FacetResults = class extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.form = this.querySelector("[data-facet-form]");
      this.onFormChange = debounce(() => this.applyForm(), 400);
      this.addEventListener("change", (e) => {
        if (e.target.matches("[data-toolbar-sort]")) {
          const sort = this.form?.querySelector("[data-sort]");
          if (sort) sort.value = e.target.value;
          this.applyForm();
        } else if (e.target.closest("[data-facet-form]")) {
          this.onFormChange();
        }
      });
      this.addEventListener("input", (e) => {
        if (e.target.matches('[data-facet-form] input[type="number"]')) this.onFormChange();
      });
      this.addEventListener("submit", (e) => {
        if (e.target.matches("[data-facet-form]")) {
          e.preventDefault();
          this.applyForm();
        }
      });
      this.addEventListener("click", (e) => {
        const link = e.target.closest("[data-facet-remove], [data-facet-clear]");
        if (link) {
          e.preventDefault();
          this.render(new URL(link.href, location.origin).search.slice(1));
          return;
        }
        const more = e.target.closest("[data-next-page]");
        if (more) {
          e.preventDefault();
          this.loadMore(more);
        }
        const density = e.target.closest("[data-density]");
        if (density) this.setDensity(density.dataset.density, true);
      });
      this.setDensity(sessionStorage.getItem(DENSITY_KEY) || "small");
      this.observeInfinite();
      window.addEventListener("popstate", this.onPop = () => this.render(location.search.slice(1), false));
    }
    disconnectedCallback() {
      window.removeEventListener("popstate", this.onPop);
      this.infinite?.disconnect();
    }
    applyForm() {
      if (!this.form) return;
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(this.form)) {
        if (value !== "") params.append(key, value);
      }
      this.render(params.toString());
    }
    async render(search, push = true) {
      const url = `${location.pathname}?${search}`;
      const fetchUrl = `${location.pathname}?${search}${search ? "&" : ""}section_id=${this.sectionId}`;
      this.classList.add("is-loading");
      try {
        const doc = parseHTML(await fetch(fetchUrl).then((r) => r.text()));
        const swap = () => {
          ["[data-results]", "[data-facets-active]", "[data-result-count]"].forEach((selector) => {
            const next = doc.querySelector(selector);
            const current = this.querySelector(selector);
            if (next && current) current.replaceWith(next);
          });
          const nextFilters = doc.querySelector("[data-facet-filters]");
          const filters = this.querySelector("[data-facet-filters]");
          if (nextFilters && filters) {
            $$("details.facet", nextFilters).forEach((group) => {
              const current = filters.querySelector(`#${CSS.escape(group.id)}`);
              if (!current) return;
              const focused = current.contains(document.activeElement) ? document.activeElement : null;
              const focusKey = focused ? `${focused.name}=${focused.value}` : null;
              current.querySelector(".facet__body").innerHTML = group.querySelector(".facet__body").innerHTML;
              current.querySelector(".facet__summary > span").innerHTML = group.querySelector(".facet__summary > span").innerHTML;
              if (focusKey) {
                const again = $$("input", current).find((i) => `${i.name}=${i.value}` === focusKey);
                again?.focus({ preventScroll: true });
              }
            });
          }
          const label = this.querySelector("[data-results-label]");
          const nextLabel = doc.querySelector("[data-results-label]");
          if (label && nextLabel) {
            label.textContent = nextLabel.textContent;
            label.dataset.text = nextLabel.dataset.text;
          }
          const sort = doc.querySelector("[data-toolbar-sort]");
          const currentSort = this.querySelector("[data-toolbar-sort]");
          if (sort && currentSort) currentSort.value = sort.value;
          this.setDensity(sessionStorage.getItem(DENSITY_KEY) || "small");
          initMotion(this.querySelector("[data-results]"));
          this.observeInfinite();
        };
        if (document.startViewTransition && motionOn()) await document.startViewTransition(swap).finished;
        else swap();
        if (push) history.pushState({}, "", url);
      } finally {
        this.classList.remove("is-loading");
      }
    }
    async loadMore(link) {
      if (link.classList.contains("is-loading")) return;
      link.classList.add("is-loading");
      try {
        const u = new URL(link.href, location.origin);
        u.searchParams.set("section_id", this.sectionId);
        const doc = parseHTML(await fetch(u).then((r) => r.text()));
        const grid = this.querySelector("[data-product-grid]");
        const items = $$("[data-product-grid] > li", doc);
        items.forEach((li, i) => {
          li.querySelector("[data-reveal]")?.style.setProperty("--i", i % 8);
          grid.append(li);
        });
        const next = doc.querySelector("[data-load-more]");
        const current = this.querySelector("[data-load-more]");
        next ? current.replaceWith(next) : current.remove();
        initMotion(grid);
        this.observeInfinite();
      } finally {
        link.classList.remove("is-loading");
      }
    }
    observeInfinite() {
      this.infinite?.disconnect();
      if (this.dataset.pagination !== "infinite") return;
      const trigger = this.querySelector("[data-next-page]");
      if (!trigger) return;
      this.infinite = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) this.loadMore(trigger);
      }, { rootMargin: "600px 0px" });
      this.infinite.observe(trigger);
    }
    setDensity(value, user = false) {
      const grid = this.querySelector("[data-product-grid]");
      $$("[data-density]", this).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.density === value)));
      if (!grid) return;
      const apply = () => grid.classList.toggle("product-grid--large", value === "large");
      if (user && document.startViewTransition && motionOn()) document.startViewTransition(apply);
      else apply();
      if (user) sessionStorage.setItem(DENSITY_KEY, value);
    }
  };
  define("facet-results", FacetResults);

  // site/assets/zariva/start.js
  init_product();

  // site/assets/intellect/bundle.js
  init_core();
  init_cart();
  var esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  var BoxBuilder = class extends HTMLElement {
    connectedCallback() {
      this.items = [];
      this.sizeBtns = $$("[data-size]", this);
      this.size = Number(this.sizeBtns[0]?.dataset.size || 3);
      this.discount = Number(this.sizeBtns[0]?.dataset.discount || 0);
      this.slots = $("[data-slots]", this);
      this.crate = $("[data-box-crate]", this);
      this.addEventListener("click", (e) => {
        const add = e.target.closest("[data-box-add]");
        const size = e.target.closest("[data-size]");
        const remove = e.target.closest("[data-remove-slot]");
        if (add) this.add(add);
        if (size) this.setSize(size);
        if (remove) this.remove(Number(remove.dataset.removeSlot));
        if (e.target.closest("[data-box-submit]")) this.submit();
        if (e.target.closest("[data-box-reopen]")) this.reopen();
        if (e.target.closest("[data-box-tray]")) this.toggleTray();
      });
      this.addEventListener("change", (e) => {
        const select = e.target.closest("[data-box-variant-select]");
        if (!select) return;
        const btn = select.closest("[data-box-product]").querySelector("[data-box-add]");
        btn.dataset.variant = select.value;
        btn.dataset.price = select.selectedOptions[0].dataset.price;
      });
      this.addEventListener("keydown", (e) => {
        if (!e.target.closest("[data-size]") || !["ArrowRight", "ArrowLeft"].includes(e.key)) return;
        const i = this.sizeBtns.indexOf(e.target.closest("[data-size]"));
        const next = this.sizeBtns[(i + (e.key === "ArrowRight" ? 1 : -1) + this.sizeBtns.length) % this.sizeBtns.length];
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
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-checked", String(b === btn));
      });
      this.size = size;
      this.discount = Number(btn.dataset.discount || 0);
      if (this.items.length > size) this.items = this.items.slice(0, size);
      this.movePill();
      this.render();
    }
    movePill() {
      const active = this.sizeBtns.find((b) => b.classList.contains("is-active"));
      const pill = $(".box__size-pill", this);
      if (!active || !pill) return;
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
    }
    add(btn) {
      if (this.items.length >= this.size) {
        if (motionOn()) this.crate.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 380 });
        const bigger = this.sizeBtns.find((b) => Number(b.dataset.size) > this.size);
        toast(this.dataset.textBlocked + (bigger ? ` (${bigger.dataset.size})` : ""));
        return;
      }
      const item = { variant: btn.dataset.variant, price: Number(btn.dataset.price), title: btn.dataset.title, image: btn.dataset.image, product: btn.closest("[data-box-product]").dataset.boxProduct };
      this.items.push(item);
      const index = this.items.length - 1;
      this.render();
      const slot = this.slots.children[index];
      const img = btn.closest("[data-box-product]").querySelector("img");
      if (motionOn() && img && slot) this.fly(img, slot);
    }
    fly(img, slot) {
      const from = img.getBoundingClientRect();
      const to = slot.getBoundingClientRect();
      const ghost = img.cloneNode();
      ghost.removeAttribute("srcset");
      ghost.src = img.currentSrc || img.src;
      ghost.className = "box__ghost";
      ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;`;
      document.body.append(ghost);
      slot.style.opacity = "0";
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      ghost.animate(
        [
          { transform: "translate(0,0) scale(1)", borderRadius: "12px" },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(${(to.width / from.width + 1) / 2})`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) scale(${to.width / from.width})`, borderRadius: "8px" }
        ],
        { duration: 640, easing: "cubic-bezier(.45,0,.2,1)" }
      ).finished.then(() => {
        ghost.remove();
        slot.style.opacity = "";
        slot.animate([{ transform: "scale(0.8)" }, { transform: "scale(1.08)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" });
      });
    }
    remove(i) {
      this.items.splice(i, 1);
      this.crate.classList.remove("is-closed");
      this.render();
    }
    reopen() {
      this.crate.classList.remove("is-closed");
      this.render();
    }
    render() {
      const full = this.items.length === this.size;
      this.slots.style.setProperty("--slots", this.size);
      this.slots.innerHTML = Array.from({ length: this.size }, (_2, i) => {
        const it = this.items[i];
        return it ? `<li class="box__slot is-filled"><img src="${esc(it.image)}" alt="" width="200" height="200"><button type="button" class="box__remove" data-remove-slot="${i}" aria-label="${esc(this.dataset.textRemove.replace("[title]", it.title))}">\xD7</button></li>` : `<li class="box__slot"><span>${i + 1}</span></li>`;
      }).join("");
      const subtotal = this.items.reduce((sum, it) => sum + it.price, 0);
      const saving = full ? Math.round(subtotal * this.discount / 100) : 0;
      $("[data-items-total]", this).textContent = formatMoney(subtotal);
      $("[data-saving]", this).textContent = saving ? `\u2212${formatMoney(saving)}` : formatMoney(0);
      $("[data-box-total]", this).textContent = formatMoney(subtotal - saving);
      $("[data-meter]", this).style.transform = `scaleX(${this.items.length / this.size})`;
      const left = this.size - this.items.length;
      const progress = $("[data-progress]", this);
      progress.textContent = full ? this.dataset.textFull.replace("[discount]", this.discount) : this.dataset.textProgress.replace("[count]", this.items.length).replace("[size]", this.size) + " " + this.dataset.textMore.replace("[left]", left).replace("[discount]", this.discount);
      const submit = $("[data-box-submit]", this);
      submit.disabled = !full;
      $("[data-box-submit-label]", this).textContent = full ? this.dataset.textAdd.replace("[price]", formatMoney(subtotal - saving)) : this.dataset.textFill;
      $("[data-box-reopen]", this).hidden = !this.crate.classList.contains("is-closed");
      $$("[data-box-product]", this).forEach((card) => {
        const n = this.items.filter((it) => it.product === card.dataset.boxProduct).length;
        const badge = $("[data-count]", card);
        badge.hidden = n === 0;
        badge.querySelector("span").textContent = n;
      });
      $("[data-tray-slots]", this).innerHTML = Array.from({ length: this.size }, (_2, i) => this.items[i] ? `<img src="${esc(this.items[i].image)}" alt="" width="40" height="40">` : "<i></i>").join("");
      $("[data-tray-text]", this).textContent = `${this.items.length}/${this.size} \xB7 ${formatMoney(subtotal - saving)}`;
      if (full && !this.crate.classList.contains("is-closed")) {
        setTimeout(() => {
          if (this.items.length === this.size) {
            this.crate.classList.add("is-closed");
            $("[data-box-reopen]", this).hidden = false;
          }
        }, motionOn() ? 650 : 0);
      }
    }
    toggleTray() {
      const open = this.classList.toggle("tray-open");
      $("[data-box-tray]", this).setAttribute("aria-expanded", String(open));
    }
    async submit() {
      if (this.items.length !== this.size) return;
      const btn = $("[data-box-submit]", this);
      btn.classList.add("is-loading");
      const code = Math.random().toString(36).slice(2, 6).toUpperCase();
      const label = `${this.dataset.name} \xB7 ${this.size} \xB7 ${code}`;
      const items = this.items.map((it) => ({ id: Number(it.variant), quantity: 1, properties: { Box: label, _box: code } }));
      if (this.dataset.boxVariant) items.unshift({ id: Number(this.dataset.boxVariant), quantity: 1, properties: { Box: label, _box: code } });
      try {
        const data = new FormData();
        items.forEach((it, i) => {
          data.append(`items[${i}][id]`, it.id);
          data.append(`items[${i}][quantity]`, it.quantity);
          Object.entries(it.properties).forEach(([k2, v]) => data.append(`items[${i}][properties][${k2}]`, v));
        });
        if (motionOn()) await this.crate.animate([{ transform: "none" }, { transform: "scale(0.9) translateY(-10px)" }, { transform: "scale(0.2) translate(40vw, -40vh)", opacity: 0 }], { duration: 700, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" }).finished;
        await Cart.add(data);
        this.crate.getAnimations().forEach((a) => a.cancel());
        this.items = [];
        this.crate.classList.remove("is-closed");
        this.render();
        if (motionOn()) this.crate.animate([{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.16,1,.3,1)" });
        openCart();
      } catch (err) {
        toast(err.message);
        this.crate.getAnimations().forEach((a) => a.cancel());
      } finally {
        btn.classList.remove("is-loading");
      }
    }
  };
  define("box-builder", BoxBuilder);

  // site/assets/intellect/moments.js
  init_core();
  var name = document.documentElement.dataset.moment;
  var effect = Boolean(window.Theme?.moment?.effect);
  var isChristmas = name === "christmas" || name === "christmas-summer";
  if (motionOn() && name) start();
  function start() {
    const canvas = document.createElement("canvas");
    canvas.className = "moment-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    canvas.setAttribute("popover", "manual");
    raise(canvas);
    document.addEventListener("theme:dialog:open", () => {
      raise(canvas);
      document.querySelectorAll(".moment-sleigh").forEach(raise);
    });
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
    };
    resize();
    addEventListener("resize", resize);
    const rand = (a, b) => a + Math.random() * (b - a);
    const sparks = [];
    const ambient = [];
    const FIRE = [
      ["#ff6a00", "#ffc23d"],
      // saffron
      ["#e0218a", "#ff9ad5"],
      // rani pink
      ["#0f9d58", "#9be15d"],
      // emerald
      ["#e8a400", "#fff1a8"],
      // gold
      ["#3b5bdb", "#a5b8ff"],
      // royal blue
      ["#e63946", "#ffb199"]
      // sindoor red
    ];
    const flashes = [];
    function burst(x2, y, [main, glitter], count = 96, power = 1) {
      flashes.push({ x: x2, y, life: 1, c: main, r: 90 * dpr * power });
      const ring = Math.random() < 0.35;
      for (let i = 0; i < count; i += 1) {
        const a = Math.PI * 2 * i / count + rand(-0.06, 0.06);
        const v = (ring ? rand(5.2, 5.8) : rand(1.4, 6.4)) * dpr * power;
        const isGlitter = Math.random() < 0.28;
        sparks.push({ x: x2, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(8e-3, 0.014), c: isGlitter ? glitter : main, g: 0.05 * dpr, r: rand(2, 3.4) * dpr, drag: 0.972, twinkle: isGlitter });
      }
    }
    function rocket(x2, targetY, delay = 0) {
      setTimeout(() => {
        const colour = FIRE[Math.random() * FIRE.length | 0];
        const g = 0.16 * dpr;
        const vy = -Math.sqrt(2 * g * Math.max(80 * dpr, h + 10 - targetY));
        sparks.push({ x: x2, y: h + 10, vx: rand(-0.6, 0.6) * dpr, vy, life: 1, decay: 0, c: colour[0], g, r: 3 * dpr, rocket: true, colour });
        wake();
      }, delay);
    }
    function fireworks(n = 4) {
      const drawer = document.querySelector("dialog[open].drawer");
      const edge = drawer ? drawer.getBoundingClientRect().left : 0;
      const right = edge > innerWidth * 0.4 ? edge * dpr - 80 * dpr : w * 0.88;
      for (let i = 0; i < n; i += 1) rocket(rand(w * 0.1, right), rand(h * 0.14, h * 0.4), i * 320 + rand(0, 160));
    }
    function fountain(cx, cy) {
      const x2 = cx * dpr;
      const y = cy * dpr;
      const colour = FIRE[Math.random() * FIRE.length | 0];
      flashes.push({ x: x2, y, life: 1, c: colour[0], r: 60 * dpr });
      for (let i = 0; i < 70; i += 1) {
        const a = -Math.PI / 2 + rand(-0.75, 0.75);
        const v = rand(3, 8.5) * dpr;
        sparks.push({ x: x2 + rand(-14, 14) * dpr, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.012, 0.02), c: Math.random() < 0.35 ? colour[1] : colour[0], g: 0.14 * dpr, r: rand(1.8, 3) * dpr, drag: 0.985, twinkle: Math.random() < 0.3 });
      }
      wake();
    }
    if (effect) {
      const count = innerWidth < 750 ? 26 : 54;
      for (let i = 0; i < count; i += 1) ambient.push(newAmbient(true));
    }
    function newAmbient(initial) {
      if (name === "diwali") return { x: rand(0, w), y: initial ? rand(0, h) : h + 10, vy: -rand(0.15, 0.45) * dpr, vx: rand(-0.1, 0.1) * dpr, r: rand(0.8, 2) * dpr, a: rand(0.25, 0.7), c: ["#ffd27a", "#ffb347", "#ff8c1a"][Math.random() * 3 | 0], t: rand(0, 6) };
      if (name === "christmas") {
        const depth = Math.random();
        return { x: rand(0, w), y: initial ? rand(0, h) : -10, vy: (0.35 + depth * 1.1) * dpr, vx: rand(-0.25, 0.25) * dpr, r: (0.8 + depth * 2.8) * dpr, a: 0.35 + depth * 0.6, c: "#ffffff", t: rand(0, 6) };
      }
      return { x: rand(0, w), y: rand(0, h), vx: 0, vy: 0, r: rand(0.8, 1.8) * dpr, a: rand(0.4, 0.9), c: ["#ffe28a", "#ffd166", "#fff4c7"][Math.random() * 3 | 0], t: rand(0, 6), life: rand(0, 1) };
    }
    let raf = 0;
    function wake() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function frame() {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
      if (name === "christmas") {
        ctx.shadowColor = "rgb(70 90 120 / 0.55)";
        ctx.shadowBlur = 3 * dpr;
      }
      for (let i = 0; i < ambient.length; i += 1) {
        const p = ambient[i];
        p.t += 0.02;
        p.x += p.vx + Math.sin(p.t) * 0.25 * dpr;
        p.y += p.vy;
        let alpha = p.a;
        if (name === "diwali") alpha *= 0.6 + Math.sin(p.t * 3) * 0.4;
        if (name === "christmas-summer") {
          p.life += 6e-3;
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
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = f.life * 0.32;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineCap = "round";
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    });
    let sleighActive = false;
    let sleighQueued = false;
    function sleigh() {
      if (sleighActive) {
        sleighQueued = true;
        return;
      }
      sleighActive = true;
      const el = document.createElement("div");
      el.className = "moment-sleigh";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = SLEIGH;
      el.setAttribute("popover", "manual");
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
          { transform: `translate(${innerWidth + 40}px, -40px) rotate(-9deg)` }
        ],
        { duration: Math.max(6500, innerWidth * 5.5), easing: "linear" }
      );
      const trail = setInterval(() => {
        const r = el.getBoundingClientRect();
        for (let i = 0; i < 3; i += 1) {
          sparks.push({ x: (r.left + 18) * dpr, y: (r.top + r.height * 0.75) * dpr, px: (r.left + 18) * dpr, py: (r.top + r.height * 0.75) * dpr, vx: rand(-1.2, -0.2) * dpr, vy: rand(-0.4, 0.6) * dpr, life: 1, decay: rand(0.015, 0.03), c: ["#e8a400", "#ffc23d", "#d4a72c"][i], g: 0.02 * dpr, r: rand(1.2, 2.2) * dpr });
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
    const ONCE = `theme:moment-intro:${name}`;
    const firstTime = !sessionStorage.getItem(ONCE);
    try {
      sessionStorage.setItem(ONCE, "1");
    } catch {
    }
    if (name === "diwali") setTimeout(() => fireworks(firstTime ? 5 : 2), 900);
    if (isChristmas && firstTime) setTimeout(sleigh, 1600);
    let pressed = null;
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest('button, [type="submit"], .btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      pressed = { x: r.left + r.width / 2, y: r.top + 4, at: performance.now() };
    }, { passive: true });
    document.addEventListener("theme:cart:added", () => {
      if (name === "diwali") {
        if (pressed && performance.now() - pressed.at < 8e3) fountain(pressed.x, pressed.y);
        setTimeout(() => fireworks(innerWidth < 750 ? 3 : 4), 350);
      }
      if (isChristmas) setTimeout(sleigh, 500);
    });
    document.addEventListener("click", (e) => {
      const btn = name === "diwali" && e.target.closest('[name="checkout"]');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      fountain(r.left + r.width / 2, r.top + 4);
      fireworks(2);
    });
    wake();
  }
  function raise(el) {
    if (!el.showPopover) return;
    try {
      if (el.matches(":popover-open")) el.hidePopover();
      el.showPopover();
    } catch {
    }
  }
  var SLEIGH = `
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

  // site/assets/zariva/start.js
  init_cart();
  window.ZarivaIntellect = { Cart, openCart };
  window.LoupeConfig = window.LoupeConfig || {};
  window.LoupeConfig.src = "assets/intellect/loupe.js";
  var loader = document.createElement("script");
  loader.src = "assets/intellect/loupe-loader.js";
  document.head.append(loader);
  if (location.hash === "#bag") setTimeout(openCart, 600);
  window.PROTO && window.PROTO.refresh();
})();
