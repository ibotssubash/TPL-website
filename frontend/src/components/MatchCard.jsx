function formatDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function statusClass(status) {
  if (status === "Live") return "bg-red-600/20 text-red-400 border-red-500/40";
  if (status === "Completed") return "bg-emerald-600/20 text-emerald-400 border-emerald-500/40";
  return "bg-amber-600/20 text-amber-300 border-amber-500/40";
}

export default function MatchCard({ match }) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-panel p-5 transition hover:border-accent/60 hover:bg-panelSoft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-bold text-white">
          {match.team_a?.name || "Team A"} vs {match.team_b?.name || "Team B"}
        </p>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(match.status)}`}>
          {match.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-300">{formatDate(match.date_time)}</p>
      <p className="mt-1 text-sm text-slate-400">{match.venue}</p>
    </article>
  );
}
