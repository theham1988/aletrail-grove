export const festivalTiers = [
  { id: 1, label: "Tier 1", start: 1, end: 10, reward: "Sticker Pack" },
  { id: 2, label: "Tier 2", start: 11, end: 20, reward: "Festival Pin" },
  { id: 3, label: "Tier 3", start: 21, end: 30, reward: "Limited Cup" },
  { id: 4, label: "Tier 4", start: 31, end: 40, reward: "Merch Voucher" },
  { id: 5, label: "Tier 5", start: 41, end: 49, reward: "Grand Finisher Prize" },
];

export const FESTIVAL_EVENT_KEY = "road_in_grove_2026";
export const FESTIVAL_SCHEDULE_LABEL = "Apr 3-5, 2026 · 10AM-10PM";
export const FESTIVAL_ELIGIBILITY_STAMPS = 6;
export const FESTIVAL_DAILY_WINNER_COUNT = 3;
export const FESTIVAL_OVERALL_WINNER_COUNT = 1;
export const FESTIVAL_OPEN_HOUR = 10;
export const FESTIVAL_CLOSE_HOUR = 22;

export const FESTIVAL_DAYS = [
  { key: "2026-04-03", label: "Day 1", shortLabel: "Apr 3" },
  { key: "2026-04-04", label: "Day 2", shortLabel: "Apr 4" },
  { key: "2026-04-05", label: "Day 3", shortLabel: "Apr 5" },
];

export const FESTIVAL_DAY_KEYS = FESTIVAL_DAYS.map((day) => day.key);

export const secureFestivalQRCodes = Object.fromEntries(
  Array.from({ length: 49 }, (_, index) => [`RIGFEST-VENDOR-${String(index + 1).padStart(3, "0")}`, index + 1]),
);

function pad(value) {
  return String(value).padStart(2, "0");
}

function createLocalDate(dayKey, hour = 0, minute = 0) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function toFestivalDayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getFestivalDayInfo(dayKey) {
  return FESTIVAL_DAYS.find((day) => day.key === dayKey) || null;
}

export function isFestivalDay(dayKey) {
  return FESTIVAL_DAY_KEYS.includes(dayKey);
}

export function getFestivalEventStatus(now = new Date()) {
  const firstDay = FESTIVAL_DAYS[0];
  const lastDay = FESTIVAL_DAYS[FESTIVAL_DAYS.length - 1];
  const firstOpen = createLocalDate(firstDay.key, FESTIVAL_OPEN_HOUR);
  const lastClose = createLocalDate(lastDay.key, FESTIVAL_CLOSE_HOUR);
  const todayKey = toFestivalDayKey(now);
  const todayInfo = getFestivalDayInfo(todayKey);

  if (now < firstOpen) {
    return {
      phase: "before",
      isLive: false,
      currentDayKey: null,
      activeDay: firstDay,
      nextChangeAt: firstOpen,
    };
  }

  if (now >= lastClose) {
    return {
      phase: "ended",
      isLive: false,
      currentDayKey: null,
      activeDay: lastDay,
      nextChangeAt: null,
    };
  }

  if (!todayInfo) {
    return {
      phase: "between",
      isLive: false,
      currentDayKey: null,
      activeDay: firstDay,
      nextChangeAt: firstOpen,
    };
  }

  const dayOpen = createLocalDate(todayKey, FESTIVAL_OPEN_HOUR);
  const dayClose = createLocalDate(todayKey, FESTIVAL_CLOSE_HOUR);

  if (now < dayOpen) {
    return {
      phase: "before_open",
      isLive: false,
      currentDayKey: todayKey,
      activeDay: todayInfo,
      nextChangeAt: dayOpen,
    };
  }

  if (now >= dayOpen && now < dayClose) {
    return {
      phase: "live",
      isLive: true,
      currentDayKey: todayKey,
      activeDay: todayInfo,
      nextChangeAt: dayClose,
    };
  }

  const nextIndex = FESTIVAL_DAYS.findIndex((day) => day.key === todayKey) + 1;
  const nextDay = FESTIVAL_DAYS[nextIndex] || null;

  return {
    phase: nextDay ? "after_close" : "ended",
    isLive: false,
    currentDayKey: todayKey,
    activeDay: nextDay || todayInfo,
    nextChangeAt: nextDay ? createLocalDate(nextDay.key, FESTIVAL_OPEN_HOUR) : null,
  };
}

export function getGoldenBeerWinningAttempt(dayKey) {
  const seed = dayKey.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const min = 12;
  const max = 28;
  return min + (seed % (max - min + 1));
}

export function buildGoldenBeerDayState(dayKey, partial = {}) {
  return {
    attemptCount: 0,
    winningAttempt: getGoldenBeerWinningAttempt(dayKey),
    claimedBy: "",
    claimedAt: "",
    vendorId: null,
    displayName: "",
    ...partial,
  };
}

export function buildDefaultGoldenBeerByDay() {
  return Object.fromEntries(FESTIVAL_DAY_KEYS.map((dayKey) => [dayKey, buildGoldenBeerDayState(dayKey)]));
}
