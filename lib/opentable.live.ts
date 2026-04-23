import type { PriceTier, Restaurant, SearchParams } from "./types";
import { buildBookingUrl } from "./bookingUrl";
import { haversineMeters } from "./geo";
import {
  AVAILABILITY_TOKEN,
  MULTI_SEARCH_RESULTS_FACETS_HASH,
  OPENTABLE_GQL_ENDPOINT,
  OPENTABLE_USER_AGENT,
  RESTAURANTS_AVAILABILITY_HASH,
} from "./opentable.query";

// ----- session -----

type Session = { cookieHeader: string; csrfToken: string; expiresAt: number };

let cachedSession: Session | null = null;
const SESSION_TTL_MS = 8 * 60 * 1000;

async function getSession(): Promise<Session> {
  const now = Date.now();
  if (cachedSession && cachedSession.expiresAt > now) return cachedSession;

  const res = await fetch("https://www.opentable.com/", {
    method: "GET",
    headers: {
      "user-agent": OPENTABLE_USER_AGENT,
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(
      `OpenTable warm-up failed: ${res.status} ${res.statusText}`,
    );
  }

  const cookieHeader = extractSetCookieHeader(res);
  if (!cookieHeader) {
    throw new Error(
      "OpenTable warm-up returned no cookies — bot detection may be blocking this IP.",
    );
  }

  cachedSession = {
    cookieHeader,
    csrfToken: crypto.randomUUID(),
    expiresAt: now + SESSION_TTL_MS,
  };
  return cachedSession;
}

function extractSetCookieHeader(res: Response): string {
  const raw =
    typeof (res.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : [res.headers.get("set-cookie") ?? ""].filter(Boolean);
  const pairs = raw
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean);
  return pairs.join("; ");
}

// ----- public entry -----

export async function searchLive(params: SearchParams): Promise<Restaurant[]> {
  const session = await getSession();

  const search = await fetchSearch(session, params);
  const restaurants = extractRestaurantList(search);
  if (restaurants.length === 0) return [];

  const ids = restaurants.map((r) => r.id);
  const availability = await fetchAvailability(session, params, ids);
  const slotsById = extractSlotsById(availability);

  const out: Restaurant[] = [];
  for (const r of restaurants) {
    const slots = slotsById.get(String(r.id)) ?? [];
    if (slots.length === 0) continue;
    const confirmed = pickClosestSlot(slots, hhmmFromDatetime(params.datetime));
    const date = dateFromDatetime(params.datetime);
    out.push({
      opentable_id: String(r.id),
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      review_count: r.reviewCount,
      price: r.price,
      price_label: "$".repeat(r.price),
      lat: r.lat,
      lng: r.lng,
      distance_meters:
        r.lat && r.lng
          ? haversineMeters(
              { lat: params.lat, lng: params.lng },
              { lat: r.lat, lng: r.lng },
            )
          : 0,
      address: r.address,
      neighborhood: r.neighborhood,
      photo_url: r.photoUrl,
      slots,
      confirmed_time: confirmed,
      booking_url: buildBookingUrl({
        opentableId: String(r.id),
        partySize: params.partySize,
        datetime: `${date}T${confirmed}`,
      }),
    });
  }
  return out;
}

// ----- fetch -----

async function fetchSearch(session: Session, p: SearchParams): Promise<unknown> {
  const body = {
    operationName: "MultiSearchResultsFacets",
    variables: {
      backwardMinutes: 180,
      forwardMinutes: 180,
      diningType: "ALL",
      includeDemoland: false,
      isAffiliateSearch: false,
      isRestrefRequest: false,
      maxSearchResults: 50,
      onlyJustAdded: false,
      onlyWithOffers: false,
      requestRandomContextualPrompts: false,
      skipSearchResults: 0,
      sortBy: "WEB_CONVERSION",
      withAnytimeAvailability: true,
      withCarouselResults: false,
      withFacets: false,
      withFallbackToListingMode: false,
      latitude: p.lat,
      longitude: p.lng,
      additionalDetailIds: [],
      areaId: "",
      cuisineIds: [],
      date: dateFromDatetime(p.datetime),
      debug: false,
      device: "mobile",
      experienceTypeIds: [],
      intentModifiedTerm: null,
      legacyHoodIds: [],
      loyaltyRedemptionTiers: [],
      macroIds: [],
      metroId: 0,
      metroIds: [],
      onlyNonEnterpriseCustomers: false,
      onlyChaseRestaurants: false,
      onlyChaseOrVisaRestaurants: false,
      onlyPop: false,
      onlyVisaRestaurants: false,
      originalTerm: "",
      partySize: p.partySize,
      pinnedRid: null,
      prices: p.prices,
      suppressPromotion: false,
      tableCategories: [],
      tagIds: [],
      time: hhmmFromDatetime(p.datetime),
      userLatitude: p.lat,
      userLongitude: p.lng,
      withLoyaltyRedemptionFacets: false,
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: MULTI_SEARCH_RESULTS_FACETS_HASH,
      },
    },
  };
  return postGql(session, "MultiSearchResultsFacets", body);
}

async function fetchAvailability(
  session: Session,
  p: SearchParams,
  restaurantIds: (number | string)[],
): Promise<unknown> {
  const body = {
    operationName: "RestaurantsAvailability",
    variables: {
      onlyPop: false,
      forwardDays: 0,
      requireTimes: false,
      requireTypes: [],
      useCBR: false,
      privilegedAccess: [],
      restaurantIds: restaurantIds.map((id) => Number(id)),
      date: dateFromDatetime(p.datetime),
      time: hhmmFromDatetime(p.datetime),
      partySize: p.partySize,
      databaseRegion: "NA",
      restaurantAvailabilityTokens: restaurantIds.map(() => AVAILABILITY_TOKEN),
      slotDiscovery: restaurantIds.map(() => "on"),
      loyaltyRedemptionTiers: [],
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: RESTAURANTS_AVAILABILITY_HASH,
      },
    },
  };
  return postGql(session, "RestaurantsAvailability", body);
}

