import { useState } from "react";
import { createPlayer, deletePlayer, updatePlayer } from "../../services/api";
import { PLAYER_ROLES } from "./constants";
import useAdminPanelContext from "./useAdminPanelContext";

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

const initialPlayerForm = {
  name: "",
  role: PLAYER_ROLES[0],
  runs: 0,
  wickets: 0,
  strike_rate: 0,
  team_id: ""
};

export default function AdminPlayersPage() {
  const { teams, players, withFeedback } = useAdminPanelContext();
  const [playerForm, setPlayerForm] = useState(initialPlayerForm);
  const [playerEdit, setPlayerEdit] = useState(null);

  const hasTeams = teams.length > 0;

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <div>
        <h2 className="text-3xl font-semibold text-white">Manage Players</h2>
        <p className="text-sm text-slate-400">Add player stats and assign players to teams.</p>
      </div>

      {!hasTeams ? (
        <p className="rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-sm text-amber-300">
          Add at least one team before creating players.
        </p>
      ) : null}

      <div className="grid gap-2">
        <input
          value={playerForm.name}
          onChange={(event) => setPlayerForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Player name"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={playerForm.role}
            onChange={(event) => setPlayerForm((prev) => ({ ...prev, role: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            {PLAYER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={playerForm.team_id}
            onChange={(event) => setPlayerForm((prev) => ({ ...prev, team_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={playerForm.runs}
            onChange={(event) => setPlayerForm((prev) => ({ ...prev, runs: event.target.value }))}
            placeholder="Runs"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            value={playerForm.wickets}
            onChange={(event) => setPlayerForm((prev) => ({ ...prev, wickets: event.target.value }))}
            placeholder="Wickets"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            step="0.01"
            value={playerForm.strike_rate}
            onChange={(event) => setPlayerForm((prev) => ({ ...prev, strike_rate: event.target.value }))}
            placeholder="SR"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="button"
          disabled={!hasTeams}
          onClick={() =>
            withFeedback(async () => {
              if (!playerForm.name.trim()) {
                throw new Error("Player name is required.");
              }
              if (!playerForm.team_id) {
                throw new Error("Please select a team.");
              }
              await createPlayer({
                name: playerForm.name.trim(),
                role: playerForm.role,
                team_id: Number(playerForm.team_id),
                runs: Number(playerForm.runs),
                wickets: Number(playerForm.wickets),
                strike_rate: Number(playerForm.strike_rate)
              });
              setPlayerForm(initialPlayerForm);
            }, "Player added.")
          }
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add Player
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-panelSoft px-3 py-2">
            <p className="text-sm text-white">
              {player.name} <span className="text-slate-400">({player.team_name || "No Team"})</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlayerEdit(player)}
                className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => withFeedback(() => deletePlayer(player.id), "Player deleted.")}
                className="rounded-md border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950/50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {players.length === 0 ? <p className="text-sm text-slate-400">No players yet.</p> : null}
      </div>

      {playerEdit ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
          <p className="text-sm font-semibold text-slate-300">Editing: {playerEdit.name}</p>
          <div className="mt-2 grid gap-2">
            <input
              value={playerEdit.name}
              onChange={(event) => setPlayerEdit((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={playerEdit.role}
                onChange={(event) => setPlayerEdit((prev) => ({ ...prev, role: event.target.value }))}
                className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
              >
                {PLAYER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={playerEdit.team_id || ""}
                onChange={(event) => setPlayerEdit((prev) => ({ ...prev, team_id: toNumber(event.target.value) }))}
                className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={playerEdit.runs}
                onChange={(event) => setPlayerEdit((prev) => ({ ...prev, runs: Number(event.target.value) }))}
                className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
              />
              <input
                type="number"
                value={playerEdit.wickets}
                onChange={(event) => setPlayerEdit((prev) => ({ ...prev, wickets: Number(event.target.value) }))}
                className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                value={playerEdit.strike_rate}
                onChange={(event) =>
                  setPlayerEdit((prev) => ({ ...prev, strike_rate: Number(event.target.value) }))
                }
                className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  withFeedback(async () => {
                    await updatePlayer(playerEdit.id, {
                      name: playerEdit.name.trim(),
                      role: playerEdit.role,
                      team_id: playerEdit.team_id,
                      runs: playerEdit.runs,
                      wickets: playerEdit.wickets,
                      strike_rate: playerEdit.strike_rate
                    });
                    setPlayerEdit(null);
                  }, "Player updated.")
                }
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setPlayerEdit(null)}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}