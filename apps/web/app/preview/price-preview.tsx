"use client";

import { useState } from "react";
import { PriceExperience } from "@/components/price-experience";
import { sampleStates, type SampleMode } from "@/lib/comprehension";
import { ComprehensionPanel } from "./comprehension-panel";

const modes: Array<[SampleMode, string]> = [
  ["available", "به‌روز"],
  ["stale", "منقضی"],
  ["unavailable", "ناموجود"],
  ["loading", "در حال دریافت"],
];

export function PricePreview() {
  const [mode, setMode] = useState<SampleMode>("available");
  const previewState = sampleStates[mode];

  return (
    <>
      <aside className="preview-banner" aria-label="پیش‌نمایش طراحی">
        <div>
          <strong>پیش‌نمایش پژوهش · قیمت‌ها واقعی نیستند</strong>
          <p>
            اعداد و زمان ثابت زیر فقط نمونه هستند. هر وضعیت را انتخاب کنید و سؤال‌های درک مشتری را
            بپرسید.
          </p>
        </div>
        <div className="preview-options" role="group" aria-label="انتخاب وضعیت نمونه">
          {modes.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </aside>
      <PriceExperience previewState={previewState} />
      <ComprehensionPanel state={previewState} />
    </>
  );
}
