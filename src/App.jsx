import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { Beer, QrCode, House } from "lucide-react";
import BottomNav from "./components/BottomNav";
import QrScanModal from "./components/QrScanModal";
import { useLanguage } from "./contexts/LanguageContext";
import { usePassportManager } from "./hooks/usePassportManager";
import { db } from "./lib/firebase";
import { isFirebaseHostingHost, isLikelyLineInAppBrowser } from "./lib/liffEnv";

const LOCAL_USER_KEY = "rig_demo_user_id";
const LIFF_PROFILE_CACHE_KEY = "rig_liff_profile_cache";
const LIFF_LOGIN_INTENT_KEY = "rig_liff_login_intent";
const APP_CACHE_VERSION_KEY = "rig_app_cache_version";
const APP_CACHE_VERSION = "2026-03-31-intro-line-auth-v1";
const LIFF_ID = "2009417360-sriLePd1";
const LIFF_INIT_TIMEOUT_MS = 20000;

async function initLiffSdk(liff, { maxAttempts = 3, baseDelayMs = 500 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });
      return;
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts && isLikelyNetworkAuthError(e)) {
        await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
        continue;
      }
      throw lastError;
    }
  }
}

async function initLiffSdkWithTimeout(liff, initOptions) {
  return Promise.race([
    initLiffSdk(liff, initOptions),
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error("LINE init timed out. Check your connection."));
      }, LIFF_INIT_TIMEOUT_MS);
    }),
  ]);
}

async function syncLoggedInUserFromLiff(liff, cachedProfile) {
  const decodedToken = liff.getDecodedIDToken();
  const context = liff.getContext();
  let nextUserId = context?.userId || decodedToken?.sub || cachedProfile?.userId || "";
  let nextProfile = {
    displayName: decodedToken?.name || cachedProfile?.displayName || "Festival Explorer",
    pictureUrl: decodedToken?.picture || cachedProfile?.pictureUrl || "",
  };

  try {
    const userProfile = await liff.getProfile();
    nextUserId = userProfile.userId || nextUserId;
    nextProfile = {
      displayName: userProfile.displayName || nextProfile.displayName,
      pictureUrl: userProfile.pictureUrl || nextProfile.pictureUrl,
    };
  } catch (profileError) {
    console.warn("LINE profile fetch failed, using token/context fallback.", profileError);
  }

  if (!nextUserId) {
    throw new Error("Unable to fetch LINE account details.");
  }

  localStorage.setItem(
    LIFF_PROFILE_CACHE_KEY,
    JSON.stringify({
      userId: nextUserId,
      displayName: nextProfile.displayName,
      pictureUrl: nextProfile.pictureUrl,
    }),
  );

  return { nextUserId, nextProfile };
}

