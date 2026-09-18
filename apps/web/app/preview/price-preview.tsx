"use client";

import { useState } from "react";
import { PriceExperience } from "@/components/price-experience";
import type { PriceDisplayState } from "@/lib/use-prices";

const samples: Record<string, PriceDisplayState> = {
  available: {
    status: "available",
    quote: {
      buyPerGram: 10_485_000,
      sellPerGram: 10_380_000,
      currency: "TOMAN",
      unit: "gram",
      purity: "750",
      updatedAt: "2026-09-17T08:30:00Z",
      validUntil: "2026-09-17T08:31:00Z",
      source: "داده نمونه برای بررسی طراحی",
    },
  },
  stale: { status: "stale", updatedAt: "2026-09-17T08:30:00Z" },
  unavailable: { status: "unavailable" },
  loading: { status: "loading" },
};

export function PricePreview() {
  const [mode, setMode] = useState("available");
  return (
    <>
      <aside className="preview-banner" aria-label="پیش‌نمایش طراحی">
        <div>
          <strong>پیش‌نمایش طراحی · قیمت‌ها واقعی نیستند</strong>
          <p>اعداد و زمان ثابت زیر فقط نمونه هستند و برای معامله اعتبار ندارند.</p>
        </div>
        <div className="preview-options" role="group" aria-label="انتخاب وضعیت نمونه">
          {[
            ["available", "به‌روز"],
            ["stale", "قدیمی"],
            ["unavailable", "ناموجود"],
            ["loading", "در حال دریافت"],
          ].map(([value, label]) => (
            <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
              {label}
            </button>
          ))}
        </div>
      </aside>
      <PriceExperience previewState={samples[mode]} />
    </>
  );
}
