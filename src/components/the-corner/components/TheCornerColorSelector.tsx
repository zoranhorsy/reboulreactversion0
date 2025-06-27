import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getColorInfo, isWhiteColor } from "@/config/productColors";

interface TheCornerColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  getColorStock: (color: string) => number;
}

export function TheCornerColorSelector({
  colors,
  selectedColor,
  onColorChange,
  getColorStock,
}: TheCornerColorSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Couleur: {selectedColor}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const stock = getColorStock(color);
          return (
            <Button
              key={color}
              variant={selectedColor === color ? "default" : "outline"}
              onClick={() => onColorChange(color)}
              disabled={stock === 0}
              className={cn(
                "h-8 px-3 text-sm font-normal",
                stock === 0 && "opacity-50",
              )}
            >
              {color}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
