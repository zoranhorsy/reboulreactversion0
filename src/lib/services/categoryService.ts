import { type AxiosInstance } from "axios";
import { type Category } from "../types/category";
import { type Brand } from "../types/brand";

export class CategoryService {
  constructor(private instance: AxiosInstance) {}

  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await this.instance.get("/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await this.instance.post("/categories", { name });
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    try {
      const response = await this.instance.put(`/categories/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await this.instance.delete(`/categories/${id}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  async fetchBrands(): Promise<Brand[]> {
    try {
      const response = await this.instance.get("/brands");
      return response.data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  }

  async createBrand(name: string): Promise<Brand> {
    try {
      const response = await this.instance.post("/brands", { name });
      return response.data;
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  }
}
