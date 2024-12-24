import { NextResponse } from 'next/server';
import { Product } from '@/lib/api';

export async function GET() {
    // Ici, vous devriez normalement récupérer ces données depuis votre base de données
    const topProducts: Product[] = [
        { id: "1", name: "Produit 1", description: "Description 1", brand: "Marque 1", category: "Catégorie 1", price: 100, images: [], tags: [], variants: [] },
        { id: "2", name: "Produit 2", description: "Description 2", brand: "Marque 2", category: "Catégorie 2", price: 200, images: [], tags: [], variants: [] },
        { id: "3", name: "Produit 3", description: "Description 3", brand: "Marque 3", category: "Catégorie 3", price: 300, images: [], tags: [], variants: [] },
    ];

    return NextResponse.json(topProducts);
}

