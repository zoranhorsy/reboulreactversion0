// Types
type CartItem = {
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
};

type CartOptions = {
  shippingMethod?: 'standard' | 'express' | 'pickup';
  discountCode?: string;
};

type CartTotal = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
};

type CartMessage = {
  type: 'CALCULATE_TOTAL';
  items: CartItem[];
  options: CartOptions;
};

// Fonctions de calcul
function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function calculateShipping(subtotal: number, method?: string): number {
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

function calculateDiscount(subtotal: number, code?: string): number {
  if (!code) return 0;
  
  // Codes promo disponibles
  switch (code.toUpperCase()) {
    case 'WELCOME10':
      return subtotal * 0.1;
    case 'SUMMER20':
      return subtotal * 0.2;
    case 'REBOUL25':
      return subtotal * 0.25;
    case 'FREE50':
      return subtotal >= 50 ? 8 : 0; // Livraison gratuite au-dessus de 50€
    default:
      return 0;
  }
}

function calculateTotal(items: CartItem[], options: CartOptions): CartTotal {
  const subtotal = calculateSubtotal(items);
  const itemCount = calculateItemCount(items);
  const shipping = calculateShipping(subtotal, options.shippingMethod);
  const discount = calculateDiscount(subtotal, options.discountCode);
  
  return {
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
    itemCount
  };
}

// Gestionnaire de messages
self.onmessage = (event: MessageEvent) => {
  const message = event.data;

  try {
    if (message.type === 'CALCULATE_TOTAL') {
      const result = calculateTotal(message.items, message.options);
      self.postMessage({ type: 'CALCULATE_SUCCESS', result });
    } else {
      self.postMessage({ type: 'ERROR', error: 'Type de message non supporté' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
}; 