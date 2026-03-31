/**
 * Some LINE in-app WebViews report liff.isInClient() === false even though the page
 * runs inside LINE. Web getUserMedia (html5-qrcode) is still blocked there, so we must
 * not route those sessions to the browser QR fallback.
 */
export function isLikelyLineInAppBrowser() {
  if (typeof navigator === "undefined" || !navigator.userAgent) return false;
  const ua = navigator.userAgent;
  return /Line\//i.test(ua) || /\bLIFF\b/i.test(ua);
}
