import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import pic1 from "../../pics/pic1.jpg";
import pic2 from "../../pics/pic2.jpg";
import pic3 from "../../pics/pic3.jpg";
import pic4 from "../../pics/pic4.jpg";
import pic5 from "../../pics/pic5.jpg";

const defaultSlides = [
  {
    image: pic1,
    title: "Feel The Tournament Pulse",
    subtitle: "Every over matters in Trichy Premier League."
  },
  {
    image: pic2,
    title: "Packed Stadium Nights",
    subtitle: "Follow upcoming fixtures and intense clashes."
  },
  {
    image: pic3,
    title: "Sunset Cricket Battles",
    subtitle: "Track live scores and match momentum in real-time."
  },
  {
    image: pic4,
    title: "Electric Atmosphere",
    subtitle: "From toss to trophy, never miss a moment."
  },
  {
    image: pic5,
    title: "Big Hits, Clean Bowled",
    subtitle: "Discover top performers and leaderboard heroes."
  }
];

const AUTO_SLIDE_MS = 4000;

export default function HeroCarousel({ uploadedImages = [], useUploadedHero = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo(() => {
    if (useUploadedHero && uploadedImages.length > 0) {
      return uploadedImages.map((image, index) => ({
        image: image.full_url,
        title: image.original_name || `Match Moment ${index + 1}`,
        subtitle: "Uploaded by admin - live visual highlights for TPL fans."
      }));
    }
    return defaultSlides;
  }, [uploadedImages, useUploadedHero]);

  const total = slides.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [total, useUploadedHero]);

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % total);
  };

  const previousSlide = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(nextSlide, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const transformStyle = useMemo(
    () => ({ transform: `translateX(-${activeIndex * 100}%)` }),
    [activeIndex]
  );

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-panel shadow-glow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[360px] w-full md:h-[460px]">
        <div className="flex h-full w-full transition-transform duration-700 ease-out" style={transformStyle}>
          {slides.map((slide, index) => (
            <div key={`${slide.title}-${index}`} className="relative h-full w-full flex-shrink-0">
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/25" />
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 md:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accentMuted">
                    {useUploadedHero && uploadedImages.length > 0
                      ? "Live Gallery Mode"
                      : "Cricket - Tamil Nadu"}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold uppercase leading-tight tracking-[0.05em] text-white md:text-6xl">
                    Trichy Premier League
                  </h1>
                  <p className="mt-3 max-w-2xl text-base text-slate-200 md:text-lg">{slide.subtitle}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/matches"
                      className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      View Matches
                    </Link>
                    <Link
                      to="/live-match"
                      className="rounded-full border border-slate-300/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Live Score
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={previousSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 px-3 py-2 text-lg font-bold text-white transition hover:bg-black/60"
        >
          {"<"}
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 px-3 py-2 text-lg font-bold text-white transition hover:bg-black/60"
        >
          {">"}
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
          {slides.map((slide, index) => (
            <button
              key={`${slide.title}-${index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
