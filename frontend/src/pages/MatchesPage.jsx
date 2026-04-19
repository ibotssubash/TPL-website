import { useEffect, useState } from "react";
import MatchCard from "../components/MatchCard";
import { listMatches } from "../services/api";

const tabs = ["Upcoming", "Completed"];

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const statusMap = {
      Upcoming: "Upcoming",
      Completed: "Completed"
    };
    listMatches({ status: statusMap[activeTab] }).then(setMatches);
  }, [activeTab]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Matches</h1>
          <p className="text-slate-400">Track upcoming fixtures and completed results.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-700 bg-panel p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? "bg-accent text-white" : "text-slate-300 hover:bg-panelSoft"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      {matches.length === 0 ? <p className="text-slate-400">No matches available in this tab.</p> : null}
    </section>
  );
}
