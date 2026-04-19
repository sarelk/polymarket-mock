# Polymarket Mock

A Next.js + TypeScript mock of the core Polymarket browsing experience, built for the PLAEE frontend assignment.

## Stack

- Next.js (App Router)
- TypeScript
- Jotai for state management
- Tailwind CSS

## What Is Implemented

### Main Page (Events Grid)

- Event cards with:
  - title
  - event image
  - volume
  - market preview question
  - optional outcome preview chips
- Dynamic category navigation with core tabs pinned:
  - All, Crypto, Sports, Politics
  - plus dynamic categories discovered from event metadata
- Pagination (12 cards/page) with condensed page controls

### Event Detail Page

- Route: `/event/[eventId]`
- Event header with image + title
- All markets and outcomes displayed
- Outcome price display in cents and implied probability
- Probability bars for outcomes

### Realtime UX

- Simulated live price updates (no full page refresh)
- Per-event atomic subscription via Jotai atom families
- Price trend highlights (up/down flashes)
- Shared live status banner:
  - pulsing "Live" indicator
  - last fetched timestamp
  - refreshing status

## Architecture

### Data Layer

- `market-app/app/api/events/route.ts`
  - Server-side proxy to Polymarket Gamma API to avoid browser CORS issues.
- `market-app/src/services/events.service.ts`
  - Fetch + normalize raw API payload into typed `EventModel`.

### State Layer (Jotai)

- `market-app/src/store/index.ts`
  - core atoms for events, loading/error, selected category
  - atom families for per-event reads (`eventPriceAtomFamily`, `eventByIdAtomFamily`)
  - derived atoms for filtered events and dynamic categories
  - write atoms for loading events and ticking simulated prices

### UI Layer

- `market-app/src/components/EventCard.tsx`
- `market-app/src/components/EventImage.tsx`
- `market-app/src/components/LiveStatus.tsx`
- `market-app/src/components/CategoryNav.tsx`
- `market-app/app/page.tsx`
- `market-app/app/event/[eventId]/page.tsx`

## Realtime Approach

- Prices are simulated on a timer (`tickEventPricesAtom`) for assignment-friendly live behavior.
- Only a subset of prices update each tick.
- UI components subscribe to atomic slices so unaffected cards do not re-render.

## Performance And Caching

- Memoized components (`EventCard`) and derived values (`useMemo`) on list page.
- Atom families reduce unnecessary re-renders by keying subscriptions per event.
- Event fetches use a stale-time cache window (`EVENTS_CACHE_TTL_MS`) and periodic background refresh.
- Background refresh does not re-trigger initial full-screen loading.

## Getting Started

### 1) Install dependencies

```bash
cd market-app
npm install
```

### 2) Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3) Lint

```bash
npm run lint
```

## Environment

No required environment variables for local use.

Optional:

- `POLYMARKET_GAMMA_URL`
- `NEXT_PUBLIC_POLYMARKET_GAMMA_URL`

If unset, defaults to `https://gamma-api.polymarket.com`.

## Limitations

- Realtime prices are simulated (not WebSocket/orderbook-backed).
- Category classification is metadata-based and depends on upstream taxonomy quality.
- Event detail pricing currently maps live event price primarily onto the first market outcomes for visual coherence.
- Pagination and category filtering are client-side.
