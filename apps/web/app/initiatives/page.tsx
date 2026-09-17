import { EmptyState } from "@/components/empty-state";
import { fetchData, type Initiative } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function InitiativesPage() {
  let items: Initiative[] = [];
  let error: string | null = null;

  try {
    items = await fetchData<Initiative[]>("/api/v1/initiatives");
  } catch (err) {
    error = err instanceof Error ? err.message : "API unavailable";
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">ابتکارات</h1>
        <p className="mt-2 text-sm text-stone-600">هر ابتکار می‌تواند چند پروژه داشته باشد.</p>
      </div>
      {error ? (
        <EmptyState title="داده‌ها بارگذاری نشدند" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="ابتکاری وجود ندارد"
          description="از API برای ساخت اولین ابتکار استفاده کنید. این صفحه فعلاً فقط فهرست و حالت خالی را نشان می‌دهد."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="font-medium">{item.name}</h2>
              <p className="mt-1 text-sm text-stone-600">{item.description || "بدون توضیح"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
