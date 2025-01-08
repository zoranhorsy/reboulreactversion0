import { NextRequest, NextResponse } from 'next/server'
import { getOrders, createOrder } from '@/lib/api'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    try {
        const { orders, total } = await getOrders({ page, limit })
        return NextResponse.json({
            orders,
            total,
            page,
            limit
        })
    } catch (error) {
        console.error('API: Error fetching orders:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function POST(request: NextRequest) {
    try {
        const orderData = await request.json()
        const newOrder = await createOrder(orderData)
        return NextResponse.json(newOrder, { status: 201 })
    } catch (error) {
        console.error('API: Error creating order:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

