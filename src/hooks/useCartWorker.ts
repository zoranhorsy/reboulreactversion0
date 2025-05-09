import { useCallback, useEffect, useRef, useState } from 'react';

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
  shippingMethod?: 'standard' | 'express' | 'pickup';
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
  const workerRef = useRef<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si Window est disponible (côté client uniquement)
    if (typeof window !== 'undefined') {
      try {
        // Initialisation du worker
        workerRef.current = new Worker('/workers/cartWorker.js');
        
        console.log('CartWorker initialized successfully');
      } catch (err) {
        console.error('Failed to initialize CartWorker:', err);
        setError('Impossible d\'initialiser le worker de calcul du panier');
      }
    }

    // Nettoyage
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateCartTotals = useCallback(async (items: CartItem[], options: CartOptions = {}) => {
    if (!workerRef.current) {
      console.warn('Worker non initialisé, utilisation du calcul synchrone');
      // Calcul de secours côté UI si le worker n'est pas disponible
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const shipping = calculateShippingFallback(subtotal, options.shippingMethod);
      const discount = calculateDiscountFallback(subtotal, options.discountCode);
      
      return {
        subtotal,
        shipping,
        discount,
        total: subtotal + shipping - discount,
        itemCount
      };
    }

    setIsLoading(true);
    setError(null);

    return new Promise<CartTotal>((resolve, reject) => {
      const messageHandler = (e: MessageEvent) => {
        if (e.data.type === 'CALCULATE_SUCCESS') {
          setIsLoading(false);
          resolve(e.data.result);
        } else if (e.data.type === 'ERROR') {
          setIsLoading(false);
          setError(e.data.error);
          reject(new Error(e.data.error));
        }
      };

      workerRef.current?.addEventListener('message', messageHandler, { once: true });
      workerRef.current?.postMessage({
        type: 'CALCULATE_TOTAL',
        items,
        options,
      });
    });
  }, []);

  // Fonctions de secours au cas où le worker n'est pas disponible
  function calculateShippingFallback(subtotal: number, method?: string): number {
    switch (method) {
      case 'express':
        return subtotal > 100 ? 0 : 15;
      case 'pickup':
        return 0;
      case 'standard':
      default:
        return subtotal > 50 ? 0 : 8;
    }
  }

  function calculateDiscountFallback(subtotal: number, code?: string): number {
    if (!code) return 0;
    
    switch (code.toUpperCase()) {
      case 'WELCOME10':
        return subtotal * 0.1;
      case 'SUMMER20':
        return subtotal * 0.2;
      default:
        return 0;
    }
  }

  return {
    calculateCartTotals,
    isLoading,
    error,
  };
} 