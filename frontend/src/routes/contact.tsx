import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — By Jonathan Ch" },
      { name: "description", content: "Get in touch to book a photography session with Jonathan Ch." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: servicesRes } = useQuery({ queryKey: ["services"], queryFn: () => api.listServices() });
  const services = (servicesRes?.data ?? []).filter((s) => s.is_active);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", event_name: "", event_date: "", message: "", service_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.publicBooking({
        service_id: form.service_id ? Number(form.service_id) : null,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        event_name: form.event_name || null,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        message: form.message || null,
      });
      toast.success("Thanks — your inquiry has been received.");
      setForm({ name: "", email: "", phone: "", event_name: "", event_date: "", message: "", service_id: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  }

  const cls = "w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 pt-16 md:pt-24">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Contact</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">
          Let's <span className="text-gradient-brand">talk</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Share a few details about your event and I'll get back within 24 hours.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} /></label>
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email *</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cls} /></label>
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Phone</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} /></label>
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Service of interest</span>
              <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} className={cls}>
                <option value="">— Any —</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select></label>
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Event name</span>
              <input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} className={cls} /></label>
            <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Event date</span>
              <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className={cls} /></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Message</span>
            <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={cls} /></label>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-brand-foreground shadow-glow disabled:opacity-60">
            {submitting ? "Sending…" : "Send inquiry"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
