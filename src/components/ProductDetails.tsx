'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share, Plus, Minus, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductGallery } from "@/components/ProductGallery"
import { ColorSelector } from "@/components/ColorSelector"
import { SizeSelector } from "@/components/SizeSelector"
import { ProductTags } from "@/components/ProductTags"
import { ProductReviews } from "@/components/ProductReviews"
import { SizeChart } from "@/components/SizeChart"
import { ProductQuestions } from "@/components/ProductQuestions"
import { ProductFAQs } from "@/components/ProductFAQs"
import { Product } from '@/lib/api'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from "@/components/ui/use-toast"
import { useColorSelector } from '@/hooks/useColorSelector'
import { Label } from "@/components/ui/label"

interface ProductDetailsProps {
    product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const [selectedSize, setSelectedSize] = useState(() => product.variants[0]?.size || '')
    const [selectedVariantStock, setSelectedVariantStock] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [showDetails, setShowDetails] = useState(false)
    const { addItem } = useCart()
    const { toast } = useToast()

    const availableSizes = [...new Set(product.variants.map(v => v.size))]
    const availableColors = [...new Set(product.variants.map(v => v.color))]

    const {
        selectedColor,
        handleColorChange,
        getSelectedColorValue,
        getSelectedColorName,
    } = useColorSelector(availableColors[0], availableColors)

    const sizeStock = useMemo(() => {
        const stock: Record<string, number> = {};
        product.variants.forEach(variant => {
            if (variant.color === selectedColor) {
                stock[variant.size] = variant.stock;
            }
        });
        return stock;
    }, [product.variants, selectedColor]);

    useEffect(() => {
        const newSelectedVariant = product.variants.find(
            v => v.size === selectedSize && v.color === selectedColor
        )
        setSelectedVariantStock(newSelectedVariant?.stock ?? 0)
    }, [selectedSize, selectedColor, product.variants])

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images[0] || '/placeholder.png',
            color: selectedColor,
            size: selectedSize,
        })
        toast({
            title: "Ajouté au panier",
            description: `${quantity} x ${product.name} (${selectedColor}, ${selectedSize}) a été ajouté à votre panier.`,
        })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ProductGallery images={product.images} productName={product.name} />
                </motion.div>
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-2xl font-semibold text-primary mt-2">{product.price.toFixed(2)} €</p>
                    </motion.div>

                    <motion.p
                        className="text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        {product.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <Button
                            variant="ghost"
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center justify-between w-full"
                        >
                            <span>Détails du produit</span>
                            <motion.div
                                animate={{ rotate: showDetails ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </motion.div>
                        </Button>
                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="mt-2">
                                        <CardContent className="pt-4">
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Marque: {product.brand}</li>
                                                <li>Catégorie: {product.category}</li>
                                                <li>Type de magasin: {product.storeType}</li>
                                                <li>En vedette: {product.featured ? 'Oui' : 'Non'}</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        <h2 className="text-lg font-semibold mb-2">Tags</h2>
                        <ProductTags tags={product.tags} />
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                    >
                        <div>
                            <Label htmlFor="color-selector" className="text-sm font-medium mb-2 block">Couleur</Label>
                            <ColorSelector
                                availableColors={availableColors}
                                selectedColor={selectedColor}
                                onColorChange={handleColorChange}
                            />
                        </div>
                        <div>
                            <SizeSelector
                                availableSizes={availableSizes}
                                selectedSize={selectedSize}
                                onSizeChange={setSelectedSize}
                                sizeStock={sizeStock}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex items-center space-x-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                    >
                        <span className="text-sm font-medium">Quantité:</span>
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(prev => Math.min(selectedVariantStock, prev + 1))}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                    >
                        <Button
                            className="flex-1"
                            size="lg"
                            disabled={selectedVariantStock <= 0}
                            onClick={handleAddToCart}
                        >
                            Ajouter au panier
                        </Button>
                        <div className="flex space-x-4">
                            <Button variant="outline" size="icon">
                                <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Share className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.8 }}
                    >
                        {selectedVariantStock > 0 ? (
                            <span className="text-green-600">En stock</span>
                        ) : (
                            <span className="text-destructive">Rupture de stock</span>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2 }}
            >
                <ProductReviews reviews={product.reviews || []} />
                <SizeChart sizeChart={product.sizeChart} />
                <ProductQuestions questions={product.questions} />
                <ProductFAQs faqs={product.faqs} />
            </motion.div>
        </div>
    )
}

