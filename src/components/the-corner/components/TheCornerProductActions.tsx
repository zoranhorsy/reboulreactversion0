import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import BuyNowButton from "@/components/BuyNowButton";

type Variant = Product["variants"][0];

interface TheCornerProductActionsProps {
  onAddToCart: () => void;
  selectedColor: string;
  selectedSize: string;
  variant?: Variant;
  quantity: number;
  isWishlist: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
  productId?: string | number;
}

export function TheCornerProductActions({
  onAddToCart,
  selectedColor,
  selectedSize,
  variant,
  quantity,
  isWishlist,
  onToggleWishlist,
  onShare,
  productId,
}: TheCornerProductActionsProps) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onAddToCart}
        disabled={!selectedSize || !selectedColor || !variant}
        className="w-full h-14 text-base font-medium bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
      >
        <span>🛍️</span>
        Ajouter au panier
      </Button>

      {productId && (
        <BuyNowButton
          productId={productId}
          quantity={quantity}
          className="w-full h-14 text-base font-medium"
          label="Acheter maintenant"
          size="lg"
          variant="default"
        />
      )}

      {variant && variant.stock > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3">
            <span>📅</span>
            <div className="space-y-0.5">
              <p className="text-sm text-green-800 dark:text-green-400">
                <span className="font-medium">Livraison estimée</span>
              </p>
              <p className="text-sm text-green-700 dark:text-green-500">
                {new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                -{" "}
                {new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 font-medium"
          onClick={onToggleWishlist}
        >
          <span>♥</span>
          Favoris
        </Button>
        <Button
          variant="outline"
          className="h-12 font-medium"
          onClick={onShare}
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
          Partager
        </Button>
      </div>
    </div>
  );
}
