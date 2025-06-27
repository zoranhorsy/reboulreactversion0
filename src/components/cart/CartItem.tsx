import type React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CartItemProps {
  _id: string | number;
  name: string;
  price: number | string;
  quantity: number;
  image: string;
  variant: {
    size: string;
    color: string;
    stock: number;
  };
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  _id,
  name,
  price,
  quantity,
  image,
  variant,
  onRemove,
  onUpdateQuantity,
}) => {
  // Vérifier si la quantité atteint le stock maximum
  const isMaxStock = variant?.stock ? quantity >= variant.stock : false;

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-16 h-16">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-500">
          {typeof price === "number"
            ? `${price.toFixed(2)} €`
            : price
              ? `${price} €`
              : "Prix non disponible"}
        </p>
        <div className="flex items-center mt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <span className="mx-2">{quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateQuantity(quantity + 1)}
            disabled={isMaxStock}
            title={isMaxStock ? `Stock maximum (${variant?.stock})` : ""}
          >
            +
          </Button>
        </div>
        {variant?.size && variant?.color && (
          <p className="text-xs text-gray-500 mt-1">
            {variant.size}, {variant.color}
            <span className="ml-1">({variant.stock} en stock)</span>
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        Supprimer
      </Button>
    </div>
  );
};
