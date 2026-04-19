"use client";

type LiveStatusProps = {
  isRefreshing: boolean;
  lastFetchedAt: number | null;
  className?: string;
};

const formatLastFetched = (lastFetchedAt: number | null): string => {
  if (!lastFetchedAt) {
    return "pending";
  }

  return new Date(lastFetchedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

export function LiveStatus({ isRefreshing, lastFetchedAt, className = "" }: LiveStatusProps) {
  return (
    <div
      className={`mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1328] px-3 py-2 text-xs text-slate-300 ${className}`.trim()}
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
        <span className="font-semibold uppercase tracking-wide text-rose-300">Live</span>
        {isRefreshing ? <span className="text-cyan-300">Refreshing...</span> : null}
      </div>
      <span>Last fetched: {formatLastFetched(lastFetchedAt)}</span>
    </div>
  );
}
