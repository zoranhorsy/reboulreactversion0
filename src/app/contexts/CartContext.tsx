"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface CartItem {
  id: string;
  productId: string;
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
  storeType: "adult" | "sneakers" | "kids" | "the_corner";
}

export interface OrderDetails {
  id: string;
  date: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  items: CartItem[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  shipping: number;
  discount: number;
  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails) => void;
  clearLastOrder: () => void;
  itemCount: number;
  openCart: () => void;
  isCartLoading: boolean;
  applyDiscountCode: (code: string) => void;
  removeDiscountCode: () => void;
  setShippingMethod: (method: "standard" | "express" | "pickup") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrderState] = useState<OrderDetails | null>(null);

  // Charger les données du panier depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("reboul-cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  const saveCartToStorage = useCallback((cartItems: CartItem[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reboul-cart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier:", error);
      }
    }
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => 
        i.id === item.id && 
        i.variant.size === item.variant.size && 
        i.variant.color === item.variant.color
      );
      
      let newItems;
      if (existingItem) {
        newItems = currentItems.map((i) =>
          i.id === item.id && 
          i.variant.size === item.variant.size && 
          i.variant.color === item.variant.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      } else {
        newItems = [...currentItems, item];
      }
      
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [saveCartToStorage]);

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== itemId);
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [saveCartToStorage]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((currentItems) => {
      const newItems = currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item,
      ).filter((item) => item.quantity > 0);
      
      saveCartToStorage(newItems);
      return newItems;
    });
  }, [removeItem, saveCartToStorage]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("reboul-cart");
    }
  }, []);

  const setLastOrder = (order: OrderDetails) => {
    setLastOrderState(order);
  };

  const clearLastOrder = () => {
    setLastOrderState(null);
  };

  const openCart = () => {
    // Simple implementation
  };

  const applyDiscountCode = (code: string) => {
    // Simple implementation
  };

  const removeDiscountCode = () => {
    // Simple implementation
  };

  const setShippingMethod = (method: "standard" | "express" | "pickup") => {
    // Simple implementation
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 5.9;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems: itemCount,
    totalPrice: total,
    subtotal,
    shipping,
    discount,
    lastOrder,
    setLastOrder,
    clearLastOrder,
    itemCount,
    openCart,
    isCartLoading: false,
    applyDiscountCode,
    removeDiscountCode,
    setShippingMethod,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
