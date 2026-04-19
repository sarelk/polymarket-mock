import { memo } from "react";
import { useAtomValue } from "jotai";
import { eventPriceAtomFamily } from "@/store/index";

type EventCardProps = {
  eventId: string;
  title: string;
  volume: number | null;
};

const formatVolume = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

function EventCardComponent({ eventId, title, volume }: EventCardProps) {
  const price = useAtomValue(eventPriceAtomFamily(eventId));
  const priceInCents = price !== null ? Math.round(price * 100) : null;
  const impliedProbability = priceInCents !== null ? `${priceInCents}%` : "N/A";

  return (
    <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-[0_10px_24px_rgba(2,6,23,0.45)] transition-colors hover:bg-[#111d36]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Event</p>
      <h2 className="mt-2 text-base font-semibold leading-snug text-slate-100">{title}</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Volume</span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
          {formatVolume(volume)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <span>Price</span>
          <span className="group relative inline-flex">
            <button
              type="button"
              className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-500/60 text-[10px] text-slate-300"
              aria-label="Price help"
            >
              ?
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-center text-xs text-slate-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              Price in cents equals implied probability percentage.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-200">
            {priceInCents !== null ? `${priceInCents}c` : "N/A"}
          </span>
          <span className="text-sm text-slate-300">({impliedProbability})</span>
        </div>
      </div>
    </article>
  );
}

export const EventCard = memo(EventCardComponent);
