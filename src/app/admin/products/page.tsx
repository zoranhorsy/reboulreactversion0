"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { api, type Product, type Category, type Brand } from "@/lib/api"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminRoute } from "@/components/AdminRoute"
import ProductForm from "@/components/admin/ProductForm"
import ProductTable from "@/components/admin/ProductTable"
import { handleSort } from "@/utils/productUtils"
import { BrandManager } from "@/components/admin/BrandManager"
import { CategoryManager } from "@/components/admin/CategoryManager"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "ascending" | "descending" } | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeTab] = useState<"all" | "adult" | "kids" | "sneakers">("all")

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const queryParams: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (activeTab !== "all") {
        queryParams.category = activeTab
      }

      const response = await api.fetchProducts(queryParams)
      if (response && Array.isArray(response.products)) {
        setProducts(response.products)
        setFilteredProducts(response.products)
        setTotalPages(Math.ceil(response.total / itemsPerPage))
        toast({
          title: "Succès",
          description: `${response.products.length} produits chargés avec succès.`,
        })
      } else {
        throw new Error("Format de réponse inattendu")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, activeTab])

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadBrands()
  }, [loadProducts])

  const loadCategories = async () => {
    try {
      const fetchedCategories = await api.fetchCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
      toast({
        title: "Avertissement",
        description: "Impossible de charger les catégories. Utilisation des catégories par défaut.",
        variant: "default",
      })
      setCategories([])
    }
  }

  const loadBrands = async () => {
    try {
      const fetchedBrands = await api.fetchBrands()
      setBrands(fetchedBrands)
    } catch (error) {
      console.error("Erreur lors du chargement des marques:", error)
      toast({
        title: "Avertissement",
        description: "Impossible de charger les marques.",
        variant: "default",
      })
      setBrands([])
    }
  }

  const handleAddProduct = async (productData: Product) => {
    try {
      console.log("Données du nouveau produit:", productData)
      const createdProduct = await api.createProduct(productData)
      if (createdProduct) {
        setProducts((prevProducts) => [...prevProducts, createdProduct])
        setFilteredProducts((prevFiltered) => [...prevFiltered, createdProduct])
        toast({
          title: "Succès",
          description: "Le produit a été ajouté avec succès.",
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (productData: Product) => {
    if (!productData.id) {
      console.error("ID du produit manquant")
      return
    }
    try {
      console.log("Données du produit à mettre à jour:", productData)
      const updatedProduct = await api.updateProduct(productData.id, productData)
      if (updatedProduct) {
        console.log("Produit mis à jour:", updatedProduct)
        setProducts((prevProducts) => prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
        setFilteredProducts((prevFiltered) =>
          prevFiltered.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
        )
        toast({
          title: "Succès",
          description: "Le produit a été mis à jour avec succès.",
        })
        setIsDialogOpen(false)
      } else {
        throw new Error("La mise à jour du produit a échoué")
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le produit.",
        variant: "destructive",
      })
    }
  }

  const handleEditProductClick = useCallback((product: Product) => {
    console.log("Produit à éditer:", product)
    setEditingProduct(product)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const success = await api.deleteProduct(id)
        if (success) {
          setProducts(products.filter((p) => p.id !== id))
          setFilteredProducts(filteredProducts.filter((p) => p.id !== id))
          toast({
            title: "Succès",
            description: "Le produit a été supprimé avec succès.",
          })
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du produit:", error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le produit.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCloseDialog = useCallback(() => {
    setEditingProduct(null)
    setIsDialogOpen(false)
  }, [])

  const handleSortWrapper = (key: keyof Product) => {
    handleSort(key, sortConfig, setSortConfig, products, activeTab, setFilteredProducts)
  }

  return (
    <AdminRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Produits</h1>

        {isLoading ? (
          <div>Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div>Aucun produit trouvé.</div>
        ) : (
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
            </Button>
          </div>
        )}

        {!isLoading && (
          <>
            <Tabs defaultValue="products" className="w-full">
              <TabsList>
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
                <TabsTrigger value="brands">Marques</TabsTrigger>
              </TabsList>
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Tous les produits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <ProductTable
                        filteredProducts={filteredProducts}
                        categories={categories}
                        sortConfig={sortConfig}
                        handleSort={handleSortWrapper}
                        handleEditProduct={handleEditProductClick}
                        handleDeleteProduct={handleDeleteProduct}
                      />
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      <span className="mx-4">
                        Page {currentPage} sur {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des catégories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryManager onCategoryChange={loadCategories} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="brands">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des marques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BrandManager />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
            <DialogTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
            <div className="flex-grow overflow-y-auto pr-4">
              <ProductForm
                product={editingProduct}
                categories={categories}
                brands={brands}
                onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRoute>
  )
}

