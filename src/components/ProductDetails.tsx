'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ProductGallery } from "@/components/ProductGallery"
import { RecommendedProducts } from "@/components/RecommendedProducts"
import { ColorSelector } from "@/components/ColorSelector"
import { Product } from '@/lib/api'
import { cn } from "@/lib/utils"

interface ProductDetailsProps {
    product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const [selectedVariantState, setSelectedVariantState] = useState<{ size: string; color: string }>(() => {
        const defaultVariant = product.variants[0];
        return { size: defaultVariant.size, color: defaultVariant.color };
    });
    const [selectedVariantStock, setSelectedVariantStock] = useState(0);
    const [showDescription, setShowDescription] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const newSelectedVariant = product.variants.find(
            v => v.size === selectedVariantState.size && v.color === selectedVariantState.color
        );
        setSelectedVariantStock(newSelectedVariant?.stock ?? 0);
    }, [selectedVariantState, product.variants]);

    const availableSizes = [...new Set(product.variants.map(v => v.size))]
    const availableColors = [...new Set(product.variants.map(v => v.color))]

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1400px] mx-auto">
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 text-xs tracking-widest uppercase"
                >
                    <span className="text-gray-500">REBOUL / {product.category} / {product.name}</span>
                </motion.nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProductGallery images={product.images} productName={product.name} />

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-8 p-4 lg:p-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-3xl font-light tracking-wider uppercase">{product.name}</h1>
                            <p className="text-2xl font-light">{product.price.toFixed(2)} €</p>
                        </div>

                        <ColorSelector
                            availableColors={availableColors}
                            selectedColor={selectedVariantState.color}
                            onColorChange={(color) => setSelectedVariantState(prev => ({ ...prev, color }))}
                        />

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs tracking-widest uppercase">SIZE: {selectedVariantState.size}</span>
                                <button
                                    className="text-xs underline tracking-widest uppercase transition-colors hover:text-gray-600"
                                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                                >
                                    SIZE GUIDE
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {availableSizes.map((size) => (
                                    <Button
                                        key={size}
                                        variant={selectedVariantState.size === size ? "default" : "outline"}
                                        className={cn(
                                            "w-full rounded-none border text-xs tracking-widest transition-all duration-300",
                                            selectedVariantState.size === size
                                                ? 'bg-black text-white hover:bg-black/90'
                                                : 'hover:bg-black hover:text-white'
                                        )}
                                        onClick={() => setSelectedVariantState(prev => ({ ...prev, size }))}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showSizeGuide && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-b py-4 overflow-hidden"
                                >
                                    <h3 className="text-sm font-medium mb-2 tracking-widest uppercase">Size Guide</h3>
                                    <table className="w-full text-xs">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="py-2 text-left">Size</th>
                                            <th className="py-2 text-left">Chest (cm)</th>
                                            <th className="py-2 text-left">Waist (cm)</th>
                                            <th className="py-2 text-left">Hips (cm)</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {product.sizeChart.map((size) => (
                                            <tr key={size.size} className="border-b">
                                                <td className="py-2">{size.size}</td>
                                                <td className="py-2">{size.chest}</td>
                                                <td className="py-2">{size.waist}</td>
                                                <td className="py-2">{size.hips}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center space-x-4">
                            <span className="text-xs tracking-widest uppercase">QUANTITY:</span>
                            <div className="flex items-center border border-black">
                                <button
                                    className="px-3 py-2 transition-colors hover:bg-gray-100"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="px-3 py-2 border-l border-r border-black min-w-[40px] text-center">{quantity}</span>
                                <button
                                    className="px-3 py-2 transition-colors hover:bg-gray-100"
                                    onClick={() => setQuantity(prev => Math.min(selectedVariantStock, prev + 1))}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 rounded-none bg-black hover:bg-black/90 text-white text-xs tracking-widest transition-all duration-300"
                            disabled={selectedVariantStock <= 0}
                        >
                            ADD TO CART
                        </Button>

                        <div className="text-xs tracking-widest uppercase">
                            {selectedVariantStock > 0 ? (
                                <span className="text-green-600">IN STOCK</span>
                            ) : (
                                <span className="text-red-600">OUT OF STOCK</span>
                            )}
                        </div>

                        <button
                            onClick={() => setShowDescription(!showDescription)}
                            className="flex items-center justify-between w-full py-4 border-t border-b transition-colors hover:bg-gray-50"
                        >
                            <span className="text-xs tracking-widest uppercase">PRODUCT DESCRIPTION</span>
                            {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <AnimatePresence>
                            {showDescription && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 text-sm leading-relaxed overflow-hidden"
                                >
                                    <p>{product.description}</p>
                                    <ul className="list-disc pl-4 space-y-2">
                                        <li>Brand: {product.brand}</li>
                                        <li>Category: {product.category}</li>
                                        <li>Composition: 100% cotton</li>
                                        <li>Made in Italy</li>
                                    </ul>
                                    <div className="pt-4">
                                        <h3 className="font-medium mb-2 text-xs tracking-widest uppercase">Care Instructions:</h3>
                                        <ul className="list-disc pl-4 space-y-2">
                                            <li>Machine wash at 30°C</li>
                                            <li>Do not tumble dry</li>
                                            <li>Iron at medium temperature</li>
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-16 p-4"
                >
                    <h2 className="text-xl font-light tracking-widest uppercase mb-8">YOU MAY ALSO LIKE</h2>
                    <RecommendedProducts currentProductId={product.id} category={product.category} />
                </motion.div>
            </div>
        </div>
    )
}

