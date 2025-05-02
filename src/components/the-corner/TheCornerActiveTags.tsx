import { XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Category } from "@/lib/types/category"

interface TheCornerActiveTagsProps {
  categories: Category[]
  activeFilters: {
    category_id?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    size?: string
    search?: string
  }
  onRemoveFilter: (key: string) => void
}

export function TheCornerActiveTags({
  categories,
  activeFilters,
  onRemoveFilter
}: TheCornerActiveTagsProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(price))
  }

  const getTagLabel = (key: string, value: string) => {
    switch (key) {
      case 'category_id':
        return `Catégorie: ${categories.find(c => c.id === Number(value))?.name || value}`
      case 'minPrice':
        return `Prix min: ${formatPrice(value)}`
      case 'maxPrice':
        return `Prix max: ${formatPrice(value)}`
      case 'color':
        return `Couleur: ${value}`
      case 'size':
        return `Taille: ${value}`
      case 'search':
        return `Recherche: ${value}`
      default:
        return value
    }
  }

  const tags = Object.entries(activeFilters)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => ({
      key,
      label: getTagLabel(key, value as string)
    }))

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {tags.map(({ key, label }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm"
          >
            <span>{label}</span>
            <button
              onClick={() => onRemoveFilter(key)}
              className="p-0.5 hover:bg-secondary rounded-full"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 