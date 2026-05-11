import { useState } from "react";
import { Edit, Plus, Save, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAllShopProducts, useDeleteShopProduct, useSaveShopProduct, type ShopProduct } from "@/hooks/useShop";

const emptyProduct = {
  slug: "",
  name: "",
  description: "",
  category: "Apparel",
  price: 0,
  currency: "NGN",
  image_url: "",
  status: "draft",
  stock_quantity: 0,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ShopProductsManager = () => {
  const { toast } = useToast();
  const { data: products, isLoading, error } = useAllShopProducts();
  const saveProduct = useSaveShopProduct();
  const deleteProduct = useDeleteShopProduct();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const reset = () => {
    setEditingId(null);
    setForm(emptyProduct);
  };

  const edit = (product: ShopProduct) => {
    setEditingId(product.id);
    setForm({
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
      status: product.status,
      stock_quantity: product.stock_quantity,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await saveProduct.mutateAsync({
        id: editingId || undefined,
        ...form,
        slug: form.slug || slugify(form.name),
      });
      toast({ title: editingId ? "Drop updated" : "Drop created" });
      reset();
    } catch (err: any) {
      toast({ title: "Could not save drop", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (product: ShopProduct) => {
    if (!confirm(`Delete ${product.name}?`)) return;
    await deleteProduct.mutateAsync(product.id);
    toast({ title: "Drop deleted" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" /> SHOP DROPS
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Create and publish products without touching code.</p>
      </div>

      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-muted-foreground">Shop products table needs the Supabase migration.</p>}

      <form onSubmit={save} className="liquid-glass rounded-3xl p-5 md:p-6">
        <div className="liquid-content space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-foreground">{editingId ? "Edit Drop" : "New Drop"}</h3>
            <Button type="button" variant="portal" onClick={reset}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} className="mt-1 bg-muted border-border" required />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Slug</Label>
              <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} className="mt-1 bg-muted border-border" required />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Category</Label>
              <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Status</Label>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="members">Members</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Price</Label>
              <Input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Stock</Label>
              <Input type="number" value={form.stock_quantity} onChange={(event) => setForm({ ...form, stock_quantity: Number(event.target.value) })} className="mt-1 bg-muted border-border" />
            </div>
            <div className="md:col-span-2">
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Image URL</Label>
              <Input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} className="mt-1 bg-muted border-border" />
            </div>
            <div className="md:col-span-2">
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Description</Label>
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 bg-muted border-border" rows={4} />
            </div>
          </div>
          <Button variant="neon" type="submit" disabled={saveProduct.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveProduct.isPending ? "Saving..." : "Save Drop"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {isLoading ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading drops...</p>
        ) : !products?.length ? (
          <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">No drops yet.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border bg-card/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-base text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{product.currency} {product.price.toLocaleString()} / {product.status}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => edit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => remove(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopProductsManager;
