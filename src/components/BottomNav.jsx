import { House, QrCode, UserRound } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function BottomNav({ active, onChange, items }) {
  const { t } = useLanguage();
  const defaultItems = [
    { key: "hub", label: t("nav_hub"), icon: House },
    { key: "passport", label: t("nav_pass"), icon: QrCode },
    { key: "profile", label: t("nav_profile"), icon: UserRound },
  ];
  const navItems = items || defaultItems;

  return (
    <nav className={`bottom-nav ${navItems.length === 3 ? "three-tab" : ""}`}>
      {navItems.map(({ key, label, icon: Icon }) => {
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
