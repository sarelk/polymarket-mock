"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { CategoryNav } from "@/components/CategoryNav";
import { EventCard } from "@/components/EventCard";
import { LiveStatus } from "@/components/LiveStatus";
import {
  EVENTS_CACHE_TTL_MS,
  dynamicEventCategoriesAtom,
  filteredEventsAtom,
  eventsErrorAtom,
  isLoadingEventsAtom,
  isRefreshingEventsAtom,
  lastEventsFetchedAtAtom,
  loadEventsAtom,
  selectedCategoryAtom,
  tickEventPricesAtom,
} from "@/store/index";

const PAGE_SIZE = 12;
const MAX_VISIBLE_PAGE_BUTTONS = 10;

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

const buildPaginationItems = (totalPages: number, currentPage: number): PaginationItem[] => {
  if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middleSlots = MAX_VISIBLE_PAGE_BUTTONS - 2;
  let start = Math.max(2, currentPage - Math.floor(middleSlots / 2));
  let end = start + middleSlots - 1;

  if (end >= totalPages) {
    end = totalPages - 1;
    start = end - middleSlots + 1;
  }

  const items: PaginationItem[] = [1];

  if (start > 2) {
    items.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-right");
  }

  items.push(totalPages);

  return items;
};

export default function Home() {
  const filteredEvents = useAtomValue(filteredEventsAtom);
  const categories = useAtomValue(dynamicEventCategoriesAtom);
  const isLoading = useAtomValue(isLoadingEventsAtom);
  const isRefreshing = useAtomValue(isRefreshingEventsAtom);
  const errorMessage = useAtomValue(eventsErrorAtom);
  const lastFetchedAt = useAtomValue(lastEventsFetchedAtAtom);
  const selectedCategory = useAtomValue(selectedCategoryAtom);
  const loadEvents = useSetAtom(loadEventsAtom);
  const setSelectedCategory = useSetAtom(selectedCategoryAtom);
  const tickEventPrices = useSetAtom(tickEventPricesAtom);
  const [pageByCategory, setPageByCategory] = useState<Record<string, number>>({});

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE)),
    [filteredEvents.length],
  );
  const currentPage = Math.min(pageByCategory[selectedCategory] ?? 1, totalPages);
  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages, currentPage),
    [totalPages, currentPage],
  );

  const setCurrentPage = (nextPage: number) => {
    setPageByCategory((previous) => ({
      ...previous,
      [selectedCategory]: Math.min(Math.max(1, nextPage), totalPages),
    }));
  };

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

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

  if (isLoading) {
    return <div className="p-6">Loading events...</div>;
  }

  if (errorMessage) {
    return <div className="p-6 text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6">
      <div className="mx-auto max-w-5xl">
        <LiveStatus isRefreshing={isRefreshing} lastFetchedAt={lastFetchedAt} />
        <h1 className="mb-6 text-2xl font-semibold text-slate-100">Trending Events</h1>
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0b1328] p-6 text-sm text-slate-300">
            No events found for{" "}
            <span className="font-semibold text-slate-100 capitalize">{selectedCategory}</span>.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedEvents.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              title={event.title}
              imageUrl={event.image}
              volume={event.volume}
              marketQuestion={event.markets[0]?.question ?? null}
              firstOutcomeLabel={event.markets[0]?.outcomes[0]?.label ?? null}
              secondOutcomeLabel={event.markets[0]?.outcomes[1]?.label ?? null}
            />
          ))}
        </div>
        {filteredEvents.length > 0 ? (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1328] px-4 py-3">
            <p className="text-sm text-slate-300">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                      item === currentPage
                        ? "bg-cyan-500/20 text-cyan-100"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="px-1 text-sm text-slate-500">
                    ...
                  </span>
                ),
              )}
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}