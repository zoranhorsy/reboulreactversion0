"use client";

import { useState } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/components/cart/CartItem";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import CheckoutButton from "@/components/cart/CheckoutButton";

export function Cart() {
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart();
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const { toast } = useToast();

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 100 ? 0 : 5.99;
  const totalSavings = discount + (subtotal > 100 ? 5.99 : 0);
  const finalTotal = subtotal - discount + shippingCost;

  const applyPromoCode = () => {
    // Simuler l'application d'un code promo
    if (promoCode.toLowerCase() === "reboul10") {
      const newDiscount = subtotal * 0.1;
      setDiscount(newDiscount);
      toast({
        title: "Code promo appliqué",
        description: `Vous avez économisé ${newDiscount.toFixed(2)} €`,
      });
    } else {
      toast({
        title: "Code promo invalide",
        description: "Le code promo entré n'est pas valide.",
        variant: "destructive",
      });
    }
    setPromoCode("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <p className="mb-4">
          Ajoutez des articles à votre panier pour commencer vos achats.
        </p>
        <Link href="/catalogue">
          <Button>Continuer mes achats</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Votre panier</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              _id={Number.parseInt(item.id, 10)}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              image={item.image || "/placeholder.png"}
              variant={item.variant || { size: "", color: "", stock: 999 }}
              onRemove={() => removeItem(item.id)}
              onUpdateQuantity={(quantity) => {
                try {
                  updateQuantity(item.id, quantity);
                } catch (error) {
                  toast({
                    title: "Stock insuffisant",
                    description:
                      error instanceof Error
                        ? error.message
                        : "Erreur de mise à jour de la quantité",
                    variant: "destructive",
                  });
                }
              }}
            />
          ))}
        </div>
        <div className="md:col-span-1">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Résumé de la commande
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de livraison:</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction:</span>
                  <span>-{discount.toFixed(2)} €</span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Économies totales:</span>
                  <span>{totalSavings.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{finalTotal.toFixed(2)} €</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button onClick={applyPromoCode}>Appliquer</Button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Vider le panier
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
