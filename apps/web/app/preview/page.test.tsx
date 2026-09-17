import { afterEach, expect, it, vi } from "vitest";
import PreviewPage from "./page";

afterEach(() => vi.unstubAllEnvs());

it.each(["", "false"])("hides preview unless explicitly opted in (%j)", (value) => {
  vi.stubEnv("GOLDIRAN_ENABLE_PREVIEW", value);
  expect(() => PreviewPage()).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
});

it("allows the isolated preview when explicitly enabled", () => {
  vi.stubEnv("GOLDIRAN_ENABLE_PREVIEW", "true");
  expect(PreviewPage()).toBeTruthy();
});
