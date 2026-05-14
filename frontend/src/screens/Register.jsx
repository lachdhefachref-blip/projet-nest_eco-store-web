import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, ...(isAdmin ? { role: "admin", adminCode } : {}) };
    void register(payload)
      .then(() => {
        toast.success("Compte créé");
        router.push("/");
      })
      .catch((err) => {
        toast.error(err.body?.message || err.message || "Erreur lors de l'inscription");
      });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Créer un compte</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Inscrivez-vous pour commencer vos achats.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="isAdmin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <label htmlFor="isAdmin" className="text-sm text-foreground">Register as admin</label>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Admin Code</label>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            S'inscrire
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
