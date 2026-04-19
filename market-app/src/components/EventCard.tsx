import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { eventPriceAtomFamily } from "@/store/index";
import { EventImage } from "./EventImage";

type EventCardProps = {
  eventId: string;
  title: string;
  imageUrl: string | null;
  volume: number | null;
  marketQuestion: string | null;
  firstOutcomeLabel: string | null;
  secondOutcomeLabel: string | null;
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

function EventCardComponent({
  eventId,
  title,
  imageUrl,
  volume,
  marketQuestion,
  firstOutcomeLabel,
  secondOutcomeLabel,
}: EventCardProps) {
  const price = useAtomValue(eventPriceAtomFamily(eventId));
  const priceInCents = price !== null ? Math.round(price * 100) : null;
  const impliedProbability = priceInCents !== null ? `${priceInCents}%` : "N/A";
  const [priceTrend, setPriceTrend] = useState<"up" | "down" | null>(null);
  const previousPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (price === null) {
      return;
    }

    const previousPrice = previousPriceRef.current;
    if (previousPrice !== null) {
      if (price > previousPrice) {
        setPriceTrend("up");
      } else if (price < previousPrice) {
        setPriceTrend("down");
      }
    }

    previousPriceRef.current = price;

    const timeout = window.setTimeout(() => {
      setPriceTrend(null);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [price]);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-[0_10px_24px_rgba(2,6,23,0.45)] transition-colors hover:bg-[#111d36]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Event</p>
      <div className="mt-2 flex items-start gap-3">
        <EventImage src={imageUrl} alt={title} size={48} className="shrink-0 rounded-lg object-cover" />
        <h2 className="text-base font-semibold leading-snug text-slate-100">{title}</h2>
      </div>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">
        {marketQuestion ?? "Market preview coming soon"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {firstOutcomeLabel ? (
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs font-medium text-slate-300">
            {firstOutcomeLabel}
          </span>
        ) : null}
        {secondOutcomeLabel ? (
          <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs font-medium text-slate-300">
            {secondOutcomeLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Volume</span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
          {formatVolume(volume)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <span>Yes price</span>
          <span className="group relative inline-flex">
            <button
              type="button"
              className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-500/60 text-[10px] text-slate-300"
              aria-label="Yes price help"
            >
              ?
            </button>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-center text-xs text-slate-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              1c means $0.01 per share and roughly a 1% implied chance.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
              priceTrend === "up"
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                : priceTrend === "down"
                  ? "border-rose-300/60 bg-rose-500/20 text-rose-100"
                  : "border-cyan-400/35 bg-cyan-500/10 text-cyan-200"
            }`}
          >
            {priceInCents !== null ? `${priceInCents}c` : "N/A"}
          </span>
          <span
            className={`text-sm ${
              priceTrend === "up"
                ? "text-emerald-300"
                : priceTrend === "down"
                  ? "text-rose-300"
                  : "text-slate-300"
            }`}
          >
            ({impliedProbability} chance)
          </span>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={`/event/${eventId}`}
          className="inline-flex items-center rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export const EventCard = memo(EventCardComponent);
