import type { EventMarket, EventModel, EventOutcome, EventTag } from "@/types/event";

const EVENTS_API_PATH = "/api/events";

type RawTag = {
  id?: string | number | null;
  label?: string | null;
  slug?: string | null;
};

type RawMarket = {
  id?: string | null;
  question?: string | null;
  slug?: string | null;
  liquidity?: string | number | null;
  volume?: string | number | null;
  active?: boolean | null;
  closed?: boolean | null;
  endDate?: string | null;
  outcomes?: string | null;
  outcomePrices?: string | null;
};

type RawEvent = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  active?: boolean | null;
  closed?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  liquidity?: string | number | null;
  volume?: string | number | null;
  markets?: RawMarket[] | null;
  tags?: RawTag[] | null;
};

export type FetchEventsOptions = {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  signal?: AbortSignal;
};

const toNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseStringArray = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
};

const mapMarketOutcomes = (market: RawMarket): EventOutcome[] => {
  const labels = parseStringArray(market.outcomes);
  const prices = parseStringArray(market.outcomePrices);
  const maxLength = Math.max(labels.length, prices.length);

  return Array.from({ length: maxLength }, (_, index) => ({
    label: labels[index] ?? `Outcome ${index + 1}`,
    price: toNullableNumber(prices[index] ?? null),
  }));
};

const mapMarket = (market: RawMarket): EventMarket => ({
  id: market.id ?? "",
  question: market.question ?? "",
  slug: market.slug ?? null,
  liquidity: toNullableNumber(market.liquidity),
  volume: toNullableNumber(market.volume),
  active: Boolean(market.active),
  closed: Boolean(market.closed),
  endDate: market.endDate ?? null,
  outcomes: mapMarketOutcomes(market),
});

const mapTag = (tag: RawTag): EventTag => ({
  id: tag.id !== null && tag.id !== undefined ? String(tag.id) : "",
  label: tag.label ?? "",
  slug: tag.slug ?? null,
});

const mapEvent = (event: RawEvent): EventModel => ({
  id: event.id ?? "",
  slug: event.slug ?? "",
  title: event.title ?? "",
  description: event.description ?? null,
  image: event.image ?? null,
  category: event.category ?? null,
  active: Boolean(event.active),
  closed: Boolean(event.closed),
  startDate: event.startDate ?? null,
  endDate: event.endDate ?? null,
  liquidity: toNullableNumber(event.liquidity),
  volume: toNullableNumber(event.volume),
  markets: Array.isArray(event.markets) ? event.markets.map(mapMarket) : [],
  tags: Array.isArray(event.tags) ? event.tags.map(mapTag) : [],
});

const createEventsUrl = (options: FetchEventsOptions): string => {
  const url = new URL(EVENTS_API_PATH, "http://localhost");

  if (options.limit !== undefined) {
    url.searchParams.set("limit", String(options.limit));
  }

  if (options.offset !== undefined) {
    url.searchParams.set("offset", String(options.offset));
  }

  if (options.active !== undefined) {
    url.searchParams.set("active", String(options.active));
  }

  if (options.closed !== undefined) {
    url.searchParams.set("closed", String(options.closed));
  }

  const queryString = url.searchParams.toString();
  return queryString ? `${EVENTS_API_PATH}?${queryString}` : EVENTS_API_PATH;
};

export async function fetchEvents(options: FetchEventsOptions = {}): Promise<EventModel[]> {
  const response = await fetch(createEventsUrl(options), {
    method: "GET",
    signal: options.signal,
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Polymarket events: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => mapEvent(item as RawEvent));
}
