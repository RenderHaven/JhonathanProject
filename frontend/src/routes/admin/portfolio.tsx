import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload, GripVertical, Pencil, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { api, type PortfolioImage } from "@/lib/api";
import { useDragReorder } from "@/lib/dnd";

export const Route = createFileRoute("/admin/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Admin" }] }),
  component: AdminPortfolio,
});

function AdminPortfolio() {
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["cats"], queryFn: () => api.listCategories() });
  const imgs = useQuery({ queryKey: ["images"], queryFn: () => api.listImages() });

  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [caption, setCaption] = useState("");
  const [filter, setFilter] = useState<number | "all">("all");

  const [editing, setEditing] = useState<PortfolioImage | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");

  const upload = useMutation({
    mutationFn: () => api.uploadImage(file!, Number(categoryId), caption || undefined),
    onSuccess: () => {
      toast.success("Image uploaded");
      setFile(null); setCaption(""); setCategoryId("");
      qc.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.deleteImage(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["images"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const toggle = useMutation({
    mutationFn: (img: PortfolioImage) => api.updateImage(img.id, { is_active: !img.is_active }),
    onMutate: async (img) => {
      await qc.cancelQueries({ queryKey: ["images"] });
      const prev = qc.getQueryData<{ data: PortfolioImage[] }>(["images"]);
      qc.setQueryData(["images"], (old: { data: PortfolioImage[] } | undefined) => {
        if (!old) return old;
        return { ...old, data: old.data.map((x) => x.id === img.id ? { ...x, is_active: !x.is_active } : x) };
      });
      return { prev };
    },
    onError: (e, _img, context) => {
      if (context?.prev) qc.setQueryData(["images"], context.prev);
      toast.error(`Failed: ${(e as Error).message}`);
    },
    onSuccess: () => {
      toast.success("Status changed");
      qc.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const update = useMutation({
    mutationFn: (img: PortfolioImage) =>
      api.updateImage(img.id, {
        caption: editCaption,
        category_id: editCategoryId ? Number(editCategoryId) : undefined,
      }),
    onSuccess: () => {
      toast.success("Image updated");
      setEditing(null);
      setEditCaption("");
      setEditCategoryId("");
      qc.invalidateQueries({ queryKey: ["images"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const categories = cats.data?.data ?? [];
  const all = imgs.data?.data ?? [];
  const filtered = (filter === "all" ? all : all.filter((i) => i.category_id === filter))
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

  const commitOrder = async (ordered: PortfolioImage[]) => {
    try {
      await Promise.all(
        ordered.map((img, i) =>
          img.display_order === i + 1
            ? null
            : api.updateImage(img.id, { display_order: i + 1 }),
        ).filter(Boolean) as Promise<unknown>[],
      );
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["images"] });
    } catch (e) {
      toast.error((e as Error).message);
      qc.invalidateQueries({ queryKey: ["images"] });
    }
  };

  const { list: images, handlers, overIdx } = useDragReorder(filtered, commitOrder);
  const canReorder = filter !== "all";

  const cls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <AdminLayout>
      <h1 className="mb-1 text-2xl font-semibold">Portfolio</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload and manage gallery images. {canReorder ? "Drag tiles to reorder within this category." : "Select a category to reorder."}
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (!file || !categoryId) return toast.error("File and category required"); upload.mutate(); }}
        className="mb-8 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-[1fr_220px_1fr_auto]"
      >
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-background px-3 py-2 text-sm">
          <Upload className="h-4 w-4" />
          {file ? <span className="truncate">{file.name}</span> : <span className="text-muted-foreground">Choose image</span>}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <select className={cls} value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={cls} placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <button disabled={upload.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {upload.isPending ? "Uploading…" : "Upload"}
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {categories.map((c) => <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.name}</Chip>)}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => {
          const dnd = canReorder ? handlers(i) : {};
          return (
            <div
              key={img.id}
              {...dnd}
              className={
                "group relative overflow-hidden rounded-xl border bg-card transition " +
                (canReorder ? "cursor-grab active:cursor-grabbing " : "") +
                (canReorder && overIdx === i ? "ring-2 ring-primary" : "")
              }
            >
              <img src={img.image_url} alt={img.caption ?? ""} className={"aspect-square w-full object-cover pointer-events-none transition " + (img.is_active ? "" : "opacity-40 grayscale")} loading="lazy" />
              {canReorder && (
                <div className="absolute left-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 transition group-hover:opacity-100">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{img.caption || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">{categories.find((c) => c.id === img.category_id)?.name ?? "—"}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle.mutate(img); }}
                  className={
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition " +
                    (img.is_active
                      ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/70")
                  }
                >
                  {img.is_active ? "Active" : "Inactive"}
                </button>
              </div>
              <button
                onClick={() => { if (confirm("Delete this image?")) del.mutate(img.id); }}
                className="absolute right-2 top-10 rounded-full bg-background/90 p-2 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(img);
                  setEditCaption(img.caption ?? "");
                  setEditCategoryId(img.category_id);
                }}
                className="absolute right-2 top-2 rounded-full bg-background/90 p-2 opacity-0 transition group-hover:opacity-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {images.length === 0 && <p className="col-span-full p-6 text-center text-muted-foreground">No images.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !update.isPending && setEditing(null)}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Image</h2>
              <button onClick={() => setEditing(null)} className="rounded-md p-1 hover:bg-accent" disabled={update.isPending}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Caption</label>
                <input
                  className={cls}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Image caption"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select
                  className={cls}
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2 text-sm" disabled={update.isPending}>Cancel</button>
                <button
                  onClick={() => { if (editing) update.mutate(editing); }}
                  disabled={update.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {update.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={"rounded-full px-4 py-1.5 text-sm transition " + (active ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-accent")}>
      {children}
    </button>
  );
}
