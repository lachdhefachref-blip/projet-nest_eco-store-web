import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/products";
import { toast } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { normalizeImageUrl } from "@/lib/image-url";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { ShoppingBag, Users, TrendingUp, Package, Plus, RotateCcw, LayoutDashboard } from "lucide-react";

const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) =>
      api("/products", { method: "POST", body: JSON.stringify(payload) }).then((r) => r.product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      api(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((r) => r.product),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => api("/admin/reset-products", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const { data: orderStats } = useQuery({
    queryKey: ["admin", "order-stats"],
    enabled: isAuthenticated && isAdmin,
    queryFn: () => api("/orders/admin/dashboard/stats"),
  });

  const { data: userStats } = useQuery({
    queryKey: ["admin", "user-stats"],
    enabled: isAuthenticated && isAdmin,
    queryFn: () => api("/users/admin/dashboard/stats"),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products", "admin"],
    enabled: isAuthenticated && isAdmin,
    queryFn: async () => {
      const res = await api("/products?all=1");
      return (res.products || []).map((p) => ({ ...p, id: p._id }));
    },
  });
  const products = productsData || [];

  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "products"
  const [editing, setEditing] = useState(null);

  const empty = useMemo(
    () => ({
      id: null,
      name: "",
      price: 0,
      image: "",
      description: "",
      stock: 0,
      category: categories[1] ?? "Accessoires",
    }),
    []
  );

  const [draft, setDraft] = useState(empty);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (!isAdmin) router.push("/");
  }, [isAuthenticated, isAdmin, router]);
  if (!isAuthenticated || !isAdmin) return null;

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...empty, id: null });
  };

  const startEdit = (p) => {
    setEditing(p);
    setDraft(p);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Nom requis");
      return;
    }
    if (!draft.image.trim()) {
      toast.error("Image (URL) requise");
      return;
    }
    if (!Number.isFinite(draft.price) || draft.price <= 0) {
      toast.error("Prix invalide");
      return;
    }
    const normalized = normalizeImageUrl(draft.image);
    if (!normalized.ok) {
      toast.error("Lien image invalide", {
        description:
          normalized.reason === "google_imgres"
            ? "Lien Google Images (imgres) ما يخدمش. استعمل رابط مباشر ينتهي بـ .jpg/.png أو Drive/Direct."
            : normalized.reason === "non_direct_image_url"
              ? "هذا رابط صفحة موش صورة. استعمل رابط مباشر ينتهي بـ .jpg/.png/.webp أو مسار محلي /products/..."
              : "استعمل رابط صورة مباشر (jpg/png/webp) أو /products/...",
      });
      return;
    }

    const payload = {
      name: draft.name.trim(),
      category: draft.category,
      image: normalized.url,
      description: draft.description.trim(),
      stock: Math.max(0, Number(draft.stock) || 0),
      price: Number(draft.price),
      active: true,
    };
    if (editing?.id) {
      void updateMutation
        .mutateAsync({ id: editing.id, payload })
        .then(() => {
          toast.success("Produit mis à jour");
          startCreate();
        })
        .catch(() => toast.error("Erreur"));
    } else {
      void createMutation
        .mutateAsync(payload)
        .then(() => {
          toast.success("Produit ajouté");
          startCreate();
        })
        .catch(() => toast.error("Erreur"));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Administration</h1>
          <p className="text-sm text-muted-foreground">Gérez votre boutique et consultez les statistiques.</p>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "dashboard" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </div>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "products" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produits
            </div>
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Revenu Total</p>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{orderStats?.totalRevenue || 0} €</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{orderStats?.totalOrders || 0}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{userStats?.totalUsers || 0}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Panier Moyen</p>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                {orderStats?.totalOrders > 0 ? (orderStats.totalRevenue / orderStats.totalOrders).toFixed(2) : 0} €
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm min-h-[400px]">
              <h3 className="font-semibold mb-6">Évolution du Revenu</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderStats?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="_id" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
              <h3 className="font-semibold mb-6">Commandes Récentes</h3>
              <div className="space-y-4">
                {(orderStats?.recentOrders || []).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{order.shippingAddress?.name || "Client"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{order.totalPrice} €</p>
                      <p className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
                {(!orderStats?.recentOrders || orderStats.recentOrders.length === 0) && (
                  <p className="text-sm text-center text-muted-foreground py-8">Aucune commande récente</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-lg">Liste des Produits ({products.length})</h2>
              <button
                onClick={() => {
                  void resetMutation
                    .mutateAsync()
                    .then(() => {
                      toast.message("Catalogue par défaut ajouté");
                      startCreate();
                    })
                    .catch(() => toast.error("Erreur"));
                }}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            </div>
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-background p-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} • {p.stock} stock • {p.price} €
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      void deleteMutation
                        .mutateAsync(p.id)
                        .then(() => {
                          toast.message("Produit supprimé");
                          if (editing?.id === p.id) startCreate();
                        })
                        .catch(() => toast.error("Erreur"));
                    }}
                    className="px-3 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-background p-5 sticky top-24">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              {editing ? "Modifier" : "Ajouter"} un produit
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nom</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.filter((c) => c !== "Tout").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Prix (€)</label>
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Image (URL)</label>
                <input
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={save}
                  className="flex-1 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {editing ? "Mettre à jour" : "Ajouter au catalogue"}
                </button>
                <button
                  onClick={startCreate}
                  className="px-4 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

