"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  fetchUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
} from "@/lib/api";

export function ShippingAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
  });
  const { toast } = useToast();

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const addresses = await fetchUserAddresses();
      setAddresses(addresses);
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos adresses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = async () => {
    try {
      const address = await createAddress(newAddress);
      if (address) {
        setAddresses((prev) => [...prev, address]);
        setIsAddDialogOpen(false);
        setNewAddress({
          street: "",
          city: "",
          postal_code: "",
          country: "",
          phone: "",
        });
        toast({
          title: "Adresse ajoutée",
          description: "Votre nouvelle adresse a été ajoutée avec succès.",
        });
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Erreur",
        description: "Impossible d&apos;ajouter l&apos;adresse.",
        variant: "destructive",
      });
    }
  };

  const handleEditAddress = async () => {
    if (!currentAddress) return;

    try {
      const updated = await updateAddress(currentAddress.id, currentAddress);
      if (updated) {
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === updated.id ? updated : addr)),
        );
        setIsEditDialogOpen(false);
        toast({
          title: "Adresse mise à jour",
          description: "Votre adresse a été mise à jour avec succès.",
        });
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l&apos;adresse.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast({
        title: "Adresse supprimée",
        description: "L&apos;adresse a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l&apos;adresse.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/4 bg-primary/5 rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-primary/5 rounded" />
                <div className="h-4 w-2/4 bg-primary/5 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mes adresses de livraison</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <span>+</span>
              Ajouter une adresse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une adresse</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rue</Label>
                <Input
                  id="street"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={newAddress.postal_code}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      postal_code: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={newAddress.country}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleAddAddress}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Adresse de livraison</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentAddress(address);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <span>✏️</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span>🗑️</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. L&apos;adresse
                          sera définitivement supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAddress(address.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{address.street}</p>
                <p>
                  {address.postal_code} {address.city}
                </p>
                <p>{address.country}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;adresse</DialogTitle>
          </DialogHeader>
          {currentAddress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-street">Rue</Label>
                <Input
                  id="edit-street"
                  value={currentAddress.street}
                  onChange={(e) =>
                    setCurrentAddress((prev) =>
                      prev ? { ...prev, street: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ville</Label>
                <Input
                  id="edit-city"
                  value={currentAddress.city}
                  onChange={(e) =>
                    setCurrentAddress((prev) =>
                      prev ? { ...prev, city: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-postal_code">Code postal</Label>
                <Input
                  id="edit-postal_code"
                  value={currentAddress.postal_code}
                  onChange={(e) =>
                    setCurrentAddress((prev) =>
                      prev ? { ...prev, postal_code: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Pays</Label>
                <Input
                  id="edit-country"
                  value={currentAddress.country}
                  onChange={(e) =>
                    setCurrentAddress((prev) =>
                      prev ? { ...prev, country: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={currentAddress.phone}
                  onChange={(e) =>
                    setCurrentAddress((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null,
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleEditAddress}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
