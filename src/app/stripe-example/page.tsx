"use client";

import React, { useState } from "react";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import BuyNowButton from "@/components/BuyNowButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const viewport: Viewport = defaultViewport;

export default function StripeExamplePage() {
  const [productId, setProductId] = useState("1");
  const [quantity, setQuantity] = useState(1);

  // Liste de produits d'exemple
  const exampleProducts = [
    { id: "1", name: "T-shirt Reboul Classic", price: 29.99 },
    { id: "2", name: "Sneakers Air Max", price: 129.99 },
    { id: "3", name: "Casquette The Corner", price: 24.99 },
    { id: "4", name: "Hoodie Premium", price: 69.99 },
  ];

  const selectedProduct = exampleProducts.find((p) => p.id === productId);

  return (
    <ClientPageWrapper>
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Exemple d&apos;intégration Stripe
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Simulateur d&apos;achat</CardTitle>
              <CardDescription>
                Testez le bouton d&apos;achat rapide qui génère un lien de
                paiement Stripe à la volée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="product">Produit</Label>
                <Select
                  value={productId}
                  onValueChange={(value) => setProductId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {exampleProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price.toFixed(2)} €
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {selectedProduct && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Prix unitaire:</span>
                    <span>{selectedProduct.price.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span>Quantité:</span>
                    <span>{quantity}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {(selectedProduct.price * quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter></CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guide d&apos;implémentation</CardTitle>
              <CardDescription>
                Comment intégrer le bouton d&apos;achat rapide dans votre
                application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  1. Importez le composant
                </h3>
                <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                  {`import BuyNowButton from '@/components/BuyNowButton';`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  2. Utilisez le composant
                </h3>
                <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                  {``}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  3. Propriétés disponibles
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <code className="text-xs">productId</code> (obligatoire): ID
                    du produit à acheter
                  </li>
                  <li>
                    <code className="text-xs">quantity</code> (défaut: 1):
                    Quantité à acheter
                  </li>
                  <li>
                    <code className="text-xs">label</code> (défaut:
                    &quot;Acheter maintenant&quot;): Texte du bouton
                  </li>
                  <li>
                    <code className="text-xs">className</code>: Classes CSS
                    additionnelles
                  </li>
                  <li>
                    <code className="text-xs">size</code> (défaut:
                    &quot;md&quot;): Taille du bouton (sm, md, lg)
                  </li>
                  <li>
                    <code className="text-xs">variant</code> (défaut:
                    &quot;default&quot;): Style du bouton (default, outline,
                    ghost)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted p-6 rounded-lg mt-8">
          <h2 className="text-xl font-bold mb-4">Comment ça fonctionne</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Le bouton envoie une requête à l&apos;API route{" "}
              <code>/api/stripe-links/create-payment-link</code>
            </li>
            <li>
              L&apos;API récupère les informations du produit et crée une
              session Stripe Checkout
            </li>
            <li>Le client est redirigé vers la page de paiement Stripe</li>
            <li>
              Après le paiement, le client est redirigé vers la page de succès
              ou d&apos;annulation
            </li>
            <li>
              La page de succès vérifie le statut du paiement via{" "}
              <code>/api/stripe-links/check-session</code>
            </li>
          </ol>

          <div className="flex justify-center mt-6">
            <span className="text-sm text-muted-foreground">
              Cette implémentation utilise les API routes Next.js pour interagir
              avec Stripe
            </span>
          </div>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
