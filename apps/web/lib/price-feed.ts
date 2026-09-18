import { parseQuote, type PriceSnapshot } from "./prices";

export async function readPriceFeed(): Promise<PriceSnapshot> {
  const endpoint = process.env.GOLDIRAN_PRICE_FEED_URL;
  if (!endpoint) return { status: "unavailable" };

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      console.warn("Goldiran price feed HTTP failure", response.status);
      return { status: "unavailable" };
    }
    const result = parseQuote(await response.json());
    if (result.status !== "available") console.warn("Goldiran price withheld", result.status);
    return result;
  } catch {
    // Do not log the endpoint, response body, or credentials from a configured feed.
    console.warn("Goldiran price feed could not be read");
    return { status: "unavailable" };
  }
}
