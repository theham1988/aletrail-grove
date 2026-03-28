import { useState } from "react";
import { QrCode } from "lucide-react";
import FestivalVendorSheet from "../components/FestivalVendorSheet";
import VendorList from "../components/VendorList";
import { useLanguage } from "../contexts/LanguageContext";
import vendors from "../data/vendors.json";

export default function RoadInGrovePoursTab({ syncing, onScan }) {
  const { t } = useLanguage();
  const [selectedVendor, setSelectedVendor] = useState(null);

  return (
    <section className="carnival-scope">
      <VendorList vendors={vendors} onVendorSelect={setSelectedVendor} />
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
