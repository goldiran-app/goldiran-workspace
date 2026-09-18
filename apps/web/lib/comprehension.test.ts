import { describe, expect, it } from "vitest";
import { comprehensionTasks, expectedAnswers, sampleStates } from "./comprehension";
import { formatPrice, formatTimestamp } from "./prices";
import { priceCopy } from "./price-copy";

describe("customer comprehension protocol", () => {
  it("covers pay, receive, unit, timestamp, and trade-availability questions", () => {
    expect(comprehensionTasks.map((task) => task.id)).toEqual([
      "pay-per-gram",
      "receive-per-gram",
      "unit-and-purity",
      "last-update",
      "trade-availability",
    ]);
  });

  it("answers available-state questions with customer-perspective amounts and Tehran time", () => {
    const answers = expectedAnswers(sampleStates.available);
    expect(answers["pay-per-gram"]).toBe(
      `${formatPrice(10_485_000)} ${priceCopy.unit} ${priceCopy.unitDetail}`,
    );
    expect(answers["receive-per-gram"]).toBe(
      `${formatPrice(10_380_000)} ${priceCopy.unit} ${priceCopy.unitDetail}`,
    );
    expect(answers["unit-and-purity"]).toBe(priceCopy.unitAnswer);
    expect(answers["last-update"]).toBe(
      `${formatTimestamp(sampleStates.available.quote.updatedAt)} · ${priceCopy.timezone}`,
    );
    expect(answers["trade-availability"]).toContain("ثبت سفارش هنوز فعال نیست");
  });

  it.each(["stale", "unavailable", "loading"] as const)(
    "tells customers they cannot trade in the %s state",
    (mode) => {
      const answers = expectedAnswers(sampleStates[mode]);
      expect(answers["trade-availability"].startsWith("خیر.")).toBe(true);
      expect(answers["pay-per-gram"]).not.toContain("۱۰٬۴۸۵٬۰۰۰");
      expect(answers["receive-per-gram"]).not.toContain("۱۰٬۳۸۰٬۰۰۰");
    },
  );
});
