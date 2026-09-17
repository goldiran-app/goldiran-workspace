import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, href, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-start">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
      {href && actionLabel ? (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
