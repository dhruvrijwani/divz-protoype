(() => {
  // site/assets/zariva/catalog.js
  var Z = window.ZARIVA;
  var parse = (s) => /* @__PURE__ */ new Date(s + "T12:00:00");
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var fmtLong = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  var fmtShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  var days = (a, b) => Math.round((b - a) / 864e5);
  var read = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      return null;
    }
  };
  var today = () => parse(new URLSearchParams(location.search).get("today") || read("zariva:today") || Z.today);
  var moments = Z.moments;
  var always = Z.always;
  var recipients = Z.recipients;
  function momentState(m, t = today()) {
    const start = parse(m.date), end = parse(m.end || m.date), orderBy = parse(m.orderBy || m.date);
    return { start, end, orderBy, toDate: days(t, start), toOrder: days(t, orderBy), active: m.kind === "sale" && t >= start && t <= end, orderable: t <= orderBy, past: t > end };
  }
  var upcoming = (t = today()) => moments.filter((m) => !momentState(m, t).past).sort((a, b) => parse(a.date) - parse(b.date));
  function lead(t = today()) {
    for (const m of upcoming(t)) {
      const s = momentState(m, t);
      if (m.kind === "sale") {
        if (s.active || s.toDate <= 10) return m;
        continue;
      }
      return s.toDate <= 50 ? m : null;
    }
    return null;
  }
  var occasion = (id) => moments.find((m) => m.id === id) || always.find((m) => m.id === id) || null;
  var quietActive = () => {
    const q2 = occasion("quiet-week");
    return q2 ? momentState(q2).active : false;
  };
  var hash = (s) => {
    let n = 7;
    for (const c of s) n = (n * 31 + c.charCodeAt(0)) % 9e6;
    return n;
  };
  var img = (key, w = 900) => `assets/img/${key}-${w > 900 ? 1700 : 900}.jpg`;
  var money = (cents) => "$" + (cents / 100).toLocaleString("en-AU", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
  function build(p) {
    const id = hash(p.handle) * 10;
    const options = p.options.map((o, i) => ({
      name: o.name,
      position: i + 1,
      swatch: !!o.swatch,
      values: o.values.map((v, k) => ({ name: v.v, id: id * 100 + (i + 1) * 10 + k, hex: v.hex || null, note: v.note || "", add: v.add || 0, price: v.price || 0, compare: v.compare || 0 }))
    }));
    const combos = options.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => [...a, v])), [[]]);
    const onSale = quietActive() && p.occasions.includes("quiet-week");
    const variants = combos.map((vals, k) => {
      let price2 = p.price;
      for (const v of vals) {
        if (v.price) price2 = v.price;
        if (v.add) price2 += v.add;
      }
      const full = Math.round(price2 * 100);
      return {
        id: id * 1e3 + k + 1,
        title: vals.map((v) => v.name).join(" / ") || "Default Title",
        options: vals.map((v) => v.name),
        valueIds: vals.map((v) => v.id),
        price: onSale ? Math.round(full * 0.85 / 100) * 100 : full,
        compare_at_price: onSale ? full : vals.find((v) => v.compare) ? Math.round(vals.find((v) => v.compare).compare * 100) : 0,
        available: !vals.some((v) => (p.soldOut || []).includes(v.name))
      };
    });
    return {
      ...p,
      id,
      options,
      variants,
      onSale,
      url: `product.html?p=${p.handle}`,
      path: `/products/${p.handle}`,
      hasOnlyDefault: options.length === 0,
      firstAvailable: variants.find((v) => v.available) || variants[0],
      priceMin: Math.min(...variants.map((v) => v.price)),
      priceVaries: new Set(variants.map((v) => v.price)).size > 1
    };
  }
  var products = Z.products.map(build);
  var product = (h) => products.find((p) => p.handle === h);
  var variantById = (id) => {
    for (const p of products) {
      const v = p.variants.find((x) => x.id === Number(id));
      if (v) return { product: p, variant: v };
    }
    return null;
  };
  var hampers = () => products.filter((p) => p.type === "hamper");
  var inOccasion = (id) => hampers().filter((p) => p.occasions.includes(id));
  var forWho = (id) => hampers().filter((p) => p.for.includes(id));
  var { reviews, reviewStats, ugc, journal, buildItems, boxes, focus, delivery } = Z;
  var sendingFor = (p) => upcoming().find((m) => m.kind !== "sale" && p.occasions.includes(m.id) && momentState(m).orderable && momentState(m).toDate <= 50) || null;

  // site/assets/zariva/icons.js
  var ICONS = {
    "arrow": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15M13.5 6l6 6-6 6"/></svg>',
    "arrow-up-right": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    "chevron": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>',
    "chevron-right": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>',
    "close": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    "plus": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>',
    "minus": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/></svg>',
    "search": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    "account": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="3.75"/><path d="M4.75 20c.9-3.6 3.8-5.5 7.25-5.5s6.35 1.9 7.25 5.5"/></svg>',
    "cart": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
    "menu": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 8h17M3.5 16h17"/></svg>',
    "check": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    "filter": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    "play": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5.5v13a.6.6 0 0 0 .9.5l10.4-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5Z"/></svg>',
    "pause": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
    "zoom": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/></svg>',
    "error": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.2v.1"/></svg>',
    "truck": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.75"/><circle cx="17.5" cy="17.5" r="1.75"/></svg>',
    "gift": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13"/><path d="M12 7c-1.5-3.5-5.5-3.5-5.5-1S10 7 12 7Zm0 0c1.5-3.5 5.5-3.5 5.5-1S14 7 12 7Z"/></svg>',
    "return": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    "lock": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    "leaf": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z"/><path d="M5 19 13 11"/></svg>',
    "sparkle": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5ZM18.5 15.5c.3 1.9.9 2.6 2.8 2.8-1.9.3-2.5.9-2.8 2.8-.3-1.9-.9-2.5-2.8-2.8 1.9-.2 2.5-.9 2.8-2.8Z"/></svg>',
    "heart": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z"/></svg>',
    "star": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 3.3 2.6 5.5 6 .7-4.4 4.1 1.1 6L12 16.7l-5.3 2.9 1.1-6-4.4-4.1 6-.7z"/></svg>',
    "mail": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>',
    "phone": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"/></svg>',
    "pin": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    "clock": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    "share": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 12v7h14v-7"/></svg>',
    "grid": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/></svg>',
    "grid-dense": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg>',
    "volume-off": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/></svg>',
    "volume": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    "instagram": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><path d="M17.2 6.8v.01"/></svg>',
    "tiktok": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.6 3h-3.1v12.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.6a5.8 5.8 0 1 0 5 5.8V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4A4.3 4.3 0 0 1 16.6 3Z"/></svg>',
    "facebook": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.4 21v-7.8h2.6l.4-3h-3V8.3c0-.9.3-1.5 1.5-1.5h1.6V4.1a21 21 0 0 0-2.4-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.6v3h2.6V21h3.2Z"/></svg>',
    "pinterest": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.1-1.8 0-2.6l1.1-4.6s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.8 3.1-.2.9.5 1.7 1.4 1.7 1.7 0 3-1.8 3-4.4 0-2.3-1.6-3.9-4-3.9a4.1 4.1 0 0 0-4.3 4.1c0 .8.3 1.7.7 2.2l.1.3-.3 1.1c0 .2-.2.2-.4.1-1.2-.6-2-2.4-2-3.8 0-3.1 2.2-5.9 6.5-5.9 3.4 0 6 2.4 6 5.6 0 3.4-2.1 6.1-5 6.1-1 0-2-.5-2.3-1.1l-.6 2.4c-.2.9-.8 1.9-1.2 2.6A9 9 0 1 0 12 3Z"/></svg>',
    "youtube": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    "x": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.5 3.5h3l-6.6 7.6 7.8 9.4h-6.1l-4.8-5.9-5.5 5.9h-3l7.1-8.1L2 3.5h6.2l4.3 5.4 5-5.4Zm-1 15.3h1.7L7.6 5.1H5.8l10.7 13.7Z"/></svg>',
    "threads": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M17.5 8.2C16.6 5.5 14.5 4 12 4 7.8 4 5.5 7.2 5.5 12s2.3 8 6.5 8c3.3 0 5.6-1.9 5.6-4.6 0-2.6-2.2-4-5-4-2.2 0-3.6 1.1-3.6 2.6 0 1.3 1.1 2.2 2.6 2.2 2.6 0 3.6-2.4 3.4-5.6"/></svg>',
    "whatsapp": '<svg class="icon icon-__NAME__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6l-3.9.9Z"/><path d="M9.2 8.6c.2-.4.5-.4.8-.4h.4c.2 0 .4.2.5.4l.6 1.4c.1.3 0 .5-.1.7l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.5-.2.7-.1l1.4.6c.2.1.4.3.4.5v.4c0 .3 0 .6-.4.8-.6.4-1.4.6-2.3.3a8 8 0 0 1-4.8-4.8c-.2-.9 0-1.7.3-2.3Z"/></svg>'
  };
  var icon = (name, cls = "") => (ICONS[name] || "").replace("__NAME__", name + (cls ? " " + cls : ""));

  // site/assets/zariva/render.js
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var sec = (id, cls, html2) => `<div id="shopify-section-${id}" class="shopify-section ${cls}">${html2}</div>`;
  var pic = (key, w = 900, attrs = "") => `<img src="${img(key, w)}" alt="" loading="lazy" style="object-position:${focus[key] || "center"}" ${attrs}>`;
  var btnInner = (label) => `<span class="btn__label"><span data-text="${esc(label)}">${esc(label)}</span></span>`;
  function price(p, v = p.firstAvailable, { from = false, cls = "" } = {}) {
    const isFrom = from && p.priceVaries;
    const current = isFrom ? p.priceMin : v.price;
    const compare = isFrom ? 0 : v.compare_at_price;
    const sale = compare > current;
    return `<div class="price${sale ? " price--sale" : ""}${cls ? " " + cls : ""}" data-price>${isFrom ? '<span class="price__from">From</span>' : ""}<span class="price__current">${money(current)}</span>${sale ? `<s class="price__compare">${money(compare)}</s>` : ""}</div>`;
  }
  function badges(p, v = p.firstAvailable) {
    const b = [];
    if (v.compare_at_price > v.price) b.push('<span class="badge badge--sale">Quiet Week</span>');
    else if (p.badge) b.push(`<span class="badge">${esc(p.badge)}</span>`);
    return `<div class="badges" data-badges>${b.join("")}</div>`;
  }
  var arrive = (p) => {
    const m = sendingFor(p);
    return m ? `Arrives before ${m.name}` : "";
  };
  function card(p, i = 0, sectionId = "grid") {
    const v = p.firstAvailable;
    const [a, b] = p.images;
    const sizeOpt = p.options.length === 1 ? p.options[0] : null;
    let quick = "";
    if (p.hasOnlyDefault) {
      quick = `<div class="card__quick card__quick--button"><product-form data-quick><form method="post" action="/cart/add" class="shopify-product-form"><input type="hidden" name="id" value="${v.id}"><button type="submit" class="btn btn--ghost">${btnInner("Add to bag")}</button></form></product-form></div>`;
    } else if (sizeOpt && !sizeOpt.swatch) {
      quick = `<product-form class="card__sizes" data-quick><form method="post" action="/cart/add" class="shopify-product-form"><p class="card__sizes-label caption"><span>Add to bag</span></p><div class="card__sizes-list" role="group" aria-label="Add ${esc(p.title)} to bag">${p.variants.map((x) => `<button type="submit" name="id" value="${x.id}" class="card__size"${x.available ? "" : " disabled"} aria-label="Add ${esc(p.title)}, ${esc(x.title)}">${esc(x.title)}</button>`).join("")}</div><input type="hidden" name="section-id" value="${sectionId}"></form></product-form>
      <div class="card__quick card__quick--fab card__sizes-fab"><button type="button" class="btn btn--ghost" data-quick-view="${p.path}" aria-label="Choose options for ${esc(p.title)}" aria-haspopup="dialog">${icon("plus")}<span class="btn__label">Choose options</span></button></div>`;
    } else {
      quick = `<div class="card__quick card__quick--fab"><button type="button" class="btn btn--ghost" data-quick-view="${p.path}" aria-label="Choose options for ${esc(p.title)}" aria-haspopup="dialog">${icon("plus")}<span class="btn__label">Choose options</span></button></div>`;
    }
    const when = arrive(p);
    return `<div class="card card--stacked" style="--card-align: left; --card-items: flex-start; --adapt-ratio: 0.8; --i: ${i % 8};" data-product-root data-card data-reveal>
    <div class="card__media">
      <a href="${p.url}" class="media hover-zoom ratio-portrait" data-card-link tabindex="-1" aria-hidden="true">${pic(a, 900, `class="card__img-1" alt="${esc(p.title)}"`)}${b && b !== a ? pic(b, 900, 'class="card__img-2"') : ""}</a>
      ${badges(p).replace('class="badges"', 'class="badges card__badges"')}
      ${p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(loupeData(p)))}"></loupe-chip>` : ""}
      ${quick}
    </div>
    <div class="card__info"><div class="card__row"><h3 class="card__title"><a href="${p.url}" class="card__link" data-card-link>${esc(p.title)}</a></h3></div>${price(p, v, { from: true })}${when ? `<p class="card__note caption">${when}</p>` : ""}</div>
  </div>`;
  }
  function loupeData(p) {
    const l = p.loupe;
    return {
      v: 1,
      id: p.id,
      handle: p.handle,
      title: p.title,
      url: p.url,
      available: true,
      price: p.firstAvailable.price,
      priceLabel: money(p.firstAvailable.price),
      compareAtPrice: 0,
      compareAtLabel: "",
      image: img(p.images[0]),
      description: p.description,
      rating: p.reviews ? { value: p.rating, max: 5, count: p.reviews } : null,
      clip: { src: `assets/video/${l.clip.video}.mp4`, hd: "", poster: `assets/video/${l.clip.video}.jpg`, duration: 0, creator: l.clip.creator, label: l.clip.label },
      features: l.features,
      reviews: l.reviews,
      options: p.options.map((o) => ({ name: o.name, values: o.values.map((v) => ({ name: v.name, swatch: v.hex ? { color: v.hex, image: null } : null })) })),
      variants: p.variants.map((v) => ({ id: v.id, options: v.options, available: v.available, price: v.price, priceLabel: money(v.price), compareAtPrice: v.compare_at_price, compareAtLabel: v.compare_at_price ? money(v.compare_at_price) : "", image: img(p.images[0]) })),
      selectedVariantId: p.firstAvailable.id
    };
  }
  function announcement() {
    const m = lead();
    const msgs = [];
    if (m) {
      const s = momentState(m);
      if (m.kind === "sale") msgs.push(s.active ? `The Quiet Week: 15% off selected hampers until ${fmtLong(s.end)}` : `The Quiet Week starts ${fmtLong(s.start)}`);
      else msgs.push(s.orderable ? `${m.name} is ${fmtLong(s.start)}. Order by ${fmtLong(s.orderBy)} for delivery Australia-wide` : `${m.name} is ${fmtLong(s.start)}. Same-day delivery in Sydney and Melbourne`);
    }
    msgs.push("Every hamper wrapped by hand, with a note written in ink");
    msgs.push("Free delivery over $150");
    return sec("announcement", "section-announcement", `<announcement-bar class="announcement announcement--rotate scheme-scheme-1" data-mode="rotate" data-speed="5" role="region" aria-label="Announcements"><div class="page-width"><div class="announcement__track">${msgs.map((t, i) => `<p class="announcement__item${i ? "" : " is-active"}"${i ? ' aria-hidden="true"' : ""}>${esc(t)}</p>`).join("")}</div></div></announcement-bar>`);
  }
  var LOGO = `<span class="z-logo" aria-label="House of Zariva"><svg class="z-logo__mark" viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 21.5V9a7.5 7.5 0 0 1 15 0v12.5" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M9 9.7l2 2.5-2 2.5-2-2.5z" fill="#B38B4D"/></svg><span class="z-logo__house">House of</span><span class="z-logo__name">Zariva</span></span>`;
  function header(current = "") {
    const up = upcoming().slice(0, 4);
    const m = lead() || up[0];
    const occ = `<li class="nav__item nav__item--mega" data-has-panel>
    <a href="collection.html?c=all" class="nav__link" aria-expanded="false" aria-haspopup="true"><span class="link">Occasions</span>${icon("chevron", "nav__chevron")}</a>
    <div class="mega scheme-scheme-1"><div class="page-width"><div class="mega__inner" style="grid-template-columns: repeat(2, minmax(0, 1fr)) auto;">
      <div class="mega__col" style="--i: 0"><a href="collection.html?c=all" class="mega__heading h6"><span class="link">Coming up</span></a><ul class="mega__list list-reset" role="list">${up.map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)} <span class="muted">\xB7 ${fmtShort(parse(x.date))}</span></a></li>`).join("")}</ul></div>
      <div class="mega__col" style="--i: 1"><a href="collection.html?c=all" class="mega__heading h6"><span class="link">Any day</span></a><ul class="mega__list list-reset" role="list">${always.map((x) => `<li><a href="collection.html?c=${x.id}">${esc(x.name)}</a></li>`).join("")}</ul></div>
      ${m ? `<div class="mega__promos"><a href="collection.html?c=${m.id}" class="mega__promo mega__col" style="--i: 2"><div class="media hover-zoom ratio-portrait">${pic(m.image)}</div><span class="h5">${esc(m.name)}</span><span class="caption">${esc(m.line)}</span></a></div>` : ""}
    </div></div></div></li>`;
    const who = `<li class="nav__item nav__item--dropdown" data-has-panel><a href="collection.html?c=all" class="nav__link" aria-expanded="false" aria-haspopup="true"><span class="link">Who it\u2019s for</span>${icon("chevron", "nav__chevron")}</a><ul class="dropdown list-reset scheme-scheme-1" role="list">${recipients.map((r) => `<li><a href="collection.html?for=${r.id}">${esc(r.name)}</a></li>`).join("")}</ul></li>`;
    const plain = (href, label) => `<li class="nav__item"><a href="${href}" class="nav__link"${current === href ? ' aria-current="page"' : ""}><span class="link">${label}</span></a></li>`;
    const html2 = `<site-header class="header-bar" data-sticky="scroll-up" ${current === "index.html" ? "data-transparent" : ""} style="--overlay-text: #FFFFFF;">
    <div class="header__bar scheme-scheme-1"><div class="page-width"><div class="header header--logo-center">
      <div class="header__start">
        <button type="button" class="icon-btn header__menu-toggle" data-open-dialog="MenuDrawer" aria-haspopup="dialog" aria-label="Menu">${icon("menu")}</button>
        <a href="search.html" class="icon-btn header__search-mobile" data-open-dialog="SearchModal" aria-label="Search">${icon("search")}</a>
        <nav class="nav" aria-label="Main navigation"><ul class="nav__list list-reset" role="list">${occ}${who}${plain("build.html", "Build your own")}${plain("corporate.html", "Corporate")}</ul></nav>
      </div>
      <div class="header__logo"><a href="index.html" class="logo">${LOGO}</a></div>
      <div class="header__end">
        <a href="search.html" class="icon-btn header__search-desktop" data-open-dialog="SearchModal" aria-label="Search">${icon("search")}</a>
        <a href="account.html" class="icon-btn header__account" aria-label="Account">${icon("account")}</a>
        <a href="cart.html" class="icon-btn" data-cart-toggle aria-haspopup="dialog" data-cart-icon aria-label="Bag">${icon("cart")}<span class="cart-count" data-cart-count hidden><span>0</span></span></a>
      </div>
    </div></div></div>
  </site-header>
  <dialog id="MenuDrawer" class="drawer drawer--left menu-drawer scheme-scheme-1" aria-label="Menu">
    <div class="drawer__header"><a href="index.html" class="logo">${LOGO}</a><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon("close")}</button></div>
    <menu-drawer class="menu-drawer__panels">
      <div class="menu-panel is-active" id="menu-root"><ul class="menu-panel__list list-reset" role="list" data-stagger>
        <li style="--i: 0"><button type="button" class="menu-panel__link" data-panel-open="menu-1" aria-expanded="false">Occasions${icon("chevron-right")}</button></li>
        <li style="--i: 1"><button type="button" class="menu-panel__link" data-panel-open="menu-2" aria-expanded="false">Who it\u2019s for${icon("chevron-right")}</button></li>
        <li style="--i: 2"><a href="build.html" class="menu-panel__link">Build your own</a></li>
        <li style="--i: 3"><a href="corporate.html" class="menu-panel__link">Corporate</a></li>
        <li style="--i: 4"><a href="concierge.html" class="menu-panel__link">Gifting concierge</a></li>
      </ul><div class="menu-panel__footer"><a href="account.html" class="text-btn">${icon("account")}Account</a></div></div>
      <div class="menu-panel is-right" id="menu-1"><button type="button" class="menu-panel__back" data-panel-back="menu-root">${icon("chevron-right")}Back</button><ul class="menu-panel__list list-reset" role="list"><li><a href="collection.html?c=all" class="menu-panel__link">Every hamper</a></li>${up.map((x) => `<li><a href="collection.html?c=${x.id}" class="menu-panel__link">${esc(x.name)}</a></li>`).join("")}${always.map((x) => `<li><a href="collection.html?c=${x.id}" class="menu-panel__link">${esc(x.name)}</a></li>`).join("")}</ul></div>
      <div class="menu-panel is-right" id="menu-2"><button type="button" class="menu-panel__back" data-panel-back="menu-root">${icon("chevron-right")}Back</button><ul class="menu-panel__list list-reset" role="list">${recipients.map((r) => `<li><a href="collection.html?for=${r.id}" class="menu-panel__link">${esc(r.name)}</a></li>`).join("")}</ul></div>
    </menu-drawer>
  </dialog>`;
    return sec("header", "section-header", html2);
  }
  function searchModal() {
    const chips = upcoming().slice(0, 3).map((m) => `<li><a href="collection.html?c=${m.id}" class="chip">${esc(m.name)}</a></li>`).join("") + always.slice(0, 2).map((m) => `<li><a href="collection.html?c=${m.id}" class="chip">${esc(m.name)}</a></li>`).join("");
    return `<dialog id="SearchModal" class="drawer drawer--top search-modal scheme-scheme-1" aria-label="Search"><predictive-search class="drawer__body" data-enabled="true"><div class="page-width">
    <form action="search.html" method="get" role="search" class="search-modal__form">${icon("search")}<label for="SearchModalInput" class="visually-hidden">Search</label><input id="SearchModalInput" class="search-modal__input" type="search" name="q" placeholder="Search hampers, occasions, makers" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon("close")}</button></form>
    <div class="search-modal__results" data-search-results aria-live="polite"><div class="predictive__group"><p class="caption predictive__heading">Coming up</p><ul class="predictive__chips list-reset" role="list">${chips}</ul></div></div>
  </div></predictive-search></dialog>`;
  }
  function footer() {
    const col = (title, links) => `<div class="footer__block" data-reveal><p class="footer__heading h6">${title}</p><ul class="footer__links list-reset" role="list">${links.map(([h, t]) => `<li><a href="${h}" class="link">${esc(t)}</a></li>`).join("")}</ul></div>`;
    return sec("footer", "section-footer", `<footer class="footer section scheme-scheme-3"><div class="page-width">
    <div class="footer__grid" style="--footer-cols: minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);">
      <div class="footer__block footer__block--wide" data-reveal><div class="footer__newsletter"><p class="h3">A note before each <em>occasion</em></p><div class="rte muted"><p>The order-by date, a day early. Nothing else.</p></div><form class="newsletter-form" onsubmit="event.preventDefault();this.innerHTML='<p>Thank you. We\u2019ll write before the next occasion.</p>'"><div class="field"><input id="FooterNewsletter-email" type="email" class="field__input" placeholder=" " required><label class="field__label" for="FooterNewsletter-email">Email address</label><button type="submit" class="newsletter-form__submit" aria-label="Subscribe">${icon("arrow")}</button></div></form></div></div>
      ${col("Send", [...upcoming().slice(0, 2).map((m) => [`collection.html?c=${m.id}`, m.name]), ...always.map((m) => [`collection.html?c=${m.id}`, m.name])])}
      ${col("Help", [["help.html", "Delivery and order-by dates"], ["help.html#faq", "Questions"], ["concierge.html", "Gifting concierge"], ["account.html", "Account"]])}
      ${col("Studio", [["story.html", "Our studio"], ["corporate.html", "Corporate gifting"], ["build.html", "Build your own"], ["journal.html", "Journal"]])}
    </div>
    <div class="footer__wordmark" aria-hidden="true" data-fit data-reveal><span>House of Zariva</span></div>
    <div class="footer__bottom"><div class="footer__bottom-start"><span>&copy; 2026 House of Zariva. Prices in AUD, GST included.</span></div><div class="footer__bottom-end"><span class="caption">We pack on Gadigal land.</span></div></div>
  </div></footer>`);
  }
  function slideshow(slides) {
    const s = (x, i) => `<div class="slideshow__slide slide--light${x.mobile ? " has-mobile" : ""}${i ? "" : " is-active"}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${slides.length}" data-tone="light" style="--overlay: ${x.overlay ?? 0.3};">
      <div class="slide__media slide__media--desktop media">${x.video ? `<video src="assets/video/${x.video}.mp4" poster="assets/video/${x.video}.jpg" muted loop playsinline preload="none"${i ? "" : " autoplay"}></video>` : pic(x.image, 1700, i ? "" : 'fetchpriority="high" loading="eager"')}</div>
      ${x.mobile ? `<div class="slide__media slide__media--mobile media">${pic(x.mobile, 900)}</div>` : ""}
      <div class="slide__scrim" aria-hidden="true"></div>
      <div class="slide__content slide__content--${x.position || "bottom-left"} slide__content-m--bottom page-width"><div class="slide__inner content content--left" style="--content-w: 760px;">
        <p class="caption content__caption" style="--i: 0">${esc(x.caption)}</p>
        <${i ? "h2" : "h1"} class="h0 content__heading" style="--i: 1">${x.heading}</${i ? "h2" : "h1"}>
        ${x.text ? `<div class="rte content__text" style="--i: 2"><p>${esc(x.text)}</p></div>` : ""}
        <div class="content__buttons" style="--i: 3"><a href="${x.link}" class="btn">${btnInner(x.label)}</a></div>
      </div></div>
    </div>`;
    return sec("slideshow", "section-slideshow", `<section class="section slideshow slideshow--full scheme-scheme-1 sp-t-none sp-b-none" style="--ss-h: 100svh; --ss-h-m: 100svh; --ss-ratio: 2; --ss-ratio-m: 0.8; --ss-dur: 6s;" data-overlay-header>
    <div class="slideshow__frame"><slide-show class="slideshow__stage" data-autoplay="6" data-pause-hover="true" data-transition="fade" role="region" aria-roledescription="carousel" aria-label="Occasions" tabindex="-1">
      ${slides.map(s).join("")}
      <div class="slideshow__ui slideshow__ui--bars page-width"><div class="slideshow__dots">${slides.map((x, i) => `<button type="button" class="slideshow__dot" data-slide-to="${i}" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}"><i></i></button>`).join("")}</div>
      <div class="slideshow__arrows"><button type="button" class="slideshow__arrow slideshow__arrow--prev" data-slide-prev aria-label="Previous slide">${icon("arrow")}</button><button type="button" class="slideshow__arrow" data-slide-next aria-label="Next slide">${icon("arrow")}</button></div></div>
    </slide-show></div></section>`);
  }
  function collectionIndex(rows, caption) {
    return sec("index", "section-index", `<section class="section index scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><p class="caption index__caption" data-reveal>${esc(caption)}</p><index-list class="index__list"><ul class="list-reset" role="list">
    ${rows.map((r, i) => `<li class="index__row" data-reveal style="--i: ${i}"><a href="${r.href}" class="index__link" data-index-image="${img(r.image)}" data-set-moment="${r.id}"><span class="index__num label">${String(i + 1).padStart(2, "0")}</span><span class="index__title h1">${esc(r.name)}<sup class="count">${r.count}</sup></span><span class="index__note caption">${esc(r.note)}</span><span class="index__arrow">${icon("arrow")}</span><span class="index__thumb media ratio-portrait">${pic(r.image, 900)}</span></a></li>`).join("")}
  </ul><div class="index__float media ratio-portrait" aria-hidden="true"><img alt="" decoding="async" width="600" height="750"></div></index-list></div></section>`);
  }
  function featured(id, { caption, heading, link, linkLabel = "View all", list, scheme = "scheme-1", count }) {
    return sec(id, "section-featured-collection", `<section class="section featured-collection ${"scheme-" + scheme} sp-t-default sp-b-default"><div class="page-width"><div style="--cols: 4;">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>${esc(caption)}</p><h2 class="h2" data-split>${heading}${count ? `<sup class="count">${count}</sup>` : ""}</h2></div>${link ? `<div class="section-head__actions"><a href="${link}" class="btn btn--secondary btn--sm" data-reveal>${btnInner(linkLabel)}</a></div>` : ""}</div>
    <ul class="grid product-grid list-reset" role="list" style="--cols: 4; --cols-tablet: 3; --cols-mobile: 2;">${list.map((p, i) => `<li>${card(p, i, id)}</li>`).join("")}</ul>
  </div></div></section>`);
  }
  function reels(items) {
    return sec("reels", "section-reels", `<section class="section reels-section reels--carousel scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><video-reels data-section-id="reels" data-autoplay="view"><slider-component class="slider" style="--cols: 4;">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>Unboxed</p><h2 class="h2" data-split>In their words</h2></div></div>
    <ul class="reels slider__track list-reset" role="list" style="--cols: 4;" data-slider-track>
      ${items.map((u, i) => {
      const p = product(u.product);
      return `<li class="reel" data-reel data-index="${i}" data-reveal style="--i: ${i}">
        <button type="button" class="reel__media media" data-reel-open aria-label="Play video from ${esc(u.name)}"><video playsinline muted loop preload="none" class="reel__video" poster="assets/video/${u.video}.jpg"><source src="assets/video/${u.video}.mp4" type="video/mp4"></video><span class="reel__shade" aria-hidden="true"></span><span class="reel__creator caption"><span class="reel__avatar" aria-hidden="true">${esc(u.name[0])}</span>${esc(u.name)}</span><span class="reel__play" aria-hidden="true">${icon("play")}</span></button>
        <a href="${p.url}" class="reel__product" data-product-root><span class="reel__product-img media ratio-portrait">${pic(p.images[0], 900)}</span><span class="reel__product-text"><span class="reel__product-title">${esc(p.title)}</span>${price(p, p.firstAvailable, { from: true })}</span></a>
        <template data-reel-sheet><div class="reel-sheet" data-product-root><a href="${p.url}" class="reel-sheet__img media ratio-portrait">${pic(p.images[0], 900)}</a><div class="reel-sheet__info"><a href="${p.url}" class="reel-sheet__title">${esc(p.title)}</a>${price(p, p.firstAvailable, { from: true })}</div><button type="button" class="btn btn--sm" data-quick-view="${p.path}">Choose</button></div></template>
      </li>`;
    }).join("")}
    </ul>
    <div class="slider__foot"><div class="slider__progress" aria-hidden="true"><span data-slider-progress></span></div><div class="slider__nav"><button type="button" class="slider__btn slider__btn--prev" data-slider-prev aria-label="Previous">${icon("arrow")}</button><button type="button" class="slider__btn" data-slider-next aria-label="Next">${icon("arrow")}</button></div></div>
  </slider-component></video-reels></div></section>`);
  }
  function split(id, { image, caption, heading, text, label, link, layout = "image-left", scheme = "scheme-1" }) {
    return sec(id, "section-image-with-text", `<section class="section split scheme-${scheme} sp-t-default sp-b-default"><div class="page-width"><div class="split__grid split--${layout} split--img-medium split--middle">
    <div class="split__media"><div class="media media--feature ratio-portrait" data-reveal-media data-parallax-soft>${pic(image, 1700)}</div></div>
    <div class="split__content content content--left"><p class="caption content__caption" data-reveal style="--i: 0">${esc(caption)}</p><h2 class="h2 content__heading" data-split>${heading}</h2><div class="rte content__text" data-reveal style="--i: 2">${text}</div>${label ? `<div class="content__buttons" data-reveal style="--i: 3"><a href="${link}" class="btn">${btnInner(label)}</a></div>` : ""}</div>
  </div></div></section>`);
  }
  function richText(id, { caption, heading, text, label, link, scheme = "scheme-1" }) {
    return sec(id, "section-rich-text", `<section class="section rich-text scheme-${scheme} sp-t-default sp-b-default"><div class="page-width page-width--narrow"><div class="content content--center">${caption ? `<p class="caption content__caption" data-reveal>${esc(caption)}</p>` : ""}<h2 class="h2 content__heading" data-split>${heading}</h2>${text ? `<div class="rte content__text" data-reveal>${text}</div>` : ""}${label ? `<div class="content__buttons" data-reveal><a href="${link}" class="btn btn--secondary">${btnInner(label)}</a></div>` : ""}</div></div></section>`);
  }
  function collectionHero({ caption, title, text }) {
    return sec("collection-header", "section-collection-header", `<section class="section collection-hero collection-hero--text collection-hero--left scheme-scheme-1 sp-t-small sp-b-small"><div class="page-width"><div class="collection-hero__grid"><div class="collection-hero__inner">${caption ? `<p class="caption" data-reveal>${esc(caption)}</p>` : ""}<h1 class="h1" data-split>${esc(title)}</h1>${text ? `<div class="rte muted collection-hero__text" data-reveal><p>${esc(text)}</p></div>` : ""}</div></div></div></section>`);
  }
  var SORTS = [["manual", "Featured"], ["price-ascending", "Price, low to high"], ["price-descending", "Price, high to low"], ["created-descending", "Newest"]];
  function filterList(base, state) {
    let list = base.slice();
    if (state.who.length) list = list.filter((p) => state.who.some((w) => p.for.includes(w)));
    if (state.diet.length) list = list.filter((p) => state.diet.every((d) => d === "Alcohol-free" ? !p.alcohol || p.dietary.includes("Alcohol-free") : p.dietary.includes(d)));
    if (state.min) list = list.filter((p) => p.priceMin >= state.min * 100);
    if (state.max) list = list.filter((p) => p.priceMin <= state.max * 100);
    if (state.sort === "price-ascending") list.sort((a, b) => a.priceMin - b.priceMin);
    if (state.sort === "price-descending") list.sort((a, b) => b.priceMin - a.priceMin);
    if (state.sort === "created-descending") list.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
    return list;
  }
  function mainCollection(base, state, baseUrl) {
    const list = filterList(base, state);
    const opt = (name, value, label, checked, n) => `<li><label class="checkbox facet__option${n ? "" : " is-disabled"}"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? "checked" : ""} ${n ? "" : "disabled"}><span>${esc(label)} <span class="facet__n">(${n})</span></span></label></li>`;
    const facet = (id, title, body) => `<details class="facet" id="Facet-${id}" open><summary class="facet__summary"><span>${title}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="facet__body">${body}</div></details>`;
    const sorts = SORTS.map(([v, l]) => `<option value="${v}"${state.sort === v ? " selected" : ""}>${l}</option>`).join("");
    const chips = [...state.who.map((w) => [`filter.p.m.custom.recipients`, w, recipients.find((r) => r.id === w).name]), ...state.diet.map((d) => ["filter.p.m.custom.dietary", d, d])];
    return sec("main-collection", "section-main-collection", `<section class="section collection-results scheme-scheme-1 sp-t-none sp-b-default facets-layout--drawer" data-section-id="main-collection">
    <facet-results class="page-width" data-section-id="main-collection" data-pagination="load_more">
      <div class="collection-toolbar"><div class="collection-toolbar__start"><button type="button" class="collection-toolbar__filter text-btn" data-open-dialog="Facets-main" aria-haspopup="dialog">${icon("filter")}<span>Filter</span></button><p class="collection-toolbar__count text-sm muted" data-result-count>${list.length} ${list.length === 1 ? "hamper" : "hampers"}</p></div>
        <div class="collection-toolbar__end"><div class="select collection-toolbar__sort"><label class="visually-hidden" for="ToolbarSort">Sort by</label><select id="ToolbarSort" class="select__select" data-toolbar-sort>${sorts}</select>${icon("chevron")}</div></div></div>
      <div class="collection-active" data-facets-active>${chips.length ? `<div class="active-filters">${chips.map(([n, v, l]) => `<a href="${baseUrl}" class="chip active-filter" data-facet-remove="${n}" data-value="${esc(v)}">${esc(l)}${icon("close", "icon--sm")}</a>`).join("")}<a href="${baseUrl}" class="text-btn" data-facet-clear>Clear all</a></div>` : ""}</div>
      <div class="collection-body">
        <dialog id="Facets-main" class="drawer drawer--left facets-drawer scheme-scheme-1" aria-labelledby="FacetsTitle"><div class="drawer__header"><h2 class="drawer__title h4" id="FacetsTitle">Filter and sort</h2><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon("close")}</button></div>
          <form class="facets drawer__body" data-facet-form id="FacetForm-main">${(() => {
      const k = new URLSearchParams(baseUrl.split("?")[1]);
      const [n, v] = [...k][0] || [];
      return n && v !== "all" ? `<input type="hidden" name="${n}" value="${esc(v)}">` : "";
    })()}<div class="facets__sort"><label class="facets__label h6" for="SortBy">Sort by</label><div class="select"><select id="SortBy" class="select__select" name="sort_by" data-sort>${sorts}</select>${icon("chevron")}</div></div>
            <div data-facet-filters>
              ${facet("who", "Who it\u2019s for", `<ul class="facet__list list-reset" role="list">${recipients.map((r) => opt("filter.p.m.custom.recipients", r.id, r.name, state.who.includes(r.id), base.filter((p) => p.for.includes(r.id)).length)).join("")}</ul>`)}
              ${facet("price", "Price", `<div class="facet__price"><div class="field"><input class="field__input" id="PriceMin" type="number" inputmode="decimal" name="filter.v.price.gte" value="${state.min || ""}" placeholder=" " min="0"><label class="field__label" for="PriceMin">From ($)</label></div><span aria-hidden="true">\u2013</span><div class="field"><input class="field__input" id="PriceMax" type="number" inputmode="decimal" name="filter.v.price.lte" value="${state.max || ""}" placeholder=" " min="0"><label class="field__label" for="PriceMax">To ($)</label></div></div>`)}
              ${facet("diet", "Dietary", `<ul class="facet__list list-reset" role="list">${["Alcohol-free", "Vegetarian", "Contains nuts"].map((d) => opt("filter.p.m.custom.dietary", d, d, state.diet.includes(d), base.filter((p) => d === "Alcohol-free" ? !p.alcohol : p.dietary.includes(d)).length)).join("")}</ul>`)}
            </div></form>
          <div class="drawer__footer facets__footer"><a href="${baseUrl}" class="btn btn--secondary" data-facet-clear>Clear all</a><button type="button" class="btn" data-close-dialog><span class="btn__label"><span data-text="View ${list.length} results" data-results-label>View ${list.length} results</span></span></button></div>
        </dialog>
        <div class="collection-grid-wrap" data-results>${list.length ? `<ul id="ProductGrid-main" class="grid product-grid list-reset" role="list" style="--cols: 4; --cols-tablet: 3; --cols-mobile: 2;" data-product-grid>${list.map((p, i) => `<li>${card(p, i, "main-collection")}</li>`).join("")}</ul>` : '<div class="empty-state"><p class="h3">Nothing matches all of that.</p><p class="muted">Try fewer filters, or ask the concierge.</p></div>'}</div>
      </div>
    </facet-results></section>`);
  }
  var STARTERS = [["Diwali", "Happy Diwali. Light the first diya for me."], ["Karva Chauth", "For the fast, and the moonrise after. With all my love."], ["Birthday", "Happy birthday. Wish I could be there to celebrate with you."], ["New baby", "Welcome to the world, little one."], ["Thank you", "Thank you, truly. This is a small way of saying it."]];
  var WRAPS = [["Ivory", "#F3EFEA", 0], ["Blush", "#E9D6DC", 0], ["Kraft", "#C8A77C", 0], ["Plum silk", "#3E1129", 800]];
  function variantPicker(p, v, sid) {
    if (p.hasOnlyDefault) return "";
    return `<variant-picker class="variant-picker variant-picker--buttons" data-section-id="${sid}" data-product-url="${p.path}" data-variant-picker>${p.options.map((o) => {
      const sel = v.options[o.position - 1];
      return `<fieldset class="variant-picker__option${o.swatch ? " variant-picker__option--swatch" : ""}"><legend class="variant-picker__legend"><span>${esc(o.name)}</span><span class="variant-picker__value" data-option-label>${esc(sel)}</span></legend><div class="variant-picker__values">${o.values.map((val, k) => {
        const id = `${sid}-${o.position}-${k + 1}`;
        const avail = p.variants.some((x) => x.options[o.position - 1] === val.name && x.available);
        return `<input type="radio" class="visually-hidden" id="${id}" name="${sid}-${o.name.toLowerCase().replace(/\W+/g, "-")}" value="${val.id}" ${sel === val.name ? "checked" : ""} data-option-value="${esc(val.name)}">${o.swatch ? `<label for="${id}" class="swatch-btn variant-picker__swatch${avail ? "" : " is-unavailable"}" title="${esc(val.name)}"><span class="swatch" style="--size: 30px; --swatch: ${val.hex}"></span><span class="visually-hidden">${esc(val.name)}</span></label>` : `<label for="${id}" class="variant-picker__pill${avail ? "" : " is-unavailable"}">${esc(val.name)}${val.add ? ` <span class="muted">+${money(val.add * 100)}</span>` : ""}</label>`}`;
      }).join("")}</div></fieldset>`;
    }).join("")}<script type="application/json" data-selected-variant>${JSON.stringify({ id: v.id, title: v.title, options: v.options, price: v.price, compare_at_price: v.compare_at_price, available: v.available, featured_media: null })}<\/script></variant-picker>`;
  }
  function buyButtons(p, v, sid, { dynamic = true } = {}) {
    const fid = `ProductForm-${sid}`;
    return `<product-form class="buy-buttons" data-buy-buttons><form method="post" action="/cart/add" id="${fid}" class="buy-buttons__form" novalidate>
    <input type="hidden" name="id" value="${v.id}" data-variant-id ${v.available ? "" : "disabled"}>
    <div class="buy-buttons__row"><div class="qty" data-qty><button type="button" data-step="-1" aria-label="Decrease quantity">${icon("minus")}</button><input type="number" name="quantity" inputmode="numeric" value="1" min="1" step="1" aria-label="Quantity"><button type="button" data-step="1" aria-label="Increase quantity">${icon("plus")}</button></div>
      <button type="submit" name="add" class="btn buy-buttons__add" ${v.available ? "" : "disabled"} data-add-button><span class="btn__label"><span data-text="${v.available ? "Add to bag" : "Sold out"}" data-add-label>${v.available ? "Add to bag" : "Sold out"}</span></span></button></div>
    ${dynamic ? `<div class="buy-buttons__dynamic${v.available ? "" : " is-hidden"}"><div class="shopify-payment-button"><a href="checkout.html" class="shopify-payment-button__button shopify-payment-button__button--unbranded z-shoppay">Buy with <b>Shop Pay</b></a></div></div>` : ""}
    <div class="form-message form-message--error" data-form-error role="alert" hidden>${icon("error", "icon--sm")}<span data-message></span></div>
  </form></product-form>`;
  }
  function giftMode(sid) {
    const fid = `ProductForm-${sid}`;
    return `<gift-mode class="gift" data-form="${fid}" data-starter-text="${esc(STARTERS.map((s) => s[1]).join("\n"))}" data-lead-days="2" data-skip-sundays="true" data-locale="en-AU">
    <label class="gift__switch"><input type="checkbox" data-gift-toggle><span class="gift__switch-track" aria-hidden="true"><span></span></span><span class="gift__switch-text"><span class="gift__switch-title">${icon("gift", "icon--sm")}Make it a gift</span><span class="caption">Wrapped by hand, with a note written in ink</span></span></label>
    <div class="gift__panel" data-gift-panel hidden>
      <fieldset class="gift__group"><legend class="gift__legend">Wrapping</legend><div class="gift__wraps">${WRAPS.map(([name, hex, price2], i) => `<label class="gift__wrap"><input type="radio" name="gift-wrap-${sid}" value="${product("gift-wrap").variants[i].id}" ${i ? "" : "checked"} data-wrap-title="${name}" data-wrap-price="${price2}" data-wrap-color="${hex}"><span class="gift__wrap-swatch media" style="--paper: ${hex};"></span><span class="gift__wrap-name">${name}</span><span class="caption">${price2 ? "+" + money(price2) : "Free"}</span></label>`).join("")}</div></fieldset>
      <fieldset class="gift__group"><legend class="gift__legend">Note card</legend><div class="gift__note-grid"><div class="gift__fields">
        <div class="gift__row"><div class="field"><input class="field__input" id="GiftTo-${sid}" type="text" name="properties[To]" form="${fid}" maxlength="40" placeholder=" " data-gift-to disabled><label class="field__label" for="GiftTo-${sid}">To</label></div><div class="field"><input class="field__input" id="GiftFrom-${sid}" type="text" name="properties[From]" form="${fid}" maxlength="40" placeholder=" " data-gift-from disabled><label class="field__label" for="GiftFrom-${sid}">From</label></div></div>
        <div class="gift__chips" role="group" aria-label="Occasion">${STARTERS.map((s, i) => `<button type="button" class="chip" data-occasion="${i}">${s[0]}</button>`).join("")}</div>
        <div class="field"><textarea class="field__input" id="GiftMsg-${sid}" name="properties[Message]" form="${fid}" maxlength="200" placeholder=" " data-gift-message disabled></textarea><label class="field__label" for="GiftMsg-${sid}">Message</label><span class="gift__count caption" data-gift-count>0 / 200</span></div>
      </div><figure class="gift__card" aria-hidden="true"><span class="gift__card-to">Dear <span data-card-to>\u2026</span>,</span><span class="gift__card-msg" data-card-msg>Your message appears here, written on the card.</span><span class="gift__card-from">\u2014 <span data-card-from>\u2026</span></span></figure></div></fieldset>
      <fieldset class="gift__group"><legend class="gift__legend">Delivery</legend><label class="checkbox"><input type="checkbox" data-gift-hide checked><span>Hide prices on the packing slip</span></label><label class="checkbox"><input type="checkbox" data-gift-date-toggle><span>Arrive on a specific day</span></label><div class="gift__dates" data-gift-dates hidden role="radiogroup" aria-label="Arrive on a specific day"></div></fieldset>
      <p class="gift__summary caption" data-gift-summary aria-live="polite"></p>
    </div>
  </gift-mode>`;
  }
  var delivery2 = (compact = false) => `<delivery-estimate class="delivery${compact ? " delivery--compact" : ""}" data-cutoff="13" data-offset="+11:00" data-min="2" data-max="4" data-weekends="false" data-holidays="2026-12-25, 2026-12-26, 2027-01-01, 2027-01-26" data-locale="en-AU" data-text-countdown="Order within [time] to get it [date]" data-text-arrives="Arrives [date]" data-text-range="[from] \u2013 [to]" hidden>${icon("truck")}<span class="delivery__text" data-delivery-text></span></delivery-estimate>`;
  function mainProduct(p, v = p.firstAvailable, sid = "product-main") {
    const imgs = [...new Set(p.images)];
    const m = sendingFor(p);
    const acc = (title, body, open = false) => `<details class="accordion" data-reveal style="--i: 8"${open ? " open" : ""}><summary class="accordion__summary"><span>${title}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="accordion__content rte">${body}</div></details>`;
    const inside = `<ul class="z-inside">${p.inside.map(([a, b]) => `<li><span>${esc(a)}</span><span class="muted">${esc(b)}</span></li>`).join("")}</ul>${p.dietary.length ? `<p class="caption">${p.dietary.map(esc).join(" \xB7 ")}</p>` : ""}`;
    return `<section class="section product-section scheme-scheme-1 sp-t-small sp-b-default" data-product-root data-section-id="${sid}" data-product-id="${p.id}" data-product-url="${p.path}">
    <div class="page-width"><div class="product product--thumbs product--media-large">
      <div class="product__media"><media-gallery class="gallery gallery--thumbs" data-layout="thumbs" data-hide-variants="false">
        <div class="gallery__track" data-gallery-track>${imgs.map((k, i) => `<div class="gallery__item${i ? "" : " is-active"}" data-media-id="${p.id + i}" data-media-type="image"><div class="media ratio-portrait" style="--adapt-ratio: 0.8">${pic(k, 1700, i ? "" : 'loading="eager" fetchpriority="high"')}</div>${i === 0 && p.loupe ? `<loupe-chip data-handle="${p.handle}" data-product="${esc(JSON.stringify(loupeData(p)))}"></loupe-chip>` : ""}</div>`).join("")}
          <span class="gallery__counter" aria-hidden="true"><span data-gallery-current>1</span> / ${imgs.length}</span>
          <div class="gallery__dots" aria-hidden="true">${imgs.map((_, i) => `<span class="gallery__dot${i ? "" : " is-active"}"></span>`).join("")}</div>
          <div class="slider__nav gallery__arrows"><button type="button" class="slider__btn slider__btn--prev" data-gallery-prev aria-label="Previous">${icon("arrow")}</button><button type="button" class="slider__btn" data-gallery-next aria-label="Next">${icon("arrow")}</button></div>
        </div>
        ${imgs.length > 1 ? `<div class="gallery__thumbs" role="list">${imgs.map((k, i) => `<button type="button" class="gallery__thumb${i ? "" : " is-active"}" data-thumb="${p.id + i}" role="listitem" aria-label="Show image ${i + 1}">${pic(k, 900)}</button>`).join("")}</div>` : ""}
      </media-gallery></div>
      <div class="product__info-wrap"><div class="product__info is-sticky">
        ${m ? `<p class="caption" data-reveal style="--i: 0">${esc(m.name)} \xB7 Arrives before ${fmtLong(momentState(m).start)}</p>` : ""}
        <h1 class="product__title h2" data-reveal style="--i: 0">${esc(p.title)}</h1>
        <div class="product__price" data-reveal style="--i: 1"><div class="product__price-row" data-price-wrap>${price(p, v, { cls: "price--lg" })}${badges(p, v)}</div><p class="product__tax text-sm muted">GST included. Or 4 payments of ${money(Math.round(v.price / 4))} with Afterpay.</p></div>
        ${p.reviews ? `<a href="#reviews" class="rating product__rating" data-reveal style="--i: 2" aria-label="Rated ${p.rating} out of 5"><span class="rating__stars" style="--rating: ${p.rating}; --rating-max: 5;"></span><span>${p.rating} \xB7 ${p.reviews} reviews</span></a>` : ""}
        <div data-reveal style="--i: 3">${variantPicker(p, v, sid)}</div>
        <div class="product__buy" data-reveal style="--i: 4">${buyButtons(p, v, sid)}</div>
        <div data-reveal style="--i: 5">${giftMode(sid)}</div>
        <div data-reveal style="--i: 6">${delivery2()}</div>
        ${acc("What\u2019s inside", `<p>${esc(p.description)}</p>${inside}`)}
        ${acc("Delivery and order-by dates", `<p>Order by 1pm AEST on a weekday for dispatch the same day. 2 business days to capital cities, 3 to 5 regional. Same-day in Sydney and Melbourne metro for orders by 11am. Free over $150.</p>${upcoming().slice(0, 2).map((x) => `<p>${esc(x.name)}: order by ${fmtLong(momentState(x).orderBy)}.</p>`).join("")}`)}
        ${acc("Care and returns", `<p>Sweets keep for two weeks somewhere cool. If anything arrives damaged, send us a photo within two days and we\u2019ll replace it.${p.alcohol ? " Contains alcohol: the person receiving it must be 18 or over." : ""}</p>`)}
      </div></div>
    </div></div>
    <buy-bar class="buy-bar buy-bar--smart buy-bar--bottom scheme-scheme-1" data-mode="smart" data-section-id="${sid}" inert>
      <div class="buy-bar__progress" aria-hidden="true"><span data-bar-progress></span></div>
      <div class="buy-bar__inner page-width"><div class="buy-bar__product"><span class="buy-bar__thumb media ratio-square">${pic(p.images[0], 900)}</span><span class="buy-bar__text"><span class="buy-bar__title">${esc(p.title)}</span><span class="buy-bar__meta"><span data-bar-price>${price(p, v)}</span>${p.hasOnlyDefault ? "" : `<span class="buy-bar__variant caption" data-bar-variant>${esc(v.title)}</span>`}</span></span></div>
        <nav class="buy-bar__nav" aria-label="Sections" data-bar-nav hidden><span class="buy-bar__pill" aria-hidden="true"></span></nav>
        <div class="buy-bar__actions">${p.hasOnlyDefault ? "" : `<div class="select buy-bar__select"><label class="visually-hidden" for="BarVariant-${sid}">Choose an option</label><select id="BarVariant-${sid}" class="select__select" data-bar-select>${p.variants.map((x) => `<option value="${x.id}" data-options="${esc(x.options.join("|"))}"${x.id === v.id ? " selected" : ""}${x.available ? "" : " disabled"}>${esc(x.title)}</option>`).join("")}</select>${icon("chevron")}</div>`}<button type="button" class="btn buy-bar__add" data-bar-add><span class="btn__label" data-bar-label>Add to bag</span></button></div>
        <div class="buy-bar__delivery">${delivery2(true)}</div>
      </div>
    </buy-bar>
  </section>`;
  }
  function quickView(p, v = p.firstAvailable) {
    return `<div data-quick-view-content><div class="drawer__header"><p class="drawer__title h5">Quick view</p><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon("close")}</button></div>
    <div class="drawer__body quick-view__body" data-product-root data-section-id="quick-view" data-stagger>
      <media-gallery class="gallery gallery--carousel quick-view__gallery" data-layout="carousel" data-hide-variants="false"><div class="gallery__track" data-gallery-track>${[...new Set(p.images)].map((k, i) => `<div class="gallery__item${i ? "" : " is-active"}" data-media-id="${p.id + i}" data-media-type="image"><div class="media ratio-portrait">${pic(k, 900)}</div></div>`).join("")}</div></media-gallery>
      <div class="quick-view__info stack" style="--stack: 18px"><div><h2 class="h3">${esc(p.title)}</h2></div><div data-price-wrap class="product__price-row">${price(p, v, { cls: "price--lg" })}${badges(p, v)}</div>
        ${variantPicker(p, v, "quick-view")}${buyButtons(p, v, "quick-view", { dynamic: false })}<a href="${p.url}" class="text-btn">View details${icon("arrow")}</a></div>
    </div></div>`;
  }
  var ladder = (cart2) => `<reward-ladder class="ladder" data-total="${cart2.total_price}" data-tiers="${esc(JSON.stringify([{ n: 1, amount: 15e3, label: "Free delivery", type: "shipping", gift: null }]))}" data-gift-lines="[]" data-text-next="Add [amount] for [reward]" data-text-done="Free delivery is on" data-text-unlocked="Unlocked: [reward]">
  <p class="ladder__text" data-ladder-text aria-live="polite">&nbsp;</p>
  <div class="ladder__track" role="progressbar" aria-valuemin="0" aria-valuemax="15000" aria-valuenow="${cart2.total_price}"><span class="ladder__fill" data-ladder-fill></span><span class="ladder__node ladder__node--end" style="--at: 100%;" data-node="1"><span class="ladder__dot"><span class="ladder__icon">${icon("truck")}</span><span class="ladder__check">${icon("check")}</span></span><span class="ladder__label">Free delivery</span></span></div>
