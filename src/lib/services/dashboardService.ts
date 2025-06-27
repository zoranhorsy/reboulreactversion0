import { type AxiosInstance } from "axios";
import {
  type DashboardStats,
  type TopProduct,
  type WeeklySales,
} from "../types/dashboard";

export class DashboardService {
  constructor(private readonly instance: AxiosInstance) {}

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.instance.get("/admin/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
      };
    }
  }

  async fetchTopProducts(): Promise<TopProduct[]> {
    try {
      const response = await this.instance.get("/admin/dashboard/top-products");
      return response.data;
    } catch (error) {
      console.error("Error fetching top products:", error);
      return [];
    }
  }

  async fetchWeeklySales(): Promise<WeeklySales[]> {
    try {
      const response = await this.instance.get("/admin/dashboard/weekly-sales");
      return response.data;
    } catch (error) {
      console.error("Error fetching weekly sales:", error);
      return [];
    }
  }
}
