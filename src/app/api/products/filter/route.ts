import { NextResponse } from 'next/server'
import { Product } from '@/lib/api'

// Mock product data
const products: Product[] = [
    {
        id: 1,
        name: "T-shirt Premium",
        price: 29.99,
        description: "T-shirt de haute qualité en coton bio",
        category: "T-shirts",
        brand: "Reboul",
        images: ["/images/t-shirt-premium.jpg"],
        variants: [
            { size: "S", color: "Noir", stock: 10 },
            { size: "M", color: "Noir", stock: 15 },
            { size: "L", color: "Noir", stock: 20 },
        ],
        tags: ["coton", "bio", "premium"]
    },
    // Add more products here...
]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const color = searchParams.get('color')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '12'

    let filteredProducts = [...products]

    if (brand && brand !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.brand === brand)
    }

    if (minPrice) {
        filteredProducts = filteredProducts.filter(product => product.price >= Number(minPrice))
    }

    if (maxPrice) {
        filteredProducts = filteredProducts.filter(product => product.price <= Number(maxPrice))
    }

    if (color && color !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.variants.some(variant => variant.color.toLowerCase() === color.toLowerCase())
        )
    }

    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
        products: paginatedProducts,
        total: filteredProducts.length,
        page: Number(page),
        limit: Number(limit)
    })
}

