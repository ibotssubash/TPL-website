import { useEffect, useState } from "react";
import { getPointsTable } from "../services/api";

export default function PointsTablePage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getPointsTable().then(setRows);
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Points Table</h1>
        <p className="text-slate-400">Team standings based on completed matches.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-panel text-left">
            <thead className="bg-panelSoft text-xs uppercase tracking-[0.12em] text-slate-300">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Played</th>
                <th className="px-4 py-3">Wins</th>
                <th className="px-4 py-3">Losses</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Net Run Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.team_id} className="border-t border-slate-800 text-sm text-slate-200">
                  <td className="px-4 py-3 font-semibold text-white">{row.team_name}</td>
                  <td className="px-4 py-3">{row.matches_played}</td>
                  <td className="px-4 py-3">{row.wins}</td>
                  <td className="px-4 py-3">{row.losses}</td>
                  <td className="px-4 py-3 font-semibold text-accentMuted">{row.points}</td>
                  <td className="px-4 py-3">{row.net_run_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {rows.length === 0 ? <p className="text-slate-400">No points data available yet.</p> : null}
    </section>
  );
}
