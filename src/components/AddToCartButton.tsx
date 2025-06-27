import React from "react";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function AddToCartButton({
  onClick,
  disabled = false,
  children = "Ajouter au panier",
  className = "",
}: AddToCartButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </Button>
  );
}
