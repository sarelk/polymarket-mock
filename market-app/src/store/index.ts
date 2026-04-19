import { atom } from "jotai";
import { getEvents } from "@/services/polymarket";
import type { EventModel } from "@/types/event";

export const eventsAtom = atom<EventModel[]>([]);
export const isLoadingEventsAtom = atom<boolean>(true);
export const eventsErrorAtom = atom<string | null>(null);

export const loadEventsAtom = atom(null, async (_get, set) => {
  set(isLoadingEventsAtom, true);
  set(eventsErrorAtom, null);

  try {
    const data = await getEvents({ limit: 20, active: true });
    set(eventsAtom, data);
  } catch (error) {
    set(eventsErrorAtom, error instanceof Error ? error.message : "Failed to load events");
  } finally {
    set(isLoadingEventsAtom, false);
  }
});
