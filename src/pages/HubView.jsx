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
      <div className="event-card active-event pressable carnival-scope" onClick={() => onSelectPassport("road_in_grove")}>
        <div
          className="event-badge badge-active"
          style={{ position: "relative", top: 0, right: 0, display: "inline-block", marginBottom: "12px" }}
        >
          {t("festival_passport")}
        </div>
        <h3 style={{ paddingRight: 0 }}>{t("hub_card_festival_title")}</h3>
        <p>{t("hub_card_festival_desc")}</p>
      </div>

      <div className="event-card active-event pressable" onClick={() => onSelectPassport("ale_trail_v1")}>
        <div
          className="event-badge"
          style={{
            position: "relative",
            top: 0,
            right: 0,
            display: "inline-block",
            marginBottom: "12px",
            background: "var(--secondary)",
            color: "var(--text-main)",
          }}
        >
          {t("ale_trail_passport")}
        </div>
        <h3 style={{ paddingRight: 0 }}>{t("hub_card_trail_title")}</h3>
        <p>{t("hub_card_trail_desc")}</p>
      </div>
    </section>
  );
}
