/* Intellect · collection.js
   Filters and sorting without page reloads, active filter chips, load more /
   infinite scroll, and the grid density switch. Used by collection and search pages. */

import { $, $$, define, debounce, parseHTML, motionOn } from '@theme/core';
import { initMotion } from '@theme/motion';

const DENSITY_KEY = 'theme:grid-density';

class FacetResults extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.form = this.querySelector('[data-facet-form]');

    this.onFormChange = debounce(() => this.applyForm(), 400);
    this.addEventListener('change', (e) => {
      if (e.target.matches('[data-toolbar-sort]')) {
        const sort = this.form?.querySelector('[data-sort]');
        if (sort) sort.value = e.target.value;
        this.applyForm();
      } else if (e.target.closest('[data-facet-form]')) {
        this.onFormChange();
      }
    });
    this.addEventListener('input', (e) => {
      if (e.target.matches('[data-facet-form] input[type="number"]')) this.onFormChange();
    });
    this.addEventListener('submit', (e) => {
      if (e.target.matches('[data-facet-form]')) {
        e.preventDefault();
        this.applyForm();
      }
    });
    this.addEventListener('click', (e) => {
      const link = e.target.closest('[data-facet-remove], [data-facet-clear]');
      if (link) {
        e.preventDefault();
        this.render(new URL(link.href, location.origin).search.slice(1));
        return;
      }
      const more = e.target.closest('[data-next-page]');
      if (more) {
        e.preventDefault();
        this.loadMore(more);
      }
      const density = e.target.closest('[data-density]');
      if (density) this.setDensity(density.dataset.density, true);
    });

    this.setDensity(sessionStorage.getItem(DENSITY_KEY) || 'small');
    this.observeInfinite();

    window.addEventListener('popstate', this.onPop = () => this.render(location.search.slice(1), false));
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.onPop);
    this.infinite?.disconnect();
  }

  applyForm() {
    if (!this.form) return;
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(this.form)) {
      if (value !== '') params.append(key, value);
    }
    this.render(params.toString());
  }

  async render(search, push = true) {
    const url = `${location.pathname}?${search}`;
    const fetchUrl = `${location.pathname}?${search}${search ? '&' : ''}section_id=${this.sectionId}`;
    this.classList.add('is-loading');
    try {
      const doc = parseHTML(await fetch(fetchUrl).then((r) => r.text()));
      const swap = () => {
        ['[data-results]', '[data-facets-active]', '[data-result-count]'].forEach((selector) => {
          const next = doc.querySelector(selector);
          const current = this.querySelector(selector);
          if (next && current) current.replaceWith(next);
        });
        // Update filter groups in place so open/closed state and focus survive.
        const nextFilters = doc.querySelector('[data-facet-filters]');
        const filters = this.querySelector('[data-facet-filters]');
        if (nextFilters && filters) {
          $$('details.facet', nextFilters).forEach((group) => {
            const current = filters.querySelector(`#${CSS.escape(group.id)}`);
            if (!current) return;
            const focused = current.contains(document.activeElement) ? document.activeElement : null;
            const focusKey = focused ? `${focused.name}=${focused.value}` : null;
            current.querySelector('.facet__body').innerHTML = group.querySelector('.facet__body').innerHTML;
            current.querySelector('.facet__summary > span').innerHTML = group.querySelector('.facet__summary > span').innerHTML;
            if (focusKey) {
              const again = $$('input', current).find((i) => `${i.name}=${i.value}` === focusKey);
              again?.focus({ preventScroll: true });
            }
          });
        }
        const label = this.querySelector('[data-results-label]');
        const nextLabel = doc.querySelector('[data-results-label]');
        if (label && nextLabel) {
          label.textContent = nextLabel.textContent;
          label.dataset.text = nextLabel.dataset.text;
        }
        const sort = doc.querySelector('[data-toolbar-sort]');
        const currentSort = this.querySelector('[data-toolbar-sort]');
        if (sort && currentSort) currentSort.value = sort.value;
        this.setDensity(sessionStorage.getItem(DENSITY_KEY) || 'small');
        initMotion(this.querySelector('[data-results]'));
        this.observeInfinite();
      };
      if (document.startViewTransition && motionOn()) await document.startViewTransition(swap).finished;
      else swap();
      if (push) history.pushState({}, '', url);
    } finally {
      this.classList.remove('is-loading');
    }
  }

  async loadMore(link) {
    if (link.classList.contains('is-loading')) return;
    link.classList.add('is-loading');
    try {
      const u = new URL(link.href, location.origin);
      u.searchParams.set('section_id', this.sectionId);
      const doc = parseHTML(await fetch(u).then((r) => r.text()));
      const grid = this.querySelector('[data-product-grid]');
      const items = $$('[data-product-grid] > li', doc);
      items.forEach((li, i) => {
        li.querySelector('[data-reveal]')?.style.setProperty('--i', i % 8);
        grid.append(li);
      });
      const next = doc.querySelector('[data-load-more]');
      const current = this.querySelector('[data-load-more]');
      next ? current.replaceWith(next) : current.remove();
      initMotion(grid);
      this.observeInfinite();
    } finally {
      link.classList.remove('is-loading');
    }
  }

  observeInfinite() {
    this.infinite?.disconnect();
    if (this.dataset.pagination !== 'infinite') return;
    const trigger = this.querySelector('[data-next-page]');
    if (!trigger) return;
    this.infinite = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) this.loadMore(trigger);
    }, { rootMargin: '600px 0px' });
    this.infinite.observe(trigger);
  }

  setDensity(value, user = false) {
    const grid = this.querySelector('[data-product-grid]');
    $$('[data-density]', this).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.density === value)));
    if (!grid) return;
    const apply = () => grid.classList.toggle('product-grid--large', value === 'large');
    if (user && document.startViewTransition && motionOn()) document.startViewTransition(apply);
    else apply();
    if (user) sessionStorage.setItem(DENSITY_KEY, value);
  }
}
define('facet-results', FacetResults);
