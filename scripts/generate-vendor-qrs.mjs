import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { fileURLToPath } from "node:url";
import { secureFestivalQRCodes } from "../src/data/festivalConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const vendorsPath = path.join(projectRoot, "src", "data", "vendors.json");
const outputRoot = path.join(projectRoot, "generated", "vendor-qrs");
const svgDir = path.join(outputRoot, "svg");
const pngDir = path.join(outputRoot, "png");

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeBooth(booth) {
  if (!booth) return "NO-BOOTH";
  const match = /^([A-Z]+)(\d+)$/i.exec(booth.trim());
  if (!match) return booth.trim().toUpperCase();
  return `${match[1].toUpperCase()}${String(Number(match[2])).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csvCell(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

async function main() {
  const vendors = JSON.parse(await fs.readFile(vendorsPath, "utf8"));
  const inversePayloadMap = new Map(Object.entries(secureFestivalQRCodes).map(([payload, vendorId]) => [vendorId, payload]));

  await fs.mkdir(svgDir, { recursive: true });
  await fs.mkdir(pngDir, { recursive: true });

  const manifest = [];

  for (const vendor of vendors) {
    const payload = inversePayloadMap.get(vendor.id);
    if (!payload) {
      throw new Error(`Missing QR payload mapping for vendor id ${vendor.id}`);
    }

    const normalizedBooth = normalizeBooth(vendor.booth);
    const stem = `${normalizedBooth}-${slugify(vendor.name || `vendor-${vendor.id}`) || `vendor-${vendor.id}`}`;
    const svgPath = path.join(svgDir, `${stem}.svg`);
    const pngPath = path.join(pngDir, `${stem}.png`);

    const qrOptions = {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 800,
      color: {
        dark: "#122617",
        light: "#FFFFFFFF",
      },
    };

    const svg = await QRCode.toString(payload, { ...qrOptions, type: "svg" });
    await fs.writeFile(svgPath, svg, "utf8");
    await QRCode.toFile(pngPath, payload, qrOptions);

    manifest.push({
      vendorId: vendor.id,
      vendorName: vendor.name,
      booth: vendor.booth || "",
      normalizedBooth,
      payload,
      stem,
      svgFile: `svg/${stem}.svg`,
      pngFile: `png/${stem}.png`,
    });
  }

  manifest.sort((a, b) => a.vendorId - b.vendorId);

  const csvHeader = [
    "vendor_id",
    "vendor_name",
    "booth",
    "normalized_booth",
    "payload",
    "svg_file",
    "png_file",
    "printed",
    "delivered",
    "verified",
    "notes",
  ];

  const manifestCsv = [
    csvHeader.join(","),
    ...manifest.map((row) =>
      [
        row.vendorId,
        row.vendorName,
        row.booth,
        row.normalizedBooth,
        row.payload,
        row.svgFile,
        row.pngFile,
        "",
        "",
        "",
        "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n");

  const printableHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Road In Grove Vendor QR Cards</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 24px;
        background: #f5f4ef;
        color: #122617;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 24px;
      }
      p {
        margin: 0 0 20px;
        color: #4c5f51;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .card {
        background: white;
        border: 2px solid #dcd9cd;
        border-radius: 16px;
        padding: 16px;
        page-break-inside: avoid;
      }
      .topline {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
      }
      .booth {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #b91c1c;
      }
      .vendor {
        font-size: 20px;
        font-weight: 800;
        line-height: 1.2;
        margin-bottom: 12px;
      }
      .qr {
        width: 100%;
        display: block;
        aspect-ratio: 1 / 1;
        object-fit: contain;
        background: white;
        border-radius: 12px;
      }
      .payload {
        margin-top: 10px;
        font-size: 11px;
        color: #687d6d;
        word-break: break-all;
      }
      .idline {
        margin-top: 6px;
        font-size: 11px;
        color: #687d6d;
      }
      @media print {
        body {
          background: white;
          padding: 12px;
        }
      }
    </style>
  </head>
  <body>
    <h1>Road In Grove Vendor QR Cards</h1>
    <p>Print one card per vendor booth. Payloads follow the app's canonical festival scan format.</p>
    <div class="grid">
      ${manifest
        .map(
          (row) => `<article class="card">
        <div class="topline">
          <div class="booth">${escapeHtml(row.normalizedBooth)}</div>
          <div class="idline">Vendor ID ${row.vendorId}</div>
        </div>
        <div class="vendor">${escapeHtml(row.vendorName)}</div>
        <img class="qr" src="${escapeHtml(row.pngFile)}" alt="${escapeHtml(row.vendorName)} QR code" />
        <div class="payload">${escapeHtml(row.payload)}</div>
      </article>`,
        )
        .join("\n")}
    </div>
  </body>
</html>
`;

  const checklistMarkdown = `# Vendor QR Verification Checklist

Generated from \`src/data/vendors.json\` and \`src/data/festivalConfig.js\`.

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
- Canonical payload format: \`RIGFEST-VENDOR-001\` through \`RIGFEST-VENDOR-049\`
- Source of truth is vendor \`id\` in \`src/data/vendors.json\`
`;

  await fs.writeFile(path.join(outputRoot, "vendor-qr-manifest.csv"), manifestCsv, "utf8");
  await fs.writeFile(path.join(outputRoot, "vendor-qr-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  await fs.writeFile(path.join(outputRoot, "printable-cards.html"), printableHtml, "utf8");
  await fs.writeFile(path.join(outputRoot, "verification-checklist.md"), checklistMarkdown, "utf8");

  console.log(`Generated ${manifest.length} vendor QR records in ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
