const languageOptions = [
  { value: "en", label: "English" },
  { value: "th", label: "ภาษาไทย" },
  { value: "ru", label: "Русский" },
];

export default function ProfilePage({
  profile,
  legacyStamps,
  festivalStamps,
  language,
  onLanguageChange,
  onLogout,
  onDeleteAccount,
}) {
  const shortId = profile?.userId?.slice(0, 8).toUpperCase() || "LOCAL";

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl bg-festival-primary shadow-sm">
        <div className="p-6 text-center text-festival-bg">
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-festival-secondary bg-white">
            {profile?.pictureUrl ? (
              <img src={profile.pictureUrl} alt={profile.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-black text-festival-primary">
                {profile?.displayName?.slice(0, 1) || "U"}
              </div>
            )}
          </div>
          <h1 className="text-xl font-black">{profile?.displayName || "Explorer"}</h1>
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-100">MEMBER ID: PKT-{shortId}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-festival-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-festival-primary">Stamp Overview</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-festival-bg p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-festival-muted">Legacy Stamps</p>
            <p className="mt-1 text-2xl font-black text-festival-primary">{legacyStamps.length}</p>
          </div>
          <div className="rounded-xl bg-festival-bg p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-festival-muted">Festival Stamps</p>
            <p className="mt-1 text-2xl font-black text-festival-primary">{festivalStamps.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-festival-border bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-bold text-festival-text">Language</label>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="w-full rounded-xl border border-festival-border bg-festival-bg px-3 py-2 text-sm font-semibold text-festival-text outline-none"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border-2 border-festival-primary px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-festival-primary"
        >
          Log Out
        </button>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="w-full rounded-xl border-2 border-red-500 px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-red-500"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
