# House of Zariva: storefront prototype

A clickable prototype of the House of Zariva store, built from THREE10's own Shopify theme, Intellect: its real sections, CSS and JavaScript, in a Zariva theme style. It comes with the brand sheet it is designed from, a build plan, and the questions only Zariva can answer. Nothing here is a live store, and nothing can be bought.

## Open it

Double-click `index.html`. It runs from the folder in Chrome or Edge with no server and no internet connection; the fonts, photographs and videos are included.

## What you are looking at

| Tab | What it is |
|---|---|
| **Brand** | The idea and the design system: how the brand guide's colours, type and shapes are used. Start here. |
| **Home to Checkout** | The full shopping journey: homepage, an occasion, a hamper, the bag, checkout. |
| **Build your own, Corporate, Concierge, Our studio, Delivery and help, Journal, Article, Search, Account** | The rest of the store. |
| **Build plan, Questions** | How it gets built in Shopify, and what Zariva needs to decide. |

On a page tab, the second bar controls the view:

- **Mobile / Desktop** switches the frame. It is the same page at two widths.
- **Today is** pretends the date is different. Pick 1 Nov and the whole store turns to Diwali; 28 Nov shows the Quiet Week sale; 20 Feb, when no occasion is close, shows the brand story. The calendar runs the site, so nobody redesigns it for each festival.
- **Notes** opens the panel on the right: what each part is, and why it matters. Tap a note to jump to it on the page; tap a numbered pin to find its note.
- **Build labels** outlines every part and says how it is built: `INTELLECT` (already in our theme), `CUSTOM` (new code for Zariva), `APP`, or `NEEDS INPUT` (waiting on Zariva).
- **Bag** has two views: the bag page, and the bag drawer that slides in from any page.

The pages link to each other and the tabs follow as you click through.

## Try this

1. **Home.** Full-width banners led by the next occasion. Try the **Today is** dates in the bar: the whole store changes.
2. **A hamper.** On The Diya Hamper: choose Grand, switch on **Make it a gift** (the photo gets wrapped), pick a paper, tap the Diwali starter for the note, then Add to bag.
3. **The bag.** The note shows under the hamper; the wrap is its own line.
4. **Checkout.** Enter postcode `2010` and same-day delivery appears. The code `WELCOME10` works.
5. **Loupe.** On The Diya Hamper, Birthday Bloom or Hello, Little One, tap the small video clip on the photograph: watch it unboxed, read reviews, add to the bag without leaving.
6. **Build your own.** Choose a box and fill it; the box fills as you go.

## The direction

The occasion leads. Gift hampers are bought for a day and a person, so the store is organised around when and who, and every hamper says when it will arrive. The site follows the life of a gift, in order: the moment, the person, the hamper, the card, the arrival. Each answer carries forward to the next page, so the journey from the homepage to checkout feels like one act of sending. White does the work, plum marks the one thing to do, and gold is a thin line.

## What is real and what is illustrative

From Zariva's brand guide: the name, the arch-and-diamond mark, the palette and the voice. The type is Intellect's own (Archivo), not a library font.

Illustrative, and marked `NEEDS INPUT` where it matters:

- Every photograph and video is stock (see `../source/hamper-prototype/CREDITS.md`).
- Product names, prices, contents, makers, reviews and ratings are sample content from the first prototype, plus four sample Karva Chauth hampers.
- Occasion dates and order-by dates, delivery rates and same-day areas are samples.
- The studio location (Alexandria, Sydney), contact details and the founder's story are placeholders.
- Loupe's clips, chapters and reviews on three hampers are samples.

## The top three questions

1. **The name:** House of Zariva or House of Zavira? The brand guide says Zariva.
2. **Karva Chauth:** it falls on Thursday 29 October 2026, before a November launch. Launch earlier, or start with Diwali?
3. **The calendar:** which occasions Zariva will sell for, with their dates and order-by dates.

The rest are in the Questions tab.

## Files

```
index.html               the presentation (tabs, frames, notes, the date switch)
shell/data.js            pages, notes and dates for the presentation
site/                    the store: one page per Shopify template
site/assets/intellect/   Intellect's own CSS, JS and fonts, copied from the theme (tools/build-intellect.mjs)
site/assets/zariva/      the Zariva layer: catalogue, section templates, a stand-in for Shopify's cart and section APIs
docs/                    Brand, Build plan, Questions
tools/                   scripts that build and bundle the prototype (not deployed); tools/archive-v1 is the first draft
```

To rebuild after changing Intellect: `node tools/build-intellect.mjs && node tools/bundle.mjs` from this folder.
