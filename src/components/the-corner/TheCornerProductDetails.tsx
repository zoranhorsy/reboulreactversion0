"use client";

import { Product, Variant } from "@/lib/types/product";
import { ProductImage } from "@/lib/types/product-image";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/contexts/CartContext";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import Link from "next/link";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getColorInfo, isWhiteColor } from "@/config/productColors";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/ProductGallery";
import {
  ColorSelector,
  SizeSelector,
} from "@/components/optimized/MemoizedComponents";
import { StockIndicator } from "@/components/StockIndicator";
import { SimilarProducts } from "@/components/SimilarProducts";
import { PageHeader } from "@/components/products/PageHeader";
import ProductInfo from "@/components/products/ProductInfo";
import { ProductActions } from "@/components/products/ProductActions";
import { TheCornerPageHeader } from "./components/TheCornerPageHeader";
import { TheCornerProductInfo } from "./components/TheCornerProductInfo";
import { TheCornerProductGallery } from "./components/TheCornerProductGallery";
import { TheCornerVariantSelector } from "./components/TheCornerVariantSelector";
import { TheCornerProductActions } from "./components/TheCornerProductActions";
import { TheCornerColorSelector } from "./components/TheCornerColorSelector";
import { TheCornerSizeSelector } from "./components/TheCornerSizeSelector";
import { TheCornerSimilarProducts } from "./components/TheCornerSimilarProducts";
import { SizeGuide } from "@/components/SizeGuide";
import { Separator } from "@/components/ui/separator";
import { ProductTechnicalSpecs } from "@/components/ProductTechnicalSpecs";
import { useFavorites } from "@/app/contexts/FavoritesContext";

interface TheCornerProductDetailsProps {
  product: Product;
  similarProducts: Product[];
}

