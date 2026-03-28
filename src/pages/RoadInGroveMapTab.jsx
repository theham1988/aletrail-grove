import { useState } from "react";
import { QrCode } from "lucide-react";
import FestivalMapInteractive from "../components/FestivalMapInteractive";
import FestivalVendorSheet from "../components/FestivalVendorSheet";
import vendors from "../data/vendors.json";
import { useLanguage } from "../contexts/LanguageContext";

export default function RoadInGroveMapTab({ syncing, onScan }) {
  const { t } = useLanguage();
  const [selectedVendor, setSelectedVendor] = useState(null);

  return (
    <section className="carnival-scope">
      <header className="experience-header-compact">
        <h1>{t("coming_soon")}</h1>
        <h2>{t("rig_title")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("festival_map")}</h3>
        <p>{t("rig_desc")}</p>
      </div>

      <div className="trail-header">{t("festival_map")}</div>
      <FestivalMapInteractive vendors={vendors} onVendorSelect={setSelectedVendor} />

      <div className="scan-fab-wrap">
        <button type="button" className="scan-fab carnival pressable" onClick={onScan} disabled={syncing}>
          <span className="icon-label">
            <QrCode size={18} />
            {syncing ? t("syncing") : t("scan_btn")}
          </span>
        </button>
      </div>

      <FestivalVendorSheet vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
    </section>
  );
}
