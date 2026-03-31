import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

function pickPreferredCamera(cameras) {
  return (
    cameras.find((camera) => /back|rear|environment/i.test(camera.label || "")) ||
    cameras.find((camera) => /wide/i.test(camera.label || "")) ||
    cameras[0]
  );
}

export default function QrScanModal({ open, onClose, onDetected }) {
  const { t } = useLanguage();
  const regionId = useId().replace(/[:]/g, "");
  const scannerRef = useRef(null);
  const mountedRef = useRef(false);
  const fileInputRef = useRef(null);
  const onDetectedRef = useRef(onDetected);
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraIssue, setCameraIssue] = useState("");

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopScanner = useCallback(async () => {
    requestIdRef.current += 1;
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (!scanner) {
      if (mountedRef.current) {
        setCameraActive(false);
      }
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      // Ignore stop errors during teardown.
    }

    try {
      await scanner.clear();
    } catch {
      // Ignore clear errors during teardown.
    }

    if (mountedRef.current) {
      setCameraActive(false);
    }
  }, []);

  const completeScan = useCallback(
    async (decodedText) => {
      await stopScanner();
      onDetectedRef.current?.(decodedText);
    },
    [stopScanner],
  );

  const startCamera = useCallback(async () => {
    if (!open) return;

    setBusy(true);
    setStatus(t("qr_fallback_starting"));
    setCameraIssue("");

    try {
      await stopScanner();
      const requestId = ++requestIdRef.current;
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;

      const scanConfig = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      };

      const onScanSuccess = async (decodedText) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        await completeScan(decodedText);
      };

      try {
        await scanner.start({ facingMode: "environment" }, scanConfig, onScanSuccess, () => {});
      } catch (primaryError) {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          throw primaryError;
        }
        await scanner.start(pickPreferredCamera(cameras).id, scanConfig, onScanSuccess, () => {});
      }

      if (mountedRef.current && requestId === requestIdRef.current) {
        setCameraActive(true);
        setStatus("");
        setCameraIssue("");
      }
    } catch (error) {
      const requestId = requestIdRef.current;
      const message = `${error?.name || ""} ${error?.message || ""}`.toLowerCase();
      if (mountedRef.current && requestId === requestIdRef.current) {
        if (message.includes("notallowed") || message.includes("permission")) {
          setStatus(t("qr_fallback_camera_permission_denied"));
          setCameraIssue("permission_denied");
        } else if (message.includes("notfound") || message.includes("no camera")) {
          setStatus(t("qr_fallback_camera_not_found"));
          setCameraIssue("not_found");
        } else if (message.includes("notreadable") || message.includes("could not start")) {
          setStatus(t("qr_fallback_camera_busy"));
          setCameraIssue("busy");
        } else {
          setStatus(t("qr_fallback_camera_unavailable"));
          setCameraIssue("unavailable");
        }
      }
      await stopScanner();
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setBusy(false);
      }
    }
  }, [completeScan, open, regionId, stopScanner, t]);

  useEffect(() => {
    if (!open) {
      void stopScanner();
      setStatus("");
      setBusy(false);
      setCameraIssue("");
      setCameraActive(false);
    }
  }, [open, stopScanner]);

  useLayoutEffect(() => {
    if (!open) return;
    void startCamera();
  }, [open, startCamera]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setStatus(t("qr_fallback_uploading"));
    setCameraIssue("");

    try {
      await stopScanner();
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      const decodedText = await scanner.scanFile(file, true);
      await completeScan(decodedText);
    } catch {
      setStatus(t("qr_fallback_upload_error"));
    } finally {
      if (mountedRef.current) {
        setBusy(false);
      }
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="qr-scan-modal-overlay" role="dialog" aria-modal="true" aria-labelledby={`${regionId}-title`}>
      <div className="qr-scan-modal">
        <button type="button" className="qr-scan-close pressable" onClick={handleClose} aria-label={t("qr_fallback_cancel")}>
          <X size={18} />
        </button>

        <div className="qr-scan-copy">
          <h3 id={`${regionId}-title`}>{t("qr_fallback_title")}</h3>
          <p>{t("qr_fallback_desc")}</p>
        </div>

        <div className="qr-scan-stage">
          <div id={regionId} className="qr-scan-region" />
        </div>

        <p className="qr-scan-status">{status || "\u00A0"}</p>

        {cameraIssue === "permission_denied" && (
          <div className="qr-scan-help-panel" role="status" aria-live="polite">
            <strong>{t("qr_fallback_permission_help_title")}</strong>
            <p>{t("qr_fallback_permission_help_desc")}</p>
          </div>
        )}

        <div className="qr-scan-actions">
          <button type="button" className="btn-outline pressable qr-scan-action" onClick={() => void startCamera()} disabled={busy}>
            <Camera size={16} />
            {cameraActive ? t("qr_fallback_camera_restart") : t("qr_fallback_camera")}
          </button>

          <button type="button" className="scan-fab pressable qr-scan-action" onClick={handleUploadClick} disabled={busy}>
            <ImagePlus size={16} />
            {t("qr_fallback_upload")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="qr-scan-file-input"
            onChange={handleUploadChange}
          />
        </div>

        <button type="button" className="qr-scan-cancel pressable" onClick={handleClose}>
          {t("qr_fallback_cancel")}
        </button>
      </div>
    </div>
  );
}
