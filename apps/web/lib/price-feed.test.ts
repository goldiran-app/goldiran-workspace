import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readPriceFeed } from "./price-feed";

describe("price feed boundary", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("GOLDIRAN_PRICE_FEED_URL", "https://approved.example/quote");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it("does not invent prices or contact a provider when none is configured", async () => {
    vi.stubEnv("GOLDIRAN_PRICE_FEED_URL", "");
    expect(await readPriceFeed()).toEqual({ status: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches uncached data and preserves approved current amounts", async () => {
    const now = Date.now();
    const quote = {
      buyPerGram: 100,
      sellPerGram: 90,
      currency: "TOMAN",
      unit: "gram",
      purity: "750",
      source: "Approved",
      updatedAt: new Date(now).toISOString(),
      validUntil: new Date(now + 30_000).toISOString(),
    };
    fetchMock.mockResolvedValue(Response.json(quote));
    expect(await readPriceFeed()).toEqual({ status: "available", quote });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://approved.example/quote",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
    );
  });

  it.each([
    new Response("failure", { status: 503 }),
    new Response("not json"),
    Response.json({ buyPerGram: 100 }),
  ])("withholds failed and malformed responses", async (response) => {
    fetchMock.mockResolvedValue(response);
    expect(await readPriceFeed()).toEqual({ status: "unavailable" });
    expect(console.warn).toHaveBeenCalled();
  });

  it("handles a network failure without exposing endpoint credentials", async () => {
    fetchMock.mockRejectedValue(new Error("secret-endpoint"));
    expect(await readPriceFeed()).toEqual({ status: "unavailable" });
    expect(console.warn).toHaveBeenCalledWith("Goldiran price feed could not be read");
  });
});
