"use client";

import Link from "next/link";
import { ShoppingBag, User, Menu, X, LogOut, Shield, Heart, Moon, Sun } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const Navbar = () => {
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const canRenderAuthUi = mounted;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/icon.svg" alt="Store Web" className="w-7 h-7" />
          Store Web
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/">Accueil</Link>
          <Link href="/orders">Commandes</Link>
          <Link href="/wishlist" className="relative flex items-center gap-1">
            <Heart size={16} />
            Favoris
            {mounted && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {canRenderAuthUi && isAdmin && <Link href="/admin">Admin</Link>}

          <Link href="/cart" className="relative flex items-center gap-1">
            <ShoppingBag size={16} />
            Panier
            {mounted && totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-4 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {!canRenderAuthUi ? null : !isAuthenticated ? (
            <Link href="/login" className="flex items-center gap-1">
              <User size={16} /> Connexion
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-1 hover:text-primary transition-colors">
                <User size={16} /> {user?.name?.split(" ")[0] || "Profil"}
              </Link>
              <button
                onClick={() => {
                  logout();
                  toast("Déconnecté");
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-card"
          >
            <div className="flex flex-col p-4 gap-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Accueil</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Commandes</Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Favoris</Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="text-sm font-medium flex items-center justify-between">
                Panier
                {totalItems > 0 && <span className="bg-primary text-white text-[10px] rounded-full px-2 py-0.5">{totalItems}</span>}
              </Link>
              <hr className="border-border" />
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Mon Profil</Link>
                  {isAdmin && <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary">Administration</Link>}
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                      toast("Déconnecté");
                    }}
                    className="text-sm font-medium text-destructive text-left"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Connexion</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;