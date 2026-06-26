import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type Service } from "@/lib/api";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: AdminServices,
});

type Draft = { id?: number; title: string; description: string; includes: string; price: string; image_url: string; is_active: boolean };
const empty: Draft = { title: "", description: "", includes: "", price: "", image_url: "", is_active: true };

function AdminServices() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["services"], queryFn: () => api.listServices() });
  const services = data?.data ?? [];
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      const body = {
        title: draft.title,
        description: draft.description,
        includes: draft.includes,
        price: Number(draft.price),
        image_url: draft.image_url || null,
      };
      if (draft.id) return api.updateService(draft.id, { ...body, is_active: draft.is_active });
      return api.createService(body);
    },
    onSuccess: () => { toast.success("Saved"); setDraft(null); qc.invalidateQueries({ queryKey: ["services"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.deleteService(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["services"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  function edit(s: Service) {
    setDraft({
      id: s.id, title: s.title, description: s.description, includes: s.includes,
      price: String(s.price), image_url: s.image_url ?? "", is_active: s.is_active,
    });
  }

  const cls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-sm text-muted-foreground">Manage packages shown on the site.</p>
        </div>
        <button onClick={() => setDraft({ ...empty })} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New service
        </button>
      </div>

      <div className="grid gap-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><h3 className="truncate font-semibold">{s.title}</h3>
                {!s.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Inactive</span>}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-2 text-sm font-medium">{formatINR(s.price)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(s)} className="rounded-md p-2 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm("Delete this service?")) del.mutate(s.id); }} className="rounded-md p-2 hover:bg-accent"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No services yet.</p>}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{draft.id ? "Edit service" : "New service"}</h2>
              <button onClick={() => setDraft(null)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
              <Field label="Title"><input required className={cls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
              <Field label="Description"><textarea required rows={4} className={cls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
              <Field label="Includes (comma separated)"><input required className={cls} value={draft.includes} onChange={(e) => setDraft({ ...draft, includes: e.target.value })} placeholder="Photos, Video, Album" /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Price (₹)"><input required type="number" min="1" className={cls} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></Field>
                <Field label="Image URL"><input className={cls} value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} /></Field>
              </div>
              {draft.id && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
                  Active
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDraft(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button disabled={save.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
                  {save.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