</reward-ladder>`;
  function cartLine(item, line) {
    const props = Object.entries(item.properties || {}).filter(([k, v]) => v && k[0] !== "_");
    return `<li class="cart-line" data-line-row="${line}">
    <a href="${item.url}" class="cart-line__media media" tabindex="-1" aria-hidden="true"><img src="${item.image}" alt="" loading="lazy"></a>
    <div class="cart-line__info"><div class="cart-line__head"><div><a href="${item.url}" class="cart-line__title">${esc(item.product_title)}</a></div><div class="cart-line__price">${item.original_line_price > item.final_line_price ? `<s class="price__compare">${money(item.original_line_price)}</s>` : ""}<span>${money(item.final_line_price)}</span></div></div>
      <dl class="cart-line__meta">${item.product_has_only_default_variant ? "" : item.options_with_values.map((o) => `<div><dt>${esc(o.name)}:</dt> <dd>${esc(o.value)}</dd></div>`).join("")}${props.map(([k, v]) => `<div><dt>${esc(k)}:</dt> <dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="cart-line__actions"><div class="qty qty--sm"><button type="button" data-qty-step="-1" aria-label="Decrease quantity of ${esc(item.product_title)}">${icon("minus")}</button><input type="number" inputmode="numeric" value="${item.quantity}" min="0" step="1" data-line="${line}" aria-label="Quantity of ${esc(item.product_title)}"><button type="button" data-qty-step="1" aria-label="Increase quantity of ${esc(item.product_title)}">${icon("plus")}</button></div><button type="button" class="cart-line__remove link" data-remove-line="${line}">Remove</button></div>
    </div></li>`;
  }
  var summary = (cart2, id) => `<form action="checkout.html" method="get" class="cart-summary" data-cart-form novalidate>
  <details class="cart-summary__note"><summary>Add a note for the studio ${icon("chevron")}</summary><div class="field"><textarea id="CartNote-${id}" class="field__input" name="note" placeholder=" " data-cart-note>${esc(cart2.note || "")}</textarea><label class="field__label" for="CartNote-${id}">Order note</label></div></details>
  ${cart2.attributes && cart2.attributes["Delivery date"] ? `<p class="text-sm z-cart-attr">${icon("truck", "icon--sm")}Arriving ${esc(cart2.attributes["Delivery date"])}</p>` : ""}
  <div class="cart-summary__total"><span>Subtotal</span><span class="cart-summary__amount">${money(cart2.total_price)}</span></div>
  <p class="cart-summary__note-text text-sm muted">GST included. Delivery and discount codes at checkout. Or 4 payments of ${money(Math.round(cart2.total_price / 4))} with Afterpay.</p>
  <a href="checkout.html" class="btn btn--full cart-summary__checkout">${icon("lock")}<span class="btn__label"><span data-text="Check out">Check out</span></span></a></form>`;
  function cartDrawerContent(cart2) {
    const first = cart2.items[0];
    return `<div class="cart-drawer__content" data-cart-content data-item-count="${cart2.item_count}">
    <div class="drawer__header"><h2 class="drawer__title h4" id="CartDrawerTitle">Your bag <span class="cart-drawer__count">(${cart2.item_count})</span></h2><button type="button" class="icon-btn close-btn" data-close-dialog aria-label="Close">${icon("close")}</button></div>
    ${cart2.item_count ? `<div class="cart-drawer__progress">${ladder(cart2)}</div>
    <div class="drawer__body"><cart-items><ul class="cart-lines list-reset" role="list" data-stagger>${cart2.items.map((it, i) => cartLine(it, i + 1)).join("")}</ul></cart-items><cart-upsells class="cart-upsells" data-product-id="${first.product_id}" data-exclude="${cart2.items.map((i) => i.product_id).join(",")}" hidden></cart-upsells></div>
    <div class="drawer__footer">${summary(cart2, "drawer")}</div>` : `<div class="drawer__body cart-drawer__empty"><div class="empty-state"><p class="h3">Your bag is empty.</p><p class="muted">Start with the occasion, or who it\u2019s for.</p><a href="collection.html?c=all" class="btn">${btnInner("See every hamper")}</a></div></div>`}
  </div>`;
  }
  var cartDrawer = (cart2) => sec("cart-drawer", "", `<cart-drawer data-cart-section="cart-drawer"><dialog id="CartDrawer" class="drawer cart-drawer scheme-scheme-1" aria-labelledby="CartDrawerTitle">${cartDrawerContent(cart2)}</dialog></cart-drawer>`);
  function mainCart(cart2) {
    return `<section class="section cart-page scheme-scheme-1 sp-t-small sp-b-default" data-cart-section="main-cart"><div class="page-width" data-cart-content data-item-count="${cart2.item_count}">
    <div class="cart-page__head"><h1 class="h1" data-split>Your bag</h1>${cart2.item_count ? `<a href="collection.html?c=all" class="text-btn">Continue shopping${icon("arrow")}</a>` : ""}</div>
    ${cart2.item_count ? `<div class="cart-page__grid"><cart-items><ul class="cart-lines list-reset" role="list">${cart2.items.map((it, i) => cartLine(it, i + 1)).join("")}</ul></cart-items><aside class="cart-page__summary" aria-label="Order summary">${ladder(cart2)}${summary(cart2, "page")}</aside></div>` : `<div class="empty-state"><p class="h3">Your bag is empty.</p><p class="muted">Start with the occasion, or who it\u2019s for.</p><a href="collection.html?c=all" class="btn">${btnInner("See every hamper")}</a></div>`}
  </div></section>`;
  }
  function cartUpsells(list) {
    return `<div data-upsells>${list.length ? `<p class="cart-upsells__heading h6">Add a little more</p><ul class="cart-upsells__list list-reset" role="list">${list.map((p) => `<li class="upsell" data-upsell-item="${p.id}" data-price="${p.priceMin}" data-product-root><a href="${p.url}" class="upsell__media media ratio-portrait">${pic(p.images[0], 900)}</a><div class="upsell__info"><span class="upsell__tag caption" data-upsell-tag hidden></span><a href="${p.url}" class="upsell__title">${esc(p.title)}</a>${price(p, p.firstAvailable, { from: true })}${p.hasOnlyDefault ? `<product-form data-quick><form method="post" action="/cart/add"><input type="hidden" name="id" value="${p.firstAvailable.id}"><button type="submit" class="upsell__add link link--underlined">Add</button></form></product-form>` : `<button type="button" class="upsell__add link link--underlined" data-quick-view="${p.path}">Choose</button>`}</div></li>`).join("")}</ul>` : ""}</div>`;
  }
  function predictive(q2) {
    const s = q2.toLowerCase();
    const products2 = hampers().filter((p) => (p.title + " " + p.blurb + " " + p.inside.map((x) => x.join(" ")).join(" ")).toLowerCase().includes(s));
    const occ = [...moments, ...always].filter((m) => m.name.toLowerCase().includes(s));
    if (!products2.length && !occ.length) return `<div data-predictive><p class="predictive__empty muted">No results for \u201C${esc(q2)}\u201D.</p></div>`;
    return `<div data-predictive><div class="predictive">
    <div class="predictive__side">${occ.length ? `<div class="predictive__group"><p class="caption predictive__heading">Occasions</p><ul class="list-reset predictive__links" role="list">${occ.slice(0, 5).map((m) => `<li><a href="collection.html?c=${m.id}" class="link">${esc(m.name)}</a></li>`).join("")}</ul></div>` : ""}</div>
    ${products2.length ? `<div class="predictive__group predictive__products"><p class="caption predictive__heading">Hampers</p><ul class="list-reset predictive__grid" role="list">${products2.slice(0, 4).map((p, i) => `<li data-reveal style="--i: ${i}"><a href="${p.url}" class="predictive__product"><span class="media ratio-portrait hover-zoom">${pic(p.images[0], 900)}</span><span class="predictive__title">${esc(p.title)}</span>${price(p, p.firstAvailable, { from: true })}</a></li>`).join("")}</ul></div>` : ""}
  </div><a href="search.html?q=${encodeURIComponent(q2)}" class="predictive__all text-btn">See all results for \u201C${esc(q2)}\u201D${icon("arrow")}</a></div>`;
  }
  function buildABox({ caption, heading, text, items, box, sizes, name = "Zariva box", note }) {
    const strings = { progress: "[count] of [size] filled.", more: "Add [left] more to save [discount]%.", full: "Your box is full. You save [discount]%.", add: "Add box to bag \xB7 [price]", fill: "Fill your box", blocked: "Your box is full. Remove an item or choose a bigger box", remove: "Remove [title]" };
    return sec("box", "section-build-a-box", `<section class="section box-section scheme-scheme-1 sp-t-small sp-b-default"><div class="page-width">
    <div class="section-head"><div class="section-head__text"><p class="caption" data-reveal>${esc(caption)}</p><h1 class="h1" data-split>${heading}</h1><div class="rte" data-reveal><p>${esc(text)}</p></div></div></div>
    <box-builder class="box" data-section-id="box" data-box-variant="${box.firstAvailable.id}" data-name="${esc(name)}" ${Object.entries(strings).map(([k, v]) => `data-text-${k}="${esc(v)}"`).join(" ")}>
      <div class="box__products"><ul class="box__grid list-reset" role="list">${items.map((p, i) => `<li class="box-item" data-box-product="${p.id}" data-reveal style="--i: ${i % 8}">
        <div class="box-item__media media ratio-square">${pic(p.images[0], 900, 'class="box-item__img"')}<span class="box-item__count" data-count hidden>\xD7<span>0</span></span></div>
        <div class="box-item__info"><span class="box-item__title">${esc(p.title)}</span>${price(p)}</div>
        <button type="button" class="btn btn--secondary btn--sm box-item__add" data-box-add data-variant="${p.firstAvailable.id}" data-price="${p.firstAvailable.price}" data-title="${esc(p.title)}" data-image="${img(p.images[0])}">${icon("plus", "icon--sm")}Add to box</button>
      </li>`).join("")}</ul></div>
      <aside class="box__panel" data-box-panel aria-label="${esc(name)}">
        <div class="box__sizes" role="radiogroup" aria-label="Box size"><span class="box__size-pill" aria-hidden="true"></span>${sizes.map(([n, d], i) => `<button type="button" class="box__size${i ? "" : " is-active"}" role="radio" aria-checked="${!i}" data-size="${n}" data-discount="${d}"><span>${n}</span>${d ? `<span class="caption">\u2212${d}%</span>` : ""}</button>`).join("")}</div>
        <div class="box__crate" data-box-crate><div class="box__lid" aria-hidden="true"><span class="box__ribbon"></span><span class="box__tag">${esc(name)}</span></div><ol class="box__slots list-reset" data-slots></ol></div>
        <div class="box__meter"><span data-meter></span></div>
        <p class="box__progress" data-progress aria-live="polite"></p>
        <dl class="box__totals"><div><dt>Items</dt><dd data-items-total>$0</dd></div><div class="box__saving"><dt>Box saving</dt><dd data-saving>$0</dd></div><div class="box__total"><dt>Box total</dt><dd data-box-total>$0</dd></div></dl>
        <button type="button" class="btn btn--full box__add" data-box-submit disabled><span class="btn__label" data-box-submit-label>Fill your box</span></button>
        <button type="button" class="box__reopen link link--underlined text-sm" data-box-reopen hidden>Open the box to change items</button>
        <p class="caption box__note">${esc(note)}</p>
      </aside>
      <button type="button" class="box__tray" data-box-tray aria-expanded="false"><span class="box__tray-slots" data-tray-slots></span><span class="box__tray-text" data-tray-text></span></button>
    </box-builder></div></section>`);
  }
  function contactForm(id, { heading, text, fields = [] }) {
    return sec(id, "section-contact-form", `<section class="section contact scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width page-width--narrow">
    <div class="section-head section-head--center"><div class="section-head__text"><h2 class="h2" data-split>${heading}</h2>${text ? `<div class="rte" data-reveal><p>${esc(text)}</p></div>` : ""}</div></div>
    <form class="contact__form" onsubmit="event.preventDefault();this.innerHTML='<p class=&quot;form-message form-message--success&quot;>Thank you. We\u2019ll reply within one business day.</p>'"><div class="contact__grid">
      <div class="field"><input class="field__input" type="text" id="${id}-name" placeholder=" " autocomplete="name"><label class="field__label" for="${id}-name">Name</label></div>
      <div class="field"><input class="field__input" type="email" id="${id}-email" placeholder=" " required autocomplete="email"><label class="field__label" for="${id}-email">Email</label></div>
      ${fields.map((f, i) => `<div class="field contact__wide"><input class="field__input" type="text" id="${id}-f${i}" placeholder=" "><label class="field__label" for="${id}-f${i}">${esc(f)}</label></div>`).join("")}
      <div class="field contact__wide"><textarea class="field__input" id="${id}-msg" placeholder=" "></textarea><label class="field__label" for="${id}-msg">Message</label></div>
    </div><button type="submit" class="btn">${btnInner("Send")}</button></form>
  </div></section>`);
  }
  function faq(id, { caption, heading, text, items }) {
    return sec(id, "section-faq", `<section class="section faq scheme-scheme-1 sp-t-default sp-b-default"><div class="page-width"><div class="faq__grid">
    <div class="faq__intro"><p class="caption" data-reveal>${esc(caption)}</p><h2 class="h2" data-split>${heading}</h2>${text ? `<div class="rte muted" data-reveal><p>${esc(text)}</p></div>` : ""}</div>
    <div class="faq__list">${items.map(([q2, a], i) => `<details class="accordion" data-reveal style="--i: ${i % 8}"><summary class="accordion__summary"><span>${esc(q2)}</span><span class="accordion__icon" aria-hidden="true"></span></summary><div class="accordion__content rte"><p>${a}</p></div></details>`).join("")}</div>
  </div></div></section>`);
  }

  // site/assets/zariva/shopify-mock.js
  window.Theme = {
    routes: { root: "./", cart: "cart.html", cartAdd: "cart/add", cartChange: "cart/change", cartUpdate: "cart/update", search: "search.html", predictiveSearch: "search/suggest", recommendations: "recommendations/products" },
    moneyFormat: "${{amount}}",
    moneyWithCurrencyFormat: "${{amount}} AUD",
    showCurrencyCode: false,
    cartType: "drawer",
    cartOpenOnAdd: true,
    rankUpsells: true,
    strings: {
      addToCart: "Add to bag",
      sizeSelected: "Selected",
      added: "Added",
      soldOut: "Sold out",
      unavailable: "Unavailable",
      cartError: "Something went wrong. Please try again.",
      addedToCart: "Added to your bag.",
      viewCart: "View bag",
      rewardCloser: "[amount] closer to [reward]",
      rewardUnlocks: "Unlocks [reward]",
      giftFor: "For [name]",
      giftWrapped: "Gift wrapped",
      giftHidden: "Hide prices on the packing slip",
      personaliseEmpty: "Add your text, or switch personalisation off.",
      personaliseChars: "Some characters were removed.",
      codeCopied: "Copied [code]",
      termsRequired: "Please accept the terms to check out.",
      copied: "Link copied"
    }
  };
  var KEY = "zariva:shopify-cart";
  var load = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { lines: [], note: "", attributes: {} };
    } catch (e) {
      return { lines: [], note: "", attributes: {} };
    }
  };
  var save = (s) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (e) {
    }
  };
  function cartJSON(s = load()) {
    const items = s.lines.map((l, i) => {
      const hit = variantById(l.id);
      const { product: p, variant: v } = hit;
      return {
        key: `${l.id}:${i}`,
        id: v.id,
        variant_id: v.id,
        product_id: p.id,
        quantity: l.quantity,
        properties: l.properties || {},
        product_title: p.title,
        title: p.hasOnlyDefault ? p.title : `${p.title} - ${v.title}`,
        variant_title: p.hasOnlyDefault ? null : v.title,
        url: p.type === "wrap" ? "#" : p.url,
        image: img(p.images[0]),
        price: v.price,
        original_price: v.compare_at_price || v.price,
        line_price: v.price * l.quantity,
        final_line_price: v.price * l.quantity,
        original_line_price: (v.compare_at_price || v.price) * l.quantity,
        options_with_values: p.options.map((o, k) => ({ name: o.name, value: v.options[k] })),
        product_has_only_default_variant: p.hasOnlyDefault,
        handle: p.handle
      };
    });
    return { token: "prototype", note: s.note, attributes: s.attributes, currency: "AUD", items, item_count: items.reduce((a, i) => a + i.quantity, 0), total_price: items.reduce((a, i) => a + i.final_line_price, 0), requires_shipping: true };
  }
  var sectionsFor = (ids) => Object.fromEntries((ids || []).map((id) => [id, renderSection(id)]));
  function addLine(s, id, quantity = 1, properties = {}) {
    const hit = variantById(id);
    if (!hit) throw new Error("This hamper is no longer available.");
    if (!hit.variant.available) throw new Error(`${hit.product.title} is sold out.`);
    const props = Object.fromEntries(Object.entries(properties).filter(([, v]) => v !== "" && v != null));
    const same = s.lines.find((l) => l.id === Number(id) && JSON.stringify(l.properties || {}) === JSON.stringify(props));
    if (same) same.quantity += Number(quantity) || 1;
    else s.lines.push({ id: Number(id), quantity: Number(quantity) || 1, properties: props });
    return s.lines.indexOf(same || s.lines[s.lines.length - 1]);
  }
  function renderSection(id, url = new URL(location.href)) {
    const cart2 = cartJSON();
    const handle = (url.pathname.match(/\/products\/([^/?]+)/) || [])[1];
    const p = handle ? product(handle) : null;
    const variantFrom = (prod) => {
      const vals = (url.searchParams.get("option_values") || "").split(",").filter(Boolean).map(Number);
      return vals.length && prod.variants.find((v) => vals.every((x) => v.valueIds.includes(x))) || prod.firstAvailable;
    };
    switch (id) {
      case "cart-drawer":
        return cartDrawer(cart2);
      case "main-cart":
        return `<div id="shopify-section-main-cart" class="shopify-section">${mainCart(cart2)}</div>`;
      case "product-main":
        return `<div id="shopify-section-product-main" class="shopify-section">${mainProduct(p, variantFrom(p), "product-main")}</div>`;
      case "quick-view":
        return quickView(p, variantFrom(p));
      case "product-card":
        return `<div data-card-wrap>${card(p, 0)}</div>`;
      case "predictive-search":
        return predictive(url.searchParams.get("q") || "");
      case "cart-upsells": {
        const exclude = new Set(cart2.items.map((i) => i.product_id));
        const intent = url.searchParams.get("intent");
        const pool = intent === "related" ? hampers() : products.filter((x) => x.type === "addon");
        return cartUpsells(pool.filter((x) => !exclude.has(x.id)).slice(0, 6));
      }
      case "main-collection": {
        const st = collectionState(url.searchParams);
        return mainCollection(collectionBase(url.searchParams), st, collectionUrl(url.searchParams));
      }
      default:
        return `<div id="shopify-section-${id}"></div>`;
    }
  }
  function collectionBase(q2) {
    const c = q2.get("c") || (q2.get("for") ? "" : "all");
    if (q2.get("for") && !c) return forWho(q2.get("for"));
    if (!c || c === "all") return hampers();
    return inOccasion(c);
  }
  function collectionState(q2) {
    return {
      who: q2.getAll("filter.p.m.custom.recipients"),
      diet: q2.getAll("filter.p.m.custom.dietary"),
      min: Number(q2.get("filter.v.price.gte")) || 0,
      max: Number(q2.get("filter.v.price.lte")) || 0,
      sort: q2.get("sort_by") || "manual"
    };
  }
  var collectionUrl = (q2) => `collection.html?${q2.get("c") ? `c=${q2.get("c")}` : q2.get("for") ? `for=${q2.get("for")}` : "c=all"}`;
  var json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  var html = (text) => new Response(text, { status: 200, headers: { "Content-Type": "text/html" } });
  async function readBody(init) {
    const b = init.body;
    if (!b) return {};
    if (b instanceof FormData) {
      const out = { properties: {}, sections: "" };
      for (const [k, v] of b) {
        const it = k.match(/^items\[(\d+)\]\[(id|quantity)\]$/);
        const ip = k.match(/^items\[(\d+)\]\[properties\]\[(.+)\]$/);
        const m = k.match(/^properties\[(.+)\]$/);
        if (it || ip) {
          out.items = out.items || [];
          const i = Number((it || ip)[1]);
          out.items[i] = out.items[i] || { properties: {} };
          if (it) out.items[i][it[2]] = v;
          else out.items[i].properties[ip[2]] = v;
        } else if (m) out.properties[m[1]] = v;
        else out[k] = v;
      }
      return out;
    }
    return typeof b === "string" ? JSON.parse(b) : b;
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    const path = url.pathname;
    const sid = url.searchParams.get("section_id");
    try {
      if (/\/cart(\.html)?\.js$/.test(path)) return json(cartJSON());
      if (path.endsWith("/cart/add.js")) {
        const body = await readBody(init);
        const s = load();
        const items = body.items || [{ id: body.id, quantity: body.quantity, properties: body.properties }];
        const added = items.map((it) => addLine(s, it.id, it.quantity, it.properties || {}));
        save(s);
        const cart2 = cartJSON(s);
        const ids = body.sections ? String(body.sections).split(",") : [];
        const item = cart2.items[added[added.length - 1]];
        return json(body.items ? { items: added.map((i) => cart2.items[i]), sections: sectionsFor(ids) } : { ...item, sections: sectionsFor(ids) });
      }
      if (path.endsWith("/cart/change.js")) {
        const body = await readBody(init);
        const s = load();
        const idx = body.line ? Number(body.line) - 1 : s.lines.findIndex((l, i) => `${l.id}:${i}` === body.id);
        if (idx > -1) {
          if (Number(body.quantity) <= 0) s.lines.splice(idx, 1);
          else s.lines[idx].quantity = Number(body.quantity);
        }
        save(s);
        return json({ ...cartJSON(s), sections: sectionsFor(body.sections) });
      }
      if (path.endsWith("/cart/update.js")) {
        const body = await readBody(init);
        const s = load();
        if (body.attributes) s.attributes = { ...s.attributes, ...body.attributes };
        if (body.note !== void 0) s.note = body.note;
        if (body.updates) Object.entries(body.updates).forEach(([k, q2]) => {
          const l = s.lines.find((x, i) => `${x.id}:${i}` === k || String(x.id) === k);
          if (l) l.quantity = Number(q2);
        });
        s.lines = s.lines.filter((l) => l.quantity > 0);
        save(s);
        return json({ ...cartJSON(s), sections: sectionsFor(body.sections) });
      }
      if (path.endsWith("/cart/clear.js")) {
        save({ lines: [], note: "", attributes: {} });
        return json(cartJSON());
      }
      if (sid) return html(renderSection(sid, url));
    } catch (err) {
      return json({ status: 422, message: err.message, description: err.message }, 422);
    }
    return realFetch(input, init);
  };
  addEventListener("message", (e) => {
    const d = e.data || {};
    if (d.type === "proto:date" && d.date) {
      let cur = null;
      try {
        cur = JSON.parse(localStorage.getItem("zariva:today"));
      } catch (err) {
      }
      if (cur !== d.date) {
        try {
          localStorage.setItem("zariva:today", JSON.stringify(d.date));
        } catch (err) {
        }
        location.reload();
      }
    }
  });

  // site/assets/zariva/boot.js
  var page = document.body.dataset.page;
  (() => {
    if (window.parent === window || !["cart", "checkout"].includes(page) && location.hash !== "#bag") return;
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem("zariva:shopify-cart"));
    } catch (e) {
    }
    if (s && s.lines && s.lines.length) return;
    const diya = product("the-diya-hamper"), wrapP = product("gift-wrap"), posy = product("item-dried-native-posy");
    const lines = [
      { id: diya.variants[1].id, quantity: 1, properties: { To: "Maa", From: "Anu", Message: "Happy Diwali. Light the first diya for me." } },
      { id: wrapP.variants[0].id, quantity: 1, properties: { _wrap_for: diya.title } }
    ];
    try {
      localStorage.setItem("zariva:shopify-cart", JSON.stringify({ lines, note: "", attributes: { Gift: "Yes", "Hide prices": "Yes" } }));
    } catch (e) {
    }
  })();
  var q = new URLSearchParams(location.search);
  var wrap = (id, cls, html2) => `<div id="shopify-section-${id}" class="shopify-section ${cls}">${html2}</div>`;
  function home() {
    const m = lead();
    const up = upcoming();
    const slides = [];
    if (m) {
      const s = momentState(m);
      slides.push({ image: m.image, caption: `${m.name} \xB7 ${m.kind === "sale" ? s.active ? `until ${fmtLong(s.end)}` : `from ${fmtLong(s.start)}` : fmtLong(s.start)}`, heading: m.headline, text: s.orderable && m.kind !== "sale" ? `Order by ${fmtLong(s.orderBy)} for delivery Australia-wide.` : m.blurb, label: m.kind === "sale" ? "See the Quiet Week" : `Send for ${m.name}`, link: `collection.html?c=${m.id}`, overlay: 0.35, note: 3 });
    } else {
      slides.push({ image: "exchange", caption: "Hampers, packed by hand in Sydney", heading: "For the people <em>worth the effort</em>", text: "Every hamper wrapped by hand, with a note written in ink.", label: "Find their hamper", link: "collection.html?c=all", overlay: 0.25 });
    }
    const next = up.find((x) => x !== m && x.kind !== "sale");
    if (next) slides.push({ image: next.image, caption: `Next \xB7 ${next.name}, ${fmtLong(parse(next.date))}`, heading: next.headline, label: `Shop ${next.name}`, link: `collection.html?c=${next.id}`, overlay: 0.35 });
    slides.push({ image: "c-journal", caption: "Corporate gifting", heading: "For a team, or <em>a client list</em>", text: "From ten boxes to a thousand, each to its own door.", label: "Corporate gifting", link: "corporate.html", overlay: 0.3 });
    const rows = [
      ...up.slice(0, 3).map((x) => {
        const s = momentState(x);
        return { id: x.id, name: x.name, image: x.image, href: `collection.html?c=${x.id}`, count: inOccasion(x.id).length, note: x.kind === "sale" ? `${fmtShort(s.start)} \u2013 ${fmtShort(s.end)}` : `${fmtLong(s.start)}${s.orderable ? ` \xB7 order by ${fmtShort(s.orderBy)}` : ""}` };
      }),
      ...always.map((x) => ({ id: x.id, name: x.name, image: x.image, href: `collection.html?c=${x.id}`, count: inOccasion(x.id).length, note: "Any day" }))
    ];
    const list = (m && m.kind !== "sale" ? inOccasion(m.id) : m ? inOccasion("quiet-week") : hampers().filter((p) => p.best)).slice(0, 4);
    return [
      slideshow(slides),
      collectionIndex(rows, "What are we celebrating"),
      featured("featured", { caption: m ? m.kind === "sale" ? "The Quiet Week" : `For ${m.name}` : "Most sent", heading: m && m.kind !== "sale" ? `Arrives before <em>${m.name}</em>` : "The ones people send most", link: m ? `collection.html?c=${m.id}` : "collection.html?c=all", list, count: m ? inOccasion(m.kind === "sale" ? "quiet-week" : m.id).length : 0 }),
      reels(ugc.slice(0, 8)),
      split("corporate", { image: "exchange", caption: "Gifting for many", heading: "A team, a client list, <em>a whole family</em>", text: "<p>From ten boxes to a thousand. Your logo on the ribbon, each hamper to its own door with its own note, and one invoice.</p>", label: "Corporate gifting", link: "corporate.html" })
    ].join("");
  }
  function collection() {
    const base = collectionBase(q);
    const m = occasion(q.get("c"));
    const who = recipients.find((r) => r.id === q.get("for"));
    let hero;
    if (m && m.date) {
      const s = momentState(m);
      hero = { caption: m.kind === "sale" ? `${fmtLong(s.start)} \u2013 ${fmtLong(s.end)}` : `${fmtLong(s.start)}${s.orderable ? ` \xB7 Order by ${fmtLong(s.orderBy)}` : ""}`, title: m.name, text: m.blurb };
    } else if (m) hero = { caption: "Any day", title: m.name, text: m.line };
    else if (who) hero = { caption: "Who it\u2019s for", title: who.name, text: "" };
    else hero = { caption: "Every occasion", title: "All hampers", text: "Each one wrapped by hand in our Sydney studio, with a note written in ink." };
    document.title = `${hero.title} | House of Zariva`;
    return collectionHero(hero) + mainCollection(base, collectionState(q), collectionUrl(q));
  }
  function product2() {
    const p = product(q.get("p")) || product("the-diya-hamper");
    document.title = `${p.title} | House of Zariva`;
    const m = sendingFor(p);
    const more = hampers().filter((x) => x.handle !== p.handle && (m ? x.occasions.includes(m.id) : x.best)).slice(0, 4);
    return wrap("product-main", "section-main-product", mainProduct(p)) + featured("related", { caption: m ? `Also for ${m.name}` : "Also sent", heading: "You might send these too", list: more });
  }
  var cart = () => wrap("main-cart", "section-main-cart", mainCart(cartJSON()));
  function search() {
    const term = (q.get("q") || "").trim().toLowerCase();
    const list = hampers().filter((p) => (p.title + " " + p.blurb + " " + p.inside.map((x) => x.join(" ")).join(" ")).toLowerCase().includes(term));
    return collectionHero({ caption: "Search", title: term ? `\u201C${q.get("q")}\u201D` : "Search", text: `${list.length} ${list.length === 1 ? "result" : "results"}` }) + featured("results", { caption: "", heading: "", list });
  }
  function build2() {
    return buildABox({
      caption: "Build your own",
      heading: "Their favourite things, <em>in one box</em>",
      text: "Choose a size, fill it with what they love. We wrap it and write the note.",
      items: products.filter((p) => p.type === "item"),
      box: product("keepsake-box"),
      sizes: [[3, 0], [5, 5], [8, 10]],
      name: "Zariva box",
      note: "Each box is wrapped by hand in our Sydney studio."
    });
  }
  function corporate() {
    return [
      split("corp-hero", { image: "c-journal", caption: "Corporate gifting", heading: "Gifts that make a client <em>call to say thanks</em>", text: "<p>From ten boxes to a thousand. Your logo on the ribbon, each hamper to its own door with its own note, and one invoice.</p>", label: "Ask for a proposal", link: "#enquire", layout: "image-right" }),
      faq("corp-how", { caption: "How it works", heading: "Three emails, and it\u2019s done", items: [["Tell us", "How many, the budget per gift, the date, and whether you\u2019d like your logo on the ribbon."], ["We propose", "Three hampers within one business day, with a photo and the price per box."], ["Send the list", "Names, addresses and messages in one spreadsheet. We pack, write every note and send each one."], ["Pricing", "5% off from 10 boxes, 10% from 50, a quote from 200."]] }),
      featured("corp-list", { caption: "Chosen by teams", heading: "A place to start", link: "collection.html?c=corporate", list: inOccasion("corporate").slice(0, 4) }),
      '<div id="enquire"></div>' + contactForm("corp-form", { heading: "Ask for a proposal", text: "We reply within one business day.", fields: ["Company", "How many, and by when"] })
    ].join("");
  }
  function concierge() {
    return split("conc", { image: "card-hand", caption: "Gifting concierge", heading: "Tell us who. We\u2019ll take it <em>from there</em>", text: '<p>Message the studio with who it\u2019s for, the occasion, the day and roughly how much. We\u2019ll suggest three hampers within the hour.</p><p class="muted">Monday to Saturday, 9am to 6pm AEST \xB7 (02) 5550 1234 \xB7 studio@houseofzariva.com.au</p>', label: "Message on WhatsApp", link: "#", layout: "image-right" }) + contactForm("conc-form", { heading: "Or write to us", text: "Who it\u2019s for, the occasion and the day." });
  }
  function story() {
    return split("story", { image: "pack-woman", caption: "Our studio", heading: "Gifting, <em>woven with tradition</em>", text: "<p>We started Zariva for families who live far from home: the Diwali that can\u2019t be shared in person, the birthday in another city, the new baby met over video call.</p><p>Every hamper is wrapped by hand in our Sydney studio, with things made by more than 40 Australian makers.</p>" }) + richText("mark", { caption: "The arch and the diamond", heading: "A doorway, and <em>the gift inside it</em>", text: "<p>Our mark is an Indian doorway holding one gold diamond. Every hamper is a visit you couldn\u2019t make in person, so we treat it like one.</p>" });
  }
  function help() {
    const up = upcoming().slice(0, 4);
    return faq("delivery", { caption: "Delivery", heading: "When it leaves, and <em>when it arrives</em>", text: "Order by 1pm AEST on a weekday and your hamper leaves the studio the same day.", items: [
      ["Standard, $12", "2 business days to capital cities, 3 to 5 to regional areas. Free over $150."],
      ["Express, $18", "Next business day to capital cities."],
      ["Same-day, $25", "Sydney and Melbourne metro, for orders by 11am."],
      ...up.map((m) => {
        const s = momentState(m);
        return [`${m.name}, ${fmtLong(s.start)}`, m.kind === "sale" ? `Runs until ${fmtLong(s.end)}.` : `Order by ${fmtLong(s.orderBy)} for standard delivery.`];
      })
    ] }) + faq("faq", { caption: "Questions", heading: "Before you send", items: [
      ["Can I choose the day it arrives?", "Yes. Switch on Make it a gift and choose Arrive on a specific day."],
      ["Who writes the note?", "We do, by hand, in ink. You write the message."],
      ["Can I send to more than one address?", "Each order goes to one address. For several people, check out once per address, or ask the concierge."],
      ["Will the price show?", "Not if you keep Hide prices on the packing slip ticked."]
    ] });
  }
  function account() {
    return contactForm("login", { heading: "Sign in", text: "We\u2019ll email you a six-digit code. In the live store, Shopify\u2019s customer accounts handle this." }).replace("Message</label>", "Code (optional)</label>");
  }
  function checkout() {
    const c = cartJSON();
    document.body.classList.add("z-checkout");
    const field = (id, label, type = "text") => `<div class="field"><input class="field__input" id="co-${id}" type="${type}" placeholder=" "><label class="field__label" for="co-${id}">${label}</label></div>`;
    return `<section class="section scheme-scheme-1 sp-t-small sp-b-default"><div class="page-width"><div class="z-co">
    <div class="z-co__main">
      <a href="index.html" class="logo">${LOGO}</a>
      <div class="z-co__express"><a href="#" class="z-shoppay">Shop <b>Pay</b></a><a href="#" class="z-paypal"><b>PayPal</b></a><a href="#" class="z-gpay"><b>G Pay</b></a></div>
      <h2 class="h4">Contact</h2>${field("email", "Email", "email")}
      <h2 class="h4">Delivery</h2><div class="z-co__row">${field("first", "First name")}${field("last", "Last name")}</div>${field("addr", "Address")}<div class="z-co__row">${field("suburb", "Suburb")}${field("pc", "Postcode")}</div>
      <h2 class="h4">Delivery method</h2><div class="z-co__rates" data-rates></div>
      <h2 class="h4">Payment</h2>${field("card", "Card number")}<div class="z-co__row">${field("exp", "MM / YY")}${field("cvc", "Security code")}</div>
      <button type="button" class="btn btn--full" data-pay>${'<span class="btn__label"><span>Pay now \xB7 ' + money(c.total_price) + "</span></span>"}</button>
      <p class="caption">This is Shopify\u2019s own checkout, branded in the checkout editor. Shown here so the journey is complete.</p>
    </div>
    <aside class="z-co__side"><ul class="cart-lines list-reset">${c.items.map((it) => `<li class="z-co__line"><span class="media ratio-portrait"><img src="${it.image}" alt=""></span><span><b>${esc(it.product_title)}</b><br><span class="text-sm muted">${[it.variant_title, ...Object.entries(it.properties).filter(([k]) => k[0] !== "_").map(([k, v]) => `${k}: ${v}`)].filter(Boolean).map(esc).join("<br>")}</span></span><span>${money(it.final_line_price)}</span></li>`).join("") || '<li class="muted">Your bag is empty.</li>'}</ul>
      <div class="cart-summary__total"><span>Total</span><span class="cart-summary__amount">${money(c.total_price)}</span></div><p class="text-sm muted">AUD, GST included.</p></aside>
  </div></div></section>`;
  }
  var PAGES = { home, collection, product: product2, cart, search, build: build2, corporate, concierge, story, help, account, checkout };
  var N = (sel, n, build3, label) => ({ sel, n, build: build3, label });
  var ANNOTATE = {
    home: [
      N(".section-announcement", 0, "custom", "Intellect announcement bar; first message set by the next Moment"),
      N(".section-header", 1, "native", "Intellect header: logo centred, Occasions mega menu, Who it\u2019s for dropdown"),
      N(".section-slideshow", 2, "native", "Intellect Slideshow: full-width banners, separate phone image; first slide from the next Moment"),
      N(".section-slideshow .slideshow__ui", 3, "", ""),
      N(".section-index", 4, "native", "Intellect Collection index: Moments by date, then always-on occasions"),
      N("#shopify-section-featured", 5, "native", "Intellect Featured collection; arrival line is the Moment logic"),
      N(".section-reels", 6, "native", "Intellect Shoppable videos"),
      N("#shopify-section-corporate", 7, "native", "Intellect Image with text"),
      N(".section-footer", 8, "native", "Intellect footer: sign-up, menus, wordmark")
    ],
    collection: [
      N(".section-collection-header", 1, "native", "Intellect Collection banner (text); dates from the Moment"),
      N(".collection-toolbar", 2, "native", "Intellect filters drawer: Search & Discovery filters (recipient, price, dietary) and sort"),
      N("[data-product-grid] > li:first-child", 3, "native", "Intellect product card; arrival line + Loupe chip")
    ],
    product: [
      N(".product__media", 1, "native", "Intellect gallery: thumbnails; Loupe video card on the first image"),
      N(".product__media loupe-chip", 2, "", ""),
      N(".product__title", 3, "", ""),
      N(".variant-picker", 4, "native", "Intellect variant picker: options on one line"),
      N(".product__buy", 5, "native", "Intellect buy buttons + Shopify dynamic checkout"),
      N("gift-mode", 6, "native", "Intellect Gift Mode block: wrap (a product), note (line properties), date and packing slip (cart attributes)"),
      N("delivery-estimate", 7, "native", "Intellect delivery estimate (1pm cut-off, AEST)"),
      N(".accordion", 8, "custom", "Collapsible tabs; What\u2019s inside from a product metaobject list"),
      N("#shopify-section-related", 0, "native", "Intellect product recommendations")
    ],
    cart: [
      N(".cart-lines", 1, "native", "Intellect cart page: the note shows as line properties"),
      N(".ladder", 2, "native", "Intellect reward ladder: free delivery at $150"),
      N(".cart-summary", 3, "native", "Intellect cart summary: studio note (cart note), Afterpay line")
    ],
    build: [
      N("box-builder .box__products", 1, "native", "Intellect Build-a-box: items from a collection"),
      N("box-builder .box__sizes", 2, "native", "Box sizes with automatic discounts (Shopify)"),
      N("box-builder .box__crate", 3, "", "")
    ],
    corporate: [
      N("#shopify-section-corp-hero", 1, "native", "Intellect Image with text"),
      N("#shopify-section-corp-how", 2, "native", "Intellect FAQ section"),
      N("#shopify-section-corp-form", 3, "native", "Intellect Contact form")
    ],
    concierge: [N("#shopify-section-conc", 0, "custom", "Intellect Image with text; WhatsApp link"), N("#shopify-section-conc-form", 0, "native", "Intellect Contact form")],
    story: [N("#shopify-section-story", 0, "todo", "Founder\u2019s story: to be written with the client"), N("#shopify-section-mark", 0, "native", "Intellect Rich text")],
    help: [N("#shopify-section-delivery", 0, "custom", "Intellect FAQ; order-by dates generated from Moments"), N("#shopify-section-faq", 0, "native", "Intellect FAQ section")],
    search: [N("#shopify-section-results", 0, "native", "Intellect search results + predictive search")],
    checkout: [N(".z-co__main", 1, "native", "Shopify Checkout, branded in the checkout editor"), N(".z-co__side", 2, "", "")]
  };
  function annotate() {
    for (const a of ANNOTATE[page] || []) {
      const el = document.querySelector(a.sel);
      if (!el) continue;
      if (a.n) el.setAttribute("data-note", a.n);
      if (a.build) {
        el.setAttribute("data-build", a.build);
        el.setAttribute("data-build-label", a.label);
      }
    }
  }
  var main = (PAGES[page] || home)();
  if (page === "checkout") document.body.insertAdjacentHTML("afterbegin", `<main id="MainContent" class="main">${main}</main>${cartDrawer(cartJSON())}`);
  else document.body.insertAdjacentHTML("afterbegin", `${announcement()}${header(page === "home" ? "index.html" : "")}
  <main id="MainContent" class="main" role="main" tabindex="-1">${main}</main>
  ${footer()}${cartDrawer(cartJSON())}${searchModal()}
  <div class="toast-region" aria-live="polite"></div>`);
  annotate();
  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-set-moment]");
    if (m) {
      try {
        localStorage.setItem("zariva:moment", JSON.stringify(m.dataset.setMoment));
      } catch (err) {
      }
    }
  });
  window.LoupeConfig = {
    position: "top-right",
    previews: "auto",
    highlight: "underline",
    afterAdd: "stay",
    requireChoice: "size",
    notes: ["Wrapped by hand, with a note written in ink", "Free delivery over $150"],
    cart: {
      add: ({ variantId, quantity }) => Promise.resolve(window.ZarivaIntellect).then(({ Cart, openCart }) => {
        const data = new FormData();
        data.append("id", variantId);
        data.append("quantity", quantity || 1);
        return Cart.add(data).then((r) => {
          setTimeout(() => openCart && openCart(), 300);
          return r;
        });
      })
    }
  };
  if (page === "checkout") {
    const rates = document.querySelector("[data-rates]");
    const draw = () => {
      const pc = document.getElementById("co-pc").value;
      const same = /^(20|21|22|30|31)\d\d$/.test(pc);
      const free = cartJSON().total_price >= 15e3;
      rates.innerHTML = [["Standard", "2 business days", free ? "Free" : "$12"], ["Express", "Next business day", "$18"], ["Same-day", same ? "Order by 11am" : "Sydney and Melbourne metro postcodes", same ? "$25" : "\u2014"]].map(([n, d, p], i) => `<label class="checkbox z-co__rate${!same && i === 2 ? " is-disabled" : ""}"><input type="radio" name="rate" ${i ? "" : "checked"} ${!same && i === 2 ? "disabled" : ""}><span><b>${n}</b> \xB7 ${d}</span><span>${p}</span></label>`).join("");
    };
    document.getElementById("co-pc").addEventListener("input", draw);
    draw();
    document.querySelector("[data-pay]").addEventListener("click", () => {
      fetch("cart/clear.js", { method: "POST" });
      document.querySelector(".z-co__main").innerHTML = `<a href="index.html" class="logo">${LOGO}</a><p class="caption">Order ZR-1048 confirmed</p><h1 class="h2">Thank you. We\u2019ll take it from here.</h1><p class="muted">We\u2019re writing the note now. You\u2019ll get an email when it leaves the studio.</p><a href="index.html" class="btn"><span class="btn__label"><span>Back to the shop</span></span></a>`;
    });
  }
})();
