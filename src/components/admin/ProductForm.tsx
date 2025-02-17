"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImagePreview } from "@/components/ImagePreview"
import { VariantManager } from "@/components/admin/VariantManager"
import { type Product } from "@/lib/types/product"
import { type Category } from "@/lib/types/category"
import { type Brand } from "@/lib/types/brand"
import { type Variant } from "@/lib/types/product"
import { api } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White"]

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  brands: Brand[]
  onSubmit: (product: Product) => void
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, categories, brands, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    category: "",
    category_id: product?.category_id || 0,
    brand: "",
    images: [],
    image: "/placeholder.png",
    variants: [],
    colors: [],
    store_type: "adult",
    featured: false,
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        category_id: product.category_id ? Number(product.category_id) : undefined,
      })
    }
  }, [product])

  const handleChange = (
    field: keyof Product,
    value: string | number | boolean | (string | File | Blob)[] | Variant[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = async (files: File[]) => {
    try {
      setIsUploading(true)
      const uploadedUrls = await api.uploadImages(files)
      const updatedImages = [...(formData.images || []), ...uploadedUrls] as (string | File | Blob)[]
      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }))
      toast({
        title: "Succès",
        description: `${files.length} image(s) uploadée(s) avec succès.`,
      })
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload des images.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    if (!formData.images) return
    const updatedImages = [...formData.images]
    updatedImages.splice(index, 1)
    handleChange("images", updatedImages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    onSubmit(formData as Product)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du produit</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="price">Prix</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category_id">Catégorie</Label>
          <Select
            value={formData.category_id?.toString() || ""}
            onValueChange={(value) => handleChange("category_id", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand">Marque</Label>
          <Select
            value={formData.brand || ""}
            onValueChange={(value) => handleChange("brand", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.name}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="images">Images du produit</Label>
        <div className="grid gap-4">
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              handleImageUpload(files)
            }}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Upload en cours...</span>
            </div>
          )}
          <ImagePreview
            images={formData.images?.filter((img): img is string => typeof img === "string") || []}
            onRemove={handleRemoveImage}
          />
        </div>
      </div>

      <div>
        <Label>Variants</Label>
        <VariantManager
          variants={formData.variants || []}
          onChange={(newVariants) => handleChange("variants", newVariants)}
        />
      </div>

      <div>
        <Label htmlFor="store_type">Type de magasin</Label>
        <Select
          value={formData.store_type}
          onValueChange={(value) => handleChange("store_type", value as "adult" | "kids" | "sneakers")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type de magasin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="adult">Adulte</SelectItem>
            <SelectItem value="kids">Enfant</SelectItem>
            <SelectItem value="sneakers">Sneakers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) => handleChange("featured", checked)}
        />
        <Label htmlFor="featured">Produit en vedette</Label>
      </div>

      <div>
        <Label>Couleurs</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center">
              <Checkbox
                id={`color-${color}`}
                checked={formData.colors?.includes(color) || false}
                onCheckedChange={(checked) => {
                  const currentColors = formData.colors || []
                  if (checked) {
                    handleChange("colors", [...currentColors, color])
                  } else {
                    handleChange(
                      "colors",
                      currentColors.filter((c) => c !== color),
                    )
                  }
                }}
              />
              <Label htmlFor={`color-${color}`} className="ml-2">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {product ? "Mettre à jour le produit" : "Ajouter le produit"}
      </Button>
    </form>
  )
}

export default ProductForm

