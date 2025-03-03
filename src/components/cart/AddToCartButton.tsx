import React, { useRef, useEffect, useState } from "react"
import anime from "animejs/lib/anime.es.js"
import { Button } from "@/components/ui/button"
import { useCart, CartItem } from "@/app/contexts/CartContext"
import { ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AddToCartButtonProps {
  productId: string
  name: string
  price: number
  image: string
  disabled: boolean
  size?: string
  color?: string
  stock: number
}

export function AddToCartButton({ productId, name, price, image, disabled, size, color }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [state, setState] = useState({ isAdding: false, showParticles: false })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeline = anime.timeline({
      loop: true,
      duration: 3000,
    })

    timeline
      .add({
        targets: buttonRef.current,
        scale: [1, 1.05, 1],
        easing: "easeInOutQuad",
      })
      .add(
        {
          targets: shineRef.current,
          translateX: ["0%", "100%"],
          easing: "easeInOutSine",
          opacity: [0, 1, 0],
        },
        "-=2000",
      )
      .add(
        {
          targets: rippleRef.current,
          scale: [0, 1.5],
          opacity: [0.5, 0],
          easing: "easeOutExpo",
          duration: 900,
          loop: true,
        },
        "-=2000",
      )

    return () => {
      timeline.pause()
    }
  }, [])

  const handleAddToCart = async () => {
    if (disabled) return
    setState({ isAdding: true, showParticles: true })

    const newItem: CartItem = { 
        id: productId, 
        name, 
        price, 
        quantity: 1, 
        image, 
        variant: {
            size: size || '',
            color: color || ''
        }
    }
    addItem(newItem)

    toast({
      title: "Produit ajouté",
      description: `${name} ${size ? `(Taille: ${size})` : ""} ${color ? `(Couleur: ${color})` : ""} a été ajouté à votre panier.`,
    })

    anime({
      targets: particlesRef.current?.children,
      translateX: () => anime.random(-150, 150),
      translateY: () => anime.random(-150, 150),
      scale: [0.1, 1],
      opacity: {
        value: [1, 0],
        duration: 700,
        easing: "linear",
      },
      rotate: () => anime.random(-360, 360),
      easing: "easeOutExpo",
      duration: 1000,
      delay: anime.stagger(10),
    })

    const timeline = anime.timeline({
      duration: 1000,
      complete: () => setState({ isAdding: false, showParticles: false }),
    })

    timeline
      .add({
        targets: buttonRef.current,
        scale: [1, 0.95, 1],
        duration: 300,
        easing: "easeInOutQuad",
      })
      .add(
        {
          targets: buttonRef.current?.querySelector(".shopping-cart-icon"),
          rotate: 360,
          duration: 600,
          easing: "easeInOutCubic",
        },
        "-=200",
      )
      .add(
        {
          targets: textRef.current,
          opacity: [0, 1],
          translateY: [10, 0],
          easing: "easeOutExpo",
        },
        "-=800",
      )
  }

  return (
    <div className="relative overflow-visible">
      <Button
        ref={buttonRef}
        onClick={handleAddToCart}
        disabled={disabled || state.isAdding}
        className="w-full bg-primary text-white hover:bg-primary/90 relative rounded-md"
      >
        <ShoppingCart className="mr-2 h-4 w-4 shopping-cart-icon" />
        <span ref={textRef}>{state.isAdding ? "Ajouté !" : "Ajouter au panier"}</span>
        <div
          ref={shineRef}
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
          style={{ transform: "skew(-20deg)" }}
        />
        <div
          ref={rippleRef}
          className="absolute inset-0 bg-white rounded-full pointer-events-none"
          style={{ transform: "scale(0)" }}
        />
      </Button>
      <div
        ref={particlesRef}
        className={`absolute inset-0 pointer-events-none ${state.showParticles ? "opacity-100" : "opacity-0"}`}
      >
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-black"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

