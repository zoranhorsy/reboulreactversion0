import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SocialShare } from "@/components/SocialShare"

type Product = {
    id: number
    name: string
    brand: string
    category: string
    price: number
    image: string
    description: string
    tags?: string[]
    colors?: string[]
    stock: number
}

type ProductListProps = {
    products: Product[]
}

export function ProductList({ products }: ProductListProps) {
    return (
        <div className="space-y-6">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-card rounded-lg shadow-md"
                >
                    <div className="flex-shrink-0 w-32 h-32 relative">
                        <Image
                            src={product.image}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                        <p className="text-base font-bold mb-2">{product.price.toFixed(2)} €</p>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-muted-foreground">Couleurs:</span>
                            <div className="flex space-x-1">
                                {product.colors && product.colors.length > 0 ? (
                                    product.colors.map((color) => (
                                        <div
                                            key={color}
                                            className="w-3 h-3 rounded-full border border-gray-300"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">Non spécifié</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge variant={
                                product.stock > 10 ? 'default' :
                                    product.stock > 5 ? 'secondary' : 'destructive'
                            }>
                                {product.stock > 10 ? 'En stock' :
                                    product.stock > 5 ? 'Stock limité' :
                                        product.stock > 0 ? 'Dernières pièces' : 'Rupture de stock'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{product.stock} disponible{product.stock > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Link href={`/produit/${product.id}`} passHref>
                            <Button variant="default">Voir le produit</Button>
                        </Link>
                        <SocialShare url={`https://reboul-store.com/produit/${product.id}`} title={product.name} />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

