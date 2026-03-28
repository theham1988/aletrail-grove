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
    <div
      style={{
        width: "calc(100% - 40px)", // Match the margins of other cards
        height: "400px", // Explicit hardcoded height
        margin: "0 auto 30px",
        borderRadius: "20px",
        overflow: "hidden",
        border: "2px solid var(--border)",
        backgroundColor: "#EBE9E0", // Fallback color
      }}
    >
      <TransformWrapper initialScale={1} minScale={1} maxScale={4} centerOnInit wheel={{ step: 0.2 }}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                {/* Ensure the image actually loads and fills the space */}
                <img
                  src="/festival-map.jpg"
                  alt="Road In Grove Festival map"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    console.error("Failed to load map image");
                    e.target.style.display = "none"; // Hide broken image icon
                  }}
                />
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
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
