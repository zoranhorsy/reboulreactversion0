'use client'

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api, type Product, type Category, type Brand, toggleProductActive, getToken } from "@/lib/api"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Trash2 } from "lucide-react"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { handleSort } from "@/utils/productUtils"
import { BrandManager } from "@/components/admin/BrandManager"
import { CategoryManager } from "@/components/admin/CategoryManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AxiosError } from "axios"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilters, setActiveFilters] = useState({
        category: '',
        brand: '',
        store_type: '',
        store_reference: ''
    })
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "ascending" | "descending" } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [activeTab, setActiveTab] = useState("products")
    const { toast } = useToast()
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

    const handleFilterChange = (type: 'category' | 'brand' | 'store_type' | 'store_reference', value: string) => {
        const newFilters = { ...activeFilters, [type]: value }
        setActiveFilters(newFilters)
        filterProducts(searchTerm, newFilters)
    }

    const filterProducts = (search: string, filters: typeof activeFilters) => {
        let filtered = products.filter((product) =>
            (product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase()) ||
            (product.store_reference && product.store_reference.toLowerCase().includes(search.toLowerCase())))
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
        if (filters.store_reference) {
            filtered = filtered.filter(product => product.store_reference?.includes(filters.store_reference))
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

            // Nettoyage et formatage des images
            let formattedImages: string[] = [];
            if (productData.images) {
                // Si images est une chaîne (format PostgreSQL), la convertir en tableau
                if (typeof productData.images === 'string') {
                    try {
                        // Enlever les accolades et les guillemets, puis diviser par les virgules
                        const imagesStr = productData.images as string;
                        formattedImages = imagesStr
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
                        .filter(img => typeof img === 'string' || (typeof img === 'object' && img !== null && 'url' in img))
                        .map(img => {
                            if (typeof img === 'string') return img;
                            return (img as { url: string }).url;
                        })
                        .filter(url => url && url.length > 0);
                }
            }

            // Nettoyage des données avant l'envoi
            const cleanedProductData = {
                name: productData.name.trim(),
                description: productData.description.trim(),
                price: Number(productData.price),
                category_id: Number(productData.category_id),
                brand_id: Number(productData.brand_id),
                store_type: productData.store_type || "adult",
                featured: Boolean(productData.featured),
                active: Boolean(productData.active),
                new: Boolean(productData.new),
                variants: Array.isArray(productData.variants) ? productData.variants : [],
                tags: Array.isArray(productData.tags) ? productData.tags : [],
                details: Array.isArray(productData.details) ? productData.details : [],
                sku: productData.sku?.trim() || null,
                store_reference: productData.store_reference?.trim() || null,
                weight: productData.weight || null,
                dimensions: productData.dimensions?.trim() || null,
                material: productData.material?.trim() || null,
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
        setDeletingProductId(productId)
        setIsDeleteDialogOpen(true)
    }

    const directDeleteProduct = async (productId: number): Promise<boolean> => {
        console.log(`Tentative de suppression directe du produit ID: ${productId}`);
        
        try {
            const token = getToken();
            const url = `https://reboul-store-api-production.up.railway.app/api/products/${productId}`;
            console.log(`URL de suppression: ${url}`);
            
            // Première tentative avec Content-Type
            console.log("Première tentative avec Content-Type");
            let response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            
            console.log(`Réponse suppression directe (tentative 1):`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (response.ok) {
                return true;
            }
            
            // Seconde tentative sans Content-Type (certaines API le préfèrent pour DELETE)
            console.log("Seconde tentative sans Content-Type");
            response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            
            console.log(`Réponse suppression directe (tentative 2):`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (response.ok) {
                return true;
            }
            
            // Troisième tentative avec la méthode POST et _method=DELETE (méthode commune pour contourner les contraintes)
            console.log("Troisième tentative avec POST et _method=DELETE");
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({ _method: 'DELETE' })
            });
            
            console.log(`Réponse suppression directe (tentative 3):`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (response.ok) {
                return true;
            }
            
            // Essayer de lire la réponse en cas d'erreur
            const responseText = await response.text();
            console.error(`Échec de toutes les tentatives de suppression directe (${response.status}):`, responseText);
            
            return false;
        } catch (error) {
            console.error("Erreur lors de la suppression directe:", error);
            return false;
        }
    };

    const bypassDeleteProduct = async (productId: number): Promise<boolean> => {
        console.log(`MÉTHODE DE CONTOURNEMENT: Suppression du produit ID: ${productId}`);
        
        try {
            // Obtenir le token
            const token = getToken();
            
            // Au lieu de DELETE, nous allons utiliser PATCH avec un flag _delete: true
            // Certaines API sont configurées pour gérer cette approche
            const url = `https://reboul-store-api-production.up.railway.app/api/products/${productId}`;
            
            // Requête PATCH explicite avec flag de suppression
            const response = await fetch(url, {
                method: 'PATCH', // Essayer PATCH au lieu de DELETE
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    _method: 'DELETE', // Certaines API reconnaissent cette convention
                    _delete: true,
                    soft_delete: true,
                    id: productId
                })
            });
            
            console.log(`CONTOURNEMENT - Réponse:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            // Si PATCH ne fonctionne pas, essayons de désactiver le produit en dernier recours
            if (!response.ok) {
                console.log("PATCH échoué, essai de désactivation du produit comme alternative");
                const deactivateResponse = await api.toggleProductActive(productId.toString(), false);
                
                if (deactivateResponse) {
                    console.log("Produit désactivé avec succès comme alternative à la suppression");
                    return true;
                }
                
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Erreur avec la méthode de contournement:", error);
            return false;
        }
    };

    const confirmDelete = async () => {
        if (!deletingProductId) {
            console.error("ID du produit à supprimer manquant");
            return;
        }
        
        try {
            setIsLoading(true);
            console.log(`Suppression du produit avec l'ID: ${deletingProductId}`);
            
            // Utiliser la méthode deleteProduct mise à jour qui utilise PUT avec _actionType="delete"
            const success = await api.deleteProduct(deletingProductId.toString());
            
            if (success) {
                toast({
                    title: "Succès",
                    description: "Le produit a été supprimé avec succès.",
                });
                await loadProducts();
            } else {
                throw new Error("La suppression a échoué");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            
            // En cas d'échec, tenter de simplement désactiver le produit
            try {
                console.log("Tentative de désactivation comme solution de secours...");
                const disableResult = await api.toggleProductActive(deletingProductId.toString(), false);
                
                if (disableResult) {
                    toast({
                        title: "Information",
                        description: "Le produit n'a pas pu être supprimé mais a été désactivé avec succès.",
                    });
                    await loadProducts();
                } else {
                    throw new Error("Même la désactivation a échoué");
                }
            } catch (fallbackError) {
                console.error("Échec de toutes les méthodes:", fallbackError);
                toast({
                    title: "Erreur",
                    description: "Impossible de supprimer ou désactiver le produit. Veuillez réessayer plus tard.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
            setDeletingProductId(null);
        }
    };

    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsDialogOpen(true)
    }

    const handleToggleActive = async (product: Product) => {
        try {
            // Appeler la nouvelle méthode spécifique qui contourne la validation complète
            await toggleProductActive(product.id.toString(), !product.active);
            
            // Afficher un message de succès
            toast({
                title: "Succès",
                description: `Le produit a été ${!product.active ? 'activé' : 'désactivé'} avec succès.`,
            });
            
            // Recharger les produits pour mettre à jour l'interface
            await loadProducts();
        } catch (error) {
            console.error("Erreur lors de la modification de l'état du produit:", error);
            console.log("Tentative avec la méthode de secours...");
            
            try {
                // Méthode de secours avec les champs minimaux requis
                await api.updateProduct(product.id.toString(), {
                    name: product.name,
                    description: product.description || "Description",
                    price: product.price || 0,
                    category_id: product.category_id,
                    brand_id: product.brand_id,
                    active: !product.active
                });
                
                toast({
                    title: "Succès",
                    description: `Le produit a été ${!product.active ? 'activé' : 'désactivé'} avec succès.`,
                });
                
                // Recharger les produits
                await loadProducts();
            } catch (fallbackError) {
                console.error("Échec également avec la méthode de secours:", fallbackError);
                
                // Afficher un message d'erreur plus détaillé
                const errorMessage = error instanceof Error 
                    ? error.message 
                    : "Impossible de modifier l'état du produit.";
                    
                toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    // Ajouter cette fonction pour purger les produits supprimés
    const purgeDeletedProducts = async () => {
        try {
            setIsLoading(true);
            const result = await api.purgeDeletedProducts();
            
            if (result.success) {
                toast({
                    title: "Purge terminée",
                    description: `${result.purgedCount} produits supprimés ont été définitivement purgés de la base de données.`,
                });
            } else {
                if (result.purgedCount > 0) {
                    toast({
                        title: "Purge partielle",
                        description: `${result.purgedCount} produits ont été purgés, mais des erreurs sont survenues pour ${result.errors.length} produits.`,
                    });
                } else {
                    toast({
                        title: "Échec de la purge",
                        description: "Aucun produit n'a pu être purgé. Consultez la console pour plus de détails.",
                        variant: "destructive",
                    });
                }
            }
            
            // Recharger les produits après la purge
            await loadProducts();
        } catch (error) {
            console.error("Erreur lors de la purge:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la purge des produits supprimés.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-base sm:text-lg md:text-xl">Gestion des produits</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm md:text-base">
                                        Gérez votre catalogue de produits
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
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
                                                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 w-full sm:w-auto"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                <span className="whitespace-nowrap">
                                                    Ajouter
                                                    <span className="hidden sm:inline"> un produit</span>
                                                </span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-4xl mx-auto overflow-y-auto max-h-[90vh]">
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
                                    <Button 
                                        variant="outline" 
                                        onClick={purgeDeletedProducts} 
                                        className="text-xs sm:text-sm h-8 sm:h-9"
                                        disabled={isLoading}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-500" />
                                        Vider la corbeille
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className="relative w-full">
                                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un produit..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-7 sm:pl-8 w-full h-8 sm:h-9 text-xs sm:text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    <select
                                        className="h-8 sm:h-9 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                        className="h-8 sm:h-9 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                        className="h-8 sm:h-9 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        value={activeFilters.store_type}
                                        onChange={(e) => handleFilterChange('store_type', e.target.value)}
                                    >
                                        <option value="">Tous les magasins</option>
                                        <option value="adult">Adulte</option>
                                        <option value="kids">Enfant</option>
                                        <option value="sneakers">Sneakers</option>
                                        <option value="cpcompany">THE CORNER</option>
                                    </select>

                                    <Input
                                        className="h-8 sm:h-9 text-xs sm:text-sm"
                                        placeholder="Filtrer par réf. magasin"
                                        value={activeFilters.store_reference}
                                        onChange={(e) => handleFilterChange('store_reference', e.target.value)}
                                    />

                                    {(activeFilters.category || activeFilters.brand || activeFilters.store_type || activeFilters.store_reference) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap"
                                            onClick={() => {
                                                setActiveFilters({ category: '', brand: '', store_type: '', store_reference: '' })
                                                filterProducts(searchTerm, { category: '', brand: '', store_type: '', store_reference: '' })
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
                                    handleToggleActive={handleToggleActive}
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

            {/* Dialog for delete confirmation */}
            <AlertDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setDeletingProductId(null)
                            }}
                            className="text-xs sm:text-sm h-8 sm:h-9"
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-destructive text-xs sm:text-sm h-8 sm:h-9"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 