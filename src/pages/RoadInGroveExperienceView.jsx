import { useMemo, useState } from "react";
import { ChevronRight, QrCode, Search } from "lucide-react";
import vendors from "../data/vendors.json";
import { useLanguage } from "../contexts/LanguageContext";

const tiers = [
  { id: "tier_1", label: "Tier 1", target: 5, start: 1, end: 5 },
  { id: "tier_2", label: "Tier 2", target: 15, start: 6, end: 15 },
  { id: "tier_3", label: "Tier 3", target: 30, start: 16, end: 30 },
  { id: "grand_prize", label: "Grand Prize", target: 49, start: 31, end: 49 },
];

function getCurrentTier(totalStamps) {
  return tiers.find((tier) => totalStamps < tier.target) || tiers[tiers.length - 1];
}

export default function RoadInGroveExperienceView({ stamps, syncing, onScan, onBack }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const currentTier = getCurrentTier(stamps.length);
  const previousTierTarget = tiers[tiers.findIndex((tier) => tier.id === currentTier.id) - 1]?.target || 0;
  const tierProgress = Math.min(100, Math.round(((stamps.length - previousTierTarget) / (currentTier.target - previousTierTarget)) * 100));

  const filteredVendors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return vendors;
    return vendors.filter((vendor) => vendor.name.toLowerCase().includes(normalized));
  }, [query]);

  const slotIds = Array.from({ length: currentTier.end - currentTier.start + 1 }, (_, index) => currentTier.start + index);

  return (
    <section className="carnival-scope">
      <button type="button" className="btn-outline pressable" onClick={onBack} style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>
        {t("back_to_hub")}
      </button>

      <header style={{ padding: "24px 20px 12px", textAlign: "center" }}>
        <h1>{t("coming_soon")}</h1>
        <h2>{t("rig_title")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("hub_card_festival_title")}</h3>
        <p>{t("rig_desc")}</p>
      </div>

      <img
        src="/festival-map.jpg"
        alt={t("festival_map")}
        className="pressable"
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "16px",
          objectFit: "cover",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          marginBottom: "18px",
        }}
      />

      <div className="info-card">
        <h3>{t("venue_header")}</h3>
        <label
          style={{
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-light)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
            marginTop: "14px",
          }}
        >
          <Search size={16} style={{ color: "var(--primary)" }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search_vendor")}
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--text-main)" }}
          />
        </label>
      </div>

      <div className="trail-map" style={{ maxHeight: "32vh", overflowY: "auto", marginTop: "6px" }}>
        {filteredVendors.map((vendor) => (
          <article key={vendor.id} className="vendor-stop">
            <h4 className="vendor-name">{vendor.name}</h4>
            <span className="vendor-area">
              {t("booth")} {vendor.booth || "TBA"}
            </span>
            <ChevronRight className="vendor-chevron" size={20} />
          </article>
        ))}
      </div>

      <div className="progress-wrap">
        <div className="passport-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
          <span className="label">{currentTier.label} Progress</span>
          <span className="count-label">{tierProgress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${tierProgress}%` }} />
        </div>
      </div>

      <div className="passport-container">
        <div className="passport-header">
          <span className="label">{t("festival_passport")}</span>
          <span className="label count-label">
            {stamps.length} / 49 <span>{t("collected")}</span>
          </span>
        </div>
        <div className="grid">
          {slotIds.map((slotId) => (
            <div key={slotId} className={`slot ${stamps.includes(slotId) ? "active" : ""}`}>
              {slotId}
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="scan-btn carnival pressable" onClick={onScan} disabled={syncing}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <QrCode size={18} />
          {syncing ? t("syncing") : t("scan_btn")}
        </span>
      </button>
    </section>
  );
}
