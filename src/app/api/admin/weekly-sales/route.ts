import { NextResponse } from 'next/server';
import { SalesData } from '@/app/api/admin/api';

export async function GET() {
    // Ici, vous devriez normalement récupérer ces données depuis votre base de données
    const weeklySales: SalesData[] = [
        { name: "Lun", sales: 1000 },
        { name: "Mar", sales: 1200 },
        { name: "Mer", sales: 900 },
        { name: "Jeu", sales: 1500 },
        { name: "Ven", sales: 2000 },
        { name: "Sam", sales: 2200 },
        { name: "Dim", sales: 1800 },
    ];

    return NextResponse.json(weeklySales);
}

