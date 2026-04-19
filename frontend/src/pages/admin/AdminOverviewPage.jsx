import { Link } from "react-router-dom";
import useAdminPanelContext from "./useAdminPanelContext";

const adminLinks = [
  {
    title: "Manage Teams",
    description: "Create, edit, and remove teams.",
    to: "/admin/teams"
  },
  {
    title: "Manage Players",
    description: "Update player role and performance stats.",
    to: "/admin/players"
  },
  {
    title: "Manage Matches",
    description: "Schedule fixtures and clean up match list.",
    to: "/admin/matches"
  },
  {
    title: "Update Live Score",
    description: "Publish real-time score, innings, and commentary.",
    to: "/admin/live-score"
  },
  {
    title: "Media Uploads",
    description: "Upload gallery and hero images.",
    to: "/admin/uploads"
  },
  {
    title: "Live Stream",
    description: "Set or clear the live stream URL.",
    to: "/admin/stream"
  }
];

export default function AdminOverviewPage() {
  const { matches } = useAdminPanelContext();
  const liveMatch = matches.find((match) => match.status === "Live");

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-panel p-5">
        <h2 className="text-3xl font-semibold text-white">Admin Workspace</h2>
        <p className="mt-1 text-sm text-slate-400">
          Pick a section below to manage one part of the platform on its own page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-2xl border border-slate-700 bg-panel p-5 transition hover:-translate-y-1 hover:border-accent"
          >
            <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-panel p-5">
        <h3 className="text-2xl font-semibold text-white">Current Live Match</h3>
        {liveMatch ? (
          <p className="mt-2 text-slate-300">
            {liveMatch.team_a?.name} vs {liveMatch.team_b?.name} ({liveMatch.status})
          </p>
        ) : (
          <p className="mt-2 text-slate-400">No match is live right now.</p>
        )}
      </div>
    </section>
  );
}