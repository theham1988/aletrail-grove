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
      
      {/* ROAD IN GROVE CARD */}
      <div
        className="pressable carnival-scope"
        onClick={() => onSelectPassport("road_in_grove")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          background: "var(--card-bg)",
          border: "2px solid var(--primary-light)",
          margin: "0 20px 15px",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px var(--secondary-glow)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            background: "var(--primary-light)",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderRadius: "6px",
            padding: "5px 8px",
            fontSize: "9px",
            fontWeight: "800",
          }}
        >
          {t("festival_passport")}
        </div>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--text-main)" }}>
          {t("hub_card_festival_title")}
        </h3>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: "var(--text-muted)" }}>
          {t("hub_card_festival_desc")}
        </p>
      </div>

      {/* ALE TRAIL CARD */}
      <div
        className="pressable"
        onClick={() => onSelectPassport("ale_trail_v1")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          margin: "0 20px 15px",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            background: "var(--secondary)",
            color: "var(--text-main)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderRadius: "6px",
            padding: "5px 8px",
            fontSize: "9px",
            fontWeight: "800",
          }}
        >
          {t("ale_trail_passport")}
        </div>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--text-main)" }}>
          {t("hub_card_trail_title")}
        </h3>
        <p style={{ margin: 0, fontSize: "12px", fontWeight: "500", color: "var(--text-muted)" }}>
          {t("hub_card_trail_desc")}
        </p>
      </div>
    </section>
  );
}
