import { NextResponse } from 'next/server';
import { DashboardStats } from '@/app/api/admin/api';

export async function GET() {
    // Ici, vous devriez normalement récupérer ces données depuis votre base de données
    const stats: DashboardStats = {
        totalSales: 150000,
        totalOrders: 500,
        totalProducts: 100,
        averageOrderValue: 300,
        conversionRate: 3.5
    };

    return NextResponse.json(stats);
}

