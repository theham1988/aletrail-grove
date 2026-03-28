import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const DEFAULT_STYLE_PILLS = ["All", "IPA", "Stout", "Sour", "Cider"];

export default function VendorList({ vendors, onVendorSelect }) {
  const [query, setQuery] = useState("");
  const [activeStyle, setActiveStyle] = useState("All");

  const stylePills = useMemo(() => {
    const beerStyles = vendors.flatMap((vendor) => (vendor.beers || []).map((beer) => beer.style)).filter(Boolean);
    const uniqueStyles = [...new Set(beerStyles)];

    return DEFAULT_STYLE_PILLS.concat(uniqueStyles.filter((style) => !DEFAULT_STYLE_PILLS.includes(style)));
  }, [vendors]);

  const visibleVendors = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return vendors.filter((vendor) => {
      const beers = vendor.beers || [];
      const matchesQuery =
        !normalized ||
        vendor.name.toLowerCase().includes(normalized) ||
        beers.some(
          (beer) =>
            beer.name.toLowerCase().includes(normalized) || beer.style.toLowerCase().includes(normalized),
        );

      const matchesStyle =
        activeStyle === "All" || beers.some((beer) => beer.style.toLowerCase() === activeStyle.toLowerCase());

      return matchesQuery && matchesStyle;
    });
  }, [activeStyle, vendors, query]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-carnival-gold bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-carnival-red">Vendor Directory</h2>
        <p className="mt-1 text-sm text-forest-muted">
          Search by vendor name, beer name, or style. Tap a vendor to open details.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {stylePills.map((style) => {
            const active = activeStyle === style;
            return (
              <button
                key={style}
                type="button"
                onClick={() => setActiveStyle(style)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition ${
                  active
                    ? "border-carnival-red bg-carnival-red text-white"
                    : "border-carnival-gold bg-carnival-cream text-carnival-dark"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 rounded-xl border border-carnival-gold bg-carnival-cream px-3 py-2">
            <Search size={16} className="text-forest-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vendors..."
              className="w-full bg-transparent text-sm text-carnival-dark outline-none placeholder:text-forest-muted"
            />
          </label>
        </div>
      </div>

      <div className="max-h-[52vh] space-y-3 overflow-y-auto pb-2">
        {visibleVendors.map((vendor) => (
          <article
            key={vendor.id}
            className="cursor-pointer rounded-2xl border border-carnival-gold bg-white p-4 shadow-sm transition hover:border-carnival-red active:scale-[0.98]"
            onClick={() => onVendorSelect?.(vendor)}
          >
            <div>
              <h3 className="text-base font-extrabold text-carnival-dark">{vendor.name}</h3>
              <p className="text-xs font-bold uppercase tracking-wide text-forest-muted">
                Booth: {vendor.booth || "TBA"}
              </p>
            </div>
            <p className="mt-2 text-xs font-semibold text-forest-muted">
              Passports: {vendor.activePassports.join(", ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(vendor.beers || []).slice(0, 3).map((beer) => (
                <span
                  key={`${vendor.id}-${beer.name}`}
                  className="rounded-full border border-carnival-gold bg-carnival-cream px-3 py-1 text-[11px] font-bold text-carnival-dark"
                >
                  {beer.name} · {beer.style}
                </span>
              ))}
              {(!vendor.beers || vendor.beers.length === 0) && (
                <span className="rounded-full border border-dashed border-carnival-gold px-3 py-1 text-[11px] font-semibold text-forest-muted">
                  Beer list coming soon
                </span>
              )}
            </div>
          </article>
        ))}

        {visibleVendors.length === 0 && (
          <p className="rounded-2xl border border-dashed border-carnival-gold bg-carnival-cream p-6 text-center text-sm text-forest-muted">
            No vendors found for this search/filter.
          </p>
        )}
      </div>
    </section>
  );
}
