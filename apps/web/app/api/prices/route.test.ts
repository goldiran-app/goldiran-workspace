import { afterEach, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.unstubAllEnvs());

it("returns an uncached unavailable state without an approved feed", async () => {
  vi.stubEnv("GOLDIRAN_PRICE_FEED_URL", "");
  const response = await GET();
  expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  expect(await response.json()).toEqual({ status: "unavailable" });
});
