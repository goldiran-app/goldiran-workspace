import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { fetchData, type Stats } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stats: Stats | null = null;
  let error: string | null = null;

  try {
    stats = await fetchData<Stats>("/api/v1/stats");
  } catch (err) {
    error = err instanceof Error ? err.message : "API unavailable";
  }

  const cards = [
    {
      href: "/initiatives",
      title: "ابتکارات",
      count: stats?.initiatives ?? 0,
      empty: "هنوز ابتکاری ثبت نشده است.",
    },
    {
      href: "/projects",
      title: "پروژه‌ها",
      count: stats?.projects ?? 0,
      empty: "هنوز پروژه‌ای ثبت نشده است.",
    },
    {
      href: "/issues",
      title: "مسائل",
      count: stats?.issues ?? 0,
      empty: "هنوز مسئله‌ای ثبت نشده است.",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">داشبورد</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          استارتر سبک برای مدیریت ابتکارات، پروژه‌ها و مسائل. رابط کاربری ساده، سریع و آمادهٔ
          راست‌به‌چپ است.
        </p>
      </section>

      {error ? (
        <EmptyState
          title="اتصال به API برقرار نشد"
          description="با docker compose up --build سرویس‌ها را بالا بیاورید. فرانت‌اند روی پورت ۳۰۰۰ و API روی پورت ۸۰۸۰ اجرا می‌شود."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-400"
            >
              <p className="text-sm text-stone-500">{card.title}</p>
              <p className="mt-3 text-3xl font-semibold">{card.count}</p>
              {card.count === 0 ? (
                <p className="mt-3 text-sm text-stone-500">{card.empty}</p>
              ) : (
                <p className="mt-3 text-sm text-stone-500">مشاهده فهرست</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
