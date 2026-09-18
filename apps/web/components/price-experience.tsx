"use client";

import { formatPrice, formatTimestamp } from "@/lib/prices";
import { priceCopy } from "@/lib/price-copy";
import { usePrices, type PriceDisplayState } from "@/lib/use-prices";

const sides = ["buy", "sell"] as const;

export function PriceExperience({ previewState }: { previewState?: PriceDisplayState }) {
  const { snapshot, refreshing, refresh } = usePrices(previewState === undefined);
  const state = previewState ?? snapshot;
  const copy = priceCopy.statuses[state.status];
  const quote = state.status === "available" ? state.quote : null;
  const updatedAt = quote?.updatedAt ?? (state.status === "stale" ? state.updatedAt : null);

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" /> پیش از معامله، با آگاهی
          </p>
          <h1 id="page-title">
            قیمت هر گرم <span>طلا</span>
          </h1>
          <p className="intro-description">
            قیمت خرید و فروش را روشن ببینید، زمان آن را بشناسید، و بدانید آیا برای معامله قابل
            اعتماد است.
          </p>
        </div>
        <div className="gold-spec">
          <span className="gold-symbol" aria-hidden="true">
            Au
          </span>
          <div>
            <strong>{priceCopy.gold}</strong>
            <span>{priceCopy.goldDetail}</span>
          </div>
        </div>
      </section>

      <section id="prices" className="price-board" aria-label="قیمت خرید و فروش طلا">
        <div className="board-heading">
          <div className={`status-badge status-${state.status}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            {copy.label}
          </div>
          <span className="board-unit">{priceCopy.boardUnit}</span>
        </div>
        <div className="price-grid" aria-busy={state.status === "loading"}>
          {sides.map((side) => {
            const amount = quote ? (side === "buy" ? quote.buyPerGram : quote.sellPerGram) : null;
            const sideCopy = priceCopy.sides[side];
            return (
              <article
                className={`price-card ${side}`}
                key={side}
                aria-labelledby={`${side}-title`}
              >
                <div className="card-heading">
                  <span className="direction-icon" aria-hidden="true">
                    {side === "buy" ? "↙" : "↗"}
                  </span>
                  <span className="card-kicker">{sideCopy.kicker}</span>
                </div>
                <h2 id={`${side}-title`}>{sideCopy.title}</h2>
                <p className="price-amount">
                  {state.status === "loading" ? (
                    <span className="price-skeleton" />
                  ) : amount === null ? (
                    <span className="price-missing">{priceCopy.missingAmount}</span>
                  ) : (
                    <bdi>{formatPrice(amount)}</bdi>
                  )}
                </p>
                <p className="price-unit">
                  {priceCopy.unit} <span>{priceCopy.unitDetail}</span>
                </p>
                <div className="card-rule" />
                <p className="card-description">{sideCopy.description}</p>
              </article>
            );
          })}
        </div>
        <div className="refresh-row">
          <div className="timestamp-block">
            <span className="clock-icon" aria-hidden="true">
              ◷
            </span>
            <div>
              <p className="timestamp-label" id="price-timestamp-label">
                {priceCopy.timestampLabel}
              </p>
              <p>
                {updatedAt ? (
                  <>
                    <time dateTime={updatedAt} aria-labelledby="price-timestamp-label">
                      {formatTimestamp(updatedAt)}
                    </time>
                    <span className="timezone"> · {priceCopy.timezone}</span>
                  </>
                ) : (
                  priceCopy.timestampPending
                )}
              </p>
              <p className="refresh-context">
                {state.status === "stale"
                  ? priceCopy.staleTimestampNote
                  : priceCopy.timestampSourceNote}
              </p>
              <p className="refresh-context">
                {quote ? `منبع: ${quote.source} · ` : ""}
                {priceCopy.refreshContext}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => void refresh()}
            disabled={refreshing || previewState !== undefined}
          >
            <span aria-hidden="true">↻</span>
            {previewState !== undefined
              ? "نمونه نمایشی"
              : refreshing
                ? "در حال بررسی…"
                : "به‌روزرسانی قیمت"}
          </button>
        </div>
        <div className={`price-notice notice-${state.status}`}>
          <span className="notice-icon" aria-hidden="true">
            {state.status === "available" ? "✓" : "i"}
          </span>
          <div>
            <h3>{copy.title}</h3>
            <p>{copy.description}</p>
            <p className="trade-availability">
              <strong>{priceCopy.tradeQuestion}</strong> {copy.trade}
            </p>
          </div>
        </div>
      </section>

      <p className="trading-note">
        این صفحه برای مشاهده قیمت است. ثبت سفارش خرید و فروش هنوز فعال نیست.
      </p>

      <section id="guide" className="guide" aria-labelledby="guide-title">
        <div className="guide-heading">
          <p className="eyebrow">راهنمای قیمت‌ها</p>
          <h2 id="guide-title">هر عدد، چه معنایی دارد؟</h2>
          <p>چند نکته پیش از تصمیم‌گیری برای خرید یا فروش طلا.</p>
        </div>
        <div className="guide-items">
          <details open>
            <summary>
              تفاوت قیمت خرید و فروش چیست؟<span aria-hidden="true">+</span>
            </summary>
            <p>
              «{priceCopy.sides.buy.title}» مبلغ پرداختی شما به گلدایران است. «
              {priceCopy.sides.sell.title}» مبلغ دریافتی شما از گلدایران است. این دو قیمت ممکن است
              متفاوت باشند.
            </p>
          </details>
          <details>
            <summary>
              قیمت برای چه مقدار و چه عیاری است؟<span aria-hidden="true">+</span>
            </summary>
            <p>{priceCopy.unitAnswer} هر تومان برابر با ۱۰ ریال است.</p>
          </details>
          <details>
            <summary>
              آیا قیمت نمایش‌داده‌شده قطعی است؟<span aria-hidden="true">+</span>
            </summary>
            <p>
              قیمت طلا تغییر می‌کند. مشاهده قیمت به معنی رزرو آن یا ثبت سفارش نیست. مبلغ نهایی و
              هرگونه هزینه باید پیش از تأیید سفارش مشخص شوند.
            </p>
          </details>
          <details>
            <summary>
              اگر قیمت به‌روز نباشد چه می‌شود؟<span aria-hidden="true">+</span>
            </summary>
            <p>
              قیمت قدیمی یا نامعتبر نمایش داده نمی‌شود و برای معامله اعتبار ندارد. زمان آخرین قیمت
              منبع، در صورت وجود، باقی می‌ماند. برای دیدن قیمت معتبر از «به‌روزرسانی قیمت» استفاده
              کنید.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
