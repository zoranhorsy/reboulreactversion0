import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Product } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProductImages } from "@/components/products/ProductImages";
import { getColorInfo, isWhiteColor } from "@/config/productColors";
import { useCart } from "@/app/contexts/CartContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CartItemVariant } from "@/lib/types/cart";
import { api } from "@/lib/api";
import Image from "next/image";
import { useProductMetadata } from "@/hooks/useProductMetadata";

// Import du mapping des couleurs
const colorMap: Record<string, { hex: string; label: string }> = {
  noir: { hex: "#000000", label: "Noir" },
  blanc: { hex: "#FFFFFF", label: "Blanc" },
  gris: { hex: "#808080", label: "Gris" },
  marine: { hex: "#1B1B3A", label: "Marine" },
  bleu: { hex: "#0052CC", label: "Bleu" },
  rouge: { hex: "#E12B38", label: "Rouge" },
  vert: { hex: "#2D8C3C", label: "Vert" },
  jaune: { hex: "#FFD700", label: "Jaune" },
  orange: { hex: "#FFA500", label: "Orange" },
  violet: { hex: "#800080", label: "Violet" },
  rose: { hex: "#FFB6C1", label: "Rose" },
  marron: { hex: "#8B4513", label: "Marron" },
  beige: { hex: "#F5F5DC", label: "Beige" },
};

interface ProductVariantModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (size: string, color: string, quantity: number) => void;
}

