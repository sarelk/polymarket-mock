"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { EventImage } from "@/components/EventImage";
import { LiveStatus } from "@/components/LiveStatus";
import {
  EVENTS_CACHE_TTL_MS,
  eventByIdAtomFamily,
  eventPriceAtomFamily,
  eventsErrorAtom,
  isLoadingEventsAtom,
  isRefreshingEventsAtom,
  lastEventsFetchedAtAtom,
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

type PriceTrend = {
  direction: "up" | "down";
  pulseId: number;
};

const getEffectiveOutcomePrice = (
  marketIndex: number,
  outcomeIndex: number,
  outcomePrice: number | null,
  liveEventPrice: number | null,
): number | null => {
  const isPrimaryMarket = marketIndex === 0;
  const isFirstOutcome = outcomeIndex === 0;
  const isSecondOutcome = outcomeIndex === 1;

  if (isPrimaryMarket && liveEventPrice !== null) {
    if (isFirstOutcome) {
      return liveEventPrice;
    }

    if (isSecondOutcome) {
      return clampProbability(1 - liveEventPrice);
    }
  }

  return clampProbability(outcomePrice);
};

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = typeof params.eventId === "string" ? params.eventId : "";

  const event = useAtomValue(eventByIdAtomFamily(eventId));
  const liveEventPrice = useAtomValue(eventPriceAtomFamily(eventId));
  const isLoading = useAtomValue(isLoadingEventsAtom);
  const isRefreshing = useAtomValue(isRefreshingEventsAtom);
  const errorMessage = useAtomValue(eventsErrorAtom);
  const lastFetchedAt = useAtomValue(lastEventsFetchedAtAtom);
  const loadEvents = useSetAtom(loadEventsAtom);
  const tickEventPrices = useSetAtom(tickEventPricesAtom);
  const previousOutcomePricesRef = useRef<Record<string, number>>({});
  const pulseCounterRef = useRef(0);
  const [priceTrends, setPriceTrends] = useState<Record<string, PriceTrend>>({});

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadEvents({ force: true });
    }, EVENTS_CACHE_TTL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickEventPrices();
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [tickEventPrices]);

  useEffect(() => {
    if (!event) {
      return;
    }

    const nextOutcomePrices: Record<string, number> = {};
    const trendUpdates: Record<string, PriceTrend> = {};

    for (let marketIndex = 0; marketIndex < event.markets.length; marketIndex += 1) {
      const market = event.markets[marketIndex];
      for (let outcomeIndex = 0; outcomeIndex < market.outcomes.length; outcomeIndex += 1) {
        const outcome = market.outcomes[outcomeIndex];
        const outcomeKey = `${market.id}-${outcome.label}`;
        const effectivePrice = getEffectiveOutcomePrice(
          marketIndex,
          outcomeIndex,
          outcome.price,
          liveEventPrice,
        );

        const previousPrice = previousOutcomePricesRef.current[outcomeKey];
        if (
          effectivePrice !== null &&
          previousPrice !== undefined &&
          previousPrice !== effectivePrice
        ) {
          pulseCounterRef.current += 1;
          trendUpdates[outcomeKey] = {
            direction: effectivePrice > previousPrice ? "up" : "down",
            pulseId: pulseCounterRef.current,
          };
        }

        if (effectivePrice !== null) {
          nextOutcomePrices[outcomeKey] = effectivePrice;
        }
      }
    }

    previousOutcomePricesRef.current = nextOutcomePrices;

    if (Object.keys(trendUpdates).length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPriceTrends((previous) => ({ ...previous, ...trendUpdates }));
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [event, liveEventPrice]);

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
        <LiveStatus isRefreshing={isRefreshing} lastFetchedAt={lastFetchedAt} />
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          Back to events
        </Link>
        <div className="mt-4 flex items-start gap-4">
          <EventImage
            src={event.image}
            alt={event.title}
            size={72}
            className="shrink-0 rounded-xl object-cover"
          />
          <h1 className="text-3xl font-semibold">{event.title}</h1>
        </div>
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
                  const effectivePrice = getEffectiveOutcomePrice(
                    marketIndex,
                    outcomeIndex,
                    outcome.price,
                    liveEventPrice,
                  );
                  const outcomeKey = `${market.id}-${outcome.label}`;
                  const trend = priceTrends[outcomeKey];
                  const width = effectivePrice !== null ? `${Math.round(effectivePrice * 100)}%` : "0%";

                  return (
                    <div key={outcomeKey} className="rounded-lg border border-slate-800 p-3">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-200">{outcome.label}</span>
                        <span
                          key={`value-${outcomeKey}-${trend?.pulseId ?? 0}`}
                          className={`rounded px-1 py-0.5 ${
                            trend?.direction === "up"
                              ? "price-flash-up text-emerald-100"
                              : trend?.direction === "down"
                                ? "price-flash-down text-rose-100"
                                : "text-cyan-200"
                          }`}
                        >
                          {toCents(effectivePrice)} ({toPercent(effectivePrice)})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          key={`bar-${outcomeKey}-${trend?.pulseId ?? 0}`}
                          className={`h-2 rounded-full transition-all duration-500 ${
                            trend?.direction === "up"
                              ? "bar-flash-up bg-emerald-400"
                              : trend?.direction === "down"
                                ? "bar-flash-down bg-rose-400"
                                : "bg-cyan-400"
                          }`}
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
