import { QrCode } from "lucide-react";

const tiers = [
  { id: "tier_1", label: "Tier 1", target: 5, start: 1, end: 5 },
  { id: "tier_2", label: "Tier 2", target: 15, start: 6, end: 15 },
  { id: "tier_3", label: "Tier 3", target: 30, start: 16, end: 30 },
  { id: "grand_prize", label: "Grand Prize", target: 49, start: 31, end: 49 },
];

function getCurrentTier(totalStamps) {
  return tiers.find((tier) => totalStamps < tier.target) || tiers[tiers.length - 1];
}

export default function RoadInGrovePassportView({ stamps, onScan, syncing }) {
  const totalStamps = stamps.length;
  const currentTier = getCurrentTier(totalStamps);
  const previousTierTarget = tiers[tiers.findIndex((tier) => tier.id === currentTier.id) - 1]?.target || 0;
  const tierSpan = currentTier.target - previousTierTarget;
  const tierProgress = Math.min(100, Math.round(((totalStamps - previousTierTarget) / tierSpan) * 100));
  const slotIds = Array.from(
    { length: currentTier.end - currentTier.start + 1 },
    (_, index) => currentTier.start + index,
  );

  return (
    <section className="carnival-scope">
      <header>
        <p className="label">Festival Passport</p>
        <h2 style={{ fontSize: "24px", margin: "6px 0 0", color: "var(--text-main)", fontWeight: 800 }}>
          Road In Grove Progress
        </h2>
        <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600 }}>
          {totalStamps}/49 collected · Current milestone: {currentTier.label} ({currentTier.target} stamps)
        </p>
      </header>

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
          <span className="label">Current Tier Slots</span>
          <span className="label count-label">
            {totalStamps} / 49 <span>Collected</span>
          </span>
        </div>

        <div className="grid">
          {slotIds.map((slotId) => {
            const active = stamps.includes(slotId);
            return (
              <div key={slotId} className={`slot ${active ? "active" : ""}`}>
                {slotId}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "sticky", bottom: "84px", marginTop: "auto", paddingTop: "6px" }}>
        <button type="button" onClick={onScan} disabled={syncing} className="scan-btn carnival pressable">
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <QrCode size={20} />
            {syncing ? "Scanning..." : "Scan QR"}
          </span>
        </button>
      </div>
    </section>
  );
}
