// Integer toman per gram of 18-karat (750) gold, from the customer's perspective.
export type Quote = {
  buyPerGram: number;
  sellPerGram: number;
  currency: "TOMAN";
  unit: "gram";
  purity: "750";
  updatedAt: string;
  validUntil: string;
  source: string;
};

export type PriceSnapshot =
  | { status: "available"; quote: Quote }
  | { status: "stale"; updatedAt: string }
  | { status: "unavailable" };

export type PriceDisplayState = PriceSnapshot | { status: "loading" };

// Conservative presentation defaults; confirm with the approved source before launch.
export const MAX_PRICE_AGE_MS = 60_000;
export const REFRESH_INTERVAL_MS = 15_000;

function timestamp(value: unknown): number {
  if (typeof value !== "string" || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return NaN;
  return Date.parse(value);
}

export function parseQuote(value: unknown, now = Date.now()): PriceSnapshot {
  if (!value || typeof value !== "object") return { status: "unavailable" };
  const quote = value as Record<string, unknown>;
  const updatedAt = timestamp(quote.updatedAt);
  const validUntil = timestamp(quote.validUntil);
  if (
    !Number.isSafeInteger(quote.buyPerGram) ||
    !Number.isSafeInteger(quote.sellPerGram) ||
    (quote.buyPerGram as number) <= 0 ||
    (quote.sellPerGram as number) <= 0 ||
    quote.currency !== "TOMAN" ||
    quote.unit !== "gram" ||
    quote.purity !== "750" ||
    typeof quote.source !== "string" ||
    !quote.source.trim() ||
    quote.source.length > 120 ||
    !Number.isFinite(updatedAt) ||
    !Number.isFinite(validUntil) ||
    updatedAt > now ||
    validUntil <= updatedAt
  ) {
    return { status: "unavailable" };
  }
  const expiresAt = Math.min(validUntil, updatedAt + MAX_PRICE_AGE_MS);
  if (now >= expiresAt) return { status: "stale", updatedAt: quote.updatedAt as string };
  return {
    status: "available",
    quote: {
      buyPerGram: quote.buyPerGram as number,
      sellPerGram: quote.sellPerGram as number,
      currency: "TOMAN",
      unit: "gram",
      purity: "750",
      updatedAt: quote.updatedAt as string,
      validUntil: new Date(expiresAt).toISOString(),
      source: quote.source.trim(),
    },
  };
}

// Never render unchecked upstream numbers or timestamps in the browser either.
export function parseSnapshot(value: unknown, now = Date.now()): PriceSnapshot {
  if (!value || typeof value !== "object") return { status: "unavailable" };
  const snapshot = value as Record<string, unknown>;
  if (snapshot.status === "available") return parseQuote(snapshot.quote, now);
  if (snapshot.status === "stale" && timestamp(snapshot.updatedAt) <= now) {
    return { status: "stale", updatedAt: snapshot.updatedAt as string };
  }
  return { status: "unavailable" };
}

export const formatPrice = (amount: number) => new Intl.NumberFormat("fa-IR").format(amount);

export function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
