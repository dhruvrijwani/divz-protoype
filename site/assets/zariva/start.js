/* House of Zariva prototype: starts Intellect's own JavaScript on the page boot.js has written.
   In Shopify these load as modules from the theme's importmap; here they are bundled so the
   prototype also opens straight from the folder. */
import '../intellect/theme.js';
import '../intellect/slideshow.js';
import '../intellect/sections.js';
import '../intellect/reels.js';
import '../intellect/slider.js';
import '../intellect/collection.js';
import '../intellect/product.js';
import '../intellect/bundle.js';
import '../intellect/moments.js';
import { Cart, openCart } from '../intellect/cart.js';

window.ZarivaIntellect = { Cart, openCart };

// Loupe, as Intellect's loupe-config snippet loads it.
window.LoupeConfig = window.LoupeConfig || {};
window.LoupeConfig.src = 'assets/intellect/loupe.js';
const loader = document.createElement('script');
loader.src = 'assets/intellect/loupe-loader.js';
document.head.append(loader);

if (location.hash === '#bag') setTimeout(openCart, 600);
window.PROTO && window.PROTO.refresh();
