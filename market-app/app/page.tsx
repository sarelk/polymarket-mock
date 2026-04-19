"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { CategoryNav } from "@/components/CategoryNav";
import { EventCard } from "@/components/EventCard";
import {
  EVENT_CATEGORIES,
  filteredEventsAtom,
  eventsErrorAtom,
  isLoadingEventsAtom,
  loadEventsAtom,
  selectedCategoryAtom,
  tickEventPricesAtom,
} from "@/store/index";

export default function Home() {
  const events = useAtomValue(filteredEventsAtom);
  const isLoading = useAtomValue(isLoadingEventsAtom);
  const errorMessage = useAtomValue(eventsErrorAtom);
  const selectedCategory = useAtomValue(selectedCategoryAtom);
  const loadEvents = useSetAtom(loadEventsAtom);
  const setSelectedCategory = useSetAtom(selectedCategoryAtom);
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
        <CategoryNav
          categories={EVENT_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {events.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0b1328] p-6 text-sm text-slate-300">
            No events found for{" "}
            <span className="font-semibold text-slate-100 capitalize">{selectedCategory}</span>.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              imageUrl={event.image}
              volume={event.volume}
              marketQuestion={event.markets[0]?.question ?? null}
              outcomeLabels={event.markets[0]?.outcomes.map((outcome) => outcome.label) ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}