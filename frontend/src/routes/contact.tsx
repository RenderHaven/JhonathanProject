import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowUpRight, CalendarIcon, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
        event_date: form.event_date ? new Date(form.event_date + "T00:00:00").toISOString() : null,
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

  const fieldCls =
    "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-gold";

  const labelCls = "block text-[10px] uppercase tracking-luxury text-muted-foreground";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 pt-20 lg:px-10 lg:pt-28">
        <p className="text-[11px] uppercase tracking-luxury text-muted-foreground">Contact</p>
        <h1 className="mt-6 max-w-5xl font-display text-5xl leading-[1.02] md:text-7xl lg:text-[88px]">
          Let's create something <span className="italic text-gold">beautiful.</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/70">
          Share a few details about your event and I'll come back within 24 hours with availability and a tailored proposal.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-32 pt-20 md:grid-cols-12 lg:px-10">
        {/* Form */}
        <form onSubmit={submit} className="md:col-span-7 lg:col-span-8">
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Email *</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Phone</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Service of interest</span>
              <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} className={cn(fieldCls, "appearance-none")}>
                <option value="">— Any —</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Event name</span>
              <input value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} className={fieldCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Event date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-auto w-full justify-start rounded-none border-0 border-b border-border bg-transparent px-0 py-3 text-left text-base font-normal hover:bg-transparent",
                      !form.event_date && "text-muted-foreground/60",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
                    {form.event_date ? format(new Date(form.event_date + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.event_date ? new Date(form.event_date + "T00:00:00") : undefined}
                    onSelect={(date) =>
                      setForm({ ...form, event_date: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </label>
          </div>

          <label className="mt-10 block">
            <span className={labelCls}>Tell me about your event</span>
            <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={cn(fieldCls, "resize-none")} />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-12 inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-[11px] font-medium uppercase tracking-luxury text-background transition hover:bg-gold hover:text-foreground disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send inquiry"} <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>

        {/* Studio info */}
        <aside className="md:col-span-5 lg:col-span-4">
          <div className="rounded-2xl border border-border/60 bg-card p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Studio</p>
            <h3 className="mt-4 font-display text-3xl">By Jonathan Ch</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Available worldwide. Based between Mumbai and Goa.
            </p>

            <ul className="mt-8 space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Email</p>
                  <p className="mt-1">hello@byjonathan.ch</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Phone</p>
                  <p className="mt-1">+91 90000 00000</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Location</p>
                  <p className="mt-1">Mumbai · Goa · Worldwide</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Instagram className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-luxury text-muted-foreground">Social</p>
                  <p className="mt-1">@byjonathan.ch</p>
                </div>
              </li>
            </ul>

            <a
              href="https://wa.me/919000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground px-6 py-3.5 text-[11px] font-medium uppercase tracking-luxury text-foreground transition hover:border-gold hover:text-gold"
            >
              Chat on WhatsApp
            </a>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
