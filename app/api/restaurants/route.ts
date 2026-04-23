import { NextRequest, NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/opentable";
import type { PriceTier, SearchParams } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const parsed = parseParams(req);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const restaurants = await searchRestaurants(parsed);
    const shuffled = shuffle(restaurants);
    return NextResponse.json({ restaurants: shuffled });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Restaurant lookup failed: ${message}` },
      { status: 502 },
    );
  }
}

function parseParams(
  req: NextRequest,
): SearchParams | { error: string } {
  const q = req.nextUrl.searchParams;
  const lat = Number(q.get("lat"));
  const lng = Number(q.get("lng"));
  const datetime = q.get("datetime") ?? "";
  const partySize = Number(q.get("partySize"));
  const rawPrices = q.get("prices") ?? "";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "lat and lng must be numbers" };
  }
  if (!datetime.match(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/)) {
    return { error: "datetime must be YYYY-MM-DDTHH:mm" };
  }
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    return { error: "partySize must be an integer 1-20" };
  }

  const prices: PriceTier[] = rawPrices
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n): n is PriceTier => n === 1 || n === 2 || n === 3 || n === 4);

  return { lat, lng, datetime, partySize, prices };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