async function postGql(
  session: Session,
  opname: string,
  body: unknown,
): Promise<unknown> {
  const url = `${OPENTABLE_GQL_ENDPOINT}?optype=query&opname=${opname}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      origin: "https://www.opentable.com",
      referer: "https://www.opentable.com/",
      "user-agent": OPENTABLE_USER_AGENT,
      "x-csrf-token": session.csrfToken,
      "x-query-timeout": "7500",
      cookie: session.cookieHeader,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 400);
    cachedSession = null;
    throw new Error(
      `OpenTable ${opname} returned ${res.status}. Snippet: ${snippet}`,
    );
  }
  const json = (await res.json()) as { errors?: unknown; data?: unknown };
  if (json.errors) {
    throw new Error(
      `OpenTable ${opname} errors: ${JSON.stringify(json.errors).slice(0, 400)}`,
    );
  }
  return json.data;
}

// ----- parsers (defensive) -----

type ParsedRestaurant = {
  id: number | string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  price: PriceTier;
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  photoUrl: string;
};

function extractRestaurantList(data: unknown): ParsedRestaurant[] {
  const list = findRestaurantArray(data);
  if (!list) {
    throw new Error(
      `MultiSearchResultsFacets: could not locate restaurant list. Top-level keys: ${shapeHint(data)}`,
    );
  }
  const parsed: ParsedRestaurant[] = [];
  for (const raw of list) {
    const r = pickRestaurant(raw);
    if (r) parsed.push(r);
  }
  return parsed;
}

function findRestaurantArray(data: unknown): unknown[] | null {
  if (!data || typeof data !== "object") return null;
  const candidates: string[] = [
    "multiSearch",
    "search",
    "searchResults",
    "restaurants",
    "results",
  ];
  const stack: unknown[] = [data];
  const seen = new Set<unknown>();
  while (stack.length) {
    const cur = stack.shift();
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
    seen.add(cur);
    const o = cur as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (Array.isArray(v) && v.length > 0 && looksLikeRestaurantRow(v[0])) {
        return v;
      }
      if (v && typeof v === "object") stack.push(v);
    }
    for (const k of candidates) {
      const v = o[k];
      if (Array.isArray(v) && v.length > 0 && looksLikeRestaurantRow(v[0])) {
        return v;
      }
    }
  }
  return null;
}

function looksLikeRestaurantRow(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  const hasId =
    "restaurantId" in r ||
    "id" in r ||
    ("restaurant" in r &&
      typeof r.restaurant === "object" &&
      r.restaurant !== null &&
      ("restaurantId" in (r.restaurant as object) ||
        "id" in (r.restaurant as object)));
  const hasName =
    "name" in r ||
    ("restaurant" in r &&
      typeof r.restaurant === "object" &&
      r.restaurant !== null &&
      "name" in (r.restaurant as object));
  return hasId && hasName;
}

function pickRestaurant(raw: unknown): ParsedRestaurant | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const inner =
    "restaurant" in r && typeof r.restaurant === "object" && r.restaurant !== null
      ? (r.restaurant as Record<string, unknown>)
      : r;

  const id = inner.restaurantId ?? inner.id ?? inner.rid;
  const name = inner.name ?? inner.restaurantName;
  if (id == null || typeof name !== "string") return null;

  const coords =
    (inner.coordinates as Record<string, unknown> | undefined) ??
    (inner.location as Record<string, unknown> | undefined) ??
    {};
  const lat = num(inner.latitude ?? coords.latitude ?? coords.lat);
  const lng = num(inner.longitude ?? coords.longitude ?? coords.lng);

  const primaryCuisine =
    (inner.primaryCuisine as Record<string, unknown> | undefined)?.name ??
    inner.primaryCuisineName ??
    (Array.isArray(inner.cuisines) && inner.cuisines[0]
      ? (inner.cuisines[0] as Record<string, unknown>)?.name ??
        inner.cuisines[0]
      : undefined) ??
    inner.cuisine;

  const photos =
    (inner.photos as Array<Record<string, unknown>> | undefined) ??
    (inner.images as Array<Record<string, unknown>> | undefined) ??
    [];
  const heroUrl = (inner.heroPhoto as Record<string, unknown> | undefined)?.url;
  const photoUrl: string =
    (typeof photos[0]?.url === "string" ? (photos[0].url as string) : undefined) ??
    (typeof photos[0]?.src === "string" ? (photos[0].src as string) : undefined) ??
    (typeof heroUrl === "string" ? heroUrl : undefined) ??
    (typeof inner.photo === "string" ? inner.photo : undefined) ??
    "";

  const neighborhoodObj = inner.neighborhood as Record<string, unknown> | string | undefined;
  const neighborhood =
    typeof neighborhoodObj === "string"
      ? neighborhoodObj
      : (neighborhoodObj?.name as string | undefined) ?? "";

  const address =
    (inner.address as Record<string, unknown> | undefined)?.line1 as string ??
    (typeof inner.address === "string" ? inner.address : undefined) ??
    "";

  const rawPrice = num(
    inner.priceBand ??
      inner.price ??
      (inner.priceRange as Record<string, unknown> | undefined)?.tier ??
      (inner.priceRange as Record<string, unknown> | undefined)?.value,
  );
  const price = clampPrice(rawPrice);

  return {
    id: id as number | string,
    name,
    cuisine: (typeof primaryCuisine === "string" ? primaryCuisine : "") || "Restaurant",
    rating: num(inner.overallRating ?? inner.rating ?? inner.stars) || 0,
    reviewCount: num(inner.reviewCount ?? inner.numReviews) || 0,
    price,
    lat,
    lng,
    address: (typeof address === "string" ? address : "") || "",
    neighborhood,
    photoUrl,
  };
}

function extractSlotsById(data: unknown): Map<string, string[]> {
  const out = new Map<string, string[]>();
  if (!data || typeof data !== "object") {
    throw new Error(
      `RestaurantsAvailability: expected object, got ${shapeHint(data)}`,
    );
  }
  const rows = findAvailabilityArray(data);
  if (!rows) {
    throw new Error(
      `RestaurantsAvailability: could not locate results array. Shape: ${shapeHint(data)}`,
    );
  }
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = r.restaurantId ?? r.id ?? r.rid;
    if (id == null) continue;
    const slots = extractSlotStrings(r);
    if (slots.length > 0) out.set(String(id), slots);
  }
  return out;
}

function findAvailabilityArray(data: unknown): unknown[] | null {
  const stack: unknown[] = [data];
  const seen = new Set<unknown>();
  while (stack.length) {
    const cur = stack.shift();
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
    seen.add(cur);
    if (Array.isArray(cur)) {
      if (cur.length > 0 && looksLikeAvailabilityRow(cur[0])) return cur;
      for (const x of cur) if (x && typeof x === "object") stack.push(x);
      continue;
    }
    for (const v of Object.values(cur as Record<string, unknown>)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }
  return null;
}

function looksLikeAvailabilityRow(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  const hasId = "restaurantId" in r || "id" in r || "rid" in r;
  const hasSlots =
    "timeSlots" in r ||
    "slots" in r ||
    "availability" in r ||
    "availabilityDays" in r ||
    "times" in r;
  return hasId && hasSlots;
}

function extractSlotStrings(row: Record<string, unknown>): string[] {
  const buckets: unknown[] = [
    row.timeSlots,
    row.slots,
    row.times,
    row.availability,
    row.availabilityDays,
  ];
  const out = new Set<string>();
  const stack: unknown[] = buckets.filter(Boolean);
  while (stack.length) {
    const v = stack.shift();
    if (!v) continue;
    if (Array.isArray(v)) {
      for (const item of v) stack.push(item);
      continue;
    }
    if (typeof v === "string") {
      const t = toHHmm(v);
      if (t) out.add(t);
      continue;
    }
    if (typeof v === "object") {
      const r = v as Record<string, unknown>;
      const candidate =
        (typeof r.time === "string" ? r.time : undefined) ??
        (typeof r.dateTime === "string" ? r.dateTime : undefined) ??
        (typeof r.datetime === "string" ? r.datetime : undefined) ??
        (typeof r.isoDateTime === "string" ? r.isoDateTime : undefined) ??
        (typeof r.slot === "string" ? r.slot : undefined);
      if (candidate) {
        const t = toHHmm(candidate);
        if (t) out.add(t);
      }
      for (const nested of Object.values(r)) {
        if (Array.isArray(nested) || (nested && typeof nested === "object"))
          stack.push(nested);
      }
    }
  }
  return Array.from(out).sort();
}

// ----- helpers -----

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function clampPrice(n: number): PriceTier {
  if (n >= 1 && n <= 4 && Number.isInteger(n)) return n as PriceTier;
  if (n <= 20 && n > 0) return 1;
  if (n <= 40) return 2;
  if (n <= 60) return 3;
  return 2;
}

function toHHmm(s: string): string | null {
  const iso = s.match(/T(\d{2}):(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}`;
  const hm = s.match(/^(\d{1,2}):(\d{2})/);
  if (hm) return `${hm[1].padStart(2, "0")}:${hm[2]}`;
  return null;
}

function dateFromDatetime(dt: string): string {
  const m = dt.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : dt.slice(0, 10);
}

function hhmmFromDatetime(dt: string): string {
  const m = dt.match(/[T ](\d{2}:\d{2})/);
  return m ? m[1] : "19:30";
}

function pickClosestSlot(slots: string[], target: string): string {
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const t = toMin(target);
  let best = slots[0];
  let diff = Math.abs(toMin(best) - t);
  for (const s of slots) {
    const d = Math.abs(toMin(s) - t);
    if (d < diff) {
      best = s;
      diff = d;
    }
  }
  return best;
}

function shapeHint(v: unknown): string {
  if (v == null) return String(v);
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") return `{${Object.keys(v).slice(0, 10).join(",")}}`;
  return typeof v;
}