export function ProductVariantModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductVariantModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const {
    brands,
    categories,
    isLoading: isMetadataLoading,
  } = useProductMetadata();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  // Extraire les tailles et couleurs uniques des variantes
  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size)),
  );
  const availableColors = Array.from(
    new Set(product.variants.map((v) => v.color)),
  );

  // Vérifier si une combinaison taille/couleur est disponible
  const isVariantAvailable = (size: string, color: string) => {
    return product.variants.some(
      (v) => v.size === size && v.color === color && v.stock > 0,
    );
  };

  // Vérifier si une taille est disponible avec la couleur sélectionnée
  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return true;
    return isVariantAvailable(size, selectedColor);
  };

  // Vérifier si une couleur est disponible avec la taille sélectionnée
  const isColorAvailable = (color: string) => {
    if (!selectedSize) return true;
    return isVariantAvailable(selectedSize, color);
  };

  // Obtenir le stock pour une combinaison donnée
  const getVariantStock = (size: string, color: string) => {
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color,
    );
    return variant?.stock || 0;
  };

  // Calculer le stock total du produit
  const getTotalStock = () => {
    if (
      product.variants &&
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      return product.variants.reduce(
        (total, variant) => total + (variant.stock || 0),
        0,
      );
    }
    return 0;
  };

  const totalStock = getTotalStock();

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      const variant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor,
      );

      if (!variant) {
        console.error("Variant not found");
        return;
      }

      console.log("Adding to cart with variant:", {
        size: selectedSize,
        color: selectedColor,
        stock: variant.stock,
        quantity: quantity,
      });

      onAddToCart(selectedSize, selectedColor, quantity);
      onClose();
    }
  };

  const maxStock =
    selectedSize && selectedColor
      ? getVariantStock(selectedSize, selectedColor)
      : 0;

  const canAddToCart =
    selectedSize &&
    selectedColor &&
    isVariantAvailable(selectedSize, selectedColor) &&
    quantity > 0 &&
    quantity <= maxStock;

  const images = [
    product.image_url,
    ...(Array.isArray(product.images)
      ? product.images.map((img) => {
          if (typeof img === "string") return img;
          if (img && typeof img === "object" && "url" in img) return img.url;
          return null;
        })
      : []),
  ].filter(Boolean) as string[];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-zinc-900 border-zinc-800 text-white overflow-hidden">
        {/* Header minimaliste avec bouton de fermeture */}
        <div className="flex items-center justify-center p-3 bg-zinc-900 sticky top-0 z-20 border-b border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 absolute left-2 text-white hover:bg-zinc-800"
            onClick={onClose}
          >
            <span>×</span>
          </Button>
          <h2 className="text-base font-semibold text-center truncate max-w-[80%]">
            {product.name}
          </h2>
        </div>

        {/* Conteneur principal avec défilement */}
        <ScrollArea className="max-h-[calc(92vh-120px)]">
          {/* Image qui remplit tout son conteneur */}
          <div className="relative bg-zinc-900">
            <div className="relative w-full aspect-square">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                className="object-cover bg-white"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />

              {/* Flèches de navigation plus visibles */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50 w-8 h-8"
                    onClick={prevImage}
                  >
                    <span>←</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full hover:bg-black/50 w-8 h-8"
                    onClick={nextImage}
                  >
                    <span>→</span>
                  </Button>
                </>
              )}
            </div>

            {/* Indicateurs de page en bas de l'image */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentImageIndex === idx ? "bg-white" : "bg-white/40",
                    )}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Prix et statut de stock */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-zinc-800">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(product.price)}
              </p>
              {/* Marque et catégorie */}
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                {product.brand_id && brands[product.brand_id] && (
                  <span className="text-xs text-zinc-400 font-medium">
                    {brands[product.brand_id]}
                  </span>
                )}
                {product.brand_id &&
                  brands[product.brand_id] &&
                  product.category_id &&
                  categories[product.category_id] && (
                    <span className="text-xs text-zinc-500">•</span>
                  )}
                {product.category_id && categories[product.category_id] && (
                  <span className="text-xs text-zinc-500">
                    {categories[product.category_id]}
                  </span>
                )}
              </div>
              {product.sku && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Réf: {product.sku}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Badges de statut */}
              <div className="flex flex-col items-end gap-1.5">
                {totalStock > 0 ? (
                  <Badge className="bg-green-500/80 text-white border-0">
                    En stock
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/80 text-white border-0">
                    Rupture
                  </Badge>
                )}
                {product.new && (
                  <Badge className="bg-blue-500/80 text-white border-0">
                    Nouveau
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-amber-500/80 text-white border-0">
                    Populaire
                  </Badge>
                )}
                {product.old_price && product.old_price > product.price && (
                  <Badge className="bg-red-500/80 text-white border-0">
                    Promo
                  </Badge>
                )}
              </div>
              {/* Favoris */}
            </div>
          </div>

          {/* Zone des badges contextuels - Propriétés manquantes, donc on affiche des badges basés sur store_type */}
          <div className="px-4 py-2 border-b border-zinc-800 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="border-zinc-700 text-zinc-300 text-xs"
            >
              {product.store_type === "adult"
                ? "Adulte"
                : product.store_type === "kids"
                  ? "Enfant"
                  : product.store_type === "sneakers"
                    ? "Sneakers"
                    : product.store_type === "cpcompany"
                      ? "C.P Company"
                      : ""}
            </Badge>
            {product.category && (
              <Badge
                variant="outline"
                className="border-zinc-700 text-zinc-300 text-xs"
              >
                {product.category}
              </Badge>
            )}
            {product.brand && (
              <Badge
                variant="outline"
                className="border-zinc-700 text-zinc-300 text-xs"
              >
                {product.brand}
              </Badge>
            )}
          </div>

          {/* Zone de contenu principale */}
          <div className="px-4 py-3 space-y-4">
            {/* Description produit bien visible */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white">Description</h3>
                <p className="text-sm text-zinc-300">{product.description}</p>
              </div>
            )}

            {/* Sélection des tailles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label
                  htmlFor="size-select"
                  className="text-sm font-medium text-zinc-300"
                >
                  Taille
                </Label>
              </div>

              <RadioGroup
                value={selectedSize}
                onValueChange={setSelectedSize}
                className="grid grid-cols-3 gap-2"
              >
                {availableSizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <div key={size}>
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="sr-only"
                        disabled={!available}
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center h-10 rounded border border-zinc-700 text-sm peer-data-[state=checked]:bg-white
                          peer-data-[state=checked]:text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-30
                          hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        {size}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Sélecteur de couleurs */}
            {availableColors.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <span className="mr-2">●</span>
                  <Label className="text-sm text-zinc-300">
                    Couleur:{" "}
                    <span className="font-medium text-white">
                      {getColorInfo(selectedColor).label || selectedColor}
                    </span>
                  </Label>
                </div>

                <RadioGroup
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                  className="flex gap-2 flex-wrap"
                >
                  {availableColors.map((color) => {
                    const colorInfo = getColorInfo(color);
                    const isOutOfStock = !product.variants.some(
                      (v) =>
                        v.color === color &&
                        v.size === selectedSize &&
                        v.stock > 0,
                    );
                    const isWhite = isWhiteColor(colorInfo.hex);

                    return (
                      <div key={color} className="relative">
                        <RadioGroupItem
                          value={color}
                          id={`color-${color}`}
                          className="sr-only"
                          disabled={isOutOfStock}
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className={cn(
                            "w-9 h-9 rounded-full cursor-pointer",
                            "flex items-center justify-center border transition-all",
                            isOutOfStock && "cursor-not-allowed opacity-50",
                            selectedColor === color
                              ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                              : "",
                            isWhite && "border-zinc-400",
                          )}
                          style={{ backgroundColor: colorInfo.hex }}
                        >
                          {selectedColor === color && (
                            <span className="text-black text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Sélecteur de quantité */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-zinc-300">Quantité</Label>
                {maxStock > 0 && (
                  <span className="text-xs text-zinc-400">
                    {maxStock} disponible{maxStock > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <span>-</span>
                </Button>
                <div className="w-16 h-10 border border-zinc-700 rounded flex items-center justify-center text-sm font-medium mx-3">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() =>
                    setQuantity(Math.min(maxStock || 10, quantity + 1))
                  }
                  disabled={quantity >= (maxStock || 10)}
                >
                  <span>+</span>
                </Button>
              </div>
            </div>

            {/* Accordéon pour les détails supplémentaires */}
            <div className="mt-5 border-t border-zinc-800 pt-4">
              <div className="space-y-3">
                {/* Détails complets - SANS description */}
                {product.details && (
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-300"
                      onClick={() => {
                        const detailsEl =
                          document.getElementById("product-details");
                        detailsEl?.classList.toggle("hidden");
                        const icon = document.getElementById("details-icon");
                        icon?.classList.toggle("rotate-90");
                      }}
                    >
                      <span>Caractéristiques</span>
                      <span>→</span>
                    </button>
                    <div id="product-details" className="hidden pt-2 pl-2">
                      <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                        {Array.isArray(product.details) &&
                        product.details.length > 0
                          ? product.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))
                          : generateDefaultCharacteristics()}

                        {/* Ajout des informations techniques */}
                        {product.material && (
                          <li>
                            <span className="font-medium">Matériau:</span>{" "}
                            {product.material}
                          </li>
                        )}
                        {product.dimensions && (
                          <li>
                            <span className="font-medium">Dimensions:</span>{" "}
                            {product.dimensions}
                          </li>
                        )}
                        {product.weight && (
                          <li>
                            <span className="font-medium">Poids:</span>{" "}
                            {product.weight}g
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Caractéristiques extraites de la description si pas de détails */}
                {!product.details && product.description && (
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-300"
                      onClick={() => {
                        const detailsEl = document.getElementById(
                          "product-details-from-desc",
                        );
                        detailsEl?.classList.toggle("hidden");
                        const icon =
                          document.getElementById("details-desc-icon");
                        icon?.classList.toggle("rotate-90");
                      }}
                    >
                      <span>Caractéristiques</span>
                      <span>→</span>
                    </button>
                    <div
                      id="product-details-from-desc"
                      className="hidden pt-2 pl-2"
                    >
                      {/* Si la description contient des points (•, -, *, etc.), on les sépare */}
                      {product.description.includes("•") ||
                      product.description.includes("-") ||
                      product.description.includes("*") ? (
                        <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                          {product.description
                            .split(/[•\-\*]/)
                            .map((point, index) =>
                              point.trim() ? (
                                <li key={index}>{point.trim()}</li>
                              ) : null,
                            )}

                          {/* Ajout des informations techniques */}
                          {product.material && (
                            <li>
                              <span className="font-medium">Matériau:</span>{" "}
                              {product.material}
                            </li>
                          )}
                          {product.dimensions && (
                            <li>
                              <span className="font-medium">Dimensions:</span>{" "}
                              {product.dimensions}
                            </li>
                          )}
                          {product.weight && (
                            <li>
                              <span className="font-medium">Poids:</span>{" "}
                              {product.weight}g
                            </li>
                          )}
                        </ul>
                      ) : (
                        // Sinon, on affiche des caractéristiques génériques basées sur le type
                        <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                          {generateCharacteristicsFromType(
                            product.store_type,
                            product.description,
                          )}

                          {/* Ajout des informations techniques */}
                          {product.material && (
                            <li>
                              <span className="font-medium">Matériau:</span>{" "}
                              {product.material}
                            </li>
                          )}
                          {product.dimensions && (
                            <li>
                              <span className="font-medium">Dimensions:</span>{" "}
                              {product.dimensions}
                            </li>
                          )}
                          {product.weight && (
                            <li>
                              <span className="font-medium">Poids:</span>{" "}
                              {product.weight}g
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Livraison et retours */}
                <div>
                  <button
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-300"
                    onClick={() => {
                      const deliveryEl =
                        document.getElementById("product-delivery");
                      deliveryEl?.classList.toggle("hidden");
                      const icon = document.getElementById("delivery-icon");
                      icon?.classList.toggle("rotate-90");
                    }}
                  >
                    <span>Livraison et retours</span>
                    <span>→</span>
                  </button>
                  <div id="product-delivery" className="hidden pt-2 pl-2">
                    <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
                      <li>Livraison standard en 3-5 jours ouvrés</li>
                      <li>Livraison gratuite à partir de 100€</li>
                      <li>Retours gratuits sous 30 jours</li>
                      <li>Échange possible en magasin</li>
                    </ul>
                  </div>
                </div>

                {/* Guide des tailles */}
                <div>
                  <button
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-300"
                    onClick={() => {
                      const sizeGuideEl =
                        document.getElementById("product-size-guide");
                      sizeGuideEl?.classList.toggle("hidden");
                      const icon = document.getElementById("size-guide-icon");
                      icon?.classList.toggle("rotate-90");
                    }}
                  >
                    <span>Guide des tailles</span>
                    <span>→</span>
                  </button>
                  <div id="product-size-guide" className="hidden pt-2 pl-2">
                    <p className="text-xs text-zinc-400 mb-2">
                      Ce produit est conforme aux tailles standards. En cas de
                      doute, prenez une taille au-dessus.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full mt-1"
                    >
                      <span>Ruler</span>
                      Voir le guide des tailles
                    </Button>
                  </div>
                </div>

                {/* Composition et entretien */}
                {product.material && (
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-zinc-300"
                      onClick={() => {
                        const compositionEl = document.getElementById(
                          "product-composition",
                        );
                        compositionEl?.classList.toggle("hidden");
                        const icon =
                          document.getElementById("composition-icon");
                        icon?.classList.toggle("rotate-90");
                      }}
                    >
                      <span>Composition et entretien</span>
                      <span>→</span>
                    </button>
                    <div id="product-composition" className="hidden pt-2 pl-2">
                      <p className="text-xs text-zinc-400">
                        Matériau: {product.material}
                      </p>
                      {product.dimensions && (
                        <div className="mt-2">
                          <p className="text-xs text-zinc-300 font-medium mb-1">
                            Dimensions:
                          </p>
                          <p className="text-xs text-zinc-400">
                            {product.dimensions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section expédition avec promesse de livraison */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <span>📦</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-300">
                    Commander aujourd&apos;hui
                  </p>
                  <p className="text-xs text-zinc-400">
                    Livraison estimée:{" "}
                    {new Date(
                      Date.now() + 4 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Bouton d'ajout au panier */}
        <div className="p-4 pt-3 bg-zinc-900 border-t border-zinc-800 sticky bottom-0">
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="w-full h-11 text-sm font-medium bg-white text-black hover:bg-zinc-200"
            variant="default"
          >
            <span>🛒</span>
            Ajouter au panier
          </Button>
          {!canAddToCart && !(selectedSize && selectedColor) && (
            <p className="text-xs text-zinc-400 text-center mt-2">
              Veuillez sélectionner une taille et une couleur
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateDefaultCharacteristics() {
  return (
    <>
      <li>Matériau de haute qualité</li>
      <li>Conçu pour un usage quotidien</li>
      <li>Finition soignée</li>
      <li>Conforme aux standards de l&apos;industrie</li>
    </>
  );
}

function generateCharacteristicsFromType(
  type: string | undefined,
  description: string,
) {
  // Essayer d'extraire les points saillants de la description
  const sentences = description
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  const keyPoints = sentences.slice(0, Math.min(sentences.length, 3));

  // Points spécifiques selon le type de produit
  if (
    type?.toLowerCase().includes("sneaker") ||
    type?.toLowerCase().includes("chaussure")
  ) {
    return (
      <>
        <li>Semelle intérieure amortissante</li>
        <li>Semelle extérieure antidérapante</li>
        <li>Maintien optimal du pied</li>
        <li>Respirant pour un confort de longue durée</li>
        {keyPoints.map((point, idx) => (
          <li key={`desc-${idx}`}>{point.trim()}</li>
        ))}
      </>
    );
  } else if (
    type?.toLowerCase().includes("veste") ||
    type?.toLowerCase().includes("manteau")
  ) {
    return (
      <>
        <li>Protection contre les intempéries</li>
        <li>Fermetures de qualité</li>
        <li>Poches fonctionnelles</li>
        <li>Design ergonomique pour une liberté de mouvement</li>
        {keyPoints.map((point, idx) => (
          <li key={`desc-${idx}`}>{point.trim()}</li>
        ))}
      </>
    );
  } else if (
    type?.toLowerCase().includes("t-shirt") ||
    type?.toLowerCase().includes("polo")
  ) {
    return (
      <>
        <li>Coupe ajustée</li>
        <li>Tissu doux au toucher</li>
        <li>Ne se déforme pas au lavage</li>
        <li>Couleurs résistantes</li>
        {keyPoints.map((point, idx) => (
          <li key={`desc-${idx}`}>{point.trim()}</li>
        ))}
      </>
    );
  } else {
    // Cas générique
    return (
      <>
        <li>Qualité supérieure</li>
        <li>Produit durable</li>
        <li>Design fonctionnel</li>
        <li>Facile d&apos;entretien</li>
        {keyPoints.map((point, idx) => (
          <li key={`desc-${idx}`}>{point.trim()}</li>
        ))}
      </>
    );
  }
}
