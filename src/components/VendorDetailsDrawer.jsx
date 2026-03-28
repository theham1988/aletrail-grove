import { MapPinned } from "lucide-react";
import { Drawer } from "vaul";
import { useLanguage } from "../contexts/LanguageContext";

export default function VendorDetailsDrawer({ vendor, onClose, description, directionsUrl }) {
  const { t } = useLanguage();
  const isOpen = Boolean(vendor);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="drawer-overlay" />
        <Drawer.Content className="drawer-content">
          <div className="drawer-handle" />
          <div className="sheet-area">
            {t("booth")} {vendor?.booth || vendor?.area || "TBA"}
          </div>
          <h2 className="sheet-title">{vendor?.name || ""}</h2>
          <p className="sheet-desc">{description || ""}</p>
          <div className="beer-list">
            <h4>{t("pouring")}</h4>
            <ul>
              {(vendor?.beers || []).map((beer) => (
                <li key={`${vendor.id}-${typeof beer === "string" ? beer : beer.name}`}>
                  {typeof beer === "string" ? beer : `${beer.name} · ${beer.style} · ${beer.abv}`}
                </li>
              ))}
              {vendor && (!vendor.beers || vendor.beers.length === 0) && <li>Beer list coming soon</li>}
            </ul>
          </div>
          <button
            className="dir-btn"
            onClick={() => {
              if (directionsUrl) {
                window.open(directionsUrl, "_blank");
                return;
              }
              onClose();
            }}
          >
            <MapPinned size={16} />
            {directionsUrl ? t("get_dir") : "Close"}
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
