import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const stored = readJson("storeweb:v1:wishlist", []);
    setWishlist(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    writeJson("storeweb:v1:wishlist", wishlist);
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        if (isAuthenticated) {
          api(`/users/me/wishlist/${product.id}`, { method: "DELETE" }).catch(console.error);
        }
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (isAuthenticated) {
          api("/users/me/wishlist", { 
            method: "POST", 
            body: JSON.stringify({ productId: product.id }) 
          }).catch(console.error);
        }
        return [...prev, product];
      }
    });
  }, [isAuthenticated]);

  const isInWishlist = useCallback((id) => {
    return wishlist.some((p) => p.id === id);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
