import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — By Jonathan Ch" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = items.reduce((sum, i) => sum + i.service.price * i.quantity, 0);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-24">
        <h1 className="font-display text-4xl md:text-5xl">Your <span className="text-gradient-brand">cart</span></h1>
        <p className="mt-2 text-muted-foreground">
          Selected services will each create a separate booking inquiry on checkout.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-24 pt-10 md:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-border/40 bg-card/40 p-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link
                to="/services"
                className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow"
              >
                Browse services
              </Link>
            </div>
          )}
          {items.map((i) => (
            <div
              key={i.service.id}
              className="flex items-center gap-4 rounded-2xl border border-border/40 bg-card/60 p-5"
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-brand-soft" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{i.service.title}</p>
                <p className="text-sm text-muted-foreground">{formatINR(i.service.price)} each</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1">
                <button onClick={() => setQty(i.service.id, i.quantity - 1)} className="h-8 w-8 rounded-full hover:bg-secondary">
                  <Minus className="mx-auto h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{i.quantity}</span>
                <button onClick={() => setQty(i.service.id, i.quantity + 1)} className="h-8 w-8 rounded-full hover:bg-secondary">
                  <Plus className="mx-auto h-3 w-3" />
                </button>
              </div>
              <div className="w-28 text-right font-medium">{formatINR(i.service.price * i.quantity)}</div>
              <button onClick={() => remove(i.service.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur">
          <h3 className="font-display text-xl">Summary</h3>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{items.reduce((n, i) => n + i.quantity, 0)}</dd></div>
            <div className="flex justify-between border-t border-border/40 pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          {items.length === 0 ? (
            <span className="mt-6 block w-full rounded-full bg-secondary/40 px-6 py-3 text-center text-sm font-semibold text-muted-foreground">
              Proceed to checkout
            </span>
          ) : (
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-full bg-gradient-brand px-6 py-3 text-center text-sm font-semibold text-brand-foreground shadow-glow transition hover:opacity-90"
            >
              Proceed to checkout
            </Link>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
}
