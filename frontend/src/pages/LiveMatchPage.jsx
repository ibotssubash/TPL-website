import { useEffect, useMemo, useState } from "react";
import { getLiveMatch, getLiveStreamConfig } from "../services/api";

function formatScore(match, inningsTeam) {
  if (!match) return "0/0 (0.0)";
  if (inningsTeam === "A") {
    return `${match.team_a_runs}/${match.team_a_wickets} (${match.team_a_overs})`;
  }
  return `${match.team_b_runs}/${match.team_b_wickets} (${match.team_b_overs})`;
}

function toYoutubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (parsed.pathname.startsWith("/live/")) {
        const videoId = parsed.pathname.split("/").filter(Boolean)[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function LiveMatchPage() {
  const [liveData, setLiveData] = useState({ match: null });
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;
    let isMounted = true;

    const load = async () => {
      try {
        const [liveMatch, streamConfig] = await Promise.all([getLiveMatch(), getLiveStreamConfig()]);
        if (!isMounted) return;
        setLiveData(liveMatch);
        setLiveStreamUrl(streamConfig?.stream_url || "");
      } catch {
        // Keep existing UI state on transient API failures while polling.
      } finally {
        if (isMounted) setLoading(false);
        timer = setTimeout(load, 12000);
      }
    };

    load();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const currentInningsTeam = useMemo(() => {
    if (!liveData.match) return "A";
    return liveData.match.current_innings === 1 ? "A" : "B";
  }, [liveData.match]);
  const youtubeEmbedUrl = useMemo(() => toYoutubeEmbedUrl(liveStreamUrl), [liveStreamUrl]);

  const inningsLabel =
    currentInningsTeam === "A" ? liveData.match?.team_a?.name || "Team A" : liveData.match?.team_b?.name || "Team B";

  return (
    <section className="space-y-6">
      <div className={`panel ${liveData.match ? "border-accent/40" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-bold text-white">Live Match</h1>
          {liveData.match ? (
            <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-red-400">
              Live
            </span>
          ) : null}
        </div>
        {liveData.match ? (
          <>
            <p className="mt-2 text-lg text-slate-300">
              {liveData.match.team_a?.name} vs {liveData.match.team_b?.name}
            </p>
            <p className="text-sm text-slate-400">{liveData.match.venue}</p>
          </>
        ) : (
          <p className="mt-3 text-slate-400">
            {loading
              ? "Loading live score..."
              : "No live scorecard right now. Start a match as Live from Admin Panel to show score updates here."}
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="text-2xl font-semibold text-white">Live Match Stream</h2>
        <p className="mt-1 text-sm text-slate-400">
          Live stream link is synced from Admin Panel and also visible on this page.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-black">
          {youtubeEmbedUrl ? (
            <iframe
              title="TPL Live Stream (Live Match Page)"
              src={youtubeEmbedUrl}
              className="h-[240px] w-full md:h-[460px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : liveStreamUrl ? (
            <video controls className="h-[240px] w-full md:h-[460px]" src={liveStreamUrl}>
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="grid h-[220px] place-content-center p-4 text-center text-slate-400 md:h-[300px]">
              No live stream link set yet. Admin can add one in the Admin Panel.
            </div>
          )}
        </div>
      </div>

      {liveData.match ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="panel">
            <p className="text-xs uppercase tracking-[0.14em] text-accentMuted">Current Innings</p>
            <p className="mt-2 text-2xl font-semibold text-white">{inningsLabel}</p>
            <p className="mt-2 text-3xl font-bold text-white">{formatScore(liveData.match, currentInningsTeam)}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              <p>
                Striker: <span className="text-white">{liveData.striker_name || "N/A"}</span>
              </p>
              <p>
                Non-Striker: <span className="text-white">{liveData.non_striker_name || "N/A"}</span>
              </p>
              <p>
                Bowler: <span className="text-white">{liveData.bowler_name || "N/A"}</span>
              </p>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl font-semibold text-white">Ball-by-Ball Commentary</h2>
            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-2">
              {liveData.match.commentary?.length ? (
                liveData.match.commentary.map((line, index) => (
                  <p key={`${line}-${index}`} className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-slate-400">Commentary not available yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
