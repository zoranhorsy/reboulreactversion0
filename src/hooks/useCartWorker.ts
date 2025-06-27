import { useCallback, useState } from "react";

// Types alignés avec ceux du CartContext
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    colorLabel: string;
    stock: number;
  };
}

type CartOptions = {
  shippingMethod?: "standard" | "express" | "pickup";
  discountCode?: string;
};

export interface CartTotal {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export function useCartWorker() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateShipping = useCallback(
    (subtotal: number, method?: string): number => {
      // Convertir le subtotal en centimes pour correspondre à la logique de route.ts
      const subtotalInCents = subtotal * 100;

      switch (method) {
        case "express":
          return 9.9; // 990 centimes = 9.90€
        case "pickup":
          return 0;
        case "standard":
        default:
          // Livraison standard gratuite à partir de 200€
          return subtotalInCents >= 20000 ? 0 : 5.9; // 590 centimes = 5.90€
      }
    },
    [],
  );

  const calculateDiscount = useCallback(
    (subtotal: number, code?: string): number => {
      if (!code) return 0;

      switch (code.toUpperCase()) {
        case "WELCOME10":
          return subtotal * 0.1;
        case "SUMMER20":
          return subtotal * 0.2;
        case "REBOUL25":
          return subtotal * 0.25;
        case "FREE50":
          // Si le sous-total est >= 50€, on offre les frais de port standard (5.90€)
          return subtotal >= 50 ? 5.9 : 0;
        default:
          return 0;
      }
    },
    [],
  );

  const calculateCartTotals = useCallback(
    async (
      items: CartItem[],
      options: CartOptions = {},
    ): Promise<CartTotal> => {
      console.log("CartWorker - Calculating totals:", { items, options });

      try {
        setIsLoading(true);
        setError(null);

        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const shipping = calculateShipping(subtotal, options.shippingMethod);
        const discount = calculateDiscount(subtotal, options.discountCode);

        const result = {
          subtotal,
          shipping,
          discount,
          total: subtotal + shipping - discount,
          itemCount,
        };

        console.log("CartWorker - Calculation result:", result);
        return result;
      } catch (error) {
        console.error("CartWorker - Error during calculation:", error);
        setError(error instanceof Error ? error.message : "Erreur de calcul");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [calculateShipping, calculateDiscount],
  );

  return { calculateCartTotals, isLoading, error };
}
