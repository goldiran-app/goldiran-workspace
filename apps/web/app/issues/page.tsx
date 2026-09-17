import { EmptyState } from "@/components/empty-state";
import { fetchData, type Issue } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  let items: Issue[] = [];
  let error: string | null = null;

  try {
    items = await fetchData<Issue[]>("/api/v1/issues");
  } catch (err) {
    error = err instanceof Error ? err.message : "API unavailable";
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">مسائل</h1>
        <p className="mt-2 text-sm text-stone-600">هر مسئله به یک پروژه تعلق دارد.</p>
      </div>
      {error ? (
        <EmptyState title="داده‌ها بارگذاری نشدند" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="مسئله‌ای وجود ندارد"
          description="مسائل را از API بسازید تا در این فهرست دیده شوند."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium">{item.title}</h2>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs">{item.status}</span>
              </div>
              <p className="mt-1 text-sm text-stone-600">{item.description || "بدون توضیح"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
