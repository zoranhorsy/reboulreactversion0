import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/api'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    console.log(`API: Fetching product with ID: ${id}`)
    try {
        const product = await getProductById(id)

        if (product) {
            console.log(`API: Product found:`, product)
            return NextResponse.json(product)
        } else {
            console.log(`API: Product not found for ID: ${id}`)
            return new NextResponse(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    } catch (error) {
        console.error('API: Error fetching product:', error)
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

