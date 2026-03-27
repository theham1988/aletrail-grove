export default function EventsPage({ festivalStampCount }) {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-festival-border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-festival-muted">Festival Hub</p>
        <h1 className="mt-1 text-2xl font-black text-festival-text">Road In Grove Festival</h1>
        <p className="mt-1 text-sm text-festival-muted">Track your progress and unlock exclusive drops.</p>
      </header>

      <article className="rounded-2xl border border-festival-border bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-festival-muted">Active Trail</p>
        <h2 className="mt-1 text-lg font-extrabold text-festival-text">49 Vendor Challenge</h2>
        <p className="mt-1 text-sm text-festival-muted">
          Collect stamps by scanning each participating vendor QR code.
        </p>
        <p className="mt-3 text-sm font-bold text-festival-primary">{festivalStampCount}/49 collected</p>
      </article>

      <article className="rounded-2xl border border-dashed border-festival-border bg-festival-bg p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-festival-muted">Coming Soon</p>
        <h2 className="mt-1 text-lg font-extrabold text-festival-text">Secret Brewer Afterparty</h2>
        <p className="mt-1 text-sm text-festival-muted">Unlock when you complete all five passport tiers.</p>
      </article>
    </div>
  );
}
