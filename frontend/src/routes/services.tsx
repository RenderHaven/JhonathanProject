import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Packages — By Jonathan Ch" },
      { name: "description", content: "Premium photography packages for weddings, events, portraits and brands." },
    ],
  }),
  component: Services,
});

function Services() {
  const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: () => api.listServices() });
  const services = (data?.data ?? []).filter((s) => s.is_active);
  const add = useCart((s) => s.add);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 pt-20 lg:px-10 lg:pt-28">
        <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Services & Packages</p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
          Thoughtfully crafted <span className="italic text-gold">collections.</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/70">
          Each engagement is bespoke. Start with a collection below or reach out for a custom proposal —
          your story leads the conversation.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 pt-16 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[480px] animate-pulse rounded-2xl bg-secondary" />
            ))}
          {services.map((s) => {
            const includes = s.includes.split(",").map((x) => x.trim()).filter(Boolean);
            return (
              <article
                key={s.id}
                className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-8 transition hover:border-gold hover:shadow-elegant lg:p-10"
              >
                <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Collection</p>
                <h3 className="mt-3 font-display text-3xl leading-tight">{s.title}</h3>
                <p className="mt-4 text-sm text-foreground/70">{s.description}</p>

                <div className="my-8 h-px w-full bg-border/60" />

                <ul className="space-y-3">
                  {includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex items-end justify-between border-t border-border/60 pt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Starting at</p>
                    <p className="mt-1 font-display text-3xl">{formatINR(s.price)}</p>
                  </div>
                  <button
                    onClick={() => { add(s); toast.success("Added to cart"); }}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-medium uppercase tracking-luxury text-background transition hover:bg-gold hover:text-foreground"
                  >
                    Add <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
          {!isLoading && services.length === 0 && (
            <div className="col-span-full rounded-2xl border border-border/60 bg-card p-16 text-center text-muted-foreground">
              No services published yet.
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border/60 bg-[oklch(0.96_0.006_80)]">
        <div className="mx-auto max-w-5xl px-6 py-28 text-center lg:px-10">
          <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Bespoke</p>
          <h2 className="mt-6 font-display text-4xl leading-[1.1] md:text-5xl">
            Need something <span className="italic text-gold">tailored?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-foreground/70">
            Share a few details about your event and I'll craft a proposal designed for it alone.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-luxury text-background transition hover:bg-gold hover:text-foreground"
          >
            Request a custom quote <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
