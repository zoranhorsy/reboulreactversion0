'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Share, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProductGallery } from "@/components/ProductGallery"
import { ColorSelector } from "@/components/ColorSelector"
import { SizeSelector } from "@/components/SizeSelector"
import { ProductTags } from "@/components/ProductTags"
import { ProductReviews } from "@/components/ProductReviews"
import { SizeChart } from "@/components/SizeChart"
import { QuantitySelector } from '@/components/QuantitySelector'
import PropTypes from 'prop-types'

const formatPrice = (price) => {
  const numPrice = Number(price);
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

export function ProductDetails({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '')
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '')
  const [quantity, setQuantity] = useState(1)

  const availableSizes = [...new Set(product.variants.map(v => v.size))]
  const availableColors = [...new Set(product.variants.map(v => v.color))]

  // Calculate size stock
  const sizeStock = product.variants.reduce((acc, variant) => {
    if (!acc[variant.size]) {
      acc[variant.size] = 0;
    }
    acc[variant.size] += variant.stock || 0;
    return acc;
  }, {});

  const totalStock = Object.values(sizeStock).reduce((sum, stock) => sum + stock, 0);
  const maxStock = Math.max(...Object.values(sizeStock));
  const stockLevel = totalStock > 50 ? 'high' : totalStock > 20 ? 'medium' : 'low';

  const handleAddToCart = () => {
    onAddToCart(selectedColor, selectedSize, quantity)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProductGallery images={product.images} productName={product.name} />
        </motion.div>
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">{formatPrice(product.price)} €</p>
          <p className="text-gray-600">{product.description}</p>

          <div className="space-y-4">
            <ColorSelector
              availableColors={availableColors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            <SizeSelector
              availableSizes={availableSizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              sizeStock={sizeStock}
            />
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              max={maxStock}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Stock disponible</p>
            <Progress value={(totalStock / maxStock) * 100} className="w-full" />
            <p className={`text-sm ${
              stockLevel === 'high' ? 'text-green-600' :
              stockLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stockLevel === 'high' ? 'En stock' :
               stockLevel === 'medium' ? 'Stock limité' : 'Presque épuisé'}
            </p>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleAddToCart} className="flex-grow">
              Ajouter au panier
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
            </Button>
          </div>

          <ProductTags tags={product.tags} />
        </motion.div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Caractéristiques du produit</h2>
          {product.features && product.features.length > 0 ? (
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucune caractéristique spécifique n'est disponible pour ce produit.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <ProductReviews reviews={product.reviews || []} />
          <SizeChart sizeChart={product.sizeChart} />
        </CardContent>
      </Card>
    </div>
  )
}

ProductDetails.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        size: PropTypes.string,
        color: PropTypes.string,
        stock: PropTypes.number,
      })
    ).isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    reviews: PropTypes.array,
    sizeChart: PropTypes.object,
    features: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
}
