export type EventOutcome = {
  label: string;
  price: number | null;
};

export type EventMarket = {
  id: string;
  question: string;
  slug: string | null;
  liquidity: number | null;
  volume: number | null;
  active: boolean;
  closed: boolean;
  endDate: string | null;
  outcomes: EventOutcome[];
};

export type EventTag = {
  id: string;
  label: string;
  slug: string | null;
};

export type EventModel = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  category: string | null;
  active: boolean;
  closed: boolean;
  startDate: string | null;
  endDate: string | null;
  liquidity: number | null;
  volume: number | null;
  markets: EventMarket[];
  tags: EventTag[];
};
