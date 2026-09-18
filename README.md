# Goldiran

The customer-facing Goldiran application, beginning with a clear view of the buy and sell price per gram before a customer trades. The home page is Persian and right-to-left, with customer-perspective labels, toman amounts, 18-karat gold units, a Tehran timestamp, and explicit loading, stale, and unavailable states.

This repository is the product foundation for **Deliver Live Gold Pricing**. The unrelated project/initiative/issue management starter, its Go CRUD API, database schema, and seed data have been removed. The app now uses Next.js App Router, React, TypeScript, and a same-origin price endpoint; no database is needed for this slice.

## Run locally

Use Node.js 22+ and pnpm 9.15.0:

```bash
pnpm install --frozen-lockfile
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

Open http://localhost:3000. Without an approved price feed, the page intentionally shows that prices are unavailable. It never substitutes sample prices on the customer route.

For design review and GOL-10 comprehension sessions, set `GOLDIRAN_ENABLE_PREVIEW=true` in `apps/web/.env.local`, restart the app, and open http://localhost:3000/preview. This opt-in route has a persistent sample-data banner, controls for all four display states, and the customer questions to ask. Its fixed amounts and timestamps are illustrative, not market data. Leave it disabled in customer deployments. See [the comprehension protocol](docs/customer-comprehension.md).

## Price data

`GET /api/prices` returns a validated, uncached price snapshot. Set the server-only `GOLDIRAN_PRICE_FEED_URL` to an approved endpoint returning the normalized quote described in [the presentation specification](docs/price-presentation.md). No provider has been selected in the product context yet. This adapter consumes already calculated prices; source normalization, spreads, fees, and trading execution are separate work.

The browser checks every 15 seconds while visible and supports manual refresh. Both amounts disappear on an invalid response, failed refresh, or expiry. The quote timestamp comes from the feed and never changes merely because the page refreshed. Provisional defaults of 18-karat gold, toman, and a maximum age of 60 seconds need confirmation before launch.

## Validate

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm --filter web build
```

Tests cover amount/unit validation, expiry boundaries, source failures, formatting, automatic and manual refresh, request timeout, background-tab expiry, cleanup, and the five customer comprehension questions (pay, receive, unit, timestamp, trade availability). CI runs these checks and a production build.

## Docker

```bash
docker compose up --build
```

Open http://localhost:3000. Set `GOLDIRAN_PRICE_FEED_URL` and optionally `GOLDIRAN_ENABLE_PREVIEW` in the shell or the root Compose `.env`; Compose passes them to the app at runtime. The former starter database is no longer used. Existing Docker volumes are not modified or deleted.

## Product scope

The current slice defines the price presentation and the customer comprehension check for those prices. It does not place orders, lock prices, or claim that a displayed price includes final transaction fees. There are no charts, historical analytics, alerts, account balances, or invented trading activity. See [the specification](docs/price-presentation.md) and [the comprehension protocol](docs/customer-comprehension.md) for decisions, acceptance criteria, and the remaining source-integration and trade-journey work.

## License

MIT
