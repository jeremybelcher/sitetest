"use client";

import { useState } from "react";
import { InputScreen, type InputScreenSubmit } from "@/components/InputScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RestaurantCard } from "@/components/RestaurantCard";
import { NoResults } from "@/components/NoResults";
import type { Restaurant } from "@/lib/types";

type Phase =
  | { kind: "input" }
  | { kind: "loading" }
  | { kind: "empty"; message?: string }
  | {
      kind: "result";
      pool: Restaurant[];
      cursor: number;
      viewedCount: number;
      partySize: number;
    };

const MIN_LOADING_MS = 1500;

export default function Page() {
  const [phase, setPhase] = useState<Phase>({ kind: "input" });

  async function handleSubmit(input: InputScreenSubmit) {
    setPhase({ kind: "loading" });
    const params = new URLSearchParams({
      lat: String(input.lat),
      lng: String(input.lng),
      datetime: `${input.date}T${input.time}`,
      partySize: String(input.partySize),
      prices: input.prices.join(","),
    });

    const [res] = await Promise.all([
      fetch(`/api/restaurants?${params.toString()}`, { cache: "no-store" }),
      delay(MIN_LOADING_MS),
    ]);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPhase({
        kind: "empty",
        message:
          body?.error ?? "Something went wrong reaching the restaurant network.",
      });
      return;
    }

    const data: { restaurants: Restaurant[] } = await res.json();
    if (!data.restaurants.length) {
      setPhase({ kind: "empty" });
      return;
    }
    setPhase({
      kind: "result",
      pool: data.restaurants,
      cursor: 0,
      viewedCount: 1,
      partySize: input.partySize,
    });
  }

  function tryAnother() {
    if (phase.kind !== "result") return;
    const next = (phase.cursor + 1) % phase.pool.length;
    setPhase({
      ...phase,
      cursor: next,
      viewedCount: phase.viewedCount + 1,
    });
  }

  function startOver() {
    setPhase({ kind: "input" });
  }

  if (phase.kind === "input") return <InputScreen onSubmit={handleSubmit} />;
  if (phase.kind === "loading") return <LoadingScreen />;
  if (phase.kind === "empty") {
    return <NoResults message={phase.message} onBack={startOver} />;
  }
  return (
    <RestaurantCard
      restaurant={phase.pool[phase.cursor]}
      partySize={phase.partySize}
      onTryAnother={tryAnother}
      onStartOver={startOver}
      exhausted={phase.viewedCount > phase.pool.length}
    />
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
