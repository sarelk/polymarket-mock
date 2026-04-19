import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getEvents } from "@/services/polymarket";
import type { EventModel } from "@/types/event";

export const EVENT_CATEGORIES = ["all", "crypto", "sports", "politics"] as const;
export type EventCategory = string;

export const eventsAtom = atom<EventModel[]>([]);
export const isLoadingEventsAtom = atom<boolean>(true);
export const eventsErrorAtom = atom<string | null>(null);
export const eventPricesAtom = atom<Record<string, number>>({});
export const selectedCategoryAtom = atom<EventCategory>("all");

const toInitialPrice = (event: EventModel): number => {
  const fromMarket = event.markets[0]?.outcomes[0]?.price;
  if (fromMarket !== null && fromMarket !== undefined && Number.isFinite(fromMarket)) {
    return Math.min(0.99, Math.max(0.01, fromMarket));
  }

  return Number((0.35 + Math.random() * 0.3).toFixed(3));
};

const clampPrice = (value: number): number => {
  return Math.min(0.99, Math.max(0.01, value));
};

const normalize = (value: string | null | undefined): string => (value ?? "").toLowerCase();

const includesCategory = (value: string | null | undefined, category: EventCategory): boolean => {
  return normalize(value).includes(category);
};

const toCategoryKey = (value: string | null | undefined): string => {
  const normalized = normalize(value).trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const matchesCategory = (event: EventModel, category: EventCategory): boolean => {
  if (category === "all") {
    return true;
  }

  const categoryMetadata = [
    event.category,
    event.slug,
    ...event.tags.map((tag) => tag.label),
    ...event.tags.map((tag) => tag.slug),
    ...event.markets.map((market) => market.slug),
  ];

  return categoryMetadata.some((value) => includesCategory(value, category));
};

export const filteredEventsAtom = atom((get) => {
  const events = get(eventsAtom);
  const selectedCategory = get(selectedCategoryAtom);
  return events.filter((event) => matchesCategory(event, selectedCategory));
});

export const dynamicEventCategoriesAtom = atom((get) => {
  const events = get(eventsAtom);
  const counts = new Map<string, number>();

  for (const event of events) {
    const discoveredCategories = new Set<string>();

    discoveredCategories.add(toCategoryKey(event.category));
    for (const tag of event.tags) {
      discoveredCategories.add(toCategoryKey(tag.slug));
      discoveredCategories.add(toCategoryKey(tag.label));
    }

    for (const category of discoveredCategories) {
      if (!category || category === "all") {
        continue;
      }

      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  const coreSet = new Set<string>(EVENT_CATEGORIES);
  const dynamicCategories = Array.from(counts.entries())
    .filter(([category, count]) => !coreSet.has(category) && count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category]) => category);

  return [...EVENT_CATEGORIES, ...dynamicCategories];
});

export const eventPriceAtomFamily = atomFamily((eventId: string) =>
  atom((get) => get(eventPricesAtom)[eventId] ?? null),
);
export const eventByIdAtomFamily = atomFamily((eventId: string) =>
  atom((get) => get(eventsAtom).find((event) => event.id === eventId) ?? null),
);

export const loadEventsAtom = atom(null, async (_get, set) => {
  set(isLoadingEventsAtom, true);
  set(eventsErrorAtom, null);

  try {
    const data = await getEvents({ limit: 200, active: true });
    set(eventsAtom, data);
    set(
      eventPricesAtom,
      Object.fromEntries(data.map((event) => [event.id, toInitialPrice(event)])),
    );
  } catch (error) {
    set(eventsErrorAtom, error instanceof Error ? error.message : "Failed to load events");
  } finally {
    set(isLoadingEventsAtom, false);
  }
});

export const tickEventPricesAtom = atom(null, (get, set) => {
  const currentPrices = get(eventPricesAtom);
  const eventIds = Object.keys(currentPrices);

  if (eventIds.length === 0) {
    return;
  }

  const nextPrices = { ...currentPrices };
  const updatesCount = Math.min(3, eventIds.length);

  for (let i = 0; i < updatesCount; i += 1) {
    const randomId = eventIds[Math.floor(Math.random() * eventIds.length)];
    const currentPrice = nextPrices[randomId];
    const delta = (Math.random() - 0.5) * 0.04;
    nextPrices[randomId] = Number(clampPrice(currentPrice + delta).toFixed(3));
  }

  set(eventPricesAtom, nextPrices);
});
