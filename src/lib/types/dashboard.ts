export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
}

export interface WeeklySales {
  date: string;
  total: number;
}
