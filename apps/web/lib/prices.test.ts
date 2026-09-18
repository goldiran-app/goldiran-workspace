import { describe, expect, it } from "vitest";
import {
  formatPrice,
  formatTimestamp,
  MAX_PRICE_AGE_MS,
  parseQuote,
  parseSnapshot,
} from "./prices";

const now = Date.parse("2026-09-17T08:30:00Z");
const quote = {
  buyPerGram: 10_485_000,
  sellPerGram: 10_380_000,
  currency: "TOMAN",
  unit: "gram",
  purity: "750",
  source: "Approved feed",
  updatedAt: new Date(now).toISOString(),
  validUntil: new Date(now + 30_000).toISOString(),
};

describe("publishable price contract", () => {
  it("preserves customer buy/sell amounts and the source timestamp without conversion", () => {
    expect(parseQuote(quote, now)).toEqual({ status: "available", quote });
  });

  it.each([
    null,
    {},
    { ...quote, buyPerGram: "10485000" },
    { ...quote, sellPerGram: 0 },
    { ...quote, buyPerGram: -1 },
    { ...quote, buyPerGram: 1.5 },
    { ...quote, sellPerGram: Number.MAX_SAFE_INTEGER + 1 },
    { ...quote, buyPerGram: Infinity },
    { ...quote, currency: "IRR" },
    { ...quote, unit: "ounce" },
    { ...quote, purity: "999" },
    { ...quote, source: " " },
    { ...quote, updatedAt: "invalid" },
    { ...quote, updatedAt: "2026-09-17T08:30:00" },
    { ...quote, updatedAt: new Date(now + 1).toISOString() },
    { ...quote, validUntil: quote.updatedAt },
    { ...quote, validUntil: "invalid" },
  ])("withholds malformed, mismatched, or future-dated input: %j", (input) => {
    expect(parseQuote(input, now)).toEqual({ status: "unavailable" });
  });

  it("withholds both amounts at the exact expiry boundary", () => {
    expect(parseQuote(quote, now + 30_000)).toEqual({
      status: "stale",
      updatedAt: quote.updatedAt,
    });
  });

  it("caps provider validity at the maximum price age", () => {
    const longLived = { ...quote, validUntil: new Date(now + 600_000).toISOString() };
    expect(parseQuote(longLived, now)).toMatchObject({
      quote: { validUntil: new Date(now + MAX_PRICE_AGE_MS).toISOString() },
    });
    expect(parseQuote(longLived, now + MAX_PRICE_AGE_MS)).toEqual({
      status: "stale",
      updatedAt: quote.updatedAt,
    });
  });

  it("revalidates available browser responses and rejects invalid stale timestamps", () => {
    expect(parseSnapshot({ status: "available", quote }, now + 30_000)).toEqual({
      status: "stale",
      updatedAt: quote.updatedAt,
    });
    expect(parseSnapshot({ status: "stale", updatedAt: "invalid" }, now)).toEqual({
      status: "unavailable",
    });
    expect(
      parseSnapshot({ status: "stale", updatedAt: new Date(now + 1).toISOString() }, now),
    ).toEqual({ status: "unavailable" });
  });

  it("uses Persian grouping and Tehran time independently of the host timezone", () => {
    expect(formatPrice(10_485_000)).toBe("۱۰٬۴۸۵٬۰۰۰");
    expect(formatTimestamp(quote.updatedAt)).toContain("۱۲:۰۰:۰۰");
  });
});
