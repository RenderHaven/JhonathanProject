import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login — By Jonathan Ch" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) navigate({ to: "/admin" });
  }, [token, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.login(email, password);
      const tok = res.data?.token;
      if (!tok) throw new Error("No token returned");
      setAuth(tok, email);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-scope min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">JonathanAdmin · By Jonathan Ch</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Password</span>
                <input
                  required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
