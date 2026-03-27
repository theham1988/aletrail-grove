import { festivalTiers } from "../data/festivalConfig";

function getCurrentTier(stampCount) {
  return (
    festivalTiers.find((tier) => stampCount >= tier.start - 1 && stampCount < tier.end) ??
    festivalTiers[festivalTiers.length - 1]
  );
}

export default function PassportTierView({ festivalStamps }) {
  const currentTier = getCurrentTier(festivalStamps.length);
  const tierSlotCount = currentTier.end - currentTier.start + 1;
  const tierStampCount = festivalStamps.filter(
    (id) => id >= currentTier.start && id <= currentTier.end,
  ).length;
  const progress = Math.min(100, Math.round((tierStampCount / tierSlotCount) * 100));

  return (
    <section className="space-y-4 rounded-2xl border border-carnival-gold bg-carnival-cream p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-extrabold text-carnival-red">
          {currentTier.label}: {tierStampCount}/{tierSlotCount} Stamps to unlock {currentTier.reward}
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-carnival-gold">
          <div className="h-full rounded-full bg-carnival-red transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: tierSlotCount }, (_, index) => {
          const stampId = currentTier.start + index;
          const active = festivalStamps.includes(stampId);
          return (
            <div
              key={stampId}
              className={`flex aspect-square items-center justify-center rounded-full border text-xs font-extrabold ${
                active
                  ? "border-carnival-red bg-carnival-gold text-carnival-red"
                  : "border-carnival-gold bg-carnival-cream text-forest-muted"
              }`}
              title={`Stamp ${stampId}`}
            >
              {stampId}
            </div>
          );
        })}
      </div>
    </section>
  );
}
