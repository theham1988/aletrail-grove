import { useLanguage } from "../contexts/LanguageContext";

export default function HubView({ onSelectPassport }) {
  const { t } = useLanguage();

  return (
    <section>
      <header style={{ padding: "40px 20px 15px", textAlign: "center" }}>
        <h1>{t("hub_subtitle")}</h1>
        <h2>{t("hub_title")}</h2>
      </header>

      <div className="info-card">
        <h3>{t("app_subtitle")}</h3>
        <p>{t("hub_desc")}</p>
      </div>

      <div className="event-section-title">{t("current_passport")}</div>
      
      {/* FORCE FLEXBOX LAYOUT TO PREVENT OVERLAP */}
      <div 
        className="event-card active-event pressable carnival-scope" 
        onClick={() => onSelectPassport("road_in_grove")}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
      >
        <div className="event-badge badge-active" style={{ position: 'static' }}>
          {t("festival_passport")}
        </div>
        <h3 style={{ paddingRight: 0, margin: 0 }}>{t("hub_card_festival_title")}</h3>
        <p style={{ margin: 0 }}>{t("hub_card_festival_desc")}</p>
      </div>

      <div 
        className="event-card active-event pressable" 
        onClick={() => onSelectPassport("ale_trail_v1")}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}
      >
        <div
          className="event-badge"
          style={{ position: 'static', background: "var(--secondary)", color: "var(--text-main)" }}
        >
          {t("ale_trail_passport")}
        </div>
        <h3 style={{ paddingRight: 0, margin: 0 }}>{t("hub_card_trail_title")}</h3>
        <p style={{ margin: 0 }}>{t("hub_card_trail_desc")}</p>
      </div>
    </section>
  );
}
