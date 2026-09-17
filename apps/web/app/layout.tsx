import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/vazirmatn";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "گلدایران | قیمت خرید و فروش هر گرم طلا",
  description: "قیمت خرید و فروش هر گرم طلای ۱۸ عیار، با زمان به‌روزرسانی و وضعیت اعتبار قیمت.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main">
          رفتن به محتوای اصلی
        </a>
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" href="/" aria-label="گلدایران، خانه">
              <span className="brand-mark" aria-hidden="true">
                گ
              </span>
              <span>
                گلدایران
                <span className="brand-latin" lang="en">
                  GOLDIRAN
                </span>
              </span>
            </Link>
            <nav aria-label="ناوبری اصلی">
              <a href="#prices">قیمت طلا</a>
              <a href="#guide">راهنمای قیمت‌ها</a>
            </nav>
            <span className="header-note">طلا، با شفافیت بیشتر</span>
          </div>
        </header>
        <main id="main" className="page-shell">
          {children}
        </main>
        <footer className="site-footer">
          <span>
            گلدایران <span className="footer-divider">/</span> هر گرم، روشن و شفاف
          </span>
          <span>قیمت‌ها به تومان نمایش داده می‌شوند.</span>
        </footer>
      </body>
    </html>
  );
}
