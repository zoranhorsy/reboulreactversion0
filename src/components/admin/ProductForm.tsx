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
import { Loader2, Save, ImagePlus, AlertCircle, X, ImageIcon } from "lucide-react"
import { cn, convertToCloudinaryUrl } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadImages as cloudinaryUploadImages, CloudinaryUploadResult } from "@/lib/cloudinary"
import { getCloudinaryUrl } from "@/config/cloudinary"
import Image from "next/image"

const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White"]

// Interface pour les images du produit
interface ProductImage {
  url: string;
  publicId: string;
}

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
  // Fonction pour nettoyer les images du produit et les convertir en URLs
  const cleanProductImages = (productImages: any[] | undefined): string[] => {
    if (!productImages || !Array.isArray(productImages)) {
      console.log("Pas d'images à nettoyer");
      return [];
    }
    
    console.log("Images à nettoyer:", productImages);
    
    const cleanedImageUrls = productImages
      .map(img => {
        // Si c'est une chaîne de caractères (URL)
        if (typeof img === 'string') {
          console.log("Image de type string:", img);
          return img;
        }
        
        // Si c'est un objet ProductImage
        if (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string') {
          console.log("Image de type ProductImage, extraction de l'URL:", img.url);
          return img.url;
        }
        
        // Si c'est un autre type d'objet
        console.warn("Image de type non reconnu:", img);
        return null;
      })
      .filter(Boolean) as string[];
    
    console.log("URLs d'images nettoyées:", cleanedImageUrls);
    return cleanedImageUrls;
  };
  
  // Initialiser le formulaire avec les données du produit
  const initialImages = cleanProductImages(product?.images);
  console.log("Images initiales nettoyées:", initialImages);
  
  const [formData, setFormData] = useState<Product>({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    old_price: product?.old_price || 0,
    stock: product?.stock || 0,
    category_id: product?.category_id || '',
    category: product?.category || '',
    brand_id: product?.brand_id || '',
    brand: product?.brand || '',
    featured: product?.featured || false,
    active: product?.active !== undefined ? product.active : true,
    images: initialImages,
    variants: product?.variants || [],
    tags: product?.tags || [],
    sku: product?.sku || '',
    weight: product?.weight || 0,
    dimensions: product?.dimensions || '',
    material: product?.material || '',
    new: product?.new || false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [testImageDisplay, setTestImageDisplay] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

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
    value: string | number | boolean | (string | File | Blob | ProductImage)[] | Variant[]
  ) => {
    setFormData(prev => ({
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

  // Fonction pour nettoyer les images et s'assurer qu'elles sont au bon format
  const cleanImages = (images: any[]): ProductImage[] => {
    if (!images || !Array.isArray(images)) return [];
    
    return images.map(img => {
      // Si c'est déjà un objet ProductImage valide
      if (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string' && img.url.trim() !== '') {
        return {
          url: img.url,
          publicId: 'publicId' in img && typeof img.publicId === 'string' ? img.publicId : ''
        };
      }
      
      // Si c'est une chaîne (URL)
      if (typeof img === 'string' && img.trim() !== '') {
        return {
          url: img,
          publicId: ''
        };
      }
      
      // Si c'est un File ou Blob, on ne peut pas le convertir directement
      // Ces objets devraient être uploadés via handleImageUpload
      
      // Par défaut, retourner un objet vide qui sera filtré
      return {
        url: '',
        publicId: ''
      };
    }).filter(img => img.url && img.url.trim() !== '');
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      
      if (files.length === 0) {
        toast({
          title: "Attention",
          description: "Aucun fichier sélectionné pour l'upload.",
        });
        setIsUploading(false);
        return;
      }
      
      // Upload des images vers Cloudinary
      const results = await cloudinaryUploadImages(files);
      console.log("Résultats de l'upload:", results);
      
      // Filtrer les résultats valides
      const validResults = results.filter(r => r.url && typeof r.url === 'string' && r.url.trim() !== '');
      
      if (validResults.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucune image n'a pu être uploadée correctement.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }
      
      // Récupérer les images existantes
      const existingImages = formData.images || [];
      
      // Convertir les images existantes en URLs
      const existingImageUrls = existingImages.map(img => {
        if (typeof img === 'string') {
          return img;
        } else if (typeof img === 'object' && img !== null && 'url' in img) {
          return img.url;
        }
        return '';
      }).filter(url => url !== '');
      
      // Combiner les images existantes avec les nouvelles images
      const newImageUrls = validResults.map(r => r.url);
      const updatedImages = [...existingImageUrls, ...newImageUrls];
      
      // Mettre à jour le formulaire avec les nouvelles images
      // et s'assurer que image_url pointe vers la première image
      setFormData(prev => ({
        ...prev,
        images: updatedImages,
        image_url: updatedImages[0] // Utiliser la première image comme image_url
      }));
      
      setIsDirty(true);
      
      toast({
        title: "Succès",
        description: `${validResults.length} image(s) uploadée(s) avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload des images.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction utilitaire pour obtenir l'URL d'une image
  const getImageUrl = (image: string | File | Blob | ProductImage): string => {
    console.log("getImageUrl - Type d'image:", typeof image);
    console.log("getImageUrl - Image:", image);
    
    try {
      if (typeof image === 'string') {
        console.log("getImageUrl - C'est une chaîne:", image);
        return image;
      } else if (image instanceof File || image instanceof Blob) {
        console.log("getImageUrl - C'est un File ou Blob");
        return URL.createObjectURL(image);
      } else if (typeof image === 'object' && image !== null) {
        console.log("getImageUrl - C'est un objet");
        
        if ('url' in image && typeof image.url === 'string') {
          console.log("getImageUrl - L'objet a une propriété url:", image.url);
          return image.url;
        }
        
        // Essayer de trouver d'autres propriétés qui pourraient contenir une URL
        const possibleUrlProps = ['src', 'source', 'path', 'href'];
        for (const prop of possibleUrlProps) {
          if (prop in image && typeof (image as any)[prop] === 'string') {
            console.log(`getImageUrl - L'objet a une propriété ${prop}:`, (image as any)[prop]);
            return (image as any)[prop];
          }
        }
        
        console.log("getImageUrl - Aucune URL trouvée dans l'objet");
      }
    } catch (error) {
      console.error("getImageUrl - Erreur:", error);
    }
    
    console.log("getImageUrl - Retourne une chaîne vide");
    return '';
  };

  const handleRemoveImage = (index: number) => {
    if (!formData.images) return;
    
    console.log("Suppression de l'image à l'index:", index);
    console.log("Images avant suppression:", formData.images);
    
    // Vérifier que l'index est valide
    if (index < 0 || index >= formData.images.length) {
      console.error("Index d'image invalide:", index);
      return;
    }
    
    // Créer une copie du tableau d'images
    const updatedImages = [...formData.images];
    
    // Supprimer l'image à l'index spécifié
    updatedImages.splice(index, 1);
    
    console.log("Images après suppression:", updatedImages);
    
    // Mettre à jour le formData avec les images mises à jour
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
    
    setIsDirty(true);
    
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée avec succès.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Valider le formulaire
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Nettoyer les images avant de soumettre le formulaire
      // S'assurer que nous n'envoyons que des URLs d'images
      const cleanedImageUrls = cleanProductImages(formData.images);
      
      // Créer une copie du formulaire avec les images nettoyées
      const cleanedFormData = {
        ...formData,
        images: cleanedImageUrls
      };
      
      console.log("Formulaire nettoyé avant soumission:", cleanedFormData);
      
      // Soumettre le formulaire
      await onSubmit(cleanedFormData as Product);
      setIsDirty(false);
      toast({
        title: "Succès",
        description: `Le produit a été ${product ? 'mis à jour' : 'créé'} avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de la ${product ? 'mise à jour' : 'création'} du produit.`,
        variant: "destructive",
      });
    }
  };

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
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Images du produit</Label>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTestImageDisplay(!testImageDisplay)}
                className="text-xs"
              >
                {testImageDisplay ? "Affichage normal" : "Tester affichage direct"}
              </Button>
            )}
          </div>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Vous pouvez sélectionner plusieurs images à la fois
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
            
            {/* Affichage des images sélectionnées */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Images sélectionnées ({formData.images.length})</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => {
                    // Obtenir l'URL de l'image
                    const imgUrl = typeof img === 'string' 
                      ? img 
                      : (typeof img === 'object' && img !== null && 'url' in img && typeof img.url === 'string')
                        ? img.url
                        : '';
                        
                    console.log(`Image ${idx + 1} - URL:`, imgUrl);
                    
                    return (
                      <div key={idx} className="relative group">
                        <div className="aspect-square bg-muted rounded-md overflow-hidden border border-border">
                          {imgUrl ? (
                            <div 
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url('${imgUrl}')` }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-1 truncate">
                          Image {idx + 1}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

