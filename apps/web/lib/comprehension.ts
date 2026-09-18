import { formatPrice, formatTimestamp, type Quote } from "./prices";
import { priceCopy } from "./price-copy";
import type { PriceDisplayState } from "./use-prices";

export const sampleQuote: Quote = {
  buyPerGram: 10_485_000,
  sellPerGram: 10_380_000,
  currency: "TOMAN",
  unit: "gram",
  purity: "750",
  updatedAt: "2026-09-17T08:30:00Z",
  validUntil: "2026-09-17T08:31:00Z",
  source: "داده نمونه برای بررسی طراحی",
};

export const sampleStates = {
  available: { status: "available", quote: sampleQuote },
  stale: { status: "stale", updatedAt: sampleQuote.updatedAt },
  unavailable: { status: "unavailable" },
  loading: { status: "loading" },
} as const satisfies Record<string, PriceDisplayState>;

export type SampleMode = keyof typeof sampleStates;

export const comprehensionTasks = [
  {
    id: "pay-per-gram",
    question: "اگر بخواهید یک گرم طلا از گلدایران بخرید، چه مبلغی می‌پردازید؟",
  },
  {
    id: "receive-per-gram",
    question: "اگر یک گرم طلا به گلدایران بفروشید، چه مبلغی دریافت می‌کنید؟",
  },
  {
    id: "unit-and-purity",
    question: "این مبلغ برای چه مقدار، چه عیار و با چه واحد پولی است؟",
  },
  {
    id: "last-update",
    question: "آخرین قیمت چه زمانی ثبت شده و به وقت کدام شهر است؟",
  },
  {
    id: "trade-availability",
    question: "آیا می‌توانید همین حالا با این قیمت معامله کنید؟ چرا؟",
  },
] as const;

export type ComprehensionTaskId = (typeof comprehensionTasks)[number]["id"];

export function expectedAnswers(state: PriceDisplayState): Record<ComprehensionTaskId, string> {
  switch (state.status) {
    case "available":
      return {
        "pay-per-gram": `${formatPrice(state.quote.buyPerGram)} ${priceCopy.unit} ${priceCopy.unitDetail}`,
        "receive-per-gram": `${formatPrice(state.quote.sellPerGram)} ${priceCopy.unit} ${priceCopy.unitDetail}`,
        "unit-and-purity": priceCopy.unitAnswer,
        "last-update": `${formatTimestamp(state.quote.updatedAt)} · ${priceCopy.timezone}`,
        "trade-availability": priceCopy.statuses.available.trade,
      };
    case "stale":
      return {
        "pay-per-gram": priceCopy.missingAmount,
        "receive-per-gram": priceCopy.missingAmount,
        "unit-and-purity": priceCopy.unitAnswer,
        "last-update": `${formatTimestamp(state.updatedAt)} · ${priceCopy.timezone}. ${priceCopy.staleTimestampNote}`,
        "trade-availability": priceCopy.statuses.stale.trade,
      };
    case "unavailable":
      return {
        "pay-per-gram": priceCopy.missingAmount,
        "receive-per-gram": priceCopy.missingAmount,
        "unit-and-purity": priceCopy.unitAnswer,
        "last-update": priceCopy.timestampPending,
        "trade-availability": priceCopy.statuses.unavailable.trade,
      };
    case "loading":
      return {
        "pay-per-gram": priceCopy.statuses.loading.amountHint,
        "receive-per-gram": priceCopy.statuses.loading.amountHint,
        "unit-and-purity": priceCopy.unitAnswer,
        "last-update": priceCopy.timestampPending,
        "trade-availability": priceCopy.statuses.loading.trade,
      };
    default: {
      const exhaustive: never = state;
      throw new Error(`Unhandled price status: ${JSON.stringify(exhaustive)}`);
    }
  }
}