const AleTrailExperienceView = lazy(() => import("./pages/AleTrailExperienceView"));
const HubView = lazy(() => import("./pages/HubView"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const RoadInGrovePassportTab = lazy(() => import("./pages/RoadInGrovePassportTab"));
const RoadInGrovePoursTab = lazy(() => import("./pages/RoadInGrovePoursTab"));

let liffPromise;

function getLiff() {
  if (!liffPromise) {
    liffPromise = import("@line/liff").then((module) => module.default);
  }
  return liffPromise;
}

function readCachedLiffProfile() {
  try {
    const cached = localStorage.getItem(LIFF_PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function clearSessionCache() {
  try {
    localStorage.removeItem(LIFF_PROFILE_CACHE_KEY);
    localStorage.removeItem(LOCAL_USER_KEY);
    sessionStorage.removeItem(LIFF_LOGIN_INTENT_KEY);
  } catch {
    // Ignore localStorage failures so logout still proceeds.
  }
}

function readLoginIntent() {
  try {
    return sessionStorage.getItem(LIFF_LOGIN_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeLoginIntent(value) {
  try {
    if (value) {
      sessionStorage.setItem(LIFF_LOGIN_INTENT_KEY, "1");
    } else {
      sessionStorage.removeItem(LIFF_LOGIN_INTENT_KEY);
    }
  } catch {
    // Ignore storage failures and continue the auth flow.
  }
}

function isLikelyNetworkAuthError(error) {
  const msg = `${error?.message || ""} ${error?.cause?.message || ""}`.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network error") ||
    msg.includes("load failed") ||
    msg.includes("timed out") ||
    msg.includes("timeout")
  );
}

export default function App() {
  const { t } = useLanguage();
  const isEmbeddedPreview = window.self !== window.top;
  const [initialUserId, setInitialUserId] = useState("");
  const [authProfile, setAuthProfile] = useState({ displayName: "Explorer", pictureUrl: "" });
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authConnectionRetry, setAuthConnectionRetry] = useState(false);
  const [isLineClient, setIsLineClient] = useState(false);
  const [authActionPending, setAuthActionPending] = useState(false);
  const [activeTab, setActiveTab] = useState("hub");
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introMounted, setIntroMounted] = useState(true);
  const [introVideoReady, setIntroVideoReady] = useState(false);
  const didCelebrate = useRef(false);
  const introTimeoutRef = useRef(null);

  useEffect(() => {
    try {
      const cachedVersion = localStorage.getItem(APP_CACHE_VERSION_KEY);
      if (cachedVersion !== APP_CACHE_VERSION) {
        localStorage.setItem(APP_CACHE_VERSION_KEY, APP_CACHE_VERSION);
        localStorage.removeItem(LIFF_PROFILE_CACHE_KEY);
      }
    } catch {
      // Ignore cache-version bootstrap failures.
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function initLiffUser() {
      const cachedProfile = readCachedLiffProfile();
      const loginIntent = readLoginIntent();

      try {
        if (alive) setAuthConnectionRetry(false);

        // Keep local fallback only for embedded browser testing environments.
        if (isEmbeddedPreview) {
          const existing = localStorage.getItem(LOCAL_USER_KEY);
          const mockProfile = {
            displayName: "Local Explorer",
            pictureUrl: "",
          };
          if (existing) {
            if (alive) setInitialUserId(existing);
          } else {
            const generated = `demo_${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem(LOCAL_USER_KEY, generated);
            if (alive) setInitialUserId(generated);
          }
          if (alive) setAuthProfile(mockProfile);
          if (alive) {
            setAuthError("");
            setAuthActionPending(false);
          }
          return;
        }

        const liff = await getLiff();
        window.liff = liff;
        await initLiffSdkWithTimeout(liff);
        const inClient = liff.isInClient();
        const lineEmbedded = inClient || isLikelyLineInAppBrowser();
        if (alive) setIsLineClient(lineEmbedded);
        if (liff.isLoggedIn()) {
          const { nextUserId, nextProfile } = await syncLoggedInUserFromLiff(liff, cachedProfile);

          if (alive) {
            setInitialUserId(nextUserId);
            setAuthProfile(nextProfile);
            setAuthError("");
            setAuthConnectionRetry(false);
            setAuthActionPending(false);
          }

          if (loginIntent && alive) {
            writeLoginIntent(false);
            setShowIntro(false);
            setIntroMounted(false);
            setIntroVideoReady(false);
          }
        } else {
          writeLoginIntent(false);
          if (alive) {
            setAuthError("");
            setAuthConnectionRetry(false);
            setAuthActionPending(false);
          }
        }
      } catch (error) {
        if (cachedProfile?.userId && alive) {
          setInitialUserId(cachedProfile.userId);
          setAuthProfile({
            displayName: cachedProfile.displayName || "Festival Explorer",
            pictureUrl: cachedProfile.pictureUrl || "",
          });
          setAuthError("");
          setAuthConnectionRetry(false);
          setAuthActionPending(false);
        } else if (alive) {
          if (isLikelyNetworkAuthError(error)) {
            setAuthError(t("auth_connection_error"));
            setAuthConnectionRetry(true);
          } else {
            setAuthError(error?.message || "Failed to initialize LINE login.");
            setAuthConnectionRetry(false);
          }
          setAuthActionPending(false);
        }
      } finally {
        if (alive) setAuthReady(true);
      }
    }

    initLiffUser();
    return () => {
      alive = false;
    };
  }, [isEmbeddedPreview, t]);

  const { loading, syncing, profile, passports, legacyStamps, festivalMeta, goldenBeerByDay, error, scanAndApplyVendor } =
    usePassportManager(initialUserId, authProfile);

  const roadInGroveStamps = passports.road_in_grove || [];
  const aleTrailStamps = passports.ale_trail_v1 || [];

  useEffect(() => {
    if (!authReady || !initialUserId || didCelebrate.current) return;
    didCelebrate.current = true;

    let cancelled = false;
    let secondBurstTimeout = null;

    const burst = async () => {
      const { default: confetti } = await import("canvas-confetti");
      if (cancelled) return;
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.1,
      });
    };

    burst();
    secondBurstTimeout = window.setTimeout(() => {
      burst();
    }, 200);

    return () => {
      cancelled = true;
      if (secondBurstTimeout) {
        window.clearTimeout(secondBurstTimeout);
      }
    };
  }, [authReady, initialUserId]);

  const handleLogout = async () => {
    clearSessionCache();
    try {
      if (!isEmbeddedPreview) {
        const liff = await getLiff();
        window.liff = liff;
        await initLiffSdk(liff);
        if (liff.isLoggedIn()) {
          liff.logout();
        }
      }
    } catch {
      // Ignore logout failures and still refresh to a clean app state.
    }
    window.location.replace(window.location.origin + window.location.pathname);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirm_delete"));
    if (!confirmed || !initialUserId) return;

    await deleteDoc(doc(db, "aletrail_users", initialUserId));
    handleLogout();
  };

  const handleScan = useCallback(async (providedPayload = "") => {
    const result = await scanAndApplyVendor(providedPayload);
    if (!result || result.cancelled) {
      return;
    }

    if (result.lineScannerUnavailable) {
      window.alert(t("scan_line_unavailable"));
      return;
    }

    if (result.requiresBrowserFallback) {
      if (isLineClient || isLikelyLineInAppBrowser()) {
        window.alert(t("scan_line_unavailable"));
        return;
      }
      setQrScanModalOpen(true);
      return;
    }

    if (result?.vendor) {
      if (result.goldenBeerWon) {
        window.alert(`${t("golden_beer_found_title")}\n\n${t("golden_beer_found_desc")}`);
        return;
      }

      if (result.eligibilityUnlocked) {
        window.alert(`${t("festival_entry_unlocked")}\n\n${t("festival_entry_unlocked_desc")}`);
        return;
      }

      if (!result.addedNewStamp) {
        window.alert(
          `${t("scan_no_stamp_title")}\n\n${t("scan_no_stamp_desc").replace("{vendor}", result.vendor.name)}`,
        );
        return;
      }

      if ((result.addedPassportKeys || []).length > 1) {
        window.alert(
          `${t("scan_dual_stamp_title")}\n\n${t("scan_dual_stamp_desc").replace("{vendor}", result.vendor.name)}`,
        );
        return;
      }

      window.alert(
        `${t("scan_single_stamp_title")}\n\n${t("scan_single_stamp_desc").replace("{vendor}", result.vendor.name)}`,
      );
    }
  }, [isLineClient, scanAndApplyVendor, t]);

  const shouldPlayIntroVideo = !isLineClient && !isLikelyLineInAppBrowser();
  const introUiVisible = introVideoReady || !shouldPlayIntroVideo;

  useEffect(() => {
    if (showIntro) {
      setIntroMounted(true);
      setIntroVideoReady(!shouldPlayIntroVideo);
    }
  }, [showIntro, shouldPlayIntroVideo]);

  useEffect(() => {
    return () => {
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
      }
    };
  }, []);

  const openPassport = (passportId) => {
    setSelectedPassport(passportId);
    if (passportId === "road_in_grove") {
      setActiveTab("festival_pours");
      return;
    }
    setActiveTab("passport");
  };

  const handleEnterGrove = async () => {
    if (authActionPending || (!authReady && !isEmbeddedPreview)) return;

    if (isEmbeddedPreview || initialUserId) {
      handleIntroDismiss();
      return;
    }

    try {
      setAuthError("");
      setAuthConnectionRetry(false);
      setAuthActionPending(true);
      const liff = await getLiff();
      window.liff = liff;
      await initLiffSdkWithTimeout(liff);

      const lineEmbedded = liff.isInClient() || isLikelyLineInAppBrowser();
      setIsLineClient(lineEmbedded);

      if (liff.isLoggedIn()) {
        const cached = readCachedLiffProfile();
        const { nextUserId, nextProfile } = await syncLoggedInUserFromLiff(liff, cached);
        setInitialUserId(nextUserId);
        setAuthProfile(nextProfile);
        handleIntroDismiss();
        return;
      }

      writeLoginIntent(true);
      liff.login();
    } catch (error) {
      writeLoginIntent(false);
      if (isLikelyNetworkAuthError(error)) {
        setAuthError(t("auth_connection_error"));
        setAuthConnectionRetry(true);
      } else {
        setAuthError(error?.message || "Unable to start LINE login.");
        setAuthConnectionRetry(false);
      }
    } finally {
      setAuthActionPending(false);
    }
  };

  const handleIntroDismiss = () => {
    if (!introMounted || !showIntro) return;
    if (introTimeoutRef.current) {
      window.clearTimeout(introTimeoutRef.current);
    }
    setShowIntro(false);
    introTimeoutRef.current = window.setTimeout(() => {
      setIntroMounted(false);
      introTimeoutRef.current = null;
    }, 800);
  };

  const activeView = useMemo(() => {
    if (activeTab === "hub") {
      return <HubView onSelectPassport={openPassport} stampsCount={roadInGroveStamps.length} festivalMeta={festivalMeta} goldenBeerByDay={goldenBeerByDay} />;
    }
    if (selectedPassport === "road_in_grove" && activeTab === "festival_pours") {
      return <RoadInGrovePoursTab syncing={syncing} onScan={handleScan} />;
    }
    if (selectedPassport === "road_in_grove" && activeTab === "festival_passport") {
      return (
        <RoadInGrovePassportTab
          stamps={roadInGroveStamps}
          syncing={syncing}
          onScan={handleScan}
          festivalMeta={festivalMeta}
          goldenBeerByDay={goldenBeerByDay}
        />
      );
    }
    if (activeTab === "passport" && selectedPassport === "ale_trail_v1") {
      return (
        <AleTrailExperienceView
          stamps={aleTrailStamps}
          syncing={syncing}
          onBack={() => setActiveTab("hub")}
          onScan={handleScan}
        />
      );
    }
    if (activeTab === "passport") {
      return (
        <div className="info-card">
          <h3>{t("current_passport")}</h3>
          <p>{t("no_passport_selected")}</p>
        </div>
      );
    }

    return (
      <ProfileView
        userId={initialUserId}
        profileName={profile.displayName || authProfile.displayName}
        pictureUrl={profile.pictureUrl || authProfile.pictureUrl}
        passports={passports}
        legacyStamps={legacyStamps}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  }, [
    activeTab,
    aleTrailStamps,
    authProfile.displayName,
    authProfile.pictureUrl,
    initialUserId,
    legacyStamps,
    festivalMeta,
    goldenBeerByDay,
    passports,
    profile.displayName,
    profile.pictureUrl,
    roadInGroveStamps,
    selectedPassport,
    syncing,
    t,
    handleScan,
  ]);

  const bottomNavItems = useMemo(() => {
    if (selectedPassport === "road_in_grove" && activeTab.startsWith("festival_")) {
      return [
        { key: "festival_pours", label: t("nav_pours"), icon: Beer },
        { key: "festival_passport", label: t("nav_pass"), icon: QrCode },
        { key: "hub", label: t("nav_hub"), icon: House },
      ];
    }

    return undefined;
  }, [activeTab, selectedPassport, t]);

  const handleBottomNavChange = (nextTab) => {
    if (nextTab === "hub") {
      setSelectedPassport(null);
      setActiveTab("hub");
      return;
    }

    if (selectedPassport === "road_in_grove" && nextTab.startsWith("festival_")) {
      setActiveTab(nextTab);
      return;
    }

    setActiveTab(nextTab);
  };

  const handleQrScanDetected = useCallback(async (payload) => {
    setQrScanModalOpen(false);
    await handleScan(payload);
  }, [handleScan]);

  const authLiffHostingHint = authConnectionRetry && isLikelyLineInAppBrowser() && isFirebaseHostingHost();

  return (
    <div className="app-container" style={{ backgroundColor: showIntro ? "#000" : undefined }}>
      {(!authReady || loading) && !introMounted && (
        <div className="content-area" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <div className="countdown-box">
            <span className="countdown-label">{window.self !== window.top ? t("mock_mode") : t("syncing")}</span>
            <div className="countdown-time">{t("syncing")}</div>
          </div>
        </div>
      )}

      {authReady && !loading && (
        <>
          {!introMounted && authError && (
            <div style={{ margin: "16px", textAlign: "center" }}>
              <p style={{ color: "#b91c1c", fontSize: "13px", fontWeight: 700, margin: "0 0 8px" }}>{authError}</p>
              {authLiffHostingHint && (
                <p style={{ color: "#21432a", fontSize: "12px", fontWeight: 600, margin: "0 0 10px", lineHeight: 1.45 }}>{t("auth_use_official_liff_link")}</p>
              )}
              {authConnectionRetry && (
                <button type="button" className="pressable" style={{ fontSize: "13px", fontWeight: 700 }} onClick={() => window.location.reload()}>
                  {t("auth_retry_button")}
                </button>
              )}
            </div>
          )}
          {error && <p style={{ margin: "16px", color: "#b91c1c", fontSize: "13px", fontWeight: 700 }}>{error}</p>}

          <main className="content-area">
            <Suspense
              fallback={
                <div className="info-card">
                  <h3>{t("current_passport")}</h3>
                  <p>{t("syncing")}</p>
                </div>
              }
            >
              {activeView}
            </Suspense>
          </main>
          <BottomNav active={activeTab} onChange={handleBottomNavChange} items={bottomNavItems} />

          {introMounted && (
            <div
              className="intro-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 9999,
                backgroundColor: "#000",
                opacity: showIntro ? 1 : 0,
                transition: showIntro ? "none" : "opacity 0.8s ease-in-out",
                pointerEvents: showIntro ? "all" : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: "60px",
              }}
            >
              {!shouldPlayIntroVideo && <div className="intro-static-backdrop" aria-hidden />}
              {shouldPlayIntroVideo && (
                <video
                  className="intro-video"
                  src="/intro.mp4"
                  autoPlay
                  muted
                  playsInline
                  onLoadedData={() => setIntroVideoReady(true)}
                  onError={() => setIntroVideoReady(true)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1,
                    opacity: introVideoReady ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                  }}
                />
              )}
              <button
                type="button"
                className="pressable"
                onClick={handleEnterGrove}
                disabled={authActionPending || (!authReady && !isEmbeddedPreview)}
                style={{
                  backgroundColor: "var(--carnival-gold)",
                  color: "var(--carnival-red)",
                  border: "3px solid var(--carnival-red)",
                  padding: "18px 36px",
                  borderRadius: "16px",
                  fontSize: "18px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                  zIndex: 10000,
                  opacity: introUiVisible ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                {authActionPending || (!authReady && !isEmbeddedPreview) ? t("syncing") : t("enter_grove")}
              </button>
              <p
                style={{
                  marginTop: "16px",
                  maxWidth: "280px",
                  textAlign: "center",
                  color: authError ? "#f5c24d" : "#fdf8e7",
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: 1.4,
                  zIndex: 10000,
                  opacity: introUiVisible ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                {authError || (initialUserId ? t("passport_hub_hint") : t("join_note"))}
              </p>
              {authLiffHostingHint && (
                <p
                  style={{
                    marginTop: "10px",
                    maxWidth: "300px",
                    textAlign: "center",
                    color: "#c8e6d0",
                    fontSize: "12px",
                    fontWeight: 600,
                    lineHeight: 1.45,
                    zIndex: 10000,
                    opacity: introUiVisible ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                  }}
                >
                  {t("auth_use_official_liff_link")}
                </p>
              )}
              {authConnectionRetry && (
                <button
                  type="button"
                  className="pressable"
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: "12px",
                    zIndex: 10000,
                    opacity: introUiVisible ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    backgroundColor: "rgba(253, 248, 231, 0.15)",
                    color: "#fdf8e7",
                    border: "1px solid rgba(253, 248, 231, 0.4)",
                  }}
                >
                  {t("auth_retry_button")}
                </button>
              )}
            </div>
          )}
        </>
      )}
      <QrScanModal
        open={qrScanModalOpen}
        onClose={() => setQrScanModalOpen(false)}
        onDetected={handleQrScanDetected}
      />
    </div>
  );
}
