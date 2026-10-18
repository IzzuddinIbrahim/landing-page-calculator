# Landing Page Pricing Calculator

## Open or host
Open `index.html` in a modern browser. Keep `index.html`, `styles.css`, and `scripts.js` together when uploading to your hosting. No build step, backend, API key, CDN, or external font is needed. The separate standalone HTML is the same app bundled into one file for quick local use.

## What changed
- Live, itemised estimate with separate one-time, monthly and annual costs.
- Initial estimate = project work + first support month + first-year annual services.
- Fixed reset and stale quotation totals.
- Testimonial bundle replaces individual testimonial charges.
- Cart and WhatsApp form alternatives replace each other when selected.
- Validated ad hoc hours and maintenance selection; full support only for multiple pages.
- Mobile layout with a compact fixed estimate bar, keyboard-friendly dialogs, and visible focus states.
- Printable quotation preview with client details and project notes. Use Print / Save as PDF in the preview.
- Existing contact, calculator purchase and payment QR links retained as explicit actions.
- Removed automatic WhatsApp opening. No enquiry is sent and no PDF is attached automatically. The user can save the estimate, then attach it in WhatsApp themselves.
- Contact details stay in the current page and are not stored by the app.

## Prices
Your original prices and existing package rules are preserved, including:
- Single page RM80; multiple pages RM400.
- Copywriting: English RM250 / BM RM300 / both RM460.
- Image sourcing RM20; unique design RM50 / RM200.
- Domain RM90/year and hosting RM50/year for a single page.
- Multiple-page selections for hosting/domain have no extra first-year charge, matching the old calculator; renewal prices require confirmation.
- Technical SEO RM150 / on-page RM100 / both RM250. Selected SEO is RM50 when multiple pages or paid copywriting is chosen.
- Ad hoc RM80/hour; basic support RM100/month single or RM300/month multiple; full RM800/month multiple only.
- Original optional feature rates remain unchanged.

Edit the `PRICING` object at the top of `scripts.js` for base/service prices. Feature prices are stored in checkbox `value` attributes and their visible badges in `index.html`; update both together. Update the explanatory price hints as well. Rebuild the standalone file if editing the separate source files.

Additional requests and third-party fees are excluded until separately quoted. This app does not include Google Ads fees or advertising budget options; it remains the uploaded landing-page estimator.

## Validation
17 pricing checks plus browser checks covered desktop, 390px/320px mobile overflow, reset, incompatible selections, plan changes, invalid hours/contact, safe text rendering, quotation preview, print layout, and Escape-to-close. WhatsApp/payment destinations were retained from the original app and were not independently verified or contacted.
## Deployment connection test.