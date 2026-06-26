import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Packages — By Jonathan Ch" },
      { name: "description", content: "Photography packages for weddings, birthdays and corporate events." },
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
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Packages</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">
          Crafted <span className="text-gradient-brand">services</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Choose a package, add it to your cart and check out — book multiple services together if you need.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 pt-12 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-secondary/40" />
          ))}
        {services.map((s) => {
          const includes = s.includes.split(",").map((x) => x.trim()).filter(Boolean);
          return (
            <article
              key={s.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur transition hover:border-brand/50 hover:shadow-glow"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-brand opacity-20 blur-3xl transition group-hover:opacity-40" />
              <h3 className="font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>

              <ul className="mt-6 space-y-2">
                {includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gradient-brand" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Starting at</p>
                  <p className="font-display text-3xl">{formatINR(s.price)}</p>
                </div>
                <button
                  onClick={() => { add(s); toast.success("Added to cart"); }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition hover:opacity-90"
                >
                  <ShoppingBag className="h-4 w-4" /> Add
                </button>
              </div>
            </article>
          );
        })}
        {!isLoading && services.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border/40 bg-card/40 p-16 text-center text-muted-foreground">
            No services published yet.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl">Need something bespoke?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Tell me about your event and I'll tailor a package to fit.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex rounded-full border border-border/60 bg-secondary/40 px-6 py-3 text-sm font-semibold backdrop-blur hover:bg-secondary"
        >
          Request a custom quote
        </Link>
      </section>
    </SiteLayout>
  );
}
