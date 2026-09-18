"use client";

import { useState } from "react";
import { comprehensionTasks, expectedAnswers } from "@/lib/comprehension";
import type { PriceDisplayState } from "@/lib/use-prices";

export function ComprehensionPanel({ state }: { state: PriceDisplayState }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const answers = expectedAnswers(state);

  return (
    <section className="comprehension-panel" aria-labelledby="comprehension-title">
      <div className="comprehension-heading">
        <div>
          <h2 id="comprehension-title">پرسش‌های درک مشتری</h2>
          <p>
            این بخش فقط برای جلسهٔ پژوهش است. از مشتری بخواهید صفحه را ببیند و بدون راهنمایی به این
            سؤال‌ها پاسخ دهد.
          </p>
        </div>
        <button
          type="button"
          className="comprehension-toggle"
          aria-pressed={showAnswers}
          onClick={() => setShowAnswers((current) => !current)}
        >
          {showAnswers ? "پنهان کردن پاسخ‌ها" : "نمایش پاسخ‌های مورد انتظار"}
        </button>
      </div>
      <ol>
        {comprehensionTasks.map((task) => (
          <li key={task.id}>
            <p>{task.question}</p>
            {showAnswers ? <p className="comprehension-answer">{answers[task.id]}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
