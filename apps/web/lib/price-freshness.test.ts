import { describe, expect, it } from "vitest";
import { formatTimestamp } from "./prices";
import { freshnessCopy, freshnessView } from "./price-freshness";

const quote = {
  buyPerGram: 10_485_000,
  sellPerGram: 10_380_000,
  currency: "TOMAN" as const,
  unit: "gram" as const,
  purity: "750" as const,
  source: "Approved feed",
  updatedAt: "2026-09-17T08:30:00Z",
  validUntil: "2026-09-17T08:31:00Z",
};

describe("live price freshness presentation", () => {
  it("shows the source timestamp, Tehran timezone, source label, and refresh cadence when prices are available", () => {
    const view = freshnessView({ status: "available", quote });

    expect(view.amountsVisible).toBe(true);
    expect(view.updatedAt).toBe(quote.updatedAt);
    expect(view.timestampText).toBe(formatTimestamp(quote.updatedAt));
    expect(view.timestampNote).toBe(freshnessCopy.timestampSourceNote);
    expect(view.source).toBe("Approved feed");
    expect(view.refreshContext).toContain(freshnessCopy.refreshContext);
    expect(view.refreshContext).toContain("Approved feed");
    expect(view.label).toBe(freshnessCopy.statuses.available.label);
  });

  it("withholds amounts for a stale quote, keeps the last source time, and explains expiry", () => {
    const view = freshnessView({ status: "stale", updatedAt: quote.updatedAt });

    expect(view.amountsVisible).toBe(false);
    expect(view.updatedAt).toBe(quote.updatedAt);
    expect(view.timestampText).toBe(formatTimestamp(quote.updatedAt));
    expect(view.timestampNote).toBe(freshnessCopy.staleTimestampNote);
    expect(view.source).toBeNull();
    expect(view.refreshContext).toBe(freshnessCopy.refreshContext);
    expect(view.label).toBe(freshnessCopy.statuses.stale.label);
    expect(view.description).toContain("قدیمی");
  });

  it("withholds amounts when unavailable and does not invent a source timestamp", () => {
    const view = freshnessView({ status: "unavailable" });

    expect(view.amountsVisible).toBe(false);
    expect(view.updatedAt).toBeNull();
    expect(view.timestampText).toBe(freshnessCopy.timestampPending);
    expect(view.timestampNote).toBeNull();
    expect(view.source).toBeNull();
    expect(view.refreshContext).toBe(freshnessCopy.refreshContext);
    expect(view.label).toBe(freshnessCopy.statuses.unavailable.label);
    expect(view.description).toMatch(/معتبر/);
  });

  it("explains loading without showing a timestamp or tradable amount", () => {
    const view = freshnessView({ status: "loading" });

    expect(view.amountsVisible).toBe(false);
    expect(view.updatedAt).toBeNull();
    expect(view.timestampText).toBe(freshnessCopy.timestampPending);
    expect(view.timestampNote).toBeNull();
    expect(view.refreshContext).toBe(freshnessCopy.refreshContext);
    expect(view.label).toBe(freshnessCopy.statuses.loading.label);
  });
});
