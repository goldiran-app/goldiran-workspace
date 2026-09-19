"use client";

import { formatPrice, formatTimestamp } from "@/lib/prices";
import { usePrices, type PriceDisplayState } from "@/lib/use-prices";

const statusCopy = {
  loading: {
    label: "در حال دریافت قیمت",
    title: "قیمت‌ها در حال دریافت هستند",
    description: "چند لحظه صبر کنید تا آخرین قیمت خرید و فروش دریافت شود.",
  },
  available: {
    label: "قیمت به‌روز",
    title: "قیمت خرید و فروش، کنار هم",
    description: "هر دو قیمت برای یک گرم طلای ۱۸ عیار هستند و از نگاه شما نمایش داده می‌شوند.",
  },
  stale: {
    label: "قیمت نیاز به به‌روزرسانی دارد",
    title: "اعتبار قیمت قبلی به پایان رسیده است",
    description:
      "برای جلوگیری از تصمیم‌گیری با قیمت قدیمی، مبلغ‌ها تا دریافت قیمت معتبر نمایش داده نمی‌شوند.",
  },
  unavailable: {
    label: "قیمت در دسترس نیست",
    title: "در حال حاضر قیمت معتبری نداریم",
    description:
      "دریافت قیمت ممکن نشد. کمی بعد دوباره تلاش کنید؛ تا آن زمان، قیمت خرید و فروش نمایش داده نمی‌شود.",
  },
};

export function PriceExperience({ previewState }: { previewState?: PriceDisplayState }) {
  const { snapshot, refreshing, refresh } = usePrices(previewState === undefined);
  const state = previewState ?? snapshot;
  const copy = statusCopy[state.status];
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
            قیمت خرید و فروش را روشن ببینید، با اطمینان تصمیم بگیرید.
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
          <div className={`status-badge status-${state.status}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            {copy.label}
          </div>
          <span className="board-unit">واحد قیمت: تومان / گرم</span>
        </div>
        <div className="price-grid" aria-busy={state.status === "loading"}>
          {(["buy", "sell"] as const).map((side) => {
            const buy = side === "buy";
            const amount = quote ? (buy ? quote.buyPerGram : quote.sellPerGram) : null;
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
                  {amount === null && <span className="sr-only">قیمت موجود نیست</span>}
                  {state.status === "loading" ? (
                    <span className="price-skeleton" />
                  ) : (
                    <bdi aria-hidden={amount === null ? true : undefined}>
                      {amount === null ? "—" : formatPrice(amount)}
                    </bdi>
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
          <div className="timestamp-block" aria-label="زمینه قیمت">
            <span className="clock-icon" aria-hidden="true">
              ◷
            </span>
            <div>
              <p className="timestamp-label">آخرین قیمت دریافتی</p>
              <p className="timestamp-value">
                {updatedAt ? (
                  <>
                    <time dateTime={updatedAt}>{formatTimestamp(updatedAt)}</time>
                    <span className="timezone"> · به وقت تهران</span>
                  </>
                ) : (
                  "پس از دریافت قیمت نمایش داده می‌شود"
                )}
              </p>
              <p className="refresh-context">
                بررسی خودکار هر ۱۵ ثانیه هنگام باز بودن صفحه
                {quote ? ` · منبع قیمت: ${quote.source}` : ""}
              </p>
            </div>
          </div>
          <button
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
        <div className={`price-notice notice-${state.status}`} aria-live="polite">
          <span className="notice-icon" aria-hidden="true">
            {state.status === "available" ? "✓" : "i"}
          </span>
          <div>
            <h3>{copy.title}</h3>
            <p>{copy.description}</p>
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
              قیمت قدیمی یا نامعتبر نمایش داده نمی‌شود. زمان آخرین قیمت، در صورت وجود، باقی می‌ماند.
              برای دیدن قیمت معتبر از «به‌روزرسانی قیمت» استفاده کنید.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
