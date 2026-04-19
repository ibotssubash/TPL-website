from app.models.match import Match
from app.models.team import Team
from app.schemas.dashboard import PointsTableRow


def _safe_rate(runs: float, overs: float) -> float:
    if overs <= 0:
        return 0.0
    return runs / overs


def build_points_table(teams: list[Team], completed_matches: list[Match]) -> list[PointsTableRow]:
    table_rows: list[PointsTableRow] = []

    for team in teams:
        matches_played = 0
        wins = 0
        losses = 0
        runs_scored = 0.0
        overs_faced = 0.0
        runs_conceded = 0.0
        overs_bowled = 0.0

        for match in completed_matches:
            is_team_a = match.team_a_id == team.id
            is_team_b = match.team_b_id == team.id
            if not is_team_a and not is_team_b:
                continue

            matches_played += 1
            if match.winner_team_id == team.id:
                wins += 1
            elif match.winner_team_id is not None:
                losses += 1

            if is_team_a:
                runs_scored += match.team_a_runs
                overs_faced += match.team_a_overs
                runs_conceded += match.team_b_runs
                overs_bowled += match.team_b_overs
            else:
                runs_scored += match.team_b_runs
                overs_faced += match.team_b_overs
                runs_conceded += match.team_a_runs
                overs_bowled += match.team_a_overs

        nrr = _safe_rate(runs_scored, overs_faced) - _safe_rate(runs_conceded, overs_bowled)
        table_rows.append(
            PointsTableRow(
                team_id=team.id,
                team_name=team.name,
                logo_url=team.logo_url,
                matches_played=matches_played,
                wins=wins,
                losses=losses,
                points=wins * 2,
                net_run_rate=round(nrr, 3),
            )
        )

    return sorted(table_rows, key=lambda row: (row.points, row.net_run_rate), reverse=True)
