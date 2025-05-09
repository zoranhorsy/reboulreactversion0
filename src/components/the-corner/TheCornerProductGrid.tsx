"use client"

import { Product } from "@/lib/types/product"
import { motion } from 'framer-motion'
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
// TODO: Envisager de remplacer framer-motion par des animations CSS pour réduire la taille du bundle
import { CornerProductCard } from "@/components/products/CornerProductCard"
import { useInView } from "react-intersection-observer"

interface TheCornerProductGridProps {
  products: Product[]
}

export function TheCornerProductGrid({ products }: TheCornerProductGridProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px"
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  }

  return (
    <motion.div 
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={item}
        >
          <CornerProductCard 
            product={product}
            viewMode="grid"
          />
        </motion.div>
      ))}
    </motion.div>
  )
} 