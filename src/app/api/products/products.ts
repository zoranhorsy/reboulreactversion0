import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const productsFilePath = path.join(process.cwd(), 'data', 'products.json')

type Product = {
    id: number
    name: string
    price: number
    stock: number
    description: string
    category: string
    brand: string
    image: string
}

function getProducts(): Product[] {
    if (fs.existsSync(productsFilePath)) {
        const jsonData = fs.readFileSync(productsFilePath, 'utf8')
        return JSON.parse(jsonData)
    }
    return []
}

function saveProducts(products: Product[]) {
    const jsonData = JSON.stringify(products, null, 2)
    fs.writeFileSync(productsFilePath, jsonData)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const products = getProducts()
        res.status(200).json(products)
    } else if (req.method === 'POST') {
        const products = getProducts()
        const newProduct: Product = { ...req.body, id: Date.now() }
        products.push(newProduct)
        saveProducts(products)
        res.status(201).json(newProduct)
    } else if (req.method === 'PUT') {
        const products = getProducts()
        const updatedProduct: Product = req.body
        console.log('Received PUT request with data:', updatedProduct)
        const index = products.findIndex(p => p.id === updatedProduct.id)
        if (index !== -1) {
            console.log('Updating product at index:', index)
            products[index] = updatedProduct
            saveProducts(products)
            console.log('Products saved successfully')
            res.status(200).json(updatedProduct)
        } else {
            console.log('Product not found for id:', updatedProduct.id)
            res.status(404).json({ message: 'Product not found' })
        }
    } else if (req.method === 'DELETE') {
        const products = getProducts()
        const { id } = req.query
        const filteredProducts = products.filter(p => p.id !== Number(id))
        if (products.length !== filteredProducts.length) {
            saveProducts(filteredProducts)
            res.status(200).json({ message: 'Product deleted successfully' })
        } else {
            res.status(404).json({ message: 'Product not found' })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

