import { EmptyState } from "@/components/empty-state";
import { fetchData, type Project } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let items: Project[] = [];
  let error: string | null = null;

  try {
    items = await fetchData<Project[]>("/api/v1/projects");
  } catch (err) {
    error = err instanceof Error ? err.message : "API unavailable";
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">پروژه‌ها</h1>
        <p className="mt-2 text-sm text-stone-600">
          هر پروژه به یک ابتکار وصل می‌شود و می‌تواند چند مسئله داشته باشد.
        </p>
      </div>
      {error ? (
        <EmptyState title="داده‌ها بارگذاری نشدند" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="پروژه‌ای وجود ندارد"
          description="پس از ساخت پروژه از طریق API، فهرست اینجا نمایش داده می‌شود."
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
