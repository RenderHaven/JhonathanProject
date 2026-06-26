import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Calendar, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type Booking, type BookingStatus } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Admin" }] }),
  component: AdminBookings,
});

function AdminBookings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bookings"], queryFn: () => api.listBookings() });
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Booking | null>(null);

  const all = data?.data ?? [];
  const bookings = all.filter((b) => filter === "ALL" || b.status === filter);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) => api.updateBookingStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["bookings"] }); setSelected(null); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-semibold">Bookings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Inquiries submitted from the website.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "NEW", "REVIEWED", "RESPONDED"] as const).map((s) => {
          const n = s === "ALL" ? all.length : all.filter((b) => b.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={"rounded-full px-4 py-1.5 text-sm transition " + (filter === s ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-accent")}>
              {s} ({n})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} onClick={() => setSelected(b)} className="cursor-pointer hover:bg-accent/40">
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.email}</td>
                <td className="px-5 py-3">{b.event_name ?? "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.event_date ? formatDate(b.event_date) : "—"}</td>
                <td className="px-5 py-3"><StatusBadge s={b.status} /></td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No bookings.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">Submitted {formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5" /></button>
            </div>
            <dl className="space-y-3 text-sm">
              <Row icon={Mail} label="Email">{selected.email}</Row>
              {selected.phone && <Row icon={Phone} label="Phone">{selected.phone}</Row>}
              {selected.event_date && <Row icon={Calendar} label="Event date">{formatDate(selected.event_date)}</Row>}
              {selected.event_name && <Row label="Event">{selected.event_name}</Row>}
              {selected.message && <Row label="Message"><span className="whitespace-pre-wrap">{selected.message}</span></Row>}
              <Row label="Status"><StatusBadge s={selected.status} /></Row>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {(["NEW", "REVIEWED", "RESPONDED"] as const).map((s) => (
                <button
                  key={s}
                  disabled={selected.status === s || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: selected.id, status: s })}
                  className={"rounded-lg border px-3 py-1.5 text-xs font-medium transition " + (selected.status === s ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
                >
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ icon: Icon, label, children }: { icon?: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="flex w-28 shrink-0 items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}

function StatusBadge({ s }: { s: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    NEW: "bg-blue-100 text-blue-700",
    REVIEWED: "bg-amber-100 text-amber-700",
    RESPONDED: "bg-emerald-100 text-emerald-700",
  };
  return <span className={"inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " + styles[s]}>{s}</span>;
}
