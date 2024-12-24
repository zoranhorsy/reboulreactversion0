import { NextResponse } from 'next/server';
import { updateProduct, getProductById, Product } from '@/lib/api';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export type Order = {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: OrderStatus;
    items: { productId: string; name: string; quantity: number; price: number; variant: { size: string; color: string } }[];
};

let orders: Order[] = [];

export async function GET() {
    const sortedOrders = orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(sortedOrders);
}

export async function POST(request: Request) {
    try {
        const newOrder: Order = await request.json();

        if (!newOrder.id || !newOrder.date || !newOrder.customer || !newOrder.total || !newOrder.status || !newOrder.items) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        // Vérifier et mettre à jour le stock pour chaque article
        for (const item of newOrder.items) {
            const product = await getProductById(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
            }

            const variant = product.variants.find(v => v.size === item.variant.size && v.color === item.variant.color);
            if (!variant) {
                return NextResponse.json({ error: `Variant not found for product: ${item.name}` }, { status: 400 });
            }

            if (variant.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for product: ${item.name}` }, { status: 400 });
            }

            // Mise à jour du stock
            variant.stock -= item.quantity;
            await updateProduct(product.id, { variants: product.variants });
        }

        orders.unshift(newOrder);
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const { orderId, status } = await request.json();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        return NextResponse.json(order);
    }
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
}

