# Customer comprehension of live prices

GOL-10 asks whether customers can understand the current price and whether it is available for a trade. This protocol is the acceptance check for that question. It uses the opt-in `/preview` walkthrough, not the customer route.

Charts, alerts, history, and order placement remain out of scope. Do not ask customers to complete a trade.

## What must be understandable

A customer looking at the page, without coaching, should be able to answer:

1. What they would **pay** Goldiran for one gram.
2. What they would **receive** from Goldiran for one gram.
3. That the unit is **toman per gram** of **18-karat / 750** gold.
4. **When** the source last published the price, in **Tehran** time.
5. Whether they can **rely on this quote for a trade** right now, including stale and unavailable states.

Pass: the customer names the visible amount or correctly says none is shown, names the unit, names the timestamp or that it is missing, and refuses to treat stale or unavailable quotes as tradable.

## How to run a session

1. Enable `GOLDIRAN_ENABLE_PREVIEW=true` and open `/preview`. Leave the customer route unused so sample amounts cannot be mistaken for a live feed.
2. Tell the participant the numbers are fictional and only for understanding the screen.
3. For each state — current, expired, unavailable, then loading — hide expected answers, ask the five questions, then score.
4. Reveal expected answers only after the participant has answered. Switch state with the preview controls; do not refresh the customer endpoint.

Ask the questions in Persian, as shown on the research panel. Do not point at cards, timestamps, or notices until after the answer.

## Scoring

Record each question as correct, partial, or failed.

| State | Pay / receive | Unit | Timestamp | Trade availability |
| --- | --- | --- | --- | --- |
| Current | Names both toman-per-gram amounts from the customer’s perspective | Toman, one gram, 18-karat | Names the source time in Tehran, not page-load time | Says the quote is visible but not an order |
| Expired | Says amounts are withheld | Still names the unit | Names the last source time and that it is expired | Says they cannot trade on it |
| Unavailable | Says no valid amount is shown | Still names the unit | Says no source time is available | Says they cannot trade on it |
| Loading | Says amounts are not ready | Still names the unit | Says the source time is not available yet | Says they cannot trade yet |

A state fails if the participant uses shop-perspective buy/sell, invents an amount, treats page refresh as the quote time, or tries to proceed on an expired or missing quote.

## Presentation checks this protocol depends on

The page must keep these facts readable without color as the only cue:

- **Buy** is what the customer pays; **sell** is what the customer receives.
- Missing amounts read «قیمت موجود نیست», not a dash or a zero.
- The timestamp is labeled as the **source** time, in Tehran, and expired quotes keep that time while saying it is not tradable.
- Each state answers «آیا می‌توان معامله کرد؟» in plain language. Order actions stay absent.

Automated tests in `apps/web/components/price-experience.test.tsx` and `apps/web/lib/comprehension.test.ts` encode the same five questions. They are a regression net, not a substitute for a session with customers.

## Findings from the first walkthrough

An expert walkthrough of the GOL-11 presentation found the buy/sell cards and repeated unit labels were already answerable. Three gaps blocked GOL-10:

1. Withheld amounts used an em dash, so sighted readers could not say whether a price was missing.
2. «آخرین به‌روزرسانی» could be read as the time the page loaded rather than the source quote time.
3. Stale and unavailable notices explained why amounts were hidden, but did not answer whether a trade was possible.

The current page states those three facts in the price cards, timestamp block, and trade-availability line. Remaining live research is to run this script with customers before trading is implemented. Do not treat this walkthrough as a substitute for those sessions.
