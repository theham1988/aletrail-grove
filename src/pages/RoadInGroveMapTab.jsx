import { useMemo, useState } from "react";
import { QrCode, Search, X } from "lucide-react";
import FestivalMapInteractive from "../components/FestivalMapInteractive";
import FestivalVendorSheet from "../components/FestivalVendorSheet";
import vendors from "../data/vendors.json";
import { useLanguage } from "../contexts/LanguageContext";

function sortByBooth(a, b) {
  const parseBooth = (value) => {
    const match = /^([A-Z]+)(\d+)$/i.exec(value || "");
    if (!match) return { missing: true, prefix: "", number: Number.MAX_SAFE_INTEGER };
    return { missing: false, prefix: match[1], number: Number(match[2]) };
  };

  const boothA = parseBooth(a.booth);
  const boothB = parseBooth(b.booth);

  if (boothA.missing !== boothB.missing) {
    return boothA.missing ? 1 : -1;
  }

  if (boothA.prefix !== boothB.prefix) {
    return boothA.prefix.localeCompare(boothB.prefix);
  }

  if (boothA.number !== boothB.number) {
    return boothA.number - boothB.number;
  }

  return a.name.localeCompare(b.name);
}

export default function RoadInGroveMapTab({ syncing, onScan }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeVendorId, setActiveVendorId] = useState(null);

  const sortedVendors = useMemo(() => [...vendors].sort(sortByBooth), []);
  const visibleVendors = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return sortedVendors.filter((vendor) => {
      if (!normalized) return true;
      return (
        vendor.name.toLowerCase().includes(normalized) ||
        (vendor.booth || "").toLowerCase().includes(normalized) ||
        (vendor.beers || []).some((beer) => beer.name.toLowerCase().includes(normalized))
      );
    });
  }, [query, sortedVendors]);
  const visibleVendorIds = useMemo(() => new Set(visibleVendors.map((vendor) => vendor.id)), [visibleVendors]);
  const activeVendor = useMemo(
    () => vendors.find((vendor) => vendor.id === activeVendorId) || null,
    [activeVendorId],
  );

  const handleVendorSelect = (vendor) => {
    setActiveVendorId(vendor.id);
    setSelectedVendor(vendor);
  };

  return (
    <section className="carnival-scope pb-24">
      <header className="experience-header-compact">
        <h1>{t("coming_soon")}</h1>
        <h2>{t("rig_title")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("festival_map")}</h3>
        <p>{t("rig_desc")}</p>
      </div>

      <div className="trail-header">{t("festival_map")}</div>
      <div className="festival-map-search-card">
        <label className="festival-map-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search_vendor")}
          />
          {query && (
            <button type="button" className="festival-map-clear" onClick={() => setQuery("")}>
              <X size={14} />
            </button>
          )}
        </label>
        <div className="festival-map-search-meta">
          <span>{visibleVendors.length} vendors</span>
          {activeVendor && (
            <span className="festival-map-active-chip">
              {activeVendor.name} {activeVendor.booth ? `· ${t("booth")} ${activeVendor.booth}` : ""}
            </span>
          )}
        </div>
      </div>

      <FestivalMapInteractive
        vendors={vendors}
        activeVendorId={activeVendorId}
        visibleVendorIds={visibleVendorIds}
        hasQuery={Boolean(query.trim())}
        onVendorSelect={handleVendorSelect}
      />

      <div className="festival-map-results">
        {visibleVendors.map((vendor) => (
          <button
            key={vendor.id}
            type="button"
            className={`festival-map-result ${activeVendorId === vendor.id ? "active" : ""}`}
            onClick={() => handleVendorSelect(vendor)}
          >
            <div className="festival-map-result-copy">
              <strong>{vendor.name}</strong>
              <span>{vendor.booth ? `${t("booth")} ${vendor.booth}` : "Booth TBA"}</span>
            </div>
            <span className="festival-map-result-booth">{vendor.booth || "TBA"}</span>
          </button>
        ))}

        {visibleVendors.length === 0 && (
          <div className="festival-map-empty">No vendors match this search yet.</div>
        )}
      </div>

      <div className="scan-fab-wrap">
        <button type="button" className="scan-fab carnival pressable" onClick={onScan} disabled={syncing}>
          <span className="icon-label">
            <QrCode size={18} />
            {syncing ? t("syncing") : t("scan_btn")}
          </span>
        </button>
      </div>

      <FestivalVendorSheet vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
    </section>
  );
}
