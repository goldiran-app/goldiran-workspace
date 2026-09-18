"use client";

import { freshnessCopy, freshnessView } from "@/lib/price-freshness";
import { formatPrice, type PriceDisplayState } from "@/lib/prices";
import { usePrices } from "@/lib/use-prices";

const sides = ["buy", "sell"] as const;

export function PriceExperience({ previewState }: { previewState?: PriceDisplayState }) {
  const { snapshot, refreshing, refresh } = usePrices(previewState === undefined);
  const state = previewState ?? snapshot;
  const freshness = freshnessView(state);
  const quote = state.status === "available" ? state.quote : null;

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
            قیمت خرید و فروش را روشن ببینید، زمان آن را بشناسید، و وضعیت اعتبار قیمت را دنبال کنید.
          </p>
        </div>
        <div className="gold-spec">
          <span className="gold-symbol" aria-hidden="true">
            Au
          </span>
          <div>
            <strong>طلای ۱۸ عیار</strong>
            <span>خلوص ۷۵۰ · مبنای هر دو قیمت</span>
          </div>
        </div>
      </section>

      <section id="prices" className="price-board" aria-label="قیمت خرید و فروش طلا">
        <div className="board-heading">
          <div className={`status-badge status-${freshness.status}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            {freshness.label}
          </div>
          <span className="board-unit">واحد قیمت: تومان / گرم</span>
        </div>
        <div className="price-grid" aria-busy={freshness.status === "loading"}>
          {sides.map((side) => {
            const buy = side === "buy";
            const amount =
              freshness.amountsVisible && quote
                ? buy
                  ? quote.buyPerGram
                  : quote.sellPerGram
                : null;
            return (
              <article
                className={`price-card ${side}`}
                key={side}
                aria-labelledby={`${side}-title`}
              >
                <div className="card-heading">
                  <span className="direction-icon" aria-hidden="true">
                    {buy ? "↙" : "↗"}
                  </span>
                  <span className="card-kicker">
                    {buy ? "از گلدایران می‌خرید" : "به گلدایران می‌فروشید"}
                  </span>
                </div>
                <h2 id={`${side}-title`}>{buy ? "قیمت خرید شما" : "قیمت فروش شما"}</h2>
                <p className="price-amount">
                  {freshness.status === "loading" ? (
                    <span className="price-skeleton" />
                  ) : amount === null ? (
                    <span className="price-missing">{freshnessCopy.missingAmount}</span>
                  ) : (
                    <bdi>{formatPrice(amount)}</bdi>
                  )}
                </p>
                <p className="price-unit">
                  تومان <span>/ هر گرم</span>
                </p>
                <div className="card-rule" />
                <p className="card-description">
                  {buy
                    ? "مبلغی که برای خرید یک گرم طلا می‌پردازید."
                    : "مبلغی که در ازای فروش یک گرم طلا دریافت می‌کنید."}
                </p>
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
                {freshnessCopy.timestampLabel}
              </p>
              <p>
                {freshness.updatedAt ? (
                  <>
                    <time dateTime={freshness.updatedAt} aria-labelledby="price-timestamp-label">
                      {freshness.timestampText}
                    </time>
                    <span className="timezone"> · {freshnessCopy.timezone}</span>
                  </>
                ) : (
                  freshness.timestampText
                )}
              </p>
              {freshness.timestampNote ? (
                <p className="refresh-context">{freshness.timestampNote}</p>
              ) : null}
              <p className="refresh-context">{freshness.refreshContext}</p>
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
              ? freshnessCopy.refreshPreview
              : refreshing
                ? freshnessCopy.refreshBusy
                : freshnessCopy.refreshIdle}
          </button>
        </div>
        <div className={`price-notice notice-${freshness.status}`}>
          <span className="notice-icon" aria-hidden="true">
            {freshness.status === "available" ? "✓" : "i"}
          </span>
          <div>
            <h3>{freshness.title}</h3>
            <p>{freshness.description}</p>
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
              «قیمت خرید شما» مبلغ پرداختی شما به گلدایران است. «قیمت فروش شما» مبلغ دریافتی شما از
              گلدایران است. این دو قیمت ممکن است متفاوت باشند.
            </p>
          </details>
          <details>
            <summary>
              قیمت برای چه مقدار و چه عیاری است؟<span aria-hidden="true">+</span>
            </summary>
            <p>
              هر مبلغ برای یک گرم طلای ۱۸ عیار با خلوص ۷۵۰ است و به تومان نمایش داده می‌شود. هر
              تومان برابر با ۱۰ ریال است.
            </p>
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
