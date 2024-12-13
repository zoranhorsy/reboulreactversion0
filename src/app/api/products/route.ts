import { NextResponse } from 'next/server'
import type { Product } from '@/lib/api'

// Simulons une base de données avec quelques produits
const products: Product[] = [
    {
        id: 1,
        name: "T-shirt Premium",
        price: 29.99,
        description: "T-shirt de haute qualité en coton bio",
        category: "Vêtements",
        brand: "Reboul",
        images: ["/images/t-shirt-premium.jpg"],
        variants: [
            { size: "S", color: "Noir", stock: 10 },
            { size: "M", color: "Noir", stock: 15 },
            { size: "L", color: "Noir", stock: 20 },
        ],
        tags: ["coton", "bio", "premium"]
    },
    // Ajoutez d'autres produits ici...
]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'name'
    const brand = searchParams.get('brand')
    const categories = searchParams.get('categories')?.split(',')
    const tags = searchParams.get('tags')?.split(',')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000000')
    const color = searchParams.get('color')

    let filteredProducts = [...products]

    if (brand && brand !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.brand === brand)
    }

    if (categories && categories.length > 0) {
        filteredProducts = filteredProducts.filter(product => categories.includes(product.category))
    }

    if (tags && tags.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            product.tags && product.tags.some(tag => tags.includes(tag))
        )
    }

    if (search) {
        const searchLower = search.toLowerCase()
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        )
    }

    filteredProducts = filteredProducts.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
    )

    if (color && color !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.variants.some(variant => variant.color.toLowerCase() === color.toLowerCase())
        )
    }

    // Tri
    filteredProducts.sort((a, b) => {
        if (sortBy === 'price') {
            return a.price - b.price
        }
        return a.name.localeCompare(b.name)
    })

    const total = filteredProducts.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
        products: paginatedProducts,
        total,
        page,
        limit
    })
}

export async function POST(request: Request) {
    const newProduct: Product = await request.json()

    // Dans une vraie application, vous ajouteriez ici la logique pour sauvegarder le produit dans une base de données
    products.push({ ...newProduct, id: products.length + 1 })

    return NextResponse.json(newProduct, { status: 201 })
}

export async function PUT(request: Request) {
    const updatedProduct: Product = await request.json()

    const index = products.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
        products[index] = updatedProduct
        return NextResponse.json(updatedProduct)
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
        const index = products.findIndex(p => p.id === parseInt(id))
        if (index !== -1) {
            products.splice(index, 1)
            return NextResponse.json({ message: 'Product deleted successfully' })
        }
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
}

