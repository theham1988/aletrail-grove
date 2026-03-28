# Vendor QR Verification Checklist

Generated from `src/data/vendors.json` and `src/data/festivalConfig.js`.

## Sample Scan Pass
- Pick 5 vendors across different booth ranges.
- Scan each code in the app and confirm the vendor name matches.
- Confirm the booth shown in the app matches the printed card.
- Re-scan one already collected vendor and confirm duplicate behavior is acceptable.
- Confirm at least one vendor without a booth still scans correctly.

## Festival Setup Checklist
- Print status checked for all 49 vendors.
- QR card delivered to correct booth.
- Booth team knows the QR must stay visible all day.
- One test scan completed at the booth before opening.
- Verification sheet signed once the booth is confirmed live.

## Notes
- Canonical payload format: `RIGFEST-VENDOR-001` through `RIGFEST-VENDOR-049`
- Source of truth is vendor `id` in `src/data/vendors.json`
