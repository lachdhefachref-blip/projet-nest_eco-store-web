import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart, setCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
          {(() => {
            const resolveSrc = (img) => {
              if (!img) return '/placeholder.svg';
              if (typeof img === 'string') return img;
              if (Array.isArray(img) && img.length) return resolveSrc(img[0]);
              if (typeof img === 'object') {
                return img.src || img.url || (img.default && (img.default.src || img.default)) || '/placeholder.svg';
              }
              return '/placeholder.svg';
            };

            const imgSrc = resolveSrc(product?.image);

            return (
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src && !e.currentTarget.src.endsWith('/placeholder.svg')) {
                    e.currentTarget.src = '/placeholder.svg';
                  }
                }}
              />
            );
          })()}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all ${
              isInWishlist(product.id) 
                ? "bg-primary text-primary-foreground opacity-100" 
                : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-background"
            }`}
          >
            <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
          </button>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${product.id}`} className="hover:underline underline-offset-4">
            <h3 className="font-display text-base font-medium text-foreground">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">{product.price} €</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => {
              addToCart(product);
              toast.success("Ajoute au panier");
            }}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90 transition-opacity"
            aria-label={`Ajouter ${product.name} au panier`}
            title="Ajouter au panier"
          >
            <ShoppingBag size={16} />
          </button>
          <button
            onClick={() => {
              setCart([{ ...product, quantity: 1 }]);
              toast.success("Achat direct", { description: "Redirection vers checkout" });
              router.push("/checkout");
            }}
            className="px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
