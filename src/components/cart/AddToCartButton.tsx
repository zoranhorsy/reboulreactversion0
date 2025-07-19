import React, { useRef, useEffect, useState, useCallback } from "react";
import anime from "animejs/lib/anime.es.js";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/app/contexts/CartContext";
import { toast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  disabled: boolean;
  size?: string;
  color?: string;
  stock: number;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  disabled,
  size,
  color,
  stock,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  // Détecter le store basé sur l'URL courante
  const getStoreType = (): "adult" | "sneakers" | "kids" | "the_corner" => {
    if (pathname.includes('/the-corner')) return 'the_corner';
    if (pathname.includes('/sneakers')) return 'sneakers';
    if (pathname.includes('/kids')) return 'kids';
    return 'adult'; // default pour Reboul
  };

  const handleAddToCart = useCallback(async () => {
    if (disabled || isAdding) return;
    setIsAdding(true);

    const newItem: CartItem = {
      id: productId,
      productId: productId, // Nouvelle propriété requise
      name,
      price,
      quantity: 1,
      image,
      storeType: getStoreType(), // Détection automatique du store
      variant: {
        size: size || "",
        color: color || "",
        colorLabel: color || "",
        stock: stock || 0,
      },
    };
    addItem(newItem);

    toast({
      title: "Produit ajouté",
      description: `${name} ${size ? `(Taille: ${size})` : ""} ${color ? `(Couleur: ${color})` : ""} a été ajouté à votre panier.`,
    });

    // Animation simple d'ajout au panier
    if (buttonRef.current && particlesRef.current) {
      anime
        .timeline({
          duration: 800,
          complete: () => setIsAdding(false),
        })
        .add({
          targets: buttonRef.current,
          scale: [1, 0.95, 1],
          duration: 400,
          easing: "easeInOutQuad",
        })
        .add(
          {
            targets: particlesRef.current.children,
            translateX: () => anime.random(-100, 100),
            translateY: () => anime.random(-100, 100),
            scale: [0.1, 1],
            opacity: [1, 0],
            easing: "easeOutExpo",
            duration: 600,
            delay: anime.stagger(10),
          },
          "-=200",
        );
    }
  }, [
    disabled,
    isAdding,
    addItem,
    name,
    productId,
    price,
    image,
    size,
    color,
    stock,
  ]);

  return (
    <div className="relative overflow-visible">
      <Button
        ref={buttonRef}
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className="w-full bg-primary hover:bg-primary/90 text-white relative rounded-md 
                  transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-95"
      >
        <span>🛒</span>
        <span ref={textRef}>{isAdding ? "Ajouté !" : "Ajouter au panier"}</span>
      </Button>
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/80"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
