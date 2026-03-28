import { useMemo } from "react";

const boothAreas = {
  B1: { x: 80.8, y: 21.8, w: 5.2, h: 4.2 },
  B2: { x: 80.8, y: 25.8, w: 5.2, h: 4.2 },
  B3: { x: 80.8, y: 36.6, w: 5.2, h: 4.2 },
  B4: { x: 80.8, y: 40.7, w: 5.2, h: 4.2 },
  B5: { x: 80.8, y: 44.8, w: 5.2, h: 4.2 },
  B6: { x: 80.8, y: 48.9, w: 5.2, h: 4.2 },
  B7: { x: 80.8, y: 58.4, w: 5.2, h: 4.2 },
  B8: { x: 80.8, y: 62.5, w: 5.2, h: 4.2 },
  B9: { x: 80.8, y: 66.6, w: 5.2, h: 4.2 },
  B10: { x: 80.8, y: 70.7, w: 5.2, h: 4.2 },
  B11: { x: 80.8, y: 81.2, w: 5.2, h: 4.2 },
  B12: { x: 80.8, y: 85.2, w: 5.2, h: 4.2 },
  B13: { x: 80.8, y: 89.3, w: 5.2, h: 4.2 },
  B14: { x: 80.8, y: 93.4, w: 5.2, h: 4.2 },
  B15: { x: 66.3, y: 73.5, w: 5.2, h: 4.2 },
  B16: { x: 66.3, y: 69.5, w: 5.2, h: 4.2 },
  B17: { x: 66.3, y: 65.4, w: 5.2, h: 4.2 },
  B18: { x: 66.3, y: 61.4, w: 5.2, h: 4.2 },
  B19: { x: 66.3, y: 52.9, w: 5.2, h: 4.2 },
  B20: { x: 66.3, y: 48.9, w: 5.2, h: 4.2 },
  B21: { x: 66.3, y: 44.9, w: 5.2, h: 4.2 },
  B22: { x: 60.4, y: 44.9, w: 5.2, h: 4.2 },
  B23: { x: 60.4, y: 48.9, w: 5.2, h: 4.2 },
  B24: { x: 60.4, y: 52.9, w: 5.2, h: 4.2 },
  B25: { x: 60.4, y: 61.4, w: 5.2, h: 4.2 },
  B26: { x: 60.4, y: 65.4, w: 5.2, h: 4.2 },
  B27: { x: 60.4, y: 69.5, w: 5.2, h: 4.2 },
  B28: { x: 60.4, y: 73.5, w: 5.2, h: 4.2 },
  B29: { x: 74.6, y: 84.4, w: 5.2, h: 4.2 },
  B30: { x: 70.5, y: 84.4, w: 5.2, h: 4.2 },
  B31: { x: 66.4, y: 84.4, w: 5.2, h: 4.2 },
  B32: { x: 62.3, y: 84.4, w: 5.2, h: 4.2 },
  B33: { x: 58.2, y: 84.4, w: 5.2, h: 4.2 },
  B34: { x: 50.0, y: 84.4, w: 5.2, h: 4.2 },
  B35: { x: 45.9, y: 84.4, w: 5.2, h: 4.2 },
  B36: { x: 41.8, y: 84.4, w: 5.2, h: 4.2 },
  B37: { x: 37.7, y: 84.4, w: 5.2, h: 4.2 },
  B38: { x: 61.6, y: 29.0, w: 5.2, h: 4.2 },
  B39: { x: 65.3, y: 29.0, w: 5.2, h: 4.2 },
  B40: { x: 68.9, y: 29.0, w: 5.2, h: 4.2 },
  B41: { x: 72.6, y: 29.0, w: 5.2, h: 4.2 },
  B42: { x: 78.8, y: 29.0, w: 5.2, h: 4.2 },
  B43: { x: 67.3, y: 25.0, w: 5.2, h: 4.2 },
  B44: { x: 67.3, y: 21.0, w: 5.2, h: 4.2 },
};

function parseBoothOrder(value) {
  const match = /^([A-Z]+)(\d+)$/i.exec(value || "");
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[2]);
}

export default function FestivalMapInteractive({ vendors, activeVendorId, visibleVendorIds, hasQuery, onVendorSelect }) {
  const boothGroups = useMemo(() => {
    const groups = new Map();

    vendors.forEach((vendor) => {
      if (!vendor.booth || !boothAreas[vendor.booth]) return;

      if (!groups.has(vendor.booth)) {
        groups.set(vendor.booth, []);
      }

      groups.get(vendor.booth).push(vendor);
    });

    return [...groups.entries()]
      .map(([booth, boothVendors]) => ({ booth, boothVendors, area: boothAreas[booth] }))
      .sort((a, b) => parseBoothOrder(a.booth) - parseBoothOrder(b.booth));
  }, [vendors]);

  const activeVendor = vendors.find((vendor) => vendor.id === activeVendorId) || null;
  const activeArea = activeVendor?.booth ? boothAreas[activeVendor.booth] : null;
  const mapSrc = "/festival-map.jpg";

  return (
    <div className="island-container festival-map-shell">
      <img
        src={mapSrc}
        alt="Road In Grove Festival map"
        className="festival-map-image"
        loading="eager"
      />

      {boothGroups.map(({ booth, boothVendors, area }) => {
        const isActive = activeVendor?.booth === booth;
        const isSuggested = hasQuery && boothVendors.some((vendor) => visibleVendorIds?.has(vendor.id));
        const targetVendor = boothVendors.find((vendor) => vendor.id === activeVendorId) || boothVendors[0];

        return (
          <button
            key={booth}
            type="button"
            className={`map-booth-hitbox ${isActive ? "active" : ""} ${isSuggested ? "suggested" : ""}`}
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.w}%`,
              height: `${area.h}%`,
            }}
            aria-label={`${booth}: ${boothVendors.map((vendor) => vendor.name).join(", ")}`}
            onClick={(event) => {
              event.stopPropagation();
              onVendorSelect?.(targetVendor);
            }}
          />
        );
      })}

      {activeVendor && activeArea && (
        <button
          type="button"
          className="map-active-label"
          style={{ left: `${activeArea.x}%`, top: `${Math.max(activeArea.y - 7, 9)}%` }}
          onClick={() => onVendorSelect?.(activeVendor)}
        >
          <strong>{activeVendor.name}</strong>
          <span>{activeVendor.booth}</span>
        </button>
      )}
    </div>
  );
}
