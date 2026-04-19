import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listPlayers, listTeams } from "../services/api";

export default function PlayersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const teamId = searchParams.get("teamId") || "";

  useEffect(() => {
    listTeams().then(setTeams);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const params = {
        team_id: teamId || undefined,
        search: search || undefined,
        limit: 100
      };
      const data = await listPlayers(params);
      setPlayers(data);
    }, 250);
    return () => clearTimeout(timer);
  }, [teamId, search]);

  const selectedTeamName = useMemo(() => {
    const team = teams.find((item) => String(item.id) === String(teamId));
    return team?.name || "All Teams";
  }, [teams, teamId]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Players</h1>
        <p className="text-slate-400">Showing: {selectedTeamName}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={teamId}
          onChange={(event) => {
            const nextParams = new URLSearchParams(searchParams);
            if (event.target.value) nextParams.set("teamId", event.target.value);
            else nextParams.delete("teamId");
            setSearchParams(nextParams);
          }}
          className="rounded-xl border border-slate-700 bg-panel px-4 py-2 text-white focus:border-accent focus:outline-none"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search players..."
          className="rounded-xl border border-slate-700 bg-panel px-4 py-2 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none md:col-span-2"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-panel text-left">
            <thead className="bg-panelSoft text-sm uppercase tracking-[0.1em] text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Runs</th>
                <th className="px-4 py-3">Wickets</th>
                <th className="px-4 py-3">Strike Rate</th>
                <th className="px-4 py-3">Team</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-t border-slate-800 text-sm text-slate-200">
                  <td className="px-4 py-3 font-semibold text-white">{player.name}</td>
                  <td className="px-4 py-3">{player.role}</td>
                  <td className="px-4 py-3">{player.runs}</td>
                  <td className="px-4 py-3">{player.wickets}</td>
                  <td className="px-4 py-3">{player.strike_rate}</td>
                  <td className="px-4 py-3">{player.team_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {players.length === 0 ? <p className="text-slate-400">No players found.</p> : null}
    </section>
  );
}
