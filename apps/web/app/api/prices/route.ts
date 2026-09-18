import { readPriceFeed } from "@/lib/price-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await readPriceFeed(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
