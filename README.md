# DIVZ: storefront prototype

A clickable prototype of the DIVZ hamper store for the client pitch. It is plain HTML, CSS and JavaScript with no build step and no dependencies. Every page, section and interaction is something we can build in a customised free Shopify theme. The Shopify mapping is in the table below.

## Open it

- **Quickest:** double-click `index.html`. Chrome, Edge and Safari all work.
- **For the pitch:** host it so it behaves like a real site (smooth page transitions, shareable URL). Drag this folder onto [Netlify Drop](https://app.netlify.com/drop), or run `npx serve` in this folder.
- The bag, account and "recently viewed" state live in the browser's local storage. To reset, clear site data or use a private window.

## Demo script (about 5 minutes)

1. **Home.** The hero "unwraps" on the first visit of each session. To replay it, add `?unwrap` to the URL (`index.html?unwrap`). Hover the dot on the hero image: it's a shoppable hotspot.
2. **Shop by occasion.** The occasion gift tags drop onto the ribbon as you scroll. Hover one and it swings. Each occasion has its own ribbon colour, and that colour carries through the menu, chips, collection pages and badges.
3. **Bestsellers.** Hover a card to see the second photo and "Choose options" (quick add).
4. **Diwali feature.** It shows a live countdown to Diwali (Sunday 8 November 2026).
5. **Unboxed by you (UGC).** The reels autoplay in view. Click one to open the shoppable player.
6. **Card writer.** Type a message and it previews in handwriting.
7. **Occasions menu → Diwali.** Try the filters drawer, price chips, sort, and the corporate promo tile in the grid. On the Shop all page, the chips filter by occasion instead.
8. **The Diya Hamper (product page).** Pick a size and the price updates. Write the card and watch the live preview. Enter postcode `2000` and press Check delivery. Add to bag to open the cart drawer, which has a free-delivery bar and add-ons.
9. **Festival of Lights Trunk:** choose Family to see a sold-out variant. **The Invitation Box:** bulk quantity tiers with a per-box price.
10. **Bag page:** delivery date, studio note, and an option to leave prices off the packing slip.
11. **Checkout:** enter a postcode to reveal delivery options. Same-day appears only for Sydney and Melbourne metro postcodes. Apply code `WELCOME10`, fill in the form and press Pay now to reach the thank-you page. "Buy with Shop Pay" on a product page goes straight to checkout.
12. **Reviews page:** filter by occasion or star rating, show only reviews with photos, or write a review.
13. Repeat a few of these on a phone. Every page is responsive.

## Pages

| File | Shopify template |
|---|---|
| `index.html` | `index.json` |
| `collection.html?c=all`, `?c=bestsellers`, `?c=diwali` and so on | `collection.json` (plus `collection.corporate.json` for the corporate promo) |
| `product.html?p=<handle>` | `product.json` |
| `cart.html` | `cart.json` (the cart drawer runs on every page) |
| `checkout.html` | Shopify Checkout (branding only, see below) |
| `search.html?q=` | `search.json` + predictive search |
| `reviews.html` | `page.reviews.json` + reviews app widget |
| `about.html`, `contact.html`, `faq.html` | `page.*.json` |
| `account.html` | Customer accounts |
| `404.html` | `404.json` |

Catalogue: 40 products (35 hampers and 5 add-ons) across the 7 occasions from the brief. 24 of them have variants: buttons, colour swatches, quantity tiers and alcohol-free options. Data lives in `assets/js/data.js`.

## Design system

| Token | Value | Use |
|---|---|---|
| Bush | `#1E3B2F` | Text, buttons, footer: deep eucalypt green |
| Paper | `#FBFBF8` | Page background |
| Mist | `#EDF0EB` | Alternate sections, image placeholders |
| Gum | `#5C6E62` | Secondary text |
| Wattle | `#E2B04A` | Ribbon, focus and accent details only |
| Occasion ribbons | Diwali `#E0892B`, Corporate `#4A555C`, Baby `#8FB0C8`, Wedding `#C9AE84`, Her `#C8607A`, Him `#8C5E3C`, Christmas `#B23A2E` | Set per collection |

- **Type:** Gambetta (display serif) with Switzer (UI and body), both free from Fontshare and self-hosted. La Belle Aurore is used only for the handwritten-card preview.
- **Signature shapes:** collections are hanging gift tags (chamfered corners, punched eyelet, string) on a ribbon rail. Badges are small gift tags too.
- **Motion:** one orchestrated moment (the unwrap), tags dropping onto the rail once, image reveals, and motion that answers the user (drawers, the tag swing, hover image swaps). Everything respects reduced-motion settings.
- **Australian details:** AUD with GST included, Afterpay messaging, postcode-based delivery, same-day metro delivery, Australian spelling, an Acknowledgement of Country, and makers from every state.

## Shopify build plan

**Base theme:** Shopify's free **Dawn** (most documented) or **Horizon** (newer, with theme blocks). Everything below is theme code, a native feature, or a common app.

| Prototype feature | How we build it |
|---|---|
| Announcement bar, header, sticky header | Native sections |
| Occasions mega menu with feature images | Header menu + 2 custom feature blocks |
| Hero unwrap + hotspot | Custom section (Liquid/CSS/JS), product picker for the hotspot |
| Occasion gift tags | Custom collection-list section; ribbon colour = collection metafield (colour type) |
| Bestsellers slider | Featured collection section on an automated "Bestsellers" collection |
| Diwali countdown feature | Image-with-text section + countdown block (date setting) |
| UGC reels + shoppable player | Custom section: video blocks (Shopify-hosted video) each with a product picker |
| Handwritten card (home demo + product page) | Line item properties on the product form (`properties[To]`, `[Message]`, `[From]`); preview is theme JS |
| Variants: buttons, swatches, sold out, tiers | Native variant picker and swatches |
| "What's inside" with maker locations | Product metaobject list (item + region) |
| Postcode check, 1pm cut-off countdown | Theme JS; postcode ranges and cut-off as theme settings |
| Afterpay line | Afterpay on-site messaging app |
| Buy with Shop Pay | Native dynamic checkout button |
| Filters, sort, counts, URL state | Shopify Search & Discovery (price, type, tag and metafield filters: recipient, dietary) |
| Collection promo tile | Custom block inserted into the product grid |
| Cart drawer, free-delivery bar, add-ons | Native cart drawer + theme JS; add-ons from Search & Discovery complementary products |
| Delivery date, note, hide prices | Cart attributes and cart note (native), or a delivery-date app |
| Reviews snippet, product reviews, reviews page | Judge.me (free plan) or Okendo widgets, styled to the theme |
| Predictive search | Native predictive search API |
| Checkout | Shopify Checkout with the checkout editor: logo, colours, fonts, corner radius. Changing checkout content needs Shopify Plus. Same-day rates via local delivery and shipping profiles. |
| Account, contact form, FAQ | Customer accounts, native contact form, collapsible-content section |
| Page transitions | CSS view transitions (supported browsers) |

## Placeholder content to replace before launch

- **All photos and videos** are Unsplash and Mixkit stock (see `CREDITS.md`). Product names, prices, contents, makers, review counts, ratings, reviews and customer quotes are **sample content**. Don't publish them as real.
- **Studio location:** the prototype uses Alexandria, Sydney. The Acknowledgement of Country (Gadigal land), delivery copy and click-and-collect note must match the client's real location.
- **Contact details:** the phone number is in Australia's fictional (02) 5550 range. Replace it, along with the email domain, ABN, liquor licence number and policy pages.
- **Delivery rules:** confirm with the client. The prototype uses a 1pm AEST cut-off, a $150 free-delivery threshold, $12/$18/$25 rates, and Diwali and Christmas order-by dates.
- **About page story:** written in the studio's voice as a starting point. Replace it with the founder's own story.

## Files

```
index.html … 404.html   page templates (static HTML)
checkout.html            Shopify-style checkout mock
assets/css/divz.css      the whole design system and every section's styles
assets/js/data.js        products, collections, reviews, UGC (stand-ins for Shopify data)
assets/js/core.js        header, menus, drawers, cart, quick add, search, reels
assets/js/pages.js       page logic (one function per template)
assets/img, video, fonts media (see CREDITS.md)
```
