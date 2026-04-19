import { NextRequest, NextResponse } from "next/server";

const POLYMARKET_GAMMA_BASE_URL =
  process.env.POLYMARKET_GAMMA_URL ??
  process.env.NEXT_PUBLIC_POLYMARKET_GAMMA_URL ??
  "https://gamma-api.polymarket.com";

const FILTER_KEYS = ["limit", "offset", "active", "closed"] as const;

export async function GET(request: NextRequest) {
  const upstreamUrl = new URL("/events", POLYMARKET_GAMMA_BASE_URL);

  for (const key of FILTER_KEYS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) {
      upstreamUrl.searchParams.set(key, value);
    }
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch Polymarket events: ${upstreamResponse.status} ${upstreamResponse.statusText}`,
        },
        { status: upstreamResponse.status },
      );
    }

    const data: unknown = await upstreamResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch Polymarket events" }, { status: 502 });
  }
}
