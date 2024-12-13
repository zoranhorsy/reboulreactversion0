'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
import { Product, fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api'

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
        tags: [],
        reviews: [],
        questions: [],
        faqs: [],
        sizeChart: []
    })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
    const { toast } = useToast()
    const stableToast = useCallback((props: Parameters<typeof toast>[0]) => toast(props), [toast])

    const fetchProductsData = useCallback(async () => {
        try {
            const { products: fetchedProducts } = await fetchProducts({})
            setProducts(fetchedProducts)
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
        fetchProductsData()
    }, [fetchProductsData])

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const addedProduct = await createProduct(newProduct)
            setNewProduct({
                name: '', price: 0, description: '', category: '', brand: '',
                images: [], variants: [], tags: [], reviews: [], questions: [], faqs: [], sizeChart: []
            })
            stableToast({
                title: "Produit ajouté",
                description: `${addedProduct.name} a été ajouté avec succès.`,
            })
            fetchProductsData()
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
            await updateProduct(editingProduct.id, editingProduct)
            setEditingProduct(null)
            stableToast({
                title: 'Produit modifié',
                description: `${editingProduct.name} a été modifié avec succès.`
            })
            fetchProductsData()
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

    const handleDeleteProduct = async (id: string) => {
        try {
            await deleteProduct(id)
            stableToast({
                title: "Produit supprimé",
                description: "Le produit a été supprimé avec succès.",
            })
            fetchProductsData()
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
            formData.append('productId', product.id)
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!data.success || !Array.isArray(data.urls)) {
                throw new Error(data.message || 'Image upload failed')
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
        const [newVariant, setNewVariant] = useState<Omit<Product['variants'][0], 'stock'>>({ size: '', color: '' })
        const [newVariantStock, setNewVariantStock] = useState(0)
        const [newQuestion, setNewQuestion] = useState({ question: '', answer: '' })
        const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

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

        const handleAddQuestion = () => {
            if (newQuestion.question && newQuestion.answer) {
                if (isEditing) {
                    onEditingProductChange((prev: Product | null) =>
                        prev ? { ...prev, questions: [...prev.questions, { ...newQuestion, id: prev.questions.length + 1 }] } : null
                    )
                } else {
                    setNewProduct((prev: Omit<Product, 'id'>) => ({
                        ...prev,
                        questions: [...prev.questions, { ...newQuestion, id: prev.questions.length + 1 }]
                    }))
                }
                setNewQuestion({ question: '', answer: '' })
            }
        }

        const handleAddFaq = () => {
            if (newFaq.question && newFaq.answer) {
                if (isEditing) {
                    onEditingProductChange((prev: Product | null) =>
                        prev ? { ...prev, faqs: [...prev.faqs, newFaq] } : null
                    )
                } else {
                    setNewProduct((prev: Omit<Product, 'id'>) => ({
                        ...prev,
                        faqs: [...prev.faqs, newFaq]
                    }))
                }
                setNewFaq({ question: '', answer: '' })
            }
        }

        return (
            <form onSubmit={onSubmit} className="space-y-4 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nom du produit</Label>
                        <Input
                            id="name"
                            value={product.name}
                            onChange={(e) => {
                                if (isEditing) {
                                    onEditingProductChange((prev: Product | null) => prev ? { ...prev, name: e.target.value } : null)
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
                                    onEditingProductChange((prev: Product | null) => prev ? { ...prev, price: parseFloat(e.target.value) } : null)
                                } else {
                                    setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))
                                }
                            }}
                            required
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={product.description}
                        onChange={(e) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product | null) => prev ? { ...prev, description: e.target.value } : null)
                            } else {
                                setNewProduct(prev => ({ ...prev, description: e.target.value }))
                            }
                        }}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select
                            value={product.category}
                            onValueChange={(value) => {
                                if (isEditing) {
                                    onEditingProductChange((prev: Product | null) => prev ? { ...prev, category: value } : null)
                                } else {
                                    setNewProduct(prev => ({ ...prev, category: value }))
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
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
                                    onEditingProductChange((prev: Product | null) => prev ? { ...prev, brand: value } : null)
                                } else {
                                    setNewProduct(prev => ({ ...prev, brand: value }))
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une marque" />
                            </SelectTrigger>
                            <SelectContent>
                                {brands.map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                        {brand}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="images">Images</Label>
                    <input
                        type="file"
                        id="images"
                        multiple
                        onChange={(e) => handleImageUpload(e, isEditing, product as Product)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.images && product.images.map((imageUrl) => (
                            <div key={imageUrl} className="relative">
                                <Image src={imageUrl} alt="Product Image" width={50} height={50} className="object-cover rounded" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                    onClick={() => handleRemoveImage(imageUrl, isEditing)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        value={product.tags.join(', ')}
                        onChange={(e) => {
                            if (isEditing) {
                                onEditingProductChange((prev: Product | null) => prev ? { ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) } : null)
                            } else {
                                setNewProduct(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))
                            }
                        }}
                    />
                </div>
                <div>
                    <Label>Variantes</Label>
                    <div className="space-y-1">
                        {product.variants.map((variant, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Input value={variant.size} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, size: e.target.value } : v) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, size: e.target.value } : v) }))
                                    }
                                }} placeholder="Taille" />
                                <Input value={variant.color} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, color: e.target.value } : v) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, color: e.target.value } : v) }))
                                    }
                                }} placeholder="Couleur" />
                                <Input type="number" value={variant.stock} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, stock: parseInt(e.target.value, 10) } : v) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === index ? { ...v, stock: parseInt(e.target.value, 10) } : v) }))
                                    }
                                }} placeholder="Stock" />
                                <Button variant="ghost" onClick={() => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, variants: prev.variants.filter((_, i) => i !== index) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }))
                                    }
                                }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <Input
                            value={newVariant.size}
                            onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                            placeholder="Nouvelle taille"
                        />
                        <Input
                            value={newVariant.color}
                            onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                            placeholder="Nouvelle couleur"
                        />
                        <Input
                            type="number"
                            value={newVariantStock}
                            onChange={(e) => setNewVariantStock(parseInt(e.target.value, 10))}
                            placeholder="Nouveau stock"
                        />
                        <Button onClick={handleAddVariant}>Ajouter</Button>
                    </div>
                </div>
                <div>
                    <Label>Questions et Réponses</Label>
                    <div className="space-y-1">
                        {product.questions.map((q, index) => (
                            <div key={index} className="flex flex-col space-y-1">
                                <Input value={q.question} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, questions: prev.questions.map((question, i) => i === index ? { ...question, question: e.target.value } : question) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, questions: prev.questions.map((question, i) => i === index ? { ...question, question: e.target.value } : question) }))
                                    }
                                }} placeholder="Question" />
                                <Input value={q.answer || ''} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, questions: prev.questions.map((question, i) => i === index ? { ...question, answer: e.target.value } : question) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, questions: prev.questions.map((question, i) => i === index ? { ...question, answer: e.target.value } : question) }))
                                    }
                                }} placeholder="Réponse" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-1 mt-2">
                        <Input
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Nouvelle question"
                        />
                        <Input
                            value={newQuestion.answer}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, answer: e.target.value }))}
                            placeholder="Nouvelle réponse"
                        />
                        <Button onClick={handleAddQuestion}>Ajouter Q&R</Button>
                    </div>
                </div>
                <div>
                    <Label>FAQs</Label>
                    <div className="space-y-1">
                        {product.faqs.map((faq, index)=> (
                            <div key={index} className="flex flex-col space-y-1">
                                <Input value={faq.question} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, faqs: prev.faqs.map((f, i) => i === index ? { ...f, question: e.target.value } : f) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, faqs: prev.faqs.map((f, i) => i === index ? { ...f, question: e.target.value } : f) }))
                                    }
                                }} placeholder="Question FAQ" />
                                <Input value={faq.answer} onChange={(e) => {
                                    if (isEditing) {
                                        onEditingProductChange((prev: Product | null) => prev ? { ...prev, faqs: prev.faqs.map((f, i) => i === index ? { ...f, answer: e.target.value } : f) } : null)
                                    } else {
                                        setNewProduct(prev => ({ ...prev, faqs: prev.faqs.map((f, i) => i === index ? { ...f, answer: e.target.value } : f) }))
                                    }
                                }} placeholder="Réponse FAQ" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-1 mt-2">
                        <Input
                            value={newFaq.question}
                            onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Nouvelle question FAQ"
                        />
                        <Input
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                            placeholder="Nouvelle réponse FAQ"
                        />
                        <Button onClick={handleAddFaq}>Ajouter FAQ</Button>
                    </div>
                </div>
                <Button type="submit" className="w-full">
                    {isEditing ? "Mettre à jour le produit" : "Ajouter le produit"}
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
                                            <AlertDialogTrigger>
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
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Modifier le produit</DialogTitle>
                            <DialogDescription>
                                Modifiez les détails du produit ci-dessous. Tous les champs sont obligatoires.
                            </DialogDescription>
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

