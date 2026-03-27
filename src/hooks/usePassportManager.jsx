import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import vendors from "../data/vendors.json";
import { secureFestivalQRCodes } from "../data/festivalConfig";
import { db } from "../lib/firebase";

const DEFAULT_PASSPORTS = {
  road_in_grove: [],
  ale_trail_v1: [],
};

function resolveVendorFromScan(rawValue) {
  const payload = rawValue?.toString().trim();
  if (!payload) return null;

  const vendorId = secureFestivalQRCodes[payload];
  if (!vendorId) return null;
  return vendors.find((vendor) => vendor.id === vendorId) || null;
}

async function scanQRCode() {
  if (window.liff?.scanCodeV2) {
    const result = await window.liff.scanCodeV2();
    return result?.value || "";
  }
  return window.prompt("Enter QR payload (vendor id or exact vendor name):") || "";
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
  const [error, setError] = useState("");

  const userRef = useMemo(() => {
    if (!userId) return null;
    return doc(db, "aletrail_users", userId);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) {
        setPassports(DEFAULT_PASSPORTS);
        setLegacyStamps([]);
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

      setProfile({
        displayName: data.displayName || "Festival Explorer",
        pictureUrl: data.pictureUrl || "",
      });
      setPassports(nextPassports);
      setLegacyStamps(Array.isArray(data.stamps) ? data.stamps : []);
    } catch (err) {
      setError(err?.message || "Failed to load passport data.");
    } finally {
      setLoading(false);
    }
  }, [userRef, authProfile?.displayName, authProfile?.pictureUrl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const scanAndApplyVendor = useCallback(async () => {
    if (!userRef) return null;
    setSyncing(true);
    setError("");

    try {
      const payload = await scanQRCode();
      const vendor = resolveVendorFromScan(payload);

      if (!vendor) throw new Error("Invalid or unofficial QR payload.");

      const snapshot = await getDoc(userRef);
      const data = snapshot.exists() ? snapshot.data() : {};

      const existingPassports = {
        ...DEFAULT_PASSPORTS,
        ...(typeof data.passports === "object" && data.passports ? data.passports : {}),
      };

      const updatedPassports = { ...existingPassports };
      for (const passportKey of vendor.activePassports) {
        const currentEntries = Array.isArray(updatedPassports[passportKey]) ? updatedPassports[passportKey] : [];
        if (!currentEntries.includes(vendor.id)) {
          updatedPassports[passportKey] = [...currentEntries, vendor.id].sort((a, b) => a - b);
        }
      }

      await setDoc(
        userRef,
        {
          passports: updatedPassports,
          displayName: authProfile?.displayName || profile.displayName || "Festival Explorer",
          pictureUrl: authProfile?.pictureUrl || profile.pictureUrl || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setPassports(updatedPassports);
      return vendor;
    } catch (err) {
      setError(err?.message || "Scan failed.");
      return null;
    } finally {
      setSyncing(false);
    }
  }, [authProfile?.displayName, authProfile?.pictureUrl, profile.displayName, profile.pictureUrl, userRef]);

  return {
    loading,
    syncing,
    profile,
    passports,
    legacyStamps,
    error,
    refresh,
    scanAndApplyVendor,
  };
}
