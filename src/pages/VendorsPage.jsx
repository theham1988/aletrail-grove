import VendorList from "../components/VendorList";

export default function VendorsPage({ vendors }) {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl bg-festival-primary p-5 text-festival-bg shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-festival-secondary">Road In Grove Festival</p>
        <h1 className="mt-2 text-2xl font-black">Vendor Explorer</h1>
        <p className="mt-1 text-sm text-emerald-100">From 6 stops to 49 vendors. Search, filter, and discover pours.</p>
      </header>
      <VendorList vendors={vendors} />
    </div>
  );
}
