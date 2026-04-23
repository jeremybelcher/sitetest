"use client";

import type { Restaurant } from "@/lib/types";
import { formatDistance } from "@/lib/geo";

export function RestaurantCard({
  restaurant,
  partySize,
  onTryAnother,
  onStartOver,
  exhausted,
}: {
  restaurant: Restaurant;
  partySize: number;
  onTryAnother: () => void;
  onStartOver: () => void;
  exhausted: boolean;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onStartOver}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Start over
        </button>
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          Your pick
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl ring-1 ring-zinc-800">
        <div
          className="h-56 w-full bg-zinc-800 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.photo_url})` }}
          aria-label={`${restaurant.name} photo`}
        />
        <div className="bg-zinc-950/70 px-5 py-5 backdrop-blur">
          <h2 className="text-2xl font-bold leading-tight">
            {restaurant.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300">
            <span>{restaurant.cuisine}</span>
            <span className="text-zinc-600">·</span>
            <span>{restaurant.price_label}</span>
            <span className="text-zinc-600">·</span>
            <span>
              ★ {restaurant.rating.toFixed(1)}{" "}
              <span className="text-zinc-500">
                ({restaurant.review_count.toLocaleString()})
              </span>
            </span>
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            {restaurant.neighborhood} ·{" "}
            {formatDistance(restaurant.distance_meters)}
          </div>

          <div className="mt-5 rounded-xl bg-zinc-900 px-4 py-3 text-sm ring-1 ring-zinc-800">
            Table for <span className="font-semibold">{partySize}</span> at{" "}
            <span className="font-semibold text-emerald-400">
              {format12h(restaurant.confirmed_time)}
            </span>
          </div>
        </div>
      </div>

      {exhausted && (
        <p className="mt-4 text-center text-xs text-amber-400/80">
          You've seen them all — cycling back through.
        </p>
      )}

      <div className="mt-auto pt-8">
        <a
          href={restaurant.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-2xl bg-emerald-500 py-4 text-center text-lg font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98]"
        >
          Let's Go →
        </a>
        <button
          type="button"
          onClick={onTryAnother}
          className="mt-3 block w-full py-3 text-center text-sm text-zinc-400 hover:text-zinc-200"
        >
          Try another
        </button>
      </div>
    </main>
  );
}

function format12h(hhmm: string): string {
  const [hStr, m] = hhmm.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}
