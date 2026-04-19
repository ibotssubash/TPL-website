import { updateLiveStreamConfig } from "../../services/api";
import useAdminPanelContext from "./useAdminPanelContext";

export default function AdminStreamPage() {
  const { liveVideoLink, setLiveVideoLink, withFeedback } = useAdminPanelContext();

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <h2 className="text-3xl font-semibold text-white">Live Video Stream</h2>
      <p className="text-sm text-slate-400">
        Add a YouTube Live URL or any stream URL. Users can watch this on homepage and live match page.
      </p>

      <input
        type="url"
        value={liveVideoLink}
        onChange={(event) => setLiveVideoLink(event.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            withFeedback(async () => {
              await updateLiveStreamConfig({ stream_url: liveVideoLink || null });
            }, "Stream link saved.")
          }
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500"
        >
          Save Stream Link
        </button>
        <button
          type="button"
          onClick={() =>
            withFeedback(async () => {
              await updateLiveStreamConfig({ stream_url: null });
            }, "Stream link cleared.")
          }
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Clear
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-panelSoft p-3 text-sm text-slate-300">
        Current link: {liveVideoLink || "No live stream configured."}
      </div>
    </section>
  );
}