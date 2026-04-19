import { useEffect, useState } from "react";
import { listMediaImages } from "../services/api";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      try {
        const rows = await listMediaImages();
        if (!isMounted) return;
        setImages(rows);
      } catch {
        // Keep existing images if refresh fails.
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadImages();
    const timer = setInterval(loadImages, 12000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    if (images.length === 0) {
      setActiveIndex(null);
      return;
    }
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, images]);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return null;
          return (current + 1) % images.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return null;
          return (current - 1 + images.length) % images.length;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  const modalOpen = activeIndex !== null;

  const goToNext = () => {
    if (!images.length) return;
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % images.length;
    });
  };

  const goToPrevious = () => {
    if (!images.length) return;
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current - 1 + images.length) % images.length;
    });
  };

  const handleTouchStart = (event) => {
    setIsDragging(true);
    setTouchStartX(event.touches[0].clientX);
    setTouchOffset(0);
  };

  const handleTouchMove = (event) => {
    if (!isDragging) return;
    const nextOffset = event.touches[0].clientX - touchStartX;
    setTouchOffset(nextOffset);
  };

  const handleTouchEnd = () => {
    const threshold = 60;
    if (touchOffset <= -threshold) {
      goToNext();
    } else if (touchOffset >= threshold) {
      goToPrevious();
    }
    setIsDragging(false);
    setTouchOffset(0);
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group overflow-hidden rounded-xl border border-slate-700 bg-panelSoft text-left transition duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_16px_28px_rgba(14,20,35,0.55)]"
          >
            <img
              src={image.full_url}
              alt={`Gallery image ${index + 1}`}
              className="h-52 w-full object-cover transition duration-500 ease-out group-hover:scale-125"
            />
          </button>
        ))}
      </div>

      {!loading && images.length === 0 ? (
        <p className="rounded-xl border border-slate-700 bg-panel p-4 text-slate-400">
          No uploaded images yet. Add images from the Admin Panel.
        </p>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/90 p-3 md:p-6">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-full border border-slate-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-700 bg-black">
              <div
                className={`flex h-full ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
                style={{
                  transform: `translateX(calc(-${activeIndex * 100}% + ${touchOffset}px))`
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {images.map((image, index) => (
                  <div key={image.id} className="h-full min-w-full bg-black">
                    <img
                      src={image.full_url}
                      alt={`Gallery slide ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 px-4 py-3 text-lg font-bold text-white transition hover:bg-black/70 md:left-4"
                    aria-label="Previous image"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-black/45 px-4 py-3 text-lg font-bold text-white transition hover:bg-black/70 md:right-4"
                    aria-label="Next image"
                  >
                    {">"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
