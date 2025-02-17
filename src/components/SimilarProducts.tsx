"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import PropTypes from "prop-types"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchProducts, Product } from "@/lib/api"

export function SimilarProducts({ currentProductId }: { currentProductId: string }) {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchProducts()
        console.log("API Response:", response)

        if (!response || !response.products || response.products.length === 0) {
          throw new Error("No products found")
        }
        const filteredProducts = response.products.filter((product) => product.id !== currentProductId)
        const shuffled = filteredProducts.sort(() => 0.5 - Math.random())
        setSimilarProducts(shuffled)
      } catch (error) {
        console.error("Error fetching similar products:", error)
        setError("Failed to load similar products. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [currentProductId])

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 3
      return newIndex < 0 ? Math.max(0, similarProducts.length - 3) : newIndex
    })
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 3
      return newIndex >= similarProducts.length ? 0 : newIndex
    })
  }

  if (isLoading) {
    return <div>Loading similar products...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (similarProducts.length === 0) {
    return <div>No similar products found.</div>
  }

  const visibleProducts = similarProducts.slice(currentIndex, currentIndex + 3)

  return (
    <div className="mt-16 relative">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs font-bold">02</span>
        <h2 className="text-sm font-bold">PRODUITS SIMILAIRES</h2>
        <div className="flex-grow h-px bg-black" />
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-gray-400 hover:text-gray-600 hover:bg-transparent"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-gray-400 hover:text-gray-600 hover:bg-transparent"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {visibleProducts.map((product) => (
          <Link key={product.id} href={`/produit/${product.id}`}>
            <Card className="rounded-lg overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-square relative">
                    <Image
                      src={Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                        ? product.images[0]
                        : "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover bg-gray-50"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-4 right-4 bg-black hover:bg-black/90 rounded-none w-8 h-8"
                  >
                    <Heart className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide">{product.brand || "BRAND"}</h3>
                    <p className="text-sm uppercase">{product.name}</p>
                    <div className="inline-block bg-black text-white px-3 py-1 text-sm">
                      {product.price.toFixed(0)}€
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

SimilarProducts.propTypes = {
  currentProductId: PropTypes.string.isRequired,
}

