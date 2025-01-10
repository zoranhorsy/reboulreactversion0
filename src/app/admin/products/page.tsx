'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { api, Product, Category } from '@/lib/api'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminRoute } from '@/components/AdminRoute'
import { useAuth } from '@/app/contexts/AuthContext'
import ProductForm from '@/components/admin/ProductForm'
import ProductTable from '@/components/admin/ProductTable'
import { handleSort } from '@/utils/productUtils'
import { BrandManager } from '@/components/admin/BrandManager'
import { CategoryManager } from '@/components/admin/CategoryManager'

export default function AdminProductsPage() {
  const { user: _user } = useAuth();
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Product>({
      id: '',
      name: '',
      price: 0,
      description: '',
      category: null,
      brand: '',
      images: [],
      storeType: 'adult',
      featured: false,
      colors: [],
      variants: [],
      tags: [],
      reviews: [],
      questions: [],
      faqs: [],
      sizeChart: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'ascending' | 'descending' } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeStoreType, setActiveStoreType] = useState<'all' | 'adult' | 'kids' | 'sneakers'>('all');

  const loadProducts = useCallback(async () => {
      setIsLoading(true);
      try {
          const response = await api.fetchProducts({ page: currentPage, limit: itemsPerPage });
          if (response && Array.isArray(response.products)) {
              setProducts(response.products);
              setFilteredProducts(response.products.filter(product =>
                  activeStoreType === 'all' || product.storeType === activeStoreType || product.store_type === activeStoreType
              ));
              setTotalPages(Math.ceil(response.total / (response.limit || itemsPerPage)));
              toast({
                  title: "Succès",
                  description: `${response.products.length} produits chargés avec succès.`,
              });
          } else {
              throw new Error("Format de réponse inattendu");
          }
      } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
          toast({
              title: "Erreur",
              description: "Impossible de charger les produits. Veuillez réessayer.",
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
  }, [currentPage, itemsPerPage, activeStoreType]);

  useEffect(() => {
      loadProducts()
      loadCategories();
  }, [currentPage, loadProducts])

  const filteredProductsMemo = useMemo(() => {
      return products.filter(product =>
          (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (activeStoreType === 'all' ||
           product.storeType === activeStoreType ||
           product.store_type === activeStoreType)
      );
  }, [searchTerm, products, activeStoreType]);

  useEffect(() => {
      setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  const loadCategories = async () => {
      try {
          const fetchedCategories = await api.fetchCategories();
          setCategories(fetchedCategories);
      } catch (error) {
          console.error("Erreur lors du chargement des catégories:", error);
          toast({
              title: "Avertissement",
              description: "Impossible de charger les catégories. Utilisation des catégories par défaut.",
              variant: "warning",
          });
          setCategories([]);
      }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          const createdProduct = await api.createProduct(newProduct);
          if (createdProduct) {
              setProducts([...products, createdProduct])
              setFilteredProducts([...filteredProducts, createdProduct])
              setNewProduct({
                  id: '',
                  name: '',
                  price: 0,
                  description: '',
                  category: null,
                  brand: '',
                  images: [],
                  storeType: 'adult',
                  featured: false,
                  colors: [],
                  variants: [],
                  tags: [],
                  reviews: [],
                  questions: [],
                  faqs: [],
                  sizeChart: [],
              })
              toast({
                  title: "Succès",
                  description: "Le produit a été ajouté avec succès.",
              })
              setIsDialogOpen(false)
          }
      } catch (error) {
          console.error("Erreur lors de l'ajout du produit:", error);
          toast({
              title: "Erreur",
              description: "Impossible d'ajouter le produit.",
              variant: "destructive",
          })
      }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProduct) {
          console.error('Aucun produit n\'est en cours d\'édition');
          return;
      }
      try {
          const imagesToUpload = editingProduct.images.filter(img => img instanceof Blob || img instanceof File);
          let imageUrls = editingProduct.images.filter(img => typeof img === 'string');

          if (imagesToUpload.length > 0) {
              try {
                  const uploadedImageUrls = await api.uploadImages(imagesToUpload);
                  console.log('Uploaded image URLs:', uploadedImageUrls);
                  imageUrls = [...imageUrls, ...uploadedImageUrls];
              } catch (error) {
                  console.error('Error uploading images:', error);
                  toast({
                      title: "Erreur",
                      description: "Impossible d'uploader les images. Veuillez réessayer.",
                      variant: "destructive",
                  });
                  return;
              }
          }

          const productToUpdate = {
              ...editingProduct,
              images: imageUrls,
              category: editingProduct.category,
              storeType: editingProduct.storeType
          };

          console.log('Updating product:', productToUpdate);

          delete productToUpdate.category_id;

          const updatedProduct = await api.updateProduct(editingProduct.id, productToUpdate);
          if (updatedProduct) {
              setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
              setFilteredProducts(prevFiltered => prevFiltered.map(p => p.id === updatedProduct.id ? updatedProduct : p));
              loadProducts();
              setEditingProduct(null);
              setIsEditing(false);
              toast({
                  title: "Succès",
                  description: "Le produit a été mis à jour avec succès.",
              });
              setIsDialogOpen(false);
          }
      } catch (error) {
          console.error('Erreur lors de la mise à jour:', error);
          toast({
              title: "Erreur",
              description: "Impossible de mettre à jour le produit.",
              variant: "destructive",
          });
      }
  };

  const handleEditProduct2 = useCallback((product: Product) => {
      setEditingProduct({
          ...product,
          reviews: Array.isArray(product.reviews) ? product.reviews : [],
          questions: Array.isArray(product.questions) ? product.questions : [],
          faqs: Array.isArray(product.faqs) ? product.faqs : [],
          sizeChart: Array.isArray(product.sizeChart) ? product.sizeChart : [],
          variants: Array.isArray(product.variants) ? product.variants : [],
          tags: Array.isArray(product.tags) ? product.tags : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
      });
      setIsEditing(true);
      setIsDialogOpen(true);
  }, []);

  const handleDeleteProduct = async (id: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
          try {
              const success = await api.deleteProduct(id);
              if (success) {
                  setProducts(products.filter(p => p.id !== id))
                  setFilteredProducts(filteredProducts.filter(p => p.id !== id))
                  toast({
                      title: "Succès",
                      description: "Le produit a été supprimé avec succès.",
                  })
              }
          } catch (error) {
              console.error("Erreur lors de la suppression du produit:", error);
              toast({
                  title: "Erreur",
                  description: "Une erreur est survenue lors de la suppression du produit.",
                  variant: "destructive",
              })
          }
      }
  };

  const handleCloseDialog = useCallback(() => {
      setEditingProduct(null);
      setIsEditing(false);
      setIsDialogOpen(false);
  }, []);

  const handleSortWrapper = (key: keyof Product) => {
      handleSort(key, sortConfig, setSortConfig, products, activeStoreType, setFilteredProducts);
  };

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
                      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveStoreType(value as 'all' | 'adult' | 'kids' | 'sneakers')}>
                          <TabsList>
                              <TabsTrigger value="all">Tous</TabsTrigger>
                              <TabsTrigger value="adult">Adulte</TabsTrigger>
                              <TabsTrigger value="kids">Enfant</TabsTrigger>
                              <TabsTrigger value="sneakers">Sneakers</TabsTrigger>
                          </TabsList>
                          <TabsContent value="all">
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
                                              handleEditProduct={handleEditProduct2}
                                              handleDeleteProduct={handleDeleteProduct}
                                          />
                                      </div>
                                      <div className="mt-4 flex justify-center">
                                          <Button
                                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                              disabled={currentPage === 1}
                                          >
                                              Précédent
                                          </Button>
                                          <span className="mx-4">
                                              Page {currentPage} sur {totalPages}
                                          </span>
                                          <Button
                                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                              disabled={currentPage === totalPages}
                                          >
                                              Suivant
                                          </Button>
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>
                          <TabsContent value="adult">
                              <Card>
                                  <CardHeader>
                                      <CardTitle>Produits Adulte</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="overflow-x-auto">
                                          <ProductTable
                                              filteredProducts={filteredProducts.filter(p =>
                                                  p.storeType === 'adult' || p.store_type === 'adult'
                                              )}
                                              categories={categories}
                                              sortConfig={sortConfig}
                                              handleSort={handleSortWrapper}
                                              handleEditProduct={handleEditProduct2}
                                              handleDeleteProduct={handleDeleteProduct}
                                          />
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>
                          <TabsContent value="kids">
                              <Card>
                                  <CardHeader>
                                      <CardTitle>Produits Enfant</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="overflow-x-auto">
                                          <ProductTable
                                              filteredProducts={filteredProducts.filter(p =>
                                                  p.storeType === 'kids' || p.store_type === 'kids'
                                              )}
                                              categories={categories}
                                              sortConfig={sortConfig}
                                              handleSort={handleSortWrapper}
                                              handleEditProduct={handleEditProduct2}
                                              handleDeleteProduct={handleDeleteProduct}
                                          />
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>
                          <TabsContent value="sneakers">
                              <Card>
                                  <CardHeader>
                                      <CardTitle>
                                          Sneakers
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="overflow-x-auto">
                                          <ProductTable
                                              filteredProducts={filteredProducts.filter(p =>
                                                  p.storeType === 'sneakers' || p.store_type === 'sneakers'
                                              )}
                                              categories={categories}
                                              sortConfig={sortConfig}
                                              handleSort={handleSortWrapper}
                                              handleEditProduct={handleEditProduct2}
                                              handleDeleteProduct={handleDeleteProduct}
                                          />
                                      </div>
                                  </CardContent>
                              </Card>
                          </TabsContent>
                      </Tabs>
                      <div className="mt-8">
                          <BrandManager />
                      </div>
                      <div className="mt-8">
                          <CategoryManager />
                      </div>
                  </>
              )}

              <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                  <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                      <DialogTitle>{isEditing ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
                      <div className="flex-grow overflow-y-auto pr-4">
                          <ProductForm
                              product={isEditing ? editingProduct! : newProduct}
                              isEditing={isEditing}
                              onSubmit={isEditing ? handleEditProduct : handleAddProduct}
                              setEditingProduct={setEditingProduct}
                              setNewProduct={setNewProduct}
                              categories={categories}
                          />
                      </div>
                      <div className="flex justify-end space-x-2 mt-4 p-4">
                          <Button variant="outline" onClick={handleCloseDialog}>Annuler</Button>
                          <Button type="submit" form="productForm">
                              {isEditing ? "Mettre à jour" : "Ajouter"}
                          </Button>
                      </div>
                  </DialogContent>
              </Dialog>
          </div>
      </AdminRoute>
  )
}

