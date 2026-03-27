import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";

export default function VendorList({ vendors }) {
  const [query, setQuery] = useState("");

  const visibleVendors = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return vendors.filter((vendor) => !normalized || vendor.name.toLowerCase().includes(normalized));
  }, [vendors, query]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-carnival-gold bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-carnival-red">Vendor Directory</h2>
        <p className="mt-1 text-sm text-forest-muted">Search by vendor name. Ready for 49 vendors.</p>

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
            className="rounded-2xl border border-carnival-gold bg-white p-4 shadow-sm transition hover:border-carnival-red"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-carnival-dark">{vendor.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wide text-forest-muted">
                  Booth: {vendor.booth || "TBA"}
                </p>
              </div>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-carnival-gold px-2 py-1 text-xs font-bold text-carnival-red"
                onClick={(event) => event.preventDefault()}
              >
                Map
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="mt-2 text-xs font-semibold text-forest-muted">
              Passports: {vendor.activePassports.join(", ")}
            </p>
          </article>
        ))}

        {visibleVendors.length === 0 && (
          <p className="rounded-2xl border border-dashed border-carnival-gold bg-carnival-cream p-6 text-center text-sm text-forest-muted">
            No vendors found for this search.
          </p>
        )}
      </div>
    </section>
  );
}
