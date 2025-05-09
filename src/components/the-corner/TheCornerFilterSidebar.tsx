"use client"

import { useState, useCallback } from "react"
import { Category } from "@/lib/types/category"

interface TheCornerFilterSidebarProps {
  categories?: Category[]
  initialFilters?: {
    category_id?: string | number
    minPrice?: string | number
    maxPrice?: string | number
    color?: string
    size?: string
  }
  selectedCategory?: string
  selectedColor?: string
  selectedSize?: string
  minPrice?: string
  maxPrice?: string
  availableColors?: string[]
  availableSizes?: string[]
  onFilterChange: (key: string, value: string) => void
}

export function TheCornerFilterSidebar({
  categories = [],
  initialFilters = {},
  selectedCategory,
  selectedColor,
  selectedSize,
  minPrice,
  maxPrice,
  availableColors = ["Noir", "Blanc", "Bleu", "Rouge", "Vert"],
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
  onFilterChange,
}: TheCornerFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    colors: true,
    sizes: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Wrapper pour s'adapter à l'interface attendue
  const handleFilterChange = useCallback((filters: Record<string, string | number | null>) => {
    const key = Object.keys(filters)[0];
    onFilterChange(key, String(filters[key]));
  }, [onFilterChange]);

  return (
    <div className="space-y-6">
      {/* Catégories */}
      <div className="border-b pb-4">
        <button
          className="flex items-center justify-between w-full mb-2"
          onClick={() => toggleSection("categories")}
        >
          <h3 className="font-medium">Catégories</h3>
          <span className="text-sm">{expandedSections.categories ? "−" : "+"}</span>
        </button>
        {expandedSections.categories && categories && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange({ category_id: category.id })}
                className={`w-full text-left px-3 py-2 rounded-lg ${
                  selectedCategory === String(category.id)
                    ? "bg-black text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="border-b pb-4">
        <button
          className="flex items-center justify-between w-full mb-2"
          onClick={() => toggleSection("price")}
        >
          <h3 className="font-medium">Prix</h3>
          <span className="text-sm">{expandedSections.price ? "−" : "+"}</span>
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Min</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm">Max</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="1000"
              />
            </div>
          </div>
        )}
      </div>

      {/* Couleurs */}
      <div className="border-b pb-4">
        <button
          className="flex items-center justify-between w-full mb-2"
          onClick={() => toggleSection("colors")}
        >
          <h3 className="font-medium">Couleurs</h3>
          <span className="text-sm">{expandedSections.colors ? "−" : "+"}</span>
        </button>
        {expandedSections.colors && availableColors && availableColors.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => handleFilterChange({ color })}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  selectedColor === color
                    ? "bg-black text-white"
                    : "hover:border-black"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tailles */}
      <div className="pb-4">
        <button
          className="flex items-center justify-between w-full mb-2"
          onClick={() => toggleSection("sizes")}
        >
          <h3 className="font-medium">Tailles</h3>
          <span className="text-sm">{expandedSections.sizes ? "−" : "+"}</span>
        </button>
        {expandedSections.sizes && availableSizes && availableSizes.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleFilterChange({ size })}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  selectedSize === size
                    ? "bg-black text-white"
                    : "hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 