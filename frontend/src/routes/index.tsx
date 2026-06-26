import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, Heart, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "By Jonathan Ch — Photography for moments that matter" },
      {
        name: "description",
        content:
          "Wedding, birthday and corporate event photography by Jonathan Ch. Browse the portfolio, explore packages and book your date.",
      },
      { property: "og:title", content: "By Jonathan Ch — Photography" },
      {
        property: "og:description",
        content: "Cinematic photography for weddings, birthdays and corporate events.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: imagesRes } = useQuery({
    queryKey: ["images"],
    queryFn: () => api.listImages(),
  });
  const images = (imagesRes?.data ?? []).slice(0, 6);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-brand/30 blur-[120px]" />
          <div className="absolute -right-32 top-40 h-[500px] w-[500px] rounded-full bg-brand-2/30 blur-[140px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32">
          <div className="flex max-w-3xl flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3" /> Photography Studio · Est. By Jonathan Ch
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
              Moments,
              <br />
              <span className="text-gradient-brand">held still.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              I photograph weddings, birthdays and corporate stories with a
              cinematic eye and a calm presence — so you stay in the moment,
              and we keep it forever.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/portfolio"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-glow transition hover:opacity-90"
              >
                View portfolio
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/30 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary"
              >
                Explore packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Selected work
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              Recent <span className="text-gradient-brand">frames</span>
            </h2>
          </div>
          <Link
            to="/portfolio"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline"
          >
            See all →
          </Link>
        </div>
        <div className="grid auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-4">
          {images.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-secondary/40"
                style={{
                  gridColumn: i === 0 || i === 3 ? "span 2" : undefined,
                  gridRow: i === 0 || i === 3 ? "span 2" : undefined,
                }}
              />
            ))}
          {images.map((img, i) => (
            <Link
              key={img.id}
              to="/portfolio"
              className="group relative overflow-hidden rounded-2xl bg-secondary/40"
              style={{
                gridColumn: i === 0 || i === 3 ? "span 2" : undefined,
                gridRow: i === 0 || i === 3 ? "span 2" : undefined,
              }}
            >
              <img
                src={img.image_url}
                alt={img.caption ?? "Portfolio"}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition group-hover:opacity-100" />
              {img.caption && (
                <span className="absolute bottom-4 left-4 text-sm font-medium text-foreground opacity-0 transition group-hover:opacity-100">
                  {img.caption}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/40 bg-gradient-brand-soft">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-3">
          {[
            { icon: Camera, title: "Cinematic eye", body: "Composition first. Light second. Story always." },
            { icon: Heart, title: "Calm on the day", body: "I direct gently, so your celebration breathes." },
            { icon: Sparkles, title: "Heirloom delivery", body: "Hand-graded edits, ready for print or screen." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur">
              <Icon className="h-6 w-6 text-gradient-brand" />
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl md:text-5xl">
          Ready to <span className="text-gradient-brand">book your date?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Tell me about your event and I'll come back with a tailored proposal.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground shadow-glow"
        >
          Start a booking <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </SiteLayout>
  );
}
