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
import { AxiosError } from "axios"

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilters, setActiveFilters] = useState({
        category: '',
        brand: '',
        store_type: ''
    })
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
        filterProducts(value, activeFilters)
    }

    const handleFilterChange = (type: 'category' | 'brand' | 'store_type', value: string) => {
        const newFilters = { ...activeFilters, [type]: value }
        setActiveFilters(newFilters)
        filterProducts(searchTerm, newFilters)
    }

    const filterProducts = (search: string, filters: typeof activeFilters) => {
        let filtered = products.filter((product) =>
            (product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase()))
        )

        if (filters.category) {
            filtered = filtered.filter(product => product.category_id.toString() === filters.category)
        }
        if (filters.brand) {
            filtered = filtered.filter(product => product.brand_id.toString() === filters.brand)
        }
        if (filters.store_type) {
            filtered = filtered.filter(product => product.store_type === filters.store_type)
        }

        setFilteredProducts(filtered)
    }

    const handleProductSubmit = async (productData: Product) => {
        try {
            console.log('handleProductSubmit received data:', productData);

            // Validation des données requises
            if (!productData.name?.trim()) {
                throw new Error("Le nom du produit est requis");
            }
            if (!productData.description?.trim()) {
                throw new Error("La description est requise");
            }
            if (!productData.price || productData.price <= 0) {
                throw new Error("Le prix doit être supérieur à 0");
            }
            if (!productData.category_id) {
                throw new Error("La catégorie est requise");
            }
            if (!productData.brand_id) {
                throw new Error("La marque est requise");
            }
            if (!productData.stock || productData.stock < 0) {
                throw new Error("Le stock doit être supérieur ou égal à 0");
            }

            // Nettoyage et formatage des images
            let formattedImages: string[] = [];
            if (productData.images) {
                // Si images est une chaîne (format PostgreSQL), la convertir en tableau
                if (typeof productData.images === 'string') {
                    try {
                        // Enlever les accolades et les guillemets, puis diviser par les virgules
                        formattedImages = productData.images
                            .replace(/[{}]/g, '')
                            .split(',')
                            .map(url => url.replace(/"/g, '').trim())
                            .filter(url => url.length > 0);
                    } catch (e) {
                        console.error('Error parsing images string:', e);
                        formattedImages = [];
                    }
                } else if (Array.isArray(productData.images)) {
                    // Si c'est déjà un tableau, le nettoyer
                    formattedImages = productData.images
                        .filter(img => typeof img === 'string' || (typeof img === 'object' && 'url' in img))
                        .map(img => {
                            if (typeof img === 'string') return img;
                            return (img as ProductImage).url;
                        })
                        .filter(url => url && url.length > 0);
                }
            }

            // Nettoyage des données avant l'envoi
            const cleanedProductData = {
                name: productData.name.trim(),
                description: productData.description.trim(),
                price: Number(productData.price),
                stock: Number(productData.stock),
                category_id: Number(productData.category_id),
                brand_id: Number(productData.brand_id),
                store_type: productData.store_type || "adult",
                featured: Boolean(productData.featured),
                variants: Array.isArray(productData.variants) ? productData.variants : [],
                tags: Array.isArray(productData.tags) ? productData.tags : [],
                details: Array.isArray(productData.details) ? productData.details : [],
                sku: productData.sku?.trim() || null,
                images: formattedImages
            };

            console.log('Cleaned product data before API call:', JSON.stringify(cleanedProductData, null, 2));

            let updatedProduct;
            if (editingProduct) {
                console.log('Updating product with ID:', editingProduct.id);
                updatedProduct = await api.updateProduct(editingProduct.id, cleanedProductData);
                toast({
                    title: "Succès",
                    description: "Le produit a été mis à jour avec succès.",
                });
            } else {
                console.log('Creating new product');
                updatedProduct = await api.createProduct(cleanedProductData);
                toast({
                    title: "Succès",
                    description: "Le produit a été créé avec succès.",
                });
            }
            
            // Recharger les produits après la mise à jour
            await loadProducts();
            
            // Fermer le dialogue et réinitialiser l'état
            setIsDialogOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error saving product:', error);
            if (error instanceof AxiosError) {
                console.error('Server error details:', error.response?.data);
            }
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement du produit.",
                variant: "destructive",
            });
        }
    };

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
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-base sm:text-lg md:text-xl">Gestion des produits</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm md:text-base">
                                        Gérez votre catalogue de produits
                                    </CardDescription>
                                </div>
                                <Dialog 
                                    open={isDialogOpen} 
                                    onOpenChange={(open) => {
                                        if (!open) handleCloseDialog()
                                        setIsDialogOpen(open)
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button 
                                            onClick={handleAddProduct}
                                            size="sm"
                                            className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm px-2 sm:px-3 md:px-4 w-full sm:w-auto"
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="whitespace-nowrap">
                                                Ajouter
                                                <span className="hidden sm:inline"> un produit</span>
                                            </span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-4xl mx-auto">
                                        <DialogTitle className="text-base sm:text-lg md:text-xl">
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
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-4 mb-4">
                                <div className="relative w-full">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un produit..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-8 w-full h-9 sm:h-10"
                                    />
                                </div>
                                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                    <select
                                        className="h-9 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        value={activeFilters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="h-9 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        value={activeFilters.brand}
                                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                                    >
                                        <option value="">Toutes les marques</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="h-9 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        value={activeFilters.store_type}
                                        onChange={(e) => handleFilterChange('store_type', e.target.value)}
                                    >
                                        <option value="">Tous les magasins</option>
                                        <option value="adult">Adulte</option>
                                        <option value="kids">Enfant</option>
                                        <option value="sneakers">Sneakers</option>
                                        <option value="cpcompany">THE CORNER</option>
                                    </select>

                                    {(activeFilters.category || activeFilters.brand || activeFilters.store_type) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap"
                                            onClick={() => {
                                                setActiveFilters({ category: '', brand: '', store_type: '' })
                                                filterProducts(searchTerm, { category: '', brand: '', store_type: '' })
                                            }}
                                        >
                                            Réinitialiser les filtres
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <ProductTable
                                    filteredProducts={filteredProducts}
                                    categories={categories}
                                    brands={brands}
                                    sortConfig={sortConfig}
                                    handleSort={(key) => handleSort(key, sortConfig, setSortConfig, products, 'all', setFilteredProducts)}
                                    handleEditProduct={handleEdit}
                                    handleDeleteProduct={handleDelete}
                                />
                            </div>
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