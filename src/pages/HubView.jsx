import FestivalEventStatusCard from "../components/FestivalEventStatusCard";
import { useLanguage } from "../contexts/LanguageContext";

export default function HubView({ onSelectPassport, stampsCount, festivalMeta, goldenBeerByDay }) {
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

      <FestivalEventStatusCard
        compact
        stampsCount={stampsCount}
        festivalMeta={festivalMeta}
        goldenBeerByDay={goldenBeerByDay}
      />

      <div className="event-section-title">{t("current_passport")}</div>

      <div className="hub-passport-card carnival-scope pressable" onClick={() => onSelectPassport("road_in_grove")}>
        <div className="hub-passport-badge hub-passport-badge-primary">{t("festival_passport")}</div>
        <h3 className="hub-passport-title">{t("hub_card_festival_title")}</h3>
        <div className="hub-passport-meta">
          <div className="hub-passport-schedule">{t("hub_card_festival_dates")}</div>
          <div className="hub-double-stamp-badge">{t("hub_double_stamp_badge")}</div>
        </div>
        <p className="hub-passport-copy">{t("hub_card_festival_desc")}</p>
      </div>

      <div className="hub-passport-card pressable" onClick={() => onSelectPassport("ale_trail_v1")}>
        <div className="hub-passport-badge hub-passport-badge-secondary">{t("ale_trail_passport")}</div>
        <h3 className="hub-passport-title">{t("hub_card_trail_title")}</h3>
        <div className="hub-passport-meta">
          <div className="hub-passport-schedule">{t("hub_card_trail_dates")}</div>
          <div className="hub-double-stamp-badge">{t("hub_double_stamp_badge")}</div>
        </div>
        <p className="hub-passport-copy">{t("hub_card_trail_desc")}</p>
      </div>

      <div className="hub-shared-passport-note">
        <strong>{t("hub_shared_bonus_title")}</strong>
        <p>{t("hub_shared_bonus_desc")}</p>
      </div>
    </section>
  );
}
