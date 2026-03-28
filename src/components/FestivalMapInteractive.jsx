import { useState } from "react";

const pinPositions = {
  1: { left: "24%", top: "28%" },
  2: { left: "46%", top: "34%" },
  3: { left: "63%", top: "42%" },
  4: { left: "72%", top: "56%" },
  5: { left: "38%", top: "68%" },
};

export default function FestivalMapInteractive({ vendors, onVendorSelect }) {
  const proofOfConceptVendors = vendors.filter((vendor) => pinPositions[vendor.id]);
  const [imageFailed, setImageFailed] = useState(false);
  const mapSrc = `${import.meta.env.BASE_URL}festival-map.jpg`;

  return (
    <div className="island-container festival-map-shell">
      {!imageFailed ? (
        <img
          src={mapSrc}
          alt="Road In Grove Festival map"
          className="festival-map-image"
          onError={() => {
            console.error("Failed to load map image");
            setImageFailed(true);
          }}
        />
      ) : (
        <div className="festival-map-fallback">Festival map image unavailable.</div>
      )}
      {proofOfConceptVendors.map((vendor) => (
        <button
          key={vendor.id}
          type="button"
          className="map-pin"
          style={{ ...pinPositions[vendor.id], position: "absolute" }}
          onClick={(event) => {
            event.stopPropagation();
            onVendorSelect?.(vendor);
          }}
        >
          <div className="pin-dot"></div>
          <div className="pin-label">{vendor.name}</div>
        </button>
      ))}
    </div>
  );
}
