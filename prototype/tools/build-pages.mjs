// Writes the page shells in site/. Each page loads Intellect's CSS and scripts, the Zariva theme style,
// and boot.js, which builds the page from Intellect's section templates.
// PROTO_NOTES maps shared parts (header, footer, bag) to each page's note numbers in the presentation.
// Run from prototype/: node tools/build-pages.mjs
import fs from 'node:fs';

const PAGES = [
  ['index.html', 'home', 'House of Zariva | Gift hampers, sent across Australia', {}],
  ['collection.html', 'collection', 'Hampers | House of Zariva', {}],
  ['product.html', 'product', 'House of Zariva', {}],
  ['cart.html', 'cart', 'Your bag | House of Zariva', {}],
  ['search.html', 'search', 'Search | House of Zariva', {}],
  ['build.html', 'build', 'Build your own | House of Zariva', {}],
  ['corporate.html', 'corporate', 'Corporate gifting | House of Zariva', {}],
  ['concierge.html', 'concierge', 'Gifting concierge | House of Zariva', {}],
  ['story.html', 'story', 'Our studio | House of Zariva', {}],
  ['help.html', 'help', 'Delivery and help | House of Zariva', {}],
  ['account.html', 'account', 'Account | House of Zariva', {}],
  ['checkout.html', 'checkout', 'Checkout | House of Zariva', {}],
];
const CSS = ['intellect/theme-vars', 'intellect/base', 'intellect/content', 'intellect/sections', 'intellect/slideshow', 'intellect/product', 'intellect/collection', 'intellect/cart', 'intellect/pages', 'intellect/bundle', 'intellect/loupe', 'zariva/zariva'];
const IMPORTS = { '@theme/core': 'core', '@theme/motion': 'motion', '@theme/cart': 'cart', '@theme/product': 'product', '@theme/collection': 'collection', '@theme/slider': 'slider', '@theme/lenis': 'vendor-lenis', '@theme/cursor': 'cursor' };

for (const old of fs.readdirSync('site').filter((f) => f.endsWith('.html'))) fs.rmSync(`site/${old}`);
for (const [file, id, title, notes] of PAGES) {
  fs.writeFileSync(`site/${file}`, `<!doctype html>
<html class="no-js" lang="en-AU" data-motion="subtle" data-reveal-headings="fade" data-reveal-images="curtain" data-smooth-scroll="0.1" data-button-hover="roll" data-label-prices="false" data-cursor-labels="false" data-emphasis="accent" data-caption="label-upper" data-badge-shape="square" data-badge-position="top-left" data-swatch-shape="circle" data-media-shape="rectangle" data-ornament="none" data-texture="none" data-image-tone="natural" data-button-shadow="none" data-border="thin">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
${CSS.map((c) => `<link rel="stylesheet" href="assets/${c}.css">`).join('\n')}
<link rel="stylesheet" href="assets/proto.css">
<script>if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion-on'); document.documentElement.classList.replace('no-js', 'js');</script>
</head>
<body data-page="${id}">
<script src="assets/zariva/data.js"></script>
<script>window.PROTO_NOTES = ${JSON.stringify(notes)};</script>
<script src="assets/proto.js"></script>
<script src="assets/zariva.bundle.js"></script>
<script src="assets/intellect.bundle.js"></script>
</body>
</html>
`);
}
console.log(`wrote ${PAGES.length} pages`);
