import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  stock?: number;
  showLabel?: boolean;
  variant?: "default" | "compact";
}

export function StockIndicator({
  stock = 0,
  showLabel = true,
  variant = "default",
}: StockIndicatorProps) {
  // Déterminer le niveau de stock
  const getStockLevel = () => {
    if (stock === 0) return "none";
    if (stock <= 3) return "low";
    if (stock <= 10) return "medium";
    return "high";
  };

  const stockLevel = getStockLevel();

  // Message selon le niveau de stock
  const getStockMessage = () => {
    if (stockLevel === "none") return "Rupture de stock";
    if (stockLevel === "low") return `Plus que ${stock} en stock !`;
    if (stockLevel === "medium") return `${stock} disponibles`;
    return "En stock";
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center">
        <span
          className={cn(
            "w-2 h-2 rounded-full mr-1",
            stockLevel === "none" && "bg-red-500",
            stockLevel === "low" && "bg-orange-500",
            stockLevel === "medium" && "bg-yellow-400",
            stockLevel === "high" && "bg-green-500",
          )}
        />
        {showLabel && <span className="text-xs">{getStockMessage()}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {stockLevel === "none" ? (
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />
        ) : (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
        )}

        {showLabel && (
          <span
            className={cn(
              "text-sm font-medium",
              stockLevel === "none" && "text-red-500",
              stockLevel === "low" && "text-orange-500",
              stockLevel === "medium" && "text-yellow-600",
              stockLevel === "high" && "text-green-600",
            )}
          >
            {getStockMessage()}
          </span>
        )}
      </div>

      {variant === "default" && stockLevel !== "none" && (
        <div className="grid grid-cols-6 gap-1">
          {[...Array(6)].map((_, index) => {
            // Calculer combien de barres colorées en fonction du niveau de stock
            const filledBars =
              stockLevel === "low" ? 2 : stockLevel === "medium" ? 4 : 6;
            const isFilled = index < filledBars;

            return (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-sm transition-colors",
                  isFilled && stockLevel === "low" && "bg-orange-500",
                  isFilled && stockLevel === "medium" && "bg-yellow-500",
                  isFilled && stockLevel === "high" && "bg-green-500",
                  !isFilled && "bg-zinc-200 dark:bg-zinc-700",
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
