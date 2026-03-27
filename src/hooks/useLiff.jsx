import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import liff from "@line/liff";

const LIFF_ID = import.meta.env.VITE_LIFF_ID || "2009417360-sriLePd1";

const mockProfile = {
  userId: "LOCAL-TEST-USER",
  displayName: "Local Explorer",
  pictureUrl: "",
};

const LiffContext = createContext(null);

export function LiffProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const init = useCallback(async () => {
    setError("");
    try {
      await liff.init({ liffId: LIFF_ID });

      if (!liff.isLoggedIn()) {
        if (window.self !== window.top) {
          setIsMock(true);
          setProfile(mockProfile);
          setReady(true);
          return;
        }

        liff.login();
        return;
      }

      const lineProfile = await liff.getProfile();
      setIsMock(false);
      setProfile(lineProfile);
      setReady(true);
    } catch (err) {
      if (window.self !== window.top || import.meta.env.DEV) {
        setIsMock(true);
        setProfile(mockProfile);
        setReady(true);
        return;
      }

      setError(err?.message || "LIFF initialization failed.");
      setReady(true);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const logout = useCallback(() => {
    if (!isMock && liff.isLoggedIn()) {
      liff.logout();
    }
    window.location.href = window.location.origin + window.location.pathname;
  }, [isMock]);

  const scanCode = useCallback(async () => {
    if (isMock) {
      const value = window.prompt("Mock scan mode: paste a test QR payload");
      return { value: value || "" };
    }
    return liff.scanCodeV2();
  }, [isMock]);

  const value = useMemo(
    () => ({
      profile,
      ready,
      error,
      isMock,
      login: () => liff.login(),
      logout,
      scanCode,
    }),
    [profile, ready, error, isMock, logout, scanCode],
  );

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>;
}

export function useLiff() {
  const ctx = useContext(LiffContext);
  if (!ctx) {
    throw new Error("useLiff must be used inside LiffProvider");
  }
  return ctx;
}
