import { NextResponse } from 'next/server';
import { fetchOrders, updateProductStock, createOrder, updateOrderStatus } from '@/lib/api';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    variant: {
        size: string;
        color: string;
    };
}

interface Order {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
}

export async function GET() {
    console.log('GET /api/admin/orders called');
    try {
        const orders = await fetchOrders();
        console.log('Fetched orders:', orders);
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newOrder: Order = await request.json();

        if (!newOrder.id || !newOrder.date || !newOrder.customer || !newOrder.total || !newOrder.status || !newOrder.items) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        // Mise à jour du stock pour chaque article de la commande
        for (const item of newOrder.items) {
            try {
                await updateProductStock(item.productId, item.quantity, item.variant);
            } catch (error) {
                console.error(`Failed to update stock for product ${item.productId}:`, error);
                return NextResponse.json({ error: `Failed to update stock for product ${item.name}` }, { status: 500 });
            }
        }

        const createdOrder = await createOrder(newOrder);
        console.log('New order added:', createdOrder);

        return NextResponse.json(createdOrder, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { orderId, status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        const updatedOrder = await updateOrderStatus(orderId, status as OrderStatus);

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('Order updated:', updatedOrder);

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error in PATCH /api/admin/orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

