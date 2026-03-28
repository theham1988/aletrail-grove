import { useMemo, useState } from "react";
import { ChevronRight, QrCode } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import VendorDetailsDrawer from "../components/VendorDetailsDrawer";
import { aleTrailVendors } from "../data/aleTrailVendors";

export default function AleTrailExperienceView({ stamps, syncing, onScan, onBack }) {
  const { t } = useLanguage();
  const [selectedVendor, setSelectedVendor] = useState(null);

  const count = stamps.length;
  const slots = useMemo(() => Array.from({ length: 6 }, (_, index) => index + 1), []);

  return (
    <section>
      <div className="back-button-wrap">
        <button type="button" className="btn-outline pressable" onClick={onBack}>
          {t("back_to_hub")}
        </button>
      </div>

      <header className="experience-header-compact">
        <h1>{t("app_title")}</h1>
        <h2>{t("app_subtitle")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("explore_title")}</h3>
        <p>{t("explore_desc")}</p>
      </div>

      <div className="trail-header">{t("map_header")}</div>
      <div className="island-container">
        <svg className="island-svg" viewBox="0 0 100 150" preserveAspectRatio="none">
          <defs>
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="4" stdDeviation="4" floodColor="#21432A" floodOpacity="0.15" />
            </filter>
            <pattern id="ocean-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#21432A" strokeOpacity="0.05" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="island-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5F4EF" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ocean-grid)" />
          <path d="M 10 20 Q 15 15 20 20 T 30 20" fill="none" stroke="#21432A" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 80 120 Q 85 115 90 120 T 100 120" fill="none" stroke="#21432A" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 5 90 Q 10 85 15 90 T 25 90" fill="none" stroke="#21432A" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 70 40 Q 75 35 80 40 T 90 40" fill="none" stroke="#21432A" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M 75 125 Q 80 123, 82 128 Q 78 132, 75 125 Z" fill="url(#island-grad)" stroke="#3A6B48" strokeWidth="0.5" />
          <path d="M 85 135 Q 88 134, 89 137 Q 86 140, 85 135 Z" fill="url(#island-grad)" stroke="#3A6B48" strokeWidth="0.3" />
          <circle cx="85" cy="70" r="2" fill="url(#island-grad)" stroke="#3A6B48" strokeWidth="0.5" />
          <path
            d="M 45 5 Q 60 10, 65 30 T 75 65 Q 95 85, 85 95 Q 65 100, 65 110 Q 70 135, 50 145 Q 40 135, 35 120 Q 20 95, 25 75 Q 15 45, 35 25 Q 40 10, 45 5 Z"
            fill="url(#island-grad)"
            stroke="#3A6B48"
            strokeWidth="1.5"
            filter="url(#drop-shadow)"
          />
          <path
            d="M 45 15 Q 55 20, 60 35 T 65 65 Q 80 80, 75 90 Q 60 95, 60 105 Q 65 125, 50 135 Q 45 125, 40 115 Q 30 95, 32 80 Q 25 55, 40 35 Q 42 20, 45 15 Z"
            fill="none"
            stroke="#DCD9CD"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <path
            d="M 50 25 Q 55 45, 60 60 Q 65 75, 55 85 Q 50 100, 50 120 Q 40 100, 40 80 Q 35 60, 45 40 Z"
            fill="none"
            stroke="#DCD9CD"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <g transform="translate(85, 15) scale(0.3)">
            <circle cx="0" cy="0" r="15" fill="none" stroke="#3A6B48" strokeWidth="1" strokeOpacity="0.5" />
            <path d="M 0 -20 L 4 -4 L 20 0 L 4 4 L 0 20 L -4 4 L -20 0 L -4 -4 Z" fill="#21432A" opacity="0.3" />
            <path d="M 0 -20 L 0 0 L 20 0 L 4 -4 Z" fill="#21432A" opacity="0.6" />
            <path d="M 0 20 L 0 0 L -20 0 L -4 4 Z" fill="#21432A" opacity="0.6" />
            <text x="-3" y="-23" fontFamily="Outfit" fontSize="8" fill="#21432A" fontWeight="bold">
              N
            </text>
          </g>
          <g transform="translate(42, 15)">
            <path d="M-2,0 L0,-3 L2,0 L4,0 L0,3 L-4,0 Z" fill="#EBE9E0" stroke="#687D6D" strokeWidth="0.5" transform="rotate(45)" />
            <text x="0" y="6" fontFamily="Outfit" fontSize="3" fill="#687D6D" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">
              AIRPORT
            </text>
          </g>
          <g transform="translate(52, 35)">
            <rect x="-1" y="-3" width="2" height="4" fill="#EBE9E0" stroke="#687D6D" strokeWidth="0.5" />
            <rect x="-2" y="1" width="4" height="1" fill="#EBE9E0" stroke="#687D6D" strokeWidth="0.5" />
            <text x="0" y="5" fontFamily="Outfit" fontSize="3" fill="#687D6D" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">
              MONUMENT
            </text>
          </g>
          <g transform="translate(42, 100)">
            <path d="M0,-4 C1.5,-4 2,-2.5 2,-1 L3,1 L-3,1 L-2,-1 C-2,-2.5 -1.5,-4 0,-4 Z" fill="#EBE9E0" stroke="#687D6D" strokeWidth="0.5" />
            <circle cx="0" cy="-5" r="1.5" fill="#EBE9E0" stroke="#687D6D" strokeWidth="0.5" />
            <text x="0" y="4" fontFamily="Outfit" fontSize="3" fill="#687D6D" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">
              BIG BUDDHA
            </text>
          </g>
          <polyline points="32,35 56,68 68,72 55,95 60,126 52,132" fill="none" stroke="#3A6B48" strokeWidth="1.5" strokeDasharray="3,3" />
        </svg>

        {aleTrailVendors.map((vendor) => {
          const yPercent = (vendor.y / 150) * 100;
          return (
            <button
              key={vendor.id}
              type="button"
              className="map-pin"
              style={{ left: `${vendor.x}%`, top: `${yPercent}%` }}
              onClick={() => setSelectedVendor(vendor)}
            >
              <div className="pin-dot"></div>
              <div className="pin-label">{vendor.name.split(" ")[0]}</div>
            </button>
          );
        })}
      </div>

      <div className="trail-header">{t("venue_header")}</div>
      <div className="trail-map">
        {aleTrailVendors.map((vendor) => (
          <article key={vendor.id} className="vendor-stop" onClick={() => setSelectedVendor(vendor)}>
            <h4 className="vendor-name">{vendor.name}</h4>
            <span className="vendor-area">{vendor.area}</span>
            <ChevronRight className="vendor-chevron" size={20} />
          </article>
        ))}
      </div>

      <div className="passport-container">
        <div className="passport-header">
          <span className="label">{t("vip_pass")}</span>
          <span className="label count-label">
            {count} / 6 <span>{t("collected")}</span>
          </span>
        </div>
        <div className="grid">
          {slots.map((slotId) => {
            const active = stamps.includes(slotId);
            return (
              <div key={slotId} className={`slot ${active ? "active" : ""}`}>
                {slotId}
              </div>
            );
          })}
        </div>
      </div>

      <div className="scan-fab-wrap">
        <button type="button" className="scan-fab pressable" onClick={onScan} disabled={syncing}>
          <span className="icon-label">
            <QrCode size={18} />
            {syncing ? t("syncing") : t("scan_btn")}
          </span>
        </button>
      </div>

      <VendorDetailsDrawer
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        description={selectedVendor?.desc || ""}
        directionsUrl={selectedVendor?.maps}
      />
    </section>
  );
}
