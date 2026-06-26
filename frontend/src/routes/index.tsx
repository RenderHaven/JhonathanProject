import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowDown, ArrowUpRight, Camera, Quote, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "By Jonathan Ch — Capturing Moments That Last Forever" },
      {
        name: "description",
        content:
          "Luxury wedding, event and portrait photography by Jonathan Ch. Editorial storytelling for moments that deserve to be remembered.",
      },
      { property: "og:title", content: "By Jonathan Ch — Photography" },
      {
        property: "og:description",
        content: "Cinematic photography for weddings, events and portraits.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: imagesRes } = useQuery({ queryKey: ["images"], queryFn: () => api.listImages() });
  const { data: catsRes } = useQuery({ queryKey: ["cats"], queryFn: () => api.listCategories() });
  const { data: servicesRes } = useQuery({ queryKey: ["services"], queryFn: () => api.listServices() });

  const rawImages = imagesRes?.data ?? [];
  const activeCategoryIds = useMemo(
    () => new Set((catsRes?.data ?? []).filter((c) => c.is_active).map((c) => c.id)),
    [catsRes?.data],
  );
  const images = useMemo(
    () => rawImages.filter((i) => i.is_active && activeCategoryIds.has(i.category_id)),
    [rawImages, activeCategoryIds],
  );
  const services = (servicesRes?.data ?? []).filter((s) => s.is_active).slice(0, 4);

  const hero = images[0]?.image_url
    ?? "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=80";
  const story = images[1]?.image_url
    ?? "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1600&q=80";
  const featured = images.slice(0, 6);

  return (
    <SiteLayout transparentHeader>
      {/* HERO */}
      <section className="relative h-[100vh] min-h-[640px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Cinematic wedding photography"
            className="h-full w-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 pt-32 lg:px-10">
          <div className="max-w-4xl animate-fade-up text-white">
            <p className="text-[11px] uppercase tracking-luxury text-white/70">
              Wedding · Events · Portraits · Commercial
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] sm:text-6xl md:text-7xl lg:text-[88px]">
              Capturing moments that
              <br />
              last <span className="italic text-[oklch(0.86_0.08_80)]">forever.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 md:text-lg">
              An editorial photography studio crafting timeless imagery for life's most meaningful days.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[11px] font-medium uppercase tracking-luxury text-foreground transition hover:bg-gold"
              >
                View portfolio
                <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 rounded-full border border-white/40 px-7 py-3.5 text-[11px] font-medium uppercase tracking-luxury text-white backdrop-blur-sm transition hover:border-gold hover:text-gold"
              >
                Book a session
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70">
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* INTRO STATEMENT */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center lg:px-10 lg:py-40">
        <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">— A Photography Studio</p>
        <h2 className="mt-8 font-display text-3xl leading-[1.2] md:text-5xl lg:text-[56px]">
          We photograph the quiet, in-between
          moments — the ones you never want to forget.
          <span className="italic text-gold"> Held still, frame by frame.</span>
        </h2>
      </section>

      {/* FEATURED GALLERY (editorial split) */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <div className="flex items-end justify-between border-b border-border/60 pb-6">
          <div>
            <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Selected Work</p>
            <h3 className="mt-3 font-display text-4xl md:text-5xl">Recent frames</h3>
          </div>
          <Link to="/portfolio" className="hidden text-[11px] uppercase tracking-luxury text-muted-foreground hover:text-gold md:inline">
            View all →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-12 gap-4 md:gap-6">
          {featured.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl bg-secondary ${
                  i === 0 ? "col-span-12 aspect-[16/10] md:col-span-8 md:row-span-2" :
                  i === 1 ? "col-span-6 aspect-[4/5] md:col-span-4" :
                  i === 2 ? "col-span-6 aspect-[4/5] md:col-span-4" :
                  "col-span-6 aspect-square md:col-span-4"
                }`}
              />
            ))}
          {featured.map((img, i) => {
            const cls =
              i === 0 ? "col-span-12 aspect-[16/10] md:col-span-8 md:row-span-2 md:aspect-auto md:h-[640px]" :
              i === 1 ? "col-span-6 aspect-[4/5] md:col-span-4 md:h-[310px]" :
              i === 2 ? "col-span-6 aspect-[4/5] md:col-span-4 md:h-[310px]" :
              "col-span-6 aspect-square md:col-span-4 md:h-[360px]";
            return (
              <Link
                key={img.id}
                to="/portfolio"
                className={`group relative overflow-hidden rounded-2xl bg-secondary ${cls}`}
              >
                <img
                  src={img.image_url}
                  alt={img.caption ?? "Featured frame"}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                {img.caption && (
                  <span className="absolute bottom-6 left-6 font-display text-xl text-white opacity-0 transition delay-100 duration-500 group-hover:opacity-100">
                    {img.caption}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ABOUT / STORY SPLIT */}
      <section className="border-y border-border/60 bg-[oklch(0.96_0.006_80)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32 lg:px-10 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:aspect-[3/4]">
            <img src={story} alt="Behind the lens" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">About the Studio</p>
            <h2 className="mt-6 font-display text-4xl leading-[1.1] md:text-5xl">
              A cinematic eye.
              <br />
              <span className="italic text-gold">A calm presence.</span>
            </h2>
            <p className="mt-6 text-base text-foreground/80 md:text-lg">
              For over a decade I've photographed weddings, milestone celebrations and stories for some of
              the most thoughtful brands. My work is rooted in honest emotion, refined composition and
              hand-graded color — heirloom images you'll want to print, frame and pass on.
            </p>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-10">
              {[
                { v: "12+", l: "Years experience" },
                { v: "240", l: "Events covered" },
                { v: "180", l: "Happy clients" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-4xl text-foreground md:text-5xl">{s.v}</dt>
                  <dd className="mt-2 text-[10px] uppercase tracking-luxury text-muted-foreground">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Services</p>
            <h2 className="mt-6 font-display text-4xl leading-[1.1] md:text-5xl">
              Thoughtfully crafted <span className="italic text-gold">packages.</span>
            </h2>
            <p className="mt-6 max-w-md text-foreground/70">
              From intimate ceremonies to multi-day celebrations, each engagement is bespoke,
              unhurried and built around your story.
            </p>
            <Link
              to="/services"
              className="mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1 text-[11px] uppercase tracking-luxury hover:border-gold hover:text-gold"
            >
              Explore all packages →
            </Link>
          </div>

          <div className="grid gap-4 md:col-span-7 md:grid-cols-2">
            {(services.length ? services : Array.from({ length: 4 })).slice(0, 4).map((s: any, i) => (
              <div
                key={s?.id ?? i}
                className="group rounded-2xl border border-border/60 bg-card p-8 transition hover:border-gold hover:shadow-elegant"
              >
                <Camera className="h-5 w-5 text-gold" />
                <h3 className="mt-6 font-display text-2xl">{s?.title ?? "Coming soon"}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-foreground/70">
                  {s?.description ?? "Bespoke photography crafted to your story."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border/60 bg-[oklch(0.96_0.006_80)]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
          <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Kind Words</p>
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.1] md:text-5xl">
            "Jonathan disappeared into the day and brought back something we'll
            <span className="italic text-gold"> treasure forever."</span>
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { n: "Aarav & Meera", e: "Wedding · Udaipur", q: "Every frame feels like a memory we already loved. Calm, kind, and astonishingly talented." },
              { n: "Studio Lumen", e: "Brand Campaign", q: "A rare blend of editorial restraint and emotional warmth. Our team didn't want the shoot to end." },
              { n: "Priya Nair", e: "Milestone Birthday", q: "He noticed the moments we didn't. The album reads like a film we keep returning to." },
            ].map((t) => (
              <figure key={t.n} className="rounded-2xl border border-border/60 bg-background p-8">
                <Quote className="h-5 w-5 text-gold" />
                <blockquote className="mt-5 font-display text-lg leading-snug text-foreground/90">
                  "{t.q}"
                </blockquote>
                <figcaption className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
                  <div>
                    <p className="text-sm font-medium">{t.n}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-luxury text-muted-foreground">{t.e}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={story}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-32 text-center text-white lg:py-40">
          <p className="text-[11px] uppercase tracking-luxury text-white/70">Book Your Date</p>
          <h2 className="mt-6 font-display text-4xl leading-[1.1] md:text-6xl">
            Tell me about your <span className="italic text-[oklch(0.86_0.08_80)]">story.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-white/80">
            Dates fill up early, especially through wedding season. Reach out and I'll come back within 24 hours.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-medium uppercase tracking-luxury text-foreground transition hover:bg-gold"
          >
            Start a booking <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
