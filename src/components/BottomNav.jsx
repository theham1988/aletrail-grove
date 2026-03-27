import { House, QrCode, UserRound } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function BottomNav({ active, onChange }) {
  const { t } = useLanguage();
  const items = [
    { key: "hub", label: t("nav_hub"), icon: House },
    { key: "passport", label: t("nav_pass"), icon: QrCode },
    { key: "profile", label: t("nav_profile"), icon: UserRound },
  ];

  return (
    <nav className="bottom-nav three-tab">
      {items.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
