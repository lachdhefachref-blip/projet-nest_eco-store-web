import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner";
import { ShoppingBag, Heart, Star, Send } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { addToCart, setCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api(`/products/${id}`);
      return { ...res.product, id: res.product._id };
    },
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    enabled: Boolean(id),
    queryFn: () => api(`/reviews/product/${id}`),
  });
  const reviews = reviewsData || [];

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api("/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          rating,
          comment: comment.trim(),
        }),
      });
      toast.success("Avis ajouté !");
      setComment("");
      refetchReviews();
    } catch (err) {
      toast.error("Veuillez vous connecter pour laisser un avis");
    }
  };

  const product = useMemo(() => data, [data]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-muted-foreground mb-4">Produit introuvable.</p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Continuer les achats
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </motion.div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">{product.name}</h1>
          <p className="text-muted-foreground mt-2">{product.category}</p>

          <p className="font-display text-2xl font-semibold text-foreground mt-6">{product.price} €</p>

          <p className="text-sm text-muted-foreground mt-2">
            Stock: <span className="text-foreground font-medium">{product.stock}</span>
          </p>

          <p className="text-foreground/90 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => toggleWishlist(product)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium transition-colors ${
                isInWishlist(product.id) ? "text-primary border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart size={16} className={isInWishlist(product.id) ? "fill-current" : ""} />
              {isInWishlist(product.id) ? "Dans les favoris" : "Ajouter aux favoris"}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-2 gap-4 py-8 border-y border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Évaluation</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-medium">{product.rating || "N/A"}</span>
                <span className="text-xs text-muted-foreground">({product.ratingsCount || 0} avis)</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ventes</p>
              <p className="font-medium mt-1">{product.soldCount || 0} vendus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20">
        <h2 className="font-display text-2xl font-semibold mb-8">Avis clients</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-xl border border-border bg-card sticky top-24">
              <h3 className="font-semibold mb-4">Laisser un avis</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-muted-foreground">Note</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star className={`w-6 h-6 ${s <= rating ? "fill-primary text-primary" : "text-muted border-none"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-muted-foreground">Commentaire</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    rows={4}
                    placeholder="Qu'en avez-vous pensé ?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Send size={14} />
                  Envoyer
                </button>
              </form>
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center border border-dashed border-border rounded-xl">
                Soyez le premier à donner votre avis sur ce produit !
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {rev.userName?.[0] || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{rev.userName || "Utilisateur"}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-primary text-primary" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

