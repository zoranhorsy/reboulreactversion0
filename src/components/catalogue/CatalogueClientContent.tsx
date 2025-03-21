'use client'

import { useEffect } from "react"
import { CatalogueContent } from "@/components/catalogue/CatalogueContent"
import { LocalStorageChecker } from "@/components/LocalStorageChecker"
import { CartProvider } from "@/app/contexts/CartContext"
import { AuthProvider } from "@/app/contexts/AuthContext"
import { FavoritesProvider } from "@/app/contexts/FavoritesContext"
import { Toaster } from "@/components/ui/toaster"
import type { Product } from "@/lib/types/product"
import type { Category } from "@/lib/types/category"
import type { Brand } from "@/lib/types/brand"

interface CatalogueClientContentProps {
  initialProducts: Product[]
  initialCategories: Category[]
  initialBrands: Brand[]
  total: number
}

export function CatalogueClientContent({
  initialProducts,
  initialCategories,
  initialBrands,
  total
}: CatalogueClientContentProps) {
  // Force hydration with useEffect to make sure context only runs in browser
  useEffect(() => {
    // This effect ensures context only runs client-side
  }, [])

  return (
    <div suppressHydrationWarning>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <LocalStorageChecker />
            <CatalogueContent
              initialProducts={initialProducts}
              initialCategories={initialCategories}
              initialBrands={initialBrands}
              total={total}
            />
            <Toaster />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </div>
  )
} 