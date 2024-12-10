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

async function getProducts(): Promise<Product[]> {
    try {
        await fs.access(productsFilePath)
    } catch (error) {
        // If the file doesn't exist, create it with an empty array
        await fs.writeFile(productsFilePath, '[]')
        return []
    }

    const jsonData = await fs.readFile(productsFilePath, 'utf8')
    return JSON.parse(jsonData)
}

async function saveProducts(products: Product[]): Promise<void> {
    const jsonData = JSON.stringify(products, null, 2)
    await fs.writeFile(productsFilePath, jsonData)
}

export async function GET() {
    try {
        const products = await getProducts()
        const sanitizedProducts = products.map(product => ({
            ...product,
            variants: product.variants || []
        }))
        return NextResponse.json(sanitizedProducts)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const newProduct: Omit<Product, 'id'> = await request.json()
        const products = await getProducts()
        const productWithId: Product = { ...newProduct, id: Date.now(), variants: newProduct.variants || [] }
        products.push(productWithId)
        await saveProducts(products)
        return NextResponse.json(productWithId, { status: 201 })
    } catch (error) {
        console.error('Error adding product:', error)
        return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const updatedProduct: Product = await request.json()
        const products = await getProducts()
        const index = products.findIndex(p => p.id === updatedProduct.id)
        if (index !== -1) {
            products[index] = updatedProduct
            await saveProducts(products)
            return NextResponse.json(updatedProduct)
        }
        return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json({ message: 'Missing product ID' }, { status: 400 })
        }
        const products = await getProducts()
        const filteredProducts = products.filter(p => p.id !== Number(id))
        if (products.length !== filteredProducts.length) {
            await saveProducts(filteredProducts)
            console.log('Product deleted successfully:', id)
            return NextResponse.json({ message: 'Product deleted successfully' })
        }
        return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}

