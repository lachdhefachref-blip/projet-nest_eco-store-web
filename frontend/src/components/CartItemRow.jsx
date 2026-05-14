import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

const CartItemRow = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const moveToWishlist = () => {
    toggleWishlist(item);
    removeFromCart(item.id);
    toast.message("Produit déplacé vers votre liste de souhaits");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 py-4 border-b border-border"
    >
      <div className="w-20 h-20 rounded-md overflow-hidden bg-secondary shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-sm font-medium text-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.price} €</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-foreground">{(item.price * item.quantity).toFixed(2)} €</p>
        <div className="flex gap-2 mt-1 justify-end">
          <button
            onClick={moveToWishlist}
            className={`transition-colors ${isInWishlist(item.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            title="Enregistrer pour plus tard"
          >
            <Heart size={14} className={isInWishlist(item.id) ? "fill-primary" : ""} />
          </button>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItemRow;
