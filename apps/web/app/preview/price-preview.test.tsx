// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PricePreview } from "./price-preview";
import { expectedAnswers, sampleStates } from "@/lib/comprehension";
import { priceCopy } from "@/lib/price-copy";

afterEach(cleanup);

it("walks a research session through each price state with expected answers hidden by default", () => {
  render(<PricePreview />);
  expect(screen.getByRole("heading", { name: "پرسش‌های درک مشتری" })).toBeTruthy();
  expect(screen.getByText(priceCopy.sides.buy.title)).toBeTruthy();
  expect(screen.getByText("۱۰٬۴۸۵٬۰۰۰")).toBeTruthy();
  expect(screen.queryByText(expectedAnswers(sampleStates.available)["pay-per-gram"])).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "نمایش پاسخ‌های مورد انتظار" }));
  expect(screen.getByText(expectedAnswers(sampleStates.available)["pay-per-gram"])).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "پنهان کردن پاسخ‌ها" }));

  fireEvent.click(screen.getByRole("button", { name: "منقضی" }));
  expect(screen.getAllByText(priceCopy.missingAmount)).toHaveLength(2);
  expect(screen.getByText(priceCopy.statuses.stale.trade)).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "ناموجود" }));
  expect(screen.getByText(priceCopy.statuses.unavailable.trade)).toBeTruthy();
  expect(screen.getByText(priceCopy.timestampPending)).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "در حال دریافت" }));
  expect(screen.getByText(priceCopy.statuses.loading.trade)).toBeTruthy();
});
