import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — By Jonathan Ch" },
      { name: "description", content: "Browse wedding, birthday and corporate event photography by Jonathan Ch." },
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
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Portfolio</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">
          Stories in <span className="text-gradient-brand">light</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A living archive of recent work. Filter by occasion or tap any frame to view full size.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            All ({images.length})
          </FilterChip>
          {activeCategories.map((c) => {
            const count = images.filter((i) => i.category_id === c.id).length;
            return (
              <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
                {c.name} ({count})
              </FilterChip>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-16 text-center text-muted-foreground">
            No images in this category yet.
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {filtered.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setLightbox(idx)}
                className="group relative mb-4 block w-full overflow-hidden rounded-2xl bg-secondary/40 transition"
              >
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Portfolio image"}
                  loading="lazy"
                  className="w-full transition duration-700 group-hover:scale-[1.03]"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-left text-sm opacity-0 transition group-hover:opacity-100">
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute left-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary"
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)); }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary"
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
              <figcaption className="mt-4 text-center text-sm text-muted-foreground">
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
      className={
        "rounded-full px-5 py-2 text-sm font-medium transition " +
        (active
          ? "bg-gradient-brand text-brand-foreground shadow-glow"
          : "border border-border/60 bg-secondary/30 text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
