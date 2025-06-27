"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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

  const addItem = useCallback((item: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);
      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
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
