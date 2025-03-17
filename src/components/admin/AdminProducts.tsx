'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type Product, type Category, type Brand } from "@/lib/api"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { handleSort } from "@/utils/productUtils"
import { BrandManager } from "@/components/admin/BrandManager"
import { CategoryManager } from "@/components/admin/CategoryManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "ascending" | "descending" } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [activeTab, setActiveTab] = useState("products")
    const { toast } = useToast()

    const loadProducts = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await api.fetchProducts()
            setProducts(response.products)
            setFilteredProducts(response.products)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les produits.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    const loadCategories = useCallback(async () => {
        try {
            const response = await api.fetchCategories()
            setCategories(response)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les catégories.",
                variant: "destructive",
            })
        }
    }, [toast])

    const loadBrands = useCallback(async () => {
        try {
            const response = await api.fetchBrands()
            setBrands(response)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de charger les marques.",
                variant: "destructive",
            })
        }
    }, [toast])

    useEffect(() => {
        loadProducts()
        loadCategories()
        loadBrands()
    }, [loadProducts, loadCategories, loadBrands])

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(value.toLowerCase()) ||
            product.description.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredProducts(filtered)
    }

    const handleProductSubmit = async (productData: Product) => {
        try {
            if (editingProduct) {
                await api.updateProduct(editingProduct.id, productData)
                toast({
                    title: "Succès",
                    description: "Le produit a été mis à jour avec succès.",
                })
            } else {
                await api.createProduct(productData)
                toast({
                    title: "Succès",
                    description: "Le produit a été créé avec succès.",
                })
            }
            loadProducts()
            setIsDialogOpen(false)
            setEditingProduct(null)
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement du produit.",
                variant: "destructive",
            })
        }
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingProduct(null)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsDialogOpen(true)
    }

    const handleDelete = async (productId: number) => {
        try {
            await api.deleteProduct(productId.toString())
            toast({
                title: "Succès",
                description: "Le produit a été supprimé avec succès.",
            })
            loadProducts()
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer le produit.",
                variant: "destructive",
            })
        }
    }

    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="products">Produits</TabsTrigger>
                    <TabsTrigger value="categories">Catégories</TabsTrigger>
                    <TabsTrigger value="brands">Marques</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Gestion des produits</CardTitle>
                                <Dialog 
                                    open={isDialogOpen} 
                                    onOpenChange={(open) => {
                                        if (!open) handleCloseDialog()
                                        setIsDialogOpen(open)
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button onClick={handleAddProduct}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter un produit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl">
                                        <DialogTitle>
                                            {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
                                        </DialogTitle>
                                        <ProductForm
                                            product={editingProduct}
                                            onSubmit={handleProductSubmit}
                                            categories={categories}
                                            brands={brands}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <CardDescription>
                                Gérez votre catalogue de produits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un produit..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                            <ProductTable
                                filteredProducts={filteredProducts}
                                categories={categories}
                                brands={brands}
                                sortConfig={sortConfig}
                                handleSort={(key) => handleSort(key, sortConfig, setSortConfig, products, 'all', setFilteredProducts)}
                                handleEditProduct={handleEdit}
                                handleDeleteProduct={handleDelete}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des catégories</CardTitle>
                            <CardDescription>
                                Gérez les catégories de produits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryManager onUpdate={loadCategories} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="brands">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion des marques</CardTitle>
                            <CardDescription>
                                Gérez les marques de produits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BrandManager onUpdate={loadBrands} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 