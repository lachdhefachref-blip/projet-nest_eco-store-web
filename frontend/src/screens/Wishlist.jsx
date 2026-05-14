import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (product) => {
    addToCart(product);
    toggleWishlist(product);
    toast.success("Produit déplacé vers le panier");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary fill-primary" />
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Ma Liste de Souhaits
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border-2 border-dashed border-border rounded-xl"
        >
          <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-6">Votre liste est vide pour le moment.</p>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Découvrir nos produits
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlist.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    <p className="text-sm text-primary font-bold">{item.price} €</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Au panier
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
