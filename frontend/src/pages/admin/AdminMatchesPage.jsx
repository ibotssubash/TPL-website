import { useState } from "react";
import { createMatch, deleteMatch } from "../../services/api";
import { MATCH_STATUSES } from "./constants";
import useAdminPanelContext from "./useAdminPanelContext";

const initialMatchForm = {
  team_a_id: "",
  team_b_id: "",
  date_time: "",
  venue: "",
  status: "Upcoming"
};

export default function AdminMatchesPage() {
  const { teams, matches, withFeedback } = useAdminPanelContext();
  const [matchForm, setMatchForm] = useState(initialMatchForm);

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <div>
        <h2 className="text-3xl font-semibold text-white">Manage Matches</h2>
        <p className="text-sm text-slate-400">Schedule fixtures and set initial match status.</p>
      </div>

      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={matchForm.team_a_id}
            onChange={(event) => setMatchForm((prev) => ({ ...prev, team_a_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Team A</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <select
            value={matchForm.team_b_id}
            onChange={(event) => setMatchForm((prev) => ({ ...prev, team_b_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Team B</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <input
          type="datetime-local"
          value={matchForm.date_time}
          onChange={(event) => setMatchForm((prev) => ({ ...prev, date_time: event.target.value }))}
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <input
          value={matchForm.venue}
          onChange={(event) => setMatchForm((prev) => ({ ...prev, venue: event.target.value }))}
          placeholder="Venue"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <select
          value={matchForm.status}
          onChange={(event) => setMatchForm((prev) => ({ ...prev, status: event.target.value }))}
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        >
          {MATCH_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            withFeedback(async () => {
              if (!matchForm.team_a_id || !matchForm.team_b_id) {
                throw new Error("Please select both teams.");
              }
              if (matchForm.team_a_id === matchForm.team_b_id) {
                throw new Error("Team A and Team B must be different.");
              }
              if (!matchForm.date_time) {
                throw new Error("Please choose match date and time.");
              }
              if (!matchForm.venue.trim()) {
                throw new Error("Venue is required.");
              }

              await createMatch({
                team_a_id: Number(matchForm.team_a_id),
                team_b_id: Number(matchForm.team_b_id),
                date_time: new Date(matchForm.date_time).toISOString(),
                venue: matchForm.venue.trim(),
                status: matchForm.status
              });
              setMatchForm(initialMatchForm);
            }, "Match created.")
          }
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500"
        >
          Create Match
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-panelSoft px-3 py-2">
            <p className="text-sm text-white">
              {match.team_a?.name} vs {match.team_b?.name} ({match.status})
            </p>
            <button
              type="button"
              onClick={() => withFeedback(() => deleteMatch(match.id), "Match deleted.")}
              className="rounded-md border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950/50"
            >
              Delete
            </button>
          </div>
        ))}
        {matches.length === 0 ? <p className="text-sm text-slate-400">No matches scheduled.</p> : null}
      </div>
    </section>
  );
}