import type { PriceTier } from "./types";

export type MockRestaurant = {
  opentable_id: string;
  name: string;
  cuisine: string;
  rating: number;
  review_count: number;
  price: PriceTier;
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  photo_url: string;
};

// NYC fixtures. IDs are illustrative and may not resolve to real OpenTable
// records; replace with real IDs when swapping to the live GQL integration.
export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    opentable_id: "10001",
    name: "The Lantern Room",
    cuisine: "Modern American",
    rating: 4.6,
    review_count: 1284,
    price: 3,
    lat: 40.7411,
    lng: -73.9897,
    address: "14 W 23rd St, New York, NY",
    neighborhood: "Flatiron",
    photo_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  },
  {
    opentable_id: "10002",
    name: "Hanami",
    cuisine: "Japanese",
    rating: 4.8,
    review_count: 2041,
    price: 4,
    lat: 40.7266,
    lng: -73.9975,
    address: "212 Thompson St, New York, NY",
    neighborhood: "Greenwich Village",
    photo_url:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&q=80",
  },
  {
    opentable_id: "10003",
    name: "Trattoria Corvo",
    cuisine: "Italian",
    rating: 4.5,
    review_count: 768,
    price: 2,
    lat: 40.7296,
    lng: -74.0037,
    address: "88 Perry St, New York, NY",
    neighborhood: "West Village",
    photo_url:
      "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=1200&q=80",
  },
  {
    opentable_id: "10004",
    name: "Bodega 9",
    cuisine: "Tacos",
    rating: 4.3,
    review_count: 412,
    price: 1,
    lat: 40.7178,
    lng: -73.9565,
    address: "125 N 7th St, Brooklyn, NY",
    neighborhood: "Williamsburg",
    photo_url:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80",
  },
  {
    opentable_id: "10005",
    name: "Maison Verte",
    cuisine: "French",
    rating: 4.7,
    review_count: 1519,
    price: 4,
    lat: 40.7648,
    lng: -73.9734,
    address: "42 E 61st St, New York, NY",
    neighborhood: "Upper East Side",
    photo_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  },
  {
    opentable_id: "10006",
    name: "Smoke & Brine",
    cuisine: "BBQ",
    rating: 4.4,
    review_count: 983,
    price: 2,
    lat: 40.7094,
    lng: -73.9577,
    address: "612 Metropolitan Ave, Brooklyn, NY",
    neighborhood: "Williamsburg",
    photo_url:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
  },
  {
    opentable_id: "10007",
    name: "The Basil Leaf",
    cuisine: "Thai",
    rating: 4.5,
    review_count: 612,
    price: 2,
    lat: 40.7509,
    lng: -73.9861,
    address: "318 W 40th St, New York, NY",
    neighborhood: "Midtown West",
    photo_url:
      "https://images.unsplash.com/photo-1552912470-7ad6e0a7c0ef?w=1200&q=80",
  },
  {
    opentable_id: "10008",
    name: "Piccolo Fico",
    cuisine: "Pizza",
    rating: 4.6,
    review_count: 892,
    price: 2,
    lat: 40.7223,
    lng: -73.9876,
    address: "178 Mulberry St, New York, NY",
    neighborhood: "Little Italy",
    photo_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
  },
  {
    opentable_id: "10009",
    name: "Orbit Bar",
    cuisine: "Cocktails & Small Plates",
    rating: 4.4,
    review_count: 327,
    price: 3,
    lat: 40.7425,
    lng: -74.0052,
    address: "55 Gansevoort St, New York, NY",
    neighborhood: "Meatpacking",
    photo_url:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
  },
  {
    opentable_id: "10010",
    name: "Khao Soi House",
    cuisine: "Northern Thai",
    rating: 4.7,
    review_count: 1055,
    price: 2,
    lat: 40.7282,
    lng: -73.9942,
    address: "96 MacDougal St, New York, NY",
    neighborhood: "Greenwich Village",
    photo_url:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80",
  },
  {
    opentable_id: "10011",
    name: "Counter & Stool",
    cuisine: "Diner",
    rating: 4.2,
    review_count: 284,
    price: 1,
    lat: 40.7505,
    lng: -73.9934,
    address: "501 W 38th St, New York, NY",
    neighborhood: "Hell's Kitchen",
    photo_url:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80",
  },
  {
    opentable_id: "10012",
    name: "Apogée",
    cuisine: "New American Tasting",
    rating: 4.9,
    review_count: 742,
    price: 4,
    lat: 40.7589,
    lng: -73.9851,
    address: "1260 Avenue of the Americas, New York, NY",
    neighborhood: "Midtown",
    photo_url:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80",
  },
];

// Deterministic slot generator so the mock feels alive without extra state.
export function generateSlotsForRestaurant(
  id: string,
  requestedTime: string, // "HH:mm"
): string[] {
  const seed = hash(id);
  const base = parseHHmm(requestedTime);
  if (base == null) return [];
  const candidates: number[] = [];
  for (let offset = -90; offset <= 90; offset += 15) {
    if ((seed + offset) % 2 === 0) candidates.push(base + offset);
  }
  return candidates
    .filter((m) => m >= 11 * 60 && m <= 23 * 60 + 30)
    .map(formatHHmm);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function parseHHmm(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function formatHHmm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
