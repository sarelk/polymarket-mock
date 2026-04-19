import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getEvents } from "@/services/polymarket";
import type { EventModel } from "@/types/event";

export const eventsAtom = atom<EventModel[]>([]);
export const isLoadingEventsAtom = atom<boolean>(true);
export const eventsErrorAtom = atom<string | null>(null);
export const eventPricesAtom = atom<Record<string, number>>({});

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

export const eventPriceAtomFamily = atomFamily((eventId: string) =>
  atom((get) => get(eventPricesAtom)[eventId] ?? null),
);

export const loadEventsAtom = atom(null, async (_get, set) => {
  set(isLoadingEventsAtom, true);
  set(eventsErrorAtom, null);

  try {
    const data = await getEvents({ limit: 20, active: true });
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
