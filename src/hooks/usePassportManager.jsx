import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import vendors from "../data/vendors.json";
import {
  ALE_TRAIL_MAX_STAMPS_PER_STOP,
  ALE_TRAIL_TOTAL_STAMPS,
  aleTrailStopByFestivalVendorId,
  aleTrailStopByKey,
  aleTrailStopPayloads,
  aleTrailVendors,
} from "../data/aleTrailVendors";
import {
  FESTIVAL_ELIGIBILITY_STAMPS,
  FESTIVAL_EVENT_KEY,
  buildDefaultGoldenBeerByDay,
  buildGoldenBeerDayState,
  secureFestivalQRCodes,
  toFestivalDayKey,
  getFestivalEventStatus,
} from "../data/festivalConfig";
import { db } from "../lib/firebase";

const DEFAULT_PASSPORTS = {
  road_in_grove: [],
  ale_trail_v1: [],
};

const DEFAULT_FESTIVAL_META = {
  eligibleDays: [],
  festivalEligible: false,
  goldenBeerWins: [],
};

const SCAN_CANCELLED = "scan_cancelled";
const SCAN_UNSUPPORTED = "scan_unsupported";

const ALE_TRAIL_VALID_KEYS = new Set(aleTrailVendors.map((vendor) => vendor.key));

function normalizeRoadInGroveStamps(raw) {
  if (!Array.isArray(raw)) return [];

  return [...new Set(raw.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0))].sort(
    (a, b) => a - b,
  );
}

function normalizeAleTrailStamps(raw) {
  if (!Array.isArray(raw)) return [];

  const normalized = [];

  const resolveStopKey = (entry) => {
    if (typeof entry === "string") {
      if (ALE_TRAIL_VALID_KEYS.has(entry)) return entry;
      const numericValue = Number(entry);
      if (Number.isInteger(numericValue)) {
        return aleTrailStopByFestivalVendorId[numericValue]?.key || null;
      }
      return null;
    }

    if (typeof entry === "number") {
      return aleTrailStopByFestivalVendorId[entry]?.key || null;
    }

    return null;
  };

  for (const entry of raw) {
    if (normalized.length >= ALE_TRAIL_TOTAL_STAMPS) break;

    const stopKey = resolveStopKey(entry);
    if (!stopKey || !ALE_TRAIL_VALID_KEYS.has(stopKey)) continue;

    const existingCount = normalized.filter((value) => value === stopKey).length;
    if (existingCount >= ALE_TRAIL_MAX_STAMPS_PER_STOP) continue;

    normalized.push(stopKey);
  }

  return normalized;
}

function resolveVendorFromScan(rawValue) {
  const payload = rawValue?.toString().trim();
  if (!payload) return null;

  const vendorId = secureFestivalQRCodes[payload];
  if (vendorId) {
    const festivalVendor = vendors.find((vendor) => vendor.id === vendorId) || null;
    const aleTrailStop =
      festivalVendor?.activePassports?.includes("ale_trail_v1") && festivalVendor?.id
        ? aleTrailStopByFestivalVendorId[festivalVendor.id] || null
        : null;

    return {
      festivalVendor,
      aleTrailStop,
      displayVendor: festivalVendor,
    };
  }

  const aleTrailStopKey = aleTrailStopPayloads[payload];
  if (!aleTrailStopKey) return null;

  const aleTrailStop = aleTrailStopByKey[aleTrailStopKey] || null;
  if (!aleTrailStop) return null;

  return {
    festivalVendor: null,
    aleTrailStop,
    displayVendor: {
      id: aleTrailStop.key,
      name: aleTrailStop.name,
      activePassports: ["ale_trail_v1"],
    },
  };
}

