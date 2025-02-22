"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { Loader2, Save, ImagePlus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White"]

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  brands: Brand[]
  onSubmit: (product: Product) => void
  isSubmitting?: boolean
}

export function ProductForm({ 
  product, 
  categories, 
  brands, 
  onSubmit,
  isSubmitting = false 
}: ProductFormProps) {
  const defaultFormData = useCallback(() => {
    if (!product) return {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      brand_id: 0,
      images: [],
      variants: [],
      tags: [],
      details: [],
      store_type: 'adult' as "adult" | "kids" | "sneakers" | "cpcompany"
    }

    return {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      brand_id: product.brand_id,
      images: product.images,
      variants: product.variants,
      tags: product.tags,
      details: product.details,
      store_type: product.store_type
    }
  }, [product])

  const [formData, setFormData] = useState<Partial<Product>>(defaultFormData())
  const [isUploading, setIsUploading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setFormData(defaultFormData())
    }
  }, [product, defaultFormData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = "Le nom du produit est requis"
    }
    if (!formData.description?.trim()) {
      newErrors.description = "La description est requise"
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0"
    }
    if (!formData.category_id) {
      newErrors.category_id = "La catégorie est requise"
    }
    if (!formData.brand_id) {
      newErrors.brand_id = "La marque est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    field: keyof Product,
    value: string | number | boolean | (string | File | Blob)[] | Variant[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setIsDirty(true)
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs requis correctement.",
        variant: "destructive",
      })
      return
    }

    try {
      await onSubmit(formData as Product)
      setIsDirty(false)
      toast({
        title: "Succès",
        description: "Les modifications ont été enregistrées.",
      })
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-4">
      <div className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nom du produit</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              required 
              className={cn(
                "border-muted-foreground/20",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">Prix</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              required
              className={cn(
                "border-muted-foreground/20",
                errors.price && "border-red-500"
              )}
            />
            {errors.price && (
              <span className="text-xs text-red-500">{errors.price}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
            className={cn(
              "min-h-[100px] border-muted-foreground/20 resize-none",
              errors.description && "border-red-500"
            )}
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description}</span>
          )}
        </div>

        {/* Catégorie et Marque */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category_id" className="text-sm font-medium">Catégorie</Label>
            <Select
              value={formData.category_id?.toString() || ""}
              onValueChange={(value) => handleChange("category_id", Number(value))}
            >
              <SelectTrigger className={cn(
                "border-muted-foreground/20",
                errors.category_id && "border-red-500"
              )}>
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
            {errors.category_id && (
              <span className="text-xs text-red-500">{errors.category_id}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id" className="text-sm font-medium">Marque</Label>
            <Select
              value={formData.brand_id?.toString() || ""}
              onValueChange={(value) => handleChange("brand_id", Number(value))}
            >
              <SelectTrigger className={cn(
                "border-muted-foreground/20",
                errors.brand_id && "border-red-500"
              )}>
                <SelectValue placeholder="Sélectionner une marque" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand_id && (
              <span className="text-xs text-red-500">{errors.brand_id}</span>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Images du produit</Label>
          <div className="border border-dashed border-muted-foreground/20 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="images"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32",
                  "border-2 border-dashed rounded-lg cursor-pointer",
                  "hover:bg-muted/50 transition-colors",
                  "border-muted-foreground/20"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour ajouter des images
                  </p>
                </div>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    handleImageUpload(files)
                  }}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Upload en cours...</span>
              </div>
            )}
            <ImagePreview
              images={formData.images?.filter((img): img is string => typeof img === "string") || []}
              onRemove={handleRemoveImage}
            />
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Variants</Label>
          <div className="border border-dashed border-muted-foreground/20 rounded-lg p-4">
            <VariantManager
              variants={formData.variants || []}
              onChange={(newVariants) => handleChange("variants", newVariants)}
            />
          </div>
        </div>

        {/* Type de magasin */}
        <div className="space-y-2">
          <Label htmlFor="store_type" className="text-sm font-medium">Type de magasin</Label>
          <Select
            value={formData.store_type}
            onValueChange={(value) => handleChange("store_type", value as "adult" | "kids" | "sneakers" | "cpcompany")}
          >
            <SelectTrigger className="border-muted-foreground/20">
              <SelectValue placeholder="Sélectionner le type de magasin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adult">Adulte</SelectItem>
              <SelectItem value="kids">Enfant</SelectItem>
              <SelectItem value="sneakers">Sneakers</SelectItem>
              <SelectItem value="cpcompany">C.P COMPANY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange("featured", checked)}
            />
            <Label htmlFor="featured" className="text-sm font-medium">Produit en vedette</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Couleurs disponibles</Label>
            <div className="grid grid-cols-3 gap-4">
              {colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
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
                          currentColors.filter((c) => c !== color)
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="sticky bottom-0 flex items-center justify-between py-4 border-t bg-background">
        <div className="flex items-center text-sm text-muted-foreground">
          {isDirty && !isSubmitting && (
            <Alert variant="destructive" className="w-auto border-none p-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Modifications non enregistrées
              </AlertDescription>
            </Alert>
          )}
          {isSubmitting && (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </span>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading || !isDirty}
          className={cn(
            "transition-all duration-200",
            isDirty && !isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm

