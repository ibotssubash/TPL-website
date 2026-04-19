import { Link } from "react-router-dom";

export default function TeamCard({ team }) {
  return (
    <Link
      to={`/players?teamId=${team.id}`}
      className="group rounded-2xl border border-slate-700/70 bg-panel p-5 transition hover:-translate-y-1 hover:border-accent/70 hover:bg-panelSoft"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{team.name}</h3>
          <p className="mt-2 text-sm text-slate-300">Captain: {team.captain}</p>
        </div>
        {team.logo_url ? (
          <img
            src={team.logo_url}
            alt={`${team.name} logo`}
            className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 place-content-center rounded-xl border border-slate-700 text-xs text-slate-400">
            Logo
          </div>
        )}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.14em] text-accentMuted group-hover:text-amber-300">
        View Players
      </p>
    </Link>
  );
}