async function scanQRCode() {
  const importedLiff = await import("@line/liff").then((module) => module.default).catch(() => null);
  const liff = window.liff || importedLiff;
  const useNativeScanner = Boolean(liff?.scanCodeV2);

  if (useNativeScanner) {
    try {
      const result = await liff.scanCodeV2();
      const scannedValue = result?.value?.toString().trim();
      return scannedValue || SCAN_CANCELLED;
    } catch (error) {
      const message = error?.message?.toLowerCase() || "";
      if (message.includes("cancel") || message.includes("close") || message.includes("abort")) {
        return SCAN_CANCELLED;
      }
      if (
        message.includes("subwindow") ||
        message.includes("not supported") ||
        message.includes("unsupported") ||
        message.includes("not available")
      ) {
        return SCAN_UNSUPPORTED;
      }
      throw error;
    }
  }

  return SCAN_UNSUPPORTED;
}

function mergeGoldenBeerByDay(partial) {
  const defaults = buildDefaultGoldenBeerByDay();
  const source = partial && typeof partial === "object" ? partial : {};

  return Object.fromEntries(
    Object.entries(defaults).map(([dayKey, defaultState]) => [dayKey, buildGoldenBeerDayState(dayKey, source[dayKey] || defaultState)]),
  );
}

export function usePassportManager(userId, authProfile) {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: authProfile?.displayName || "Festival Explorer",
    pictureUrl: authProfile?.pictureUrl || "",
  });
  const [passports, setPassports] = useState(DEFAULT_PASSPORTS);
  const [legacyStamps, setLegacyStamps] = useState([]);
  const [festivalMeta, setFestivalMeta] = useState(DEFAULT_FESTIVAL_META);
  const [scanHistory, setScanHistory] = useState([]);
  const [goldenBeerByDay, setGoldenBeerByDay] = useState(buildDefaultGoldenBeerByDay());
  const [error, setError] = useState("");

  const userRef = useMemo(() => {
    if (!userId) return null;
    return doc(db, "aletrail_users", userId);
  }, [userId]);
  const festivalRuntimeRef = useMemo(() => doc(db, "festival_events", FESTIVAL_EVENT_KEY), []);

  const refresh = useCallback(async () => {
    if (!userRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [snapshot, runtimeSnapshot] = await Promise.all([getDoc(userRef), getDoc(festivalRuntimeRef)]);
      const runtimeData = runtimeSnapshot.exists() ? runtimeSnapshot.data() : {};
      setGoldenBeerByDay(mergeGoldenBeerByDay(runtimeData.goldenBeerByDay));

      if (!snapshot.exists()) {
        setPassports(DEFAULT_PASSPORTS);
        setLegacyStamps([]);
        setFestivalMeta(DEFAULT_FESTIVAL_META);
        setScanHistory([]);
        setProfile({
          displayName: authProfile?.displayName || "Festival Explorer",
          pictureUrl: authProfile?.pictureUrl || "",
        });
        return;
      }

      const data = snapshot.data();
      const nextPassports = {
        ...DEFAULT_PASSPORTS,
        ...(typeof data.passports === "object" && data.passports ? data.passports : {}),
      };
      nextPassports.road_in_grove = normalizeRoadInGroveStamps(nextPassports.road_in_grove);
      nextPassports.ale_trail_v1 = normalizeAleTrailStamps(nextPassports.ale_trail_v1);

      setProfile({
        displayName: data.displayName || "Festival Explorer",
        pictureUrl: data.pictureUrl || "",
      });
      setPassports(nextPassports);
      setLegacyStamps(Array.isArray(data.stamps) ? data.stamps : []);
      setFestivalMeta({
        ...DEFAULT_FESTIVAL_META,
        ...(typeof data.festivalMeta === "object" && data.festivalMeta ? data.festivalMeta : {}),
      });
      setScanHistory(Array.isArray(data.scanHistory) ? data.scanHistory : []);
    } catch (err) {
      setError(err?.message || "Failed to load passport data.");
    } finally {
      setLoading(false);
    }
  }, [festivalRuntimeRef, userRef, authProfile?.displayName, authProfile?.pictureUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const claimGoldenBeerWin = useCallback(
    async ({ dayKey, vendorId }) => {
      if (!festivalRuntimeRef || !userId || !dayKey) {
        return { won: false, goldenBeerByDay: goldenBeerByDay };
      }

      try {
        return await runTransaction(db, async (transaction) => {
          const runtimeSnapshot = await transaction.get(festivalRuntimeRef);
          const runtimeData = runtimeSnapshot.exists() ? runtimeSnapshot.data() : {};
          const currentGoldenBeerByDay = mergeGoldenBeerByDay(runtimeData.goldenBeerByDay);
          const dayState = currentGoldenBeerByDay[dayKey];

          if (dayState.claimedBy) {
            return { won: false, goldenBeerByDay: currentGoldenBeerByDay };
          }

          const nextAttemptCount = (dayState.attemptCount || 0) + 1;
          const won = nextAttemptCount === dayState.winningAttempt;
          const nextDayState = {
            ...dayState,
            attemptCount: nextAttemptCount,
            ...(won
              ? {
                  claimedBy: userId,
                  claimedAt: new Date().toISOString(),
                  vendorId,
                  displayName: authProfile?.displayName || profile.displayName || "Festival Explorer",
                }
              : {}),
          };

          const nextGoldenBeerByDay = {
            ...currentGoldenBeerByDay,
            [dayKey]: nextDayState,
          };

          transaction.set(
            festivalRuntimeRef,
            {
              goldenBeerByDay: nextGoldenBeerByDay,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );

          return { won, goldenBeerByDay: nextGoldenBeerByDay };
        });
      } catch (transactionError) {
        console.warn("Golden beer claim check failed.", transactionError);
        return { won: false, goldenBeerByDay };
      }
    },
    [authProfile?.displayName, db, festivalRuntimeRef, goldenBeerByDay, profile.displayName, userId],
  );

  const scanAndApplyVendor = useCallback(async (providedPayload = "") => {
    if (!userRef) return null;
    setSyncing(true);
    setError("");

    try {
      const payload =
        typeof providedPayload === "string" && providedPayload.trim()
          ? providedPayload.trim()
          : await scanQRCode();

      if (payload === SCAN_UNSUPPORTED) {
        setError("");
        return { requiresBrowserFallback: true };
      }
      if (payload === SCAN_CANCELLED) {
        setError("");
        return { cancelled: true };
      }
      const resolved = resolveVendorFromScan(payload);

      if (!resolved) throw new Error("Invalid or unofficial QR payload.");

      const { festivalVendor, aleTrailStop, displayVendor } = resolved;

      const snapshot = await getDoc(userRef);
      const data = snapshot.exists() ? snapshot.data() : {};
      const eventStatus = getFestivalEventStatus(new Date());

      const existingPassports = {
        ...DEFAULT_PASSPORTS,
        ...(typeof data.passports === "object" && data.passports ? data.passports : {}),
      };
      existingPassports.road_in_grove = normalizeRoadInGroveStamps(existingPassports.road_in_grove);
      existingPassports.ale_trail_v1 = normalizeAleTrailStamps(existingPassports.ale_trail_v1);
      const existingFestivalMeta = {
        ...DEFAULT_FESTIVAL_META,
        ...(typeof data.festivalMeta === "object" && data.festivalMeta ? data.festivalMeta : {}),
      };
      const existingScanHistory = Array.isArray(data.scanHistory) ? data.scanHistory : [];

      const updatedPassports = { ...existingPassports };
      const addedPassportKeys = [];
      let addedNewStamp = false;
      let aleTrailStampBlockedReason = "";

      if (festivalVendor?.activePassports?.includes("road_in_grove")) {
        const currentEntries = normalizeRoadInGroveStamps(updatedPassports.road_in_grove);
        if (!currentEntries.includes(festivalVendor.id)) {
          updatedPassports.road_in_grove = [...currentEntries, festivalVendor.id].sort((a, b) => a - b);
          addedNewStamp = true;
          addedPassportKeys.push("road_in_grove");
        }
      }

      if (aleTrailStop) {
        const currentTrailEntries = normalizeAleTrailStamps(updatedPassports.ale_trail_v1);
        const currentStopCount = currentTrailEntries.filter((entry) => entry === aleTrailStop.key).length;

        if (currentTrailEntries.length >= ALE_TRAIL_TOTAL_STAMPS) {
          aleTrailStampBlockedReason = "passport_full";
        } else if (currentStopCount >= ALE_TRAIL_MAX_STAMPS_PER_STOP) {
          aleTrailStampBlockedReason = "stop_full";
        } else {
          updatedPassports.ale_trail_v1 = [...currentTrailEntries, aleTrailStop.key];
          addedNewStamp = true;
          addedPassportKeys.push("ale_trail_v1");
        }
      }

      const updatedFestivalMeta = {
        ...existingFestivalMeta,
        eligibleDays: Array.isArray(existingFestivalMeta.eligibleDays) ? [...existingFestivalMeta.eligibleDays] : [],
        goldenBeerWins: Array.isArray(existingFestivalMeta.goldenBeerWins) ? [...existingFestivalMeta.goldenBeerWins] : [],
      };
      let updatedScanHistory = [...existingScanHistory];
      let eligibilityUnlocked = false;
      let enteredDailyDraw = false;
      let goldenBeerWon = false;
      let nextGoldenBeerByDay = goldenBeerByDay;

      const currentDayKey = eventStatus.isLive ? eventStatus.currentDayKey : null;
      const isFestivalRoadInGroveScan = festivalVendor?.activePassports?.includes("road_in_grove") && currentDayKey;

      if (isFestivalRoadInGroveScan) {
        const roadInGroveCount = (updatedPassports.road_in_grove || []).length;

        updatedScanHistory = [
          ...existingScanHistory,
          {
            vendorId: festivalVendor.id,
            passportKey: "road_in_grove",
            scannedAt: new Date().toISOString(),
            dayKey: currentDayKey,
          },
        ];

        if (roadInGroveCount >= FESTIVAL_ELIGIBILITY_STAMPS) {
          if (!updatedFestivalMeta.festivalEligible) {
            eligibilityUnlocked = true;
          }

          updatedFestivalMeta.festivalEligible = true;
          if (!updatedFestivalMeta.eligibleDays.includes(currentDayKey)) {
            updatedFestivalMeta.eligibleDays = [...updatedFestivalMeta.eligibleDays, currentDayKey].sort();
            enteredDailyDraw = true;
          }
        }

        const goldenBeerResult = await claimGoldenBeerWin({ dayKey: currentDayKey, vendorId: festivalVendor.id });
        goldenBeerWon = Boolean(goldenBeerResult.won);
        nextGoldenBeerByDay = mergeGoldenBeerByDay(goldenBeerResult.goldenBeerByDay);

        if (goldenBeerWon && !updatedFestivalMeta.goldenBeerWins.includes(currentDayKey)) {
          updatedFestivalMeta.goldenBeerWins = [...updatedFestivalMeta.goldenBeerWins, currentDayKey].sort();
        }
      }

      await setDoc(
        userRef,
        {
          passports: updatedPassports,
          festivalMeta: updatedFestivalMeta,
          scanHistory: updatedScanHistory,
          displayName: authProfile?.displayName || profile.displayName || "Festival Explorer",
          pictureUrl: authProfile?.pictureUrl || profile.pictureUrl || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setPassports(updatedPassports);
      setFestivalMeta(updatedFestivalMeta);
      setScanHistory(updatedScanHistory);
      setGoldenBeerByDay(nextGoldenBeerByDay);
      if (addedNewStamp && navigator.vibrate) {
        navigator.vibrate([200]);
      }
      return {
        vendor: displayVendor,
        addedNewStamp,
        addedPassportKeys,
        aleTrailStampBlockedReason,
        eligibilityUnlocked,
        enteredDailyDraw,
        goldenBeerWon,
      };
    } catch (err) {
      setError(err?.message || "Scan failed.");
      return null;
    } finally {
      setSyncing(false);
    }
  }, [
    authProfile?.displayName,
    authProfile?.pictureUrl,
    claimGoldenBeerWin,
    goldenBeerByDay,
    profile.displayName,
    profile.pictureUrl,
    userRef,
  ]);

  return {
    loading,
    syncing,
    profile,
    passports,
    legacyStamps,
    festivalMeta,
    scanHistory,
    goldenBeerByDay,
    error,
    refresh,
    scanAndApplyVendor,
  };
}
