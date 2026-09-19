// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PriceExperience } from "./price-experience";
import type { PriceDisplayState } from "../lib/use-prices";

afterEach(cleanup);

describe("customer price presentation", () => {
  it("pairs each customer perspective with the correct amount and repeats the unit", () => {
    render(
      <PriceExperience
        previewState={{
          status: "available",
          quote: {
            buyPerGram: 10_485_000,
            sellPerGram: 10_380_000,
            currency: "TOMAN",
            unit: "gram",
            purity: "750",
            source: "Sample",
            updatedAt: "2026-09-17T08:30:00Z",
            validUntil: "2026-09-17T08:31:00Z",
          },
        }}
      />,
    );
    const buy = within(screen.getByRole("article", { name: "قیمت خرید شما" }));
    const sell = within(screen.getByRole("article", { name: "قیمت فروش شما" }));
    expect(buy.getByText("۱۰٬۴۸۵٬۰۰۰")).toBeTruthy();
    expect(buy.getByText("از گلدایران می‌خرید")).toBeTruthy();
    expect(sell.getByText("۱۰٬۳۸۰٬۰۰۰")).toBeTruthy();
    expect(sell.getByText("به گلدایران می‌فروشید")).toBeTruthy();
    expect(buy.getByText("تومان")).toBeTruthy();
    expect(sell.getByText("تومان")).toBeTruthy();
    expect(buy.getByText("/ هر گرم")).toBeTruthy();
    expect(sell.getByText("/ هر گرم")).toBeTruthy();
    expect(screen.getByText("طلای ۱۸ عیار")).toBeTruthy();
    expect(screen.getByText("آخرین قیمت دریافتی")).toBeTruthy();
    expect(screen.getByText(/به وقت تهران/)).toBeTruthy();
    expect(screen.getByText(/بررسی خودکار هر ۱۵ ثانیه/)).toBeTruthy();
    expect(screen.getByText(/منبع قیمت: Sample/)).toBeTruthy();
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-17T08:30:00Z");
  });

  it.each<PriceDisplayState>([
    { status: "loading" },
    { status: "unavailable" },
    { status: "stale", updatedAt: "2026-09-17T08:30:00Z" },
  ])("withholds amounts in $status state", (previewState) => {
    render(<PriceExperience previewState={previewState} />);
    expect(screen.getAllByText("قیمت موجود نیست")).toHaveLength(2);
    expect(screen.queryByText("۱۰٬۴۸۵٬۰۰۰")).toBeNull();
    expect(screen.getByText(/ثبت سفارش خرید و فروش هنوز فعال نیست/)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBeTruthy();
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });
});
