import { useEffect, useMemo, useRef, useState } from "react";
import liff from "@line/liff";
import confetti from "canvas-confetti";
import { deleteDoc, doc } from "firebase/firestore";
import { Beer, MapPinned, QrCode, House } from "lucide-react";
import BottomNav from "./components/BottomNav";
import { useLanguage } from "./contexts/LanguageContext";
import { usePassportManager } from "./hooks/usePassportManager";
import { db } from "./lib/firebase";
import AleTrailExperienceView from "./pages/AleTrailExperienceView";
import HubView from "./pages/HubView";
import ProfileView from "./pages/ProfileView";
import RoadInGroveMapTab from "./pages/RoadInGroveMapTab";
import RoadInGrovePassportTab from "./pages/RoadInGrovePassportTab";
import RoadInGrovePoursTab from "./pages/RoadInGrovePoursTab";

const LOCAL_USER_KEY = "rig_demo_user_id";
const LIFF_ID = "2009417360-sriLePd1";

export default function App() {
  const { t } = useLanguage();
  const [initialUserId, setInitialUserId] = useState("");
  const [authProfile, setAuthProfile] = useState({ displayName: "Explorer", pictureUrl: "" });
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("hub");
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introMounted, setIntroMounted] = useState(false);
  const didCelebrate = useRef(false);
  const introTimeoutRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function initLiffUser() {
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

        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          if (alive) {
            setInitialUserId(userProfile.userId);
            setAuthProfile({
              displayName: userProfile.displayName,
              pictureUrl: userProfile.pictureUrl || "",
            });
          }
        } else {
          liff.login();
          return;
        }
      } catch (error) {
        if (alive) setAuthError(error?.message || "Failed to initialize LINE login.");
      } finally {
        if (alive) setAuthReady(true);
      }
    }

    initLiffUser();
    return () => {
      alive = false;
    };
  }, []);

  const { loading, syncing, profile, passports, legacyStamps, error, scanAndApplyVendor } =
    usePassportManager(initialUserId, authProfile);

  const roadInGroveStamps = passports.road_in_grove || [];
  const aleTrailStamps = passports.ale_trail_v1 || [];

  useEffect(() => {
    if (!authReady || !initialUserId || didCelebrate.current) return;
    didCelebrate.current = true;

    const burst = () =>
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        scalar: 1.1,
      });

    burst();
    setTimeout(burst, 200);
  }, [authReady, initialUserId]);

  useEffect(() => {
    if (authReady && !loading && showIntro) {
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
      setActiveTab("festival_map");
      return;
    }
    setActiveTab("passport");
  };

  const handleLogout = () => {
    if (window.self === window.top && liff.isLoggedIn()) {
      liff.logout();
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirm_delete"));
    if (!confirmed || !initialUserId) return;

    await deleteDoc(doc(db, "aletrail_users", initialUserId));
    handleLogout();
  };

  const handleScan = async () => {
    const vendor = await scanAndApplyVendor();
    if (vendor) {
      window.alert(`Stamped ${vendor.name} in ${vendor.activePassports.join(", ")}`);
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
    }, 500);
  };

  const activeView = useMemo(() => {
    if (activeTab === "hub") {
      return <HubView onSelectPassport={openPassport} />;
    }
    if (selectedPassport === "road_in_grove" && activeTab === "festival_map") {
      return <RoadInGroveMapTab syncing={syncing} onScan={handleScan} />;
    }
    if (selectedPassport === "road_in_grove" && activeTab === "festival_pours") {
      return <RoadInGrovePoursTab syncing={syncing} onScan={handleScan} />;
    }
    if (selectedPassport === "road_in_grove" && activeTab === "festival_passport") {
      return <RoadInGrovePassportTab stamps={roadInGroveStamps} syncing={syncing} onScan={handleScan} />;
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
        { key: "festival_map", label: t("nav_map"), icon: MapPinned },
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
    <div className="app-container">
      {(!authReady || loading) && (
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

          <main className="content-area">{activeView}</main>
          <BottomNav active={activeTab} onChange={handleBottomNavChange} items={bottomNavItems} />

          {introMounted && (
            <div className={`intro-overlay ${showIntro ? "visible" : "hidden"}`}>
              <button type="button" className="intro-skip-btn pressable" onClick={handleIntroDismiss}>
                Skip
              </button>
              <video
                className="intro-video"
                src="/intro.mp4"
                autoPlay
                muted
                playsInline
                onEnded={handleIntroDismiss}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
