"use client";

import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, ChevronDown, SortAsc, SortDesc } from "lucide-react";
import { api, getApiBase, isUsingDefaultLocalApi } from "@/lib/api";
import Image from "next/image";
import { motion } from "framer-motion";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const q = query.trim();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { q, activeCategory, sort, order, minPrice, maxPrice }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (activeCategory && activeCategory !== "Tout") params.set("category", activeCategory);
      if (sort) params.set("sort", sort);
      if (order) params.set("order", order);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      
      const res = await api(`/products?${params.toString()}`);
      return (res.products || []).map((p) => ({ ...p, id: p._id }));
    },
    retry: 0,
  });

  const products = data || [];
  const categories = useMemo(
    () => ["Tout", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden">
        <Image src={heroBanner} alt="Collection" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-6xl font-semibold text-primary-foreground max-w-lg"
          >
            Nouvelle Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary-foreground/80 mt-3 text-lg max-w-md font-body"
          >
            Découvrez nos produits soigneusement sélectionnés.
          </motion.p>
        </div>
      </section>

      {/* Categories & Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Recherche</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Catégories</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Prix</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                setActiveCategory("Tout");
                setQuery("");
                setMinPrice("");
                setMaxPrice("");
                setSort("createdAt");
                setOrder("desc");
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium"
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </button>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {activeCategory === "Tout" ? "Tous les Produits" : activeCategory}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-2">Trier par :</span>
                <select
                  value={`${sort}-${order}`}
                  onChange={(e) => {
                    const [s, o] = e.target.value.split("-");
                    setSort(s);
                    setOrder(o);
                  }}
                  className="bg-transparent text-sm font-medium border-none focus:ring-0 cursor-pointer"
                >
                  <option value="createdAt-desc">Nouveautés</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating-desc">Meilleures notes</option>
                </select>
              </div>
            </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {isLoading ? (
            <div className="col-span-full text-muted-foreground">Chargement...</div>
          ) : isError ? (
            <div className="col-span-full space-y-2 text-destructive">
              <p className="font-medium">Impossible de charger les produits (API injoignable).</p>
              <p className="text-sm text-foreground font-normal">
                URL appelée : <code className="rounded bg-muted px-1 py-0.5 text-xs">{getApiBase()}</code>
                {isUsingDefaultLocalApi() ? (
                  <>
                    . Démarre le backend sur le port 5001 ou définis{" "}
                    <code className="rounded bg-muted px-0.5 text-xs">NEXT_PUBLIC_API_URL</code> dans <code className="rounded bg-muted px-0.5 text-xs">.env.local</code>.
                  </>
                ) : (
                  <>
                    . Vérifie que le déploiement répond (MongoDB <code className="rounded bg-muted px-0.5 text-xs">MONGO_URI</code> sur Vercel,{" "}
                    <code className="rounded bg-muted px-0.5 text-xs">CLIENT_URL</code> = URL du site pour le CORS).
                  </>
                )}
              </p>
            </div>
          ) : (
            products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
            ))
          )}
        </motion.div>
            </div>
          </div>
      </section>
    </div>
  );
};

export default Home;
