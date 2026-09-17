import Link from "next/link";

const links = [
  { href: "/", label: "خانه" },
  { href: "/initiatives", label: "ابتکارات" },
  { href: "/projects", label: "پروژه‌ها" },
  { href: "/issues", label: "مسائل" },
];

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          فضای کاری گلدایران
        </Link>
        <nav className="flex items-center gap-4 text-sm text-stone-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-stone-950">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
