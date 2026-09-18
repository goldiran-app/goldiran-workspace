"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseSnapshot, REFRESH_INTERVAL_MS, type PriceDisplayState } from "./prices";

export type { PriceDisplayState };

export function usePrices(enabled = true) {
  const [snapshot, setSnapshot] = useState<PriceDisplayState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    const timeout = setTimeout(() => controller.abort(), 8_000);
    setRefreshing(true);
    try {
      const response = await fetch("/api/prices", {
        cache: "no-store",
        signal: controller.signal,
      });
      const next = response.ok
        ? parseSnapshot(await response.json())
        : { status: "unavailable" as const };
      if (inFlight.current === controller) setSnapshot(next);
    } catch {
      if (inFlight.current === controller) setSnapshot({ status: "unavailable" });
    } finally {
      clearTimeout(timeout);
      if (inFlight.current === controller) {
        inFlight.current = null;
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const resume = () => {
      if (document.visibilityState !== "visible") return;
      // Expire immediately on return, even when a background timer was throttled.
      setSnapshot((current) => (current.status === "available" ? parseSnapshot(current) : current));
      void refresh();
    };
    const interval = setInterval(resume, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      const controller = inFlight.current;
      inFlight.current = null;
      controller?.abort();
    };
  }, [enabled, refresh]);

  useEffect(() => {
    if (snapshot.status !== "available") return;
    const expiry = setTimeout(
      () => {
        setSnapshot({ status: "stale", updatedAt: snapshot.quote.updatedAt });
      },
      Math.max(0, Date.parse(snapshot.quote.validUntil) - Date.now()),
    );
    return () => clearTimeout(expiry);
  }, [snapshot]);

  return { snapshot, refreshing, refresh };
}
