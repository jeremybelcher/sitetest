"use client";

export function NoResults({
  message,
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">🛰️</div>
      <h2 className="mt-6 text-2xl font-bold">No signal from down there</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {message ??
          "Gastronaut couldn't find a match right now. Try loosening your price range or a different time."}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-8 w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-zinc-950 active:scale-[0.98]"
      >
        Adjust search
      </button>
    </main>
  );
}
