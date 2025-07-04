"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, X, Minus, Plus, ArrowLeft, ShoppingBag, CreditCard, Shield, Truck } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function PanierPage() {
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
  const router = useRouter();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Fonction pour gérer le checkout
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide. Ajoutez des produits avant de continuer.",
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
        if (response.data.id) {
          localStorage.setItem("lastStripeSession", response.data.id);
          window.location.href = response.data.url;
        }
      } else {
        throw new Error("URL de paiement non trouvée dans la réponse");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session de paiement:", error);

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
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [cartItems, toast, isCheckoutLoading]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Mon Panier</h1>
            </div>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                clearCart();
                toast({
                  title: "Panier vidé",
                  description: "Tous les articles ont été supprimés",
                });
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              Vider le panier
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Panier vide */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Découvrez nos produits et ajoutez-les à votre panier pour commencer vos achats.
            </p>
            <Button asChild className="px-8 py-3">
              <Link href="/catalogue">Découvrir nos produits</Link>
            </Button>
          </div>
        ) : (
          /* Panier avec articles */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Articles ({cartItems.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl hover:bg-accent/30 transition-colors border border-transparent hover:border-accent/50"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-foreground leading-tight flex-1 pr-2">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10 flex-shrink-0"
                            title="Supprimer cet article"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variantes */}
                        {(item.variant?.size || item.variant?.color) && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <div className="flex flex-wrap gap-2">
                              {item.variant.size && (
                                <span className="bg-accent/30 px-2 py-1 rounded text-xs">
                                  Taille: {item.variant.size}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="bg-accent/30 px-2 py-1 rounded text-xs">
                                  {item.variant.colorLabel || item.variant.color}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Contrôles de quantité */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.variant?.stock || 99)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Prix */}
                          <div className="text-right">
                            <div className="font-semibold text-foreground">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(item.price * item.quantity)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(item.price)} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Récapitulatif de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Détail des articles */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Sous-total ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(subtotal)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Livraison standard</span>
                        </div>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600 font-semibold">Gratuite</span>
                          ) : (
                            new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format(shipping)
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA (20%)</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(totalPrice * 0.2 / 1.2)}
                        </span>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total TTC</span>
                      <span className="text-primary">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Bouton Payer avec Stripe */}
                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckoutLoading || cartItems.length === 0}
                      className="w-full py-4 bg-[#635BFF] hover:bg-[#5851DB] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                    >
                      {isCheckoutLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Préparation...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <span>Payer avec Stripe</span>
                          <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" />
                            <span>Sécurisé</span>
                          </div>
                        </div>
                      )}
                    </Button>

                    {/* Informations de sécurité */}
                    <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-foreground">Paiement 100% sécurisé</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vos données sont protégées par le chiffrement SSL et Stripe.
                        Nous ne stockons jamais vos informations de paiement.
                      </p>
                    </div>

                    {/* Bouton continuer les achats */}
                    <Button
                      variant="outline"
                      asChild
                      className="w-full py-3"
                    >
                      <Link href="/catalogue">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continuer mes achats
                      </Link>
                    </Button>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3" />
                        <span>Livraison sous 2-3 jours ouvrés</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>Garantie satisfaction ou remboursé</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        <span>Paiement en 3x sans frais disponible</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 