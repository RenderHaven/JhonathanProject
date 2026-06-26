import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — By Jonathan Ch" }] }),
  component: Checkout,
});

function Checkout() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    event_name: "",
    event_date: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.service.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return toast.error("Cart is empty");
    if (!form.name || !form.email) return toast.error("Name and email are required");
    setSubmitting(true);
    try {
      // Each cart item -> separate booking (and quantity multiplies it)
      const payloads: Array<Promise<unknown>> = [];
      for (const item of items) {
        for (let q = 0; q < item.quantity; q++) {
          payloads.push(
            api.publicBooking({
              service_id: item.service.id,
              name: form.name,
              email: form.email,
              phone: form.phone || null,
              event_name: form.event_name || item.service.title,
              event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
              message: form.message || null,
            }),
          );
        }
      }
      await Promise.all(payloads);
      toast.success("Booking received — Jonathan will be in touch shortly.");
      clear();
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
        <h1 className="font-display text-4xl md:text-5xl">
          Confirm your <span className="text-gradient-brand">booking</span>
        </h1>
        <p className="mt-2 text-muted-foreground">A booking inquiry will be sent for each selected service.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 pt-10 md:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur">
          <Field label="Full name *">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email *">
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Event name">
              <input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Event date">
              <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Special requirements">
            <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
          </Field>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-glow disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send booking inquiry"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur">
          <h3 className="font-display text-xl">Order summary</h3>
          {items.length === 0 ? (
            <div className="mt-4 text-sm text-muted-foreground">
              Your cart is empty. <Link to="/services" className="underline">Add a service</Link>.
            </div>
          ) : (
            <>
              <ul className="mt-4 space-y-3 text-sm">
                {items.map((i) => (
                  <li key={i.service.id} className="flex justify-between gap-3">
                    <span className="truncate">{i.service.title} × {i.quantity}</span>
                    <span className="shrink-0">{formatINR(i.service.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border/40 pt-3 text-base font-semibold">
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
            </>
          )}
        </aside>
      </section>
    </SiteLayout>
  );
}

const inputCls =
  "w-full text-white rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
