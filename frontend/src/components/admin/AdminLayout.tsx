import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Image as ImageIcon, Briefcase, CalendarCheck, Tag, LogOut, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/services", label: "Services", icon: Briefcase },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { token, email, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!token) navigate({ to: "/admin/login" });
  }, [token, navigate]);

  if (!token) return null;

  async function handleLogout() {
    try { await api.logout(); } catch {}
    logout();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="admin-scope min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
          <div className="border-b px-6 py-5">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-md bg-primary" />
              <span className="font-semibold">JonathanAdmin</span>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">By Jonathan Ch</p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition " +
                    (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")
                  }
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
            <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
            {email && <p className="mt-3 truncate px-3 text-xs text-muted-foreground">{email}</p>}
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b bg-card px-6 md:hidden">
            <Link to="/admin" className="font-semibold">JonathanAdmin</Link>
            <button onClick={handleLogout} className="text-sm text-muted-foreground"><LogOut className="h-4 w-4" /></button>
          </header>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
