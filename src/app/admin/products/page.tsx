'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'

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

const categories = ["Vestes", "Pantalons", "T-shirts", "Sweats", "Accessoires"]
const brands = ["Stone Island", "CP Company"]

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
        name: '',
        price: 0,
        description: '',
        category: '',
        brand: '',
        images: [],
        variants: [],
        tags: []
    })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
    const { toast } = useToast()
    const stableToast = useCallback((props: Parameters<typeof toast>[0]) => toast(props), [toast])

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/products')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (!Array.isArray(data)) {
                throw new Error('Data is not an array')
            }
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
            stableToast({
                title: "Erreur",
                description: `Impossible de charger les produits: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                variant: "destructive",
            })
        }
    }, [stableToast])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts, toast])

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const addedProduct = await response.json()

            setNewProduct({ name: '', price: 0, description: '', category: '', brand: '', images: [], variants: [], tags: [] })
            stableToast({
                title: "Produit ajouté",
                description: `${addedProduct.name} a été ajouté avec succès.`,
            })
            fetchProducts()
        } catch (error) {
            console.error('Error adding product:', error)
            stableToast({
                title: "Erreur",
                description: `Impossible d'ajouter le produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                variant: "destructive",
            })
        }
    }

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProduct) return;
        try {
            const response = await fetch(`/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProduct),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            setEditingProduct(null)
            stableToast({
                title: 'Produit modifié',
                description: `${editingProduct.name} a été modifié avec succès.`
            })
            fetchProducts()
        } catch (error) {
            console.error('Error updating product:', error)
            stableToast({
                title: 'Erreur',
                description: `Impossible de modifier le produit: ${
                    error instanceof Error ? error.message : 'Erreur inconnue'
                }`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteProduct = async (id: number) => {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            stableToast({
                title: "Produit supprimé",
                description: "Le produit a été supprimé avec succès.",
            })
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
            stableToast({
                title: "Erreur",
                description: `Impossible de supprimer le produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                variant: "destructive",
            })
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean, product?: Product) => {
        const files = e.target.files
        if (!files) return

        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i])
        }

        if (isEditing && product) {
            formData.append('productId', product.id.toString())
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(`Upload failed: ${errorData.message || response.statusText}`)
            }

            const data = await response.json()

            if (!data.success || !Array.isArray(data.urls)) {
                const errorMessage = data.message || 'Image upload failed';
                console.error('Image upload failed:', errorMessage);
                stableToast({
                    title: 'Erreur de téléchargement d\'image',
                    description: errorMessage,
                    variant: 'destructive'
                })
                return;
            }

            const imageUrls = data.urls

            if (isEditing && editingProduct) {
                setEditingProduct(prev =>
                    prev ? { ...prev, images: [...(prev.images || []), ...imageUrls] } : null
                )
            } else {
                setNewProduct(prev => ({ ...prev, images: [...(prev.images || []), ...imageUrls] }))
            }

            stableToast({
                title: 'Image téléchargée',
                description: "L'image a été téléchargée et optimisée avec succès."
            })
            fetchProducts()
        } catch (error) {
            console.error('Error uploading image:', error)
            stableToast({
                title: 'Erreur',
                description:
                    error instanceof Error
                        ? error.message
                        : "Une erreur est survenue lors du téléchargement de l'image.",
                variant: 'destructive'
            })
        }
    }

    const handleRemoveImage = (imageUrl: string, isEditing: boolean) => {
        if (isEditing && editingProduct) {
            setEditingProduct(prev => prev ? { ...prev, images: prev.images.filter(img => img !== imageUrl) } : null)
        } else {
            setNewProduct(prev => ({ ...prev, images: prev.images.filter(img => img !== imageUrl) }))
        }
    }

    const handleRemoveTag = (tag: string, isEditing: boolean) => {
        if (isEditing && editingProduct) {
            setEditingProduct(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null)
        } else {
            setNewProduct(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
        }
    }

    const ProductForm = ({
                             product,
                             isEditing,
                             onSubmit,
                             onEditingProductChange,
                             setNewProduct
                         }: {
        product: Omit<Product, 'id'> | Product
        isEditing: boolean
        onSubmit: (e: React.FormEvent) => void
        onEditingProductChange: (updatedProduct: Product | ((prev: Product | null) => Product | null)) => void
        setNewProduct: React.Dispatch<React.SetStateAction<Omit<Product, 'id'>>>
    }) => {
        const [newVariant, setNewVariant] = useState<Omit<Variant, 'stock'>>({ size: '', color: '' })
        const [newVariantStock, setNewVariantStock] = useState(0)

        const handleAddVariant = () => {
            if (newVariant.size && newVariant.color && !isNaN(newVariantStock)) {
                const variant = { ...newVariant, stock: newVariantStock }

                if (isEditing) {
                    onEditingProductChange((prev: Product | null) =>
                        prev ? { ...prev, variants: [...prev.variants, variant] } : null
                    )
                } else {
                    setNewProduct((prev: Omit<Product, 'id'>) => ({ ...prev, variants: [...prev.variants, variant] }))
                }

                setNewVariant({ size: '', color: '' })
                setNewVariantStock(0)
            } else {
                stableToast({
                    title: 'Erreur',
                    description: "Veuillez remplir tous les champs de la variante et entrer un stock valide.",
                    variant: 'destructive'
                })
            }
        }

        const handleRemoveVariant = (index: number) => {
            if (isEditing) {
                onEditingProductChange((prev: Product | null) => prev ? { ...prev, variants: prev.variants.filter((_, i) => i !== index) } : null)
            } else {
                setNewProduct(prev => ({
                    ...prev,
                    variants: prev.variants.filter((_, i) => i !== index)
                }))
            }
        }

        return (
            <form onSubmit={onSubmit} className="space-y-6 overflow-y-scroll h-96">
                <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                        id="name"
                        value={product.name}
                        onChange={(e) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product) => ({ ...prev, name: e.target.value }))
                            } else {
                                setNewProduct(prev => ({ ...prev, name: e.target.value }))
                            }
                        }}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="price">Prix</Label>
                    <Input
                        id="price"
                        type="number"
                        value={product.price}
                        onChange={(e) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product) => ({ ...prev, price: parseFloat(e.target.value) }))
                            } else {
                                setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))
                            }
                        }}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={product.description}
                        onChange={(e) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product) => ({ ...prev, description: e.target.value }))
                            } else {
                                setNewProduct(prev => ({ ...prev, description: e.target.value }))
                            }
                        }}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                        value={product.category}
                        onValueChange={(value) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product) => ({ ...prev, category: value }))
                            } else {
                                setNewProduct(prev => ({ ...prev, category: value }))
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="brand">Marque</Label>
                    <Select
                        value={product.brand}
                        onValueChange={(value) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product) => ({ ...prev, brand: value }))
                            } else {
                                setNewProduct(prev => ({ ...prev, brand: value }))
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une marque" />
                        </SelectTrigger>
                        <SelectContent>
                            {brands.map((brand) => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Images</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(product.images || []).map((image, index) => (
                            <div key={index} className="relative w-24 h-24">
                                <Image src={image} alt={`Product image ${index + 1}`} fill className="object-cover" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 bg-white/50 rounded-full"
                                    onClick={() => handleRemoveImage(image, isEditing)}
                                    aria-label="Remove Image"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Input
                        id={`${isEditing ? 'edit' : 'new'}-images`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, isEditing, product as Product)}
                        className="w-full file:border-none file:bg-gray-100 file:text-gray-700 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:text-sm file:font-medium"
                    />
                </div>
                <div>
                    <Label>Variantes</Label>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Taille</TableHead>
                                <TableHead>Couleur</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {product.variants.map((variant, index) => (
                                <TableRow key={index}>
                                    <TableCell>{variant.size}</TableCell>
                                    <TableCell>{variant.color}</TableCell>
                                    <TableCell>{variant.stock}</TableCell>
                                    <TableCell>
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveVariant(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <Input
                            placeholder="Taille"
                            value={newVariant.size}
                            onChange={e => setNewVariant({ ...newVariant, size: e.target.value })}
                        />
                        <Input
                            placeholder="Couleur"
                            value={newVariant.color}
                            onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                        />
                        <Input
                            type="number"
                            placeholder="Stock"
                            value={newVariantStock}
                            onChange={e => setNewVariantStock(parseInt(e.target.value))}
                        />
                    </div>
                    <Button type="button" className="mt-2" onClick={handleAddVariant}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une variante
                    </Button>
                </div>
                <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(product.tags ?? []).map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-4 w-4 p-0"
                                    onClick={() => handleRemoveTag(tag, isEditing)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <Input
                        id={`${isEditing ? 'edit' : 'new'}-tags`}
                        type="text"
                        placeholder="Ajouter un tag"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const tag = e.currentTarget.value.trim();
                                if (tag) {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product) => ({ ...prev, tags: [...(prev.tags || []), tag] }))
                                    } else {
                                        setNewProduct(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }))
                                    }
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                </div>
                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 rounded-lg px-6 py-3 font-medium">
                    {isEditing ? 'Modifier' : 'Ajouter'} le produit
                </Button>
            </form>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Gestion des produits</h1>
            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Liste des produits</TabsTrigger>
                    <TabsTrigger value="add">Ajouter un produit</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Prix</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Marque</TableHead>
                                <TableHead>Images</TableHead>
                                <TableHead>Variantes</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.price} €</TableCell>
                                    <TableCell>{product.description}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>
                                        {product.images && product.images.length > 0 ? (
                                            product.images.map((image, index) => (
                                                <Image
                                                    key={index}
                                                    src={image}
                                                    alt={`Product image ${index + 1}`}
                                                    width={50}
                                                    height={50}
                                                    className="object-cover rounded mr-2"
                                                />
                                            ))
                                        ) : (
                                            <span className="text-gray-400">Pas d&apos;image</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.variants.map((variant, index) => (
                                            <div key={index}>
                                                {variant.size} - {variant.color} ({variant.stock})
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>{(product.tags || []).join(', ')}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" className="mr-2" onClick={() => setEditingProduct(product)}>
                                            <Edit className="h-4 w-4 inline-block mr-1"/> Modifier
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" onClick={() => setDeletingProductId(product.id)}>
                                                    <Trash2 className="h-4 w-4 inline-block mr-1"/> Supprimer
                                                </Button>
                                            </AlertDialogTrigger>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ajouter un nouveau produit</CardTitle>
                            <CardDescription>Créez un nouveau produit pour votre catalogue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductForm
                                product={newProduct}
                                isEditing={false}
                                onSubmit={handleAddProduct}
                                onEditingProductChange={setEditingProduct}
                                setNewProduct={setNewProduct}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {editingProduct && (
                <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Modifier le produit</DialogTitle>
                        </DialogHeader>
                        {editingProduct && (
                            <ProductForm
                                product={editingProduct}
                                isEditing={true}
                                onSubmit={handleEditProduct}
                                onEditingProductChange={setEditingProduct}
                                setNewProduct={setNewProduct}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {deletingProductId !== null && (
                <AlertDialog open={true} onOpenChange={() => setDeletingProductId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer un produit</AlertDialogTitle>
                            <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                handleDeleteProduct(deletingProductId)
                                setDeletingProductId(null)
                            }}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

