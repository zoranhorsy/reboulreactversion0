'use client'

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
    id: number;
    name: string;
    sizes: string[];
    colors: string[];
}

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([
        { id: 1, name: 'Product 1', sizes: ['S', 'M', 'L'], colors: ['Red', 'Blue'] },
        { id: 2, name: 'Product 2', sizes: ['M', 'L', 'XL'], colors: ['Green', 'Yellow'] },
        { id: 3, name: 'Product 3', sizes: [], colors: [] },
    ]);

    const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
        name: '',
        sizes: [],
        colors: [],
    });

    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('');

    const handleAddProduct = () => {
        if (newProduct.name) {
            setProducts([...products, { ...newProduct, id: Date.now() }]);
            setNewProduct({ name: '', sizes: [], colors: [] });
        }
    };

    const handleAddSize = () => {
        if (newSize && !newProduct.sizes.includes(newSize)) {
            setNewProduct({ ...newProduct, sizes: [...newProduct.sizes, newSize] });
            setNewSize('');
        }
    };

    const handleAddColor = () => {
        if (newColor && !newProduct.colors.includes(newColor)) {
            setNewProduct({ ...newProduct, colors: [...newProduct.colors, newColor] });
            setNewColor('');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Total des produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{products.length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Ajouter un nouveau produit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Input
                            placeholder="Nom du produit"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Nouvelle taille"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                            />
                            <Button onClick={handleAddSize}>Ajouter taille</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newProduct.sizes.map((size) => (
                                <Badge key={size}>{size}</Badge>
                            ))}
                        </div>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Nouvelle couleur"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                            />
                            <Button onClick={handleAddColor}>Ajouter couleur</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newProduct.colors.map((color) => (
                                <Badge key={color}>{color}</Badge>
                            ))}
                        </div>
                        <Button onClick={handleAddProduct}>Ajouter le produit</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des produits</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Tailles</TableHead>
                                <TableHead>Couleurs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.sizes.map((size) => (
                                                <Badge key={size} variant="outline">{size}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {product.colors.map((color) => (
                                                <Badge key={color} variant="outline">{color}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

