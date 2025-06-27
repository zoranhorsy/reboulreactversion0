# Intégration Frontend - Stripe

## Vue d'Ensemble

Cette documentation couvre l'intégration frontend de Stripe dans l'application Reboul E-commerce, incluant les composants, les pages de checkout et la gestion du panier.

## Composants Stripe

### 1. StripeProvider

```typescript
// components/stripe/StripeProvider.tsx
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

### 2. BuyNowButton

```typescript
// components/stripe/BuyNowButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface BuyNowButtonProps {
  productId: string;
  variant?: {
    size?: string;
    color?: string;
  };
  className?: string;
}

export function BuyNowButton({ productId, variant, className }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variant,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Chargement...' : 'Acheter maintenant'}
    </Button>
  );
}
```

## Pages de Checkout

### 1. Page de Checkout

```typescript
// pages/checkout/index.tsx
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/create-cart-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          cart_id: `cart-${Date.now()}`,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.price} EUR</span>
          </div>
        ))}
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{total} EUR</span>
          </div>
        </div>
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Chargement...' : 'Procéder au paiement'}
        </Button>
      </div>
    </div>
  );
}
```

### 2. Pages de Succès et d'Annulation

```typescript
// pages/checkout/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const { session_id } = router.query;
    if (session_id) {
      // Récupérer les détails de la commande
      fetch(`/api/checkout/session/${session_id}`)
        .then((res) => res.json())
        .then((data) => setOrderDetails(data));
    }
  }, [router.query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Commande Confirmée !</h1>
        <p className="mb-8">Merci pour votre achat.</p>
        {orderDetails && (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Détails de la commande</h2>
            {/* Afficher les détails de la commande */}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Gestion du Panier

### 1. Hook useCart

```typescript
// hooks/useCart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.variant === item.variant
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.variant === item.variant
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### 2. Composant CartSheet

```typescript
// components/cart/CartSheet.tsx
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const { items, removeItem, updateQuantity, total } = useCart();

  const handleCheckout = async () => {
    // Logique de checkout
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panier</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.variant?.size} - {item.variant?.color}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button onClick={() => removeItem(item.id)}>×</button>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{total} EUR</span>
            </div>
          </div>
          <Button onClick={handleCheckout} className="w-full">
            Procéder au paiement
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

## Bonnes Pratiques

1. **Performance**
   - Utiliser le lazy loading pour les composants Stripe
   - Optimiser les requêtes API
   - Mettre en cache les sessions de paiement

2. **Expérience Utilisateur**
   - Afficher des états de chargement
   - Gérer les erreurs de manière élégante
   - Fournir des retours visuels clairs

3. **Sécurité**
   - Ne jamais exposer les clés API
   - Valider les données côté client
   - Utiliser HTTPS

## Dépannage

### Problèmes Courants

1. **Erreurs de Chargement**
   - Vérifier la configuration de Stripe
   - S'assurer que les clés API sont correctes
   - Vérifier la connexion internet

2. **Problèmes de Session**
   - Vérifier les URLs de redirection
   - S'assurer que les sessions sont valides
   - Vérifier les timeouts

3. **Erreurs de Paiement**
   - Vérifier les cartes de test
   - S'assurer que les montants sont corrects
   - Vérifier les restrictions de pays 