export function TheCornerProductDetails({
  product,
  similarProducts,
}: TheCornerProductDetailsProps) {
  const { addItem: addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mettre à jour l'état isWishlist quand le produit change
  useEffect(() => {
    setIsWishlist(isFavorite(product.id));
  }, [product.id, isFavorite]);

  console.log("Product variants:", product.variants);

  // Extraire les tailles et couleurs uniques des variants
  const availableColors = product.variants
    ? Array.from(new Set(product.variants.map((variant) => variant.color)))
        .filter(Boolean)
        .sort()
    : [];

  const availableSizes = product.variants
    ? Array.from(new Set(product.variants.map((variant) => variant.size)))
        .filter(Boolean)
        .sort()
    : [];

  console.log("Available colors:", availableColors);
  console.log("Available sizes:", availableSizes);

  // Vérifier si le variant sélectionné est disponible
  const selectedVariant = product.variants?.find(
    (variant) =>
      variant.size === selectedSize && variant.color === selectedColor,
  );

  // Vérifier le stock disponible pour une couleur donnée
  const getColorStock = (color: string) => {
    if (!product.variants) return 0;
    return product.variants
      .filter((v) => v.color === color)
      .reduce((total, v) => total + (v.stock || 0), 0);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une taille et une couleur",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVariant) {
      toast({
        title: "Erreur",
        description: "Cette combinaison n'est pas disponible",
        variant: "destructive",
      });
      return;
    }

    if (selectedVariant.stock < quantity) {
      toast({
        title: "Erreur",
        description: "Stock insuffisant",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: `${product.id}-${selectedColor}-${selectedSize}`,
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image_url,
      storeType: 'the_corner' as const, // Ce composant est spécifiquement pour The Corner
      variant: {
        size: selectedSize,
        color: selectedColor,
        colorLabel: selectedColor,
        stock: selectedVariant.stock,
      },
    };

    addToCart(cartItem);

    toast({
      title: "Produit ajouté",
      description: "Le produit a été ajouté à votre panier",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papier",
      });
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isWishlist) {
        await removeFromFavorites(product.id, "corner");
        toast({
          title: "Retiré des favoris",
          description: `${product.name} a été retiré de vos favoris.`,
        });
      } else {
        await addToFavorites(product.id, "corner");
        toast({
          title: "Ajouté aux favoris",
          description: `${product.name} a été ajouté à vos favoris.`,
        });
      }
      setIsWishlist(!isWishlist);
    } catch (error) {
      console.error("Erreur avec les favoris:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue avec les favoris",
        variant: "destructive",
      });
    }
  };

  // Fonction utilitaire pour obtenir l'URL d'une image
  const getImageUrl = (image: string | Blob | ProductImage | File): string => {
    if (typeof image === "string") {
      return image;
    }
    
    if (typeof image === "object" && image !== null && "url" in image) {
      return (image as ProductImage).url;
    }
    
    // Pour les Blob/File, on peut créer une URL temporaire si nécessaire
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    if (image instanceof Blob) {
      return URL.createObjectURL(image);
    }
    
    return "";
  };

  // Préparer les images en convertissant tout en strings
  const allImages = [
    product.image_url, 
    ...(product.images || []).map(getImageUrl)
  ].filter(Boolean);
  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <TheCornerPageHeader
        title={product.name}
        subtitle={product.description || ""}
        backLink="/the-corner"
        backText="The Corner"
        breadcrumbs={[
          { label: "The Corner", href: "/the-corner" },
          { label: product.name, href: `#` },
        ]}
        actions={[
          {
            icon: <span>♥</span>,
            onClick: handleToggleWishlist,
            label: "Favoris",
          },
          {
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
            ),
            onClick: handleShare,
            label: "Partager",
          },
        ]}
      />

      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            <TheCornerProductGallery
              images={allImages}
              productName={product.name}
              onImageSelect={setSelectedImageIndex}
              selectedImageIndex={selectedImageIndex}
            />
          </div>

          <div className="sticky top-8">
            <div className="space-y-8 md:px-4">
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50">
                <TheCornerProductInfo
                  name={product.name}
                  brand={product.brand || ""}
                  description={product.description || ""}
                  price={product.price}
                  oldPrice={product.old_price}
                  rating={product.rating}
                  reviewsCount={product.reviews_count}
                  sku={product.sku}
                  storeReference={product.store_reference}
                  tags={product.tags}
                  technicalSpecs={product.details?.map((detail) => {
                    const [label, ...valueParts] = detail.split(":");
                    return {
                      label: label.trim(),
                      value: valueParts.join(":").trim(),
                    };
                  })}
                />
              </div>

              <div className="space-y-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50">
                <TheCornerVariantSelector
                  variants={product.variants || []}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  onColorChange={setSelectedColor}
                  onSizeChange={setSelectedSize}
                />

                <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                <TheCornerProductActions
                  onAddToCart={handleAddToCart}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  variant={selectedVariant}
                  quantity={quantity}
                  isWishlist={isWishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onShare={handleShare}
                  productId={product.id}
                />

                <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                      Quantité
                    </h3>
                    {selectedVariant && (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {selectedVariant.stock} disponible
                        {selectedVariant.stock > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                      disabled={quantity <= 1}
                      className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>-</span>
                    </Button>
                    <span className="text-lg font-medium w-12 text-center text-zinc-900 dark:text-zinc-100">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={
                        selectedVariant && quantity >= selectedVariant.stock
                      }
                      className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>+</span>
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full py-6 text-lg bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 dark:from-zinc-100 dark:to-zinc-200 dark:hover:from-zinc-200 dark:hover:to-zinc-300 text-white dark:text-zinc-900 transition-all duration-300 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50"
                  onClick={handleAddToCart}
                  disabled={
                    !selectedSize ||
                    !selectedColor ||
                    !selectedVariant ||
                    selectedVariant.stock < quantity
                  }
                >
                  <span className="flex items-center justify-center gap-2">
                    Ajouter au panier
                  </span>
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={handleToggleWishlist}
                  >
                    <span>♥</span>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      Favoris
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    onClick={handleShare}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16,6 12,2 8,6" />
                      <line x1="12" x2="12" y1="2" y2="15" />
                    </svg>
                    <span className="text-zinc-900 dark:text-zinc-100">
                      Partager
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 space-y-12 sm:space-y-16">
          {/* Produits similaires */}
          <section>
            <h2 className="text-2xl font-bold mb-6 sm:mb-8">
              Produits similaires
            </h2>
            <TheCornerSimilarProducts
              products={similarProducts}
              currentProductId={String(product.id)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
