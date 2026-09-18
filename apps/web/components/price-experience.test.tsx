// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { formatTimestamp } from "../lib/prices";
import { PriceExperience } from "./price-experience";

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
    expect(screen.getByText(/به وقت تهران/)).toBeTruthy();
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-17T08:30:00Z");
  });

  it("shows source time, Tehran timezone, source label, and refresh context with available prices", () => {
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
    expect(screen.getByText("زمان آخرین قیمت منبع")).toBeTruthy();
    expect(screen.getByText(formatTimestamp("2026-09-17T08:30:00Z"))).toBeTruthy();
    expect(screen.getByText(/به وقت تهران/)).toBeTruthy();
    expect(screen.getByText("این زمان از منبع قیمت است، نه زمان باز شدن صفحه.")).toBeTruthy();
    expect(screen.getByText(/منبع: Sample/)).toBeTruthy();
    expect(screen.getByText(/بررسی خودکار هر ۱۵ ثانیه در زمان باز بودن صفحه/)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("قیمت به‌روز");
  });

  it("explains a stale quote, keeps the last source time, and withholds amounts", () => {
    render(
      <PriceExperience previewState={{ status: "stale", updatedAt: "2026-09-17T08:30:00Z" }} />,
    );
    expect(screen.getAllByText("قیمت موجود نیست")).toHaveLength(2);
    expect(screen.queryByText("۱۰٬۴۸۵٬۰۰۰")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("قیمت منقضی شده است");
    expect(screen.getByText("اعتبار قیمت قبلی به پایان رسیده است")).toBeTruthy();
    expect(
      screen.getByText("این زمان مربوط به قیمت منقضی‌شده است و برای معامله اعتبار ندارد."),
    ).toBeTruthy();
    expect(screen.getByText(formatTimestamp("2026-09-17T08:30:00Z"))).toBeTruthy();
    expect(document.querySelector("time")?.getAttribute("datetime")).toBe("2026-09-17T08:30:00Z");
    expect(screen.getByText(/بررسی خودکار هر ۱۵ ثانیه/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });

  it("explains unavailable prices and does not show a source timestamp", () => {
    render(<PriceExperience previewState={{ status: "unavailable" }} />);
    expect(screen.getAllByText("قیمت موجود نیست")).toHaveLength(2);
    expect(screen.getByRole("status").textContent).toContain("قیمت در دسترس نیست");
    expect(screen.getByText("در حال حاضر قیمت معتبری نداریم")).toBeTruthy();
    expect(screen.getByText("زمان منبع هنوز مشخص نیست.")).toBeTruthy();
    expect(document.querySelector("time")).toBeNull();
    expect(screen.getByText(/بررسی خودکار هر ۱۵ ثانیه/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });

  it("withholds amounts while loading and waits for a source timestamp", () => {
    render(<PriceExperience previewState={{ status: "loading" }} />);
    expect(screen.queryByText("۱۰٬۴۸۵٬۰۰۰")).toBeNull();
    expect(screen.queryByText("قیمت موجود نیست")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("در حال دریافت قیمت");
    expect(screen.getByText("زمان منبع هنوز مشخص نیست.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /خرید|فروش/ })).toBeNull();
  });
});
