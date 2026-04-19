import type { EventCategory } from "@/store/index";

type CategoryNavProps = {
  categories: readonly EventCategory[];
  selectedCategory: EventCategory;
  onSelectCategory: (category: EventCategory) => void;
};

const toLabel = (category: EventCategory): string => {
  if (category === "all") {
    return "All";
  }

  return category
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

export function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Event categories">
      {categories.map((category) => {
        const isActive = category === selectedCategory;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                : "border-white/15 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-slate-100"
            }`}
          >
            {toLabel(category)}
          </button>
        );
      })}
    </nav>
  );
}
