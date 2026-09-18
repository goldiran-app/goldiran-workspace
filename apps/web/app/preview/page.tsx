import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricePreview } from "./price-preview";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "پیش‌نمایش طراحی | گلدایران",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  if (process.env.GOLDIRAN_ENABLE_PREVIEW !== "true") notFound();
  return <PricePreview />;
}
