"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/services/polymarket";
import type { EventModel } from "@/types/event";

export default function Home() {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const data = await getEvents({ limit: 20, active: true });
        if (isMounted) {
          setEvents(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load events");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading events...</div>;
  }

  if (errorMessage) {
    return <div className="p-6 text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="p-6 space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded border border-gray-200 p-3">
          <h2 className="font-semibold">{event.title}</h2>
          {event.description ? <p className="text-sm text-gray-600">{event.description}</p> : null}
        </div>
      ))}
    </div>
  );
}