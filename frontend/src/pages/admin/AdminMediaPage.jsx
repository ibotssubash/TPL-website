import { useRef, useState } from "react";
import { deleteMediaImage, uploadMediaImages } from "../../services/api";
import useAdminPanelContext from "./useAdminPanelContext";

export default function AdminMediaPage() {
  const { mediaImages, withFeedback } = useAdminPanelContext();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  return (
    <section className="panel space-y-4 border-slate-600/70 shadow-[0_12px_22px_rgba(0,0,0,0.25)]">
      <h2 className="text-3xl font-semibold text-white">Media Uploads</h2>
      <p className="text-sm text-slate-400">
        Upload multiple photos for homepage hero/gallery. New uploads appear to users automatically.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
        className="rounded-lg border border-slate-700 bg-panelSoft px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-red-500"
      />
      <p className="text-xs text-slate-400">
        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "No files selected"}
      </p>
      <button
        type="button"
        onClick={() =>
          withFeedback(async () => {
            if (!selectedFiles.length) {
              throw new Error("Please select one or more images before upload.");
            }
            await uploadMediaImages(selectedFiles);
            setSelectedFiles([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, "Images uploaded.")
        }
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:bg-red-500"
      >
        Upload Images
      </button>

      <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto rounded-xl border border-slate-700 bg-panelSoft p-3 md:grid-cols-3">
        {mediaImages.map((image) => (
          <div key={image.id} className="group overflow-hidden rounded-lg border border-slate-700 bg-slate-950/40">
            <img src={image.full_url} alt={image.original_name} className="h-24 w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-xs text-slate-300">{image.original_name}</p>
              <button
                type="button"
                onClick={() => withFeedback(() => deleteMediaImage(image.id), "Image deleted.")}
                className="mt-2 w-full rounded-md border border-red-700 px-2 py-1 text-xs text-red-300 hover:bg-red-950/40"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {mediaImages.length === 0 ? (
          <p className="col-span-full text-sm text-slate-400">No images uploaded yet.</p>
        ) : null}
      </div>
    </section>
  );
}