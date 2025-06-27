"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ShoppingCart, X, Minus, Plus } from "lucide-react"

interface CartSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ children, isOpen, onOpenChange }: CartSheetProps) {
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    totalPrice,
  } = useCart();
  const { toast } = useToast();
  const [promos, setPromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const hasLoadedPromos = useRef(false);
  const isMounted = useRef(false);

  // Log des valeurs du panier
  useEffect(() => {
    console.log("CartSheet - Cart values:", {
      cartItems,
      subtotal,
      shipping,
      totalPrice,
    });
  }, [cartItems, subtotal, shipping, totalPrice]);

  // Log de l'état du composant
  useEffect(() => {
    console.log("CartSheet - Component state:", {
      isOpen,
      loadingPromos,
      isCheckoutLoading,
      hasLoadedPromos: hasLoadedPromos.current,
      isMounted: isMounted.current,
    });
  }, [isOpen, loadingPromos, isCheckoutLoading]);

  // Memoize les données du panier pour éviter les re-renders inutiles
  const cartData = useMemo(() => {
    console.log("CartSheet - Recalculating cartData");
    return {
      items: cartItems,
      subtotal,
      shipping,
      totalPrice,
    };
  }, [cartItems, subtotal, shipping, totalPrice]);

  // Fonction pour fermer le panier
  const closeCart = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  // Initialisation unique
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Gestion optimisée des promos avec useCallback
  const loadPromos = useCallback(async () => {
    if (
      !isMounted.current ||
      loadingPromos ||
      !isOpen ||
      hasLoadedPromos.current
    )
      return;

    try {
      setLoadingPromos(true);
      const response = await fetch("/api/promos");
      const data = await response.json();

      if (isMounted.current) {
        setPromos(data.promos || []);
        hasLoadedPromos.current = true;
      }
    } catch (error) {
      console.error("Erreur lors du chargement des promos:", error);
      if (isMounted.current) {
        setPromos([]);
      }
    } finally {
      if (isMounted.current) {
        setLoadingPromos(false);
      }
    }
  }, [isOpen, loadingPromos]);

  // Effet pour gérer le chargement des promos
  useEffect(() => {
    if (isOpen) {
      loadPromos();
    } else {
      hasLoadedPromos.current = false;
      setPromos([]);
      setLoadingPromos(false);
    }
  }, [isOpen, loadPromos]);

  // Fonction pour gérer le checkout
  const handleCheckout = useCallback(async () => {
    if (!isMounted.current || cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description:
          "Votre panier est vide. Ajoutez des produits avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    if (isCheckoutLoading) return;

    setIsCheckoutLoading(true);

    try {
      const cartItemsForApi = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variant: {
          size: item.variant.size,
          color: item.variant.color,
          colorLabel: item.variant.colorLabel || item.variant.color,
          stock: item.variant.stock,
        },
      }));

      let userEmail = "zoran@reboul.com"; // Email par défaut

      try {
        const stripeEmails = localStorage.getItem("stripe_user_emails");
        const userProfile = localStorage.getItem("user_profile");

        if (stripeEmails) {
          const emails = JSON.parse(stripeEmails);
          if (Array.isArray(emails) && emails.length > 0) {
            userEmail = emails[0];
          }
        } else if (userProfile) {
          const profile = JSON.parse(userProfile);
          if (profile?.email) {
            userEmail = profile.email;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'email:", error);
      }

      const response = await axios.post("/api/checkout/create-cart-session", {
        items: cartItemsForApi,
        cart_id: `cart-${Date.now()}`,
        shipping_method: "standard",
        force_user_email: userEmail,
      });

      if (response.data?.url) {
        if (response.data.id && isMounted.current) {
          localStorage.setItem("lastStripeSession", response.data.id);
          closeCart();
          window.location.href = response.data.url;
        }
      } else {
        throw new Error("URL de paiement non trouvée dans la réponse");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création de la session de paiement:",
        error,
      );

      if (isMounted.current) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.error
            ? error.response.data.error
            : error instanceof Error
              ? error.message
              : "Une erreur est survenue lors de la préparation du paiement.";

        toast({
          title: "Erreur de paiement",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsCheckoutLoading(false);
      }
    }
  }, [cartItems, closeCart, toast, isCheckoutLoading]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 shadow-xl border-0" side="right">
        <Card className="border shadow-lg rounded-lg overflow-hidden bg-background">
          <CardHeader className="px-6 py-4 border-b bg-background/50">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Votre panier</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                onClick={closeCart}
              >
                <X className="text-lg" />
              </Button>
            </CardTitle>
          </CardHeader>

          {cartItems.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="font-medium mb-3 text-center text-foreground">Votre panier est vide</p>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Ajoutez des articles pour les retrouver ici
              </p>
              <Button asChild onClick={closeCart} className="w-full rounded-xl py-2.5">
                <Link href="/catalogue">Continuer mes achats</Link>
              </Button>
            </CardContent>
          ) : (
            <>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl hover:bg-accent/30 transition-colors border border-transparent hover:border-accent/50"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="64px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Ligne 1: Nom + bouton suppression */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-sm text-foreground leading-relaxed flex-1 pr-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 flex-shrink-0 ml-2"
                            title="Supprimer cet article"
                          >
                            <X className="text-sm" />
                          </button>
                        </div>

                        {/* Ligne 2: Variantes (si présentes) */}
                        {(item.variant?.size || item.variant?.color) && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <div className="flex flex-wrap gap-2">
                              {item.variant.size && (
                                <span className="font-medium text-foreground bg-accent/30 px-2 py-1 rounded text-xs">
                                  Taille: {item.variant.size}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="font-medium text-foreground bg-accent/30 px-2 py-1 rounded text-xs">
                                  Couleur: {item.variant.colorLabel || item.variant.color}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Ligne 3: Prix seul */}
                        <div className="mb-3">
                          <div className="font-bold text-base text-foreground">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format(item.price * item.quantity)}
                          </div>
                        </div>

                        {/* Ligne 4: Contrôles de quantité */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Quantité:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg border-accent/50 hover:bg-accent/50"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                            >
                              <Minus className="text-sm" />
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center text-foreground bg-accent/20 py-1 rounded">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg border-accent/50 hover:bg-accent/50"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={
                                item.quantity >= (item.variant?.stock || 99)
                              }
                            >
                              <Plus className="text-sm" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 border-t bg-background/50">
                {/* Section des totaux */}
                <div className="w-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Frais de livraison
                      </span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(shipping)}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between font-semibold text-base">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Section des boutons - bien séparée */}
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckoutLoading || cartItems.length === 0}
                      className="w-full rounded-xl py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      {isCheckoutLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                          <span>Préparation...</span>
                        </div>
                      ) : (
                        "Passer à la caisse"
                      )}
                    </Button>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl py-2.5 border-accent/50 hover:bg-accent/50"
                        onClick={closeCart}
                      >
                        Continuer
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl py-2.5 border-accent/50 hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          clearCart();
                          toast({
                            title: "Panier vidé",
                            description: "Tous les articles ont été supprimés",
                          });
                        }}
                      >
                        Vider
                      </Button>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
