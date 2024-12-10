import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const productsFilePath = path.join(process.cwd(), 'data', 'products.json')

type Variant = {
    size: string
    color: string
    stock: number
}

type Product = {
    id: number
    name: string
    price: number
    description: string
    category: string
    brand: string
    images: string[]
    variants: Variant[]
    tags: string[]
}

async function getProducts() {
    const jsonData = await fs.readFile(productsFilePath, 'utf8')
    return JSON.parse(jsonData)
}

async function saveProducts(products) {
    const jsonData = JSON.stringify(products, null, 2)
    await fs.writeFile(productsFilePath, jsonData)
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const products = await getProducts()
        const product = products.find((p) => p.id === parseInt(params.id))

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const updatedProduct = await request.json()
        const products = await getProducts()
        const index = products.findIndex(p => p.id === parseInt(params.id))

        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        products[index] = { ...products[index], ...updatedProduct }
        await saveProducts(products)

        return NextResponse.json(products[index])
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

