import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — By Jonathan Ch" },
      { name: "description", content: "An editorial archive of wedding, event, portrait and commercial photography by Jonathan Ch." },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { data: catsRes } = useQuery({ queryKey: ["cats"], queryFn: () => api.listCategories() });
  const { data: imgRes } = useQuery({ queryKey: ["images"], queryFn: () => api.listImages() });
  const rawCategories = catsRes?.data ?? [];
  const rawImages = imgRes?.data ?? [];

  const activeCategories = useMemo(() => rawCategories.filter((c) => c.is_active), [rawCategories]);
  const activeCategoryIds = useMemo(() => new Set(activeCategories.map((c) => c.id)), [activeCategories]);
  const images = useMemo(
    () => rawImages.filter((i) => i.is_active && activeCategoryIds.has(i.category_id)),
    [rawImages, activeCategoryIds],
  );

  const [active, setActive] = useState<number | "all">("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? images : images.filter((i) => i.category_id === active)),
    [images, active],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filtered.length]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 pt-20 lg:px-10 lg:pt-28">
        <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Portfolio</p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
          A living archive of <span className="italic text-gold">light, love</span> and quiet detail.
        </h1>
        <p className="mt-6 max-w-xl text-foreground/70">
          Filter by occasion, or tap any frame to view full size.
        </p>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-y border-border/60 py-5">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            All <span className="ml-1 text-muted-foreground">({images.length})</span>
          </FilterChip>
          {activeCategories.map((c) => {
            const count = images.filter((i) => i.category_id === c.id).length;
            return (
              <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
                {c.name} <span className="ml-1 text-muted-foreground">({count})</span>
              </FilterChip>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32 pt-12 lg:px-10">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-16 text-center text-muted-foreground">
            No images in this category yet.
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filtered.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setLightbox(idx)}
                className="group relative mb-5 block w-full overflow-hidden rounded-2xl bg-secondary"
              >
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Portfolio image"}
                  loading="lazy"
                  className="w-full transition duration-[1200ms] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-left font-display text-lg text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {img.caption}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)); }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? null : (i + 1) % filtered.length)); }}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <figure className="max-h-[88vh] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].caption ?? ""}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            {filtered[lightbox].caption && (
              <figcaption className="mt-4 text-center text-sm text-white/70">
                {filtered[lightbox].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </SiteLayout>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] uppercase tracking-luxury transition",
        active ? "text-gold" : "text-foreground/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
