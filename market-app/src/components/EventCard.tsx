type EventCardProps = {
  title: string;
  volume: number | null;
};

const formatVolume = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export function EventCard({ title, volume }: EventCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 shadow-[0_10px_24px_rgba(2,6,23,0.45)] transition-colors hover:bg-[#111d36]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Event</p>
      <h2 className="mt-2 text-base font-semibold leading-snug text-slate-100">{title}</h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Volume</span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
          {formatVolume(volume)}
        </span>
      </div>
    </article>
  );
}
