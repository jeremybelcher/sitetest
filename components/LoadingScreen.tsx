"use client";

export function LoadingScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-zinc-800 border-t-emerald-400" />
        <div className="absolute inset-3 rounded-full border border-zinc-800/80" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          ✦
        </div>
      </div>
      <div className="mt-8 text-lg font-semibold">Charting a course…</div>
      <div className="mt-2 text-sm text-zinc-500">
        Finding an open table near you
      </div>
    </main>
  );
}
