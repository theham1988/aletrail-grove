import { useLanguage } from "../contexts/LanguageContext";

export default function ProfileView({
  userId,
  profileName,
  pictureUrl,
  passports,
  legacyStamps,
  onLogout,
  onDeleteAccount,
}) {
  const { lang, setLang, t } = useLanguage();
  const shortId = userId.slice(0, 10).toUpperCase();
  const profileInitial = (profileName || "E").charAt(0).toUpperCase();
  const roadInGroveCount = passports.road_in_grove?.length || 0;
  const aleTrailCount = passports.ale_trail_v1?.length || 0;

  return (
    <section>
      <header className="profile-header">
        <div className="profile-avatar">
          {pictureUrl ? <img src={pictureUrl} alt={profileName} /> : profileInitial}
        </div>
        <h1 className="profile-name">{profileName}</h1>
        <p className="profile-id">
          {t("member_id")}: PKT-{shortId}
        </p>
      </header>

      <div className="stats-card">
        <div className="stat-box">
          <div className="stat-val">{roadInGroveCount}</div>
          <div className="stat-label">{t("festival_passport")}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <div className="stat-val">{aleTrailCount}</div>
          <div className="stat-label">{t("ale_trail_passport")}</div>
        </div>
      </div>

      <div className="settings-list">
        <div className="settings-item">
          <strong>{t("road_in_grove_progress")}</strong>
          <span>
            {roadInGroveCount} {t("stamps").toLowerCase()}
          </span>
        </div>
        <div className="settings-item">
          <strong>{t("ale_trail_progress")}</strong>
          <span>
            {aleTrailCount} {t("stamps").toLowerCase()}
          </span>
        </div>
        <div className="settings-item">
          <strong>{t("legacy_stamps")}</strong>
          <span>{legacyStamps.length}</span>
        </div>
        <div className="settings-item">
          <strong>{t("mem_status")}</strong>
          <span className="status-active">{t("active_status")}</span>
        </div>
        <div className="settings-item">
          <strong>{t("language")}</strong>
          <select className="lang-select" value={lang} onChange={(event) => setLang(event.target.value)}>
            <option value="en">English</option>
            <option value="th">ภาษาไทย</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </div>

      <div className="action-buttons">
        <button type="button" className="btn-outline pressable" onClick={onLogout}>
          {t("logout")}
        </button>
        <button type="button" className="btn-danger pressable" onClick={onDeleteAccount}>
          {t("delete_account")}
        </button>
      </div>
    </section>
  );
}
