import FestivalEventStatusCard from "../components/FestivalEventStatusCard";
import { QrCode } from "lucide-react";
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

export default function RoadInGrovePassportTab({ stamps, syncing, onScan, festivalMeta, goldenBeerByDay }) {
  const { t } = useLanguage();
  const currentTier = getCurrentTier(stamps.length);
  const previousTierTarget = tiers[tiers.findIndex((tier) => tier.id === currentTier.id) - 1]?.target || 0;
  const tierProgress = Math.min(
    100,
    Math.round(((stamps.length - previousTierTarget) / (currentTier.target - previousTierTarget)) * 100),
  );
  const slotIds = Array.from(
    { length: currentTier.end - currentTier.start + 1 },
    (_, index) => currentTier.start + index,
  );

  return (
    <section className="carnival-scope pb-24">
      <header className="experience-header-compact">
        <h1>{t("festival_passport")}</h1>
        <h2>{t("road_in_grove_progress")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("hub_card_festival_title")}</h3>
        <p>{t("rig_desc")}</p>
      </div>

      <FestivalEventStatusCard
        stampsCount={stamps.length}
        festivalMeta={festivalMeta}
        goldenBeerByDay={goldenBeerByDay}
      />

      <div className="trail-header">{t("road_in_grove_progress")}</div>
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

      <div className="scan-fab-wrap">
        <button type="button" className="scan-fab carnival pressable" onClick={onScan} disabled={syncing}>
          <span className="icon-label">
            <QrCode size={18} />
            {syncing ? t("syncing") : t("scan_btn")}
          </span>
        </button>
      </div>
    </section>
  );
}
