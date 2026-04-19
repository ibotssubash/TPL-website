import { useEffect, useMemo, useState } from "react";
import HeroCarousel from "../components/HeroCarousel";
import MatchCard from "../components/MatchCard";
import {
  getHomeData,
  getLeaderboard,
  getLiveStreamConfig,
  listMediaImages
} from "../services/api";

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
  } catch (error) {
    return null;
  }
  return null;
}

export default function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUploadedHero, setShowUploadedHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowUploadedHero(window.scrollY > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      try {
        const [home, leaders, images, stream] = await Promise.all([
          getHomeData(),
          getLeaderboard(5),
          listMediaImages(),
          getLiveStreamConfig()
        ]);

        if (!isMounted) return;
        setHomeData(home);
        setLeaderboard(leaders);
        setGalleryImages(images);
        setLiveStreamUrl(stream?.stream_url || "");
      } catch {
        // Keep existing UI state on transient API failures while polling.
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();
    const timer = setInterval(loadAllData, 12000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const youtubeEmbedUrl = useMemo(() => toYoutubeEmbedUrl(liveStreamUrl), [liveStreamUrl]);

  return (
    <section className="space-y-8">
      <HeroCarousel uploadedImages={galleryImages} useUploadedHero={showUploadedHero} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h2 className="text-2xl font-semibold text-white">Upcoming Matches</h2>
          <div className="mt-4 space-y-4">
            {!loading && homeData?.upcoming_matches?.length === 0 ? (
              <p className="text-slate-400">No upcoming matches scheduled yet.</p>
            ) : null}
            {homeData?.upcoming_matches?.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h2 className="text-2xl font-semibold text-white">Top Performers</h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-slate-700 bg-panelSoft p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-accentMuted">Top Scorer</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {homeData?.top_scorer?.name || "N/A"}{" "}
                  <span className="text-accentMuted">({homeData?.top_scorer?.runs || 0} runs)</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-panelSoft p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-accentMuted">Top Wicket Taker</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {homeData?.top_wicket_taker?.name || "N/A"}{" "}
                  <span className="text-accentMuted">({homeData?.top_wicket_taker?.wickets || 0} wickets)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl font-semibold text-white">Leaderboard</h2>
            <div className="mt-4 space-y-3">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-panelSoft px-4 py-3"
                >
                  <p className="font-semibold text-white">
                    #{index + 1} {player.name}
                  </p>
                  <p className="text-sm text-slate-300">
                    {player.runs} Runs - {player.wickets} Wickets
                  </p>
                </div>
              ))}
              {!loading && leaderboard.length === 0 ? <p className="text-slate-400">No players found.</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-white">Image Gallery</h2>
            {/* <p className="text-sm text-slate-400">Auto-refreshes every 12 seconds when admin uploads new photos.</p> */}
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-accentMuted">
            {galleryImages.length} images available
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-xl border border-slate-700 bg-panelSoft transition duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_16px_28px_rgba(14,20,35,0.55)]"
            >
              <img
                src={image.full_url}
                alt={image.original_name}
                className="h-36 w-full object-cover transition duration-500 ease-out group-hover:scale-125"
              />
            </div>
          ))}
          {!loading && galleryImages.length === 0 ? (
            <p className="col-span-full rounded-xl border border-slate-700 bg-panelSoft p-4 text-slate-400">
              No uploaded photos yet. Admin can upload from the Admin Panel.
            </p>
          ) : null}
        </div>
      </div>

      <div className="panel">
        <h2 className="text-3xl font-semibold text-white">Live Match Stream</h2>
        <p className="mt-1 text-sm text-slate-400">This player updates automatically when admin changes the stream link.</p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-black">
          {youtubeEmbedUrl ? (
            <iframe
              title="TPL Live Stream"
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
    </section>
  );
}
