"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product, type Variant } from "@/lib/types/product";
import { type Category } from "@/lib/types/category";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import Image from "next/image";
import VariantManager from "./VariantManager";

interface ProductTableProps {
  filteredProducts: Product[];
  categories: Category[];
  brands: { id: number; name: string }[];
  sortConfig: {
    key: keyof Product;
    direction: "ascending" | "descending";
  } | null;
  handleSort: (key: keyof Product) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (productId: number) => void;
  handleToggleActive: (product: Product) => Promise<void>;
}

export function ProductTable({
  filteredProducts,
  categories,
  brands,
  sortConfig,
  handleSort,
  handleEditProduct,
  handleDeleteProduct,
  handleToggleActive,
}: ProductTableProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeProductVariants, setActiveProductVariants] =
    useState<Product | null>(null);
  const [editedVariants, setEditedVariants] = useState<Variant[]>([]);
  const [isSaving, setSaving] = useState(false);

  // Met à jour les variants modifiés lorsqu'un nouveau produit est sélectionné
  useEffect(() => {
    if (activeProductVariants) {
      setEditedVariants(
        activeProductVariants.variants
          ? [...activeProductVariants.variants]
          : [],
      );
    }
  }, [activeProductVariants]);

  const getSortIcon = (key: keyof Product) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span>↕️</span>;
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  const renderSortableHeader = (key: keyof Product, label: string) => (
    <div
      className="flex items-center cursor-pointer hover:text-primary transition-colors"
      onClick={() => handleSort(key)}
    >
      {label}
      {getSortIcon(key)}
    </div>
  );

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Non catégorisé";
  };

  const getBrandName = (brandId: number) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : "Non défini";
  };

  const getStockStatus = (product: Product) => {
    const totalStock =
      product.variants?.reduce(
        (total, variant) => total + (variant.stock || 0),
        0,
      ) || 0;

    if (totalStock === 0) {
      return (
        <Badge variant="destructive" className="whitespace-nowrap">
          <span>📦</span>
          Rupture
        </Badge>
      );
    } else if (totalStock < 5) {
      return (
        <Badge
          variant="secondary"
          className="whitespace-nowrap bg-yellow-500/15 text-yellow-500"
        >
          <span>📦</span>
          Stock faible ({totalStock})
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className="whitespace-nowrap bg-green-500/15 text-green-500"
        >
          <span>📦</span>
          En stock ({totalStock})
        </Badge>
      );
    }
  };

  const getStoreTypeBadge = (type: string) => {
    switch (type) {
      case "adult":
        return (
          <Badge variant="outline" className="text-blue-500">
            Adulte
          </Badge>
        );
      case "kids":
        return (
          <Badge variant="outline" className="text-pink-500">
            Enfant
          </Badge>
        );
      case "sneakers":
        return (
          <Badge variant="outline" className="text-purple-500">
            Sneakers
          </Badge>
        );
      case "cpcompany":
        return (
          <Badge variant="outline" className="text-orange-500">
            C.P COMPANY
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getImageUrl = (product: Product): string => {
    if (product.images?.[0]) {
      if (
        typeof product.images[0] === "string" &&
        product.images[0].trim() !== ""
      ) {
        return product.images[0];
      } else if (
        typeof product.images[0] === "object" &&
        product.images[0] !== null
      ) {
        if (
          "url" in product.images[0] &&
          product.images[0].url &&
          product.images[0].url.trim() !== ""
        ) {
          return product.images[0].url;
        }
      }
    }
    return (product.image_url && product.image_url.trim() !== "") ||
      (product.image && product.image.trim() !== "")
      ? product.image_url || product.image
      : "/placeholder.png";
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  const handleVariantsChange = (newVariants: Variant[]) => {
    setEditedVariants(newVariants);
  };

  const handleSaveVariants = async () => {
    if (!activeProductVariants) return;

    setSaving(true);
    try {
      // Simuler une opération d'enregistrement
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mise à jour du produit (à connecter à votre API)
      console.log("Variants mis à jour:", editedVariants);

      // Mettre à jour le produit dans l'état local
      const updatedProduct = {
        ...activeProductVariants,
        variants: editedVariants,
      };

      // Fermer la modal
      setActiveProductVariants(null);

      // Afficher une confirmation de succès (à implémenter)
      alert("Variantes mises à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des variantes:", error);
      alert("Une erreur est survenue lors de la mise à jour des variantes.");
    } finally {
      setSaving(false);
    }
  };

  // Ajouter une fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Ajouter une fonction pour calculer la marge
  const calculateMargin = (price: number, cost: number) => {
    if (!cost || cost <= 0) return "N/A";
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(1)}%`;
  };

  // Tronquer la description pour qu'elle ne soit pas trop longue
  const truncateDescription = (description: string, length: number = 60) => {
    if (!description) return "";
    return description.length > length
      ? description.substring(0, length) + "..."
      : description;
  };

  // Formatter les tags ou caractéristiques pour un affichage compact
  const formatItemsList = (items: string[] | undefined, limit: number = 3) => {
    if (!items || items.length === 0) return null;

    const visibleItems = items.slice(0, limit);
    const remainingCount = items.length - limit;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {visibleItems.map((item, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="text-[10px] px-1 py-0 h-4"
          >
            {item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge
            variant="outline"
            className="text-[10px] px-1 py-0 h-4 bg-muted/20"
          >
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead
              onClick={() => handleSort("name")}
              className="cursor-pointer"
            >
              {renderSortableHeader("name", "Produit")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("store_reference")}
              className="w-[120px] cursor-pointer hidden sm:table-cell"
            >
              {renderSortableHeader("store_reference", "Référence")}
            </TableHead>
            <TableHead onClick={() => handleSort("store_type")}>
              {renderSortableHeader("store_type", "Type")}
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead
              onClick={() => handleSort("price")}
              className="cursor-pointer w-[90px] text-right"
            >
              {renderSortableHeader("price", "Prix")}
            </TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-[50px] h-[50px] relative rounded-md overflow-hidden border border-border">
                    {imageErrors[product.id] ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span>❌</span>
                      </div>
                    ) : (
                      <Link href={`/produit/${product.id}`} target="_blank">
                        <Image
                          src={getImageUrl(product)}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="object-cover w-full h-full"
                          onError={() =>
                            handleImageError(product.id.toString())
                          }
                        />
                      </Link>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/produit/${product.id}`}
                      target="_blank"
                      className="hover:text-primary hover:underline transition-colors font-medium"
                    >
                      {product.name}
                    </Link>

                    {product.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {truncateDescription(product.description)}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {product.featured && (
                        <Badge className="text-[10px] px-1 h-4 bg-amber-500/15 text-amber-500 whitespace-nowrap">
                          Mis en avant
                        </Badge>
                      )}
                      {product.new && (
                        <Badge className="text-[10px] px-1 h-4 bg-blue-500/15 text-blue-500 whitespace-nowrap">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="font-mono text-xs">
                    {product.store_reference || "—"}
                  </div>
                  {product.sku && (
                    <div className="font-mono text-[10px] text-muted-foreground mt-1">
                      SKU: {product.sku}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStoreTypeBadge(product.store_type)}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Tags:
                        </span>
                        {formatItemsList(product.tags)}
                      </div>
                    )}
                    {product.details && product.details.length > 0 && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Caractéristiques:
                        </span>
                        {formatItemsList(product.details)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">
                    {product.price.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                  {product.old_price && product.old_price > product.price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {product.old_price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="whitespace-nowrap font-normal"
                  >
                    {getCategoryName(product.category_id)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-blue-500/5 text-blue-600 border-blue-200 whitespace-nowrap font-normal"
                  >
                    {getBrandName(product.brand_id)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => setActiveProductVariants(product)}
                  >
                    {getStockStatus(product)}
                  </Button>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div>
                          {product.active ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-200"
                            >
                              <span>✅</span>
                              Actif
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-500 border-red-200"
                            >
                              <span>❌</span>
                              Inactif
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Cliquez sur le bouton toggle pour{" "}
                          {product.active ? "désactiver" : "activer"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(product)}
                          >
                            {product.active ? <span>❌</span> : <span>✅</span>}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{product.active ? "Désactiver" : "Activer"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <span>✏️</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/produit/${product.id}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span>👁️</span>
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleDeleteProduct(Number(product.id))
                            }
                          >
                            <span>🗑️</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <span>📦</span>
                  <p>Aucun produit trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Modal pour afficher et modifier les variantes avec VariantManager */}
      <Dialog
        open={!!activeProductVariants}
        onOpenChange={(open) => !open && setActiveProductVariants(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl text-white">
                  Gestion des variantes
                </DialogTitle>
                <DialogDescription className="mt-1 text-zinc-400">
                  {activeProductVariants?.name}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-4 top-4 text-white hover:bg-zinc-800"
                onClick={() => setActiveProductVariants(null)}
              >
                <span>×</span>
                <span className="sr-only">Fermer</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 overflow-y-auto flex-grow bg-zinc-900">
            {activeProductVariants && (
              <VariantManager
                variants={editedVariants}
                onChange={handleVariantsChange}
              />
            )}
          </div>

          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setActiveProductVariants(null)}
              className="border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveVariants}
              disabled={isSaving}
              className="flex items-center bg-white text-black hover:bg-zinc-200"
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <span>💾</span>
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductTable;
