import { QrCode } from "lucide-react";
import PassportTierView from "../components/PassportTierView";

export default function PassportPage({ festivalStamps, onScan, isSyncing }) {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-festival-border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-festival-muted">Passport</p>
        <h1 className="mt-1 text-2xl font-black text-festival-text">Festival Stamp Tiers</h1>
        <p className="mt-1 text-sm text-festival-muted">{festivalStamps.length}/49 total festival stamps collected</p>
      </header>

      <PassportTierView festivalStamps={festivalStamps} />

      <button
        type="button"
        onClick={onScan}
        disabled={isSyncing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-festival-primary px-4 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-festival-primaryLight disabled:cursor-not-allowed disabled:opacity-60"
      >
        <QrCode size={18} />
        {isSyncing ? "Saving..." : "Scan Vendor QR"}
      </button>
    </div>
  );
}
