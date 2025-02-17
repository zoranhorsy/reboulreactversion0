import type React from "react"
import { Button } from "@/components/ui/button"
import { type Product, type Category, getImagePath } from "@/lib/api"
import Image from "next/image"
import { Edit, Trash2, ChevronUp, ChevronDown, ImageOff } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProductTableProps {
  filteredProducts: Product[]
  categories: Category[]
  sortConfig: { key: keyof Product; direction: "ascending" | "descending" } | null
  handleSort: (key: keyof Product) => void
  handleEditProduct: (product: Product) => void
  handleDeleteProduct: (id: string) => void
}

const ProductTable: React.FC<ProductTableProps> = ({
  filteredProducts,
  categories,
  sortConfig,
  handleSort,
  handleEditProduct,
  handleDeleteProduct,
}) => {
  console.log("Filtered Products:", filteredProducts)
  console.log("Categories:", categories)

  const renderVariants = (variants: Product['variants']) => {
    if (!variants || variants.length === 0) return "Aucun variant"
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="cursor-help underline decoration-dotted">
              {variants.length} variant(s)
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="text-sm">
                  {variant.color} - {variant.size} ({variant.stock} en stock)
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left p-2">Image</th>
          <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("name")}>
            Nom{" "}
            {sortConfig?.key === "name" &&
              (sortConfig.direction === "ascending" ? (
                <ChevronUp className="inline" />
              ) : (
                <ChevronDown className="inline" />
              ))}
          </th>
          <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("price")}>
            Prix{" "}
            {sortConfig?.key === "price" &&
              (sortConfig.direction === "ascending" ? (
                <ChevronUp className="inline" />
              ) : (
                <ChevronDown className="inline" />
              ))}
          </th>
          <th className="text-left p-2">Catégorie</th>
          <th className="text-left p-2">Marque</th>
          <th className="text-left p-2">Variants</th>
          <th className="text-left p-2">Type de magasin</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredProducts.map((product) => (
          <tr key={product.id} className="border-t">
            <td className="p-2">
              <div className="relative w-12 h-12">
                {product.images?.length > 0 ? (
                  <div className="relative w-12 h-12">
                    <Image
                      src={typeof product.images[0] === "string" ? getImagePath(product.images[0]) : "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="rounded-md object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.png"
                      }}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </td>
            <td className="p-2">{product.name}</td>
            <td className="p-2">
              {typeof product.price === "number"
                ? `${product.price.toFixed(2)} €`
                : typeof product.price === "string"
                  ? `${Number.parseFloat(product.price).toFixed(2)} €`
                  : "Prix non disponible"}
            </td>
            <td className="p-2">
              {categories.find((cat) => cat.id.toString() === product.category_id?.toString())?.name ||
                "Non catégorisé"}
            </td>
            <td className="p-2">{product.brand || "Non spécifié"}</td>
            <td className="p-2">
              {renderVariants(product.variants)}
            </td>
            <td className="p-2">{product.store_type || "N/A"}</td>
            <td className="p-2">
              <Button variant="ghost" onClick={() => handleEditProduct(product)}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </Button>
              <Button variant="ghost" onClick={() => handleDeleteProduct(product.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ProductTable

