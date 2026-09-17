// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrices } from "./use-prices";

const now = Date.parse("2026-09-17T08:30:00Z");
const quote = {
  buyPerGram: 100,
  sellPerGram: 90,
  currency: "TOMAN",
  unit: "gram",
  purity: "750",
  source: "Approved",
  updatedAt: new Date(now).toISOString(),
  validUntil: new Date(now + 60_000).toISOString(),
};
const currentResponse = () => Response.json({ status: "available", quote });

describe("customer price lifecycle", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("loads prices and refreshes every 15 seconds only while visible", async () => {
    fetchMock.mockImplementation(currentResponse);
    const { result } = renderHook(() => usePrices());
    expect(result.current.snapshot.status).toBe("loading");
    await act(async () => {});
    expect(result.current.snapshot).toEqual({ status: "available", quote });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("removes expired amounts even when a refresh is still pending", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        status: "available",
        quote: { ...quote, validUntil: new Date(now + 2_000).toISOString() },
      }),
    );
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => usePrices());
    await act(async () => {});
    act(() => {
      void result.current.refresh();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(result.current.snapshot).toEqual({ status: "stale", updatedAt: quote.updatedAt });
  });

  it("withholds a previous quote on failure and recovers on manual retry", async () => {
    fetchMock.mockImplementation(currentResponse);
    const { result } = renderHook(() => usePrices());
    await act(async () => {});
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.snapshot).toEqual({ status: "unavailable" });
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.snapshot.status).toBe("available");
  });

  it("times out hung requests and permits a retry", async () => {
    fetchMock.mockImplementationOnce(
      (_url, { signal }: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const { result } = renderHook(() => usePrices());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });
    expect(result.current.snapshot.status).toBe("unavailable");
    expect(result.current.refreshing).toBe(false);
    fetchMock.mockImplementation(currentResponse);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.snapshot.status).toBe("available");
  });

  it("expires a quote immediately when returning from a throttled background tab", async () => {
    fetchMock.mockImplementationOnce(currentResponse);
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => usePrices());
    await act(async () => {});
    vi.setSystemTime(now + 61_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current.snapshot).toEqual({ status: "stale", updatedAt: quote.updatedAt });
  });

  it("does not poll in the isolated design preview", async () => {
    renderHook(() => usePrices(false));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aborts the pending request and stops polling on unmount", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {}));
    const { unmount } = renderHook(() => usePrices());
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
