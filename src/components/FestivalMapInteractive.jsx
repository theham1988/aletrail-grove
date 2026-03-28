import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

const pinPositions = {
  1: { left: "24%", top: "28%" },
  2: { left: "46%", top: "34%" },
  3: { left: "63%", top: "42%" },
  4: { left: "72%", top: "56%" },
  5: { left: "38%", top: "68%" },
};

export default function FestivalMapInteractive({ vendors, onVendorSelect }) {
  const proofOfConceptVendors = vendors.filter((vendor) => pinPositions[vendor.id]);

  return (
    <div className="island-container">
      <TransformWrapper minScale={1} initialScale={1} maxScale={3} centerOnInit wheel={{ step: 0.2 }}>
        <TransformComponent wrapperClass="festival-map-transform" contentClass="festival-map-content">
          <div className="festival-map-stage">
            <img src="/festival-map.jpg" alt="Road In Grove Festival map" className="festival-map-image" />

            {proofOfConceptVendors.map((vendor) => (
              <button
                key={vendor.id}
                type="button"
                className="map-pin"
                style={pinPositions[vendor.id]}
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
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
