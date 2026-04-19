"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { EventCard } from "@/components/EventCard";
import {
  eventsAtom,
  eventsErrorAtom,
  isLoadingEventsAtom,
  loadEventsAtom,
  tickEventPricesAtom,
} from "@/store/index";

export default function Home() {
  const events = useAtomValue(eventsAtom);
  const isLoading = useAtomValue(isLoadingEventsAtom);
  const errorMessage = useAtomValue(eventsErrorAtom);
  const loadEvents = useSetAtom(loadEventsAtom);
  const tickEventPrices = useSetAtom(tickEventPricesAtom);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickEventPrices();
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [tickEventPrices]);

  if (isLoading) {
    return <div className="p-6">Loading events...</div>;
  }

  if (errorMessage) {
    return <div className="p-6 text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold text-slate-100">Trending Events</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              volume={event.volume}
            />
          ))}
        </div>
      </div>
    </div>
  );
}