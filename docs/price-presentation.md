# Per-gram buy and sell price presentation

This specification and the `/preview` implementation establish the first customer-facing slice of Goldiran for GOL-11. The repository is explicitly repurposed from the disposable workspace starter.

## Product context

- [Deliver Live Gold Pricing](https://linear.app/goldiran/initiative/deliver-live-gold-pricing-ef8680e104fd): customers understand current buy/sell prices before a trade.
- [Customer Live Price Experience — MVP UX Brief](https://linear.app/goldiran/document/customer-live-price-experience-mvp-ux-brief-6527526532ff): separate per-gram prices, local labels/units, visible timestamp, and no invitation to trade on uncertain prices.
- [MVP Pricing Engine and Safeguards — Product Spec](https://linear.app/goldiran/document/mvp-pricing-engine-and-safeguards-product-spec-8905bf9dce47): publish only valid, fresh prices; preserve the timestamp; withhold missing, invalid, or stale data.
- [Price Source Integration — MVP Delivery Notes](https://linear.app/goldiran/document/price-source-integration-mvp-delivery-notes-d90ec335dc3b): the approved source, normalization method, and refresh expectation are still decisions to make.

Charts, history, alerts, and watchlists are outside the MVP. GOL-5/6 concern timestamp and state design, GOL-7 source connection, GOL-8/9 implementation, and GOL-10 customer comprehension validation. This foundation supplies basic responsive and failure handling so the initial presentation can be reviewed coherently; it does not claim provider integration or customer research is complete.

## Presentation decisions

| Element | Customer presentation |
| --- | --- |
| Buy | **قیمت خرید شما** / **از گلدایران می‌خرید** — what the customer pays for one gram |
| Sell | **قیمت فروش شما** / **به گلدایران می‌فروشید** — what the customer receives for one gram |
| Unit | Repeat **تومان / هر گرم** in each card; never leave the denomination implicit |
| Gold | **طلای ۱۸ عیار**, purity **۷۵۰**, shared by both cards |
| Number | Persian digits, thousands separators, no abbreviated millions or silent currency conversions |
| Layout | Buy first in RTL reading order, sell next; two equal cards on desktop and stacked cards on narrow screens |
| Distinction | Explicit text and direction icons in addition to subtle green/gold backgrounds; color is not the only cue |
| Timestamp | Full Persian calendar date and time including seconds, explicitly **به وقت تهران**; preserve the feed timestamp |
| Refresh | Manual button plus visible explanation of a 15-second check while the page is visible |
| Price meaning | Informational price, not a reservation or order; fees and final total must be disclosed before a future order confirmation |

**Provisional product assumptions:** 18-karat gold, integer toman amounts, a 15-second polling interval, and a maximum quote age of 60 seconds. These are conservative implementation choices, not decisions recorded in the source briefs. Currency/purity, fee policy, provider selection, normalization, and freshness expectations must be confirmed before launch. A rial or different-purity feed is rejected rather than mislabeled. No exchange rate, spread, or fee is invented by this app.

## States and behavior

| State | Amounts | Context and actions |
| --- | --- | --- |
| Loading | Skeletons, no zero, sample, or «missing» amount | Explain that prices are being received; trade is not possible yet |
| Available | Both validated amounts | Show source timestamp, Tehran timezone, source label, refresh control, and that the quote is informational |
| Stale | Show «قیمت موجود نیست» in place of both amounts | Explain expiry and that the quote is not tradable; retain last source timestamp; allow retry |
| Unavailable | Show «قیمت موجود نیست» in place of both amounts | Explain that no valid price is available or tradable; allow retry |

A failed refresh removes the previous amounts. A quote expires locally even if a request is pending. Returning to a visible tab immediately rechecks expiry and requests an update. Automatic requests pause while the tab is hidden. Browser requests time out after eight seconds; upstream requests time out after five seconds. Requests are not overlapped, and unmounting aborts the current request. Available price expiry is the earlier of the feed's `validUntil` and `updatedAt + 60 seconds`.

There is no trade action in this slice; the page explicitly says order placement is not yet active. Future trade entry must revalidate prices on the server and disclose the final total before confirmation. Browser time and polling are presentation aids, not an order-authorization mechanism.

## Normalized feed contract

The configured server-only endpoint returns a single JSON quote (no envelope):

```json
{
  "buyPerGram": 10485000,
  "sellPerGram": 10380000,
  "currency": "TOMAN",
  "unit": "gram",
  "purity": "750",
  "updatedAt": "2026-09-17T08:30:00Z",
  "validUntil": "2026-09-17T08:31:00Z",
  "source": "Approved source display name"
}
```

These are illustrative amounts and timestamps. `buyPerGram` and `sellPerGram` must be positive safe integers in toman, from the customer's perspective. The upstream pricing engine owns their calculation. Timestamps must carry a timezone; future publication times and invalid validity intervals are rejected. The source must be a nonempty public display label of at most 120 characters, without private identifiers or credentials.

The app endpoint returns one of:

```ts
{ status: "available", quote: Quote }
{ status: "stale", updatedAt: string }
{ status: "unavailable" }
```

No provider configured, non-success HTTP responses, invalid JSON, timeouts, mismatched units, and malformed quotes all produce `unavailable`. Expired valid quotes produce `stale`. Nonavailable responses carry no amounts. Responses and upstream fetches are uncached. Operational logs identify transport, HTTP, or validation/staleness failures without including the endpoint or response body. The approved source adapter, its authentication, and operational monitoring remain integration work.

## Review and acceptance

Enable `GOLDIRAN_ENABLE_PREVIEW=true` only for design review. `/preview` uses fixed, conspicuously labeled fictional data, does not poll the customer endpoint, and is excluded from indexing. It returns 404 unless explicitly enabled. The `/` route and `/api/prices` never use preview data, including when preview is enabled.

Verify:

- Buy/sell perspective and units are understandable without color cues.
- Both amounts, full timestamp, and refresh context are readable at desktop and mobile widths, including 320px.
- Loading, stale, and unavailable states never display tradable-looking amounts or order actions.
- Keyboard users can reach refresh and expand the guide; status changes are announced without repeatedly announcing prices every poll.
- API and lifecycle tests cover invalid data, expiry, failed requests, retry, and background-tab return.

Customer comprehension validation is GOL-10. The five questions, scoring, and `/preview` research walkthrough are in [the comprehension protocol](customer-comprehension.md). Ask customers to identify what they would pay/receive for one gram, name the unit and last source time, and explain whether they can rely on a stale/unavailable quote before progressing to trading implementation.
