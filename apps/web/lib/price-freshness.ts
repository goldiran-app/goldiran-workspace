import { formatTimestamp, type PriceDisplayState } from "./prices";

export const freshnessCopy = {
  missingAmount: "قیمت موجود نیست",
  timestampLabel: "زمان آخرین قیمت منبع",
  timezone: "به وقت تهران",
  timestampPending: "زمان منبع هنوز مشخص نیست.",
  timestampSourceNote: "این زمان از منبع قیمت است، نه زمان باز شدن صفحه.",
  staleTimestampNote: "این زمان مربوط به قیمت منقضی‌شده است و برای معامله اعتبار ندارد.",
  refreshContext: "بررسی خودکار هر ۱۵ ثانیه در زمان باز بودن صفحه",
  refreshIdle: "به‌روزرسانی قیمت",
  refreshBusy: "در حال بررسی…",
  refreshPreview: "نمونه نمایشی",
  statuses: {
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
      label: "قیمت منقضی شده است",
      title: "اعتبار قیمت قبلی به پایان رسیده است",
      description:
        "برای جلوگیری از تصمیم‌گیری با قیمت قدیمی، مبلغ‌ها تا دریافت قیمت معتبر نمایش داده نمی‌شوند.",
    },
    unavailable: {
      label: "قیمت در دسترس نیست",
      title: "در حال حاضر قیمت معتبری نداریم",
      description:
        "قیمت معتبری دریافت نشد. مبلغ خرید و فروش نمایش داده نمی‌شود؛ کمی بعد دوباره تلاش کنید.",
    },
  },
} as const;

export type FreshnessView = {
  status: PriceDisplayState["status"];
  label: string;
  title: string;
  description: string;
  updatedAt: string | null;
  timestampText: string;
  timestampNote: string | null;
  refreshContext: string;
  source: string | null;
  amountsVisible: boolean;
};

export function freshnessView(state: PriceDisplayState): FreshnessView {
  const copy = freshnessCopy.statuses[state.status];
  switch (state.status) {
    case "available":
      return {
        status: state.status,
        ...copy,
        updatedAt: state.quote.updatedAt,
        timestampText: formatTimestamp(state.quote.updatedAt),
        timestampNote: freshnessCopy.timestampSourceNote,
        refreshContext: `منبع: ${state.quote.source} · ${freshnessCopy.refreshContext}`,
        source: state.quote.source,
        amountsVisible: true,
      };
    case "stale":
      return {
        status: state.status,
        ...copy,
        updatedAt: state.updatedAt,
        timestampText: formatTimestamp(state.updatedAt),
        timestampNote: freshnessCopy.staleTimestampNote,
        refreshContext: freshnessCopy.refreshContext,
        source: null,
        amountsVisible: false,
      };
    case "unavailable":
      return {
        status: state.status,
        ...copy,
        updatedAt: null,
        timestampText: freshnessCopy.timestampPending,
        timestampNote: null,
        refreshContext: freshnessCopy.refreshContext,
        source: null,
        amountsVisible: false,
      };
    case "loading":
      return {
        status: state.status,
        ...copy,
        updatedAt: null,
        timestampText: freshnessCopy.timestampPending,
        timestampNote: null,
        refreshContext: freshnessCopy.refreshContext,
        source: null,
        amountsVisible: false,
      };
    default: {
      const exhaustive: never = state;
      throw new Error(`Unhandled price status: ${JSON.stringify(exhaustive)}`);
    }
  }
}
