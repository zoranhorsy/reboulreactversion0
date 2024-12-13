'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Product = {
    id: number
    name: string
    price: number
    stock: number
}

export function AdminContent() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 })

    useEffect(() => {
        // Simuler le chargement des produits
        setProducts([
            { id: 1, name: "T-shirt Premium", price: 29.99, stock: 100 },
            { id: 2, name: "Jeans Slim", price: 59.99, stock: 50 },
            { id: 3, name: "Veste en Cuir", price: 199.99, stock: 25 },
        ])
    }, [])

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault()
        setProducts([...products, { ...newProduct, id: Date.now() }])
        setNewProduct({ name: '', price: 0, stock: 0 })
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Administration</h1>
            <Tabs defaultValue="products" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="products">Produits</TabsTrigger>
                    <TabsTrigger value="orders">Commandes</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <div className="space-y-4">
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Nom du produit"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <Input
                                type="number"
                                placeholder="Prix"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                                required
                            />
                            <Input
                                type="number"
                                placeholder="Stock"
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                                required
                            />
                            <Button type="submit">Ajouter un produit</Button>
                        </form>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Prix</TableHead>
                                    <TableHead>Stock</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.price.toFixed(2)} €</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <p>Fonctionnalité de gestion des commandes à implémenter.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}

