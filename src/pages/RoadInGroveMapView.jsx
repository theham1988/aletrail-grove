import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";

export default function RoadInGroveMapView({ vendors }) {
  const [query, setQuery] = useState("");

  const filteredVendors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return vendors;
    return vendors.filter((vendor) => vendor.name.toLowerCase().includes(normalized));
  }, [vendors, query]);

  return (
    <section className="carnival-scope">
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-carnival-red">Road In Grove Festival</p>
        <h1 className="mt-1 text-2xl font-extrabold">Festival Map</h1>
      </header>

      <img
        src="/festival-map.jpg"
        alt="Road In Grove Festival map"
        className="pressable"
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "16px",
          objectFit: "cover",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        }}
      />

      <div className="info-card mt-3">
        <h3>Vendor Directory</h3>
        <p>Search all 49 vendors in the Road In Grove festival passport.</p>
        <label
          className="mt-3"
          style={{
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-light)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
          }}
        >
          <Search size={16} style={{ color: "var(--primary)" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vendor..."
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--text-main)" }}
          />
        </label>
      </div>

      <div className="trail-header">Vendor List</div>
      <div className="trail-map max-h-[40vh] overflow-y-auto pr-1">
        {filteredVendors.map((vendor) => (
          <article key={vendor.id} className="vendor-stop">
            <h4 className="vendor-name">
              {vendor.id}. {vendor.name}
            </h4>
            <span className="vendor-area">Booth {vendor.booth || "TBA"}</span>
            <ChevronRight className="vendor-chevron" size={20} />
          </article>
        ))}
      </div>
    </section>
  );
}
