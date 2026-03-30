import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { Beer, QrCode, House } from "lucide-react";
import BottomNav from "./components/BottomNav";
import { useLanguage } from "./contexts/LanguageContext";
import { usePassportManager } from "./hooks/usePassportManager";
import { db } from "./lib/firebase";

const LOCAL_USER_KEY = "rig_demo_user_id";
const LIFF_PROFILE_CACHE_KEY = "rig_liff_profile_cache";
const APP_CACHE_VERSION_KEY = "rig_app_cache_version";
const APP_CACHE_VERSION = "2026-03-27-auth-cache-v3";
const LIFF_ID = "2009417360-sriLePd1";

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
  } catch {
    // Ignore localStorage failures so logout still proceeds.
  }
}

export default function App() {
  const { t } = useLanguage();
  const [initialUserId, setInitialUserId] = useState("");
  const [authProfile, setAuthProfile] = useState({ displayName: "Explorer", pictureUrl: "" });
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("hub");
  const [selectedPassport, setSelectedPassport] = useState(null);
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

      try {
        // Keep local fallback only for embedded browser testing environments.
        if (window.self !== window.top) {
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
          return;
        }

        const liff = await getLiff();
        window.liff = liff;
        await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });
        if (liff.isInClient()) {
          if (alive) {
            setShowIntro(false);
            setIntroMounted(false);
            setIntroVideoReady(false);
          }
        }
        if (liff.isLoggedIn()) {
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

          if (alive) {
            setInitialUserId(nextUserId);
            setAuthProfile(nextProfile);
            setAuthError("");
          }
        } else {
          liff.login();
          return;
        }
      } catch (error) {
        if (cachedProfile?.userId && alive) {
          setInitialUserId(cachedProfile.userId);
          setAuthProfile({
            displayName: cachedProfile.displayName || "Festival Explorer",
            pictureUrl: cachedProfile.pictureUrl || "",
          });
          setAuthError("");
        } else if (alive) {
          setAuthError(error?.message || "Failed to initialize LINE login.");
        }
      } finally {
        if (alive) setAuthReady(true);
      }
    }

    initLiffUser();
    return () => {
      alive = false;
    };
  }, []);

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
      const liff = await getLiff();
      if (window.self === window.top && liff.isLoggedIn()) {
        liff.logout();
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

  const handleScan = async () => {
    const result = await scanAndApplyVendor();
    if (!result || result.cancelled) {
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
  };

  useEffect(() => {
    if (authReady && !loading && showIntro) {
      setIntroVideoReady(false);
      setIntroMounted(true);
    }
  }, [authReady, loading, showIntro]);

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
          {authError && <p style={{ margin: "16px", color: "#b91c1c", fontSize: "13px", fontWeight: 700 }}>{authError}</p>}
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
              <video
                className="intro-video"
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                onLoadedData={() => setIntroVideoReady(true)}
                onError={() => setIntroVideoReady(true)}
                onEnded={handleIntroDismiss}
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
              <button
                type="button"
                className="pressable"
                onClick={handleIntroDismiss}
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
                  opacity: introVideoReady ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                }}
              >
                Enter Grove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
