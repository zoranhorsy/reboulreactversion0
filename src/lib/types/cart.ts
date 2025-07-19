import { type Product } from "./product";

export interface CartItemVariant {
  size: string;
  color: string;
  colorLabel: string;
  stock: number;
}

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

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}
