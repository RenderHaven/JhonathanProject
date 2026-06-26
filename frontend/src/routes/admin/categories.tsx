import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, GripVertical, Plus, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type Category } from "@/lib/api";
import { useDragReorder } from "@/lib/dnd";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }] }),
  component: Categories,
});

function Categories() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["cats"], queryFn: () => api.listCategories() });
  const cats = (data?.data ?? []).slice().sort((a, b) => a.display_order - b.display_order);

  const [draftOpen, setDraftOpen] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);

  const create = useMutation({
    mutationFn: () => api.createCategory(name.trim()),
    onSuccess: () => { toast.success("Category created"); setName(""); setDraftOpen(false); qc.invalidateQueries({ queryKey: ["cats"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const update = useMutation({
    mutationFn: () => api.updateCategory(editing!.id, { name: editing!.name }),
    onSuccess: () => { toast.success("Updated"); setEditing(null); qc.invalidateQueries({ queryKey: ["cats"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.deleteCategory(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["cats"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const toggle = useMutation({
    mutationFn: (c: Category) => api.updateCategory(c.id, { is_active: !c.is_active }),
    onMutate: async (c) => {
      await qc.cancelQueries({ queryKey: ["cats"] });
      const prev = qc.getQueryData<{ data: Category[] }>(["cats"]);
      qc.setQueryData(["cats"], (old: { data: Category[] } | undefined) => {
        if (!old) return old;
        return { ...old, data: old.data.map((x) => x.id === c.id ? { ...x, is_active: !x.is_active } : x) };
      });
      return { prev };
    },
    onError: (e, _c, context) => {
      if (context?.prev) qc.setQueryData(["cats"], context.prev);
      toast.error(`Failed: ${(e as Error).message}`);
    },
    onSuccess: () => {
      toast.success("Status changed");
      qc.invalidateQueries({ queryKey: ["cats"] });
    },
  });

  const commitOrder = async (ordered: Category[]) => {
    try {
      await Promise.all(
        ordered.map((c, i) =>
          c.display_order === i + 1
            ? null
            : api.updateCategory(c.id, { display_order: i + 1 }),
        ).filter(Boolean) as Promise<unknown>[],
      );
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["cats"] });
    } catch (e) {
      toast.error((e as Error).message);
      qc.invalidateQueries({ queryKey: ["cats"] });
    }
  };

  const { list, handlers, overIdx } = useDragReorder(cats, commitOrder);

  const cls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Drag rows by the handle to reorder.</p>
        </div>
        <button
          onClick={() => { setName(""); setDraftOpen(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>


      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="w-10 px-2 py-3"></th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Active</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((c, i) => (
              <tr key={c.id} {...handlers(i)} className={overIdx === i ? "bg-primary/10" : ""}>
                <td className="px-2 py-3 text-muted-foreground cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4" /></td>
                <td className="px-5 py-3 font-medium">
                  {editing?.id === c.id
                    ? <input className={cls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    : c.name}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggle.mutate(c)}
                    className={
                      "rounded-full px-3 py-1 text-xs font-medium transition " +
                      (c.is_active
                        ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                        : "bg-muted text-muted-foreground hover:bg-muted/70")
                    }
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  {editing?.id === c.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => update.mutate()} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">Save</button>
                      <button onClick={() => setEditing(null)} className="rounded-md border px-3 py-1 text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing({ id: c.id, name: c.name })} className="rounded-md p-1.5 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm("Delete this category?")) del.mutate(c.id); }} className="rounded-md p-1.5 hover:bg-accent"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {draftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !create.isPending && setDraftOpen(false)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New category</h2>
              <button onClick={() => setDraftOpen(false)} className="rounded-md p-1 hover:bg-accent" disabled={create.isPending}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) { toast.error("Name is required"); return; }
                create.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <input autoFocus className={cls} placeholder="e.g. Wedding" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setDraftOpen(false)} className="rounded-lg border px-4 py-2 text-sm" disabled={create.isPending}>Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60" disabled={create.isPending}>
                  {create.isPending ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>

  );
}
