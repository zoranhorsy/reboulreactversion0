import { type AxiosInstance } from "axios";
import { type Cart } from "../types/cart";

export class CartService {
  constructor(private readonly instance: AxiosInstance) {}

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    try {
      const response = await this.instance.post("/cart", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async removeFromCart(productId: string): Promise<Cart> {
    try {
      const response = await this.instance.delete(`/cart/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  async fetchCart(): Promise<Cart> {
    try {
      const response = await this.instance.get("/cart");
      return response.data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }
}
