import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Briefcase, CalendarCheck, Tag, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => api.dashboard() });
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: () => api.listBookings() });
  const d = dash.data?.data ?? {};
  const recent = (bookings.data?.data ?? []).slice(0, 5);

  const stats = [
    { label: "Portfolio images", value: d.total_images ?? d.images ?? 0, icon: ImageIcon, to: "/admin/portfolio" },
    { label: "Services", value: d.total_services ?? d.services ?? 0, icon: Briefcase, to: "/admin/services" },
    { label: "Categories", value: d.total_categories ?? d.categories ?? 0, icon: Tag, to: "/admin/categories" },
    { label: "Bookings", value: d.total_bookings ?? d.bookings ?? 0, icon: CalendarCheck, to: "/admin/bookings" },
  ] as const;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your studio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group rounded-xl border bg-card p-5 transition hover:shadow-sm">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">Recent bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {recent.length === 0 && <p className="p-6 text-sm text-muted-foreground">No bookings yet.</p>}
          {recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.email} · {formatDate(b.created_at)}</p>
              </div>
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
