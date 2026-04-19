"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import {
  eventByIdAtomFamily,
  eventPriceAtomFamily,
  eventsErrorAtom,
  isLoadingEventsAtom,
  loadEventsAtom,
  tickEventPricesAtom,
} from "@/store/index";

const clampProbability = (value: number | null): number | null => {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(0.99, Math.max(0.01, value));
};

const toCents = (value: number | null): string => {
  if (value === null) {
    return "N/A";
  }

  return `${Math.round(value * 100)}c`;
};

const toPercent = (value: number | null): string => {
  if (value === null) {
    return "N/A";
  }

  return `${Math.round(value * 100)}%`;
};

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = typeof params.eventId === "string" ? params.eventId : "";

  const event = useAtomValue(eventByIdAtomFamily(eventId));
  const liveEventPrice = useAtomValue(eventPriceAtomFamily(eventId));
  const isLoading = useAtomValue(isLoadingEventsAtom);
  const errorMessage = useAtomValue(eventsErrorAtom);
  const loadEvents = useSetAtom(loadEventsAtom);
  const tickEventPrices = useSetAtom(tickEventPricesAtom);

  useEffect(() => {
    if (!event) {
      loadEvents();
    }
  }, [event, loadEvents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickEventPrices();
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [tickEventPrices]);

  if (isLoading && !event) {
    return <div className="p-6 text-slate-200">Loading event...</div>;
  }

  if (errorMessage) {
    return <div className="p-6 text-red-600">{errorMessage}</div>;
  }

  if (!event) {
    return (
      <div className="p-6 text-slate-200">
        <p className="mb-4">Event not found.</p>
        <Link href="/" className="text-cyan-300 hover:text-cyan-200">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          Back to events
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">{event.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          Live event price:{" "}
          <span className="font-semibold text-cyan-200">{toCents(liveEventPrice)}</span> (
          {toPercent(liveEventPrice)})
        </p>

        <div className="mt-8 space-y-5">
          {event.markets.map((market, marketIndex) => (
            <section
              key={market.id}
              className="rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_10px_24px_rgba(2,6,23,0.45)]"
            >
              <h2 className="text-lg font-semibold text-slate-100">{market.question}</h2>
              <div className="mt-4 space-y-3">
                {market.outcomes.map((outcome, outcomeIndex) => {
                  const isPrimaryMarket = marketIndex === 0;
                  const isFirstOutcome = outcomeIndex === 0;
                  const isSecondOutcome = outcomeIndex === 1;

                  let effectivePrice = clampProbability(outcome.price);

                  if (isPrimaryMarket && liveEventPrice !== null) {
                    if (isFirstOutcome) {
                      effectivePrice = liveEventPrice;
                    } else if (isSecondOutcome) {
                      effectivePrice = clampProbability(1 - liveEventPrice);
                    }
                  }

                  const width = effectivePrice !== null ? `${Math.round(effectivePrice * 100)}%` : "0%";

                  return (
                    <div key={`${market.id}-${outcome.label}`} className="rounded-lg border border-slate-800 p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-200">{outcome.label}</span>
                        <span className="text-cyan-200">
                          {toCents(effectivePrice)} ({toPercent(effectivePrice)})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
