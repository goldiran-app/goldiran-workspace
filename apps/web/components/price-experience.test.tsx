// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PriceExperience } from "./price-experience";
import { expectedAnswers, sampleQuote, sampleStates } from "../lib/comprehension";
import { formatTimestamp } from "../lib/prices";
import { priceCopy } from "../lib/price-copy";

afterEach(cleanup);

describe("customer comprehension of live prices", () => {
  it("lets a customer name the pay and receive amounts, unit, and source timestamp", () => {
    render(<PriceExperience previewState={sampleStates.available} />);
    const buy = within(screen.getByRole("article", { name: priceCopy.sides.buy.title }));
    const sell = within(screen.getByRole("article", { name: priceCopy.sides.sell.title }));
    const answers = expectedAnswers(sampleStates.available);

    expect(buy.getByText("۱۰٬۴۸۵٬۰۰۰")).toBeTruthy();
    expect(buy.getByText(priceCopy.sides.buy.kicker)).toBeTruthy();
    expect(buy.getByText(priceCopy.sides.buy.description)).toBeTruthy();
    expect(sell.getByText("۱۰٬۳۸۰٬۰۰۰")).toBeTruthy();
    expect(sell.getByText(priceCopy.sides.sell.kicker)).toBeTruthy();
    expect(sell.getByText(priceCopy.sides.sell.description)).toBeTruthy();
    expect(buy.getByText(priceCopy.unit)).toBeTruthy();
    expect(sell.getByText(priceCopy.unit)).toBeTruthy();
    expect(buy.getByText(priceCopy.unitDetail)).toBeTruthy();
    expect(sell.getByText(priceCopy.unitDetail)).toBeTruthy();
    expect(screen.getByText(priceCopy.gold)).toBeTruthy();
    expect(screen.getByText(priceCopy.timestampLabel)).toBeTruthy();
    expect(screen.getByText(formatTimestamp(sampleQuote.updatedAt))).toBeTruthy();
    expect(screen.getByText(new RegExp(priceCopy.timezone))).toBeTruthy();
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(sampleQuote.updatedAt);
    expect(screen.getByText(priceCopy.tradeQuestion)).toBeTruthy();
    expect(screen.getByText(priceCopy.statuses.available.trade)).toBeTruthy();
    expect(answers["pay-per-gram"]).toContain("۱۰٬۴۸۵٬۰۰۰");
    expect(answers["receive-per-gram"]).toContain("۱۰٬۳۸۰٬۰۰۰");
  });

  it("explains stale quotes cannot be used for a trade and keeps the last source time", () => {
    render(<PriceExperience previewState={sampleStates.stale} />);
    expect(screen.getAllByText(priceCopy.missingAmount)).toHaveLength(2);
    expect(screen.queryByText("۱۰٬۴۸۵٬۰۰۰")).toBeNull();
    expect(screen.getByText(priceCopy.statuses.stale.label)).toBeTruthy();
    expect(screen.getByText(priceCopy.statuses.stale.trade)).toBeTruthy();
    expect(screen.getByText(priceCopy.staleTimestampNote)).toBeTruthy();
    expect(screen.getByText(formatTimestamp(sampleQuote.updatedAt))).toBeTruthy();
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(sampleQuote.updatedAt);
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });

  it("explains unavailable prices have no tradable amount or source time", () => {
    render(<PriceExperience previewState={sampleStates.unavailable} />);
    expect(screen.getAllByText(priceCopy.missingAmount)).toHaveLength(2);
    expect(screen.getByText(priceCopy.timestampPending)).toBeTruthy();
    expect(screen.getByText(priceCopy.statuses.unavailable.trade)).toBeTruthy();
    expect(document.querySelector("time")).toBeNull();
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });

  it("withholds amounts while loading and says a trade is not possible yet", () => {
    render(<PriceExperience previewState={sampleStates.loading} />);
    expect(screen.queryByText("۱۰٬۴۸۵٬۰۰۰")).toBeNull();
    expect(screen.queryByText(priceCopy.missingAmount)).toBeNull();
    expect(screen.getByText(priceCopy.statuses.loading.trade)).toBeTruthy();
    expect(screen.getByText(priceCopy.timestampPending)).toBeTruthy();
  });
});
