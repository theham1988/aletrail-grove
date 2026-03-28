import { useState } from "react";
import { MapPinned, QrCode, X } from "lucide-react";
import FestivalMapInteractive from "../components/FestivalMapInteractive";
import VendorList from "../components/VendorList";
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
  const [selectedVendor, setSelectedVendor] = useState(null);

  const currentTier = getCurrentTier(stamps.length);
  const previousTierTarget = tiers[tiers.findIndex((tier) => tier.id === currentTier.id) - 1]?.target || 0;
  const tierProgress = Math.min(100, Math.round(((stamps.length - previousTierTarget) / (currentTier.target - previousTierTarget)) * 100));

  const slotIds = Array.from({ length: currentTier.end - currentTier.start + 1 }, (_, index) => currentTier.start + index);

  return (
    <section className="carnival-scope">
      <div className="back-button-wrap">
        <button type="button" className="btn-outline pressable" onClick={onBack}>
          {t("back_to_hub")}
        </button>
      </div>

      <header className="experience-header-compact">
        <h1>{t("coming_soon")}</h1>
        <h2>{t("rig_title")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("hub_card_festival_title")}</h3>
        <p>{t("rig_desc")}</p>
      </div>

      <div className="trail-header">{t("festival_map")}</div>
      <FestivalMapInteractive vendors={vendors} onVendorSelect={setSelectedVendor} />

      <VendorList vendors={vendors} onVendorSelect={setSelectedVendor} />

      <div className="trail-header">Road In Grove Progress</div>
      <div className="info-card">
        <div className="passport-header compact-passport-header">
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

      <div className="sticky-scan-wrap">
        <button type="button" className="scan-btn carnival pressable" onClick={onScan} disabled={syncing}>
          <span className="icon-label">
            <QrCode size={18} />
            {syncing ? t("syncing") : t("scan_btn")}
          </span>
        </button>
      </div>

      <div className={`overlay ${selectedVendor ? "open" : ""}`} onClick={() => setSelectedVendor(null)} />
      <div className={`bottom-sheet ${selectedVendor ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSelectedVendor(null)}>
          <X size={16} />
        </button>
        <div className="sheet-area">
          {t("booth")} {selectedVendor?.booth || "TBA"}
        </div>
        <h2 className="sheet-title">{selectedVendor?.name || ""}</h2>
        <p className="sheet-desc">
          {selectedVendor
            ? `${selectedVendor.activePassports.length} active passport(s). Tap scan to collect eligible stamps.`
            : ""}
        </p>
        <div className="beer-list">
          <h4>{t("pouring")}</h4>
          <ul>
            {(selectedVendor?.beers || []).map((beer) => (
              <li key={`${selectedVendor.id}-${beer.name}`}>
                {beer.name} · {beer.style} · {beer.abv}
              </li>
            ))}
            {selectedVendor && (!selectedVendor.beers || selectedVendor.beers.length === 0) && <li>Beer list coming soon</li>}
          </ul>
        </div>
        <button className="dir-btn" onClick={() => setSelectedVendor(null)}>
          <MapPinned size={16} />
          Close
        </button>
      </div>
    </section>
  );
}
