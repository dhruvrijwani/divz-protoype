// Bundles the prototype's scripts into two classic scripts, so pages work from disk (file://) as well
// as from a server: zariva.bundle.js (Shopify stand-in + page) then intellect.bundle.js (the theme).
// Run from prototype/ after build-intellect.mjs: node tools/bundle.mjs
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve('../../THREE10/tools/package.json'));
const esbuild = require('esbuild');
const A = path.resolve('site/assets');
const theme = {
  name: 'theme-alias',
  setup(b) {
    const map = { core: 'core', motion: 'motion', cart: 'cart', product: 'product', collection: 'collection', slider: 'slider', lenis: 'vendor-lenis', cursor: 'cursor' };
    b.onResolve({ filter: /^@theme\// }, (args) => ({ path: path.join(A, 'intellect', map[args.path.slice(7)] + '.js') }));
  },
};
for (const [entry, out] of [['zariva/boot.js', 'zariva.bundle.js'], ['zariva/start.js', 'intellect.bundle.js']]) {
  await esbuild.build({ entryPoints: [path.join(A, entry)], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(A, out), plugins: [theme], logLevel: 'warning', legalComments: 'inline' });
}
console.log('bundled');
