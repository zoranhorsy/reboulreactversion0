"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  api,
  type Product,
  type Category,
  type Brand,
  toggleProductActive,
  getToken,
  login,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "@/components/admin/ProductForm";
import { Table, Button as GeistButton, Input as GeistInput, Select as GeistSelect, useToasts } from "@geist-ui/react";
import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import SearchLineIcon from "remixicon-react/SearchLineIcon";
import RefreshLineIcon from "remixicon-react/RefreshLineIcon";
import Edit2LineIcon from "remixicon-react/Edit2LineIcon";
import EyeLineIcon from "remixicon-react/EyeLineIcon";
import EyeCloseLineIcon from "remixicon-react/EyeCloseLineIcon";
import { handleSort } from "@/utils/productUtils";
import { BrandManager } from "@/components/admin/BrandManager";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useFilterWorker } from "@/hooks/useFilterWorker";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Simple login component for admin area
function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await login(email, password);
      if (result?.token) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        window.location.reload(); // Reload to update UI
      } else {
        throw new Error("Erreur de connexion");
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description:
          error instanceof Error ? error.message : "Impossible de se connecter",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion Admin</CardTitle>
        <CardDescription>
          Connectez-vous pour gérer les produits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Hook utilitaire responsive
function useIsMobile() {
  return useMediaQuery("(max-width: 640px)");
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    brand: "",
    store_type: "",
    store_reference: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "ascending" | "descending";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    filterProducts: filterWithWorker,
    sortProducts: sortWithWorker,
    isLoading: isWorkerLoading,
    error: workerError,
  } = useFilterWorker();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Check authentication status
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const applyFiltersFallback = useCallback(
    (search: string, filters: typeof activeFilters) => {
      let result = [...products];

      // Appliquer les filtres
      if (filters.category) {
        result = result.filter((p) => p.category === filters.category);
      }
      if (filters.brand) {
        result = result.filter((p) => p.brand === filters.brand);
      }
      if (filters.store_type) {
        result = result.filter((p) => p.store_type === filters.store_type);
      }
      if (filters.store_reference) {
        result = result.filter(
          (p) => p.store_reference === filters.store_reference,
        );
      }

      // Appliquer la recherche
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.store_reference?.toLowerCase().includes(searchLower),
        );
      }

      // Appliquer le tri et mettre à jour l'état
      if (sortConfig) {
        handleSort(
          sortConfig.key,
          sortConfig,
          setSortConfig,
          result,
          "all",
          setFilteredProducts,
        );
      } else {
        setFilteredProducts(result);
      }
    },
    [products, sortConfig],
  );

  const loadProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.fetchProducts({ page, limit: ITEMS_PER_PAGE });
      setProducts(response.products);
      setFilteredProducts(response.products);
      setTotalPages(response.totalPages || 1);
      setCurrentPage(response.currentPage || page);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.fetchCategories();
      setCategories(response);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadBrands = useCallback(async () => {
    try {
      const response = await api.fetchBrands();
      setBrands(response);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les marques.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadProducts(currentPage);
    loadCategories();
    loadBrands();
  }, [loadProducts, loadCategories, loadBrands, currentPage]);

  // Fonction de filtrage de base
  async function filterAndSort(search: string, filters: typeof activeFilters) {
    try {
      setIsLoading(true);

      // Préparer les options de filtrage pour le worker
      const filterOptions = {
        searchTerm: search,
        categories: filters.category ? [filters.category] : undefined,
        brands: filters.brand ? [filters.brand] : undefined,
        storeTypes: filters.store_type ? [filters.store_type] : undefined,
        storeReferences: filters.store_reference
          ? [filters.store_reference]
          : undefined,
      };

      // Filtrer les produits avec le worker
      let result = await filterWithWorker(products, filterOptions);

      // Appliquer le tri si nécessaire
      if (sortConfig) {
        result = await sortWithWorker(
          result,
          sortConfig.key,
          sortConfig.direction as "asc" | "desc",
        );
      }

      setFilteredProducts(result);
    } catch (error) {
      console.error("Erreur lors du filtrage:", error);
      // Fallback au filtrage côté client
      applyFiltersFallback(search, filters);
    } finally {
      setIsLoading(false);
    }
  }

  // Mémoriser la fonction avec useCallback
  const applyFiltersAndSort = useCallback(filterAndSort, [
    products,
    sortConfig,
    filterWithWorker,
    sortWithWorker,
    applyFiltersFallback,
  ]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      applyFiltersAndSort(value, activeFilters);
    },
    [activeFilters, applyFiltersAndSort],
  );

  const handleFilterChange = useCallback(
    (
      type: "category" | "brand" | "store_type" | "store_reference",
      value: string,
    ) => {
      const newFilters = { ...activeFilters, [type]: value };
      setActiveFilters(newFilters);
      applyFiltersAndSort(searchTerm, newFilters);
    },
    [activeFilters, searchTerm, applyFiltersAndSort],
  );

  useEffect(() => {
    if (workerError) {
      applyFiltersFallback(searchTerm, activeFilters);
      toast({
        title: "Erreur de filtrage",
        description:
          "Le filtrage optimisé n'est pas disponible. Mode standard utilisé.",
        variant: "destructive",
      });
    }
  }, [workerError, activeFilters, applyFiltersFallback, searchTerm, toast]);

  const handleProductSubmit = async (productData: Product) => {
    try {
      // Nettoyage et formatage des images
      let formattedImages: string[] = [];
      if (productData.images && Array.isArray(productData.images)) {
        formattedImages = productData.images
          .map((img) => {
            if (typeof img === "string") {
              return img;
            }
            if (typeof img === "object" && img !== null && "url" in img) {
              return img.url;
            }
            return null;
          })
          .filter((url): url is string => url !== null);
      }
      // Nettoyage des données avant l'envoi
      const cleanedProductData: any = {
        ...productData,
        name: productData.name || "",
        description: productData.description || "",
        price: Number(productData.price) || 0,
        category_id: Number(productData.category_id) || 0,
        brand_id: Number(productData.brand_id) || 0,
        store_type: productData.store_type || "adult",
        featured: Boolean(productData.featured),
        active: Boolean(productData.active),
        new: Boolean(productData.new),
        variants: Array.isArray(productData.variants)
          ? productData.variants
          : [],
        tags: Array.isArray(productData.tags) ? productData.tags : [],
        details: Array.isArray(productData.details) ? productData.details : [],
        sku: productData.sku || null,
        store_reference: productData.store_reference || null,
        weight: productData.weight || null,
        dimensions: productData.dimensions || null,
        material: productData.material || null,
        images: formattedImages,
      };
      // Suppression des champs non nécessaires ou problématiques
      delete cleanedProductData.created_at;
      delete cleanedProductData.updated_at;
      delete cleanedProductData._actiontype;
      delete cleanedProductData.imagesText;
      delete cleanedProductData.reviews_count;
      delete cleanedProductData.rating;
      delete cleanedProductData.reviews;
      delete cleanedProductData.questions;
      delete cleanedProductData.faqs;
      delete cleanedProductData.size_chart;
      delete cleanedProductData.image;
      delete cleanedProductData.image_url;
      delete cleanedProductData.brand;
      delete cleanedProductData.category;
      // Déterminer l'endpoint selon store_type
      let endpoint = "/api/products";
      if (cleanedProductData.store_type === "sneakers") {
        endpoint = "/api/sneakers-products";
      } else if (cleanedProductData.store_type === "kids") {
        endpoint = "/api/minots-products";
      } else if (
        cleanedProductData.store_type === "cpcompany" ||
        cleanedProductData.store_type === "corner"
      ) {
        endpoint = "/api/corner-products";
      }
      // Auth token
      const token = getToken();
      let updatedProduct;
      try {
        if (editingProduct) {
          // UPDATE (PUT)
          updatedProduct = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app"}${endpoint}/${editingProduct.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify(cleanedProductData),
            },
          ).then((res) => res.json());
          toast({
            title: "Succès",
            description: "Le produit a été mis à jour avec succès.",
          });
        } else {
          // CREATE (POST)
          updatedProduct = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app"}${endpoint}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify(cleanedProductData),
            },
          ).then((res) => res.json());
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
        console.error("API error details:", error);
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Erreur API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("handleProductSubmit global error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur API",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    setDeletingProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const directDeleteProduct = async (productId: number): Promise<boolean> => {
    try {
      const token = getToken();
      const url = `https://reboul-store-api-production.up.railway.app/api/products/${productId}`;

      // Tentative DELETE standard
      let response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        return true;
      }

      // Tentative avec POST et _method=DELETE
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          "X-HTTP-Method-Override": "DELETE",
        },
        body: JSON.stringify({ _method: "DELETE" }),
      });

      if (response.ok) {
        return true;
      }

      // Dernière tentative explicite
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ _method: "DELETE" }),
      });

      if (response.ok) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  const bypassDeleteProduct = async (productId: number): Promise<boolean> => {
    try {
      // Obtenir le token
      const token = getToken();

      // Au lieu de DELETE, nous allons utiliser PATCH avec un flag _delete: true
      // Certaines API sont configurées pour gérer cette approche
      const url = `https://reboul-store-api-production.up.railway.app/api/products/${productId}`;

      // Requête PATCH explicite avec flag de suppression
      const response = await fetch(url, {
        method: "PATCH", // Essayer PATCH au lieu de DELETE
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          _method: "DELETE", // Certaines API reconnaissent cette convention
          _delete: true,
          soft_delete: true,
          id: productId,
        }),
      });

      // Si PATCH ne fonctionne pas, essayons de désactiver le produit en dernier recours
      if (!response.ok) {
        const deactivateResponse = await api.toggleProductActive(
          productId.toString(),
          false,
        );

        if (deactivateResponse) {
          return true;
        }

        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!deletingProductId) {
      return;
    }

    try {
      setIsLoading(true);

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
      // En cas d'échec, tenter de simplement désactiver le produit
      try {
        const disableResult = await api.toggleProductActive(
          deletingProductId.toString(),
          false,
        );

        if (disableResult) {
          toast({
            title: "Information",
            description:
              "Le produit n'a pas pu être supprimé mais a été désactivé avec succès.",
          });
          await loadProducts();
        } else {
          throw new Error("Même la désactivation a échoué");
        }
      } catch (fallbackError) {
        toast({
          title: "Erreur",
          description:
            "Impossible de supprimer ou désactiver le produit. Veuillez réessayer plus tard.",
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
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (product: Product) => {
    try {
      // Appeler la nouvelle méthode spécifique qui contourne la validation complète
      await toggleProductActive(product.id.toString(), !product.active);

      // Afficher un message de succès
      toast({
        title: "Succès",
        description: `Le produit a été ${!product.active ? "activé" : "désactivé"} avec succès.`,
      });

      // Recharger les produits pour mettre à jour l'interface
      await loadProducts();
    } catch (error) {
      try {
        // Méthode de secours avec les champs minimaux requis
        await api.updateProduct(product.id.toString(), {
          name: product.name,
          description: product.description || "Description",
          price: product.price || 0,
          category_id: product.category_id,
          brand_id: product.brand_id,
          active: !product.active,
        });

        toast({
          title: "Succès",
          description: `Le produit a été ${!product.active ? "activé" : "désactivé"} avec succès.`,
        });

        // Recharger les produits
        await loadProducts();
      } catch (fallbackError) {
        // Afficher un message d'erreur plus détaillé
        const errorMessage =
          error instanceof Error
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
            description: `${result.purgedCount} produits ont été purgés, mais certains produits n'ont pas pu être traités.`,
          });
        } else {
          toast({
            title: "Échec de la purge",
            description:
              "Aucun produit n'a pu être purgé. Veuillez réessayer plus tard.",
            variant: "destructive",
          });
        }
      }

      // Rafraîchir la liste après la purge
      await loadProducts();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la purge des produits supprimés.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isAuthenticated ? (
        <div className="my-8">
          <AdminLoginForm />
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="brands">Marques</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg md:text-xl">
                        Gestion des produits
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm md:text-base">
                        Gérez votre catalogue de produits
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                          if (!open) handleCloseDialog();
                          setIsDialogOpen(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button onClick={handleAddProduct} className="gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 w-full sm:w-auto">
                            <AddCircleLineIcon size={18} />
                            Ajouter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <div className="flex flex-col space-y-1.5 text-left">
                            <DialogTitle className="text-base sm:text-lg md:text-xl">
                              {editingProduct
                                ? "Modifier le produit"
                                : "Ajouter un produit"}
                            </DialogTitle>
                          </div>
                          <ProductForm
                            product={editingProduct}
                            onSubmit={handleProductSubmit}
                            categories={categories}
                            brands={brands}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button onClick={purgeDeletedProducts} className="gap-2 text-xs sm:text-sm h-8 sm:h-9" disabled={isLoading}>
                        <RefreshLineIcon size={18} />
                        Vider la corbeille
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="relative w-full">
                      <span>🔍</span>
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                        className="pl-7 sm:pl-8 w-full h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <Select value={activeFilters.category || "all"} onValueChange={val => handleFilterChange("category", val === "all" ? "" : val)}>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={activeFilters.brand || "all"} onValueChange={val => handleFilterChange("brand", val === "all" ? "" : val)}>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Toutes les marques" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les marques</SelectItem>
                          {brands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={activeFilters.store_type || "all"} onValueChange={val => handleFilterChange("store_type", val === "all" ? "" : val)}>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Tous les magasins" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les magasins</SelectItem>
                          <SelectItem value="adult">Adulte</SelectItem>
                          <SelectItem value="kids">Enfant</SelectItem>
                          <SelectItem value="sneakers">Sneakers</SelectItem>
                          <SelectItem value="cpcompany">THE CORNER</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                        placeholder="Filtrer par réf. magasin"
                        value={activeFilters.store_reference}
                        onChange={e => handleFilterChange("store_reference", e.target.value)}
                      />

                      {(activeFilters.category ||
                        activeFilters.brand ||
                        activeFilters.store_type ||
                        activeFilters.store_reference) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap"
                          onClick={() => {
                            setActiveFilters({
                              category: "",
                              brand: "",
                              store_type: "",
                              store_reference: "",
                            });
                            applyFiltersAndSort("", {
                              category: "",
                              brand: "",
                              store_type: "",
                              store_reference: "",
                            });
                          }}
                        >
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="rounded-md border">
                    {isMobile ? (
                      <div className="flex flex-col gap-3">
                        {filteredProducts.map((row) => (
                          <div key={row.id} className="rounded-lg border p-3 bg-background shadow-sm flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-base truncate max-w-[60%]">{row.name}</div>
                              <div className="text-xs text-muted-foreground">{brands.find(b => b.id === row.brand_id)?.name || "-"}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="font-medium">Catégorie :</span> {categories.find(c => c.id === row.category_id)?.name || "-"}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="font-medium">Prix :</span> {row.price} €
                            </div>
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="font-medium">Variants :</span>
                              {Array.isArray(row.variants) && row.variants.length > 0 ? (
                                Object.entries(row.variants.reduce((acc, v) => {
                                  if (!acc[v.color]) acc[v.color] = { sizes: [], stock: 0 };
                                  acc[v.color].sizes.push(v.size);
                                  acc[v.color].stock += v.stock || 0;
                                  return acc;
                                }, {} as Record<string, { sizes: string[]; stock: number }>)).map(([color, { sizes, stock }]) => {
                                  const displaySizes = sizes.slice(0, 4).join(", ");
                                  const more = sizes.length > 4 ? ", …" : "";
                                  return (
                                    <div key={color} className="truncate">
                                      <span className="font-semibold">{color}</span>
                                      <span> : {displaySizes}{more} </span>
                                      <span className="text-muted-foreground">(stock: {stock})</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}><Edit2LineIcon size={18} /></Button>
                              <Button size="icon" variant="destructive" onClick={() => handleDelete(Number(row.id))}><DeleteBinLineIcon size={18} /></Button>
                              <Button size="icon" variant="outline" onClick={() => handleToggleActive(row)}>{row.active ? <EyeCloseLineIcon size={18} /> : <EyeLineIcon size={18} />}</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Table data={filteredProducts} className="w-full">
                        <Table.Column prop="name" label="Nom" />
                        <Table.Column prop="brand" label="Marque" render={(value, row) => {
                          const product = row as unknown as Product;
                          return <>{brands.find(b => b.id === product.brand_id)?.name || "-"}</>;
                        }} />
                        <Table.Column prop="category" label="Catégorie" render={(value, row) => {
                          const product = row as unknown as Product;
                          return <>{categories.find(c => c.id === product.category_id)?.name || "-"}</>;
                        }} />
                        <Table.Column
                          prop="variants"
                          label="Variants"
                          render={(_, row) => {
                            if (!Array.isArray(row.variants) || row.variants.length === 0) return <span className="text-muted-foreground">-</span>;
                            const byColor = row.variants.reduce((acc: Record<string, { sizes: string[]; stock: number }>, v: any) => {
                              if (!acc[v.color]) acc[v.color] = { sizes: [], stock: 0 };
                              acc[v.color].sizes.push(v.size);
                              acc[v.color].stock += v.stock || 0;
                              return acc;
                            }, {});
                            return (
                              <div className="space-y-1">
                                {Object.entries(byColor).map(([color, { sizes, stock }]) => {
                                  const displaySizes = sizes.slice(0, 4).join(", ");
                                  const more = sizes.length > 4 ? ", …" : "";
                                  return (
                                    <div key={color} className="truncate text-xs">
                                      <span className="font-semibold">{color}</span>
                                      <span> : {displaySizes}{more} </span>
                                      <span className="text-muted-foreground">(stock: {stock})</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }}
                        />
                        <Table.Column prop="price" label="Prix" render={(value) => <>{value} €</>} />
                        <Table.Column prop="active" label="Actif" render={(value) => value ? <EyeLineIcon size={18} /> : <EyeCloseLineIcon size={18} />} />
                        <Table.Column prop="actions" label="Actions" render={(_, row) => {
                          const product = row as unknown as Product;
                          return (
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}><Edit2LineIcon size={16} /></Button>
                              <Button size="icon" variant="destructive" onClick={() => handleDelete(Number(product.id))}><DeleteBinLineIcon size={16} /></Button>
                              <Button size="icon" variant="outline" onClick={() => handleToggleActive(product)}>{product.active ? <EyeCloseLineIcon size={16} /> : <EyeLineIcon size={16} />}</Button>
                            </div>
                          );
                        }} />
                      </Table>
                    )}
                  </div>
                  {/* Pagination UI (à placer sous la table/liste) */}
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm font-medium">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || isLoading}
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
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action
                  est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingProductId(null);
                  }}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
