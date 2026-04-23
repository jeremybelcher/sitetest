"use client";

import { useEffect, useState } from "react";
import type { PriceTier } from "@/lib/types";
import { NYC_FALLBACK } from "@/lib/geo";

export type InputScreenSubmit = {
  lat: number;
  lng: number;
  locationLabel: string;
  date: string;
  time: string;
  partySize: number;
  prices: PriceTier[];
};

type LocationState =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "granted"; lat: number; lng: number }
  | { kind: "denied" };

export function InputScreen({
  onSubmit,
}: {
  onSubmit: (v: InputScreenSubmit) => void;
}) {
  const defaults = defaultDateTime();
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [partySize, setPartySize] = useState(2);
  const [prices, setPrices] = useState<PriceTier[]>([2]);
  const [location, setLocation] = useState<LocationState>({ kind: "idle" });
  const [neighborhood, setNeighborhood] = useState("");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation({ kind: "denied" });
      return;
    }
    setLocation({ kind: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          kind: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setLocation({ kind: "denied" }),
      { timeout: 5000, maximumAge: 60_000 },
    );
  }, []);

  function togglePrice(p: PriceTier) {
    setPrices((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].sort(),
    );
  }

  function handleSubmit() {
    const coords =
      location.kind === "granted"
        ? { lat: location.lat, lng: location.lng }
        : NYC_FALLBACK;
    const label =
      location.kind === "granted"
        ? "Near you"
        : neighborhood.trim() || "NYC";
    onSubmit({
      lat: coords.lat,
      lng: coords.lng,
      locationLabel: label,
      date,
      time,
      partySize,
      prices: prices.length > 0 ? prices : [1, 2, 3, 4],
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <header className="mb-8 mt-2">
        <h1 className="text-3xl font-black tracking-tight">
          Gastro<span className="text-emerald-400">naut</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          One input. One restaurant. One tap.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6">
        <Field label="When">
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-base outline-none ring-1 ring-zinc-800 focus:ring-emerald-500"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32 rounded-xl bg-zinc-900 px-4 py-3 text-base outline-none ring-1 ring-zinc-800 focus:ring-emerald-500"
            />
          </div>
        </Field>

        <Field label="Party size">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.max(1, n - 1))}
              className="h-12 w-12 rounded-full bg-zinc-900 text-xl ring-1 ring-zinc-800 active:scale-95"
              aria-label="Decrease party size"
            >
              −
            </button>
            <div className="flex-1 text-center text-3xl font-semibold tabular-nums">
              {partySize}
            </div>
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.min(10, n + 1))}
              className="h-12 w-12 rounded-full bg-zinc-900 text-xl ring-1 ring-zinc-800 active:scale-95"
              aria-label="Increase party size"
            >
              +
            </button>
          </div>
        </Field>

        <Field label="Price">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((tier) => {
              const selected = prices.includes(tier as PriceTier);
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => togglePrice(tier as PriceTier)}
                  className={[
                    "rounded-xl py-3 text-base font-semibold ring-1 transition-colors",
                    selected
                      ? "bg-emerald-500 text-zinc-950 ring-emerald-400"
                      : "bg-zinc-900 text-zinc-300 ring-zinc-800",
                  ].join(" ")}
                  aria-pressed={selected}
                >
                  {"$".repeat(tier)}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Where">
          <LocationRow
            state={location}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={location.kind === "requesting"}
        className="mt-8 w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {location.kind === "requesting"
          ? "Finding you…"
          : "Find Me a Table"}
      </button>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function LocationRow({
  state,
  neighborhood,
  setNeighborhood,
}: {
  state: LocationState;
  neighborhood: string;
  setNeighborhood: (s: string) => void;
}) {
  if (state.kind === "granted") {
    return (
      <div className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-300 ring-1 ring-zinc-800">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
        Using your current location
      </div>
    );
  }
  if (state.kind === "requesting") {
    return (
      <div className="rounded-xl bg-zinc-900 px-4 py-3 text-sm text-zinc-400 ring-1 ring-zinc-800">
        Requesting location…
      </div>
    );
  }
  return (
    <input
      type="text"
      placeholder="Neighborhood (NYC fallback if empty)"
      value={neighborhood}
      onChange={(e) => setNeighborhood(e.target.value)}
      className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-base outline-none ring-1 ring-zinc-800 focus:ring-emerald-500"
    />
  );
}

function defaultDateTime(): { date: string; time: string } {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { date, time: "19:30" };
}
