import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, deleteOrder } from '@/lib/api'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    console.log(`API: Fetching order with ID: ${id}`)
    try {
        const order = await getOrderById(id)

        if (order) {
            console.log(`API: Order found:`, order)
            return NextResponse.json(order)
        } else {
            console.log(`API: Order not found for ID: ${id}`)
            return new NextResponse(JSON.stringify({ error: 'Order not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    } catch (error) {
        console.error('API: Error fetching order:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    console.log(`API: Attempting to delete order with ID: ${id}`)
    try {
        await deleteOrder(id)
        console.log(`API: Order successfully deleted: ${id}`)
        return new NextResponse(JSON.stringify({ message: 'Order successfully deleted' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('API: Error deleting order:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

