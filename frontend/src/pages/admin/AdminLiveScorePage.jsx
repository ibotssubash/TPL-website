import { useMemo, useState } from "react";
import { updateMatchScore } from "../../services/api";
import { MATCH_STATUSES } from "./constants";
import useAdminPanelContext from "./useAdminPanelContext";

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function toOversAfterBall(oversValue) {
  const numeric = Number(oversValue);
  const safe = Number.isNaN(numeric) || numeric < 0 ? 0 : numeric;
  const wholeOvers = Math.trunc(safe);
  const balls = Math.max(0, Math.round((safe - wholeOvers) * 10));
  const totalBalls = wholeOvers * 6 + balls + 1;
  const nextOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
  return nextOvers.toFixed(1);
}

function emptyScoreForm() {
  return {
    match_id: "",
    status: "Live",
    winner_team_id: "",
    team_a_runs: "",
    team_a_wickets: "",
    team_a_overs: "",
    team_b_runs: "",
    team_b_wickets: "",
    team_b_overs: "",
    current_innings: "1",
    striker_id: "",
    non_striker_id: "",
    bowler_id: "",
    commentary_text: ""
  };
}

export default function AdminLiveScorePage() {
  const { matches, teams, players, withFeedback } = useAdminPanelContext();
  const [scoreForm, setScoreForm] = useState(emptyScoreForm);
  const [appendToExisting, setAppendToExisting] = useState(true);
  const [quickCommentary, setQuickCommentary] = useState("");

  const selectedMatch = useMemo(
    () => matches.find((match) => String(match.id) === scoreForm.match_id),
    [matches, scoreForm.match_id]
  );
  const canEditScore = Boolean(scoreForm.match_id);

  const teamAPlayers = useMemo(
    () =>
      selectedMatch
        ? players.filter((player) => Number(player.team_id) === Number(selectedMatch.team_a_id))
        : [],
    [players, selectedMatch]
  );

  const teamBPlayers = useMemo(
    () =>
      selectedMatch
        ? players.filter((player) => Number(player.team_id) === Number(selectedMatch.team_b_id))
        : [],
    [players, selectedMatch]
  );
  const winnerOptions = useMemo(() => {
    if (!selectedMatch) return teams;
    return teams.filter(
      (team) =>
        Number(team.id) === Number(selectedMatch.team_a_id) ||
        Number(team.id) === Number(selectedMatch.team_b_id)
    );
  }, [selectedMatch, teams]);

  const battingTeamPlayers = scoreForm.current_innings === "1" ? teamAPlayers : teamBPlayers;
  const bowlingTeamPlayers = scoreForm.current_innings === "1" ? teamBPlayers : teamAPlayers;

  const loadMatchState = (matchId) => {
    if (!matchId) {
      setScoreForm(emptyScoreForm());
      return;
    }

    const match = matches.find((item) => String(item.id) === String(matchId));
    if (!match) return;

    setScoreForm({
      match_id: String(match.id),
      status: match.status || "Live",
      winner_team_id: match.winner_team_id ? String(match.winner_team_id) : "",
      team_a_runs: String(match.team_a_runs ?? ""),
      team_a_wickets: String(match.team_a_wickets ?? ""),
      team_a_overs: String(match.team_a_overs ?? ""),
      team_b_runs: String(match.team_b_runs ?? ""),
      team_b_wickets: String(match.team_b_wickets ?? ""),
      team_b_overs: String(match.team_b_overs ?? ""),
      current_innings: String(match.current_innings ?? 1),
      striker_id: match.striker_id ? String(match.striker_id) : "",
      non_striker_id: match.non_striker_id ? String(match.non_striker_id) : "",
      bowler_id: match.bowler_id ? String(match.bowler_id) : "",
      commentary_text: ""
    });
    setQuickCommentary("");
  };

  const applyQuickBallUpdate = ({ runs = 0, wicket = false, label = "" }) => {
    setScoreForm((prev) => {
      const battingPrefix = prev.current_innings === "1" ? "team_a" : "team_b";
      const runsKey = `${battingPrefix}_runs`;
      const wicketsKey = `${battingPrefix}_wickets`;
      const oversKey = `${battingPrefix}_overs`;

      const currentRuns = Number(prev[runsKey] || 0);
      const currentWickets = Number(prev[wicketsKey] || 0);
      const nextCommentary = label
        ? [prev.commentary_text, label].filter(Boolean).join("\n")
        : prev.commentary_text;

      return {
        ...prev,
        [runsKey]: String(currentRuns + runs),
        [wicketsKey]: String(currentWickets + (wicket ? 1 : 0)),
        [oversKey]: toOversAfterBall(prev[oversKey]),
        commentary_text: nextCommentary
      };
    });
  };

  const addQuickCommentaryLine = () => {
    if (!quickCommentary.trim()) return;
    setScoreForm((prev) => ({
      ...prev,
      commentary_text: [prev.commentary_text, quickCommentary.trim()].filter(Boolean).join("\n")
    }));
    setQuickCommentary("");
  };

  const selectedMatchSummary = selectedMatch
    ? `${selectedMatch.team_a?.name || "Team A"} ${selectedMatch.team_a_runs}/${selectedMatch.team_a_wickets} (${selectedMatch.team_a_overs})  |  ${selectedMatch.team_b?.name || "Team B"} ${selectedMatch.team_b_runs}/${selectedMatch.team_b_wickets} (${selectedMatch.team_b_overs})`
    : "Select a match to load and update score values.";

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <div>
        <h2 className="text-3xl font-semibold text-white">Update Live Score</h2>
        <p className="text-sm text-slate-400">
          Load an existing match, update score quickly, and append new commentary safely.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-panelSoft p-3 text-sm text-slate-300">{selectedMatchSummary}</div>

      <div className="grid gap-2">
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <select
            value={scoreForm.match_id}
            onChange={(event) => loadMatchState(event.target.value)}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Select Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.id} {match.team_a?.name} vs {match.team_b?.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadMatchState(scoreForm.match_id)}
            disabled={!scoreForm.match_id}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reload Match Data
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={scoreForm.status}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            {MATCH_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={scoreForm.winner_team_id}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, winner_team_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Winner (optional)</option>
            {winnerOptions.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={scoreForm.team_a_runs}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_a_runs: event.target.value }))}
            placeholder="A Runs"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            value={scoreForm.team_a_wickets}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_a_wickets: event.target.value }))}
            placeholder="A Wkts"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            step="0.1"
            value={scoreForm.team_a_overs}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_a_overs: event.target.value }))}
            placeholder="A Overs"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={scoreForm.team_b_runs}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_b_runs: event.target.value }))}
            placeholder="B Runs"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            value={scoreForm.team_b_wickets}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_b_wickets: event.target.value }))}
            placeholder="B Wkts"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          <input
            type="number"
            step="0.1"
            value={scoreForm.team_b_overs}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, team_b_overs: event.target.value }))}
            placeholder="B Overs"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={scoreForm.current_innings}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, current_innings: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="1">Innings 1</option>
            <option value="2">Innings 2</option>
          </select>
          <div className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm text-slate-300">
            Batting: {scoreForm.current_innings === "1" ? selectedMatch?.team_a?.name || "Team A" : selectedMatch?.team_b?.name || "Team B"}
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <select
            value={scoreForm.striker_id}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, striker_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Striker</option>
            {battingTeamPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <select
            value={scoreForm.non_striker_id}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, non_striker_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Non-Striker</option>
            {battingTeamPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <select
            value={scoreForm.bowler_id}
            onChange={(event) => setScoreForm((prev) => ({ ...prev, bowler_id: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white focus:border-accent focus:outline-none"
          >
            <option value="">Bowler</option>
            {bowlingTeamPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-slate-700 bg-panelSoft p-3">
          <p className="text-sm font-semibold text-white">Quick Ball Updates</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyQuickBallUpdate({ runs: 0, label: "Dot Ball" })}
              disabled={!canEditScore}
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Dot
            </button>
            <button
              type="button"
              onClick={() => applyQuickBallUpdate({ runs: 1, label: "Single" })}
              disabled={!canEditScore}
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => applyQuickBallUpdate({ runs: 4, label: "FOUR" })}
              disabled={!canEditScore}
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +4
            </button>
            <button
              type="button"
              onClick={() => applyQuickBallUpdate({ runs: 6, label: "SIX" })}
              disabled={!canEditScore}
              className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +6
            </button>
            <button
              type="button"
              onClick={() => applyQuickBallUpdate({ wicket: true, label: "WICKET" })}
              disabled={!canEditScore}
              className="rounded-lg border border-red-700 px-3 py-1 text-xs text-red-300 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Wicket
            </button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={quickCommentary}
            onChange={(event) => setQuickCommentary(event.target.value)}
            placeholder="Quick commentary line"
            className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={addQuickCommentaryLine}
            disabled={!canEditScore}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Line
          </button>
        </div>

        <textarea
          rows={5}
          value={scoreForm.commentary_text}
          onChange={(event) => setScoreForm((prev) => ({ ...prev, commentary_text: event.target.value }))}
          placeholder="Commentary lines (one per line)"
          className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={appendToExisting}
            onChange={(event) => setAppendToExisting(event.target.checked)}
            className="h-4 w-4"
          />
          Append new commentary to existing lines (recommended)
        </label>

        <button
          type="button"
          disabled={!canEditScore}
          onClick={() =>
            withFeedback(async () => {
              if (!scoreForm.match_id) {
                throw new Error("Please select a match before updating scores.");
              }

              if (scoreForm.striker_id && scoreForm.non_striker_id && scoreForm.striker_id === scoreForm.non_striker_id) {
                throw new Error("Striker and non-striker must be different players.");
              }

              if (scoreForm.status === "Completed" && !scoreForm.winner_team_id) {
                throw new Error("Select winner team when status is Completed.");
              }

              const payload = {
                status: scoreForm.status,
                winner_team_id: toNumber(scoreForm.winner_team_id),
                team_a_runs: toNumber(scoreForm.team_a_runs),
                team_a_wickets: toNumber(scoreForm.team_a_wickets),
                team_a_overs: toNumber(scoreForm.team_a_overs),
                team_b_runs: toNumber(scoreForm.team_b_runs),
                team_b_wickets: toNumber(scoreForm.team_b_wickets),
                team_b_overs: toNumber(scoreForm.team_b_overs),
                current_innings: toNumber(scoreForm.current_innings),
                striker_id: toNumber(scoreForm.striker_id),
                non_striker_id: toNumber(scoreForm.non_striker_id),
                bowler_id: toNumber(scoreForm.bowler_id)
              };

              const freshMatch = matches.find((match) => String(match.id) === scoreForm.match_id);
              const newLines = scoreForm.commentary_text
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

              if (newLines.length > 0) {
                payload.commentary = appendToExisting
                  ? [...(freshMatch?.commentary || []), ...newLines]
                  : newLines;
              }

              await updateMatchScore(Number(scoreForm.match_id), payload);
              setScoreForm((prev) => ({ ...prev, commentary_text: "" }));
              setQuickCommentary("");
            }, "Live score updated.")
          }
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Update Score
        </button>
      </div>
    </section>
  );
}
