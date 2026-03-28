import { Beer, Clock3, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  FESTIVAL_DAILY_WINNER_COUNT,
  FESTIVAL_ELIGIBILITY_STAMPS,
  FESTIVAL_OVERALL_WINNER_COUNT,
  FESTIVAL_SCHEDULE_LABEL,
  getFestivalEventStatus,
} from "../data/festivalConfig";
import { useLanguage } from "../contexts/LanguageContext";

function getFestivalPhaseLabel(t, eventStatus) {
  if (eventStatus.phase === "live") return t("festival_live_now");
  if (eventStatus.phase === "before_open") return t("festival_opens_today");
  if (eventStatus.phase === "after_close") return t("festival_reopens_next");
  if (eventStatus.phase === "ended") return t("festival_has_closed");
  return t("festival_starts_soon");
}

function getGoldenBeerLabel(t, eventStatus, goldenBeerByDay, festivalMeta) {
  const dayKey = eventStatus.currentDayKey || eventStatus.activeDay?.key;
  if (!dayKey) return t("golden_beer_waiting");

  if (festivalMeta?.goldenBeerWins?.includes(dayKey)) {
    return t("golden_beer_you_found_it");
  }

  const dayState = goldenBeerByDay?.[dayKey];
  if (dayState?.claimedBy) {
    return t("golden_beer_claimed");
  }

  return t("golden_beer_waiting");
}

export default function FestivalEventStatusCard({ stampsCount = 0, festivalMeta, goldenBeerByDay, compact = false }) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const eventStatus = useMemo(() => getFestivalEventStatus(now), [now]);
  const activeDayKey = eventStatus.currentDayKey || eventStatus.activeDay?.key || "";
  const isEligibleToday = activeDayKey ? festivalMeta?.eligibleDays?.includes(activeDayKey) : false;
  const isFestivalEligible = Boolean(festivalMeta?.festivalEligible);
  const stampsNeeded = Math.max(FESTIVAL_ELIGIBILITY_STAMPS - stampsCount, 0);
  const eligibilityProgress = Math.min(100, Math.round((Math.min(stampsCount, FESTIVAL_ELIGIBILITY_STAMPS) / FESTIVAL_ELIGIBILITY_STAMPS) * 100));

  return (
    <div className={`festival-status-card ${compact ? "compact" : ""}`}>
      <div className="festival-status-head">
        <span className={`festival-status-pill ${eventStatus.isLive ? "live" : "idle"}`}>
          <Clock3 size={12} />
          {getFestivalPhaseLabel(t, eventStatus)}
        </span>
        <span className="festival-status-schedule">{FESTIVAL_SCHEDULE_LABEL}</span>
      </div>

      <h3>{compact ? t("festival_game_title") : t("festival_game_status")}</h3>
      <p>
        {compact
          ? t("festival_game_desc")
          : `${eventStatus.activeDay?.label || t("festival_game_title")} · ${t("festival_hours_label")} ${FESTIVAL_SCHEDULE_LABEL}`}
      </p>

      <div className="festival-status-grid">
        <div className="festival-status-item">
          <span className="festival-status-icon">
            <Trophy size={14} />
          </span>
          <div>
            <strong>{FESTIVAL_DAILY_WINNER_COUNT}</strong>
            <span>{t("daily_winners_label")}</span>
          </div>
        </div>

        <div className="festival-status-item">
          <span className="festival-status-icon">
            <Sparkles size={14} />
          </span>
          <div>
            <strong>{FESTIVAL_OVERALL_WINNER_COUNT}</strong>
            <span>{t("festival_winner_label")}</span>
          </div>
        </div>

        <div className="festival-status-item">
          <span className="festival-status-icon">
            <Beer size={14} />
          </span>
          <div>
            <strong>{getGoldenBeerLabel(t, eventStatus, goldenBeerByDay, festivalMeta)}</strong>
            <span>{t("golden_beer_label")}</span>
          </div>
        </div>
      </div>

      <div className="festival-eligibility-card">
        <div className="festival-eligibility-copy">
          <strong>
            {stampsNeeded === 0
              ? t("festival_entry_unlocked")
              : `${stampsNeeded} ${t("festival_stamps_to_unlock")}`}
          </strong>
          <span>
            {isEligibleToday
              ? t("festival_daily_entry_ready")
              : isFestivalEligible
                ? t("festival_overall_entry_ready")
                : t("festival_entry_progress")}
          </span>
        </div>
        <div className="festival-eligibility-bar">
          <div className="festival-eligibility-fill" style={{ width: `${eligibilityProgress}%` }} />
        </div>
      </div>
    </div>
  );
}
