import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User, MapPin, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    zipCode: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api("/users/me/address", {
        method: "POST",
        body: JSON.stringify(newAddress),
      });
      setAddresses(res.addresses);
      setUser({ ...user, addresses: res.addresses });
      setShowAdd(false);
      setNewAddress({ name: "", street: "", city: "", zipCode: "", phone: "", isDefault: false });
      toast.success("Adresse ajoutée");
    } catch (err) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const removeAddress = async (id) => {
    try {
      const res = await api(`/users/me/address/${id}`, { method: "DELETE" });
      setAddresses(res.addresses);
      setUser({ ...user, addresses: res.addresses });
      toast.success("Adresse supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <div className="flex flex-col md:flex-row gap-10">
        {/* User Info */}
        <div className="md:w-1/3">
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{user?.email}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Compte vérifié
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {addresses.length} adresses
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="md:flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-2xl font-semibold">Mes Adresses</h1>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAddAddress} className="mb-8 p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1 uppercase text-muted-foreground">Nom complet</label>
                  <input
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
                    placeholder="Ex: Domicile, Travail..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1 uppercase text-muted-foreground">Rue</label>
                  <input
                    required
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 uppercase text-muted-foreground">Ville</label>
                  <input
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 uppercase text-muted-foreground">Code Postal</label>
                  <input
                    required
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1 uppercase text-muted-foreground">Téléphone</label>
                  <input
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.length === 0 ? (
              <p className="col-span-full text-muted-foreground text-center py-12 border border-dashed border-border rounded-xl">
                Aucune adresse enregistrée.
              </p>
            ) : (
              addresses.map((addr) => (
                <div key={addr._id} className="p-5 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow relative group">
                  <h3 className="font-semibold text-foreground mb-1">{addr.name}</h3>
                  <p className="text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.zipCode} {addr.city}</p>
                  <p className="text-sm text-muted-foreground mt-2">{addr.phone}</p>
                  
                  <button
                    onClick={() => removeAddress(addr._id)}
                    className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
