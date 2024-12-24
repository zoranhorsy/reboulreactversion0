import { NextResponse } from 'next/server';
import { Order } from '@/app/api/admin/api';

export async function GET() {
    // Ici, vous devriez normalement récupérer ces données depuis votre base de données
    const recentOrders: Order[] = [
        { id: 1, customer: "John Doe", total: 150, status: "Livré", date: "2023-06-15" },
        { id: 2, customer: "Jane Smith", total: 200, status: "En cours", date: "2023-06-16" },
        { id: 3, customer: "Bob Johnson", total: 100, status: "En attente", date: "2023-06-17" },
    ];

    return NextResponse.json(recentOrders);
}

