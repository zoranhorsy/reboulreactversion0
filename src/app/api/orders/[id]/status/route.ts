import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/api'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    console.log(`API: Updating status for order with ID: ${id}`)
    try {
        const { status } = await request.json()
        const updatedOrder = await updateOrderStatus(id, status)

        if (updatedOrder) {
            console.log(`API: Order status updated:`, updatedOrder)
            return NextResponse.json(updatedOrder)
        } else {
            console.log(`API: Order not found for ID: ${id}`)
            return new NextResponse(JSON.stringify({ error: 'Order not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    } catch (error) {
        console.error('API: Error updating order status:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

