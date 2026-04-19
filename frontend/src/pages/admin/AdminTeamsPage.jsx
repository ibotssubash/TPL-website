import { useState } from "react";
import { createTeam, deleteTeam, updateTeam } from "../../services/api";
import useAdminPanelContext from "./useAdminPanelContext";

const initialTeamForm = {
  name: "",
  captain: "",
  logo_url: ""
};

export default function AdminTeamsPage() {
  const { teams, withFeedback } = useAdminPanelContext();
  const [teamForm, setTeamForm] = useState(initialTeamForm);
  const [teamEdit, setTeamEdit] = useState(null);

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <div>
        <h2 className="text-3xl font-semibold text-white">Manage Teams</h2>
        <p className="text-sm text-slate-400">Create teams and update captain/logo details.</p>
      </div>

      <div className="grid gap-2">
        <input
          value={teamForm.name}
          onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Team name"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <input
          value={teamForm.captain}
          onChange={(event) => setTeamForm((prev) => ({ ...prev, captain: event.target.value }))}
          placeholder="Captain"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <input
          value={teamForm.logo_url}
          onChange={(event) => setTeamForm((prev) => ({ ...prev, logo_url: event.target.value }))}
          placeholder="Logo URL (optional)"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() =>
            withFeedback(async () => {
              if (!teamForm.name.trim() || !teamForm.captain.trim()) {
                throw new Error("Team name and captain are required.");
              }
              await createTeam({
                name: teamForm.name.trim(),
                captain: teamForm.captain.trim(),
                logo_url: teamForm.logo_url.trim()
              });
              setTeamForm(initialTeamForm);
            }, "Team added.")
          }
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500"
        >
          Add Team
        </button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {teams.map((team) => (
          <div key={team.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-panelSoft px-3 py-2">
            <p className="font-semibold text-white">{team.name}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTeamEdit(team)}
                className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => withFeedback(() => deleteTeam(team.id), "Team deleted.")}
                className="rounded-md border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950/50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {teams.length === 0 ? <p className="text-sm text-slate-400">No teams yet.</p> : null}
      </div>

      {teamEdit ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
          <p className="text-sm font-semibold text-slate-300">Editing: {teamEdit.name}</p>
          <div className="mt-2 grid gap-2">
            <input
              value={teamEdit.name}
              onChange={(event) => setTeamEdit((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
            <input
              value={teamEdit.captain}
              onChange={(event) => setTeamEdit((prev) => ({ ...prev, captain: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
            <input
              value={teamEdit.logo_url || ""}
              onChange={(event) => setTeamEdit((prev) => ({ ...prev, logo_url: event.target.value }))}
              className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  withFeedback(async () => {
                    await updateTeam(teamEdit.id, {
                      name: teamEdit.name.trim(),
                      captain: teamEdit.captain.trim(),
                      logo_url: (teamEdit.logo_url || "").trim()
                    });
                    setTeamEdit(null);
                  }, "Team updated.")
                }
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setTeamEdit(null)}
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