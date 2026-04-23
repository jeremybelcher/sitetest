import type { PriceTier, Restaurant, SearchParams } from "./types";
import { MOCK_RESTAURANTS, generateSlotsForRestaurant } from "./opentable.mock";
import { buildBookingUrl } from "./bookingUrl";
import { haversineMeters } from "./geo";
import { searchLive } from "./opentable.live";

const PRICE_LABELS: Record<PriceTier, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export function priceLabel(tier: PriceTier): string {
  return PRICE_LABELS[tier];
}

export async function searchRestaurants(
  params: SearchParams,
): Promise<Restaurant[]> {
  const mode = (process.env.OPENTABLE_MODE ?? "mock").toLowerCase();
  if (mode === "live") return searchLive(params);
  return searchMock(params);
}

function searchMock(params: SearchParams): Restaurant[] {
  const timeHHmm = extractHHmm(params.datetime);
  const priceSet = new Set(params.prices);
  const out: Restaurant[] = [];

  for (const r of MOCK_RESTAURANTS) {
    if (priceSet.size > 0 && !priceSet.has(r.price)) continue;
    const slots = generateSlotsForRestaurant(r.opentable_id, timeHHmm);
    if (slots.length === 0) continue;

    const confirmed = pickClosestSlot(slots, timeHHmm);
    const datetime = combineDate(params.datetime, confirmed);
    out.push({
      opentable_id: r.opentable_id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      review_count: r.review_count,
      price: r.price,
      price_label: priceLabel(r.price),
      lat: r.lat,
      lng: r.lng,
      distance_meters: haversineMeters(
        { lat: params.lat, lng: params.lng },
        { lat: r.lat, lng: r.lng },
      ),
      address: r.address,
      neighborhood: r.neighborhood,
      photo_url: r.photo_url,
      slots,
      confirmed_time: confirmed,
      booking_url: buildBookingUrl({
        opentableId: r.opentable_id,
        partySize: params.partySize,
        datetime,
      }),
    });
  }

  return out;
}

function extractHHmm(datetime: string): string {
  const m = datetime.match(/[T ](\d{2}:\d{2})/);
  if (m) return m[1];
  const d = new Date(datetime);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return "19:30";
}

function combineDate(datetime: string, hhmm: string): string {
  const m = datetime.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = m ? m[1] : datetime.slice(0, 10);
  return `${date}T${hhmm}`;
}

function pickClosestSlot(slots: string[], target: string): string {
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const t = toMin(target);
  let best = slots[0];
  let bestDiff = Math.abs(toMin(best) - t);
  for (const s of slots) {
    const d = Math.abs(toMin(s) - t);
    if (d < bestDiff) {
      best = s;
      bestDiff = d;
    }
  }
  return best;
}
